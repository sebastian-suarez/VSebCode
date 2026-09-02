#!/usr/bin/env node
// contact6.mjs — batch-6 contact sheet (scratchpad tool; tools/contact.mjs carries a
// hard-coded batch-1 roster and cannot filter, so batch 6 renders its own subset).
//
//   node contact6.mjs [--png]

import { readFileSync, writeFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { homedir, tmpdir } from 'node:os';

const ROOT = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production';
const BATCH = 'batch6';
const TITLE = 'M11 Batch 6 — file tail (121–145) + generics';
const argv = process.argv.slice(2);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// id, archetype, tree label, palette source
const BESPOKE = [
	['nestjs', 'SILHOUETTE', 'nest-cli.json', 'brand #E0234E → #C4485F'],
	['django', 'BADGE', 'settings.djt', 'brand #092E20 ↑ #43885F'],
	['expo', 'BADGE', 'app.json', 'brand #000020 ↑ #68779E'],
	['tauri', 'SILHOUETTE', 'tauri.conf.json', 'brand #FFC131 → #D19A3C'],
	['jupyter', 'GLYPH', 'analysis.ipynb', 'brand #F37626 → #D97A3C'],
	['terraform', 'SILHOUETTE', 'main.tf', 'brand #844FBA → #8A63BE'],
	['helm', 'SILHOUETTE', 'Chart.yaml', 'brand #0F1689 ↑ #6A7ED0'],
	['github-actions-workflow', 'SILHOUETTE', 'ci.yml', 'no brand → #4E93D6'],
	['gitlab', 'SILHOUETTE', '.gitlab-ci.yml', 'brand #FC6D26 → #E8973E'],
	['jenkins', 'BADGE', 'Jenkinsfile', 'brand #D24939 → #C0554A'],
	['vercel', 'SILHOUETTE', 'vercel.json', 'brand #000000 ↑ #DADCE0'],
	['netlify', 'SILHOUETTE', 'netlify.toml', 'brand #00C7B7 → #3AAFB9'],
	['firebase', 'SILHOUETTE', 'firebase.json', 'brand #FFCA28 → #EBBE45'],
	['supabase', 'SILHOUETTE', 'supabase.ts', 'brand #3FCF8E → #4CB984'],
	['http', 'GLYPH', 'api.http', 'no brand → #6E93B4'],
	['swagger', 'SILHOUETTE', 'swagger.yaml', 'no brand → #6FA83C'],
	['mermaid', 'SILHOUETTE', 'flow.mmd', 'brand #FF3670 → #D4547B'],
	['claude', 'GLYPH', 'CLAUDE.md', 'brand #D97757 (kept)'],
	['copilot', 'SILHOUETTE', 'copilot-instructions.md', 'no brand → #C6CBD1'],
	['agents', 'SILHOUETTE', 'AGENTS.md', 'no brand → #A98FD6'],
	['cursor', 'SILHOUETTE', '.cursorrules', 'no brand → #9FAAB8'],
	['vscode', 'SILHOUETTE', 'settings.json', 'brand #007ACC → #2782C2'],
	['favicon', 'SILHOUETTE', 'favicon.ico', 'no brand → #DCBB5C'],
	['todo', 'GLYPH', 'TODO.md', 'no brand → #C9A241'],
	['codeowners', 'SILHOUETTE', 'CODEOWNERS', 'no brand → #A89C8E']
];

const GENERIC = [
	['file', 'SILHOUETTE', 'notes.xyz', 'pilot default #C5C5C5 / #9C9C9C'],
	['generic-code', 'GLYPH', 'main.zig', '645 concepts → #7C8CA0'],
	['generic-config', 'SILHOUETTE', 'ansible.cfg', '297 concepts → #93887A'],
	['generic-data', 'SILHOUETTE', 'data.parquet', '16 concepts → #6F958F'],
	['generic-doc', 'GLYPH', 'CHANGELOG', '28 concepts → #8D9298'],
	['generic-image', 'SILHOUETTE', 'art.psd', '17 concepts → #8A7FA0'],
	['generic-media', 'GLYPH', 'anim.lottie', '5 concepts → #9B7F87'],
	['generic-font', 'GLYPH', 'Inter.glyphs', '3 concepts → #8E9575'],
	['generic-archive', 'SILHOUETTE', 'bundle.vsix', '6 concepts → #96805E'],
	['generic-binary', 'SILHOUETTE', 'model.safetensors', '8 concepts → #6F7A85']
];

// batch-1 neighbours, for the mixed-tree sanity strip
const NEIGHBOURS = ['typescript', 'json', 'markdown', 'yaml', 'docker', 'npm', 'git', 'lock'];
const NEIGHBOUR_LABELS = {
	typescript: 'index.ts', json: 'package.json', markdown: 'README.md', yaml: 'ci.yml',
	docker: 'Dockerfile', npm: '.npmrc', git: '.gitignore', lock: 'pnpm-lock.yaml'
};

const load = (id) => {
	const file = join(ROOT, 'svg', 'file', `${id}.svg`);
	if (!existsSync(file)) { throw new Error(`missing ${file}`); }
	const src = readFileSync(file, 'utf8');
	return {
		id,
		inner: src.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, ''),
		bytes: Buffer.byteLength(src)
	};
};

