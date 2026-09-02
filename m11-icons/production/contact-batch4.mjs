#!/usr/bin/env node
// contact-batch4.mjs — contact sheet for batch 4 (core-tier ranks 73–96).
//
//   node contact-batch4.mjs          # -> contact-batch4.html
//   node contact-batch4.mjs --png    # also shoots contact-batch4.png at 2x
//
// tools/contact.mjs carries a hard-coded batch-1 roster, so this batch ships its
// own thin sheet rather than modifying the shared tool. Same rules: every icon is
// inlined once as an SVG <symbol>, the page makes no external request, and the
// screenshot runs on the Playwright chromium under ~/Library/Caches/ms-playwright.

import { readFileSync, writeFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { homedir, tmpdir } from 'node:os';

const ROOT = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const BATCH = 'batch4';
const TITLE = 'M11 Batch 4';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// rank, id, archetype, tree label, palette source
const ROSTER = [
	[73, 'word', 'SILHOUETTE', 'Report.docx', 'brand #2B579A → #37588C'],
	[74, 'powerpoint', 'SILHOUETTE', 'Deck.pptx', 'off-brand #C74C57 (html clash)'],
	[75, 'mdx', 'BADGE', 'post.mdx', 'no brand → #7B68CE'],
	[76, 'asciidoc', 'BADGE', 'guide.adoc', 'no brand → #A85EA0'],
	[77, 'tex', 'GLYPH', 'paper.tex', 'brand #008080 → #3FA6A6'],
	[78, 'audio', 'GLYPH', 'theme.mp3', 'no brand → #C06E9E'],
	[79, 'video', 'SILHOUETTE', 'demo.mp4', 'no brand → #6E76CE'],
	[80, 'zip', 'SILHOUETTE', 'release.zip', 'no brand → #93A05B'],
	[81, 'binary', 'GLYPH', 'app.bin', 'no brand → #6F9E77'],
	[82, 'exe', 'BADGE', 'setup.exe', 'no brand → #87817A'],
	[83, 'key', 'SILHOUETTE', 'id_rsa.pem', 'no brand → #BFAA4E'],
	[84, 'cert', 'GLYPH', 'server.crt', 'no brand → #C79A4A'],
	[85, 'powershell', 'BADGE', 'build.ps1', 'brand #5391FE → #6478C8'],
	[86, 'makefile', 'GLYPH', 'Makefile', 'no brand → #A08D78'],
	[87, 'cmake', 'GLYPH', 'CMakeLists.txt', 'brand #064F8C → #3D71B5'],
	[88, 'gradle', 'BADGE', 'build.gradle', 'brand #02303A → #6E8A92'],
	[89, 'maven', 'GLYPH', 'pom.xml', 'brand #C71A36 → #A93F4A'],
	[90, 'config', 'GLYPH', 'app.conf', 'no brand → #7F8FA6'],
	[91, 'log', 'GLYPH', 'error.log', 'no brand → #96A17E'],
	[92, 'diff', 'GLYPH', 'patch.diff', 'no brand → #5FA894'],
	[93, 'typescriptdef', 'BADGE', 'index.d.ts', 'canon #3178C6 (typescript sibling)'],
	[94, 'jsconfig', 'BADGE', 'jsconfig.json', 'batch-1 js plate #E8D44D (sibling)'],
	[95, 'class', 'SILHOUETTE', 'Main.class', 'no brand → #9A8C84'],
	[96, 'nginx', 'BADGE', 'nginx.conf', 'brand #009639 → #3E9E5C']
];

// batch-1 neighbours shown beside the batch for hue / weight comparison only.
const NEIGHBOURS = ['typescript', 'js', 'css', 'html', 'markdown', 'json', 'dotenv', 'git',
	'shell', 'sql', 'npm', 'lock', 'image', 'docker', 'node', 'yaml', 'svg', 'rust'];

const load = (id) => {
	const file = join(ROOT, 'svg', 'file', `${id}.svg`);
	if (!existsSync(file)) { throw new Error(`missing ${file}`); }
	const src = readFileSync(file, 'utf8');
	return {
		inner: src.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, ''),
		bytes: Buffer.byteLength(src)
	};
};

const icons = ROSTER.map(([rank, id, archetype, label, palette]) => ({ rank, id, archetype, label, palette, ...load(id) }));
const neighbours = NEIGHBOURS.map(id => ({ id, ...load(id) }));

const defs =
	`<svg width="0" height="0" aria-hidden="true" style="position:absolute">
<defs>
${icons.map(i => `<symbol id="p-${i.id}" viewBox="0 0 16 16">${i.inner}</symbol>`).join('\n')}
${neighbours.map(i => `<symbol id="n-${i.id}" viewBox="0 0 16 16">${i.inner}</symbol>`).join('\n')}
</defs></svg>`;

const use = (pfx, id, s, alt) =>
	`<svg class="ico" width="${s}" height="${s}" role="img" aria-label="${esc(alt)}"><use href="#${pfx}-${id}"/></svg>`;

