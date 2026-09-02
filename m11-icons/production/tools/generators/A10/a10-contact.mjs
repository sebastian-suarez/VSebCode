// A10 thin contact-sheet builder — writes production/contact-A10.html (+ .png at 2x).
// Local to this slice; the shared tools/ are untouched.
import { readFileSync, writeFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { homedir, tmpdir } from 'node:os';
import { ROSTER } from './a10-roster.mjs';

const ROOT = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const GROUPS = [
	['Linters, formatters & code quality', ['hadolint', 'haxecheckstyle', 'htmlhint', 'htmlvalidate', 'jshint',
		'licensebat', 'lintstagedrc', 'lychee', 'madge', 'markdownlint', 'markdownlint-ignore', 'markuplint',
		'mdxlint', 'mypy', 'npmpackagejsonlint', 'oxc', 'phpcsfixer', 'precommit']],
	['Testing, QA & security', ['happo', 'jasmine', 'kitchenci', 'mondoo', 'nsri', 'nsri-integrity', 'nyc',
		'peeky', 'percy', 'protractor']],
	['Cloud, hosting & infrastructure', ['heroku', 'procfile', 'homeassistant', 'host', 'ifanr-cloud',
		'kubernetes', 'liara', 'opentofu', 'packship', 'pm2', 'pm2-ecosystem', 'prefect']],
	['Build, packages & monorepo', ['hardhat', 'jpm', 'jsr', 'lerna', 'minecraft-fabric', 'mise', 'moon',
		'nodemon', 'nuget', 'panda', 'pandacss', 'parcel', 'pdm', 'postcssconfig', 'posthtml', 'preact']],
	['Content, docs & CMS', ['histoire', 'hugo', 'keystatic', 'mailing', 'manifest', 'markdoc-config',
		'motif', 'ngrx-entity', 'payload', 'phraseapp']],
	['Editors, agents & other config', ['hack', 'harmonix', 'helix', 'husky', 'imgbot', 'ini', 'jetbrains',
		'kite', 'kodiak', 'livekit', 'lynx', 'mcp', 'mikro-orm', 'monotone', 'ndst', 'objidconfig',
		'opencode', 'orval']]
];

const meta = new Map(ROSTER.map(([id, archetype, hex, label, source]) => [id, { id, archetype, hex, label, source }]));
const assigned = GROUPS.flatMap(g => g[1]);
if (assigned.length !== ROSTER.length) { throw new Error(`grouped ${assigned.length} of ${ROSTER.length}`); }
for (const id of assigned) { if (!meta.has(id)) { throw new Error(`unknown id ${id}`); } }
if (new Set(assigned).size !== assigned.length) { throw new Error('duplicate in groups'); }

for (const m of meta.values()) {
	const file = join(ROOT, 'svg', 'file', `${m.id}.svg`);
	if (!existsSync(file)) { throw new Error(`missing ${file}`); }
	const src = readFileSync(file, 'utf8');
	m.inner = src.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
	m.bytes = Buffer.byteLength(src);
}

const total = [...meta.values()].reduce((a, m) => a + m.bytes, 0);
const defs = `<svg width="0" height="0" aria-hidden="true" style="position:absolute"><defs>` +
	[...meta.values()].map(m => `<symbol id="a-${m.id}" viewBox="0 0 16 16">${m.inner}</symbol>`).join('') +
	`</defs></svg>`;
const use = (id, s, alt) => `<svg class="ico" width="${s}" height="${s}" role="img" aria-label="${esc(alt)}"><use href="#a-${id}"/></svg>`;

const grid = (ids) => `<div class="grid">` + ids.map(id => {
	const m = meta.get(id);
	return `<figure><span class="cell">${use(id, 16, id)}</span><figcaption>${esc(id)}<br><span>${m.archetype[0] + m.archetype.slice(1).toLowerCase()}</span></figcaption></figure>`;
}).join('') + `</div>`;

const tree = (ids) => `<div class="tree">` + ids.map(id =>
	`<div class="row">${use(id, 16, '')}<span>${esc(meta.get(id).label)}</span></div>`).join('') + `</div>`;

const sections = GROUPS.map(([title, ids]) => `
<section>
  <h2>${esc(title)} <em>${ids.length}</em></h2>
  <div class="pair">${grid(ids)}${tree(ids)}</div>
</section>`).join('');

const manifest = ROSTER.map(([id, archetype, hex, , source]) => `
  <tr><td class="mono">${esc(id)}</td><td class="mono dim">svg/file/${esc(id)}.svg</td>
  <td class="mono">${archetype}</td><td class="mono num">${meta.get(id).bytes}</td>
  <td class="mono"><span class="sw" style="background:${hex}"></span>${hex}</td>
  <td class="mono dim">${esc(source)}</td></tr>`).join('');

const counts = ['BADGE', 'GLYPH', 'SILHOUETTE'].map(a => `${a.toLowerCase()} ${ROSTER.filter(r => r[1] === a).length}`).join(' · ');

const html = `<title>M11 long-tail A10</title>
<style>
  :root{--bg:#121314;--bg2:#191A1B;--panel:#1C1E1F;--line:#2A2D2E;--fg:#D7D9DA;--dim:#8A9092;
    --mono:ui-monospace,SFMono-Regular,"SF Mono",Menlo,monospace;
    --sans:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.55 var(--sans);
       -webkit-font-smoothing:antialiased;padding:0 0 90px}
  .wrap{max-width:1180px;margin:0 auto;padding:0 28px}
  header{padding:52px 0 32px;border-bottom:1px solid var(--line);margin-bottom:40px}
  h1{font-size:29px;line-height:1.15;margin:0 0 12px;letter-spacing:-.02em;font-weight:600}
  .sub{color:var(--dim);max-width:74ch;margin:0 0 18px}
  .meta{display:flex;flex-wrap:wrap;gap:8px}
  .tag{font:11px/1 var(--mono);color:var(--dim);border:1px solid var(--line);border-radius:999px;
       padding:6px 10px;background:var(--bg2)}
  h2{font-size:12px;letter-spacing:.13em;text-transform:uppercase;color:var(--dim);font-weight:600;
     margin:44px 0 16px;display:flex;align-items:center;gap:10px}
  h2 em{font-style:normal;font:10px/1 var(--mono);color:#5C6163;border:1px solid var(--line);
        border-radius:999px;padding:5px 8px;letter-spacing:.04em}
  .pair{display:grid;grid-template-columns:1fr 300px;gap:26px;align-items:start}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:4px 0;
        background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:16px 8px}
  figure{margin:0;text-align:center;padding:8px 2px}
  .cell{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px}
  figcaption{font:10px/1.5 var(--mono);color:var(--fg);margin-top:7px;word-break:break-all}
  figcaption span{color:#5C6163}
  .ico{display:inline-block;vertical-align:middle}
  .tree{border:1px solid var(--line);border-radius:10px;padding:10px 0 12px;background:#1E1E1E}
  .tree .row{display:flex;align-items:center;gap:7px;padding:0 14px;height:22px}
  .tree .row span{font:13px/1 var(--sans);color:#CCC;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  table{border-collapse:collapse;width:100%;background:var(--panel);border:1px solid var(--line);
        border-radius:10px;overflow:hidden}
  thead th{font:11px/1.4 var(--mono);text-transform:uppercase;letter-spacing:.08em;color:var(--dim);
           text-align:left;padding:11px 14px;border-bottom:1px solid var(--line);font-weight:500}
  td{padding:7px 14px;vertical-align:middle;border-top:1px solid var(--line)}
  .mono{font:11.5px/1.5 var(--mono)}.dim{color:var(--dim)}.num{text-align:right}
  .sw{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:7px;vertical-align:-1px}
  tfoot td{color:var(--dim);font:11.5px/1.5 var(--mono)}
</style>
${defs}
<div class="wrap">
<header>
  <h1>M11 long-tail slice A10 — 84 config concepts</h1>
  <p class="sub">Hand-authored SVGs on the production spec: archetype envelopes, the two centring laws,
  every typographic letter baked from Inter&nbsp;Bold by tools/letterpath.mjs, flat matte fills, no
  &lt;text&gt;, no external references. Left of each group: the 16&nbsp;px mark on the panel.
  Right: the same icons in 22&nbsp;px explorer rows against real matched filenames.</p>
  <div class="meta">
    <span class="tag">84 icons</span><span class="tag">${counts}</span>
    <span class="tag">${total} bytes total</span><span class="tag">avg ${Math.round(total / 84)} B</span>
    <span class="tag">max ${Math.max(...[...meta.values()].map(m => m.bytes))} B</span>
    <span class="tag">bg #121314 / rows #1E1E1E</span>
  </div>
</header>
${sections}
<section>
  <h2>Manifest</h2>
  <table>
    <thead><tr><th>id</th><th>path</th><th>archetype</th><th class="num">bytes</th><th>dominant</th><th>colour source</th></tr></thead>
    <tbody>${manifest}</tbody>
    <tfoot><tr><td colspan="3">84 icons</td><td class="num">${total}</td><td colspan="2">—</td></tr></tfoot>
  </table>
</section>
</div>`;

const out = join(ROOT, 'contact-A10.html');
writeFileSync(out, html, 'utf8');
console.log(`${out}  (${Buffer.byteLength(html)} bytes)`);

// ---- 2x screenshot ----------------------------------------------------------
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
const WIDTH = 1240;
const bin = chromium();
const probe = join(tmpdir(), `a10-probe-${process.pid}.html`);
writeFileSync(probe, `<!doctype html><body style="margin:0"><pre id="o"></pre>` +
	`<iframe id="f" src="file://${out}" style="width:${WIDTH}px;height:400px;border:0"></iframe>` +
	`<script>f.onload=()=>{document.getElementById('o').textContent='H='+f.contentDocument.documentElement.scrollHeight}</script>`);
const dom = execFileSync(bin, [...COMMON, `--window-size=${WIDTH + 200},600`, '--dump-dom', `file://${probe}`],
	{ encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
rmSync(probe, { force: true });
const height = +/H=(\d+)/.exec(dom)[1];
const png = join(ROOT, 'contact-A10.png');
execFileSync(bin, [...COMMON, '--force-device-scale-factor=2', '--default-background-color=121314ff',
	`--window-size=${WIDTH},${height}`, `--screenshot=${png}`, `file://${out}`], { stdio: 'ignore' });
console.log(`${png}  (${WIDTH}x${height} css px at 2x, ${readFileSync(png).length} bytes)`);
console.log(`  renderer: ${bin}`);
