// a08-lib.mjs — shared helpers for the A08 long-tail slice (scratch, not shipped).
import { letterPath } from '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/tools/letterpath.mjs';

export const n = (v) => {
	let s = (Math.round(v * 100) / 100).toFixed(2);
	s = s.replace(/0+$/, '').replace(/\.$/, '');
	if (s === '-0') { s = '0'; }
	return s.replace(/^(-?)0\./, '$1.');
};
const p = (x, y) => `${n(x)} ${n(y)}`;

// ---- primitives -------------------------------------------------------------

function signedArea(pts) {
	let a = 0;
	for (let i = 0; i < pts.length; i++) {
		const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length];
		a += x1 * y2 - x2 * y1;
	}
	return a;               // > 0 == clockwise in screen coords (y down)
}

/** polygon, always emitted clockwise so nonzero unions never cancel (R11) */
export function poly(pts) {
	const q = signedArea(pts) < 0 ? [...pts].reverse() : pts;
	return 'M' + q.map(([x, y]) => p(x, y)).join('L') + 'Z';
}

/** polygon wound counter-clockwise — a hole inside a nonzero solid */
export function polyCCW(pts) {
	const q = signedArea(pts) > 0 ? [...pts].reverse() : pts;
	return 'M' + q.map(([x, y]) => p(x, y)).join('L') + 'Z';
}

/** axis-aligned rects wound counter-clockwise (holes under nonzero) */
export function rectsCCW(list) {
	return list.map(([x, y, w, h]) => `M${p(x, y)}v${n(h)}h${n(w)}v${n(-h)}Z`).join('');
}

export function rrect(x, y, w, h, r) {
	const rr = Math.min(r, w / 2, h / 2);
	return `M${p(x + rr, y)}h${n(w - 2 * rr)}a${n(rr)} ${n(rr)} 0 0 1 ${n(rr)} ${n(rr)}`
		+ `v${n(h - 2 * rr)}a${n(rr)} ${n(rr)} 0 0 1 ${n(-rr)} ${n(rr)}`
		+ `h${n(-(w - 2 * rr))}a${n(rr)} ${n(rr)} 0 0 1 ${n(-rr)} ${n(-rr)}`
		+ `v${n(-(h - 2 * rr))}a${n(rr)} ${n(rr)} 0 0 1 ${n(rr)} ${n(-rr)}Z`;
}

// clockwise circle (screen coords)
export function circleCW(cx, cy, r) {
	return `M${p(cx - r, cy)}a${n(r)} ${n(r)} 0 1 1 ${n(2 * r)} 0a${n(r)} ${n(r)} 0 1 1 ${n(-2 * r)} 0Z`;
}
export function circleCCW(cx, cy, r) {
	return `M${p(cx - r, cy)}a${n(r)} ${n(r)} 0 1 0 ${n(2 * r)} 0a${n(r)} ${n(r)} 0 1 0 ${n(-2 * r)} 0Z`;
}
export function ellipseCW(cx, cy, rx, ry) {
	return `M${p(cx - rx, cy)}a${n(rx)} ${n(ry)} 0 1 1 ${n(2 * rx)} 0a${n(rx)} ${n(ry)} 0 1 1 ${n(-2 * rx)} 0Z`;
}
export function ellipseCCW(cx, cy, rx, ry) {
	return `M${p(cx - rx, cy)}a${n(rx)} ${n(ry)} 0 1 0 ${n(2 * rx)} 0a${n(rx)} ${n(ry)} 0 1 0 ${n(-2 * rx)} 0Z`;
}

const rad = (d) => d * Math.PI / 180;
const pt = (cx, cy, r, a) => [cx + r * Math.cos(rad(a)), cy + r * Math.sin(rad(a))];

/** annulus sector, angles in degrees, screen coords (y down), sweeping a1 -> a2 clockwise */
export function arcBand(cx, cy, ro, ri, a1, a2) {
	const large = Math.abs(a2 - a1) > 180 ? 1 : 0;
	const [x1, y1] = pt(cx, cy, ro, a1);
	const [x2, y2] = pt(cx, cy, ro, a2);
	const [x3, y3] = pt(cx, cy, ri, a2);
	const [x4, y4] = pt(cx, cy, ri, a1);
	return `M${p(x1, y1)}A${n(ro)} ${n(ro)} 0 ${large} 1 ${p(x2, y2)}`
		+ `L${p(x3, y3)}A${n(ri)} ${n(ri)} 0 ${large} 0 ${p(x4, y4)}Z`;
}

