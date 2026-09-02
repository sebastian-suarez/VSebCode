#!/usr/bin/env node
// audit.mjs — set-wide reconciliation: palette twins (R7) and form collisions (R8).
//
//   node audit.mjs                # full report
//   node audit.mjs --json         # machine-readable
//   node audit.mjs --near         # also list near-misses (for judging borderline pairs)
//   node audit.mjs --pair a b     # explain one pair
//
// Reads ../set-manifest.json for archetype / colour source / batch, and re-measures every
// SVG through tools/raster.mjs, so a retint is reflected without touching the manifest.
//
// R7  two icons are twins iff same archetype AND dhue < 12 AND dL < 12 AND dS < 25.
//     Chroma (HSL S) < 25 is the neutral lane and is exempt. R3 families are exempt.
//     Folders are exempt: R9 makes the tan plate law and the emblem the discriminator.
// R8  the same recognizable shape in the same archetype for unrelated concepts collides
//     even in a different hue. Scored as the smaller of area IoU and dilated-outline IoU
//     over the 64x64 shape mask (BADGE compares the letter mask — every badge plate is
//     identical by law — against a higher bar, since letter blocks always overlap).

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rasterFills } from './raster.mjs';

const DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(DIR, '..');
const argv = process.argv.slice(2);

// R7 thresholds
const D_HUE = 12, D_LIGHT = 12, D_SAT = 25, NEUTRAL_S = 25;
// R8 thresholds, on the combined area+outline form score. Two 2-3 letter badges always
// share the same ink band, so the BADGE bar is set where only a near-identical letter
// group can reach it (the worst honest pair in the set, PS vs Rs, scores 0.84).
const IOU_COLLIDE = 0.72, IOU_COLLIDE_BADGE = 0.92, IOU_NEAR = 0.60;
// R7, SILHOUETTE lane: two silhouettes whose shapes read this far apart are separated by
// form and are a hue neighbourhood, not a twin.
const FORM_SEP = 0.55;

// R3 — sanctioned family rhymes: shared plate/hue with a different mark. Exempt from R7 and R8.
const FAMILIES = [
	['reactjs', 'reactts'], ['typescript', 'typescriptdef'], ['js', 'jsconfig'],
	['json', 'json5'], ['sql', 'sqlite'], ['cheader', 'cppheader'],
	['testjs', 'testts'], ['vite', 'vitest'], ['next', 'vercel']
];

// Residuals ruled acceptable. Key is the sorted pair, value is the reason printed by the report.
const ACCEPTED = new Map(Object.entries({
	'generic-archive|zip': 'R8 accepted: the generic tier is dimmer by design (generic-archive is the fallback for 6 concepts, zip is the named concept)',
	'font|generic-font': 'R8 accepted, same precedent: generic-font is the dim fallback for the 3 non-core font concepts, font is the named concept',
	'css|html': 'R8 accepted + flagged: both real logos are shields and spec.md §3 gives html the canon css geometry on purpose; separated by hue (#1572B6 / #DB5430) and by the 3 / 5 letterform',
	'npm|yaml': 'R10 ruled exception (Sebastian, 2026-09-01): yaml is brand-true #CB171E, brand fidelity over separation. The R7 twin against canon npm #CB3837 is knowingly accepted; separation rests on the YML / npm letter groups and the small value gap'
}));

const familyOf = new Map();
FAMILIES.forEach((f, i) => f.forEach(id => familyOf.set(id, i)));
const sameFamily = (a, b) => familyOf.has(a) && familyOf.get(a) === familyOf.get(b);
const pairKey = (a, b) => [a, b].sort().join('|');

// ---- colour ----------------------------------------------------------------

