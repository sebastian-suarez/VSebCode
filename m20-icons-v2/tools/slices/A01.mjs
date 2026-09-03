// A01.mjs — the registry for production slice A01.
//
// The slice is built by three agents working in parallel, one tranche each, so
// the registry is a MERGE and nothing else: drop `A01.t2.mjs` next to this file
// and its subjects are in the build. That is the whole integration step — no
// import to add, no list to extend, no order to reconcile. A tranche that has
// not landed yet is reported as missing (and its share of the roster as pending);
// it is only fatal once all three are present and the roster is still short.
//
// Every tranche module exports the same shape:
//
//   SPECS             { id: spec }            the subjects themselves
//   ORDER             [id, …]                 sheet order within the tranche
//   PROOF16           { id: [verdict, note] } the eyeballed 16 px verdicts
//   FAMILIES          { family: {…} }         working rule 1 declarations
//   NEUTRAL_COLLAPSE  { object_glyphs, category_glyphs }   working rule 2
//   ORIGINAL          { id: () => svg|null }  what the brand ships, display-safe
//   FLAGS             [ {title, rule, subjects, text} ]
//   STUDIES           [ {id, width, height, html(place)} ]   optional, measured
//                                                            alternatives to a call
//
// The FIX ROUND (2026-09-03) added four more, all optional and all merged the same
// way. They exist because the round is a slice-level event that every tranche
// contributes to, and because a flag's NUMBER is the thing a gate verdict refers to:
//
//   FIX_FLAGS         [ flag ]                 appended AFTER every tranche's FLAGS,
//                                              so the gate's own 1-35 keep their
//                                              numbers and the round's continue
//                                              from 36
//   FIX_ROUND         { rebuilt, rehunted_and_unchanged, notes }
//                                              what this tranche rebuilt, for the
//                                              manifest's fix_round record and the
//                                              sheet's before/after strip
//   VOCABULARY        { name: description }    neutral-vocabulary glyphs this
//                                              tranche contributes, so the manifest
//                                              stops hard-coding the list
//   LOOKALIKE         [ {pair, ruling, why} ]  declared look-alike pairs — two real
//                                              marks that genuinely resemble each
//                                              other and both keep them (audit.mjs)

import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeMaster } from '../spec-engine.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));

export const ID = 'A01';
export const LABEL = 'A01 — archive, binary and code, the first 84 concepts of the long tail';
export const TRANCHES = ['A01.t1.mjs', 'A01.t2.mjs', 'A01.t3.mjs'];

const present = [], missing = [];
const mods = [];
for (const f of TRANCHES) {
	if (!existsSync(join(HERE, f))) { missing.push(f); continue; }
	present.push(f);
	mods.push({ file: f, mod: await import(`./${f}`) });
}

const S = {};
const order = [];
const proof16 = {};
const families = {};
const neutral = { object_glyphs: {}, category_glyphs: {} };
const original = {};
const flags = [];
const fixFlags = [];
const studies = [];
const vocabulary = {};
const lookalike = [];
const fixRound = { rebuilt: [], rehunted_and_unchanged: [], notes: {} };
const owner = {};   // subject id -> the tranche that declared it

for (const { file, mod } of mods) {
	for (const [id, s] of Object.entries(mod.SPECS || {})) {
		if (S[id]) { throw new Error(`${file}: ${id} is already declared by ${owner[id]}`); }
		S[id] = s; owner[id] = file;
	}
	order.push(...(mod.ORDER || Object.keys(mod.SPECS || {})));
	Object.assign(proof16, mod.PROOF16 || {});
	Object.assign(families, mod.FAMILIES || {});
	Object.assign(neutral.object_glyphs, (mod.NEUTRAL_COLLAPSE || {}).object_glyphs || {});
	for (const [glyph, ids] of Object.entries((mod.NEUTRAL_COLLAPSE || {}).category_glyphs || {})) {
		neutral.category_glyphs[glyph] = [...(neutral.category_glyphs[glyph] || []), ...ids];
	}
	Object.assign(original, mod.ORIGINAL || {});
	flags.push(...(mod.FLAGS || []).map(f => ({ ...f, tranche: file })));
	fixFlags.push(...(mod.FIX_FLAGS || []).map(f => ({ ...f, tranche: file, fix_round: true })));
	studies.push(...(mod.STUDIES || []));
	Object.assign(vocabulary, mod.VOCABULARY || {});
	lookalike.push(...(mod.LOOKALIKE || []).map(l => ({ ...l, tranche: file })));
	const fr = mod.FIX_ROUND || {};
	fixRound.rebuilt.push(...(fr.rebuilt || []));
	fixRound.rehunted_and_unchanged.push(...(fr.rehunted_and_unchanged || []));
	Object.assign(fixRound.notes, fr.notes || {});
}

