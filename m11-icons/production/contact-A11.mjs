#!/usr/bin/env node
// contact-A11.mjs — thin contact sheet for the M11 long-tail slice A11 (D20 amendment 2).
// Local to this slice; the shared tools/contact*.mjs are untouched.
//
//   node contact-A11.mjs            # -> contact-A11.html
//   node contact-A11.mjs --png      # also shoots contact-A11.png at 2x
//
// Every icon is inlined once as an SVG <symbol> and referenced with <use>, so the page
// carries no external request. Sections: a 16 px grid grouped by tool domain, 22 px tree
// rows carrying the real filenames the matchers fire on, and a manifest footer.

import { readFileSync, writeFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { homedir, tmpdir } from 'node:os';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SLICE = 'A11';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// tool-domain grouping: what actually sits together in a repo
const GROUPS = [
	['Python & packaging', ['pyenv', 'pypi', 'pytest', 'pyup', 'ruff', 'tox', 'ty']],
	['Bundlers, frameworks & UI', ['quasar', 'razzle', 'reactrouter', 'remix', 'rolldown', 'rome',
		'rstack', 'sails', 'sapphire-framework-cli', 'seedkit', 'shadcn', 'slashup', 'snowpack',
		'stitches', 'svelteconfig', 'swc', 'tsdown', 'umi', 'unocss', 'purgecss', 'velite']],
	['Linting, formatting & prose', ['rehype', 'remark', 'retext', 'rspec', 'rubocop', 'styleci',
		'stylish-haskell', 'taplo', 'testcafe', 'textlint', 'tslint', 'unibeautify', 'vale']],
	['Security & dependency health', ['renovate', 'semanticrelease', 'semgrep', 'snyk', 'solidarity',
		'syncpack', 'taze', 'trivy']],
	['CI, tasks & version control', ['publiccode', 'rc', 'registry', 'robots', 'screwdriver',
		'sitemap', 'smithery', 'steadybit', 'subversion', 'systemd', 'taskfile', 'tfs', 'tmux',
		'tobimake', 'travis', 'trigger']],
	['Cloud, deploy & registries', ['pulumi', 'puppeteer', 'railway', 'render', 'rocket', 'serverless',
		'shuttle', 'slug', 'snapcraft', 'snaplet', 'spin', 'stackblitz', 'sublime', 'tiltfile',
		'truffle', 'trunk', 'vagrant', 'vapor', 'verdaccio']]
];

const worklist = JSON.parse(readFileSync(join(ROOT, 'longtail-worklist.json'), 'utf8'));
const slice = worklist.slices.find(s => s.id === SLICE);
const concepts = new Map(slice.concepts.map(c => [c.id, c]));

// the roster carries the archetype + colour source the slice was authored against
const META = JSON.parse(readFileSync(join(ROOT, `contact-${SLICE}-roster.json`), 'utf8'));

const flat = GROUPS.flatMap(([, ids]) => ids);
const missing = [...concepts.keys()].filter(id => !flat.includes(id));
const extra = flat.filter(id => !concepts.has(id));
if (missing.length || extra.length) {
	throw new Error(`grouping drift — missing ${missing.join(',')} / extra ${extra.join(',')}`);
}

/** The filename a reader will actually see in the explorer for this concept. */
function sample(c) {
	const fn = c.match.filenames ?? [];
	const ex = c.match.extensions ?? [];
	const plain = fn.filter(f => !f.includes('/'));
	if (plain.length) {
		// prefer a concrete config over a bare rc stub, and js over the exotic extensions
		const pref = plain.find(f => /\.(js|ts|json|ya?ml|toml|ini|conf)$/.test(f)) ?? plain[0];
		return pref;
	}
	if (fn.length) { return fn[0]; }
	if (ex.length) { return `settings.${ex[0]}`; }
	return c.id;
}

const icons = flat.map(id => {
	const file = join(ROOT, 'svg', 'file', `${id}.svg`);
	if (!existsSync(file)) { throw new Error(`missing ${file}`); }
	const src = readFileSync(file, 'utf8');
	const m = META[id];
	if (!m) { throw new Error(`no roster entry for ${id}`); }
	return {
		id,
		label: concepts.get(id).label,
		filename: sample(concepts.get(id)),
		archetype: m.archetype,
		fill: m.fill,
		source: m.note,
		inner: src.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, ''),
		bytes: Buffer.byteLength(src)
	};
});
const byId = new Map(icons.map(i => [i.id, i]));
const totalBytes = icons.reduce((a, i) => a + i.bytes, 0);

const defs = `<svg width="0" height="0" aria-hidden="true" style="position:absolute"><defs>
${icons.map(i => `<symbol id="a-${i.id}" viewBox="0 0 16 16">${i.inner}</symbol>`).join('\n')}
</defs></svg>`;

const use = (id, s, alt) =>
	`<svg class="ico" width="${s}" height="${s}" role="img" aria-label="${esc(alt)}"><use href="#a-${id}"/></svg>`;