export function hsl(hex) {
	const r = parseInt(hex.slice(1, 3), 16) / 255;
	const g = parseInt(hex.slice(3, 5), 16) / 255;
	const b = parseInt(hex.slice(5, 7), 16) / 255;
	const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
	const l = (mx + mn) / 2;
	let h = 0;
	if (d) {
		if (mx === r) { h = ((g - b) / d) % 6; }
		else if (mx === g) { h = (b - r) / d + 2; }
		else { h = (r - g) / d + 4; }
		h *= 60;
		if (h < 0) { h += 360; }
	}
	const s = d ? d / (1 - Math.abs(2 * l - 1)) : 0;
	return { h, s: s * 100, l: l * 100 };
}
const dHue = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };

// ---- data ------------------------------------------------------------------

const manifest = JSON.parse(readFileSync(join(ROOT, 'set-manifest.json'), 'utf8'));
const measured = await rasterFills(manifest.icons.map(i =>
	({ kind: i.kind, id: i.id, path: join(ROOT, 'svg', i.kind, `${i.id}.svg`) })));

// --try id=#HEX,… — score a retint before it touches disk. A retint never changes form,
// so swapping the dominant in memory is exactly equivalent to editing the SVG.
const TRY = new Map();
if (argv.includes('--try')) {
	for (const spec of (argv[argv.indexOf('--try') + 1] ?? '').split(',').filter(Boolean)) {
		const [id, hex] = spec.split('=');
		TRY.set(id, hex.toUpperCase());
	}
}

const icons = manifest.icons.map(i => {
	const m = measured.get(`${i.kind}/${i.id}`);
	const dominant = (i.kind === 'file' && TRY.get(i.id)) || m.dominant;
	// BADGE plates are identical by law, so the letters are the form; everything else is
	// judged on its whole silhouette.
	const form = i.archetype === 'BADGE' && m.mark.includes('1') ? m.mark : m.ink;
	return { ...i, dominant, coverage: m.coverage, hsl: hsl(dominant), form, mask: m.mask, bytes: m.bytes };
});
const byId = new Map(icons.map(i => [`${i.kind}/${i.id}`, i]));
const file = (id) => byId.get(`file/${id}`);

function iou(a, b) {
	let inter = 0, union = 0;
	for (let k = 0; k < a.length; k++) {
		const x = a[k] === '1', y = b[k] === '1';
		if (x && y) { inter++; }
		if (x || y) { union++; }
	}
	return union ? inter / union : 0;
}

/**
 * Outline of a mask, dilated by one cell. Area IoU alone cannot tell a shield from a
 * page from a disc — three different solids of similar area overlap by ~0.8. The
 * outline is what the eye actually reads, so form similarity is scored on it.
 */
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

/** Form similarity: both the filled area and the outline have to agree. */
function formSim(A, B) {
	const area = iou(A.form, B.form);
	const edge = iou(outline(A.form, A.mask), outline(B.form, B.mask));
	return { area, edge, sim: Math.min(area, edge) };
}

// ---- R7: palette twins ------------------------------------------------------

const twins = [], separated = [], nearTwins = [];
const files = icons.filter(i => i.kind === 'file');
for (let a = 0; a < files.length; a++) {
	for (let b = a + 1; b < files.length; b++) {
		const A = files[a], B = files[b];
		if (A.archetype !== B.archetype) { continue; }
		if (sameFamily(A.id, B.id)) { continue; }
		if (A.hsl.s < NEUTRAL_S || B.hsl.s < NEUTRAL_S) { continue; }   // neutral lane
		const dh = dHue(A.hsl.h, B.hsl.h), dl = Math.abs(A.hsl.l - B.hsl.l), ds = Math.abs(A.hsl.s - B.hsl.s);
		if (!(dh < D_HUE && dl < D_LIGHT && ds < D_SAT)) {
			if (dh < D_HUE * 1.5 && dl < D_LIGHT * 1.4 && ds < D_SAT * 1.4) {
				nearTwins.push({ a: A.id, b: B.id, archetype: A.archetype, dh, dl, ds, ...formSim(A, B) });
			}
			continue;
		}
		const f = formSim(A, B);
		const rec = { a: A.id, b: B.id, archetype: A.archetype, dh, dl, ds, ...f };
		// A BADGE is a plate (§6: "two badges in the same hue do not" separate) and a GLYPH
		// is thin ink on nothing — in both, hue IS the read at 16 px, so any colour hit is a
		// twin. A SILHOUETTE carries a distinctive object shape, so a colour hit is a twin
		// only when the shapes do not read apart either (see FORM_SEP).
		if (A.archetype === 'SILHOUETTE' && f.sim < FORM_SEP) { separated.push(rec); }
		else { twins.push(rec); }
	}
}

