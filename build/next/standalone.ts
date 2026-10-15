/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as esbuild from 'esbuild';
import * as fs from 'fs';
import * as path from 'path';
import { rewriteSourceMappingURL } from './source-map-url.ts';

/**
 * These run in special contexts (Electron preload) and must not be bundled.
 */
const desktopStandaloneFiles = [
	'vs/base/parts/sandbox/electron-browser/preload.ts',
	'vs/base/parts/sandbox/electron-browser/preload-aux.ts',
	'vs/platform/browserView/electron-browser/preload-browserView.ts',
];

export async function compileStandaloneFiles(srcDir: string, outDir: string, minify: boolean, sourceMapBaseUrl?: string): Promise<void> {
	console.log(`[standalone] Compiling ${desktopStandaloneFiles.length} standalone files...`);

	const banner = `/*!--------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/`;

	await Promise.all(desktopStandaloneFiles.map(async file => {
		const entryPath = path.resolve(srcDir, file);
		const outPath = path.resolve(outDir, file.replace(/\.ts$/, '.js'));

		const result = await esbuild.build({
			entryPoints: [entryPath],
			outfile: outPath,
			bundle: false,
			format: 'cjs',
			platform: 'node',
			target: ['es2024'],
			sourcemap: 'linked',
			sourcesContent: true,
			minify,
			banner: { js: banner },
			write: false,
			logLevel: 'warning',
		});

		await fs.promises.mkdir(path.dirname(outPath), { recursive: true });
		for (const output of result.outputFiles) {
			await fs.promises.writeFile(output.path, output.path === outPath
				? rewriteSourceMappingURL(output.text, path.relative(outDir, output.path), sourceMapBaseUrl?.replace(/\/$/, ''))
				: output.contents);
		}
	}));

	console.log(`[standalone] Done`);
}
