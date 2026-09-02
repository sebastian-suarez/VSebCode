// F02-geom.mjs — emblem authoring field (0–10) -> R9a folder boxes.
//
// R9a: closed = 8.20 box at x 5.30–13.50 / y 4.60–12.80  (s = .82, o = 5.30, 4.60)
//      open   = 5.80 box at x 7.26–13.06 / y 6.75–12.55  (s = .58, o = 7.26, 6.75)
// One uniform scale + translate, so the whole geometry IS the box.
//
// Feature floors, expressed in the 0–10 field: stems >= 2.0 units (1.64 px closed),
// counters >= 1.2 units (0.98 px closed).

export const BOX = {
	closed: { s: 8.20 / 10, ox: 5.30, oy: 4.60 },
	open: { s: 5.80 / 10, ox: 7.26, oy: 6.75 }
};

const RAD = Math.PI / 180;
export const P = (a, r, cx = 5, cy = 5) => [cx + r * Math.cos(a * RAD), cy + r * Math.sin(a * RAD)];

// ---- command builders (absolute, unit space) --------------------------------
const M = (x, y) => ({ c: 'M', p: [x, y] });
const L = (x, y) => ({ c: 'L', p: [x, y] });
const C = (x1, y1, x2, y2, x, y) => ({ c: 'C', p: [x1, y1, x2, y2, x, y] });
const Q = (x1, y1, x, y) => ({ c: 'Q', p: [x1, y1, x, y] });
const A = (rx, ry, rot, laf, sf, x, y) => ({ c: 'A', r: [rx, ry], rot, laf, sf, p: [x, y] });
const Z = () => ({ c: 'Z' });
export { M, L, C, Q, A, Z };

// ---- shapes -----------------------------------------------------------------
// Every solid shape is wound clockwise on screen (y down); pass ccw:true for a hole.

export function poly(pts, ccw = false) {
	const p = ccw ? [...pts].reverse() : pts;
	return [M(...p[0]), ...p.slice(1).map(q => L(...q)), Z()];
}

export function rect(x, y, w, h, ccw = false) {
	return poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], ccw);
}

export function rrect(x, y, w, h, r, ccw = false) {
	r = Math.min(r, w / 2, h / 2);
	const sf = ccw ? 0 : 1;
	const cw = [
		M(x + r, y), L(x + w - r, y), A(r, r, 0, 0, 1, x + w, y + r),
		L(x + w, y + h - r), A(r, r, 0, 0, 1, x + w - r, y + h),
		L(x + r, y + h), A(r, r, 0, 0, 1, x, y + h - r),
		L(x, y + r), A(r, r, 0, 0, 1, x + r, y), Z()
	];
	if (!ccw) { return cw; }
	return [
		M(x + r, y), A(r, r, 0, 0, 0, x, y + r),
		L(x, y + h - r), A(r, r, 0, 0, 0, x + r, y + h),
		L(x + w - r, y + h), A(r, r, 0, 0, 0, x + w, y + h - r),
		L(x + w, y + r), A(r, r, 0, 0, 0, x + w - r, y), Z()
	];
}

export function circle(cx, cy, r, ccw = false) {
	const sf = ccw ? 0 : 1;
	return [M(cx - r, cy), A(r, r, 0, 0, sf, cx + r, cy), A(r, r, 0, 0, sf, cx - r, cy), Z()];
}

export function ellipse(cx, cy, rx, ry, rot = 0, ccw = false) {
	const sf = ccw ? 0 : 1;
	const dx = rx * Math.cos(rot * RAD), dy = rx * Math.sin(rot * RAD);
	const a = [cx - dx, cy - dy], b = [cx + dx, cy + dy];
	return [M(...a), A(rx, ry, rot, 0, sf, ...b), A(rx, ry, rot, 0, sf, ...a), Z()];
}

// Straight bar with square ends, `t` thick, centred on the segment.
export function bar(x1, y1, x2, y2, t, ccw = false) {
	const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
	const nx = -dy / len * t / 2, ny = dx / len * t / 2;
	return poly([[x1 + nx, y1 + ny], [x2 + nx, y2 + ny], [x2 - nx, y2 - ny], [x1 - nx, y1 - ny]], ccw);
}

// Straight bar with round ends (stadium).
export function capsule(x1, y1, x2, y2, t, ccw = false) {
	const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy), r = t / 2;
	const nx = -dy / len * r, ny = dx / len * r;
	const sf = ccw ? 0 : 1;
	const seq = [
		M(x1 + nx, y1 + ny), L(x2 + nx, y2 + ny), A(r, r, 0, 0, 1, x2 - nx, y2 - ny),
		L(x1 - nx, y1 - ny), A(r, r, 0, 0, 1, x1 + nx, y1 + ny), Z()
	];
	if (!ccw) { return seq; }
	return [
		M(x1 + nx, y1 + ny), A(r, r, 0, 0, 0, x1 - nx, y1 - ny), L(x2 - nx, y2 - ny),
		A(r, r, 0, 0, 0, x2 + nx, y2 + ny), L(x1 + nx, y1 + ny), Z()
	];
}

// Cross / plus as ONE polygon (overlapping holes would cancel under nonzero — R11).
export function plus(cx, cy, span, t, ccw = false) {
	const a = span / 2, b = t / 2;
	return poly([
		[cx - b, cy - a], [cx + b, cy - a], [cx + b, cy - b], [cx + a, cy - b],
		[cx + a, cy + b], [cx + b, cy + b], [cx + b, cy + a], [cx - b, cy + a],
		[cx - b, cy + b], [cx - a, cy + b], [cx - a, cy - b], [cx - b, cy - b]
	], ccw);
}

