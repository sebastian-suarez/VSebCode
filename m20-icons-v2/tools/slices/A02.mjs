// A02.mjs — the registry for production slice A02.
//
// The slice is built by three agents working in parallel, one tranche each, so
// the registry is a MERGE and nothing else: drop `A02.t2.mjs` next to this file
// and its subjects are in the build. That is the whole integration step — no
// import to add, no list to extend, no order to reconcile. A tranche that has
// not landed yet is reported as missing (and its share of the roster as pending);
// it is only fatal once all three are present and the roster is still short.
//
// Every tranche module exports the same shape as A01's did — the contract is the
// slice contract, not A01's, and it does not move between slices:
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
// and the four the A01 fix round added, all optional and all merged the same way,
// because a fix round is a slice-level event every tranche contributes to and a
// flag's NUMBER is the thing a gate verdict refers to:
//
//   FIX_FLAGS         [ flag ]                 appended AFTER every tranche's FLAGS,
//                                              so the flags the gate was decided on
//                                              keep their numbers and the round's
//                                              continue from the next one
//   FIX_ROUND         { rebuilt, rehunted_and_unchanged, notes, was? }
//                                              what this tranche rebuilt, for the
//                                              manifest's fix_round record and the
//                                              sheet's before/after strip. `was` is
//                                              OPTIONAL — { id: {set, id} } naming
//                                              the icon a rebuilt subject used to
//                                              ship, for the strip's "was" pane,
//                                              needed only when the before state
//                                              was a real mark or lived in another
//                                              set (A02's cf/cfc/cfm shipped A01's
//                                              actionscript). Without it the sheet
//                                              falls back to the roster's declared
//                                              category glyph, which is what A01's
//                                              round wanted, so A01 declares none
//   VOCABULARY        { name: description }    neutral-vocabulary glyphs this
//                                              tranche contributes, so the manifest
//                                              stops hard-coding the list
//   LOOKALIKE         [ {pair, ruling, why} ]  declared look-alike pairs — two real
//                                              marks that genuinely resemble each
//                                              other and both keep them (audit.mjs)
//
// TWO THINGS A02 INHERITS RATHER THAN RE-DECIDES. The law A01's gate ruled binds
// here (D22's licence amendment, the company-mark rider, the family / collapse /
// look-alike laws, the lift trigger) — it lives in the style guide, not in this
// file. And A01 itself is APPROVED, so it is frozen and pooled: this slice is
// scored against A01's icons, may take an A01 master as a family base (`base_set:
// 'A01'` — dal is kin of al, csproj of asp/aspx), and must ship a category glyph
// A01 already declared with A01's exact bytes. tools/targets.mjs holds the list.

import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeMaster } from '../spec-engine.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));

export const ID = 'A02';
export const LABEL = 'A02 — the code category, bosque to falcon, the second 84 concepts of the long tail';
export const TRANCHES = ['A02.t1.mjs', 'A02.t2.mjs', 'A02.t3.mjs'];

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
const fixRound = { rebuilt: [], rehunted_and_unchanged: [], notes: {}, was: {} };
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
	Object.assign(fixRound.was, fr.was || {});
}

export const SPECS = S;
export const FILES = order;
export const FOLDERS = [];                 // A02 is a file slice
export const SUBJECTS = order;
export const master = makeMaster(S);
export const spec = (id) => S[id];
export const PROOF16 = proof16;
export const FAMILIES = families;
export const NEUTRAL_COLLAPSE = neutral;
export const ORIGINAL = original;
/**
 * The gate's flags first, then a fix round's, if one ever runs. Numbering happens
 * once, in build-slice.mjs, off THIS array — so the numbers the A02 gate is decided
 * on are fixed by that gate and a later round's flags continue after them, never
 * renumbering what a verdict already referred to.
 */
export const FLAGS = [...flags, ...fixFlags];
export const STUDIES = studies;
export const VOCABULARY = vocabulary;
export const LOOKALIKE = lookalike;

