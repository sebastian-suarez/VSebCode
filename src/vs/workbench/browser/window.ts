/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { getZoomFactor, onDidChangeZoomLevel, setFullscreen } from '../../base/browser/browser.js';
import { getWindow, getWindowById, getWindows, getWindowsCount, hasAppFocus } from '../../base/browser/dom.js';
import { Disposable, IDisposable, dispose, toDisposable } from '../../base/common/lifecycle.js';
import { isMacintosh } from '../../base/common/platform.js';
import { localize } from '../../nls.js';
import { IDialogService } from '../../platform/dialogs/common/dialogs.js';
import { ServicesAccessor } from '../../platform/instantiation/common/instantiation.js';
import { IWorkbenchLayoutService } from '../services/layout/browser/layoutService.js';
import { ShutdownReason } from '../services/lifecycle/common/lifecycle.js';
import { IHostService } from '../services/host/browser/host.js';
import { CodeWindow, isAuxiliaryWindow, mainWindow } from '../../base/browser/window.js';
import { createSingleCallFunction } from '../../base/common/functional.js';
import { IConfigurationService } from '../../platform/configuration/common/configuration.js';
import { IWorkbenchEnvironmentService } from '../services/environment/common/environmentService.js';
import { IContextMenuService } from '../../platform/contextview/browser/contextView.js';

export abstract class BaseWindow extends Disposable {

	private static TIMEOUT_HANDLES = Number.MIN_SAFE_INTEGER; // try to not compete with the IDs of native `setTimeout`
	private static readonly TIMEOUT_DISPOSABLES = new Map<number, Set<IDisposable>>();

	constructor(
		targetWindow: CodeWindow,
		dom = { getWindowsCount, getWindows }, /* for testing */
		@IHostService protected readonly hostService: IHostService,
		@IWorkbenchEnvironmentService protected readonly environmentService: IWorkbenchEnvironmentService,
		@IContextMenuService protected readonly contextMenuService: IContextMenuService,
		@IWorkbenchLayoutService protected readonly layoutService: IWorkbenchLayoutService,
	) {
		super();

		this.enableWindowFocusOnElementFocus(targetWindow);
		this.enableMultiWindowAwareTimeout(targetWindow, dom);

		this.registerFullScreenListeners(targetWindow.vscodeWindowId);
		this.registerContextMenuListeners(targetWindow);
		this.registerWindowZoomFactor(targetWindow);
	}

	private registerWindowZoomFactor(targetWindow: CodeWindow): void {
		// Auxiliary windows mirror document/body styles, but keep their own workbench styles.
		const container = this.layoutService.getContainer(targetWindow);
		const update = () => container.style.setProperty('--window-zoom-factor', String(getZoomFactor(targetWindow)));
		update();
		this._register(onDidChangeZoomLevel(windowId => {
			if (windowId === targetWindow.vscodeWindowId) {
				update();
			}
		}));
	}

	//#region focus handling in multi-window applications

	protected enableWindowFocusOnElementFocus(targetWindow: CodeWindow): void {
		const originalFocus = targetWindow.HTMLElement.prototype.focus;

		const that = this;
		targetWindow.HTMLElement.prototype.focus = function (this: HTMLElement, options?: FocusOptions | undefined): void {

			// Ensure the window the element belongs to is focused
			// in scenarios where auxiliary windows are present
			that.onElementFocus(getWindow(this));

			// Pass to original focus() method
			originalFocus.apply(this, [options]);
		};
	}

	private onElementFocus(targetWindow: CodeWindow): void {

		// Check if focus should transfer: the application currently has focus somewhere, but not in the target window.
		if (!targetWindow.document.hasFocus() && hasAppFocus()) {

			// Call original focus()
			targetWindow.focus();

			// In Electron, `window.focus()` fails to bring the window
			// to the front if multiple windows exist in the same process
			// group (floating windows). As such, we ask the host service
			// to focus the window which can take care of bringin the
			// window to the front.
			//
			// To minimise disruption by bringing windows to the front
			// by accident, we only do this if the window is not already
			// focused and the active window is not the target window
			// but has focus. This is an indication that multiple windows
			// are opened in the same process group while the target window
			// is not focused.

			if (
				!this.environmentService.extensionTestsLocationURI &&
				!targetWindow.document.hasFocus()
			) {
				this.hostService.focus(targetWindow);
			}
		}
	}

	//#endregion

	//#region timeout handling in multi-window applications