// twin clusters: a chain of twin pairs is one problem, not N problems
function cluster(pairs) {
	const parent = new Map();
	const find = (x) => { while (parent.get(x) !== x) { parent.set(x, parent.get(parent.get(x))); x = parent.get(x); } return x; };
	for (const p of pairs) { for (const id of [p.a, p.b]) { if (!parent.has(id)) { parent.set(id, id); } } }
	for (const p of pairs) { parent.set(find(p.a), find(p.b)); }
	const groups = new Map();
	for (const p of pairs) {
		const k = find(p.a);
		if (!groups.has(k)) { groups.set(k, { members: new Set(), pairs: [] }); }
		groups.get(k).members.add(p.a); groups.get(k).members.add(p.b); groups.get(k).pairs.push(p);
	}
	return [...groups.values()].map(g => ({ members: [...g.members].sort(), pairs: g.pairs }));
}

// ---- R8: form collisions ----------------------------------------------------

const forms = [], nearForms = [];
for (let a = 0; a < files.length; a++) {
	for (let b = a + 1; b < files.length; b++) {
		const A = files[a], B = files[b];
		if (A.archetype !== B.archetype) { continue; }
		if (sameFamily(A.id, B.id)) { continue; }
		const f = formSim(A, B);
		const bar = A.archetype === 'BADGE' ? IOU_COLLIDE_BADGE : IOU_COLLIDE;
		if (f.sim >= bar) { forms.push({ a: A.id, b: B.id, archetype: A.archetype, ...f }); }
		else if (f.sim >= IOU_NEAR) { nearForms.push({ a: A.id, b: B.id, archetype: A.archetype, ...f }); }
	}
}

// folders: the plate is law, so the emblem carries the identity — flag duplicate emblem text
const folderEmblems = new Map();
for (const f of icons.filter(i => i.kind === 'folder' && !i.id.endsWith('-open'))) {
	const k = (f.emblem ?? '').toLowerCase().trim();
	if (!k || k.startsWith('none')) { continue; }
	if (!folderEmblems.has(k)) { folderEmblems.set(k, []); }
	folderEmblems.get(k).push(f.id);
}
const folderDupes = [...folderEmblems.entries()].filter(([, v]) => v.length > 1);

// ---- report -----------------------------------------------------------------

const accepted = (r) => ACCEPTED.get(pairKey(r.a, r.b));
const openTwins = twins.filter(t => !accepted(t));
const openForms = forms.filter(f => !accepted(f));

// The matte band (§6): retints are searched inside it, never outside.
const MATTE = { sMin: 26, sMax: 72, lMin: 32, lMax: 70 };
// A retint must not land ON the R7 threshold — it clears it by this much.
const MARGIN = 1.1;

/** Does colour `c` clear every R7 conflict for icon `me`, against `pool`? */
function clears(me, c, pool, margin = 1) {
	if (c.s < NEUTRAL_S) { return true; }                    // neutral lane
	for (const r of pool) {
		if (r.id === me.id || r.archetype !== me.archetype || sameFamily(r.id, me.id)) { continue; }
		if (r.hsl.s < NEUTRAL_S) { continue; }
		if (me.archetype === 'SILHOUETTE' && formSim(me, r).sim < FORM_SEP) { continue; }
		if (dHue(c.h, r.hsl.h) < D_HUE * margin && Math.abs(c.l - r.hsl.l) < D_LIGHT * margin
			&& Math.abs(c.s - r.hsl.s) < D_SAT * margin) { return false; }
	}
	return true;
}