const GRID = GROUPS.map(([title, ids]) => `
  <h3>${esc(title)} <span>${ids.length}</span></h3>
  <div class="grid">${ids.map(id => {
		const i = byId.get(id);
		return `<figure><span class="cell">${use(id, 16, `${id} 16px`)}</span>
      <figcaption>${esc(i.id)}<br><span class="arch">${i.archetype}</span></figcaption></figure>`;
	}).join('')}</div>`).join('');

const TREES = GROUPS.map(([title, ids]) => `
  <div class="tree">
    <div class="treehead">${esc(title)}</div>
    ${ids.map(id => {
		const i = byId.get(id);
		return `<div class="row">${use(id, 16, '')}<span>${esc(i.filename)}</span></div>`;
	}).join('\n    ')}
  </div>`).join('');

const LADDER = icons.map(i => `
  <tr>
    <th scope="row"><span class="nm">${esc(i.id)}</span><span class="arch">${i.archetype}</span></th>
    <td>${use(i.id, 16, `${i.id} 16px`)}</td>
    <td>${use(i.id, 22, `${i.id} 22px`)}</td>
    <td class="rowcell"><span class="trow">${use(i.id, 16, '')}<span>${esc(i.filename)}</span></span></td>
    <td>${use(i.id, 32, `${i.id} 32px`)}</td>
    <td>${use(i.id, 64, `${i.id} 64px`)}</td>
  </tr>`).join('');

const TABLE = icons.slice().sort((a, b) => a.id.localeCompare(b.id)).map(i => `
  <tr>
    <td class="mono">${esc(i.id)}</td>
    <td class="mono">${i.archetype}</td>
    <td class="mono num">${i.bytes}</td>
    <td class="mono"><span class="sw" style="background:${i.fill}"></span>${i.fill}</td>
    <td class="mono dim">${esc(i.source)}</td>
  </tr>`).join('');

const counts = icons.reduce((a, i) => { a[i.archetype] = (a[i.archetype] || 0) + 1; return a; }, {});

