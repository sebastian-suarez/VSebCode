// F05-contact.mjs — build production/contact-F05.html and shoot it at 2x.
// Thin local builder, modelled on tools/contact.mjs: every icon is inlined once as an
// SVG <symbol>, so the page carries no external request of any kind.

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { EMBLEMS } from './F05-emblems.mjs';
import { shoot } from './F05-shot.mjs';

const PROD = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production';
const DIR = join(PROD, 'svg', 'folder');
const WORK = JSON.parse(readFileSync(join(PROD, 'longtail-worklist.json'), 'utf8'));
const SLICE = WORK.slices.find(s => s.id === 'F05');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const inner = (f) => readFileSync(join(DIR, f), 'utf8')
	.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
const bytes = (f) => Buffer.byteLength(readFileSync(join(DIR, f)));

// core folders to interleave in the mixed strip (existing set, untouched by this slice)
const CORE = ['folder', 'src', 'config', 'test', 'docs', 'node', 'git', 'package'];

const icons = SLICE.concepts.map(c => {
	const e = EMBLEMS[c.id];
	if (!e) { throw new Error(`no emblem for ${c.id}`); }
	return {
		id: c.id, label: c.label, mark: e.mark, fill: e.fill, source: e.source,
		tree: c.match.folderNames[0] || c.id,
		closed: inner(`${c.id}.svg`), open: inner(`${c.id}-open.svg`),
		bClosed: bytes(`${c.id}.svg`), bOpen: bytes(`${c.id}-open.svg`)
	};
});

const defs = `<svg width="0" height="0" aria-hidden="true" style="position:absolute"><defs>
${icons.map(i => `<symbol id="f-${i.id}" viewBox="0 0 16 16">${i.closed}</symbol>`
	+ `<symbol id="o-${i.id}" viewBox="0 0 16 16">${i.open}</symbol>`).join('\n')}
${CORE.map(id => `<symbol id="c-${id}" viewBox="0 0 16 16">${inner(`${id}.svg`)}</symbol>`).join('\n')}
</defs></svg>`;

const use = (p, id, s, alt = '') =>
	`<svg class="ico" width="${s}" height="${s}" role="img" aria-label="${esc(alt)}"><use href="#${p}-${id}"/></svg>`;

const LADDER = icons.map(i => `
  <tr>
    <th scope="row"><span class="nm">${esc(i.id)}</span><span class="sub">${esc(i.mark)}</span></th>
    <td>${use('f', i.id, 16, i.id)}</td>
    <td class="grp">${use('o', i.id, 16, i.id + ' open')}</td>
    <td class="rowcell"><span class="trow">${use('f', i.id, 16)}<span>${esc(i.tree)}</span></span></td>
    <td class="rowcell grp"><span class="trow open"><span class="tw">${use('o', i.id, 16)}</span><span>${esc(i.tree)}</span></span></td>
    <td class="grp">${use('f', i.id, 32)}</td>
    <td>${use('o', i.id, 32)}</td>
    <td class="grp">${use('f', i.id, 64)}</td>
    <td>${use('o', i.id, 64)}</td>
  </tr>`).join('');

// mixed strip: slice icons interleaved with the core folders, 16 px tree rows
const MIXROWS = icons.flatMap((i, n) => [
	`<div class="row"><span class="tw">${use('f', i.id, 16)}</span><span>${esc(i.tree)}</span></div>`,
	n % 2 === 0 ? `<div class="row core"><span class="tw">${use('c', CORE[(n / 2) % CORE.length], 16)}</span>`
		+ `<span>${esc(CORE[(n / 2) % CORE.length])}</span></div>` : ''
]).filter(Boolean);
const PER = Math.ceil(MIXROWS.length / 3);
const MIX = [0, 1, 2].map(k =>
	`<div class="strip">${MIXROWS.slice(k * PER, (k + 1) * PER).join('\n  ')}</div>`).join('\n');

const totalBytes = icons.reduce((a, i) => a + i.bClosed + i.bOpen, 0);
const maxBytes = Math.max(...icons.flatMap(i => [i.bClosed, i.bOpen]));

const TABLE = icons.map(i => `
  <tr>
    <td class="mono">${esc(i.id)}</td>
    <td class="mono dim">${esc(i.mark)}</td>
    <td class="mono"><span class="sw" style="background:${i.fill}"></span>${i.fill}</td>
    <td class="mono dim">${esc(i.source)}</td>
    <td class="mono num">${i.bClosed} / ${i.bOpen}</td>
  </tr>`).join('');

