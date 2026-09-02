#!/usr/bin/env node
// contact-batch5.mjs — thin, batch-5-only contact sheet (tools/contact.mjs carries a
// hardcoded batch-1 roster, so batch 5 ships its own builder; the shared tool is untouched).
import { readFileSync, writeFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { homedir, tmpdir } from 'node:os';

const ROOT = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production';
const TITLE = 'M11 Batch 5 — ranks 97–120';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// id, archetype, tree label (real filename), colour source
const ROSTER = [
	['yarn', 'SILHOUETTE', 'yarn.lock', 'brand #2C8EBB → #2A8496 (blue band)'],
	['pnpm', 'SILHOUETTE', 'pnpm-lock.yaml', 'brand #F69220 → #D4832F'],
	['bun', 'BADGE', 'bun.lockb', 'brand #FBF0DF → #E5D9C3'],
	['deno', 'BADGE', 'deno.json', 'brand #70FFAF → #4FB88A'],
	['webpack', 'GLYPH', 'webpack.config.js', 'brand #8DD6F9 → #7FBBD8'],
	['rollup', 'SILHOUETTE', 'rollup.config.mjs', 'brand #EC4A3F → #C43C3C'],
	['esbuild', 'SILHOUETTE', 'esbuild.config.js', 'brand #FFCF00 → #ADB544 (yellow band)'],
	['babel', 'SILHOUETTE', '.babelrc', 'brand #F9DC3E → #A6862A (yellow band)'],
	['biome', 'BADGE', 'biome.json', 'brand #60A5FA → #6E6FCC (blue band)'],
	['turborepo', 'GLYPH', 'turbo.json', 'brand #EF4444 → #CC333B'],
	['nx', 'BADGE', 'nx.json', 'brand #143055 → #5E6E94 (lifted)'],
	['vitest', 'GLYPH', 'vitest.config.ts', 'brand #6E9F18 → #93A833'],
	['jest', 'SILHOUETTE', 'jest.config.js', 'brand #C21325 → #B23A55'],
	['cypress', 'GLYPH', 'cypress.config.ts', 'brand #69D3A7 → #56BFA0'],
	['playwright', 'SILHOUETTE', 'playwright.config.ts', 'brand #2EAD33 → #3C9E52'],
	['storybook', 'SILHOUETTE', 'Button.stories.tsx', 'brand #FF4785 → #D0559B'],
	['testjs', 'SILHOUETTE', 'app.test.js', 'no brand → #DFCA55 (js hue)'],
	['testts', 'SILHOUETTE', 'app.test.ts', 'no brand → #6FA8DB (ts hue)'],
	['stylelint', 'GLYPH', '.stylelintrc', 'brand #263238 → #9AA3A9 (lifted)'],
	['postcss', 'GLYPH', 'postcss.config.js', 'brand #DD3A0A → #D0942F (red-orange band)'],
	['svelte', 'GLYPH', 'App.svelte', 'brand #FF3E00 → #BE6329'],
	['angular', 'GLYPH', 'angular.json', 'brand #DD0031 → #CC3462'],
	['astro', 'SILHOUETTE', 'index.astro', 'off-brand #8E52BE (orange band full)'],
	['nuxt', 'SILHOUETTE', 'nuxt.config.ts', 'brand #00DC82 → #2CA675']
];

const icons = ROSTER.map(([id, archetype, label, palette]) => {
	const file = join(ROOT, 'svg', 'file', `${id}.svg`);
	if (!existsSync(file)) { throw new Error(`missing ${file}`); }
	const src = readFileSync(file, 'utf8');
	const inner = src.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
	return { id, archetype, label, palette, inner, bytes: Buffer.byteLength(src) };
});

const defs = `<svg width="0" height="0" aria-hidden="true" style="position:absolute"><defs>
${icons.map(i => `<symbol id="p-${i.id}" viewBox="0 0 16 16">${i.inner}</symbol>`).join('\n')}
</defs></svg>`;

const use = (id, s, alt) =>
	`<svg class="ico" width="${s}" height="${s}" role="img" aria-label="${esc(alt)}"><use href="#p-${id}"/></svg>`;

const LADDER = icons.map(i => `
  <tr>
    <th scope="row"><span class="nm">${esc(i.id)}</span><span class="arch">${i.archetype}</span></th>
    <td>${use(i.id, 16, `${i.id} 16px`)}</td>
    <td>${use(i.id, 22, `${i.id} 22px`)}</td>
    <td class="rowcell"><span class="trow">${use(i.id, 16, '')}<span>${esc(i.label)}</span></span></td>
    <td>${use(i.id, 32, `${i.id} 32px`)}</td>
    <td>${use(i.id, 64, `${i.id} 64px`)}</td>
  </tr>`).join('');

const TREE = (head) => `<div class="tree">
  <div class="treehead">${esc(head)}</div>
  ${icons.map(i => `<div class="row">${use(i.id, 16, '')}<span>${esc(i.label)}</span></div>`).join('\n  ')}
</div>`;

const totalBytes = icons.reduce((a, i) => a + i.bytes, 0);
const TABLE = icons.map(i => `
  <tr>
    <td class="mono">${esc(i.id)}</td>
    <td class="mono dim">svg/file/${esc(i.id)}.svg</td>
    <td class="mono">${i.archetype}</td>
    <td class="mono num">${i.bytes}</td>
    <td class="mono dim">${esc(i.palette)}</td>
  </tr>`).join('');

const html = `<title>${esc(TITLE)}</title>
<style>
  :root{--bg:#121314;--bg2:#191A1B;--panel:#1C1E1F;--line:#2A2D2E;--fg:#D7D9DA;--dim:#8A9092;
    --mono:ui-monospace,SFMono-Regular,"SF Mono",Menlo,monospace;
    --sans:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;}
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
  <p class="sub">Hand-authored SVGs, ${icons.length} icons (core-tier ranks 97–120: package managers,
  bundlers, test runners, meta-frameworks). No &lt;text&gt;, no font-family, no gradients, no external
  references: every letterform is an Inter&nbsp;Bold outline baked by tools/letterpath.mjs. No canon
  concept falls in this slice, so there is no drift section.</p>
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
    <thead><tr><th>concept</th><th>16</th><th>22</th><th>tree row (22 px, real filename)</th><th>32</th><th>64</th></tr></thead>
    <tbody>${LADDER}</tbody>
  </table>
</section>

<section>
  <h2>As a set</h2>
  <p class="lede">The batch-5 slice as one explorer listing, on the editor background and on #1E1E1E.</p>
  <div class="strips">${TREE('explorer · 22px rows · 16px icons')}${TREE('on #1E1E1E')}</div>
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

const out = join(ROOT, 'contact-batch5.html');
writeFileSync(out, html, 'utf8');
console.log(`${out}  (${Buffer.byteLength(html)} bytes, ${icons.length} icons, ${totalBytes} icon bytes)`);

const WIDTH = 1240;
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
	throw new Error(`no Playwright chromium under ${cache}`);
}
const COMMON = ['--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
	'--allow-file-access-from-files', '--virtual-time-budget=8000'];
if (process.argv.includes('--png')) {
	const bin = chromium();
	const probe = join(tmpdir(), `m11-b5-probe-${process.pid}.html`);
	writeFileSync(probe, `<!doctype html><body style="margin:0"><pre id="o"></pre>` +
		`<iframe id="f" src="file://${out}" style="width:${WIDTH}px;height:400px;border:0"></iframe>` +
		`<script>f.onload=()=>{document.getElementById('o').textContent='PAGEHEIGHT='+f.contentDocument.documentElement.scrollHeight}</script>`);
	const dom = execFileSync(bin, [...COMMON, `--window-size=${WIDTH + 200},600`, '--dump-dom', `file://${probe}`],
		{ encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
	rmSync(probe, { force: true });
	const m = /PAGEHEIGHT=(\d+)/.exec(dom);
	if (!m) { throw new Error('could not measure the page height'); }
	const png = join(ROOT, 'contact-batch5.png');
	execFileSync(bin, [...COMMON, '--force-device-scale-factor=2', '--default-background-color=121314ff',
		`--window-size=${WIDTH},${m[1]}`, `--screenshot=${png}`, `file://${out}`],
		{ stdio: ['ignore', 'ignore', 'ignore'] });
	console.log(`${png}  (${WIDTH}x${m[1]} css px at 2x, ${Buffer.byteLength(readFileSync(png))} bytes)`);
}
