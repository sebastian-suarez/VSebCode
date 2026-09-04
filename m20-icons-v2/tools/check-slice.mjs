#!/usr/bin/env node
// check-slice.mjs — the L9 gates that are pure geometry, format and bookkeeping,
// for a production slice.
//
//   node tools/check-slice.mjs A01
//
// Adapted from the pilot's check.mjs, in the order a reviewer would ask them:
//   L8      format law — viewBox, banned constructs, byte budget, 2 decimals.
//   DERIVE  R1 says a file icon IS its master, so that is a byte-equality
//           assertion and not prose.
//   ROSTER  every built subject is in the slice's worklist entry, and every roster
//           id that is not built yet is reported. Short is only FATAL once all
//           three tranche modules are present.
//   RULE 1  a declared family variant really is byte-identical to its base — which
//           may live in the pilot, in an APPROVED earlier slice, or in this one.
//   RULE 2  a declared category-glyph collapse really is byte-identical, inside
//           this slice AND against every approved slice that declared the same
//           glyph: one payload per glyph for the whole production line.
//   L2      provenance completeness — source, licence, simplifications, and the
//           fetched artwork file actually on disk for anything that reads one.
//   L3      letter audit: R1 has no typeset letters at all.
//   FROZEN  the pilot's 24 icons and every APPROVED slice's icons are still
//           byte-identical to git HEAD (tools/targets.mjs holds the approved list).
//           This slice shares their engine, so a refactor that moved one of their
//           bytes has to fail HERE, loudly, and not months later.
//   16 PX   every subject carries an eyeballed verdict, and none of them says
//           "unrated".

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { resolveTarget, priorSlices, setDir, ROOT } from './targets.mjs';
import { roster } from './roster.mjs';

const target = await resolveTarget();
if (target.kind !== 'slice') { throw new Error('check-slice.mjs needs a slice id, e.g. A01'); }
const R = target.registry;
const OUT = target.dir;
// the approved slices this one stands on: frozen below, legal family bases in rule
// 1, and the sets rule 2's category glyphs have to agree with byte for byte
const PRIORS = priorSlices(R.id);
const DIRS = ['masters', 'icons'];
const BANNED = [/gradient/i, /<filter/i, /<mask/i, /clip-path/i, /<image/i, /<use/i,
	/<style/i, /<script/i, /\sopacity\s*=/i, /url\(/i, /xlink/i, /<text/i, /stroke\s*=/i];

let fail = 0, warn = 0;
const bad = (f, m) => { console.log(`  FAIL ${f}: ${m}`); fail++; };
const soft = (f, m) => { console.log(`  warn ${f}: ${m}`); warn++; };

// --- L8 format -----------------------------------------------------------------
console.log(`L8 · format — slice ${R.id}\n`);
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
	// a slice whose tranche modules have not landed yet has nothing to average
	console.log(`  ${d.padEnd(8)} ${String(files).padStart(2)} files, `
		+ `mean ${files ? Math.round(sum / files) : 0} B, max ${max} B`);
	for (const [id, b] of over2k) { soft(`${d}/${id}`, `${b} B over the 2 KB target (advisory, L8 erratum)`); }
}

// --- DERIVATION identity ---------------------------------------------------------
console.log('\nR1 derivation identity · icon == master\n');
const failBefore = fail;
for (const id of R.FILES) {
	const a = readFileSync(join(OUT, 'masters', `${id}.svg`), 'utf8');
	const b = readFileSync(join(OUT, 'icons', `${id}.svg`), 'utf8');
	if (a !== b) { bad(`derive/${id}`, 'the shipped icon is not byte-identical to its master'); }
}
if (fail === failBefore) { console.log(`  ${R.FILES.length} file icons are their masters, byte for byte`); }

// --- ROSTER ------------------------------------------------------------------------
console.log('\nroster · the slice\'s entry in the m11 production worklist\n');
const rost = roster(R.id);
const strays = R.SUBJECTS.filter(id => !rost.byId[id]);
const pending = rost.ids.filter(id => !R.SUBJECTS.includes(id));
for (const id of strays) { bad(`roster/${id}`, `built but not in the ${R.id} roster`); }
console.log(`  ${R.SUBJECTS.length}/${rost.count} built, ${pending.length} pending, `
	+ `${strays.length} not in the roster`);
