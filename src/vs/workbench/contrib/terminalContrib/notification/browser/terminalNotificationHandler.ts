/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Action, IAction } from '../../../../../base/common/actions.js';
import { disposableTimeout } from '../../../../../base/common/async.js';
import { decodeBase64 } from '../../../../../base/common/buffer.js';
import { Disposable, DisposableStore, MutableDisposable, type IDisposable } from '../../../../../base/common/lifecycle.js';
import { isHighSurrogate } from '../../../../../base/common/strings.js';
import { localize } from '../../../../../nls.js';
import { NotificationPriority, Severity, type INotification, type INotificationHandle } from '../../../../../platform/notification/common/notification.js';

/**
 * The longest title, body or button text an OSC 99 notification accumulates across sequences;
 * text beyond it is dropped. A process writing to the terminal could otherwise grow the pending
 * text without limit.
 */
const MAX_OSC99_TEXT_LENGTH = 10000;

/**
 * The longest notification id kept; longer ids are cut.
 */
const MAX_OSC99_ID_LENGTH = 256;

/**
 * The most notifications a terminal keeps pending at once; the oldest pending one is dropped when
 * another starts, so that a process cannot grow the pending state without limit either.
 */
const MAX_OSC99_PENDING_NOTIFICATIONS = 100;

/**
 * The most notifications a terminal keeps active (shown and not yet closed) at once, with or without
 * id; the oldest one is closed when another is shown, so that a process cannot grow the shown
 * notifications, and the state kept for them, without limit.
 */
const MAX_OSC99_ACTIVE_NOTIFICATIONS = 100;

/**
 * The most buttons a notification offers; further button labels are ignored. A buttons payload of
 * the maximum text length could otherwise define thousands of them.
 */
const MAX_OSC99_BUTTONS = 8;

/**
 * Removes markdown links `[label](target)` from a notification text in one pass over it and
 * guarantees that no parsable link remains: the result never contains `](`, which the pattern
 * `/\[([^\]]+)\]\(([^)]+)\)/` needs, unless the text had no link at all, in which case it is
 * returned unchanged. For the texts upstream's sanitizer handles, which replaces that pattern by
 * its label until nothing changes, the result is the same; for adversarial nestings it may keep a
 * bracket upstream would drop, with a space breaking the adjacency. Repeating a backtracking
 * regular expression over text written by a process is quadratic, and a few hundred kilobytes
 * stall the renderer for seconds, which is why the pattern is not used.
 */
export function sanitizeOsc99MessageText(text: string): string {
	const lastTargetEnd = text.lastIndexOf(')');
	if (lastTargetEnd === -1 || text.indexOf('](') === -1) {
		return text;
	}
	const chars = text.split('');
	// Positions of the `[` that may still start a link, oldest first (the pattern matches the
	// leftmost `[` whose label reaches a `](target)`), each with the count of characters removed
	// inside targets when it was seen, so that the surviving label length is known; a literal `]`
	// ends every open label
	const openBrackets: number[] = [];
	const removedAtOpen: number[] = [];
	let firstOpenBracket = 0;
	let removedInTargets = 0;
	let removedLinks = 0;
	for (let i = 0; i < chars.length; i++) {
		const char = chars[i];
		if (char === '[') {
			openBrackets.push(i);
			removedAtOpen.push(removedInTargets);
			continue;
		}
		if (char !== ']') {
			continue;
		}
		const labelStart = firstOpenBracket < openBrackets.length ? openBrackets[firstOpenBracket] : -1;
		const labelLength = labelStart === -1 ? 0 : i - labelStart - 1 - (removedInTargets - removedAtOpen[firstOpenBracket]);
		const targetEnd = labelLength > 0 && chars[i + 1] === '(' && lastTargetEnd > i + 1 ? text.indexOf(')', i + 2) : -1;
		if (targetEnd > i + 2) {
			// `[label](target)`: drop the `[` and everything from `]` to `)`, keep the label
			chars[labelStart] = '';
			firstOpenBracket++;
			for (let j = i; j <= targetEnd; j++) {
				chars[j] = '';
			}
			removedInTargets += targetEnd - i + 1;
			removedLinks++;
			i = targetEnd;
		} else {
			// A literal `]` cannot be part of a label, so no earlier `[` starts a link
			firstOpenBracket = openBrackets.length;
		}
	}
	const sanitized = chars.join('');
	// A removal can bring a literal `]` next to a `(`, which the repeated pattern would match in
	// a later pass; breaking the adjacency keeps the result free of links
	return removedLinks > 0 ? sanitized.replace(/\]\(/g, '] (') : sanitized;
}

