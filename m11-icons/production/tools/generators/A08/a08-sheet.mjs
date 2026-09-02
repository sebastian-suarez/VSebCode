// a08-sheet.mjs — thin contact sheet for slice A08 (scratch builder; shared tools untouched).
//   node a08-sheet.mjs --png
import { readFileSync, writeFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { homedir, tmpdir } from 'node:os';
import { ROSTER } from './a08-roster.mjs';

const PROD = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const GROUPS = [
	['Visual Basic / Visual Studio', ['vb', 'vba', 'vbhtml', 'vbproj', 'vcxproj', 'visualstudio', 'vsixmanifest', 'xcode', 'xaml', 'xib']],
	['Languages — V', ['vedic', 'velocity', 'vento', 'verilog', 'verse', 'vfl', 'vhdl', 'virtual', 'vlang', 'volt', 'vr', 'vroom', 'vuex-store', 'vvvvvv', 'vyper']],
	['Languages / tools — W', ['wakatime', 'wallaby', 'wally', 'warp', 'wasp', 'wdio', 'weblate', 'wenyan', 'wepy', 'werf', 'wesl', 'wgsl', 'wikitext', 'wit', 'wolfram', 'wurst', 'wxml', 'wxss']],
	['Languages / tools — X, Y, Z', ['xfl', 'xi', 'xliff', 'xmake', 'xorg', 'xquery', 'xsl', 'yacc', 'yang', 'zeabur', 'zephir']],
	['Config — A', ['aikido', 'allcontributors', 'amplify', 'ansible', 'apache', 'api-extractor', 'apollo', 'appsemble', 'appveyor', 'assembly-script', 'astro-config', 'astroconfig', 'astyle', 'asyncapi', 'attw', 'aurelia', 'auto', 'azurepipelines']],
	['Config — B', ['bashly', 'bashly-settings', 'bashly-strings', 'bazaar', 'bazel-ignore', 'bazel-version', 'bitbucket', 'bitbucketpipeline', 'bithound', 'blitz', 'brew', 'browserslist']]
];

const byId = new Map(ROSTER.map(i => [i.id, i]));
for (const i of ROSTER) {
	const file = join(PROD, 'svg', 'file', `${i.id}.svg`);
	const src = readFileSync(file, 'utf8');
	i.bytes = Buffer.byteLength(src);
	i.inner = src.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
}
const missing = GROUPS.flatMap(g => g[1]).filter(id => !byId.has(id));
if (missing.length) { throw new Error('sheet roster mismatch: ' + missing.join(', ')); }

const defs = `<svg width="0" height="0" aria-hidden="true" style="position:absolute"><defs>
${ROSTER.map(i => `<symbol id="a-${i.id}" viewBox="0 0 16 16">${i.inner}</symbol>`).join('\n')}
</defs></svg>`;

const use = (id, px) => `<svg class="i" width="${px}" height="${px}"><use href="#a-${id}"/></svg>`;

const gridCell = (i) => `<figure class="cell">
  <div class="sizes">${use(i.id, 16)}${use(i.id, 32)}</div>
  <figcaption>${esc(i.id)}<span>${i.arch.toLowerCase()}</span></figcaption>
</figure>`;

const treeRow = (i) => `<div class="row">${use(i.id, 22)}<span>${esc(i.tree)}</span></div>`;

const section = (title, ids) => `<section>
 <h2>${esc(title)} <em>${ids.length}</em></h2>
 <div class="grid">${ids.map(id => gridCell(byId.get(id))).join('')}</div>
 <div class="tree">${ids.map(id => treeRow(byId.get(id))).join('')}</div>
</section>`;

const manifestRows = ROSTER.map(i =>
	`<tr><td>${esc(i.id)}</td><td>${i.arch}</td><td class="sw"><i style="background:${i.fill}"></i>${i.fill}${(i.fills2 || []).map(f => ` <i style="background:${f}"></i>${f}`).join('')}</td><td>${esc(i.src)}</td><td class="n">${i.bytes} B</td></tr>`
).join('\n');

const totalBytes = ROSTER.reduce((a, i) => a + i.bytes, 0);
const maxBytes = Math.max(...ROSTER.map(i => i.bytes));

const html = `<!doctype html><meta charset="utf-8"><title>M11 long-tail A08</title><style>
:root{--bg:#121314;--fg:#D7D9DA;--dim:#8A9092;--line:#26282A;--row:#1A1C1D}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font:13px/1.55 -apple-system,BlinkMacSystemFont,system-ui,sans-serif;padding:32px 36px 64px}
h1{font-size:19px;font-weight:600;margin:0 0 4px}
.sub{color:var(--dim);font-size:12px;margin:0 0 28px}
section{border-top:1px solid var(--line);padding:22px 0 8px}
h2{font-size:13px;font-weight:600;letter-spacing:.02em;margin:0 0 16px;color:var(--fg)}
h2 em{color:var(--dim);font-style:normal;font-weight:400;margin-left:6px}
.grid{display:flex;flex-wrap:wrap;gap:14px 12px;margin-bottom:20px}
.cell{margin:0;width:96px;background:var(--row);border-radius:8px;padding:12px 6px 8px;text-align:center}
.sizes{display:flex;align-items:center;justify-content:center;gap:12px;height:36px}
.i{display:block;image-rendering:auto}
figcaption{margin-top:9px;font:10px/1.35 ui-monospace,Menlo,monospace;color:var(--fg);word-break:break-all}
figcaption span{display:block;color:#5C6163;font-size:9px;letter-spacing:.04em}
.tree{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:0 18px;max-width:1160px}
.row{display:flex;align-items:center;gap:9px;height:24px;padding:0 8px;border-radius:4px;font:12px/1 -apple-system,system-ui,sans-serif;color:#C7CACC}
.row:nth-child(odd){background:#17191A}
.row span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
table{border-collapse:collapse;width:100%;font:11px/1.5 ui-monospace,Menlo,monospace;margin-top:10px}
th{text-align:left;color:var(--dim);font-weight:500;padding:5px 10px 5px 0;border-bottom:1px solid var(--line)}
td{padding:3px 10px 3px 0;border-bottom:1px solid #1B1D1E;vertical-align:top}
td.n{text-align:right;color:var(--dim)}
.sw i{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:4px;vertical-align:-1px}
footer{color:var(--dim);font-size:11px;margin-top:18px}
</style>
${defs}
<h1>M11 long-tail — slice A08</h1>
<p class="sub">${ROSTER.length} file icons · 16 px + 32 px grid, 22 px tree rows on the editor background #121314 · ${totalBytes} B total, ${Math.round(totalBytes / ROSTER.length)} B avg, ${maxBytes} B max</p>
${GROUPS.map(([t, ids]) => section(t, ids)).join('\n')}
<section>
 <h2>Manifest <em>${ROSTER.length}</em></h2>
 <table><thead><tr><th>id</th><th>archetype</th><th>fills</th><th>colour source</th><th class="n">bytes</th></tr></thead>
 <tbody>${manifestRows}</tbody></table>
 <footer>Every letterform is Inter Bold via tools/letterpath.mjs — no &lt;text&gt;, no font-family. Flat fills only, viewBox 0 0 16 16.</footer>
</section>`;

const out = join(PROD, 'contact-A08.html');
writeFileSync(out, html, 'utf8');
console.log(`${out}  (${Buffer.byteLength(html)} bytes)`);

// ---- 2x screenshot ----------------------------------------------------------
if (process.argv.includes('--png')) {
	const cache = join(homedir(), 'Library/Caches/ms-playwright');
	const build = readdirSync(cache).filter(d => /^chromium-\d+$/.test(d))
		.sort((a, b) => +b.split('-')[1] - +a.split('-')[1])[0];
	const macos = join(cache, build, 'chrome-mac-arm64');
	const app = readdirSync(macos).find(f => f.endsWith('.app'));
	const bin = join(macos, app, 'Contents/MacOS', app.replace(/\.app$/, ''));
	if (!existsSync(bin)) { throw new Error('no Playwright chromium'); }

	const COMMON = ['--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
		'--allow-file-access-from-files', '--virtual-time-budget=8000'];
	const WIDTH = 1280;
	const probe = join(tmpdir(), `a08-probe-${process.pid}.html`);
	writeFileSync(probe, `<!doctype html><body style="margin:0"><pre id="o"></pre>`
		+ `<iframe id="f" src="file://${out}" style="width:${WIDTH}px;height:400px;border:0"></iframe>`
		+ `<script>f.onload=()=>{document.getElementById('o').textContent='H='+f.contentDocument.documentElement.scrollHeight}</script>`);
	const dom = execFileSync(bin, [...COMMON, `--window-size=${WIDTH + 200},600`, '--dump-dom', `file://${probe}`],
		{ encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
	rmSync(probe, { force: true });
	const h = +/H=(\d+)/.exec(dom)[1];
	const png = join(PROD, 'contact-A08.png');
	execFileSync(bin, [...COMMON, '--force-device-scale-factor=2', '--default-background-color=121314ff',
		`--window-size=${WIDTH},${h}`, `--screenshot=${png}`, `file://${out}`], { stdio: 'ignore' });
	console.log(`${png}  (${WIDTH}x${h} css px at 2x, ${readFileSync(png).length} bytes)`);
	console.log(`  renderer: ${bin}`);
}