const mk = (rows) => rows.map(([id, archetype, label, palette]) => ({ ...load(id), archetype, label, palette }));
const bespoke = mk(BESPOKE);
const generic = mk(GENERIC);
const icons = [...bespoke, ...generic];
const neighbours = NEIGHBOURS.filter(id => existsSync(join(ROOT, 'svg', 'file', `${id}.svg`))).map(load);

const defs = `<svg width="0" height="0" aria-hidden="true" style="position:absolute"><defs>
${[...icons, ...neighbours].map(i => `<symbol id="p-${i.id}" viewBox="0 0 16 16">${i.inner}</symbol>`).join('\n')}
</defs></svg>`;

const use = (id, s, alt) =>
	`<svg class="ico" width="${s}" height="${s}" role="img" aria-label="${esc(alt)}"><use href="#p-${id}"/></svg>`;

const ladder = (list) => list.map(i => `
  <tr>
    <th scope="row"><span class="nm">${esc(i.id)}</span><span class="arch">${i.archetype}</span></th>
    <td>${use(i.id, 16, `${i.id} 16px`)}</td>
    <td>${use(i.id, 22, `${i.id} 22px`)}</td>
    <td class="rowcell"><span class="trow">${use(i.id, 16, '')}<span>${esc(i.label)}</span></span></td>
    <td>${use(i.id, 32, `${i.id} 32px`)}</td>
    <td>${use(i.id, 64, `${i.id} 64px`)}</td>
  </tr>`).join('');

const strip = (list, head, bg) => `<div class="tree"${bg ? ` style="background:${bg}"` : ''}>
  <div class="treehead">${esc(head)}</div>
  ${list.map(i => `<div class="row">${use(i.id, 16, '')}<span>${esc(i.label || NEIGHBOUR_LABELS[i.id] || i.id)}</span></div>`).join('\n  ')}
</div>`;

const mixed = [...bespoke.slice(0, 9), ...neighbours.slice(0, 4), ...generic, ...neighbours.slice(4)]
	.map(i => ({ ...i, label: i.label || NEIGHBOUR_LABELS[i.id] }));

const totalBytes = icons.reduce((a, i) => a + i.bytes, 0);

