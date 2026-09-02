// F05-shot.mjs — screenshot a self-contained html page with the Playwright chromium
// under ~/Library/Caches/ms-playwright. Same two-pass method as tools/contact.mjs:
// measure the document height through an iframe, then size the window to it.
import { existsSync, readdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { homedir, tmpdir } from 'node:os';

export function chromium() {
	const cache = join(homedir(), 'Library/Caches/ms-playwright');
	const builds = readdirSync(cache)
		.filter(d => /^chromium-\d+$/.test(d))
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

const COMMON = ['--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
	'--allow-file-access-from-files', '--virtual-time-budget=8000'];

export function shoot(htmlPath, pngPath, width = 1240) {
	const bin = chromium();
	const probe = join(tmpdir(), `f05-probe-${process.pid}.html`);
	writeFileSync(probe, `<!doctype html><body style="margin:0"><pre id="o"></pre>` +
		`<iframe id="f" src="file://${htmlPath}" style="width:${width}px;height:400px;border:0"></iframe>` +
		`<script>f.onload=()=>{document.getElementById('o').textContent='PAGEHEIGHT='+f.contentDocument.documentElement.scrollHeight}</script>`);
	const dom = execFileSync(bin, [...COMMON, `--window-size=${width + 200},600`, '--dump-dom', `file://${probe}`],
		{ encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 90000 });
	rmSync(probe, { force: true });
	const m = /PAGEHEIGHT=(\d+)/.exec(dom);
	if (!m) { throw new Error('could not measure the page height'); }
	const height = +m[1];
	execFileSync(bin, [...COMMON, '--force-device-scale-factor=2', '--default-background-color=121314ff',
		`--window-size=${width},${height}`, `--screenshot=${pngPath}`, `file://${htmlPath}`],
		{ stdio: ['ignore', 'ignore', 'ignore'], timeout: 120000 });
	return { bin, width, height };
}
