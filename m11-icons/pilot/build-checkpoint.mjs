// Assembles checkpoint.html — a fully self-contained (base64-inlined) style checkpoint sheet.
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));
const b64 = (p) => readFileSync(p).toString('base64');
const png = (n) => `data:image/png;base64,${b64(join(DIR, 'web', `icon-${n}.png`))}`;
const jpg = (n) => `data:image/jpeg;base64,${b64(join(DIR, 'web', `${n}.jpg`))}`;
const svgUri = (n) =>
  `data:image/svg+xml;base64,${b64(join(DIR, 'svg', `icon-${n}.svg`))}`;
const bytes = (p) => statSync(join(DIR, p)).size;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// concept, label shown in the fake explorer, archetype, 16px verdict
const ICONS = [
  ['typescript',  'index.ts',      'BADGE',      'good',    'TS reads cleanly; badge edge crisp.'],
  ['javascript',  'app.js',        'BADGE',      'good',    'JS reads; dark-on-yellow holds up.'],
  ['json',        'package.json',  'GLYPH',      'marginal','Braces thin and low-contrast; reads as a pair, not as "JSON".'],
  ['markdown',    'README.md',     'GLYPH',      'good',    'M + arrow both survive.'],
  ['css',         'styles.css',    'SILHOUETTE', 'marginal','Shield reads, the "3" muddies into the fold shading.'],
  ['html',        'index.html',    'SILHOUETTE', 'good',    '"5" holds better than CSS "3".'],
  ['python',      'build.py',      'GLYPH',      'good',    'Two-snake mark stays recognisable as a blue/yellow interlock.'],
  ['rust',        'main.rs',       'GLYPH',      'fail',    'Gear teeth and R dissolve into a tan blob. Unusable.'],
  ['go',          'server.go',     'BADGE',      'good',    'GO reads cleanly.'],
  ['docker',      'Dockerfile',    'SILHOUETTE', 'marginal','Whale silhouette survives; container blocks blur into a bar.'],
  ['git',         '.gitignore',    'GLYPH',      'marginal','Diamond reads; the branch mark inside is mush.'],
  ['dotenv',      '.env',          'BADGE',      'marginal','Three lowercase letters bleed together.'],
  ['yaml',        'config.yml',    'BADGE',      'marginal','YML legible but crowded; three caps is the ceiling.'],
  ['folder',      'src',           'SILHOUETTE', 'good',    'Cleanest of the set.'],
  ['folder-open', 'components',    'SILHOUETTE', 'marginal','Reads, but barely distinguishable from the closed folder.'],
  ['file',        'LICENSE',       'SILHOUETTE', 'good',    'Folded corner survives.'],
];

const PROMPT = readFileSync(join(DIR, 'master-prompt.txt'), 'utf8');

// M10 symbol defs, copied verbatim from m10-nvim-prototype.html lines 314-319.
const M10_DEFS = `
<svg width="0" height="0" aria-hidden="true" style="position:absolute"><defs>
<symbol id="i-folder" viewBox="0 0 16 16"><path fill="#BF9354" d="M1.5 4.1c0-.66.54-1.2 1.2-1.2h3.12c.34 0 .66.14.89.39l.95 1.01h5.64c.66 0 1.2.54 1.2 1.2v6.4c0 .66-.54 1.2-1.2 1.2H2.7c-.66 0-1.2-.54-1.2-1.2z"/><path fill="rgba(0,0,0,.14)" d="M1.5 5.55h13v.85h-13z"/></symbol>
<symbol id="i-foldero" viewBox="0 0 16 16"><path fill="#8F6D37" d="M1.5 4.1c0-.66.54-1.2 1.2-1.2h3.12c.34 0 .66.14.89.39l.95 1.01h4.94c.66 0 1.2.54 1.2 1.2v1h-12z"/><path fill="#C09553" d="M2.42 6.5h11.62c.78 0 1.35.73 1.17 1.49l-.98 3.9c-.13.54-.61.91-1.17.91H2.7c-.66 0-1.2-.54-1.2-1.2V7.7c0-.66.42-1.2.92-1.2z"/></symbol>
<symbol id="i-ts" viewBox="0 0 16 16"><rect x="1" y="1" width="14" height="14" rx="3" fill="#3178C6"/><text x="8" y="11.4" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-size="7.4" font-weight="700" fill="#FFFFFF">TS</text></symbol>
<symbol id="i-css" viewBox="0 0 16 16"><path fill="#1572B6" d="M2.6 1.5h10.8l-.98 11L8 14.5l-4.42-2z"/><text x="8" y="10.6" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-size="7.2" font-weight="700" fill="#FFFFFF">3</text></symbol>
<symbol id="i-md" viewBox="0 0 16 16"><rect x="0.75" y="3.75" width="14.5" height="8.5" rx="1.6" fill="none" stroke="#519ABA" stroke-width="1.3"/><path fill="#519ABA" d="M2.9 10.4V5.9h1.35L5.6 7.6l1.35-1.7H8.3v4.5H6.95V7.9L5.6 9.6 4.25 7.9v2.5z"/><path fill="#519ABA" d="M10.55 5.9h1.5v2.3h1.35L11.3 10.7 9.2 8.2h1.35z"/></symbol>
<symbol id="i-npm" viewBox="0 0 16 16"><rect x="1.5" y="1.5" width="13" height="13" rx="2" fill="#CB3837"/><text x="8" y="10.4" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-size="5" font-weight="700" fill="#FFFFFF">npm</text></symbol>
</defs></svg>`;

