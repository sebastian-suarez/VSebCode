// Authors the 26 batch-1 SVGs from hand-placed geometry + letterpath outlines.
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { letterPath } from '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/tools/letterpath.mjs';

const OUT = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/svg';
mkdirSync(join(OUT, 'file'), { recursive: true });
mkdirSync(join(OUT, 'folder'), { recursive: true });

const n = (v) => {
	let s = (+v).toFixed(2);
	if (s.includes('.')) { s = s.replace(/0+$/, '').replace(/\.$/, ''); }
	if (s === '-0') { s = '0'; }
	return s.replace(/^(-?)0\./, '$1.');
};

// ---- badge letter placement -------------------------------------------------
// Canon TS: plate y 1..15, cap 5.214, baseline 11.4  ->  41% of the free vertical
// space sits below the baseline. Canon npm agrees (39.9%).
const badgeBaseline = (cap, plateTop = 1, plateH = 14) => plateTop + plateH - 0.41 * (plateH - cap);

const P = (d, fill, extra = '') => `<path${fill ? ` fill="${fill}"` : ''}${extra} d="${d}"/>`;

function letters(text, opts) {
	const r = letterPath({ text, precision: 2, ...opts });
	return r;
}

// ---- shared geometry --------------------------------------------------------
const PLATE = 'M4 1h8a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H4a3 3 0 0 1-3-3V4a3 3 0 0 1 3-3z';
// The canon uses <rect x=1 y=1 width=14 height=14 rx=3>; keep the rect element,
// it is smaller than the equivalent path and pixel-identical.
const plateRect = (fill) => `<rect x="1" y="1" width="14" height="14" rx="3" fill="${fill}"/>`;
const SHIELD = 'M2.6 1.5h10.8l-.98 11L8 14.5l-4.42-2z';

// circle as a path (cubic, k = 0.5523)
function circle(cx, cy, r) {
	const k = 0.5523 * r;
	return `M${n(cx + r)} ${n(cy)}` +
		`C${n(cx + r)} ${n(cy + k)} ${n(cx + k)} ${n(cy + r)} ${n(cx)} ${n(cy + r)}` +
		`C${n(cx - k)} ${n(cy + r)} ${n(cx - r)} ${n(cy + k)} ${n(cx - r)} ${n(cy)}` +
		`C${n(cx - r)} ${n(cy - k)} ${n(cx - k)} ${n(cy - r)} ${n(cx)} ${n(cy - r)}` +
		`C${n(cx + k)} ${n(cy - r)} ${n(cx + r)} ${n(cy - k)} ${n(cx + r)} ${n(cy)}Z`;
}

// structured command list -> path data, optionally mirrored about x = 8
function emit(cmds, mirror = false) {
	const mx = (x) => (mirror ? 16 - x : x);
	let out = '';
	for (const c of cmds) {
		const t = c[0];
		if (t === 'Z') { out += 'Z'; continue; }
		if (t === 'V') { out += `V${n(c[1])}`; continue; }
		if (t === 'H') { out += `H${n(mx(c[1]))}`; continue; }
		const pts = [];
		for (let i = 1; i < c.length; i += 2) { pts.push(n(mx(c[i])), n(c[i + 1])); }
		out += t + pts.join(' ').replace(/ -/g, '-');
	}
	return out;
}

const BRACE = [
	['M', 6.7, 2],
	['C', 5.35, 2, 4.6, 2.75, 4.6, 4.1],
	['V', 6.05],
	['C', 4.6, 6.75, 4.05, 7.15, 3.1, 7.15],
	['V', 8.85],
	['C', 4.05, 8.85, 4.6, 9.25, 4.6, 9.95],
	['V', 11.9],
	['C', 4.6, 13.25, 5.35, 14, 6.7, 14],
	['V', 12.3],
	['C', 6.5, 12.3, 6.3, 12.15, 6.3, 11.9],
	['V', 9.95],
	['C', 6.3, 9, 5.9, 8.35, 5.15, 8],
	['C', 5.9, 7.65, 6.3, 7, 6.3, 6.05],
	['V', 4.1],
	['C', 6.3, 3.85, 6.5, 3.7, 6.7, 3.7],
	['Z']
];

// ---- the batch --------------------------------------------------------------
const ICONS = [];
const add = (id, kind, archetype, body) => ICONS.push({ id, kind, archetype, body });

// 1 typescript — CANON badge
add('typescript', 'file', 'BADGE',
	plateRect('#3178C6') +
	P(letters('TS', { cap: 5.214, cx: 7.859, baseline: 11.4, letterSpacing: 0.065 }).d, '#FFFFFF'));

