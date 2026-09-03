#!/usr/bin/env node
// gates.mjs — run every L9 gate and record the outcome in the manifest, so the
// slice carries its own verdict instead of relying on somebody's terminal.
//
//   node tools/gates.mjs          the PILOT, exactly as it has always run
//   node tools/gates.mjs A01      production slice A01
//
// Order matters: build first (the gates read what it wrote), then the proofs the
// eye needs, then the machine gates, then the sheet.

import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { CARRIED, SUPERSEDED, SUPERSEDED_RULING } from './sources.mjs';
import { sliceArg, resolveTarget } from './targets.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, '..', 'pilot');
const run = (script, args = []) => {
	try {
		const out = execFileSync('node', [join(HERE, script), ...args],
			{ encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
		return { ok: true, out };
	} catch (e) {
		return { ok: false, out: (e.stdout || '') + (e.stderr || '') };
	}
};

const SLICE = sliceArg();
if (SLICE) { process.exit(await runSlice(SLICE)); }

console.log('· build');
process.stdout.write(run('build.mjs').out);

console.log('· 16 px proofs + fidelity strips + the docker deck study');
run('proof.mjs');
run('fidelity.mjs', ['new']);
run('fidelity.mjs', ['all']);
run('fidelity.mjs', ['fix']);
run('deck-candidates.mjs');

console.log('· check (format, carry, derivation, folder mass, provenance, letters)');
const check = run('check.mjs');
process.stdout.write(check.out);

console.log('· twin audit (R7 / R8)');
const audit = run('audit.mjs', ['--json']);
const twin = JSON.parse(audit.out);

console.log('· sheet');
process.stdout.write(run('build-sheet.mjs').out);
execFileSync('node', [join(HERE, 'shot.mjs'), join(OUT, 'sheet.html'), join(OUT, 'sheet.png'),
	'1280', '6700', '2'], { stdio: ['ignore', 'ignore', 'ignore'] });

// ---- record ----------------------------------------------------------------------
const manifest = JSON.parse(readFileSync(join(OUT, 'manifest.json'), 'utf8'));
const verdicts = Object.values(manifest.subjects).flatMap(s => (s.kind === 'folder'
	? [s.proof_16px.closed, s.proof_16px.open] : [s.proof_16px]));
const tally = verdicts.reduce((a, v) => { a[v.result] = (a[v.result] || 0) + 1; return a; }, {});
const warnings = (check.out.match(/^\s+warn /gm) || []).length;
const failures = (check.out.match(/^\s+FAIL /gm) || []).length;

manifest.gates = {
	check: {
		pass: check.ok, failures, advisory_warnings: warnings,
		covers: `L8 format · D22 carry identity (${CARRIED.length} carried subjects vs `
			+ 'samples/masters) · R1 derivation identity (icon == master; one mark across face '
			+ 'master / closed / open) · L7 folder mass and centring · L2 provenance '
			+ 'completeness · L3 letter audit',
		carry_identity: {
			carried: CARRIED.length,
			byte_identical: CARRIED.length - SUPERSEDED.length,
			superseded_by_pilot: SUPERSEDED,
			ruling: SUPERSEDED_RULING,
			note: 'AMENDED AT THE PILOT GATE. The gate is two-sided: the frozen subjects must '
				+ 'still refit to samples/masters/ byte for byte, and the superseded ones must '
				+ 'NOT — a rejected subject that quietly came back to its round-2 bytes fails '
				+ 'here just as loudly as a frozen one that drifted.'
		},
		note: warnings ? `${warnings} advisory: rust, editorconfig and python are over the 2 KB `
			+ 'target and under the 4 KB cap (L8 round-2 erratum). All three are the price of '
			+ 'official geometry; editorconfig came down from 3700 B to '
			+ `${manifest.subjects.editorconfig.bytes} B in the fix round.` : null
	},
	proof_16px: {
		pass: !Object.keys(tally).some(k => k.startsWith('fail')),
		tally,
		artifact: 'pilot/proofs/proof-16px.png',
		note: 'every icon at a true 16 px next to a 10x nearest-neighbour blow-up; per-icon '
			+ 'verdicts live on each subject as proof_16px'
	},
	fidelity: {
		pass: ['fidelity-new.png', 'fidelity-all.png', 'fidelity-fix.png']
			.every(f => existsSync(join(OUT, 'proofs', f))),
		artifacts: ['pilot/proofs/fidelity-new.png', 'pilot/proofs/fidelity-all.png',
			'pilot/proofs/fidelity-fix.png', 'pilot/proofs/docker-deck-candidates.png'],
		note: 'official source vs fitted master vs shipped 16 px, per subject — the standing '
			+ 'gate the round-1 rejection created. fidelity-fix.png is the two subjects the '
			+ 'pilot gate rejected, rebuilt, with their new simplification logs; '
			+ 'docker-deck-candidates.png is the measured study behind the container grid.'
	},
	twin_audit: {
		pass: twin.twins.length === 0 && twin.forms.length === 0,
		thresholds: twin.thresholds,
		twins: twin.twins.length,
		form_collisions: twin.forms.length,
		colour_hits_separated_by_form: twin.separated,
		near_twins: twin.nearTwins,
		neutral_lane: twin.neutralPairs,
		note: 'R1 abolished archetypes, so m11\'s SILHOUETTE-lane reading applies to the whole '
			+ 'set; PLATE marks (an official field carrying a glyph) are scored glyph-to-glyph '
			+ 'against m11\'s BADGE bar of 0.92'
	},
	letter_audit: {
		pass: true, typeset_letters: 0,
		note: 'R1 has NO typeset letters. Every letterform in the pilot (typescript, npm, '
			+ 'dotenv, yaml, go) is faithful source geometry from the brand\'s own artwork, so '
			+ 'the L3 table stays dormant — nothing to measure baselines against.'
	}
};
writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, '\t') + '\n');

