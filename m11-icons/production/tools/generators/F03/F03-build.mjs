#!/usr/bin/env node
// F03-build.mjs — emit svg/folder/<id>.svg and <id>-open.svg for slice F03.
//
//   node F03-build.mjs           # write the 90 files
//   node F03-build.mjs --dry     # report only

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { ctx, BOX } from './F03-lib.mjs';
import { MARKS } from './F03-marks.mjs';

const PROD = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production';
const OUT = join(PROD, 'svg', 'folder');
const LETTERPATH = join(PROD, 'tools', 'letterpath.mjs');
const DRY = process.argv.includes('--dry');

const inner = (file) => readFileSync(join(OUT, file), 'utf8')
	.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
const BASE = { closed: inner('folder.svg'), open: inner('folder-open.svg') };

const letterCache = new Map();
function letter(text, inkH, variant) {
	const key = `${text}|${inkH}|${variant}`;
	if (letterCache.has(key)) { return letterCache.get(key); }
	const b = BOX[variant];
	const args = ['--text', text, '--ink-height', String(+(b.s * inkH).toFixed(4)),
		'--cx', String(+(b.x + b.s * 5).toFixed(4)), '--cy-ink', String(+(b.y + b.s * 5).toFixed(4)),
		'--precision', '2', '--json'];
	const out = JSON.parse(execFileSync('node', [LETTERPATH, ...args], { encoding: 'utf8' }));
	letterCache.set(key, out);
	return out;
}

const report = [];
let bytes = 0;

for (const m of MARKS) {
	const files = {};
	for (const variant of ['closed', 'open']) {
		let d;
		if (m.letter) {
			const L = letter(m.letter.text, m.letter.inkH, variant);
			d = L.d;
			if (variant === 'closed') {
				const b = BOX.closed;
				const w = (L.ink.x2 - L.ink.x1) / b.s, h = (L.ink.y2 - L.ink.y1) / b.s;
				m._letterInk = `${w.toFixed(2)}x${h.toFixed(2)} field units`;
				if (w > 10.01) { console.error(`!! ${m.id}: letter ink ${w.toFixed(2)} > 10 field units`); }
			}
		} else {
			d = m.draw(ctx(variant));
		}
		const name = variant === 'closed' ? `${m.id}.svg` : `${m.id}-open.svg`;
		files[name] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">`
			+ BASE[variant] + `<path fill="${m.fill}" d="${d}"/></svg>\n`;
	}
	for (const [name, src] of Object.entries(files)) {
		bytes += Buffer.byteLength(src);
		if (!DRY) { writeFileSync(join(OUT, name), src, 'utf8'); }
	}
	report.push([m.id, Object.values(files).map(s => Buffer.byteLength(s)).join('/'), m.fill, m.emblem]);
}

for (const r of report) { console.log(r[0].padEnd(18), r[1].padEnd(10), r[2], ' ', r[3]); }
console.log(`\n${MARKS.length} concepts, ${MARKS.length * 2} files, ${bytes} bytes, ` +
	`avg ${Math.round(bytes / (MARKS.length * 2))} B${DRY ? '  (dry run)' : ''}`);
const ids = new Set(MARKS.map(m => m.id));
if (ids.size !== MARKS.length) { console.error('!! duplicate ids'); process.exit(1); }
