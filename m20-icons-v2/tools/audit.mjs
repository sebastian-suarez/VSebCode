#!/usr/bin/env node
// audit.mjs — the twin audit (L9 gate 4), thresholds ported from the m11
// production tooling so a v2 verdict is comparable with every v1 verdict.
//
//   node tools/audit.mjs [A01] [--json]
//
// With a slice id the audit is CROSS-SET: the pilot's twenty subjects and every
// subject the slice has built are scored in one pool, because a slice icon that
// collides with a pilot icon is exactly as bad as one that collides inside its own
// slice. THREE lanes are exempt from R8 and REPORTED instead of failed, because in
// all three the identity is declared and deliberate:
//   FAMILY   working rule 1 — a variant that ships its family's base mark under its
//            own id (python-misc). Byte-identity is the rule doing its job.
//   NEUTRAL  working rule 2 — concepts that share a CATEGORY glyph (awk/bat on the
//   COLLAPSE terminal, the three bench ids on the stopwatch). Byte-identity is the
//            collapse doing its job.
//   LOOK-    NEW WITH THE A01 FIX ROUND (2026-09-03), chartered by the ruling that
//   ALIKE    reinstated antlr. Two brands whose REAL marks genuinely resemble each
//            other may both keep them: the pair is DECLARED in the registry
//            (LOOKALIKE, in the tranche that owns the mark), named with the ruling
//            that opened it, reported with its live scores on every run, and never
//            failed. This is a lane and not a mute button — it prints exactly what
//            it is exempting, and an UNDECLARED pair scoring the same still fails.
// None of the three is silently dropped: all print with their scores.
//
// R7  two icons are twins iff dhue < 12 AND dL < 12 AND dS < 25 on their dominant
//     fills. Chroma (HSL S) < 25 is the neutral lane and is exempt.
//     R1 abolished archetypes (L1: "there are no archetypes in v2"), so m11's
//     "same archetype" qualifier collapses into its SILHOUETTE lane reading:
//     every v2 icon is a faithful mark, and a colour hit whose shapes read more
//     than FORM_SEP apart is a hue NEIGHBOURHOOD, not a twin.
// R8  the same recognisable shape for two unrelated concepts collides even in a
//     different hue. Scored as the smaller of area IoU and dilated-outline IoU
//     over the 64x64 shape mask.
//
// Files are scored on their whole silhouette. Folders all share one silhouette by
// law, so they are scored on the white face mark — the same move m11 made for its
// folder emblems — and on their body colour. PLATE marks (an official field
// carrying a glyph: typescript, npm, dotenv) share a silhouette the same way a
// v1 BADGE did, so they get m11's BADGE treatment: score the GLYPH, against the
// higher IOU_COLLIDE_PLATE bar. The plate flag is a property of the artwork,
// declared in sources.mjs, not a judgement made here.

import { readFileSync, writeSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FILES, FOLDERS, spec } from './sources.mjs';
import { toHsl } from './color.mjs';
import { resolveTarget } from './targets.mjs';
import { rasterFills } from '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/tools/raster.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, '..', 'pilot');
const asJson = process.argv.includes('--json');
const target = await resolveTarget();
const slice = target.kind === 'slice' ? target.registry : null;

// thresholds — m11 production/tools/audit.mjs, unchanged
const D_HUE = 12, D_LIGHT = 12, D_SAT = 25, NEUTRAL_S = 25;
const IOU_COLLIDE = 0.72, IOU_NEAR = 0.60, FORM_SEP = 0.55;
const IOU_COLLIDE_PLATE = 0.92;   // m11's IOU_COLLIDE_BADGE — every plate silhouette is
                                  // identical by construction, so only a near-identical
                                  // GLYPH inside one may reach the bar

const entries = [
	...FILES.map(id => ({ set: 'pilot', kind: 'file', id, path: join(OUT, 'icons', `${id}.svg`) })),
	...FOLDERS.map(id => ({ set: 'pilot', kind: 'folder', id, path: join(OUT, 'icons', `${id}.svg`) })),
	...(slice ? slice.FILES.map(id => ({ set: slice.id, kind: 'file', id,
		path: join(target.dir, 'icons', `${id}.svg`) })) : []),
	...(slice ? slice.FOLDERS.map(id => ({ set: slice.id, kind: 'folder', id,
		path: join(target.dir, 'icons', `${id}.svg`) })) : [])
];

