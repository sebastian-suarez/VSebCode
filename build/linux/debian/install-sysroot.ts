/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { spawnSync, execFileSync } from 'child_process';
import { tmpdir } from 'os';
import fs from 'fs';
import path from 'path';
import { download } from '../../lib/download.ts';
import { getElectronVersion } from '../../lib/electronVersion.ts';
import type { DebianArchString } from './types.ts';

// Based on https://source.chromium.org/chromium/chromium/src/+/main:build/linux/sysroot_scripts/install-sysroot.py.
const URL_PREFIX = 'https://msftelectronbuild.z5.web.core.windows.net';
const URL_PATH = 'sysroots/toolchain';
const REPO_ROOT = path.dirname(path.dirname(path.dirname(import.meta.dirname)));

const ghApiHeaders: Record<string, string> = {
	Accept: 'application/vnd.github.v3+json',
	'User-Agent': 'VSCode Build',
};

if (process.env.GITHUB_TOKEN) {
	ghApiHeaders.Authorization = 'Basic ' + Buffer.from(process.env.GITHUB_TOKEN).toString('base64');
}

const ghDownloadHeaders = {
	...ghApiHeaders,
	Accept: 'application/octet-stream',
};

interface IFetchOptions {
	assetName: string;
	checksumSha256?: string;
	dest: string;
}

function getVSCodeSysrootChecksum(expectedName: string) {
	const checksums = fs.readFileSync(path.join(REPO_ROOT, 'build', 'checksums', 'vscode-sysroot.txt'), 'utf8');
	for (const line of checksums.split('\n')) {
		const [checksum, name] = line.split(/\s+/);
		if (name === expectedName) {
			return checksum;
		}
	}
	return undefined;
}

/*
 * Do not use the fetch implementation from build/lib/fetch as it relies on vinyl streams
 * and vinyl-fs breaks the symlinks in the compiler toolchain sysroot. We use the native
 * tar implementation for that reason.
 */
async function fetchUrl(options: IFetchOptions): Promise<void> {
	const version = '20260212-405735';
	const repository = process.env['VSCODE_SYSROOT_REPOSITORY'] ?? 'Microsoft/vscode-linux-build-agent';
	const actualVersion = process.env['VSCODE_SYSROOT_VERSION'] ?? version;
	const releaseUrl = `https://api.github.com/repos/${repository}/releases/tags/v${actualVersion}`;
	const downloadOptions = {
		attempts: 11,
		onRetry: (error: Error) => console.log(`Fetching failed: ${error}`)
	};
	const releaseContents = await download(releaseUrl, { ...downloadOptions, headers: ghApiHeaders });
	const asset = JSON.parse(Buffer.from(releaseContents).toString()).assets.find((a: { name: string }) => a.name === options.assetName);
	if (!asset) {
		throw new Error(`Could not find asset in release of ${repository} @ ${actualVersion}`);
	}

	console.log(`Found asset ${options.assetName} @ ${asset.url}.`);
	const assetContents = Buffer.from(await download(asset.url, {
		...downloadOptions,
		headers: ghDownloadHeaders,
		checksumSha256: options.checksumSha256
	}));
	console.log(`Fetched response body buffer: ${assetContents.byteLength} bytes`);
	console.log(`Verified SHA256 checksums match for ${asset.url}`);
	execFileSync('tar', ['-xz', '-C', options.dest], { input: assetContents });
	console.log('Fetch complete!');
}

type SysrootDictEntry = {
	Sha256Sum: string;
	SysrootDir: string;
	Tarball: string;
};

export async function getVSCodeSysroot(arch: DebianArchString, isMusl: boolean = false): Promise<string> {
	let expectedName: string;
	let triple: string;
	const prefix = process.env['VSCODE_SYSROOT_PREFIX'] ?? '-glibc-2.28-gcc-10.5.0';
	switch (arch) {
		case 'amd64':
			expectedName = `x86_64-linux-gnu${prefix}.tar.gz`;
			triple = 'x86_64-linux-gnu';
			break;
		case 'arm64':
			if (isMusl) {
				expectedName = 'aarch64-linux-musl-gcc-10.3.0.tar.gz';
				triple = 'aarch64-linux-musl';
			} else {
				expectedName = `aarch64-linux-gnu${prefix}.tar.gz`;
				triple = 'aarch64-linux-gnu';
			}
			break;
		case 'armhf':
			expectedName = `arm-rpi-linux-gnueabihf${prefix}.tar.gz`;
			triple = 'arm-rpi-linux-gnueabihf';
			break;
		case 'ppc64le':
		case 'ppc64el':
			expectedName = `powerpc64le-linux-gnu${prefix}.tar.gz`;
			triple = `powerpc64le-linux-gnu`;
			break;
		case 'riscv64':
			expectedName = `riscv64-linux-gnu${prefix}.tar.gz`;
			triple = 'riscv64-linux-gnu';
			break;
		case 'loong64':
			expectedName = `loongarch64-linux-gnu${prefix}.tar.gz`;
			triple = 'loongarch64-linux-gnu';
			break;
		case 's390x':
			expectedName = `s390x-linux-gnu${prefix}.tar.gz`;
			triple = 's390x-linux-gnu';
			break;
	}
	console.log(`Fetching ${expectedName} for ${triple}`);
	const checksumSha256 = process.env['VSCODE_SYSROOT_SHA256'] ?? getVSCodeSysrootChecksum(expectedName);
	if (checksumSha256 && !/^[a-f0-9]{64}$/i.test(checksumSha256)) {
		throw new Error('VSCODE_SYSROOT_SHA256 must be a SHA256 digest.');
	}
	if (!checksumSha256) {
		throw new Error(`Could not find checksum for ${expectedName}`);
	}
	const sysroot = process.env['VSCODE_SYSROOT_DIR'] ?? path.join(tmpdir(), `vscode-${arch}-sysroot`);
	const stamp = path.join(sysroot, '.stamp');
	const cacheIdentity = JSON.stringify({
		repository: process.env['VSCODE_SYSROOT_REPOSITORY'] ?? 'Microsoft/vscode-linux-build-agent',
		version: process.env['VSCODE_SYSROOT_VERSION'] ?? '20260212-405735',
		asset: expectedName, checksumSha256
	});
	let result = `${sysroot}/${triple}/${triple}/sysroot`;
	if (isMusl) {
		result = `${sysroot}/output/${triple}`;
	}
	if (fs.existsSync(stamp) && fs.readFileSync(stamp).toString() === cacheIdentity && fs.existsSync(result)) {
		return result;
	}
	console.log(`Installing ${arch} root image: ${sysroot}`);
	fs.rmSync(sysroot, { recursive: true, force: true });
	fs.mkdirSync(sysroot, { recursive: true });
	await fetchUrl({
		checksumSha256,
		assetName: expectedName,
		dest: sysroot
	});
	fs.writeFileSync(stamp, cacheIdentity);
	return result;
}