const enum Osc99PayloadType {
	Title = 'title',
	Body = 'body',
	Buttons = 'buttons',
	Close = 'close',
	Query = '?',
	Alive = 'alive'
}

type Osc99Occasion = 'always' | 'unfocused' | 'invisible';
type Osc99CloseReason = 'button' | 'secondary' | 'auto' | 'protocol' | 'evicted';

interface IOsc99NotificationState {
	id: string | undefined;
	title: string;
	body: string;
	buttonsPayload: string;
	focusOnActivate: boolean;
	reportOnActivate: boolean;
	reportOnClose: boolean;
	urgency: number | undefined;
	autoCloseMs: number | undefined;
	occasion: Osc99Occasion | undefined;
}

interface IOsc99ActiveNotification {
	id: string | undefined;
	handle: INotificationHandle;
	/**
	 * Owns the close listener, the action store and the auto-close timer; disposed when the
	 * notification is released
	 */
	readonly store: DisposableStore;
	/**
	 * The actions currently shown; an update replaces them and disposes the previous ones
	 */
	readonly actionStore: MutableDisposable<DisposableStore>;
	readonly autoClose: MutableDisposable<IDisposable>;
	reportOnActivate: boolean;
	reportOnClose: boolean;
	focusOnActivate: boolean;
	closeReason: Osc99CloseReason | undefined;
}

export interface IOsc99NotificationHost {
	isEnabled(): boolean;
	isWindowFocused(): boolean;
	isTerminalVisible(): boolean;
	focusTerminal(): void;
	notify(notification: INotification): INotificationHandle;
	updateEnableNotifications(value: boolean): Promise<void>;
	logWarn(message: string): void;
	writeToProcess(data: string): void;
}

export class TerminalNotificationHandler extends Disposable {
	private readonly _osc99PendingNotifications = new Map<string, IOsc99NotificationState>();
	private _osc99PendingAnonymous: IOsc99NotificationState | undefined;
	/**
	 * The shown notifications that have not closed yet, oldest first; eviction takes the first one
	 */
	private readonly _osc99ActiveNotifications = new Set<IOsc99ActiveNotification>();
	/**
	 * The active notifications that have an id, for updates and the protocol responses
	 */
	private readonly _osc99ActiveNotificationsById = new Map<string, IOsc99ActiveNotification>();

	constructor(
		private readonly _host: IOsc99NotificationHost
	) {
		super();
	}

	override dispose(): void {
		// The notifications stay open; only what the handler owns for them is released
		for (const active of this._osc99ActiveNotifications) {
			active.store.dispose();
		}
		this._osc99ActiveNotifications.clear();
		this._osc99ActiveNotificationsById.clear();
		super.dispose();
	}

