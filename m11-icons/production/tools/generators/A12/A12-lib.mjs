// A12-lib.mjs — shared geometry helpers for long-tail slice A12.
// Scratch tool. Emits nothing on its own.

import { letterPath } from '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/tools/letterpath.mjs';

export const P = 2;

export function n(v) {
	let s = Number(v).toFixed(P);
	if (s.includes('.')) { s = s.replace(/0+$/, '').replace(/\.$/, ''); }
	if (s === '-0') { s = '0'; }
	return s.replace(/^(-?)0\./, '$1.');
}
const j = (...a) => a.map(n).join(' ').replace(/ -/g, '-');

// ---- primitive subpaths (all clockwise in y-down space) --------------------

export function poly(pts) {
	return 'M' + j(pts[0][0], pts[0][1]) + pts.slice(1).map(p => 'L' + j(p[0], p[1])).join('') + 'Z';
}

export function rect(x1, y1, x2, y2) {
	return `M${j(x1, y1)}H${n(x2)}V${n(y2)}H${n(x1)}Z`;
}

// rounded rect, clockwise, uniform radius
export function rrect(x1, y1, x2, y2, r) {
	const w = x2 - x1, h = y2 - y1;
	r = Math.min(r, w / 2, h / 2);
	return `M${j(x1 + r, y1)}H${n(x2 - r)}` +
		`A${j(r, r)} 0 0 1 ${j(x2, y1 + r)}V${n(y2 - r)}` +
		`A${j(r, r)} 0 0 1 ${j(x2 - r, y2)}H${n(x1 + r)}` +
		`A${j(r, r)} 0 0 1 ${j(x1, y2 - r)}V${n(y1 + r)}` +
		`A${j(r, r)} 0 0 1 ${j(x1 + r, y1)}Z`;
}

// rounded rect with per-corner radii [tl, tr, br, bl]
export function rrect4(x1, y1, x2, y2, [tl, tr, br, bl]) {
	return `M${j(x1 + tl, y1)}H${n(x2 - tr)}` +
		(tr ? `A${j(tr, tr)} 0 0 1 ${j(x2, y1 + tr)}` : '') + `V${n(y2 - br)}` +
		(br ? `A${j(br, br)} 0 0 1 ${j(x2 - br, y2)}` : '') + `H${n(x1 + bl)}` +
		(bl ? `A${j(bl, bl)} 0 0 1 ${j(x1, y2 - bl)}` : '') + `V${n(y1 + tl)}` +
		(tl ? `A${j(tl, tl)} 0 0 1 ${j(x1 + tl, y1)}` : '') + 'Z';
}

export function circle(cx, cy, r) {
	return `M${j(cx - r, cy)}a${j(r, r)} 0 1 1 ${j(2 * r, 0)}a${j(r, r)} 0 1 1 ${j(-2 * r, 0)}Z`;
}

export function ellipse(cx, cy, rx, ry) {
	return `M${j(cx, cy - ry)}a${j(rx, ry)} 0 1 1 ${j(0, 2 * ry)}a${j(rx, ry)} 0 1 1 ${j(0, -2 * ry)}Z`;
}

// a thick straight limb from a to b
export function limb(ax, ay, bx, by, w) {
	const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy);
	const px = (-dy / L) * (w / 2), py = (dx / L) * (w / 2);
	return poly([[ax + px, ay + py], [bx + px, by + py], [bx - px, by - py], [ax - px, ay - py]]);
}

