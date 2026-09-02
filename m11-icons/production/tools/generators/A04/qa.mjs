#!/usr/bin/env node
// qa.mjs — quick visual grid of the A04 icons (64 px + 16 px) for winding / geometry checks.
import { readFileSync, writeFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';
import { homedir, tmpdir } from 'node:os';

const HERE = '/private/tmp/claude-501/-Users-sebastian-suarez-Projects-VSebCode/cd497411-6ae3-485b-8bfb-25848c779b0a/scratchpad';
const SVGDIR = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/svg/file';
const roster = JSON.parse(readFileSync(join(HERE, 'roster-A04.json'), 'utf8'));
const only = process.argv.slice(2).filter(a => !a.startsWith('--'));
const list = only.length ? roster.filter(r => only.includes(r.id)) : roster;

const cells = list.map(r => {
	const src = readFileSync(join(SVGDIR, `${r.id}.svg`), 'utf8');
	const inner = src.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
	const s = (px) => `<svg width="${px}" height="${px}" viewBox="0 0 16 16">${inner}</svg>`;
	return `<figure>${s(64)}<span>${s(16)}${s(22)}</span><figcaption>${r.id}</figcaption></figure>`;
}).join('');

const html = `<title>A04 QA</title><style>
body{margin:0;background:#121314;color:#8A9092;font:11px/1.4 ui-monospace,Menlo,monospace;padding:16px}
.g{display:grid;grid-template-columns:repeat(7,1fr);gap:14px}
figure{margin:0;text-align:center;background:#191A1B;border-radius:8px;padding:8px 4px}
span{display:flex;gap:8px;align-items:center;justify-content:center;height:26px}
figcaption{margin-top:4px;color:#9AA0A2;font-size:10px}
</style><div class="g">${cells}</div>`;

const out = join(HERE, 'qa.html');
writeFileSync(out, html);

function chromium() {
	const cache = join(homedir(), 'Library/Caches/ms-playwright');
	for (const b of readdirSync(cache).filter(d => /^chromium-\d+$/.test(d)).sort((a, b2) => +b2.split('-')[1] - +a.split('-')[1])) {
		const macos = join(cache, b, 'chrome-mac-arm64');
		for (const app of readdirSync(macos).filter(f => f.endsWith('.app'))) {
			const bin = join(macos, app, 'Contents/MacOS', app.replace(/\.app$/, ''));
			if (existsSync(bin)) { return bin; }
		}
	}
	throw new Error('no chromium');
}
const COMMON = ['--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
	'--allow-file-access-from-files', '--virtual-time-budget=6000'];
const W = 1000;
const probe = join(tmpdir(), `qa-probe-${process.pid}.html`);
writeFileSync(probe, `<!doctype html><body style="margin:0"><pre id="o"></pre>` +
	`<iframe id="f" src="file://${out}" style="width:${W}px;height:400px;border:0"></iframe>` +
	`<script>f.onload=()=>{document.getElementById('o').textContent='H='+f.contentDocument.documentElement.scrollHeight}</script>`);
const dom = execFileSync(chromium(), [...COMMON, `--window-size=${W + 200},600`, '--dump-dom', `file://${probe}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
rmSync(probe, { force: true });
const h = +/H=(\d+)/.exec(dom)[1];
const png = join(HERE, 'qa.png');
execFileSync(chromium(), [...COMMON, '--force-device-scale-factor=2', '--default-background-color=121314ff',
	`--window-size=${W},${h}`, `--screenshot=${png}`, `file://${out}`], { stdio: 'ignore' });
console.log(png, W, h, list.length);
