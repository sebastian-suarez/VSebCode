// build.mjs — emit the 40 folder icons (closed + open) and a preview sheet.
//
//   node build.mjs            # preview only  -> scratchpad/preview.html
//   node build.mjs --write    # also write production/svg/folder/*.svg

import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { emit } from './geom.mjs';
import { EMBLEMS } from './emblems.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/svg/folder';

// ---- the canon bases, verbatim ---------------------------------------------
export const BASE_CLOSED =
	'<path fill="#BF9354" d="M1.5 4.1c0-.66.54-1.2 1.2-1.2h3.12c.34 0 .66.14.89.39l.95 1.01h5.64c.66 0 1.2.54 1.2 1.2v6.4c0 .66-.54 1.2-1.2 1.2H2.7c-.66 0-1.2-.54-1.2-1.2z"/>' +
	'<path fill="rgba(0,0,0,.14)" d="M1.5 5.55h13v.85h-13z"/>';
export const BASE_OPEN =
	'<path fill="#8F6D37" d="M1.5 4.1c0-.66.54-1.2 1.2-1.2h3.12c.34 0 .66.14.89.39l.95 1.01h4.94c.66 0 1.2.54 1.2 1.2v1h-12z"/>' +
	'<path fill="#C09553" d="M2.42 6.5h11.62c.78 0 1.35.73 1.17 1.49l-.98 3.9c-.13.54-.61.91-1.17.91H2.7c-.66 0-1.2-.54-1.2-1.2V7.7c0-.66.42-1.2.92-1.2z"/>';

// ---- emblem boxes ----------------------------------------------------------
// closed: 6.5 box whose bottom-right corner sits 1 px inside the folder's own
//         bottom-right corner (14.5, 13.1)  ->  x 7.0-13.5, y 5.6-12.1
// open:   the front flap is only 6.3 px tall (y 6.5-12.8), so the same box does
//         not fit; the emblem drops to 5.2 — the largest that keeps a ~0.5 px
//         clearance from the flap's top, bottom and slanted right edge.
export const BOX_CLOSED = { ox: 7.0, oy: 5.6, k: 0.65 };
export const BOX_OPEN = { ox: 8.3, oy: 7.0, k: 0.52 };

export function icon(e, open) {
	const T = open ? BOX_OPEN : BOX_CLOSED;
	const d = emit(e.d(), T);
	const fr = e.evenodd ? ' fill-rule="evenodd"' : '';
	return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">' +
		(open ? BASE_OPEN : BASE_CLOSED) +
		`<path fill="${e.color}"${fr} d="${d}"/></svg>\n`;
}

// ---- write -----------------------------------------------------------------
const write = process.argv.includes('--write');
const files = [];
for (const e of EMBLEMS) {
	for (const open of [false, true]) {
		const name = `${e.id}${open ? '-open' : ''}.svg`;
		const src = icon(e, open);
		files.push({ name, src, bytes: Buffer.byteLength(src) });
		if (write) { mkdirSync(OUT, { recursive: true }); writeFileSync(join(OUT, name), src, 'utf8'); }
	}
}
const total = files.reduce((a, f) => a + f.bytes, 0);
console.log(`${files.length} files, ${total} bytes, avg ${Math.round(total / files.length)}, max ${Math.max(...files.map(f => f.bytes))} (${files.slice().sort((a, b) => b.bytes - a.bytes)[0].name})`);
if (write) { console.log(`written to ${OUT}`); }

// ---- preview ---------------------------------------------------------------
const CANON = {
	folder: BASE_CLOSED,
	'folder-open': BASE_OPEN
};
const sym = (id, body) => `<symbol id="s-${id}" viewBox="0 0 16 16">${body}</symbol>`;
const inner = (s) => s.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
const defs = `<svg width="0" height="0" style="position:absolute"><defs>
${files.map(f => sym(f.name.replace(/\.svg$/, ''), inner(f.src))).join('\n')}
${Object.entries(CANON).map(([id, b]) => sym(id, b)).join('\n')}
</defs></svg>`;
const use = (id, s) => `<svg class="ico" width="${s}" height="${s}"><use href="#s-${id}"/></svg>`;

const rows = EMBLEMS.map(e => `<tr>
  <th>${e.id}<span>${e.desc}</span></th>
  <td>${use(e.id, 16)}</td><td>${use(e.id + '-open', 16)}</td>
  <td class="g">${use(e.id, 22)}</td><td>${use(e.id + '-open', 22)}</td>
  <td class="g">${use(e.id, 32)}</td><td>${use(e.id + '-open', 32)}</td>
  <td class="g">${use(e.id, 64)}</td><td>${use(e.id + '-open', 64)}</td>
</tr>`).join('');

const treeRows = EMBLEMS.map(e => `<div class="r">${use(e.id, 16)}<span>${e.id}</span></div>`).join('');

writeFileSync(join(HERE, 'preview.html'), `<title>emblem preview</title><style>
body{margin:0;background:#121314;color:#D7D9DA;font:13px/1.5 -apple-system,sans-serif;padding:24px}
table{border-collapse:collapse}
th{text-align:left;font-weight:400;font:12px/1.4 ui-monospace,monospace;padding:4px 14px 4px 0;white-space:nowrap}
th span{display:block;color:#7A8084;font-size:10px}
td{padding:4px 6px;text-align:center}
td.g{border-left:1px solid #2A2D2E}
tr+tr th,tr+tr td{border-top:1px solid #202324}
.ico{display:block;margin:0 auto}
.tree{display:inline-block;vertical-align:top;margin-right:28px;background:#1E1E1E;padding:8px 0;border-radius:8px;width:230px}
.r{display:flex;align-items:center;gap:7px;height:22px;padding:0 12px}
.r span{font:13px/1 -apple-system,sans-serif;color:#CCC}
h2{font:11px/1 ui-monospace,monospace;letter-spacing:.1em;color:#8A9092;margin:28px 0 10px}
</style>${defs}
<h2>16 · 16-open · 22 · 22-open · 32 · 32-open · 64 · 64-open</h2>
<table>${rows}</table>
<h2>tree</h2>
<div class="tree">${treeRows}</div>
`, 'utf8');
console.log(join(HERE, 'preview.html'));
