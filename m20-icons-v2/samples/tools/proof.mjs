#!/usr/bin/env node
// proof.mjs — the working eye: every subject at 64 px and at a true 16 px, with
// a 10x nearest-neighbour blow-up of the 16 px render so sub-pixel damage is
// visible. `node tools/proof.mjs <dir> [outfile]`, dir = masters|r1-true|...

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { SUBJECTS } from './sources.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, '..');
const dirs = (process.argv[2] || 'r1-true').split(',');
const png = process.argv[3] || '/tmp/proof.png';
const bg = process.argv[4] || '#121314';

const load = (dir, id) => readFileSync(join(OUT, dir, `${id}.svg`), 'utf8')
	.trim().replace(' xmlns="http://www.w3.org/2000/svg"', '');
const at = (src, px) => src.replace('<svg ', `<svg width="${px}" height="${px}" `);

let html = `<!doctype html><meta charset="utf-8"><style>
body{background:#1e2124;color:#c9d1d9;font:11px ui-monospace,SFMono-Regular,monospace;margin:0;padding:14px}
h2{font:600 13px system-ui;margin:16px 0 8px;color:#e6edf3}
.grid{display:flex;gap:9px;flex-wrap:wrap}
.c{background:${bg};padding:7px 7px 3px;border-radius:6px;text-align:center;width:168px}
.big{display:block;margin:0 auto}
.px{image-rendering:pixelated;display:block;margin:6px auto 2px}
.n{font-size:9px;color:#8b949e;margin-top:3px;overflow:hidden}
.tiny{display:flex;gap:4px;justify-content:center;align-items:center;margin-top:5px}
</style><body>`;

for (const dir of dirs) {
	html += `<h2>${dir}</h2><div class="grid">`;
	const have = new Set(readdirSync(join(OUT, dir)).filter(f => f.endsWith('.svg'))
		.map(f => f.replace('.svg', '')));
	for (const id of SUBJECTS) {
		if (!have.has(id)) { continue; }
		const s = load(dir, id);
		html += `<div class="c">${at(s, 64).replace('<svg ', '<svg class="big" ')}`
			+ `<div class="tiny">${at(s, 16)}${at(s, 22)}${at(s, 32)}</div>`
			+ `${at(s, 16).replace('<svg ', '<svg class="px" style="width:160px;height:160px" ')}`
			+ `<div class="n">${id}</div></div>`;
	}
	html += '</div>';
}
html += '</body>';

const tmp = join(HERE, '.proof.html');
writeFileSync(tmp, html);
const rows = Math.ceil(SUBJECTS.length / 6) * dirs.length;
execFileSync('node', [join(HERE, 'shot.mjs'), tmp, png, '1080', String(150 + rows * 330), '1']);
console.log(`wrote ${png}`);