const html = `<title>M11 folder slice F05</title>
<style>
  :root{--bg:#121314;--bg2:#191A1B;--panel:#1C1E1F;--line:#2A2D2E;--fg:#D7D9DA;--dim:#8A9092;
    --mono:ui-monospace,SFMono-Regular,"SF Mono",Menlo,monospace;
    --sans:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.55 var(--sans);
       -webkit-font-smoothing:antialiased;padding:0 0 96px}
  .wrap{max-width:1180px;margin:0 auto;padding:0 28px}
  header{padding:52px 0 32px;border-bottom:1px solid var(--line);margin-bottom:40px}
  h1{font-size:28px;line-height:1.15;margin:0 0 12px;letter-spacing:-.02em;font-weight:600}
  .lede{color:var(--dim);max-width:80ch;margin:0 0 18px}
  .meta{display:flex;flex-wrap:wrap;gap:8px}
  .tag{font:11px/1 var(--mono);color:var(--dim);border:1px solid var(--line);
       border-radius:999px;padding:6px 10px;background:var(--bg2)}
  h2{font-size:12px;letter-spacing:.13em;text-transform:uppercase;color:var(--dim);
     font-weight:600;margin:48px 0 6px}
  h2:first-of-type{margin-top:0}
  p.note{color:var(--dim);margin:0 0 20px;max-width:82ch}
  table{border-collapse:collapse;width:100%;background:var(--panel);
        border:1px solid var(--line);border-radius:10px;overflow:hidden}
  thead th{font:11px/1.4 var(--mono);text-transform:uppercase;letter-spacing:.08em;color:var(--dim);
           text-align:center;padding:11px 8px;border-bottom:1px solid var(--line);font-weight:500}
  thead th:first-child,tbody th{text-align:left}
  tbody th{font-weight:400;padding:9px 14px;white-space:nowrap}
  .nm{font:12px/1.35 var(--mono);color:var(--fg);display:block}
  .sub{display:block;font:10px/1.5 var(--sans);color:var(--dim)}
  td{padding:8px;text-align:center;vertical-align:middle}
  tbody tr+tr th,tbody tr+tr td{border-top:1px solid var(--line)}
  .grp{border-left:1px solid var(--line)}
  .ico{display:inline-block;vertical-align:middle}
  .rowcell{text-align:left;padding-left:14px}
  .trow{display:inline-flex;align-items:center;gap:6px;height:22px;padding:0 6px;border-radius:4px}
  .trow span{font:13px/1 var(--sans);color:#CCC;white-space:nowrap}
  .trow.open span{color:#E4E4E4}
  .tw{display:inline-flex;width:16px}
  .strip{border:1px solid var(--line);border-radius:10px;padding:10px 0 12px;background:var(--bg);
         max-width:300px;column-count:1}
  .strips{display:grid;grid-template-columns:repeat(3,300px);gap:18px;align-items:start}
  .strip .row{display:flex;align-items:center;gap:6px;padding:0 14px;height:22px}
  .strip .row span:last-child{font:13px/1 var(--sans);color:#CCC;white-space:nowrap}
  .strip .row.core span:last-child{color:#8A9092}
  .mono{font:12px/1.5 var(--mono)}
  .dim{color:var(--dim)}
  .num{text-align:right;white-space:nowrap}
  .ftable td{text-align:left;padding:8px 14px}
  .ftable td.num{text-align:right}
  .sw{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:7px;
      vertical-align:baseline;border:1px solid rgba(255,255,255,.16)}
  tfoot td{border-top:1px solid var(--line);color:var(--dim);font:12px/1.5 var(--mono)}
</style>
${defs}
<div class="wrap">
<header>
  <h1>M11 long-tail — folder slice F05</h1>
  <p class="lede">${icons.length} concepts, ${icons.length * 2} files. Canon tan base verbatim
  (<code>folder.svg</code> / <code>folder-open.svg</code> byte-for-byte) plus one flat emblem,
  authored in a 0–10 field and placed by a single uniform scale + translate into the R9a boxes:
  closed 8.20 at x&nbsp;5.30–13.50 / y&nbsp;4.60–12.80, open 5.80 at x&nbsp;7.26–13.06 /
  y&nbsp;6.75–12.55. Every emblem is darker than the tan plate; a brand hue only where the
  concept's own file icon already earned one.</p>
  <div class="meta">
    <span class="tag">${icons.length * 2} files</span>
    <span class="tag">${totalBytes} bytes total</span>
    <span class="tag">avg ${Math.round(totalBytes / (icons.length * 2))} B</span>
    <span class="tag">max ${maxBytes} B</span>
    <span class="tag">0 spill at 256 px</span>
    <span class="tag">bg #121314</span>
  </div>
</header>

<h2>Ladder — closed / open at 16, 22 px tree row, 32, 64</h2>
<p class="note">The 22 px row is the real explorer context: a 16 px icon on a 22 px row with the
folder name it matches.</p>
<table>
  <thead><tr><th>concept</th><th>16</th><th class="grp">16 open</th><th>tree row</th>
    <th class="grp">tree row open</th><th class="grp">32</th><th>32 open</th>
    <th class="grp">64</th><th>64 open</th></tr></thead>
  <tbody>${LADDER}</tbody>
</table>

<h2>Mixed strip — slice against the core folders</h2>
<p class="note">Slice emblems interleaved with existing core folders (dimmed labels) so the
weight, the emblem scale and the tone law can be judged in one column.</p>
<div class="strips">${MIX}</div>

<h2>Manifest</h2>
<table class="ftable">
  <thead><tr><th>id</th><th>emblem</th><th>hex</th><th>colour source</th><th class="num">bytes c/o</th></tr></thead>
  <tbody>${TABLE}</tbody>
  <tfoot><tr><td colspan="4">${icons.length} concepts · ${icons.length * 2} files · canon base verbatim</td>
    <td class="num">${totalBytes} B</td></tr></tfoot>
</table>
</div>`;

const out = join(PROD, 'contact-F05.html');
writeFileSync(out, html);
const png = join(PROD, 'contact-F05.png');
const r = shoot(out, png, 1240);
console.log(`${out}  (${Buffer.byteLength(html)} bytes)`);
console.log(`${png}  (${r.width}x${r.height} css px at 2x, ${Buffer.byteLength(readFileSync(png))} bytes)`);
console.log(`  renderer: ${r.bin}`);