	handleSequence(data: string): boolean {
		const { metadata, payload } = this._splitOsc99Data(data);
		const metadataEntries = this._parseOsc99Metadata(metadata);
		const payloadTypes = metadataEntries.get('p');
		const rawPayloadType = payloadTypes && payloadTypes.length > 0 ? payloadTypes[payloadTypes.length - 1] : undefined;
		const payloadType = rawPayloadType && rawPayloadType.length > 0 ? rawPayloadType : Osc99PayloadType.Title;
		const id = this._sanitizeOsc99Id(metadataEntries.get('i')?.[0]);

		if (!this._host.isEnabled()) {
			return true;
		}

		switch (payloadType) {
			case Osc99PayloadType.Query:
				this._sendOsc99QueryResponse(id);
				return true;
			case Osc99PayloadType.Alive:
				this._sendOsc99AliveResponse(id);
				return true;
			case Osc99PayloadType.Close:
				this._closeOsc99Notification(id);
				return true;
		}

		const state = this._getOrCreateOsc99State(id);
		this._updateOsc99StateFromMetadata(state, metadataEntries);

		const isEncoded = metadataEntries.get('e')?.[0] === '1';
		const payloadText = this._decodeOsc99Payload(payload, isEncoded);
		const isDone = metadataEntries.get('d')?.[0] !== '0';

		switch (payloadType) {
			case Osc99PayloadType.Title:
				state.title = this._appendOsc99Text(state.title, payloadText);
				break;
			case Osc99PayloadType.Body:
				state.body = this._appendOsc99Text(state.body, payloadText);
				break;
			case Osc99PayloadType.Buttons:
				state.buttonsPayload = this._appendOsc99Text(state.buttonsPayload, payloadText);
				break;
			default:
				return true;
		}

		if (!isDone) {
			return true;
		}
		if (!this._shouldHonorOsc99Occasion(state.occasion)) {
			this._clearOsc99PendingState(id);
			return true;
		}

		if (this._showOsc99Notification(state)) {
			this._clearOsc99PendingState(id);
		}
		return true;
	}

	private _splitOsc99Data(data: string): { metadata: string; payload: string } {
		const separatorIndex = data.indexOf(';');
		if (separatorIndex === -1) {
			return { metadata: data, payload: '' };
		}
		return {
			metadata: data.substring(0, separatorIndex),
			payload: data.substring(separatorIndex + 1)
		};
	}

	private _parseOsc99Metadata(metadata: string): Map<string, string[]> {
		const result = new Map<string, string[]>();
		if (!metadata) {
			return result;
		}
		for (const entry of metadata.split(':')) {
			if (!entry) {
				continue;
			}
			const separatorIndex = entry.indexOf('=');
			if (separatorIndex === -1) {
				continue;
			}
			const key = entry.substring(0, separatorIndex);
			const value = entry.substring(separatorIndex + 1);
			if (!key) {
				continue;
			}
			let values = result.get(key);
			if (!values) {
				values = [];
				result.set(key, values);
			}
			values.push(value);
		}
		return result;
	}

	private _decodeOsc99Payload(payload: string, isEncoded: boolean): string {
		if (!isEncoded) {
			return payload;
		}
		try {
			return decodeBase64(payload).toString();
		} catch {
			this._host.logWarn('Failed to decode OSC 99 payload');
			return '';
		}
	}

	private _sanitizeOsc99Id(rawId: string | undefined): string | undefined {
		if (!rawId) {
			return undefined;
		}
		const sanitized = rawId.replace(/[^a-zA-Z0-9_\-+.]/g, '').slice(0, MAX_OSC99_ID_LENGTH);
		return sanitized.length > 0 ? sanitized : undefined;
	}

	private _appendOsc99Text(current: string, addition: string): string {
		const remaining = MAX_OSC99_TEXT_LENGTH - current.length;
		if (remaining <= 0) {
			return current;
		}
		let kept = addition.slice(0, remaining);
		// The cut must not split a surrogate pair
		if (kept.length < addition.length && isHighSurrogate(kept.charCodeAt(kept.length - 1))) {
			kept = kept.slice(0, -1);
		}
		return current + kept;
	}

	private _getOrCreateOsc99State(id: string | undefined): IOsc99NotificationState {
		if (!id) {
			if (!this._osc99PendingAnonymous) {
				this._osc99PendingAnonymous = this._createOsc99State(undefined);
			}
			return this._osc99PendingAnonymous;
		}
		let state = this._osc99PendingNotifications.get(id);
		if (!state) {
			if (this._osc99PendingNotifications.size >= MAX_OSC99_PENDING_NOTIFICATIONS) {
				const oldest = this._osc99PendingNotifications.keys().next().value;
				if (oldest !== undefined) {
					this._osc99PendingNotifications.delete(oldest);
				}
			}
			state = this._createOsc99State(id);
			this._osc99PendingNotifications.set(id, state);
		}
		return state;
	}