// declared identities (see the header): which family / which shared category glyph /
// which declared look-alike pair
const familyOf = {}, collapseOf = {};
const lookalikeOf = new Map();       // "a|b" (sorted) -> the declaration
if (slice) {
	for (const [name, f] of Object.entries(slice.FAMILIES || {})) {
		for (const id of [f.base, ...(f.members || [])]) { familyOf[id] = name; }
	}
	for (const [glyph, ids] of Object.entries((slice.NEUTRAL_COLLAPSE || {}).category_glyphs || {})) {
		for (const id of ids) { collapseOf[id] = glyph; }
	}
	// a look-alike declaration names exactly two ids and the ruling that opened it;
	// anything short of that is not a declaration and the pair keeps failing
	for (const l of slice.LOOKALIKE || []) {
		if (!Array.isArray(l.pair) || l.pair.length !== 2 || !l.ruling) {
			throw new Error(`LOOKALIKE entry must name two ids and a ruling: ${JSON.stringify(l)}`);
		}
		lookalikeOf.set([...l.pair].sort().join('|'), l);
	}
}
const declared = (A, B) => {
	if (familyOf[A.id] && familyOf[A.id] === familyOf[B.id]) { return { lane: 'family', name: familyOf[A.id] }; }
	if (collapseOf[A.id] && collapseOf[A.id] === collapseOf[B.id]) { return { lane: 'collapse', name: collapseOf[A.id] }; }
	const L = lookalikeOf.get([A.id, B.id].sort().join('|'));
	if (L) { return { lane: 'lookalike', name: L.pair.join(' / '), decl: L }; }
	return null;
};

// the raster is keyed per SET as well as per kind: two sets may one day carry the
// same concept id, and a silent key collision there would score an icon against
// itself instead of against its twin
const raster = await rasterFills(entries.map(e => ({ kind: `${e.set}/${e.kind}`, id: e.id, path: e.path })));
const specOf = (e) => (e.set === 'pilot' ? spec(e.id) : slice.spec(e.id));

const icons = entries.map(e => {
	const r = raster.get(`${e.set}/${e.kind}/${e.id}`);
	const dominant = r.dominant;
	const [h, s, l] = toHsl(dominant);
	const plate = !!specOf(e).plate;
	// a folder's silhouette is set law; its FACE MARK is what distinguishes it.
	// same for a plate mark: the field is a rectangle, the glyph is the concept.
	const form = (e.kind === 'folder' || plate) ? r.mark : r.ink;
	return { ...e, plate, dominant, hsl: { h, s, l }, form, ink: r.ink, mask: r.mask,
		coverage: r.coverage };
});

// ---- form similarity (m11's scoring, verbatim in behaviour) --------------------
const WORDS = 128;                       // 64 x 64 bits
const bitsOf = new Map();
function bits(mask) {
	let v = bitsOf.get(mask);
	if (v) { return v; }
	v = new Uint32Array(WORDS);
	for (let i = 0; i < mask.length; i++) { if (mask[i] === '1') { v[i >>> 5] |= (1 << (i & 31)); } }
	bitsOf.set(mask, v);
	return v;
}
function popcount(x) {
	x -= (x >>> 1) & 0x55555555;
	x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
	x = (x + (x >>> 4)) & 0x0f0f0f0f;
	return (Math.imul(x, 0x01010101) >>> 24);
}
function iouBits(a, b) {
	let inter = 0, union = 0;
	for (let i = 0; i < WORDS; i++) { inter += popcount(a[i] & b[i]); union += popcount(a[i] | b[i]); }
	return union ? inter / union : 0;
}
const outlines = new Map();
function outline(mask, M) {
	if (outlines.has(mask)) { return outlines.get(mask); }
	const at = (x, y) => (x < 0 || y < 0 || x >= M || y >= M ? '0' : mask[y * M + x]);
	const edge = new Uint8Array(M * M);
	for (let y = 0; y < M; y++) {
		for (let x = 0; x < M; x++) {
			if (at(x, y) !== '1') { continue; }
			if (at(x - 1, y) === '0' || at(x + 1, y) === '0' || at(x, y - 1) === '0' || at(x, y + 1) === '0') {
				edge[y * M + x] = 1;
			}
		}
	}
	const out = new Array(M * M).fill('0');
	for (let y = 0; y < M; y++) {
		for (let x = 0; x < M; x++) {
			if (!edge[y * M + x]) { continue; }
			for (let dy = -1; dy <= 1; dy++) {
				for (let dx = -1; dx <= 1; dx++) {
					const nx = x + dx, ny = y + dy;
					if (nx >= 0 && ny >= 0 && nx < M && ny < M) { out[ny * M + nx] = '1'; }
				}
			}
		}
	}
	const s = out.join('');
	outlines.set(mask, s);
	return s;
}
/**
 * Which mask a pair is scored on, and the bar it has to clear. Two plates share a
 * rectangle, so they are compared glyph to glyph against the higher bar; a plate
 * against a free-form mark is compared silhouette to silhouette, because there
 * the rectangle IS the difference.
 */