console.log(`  modules: ${R.MODULES.present.join(', ') || 'none'}`
	+ (R.MODULES.missing.length ? `  MISSING ${R.MODULES.missing.join(', ')}` : ''));
if (pending.length) {
	if (R.MODULES.complete) { bad('roster', `${pending.length} roster concepts still unbuilt with every tranche present`); }
	else {
		console.log(`  ${pending.length} pending is EXPECTED: `
			+ `${R.MODULES.missing.length} tranche module(s) have not landed yet`);
	}
}

// --- WORKING RULE 1: declared families really are identical ---------------------------
console.log('\nworking rule 1 · declared family variants\n');
/**
 * Where a family's base master lives. `base_set` may name the pilot, THIS slice, or
 * any APPROVED earlier slice — A02's dal is kin of A01's al, and csproj of A01's
 * asp/aspx, so a family base legitimately crosses the slice boundary. What it may
 * NOT name is a slice that has not been ruled on yet: those bytes are still moving,
 * and a family declared against them would be declared against nothing.
 */
const baseSetOf = (f) => f.base_set || R.id;
const baseMasterFile = (f) => {
	const set = baseSetOf(f);
	if (set === R.id) { return join(OUT, 'masters', `${f.base}.svg`); }
	if (set === 'pilot' || PRIORS.includes(set)) { return join(setDir(set), 'masters', `${f.base}.svg`); }
	return null;
};
let fams = 0;
for (const [name, f] of Object.entries(R.FAMILIES || {})) {
	const set = baseSetOf(f);
	const baseFile = baseMasterFile(f);
	if (!baseFile) {
		bad(`family/${name}`, `base_set ${set} is neither the pilot, ${R.id} itself, nor an `
			+ `approved prior slice (${PRIORS.join(', ') || 'none'})`);
		continue;
	}
	if (!existsSync(baseFile)) { bad(`family/${name}`, `base master ${f.base} not found at ${baseFile}`); continue; }
	const base = readFileSync(baseFile, 'utf8');
	for (const id of f.members) {
		const got = readFileSync(join(OUT, 'masters', `${id}.svg`), 'utf8');
		if (f.mode === 'identical' && got !== base) {
			bad(`family/${id}`, `declared identical to ${f.base} but the payloads differ`);
		} else {
			fams++;
			console.log(`  ${id.padEnd(14)} family ${name} — byte-identical to `
				+ `${set === R.id ? '' : set + '/'}masters/${f.base}.svg, as declared`);
		}
	}
}
if (!fams && !Object.keys(R.FAMILIES || {}).length) { console.log('  none declared'); }