// [M10 symbol id, pilot concept | null, label]
const PAIRS = [
  ['i-ts',      'typescript',  'TypeScript'],
  ['i-css',     'css',         'CSS'],
  ['i-md',      'markdown',    'Markdown'],
  ['i-folder',  'folder',      'Folder, closed'],
  ['i-foldero', 'folder-open', 'Folder, open'],
  ['i-npm',     null,          'npm'],
];

const abSizes = [16, 32, 64];
const abRows = PAIRS.map(([sym, concept, label]) => `
  <tr>
    <th scope="row"><span class="nm">${esc(label)}</span>${concept ? '' : '<span class="arch">no pilot twin</span>'}</th>
    ${abSizes.map((s) => `<td><svg width="${s}" height="${s}" role="img" aria-label="${esc(label)}, M10, ${s}px"><use href="#${sym}"/></svg></td>`).join('')}
    ${abSizes.map((s, i) => `<td${i === 0 ? ' class="grp"' : ''}>${
      concept
        ? `<img src="${png(concept)}" width="${s}" height="${s}" alt="${concept} pilot at ${s}px">`
        : '<span class="dash">&mdash;</span>'
    }</td>`).join('')}
  </tr>`).join('');

const PIPELINE = [
  ['1. Generate', 'agy -p … --dangerously-skip-permissions', 'worked',
   'One 4x4 sheet per call, 35 s and 42 s for the two runs. All 16 cells present, in the requested order, on the first try — no retries for content.'],
  ['2. Resolution', 'requested 2048², got 1024²', 'partial',
   'Two runs, both returned 1024². The agent reported 1024² as "native output resolution returned by the model". Cells are therefore 256², not 512².'],
  ['3. Slice', 'magick -crop 4x4@', 'worked',
   'Grid is geometrically regular; a blind 4x4 division landed every icon inside its cell with margin to spare. Zero manual nudging.'],
  ['4. Key', 'fuzz 14% + 4-corner floodfill', 'worked',
   'Sheet background was a true #FFFFFF. Floodfill (not global -transparent) was required so white letters *inside* badges survive.'],
  ['5. Flatness', 'measured %k unique colours', 'failed',
   'The "flat, no gradients" instruction was not obeyed at pixel level: the TS badge holds 12,255 unique colours, CSS 24,735. Output is quietly photographic.'],
  ['6. Vectorize', 'vtracer 0.6.5, spline', 'partial',
   'Raw trace = 207 paths / 108 KB for one badge. Posterising to 5 colours first drops that to 14 paths / 29 KB — usable, still ~20× a hand-authored icon.'],
];

const VERDICT_COLOR = { good: '#4EC9B0', marginal: '#DCB67A', fail: '#E06C5A' };
const VERDICT_LABEL = { good: 'survives', marginal: 'marginal', fail: 'mush' };

const sizes = [16, 22, 32, 64];

