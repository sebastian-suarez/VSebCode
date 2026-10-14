/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { safeStringify } from '../../../base/common/objects.js';

/**
 * Extracts a callstack and message from an error object for telemetry.
 * Handles the `Array.isArray(err.stack)` workaround from workerServer.ts
 * and falls back to {@link safeStringify} when no message is available.
 */
export function packErrorForTelemetry(err: any): { callstack: string | undefined; msg: string } {
	if (!err || typeof err !== 'object') {
		return { callstack: undefined, msg: safeStringify(err) };
	}
	const callstack: string | undefined = Array.isArray(err.stack) ? err.stack.join('\n') : err.stack;
	const msg = err.message ? err.message : safeStringify(err);
	return { callstack, msg };
}
