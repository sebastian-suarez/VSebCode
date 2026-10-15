/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { IRectangle } from '../../../../platform/window/common/window.js';

export const IScreenshotService = createDecorator<IScreenshotService>('screenshotService');

export interface IScreenshotService {
	readonly _serviceBrand: undefined;

	/**
	 * Captures a screenshot of the current window, optionally within a specified rectangle.
	 * Returns a JPEG data URL, or undefined if capture is not supported.
	 */
	captureScreenshot(rect?: IRectangle): Promise<string | undefined>;
}
