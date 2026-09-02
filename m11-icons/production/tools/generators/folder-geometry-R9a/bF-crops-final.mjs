// bF-crops-final.mjs — BEFORE (shipped 6.50 / 5.20) vs AFTER (ruled 8.20 / 5.80)
// for src, tests and node_modules. True 16-px rasters at 1x and 2x-Retina,
// magnified 10x nearest-neighbour, plus 32 and 64 for reference.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { emit } from './geom.mjs';
import { EMBLEMS } from './emblems.mjs';
import { BASE_CLOSED, BASE_OPEN } from './bF-apply.mjs';
import { shoot } from './shot.mjs';

const HERE = '/private/tmp/claude-501/-Users-sebastian-suarez-Projects-VSebCode/cd497411-6ae3-485b-8bfb-25848c779b0a/scratchpad';

const SETS = [
	{ id: 'before', label: 'BEFORE — closed 6.50 / open 5.20', closed: { ox: 7.0, oy: 5.6, k: 0.65 }, open: { ox: 8.3, oy: 7.0, k: 0.52 } },
	{ id: 'after', label: 'AFTER — closed 8.20 / open 5.80  (SHIPPED)', closed: { ox: 5.3, oy: 4.6, k: 0.82 }, open: { ox: 7.26, oy: 6.75, k: 0.58 }, hot: true }
];
const PICK = [['src', 'src'], ['test', 'tests'], ['node', 'node_modules']];
const byId = Object.fromEntries(EMBLEMS.map(e => [e.id, e]));

const svg = (b) => 'data:image/svg+xml;base64,' + Buffer.from(
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">' + b + '</svg>', 'utf8').toString('base64');
const mark = (e, T) => `<path fill="${e.color}"${e.evenodd ? ' fill-rule="evenodd"' : ''} d="${emit(e.d(), T)}"/>`;

const cells = [];
for (const [id] of PICK) {
	const e = byId[id];
	for (const s of SETS) {
		cells.push({
			key: `${id}|${s.id}`,
			closed: svg(BASE_CLOSED + mark(e, s.closed)),
			open: svg(BASE_OPEN + mark(e, s.open))
		});
	}
}

const html = `<meta charset="utf-8"><title>before / after</title><style>
body{margin:0;background:#121314;color:#D7D9DA;font:12px/1.45 -apple-system,BlinkMacSystemFont,sans-serif;padding:24px 28px 36px}
h1{font:600 16px/1.3 -apple-system,sans-serif;margin:0 0 6px}
h2{font:11px/1 ui-monospace,monospace;letter-spacing:.11em;text-transform:uppercase;color:#8A9092;margin:28px 0 10px;border-bottom:1px solid #24272A;padding-bottom:7px}
p{color:#9AA0A6;max-width:840px;margin:0 0 4px}
table{border-collapse:collapse}
th{font:11px/1.3 ui-monospace,monospace;font-weight:400;color:#9AA0A6;text-align:left;padding:4px 12px 8px 0;white-space:nowrap;vertical-align:bottom}
td{padding:6px 9px;vertical-align:middle}
td.l{font:11px/1.35 ui-monospace,monospace;color:#C6CBD0;white-space:nowrap;padding-right:16px}
tr.hot td.l{color:#8FD694}
canvas{display:block;background:#1E1E1E;border-radius:3px}
.pair{display:flex;gap:6px;align-items:center}
.vec{display:flex;gap:10px;align-items:center;background:#1E1E1E;border-radius:4px;padding:6px 9px}
</style>
<h1>Folder emblems — before / after the M11 size ruling</h1>
<p>Closed 6.50 → <b>8.20</b> (×1.26), re-anchored to 0.30 px clear of the folder body's top and
bottom edges. Open 5.20 → <b>5.80</b>, the flap maximum at 0.25 px clearance. 1× is 16 device px,
2× is the 32 device px a Retina Mac actually paints; both magnified 10× nearest-neighbour.</p>
<div id="out"></div>
<script>
const CELLS = ${JSON.stringify(cells)};
const SETS = ${JSON.stringify(SETS.map(s => ({ id: s.id, label: s.label, hot: !!s.hot })))};
const PICK = ${JSON.stringify(PICK)};
const Z = 10;
const load = u => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = u; });
function magnify(img, n) {
  const s = document.createElement('canvas'); s.width = s.height = n;
  const g = s.getContext('2d', { willReadFrequently: true });
  g.fillStyle = '#1E1E1E'; g.fillRect(0, 0, n, n); g.drawImage(img, 0, 0, n, n);
  const d = document.createElement('canvas'); d.width = d.height = 16 * Z;
  const h = d.getContext('2d'); h.imageSmoothingEnabled = false;
  h.drawImage(s, 0, 0, 16 * Z, 16 * Z);
  return d;
}
function vector(uri, px) { const i = document.createElement('img'); i.src = uri; i.width = i.height = px; return i; }
(async () => {
  const map = {}; for (const c of CELLS) { map[c.key] = c; }
  const out = document.getElementById('out');
  for (const [id, name] of PICK) {
    const h2 = document.createElement('h2'); h2.textContent = name + '  (' + id + ')'; out.appendChild(h2);
    const t = document.createElement('table');
    t.innerHTML = '<thead><tr><th></th><th>closed &nbsp; 16px 1× / 2×</th><th>open &nbsp; 16px 1× / 2×</th><th>32 / 64</th></tr></thead>';
    const tb = document.createElement('tbody');
    for (const s of SETS) {
      const c = map[id + '|' + s.id];
      const tr = document.createElement('tr'); if (s.hot) { tr.className = 'hot'; }
      const td0 = document.createElement('td'); td0.className = 'l'; td0.textContent = s.label; tr.appendChild(td0);
      for (const which of ['closed', 'open']) {
        const img = await load(c[which]);
        const td = document.createElement('td'); const w = document.createElement('div'); w.className = 'pair';
        w.appendChild(magnify(img, 16)); w.appendChild(magnify(img, 32));
        td.appendChild(w); tr.appendChild(td);
      }
      const td3 = document.createElement('td'); const v = document.createElement('div'); v.className = 'vec';
      v.appendChild(vector(c.closed, 32)); v.appendChild(vector(c.open, 32));
      v.appendChild(vector(c.closed, 64)); v.appendChild(vector(c.open, 64));
      td3.appendChild(v); tr.appendChild(td3);
      tb.appendChild(tr);
    }
    t.appendChild(tb); out.appendChild(t);
  }
})();
</script>`;

const out = join(HERE, 'bF-before-after.html');
writeFileSync(out, html, 'utf8');
const r = shoot(out, join(HERE, 'bF-before-after.png'), 1420, 1);
console.log(`${join(HERE, 'bF-before-after.png')}  ${r.width}x${r.height}, ${r.bytes} bytes`);
