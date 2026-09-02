#!/usr/bin/env node
// F03-spill.mjs — geometric spill check: no emblem ink outside the folder silhouette.
//
// For every F03 icon it renders (a) the canon base alone and (b) the emblem alone at
// 160x160 in the Playwright chromium, then counts emblem pixels that fall where the base
// paints nothing. It also reports the emblem's ink box in 16-px user units so it can be
// held against the R9a boxes (closed 5.30-13.50 / 4.60-12.80, open 7.26-13.06 / 6.75-12.55).

import { readFileSync, writeFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join, basename } from 'node:path';
import { execFileSync } from 'node:child_process';
import { homedir, tmpdir } from 'node:os';

const N = 160;
const PROD = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production';
const files = readFileSync(join(process.argv[2] || '.', 'F03-files.txt'), 'utf8').trim().split('\n');

function chromium() {
	const cache = join(homedir(), 'Library/Caches/ms-playwright');
	for (const b of readdirSync(cache).filter(d => /^chromium-\d+$/.test(d))
		.sort((a, b) => +b.split('-')[1] - +a.split('-')[1])) {
		const macos = join(cache, b, 'chrome-mac-arm64');
		for (const app of readdirSync(macos).filter(f => f.endsWith('.app'))) {
			const bin = join(macos, app, 'Contents/MacOS', app.replace(/\.app$/, ''));
			if (existsSync(bin)) { return bin; }
		}
	}
	throw new Error('no Playwright chromium');
}

const jobs = [];
for (const rel of files) {
	const src = readFileSync(join(PROD, rel), 'utf8');
	const paths = [...src.matchAll(/<path[^>]*\/>/g)].map(m => m[0]);
	const emblem = paths[paths.length - 1];
	const base = paths.slice(0, -1).join('');
	const wrap = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${body}</svg>`;
	jobs.push({ id: basename(rel, '.svg'), base: wrap(base), emblem: wrap(emblem) });
}

const payload = jobs.map(j => ({
	id: j.id,
	b: 'data:image/svg+xml;base64,' + Buffer.from(j.base, 'utf8').toString('base64'),
	e: 'data:image/svg+xml;base64,' + Buffer.from(j.emblem, 'utf8').toString('base64')
}));

const page = join(tmpdir(), `F03-spill-${process.pid}.html`);
writeFileSync(page, `<!doctype html><meta charset="utf-8"><body><pre id="o">P</pre><script>
const J = ${JSON.stringify(payload)}, N = ${N};
const c = document.createElement('canvas'); c.width = N; c.height = N;
const g = c.getContext('2d', { willReadFrequently: true });
const draw = async (uri) => { const im = new Image();
  await new Promise((r, x) => { im.onload = r; im.onerror = x; im.src = uri; });
  g.clearRect(0,0,N,N); g.drawImage(im,0,0,N,N); return g.getImageData(0,0,N,N).data; };
(async () => { const out = {};
  for (const j of J) {
    const B = await draw(j.b), E = await draw(j.e);
    let spill = 0, ink = 0, x1 = 1e9, y1 = 1e9, x2 = -1e9, y2 = -1e9;
    for (let i = 0; i < N*N; i++) {
      const ea = E[i*4+3], ba = B[i*4+3];
      if (ea > 128) { ink++;
        const x = i % N, y = (i / N) | 0;
        if (x < x1) x1 = x; if (x > x2) x2 = x; if (y < y1) y1 = y; if (y > y2) y2 = y;
        if (ba < 128) spill++;
      }
    }
    out[j.id] = { spill, ink, box: [x1, y1, x2 + 1, y2 + 1] };
  }
  document.getElementById('o').textContent = 'R=' + JSON.stringify(out);
})().catch(e => { document.getElementById('o').textContent = 'ERR=' + e.message; });
</script>`);

const dom = execFileSync(chromium(), ['--headless', '--disable-gpu', '--no-sandbox',
	'--hide-scrollbars', '--allow-file-access-from-files', '--virtual-time-budget=60000',
	'--window-size=400,300', '--dump-dom', `file://${page}`],
	{ encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 });
rmSync(page, { force: true });
const pre = /<pre id="o">([\s\S]*?)<\/pre>/.exec(dom)[1];
if (!pre.startsWith('R=')) { throw new Error(pre.slice(0, 200)); }
const R = JSON.parse(pre.slice(2));

const K = 16 / N;
const BOXES = { closed: [5.30, 4.60, 13.50, 12.80], open: [7.26, 6.75, 13.06, 12.55] };
let bad = 0, over = 0;
for (const j of jobs) {
	const r = R[j.id];
	const v = j.id.endsWith('-open') ? 'open' : 'closed';
	const [bx1, by1, bx2, by2] = BOXES[v];
	const b = r.box.map(p => +(p * K).toFixed(2));
	const tol = 0.06;   // one 160-px sample rounded out
	const outside = b[0] < bx1 - tol || b[1] < by1 - tol || b[2] > bx2 + tol || b[3] > by2 + tol;
	if (r.spill) { bad++; }
	if (outside) { over++; }
	if (r.spill || outside) {
		console.log(`${r.spill ? 'SPILL' : '     '} ${outside ? 'BOX' : '   '} ${j.id.padEnd(24)}` +
			` ink ${String(r.ink).padStart(5)}  spill ${String(r.spill).padStart(4)}  box ${b.join(' ')}`);
	}
}
console.log(`\n${jobs.length} icons — ${bad} with ink outside the folder silhouette, ` +
	`${over} outside their R9a emblem box`);
process.exit(bad || over ? 1 : 0);
