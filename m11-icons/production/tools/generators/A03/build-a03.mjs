#!/usr/bin/env node
// build-a03.mjs — author slice A03 of the M11 long tail (spec.md §11).
// Local to this slice: emits production/svg/file/<id>.svg for the 84 A03 concepts.
// Letters go through tools/letterpath.mjs (imported, never modified).

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { letterPath } from '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/tools/letterpath.mjs';

const OUT = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/svg/file';
mkdirSync(OUT, { recursive: true });

// ---- letter helpers ---------------------------------------------------------

// R5: badge letters are sized ink-width-first, then dropped 41 % low on the ink box.
// The plate is the canon 14 x 14 at (1,1), so plateBottom = 15, plateHeight = 14.
const PLATE_BOTTOM = 15, PLATE_H = 14;

function solveCap(text, targetInk, { letterSpacing = 0, band = 'cap' } = {}) {
	let lo = 2, hi = 12;
	for (let i = 0; i < 40; i++) {
		const mid = (lo + hi) / 2;
		const r = letterPath({ text, [band === 'x' ? 'xheight' : 'cap']: mid, letterSpacing, baseline: 0 });
		if (r.ink.w < targetInk) { lo = mid; } else { hi = mid; }
	}
	return (lo + hi) / 2;
}

/** A badge letter group: ink width first, baseline 41 % low on the ink box. */
function badgeLetters(text, { ink, letterSpacing = 0, band = 'cap', fill = '#FFFFFF', cx = 8 }) {
	const size = solveCap(text, ink, { letterSpacing, band });
	const probe = letterPath({ text, [band === 'x' ? 'xheight' : 'cap']: size, letterSpacing, baseline: 0 });
	const inkH = probe.ink.h;
	const baseline = PLATE_BOTTOM - 0.41 * (PLATE_H - inkH);
	const r = letterPath({ text, [band === 'x' ? 'xheight' : 'cap']: size, letterSpacing, baseline, cx });
	return { d: `<path fill="${fill}" d="${r.d}"/>`, r, size };
}

/** A glyph letter group: cap band centred on the mark's optical centre (§5, law 2). */
function glyphLetters(text, { cap, ink, cy = 8, cx = 8, letterSpacing = 0, fill, band = 'cap' }) {
	const size = cap != null ? cap : solveCap(text, ink, { letterSpacing, band });
	const r = letterPath({ text, [band === 'x' ? 'xheight' : 'cap']: size, letterSpacing, cy, cx, band: band === 'x' ? 'xheight' : 'cap' });
	return { d: `<path fill="${fill}" d="${r.d}"/>`, r, size };
}

// ---- emit -------------------------------------------------------------------

const SVG = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${body}</svg>`;
const P = (fill, d, rule) => `<path fill="${fill}"${rule ? ' fill-rule="evenodd"' : ''} d="${d}"/>`;
const PLATE = (fill) => `<rect x="1" y="1" width="14" height="14" rx="3" fill="${fill}"/>`;

export const ROSTER = [];
const icon = (id, archetype, fill, body, note) => ROSTER.push({ id, archetype, fill, body, note });

/** BADGE = canon plate + one letter group. */
const badge = (id, fill, text, opts, note) => {
	const { d } = badgeLetters(text, { fill: opts.letterFill ?? '#FFFFFF', ...opts });
	icon(id, 'BADGE', fill, PLATE(fill) + d, note);
};

export { icon, badge, P, PLATE, SVG, glyphLetters, badgeLetters, OUT, writeFileSync, join };
