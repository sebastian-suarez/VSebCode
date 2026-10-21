/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { mock } from '../../../base/test/common/mock.js';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../base/test/common/utils.js';
import { IPartsSplash } from '../../../platform/theme/common/themeService.js';
import { ThemeTypeSelector } from '../../../platform/theme/common/theme.js';
import { getPartsSplashColors, getPartsSplashColumnGeometry, getPartsSplashLayoutMetrics, normalizePartsSplashWidths } from '../../electron-browser/workbench/partsSplash.js';

suite('Parts splash layout', () => {
	ensureNoDisposablesAreLeakedInTestSuite();

	test('keeps compact edges flush and square with and without saved part bounds', () => {
		const layoutInfo = new class extends mock<NonNullable<IPartsSplash['layoutInfo']>>() {
			override modernUI = true;
			override modernUICompact = true;
			override partBounds = {
				activityBar: { top: 35, left: 0, width: 40, height: 600 },
				sideBar: { top: 35, left: 40, width: 200, height: 600 },
				editor: { top: 35, left: 240, width: 560, height: 400 },
				panel: { top: 435, left: 240, width: 560, height: 200 },
				auxiliaryBar: { top: 35, left: 800, width: 200, height: 600 },
			};
		}();

		const expected = {
			floatingMargin: 0,
			floatingOuterMargin: 0,
			floatingBorderWidth: 1,
			floatingBorderRadius: 0,
		};
		assert.deepStrictEqual({
			savedBounds: getPartsSplashLayoutMetrics(layoutInfo),
			fallback: getPartsSplashLayoutMetrics({ ...layoutInfo, partBounds: undefined }),
		}, {
			savedBounds: expected,
			fallback: expected,
		});
	});

	test('preserves default-density gutters and rounded corners', () => {
		const layoutInfo = new class extends mock<NonNullable<IPartsSplash['layoutInfo']>>() {
			override modernUI = true;
			override modernUICompact = false;
		}();

		assert.deepStrictEqual(getPartsSplashLayoutMetrics(layoutInfo), {
			floatingMargin: 4,
			floatingOuterMargin: 4,
			floatingBorderWidth: 1,
			floatingBorderRadius: 8,
		});
	});
});

suite('Parts splash colors', () => {
	ensureNoDisposablesAreLeakedInTestSuite();

	function createSplash(modernUI: boolean): IPartsSplash {
		return {
			baseTheme: ThemeTypeSelector.VS_DARK,
			zoomLevel: undefined,
			colorInfo: new class extends mock<IPartsSplash['colorInfo']>() {
				override background = '#101010';
				override editorBackground = '#202020';
				override titleBarBackground = '#303030';
				override titleBarInactiveBackground = '#404040';
				override modernUIShellBackground = '#505050';
				override modernUIInactiveShellBackground = '#606060';
				override statusBarBackground = '#707070';
				override statusBarInactiveBackground = '#808080';
				override statusBarNoFolderBackground = '#909090';
			}(),
			layoutInfo: new class extends mock<NonNullable<IPartsSplash['layoutInfo']>>() {
				override modernUI = modernUI;
			}(),
		};
	}

	for (const modernUI of [false, true]) {
		test(`keeps shell and bar colors independent with modern UI ${modernUI}`, () => {
			const splash = createSplash(modernUI);
			assert.deepStrictEqual({
				active: getPartsSplashColors(splash, true, true),
				inactive: getPartsSplashColors(splash, false, true),
				empty: getPartsSplashColors(splash, false, false),
			}, {
				active: {
					background: modernUI ? '#505050' : '#202020',
					titleBarBackground: '#303030',
					statusBarBackground: '#707070',
				},
				inactive: {
					background: modernUI ? '#606060' : '#202020',
					titleBarBackground: '#404040',
					statusBarBackground: '#808080',
				},
				empty: {
					background: modernUI ? '#606060' : '#202020',
					titleBarBackground: '#404040',
					statusBarBackground: '#909090',
				},
			});
		});
	}

	test('supports older splash data without inactive or shell colors', () => {
		const splash = createSplash(true);
		splash.colorInfo.titleBarInactiveBackground = undefined;
		splash.colorInfo.modernUIShellBackground = undefined;
		splash.colorInfo.modernUIInactiveShellBackground = undefined;
		splash.colorInfo.statusBarInactiveBackground = undefined;

		assert.deepStrictEqual(getPartsSplashColors(splash, false, true), {
			background: '#303030',
			titleBarBackground: '#303030',
			statusBarBackground: '#707070',
		});
	});

	test('retains the active shell when the inactive shell color is absent', () => {
		const splash = createSplash(true);
		splash.colorInfo.modernUIInactiveShellBackground = undefined;

		assert.deepStrictEqual(getPartsSplashColors(splash, false, true), {
			background: '#505050',
			titleBarBackground: '#404040',
			statusBarBackground: '#808080',
		});
	});

	test('does not treat a transparent customization as a missing color', () => {
		const splash = createSplash(true);
		splash.colorInfo.statusBarInactiveBackground = '#00000000';

		assert.deepStrictEqual(getPartsSplashColors(splash, false, true), {
			background: '#606060',
			titleBarBackground: '#404040',
			statusBarBackground: '#00000000',
		});
	});
});

