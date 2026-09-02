// build.mjs — authors the 84 icons of long-tail slice A06 into production/svg/file/.
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import {
	n, pt, poly, polyHole, rect, rectHole, roundRect, circle, ellipse, ring, ringE,
	bar, dot, sector, gear, rot
} from './geom.mjs';
import { badgeText, glyphText } from './letters.mjs';

const OUT = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/svg/file';
mkdirSync(OUT, { recursive: true });

const path = (fill, d, evenodd) => `<path fill="${fill}"${evenodd ? ' fill-rule="evenodd"' : ''} d="${d}"/>`;
const plate = (fill) => `<rect x="1" y="1" width="14" height="14" rx="3" fill="${fill}"/>`;

const ICONS = [];
const add = (id, arch, fills, src, body) => ICONS.push({ id, arch, fills, src, body });

// helper: badge = plate + letters
const badge = (id, fill, text, letterFill, w, src, ls = 0) => {
	const t = badgeText(text, { fill: letterFill, w, ls });
	add(id, 'BADGE', [fill, letterFill], src, plate(fill) + t.el);
};
// helper: bare letter glyph
const glyph = (id, fill, text, opts, src) => {
	const t = glyphText(text, { fill, ...opts });
	add(id, 'GLYPH', [fill], src, t.el);
};

// ---------------------------------------------------------------- P ---------

// poetry — poetry.lock (python packaging). brandColor #60A5FA, dropped in value so the
// plate clears the powershell / sas badge blues in this slice.
badge('poetry', '#3A78C0', 'P', '#FFFFFF', 5.4, 'brandColor #60A5FA → matte, value-shifted for R7');

// polyglot — polyglot notebooks (.dib): many languages, one file. Three primitives.
add('polyglot', 'GLYPH', ['#B06BC8'], 'no brand → violet (.NET interactive)',
	path('#B06BC8', poly([[8, 1.6], [11.6, 7.4], [4.4, 7.4]]) + circle(4.6, 11.1, 2.9)
		+ poly([[11.6, 7.5], [15.2, 11.1], [11.6, 14.7], [8, 11.1]])));

// polymer — the Polymer "P": a stem plus the hollow rotated square of the project mark.
add('polymer', 'GLYPH', ['#EA9FC4'], 'no brand → Polymer magenta (vsicons)',
	path('#EA9FC4', rect(4, 2.2, 1.8, 11.6)
		+ poly([[9.4, 1.4], [13.6, 5.6], [9.4, 9.8], [5.2, 5.6]])
		+ polyHole([[9.4, 3.6], [7.2, 5.6], [9.4, 7.6], [11.6, 5.6]])));

// poml — prompt orchestration markup: a prompt bubble.
add('poml', 'SILHOUETTE', ['#7C6FAF'], 'no brand → violet (prompt markup)',
	path('#7C6FAF', roundRect(1.6, 2.4, 12.8, 9.2, 2.2)
		+ poly([[4.6, 10.4], [8, 10.4], [4.4, 14.3]])
		+ circle(5.2, 7, 1.05, false) + circle(8, 7, 1.05, false) + circle(10.8, 7, 1.05, false)));

// pony — the pony language: a horseshoe.
add('pony', 'SILHOUETTE', ['#B07D5B'], 'no brand → saddle tan',
	path('#B07D5B', `M${pt(2.7, 8)}A5.3 5.3 0 0 1 ${pt(13.3, 8)}V${n(12.8)}H${n(11)}V${n(8)}`
		+ `A3 3 0 0 0 ${pt(5, 8)}V${n(12.8)}H${n(2.7)}Z`));

// postscript — the page-description language: a printer with the page coming off it.
add('postscript', 'SILHOUETTE', ['#BE5A4C'], 'no brand → Adobe red (pdf family rhyme)',
	path('#BE5A4C', rect(4.6, 1.5, 6.8, 3.4) + roundRect(2.2, 5.1, 11.6, 5.3, 1.2)
		+ roundRect(4.6, 10.4, 6.8, 3.1, .8)
		+ rectHole(3.6, 6.4, 2.2, 1.3) + rectHole(5.6, 11.3, 4.8, 1.2)));