function lane(A, B) {
	if (A.kind === 'folder') { return { key: 'form', bar: IOU_COLLIDE, why: 'face mark' }; }
	if (A.plate && B.plate) { return { key: 'form', bar: IOU_COLLIDE_PLATE, why: 'plate glyph' }; }
	return { key: 'ink', bar: IOU_COLLIDE, why: 'silhouette' };
}
function formSim(A, B, floor = FORM_SEP) {
	const { key } = lane(A, B);
	const [ma, mb] = [A[key], B[key]];
	const area = iouBits(bits(ma), bits(mb));
	if (area < floor) { return { area, edge: area, sim: area, early: true }; }
	const edge = iouBits(bits(outline(ma, A.mask)), bits(outline(mb, B.mask)));
	return { area, edge, sim: Math.min(area, edge) };
}
const dHue = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };

// ---- R7 + R8 -------------------------------------------------------------------
const twins = [], separated = [], nearTwins = [], forms = [], nearForms = [], neutralPairs = [];
const familyLane = [], collapseLane = [], lookalikeLane = [];
for (const kind of ['file', 'folder']) {
	const pool = icons.filter(i => i.kind === kind);
	for (let i = 0; i < pool.length; i++) {
		for (let j = i + 1; j < pool.length; j++) {
			const A = pool[i], B = pool[j];
			const dh = dHue(A.hsl.h, B.hsl.h);
			const dl = Math.abs(A.hsl.l - B.hsl.l), ds = Math.abs(A.hsl.s - B.hsl.s);
			const rec = { kind, a: A.id, b: B.id, ...(slice ? { sets: `${A.set}/${B.set}` } : {}),
				dh: +dh.toFixed(1), dl: +dl.toFixed(1), ds: +ds.toFixed(1) };

			// DECLARED IDENTITY — reported in its own lane and scored, never failed
			// and never dropped (working rules 1 and 2)
			const d = declared(A, B);
			if (d) {
				const rec2 = { ...rec, declared: d.name, ...round3(formSim(A, B, 0)),
					identical: A.ink === B.ink };
				if (d.lane === 'lookalike') {
					// the whole point of this lane is that the numbers stay visible, so the
					// bar it WOULD have been judged against is recorded next to the score
					lookalikeLane.push({ ...rec2, bar: lane(A, B).bar, scored: lane(A, B).why,
						ruling: d.decl.ruling, why: d.decl.why });
				} else {
					(d.lane === 'family' ? familyLane : collapseLane).push(rec2);
				}
				continue;
			}

			// R8 first — form collisions are unscoped by colour
			const L = lane(A, B);
			rec.scored = L.why;
			const f = formSim(A, B, IOU_NEAR);
			if (f.sim >= L.bar) { forms.push({ ...rec, bar: L.bar, ...round3(f) }); }
			else if (f.sim >= IOU_NEAR) { nearForms.push({ ...rec, bar: L.bar, ...round3(f) }); }

			// R7
			if (A.hsl.s < NEUTRAL_S || B.hsl.s < NEUTRAL_S) {
				if (dh < D_HUE && dl < D_LIGHT && ds < D_SAT) {
					neutralPairs.push({ ...rec, ...round3(formSim(A, B, 0)) });
				}
				continue;
			}
			if (!(dh < D_HUE && dl < D_LIGHT && ds < D_SAT)) {
				if (dh < D_HUE * 1.5 && dl < D_LIGHT * 1.4 && ds < D_SAT * 1.4) {
					nearTwins.push({ ...rec, ...round3(formSim(A, B, 0)) });
				}
				continue;
			}
			const ff = formSim(A, B, 0);
			if (ff.sim < FORM_SEP) { separated.push({ ...rec, ...round3(ff) }); }
			else { twins.push({ ...rec, ...round3(ff) }); }
		}
	}
}
function round3(f) { return { area: +f.area.toFixed(3), edge: +f.edge.toFixed(3), sim: +f.sim.toFixed(3) }; }

