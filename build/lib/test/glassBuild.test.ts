/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { copyGlassIntoInstalledPackage, needsGlassBuild, type IGlassBuildConfiguration } from '../../npm/glass.ts';

const root = path.resolve(import.meta.dirname, '../../..');

test('the glass module builds on macOS when forced, missing, built for another configuration or older than a source', () => {
	const wanted: IGlassBuildConfiguration = { target: '43.7.7', runtime: 'electron', arch: 'arm64' };
	const fresh = (built: IGlassBuildConfiguration | undefined, force = false, sources = [5, 10]) => needsGlassBuild('darwin', force, 10, sources, built, wanted);

	assert.deepEqual({
		otherPlatforms: ['linux', 'win32'].map(platform => needsGlassBuild(platform as NodeJS.Platform, true, undefined, [1], undefined, wanted)),
		forced: fresh(wanted, true),
		missing: needsGlassBuild('darwin', false, undefined, [5], wanted, wanted),
		sourceChanged: fresh(wanted, false, [5, 11]),
		noRecordedConfiguration: fresh(undefined),
		otherElectron: fresh({ ...wanted, target: '43.6.0' }),
		otherArchitecture: fresh({ ...wanted, arch: 'x64' }),
		upToDate: fresh(wanted),
	}, {
		otherPlatforms: [false, false],
		forced: true,
		missing: true,
		sourceChanged: true,
		noRecordedConfiguration: true,
		otherElectron: true,
		otherArchitecture: true,
		upToDate: false,
	});
});

test('a copied installation of the linked package gets the built binary', () => {
	const rootDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'glass-install-'));
	try {
		const binaryPath = path.join('build', 'Release', 'vsebcode_glass.node');
		fs.mkdirSync(path.join(rootDirectory, 'native', 'glass', 'build', 'Release'), { recursive: true });
		fs.writeFileSync(path.join(rootDirectory, 'native', 'glass', binaryPath), 'binary');
		const installed = path.join(rootDirectory, 'node_modules', '@vsebcode', 'glass');
		const notInstalled = copyGlassIntoInstalledPackage(rootDirectory);

		// Linked, as npm installs a `file:` package by default
		fs.mkdirSync(path.dirname(installed), { recursive: true });
		fs.symlinkSync(path.join('..', '..', 'native', 'glass'), installed);
		const linked = copyGlassIntoInstalledPackage(rootDirectory);

		// Copied, as npm installs it with `install-links`, before the postinstall build
		fs.rmSync(installed);
		fs.mkdirSync(installed);
		fs.writeFileSync(path.join(installed, 'package.json'), '{}');
		const copied = copyGlassIntoInstalledPackage(rootDirectory);

		assert.deepEqual(
			{ notInstalled, linked, copied, installedBinary: fs.readFileSync(path.join(installed, binaryPath), 'utf8') },
			{ notInstalled: false, linked: false, copied: true, installedBinary: 'binary' }
		);
	} finally {
		fs.rmSync(rootDirectory, { recursive: true, force: true });
	}
});

test('npm leaves the glass module to the postinstall build', () => {
	// npm 11 runs the install script of a linked `file:` package neither by default nor once
	// `allowScripts` lists it, so the package must not schedule a node-gyp build of its own
	const manifest = JSON.parse(fs.readFileSync(path.join(root, 'native', 'glass', 'package.json'), 'utf8'));
	assert.deepEqual({ gypfile: manifest.gypfile, scripts: manifest.scripts }, { gypfile: false, scripts: undefined });
});
