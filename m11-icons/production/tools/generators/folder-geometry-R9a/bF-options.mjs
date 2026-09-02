// bF-options.mjs — decision sheet: the briefed 8.2 box vs the boxes that
// actually fit inside the folder silhouette.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { emit } from './geom.mjs';
import { EMBLEMS } from './emblems.mjs';
import { shoot } from './shot.mjs';

const HERE = '/private/tmp/claude-501/-Users-sebastian-suarez-Projects-VSebCode/cd497411-6ae3-485b-8bfb-25848c779b0a/scratchpad';
const BASE_CLOSED =
	'<path fill="#BF9354" d="M1.5 4.1c0-.66.54-1.2 1.2-1.2h3.12c.34 0 .66.14.89.39l.95 1.01h5.64c.66 0 1.2.54 1.2 1.2v6.4c0 .66-.54 1.2-1.2 1.2H2.7c-.66 0-1.2-.54-1.2-1.2z"/>' +
	'<path fill="rgba(0,0,0,.14)" d="M1.5 5.55h13v.85h-13z"/>';
const BASE_OPEN =
	'<path fill="#8F6D37" d="M1.5 4.1c0-.66.54-1.2 1.2-1.2h3.12c.34 0 .66.14.89.39l.95 1.01h4.94c.66 0 1.2.54 1.2 1.2v1h-12z"/>' +
	'<path fill="#C09553" d="M2.42 6.5h11.62c.78 0 1.35.73 1.17 1.49l-.98 3.9c-.13.54-.61.91-1.17.91H2.7c-.66 0-1.2-.54-1.2-1.2V7.7c0-.66.42-1.2.92-1.2z"/>';

// closed-box candidates. bottom = oy + 10k, top margin = oy - 4.30, bottom margin = 13.10 - bottom
const OPTS = [
	{ id: 'old', label: 'SHIPPED 6.50', sub: 'y 5.60–12.10 · top 1.30 / bot 1.00', k: 0.65, ox: 7.0, oy: 5.6, bad: false },
	{ id: 'E', label: 'BRIEFED 8.20', sub: 'y 3.90–12.10 · top −0.40 (OUTSIDE) / bot 1.00', k: 0.82, ox: 5.3, oy: 3.9, bad: true },
	{ id: 'A', label: 'A · 8.20 re-anchored', sub: 'y 4.60–12.80 · top 0.30 / bot 0.30', k: 0.82, ox: 5.3, oy: 4.6, bad: false },
	{ id: 'B', label: 'B · 8.00 re-anchored', sub: 'y 4.70–12.70 · top 0.40 / bot 0.40', k: 0.80, ox: 5.5, oy: 4.7, bad: false },
	{ id: 'C', label: 'C · 7.80 keeps anchor', sub: 'y 4.30–12.10 · top 0.00 / bot 1.00', k: 0.78, ox: 5.7, oy: 4.3, bad: false },
	{ id: 'D', label: 'D · 7.30 keeps anchor', sub: 'y 4.80–12.10 · top 0.50 / bot 1.00', k: 0.73, ox: 6.2, oy: 4.8, bad: false }
];
const OPEN = { k: 0.55, ox: 7.56, oy: 6.9 };

const SHOW = ['app', 'temp', 'dist', 'config', 'node', 'next', 'middleware', 'db'];
const byId = Object.fromEntries(EMBLEMS.map(e => [e.id, e]));

const mark = (e, T) => `<path fill="${e.color}"${e.evenodd ? ' fill-rule="evenodd"' : ''} d="${emit(e.d(), T)}"/>`;
const sym = (id, body) => `<symbol id="${id}" viewBox="0 0 16 16">${body}</symbol>`;

const symbols = [];
for (const o of OPTS) {
	for (const e of EMBLEMS) {
		symbols.push(sym(`c-${o.id}-${e.id}`, BASE_CLOSED + mark(e, { k: o.k, ox: o.ox, oy: o.oy })));
	}
}
for (const e of EMBLEMS) { symbols.push(sym(`o-${e.id}`, BASE_OPEN + mark(e, OPEN))); }
symbols.push(sym('base-c', BASE_CLOSED), sym('base-o', BASE_OPEN));

const use = (id, s) => `<svg class="ico" width="${s}" height="${s}"><use href="#${id}"/></svg>`;

const bigRows = OPTS.map(o => `<tr class="${o.bad ? 'bad' : ''}">
  <th>${o.label}<span>${o.sub}</span></th>
  ${SHOW.map(id => `<td>${use(`c-${o.id}-${id}`, 64)}</td>`).join('')}
</tr>`).join('');

