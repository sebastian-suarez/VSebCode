// F05-build.mjs — write the 90 SVGs of folder slice F05.
//
//   node F05-build.mjs           # write svg/folder/<id>.svg and <id>-open.svg
//   node F05-build.mjs --check   # geometry report only, nothing written
//
// Canon base paths are copied byte-for-byte out of svg/folder/folder.svg and folder-open.svg;
// the emblem is the only thing this script generates.

import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { render, partsBbox } from './F05-geom.mjs';
import { EMBLEMS } from './F05-emblems.mjs';

const PROD = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production';
const OUT = join(PROD, 'svg', 'folder');
const CHECK = process.argv.includes('--check');

const inner = (f) => readFileSync(join(OUT, f), 'utf8')
	.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
const BASE = { closed: inner('folder.svg'), open: inner('folder-open.svg') };

// R9a emblem boxes.
const BOX = {
	closed: { s: 0.82, ox: 5.30, oy: 4.60, size: 8.20, cx: 9.40, cy: 8.70 },
	open: { s: 0.58, ox: 7.26, oy: 6.75, size: 5.80, cx: 10.16, cy: 9.65 }
};

const letterPath = (text, cap, cx, cy) => JSON.parse(execFileSync('node', [
	join(PROD, 'tools', 'letterpath.mjs'), '--text', text, '--cap', String(cap),
	'--cx', String(cx), '--cy', String(cy), '--json'
], { encoding: 'utf8' }));

const report = [];

for (const [id, e] of Object.entries(EMBLEMS)) {
	const out = {};
	let ink = null;

	if (e.letter) {
		for (const v of ['closed', 'open']) {
			const b = BOX[v];
			const r = letterPath(e.letter.text, +(e.letter.capUnits * b.s).toFixed(4), b.cx, b.cy);
			out[v] = r.d;
			if (v === 'closed') { ink = [r.ink.x1, r.ink.y1, r.ink.x2, r.ink.y2]; }
		}
	} else {
		const parts = e.parts().flat();
		const bb = e.bbox || partsBbox(parts);
		const w = bb[2] - bb[0], h = bb[3] - bb[1];
		if (w > 10.001 || h > 10.001) { throw new Error(`${id}: emblem ${w.toFixed(2)}x${h.toFixed(2)} > field`); }
		// translate-only centring on (5,5); the size stays as authored (optical sizing, §3)
		const dx = 5 - (bb[0] + bb[2]) / 2, dy = 5 - (bb[1] + bb[3]) / 2;
		for (const v of ['closed', 'open']) {
			const b = BOX[v];
			out[v] = render(parts, b.s, b.ox, b.oy, dx, dy);
		}
		const b = BOX.closed;
		ink = [b.ox + b.s * (bb[0] + dx), b.oy + b.s * (bb[1] + dy),
			b.ox + b.s * (bb[2] + dx), b.oy + b.s * (bb[3] + dy)];
		report.push({ id, w, h, ink });
	}

	for (const [v, suffix] of [['closed', ''], ['open', '-open']]) {
		const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">`
			+ BASE[v] + `<path fill="${e.fill}" d="${out[v]}"/></svg>\n`;
		if (!CHECK) { writeFileSync(join(OUT, `${id}${suffix}.svg`), svg); }
		e[`bytes_${v}`] = Buffer.byteLength(svg);
	}
}

// ---- geometry report: every emblem must sit inside the ruled closed box
const B = [5.30, 4.60, 13.50, 12.80];
let bad = 0;
for (const r of report) {
	const over = r.ink[0] < B[0] - 0.005 || r.ink[1] < B[1] - 0.005
		|| r.ink[2] > B[2] + 0.005 || r.ink[3] > B[3] + 0.005;
	if (over) { bad++; console.log(`OUT OF BOX ${r.id}  ink ${r.ink.map(v => v.toFixed(2)).join(' ')}`); }
}
const ids = Object.keys(EMBLEMS);
console.log(`${ids.length} emblems, ${ids.length * 2} files${CHECK ? ' (check only)' : ' written'}, ${bad} out of box`);
console.log('field extents (units):');
for (const r of report.sort((a, b) => b.w * b.h - a.w * a.h).slice(0, 6)) {
	console.log(`  ${r.id.padEnd(18)} ${r.w.toFixed(2)} x ${r.h.toFixed(2)}`);
}
const bytes = ids.map(i => EMBLEMS[i].bytes_closed);
console.log(`closed bytes: avg ${Math.round(bytes.reduce((a, b) => a + b) / bytes.length)}, max ${Math.max(...bytes)}`);
if (!existsSync(join(OUT, 'folder.svg'))) { throw new Error('canon folder.svg missing'); }
