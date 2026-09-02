// a11-lib.mjs — helpers for the A11 long-tail slice generator (scratch, not shipped).
import { letterPath } from '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/tools/letterpath.mjs';

export const SVG = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${body}</svg>`;
export const P = (fill, d, extra = '') => `<path fill="${fill}"${extra} d="${d}"/>`;
export const PE = (fill, d) => P(fill, d, ' fill-rule="evenodd"');

/** R5: badge letters are sized ink-width first, then placed 41 % low on the ink box. */
export function badgeLetters(text, { fill = '#FFFFFF', inkWidth, tracking = 0, cx = 8, font = 'bold' } = {}) {
	const target = inkWidth ?? (text.length === 1 ? 5.4 : text.length === 2 ? 9.4 : 11.0);
	let lo = 2, hi = 11, res = null;
	for (let i = 0; i < 40; i++) {
		const cap = (lo + hi) / 2;
		res = letterPath({ text, cap, cx, baseline: 11, letterSpacing: tracking, font });
		if (res.ink.w < target) { lo = cap; } else { hi = cap; }
	}
	const cap = (lo + hi) / 2;
	const probe = letterPath({ text, cap, cx, baseline: 11, letterSpacing: tracking, font });
	const inkH = probe.ink.h;
	const baseline = 15 - 0.41 * (14 - inkH);
	const out = letterPath({ text, cap, cx, baseline, letterSpacing: tracking, font });
	return { d: out.d, cap: +cap.toFixed(3), ink: out.ink, baseline: +baseline.toFixed(3), fill };
}

/** Full BADGE: the 14x14 rx3 canon plate plus one letter path. */
export function badge(plate, text, letterFill = '#FFFFFF', opts = {}) {
	const l = badgeLetters(text, { fill: letterFill, ...opts });
	return {
		body: `<rect x="1" y="1" width="14" height="14" rx="3" fill="${plate}"/>${P(letterFill, l.d)}`,
		meta: l
	};
}

/** Bare letterforms (GLYPH, solid form): centred on the shape's optical centre. */
export function glyphLetters(text, fill, { cap = 7.6, cx = 8, cy = 8, tracking = 0, font = 'bold' } = {}) {
	const r = letterPath({ text, cap, cx, cy, band: 'cap', letterSpacing: tracking, font });
	return { d: r.d, ink: r.ink, cap };
}
