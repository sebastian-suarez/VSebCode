// F02-contact.mjs — contact sheet for folder slice F02 (thin local builder,
// modelled on tools/contact.mjs: every icon inlined once as a <symbol>).

import { readFileSync, writeFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { homedir, tmpdir } from 'node:os';
import { EMBLEMS } from './F02-emblems.mjs';

const ROOT = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production';
const FOLDER = join(ROOT, 'svg', 'folder');
const OUT_HTML = join(ROOT, 'contact-F02.html');
const OUT_PNG = join(ROOT, 'contact-F02.png');
const TITLE = 'M11 folder slice F02';

const slice = JSON.parse(readFileSync(join(ROOT, 'longtail-worklist.json'), 'utf8'))
	.slices.find(s => s.id === 'F02');
const NAME = Object.fromEntries(slice.concepts.map(c => [c.id, c.match.folderNames[0]]));
const LABEL = Object.fromEntries(slice.concepts.map(c => [c.id, c.label]));

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inner = (f) => readFileSync(join(FOLDER, f), 'utf8')
	.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');

const ids = Object.keys(EMBLEMS).sort();
const icons = ids.map(id => {
	const c = `${id}.svg`, o = `${id}-open.svg`;
	return {
		id, ...EMBLEMS[id],
		name: NAME[id] || id, label: LABEL[id] || id,
		closed: inner(c), open: inner(o),
		bytes: Buffer.byteLength(readFileSync(join(FOLDER, c))) +
			Buffer.byteLength(readFileSync(join(FOLDER, o)))
	};
});

// core folders to sit F02 beside in the mixed strip
const CORE = ['src', 'test', 'docs', 'config', 'node', 'docker', 'db', 'package'];
const core = CORE.filter(id => existsSync(join(FOLDER, `${id}.svg`)))
	.map(id => ({ id, closed: inner(`${id}.svg`), open: inner(`${id}-open.svg`) }));

const defs = `<svg width="0" height="0" aria-hidden="true" style="position:absolute"><defs>
${icons.map(i => `<symbol id="c-${i.id}" viewBox="0 0 16 16">${i.closed}</symbol>` +
	`<symbol id="o-${i.id}" viewBox="0 0 16 16">${i.open}</symbol>`).join('\n')}
${core.map(i => `<symbol id="k-${i.id}" viewBox="0 0 16 16">${i.closed}</symbol>` +
	`<symbol id="ko-${i.id}" viewBox="0 0 16 16">${i.open}</symbol>`).join('\n')}
</defs></svg>`;

const use = (pfx, id, s, alt = '') =>
	`<svg class="ico" width="${s}" height="${s}" role="img" aria-label="${esc(alt)}"><use href="#${pfx}-${id}"/></svg>`;

const LADDER = icons.map(i => `
  <tr>
    <th scope="row"><span class="nm">${esc(i.id)}</span><span class="arch">${esc(i.label)}</span></th>
    <td>${use('c', i.id, 16)}<span class="pair">${use('o', i.id, 16)}</span></td>
    <td class="rowcell"><span class="trow">${use('c', i.id, 16)}<span>${esc(i.name)}</span></span>
        <span class="trow">${use('o', i.id, 16)}<span>${esc(i.name)}</span></span></td>
    <td>${use('c', i.id, 32)}<span class="pair">${use('o', i.id, 32)}</span></td>
    <td>${use('c', i.id, 64)}<span class="pair">${use('o', i.id, 64)}</span></td>
    <td class="sw"><span class="chip" style="background:${i.fill}"></span><span class="hex">${i.fill}</span></td>
  </tr>`).join('');

const treeRows = (pfx, list) => list.map(i =>
	`<div class="row">${use(pfx, i.id, 16)}<span>${esc(i.name || i.id)}</span></div>`).join('\n  ');

const MIXED = `<div class="tree">
  <div class="treehead">F02 among the core folders · 22px rows</div>
  ${treeRows('k', core.slice(0, 4))}
  ${treeRows('c', icons.filter(i => ['console', 'container', 'core', 'debug', 'delta'].includes(i.id)))}
  ${treeRows('k', core.slice(4))}
  ${treeRows('c', icons.filter(i => ['electron', 'environment', 'error', 'event', 'filter'].includes(i.id)))}
</div>`;

const STRIP_C = `<div class="tree"><div class="treehead">closed · every F02 concept</div>
  ${treeRows('c', icons)}</div>`;
const STRIP_O = `<div class="tree"><div class="treehead">open · every F02 concept</div>
  ${treeRows('o', icons)}</div>`;

const totalBytes = icons.reduce((a, i) => a + i.bytes, 0);
const TABLE = icons.map(i => `
  <tr>
    <td class="mono">${esc(i.id)}</td>
    <td class="dim">${esc(i.desc)}</td>
    <td class="mono"><span class="chip sm" style="background:${i.fill}"></span>${i.fill}</td>
    <td class="mono dim">${esc(i.source)}</td>
    <td class="mono num">${i.bytes}</td>
  </tr>`).join('');

const html = `<title>${esc(TITLE)}</title>
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
  .sub{color:var(--dim);max-width:74ch;margin:0 0 20px}
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
  .arch{display:block;font:10px/1.6 var(--mono);color:var(--dim);letter-spacing:.06em}
  td{padding:9px 8px;text-align:center;vertical-align:middle}
  tbody tr+tr th,tbody tr+tr td{border-top:1px solid var(--line)}
  .ico{display:inline-block;vertical-align:middle}
  .pair{margin-left:10px;padding-left:10px;border-left:1px solid var(--line)}
  .rowcell{text-align:left;padding-left:16px;white-space:nowrap}
  .trow{display:inline-flex;align-items:center;gap:7px;height:22px;padding:0 8px;border-radius:4px}
  .trow+.trow{margin-left:6px}
  .trow span{font:13px/1 var(--sans);color:#CCC;white-space:nowrap}
  .sw{white-space:nowrap}
  .chip{display:inline-block;width:14px;height:14px;border-radius:3px;vertical-align:-3px;
        border:1px solid rgba(255,255,255,.14)}
  .chip.sm{width:10px;height:10px;margin-right:6px;vertical-align:-1px}
  .hex{font:11px/1 var(--mono);color:var(--dim);margin-left:7px}
  .tree{border:1px solid var(--line);border-radius:10px;padding:10px 0 14px;background:var(--bg);
        min-width:250px}
  .treehead{font:10px/1 var(--mono);color:var(--dim);letter-spacing:.08em;padding:6px 14px 12px}
  .tree .row{display:flex;align-items:center;gap:7px;padding:0 14px;height:22px}
  .tree .row span{font:13px/1 var(--sans);color:#CCC;white-space:nowrap}
  .strips{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;align-items:start}
  .mono{font:12px/1.5 var(--mono)}
  .dim{color:var(--dim)}
  .num{text-align:right}
  .ftable td{text-align:left;padding:8px 14px;font-size:12px}
  .ftable td.num{text-align:right}
  tfoot td{border-top:1px solid var(--line);color:var(--dim);font:12px/1.5 var(--mono)}
</style>

${defs}

<div class="wrap">
<header>
  <h1>${esc(TITLE)} — 45 concepts, closed + open</h1>
  <p class="sub">Canon tan base verbatim, one flat emblem each, mapped into the R9a boxes by a single
  uniform transform (closed 8.20 at 5.30–13.50 / 4.60–12.80; open 5.80 at 7.26–13.06 / 6.75–12.55).
  Emblems are darker than the tan; a brand hue only where the concept earns one. Feature floors
  hold at the R9a ×1.26 scale: stems ≥ 1.64 px, counters ≥ 0.98 px.</p>
  <div class="meta">
    <span class="tag">${icons.length} concepts</span>
    <span class="tag">${icons.length * 2} files</span>
    <span class="tag">${totalBytes} bytes</span>
    <span class="tag">avg ${Math.round(totalBytes / (icons.length * 2))} B</span>
    <span class="tag">bg #121314</span>
  </div>
</header>

<section>
  <h2>Size ladder — closed | open</h2>
  <p class="lede">16 px is the primary render, the 22 px tree row is the real context, 32 and 64 only
  have to stay clean.</p>
  <table>
    <thead><tr><th>concept</th><th>16</th><th>tree row (22 px)</th><th>32</th><th>64</th><th>emblem</th></tr></thead>
    <tbody>${LADDER}</tbody>
  </table>
</section>

<section>
  <h2>As a set</h2>
  <p class="lede">The whole slice as an explorer listing, and mixed in among the core folders.</p>
  <div class="strips">${STRIP_C}${STRIP_O}${MIXED}</div>
</section>

<section>
  <h2>Manifest</h2>
  <table class="ftable">
    <thead><tr><th>id</th><th>emblem</th><th>hex</th><th>colour source</th><th class="num">bytes (pair)</th></tr></thead>
    <tbody>${TABLE}</tbody>
    <tfoot><tr><td colspan="4">${icons.length} concepts · ${icons.length * 2} files</td><td class="num">${totalBytes}</td></tr></tfoot>
  </table>
</section>
</div>
`;

writeFileSync(OUT_HTML, html, 'utf8');
console.log(`${OUT_HTML}  (${Buffer.byteLength(html)} bytes)`);

// ---- 2x screenshot ----------------------------------------------------------
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
	const WIDTH = 1240, bin = chromium();
	const COMMON = ['--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
		'--allow-file-access-from-files', '--virtual-time-budget=8000'];
	const probe = join(tmpdir(), `F02-probe-${process.pid}.html`);
	writeFileSync(probe, `<!doctype html><body style="margin:0"><pre id="o"></pre>` +
		`<iframe id="f" src="file://${OUT_HTML}" style="width:${WIDTH}px;height:400px;border:0"></iframe>` +
		`<script>f.onload=()=>{document.getElementById('o').textContent='H='+f.contentDocument.documentElement.scrollHeight}</script>`);
	const dom = execFileSync(bin, [...COMMON, `--window-size=${WIDTH + 200},600`, '--dump-dom', `file://${probe}`],
		{ encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 });
	rmSync(probe, { force: true });
	const h = /H=(\d+)/.exec(dom);
	if (!h) { throw new Error('could not measure the page height'); }
	execFileSync(bin, [...COMMON, '--force-device-scale-factor=2', '--default-background-color=121314ff',
		`--window-size=${WIDTH},${h[1]}`, `--screenshot=${OUT_PNG}`, `file://${OUT_HTML}`],
		{ stdio: ['ignore', 'ignore', 'ignore'] });
	console.log(`${OUT_PNG}  (${WIDTH}x${h[1]} css px at 2x, ${readFileSync(OUT_PNG).length} bytes)`);
	console.log(`  renderer: ${bin}`);
}