const table = (list) => list.map(i => `
  <tr>
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
  .sub{color:var(--dim);max-width:74ch;margin:0 0 20px}
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
  .strips{display:grid;grid-template-columns:repeat(3,360px);gap:20px;align-items:start}
  .grid{display:flex;flex-wrap:wrap;gap:14px;background:var(--panel);border:1px solid var(--line);
        border-radius:10px;padding:18px}
  .cell{width:76px;text-align:center}
  .cell .ico{display:block;margin:0 auto 6px}
  .cell span{font:10px/1.3 var(--mono);color:var(--dim);word-break:break-all}
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
  <p class="sub">Hand-authored SVGs, ${icons.length} icons: the last 25 file concepts of
  core-tier.json plus the ten category fallbacks that carry the long tail. No &lt;text&gt;,
  no font-family, no gradients, no external references; every letterform is an Inter&nbsp;Bold
  outline baked by tools/letterpath.mjs.</p>
  <div class="meta">
    <span class="tag">${icons.length} icons</span>
    <span class="tag">${bespoke.length} bespoke + ${generic.length} generic</span>
    <span class="tag">${totalBytes} bytes total</span>
    <span class="tag">avg ${Math.round(totalBytes / icons.length)} B</span>
    <span class="tag">max ${Math.max(...icons.map(i => i.bytes))} B</span>
    <span class="tag">bg #121314</span>
  </div>
</header>

<section>
  <h2>Size ladder — concepts 121–145</h2>
  <p class="lede">16&nbsp;px is the primary target; the 22&nbsp;px tree row is the real usage context;
  32 and 64 only have to stay clean.</p>
  <table>
    <thead><tr><th>concept</th><th>16</th><th>22</th><th>tree row (22 px)</th><th>32</th><th>64</th></tr></thead>
    <tbody>${ladder(bespoke)}</tbody>
  </table>
</section>

<section>
  <h2>Size ladder — the generics</h2>
  <p class="lede">The background population of the tree: one mark per <span class="mono">fallback</span>
  category in merged-inventory.json, plus the plain <span class="mono">file</span> default. They are
  deliberately dimmer and lower-chroma than the bespoke icons — they must never out-shout a brand mark.
  <span class="mono">generic-folder</span> (324 concepts) is a folder fallback and is already served by
  the canon <span class="mono">folder</span> / <span class="mono">folder-open</span>; no new file asset.</p>
  <table>
    <thead><tr><th>concept</th><th>16</th><th>22</th><th>tree row (22 px)</th><th>32</th><th>64</th></tr></thead>
    <tbody>${ladder(generic)}</tbody>
  </table>
</section>

<section>
  <h2>16 px grid</h2>
  <p class="lede">Everything at the primary size, nothing else on the page.</p>
  <div class="grid">${icons.map(i => `<div class="cell">${use(i.id, 16, i.id)}<span>${esc(i.id)}</span></div>`).join('')}</div>
</section>

<section>
  <h2>64 px grid</h2>
  <div class="grid">${icons.map(i => `<div class="cell" style="width:96px">${use(i.id, 64, i.id)}<span>${esc(i.id)}</span></div>`).join('')}</div>
</section>

<section>
  <h2>As a set</h2>
  <p class="lede">Explorer listings: batch 6 bespoke, the generics alone, and a mixed tree with
  batch-1 neighbours interleaved (the real weight test).</p>
  <div class="strips">
    ${strip(bespoke, 'batch 6 · 22px rows · 16px icons')}
    ${strip(generic, 'generics · on #1E1E1E', '#1E1E1E')}
    ${strip(mixed, 'mixed with batch 1')}
  </div>
</section>

<section>
  <h2>Manifest — bespoke</h2>
  <table class="ftable">
    <thead><tr><th>id</th><th>path</th><th>archetype</th><th class="num">bytes</th><th>colour source</th></tr></thead>
    <tbody>${table(bespoke)}</tbody>
  </table>
  <h2>Manifest — generics</h2>
  <table class="ftable">
    <thead><tr><th>id</th><th>path</th><th>archetype</th><th class="num">bytes</th><th>colour source</th></tr></thead>
    <tbody>${table(generic)}</tbody>
    <tfoot><tr><td colspan="3">${icons.length} icons in batch 6</td><td class="num">${totalBytes}</td><td>—</td></tr></tfoot>
  </table>
</section>
</div>
`;

const out = join(ROOT, `contact-${BATCH}.html`);
writeFileSync(out, html, 'utf8');
console.log(`${out}  (${Buffer.byteLength(html)} bytes, ${icons.length} icons, ${totalBytes} icon bytes)`);

// ---- 2x screenshot ---------------------------------------------------------
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

if (argv.includes('--png')) {
	const bin = chromium();
	const probe = join(tmpdir(), `m11-contact6-probe-${process.pid}.html`);
	writeFileSync(probe, `<!doctype html><body style="margin:0"><pre id="o"></pre>` +
		`<iframe id="f" src="file://${out}" style="width:${WIDTH}px;height:400px;border:0"></iframe>` +
		`<script>f.onload=()=>{document.getElementById('o').textContent='PAGEHEIGHT='+f.contentDocument.documentElement.scrollHeight}</script>`);
	const dom = execFileSync(bin, [...COMMON, `--window-size=${WIDTH + 200},600`, '--dump-dom', `file://${probe}`],
		{ encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
	rmSync(probe, { force: true });
	const m = /PAGEHEIGHT=(\d+)/.exec(dom);
	if (!m) { throw new Error('could not measure the page height'); }
	const png = join(ROOT, `contact-${BATCH}.png`);
	execFileSync(bin, [...COMMON, '--force-device-scale-factor=2', '--default-background-color=121314ff',
		`--window-size=${WIDTH},${m[1]}`, `--screenshot=${png}`, `file://${out}`],
		{ stdio: ['ignore', 'ignore', 'ignore'] });
	console.log(`${png}  (${WIDTH}x${m[1]} css px at 2x, ${Buffer.byteLength(readFileSync(png))} bytes)`);
	console.log(`  renderer: ${bin}`);
}
