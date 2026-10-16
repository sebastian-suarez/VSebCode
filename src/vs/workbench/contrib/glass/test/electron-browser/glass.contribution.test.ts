/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { mainWindow } from '../../../../../base/browser/window.js';
import { timeout } from '../../../../../base/common/async.js';
import { Emitter } from '../../../../../base/common/event.js';
import { DisposableStore } from '../../../../../base/common/lifecycle.js';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../../base/test/common/utils.js';
import { TestAccessibilityService } from '../../../../../platform/accessibility/test/common/testAccessibilityService.js';
import { IGlassOptions } from '../../../../../platform/glass/common/glass.js';
import { NullLogService } from '../../../../../platform/log/common/log.js';
import { ColorScheme } from '../../../../../platform/theme/common/theme.js';
import { TestColorTheme, TestThemeService } from '../../../../../platform/theme/test/common/testThemeService.js';
import { INativeWorkbenchEnvironmentService } from '../../../../services/environment/electron-browser/environmentService.js';
import { TestLayoutService } from '../../../../test/browser/workbenchTestServices.js';
import { TestNativeHostService } from '../../../../test/electron-browser/workbenchTestServices.js';
import { GlassSideBarContribution } from '../../electron-browser/glass.contribution.js';

class GlassTestLayoutService extends TestLayoutService {
	readonly glassChanges: boolean[] = [];
	constructor(override readonly mainContainer: HTMLElement) {
		super();
	}
	override setGlassSideBar(glass: boolean): void {
		if (glass !== this.glassSideBar) {
			this.glassChanges.push(glass);
		}
		super.setGlassSideBar(glass);
	}
}

class GlassTestAccessibilityService extends TestAccessibilityService {
	reduced = false;
	readonly didChangeReducedTransparency = new Emitter<void>();
	override onDidChangeReducedTransparency = this.didChangeReducedTransparency.event;
	override isTransparencyReduced(): boolean { return this.reduced; }
	dispose(): void { this.didChangeReducedTransparency.dispose(); }
}

class GlassTestNativeHostService extends TestNativeHostService {
	attached = true;
	readonly updates: IGlassOptions[] = [];
	readonly didDetachGlass = new Emitter<number>();
	override onDidDetachGlass = this.didDetachGlass.event;
	dispose(): void { this.didDetachGlass.dispose(); }
	override async updateGlass(options?: IGlassOptions): Promise<boolean> {
		this.updates.push({ hidden: options?.hidden, tintColor: options?.tintColor, appearance: options?.appearance });
		return this.attached;
	}
}

