/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from '../../../../base/common/path.js';
import { execFileSync } from 'child_process';
import { LinuxExternalTerminalService } from '../../node/externalTerminalService.js';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../base/test/common/utils.js';

suite('Linux external terminal shell commands', () => {
	ensureNoDisposablesAreLeakedInTestSuite();
	let root: string;
	let cwd: string;
	let capture: string;
	let script: string;
	const quote = (value: string) => `'${value.replace(/'/g, `'\\''`)}'`;

	setup(async function () {
		if (process.platform === 'win32') {
			this.skip();
		}
		root = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'external-terminal-')));
		cwd = path.join(root, 'space \' " $(touch injected);');
		await fs.mkdir(cwd);
		capture = path.join(root, 'captured.json');
		script = path.join(root, 'capture.cjs');
		await fs.writeFile(script, 'require("fs").writeFileSync(process.env.CAPTURE, JSON.stringify({ args: process.argv.slice(2), cwd: process.cwd() }));');
	});
	teardown(async () => {
		if (root) {
			await fs.rm(root, { recursive: true, force: true });
		}
	});

	async function terminal(name: string): Promise<string> {
		const executable = path.join(root, name);
		await fs.writeFile(executable, `#!/bin/sh\nexec env ELECTRON_RUN_AS_NODE=1 ${quote(process.execPath)} ${quote(script)} "$@"\n`, { mode: 0o755 });
		return executable;
	}

	test('open supports configured shell syntax while Ghostty cwd remains literal', async () => {
		const executable = await terminal('ghostty');
		await new LinuxExternalTerminalService().openTerminal({ linuxExec: `CAPTURE=${quote(capture)} ${quote(executable)}` }, cwd);
		assert.deepStrictEqual(JSON.parse(await fs.readFile(capture, 'utf8')), { args: [`--working-directory=${cwd}`], cwd });
	});

	test('open rejects missing executables and invalid shell syntax', async () => {
		for (const linuxExec of [quote(path.join(root, 'missing-terminal')), 'if then']) {
			await assert.rejects(new LinuxExternalTerminalService().openTerminal({ linuxExec }, cwd));
		}
	});

	test('Ghostty run arguments cannot execute shell substitutions', async () => {
		const executable = await terminal('ghostty');
		const args = ['program', 'space word', 'quote\'"', '$(touch injected)', '; touch injected', '`touch injected`', ''];
		await new LinuxExternalTerminalService().runInTerminal('title', cwd, args, { CAPTURE: capture }, { linuxExec: quote(executable) });
		assert.deepStrictEqual(JSON.parse(await fs.readFile(capture, 'utf8')), { args: [`--working-directory=${cwd}`, '--wait-after-command=true', '-e', ...args], cwd });
		await assert.rejects(fs.access(path.join(cwd, 'injected')));
	});

	test('gnome-terminal receives one bash program, whose generated arguments stay literal on execution', async () => {
		const executable = await terminal('gnome-terminal');
		const program = await terminal('program');
		const args = ['space word', 'quote\'"', '$(touch injected)', '; touch injected', '`touch injected`', ''];
		await new LinuxExternalTerminalService().runInTerminal('title', cwd, [program, ...args], { CAPTURE: capture }, { linuxExec: quote(executable) });
		const captured = JSON.parse(await fs.readFile(capture, 'utf8'));
		assert.deepStrictEqual(captured.args.slice(0, 3), ['-x', 'bash', '-c']);
		execFileSync('bash', ['-c', captured.args[3]], { cwd, env: { ...process.env, CAPTURE: capture }, input: '\n' });
		assert.deepStrictEqual(JSON.parse(await fs.readFile(capture, 'utf8')), { args, cwd });
		await assert.rejects(fs.access(path.join(cwd, 'injected')));
	});
});