suite('Parts splash column', () => {
	ensureNoDisposablesAreLeakedInTestSuite();

	function geometry(overrides: Partial<NonNullable<IPartsSplash['layoutInfo']>>) {
		return getPartsSplashColumnGeometry({
			sideBarSide: 'left',
			editorPartMinWidth: 220,
			titleBarHeight: 44,
			activityBarWidth: 0,
			sideBarWidth: 256,
			auxiliaryBarWidth: 0,
			statusBarHeight: 34,
			windowBorder: false,
			windowBorderRadius: undefined,
			modernUI: true,
			modernUICompact: false,
			columnWithBand: true,
			partBounds: undefined,
			...overrides
		}, 1200, 800);
	}

	test('paints the column flush at its height and the bands beside it', () => {
		const belowTitle = {
			titleBar: { left: 0, width: 1200 },
			statusBar: { left: 256, width: 944 },
			activityBar: undefined,
			sideBar: { top: 44, left: 0, width: 256, height: 756 },
		};

		assert.deepStrictEqual({
			band: geometry({}),
			bandOnTheRight: geometry({ sideBarSide: 'right', activityBarWidth: 48 }),
			belowTitle: geometry({ columnWithBand: false }),
			// Saved before the column existed: painted below a full-width title bar until the next save
			olderData: geometry({ columnWithBand: undefined }),
			hiddenColumn: geometry({ sideBarWidth: 0 }),
		}, {
			band: {
				titleBar: { left: 256, width: 944 },
				statusBar: { left: 256, width: 944 },
				activityBar: undefined,
				sideBar: { top: 0, left: 0, width: 256, height: 800 },
			},
			bandOnTheRight: {
				titleBar: { left: 0, width: 896 },
				statusBar: { left: 0, width: 896 },
				activityBar: { top: 0, left: 1152, width: 48, height: 800 },
				sideBar: { top: 0, left: 896, width: 256, height: 800 },
			},
			belowTitle,
			olderData: belowTitle,
			hiddenColumn: {
				titleBar: { left: 0, width: 1200 },
				statusBar: { left: 0, width: 1200 },
				activityBar: undefined,
				sideBar: undefined,
			},
		});
	});

	test('fits the saved widths into the window, none below zero', () => {
		const layout = (overrides: Partial<NonNullable<IPartsSplash['layoutInfo']>>) => ({
			sideBarSide: 'left', editorPartMinWidth: 220, titleBarHeight: 44, activityBarWidth: 0, sideBarWidth: 300, auxiliaryBarWidth: 300,
			statusBarHeight: 34, windowBorder: false, windowBorderRadius: undefined, modernUI: true, modernUICompact: false, columnWithBand: true, partBounds: undefined,
			...overrides
		} satisfies NonNullable<IPartsSplash['layoutInfo']>);
		// A window narrower than the saved layout: the secondary side bar gets nothing, and the
		// side bar what the editor's minimum width leaves, not the saved 600px
		const narrow = layout({ activityBarWidth: 44, sideBarWidth: 600, auxiliaryBarWidth: 0 });

		assert.deepStrictEqual({
			fits: normalizePartsSplashWidths(layout({}), 1440),
			narrow: normalizePartsSplashWidths(narrow, 500),
			narrowBands: getPartsSplashColumnGeometry({ ...narrow, ...normalizePartsSplashWidths(narrow, 500) }, 500, 800),
			maximizedSecondarySideBar: normalizePartsSplashWidths(layout({ activityBarWidth: 44, auxiliaryBarWidth: Number.MAX_SAFE_INTEGER }), 1200),
			tooNarrowForAnything: normalizePartsSplashWidths(layout({ activityBarWidth: 44 }), 200),
		}, {
			fits: { auxiliaryBarWidth: 300, sideBarWidth: 300 },
			narrow: { auxiliaryBarWidth: 0, sideBarWidth: 236 },
			narrowBands: {
				titleBar: { left: 280, width: 220 },
				statusBar: { left: 280, width: 220 },
				activityBar: { top: 0, left: 0, width: 44, height: 800 },
				sideBar: { top: 0, left: 44, width: 236, height: 800 },
			},
			maximizedSecondarySideBar: { auxiliaryBarWidth: 1156, sideBarWidth: 0 },
			tooNarrowForAnything: { auxiliaryBarWidth: 0, sideBarWidth: 0 },
		});
	});

	test('a maximized secondary side bar leaves the bands beside the rail', () => {
		// The window's width goes to the maximized bar but the rail, and the normalization in
		// `workbench.ts` left the side bar the room that remains: less than nothing
		assert.deepStrictEqual(geometry({ activityBarWidth: 44, auxiliaryBarWidth: 1200 - 44, sideBarWidth: -220 }), {
			titleBar: { left: 44, width: 1156 },
			statusBar: { left: 44, width: 1156 },
			activityBar: { top: 0, left: 0, width: 44, height: 800 },
			sideBar: undefined,
		});
	});
});