export const SPECS = S;
export const FILES = order;
export const FOLDERS = [];                 // A01 is a file slice
export const SUBJECTS = order;
export const master = makeMaster(S);
export const spec = (id) => S[id];
export const PROOF16 = proof16;
export const FAMILIES = families;
export const NEUTRAL_COLLAPSE = neutral;
export const ORIGINAL = original;
/**
 * The gate's flags first, then the fix round's. Numbering happens once, in
 * build-slice.mjs, off THIS array — so 1-35 are the numbers the A01 gate was
 * decided on and the fix round's start at 36, which is what every supersession
 * pointer in the modules assumes.
 */
export const FLAGS = [...flags, ...fixFlags];
export const STUDIES = studies;
export const VOCABULARY = vocabulary;
export const LOOKALIKE = lookalike;

/**
 * THE FIX-ROUND PREAMBLE (2026-09-03), recorded at slice level because the ruling
 * is one ruling and it moved subjects in all three tranches. The per-subject
 * records come from each tranche's own FIX_ROUND export and are merged above.
 */
export const FIX_ROUND = {
	ruling: '2026-09-03',
	verdict: 'Sebastian at the A01 gate: "I like the icons that are actually the real Icon. Why '
		+ 'is there a lot of the same angled brackets? The licenses don\'t apply here because '
		+ 'this is a personal project and will not be distributed."',
	binding: 'LICENCE, TRADEMARK AND BRAND-USAGE POLICY NO LONGER GATE SOURCING. Every subject '
		+ 'that went neutral because a mark could not be licensed, or that avoided its true mark '
		+ 'on trademark grounds, takes that mark now, and the sourcing chain orders by FIDELITY '
		+ 'alone: the brand\'s own SVG first, then whichever faithful vector of the real mark '
		+ 'exists, wherever it happens to be licensed. Repo logos, favicons, product icons and '
		+ 'extension assets are all in scope. D22-amendment grade.',
	unchanged: 'L5\'s legibility physics, the prettier-rider and gestalt reading, true colour, '
		+ 'the ban on typeset letters, the twin audit, the neutral vocabulary for concepts that '
		+ 'genuinely own no mark, and L2\'s rule that geometry may never be traced from a raster '
		+ 'or drawn freehand — that last one is a FIDELITY rule and still binds, which is why '
		+ 'beancount and Axure\'s app icon are still neutral. Provenance duty is untouched: every '
		+ 'source and licence is still recorded verbatim. We document what the licence IS; it '
		+ 'just does not decide.',
	scale: '20 of the slice\'s 40 generic-code icons left the collapse, plus vsix and '
		+ 'safetensors out of tranche 1\'s archive and binary glyphs — 15 found real marks and 5 '
		+ 'moved onto two new object glyphs (terminal, stopwatch).',
	rebuilt: fixRound.rebuilt,
	rehunted_and_unchanged: fixRound.rehunted_and_unchanged,
	notes: fixRound.notes,
	lookalike_lane: 'OPENED BY THIS ROUND. Two brands whose REAL marks genuinely resemble each '
		+ 'other may both keep them: the pair is declared, reported with its live R7/R8 scores on '
		+ 'every run, and never fails. An undeclared pair scoring the same still fails. One member '
		+ 'so far — antlr/chrome, the pair flag 18 removed antlr for.',
	studies: ['license-freed-study', 'license-freed-t3-study', 'antlr-chrome-study',
		'agda-and-friends-study', 'bench-family-study', 'object-glyph-study'],
	flags: 'the gate\'s flags keep the numbers 1-35 it was decided on, each overturned one '
		+ 'marked SUPERSEDED in place with a pointer; the fix round\'s own flags are 36 onward.'
};
export const MODULES = { expected: TRANCHES, present, missing, complete: missing.length === 0 };

export const REGISTRY = {
	id: ID, kind: 'slice', label: LABEL,
	specs: S, FILES, FOLDERS, SUBJECTS, master, spec,
	PROOF16, FAMILIES, NEUTRAL_COLLAPSE, ORIGINAL, FLAGS, STUDIES, MODULES,
	VOCABULARY, LOOKALIKE, FIX_ROUND
};
