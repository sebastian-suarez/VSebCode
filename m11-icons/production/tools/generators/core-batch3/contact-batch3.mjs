#!/usr/bin/env node
// contact-batch3.mjs — contact sheet for the batch-3 slice (core-tier ranks 49-72).
// Same page shape and CSS as tools/contact.mjs, minus the canon-drift section
// (no icon in this slice has a canon twin). tools/contact.mjs is untouched: its
// ROSTER is batch-1 only and it takes no subset flag.
//
//   node contact-batch3.mjs [--png]

import { readFileSync, writeFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { homedir, tmpdir } from 'node:os';

const ROOT = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production';
const argv = process.argv.slice(2);
const BATCH = 'batch3';
const TITLE = 'M11 Batch 3';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// rank, id, archetype, tree label, palette source
const ROSTER = [
	[49, 'elixir', 'SILHOUETTE', 'app.ex', 'brand #4B275F → #9A5FAD (lifted)'],
	[50, 'haskell', 'GLYPH', 'Main.hs', 'brand #5D4F85 → #8E80C6 (lifted)'],
	[51, 'scala', 'SILHOUETTE', 'Main.scala', 'brand #DC322F → #C93A4A'],
	[52, 'lua', 'SILHOUETTE', 'init.lua', 'brand #2C2D72 → #6C6ACB (lifted)'],
	[53, 'perl', 'BADGE', 'script.pl', 'brand #39457E → #5E6DB4 (lifted)'],
	[54, 'r', 'GLYPH', 'analysis.R', 'brand #276DC3 → #3D6EC8 (nudged off the markdown blue)'],
	[55, 'julia', 'SILHOUETTE', 'model.jl', 'brand trio → #C4534C / #529A46 / #9968C4'],
	[56, 'zig', 'GLYPH', 'build.zig', 'brand #F7A41D → #D89238'],
	[57, 'nim', 'SILHOUETTE', 'main.nim', 'off-brand #C6C24C (#FFE953 = js/json yellow)'],
	[58, 'ocaml', 'SILHOUETTE', 'lexer.ml', 'brand #EC6813 → #CC9038'],
	[59, 'clojure', 'BADGE', 'core.clj', 'brand green #91DC47 → #55AD6E (blue half is TS/prisma)'],
	[60, 'erlang', 'GLYPH', 'server.erl', 'brand #A90533 → #B8455F'],
	[61, 'fsharp', 'GLYPH', 'Program.fs', 'off-brand #35A0A0 (#378BBA = css/markdown/docker band)'],
	[62, 'objectivec', 'BADGE', 'AppDelegate.m', 'no brand → #A85596'],
	[63, 'assembly', 'GLYPH', 'boot.asm', 'no brand → #4F9E7E'],
	[64, 'solidity', 'GLYPH', 'Token.sol', 'brand #363636 → #B2B0AC (lifted)'],
	[65, 'wasm', 'BADGE', 'module.wasm', 'brand #654FF0 → #866ED6'],
	[66, 'cheader', 'BADGE', 'stdio.h', 'brand #A8B9CC → #A6ACB4 (neutralised)'],
	[67, 'cppheader', 'BADGE', 'vector.hpp', 'off-brand #6F7982 (C family; #00599C = TS band)'],
	[68, 'graphql', 'GLYPH', 'schema.graphql', 'brand #E10098 → #C43E93'],
	[69, 'protobuf', 'BADGE', 'user.proto', 'no brand → #8CA24A'],
	[70, 'json5', 'GLYPH', 'config.json5', 'json family #D6C13C (declared rhyme)'],
	[71, 'sqlite', 'BADGE', 'app.db', 'off-brand #35897E (sql family; #003B57 = docker band)'],
	[72, 'excel', 'SILHOUETTE', 'report.csv', 'brand #217346 → #2F8F55']
];

// Batch-1 neighbours, for the side-by-side hue/weight check.
const NEIGHBOURS = ['typescript', 'npm', 'js', 'svg', 'sass', 'yaml', 'rust', 'toml', 'json',
	'dotenv', 'git', 'shell', 'markdown', 'css', 'html', 'docker', 'node', 'sql', 'prisma',
	'image', 'next', 'lock'];

const load = (id) => {
	const file = join(ROOT, 'svg', 'file', `${id}.svg`);
	if (!existsSync(file)) { throw new Error(`missing ${file}`); }
	const src = readFileSync(file, 'utf8');
	return {
		inner: src.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, ''),
		bytes: Buffer.byteLength(src)
	};
};

