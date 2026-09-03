#!/usr/bin/env node
// build-slice.mjs — a production slice: one master per concept, the shipped SVGs
// derived from it.
//
//   node tools/build-slice.mjs A01
//
// Same recipe as the pilot's build.mjs and deliberately the same code shape: R1
// is the ruled style, so a file icon IS its master, written twice byte for byte,
// and check-slice.mjs asserts it. Where the pilot hard-codes its roster this
// reads the slice registry, and where the pilot's manifest records the set
// constants this one records what the slice ADDED to them — the families, the
// neutral collapses and the numbered flags.

import { mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { resolveTarget, ROOT } from './targets.mjs';
import { ENV, simpleIconsMeta, svgDoc, layersToBody } from './spec-engine.mjs';
import { contrast, NEUTRAL, BACKDROP } from './color.mjs';
import { roster } from './roster.mjs';

const target = await resolveTarget();
if (target.kind !== 'slice') { throw new Error('build-slice.mjs needs a slice id, e.g. A01'); }
const R = target.registry;
const OUT = target.dir;
for (const d of ['masters', 'icons', 'proofs']) { mkdirSync(join(OUT, d), { recursive: true }); }

const rost = roster(R.id);
const built = R.SUBJECTS.filter(id => rost.byId[id]);
const strays = R.SUBJECTS.filter(id => !rost.byId[id]);
const pending = rost.ids.filter(id => !R.SUBJECTS.includes(id));

const report = [];
const subjects = {};

for (const id of R.SUBJECTS) {
	const s = R.spec(id);
	const m = R.master(id);
	const body = layersToBody(m.layers);
	writeFileSync(join(OUT, 'masters', `${id}.svg`), svgDoc(body));
	writeFileSync(join(OUT, 'icons', `${id}.svg`), svgDoc(body));   // R1: the icon IS the master

	const colours = [...new Set(m.layers.map(l => l.fill))];
	const verdict = R.PROOF16[id] || ['unrated', 'no 16 px verdict recorded'];
	const concept = rost.byId[id];
	subjects[id] = {
		title: s.title,
		kind: 'file',
		category: concept ? concept.category : null,
		roster_fallback: concept ? concept.fallback : null,
		matches: concept ? concept.match : null,
		neutral: !!s.neutral,
		family: s.family || null,
		source: s.source,
		colours,
		contrast_on_backdrop: Object.fromEntries(colours.map(c => [c, +contrast(c, BACKDROP).toFixed(2)])),
		envelope: { w: s.env.w, h: s.env.h },
		ink: { w: +m.ink.w.toFixed(2), h: +m.ink.h.toFixed(2), mass: +(m.ink.w * m.ink.h).toFixed(0) },
		layers: m.layers.length,
		simplifications: s.simplifications,
		proof_16px: { result: verdict[0], note: verdict[1] },
		bytes: Buffer.byteLength(svgDoc(body))
	};
	report.push({ id, w: m.ink.w, h: m.ink.h, layers: m.layers.length,
		bytes: Buffer.byteLength(svgDoc(body)), verdict: verdict[0] });
}

// A tranche module can be removed or an id renamed between runs, and a stale SVG
// left behind would quietly join the format gate's file count, the sheet and the
// tree. The output dirs therefore hold exactly the current roster and nothing else.
const wanted = new Set(R.SUBJECTS.map(id => `${id}.svg`));
const pruned = [];
for (const d of ['masters', 'icons']) {
	for (const f of readdirSync(join(OUT, d)).filter(x => x.endsWith('.svg'))) {
		if (!wanted.has(f)) { rmSync(join(OUT, d, f)); pruned.push(`${d}/${f}`); }
	}
}

// ---- the console table --------------------------------------------------------
console.log('subject         ink            layers  bytes   16px');
for (const r of report) {
	console.log(`${r.id.padEnd(15)} ${(r.w.toFixed(2) + 'x' + r.h.toFixed(2)).padEnd(14)} `
		+ `${String(r.layers).padStart(4)}   ${String(r.bytes).padStart(5)}   ${r.verdict}`);
}

// ---- flags: numbered once, here, so the sheet and the manifest cannot drift -----
const plain = (t) => t.replace(/&nbsp;/g, ' ').replace(/&mdash;/g, '—').replace(/&ndash;/g, '–')
	.replace(/&harr;/g, '↔').replace(/&rarr;/g, '→').replace(/&times;/g, '×')
	.replace(/&ldquo;|&rdquo;/g, '"').replace(/&hellip;/g, '…').replace(/&amp;/g, '&')
	.replace(/&lt;/g, '<').replace(/&gt;/g, '>')
	.replace(/<\/?(?:code|b|em|i)>/g, '').replace(/\s+/g, ' ').trim();
// The FIX ROUND never renumbers: a flag the gate was decided on keeps its number, an
// overturned one carries `superseded` in place with a pointer, and the round's own
// flags are appended (the registry orders them, this only records them).
const flags = R.FLAGS.map((f, i) => ({
	n: i + 1, title: plain(f.title), rule: f.rule, subjects: f.subjects,
	...(f.superseded ? { superseded: plain(f.superseded) } : {}),
	...(f.fix_round ? { fix_round: true } : {}),
	text: plain(f.text),
	tranche: f.tranche
}));

// ---- manifest ------------------------------------------------------------------
const si = simpleIconsMeta();
const pilotManifest = join(ROOT, 'pilot', 'manifest.json');
writeFileSync(join(OUT, 'manifest.json'), JSON.stringify({
	note: `M20 icons v2 — production slice ${R.id}. Style is D22/R1 "True colour": the icon IS `
		+ 'the official mark, fitted, official colours verbatim. Per L2 every mark\'s geometry '
		+ 'derives from official vector artwork; this file records where each one came from, '
		+ 'exactly what L5 forced us to simplify, and every judgement call made along the way. '
		+ 'The set constants were ruled with the pilot and are referenced, not re-decided.',
	generated: new Date().toISOString().slice(0, 10),
	slice: {
		id: R.id, label: R.label,
		modules: R.MODULES,
		modules_note: 'the slice is built by three tranches in parallel; a missing module means '
			+ 'that share of the roster is not built yet, which is reported and is only fatal '
			+ 'once all three are present'
	},
	roster: {
		source: rost.source, worklist_generated: rost.generated,
		count: { roster: rost.count, built: built.length, pending: pending.length },
		built, pending,
		not_in_roster: strays
	},
	tooling: {
		'simple-icons': `${si.version} (${si.license})`,
		'fetched artwork': 'm20-icons-v2/sources-svg/ — brand-published SVGs, downloaded once '
			+ 'and kept for the standing fidelity gate',
		registry: `tools/slices/${R.id}.mjs, merging ${R.MODULES.expected.join(' + ')}`,
		engine: 'tools/spec-engine.mjs — the pilot\'s fit machinery, shared verbatim'
	},
	set_constants: {
		ruled_with: 'the pilot — see pilot/manifest.json set_constants, which this slice does '
			+ 'not re-decide',
		reference: existsSync(pilotManifest) ? 'm20-icons-v2/pilot/manifest.json' : null,
		envelopes: ENV,
		neutral_ink: NEUTRAL,
		backdrop: BACKDROP,
		typeset_letters: 'NONE. R1 has no typeset letters; the L3 table stays dormant. Any '
			+ 'letterform in this slice is faithful source geometry from a brand\'s own artwork.'
	},
	families: {
		rule: 'WORKING RULE 1 (opened with this slice). A concept that is a variant of a branded '
			+ 'family adapts the source themes\' established NON-LETTER variant glyph in the '
			+ 'family\'s official colours where one exists (branch a); where the variant differs '
			+ 'only by letters or has no distinct variant glyph, it ships the family base mark '
			+ 'IDENTICALLY under its own id (branch b). Byte-identity inside a declared family '
			+ 'is expected: the twin audit reports those pairs in a family lane instead of '
			+ 'failing them, and never exempts them silently.',
		declared: R.FAMILIES
	},
	neutral_collapse: {
		rule: 'WORKING RULE 2 (opened with this slice). After a genuine hunt proves no usable '
			+ 'mark, a concept takes a neutral vocabulary glyph in the shared gray: the object '
			+ 'it names where there is one, otherwise its CATEGORY glyph. Category glyphs are '
			+ 'shared byte for byte across every concept that falls back to them; every '
			+ 'collapsed subject is listed here and reported in the twin audit\'s neutral lane.',
		ink: NEUTRAL,
		vocabulary: {
			carried_from_pilot: ['brace (json)', 'chevron (folder-src)', 'hexagon (folder-node)',
				'check (folder-test)'],
			// read off the registry (each tranche's VOCABULARY export) rather than typed
			// here — the same staleness the sheet's flag 22 caught, fixed before it bit
			added_by_this_slice: R.VOCABULARY || {}
		},
		...R.NEUTRAL_COLLAPSE
	},
	...(R.FIX_ROUND ? { fix_round: {
		...R.FIX_ROUND,
		rebuilt_count: R.FIX_ROUND.rebuilt.length,
		flag_numbers: flags.filter(f => f.fix_round).map(f => f.n),
		superseded: flags.filter(f => f.superseded).map(f => ({ n: f.n, title: f.title,
			superseded: f.superseded }))
	} } : {}),
	...(R.LOOKALIKE && R.LOOKALIKE.length ? { lookalike: {
		rule: 'DECLARED LOOK-ALIKE PAIRS, opened by the fix round. Two brands whose REAL marks '
			+ 'genuinely resemble each other may both keep them: the pair is declared here, '
			+ 'reported by the twin audit with its live R7/R8 scores on every run, and never '
			+ 'failed. An UNDECLARED pair scoring the same still fails, and the lane prints '
			+ 'exactly what it is exempting — it is a lane, not a mute button.',
		declared: R.LOOKALIKE
	} } : {}),
	flags,
	subjects
}, null, '\t') + '\n');

console.log(`\nwrote ${R.SUBJECTS.length} masters + ${R.SUBJECTS.length} icons, `
	+ `${flags.length} flags, and manifest.json`);
if (pruned.length) { console.log(`pruned ${pruned.length} stale file(s): ${pruned.join(', ')}`); }
console.log(`roster ${R.id}: ${built.length} built, ${pending.length} pending, `
	+ `${strays.length} not in roster; modules present ${R.MODULES.present.join(', ') || 'none'}`
	+ (R.MODULES.missing.length ? `, missing ${R.MODULES.missing.join(', ')}` : ''));
void readFileSync;
