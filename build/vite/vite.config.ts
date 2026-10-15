/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createLogger, defineConfig, Plugin } from 'vite';
import { join } from 'path';
import { componentExplorer } from '@vscode/component-explorer-vite-plugin';
import { rollupEsmUrlPlugin } from '@vscode/rollup-plugin-esm-url';

function createHotClassSupport(): Plugin {
	return {
		name: 'createHotClassSupport',
		transform: {
			order: 'pre',
			handler: (code, id) => {
				if (id.endsWith('.ts')) {
					let needsHMRAccept = false;
					const hasCreateHotClass = code.includes('createHotClass');
					const hasDomWidget = code.includes('DomWidget');

					if (!hasCreateHotClass && !hasDomWidget) {
						return undefined;
					}

					if (hasCreateHotClass) {
						needsHMRAccept = true;
					}

					if (hasDomWidget) {
						const matches = code.matchAll(/class\s+([a-zA-Z0-9_]+)\s+extends\s+DomWidget/g);
						/// @ts-ignore
						for (const match of matches) {
							const className = match[1];
							code = code + `\n${className}.registerWidgetHotReplacement(${JSON.stringify(id + '#' + className)});`;
							needsHMRAccept = true;
						}
					}

					if (needsHMRAccept) {
						code = code + `\n
if (import.meta.hot) {
	import.meta.hot.accept();
}`;
					}
					return code;
				}
				return undefined;
			},
		}
	};
}

const logger = createLogger();
const loggerWarn = logger.warn;

logger.warn = (msg, options) => {
	// the baseUrl code cannot be analyzed by vite.
	// However, it is not needed, so it is okay to silence the warning.
	if (msg.indexOf('await import(new URL(`vs/workbench/workbench.desktop.main.js`, baseUrl).href)') !== -1) {
		return;
	}
	if (msg.indexOf('const result2 = await import(workbenchUrl);') !== -1) {
		return;
	}

	// See https://github.com/microsoft/vscode/issues/278153
	if (msg.indexOf('marked.esm.js.map') !== -1 || msg.indexOf('purify.es.mjs.map') !== -1) {
		return;
	}

	loggerWarn(msg, options);
};

export default defineConfig({
	base: './',
	plugins: [
		rollupEsmUrlPlugin({}),
		createHotClassSupport(),
		componentExplorer({
			logLevel: 'verbose',
			include: join(__dirname, '../../src/**/*.fixture.ts'),
			build: 'all',
		}),
	],
	customLogger: logger,
	resolve: {
		alias: {
			'~@vscode/codicons': join(__dirname, '../../node_modules/@vscode/codicons'),
		}
	},
	esbuild: {
		tsconfigRaw: {
			compilerOptions: {
				experimentalDecorators: true,
			}
		}
	},
	root: '../..', // To support /out/... paths
	build: {
		outDir: join(__dirname, 'dist'),
	},
	server: {
		cors: true,
		port: 5199,
		fs: {
			allow: [
				// To allow loading from sources, not needed when loading monaco-editor from npm package
				join(import.meta.dirname, '../../../')
			]
		}
	}
});
