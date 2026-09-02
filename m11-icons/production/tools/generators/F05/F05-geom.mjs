// F05-geom.mjs — emblem geometry primitives for folder slice F05.
//
// Emblems are authored in a 0..10 field (R9a: "authored in a 0-10 field and placed by one
// uniform scale + translate"), centred on (5,5), then mapped into the two ruled boxes:
//   closed: 8.20 box at x 5.30-13.50, y 4.60-12.80   -> s = .82, o = (5.30, 4.60)
//   open:   5.80 box at x 7.26-13.06, y 6.75-12.55   -> s = .58, o = (7.26, 6.75)
//
// Winding: every outer subpath is CLOCKWISE (positive shoelace in y-down), every hole is
// COUNTER-CLOCKWISE, so nonzero fill unions overlapping parts and knocks out holes without
// the R11 cancellation trap. No fill-rule attribute is needed anywhere.

// ---------------------------------------------------------------- number formatting

export function num(v) {
	let s = v.toFixed(2);
	if (s.includes('.')) { s = s.replace(/0+$/, '').replace(/\.$/, ''); }
	if (s === '-0') { s = '0'; }
	return s.replace(/^(-?)0\./, '$1.');
}

// ---------------------------------------------------------------- segment model
// A primitive is { segs, bbox }. segs is a list of commands in FIELD coordinates:
//   ['M', x, y] ['L', x, y] ['Q', cx, cy, x, y] ['C', c1x, c1y, c2x, c2y, x, y]
//   ['A', r, sweep, x, y]   (circular only: rx = ry = r, rotation 0, large-arc computed)
//   ['A2', r, largeArc, sweep, x, y]
//   ['Z']

const shoelace = (pts) => {
	let a = 0;
	for (let i = 0; i < pts.length; i++) {
		const [x1, y1] = pts[i];
		const [x2, y2] = pts[(i + 1) % pts.length];
		a += x1 * y2 - x2 * y1;
	}
	return a;
};

const bboxOf = (pts) => [
	Math.min(...pts.map(p => p[0])), Math.min(...pts.map(p => p[1])),
	Math.max(...pts.map(p => p[0])), Math.max(...pts.map(p => p[1]))
];

export const merge = (...bs) => [
	Math.min(...bs.map(b => b[0])), Math.min(...bs.map(b => b[1])),
	Math.max(...bs.map(b => b[2])), Math.max(...bs.map(b => b[3]))
];

// ---------------------------------------------------------------- builders

/** Closed polygon, wound clockwise (outer) or counter-clockwise (hole). */
export function poly(pts, hole = false) {
	const want = hole ? -1 : 1;
	const p = shoelace(pts) * want > 0 ? pts : [...pts].reverse();
	const segs = [['M', p[0][0], p[0][1]], ...p.slice(1).map(q => ['L', q[0], q[1]]), ['Z']];
	return { segs, bbox: bboxOf(pts) };
}
export const polyHole = (pts) => poly(pts, true);

/** Rounded rectangle. r = 0 gives a plain rect. */
export function rrect(x, y, w, h, r = 0, hole = false) {
	r = Math.min(r, w / 2, h / 2);
	const s = hole ? 0 : 1;
	let segs;
	if (r <= 0) {
		segs = hole
			? [['M', x, y], ['L', x, y + h], ['L', x + w, y + h], ['L', x + w, y], ['Z']]
			: [['M', x, y], ['L', x + w, y], ['L', x + w, y + h], ['L', x, y + h], ['Z']];
	} else if (!hole) {
		segs = [
			['M', x + r, y], ['L', x + w - r, y], ['A', r, 1, x + w, y + r],
			['L', x + w, y + h - r], ['A', r, 1, x + w - r, y + h],
			['L', x + r, y + h], ['A', r, 1, x, y + h - r],
			['L', x, y + r], ['A', r, 1, x + r, y], ['Z']
		];
	} else {
		segs = [
			['M', x + r, y], ['A', r, 0, x, y + r],
			['L', x, y + h - r], ['A', r, 0, x + r, y + h],
			['L', x + w - r, y + h], ['A', r, 0, x + w, y + h - r],
			['L', x + w, y + r], ['A', r, 0, x + w - r, y], ['Z']
		];
	}
	return { segs, bbox: [x, y, x + w, y + h] };
}
export const rrectHole = (x, y, w, h, r = 0) => rrect(x, y, w, h, r, true);