const LADDER = icons.map(i => `
  <tr>
    <th scope="row"><span class="nm">${esc(i.id)}</span><span class="arch">${i.rank} · ${i.archetype}</span></th>
    <td>${use('p', i.id, 16, `${i.id} 16px`)}</td>
    <td>${use('p', i.id, 22, `${i.id} 22px`)}</td>
    <td class="rowcell"><span class="trow">${use('p', i.id, 16, '')}<span>${esc(i.label)}</span></span></td>
    <td>${use('p', i.id, 32, `${i.id} 32px`)}</td>
    <td>${use('p', i.id, 64, `${i.id} 64px`)}</td>
  </tr>`).join('');

const strip = (list, pfx, head) => `<div class="tree">
  <div class="treehead">${esc(head)}</div>
  ${list.map(i => `<div class="row">${use(pfx, i.id, 16, '')}<span>${esc(i.label || i.id)}</span></div>`).join('\n  ')}
</div>`;

const totalBytes = icons.reduce((a, i) => a + i.bytes, 0);

const TABLE = icons.map(i => `
  <tr>
    <td class="mono num">${i.rank}</td>
    <td class="mono">${esc(i.id)}</td>
    <td class="mono dim">svg/file/${esc(i.id)}.svg</td>
    <td class="mono">${i.archetype}</td>
    <td class="mono num">${i.bytes}</td>
    <td class="mono dim">${esc(i.palette)}</td>
  </tr>`).join('');

const SWATCHES = neighbours.map(i =>
	`<span class="sw">${use('n', i.id, 22, `${i.id} 22px`)}<span>${esc(i.id)}</span></span>`).join('');

const html = `<title>${esc(TITLE)}</title>
<style>
  :root{
    --bg:#121314; --bg2:#191A1B; --panel:#1C1E1F; --line:#2A2D2E;
    --fg:#D7D9DA; --dim:#8A9092;
    --mono:ui-monospace,SFMono-Regular,"SF Mono",Menlo,monospace;
    --sans:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.55 var(--sans);
       -webkit-font-smoothing:antialiased;padding:0 0 96px}
  .wrap{max-width:1180px;margin:0 auto;padding:0 28px}
  header{padding:56px 0 36px;border-bottom:1px solid var(--line);margin-bottom:44px}
  h1{font-size:30px;line-height:1.15;margin:0 0 12px;letter-spacing:-.02em;font-weight:600}
  .sub{color:var(--dim);max-width:72ch;margin:0 0 20px}
  .meta{display:flex;flex-wrap:wrap;gap:8px}
  .tag{font:11px/1 var(--mono);color:var(--dim);border:1px solid var(--line);
       border-radius:999px;padding:6px 10px;background:var(--bg2)}
  h2{font-size:12px;letter-spacing:.13em;text-transform:uppercase;color:var(--dim);
     font-weight:600;margin:52px 0 6px}
  h2:first-of-type{margin-top:0}
  .lede{color:var(--dim);margin:0 0 22px;max-width:78ch}

  table{border-collapse:collapse;width:100%;background:var(--panel);
        border:1px solid var(--line);border-radius:10px;overflow:hidden}
  thead th{font:11px/1.4 var(--mono);text-transform:uppercase;letter-spacing:.08em;color:var(--dim);
           text-align:center;padding:12px 8px;border-bottom:1px solid var(--line);font-weight:500}
  thead th:first-child,tbody th{text-align:left}
  tbody th{font-weight:400;padding:9px 14px;white-space:nowrap}
  .nm{font:12px/1 var(--mono);color:var(--fg)}
  .arch{display:block;font:10px/1.6 var(--mono);color:var(--dim);letter-spacing:.06em}
  td{padding:9px 8px;text-align:center;vertical-align:middle}
  tbody tr+tr th,tbody tr+tr td{border-top:1px solid var(--line)}
  .ico{display:inline-block;vertical-align:middle}
  .rowcell{text-align:left;padding-left:16px}
  .trow{display:inline-flex;align-items:center;gap:7px;height:22px;padding:0 8px;border-radius:4px}
  .trow span{font:13px/1 var(--sans);color:#CCCCCC;white-space:nowrap}

  .tree{border:1px solid var(--line);border-radius:10px;padding:10px 0 14px;background:var(--bg);
        max-width:360px}
  .treehead{font:10px/1 var(--mono);color:var(--dim);letter-spacing:.08em;padding:6px 14px 12px}
  .tree .row{display:flex;align-items:center;gap:7px;padding:0 14px;height:22px}
  .tree .row span{font:13px/1 var(--sans);color:#CCCCCC;white-space:nowrap}
  .strips{display:grid;grid-template-columns:360px 360px;gap:20px;align-items:start}
  .strips .tree:nth-child(2){background:#1E1E1E}

  .swatches{display:flex;flex-wrap:wrap;gap:14px;background:var(--panel);border:1px solid var(--line);
            border-radius:10px;padding:16px}
  .sw{display:inline-flex;align-items:center;gap:6px}
  .sw span{font:11px/1 var(--mono);color:var(--dim)}

  .mono{font:12px/1.5 var(--mono)}
  .dim{color:var(--dim)}
  .num{text-align:right}
  .ftable td{text-align:left;padding:8px 14px}
  .ftable td.num{text-align:right}
  tfoot td{border-top:1px solid var(--line);color:var(--dim);font:12px/1.5 var(--mono)}
</style>

${defs}

<div class="wrap">
<header>
  <h1>${esc(TITLE)} — production contact sheet</h1>
  <p class="sub">core-tier ranks 73–96: office documents, media, archives, binaries, build systems
  and the config/log utilities. Hand-authored SVGs, ${icons.length} icons. No &lt;text&gt;, no font-family,
  no gradients, no external references: every letterform is an Inter&nbsp;Bold outline baked by
  tools/letterpath.mjs.</p>
  <div class="meta">
    <span class="tag">${icons.length} icons</span>
    <span class="tag">${totalBytes} bytes total</span>
    <span class="tag">avg ${Math.round(totalBytes / icons.length)} B</span>
    <span class="tag">max ${Math.max(...icons.map(i => i.bytes))} B</span>
    <span class="tag">bg #121314</span>
  </div>
</header>

<section>
  <h2>Size ladder</h2>
  <p class="lede">16&nbsp;px is the primary target; the 22&nbsp;px tree row with its real filename is the
  usage context; 32 and 64 only have to stay clean.</p>
  <table>
    <thead><tr><th>concept</th><th>16</th><th>22</th><th>tree row (22 px)</th><th>32</th><th>64</th></tr></thead>
    <tbody>${LADDER}</tbody>
  </table>
</section>

<section>
  <h2>As a set</h2>
  <p class="lede">The whole batch as one explorer listing, on the editor background and on #1E1E1E.</p>
  <div class="strips">${strip(icons, 'p', 'explorer · 22px rows · 16px icons')}${strip(icons, 'p', 'on #1E1E1E')}</div>
</section>

<section>
  <h2>Against batch 1</h2>
  <p class="lede">Batch-1 neighbours at 22&nbsp;px, for hue and weight comparison — the batch must not
  put a same-archetype hue twin beside any of these.</p>
  <div class="swatches">${SWATCHES}</div>
</section>

<section>
  <h2>Manifest</h2>
  <table class="ftable">
    <thead><tr><th class="num">rank</th><th>id</th><th>path</th><th>archetype</th><th class="num">bytes</th><th>colour source</th></tr></thead>
    <tbody>${TABLE}</tbody>
    <tfoot><tr><td colspan="4">${icons.length} icons</td><td class="num">${totalBytes}</td><td>—</td></tr></tfoot>
  </table>
</section>
</div>
`;

