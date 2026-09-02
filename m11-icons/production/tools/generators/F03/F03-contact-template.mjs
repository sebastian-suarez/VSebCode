#!/usr/bin/env node
// contact-F03.mjs — contact sheet for the M11 long-tail folder slice F03.
//
//   node contact-F03.mjs          # -> contact-F03.html
//   node contact-F03.mjs --png    # also shoots contact-F03.png at 2x
//
// tools/contact.mjs carries a hard-coded batch-1 file roster and cannot take a folder
// subset, so this is a thin local twin: same page furniture, this slice's roster, closed
// and open variants side by side, and a strip that mixes the slice with the core folders.

import { readFileSync, writeFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { homedir, tmpdir } from 'node:os';

const ROOT = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const TITLE = 'M11 long tail — folder slice F03';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// id, tree label, emblem, fill, colour source
const ROSTER = [/*__ROSTER__*/];

// the core folders this slice has to sit beside in one listing
const CORE = ['src', 'test', 'config', 'scripts', 'docs', 'node', 'git', 'github', 'docker',
	'types', 'utils', 'hooks', 'server', 'api', 'assets', 'dist'];

function load(id) {
	const file = join(ROOT, 'svg', 'folder', `${id}.svg`);
	if (!existsSync(file)) { throw new Error(`missing ${file}`); }
	const src = readFileSync(file, 'utf8');
	return {
		id,
		inner: src.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, ''),
		bytes: Buffer.byteLength(src)
	};
}

const icons = ROSTER.map(([id, tree, emblem, fill, source]) => {
	const closed = load(id), open = load(`${id}-open`);
	return { id, tree, emblem, fill, source, inner: closed.inner, openInner: open.inner,
		bytes: closed.bytes + open.bytes };
});
const core = CORE.flatMap(id => [load(id), load(`${id}-open`)]);

const symbols = [
	...icons.flatMap(i => [[i.id, i.inner], [`${i.id}-open`, i.openInner]]),
	...core.map(c => [c.id, c.inner])
];
const defs = `<svg width="0" height="0" aria-hidden="true" style="position:absolute"><defs>
${symbols.map(([id, inner]) => `<symbol id="p-${id}" viewBox="0 0 16 16">${inner}</symbol>`).join('\n')}
</defs></svg>`;

const use = (id, s, alt) =>
	`<svg class="ico" width="${s}" height="${s}" role="img" aria-label="${esc(alt)}"><use href="#p-${id}"/></svg>`;
const pair = (id, s) => `<span class="pair">${use(id, s, `${id} ${s}px`)}${use(`${id}-open`, s, `${id} open ${s}px`)}</span>`;
const row = (id, label) => `<div class="row">${use(id, 16, '')}<span>${esc(label)}</span></div>`;

const LADDER = icons.map(i => `
  <tr>
    <th scope="row"><span class="nm">${esc(i.id)}</span><span class="arch">${esc(i.emblem)}</span></th>
    <td>${pair(i.id, 16)}</td>
    <td class="rowcell"><span class="trow">${use(i.id, 16, '')}<span>${esc(i.tree)}</span></span>
      <span class="trow">${use(`${i.id}-open`, 16, '')}<span>${esc(i.tree)}</span></span></td>
    <td>${pair(i.id, 32)}</td>
    <td>${pair(i.id, 64)}</td>
  </tr>`).join('');

const tree = (head, rows, bg) =>
	`<div class="tree"${bg ? ` style="background:${bg}"` : ''}>
  <div class="treehead">${esc(head)}</div>
  ${rows.map(([id, label]) => row(id, label)).join('\n  ')}
</div>`;

