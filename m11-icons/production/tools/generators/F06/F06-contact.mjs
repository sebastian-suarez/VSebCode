#!/usr/bin/env node
// F06-contact.mjs — thin local contact-sheet builder for folder slice F06.
// Emits ../contact-F06.html and, with --png, a 2x screenshot beside it.
// Every icon is inlined once as a <symbol>; the page makes no external request.

import { readFileSync, writeFileSync, readdirSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { homedir, tmpdir } from 'node:os';

const ROOT = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production';
const DIR = join(ROOT, 'svg/folder');
const SCRATCH = '/private/tmp/claude-501/-Users-sebastian-suarez-Projects-VSebCode/cd497411-6ae3-485b-8bfb-25848c779b0a/scratchpad';

const MAN = JSON.parse(readFileSync(join(SCRATCH, 'F06-manifest.json'), 'utf8'));
const WORK = JSON.parse(readFileSync(join(ROOT, 'longtail-worklist.json'), 'utf8'))
	.slices.find(s => s.id === 'F06');
const LABEL = Object.fromEntries(WORK.concepts.map(c => [c.id, c.match.folderNames[0]]));
const NAME = Object.fromEntries(WORK.concepts.map(c => [c.id, c.label]));

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ---- symbols --------------------------------------------------------------------
const CORE = ['folder', 'folder-open', 'src', 'test', 'config', 'docs', 'node', 'images', 'git', 'vscode'];
const ALL = [...MAN.flatMap(m => [m.id, m.id + '-open']), ...CORE];
const symbols = ALL.map(id => {
	const src = readFileSync(join(DIR, `${id}.svg`), 'utf8');
	const body = src.slice(src.indexOf('>') + 1, src.lastIndexOf('</svg>'));
	return `<symbol id="i-${id}" viewBox="0 0 16 16">${body}</symbol>`;
}).join('');

const use = (id, px) => `<svg class="ic" width="${px}" height="${px}"><use href="#i-${id}"/></svg>`;

// ---- sections -------------------------------------------------------------------
const sizes = [16, 22, 32, 64];

const pairRows = MAN.map(m => `<tr>
  <th>${esc(m.id)}</th>
  ${sizes.map(px => `<td><span class="cell">${use(m.id, px)}${use(m.id + '-open', px)}</span></td>`).join('')}
  <td class="tree">
    <div class="row">${use(m.id, 22)}<span>${esc(LABEL[m.id])}</span></div>
    <div class="row open">${use(m.id + '-open', 22)}<span>${esc(LABEL[m.id])}</span></div>
  </td>
  <td class="d">${esc(m.desc)}</td>
</tr>`).join('\n');

// tree column: the 22 px row in its real context, closed above open
const tree = MAN.map(m => `<div class="row">${use(m.id, 22)}<span>${esc(LABEL[m.id])}</span></div>`).join('');
const treeOpen = MAN.map(m => `<div class="row">${use(m.id + '-open', 22)}<span>${esc(LABEL[m.id])}</span></div>`).join('');

// mixed strip: slice icons interleaved with the core folders they sit beside
const MIX = ['folder', 'src', 'target', 'test', 'tools', 'config', 'tasks', 'docs', 'toc',
	'node', 'vitepress', 'images', 'story', 'git', 'travis', 'vscode', 'vs', 'folder-open',
	'store', 'update', 'upload', 'windows', 'unity', 'zed', 'www', 'wordpress', 'telegram'];
const mixed = MIX.map(id => `<span class="mixcell">${use(id, 32)}<em>${esc(id)}</em></span>`).join('');
const mixed16 = MIX.map(id => use(id, 16)).join('');

const rows = MAN.map(m => `<tr><td class="m">${esc(m.id)}</td><td>${esc(m.desc)}</td>` +
	`<td class="hex"><i style="background:${m.fill}"></i>${m.fill}</td>` +
	`<td>${esc(m.source)}</td><td class="n">${m.bytes} / ${m.bytesOpen}</td></tr>`).join('\n');

const html = `<!doctype html><html><head><meta charset="utf-8">
<title>M11 folder slice F06</title>
<style>
 :root { color-scheme: dark; }
 body { margin:0; padding:28px 32px 56px; background:#121314; color:#C9CDD3;
        font:13px/1.5 -apple-system, "SF Pro Text", system-ui, sans-serif; }
 h1 { font-size:19px; font-weight:600; color:#E7EAEE; margin:0 0 4px; letter-spacing:-.01em; }
 h2 { font-size:12px; font-weight:600; color:#8A9099; text-transform:uppercase;
      letter-spacing:.08em; margin:34px 0 12px; }
 p.sub { margin:0 0 6px; color:#767C85; }
 .ic { display:block; }
 table { border-collapse:collapse; width:100%; }
 td, th { padding:6px 10px; vertical-align:middle; border-bottom:1px solid #1E2023; }
 th { text-align:left; font-weight:500; color:#9AA0A8; white-space:nowrap; font-variant-numeric:tabular-nums; }
 .cell { display:inline-flex; gap:8px; align-items:center; }
 td.d { color:#767C85; font-size:12px; }
 .tree .row { display:flex; align-items:center; gap:6px; height:22px; color:#C9CDD3; white-space:nowrap; }
 .tree .row.open span { color:#E7EAEE; }
 .cols { display:flex; gap:40px; flex-wrap:wrap; }
 .col { background:#171819; border:1px solid #202225; border-radius:6px; padding:10px 14px; }
 .col .row { display:flex; align-items:center; gap:7px; height:23px; }
 .col .row span { white-space:nowrap; }
 .strip { display:flex; flex-wrap:wrap; gap:14px 18px; align-items:flex-start;
          background:#171819; border:1px solid #202225; border-radius:6px; padding:16px; }
 .mixcell { display:flex; flex-direction:column; align-items:center; gap:6px; width:64px; }
 .mixcell em { font-style:normal; font-size:10px; color:#6B717A; }
 .strip16 { display:flex; gap:6px; align-items:center; background:#171819;
            border:1px solid #202225; border-radius:6px; padding:12px 16px; margin-top:12px; }
 table.man td { font-size:12px; }
 td.m { color:#E7EAEE; font-weight:500; white-space:nowrap; }
 td.hex { white-space:nowrap; font-variant-numeric:tabular-nums; color:#9AA0A8; }
 td.hex i { display:inline-block; width:10px; height:10px; border-radius:2px;
            margin-right:6px; vertical-align:-1px; }
 td.n { text-align:right; color:#767C85; font-variant-numeric:tabular-nums; white-space:nowrap; }
</style></head><body>
<svg width="0" height="0" style="position:absolute" aria-hidden="true">${symbols}</svg>

<h1>M11 long-tail — folder slice F06</h1>
<p class="sub">${MAN.length} concepts, ${MAN.length * 2} files. Canon tan base verbatim + one emblem
mapped by a uniform transform into the R9a box (closed 8.20 @ 5.30–13.50 / 4.60–12.80,
open 5.80 @ 7.26–13.06 / 6.75–12.55). Emblems are darker than the tan; brand hue only where earned.</p>

<h2>Closed + open at 16 / 22 / 32 / 64 &nbsp;·&nbsp; on #121314</h2>
<table>
 <tr><th></th><th>16</th><th>22</th><th>32</th><th>64</th><th>tree row (22)</th><th>emblem</th></tr>
 ${pairRows}
</table>

<h2>Tree rows at 22 px, real folder names</h2>
<div class="cols">
  <div class="col">${tree}</div>
  <div class="col">${treeOpen}</div>
</div>

<h2>Mixed strip — slice icons beside the core folders</h2>
<div class="strip">${mixed}</div>
<div class="strip16">${mixed16}</div>

<h2>Manifest</h2>
<table class="man">
 <tr><th>id</th><th>emblem</th><th>hex</th><th>colour source</th><th>bytes closed / open</th></tr>
 ${rows}
</table>
</body></html>`;

const out = join(ROOT, 'contact-F06.html');
writeFileSync(out, html, 'utf8');
console.log(`${out}  (${Buffer.byteLength(html)} bytes, ${MAN.length * 2} icons)`);

// ---- 2x screenshot ---------------------------------------------------------------
const WIDTH = 1240;
// Chrome for Testing 147 dropped the old-headless command flags (--dump-dom /
// --screenshot hang forever), so prefer the chrome-headless-shell build that
// Playwright ships in the same cache; fall back to the .app for older caches.
function chromium() {
	const cache = join(homedir(), 'Library/Caches/ms-playwright');
	const dirs = readdirSync(cache);
	const shells = dirs.filter(d => /^chromium_headless_shell-\d+$/.test(d))
		.sort((a, b) => +b.split('-')[1] - +a.split('-')[1]);
	for (const b of shells) {
		const bin = join(cache, b, 'chrome-headless-shell-mac-arm64', 'chrome-headless-shell');
		if (existsSync(bin)) { return bin; }
	}
	for (const b of dirs.filter(d => /^chromium-\d+$/.test(d)).sort((a, b) => +b.split('-')[1] - +a.split('-')[1])) {
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

if (process.argv.includes('--png')) {
	const bin = chromium();
	const probe = join(tmpdir(), `F06-probe-${process.pid}.html`);
	writeFileSync(probe, `<!doctype html><body style="margin:0"><pre id="o"></pre>` +
		`<iframe id="f" src="file://${out}" style="width:${WIDTH}px;height:400px;border:0"></iframe>` +
		`<script>f.onload=()=>{document.getElementById('o').textContent='H='+f.contentDocument.documentElement.scrollHeight}</script>`);
	const dom = execFileSync(bin, [...COMMON, `--window-size=${WIDTH + 200},600`, '--dump-dom', `file://${probe}`],
		{ encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1 << 26 });
	rmSync(probe, { force: true });
	const height = +/H=(\d+)/.exec(dom)[1];
	const png = join(ROOT, 'contact-F06.png');
	execFileSync(bin, [...COMMON, '--force-device-scale-factor=2', '--default-background-color=121314ff',
		`--window-size=${WIDTH},${height}`, `--screenshot=${png}`, `file://${out}`],
		{ stdio: ['ignore', 'ignore', 'ignore'] });
	console.log(`${png}  (${WIDTH}x${height} css px at 2x, ${readFileSync(png).length} bytes)`);
	console.log(`  renderer: ${bin}`);
}
