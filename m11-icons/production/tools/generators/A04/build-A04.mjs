#!/usr/bin/env node
// build-A04.mjs — author the 84 long-tail icons of slice A04 (M11, D20 amendment 2).
//
//   node build-A04.mjs            # writes production/svg/file/<id>.svg
//   node build-A04.mjs --dry      # prints the roster + metrics, writes nothing
//
// Every typographic letter goes through production/tools/letterpath.mjs (Inter Bold
// outlines); everything else is hand-drawn geometry on the 16 grid. All multi-subpath
// marks are wound consistently (clockwise = ink, counter-clockwise = knock-out) so the
// default nonzero rule unions overlaps instead of cancelling them (spec R11).

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { letterPath } from '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/tools/letterpath.mjs';

const OUT = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/svg/file';
const DRY = process.argv.includes('--dry');
const METRICS = [];

// ---- number / path helpers --------------------------------------------------

const F = (n) => {
	let s = (+n).toFixed(2);
	if (s.includes('.')) { s = s.replace(/0+$/, '').replace(/\.$/, ''); }
	if (s === '-0') { s = '0'; }
	return s.replace(/^(-?)0\./, '$1.');
};
const N = (...xs) => xs.map(F).join(' ');

/** shoelace; > 0 means clockwise on screen (y grows downward) */
const area2 = (pts) => pts.reduce((a, [x, y], i) => {
	const [nx, ny] = pts[(i + 1) % pts.length];
	return a + x * ny - nx * y;
}, 0);

const orient = (pts, cw) => (area2(pts) > 0) === cw ? pts : [...pts].reverse();

const poly = (pts, cw = true) =>
	orient(pts, cw).map(([x, y], i) => `${i ? 'L' : 'M'}${N(x, y)}`).join('') + 'Z';
const polyH = (pts) => poly(pts, false);

const rect = (x, y, w, h) => poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]]);
const rectH = (x, y, w, h) => polyH([[x, y], [x + w, y], [x + w, y + h], [x, y + h]]);

function rrect(x, y, w, h, r, cw = true) {
	const s = cw ? 1 : 0;
	return cw
		? `M${N(x + r, y)}h${F(w - 2 * r)}a${F(r)} ${F(r)} 0 0 ${s} ${F(r)} ${F(r)}`
		+ `v${F(h - 2 * r)}a${F(r)} ${F(r)} 0 0 ${s} ${F(-r)} ${F(r)}`
		+ `h${F(-(w - 2 * r))}a${F(r)} ${F(r)} 0 0 ${s} ${F(-r)} ${F(-r)}`
		+ `v${F(-(h - 2 * r))}a${F(r)} ${F(r)} 0 0 ${s} ${F(r)} ${F(-r)}Z`
		: `M${N(x + r, y)}a${F(r)} ${F(r)} 0 0 ${s} ${F(-r)} ${F(r)}`
		+ `v${F(h - 2 * r)}a${F(r)} ${F(r)} 0 0 ${s} ${F(r)} ${F(r)}`
		+ `h${F(w - 2 * r)}a${F(r)} ${F(r)} 0 0 ${s} ${F(r)} ${F(-r)}`
		+ `v${F(-(h - 2 * r))}a${F(r)} ${F(r)} 0 0 ${s} ${F(-r)} ${F(-r)}Z`;
}
const rrectH = (x, y, w, h, r) => rrect(x, y, w, h, r, false);

const circ = (cx, cy, r, cw = true) =>
	`M${N(cx - r, cy)}a${F(r)} ${F(r)} 0 1 ${cw ? 1 : 0} ${F(2 * r)} 0`
	+ `a${F(r)} ${F(r)} 0 1 ${cw ? 1 : 0} ${F(-2 * r)} 0Z`;
const circH = (cx, cy, r) => circ(cx, cy, r, false);

const ellip = (cx, cy, rx, ry, cw = true) =>
	`M${N(cx - rx, cy)}a${F(rx)} ${F(ry)} 0 1 ${cw ? 1 : 0} ${F(2 * rx)} 0`
	+ `a${F(rx)} ${F(ry)} 0 1 ${cw ? 1 : 0} ${F(-2 * rx)} 0Z`;

/** a thick straight segment from (x1,y1) to (x2,y2) */
function seg(x1, y1, x2, y2, h1, h2 = h1, cw = true) {
	const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
	const nx = -dy / len, ny = dx / len;
	return poly([
		[x1 + nx * h1, y1 + ny * h1], [x2 + nx * h2, y2 + ny * h2],
		[x2 - nx * h2, y2 - ny * h2], [x1 - nx * h1, y1 - ny * h1]
	], cw);
}
const segH = (x1, y1, x2, y2, h1, h2 = h1) => seg(x1, y1, x2, y2, h1, h2, false);

/** n-pointed star, alternating outer / inner radius */
function star(cx, cy, n, rOut, rIn, rot = -Math.PI / 2, cw = true) {
	const pts = [];
	for (let i = 0; i < n * 2; i++) {
		const a = rot + i * Math.PI / n;
		const r = i % 2 ? rIn : rOut;
		pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
	}
	return poly(pts, cw);
}
const starH = (cx, cy, n, rOut, rIn, rot) => star(cx, cy, n, rOut, rIn, rot, false);

