// F02-build.mjs — write svg/folder/<id>.svg + <id>-open.svg for slice F02.
// Canon tan base verbatim + one emblem mapped into its R9a box by a uniform transform.

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { EMBLEMS } from './F02-emblems.mjs';
import { BOX, toPath, extents } from './F02-geom.mjs';

const ROOT = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production';
const FOLDER = join(ROOT, 'svg', 'folder');
const LETTERPATH = join(ROOT, 'tools', 'letterpath.mjs');

const inner = (f) => readFileSync(join(FOLDER, f), 'utf8')
	.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').trim();

const BASE = { closed: inner('folder.svg'), open: inner('folder-open.svg') };
if (!BASE.closed.includes('#BF9354') || !BASE.open.includes('#C09553')) {
	throw new Error('canon folder base did not parse as expected');
}

// A single letter, cap-band centred on the emblem box (spec §5, centring law 2).
const CAP = 6.6;
const LETTER = {
	closed: { cap: CAP, cx: 5.30 + 8.20 / 2, cy: 4.60 + 8.20 / 2 },
	open: { cap: CAP * (5.80 / 8.20), cx: 7.26 + 5.80 / 2, cy: 6.75 + 5.80 / 2 }
};

function letterPath(text, fill, variant) {
	const p = LETTER[variant];
	const out = execFileSync('node', [LETTERPATH, '--text', text, '--cap', String(p.cap),
		'--cx', String(p.cx), '--cy', String(p.cy), '--band', 'cap', '--fill', fill],
		{ encoding: 'utf8' }).trim();
	if (!out.startsWith('<path')) { throw new Error(`letterpath: ${out.slice(0, 80)}`); }
	return out;
}

const ids = Object.keys(EMBLEMS).sort();
let written = 0, bytes = 0, maxBytes = 0, spills = [];

for (const id of ids) {
	const e = EMBLEMS[id];
	for (const variant of ['closed', 'open']) {
		let mark;
		if (e.letter) {
			mark = letterPath(e.letter, e.fill, variant);
		} else {
			const ex = extents(e.d);
			if (ex.x0 < -0.001 || ex.y0 < -0.001 || ex.x1 > 10.001 || ex.y1 > 10.001) {
				spills.push(`${id} ${variant}: ${JSON.stringify(ex)}`);
			}
			mark = `<path fill="${e.fill}"${e.evenodd ? ' fill-rule="evenodd"' : ''} d="${toPath(e.d, BOX[variant])}"/>`;
		}
		const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${BASE[variant]}${mark}</svg>`;
		const file = join(FOLDER, variant === 'open' ? `${id}-open.svg` : `${id}.svg`);
		writeFileSync(file, svg, 'utf8');
		written++;
		const b = Buffer.byteLength(svg);
		bytes += b; maxBytes = Math.max(maxBytes, b);
	}
}

console.log(`${written} files, ${bytes} bytes total, ${Math.round(bytes / written)} avg, ${maxBytes} max`);
if (spills.length) {
	console.log('\nUNIT-FIELD OVERFLOW (control points; curves may still be inside):');
	spills.forEach(s => console.log('  ' + s));
}