/**
 * A brand icon may be lightened, darkened or muted, but not re-hued — its hue IS the
 * brand. An icon whose colour source says "no brand" is free to move anywhere.
 */
const HUE_LOCK = argv.includes('--hue-lock') ? +argv[argv.indexOf('--hue-lock') + 1] : 360;
const hueLocked = (i) => /brand|canon|family/.test(i.colourSource ?? '') && !/no brand/.test(i.colourSource ?? '');

/** Clear colours for `me`, ordered by distance from `anchor`, coarse-deduplicated. */
function candidates(me, anchor, pool, n = 12) {
	const lock = hueLocked(me) ? HUE_LOCK : 360;
	// Desaturating to escape a twin just makes mud, so S is the dearest axis; a darker or
	// lighter version of the same brand hue still reads as the brand, so L is the cheapest.
	const cost = (c) => dHue(c.h, anchor.h) * 1.4 + Math.abs(c.l - anchor.l) * 1.0 + Math.abs(c.s - anchor.s) * 2.2;
	const hits = [];
	for (let h = 0; h < 360; h += 1) {
		for (let s = MATTE.sMin; s <= MATTE.sMax; s += 1) {
			for (let l = MATTE.lMin; l <= MATTE.lMax; l += 1) {
				const c = { h, s, l };
				if (dHue(h, me.hsl.h) > lock) { continue; }
				if (clears(me, c, pool, MARGIN)) { hits.push({ c, cost: cost(c) }); }
			}
		}
	}
	hits.sort((a, b) => a.cost - b.cost);
	const out = [], seen = new Set();
	for (const x of hits) {
		const bucket = `${Math.round(x.c.h / 6)}|${Math.round(x.c.l / 6)}`;
		if (seen.has(bucket)) { continue; }
		seen.add(bucket);
		out.push({ ...x, hex: toHex(x.c) });
		if (out.length >= n) { break; }
	}
	return out;
}

const brandOf = (i) => {
	const m = /#[0-9A-Fa-f]{6}/.exec(i.colourSource ?? '');
	return m ? m[0].toUpperCase() : i.dominant;
};

// --suggest id [--anchor #HEX] — the closest colours to the anchor that clear every R7
// conflict this icon has, so a retint can be chosen by evidence rather than by eye.
if (argv.includes('--suggest')) {
	// --suggest id[=#ANCHOR][,id…] — one or many, each optionally anchored on a hex of
	// your choosing (default: the brand hex named in the icon's colour source).
	for (const spec of (argv[argv.indexOf('--suggest') + 1] ?? '').split(',').filter(Boolean)) {
		const [id, hex] = spec.split('=');
		const me = file(id);
		if (!me) { console.error(`unknown file icon "${id}"`); process.exit(2); }
		const anchor = hsl((hex ?? brandOf(me)).toUpperCase());
		console.log(`\n${id} (${me.archetype}) now ${me.dominant} h${me.hsl.h.toFixed(0)} s${me.hsl.s.toFixed(0)} l${me.hsl.l.toFixed(0)}  [${me.colourSource}]`);
		console.log(`  anchor h${anchor.h.toFixed(0)} s${anchor.s.toFixed(0)} l${anchor.l.toFixed(0)} — nearest clear colours:`);
		for (const x of candidates(me, anchor, files)) {
			console.log(`    ${x.hex}  h${String(x.c.h).padStart(3)} s${String(x.c.s).padStart(2)} l${String(x.c.l).padStart(2)}  cost ${x.cost.toFixed(1)}`);
		}
	}
	process.exit(0);
}