	private _createOsc99State(id: string | undefined): IOsc99NotificationState {
		return {
			id,
			title: '',
			body: '',
			buttonsPayload: '',
			focusOnActivate: true,
			reportOnActivate: false,
			reportOnClose: false,
			urgency: undefined,
			autoCloseMs: undefined,
			occasion: undefined
		};
	}

	private _clearOsc99PendingState(id: string | undefined): void {
		if (!id) {
			this._osc99PendingAnonymous = undefined;
			return;
		}
		this._osc99PendingNotifications.delete(id);
	}

	private _updateOsc99StateFromMetadata(state: IOsc99NotificationState, metadataEntries: Map<string, string[]>): void {
		const actionValues = metadataEntries.get('a');
		const actionValue = actionValues && actionValues.length > 0 ? actionValues[actionValues.length - 1] : undefined;
		if (actionValue !== undefined) {
			const actions = this._parseOsc99Actions(actionValue);
			state.focusOnActivate = actions.focusOnActivate;
			state.reportOnActivate = actions.reportOnActivate;
		}
		const closeValues = metadataEntries.get('c');
		const closeValue = closeValues && closeValues.length > 0 ? closeValues[closeValues.length - 1] : undefined;
		if (closeValue !== undefined) {
			state.reportOnClose = closeValue === '1';
		}
		const urgencyValues = metadataEntries.get('u');
		const urgencyValue = urgencyValues && urgencyValues.length > 0 ? urgencyValues[urgencyValues.length - 1] : undefined;
		if (urgencyValue !== undefined) {
			const urgency = Number.parseInt(urgencyValue, 10);
			if (!Number.isNaN(urgency)) {
				state.urgency = urgency;
			}
		}
		const autoCloseValues = metadataEntries.get('w');
		const autoCloseValue = autoCloseValues && autoCloseValues.length > 0 ? autoCloseValues[autoCloseValues.length - 1] : undefined;
		if (autoCloseValue !== undefined) {
			const autoClose = Number.parseInt(autoCloseValue, 10);
			if (!Number.isNaN(autoClose)) {
				state.autoCloseMs = autoClose;
			}
		}
		const occasionValues = metadataEntries.get('o');
		const occasionValue = occasionValues && occasionValues.length > 0 ? occasionValues[occasionValues.length - 1] : undefined;
		if (occasionValue === 'always' || occasionValue === 'unfocused' || occasionValue === 'invisible') {
			state.occasion = occasionValue;
		}
	}

	private _parseOsc99Actions(value: string): { focusOnActivate: boolean; reportOnActivate: boolean } {
		let focusOnActivate = true;
		let reportOnActivate = false;
		for (const token of value.split(',')) {
			switch (token) {
				case 'focus':
					focusOnActivate = true;
					break;
				case '-focus':
					focusOnActivate = false;
					break;
				case 'report':
					reportOnActivate = true;
					break;
				case '-report':
					reportOnActivate = false;
					break;
			}
		}
		return { focusOnActivate, reportOnActivate };
	}

	private _shouldHonorOsc99Occasion(occasion: Osc99Occasion | undefined): boolean {
		if (!occasion || occasion === 'always') {
			return true;
		}
		const windowFocused = this._host.isWindowFocused();
		switch (occasion) {
			case 'unfocused':
				return !windowFocused;
			case 'invisible':
				return !windowFocused && !this._host.isTerminalVisible();
			default:
				return true;
		}
	}

