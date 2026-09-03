#!/usr/bin/env node
// inspect.mjs — internal QA sheet: every sample big (for the drawing) and at a
// true 16 px raster blown up 10x nearest-neighbour (for the ship decision).

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { proof } from '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/tools/pixelproof.mjs';

const OUT = '/Users/sebastian.suarez/Projects/VSebCode/m20-icons-v2/samples';
const DIRS = { a: 'a-chips', b: 'b-brand', c: 'c-wire', d: 'd-duotone' };
const SUBJECTS = ['typescript', 'editorconfig', 'json', 'markdown', 'docker', 'python',
	'folder-src', 'folder-node'];

const big = process.argv.includes('--big');
const only = process.argv.find(a => a.startsWith('--only='));
const keys = only ? only.slice(7).split(',') : Object.keys(DIRS);

const entries = [];
for (const k of keys) {
	for (const id of SUBJECTS) {
		entries.push({ label: `${k}/${id}`, src: readFileSync(join(OUT, DIRS[k], `${id}.svg`), 'utf8') });
	}
}

let html = `<title>QA</title><style>body{margin:0;background:#121314;color:#C9CED3;
font:12px/1.4 -apple-system,system-ui,sans-serif;padding:20px}
.r{display:flex;gap:14px;align-items:flex-start;margin-bottom:18px}
figure{margin:0;text-align:center}figcaption{margin-top:4px;color:#7C838A;font-size:10px}
h2{font-size:13px;margin:14px 0 8px;color:#E6E9EC}</style>`;

if (big) {
	for (const k of keys) {
		html += `<h2>${DIRS[k]}</h2><div class="r">`;
		for (const id of SUBJECTS) {
			const src = readFileSync(join(OUT, DIRS[k], `${id}.svg`), 'utf8')
				.replace('<svg ', '<svg width="104" height="104" ');
			html += `<figure>${src}<figcaption>${id}</figcaption></figure>`;
		}
		html += '</div>';
	}
} else {
	const r = await proof(entries);
	for (const k of keys) {
		html += `<h2>${DIRS[k]} — true 16 px, 10x</h2><div class="r">`;
		for (const id of SUBJECTS) {
			const p = r.get(`${k}/${id}`);
			const rects = p.px.map((c, i) => c.a <= 0.02 ? '' :
				`<rect x="${i % 16}" y="${Math.floor(i / 16)}" width="1" height="1" fill="rgb(${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)})"/>`).join('');
			html += `<figure><svg width="160" height="160" viewBox="0 0 16 16" shape-rendering="crispEdges">`
				+ `<rect width="16" height="16" fill="#121314"/>${rects}</svg>`
				+ `<figcaption>${id} · ink ${p.ink} · faint ${p.faint}</figcaption></figure>`;
		}
		html += '</div>';
	}
}
writeFileSync(join(OUT, 'tools', big ? 'qa-big.html' : 'qa-16.html'), html);
console.log(join(OUT, 'tools', big ? 'qa-big.html' : 'qa-16.html'));
