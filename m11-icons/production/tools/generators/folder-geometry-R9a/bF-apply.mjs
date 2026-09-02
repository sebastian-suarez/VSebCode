// bF-apply.mjs — regenerate the 80 folder emblem SVGs at a chosen box.
//
//   node bF-apply.mjs <opt> --dry <dir>   # write to <dir> (canon two copied in)
//   node bF-apply.mjs <opt> --write       # write to production/svg/folder
//
// <opt> is one of the closed-box candidates below. The OPEN box is fixed at the
// flap maximum (5.50) in every option. The two canon files are never rewritten.

import { writeFileSync, mkdirSync, readFileSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { emit } from './geom.mjs';
import { EMBLEMS } from './emblems.mjs';

const PROD = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production';
const CANON = join(PROD, 'svg/folder');

export const BASE_CLOSED =
	'<path fill="#BF9354" d="M1.5 4.1c0-.66.54-1.2 1.2-1.2h3.12c.34 0 .66.14.89.39l.95 1.01h5.64c.66 0 1.2.54 1.2 1.2v6.4c0 .66-.54 1.2-1.2 1.2H2.7c-.66 0-1.2-.54-1.2-1.2z"/>' +
	'<path fill="rgba(0,0,0,.14)" d="M1.5 5.55h13v.85h-13z"/>';
export const BASE_OPEN =
	'<path fill="#8F6D37" d="M1.5 4.1c0-.66.54-1.2 1.2-1.2h3.12c.34 0 .66.14.89.39l.95 1.01h4.94c.66 0 1.2.54 1.2 1.2v1h-12z"/>' +
	'<path fill="#C09553" d="M2.42 6.5h11.62c.78 0 1.35.73 1.17 1.49l-.98 3.9c-.13.54-.61.91-1.17.91H2.7c-.66 0-1.2-.54-1.2-1.2V7.7c0-.66.42-1.2.92-1.2z"/>';

// closed-box candidates — folder body right of the tab spans y 4.30 .. 13.10 (8.80 px)
export const CLOSED = {
	old: { side: 6.50, ox: 7.0, oy: 5.6, k: 0.65 },   // shipped: top 1.30 / bottom 1.00
	E: { side: 8.20, ox: 5.3, oy: 3.9, k: 0.82 },   // AS BRIEFED — 0.40 px OUTSIDE the top edge
	A: { side: 8.20, ox: 5.3, oy: 4.6, k: 0.82 },   // 8.20 kept, anchor moved: top 0.30 / bottom 0.30
	B: { side: 8.00, ox: 5.5, oy: 4.7, k: 0.80 },   // top 0.40 / bottom 0.40
	C: { side: 7.80, ox: 5.7, oy: 4.3, k: 0.78 },   // anchor kept: top 0.00 / bottom 1.00
	D: { side: 7.30, ox: 6.2, oy: 4.8, k: 0.73 }    // anchor kept: top 0.50 / bottom 1.00
};
// open box: the flap (y 6.5..12.8) eroded by 0.25 -> 5.80 square, bottom-right
// corner exactly 0.25 from the bottom-right cubic (whose terminus 13.06,12.80 is
// what binds boxRight, at every clearance).
export const OPEN = { side: 5.80, ox: 7.26, oy: 6.75, k: 0.58 };

export function icon(e, open, closedBox) {
	const T = open ? OPEN : closedBox;
	const fr = e.evenodd ? ' fill-rule="evenodd"' : '';
	return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">' +
		(open ? BASE_OPEN : BASE_CLOSED) +
		`<path fill="${e.color}"${fr} d="${emit(e.d(), T)}"/></svg>\n`;
}

if (process.argv[1].endsWith('bF-apply.mjs')) {
	const opt = process.argv[2];
	const box = CLOSED[opt];
	if (!box) { console.error(`unknown option "${opt}" — one of ${Object.keys(CLOSED).join(', ')}`); process.exit(2); }
	const dry = process.argv.includes('--dry');
	const out = dry ? process.argv[process.argv.indexOf('--dry') + 1] : CANON;
	if (!dry && !process.argv.includes('--write')) { console.error('refusing to touch production without --write'); process.exit(2); }

	mkdirSync(out, { recursive: true });
	const files = [];
	for (const e of EMBLEMS) {
		for (const open of [false, true]) {
			const name = `${e.id}${open ? '-open' : ''}.svg`;
			const src = icon(e, open, box);
			writeFileSync(join(out, name), src, 'utf8');
			files.push({ name, bytes: Buffer.byteLength(src) });
		}
	}
	// the canon two are never regenerated — copied verbatim into a dry dir, left alone in prod
	if (dry) { for (const f of ['folder.svg', 'folder-open.svg']) { copyFileSync(join(CANON, f), join(out, f)); } }

	const total = files.reduce((a, f) => a + f.bytes, 0);
	const biggest = files.slice().sort((a, b) => b.bytes - a.bytes)[0];
	console.log(`option ${opt}: closed ${box.side.toFixed(2)} px { ox ${box.ox}, oy ${box.oy}, k ${box.k} }  y ${box.oy.toFixed(2)}–${(box.oy + box.side).toFixed(2)}`);
	console.log(`            open ${OPEN.side.toFixed(2)} px { ox ${OPEN.ox}, oy ${OPEN.oy}, k ${OPEN.k} }  open/closed ratio ${(OPEN.side / box.side).toFixed(3)}`);
	console.log(`${files.length} files -> ${out}`);
	console.log(`bytes: ${total} total, ${Math.round(total / files.length)} avg, ${biggest.bytes} max (${biggest.name})`);

	// canon integrity
	const md5 = (p) => execFileSync('/sbin/md5', ['-q', p], { encoding: 'utf8' }).trim();
	console.log(`canon folder.svg      ${md5(join(out, 'folder.svg'))}  (expect f32ce8dfba4f721640304e76a89ddac2)`);
	console.log(`canon folder-open.svg ${md5(join(out, 'folder-open.svg'))}  (expect b02ddd5eeedc2be2f9edb4340471ec65)`);
}