// 2 reactts — badge, React cyan, dark letters
add('reactts', 'file', 'BADGE',
	plateRect('#46B5D1') +
	P(letters('TSX', { cap: 4, cx: 8, baseline: badgeBaseline(4), letterSpacing: -0.02 }).d, '#10262E'));

// 3 js — badge, JS yellow, dark letters
add('js', 'file', 'BADGE',
	plateRect('#E8D44D') +
	P(letters('JS', { cap: 5.5, cx: 8, baseline: badgeBaseline(5.5) }).d, '#323330'));

// 4 reactjs — badge, React cyan, dark letters
add('reactjs', 'file', 'BADGE',
	plateRect('#46B5D1') +
	P(letters('JSX', { cap: 4, cx: 8, baseline: badgeBaseline(4), letterSpacing: -0.02 }).d, '#10262E'));

// 5 json — glyph, bold braces
add('json', 'file', 'GLYPH',
	P(emit(BRACE) + emit(BRACE, true), '#D6C13C'));

// 6 markdown — CANON glyph (verbatim)
add('markdown', 'file', 'GLYPH',
	'<rect x="0.75" y="3.75" width="14.5" height="8.5" rx="1.6" fill="none" stroke="#519ABA" stroke-width="1.3"/>' +
	'<path fill="#519ABA" d="M2.9 10.4V5.9h1.35L5.6 7.6l1.35-1.7H8.3v4.5H6.95V7.9L5.6 9.6 4.25 7.9v2.5z"/>' +
	'<path fill="#519ABA" d="M10.55 5.9h1.5v2.3h1.35L11.3 10.7 9.2 8.2h1.35z"/>');

// 7 css — CANON silhouette
add('css', 'file', 'SILHOUETTE',
	P(SHIELD, '#1572B6') +
	P(letters('3', { cap: 5.073, cx: 7.883, baseline: 10.6 }).d, '#FFFFFF'));

// 8 sass — badge monogram
add('sass', 'file', 'BADGE',
	plateRect('#C4708F') +
	P(letters('S', { cap: 7, cx: 8, baseline: badgeBaseline(7) }).d, '#FFFFFF'));

// 9 html — silhouette, canon shield geometry
add('html', 'file', 'SILHOUETTE',
	P(SHIELD, '#DB5430') +
	P(letters('5', { cap: 5.073, cx: 8, baseline: 10.6 }).d, '#FFFFFF'));

// 10 rust — badge
add('rust', 'file', 'BADGE',
	plateRect('#A0523C') +
	P(letters('RS', { cap: 5.5, cx: 8, baseline: badgeBaseline(5.5) }).d, '#FFFFFF'));

// 11 toml — badge monogram
add('toml', 'file', 'BADGE',
	plateRect('#7E4A2E') +
	P(letters('T', { cap: 7, cx: 8, baseline: badgeBaseline(7) }).d, '#FFFFFF'));

// 12 yaml — badge
add('yaml', 'file', 'BADGE',
	plateRect('#7E6086') +
	P(letters('YML', { cap: 3.9, cx: 8, baseline: badgeBaseline(3.9), letterSpacing: -0.02 }).d, '#FFFFFF'));

// 13 docker — silhouette whale
add('docker', 'file', 'SILHOUETTE',
	P('M3.25 3.7h2.7v2.7h-2.7zM6.65 3.7h2.7v2.7h-2.7zM10.05 3.7h2.7v2.7h-2.7z' +
		'M1 6.9h13v1.4c0 2.9-2.3 5.2-5.2 5.2H6.2C3.3 13.5 1 11.2 1 8.3z' +
		'M14 6.9l1.8-1.5v3.8L14 8.3z', '#2E92D8'));

// 14 dotenv — glyph letters
add('dotenv', 'file', 'GLYPH',
	P(letters('ENV', { cap: 5.2, cx: 8, cy: 8, letterSpacing: -0.03 }).d, '#E3CB4E'));

// 15 prisma — silhouette prism
add('prisma', 'file', 'SILHOUETTE',
	P('M8.7 1.2l5.1 11.7-11.4 1.5z', '#8592AD'));

// 16 next — silhouette disc with knocked-out N
add('next', 'file', 'SILHOUETTE',
	P(circle(8, 8, 6.5) + letters('N', { cap: 7.6, cx: 8, cy: 8 }).d, '#DADCE0', ' fill-rule="evenodd"'));

// 17 node — silhouette hexagon
add('node', 'file', 'SILHOUETTE',
	P('M8 1.4l5.7 3.3v6.6L8 14.6 2.3 11.3V4.7z', '#5FA04E'));

