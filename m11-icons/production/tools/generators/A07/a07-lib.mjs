// a07-lib.mjs — geometry helpers for the A07 long-tail slice.
import { letterPath } from '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/tools/letterpath.mjs';

export const f = (v) => {
	let s = (+v).toFixed(2);
	if (s.includes('.')) { s = s.replace(/0+$/, '').replace(/\.$/, ''); }
	if (s === '-0') { s = '0'; }
	return s.replace(/^(-?)0\./, '$1.');
};

export const pt = (x, y) => `${f(x)} ${f(y)}`;

/** Rounded rectangle as one closed subpath. */
export function rr(x, y, w, h, r) {
	return `M${pt(x + r, y)}H${f(x + w - r)}A${f(r)} ${f(r)} 0 0 1 ${pt(x + w, y + r)}`
		+ `V${f(y + h - r)}A${f(r)} ${f(r)} 0 0 1 ${pt(x + w - r, y + h)}`
		+ `H${f(x + r)}A${f(r)} ${f(r)} 0 0 1 ${pt(x, y + h - r)}`
		+ `V${f(y + r)}A${f(r)} ${f(r)} 0 0 1 ${pt(x + r, y)}Z`;
}

/** Plain rectangle. */
export const rect = (x, y, w, h) => `M${pt(x, y)}H${f(x + w)}V${f(y + h)}H${f(x)}Z`;

/** Circle as two half arcs (same idiom as the canon set). Counter-clockwise. */
export const circ = (cx, cy, r) =>
	`M${pt(cx - r, cy)}a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0a${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0`;

/** Clockwise circle — for unions with clockwise polys/rects under nonzero winding (R11). */
export const circCW = (cx, cy, r) =>
	`M${pt(cx - r, cy)}a${f(r)} ${f(r)} 0 1 1 ${f(2 * r)} 0a${f(r)} ${f(r)} 0 1 1 ${f(-2 * r)} 0`;

/** Closed polygon from [x,y] pairs. */
export const poly = (pts) => 'M' + pts.map(p => pt(p[0], p[1])).join(' ') + 'Z';

/** A 45-degree stroked polyline (tick / handle), offset vertically so the width is constant. */
export function tick45(points, width) {
	const v = width * Math.SQRT2 / 2;
	const up = points.map(p => [p[0], p[1] - v]);
	const dn = points.map(p => [p[0], p[1] + v]).reverse();
	return poly([...up, ...dn]);
}

/**
 * Badge letters, R5: size by ink width first, then place the ink box 41 % low (§5 law 1).
 * @param {string} text
 * @param {{ink?:number, cap?:number, tracking?:number, fill?:string}} opts
 */
export function badgeText(text, opts = {}) {
	const tracking = opts.tracking ?? 0;
	let cap = opts.cap;
	if (cap == null) {
		let lo = 2, hi = 10;
		for (let i = 0; i < 44; i++) {
			const mid = (lo + hi) / 2;
			const r = letterPath({ text, cap: mid, cx: 8, baseline: 0, letterSpacing: tracking });
			if (r.ink.w < opts.ink) { lo = mid; } else { hi = mid; }
		}
		cap = (lo + hi) / 2;
	}
	const probe = letterPath({ text, cap, cx: 8, baseline: 0, letterSpacing: tracking });
	const baseline = 15 - 0.41 * (14 - probe.ink.h) - probe.ink.y2;
	const r = letterPath({ text, cap, cx: 8, baseline, letterSpacing: tracking });
	return { ...r, cap };
}

/** A whole BADGE icon: canon plate + white (or given) letters. */
export function badge(plate, text, opts = {}) {
	const ink = opts.ink ?? (text.length >= 3 ? 11.0 : text.length === 2 ? 9.4 : null);
	const tracking = opts.tracking ?? (text.length >= 3 ? -0.02 : 0);
	const letters = badgeText(text, { ink, cap: ink == null ? 7.0 : undefined, tracking });
	const body = `<rect x="1" y="1" width="14" height="14" rx="3" fill="${plate}"/>`
		+ `<path fill="${opts.letterFill || '#FFFFFF'}" d="${letters.d}"/>`;
	return { body, letters };
}

/** Bare letterform GLYPH, centred on the mark's optical centre (§5 law 2). */
export function glyphText(text, opts = {}) {
	const r = letterPath({
		text, cx: opts.cx ?? 8, cap: opts.cap, xheight: opts.xheight,
		cy: opts.cy ?? 8, band: opts.xheight ? 'xheight' : 'cap',
		letterSpacing: opts.tracking ?? 0
	});
	return r;
}

export const svg = (body) =>
	`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${body}</svg>`;

export const path = (fill, d, evenodd) =>
	`<path fill="${fill}"${evenodd ? ' fill-rule="evenodd"' : ''} d="${d}"/>`;
