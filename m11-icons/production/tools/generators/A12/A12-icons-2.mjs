// A12-icons-2.mjs — slice A12, doc (28) + font (3).
import * as G from './A12-lib.mjs';
import { F, SRC } from './A12-hues.mjs';
const { poly, rect, rrect, rrect4, circle, limb, stroke, xf, path, plate,
	badgeText, glyphText, n } = G;

const W = '#FFFFFF';
export const ICONS_2 = [];
const add = (id, arch, fills, body) => ICONS_2.push({ id, arch, fills, src: SRC(id), body });

const sparkle = (cx, cy, R) => {
	const q = R * 0.18;
	return `M${n(cx)} ${n(cy - R)}Q${n(cx + q)} ${n(cy - q)} ${n(cx + R)} ${n(cy)}` +
		`Q${n(cx + q)} ${n(cy + q)} ${n(cx)} ${n(cy + R)}` +
		`Q${n(cx - q)} ${n(cy + q)} ${n(cx - R)} ${n(cy)}` +
		`Q${n(cx - q)} ${n(cy - q)} ${n(cx)} ${n(cy - R)}Z`;
};

// ------------------------------------------------------------------- doc ---

// architecture — a portico: pediment, entablature, columns, stylobate
add('architecture', 'SILHOUETTE', [F('architecture')], path(F('architecture'),
	poly([[8, 2.2], [14.5, 6.4], [1.5, 6.4]]) + rect(2.2, 6.4, 13.8, 8) +
	rect(3, 8, 4.9, 12.6) + rect(7.05, 8, 8.95, 12.6) + rect(11.1, 8, 13, 12.6) +
	rect(1.8, 12.6, 14.2, 14.1)));

// authors — a quill
add('authors', 'SILHOUETTE', [F('authors')],
	path(F('authors'), 'M13.9 2.1C13.9 2.1 5.6 3 3.9 7.8C2.6 11.4 4.4 11.6 4.4 11.6' +
		'C4.4 11.6 6.8 13.4 9.4 11.9C13.4 9.6 13.9 2.1 13.9 2.1Z' +
		limb(13.4, 2.6, 4.6, 11.4, 0.95), true) +
	path(F('authors'), limb(5.1, 11.3, 2, 14.4, 1.75)));

// changelog — a scroll
add('changelog', 'SILHOUETTE', [F('changelog')], path(F('changelog'),
	rrect(2, 2, 14, 4.6, 1.3) + rect(3.4, 4.6, 12.6, 11.4) + rrect(2, 11.4, 14, 14, 1.3) +
	rect(5, 6.2, 11, 7.2) + rect(5, 8.6, 11, 9.6), true));

// citation — a pair of quotation marks
{
	const q = (x) => rrect(x, 4.4, x + 4, 8.4, 1.3) + poly([[x + .5, 7.7], [x + 4, 7.7], [x + 1.9, 11.6]]);
	add('citation', 'GLYPH', [F('citation')], path(F('citation'), q(1.9) + q(9.5)));
}

// conduct — a gavel and block
add('conduct', 'SILHOUETTE', [F('conduct')], path(F('conduct'),
	limb(2.6, 6.6, 8.4, 3, 3.9) + limb(6.6, 6.4, 11.8, 11.2, 2.4) + rrect(3.6, 12.4, 14.4, 14.4, 0.8)));

// contributing — a puzzle piece
add('contributing', 'SILHOUETTE', [F('contributing')], path(F('contributing'),
	'M2.7 3.2H10.3A1 1 0 0 1 11.3 4.2V6.2A1.85 1.85 0 1 1 11.3 9.8V11.8' +
	'A1 1 0 0 1 10.3 12.8H8.3A1.85 1.85 0 1 0 4.7 12.8H2.7A1 1 0 0 1 1.7 11.8V4.2A1 1 0 0 1 2.7 3.2Z'));

