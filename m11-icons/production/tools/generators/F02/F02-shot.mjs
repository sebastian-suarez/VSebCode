// F02-shot.mjs — screenshot a local html file with the Playwright chromium.
//   node F02-shot.mjs <in.html> <out.png> [width] [height]
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { execFileSync } from 'node:child_process';

const cache = join(homedir(), 'Library/Caches/ms-playwright');
let bin = null;
for (const b of readdirSync(cache).filter(d => /^chromium-\d+$/.test(d))
	.sort((a, b) => +b.split('-')[1] - +a.split('-')[1])) {
	const macos = join(cache, b, 'chrome-mac-arm64');
	if (!existsSync(macos)) { continue; }
	for (const app of readdirSync(macos).filter(f => f.endsWith('.app'))) {
		const p = join(macos, app, 'Contents/MacOS', app.replace(/\.app$/, ''));
		if (existsSync(p)) { bin = p; break; }
	}
	if (bin) { break; }
}
if (!bin) { throw new Error(`no Playwright chromium under ${cache}`); }

const [, , inHtml, outPng, w = '1000', h = '1900'] = process.argv;
execFileSync(bin, ['--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
	'--allow-file-access-from-files', '--virtual-time-budget=8000',
	'--default-background-color=121314ff', `--window-size=${w},${h}`,
	`--screenshot=${outPng}`, `file://${inHtml}`], { stdio: 'ignore' });
console.log(`${outPng} (${w}x${h}) via ${bin}`);
