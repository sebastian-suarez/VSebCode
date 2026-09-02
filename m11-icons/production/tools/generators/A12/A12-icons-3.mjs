// A12-icons-3.mjs — slice A12, image (17) + media (5).
import * as G from './A12-lib.mjs';
import { F, SRC } from './A12-hues.mjs';
const { poly, rect, rrect, circle, limb, xf, path, plate, badgeText, glyphTextW,
	ellipseRot, tri, n } = G;

export const ICONS_3 = [];
const add = (id, arch, fills, body) => ICONS_3.push({ id, arch, fills, src: SRC(id), body });

// ----------------------------------------------------------------- image ---

// affinitydesigner — a vector pen nib
add('affinitydesigner', 'SILHOUETTE', [F('affinitydesigner')], path(F('affinitydesigner'),
	poly([[4.9, 1.6], [11.1, 1.6], [12.8, 6.6], [8, 14.4], [3.2, 6.6]]) +
	circle(8, 5.6, 1.5) + rect(7.45, 7.8, 8.55, 12.6), true));

// affinityphoto — a camera
add('affinityphoto', 'SILHOUETTE', [F('affinityphoto')], path(F('affinityphoto'),
	G.rrect4(5, 2.2, 9.6, 4.2, [0.6, 0.6, 0, 0]) + rrect(1.4, 4.2, 14.6, 13.6, 1.6) +
	circle(8, 8.9, 3.4) + circle(8, 8.9, 1.5), true));

// ai — Illustrator's dark plate and wordmark (real mark, R2)
add('ai', 'BADGE', [F('ai'), '#E09140'],
	plate(F('ai')) + badgeText('Ai', '#E09140', { inkW: 9.4 }).path);

// aseprite — a pixel-art staircase
add('aseprite', 'GLYPH', [F('aseprite')], path(F('aseprite'),
	[[1.6, 1.6], [4.2, 4.2], [6.8, 4.2], [6.8, 6.8], [9.4, 9.4], [12, 9.4], [12, 12]]
		.map(([x, y]) => rect(x, y, x + 2.6, y + 2.6)).join('')));

// avif — the format wordmark, stacked so the caps stay legible at 16 px
add('avif', 'GLYPH', [F('avif')],
	glyphTextW('AV', F('avif'), { inkW: 9.2, cy: 4.7 }).path +
	glyphTextW('IF', F('avif'), { inkW: 8.2, cy: 11.3, letterSpacing: .1 }).path);

// drawio — the diagram shapes
add('drawio', 'GLYPH', [F('drawio')], path(F('drawio'),
	poly([[4.4, 1.4], [7.6, 4.6], [4.4, 7.8], [1.2, 4.6]]) + rrect(9.2, 2, 14.6, 7.2, 1) +
	poly([[8, 8.6], [14.2, 14.4], [1.8, 14.4]])));

// eps — a vector anchor and its handles
add('eps', 'GLYPH', [F('eps')],
	path(F('eps'), limb(2.3, 12.9, 5.54, 10.05, 1.9) + limb(10.46, 5.95, 13.7, 3.1, 1.9) +
		circle(8, 8, 3) + circle(8, 8, 1.5), true) +
	path(F('eps'), rect(1.1, 11.7, 3.5, 14.1) + rect(12.5, 1.9, 14.9, 4.3)));

// excalidraw — a hand-drawn arrow
add('excalidraw', 'GLYPH', [F('excalidraw')], path(F('excalidraw'),
	'M1.8 12.4Q5.6 9.9 7.6 7.4Q9.4 5.1 12.2 3.6L13.1 5.6Q10.2 7 8.6 9Q6.6 11.6 3 14.2Z' +
	poly([[14.4, 2], [13.2, 7.2], [9.2, 3.8]])));

// figma — the five-piece mark (R2: the brand identity is the colour)
{
	const s = 13.4 / 57, tx = 8 - 38 * s / 2, ty = 1.3;
	const S = (d) => xf(d, s, s, tx, ty);
	const orange = [['M', 0, 9.5], ['C', 0, 4.25, 4.25, 0, 9.5, 0], ['L', 19, 0], ['L', 19, 19],
		['L', 9.5, 19], ['C', 4.25, 19, 0, 14.75, 0, 9.5], ['Z']];
	const red = [['M', 19, 0], ['L', 28.5, 0], ['C', 33.75, 0, 38, 4.25, 38, 9.5],
		['C', 38, 14.75, 33.75, 19, 28.5, 19], ['L', 19, 19], ['Z']];
	const purple = [['M', 0, 28.5], ['C', 0, 23.25, 4.25, 19, 9.5, 19], ['L', 19, 19], ['L', 19, 38],
		['L', 9.5, 38], ['C', 4.25, 38, 0, 33.75, 0, 28.5], ['Z']];
	const blue = [['M', 38, 28.5], ['C', 38, 33.75, 33.75, 38, 28.5, 38],
		['C', 23.25, 38, 19, 33.75, 19, 28.5], ['C', 19, 23.25, 23.25, 19, 28.5, 19],
		['C', 33.75, 19, 38, 23.25, 38, 28.5], ['Z']];
	const green = [['M', 9.5, 57], ['C', 14.75, 57, 19, 52.75, 19, 47.5], ['L', 19, 38], ['L', 9.5, 38],
		['C', 4.25, 38, 0, 42.25, 0, 47.5], ['C', 0, 52.75, 4.25, 57, 9.5, 57], ['Z']];
	add('figma', 'SILHOUETTE', ['#D65530', '#DC7B6E', '#9260CC', '#45A8CE', '#3EAE83'],
		path('#D65530', S(orange)) + path('#DC7B6E', S(red)) + path('#9260CC', S(purple)) +
		path('#45A8CE', S(blue)) + path('#3EAE83', S(green)));
}

