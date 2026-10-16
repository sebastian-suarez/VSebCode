/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { homedir } from 'os';
import { createHash } from 'crypto';
import { NativeParsedArgs } from '../common/argv.js';
import { getUserDataPath } from './userDataPath.js';

// eslint-disable-next-line local/code-import-patterns
import { resolve, isAbsolute, join } from 'path';

/** Explicit environment inputs for resolving Linux paths without changing the process environment. */
export interface IUserStatePathContext {
	readonly environment: NodeJS.ProcessEnv;
	readonly platform: NodeJS.Platform;
	readonly home: string;
	readonly cwd: string;
	/** The directory selected before loading product overrides, when available. */
	readonly userDataPath?: string;
}

/** Resolves the Linux state directory while preserving other platforms' user-data layout. */
export function getUserStatePath(cliArgs: NativeParsedArgs, productName: string, context: IUserStatePathContext = { environment: process.env, platform: process.platform, home: homedir(), cwd: process.env['VSCODE_CWD'] || process.cwd(), userDataPath: getUserDataPath(cliArgs, productName) }): string {
	const userStatePath = doGetUserStatePath(cliArgs, productName, context);
	const pathsToResolve = [userStatePath];

	if (!isAbsolute(userStatePath)) {
		pathsToResolve.unshift(context.cwd);
	}

	return resolve(...pathsToResolve);
}

function doGetUserStatePath(cliArgs: NativeParsedArgs, productName: string, context: IUserStatePathContext): string {
	if (context.platform !== 'linux') {
		return getUserDataPath(cliArgs, productName);
	}

	// 0. Running out of sources has a fixed productName
	if (context.environment.VSCODE_DEV) {
		productName = 'vsebcode-dev';
	}

	// 1. Support portable mode
	const portablePath = context.environment.VSCODE_PORTABLE;
	if (portablePath) {
		return join(portablePath, 'user-state');
	}

	// Preserve explicit user-data isolation and the existing APPDATA-before-CLI precedence.
	const explicitUserDataPath = context.environment.VSCODE_APPDATA
		? join(context.environment.VSCODE_APPDATA, productName)
		: cliArgs['user-data-dir'];
	const selectedUserDataPath = explicitUserDataPath ? resolve(context.cwd, context.userDataPath ?? explicitUserDataPath) : undefined;

	// 2. Support global VSCODE_APPSTATE without sharing retention cleanup between isolated profiles.
	let appStatePath = context.environment.VSCODE_APPSTATE;
	if (appStatePath) {
		const statePath = join(appStatePath, productName);
		return selectedUserDataPath ? join(statePath, 'profiles', createHash('sha256').update(selectedUserDataPath).digest('hex')) : statePath;
	}

	// 3. Keep explicitly isolated logs inside the selected data directory.
	if (selectedUserDataPath) {
		return selectedUserDataPath;
	}

	// 4. Use XDG state paths for the default layout.
	appStatePath = context.environment.XDG_STATE_HOME || join(context.home, '.local', 'state');

	return join(appStatePath, productName);
}