// credits — a trophy
add('credits', 'SILHOUETTE', [F('credits')], path(F('credits'),
	'M4.4 2.4H11.6V6.4C11.6 8.7 10 10.3 8 10.3C6 10.3 4.4 8.7 4.4 6.4Z' +
	rrect4(1.3, 3.3, 4.4, 7.7, [1.5, 0, 0, 1.5]) + rrect4(2.8, 4.8, 4.4, 6.2, [0.7, 0, 0, 0.7]) +
	rrect4(11.6, 3.3, 14.7, 7.7, [0, 1.5, 1.5, 0]) + rrect4(11.6, 4.8, 13.2, 6.2, [0, 0.7, 0.7, 0]) +
	rect(7.1, 10.3, 8.9, 12.3) + rrect(4.8, 12.3, 11.2, 14.2, 0.6), true));

// docusaurus — the green dino head (real mark), jaw open
add('docusaurus', 'SILHOUETTE', [F('docusaurus')], path(F('docusaurus'),
	'M2 12.2C2 7.4 4.9 3.4 8.8 3.4C12 3.4 14.4 5.6 14.4 8.4C14.4 9.3 13.7 10 12.8 10' +
	'H9.6L14.4 12.2V13.6H4.4C3 13.6 2 13.1 2 12.2Z' + circle(6.6, 7.4, 1.6), true));

// doxygen — badge Dx
add('doxygen', 'BADGE', [F('doxygen'), W],
	plate(F('doxygen')) + badgeText('Dx', W, { inkW: 9.4 }).path);

// epub — a book with a ribbon
add('epub', 'SILHOUETTE', [F('epub')], path(F('epub'),
	rrect(3.2, 2, 12.8, 12, 1) + poly([[9, 12], [11.6, 12], [11.6, 14.6], [10.3, 13.4], [9, 14.6]]) +
	rect(5, 2.9, 5.7, 11.1) + rect(6.9, 4.6, 11.1, 5.5) + rect(6.9, 6.4, 11.1, 7.3) +
	rect(6.9, 8.2, 11.1, 9.1), true));

// humans.txt — a byline
add('humanstxt', 'GLYPH', [F('humanstxt')], path(F('humanstxt'),
	circle(3.5, 4.6, 1.8) + 'M.8 10.4A2.7 2.7 0 0 1 6.2 10.4Z' +
	rect(8, 3.1, 14.8, 4.5) + rect(8, 6.2, 14.8, 7.6) + rect(8, 9.3, 12.6, 10.7) +
	rect(.8, 12.4, 14.8, 13.8)));

// installation — an install arrow dropping into a tray
add('installation', 'GLYPH', [F('installation')], path(F('installation'),
	rect(6.9, 2.2, 9.1, 7.6) + poly([[4.8, 6.8], [11.2, 6.8], [8, 10.8]]) +
	poly([[1.8, 9.6], [3.6, 9.6], [3.6, 12.4], [12.4, 12.4], [12.4, 9.6], [14.2, 9.6], [14.2, 14.2], [1.8, 14.2]])));

// instructions — a signpost
add('instructions', 'SILHOUETTE', [F('instructions')], path(F('instructions'),
	rect(7.3, 3, 8.7, 14.2) +
	poly([[8.7, 3.6], [13.4, 3.6], [14.6, 5.3], [13.4, 7], [8.7, 7]]) +
	poly([[7.3, 8.4], [2.6, 8.4], [1.4, 10.1], [2.6, 11.8], [7.3, 11.8]])));

// libreoffice-writer — the pilcrow
add('libreoffice-writer', 'GLYPH', [F('libreoffice-writer')],
	glyphText('¶', F('libreoffice-writer'), { inkHeight: 10.4, band: 'ink', cy: 8 }).path);

