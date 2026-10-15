/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { deepStrictEqual, strictEqual } from 'assert';
import { Action } from '../../../../../../base/common/actions.js';
import { timeout } from '../../../../../../base/common/async.js';
import { Emitter, Event } from '../../../../../../base/common/event.js';
import { DisposableStore, DisposableTracker, setDisposableTracker, toDisposable } from '../../../../../../base/common/lifecycle.js';
import { runWithFakedTimers } from '../../../../../../base/test/common/timeTravelScheduler.js';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../../../base/test/common/utils.js';
import { NoOpNotification, NotificationPriority, Severity, type INotification, type INotificationActions, type INotificationHandle, type INotificationProgress, type NotificationMessage } from '../../../../../../platform/notification/common/notification.js';
import { sanitizeOsc99MessageText, TerminalNotificationHandler, type IOsc99NotificationHost } from '../../browser/terminalNotificationHandler.js';

class TestNotificationProgress implements INotificationProgress {
	infinite(): void { }
	total(_value: number): void { }
	worked(_value: number): void { }
	done(): void { }
}

/**
 * Closes like the production notification view item, which only fires `onDidClose`, so the actions
 * stay owned by the handler; unlike it, the handle keeps its emitter after closing, so that a close
 * listener left subscribed stays countable.
 */
class TestNotificationHandle implements INotificationHandle {
	private readonly _onDidClose = new Emitter<void>();
	/**
	 * The close listeners currently subscribed
	 */
	closeListeners = 0;
	readonly onDidClose: Event<void> = (listener, thisArgs?, disposables?) => {
		this.closeListeners++;
		const subscription = this._onDidClose.event(listener, thisArgs);
		const counted = toDisposable(() => {
			this.closeListeners--;
			subscription.dispose();
		});
		if (disposables instanceof DisposableStore) {
			disposables.add(counted);
		} else if (Array.isArray(disposables)) {
			disposables.push(counted);
		}
		return counted;
	};
	readonly onDidChangeVisibility = Event.None;
	readonly progress = new TestNotificationProgress();
	closed = false;
	message: NotificationMessage;
	severity: Severity;
	actions?: INotificationActions;
	priority?: NotificationPriority;
	source?: string | { id: string; label: string };

	constructor(notification: INotification) {
		this.message = notification.message;
		this.severity = notification.severity;
		this.actions = notification.actions;
		this.priority = notification.priority;
		this.source = notification.source;
	}

	updateSeverity(severity: Severity): void {
		this.severity = severity;
	}

	updateMessage(message: NotificationMessage): void {
		this.message = message;
	}

	updateActions(actions?: INotificationActions): void {
		this.actions = actions;
	}

	close(): void {
		if (this.closed) {
			return;
		}
		this.closed = true;
		this._onDidClose.fire();
	}

	dispose(): void {
		this._onDidClose.dispose();
	}
}

class TestOsc99Host implements IOsc99NotificationHost {
	enabled = true;
	windowFocused = false;
	terminalVisible = false;
	writes: string[] = [];
	notifications: TestNotificationHandle[] = [];
	focusCalls = 0;
	updatedEnableNotifications: boolean[] = [];
	logMessages: string[] = [];

	isEnabled(): boolean {
		return this.enabled;
	}

	isWindowFocused(): boolean {
		return this.windowFocused;
	}

	isTerminalVisible(): boolean {
		return this.terminalVisible;
	}

	focusTerminal(): void {
		this.focusCalls++;
	}

	notify(notification: INotification): INotificationHandle {
		const handle = new TestNotificationHandle(notification);
		this.notifications.push(handle);
		return handle;
	}

	async updateEnableNotifications(value: boolean): Promise<void> {
		this.enabled = value;
		this.updatedEnableNotifications.push(value);
	}

	logWarn(message: string): void {
		this.logMessages.push(message);
	}

	writeToProcess(data: string): void {
		this.writes.push(data);
	}
}

