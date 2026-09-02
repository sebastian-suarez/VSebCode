// F01-build.mjs — emit svg/folder/<id>.svg + <id>-open.svg for slice F01.
//
//   node F01-build.mjs            # geometry report only (dry run)
//   node F01-build.mjs --write    # write the 90 SVGs

import { writeFileSync, readFileSync } from 'node:fs';
import { BOX, transformPath, flatten, bbox } from './F01-lib.mjs';
import { EMBLEMS } from './F01-emblems.mjs';

const OUT = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/svg/folder';

// The canon bases, lifted verbatim from the approved pair so they stay byte-identical.
const strip = f => readFileSync(`${OUT}/${f}`, 'utf8')
	.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
const BASE = { closed: strip('folder.svg'), open: strip('folder-open.svg') };
const HEAD = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">';

// ---- tone law: every emblem fill must be darker than the tan plate ----------
const lum = hex => {
	const c = n => { const v = parseInt(hex.slice(n, n + 2), 16) / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
	return 0.2126 * c(1) + 0.7152 * c(3) + 0.0722 * c(5);
};
const TAN = lum('#BF9354');

const rows = [];
let fail = 0;
const note = (id, msg) => { console.log(`  ! ${id}: ${msg}`); fail++; };

for (const [id, e] of Object.entries(EMBLEMS)) {
	// 1. every emblem must live entirely inside the 0..10 field (= inside the R9a box)
	const b = bbox(e.d);
	if (b.x1 < -0.005 || b.y1 < -0.005 || b.x2 > 10.005 || b.y2 > 10.005) {
		note(id, `field overflow ${b.x1.toFixed(2)},${b.y1.toFixed(2)} -> ${b.x2.toFixed(2)},${b.y2.toFixed(2)}`);
	}
	if (b.w < 6.5 && b.h < 6.5) { note(id, `mark is small: ${b.w.toFixed(1)} x ${b.h.toFixed(1)}`); }

	// 2. tone law
	if (lum(e.fill) >= TAN) { note(id, `${e.fill} is not darker than the tan plate`); }

	// 3. winding report: with nonzero, a solid subpath must be clockwise (shoelace > 0)
	const wind = flatten(e.d, 48).map(sub => {
		let a = 0;
		for (let i = 0; i < sub.length; i++) {
			const p = sub[i], q = sub[(i + 1) % sub.length];
			a += p[0] * q[1] - q[0] * p[1];
		}
		return a > 0 ? '+' : '-';
	}).join('');

	const rule = e.rule ? ` fill-rule="${e.rule}"` : '';
	const out = {};
	for (const v of ['closed', 'open']) {
		const { s, ox, oy } = BOX[v];
		const d = transformPath(e.d, s, ox, oy, 2);
		out[v] = `${HEAD}${BASE[v]}<path fill="${e.fill}"${rule} d="${d}"/></svg>
`;
	}
	rows.push({ id, ...e, wind, box: b, closed: out.closed, open: out.open });
}

// ---- report -----------------------------------------------------------------
console.log(`\n${rows.length} emblems\n`);
console.log('id                 fill      w x h        wind          bytes c/o   mark');
for (const r of rows) {
	console.log(`${r.id.padEnd(18)} ${r.fill}  ${r.box.w.toFixed(1).padStart(4)} x ${r.box.h.toFixed(1).padStart(4)}  `
		+ `${r.wind.padEnd(12)}  ${String(Buffer.byteLength(r.closed)).padStart(4)}/${String(Buffer.byteLength(r.open)).padStart(4)}  ${r.mark}`);
}
const allBytes = rows.flatMap(r => [Buffer.byteLength(r.closed), Buffer.byteLength(r.open)]);
console.log(`\nbytes: max ${Math.max(...allBytes)}, avg ${Math.round(allBytes.reduce((a, b) => a + b) / allBytes.length)} (soft cap 2048, hard 4096)`);
console.log(`${fail} geometry/tone problem(s)`);

if (process.argv.includes('--write')) {
	for (const r of rows) {
		writeFileSync(`${OUT}/${r.id}.svg`, r.closed, 'utf8');
		writeFileSync(`${OUT}/${r.id}-open.svg`, r.open, 'utf8');
	}
	console.log(`\nwrote ${rows.length * 2} files to ${OUT}`);
}