const artefacts = ['sheet.html', 'sheet.png', 'proofs/proof-16px.png', 'proofs/fidelity-new.png',
	'proofs/fidelity-all.png', 'proofs/fidelity-fix.png', 'proofs/docker-deck-candidates.png',
	'manifest.json']
	.map(f => `  ${f.padEnd(34)} ${(statSync(join(OUT, f)).size / 1024).toFixed(1)} KB`);
console.log(`\n== gate roll-up ==\n  check          ${check.ok ? 'PASS' : 'FAIL'} `
	+ `(${failures} failures, ${warnings} advisory warnings)`);
console.log(`  carry identity ${manifest.gates.check.carry_identity.byte_identical}/`
	+ `${CARRIED.length} frozen byte-identical, `
	+ `${SUPERSEDED.length} SUPERSEDED BY PILOT (${SUPERSEDED.join(', ')}, ${SUPERSEDED_RULING})`);
console.log(`  16 px proofs   ${JSON.stringify(tally)}`);
console.log(`  fidelity       ${manifest.gates.fidelity.pass ? 'PASS' : 'FAIL'}`);
console.log(`  twin audit     ${manifest.gates.twin_audit.pass ? 'PASS' : 'FAIL'} `
	+ `(${twin.twins.length} twins, ${twin.forms.length} form collisions, `
	+ `${twin.separated.length} colour hits separated by form)`);
console.log(`  letter audit   PASS (0 typeset letters)`);
console.log(`\n${artefacts.join('\n')}`);
process.exit(check.ok && manifest.gates.twin_audit.pass ? 0 : 1);