// Annular band from a0 to a1 (degrees, increasing = clockwise on screen).
export function arcBand(cx, cy, R, r, a0, a1, ccw = false) {
	const sweep = ((a1 - a0) % 360 + 360) % 360;
	const laf = sweep > 180 ? 1 : 0;
	const o0 = P(a0, R, cx, cy), o1 = P(a1, R, cx, cy);
	const i0 = P(a0, r, cx, cy), i1 = P(a1, r, cx, cy);
	if (!ccw) {
		return [M(...o0), A(R, R, 0, laf, 1, ...o1), L(...i1), A(r, r, 0, laf, 0, ...i0), Z()];
	}
	return [M(...o0), L(...i0), A(r, r, 0, laf, 1, ...i1), L(...o1), A(R, R, 0, laf, 0, ...o0), Z()];
}

// Elliptical ring, rotated: outer CW + inner CCW (one hole).
export function ellipseRing(cx, cy, RX, RY, rx, ry, rot) {
	return [...ellipse(cx, cy, RX, RY, rot, false), ...ellipse(cx, cy, rx, ry, rot, true)];
}

export function star(cx, cy, R, r, points = 5, startDeg = -90) {
	const pts = [];
	for (let i = 0; i < points * 2; i++) {
		pts.push(P(startDeg + i * 180 / points, i % 2 ? r : R, cx, cy));
	}
	return poly(pts);
}

// ---- polygon edge inset (used by the cubit cube) ----------------------------
// offs[i] insets edge pts[i]->pts[i+1] toward the polygon interior.
export function insetPoly(pts, offs) {
	const n = pts.length;
	let area = 0;
	for (let i = 0; i < n; i++) {
		const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % n];
		area += x1 * y2 - x2 * y1;
	}
	const sign = area > 0 ? 1 : -1;          // interior normal orientation
	const lines = pts.map((p, i) => {
		const q = pts[(i + 1) % n];
		const dx = q[0] - p[0], dy = q[1] - p[1], len = Math.hypot(dx, dy);
		const nx = sign * dy / len, ny = -sign * dx / len;   // points into the interior
		const d = offs[i] || 0;
		return { a: [p[0] + nx * d, p[1] + ny * d], b: [q[0] + nx * d, q[1] + ny * d] };
	});
	const out = [];
	for (let i = 0; i < n; i++) {
		const l1 = lines[(i - 1 + n) % n], l2 = lines[i];
		const [x1, y1] = l1.a, [x2, y2] = l1.b, [x3, y3] = l2.a, [x4, y4] = l2.b;
		const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
		if (Math.abs(den) < 1e-9) { out.push(l2.a); continue; }
		const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
		out.push([x1 + t * (x2 - x1), y1 + t * (y2 - y1)]);
	}
	return out;
}

// Uniformly refit a straight-line command list into the 0–10 field (polygons only).
export function fitPolys(cmds, lo = 0, hi = 10) {
	const e = extents(cmds), w = e.x1 - e.x0, h = e.y1 - e.y0;
	const s = (hi - lo) / Math.max(w, h);
	const ox = lo + ((hi - lo) - w * s) / 2 - e.x0 * s;
	const oy = lo + ((hi - lo) - h * s) / 2 - e.y0 * s;
	return cmds.map(c => c.c === 'Z' ? c
		: { ...c, p: c.p.map((v, i) => (i % 2 ? oy + s * v : ox + s * v)) });
}

// ---- serialise --------------------------------------------------------------
const num = (v) => {
	let s = v.toFixed(2);
	if (s.includes('.')) { s = s.replace(/0+$/, '').replace(/\.$/, ''); }
	if (s === '-0') { s = '0'; }
	return s.replace(/^(-?)0\./, '$1.');
};

export function toPath(cmds, box) {
	const { s, ox, oy } = box;
	const X = (v) => num(ox + s * v), Y = (v) => num(oy + s * v), R = (v) => num(s * v);
	let out = '', prev = '';
	for (const c of cmds) {
		if (c.c === 'Z') { out += 'Z'; prev = 'Z'; continue; }
		let args;
		if (c.c === 'A') {
			args = `${R(c.r[0])} ${R(c.r[1])} ${c.rot} ${c.laf} ${c.sf} ${X(c.p[0])} ${Y(c.p[1])}`;
		} else {
			args = c.p.map((v, i) => (i % 2 ? Y(v) : X(v))).join(' ');
		}
		if (c.c === prev && c.c !== 'M') { out += ' ' + args; }
		else { out += (out && !/[A-Za-z]$/.test(out) ? '' : '') + c.c + args; prev = c.c; }
	}
	return out.replace(/([A-Za-z])\s+/g, '$1');
}

// Ink extents of a command list in unit space (control points included — an
// over-estimate for curves, which is the safe direction for a spill check).
export function extents(cmds) {
	let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
	for (const c of cmds) {
		if (c.c === 'Z') { continue; }
		for (let i = 0; i < c.p.length; i += 2) {
			x0 = Math.min(x0, c.p[i]); x1 = Math.max(x1, c.p[i]);
			y0 = Math.min(y0, c.p[i + 1]); y1 = Math.max(y1, c.p[i + 1]);
		}
	}
	return { x0, y0, x1, y1 };
}
