/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { SourceMapConsumer, SourceMapGenerator } from 'source-map';
import { rewriteTelemetryDirectory, rewriteTelemetryFiles } from '../telemetryHosts.ts';

test('telemetry rewrite handles authorities, escapes, ports and boundaries without touching binaries', () => {
	const input = '\uFEFFhttps://a.data.microsoft.com:443/x https:\\/\\/b.data.microsoft.com/x //c.data.microsoft.com/x https://data.microsoft.com/x https://a.data.microsoft.com.evil/x https://other.test/a.data.microsoft.com';
	const files = new Map([
		['index.txt', Buffer.from(input)],
		['module.node', Buffer.from(input)],
		['nul.txt', Buffer.from(input + '\0')],
	]);
	rewriteTelemetryFiles(files);
	assert.deepStrictEqual([...files].map(([name, bytes]) => [name, bytes.toString()]), [
		['index.txt', '\uFEFFhttps://0.0.0.0:443/x https:\\/\\/0.0.0.0/x //0.0.0.0/x https://data.microsoft.com/x https://a.data.microsoft.com.evil/x https://other.test/a.data.microsoft.com'],
		['module.node', input], ['nul.txt', input + '\0']
	]);
	const first = [...files].map(([name, bytes]) => [name, bytes.toString()]);
	rewriteTelemetryFiles(files);
	assert.deepStrictEqual([...files].map(([name, bytes]) => [name, bytes.toString()]), first);
});

for (const inline of [false, true]) {
	test(`telemetry rewrite preserves ${inline ? 'inline' : 'external'} maps across multiple edits and lines`, () => {
		const source = 'const a="https://a.data.microsoft.com/x"; const b="https://b.data.microsoft.com/y"; finish();\nnext();';
		const generator = new SourceMapGenerator({ file: 'index.js', sourceRoot: '../sources' });
		for (const word of ['const a', 'const b', 'finish']) {
			const column = source.indexOf(word);
			generator.addMapping({ generated: { line: 1, column }, original: { line: 1, column }, source: './index.ts', name: word });
		}
		generator.addMapping({ generated: { line: 2, column: 0 }, original: { line: 2, column: 0 }, source: './index.ts' });
		generator.setSourceContent('./index.ts', source);
		const raw = JSON.parse(generator.toString());
		raw.ignoreList = [0];
		raw.sources.push('unreferenced.ts');
		raw.sourcesContent.push('unreferenced content');
		const reference = inline ? `data:application/json;base64,${Buffer.from(JSON.stringify(raw)).toString('base64')}` : 'index.js.map';
		const files = new Map([['index.js', Buffer.from(source + '\n//# sourceMappingURL=' + reference)]]);
		if (!inline) {
			files.set('index.js.map', Buffer.from(JSON.stringify(raw)));
		}
		rewriteTelemetryFiles(files);
		const rewritten = files.get('index.js')!.toString();
		const mapText = inline ? Buffer.from(rewritten.split('base64,')[1], 'base64').toString() : files.get('index.js.map')!.toString();
		const updated = JSON.parse(mapText);
		const consumer = new SourceMapConsumer(updated);
		for (const word of ['const a', 'const b', 'finish']) {
			const column = rewritten.indexOf(word);
			assert.deepStrictEqual(consumer.originalPositionFor({ line: 1, column }), { source: '../sources/index.ts', line: 1, column, name: word });
		}
		assert.deepStrictEqual([updated.sources, updated.ignoreList, updated.sourcesContent[1], updated.sourceRoot], [raw.sources, [0], 'unreferenced content', '../sources']);
		assert.equal(updated.sourcesContent[0], rewritten.split('\n//#')[0]);
		assert.equal(consumer.originalPositionFor({ line: 2, column: 0 }).line, 2);
	});
}

test('telemetry rewrite rejects affected missing, malformed and indexed maps', () => {
	for (const map of [undefined, '{', JSON.stringify({ version: 3, sections: [] })]) {
		const files = new Map([['bundle.js', Buffer.from('"https://a.data.microsoft.com";\n//# sourceMappingURL=bundle.js.map')]]);
		if (map !== undefined) {
			files.set('bundle.js.map', Buffer.from(map));
		}
		assert.throws(() => rewriteTelemetryFiles(files), /bundle.js/);
	}
});

test('telemetry rewrite ignores source-map markers in strings, templates, regular expressions and comment examples', () => {
	const markers = [
		'const marker = "//# sourceMappingURL=missing.map";',
		'const marker = "/*# sourceMappingURL=missing.map */";',
		'const marker = `example\n//# sourceMappingURL=missing.map\nend`;',
		'const marker = /[/*# sourceMappingURL=missing.map]/;',
		'/* Example:\n//# sourceMappingURL=missing.map\n */'
	];
	for (const marker of markers) {
		const source = `${marker}\nconst url = "https://a.data.microsoft.com/x";`;
		const files = new Map([['index.js', Buffer.from(source)]]);
		rewriteTelemetryFiles(files);
		assert.equal(files.get('index.js')!.toString(), source.replace('a.data.microsoft.com', '0.0.0.0'));
	}
});