/** horizontal wave ribbon of constant vertical thickness (drawn clockwise) */
function wave(x0, x1, y, amp, thick, segs) {
	const step = (x1 - x0) / segs;
	const ctrl = [];
	for (let i = 0; i < segs; i++) {
		ctrl.push([x0 + i * step + step / 2, y + (i % 2 ? amp : -amp) * 2, x0 + (i + 1) * step]);
	}
	let d = `M${N(x0, y)}`;
	for (const [cx, cy, x] of ctrl) { d += `Q${N(cx, cy)} ${N(x, y)}`; }
	d += `L${N(x1, y + thick)}`;
	for (let i = ctrl.length - 1; i >= 0; i--) {
		const px = i === 0 ? x0 : ctrl[i - 1][2];
		d += `Q${N(ctrl[i][0], ctrl[i][1] + thick)} ${N(px, y + thick)}`;
	}
	return d + 'Z';
}

const path = (fill, d) => `<path fill="${fill}" d="${d}"/>`;

// ---- letters ----------------------------------------------------------------

const LAW1 = (inkH) => 15 - 0.41 * (14 - inkH) - inkH / 2;   // badge ink centre (§5 law 1)

/** size letters so the ink width lands on target (R5), then place them 41 % low */
function badgeLetters(text, targetW, fill, letterSpacing) {
	let lo = 2.5, hi = 9.5, cap = 5.5, r;
	for (let i = 0; i < 40; i++) {
		cap = (lo + hi) / 2;
		r = letterPath({ text, cap, cx: 8, cy: 8, band: 'ink', letterSpacing });
		if (r.ink.w > targetW) { hi = cap; } else { lo = cap; }
	}
	r = letterPath({ text, cap, cx: 8, cy: LAW1(r.ink.h), band: 'ink', letterSpacing });
	return { el: path(fill, r.d), cap, ink: r.ink };
}

function badgePlaced(opts, fill) {
	let r = letterPath({ ...opts, cx: 8, cy: 8, band: 'ink' });
	r = letterPath({ ...opts, cx: 8, cy: LAW1(r.ink.h), band: 'ink' });
	return { el: path(fill, r.d), cap: opts.cap, ink: r.ink };
}

const PLATE = (fill) => `<rect x="1" y="1" width="14" height="14" rx="3" fill="${fill}"/>`;

function badge(fill, text, opts = {}) {
	const lf = opts.letterFill || '#FFFFFF';
	let g;
	if (opts.lower) { g = badgePlaced({ text, inkHeight: opts.inkHeight, letterSpacing: opts.letterSpacing || 0 }, lf); }
	else if (text.length === 1) { g = badgePlaced({ text, cap: opts.cap || 7 }, lf); }
	else {
		g = badgeLetters(text, opts.targetW || (text.length === 2 ? 9.4 : 11.0), lf,
			opts.letterSpacing === undefined ? (text.length >= 3 ? -0.02 : 0) : opts.letterSpacing);
	}
	METRICS.push(`${(opts.id || text).padEnd(20)} "${text}"  ink ${g.ink.w} x ${g.ink.h}`
		+ `  cap ${g.cap ? (+g.cap).toFixed(2) : '(ink-height)'}  baseline-band ${g.ink.y2}`);
	return PLATE(fill) + g.el;
}

// ---- the roster -------------------------------------------------------------

const R = [];
const add = (id, archetype, fill, source, body) => R.push({ id, archetype, fill, source, body });

/* ================================================================== BADGES == */

add('jinja', 'BADGE', '#B0483C', 'no brand → jinja red #B0483C',
	badge('#B0483C', 'J2', { id: 'jinja' }));
add('jsp', 'BADGE', '#B87A26', 'java family amber → #B87A26',
	badge('#B87A26', 'JSP', { id: 'jsp' }));
add('jss', 'BADGE', '#C46FA8', 'no brand → #C46FA8',
	badge('#C46FA8', 'JSS', { id: 'jss' }));
add('just', 'BADGE', '#6FB56C', 'no brand → #6FB56C',
	badge('#6FB56C', 'J', { id: 'just' }));
add('k', 'BADGE', '#9B8B4A', 'no brand → #9B8B4A',
	badge('#9B8B4A', 'K', { id: 'k' }));
add('kcl', 'BADGE', '#A64A78', 'no brand → #A64A78',
	badge('#A64A78', 'KCL', { id: 'kcl' }));
add('kl', 'BADGE', '#7E8894', 'no brand → neutral #7E8894',
	badge('#7E8894', 'KL', { id: 'kl' }));
add('kusto', 'BADGE', '#3A6FB8', 'azure data explorer blue → #3A6FB8',
	badge('#3A6FB8', 'KQL', { id: 'kusto' }));
add('latex', 'BADGE', '#61BAB5', 'tex family teal (core tex #59C0C0) → #61BAB5',
	badge('#61BAB5', 'TEX', { id: 'latex' }));
add('latex-class', 'BADGE', '#61BAB5', 'tex family teal → #61BAB5',
	badge('#61BAB5', 'CLS', { id: 'latex-class' }));
add('latex-package', 'BADGE', '#61BAB5', 'tex family teal → #61BAB5',
	badge('#61BAB5', 'STY', { id: 'latex-package' }));
add('lbx', 'BADGE', '#61BAB5', 'tex family teal → #61BAB5',
	badge('#61BAB5', 'LBX', { id: 'lbx' }));
add('latino', 'BADGE', '#BE6FC8', 'no brand → #BE6FC8',
	badge('#BE6FC8', 'LAT', { id: 'latino' }));