// --plan --movable id,id,… — greedy minimal retint plan. The movable list is ordered
// least-brand-anchored first; the planner only ever moves the most-movable member of a
// twin pair, and always to the colour nearest that icon's own brand anchor.
if (argv.includes('--plan')) {
	const movable = (argv[argv.indexOf('--movable') + 1] ?? '').split(',').filter(Boolean);
	const max = argv.includes('--max') ? +argv[argv.indexOf('--max') + 1] : movable.length;
	const rank = new Map(movable.map((id, i) => [id, i]));
	const pool = files.map(i => ({ ...i }));
	const plan = [];
	for (let pass = 0; pass < max; pass++) {
		const open = [];
		for (let a = 0; a < pool.length; a++) {
			for (let b = a + 1; b < pool.length; b++) {
				const A = pool[a], B = pool[b];
				if (A.archetype !== B.archetype || sameFamily(A.id, B.id)) { continue; }
				if (A.hsl.s < NEUTRAL_S || B.hsl.s < NEUTRAL_S) { continue; }
				const dh = dHue(A.hsl.h, B.hsl.h), dl = Math.abs(A.hsl.l - B.hsl.l), ds = Math.abs(A.hsl.s - B.hsl.s);
				if (!(dh < D_HUE && dl < D_LIGHT && ds < D_SAT)) { continue; }
				if (A.archetype === 'SILHOUETTE' && formSim(A, B).sim < FORM_SEP) { continue; }
				open.push([A, B]);
			}
		}
		if (!open.length) { break; }
		// the icon that is both movable and involved in the most open pairs goes first
		const load = new Map();
		for (const [A, B] of open) { for (const X of [A, B]) { load.set(X.id, (load.get(X.id) ?? 0) + 1); } }
		const target = [...load.keys()].filter(id => rank.has(id))
			.sort((x, y) => (load.get(y) - load.get(x)) || (rank.get(x) - rank.get(y)))[0];
		if (!target) { break; }
		const me = pool.find(i => i.id === target);
		// anchor on the icon's current colour: every current colour already passed its own
		// batch review, so the smallest move away from it is the least disruptive fix.
		const [best] = candidates(me, me.hsl, pool, 1);
		if (!best) { plan.push({ id: target, from: me.dominant, to: null }); rank.delete(target); continue; }
		plan.push({ id: target, from: me.dominant, to: best.hex, pairs: load.get(target), anchor: brandOf(me) });
		me.dominant = best.hex; me.hsl = hsl(best.hex);
		rank.delete(target);
	}
	console.log(`plan — ${plan.length} retint(s)`);
	for (const p of plan) {
		console.log(`  ${p.id.padEnd(16)} ${p.from} -> ${p.to ?? 'NO CLEAR COLOUR IN THE MATTE BAND'}  `
			+ `(anchor ${p.anchor}, was in ${p.pairs} open pair(s))`);
	}
	console.log(`\n--try ${plan.filter(p => p.to).map(p => `${p.id}=${p.to}`).join(',')}`);
	process.exit(0);
}

function toHex({ h, s, l }) {
	const S = s / 100, L = l / 100;
	const c = (1 - Math.abs(2 * L - 1)) * S, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = L - c / 2;
	const t = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x]
		: h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
	return '#' + t.map(v => Math.round((v + m) * 255).toString(16).padStart(2, '0').toUpperCase()).join('');
}

if (argv.includes('--pair')) {
	const [x, y] = argv.slice(argv.indexOf('--pair') + 1);
	const A = file(x), B = file(y);
	if (!A || !B) { console.error('unknown id'); process.exit(2); }
	const dh = dHue(A.hsl.h, B.hsl.h), dl = Math.abs(A.hsl.l - B.hsl.l), ds = Math.abs(A.hsl.s - B.hsl.s);
	const f = (i) => `${i.id} ${i.dominant} ${i.archetype} h${i.hsl.h.toFixed(0)} s${i.hsl.s.toFixed(0)} l${i.hsl.l.toFixed(0)}`;
	console.log(f(A)); console.log(f(B));
	console.log(`dh ${dh.toFixed(1)}  dl ${dl.toFixed(1)}  ds ${ds.toFixed(1)}  iou ${iou(A.form, B.form).toFixed(3)}`);
	console.log(`R7 twin: ${A.archetype === B.archetype && A.hsl.s >= NEUTRAL_S && B.hsl.s >= NEUTRAL_S
		&& dh < D_HUE && dl < D_LIGHT && ds < D_SAT ? 'YES' : 'no'}${sameFamily(A.id, B.id) ? ' (R3 family, exempt)' : ''}`);
	const M = A.mask;
	for (let r = 0; r < M; r++) {
		console.log(A.form.slice(r * M, (r + 1) * M).replace(/0/g, '.').replace(/1/g, '#') + '  '
			+ B.form.slice(r * M, (r + 1) * M).replace(/0/g, '.').replace(/1/g, '#'));
	}
	process.exit(0);
}

