#!/usr/bin/env node
// contact.mjs — assemble ../contact-<batch>.html, a self-contained contact sheet
// for a production batch. Modelled on the pilot's build-checkpoint.mjs.
//
//   node contact.mjs                 # -> ../contact-batch1.html
//   node contact.mjs --png           # also shoots ../contact-batch1.png at 2x
//   node contact.mjs --batch batch2 --title "M11 Batch 2"
//
// Every icon is inlined once as an SVG <symbol> and referenced with <use>, so the
// page carries no external request of any kind. The six M10 canon symbols are
// embedded verbatim (they still use <text>) next to their production twins so
// drift is visible at 16 / 32 / 64 px and as a difference blend.

import { readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { chromium } from './chromium.mjs';

const DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(DIR, '..');
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i < 0 ? d : argv[i + 1]; };
const BATCH = arg('batch', 'batch1');
const TITLE = arg('title', 'M11 Batch 1');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// id, kind, archetype, tree label, palette source
const ROSTER = [
	['typescript', 'file', 'BADGE', 'index.ts', 'canon #3178C6'],
	['reactts', 'file', 'BADGE', 'App.tsx', 'brand #61DAFB → #46B5D1'],
	['js', 'file', 'BADGE', 'app.js', 'brand #F7DF1E → #E8D44D'],
	['reactjs', 'file', 'BADGE', 'App.jsx', 'brand #61DAFB → #46B5D1'],
	['json', 'file', 'GLYPH', 'package.json', 'brand #F5DE19 → #D6C13C'],
	['markdown', 'file', 'GLYPH', 'README.md', 'canon #519ABA'],
	['css', 'file', 'SILHOUETTE', 'styles.css', 'canon #1572B6'],
	['sass', 'file', 'BADGE', 'main.scss', 'brand #CC6699 → #C4708F'],
	['html', 'file', 'SILHOUETTE', 'index.html', 'brand #E34F26 → #DB5430'],
	['rust', 'file', 'BADGE', 'main.rs', 'brand #CE422B → #A0523C'],
	['toml', 'file', 'BADGE', 'Cargo.toml', 'brand #9C4121 → #7E4A2E'],
	['yaml', 'file', 'BADGE', 'ci.yml', 'off-brand #7E6086 (npm clash)'],
	['docker', 'file', 'SILHOUETTE', 'Dockerfile', 'brand #2496ED → #2E92D8'],
	['dotenv', 'file', 'GLYPH', '.env', 'brand #ECD53F → #E3CB4E'],
	['prisma', 'file', 'SILHOUETTE', 'schema.prisma', 'brand #2D3748 → #8592AD'],
	['next', 'file', 'SILHOUETTE', 'next.config.js', 'brand #000000 → #DADCE0'],
	['node', 'file', 'SILHOUETTE', '.nvmrc', 'brand #5FA04E'],
	['npm', 'file', 'BADGE', '.npmrc', 'canon #CB3837'],
	['lock', 'file', 'SILHOUETTE', 'pnpm-lock.yaml', 'no brand → #979CA3'],
	['git', 'file', 'GLYPH', '.gitignore', 'brand #F05032 → #E0603C'],
	['shell', 'file', 'GLYPH', 'build.sh', 'brand #4EAA25 → #79BE4A'],
	['sql', 'file', 'SILHOUETTE', 'schema.sql', 'no brand → #3E9B8E'],
	['svg', 'file', 'BADGE', 'logo.svg', 'brand #FFB13B → #DFA046'],
	['image', 'file', 'SILHOUETTE', 'hero.png', 'no brand → #A08BCC'],
	['folder', 'folder', 'SILHOUETTE', 'src', 'canon #BF9354'],
	['folder-open', 'folder', 'SILHOUETTE', 'components', 'canon #8F6D37 / #C09553']
];

