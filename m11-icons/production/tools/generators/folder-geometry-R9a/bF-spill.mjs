// bF-spill.mjs — does the emblem ink stay inside the folder silhouette?
// Renders base-only and emblem-only at 640x640 (40 px per icon unit) and counts
// emblem pixels that fall outside the base's alpha.
//
//   node bF-spill.mjs <closedK> <closedOx> <closedOy> <openK> <openOx> <openOy>

import { writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { chromium } from '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/tools/raster.mjs';
import { emit } from './geom.mjs';
import { EMBLEMS } from './emblems.mjs';

const BASE_CLOSED =
	'<path fill="#BF9354" d="M1.5 4.1c0-.66.54-1.2 1.2-1.2h3.12c.34 0 .66.14.89.39l.95 1.01h5.64c.66 0 1.2.54 1.2 1.2v6.4c0 .66-.54 1.2-1.2 1.2H2.7c-.66 0-1.2-.54-1.2-1.2z"/>';
const BASE_OPEN =
	'<path fill="#8F6D37" d="M1.5 4.1c0-.66.54-1.2 1.2-1.2h3.12c.34 0 .66.14.89.39l.95 1.01h4.94c.66 0 1.2.54 1.2 1.2v1h-12z"/>' +
	'<path fill="#C09553" d="M2.42 6.5h11.62c.78 0 1.35.73 1.17 1.49l-.98 3.9c-.13.54-.61.91-1.17.91H2.7c-.66 0-1.2-.54-1.2-1.2V7.7c0-.66.42-1.2.92-1.2z"/>';
// the open FLAP alone — the emblem is supposed to live entirely on it
const FLAP_ONLY =
	'<path fill="#C09553" d="M2.42 6.5h11.62c.78 0 1.35.73 1.17 1.49l-.98 3.9c-.13.54-.61.91-1.17.91H2.7c-.66 0-1.2-.54-1.2-1.2V7.7c0-.66.42-1.2.92-1.2z"/>';

const a = process.argv.slice(2).map(Number);
const BOX = {
	closed: { k: a[0], ox: a[1], oy: a[2] },
	open: { k: a[3], ox: a[4], oy: a[5] }
};

const svg = (body) => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">' + body + '</svg>';
const uri = (s) => 'data:image/svg+xml;base64,' + Buffer.from(s, 'utf8').toString('base64');

const jobs = [];
for (const e of EMBLEMS) {
	for (const open of [false, true]) {
		const T = open ? BOX.open : BOX.closed;
		const fr = e.evenodd ? ' fill-rule="evenodd"' : '';
		const mark = `<path fill="#000"${fr} d="${emit(e.d(), T)}"/>`;
		jobs.push({
			key: `${e.id}${open ? '-open' : ''}`,
			mark: uri(svg(mark)),
			base: uri(svg(open ? BASE_OPEN : BASE_CLOSED)),
			flap: uri(svg(open ? FLAP_ONLY : BASE_CLOSED))
		});
	}
}

const S = 640;                 // 40 px per icon unit
const page = join(tmpdir(), `bF-spill-${process.pid}.html`);
writeFileSync(page, `<!doctype html><meta charset="utf-8"><body><pre id="o">PENDING</pre><script>
const JOBS = ${JSON.stringify(jobs)};
const S = ${S}, U = S / 16;
const mk = () => { const c = document.createElement('canvas'); c.width = S; c.height = S;
  return [c, c.getContext('2d', { willReadFrequently: true })]; };
const [c1, g1] = mk(), [c2, g2] = mk(), [c3, g3] = mk();
const draw = (g, u) => new Promise((res, rej) => { const i = new Image();
  i.onload = () => { g.clearRect(0,0,S,S); g.drawImage(i,0,0,S,S); res(g.getImageData(0,0,S,S).data); };
  i.onerror = () => rej(new Error('img')); i.src = u; });
(async () => {
  const out = {};
  for (const j of JOBS) {
    const m = await draw(g1, j.mark), b = await draw(g2, j.base), f = await draw(g3, j.flap);
    let nOutBase = 0, nOutFlap = 0, ink = 0;
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    let fx0 = 1e9, fx1 = -1e9, fy0 = 1e9, fy1 = -1e9;
    for (let p = 0; p < S * S; p++) {
      if (m[p * 4 + 3] < 128) { continue; }
      ink++;
      const x = p % S, y = (p / S) | 0;
      if (b[p * 4 + 3] < 128) { nOutBase++;
        if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      if (f[p * 4 + 3] < 128) { nOutFlap++;
        if (x < fx0) fx0 = x; if (x > fx1) fx1 = x; if (y < fy0) fy0 = y; if (y > fy1) fy1 = y; }
    }
    out[j.key] = { ink, nOutBase, nOutFlap,
      bbox: nOutBase ? [x0/U, y0/U, x1/U, y1/U] : null,
      fbox: nOutFlap ? [fx0/U, fy0/U, fx1/U, fy1/U] : null };
  }
  document.getElementById('o').textContent = 'SPILL=' + JSON.stringify(out);
})().catch(e => { document.getElementById('o').textContent = 'ERR=' + e.message; });
</script>`);

const dom = execFileSync(chromium(), ['--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
	'--allow-file-access-from-files', '--virtual-time-budget=120000', '--window-size=800,600',
	'--dump-dom', `file://${page}`],
	{ encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 });
rmSync(page, { force: true });
const pre = /<pre id="o">([\s\S]*?)<\/pre>/.exec(dom);
if (!pre || !pre[1].startsWith('SPILL=')) { console.error(pre ? pre[1].slice(0, 300) : 'no output'); process.exit(1); }
const R = JSON.parse(pre[1].slice(6));

const U2 = 1 / (S / 16) ** 2;   // px^2 per sample, in icon units
let bad = 0, badFlap = 0;
console.log(`closed box k=${BOX.closed.k} ox=${BOX.closed.ox} oy=${BOX.closed.oy} | open k=${BOX.open.k} ox=${BOX.open.ox} oy=${BOX.open.oy}`);
console.log(`\n--- ink OUTSIDE the folder silhouette (real spill) ---`);
for (const [k, v] of Object.entries(R)) {
	if (!v.nOutBase) { continue; }
	bad++;
	const [x0, y0, x1, y1] = v.bbox;
	console.log(`${k.padEnd(18)} ${(v.nOutBase * U2).toFixed(3)} px²  ${(100 * v.nOutBase / v.ink).toFixed(2)}% of the mark   x ${x0.toFixed(2)}–${x1.toFixed(2)}  y ${y0.toFixed(2)}–${y1.toFixed(2)}`);
}
if (!bad) { console.log('  none'); }
console.log(`\n--- OPEN: ink off the front FLAP (onto the dark back panel / outside) ---`);
for (const [k, v] of Object.entries(R)) {
	if (!k.endsWith('-open') || !v.nOutFlap) { continue; }
	badFlap++;
	const [x0, y0, x1, y1] = v.fbox;
	console.log(`${k.padEnd(18)} ${(v.nOutFlap * U2).toFixed(3)} px²  ${(100 * v.nOutFlap / v.ink).toFixed(2)}%   x ${x0.toFixed(2)}–${x1.toFixed(2)}  y ${y0.toFixed(2)}–${y1.toFixed(2)}`);
}
if (!badFlap) { console.log('  none'); }
console.log(`\n${bad}/80 spill outside the folder, ${badFlap}/40 open icons leave the flap`);