	private _showOsc99Notification(state: IOsc99NotificationState): boolean {
		const message = this._getOsc99NotificationMessage(state);
		if (!message) {
			return false;
		}

		const severity = state.urgency === 2 ? Severity.Warning : Severity.Info;
		const priority = this._getOsc99NotificationPriority(state.urgency);
		const source = {
			id: 'terminal',
			label: localize('terminalNotificationSource', 'Terminal')
		};
		const buttons = state.buttonsPayload.length > 0 ? state.buttonsPayload.split('\u2028') : [];
		// Owned by the active notification below, which disposes it when the actions are replaced or
		// the notification is released
		const actionStore = new DisposableStore();

		const activeRef: { current: IOsc99ActiveNotification | undefined } = { current: undefined };
		const reportActivation = (buttonIndex?: number, forceFocus?: boolean) => {
			if (forceFocus || state.focusOnActivate) {
				this._host.focusTerminal();
			}
			if (state.reportOnActivate) {
				this._sendOsc99ActivationReport(state.id, buttonIndex);
			}
		};

		const primaryActions: IAction[] = [];
		for (let i = 0; i < buttons.length && primaryActions.length < MAX_OSC99_BUTTONS; i++) {
			const label = buttons[i];
			if (!label) {
				continue;
			}
			const action = actionStore.add(new Action(`terminal.osc99.button.${i}`, label, undefined, true, () => {
				if (activeRef.current) {
					activeRef.current.closeReason = 'button';
				}
				reportActivation(i + 1);
				activeRef.current?.handle.close();
			}));
			primaryActions.push(action);
		}

		const secondaryActions: IAction[] = [];
		secondaryActions.push(actionStore.add(new Action(
			'terminal.osc99.dismiss',
			localize('terminalNotificationDismiss', 'Dismiss'),
			undefined,
			true,
			() => {
				if (activeRef.current) {
					activeRef.current.closeReason = 'secondary';
				}
				activeRef.current?.handle.close();
			}
		)));
		secondaryActions.push(actionStore.add(new Action(
			'terminal.osc99.disable',
			localize('terminalNotificationDisable', 'Disable Terminal Notifications'),
			undefined,
			true,
			async () => {
				await this._host.updateEnableNotifications(false);
				if (activeRef.current) {
					activeRef.current.closeReason = 'secondary';
				}
				activeRef.current?.handle.close();
			}
		)));

		const actions = { primary: primaryActions, secondary: secondaryActions };

		if (state.id) {
			const existing = this._osc99ActiveNotificationsById.get(state.id);
			if (existing) {
				activeRef.current = existing;
				existing.handle.updateMessage(message);
				existing.handle.updateSeverity(severity);
				existing.handle.updateActions(actions);
				existing.actionStore.value = actionStore;
				existing.focusOnActivate = state.focusOnActivate;
				existing.reportOnActivate = state.reportOnActivate;
				existing.reportOnClose = state.reportOnClose;
				existing.autoClose.value = this._scheduleOsc99AutoClose(existing, state.autoCloseMs);
				return true;
			}
		}

		this._evictOsc99NotificationsForNew();

		const store = new DisposableStore();
		const handle = this._host.notify({
			id: state.id ? `terminal.osc99.${state.id}` : undefined,
			severity,
			message,
			source,
			actions,
			priority
		});
		const active: IOsc99ActiveNotification = {
			id: state.id,
			handle,
			store,
			actionStore: store.add(new MutableDisposable<DisposableStore>()),
			autoClose: store.add(new MutableDisposable<IDisposable>()),
			reportOnActivate: state.reportOnActivate,
			reportOnClose: state.reportOnClose,
			focusOnActivate: state.focusOnActivate,
			closeReason: undefined
		};
		activeRef.current = active;
		active.actionStore.value = actionStore;
		store.add(handle.onDidClose(() => {
			if (active.reportOnActivate && active.closeReason === undefined) {
				if (active.focusOnActivate) {
					this._host.focusTerminal();
				}
				this._sendOsc99ActivationReport(active.id);
			}
			if (active.reportOnClose) {
				this._sendOsc99CloseReport(active.id);
			}
			this._releaseOsc99Notification(active);
		}));
		this._osc99ActiveNotifications.add(active);
		if (active.id) {
			this._osc99ActiveNotificationsById.set(active.id, active);
		}
		active.autoClose.value = this._scheduleOsc99AutoClose(active, state.autoCloseMs);
		return true;
	}

