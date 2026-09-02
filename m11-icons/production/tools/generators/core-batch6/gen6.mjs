#!/usr/bin/env node
// gen6.mjs — batch-6 SVG emitter (scratchpad tool, not shipped).
// Writes production/svg/file/<id>.svg for ranks 121-145 + the generic fallbacks.

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { letterPath } from '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/tools/letterpath.mjs';

const OUT = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/svg/file';
mkdirSync(OUT, { recursive: true });

// ---- number / path helpers -------------------------------------------------
const n = (v) => {
	let s = (+v).toFixed(2);
	if (s.includes('.')) { s = s.replace(/0+$/, '').replace(/\.$/, ''); }
	if (s === '-0') { s = '0'; }
	return s.replace(/^(-?)0\./, '$1.');
};
const P = (...a) => a.map(n).join(' ').replace(/ -/g, '-');

// polygon from [x,y] pairs
const poly = (pts) => {
	let d = 'M' + P(pts[0][0], pts[0][1]);
	pts.slice(1).forEach(([x, y], i) => {
		const b = P(x, y);
		d += (i === 0 ? 'L' : (b.startsWith('-') ? '' : ' ')) + b;
	});
	return d + 'Z';
};

// rounded rect
const rr = (x, y, w, h, r) =>
	`M${P(x + r, y)}h${n(w - 2 * r)}a${P(r, r)} 0 0 1 ${P(r, r)}v${n(h - 2 * r)}a${P(r, r)} 0 0 1 ${P(-r, r)}h${n(-(w - 2 * r))}a${P(r, r)} 0 0 1 ${P(-r, -r)}v${n(-(h - 2 * r))}a${P(r, r)} 0 0 1 ${P(r, -r)}Z`;

// plain rect as a path
const rect = (x, y, w, h) => `M${P(x, y)}h${n(w)}v${n(h)}h${n(-w)}Z`;

// circle
const circ = (cx, cy, r) =>
	`M${P(cx - r, cy)}a${P(r, r)} 0 1 1 ${P(2 * r, 0)}a${P(r, r)} 0 1 1 ${P(-2 * r, 0)}Z`;

// rotated ellipse (rot in degrees)
const ell = (cx, cy, rx, ry, rot) => {
	const t = rot * Math.PI / 180, c = Math.cos(t), s = Math.sin(t);
	const x1 = cx - rx * c, y1 = cy - rx * s, x2 = cx + rx * c, y2 = cy + rx * s;
	return `M${P(x1, y1)}A${P(rx, ry)} ${n(rot)} 0 1 ${P(x2, y2)}A${P(rx, ry)} ${n(rot)} 0 1 ${P(x1, y1)}Z`;
};

// 2-segment polyline baked to a filled polygon (miter join, butt caps)
const stroke2 = (a, b, c, w) => {
	const nrm = ([x, y]) => { const l = Math.hypot(x, y); return [x / l, y / l]; };
	const d1 = nrm([b[0] - a[0], b[1] - a[1]]), d2 = nrm([c[0] - b[0], c[1] - b[1]]);
	const n1 = [-d1[1], d1[0]], n2 = [-d2[1], d2[0]];
	const m = nrm([n1[0] + n2[0], n1[1] + n2[1]]);
	const len = (w / 2) / (m[0] * n1[0] + m[1] * n1[1]);
	const off = (p, nv, s) => [p[0] + s * nv[0] * w / 2, p[1] + s * nv[1] * w / 2];
	const mit = (s) => [b[0] + s * m[0] * len, b[1] + s * m[1] * len];
	return poly([off(a, n1, 1), mit(1), off(c, n2, 1), off(c, n2, -1), mit(-1), off(a, n1, -1)]);
};