add('less', 'BADGE', '#2F4E7E', 'brand #1D365D lifted → #2F4E7E',
	badge('#2F4E7E', 'L', { id: 'less' }));
add('lex', 'BADGE', '#6E9E3E', 'no brand → #6E9E3E',
	badge('#6E9E3E', 'LEX', { id: 'lex' }));
add('lit', 'BADGE', '#5E97DC', 'lit blue → #5E97DC',
	badge('#5E97DC', 'lit', { id: 'lit', lower: true, inkHeight: 6.8, letterSpacing: 0.12 }));
add('livescript', 'BADGE', '#6E8090', 'no brand → neutral #6E8090',
	badge('#6E8090', 'LS', { id: 'livescript' }));
add('lsl', 'BADGE', '#98A0A8', 'no brand → neutral #98A0A8',
	badge('#98A0A8', 'LSL', { id: 'lsl', letterFill: '#25292E' }));
add('macaulay2', 'BADGE', '#7A4890', 'no brand → #7A4890',
	badge('#7A4890', 'M2', { id: 'macaulay2', targetW: 9.8 }));
add('maya', 'BADGE', '#2F8C74', 'no brand → #2F8C74',
	badge('#2F8C74', 'MEL', { id: 'maya' }));
add('mdsvex', 'BADGE', '#B85E2E', 'svelte family orange → #B85E2E',
	badge('#B85E2E', 'SVX', { id: 'mdsvex' }));
add('mediawiki', 'BADGE', '#C8C664', 'no brand → wiki olive #C8C664',
	badge('#C8C664', 'W', { id: 'mediawiki', letterFill: '#2B2D1F' }));
add('mercurial', 'BADGE', '#6E8AA8', 'no brand → mercury blue-grey #6E8AA8',
	badge('#6E8AA8', 'HG', { id: 'mercurial' }));
add('mivascript', 'BADGE', '#86909C', 'no brand → neutral #86909C',
	badge('#86909C', 'MIV', { id: 'mivascript' }));
add('modernizr', 'BADGE', '#6E4462', 'no brand → #6E4462',
	badge('#6E4462', 'MZ', { id: 'modernizr' }));
add('modernjs', 'BADGE', '#534CB8', 'no brand → #534CB8',
	badge('#534CB8', 'MJ', { id: 'modernjs' }));

/* ================================================================== GLYPHS == */

// mojo — the 🔥 mark, hollowed so it does not repeat the firebase flame (R8)
add('mojo', 'GLYPH', '#DE6B3C', 'mojo fire orange → #DE6B3C', path('#DE6B3C',
	'M8 1.5C9.2 4.6 12.6 6.2 12.6 9.4 12.6 12.2 10.5 14.4 8 14.4 5.5 14.4 3.4 12.2 3.4 9.4'
	+ ' 3.4 7.7 4.2 6.4 5.3 5.4 5.2 6.9 5.7 7.9 6.5 8.4 7.4 6.8 8.2 4.4 8 1.5Z'
	+ 'M8 6.2C6.8 7.9 5.4 8.7 5.4 10.2 5.4 11.6 6.6 12.8 8 12.8 9.4 12.8 10.6 11.6 10.6 10.2'
	+ ' 10.6 8.7 9.2 7.9 8 6.2Z'));

// lilypond — beamed eighth notes
add('lilypond', 'GLYPH', '#CFC3A8', 'no brand → parchment #CFC3A8', path('#CFC3A8',
	ellip(4.35, 11.5, 1.75, 1.3) + ellip(10.75, 11.5, 1.75, 1.3)
	+ rect(5.5, 4.2, 1.25, 7.3) + rect(11.9, 4.2, 1.25, 7.3) + rect(5.5, 4.2, 7.65, 1.7)));

// mlang — the Power Query "M", bare
(() => {
	const r = letterPath({ text: 'M', cap: 9.2, cx: 8, cy: 8, band: 'ink' });
	METRICS.push(`${'mlang'.padEnd(20)} "M"  ink ${r.ink.w} x ${r.ink.h}  cap 9.20 (glyph, centred)`);
	add('mlang', 'GLYPH', '#BCAA72', 'power query brass → #BCAA72', path('#BCAA72', r.d));
})();

// jsonnet — the json brace family, in green (R3 brace family: json / json5 / jsonnet)
add('jsonnet', 'GLYPH', '#5FC46E', 'json family form, green → #5FC46E', path('#5FC46E',
	'M6.8 2.1C5.45 2.1 4.7 2.85 4.7 4.2V6.15C4.7 6.85 4.15 7.25 3.2 7.25V8.95C4.15 8.95 4.7 9.35'
	+ ' 4.7 10.05V12C4.7 13.35 5.45 14.1 6.8 14.1V12.4C6.6 12.4 6.4 12.25 6.4 12V10.05C6.4 9.1 6 8.45'
	+ ' 5.25 8.1 6 7.75 6.4 7.1 6.4 6.15V4.2C6.4 3.95 6.6 3.8 6.8 3.8Z'
	+ 'M9.2 2.1C10.55 2.1 11.3 2.85 11.3 4.2V6.15C11.3 6.85 11.85 7.25 12.8 7.25V8.95C11.85 8.95 11.3 9.35'
	+ ' 11.3 10.05V12C11.3 13.35 10.55 14.1 9.2 14.1V12.4C9.4 12.4 9.6 12.25 9.6 12V10.05C9.6 9.1 10 8.45'
	+ ' 10.75 8.1 10 7.75 9.6 7.1 9.6 6.15V4.2C9.6 3.95 9.4 3.8 9.2 3.8Z'));