// powerbi — the Power BI bars.
add('powerbi', 'SILHOUETTE', ['#D8B84A'], 'no brand → Power BI amber (#F2C811 matte)',
	path('#D8B84A', rect(2.2, 9.6, 3.2, 4) + rect(6.4, 6.4, 3.2, 7.2) + rect(10.6, 2.8, 3.2, 10.8)));

// powershell family — R3 rhyme on the canon powershell plate, one letter group each.
badge('powershell-format', '#6A95D2', 'fmt', '#FFFFFF', 11, 'core powershell #6A95D2 (R3 family)');
badge('powershell-psd', '#6A95D2', 'psd', '#FFFFFF', 11, 'core powershell #6A95D2 (R3 family)');
badge('powershell-psm', '#6A95D2', 'psm', '#FFFFFF', 11, 'core powershell #6A95D2 (R3 family)');
badge('powershell-types', '#6A95D2', 'typ', '#FFFFFF', 11, 'core powershell #6A95D2 (R3 family)');

// prismaconfig — the prisma prism, hollowed: config of the same tool.
add('prismaconfig', 'SILHOUETTE', ['#8592AD'], 'core prisma #8592AD (R3 family)',
	path('#8592AD', poly([[8.7, 1.2], [13.8, 12.9], [2.4, 14.4]])
		+ polyHole([[8.51, 5.1], [11.22, 11.3], [5.17, 12.1]])));

// processing / processinglang — the same .pde sketch from two source themes (R3 family).
badge('processing', '#46586E', 'pde', '#FFFFFF', 11, 'no brand → Processing navy');
glyph('processinglang', '#46586E', 'PDE', { w: 14 }, 'core-of-slice processing navy (R3 family)');

// progress — OpenEdge ABL.
glyph('progress', '#68AF5A', 'ABL', { w: 14 }, 'no brand → Progress green');

// prolog — the SWI-Prolog owl.
add('prolog', 'SILHOUETTE', ['#B5703F'], 'no brand → owl tan (vsicons)',
	path('#B5703F',
		`M${pt(3.9, 6)}L${pt(4.3, 2.4)}L${pt(6.6, 4.3)}C7.5 4 8.5 4 9.4 4.3L${pt(11.7, 2.4)}`
		+ `L${pt(12.1, 6)}C12.7 7 13 8.3 13 9.4C13 12.1 10.8 14 8 14C5.2 14 3 12.1 3 9.4`
		+ `C3 8.3 3.3 7 3.9 6Z`
		+ circle(6.15, 8.6, 1.45, false) + circle(9.85, 8.6, 1.45, false)));

// prometheus — the torch: flame, bowl, handle (a bare flame would collide with firebase).
add('prometheus', 'SILHOUETTE', ['#CF5C3A'], 'brandColor #E6522C → matte',
	path('#CF5C3A',
		`M${pt(8, 1.4)}C10.1 4 11.4 5.5 11.4 7.2C11.4 9 9.9 10.2 8 10.2C6.1 10.2 4.6 9 4.6 7.2`
		+ `C4.6 5.5 5.9 4 8 1.4Z`
		+ poly([[3.4, 10.2], [12.6, 10.2], [11.3, 12.4], [4.7, 12.4]])
		+ rect(7.15, 12.4, 1.7, 1.8)));

// prql — pipelined relational query language.
badge('prql', '#4E7A72', 'PRQ', '#FFFFFF', 11, 'no brand → muted query slate (neutral lane, clears sqlite)');

// publisher — the Office page plate (word / powerpoint family form) in Publisher teal.
add('publisher', 'SILHOUETTE', ['#3F8C7E', '#FFFFFF'], 'no brand → Publisher teal (#077568 matte)',
	`<rect x="2.6" y="1.5" width="10.8" height="13" rx="1.3" fill="#3F8C7E"/>`
	+ glyphText('P', { fill: '#FFFFFF', cap: 5.9, cy: 8 }).el);

// pug — the pug dog face.
add('pug', 'SILHOUETTE', ['#A86454'], 'no brand → pug brown (material / vsicons)',
	path('#A86454',
		`M${pt(8, 2.6)}C10.9 2.6 12.9 4.7 12.9 7.7C12.9 11.1 10.7 13.8 8 13.8`
		+ `C5.3 13.8 3.1 11.1 3.1 7.7C3.1 4.7 5.1 2.6 8 2.6Z`
		+ poly([[3.2, 3.4], [5.8, 2.8], [5.2, 6.4], [3.5, 5.4]])
		+ poly([[12.8, 3.4], [10.2, 2.8], [10.8, 6.4], [12.5, 5.4]])
		+ circle(6.1, 7.4, 1.1, false) + circle(9.9, 7.4, 1.1, false)
		+ circle(8, 10.4, 1.15, false)));