// markdoc — the markdown mark, bare (R3 family: markdown)
{
	const M = [['M', 2.9, 10.4], ['L', 2.9, 5.9], ['L', 4.25, 5.9], ['L', 5.6, 7.6], ['L', 6.95, 5.9],
		['L', 8.3, 5.9], ['L', 8.3, 10.4], ['L', 6.95, 10.4], ['L', 6.95, 7.9], ['L', 5.6, 9.6],
		['L', 4.25, 7.9], ['L', 4.25, 10.4], ['Z']];
	const A = [['M', 10.55, 5.9], ['L', 12.05, 5.9], ['L', 12.05, 8.2], ['L', 13.4, 8.2],
		['L', 11.3, 10.7], ['L', 9.2, 8.2], ['L', 10.55, 8.2], ['Z']];
	const s = 1.28, tx = 8 - s * 8.15, ty = 8 - s * 8.3;
	add('markdoc', 'GLYPH', [F('markdoc')], path(F('markdoc'), xf(M, s, s, tx, ty) + xf(A, s, s, tx, ty)));
}

// openapi — badge API
add('openapi', 'BADGE', [F('openapi'), W],
	plate(F('openapi')) + badgeText('API', W, { inkW: 11, letterSpacing: -0.02 }).path);

// org — badge Org
add('org', 'BADGE', [F('org'), W],
	plate(F('org')) + badgeText('Org', W, { inkW: 10.6, letterSpacing: -0.02 }).path);

// patch — a dressing over the break (a rounded bar on the 45)
{
	const u = [0.70711, -0.70711], v = [0.70711, 0.70711], r = 1.8, hl = 6.4, hw = 2.4;
	const P = (a, b) => [8 + a * u[0] + b * v[0], 8 + a * u[1] + b * v[1]];
	const pts = [[hl, -hw], [hl, hw], [-hl, hw], [-hl, -hw]];
	let d = '';
	for (let i = 0; i < 4; i++) {
		const cur = pts[i], nx = pts[(i + 1) % 4], pv = pts[(i + 3) % 4];
		const inset = (o) => [cur[0] + Math.sign(o[0] - cur[0]) * r * (o[0] !== cur[0] ? 1 : 0),
			cur[1] + Math.sign(o[1] - cur[1]) * r * (o[1] !== cur[1] ? 1 : 0)];
		const a = P(...inset(pv)), b = P(...inset(nx));
		d += (i ? 'L' : 'M') + `${n(a[0])} ${n(a[1])}A${n(r)} ${n(r)} 0 0 1 ${n(b[0])} ${n(b[1])}`;
	}
	const pad = [[1.5, 1.5], [1.5, -1.5], [-1.5, -1.5], [-1.5, 1.5]].map(([a, b]) => P(a, b));
	d += 'Z' + poly(pad);
	add('patch', 'SILHOUETTE', [F('patch')], path(F('patch'), d, true));
}

// prompt — the sparkle pair
add('prompt', 'GLYPH', [F('prompt')], path(F('prompt'), sparkle(6.4, 6.6, 4.8) + sparkle(11.9, 11.7, 2.9)));

// readthedocs — badge RTD
add('readthedocs', 'BADGE', [F('readthedocs'), W],
	plate(F('readthedocs')) + badgeText('RTD', W, { inkW: 11, letterSpacing: -0.02 }).path);

// rest — a title over reStructuredText's === rules
{
	const dash = (y) => [1.8, 4.4, 7, 9.6, 12.2].map(x => rect(x, y, x + 2, y + 1)).join('');
	add('rest', 'GLYPH', [F('rest')], path(F('rest'),
		rect(1.8, 3, 12.6, 4.8) + dash(5.6) + dash(7.4) +
		rect(1.8, 10.4, 14.2, 11.6) + rect(1.8, 12.8, 10, 14)));
}

// roadmap — a milestone flag
add('roadmap', 'SILHOUETTE', [F('roadmap')], path(F('roadmap'),
	rect(3, 1.8, 4.6, 14.2) +
	poly([[4.6, 2.4], [14.2, 2.4], [12, 5.5], [14.2, 8.6], [4.6, 8.6]])));

