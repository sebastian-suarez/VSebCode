/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as fs from 'fs';
import { gracefulify } from 'graceful-fs';
import * as cp from 'child_process';
import * as path from 'path';
import * as os from 'os';
import minimist from 'minimist';
import { Quality, MultiLogger, Logger, ConsoleLogger, FileLogger, measureAndLog, getDevElectronPath, getBuildElectronPath, getBuildVersion, ApplicationOptions } from '../../automation';

import { setup as setupDataLossTests } from './areas/workbench/data-loss.test';
import { setup as setupPreferencesTests } from './areas/preferences/preferences.test';
import { setup as setupSearchTests } from './areas/search/search.test';
import { setup as setupNotebookTests } from './areas/notebook/notebook.test';
import { setup as setupLanguagesTests } from './areas/languages/languages.test';
import { setup as setupStatusbarTests } from './areas/statusbar/statusbar.test';
import { setup as setupExtensionTests } from './areas/extensions/extensions.test';
import { setup as setupExtensionHostRestartTests } from './areas/extensions/extension-host-restart.test';
import { setup as setupMultirootTests } from './areas/multiroot/multiroot.test';
import { setup as setupLocalizationTests } from './areas/workbench/localization.test';
import { setup as setupLaunchTests } from './areas/workbench/launch.test';
import { setup as setupTerminalTests } from './areas/terminal/terminal.test';
import { setup as setupTaskTests } from './areas/task/task.test';
import { setup as setupAccessibilityTests } from './areas/accessibility/accessibility.test';
import { setup as setupBrowserViewTests } from './areas/browserView/browserView.test';
import { setup as setupPolicyTests } from './areas/policy/policy.test';

const rootPath = path.join(__dirname, '..', '..', '..');

const [, , ...args] = process.argv;
const opts = minimist(args, {
	string: [
		'build',
		'stable-build',
		'wait-time',
		'test-repo',
		'electronArgs'
	],
	boolean: [
		'verbose',
		'tracing',
		'skip-stable-build'
	],
	default: {
		verbose: false
	}
}) as {
	verbose?: boolean;
	tracing?: boolean;
	'skip-stable-build'?: boolean;
	build?: string;
	'stable-build'?: string;
	electronArgs?: string;
};

const logsRootPath = path.join(rootPath, '.build', 'logs', 'smoke-tests-electron');
const crashesRootPath = path.join(rootPath, '.build', 'crashes', 'smoke-tests-electron');

const logger = createLogger();

function createLogger(): Logger {
	const loggers: Logger[] = [];

	// Log to console if verbose
	if (opts.verbose) {
		loggers.push(new ConsoleLogger());
	}

	// Prepare logs rot path
	fs.rmSync(logsRootPath, { recursive: true, force: true, maxRetries: 10, retryDelay: 1000 });
	fs.mkdirSync(logsRootPath, { recursive: true });

	// Always log to log file
	loggers.push(new FileLogger(path.join(logsRootPath, 'smoke-test-runner.log')));

	return new MultiLogger(loggers);
}

try {
	gracefulify(fs);
} catch (error) {
	logger.log(`Error enabling graceful-fs: ${error}`);
}

function getTmpDir(): string {
	const tmpDir = os.tmpdir();
	if (process.platform === 'win32') {
		try {
			return fs.realpathSync.native(tmpDir);
		} catch {
			// ignore and fall back to the short path
		}
	}
	return tmpDir;
}

const testDataPath = path.join(getTmpDir(), 'vscsmoke-electron');
if (fs.existsSync(testDataPath)) {
	fs.rmSync(testDataPath, { recursive: true, force: true, maxRetries: 10, retryDelay: 1000 });
}
fs.mkdirSync(testDataPath, { recursive: true });
process.once('exit', () => {
	try {
		fs.rmSync(testDataPath, { recursive: true, force: true, maxRetries: 10, retryDelay: 1000 });
	} catch {
		// noop
	}
});

const testRepoUrl = 'https://github.com/microsoft/vscode-smoketest-express';
const workspacePath = path.join(testDataPath, `vscode-smoketest-express`);
const extensionsPath = path.join(testDataPath, 'extensions-dir');
fs.mkdirSync(extensionsPath, { recursive: true });

function fail(errorMessage): void {
	logger.log(errorMessage);
	if (!opts.verbose) {
		console.error(errorMessage);
	}
	process.exit(1);
}

let version: string | undefined;

function parseVersion(version: string): { major: number; minor: number; patch: number } {
	const [, major, minor, patch] = /^(\d+)\.(\d+)\.(\d+)/.exec(version)!;
	return { major: parseInt(major), minor: parseInt(minor), patch: parseInt(patch) };
}

function parseQuality(): Quality {
	if (process.env.VSCODE_DEV === '1') {
		return Quality.Dev;
	}

	const quality = process.env.VSCODE_QUALITY ?? '';

	switch (quality) {
		case 'stable':
			return Quality.Stable;
		case 'insider':
			return Quality.Insiders;
		case 'exploration':
			return Quality.Exploration;
		case 'oss':
			return Quality.OSS;
		default:
			return Quality.Dev;
	}
}

//
// #### Electron Smoke Tests ####
//
const testCodePath = opts.build;
let electronPath: string;

if (testCodePath) {
	electronPath = getBuildElectronPath(testCodePath);
	version = getBuildVersion(testCodePath);
} else {
	electronPath = getDevElectronPath();
	process.env.VSCODE_REPOSITORY = rootPath;
	process.env.VSCODE_DEV = '1';
	process.env.VSCODE_CLI = '1';
}