// ---- report ---------------------------------------------------------------------
const result = {
	scope: slice ? `pilot + ${slice.id}` : 'pilot',
	thresholds: { D_HUE, D_LIGHT, D_SAT, NEUTRAL_S, IOU_COLLIDE, IOU_NEAR, FORM_SEP },
	palette: icons.map(i => ({ id: i.id, kind: i.kind, dominant: i.dominant,
		h: +i.hsl.h.toFixed(1), s: +i.hsl.s.toFixed(1), l: +i.hsl.l.toFixed(1) })),
	twins, separated, nearTwins, neutralPairs, forms, nearForms,
	familyLane, collapseLane, lookalikeLane
};
// writeSync, not console.log: process.exit() abandons whatever is still queued on
// stdout, and a write to a PIPE is asynchronous past the 64 KB pipe buffer. The
// pilot's report fitted under it; a slice's does not (A01 with two tranches is
// ~72 KB), so gates.mjs was receiving truncated JSON and failing to parse it.
// Same output, same exit codes, flushed before the exit.
if (asJson) {
	writeSync(1, JSON.stringify(result, null, '\t') + '\n');
	process.exit(twins.length + forms.length ? 1 : 0);
}

const row = (p) => `  ${p.a.padEnd(14)} ${p.b.padEnd(14)} dh ${String(p.dh).padStart(5)}  `
	+ `dL ${String(p.dl).padStart(5)}  dS ${String(p.ds).padStart(5)}  form ${p.sim.toFixed(3)}`
	+ (p.scored ? `  (${p.scored}${p.bar ? ', bar ' + p.bar : ''})` : '');

console.log(`scope: ${result.scope} — ${icons.length} icons in one pool`);
console.log(`R7 thresholds: dhue<${D_HUE} dL<${D_LIGHT} dS<${D_SAT}, neutral lane S<${NEUTRAL_S}`);
console.log(`R7 form qualifier: a colour hit whose form score is < ${FORM_SEP} is separated by form`);
console.log(`R8 threshold: form score >= ${IOU_COLLIDE}; near-miss watch from ${IOU_NEAR}`);
console.log(`lanes: ${icons.filter(i => i.kind === 'file').length} file icons scored on their `
	+ `silhouette, ${icons.filter(i => i.kind === 'folder').length} folders on the white face mark\n`);

console.log('dominant fills\n');
for (const p of result.palette) {
	console.log(`  ${p.id.padEnd(14)} ${p.dominant}  H ${String(p.h).padStart(5)}  `
		+ `S ${String(p.s).padStart(5)}  L ${String(p.l).padStart(5)}${p.s < NEUTRAL_S ? '   (neutral lane)' : ''}`);
}

console.log(`\n== R7 palette twins: ${twins.length} ==`);
for (const p of twins) { console.log(row(p)); }
if (!twins.length) { console.log('  none'); }

console.log(`\n== R7 colour hits SEPARATED BY FORM: ${separated.length} ==`);
for (const p of separated) { console.log(row(p)); }
if (!separated.length) { console.log('  none'); }

console.log(`\n== R7 near-misses (inside 1.5x the thresholds): ${nearTwins.length} ==`);
for (const p of nearTwins.sort((x, y) => x.dh - y.dh)) { console.log(row(p)); }
if (!nearTwins.length) { console.log('  none'); }

