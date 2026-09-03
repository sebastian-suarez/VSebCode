#!/usr/bin/env node
// check.mjs — the L9 gates that are pure geometry and format.
//
//   node tools/check.mjs
//
// Five things get asserted here, in the order a reviewer would ask them:
//   L8   format law — viewBox, banned constructs, byte budget, 2 decimals.
//   CARRY  the twelve subjects D22 froze still fit to exactly the bytes
//          samples/masters/ holds. "Carried, frozen" is a measurement.
//   DERIVE R1 says a file icon IS its master, and L7 says closed and open are one
//          construction — so both are byte-equality assertions, not prose.
//   L7   the folder differentiator is >= 8 px and centred on the face.
//   L2/L3  every subject has a source and a simplification log; and R1 has no
//          typeset letters at all, so the L3 table stays dormant.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FILES, FOLDERS, SUBJECTS, CARRIED, SUPERSEDED, SUPERSEDED_RULING, ENV, master, spec }
	from './sources.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const OUT = join(ROOT, 'pilot');
const SAMPLES = join(ROOT, 'samples', 'masters');
const DIRS = ['masters', 'icons'];
const BANNED = [/gradient/i, /<filter/i, /<mask/i, /clip-path/i, /<image/i, /<use/i,
	/<style/i, /<script/i, /\sopacity\s*=/i, /url\(/i, /xlink/i, /<text/i, /stroke\s*=/i];

let fail = 0, warn = 0;
const bad = (f, m) => { console.log(`  FAIL ${f}: ${m}`); fail++; };
const soft = (f, m) => { console.log(`  warn ${f}: ${m}`); warn++; };
const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${body}</svg>`;
const P = (d, fill) => `<path fill="${fill}" d="${d}"/>`;

// --- L8 format -----------------------------------------------------------------
console.log('L8 · format\n');
for (const d of DIRS) {
	let max = 0, sum = 0, files = 0; const over2k = [];
	for (const f of readdirSync(join(OUT, d)).filter(x => x.endsWith('.svg'))) {
		const src = readFileSync(join(OUT, d, f), 'utf8');
		const bytes = Buffer.byteLength(src);
		max = Math.max(max, bytes); sum += bytes; files++;
		const head = src.slice(0, src.indexOf('>') + 1);
		if (!head.includes('viewBox="0 0 16 16"')) { bad(`${d}/${f}`, 'viewBox'); }
		if (/\swidth=|\sheight=/.test(head)) { bad(`${d}/${f}`, 'width/height on <svg>'); }
		for (const re of BANNED) { if (re.test(src)) { bad(`${d}/${f}`, `banned ${re}`); } }
		if (bytes > 4096) { bad(`${d}/${f}`, `${bytes} B over the 4 KB hard cap`); }
		else if (bytes > 2048) { over2k.push([f.replace('.svg', ''), bytes]); }
		for (const m of src.matchAll(/\d\.(\d+)/g)) {
			if (m[1].length > 2) { bad(`${d}/${f}`, `>2 decimals (${m[0]})`); break; }
		}
	}
	console.log(`  ${d.padEnd(8)} ${String(files).padStart(2)} files, mean ${Math.round(sum / files)} B, max ${max} B`);
	for (const [id, b] of over2k) { soft(`${d}/${id}`, `${b} B over the 2 KB target (advisory, L8 erratum)`); }
}

// --- CARRY identity -------------------------------------------------------------
// The pilot ports the round-2 specs verbatim. Proof: refitting them here produces
// the sample masters byte for byte. Folder subjects are compared at their FILE
// scale, which is the scale samples/masters/ holds them at.
//
// AMENDED at the pilot gate (2026-09-03): docker and editorconfig were rejected
// there and rebuilt, so for those two the assertion INVERTS — they must differ.
// The gate is therefore two-sided: ten identical, exactly two superseded. A
// superseded subject that quietly came back to its round-2 bytes would be as much
// a failure as a frozen one that drifted.
console.log(`\nD22 carry identity · ${CARRIED.length} carried subjects vs samples/masters/`);
console.log(`  ${SUPERSEDED.length} SUPERSEDED BY PILOT (gate ruling ${SUPERSEDED_RULING}): `
	+ `${SUPERSEDED.join(', ')}\n`);
let carried = 0, superseded = 0;
for (const id of CARRIED) {
	const m = master(id);
	const got = svg(m.layers.map(l => P(l.d, l.fill)).join(''));
	const want = readFileSync(join(SAMPLES, `${id}.svg`), 'utf8');
	const same = got === want;
	if (SUPERSEDED.includes(id)) {
		if (same) { bad(`carry/${id}`, 'declared SUPERSEDED but still refits to the round-2 master'); }
		else { superseded++; console.log(`  ${id.padEnd(14)} superseded — rebuilt in the fix round, as ruled`); }
	} else if (!same) {
		bad(`carry/${id}`, 'refit differs from samples/masters — the subject was touched');
	} else { carried++; }
}
const frozen = CARRIED.length - SUPERSEDED.length;
console.log(`  ${carried}/${frozen} still byte-identical to the round-2 masters, `
	+ `${superseded}/${SUPERSEDED.length} superseded as ruled`);

// --- DERIVATION identity ---------------------------------------------------------
console.log('\nR1 derivation identity · icon == master, and one mark across closed/open\n');
const dOf = (dir, id) => [...readFileSync(join(OUT, dir, `${id}.svg`), 'utf8')
	.matchAll(/ d="([^"]+)"/g)].map(m => m[1]);
const failBefore = fail;
for (const id of FILES) {
	const a = readFileSync(join(OUT, 'masters', `${id}.svg`), 'utf8');
	const b = readFileSync(join(OUT, 'icons', `${id}.svg`), 'utf8');
	if (a !== b) { bad(`derive/${id}`, 'the shipped icon is not byte-identical to its master'); }
}
for (const id of FOLDERS) {
	const mark = master(id, ENV.face).mono;
	const faceMaster = dOf('masters', id);
	if (faceMaster.length !== 1 || faceMaster[0] !== mark) {
		bad(`derive/${id}`, 'the face master is not the fitted mark');
	}
	const closed = dOf('icons', id), open = dOf('icons', `${id}-open`);
	if (closed.length !== 2) { bad(`derive/${id}`, `closed: expected body + mark, got ${closed.length} paths`); }
	else if (closed[1] !== mark) { bad(`derive/${id}`, 'closed mark differs from the face master'); }
	if (open.length !== 3) { bad(`derive/${id}-open`, `open: expected back + pocket + mark, got ${open.length} paths`); }
	else if (open[2] !== mark) { bad(`derive/${id}-open`, 'open mark differs from the closed mark'); }
}
if (fail === failBefore) {
	console.log(`  ${FILES.length} file icons are their masters, byte for byte`);
	console.log(`  ${FOLDERS.length} folders carry ONE mark path across face master, closed and open`);
}

// --- L7 folder mass --------------------------------------------------------------
console.log('\nL7 · folder differentiator >= 8 px, centred on the face\n');
for (const id of FOLDERS) {
	const ink = master(id, ENV.face).ink;
	const largest = Math.max(ink.w, ink.h);
	const off = { x: ink.cx - ENV.face.cx, y: ink.cy - ENV.face.cy };
	console.log(`  ${id.padEnd(14)} ${ink.w.toFixed(2)} x ${ink.h.toFixed(2)}  largest ${largest.toFixed(2)}`
		+ `  centre offset ${off.x.toFixed(2)}, ${off.y.toFixed(2)}`);
	if (largest < 8) { bad(id, `folder mark largest ink ${largest.toFixed(2)} < 8 px`); }
	if (Math.abs(off.x) > 0.06 || Math.abs(off.y) > 0.06) { bad(id, 'face mark is not centred'); }
}

// --- L2 provenance ----------------------------------------------------------------
console.log('\nL2 · provenance duty\n');
const manifest = JSON.parse(readFileSync(join(OUT, 'manifest.json'), 'utf8'));
for (const id of SUBJECTS) {
	const e = manifest.subjects[id];
	if (!e) { bad('manifest.json', `no entry for ${id}`); continue; }
	if (!e.source || !e.source.name) { bad('manifest.json', `${id} has no source name`); }
	if (!Array.isArray(e.simplifications)) { bad('manifest.json', `${id} has no simplifications array`); }
	const neutral = spec(id).neutral;
	if (!neutral && !(e.source.url && e.source.slug && e.source.license)) {
		bad('manifest.json', `${id} is missing slug / url / license`);
	}
}
const branded = SUBJECTS.filter(x => !spec(x).neutral);
const simplified = branded.filter(x => manifest.subjects[x].simplifications.length);
console.log(`  ${branded.length} branded subjects, every one with source name + slug + url + license`);
console.log(`  ${SUBJECTS.length - branded.length} mark-less subjects on the neutral vocabulary`);
console.log(`  ${simplified.length} subjects carry logged simplifications`);

// --- L3 letter audit ---------------------------------------------------------------
// R1 has no typeset letters at all: the letterforms in this set (typescript, npm,
// dotenv, yaml, go) are the brands' own outlines, arriving as source geometry.
console.log('\nL3 · letter audit\n');
let typeset = 0;
for (const d of DIRS) {
	for (const f of readdirSync(join(OUT, d)).filter(x => x.endsWith('.svg'))) {
		const src = readFileSync(join(OUT, d, f), 'utf8');
		if (/<text|font-family|letterpath/i.test(src)) { bad(`${d}/${f}`, 'typeset letters'); typeset++; }
	}
}
console.log(`  ${typeset} typeset letters in ${SUBJECTS.length} subjects — the L3 table stays dormant`);
console.log('  letterforms present as faithful SOURCE geometry: typescript, npm, dotenv, yaml, go');

// --- the sheet ----------------------------------------------------------------------
console.log('\nsheet\n');
const sheetPath = join(OUT, 'sheet.html');
if (!existsSync(sheetPath)) { soft('sheet.html', 'not built yet'); }
else {
	const sheet = readFileSync(sheetPath, 'utf8');
	for (const re of [/https?:\/\//, /url\(/, /@import/, /<img/i, /srcset/i, /<script/i]) {
		if (re.test(sheet)) { bad('sheet.html', `external reference ${re}`); }
	}
	if (!/background:\s*#121314/i.test(sheet)) { bad('sheet.html', 'body background not explicit'); }
	console.log(`  ${(Buffer.byteLength(sheet) / 1024).toFixed(1)} KB, `
		+ `${(sheet.match(/<svg/g) || []).length} inlined svgs, self-contained`);
}

console.log(fail ? `\n${fail} FAILURES, ${warn} warnings` : `\nall gates pass (${warn} advisory warnings)`);
process.exit(fail ? 1 : 0);
