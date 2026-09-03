#!/usr/bin/env node
// probe.mjs — look at the real artwork before touching it.
//
// Renders every source mark twice: once as the brand ships it, once with each
// subpath in a different colour so the layer structure is visible. This is the
// tool that answers "which subpath is the yellow snake" without guessing.

import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import * as si from 'simple-icons';
import { subpaths, bbox } from './pathkit.mjs';

const ROOT = '/Users/sebastian.suarez/Projects/VSebCode/m20-icons-v2/samples';
const SRC = join(ROOT, 'sources-svg');
const HUES = ['#E45757', '#E8A33D', '#E3D94A', '#6FC65A', '#3FB6A8', '#4A9BE8', '#7B6FE0',
	'#C165D6', '#E86FA8', '#9AA3AB', '#B5651D', '#2E8B57', '#FF7F50', '#40E0D0', '#DA70D6'];

const SLUGS = ['typescript', 'editorconfig', 'markdown', 'docker', 'python', 'react',
	'eslint', 'prettier', 'rust', 'nodedotjs'];

let html = `<!doctype html><meta charset="utf-8"><style>
body{background:#1b1d1f;color:#ddd;font:11px ui-monospace,monospace;margin:0;padding:12px}
.row{display:flex;gap:10px;align-items:flex-start;margin-bottom:10px;flex-wrap:wrap}
.cell{background:#26292c;padding:6px;border-radius:6px;text-align:center}
.cell svg{display:block;background:#121314;border-radius:3px}
h2{font:600 13px system-ui;margin:14px 0 6px}
</style>`;

for (const slug of SLUGS) {
	const ic = si['si' + slug[0].toUpperCase() + slug.slice(1)];
	const sp = subpaths(ic.path);
	const mono = `<svg viewBox="0 0 24 24" width="128" height="128"><path fill="#e8e8e8" d="${ic.path}"/></svg>`;
	const layered = `<svg viewBox="0 0 24 24" width="128" height="128">`
		+ sp.map((d, i) => `<path fill="${HUES[i % HUES.length]}" d="${d}"/>`).join('')
		+ `</svg>`;
	const strip = sp.map((d, i) => {
		const b = bbox(d);
		return `<div class="cell"><svg viewBox="0 0 24 24" width="52" height="52">`
			+ `<path fill="${HUES[i % HUES.length]}" d="${d}"/></svg>`
			+ `<div>#${i}<br>${b.w.toFixed(1)}x${b.h.toFixed(1)}</div></div>`;
	}).join('');
	html += `<h2>${slug} — simple-icons #${ic.hex}</h2><div class="row">`
		+ `<div class="cell">${mono}<div>ships</div></div>`
		+ `<div class="cell">${layered}<div>layers</div></div>${strip}</div>`;
}

// fetched official files, verbatim
for (const f of ['eslint-official.svg', 'react-official.svg', 'markdown-official.svg',
	'rust-official.svg', 'prettier-icon-clean-centred.svg', 'prettier-icon-dark.svg']) {
	const p = join(SRC, f);
	if (!existsSync(p)) { continue; }
	const raw = readFileSync(p, 'utf8').replace(/<\?xml[^>]*\?>/, '')
		.replace(/<svg /, '<svg width="128" height="128" ');
	html += `<h2>${f} — official file, verbatim</h2><div class="row"><div class="cell">${raw}</div></div>`;
}

writeFileSync(join(ROOT, 'tools', '.probe.html'), html);
console.log('wrote tools/.probe.html');