// puppet — .pp manifests.
badge('puppet', '#B8862F', 'PP', '#FFFFFF', 9.4, 'no brand → Puppet amber (#FFAE1A matte, dropped for R7)');

// purescript — the pale slate of the PureScript mark.
badge('purescript', '#A0A8BC', 'PS', '#232A38', 9.4, 'no brand → PureScript slate (#1D222D lifted)');

// pyret — .arr.
badge('pyret', '#9E6B85', 'arr', '#FFFFFF', 11, 'no brand → plum');

// python family (R3): pyscript / pytyped / pythonconfig share the python blue.
glyph('pyscript', '#3D7FB0', 'py', { w: 11 }, 'core python #3776AB → matte (R3 python family)');
glyph('pytyped', '#3D7FB0', 'T', { cap: 9.8 }, 'core python #3776AB → matte (R3 python family)');
add('pythonconfig', 'SILHOUETTE', ['#3D7FB0'], 'core python #3776AB → matte (R3 python family)',
	path('#3D7FB0', sector(5, 5, 3.4, 1.9, 270, 540) + bar(6.9, 6.9, 12.9, 12.9, 2.4)
		+ dot(12.9, 12.9, 1.2)));

// pythowo — the uwu joke dialect.
badge('pythowo', '#D488B8', 'owo', '#3E2036', 11, 'no brand → magenta');

// ---------------------------------------------------------------- Q ---------

// q — kdb+/q.
badge('q', '#B34DBC', 'Q', '#FFFFFF', 5.6, 'no brand → violet (free BADGE band)');

// Qt family (R3): qbs / qml / qmldir / qrc on the Qt green.
glyph('qbs', '#4AA85F', 'qbs', { w: 13 }, 'Qt green #41CD52 → matte (R3 Qt family)');
glyph('qml', '#4AA85F', 'QML', { w: 14 }, 'Qt green #41CD52 → matte (R3 Qt family)');
glyph('qmldir', '#4AA85F', 'dir', { w: 13 }, 'Qt green #41CD52 → matte (R3 Qt family)');
glyph('qrc', '#4AA85F', 'qrc', { w: 13 }, 'Qt green #41CD52 → matte (R3 Qt family)');

// qlikview — the Qlik "Q": a heavy bowl with the tail struck through it.
add('qlikview', 'SILHOUETTE', ['#3E9358'], 'no brand → Qlik green (#009845 matte)',
	path('#3E9358', ring(7.8, 7.6, 5.6, 2.6) + bar(8.6, 8.4, 12.4, 12.2, 2.9)));

// qsharp — Q#.
badge('qsharp', '#52348C', 'Q#', '#FFFFFF', 9.6, 'no brand → Microsoft Quantum violet');

// quarkdown — a Markdown-based typesetting language (R3 rhyme with canon markdown).
glyph('quarkdown', '#6FB0CE', 'QD', { w: 11.5 }, 'canon markdown #519ABA, lifted (R3 markdown family)');

// quarto — .qmd.
glyph('quarto', '#ADCFEA', 'qmd', { w: 13 }, 'Quarto blue #75AADB → light matte');

// quokka — live scratchpad runner.
badge('quokka', '#B0578E', 'qk', '#FFFFFF', 9.4, 'no brand → magenta (material)');

// qwik — the bolt, on a plate (the silhouette bolt is canon vite's).
add('qwik', 'BADGE', ['#9E7AD8', '#FFFFFF'], 'brandColor #AC7EF4 → matte',
	plate('#9E7AD8') + path('#FFFFFF',
		poly([[9.9, 3.1], [4.5, 8.8], [7.5, 8.8], [6.2, 12.9], [11.5, 7.1], [8.5, 7.1]])));

// ---------------------------------------------------------------- R ---------