const icons = ROSTER.map(([rank, id, archetype, label, palette]) => ({
	rank, id, archetype, label, palette, ...load(id)
}));
const neighbours = NEIGHBOURS.map(id => ({ id, ...load(id) }));

const defs =
	`<svg width="0" height="0" aria-hidden="true" style="position:absolute">
<defs>
${icons.map(i => `<symbol id="p-${i.id}" viewBox="0 0 16 16">${i.inner}</symbol>`).join('\n')}
${neighbours.map(i => `<symbol id="b1-${i.id}" viewBox="0 0 16 16">${i.inner}</symbol>`).join('\n')}
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

const TREE = `<div class="tree">
  <div class="treehead">explorer · 22px rows · 16px icons</div>
  ${icons.map(i => `<div class="row">${use('p', i.id, 16, '')}<span>${esc(i.label)}</span></div>`).join('\n  ')}
</div>`;

const SWATCH = (list, pfx) => `<div class="swatch">${list
	.map(i => `<span class="sw">${use(pfx, i.id, 32, i.id)}<em>${esc(i.id)}</em></span>`).join('')}</div>`;

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

  .swatch{display:flex;flex-wrap:wrap;gap:14px;border:1px solid var(--line);border-radius:10px;
          padding:18px;background:var(--panel)}
  .sw{display:flex;flex-direction:column;align-items:center;gap:6px;width:64px}
  .sw em{font:10px/1.2 var(--mono);color:var(--dim);font-style:normal;text-align:center;
         overflow:hidden;text-overflow:ellipsis;max-width:64px;white-space:nowrap}

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
  <p class="sub">core-tier ranks 49–72, ${icons.length} hand-authored SVGs. No &lt;text&gt;, no font-family,
  no gradients, no strokes, no external references: every letterform is an Inter&nbsp;Bold outline baked by
  tools/letterpath.mjs. Badge letters follow the canon's 41&nbsp;% low baseline; glyph and silhouette
  letters are centred.</p>
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
  <p class="lede">16&nbsp;px is the primary target; the 22&nbsp;px tree row is the real usage context;
  32 and 64 only have to stay clean.</p>
  <table>
    <thead><tr><th>concept</th><th>16</th><th>22</th><th>tree row (22 px)</th><th>32</th><th>64</th></tr></thead>
    <tbody>${LADDER}</tbody>
  </table>
</section>

<section>
  <h2>As a set</h2>
  <p class="lede">The whole slice as one explorer listing, on the editor background and on #1E1E1E.</p>
  <div class="strips">${TREE}${TREE.replace('explorer · 22px rows · 16px icons', 'on #1E1E1E')}</div>
</section>

<section>
  <h2>Batch 3 against batch 1</h2>
  <p class="lede">Top row: this slice. Bottom row: the shipped batch-1 set. Read across for hue-family
  collisions and for weight drift inside each archetype.</p>
  ${SWATCH(icons, 'p')}
  <div style="height:14px"></div>
  ${SWATCH(neighbours, 'b1')}
</section>

<section>
  <h2>Manifest</h2>
  <table class="ftable">
    <thead><tr><th class="num">rank</th><th>id</th><th>path</th><th>archetype</th>
    <th class="num">bytes</th><th>colour source</th></tr></thead>
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
	const probe = join(tmpdir(), `m11-contact3-probe-${process.pid}.html`);
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