// --- WORKING RULE 2: declared collapses really are identical ---------------------------
console.log('\nworking rule 2 · neutral vocabulary collapses\n');
const cats = (R.NEUTRAL_COLLAPSE || {}).category_glyphs || {};
for (const [glyph, ids] of Object.entries(cats)) {
	const payloads = ids.map(id => readFileSync(join(OUT, 'icons', `${id}.svg`), 'utf8'));
	const same = payloads.every(p => p === payloads[0]);
	if (!same) { bad(`collapse/${glyph}`, `${ids.join(', ')} share a category glyph but differ`); }
	else { console.log(`  ${glyph.padEnd(16)} ${ids.join(', ')} — byte-identical, as declared`); }
}
// CROSS-SLICE IDENTITY. A category glyph belongs to the production line, not to a
// slice: generic-code is ONE payload, and the twin audit pools A01's collapsed ids
// with this slice's in a single lane. So where an approved slice declared the same
// glyph NAME, one member from each side has to be the same bytes — otherwise the
// brackets drift a hairline per slice and the lane quietly exempts two marks that
// are no longer the same mark. One member each is enough: the loop above has
// already proved every member inside a slice identical to its siblings.
// Object glyphs are NOT checked here. The single-subject ones (disc, lib, abc) are
// keyed by a roster id that belongs to exactly one slice, so there is nothing on
// the other side to compare with; the shared ones (terminal, stopwatch) are also
// declared as category glyphs, where the comparison above catches them.
for (const priorId of PRIORS) {
	const prior = await resolveTarget(priorId);
	const theirCats = (prior.registry.NEUTRAL_COLLAPSE || {}).category_glyphs || {};
	for (const [glyph, ids] of Object.entries(cats)) {
		const theirs = theirCats[glyph];
		if (!ids.length || !theirs || !theirs.length) { continue; }
		const mine = readFileSync(join(OUT, 'icons', `${ids[0]}.svg`), 'utf8');
		const other = readFileSync(join(prior.dir, 'icons', `${theirs[0]}.svg`), 'utf8');
		if (mine !== other) {
			bad(`collapse/${glyph}`, `${ids[0]} and ${priorId}'s ${theirs[0]} share the `
				+ `${glyph} glyph across slices but the payloads differ`);
		} else {
			console.log(`  ${glyph.padEnd(16)} ${ids[0]} == ${priorId}/${theirs[0]} — the same `
				+ `payload as approved slice ${priorId}, as required`);
		}
	}
}
const objs = Object.keys((R.NEUTRAL_COLLAPSE || {}).object_glyphs || {});
console.log(`  ${objs.length} object glyph(s): ${objs.join(', ') || 'none'}`);
const neutrals = R.SUBJECTS.filter(id => R.spec(id).neutral);
const accounted = new Set([...objs, ...Object.values(cats).flat()]);
for (const id of neutrals) {
	if (!accounted.has(id)) { bad(`collapse/${id}`, 'neutral subject not recorded in neutral_collapse'); }
}

// --- L2 provenance --------------------------------------------------------------------
console.log('\nL2 · provenance duty\n');
const manifest = JSON.parse(readFileSync(join(OUT, 'manifest.json'), 'utf8'));
const SRCSVG = join(ROOT, 'sources-svg');
let fetched = 0;
for (const id of R.SUBJECTS) {
	const e = manifest.subjects[id];
	if (!e) { bad('manifest.json', `no entry for ${id}`); continue; }
	if (!e.source || !e.source.name) { bad('manifest.json', `${id} has no source name`); }
	if (!Array.isArray(e.simplifications)) { bad('manifest.json', `${id} has no simplifications array`); }
	const s = R.spec(id);
	if (!s.neutral && !(e.source.url && e.source.slug && e.source.license)) {
		bad('manifest.json', `${id} is missing slug / url / licence`);
	}
	if (e.source.artwork) {
		if (!existsSync(join(SRCSVG, e.source.artwork))) {
			bad('sources-svg', `${id} declares ${e.source.artwork}, which is not on disk`);
		} else { fetched++; }
	}
}
const branded = R.SUBJECTS.filter(x => !R.spec(x).neutral);
const simplified = branded.filter(x => manifest.subjects[x].simplifications.length);
console.log(`  ${branded.length} branded subjects, every one with source name + slug + url + licence`);
console.log(`  ${R.SUBJECTS.length - branded.length} mark-less subjects on the neutral vocabulary`);
console.log(`  ${simplified.length} subjects carry logged simplifications`);
console.log(`  ${fetched} subjects read fetched artwork, every file present in sources-svg/`);

// --- L3 letter audit ---------------------------------------------------------------------
console.log('\nL3 · letter audit\n');
let typeset = 0;
for (const d of DIRS) {
	for (const f of readdirSync(join(OUT, d)).filter(x => x.endsWith('.svg'))) {
		const src = readFileSync(join(OUT, d, f), 'utf8');
		if (/<text|font-family|letterpath/i.test(src)) { bad(`${d}/${f}`, 'typeset letters'); typeset++; }
	}
}
console.log(`  ${typeset} typeset letters in ${R.SUBJECTS.length} subjects — the L3 table stays dormant`);

// --- FROZEN ---------------------------------------------------------------------------------
// The slice fits its subjects through the pilot's engine, and every approved slice was
// fitted through the same one. If a change to it moved a byte in an APPROVED set — the
// pilot or any slice already ruled and committed — this is where it has to surface. An
// approved slice joins this side the day its verdict lands (tools/targets.mjs, APPROVED).
const FROZEN = ['pilot', ...PRIORS];
/** A set's outputs as git names them, from the repo root. */
const gitPath = (set) => (set === 'pilot' ? 'm20-icons-v2/pilot' : `m20-icons-v2/slices/${set}`);
const FROZEN_PATHS = FROZEN.flatMap(s => [`${gitPath(s)}/icons`, `${gitPath(s)}/masters`,
	`${gitPath(s)}/sheet.html`]);
