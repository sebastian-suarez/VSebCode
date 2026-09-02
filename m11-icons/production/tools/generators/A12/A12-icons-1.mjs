// A12-icons-1.mjs — slice A12, config (15) + data (14).
import * as G from './A12-lib.mjs';
import { F, SRC } from './A12-hues.mjs';
const { poly, rect, rrect, circle, ellipse, limb, stroke, xf, mirror, path, plate,
	badgeText, BRACE_L, VSCODE_MARK, n } = G;

const W = '#FFFFFF';
export const ICONS_1 = [];
const add = (id, arch, fills, body) => ICONS_1.push({ id, arch, fills, src: SRC(id), body });

// ---------------------------------------------------------------- config ---

// vim — the Vim rhombus with the V cut out (real mark)
add('vim', 'SILHOUETTE', [F('vim')], path(F('vim'),
	poly([[8, 1.8], [14.2, 8], [8, 14.2], [1.8, 8]]) +
	poly([[5.2, 5.3], [6.95, 5.3], [8, 8.9], [9.05, 5.3], [10.8, 5.3], [8.9, 11.6], [7.1, 11.6]]), true));

// vscode-test — the VS Code fold mark with a test tick (R3 family: vscode)
add('vscode-test', 'SILHOUETTE', [F('vscode-test')], path(F('vscode-test'),
	xf(VSCODE_MARK, 0.74, 0.74, -0.15, 0.05) +
	stroke([[9.9, 11.9], [11.3, 13.3], [14.4, 10.2]], 1.95), true));

// vueconfig — the Vue chevron drawn hollow (R3 family: vue)
add('vueconfig', 'SILHOUETTE', [F('vueconfig')], path(F('vueconfig'),
	poly([[1.5, 3.2], [8, 13.6], [14.5, 3.2], [11.6, 3.2], [8, 9], [4.4, 3.2]])));

// watchmanconfig — a stopwatch (it watches the tree)
add('watchmanconfig', 'SILHOUETTE', [F('watchmanconfig')],
	path(F('watchmanconfig'), rrect(7.1, 1.4, 8.9, 3.65, 0.6)) +
	path(F('watchmanconfig'), circle(8, 9, 5.4) +
		poly([[7.35, 5.2], [8.65, 5.2], [8.65, 8.35], [11.4, 8.35], [11.4, 9.65], [7.35, 9.65]]), true));

// webhint — a hint lamp
add('webhint', 'SILHOUETTE', [F('webhint')], path(F('webhint'),
	circle(8, 6.2, 4.3) + poly([[5.8, 9.3], [10.2, 9.3], [9.6, 11.8], [6.4, 11.8]]) +
	rrect(6.2, 12.4, 9.8, 14.4, 0.5) + rect(6.2, 13.15, 9.8, 13.65), true));

// wercker — badge w
add('wercker', 'BADGE', [F('wercker'), W],
	plate(F('wercker')) + badgeText('w', W, { inkW: 7.2 }).path);

// windi — three wind streaks
{
	const rib = (x0, y0, cx, cy, x1, y1, t) =>
		`M${n(x0)} ${n(y0)}Q${n(cx)} ${n(cy)} ${n(x1)} ${n(y1)}` +
		`L${n(x1)} ${n(y1 + t)}Q${n(cx)} ${n(cy + t)} ${n(x0)} ${n(y0 + t)}Z`;
	add('windi', 'SILHOUETTE', [F('windi')], path(F('windi'),
		rib(1.9, 5.1, 6.6, 2.4, 11.8, 4.1, 1.65) +
		rib(3.4, 8.9, 8.6, 5.9, 13.8, 7.5, 1.65) +
		rib(2.3, 12.6, 6.3, 9.7, 9.9, 11.4, 1.65)));
}

// wpml — a globe (WordPress multilingual)
add('wpml', 'SILHOUETTE', [F('wpml')], path(F('wpml'),
	circle(8, 8, 5.9) + ellipse(8, 8, 2.6, 5.9) + ellipse(8, 8, 1.4, 4.7) +
	rect(2.9, 5.6, 13.1, 6.5) + rect(2.9, 9.5, 13.1, 10.4), true));

