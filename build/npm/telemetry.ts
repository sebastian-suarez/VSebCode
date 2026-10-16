/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as path from 'node:path';
import { dirs } from './dirs.ts';
import { rewriteTelemetryDirectory } from '../lib/telemetryHosts.ts';

/** Removes telemetry authorities from installed dependencies, including cached built-in extensions. */
export function rewriteInstalledTelemetry(root: string): void {
	for (const dir of dirs) {
		rewriteTelemetryDirectory(path.join(root, dir, 'node_modules'));
	}
	rewriteTelemetryDirectory(path.join(root, '.build', 'builtInExtensions'));
}
