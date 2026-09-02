// F04-geom.mjs — unit-field (0..10) emblem geometry + the R9a uniform mapping.
//
// Every folder emblem is authored in a 0..10 field and placed into its R9a box by
// ONE uniform scale + translate:
//   closed: 8.20 box at x 5.30..13.50, y 4.60..12.80  ->  s .82, t (5.30, 4.60)
//   open:   5.80 box at x 7.26..13.06, y 6.75..12.55  ->  s .58, t (7.26, 6.75)

export const BOX = {
	closed: { s: 0.82, tx: 5.30, ty: 4.60 },
	open: { s: 0.58, tx: 7.26, ty: 6.75 }
};

// ---- op constructors (absolute coordinates, unit field) --------------------
export const M = (x, y) => ['M', x, y];
export const L = (x, y) => ['L', x, y];
export const C = (x1, y1, x2, y2, x, y) => ['C', x1, y1, x2, y2, x, y];
export const Q = (x1, y1, x, y) => ['Q', x1, y1, x, y];
export const A = (rx, ry, laf, sf, x, y) => ['A', rx, ry, 0, laf, sf, x, y];
export const Z = ['Z'];

const shoelace = (pts) => {
	let a = 0;
	for (let i = 0; i < pts.length; i++) {
		const [x1, y1] = pts[i];
		const [x2, y2] = pts[(i + 1) % pts.length];
		a += x1 * y2 - x2 * y1;
	}
	return a; // > 0 == clockwise on screen (y down)
};

/** Closed polygon, always wound clockwise (dir 1) or counter-clockwise (dir -1). */
export function poly(pts, dir = 1) {
	const cw = shoelace(pts) >= 0;
	const p = (dir === 1) === cw ? pts : pts.slice().reverse();
	return [M(p[0][0], p[0][1]), ...p.slice(1).map(q => L(q[0], q[1])), Z];
}

export const rect = (x, y, w, h, dir = 1) =>
	poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], dir);

/** Rounded rect. dir 1 = clockwise (solid), -1 = counter-clockwise (hole under nonzero). */
export function rrect(x, y, w, h, r, dir = 1) {
	r = Math.min(r, w / 2, h / 2);
	if (dir === 1) {
		return [M(x + r, y), L(x + w - r, y), A(r, r, 0, 1, x + w, y + r),
			L(x + w, y + h - r), A(r, r, 0, 1, x + w - r, y + h),
			L(x + r, y + h), A(r, r, 0, 1, x, y + h - r),
			L(x, y + r), A(r, r, 0, 1, x + r, y), Z];
	}
	return [M(x + r, y), A(r, r, 0, 0, x, y + r),
		L(x, y + h - r), A(r, r, 0, 0, x + r, y + h),
		L(x + w - r, y + h), A(r, r, 0, 0, x + w, y + h - r),
		L(x + w, y + r), A(r, r, 0, 0, x + w - r, y), Z];
}

/** Circle. dir 1 = clockwise (solid), -1 = counter-clockwise (hole under nonzero). */
export function circle(cx, cy, r, dir = 1) {
	const sf = dir === 1 ? 1 : 0;
	return [M(cx - r, cy), A(r, r, 1, sf, cx + r, cy), A(r, r, 1, sf, cx - r, cy), Z];
}

/** Ellipse with independent radii (the db cylinder needs this). */
export function ellipse(cx, cy, rx, ry, dir = 1) {
	const sf = dir === 1 ? 1 : 0;
	return [M(cx - rx, cy), A(rx, ry, 1, sf, cx + rx, cy), A(rx, ry, 1, sf, cx - rx, cy), Z];
}

/** Straight bar of constant width w between two points, wound clockwise. */
export function bar(x1, y1, x2, y2, w) {
	const dx = x2 - x1, dy = y2 - y1;
	const len = Math.hypot(dx, dy);
	const nx = -dy / len * w / 2, ny = dx / len * w / 2;
	return poly([[x1 + nx, y1 + ny], [x2 + nx, y2 + ny], [x2 - nx, y2 - ny], [x1 - nx, y1 - ny]]);
}

/** Bar that tapers from w1 at (x1,y1) to w2 at (x2,y2). */
export function taper(x1, y1, x2, y2, w1, w2) {
	const dx = x2 - x1, dy = y2 - y1;
	const len = Math.hypot(dx, dy);
	const ux = -dy / len, uy = dx / len;
	return poly([
		[x1 + ux * w1 / 2, y1 + uy * w1 / 2], [x2 + ux * w2 / 2, y2 + uy * w2 / 2],
		[x2 - ux * w2 / 2, y2 - uy * w2 / 2], [x1 - ux * w1 / 2, y1 - uy * w1 / 2]]);
}