/** Full circle. */
export function circle(cx, cy, r, hole = false) {
	const sw = hole ? 0 : 1;
	return {
		segs: [['M', cx - r, cy], ['A', r, sw, cx + r, cy], ['A', r, sw, cx - r, cy], ['Z']],
		bbox: [cx - r, cy - r, cx + r, cy + r]
	};
}
export const circleHole = (cx, cy, r) => circle(cx, cy, r, true);

/** Annulus = solid disc + concentric hole. Returns two primitives. */
export const ring = (cx, cy, ro, ri) => [circle(cx, cy, ro), circleHole(cx, cy, ri)];

/** Thick line with square ends, from p1 to p2, total width w. */
export function bar(x1, y1, x2, y2, w) {
	const dx = x2 - x1, dy = y2 - y1;
	const len = Math.hypot(dx, dy);
	const nx = (dy / len) * (w / 2), ny = (-dx / len) * (w / 2);
	return poly([[x1 + nx, y1 + ny], [x2 + nx, y2 + ny], [x2 - nx, y2 - ny], [x1 - nx, y1 - ny]]);
}

/** Thick line with round ends (a stadium), from p1 to p2, total width w. */
export function capsule(x1, y1, x2, y2, w) {
	const dx = x2 - x1, dy = y2 - y1;
	const len = Math.hypot(dx, dy);
	const hw = w / 2;
	const nx = (dy / len) * hw, ny = (-dx / len) * hw;
	return {
		segs: [
			['M', x1 + nx, y1 + ny], ['L', x2 + nx, y2 + ny], ['A', hw, 1, x2 - nx, y2 - ny],
			['L', x1 - nx, y1 - ny], ['A', hw, 1, x1 + nx, y1 + ny], ['Z']
		],
		bbox: [Math.min(x1, x2) - hw, Math.min(y1, y2) - hw, Math.max(x1, x2) + hw, Math.max(y1, y2) + hw]
	};
}

/** Raw segment list with an explicit bbox (for hand-built arc shapes). */
export const raw = (bbox, ...segs) => ({ segs, bbox });

/** Point on a circle, angle in degrees, 0 = +x, positive = clockwise in y-down. */
export const pol = (cx, cy, r, deg) => [
	cx + r * Math.cos(deg * Math.PI / 180),
	cy + r * Math.sin(deg * Math.PI / 180)
];

// ---------------------------------------------------------------- curve bbox sampling

function sampleBezier(p0, ctrl, p1) {
	const out = [];
	for (let i = 0; i <= 24; i++) {
		const t = i / 24, u = 1 - t;
		if (ctrl.length === 1) {
			out.push([u * u * p0[0] + 2 * u * t * ctrl[0][0] + t * t * p1[0],
				u * u * p0[1] + 2 * u * t * ctrl[0][1] + t * t * p1[1]]);
		} else {
			out.push([u ** 3 * p0[0] + 3 * u * u * t * ctrl[0][0] + 3 * u * t * t * ctrl[1][0] + t ** 3 * p1[0],
				u ** 3 * p0[1] + 3 * u * u * t * ctrl[0][1] + 3 * u * t * t * ctrl[1][1] + t ** 3 * p1[1]]);
		}
	}
	return out;
}

