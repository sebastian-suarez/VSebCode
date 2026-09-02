// letters.mjs — spec §5 / R5 placement wrappers around tools/letterpath.mjs.
import { letterPath } from '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/tools/letterpath.mjs';

const hasCap = (t) => /[A-Z0-9#@]/.test(t);

/** binary-search the cap (or x-height) that puts the ink width at `w` */
function fitSize(text, w, ls, font) {
	const key = hasCap(text) ? 'cap' : 'xheight';
	let lo = 0.5, hi = 13;
	for (let i = 0; i < 44; i++) {
		const mid = (lo + hi) / 2;
		const r = letterPath({ text, font, [key]: mid, cx: 8, cy: 8, letterSpacing: ls });
		if (r.ink.w < w) { lo = mid; } else { hi = mid; }
	}
	return { key, size: (lo + hi) / 2 };
}

/**
 * Badge letters: sized ink-width-first (R5), then dropped onto the 41 % low baseline
 * (§5 law 1) measured on the cap band (or the x-height band for lowercase, as canon npm).
 */
export function badgeText(text, { fill, w, ls = 0, font = 'bold' }) {
	const { key, size } = fitSize(text, w, ls, font);
	const probe = letterPath({ text, font, [key]: size, cx: 8, cy: 8, letterSpacing: ls });
	const band = hasCap(text) ? probe.capBand : probe.xBand;
	const baseline = 15 - 0.41 * (14 - band);
	const r = letterPath({ text, font, [key]: size, cx: 8, baseline, letterSpacing: ls });
	return { el: `<path fill="${fill}" d="${r.d}"/>`, m: r };
}

/**
 * Glyph letters: centred on the mark's optical centre (§5 law 2).
 */
export function glyphText(text, { fill, w, cap, cy = 8, band = 'ink', ls = 0, font = 'bold' }) {
	let key, size;
	if (cap != null) { key = 'cap'; size = cap; }
	else { ({ key, size } = fitSize(text, w, ls, font)); }
	const r = letterPath({ text, font, [key]: size, cx: 8, cy, band, letterSpacing: ls });
	return { el: `<path fill="${fill}" d="${r.d}"/>`, m: r };
}

/** raw path data, for letters used as a knock-out or on top of another shape */
export function letterD(text, opts) { return letterPath({ cx: 8, ...opts }); }
