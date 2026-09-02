// preview.mjs — quick visual sheet of the slice at 64/22/16 px, screenshot via Playwright chromium.
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { ICONS } from './icons.mjs';

const PROD = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production';
function chromium() {
	const cache = join(homedir(), 'Library/Caches/ms-playwright');
	const builds = readdirSync(cache).filter(dd => /^chromium-\d+$/.test(dd))
		.sort((a, b) => +b.split('-')[1] - +a.split('-')[1]);
	for (const b of builds) {
		const macos = join(cache, b, 'chrome-mac-arm64');
		for (const app of readdirSync(macos).filter(f => f.endsWith('.app'))) {
			const bin = join(macos, app, 'Contents/MacOS', app.replace(/\.app$/, ''));
			if (existsSync(bin)) { return bin; }
		}
	}
	throw new Error('no chromium');
}

const only = process.argv.slice(2).filter(a => !a.startsWith('--'));
const list = only.length ? ICONS.filter(i => only.includes(i.id)) : ICONS;
const cells = list.map(ic => {
	const src = readFileSync(`${PROD}/svg/file/${ic.id}.svg`, 'utf8');
	const uri = 'data:image/svg+xml;base64,' + Buffer.from(src, 'utf8').toString('base64');
	return `<figure><div class=r><img src="${uri}" width="64" height="64"><img src="${uri}" width="22" height="22"><img src="${uri}" width="16" height="16"></div><figcaption>${ic.id}</figcaption></figure>`;
}).join('');
const html = `<!doctype html><meta charset=utf-8><style>
body{margin:0;background:#121314;color:#D7D9DA;font:12px/1.4 -apple-system,system-ui,sans-serif;padding:16px}
.g{display:grid;grid-template-columns:repeat(7,1fr);gap:14px}
figure{margin:0;text-align:center}.r{display:flex;align-items:flex-end;justify-content:center;gap:8px;height:70px}
figcaption{color:#8A9092;margin-top:4px;font:10px/1.3 ui-monospace,Menlo,monospace}
</style><div class=g>${cells}</div>`;
writeFileSync('/tmp/a02-preview.html', html);
const rows = Math.ceil(list.length / 7);
execFileSync(chromium(), ['--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
	'--force-device-scale-factor=2', '--virtual-time-budget=8000',
	`--window-size=1180,${rows * 106 + 40}`,
	'--screenshot=/tmp/a02-preview.png', 'file:///tmp/a02-preview.html'], { stdio: 'ignore' });
console.log('/tmp/a02-preview.png');
