// F03-lib.mjs — folder-emblem geometry kit for slice F03.
//
// Emblems are authored in a 0-10 field (R9a) and placed by ONE uniform scale +
// translate per variant, so the box is the whole geometry:
//   closed: 8.20 box at x 5.30-13.50, y 4.60-12.80   -> X = 5.30 + .82x, Y = 4.60 + .82y
//   open:   5.80 box at x 7.26-13.06, y 6.75-12.55   -> X = 7.26 + .58x, Y = 6.75 + .58y
// Feature floors, field units: stem >= 2.0 (1.64 px closed), counter >= 1.2 (0.98 px).

export const BOX = {
	closed: { x: 5.30, y: 4.60, s: 0.82 },
	open: { x: 7.26, y: 6.75, s: 0.58 }
};

const P = 2;
const n = (v) => {
	let s = (+v).toFixed(P);
	if (s.includes('.')) { s = s.replace(/0+$/, '').replace(/\.$/, ''); }
	if (s === '-0') { s = '0'; }
	return s.replace(/^(-?)0\./, '$1.');
};

const nfloor = (v) => n(Math.floor(v * 100) / 100);

/** A drawing context bound to one variant's box. */
export function ctx(variant) {
	const b = BOX[variant];
	const X = (x) => b.x + b.s * x;
	const Y = (y) => b.y + b.s * y;
	const S = (v) => b.s * v;
	const pt = (x, y) => `${n(X(x))} ${n(Y(y))}`;

	const api = {
		X, Y, S, pt,
		/** polygon from [[x,y],...] */
		poly: (pts) => 'M' + pts.map(([x, y], i) => (i ? 'L' : '') + pt(x, y)).join('') + 'Z',
		/** axis-aligned rect */
		rect: (x, y, w, h) => api.poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]]),
		/** rounded rect; dir 1 = clockwise (ink), dir 0 = counter-clockwise (nonzero hole) */
		rrect: (x, y, w, h, r, dir = 1) => {
			const rr = Math.min(r, w / 2, h / 2);
			if (rr <= 0) { return dir ? api.rect(x, y, w, h) : api.poly([[x, y], [x, y + h], [x + w, y + h], [x + w, y]]); }
			const R = n(S(rr));
			const a = (ex, ey) => `A${R} ${R} 0 0 ${dir} ${pt(ex, ey)}`;
			const cw = `M${pt(x + rr, y)}L${pt(x + w - rr, y)}${a(x + w, y + rr)}`
				+ `L${pt(x + w, y + h - rr)}${a(x + w - rr, y + h)}`
				+ `L${pt(x + rr, y + h)}${a(x, y + h - rr)}`
				+ `L${pt(x, y + rr)}${a(x + rr, y)}Z`;
			if (dir) { return cw; }
			return `M${pt(x + rr, y)}${a(x, y + rr)}L${pt(x, y + h - rr)}${a(x + rr, y + h)}`
				+ `L${pt(x + w - rr, y + h)}${a(x + w, y + h - rr)}`
				+ `L${pt(x + w, y + rr)}${a(x + w - rr, y)}Z`;
		},
		/** circle, clockwise (dir 1) or counter-clockwise (dir 0) for nonzero holes.
		 *  The radius is floored to 2 dp so it can never exceed half the rounded chord —
		 *  an over-long radius makes SVG bulge the arc past the true circle (R11). */
		circle: (cx, cy, r, dir = 1) => {
			const R = nfloor(S(r));
			return `M${pt(cx - r, cy)}A${R} ${R} 0 1 ${dir} ${pt(cx + r, cy)}`
				+ `A${R} ${R} 0 1 ${dir} ${pt(cx - r, cy)}Z`;
		},
		/** regular polygon, first vertex at `a0` degrees (0 = right, CCW on screen) */
		ngon: (cx, cy, r, sides, a0 = 90) => api.poly(
			Array.from({ length: sides }, (_, i) => {
				const t = (a0 - i * 360 / sides) * Math.PI / 180;
				return [cx + r * Math.cos(t), cy - r * Math.sin(t)];
			})),
		/** annulus sector: outer arc a0->a1 (degrees, CCW), then inner arc back */
		arcBand: (cx, cy, ro, ri, a0, a1) => {
			const rad = (a) => a * Math.PI / 180;
			const p = (r, a) => [cx + r * Math.cos(rad(a)), cy - r * Math.sin(rad(a))];
			const sweep = ((a1 - a0) % 360 + 360) % 360;
			const large = sweep > 180 ? 1 : 0;
			const RO = nfloor(S(ro)), RI = nfloor(S(ri));
			const [ox0, oy0] = p(ro, a0), [ox1, oy1] = p(ro, a1);
			const [ix0, iy0] = p(ri, a0), [ix1, iy1] = p(ri, a1);
			return `M${pt(ox0, oy0)}A${RO} ${RO} 0 ${large} 0 ${pt(ox1, oy1)}`
				+ `L${pt(ix1, iy1)}A${RI} ${RI} 0 ${large} 1 ${pt(ix0, iy0)}Z`;
		},
		/** thick bar between two points, `w` wide, square ends */
		bar: (x0, y0, x1, y1, w) => {
			const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy);
			const nx = (-dy / L) * w / 2, ny = (dx / L) * w / 2;
			return api.poly([[x0 + nx, y0 + ny], [x1 + nx, y1 + ny], [x1 - nx, y1 - ny], [x0 - nx, y0 - ny]]);
		},
		/** raw cubic path from a compact spec of field-space points */
		path: (spec) => spec.trim().replace(/([MLCQZ])|(-?[\d.]+)\s+(-?[\d.]+)/g,
			(m, cmd, px, py) => (cmd ? cmd : pt(+px, +py)))
			.replace(/\s+/g, ' ').replace(/([MLCQZ]) /g, '$1').trim()
	};
	return api;
}

/** Rounds every number in a `d` string the same way the canon does. */
export const round = (d) => d.replace(/-?\d*\.?\d+/g, (v) => n(v));
