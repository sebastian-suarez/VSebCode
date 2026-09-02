// F01-contact.mjs — thin contact-sheet builder for folder slice F01.
// Emits production/contact-F01.html and, with --png, a 2x screenshot beside it.
// Self-contained: every icon is inlined once as a <symbol>, no external request.

import { readFileSync, writeFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { homedir, tmpdir } from 'node:os';
import { EMBLEMS } from './F01-emblems.mjs';

const ROOT = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production';
const FOLDER = join(ROOT, 'svg', 'folder');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// real folder names, straight out of the worklist slice
const SLICE = JSON.parse(readFileSync(join(ROOT, 'longtail-worklist.json'), 'utf8'))
	.slices.find(s => s.id === 'F01');
const NAMES = Object.fromEntries(SLICE.concepts.map(c => [c.id, c.match.folderNames[0]]));

const inner = f => readFileSync(join(FOLDER, f), 'utf8')
	.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
const bytes = f => Buffer.byteLength(readFileSync(join(FOLDER, f)));

const ICONS = Object.entries(EMBLEMS).map(([id, e]) => ({
	id, ...e, name: NAMES[id] || id,
	c: inner(`${id}.svg`), o: inner(`${id}-open.svg`),
	bc: bytes(`${id}.svg`), bo: bytes(`${id}-open.svg`)
}));

// core folders to mix into the strip — the approved 40 plus the canon defaults
const CORE = ['folder', 'folder-open', 'src', 'components', 'test', 'docs', 'config',
	'node', 'docker', 'git', 'assets', 'public', 'utils', 'server'];

const symbols = [
	...ICONS.flatMap(i => [`<symbol id="s-${i.id}" viewBox="0 0 16 16">${i.c}</symbol>`,
		`<symbol id="s-${i.id}-open" viewBox="0 0 16 16">${i.o}</symbol>`]),
	...CORE.map(id => `<symbol id="s-core-${id}" viewBox="0 0 16 16">${inner(`${id}.svg`)}</symbol>`)
].join('\n');

const use = (id, s) => `<svg class="ico" width="${s}" height="${s}" aria-hidden="true"><use href="#s-${id}"/></svg>`;
const pair = (id, s) => `<span class="pr">${use(id, s)}${use(`${id}-open`, s)}</span>`;

const LADDER = ICONS.map(i => `
  <tr>
    <th scope="row"><span class="nm">${esc(i.id)}</span><span class="arch">${esc(i.mark)}</span></th>
    <td>${pair(i.id, 16)}</td>
    <td class="rowcell"><span class="trow">${use(i.id, 16)}<span>${esc(i.name)}</span></span>
      <span class="trow">${use(`${i.id}-open`, 16)}<span>${esc(i.name)}</span></span></td>
    <td>${pair(i.id, 32)}</td>
    <td>${pair(i.id, 64)}</td>
  </tr>`).join('');

// mixed explorer strip: F01 folders interleaved with the core set, sorted like a tree
const MIX = [...ICONS.map(i => ({ id: i.id, name: i.name, core: false })),
	...CORE.filter(id => !id.endsWith('-open') && id !== 'folder')
		.map(id => ({ id: `core-${id}`, name: id, core: true }))]
	.sort((a, b) => a.name.localeCompare(b.name));

const STRIP = n => `<div class="tree">
  <div class="treehead">${n}</div>
  ${MIX.map(m => `<div class="row${m.core ? ' core' : ''}">${use(m.id, 16)}<span>${esc(m.name)}</span></div>`).join('\n  ')}
</div>`;

const totalBytes = ICONS.reduce((a, i) => a + i.bc + i.bo, 0);
const MANIFEST = ICONS.map(i => `
  <tr>
    <td class="mono">${esc(i.id)}</td>
    <td class="mono dim">${esc(i.mark)}</td>
    <td class="mono"><span class="sw" style="background:${i.fill}"></span>${i.fill}</td>
    <td class="mono dim">${esc(i.source)}</td>
    <td class="mono num">${i.bc} / ${i.bo}</td>
  </tr>`).join('');

const html = `<title>M11 folder slice F01</title>
<style>
  :root{--bg:#121314;--bg2:#191A1B;--panel:#1C1E1F;--line:#2A2D2E;--fg:#D7D9DA;--dim:#8A9092;
        --mono:ui-monospace,SFMono-Regular,"SF Mono",Menlo,monospace;
        --sans:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.55 var(--sans);
       -webkit-font-smoothing:antialiased;padding:0 0 96px}
  .wrap{max-width:1180px;margin:0 auto;padding:0 28px}
  header{padding:56px 0 36px;border-bottom:1px solid var(--line);margin-bottom:44px}
  h1{font-size:30px;line-height:1.15;margin:0 0 12px;letter-spacing:-.02em;font-weight:600}
  .sub{color:var(--dim);max-width:78ch;margin:0 0 20px}
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
  tbody th{font-weight:400;padding:9px 14px;white-space:nowrap}
  .nm{font:12px/1 var(--mono);color:var(--fg)}
  .arch{display:block;font:10px/1.6 var(--mono);color:var(--dim);letter-spacing:.04em;max-width:22ch}
  td{padding:9px 8px;text-align:center;vertical-align:middle}
  tbody tr+tr th,tbody tr+tr td{border-top:1px solid var(--line)}
  .ico{display:inline-block;vertical-align:middle}
  .pr{display:inline-flex;gap:10px;align-items:center}
  .rowcell{text-align:left;padding-left:16px}
  .trow{display:inline-flex;align-items:center;gap:7px;height:22px;padding:0 8px;border-radius:4px}
  .trow span{font:13px/1 var(--sans);color:#CCC;white-space:nowrap}
  .tree{border:1px solid var(--line);border-radius:10px;padding:10px 0 14px;background:var(--bg);
        width:300px;column-fill:auto}
  .treehead{font:10px/1 var(--mono);color:var(--dim);letter-spacing:.08em;padding:6px 14px 12px}
  .tree .row{display:flex;align-items:center;gap:7px;padding:0 14px;height:22px}
  .tree .row span{font:13px/1 var(--sans);color:#CCC;white-space:nowrap}
  .tree .row.core span{color:#7E8486}
  .strips{display:flex;gap:20px;align-items:flex-start;flex-wrap:wrap}
  .strips .tree:nth-child(2){background:#1E1E1E}
  .strips .tree:nth-child(3){background:#F3F3F3;border-color:#DDD}
  .strips .tree:nth-child(3) .row span{color:#3B3B3B}
  .strips .tree:nth-child(3) .row.core span{color:#8A8A8A}
  .strips .tree:nth-child(3) .treehead{color:#8A8A8A}
  .mono{font:12px/1.5 var(--mono)}
  .dim{color:var(--dim)}
  .num{text-align:right;white-space:nowrap}
  .ftable td{text-align:left;padding:8px 14px}
  .ftable td.num{text-align:right}
  .sw{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:7px;
      vertical-align:-1px;outline:1px solid #ffffff1a}
  tfoot td{border-top:1px solid var(--line);color:var(--dim);font:12px/1.5 var(--mono)}
</style>

<svg width="0" height="0" aria-hidden="true" style="position:absolute"><defs>
${symbols}
</defs></svg>

<div class="wrap">
<header>
  <h1>M11 long tail — folder slice F01</h1>
  <p class="sub">${ICONS.length} concepts, ${ICONS.length * 2} files. Every icon is the canon tan base
  <em>verbatim</em> plus one emblem placed by a single uniform transform into the R9a box
  (closed 8.20 at x&nbsp;5.30–13.50 / y&nbsp;4.60–12.80; open 5.80 at x&nbsp;7.26–13.06 / y&nbsp;6.75–12.55).
  One flat mark per concept, neutral <code>#4E545B</code> unless a real brand earns its darkened hue;
  every emblem is darker than the tan plate (R9 tone law).</p>
  <div class="meta">
    <span class="tag">${ICONS.length * 2} files</span>
    <span class="tag">${totalBytes} bytes</span>
    <span class="tag">avg ${Math.round(totalBytes / (ICONS.length * 2))} B</span>
    <span class="tag">max ${Math.max(...ICONS.flatMap(i => [i.bc, i.bo]))} B</span>
    <span class="tag">bg #121314</span>
  </div>
</header>

<section>
  <h2>Size ladder — closed + open</h2>
  <p class="lede">Each cell holds the closed icon then its <code>-open</code> twin: the same mark,
  each mapped into its own box. 16&nbsp;px is the primary render, the 22&nbsp;px tree row carries the
  real folder name, 32 and 64 only have to stay clean.</p>
  <table>
    <thead><tr><th>concept</th><th>16</th><th>tree row (22 px)</th><th>32</th><th>64</th></tr></thead>
    <tbody>${LADDER}</tbody>
  </table>
</section>

<section>
  <h2>Mixed strip — F01 against the core folders</h2>
  <p class="lede">One explorer listing, alphabetical, with the core-tier folders (dimmed labels)
  interleaved. What matters here is that no F01 emblem reads as a core emblem, and that the slice
  does not visibly change the weight of the tan.</p>
  <div class="strips">${STRIP('explorer · #121314')}${STRIP('on #1E1E1E')}${STRIP('on #F3F3F3')}</div>
</section>

<section>
  <h2>Manifest</h2>
  <table class="ftable">
    <thead><tr><th>id</th><th>emblem</th><th>hex</th><th>colour source</th><th class="num">bytes c / o</th></tr></thead>
    <tbody>${MANIFEST}</tbody>
    <tfoot><tr><td colspan="4">${ICONS.length} concepts · ${ICONS.length * 2} files</td>
      <td class="num">${totalBytes}</td></tr></tfoot>
  </table>
</section>
</div>
`;

const out = join(ROOT, 'contact-F01.html');
writeFileSync(out, html, 'utf8');
console.log(`${out}  (${Buffer.byteLength(html)} bytes, ${ICONS.length * 2} icons)`);

// ---- 2x screenshot, Playwright chromium -------------------------------------
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

if (process.argv.includes('--png')) {
	const WIDTH = 1240;
	const bin = chromium();
	const COMMON = ['--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
		'--allow-file-access-from-files', '--virtual-time-budget=8000'];
	const probe = join(tmpdir(), `F01-probe-${process.pid}.html`);
	writeFileSync(probe, `<!doctype html><body style="margin:0"><pre id="o"></pre>`
		+ `<iframe id="f" src="file://${out}" style="width:${WIDTH}px;height:400px;border:0"></iframe>`
		+ `<script>f.onload=()=>{document.getElementById('o').textContent='H='+f.contentDocument.documentElement.scrollHeight}</script>`);
	const dom = execFileSync(bin, [...COMMON, `--window-size=${WIDTH + 200},600`, '--dump-dom', `file://${probe}`],
		{ encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
	rmSync(probe, { force: true });
	const height = +/H=(\d+)/.exec(dom)[1];
	const png = join(ROOT, 'contact-F01.png');
	execFileSync(bin, [...COMMON, '--force-device-scale-factor=2', '--default-background-color=121314ff',
		`--window-size=${WIDTH},${height}`, `--screenshot=${png}`, `file://${out}`],
		{ stdio: ['ignore', 'ignore', 'ignore'] });
	console.log(`${png}  (${WIDTH}x${height} css px at 2x, ${Buffer.byteLength(readFileSync(png))} bytes)`);
	console.log(`  renderer: ${bin}`);
}