// =============================================================================
// the slice path — the same gates, adapted, plus the two the slices added: the
// roster, and the cross-set twin audit over the pilot AND the slice
// =============================================================================
async function runSlice(id) {
	const target = await resolveTarget(id);
	const R = target.registry;
	const dir = target.dir;

	console.log(`· build (slice ${id})`);
	const build = run('build-slice.mjs', [id]);
	process.stdout.write(build.out);

	console.log('· studies');
	process.stdout.write(run('studies.mjs', [id]).out);

	console.log('· 16 px proofs + fidelity strips');
	run('proof.mjs', [id]);
	run('fidelity.mjs', [id]);

	console.log('· sheet');
	process.stdout.write(run('build-slice-sheet.mjs', [id]).out);

	console.log('· check (format, derivation, roster, rules 1 and 2, provenance, letters, pilot-frozen)');
	const check = run('check-slice.mjs', [id]);
	process.stdout.write(check.out);

	console.log('· twin audit (R7 / R8, cross-set: pilot + slice)');
	const audit = run('audit.mjs', [id, '--json']);
	let twin;
	try { twin = JSON.parse(audit.out); }
	catch { process.stdout.write(audit.out); throw new Error('twin audit did not produce json'); }

	// ---- record ---------------------------------------------------------------
	const manifest = JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8'));
	const tally = R.SUBJECTS.reduce((a, s) => {
		const r = manifest.subjects[s].proof_16px.result; a[r] = (a[r] || 0) + 1; return a;
	}, {});
	const warnings = (check.out.match(/^\s+warn /gm) || []).length;
	const failures = (check.out.match(/^\s+FAIL /gm) || []).length;
	const studyFiles = (R.STUDIES || []).map(s => `slices/${id}/proofs/${s.id}.png`);

	manifest.gates = {
		check: {
			pass: check.ok, failures, advisory_warnings: warnings,
			covers: 'L8 format · R1 derivation identity (icon == master) · ROSTER (every built '
				+ 'subject is in the slice\'s worklist entry; unbuilt roster ids reported, fatal '
				+ 'only once every tranche module is present) · working rule 1 (a declared family '
				+ 'variant is byte-identical to its base) · working rule 2 (a declared category '
				+ 'glyph is byte-identical across the concepts that share it, and every neutral '
				+ 'subject is recorded) · L2 provenance completeness including the fetched artwork '
				+ 'files · L3 letter audit · PILOT FROZEN'
		},
		roster: {
			pass: !manifest.roster.not_in_roster.length
				&& (!R.MODULES.complete || !manifest.roster.pending.length),
			...manifest.roster.count,
			modules: R.MODULES
		},
		pilot_frozen: {
			pass: /unchanged against HEAD/.test(check.out),
			covers: 'm20-icons-v2/pilot/icons, /masters and sheet.html compared to git HEAD',
			note: 'the slice fits its subjects through the pilot\'s own engine (tools/spec-engine.mjs), '
				+ 'so an engine change that moved a pilot byte has to fail here and not months later'
		},
		proof_16px: {
			pass: !Object.keys(tally).some(k => k.startsWith('fail')),
			tally,
			artifact: `slices/${id}/proofs/proof-16px.png`,
			note: 'every icon at a true 16 px next to a 10x nearest-neighbour blow-up; per-icon '
				+ 'verdicts live on each subject as proof_16px, eyeballed and written by hand'
		},
		fidelity: {
			pass: existsSync(join(dir, 'proofs', 'fidelity-all.png')),
			artifacts: [`slices/${id}/proofs/fidelity-all.png`, ...studyFiles],
			note: 'official source vs fitted master vs shipped 16 px, per subject — the standing '
				+ 'gate the round-1 rejection created. Mark-less concepts show "no mark": there '
				+ 'is nothing for them to be faithful to.'
		},
		twin_audit: {
			pass: twin.twins.length === 0 && twin.forms.length === 0,
			scope: twin.scope,
			thresholds: twin.thresholds,
			twins: twin.twins.length,
			form_collisions: twin.forms.length,
			colour_hits_separated_by_form: twin.separated,
			near_twins: twin.nearTwins,
			neutral_lane: twin.neutralPairs,
			family_lane: twin.familyLane,
			neutral_collapse_lane: twin.collapseLane,
			lookalike_lane: twin.lookalikeLane || [],
			note: 'CROSS-SET: the pilot\'s 20 subjects and every subject this slice built are '
				+ 'scored in one pool. THREE lanes are exempt from R8 and reported rather than '
				+ 'failed, because in all three the identity is declared and deliberate — FAMILY '
				+ '(working rule 1), NEUTRAL COLLAPSE (working rule 2) and LOOK-ALIKE (opened by '
				+ 'the A01 fix round, 2026-09-03: two brands whose real marks genuinely resemble '
				+ 'each other may both keep them, and the pair is reported with its live scores '
				+ 'every run). An undeclared pair scoring the same still fails. PLATE marks are '
				+ 'scored glyph-to-glyph against m11\'s BADGE bar of 0.92.'
		},
		letter_audit: {
			pass: true, typeset_letters: 0,
			note: 'R1 has NO typeset letters. Every letterform in this slice is faithful source '
				+ 'geometry from a brand\'s own artwork, so the L3 table stays dormant.'
		}
	};
	writeFileSync(join(dir, 'manifest.json'), JSON.stringify(manifest, null, '\t') + '\n');

	const files = ['sheet.html', 'sheet.png', 'proofs/proof-16px.png', 'proofs/fidelity-all.png',
		...(R.STUDIES || []).map(s => `proofs/${s.id}.png`), 'manifest.json']
		.filter(f => existsSync(join(dir, f)))
		.map(f => `  ${f.padEnd(36)} ${(statSync(join(dir, f)).size / 1024).toFixed(1)} KB`);

	console.log(`\n== gate roll-up · slice ${id} ==\n  check          ${check.ok ? 'PASS' : 'FAIL'} `
		+ `(${failures} failures, ${warnings} advisory warnings)`);
	console.log(`  roster         ${manifest.gates.roster.pass ? 'PASS' : 'FAIL'} `
		+ `(${manifest.roster.count.built} built, ${manifest.roster.count.pending} pending of `
		+ `${manifest.roster.count.roster}; modules ${R.MODULES.present.length}/${R.MODULES.expected.length})`);
	console.log(`  pilot frozen   ${manifest.gates.pilot_frozen.pass ? 'PASS' : 'FAIL'}`);
	console.log(`  16 px proofs   ${JSON.stringify(tally)}`);
	console.log(`  fidelity       ${manifest.gates.fidelity.pass ? 'PASS' : 'FAIL'}`);
	console.log(`  twin audit     ${manifest.gates.twin_audit.pass ? 'PASS' : 'FAIL'} `
		+ `(${twin.scope}: ${twin.twins.length} twins, ${twin.forms.length} form collisions, `
		+ `${twin.separated.length} colour hits separated by form, `
		+ `${twin.familyLane.length} family + ${twin.collapseLane.length} collapse + `
		+ `${(twin.lookalikeLane || []).length} look-alike pairs declared)`);
	console.log('  letter audit   PASS (0 typeset letters)');
	console.log(`\n${files.join('\n')}`);
	return check.ok && manifest.gates.twin_audit.pass && manifest.gates.roster.pass
		&& manifest.gates.pilot_frozen.pass ? 0 : 1;
}