suite('GlassSideBarContribution', () => {

	const store = ensureNoDisposablesAreLeakedInTestSuite();

	function create(glassWindow: boolean, disposables: DisposableStore, attached = true) {
		const container = mainWindow.document.createElement('div');
		const environment = { window: { id: 7, glass: glassWindow } } as unknown as INativeWorkbenchEnvironmentService;
		const layout = new GlassTestLayoutService(container);
		const accessibility = disposables.add(new GlassTestAccessibilityService());
		const theme = new TestThemeService(new TestColorTheme({ 'sideBar.background': '#181818' }));
		const nativeHost = disposables.add(new GlassTestNativeHostService());
		nativeHost.attached = attached;
		const contribution = disposables.add(new GlassSideBarContribution(environment, layout, accessibility, theme, nativeHost, new NullLogService()));
		return { container, layout, accessibility, theme, nativeHost, contribution };
	}

	test('an opaque window is left alone', () => {
		const disposables = store.add(new DisposableStore());
		const { layout, nativeHost, container } = create(false, disposables);
		assert.deepStrictEqual({ changes: layout.glassChanges, updates: nativeHost.updates, tint: container.style.getPropertyValue('--glass-sidebar-tint') }, { changes: [], updates: [], tint: '' });
	});

	test('a glass window turns the glass side bar on and shows the layer tinted with the side bar color at 60% in the theme appearance', () => {
		const disposables = store.add(new DisposableStore());
		const { layout, nativeHost, container } = create(true, disposables);
		assert.deepStrictEqual({
			glass: layout.isGlassSideBar(),
			updates: nativeHost.updates,
			cssTint: container.style.getPropertyValue('--glass-sidebar-tint')
		}, {
			glass: true,
			updates: [{ hidden: false, tintColor: '#18181899', appearance: 'dark' }],
			cssTint: 'rgba(24, 24, 24, 0.6)'
		});
	});

	test('reduced transparency and high contrast themes restore the opaque side bar and hide the layer; light themes switch its appearance', () => {
		const disposables = store.add(new DisposableStore());
		const { layout, nativeHost, accessibility, theme } = create(true, disposables);
		accessibility.reduced = true;
		accessibility.didChangeReducedTransparency.fire();
		const reduced = { glass: layout.isGlassSideBar(), update: nativeHost.updates.at(-1) };

		accessibility.reduced = false;
		accessibility.didChangeReducedTransparency.fire();
		const restored = { glass: layout.isGlassSideBar(), update: nativeHost.updates.at(-1) };

		theme.setTheme(new TestColorTheme({ 'sideBar.background': '#000000' }, ColorScheme.HIGH_CONTRAST_DARK));
		const highContrast = { glass: layout.isGlassSideBar(), update: nativeHost.updates.at(-1) };

		theme.setTheme(new TestColorTheme({ 'sideBar.background': '#f3f3f3' }, ColorScheme.LIGHT));
		const light = { glass: layout.isGlassSideBar(), update: nativeHost.updates.at(-1) };

		assert.deepStrictEqual({ reduced, restored, highContrast, light }, {
			reduced: { glass: false, update: { hidden: true, tintColor: '#18181899', appearance: 'dark' } },
			restored: { glass: true, update: { hidden: false, tintColor: '#18181899', appearance: 'dark' } },
			highContrast: { glass: false, update: { hidden: true, tintColor: '#00000099', appearance: 'dark' } },
			light: { glass: true, update: { hidden: false, tintColor: '#f3f3f399', appearance: 'light' } }
		});
	});

	test('a window whose layer the main process released keeps the opaque side bar', async () => {
		const disposables = store.add(new DisposableStore());
		const { layout, nativeHost, theme } = create(true, disposables, false);
		const beforeAnswer = layout.isGlassSideBar();
		await timeout(0);
		const afterAnswer = layout.isGlassSideBar();
		theme.setTheme(new TestColorTheme({ 'sideBar.background': '#f3f3f3' }, ColorScheme.LIGHT));
		assert.deepStrictEqual({ beforeAnswer, afterAnswer, afterTheme: layout.isGlassSideBar(), updates: nativeHost.updates.length, changes: layout.glassChanges }, {
			beforeAnswer: true, afterAnswer: false, afterTheme: false, updates: 1, changes: [true, false]
		});
	});

	test('the main process announcing the loss of this window\'s layer turns the side bar opaque for good', () => {
		const disposables = store.add(new DisposableStore());
		const { layout, nativeHost, theme } = create(true, disposables);
		nativeHost.didDetachGlass.fire(8);
		const otherWindow = layout.isGlassSideBar();
		nativeHost.didDetachGlass.fire(7);
		const thisWindow = layout.isGlassSideBar();
		theme.setTheme(new TestColorTheme({ 'sideBar.background': '#f3f3f3' }, ColorScheme.LIGHT));
		assert.deepStrictEqual({ otherWindow, thisWindow, afterTheme: layout.isGlassSideBar(), updates: nativeHost.updates.length }, { otherWindow: true, thisWindow: false, afterTheme: false, updates: 1 });
	});

	test('disposing restores the opaque side bar', () => {
		const disposables = store.add(new DisposableStore());
		const { layout, contribution } = create(true, disposables);
		contribution.dispose();
		assert.deepStrictEqual({ glass: layout.isGlassSideBar(), changes: layout.glassChanges }, { glass: false, changes: [true, false] });
	});
});