	protected enableMultiWindowAwareTimeout(targetWindow: Window, dom = { getWindowsCount, getWindows }): void {

		// Override `setTimeout` and `clearTimeout` on the provided window to make
		// sure timeouts are dispatched to all opened windows. Some browsers may decide
		// to throttle timeouts in minimized windows, so with this we can ensure the
		// timeout is scheduled without being throttled (unless all windows are minimized).

		const originalSetTimeout = targetWindow.setTimeout;
		Object.defineProperty(targetWindow, 'vscodeOriginalSetTimeout', { get: () => originalSetTimeout });

		const originalClearTimeout = targetWindow.clearTimeout;
		Object.defineProperty(targetWindow, 'vscodeOriginalClearTimeout', { get: () => originalClearTimeout });

		targetWindow.setTimeout = function (this: unknown, handler: TimerHandler, timeout = 0, ...args: unknown[]): number {
			if (dom.getWindowsCount() === 1 || typeof handler === 'string' || timeout === 0 /* immediates are never throttled */) {
				return originalSetTimeout.apply(this, [handler, timeout, ...args]);
			}

			const timeoutDisposables = new Set<IDisposable>();
			const timeoutHandle = BaseWindow.TIMEOUT_HANDLES++;
			BaseWindow.TIMEOUT_DISPOSABLES.set(timeoutHandle, timeoutDisposables);

			const handlerFn = createSingleCallFunction(handler, () => {
				dispose(timeoutDisposables);
				BaseWindow.TIMEOUT_DISPOSABLES.delete(timeoutHandle);
			});

			for (const { window, disposables } of dom.getWindows()) {
				if (isAuxiliaryWindow(window) && window.document.visibilityState === 'hidden') {
					continue; // skip over hidden windows (but never over main window)
				}

				// we track didClear in case the browser does not properly clear the timeout
				// this can happen for timeouts on unfocused windows
				let didClear = false;

				const handle = (window as { vscodeOriginalSetTimeout?: typeof window.setTimeout }).vscodeOriginalSetTimeout?.apply(this, [(...args: unknown[]) => {
					if (didClear) {
						return;
					}
					handlerFn(...args);
				}, timeout, ...args]);

				const timeoutDisposable = toDisposable(() => {
					didClear = true;
					(window as { vscodeOriginalClearTimeout?: typeof window.clearTimeout }).vscodeOriginalClearTimeout?.apply(this, [handle]);
					timeoutDisposables.delete(timeoutDisposable);
					// Remove from the window's DisposableStore without re-disposing (we're already inside dispose)
					disposables.deleteAndLeak(timeoutDisposable);
				});

				disposables.add(timeoutDisposable);
				timeoutDisposables.add(timeoutDisposable);
			}

			return timeoutHandle;
		};

		targetWindow.clearTimeout = function (this: unknown, timeoutHandle: number | undefined): void {
			const timeoutDisposables = typeof timeoutHandle === 'number' ? BaseWindow.TIMEOUT_DISPOSABLES.get(timeoutHandle) : undefined;
			if (timeoutDisposables) {
				dispose(timeoutDisposables);
				BaseWindow.TIMEOUT_DISPOSABLES.delete(timeoutHandle!);
			} else {
				originalClearTimeout.apply(this, [timeoutHandle]);
			}
		};
	}

	//#endregion

	//#region Confirm on Shutdown

	static async confirmOnShutdown(accessor: ServicesAccessor, reason: ShutdownReason): Promise<boolean> {
		const dialogService = accessor.get(IDialogService);
		const configurationService = accessor.get(IConfigurationService);

		const message = reason === ShutdownReason.QUIT ?
			(isMacintosh ? localize('quitMessageMac', "Are you sure you want to quit?") : localize('quitMessage', "Are you sure you want to exit?")) :
			localize('closeWindowMessage', "Are you sure you want to close the window?");
		const primaryButton = reason === ShutdownReason.QUIT ?
			(isMacintosh ? localize({ key: 'quitButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Quit") : localize({ key: 'exitButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Exit")) :
			localize({ key: 'closeWindowButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Close Window");

		const res = await dialogService.confirm({
			message,
			primaryButton,
			checkbox: {
				label: localize('doNotAskAgain', "Do not ask me again")
			}
		});

		// Update setting if checkbox checked
		if (res.confirmed && res.checkboxChecked) {
			await configurationService.updateValue('window.confirmBeforeClose', 'never');
		}

		return res.confirmed;
	}

	//#endregion

	private registerFullScreenListeners(targetWindowId: number): void {
		this._register(this.hostService.onDidChangeFullScreen(({ windowId, fullscreen }) => {
			if (windowId === targetWindowId) {
				const targetWindow = getWindowById(targetWindowId);
				if (targetWindow) {
					setFullscreen(fullscreen, targetWindow.window);
				}
			}
		}));
	}

	private registerContextMenuListeners(targetWindow: Window): void {
		if (targetWindow !== mainWindow) {
			// we only need to listen in the main window as the code
			// will go by the active container and update accordingly
			return;
		}

		const update = (visible: boolean) => this.layoutService.activeContainer.classList.toggle('context-menu-visible', visible);
		this._register(this.contextMenuService.onDidShowContextMenu(() => update(true)));
		this._register(this.contextMenuService.onDidHideContextMenu(() => update(false)));
	}
}