// polyline of constant width, mitred at the joints (used for checks, chevrons, W)
export function stroke(pts, w) {
	const h = w / 2;
	const nrm = [];
	for (let i = 0; i < pts.length - 1; i++) {
		const dx = pts[i + 1][0] - pts[i][0], dy = pts[i + 1][1] - pts[i][1];
		const L = Math.hypot(dx, dy);
		nrm.push([-dy / L, dx / L]);
	}
	const side = (s) => {
		const out = [];
		out.push([pts[0][0] + s * h * nrm[0][0], pts[0][1] + s * h * nrm[0][1]]);
		for (let i = 1; i < pts.length - 1; i++) {
			// mitre: intersect the two offset lines
			const [ax, ay] = pts[i - 1], [bx, by] = pts[i], [cx, cy] = pts[i + 1];
			const n1 = nrm[i - 1], n2 = nrm[i];
			const p1 = [ax + s * h * n1[0], ay + s * h * n1[1]];
			const d1 = [bx - ax, by - ay];
			const p2 = [bx + s * h * n2[0], by + s * h * n2[1]];
			const d2 = [cx - bx, cy - by];
			const den = d1[0] * d2[1] - d1[1] * d2[0];
			if (Math.abs(den) < 1e-6) { out.push([bx + s * h * n1[0], by + s * h * n1[1]]); continue; }
			const t = ((p2[0] - p1[0]) * d2[1] - (p2[1] - p1[1]) * d2[0]) / den;
			out.push([p1[0] + t * d1[0], p1[1] + t * d1[1]]);
		}
		const k = pts.length - 1, nk = nrm[k - 1];
		out.push([pts[k][0] + s * h * nk[0], pts[k][1] + s * h * nk[1]]);
		return out;
	};
	return poly([...side(1), ...side(-1).reverse()]);
}

// ---- path transform (absolute commands only) ------------------------------
// shape := array of ['M',x,y] | ['L',x,y] | ['C',x1,y1,x2,y2,x,y] | ['Q',..] | ['Z']
export function xf(shape, sx, sy, tx, ty) {
	const X = (v) => v * sx + tx, Y = (v) => v * sy + ty;
	let out = '', prev = '';
	for (const s of shape) {
		const c = s[0];
		if (c === 'Z') { out += 'Z'; prev = ''; continue; }
		const v = [];
		for (let i = 1; i < s.length; i += 2) { v.push(X(s[i]), Y(s[i + 1])); }
		const body = j(...v);
		if (c === prev && c !== 'M') { out += body.startsWith('-') ? body : ' ' + body; }
		else { out += c + body; prev = c; }
	}
	return out;
}

// mirror a shape about x = m
export function mirror(shape, m) {
	return shape.map(s => s[0] === 'Z' ? s :
		[s[0], ...s.slice(1).map((v, i) => (i % 2 === 0 ? 2 * m - v : v))]);
}

// ---- reusable donor shapes ------------------------------------------------

// canon json.svg left brace, x 3.1->6.7, y 2->14
export const BRACE_L = [
	['M', 6.7, 2], ['C', 5.35, 2, 4.6, 2.75, 4.6, 4.1], ['L', 4.6, 6.05],
	['C', 4.6, 6.75, 4.05, 7.15, 3.1, 7.15], ['L', 3.1, 8.85],
	['C', 4.05, 8.85, 4.6, 9.25, 4.6, 9.95], ['L', 4.6, 11.9],
	['C', 4.6, 13.25, 5.35, 14, 6.7, 14], ['L', 6.7, 12.3],
	['C', 6.5, 12.3, 6.3, 12.15, 6.3, 11.9], ['L', 6.3, 9.95],
	['C', 6.3, 9, 5.9, 8.35, 5.15, 8], ['C', 5.9, 7.65, 6.3, 7, 6.3, 6.05],
	['L', 6.3, 4.1], ['C', 6.3, 3.85, 6.5, 3.7, 6.7, 3.7], ['Z']
];

// canon vscode.svg fold mark, x 1.71->14.28, y 1.78->14.25 (evenodd)
export const VSCODE_MARK = [
	['M', 11.2, 1.78], ['L', 13.9, 3.07], ['L', 14.28, 3.69], ['L', 14.28, 12.32],
	['L', 13.9, 12.95], ['L', 10.66, 14.25], ['L', 5.26, 9.52], ['L', 3.01, 11.23],
	['L', 1.71, 10.54], ['L', 1.71, 5.48], ['L', 3.01, 4.79], ['L', 5.26, 6.5], ['Z'],
	['M', 11.2, 5.14], ['L', 7.28, 8.01], ['L', 11.2, 10.88], ['Z']
];

