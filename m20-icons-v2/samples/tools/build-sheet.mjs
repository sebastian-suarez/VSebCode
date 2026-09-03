#!/usr/bin/env node
// build-sheet.mjs — samples/sheet.html, the page the D22 ruling is made on.
//
// Self-contained, no external references, dark backdrop explicit. The title is
// the artifact's identity and must stay exactly "Icons v2 Candidates".

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SUBJECTS, spec } from './sources.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, '..');
const V1 = '/Users/sebastian.suarez/Projects/VSebCode/vscode/extensions/theme-vsebcode-icons/icons';

// the shipped set has no `react.svg`; `reactjs.svg` is the nearest shipped name
const V1NAME = { react: 'reactjs' };

const ROWS = [
	{
		id: 'v1', name: 'current v1 (shipped)', tag: 'today',
		desc: 'The M11 set in the product right now. Three archetypes mixed freely, letters '
			+ 'decided per icon, brand fidelity optional — editorconfig is invented sliders, '
			+ 'react and rust are re-set letters, the two folders differ by a few pixels.',
		load: (id) => readFileSync(id.startsWith('folder-')
			? join(V1, 'folder', `${id.slice(7)}.svg`)
			: join(V1, 'file', `${V1NAME[id] || id}.svg`), 'utf8')
	},
	{
		id: 'r1', dir: 'r1-true', name: 'R1 · True colour', tag: 'the mark, verbatim',
		desc: 'The fitted master in its official colours, multi-colour kept: python\'s blue '
			+ 'and yellow snakes, eslint\'s two purples, the white TS on its blue square. '
			+ 'Folders take the concept\'s hue in the body with the mark in white.',
		off: 'Loudest of the four, and the two colourless brands (markdown, editorconfig) '
			+ 'read as grey and white next to a rainbow.'
	},
	{
		id: 'r2', dir: 'r2-tint', name: 'R2 · One tint', tag: 'same shape, one hue',
		desc: 'The same geometry as one flat fill in the brand\'s primary hex — the '
			+ 'simple-icons look. Counters stay open, so the TS square shows the backdrop '
			+ 'through its letters. Every folder body is sand; the mark carries the hue.',
		off: 'Python loses its yellow and eslint its second purple; six of the twelve are '
			+ 'identical to R1 because their brands are monochrome anyway.'
	},
	{
		id: 'r3', dir: 'r3-chips', name: 'R3 · Chips', tag: 'uniform container',
		desc: 'A 14×14 rx3 chip in the brand hue clamped to S 45–70 / L 45–60, with the '
			+ 'same master knocked out white inside at 8–10 px. Folders take the chip colour '
			+ 'in the body. The most uniform grid of the four.',
		off: 'All internal colour flattens to white, and a mark that is itself a square '
			+ '(typescript) becomes a chip inside a chip.'
	},
	{
		id: 'r4', dir: 'r4-tamed', name: 'R4 · Tamed colour', tag: 'R1, normalised',
		desc: 'R1 exactly, with every hex pulled into S 45–70 / L 45–62 and the hue left '
			+ 'alone, so the rainbow sits in one saturation world. Hueless inks are exempt '
			+ '— clamping saturation on white would invent a colour.',
		off: 'Hexes stop being exact: python\'s yellow and docker\'s blue are visibly '
			+ 'softened, which purists will notice.'
	}
];

