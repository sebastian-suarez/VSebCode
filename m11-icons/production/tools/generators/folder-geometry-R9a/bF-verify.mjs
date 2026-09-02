// bF-verify.mjs — regenerate the 80 folder icons at a given box and diff against
// the shipped svg/folder/. Usage: node bF-verify.mjs <outdir> [--old|--new]
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { emit } from './geom.mjs';
import { EMBLEMS } from './emblems.mjs';

const SHIPPED = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/svg/folder';

const BASE_CLOSED =
	'<path fill="#BF9354" d="M1.5 4.1c0-.66.54-1.2 1.2-1.2h3.12c.34 0 .66.14.89.39l.95 1.01h5.64c.66 0 1.2.54 1.2 1.2v6.4c0 .66-.54 1.2-1.2 1.2H2.7c-.66 0-1.2-.54-1.2-1.2z"/>' +
	'<path fill="rgba(0,0,0,.14)" d="M1.5 5.55h13v.85h-13z"/>';
const BASE_OPEN =
	'<path fill="#8F6D37" d="M1.5 4.1c0-.66.54-1.2 1.2-1.2h3.12c.34 0 .66.14.89.39l.95 1.01h4.94c.66 0 1.2.54 1.2 1.2v1h-12z"/>' +
	'<path fill="#C09553" d="M2.42 6.5h11.62c.78 0 1.35.73 1.17 1.49l-.98 3.9c-.13.54-.61.91-1.17.91H2.7c-.66 0-1.2-.54-1.2-1.2V7.7c0-.66.42-1.2.92-1.2z"/>';

const BOXES = {
	old: { closed: { ox: 7.0, oy: 5.6, k: 0.65 }, open: { ox: 8.3, oy: 7.0, k: 0.52 } }
};

const which = process.argv.includes('--new') ? 'new' : 'old';
const outdir = process.argv[2];
const B = BOXES[which];

function icon(e, open) {
	const T = open ? B.open : B.closed;
	const d = emit(e.d(), T);
	const fr = e.evenodd ? ' fill-rule="evenodd"' : '';
	return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">' +
		(open ? BASE_OPEN : BASE_CLOSED) +
		`<path fill="${e.color}"${fr} d="${d}"/></svg>\n`;
}

mkdirSync(outdir, { recursive: true });
let same = 0, diff = [], missing = [];
for (const e of EMBLEMS) {
	for (const open of [false, true]) {
		const name = `${e.id}${open ? '-open' : ''}.svg`;
		const src = icon(e, open);
		writeFileSync(join(outdir, name), src, 'utf8');
		const p = join(SHIPPED, name);
		if (!existsSync(p)) { missing.push(name); continue; }
		if (readFileSync(p, 'utf8') === src) { same++; } else { diff.push(name); }
	}
}
console.log(`box=${which} identical=${same}/80 differing=${diff.length} missing=${missing.length}`);
if (diff.length) { console.log('DIFF:', diff.join(' ')); }
if (missing.length) { console.log('MISSING:', missing.join(' ')); }