// ra-syntax-tree — a rust-analyzer syntax tree dump.
add('ra-syntax-tree', 'GLYPH', ['#9E7266'], 'core rust #A0523C, desaturated (R3 rust family, neutral lane)',
	path('#9E7266', rect(6.6, 2.8, 2.8, 2.8) + rect(7.35, 5.6, 1.3, 1.6)
		+ rect(3, 7.2, 10, 1.3)
		+ rect(3, 8.5, 1.3, 1.9) + rect(7.35, 8.5, 1.3, 1.9) + rect(11.7, 8.5, 1.3, 1.9)
		+ rect(2.3, 10.4, 2.7, 2.7) + rect(6.65, 10.4, 2.7, 2.7) + rect(11, 10.4, 2.7, 2.7)));

// racket — the lambda of the Racket logo.
glyph('racket', '#BE5049', 'λ', { cap: 9.4 }, 'no brand → Racket red');

// rake — ruby's make.
add('rake', 'SILHOUETTE', ['#A94152'], 'core ruby #A94152 (R3 ruby family)',
	path('#A94152', rect(2.4, 9.2, 9, 1.4)
		+ rect(2.4, 10.6, 1.4, 2.8) + rect(5, 10.6, 1.4, 2.8)
		+ rect(7.6, 10.6, 1.4, 2.8) + rect(10, 10.6, 1.4, 2.8)
		+ bar(7.2, 9.6, 13.4, 3, 1.6)));

// raku — Camelia, the Raku butterfly.
add('raku', 'SILHOUETTE', ['#B573B8'], 'no brand → Camelia violet',
	path('#B573B8', roundRect(7.35, 4.6, 1.3, 8.2, .65)
		+ 'M7.8 6C6.4 3.2 3.6 2.4 2.3 3.8C1.1 5.2 2.2 7.6 4.8 8.4C5.9 8.7 7.2 8 7.8 7Z'
		+ 'M8.2 6C9.6 3.2 12.4 2.4 13.7 3.8C14.9 5.2 13.8 7.6 11.2 8.4C10.1 8.7 8.8 8 8.2 7Z'
		+ 'M7.7 9C6.6 9.6 4.4 10.2 3.6 11.5C3 12.6 4 13.9 5.4 13.5C6.7 13.1 7.5 11.6 7.7 10.4Z'
		+ 'M8.3 9C9.4 9.6 11.6 10.2 12.4 11.5C13 12.6 12 13.9 10.6 13.5C9.3 13.1 8.5 11.6 8.3 10.4Z'));

// raml — RESTful API modelling language.
badge('raml', '#333D6B', 'raml', '#FFFFFF', 11.4, 'no brand → deep indigo (neutral lane)');

// razor — the @ of razor syntax.
glyph('razor', '#6B4EC4', '@', { w: 10.4 }, 'no brand → .NET violet (#512BD4 matte)');

// rbxmk — the roblox build tool (R3 rhyme with roblox, dropped in value).
glyph('rbxmk', '#8A323C', 'rbx', { w: 13 }, 'roblox red, darkened (R3 roblox family)');

// reacttemplate — .rt (R3 rhyme with the canon react plate).
badge('reacttemplate', '#46B5D1', 'rt', '#10262E', 9.4, 'core reactjs #46B5D1 (R3 react family)');

// reason — ReasonML (R3 rhyme with rescript, its successor).
glyph('reason', '#A8502E', 're', { w: 11 }, 'no brand → Reason red-orange (R3 rescript family)');

// red — the red language.
badge('red', '#8A383C', 'red', '#FFFFFF', 11, 'no brand → deep red');

// redux family (R3): one plate, four state-shop marks.
const REDUX = '#7A55B0', RSRC = 'Redux #764ABC → matte (R3 redux family)';
add('redux-action', 'BADGE', [REDUX, '#FFFFFF'], RSRC, plate(REDUX) + path('#FFFFFF',
	rect(3.2, 7.35, 6.4, 1.9) + poly([[8.8, 4.9], [12.8, 8.3], [8.8, 11.7]])));
add('redux-reducer', 'BADGE', [REDUX, '#FFFFFF'], RSRC, plate(REDUX) + path('#FFFFFF',
	poly([[3.6, 4.4], [12.4, 4.4], [8.9, 8.8], [8.9, 12.2], [7.1, 11.1], [7.1, 8.8]])));