// skill — a mortarboard
add('skill', 'SILHOUETTE', [F('skill')], path(F('skill'),
	poly([[8, 2.8], [14.6, 6.1], [8, 9.4], [1.4, 6.1]]) +
	'M4.7 8.8L8 10.45L11.3 8.8V11.9C11.3 13.3 9.9 14.2 8 14.2C6.1 14.2 4.7 13.3 4.7 11.9Z'));

// textile — a weave, over and under
add('textile', 'GLYPH', [F('textile')], path(F('textile'),
	rect(3.4, 1.8, 6, 14.2) + rect(10, 1.8, 12.6, 14.2) +
	rect(1.4, 4, 2.7, 6.6) + rect(6.7, 4, 14.6, 6.6) +
	rect(1.4, 9.4, 9.3, 12) + rect(13.3, 9.4, 14.6, 12)));

// toc — an outline
add('toc', 'GLYPH', [F('toc')], path(F('toc'),
	rect(2.2, 2, 3.6, 12.4) +
	rect(3.6, 3.55, 5.6, 4.85) + rect(6.3, 3.2, 14.2, 5.2) +
	rect(3.6, 7.05, 5.6, 8.35) + rect(6.3, 6.7, 12.4, 8.7) +
	rect(3.6, 10.55, 5.6, 11.85) + rect(6.3, 10.2, 13.6, 12.2)));

// tsdoc — the doc-comment asterisk in its gutter (R3 family: typescript)
{
	const ast = [0, 60, 120].map(a => {
		const r = a * Math.PI / 180, L = 4.6;
		return limb(9.4 - L * Math.cos(r), 8 - L * Math.sin(r), 9.4 + L * Math.cos(r), 8 + L * Math.sin(r), 1.6);
	}).join('');
	add('tsdoc', 'GLYPH', [F('tsdoc')], path(F('tsdoc'), rect(2, 2.2, 3.4, 13.8) + ast));
}

// typedoc — a generated doc set
add('typedoc', 'SILHOUETTE', [F('typedoc')], path(F('typedoc'),
	rrect(1.6, 5.5, 10.2, 13.9, 1) +
	poly([[3.4, 3.5], [12.2, 3.5], [12.2, 12.4], [10.9, 12.4], [10.9, 4.8], [3.4, 4.8]]) +
	poly([[5.2, 1.5], [14.2, 1.5], [14.2, 10.4], [12.9, 10.4], [12.9, 2.8], [5.2, 2.8]])));

// unlicense — no rights reserved
add('unlicense', 'GLYPH', [F('unlicense')],
	path(F('unlicense'), circle(8, 8, 5.9) + circle(8, 8, 4.5), true) +
	path(F('unlicense'), limb(4.1, 11.9, 11.9, 4.1, 1.7)));

// ------------------------------------------------------------------ font ---

// fantasticon — the icon-font wand
add('fantasticon', 'SILHOUETTE', [F('fantasticon')], path(F('fantasticon'),
	limb(2.2, 13.8, 9.6, 6.4, 2.7) + sparkle(11.8, 4.4, 3.5)));

// glyphs — a letterform with its node handles
{
	const g = glyphText('g', F('glyphs'), { inkHeight: 10.4, band: 'ink', cy: 7.9 });
	add('glyphs', 'GLYPH', [F('glyphs')],
		g.path + path(F('glyphs'), rect(1.6, 4.2, 3.1, 5.7) + rect(12.9, 10.6, 14.4, 12.1)));
}

// libreoffice-math — the radical
add('libreoffice-math', 'GLYPH', [F('libreoffice-math')], path(F('libreoffice-math'),
	stroke([[1.8, 8.3], [3.6, 8.3], [5.4, 12.4], [8.5, 2.9], [14.2, 2.9]], 1.6)));