test('telemetry rewrite preserves block-comment and same-line inline maps with surrounding whitespace', () => {
	const source = 'const url = "https://a.data.microsoft.com/x"; finish();';
	const generator = new SourceMapGenerator();
	generator.addMapping({ generated: { line: 1, column: source.indexOf('finish') }, original: { line: 1, column: source.indexOf('finish') }, source: 'index.ts' });
	generator.setSourceContent('index.ts', source);
	const reference = `data:application/json;base64,${Buffer.from(generator.toString()).toString('base64')}`;
	for (const comment of [`\n/*# sourceMappingURL=${reference} */\n`, ` /*@ sourceMappingURL=${reference}*/`, ` //# sourceMappingURL=${reference}\n`]) {
		const files = new Map([['index.js', Buffer.from(source + comment)]]);
		rewriteTelemetryFiles(files);
		const rewritten = files.get('index.js')!.toString();
		const map = JSON.parse(Buffer.from(/base64,([A-Za-z0-9+/=]+)/.exec(rewritten)![1], 'base64').toString());
		const consumer = new SourceMapConsumer(map);
		const column = rewritten.indexOf('finish');
		assert.equal(consumer.originalPositionFor({ line: 1, column }).column, column);
		assert.equal(map.sourcesContent[0], source.replace('a.data.microsoft.com', '0.0.0.0'));
		rewriteTelemetryFiles(files);
		assert.equal(files.get('index.js')!.toString(), rewritten);
	}
	const files = new Map([['index.js', Buffer.from(`${source}\n/*# sourceMappingURL=${reference} */\nafter();`)]]);
	assert.throws(() => rewriteTelemetryFiles(files), /before trailing code/);
});

test('telemetry directory rewrite includes hidden files, skips symlinks and git, and supports late additions', () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'telemetry-hosts-'));
	const input = 'https://a.data.microsoft.com/x';
	try {
		fs.mkdirSync(path.join(root, 'installed', '.hidden'), { recursive: true });
		fs.mkdirSync(path.join(root, 'installed', '.git'));
		fs.writeFileSync(path.join(root, 'outside.txt'), input);
		fs.writeFileSync(path.join(root, 'installed', '.git', 'config'), input);
		fs.writeFileSync(path.join(root, 'installed', '.hidden', 'file'), input);
		fs.symlinkSync(path.join(root, 'outside.txt'), path.join(root, 'installed', 'linked.txt'));
		assert.equal(rewriteTelemetryDirectory(path.join(root, 'installed')), 1);
		assert.equal(rewriteTelemetryDirectory(path.join(root, 'installed')), 0);
		fs.writeFileSync(path.join(root, 'installed', 'late.js'), input);
		assert.equal(rewriteTelemetryDirectory(path.join(root, 'installed')), 1);
		assert.deepStrictEqual(['outside.txt', 'installed/.git/config', 'installed/linked.txt'].map(name => fs.readFileSync(path.join(root, name), 'utf8')), [input, input, input]);
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
});

test('telemetry rewrite includes a hostname present only in inline sourcesContent', () => {
	const map = { version: 3, sources: ['source.ts'], sourcesContent: ['const host = "https://a.data.microsoft.com"; done();'], names: [], mappings: 'AAAA' };
	const reference = Buffer.from(JSON.stringify(map)).toString('base64');
	const files = new Map([['index.js', Buffer.from(`done();\n//# sourceMappingURL=data:application/json;base64,${reference}`)]]);
	rewriteTelemetryFiles(files);
	const actual = JSON.parse(Buffer.from(files.get('index.js')!.toString().split('base64,')[1], 'base64').toString());
	assert.deepStrictEqual(actual.sourcesContent, ['const host = "https://0.0.0.0"; done();']);
});

