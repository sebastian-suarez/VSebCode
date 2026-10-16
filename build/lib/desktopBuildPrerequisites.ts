/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as fs from 'node:fs';
import * as path from 'node:path';
import { getElectronVersion } from './electronVersion.ts';
import { getLinuxToolchainEnvironment, linuxDesktopTargets } from '../linux/desktop-toolchain.ts';

/** Checks custom desktop prerequisites without substituting another architecture or an older runtime. */
export function checkDesktopBuildPrerequisites(platform: string, arch: string, root: string, environment: NodeJS.ProcessEnv = process.env): void {
	const { electronVersion } = getElectronVersion(root);
	if (environment.VSCODE_ELECTRON_VERSION && environment.VSCODE_ELECTRON_VERSION !== electronVersion) {
		throw new Error(`Electron ${electronVersion} is required; VSCODE_ELECTRON_VERSION cannot downgrade or replace the runtime.`);
	}
	if (environment.VSCODE_ELECTRON_TAG && !new RegExp(`^v?${electronVersion.replace(/\./g, '\\.')}([+-]|$)`).test(environment.VSCODE_ELECTRON_TAG)) {
		throw new Error(`VSCODE_ELECTRON_TAG must identify Electron ${electronVersion}.`);
	}
	if (platform !== 'linux' || !['ppc64le', 'riscv64', 'loong64', 's390x'].includes(arch)) {
		return;
	}
	const missing: string[] = [];
	if (!environment.VSCODE_ELECTRON_REPOSITORY) {
		missing.push(`an Electron ${electronVersion} build (set VSCODE_ELECTRON_REPOSITORY and a matching VSCODE_ELECTRON_TAG)`);
	}
	const checksums = environment.VSCODE_ELECTRON_CHECKSUM_FILE;
	if (!checksums || !fs.existsSync(checksums)) {
		missing.push('a trusted checksum file for the custom Electron assets (VSCODE_ELECTRON_CHECKSUM_FILE)');
	}
	if (!environment.VSCODE_CLIENT_SYSROOT_DIR) {
		missing.push('the target compiler and sysroot (VSCODE_CLIENT_SYSROOT_DIR; use build/linux/desktop-toolchain.ts)');
	} else {
		try {
			getLinuxToolchainEnvironment(arch as keyof typeof linuxDesktopTargets, environment.VSCODE_CLIENT_SYSROOT_DIR, environment);
		} catch (error) {
			missing.push(String(error));
		}
	}
	const nativeModules = ['@parcel/watcher', '@vscode/native-watchdog', '@vscodium/native-keymap', '@vscode/spdlog', '@vscode/sqlite3', 'kerberos', 'node-pty'];
	const expectedMachine = linuxDesktopTargets[arch as keyof typeof linuxDesktopTargets].elf;
	const expectedEncoding = arch === 's390x' ? 2 : 1;
	for (const module of nativeModules) {
		const release = path.join(root, 'node_modules', module, 'build', 'Release');
		const binaries = fs.existsSync(release) ? fs.readdirSync(release).filter(name => name.endsWith('.node')) : [];
		if (!binaries.length || binaries.some(name => !isTargetELF(path.join(release, name), expectedMachine, expectedEncoding))) {
			missing.push(`${module} native binaries compiled for linux-${arch}`);
		}
	}
	if (arch === 's390x') {
		missing.push('an os-proxy-resolver native package for s390x');
	}
	const nodeArch = arch === 'ppc64le' ? 'ppc64' : arch;
	const ripgrep = path.join(root, 'node_modules', '@vscode', 'ripgrep-universal', 'bin', `linux-${nodeArch}`, 'rg');
	if (!fs.existsSync(ripgrep) || !isTargetELF(ripgrep, expectedMachine, expectedEncoding)) {
		missing.push(`the linux-${nodeArch} ripgrep binary`);
	}
	if (missing.length) {
		throw new Error(`Desktop build linux-${arch} is blocked: missing ${missing.join('; ')}. The runtime is never downgraded automatically.`);
	}
}

function isTargetELF(filename: string, machine: number, encoding: number): boolean {
	const header = Buffer.alloc(20);
	const descriptor = fs.openSync(filename, 'r');
	try {
		if (fs.readSync(descriptor, header, 0, header.length, 0) !== header.length || header.readUInt32BE(0) !== 0x7f454c46 || header[4] !== 2 || header[5] !== encoding) {
			return false;
		}
		return (header[5] === 1 ? header.readUInt16LE(18) : header.readUInt16BE(18)) === machine;
	} finally {
		fs.closeSync(descriptor);
	}
}
