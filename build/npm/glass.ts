/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as child_process from 'child_process';
import * as fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '../..');
const moduleDirectory = path.join(root, 'native', 'glass');
const binary = path.join(moduleDirectory, 'build', 'Release', 'vsebcode_glass.node');
const builtConfigurationFile = path.join(moduleDirectory, 'build', 'vsebcode-glass.json');

/**
 * What a glass binary was built for: a binary built for another Electron or another
 * architecture does not load, whatever its age.
 */
export interface IGlassBuildConfiguration {
	readonly target: string;
	readonly runtime: string;
	readonly arch: string;
}

/**
 * Whether the glass module needs a build: never off macOS, where the main process does not load
 * it; otherwise when forced, when the binary is missing, when it was built for another
 * configuration (or none is recorded) and when a source changed after it.
 */
export function needsGlassBuild(platform: NodeJS.Platform, force: boolean, binaryModified: number | undefined, sourcesModified: readonly number[], built: IGlassBuildConfiguration | undefined, wanted: IGlassBuildConfiguration): boolean {
	if (platform !== 'darwin') {
		return false;
	}

	return force
		|| binaryModified === undefined
		|| built?.target !== wanted.target || built.runtime !== wanted.runtime || built.arch !== wanted.arch
		|| sourcesModified.some(modified => modified > binaryModified);
}

/**
 * Copies the built binary into the installed package when npm copied the linked `file:` package
 * instead of linking it (`install-links`), which it does before the postinstall builds the module,
 * so the copy would lack its entry point. Returns whether it copied.
 */
export function copyGlassIntoInstalledPackage(rootDirectory: string): boolean {
	const sourceDirectory = path.join(rootDirectory, 'native', 'glass');
	let installedDirectory: string;
	try {
		installedDirectory = fs.realpathSync(path.join(rootDirectory, 'node_modules', '@vsebcode', 'glass'));
	} catch {
		return false; // not installed
	}

	if (installedDirectory === fs.realpathSync(sourceDirectory)) {
		return false; // linked: the installed package is the built one
	}

	const relativeBinary = path.join('build', 'Release', 'vsebcode_glass.node');
	fs.mkdirSync(path.dirname(path.join(installedDirectory, relativeBinary)), { recursive: true });
	fs.copyFileSync(path.join(sourceDirectory, relativeBinary), path.join(installedDirectory, relativeBinary));
	return true;
}

function readBuiltConfiguration(): IGlassBuildConfiguration | undefined {
	try {
		const value = JSON.parse(fs.readFileSync(builtConfigurationFile, 'utf8'));
		return typeof value.target === 'string' && typeof value.runtime === 'string' && typeof value.arch === 'string' ? value : undefined;
	} catch {
		return undefined;
	}
}

function modifiedTime(file: string): number | undefined {
	try {
		return fs.statSync(file).mtimeMs;
	} catch {
		return undefined;
	}
}

function getSources(): string[] {
	const sources = [path.join(moduleDirectory, 'binding.gyp')];
	for (const entry of fs.readdirSync(path.join(moduleDirectory, 'src'), { withFileTypes: true, recursive: true })) {
		if (entry.isFile()) {
			sources.push(path.join(entry.parentPath, entry.name));
		}
	}

	return sources;
}

function readNpmrc(file: string): Map<string, string> {
	const values = new Map<string, string>();
	for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
		const match = /^\s*([^#=\s][^=]*?)\s*=\s*"?([^"]*)"?\s*$/.exec(line);
		if (match) {
			values.set(match[1], match[2]);
		}
	}

	return values;
}

/**
 * Builds the in-tree glass module (`native/glass`, linked as `@vsebcode/glass`) against the
 * Electron headers the root `.npmrc` names, with the node-gyp the preinstall step installs in
 * `build/npm/gyp`. npm does not build it: npm 11 runs the install script of a linked `file:`
 * package neither by default nor once `allowScripts` lists it, so its package sets `gypfile: false`
 * and the root postinstall builds it instead. It is built again when its sources change, and when
 * the Electron target or the architecture (`npm_config_arch`, as for an x64 package) differs from
 * the one recorded next to the binary, and copied into the installed package when npm copied it
 * instead of linking it.
 */
export function buildGlass(options: { readonly force?: boolean; readonly log?: (message: string) => void } = {}): void {
	if (process.platform !== 'darwin') {
		return;
	}

	const log = options.log ?? console.log;
	const npmrc = readNpmrc(path.join(root, '.npmrc'));
	const target = npmrc.get('target');
	const runtime = npmrc.get('runtime');
	const distUrl = npmrc.get('disturl');
	if (!target || !runtime || !distUrl) {
		throw new Error('The root .npmrc names no Electron target, runtime and headers URL for the glass module');
	}

	const wanted: IGlassBuildConfiguration = { target, runtime, arch: process.env['npm_config_arch'] || process.arch };
	const sourcesModified = getSources().map(source => modifiedTime(source) ?? Number.POSITIVE_INFINITY);
	if (!needsGlassBuild(process.platform, !!options.force, modifiedTime(binary), sourcesModified, readBuiltConfiguration(), wanted)) {
		log('The glass module is up to date.');
	} else {
		buildBinary(wanted, distUrl);
		log(`Built the glass module for ${runtime} ${target} (${wanted.arch}).`);
	}

	if (copyGlassIntoInstalledPackage(root)) {
		log('Copied the glass module into its installed copy (npm installed the linked package as a copy).');
	}
}

function buildBinary(wanted: IGlassBuildConfiguration, distUrl: string): void {
	const nodeGyp = path.join(import.meta.dirname, 'gyp', 'node_modules', '.bin', 'node-gyp');
	const result = child_process.spawnSync(nodeGyp, ['rebuild', `--target=${wanted.target}`, `--runtime=${wanted.runtime}`, `--dist-url=${distUrl}`, `--arch=${wanted.arch}`], {
		cwd: moduleDirectory,
		encoding: 'utf8',
		env: process.env
	});
	if (result.error || result.status !== 0) {
		throw new Error(`Building the glass module failed${result.error ? `: ${result.error.message}` : ''}\n${result.stdout ?? ''}${result.stderr ?? ''}`);
	}

	fs.writeFileSync(builtConfigurationFile, JSON.stringify(wanted));
}

if (import.meta.main) {
	buildGlass({ force: process.argv.includes('--force') });
}