/**
 * THE FIX-ROUND PREAMBLE (2026-09-03), recorded at slice level because the ruling
 * is one ruling — even though it reached only one tranche. The per-subject records
 * come from each tranche's own FIX_ROUND export and are merged above; this is the
 * edit the comment that used to sit here described, and the only one this file
 * needed.
 */
const PREAMBLE = {
	ruling: '2026-09-03',
	verdict: 'Sebastian at the A02 gate, on the seven asks the slice presented: "Approved." Six '
		+ 'went through as built — c-al and dal on Microsoft\'s AL mark, buckbuild\'s antler '
		+ 'monogram over Buck 2\'s deer, cuda wearing NVIDIA\'s eye, the duckdb look-alike pairs, '
		+ 'and the smaller calls on dune, ejs, eex/erb and elm. The LaTeX kingfisher was queried, '
		+ 'explained and then confirmed AS BUILT. One was OVERTURNED, with a directive rather '
		+ 'than a preference: cf / cfc / cfm, flag 1 — "In those cases you can use a background '
		+ 'in a frame with their corners rounded (like in previous iterations)" — and, asked '
		+ 'which frame, "Adobe\'s own framed icon — fetch Adobe\'s actual ColdFusion product '
		+ 'icon: bright rounded frame + dark field + Cf letters, colors verbatim."',
	binding: 'THE FRAMED-CONSTRUCTION LAW. A mark whose own FIELD cannot clear the backdrop may '
		+ 'ship the brand\'s own FRAMED construction: the frame carries the silhouette against '
		+ '#121314, and the dark field inside it is then MARK-INTERIOR INK, which is never lifted '
		+ '— the same reading the §5 lift/plate erratum already makes for dotenv\'s black on its '
		+ 'own yellow field. So a dark plate is no longer "lift it or drop it"; the question is '
		+ 'whether the brand draws a frame. The frame must BE the brand\'s, derived from the '
		+ 'brand\'s own artwork like any other geometry (L2 is untouched), and it still has to '
		+ 'clear L5 at 16 px. Guide-erratum grade: the session folds it into §5.',
	unchanged: 'Everything else A02 was gated on. The D22 licence amendment and the company-mark '
		+ 'rider carried from A01 are unchanged and were not re-argued; L2\'s ban on tracing a '
		+ 'raster or drawing freehand still binds, which is why the ColdFusion letters ship at '
		+ 'Adobe\'s own weight instead of being thickened; L5\'s physics, true colour, the ban on '
		+ 'typeset letters, the twin audit, the family / collapse / look-alike lanes and the '
		+ 'neutral vocabulary all stand. Provenance duty is untouched: both Adobe cuts and the '
		+ 'two sibling icons the frame geometry was measured on are fetched, kept in sources-svg/ '
		+ 'and recorded verbatim.',
	scale: '3 of 84 rebuilt — the ColdFusion trio, cf / cfc / cfm, which is one payload under '
		+ 'three ids. The kingfisher trio (latex, ltx, sty) was queried and CONFIRMED AS BUILT, '
		+ 'not rebuilt. The other 81 subjects are byte-identical to the gated build.',
	studies: ['coldfusion-frame-study'],
	flags: 'the gate\'s flags keep the numbers 1-51 it was decided on; flag 1 is marked '
		+ 'SUPERSEDED in place with a pointer, because deleting it would delete the measurement '
		+ 'that produced the ruling. The round\'s own flags are 52 and 53.'
};
export const FIX_ROUND = PREAMBLE ? {
	...PREAMBLE,
	rebuilt: fixRound.rebuilt,
	rehunted_and_unchanged: fixRound.rehunted_and_unchanged,
	notes: fixRound.notes,
	was: fixRound.was
} : null;
export const MODULES = { expected: TRANCHES, present, missing, complete: missing.length === 0 };

export const REGISTRY = {
	id: ID, kind: 'slice', label: LABEL,
	specs: S, FILES, FOLDERS, SUBJECTS, master, spec,
	PROOF16, FAMILIES, NEUTRAL_COLLAPSE, ORIGINAL, FLAGS, STUDIES, MODULES,
	VOCABULARY, LOOKALIKE, FIX_ROUND
};