// moleculer — a molecule
add('moleculer', 'GLYPH', '#4FA36E', 'no brand → #4FA36E', path('#4FA36E',
	seg(8, 7.7, 3.6, 4.5, 0.72) + seg(8, 7.7, 12.4, 4.5, 0.72) + seg(8, 7.7, 8, 12.9, 0.72)
	+ circ(8, 7.7, 2.15) + circ(3.6, 4.5, 1.55) + circ(12.4, 4.5, 1.55) + circ(8, 12.9, 1.55)));

// lisp — lambda, drawn as geometry (R1)
add('lisp', 'GLYPH', '#46A98A', 'brand #3FB68B matted → #46A98A', path('#46A98A',
	seg(5.5, 2.7, 11.5, 13.2, 0.98) + seg(7.55, 6.9, 3.9, 13.2, 0.92)));

// latexmk — the rebuild loop
add('latexmk', 'GLYPH', '#61BAB5', 'tex family teal → #61BAB5', path('#61BAB5',
	'M8 3.1A4.9 4.9 0 1 0 12.9 8h-1.5A3.4 3.4 0 1 1 8 4.6Z'
	+ poly([[7.8, 1.85], [11.15, 3.85], [7.8, 5.85]])));

// lean — the ∀ of the theorem prover, drawn as geometry (R1)
add('lean', 'GLYPH', '#A87FC0', 'no brand → #A87FC0', path('#A87FC0',
	seg(4.2, 2.6, 8, 13.2, 0.95) + seg(11.8, 2.6, 8, 13.2, 0.95) + rect(5.2, 5.5, 5.6, 1.75)));

// leanconfig — lake (Lean's build tool) as water; family rhyme with lean
add('leanconfig', 'GLYPH', '#9878B8', 'lean family violet → #9878B8', path('#9878B8',
	wave(2, 14, 4.4, 0.7, 1.35, 4) + wave(2, 14, 8, 0.7, 1.35, 4) + wave(2, 14, 11.6, 0.7, 1.35, 4)));

// mojolicious — the rainbow
add('mojolicious', 'GLYPH', '#7E8FD0', 'no brand → #7E8FD0', path('#7E8FD0',
	'M1.4 13.2A6.6 6.6 0 0 1 14.6 13.2H13.4A5.4 5.4 0 0 0 2.6 13.2Z'
	+ 'M3.2 13.2A4.8 4.8 0 0 1 12.8 13.2H11.6A3.6 3.6 0 0 0 4.4 13.2Z'
	+ 'M5 13.2A3 3 0 0 1 11 13.2H9.8A1.8 1.8 0 0 0 6.2 13.2Z'));

// lnk — the shortcut arrow
add('lnk', 'GLYPH', '#93A0AE', 'no brand → neutral #93A0AE', path('#93A0AE',
	'M2.6 13.6C3.1 7.9 6.8 4.3 12.2 4V5.9C7.8 6.2 4.9 9.2 4.5 13.6Z'
	+ poly([[10.6, 2.1], [14.2, 4.95], [10.6, 7.8]])));

/* ============================================================= SILHOUETTES == */

// jsbeautify — a brush
add('jsbeautify', 'SILHOUETTE', '#BE9068', 'no brand → #BE9068', path('#BE9068',
	seg(13.4, 2.7, 9.2, 6.9, 0.95) + seg(9.4, 6.7, 7.4, 8.7, 1.55)
	+ seg(7.6, 8.5, 3.2, 12.9, 1.5, 0.8)));

// jscpd — a copy: a sheet behind a sheet
add('jscpd', 'SILHOUETTE', '#8F86C0', 'no brand → #8F86C0', path('#8F86C0',
	rrect(1.6, 1.6, 8.6, 10.2, 1) + rrectH(2.9, 2.9, 6, 7.6, .55) + rrect(5.4, 4.6, 8.8, 9.8, 1)));

// jsmap / map — the folded map (R3 family: source maps)
const foldedMap = (fill) => path(fill,
	poly([[1.5, 3.7], [5.1, 2.4], [5.1, 11.7], [1.5, 13.2]])
	+ poly([[5.8, 2.5], [10.2, 4.2], [10.2, 13.5], [5.8, 11.8]])
	+ poly([[10.9, 4.25], [14.5, 2.75], [14.5, 12], [10.9, 13.6]]));
add('jsmap', 'SILHOUETTE', '#D8C05A', 'js gold, map family → #D8C05A', foldedMap('#D8C05A'));
add('map', 'SILHOUETTE', '#93A0AE', 'no brand → neutral #93A0AE, map family', foldedMap('#93A0AE'));

// juice — a glass with a straw
add('juice', 'SILHOUETTE', '#C2565E', 'no brand → #C2565E', path('#C2565E',
	seg(9.4, 6.4, 13.1, 1.7, 0.72) + poly([[3.9, 5.1], [12.1, 5.1], [11, 14.3], [5, 14.3]])));

// karma — what goes around comes around
(() => {
	let d = circ(8, 8, 6) + circH(8, 8, 4.65);
	for (let i = 0; i < 8; i++) {
		const a = i * Math.PI / 4;
		d += seg(8, 8, 8 + 4.8 * Math.cos(a), 8 + 4.8 * Math.sin(a), 0.5);
	}
	d += circ(8, 8, 1.75);
	add('karma', 'SILHOUETTE', '#4CA890', 'no brand → #4CA890', path('#4CA890', d));
})();

