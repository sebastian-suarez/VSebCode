/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { execFileSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { suite, test } from 'node:test';
import { checkRemovedSurfaces, isRemovedSurface, parseRemovedSurfaces, parseStagedPaths, removedSurfacesFile } from '../removedSurfaces.ts';

suite('removed surfaces', () => {

	test('parses folders, files, comments and blank lines', () => {
		const surfaces = parseRemovedSurfaces('# comment\r\n\r\nsrc/vs/platform/chat/\n  src/vs/base/common/managedSettings.ts  \n\ncli/\n');
		assert.deepStrictEqual({ folders: surfaces.folders, files: [...surfaces.files] }, {
			folders: ['src/vs/platform/chat/', 'cli/'],
			files: ['src/vs/base/common/managedSettings.ts'],
		});
	});

	test('matches a file exactly and a folder by prefix', () => {
		const surfaces = parseRemovedSurfaces('src/vs/platform/chat/\nsrc/vs/base/common/managedSettings.ts\n');
		assert.deepStrictEqual([
			'src/vs/platform/chat/common/chatSettings.ts',
			'src/vs/platform/chat\\common\\chatSettings.ts',
			'src/vs/platform/chatty/common/x.ts',
			'src/vs/base/common/managedSettings.ts',
			'src/vs/base/common/managedSettings.test.ts',
			'src/vs/base/common/other.ts',
		].map(filePath => isRemovedSurface(surfaces, filePath)), [true, true, false, true, false, false]);
	});

	test('separates staged deletions from the paths still present', () => {
		assert.deepStrictEqual(parseStagedPaths('M\tbuild/removed-surfaces.txt\nD\tsrc/vs/platform/chat/common/chatSettings.ts\nA\tsrc/new.ts\nR100\told.ts\tnew.ts\n'), {
			all: ['build/removed-surfaces.txt', 'src/vs/platform/chat/common/chatSettings.ts', 'src/new.ts', 'new.ts'],
			present: ['build/removed-surfaces.txt', 'src/new.ts', 'new.ts'],
		});
	});

	test('reports the removed surfaces among tracked files and among given paths', () => {
		const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'vsebcode-removed-surfaces-'));
		try {
			const git = (...args: string[]) => execFileSync('git', ['-C', repoRoot, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
			git('init', '-q', '-b', 'main');
			git('config', 'user.email', 'test@example.com');
			git('config', 'user.name', 'Test');
			git('config', 'commit.gpgsign', 'false');
			for (const [file, content] of [
				[removedSurfacesFile, 'src/vs/platform/chat/\nsrc/vs/base/common/managedSettings.ts\n'],
				['src/vs/platform/chat/common/chatSettings.ts', ''],
				['src/vs/platform/keep/keep.ts', ''],
			]) {
				fs.mkdirSync(path.join(repoRoot, path.dirname(file)), { recursive: true });
				fs.writeFileSync(path.join(repoRoot, file), content);
			}
			git('add', '-A');
			git('commit', '-q', '-m', 'init');
			assert.deepStrictEqual({
				tracked: checkRemovedSurfaces(repoRoot),
				givenClean: checkRemovedSurfaces(repoRoot, ['src/vs/platform/keep/keep.ts']),
				givenRemoved: checkRemovedSurfaces(repoRoot, ['src/vs/base/common/managedSettings.ts']),
			}, {
				tracked: `The fork removed these surfaces (see ${removedSurfacesFile}); delete them again instead of bringing them back:\n  src/vs/platform/chat/common/chatSettings.ts`,
				givenClean: undefined,
				givenRemoved: `The fork removed these surfaces (see ${removedSurfacesFile}); delete them again instead of bringing them back:\n  src/vs/base/common/managedSettings.ts`,
			});
		} finally {
			fs.rmSync(repoRoot, { recursive: true, force: true });
		}
	});
});