const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${body}</svg>`;
const path = (fill, d, rule) => `<path fill="${fill}"${rule ? ` fill-rule="${rule}"` : ''} d="${d}"/>`;

const files = {};
const emit = (id, body) => { files[id] = svg(body); };

// letters
const L = (opts) => letterPath(opts).d;

// ---------------------------------------------------------------------------
// 121 nestjs — SILHOUETTE, cat head
emit('nestjs', path('#C4485F',
	'M3.6 2.5L6.2 6.5Q8 5.6 9.8 6.5L12.4 2.5Q14 5.5 13.6 8.6Q13 12.4 8 14.3Q3 12.4 2.4 8.6Q2 5.5 3.6 2.5Z'));

// 122 django — BADGE "dj"
emit('django',
	'<rect x="1" y="1" width="14" height="14" rx="3" fill="#43885F"/>' +
	path('#FFFFFF', L({ text: 'dj', inkHeight: 9.2, cx: 8, cy: 8.5, band: 'ink' })));

// 123 expo — BADGE "E"
emit('expo',
	'<rect x="1" y="1" width="14" height="14" rx="3" fill="#68779E"/>' +
	path('#FFFFFF', L({ text: 'E', cap: 7, cx: 8, baseline: 12.13 })));

// 124 tauri — SILHOUETTE, app window
emit('tauri', path('#D19A3C',
	rr(1.4, 2.8, 13.2, 10.4, 1.7) + rr(2.75, 7, 10.5, 4.85, 0.7) + circ(4.05, 4.9, 0.85), 'evenodd'));

// 125 jupyter — GLYPH, three dots + one tilted orbit
emit('jupyter', path('#D97A3C',
	ell(8, 8.2, 6.2, 2.5, -24) + ell(8, 8.2, 4.7, 1, -24) +
	circ(8, 2.85, 1.55) + circ(3.5, 13.05, 1.55) + circ(12.5, 13.05, 1.55), 'evenodd'));

// 126 terraform — SILHOUETTE, three isometric tiles
emit('terraform', path('#8A63BE',
	poly([[8.3, 4.6], [13.5, 2.4], [13.5, 6.4], [8.3, 8.6]]) +
	poly([[8.3, 9.3], [13.5, 7.1], [13.5, 11.1], [8.3, 13.3]]) +
	poly([[2.4, 7.1], [7.6, 4.9], [7.6, 8.9], [2.4, 11.1]])));

// 127 helm — SILHOUETTE, ship's wheel
emit('helm',
	path('#6A7ED0', circ(8, 8, 5.4) + circ(8, 8, 3.8), 'evenodd') +
	path('#6A7ED0', circ(8, 8, 1.85) +
		rr(1.5, 7.25, 13, 1.5, .75) + rr(7.25, 1.5, 1.5, 13, .75)));

// 128 github-actions-workflow — SILHOUETTE, circular arrow
{
	const R = 5.75, r = 4.2;
	const pt = (rad, deg) => [8 + rad * Math.sin(deg * Math.PI / 180), 8 - rad * Math.cos(deg * Math.PI / 180)];
	const [ox1, oy1] = pt(R, 62), [ox2, oy2] = pt(R, 348);
	const [ix1, iy1] = pt(r, 62), [ix2, iy2] = pt(r, 348);
	const [ax, ay] = pt(R + 1.55, 58), [bx, by] = pt(r - 1.55, 58), [cx, cy] = pt((R + r) / 2, 100);
	emit('github-actions-workflow', path('#4E93D6',
		`M${P(ox1, oy1)}A${P(R, R)} 0 1 1 ${P(ox2, oy2)}L${P(ix2, iy2)}A${P(r, r)} 0 1 0 ${P(ix1, iy1)}Z` +
		poly([[ax, ay], [bx, by], [cx, cy]])));
}

// 129 gitlab — SILHOUETTE, fox
emit('gitlab', path('#E8973E',
	poly([[8, 14.3], [2.1, 7.4], [4.2, 2.2], [6.3, 7.4], [9.7, 7.4], [11.8, 2.2], [13.9, 7.4]])));

// 130 jenkins — BADGE "J"
emit('jenkins',
	'<rect x="1" y="1" width="14" height="14" rx="3" fill="#C0554A"/>' +
	path('#FFFFFF', L({ text: 'J', cap: 7, cx: 8, baseline: 12.13 })));

// 131 vercel — SILHOUETTE, triangle
emit('vercel', path('#DADCE0', poly([[8, 2.6], [14.6, 13.4], [1.4, 13.4]])));

// 132 netlify — SILHOUETTE, diamond with the left bar
emit('netlify', path('#3AAFB9',
	poly([[8, 1.4], [14.6, 8], [8, 14.6], [4.3, 10.9], [4.3, 8.7], [1.4, 8.7], [1.4, 7.3], [4.3, 7.3], [4.3, 5.1]])));

// 133 firebase — SILHOUETTE, flame
emit('firebase', path('#EBBE45',
	'M8.4 1.3C10.9 4.3 13 6.7 13 9.4C13 12.3 10.7 14.6 8 14.6C5.3 14.6 3 12.3 3 9.4C3 7.3 4 5.4 5.5 4.2C5.4 6.4 6 7.7 7 8.4C8.3 7 8.8 4.3 8.4 1.3Z'));

// 134 supabase — SILHOUETTE, bolt
emit('supabase', path('#4CB984',
	poly([[9.4, 1.3], [2.9, 9.3], [7.5, 9.3], [6.6, 14.7], [13.1, 6.7], [8.5, 6.7]])));

// 135 http — GLYPH, request / response arrows
emit('http', path('#6E93B4',
	'M1.6 4.5H10.6V2.8l4.2 2.5-4.2 2.5V6.1H1.6Z' +
	'M14.4 9.9H5.4V8.2L1.2 10.7l4.2 2.5v-1.7h9Z'));

// 136 swagger — SILHOUETTE, disc + endpoint rings
emit('swagger', path('#6FA83C',
	circ(8, 8, 6.5) + circ(8, 8, 4.45) + circ(8, 8, 3.1), 'evenodd'));

// 137 mermaid — SILHOUETTE, flow graph
emit('mermaid', path('#D4547B',
	rr(5.2, 1.5, 5.6, 3.4, 1.1) + rr(1.2, 10.9, 5.4, 3.6, 1.1) + rr(9.4, 10.9, 5.4, 3.6, 1.1) +
	'M7.35 4.6h1.3v3.05h4.1v3.75h-1.3V8.95h-6.9v2.45h-1.3V7.65h4.1Z'));

// 138 claude — GLYPH, sunburst
{
	const R = 6.5, dlt = 10.5, blades = 10;
	let d = '';
	for (let k = 0; k < blades; k++) {
		const a = k * 360 / blades;
		const p = (deg) => [8 + R * Math.sin(deg * Math.PI / 180), 8 - R * Math.cos(deg * Math.PI / 180)];
		const [x1, y1] = p(a - dlt), [x2, y2] = p(a + dlt);
		d += `M8 8L${P(x1, y1)}L${P(x2, y2)}Z`;
	}
	emit('claude', path('#D97757', d));
}

// 139 copilot — SILHOUETTE, head
emit('copilot', path('#C6CBD1',
	'M8 3.2C11.5 3.2 14 5.5 14 8.8v1.9c0 2.3-2.6 3.6-6 3.6s-6-1.3-6-3.6V8.8C2 5.5 4.5 3.2 8 3.2Z' +
	'M6.85 9.4C6.85 10.17 6.38 10.8 5.8 10.8C5.22 10.8 4.75 10.17 4.75 9.4C4.75 8.63 5.22 8 5.8 8C6.38 8 6.85 8.63 6.85 9.4Z' +
	'M11.25 9.4C11.25 10.17 10.78 10.8 10.2 10.8C9.62 10.8 9.15 10.17 9.15 9.4C9.15 8.63 9.62 8 10.2 8C10.78 8 11.25 8.63 11.25 9.4Z',
	'evenodd'));

// 140 agents — SILHOUETTE, prompt bubble
emit('agents', path('#A98FD6',
	rr(1.8, 2.2, 12.4, 9.2, 2.2) + 'M4.4 11.4h3.4l-3.4 3Z' +
	circ(5, 6.8, 1.1) + circ(8, 6.8, 1.1) + circ(11, 6.8, 1.1), 'evenodd'));

// 141 cursor — SILHOUETTE, pointer
emit('cursor', path('#9FAAB8',
	poly([[2.71, 1.6], [12.49, 9.6], [7.89, 9.6], [10.3, 14], [8.17, 14.7], [5.82, 10.5], [2.71, 13.3]])));

// 142 vscode — SILHOUETTE, the ribbon
emit('vscode', path('#2782C2',
	poly([[11.2, 1.78], [13.9, 3.07], [14.28, 3.69], [14.28, 12.32], [13.9, 12.95], [10.66, 14.25],
	[5.26, 9.52], [3.01, 11.23], [1.71, 10.54], [1.71, 5.48], [3.01, 4.79], [5.26, 6.5]]) +
	poly([[11.2, 5.14], [7.28, 8.01], [11.2, 10.88]]), 'evenodd'));

// 143 favicon — SILHOUETTE, star
{
	const cx = 8, cy = 8.3, R = 6.6, r = 2.9, pts = [];
	for (let k = 0; k < 10; k++) {
		const rad = k % 2 === 0 ? R : r;
		const a = -90 + k * 36;
		pts.push([cx + rad * Math.cos(a * Math.PI / 180), cy + rad * Math.sin(a * Math.PI / 180)]);
	}
	emit('favicon', path('#DCBB5C', poly(pts)));
}

// 144 todo — GLYPH, checkbox + check
emit('todo', path('#C9A241', stroke2([2.05, 8.65], [6.2, 12.05], [13.95, 4.75], 2.25)));

// 145 codeowners — SILHOUETTE, owner
emit('codeowners', path('#A89C8E',
	circ(8, 4.7, 2.4) +
	'M8 8.9c3.1 0 5.6 2.3 5.6 5.3H2.4c0-3 2.5-5.3 5.6-5.3Z'));

// ---------------------------------------------------------------------------
// GENERICS
// file — the default plain document
emit('file',
	path('#C5C5C5', 'M3.9 1.5h5.7l3.8 3.8v8.1a1.1 1.1 0 0 1-1.1 1.1H3.9a1.1 1.1 0 0 1-1.1-1.1V2.6a1.1 1.1 0 0 1 1.1-1.1Z') +
	path('#9C9C9C', 'M9.6 1.5l3.8 3.8H9.6Z'));

// generic-code — chevrons
emit('generic-code', path('#7C8CA0',
	poly([[6.3, 3], [1.4, 8], [6.3, 13], [7.5, 11.8], [3.75, 8], [7.5, 4.2]]) +
	poly([[9.7, 3], [14.6, 8], [9.7, 13], [8.5, 11.8], [12.25, 8], [8.5, 4.2]])));

// generic-config — gear
{
	const R = 6.2, r = 4.8, teeth = 8, tw = 12, rw = 17, pts = [];
	const p = (rad, deg) => [8 + rad * Math.sin(deg * Math.PI / 180), 8 - rad * Math.cos(deg * Math.PI / 180)];
	for (let k = 0; k < teeth; k++) {
		const a = k * 360 / teeth;
		pts.push(p(r, a - rw), p(R, a - tw), p(R, a + tw), p(r, a + rw));
	}
	emit('generic-config', path('#93887A', poly(pts) + circ(8, 8, 1.95), 'evenodd'));
}

// generic-data — table
emit('generic-data', path('#6F958F',
	rr(1.5, 3.2, 13, 9.6, 1.2) + rect(1.5, 6.1, 13, 0.8) + rect(5.4, 6.9, 0.8, 5.9) + rect(9.8, 6.9, 0.8, 5.9),
	'evenodd'));

// generic-doc — paragraph
emit('generic-doc', path('#8D9298',
	rect(1.6, 3.3, 12.8, 1.4) + rect(1.6, 6.1, 12.8, 1.4) + rect(1.6, 8.9, 10.4, 1.4) + rect(1.6, 11.7, 8.4, 1.4)));

// generic-image — frame
emit('generic-image', path('#8A7FA0',
	rr(1.5, 3, 13, 10, 1.6) + rr(2.85, 4.35, 10.3, 7.3, 0.8) + circ(5.45, 6.85, 1.35), 'evenodd'));

// generic-media — play
emit('generic-media', path('#9B7F87', poly([[3.9, 2.2], [13.6, 8], [3.9, 13.8]])));

// generic-font — A
emit('generic-font', path('#8E9575', L({ text: 'A', cap: 9.6, cx: 8, cy: 8 })));

// generic-archive — box
emit('generic-archive', path('#96805E',
	rr(1.6, 3.2, 12.8, 3, 0.8) + rr(2.6, 6.9, 10.8, 6.7, 0.9) + rr(6.4, 8.6, 3.2, 1.5, 0.5), 'evenodd'));

// generic-binary — chip
emit('generic-binary', path('#6F7A85',
	rr(4.4, 3.2, 7.2, 9.6, 1.3) + rr(6.6, 5.6, 2.8, 4.8, 0.7) +
	rect(1.8, 5.1, 2.6, 1.5) + rect(1.8, 9.4, 2.6, 1.5) +
	rect(11.6, 5.1, 2.6, 1.5) + rect(11.6, 9.4, 2.6, 1.5), 'evenodd'));

// ---------------------------------------------------------------------------
let total = 0;
for (const [id, src] of Object.entries(files)) {
	writeFileSync(join(OUT, `${id}.svg`), src, 'utf8');
	total += Buffer.byteLength(src);
	console.log(String(Buffer.byteLength(src)).padStart(5), id);
}
console.log(`\n${Object.keys(files).length} files, ${total} bytes, avg ${Math.round(total / Object.keys(files).length)}`);