// keystone — the arch's keystone block
add('keystone', 'SILHOUETTE', '#4AA396', 'no brand → #4AA396', path('#4AA396',
	'M2.2 13.7V8.4a5.8 5.8 0 0 1 11.6 0v5.3h-3V8.4a2.8 2.8 0 0 0-5.6 0v5.3Z'
	+ segH(6.95, 6, 5.75, 2.9, .44) + segH(9.05, 6, 10.25, 2.9, .44)));

// kivy — the angular K of the logo, drawn as geometry (R1)
add('kivy', 'SILHOUETTE', '#7EA07A', 'no brand → #7EA07A', path('#7EA07A',
	rect(3.2, 2.6, 2.3, 10.8) + seg(5.3, 8.35, 12, 2.9, 1.15) + seg(5.3, 8.35, 12.4, 13.2, 1.15)));

// knex — the query funnel
add('knex', 'SILHOUETTE', '#C4823C', 'no brand → #C4823C', path('#C4823C',
	poly([[2.4, 2.9], [13.6, 2.9], [9.1, 8.7], [9.1, 13.4], [6.9, 13.4], [6.9, 8.7]])));

// knip — the scissors
add('knip', 'SILHOUETTE', '#9AA8B4', 'no brand → neutral #9AA8B4', path('#9AA8B4',
	seg(4.5, 1.8, 9.8, 10.3, 0.92, 0.5) + seg(11.5, 1.8, 6.2, 10.3, 0.92, 0.5)
	+ circ(5.2, 12, 2.2) + circH(5.2, 12, 1) + circ(10.8, 12, 2.2) + circH(10.8, 12, 1)));

// kos — the Kerbal rocket
add('kos', 'SILHOUETTE', '#8FA6C4', 'no brand → #8FA6C4', path('#8FA6C4',
	'M8 1.3C9.75 3.1 10.6 5.6 10.6 8.4V11.5H5.4V8.4C5.4 5.6 6.25 3.1 8 1.3Z'
	+ poly([[5.4, 8.1], [5.4, 12.1], [3.1, 13.5], [3.1, 11.3]])
	+ poly([[10.6, 8.1], [10.6, 12.1], [12.9, 13.5], [12.9, 11.3]])
	+ circH(8, 6.1, 1.2)));

// label — the tag
add('label', 'SILHOUETTE', '#4FA0B8', 'no brand → #4FA0B8', path('#4FA0B8',
	'M6.3 2.6H13a1.4 1.4 0 0 1 1.4 1.4V12a1.4 1.4 0 0 1-1.4 1.4H6.3L1.9 8.85a1.2 1.2 0 0 1 0-1.7Z'
	+ circH(7.5, 8, 1.15)));

// laravel — the angular V
add('laravel', 'SILHOUETTE', '#E04A3C', 'brand #FF2D20 matted → #E04A3C', path('#E04A3C',
	poly([[1.9, 2.5], [5.1, 2.5], [8, 8.6], [10.9, 2.5], [14.1, 2.5], [9.3, 13.5], [6.7, 13.5]])));

// lark — the bird
add('lark', 'SILHOUETTE', '#7FA6CE', 'no brand → #7FA6CE', path('#7FA6CE',
	circ(10.4, 4.9, 2.35) + poly([[12.3, 3.9], [15, 5, ], [12.3, 6.1]]) + circH(11, 4.4, .62)
	+ 'M11.5 6.9C11.5 9.9 9.2 12.3 6.3 12.75L1.8 13.8 4.3 10.6C4.6 8 6.8 6 9.4 6Z'));

// lefthook — the hook
add('lefthook', 'SILHOUETTE', '#C25A62', 'no brand → #C25A62', path('#C25A62',
	'M9.5 1.7h2.6v7.4a4.3 4.3 0 1 1-8.6 0V7.3l1.15-2.9 1.15 2.9v1.8a1.85 1.85 0 1 0 3.7 0Z'));

// lemon — the parser generator, as the fruit the source themes draw
add('lemon', 'SILHOUETTE', '#D8C24E', 'no brand → lemon #D8C24E', path('#D8C24E',
	'M1.2 9.7C1.2 9.05 1.6 8.6 2.25 8.4 3.3 6.95 5.45 6.05 8 6.05s4.7.9 5.75 2.35c.65.2 1.05.65 1.05 1.3'
	+ 's-.4 1.1-1.05 1.3C12.7 12.45 10.55 13.35 8 13.35s-4.7-.9-5.75-2.35C1.6 10.8 1.2 10.35 1.2 9.7Z'
	+ 'M8.5 5.85C8.5 4.2 9.7 2.95 11.4 2.75 11.4 4.4 10.2 5.65 8.5 5.85Z'));

// libreoffice-base — the record cabinet
add('libreoffice-base', 'SILHOUETTE', '#8A62B0', 'LibreOffice module palette → #8A62B0', path('#8A62B0',
	rrect(3.4, 2, 9.2, 12, 1.1)
	+ rectH(3.4, 5.75, 9.2, .8) + rectH(3.4, 9.45, 9.2, .8)
	+ rectH(6.9, 3.5, 2.2, .95) + rectH(6.9, 7.25, 2.2, .95) + rectH(6.9, 11, 2.2, .95)));