const html = `<title>M11 long-tail A11 — contact sheet</title>
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
  header{padding:56px 0 32px;border-bottom:1px solid var(--line);margin-bottom:40px}
  h1{font-size:29px;line-height:1.15;margin:0 0 12px;letter-spacing:-.02em;font-weight:600}
  .sub{color:var(--dim);max-width:74ch;margin:0 0 20px}
  .meta{display:flex;flex-wrap:wrap;gap:8px}
  .tag{font:11px/1 var(--mono);color:var(--dim);border:1px solid var(--line);
       border-radius:999px;padding:6px 10px;background:var(--bg2)}
  h2{font-size:12px;letter-spacing:.13em;text-transform:uppercase;color:var(--dim);
     font-weight:600;margin:52px 0 6px}
  h2:first-of-type{margin-top:0}
  h3{font:12px/1.4 var(--mono);color:var(--fg);font-weight:500;margin:26px 0 12px;
     letter-spacing:.02em}
  h3 span{color:var(--dim)}
  .lede{color:var(--dim);margin:0 0 22px;max-width:78ch}

  .grid{display:flex;flex-wrap:wrap;gap:6px}
  .grid figure{margin:0;width:96px;text-align:center}
  .cell{display:flex;align-items:center;justify-content:center;width:96px;height:52px;
        background:var(--panel);border:1px solid var(--line);border-radius:8px}
  .grid figcaption{font:10px/1.45 var(--mono);color:var(--dim);margin-top:6px;
                   word-break:break-all}
  .grid .arch{color:#5C6163;font-size:9px;letter-spacing:.05em}

  .trees{display:grid;grid-template-columns:repeat(2,1fr);gap:18px;align-items:start}
  .tree{border:1px solid var(--line);border-radius:10px;padding:8px 0 12px;background:var(--bg)}
  .treehead{font:10px/1 var(--mono);color:var(--dim);letter-spacing:.08em;padding:6px 14px 12px;
            text-transform:uppercase}
  .tree .row{display:flex;align-items:center;gap:7px;padding:0 14px;height:22px}
  .tree .row span{font:13px/1 var(--sans);color:#CCC;white-space:nowrap;overflow:hidden;
                  text-overflow:ellipsis}

  table{border-collapse:collapse;width:100%;background:var(--panel);
        border:1px solid var(--line);border-radius:10px;overflow:hidden}
  thead th{font:11px/1.4 var(--mono);text-transform:uppercase;letter-spacing:.08em;color:var(--dim);
           text-align:center;padding:12px 8px;border-bottom:1px solid var(--line);font-weight:500}
  thead th:first-child{text-align:left}
  tbody th{text-align:left;font-weight:400;padding:9px 14px;white-space:nowrap}
  .nm{font:12px/1 var(--mono);color:var(--fg)}
  .arch{display:block;font:10px/1.6 var(--mono);color:var(--dim);letter-spacing:.06em}
  td{padding:9px 8px;text-align:center;vertical-align:middle}
  tbody tr+tr th,tbody tr+tr td{border-top:1px solid var(--line)}
  .ico{display:inline-block;vertical-align:middle}
  .rowcell{text-align:left;padding-left:16px}
  .trow{display:inline-flex;align-items:center;gap:7px;height:22px;padding:0 8px;border-radius:4px}
  .trow span{font:13px/1 var(--sans);color:#CCC;white-space:nowrap}
  .mono{font:12px/1.5 var(--mono)}
  .dim{color:var(--dim)}
  .num{text-align:right}
  .ftable td{text-align:left;padding:8px 14px}
  .ftable td.num{text-align:right}
  .sw{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:7px;
      vertical-align:baseline}
  tfoot td{border-top:1px solid var(--line);color:var(--dim);font:12px/1.5 var(--mono)}
</style>

${defs}

<div class="wrap">
<header>
  <h1>M11 long-tail — slice A11 (config &amp; tooling, P→V)</h1>
  <p class="sub">${icons.length} hand-authored file icons for the D20 amendment&nbsp;2 full-coverage wave.
  Spec §11 craft bar: real marks first, letters only as the fallback and always baked through
  tools/letterpath.mjs; no &lt;text&gt;, no font-family, no gradients, no external references.
  R7 is clean inside the slice; R8 is clean inside the slice and against the whole core set.</p>
  <div class="meta">
    <span class="tag">${icons.length} icons</span>
    <span class="tag">${Object.entries(counts).map(([k, v]) => `${v} ${k.toLowerCase()}`).join(' · ')}</span>
    <span class="tag">${totalBytes} bytes total</span>
    <span class="tag">avg ${Math.round(totalBytes / icons.length)} B</span>
    <span class="tag">max ${Math.max(...icons.map(i => i.bytes))} B</span>
    <span class="tag">bg #121314</span>
  </div>
</header>

<section>
  <h2>16 px grid, by tool domain</h2>
  <p class="lede">The primary render. Icons are grouped by what actually shares a repository
  root, which is where R7 has to hold.</p>
  ${GRID}
</section>

<section>
  <h2>22 px tree rows</h2>
  <p class="lede">The real usage context: explorer rows at 22&nbsp;px carrying the filenames each
  concept's matchers fire on.</p>
  <div class="trees">${TREES}</div>
</section>

<section>
  <h2>Size ladder</h2>
  <p class="lede">16 is the target, 22 is the tree row, 32 and 64 only have to stay clean.</p>
  <table>
    <thead><tr><th>concept</th><th>16</th><th>22</th><th>tree row</th><th>32</th><th>64</th></tr></thead>
    <tbody>${LADDER}</tbody>
  </table>
</section>

<section>
  <h2>Manifest</h2>
  <table class="ftable">
    <thead><tr><th>id</th><th>archetype</th><th class="num">bytes</th><th>dominant</th><th>colour source</th></tr></thead>
    <tbody>${TABLE}</tbody>
    <tfoot><tr><td colspan="2">${icons.length} icons</td><td class="num">${totalBytes}</td><td colspan="2">—</td></tr></tfoot>
  </table>
</section>
</div>
`;

const out = join(ROOT, `contact-${SLICE}.html`);
writeFileSync(out, html, 'utf8');
console.log(`${out}  (${Buffer.byteLength(html)} bytes, ${icons.length} icons, ${totalBytes} icon bytes)`);

// ---- 2x screenshot -----------------------------------------------------------
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
	'--allow-file-access-from-files', '--virtual-time-budget=10000'];

if (process.argv.includes('--png')) {
	const bin = chromium();
	const probe = join(tmpdir(), `a11-contact-probe-${process.pid}.html`);
	writeFileSync(probe, `<!doctype html><body style="margin:0"><pre id="o"></pre>` +
		`<iframe id="f" src="file://${out}" style="width:${WIDTH}px;height:400px;border:0"></iframe>` +
		`<script>f.onload=()=>{document.getElementById('o').textContent='PAGEHEIGHT='+f.contentDocument.documentElement.scrollHeight}</script>`);
	const dom = execFileSync(bin, [...COMMON, `--window-size=${WIDTH + 200},600`, '--dump-dom', `file://${probe}`],
		{ encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 });
	rmSync(probe, { force: true });
	const m = /PAGEHEIGHT=(\d+)/.exec(dom);
	if (!m) { throw new Error('could not measure the page height'); }
	const png = join(ROOT, `contact-${SLICE}.png`);
	execFileSync(bin, [...COMMON, '--force-device-scale-factor=2', '--default-background-color=121314ff',
		`--window-size=${WIDTH},${m[1]}`, `--screenshot=${png}`, `file://${out}`],
		{ stdio: ['ignore', 'ignore', 'ignore'] });
	console.log(`${png}  (${WIDTH}x${m[1]} css px at 2x, ${readFileSync(png).length} bytes)`);
	console.log(`  renderer: ${bin}`);
}
