/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { test } from 'node:test';
import { build } from 'esbuild';

test('extension worker bootstrap remains executable under its content security policy', () => {
	const html = readFileSync(new URL('../../../src/vs/workbench/services/extensions/worker/webWorkerExtensionHostIframe.html', import.meta.url), 'utf8');
	const script = /<script>([\s\S]*?)<\/script>/.exec(html)?.[1];
	assert.ok(script);
	const hash = createHash('sha256').update(script).digest('base64');
	assert.ok(html.includes(`'sha256-${hash}'`), 'Update the worker bootstrap CSP hash after changing its inline script.');
});

test('separately bundled modules share the selected user-data path within one process', async () => {
	const temporary = mkdtempSync(join(tmpdir(), 'bundled-user-data-'));
	try {
		const result = await build({ entryPoints: [fileURLToPath(new URL('../../../src/vs/platform/environment/node/userDataPath.ts', import.meta.url))], bundle: true, platform: 'node', format: 'esm', write: false });
		const first = join(temporary, 'first.mjs');
		const second = join(temporary, 'second.mjs');
		writeFileSync(first, result.outputFiles[0].contents);
		writeFileSync(second, result.outputFiles[0].contents);
		const selected = join(temporary, 'selected');
		execFileSync(process.execPath, ['--input-type=module', '-e', `
			import assert from 'node:assert/strict';
			const first = await import(${JSON.stringify(pathToFileURL(first).href)});
			const second = await import(${JSON.stringify(pathToFileURL(second).href)});
			first.setUserDataPath(${JSON.stringify(selected)});
			assert.equal(second.getUserDataPath({ _: [], 'user-data-dir': ${JSON.stringify(join(temporary, 'other'))} }, 'Overridden Product Name'), ${JSON.stringify(selected)});
		`]);
	} finally {
		rmSync(temporary, { recursive: true, force: true });
	}
});