const ladderRows = ICONS.map(([n, , arch, v, note]) => `
  <tr>
    <th scope="row">
      <span class="nm">${n}</span>
      <span class="arch">${arch}</span>
    </th>
    ${sizes.map((s) => `<td><img src="${png(n)}" width="${s}" height="${s}" alt="${n} at ${s}px"></td>`).join('')}
    <td class="vcell"><span class="pill" style="--c:${VERDICT_COLOR[v]}">${VERDICT_LABEL[v]}</span></td>
    <td class="note">${esc(note)}</td>
  </tr>`).join('');

const treeRows = (bg) => `
<div class="tree" style="background:${bg}">
  <div class="treehead">${bg}</div>
  ${ICONS.map(([n, label]) => `
  <div class="row"><img src="${png(n)}" width="22" height="22" alt=""><span>${esc(label)}</span></div>`).join('')}
</div>`;

const compareRows = ICONS.map(([n]) => `
  <div class="cmp">
    <div class="cmpimgs">
      <div><img src="${png(n)}" width="64" height="64" alt=""><b>raster</b></div>
      <div><img src="${svgUri(n)}" width="64" height="64" alt=""><b>traced</b></div>
    </div>
    <div class="cmpmeta">
      <span class="nm">${n}</span>
      <span class="sz">${(bytes(`svg/icon-${n}.svg`) / 1024).toFixed(0)} KB svg</span>
    </div>
  </div>`).join('');

