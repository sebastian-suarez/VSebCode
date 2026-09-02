#!/usr/bin/env node
// contact-a03.mjs — thin, slice-local contact sheet for A03. Writes
// production/contact-A03.html and, with --png, the 2x screenshot beside it.
// Deliberately local: tools/contact.mjs is shared and is not touched.

import { readFileSync, writeFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { homedir, tmpdir } from 'node:os';

const ROOT = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production';
const roster = JSON.parse(readFileSync(new URL('./roster.json', import.meta.url), 'utf8'));
const WORK = JSON.parse(readFileSync(join(ROOT, 'longtail-worklist.json'), 'utf8'));
const concepts = new Map(WORK.slices.find(s => s.id === 'A03').concepts.map(c => [c.id, c]));

const GROUPS = [
	['Languages & dialects', ['forth', 'fortran', 'foxpro', 'gleam', 'grain', 'groovy', 'harbour', 'haxe',
		'haxedevelop', 'hy', 'icl', 'idris', 'idrisbin', 'idrispkg', 'imba', 'janet']],
	['Systems, shaders & hardware', ['fbx', 'fritzing', 'gcode', 'glsl', 'hlsl', 'godotshader', 'hip', 'huff', 'io']],
	['Game engines & assets', ['gamemaker', 'gamemaker2', 'gamemaker81', 'godot', 'gdscript', 'gduid', 'godot-assets']],
	['Web frameworks & app platforms', ['flutter-package', 'formkit', 'gatsby', 'glimmer', 'gridsome', 'ionic', 'jekyll', 'hurl']],
	['Templating & markup', ['freemarker', 'fthtml', 'haml', 'handlebars', 'hjson', 'hygen', 'inc']],
	['Build, packaging & task runners', ['fastlane', 'fusebox', 'goctl', 'grunt', 'gulp', 'jake', 'innosetup', 'grit']],
	['Data, schemas & databases', ['fauna', 'firebasestorage', 'firestore', 'flatbuffers', 'graphcool', 'graphqls',
		'graphviz', 'informix', 'jbuilder']],
	['Tooling, infra & everything else', ['fla', 'flash', 'fitbit', 'flow', 'flowgorithm', 'fossil', 'fsproj', 'galen',
		'genstat', 'gnuplot', 'google', 'grok', 'hashicorp', 'hcl', 'hunspell', 'hypr', 'infopath', 'ink', 'iodine',
		'jest-snapshot']]
];
const grouped = GROUPS.flatMap(g => g[1]);
if (grouped.length !== roster.length) { throw new Error(`grouped ${grouped.length} != roster ${roster.length}`); }
for (const id of roster.map(r => r.id)) { if (!grouped.includes(id)) { throw new Error(`ungrouped ${id}`); } }
if (new Set(grouped).size !== grouped.length) { throw new Error('a concept is in two groups'); }

/** A filename the theme will actually match this icon on. */
function sample(id) {
	const m = concepts.get(id).match;
	if (m.filenames.length) { return m.filenames.slice().sort((a, b) => a.length - b.length)[0]; }
	if (m.extensions.length) {
		// the canonical extension: the one the id is named after, else the shortest
		const ext = m.extensions.find(e => id.startsWith(e) || e.startsWith(id))
			?? m.extensions.slice().sort((a, b) => a.length - b.length)[0];
		return `${id.replace(/[^a-z0-9]/g, '')}.${ext}`;
	}
	return `${id}.${(m.languageIds[0] || 'txt')}`;
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const icons = roster.map(r => {
	const src = readFileSync(join(ROOT, 'svg/file', `${r.id}.svg`), 'utf8');
	return {
		...r, bytes: Buffer.byteLength(src), file: sample(r.id),
		inner: src.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')
	};
});
const byId = new Map(icons.map(i => [i.id, i]));
const totalBytes = icons.reduce((a, i) => a + i.bytes, 0);

const defs = `<svg width="0" height="0" aria-hidden="true" style="position:absolute"><defs>
${icons.map(i => `<symbol id="a-${i.id}" viewBox="0 0 16 16">${i.inner}</symbol>`).join('\n')}
</defs></svg>`;

const at = (id, px) => `<svg class="ic" width="${px}" height="${px}"><use href="#a-${id}"/></svg>`;

const gridSections = GROUPS.map(([title, ids]) => `<section><h3>${esc(title)} <span>${ids.length}</span></h3>
<div class="grid">${ids.map(id => `<figure>${at(id, 16)}<figcaption>${esc(id)}</figcaption></figure>`).join('')}</div>
</section>`).join('');

const treeSections = GROUPS.map(([title, ids]) => `<section><h3>${esc(title)}</h3>
<div class="tree">${ids.map(id => `<div class="row">${at(id, 16)}<span>${esc(byId.get(id).file)}</span></div>`).join('')}</div>
</section>`).join('');

const rows = GROUPS.flatMap(([, ids]) => ids).map(id => {
	const i = byId.get(id);
	return `<tr><td>${at(id, 16)} ${esc(i.id)}</td><td>${i.archetype}</td><td class="num">${i.bytes}</td>`
		+ `<td><i class="sw" style="background:${i.fill}"></i>${esc(i.fill)}</td><td>${esc(i.note)}</td></tr>`;
}).join('');

const html = `<title>M11 long tail — slice A03</title>
<style>
:root{--bg:#121314;--fg:#D7D9DA;--dim:#8A9092;--line:#26282A;--row:#1E1E1E}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font:13px/1.55 -apple-system,BlinkMacSystemFont,system-ui,sans-serif;padding:32px 36px 64px}
.wrap{max-width:1160px;margin:0 auto}
h1{font-size:22px;font-weight:650;margin:0 0 4px}
h2{font-size:15px;font-weight:650;margin:44px 0 6px;padding-bottom:8px;border-bottom:1px solid var(--line)}
h3{font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--dim);margin:22px 0 10px}
h3 span{color:#5C6163;font-weight:400}
.lede{color:var(--dim);margin:0 0 4px;max-width:76ch}
.meta{color:#5C6163;font:11px/1.6 ui-monospace,Menlo,monospace;margin-top:10px}
.ic{display:block;flex:none}
.grid{display:flex;flex-wrap:wrap;gap:10px}
figure{margin:0;width:82px;display:flex;flex-direction:column;align-items:center;gap:7px;padding:10px 4px 8px;background:#171819;border:1px solid var(--line);border-radius:6px}
figcaption{font:10px/1.3 ui-monospace,Menlo,monospace;color:var(--dim);text-align:center;word-break:break-all}
.tree{columns:3;column-gap:26px}
.row{display:flex;align-items:center;gap:8px;height:22px;padding:0 8px;break-inside:avoid;border-radius:3px}
.row:nth-child(odd){background:var(--row)}
.row span{font:12px/22px -apple-system,system-ui,sans-serif;color:#C8CCCE;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
table{width:100%;border-collapse:collapse;font:12px/1.5 -apple-system,system-ui,sans-serif}
th,td{text-align:left;padding:5px 10px;border-bottom:1px solid var(--line);vertical-align:middle}
th{color:var(--dim);font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.04em}
td:first-child{display:flex;align-items:center;gap:8px;font:11px/1.5 ui-monospace,Menlo,monospace}
td:nth-child(2){font:11px/1.5 ui-monospace,Menlo,monospace;color:var(--dim)}
.num{text-align:right;font:11px/1.5 ui-monospace,Menlo,monospace;color:var(--dim)}
td:nth-child(4){font:11px/1.5 ui-monospace,Menlo,monospace}
td:nth-child(5){color:var(--dim);font-size:11px}
.sw{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:7px;vertical-align:-1px}
tfoot td{color:var(--dim);font-weight:600}
</style>
${defs}
<div class="wrap">
<h1>M11 long tail — slice A03</h1>
<p class="lede">The 84 A03 concepts (fastlane → jest-snapshot), authored against
spec.md §11. Real marks where the concept has one that survives 16&nbsp;px; letters only as
the fallback. R7 is clean inside the slice and R8 is clean set-wide.</p>
<p class="meta">${icons.length} icons · ${GROUPS.map(g => g[1].length).length} groups ·
BADGE ${icons.filter(i => i.archetype === 'BADGE').length} ·
SILHOUETTE ${icons.filter(i => i.archetype === 'SILHOUETTE').length} ·
GLYPH ${icons.filter(i => i.archetype === 'GLYPH').length} ·
${totalBytes} B total, ${Math.round(totalBytes / icons.length)} B avg,
${Math.max(...icons.map(i => i.bytes))} B max</p>

<h2>16&nbsp;px grid</h2>
<p class="lede">The primary render. Everything below is the same artwork at the same size.</p>
${gridSections}

<h2>22&nbsp;px tree rows</h2>
<p class="lede">The real context: explorer rows at 22&nbsp;px, 16&nbsp;px icons, on a filename
the theme actually matches this icon on.</p>
${treeSections}

<h2>Manifest</h2>
<table>
<thead><tr><th>id</th><th>archetype</th><th class="num">bytes</th><th>fill</th><th>colour source</th></tr></thead>
<tbody>${rows}</tbody>
<tfoot><tr><td>${icons.length} icons</td><td></td><td class="num">${totalBytes}</td><td></td><td></td></tr></tfoot>
</table>
</div>`;

const out = join(ROOT, 'contact-A03.html');
writeFileSync(out, html, 'utf8');
console.log(`${out}  (${Buffer.byteLength(html)} bytes, ${icons.length} icons)`);

// ---- 2x screenshot ----------------------------------------------------------
if (!process.argv.includes('--png')) { process.exit(0); }
const WIDTH = 1240;
function chromium() {
	const cache = join(homedir(), 'Library/Caches/ms-playwright');
	for (const b of readdirSync(cache).filter(d => /^chromium-\d+$/.test(d)).sort((a, b) => +b.split('-')[1] - +a.split('-')[1])) {
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
const bin = chromium();
const probe = join(tmpdir(), `a03-probe-${process.pid}.html`);
writeFileSync(probe, `<!doctype html><body style="margin:0"><pre id="o"></pre>`
	+ `<iframe id="f" src="file://${out}" style="width:${WIDTH}px;height:400px;border:0"></iframe>`
	+ `<script>f.onload=()=>{document.getElementById('o').textContent='H='+f.contentDocument.documentElement.scrollHeight}</script>`);
const dom = execFileSync(bin, [...COMMON, `--window-size=${WIDTH + 200},600`, '--dump-dom', `file://${probe}`],
	{ encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
rmSync(probe, { force: true });
const h = /H=(\d+)/.exec(dom);
if (!h) { throw new Error('could not measure the page height'); }
const png = join(ROOT, 'contact-A03.png');
execFileSync(bin, [...COMMON, '--force-device-scale-factor=2', '--default-background-color=121314ff',
	`--window-size=${WIDTH},${h[1]}`, `--screenshot=${png}`, `file://${out}`], { stdio: ['ignore', 'ignore', 'ignore'] });
console.log(`${png}  (${WIDTH}x${h[1]} css px at 2x, ${readFileSync(png).length} bytes)`);
console.log(`  renderer: ${bin}`);
