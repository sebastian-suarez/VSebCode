/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as fs from 'node:fs';
import * as path from 'node:path';
import { spawnSync } from 'node:child_process';
import { getVSCodeSysroot } from './debian/install-sysroot.ts';
import type { DebianArchString } from './debian/types.ts';

/** Desktop build names and the corresponding package and compiler targets. */
export const linuxDesktopTargets = {
	x64: { debian: 'amd64', triple: 'x86_64-linux-gnu', node: 'x64', elf: 62 },
	armhf: { debian: 'armhf', triple: 'arm-rpi-linux-gnueabihf', node: 'arm', elf: 40 },
	arm64: { debian: 'arm64', triple: 'aarch64-linux-gnu', node: 'arm64', elf: 183 },
	ppc64le: { debian: 'ppc64el', triple: 'powerpc64le-linux-gnu', node: 'ppc64', elf: 21 },
	riscv64: { debian: 'riscv64', triple: 'riscv64-linux-gnu', node: 'riscv64', elf: 243 },
	loong64: { debian: 'loong64', triple: 'loongarch64-linux-gnu', node: 'loong64', elf: 258 },
	s390x: { debian: 's390x', triple: 's390x-linux-gnu', node: 's390x', elf: 22 },
} satisfies Record<string, { debian: DebianArchString; triple: string; node: string; elf: number }>;

/** Configures native dependency compilation against an installed desktop compiler/sysroot. */
export function getLinuxToolchainEnvironment(arch: keyof typeof linuxDesktopTargets, directory: string, environment: NodeJS.ProcessEnv = process.env): NodeJS.ProcessEnv {
	const { triple, node } = linuxDesktopTargets[arch];
	const prefix = path.join(directory, triple);
	const sysroot = path.join(prefix, triple, 'sysroot');
	const cc = path.join(prefix, 'bin', `${triple}-gcc`);
	const cxx = path.join(prefix, 'bin', `${triple}-g++`);
	for (const filename of [cc, cxx, sysroot]) {
		if (!fs.existsSync(filename)) {
			throw new Error(`Linux ${arch} toolchain is incomplete: missing ${filename}. Supply a compatible compiler/sysroot through VSCODE_CLIENT_SYSROOT_DIR.`);
		}
	}
	const quote = (value: string) => `'${value.replace(/'/g, `'\\''`)}'`;
	const libraries = [path.join(sysroot, 'usr', 'lib', triple), path.join(sysroot, 'lib', triple)];
	return {
		...environment,
		CC: cc,
		CXX: cxx,
		CXXFLAGS: `--sysroot=${quote(sysroot)}`,
		LDFLAGS: [`--sysroot=${quote(sysroot)}`, ...libraries.map(directory => `-L${quote(directory)}`)].join(' '),
		npm_config_arch: node,
		VSCODE_ARCH: arch,
		VSCODE_CLIENT_SYSROOT_DIR: directory,
	};
}

// Run an explicit command (for example npm install) with the same toolchain used by desktop packaging.
async function main(): Promise<void> {
	const [arch, command, ...args] = process.argv.slice(2);
	if (process.platform !== 'linux' || !Object.hasOwn(linuxDesktopTargets, arch ?? '') || !command) {
		throw new Error('Usage on Linux: node build/linux/desktop-toolchain.ts <architecture> <command> [arguments...]');
	}
	const target = arch as keyof typeof linuxDesktopTargets;
	let directory = process.env['VSCODE_CLIENT_SYSROOT_DIR'];
	if (!directory) {
		const sysroot = await getVSCodeSysroot(linuxDesktopTargets[target].debian);
		directory = path.resolve(sysroot, '..', '..', '..');
	}
	const result = spawnSync(command, args, { stdio: 'inherit', env: getLinuxToolchainEnvironment(target, directory) });
	if (result.error) {
		throw result.error;
	}
	process.exitCode = result.status ?? 1;
}

if (import.meta.main) {
	main().catch(error => {
		console.error(error);
		process.exitCode = 1;
	});
}