/** Curve-aware bbox for a segment list (arcs need an explicit hint via raw()). */
export function segsBbox(segs) {
	const pts = [];
	let cur = [0, 0];
	for (const s of segs) {
		if (s[0] === 'M' || s[0] === 'L') { cur = [s[1], s[2]]; pts.push(cur); }
		else if (s[0] === 'Q') { pts.push(...sampleBezier(cur, [[s[1], s[2]]], [s[3], s[4]])); cur = [s[3], s[4]]; }
		else if (s[0] === 'C') { pts.push(...sampleBezier(cur, [[s[1], s[2]], [s[3], s[4]]], [s[5], s[6]])); cur = [s[5], s[6]]; }
		else if (s[0] === 'A') { cur = [s[3], s[4]]; pts.push(cur); }
		else if (s[0] === 'A2') { cur = [s[4], s[5]]; pts.push(cur); }
	}
	return bboxOf(pts);
}

/** Q/C-only primitive: bbox computed by sampling. */
export function curve(...segs) { return { segs, bbox: segsBbox(segs) }; }

// ---------------------------------------------------------------- serialisation

/**
 * Render primitives into one `d` string.
 * @param {{segs:any[],bbox:number[]}[]} parts
 * @param {number} s uniform scale
 * @param {number} ox translate x
 * @param {number} oy translate y
 * @param {number} dx field-space centring shift x
 * @param {number} dy field-space centring shift y
 */
export function render(parts, s, ox, oy, dx = 0, dy = 0) {
	const X = (v) => num(ox + s * (v + dx));
	const Y = (v) => num(oy + s * (v + dy));
	const R = (v) => num(s * v);
	let out = '';
	for (const p of parts) {
		for (const c of p.segs) {
			switch (c[0]) {
				case 'M': out += `M${X(c[1])} ${Y(c[2])}`; break;
				case 'L': out += `L${X(c[1])} ${Y(c[2])}`; break;
				case 'Q': out += `Q${X(c[1])} ${Y(c[2])} ${X(c[3])} ${Y(c[4])}`; break;
				case 'C': out += `C${X(c[1])} ${Y(c[2])} ${X(c[3])} ${Y(c[4])} ${X(c[5])} ${Y(c[6])}`; break;
				case 'A': out += `A${R(c[1])} ${R(c[1])} 0 0 ${c[2]} ${X(c[3])} ${Y(c[4])}`; break;
				case 'A2': out += `A${R(c[1])} ${R(c[1])} 0 ${c[2]} ${c[3]} ${X(c[4])} ${Y(c[5])}`; break;
				case 'Z': out += 'Z'; break;
			}
		}
	}
	return out;
}

export function partsBbox(parts) { return merge(...parts.map(p => p.bbox)); }

// ---------------------------------------------------------------- curve helpers

/** Reverse an M/L/Q/C/Z segment list (used to flip a hand-drawn curve's winding). */
export function reverseSegs(segs) {
	const pts = [];
	let cur = null;
	for (const s of segs) {
		if (s[0] === 'M') { cur = [s[1], s[2]]; pts.push({ p: cur, ctrl: null }); }
		else if (s[0] === 'L') { cur = [s[1], s[2]]; pts.push({ p: cur, ctrl: [] }); }
		else if (s[0] === 'Q') { cur = [s[3], s[4]]; pts.push({ p: cur, ctrl: [[s[1], s[2]]] }); }
		else if (s[0] === 'C') { cur = [s[5], s[6]]; pts.push({ p: cur, ctrl: [[s[1], s[2]], [s[3], s[4]]] }); }
	}
	const out = [['M', pts[pts.length - 1].p[0], pts[pts.length - 1].p[1]]];
	for (let i = pts.length - 1; i >= 1; i--) {
		const c = pts[i].ctrl, t = pts[i - 1].p;
		if (!c || c.length === 0) { out.push(['L', t[0], t[1]]); }
		else if (c.length === 1) { out.push(['Q', c[0][0], c[0][1], t[0], t[1]]); }
		else { out.push(['C', c[1][0], c[1][1], c[0][0], c[0][1], t[0], t[1]]); }
	}
	out.push(['Z']);
	return out;
}

