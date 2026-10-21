/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import type { IPartsSplash, IPartsSplashPartBounds } from '../../../platform/theme/common/themeService.js';

export function getPartsSplashLayoutMetrics(layoutInfo: NonNullable<IPartsSplash['layoutInfo']>) {
	const compact = layoutInfo.modernUICompact === true;
	return {
		floatingMargin: compact ? 0 : 4,
		floatingOuterMargin: compact ? 0 : 4,
		floatingBorderWidth: 1,
		floatingBorderRadius: compact ? 0 : 8,
	};
}

export function getPartsSplashColors(splash: IPartsSplash, hasFocus: boolean, hasWorkspace: boolean) {
	const { colorInfo } = splash;
	const titleBarBackground = (hasFocus ? colorInfo.titleBarBackground : colorInfo.titleBarInactiveBackground ?? colorInfo.titleBarBackground) ?? colorInfo.background;
	const modernUIShellBackground = hasFocus ? colorInfo.modernUIShellBackground : colorInfo.modernUIInactiveShellBackground ?? colorInfo.modernUIShellBackground;
	const statusBarBackground = hasWorkspace
		? hasFocus ? colorInfo.statusBarBackground : colorInfo.statusBarInactiveBackground ?? colorInfo.statusBarBackground
		: colorInfo.statusBarNoFolderBackground;

	return {
		background: splash.layoutInfo?.modernUI === true ? modernUIShellBackground ?? titleBarBackground : colorInfo.editorBackground,
		titleBarBackground,
		statusBarBackground,
	};
}

/**
 * The horizontal extent of a band the splash paints across the window: the title row or the
 * status line.
 */
export interface IPartsSplashBand {
	readonly left: number;
	readonly width: number;
}

/**
 * Where the splash paints the side bar column and the bands beside it (`layoutColumn.ts`): the
 * column, the activity bar and the primary side bar, is outside the main area, which holds the
 * status line, and also outside the title row when it spans the window height and reserves the
 * title band (`columnWithBand`); otherwise the title row spans the window above the column. The
 * column parts are flush with the window edges, so their rectangles follow from their widths
 * when no part bounds were saved.
 */
/**
 * Fits the saved bar widths into the window the splash paints: a maximized secondary side bar
 * takes the window but the activity bar, otherwise the secondary side bar and then the side bar
 * leave the editor its minimum width. Neither width goes below zero, because a window narrower
 * than the saved layout can leave less than nothing to share, and a negative width taken into
 * the next computation would let the other bar grow past the window.
 */
export function normalizePartsSplashWidths(layoutInfo: NonNullable<IPartsSplash['layoutInfo']>, windowWidth: number): { readonly auxiliaryBarWidth: number; readonly sideBarWidth: number } {
	const auxiliaryBarWidth = layoutInfo.auxiliaryBarWidth === Number.MAX_SAFE_INTEGER
		? Math.max(0, windowWidth - layoutInfo.activityBarWidth)
		: Math.max(0, Math.min(layoutInfo.auxiliaryBarWidth, windowWidth - (layoutInfo.activityBarWidth + layoutInfo.editorPartMinWidth + layoutInfo.sideBarWidth)));
	const sideBarWidth = Math.max(0, Math.min(layoutInfo.sideBarWidth, windowWidth - (layoutInfo.activityBarWidth + layoutInfo.editorPartMinWidth + auxiliaryBarWidth)));

	return { auxiliaryBarWidth, sideBarWidth };
}

export function getPartsSplashColumnGeometry(layoutInfo: NonNullable<IPartsSplash['layoutInfo']>, windowWidth: number, windowHeight: number): {
	readonly titleBar: IPartsSplashBand;
	readonly statusBar: IPartsSplashBand;
	readonly activityBar: IPartsSplashPartBounds | undefined;
	readonly sideBar: IPartsSplashPartBounds | undefined;
} {
	// The widths normalized against the window go negative when nothing is left for a part
	// (a maximized secondary side bar takes the window but the rail)
	const activityBarWidth = Math.max(0, layoutInfo.activityBarWidth);
	const sideBarWidth = Math.max(0, layoutInfo.sideBarWidth);
	const columnLeft = layoutInfo.sideBarSide !== 'right';
	const columnWidth = activityBarWidth + sideBarWidth;
	const mainArea: IPartsSplashBand = { left: columnLeft ? columnWidth : 0, width: Math.max(0, windowWidth - columnWidth) };
	const columnTop = layoutInfo.columnWithBand === true ? 0 : layoutInfo.titleBarHeight;
	const columnHeight = Math.max(0, windowHeight - columnTop);

	return {
		titleBar: layoutInfo.columnWithBand === true ? mainArea : { left: 0, width: windowWidth },
		statusBar: mainArea,
		activityBar: activityBarWidth > 0 ? {
			top: columnTop,
			left: columnLeft ? 0 : windowWidth - activityBarWidth,
			width: activityBarWidth,
			height: columnHeight
		} : undefined,
		sideBar: sideBarWidth > 0 ? {
			top: columnTop,
			left: columnLeft ? activityBarWidth : windowWidth - columnWidth,
			width: sideBarWidth,
			height: columnHeight
		} : undefined
	};
}