test('telemetry maps follow rewritten external sources with omitted or null sourcesContent', () => {
	for (const sourceContents of [undefined, [null]]) {
		const source = 'const a = "https://a.data.microsoft.com/x"; finish();';
		const column = source.indexOf('finish');
		const generator = new SourceMapGenerator({ sourceRoot: '../src' });
		generator.addMapping({ generated: { line: 1, column }, original: { line: 1, column }, source: 'index.ts' });
		const raw = { ...JSON.parse(generator.toString()), sourcesContent: sourceContents };
		const files = new Map([
			['src/index.ts', Buffer.from(source)],
			['dist/index.js', Buffer.from(source + '\n//# sourceMappingURL=index.js.map')],
			['dist/index.js.map', Buffer.from(JSON.stringify(raw))]
		]);
		rewriteTelemetryFiles(files);
		const updatedColumn = files.get('src/index.ts')!.toString().indexOf('finish');
		const consumer = new SourceMapConsumer(JSON.parse(files.get('dist/index.js.map')!.toString()));
		assert.equal(consumer.originalPositionFor({ line: 1, column: updatedColumn }).column, updatedColumn);
	}
});

test('telemetry maps preserve encodeURI and encodeURIComponent inline payloads', () => {
	for (const encode of [encodeURI, encodeURIComponent]) {
		const source = 'const a = "https://a.data.microsoft.com/x"; const b = 2 * 3; /* source comment */ finish();';
		const column = source.indexOf('finish');
		const generator = new SourceMapGenerator();
		generator.addMapping({ generated: { line: 1, column }, original: { line: 1, column }, source: 'index.ts' });
		generator.setSourceContent('index.ts', source);
		const files = new Map([['index.js', Buffer.from(source + '\n//# sourceMappingURL=data:application/json,' + encode(generator.toString()))]]);
		rewriteTelemetryFiles(files);
		const rewritten = files.get('index.js')!.toString();
		assert.ok(rewritten.includes('base64,'));
		const raw = JSON.parse(Buffer.from(rewritten.split('base64,')[1], 'base64').toString());
		const consumer = new SourceMapConsumer(raw);
		const updatedColumn = rewritten.indexOf('finish');
		assert.equal(consumer.originalPositionFor({ line: 1, column: updatedColumn }).column, updatedColumn);
		const first = rewritten;
		rewriteTelemetryFiles(files);
		assert.equal(files.get('index.js')!.toString(), first);
	}
});

test('directory rewrite updates maps when only the external source changes', () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'telemetry-source-only-'));
	try {
		const source = 'const a = "https://a.data.microsoft.com/x"; finish();';
		const generator = new SourceMapGenerator();
		generator.addMapping({ generated: { line: 1, column: 0 }, original: { line: 1, column: source.indexOf('finish') }, source: 'index.ts' });
		fs.writeFileSync(path.join(root, 'index.ts'), source);
		fs.writeFileSync(path.join(root, 'index.js'), 'finish();\n//# sourceMappingURL=index.js.map');
		fs.writeFileSync(path.join(root, 'index.js.map'), generator.toString());
		assert.equal(rewriteTelemetryDirectory(root), 2);
		const consumer = new SourceMapConsumer(JSON.parse(fs.readFileSync(path.join(root, 'index.js.map'), 'utf8')));
		assert.equal(consumer.originalPositionFor({ line: 1, column: 0 }).column, fs.readFileSync(path.join(root, 'index.ts'), 'utf8').indexOf('finish'));
		assert.equal(rewriteTelemetryDirectory(root), 0);
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
});

test('source-only changes update inline maps with omitted or null source content', () => {
	for (const sourcesContent of [undefined, [null]]) {
		for (const encoding of ['base64', 'uri', 'component']) {
			const root = fs.mkdtempSync(path.join(os.tmpdir(), 'telemetry-inline-source-'));
			try {
				const source = 'const a = "https://a.data.microsoft.com/x"; finish();';
				const generator = new SourceMapGenerator();
				generator.addMapping({ generated: { line: 1, column: 0 }, original: { line: 1, column: source.indexOf('finish') }, source: 'index.ts' });
				const map = JSON.stringify({ ...JSON.parse(generator.toString()), sourcesContent });
				const reference = encoding === 'base64' ? `data:application/json;base64,${Buffer.from(map).toString('base64')}` : `data:application/json,${encoding === 'uri' ? encodeURI(map) : encodeURIComponent(map)}`;
				fs.writeFileSync(path.join(root, 'index.ts'), source);
				fs.writeFileSync(path.join(root, 'index.js'), `finish();\n//# sourceMappingURL=${reference}`);
				assert.equal(rewriteTelemetryDirectory(root), 2);
				const updatedMap = JSON.parse(Buffer.from(fs.readFileSync(path.join(root, 'index.js'), 'utf8').split('base64,')[1], 'base64').toString());
				const consumer = new SourceMapConsumer(updatedMap);
				assert.equal(consumer.originalPositionFor({ line: 1, column: 0 }).column, fs.readFileSync(path.join(root, 'index.ts'), 'utf8').indexOf('finish'));
				assert.equal(rewriteTelemetryDirectory(root), 0);
			} finally {
				fs.rmSync(root, { recursive: true, force: true });
			}
		}
	}
});