const html = `<title>M11 Icon Pilot</title>
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
  img{image-rendering:auto}
  .wrap{max-width:1080px;margin:0 auto;padding:0 28px}
  header{padding:64px 0 40px;border-bottom:1px solid var(--line);margin-bottom:48px}
  h1{font-size:30px;line-height:1.15;margin:0 0 12px;letter-spacing:-.02em;font-weight:600}
  .sub{color:var(--dim);max-width:68ch;margin:0 0 20px}
  .meta{display:flex;flex-wrap:wrap;gap:8px}
  .tag{font:11px/1 var(--mono);color:var(--dim);border:1px solid var(--line);
       border-radius:999px;padding:6px 10px;background:var(--bg2)}
  h2{font-size:12px;letter-spacing:.13em;text-transform:uppercase;color:var(--dim);
     font-weight:600;margin:56px 0 6px}
  h2:first-of-type{margin-top:0}
  .lede{color:var(--dim);margin:0 0 22px;max-width:74ch}
  section{scroll-margin-top:24px}

  table{border-collapse:collapse;width:100%;background:var(--panel);
        border:1px solid var(--line);border-radius:10px;overflow:hidden}
  caption{caption-side:top;text-align:left;color:var(--dim);font:12px/1.6 var(--mono);padding:0 0 10px}
  thead th{font:11px/1 var(--mono);text-transform:uppercase;letter-spacing:.08em;color:var(--dim);
           text-align:center;padding:12px 8px;border-bottom:1px solid var(--line);font-weight:500}
  thead th:first-child,tbody th{text-align:left}
  tbody th{font-weight:400;padding:10px 14px;white-space:nowrap}
  .nm{font:12px/1 var(--mono);color:var(--fg)}
  .arch{display:block;font:10px/1.6 var(--mono);color:var(--dim);letter-spacing:.06em}
  td{padding:10px 8px;text-align:center;vertical-align:middle}
  tbody tr+tr th,tbody tr+tr td{border-top:1px solid var(--line)}
  .vcell{white-space:nowrap}
  .grp{border-left:1px solid var(--line)}
  .dash{color:var(--dim);font:14px/1 var(--mono)}
  .grphead th{padding-bottom:6px}
  .grphead .lbl{font:10px/1 var(--mono);letter-spacing:.1em;color:var(--fg)}
  .grphead .lbl.dimmed{color:var(--dim)}
  .pill{font:10px/1 var(--mono);color:var(--c);border:1px solid color-mix(in srgb,var(--c) 40%,transparent);
        background:color-mix(in srgb,var(--c) 12%,transparent);border-radius:999px;padding:5px 9px;display:inline-block}
  .note{text-align:left;color:var(--dim);font-size:12.5px;line-height:1.5;max-width:34ch;padding-right:14px}

  .strips{display:grid;grid-template-columns:1fr 1fr;gap:20px}
  .tree{border:1px solid var(--line);border-radius:10px;padding:10px 0 14px;overflow:hidden}
  .treehead{font:10px/1 var(--mono);color:var(--dim);letter-spacing:.08em;padding:6px 14px 12px}
  .row{display:flex;align-items:center;gap:8px;padding:3px 14px;height:24px}
  .row span{font:13px/1 var(--sans);color:#CCCCCC;white-space:nowrap}
  .row:hover{background:#04395E33}

  .cmpgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
  .cmp{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:14px}
  .cmpimgs{display:flex;gap:10px;justify-content:center;margin-bottom:10px}
  .cmpimgs div{display:flex;flex-direction:column;align-items:center;gap:6px}
  .cmpimgs b{font:9px/1 var(--mono);color:var(--dim);font-weight:400;letter-spacing:.06em}
  .cmpmeta{display:flex;justify-content:space-between;align-items:baseline;gap:8px;
           border-top:1px solid var(--line);padding-top:9px}
  .sz{font:10px/1 var(--mono);color:var(--dim)}

  figure{margin:0;background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:16px}
  figure img{display:block;width:100%;height:auto;border-radius:6px}
  figcaption{font:11px/1.6 var(--mono);color:var(--dim);padding-top:12px}
  .two{display:grid;grid-template-columns:1fr 1fr;gap:20px}

  pre{background:var(--panel);border:1px solid var(--line);border-radius:10px;
      padding:20px;overflow-x:auto;font:12px/1.7 var(--mono);color:#B7BDC0;white-space:pre-wrap}
  code{font-family:var(--mono)}
  .cmdline{background:var(--panel);border:1px solid var(--line);border-left:2px solid var(--acc);
           border-radius:8px;padding:16px 18px;font:12px/1.75 var(--mono);color:#B7BDC0;
           overflow-x:auto;white-space:pre-wrap;word-break:break-word}

  .steps{border-collapse:collapse;width:100%;background:var(--panel);
         border:1px solid var(--line);border-radius:10px;overflow:hidden}
  .steps td,.steps th{text-align:left;padding:12px 14px;vertical-align:top}
  .steps tr+tr td{border-top:1px solid var(--line)}
  .steps .st{font:12px/1.5 var(--mono);white-space:nowrap;color:var(--fg)}
  .steps .tool{font:11px/1.5 var(--mono);color:var(--dim);white-space:nowrap}
  .steps .txt{color:var(--dim);font-size:12.5px;line-height:1.55}
  .ok{color:#4EC9B0}.pt{color:#DCB67A}.no{color:#E06C5A}

  @media (max-width:820px){
    .strips,.two{grid-template-columns:1fr}
    .cmpgrid{grid-template-columns:repeat(2,1fr)}
    .note{display:none}
  }
</style>

<div class="wrap">
<header>
  <h1>M11 icon pilot — style checkpoint</h1>
  <p class="sub">Sixteen file-type icons generated as one 4&times;4 sheet by Nano Banana Pro through the
  <code>agy</code> CLI, then sliced, alpha-keyed and vectorised locally. This page is the style gate:
  the question is not "are these nice at 64&nbsp;px" (they are) but "do they hold at 16&nbsp;px in a
  real explorer tree".</p>
  <div class="meta">
    <span class="tag">1 sheet = 16 icons</span>
    <span class="tag">1024&times;1024 native</span>
    <span class="tag">35–42 s per sheet</span>
    <span class="tag">vtracer 0.6.5</span>
    <span class="tag">ImageMagick 7.1.2</span>
  </div>
</header>

<section>
  <h2>1 — M10 approved vs pilot</h2>
  <p class="lede">The five concepts that exist in both sets, side by side on the editor background.
  Left column is the M10 mockup you already approved — hand-authored inline SVG, copied verbatim from
  <code>m10-nvim-prototype.html</code>. Right column is the pilot's generated-and-keyed raster. Same hexes
  went into the prompt, so any difference here is <em>execution</em>, not palette.</p>
  ${M10_DEFS}
  <table>
    <caption>npm has no pilot twin — it was not one of the 16 cells in the master prompt.</caption>
    <thead>
      <tr class="grphead">
        <th></th>
        <th colspan="3"><span class="lbl">M10 — APPROVED</span></th>
        <th colspan="3" class="grp"><span class="lbl dimmed">PILOT — GENERATED</span></th>
      </tr>
      <tr>
        <th>concept</th>
        ${abSizes.map((s) => `<th>${s}px</th>`).join('')}
        ${abSizes.map((s, i) => `<th${i === 0 ? ' class="grp"' : ''}>${s}px</th>`).join('')}
      </tr>
    </thead>
    <tbody>${abRows}</tbody>
  </table>
</section>

<section>
  <h2>2 — Size ladder</h2>
  <p class="lede">Each icon at 16, 22, 32 and 64&nbsp;px on the editor background (#121314). The verdict
  column is the 16&nbsp;px judgement only.</p>
  <table>
    <caption>16 px is the explorer default; 22 px is the row height used in section 3.</caption>
    <thead><tr><th>icon</th>${sizes.map((s) => `<th>${s}px</th>`).join('')}<th>16px</th><th>notes</th></tr></thead>
    <tbody>${ladderRows}</tbody>
  </table>
</section>

<section>
  <h2>3 — Explorer tree, 22 px rows</h2>
  <p class="lede">The same icons beside real filenames, on both surface tones.</p>
  <div class="strips">${treeRows('#121314')}${treeRows('#191A1B')}</div>
</section>

<section>
  <h2>4 — True 16 px pixel grid</h2>
  <p class="lede">Downscaled to a real 16&times;16 raster, then blown up 8&times; with nearest-neighbour so
  the actual delivered pixels are visible. This is the honest view — and where the raster route shows its
  seams: every glyph is soft and off-grid, because these are downsampled paintings, not pixel-hinted vectors.</p>
  <figure>
    <img src="data:image/png;base64,${b64(join(DIR, 'contact-16px.png'))}" alt="16px contact sheet magnified 8x">
    <figcaption>16&times;16 actual pixels, magnified 8&times;. Rust (row 2, col 4) is the clearest failure.</figcaption>
  </figure>
</section>

<section>
  <h2>5 — Raster vs traced vector</h2>
  <p class="lede">Left of each pair: the keyed PNG. Right: the vtracer SVG after 5-colour posterisation.
  Trace fidelity is good at display size; the cost is file weight — a hand-authored VS&nbsp;Code file icon
  is well under 2&nbsp;KB.</p>
  <div class="cmpgrid">${compareRows}</div>
</section>

<section>
  <h2>6 — Source sheets</h2>
  <p class="lede">Two independent runs of the identical prompt. Style drift between them is very low —
  the style block is reproducible, which is the single most important property for growing this to a full set.</p>
  <div class="two">
    <figure><img src="${jpg('sheet-a')}" alt="Generated sheet, run A"><figcaption>run A — 1024&sup2;</figcaption></figure>
    <figure><img src="${jpg('sheet-b')}" alt="Generated sheet, run B"><figcaption>run B — 1024&sup2; · sliced for this page</figcaption></figure>
  </div>
</section>

<section>
  <h2>7 — Pipeline results</h2>
  <table class="steps">
    <tbody>
      ${PIPELINE.map(([step, tool, status, txt]) => `
      <tr>
        <td class="st">${esc(step)}<br><span class="${status === 'worked' ? 'ok' : status === 'partial' ? 'pt' : 'no'}">${status}</span></td>
        <td class="tool">${esc(tool)}</td>
        <td class="txt">${esc(txt)}</td>
      </tr>`).join('')}
    </tbody>
  </table>
</section>

<section>
  <h2>8 — The exact command</h2>
  <p class="lede"><code>--dangerously-skip-permissions</code> was <em>required</em>: without it the run dies in
  20&nbsp;s with "a tool required the &quot;command&quot; permission that headless mode cannot prompt for".
  <code>--mode accept-edits</code> alone is not enough.</p>
  <div class="cmdline">agy -p "$PROMPT" \\
  --add-dir /Users/sebastian.suarez/Projects/VSebCode/m11-icons/pilot \\
  --mode accept-edits \\
  --dangerously-skip-permissions \\
  --print-timeout 8m</div>
</section>

<section>
  <h2>9 — Master prompt, verbatim</h2>
  <p class="lede">Prefixed at call time with: <em>"Using Nano Banana Pro, generate the image described below
  and save it to &lt;path&gt; at full resolution…"</em></p>
  <pre>${esc(PROMPT)}</pre>
</section>
</div>
`;

writeFileSync(join(DIR, 'checkpoint.html'), html);
console.log(`checkpoint.html written: ${(Buffer.byteLength(html) / 1024 / 1024).toFixed(2)} MB`);