// 18 npm — CANON badge
add('npm', 'file', 'BADGE',
	'<rect x="1.5" y="1.5" width="13" height="13" rx="2" fill="#CB3837"/>' +
	P(letters('npm', { xheight: 2.72, cx: 7.906, baseline: 10.4, letterSpacing: 0.058 }).d, '#FFFFFF'));

// 19 lock — silhouette padlock
add('lock', 'file', 'SILHOUETTE',
	P('M4.9 7.2V5.5C4.9 3.79 6.29 2.4 8 2.4s3.1 1.39 3.1 3.1v1.7H9.7V5.5C9.7 4.56 8.94 3.8 8 3.8S6.3 4.56 6.3 5.5v1.7z' +
		'M4.2 7.2h7.6c.66 0 1.2.54 1.2 1.2V13c0 .66-.54 1.2-1.2 1.2H4.2C3.54 14.2 3 13.66 3 13V8.4c0-.66.54-1.2 1.2-1.2z' +
		circle(8, 10.3, .95), '#979CA3', ' fill-rule="evenodd"'));

// 20 git — glyph branch
add('git', 'file', 'GLYPH',
	P('M3.85 3.6h1.6v8.8h-1.6z' +
		circle(4.65, 3.6, 1.95) + circle(4.65, 12.4, 1.95) + circle(11.35, 4.4, 1.95) +
		'M12.15 4.4v2.9c0 .49-.41.9-.9.9H5.45V6.6h4.9c.11 0 .2-.09.2-.2V4.4z', '#E0603C'));

// 21 shell — glyph prompt
add('shell', 'file', 'GLYPH',
	P('M3.8 3.3L1.8 5.3 4.5 8l-2.7 2.7 2 2L8.5 8z' +
		'M9.2 11h5.2v1.6H9.2z', '#79BE4A'));

// 22 sql — silhouette cylinder
add('sql', 'file', 'SILHOUETTE',
	P('M2.4 3.6C2.4 2.44 4.91 1.5 8 1.5s5.6.94 5.6 2.1v8.8c0 1.16-2.51 2.1-5.6 2.1s-5.6-.94-5.6-2.1z' +
		'M2.4 6.2h11.2v.8H2.4zM2.4 9.6h11.2v.8H2.4z', '#3E9B8E', ' fill-rule="evenodd"'));

// 23 svg — badge
add('svg', 'file', 'BADGE',
	plateRect('#DFA046') +
	P(letters('SVG', { cap: 4, cx: 8, baseline: badgeBaseline(4), letterSpacing: -0.02 }).d, '#33260C'));

// 24 image — silhouette peaks + sun
add('image', 'file', 'SILHOUETTE',
	P('M1.5 13.6L6.1 5.4l4.6 8.2zM8.3 13.6l3.4-5.8 3.4 5.8z' + circle(12.2, 4.2, 1.45), '#A08BCC'));

// folders — CANON, verbatim
add('folder', 'folder', 'SILHOUETTE',
	'<path fill="#BF9354" d="M1.5 4.1c0-.66.54-1.2 1.2-1.2h3.12c.34 0 .66.14.89.39l.95 1.01h5.64c.66 0 1.2.54 1.2 1.2v6.4c0 .66-.54 1.2-1.2 1.2H2.7c-.66 0-1.2-.54-1.2-1.2z"/>' +
	'<path fill="rgba(0,0,0,.14)" d="M1.5 5.55h13v.85h-13z"/>');

add('folder-open', 'folder', 'SILHOUETTE',
	'<path fill="#8F6D37" d="M1.5 4.1c0-.66.54-1.2 1.2-1.2h3.12c.34 0 .66.14.89.39l.95 1.01h4.94c.66 0 1.2.54 1.2 1.2v1h-12z"/>' +
	'<path fill="#C09553" d="M2.42 6.5h11.62c.78 0 1.35.73 1.17 1.49l-.98 3.9c-.13.54-.61.91-1.17.91H2.7c-.66 0-1.2-.54-1.2-1.2V7.7c0-.66.42-1.2.92-1.2z"/>');

// ---- write ------------------------------------------------------------------
const rows = [];
for (const ic of ICONS) {
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${ic.body}</svg>\n`;
	const p = join(OUT, ic.kind, `${ic.id}.svg`);
	writeFileSync(p, svg, 'utf8');
	rows.push([ic.id, ic.kind, ic.archetype, Buffer.byteLength(svg)]);
}
let total = 0;
for (const r of rows) { total += r[3]; console.log(r[0].padEnd(13), r[1].padEnd(7), r[2].padEnd(11), String(r[3]).padStart(5)); }
console.log('--- files:', rows.length, 'total bytes:', total, 'max:', Math.max(...rows.map(r => r[3])));
