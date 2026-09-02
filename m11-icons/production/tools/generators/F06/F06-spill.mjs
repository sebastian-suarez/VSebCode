#!/usr/bin/env node
// F06-spill.mjs — geometric spill proof for folder slice F06.
//
// The canon base is identical across the slice, so the silhouette mask is
// rasterised once per variant (closed / open). Each emblem is then rasterised
// alone and every emblem pixel that lands where the base paints nothing is
// counted. Zero is the only passing number.

import { readFileSync, writeFileSync, readdirSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { homedir, tmpdir } from 'node:os';

const DIR = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/svg/folder';
const S = 256; // 16x

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
	throw new Error('no Playwright chromium');
}

const IDS = process.argv.slice(2).filter(a => a !== '--').length
	? process.argv.slice(2)
	: ('spin src-tauri sso stack stencil store story stylus sublime syntax target taskfile tasks ' +
		'telegram television toc tools trash travis trigger trunk ui unity update upload vagrant ' +
		'verdaccio vitepress vm vs vscode-test vue-directives vuepress vuex-store wakatime wasp ' +
		'windows windsurf wit wordpress www zeabur zed').split(' ');

const HEAD = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">';
const uri = (s) => 'data:image/svg+xml;base64,' + Buffer.from(s, 'utf8').toString('base64');
const black = (s) => s.replace(/fill="[^"]*"/g, 'fill="#000000"');
const split = (src) => {
	const body = src.slice(HEAD.length, src.lastIndexOf('</svg>'));
	const i = body.lastIndexOf('<path');
	return { base: body.slice(0, i), ink: body.slice(i) };
};

const masks = {};
const items = [];
for (const id of IDS) {
	for (const v of ['', '-open']) {
		const { base, ink } = split(readFileSync(join(DIR, `${id}${v}.svg`), 'utf8'));
		masks[v || 'closed'] = uri(HEAD + black(base) + '</svg>');
		items.push({ label: id + v, kind: v || 'closed', ink: uri(HEAD + black(ink) + '</svg>') });
	}
}

const page = join(tmpdir(), `F06-spill-${process.pid}.html`);
writeFileSync(page, `<!doctype html><meta charset="utf-8"><body><pre id="o">PENDING</pre><script>
const MASKS = ${JSON.stringify(masks)}, ITEMS = ${JSON.stringify(items)}, S = ${S};
const c = document.createElement('canvas'); c.width = S; c.height = S;
const g = c.getContext('2d', { willReadFrequently: true });
const load = (u) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('load')); i.src = u; });
const alpha = async (u) => { const i = await load(u); g.clearRect(0,0,S,S); g.drawImage(i,0,0,S,S);
  const d = g.getImageData(0,0,S,S).data, a = new Uint8Array(S*S);
  for (let p = 0, q = 3; q < d.length; p++, q += 4) { a[p] = d[q]; } return a; };
(async () => {
  const out = {};
  try {
    const M = {}; for (const k in MASKS) { M[k] = await alpha(MASKS[k]); }
    for (const it of ITEMS) {
      const K = await alpha(it.ink), m = M[it.kind];
      let spill = 0, ink = 0, worst = 0, at = null;
      for (let p = 0; p < K.length; p++) {
        if (K[p] > 24) { ink++; if (m[p] < 8) { spill++; if (K[p] > worst) { worst = K[p]; at = [p % S, (p / S) | 0]; } } }
      }
      out[it.label] = { spill, ink, worst, at };
    }
    document.getElementById('o').textContent = 'OK' + JSON.stringify(out);
  } catch (e) { document.getElementById('o').textContent = 'ERR' + e.message; }
})();
</script>`);

const tmp = join(tmpdir(), `F06-spill-prof-${process.pid}`);
const dom = execFileSync(chromium(), [
	'--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
	`--user-data-dir=${tmp}`, '--virtual-time-budget=30000', '--dump-dom', 'file://' + page
], { encoding: 'utf8', maxBuffer: 1 << 26, stdio: ['ignore', 'pipe', 'ignore'] });
rmSync(tmp, { recursive: true, force: true });
rmSync(page, { force: true });

const raw = dom.slice(dom.indexOf('<pre id="o">') + 12, dom.indexOf('</pre>'));
if (!raw.startsWith('OK')) { console.log('raster failed: ' + raw.slice(0, 200)); process.exit(2); }
const json = JSON.parse(raw.slice(2));
let fails = 0;
for (const [label, r] of Object.entries(json)) {
	if (r.spill > 0) { fails++; console.log(`SPILL ${label}: ${r.spill}/${r.ink} px outside the silhouette (worst a=${r.worst} at ${r.at})`); }
	if (r.ink === 0) { fails++; console.log(`EMPTY ${label}: emblem painted nothing`); }
}
console.log(`${Object.keys(json).length} variants at ${S}x${S} (16x) — ${fails} with ink outside the folder silhouette`);
process.exit(fails ? 1 : 0);
