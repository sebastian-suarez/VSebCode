/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Emitter } from './event.js';
import { markAsSingleton } from './lifecycle.js';

const fontMetricsChanged = markAsSingleton(new Emitter<void>());

/** Signals that existing controls must remeasure font-dependent geometry. */
export const onDidChangeFontMetrics = fontMetricsChanged.event;

/** Invalidates measurements after a workbench font family changes. */
export function invalidateFontMetrics(): void {
	fontMetricsChanged.fire();
}

/** Shared UI metrics, scaled from the default workbench dimensions. */
export const FONT = {
	activityBarSize: 16,
	activityBarSize4: 4,
	activityBarSize8: 8,
	activityBarSize16: 16,
	activityBarSize24: 24,
	activityBarSize32: 32,
	activityBarSize36: 36,
	activityBarSize48: 48,

	bottomPaneSize: 13,
	bottomPaneSize22: 22,

	defaultSize: 13,
	defaultActivityBarSize: 16,
	defaultBottomPaneSize: 13,
	defaultSidebarSize: 13,
	defaultStatusBarSize: 12,
	defaultTabsSize: 13,

	sidebarSize: 13,
	sidebarSize8: 8,
	sidebarSize10: 10,
	sidebarSize16: 16,
	sidebarSize17: 17,
	sidebarSize18: 18,
	sidebarSize20: 20,
	sidebarSize22: 22,
	sidebarSize23: 23,
	sidebarSize24: 24,
	sidebarSize26: 26,
	sidebarSize28: 28,
	sidebarSize30: 30,
	sidebarSize34: 34,
	sidebarSize39: 39,
	sidebarSize42: 42,
	sidebarSize44: 44,
	sidebarSize52: 52,
	sidebarSize54: 54,
	sidebarSize62: 62,
	sidebarSize72: 72,

	statusBarSize: 12,
	statusBarSize22: 22,

	tabsSize: 13,
	tabsSize22: 22,
	tabsSize24: 24,
	tabsSize28: 28,
	tabsSize32: 32,
	tabsSize35: 35,
	tabsSize38: 38,
	tabsSize80: 80,
	tabsSize120: 120,

	workbenchCoefficient: 1,
};

// Activity bar coefficients (base 16)
const ACTIVITY_BAR_COEFF_4 = 4 / 16;
const ACTIVITY_BAR_COEFF_8 = 8 / 16;
const ACTIVITY_BAR_COEFF_24 = 24 / 16;
const ACTIVITY_BAR_COEFF_32 = 32 / 16;
const ACTIVITY_BAR_COEFF_36 = 36 / 16;
const ACTIVITY_BAR_COEFF_48 = 48 / 16;

// Panel coefficients (base 13)
const BOTTOM_PANEL_COEFF_22 = 22 / 13;

// Workbench coefficients (base 13)
const DEFAULT_COEFF_12 = 12 / 13;
const DEFAULT_COEFF_16 = 16 / 13;

// Sidebar coefficients (base 13)
const SIDE_BAR_COEFF_8 = 8 / 13;
const SIDE_BAR_COEFF_10 = 10 / 13;
const SIDE_BAR_COEFF_16 = 16 / 13;
const SIDE_BAR_COEFF_17 = 17 / 13;
const SIDE_BAR_COEFF_18 = 18 / 13;
const SIDE_BAR_COEFF_20 = 20 / 13;
const SIDE_BAR_COEFF_22 = 22 / 13;
const SIDE_BAR_COEFF_23 = 23 / 13;
const SIDE_BAR_COEFF_24 = 24 / 13;
const SIDE_BAR_COEFF_26 = 26 / 13;
const SIDE_BAR_COEFF_28 = 28 / 13;
const SIDE_BAR_COEFF_30 = 30 / 13;
const SIDE_BAR_COEFF_34 = 34 / 13;
const SIDE_BAR_COEFF_39 = 39 / 13;
const SIDE_BAR_COEFF_42 = 42 / 13;
const SIDE_BAR_COEFF_44 = 44 / 13;
const SIDE_BAR_COEFF_52 = 52 / 13;
const SIDE_BAR_COEFF_54 = 54 / 13;
const SIDE_BAR_COEFF_62 = 62 / 13;
const SIDE_BAR_COEFF_72 = 72 / 13;

// Status bar coefficients (base 12)
const STATUS_BAR_COEFF_22 = 22 / 12;

// Tabs coefficients (base 13)
const TABS_COEFF_22 = 22 / 13;
const TABS_COEFF_28 = 28 / 13;
const TABS_COEFF_32 = 32 / 13;
const TABS_COEFF_35 = 35 / 13;
const TABS_COEFF_38 = 38 / 13;
const TABS_COEFF_80 = 80 / 13;