	/**
	 * Closes the oldest active notifications until another one fits under the cap. The close
	 * listener of each one sends its close report, if requested, and releases it; a handle that
	 * does not fire synchronously is released here.
	 */
	private _evictOsc99NotificationsForNew(): void {
		while (this._osc99ActiveNotifications.size >= MAX_OSC99_ACTIVE_NOTIFICATIONS) {
			const oldest: IOsc99ActiveNotification | undefined = this._osc99ActiveNotifications.values().next().value;
			if (!oldest) {
				break;
			}
			oldest.closeReason = 'evicted';
			oldest.handle.close();
			this._releaseOsc99Notification(oldest);
		}
	}

	/**
	 * Forgets an active notification and disposes what the handler owns for it; releasing it again
	 * does nothing.
	 */
	private _releaseOsc99Notification(active: IOsc99ActiveNotification): void {
		if (!this._osc99ActiveNotifications.delete(active)) {
			return;
		}
		if (active.id && this._osc99ActiveNotificationsById.get(active.id) === active) {
			this._osc99ActiveNotificationsById.delete(active.id);
		}
		active.store.dispose();
	}

	private _getOsc99NotificationMessage(state: IOsc99NotificationState): string | undefined {
		const title = sanitizeOsc99MessageText(state.title);
		const body = sanitizeOsc99MessageText(state.body);
		const hasTitle = title.trim().length > 0;
		const hasBody = body.trim().length > 0;
		if (hasTitle && hasBody) {
			// The composition can bring a `[` of the title next to a `](target)` of the body
			return sanitizeOsc99MessageText(`${title}: ${body}`);
		}
		if (hasTitle) {
			return title;
		}
		if (hasBody) {
			return body;
		}
		return undefined;
	}

	private _getOsc99NotificationPriority(urgency: number | undefined): NotificationPriority | undefined {
		switch (urgency) {
			case 0:
				return NotificationPriority.SILENT;
			case 1:
				return NotificationPriority.DEFAULT;
			case 2:
				return NotificationPriority.URGENT;
			default:
				return undefined;
		}
	}

	private _scheduleOsc99AutoClose(active: IOsc99ActiveNotification, autoCloseMs: number | undefined): IDisposable | undefined {
		if (autoCloseMs === undefined || autoCloseMs <= 0) {
			return undefined;
		}
		return disposableTimeout(() => {
			active.closeReason = 'auto';
			active.handle.close();
		}, autoCloseMs);
	}

	private _closeOsc99Notification(id: string | undefined): void {
		if (!id) {
			return;
		}
		const active = this._osc99ActiveNotificationsById.get(id);
		if (active) {
			active.closeReason = 'protocol';
			active.handle.close();
		}
		this._osc99PendingNotifications.delete(id);
	}

	private _sendOsc99QueryResponse(id: string | undefined): void {
		const requestId = id ?? '0';
		this._sendOsc99Response([
			`i=${requestId}`,
			'p=?',
			'a=report,focus',
			'c=1',
			'o=always,unfocused,invisible',
			'p=title,body,buttons,close,alive,?',
			'u=0,1,2',
			'w=1'
		]);
	}

	private _sendOsc99AliveResponse(id: string | undefined): void {
		const requestId = id ?? '0';
		const aliveIds = Array.from(this._osc99ActiveNotificationsById.keys()).join(',');
		this._sendOsc99Response([
			`i=${requestId}`,
			'p=alive'
		], aliveIds);
	}

	private _sendOsc99ActivationReport(id: string | undefined, buttonIndex?: number): void {
		const reportId = id ?? '0';
		this._sendOsc99Response([`i=${reportId}`], buttonIndex !== undefined ? String(buttonIndex) : '');
	}

	private _sendOsc99CloseReport(id: string | undefined): void {
		const reportId = id ?? '0';
		this._sendOsc99Response([`i=${reportId}`, 'p=close']);
	}

	private _sendOsc99Response(metadataParts: string[], payload: string = ''): void {
		const metadata = metadataParts.join(':');
		this._host.writeToProcess(`\x1b]99;${metadata};${payload}\x1b\\`);
	}
}
