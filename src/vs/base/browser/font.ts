/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { getWindow } from './dom.js';
import { FONT } from '../common/font.js';

/** Reads the UI font size (in pixels) inherited from the control's current container. Detached controls use the global default until attached. */
export function getElementFontSize(element: HTMLElement | undefined): number {
	if (!element) {
		return FONT.defaultSize;
	}
	const size = Number.parseFloat(getWindow(element).getComputedStyle(element).getPropertyValue('--monaco-ui-font-size'));
	return Number.isFinite(size) && size > 0 ? size : FONT.defaultSize;
}

/** Scales a default UI dimension using the control's current container. */
export function getElementFontMetric(element: HTMLElement | undefined, dimension: number): number {
	return getElementFontSize(element) / 13 * dimension;
}
