#!/usr/bin/env node
// a09-build.mjs — emit slice A09's SVGs from the roster (scratchpad tool, not shipped).
//
//   node a09-build.mjs            # writes production/svg/file/<id>.svg for every entry
//   node a09-build.mjs --dry      # prints sizes only
//
// BADGE entries get their letters from tools/letterpath.mjs, sized ink-width-first (R5)
// and placed 41 % low (spec §5 law 1). SILHOUETTE / GLYPH entries carry hand-authored path
// data from the roster.

import { writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { letterPath } from '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/tools/letterpath.mjs';
import { ROSTER } from './a09-roster.mjs';

const OUT = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/svg/file';
const dry = process.argv.includes('--dry');

// R5: ink width first. 1 letter -> cap 7.0; 2 -> ink 9.0-9.8; 3 -> ink 10.6-11.4.
const INK_TARGET = { 2: 9.4, 3: 11.0, 4: 12.4 };

function badgeLetters(text, fill, opts = {}) {
	const n = [...text].length;
	const band = opts.band || (/[a-z]/.test(text) ? 'xheight' : 'cap');
	const ls = opts.letterSpacing ?? (n >= 3 ? -0.02 : 0);
	let sized;
	if (n === 1) {
		sized = letterPath({ text, cap: opts.cap ?? 7.0, cx: 8, baseline: 0, letterSpacing: ls });
	} else {
		// solve the font size that lands the ink width on target
		const target = opts.inkWidth ?? INK_TARGET[n] ?? 12.4;
		let lo = 2, hi = 20;
		for (let i = 0; i < 40; i++) {
			const mid = (lo + hi) / 2;
			const p = letterPath({ text, size: mid, cx: 8, baseline: 0, letterSpacing: ls });
			if (p.ink.w < target) { lo = mid; } else { hi = mid; }
		}
		sized = letterPath({ text, size: (lo + hi) / 2, cx: 8, baseline: 0, letterSpacing: ls });
	}
	// 41 % low on the reference band inside the 1->15 plate
	const bandH = band === 'xheight' ? sized.xBand : sized.capBand;
	const baseline = 15 - 0.41 * (14 - bandH);
	const final = letterPath({
		text, size: sized.fontSize, cx: opts.cx ?? 8, baseline: +baseline.toFixed(3),
		letterSpacing: ls
	});
	return { path: `<path fill="${fill}" d="${final.d}"/>`, metrics: final, band, bandH };
}

const files = [];
for (const e of ROSTER) {
	let body;
	if (e.arch === 'BADGE') {
		const lf = e.letterFill || '#FFFFFF';
		const { path } = badgeLetters(e.text, lf, e);
		body = `<rect x="1" y="1" width="14" height="14" rx="3" fill="${e.hex}"/>${path}`;
	} else if (e.text) {
		// bare letterform GLYPH: centred on the optical centre (spec §5, law 2)
		const g = letterPath({ text: e.text, inkHeight: e.inkHeight ?? 9.8, cx: 8, cy: 8, band: 'ink',
			letterSpacing: e.letterSpacing ?? 0 });
		body = `<path fill="${e.hex}" d="${g.d}"/>`;
	} else {
		body = e.body;
	}
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${body}</svg>`;
	files.push({ id: e.id, svg, bytes: Buffer.byteLength(svg) });
	if (!dry) { writeFileSync(join(OUT, `${e.id}.svg`), svg, 'utf8'); }
}

files.sort((a, b) => b.bytes - a.bytes);
const total = files.reduce((a, f) => a + f.bytes, 0);
console.log(`${files.length} icons, ${total} B total, avg ${Math.round(total / files.length)} B`);
console.log('largest:', files.slice(0, 6).map(f => `${f.id} ${f.bytes}`).join('  '));
const over = files.filter(f => f.bytes > 2048);
if (over.length) { console.log('over 2 KB:', over.map(f => `${f.id} ${f.bytes}`).join('  ')); }
