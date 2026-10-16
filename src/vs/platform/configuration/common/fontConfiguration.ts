/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IConfigurationService } from './configuration.js';

/** Resolves an explicitly configured UI font size, otherwise inheriting its region's default. */
export function getFontSize(configurationService: IConfigurationService, key: string, defaultSize: number, min: number = 6, max: number = 32): number {
	const inspected = configurationService.inspect<number>(key);
	const isUserSet = inspected.userValue !== undefined || inspected.userLocalValue !== undefined || inspected.userRemoteValue !== undefined || inspected.workspaceValue !== undefined || inspected.workspaceFolderValue !== undefined;
	// Read the global setting directly: part listeners may run before the workbench updates shared metrics.
	const globalSize = key === 'workbench.experimental.fontSize' ? 13 : getFontSize(configurationService, 'workbench.experimental.fontSize', 13, min, max);
	const inheritedSize = defaultSize * globalSize / 13;
	const raw = isUserSet ? configurationService.getValue<number>(key) : inheritedSize;
	return Math.max(min, Math.min(max, typeof raw === 'number' && Number.isFinite(raw) ? raw : inheritedSize));
}
