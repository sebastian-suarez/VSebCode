/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/** Options of a glass layer. Omitted fields keep their current value. */
export interface GlassOptions {
	/** `regular` is the standard material; `clear` is the more transparent variant Apple reserves for media. */
	style?: 'regular' | 'clear';
	/** `#RRGGBB` or `#RRGGBBAA`; an empty string removes the tint. */
	tintColor?: string;
	/** Corner radius of the glass layer in points. */
	cornerRadius?: number;
	/** Hides or shows the layer without detaching it. */
	hidden?: boolean;
	/** The appearance the material follows: `light`, `dark`, or an empty string for the application's. */
	appearance?: 'light' | 'dark' | '';
}

/** Whether Liquid Glass can be attached in this process (macOS 26 or newer with the binary loaded). */
export function isSupported(): boolean;

/**
 * Inserts a glass layer below the web contents of the window whose content view the handle
 * (from `BrowserWindow.getNativeWindowHandle()`) points to. Returns the layer id, or -1 when
 * unsupported. The layer fills the content view and follows its size.
 */
export function attach(handle: Buffer, options?: GlassOptions): number;

/** Changes the options of an attached layer. Returns false when the id is unknown. */
export function update(id: number, options: GlassOptions): boolean;

/** Removes an attached layer. Returns false when the id is unknown. */
export function detach(id: number): boolean;