if (argv.includes('--json')) {
	console.log(JSON.stringify({ twins, separated, nearTwins, forms, nearForms, folderDupes,
		clusters: cluster(openTwins) }, null, '\t'));
	process.exit(0);
}

const row = (r) => `  ${r.a.padEnd(20)} ${r.b.padEnd(20)} ${r.archetype.padEnd(11)} `
	+ `${file(r.a).dominant} ${file(r.b).dominant}  `
	+ (r.dh !== undefined ? `dh ${r.dh.toFixed(1).padStart(5)} dl ${r.dl.toFixed(1).padStart(5)} ds ${r.ds.toFixed(1).padStart(5)}  ` : '')
	+ `form ${r.sim.toFixed(2)} (area ${r.area.toFixed(2)} edge ${r.edge.toFixed(2)})`;

console.log(`M11 set audit — ${icons.length} icons (${files.length} file, ${icons.length - files.length} folder)`);
console.log(`R7 thresholds: dhue<${D_HUE} dL<${D_LIGHT} dS<${D_SAT}, neutral lane S<${NEUTRAL_S}`);
console.log(`R7 SILHOUETTE lane: a colour hit whose form score is < ${FORM_SEP} is separated by form`);
console.log(`R8 threshold: form score >= ${IOU_COLLIDE} (min of area IoU and outline IoU, 64x64)\n`);

console.log(`== R7 palette twins: ${openTwins.length} open, ${twins.length - openTwins.length} accepted ==`);
for (const c of cluster(openTwins)) {
	console.log(` cluster {${c.members.join(', ')}}`);
	for (const p of c.pairs) { console.log(row(p)); }
}
if (!openTwins.length) { console.log('  none'); }

console.log(`\n== R8 form collisions: ${openForms.length} open, ${forms.length - openForms.length} accepted ==`);
for (const f of openForms) { console.log(row(f)); }
if (!openForms.length) { console.log('  none'); }

if (twins.length - openTwins.length || forms.length - openForms.length) {
	console.log('\n== accepted residuals ==');
	for (const r of [...twins, ...forms].filter(accepted)) { console.log(`  ${r.a} / ${r.b} — ${accepted(r)}`); }
}

console.log(`\n== R7 colour hits separated by form (${separated.length}, SILHOUETTE lane) ==`);
for (const c of cluster(separated)) { console.log(`  {${c.members.join(', ')}}  ${c.pairs.length} pair(s)`); }
if (!separated.length) { console.log('  none'); }

if (folderDupes.length) {
	console.log('\n== folder emblems used twice ==');
	for (const [k, v] of folderDupes) { console.log(`  ${v.join(', ')} — "${k}"`); }
}

if (argv.includes('--near')) {
	console.log(`\n== R7 near-misses (${nearTwins.length}) ==`);
	for (const p of nearTwins.sort((x, y) => x.dh - y.dh)) { console.log(row(p)); }
	console.log(`\n== R8 near-misses (${nearForms.length}) ==`);
	for (const p of nearForms.sort((x, y) => y.iou - x.iou)) { console.log(row(p)); }
}

console.log(`\n${openTwins.length + openForms.length} open finding(s)`);
process.exit(openTwins.length + openForms.length ? 1 : 0);
