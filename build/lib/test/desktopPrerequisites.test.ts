/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';
import { checkDesktopBuildPrerequisites } from '../desktopBuildPrerequisites.ts';
import { getLinuxToolchainEnvironment, linuxDesktopTargets } from '../../linux/desktop-toolchain.ts';
import { findSignTool } from '../win32SignTool.ts';

const root = path.resolve(import.meta.dirname, '../../..');

test('desktop targets never silently accept a different Electron runtime', () => {
	assert.throws(() => checkDesktopBuildPrerequisites('darwin', 'arm64', root, { VSCODE_ELECTRON_VERSION: '41.0.3' }), /required/);
	assert.throws(() => checkDesktopBuildPrerequisites('linux', 'ppc64le', root, { VSCODE_ELECTRON_TAG: 'v41.0.3' }), /must identify/);
	assert.doesNotThrow(() => checkDesktopBuildPrerequisites('darwin', 'arm64', root, {}));
	for (const arch of ['ppc64le', 'riscv64', 'loong64', 's390x']) {
		assert.throws(() => checkDesktopBuildPrerequisites('linux', arch, root, {}), /blocked: missing.*Electron 43\.7\.7/);
	}
});

test('toolchain environment maps every extra target to its compiler and sysroot', () => {
	const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-toolchain-'));
	try {
		for (const arch of ['ppc64le', 'riscv64', 'loong64', 's390x'] as const) {
			const { triple, node } = linuxDesktopTargets[arch];
			const prefix = path.join(temporary, triple);
			fs.mkdirSync(path.join(prefix, 'bin'), { recursive: true });
			fs.mkdirSync(path.join(prefix, triple, 'sysroot'), { recursive: true });
			for (const compiler of ['gcc', 'g++']) {
				fs.writeFileSync(path.join(prefix, 'bin', `${triple}-${compiler}`), '');
			}
			const environment = getLinuxToolchainEnvironment(arch, temporary, { RETAINED: 'yes' });
			assert.deepStrictEqual([environment.CC, environment.CXX, environment.npm_config_arch, environment.RETAINED], [path.join(prefix, 'bin', `${triple}-gcc`), path.join(prefix, 'bin', `${triple}-g++`), node, 'yes']);
		}
		assert.throws(() => getLinuxToolchainEnvironment('x64', temporary, {}), /incomplete/);
	} finally {
		fs.rmSync(temporary, { recursive: true, force: true });
	}
});

test('extra targets reject wrong ELF word size, byte order and ripgrep architecture', () => {
	const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-elf-'));
	try {
		fs.copyFileSync(path.join(root, '.npmrc'), path.join(temporary, '.npmrc'));
		const checksum = path.join(temporary, 'checksums');
		fs.writeFileSync(checksum, 'fixture');
		const triple = linuxDesktopTargets.ppc64le.triple;
		const prefix = path.join(temporary, 'toolchain', triple);
		fs.mkdirSync(path.join(prefix, 'bin'), { recursive: true });
		fs.mkdirSync(path.join(prefix, triple, 'sysroot'), { recursive: true });
		for (const compiler of ['gcc', 'g++']) {
			fs.writeFileSync(path.join(prefix, 'bin', `${triple}-${compiler}`), '');
		}
		const header = Buffer.alloc(20);
		header.writeUInt32BE(0x7f454c46);
		header[4] = 2;
		header[5] = 1;
		header.writeUInt16LE(21, 18);
		for (const module of ['@parcel/watcher', '@vscode/native-watchdog', '@vscodium/native-keymap', '@vscode/spdlog', '@vscode/sqlite3', 'kerberos', 'node-pty']) {
			const directory = path.join(temporary, 'node_modules', module, 'build', 'Release');
			fs.mkdirSync(directory, { recursive: true });
			fs.writeFileSync(path.join(directory, 'fixture.node'), header);
		}
		const ripgrep = path.join(temporary, 'node_modules/@vscode/ripgrep-universal/bin/linux-ppc64/rg');
		fs.mkdirSync(path.dirname(ripgrep), { recursive: true });
		fs.writeFileSync(ripgrep, header);
		const environment = { VSCODE_ELECTRON_REPOSITORY: 'fixture/electron', VSCODE_ELECTRON_CHECKSUM_FILE: checksum, VSCODE_CLIENT_SYSROOT_DIR: path.join(temporary, 'toolchain') };
		assert.doesNotThrow(() => checkDesktopBuildPrerequisites('linux', 'ppc64le', temporary, environment));
		const module = path.join(temporary, 'node_modules/@parcel/watcher/build/Release/fixture.node');
		for (const [wordSize, encoding] of [[1, 1], [2, 2]]) {
			const invalid = Buffer.from(header);
			invalid[4] = wordSize;
			invalid[5] = encoding;
			if (encoding === 2) {
				invalid.writeUInt16BE(21, 18);
			}
			fs.writeFileSync(module, invalid);
			assert.throws(() => checkDesktopBuildPrerequisites('linux', 'ppc64le', temporary, environment), /@parcel\/watcher native binaries/);
		}
		fs.writeFileSync(module, header);
		header.writeUInt16LE(62, 18);
		fs.writeFileSync(ripgrep, header);
		assert.throws(() => checkDesktopBuildPrerequisites('linux', 'ppc64le', temporary, environment), /linux-ppc64 ripgrep/);
	} finally {
		fs.rmSync(temporary, { recursive: true, force: true });
	}
});

