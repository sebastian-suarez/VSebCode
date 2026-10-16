/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Color } from '../../../base/common/color.js';
import { ColorScheme, ThemeTypeSelector } from '../../theme/common/theme.js';

/**
 * Opacity of the side bar color over the glass: the v10 mockup paints its side bar with
 * `rgba(42, 44, 52, .6)`, and the fork applies that alpha to the color theme's side bar color.
 */
export const GLASS_TINT_OPACITY = 0.6;

/**
 * Options of the native glass layer behind a window's web contents.
 */
export interface IGlassOptions {
	/** `regular` is the standard material; `clear` is the variant Apple reserves for media backgrounds. */
	readonly style?: 'regular' | 'clear';
	/** `#RRGGBB` or `#RRGGBBAA`; an empty string removes the tint. */
	readonly tintColor?: string;
	/** Corner radius of the layer in points. */
	readonly cornerRadius?: number;
	/** Hides or shows the layer without detaching it. */
	readonly hidden?: boolean;
	/** The appearance the material follows; an empty string follows the application's. */
	readonly appearance?: GlassAppearance | '';
}

/** The appearance of the glass material, matching the color theme rather than the system. */
export type GlassAppearance = 'light' | 'dark';

/** The glass appearance of a color theme kind. */
export function glassAppearanceOfColorScheme(scheme: ColorScheme): GlassAppearance {
	return scheme === ColorScheme.LIGHT || scheme === ColorScheme.HIGH_CONTRAST_LIGHT ? 'light' : 'dark';
}

/** The glass appearance of a base theme as the parts splash stores it, or `undefined` when unknown. */
export function glassAppearanceOfBaseTheme(baseTheme: string | undefined): GlassAppearance | undefined {
	switch (baseTheme) {
		case ThemeTypeSelector.VS:
		case ThemeTypeSelector.HC_LIGHT:
			return 'light';
		case ThemeTypeSelector.VS_DARK:
		case ThemeTypeSelector.HC_BLACK:
			return 'dark';
		default:
			return undefined;
	}
}

/**
 * Returns the tint the glass layer gets for a side bar color, as `#RRGGBBAA`, or `undefined`
 * when the color cannot be parsed.
 */
export function glassTintColor(sideBarBackground: string): string | undefined {
	const color = Color.Format.CSS.parseHex(sideBarBackground);
	if (!color) {
		return undefined;
	}
	return Color.Format.CSS.formatHexA(color.transparent(GLASS_TINT_OPACITY));
}