// wrangler — the Cloudflare cloud
add('wrangler', 'SILHOUETTE', [F('wrangler')], path(F('wrangler'),
	circle(5.2, 8.4, 3.3) + circle(9.2, 7.2, 4) + circle(12, 9.4, 2.6) +
	rrect(1.9, 9.6, 14.3, 12.8, 1.5)));

// wxt — badge WXT
add('wxt', 'BADGE', [F('wxt'), W],
	plate(F('wxt')) + badgeText('WXT', W, { inkW: 11, letterSpacing: -0.02 }).path);

// xo — the drawn X and O (R1: geometry, not type)
add('xo', 'GLYPH', [F('xo')],
	path(F('xo'), limb(2, 5.45, 7.1, 10.55, 1.7) + limb(7.1, 5.45, 2, 10.55, 1.7)) +
	path(F('xo'), circle(11.8, 8, 2.95) + circle(11.8, 8, 1.6), true));

// yamllint — a yaml list, linted
add('yamllint', 'GLYPH', [F('yamllint')], path(F('yamllint'),
	rect(1.6, 3.6, 3.4, 5) + rect(4.2, 3.6, 11.4, 5) +
	rect(1.6, 6.6, 3.4, 8) + rect(4.2, 6.6, 8.6, 8) +
	rect(1.6, 9.6, 3.4, 11) + rect(4.2, 9.6, 7.4, 11) +
	stroke([[8.6, 11.1], [10.1, 12.6], [14.4, 8.3]], 1.85)));

// yandex — the red Я badge (real mark)
add('yandex', 'BADGE', [F('yandex'), W],
	plate(F('yandex')) + badgeText('Я', W, { inkW: 5.4 }).path);

// yeoman — the yeoman hat
add('yeoman', 'SILHOUETTE', [F('yeoman')], path(F('yeoman'),
	rrect(1.5, 10.5, 14.5, 12.4, 0.95) + G.rrect4(4.6, 2.9, 11.4, 11.2, [1.6, 1.6, 0, 0])));

// zizmor — a workflow auditor's lens
add('zizmor', 'SILHOUETTE', [F('zizmor')],
	path(F('zizmor'), circle(6.5, 6.5, 4.6) + circle(6.5, 6.5, 3.1), true) +
	path(F('zizmor'), limb(9.3, 9.3, 13.8, 13.8, 2.3)));

// ------------------------------------------------------------------ data ---

// access — the Office red plate with its initial (R3 rhyme: word)
add('access', 'BADGE', [F('access'), W],
	plate(F('access')) + badgeText('A', W, { inkW: 5.6 }).path);

// dbml — two related tables
{
	const box = (x1, y1) => rrect(x1, y1, x1 + 5.8, y1 + 4.8, 1) +
		rect(x1 + 0.9, y1 + 1.9, x1 + 4.9, y1 + 2.6) + rect(x1 + 0.9, y1 + 3.3, x1 + 4.9, y1 + 4);
	add('dbml', 'SILHOUETTE', [F('dbml')], path(F('dbml'),
		box(1.4, 2.7) + box(8.8, 8.5) +
		poly([[5, 7.5], [6.2, 7.5], [6.2, 9.7], [8.8, 9.7], [8.8, 10.9], [5, 10.9]]), true));
}

// dependencies-update — the refresh ring
add('dependencies-update', 'GLYPH', [F('dependencies-update')],
	path(F('dependencies-update'), 'M10.5 3.67A5 5 0 1 0 12.33 10.5L11.03 9.75A3.5 3.5 0 1 1 9.75 4.97Z') +
	path(F('dependencies-update'), poly([[13.2, 11], [12.98, 7.88], [10.17, 9.25]])));

// design-tokens — a stack of swatches
add('design-tokens', 'SILHOUETTE', [F('design-tokens')], path(F('design-tokens'),
	rrect(1.9, 9.4, 6.5, 14, 1) + rrect(5.7, 5.7, 10.3, 10.3, 1) + rrect(9.5, 2, 14.1, 6.6, 1), true));