// libreoffice-draw — the shapes
add('libreoffice-draw', 'SILHOUETTE', '#C9A33E', 'LibreOffice module palette → #C9A33E', path('#C9A33E',
	poly([[5.6, 1.6], [9.7, 7.6], [1.5, 7.6]]) + circ(11.3, 5.1, 3.1) + rect(1.5, 9.2, 5.4, 5.2)
	+ rrect(8.6, 9.6, 5.4, 4.4, .6)));

// libreoffice-impress — the slide
add('libreoffice-impress', 'SILHOUETTE', '#D08344', 'LibreOffice module palette → #D08344', path('#D08344',
	rrect(1.5, 3.2, 13, 9.6, 1.2) + polyH([[6.5, 5.6], [11, 8], [6.5, 10.4]])));

// lighthouse — the tower
add('lighthouse', 'SILHOUETTE', '#DE9048', 'lighthouse orange → #DE9048', path('#DE9048',
	poly([[6.05, 5.4], [9.95, 5.4], [11.1, 13.2], [4.9, 13.2]])
	+ rect(3.9, 13.2, 8.2, 1.4)
	+ rect(6.35, 3.2, 3.3, 2.2) + poly([[5.85, 3.3], [10.15, 3.3], [8, 1.2]])
	+ poly([[2.4, 2.9], [5.5, 4.25], [2.4, 5.6]]) + poly([[13.6, 2.9], [10.5, 4.25], [13.6, 5.6]])
	+ rectH(5.52, 8.2, 4.96, 1.05)));

// lime — the citrus wedge
(() => {
	const ax = 3, ay = 12.7, R = 10.3, a0 = -86 * Math.PI / 180, a1 = 4 * Math.PI / 180;
	const P = (r, a) => [ax + r * Math.cos(a), ay + r * Math.sin(a)];
	const arc = (r, from, to, sweep) => `A${F(r)} ${F(r)} 0 0 ${sweep} ${N(...P(r, to))}`;
	let d = `M${N(ax, ay)}L${N(...P(R, a0))}${arc(R, a0, a1, 1)}Z`;
	// rind seam
	d += `M${N(...P(8.6, a1))}${arc(8.6, a1, a0, 0)}L${N(...P(9.4, a0))}${arc(9.4, a0, a1, 1)}Z`;
	// segment seams
	for (const k of [1, 2]) {
		const a = a0 + (a1 - a0) * k / 3;
		d += segH(ax + 1.9 * Math.cos(a), ay + 1.9 * Math.sin(a), ...P(8.55, a), 0.42);
	}
	add('lime', 'SILHOUETTE', '#8FBF4E', 'no brand → lime #8FBF4E', path('#8FBF4E', d));
})();

// liquid — the drop
add('liquid', 'SILHOUETTE', '#6FAE5A', 'shopify liquid green → #6FAE5A', path('#6FAE5A',
	'M8 1.5C10.9 5.4 12.6 7.9 12.6 10.2A4.6 4.6 0 0 1 3.4 10.2C3.4 7.9 5.1 5.4 8 1.5Z'));

// locale — the globe grid
add('locale', 'SILHOUETTE', '#5FA0C0', 'no brand → #5FA0C0', path('#5FA0C0',
	circ(8, 8, 6) + rectH(1.6, 5.2, 12.8, .95) + rectH(1.6, 9.85, 12.8, .95)
	+ rectH(7.5, 1.6, 1, 3.6) + rectH(7.5, 6.15, 1, 3.7) + rectH(7.5, 10.8, 1, 3.6)));

// lolcode — the lolcat
add('lolcode', 'SILHOUETTE', '#D0A05A', 'no brand → #D0A05A', path('#D0A05A',
	'M8 4.5C11.05 4.5 13.45 6.75 13.45 9.35S11.05 14.2 8 14.2 2.55 11.95 2.55 9.35 4.95 4.5 8 4.5Z'
	+ poly([[3, 2.2], [6.6, 5.15], [3, 6.9]]) + poly([[13, 2.2], [9.4, 5.15], [13, 6.9]])
	+ circH(6.1, 9, .92) + circH(9.9, 9, .92) + polyH([[6.9, 11.1], [9.1, 11.1], [8, 12.4]])));

// luau — the lua orb (R3 family: lua / luau)
add('luau', 'SILHOUETTE', '#4A9ED8', 'lua family form, luau blue → #4A9ED8', path('#4A9ED8',
	circ(7.1, 9, 5.4) + circH(9.6, 6.4, 1.2) + circ(12.9, 3.6, 2)));

// lync — the recorded call
add('lync', 'SILHOUETTE', '#4A8FC8', 'no brand → #4A8FC8', path('#4A8FC8',
	rrect(1.7, 2.5, 12.6, 9.1, 2.3) + poly([[4.5, 10.4], [8.4, 10.4], [4.5, 14.5]])
	+ circH(8, 7.05, 2.6) + circ(8, 7.05, 1.35)));

// lyric — the microphone
add('lyric', 'SILHOUETTE', '#B98BC4', 'no brand → #B98BC4', path('#B98BC4',
	rrect(5.95, 1.3, 4.1, 7.3, 2.05)
	+ 'M12.4 7.5v.4a4.4 4.4 0 0 1-8.8 0v-.4h1.9v.4a2.5 2.5 0 0 0 5 0v-.4Z'
	+ rect(7.15, 11.9, 1.7, 1.7) + rrect(4.8, 13.4, 6.4, 1.3, .55)));

