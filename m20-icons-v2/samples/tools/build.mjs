#!/usr/bin/env node
// build.mjs — one master per subject, four treatments derived from it.
//
//   node tools/build.mjs
//
// The whole point of round 2: the mark's geometry is decided ONCE (sources.mjs)
// and every treatment is a pure function of it — recolour, flatten, chip-wrap.
// No treatment may reach for a different shape, which is why the four rows are
// comparable at all.

import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SUBJECTS, ENV, master, spec } from './sources.mjs';
import { roundRect, round, unionBBox } from './pathkit.mjs';
import { chipBand, tamed, lift, NEUTRAL, SAND, SLATE, WHITE } from './color.mjs';
import { FOLDER } from './geom.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, '..');
const DIRS = { masters: 'masters', r1: 'r1-true', r2: 'r2-tint', r3: 'r3-chips', r4: 'r4-tamed' };
for (const d of Object.values(DIRS)) { mkdirSync(join(OUT, d), { recursive: true }); }

const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${body}</svg>`;
const P = (d, fill) => `<path fill="${fill}" d="${d}"/>`;
const layersOf = (ls, recolor = (f) => f) => ls.map(l => P(l.d, recolor(l.fill))).join('');

const CHIP = round(roundRect(1, 1, 14, 14, 3, true));
const CHIP_ENV = { w: 10, h: 10, cx: 8, cy: 8 };

/** The concept's one hue: brand hex, or the set-assigned hue for mark-only brands. */
const hueOf = (s) => s.chipHue || lift(s.brand);

const report = [];
const manifest = {};

for (const id of SUBJECTS) {
	const s = spec(id);
	const m = master(id);                       // file-scale, official colours
	const face = master(id, ENV.face);          // folder-face scale
	const chip = master(id, CHIP_ENV);          // inside the R3 chip

	// ---- master ---------------------------------------------------------------
	writeFileSync(join(OUT, DIRS.masters, `${id}.svg`), svg(layersOf(m.layers)));

	let r1, r2, r3, r4;
	if (s.folder) {
		// L7: the body carries the concept, the mark is white and >= 8 px on the face
		const body = s.neutral ? SAND : lift(s.brand);
		r1 = P(FOLDER, body) + P(face.mono, WHITE);
		// R2: every folder body is sand. A neutral concept's ink is chosen against
		// #121314, not against sand, so neutrals keep the white face mark (rule, not
		// a per-icon call — see the report's errata candidates).
		r2 = P(FOLDER, SAND) + P(face.mono, s.neutral ? WHITE : s.brand);
		r3 = P(FOLDER, s.neutral ? SLATE : chipBand(hueOf(s))) + P(face.mono, WHITE);
		r4 = P(FOLDER, s.neutral ? SAND : tamed(s.brand)) + P(face.mono, WHITE);
	} else {
		r1 = layersOf(m.layers, lift);
		r2 = P(m.mono, lift(s.brand));
		r3 = P(CHIP, chipBand(hueOf(s))) + P(chip.mono, WHITE);
		r4 = layersOf(m.layers, tamed);
	}

	writeFileSync(join(OUT, DIRS.r1, `${id}.svg`), svg(r1));
	writeFileSync(join(OUT, DIRS.r2, `${id}.svg`), svg(r2));
	writeFileSync(join(OUT, DIRS.r3, `${id}.svg`), svg(r3));
	writeFileSync(join(OUT, DIRS.r4, `${id}.svg`), svg(r4));

	const ink = m.ink, fink = face.ink;
	manifest[id] = {
		title: s.title,
		kind: s.folder ? 'folder' : 'file',
		source: s.source,
		colours: {
			official: [...new Set(m.layers.map(l => l.fill))],
			r1: [...new Set(m.layers.map(l => lift(l.fill)))],
			r2: s.folder ? { body: SAND, mark: s.neutral ? WHITE : s.brand } : lift(s.brand),
			r3_chip: s.neutral && s.folder ? SLATE : chipBand(hueOf(s)),
			r4: [...new Set(m.layers.map(l => tamed(l.fill)))],
			assigned_hue: s.chipHue || null
		},
		envelope: { w: s.env.w, h: s.env.h },
		ink: { w: +ink.w.toFixed(2), h: +ink.h.toFixed(2) },
		folder_face_ink: s.folder
			? { w: +fink.w.toFixed(2), h: +fink.h.toFixed(2), largest: +Math.max(fink.w, fink.h).toFixed(2) }
			: null,
		simplifications: s.simplifications
	};
	report.push({
		id, w: +ink.w.toFixed(2), h: +ink.h.toFixed(2),
		faceMax: +Math.max(fink.w, fink.h).toFixed(2),
		layers: m.layers.length, hue: hueOf(s), chip: chipBand(hueOf(s))
	});
}

console.log('subject         ink (file)     folder face   layers  hue      chip');
for (const r of report) {
	console.log(`${r.id.padEnd(15)} ${String(r.w).padStart(5)}x${String(r.h).padEnd(6)} `
		+ `${String(r.faceMax).padStart(5)}        ${String(r.layers).padStart(2)}     `
		+ `${r.hue}  ${r.chip}`);
}

// ---- provenance (L2's per-icon duty) ------------------------------------------
const si = JSON.parse(readFileSync(join(HERE, 'node_modules', 'simple-icons', 'package.json'), 'utf8'));
writeFileSync(join(OUT, 'sources.json'), JSON.stringify({
	note: 'M20 icons v2, round 2. Per guide L2 every mark\'s geometry is adapted from '
		+ 'official vector artwork; this file records where each one came from and exactly '
		+ 'what L5 forced us to simplify. json and folder-src own no brand mark and use the '
		+ 'set\'s neutral glyph vocabulary.',
	generated: new Date().toISOString().slice(0, 10),
	tooling: {
		'simple-icons': `${si.version} (${si.license})`,
		'fetched artwork': 'm20-icons-v2/samples/sources-svg/ — brand-published SVGs, '
			+ 'downloaded once and kept for the fidelity proof'
	},
	palette_rules: {
		visibility_lift: 'a mark whose official hex is below L 22 is raised to L 88 with hue '
			+ 'and saturation intact (markdown #000000 only)',
		r3_chip_band: 'S 45-70 / L 45-60, hue untouched',
		r4_set_band: 'S 45-70 / L 45-62, hue untouched',
		achromatic_exemption: 'inks below S 12 skip the saturation floor — clamping S on a '
			+ 'hueless colour would invent a hue (editorconfig\'s white mascot)',
		assigned_hues: 'brands with a mark but no canonical colour get a set hue for the '
			+ 'container treatment only: markdown violet #8B6FDB, editorconfig rose #E0648A',
		neutral_ink: NEUTRAL,
		folder_sand: SAND
	},
	subjects: manifest
}, null, '\t') + '\n');

console.log(`\nwrote masters + 4 treatments for ${SUBJECTS.length} subjects, and sources.json`);
void unionBBox;