test('signtool chooses newest usable SDK numerically, with architecture and PATH fallbacks', () => {
	const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'signtool-'));
	try {
		for (const [version, arch] of [['10.0.999.0', 'x64'], ['10.0.10000.0', 'arm64'], ['10.0.10000.0', 'x86']]) {
			const directory = path.join(temporary, version, arch);
			fs.mkdirSync(directory, { recursive: true });
			fs.writeFileSync(path.join(directory, 'signtool.exe'), '');
		}
		assert.deepStrictEqual(['arm64', 'x64', 'ia32'].map(arch => path.relative(temporary, findSignTool(temporary, arch))), ['10.0.10000.0/arm64/signtool.exe', '10.0.10000.0/x86/signtool.exe', '10.0.10000.0/x86/signtool.exe'].map(value => value.replaceAll('/', path.sep)));
		assert.equal(findSignTool(undefined), 'signtool.exe');
	} finally {
		fs.rmSync(temporary, { recursive: true, force: true });
	}
});

test('custom Chromium manifest paths stay inside their dedicated cache', async () => {
	const { getChromiumSysrootPaths } = await import('../../linux/debian/install-sysroot.ts');
	const entry = { SysrootDir: 'debian_bullseye_arm64', Tarball: 'sysroot.tar.xz', Sha256Sum: 'a'.repeat(64) };
	const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'sysroot-paths-'));
	try {
		const cache = path.join(temporary, 'cache');
		assert.deepStrictEqual(getChromiumSysrootPaths(entry, cache), { sysroot: path.join(cache, entry.SysrootDir), tarball: path.join(cache, entry.SysrootDir, entry.Tarball), checksum: entry.Sha256Sum });
		for (const invalid of [null, { ...entry, SysrootDir: '../victim' }, { ...entry, SysrootDir: '/victim' }, { ...entry, Tarball: '../victim' }, { ...entry, Sha256Sum: 'not-a-checksum' }]) {
			assert.throws(() => getChromiumSysrootPaths(invalid, cache), /Invalid Chromium/);
		}
		fs.mkdirSync(path.join(temporary, 'victim'));
		fs.symlinkSync(path.join(temporary, 'victim'), cache);
		assert.throws(() => getChromiumSysrootPaths(entry, cache), /symbolic links/);
		assert.ok(fs.existsSync(path.join(temporary, 'victim')));
	} finally {
		fs.rmSync(temporary, { recursive: true, force: true });
	}
});

test('Chromium downloads retry HTTP and truncated-body failures, follow redirects and verify the archive', async () => {
	const { getChromiumSysroot } = await import('../../linux/debian/install-sysroot.ts');
	const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'sysroot-download-'));
	const archivePath = path.join(temporary, 'fixture.tar');
	fs.writeFileSync(path.join(temporary, 'fixture.txt'), 'verified sysroot fixture');
	execFileSync('tar', ['cf', archivePath, '-C', temporary, 'fixture.txt']);
	const archive = fs.readFileSync(archivePath);
	const checksum = createHash('sha256').update(archive).digest('hex');
	let attempts = 0;
	let archives = 0;
	let missing = 0;
	const server = createServer((request, response) => {
		if (request.url === `/${checksum}`) {
			attempts++;
			response.writeHead(attempts === 1 ? 503 : 302, { Location: '/archive' });
			response.end();
		} else if (request.url === '/archive') {
			archives++;
			response.writeHead(200, { 'Content-Length': archive.length });
			if (archives === 1) {
				response.flushHeaders();
				response.write(archive.subarray(0, 20));
				response.destroy();
			} else {
				response.end(archive);
			}
		} else {
			missing++;
			response.writeHead(404);
			response.end('missing archive');
		}
	});
	await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
	try {
		const address = server.address();
		assert.ok(address && typeof address !== 'string');
		const manifest = path.join(temporary, 'sysroots.json');
		fs.writeFileSync(manifest, JSON.stringify({ bullseye_arm64: { SysrootDir: 'fixture-sysroot', Tarball: 'fixture.tar', Sha256Sum: checksum } }));
		const environment = { VSCODE_CHROMIUM_SYSROOTS_URL: pathToFileURL(manifest).href, VSCODE_CHROMIUM_SYSROOTS_BASE_URL: `http://127.0.0.1:${address.port}` };
		const sysroot = await getChromiumSysroot('arm64', environment, temporary);
		assert.deepStrictEqual([fs.readFileSync(path.join(sysroot, 'fixture.txt'), 'utf8'), attempts, archives], ['verified sysroot fixture', 3, 2]);
		assert.equal(await getChromiumSysroot('arm64', environment, temporary), sysroot);
		assert.equal(attempts, 3);
		await assert.rejects(getChromiumSysroot('arm64', { ...environment, VSCODE_CHROMIUM_SYSROOTS_BASE_URL: `${environment.VSCODE_CHROMIUM_SYSROOTS_BASE_URL}/missing` }, temporary), /status code: 404/);
		assert.deepStrictEqual([missing, fs.existsSync(path.join(sysroot, '.stamp')), fs.existsSync(path.join(sysroot, 'fixture.tar'))], [3, false, false]);
	} finally {
		server.closeAllConnections();
		await new Promise<void>(resolve => server.close(() => resolve()));
		fs.rmSync(temporary, { recursive: true, force: true });
	}
});
