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
	const entry = ([key, value]: readonly [string, string]) => `\t"${key}": ${value}`;
	const text = fs.existsSync(settingsPath) ? fs.readFileSync(settingsPath, 'utf8') : '';
	if (!text.trim()) {
		fs.mkdirSync(userDir, { recursive: true });
		fs.writeFileSync(settingsPath, `{\n${SEED_USER_SETTINGS.map(entry).join(',\n')}\n}`);
		return;
	}
	const missing = SEED_USER_SETTINGS.filter(([key]) => !new RegExp(`"${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"\\s*:`).test(text));
	const brace = text.indexOf('{');
	if (missing.length && brace !== -1) {
		fs.writeFileSync(settingsPath, `${text.slice(0, brace + 1)}\n${missing.map(entry).join(',\n')},${text.slice(brace + 1)}`);
	}
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