// gimp — a paintbrush
add('gimp', 'SILHOUETTE', [F('gimp')], path(F('gimp'),
	limb(2, 14, 8.4, 7.6, 2.7) + limb(7.9, 8.1, 10.6, 5.4, 3.7) +
	poly([[9.1, 4.6], [14.9, 1], [11.6, 7]])));

// icon — an icon set
add('icon', 'SILHOUETTE', [F('icon')], path(F('icon'),
	rrect(1.8, 1.8, 7.2, 7.2, 1.2) + rrect(8.8, 1.8, 14.2, 7.2, 1.2) +
	rrect(1.8, 8.8, 7.2, 14.2, 1.2) + circle(11.5, 11.5, 2.7)));

// krita — a painter's palette
add('krita', 'SILHOUETTE', [F('krita')], path(F('krita'),
	'M8 2C11.8 2 14.8 4.6 14.8 8C14.8 9.6 13.6 10.6 12.2 10.6H10.8C10 10.6 9.4 11.2 9.4 12' +
	'C9.4 12.4 9.6 12.8 9.6 13.2C9.6 13.8 9.2 14.2 8.4 14.2C4.6 14.2 1.4 11.4 1.4 8C1.4 4.6 4.2 2 8 2Z' +
	circle(5, 6, 1.15) + circle(8.2, 4.8, 1.15) + circle(11.3, 6.4, 1.15), true));

// matlab — the membrane, as one bold lobe
add('matlab', 'SILHOUETTE', [F('matlab')], path(F('matlab'),
	'M2 13.4C6.6 11.4 9.8 6.6 11 1.6C14.4 7.6 11.8 13 6.6 14.6C5 14.4 3.4 14 2 13.4Z'));

// photoshop — the dark plate and wordmark (real mark, R2)
add('photoshop', 'BADGE', [F('photoshop'), '#4FA8E0'],
	plate(F('photoshop')) + badgeText('Ps', '#4FA8E0', { inkW: 9.4 }).path);

// sketch — the faceted gem
add('sketch', 'SILHOUETTE', [F('sketch')], path(F('sketch'),
	poly([[4.6, 2], [11.4, 2], [14.6, 5.6], [8, 14.4], [1.4, 5.6]]) +
	rect(2.2, 5.2, 13.8, 6) + rect(4.75, 2, 5.55, 5.2) + rect(10.45, 2, 11.25, 5.2), true));

// svgo — the file, squeezed
add('svgo', 'GLYPH', [F('svgo')], path(F('svgo'),
	rect(2.2, 1.6, 13.8, 2.9) + rect(2.2, 13.1, 13.8, 14.4) +
	rect(7, 3.6, 9, 5) + poly([[5.2, 5], [10.8, 5], [8, 7.6]]) +
	rect(7, 11, 9, 12.4) + poly([[5.2, 11], [10.8, 11], [8, 8.4]])));

// svgr — an SVG turned into a React component
{
	const f = F('svgr');
	const ring = (rot) => path(f, ellipseRot(8, 8, 6.2, 2.5, rot) + ellipseRot(8, 8, 5.1, 1.4, rot), true);
	add('svgr', 'SILHOUETTE', [f], ring(0) + ring(60) + ring(120) + path(f, circle(8, 8, 1.7)));
}

// ----------------------------------------------------------------- media ---

// 3d — an isometric wireframe cube
{
	const hex = (k) => poly([[0, -6.4], [6.4, -2.7], [6.4, 2.7], [0, 6.4], [-6.4, 2.7], [-6.4, -2.7]]
		.map(([x, y]) => [8 + x * k, 8 + y * k]));
	add('3d', 'GLYPH', [F('3d')],
		path(F('3d'), hex(1) + hex(0.73), true) +
		path(F('3d'), limb(8, 8, 8, 14.4, 1.5) + limb(8, 8, 1.6, 5.3, 1.5) + limb(8, 8, 14.4, 5.3, 1.5)));
}

// blender — the Blender eye and its sweep
add('blender', 'SILHOUETTE', [F('blender')],
	path(F('blender'), circle(9.4, 9.6, 4.6) + circle(9.4, 9.6, 1.8), true) +
	path(F('blender'), poly([[1.2, 3.6], [8.2, 3.6], [9.6, 6.6], [4.6, 6.6]])));

// gltf — a triangle strip
add('gltf', 'GLYPH', [F('gltf')], path(F('gltf'),
	tri([1.4, 13.6], [6, 2.4], [10.6, 13.6], .9) +
	tri([6, 2.4], [10.6, 13.6], [14.6, 3.4], .9)));

// lottie — a ball and its motion trail
add('lottie', 'GLYPH', [F('lottie')], path(F('lottie'),
	circle(11.6, 4.6, 2.9) + 'M1.5 13.8Q3.2 8.6 8 6L9 7.9Q4.9 10 3.5 14.4Z'));

// subtitles — the closed-caption mark
add('subtitles', 'GLYPH', [F('subtitles')],
	glyphTextW('CC', F('subtitles'), { inkW: 12.6, cy: 8, letterSpacing: 0.02 }).path);

void n;
