// a05lib.mjs — shared helpers for the A05 long-tail slice generator.
// Not a production tool: it only assembles strings and writes svg/file/<id>.svg.

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { letterPath } from '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/tools/letterpath.mjs';

export const OUT = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/svg/file';

export const PLATE = (fill) => `<rect x="1" y="1" width="14" height="14" rx="3" fill="${fill}"/>`;

/**
 * BADGE letters. R5: size by ink width first, then §5 law 1 on the ink box:
 *   baseline = plateBottom - 0.41 * (plateHeight - inkHeight)
 */
export function badgeLetters(text, { fill = '#FFFFFF', inkW, ls = 0, font = 'bold' } = {}) {
	const target = inkW ?? (text.length >= 3 ? 11.0 : 9.4);
	let lo = 1, hi = 12, cap = 5;
	for (let i = 0; i < 40; i++) {
		cap = (lo + hi) / 2;
		const m = letterPath({ text, cap, cx: 8, baseline: 8, letterSpacing: ls, font });
		if (m.ink.w > target) { hi = cap; } else { lo = cap; }
	}
	const probe = letterPath({ text, cap, cx: 8, baseline: 8, letterSpacing: ls, font });
	const baseline = 15 - 0.41 * (14 - probe.ink.h);
	const r = letterPath({ text, cap, cx: 8, baseline, letterSpacing: ls, font });
	return { d: `<path fill="${fill}" d="${r.d}"/>`, cap: +cap.toFixed(3), ink: r.ink, baseline: +baseline.toFixed(2) };
}

/**
 * GLYPH letters — §5 law 2: the cap band is centred on the mark's optical centre.
 */
export function glyphLetters(text, { fill, inkW = 13.6, cy = 8, ls = 0, maxCap = 6.2, font = 'bold' } = {}) {
	let lo = 1, hi = maxCap, cap = 5;
	for (let i = 0; i < 40; i++) {
		cap = (lo + hi) / 2;
		const m = letterPath({ text, cap, cx: 8, baseline: 8, letterSpacing: ls, font });
		if (m.ink.w > inkW) { hi = cap; } else { lo = cap; }
	}
	const r = letterPath({ text, cap, cx: 8, cy, band: 'cap', letterSpacing: ls, font });
	return { d: `<path fill="${fill}" d="${r.d}"/>`, cap: +cap.toFixed(3), ink: r.ink };
}

export function write(id, body) {
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${body}</svg>`;
	writeFileSync(join(OUT, `${id}.svg`), svg, 'utf8');
	return Buffer.byteLength(svg);
}

/** number -> short svg literal (2dp, no leading zero) */
export const n = (v) => {
	let s = (+v).toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
	if (s === '-0') { s = '0'; }
	return s.replace(/^(-?)0\./, '$1.');
};

/** circle as a path (two arcs), cheaper and mergeable into a multi-subpath <path> */
export const circ = (cx, cy, r) =>
	`M${n(cx - r)} ${n(cy)}a${n(r)} ${n(r)} 0 1 0 ${n(2 * r)} 0a${n(r)} ${n(r)} 0 1 0 ${n(-2 * r)} 0`;

/** counter-wound circle, for evenodd knock-outs that must not cancel (R11) */
export const circCW = (cx, cy, r) =>
	`M${n(cx - r)} ${n(cy)}a${n(r)} ${n(r)} 0 1 1 ${n(2 * r)} 0a${n(r)} ${n(r)} 0 1 1 ${n(-2 * r)} 0`;

export const rect = (x, y, w, h) => `M${n(x)} ${n(y)}h${n(w)}v${n(h)}h${n(-w)}Z`;
export const rectCW = (x, y, w, h) => `M${n(x)} ${n(y)}v${n(h)}h${n(w)}v${n(-h)}Z`;