const smallRows = OPTS.map(o => `<tr class="${o.bad ? 'bad' : ''}">
  <th>${o.label}</th>
  ${SHOW.map(id => `<td>${use(`c-${o.id}-${id}`, 32)}</td>`).join('')}
  <td class="g">${SHOW.map(id => use(`c-${o.id}-${id}`, 16)).join('')}</td>
</tr>`).join('');

const treeRows = OPTS.map(o => `<div class="tree"><b>${o.label}</b>
  ${EMBLEMS.slice(0, 20).map(e => `<div class="r">${use(`c-${o.id}-${e.id}`, 16)}<span>${e.id}</span></div>`).join('')}
</div>`).join('');

const openStrip = `<div class="openrow">${EMBLEMS.map(e => use(`o-${e.id}`, 64)).join('')}</div>
<div class="openrow s">${EMBLEMS.map(e => use(`o-${e.id}`, 16)).join('')}</div>`;

const html = `<meta charset="utf-8"><title>folder emblem box — options</title><style>
body{margin:0;background:#121314;color:#D7D9DA;font:13px/1.5 -apple-system,BlinkMacSystemFont,sans-serif;padding:26px 30px 40px}
h1{font:600 17px/1.3 -apple-system,sans-serif;margin:0 0 4px}
h2{font:11px/1 ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase;color:#8A9092;margin:34px 0 12px;border-bottom:1px solid #24272A;padding-bottom:8px}
p.lede{color:#9AA0A6;max-width:760px;margin:0 0 6px}
table{border-collapse:collapse;margin-top:6px}
th{text-align:left;font-weight:400;font:12px/1.35 ui-monospace,monospace;padding:6px 16px 6px 0;white-space:nowrap;vertical-align:middle}
th span{display:block;color:#71777C;font-size:10px}
td{padding:5px 7px;text-align:center}
td.g{border-left:1px solid #2A2D2E;padding-left:14px;white-space:nowrap}
tr+tr th,tr+tr td{border-top:1px solid #1E2123}
tr.bad th{color:#FF7A6B}
tr.bad td{background:rgba(255,90,70,.08)}
.ico{display:inline-block;vertical-align:middle}
.trees{display:flex;gap:18px;flex-wrap:wrap}
.tree{background:#1E1E1E;border-radius:8px;padding:8px 0 10px;width:186px}
.tree b{display:block;font:11px/1 ui-monospace,monospace;color:#8A9092;padding:2px 12px 8px;font-weight:400}
.r{display:flex;align-items:center;gap:7px;height:22px;padding:0 12px}
.r span{font:13px/1 -apple-system,sans-serif;color:#CCC}
.openrow{display:flex;flex-wrap:wrap;gap:2px;margin-bottom:10px}
.openrow.s{gap:6px}
code{font:12px/1 ui-monospace,monospace;color:#C6CBD0;background:#1C1F21;padding:2px 5px;border-radius:4px}
</style>
<svg width="0" height="0" style="position:absolute"><defs>${symbols.join('')}</defs></svg>

<h1>Closed-folder emblem box — the briefed 8.2 does not fit at the briefed anchor</h1>
<p class="lede">The folder body right of the tab is only <code>8.80 px</code> tall
(top edge y 4.30 → bottom y 13.10). An 8.20 box whose bottom sits 1.00 px inside the
bottom corner starts at y 3.90 — <b>0.40 px above the folder's own top edge</b>. 19 of the
40 emblems paint ink into that band, outside the silhouette. Red row = broken.</p>

<h2>64 px — the spill is the top edge of each mark</h2>
<table><thead><tr><th></th>${SHOW.map(id => `<th style="text-align:center">${id}</th>`).join('')}</tr></thead>
<tbody>${bigRows}</tbody></table>

<h2>32 px and 16 px</h2>
<table><tbody>${smallRows}</tbody></table>

<h2>16 px in a tree row</h2>
<div class="trees">${treeRows}</div>

<h2>Open variant — 5.50 box, x 7.56–13.06, y 6.90–12.40 (unaffected by the choice above)</h2>
${openStrip}
`;

const out = join(HERE, 'bF-options.html');
writeFileSync(out, html, 'utf8');
const r = shoot(out, join(HERE, 'bF-options.png'), 1320, 2);
console.log(`${out}\n${join(HERE, 'bF-options.png')}  ${r.width}x${r.height} css px, ${r.bytes} bytes`);
