#!/usr/bin/env node
// contact-batch2.mjs — contact sheet for M11 batch 2 (core-tier ranks 25-48).
//
//   node contact-batch2.mjs          # -> contact-batch2.html
//   node contact-batch2.mjs --png    # also shoots contact-batch2.png at 2x
//
// tools/contact.mjs carries a hard-coded batch-1 roster and cannot take a subset,
// so this is a thin local twin of it: same page structure, this batch's roster,
// and no canon-drift section (none of the canon six live in this slice).

import { readFileSync, writeFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { homedir, tmpdir } from 'node:os';

const ROOT = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const TITLE = 'M11 Batch 2';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// id, archetype, tree label, palette source
const ROSTER = [
	['font', 'GLYPH', 'Inter-Bold.ttf', 'no brand → #B4907A'],
	['pdf', 'SILHOUETTE', 'spec.pdf', 'brand #EC1C24 → #C2483C (+#E08573 flap)'],
	['xml', 'GLYPH', 'pom.xml', 'no brand → #7C93A6'],
	['python', 'SILHOUETTE', 'main.py', 'brand #3776AB + #D8B44A'],
	['go', 'BADGE', 'main.go', 'brand #00ADD8 → #2E88A0'],
	['swift', 'SILHOUETTE', 'App.swift', 'brand #F05138 → #DD6E5B'],
	['c', 'BADGE', 'parser.c', 'brand #A8B9CC (dark letter #232C38)'],
	['cpp', 'BADGE', 'engine.cpp', 'brand #00599C → #37648E'],
	['java', 'SILHOUETTE', 'Main.java', 'brand #ED8B00 → #C9832F'],
	['vue', 'SILHOUETTE', 'App.vue', 'brand #4FC08D → #4CB392'],
	['license', 'SILHOUETTE', 'LICENSE', 'no brand → #C2A253'],
	['readme', 'SILHOUETTE', 'README.md', 'no brand → #7EA6C2'],
	['editorconfig', 'GLYPH', '.editorconfig', 'no brand → #6F8F82'],
	['eslint', 'GLYPH', '.eslintrc.json', 'brand #4B32C3 → #5D4EBE'],
	['prettier', 'SILHOUETTE', '.prettierrc', 'brand #F7B93E → #E0A83E'],
	['tsconfig', 'SILHOUETTE', 'tsconfig.json', 'canon #3178C6 (TS family tie)'],
	['vite', 'SILHOUETTE', 'vite.config.ts', 'brand #646CFF → #A96BD8'],
	['tailwind', 'SILHOUETTE', 'tailwind.config.js', 'brand #06B6D4 → #3FAFC4'],
	['text', 'GLYPH', 'notes.txt', 'no brand → #95918C'],
	['csharp', 'BADGE', 'Program.cs', 'brand #239120 → #3E8F4A'],
	['php', 'BADGE', 'index.php', 'brand #777BB4 → #6A7BC8'],
	['ruby', 'SILHOUETTE', 'Gemfile', 'brand #CC342D → #A94152'],
	['kotlin', 'BADGE', 'Main.kt', 'brand #7F52FF → #9A5FBE'],
	['dartlang', 'SILHOUETTE', 'main.dart', 'brand #0175C2 → #35709E']
];

// A repo root that mixes this batch with batch 1 — the real dedup test.
const MIXED = [
	['readme', 'README.md'], ['license', 'LICENSE'], ['editorconfig', '.editorconfig'],
	['eslint', '.eslintrc.json'], ['prettier', '.prettierrc'], ['tsconfig', 'tsconfig.json'],
	['vite', 'vite.config.ts'], ['tailwind', 'tailwind.config.js'], ['php', 'index.php'],
	['python', 'manage.py'], ['go', 'main.go'], ['java', 'Main.java'], ['cpp', 'engine.cpp'],
	['c', 'parser.c'], ['csharp', 'Program.cs'], ['ruby', 'Gemfile'], ['kotlin', 'Main.kt'],
	['dartlang', 'main.dart'], ['swift', 'App.swift'], ['vue', 'App.vue'], ['xml', 'pom.xml'],
	['text', 'notes.txt'], ['pdf', 'spec.pdf'], ['font', 'Inter-Bold.ttf']
];

const BATCH1 = ['typescript', 'reactts', 'js', 'json', 'markdown', 'css', 'sass', 'html',
	'rust', 'toml', 'yaml', 'docker', 'dotenv', 'prisma', 'next', 'node', 'npm', 'lock',
	'git', 'shell', 'sql', 'svg', 'image'];

function load(id) {
	const file = join(ROOT, 'svg', 'file', `${id}.svg`);
	if (!existsSync(file)) { throw new Error(`missing ${file}`); }
	const src = readFileSync(file, 'utf8');
	return {
		id,
		inner: src.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, ''),
		bytes: Buffer.byteLength(src)
	};
}

const icons = ROSTER.map(([id, archetype, label, palette]) => ({ ...load(id), archetype, label, palette }));
const neighbours = BATCH1.filter(id => existsSync(join(ROOT, 'svg', 'file', `${id}.svg`))).map(load);

