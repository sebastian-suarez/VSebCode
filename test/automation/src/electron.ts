/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { join } from 'path';
import * as fs from 'fs';
import type { LaunchOptions } from './code';

const root = join(__dirname, '..', '..', '..');

/**
 * VSebCode changes defaults these smoke tests depend on (docs/plans/ui-step-2-look-defaults.md),
 * so every new profile starts from the upstream values a failing test proved it needs, as
 * `"key": value` pairs; `SettingsEditor.clearUserSettings` restores them, and the settings helpers
 * refuse a seeded key because the seed would silently override the test's own value. No smoke test
 * sets these keys itself. Each entry names the test that needed it.
 */
export const SEED_USER_SETTINGS: ReadonlyArray<readonly [key: string, value: string]> = [
	// "Preferences" > "turns off editor line numbers and verifies the live change": selectTab clicks
	// the settings.json tab.
	['workbench.editor.showTabs', '"multiple"'],
	// "Data Loss" > "verifies opened editors are restored": "View: Keep Editor" only exists while
	// preview editors are enabled.
	['workbench.editor.enablePreview', 'true'],
];

/**
 * Writes the seed one entry per line below a lone `{`, so the first line, where the settings helpers
 * type, stays as short as in an empty settings file. An existing file keeps its text, comments and
 * trailing commas included: a test may write its own settings before the launch, and a relaunch finds
 * the JSONC the tests typed, so only the seed entries whose key is missing are inserted after its `{`.
 */
function seedUserSettings(userDataDir: string): void {
	const userDir = join(userDataDir, 'User');
	const settingsPath = join(userDir, 'settings.json');
	const text = fs.existsSync(settingsPath) ? fs.readFileSync(settingsPath, 'utf8') : '';
	const seeded = seedSettingsText(text);
	if (seeded !== undefined) {
		fs.mkdirSync(userDir, { recursive: true });
		fs.writeFileSync(settingsPath, seeded);
	}
}

/**
 * Returns the settings text with the missing seed entries inserted after the `{` of its top-level
 * object, or `undefined` when nothing has to change or the text does not hold an object. Comments and
 * strings are skipped, so a commented-out key does not count as present and a `{` inside a comment is
 * not taken for the object's.
 */
export function seedSettingsText(text: string): string | undefined {
	const entry = ([key, value]: readonly [string, string]) => `\t"${key}": ${value}`;
	if (!text.trim()) {
		return `{\n${SEED_USER_SETTINGS.map(entry).join(',\n')}\n}`;
	}
	const object = readTopLevelObject(text);
	if (!object) {
		return undefined;
	}
	const missing = SEED_USER_SETTINGS.filter(([key]) => !object.keys.has(key));
	if (!missing.length) {
		return undefined;
	}
	return `${text.slice(0, object.afterBrace)}\n${missing.map(entry).join(',\n')},${text.slice(object.afterBrace)}`;
}

/**
 * Reads the top-level object of a JSONC text: the offset just after its `{` and the names of its own
 * properties, ignoring comments, strings and nested values. `undefined` when the text does not start
 * with an object.
 */
function readTopLevelObject(text: string): { afterBrace: number; keys: Set<string> } | undefined {
	let offset = skipTrivia(text, 0);
	if (text[offset] !== '{') {
		return undefined;
	}
	const afterBrace = offset + 1;
	const keys = new Set<string>();
	let depth = 0;
	while (offset < text.length) {
		offset = skipTrivia(text, offset);
		const char = text[offset];
		if (char === '"') {
			const end = skipString(text, offset);
			if (depth === 1 && text[skipTrivia(text, end)] === ':') {
				try {
					keys.add(JSON.parse(text.slice(offset, end)));
				} catch {
					// a malformed key cannot be a seed key
				}
			}
			offset = end;
			continue;
		}
		if (char === '{' || char === '[') {
			depth++;
		} else if (char === '}' || char === ']') {
			depth--;
			if (depth === 0) {
				break;
			}
		}
		offset++;
	}
	return { afterBrace, keys };
}

/** Skips whitespace and JSONC comments from `offset` and returns the next significant offset. */
function skipTrivia(text: string, offset: number): number {
	while (offset < text.length) {
		if (/\s/.test(text[offset])) {
			offset++;
		} else if (text.startsWith('//', offset)) {
			const end = text.indexOf('\n', offset);
			offset = end === -1 ? text.length : end + 1;
		} else if (text.startsWith('/*', offset)) {
			const end = text.indexOf('*/', offset + 2);
			offset = end === -1 ? text.length : end + 2;
		} else {
			break;
		}
	}
	return offset;
}

/** Returns the offset just after the JSON string whose opening quote is at `offset`. */
function skipString(text: string, offset: number): number {
	let end = offset + 1;
	while (end < text.length && text[end] !== '"') {
		end += text[end] === '\\' ? 2 : 1;
	}
	return end + 1;
}

export interface IElectronConfiguration {
	readonly electronPath: string;
	readonly args: string[];
	readonly env?: NodeJS.ProcessEnv;
}

