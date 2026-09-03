#!/usr/bin/env node
// build.mjs — the pilot: one master per concept, the shipped SVGs derived from it.
//
//   node tools/build.mjs
//
// R1 is the ruled style (D22), so a file icon IS its master — written twice, byte
// for byte, and check.mjs asserts it. A folder icon is the one silhouette in the
// concept's colour with that same master, knocked out white at face scale; the
// open state is the same mark over v1's two-panel construction, with the back
// sheet derived by the OPEN_SHADE_DL formula rather than picked by eye.

import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FILES, FOLDERS, SUBJECTS, CARRIED, SUPERSEDED, SUPERSEDED_RULING, ENV, master, spec }
	from './sources.mjs';
import { unionBBox } from './pathkit.mjs';
import { shade, contrast, lift, NEUTRAL, SAND, WHITE, BACKDROP, OPEN_SHADE_DL, OPEN_SHADE_FLOOR }
	from './color.mjs';
import { FOLDER, FOLDER_OPEN_BACK, FOLDER_OPEN_FRONT } from './geom.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, '..', 'pilot');
for (const d of ['masters', 'icons', 'proofs']) { mkdirSync(join(OUT, d), { recursive: true }); }

const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${body}</svg>`;
const P = (d, fill) => `<path fill="${fill}" d="${d}"/>`;
const layersOf = (ls) => ls.map(l => P(l.d, l.fill)).join('');

/**
 * L9 gate 2 — the 16 px proof, eyeballed. These verdicts are read off
 * pilot/proofs/proof-16px.png (every icon at a true 16 px next to a 10x
 * nearest-neighbour blow-up of the same render) and written down here rather
 * than asserted by a machine, because the gate is "does a human read it".
 */
const PROOF16 = {
	typescript: ['pass', 'the TS lockup separates cleanly on the blue field'],
	python: ['pass', 'both snakes hold, and the blue/yellow split survives'],
	docker: ['pass', 'FIX ROUND. The whale reads and the deck is loaded: three columns, seven '
		+ 'official containers, the stack stepping up to the right. The rejected 3+1 read as '
		+ 'three nubs and a floating box'],
	markdown: ['pass', 'frame, M and arrow all separate'],
	editorconfig: ['pass', 'FIX ROUND. Reads as the drawn mascot: the head, both ears, the '
		+ 'solid spectacles with the bridge notch still open between the lenses, and a dark '
		+ 'nose at the snout. The ear rims and whisker survive as antialiasing, which is what '
		+ 'a 0.2 px line does'],
	json: ['pass', 'braces read as braces'],
	react: ['pass', 'three orbits and the nucleus all hold at the 1.5 px stroke'],
	eslint: ['pass (marginal)', 'reads as a purple hexagon with a lighter core; the core\'s own '
		+ 'hexagonal edges are lost'],
	prettier: ['pass', 'four bar rows, colours distinct'],
	rust: ['pass (marginal)', 'gear silhouette and the R read; the cog teeth become a soft edge '
		+ 'and the R\'s counter nearly closes'],
	npm: ['pass', 'red field, white n, counter open'],
	dotenv: ['pass', 'yellow field with a dark dot and E, both separate'],
	yaml: ['pass (marginal)', 'reads as a RED LETTER BLOCK: the 2x2 lockup is there and its bars '
		+ 'clear 1.25 px, but the four letters are not individually legible at 16. The mark\'s own '
		+ 'construction, not a fit failure — see the flags'],
	git: ['pass', 'diamond plus knocked-out branch, nodes distinct'],
	go: ['pass', 'the G and the o both read once the motion lines are gone'],
	vue: ['pass (marginal)', 'the nested V reads, but the dark half sits at 2.01:1 on the '
		+ 'backdrop and its top rim is 0.39 px of green'],
	'folder-src': ['pass', 'two chevrons, clearly separated'],
	'folder-src-open': ['pass', 'open state obvious; the chevron tops cross onto the back sheet'],
	'folder-node': ['pass', 'white hexagon fills the face'],
	'folder-node-open': ['pass', 'hexagon top crosses onto the back sheet, still one white shape'],
	'folder-test': ['pass', 'the check is the most legible glyph in the set at 16'],
	'folder-test-open': ['pass', 'the check\'s long arm crosses the seam, reads continuously'],
	'folder-docker': ['pass', 'whale silhouette on Docker blue, unmistakable'],
	'folder-docker-open': ['pass', 'whale sits entirely on the pocket; no seam crossing']
};
const verdict = (id) => ({ result: PROOF16[id][0], note: PROOF16[id][1] });

/** A folder's body colour: the brand's primary hex, or sand for a mark-less concept. */
const bodyOf = (s) => (s.neutral ? SAND : lift(s.brand));

const report = [];
const subjects = {};

// ---- file icons ---------------------------------------------------------------
for (const id of FILES) {
	const s = spec(id);
	const m = master(id);
	const body = layersOf(m.layers);
	writeFileSync(join(OUT, 'masters', `${id}.svg`), svg(body));
	writeFileSync(join(OUT, 'icons', `${id}.svg`), svg(body));   // R1: the icon IS the master

	const colours = [...new Set(m.layers.map(l => l.fill))];
	subjects[id] = {
		title: s.title,
		kind: 'file',
		carried: CARRIED.includes(id),
		source: s.source,
		colours,
		contrast_on_backdrop: Object.fromEntries(colours.map(c => [c, +contrast(c, BACKDROP).toFixed(2)])),
		envelope: { w: s.env.w, h: s.env.h },
		ink: { w: +m.ink.w.toFixed(2), h: +m.ink.h.toFixed(2), mass: +(m.ink.w * m.ink.h).toFixed(0) },
		layers: m.layers.length,
		simplifications: s.simplifications,
		proof_16px: verdict(id),
		bytes: Buffer.byteLength(svg(body))
	};
	report.push({ id, kind: 'file', w: m.ink.w, h: m.ink.h, layers: m.layers.length,
		bytes: Buffer.byteLength(svg(body)) });
}

// ---- folder icons -------------------------------------------------------------
for (const id of FOLDERS) {
	const s = spec(id);
	const face = master(id, ENV.face);
	const mark = face.mono;
	const body = bodyOf(s);
	const back = shade(body);

	// the face master: the mark exactly as both states knock it out
	writeFileSync(join(OUT, 'masters', `${id}.svg`), svg(P(mark, WHITE)));

	const closed = P(FOLDER, body) + P(mark, WHITE);
	const open = P(FOLDER_OPEN_BACK, back) + P(FOLDER_OPEN_FRONT, body) + P(mark, WHITE);
	writeFileSync(join(OUT, 'icons', `${id}.svg`), svg(closed));
	writeFileSync(join(OUT, 'icons', `${id}-open.svg`), svg(open));

	const fink = face.ink;
	const largest = Math.max(fink.w, fink.h);
	subjects[id] = {
		title: s.title,
		kind: 'folder',
		carried: CARRIED.includes(id),
		source: s.source,
		colours: [body, back, WHITE],
		contrast_on_backdrop: {
			[body]: +contrast(body, BACKDROP).toFixed(2),
			[back]: +contrast(back, BACKDROP).toFixed(2)
		},
		body, back_sheet: back,
		envelope: { w: ENV.face.w, h: ENV.face.h },
		folder_face_ink: { w: +fink.w.toFixed(2), h: +fink.h.toFixed(2), largest: +largest.toFixed(2) },
		simplifications: s.simplifications,
		proof_16px: { closed: verdict(id), open: verdict(`${id}-open`) },
		bytes: { closed: Buffer.byteLength(svg(closed)), open: Buffer.byteLength(svg(open)) }
	};
	report.push({ id, kind: 'folder', w: fink.w, h: fink.h, largest, body, back,
		bytes: Buffer.byteLength(svg(open)) });
}

// ---- the console table --------------------------------------------------------
console.log('subject         kind    ink            layers  bytes');
for (const r of report) {
	console.log(`${r.id.padEnd(15)} ${r.kind.padEnd(7)} `
		+ `${(r.w.toFixed(2) + 'x' + r.h.toFixed(2)).padEnd(14)} `
		+ `${String(r.layers ?? '-').padStart(4)}   ${String(r.bytes).padStart(5)}`
		+ (r.body ? `   body ${r.body} back ${r.back} face-max ${r.largest.toFixed(2)}` : ''));
}

// ---- manifest (L2's per-icon duty + the set constants + the verdicts) ----------
const si = JSON.parse(readFileSync(join(HERE, 'node_modules', 'simple-icons', 'package.json'), 'utf8'));
writeFileSync(join(OUT, 'manifest.json'), JSON.stringify({
	note: 'M20 icons v2 — PILOT (24 icons). Style is D22/R1 "True colour": the icon IS the '
		+ 'official mark, fitted, official colours verbatim. Per L2 every mark\'s geometry '
		+ 'derives from official vector artwork; this file records where each one came from, '
		+ 'exactly what L5 forced us to simplify, and every judgement call made along the way.',
	generated: new Date().toISOString().slice(0, 10),
	roster: {
		carried: CARRIED.filter(id => spec(id)),
		new_files: FILES.filter(id => !CARRIED.includes(id)),
		new_folders: FOLDERS.filter(id => !CARRIED.includes(id)),
		count: { files: FILES.length, folders: FOLDERS.length * 2, total: FILES.length + FOLDERS.length * 2 }
	},
	fix_round: {
		ruling: SUPERSEDED_RULING,
		verdict: '22 of the 24 pilot icons APPROVED as built. TWO REJECTED — "that is '
			+ 'definitely NOT the docker or editorconfig logo" — and rebuilt in this round. '
			+ 'Nothing else was touched: the other 22 shipped icons and every other master are '
			+ 'byte-identical to the gated build, folder-docker included.',
		rebuilt: SUPERSEDED,
		editorconfig: 'the round-2 master flattened a hand-drawn LINE drawing into a white '
			+ 'silhouette with two dark slashes. Re-sourced from the brand\'s own vector '
			+ '(editorconfig/editorconfig, assets/EditorConfig_Logo.svg) and rebuilt as a '
			+ 'light face carrying the official DARK features under the prettier rider.',
		docker: 'the round-2 master reduced the official 5+3+1 container grid to 3+1 — four '
			+ 'boxes, the top one alone. The deck is reloaded to 3+3+1 (seven of the official '
			+ 'nine) on the three columns the 1.2 px floor allows; the whale is the same '
			+ 'official subpath in both rounds.',
		deck_study: 'pilot/proofs/docker-deck-candidates.png',
		carry_gate: `the D22 carry gate now asserts ${CARRIED.length - SUPERSEDED.length}/`
			+ `${CARRIED.length} carried subjects still byte-identical to samples/masters/ and `
			+ `exactly ${SUPERSEDED.length} SUPERSEDED BY PILOT (${SUPERSEDED.join(', ')}). A `
			+ 'superseded subject that quietly refits to its round-2 bytes fails the gate too.'
	},
	tooling: {
		'simple-icons': `${si.version} (${si.license})`,
		'fetched artwork': 'm20-icons-v2/sources-svg/ — brand-published SVGs, downloaded '
			+ 'once and kept for the standing fidelity gate'
	},
	set_constants: {
		envelopes: ENV,
		open_folder: {
			rule: 'NEW WITH THE PILOT. Closed and open are one construction (L7). The open '
				+ 'state is v1\'s proven two-panel silhouette: a back sheet standing behind '
				+ 'and a pocket tipped forward. The pocket carries the BODY colour verbatim; '
				+ `the back sheet is that colour at L minus ${OPEN_SHADE_DL} in HSL, hue and `
				+ `saturation untouched, floored at L ${OPEN_SHADE_FLOOR} so a dark brand body `
				+ 'cannot collapse into the backdrop. One formula for every folder, sand '
				+ 'included.',
			formula: `shade(body) = hsl(h, s, max(${OPEN_SHADE_FLOOR}, l - ${OPEN_SHADE_DL}))`,
			why_15: 'it reproduces v1\'s own hand-picked sand pair (#BF9354 body -> #8F6D37 '
				+ 'back sheet) to within two units per channel',
			mark: 'the face mark is painted over both panels at the SAME coordinates it holds '
				+ 'when the folder is closed — byte-identical path data, asserted by check.mjs. '
				+ 'It crosses the panel seam; the two panels differ only in lightness, so the '
				+ 'white mark reads continuously (L7: open never hides the glyph).',
			back_panel: FOLDER_OPEN_BACK,
			front_panel: FOLDER_OPEN_FRONT
		},
		visibility_lift: 'a mark whose official hex is below L 22 is raised to L 88 with hue '
			+ 'and saturation intact (markdown #000000 only). Clarified by the pilot: the lift '
			+ 'applies to ink that MEETS THE BACKDROP. Ink printed on the mark\'s own field '
			+ '(dotenv\'s black ".E" on its yellow square, editorconfig\'s #020202 drawing on '
			+ 'its white face) is never lifted — lifting it would invent a colour the brand '
			+ 'does not use; on editorconfig lifting it would erase the mascot\'s glasses.',
		achromatic_exemption: 'inks below S 12 skip any saturation clamp',
		neutral_ink: NEUTRAL,
		folder_sand: SAND,
		backdrop: BACKDROP,
		contrast_note: 'contrast_on_backdrop is measured for EVERY declared fill, including '
			+ 'ink that never meets the backdrop because it prints on the mark\'s own field '
			+ '(dotenv\'s #000000 on its yellow square, typescript\'s white on its blue, '
			+ 'editorconfig\'s #020202 on its white face). Read it only for the fills that '
			+ 'touch the ground. One edge case, flagged: editorconfig\'s ink also forms the '
			+ 'drawing\'s outer contour, so a 0.33 px rim of it does meet the backdrop — it '
			+ 'reads as a soft edge on the white face, not as a line.',
		typeset_letters: 'NONE. R1 has no typeset letters; the L3 table is dormant. Every '
			+ 'letterform in this pilot (typescript, npm, dotenv, yaml, go) is faithful source '
			+ 'geometry taken from the brand\'s own artwork.'
	},
	subjects
}, null, '\t') + '\n');

console.log(`\nwrote ${FILES.length} file masters + ${FOLDERS.length} folder face masters, `
	+ `${FILES.length + FOLDERS.length * 2} icons, and manifest.json`);
void unionBBox; void NEUTRAL; void SUBJECTS;
