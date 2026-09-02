// zoom.mjs — rasterise each icon at 16 and 22 px and blow it up nearest-neighbour,
// so the real 16 px pixel grid is visible. Usage: node zoom.mjs id1 id2 ...
import { readFileSync, writeFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { homedir, tmpdir } from 'node:os';

const ROOT = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production';
const ids = process.argv.slice(2);
const Z = 5;

const cells = ids.map(id => {
	const src = readFileSync(join(ROOT, 'svg', 'file', `${id}.svg`), 'utf8').trim();
	return { id, uri: 'data:image/svg+xml;base64,' + Buffer.from(src).toString('base64') };
});

const html = `<!doctype html><meta charset="utf-8">
<style>
 body{margin:0;background:#121314;color:#8A9092;font:11px ui-monospace,Menlo,monospace}
 .grid{display:flex;flex-wrap:wrap;gap:18px;padding:18px}
 figure{margin:0;display:flex;flex-direction:column;align-items:center;gap:6px}
 .pair{display:flex;gap:10px;align-items:flex-end}
 canvas{image-rendering:pixelated;background:#121314;outline:1px solid #2A2D2E}
</style>
<div class="grid" id="g"></div>
<script>
const cells = ${JSON.stringify(cells)};
const Z = ${Z};
const g = document.getElementById('g');
let pending = cells.length * 2;
for (const c of cells) {
  const fig = document.createElement('figure');
  const pair = document.createElement('div'); pair.className = 'pair';
  for (const s of [16, 22]) {
    const cv = document.createElement('canvas');
    cv.width = s * Z; cv.height = s * Z;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    const img = new Image();
    img.onload = () => {
      const off = document.createElement('canvas');
      off.width = s; off.height = s;
      const o = off.getContext('2d');
      o.drawImage(img, 0, 0, s, s);
      ctx.drawImage(off, 0, 0, s * Z, s * Z);
      if (--pending === 0) { document.title = 'READY'; }
    };
    img.src = c.uri;
    pair.appendChild(cv);
  }
  const cap = document.createElement('figcaption'); cap.textContent = c.id;
  fig.appendChild(pair); fig.appendChild(cap);
  g.appendChild(fig);
}
</script>`;

const page = join(tmpdir(), `m11-zoom-${process.pid}.html`);
writeFileSync(page, html);

function chromium() {
	const cache = join(homedir(), 'Library/Caches/ms-playwright');
	for (const b of readdirSync(cache).filter(d => /^chromium-\d+$/.test(d)).sort((a, b) => +b.split('-')[1] - +a.split('-')[1])) {
		const macos = join(cache, b, 'chrome-mac-arm64');
		for (const app of readdirSync(macos).filter(f => f.endsWith('.app'))) {
			const bin = join(macos, app, 'Contents/MacOS', app.replace(/\.app$/, ''));
			if (existsSync(bin)) { return bin; }
		}
	}
	throw new Error('no chromium');
}

const W = 1200;
const rows = Math.ceil(ids.length / Math.floor((W - 18) / (16 * Z + 22 * Z + 10 + 18)));
const H = 40 + rows * (22 * Z + 40);
const out = join('/private/tmp/claude-501/-Users-sebastian-suarez-Projects-VSebCode/cd497411-6ae3-485b-8bfb-25848c779b0a/scratchpad', 'zoom.png');
execFileSync(chromium(), ['--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
	'--allow-file-access-from-files', '--virtual-time-budget=8000',
	'--default-background-color=121314ff', `--window-size=${W},${H}`,
	`--screenshot=${out}`, `file://${page}`], { stdio: ['ignore', 'ignore', 'ignore'] });
rmSync(page, { force: true });
console.log(out, W + 'x' + H);