function segsArea(segs) {
	const pts = [];
	let cur = [0, 0];
	for (const s of segs) {
		if (s[0] === 'M' || s[0] === 'L') { cur = [s[1], s[2]]; pts.push(cur); }
		else if (s[0] === 'Q') { pts.push(...sampleBezier(cur, [[s[1], s[2]]], [s[3], s[4]]).slice(1)); cur = [s[3], s[4]]; }
		else if (s[0] === 'C') { pts.push(...sampleBezier(cur, [[s[1], s[2]], [s[3], s[4]]], [s[5], s[6]]).slice(1)); cur = [s[5], s[6]]; }
	}
	return shoelace(pts);
}

/** Q/C/L curve primitive, auto-wound clockwise (outer) or counter-clockwise (hole). */
export function curveWound(segs, hole = false) {
	const want = hole ? -1 : 1;
	const s = segsArea(segs) * want > 0 ? segs : reverseSegs(segs);
	return { segs: s, bbox: segsBbox(s) };
}
export const cv = (...segs) => curveWound(segs, false);
export const cvHole = (...segs) => curveWound(segs, true);

/** Intersection of line (p1 + t*d1) and (p2 + u*d2). */
function isect(p1, d1, p2, d2) {
	const den = d1[0] * d2[1] - d1[1] * d2[0];
	const t = ((p2[0] - p1[0]) * d2[1] - (p2[1] - p1[1]) * d2[0]) / den;
	return [p1[0] + t * d1[0], p1[1] + t * d1[1]];
}

/**
 * Y-shaped hole: three arms of half-width hw and length L radiating from (cx,cy).
 * Built as ONE polygon so overlapping holes never cancel (R11).
 */
export function yHole(cx, cy, L, hw, degs) {
	const arms = [...degs].sort((a, b) => a - b).map(d => {
		const r = d * Math.PI / 180;
		const u = [Math.cos(r), Math.sin(r)];
		const p = [-Math.sin(r), Math.cos(r)];
		return { u, p, tip: [cx + L * u[0], cy + L * u[1]] };
	});
	const pts = [];
	for (let i = 0; i < arms.length; i++) {
		const a = arms[i], b = arms[(i + 1) % arms.length];
		pts.push([a.tip[0] - hw * a.p[0], a.tip[1] - hw * a.p[1]]);
		pts.push([a.tip[0] + hw * a.p[0], a.tip[1] + hw * a.p[1]]);
		pts.push(isect([cx + hw * a.p[0], cy + hw * a.p[1]], a.u,
			[cx - hw * b.p[0], cy - hw * b.p[1]], b.u));
	}
	return polyHole(pts);
}

/** Regular polygon, first vertex at `deg0`. */
export const ngon = (cx, cy, r, n, deg0) =>
	poly(Array.from({ length: n }, (_, i) => pol(cx, cy, r, deg0 + i * 360 / n)));

/**
 * Y-shaped hole whose arm tips are mitred onto the vertices of the hexagon they cut,
 * so no part of the seam paints outside the hexagon (a hole with winding -1 outside its
 * shape still fills under nonzero).
 */
export function yHoleHex(cx, cy, R, hw, degs) {
	const arms = [...degs].sort((a, b) => a - b).map(d => {
		const r = d * Math.PI / 180;
		return {
			u: [Math.cos(r), Math.sin(r)], p: [-Math.sin(r), Math.cos(r)],
			V: pol(cx, cy, R, d), Vm: pol(cx, cy, R, d - 60), Vp: pol(cx, cy, R, d + 60)
		};
	});
	const pts = [];
	for (let i = 0; i < arms.length; i++) {
		const a = arms[i], b = arms[(i + 1) % arms.length];
		const minus = [cx - hw * a.p[0], cy - hw * a.p[1]];
		const plus = [cx + hw * a.p[0], cy + hw * a.p[1]];
		pts.push(isect(minus, a.u, a.V, [a.Vm[0] - a.V[0], a.Vm[1] - a.V[1]]));
		pts.push(a.V);
		pts.push(isect(plus, a.u, a.V, [a.Vp[0] - a.V[0], a.Vp[1] - a.V[1]]));
		pts.push(isect(plus, a.u, [cx - hw * b.p[0], cy - hw * b.p[1]], b.u));
	}
	return polyHole(pts);
}
