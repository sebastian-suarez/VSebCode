#!/usr/bin/env node
// contact-A06.mjs — thin contact sheet for long-tail slice A06 (84 file icons).
//
//   node contact-A06.mjs            # writes contact-A06.html
//   node contact-A06.mjs --png      # + a 2x screenshot through the Playwright chromium
//
// Deliberately local to this slice: the shared tools/contact.mjs is untouched. Sections:
// the 16 px grid (the primary render), 22 px tree rows against real matched filenames
// from longtail-worklist.json, and the manifest footer (id / archetype / bytes / colour).

import { readFileSync, writeFileSync, readdirSync, existsSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { homedir, tmpdir } from 'node:os';

const DIR = dirname(fileURLToPath(import.meta.url));
const SVG = join(DIR, 'svg', 'file');
const HTML = join(DIR, 'contact-A06.html');
const PNG = join(DIR, 'contact-A06.png');
const WIDTH = 1240;

const slice = JSON.parse(readFileSync(join(DIR, 'longtail-worklist.json'), 'utf8'))
	.slices.find(s => s.id === 'A06');
const roster = JSON.parse(readFileSync(join(DIR, 'contact-A06.roster.json'), 'utf8'));
const byId = new Map(roster.map(r => [r.id, r]));

// ---- groups (the review order: family before alphabet) ----------------------
const GROUPS = [
	['Languages & dialects', ['pony', 'processing', 'processinglang', 'progress', 'prolog', 'purescript',
		'pyret', 'pyscript', 'pythowo', 'q', 'qsharp', 'racket', 'raku', 'reason', 'red', 'rescript',
		'rescript-interface', 'rexx', 's-lang', 'scheme', 'script', 'polymer']],
	['Frameworks & UI', ['qbs', 'qml', 'qmldir', 'qrc', 'qwik', 'razor', 'reacttemplate', 'redux-action',
		'redux-reducer', 'redux-selector', 'redux-store', 'riot', 'ripple', 'routing', 'san', 'scss']],
	['Build, config & toolchains', ['poetry', 'powershell-format', 'powershell-psd', 'powershell-psm',
		'powershell-types', 'prismaconfig', 'puppet', 'pythonconfig', 'pytyped', 'quokka',
		'ra-syntax-tree', 'rake', 'rbxmk', 'rego', 'robotframework', 'rust-toolchain', 'saltstack',
		'sbt', 'scons']],
	['Data, query & analytics', ['powerbi', 'prql', 'qlikview', 'restql', 'ron', 'rproj', 'rmd', 'sas',
		'scilab', 'sdlang']],
	['Docs, markup & feeds', ['polyglot', 'poml', 'postscript', 'publisher', 'pug', 'quarkdown', 'quarto',
		'raml', 'rnc', 'rss', 'search', 'search-result']],
	['Platforms & services', ['prometheus', 'replit', 'roblox', 'salesforce', 'sentry']]
];

// ---- a real matched filename per concept ------------------------------------
// the extension a reader recognises, where the worklist's first one is not it
const EXT = {
	prolog: 'pl', purescript: 'purs', racket: 'rkt', scheme: 'scm', rescript: 'res',
	reason: 're', 'rescript-interface': 'resi', pyret: 'arr', 'ra-syntax-tree': 'rast',
	roblox: 'rbxl', qlikview: 'qvw', progress: 'w', publisher: 'pub', 'redux-store': 'store.ts'
};
function sample(c) {
	const m = c.match;
	if (m.extensions?.length) {
		const e = EXT[c.id] || (m.extensions.includes(c.id) ? c.id : m.extensions[0]);
		return (e.includes('.') ? 'app.' : 'main.') + e;
	}
	if (m.filenames?.length) { return m.filenames[0]; }
	if (m.languageIds?.length) { return `⟨lang: ${m.languageIds[0]}⟩`; }
	return c.id;
}
const concept = new Map(slice.concepts.map(c => [c.id, c]));

const symbols = [];
const seen = new Set();
for (const c of slice.concepts) {
	const src = readFileSync(join(SVG, `${c.id}.svg`), 'utf8');
	const body = src.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
	symbols.push(`<symbol id="i-${c.id}" viewBox="0 0 16 16">${body}</symbol>`);
	seen.add(c.id);
}
const use = (id, px) => `<svg class="i" width="${px}" height="${px}"><use href="#i-${id}"/></svg>`;

const grid = slice.concepts.map(c =>
	`<figure><div class="b">${use(c.id, 16)}</div><figcaption>${c.id}</figcaption></figure>`).join('');

const rows = GROUPS.map(([title, ids]) => {
	const missing = ids.filter(i => !seen.has(i));
	if (missing.length) { throw new Error(`group ${title}: unknown id ${missing.join(', ')}`); }
	const list = ids.map(id => `<div class="row">${use(id, 22)}<span>${sample(concept.get(id))}</span></div>`).join('');
	return `<section><h3>${title} <em>${ids.length}</em></h3><div class="tree">${list}</div></section>`;
}).join('');

const grouped = new Set(GROUPS.flatMap(g => g[1]));
const ungrouped = [...seen].filter(id => !grouped.has(id));
if (ungrouped.length) { throw new Error(`not in any group: ${ungrouped.join(', ')}`); }

const manifest = roster.slice().sort((a, b) => a.id.localeCompare(b.id)).map(r =>
	`<tr><td>${use(r.id, 16)}</td><td class="id">${r.id}</td><td>${r.arch}</td>`
	+ `<td class="n">${r.bytes}</td><td class="sw">${r.fills.map(f =>
		`<i style="background:${f}"></i>${f}`).join(' ')}</td><td class="src">${r.src}</td></tr>`).join('');

const totals = {
	n: roster.length,
	bytes: roster.reduce((s, r) => s + r.bytes, 0),
	max: Math.max(...roster.map(r => r.bytes)),
	arch: roster.reduce((a, r) => (a[r.arch] = (a[r.arch] || 0) + 1, a), {})
};

const html = `<meta charset="utf-8"><title>M11 long-tail A06</title><style>
:root{color-scheme:dark}
body{margin:0;background:#121314;color:#D7D9DA;font:13px/1.5 -apple-system,system-ui,sans-serif;
padding:32px 28px 60px;width:${WIDTH}px;box-sizing:border-box}
h1{font-size:19px;margin:0 0 4px;font-weight:650}
h2{font-size:13px;margin:34px 0 12px;color:#8A9092;font-weight:600;letter-spacing:.04em;text-transform:uppercase}
h3{font-size:12px;margin:0 0 8px;color:#9FA5A8;font-weight:600}
h3 em{color:#5C6163;font-style:normal;font-weight:400}
p.lead{margin:0 0 6px;color:#8A9092;max-width:900px}
.i{display:block}
.grid{display:grid;grid-template-columns:repeat(12,1fr);gap:14px 8px}
.grid figure{margin:0;text-align:center}
.grid .b{height:34px;display:flex;align-items:center;justify-content:center}
.grid figcaption{font:9.5px/1.25 ui-monospace,Menlo,monospace;color:#767C7E;word-break:break-word}
.cols{columns:3;column-gap:26px}
section{break-inside:avoid;margin:0 0 18px}
.tree{background:#181A1B;border-radius:6px;padding:5px 0}
.row{display:flex;align-items:center;gap:7px;height:22px;padding:0 10px}
.row:hover{background:#202325}
.row span{font:12px/22px -apple-system,system-ui,sans-serif;color:#C4C8CA;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
table{border-collapse:collapse;width:100%;font:11px/1.5 ui-monospace,Menlo,monospace}
td{padding:3px 8px 3px 0;border-bottom:1px solid #1E2122;vertical-align:middle}
th{text-align:left;padding:0 8px 6px 0;color:#767C7E;font-weight:600;border-bottom:1px solid #2A2E30}
td.id{color:#D7D9DA}td.n{color:#8A9092;text-align:right}
td.sw i{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:4px;vertical-align:-1px}
td.sw{color:#8A9092;white-space:nowrap}
td.src{color:#767C7E}
</style>
<svg width="0" height="0" style="position:absolute">${symbols.join('')}</svg>
<h1>M11 long-tail — slice A06</h1>
<p class="lead">${totals.n} file icons · ${totals.arch.BADGE} badge / ${totals.arch.GLYPH} glyph /
${totals.arch.SILHOUETTE} silhouette · ${totals.bytes} B total, ${Math.round(totals.bytes / totals.n)} B avg,
${totals.max} B max. Rendered over the editor background #121314.</p>
<h2>16 px — the primary render</h2>
<div class="grid">${grid}</div>
<h2>22 px — tree rows, real matched filenames</h2>
<div class="cols">${rows}</div>
<h2>manifest</h2>
<table><tr><th></th><th>id</th><th>archetype</th><th>bytes</th><th>fills</th><th>colour source</th></tr>
${manifest}</table>`;

writeFileSync(HTML, html);
console.log(HTML);

// ---- optional 2x screenshot -------------------------------------------------
if (process.argv.includes('--png')) {
	const cache = join(homedir(), 'Library/Caches/ms-playwright');
	let bin = null;
	for (const b of readdirSync(cache).filter(d => /^chromium-\d+$/.test(d))
		.sort((a, b) => +b.split('-')[1] - +a.split('-')[1])) {
		const macos = join(cache, b, 'chrome-mac-arm64');
		for (const app of readdirSync(macos).filter(f => f.endsWith('.app'))) {
			const p = join(macos, app, 'Contents/MacOS', app.replace(/\.app$/, ''));
			if (existsSync(p)) { bin = p; break; }
		}
		if (bin) { break; }
	}
	if (!bin) { throw new Error(`no Playwright chromium under ${cache}`); }
	const COMMON = ['--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
		'--allow-file-access-from-files', '--virtual-time-budget=8000'];
	const probe = join(tmpdir(), `a06-contact-probe-${process.pid}.html`);
	writeFileSync(probe, `<!doctype html><body style="margin:0"><pre id="o"></pre>`
		+ `<iframe id="f" src="file://${HTML}" style="width:${WIDTH}px;height:400px;border:0"></iframe>`
		+ `<script>f.onload=()=>{document.getElementById('o').textContent='PAGEHEIGHT='+f.contentDocument.documentElement.scrollHeight}</script>`);
	const dom = execFileSync(bin, [...COMMON, `--window-size=${WIDTH + 200},600`, '--dump-dom', `file://${probe}`],
		{ encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
	rmSync(probe, { force: true });
	const m = /PAGEHEIGHT=(\d+)/.exec(dom);
	if (!m) { throw new Error('could not measure the page height'); }
	execFileSync(bin, [...COMMON, '--force-device-scale-factor=2', '--default-background-color=121314ff',
		`--window-size=${WIDTH},${m[1]}`, `--screenshot=${PNG}`, `file://${HTML}`],
		{ stdio: ['ignore', 'ignore', 'ignore'] });
	console.log(`${PNG}  ${WIDTH}x${m[1]} @2x`);
}