/** Validates custom manifest paths before any cached directory is removed or written. */
export function getChromiumSysrootPaths(entry: unknown, cacheRoot: string): { sysroot: string; tarball: string; checksum: string } {
	if (!entry || typeof entry !== 'object') {
		throw new Error('Invalid Chromium sysroot manifest entry.');
	}
	const value = entry as Partial<SysrootDictEntry>;
	const safeName = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;
	if (typeof value.SysrootDir !== 'string' || !safeName.test(value.SysrootDir) || typeof value.Tarball !== 'string' || !safeName.test(value.Tarball) || typeof value.Sha256Sum !== 'string' || !/^[a-f0-9]{64}$/i.test(value.Sha256Sum)) {
		throw new Error('Invalid Chromium sysroot manifest: directory and archive must be plain filenames, with a SHA256 checksum.');
	}
	const sysroot = path.join(cacheRoot, value.SysrootDir);
	if ([cacheRoot, sysroot].some(directory => fs.lstatSync(directory, { throwIfNoEntry: false })?.isSymbolicLink())) {
		throw new Error('Chromium sysroot cache directories must not be symbolic links.');
	}
	return { sysroot, tarball: path.join(sysroot, value.Tarball), checksum: value.Sha256Sum.toLowerCase() };
}

/** Downloads and verifies a Chromium sysroot, allowing isolated environment/cache inputs for callers. */
export async function getChromiumSysroot(arch: DebianArchString, environment: NodeJS.ProcessEnv = process.env, temporaryDirectory: string = tmpdir()): Promise<string> {
	const sysrootJSONUrl = environment['VSCODE_CHROMIUM_SYSROOTS_URL'] ?? `https://raw.githubusercontent.com/electron/electron/v${getElectronVersion().electronVersion}/script/sysroots.json`;
	const manifestDirectory = fs.mkdtempSync(path.join(temporaryDirectory, 'vscode-sysroots-manifest-'));
	const sysrootDictLocation = path.join(manifestDirectory, 'sysroots.json');
	let sysrootInfo: Record<string, unknown>;
	try {
		const result = spawnSync('curl', ['--fail', '--location', '--retry', '2', sysrootJSONUrl, '-o', sysrootDictLocation]);
		if (result.status !== 0) {
			throw new Error('Cannot retrieve sysroots.json. Stderr:\n' + result.stderr);
		}
		sysrootInfo = JSON.parse(fs.readFileSync(sysrootDictLocation, 'utf8'));
		if (!sysrootInfo || typeof sysrootInfo !== 'object' || Array.isArray(sysrootInfo)) {
			throw new Error('Invalid Chromium sysroots manifest.');
		}
	} finally {
		fs.rmSync(manifestDirectory, { recursive: true, force: true });
	}
	const sysrootArch = `bullseye_${arch}`;
	const sysrootDict = sysrootInfo[sysrootArch];
	if (!sysrootDict) {
		throw new Error(`No Chromium sysroot for ${arch} at Electron ${getElectronVersion().electronVersion}. Supply a compatible sysroots manifest through VSCODE_CHROMIUM_SYSROOTS_URL.`);
	}
	const cacheRoot = path.join(temporaryDirectory, 'vscode-chromium-sysroots');
	const { sysroot, tarball, checksum: tarballSha } = getChromiumSysrootPaths(sysrootDict, cacheRoot);
	const url = [environment['VSCODE_CHROMIUM_SYSROOTS_BASE_URL'] ?? `${URL_PREFIX}/${URL_PATH}`, tarballSha].join('/');
	const stamp = path.join(sysroot, '.stamp');
	if (fs.existsSync(stamp) && fs.readFileSync(stamp).toString() === url) {
		return sysroot;
	}

	console.log(`Installing Debian ${arch} root image: ${sysroot}`);
	fs.rmSync(sysroot, { recursive: true, force: true });
	fs.mkdirSync(sysroot, { recursive: true });
	console.log(`Downloading ${url}`);
	const contents = await download(url, {
		attempts: 3,
		timeout: 5 * 60_000,
		checksumSha256: tarballSha,
		onRetry: error => console.error(`Encountered an error during the download attempt: ${error.message}`)
	});
	fs.writeFileSync(tarball, contents);

	const proc = spawnSync('tar', ['xf', tarball, '-C', sysroot]);
	if (proc.status) {
		throw new Error('Tarball extraction failed with code ' + proc.status);
	}
	fs.rmSync(tarball);
	fs.writeFileSync(stamp, url);
	return sysroot;
}