/** Regular n-gon, first vertex at `rot` radians (0 = east). */
export function ngon(cx, cy, r, n, rot = -Math.PI / 2, dir = 1) {
	const pts = [];
	for (let i = 0; i < n; i++) {
		const a = rot + i * 2 * Math.PI / n;
		pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
	}
	return poly(pts, dir);
}

/**
 * Crescent: the part of circle 1 that circle 2 does not cover, as ONE closed
 * subpath (a boolean subtraction cannot be expressed by winding when the cutter
 * pokes outside the cut shape).
 */
export function crescent(cx1, cy1, r1, cx2, cy2, r2) {
	const dx = cx2 - cx1, dy = cy2 - cy1;
	const d = Math.hypot(dx, dy);
	const a = (d * d + r1 * r1 - r2 * r2) / (2 * d);
	const h = Math.sqrt(r1 * r1 - a * a);
	const ux = dx / d, uy = dy / d;
	const px = cx1 + a * ux, py = cy1 + a * uy;
	const i1 = [px + h * -uy, py + h * ux];
	const i2 = [px - h * -uy, py - h * ux];
	// outer: the long way round circle 1; inner: back along circle 2.
	const ang = (c, p) => Math.atan2(p[1] - c[1], p[0] - c[0]);
	const norm = (t) => (t % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
	const o1 = ang([cx1, cy1], i2), o2 = ang([cx1, cy1], i1);
	// keep the outer arc that lies OUTSIDE circle 2 — the other one is what the
	// cut removes.
	const midOut = (s) => {
		const t = s === 1 ? o1 + norm(o2 - o1) / 2 : o1 - norm(o1 - o2) / 2;
		return [cx1 + r1 * Math.cos(t), cy1 + r1 * Math.sin(t)];
	};
	const far = (p) => Math.hypot(p[0] - cx2, p[1] - cy2);
	const sweepOut = far(midOut(1)) > far(midOut(0)) ? 1 : 0;
	const outLaf = norm(sweepOut === 1 ? o2 - o1 : o1 - o2) > Math.PI ? 1 : 0;
	const n1 = ang([cx2, cy2], i1), n2 = ang([cx2, cy2], i2);
	// the inner edge must bow towards circle 1's centre: pick the arc whose
	// midpoint is nearer to (cx1, cy1).
	const mid = (s) => {
		const t = s === 1 ? n1 + norm(n2 - n1) / 2 : n1 - norm(n1 - n2) / 2;
		return [cx2 + r2 * Math.cos(t), cy2 + r2 * Math.sin(t)];
	};
	const dist = (p) => Math.hypot(p[0] - cx1, p[1] - cy1);
	const sweepIn = dist(mid(1)) < dist(mid(0)) ? 1 : 0;
	const inLaf = norm(sweepIn === 1 ? n2 - n1 : n1 - n2) > Math.PI ? 1 : 0;
	return [M(i2[0], i2[1]), A(r1, r1, outLaf, sweepOut, i1[0], i1[1]),
		A(r2, r2, inLaf, sweepIn, i2[0], i2[1]), Z];
}

/** Annular sector: outer arc a1 -> a2 (radians, y down), inner arc back. */
export function arcBand(cx, cy, rIn, rOut, a1, a2) {
	const p = (r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
	const laf = Math.abs(a2 - a1) > Math.PI ? 1 : 0;
	const sf = a2 > a1 ? 1 : 0;
	const o1 = p(rOut, a1), o2 = p(rOut, a2), i2 = p(rIn, a2), i1 = p(rIn, a1);
	return [M(o1[0], o1[1]), A(rOut, rOut, laf, sf, o2[0], o2[1]),
		L(i2[0], i2[1]), A(rIn, rIn, laf, sf ? 0 : 1, i1[0], i1[1]), Z];
}

/** One thick horizontal sine-ish wave band, left to right. */
export function wave(x1, x2, yMid, amp, thick) {
	const q = (x2 - x1) / 4;
	const top = yMid - thick / 2, bot = yMid + thick / 2;
	return [
		M(x1, top),
		C(x1 + q * 0.75, top - amp * 1.35, x1 + q * 1.25, top - amp * 1.35, x1 + 2 * q, top),
		C(x1 + q * 2.75, top + amp * 1.35, x1 + q * 3.25, top + amp * 1.35, x2, top),
		L(x2, bot),
		C(x1 + q * 3.25, bot + amp * 1.35, x1 + q * 2.75, bot + amp * 1.35, x1 + 2 * q, bot),
		C(x1 + q * 1.25, bot - amp * 1.35, x1 + q * 0.75, bot - amp * 1.35, x1, bot),
		Z];
}

// ---- transform + serialise -------------------------------------------------
export function mapOps(ops, s, tx, ty) {
	return ops.map(op => {
		switch (op[0]) {
			case 'Z': return op;
			case 'A': return ['A', op[1] * s, op[2] * s, op[3], op[4], op[5], op[6] * s + tx, op[7] * s + ty];
			default: {
				const out = [op[0]];
				for (let i = 1; i < op.length; i += 2) { out.push(op[i] * s + tx, op[i + 1] * s + ty); }
				return out;
			}
		}
	});
}

const num = (v) => {
	let s = (Math.round(v * 100) / 100).toFixed(2);
	s = s.replace(/0+$/, '').replace(/\.$/, '');
	if (s === '-0') { s = '0'; }
	return s.replace(/^(-?)0\./, '$1.');
};

export function serialize(ops) {
	let out = '';
	for (const op of ops) {
		if (op[0] === 'Z') { out += 'Z'; continue; }
		out += op[0] + op.slice(1).map(num).join(' ').replace(/ -/g, '-');
	}
	return out;
}

// ---- flattening, for the geometric spill check -----------------------------
function arcPoints(x0, y0, rx, ry, rot, laf, sf, x1, y1) {
	// endpoint -> centre parameterisation (SVG implementation notes F.6.5)
	const cosR = Math.cos(rot), sinR = Math.sin(rot);
	const dx2 = (x0 - x1) / 2, dy2 = (y0 - y1) / 2;
	const x1p = cosR * dx2 + sinR * dy2, y1p = -sinR * dx2 + cosR * dy2;
	rx = Math.abs(rx); ry = Math.abs(ry);
	const l = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
	if (l > 1) { rx *= Math.sqrt(l); ry *= Math.sqrt(l); }
	const den = rx * rx * y1p * y1p + ry * ry * x1p * x1p;
	let k = (rx * rx * ry * ry - den) / den;
	k = Math.sqrt(Math.max(0, k)) * (laf === sf ? -1 : 1);
	const cxp = k * rx * y1p / ry, cyp = -k * ry * x1p / rx;
	const cx = cosR * cxp - sinR * cyp + (x0 + x1) / 2;
	const cy = sinR * cxp + cosR * cyp + (y0 + y1) / 2;
	const ang = (ux, uy, vx, vy) => {
		const s = Math.sign(ux * vy - uy * vx) || 1;
		const c = (ux * vx + uy * vy) / (Math.hypot(ux, uy) * Math.hypot(vx, vy));
		return s * Math.acos(Math.min(1, Math.max(-1, c)));
	};
	const t1 = ang(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry);
	let dt = ang((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry);
	if (!sf && dt > 0) { dt -= 2 * Math.PI; } else if (sf && dt < 0) { dt += 2 * Math.PI; }
	const out = [];
	const n = Math.max(8, Math.ceil(Math.abs(dt) / (Math.PI / 24)));
	for (let i = 0; i <= n; i++) {
		const t = t1 + dt * i / n;
		out.push([cx + rx * Math.cos(t) * cosR - ry * Math.sin(t) * sinR,
			cy + rx * Math.cos(t) * sinR + ry * Math.sin(t) * cosR]);
	}
	return out;
}

/** Every point the path actually visits — control points are never trusted. */
export function flatten(ops) {
	const pts = [];
	let cx = 0, cy = 0, sx = 0, sy = 0;
	for (const op of ops) {
		if (op[0] === 'M') { cx = op[1]; cy = op[2]; sx = cx; sy = cy; pts.push([cx, cy]); }
		else if (op[0] === 'L') { cx = op[1]; cy = op[2]; pts.push([cx, cy]); }
		else if (op[0] === 'Z') { cx = sx; cy = sy; pts.push([cx, cy]); }
		else if (op[0] === 'C') {
			const [, x1, y1, x2, y2, x, y] = op;
			for (let i = 1; i <= 24; i++) {
				const t = i / 24, u = 1 - t;
				pts.push([u * u * u * cx + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x,
					u * u * u * cy + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y]);
			}
			cx = x; cy = y;
		} else if (op[0] === 'Q') {
			const [, x1, y1, x, y] = op;
			for (let i = 1; i <= 24; i++) {
				const t = i / 24, u = 1 - t;
				pts.push([u * u * cx + 2 * u * t * x1 + t * t * x, u * u * cy + 2 * u * t * y1 + t * t * y]);
			}
			cx = x; cy = y;
		} else if (op[0] === 'A') {
			const [, rx, ry, rot, laf, sf, x, y] = op;
			pts.push(...arcPoints(cx, cy, rx, ry, rot, laf, sf, x, y));
			cx = x; cy = y;
		}
	}
	return pts;
}

export function bbox(ops) {
	const pts = flatten(ops);
	return {
		x1: Math.min(...pts.map(p => p[0])), y1: Math.min(...pts.map(p => p[1])),
		x2: Math.max(...pts.map(p => p[0])), y2: Math.max(...pts.map(p => p[1]))
	};
}