export async function resolveElectronConfiguration(options: LaunchOptions): Promise<IElectronConfiguration> {
	const { codePath, workspacePath, extensionsPath, userDataDir, logsPath, crashesPath, extraArgs, extraEnv } = options;
	const env = { ...process.env };

	const args: string[] = [
		'--skip-welcome',
		'--disable-telemetry',
		'--disable-experiments',
		'--no-cached-data',
		'--disable-extension=vscode.vscode-api-tests',
		`--crash-reporter-directory=${crashesPath}`,
		'--disable-workspace-trust',
		`--logsPath=${logsPath}`
	];

	// Only add workspace path if provided
	if (workspacePath) {
		args.unshift(workspacePath);
	}

	if (options.useInMemorySecretStorage) {
		args.push('--use-inmemory-secretstorage');
	}
	if (userDataDir) {
		args.push(`--user-data-dir=${userDataDir}`);
		seedUserSettings(userDataDir);
	}
	if (extensionsPath) {
		args.push(`--extensions-dir=${extensionsPath}`);
	}
	if (options.verbose) {
		args.push('--verbose');
	}
	if (options.extensionDevelopmentPath) {
		args.push(`--extensionDevelopmentPath=${options.extensionDevelopmentPath}`);
	}

	if (!codePath) {
		args.unshift(options.sourceAppRoot ?? root);
	}

	if (extraArgs) {
		args.push(...extraArgs);
	}

	// Apply extraEnv last so caller-provided env truly has final precedence
	// over the inherited environment.
	if (extraEnv) {
		for (const [key, value] of Object.entries(extraEnv)) {
			if (value === undefined) {
				delete env[key];
			} else {
				env[key] = value;
			}
		}
	}

	const electronPath = codePath ? getBuildElectronPath(codePath) : getDevElectronPath();

	return {
		env,
		args,
		electronPath
	};
}

function findFilePath(root: string, path: string): string {
	// First check if the path exists directly in the root
	const directPath = join(root, path);
	if (fs.existsSync(directPath)) {
		return directPath;
	}

	// If not found directly, search through subdirectories
	const entries = fs.readdirSync(root, { withFileTypes: true });

	for (const entry of entries) {
		if (entry.isDirectory()) {
			const found = join(root, entry.name, path);
			if (fs.existsSync(found)) {
				return found;
			}
		}
	}

	throw new Error(`Could not find ${path} in any subdirectory`);
}

function parseVersion(version: string) {
	const match = /^(\d+)\.(\d+)\.(\d+)/.exec(version);
	if (!match) {
		throw new Error(`Invalid version string: ${version}`);
	}
	const [, major, minor, patch] = match;
	return { major: parseInt(major), minor: parseInt(minor), patch: parseInt(patch) };
}

export function getDevElectronPath(): string {
	const buildPath = join(root, '.build');
	const product = require(join(root, 'product.json'));

	switch (process.platform) {
		case 'darwin':
			return join(buildPath, 'electron', `${product.nameLong}.app`, 'Contents', 'MacOS', `${product.nameShort}`);
		case 'linux':
			return join(buildPath, 'electron', `${product.applicationName}`);
		case 'win32':
			return join(buildPath, 'electron', `${product.nameShort}.exe`);
		default:
			throw new Error('Unsupported platform.');
	}
}

export function getBuildElectronPath(root: string): string {
	switch (process.platform) {
		case 'darwin': {
			const packageJson = require(join(root, 'Contents', 'Resources', 'app', 'package.json'));
			const product = require(join(root, 'Contents', 'Resources', 'app', 'product.json'));
			const { major, minor } = parseVersion(packageJson.version);
			// For macOS builds using the legacy Electron binary name, versions up to and including
			// 1.109.x ship the executable as "Electron". From later versions onward, the executable
			// is renamed to match product.nameShort. This check preserves compatibility with older
			// builds; update the cutoff here only if the binary naming scheme changes again.
			if (major === 1 && minor <= 109) {
				return join(root, 'Contents', 'MacOS', 'Electron');
			} else {
				return join(root, 'Contents', 'MacOS', product.nameShort);
			}
		}
		case 'linux': {
			const product = require(join(root, 'resources', 'app', 'product.json'));
			return join(root, product.applicationName);
		}
		case 'win32': {
			const productPath = findFilePath(root, join('resources', 'app', 'product.json'));
			const product = require(productPath);
			return join(root, `${product.nameShort}.exe`);
		}
		default:
			throw new Error('Unsupported platform.');
	}
}

export function getBuildProductPath(root: string): string {
	switch (process.platform) {
		case 'darwin':
			return join(root, 'Contents', 'Resources', 'app', 'product.json');
		case 'win32':
			// On Windows the built app may nest the payload inside a subdirectory
			// (e.g. VSCode-win32-x64), so search for product.json rather than
			// assuming it lives directly under the root.
			return findFilePath(root, join('resources', 'app', 'product.json'));
		default:
			return join(root, 'resources', 'app', 'product.json');
	}
}

export function getBuildVersion(root: string): string {
	switch (process.platform) {
		case 'darwin':
			return require(join(root, 'Contents', 'Resources', 'app', 'package.json')).version;
		case 'win32': {
			const packagePath = findFilePath(root, join('resources', 'app', 'package.json'));
			return require(packagePath).version;
		}
		default:
			return require(join(root, 'resources', 'app', 'package.json')).version;
	}
}