if (!fs.existsSync(electronPath)) {
	fail(`Cannot find VSCode at ${electronPath}. Please run VSCode once first (scripts/code.sh, scripts\\code.bat) and try again.`);
}

const quality = parseQuality();
logger.log(`Running desktop smoke tests against ${electronPath}`);
logger.log(`VS Code product quality: ${quality}.`);

const userDataDir = path.join(testDataPath, 'd');

async function setupRepository(): Promise<void> {
	if (opts['test-repo']) {
		logger.log('Copying test project repository:', opts['test-repo']);
		fs.rmSync(workspacePath, { recursive: true, force: true, maxRetries: 10, retryDelay: 1000 });
		// not platform friendly
		if (process.platform === 'win32') {
			cp.execSync(`xcopy /E "${opts['test-repo']}" "${workspacePath}"\\*`);
		} else {
			cp.execSync(`cp -R "${opts['test-repo']}" "${workspacePath}"`);
		}
	} else {
		if (!fs.existsSync(workspacePath)) {
			logger.log('Cloning test project repository...');
			const res = cp.spawnSync('git', ['clone', testRepoUrl, workspacePath], { stdio: 'inherit' });
			if (!fs.existsSync(workspacePath)) {
				throw new Error(`Clone operation failed: ${res.stderr.toString()}`);
			}
		} else {
			logger.log('Cleaning test project repository...');
			cp.spawnSync('git', ['fetch'], { cwd: workspacePath, stdio: 'inherit' });
			cp.spawnSync('git', ['reset', '--hard', 'FETCH_HEAD'], { cwd: workspacePath, stdio: 'inherit' });
			cp.spawnSync('git', ['clean', '-xdf'], { cwd: workspacePath, stdio: 'inherit' });
		}
	}
}

async function ensureStableCode(): Promise<void> {
	const stableCodePath = opts['stable-build'];
	if (!stableCodePath) {
		logger.log('No --stable-build given, skipping the migration tests');
		return;
	}

	if (!fs.existsSync(stableCodePath)) {
		throw new Error(`Cannot find Stable VSCode at ${stableCodePath}.`);
	}

	logger.log(`Using stable build ${stableCodePath} for migration tests`);

	opts['stable-version'] = parseVersion(getBuildVersion(stableCodePath));
}

async function setup(): Promise<void> {
	logger.log('Test data path:', testDataPath);
	logger.log('Preparing smoketest setup...');

	if (opts.build && !opts['skip-stable-build']) {
		await measureAndLog(() => ensureStableCode(), 'ensureStableCode', logger);
	}
	await measureAndLog(() => setupRepository(), 'setupRepository', logger);

	for (const extension of ['vscode-smoketest-ext-host', 'vscode-smoketest-language-pack-de']) {
		const smokeExtensionPath = path.join(rootPath, 'test', 'smoke', 'extensions', extension);
		const destination = path.join(extensionsPath, extension);
		if (fs.existsSync(destination)) {
			fs.rmSync(destination, { recursive: true, force: true });
		}
		fs.cpSync(smokeExtensionPath, destination, { recursive: true });
	}

	logger.log('Smoketest setup done!\n');
}

// Before all tests run setup
before(async function () {
	this.timeout(5 * 60 * 1000); // increase since we clone the test repository

	const options: ApplicationOptions = {
		quality,
		version: parseVersion(version ?? '0.0.0'),
		codePath: opts.build,
		workspacePath,
		userDataDir,
		useInMemorySecretStorage: true,
		extensionsPath,
		logger,
		logsPath: path.join(logsRootPath, 'suite_unknown'),
		crashesPath: path.join(crashesRootPath, 'suite_unknown'),
		verbose: opts.verbose,
		tracing: opts.tracing || !!process.env.BUILD_ARTIFACTSTAGINGDIRECTORY || !!process.env.GITHUB_WORKSPACE,
		extraArgs: (opts.electronArgs || '').split(' ').map(arg => arg.trim()).filter(arg => !!arg)
	};
	this.defaultOptions = options;

	await setup();
});

// After main suite (after all tests)
after(async function () {
	try {
		await measureAndLog(async () => {
			fs.rmSync(testDataPath, { recursive: true, force: true, maxRetries: 10, retryDelay: 1000 });
		}, 'rimraf(testDataPath)', logger);
	} catch (error) {
		logger.log(`Unable to delete smoke test workspace: ${error}. This indicates some process is locking the workspace folder.`);
	}
});

describe('VSCode Smoke Tests (Electron)', () => {
	setupDataLossTests(() => { return { stableCodePath: opts['stable-build'], stableCodeVersion: opts['stable-version'] } /* Do not change, deferred for a reason! */; }, logger);
	setupPreferencesTests(logger);
	setupSearchTests(logger);
	setupNotebookTests(logger);
	setupLanguagesTests(logger);
	setupTerminalTests(logger);
	setupTaskTests(logger);
	setupStatusbarTests(logger);
	if (quality !== Quality.Dev && quality !== Quality.OSS) { setupExtensionTests(logger); }
	setupExtensionHostRestartTests(logger);
	setupMultirootTests(logger);
	if (quality !== Quality.Dev && quality !== Quality.OSS) { setupLocalizationTests(logger); }
	setupLaunchTests(logger);
	setupBrowserViewTests(logger);
	// Native policy fixtures modify OS state outside the test profile; opt in only on disposable runners so you don't break your own machine.
	if (process.env.VSCODE_SMOKE_TEST_POLICY === '1') { setupPolicyTests(logger); }
	setupAccessibilityTests(logger);
});
