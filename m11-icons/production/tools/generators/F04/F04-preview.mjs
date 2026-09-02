#!/usr/bin/env node
// F04-preview.mjs — quick eyeball sheet: every F04 emblem, closed + open, at 64 and 16.
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { homedir, tmpdir } from 'node:os';
import { EMBLEMS } from './F04-emblems.mjs';

const ROOT = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production';
const SCRATCH = '/private/tmp/claude-501/-Users-sebastian-suarez-Projects-VSebCode/cd497411-6ae3-485b-8bfb-25848c779b0a/scratchpad';

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

const inner = (id) => readFileSync(join(ROOT, 'svg/folder', `${id}.svg`), 'utf8')
	.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');

const cells = EMBLEMS.map(e => `<div class="c">
<div class="r">
<svg viewBox="0 0 16 16" width="64" height="64">${inner(e.id)}</svg>
<svg viewBox="0 0 16 16" width="64" height="64">${inner(e.id + '-open')}</svg>
<svg viewBox="0 0 16 16" width="22" height="22">${inner(e.id)}</svg>
<svg viewBox="0 0 16 16" width="22" height="22">${inner(e.id + '-open')}</svg>
<svg viewBox="0 0 16 16" width="16" height="16">${inner(e.id)}</svg>
<svg viewBox="0 0 16 16" width="16" height="16">${inner(e.id + '-open')}</svg>
</div><div class="l">${e.id} — ${e.desc}</div></div>`).join('\n');

const html = `<meta charset="utf-8"><style>
body{background:#121314;color:#c9ced6;font:11px -apple-system,sans-serif;margin:16px}
.g{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.c{border:1px solid #23262b;padding:6px;border-radius:6px}
.r{display:flex;align-items:center;gap:6px}
.l{margin-top:4px;color:#8b929c}
</style><div class="g">${cells}</div>`;

const page = join(SCRATCH, 'F04-preview.html');
writeFileSync(page, html);
const png = join(SCRATCH, 'F04-preview.png');
execFileSync(chromium(), ['--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
	'--allow-file-access-from-files', '--virtual-time-budget=8000',
	'--default-background-color=121314ff', '--window-size=1100,3000',
	`--screenshot=${png}`, `file://${page}`], { stdio: ['ignore', 'ignore', 'ignore'] });
console.log(png);
