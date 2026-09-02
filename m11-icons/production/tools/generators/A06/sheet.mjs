// quick geometry sheet: every A06 icon at 64 px + its id, screenshotted for eyeballing.
import { readFileSync, writeFileSync, readdirSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { homedir, tmpdir } from 'node:os';

const SVG = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/svg/file';
const roster = JSON.parse(readFileSync(new URL('./roster.json', import.meta.url), 'utf8'));
const size = +(process.argv[2] || 64);
const out = process.argv[3] || '/private/tmp/claude-501/-Users-sebastian-suarez-Projects-VSebCode/cd497411-6ae3-485b-8bfb-25848c779b0a/scratchpad/a06/sheet.png';

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
const cells = roster.map(r => {
	const src = readFileSync(join(SVG, `${r.id}.svg`), 'utf8')
		.replace('<svg ', `<svg width="${size}" height="${size}" `);
	return `<figure>${src}<figcaption>${r.id}</figcaption></figure>`;
}).join('');
const html = `<meta charset="utf-8"><style>body{margin:0;background:#121314;color:#8A9092;
font:11px/1.4 ui-monospace,Menlo,monospace;padding:20px}
.g{display:grid;grid-template-columns:repeat(6,1fr);gap:14px}
figure{margin:0;text-align:center}figcaption{margin-top:4px;font-size:10px}</style>
<div class="g">${cells}</div>`;
const page = join(tmpdir(), `a06-sheet-${process.pid}.html`);
writeFileSync(page, html);
const rows = Math.ceil(roster.length / 6);
execFileSync(chromium(), ['--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
	'--allow-file-access-from-files', '--virtual-time-budget=8000', '--force-device-scale-factor=1',
	'--default-background-color=121314ff', `--window-size=${6 * (size + 40) + 60},${rows * (size + 30) + 60}`,
	`--screenshot=${out}`, `file://${page}`], { stdio: ['ignore', 'ignore', 'inherit'] });
rmSync(page, { force: true });
console.log(out);