const out = join(ROOT, `contact-${BATCH}.html`);
writeFileSync(out, html, 'utf8');
console.log(`${out}  (${Buffer.byteLength(html)} bytes, ${icons.length} icons, ${totalBytes} icon bytes)`);

// ---- optional 2x screenshot -------------------------------------------------
const WIDTH = 1240;

function chromium() {
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

function shoot(htmlPath, pngPath) {
	const bin = chromium();
	const probe = join(tmpdir(), `m11-contact4-probe-${process.pid}.html`);
	writeFileSync(probe, `<!doctype html><body style="margin:0"><pre id="o"></pre>` +
		`<iframe id="f" src="file://${htmlPath}" style="width:${WIDTH}px;height:400px;border:0"></iframe>` +
		`<script>f.onload=()=>{document.getElementById('o').textContent='PAGEHEIGHT='+f.contentDocument.documentElement.scrollHeight}</script>`);
	const dom = execFileSync(bin, [...COMMON, `--window-size=${WIDTH + 200},600`, '--dump-dom', `file://${probe}`],
		{ encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
	rmSync(probe, { force: true });
	const m = /PAGEHEIGHT=(\d+)/.exec(dom);
	if (!m) { throw new Error('could not measure the page height'); }
	const height = +m[1];

	execFileSync(bin, [...COMMON, '--force-device-scale-factor=2', '--default-background-color=121314ff',
		`--window-size=${WIDTH},${height}`, `--screenshot=${pngPath}`, `file://${htmlPath}`],
		{ stdio: ['ignore', 'ignore', 'ignore'] });
	return { bin, width: WIDTH, height };
}

if (argv.includes('--png')) {
	const png = join(ROOT, `contact-${BATCH}.png`);
	const r = shoot(out, png);
	console.log(`${png}  (${r.width}x${r.height} css px at 2x, ${Buffer.byteLength(readFileSync(png))} bytes)`);
	console.log(`  renderer: ${r.bin}`);
}