add('redux-selector', 'BADGE', [REDUX, '#FFFFFF'], RSRC, plate(REDUX) + path('#FFFFFF',
	ring(8, 8.3, 3.4, 2) + rect(7.35, 3.5, 1.3, 1.7) + rect(7.35, 11.4, 1.3, 1.7)
	+ rect(3.5, 7.65, 1.7, 1.3) + rect(11.1, 7.65, 1.7, 1.3)));
add('redux-store', 'BADGE', [REDUX, '#FFFFFF'], RSRC, plate(REDUX) + path('#FFFFFF',
	`M${pt(4, 5.2)}A4 1.5 0 0 1 ${pt(12, 5.2)}V${n(11.4)}A4 1.5 0 0 1 ${pt(4, 11.4)}Z`
	+ rectHole(4, 7.5, 8, .85) + rectHole(4, 9.4, 8, .85)));

// rego — Open Policy Agent.
badge('rego', '#6E8299', 'rego', '#FFFFFF', 11.4, 'no brand → slate (neutral lane)');

// replit — the three offset blocks.
add('replit', 'SILHOUETTE', ['#D96A2E'], 'brandColor #F26207 → matte',
	path('#D96A2E', roundRect(2.8, 2, 5.4, 3.8, 1.2) + roundRect(7.8, 6.2, 5.4, 3.8, 1.2)
		+ roundRect(2.8, 10.4, 5.4, 3.8, 1.2)));

// rescript / rescript-interface (R3 family).
badge('rescript', '#D14A4E', 'Re', '#FFFFFF', 9.4, 'no brand → ReScript red (#E6484F matte)');
badge('rescript-interface', '#D14A4E', 'Ri', '#FFFFFF', 9.4, 'ReScript red (R3 rescript family)');

// restql.
badge('restql', '#6FB8AE', 'rql', '#17352F', 11, 'no brand → light teal (clears sqlite / go)');

// rexx.
badge('rexx', '#888830', 'rexx', '#FFFFFF', 11.4, 'no brand → muted gold');

// riot.
badge('riot', '#DD7C58', 'riot', '#3A1A0E', 11.4, 'no brand → Riot red, value-lifted for R7');

// ripple — the ripple framework: water.
add('ripple', 'SILHOUETTE', ['#3EA8A0'], 'no brand → water teal',
	path('#3EA8A0', wave(3.4) + wave(8.4)));
function wave(y) {
	return `M${pt(1.7, y + 1.9)}C3.1 ${n(y)} 4.9 ${n(y)} 6.1 ${n(y + 1.5)}`
		+ `C7.2 ${n(y + 2.8)} 8.8 ${n(y + 2.8)} 9.9 ${n(y + 1.5)}`
		+ `C11.1 ${n(y)} 12.9 ${n(y)} 14.3 ${n(y + 1.9)}L${pt(14.3, y + 3.9)}`
		+ `C12.9 ${n(y + 2)} 11.1 ${n(y + 2)} 9.9 ${n(y + 3.5)}`
		+ `C8.8 ${n(y + 4.8)} 7.2 ${n(y + 4.8)} 6.1 ${n(y + 3.5)}`
		+ `C4.9 ${n(y + 2)} 3.1 ${n(y + 2)} 1.7 ${n(y + 3.9)}Z`;
}

// rmd — R Markdown (R3 rhyme with the canon r glyph).
glyph('rmd', '#3D6EC8', 'Rmd', { w: 13.5 }, 'core r #3D6EC8 (R3 r family)');

// rnc — RELAX NG compact schema.
badge('rnc', '#7C93A6', 'rnc', '#FFFFFF', 11, 'core xml #7C93A6 (schema kin, neutral lane)');

// roblox — the tilted square.
add('roblox', 'SILHOUETTE', ['#C0433F'], 'no brand → Roblox red',
	path('#C0433F',
		poly(rot([[2.8, 2.8], [13.2, 2.8], [13.2, 13.2], [2.8, 13.2]], 8, 8, 15))
		+ polyHole(rot([[5.9, 5.9], [10.1, 5.9], [10.1, 10.1], [5.9, 10.1]], 8, 8, 15))));

// robotframework.
badge('robotframework', '#6E8496', 'RF', '#FFFFFF', 9.4, 'no brand → slate (neutral lane)');

