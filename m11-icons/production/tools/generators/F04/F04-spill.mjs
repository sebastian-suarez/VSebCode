#!/usr/bin/env node
// F04-spill.mjs — raster proof that no emblem ink lands outside the folder
// silhouette (closed) or off the front flap (open).
//
// For each icon: rasterise the canon base and the finished icon at 128x128, then
// find every pixel the emblem changed. Any changed pixel where the base is fully
// transparent is ink outside the silhouette — a spill.

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { homedir, tmpdir } from 'node:os';
import { EMBLEMS } from './F04-emblems.mjs';

const SVG = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/svg/folder';
const only = process.argv.slice(2);

function chromium() {
	const cache = join(homedir(), 'Library/Caches/ms-playwright');
	for (const b of readdirSync(cache).filter(d => /^chromium-\d+$/.test(d))
		.sort((a, b) => +b.split('-')[1] - +a.split('-')[1])) {
		const m = join(cache, b, 'chrome-mac-arm64');
		for (const app of readdirSync(m).filter(f => f.endsWith('.app'))) {
			const bin = join(m, app, 'Contents/MacOS', app.replace(/\.app$/, ''));
			if (existsSync(bin)) { return bin; }
		}
	}
	throw new Error('no Playwright chromium');
}

const uri = (f) => 'data:image/svg+xml;base64,' +
	Buffer.from(readFileSync(join(SVG, f), 'utf8'), 'utf8').toString('base64');

const ids = (only.length ? EMBLEMS.filter(e => only.includes(e.id)) : EMBLEMS).map(e => e.id);
const jobs = ids.flatMap(id => [
	{ label: id, base: uri('folder.svg'), icon: uri(`${id}.svg`) },
	{ label: `${id}-open`, base: uri('folder-open.svg'), icon: uri(`${id}-open.svg`) }
]);

const page = join(tmpdir(), `F04-spill-${process.pid}.html`);
writeFileSync(page, `<!doctype html><meta charset="utf-8"><pre id="o">PENDING</pre><script>
const JOBS = ${JSON.stringify(jobs)};
const S = 128;
const c = document.createElement('canvas'); c.width = S; c.height = S;
const g = c.getContext('2d', { willReadFrequently: true });
const load = (u) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = u; });
(async () => {
  const out = [];
  for (const j of JOBS) {
    const [b, k] = await Promise.all([load(j.base), load(j.icon)]);
    g.clearRect(0,0,S,S); g.drawImage(b,0,0,S,S);
    const B = g.getImageData(0,0,S,S).data;
    g.clearRect(0,0,S,S); g.drawImage(k,0,0,S,S);
    const K = g.getImageData(0,0,S,S).data;
    let changed = 0, spill = 0, worst = 0, at = null;
    for (let p = 0; p < S*S; p++) {
      const o = p*4;
      const d = Math.abs(K[o]-B[o]) + Math.abs(K[o+1]-B[o+1]) + Math.abs(K[o+2]-B[o+2]) + Math.abs(K[o+3]-B[o+3]);
      if (d <= 6) continue;
      changed++;
      if (B[o+3] === 0) { spill++; if (d > worst) { worst = d; at = [p % S, (p / S) | 0]; } }
    }
    out.push({ label: j.label, changed, spill, worst, at });
  }
  document.getElementById('o').textContent = 'RESULT=' + JSON.stringify(out);
})();
</script>`);

const dom = execFileSync(chromium(), ['--headless', '--disable-gpu', '--no-sandbox',
	'--allow-file-access-from-files', '--virtual-time-budget=60000', '--dump-dom', `file://${page}`],
{ encoding: 'utf8', maxBuffer: 1 << 26, stdio: ['ignore', 'pipe', 'ignore'] });
const m = /RESULT=(\[[\s\S]*?\])<\/pre>/.exec(dom);
if (!m) { throw new Error('spill check produced no result'); }
const res = JSON.parse(m[1]);

let bad = 0;
for (const r of res) {
	if (r.spill > 0) { bad++; console.log(`SPILL ${r.label}: ${r.spill}px outside the silhouette (worst Δ${r.worst} at ${r.at})`); }
	if (r.changed === 0) { bad++; console.log(`EMPTY ${r.label}: the emblem changed nothing`); }
}
console.log(`\n${res.length} rasters at 128px — ${res.length - bad} clean, ${bad} with ink outside the base silhouette`);
console.log(`emblem coverage: min ${Math.min(...res.map(r => r.changed))}px, max ${Math.max(...res.map(r => r.changed))}px of ${128 * 128}`);
process.exit(bad ? 1 : 0);