// ---- letters --------------------------------------------------------------

// BADGE letters: R5 (ink width first) + §5 law 1 applied to the ink box.
export function badgeText(text, fill, opts = {}) {
	const { inkW, letterSpacing = 0, font = 'bold', xheight = false } = opts;
	let size = 7;
	for (let i = 0; i < 30; i++) {
		const r = letterPath({ text, size, cx: 8, baseline: 0, letterSpacing, font });
		if (Math.abs(r.ink.w - inkW) < 0.004) { break; }
		size *= inkW / r.ink.w;
	}
	const probe = letterPath({ text, size, cx: 8, baseline: 0, letterSpacing, font });
	const inkBottom = 15 - 0.41 * (14 - probe.ink.h);
	const baseline = inkBottom - probe.ink.y2;
	const r = letterPath({ text, size, cx: 8, baseline, letterSpacing, font });
	void xheight;
	return { d: r.d, path: `<path fill="${fill}" d="${r.d}"/>`, ink: r.ink, size: r.fontSize };
}

// GLYPH letters: §5 law 2 — the band is centred on the mark's optical centre.
export function glyphText(text, fill, opts = {}) {
	const r = letterPath({ text, cx: opts.cx ?? 8, cy: opts.cy ?? 8, band: opts.band || 'cap',
		cap: opts.cap, xheight: opts.xheight, size: opts.size, inkHeight: opts.inkHeight,
		letterSpacing: opts.letterSpacing || 0, font: opts.font || 'bold' });
	return { d: r.d, path: `<path fill="${fill}" d="${r.d}"/>`, ink: r.ink, size: r.fontSize };
}

// GLYPH letters sized by ink width (R5's discipline, law-2 centring).
export function glyphTextW(text, fill, opts = {}) {
	const { inkW, cy = 8, band = 'cap', letterSpacing = 0, font = 'bold' } = opts;
	let size = 7;
	for (let i = 0; i < 30; i++) {
		const r = letterPath({ text, size, cx: 8, cy, band, letterSpacing, font });
		if (Math.abs(r.ink.w - inkW) < 0.004) { break; }
		size *= inkW / r.ink.w;
	}
	const r = letterPath({ text, size, cx: 8, cy, band, letterSpacing, font });
	return { d: r.d, path: `<path fill="${fill}" d="${r.d}"/>`, ink: r.ink, size: r.fontSize };
}

// an ellipse rotated `rot` degrees about its centre
export function ellipseRot(cx, cy, rx, ry, rot) {
	const t = rot * Math.PI / 180;
	const x0 = cx + rx * Math.cos(t), y0 = cy + rx * Math.sin(t);
	const x1 = cx - rx * Math.cos(t), y1 = cy - rx * Math.sin(t);
	return `M${n(x0)} ${n(y0)}A${n(rx)} ${n(ry)} ${n(rot)} 1 1 ${n(x1)} ${n(y1)}` +
		`A${n(rx)} ${n(ry)} ${n(rot)} 1 1 ${n(x0)} ${n(y0)}Z`;
}

// a triangle shrunk toward its centroid, so neighbours in a mesh keep a gap
export function tri(a, b, c, inset) {
	const gx = (a[0] + b[0] + c[0]) / 3, gy = (a[1] + b[1] + c[1]) / 3;
	const pull = (p) => {
		const dx = gx - p[0], dy = gy - p[1], L = Math.hypot(dx, dy);
		return [p[0] + dx / L * inset, p[1] + dy / L * inset];
	};
	return poly([pull(a), pull(b), pull(c)]);
}

export function svg(body) {
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${body}</svg>`;
}

export function path(fill, d, evenodd = false) {
	return `<path fill="${fill}"${evenodd ? ' fill-rule="evenodd"' : ''} d="${d}"/>`;
}

export function plate(fill) {
	return `<rect x="1" y="1" width="14" height="14" rx="3" fill="${fill}"/>`;
}
