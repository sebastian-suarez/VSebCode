#!/usr/bin/env node
// proof.mjs — the working eye and the L9 gate 2 evidence: every shipped icon at
// 64 px, at a true 16 px, and as a 10x nearest-neighbour blow-up of that 16 px
// render, so sub-pixel damage is visible instead of imagined.
//
//   node tools/proof.mjs [A01] [out.png] [#backdrop]

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { resolveTarget, sliceArg } from './targets.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const target = await resolveTarget();
const R = target.registry;
const OUT = target.dir;
const rest = process.argv.slice(2).filter(a => a !== sliceArg() && !a.startsWith('--slice='));
const png = rest[0] || join(OUT, 'proofs', 'proof-16px.png');
const bg = rest[1] || '#121314';

const IDS = [...R.FILES, ...R.FOLDERS.flatMap(f => [f, `${f}-open`])];
const TITLE = target.kind === 'pilot' ? 'M20 pilot' : `M20 slice ${R.id}`;

const load = (id) => readFileSync(join(OUT, 'icons', `${id}.svg`), 'utf8')
	.trim().replace(' xmlns="http://www.w3.org/2000/svg"', '');
const at = (src, px) => src.replace('<svg ', `<svg width="${px}" height="${px}" `);

let html = `<!doctype html><meta charset="utf-8"><style>
body{background:#1e2124;color:#c9d1d9;font:11px ui-monospace,SFMono-Regular,monospace;margin:0;padding:14px}
h2{font:600 13px system-ui;margin:4px 0 10px;color:#e6edf3}
.grid{display:flex;gap:9px;flex-wrap:wrap}
.c{background:${bg};padding:7px 7px 3px;border-radius:6px;text-align:center;width:168px}
.big{display:block;margin:0 auto}
.px{image-rendering:pixelated;display:block;margin:6px auto 2px}
.n{font-size:9px;color:#8b949e;margin-top:3px;overflow:hidden}
.tiny{display:flex;gap:4px;justify-content:center;align-items:center;margin-top:5px}
</style><body><h2>${TITLE} · ${IDS.length} icons · 64 px, true 16/22/32 px, and the 16 px render at 10x</h2>
<div class="grid">`;
for (const id of IDS) {
	const s = load(id);
	html += `<div class="c">${at(s, 64).replace('<svg ', '<svg class="big" ')}`
		+ `<div class="tiny">${at(s, 16)}${at(s, 22)}${at(s, 32)}</div>`
		+ `${at(s, 16).replace('<svg ', '<svg class="px" style="width:160px;height:160px" ')}`
		+ `<div class="n">${id}</div></div>`;
}
html += '</div></body>';

const tmp = join(tmpdir(), `m20.proof.${target.id}.html`);
writeFileSync(tmp, html);
const PER_ROW = 5;   // 168 px cards + 9 px gutters inside the 1080 px shot
execFileSync('node', [join(HERE, 'shot.mjs'), tmp, png, '1080',
	String(80 + Math.ceil(IDS.length / PER_ROW) * 332), '1']);
console.log(`wrote ${png} — ${IDS.length} icons`);
