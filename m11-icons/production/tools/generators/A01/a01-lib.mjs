// a01-lib.mjs — geometry + letter helpers for M11 long-tail slice A01.
// Scratch only: nothing here is shipped; it emits production/svg/file/<id>.svg.

import { letterPath } from '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/tools/letterpath.mjs';

// ---- numbers ---------------------------------------------------------------
export function n(v) {
	let s = (Math.round(v * 100) / 100).toFixed(2);
	s = s.replace(/0+$/, '').replace(/\.$/, '');
	if (s === '-0') { s = '0'; }
	return s.replace(/^(-?)0\./, '$1.');
}
const p = (x, y) => `${n(x)} ${n(y)}`;

// ---- colour ----------------------------------------------------------------
export function hsl(hex) {
	const r = parseInt(hex.slice(1, 3), 16) / 255;
	const g = parseInt(hex.slice(3, 5), 16) / 255;
	const b = parseInt(hex.slice(5, 7), 16) / 255;
	const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
	const l = (mx + mn) / 2;
	let h = 0;
	if (d) {
		if (mx === r) { h = ((g - b) / d) % 6; }
		else if (mx === g) { h = (b - r) / d + 2; }
		else { h = (r - g) / d + 4; }
		h *= 60;
		if (h < 0) { h += 360; }
	}
	return { h, s: (d ? d / (1 - Math.abs(2 * l - 1)) : 0) * 100, l: l * 100 };
}
export const dHue = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };

function hslToHex(h, s, l) {
	s /= 100; l /= 100;
	const c = (1 - Math.abs(2 * l - 1)) * s;
	const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
	const m = l - c / 2;
	const t = [[c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x]][Math.floor(h / 60) % 6];
	return '#' + t.map(v => Math.round((v + m) * 255).toString(16).padStart(2, '0').toUpperCase()).join('');
}
/** A dark letter drawn from the plate hue (spec §4: light plates take a dark letter). */
export function darkOn(plate) {
	const c = hsl(plate);
	return hslToHex(c.h, Math.min(70, Math.max(28, c.s)), 15);
}
/** White unless the plate is light enough that white letters go soft. */
export const letterInk = (plate) => (hsl(plate).l > 62 ? darkOn(plate) : '#FFFFFF');

// ---- path primitives -------------------------------------------------------
// All builders take a `ccw` flag so several subpaths can share ONE <path> under
// nonzero winding: same direction unions, opposite direction knocks out (R11).

export function poly(pts, close = true) {
	return 'M' + pts.map(([x, y]) => p(x, y)).join('L') + (close ? 'Z' : '');
}

export function circ(cx, cy, r, ccw = false) {
	const s = ccw ? 0 : 1;
	return `M${p(cx - r, cy)}A${n(r)} ${n(r)} 0 1 ${s} ${p(cx + r, cy)}A${n(r)} ${n(r)} 0 1 ${s} ${p(cx - r, cy)}Z`;
}

export function ell(cx, cy, rx, ry, ccw = false) {
	const s = ccw ? 0 : 1;
	return `M${p(cx - rx, cy)}A${n(rx)} ${n(ry)} 0 1 ${s} ${p(cx + rx, cy)}A${n(rx)} ${n(ry)} 0 1 ${s} ${p(cx - rx, cy)}Z`;
}

export function rrect(x, y, w, h, r, ccw = false) {
	r = Math.min(r, w / 2, h / 2);
	if (r <= 0) {
		return ccw ? poly([[x, y], [x, y + h], [x + w, y + h], [x + w, y]])
			: poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]]);
	}
	const R = `${n(r)} ${n(r)} 0 0 `;
	if (!ccw) {
		return `M${p(x + r, y)}L${p(x + w - r, y)}A${R}1 ${p(x + w, y + r)}` +
			`L${p(x + w, y + h - r)}A${R}1 ${p(x + w - r, y + h)}` +
			`L${p(x + r, y + h)}A${R}1 ${p(x, y + h - r)}` +
			`L${p(x, y + r)}A${R}1 ${p(x + r, y)}Z`;
	}
	return `M${p(x + r, y)}A${R}0 ${p(x, y + r)}` +
		`L${p(x, y + h - r)}A${R}0 ${p(x + r, y + h)}` +
		`L${p(x + w - r, y + h)}A${R}0 ${p(x + w, y + h - r)}` +
		`L${p(x + w, y + r)}A${R}0 ${p(x + w - r, y)}` +
		`L${p(x + r, y)}Z`;
}

/** Straight bar of width w between two points, butt ends. */
export function bar(x1, y1, x2, y2, w) {
	const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
	const ox = (dy / len) * (w / 2), oy = (-dx / len) * (w / 2);
	return poly([[x1 + ox, y1 + oy], [x2 + ox, y2 + oy], [x2 - ox, y2 - oy], [x1 - ox, y1 - oy]]);
}

/** Bar with semicircular caps. */
export function rbar(x1, y1, x2, y2, w) {
	const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
	const r = w / 2;
	const ox = (dy / len) * r, oy = (-dx / len) * r;
	const A = `A${n(r)} ${n(r)} 0 0 1 `;
	return `M${p(x1 + ox, y1 + oy)}L${p(x2 + ox, y2 + oy)}${A}${p(x2 - ox, y2 - oy)}` +
		`L${p(x1 - ox, y1 - oy)}${A}${p(x1 + ox, y1 + oy)}Z`;
}