// manifest-bak / manifest-skip — the manifest card, marked
const manifestCard = (fill, marker) => path(fill,
	rrect(2.3, 1.9, 11.4, 12.2, 1.3)
	+ rectH(4.1, 4.1, 7.8, 1.05) + rectH(4.1, 6.15, 7.8, 1.05) + marker);
add('manifest-bak', 'SILHOUETTE', '#808C98', 'no brand → neutral #808C98, manifest family',
	manifestCard('#808C98', polyH([
		[10.6, 8.8], [9.05, 8.8], [5.6, 11.35], [9.05, 13.9], [10.6, 13.9], [7.15, 11.35]])));
add('manifest-skip', 'SILHOUETTE', '#808C98', 'no brand → neutral #808C98, manifest family',
	manifestCard('#808C98', segH(4.6, 13.4, 11.4, 8.6, 0.85)));

// marko / markojs — the angular M (R3 family: one concept, two source ids)
const markoM = (fill) => path(fill,
	poly([[1.8, 13.4], [1.8, 3], [4.2, 3], [8, 8.9], [11.8, 3], [14.2, 3], [14.2, 13.4],
		[11.6, 13.4], [11.6, 7.9], [8, 12.9], [4.4, 7.9], [4.4, 13.4]]));
add('marko', 'SILHOUETTE', '#3E8FC0', 'no brand → marko blue #3E8FC0', markoM('#3E8FC0'));
add('markojs', 'SILHOUETTE', '#3E8FC0', 'marko family (same concept) → #3E8FC0', markoM('#3E8FC0'));

// master-co — the crown
add('master-co', 'SILHOUETTE', '#C9A03E', 'no brand → #C9A03E', path('#C9A03E',
	poly([[1.8, 4.2], [5.1, 7.6], [8, 3.1], [10.9, 7.6], [14.2, 4.2], [14.2, 13.7], [1.8, 13.7]])
	+ rectH(1.8, 11.3, 12.4, .95)));

// mathematica — the Wolfram spikey
add('mathematica', 'SILHOUETTE', '#C24A38', 'wolfram red #DD1100 matted → #C24A38',
	path('#C24A38', star(8, 8, 11, 6.4, 3.5)));

// maxscript — the 3D teapot
add('maxscript', 'SILHOUETTE', '#7CACB6', 'no brand → #7CACB6', path('#7CACB6',
	'M3.5 8.8c0-1.9 2-3.2 4.5-3.2s4.5 1.3 4.5 3.2c0 3.1-2 5.2-4.5 5.2S3.5 11.9 3.5 8.8Z'
	+ circ(8, 3.9, 1.15) + rect(7.15, 4.6, 1.7, 1.3)
	+ poly([[4.6, 7.2], [1.1, 5], [1.1, 7], [4.1, 9.1]])
	+ 'M12.1 8.4a2.65 2.65 0 0 1 0 5.3v-1.6a1.05 1.05 0 0 0 0-2.1Z'));

// mdx-components — the component puzzle piece
add('mdx-components', 'SILHOUETTE', '#7A52C8', 'mdx family violet → #7A52C8', path('#7A52C8',
	'M2.2 2.9h4.1a1.75 1.75 0 0 1 3.5 0h4.1v4.05a1.75 1.75 0 0 0 0 3.5v3.65H2.2v-4.1'
	+ 'a1.75 1.75 0 0 0 0-3.5Z'));

// merlin — the wizard hat
add('merlin', 'SILHOUETTE', '#C08A3E', 'ocaml family amber → #C08A3E', path('#C08A3E',
	'M7.4 1.6C8.9 4.4 10.6 8 11.7 10.5H4.3C5.4 7.5 6.4 4.4 7.4 1.6Z'
	+ 'M2.6 10.5h10.8c0 1.7-2.4 3-5.4 3s-5.4-1.3-5.4-3Z'
	+ starH(8.15, 7.6, 4, 1.55, .55)));

// meson — the anvil
add('meson', 'SILHOUETTE', '#7E8C9A', 'no brand → neutral #7E8C9A', path('#7E8C9A',
	'M2 4.4h8.8L14.4 6.1 10.8 7.8H9.5v3.2h2.3v2.6H4.2v-2.6h2.3V7.8H3.6C2.5 7.8 2 6.3 2 4.4Z'));

// metal — the GPU die
add('metal', 'SILHOUETTE', '#8C98A8', 'no brand → neutral #8C98A8', path('#8C98A8',
	rrect(4.1, 4.1, 7.8, 7.8, 1) + rrectH(6.2, 6.2, 3.6, 3.6, .6)
	+ rect(1.7, 5.2, 2.4, 1.15) + rect(1.7, 7.4, 2.4, 1.15) + rect(1.7, 9.6, 2.4, 1.15)
	+ rect(11.9, 5.2, 2.4, 1.15) + rect(11.9, 7.4, 2.4, 1.15) + rect(11.9, 9.6, 2.4, 1.15)
	+ rect(5.2, 1.7, 1.15, 2.4) + rect(7.4, 1.7, 1.15, 2.4) + rect(9.6, 1.7, 1.15, 2.4)
	+ rect(5.2, 11.9, 1.15, 2.4) + rect(7.4, 11.9, 1.15, 2.4) + rect(9.6, 11.9, 1.15, 2.4)));