suite('Terminal OSC 99 notifications', () => {
	const store = ensureNoDisposablesAreLeakedInTestSuite();

	let host: TestOsc99Host;
	let handler: TerminalNotificationHandler;

	setup(() => {
		host = new TestOsc99Host();
		handler = store.add(new TerminalNotificationHandler(host));
	});

	teardown(() => {
		for (const notification of host.notifications) {
			notification.close();
			notification.dispose();
		}
	});

	test('ignores notifications when disabled', () => {
		host.enabled = false;

		handler.handleSequence(';Hello');
		strictEqual(host.notifications.length, 0);
		strictEqual(host.writes.length, 0);
	});

	test('creates notification for title and body and updates', () => {
		handler.handleSequence('i=1:d=0:p=title;Hello');
		strictEqual(host.notifications.length, 0);

		handler.handleSequence('i=1:p=body;World');
		strictEqual(host.notifications.length, 1);
		strictEqual(host.notifications[0].message, 'Hello: World');
	});

	test('decodes base64 payloads', () => {
		handler.handleSequence('e=1:p=title;SGVsbG8=');
		strictEqual(host.notifications.length, 1);
		strictEqual(host.notifications[0].message, 'Hello');
	});

	test('sanitizes markdown links in payloads', () => {
		handler.handleSequence('i=link:d=0:p=title;Click [run](command:workbench.action.reloadWindow)');
		handler.handleSequence('i=link:p=body;See [docs](https://example.com)');
		strictEqual(host.notifications.length, 1);
		strictEqual(host.notifications[0].message, 'Click run: See docs');
	});

	test('sanitizes nested markdown links that would otherwise reassemble into a command link', () => {
		handler.handleSequence('i=nested:p=title;[[ ](http://z)Update available - click to install](command:workbench.action.terminal.sendSequence?%7B%22text%22%3A%22calc%5Cr%22%7D)');
		strictEqual(host.notifications.length, 1);
		strictEqual(host.notifications[0].message, ' Update available - click to install');
	});

	test('leaves no link in any short text and changes nothing where the repeated pattern would not', () => {
		const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/;
		const repeatedPattern = (text: string): string => {
			let sanitized = text;
			let previous: string;
			do {
				previous = sanitized;
				sanitized = sanitized.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');
			} while (sanitized !== previous);
			return sanitized;
		};
		const alphabet = ['[', ']', '(', ')', 'x'];
		const failures: { input: string; actual: string; reason: string }[] = [];
		const visit = (input: string, remaining: number): void => {
			const actual = sanitizeOsc99MessageText(input);
			if (linkPattern.test(actual)) {
				failures.push({ input, actual, reason: 'a link remains' });
			} else if (repeatedPattern(input) === input && actual !== input) {
				failures.push({ input, actual, reason: 'changed a text without links' });
			}
			if (remaining > 0) {
				for (const char of alphabet) {
					visit(input + char, remaining - 1);
				}
			}
		};
		visit('', 7);
		deepStrictEqual(failures, []);
	});

	test('keeps the labels of links and breaks the adjacency a removal creates', () => {
		deepStrictEqual([
			'Click [run](command:workbench.action.reloadWindow)',
			'[[ ](http://z)Update available - click to install](command:workbench.action.terminal.sendSequence?x)',
			'[[a](b)c](d)',
			'[a](b)[c](d)',
			'[a[b](c)](d)',
			'[](x) and [a]() and [a](b',
			'[[](x)](y)',
			'[x][(](y)z)',
		].map(text => sanitizeOsc99MessageText(text)), [
			'Click run',
			' Update available - click to install',
			'ac',
			'ac',
			'ab',
			'[](x) and [a]() and [a](b',
			'[] (y)',
			'[x] (z)',
		]);
	});

	test('sanitizes long payloads without repeated scans', () => {
		const count = 40000;
		deepStrictEqual({
			nested: sanitizeOsc99MessageText('['.repeat(count) + 'x' + '](x)'.repeat(count)),
			openLinks: sanitizeOsc99MessageText('[x]('.repeat(count)),
			openBrackets: sanitizeOsc99MessageText('['.repeat(count) + 'x'),
			chainedTargets: sanitizeOsc99MessageText('[x](y'.repeat(count) + ')'),
		}, {
			nested: 'x',
			openLinks: '[x]('.repeat(count),
			openBrackets: '['.repeat(count) + 'x',
			chainedTargets: 'x',
		});
	});

	test('caps the text accumulated across sequences', () => {
		handler.handleSequence('i=long:d=0:p=title;' + 't'.repeat(6000));
		handler.handleSequence('i=long:d=0:p=title;' + 't'.repeat(6000));
		handler.handleSequence('i=long:p=body;' + 'b'.repeat(12000));
		strictEqual(host.notifications.length, 1);
		strictEqual(host.notifications[0].message, 't'.repeat(10000) + ': ' + 'b'.repeat(10000));
	});

	test('caps the pending notifications and the id length and keeps surrogate pairs whole', () => {
		for (let i = 0; i <= 100; i++) {
			handler.handleSequence(`i=n${i}:d=0:p=title;Title ${i}`);
		}
		handler.handleSequence('i=n0:p=body;Body 0');
		handler.handleSequence('i=n100:p=body;Body 100');
		handler.handleSequence('i=' + 'a'.repeat(300) + ':d=0:p=title;Long id');
		handler.handleSequence('i=' + 'a'.repeat(256) + 'b:p=body;same notification');
		handler.handleSequence('p=title;' + 't'.repeat(9999) + '\u{1F600}');
		deepStrictEqual(host.notifications.map(notification => notification.message), [
			'Body 0',
			'Title 100: Body 100',
			'Long id: same notification',
			't'.repeat(9999),
		]);
	});

	test('sanitizes the message composed of a title and a body', () => {
		handler.handleSequence('i=split:d=0:p=title;[Update');
		handler.handleSequence('i=split:p=body;](command:workbench.action.reloadWindow)');
		strictEqual(host.notifications.length, 1);
		strictEqual(host.notifications[0].message, 'Update: ');
	});

	test('defers display until done', () => {
		handler.handleSequence('i=chunk:d=0:p=title;Hello ');
		strictEqual(host.notifications.length, 0);

		handler.handleSequence('i=chunk:d=1:p=title;World');
		strictEqual(host.notifications.length, 1);
		strictEqual(host.notifications[0].message, 'Hello World');
	});

	test('reports activation on button click', async () => {
		handler.handleSequence('i=btn:d=0:a=report:p=title;Hi');
		handler.handleSequence('i=btn:p=buttons;Yes');

		const actions = host.notifications[0].actions;
		if (!actions?.primary || actions.primary.length === 0) {
			throw new Error('Expected primary actions');
		}
		await actions.primary[0].run();
		strictEqual(host.writes[0], '\x1b]99;i=btn;1\x1b\\');
	});

	test('supports buttons before title and reports body activation', async () => {
		handler.handleSequence('i=btn:p=buttons;One\u2028Two');
		handler.handleSequence('i=btn:a=report;Buttons test');

		strictEqual(host.notifications.length, 1);
		const actions = host.notifications[0].actions;
		if (!actions?.primary || actions.primary.length !== 2) {
			throw new Error('Expected two primary actions');
		}
		strictEqual(actions.primary[0].label, 'One');
		strictEqual(actions.primary[1].label, 'Two');

		await actions.primary[1].run();
		strictEqual(host.writes[0], '\x1b]99;i=btn;2\x1b\\');
	});

	test('reports activation when notification closes without button action', () => {
		handler.handleSequence('i=btn:p=buttons;One\u2028Two');
		handler.handleSequence('i=btn:a=report;Buttons test');

		host.notifications[0].close();
		strictEqual(host.writes[0], '\x1b]99;i=btn;\x1b\\');
	});

	test('sends close report when requested', () => {
		handler.handleSequence('i=close:c=1:p=title;Bye');
		strictEqual(host.notifications.length, 1);
		host.notifications[0].close();
		strictEqual(host.writes[0], '\x1b]99;i=close:p=close;\x1b\\');
	});

	test('responds to query and alive', () => {
		handler.handleSequence('i=a:p=title;A');
		handler.handleSequence('i=b:p=title;B');
		handler.handleSequence('i=q:p=?;');
		handler.handleSequence('i=q:p=alive;');

		strictEqual(host.writes[0], '\x1b]99;i=q:p=?:a=report,focus:c=1:o=always,unfocused,invisible:p=title,body,buttons,close,alive,?:u=0,1,2:w=1;\x1b\\');
		strictEqual(host.writes[1], '\x1b]99;i=q:p=alive;a,b\x1b\\');
	});

	test('honors occasion for visibility and focus', () => {
		host.windowFocused = true;
		host.terminalVisible = true;
		handler.handleSequence('o=unfocused:p=title;Hidden');
		strictEqual(host.notifications.length, 0);

		host.windowFocused = false;
		host.terminalVisible = true;
		handler.handleSequence('o=invisible:p=title;Hidden');
		strictEqual(host.notifications.length, 0);

		host.terminalVisible = false;
		handler.handleSequence('o=invisible:p=title;Shown');
		strictEqual(host.notifications.length, 1);
	});

	test('closes notifications via close payload', () => {
		handler.handleSequence('i=closeme:p=title;Close');
		strictEqual(host.notifications.length, 1);
		strictEqual(host.notifications[0].closed, false);

		handler.handleSequence('i=closeme:p=close;');
		strictEqual(host.notifications[0].closed, true);
	});

	test('maps urgency to severity and priority', () => {
		handler.handleSequence('u=2:p=title;Urgent');
		strictEqual(host.notifications[0].severity, Severity.Warning);
		strictEqual(host.notifications[0].priority, NotificationPriority.URGENT);
	});

	test('releases a closed notification', () => {
		handler.handleSequence('i=rel:p=buttons;One');
		handler.handleSequence('i=rel;Hello');
		const notification = host.notifications[0];
		const listenersBeforeClose = notification.closeListeners;
		notification.close();
		deepStrictEqual({ listenersBeforeClose, listenersAfterClose: notification.closeListeners }, { listenersBeforeClose: 1, listenersAfterClose: 0 });
	});

	test('evicts the oldest active notification at the cap and forgets closed ones', () => {
		for (let i = 0; i < 150; i++) {
			handler.handleSequence(`p=title;Anonymous ${i}`);
		}
		for (const notification of host.notifications) {
			notification.close();
		}
		for (let i = 0; i < 100; i++) {
			handler.handleSequence(`i=k${i}:p=title;Keyed ${i}`);
		}
		const closedKeyed = () => host.notifications.slice(150).map((notification, i) => notification.closed ? `k${i}` : undefined).filter(id => id !== undefined);
		const closedBeforeOverflow = closedKeyed();
		handler.handleSequence('i=k100:p=title;Keyed 100');
		handler.handleSequence('i=q:p=alive;');
		deepStrictEqual({
			shown: host.notifications.length,
			closedBeforeOverflow,
			closedAfterOverflow: closedKeyed(),
			alive: host.writes[host.writes.length - 1],
		}, {
			shown: 251,
			closedBeforeOverflow: [],
			closedAfterOverflow: ['k0'],
			alive: '\x1b]99;i=q:p=alive;' + Array.from({ length: 100 }, (_, i) => `k${i + 1}`).join(',') + '\x1b\\',
		});
	});

	test('does not evict on an update at the cap and keeps one close listener', () => {
		for (let i = 0; i < 100; i++) {
			handler.handleSequence(`i=k${i}:p=title;Keyed ${i}`);
		}
		handler.handleSequence('i=k5:p=body;Updated');
		deepStrictEqual({
			shown: host.notifications.length,
			closed: host.notifications.filter(notification => notification.closed).length,
			message: host.notifications[5].message,
			closeListeners: host.notifications[5].closeListeners,
		}, { shown: 100, closed: 0, message: 'Updated', closeListeners: 1 });
	});

	test('sends the close report and no activation report for an evicted notification', () => {
		handler.handleSequence('i=first:c=1:a=report:p=title;First');
		for (let i = 0; i < 100; i++) {
			handler.handleSequence(`i=k${i}:p=title;Keyed ${i}`);
		}
		deepStrictEqual({
			closed: host.notifications[0].closed,
			writes: host.writes,
			focusCalls: host.focusCalls,
		}, { closed: true, writes: ['\x1b]99;i=first:p=close;\x1b\\'], focusCalls: 0 });
	});

	test('caps the buttons of a notification and reports their payload positions', async () => {
		// Empty labels make no buttons, so the eighth button is the tenth label
		const labels = Array.from({ length: 20 }, (_, i) => i === 0 || i === 2 ? '' : `b${i}`);
		handler.handleSequence('i=btn:a=report:p=buttons;' + labels.join('\u2028'));
		handler.handleSequence('i=btn;Many buttons');
		const actions = host.notifications[0].actions;
		await actions?.primary?.[7].run();
		deepStrictEqual({
			labels: actions?.primary?.map(action => action.label),
			writes: host.writes,
		}, {
			labels: ['b1', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9'],
			writes: ['\x1b]99;i=btn;10\x1b\\'],
		});
	});

	test('forgets a notification the user closed, so that it does not count toward the cap', () => {
		for (let i = 0; i < 100; i++) {
			handler.handleSequence(`i=k${i}:p=title;Keyed ${i}`);
		}
		host.notifications[50].close();
		handler.handleSequence('i=k100:p=title;Keyed 100');
		handler.handleSequence('i=q:p=alive;');
		deepStrictEqual({
			closed: host.notifications.map((notification, i) => notification.closed ? `k${i}` : undefined).filter(id => id !== undefined),
			alive: host.writes[host.writes.length - 1],
		}, {
			closed: ['k50'],
			alive: '\x1b]99;i=q:p=alive;' + Array.from({ length: 101 }, (_, i) => `k${i}`).filter(id => id !== 'k50').join(',') + '\x1b\\',
		});
	});

	test('releases evicted notifications whose close neither fires nor succeeds and still reports them', () => {
		class ThrowingCloseNotification extends NoOpNotification {
			constructor(private readonly _onClose: () => void) {
				super();
			}
			override close(): void {
				this._onClose();
				throw new Error('closing failed');
			}
		}
		const failing = new class extends TestOsc99Host {
			closeCalls = 0;
			private _shown = 0;
			override notify(_notification: INotification): INotificationHandle {
				// The first ten handles throw on close, the others never fire onDidClose
				return this._shown++ < 10 ? new ThrowingCloseNotification(() => this.closeCalls++) : new NoOpNotification();
			}
		}();
		const failingHandler = store.add(new TerminalNotificationHandler(failing));
		for (let i = 0; i < 150; i++) {
			failingHandler.handleSequence(`i=k${i}:c=1:p=title;Keyed ${i}`);
		}
		failingHandler.handleSequence('i=q:p=alive;');
		deepStrictEqual({
			closeCalls: failing.closeCalls,
			warnings: failing.logMessages.length,
			closeReports: failing.writes.slice(0, -1),
			alive: failing.writes[failing.writes.length - 1],
		}, {
			closeCalls: 10,
			warnings: 10,
			closeReports: Array.from({ length: 50 }, (_, i) => `\x1b]99;i=k${i}:p=close;\x1b\\`),
			alive: '\x1b]99;i=q:p=alive;' + Array.from({ length: 100 }, (_, i) => `k${i + 50}`).join(',') + '\x1b\\',
		});
	});

	test('disposes the auto-close timers with the handler and replaces the timer on an update', () => {
		return runWithFakedTimers({ useFakeTimers: true }, async () => {
			handler.handleSequence('i=t:w=1000:p=title;Timed');
			handler.handleSequence('i=t:w=5000:p=body;Later');
			await timeout(1500);
			const closedAfterFirstDelay = host.notifications[0].closed;
			await timeout(4000);
			const closedAfterSecondDelay = host.notifications[0].closed;
			handler.handleSequence('i=u:w=1000:p=title;Orphaned');
			handler.dispose();
			await timeout(2000);
			deepStrictEqual({
				closedAfterFirstDelay,
				closedAfterSecondDelay,
				orphanClosed: host.notifications[1].closed,
				orphanCloseListeners: host.notifications[1].closeListeners,
			}, { closedAfterFirstDelay: false, closedAfterSecondDelay: true, orphanClosed: false, orphanCloseListeners: 0 });
		});
	});
});

suite('Terminal OSC 99 notification ownership', () => {
	ensureNoDisposablesAreLeakedInTestSuite();

	test('keeps a constant number of live disposables across show, update and close cycles', () => {
		// The live count of the suite's tracker is not accessible, so the test installs its own
		// tracker for the handler's lifetime (the API ensureNoDisposablesAreLeakedInTestSuite uses)
		// and checks it for leaks itself; nothing disposable exists in the test before the swap
		const host = new TestOsc99Host();
		const tracker = new DisposableTracker();
		setDisposableTracker(tracker);
		try {
			const handler = new TerminalNotificationHandler(host);
			const liveWithHandler = tracker.getTrackedDisposables().length;
			for (let i = 0; i < 200; i++) {
				handler.handleSequence('i=cycle:w=60000:p=buttons;One\u2028Two');
				handler.handleSequence('i=cycle:p=title;Title');
				handler.handleSequence('i=cycle:p=body;Body');
				host.notifications[host.notifications.length - 1].close();
				handler.handleSequence('p=buttons;One');
				handler.handleSequence('w=60000;Anonymous');
				host.notifications[host.notifications.length - 1].close();
			}
			const liveAfterCycles = tracker.getTrackedDisposables();
			handler.dispose();
			for (const notification of host.notifications) {
				notification.dispose();
			}
			deepStrictEqual({
				shown: host.notifications.length,
				liveAfterCycles: liveAfterCycles.length - liveWithHandler,
				liveActionsAfterCycles: liveAfterCycles.filter(disposable => disposable instanceof Action).length,
				liveAfterDispose: tracker.getTrackedDisposables().length,
				leaks: tracker.computeLeakingDisposables()?.leaks.length ?? 0,
			}, { shown: 400, liveAfterCycles: 0, liveActionsAfterCycles: 0, liveAfterDispose: 0, leaks: 0 });
		} finally {
			setDisposableTracker(null);
		}
	});
});
