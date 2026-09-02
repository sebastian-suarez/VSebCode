// bF-crops.mjs — true 16-px rasters (1x and 2x-Retina) of src / test / node_modules,
// magnified 10x with nearest-neighbour so the spill above the folder's top edge is
// visible. Renders the OLD box, the BRIEFED 8.20 box and the viable alternatives.
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

const OPTS = [
	{ id: 'old', label: 'SHIPPED 6.50', k: 0.65, ox: 7.0, oy: 5.6 },
	{ id: 'E', label: 'BRIEFED 8.20 (y3.90)', k: 0.82, ox: 5.3, oy: 3.9, bad: true },
	{ id: 'A', label: 'A 8.20 re-anchored', k: 0.82, ox: 5.3, oy: 4.6 },
	{ id: 'B', label: 'B 8.00 re-anchored', k: 0.80, ox: 5.5, oy: 4.7 },
	{ id: 'C', label: 'C 7.80 keeps anchor', k: 0.78, ox: 5.7, oy: 4.3 },
	{ id: 'D', label: 'D 7.30 keeps anchor', k: 0.73, ox: 6.2, oy: 4.8 }
];
const OPEN = { k: 0.55, ox: 7.56, oy: 6.9 };
const PICK = [['src', 'src'], ['test', 'tests'], ['node', 'node_modules']];
const byId = Object.fromEntries(EMBLEMS.map(e => [e.id, e]));

const svg = (b) => 'data:image/svg+xml;base64,' + Buffer.from(
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">' + b + '</svg>', 'utf8').toString('base64');
const mark = (e, T) => `<path fill="${e.color}"${e.evenodd ? ' fill-rule="evenodd"' : ''} d="${emit(e.d(), T)}"/>`;

const cells = [];
for (const [id] of PICK) {
	const e = byId[id];
	for (const o of OPTS) {
		cells.push({ key: `${id}|${o.id}`, closed: svg(BASE_CLOSED + mark(e, o)), open: svg(BASE_OPEN + mark(e, OPEN)) });
	}
}

const html = `<meta charset="utf-8"><title>16px crops</title><style>
body{margin:0;background:#121314;color:#D7D9DA;font:12px/1.4 -apple-system,sans-serif;padding:22px 26px 34px}
h1{font:600 15px/1.3 -apple-system,sans-serif;margin:0 0 14px}
h2{font:11px/1 ui-monospace,monospace;letter-spacing:.1em;text-transform:uppercase;color:#8A9092;margin:26px 0 10px}
table{border-collapse:collapse}
th{font:11px/1.3 ui-monospace,monospace;font-weight:400;color:#9AA0A6;text-align:left;padding:4px 12px 8px 0;white-space:nowrap;vertical-align:bottom}
td{padding:5px 8px;vertical-align:middle}
td.l{font:11px/1.3 ui-monospace,monospace;color:#C6CBD0;white-space:nowrap;padding-right:14px}
tr.bad td.l{color:#FF7A6B}
canvas{display:block;background:#1E1E1E;border-radius:3px}
.pair{display:flex;gap:6px}
p{color:#9AA0A6;max-width:820px;margin:0 0 4px}
b.r{color:#FF7A6B}
</style>
<h1>True 16-px raster, magnified 10× (nearest-neighbour) — the folder's top edge is the tell</h1>
<p>Left of each pair: 1× (16 device px). Right: 2× Retina (32 device px), which is what a Mac
actually paints. In the <b class="r">BRIEFED 8.20</b> row the emblem's top row of pixels sits
<b class="r">above the folder's top edge</b>, on the bare background.</p>
<div id="out"></div>
<script>
const CELLS = ${JSON.stringify(cells)};
const OPTS = ${JSON.stringify(OPTS.map(o => ({ id: o.id, label: o.label, bad: !!o.bad })))};
const PICK = ${JSON.stringify(PICK)};
const Z = 10;
const load = u => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = u; });
function magnify(img, n) {                    // rasterize at n device px, blow up Z:1
  const s = document.createElement('canvas'); s.width = s.height = n;
  const g = s.getContext('2d', { willReadFrequently: true });
  g.fillStyle = '#1E1E1E'; g.fillRect(0, 0, n, n);
  g.drawImage(img, 0, 0, n, n);
  const d = document.createElement('canvas'); d.width = d.height = 16 * Z;
  const h = d.getContext('2d'); h.imageSmoothingEnabled = false;
  h.drawImage(s, 0, 0, 16 * Z, 16 * Z);
  return d;
}
(async () => {
  const map = {}; for (const c of CELLS) { map[c.key] = c; }
  const out = document.getElementById('out');
  for (const [id, name] of PICK) {
    const h2 = document.createElement('h2'); h2.textContent = name + '  (' + id + ')'; out.appendChild(h2);
    const t = document.createElement('table');
    t.innerHTML = '<thead><tr><th></th><th>closed &nbsp; 1× / 2×</th><th>open &nbsp; 1× / 2×</th></tr></thead>';
    const tb = document.createElement('tbody');
    for (const o of OPTS) {
      const c = map[id + '|' + o.id];
      const tr = document.createElement('tr'); if (o.bad) { tr.className = 'bad'; }
      const td0 = document.createElement('td'); td0.className = 'l'; td0.textContent = o.label; tr.appendChild(td0);
      for (const which of ['closed', 'open']) {
        const img = await load(c[which]);
        const td = document.createElement('td'); const w = document.createElement('div'); w.className = 'pair';
        w.appendChild(magnify(img, 16)); w.appendChild(magnify(img, 32));
        td.appendChild(w); tr.appendChild(td);
      }
      tb.appendChild(tr);
    }
    t.appendChild(tb); out.appendChild(t);
  }
  document.title = 'READY';
})();
</script>`;

const out = join(HERE, 'bF-crops.html');
writeFileSync(out, html, 'utf8');
const r = shoot(out, join(HERE, 'bF-crops.png'), 900, 1);
console.log(`${join(HERE, 'bF-crops.png')}  ${r.width}x${r.height}, ${r.bytes} bytes`);