// metro — the train
add('metro', 'SILHOUETTE', '#B85E4E', 'no brand → #B85E4E', path('#B85E4E',
	'M3.2 6.2C3.2 3.7 5.3 2.2 8 2.2s4.8 1.5 4.8 4v6H3.2Z'
	+ rrectH(4.4, 5.2, 2.9, 2.7, .5) + rrectH(8.7, 5.2, 2.9, 2.7, .5)
	+ rrectH(5.3, 9.4, 5.4, 1.25, .6)
	+ rrect(4.3, 12.2, 2.5, 1.6, .6) + rrect(9.2, 12.2, 2.5, 1.6, .6)));

// minecraft — the creeper
add('minecraft', 'SILHOUETTE', '#6FA05B', 'minecraft creeper green → #6FA05B', path('#6FA05B',
	rect(2.6, 2.6, 10.8, 10.8)
	+ rectH(4.5, 5.4, 2.6, 2.6) + rectH(8.9, 5.4, 2.6, 2.6)
	+ rectH(6.4, 8.6, 3.2, 1.6) + rectH(5.4, 10.2, 1.6, 2.4) + rectH(9, 10.2, 1.6, 2.4)));

// mint — the sprig
add('mint', 'SILHOUETTE', '#5FB08A', 'no brand → mint #5FB08A', path('#5FB08A',
	'M7.3 14.1V8.6C7.3 7.3 7.5 6.2 8 5.1l1.35.5C8.9 6.6 8.75 7.5 8.75 8.6v5.5Z'
	+ 'M7.8 9.4C5.4 9.9 2.9 8.3 2.1 5.6 4.7 5 7 6.5 7.8 9.4Z'
	+ 'M8.4 9.4C9.2 6.5 11.5 5 14.1 5.6 13.3 8.3 10.8 9.9 8.4 9.4Z'
	+ 'M8.05 6.5C6.85 4.8 7.1 2.6 8.05 1.4 9 2.6 9.25 4.8 8.05 6.5Z'));

// mist — the cloud
add('mist', 'SILHOUETTE', '#A6AEB6', 'no brand → neutral #A6AEB6', path('#A6AEB6',
	circ(5.4, 9.4, 2.8) + circ(8.6, 7.8, 3.6) + circ(11.4, 9.6, 2.6) + rect(5, 9.4, 7.4, 3)));

// mjml — the envelope
add('mjml', 'SILHOUETTE', '#DB6350', 'mjml coral → #DB6350', path('#DB6350',
	rrect(1.6, 3.4, 12.8, 9.2, 1.2)
	+ polyH([[2.3, 4], [8, 8.1], [13.7, 4], [13.7, 5.3], [8, 9.4], [2.3, 5.3]])));

// mocha — the coffee bean
add('mocha', 'SILHOUETTE', '#8D6748', 'brand #8D6748', path('#8D6748',
	'M4.32 11.68A5.2 3.4 -45 0 1 11.68 4.32 5.2 3.4 -45 0 1 4.32 11.68Z'
	+ 'M6.4 12.05C7.65 10.8 7.2 9.65 8 8.85 8.8 8.05 9.95 8.5 11.2 7.25l-.9-.9C9.05 7.6 7.9 7.15 7.1 7.95'
	+ ' 6.3 8.75 6.75 9.9 5.5 11.15Z'));

// mongo — the leaf
add('mongo', 'SILHOUETTE', '#4FA050', 'brand #47A248 matted → #4FA050', path('#4FA050',
	'M8 1.3C10.9 4.7 12.4 7.4 12.4 9.9c0 2.55-1.75 4.35-3.85 4.7l-.1.7h-.9l-.1-.7C5.35 14.25 3.6 12.45'
	+ ' 3.6 9.9 3.6 7.4 5.1 4.7 8 1.3Z' + rectH(7.55, 5.1, .9, 8.1)));

// moonscript — the moon
add('moonscript', 'SILHOUETTE', '#A6ADB8', 'no brand → neutral #A6ADB8', path('#A6ADB8',
	circ(8, 8, 6) + circH(10.7, 6.3, 5.3)));

// mrpack — the modpack
add('mrpack', 'SILHOUETTE', '#4FB06E', 'modrinth green → #4FB06E', path('#4FB06E',
	rrect(2.4, 8.6, 5.4, 5.2, .7) + rrect(8.8, 8.6, 5.4, 5.2, .7) + rrect(5.3, 2.6, 5.4, 5.2, .7)));

// ---- emit -------------------------------------------------------------------

const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${body}</svg>`;

if (!DRY) { mkdirSync(OUT, { recursive: true }); }
const seen = new Set();
let bytes = 0, max = 0, maxId = '';
for (const it of R) {
	if (seen.has(it.id)) { throw new Error(`duplicate id ${it.id}`); }
	seen.add(it.id);
	const src = svg(it.body);
	const b = Buffer.byteLength(src);
	bytes += b; if (b > max) { max = b; maxId = it.id; }
	if (!DRY) { writeFileSync(join(OUT, `${it.id}.svg`), src, 'utf8'); }
}
console.log(METRICS.join('\n'));
console.log(`\n${R.length} icons — ${bytes} bytes total, ${Math.round(bytes / R.length)} avg, ${max} max (${maxId})`);
writeFileSync(join('/private/tmp/claude-501/-Users-sebastian-suarez-Projects-VSebCode',
	'cd497411-6ae3-485b-8bfb-25848c779b0a/scratchpad', 'roster-A04.json'),
JSON.stringify(R.map(({ id, archetype, fill, source }) => ({ id, archetype, fill, source })), null, 1));