/** Updates the region metrics and invalidates existing measurements. */
export function updateActivityBarSize(size: number): void {
	if (FONT.activityBarSize === size) {
		return;
	}
	FONT.activityBarSize = size;
	FONT.activityBarSize4 = size * ACTIVITY_BAR_COEFF_4;
	FONT.activityBarSize8 = size * ACTIVITY_BAR_COEFF_8;
	FONT.activityBarSize16 = size;
	FONT.activityBarSize24 = size * ACTIVITY_BAR_COEFF_24;
	FONT.activityBarSize32 = size * ACTIVITY_BAR_COEFF_32;
	FONT.activityBarSize36 = size * ACTIVITY_BAR_COEFF_36;
	FONT.activityBarSize48 = size * ACTIVITY_BAR_COEFF_48;
	fontMetricsChanged.fire();
}

/** Updates the region metrics and invalidates existing measurements. */
export function updateDefaultSize(size: number): void {
	if (FONT.defaultSize === size) {
		return;
	}
	FONT.defaultSize = size;
	FONT.defaultActivityBarSize = size * DEFAULT_COEFF_16;
	FONT.defaultBottomPaneSize = size;
	FONT.defaultSidebarSize = size;
	FONT.defaultStatusBarSize = size * DEFAULT_COEFF_12;
	FONT.defaultTabsSize = size;

	FONT.workbenchCoefficient = size / 13;
	fontMetricsChanged.fire();
}

/** Updates the region metrics and invalidates existing measurements. */
export function updatePanelSize(size: number): void {
	if (FONT.bottomPaneSize === size) {
		return;
	}
	FONT.bottomPaneSize = size;
	FONT.bottomPaneSize22 = size * BOTTOM_PANEL_COEFF_22;
	fontMetricsChanged.fire();
}

/** Updates the region metrics and invalidates existing measurements. */
export function updateSidebarSize(size: number): void {
	if (FONT.sidebarSize === size) {
		return;
	}
	FONT.sidebarSize = size;
	FONT.sidebarSize8 = size * SIDE_BAR_COEFF_8;
	FONT.sidebarSize10 = size * SIDE_BAR_COEFF_10;
	FONT.sidebarSize16 = size * SIDE_BAR_COEFF_16;
	FONT.sidebarSize17 = size * SIDE_BAR_COEFF_17;
	FONT.sidebarSize18 = size * SIDE_BAR_COEFF_18;
	FONT.sidebarSize20 = size * SIDE_BAR_COEFF_20;
	FONT.sidebarSize22 = size * SIDE_BAR_COEFF_22;
	FONT.sidebarSize23 = size * SIDE_BAR_COEFF_23;
	FONT.sidebarSize24 = size * SIDE_BAR_COEFF_24;
	FONT.sidebarSize26 = size * SIDE_BAR_COEFF_26;
	FONT.sidebarSize30 = size * SIDE_BAR_COEFF_30;
	FONT.sidebarSize28 = size * SIDE_BAR_COEFF_28;
	FONT.sidebarSize34 = size * SIDE_BAR_COEFF_34;
	FONT.sidebarSize39 = size * SIDE_BAR_COEFF_39;
	FONT.sidebarSize42 = size * SIDE_BAR_COEFF_42;
	FONT.sidebarSize44 = size * SIDE_BAR_COEFF_44;
	FONT.sidebarSize52 = size * SIDE_BAR_COEFF_52;
	FONT.sidebarSize54 = size * SIDE_BAR_COEFF_54;
	FONT.sidebarSize62 = size * SIDE_BAR_COEFF_62;
	FONT.sidebarSize72 = size * SIDE_BAR_COEFF_72;
	fontMetricsChanged.fire();
}

/** Updates the region metrics and invalidates existing measurements. */
export function updateStatusBarSize(size: number): void {
	if (FONT.statusBarSize === size) {
		return;
	}
	FONT.statusBarSize = size;
	FONT.statusBarSize22 = size * STATUS_BAR_COEFF_22;
	fontMetricsChanged.fire();
}

/** Updates the region metrics and invalidates existing measurements. */
export function updateTabsSize(size: number): void {
	if (FONT.tabsSize === size) {
		return;
	}
	FONT.tabsSize = size;
	FONT.tabsSize22 = size * TABS_COEFF_22;
	FONT.tabsSize24 = size * (24 / 13);
	FONT.tabsSize28 = size * TABS_COEFF_28;
	FONT.tabsSize32 = size * TABS_COEFF_32;
	FONT.tabsSize35 = size * TABS_COEFF_35;
	FONT.tabsSize38 = size * TABS_COEFF_38;
	FONT.tabsSize80 = size * TABS_COEFF_80;
	FONT.tabsSize120 = size / 13 * 120;
	fontMetricsChanged.fire();
}
