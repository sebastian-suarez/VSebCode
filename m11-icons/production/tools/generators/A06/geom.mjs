// geom.mjs — path helpers for the A06 long-tail slice.
// Emits the same compact 2-decimal style as the shipped production icons.

export const n = (v) => {
	let s = (+v).toFixed(2);
	if (s.includes('.')) { s = s.replace(/0+$/, '').replace(/\.$/, ''); }
	if (s === '-0') { s = '0'; }
	return s.replace(/^(-?)0\./, '$1.');
};
export const pt = (x, y) => `${n(x)} ${n(y)}`;

// signed area in y-down coordinates: > 0 means clockwise on screen
const area = (p) => {
	let a = 0;
	for (let i = 0; i < p.length; i++) {
		const [x1, y1] = p[i], [x2, y2] = p[(i + 1) % p.length];
		a += x1 * y2 - x2 * y1;
	}
	return a / 2;
};

/** polygon, forced clockwise (union subpath) */
export function poly(points) {
	const p = area(points) < 0 ? [...points].reverse() : points;
	return 'M' + p.map(([x, y]) => pt(x, y)).join('L') + 'Z';
}
/** polygon, forced counter-clockwise (knock-out subpath under nonzero winding) */
export function polyHole(points) {
	const p = area(points) > 0 ? [...points].reverse() : points;
	return 'M' + p.map(([x, y]) => pt(x, y)).join('L') + 'Z';
}

export const rect = (x, y, w, h) => `M${pt(x, y)}H${n(x + w)}V${n(y + h)}H${n(x)}Z`;
export const rectHole = (x, y, w, h) => `M${pt(x, y)}V${n(y + h)}H${n(x + w)}V${n(y)}Z`;

export function roundRect(x, y, w, h, r) {
	const R = n(r);
	return `M${pt(x + r, y)}H${n(x + w - r)}A${R} ${R} 0 0 1 ${pt(x + w, y + r)}`
		+ `V${n(y + h - r)}A${R} ${R} 0 0 1 ${pt(x + w - r, y + h)}`
		+ `H${n(x + r)}A${R} ${R} 0 0 1 ${pt(x, y + h - r)}`
		+ `V${n(y + r)}A${R} ${R} 0 0 1 ${pt(x + r, y)}Z`;
}

export const circle = (cx, cy, r, cw = true) =>
	`M${pt(cx - r, cy)}a${n(r)} ${n(r)} 0 1 ${cw ? 1 : 0} ${n(2 * r)} 0`
	+ `a${n(r)} ${n(r)} 0 1 ${cw ? 1 : 0} ${n(-2 * r)} 0Z`;

export const ellipse = (cx, cy, rx, ry, cw = true) =>
	`M${pt(cx - rx, cy)}a${n(rx)} ${n(ry)} 0 1 ${cw ? 1 : 0} ${n(2 * rx)} 0`
	+ `a${n(rx)} ${n(ry)} 0 1 ${cw ? 1 : 0} ${n(-2 * rx)} 0Z`;

/** solid ring: clockwise outer + counter-clockwise inner (nonzero hole) */
export const ring = (cx, cy, R, r) => circle(cx, cy, R, true) + circle(cx, cy, r, false);
export const ringE = (cx, cy, Rx, Ry, rx, ry) =>
	ellipse(cx, cy, Rx, Ry, true) + ellipse(cx, cy, rx, ry, false);

/** a bar of width w from (x1,y1) to (x2,y2); square ends */
export function bar(x1, y1, x2, y2, w) {
	const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
	const px = (-dy / L) * (w / 2), py = (dx / L) * (w / 2);
	return poly([[x1 + px, y1 + py], [x2 + px, y2 + py], [x2 - px, y2 - py], [x1 - px, y1 - py]]);
}
/** round joint / cap */
export const dot = (x, y, r) => circle(x, y, r, true);

const P = (cx, cy, r, deg) => [cx + r * Math.cos(deg * Math.PI / 180), cy + r * Math.sin(deg * Math.PI / 180)];

/**
 * Annulus sector from a0 to a1 (degrees, y-down, increasing = clockwise on screen).
 */
export function sector(cx, cy, R, r, a0, a1) {
	const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
	const sw = a1 > a0 ? 1 : 0;
	const [ox0, oy0] = P(cx, cy, R, a0), [ox1, oy1] = P(cx, cy, R, a1);
	const [ix1, iy1] = P(cx, cy, r, a1), [ix0, iy0] = P(cx, cy, r, a0);
	return `M${pt(ox0, oy0)}A${n(R)} ${n(R)} 0 ${large} ${sw} ${pt(ox1, oy1)}`
		+ `L${pt(ix1, iy1)}A${n(r)} ${n(r)} 0 ${large} ${1 - sw} ${pt(ix0, iy0)}Z`;
}

/** gear outline: `teeth` square teeth between rRoot and rTip */
export function gear(cx, cy, rTip, rRoot, teeth, duty = 0.46) {
	const step = 360 / teeth, half = step * duty / 2;
	const pts = [];
	for (let i = 0; i < teeth; i++) {
		const c = i * step;
		pts.push(P(cx, cy, rRoot, c - step / 2 + half * 0.55));
		pts.push(P(cx, cy, rTip, c - half));
		pts.push(P(cx, cy, rTip, c + half));
		pts.push(P(cx, cy, rRoot, c + step / 2 - half * 0.55));
	}
	return poly(pts);
}

/** rotate points about (cx,cy) by deg */
export const rot = (points, cx, cy, deg) => points.map(([x, y]) => {
	const a = deg * Math.PI / 180, dx = x - cx, dy = y - cy;
	return [cx + dx * Math.cos(a) - dy * Math.sin(a), cy + dx * Math.sin(a) + dy * Math.cos(a)];
});