console.log(`\nFROZEN · the approved sets (${FROZEN.join(' + ')}) vs git HEAD\n`);
try {
	const repo = join(ROOT, '..');
	const dirty = execFileSync('git', ['-C', repo, 'diff', '--name-only', 'HEAD', '--', ...FROZEN_PATHS],
		{ encoding: 'utf8' }).trim();
	const untracked = execFileSync('git', ['-C', repo, 'ls-files', '--others', '--exclude-standard', '--', ...FROZEN_PATHS],
		{ encoding: 'utf8' }).trim();
	const changed = [dirty, untracked].filter(Boolean).join('\n').split('\n').filter(Boolean);
	const counts = FROZEN.map(s =>
		`${s} (${readdirSync(join(setDir(s), 'icons')).filter(f => f.endsWith('.svg')).length} icons)`);
	if (changed.length) {
		for (const f of changed) { bad('frozen', `${f} differs from git HEAD`); }
	} else {
		// one line, and it says which sets it covered: gates.mjs reads this sentence for
		// the manifest record, so a set that was never asked about must not look asserted
		console.log(`  ${counts.join(', ')} — icons, masters and sheet.html unchanged against HEAD`);
	}
} catch (e) {
	soft('frozen', `could not ask git (${e.message.split('\n')[0]})`);
}

// --- 16 px verdicts -----------------------------------------------------------------------
console.log('\nL9 gate 2 · every subject carries an eyeballed 16 px verdict\n');
const tally = {};
for (const id of R.SUBJECTS) {
	const v = manifest.subjects[id].proof_16px;
	tally[v.result] = (tally[v.result] || 0) + 1;
	if (v.result === 'unrated') { bad(`proof/${id}`, 'no 16 px verdict recorded'); }
	if (!v.note || v.note === 'pending') { bad(`proof/${id}`, 'verdict note is still a placeholder'); }
}
console.log(`  ${JSON.stringify(tally)}`);

// --- the sheet ----------------------------------------------------------------------------
console.log('\nsheet\n');
const sheetPath = join(OUT, 'sheet.html');
if (!existsSync(sheetPath)) { soft('sheet.html', 'not built yet'); }
else {
	const sheet = readFileSync(sheetPath, 'utf8');
	for (const re of [/url\(/, /@import/, /<img/i, /srcset/i, /<script/i, /<link/i, /<iframe/i]) {
		if (re.test(sheet)) { bad('sheet.html', `external reference ${re}`); }
	}
	// The pilot banned every literal "https://" in its sheet. A slice sheet has to
	// PRINT its source URLs — that is L2's provenance duty on the page — so the ban
	// tightens instead of loosening: no ATTRIBUTE may carry a URL, which is what an
	// external reference actually is. A URL sitting in text fetches nothing.
	let refs = 0;
	for (const m of sheet.matchAll(/\s(?:[a-zA-Z-]+:)?[a-zA-Z-]+\s*=\s*"([^"]*)"/g)) {
		if (/https?:|\/\/|url\(|data:/.test(m[1])) { bad('sheet.html', `attribute reference ${m[0].trim().slice(0, 60)}`); refs++; }
	}
	if (!/background:\s*#121314/i.test(sheet)) { bad('sheet.html', 'body background not explicit'); }
	const urls = (sheet.match(/https?:/g) || []).length;
	console.log(`  ${(Buffer.byteLength(sheet) / 1024).toFixed(1)} KB, `
		+ `${(sheet.match(/<svg/g) || []).length} inlined svgs, self-contained`);
	console.log(`  ${urls} source URLs printed as text, ${refs} in attributes (must be 0)`);
}

console.log(fail ? `\n${fail} FAILURES, ${warn} warnings` : `\nall gates pass (${warn} advisory warnings)`);
process.exit(fail ? 1 : 0);
