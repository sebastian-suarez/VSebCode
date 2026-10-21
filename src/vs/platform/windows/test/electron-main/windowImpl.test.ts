/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import type { BrowserWindow, BrowserWindowConstructorOptions, WebContents } from 'electron';
import sinon from 'sinon';
import { isMacintosh } from '../../../../base/common/platform.js';
import { upcastPartial } from '../../../../base/test/common/mock.js';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../base/test/common/utils.js';
import { TestConfigurationService } from '../../../configuration/test/common/testConfigurationService.js';
import { IEnvironmentMainService } from '../../../environment/electron-main/environmentMainService.js';
import { NullLogService } from '../../../log/common/log.js';
import { InMemoryTestStateMainService } from '../../../test/electron-main/workbenchTestServices.js';
import { DEFAULT_CUSTOM_TITLEBAR_HEIGHT, getMacOSWindowControlsPosition } from '../../../window/common/window.js';
import { release } from 'os';
import { BaseWindow } from '../../electron-main/windowImpl.js';

class TestWindow extends BaseWindow {
	readonly id = 1;

	override setWin(win: BrowserWindow, options?: BrowserWindowConstructorOptions): void {
		super.setWin(win, options);
	}

	matches(_webContents: WebContents): boolean {
		return false;
	}
}

/** A window of the auxiliary kind: it caches its title row height under its own key, as `AuxiliaryWindow` does. */
class TestAuxiliaryKindWindow extends TestWindow {
	protected override get windowControlHeightStateStorageKey(): string {
		return 'auxiliaryWindowControlHeight';
	}
}

suite('BaseWindow - window controls overlay', () => {
	const store = ensureNoDisposablesAreLeakedInTestSuite();

	teardown(() => sinon.restore());

	function createWindow(stateService = new InMemoryTestStateMainService(), kind: typeof TestWindow = TestWindow) {
		const configurationService = new TestConfigurationService({ window: { titleBarStyle: 'custom' } });
		store.add(configurationService.onDidChangeConfigurationEmitter);
		const window = store.add(new kind(
			configurationService,
			stateService,
			upcastPartial<IEnvironmentMainService>({ args: { _: [] } }),
			store.add(new NullLogService())
		));
		const setTitleBarOverlay = sinon.stub();
		const setWindowButtonPosition = sinon.stub();
		const setSheetOffset = sinon.stub();
		const on = sinon.stub();
		const removeListener = sinon.stub();
		const nativeWindow = upcastPartial<BrowserWindow>({
			on,
			removeListener,
			setSheetOffset,
			setWindowButtonPosition,
			setTitleBarOverlay,
		});
		return { window, nativeWindow, configurationService, setTitleBarOverlay, setWindowButtonPosition, setSheetOffset };
	}

	const windowsWithoutOverlay: { name: string; options?: BrowserWindowConstructorOptions }[] = [
		{ name: 'unknown constructor options' },
		{ name: 'native titlebar', options: {} },
		{ name: 'frameless', options: { frame: false } },
		{ name: 'explicitly disabled overlay', options: { titleBarStyle: 'hidden', titleBarOverlay: false } },
	];

	for (const { name, options } of windowsWithoutOverlay) {
		test(`does not initialize controls for ${name}`, () => {
			const { window, nativeWindow } = createWindow();
			const updateWindowControls = sinon.spy(window, 'updateWindowControls');
			window.setWin(nativeWindow, options);

			assert.deepStrictEqual(updateWindowControls.args, []);
		});
	}

	for (const titleBarOverlay of [true, { height: 29 }]) {
		test(`initializes controls for ${typeof titleBarOverlay} overlay options`, () => {
			const { window, nativeWindow } = createWindow();
			const updateWindowControls = sinon.spy(window, 'updateWindowControls');
			window.setWin(nativeWindow, { titleBarStyle: 'hidden', titleBarOverlay });

			assert.deepStrictEqual(updateWindowControls.args, [[{ height: DEFAULT_CUSTOM_TITLEBAR_HEIGHT }]]);
		});
	}

	for (const enabled of [false, true]) {
		(isMacintosh ? test.skip : test)(`preserves the creation-time overlay capability (${enabled}) after settings change`, async () => {
			const { window, nativeWindow, configurationService, setTitleBarOverlay } = createWindow();
			window.setWin(nativeWindow, { titleBarStyle: 'hidden', titleBarOverlay: enabled });
			setTitleBarOverlay.resetHistory();

			await configurationService.setUserConfiguration('window', { titleBarStyle: 'custom', controlsStyle: enabled ? 'custom' : 'native' });
			window.updateWindowControls({ height: 40, backgroundColor: '#ffffff', foregroundColor: '#000000' });

			assert.deepStrictEqual(setTitleBarOverlay.args, enabled ? [[{ color: '#ffffff', symbolColor: '#000000', height: 39 }]] : []);
		});
	}

	(isMacintosh ? test : test.skip)('main and auxiliary windows start their controls from their own kind\'s last title row', () => {
		const stateService = new InMemoryTestStateMainService();
		const open = (kind: typeof TestWindow) => {
			const created = createWindow(stateService, kind);
			const updateWindowControls = sinon.spy(created.window, 'updateWindowControls');
			created.window.setWin(created.nativeWindow, { titleBarStyle: 'hidden', titleBarOverlay: true });
			return { ...created, initialHeight: updateWindowControls.firstCall.args[0].height };
		};

		const firstMain = open(TestWindow);
		firstMain.setSheetOffset.resetHistory();
		firstMain.window.updateWindowControls({ height: 44 }); // the renderer reports the 44px title band
		const auxiliary = open(TestAuxiliaryKindWindow);
		auxiliary.window.updateWindowControls({ height: 32 }); // auxiliary title rows keep upstream's height
		const nextMain = open(TestWindow);

		assert.deepStrictEqual({
			initialHeights: [firstMain.initialHeight, auxiliary.initialHeight, nextMain.initialHeight],
			sheetOffsetAfterReport: firstMain.setSheetOffset.args,
			nextMainButtons: nextMain.setWindowButtonPosition.lastCall.args,
		}, {
			initialHeights: [DEFAULT_CUSTOM_TITLEBAR_HEIGHT, DEFAULT_CUSTOM_TITLEBAR_HEIGHT, 44],
			sheetOffsetAfterReport: [[44]],
			nextMainButtons: [getMacOSWindowControlsPosition(44, release())],
		});
	});

	(isMacintosh ? test : test.skip)('honors a fixed horizontal inset when the title-bar height changes', () => {
		const { window, nativeWindow, setWindowButtonPosition } = createWindow();
		window.setWin(nativeWindow, { titleBarStyle: 'hidden' });
		setWindowButtonPosition.resetHistory();
		const horizontalInset = getMacOSWindowControlsPosition(DEFAULT_CUSTOM_TITLEBAR_HEIGHT, release())!.x;

		for (const height of [35, 44, 35]) {
			window.updateWindowControls({ height, horizontalInset });
		}

		assert.deepStrictEqual(setWindowButtonPosition.args, [35, 44, 35].map(height => [{
			x: horizontalInset,
			y: getMacOSWindowControlsPosition(height, release())!.y,
		}]));
	});
});
