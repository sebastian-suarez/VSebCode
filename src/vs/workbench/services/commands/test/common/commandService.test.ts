/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import assert from 'assert';
import { DeferredPromise } from '../../../../../base/common/async.js';
import { DisposableStore } from '../../../../../base/common/lifecycle.js';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../../base/test/common/utils.js';
import { CommandsRegistry } from '../../../../../platform/commands/common/commands.js';
import { InstantiationService } from '../../../../../platform/instantiation/common/instantiationService.js';
import { NullLogService } from '../../../../../platform/log/common/log.js';
import { NullExtensionService } from '../../../extensions/common/extensions.js';
import { CommandService } from '../../common/commandService.js';
import { TestConfigurationService } from '../../../../../platform/configuration/test/common/testConfigurationService.js';
import { TestDialogService } from '../../../../../platform/dialogs/test/common/testDialogService.js';

suite('CommandService', function () {

	const store = ensureNoDisposablesAreLeakedInTestSuite();
	let nullConfigService: TestConfigurationService;

	setup(function () {
		nullConfigService = new TestConfigurationService();
		store.add(nullConfigService.onDidChangeConfigurationEmitter);
		store.add(CommandsRegistry.registerCommand('foo', function () { }));
	});

	test('filters gate activation and dispatch, reflect configuration changes, and confirm each requested run', async () => {
		const events: string[] = [];
		const dialogs = new TestDialogService();
		const service = store.add(new CommandService(store.add(new InstantiationService()), new class extends NullExtensionService {
			override activateByEvent(event: string): Promise<void> {
				events.push(event);
				return Promise.resolve();
			}
		}, new NullLogService(), nullConfigService, dialogs));
		store.add(CommandsRegistry.registerCommand('filtered', (_accessor, value: string) => { events.push(value); return value; }));
		store.add(service.onWillExecuteCommand(() => events.push('will')));
		store.add(service.onDidExecuteCommand(() => events.push('did')));
		await nullConfigService.setUserConfiguration('commands.filters', { filtered: 'off' });
		await assert.rejects(service.executeCommand('filtered', 'blocked'), /not authorized/);
		assert.deepStrictEqual(events, []);
		await nullConfigService.setUserConfiguration('commands.filters', { filtered: 'ask' });
		await assert.rejects(service.executeCommand('filtered', 'cancelled'), /not authorized/);
		assert.deepStrictEqual(events, []);
		dialogs.setConfirmResult({ confirmed: true });
		assert.strictEqual(await service.executeCommand('filtered', 'confirmed'), 'confirmed');
		assert.deepStrictEqual(events, ['onCommand:filtered', 'will', 'confirmed', 'did']);
		await assert.rejects(service.executeCommand('filtered'), /not authorized/);
		await nullConfigService.setUserConfiguration('commands.filters', { filtered: 'on' });
		assert.strictEqual(await service.executeCommand('filtered', 'allowed'), 'allowed');
	});

	test('default filter denies local terminals before attempting extension activation', async () => {
		const service = store.add(new CommandService(store.add(new InstantiationService()), new NullExtensionService(), new NullLogService(), nullConfigService, new TestDialogService()));
		await assert.rejects(service.executeCommand('workbench.action.terminal.newLocal'), /not authorized/);
	});

	test('pending confirmations respect later denial and disposal before activation', async () => {
		for (const dispose of [false, true]) {
			const confirmation = new DeferredPromise<{ confirmed: boolean }>();
			const events: string[] = [];
			const service = store.add(new CommandService(store.add(new InstantiationService()), new class extends NullExtensionService {
				override activateByEvent(event: string): Promise<void> { events.push(event); return Promise.resolve(); }
			}, new NullLogService(), nullConfigService, new class extends TestDialogService {
				override confirm() { return confirmation.p; }
			}));
			await nullConfigService.setUserConfiguration('commands.filters', { foo: 'ask' });
			const result = assert.rejects(service.executeCommand('foo'), /not authorized/);
			if (dispose) {
				service.dispose();
			} else {
				await nullConfigService.setUserConfiguration('commands.filters', { foo: 'off' });
			}
			await confirmation.complete({ confirmed: true });
			await result;
			assert.deepStrictEqual(events, []);
		}
	});

	test('activation waits respect newly denied or confirmation-required commands', async () => {
		for (const filter of ['off', 'ask']) {
			const activation = new DeferredPromise<void>();
			const started = new DeferredPromise<void>();
			const service = store.add(new CommandService(store.add(new InstantiationService()), new class extends NullExtensionService {
				override activateByEvent(): Promise<void> { started.complete(); return activation.p; }
			}, new NullLogService(), nullConfigService, new TestDialogService()));
			await nullConfigService.setUserConfiguration('commands.filters', { foo: 'on' });
			const result = assert.rejects(service.executeCommand('foo'), /not authorized/);
			await started.p;
			await nullConfigService.setUserConfiguration('commands.filters', { foo: filter });
			await activation.complete();
			await result;
		}
	});

	test('recognizes a command registered while its confirmation is open', async () => {
		const confirmation = new DeferredPromise<{ confirmed: boolean }>();
		const events: string[] = [];
		const service = store.add(new CommandService(store.add(new InstantiationService()), new class extends NullExtensionService {
			override activateByEvent(event: string): Promise<void> {
				events.push(event);
				return event === '*' ? Promise.reject(new Error('Unexpected wildcard activation')) : Promise.resolve();
			}
		}, new NullLogService(), nullConfigService, new class extends TestDialogService {
			override confirm() { return confirmation.p; }
		}));
		await nullConfigService.setUserConfiguration('commands.filters', { registeredDuringConfirmation: 'ask' });
		const execution = service.executeCommand('registeredDuringConfirmation');
		store.add(CommandsRegistry.registerCommand('registeredDuringConfirmation', () => 'ran'));
		await confirmation.complete({ confirmed: true });
		assert.deepStrictEqual({ result: await execution, events }, { result: 'ran', events: ['onCommand:registeredDuringConfirmation'] });
	});

	test('activateOnCommand', () => {

		let lastEvent: string;

		const service = store.add(new CommandService(new InstantiationService(), new class extends NullExtensionService {
			override activateByEvent(activationEvent: string): Promise<void> {
				lastEvent = activationEvent;
				return super.activateByEvent(activationEvent);
			}
		}, new NullLogService(), nullConfigService, new TestDialogService()));

		return service.executeCommand('foo').then(() => {
			assert.ok(lastEvent, 'onCommand:foo');
			return service.executeCommand('unknownCommandId');
		}).then(() => {
			assert.ok(false);
		}, () => {
			assert.ok(lastEvent, 'onCommand:unknownCommandId');
		});
	});

	test('fwd activation error', async function () {

		const extensionService = new class extends NullExtensionService {
			override activateByEvent(activationEvent: string): Promise<void> {
				return Promise.reject(new Error('bad_activate'));
			}
		};

		const service = store.add(new CommandService(new InstantiationService(), extensionService, new NullLogService(), nullConfigService, new TestDialogService()));

		await extensionService.whenInstalledExtensionsRegistered();

		return service.executeCommand('foo').then(() => assert.ok(false), err => {
			assert.strictEqual(err.message, 'bad_activate');
		});
	});

	test('!onReady, but executeCommand', function () {

		let callCounter = 0;
		const reg = CommandsRegistry.registerCommand('bar', () => callCounter += 1);

		const service = store.add(new CommandService(new InstantiationService(), new class extends NullExtensionService {
			override whenInstalledExtensionsRegistered() {
				return new Promise<boolean>(_resolve => { /*ignore*/ });
			}
		}, new NullLogService(), nullConfigService, new TestDialogService()));

		service.executeCommand('bar');
		assert.strictEqual(callCounter, 1);
		reg.dispose();
	});

	test('issue #34913: !onReady, unknown command', function () {

		let callCounter = 0;
		let resolveFunc: Function;
		const whenInstalledExtensionsRegistered = new Promise<boolean>(_resolve => { resolveFunc = _resolve; });

		const service = store.add(new CommandService(new InstantiationService(), new class extends NullExtensionService {
			override whenInstalledExtensionsRegistered() {
				return whenInstalledExtensionsRegistered;
			}
		}, new NullLogService(), nullConfigService, new TestDialogService()));

		const r = service.executeCommand('bar');
		assert.strictEqual(callCounter, 0);

		const reg = CommandsRegistry.registerCommand('bar', () => callCounter += 1);
		resolveFunc!(true);

		return r.then(() => {
			reg.dispose();
			assert.strictEqual(callCounter, 1);
		});
	});

	test('Stop waiting for * extensions to activate when trigger is satisfied #62457', function () {

		let callCounter = 0;
		const disposable = new DisposableStore();
		const events: string[] = [];
		const service = store.add(new CommandService(new InstantiationService(), new class extends NullExtensionService {

			override activateByEvent(event: string): Promise<void> {
				events.push(event);
				if (event === '*') {
					return new Promise(() => { }); //forever promise...
				}
				if (event.indexOf('onCommand:') === 0) {
					return new Promise(resolve => {
						setTimeout(() => {
							const reg = CommandsRegistry.registerCommand(event.substr('onCommand:'.length), () => {
								callCounter += 1;
							});
							disposable.add(reg);
							resolve();
						}, 0);
					});
				}
				return Promise.resolve();
			}

		}, new NullLogService(), nullConfigService, new TestDialogService()));

		return service.executeCommand('farboo').then(() => {
			assert.strictEqual(callCounter, 1);
			assert.deepStrictEqual(events.sort(), ['*', 'onCommand:farboo'].sort());
		}).finally(() => {
			disposable.dispose();
		});
	});

	test('issue #71471: wait for onCommand activation even if a command is registered', () => {
		const expectedOrder: string[] = ['registering command', 'resolving activation event', 'executing command'];
		const actualOrder: string[] = [];
		const disposables = new DisposableStore();
		const service = store.add(new CommandService(new InstantiationService(), new class extends NullExtensionService {

			override activateByEvent(event: string): Promise<void> {
				if (event === '*') {
					return new Promise(() => { }); //forever promise...
				}
				if (event.indexOf('onCommand:') === 0) {
					return new Promise(resolve => {
						setTimeout(() => {
							// Register the command after some time
							actualOrder.push('registering command');
							const reg = CommandsRegistry.registerCommand(event.substr('onCommand:'.length), () => {
								actualOrder.push('executing command');
							});
							disposables.add(reg);

							setTimeout(() => {
								// Resolve the activation event after some more time
								actualOrder.push('resolving activation event');
								resolve();
							}, 10);
						}, 10);
					});
				}
				return Promise.resolve();
			}

		}, new NullLogService(), nullConfigService, new TestDialogService()));

		return service.executeCommand('farboo2').then(() => {
			assert.deepStrictEqual(actualOrder, expectedOrder);
		}).finally(() => {
			disposables.dispose();
		});
	});

	test('issue #142155: execute commands synchronously if possible', async () => {
		const actualOrder: string[] = [];

		const disposables = new DisposableStore();
		disposables.add(CommandsRegistry.registerCommand(`bizBaz`, () => {
			actualOrder.push('executing command');
		}));
		const extensionService = new class extends NullExtensionService {
			override activationEventIsDone(_activationEvent: string): boolean {
				return true;
			}
		};
		const service = store.add(new CommandService(new InstantiationService(), extensionService, new NullLogService(), nullConfigService, new TestDialogService()));

		await extensionService.whenInstalledExtensionsRegistered();

		try {
			actualOrder.push(`before call`);
			const promise = service.executeCommand('bizBaz');
			actualOrder.push(`after call`);
			await promise;
			actualOrder.push(`resolved`);
			assert.deepStrictEqual(actualOrder, [
				'before call',
				'executing command',
				'after call',
				'resolved'
			]);
		} finally {
			disposables.dispose();
		}
	});
});