// geojson — a map pin
add('geojson', 'SILHOUETTE', [F('geojson')], path(F('geojson'),
	'M8 1.6A5 5 0 0 1 13 6.6C13 9.9 8 14.4 8 14.4C8 14.4 3 9.9 3 6.6A5 5 0 0 1 8 1.6Z' +
	circle(8, 6.6, 1.9), true));

// horusec — the eye of Horus (real mark)
add('horusec', 'SILHOUETTE', [F('horusec')],
	path(F('horusec'), 'M1.6 8.4Q7.6 1.6 13.6 8.4Q7.6 14 1.6 8.4Z' + circle(7.6, 8.4, 1.5), true) +
	path(F('horusec'), 'M2.4 4Q7.8 .2 13.4 3.8L12.6 5.5Q7.9 2.2 3.2 5.6Z' + limb(12.4, 10.2, 14.4, 13.6, 1.9)));

// json-schema — braces around a tick (R3 family: json)
{
	const sx = 3.3 / 3.6, sy = 11.6 / 12, ty = 2.2 - 2 * sy;
	add('json-schema', 'GLYPH', [F('json-schema')], path(F('json-schema'),
		xf(BRACE_L, sx, sy, 1.6 - 3.1 * sx, ty) +
		xf(mirror(BRACE_L, 8), sx, sy, 11.1 - 9.3 * sx, ty) +
		stroke([[6.1, 9.2], [7.2, 10.3], [9.8, 7.7]], 1.5)));
}

// jsonld — two chain links
add('jsonld', 'GLYPH', [F('jsonld')], path(F('jsonld'),
	rrect(1.5, 4.4, 8.5, 11.6, 3.5) + rrect(3.2, 6.1, 6.8, 9.9, 1.8) +
	rrect(7.5, 4.4, 14.5, 11.6, 3.5) + rrect(9.2, 6.1, 12.8, 9.9, 1.8), true));

// language-configuration — brackets around a token
add('language-configuration', 'GLYPH', [F('language-configuration')], path(F('language-configuration'),
	poly([[2, 3], [5.4, 3], [5.4, 4.4], [3.5, 4.4], [3.5, 11.6], [5.4, 11.6], [5.4, 13], [2, 13]]) +
	poly([[14, 3], [10.6, 3], [10.6, 4.4], [12.5, 4.4], [12.5, 11.6], [10.6, 11.6], [10.6, 13], [14, 13]]) +
	rrect(6.5, 6.5, 9.5, 9.5, 0.7)));

// libreoffice-calc — a spreadsheet chart
add('libreoffice-calc', 'GLYPH', [F('libreoffice-calc')], path(F('libreoffice-calc'),
	poly([[1.8, 2.6], [3.2, 2.6], [3.2, 12], [14.2, 12], [14.2, 13.4], [1.8, 13.4]]) +
	rect(4.4, 7.6, 6.6, 12) + rect(7.4, 4.8, 9.6, 12) + rect(10.4, 6.4, 12.6, 12)));

// parquet — columnar tiles, laid herringbone
add('parquet', 'GLYPH', [F('parquet')], path(F('parquet'),
	rrect(2.8, 2.8, 9.8, 5.4, 0.4) + rrect(10.6, 2.8, 13.2, 9.8, 0.4) +
	rrect(2.8, 6.2, 5.4, 13.2, 0.4) + rrect(6.2, 10.6, 13.2, 13.2, 0.4)));

// postman — a sent request
add('postman', 'SILHOUETTE', [F('postman')], path(F('postman'),
	poly([[1.6, 7.4], [14.4, 2.6], [9, 13.4], [6.8, 9.3]])));

// rojo — badge R
add('rojo', 'BADGE', [F('rojo'), W],
	plate(F('rojo')) + badgeText('R', W, { inkW: 5.6 }).path);

// verified — a signed disc
add('verified', 'SILHOUETTE', [F('verified')], path(F('verified'),
	circle(8, 8, 6) + stroke([[5, 8.2], [7.2, 10.4], [11.4, 5.6]], 1.9), true));
