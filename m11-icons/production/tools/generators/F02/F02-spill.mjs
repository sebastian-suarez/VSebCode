// F02-spill.mjs — geometric spill check: every emblem pixel must land inside the
// folder silhouette (closed: the tan body; open: the front flap only).

import { readFileSync, writeFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { homedir, tmpdir } from 'node:os';
import { EMBLEMS } from './F02-emblems.mjs';

const DIR = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/svg/folder';
const S = 128;                       // render size; 8x the 16 px grid

function chromium() {
	const cache = join(homedir(), 'Library/Caches/ms-playwright');
	const builds = readdirSync(cache).filter(d => /^chromium-\d+$/.test(d))
		.sort((a, b) => +b.split('-')[1] - +a.split('-')[1]);
	for (const b of builds) {
		const macos = join(cache, b, 'chrome-mac-arm64');
		for (const app of readdirSync(macos).filter(f => f.endsWith('.app'))) {
			const bin = join(macos, app, 'Contents/MacOS', app.replace(/\.app$/, ''));
			if (existsSync(bin)) { return bin; }
		}
	}
	throw new Error(`no Playwright chromium under ${cache}`);
}

const wrap = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${body}</svg>`;
const uri = (body) => 'data:image/svg+xml;base64,' + Buffer.from(wrap(body), 'utf8').toString('base64');

const jobs = [];
for (const id of Object.keys(EMBLEMS)) {
	for (const variant of ['closed', 'open']) {
		const file = join(DIR, variant === 'open' ? `${id}-open.svg` : `${id}.svg`);
		const src = readFileSync(file, 'utf8');
		const paths = src.match(/<path[^>]*\/>/g) || [];
		const baseCount = variant === 'open' ? 2 : 2;         // canon base = two paths
		const mark = paths.slice(baseCount).join('');
		// silhouette: closed -> the tan body; open -> the front flap (2nd base path)
		const silhouette = variant === 'open' ? paths[1] : paths[0];
		if (!mark) { throw new Error(`no emblem in ${file}`); }
		jobs.push({ label: `${id}:${variant}`, mark: uri(mark), sil: uri(silhouette) });
	}
}

const page = join(tmpdir(), `F02-spill-${process.pid}.html`);
writeFileSync(page, `<!doctype html><meta charset="utf-8"><body><pre id="o">P</pre><script>
const JOBS = ${JSON.stringify(jobs)};
const S = ${S};
const c = document.createElement('canvas'); c.width = S; c.height = S;
const g = c.getContext('2d', { willReadFrequently: true });
const load = (u) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error(u.slice(0,40))); i.src = u; });
const alpha = async (u) => { const i = await load(u); g.clearRect(0,0,S,S); g.drawImage(i,0,0,S,S);
  const d = g.getImageData(0,0,S,S).data; const a = new Uint8Array(S*S);
  for (let k = 0; k < S*S; k++) { a[k] = d[k*4+3]; } return a; };
(async () => {
  const out = {};
  for (const j of JOBS) {
    const m = await alpha(j.mark), s = await alpha(j.sil);
    let ink = 0, spill = 0, worst = 0;
    for (let k = 0; k < S*S; k++) {
      if (m[k] > 96) { ink++; if (s[k] < 96) { spill++; worst = Math.max(worst, m[k]); } }
    }
    out[j.label] = [ink, spill, worst];
  }
  document.getElementById('o').textContent = 'R=' + JSON.stringify(out);
})().catch(e => { document.getElementById('o').textContent = 'ERR=' + e.message; });
</script>`);

const dom = execFileSync(chromium(), ['--headless', '--disable-gpu', '--no-sandbox',
	'--hide-scrollbars', '--allow-file-access-from-files', '--virtual-time-budget=60000',
	'--window-size=400,300', '--dump-dom', `file://${page}`],
	{ encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 });
rmSync(page, { force: true });
const pre = /<pre id="o">([\s\S]*?)<\/pre>/.exec(dom);
if (!pre || !pre[1].startsWith('R=')) { throw new Error('spill check did not finish: ' + (pre ? pre[1].slice(0, 120) : 'no output')); }
const res = JSON.parse(pre[1].slice(2));

let fails = 0;
const rows = Object.entries(res).sort((a, b) => b[1][1] - a[1][1]);
for (const [label, [ink, spill, worst]] of rows) {
	// one antialiased pixel ring at 128 px is ~ 0.06 % of the mark; flag anything above
	const pct = spill / (ink || 1) * 100;
	if (spill > 0) {
		fails++;
		console.log(`SPILL ${label}  ${spill}/${ink} px (${pct.toFixed(2)}%) worst alpha ${worst}`);
	}
}
console.log(`\n${rows.length} variants checked at ${S}px — ${rows.length - fails} clean, ${fails} with ink outside the silhouette`);
console.log(`total emblem ink: ${rows.reduce((a, r) => a + r[1][0], 0)} px`);