// ron — Rusty Object Notation (R3 rust family).
badge('ron', '#A0523C', 'ron', '#FFFFFF', 11, 'core rust #A0523C (R3 rust family)');

// routing — a signpost.
add('routing', 'GLYPH', ['#3F827A'], 'no brand → teal',
	path('#3F827A', rect(7.3, 2.4, 1.4, 11.6)
		+ poly([[8.7, 3.2], [12.6, 3.2], [14.2, 4.9], [12.6, 6.6], [8.7, 6.6]])
		+ poly([[7.3, 8], [3.4, 8], [1.8, 9.7], [3.4, 11.4], [7.3, 11.4]])));

// rproj — the R ellipse with its R.
add('rproj', 'SILHOUETTE', ['#78828E', '#4C87DC'], 'R logo grey + core r blue, lifted (R2 two-tone)',
	path('#78828E', ellipse(8, 7.8, 7, 4.4))
	+ glyphText('R', { fill: '#2F5FA8', cap: 7.6, cy: 8 }).el);

// rss — the feed mark.
add('rss', 'GLYPH', ['#D8802E'], 'no brand → RSS orange (#E8862E matte)',
	path('#D8802E', dot(4.5, 11.7, 1.5) + sector(3.2, 13, 5.9, 3.9, 0, -90)
		+ sector(3.2, 13, 9.9, 7.9, 0, -90)));

// rust-toolchain — Ferris. (The Rust gear is out: canon tsconfig is already a gear, R8.)
add('rust-toolchain', 'SILHOUETTE', ['#B85F3E'], 'core rust #A0523C, lifted for silhouette contrast (R3 rust family)',
	path('#B85F3E',
		`M${pt(8, 5.4)}C11.3 5.4 13.5 7.1 13.5 9.3C13.5 11.4 11 12.9 8 12.9`
		+ `C5 12.9 2.5 11.4 2.5 9.3C2.5 7.1 4.7 5.4 8 5.4Z`
		+ circle(6.1, 4.7, 1.15) + circle(9.9, 4.7, 1.15)
		+ poly([[1.3, 4.9], [4.5, 7.2], [3, 9.3], [1.2, 7.6]])
		+ poly([[14.7, 4.9], [11.5, 7.2], [13, 9.3], [14.8, 7.6]])
		+ bar(4.4, 11.9, 2.9, 13.8, 1.3) + bar(6.2, 12.6, 5.3, 14.3, 1.3)
		+ bar(11.6, 11.9, 13.1, 13.8, 1.3) + bar(9.8, 12.6, 10.7, 14.3, 1.3)));

// ---------------------------------------------------------------- S ---------

// s-lang.
badge('s-lang', '#7E8A96', 'SL', '#FFFFFF', 9.4, 'no brand → steel grey (neutral lane)');

// salesforce — the cloud.
add('salesforce', 'SILHOUETTE', ['#3E9ACF'], 'no brand → Salesforce blue (#00A1E0 matte)',
	path('#3E9ACF', circle(5.4, 8.8, 3) + circle(8.6, 7.2, 4) + circle(11.6, 9.2, 2.8)
		+ roundRect(2.6, 8.6, 11.4, 3.8, 1.9)));

// saltstack — the shaker.
add('saltstack', 'SILHOUETTE', ['#6E9EB0'], 'no brand → salt blue-grey',
	path('#6E9EB0', roundRect(5.5, 1.7, 5, 2.6, .9)
		+ `M${pt(4.9, 4.3)}H${n(11.1)}L${pt(12.4, 12.2)}A1.7 1.7 0 0 1 ${pt(10.7, 14.1)}`
		+ `H${n(5.3)}A1.7 1.7 0 0 1 ${pt(3.6, 12.2)}Z`
		+ circle(6.9, 2.95, .75, false) + circle(9.1, 2.95, .75, false)));

// san — the san framework.
badge('san', '#8E88A8', 'san', '#FFFFFF', 11, 'no brand → violet-grey (neutral lane)');

// sas — the SAS analytics language.
badge('sas', '#A8C6E8', 'SAS', '#1E3A5C', 11, 'SAS blue #0766D1 → light plate (clears the badge blues)');