const defs = `<svg width="0" height="0" aria-hidden="true" style="position:absolute"><defs>
${[...icons, ...neighbours].map(i => `<symbol id="p-${i.id}" viewBox="0 0 16 16">${i.inner}</symbol>`).join('\n')}
</defs></svg>`;

const use = (id, s, alt) =>
	`<svg class="ico" width="${s}" height="${s}" role="img" aria-label="${esc(alt)}"><use href="#p-${id}"/></svg>`;
const row = (id, label) => `<div class="row">${use(id, 16, '')}<span>${esc(label)}</span></div>`;

const LADDER = icons.map(i => `
  <tr>
    <th scope="row"><span class="nm">${esc(i.id)}</span><span class="arch">${i.archetype}</span></th>
    <td>${use(i.id, 16, `${i.id} 16px`)}</td>
    <td>${use(i.id, 22, `${i.id} 22px`)}</td>
    <td class="rowcell"><span class="trow">${use(i.id, 16, '')}<span>${esc(i.label)}</span></span></td>
    <td>${use(i.id, 32, `${i.id} 32px`)}</td>
    <td>${use(i.id, 64, `${i.id} 64px`)}</td>
  </tr>`).join('');

const tree = (head, rows, bg) =>
	`<div class="tree"${bg ? ` style="background:${bg}"` : ''}>
  <div class="treehead">${esc(head)}</div>
  ${rows.map(([id, label]) => row(id, label)).join('\n  ')}
</div>`;

const SET = tree('explorer · 22px rows · 16px icons', ROSTER.map(r => [r[0], r[2]]));
const SET2 = tree('on #1E1E1E', ROSTER.map(r => [r[0], r[2]]), '#1E1E1E');
const MIX = tree('batch 2 in a mixed repo root', [
	...MIXED.slice(0, 12),
	['typescript', 'index.ts'], ['reactts', 'App.tsx'], ['js', 'app.js'], ['json', 'package.json'],
	['css', 'styles.css'], ['html', 'index.html'], ['yaml', 'ci.yml'], ['docker', 'Dockerfile'],
	['dotenv', '.env'], ['git', '.gitignore'], ['shell', 'build.sh'], ['npm', '.npmrc'],
	['lock', 'pnpm-lock.yaml'], ['node', '.nvmrc'], ['sql', 'schema.sql'], ['svg', 'logo.svg'],
	['image', 'hero.png'], ['markdown', 'CHANGELOG.md'], ['next', 'next.config.js'],
	['prisma', 'schema.prisma'], ['rust', 'main.rs'], ['toml', 'Cargo.toml'],
	...MIXED.slice(12)
]);

const totalBytes = icons.reduce((a, i) => a + i.bytes, 0);

const TABLE = icons.map(i => `
  <tr>
    <td class="mono">${esc(i.id)}</td>
    <td class="mono">${i.archetype}</td>
    <td class="mono num">${i.bytes}</td>
    <td class="mono dim">${esc(i.palette)}</td>
  </tr>`).join('');

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
        max-width:340px}
  .treehead{font:10px/1 var(--mono);color:var(--dim);letter-spacing:.08em;padding:6px 14px 12px}
  .tree .row{display:flex;align-items:center;gap:7px;padding:0 14px;height:22px}
  .tree .row span{font:13px/1 var(--sans);color:#CCCCCC;white-space:nowrap}
  .strips{display:grid;grid-template-columns:repeat(3,340px);gap:20px;align-items:start}

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
  <p class="sub">core-tier ranks 25–48, hand-authored to <code>spec.md</code>. No &lt;text&gt;,
  no font-family, no gradients, no external references: every letterform is an Inter&nbsp;Bold
  outline baked by tools/letterpath.mjs. The third strip mixes this batch with batch&nbsp;1 —
  the listing where same-archetype twins would show.</p>
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
  <p class="lede">16&nbsp;px is the primary target; the 22&nbsp;px tree row is the real usage
  context; 32 and 64 only have to stay clean.</p>
  <table>
    <thead><tr><th>concept</th><th>16</th><th>22</th><th>tree row (22 px)</th><th>32</th><th>64</th></tr></thead>
    <tbody>${LADDER}</tbody>
  </table>
</section>

<section>
  <h2>As a set</h2>
  <p class="lede">The batch as one explorer listing, on the editor background and on #1E1E1E,
  then interleaved with batch 1.</p>
  <div class="strips">${SET}${SET2}${MIX}</div>
</section>

<section>
  <h2>Manifest</h2>
  <table class="ftable">
    <thead><tr><th>id</th><th>archetype</th><th class="num">bytes</th><th>colour source</th></tr></thead>
    <tbody>${TABLE}</tbody>
    <tfoot><tr><td colspan="2">${icons.length} icons</td><td class="num">${totalBytes}</td><td>—</td></tr></tfoot>
  </table>
</section>
</div>
`;

const out = join(ROOT, 'contact-batch2.html');
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
	const probe = join(tmpdir(), `m11-contact2-probe-${process.pid}.html`);
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
	const png = join(ROOT, 'contact-batch2.png');
	const r = shoot(out, png);
	console.log(`${png}  (${r.width}x${r.height} css px at 2x, ${Buffer.byteLength(readFileSync(png))} bytes)`);
	console.log(`  renderer: ${r.bin}`);
}
