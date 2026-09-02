// shoot.mjs — screenshot any local html at a given window size.
//   node shoot.mjs <html> <png> <width> <height> [scale]
import { execFileSync } from 'node:child_process';
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const cache = join(homedir(), 'Library/Caches/ms-playwright');
const build = readdirSync(cache).filter(d => /^chromium-\d+$/.test(d))
	.sort((a, b) => +b.split('-')[1] - +a.split('-')[1])[0];
const macos = join(cache, build, 'chrome-mac-arm64');
const app = readdirSync(macos).find(f => f.endsWith('.app'));
const bin = join(macos, app, 'Contents/MacOS', app.replace(/\.app$/, ''));
if (!existsSync(bin)) { throw new Error('no chromium'); }

const [html, png, w = '1400', h = '1000', scale = '1'] = process.argv.slice(2);
execFileSync(bin, ['--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
	'--allow-file-access-from-files', '--virtual-time-budget=15000',
	`--force-device-scale-factor=${scale}`, '--default-background-color=121314ff',
	`--window-size=${w},${h}`, `--screenshot=${png}`, `file://${html}`], { stdio: 'inherit' });
console.log(png);
