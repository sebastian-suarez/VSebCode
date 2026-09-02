// F02-review.mjs — compact 64 px grid (closed+open) for eyeballing the whole slice.
import { readFileSync, writeFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { homedir, tmpdir } from 'node:os';
import { EMBLEMS } from './F02-emblems.mjs';

const FOLDER = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/svg/folder';
const SCRATCH = '/private/tmp/claude-501/-Users-sebastian-suarez-Projects-VSebCode/cd497411-6ae3-485b-8bfb-25848c779b0a/scratchpad';
const inner = (f) => readFileSync(join(FOLDER, f), 'utf8')
	.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
const SIZE = +(process.argv[2] || 64);
const only = process.argv[3] ? process.argv[3].split(',') : null;
const ids = Object.keys(EMBLEMS).sort().filter(id => !only || only.includes(id));

const cells = ids.map(id => `<figure>
  <svg width="${SIZE}" height="${SIZE}" viewBox="0 0 16 16">${inner(`${id}.svg`)}</svg>
  <svg width="${SIZE}" height="${SIZE}" viewBox="0 0 16 16">${inner(`${id}-open.svg`)}</svg>
  <figcaption>${id}</figcaption></figure>`).join('');

const html = `<title>F02 review</title><style>
body{margin:0;background:#121314;color:#8A9092;font:11px/1.4 ui-monospace,Menlo,monospace;padding:16px}
.g{display:grid;grid-template-columns:repeat(6,1fr);gap:10px}
figure{margin:0;text-align:center}figcaption{margin-top:2px}
</style><div class="g">${cells}</div>`;
const out = join(SCRATCH, 'F02-review.html');
writeFileSync(out, html);

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
const W = SIZE * 13 + 120;
const bin = chromium();
const COMMON = ['--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
	'--allow-file-access-from-files', '--virtual-time-budget=8000'];
const probe = join(tmpdir(), `F02-rp-${process.pid}.html`);
writeFileSync(probe, `<!doctype html><body style="margin:0"><pre id="o"></pre><iframe id="f" src="file://${out}" style="width:${W}px;height:400px;border:0"></iframe><script>f.onload=()=>{o.textContent='H='+f.contentDocument.documentElement.scrollHeight}</script>`);
const dom = execFileSync(bin, [...COMMON, `--window-size=${W + 200},600`, '--dump-dom', `file://${probe}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
rmSync(probe, { force: true });
const h = +/H=(\d+)/.exec(dom)[1];
const png = join(SCRATCH, `F02-review-${SIZE}.png`);
execFileSync(bin, [...COMMON, '--default-background-color=121314ff', `--window-size=${W},${h}`, `--screenshot=${png}`, `file://${out}`], { stdio: 'ignore' });
console.log(png, W, h);