// sbt — the scala build tool (R3 scala rhyme).
add('sbt', 'SILHOUETTE', ['#C93A4A'], 'core scala #C93A4A (R3 scala family)',
	path('#C93A4A', roundRect(5.4, 2.9, 5.2, 2.8, .7) + roundRect(3.8, 6.6, 8.4, 2.8, .7)
		+ roundRect(2.2, 10.3, 11.6, 2.8, .7)));

// scheme.
badge('scheme', '#8E5A82', 'scm', '#FFFFFF', 11, 'no brand → plum');

// scilab — numerical computing: a plot.
add('scilab', 'GLYPH', ['#7E86C0'], 'no brand → indigo',
	path('#7E86C0', rect(2.2, 2.6, 1.4, 11) + rect(2.2, 12.2, 11.8, 1.4)
		+ bar(4.8, 10.2, 7.4, 6.4, 1.5) + bar(7.4, 6.4, 9.8, 8.6, 1.5)
		+ bar(9.8, 8.6, 13.3, 3.4, 1.5)
		+ dot(7.4, 6.4, .75) + dot(9.8, 8.6, .75)));

// scons.
badge('scons', '#8A8078', 'SC', '#FFFFFF', 9.4, 'no brand → taupe (neutral lane)');

// script — .wsf: a scroll.
add('script', 'SILHOUETTE', ['#A8998A'], 'no brand → parchment tan (neutral lane)',
	path('#A8998A', roundRect(2.4, 2.2, 11.2, 2.2, 1.1) + rect(3.6, 4.4, 8.8, 7.2)
		+ roundRect(2.4, 11.6, 11.2, 2.2, 1.1)
		+ rectHole(5.2, 6, 5.6, 1.2) + rectHole(5.2, 8.6, 5.6, 1.2)));

// scss (R3 sass family).
badge('scss', '#C4708F', 'scss', '#FFFFFF', 11.4, 'brandColor #CC6699 → core sass matte (R3 sass family)');

// sdlang.
badge('sdlang', '#7E9E5E', 'sdl', '#FFFFFF', 11, 'no brand → olive');

// search / search-result — .code-search (R3 family, two source themes).
add('search', 'GLYPH', ['#8A9AA8'], 'no brand → slate (neutral lane)',
	path('#8A9AA8', ring(6.6, 6.6, 4.5, 3.1) + bar(9.5, 9.5, 13.3, 13.3, 2.3) + dot(13.3, 13.3, 1.15)));
add('search-result', 'GLYPH', ['#8A9AA8'], 'slate (R3 search family)',
	path('#8A9AA8', rect(1.4, 3.6, 5.2, 1.5) + rect(1.4, 6.6, 5.2, 1.5) + rect(1.4, 9.6, 3.6, 1.5)
		+ ring(11.2, 7.6, 3.6, 2.2) + bar(13.5, 9.9, 14.3, 10.7, 2)));

// sentry — the chevron.
add('sentry', 'SILHOUETTE', ['#8579B8'], 'brandColor #362D59 lifted (§6.3)',
	path('#8579B8', poly([[8, 1.9], [14.4, 13.1], [11.4, 13.1], [8, 7.2], [4.6, 13.1], [1.6, 13.1]])));

// ---------------------------------------------------------------------------

const seen = new Set();
for (const ic of ICONS) {
	if (seen.has(ic.id)) { throw new Error('duplicate id ' + ic.id); }
	seen.add(ic.id);
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${ic.body}</svg>`;
	ic.bytes = Buffer.byteLength(svg);
	writeFileSync(join(OUT, `${ic.id}.svg`), svg);
}
ICONS.sort((a, b) => a.id.localeCompare(b.id));
const rosterJson = JSON.stringify(ICONS.map(({ id, arch, fills, src, bytes }) => ({ id, arch, fills, src, bytes })), null, 1);
writeFileSync(new URL('./roster.json', import.meta.url), rosterJson);
writeFileSync(join(OUT, '../../contact-A06.roster.json'), rosterJson + '\n');
console.log(`${ICONS.length} icons written to ${OUT}`);
console.log(`bytes: max ${Math.max(...ICONS.map(i => i.bytes))}, avg ${Math.round(ICONS.reduce((s, i) => s + i.bytes, 0) / ICONS.length)}`);
const byArch = {};
for (const i of ICONS) { byArch[i.arch] = (byArch[i.arch] || 0) + 1; }
console.log(byArch);