// M10 canon symbols, copied verbatim from m10-nvim-prototype.html (the six approved icons).
const CANON = {
	folder: '<path fill="#BF9354" d="M1.5 4.1c0-.66.54-1.2 1.2-1.2h3.12c.34 0 .66.14.89.39l.95 1.01h5.64c.66 0 1.2.54 1.2 1.2v6.4c0 .66-.54 1.2-1.2 1.2H2.7c-.66 0-1.2-.54-1.2-1.2z"/><path fill="rgba(0,0,0,.14)" d="M1.5 5.55h13v.85h-13z"/>',
	'folder-open': '<path fill="#8F6D37" d="M1.5 4.1c0-.66.54-1.2 1.2-1.2h3.12c.34 0 .66.14.89.39l.95 1.01h4.94c.66 0 1.2.54 1.2 1.2v1h-12z"/><path fill="#C09553" d="M2.42 6.5h11.62c.78 0 1.35.73 1.17 1.49l-.98 3.9c-.13.54-.61.91-1.17.91H2.7c-.66 0-1.2-.54-1.2-1.2V7.7c0-.66.42-1.2.92-1.2z"/>',
	typescript: '<rect x="1" y="1" width="14" height="14" rx="3" fill="#3178C6"/><text x="8" y="11.4" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-size="7.4" font-weight="700" fill="#FFFFFF">TS</text>',
	css: '<path fill="#1572B6" d="M2.6 1.5h10.8l-.98 11L8 14.5l-4.42-2z"/><text x="8" y="10.6" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-size="7.2" font-weight="700" fill="#FFFFFF">3</text>',
	markdown: '<rect x="0.75" y="3.75" width="14.5" height="8.5" rx="1.6" fill="none" stroke="#519ABA" stroke-width="1.3"/><path fill="#519ABA" d="M2.9 10.4V5.9h1.35L5.6 7.6l1.35-1.7H8.3v4.5H6.95V7.9L5.6 9.6 4.25 7.9v2.5z"/><path fill="#519ABA" d="M10.55 5.9h1.5v2.3h1.35L11.3 10.7 9.2 8.2h1.35z"/>',
	npm: '<rect x="1.5" y="1.5" width="13" height="13" rx="2" fill="#CB3837"/><text x="8" y="10.4" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-size="5" font-weight="700" fill="#FFFFFF">npm</text>'
};

const icons = ROSTER.map(([id, kind, archetype, label, palette]) => {
	const file = join(ROOT, 'svg', kind, `${id}.svg`);
	if (!existsSync(file)) { throw new Error(`missing ${file}`); }
	const src = readFileSync(file, 'utf8');
	const inner = src.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
	return { id, kind, archetype, label, palette, inner, bytes: Buffer.byteLength(src) };
});

const defs =
	`<svg width="0" height="0" aria-hidden="true" style="position:absolute">
<defs>
${icons.map(i => `<symbol id="p-${i.id}" viewBox="0 0 16 16">${i.inner}</symbol>`).join('\n')}
${Object.entries(CANON).map(([id, body]) => `<symbol id="c-${id}" viewBox="0 0 16 16">${body}</symbol>`).join('\n')}
</defs></svg>`;

const use = (pfx, id, s, alt) =>
	`<svg class="ico" width="${s}" height="${s}" role="img" aria-label="${esc(alt)}"><use href="#${pfx}-${id}"/></svg>`;

const LADDER = icons.map(i => `
  <tr>
    <th scope="row"><span class="nm">${esc(i.id)}</span><span class="arch">${i.archetype}</span></th>
    <td>${use('p', i.id, 16, `${i.id} 16px`)}</td>
    <td>${use('p', i.id, 22, `${i.id} 22px`)}</td>
    <td class="rowcell"><span class="trow">${use('p', i.id, 16, '')}<span>${esc(i.label)}</span></span></td>
    <td>${use('p', i.id, 32, `${i.id} 32px`)}</td>
    <td>${use('p', i.id, 64, `${i.id} 64px`)}</td>
  </tr>`).join('');

const DRIFT = Object.keys(CANON).map(id => {
	const i = icons.find(x => x.id === id);
	return `
  <tr>
    <th scope="row"><span class="nm">${esc(id)}</span><span class="arch">${i.archetype}</span></th>
    <td>${use('c', id, 16, `${id} canon 16px`)}</td>
    <td class="grp">${use('p', id, 16, `${id} production 16px`)}</td>
    <td>${use('c', id, 32, `${id} canon 32px`)}</td>
    <td class="grp">${use('p', id, 32, `${id} production 32px`)}</td>
    <td>${use('c', id, 64, `${id} canon 64px`)}</td>
    <td class="grp">${use('p', id, 64, `${id} production 64px`)}</td>
    <td class="grp"><span class="diff">${use('c', id, 64, '')}${use('p', id, 64, '')}</span></td>
  </tr>`;
}).join('');

const TREE = `<div class="tree">
  <div class="treehead">explorer · 22px rows · 16px icons</div>
  ${icons.map(i => `<div class="row">${use('p', i.id, 16, '')}<span>${esc(i.label)}</span></div>`).join('\n  ')}
</div>`;

const totalBytes = icons.reduce((a, i) => a + i.bytes, 0);

const TABLE = icons.map(i => `
  <tr>
    <td class="mono">${esc(i.id)}</td>
    <td class="mono dim">svg/${i.kind}/${esc(i.id)}.svg</td>
    <td class="mono">${i.archetype}</td>
    <td class="mono num">${i.bytes}</td>
    <td class="mono dim">${esc(i.palette)}</td>
  </tr>`).join('');