console.log(`\n== neutral lane collisions (S < ${NEUTRAL_S}, exempt from R7 — form is the separator): `
	+ `${neutralPairs.length} ==`);
for (const p of neutralPairs) { console.log(row(p)); }
if (!neutralPairs.length) { console.log('  none'); }

// the plate lane deserves its numbers on the page: it is the one place the audit
// changes what it measures, so show both readings side by side
const plates = icons.filter(i => i.plate);
console.log(`\n== plate lane (official field + glyph): ${plates.length} marks, `
	+ `glyph scored against bar ${IOU_COLLIDE_PLATE} ==`);
for (let i = 0; i < plates.length; i++) {
	for (let j = i + 1; j < plates.length; j++) {
		const A = plates[i], B = plates[j];
		const glyph = iouBits(bits(A.form), bits(B.form));
		const sil = iouBits(bits(A.ink), bits(B.ink));
		console.log(`  ${A.id.padEnd(14)} ${B.id.padEnd(14)} silhouette ${sil.toFixed(3)} `
			+ `(both are the official rectangle)   glyph ${glyph.toFixed(3)}`);
	}
}

// the two DECLARED lanes: exempt from R8 by rule, printed so the exemption is
// visible rather than assumed
if (slice) {
	console.log(`\n== FAMILY lane (working rule 1 — a variant shipping its family's base mark): `
		+ `${familyLane.length} ==`);
	for (const p of familyLane) {
		console.log(`  ${p.a.padEnd(14)} ${p.b.padEnd(14)} family ${p.declared}  form ${p.sim.toFixed(3)}`
			+ `  ${p.identical ? 'BYTE-IDENTICAL (expected)' : 'distinct geometry'}`);
	}
	if (!familyLane.length) { console.log('  none'); }

	console.log(`\n== NEUTRAL COLLAPSE lane (working rule 2 — concepts sharing a category glyph): `
		+ `${collapseLane.length} ==`);
	for (const p of collapseLane) {
		console.log(`  ${p.a.padEnd(14)} ${p.b.padEnd(14)} glyph ${p.declared.padEnd(16)} `
			+ `form ${p.sim.toFixed(3)}  ${p.identical ? 'BYTE-IDENTICAL (expected)' : 'distinct geometry'}`);
	}
	if (!collapseLane.length) { console.log('  none'); }

	console.log(`\n== LOOK-ALIKE lane (DECLARED pairs — two real marks that resemble each other): `
		+ `${lookalikeLane.length} ==`);
	for (const p of lookalikeLane) {
		console.log(`  ${p.a.padEnd(14)} ${p.b.padEnd(14)} form ${p.sim.toFixed(3)} `
			+ `(area ${p.area.toFixed(3)}, edge ${p.edge.toFixed(3)}) vs bar ${p.bar} on ${p.scored}`);
		console.log(`  ${''.padEnd(14)} ${''.padEnd(14)} dh ${p.dh}  dL ${p.dl}  dS ${p.ds}`
			+ `   ${p.sim >= p.bar ? 'WOULD FAIL R8 — exempt by declaration' : 'under the bar anyway'}`);
		console.log(`  ${''.padEnd(14)} ruling: ${p.ruling.split('.')[0]}.`);
	}
	if (!lookalikeLane.length) { console.log('  none declared'); }
}

console.log(`\n== R8 form collisions (>= ${IOU_COLLIDE}): ${forms.length} ==`);
for (const p of forms) { console.log(row(p)); }
if (!forms.length) { console.log('  none'); }

console.log(`\n== R8 near-misses (>= ${IOU_NEAR}): ${nearForms.length} ==`);
for (const p of nearForms.sort((x, y) => y.sim - x.sim)) { console.log(row(p)); }
if (!nearForms.length) { console.log('  none'); }

const open = twins.length + forms.length;
console.log(`\n${open ? `${open} OPEN` : 'clean'}: ${twins.length} twins, ${forms.length} form collisions, `
	+ `${separated.length} colour hits separated by form, ${nearTwins.length} near twins, `
	+ `${nearForms.length} near forms`);
void readFileSync;
process.exit(open ? 1 : 0);
