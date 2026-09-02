// geom.mjs — field-unit shape primitives + a field->icon transform.
// Emblems are authored in a 0..10 "field" and mapped into the folder's
// bottom-right emblem box by a uniform scale + translate.

import { letterPath } from '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/tools/letterpath.mjs';

// ---- primitives (field units, y down) --------------------------------------

export const M = (x, y) => ['M', x, y];
export const L = (x, y) => ['L', x, y];
export const Z = () => ['Z'];

export function rect(x, y, w, h, r = 0) {
	if (!r) { return [['M', x, y], ['L', x + w, y], ['L', x + w, y + h], ['L', x, y + h], ['Z']]; }
	r = Math.min(r, w / 2, h / 2);
	return [
		['M', x + r, y], ['L', x + w - r, y], ['A', r, r, 0, 0, 1, x + w, y + r],
		['L', x + w, y + h - r], ['A', r, r, 0, 0, 1, x + w - r, y + h],
		['L', x + r, y + h], ['A', r, r, 0, 0, 1, x, y + h - r],
		['L', x, y + r], ['A', r, r, 0, 0, 1, x + r, y], ['Z']
	];
}

export const circle = (cx, cy, r) => ellipse(cx, cy, r, r);

export function ellipse(cx, cy, rx, ry) {
	return [
		['M', cx - rx, cy],
		['A', rx, ry, 0, 0, 1, cx + rx, cy],
		['A', rx, ry, 0, 0, 1, cx - rx, cy],
		['Z']
	];
}

export function poly(pts) {
	const out = [['M', pts[0][0], pts[0][1]]];
	for (let i = 1; i < pts.length; i++) { out.push(['L', pts[i][0], pts[i][1]]); }
	out.push(['Z']);
	return out;
}

// Thick open polyline with mitred joints; `h` is the HALF width.
export function thick(pts, h) {
	const n = pts.length;
	const dirs = [], nrm = [];
	for (let i = 0; i < n - 1; i++) {
		const dx = pts[i + 1][0] - pts[i][0], dy = pts[i + 1][1] - pts[i][1];
		const len = Math.hypot(dx, dy);
		dirs.push([dx / len, dy / len]);
		nrm.push([dy / len, -dx / len]);
	}
	const side = (s) => {
		const v = [[pts[0][0] + s * h * nrm[0][0], pts[0][1] + s * h * nrm[0][1]]];
		for (let i = 1; i < n - 1; i++) {
			const a = [pts[i - 1][0] + s * h * nrm[i - 1][0], pts[i - 1][1] + s * h * nrm[i - 1][1]];
			const b = [pts[i][0] + s * h * nrm[i][0], pts[i][1] + s * h * nrm[i][1]];
			v.push(isect(a, dirs[i - 1], b, dirs[i]));
		}
		const k = n - 2;
		v.push([pts[n - 1][0] + s * h * nrm[k][0], pts[n - 1][1] + s * h * nrm[k][1]]);
		return v;
	};
	return poly([...side(1), ...side(-1).reverse()]);
}

function isect(p, d, q, e) {
	const den = d[0] * e[1] - d[1] * e[0];
	if (Math.abs(den) < 1e-9) { return [q[0], q[1]]; }
	const t = ((q[0] - p[0]) * e[1] - (q[1] - p[1]) * e[0]) / den;
	return [p[0] + t * d[0], p[1] + t * d[1]];
}

// Bar of width w along the segment p1->p2 (square ends).
export const bar = (p1, p2, w) => thick([p1, p2], w / 2);

// Chevron: apex at (ax,ay), arms reaching x = tipX at ay±dy, `perp` thick.
export function chevron(ax, ay, tipX, dy, perp) {
	const dx = tipX - ax;
	const len = Math.hypot(dx, dy);
	const back = perp * len / Math.abs(dx);          // vertical inset at the tips
	// inner apex: walk from the inner tip back along the leg direction
	const innerTipTop = ay - dy + back;
	const innerApexX = tipX - dx * ((ay - innerTipTop) / dy);
	return poly([
		[tipX, ay - dy], [ax, ay], [tipX, ay + dy],
		[tipX, ay + dy - back], [innerApexX, ay], [tipX, innerTipTop]
	]);
}

// Gear outline: n teeth between outer R and root r; a tooth spans `frac` of its pitch.
export function gear(cx, cy, R, r, n, frac) {
	const step = 2 * Math.PI / n;
	const at = step * frac / 2;
	const P = (rad, a) => [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
	const out = [];
	for (let i = 0; i < n; i++) {
		const t = -Math.PI / 2 + i * step;
		const a0 = t - at, a1 = t + at;
		if (i === 0) { out.push(['M', ...P(r, a0)]); } else { out.push(['A', r, r, 0, 0, 1, ...P(r, a0)]); }
		out.push(['L', ...P(R, a0)]);
		out.push(['A', R, R, 0, 0, 1, ...P(R, a1)]);
		out.push(['L', ...P(r, a1)]);
	}
	out.push(['A', r, r, 0, 0, 1, ...P(r, -Math.PI / 2 - at)]);
	out.push(['Z']);
	return out;
}

// A letterform, sized/placed in FIELD units, baked to outlines at emit time.
export const letter = (text, capUnits, cxUnits, cyUnits, spacing = 0) =>
	[['@LETTER', text, capUnits, cxUnits, cyUnits, spacing]];

// ---- serialisation ---------------------------------------------------------

const num = (v) => {
	let s = v.toFixed(2);
	if (s.includes('.')) { s = s.replace(/0+$/, '').replace(/\.$/, ''); }
	if (s === '-0') { s = '0'; }
	return s.replace(/^(-?)0\./, '$1.');
};

/**
 * Map field commands into icon space and serialise.
 * T = { ox, oy, k }  ->  X = ox + x*k, Y = oy + y*k
 */
export function emit(cmds, T) {
	const { ox, oy, k } = T;
	const X = (x) => ox + x * k;
	const Y = (y) => oy + y * k;
	let out = '';
	let prev = '';
	for (const c of cmds) {
		const t = c[0];
		if (t === '@LETTER') {
			const [, text, cap, cx, cy, spacing] = c;
			const r = letterPath({
				text, cap: cap * k, cx: X(cx), cy: Y(cy), band: 'cap',
				letterSpacing: spacing, precision: 2
			});
			out += r.d;
			prev = '';
			continue;
		}
		let args;
		if (t === 'Z') { out += 'Z'; prev = 'Z'; continue; }
		if (t === 'A') {
			args = [num(c[1] * k), num(c[2] * k), num(c[3]), num(c[4]), num(c[5]), num(X(c[6])), num(Y(c[7]))];
		} else {
			args = [];
			for (let i = 1; i < c.length; i += 2) { args.push(num(X(c[i])), num(Y(c[i + 1]))); }
		}
		const body = args.join(' ').replace(/ -/g, '-');
		if (t === prev && t !== 'M') { out += body.startsWith('-') ? body : ' ' + body; }
		else { out += t + body; prev = t; }
	}
	return out;
}