/** Annulus (ring). Outer CW + inner CCW, so it unions correctly under nonzero. */
export function ring(cx, cy, ro, ri) { return circ(cx, cy, ro) + circ(cx, cy, ri, true); }

/** Rounded-rect ring. */
export function rring(x, y, w, h, r, wall) {
	return rrect(x, y, w, h, r) + rrect(x + wall, y + wall, w - 2 * wall, h - 2 * wall, Math.max(0, r - wall), true);
}

/** A band of an annulus between two angles (degrees, math convention, y flipped). */
export function arcBand(cx, cy, ro, ri, a1, a2) {
	const P = (r, a) => [cx + r * Math.cos(a * Math.PI / 180), cy - r * Math.sin(a * Math.PI / 180)];
	const big = Math.abs(a2 - a1) > 180 ? 1 : 0;
	const [ox1, oy1] = P(ro, a1), [ox2, oy2] = P(ro, a2);
	const [ix2, iy2] = P(ri, a2), [ix1, iy1] = P(ri, a1);
	// increasing angle is counter-clockwise on screen -> sweep flag 0
	return `M${p(ix1, iy1)}L${p(ox1, oy1)}A${n(ro)} ${n(ro)} 0 ${big} 0 ${p(ox2, oy2)}` +
		`L${p(ix2, iy2)}A${n(ri)} ${n(ri)} 0 ${big} 1 ${p(ix1, iy1)}Z`;
}

/** Regular polygon; a0 is the angle of the first vertex (degrees). */
export function ngon(cx, cy, r, sides, a0 = 0) {
	const pts = [];
	for (let i = 0; i < sides; i++) {
		const a = (a0 + i * 360 / sides) * Math.PI / 180;
		pts.push([cx + r * Math.cos(a), cy - r * Math.sin(a)]);
	}
	return poly(pts);
}

/** Spur gear: `teeth` trapezoid teeth between root and tip radius. */
export function gear(cx, cy, rTip, rRoot, teeth, duty = 0.46) {
	const pts = [];
	const step = 360 / teeth;
	for (let i = 0; i < teeth; i++) {
		const c = i * step;
		const ht = step * duty / 2, hr = step * (1 - duty) / 2;
		const at = (a, r) => pts.push([cx + r * Math.cos(a * Math.PI / 180), cy - r * Math.sin(a * Math.PI / 180)]);
		at(c - ht, rTip); at(c + ht, rTip);
		at(c + ht + hr * 0.25, rRoot); at(c + step - ht - hr * 0.25, rRoot);
	}
	return poly(pts);
}

// ---- letters ---------------------------------------------------------------
const letterCache = new Map();
function lp(o) {
	const k = JSON.stringify(o);
	if (!letterCache.has(k)) { letterCache.set(k, letterPath(o)); }
	return letterCache.get(k);
}

/** Scale so the rendered ink width lands on `targetW` (R5: badges are ink-width-first). */
function capForInkWidth(text, targetW, letterSpacing, font) {
	let cap = 5.5;
	for (let i = 0; i < 30; i++) {
		const r = lp({ text, cap, cx: 8, cy: 8, band: 'ink', letterSpacing, font });
		if (Math.abs(r.ink.w - targetW) < 0.004) { break; }
		cap *= targetW / r.ink.w;
	}
	return cap;
}

/**
 * BADGE letters: R5 ink width, then §5 law 1 (the ink box sits 41 % low on the plate).
 * Plate is the canon 14x14 at (1,1).
 */
export function badgeLetters(text, plate, { targetW, letterSpacing = 0, font = 'bold', fill } = {}) {
	const w = targetW ?? (text.length === 1 ? 5.4 : text.length === 2 ? 9.4 : 11.0);
	const cap = capForInkWidth(text, w, letterSpacing, font);
	const probe = lp({ text, cap, cx: 8, cy: 8, band: 'ink', letterSpacing, font });
	const inkBottom = 15 - 0.41 * (14 - probe.ink.h);
	const cy = inkBottom - probe.ink.h / 2;
	const r = lp({ text, cap, cx: 8, cy, band: 'ink', letterSpacing, font });
	return { d: r.d, ink: r.ink, cap, fill: fill ?? letterInk(plate) };
}

/** GLYPH letters: bare ink on nothing, centred on the optical centre (§5 law 2). */
export function glyphLetters(text, { targetW, cy = 8, band, letterSpacing = 0, font = 'bold' } = {}) {
	const w = targetW ?? (text.length === 1 ? 7.5 : text.length === 2 ? 11.6 : text.length === 3 ? 13.2 : 14.4);
	const cap = capForInkWidth(text, w, letterSpacing, font);
	const b = band ?? (/^[A-Z0-9#@]+$/.test(text) ? 'cap' : 'ink');
	const r = lp({ text, cap, cx: 8, cy, band: b, letterSpacing, font });
	return { d: r.d, ink: r.ink, cap };
}

/** Free-placed letters (inside a keycap etc.). */
export function inlineLetters(text, { cap, cx = 8, cy = 8, band = 'cap', letterSpacing = 0, font = 'bold' }) {
	return lp({ text, cap, cx, cy, band, letterSpacing, font }).d;
}

// ---- svg -------------------------------------------------------------------
export const path = (fill, d, evenodd = false) =>
	`<path fill="${fill}"${evenodd ? ' fill-rule="evenodd"' : ''} d="${d}"/>`;
export const plate = (hex) => `<rect x="1" y="1" width="14" height="14" rx="3" fill="${hex}"/>`;
export const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${body}</svg>`;