const html = `<title>${esc(TITLE)}</title>
<style>
  :root{
    --bg:#121314; --bg2:#191A1B; --panel:#1C1E1F; --line:#2A2D2E;
    --fg:#D7D9DA; --dim:#8A9092; --acc:#6FA8DC;
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
  .grp{border-left:1px solid var(--line)}
  .ico{display:inline-block;vertical-align:middle}
  .rowcell{text-align:left;padding-left:16px}
  .trow{display:inline-flex;align-items:center;gap:7px;height:22px;padding:0 8px;border-radius:4px}
  .trow span{font:13px/1 var(--sans);color:#CCCCCC;white-space:nowrap}
  .diff{position:relative;display:inline-block;width:64px;height:64px;background:#000}
  .diff .ico{position:absolute;inset:0}
  .diff .ico+.ico{mix-blend-mode:difference}

  .tree{border:1px solid var(--line);border-radius:10px;padding:10px 0 14px;background:var(--bg);
        max-width:360px}
  .treehead{font:10px/1 var(--mono);color:var(--dim);letter-spacing:.08em;padding:6px 14px 12px}
  .tree .row{display:flex;align-items:center;gap:7px;padding:0 14px;height:22px}
  .tree .row span{font:13px/1 var(--sans);color:#CCCCCC;white-space:nowrap}
  .strips{display:grid;grid-template-columns:360px 360px;gap:20px;align-items:start}
  .strips .tree:nth-child(2){background:#1E1E1E}

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
  <p class="sub">Hand-authored SVGs, ${icons.length} icons. No &lt;text&gt;, no font-family, no gradients,
  no external references: every letterform is an Inter&nbsp;Bold outline baked by tools/letterpath.mjs.
  The six M10 canon icons are reproduced geometry-for-geometry; only their &lt;text&gt; nodes became paths.</p>
  <div class="meta">
    <span class="tag">${icons.length} icons</span>
    <span class="tag">${totalBytes} bytes total</span>
    <span class="tag">avg ${Math.round(totalBytes / icons.length)} B</span>
    <span class="tag">max ${Math.max(...icons.map(i => i.bytes))} B</span>
    <span class="tag">bg #121314</span>
  </div>
</header>

<section>
  <h2>Canon drift</h2>
  <p class="lede">Left of each pair: the M10 original (still &lt;text&gt;, rendered in -apple-system).
  Right: the production twin. The last column stacks both at 64&nbsp;px with a difference blend.
  Hairline edges there are an artifact of blending antialiased edges and mean “identical”;
  a filled ghost is real drift, and it may only ever appear on letterforms — never on geometry.</p>
  <table>
    <thead><tr><th>concept</th><th>canon 16</th><th class="grp">prod 16</th><th>canon 32</th>
    <th class="grp">prod 32</th><th>canon 64</th><th class="grp">prod 64</th><th class="grp">difference</th></tr></thead>
    <tbody>${DRIFT}</tbody>
  </table>
</section>

<section>
  <h2>Size ladder</h2>
  <p class="lede">16&nbsp;px is the primary target; the 22&nbsp;px tree row is the real usage context;
  32 and 64 only have to stay clean.</p>
  <table>
    <thead><tr><th>concept</th><th>16</th><th>22</th><th>tree row (22 px)</th><th>32</th><th>64</th></tr></thead>
    <tbody>${LADDER}</tbody>
  </table>
</section>

<section>
  <h2>As a set</h2>
  <p class="lede">The whole batch as one explorer listing, on the editor background and on #1E1E1E.</p>
  <div class="strips">${TREE}${TREE.replace('explorer · 22px rows · 16px icons', 'on #1E1E1E')}</div>
</section>

<section>
  <h2>Manifest</h2>
  <table class="ftable">
    <thead><tr><th>id</th><th>path</th><th>archetype</th><th class="num">bytes</th><th>colour source</th></tr></thead>
    <tbody>${TABLE}</tbody>
    <tfoot><tr><td colspan="3">${icons.length} icons</td><td class="num">${totalBytes}</td><td>—</td></tr></tfoot>
  </table>
</section>
</div>
`;

const out = join(ROOT, `contact-${BATCH}.html`);
writeFileSync(out, html, 'utf8');
console.log(`${out}  (${Buffer.byteLength(html)} bytes, ${icons.length} icons, ${totalBytes} icon bytes)`);

// ---- optional 2x screenshot -------------------------------------------------
const WIDTH = 1240;

const COMMON = ['--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
	'--allow-file-access-from-files', '--virtual-time-budget=8000'];

function shoot(htmlPath, pngPath) {
	const bin = chromium();
	// Pass 1: the page's own height, measured through an iframe (headless --screenshot
	// only captures the window, so the window has to be sized to the document first).
	const probe = join(tmpdir(), `m11-contact-probe-${process.pid}.html`);
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
