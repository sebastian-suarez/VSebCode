#!/usr/bin/env node
// F03-shoot.mjs — screenshot an html file at 2x.  node F03-shoot.mjs in.html out.png [width]
import { writeFileSync, existsSync, readdirSync, rmSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { homedir, tmpdir } from 'node:os';

export function chromium() {
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

const COMMON = ['--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
	'--allow-file-access-from-files', '--virtual-time-budget=8000'];

export function shoot(htmlPath, pngPath, width = 1240, scale = 2) {
	const bin = chromium();
	const probe = join(tmpdir(), `F03-probe-${process.pid}.html`);
	writeFileSync(probe, `<!doctype html><body style="margin:0"><pre id="o"></pre>` +
		`<iframe id="f" src="file://${htmlPath}" style="width:${width}px;height:400px;border:0"></iframe>` +
		`<script>f.onload=()=>{document.getElementById('o').textContent='H='+f.contentDocument.documentElement.scrollHeight}</script>`);
	const dom = execFileSync(bin, [...COMMON, `--window-size=${width + 200},600`, '--dump-dom', `file://${probe}`],
		{ encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 });
	rmSync(probe, { force: true });
	const m = /H=(\d+)/.exec(dom);
	if (!m) { throw new Error('could not measure the page height'); }
	execFileSync(bin, [...COMMON, `--force-device-scale-factor=${scale}`,
		'--default-background-color=121314ff', `--window-size=${width},${m[1]}`,
		`--screenshot=${pngPath}`, `file://${htmlPath}`], { stdio: ['ignore', 'ignore', 'ignore'] });
	return { width, height: +m[1], bin };
}

if (process.argv[1].endsWith('F03-shoot.mjs') && process.argv[2]) {
	const r = shoot(resolve(process.argv[2]), resolve(process.argv[3]), +(process.argv[4] || 1240));
	console.log(`${process.argv[3]} ${r.width}x${r.height} @2x  ${readFileSync(resolve(process.argv[3])).length} bytes`);
}
