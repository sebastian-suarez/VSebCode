#!/usr/bin/env node
// fidelity.mjs — the round-2 gate that round 1 had no answer for.
//
// Per subject: the ORIGINAL source artwork at 64 px, the fitted master at 64 px,
// and the master at a true 16 px. The question the sheet has to answer honestly
// is "would someone who knows this brand call the master the real logo?".
//
//   node tools/fidelity.mjs [out.png]

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import * as si from 'simple-icons';
import { SUBJECTS, spec } from './sources.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, '..');
const png = process.argv[2] || join(OUT, 'fidelity-proof.png');

const file = (f) => readFileSync(join(OUT, 'sources-svg', f), 'utf8')
	.replace(/<\?xml[^>]*\?>/, '').replace(/<!--[\s\S]*?-->/g, '')
	.replace(/<style>[\s\S]*?<\/style>/g, '');
const siSvg = (slug, fill) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">`
	+ `<path fill="${fill}" d="${si['si' + slug[0].toUpperCase() + slug.slice(1)].path}"/></svg>`;

// what the brand actually ships, unmodified
const ORIGINAL = {
	typescript: () => siSvg('typescript', '#3178C6'),
	editorconfig: () => siSvg('editorconfig', '#FEFEFE'),
	json: () => null,
	markdown: () => file('markdown-official.svg').replace('fill="#000"', 'fill="#E0E0E0"'),
	docker: () => siSvg('docker', '#2496ED'),
	python: () => siSvg('python', '#3776AB'),
	react: () => file('react-official.svg'),
	eslint: () => file('eslint-official.svg'),
	prettier: () => file('prettier-icon-clean-centred.svg'),
	rust: () => siSvg('rust', '#CE422B'),
	'folder-src': () => null,
	'folder-node': () => siSvg('nodedotjs', '#5FA04E')
};

const size = (s, px) => s.replace(/<svg /, `<svg width="${px}" height="${px}" `)
	.replace(/\swidth="\d+px"/, '').replace(/\sheight="\d+px"/, '');

let html = `<!doctype html><meta charset="utf-8"><style>
body{background:#1b1e21;color:#c9d1d9;font:11px ui-monospace,SFMono-Regular,monospace;margin:0;padding:16px}
h1{font:600 15px system-ui;margin:0 0 4px;color:#e6edf3}
p.lead{color:#8b949e;margin:0 0 14px;max-width:900px;font:12px/1.5 system-ui}
.row{display:flex;align-items:center;gap:14px;background:#232629;border-radius:8px;
	padding:9px 12px;margin-bottom:7px}
.name{width:112px;font:600 12px system-ui;color:#e6edf3}
.pane{background:#121314;border-radius:5px;padding:5px;display:flex;align-items:center;
	justify-content:center;width:74px;height:74px}
.pane.sm{width:34px;height:34px}
.lbl{font-size:9px;color:#6e7681;width:52px}
.notes{flex:1;color:#8b949e;font:11px/1.45 system-ui}
.notes b{color:#c9d1d9;font-weight:600}
.miss{color:#6e7681;font-style:italic}
</style><body>
<h1>Round 2 · fidelity proof</h1>
<p class="lead">Left: the artwork the brand ships, rendered verbatim. Middle: the fitted
master this set derives from it. Right: that master at a true 16&nbsp;px. json and
folder-src are exempt — neither concept owns a mark.</p>`;

for (const id of SUBJECTS) {
	const s = spec(id);
	const orig = ORIGINAL[id]();
	const m = readFileSync(join(OUT, 'masters', `${id}.svg`), 'utf8').trim();
	const simp = (s.simplifications || []);
	html += `<div class="row"><div class="name">${id}</div>`
		+ `<div class="lbl">source</div>`
		+ `<div class="pane">${orig ? size(orig, 64) : '<span class="miss">n/a</span>'}</div>`
		+ `<div class="lbl">master</div><div class="pane">${size(m, 64)}</div>`
		+ `<div class="pane sm">${size(m, 16)}</div>`
		+ `<div class="notes"><b>${s.source.name}</b>`
		+ (s.source.slug ? ` · ${s.source.slug}` : '')
		+ (simp.length ? `<br>${simp.map(x => '— ' + x).join('<br>')}`
			: '<br>— no simplification: the source geometry is used as published')
		+ `</div></div>`;
}
html += '</body>';

const tmp = join(HERE, '.fidelity.html');
writeFileSync(tmp, html);
execFileSync('node', [join(HERE, 'shot.mjs'), tmp, png, '1180',
	String(190 + SUBJECTS.length * 108), '2']);
console.log(`wrote ${png}`);