/** star / spikey: alternating outer & inner radii */
export function star(cx, cy, ro, ri, points, rot = -90) {
	const pts = [];
	for (let i = 0; i < points * 2; i++) {
		const a = rot + i * 180 / points;
		pts.push(pt(cx, cy, i % 2 ? ri : ro, a));
	}
	return poly(pts);
}

/** gear: `teeth` trapezoid teeth around a hub; returns one CW outline */
export function gear(cx, cy, ro, ri, teeth, duty = 0.5) {
	const step = 360 / teeth;
	const half = step * duty / 2;
	const pts = [];
	for (let i = 0; i < teeth; i++) {
		const a = -90 + i * step;
		pts.push(pt(cx, cy, ri, a - step / 2 + half * 0.5));
		pts.push(pt(cx, cy, ro, a - half));
		pts.push(pt(cx, cy, ro, a + half));
		pts.push(pt(cx, cy, ri, a + step / 2 - half * 0.5));
	}
	return poly(pts);
}

/** a band of constant vertical thickness along a polyline (axis-aligned or sloped) */
export function vBand(pts, t) {
	const up = pts.map(([x, y]) => [x, y - t / 2]);
	const dn = pts.map(([x, y]) => [x, y + t / 2]).reverse();
	return poly([...up, ...dn]);
}

/** union of axis-aligned rects, all wound the same way (nonzero) */
export function rects(list) {
	return list.map(([x, y, w, h]) => `M${p(x, y)}h${n(w)}v${n(h)}h${n(-w)}Z`).join('');
}

// ---- letters ----------------------------------------------------------------

/** solve the cap height that lands the ink width on `inkW` */
function capFor(text, inkW, letterSpacing, font) {
	let cap = 5.2;
	for (let i = 0; i < 24; i++) {
		const r = letterPath({ text, cap, cx: 8, cy: 8, letterSpacing, font });
		cap *= inkW / r.ink.w;
	}
	return cap;
}

/**
 * Badge letters: R5 (ink-width first) + §5 law 1 (the ink box sits 41 % low on the plate).
 * plate spans y 1 -> 15.
 */
export function badgeInk(text, inkW, { letterSpacing = 0, font = 'bold' } = {}) {
	const cap = capFor(text, inkW, letterSpacing, font);
	const probe = letterPath({ text, cap, cx: 8, cy: 8, letterSpacing, font });
	const h = probe.ink.h;
	const bottom = 15 - 0.41 * (14 - h);
	return letterPath({ text, cap, cx: 8, cy: bottom - h / 2, band: 'ink', letterSpacing, font });
}

/** Glyph letters: §5 law 2 — the cap band is centred on the optical centre. */
export function glyphInk(text, inkW, { cy = 8, letterSpacing = 0, font = 'bold' } = {}) {
	const cap = capFor(text, inkW, letterSpacing, font);
	return letterPath({ text, cap, cx: 8, cy, band: 'cap', letterSpacing, font });
}

export function glyphCap(text, cap, { cy = 8, letterSpacing = 0, font = 'bold' } = {}) {
	return letterPath({ text, cap, cx: 8, cy, band: 'cap', letterSpacing, font });
}

// ---- svg --------------------------------------------------------------------

export const path = (fill, d, evenodd = false) =>
	`<path fill="${fill}"${evenodd ? ' fill-rule="evenodd"' : ''} d="${d}"/>`;

export const plate = (fill) => `<rect x="1" y="1" width="14" height="14" rx="3" fill="${fill}"/>`;

export const svg = (body) =>
	`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${body}</svg>`;

// ---- colour -----------------------------------------------------------------

export function hsl(hex) {
	const r = parseInt(hex.slice(1, 3), 16) / 255;
	const g = parseInt(hex.slice(3, 5), 16) / 255;
	const b = parseInt(hex.slice(5, 7), 16) / 255;
	const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
	let h = 0;
	if (d) {
		if (mx === r) { h = ((g - b) / d) % 6; }
		else if (mx === g) { h = (b - r) / d + 2; }
		else { h = (r - g) / d + 4; }
		h *= 60;
		if (h < 0) { h += 360; }
	}
	const l = (mx + mn) / 2;
	const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
	return { h, s: s * 100, l: l * 100 };
}

export function twin(a, b) {
	const A = hsl(a), B = hsl(b);
	if (A.s < 25 || B.s < 25) { return false; }          // R7 neutral lane
	let dh = Math.abs(A.h - B.h);
	if (dh > 180) { dh = 360 - dh; }
	return dh < 12 && Math.abs(A.l - B.l) < 12 && Math.abs(A.s - B.s) < 25;
}