const half = Math.ceil(icons.length / 2);
const SET1 = tree('slice, closed — 22 px rows', icons.slice(0, half).map(i => [i.id, i.tree]));
const SET2 = tree('slice, closed — 22 px rows', icons.slice(half).map(i => [i.id, i.tree]));
const SET3 = tree('slice, open', icons.slice(0, half).map(i => [`${i.id}-open`, i.tree]));
const MIXED = [
	['src', 'src'], ['functions', 'functions'], ['javascript', 'javascript'], ['types', 'types'],
	['interface', 'interface'], ['include', 'includes'], ['import', 'imports'], ['input', 'inputs'],
	['helper', 'helpers'], ['utils', 'utils'], ['hooks', 'hooks'], ['husky', '.husky'],
	['lefthook', 'lefthook'], ['git', '.git'], ['github', '.github'], ['gh-workflows', 'workflows'],
	['gitea', 'gitea'], ['forgejo', 'forgejo'], ['docker', 'docker'], ['kubernetes', 'kubernetes'],
	['gcp', 'gcp'], ['node', 'node_modules'], ['config', 'config'], ['idea', '.idea'],
	['gemini', '.gemini'], ['grok', '.grok'], ['kiro', '.kiro'], ['junie', '.junie'],
	['test', 'test'], ['job', 'jobs'], ['keys', 'secrets'], ['home', 'landing'],
	['form', 'forms'], ['instructions', 'instructions'], ['docs', 'docs'], ['dist', 'dist']
];
const MIX = tree('slice mixed with the core folders', MIXED);

const totalBytes = icons.reduce((a, i) => a + i.bytes, 0);