const LISTING = [
	['src/', 'folder-src'], ['node_modules/', 'folder-node'],
	['main.ts', 'typescript'], ['App.tsx', 'react'], ['app.py', 'python'],
	['main.rs', 'rust'], ['Dockerfile', 'docker'], ['package.json', 'json'],
	['README.md', 'markdown'], ['.editorconfig', 'editorconfig'],
	['.eslintrc.json', 'eslint'], ['.prettierrc', 'prettier']
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

for (const r of ROWS) {
	r.svg = {};
	for (const id of SUBJECTS) {
		const src = r.load ? r.load(id) : readFileSync(join(OUT, r.dir, `${id}.svg`), 'utf8');
		r.svg[id] = src.trim()
			.replace(' xmlns="http://www.w3.org/2000/svg"', '')
			.replace(/\swidth="[^"]*"(?=[^>]*viewBox)/, '')
			.replace(/\sheight="[^"]*"(?=[^>]*viewBox)/, '');
	}
}
const at = (src, px) => src.replace('<svg', `<svg width="${px}" height="${px}"`);

const strip64 = (r) => `<div class="s64">` + SUBJECTS.map(id =>
	`<figure>${at(r.svg[id], 64)}<figcaption>${id}</figcaption></figure>`).join('') + `</div>`;

const strip16 = (r, cls = 's16') => `<div class="${cls}">` + SUBJECTS.map(id =>
	`<span title="${id}">${at(r.svg[id], 16)}</span>`).join('') + `</div>`;

const listing = (r) => `<div class="tree">` + LISTING.map(([label, id]) =>
	`<div class="line">${at(r.svg[id], 16)}<span>${esc(label)}</span></div>`).join('') + `</div>`;

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Icons v2 Candidates</title>
<style>
:root{--bg:#121314;--panel:#191b1d;--edge:#26292c;--ink:#e6e8ea;--dim:#8b9199;--acc:#7fb5ff}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{background:#121314;color:var(--ink);margin:0;
	font:14px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif}
.wrap{max-width:1180px;margin:0 auto;padding:44px 28px 80px}
header{border-bottom:1px solid var(--edge);padding-bottom:26px;margin-bottom:34px}
h1{font-size:27px;font-weight:640;letter-spacing:-.02em;margin:0 0 8px}
.sub{color:var(--dim);font-size:14.5px;max-width:78ch;margin:0 0 18px}
.sub b{color:var(--ink);font-weight:600}
.arch{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px;margin-top:20px}
.arch div{background:var(--panel);border:1px solid var(--edge);border-radius:9px;padding:11px 13px}
.arch h4{margin:0 0 3px;font-size:12px;font-weight:640;letter-spacing:.02em;color:var(--acc)}
.arch p{margin:0;font-size:12.5px;line-height:1.5;color:var(--dim)}
section{margin:0 0 42px}
.head{display:flex;align-items:baseline;gap:11px;flex-wrap:wrap;margin-bottom:5px}
h2{font-size:19px;font-weight:640;margin:0;letter-spacing:-.01em}
.tag{font-size:11px;color:var(--dim);border:1px solid var(--edge);border-radius:20px;
	padding:2px 9px;letter-spacing:.02em}
.desc{color:var(--dim);font-size:13.5px;max-width:88ch;margin:0 0 4px}
.off{color:#a08a63;font-size:13px;max-width:88ch;margin:0 0 16px}
.off b{color:#c0a678;font-weight:600}
.s64{display:grid;grid-template-columns:repeat(12,1fr);gap:6px;background:var(--bg);
	border:1px solid var(--edge);border-radius:11px;padding:15px 12px 10px}
.s64 figure{margin:0;text-align:center}
.s64 svg{display:block;margin:0 auto}
figcaption{font-size:9.5px;color:#6d747c;margin-top:7px;line-height:1.25;
	word-break:break-word;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
.rowpair{display:flex;gap:14px;margin-top:12px;flex-wrap:wrap;align-items:flex-start}
.card{background:var(--bg);border:1px solid var(--edge);border-radius:11px;padding:13px 15px}
.card h5{margin:0 0 9px;font:600 10.5px/1 ui-monospace,SFMono-Regular,Menlo,monospace;
	letter-spacing:.09em;text-transform:uppercase;color:#6d747c}
.s16{display:flex;gap:9px;align-items:center;min-height:18px}
.s16 span{display:block;line-height:0}
.tree{min-width:250px}
.line{display:flex;align-items:center;gap:7px;height:22px;font-size:12.5px;color:#c3c8cd;
	font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
.line svg{flex:none}
.light{background:#F5F5F4;color:#26282b;border-radius:12px;padding:20px 22px;margin-top:38px}
.light h3{margin:0 0 3px;font-size:15px;font-weight:640;color:#1a1c1e}
.light p{margin:0 0 16px;font-size:12.5px;color:#5d6268;max-width:80ch}
.lrow{display:flex;align-items:center;gap:14px;padding:7px 0;border-top:1px solid #e3e3e1}
.lrow:first-of-type{border-top:0}
.lname{width:150px;font:600 12px/1.3 -apple-system,system-ui,sans-serif;color:#3a3d41}
.lrow .s16{gap:9px}
footer{color:#5f666e;font-size:12px;border-top:1px solid var(--edge);margin-top:44px;
	padding-top:18px}
footer code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#8b9199}
</style></head>
<body><div class="wrap">
<header>
<h1>Icons v2 — round 2 candidates</h1>
<p class="sub">Round 1 was rejected: the marks were drawn freehand and were <b>not the real
logos</b>. Round 2 fixes that structurally. Every subject now has <b>one master mark adapted
from the brand's own vector artwork</b> — simple-icons' CC0 vectors or the brand's own SVG —
fitted onto the 16-grid, and all four treatments are generated from that single master by
recolouring, flattening or chip-wrapping it. The four rows below are therefore the same
twelve shapes four ways: the choice is a colour and container decision, not a drawing one.</p>
<div class="arch">
<div><h4>ONE MASTER PER SUBJECT</h4><p>Geometry is decided once, from the official file.
Simplifications happen only where a stem would fall under 1.5&nbsp;px at 16, and every one
is logged in <code>sources.json</code>.</p></div>
<div><h4>TREATMENTS ARE FUNCTIONS</h4><p>R1 = master verbatim · R2 = master as one flat fill
· R3 = master knocked white out of a chip · R4 = master with every hex normalised. A gate
asserts the four rows really carry identical path data.</p></div>
<div><h4>JUDGED AT 16&nbsp;PX</h4><p>Each row is shown at 64&nbsp;px for the eye, at a true
16&nbsp;px, and in a 22&nbsp;px explorer listing — the render the file tree actually
performs.</p></div>
</div>
</header>`
	+ ROWS.map(r => `
<section>
<div class="head"><h2>${r.name}</h2><span class="tag">${r.tag}</span></div>
<p class="desc">${r.desc}</p>
${r.off ? `<p class="off"><b>Trade-off.</b> ${r.off}</p>` : '<div style="height:12px"></div>'}
${strip64(r)}
<div class="rowpair">
<div class="card"><h5>true 16 px</h5>${strip16(r)}</div>
<div class="card tree"><h5>explorer listing · 22 px rows</h5>${listing(r)}</div>
</div>
</section>`).join('')
	+ `
<div class="light">
<h3>Light backdrop check · #F5F5F4, 16 px</h3>
<p>Dark is the design target, but the theme format supports light variants and a mark that
vanishes here is worth knowing about now — editorconfig's official mascot is white, and
markdown's official black is lifted for the dark backdrop.</p>
${ROWS.map(r => `<div class="lrow"><div class="lname">${r.name}</div>${strip16(r)}</div>`).join('')}
</div>

<footer>
M20 · icons v2 · round 2 · twelve subjects × four treatments, all derived from one fitted
master each. Provenance and every logged simplification: <code>samples/sources.json</code>.
Source-vs-master comparison: <code>samples/fidelity-proof.png</code>.
</footer>
</div></body></html>
`;

writeFileSync(join(OUT, 'sheet.html'), html);
console.log(`wrote sheet.html — ${(Buffer.byteLength(html) / 1024).toFixed(1)} KB, `
	+ `${(html.match(/<svg/g) || []).length} inlined svgs`);
void spec;
