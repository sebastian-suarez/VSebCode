#!/usr/bin/env node
// check.mjs — the round-2 gates: L8 format, L7 folder mass, the provenance duty,
// and the one gate that only round 2 can have — GEOMETRY IDENTITY, i.e. proof
// that all four treatments really are the same master mark and not four drawings.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SUBJECTS, ENV, master, spec } from './sources.mjs';
import { bbox, unionBBox } from './pathkit.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, '..');
const DIRS = ['masters', 'r1-true', 'r2-tint', 'r3-chips', 'r4-tamed'];
const BANNED = [/gradient/i, /<filter/i, /<mask/i, /clip-path/i, /<image/i, /<use/i,
	/<style/i, /<script/i, /\sopacity\s*=/i, /url\(/i, /xlink/i, /<text/i, /stroke\s*=/i];

let fail = 0, warn = 0;
const bad = (f, m) => { console.log(`  FAIL ${f}: ${m}`); fail++; };
const soft = (f, m) => { console.log(`  warn ${f}: ${m}`); warn++; };

// --- L8 format -----------------------------------------------------------------
console.log('L8 · format\n');
for (const d of DIRS) {
	let max = 0, sum = 0, files = 0, over2k = [];
	for (const f of readdirSync(join(OUT, d)).filter(x => x.endsWith('.svg'))) {
		const src = readFileSync(join(OUT, d, f), 'utf8');
		const bytes = Buffer.byteLength(src);
		max = Math.max(max, bytes); sum += bytes; files++;
		const head = src.slice(0, src.indexOf('>') + 1);
		if (!head.includes('viewBox="0 0 16 16"')) { bad(`${d}/${f}`, 'viewBox'); }
		if (/\swidth=|\sheight=/.test(head)) { bad(`${d}/${f}`, 'width/height on <svg>'); }
		for (const re of BANNED) { if (re.test(src)) { bad(`${d}/${f}`, `banned ${re}`); } }
		if (bytes > 4096) { bad(`${d}/${f}`, `${bytes} B over the 4 KB hard cap`); }
		else if (bytes > 2048) { over2k.push(`${f.replace('.svg', '')} ${bytes}`); }
		for (const m of src.matchAll(/\d\.(\d+)/g)) {
			if (m[1].length > 2) { bad(`${d}/${f}`, `>2 decimals (${m[0]})`); break; }
		}
	}
	console.log(`  ${d.padEnd(10)} ${files} files, mean ${Math.round(sum / files)} B, max ${max} B`
		+ (over2k.length ? `  — over the 2 KB target: ${over2k.join(', ')}` : ''));
	for (const o of over2k) { soft(`${d}/${o.split(' ')[0]}`, `${o.split(' ')[1]} B > 2 KB target`); }
}

// --- geometry identity ------------------------------------------------------------
// R1 and R4 must be the master's colour layers; R2 must be the master's mono path;
// R3 must be the same mono path at the chip's scale; a folder's four files must all
// carry one face mark. Any drift means a treatment quietly redrew something.
console.log('\nround-2 gate · geometry identity across treatments\n');
const failBefore = fail;
const dOf = (dir, id) => [...readFileSync(join(OUT, dir, `${id}.svg`), 'utf8')
	.matchAll(/ d="([^"]+)"/g)].map(m => m[1]);
const norm = (arr) => arr.join('|');

for (const id of SUBJECTS) {
	const s = spec(id);
	const m = master(id);
	const face = master(id, ENV.face);
	const chip = master(id, { w: 10, h: 10, cx: 8, cy: 8 });
	const [r1, r2, r3, r4] = ['r1-true', 'r2-tint', 'r3-chips', 'r4-tamed'].map(x => dOf(x, id));
	if (s.folder) {
		const mark = face.mono;
		for (const [name, got] of [['r1', r1], ['r2', r2], ['r3', r3], ['r4', r4]]) {
			if (got.length !== 2) { bad(`${id}/${name}`, `expected folder + mark, got ${got.length} paths`); }
			else if (got[1] !== mark) { bad(`${id}/${name}`, 'face mark differs from the master'); }
		}
	} else {
		const layers = m.layers.map(l => l.d);
		if (norm(r1) !== norm(layers)) { bad(`${id}/r1`, 'geometry differs from the master'); }
		if (norm(r4) !== norm(layers)) { bad(`${id}/r4`, 'geometry differs from R1'); }
		if (norm(r2) !== m.mono) { bad(`${id}/r2`, 'not the master as one flat path'); }
		if (r3.length !== 2 || r3[1] !== chip.mono) { bad(`${id}/r3`, 'chip ink is not the master'); }
	}
}
if (fail === failBefore) { console.log('  all 12 subjects: R1/R2/R3/R4 carry one identical master mark'); }

// --- L7 folder mass + L5 detail budget --------------------------------------------
console.log('\nL7 · folder differentiator >= 8 px on the face\n');
for (const id of SUBJECTS.filter(x => spec(x).folder)) {
	const ink = master(id, ENV.face).ink;
	const largest = Math.max(ink.w, ink.h);
	console.log(`  ${id.padEnd(13)} ${ink.w.toFixed(2)} x ${ink.h.toFixed(2)}  largest ${largest.toFixed(2)}`);
	if (largest < 8) { bad(id, `folder mark largest ink ${largest.toFixed(2)} < 8 px`); }
}

// --- L2 provenance duty --------------------------------------------------------------
console.log('\nL2 · provenance\n');
const manifest = JSON.parse(readFileSync(join(OUT, 'sources.json'), 'utf8'));
for (const id of SUBJECTS) {
	const e = manifest.subjects[id];
	if (!e) { bad('sources.json', `no entry for ${id}`); continue; }
	const neutral = spec(id).neutral;
	if (!neutral && !e.source.url) { bad('sources.json', `${id} has no source URL`); }
}
const branded = SUBJECTS.filter(x => !spec(x).neutral);
const simplified = branded.filter(x => manifest.subjects[x].simplifications.length);
console.log(`  ${branded.length} branded subjects, all with a recorded source; `
	+ `${simplified.length} carry logged simplifications`);

// --- the sheet ---------------------------------------------------------------------
console.log('\nsheet\n');
const sheetPath = join(OUT, 'sheet.html');
if (!existsSync(sheetPath)) { soft('sheet.html', 'not built yet'); }
else {
	const sheet = readFileSync(sheetPath, 'utf8');
	for (const re of [/https?:\/\//, /url\(/, /@import/, /<img/i, /srcset/i]) {
		if (re.test(sheet)) { bad('sheet.html', `external reference ${re}`); }
	}
	if (!/<title>Icons v2 Candidates<\/title>/.test(sheet)) {
		bad('sheet.html', 'the artifact title must stay exactly "Icons v2 Candidates"');
	}
	if (!/background:\s*#121314/i.test(sheet)) { bad('sheet.html', 'body background not explicit'); }
	console.log(`  ${(Buffer.byteLength(sheet) / 1024).toFixed(1)} KB, `
		+ `${(sheet.match(/<svg/g) || []).length} inlined svgs, self-contained`);
}

console.log(fail ? `\n${fail} FAILURES, ${warn} warnings` : `\nall gates pass (${warn} warnings)`);
void bbox; void unionBBox;
process.exit(fail ? 1 : 0);