const TABLE = icons.map(i => `
  <tr>
    <td class="mono">${esc(i.id)}</td>
    <td class="mono dim">${esc(i.emblem)}</td>
    <td class="mono"><span class="sw" style="background:${i.fill}"></span>${i.fill}</td>
    <td class="mono dim">${esc(i.source)}</td>
    <td class="mono num">${i.bytes}</td>
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
  .sub{color:var(--dim);max-width:76ch;margin:0 0 20px}
  .meta{display:flex;flex-wrap:wrap;gap:8px}
  .tag{font:11px/1 var(--mono);color:var(--dim);border:1px solid var(--line);
       border-radius:999px;padding:6px 10px;background:var(--bg2)}
  h2{font-size:12px;letter-spacing:.13em;text-transform:uppercase;color:var(--dim);
     font-weight:600;margin:52px 0 6px}
  h2:first-of-type{margin-top:0}
  .lede{color:var(--dim);margin:0 0 22px;max-width:80ch}

  table{border-collapse:collapse;width:100%;background:var(--panel);
        border:1px solid var(--line);border-radius:10px;overflow:hidden}
  thead th{font:11px/1.4 var(--mono);text-transform:uppercase;letter-spacing:.08em;color:var(--dim);
           text-align:center;padding:12px 8px;border-bottom:1px solid var(--line);font-weight:500}
  thead th:first-child,tbody th{text-align:left}
  tbody th{font-weight:400;padding:9px 14px;max-width:230px}
  .nm{font:12px/1 var(--mono);color:var(--fg)}
  .arch{display:block;font:10px/1.5 var(--mono);color:var(--dim);letter-spacing:.03em}
  td{padding:9px 8px;text-align:center;vertical-align:middle}
  tbody tr+tr th,tbody tr+tr td{border-top:1px solid var(--line)}
  .ico{display:inline-block;vertical-align:middle}
  .pair{display:inline-flex;gap:8px;align-items:center}
  .rowcell{text-align:left;padding-left:16px;white-space:nowrap}
  .trow{display:inline-flex;align-items:center;gap:7px;height:22px;padding:0 8px;border-radius:4px}
  .trow span{font:13px/1 var(--sans);color:#CCCCCC;white-space:nowrap}

  .tree{border:1px solid var(--line);border-radius:10px;padding:10px 0 14px;background:var(--bg);
        max-width:270px}
  .treehead{font:10px/1 var(--mono);color:var(--dim);letter-spacing:.08em;padding:6px 14px 12px}
  .tree .row{display:flex;align-items:center;gap:7px;padding:0 14px;height:22px}
  .tree .row span{font:13px/1 var(--sans);color:#CCCCCC;white-space:nowrap}
  .strips{display:grid;grid-template-columns:repeat(4,270px);gap:16px;align-items:start}

  .mono{font:12px/1.5 var(--mono)}
  .dim{color:var(--dim)}
  .num{text-align:right}
  .sw{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:7px;
      vertical-align:baseline}
  .ftable td{text-align:left;padding:8px 14px}
  .ftable td.num{text-align:right}
  tfoot td{border-top:1px solid var(--line);color:var(--dim);font:12px/1.5 var(--mono)}
</style>

${defs}

<div class="wrap">
<header>
  <h1>${esc(TITLE)}</h1>
  <p class="sub">${icons.length} folder concepts, ${icons.length * 2} assets. Every icon is the
  canon tan base <em>verbatim</em> plus one emblem placed by a single uniform transform into the
  R9a box — 8.20 at x&nbsp;5.30–13.50 / y&nbsp;4.60–12.80 closed, 5.80 at x&nbsp;7.26–13.06 /
  y&nbsp;6.75–12.55 open. Emblems are authored in a 0–10 field at the ×1.26 feature floors
  (stem ≥ 2.0 units, counter ≥ 1.2) and obey the R9 tone law: always darker than the tan, a brand
  hue only where the concept earns one.</p>
  <div class="meta">
    <span class="tag">${icons.length} concepts</span>
    <span class="tag">${icons.length * 2} files</span>
    <span class="tag">${totalBytes} bytes</span>
    <span class="tag">avg ${Math.round(totalBytes / (icons.length * 2))} B</span>
    <span class="tag">max ${Math.max(...icons.map(i => i.bytes))} B / pair</span>
    <span class="tag">bg #121314</span>
  </div>
</header>

<section>
  <h2>Size ladder — closed beside open</h2>
  <p class="lede">16&nbsp;px is the primary target and the 22&nbsp;px tree row is the real
  explorer context; 32 and 64 only have to stay clean.</p>
  <table>
    <thead><tr><th>concept</th><th>16</th><th>tree row (22 px)</th><th>32</th><th>64</th></tr></thead>
    <tbody>${LADDER}</tbody>
  </table>
</section>

<section>
  <h2>As a set</h2>
  <p class="lede">The slice as explorer listings, then interleaved with the core folders — the
  listing where two emblems that read alike would show.</p>
  <div class="strips">${SET1}${SET2}${SET3}${MIX}</div>
</section>

<section>
  <h2>Manifest</h2>
  <table class="ftable">
    <thead><tr><th>id</th><th>emblem</th><th>hex</th><th>colour source</th><th class="num">bytes</th></tr></thead>
    <tbody>${TABLE}</tbody>
    <tfoot><tr><td colspan="4">${icons.length} concepts · ${icons.length * 2} files</td>
      <td class="num">${totalBytes}</td></tr></tfoot>
  </table>
</section>
</div>
`;

const out = join(ROOT, 'contact-F03.html');
writeFileSync(out, html, 'utf8');
console.log(`${out}  (${Buffer.byteLength(html)} bytes, ${icons.length} concepts, ${totalBytes} icon bytes)`);

// ---- optional 2x screenshot -------------------------------------------------
const WIDTH = 1240;

function chromium() {
	const cache = join(homedir(), 'Library/Caches/ms-playwright');
	for (const b of readdirSync(cache).filter(d => /^chromium-\d+$/.test(d))
		.sort((a, b) => +b.split('-')[1] - +a.split('-')[1])) {
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
	const probe = join(tmpdir(), `m11-contactF03-probe-${process.pid}.html`);
	writeFileSync(probe, `<!doctype html><body style="margin:0"><pre id="o"></pre>` +
		`<iframe id="f" src="file://${htmlPath}" style="width:${WIDTH}px;height:400px;border:0"></iframe>` +
		`<script>f.onload=()=>{document.getElementById('o').textContent='PAGEHEIGHT='+f.contentDocument.documentElement.scrollHeight}</script>`);
	const dom = execFileSync(bin, [...COMMON, `--window-size=${WIDTH + 200},600`, '--dump-dom', `file://${probe}`],
		{ encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 });
	rmSync(probe, { force: true });
	const m = /PAGEHEIGHT=(\d+)/.exec(dom);
	if (!m) { throw new Error('could not measure the page height'); }
	execFileSync(bin, [...COMMON, '--force-device-scale-factor=2', '--default-background-color=121314ff',
		`--window-size=${WIDTH},${m[1]}`, `--screenshot=${pngPath}`, `file://${htmlPath}`],
		{ stdio: ['ignore', 'ignore', 'ignore'] });
	return { bin, width: WIDTH, height: +m[1] };
}

if (argv.includes('--png')) {
	const png = join(ROOT, 'contact-F03.png');
	const r = shoot(out, png);
	console.log(`${png}  (${r.width}x${r.height} css px at 2x, ${Buffer.byteLength(readFileSync(png))} bytes)`);
	console.log(`  renderer: ${r.bin}`);
}
