/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { getUserStatePath } from '../../node/userStatePath.js';
import { getRuntimeDirectory } from '../../../../base/parts/ipc/node/ipc.net.js';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../base/test/common/utils.js';

suite('Linux state and runtime paths', () => {
	ensureNoDisposablesAreLeakedInTestSuite();
	test('state paths honor portable, app-state, XDG, defaults and development mode', () => {
		const resolve = (environment: NodeJS.ProcessEnv) => getUserStatePath({ _: [] }, 'VSebCode', { platform: 'linux', environment, home: '/home/test', cwd: '/working' });
		assert.deepStrictEqual([
			resolve({ VSCODE_PORTABLE: '/portable', VSCODE_APPSTATE: '/state', XDG_STATE_HOME: '/xdg' }),
			resolve({ VSCODE_APPSTATE: '/state', XDG_STATE_HOME: '/xdg' }),
			resolve({ XDG_STATE_HOME: '/xdg' }), resolve({}),
			resolve({ VSCODE_DEV: '1', XDG_STATE_HOME: '/xdg' }),
			resolve({ VSCODE_APPSTATE: 'relative' })
		], ['/portable/user-state', '/state/VSebCode', '/xdg/VSebCode', '/home/test/.local/state/VSebCode', '/xdg/vsebcode-dev', '/working/relative/VSebCode']);
	});
	test('Flatpak runtime paths require a runtime root and a valid app ID', () => {
		assert.deepStrictEqual([
			getRuntimeDirectory({ XDG_RUNTIME_DIR: '/run/user/1000', FLATPAK_ID: 'dev.sebastiansuarez.VSebCode' }),
			getRuntimeDirectory({ XDG_RUNTIME_DIR: '/run/user/1000', FLATPAK_ID: '../escape' }),
			getRuntimeDirectory({ XDG_RUNTIME_DIR: '/run/user/1000' }),
			getRuntimeDirectory({ FLATPAK_ID: 'dev.app.Editor' })
		], ['/run/user/1000/app/dev.sebastiansuarez.VSebCode', '/run/user/1000', '/run/user/1000', undefined]);
	});
	test('distinct explicit user-data roots keep concurrent Linux log sessions separate', () => {
		const context = { platform: 'linux' as const, environment: { XDG_STATE_HOME: '/state' }, home: '/home/test', cwd: '/profiles' };
		const first = getUserStatePath({ _: [], 'user-data-dir': './first' }, 'VSebCode', context);
		const second = getUserStatePath({ _: [], 'user-data-dir': '/profiles/second' }, 'VSebCode', context);
		assert.deepStrictEqual([first, second], ['/profiles/first', '/profiles/second']);
		assert.strictEqual(first, getUserStatePath({ _: [], 'user-data-dir': '/profiles/first' }, 'VSebCode', context));
		assert.strictEqual(getUserStatePath({ _: [], 'user-data-dir': '/profiles/second' }, 'VSebCode', { ...context, environment: { VSCODE_PORTABLE: '/portable' } }), '/portable/user-state');
	});
	test('explicit app-data wins over CLI and XDG paths and preserves the pre-override selection', () => {
		const args = { _: [], 'user-data-dir': '/cli' };
		const context = { platform: 'linux' as const, environment: { VSCODE_APPDATA: 'appdata', XDG_STATE_HOME: '/state' }, home: '/unwritable-home', cwd: '/working' };
		assert.deepStrictEqual([
			getUserStatePath(args, 'VSebCode', context),
			getUserStatePath(args, 'Renamed', { ...context, userDataPath: '/working/appdata/VSebCode' }),
			getUserStatePath(args, 'VSebCode', { ...context, environment: { ...context.environment, VSCODE_DEV: '1' } }),
		], ['/working/appdata/VSebCode', '/working/appdata/VSebCode', '/working/appdata/vsebcode-dev']);
	});
	test('explicit app-state overrides isolated data paths while keeping their sessions separate', () => {
		const context = { platform: 'linux' as const, environment: { VSCODE_APPSTATE: '/state' }, home: '/home/test', cwd: '/profiles' };
		const first = getUserStatePath({ _: [], 'user-data-dir': './first' }, 'VSebCode', context);
		const second = getUserStatePath({ _: [], 'user-data-dir': '/profiles/second' }, 'VSebCode', context);
		assert.ok(first.startsWith('/state/VSebCode/profiles/'));
		assert.notStrictEqual(first, second);
		assert.strictEqual(first, getUserStatePath({ _: [], 'user-data-dir': '/profiles/first' }, 'VSebCode', context));
		const appDataContext = { ...context, environment: { ...context.environment, VSCODE_APPDATA: '/appdata' } };
		assert.strictEqual(getUserStatePath({ _: [], 'user-data-dir': '/ignored' }, 'VSebCode', appDataContext), getUserStatePath({ _: [] }, 'VSebCode', appDataContext));
	});
});
