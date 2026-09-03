// A01.t2.mjs — slice A01, tranche 2: the CODE category, abap → applescript.
//
//   abap · abc · abelljs · actionscript · ada · adobe-swc · adonis ·
//   advpl · advpl-include · advpl-ptm · advpl-tlpp · affectscript ·
//   affinity · affinitypublisher · agda · ahk2 · al · al-dal · alchemy ·
//   alloy · allure · angular-component · angular-directive · angular-guard ·
//   angular-interceptor · angular-pipe · angular-resolver · angular-service ·
//   antlers-html · antlr · anyscript · apex · apib · apl · applescript
//
// Same law as the pilot and tranche 1 (guide §5 / L1-L10, D22 R1 "True colour"):
// where a brand publishes a mark the icon IS that mark, adapted from the brand's
// own vector or a faithful CC0 trace of it, in the official colours; where no
// usable mark exists the concept takes the shared neutral vocabulary in one gray.
// Every source hunt, every reduction and every judgement call is recorded here.
//
// SOURCE HUNT RESULT for these thirty-five (L2 preference order: brand SVG >
// simple-icons > a source theme's faithful vector of a real mark):
//
//   brand's own SVG   advpl + its three variants (TOTVS ships them itself, MIT),
//                     alloy (grafana.com), allure (allurereport.org),
//                     alchemy (alchemy.run), affinity (Serif/Canva),
//                     abelljs (abelljs/abell, MIT), apib (apiaryio, MIT)
//   simple-icons      abap (SAP), adonis, ahk2, the seven angular-*, antlers-html
//                     (Statamic) — brand vectors were hunted first in every case
//                     and are recorded below where they exist but could not be
//                     used (SAP's own file paints its field with a <polyline> and
//                     a gradient; Angular's press kit ships PNG/GIF only)
//   source theme      antlr — antlr.org publishes the mark as a 220x80 PNG and
//                     nothing else, and simple-icons has no antlr entry, so L2's
//                     third tier fired for the first time in this slice. The mark
//                     was built from it and then REMOVED by the cross-set twin
//                     audit, which failed it against tranche 1's chrome (two red
//                     discs). It ships neutral; the call is flagged with both
//                     renders side by side
//   family (rule 1)   affinitypublisher (base affinity) · the six angular-*
//                     variants (base angular-component) · advpl's three variants
//                     ship the brand's OWN per-variant colours, so they are a
//                     family by recolour rather than by identity
//   NO MARK (rule 2)  abc                      -> object glyph (musical note)
//                     ada, affectscript, agda, ahk2, anyscript, apl
//                                              -> the generic-code category glyph
//
// FIX ROUND, 2026-09-03 — Sebastian's gate ruling: "I like the icons that are
// actually the real Icon... The licenses don't apply here because this is a personal
// project and will not be distributed." Licence, trademark and brand-usage policy no
// longer gate sourcing, and the chain orders by FIDELITY alone. SEVEN subjects were
// rebuilt here:
//   actionscript, adobe-swc  Adobe's corporate red "A" (the family, rule 1(b))
//   al, al-dal               MICROSOFT'S OWN AL mark, extracted from the AL Language
//                            extension — vscode-icons was tracing that file, not
//                            inventing a monogram (the family, rule 1(b))
//   apex                     the Salesforce cloud, exactly as flag 13 predicted
//   applescript              the Apple logo, lifted; AppleScript's OWN Script Editor
//                            scroll was hunted first and is macOS raster only
//   antlr                    REINSTATED under a new DECLARED look-alike lane
// The six that stay on the glyph are now uniformly L5 or no-mark-at-all verdicts —
// every one was re-measured with sourcing free. See FIX_FLAGS.
//
// Thirteen of thirty-five collapse to one glyph, which is the largest single fact
// about this tranche and is flagged as such. Six of those thirteen are corporate
// marks this build declines to use (Adobe twice, Microsoft twice, Salesforce,
// Apple), four are marks that exist and cannot survive 16 px (ada, agda, ahk2,
// apl), one was failed by the twin audit after being built (antlr) and two own no
// mark at all. None of them is a shrug: every one carries its measurement.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { subpaths, bbox, xform, ellipse } from '../pathkit.mjs';
import { genericCode, noteGlyph, roundPoly } from '../geom.mjs';
import { NEUTRAL, WHITE, lift } from '../color.mjs';
import { officialShapes, icon, ENV, SRCDIR } from '../spec-engine.mjs';

const S = {};

// The generic-code glyph is authored 11.2 x 9.8 in geom.mjs and THIRTEEN concepts
// in this tranche share it, so it is the one payload that has to hold its weight in a
// row: fitted 1:1 it carries an ink mass of 110 against the set's ~148. It is
// therefore placed at 1.16x, which lands it on 13.0 x 11.4 (mass 148) with 2.2 px
// stems — the same move tranche 1 made on the generic-binary block (authored 11.4,
// shipped 12.2).
const CODE_ENV = { w: 13, h: 11.4 };

// =============================================================================
// local helpers — nothing here is shared, so nothing here can move a pilot byte
// =============================================================================

/**
 * WORKING RULE 2, category glyph. Thirteen concepts in this tranche end up here
 * and they must be byte-identical, so they go through one factory rather than
 * thirteen copies of the same three lines. `why` is the concept's own hunt result
 * and is what lands on the sheet.
 */
const codeGlyph = (title, why) => ({
	title: `${title} (neutral glyph)`,
	brand: NEUTRAL,
	neutral: true,
	env: CODE_ENV,
	source: {
		name: 'none used — neutral glyph vocabulary (category: code)', slug: null,
		license: null, url: null, note: why
	},
	simplifications: [],
	parts() { return genericCode().map(d => ({ d, fill: NEUTRAL })); }
});

/**
 * A stroked contour turned into a filled one. Used twice, both times on a brand
 * file that draws its mark with `stroke` (L8 bans strokes, so the outline has to
 * become ink). For a CIRCLE this is exact — a stroke of width t around radius r
 * is the annulus r±t/2. For a TRIANGLE it is exact too: offsetting every edge by
 * t/2 gives a similar triangle scaled about the incentre, so the vertices, the
 * angles and the centre all stay exactly where the file puts them.
 */
const strokedCircle = (cx, cy, r, t) =>
	ellipse(cx, cy, r + t / 2, r + t / 2, true) + ellipse(cx, cy, r - t / 2, r - t / 2, false);

const strokedTriangle = (pts, t, join = 0) => {
	const d = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
	const [A, B, C] = pts;
	const a = d(B, C), b = d(C, A), c = d(A, B), per = a + b + c;
	const ix = (a * A[0] + b * B[0] + c * C[0]) / per;
	const iy = (a * A[1] + b * B[1] + c * C[1]) / per;
	const area = Math.abs((B[0] - A[0]) * (C[1] - A[1]) - (C[0] - A[0]) * (B[1] - A[1])) / 2;
	const inr = area / (per / 2);   // inradius = area / semiperimeter
	const at = (k) => pts.map(([x, y]) => [ix + (x - ix) * k, iy + (y - iy) * k]);
	return roundPoly(at((inr + t / 2) / inr), join)
		+ roundPoly(at((inr - t / 2) / inr).reverse(), Math.max(0, join - t / 2));
};

/** Scale one subpath about its own bbox centre — the onnx move, reused twice. */
const shrink = (d, k) => {
	const b = bbox(d);
	return xform(d, { sx: k, dx: b.cx * (1 - k), dy: b.cy * (1 - k) });
};

/** A thick bar between two points — the prettier rider's rebuild, apib's connectors. */
const bar = (p, q, t) => {
	const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy);
	const nx = -dy / L * t / 2, ny = dx / L * t / 2;
	return roundPoly([
		[p[0] + nx, p[1] + ny], [q[0] + nx, q[1] + ny],
		[q[0] - nx, q[1] - ny], [p[0] - nx, p[1] - ny]
	], t / 2);
};

/** The offset-1 stop of a gradient layer — the flattening chrome ratified. */
const flat = (s) => s.fill || s.gradient[s.gradient.length - 1].color;

// =============================================================================
// abap — SAP
// =============================================================================
// ABAP is SAP's own language and .abap/.acds/.asddls files exist nowhere but
// inside a SAP system, so the SAP mark is the one that honestly applies (the
// AdvPL/TOTVS reading below, and the opposite of tranche 1's safetensors call).
//
// Sourcing: SAP publishes its own vector — sap-logo-svg.svg, a 412x204 file whose
// field is a <polyline> painted with a five-stop vertical gradient and whose
// "SAP" is a white path. It is fetched to sources-svg/ and is what the fidelity
// strip shows. It is NOT the shipped geometry: the field is a polyline, which is
// not a path, and rebuilding it would mean transcribing the brand's coordinates
// by hand. simple-icons carries `sap` (CC0) — the same parallelogram with the
// same letters knocked out of it as counters — so L2's second tier ships.
//
// What L5 says, MEASURED off the 16 px render rather than estimated (the letters'
// sustained ink runs on a 4x mask of the shipped icon): the "SAP" stems land on
// 1.00-1.25 px, i.e. AT L5's official-forced 1.2 px floor rather than under it,
// and white-on-blue is the highest-contrast pairing in the tranche. So no
// reduction is required and none is made; the lockup ships whole, and the 16 px
// verdict below records that it really does read.
S.abap = {
	title: 'ABAP (SAP)',
	brand: '#0FAAFF',
	env: ENV.flat,
	plate: true,   // an official FIELD carrying a glyph (R8 lane, see audit.mjs)
	source: {
		name: 'simple-icons', slug: 'sap', license: 'CC0-1.0',
		url: 'https://www.sap.com/dam/application/shared/logos/sap-logo-svg.svg',
		artwork: 'sap-official.svg',
		note: 'the parallelogram field with "SAP" knocked out of it as counters — one path, '
			+ '4 subpaths. SAP\'s own file is fetched to sources-svg/sap-official.svg for the '
			+ 'fidelity strip but is not the shipped geometry: it paints the field with a '
			+ '<polyline> under a five-stop gradient (#00B1EB -> #0069B4), and a polyline is not '
			+ 'a path. brand-colors.json has no SAP entry, so simple-icons\' #0FAAFF stands'
	},
	simplifications: [
		'the field\'s five-stop vertical gradient (#00B1EB / #009AD9 / #007FC4 / #006EB8 / '
		+ '#0069B4 in SAP\'s own file) is not carried: the CC0 trace records SAP blue as one '
		+ 'flat #0FAAFF and that is what ships, which sits above the gradient\'s own range so '
		+ 'the mark clears the #121314 backdrop',
		'NOT reduced, and measured so it can be ruled on: at the flat envelope the "SAP" letter '
		+ 'stems measure 1.00-1.25 px — AT L5\'s official-forced 1.2 px floor, not under it — and '
		+ 'they print white on the mark\'s own blue field, which is the highest-contrast pairing '
		+ 'in the tranche. dotenv needed the rider at 0.50 px; this does not, and the 16 px proof '
		+ 'agrees'
	],
	parts() {
		const sp = subpaths(icon('sap').path);
		return [
			{ d: sp[0], fill: '#0FAAFF' },                     // the parallelogram field
			{ d: sp.slice(1).join(''), fill: WHITE }           // S, A, P and their counters
		];
	}
};

// =============================================================================
// abc — ABC music notation
// =============================================================================
// RULE 2, object metaphor. `.abc` is ABC notation: plain-text sheet music. No
// brand owns it (the format is a 1990s community standard), Material draws a
// treble clef and vscode-icons draws nothing. The object the concept names is a
// NOTE, so it gets one — the third object glyph in the set's vocabulary, two
// sub-shapes, authored in geom.mjs as noteGlyph().
S.abc = {
	title: 'ABC music notation (neutral glyph)',
	brand: NEUTRAL,
	neutral: true,
	env: { w: 10.9, h: 13.2 },
	source: {
		name: 'none — neutral glyph vocabulary', slug: null, license: null, url: null,
		note: 'ABC notation is a community text format with no brand and no mark; the musical '
			+ 'note is a new object glyph in the set\'s own vocabulary (working rule 2), authored '
			+ 'in geom.mjs as noteGlyph(). Material independently reaches for the same metaphor '
			+ 'and draws a treble clef, which is far past the vocabulary\'s two-sub-shape budget'
	},
	simplifications: [],
	parts() { return noteGlyph().map(d => ({ d, fill: NEUTRAL })); }
};

// =============================================================================
// abelljs — Abell
// =============================================================================
// Abell publishes its own mark: abelljs/abell holds branding/abell-logo.svg under
// the repo's MIT licence — the two-tone spiral with three dots climbing away from
// it. Brand tier, first try. Great Icons traces the same drawing, which is the
// corroboration L2 likes and not the source.
//
// The file paints through a <style> block whose classes carry BOTH a fill and a
// same-coloured 16-unit stroke (paint-order: stroke fill), i.e. an 8/512 outward
// swell. L8 bans strokes, so the fill contours ship on their own; at this
// envelope that is 0.20 px thinner per edge and nothing else changes.
S.abelljs = {
	title: 'Abell',
	brand: '#4D6BF3',
	env: ENV.compact,
	source: {
		name: 'Abell (brand\'s own SVG)', slug: 'abell', license: 'MIT (abelljs/abell)',
		url: 'https://github.com/abelljs/abell/blob/main/branding/abell-logo.svg',
		artwork: 'abell-official.svg',
		note: '512x512, three painted layers: the outer spiral #4D6BF3, the inner spiral '
			+ '#0A30E0 and the three #0A30E0 dots. Colours read from the file\'s own <style> '
			+ 'classes .a/.b/.c. Great Icons draws the same mark, which corroborates the source '
			+ 'without being it'
	},
	simplifications: [
		'the file\'s 16-unit strokes are dropped and the fill contours ship alone (L8 bans '
		+ 'strokes): the file paints each spiral with a stroke of its own fill colour under '
		+ 'paint-order "stroke fill", an 8/512 outward swell that measures 0.20 px at this '
		+ 'envelope'
	],
	parts() {
		const sh = officialShapes('abell-official.svg');
		return [
			{ d: sh[0].d, fill: '#4D6BF3' },
			{ d: sh[1].d + sh[2].d, fill: '#0A30E0' }
		];
	}
};

// =============================================================================
// actionscript + adobe-swc — Adobe
// =============================================================================
// REBUILT IN THE FIX ROUND (2026-09-03). Flag 13 declined both on the one testable
// rule it drew — absence from simple-icons as evidence of a trademark removal — and
// the ruling voids the whole rule, because trademark no longer gates sourcing.
//
// WHICH Adobe mark. ActionScript is Adobe's language and a .swc is a Flash/Flex
// component library, so the mark that applies is Adobe's own. Three candidates were
// looked at and the choice is not close: the Adobe CORPORATE mark — the red "A"
// built from three triangles — is a symbol, renders at any size, and covers both
// file types; Adobe Animate's and the retired Flash Professional's icons are
// LETTER PLATES ("An", "Fl"), which is a monogram in a box and the thing R1's
// letter ban exists to keep out; and ActionScript itself has never had a mark.
//
// SOURCING, by fidelity: Adobe serves no logo vector from adobe.com under any path
// that answers, so the geometry is gilbarbara/logos' faithful vector of the
// corporate mark — one path, three subpaths, #FA0F00, and the same drawing Adobe
// prints everywhere. Licence: that repository declares none. Recorded, not gating.
//
// Measured at the wide envelope: ink runs 1.38 px at the 25th percentile and 2.38
// at the median, with the A's counter open at 3.00 px. The thin places are the
// three apex tips, which is the drawing.
//
// WORKING RULE 1: a .swc is a COMPILED LIBRARY OF ACTIONSCRIPT CLASSES — the same
// family, one step down the toolchain — and Adobe publishes no distinct .swc glyph
// for branch (a) to adapt, so branch (b) fires and adobe-swc ships the base mark
// byte-identically under its own id.
const ADOBE_SRC = {
	name: 'Adobe (faithful vector — gilbarbara/logos)', slug: 'adobe',
	license: 'no declared licence — gilbarbara/logos ships no LICENSE file, and the mark is an '
		+ 'Adobe trademark. Recorded and NOT gating, per the fix-round ruling (the chrome '
		+ 'situation, ruled)',
	url: 'https://github.com/gilbarbara/logos/blob/main/logos/adobe-icon.svg',
	artwork: 'adobe-official.svg',
	note: '256x227, one path in #FA0F00 with 3 subpaths: the two outer strokes of the "A" and '
		+ 'the crossbar wedge, with the counter between them. Adobe serves no logo vector from '
		+ 'adobe.com under any path that answers, and simple-icons carries no Adobe entry, so '
		+ 'this is the faithful-vector tier. Adobe Animate\'s and Flash Professional\'s icons '
		+ 'were looked at and rejected: both are LETTER PLATES ("An", "Fl"), which is a monogram '
		+ 'in a box. Fetched to sources-svg/adobe-official.svg'
};
S.actionscript = {
	title: 'ActionScript (Adobe)',
	brand: '#FA0F00',
	env: ENV.wide,
	source: { ...ADOBE_SRC },
	simplifications: [
		'NOT reduced, and measured: at the wide envelope the mark\'s ink runs are 1.38 px at the '
		+ '25th percentile and 2.38 px at the median, with the A\'s counter 3.00 px across. The '
		+ 'thin places are the three apex tips, which is how Adobe draws the mark'
	],
	parts() {
		return [{ d: officialShapes('adobe-official.svg')[0].d, fill: '#FA0F00' }];
	}
};
// WORKING RULE 1(b): .swc is ActionScript compiled, so it is the same Adobe family;
// Adobe publishes no distinct .swc glyph, so the variant ships the base identically.
S['adobe-swc'] = {
	title: 'Adobe SWC (ActionScript library)',
	brand: '#FA0F00',
	env: ENV.wide,
	family: { name: 'adobe', base: 'actionscript', from: 'A01', mode: 'identical' },
	source: { ...ADOBE_SRC },
	simplifications: [
		...S.actionscript.simplifications,
		'WORKING RULE 1(b): a .swc is a compiled library of ActionScript classes — the same Adobe '
		+ 'family one step down the toolchain — and neither Adobe nor any source theme draws a '
		+ 'distinct non-letter .swc glyph (Material invents a red tile with a squiggle). So there '
		+ 'is nothing for branch (a) to adapt and adobe-swc ships the family base mark '
		+ 'byte-identically under its own id',
		'note for anyone re-hunting this: simple-icons DOES carry a slug `swc`, and it is SWC the '
		+ 'Rust JavaScript compiler — an unrelated brand, deliberately not used'
	],
	parts() { return S.actionscript.parts(); }
};

// =============================================================================
// ada — the Ada programming language
// =============================================================================
// RULE 2, and this one hurts, because the mark is real and cleanly licensed.
// ada-lang.io's logo is a LOGOTYPE: the word "Ada" in a custom face with a swoosh
// under it, and simple-icons carries a CC0 trace of it (one path, 5 subpaths —
// the wordmark contour plus the counters of a, d and a).
//
// Measured: the mark is 24 x 10.3 in source units, so the flat envelope — the
// widest fit the 16-grid allows — puts the whole logotype at 15.2 x 6.5 px, and
// the sustained ink runs of the letters themselves come back at 0.50-1.00 px.
// Three letters at 4 px of cap height is the npm-wordmark case (0.97 px stems,
// rejected in the pilot in favour of npm's own square mark) — except Ada
// publishes no square mark to fall back to, and the prettier rider's reduction
// would leave a bare "A", which is a letter and not a mark.
//
// Material draws a bird and vscode-icons draws a wing; neither traces anything
// Ada publishes, so neither is a tier-3 source.
S.ada = codeGlyph('Ada',
	'a real mark exists (ada-lang.io\'s "Ada" logotype, traced CC0 by simple-icons as slug '
	+ '`ada`) and cannot survive 16 px: at the flat envelope — the widest fit the grid allows — '
	+ 'the whole logotype is 15.2 x 6.5 px and the letters\' sustained ink runs measure '
	+ '0.50-1.00 px against L5\'s 1.2 px official-forced floor. Reducing it to one letter leaves '
	+ 'an "A", not a mark. '
	+ 'Material draws a bird and vscode-icons a wing; neither traces anything Ada publishes. '
	+ 'Ruling requested — see the flags');

// =============================================================================
// adonis — AdonisJS
// =============================================================================
// AdonisJS's mark is a rounded-square field with the "A" arrow knocked out of it.
// adonisjs.com serves its assets through a bundler and exposes no stable SVG URL
// (every guessed path answers 404), so L2's second tier ships: simple-icons'
// `adonisjs`, sourced from adonisjs.com, in the official #5A45FF. Material draws
// the same A in its own violet and without the field.
S.adonis = {
	title: 'AdonisJS',
	brand: '#5A45FF',
	env: ENV.compact,
	plate: true,
	source: {
		name: 'simple-icons', slug: 'adonisjs', license: 'CC0-1.0',
		url: 'https://adonisjs.com',
		note: 'the rounded-square field with the arrow "A" as a counter — one path, 3 subpaths. '
			+ 'The brand\'s own site serves bundled assets with no stable SVG URL, so the CC0 '
			+ 'trace is the source'
	},
	simplifications: [],
	parts() {
		const sp = subpaths(icon('adonisjs').path);
		return [
			{ d: sp[0], fill: '#5A45FF' },                 // the field
			{ d: sp[1] + sp[2], fill: WHITE }              // the A and its counter, knocked out
		];
	}
};

// =============================================================================
// advpl + advpl-include + advpl-ptm + advpl-tlpp — TOTVS
// =============================================================================
// The best-sourced family in the slice, and the one that decides how working
// rule 1 behaves when the BRAND, not a theme, draws the variants.
//
// AdvPL is TOTVS's language and .prw/.ch/.ptm/.tlpp files exist only inside
// TOTVS Protheus. TOTVS ships its own VS Code extension — github.com/totvs/
// advpl-vscode, MIT — and that repo carries images/icons/icon_advpl.svg,
// icon_include.svg, icon_ptm.svg and icon_tlpp.svg: the TOTVS symbol (the disc
// with the two stepped counters, the same mark simple-icons records as `totvs`)
// in FOUR colours, one per file type.
//
// So the variants are not a theme's invention and not letters: they are the
// brand's own artwork, and R1's "official colours verbatim" means each one ships
// the colour TOTVS gives it. The family is declared with mode `recolour` — one
// geometry, four official hexes — which is the first time rule 1 has had a case
// that is neither branch (a) nor branch (b). Byte-identity is NOT expected here
// and the twin audit's family lane says so.
//
// Each variant reads its OWN file rather than sharing one, so the provenance is
// per-subject and a colour cannot drift from the file it came from.
const TOTVS_ICONS = 'https://github.com/totvs/advpl-vscode/blob/master/images/icons';
const advpl = (title, fill, file, brandFile, isBase = false) => ({
	title,
	brand: fill,
	env: ENV.compact,
	...(isBase ? {} : { family: { name: 'advpl', base: 'advpl', from: 'A01', mode: 'recolour' } }),
	source: {
		name: 'TOTVS (brand\'s own SVG)', slug: 'advpl', license: 'MIT (totvs/advpl-vscode)',
		url: `${TOTVS_ICONS}/${brandFile}`,
		artwork: file,
		note: `the TOTVS symbol — a disc with two stepped counters, one path, 3 subpaths, in ${fill}. `
			+ 'TOTVS publishes one file per AdvPL file type in its own VS Code extension and the '
			+ 'four differ ONLY in fill, so the colour here is the brand\'s and not a theme\'s. '
			+ 'simple-icons records the same symbol as slug `totvs`'
	},
	simplifications: [],
	parts() {
		const sh = officialShapes(file);
		return [{ d: sh[0].d, fill }];
	}
});
S.advpl = advpl('AdvPL', '#337AB7', 'advpl-official.svg', 'icon_advpl.svg', true);
S['advpl-include'] = advpl('AdvPL include', '#33B7B6', 'advpl-include-official.svg', 'icon_include.svg');
S['advpl-ptm'] = advpl('AdvPL PTM', '#B73733', 'advpl-ptm-official.svg', 'icon_ptm.svg');
S['advpl-tlpp'] = advpl('AdvPL TLPP', '#B7AC33', 'advpl-tlpp-official.svg', 'icon_tlpp.svg');

// =============================================================================
// affectscript
// =============================================================================
// RULE 2, and the shortest hunt in the tranche. AffectScript (.affect) publishes
// nothing: no site, no repo artwork, no simple-icons entry. vscode-icons draws it
// by embedding a base64 PNG inside a clip-path — not a vector at all, and not
// something L2 can adapt.
S.affectscript = codeGlyph('AffectScript',
	'no mark exists: AffectScript publishes no artwork and simple-icons has no entry. '
	+ 'vscode-icons draws the concept by embedding a base64 PNG inside a clip-path, which is not '
	+ 'a vector and cannot be adapted under L2');

// =============================================================================
// affinity + affinitypublisher — Serif / Canva
// =============================================================================
// Affinity publishes its own mark and serves it as a plain SVG:
// affinity.serif.com/favicon.svg — the #A7F175 rounded field with the black "a"
// swirl knocked across it. Brand tier, and the same drawing vscode-icons traces.
//
// Licence, honestly: Serif declares none and the mark is a trademark. That is the
// chrome situation from tranche 1 — an official file, published by the brand, for
// the brand's own file types, with no citable terms. Flagged, not buried.
//
// The black swirl prints on the mark's OWN pale-green field and never meets the
// backdrop, so the pilot's lift erratum keeps it black (the dotenv reading).
S.affinity = {
	title: 'Affinity',
	brand: '#A7F175',
	env: ENV.compact,
	plate: true,
	source: {
		name: 'Affinity (brand\'s own SVG)', slug: 'affinity',
		license: 'no declared licence — Serif/Canva trademark, used as the brand\'s own mark for '
			+ 'the brand\'s own file types (chrome precedent; see the flags)',
		url: 'https://affinity.serif.com/favicon.svg',
		artwork: 'affinity-official.svg',
		note: '192x192, two painted layers: the #A7F175 rounded field and the #211D1D "a" swirl. '
			+ 'vscode-icons traces the same drawing. Fetched to sources-svg/affinity-official.svg'
	},
	simplifications: [
		'the field path\'s transform is baked into its coordinates (a format conversion, not a '
		+ 'redraw); nothing else is changed',
		'the #211D1D swirl is NOT lifted: it prints on the mark\'s own pale-green field and never '
		+ 'meets the #121314 backdrop (the pilot\'s lift erratum, dotenv precedent)'
	],
	parts() {
		const sh = officialShapes('affinity-official.svg');
		return [{ d: sh[0].d, fill: '#A7F175' }, { d: sh[1].d, fill: '#211D1D' }];
	}
};

// WORKING RULE 1, branch (b). .afpub is an Affinity Publisher document. Publisher
// had its own app icon in the Affinity 2 suite — the red "canyon" illustration
// vscode-icons still traces — but Serif/Canva retired the three per-app icons
// when Affinity became one application in 2025, and the mark the brand publishes
// for .afpub today is the Affinity mark itself. The retired icon would not have
// survived anyway: it is an eleven-layer gradient illustration, and R1 flattening
// it leaves a red triangle, which is the exact gestalt failure the pilot gate
// rejected on docker and editorconfig. So the variant ships the family base
// byte-identically under its own id.
S.affinitypublisher = {
	title: 'Affinity Publisher',
	brand: '#A7F175',
	env: ENV.compact,
	plate: true,
	family: { name: 'affinity', base: 'affinity', from: 'A01', mode: 'identical' },
	source: { ...S.affinity.source },
	simplifications: [
		...S.affinity.simplifications,
		'WORKING RULE 1(b): the distinct Affinity Publisher 2 app icon was retired when Affinity '
		+ 'became one application, and it is an eleven-layer gradient illustration that R1 would '
		+ 'flatten to a red triangle. So affinitypublisher ships the family base mark '
		+ 'byte-identically under its own id rather than reviving a retired mark or inventing a '
		+ 'recolour the brand does not publish'
	],
	parts() { return S.affinity.parts(); }
};

// =============================================================================
// agda
// =============================================================================
// RULE 2 after the hardest measurement in the tranche. Agda's logo is real, is
// published by the project itself (agda/agda, doc/user-manual/agda.svg) and is a
// bird — but it is a bird made ENTIRELY of strokes: two 27-unit eye discs and six
// polylines at stroke-width 36 on a mark 1200 x 1000 units wide.
//
//   · at the compact envelope that stroke is 0.37 px. L8 bans strokes outright,
//     so shipping it means synthesising fills from centrelines — legal only as a
//     prettier-rider thickening, which here is a 3.2x widening;
//   · the head strokes are parallel diagonals 100 units apart, which is 0.73 px
//     of PERPENDICULAR clearance at the fit, so a stroke thickened to the 1.2 px
//     floor FUSES them into one wedge and the bird loses its head;
//   · the body outline is open (it starts and ends in mid-air), so it cannot be
//     filled as a silhouette without inventing the closure.
//
// Every reduction available either leaves 0.38 px linework or destroys the bird.
// The study proofs/agda-and-friends-study.png renders all of them at 16 px next
// to what ships. Flagged.
S.agda = codeGlyph('Agda',
	'a real mark exists (agda/agda\'s own doc/user-manual/agda.svg — the bird) and cannot survive '
	+ '16 px: it is drawn entirely with strokes, 36 units on a 1200-unit mark, i.e. 0.37 px at the '
	+ 'compact envelope, and L8 bans strokes. Thickening it to L5\'s 1.2 px floor fuses the three '
	+ 'head strokes, which have 0.73 px of perpendicular clearance, into one wedge; its body '
	+ 'outline is open and cannot '
	+ 'be filled without inventing the closure. Measured alternatives are rendered in '
	+ 'proofs/agda-and-friends-study.png. Ruling requested — see the flags');

// =============================================================================
// ahk2 — AutoHotkey v2
// =============================================================================
// RULE 2 on legibility AND on contrast, with the family declared anyway so
// tranche 3 inherits the finding rather than re-doing it.
//
// AutoHotkey's mark is a KEYCAP with "AHK" set inside it — autohotkey.com's own
// ahk_logo.svg draws exactly that (as a wordmark lockup), and simple-icons
// carries the CC0 trace, `autohotkey`, at the brand's #334455. Two independent
// failures:
//
//   · LEGIBILITY. The trace is an OUTLINE box (24.0 x 23.0 outer, 20.4 x 19.9
//     counter) with three letters 5.0 units tall inside it. Measured on the 16 px
//     render, NOTHING in the mark exceeds 0.50 px of sustained ink: keycap wall
//     and letter stems alike come back at 0.25-0.50 px. The rider's move — drop
//     letters, thicken the survivor — leaves a rounded box.
//   · CONTRAST. #334455 measures 1.86:1 against the #121314 editor ground. L5's
//     contrast duty is a "comfortable margin"; this is not one. The L2 lift only
//     fires below L 22 and #334455 sits at L 26.7, so the rule does not rescue it
//     and inventing a brighter AutoHotkey blue is not R1's to do.
//
// Both numbers are on the sheet, and the mark itself is rendered next to the
// neutral glyph in the study so the call can be checked.
S.ahk2 = codeGlyph('AutoHotkey v2',
	'a real mark exists (AutoHotkey\'s "AHK" keycap — autohotkey.com ships ahk_logo.svg and '
	+ 'simple-icons traces it CC0 as `autohotkey`) and fails twice at 16 px: at the compact '
	+ 'envelope NOTHING in it exceeds 0.50 px of sustained ink — outline wall and letter stems '
	+ 'both measure 0.25-0.50 px — and the official #334455 measures 1.86:1 against the '
	+ '#121314 editor ground. FIX ROUND: the lift '
	+ 'rule\'s trigger was re-derived to test contrast at 3.0:1 rather than lightness at L 22, so '
	+ 'the contrast objection is now solved and it changes nothing — the study already rendered '
	+ 'the mark with its ink lifted and it is exactly as illegible. Rendered next to the shipped '
	+ 'glyph in proofs/agda-and-friends-study.png. NO family is declared for it — see the flags. '
	+ 'Ruling requested');

// =============================================================================
// al + al-dal — Microsoft Dynamics 365 Business Central
// =============================================================================
// REBUILT IN THE FIX ROUND (2026-09-03), and the hunt turned up something better
// than a licence answer: MICROSOFT DRAWS THIS ICON ITSELF.
//
// Flag 13 declined al on the vsix precedent and noted that "vscode-icons draws an
// 'AL' monogram, which R1 has no place for". That reading was wrong twice over.
// Microsoft's own AL Language extension for Dynamics 365 Business Central
// (ms-dynamics-smb.al, the extension every .al file is edited with) ships
// img/AL_file_logo.svg — titled, in the file, "AL logo_VS_smallest version_v3" —
// and registers it in its own file-icon theme as the icon for the `al` language id.
// So the AL monogram is not vscode-icons' invention: vscode-icons is TRACING this
// file, down to the #2EA98E. It is the brand's own mark for the brand's own file
// type, and it is a faithful letterform lockup exactly as SAP's "SAP" and
// TypeScript's "TS" are — L3's typeset-letter ban does not reach source geometry.
//
// Measured at the flat envelope: the letter stems run 1.63 px at the 5th percentile
// and 1.81 px at the median — comfortably over L5's floor and half again thicker
// than abap's SAP letters, which the gate already passed at 1.00-1.25 px.
//
// WORKING RULE 1(b) for al-dal: a .dal is a Business Central delta/table file and
// Microsoft ships one AL icon for the language, not two. vscode-icons differentiates
// al-dal only by recolouring the same monogram dusty red, which is its own invention
// and not a variant glyph, so branch (a) has nothing to adapt and the variant ships
// the base byte-identically.
const AL_SRC = {
	name: 'AL Language for Dynamics 365 Business Central (Microsoft\'s own SVG)', slug: 'al',
	license: 'Microsoft Software License Terms (the ms-dynamics-smb.al extension EULA, '
		+ 'go.microsoft.com/fwlink/?linkid=852321). Recorded and NOT gating, per the fix-round '
		+ 'ruling',
	url: 'https://marketplace.visualstudio.com/items?itemName=ms-dynamics-smb.al',
	artwork: 'al-microsoft.svg',
	note: '255x255, two paths in #2EA98E: the "A" (outer contour plus its counter) and the "L". '
		+ 'The file is titled "AL logo_VS_smallest version_v3" and the extension\'s own '
		+ 'file-icons/al-icon-theme.json registers it as the icon for the `al` language id, so '
		+ 'this is Microsoft\'s mark for Microsoft\'s file type. vscode-icons\' file_type_al.svg '
		+ 'is a trace of THIS file, same drawing and same hex — which is why tranche 2 read it '
		+ 'as an invented monogram and was wrong. Extracted from the extension package and kept '
		+ 'at sources-svg/al-microsoft.svg'
};
S.al = {
	title: 'AL (Business Central)',
	brand: '#2EA98E',
	env: ENV.flat,
	source: { ...AL_SRC },
	simplifications: [
		'NOT reduced, and measured so it can be ruled on: at the flat envelope the letter stems '
		+ 'run 1.63 px at the 5th percentile and 1.81 px at the median — over L5\'s 1.2 px '
		+ 'official-forced floor, and half again thicker than abap\'s SAP letters, which the gate '
		+ 'passed at 1.00-1.25 px. The letterforms are Microsoft\'s own source geometry, so L3\'s '
		+ 'typeset-letter ban does not apply (the abap / typescript reading)'
	],
	parts() {
		return officialShapes('al-microsoft.svg').map(s => ({ d: s.d, fill: '#2EA98E' }));
	}
};
S['al-dal'] = {
	title: 'AL DAL (Business Central)',
	brand: '#2EA98E',
	env: ENV.flat,
	family: { name: 'al', base: 'al', from: 'A01', mode: 'identical' },
	source: { ...AL_SRC },
	simplifications: [
		...S.al.simplifications,
		'WORKING RULE 1(b): Microsoft ships ONE AL icon for the language and registers it against '
		+ 'the `al` language id, not one per file type; vscode-icons differentiates al-dal only by '
		+ 'recolouring the same monogram dusty red, which is its own invention and not a variant '
		+ 'glyph. So branch (a) has nothing to adapt and al-dal ships the family base mark '
		+ 'byte-identically under its own id'
	],
	parts() { return S.al.parts(); }
};

// =============================================================================
// alchemy — alchemy.run
// =============================================================================
// The roster's `alchemy` matches alchemy.run.ts / .js / .mjs / .mts, which is
// Alchemy the infrastructure-as-code tool (alchemy.run, Apache-2.0), NOT
// alchemy.com the web3 API company — simple-icons' `alchemy` is the latter and
// using it here would be a false mark. vscode-icons draws a potion bottle, an
// invented metaphor for a brand that owns a mark.
//
// alchemy.run serves its own mark at /favicon.svg: a circle, an inscribed
// triangle and a centre dot. Two of those three are STROKED, so L8 forces the
// stroke-to-fill conversion, and the conversion is exact rather than a redraw: a
// stroked circle is the annulus r ± t/2, and offsetting a triangle's edges gives
// a similar triangle about its incentre, so every vertex and angle stays put.
//
// The official stroke is 1.4 on a 20.4 viewBox = 0.89 px at this envelope, under
// the 1.2 px floor, so the prettier rider fires and t rises to 1.88 source units
// (1.20 px). The dot keeps its official radius.
//
// Colour: the file declares TWO palettes in its own <style> — a light one
// (#3F5A2A ink, #9A4F27 dot) and, under prefers-color-scheme: dark, #A3C473 ink
// and #D8835A dot. The product backdrop IS dark, so the brand's own dark palette
// is the official colour here; the light pair measures 1.9:1 on #121314.
const ALCHEMY_T = 2.0;
S.alchemy = {
	title: 'Alchemy',
	brand: '#A3C473',
	env: { w: 13.2, h: 13.2 },
	source: {
		name: 'Alchemy (brand\'s own SVG)', slug: 'alchemy',
		license: 'Apache-2.0 (alchemy-run/alchemy-async)',
		url: 'https://alchemy.run/favicon.svg',
		artwork: 'alchemy-official.svg',
		note: 'circle r 9.5, inscribed equilateral triangle and a centre dot r 1.1 on a 20.4 '
			+ 'viewBox; circle and triangle are STROKED at 1.4 with round joins. The file carries '
			+ 'its own dark-scheme palette (#A3C473 ink, #D8835A dot), which is the one that '
			+ 'applies on the #121314 ground. NOT simple-icons\' `alchemy`, which is alchemy.com, '
			+ 'a different company'
	},
	simplifications: [
		'STROKE TO FILL (L8 bans strokes). The conversion is exact, not a redraw: a stroke of '
		+ 'width t around radius r is the annulus r +/- t/2, and offsetting a triangle\'s three '
		+ 'edges by t/2 produces a similar triangle scaled about its incentre — every vertex, '
		+ 'angle and centre stays exactly where the file puts it',
		`PRETTIER RIDER: the official 1.4-unit stroke measures 0.90 px at this envelope, so t is `
		+ `raised to ${ALCHEMY_T} source units, which lands the line on 1.23 px — over L5's `
		+ 'official-forced 1.2 px floor. The thicker line also grows the mark, so the fit scale '
		+ 'drops from 0.644 to 0.617 and 1.23 px is the number measured after that. Nothing moves; '
		+ 'the line gets thicker',
		'the brand\'s own DARK-scheme palette ships (#A3C473 ink, #D8835A dot) rather than its '
		+ 'light one (#3F5A2A / #9A4F27, which measures 1.9:1 on #121314) — both are in the file, '
		+ 'and the product backdrop is dark',
		'the round line-joins at the triangle\'s three corners are kept as corner radii on the '
		+ 'offset contours'
	],
	parts() {
		return [
			{ d: strokedCircle(12, 12, 9.5, ALCHEMY_T), fill: '#A3C473' },
			{
				d: strokedTriangle([[12, 21.15], [4.0759, 7.425], [19.9241, 7.425]], ALCHEMY_T, 0.9),
				fill: '#A3C473'
			},
			{ d: ellipse(12, 12, 1.1, 1.1, true), fill: '#D8835A' }
		];
	}
};

// =============================================================================
// alloy — Grafana Alloy
// =============================================================================
// grafana.com publishes the Alloy mark on its own: media/oss/alloy/alloy-logo.svg,
// one path in #FD6F00 — the coiled spiral, outer contour plus two counters.
// Nothing to simplify and nothing to flatten.
//
// Colour note: brand-colors.json records GRAFANA as #F46800; Alloy is a different
// product with its own hex and the artwork's own #FD6F00 is what ships (there is
// no brand-colors entry for alloy, so the source-of-truth rule never fires).
S.alloy = {
	title: 'Grafana Alloy',
	brand: '#FD6F00',
	env: ENV.compact,
	source: {
		name: 'Grafana Alloy (brand\'s own SVG)', slug: 'alloy',
		license: 'no declared licence on the media asset — Grafana Labs trademark; the project '
			+ 'itself (grafana/alloy) is Apache-2.0 (chrome precedent; see the flags)',
		url: 'https://grafana.com/media/oss/alloy/alloy-logo.svg',
		artwork: 'alloy-official.svg',
		note: '44x44, one path in #FD6F00: the spiral\'s outer contour and its two counters. '
			+ 'vscode-icons traces the same drawing in #FF671D and Material in #FF6F00, which '
			+ 'corroborates the source. brand-colors.json records Grafana as #F46800 but has no '
			+ 'entry for Alloy, which is its own product with its own hex'
	},
	simplifications: [],
	parts() {
		return [{ d: officialShapes('alloy-official.svg')[0].d, fill: '#FD6F00' }];
	}
};

// =============================================================================
// allure — Allure Report
// =============================================================================
// allurereport.org publishes the sign on its own: svg/logo-report-sign.svg, six
// painted arcs that together make a broken ring plus the bar that drops off its
// right side. Every arc is painted with a two-stop linear gradient, so L2's
// flattening applies and chrome's ratified reading — the offset-1 stop of each —
// is what ships.
//
// The file also carries a seventh path: the purple arc drawn a second time inside
// a clip-path so the top-right corner darkens where two arcs overlap. That is a
// gradient-blending device, not a shape, and it is dropped.
//
// Six arcs is past L5's ~3 sub-shape budget on paper. They are not read as six:
// they abut into one ring, which is the docker erratum's case (sub-shapes the
// official mark effectively merges may fuse). What the eye gets at 16 px is a
// four-colour ring, and the 16 px verdict below says so.
S.allure = {
	title: 'Allure Report',
	brand: '#22C55E',
	env: ENV.compact,
	source: {
		name: 'Allure Report (brand\'s own SVG)', slug: 'allure',
		license: 'no declared licence on the site asset — Qameta Software trademark; the project '
			+ '(allure-framework/allure2, allure3) is Apache-2.0 (chrome precedent)',
		url: 'https://allurereport.org/svg/logo-report-sign.svg',
		artwork: 'allure-official.svg',
		note: '32x32, six gradient-painted arcs forming the broken ring plus its right-hand bar, '
			+ 'and a seventh path that redraws one arc inside a clip-path to darken an overlap. '
			+ 'vscode-icons traces the same file at 0.8 scale'
	},
	simplifications: [
		'each arc\'s two-stop gradient flattened to its dominant flat stop — the offset-1 stop, '
		+ 'the reading chrome ratified: #8B5CF6 violet, #DC2626 red, #15803D green, #64748B '
		+ 'slate, #FBBF24 amber (twice). Here "dominant" is not just precedent but geometry: every '
		+ 'one of these gradients is userSpaceOnUse with an axis 6-12 units long under an arc 11-29 '
		+ 'units across, so most of each arc lies PAST offset 1 and is already painted flat in that '
		+ 'stop',
		'the offset-0 stops are the brighter half of each pair (#22C55E green against #15803D, '
		+ '3.71:1 on the editor ground) — recorded here because if the ring reads too dark for you, '
		+ 'that is the one-line change',
		'the clipped duplicate of the violet arc is dropped: it exists only to darken the '
		+ 'gradient where two arcs overlap, and with the gradients flat it paints nothing new',
		'the six arcs are ONE ring, not six features: they abut, so L5\'s ~3 sub-shape budget is '
		+ 'read the way the docker erratum reads it — official detail the mark itself merges may '
		+ 'fuse. At 16 px the ring survives and the individual segment boundaries do not'
	],
	parts() {
		return officialShapes('allure-official.svg')
			.slice(0, 6)
			.map(s => ({ d: s.d, fill: flat(s) }));
	}
};

// =============================================================================
// angular-component · -directive · -guard · -interceptor · -pipe · -resolver ·
// -service — Angular
// =============================================================================
// THE HEADLINE CALL OF THIS TRANCHE, and the research changed the question.
//
// The brief expected Material to draw an established non-letter variant glyph per
// variant, which would make these rule 1(a). It does not. Material's own file
// icon definitions declare every one of the seven as
//
//     { name: 'angular-component', clone: { base: 'angular', color: 'blue-700' } }
//
// — a CLONE of the base icon with a colour override, and nothing else. There is
// no angular-component.svg in the theme at all; the seven "variants" are the
// Angular mark in blue-700, green-600, amber-400, teal-600, purple-400,
// green-600 (resolver repeats guard's colour) and orange-500. Those are Material
// palette names, invented by Material, and R1 has no invented colours. vscode-
// icons and Great Icons draw no angular variants whatsoever.
//
// So branch (a) has nothing to adapt and branch (b) applies to all seven: they
// ship the family base mark BYTE-IDENTICALLY under their own ids, in Angular's
// own colour. Seven identical icons in the tree is the rule working, exactly as
// python-misc is in tranche 1 — but seven is not one, so it is flagged loudly and
// the alternative is spelled out with its numbers.
//
// WHICH mark: Angular replaced the 2016 red shield with the 2023 "A" at v17 and
// angular.dev/press-kit says plainly "we advise against using the former Angular
// logo". The press kit itself ships PNG and GIF only (checked: adev/src/assets/
// images/press-kit holds angular_icon_gradient.gif and six .png files, no .svg),
// so L2's second tier ships — simple-icons' `angular`, which is the 2023 mark:
// four subpaths, the two wings, the base chevron and the A's counter.
//
// WHICH colour: the 2023 mark is published as a magenta-to-violet GRADIENT plus
// flat black (#0F0F11) and white variants; brand-colors.json records Angular as
// #DD0031. The pilot ratified brand-colors as the source of truth for the PRIMARY
// hex (npm, git, go, debian), so #DD0031 ships. It is Angular's red and it is
// still the brand's ecosystem colour; it is not the gradient. The alternatives —
// flat black lifted to near-white, or a hand-picked stop off a gradient nobody
// publishes as a vector — are both worse, and both are in the flag.
//
// The family's declared base is angular-component because there IS no bare
// `angular` id in the A01 roster: the base concept belongs to a later slice.
const ANGULAR_VARIANTS = [
	['angular-component', 'Angular component'],
	['angular-directive', 'Angular directive'],
	['angular-guard', 'Angular guard'],
	['angular-interceptor', 'Angular interceptor'],
	['angular-pipe', 'Angular pipe'],
	['angular-resolver', 'Angular resolver'],
	['angular-service', 'Angular service']
];
const angularSpec = (title, isBase) => ({
	title,
	brand: '#DD0031',
	env: ENV.tall,
	...(isBase ? {} : { family: { name: 'angular', base: 'angular-component', from: 'A01', mode: 'identical' } }),
	source: {
		name: 'simple-icons', slug: 'angular', license: 'CC0-1.0',
		url: 'https://angular.dev/press-kit',
		note: 'the 2023 Angular mark — one path, 4 subpaths: two wings, the base chevron and the '
			+ 'A\'s counter. Angular\'s own press kit publishes the icon as PNG and GIF only '
			+ '(adev/src/assets/images/press-kit: angular_icon_gradient.gif plus six .png), so the '
			+ 'CC0 trace is the source. The 2016 red shield is deprecated by the brand itself'
	},
	simplifications: [
		'the mark\'s official magenta-to-violet gradient is not carried: Angular publishes the '
		+ '2023 icon as a gradient plus flat black (#0F0F11) and white variants, and no vector of '
		+ 'the gradient at all. brand-colors.json records Angular as #DD0031 and the pilot ruled '
		+ 'brand-colors wins the PRIMARY hex (npm / git / go / debian), so #DD0031 ships',
		...(isBase ? [] : [
			'WORKING RULE 1(b): Material declares all seven angular-* variants as `clone: '
			+ '{ base: "angular", color: <material palette name> }` — the base icon recoloured, '
			+ 'with no variant geometry anywhere in the theme; vscode-icons and Great Icons draw '
			+ 'no angular variants at all. There is therefore no non-letter variant glyph to '
			+ 'adapt, so this variant ships the family base mark byte-identically under its own id'
		])
	],
	parts() {
		const sp = subpaths(icon('angular').path);
		return [{ d: sp.join(''), fill: '#DD0031' }];
	}
});
ANGULAR_VARIANTS.forEach(([id, title], i) => { S[id] = angularSpec(title, i === 0); });

// =============================================================================
// antlers-html — Statamic
// =============================================================================
// Antlers is Statamic's templating language and an antlers.html file exists only
// inside a Statamic project, so Statamic's mark applies (the AdvPL reading). The
// language itself publishes nothing of its own — the name comes from the "antler
// braces" {{ }} and there is no Antlers mark. statamic.com/branding is a page
// rather than an asset URL, so L2's second tier ships: simple-icons' `statamic`,
// sourced from that branding page, in the official #FF269E.
//
// vscode-icons draws the same Statamic mark for antlers.html (in its own teal),
// which corroborates the reading and is not the source.
S['antlers-html'] = {
	title: 'Antlers (Statamic)',
	brand: '#FF269E',
	env: ENV.wide,
	plate: true,
	source: {
		name: 'simple-icons', slug: 'statamic', license: 'CC0-1.0',
		url: 'https://statamic.com/branding',
		note: 'the Statamic field with its "S" knocked out — one path, 2 subpaths. Antlers has no '
			+ 'mark of its own; antlers.html files exist only inside Statamic, which does '
			+ '(the AdvPL reading). vscode-icons independently draws the Statamic mark here too'
	},
	simplifications: [],
	parts() {
		const sp = subpaths(icon('statamic').path);
		return [{ d: sp[0], fill: '#FF269E' }, { d: sp[1], fill: WHITE }];
	}
};

// =============================================================================
// antlr — ANTLR
// =============================================================================
// BUILT FROM ITS MARK, THEN REMOVED BY THE TWIN AUDIT. This is the only subject
// in the tranche whose verdict was decided by a gate rather than by a hunt, and
// the whole sequence is on the record because the ruling could go the other way.
//
// The source hunt succeeded, on L2's THIRD tier — the first time that tier has
// fired anywhere in this set:
//   · antlr.org publishes the mark (an orange-red disc with a white "A") only as
//     images/antlr-logo.png, 220 x 80. Every SVG path on the site and in
//     antlr/website-antlr4 answers 404, and tracing a PNG is freehand;
//   · simple-icons has no `antlr` entry — and this is NOT the Adobe situation:
//     ANTLR is a small BSD-licensed project, not a removed trademark;
//   · three independent faithful vectors of the same drawing exist — vscode-icons
//     (MIT), Material (MIT) and mike-lischke/vscode-antlr4 — and vscode-icons'
//     carries the disc AND the A in the mark's own two-layer construction.
// It was built from that vector, it fitted cleanly, and its 16 px render was the
// best circle-and-glyph in the slice.
//
// Then the CROSS-SET twin audit failed it against tranche 1's chrome:
//   R8 form 0.798 against the 0.72 bar (area IoU 0.969 — two discs of the same
//   diameter are the same silhouette), and R7 on top of it: dominant hues 3.4
//   apart, dL 1.8, dS 4.4, because ANTLR's #E44A32 and Chrome's #EA4335 are the
//   same red. A .crx and a .g4 would have been the same red disc in the tree.
//
// No fit fixes that: the collision is between two discs, and the envelope law has
// no room to shrink one by a quarter.
//
// REINSTATED IN THE FIX ROUND (2026-09-03). The removal was never a licence call —
// it was flag 18's third option, "rule that two brands whose real marks genuinely
// resemble each other may both keep them and relax R8 for declared pairs" — and the
// ruling's real-icon preference takes it. antlr ships its mark again and the pair is
// carried in a NEW, DECLARED LOOK-ALIKE LANE in the audit (see LOOKALIKE below and
// audit.mjs): the pair is reported with its live scores on every run, it never
// fails, and the lane requires an explicit declaration naming both ids and the
// ruling that opened it. An undeclared pair scoring the same still fails, which is
// what keeps the lane from becoming a mute button.
//
// This one is FLAGGED PROMINENTLY for a re-look: the two icons really are the same
// red disc at 16 px, and the study renders them side by side at 16 / 22 / 32 so the
// question can be answered by looking rather than by reading the score.
S.antlr = {
	title: 'ANTLR',
	brand: '#E44A32',
	env: ENV.compact,
	source: {
		name: 'vscode-icons (faithful vector, L2 tier 3)', slug: 'antlr',
		license: 'MIT (vscode-icons/vscode-icons); ANTLR itself is BSD-3-Clause and the mark is '
			+ 'the project\'s',
		url: 'https://github.com/vscode-icons/vscode-icons/blob/master/icons/file_type_antlr.svg',
		artwork: 'antlr-vsicons.svg',
		note: 'the orange-red disc with the white "A", in the mark\'s own two-layer construction '
			+ '— the disc as one contour, the A as a second path. L2 tier 3: antlr.org publishes '
			+ 'the mark only as images/antlr-logo.png (220x80, kept at '
			+ 'sources-svg/antlr-official.png), every SVG path on the site and in '
			+ 'antlr/website-antlr4 answers 404, and simple-icons has no entry. Material and '
			+ 'mike-lischke/vscode-antlr4 trace the same drawing, which is the corroboration the '
			+ 'tier asks for'
	},
	simplifications: [
		'the vector\'s disc path carries a second subpath that duplicates the A as a counter; '
		+ 'only the disc contour is taken and the A is painted over it in the mark\'s own white, '
		+ 'so the letter reads as ink rather than as backdrop-through-disc (the gpg move)',
		'REINSTATED BY THE FIX ROUND under a DECLARED LOOK-ALIKE LANE. The cross-set twin audit '
		+ 'still scores this against tranche 1\'s chrome at R8 form 0.798 on a 0.72 bar (area IoU '
		+ '0.969 — two discs of the same diameter are one silhouette) with the two reds 3.4 '
		+ 'degrees of hue apart, and it still prints those numbers on every run. It no longer '
		+ 'FAILS, because the pair is declared: two brands whose real marks genuinely resemble '
		+ 'each other may both keep them. Nothing about the geometry changed — the scores are the '
		+ 'same numbers flag 18 recorded'
	],
	parts() {
		const sh = officialShapes('antlr-vsicons.svg');
		return [
			{ d: subpaths(sh[1].d)[0], fill: '#E44A32' },   // the disc, without its A-counter
			{ d: sh[0].d, fill: '#FEFEFE' }                 // the official white A
		];
	}
};

// =============================================================================
// anyscript
// =============================================================================
// RULE 2. `.any` is AnyScript, the modelling language of the AnyBody Modeling
// System. AnyBody Technology's mark is a corporate figure mark for the company,
// not for the language, and it is published as raster only; there is no
// simple-icons entry and no AnyScript mark of any kind. vscode-icons draws the
// letters "ANY".
S.anyscript = codeGlyph('AnyScript',
	'no mark exists for the language: AnyScript is the AnyBody Modeling System\'s language and '
	+ 'AnyBody Technology publishes a corporate figure mark for the COMPANY (raster only, no '
	+ 'simple-icons entry) — the safetensors reading, where a company\'s mark is not the format\'s. '
	+ 'vscode-icons draws the letters "ANY"');

// =============================================================================
// apex — Salesforce
// =============================================================================
// RULE 2, the Adobe/Microsoft call applied to the third corporate mark in the
// tranche. Apex is Salesforce's language and .cls files are Salesforce's, so the
// Salesforce cloud is the mark that applies — and simple-icons v16.29.0 carries
// no `salesforce` entry, Salesforce publishes no icon vector under citable terms,
// and every asset URL on salesforce.com answers 404 or HTML. Material and
// vscode-icons both draw the cloud themselves.
//
// REBUILT IN THE FIX ROUND (2026-09-03). Tranche 2 called this "the painful one,
// because the Salesforce cloud is a clean silhouette that would have rendered
// beautifully at 16 px" and declined it on sourcing alone. The ruling voids the
// sourcing objection, and the prediction was right: measured at the wide envelope
// the cloud runs 1.69 px at the 5th percentile and 4.56 px at the 25th, which makes
// it the most comfortable mark this tranche ships.
//
// SOURCING, by fidelity: salesforce.com serves no logo vector under any path that
// answers, so the geometry is devicon's MIT vector of the same drawing — the cloud
// as one path, taken WITHOUT the white "salesforce" wordmark the file sets inside
// it (that is a lockup; the cloud on its own is the symbol Salesforce uses as its
// app and favicon mark, and letters at this size are ada's problem).
S.apex = {
	title: 'Apex (Salesforce)',
	brand: '#00A1E0',
	env: ENV.wide,
	source: {
		name: 'Salesforce (faithful vector — devicon)', slug: 'salesforce',
		license: 'MIT (devicons/devicon); the mark itself is a Salesforce trademark. Recorded '
			+ 'and NOT gating, per the fix-round ruling',
		url: 'https://github.com/devicons/devicon/blob/master/icons/salesforce/salesforce-original.svg',
		artwork: 'salesforce-devicon.svg',
		note: '128x128, three painted layers: the #00A1E0 cloud and two white paths carrying the '
			+ '"salesforce" wordmark set inside it. Only the cloud ships — the wordmark is a '
			+ 'lockup, and 11 letterforms across 13.8 px is ada\'s case. Salesforce serves no '
			+ 'logo vector from salesforce.com under any path that answers and simple-icons has '
			+ 'no entry, so this is the faithful-vector tier. Fetched to '
			+ 'sources-svg/salesforce-devicon.svg'
	},
	simplifications: [
		'the white "salesforce" wordmark the file sets inside the cloud is DROPPED: it is a '
		+ 'lockup rather than the symbol, and eleven letterforms across a 13.8 px mark is the '
		+ 'npm-wordmark case the pilot already ruled on. The cloud on its own is what Salesforce '
		+ 'uses as its app and favicon mark, and it is the whole of the shipped geometry',
		'NOT reduced otherwise, and measured: at the wide envelope the cloud runs 1.69 px at the '
		+ '5th percentile and 4.56 px at the 25th — the most comfortable mark in the tranche, '
		+ 'which is exactly what flag 13 predicted when it declined it'
	],
	parts() {
		return [{ d: officialShapes('salesforce-devicon.svg')[0].d, fill: '#00A1E0' }];
	}
};

// =============================================================================
// apib — API Blueprint
// =============================================================================
// apiblueprint.org serves its own mark at images/apiblueprint-footer-*.svg and
// the project (apiaryio/api-blueprint) is MIT: three rings on a triangle, joined
// by two thin connectors, all in #6E5AA1. Brand tier.
//
// What L5 forces, measured at the compact envelope (12.8 x 11.86 ink, scale
// 0.337): the ring WALL is 1.75 source units = 0.59 px and the connector bars are
// 1.3 units = 0.44 px. Both are less than half the floor, so the prettier rider
// fires — and it fires the onnx way, by moving nothing:
//   · each ring's counter is scaled about its own centre by 0.60, which takes the
//     wall from 0.59 px to 1.26 px and leaves every ring's outer circle, centre
//     and diameter exactly where the file puts them. The rings stay RINGS, which
//     is what the mark is; solid discs would have been the easy reduction and
//     would have made it a different drawing;
//   · the two connectors are rebuilt as bars of 3.6 source units (1.21 px)
//     between the official ring centres — the prettier precedent, where the
//     surviving bars were re-emitted at the official positions and a thickness
//     that clears the floor.
const APIB_COUNTER_K = 0.60, APIB_BAR_T = 3.6;
S.apib = {
	title: 'API Blueprint',
	brand: '#6E5AA1',
	env: ENV.compact,
	source: {
		name: 'API Blueprint (brand\'s own SVG)', slug: 'apib', license: 'MIT (apiaryio/api-blueprint)',
		url: 'https://apiblueprint.org/images/apiblueprint-footer-81a6c64c.svg',
		artwork: 'apib-official.svg',
		note: '38x36, four paths in #6E5AA1: the two connector bars and three rings (each an '
			+ 'outer circle with its counter). Material and vscode-icons both trace the same '
			+ 'three-node drawing'
	},
	simplifications: [
		'PRETTIER RIDER. Measured at the compact envelope: the ring walls are 0.59 px and the '
		+ 'connector bars 0.44 px — both under half of L5\'s 1.2 px official-forced floor',
		`each ring's counter scaled about its own centre by ${APIB_COUNTER_K}, which takes the wall `
		+ 'from 0.59 px to 1.26 px and leaves the hole 2.01 px across, with every outer circle, '
		+ 'centre and diameter exactly where the official file puts them. The rings stay rings — '
		+ 'filling them solid was the easy reduction and makes it a different mark (the onnx move, '
		+ 'same reasoning)',
		`the two connectors re-emitted as ${APIB_BAR_T}-unit bars (1.21 px) between the official ring `
		+ 'centres, the way prettier\'s surviving rows were re-emitted at official positions and a '
		+ 'thickness that clears the floor. Their endpoints are the mark\'s own'
	],
	parts() {
		const sh = officialShapes('apib-official.svg');
		const rings = sh.slice(1).map((s) => {
			const [outer, counter] = subpaths(s.d);
			return { outer, counter, c: bbox(outer) };
		});
		const top = rings.find(r => r.c.cy === Math.min(...rings.map(x => x.c.cy)));
		const bottoms = rings.filter(r => r !== top);
		const bars = bottoms.map(b => bar([top.c.cx, top.c.cy], [b.c.cx, b.c.cy], APIB_BAR_T));
		return [{
			d: bars.join('') + rings.map(r => r.outer + shrink(r.counter, APIB_COUNTER_K)).join(''),
			fill: '#6E5AA1'
		}];
	}
};

// =============================================================================
// apl
// =============================================================================
// RULE 2 on a genuinely open question, answered honestly. APL has no owner: the
// language is implemented by Dyalog, GNU APL, dzaima/APL and others, and none of
// them publishes a mark for APL itself. What exists is the APL WIKI's logo — a
// cube with one quarter shaped into a leaf (a filled Del, the function-definition
// symbol) so the cube reads as an apple, subdivided into a rectangular matrix
// pattern, in green. It is a community logo for a community wiki, not an official
// mark of the language, and aplwiki.com serves it behind a challenge that refuses
// automated fetches (403 on every attempt).
//
// Even granting it official status it would not survive: the matrix subdivision
// is the point of the drawing and it is a grid of cells across a 13 px mark.
// vscode-icons draws a plain gray triangle with a stem, which traces nothing.
S.apl = codeGlyph('APL',
	'no official mark exists: APL has no owner (Dyalog, GNU APL and dzaima/APL each publish their '
	+ 'OWN marks, none of them for APL itself). The APL Wiki\'s community logo — an apple-cube '
	+ 'with a Del leaf, subdivided into a matrix — is the closest thing, is not official, and its '
	+ 'defining feature is a subdivision grid that cannot survive a 13 px mark; aplwiki.com also '
	+ 'refuses automated fetches (403). vscode-icons draws a triangle that traces nothing');

// =============================================================================
// applescript — Apple
// =============================================================================
// RULE 2, and the clearest decline in the tranche. AppleScript publishes no mark
// of its own: the icon every theme reaches for is the APPLE LOGO, which Material
// draws in blue-gray and vscode-icons in pale green. Two independent reasons not
// to ship it, either of which is enough:
//   · it is the COMPANY's mark, not AppleScript's — tranche 1's safetensors
//     reading, where the Hugging Face face was declined for the same reason;
//   · Apple's own identity guidelines forbid third parties using the Apple logo
//     at all. That both themes DESATURATE it is a tell that they know.
// REBUILT IN THE FIX ROUND (2026-09-03). Flag 13 declined this twice — on Apple's
// identity guidelines (a brand-usage policy, which the ruling voids outright) and on
// the safetensors meaning reading (which the same ruling re-rules for safetensors
// itself). Both halves go, and the Apple logo ships.
//
// APPLESCRIPT'S OWN ICON WAS HUNTED FIRST, as the fix round asked. AppleScript's
// own visual identity is the Script Editor document icon — the parchment scroll
// macOS has drawn since Mac OS 9 — and it exists only inside the operating system,
// as raster: /System/Applications/Utilities/Script Editor.app ships .icns, Apple
// publishes no vector of it anywhere, and every theme that draws AppleScript draws
// the Apple logo instead (Material in blue-gray, vscode-icons in pale green). L2
// hard-rejects tracing a raster and that is a FIDELITY rule the ruling does not
// reach, so the scroll is not available and the company mark is what is left.
//
// COLOUR: Apple publishes the mark in black and in white and in nothing else. The
// official black measures 1.06:1 on the #121314 ground, so the pilot's one
// documented visibility lift fires exactly as it does on markdown — hue and
// saturation untouched (both zero), lightness to L 88. Apple's own white lockup is
// what that lands on, which is the version the brand itself uses on dark.
S.applescript = {
	title: 'AppleScript',
	brand: lift('#000000'),   // official mark is black — the one L2 visibility lift
	env: ENV.tall,
	source: {
		name: 'simple-icons', slug: 'apple', license: 'CC0-1.0 (the vector); the mark itself is '
			+ 'an Apple trademark and Apple\'s identity guidelines forbid third-party use. '
			+ 'Recorded verbatim and NOT gating, per the fix-round ruling',
		url: 'https://www.apple.com',
		note: 'the Apple logo — one path, 2 subpaths (the bitten body and the leaf). '
			+ 'AppleScript\'s OWN icon was hunted first and cannot be used: its identity is the '
			+ 'Script Editor parchment scroll, which ships inside macOS as .icns raster and is '
			+ 'published as no vector anywhere, and L2 hard-rejects tracing a raster — a fidelity '
			+ 'rule the ruling does not touch. Material and vscode-icons both reach for the Apple '
			+ 'logo here too'
	},
	simplifications: [
		'official #000000 lifted to L 88 for the #121314 backdrop — the one documented L2 '
		+ 'visibility lift, the same rule markdown ships under, with hue and saturation (both '
		+ 'zero) untouched. Apple publishes the mark in black and in white only, and this lands '
		+ 'on the white lockup the brand itself uses on dark grounds',
		'NOT reduced, and measured: at the tall envelope the mark runs 0.88 px at the 5th '
		+ 'percentile and 2.00 px at the 25th, with the leaf\'s tip and the bite\'s cusp the two '
		+ 'places under the floor. Both are the mark\'s own drawing'
	],
	parts() {
		return [{ d: icon('apple').path, fill: lift('#000000') }];
	}
};

// =============================================================================
// module exports — the shape A01.mjs merges
// =============================================================================

export const SPECS = S;

/** Sheet order: the roster's own order for the code category. */
export const ORDER = ['abap', 'abc', 'abelljs', 'actionscript', 'ada', 'adobe-swc', 'adonis',
	'advpl', 'advpl-include', 'advpl-ptm', 'advpl-tlpp', 'affectscript', 'affinity',
	'affinitypublisher', 'agda', 'ahk2', 'al', 'al-dal', 'alchemy', 'alloy', 'allure',
	'angular-component', 'angular-directive', 'angular-guard', 'angular-interceptor',
	'angular-pipe', 'angular-resolver', 'angular-service', 'antlers-html', 'antlr', 'anyscript',
	'apex', 'apib', 'apl', 'applescript'];

/**
 * L9 gate 2 — the 16 px proof, eyeballed. Read off the slice's own
 * proofs/proof-16px.png (every icon at a true 16 px next to a 10x
 * nearest-neighbour blow-up) and written down here, not asserted by a machine.
 */
export const PROOF16 = (() => {
	// the twelve concepts that share the generic-code glyph get one verdict text,
	// because they are one payload: a different note per id would imply a
	// difference the bytes do not have
	const CODE = ['pass', 'the angle-bracket pair, 2.2 px stems, unmistakable at 16 px — and '
		+ 'byte-identical across all twelve concepts that fall back to it, which is the point of '
		+ 'the collapse and the thing to rule on, not the render'];
	const V = {
		abap: ['pass', 'the letters really do resolve: "SAP" reads as three separate letterforms '
			+ 'white-on-blue at a true 16 px, which the measurement predicted (stems 1.00-1.25 px, '
			+ 'at the floor rather than under it) and the render confirms. The parallelogram\'s '
			+ 'raked right edge survives too'],
		abc: ['pass', 'notehead, stem and flag all separate; it reads as a note and as nothing '
			+ 'else. The flag is the feature that stops it reading as a spoon'],
		abelljs: ['pass', 'the spiral holds all the way to its inner turn and the three dots read '
			+ 'as a dashed arc off its tail rather than as three dots — at 0.9 px apiece that is '
			+ 'the mark\'s own drawing, not the fit. The official #0A30E0 inner spiral measures '
			+ '2.23:1 on the editor ground and is visibly the dimmer of the two blues'],
		actionscript: ['pass', 'FIX ROUND. Adobe\'s red "A", and it is the boldest thing in the '
			+ 'tranche at 16 px: three straight-edged strokes, the counter open at 3.00 px, no '
			+ 'curve to lose. What thins are the three apex tips, which is how Adobe draws it'],
		ada: CODE,
		'adobe-swc': ['pass', 'byte-identical to actionscript, as declared — a .swc is '
			+ 'ActionScript compiled, so it is the same Adobe family and the same mark'],
		adonis: ['pass', 'the plate is clean and the white arrow "A" inside it keeps its counter — '
			+ 'one of the three most legible marks in the tranche'],
		advpl: ['pass', 'disc plus the two stepped counters; the step reads as a step and not as a '
			+ 'smudge, and the four family colours separate cleanly from each other'],
		'advpl-include': ['pass', 'the advpl mark in TOTVS\'s own teal — same geometry, and at '
			+ '7.61:1 the brightest of the four'],
		'advpl-ptm': ['pass', 'the advpl mark in TOTVS\'s own red; at 3.20:1 the dimmest of the '
			+ 'four but still comfortably clear of the ground'],
		'advpl-tlpp': ['pass', 'the advpl mark in TOTVS\'s own olive'],
		affectscript: CODE,
		affinity: ['pass', 'the pale-green plate carries, and the black "a" swirl keeps both of its '
			+ 'counters — the tail crossing the bowl is the detail that could have gone and did '
			+ 'not'],
		affinitypublisher: ['pass', 'byte-identical to affinity, as declared. In the tree a .af and '
			+ 'a .afpub will look the same; that is rule 1(b) working, and the flag argues it'],
		agda: CODE,
		ahk2: CODE,
		al: ['pass', 'FIX ROUND. Microsoft\'s own AL mark, and the letters really do resolve: '
			+ '"AL" reads as two separate letterforms in the brand\'s teal at a true 16 px, which '
			+ 'the measurement predicted (stems 1.63-1.81 px, half again thicker than abap\'s SAP) '
			+ 'and the render confirms. The A\'s counter stays open'],
		'al-dal': ['pass', 'byte-identical to al, as declared — Microsoft ships one AL icon for '
			+ 'the language, not one per file type'],
		alchemy: ['pass (marginal)', 'the thickened 1.23 px lines hold and the circle, the '
			+ 'inscribed triangle and the dot all read. It is marginal on the DOT: at 1.36 px '
			+ 'across it is one warm pixel and a half, and it is the only thing separating this '
			+ 'mark from a plain triangle-in-a-circle. The rest is comfortable'],
		alloy: ['pass', 'the coil closes and both counters stay open; the best-behaved brand file '
			+ 'in the tranche'],
		allure: ['pass', 'reads as the five-colour broken ring it is. The individual segment '
			+ 'boundaries do not resolve — six arcs into 12.7 px never could — but the ring, the '
			+ 'gap and the heavy amber lobe on the right all survive, which is the mark\'s gestalt. '
			+ 'The slate segment (#64748B, 3.91:1) is the one that nearly disappears'],
		'angular-component': ['pass', 'the two wings, the base chevron and the A\'s counter all '
			+ 'separate at 16 px; the counter is the feature at risk and it holds'],
		'angular-directive': ['pass', 'byte-identical to angular-component, as declared'],
		'angular-guard': ['pass', 'byte-identical to angular-component, as declared'],
		'angular-interceptor': ['pass', 'byte-identical to angular-component, as declared'],
		'angular-pipe': ['pass', 'byte-identical to angular-component, as declared'],
		'angular-resolver': ['pass', 'byte-identical to angular-component, as declared'],
		'angular-service': ['pass', 'byte-identical to angular-component, as declared — seven ids, '
			+ 'one payload, and the headline flag is where to argue with that'],
		'antlers-html': ['pass', 'pink plate, white "S", both crisp; the plate\'s notched corners '
			+ 'survive at 16 px, which is what keeps it from reading as a plain chip'],
		antlr: ['pass', 'FIX ROUND, REINSTATED. The orange-red disc with its white "A", and it is '
			+ 'the cleanest circle-and-glyph in the slice exactly as tranche 2 said before the twin '
			+ 'audit removed it: 3.69 px at the 5th percentile, 8.06 at the 25th, the A crisp. '
			+ 'THE RENDER IS NOT THE QUESTION. The question is the one in '
			+ 'proofs/antlr-chrome-study.png: at 16 px this and chrome are both a red disc, and you '
			+ 'are being asked to look at them side by side and say whether that is acceptable'],
		anyscript: CODE,
		apex: ['pass', 'FIX ROUND. The Salesforce cloud, and flag 13 was right that it would '
			+ 'render beautifully: one clean silhouette, nothing in it under 1.69 px at the 5th '
			+ 'percentile, unmistakable at 16 px. The most comfortable mark this tranche ships'],
		apib: ['pass', 'after the rider: three rings with open 2.0 px holes and two 1.2 px '
			+ 'connectors, reading as the three-node graph the mark is. At official thickness '
			+ '(0.59 px walls, 0.44 px bars) it was a purple smudge'],
		apl: CODE,
		applescript: ['pass', 'FIX ROUND. The Apple logo, lifted to L 88 as the one L2 rule '
			+ 'allows, and it is unmistakable at 16 px — the leaf stays a separate shape above the '
			+ 'bite. The render is not what to argue with; the flag is, because this is the '
			+ 'COMPANY\'s mark standing in for a language that draws a parchment scroll macOS '
			+ 'publishes only as raster']
	};
	return V;
})();

/** Working rule 1 — declared brand families. */
export const FAMILIES = {
	adobe: {
		base: 'actionscript', base_set: 'A01', members: ['adobe-swc'], mode: 'identical',
		why: 'rule 1(b), OPENED BY THE FIX ROUND. A .swc is a compiled library of ActionScript '
			+ 'classes — the same Adobe family one step down the toolchain — and neither Adobe nor '
			+ 'any source theme draws a distinct non-letter .swc glyph (Material invents a red '
			+ 'tile with a squiggle). So branch (a) has nothing to adapt and adobe-swc ships the '
			+ 'Adobe corporate mark byte-identically under its own id. The base is actionscript '
			+ 'because the bare `adobe` concept is not an A01 roster id'
	},
	al: {
		base: 'al', base_set: 'A01', members: ['al-dal'], mode: 'identical',
		why: 'rule 1(b), OPENED BY THE FIX ROUND. Microsoft ships ONE AL icon in its own AL '
			+ 'Language extension (img/AL_file_logo.svg) and registers it against the `al` '
			+ 'language id, not one icon per file type; vscode-icons differentiates al-dal only by '
			+ 'recolouring the same monogram dusty red, which is its own invention and not a '
			+ 'variant glyph. So al-dal ships the family base mark byte-identically'
	},
	advpl: {
		base: 'advpl', base_set: 'A01',
		members: ['advpl-include', 'advpl-ptm', 'advpl-tlpp'], mode: 'recolour',
		why: 'the BRAND draws the variants. TOTVS ships icon_advpl / icon_include / icon_ptm / '
			+ 'icon_tlpp in its own MIT-licensed VS Code extension and the four differ ONLY in '
			+ 'fill, so each variant is the TOTVS symbol in the colour TOTVS gives that file type. '
			+ 'Neither branch of rule 1 covers this — the geometry is shared but the colours are '
			+ 'official, not invented — so the family is declared mode `recolour` and byte-identity '
			+ 'is NOT expected. The twin audit prints the four in its family lane with their real '
			+ 'form scores instead of failing them for sharing a silhouette'
	},
	affinity: {
		base: 'affinity', base_set: 'A01', members: ['affinitypublisher'], mode: 'identical',
		why: 'rule 1(b). Affinity Publisher had its own app icon in the Affinity 2 suite, but '
			+ 'Serif/Canva retired the per-app icons when Affinity became one application and the '
			+ 'mark the brand publishes for .afpub today is the Affinity mark itself. The retired '
			+ 'icon is an eleven-layer gradient illustration that R1 would flatten to a red '
			+ 'triangle — the gestalt failure the pilot gate rejected twice — so the variant ships '
			+ 'the family base mark byte-identically under its own id'
	},
	angular: {
		base: 'angular-component', base_set: 'A01',
		members: ['angular-directive', 'angular-guard', 'angular-interceptor', 'angular-pipe',
			'angular-resolver', 'angular-service'], mode: 'identical',
		why: 'rule 1(b), and the research is the whole argument: Material declares all seven '
			+ 'angular-* icons as `clone: { base: "angular", color: <material palette name> }` — '
			+ 'the base mark recoloured, with no variant geometry anywhere in the theme — and '
			+ 'vscode-icons and Great Icons draw no angular variants at all. There is no '
			+ 'established non-letter variant glyph to adapt, and Material\'s per-variant hues are '
			+ 'its own invention, which R1 has no place for. So all seven ship the Angular mark '
			+ 'byte-identically in Angular\'s own #DD0031. The declared base is angular-component '
			+ 'because the bare `angular` concept is not in the A01 roster at all — it belongs to a '
			+ 'later slice — so the family is anchored on the first variant in worklist order'
	}
};

/** Working rule 2 — the neutral vocabulary as this tranche uses it. */
export const NEUTRAL_COLLAPSE = {
	object_glyphs: {
		abc: 'musical note — a tilted notehead and the stem-with-flag as one contour (geom.noteGlyph)'
	},
	category_glyphs: {
		// FIX ROUND: actionscript, adobe-swc, al, al-dal, apex and applescript left for the
		// corporate marks the ruling freed, and antlr was reinstated under the declared
		// look-alike lane. Six of this tranche's thirteen remain, and every one of them is
		// a LEGIBILITY or a no-mark-at-all verdict now — not a licence one.
		'generic-code': ['ada', 'affectscript', 'agda', 'ahk2', 'anyscript', 'apl']
	}
};

/**
 * FIX ROUND (2026-09-03) — what this tranche rebuilt under the ruling.
 */
export const FIX_ROUND = {
	rebuilt: ['actionscript', 'adobe-swc', 'al', 'al-dal', 'apex', 'applescript', 'antlr'],
	rehunted_and_unchanged: ['ada', 'agda', 'ahk2'],
	notes: {
		actionscript: 'flag 13\'s "absence from simple-icons is evidence of a trademark removal" '
			+ 'rule is void, so Adobe\'s corporate red "A" ships. Animate\'s and Flash '
			+ 'Professional\'s icons were looked at and rejected as letter plates.',
		'adobe-swc': 'rule 1(b) on actionscript — a .swc is ActionScript compiled.',
		al: 'the hunt turned up better than a licence answer: MICROSOFT DRAWS THIS ICON, in its '
			+ 'own AL Language extension, and vscode-icons was tracing that file rather than '
			+ 'inventing a monogram. Its letters measure 1.63-1.81 px, thicker than abap\'s.',
		'al-dal': 'rule 1(b) on al — Microsoft ships one AL icon for the language.',
		apex: 'declined on sourcing alone and predicted to "render beautifully"; the ruling voids '
			+ 'the sourcing and the prediction was right (1.69 px at the 5th percentile).',
		applescript: 'declined on Apple\'s identity guidelines (a brand policy the ruling voids) '
			+ 'and on the safetensors meaning reading (re-ruled). AppleScript\'s OWN icon — the '
			+ 'Script Editor scroll — was hunted first and exists only as macOS raster, which L2 '
			+ 'still rejects on fidelity, so the Apple logo ships, lifted to L 88.',
		antlr: 'never a licence call: flag 18 offered "relax R8 for declared pairs" as an option '
			+ 'and the ruling takes it. The mark is reinstated and the antlr/chrome pair is '
			+ 'carried in a new DECLARED LOOK-ALIKE lane that reports its real scores every run '
			+ 'and never fails. Flagged prominently for a re-look.',
		ada: 're-measured with sourcing free; the logotype is 15.2 x 6.5 px at the widest fit the '
			+ 'grid allows and its ink runs are 0.19 / 0.75 / 0.94 px. Stays neutral on L5.',
		agda: 're-measured; the bird is 0.37 px of stroke, its head strokes fuse at the floor and '
			+ 'its body outline is open. Stays neutral on L5.',
		ahk2: 're-measured with the ink lifted as well as official; nothing in the keycap exceeds '
			+ '0.50 px and the only reduction that clears the floor is a bare rounded box. Stays '
			+ 'neutral on L5.'
	}
};

/**
 * DECLARED LOOK-ALIKE PAIRS (opened by the fix round, 2026-09-03).
 *
 * A new audit lane, chartered by the ruling that reinstated antlr. Two brands whose
 * REAL marks genuinely resemble each other may both keep them; the pair is reported
 * with its live R7/R8 scores on every run and never fails. The lane is explicit by
 * construction — it names both ids and the ruling that opened it — so an undeclared
 * pair scoring the same still fails, which is what stops this becoming a mute button.
 */
export const LOOKALIKE = [
	{
		pair: ['antlr', 'chrome'],
		ruling: 'Sebastian, 2026-09-03 — "I like the icons that are actually the real Icon." '
			+ 'Flag 18 offered exactly this as its second option: relax R8 for DECLARED pairs '
			+ 'rather than take a real mark off a real brand.',
		why: 'ANTLR\'s mark is an orange-red disc with a white "A" and Chrome\'s is a red-yellow-'
			+ 'green disc with a blue centre. They score R8 form 0.798 on a 0.72 bar (area IoU '
			+ '0.969: two discs of the same diameter are one silhouette) and their dominant reds '
			+ 'are 3.4 degrees of hue apart. Both are the brands\' own artwork, neither can be '
			+ 'refitted out of the collision — the envelope law has no room to shrink one disc by '
			+ 'a quarter — and the alternative is a gray glyph on one of them. Rendered side by '
			+ 'side at a true 16 / 22 / 32 px in proofs/antlr-chrome-study.png.'
	}
];

/**
 * What the brand actually ships, for the fidelity strip and the sheet's
 * provenance panes. Display-safe: no gradients, no <style>, no external
 * references, no data: URIs — both surfaces are gated for that. Concepts that
 * ship the neutral vocabulary return null even where a mark exists and was
 * declined; the declined marks are argued in the flags, not smuggled onto the
 * fidelity strip as if they were sources.
 */
const wrap = (viewBox, body) => `<svg viewBox="${viewBox}">${body}</svg>`;
const siSvg = (slug, fill) => wrap('0 0 24 24', `<path fill="${fill}" d="${icon(slug).path}"/>`);
const fileSvg = (viewBox, file, fills) => wrap(viewBox, officialShapes(file)
	.map((s, i) => `<path fill="${(fills && fills[i]) || flat(s)}" d="${s.d}"/>`).join(''));

export const ORIGINAL = {
	// SAP's own file: the field is a <polyline>, so it is re-emitted as the same four
	// points as a path, and its five-stop gradient is shown at its offset-1 stop
	abap: () => {
		const raw = readFileSync(join(SRCDIR, 'sap-official.svg'), 'utf8');
		const pts = (raw.match(/<polyline[^>]*points="([^"]+)"/) || [])[1].trim().split(/\s+/);
		const stops = [...raw.matchAll(/stop-color="(#[0-9a-fA-F]{3,6})"/g)].map(m => m[1]);
		let d = '';
		for (let i = 0; i < pts.length; i += 2) { d += `${i ? 'L' : 'M'}${pts[i]} ${pts[i + 1]}`; }
		return wrap('0 0 412.38 204', `<path fill="${stops[stops.length - 1]}" d="${d}Z"/>`
			+ officialShapes('sap-official.svg').map(s => `<path fill="#FFFFFF" d="${s.d}"/>`).join(''));
	},
	abc: () => null,
	abelljs: () => fileSvg('0 0 512 512', 'abell-official.svg', ['#4D6BF3', '#0A30E0', '#0A30E0']),
	actionscript: () => fileSvg('0 0 256 227', 'adobe-official.svg'),
	ada: () => null,
	'adobe-swc': () => fileSvg('0 0 256 227', 'adobe-official.svg'),
	adonis: () => siSvg('adonisjs', '#5A45FF'),
	advpl: () => fileSvg('0 0 16 16', 'advpl-official.svg'),
	'advpl-include': () => fileSvg('0 0 16 16', 'advpl-include-official.svg'),
	'advpl-ptm': () => fileSvg('0 0 16 16', 'advpl-ptm-official.svg'),
	'advpl-tlpp': () => fileSvg('0 0 16 16', 'advpl-tlpp-official.svg'),
	affectscript: () => null,
	affinity: () => fileSvg('0 0 192 192', 'affinity-official.svg'),
	affinitypublisher: () => fileSvg('0 0 192 192', 'affinity-official.svg'),
	agda: () => null,
	ahk2: () => null,
	al: () => fileSvg('0 0 255 255', 'al-microsoft.svg', ['#2EA98E', '#2EA98E']),
	'al-dal': () => fileSvg('0 0 255 255', 'al-microsoft.svg', ['#2EA98E', '#2EA98E']),
	// the brand's own file draws circle and triangle with STROKES; the display copy keeps
	// them as strokes (this is what the brand ships) in its own dark-scheme palette
	alchemy: () => wrap('1.8 1.8 20.4 20.4',
		'<g fill="none" stroke="#A3C473" stroke-width="1.4" stroke-linecap="round" '
		+ 'stroke-linejoin="round">'
		+ `<path d="${ellipse(12, 12, 9.5, 9.5, true)}"/>`
		+ '<path d="M12 21.15 L4.0759 7.425 L19.9241 7.425 Z"/></g>'
		+ `<path fill="#D8835A" d="${ellipse(12, 12, 1.1, 1.1, true)}"/>`),
	alloy: () => fileSvg('0 0 44 44', 'alloy-official.svg'),
	allure: () => wrap('0 0 32 32', officialShapes('allure-official.svg').slice(0, 7)
		.map(s => `<path fill="${flat(s)}" d="${s.d}"/>`).join('')),
	...Object.fromEntries(ANGULAR_VARIANTS.map(([id]) => [id, () => siSvg('angular', '#DD0031')])),
	'antlers-html': () => siSvg('statamic', '#FF269E'),
	// the tier-3 vector, in the mark's own two layers — the same file the geometry
	// comes from, which is what a tier-3 provenance pane should show. The file writes
	// the "A" before the disc, so the paint order is reversed here or the disc would
	// bury it
	antlr: () => {
		const sh = officialShapes('antlr-vsicons.svg');
		return wrap('0 0 32 32', `<path fill="#E44A32" d="${sh[1].d}"/>`
			+ `<path fill="#FEFEFE" d="${sh[0].d}"/>`);
	},
	anyscript: () => null,
	// devicon's vector complete, cloud AND the wordmark set inside it — so the pane
	// shows the lockup and the shipped icon shows what was taken out of it
	apex: () => fileSvg('0 0 128 128', 'salesforce-devicon.svg'),
	apib: () => fileSvg('0 0 38 36', 'apib-official.svg'),
	apl: () => null,
	applescript: () => siSvg('apple', '#E0E0E0')
};

// =============================================================================
// STUDIES — the measured alternatives behind the calls that needed one
// =============================================================================

const card = (name, body, win = false) => {
	const at = (px, cls = '', st = '') =>
		`<svg ${cls} ${st} width="${px}" height="${px}" viewBox="0 0 16 16">${body}</svg>`;
	return `<div class="c${win ? ' win' : ''}">${at(64)}<div class="t">${at(16)}${at(22)}${at(32)}</div>`
		+ `${at(16, 'class="px"', 'style="width:150px;height:150px"')}<div class="n">${name}</div></div>`;
};
const page = (lead, cards) => `<style>
body{background:#1e2124;color:#c9d1d9;font:11px ui-monospace,SFMono-Regular,monospace;margin:0;padding:14px}
h2{font:600 13px system-ui;margin:2px 0 4px;color:#e6edf3}
p{color:#8b949e;font:12px/1.5 system-ui;max-width:104ch;margin:0 0 12px}
.g{display:flex;flex-wrap:wrap;gap:9px}
.c{background:#121314;padding:8px 8px 4px;border-radius:7px;text-align:center;width:166px}
.px{image-rendering:pixelated;display:block;margin:6px auto 2px}
.t{display:flex;gap:7px;justify-content:center;align-items:center;margin-top:6px}
.n{font-size:9.5px;color:#8b949e;margin-top:4px}
.c.win{outline:1px solid #2f4436}
</style><body>${lead}<div class="g">${cards.join('')}</div></body>`;

/** The Agda bird, exactly as the brand draws it — strokes and all. */
const agdaStrokes = () => {
	const raw = readFileSync(join(SRCDIR, 'agda-official.svg'), 'utf8');
	const g = raw.slice(raw.indexOf('<g id="logo">'), raw.indexOf('<g id="type"'));
	const ds = [...g.matchAll(/\sd="([^"]+)"/g)].map(m => m[1]);
	const eyes = [...g.matchAll(/<circle[^>]*cx="([\d.]+)"[^>]*cy="([\d.]+)"[^>]*r="([\d.]+)"/g)]
		.map(m => ellipse(+m[1], +m[2], +m[3], +m[3], true));
	return { ds, eyes };
};

export const STUDIES = [
	{
		id: 'agda-and-friends-study',
		width: 1120, height: 830,
		html: (place) => {
			const A = agdaStrokes();
			// the bird sits in x 0..1200, y 0..1000 of the official file
			const birdAt = (t) => `<g transform="translate(1.4 2.6) scale(0.0106)" fill="none" `
				+ `stroke="#A6AEB6" stroke-width="${t}" stroke-linecap="round" stroke-linejoin="round">`
				+ A.ds.map(d => `<path d="${d}"/>`).join('') + '</g>'
				+ `<g transform="translate(1.4 2.6) scale(0.0106)" fill="#A6AEB6">`
				+ A.eyes.map(d => `<path d="${d}"/>`).join('') + '</g>';
			const ahkMark = (fill) => {
				const sp = subpaths(icon('autohotkey').path);
				return place([{ d: sp.join(''), fill }], ENV.compact);
			};
			const adaMark = () => place([{ d: icon('ada').path, fill: '#E0E0E0' }], ENV.flat);
			const shipped = place(genericCode().map(d => ({ d, fill: NEUTRAL })), CODE_ENV);
			// FIX ROUND: the two reductions the ruling made it worth attempting again,
			// built and measured rather than argued away
			const agdaFilled = () => place([{ d: A.ds.join('') + A.eyes.join(''), fill: NEUTRAL }],
				ENV.compact);
			const ahkSp = subpaths(icon('autohotkey').path);
			const ahkRing = () => {
				const b = bbox(ahkSp[1]), k = 0.90;
				return place([{ d: ahkSp[0] + xform(ahkSp[1],
					{ sx: k, dx: b.cx * (1 - k), dy: b.cy * (1 - k) }), fill: '#B0BCCB' }], ENV.compact);
			};
			const cards = [
				card('agda — official strokes, w 36<br>0.37 px line', birdAt(36)),
				card('agda — thickened to 1.2 px<br>head strokes fuse', birdAt(116)),
				card('agda — thickened to 1.8 px<br>the bird is a blot', birdAt(174)),
				card('FIX ROUND · agda filled solid<br>REJECTED: invents the open contour\'s closure',
					agdaFilled()),
				card('ahk2 — the official AHK keycap<br>nothing over 0.50 px of ink', ahkMark('#334455')),
				card('ahk2 — the same, ink lifted<br>legibility does not change', ahkMark('#A6AEB6')),
				card('FIX ROUND · ahk2 counter shrunk 0.90<br>clears 1.50 px — by deleting "AHK"',
					ahkRing()),
				card('ada — the official logotype<br>ink runs 0.19 / 0.75 / 0.94 px', adaMark()),
				card('SHIPPED for all four:<br>the generic-code glyph', shipped, true)
			];
			return page(
				'<h2>The four marks that exist and could not be used &mdash; re-run with sourcing free'
					+ '</h2><p>Four of this tranche\'s '
				+ 'twelve neutral concepts are NOT sourcing declines &mdash; the artwork is real, '
				+ 'published and (for agda and ada) cleanly licensed. They are legibility declines, '
				+ 'and this is the evidence. <b>agda</b> is a bird drawn entirely in 36-unit strokes: '
				+ 'at 0.37&nbsp;px it is invisible, at L5\'s 1.2&nbsp;px floor its parallel head '
				+ 'strokes (0.73&nbsp;px of clearance) fuse into one wedge, and thicker still it is '
				+ 'a blot. <b>ahk2</b> is an outlined keycap with three letters in it, and nothing '
				+ 'in it exceeds 0.50&nbsp;px of sustained ink; it is painted #334455, which '
				+ 'measures 1.86:1 on the editor ground, and the second card lifts the ink to prove '
				+ 'the problem is not only colour. <b>ada</b> is a three-letter logotype whose ink '
				+ 'runs measure 0.19&ndash;0.94&nbsp;px. <b>The fix round re-ran all of this with '
					+ 'sourcing free</b> and added the two cards the ruling made worth building: agda '
					+ 'FILLED as a silhouette, which invents the closure its open body contour does not '
					+ 'have and arrives as a blob with eyes; and the ahk2 keycap with its counter shrunk '
					+ 'until the wall clears 1.50&nbsp;px &mdash; which it does, at the price of deleting '
					+ 'the "AHK" and leaving a plain rounded-square ring. Judge the 16&nbsp;px column.</p>',
					cards);
		}
	},
	{
		id: 'antlr-chrome-study',
		width: 1120, height: 620,
		html: (place) => {
			const sh = officialShapes('antlr-vsicons.svg');
			const disc = subpaths(sh[1].d)[0];
			const antlrParts = [{ d: disc, fill: '#E44A32' }, { d: sh[0].d, fill: '#FEFEFE' }];
			const chromeParts = officialShapes('chrome-official.svg')
				.filter(x => x.fill !== 'none')
				.map(x => ({ d: x.d, fill: flat(x) }));
			const shipped = place(genericCode().map(d => ({ d, fill: NEUTRAL })), CODE_ENV);
			// the strip the ruling actually turns on: the two marks at the tree's own sizes,
			// touching, with nothing else in the frame to help tell them apart
			const A = place(antlrParts, ENV.compact), C = place(chromeParts, ENV.compact);
			const at = (body, px) => `<svg width="${px}" height="${px}" viewBox="0 0 16 16">${body}</svg>`;
			const pair = (px) => `<div class="pr"><span>${px}&nbsp;px</span>`
				+ at(A, px) + at(C, px) + '</div>';
			return page(
				'<h2>antlr &mdash; REINSTATED, and the pair you are being asked to accept</h2>'
				+ '<p>ANTLR\'s mark was sourced (L2 tier 3), built and fitted; it rendered as the '
				+ 'cleanest circle-and-glyph in the slice. The cross-set R7/R8 audit then failed it '
				+ 'against tranche 1\'s <b>chrome</b>: form score <b>0.798</b> against the 0.72 bar '
				+ '(area IoU 0.969 &mdash; two discs of the same diameter are one silhouette), with '
				+ 'the two dominant reds 3.4 degrees of hue apart. <b>The fix-round ruling reinstates '
				+ 'it</b> under a DECLARED look-alike lane: the pair is reported with these same scores '
				+ 'on every run and never fails, while an UNDECLARED pair scoring the same still does. '
				+ 'Neither geometry changed. <b>The strip below is the decision</b> &mdash; antlr and '
				+ 'chrome at a true 16, 22 and 32&nbsp;px, side by side, which is how they will meet in '
				+ 'a file tree. If that is too close, say so and antlr goes back to the third card and '
				+ 'the lane closes; it has exactly one member and exists only for this pair.</p>'
				+ `<div class="pairs">${pair(16)}${pair(22)}${pair(32)}</div>`
				+ '<style>.pairs{display:flex;gap:30px;align-items:flex-end;background:#121314;'
				+ 'padding:16px 20px;border-radius:8px;margin:0 0 14px;width:max-content}'
				+ '.pr{display:flex;gap:9px;align-items:center}'
				+ '.pr span{color:#6e7681;font-size:9.5px}</style>',
				[
					card('antlr &mdash; SHIPPED again<br>#E44A32 disc, #FEFEFE A',
						place(antlrParts, ENV.compact), true),
					card('chrome &mdash; tranche 1, approved<br>the mark it is declared against',
						place(chromeParts, ENV.compact)),
					card('what it goes back to if you say no<br>the generic-code glyph', shipped)
				]);
		}
	},
	{
		id: 'angular-variants-study',
		width: 1120, height: 830,
		html: (place) => {
			const ang = (fill) => place([{ d: subpaths(icon('angular').path).join(''), fill }], ENV.tall);
			const MATERIAL = [['component', '#1976D2'], ['directive', '#BA68C8'], ['guard', '#43A047'],
				['interceptor', '#FB8C00'], ['pipe', '#00897B'], ['resolver', '#43A047'],
				['service', '#FFCA28']];
			const cards = [
				card('SHIPPED &mdash; all seven<br>Angular\'s own #DD0031', ang('#DD0031'), true),
				...MATERIAL.map(([n, hex]) => card(`Material\'s angular-${n}<br>${hex} (its own palette)`, ang(hex)))
			];
			return page(
				'<h2>Angular &mdash; seven variants, one mark, and whose colours</h2><p>Material '
				+ 'declares all seven angular-* icons as <code>clone: { base: "angular", color: '
				+ '&lt;palette name&gt; }</code>: the base mark recoloured, no variant geometry '
				+ 'anywhere in the theme, and vscode-icons and Great Icons draw no variants at all. '
				+ 'So working rule 1 has nothing to adapt and branch (b) applies &mdash; all seven '
				+ 'ship the base mark byte-identically in <b>Angular\'s own #DD0031</b> '
				+ '(brand-colors.json; the pilot ruled brand-colors wins the primary hex). The other '
                + 'seven cards are what Material actually renders, at the hexes its palette names '
				+ 'resolve to. Note guard and resolver are the SAME green, so even Material only gets '
				+ 'six colours out of seven. Adopting them means putting invented hues on a brand '
				+ 'that publishes its own.</p>', cards);
		}
	}
];

/**
 * Every judgement call this tranche made, in the sheet's numbered flags section.
 * `rule` names the law or working rule the call sits under; `subjects` is what it
 * touches, so a verdict can be applied without re-reading the prose.
 */
export const FLAGS = [
	{
		title: 'angular &mdash; seven ids, ONE payload, and Material\'s seven colours are Material\'s',
		rule: 'working rule 1(b) / R1 palette',
		subjects: ['angular-component', 'angular-directive', 'angular-guard', 'angular-interceptor',
			'angular-pipe', 'angular-resolver', 'angular-service'],
		text: 'The brief expected these to be rule 1(<b>a</b>) &mdash; adapt Material\'s established '
			+ 'variant glyphs in Angular\'s colours. <b>Material has no variant glyphs.</b> Its own '
			+ 'file-icon definitions declare every one of the seven as <code>clone: { base: '
			+ '"angular", color: &lt;material palette name&gt; }</code>: the base mark recoloured '
			+ 'and nothing else, with no <code>angular-component.svg</code> or its kin anywhere in '
			+ 'the theme. vscode-icons and Great Icons draw no angular variants at all. So branch '
			+ '(a) has nothing to adapt and branch (b) fires: <b>all seven ship the Angular mark '
			+ 'byte-identically</b>, in Angular\'s own <code>#DD0031</code> from brand-colors.json, '
			+ 'and the check asserts that identity rather than trusting it. <b>The alternative, '
			+ 'measured:</b> adopt Material\'s hues &mdash; #1976D2, #BA68C8, #43A047, #FB8C00, '
			+ '#00897B, #43A047, #FFCA28. They are invented by Material for Material, R1 has no '
			+ 'place for invented colour, and they do not even separate the seven: <b>guard and '
			+ 'resolver get the SAME green</b>, so seven concepts come out in six colours. All '
			+ 'eight candidates are rendered at a true 16 px in '
			+ '<code>proofs/angular-variants-study.png</code>. <b>What you are ruling on:</b> in '
			+ 'the tree a <code>user.component.ts</code>, a <code>auth.guard.ts</code> and a '
			+ '<code>api.service.ts</code> will all show the same red Angular A. Say the word and '
			+ 'they become seven hues that no brand publishes. <b>Which mark:</b> the 2023 A, not '
			+ 'the 2016 red shield &mdash; angular.dev/press-kit deprecates the shield outright. '
			+ '<b>Which red:</b> the 2023 mark is published as a gradient plus flat black and '
			+ 'white, and as PNG/GIF only, with no SVG anywhere in the press kit; brand-colors '
			+ 'wins the primary hex by the pilot\'s own ruling, so #DD0031 it is.'
	},
	{
		title: 'RULE 2 at scale &mdash; twelve of thirty-five collapse onto one glyph',
		rule: 'working rule 2',
		superseded: 'PARTLY SUPERSEDED by the fix-round ruling (2026-09-03). SEVEN of the '
			+ 'thirteen left the pile: the six corporate marks (actionscript, adobe-swc, al, '
			+ 'al-dal, apex, applescript) ship their real marks, and antlr is reinstated under a '
			+ 'declared look-alike lane. SIX remain — ada, affectscript, agda, ahk2, anyscript, '
			+ 'apl — and every one of those is a legibility or a no-mark-at-all verdict, not a '
			+ 'licence one. See flags 40, 41 and 42.',
		subjects: ['actionscript', 'ada', 'adobe-swc', 'affectscript', 'agda', 'ahk2', 'al',
			'al-dal', 'anyscript', 'antlr', 'apex', 'apl', 'applescript'],
		text: 'This is the biggest single fact about the tranche and it should not arrive as a '
			+ 'surprise on the sheet. Thirteen of thirty-five concepts ship the '
			+ '<code>generic-code</code> category glyph, byte for byte, so thirteen rows of the file '
			+ 'tree will carry the same gray angle brackets. They fall into <b>four different piles '
			+ 'and the flags below take them separately</b>: six are corporate marks this build '
			+ 'DECLINES (actionscript, adobe-swc, al, al-dal, apex, applescript), four are real '
			+ 'marks that CANNOT SURVIVE 16 px (ada, agda, ahk2, apl), one was built from its mark '
			+ 'and then FAILED BY THE TWIN AUDIT (antlr), and two own no mark at all (affectscript, '
			+ 'anyscript). Overturning any one flag moves subjects out of the pile. '
			+ 'The glyph itself is tranche 1\'s <code>generic-code</code>, used here for the first '
			+ 'time; it is placed at 1.16x its authored size so twelve shared rows carry the set\'s '
			+ 'normal ink mass (148) instead of 110 &mdash; the same move tranche 1 made on '
			+ 'generic-binary. <b>abc is NOT in this pile:</b> .abc is music notation, so it gets an '
			+ 'object glyph (a note, new in geom.mjs) the way disc and lib did.'
	},
	{
		title: 'Six corporate marks declined &mdash; and the line this tranche drew, stated so you can move it',
		rule: 'L2 sourcing',
		superseded: 'SUPERSEDED IN FULL by the fix-round ruling (2026-09-03). This flag\'s '
			+ 'own closing sentence named the lever — "to overturn: rule that a theme\'s '
			+ 'MIT-licensed trace of a removed corporate mark is an acceptable source, and six '
			+ 'icons change in one edit" — and that is exactly what happened. All six ship their '
			+ 'real marks; see flag 40. Kept in place because the hunts it records are still the '
			+ 'hunts, and because its Microsoft half was already corrected by flag 25.',
		subjects: ['actionscript', 'adobe-swc', 'al', 'al-dal', 'apex', 'applescript'],
		text: 'Tranche 1 declined the VS Code ribbon and the Java cup. This tranche had six more of '
			+ 'the same shape and applied one testable rule rather than six judgement calls. '
			+ '<b>The rule:</b> for a brand this large, ABSENCE from simple-icons is evidence of a '
			+ 'trademark removal, not of obscurity &mdash; a CC0 library carrying 3,457 brands does '
			+ 'not simply forget Adobe. Where both L2 tiers are empty (no brand vector under '
			+ 'citable terms AND no CC0 trace) the mark is declined. <b>Adobe</b> '
			+ '(actionscript, adobe-swc): no Adobe marks remain in v16.29.0, same removal that took '
			+ 'Microsoft\'s. <b>Microsoft</b> (al, al-dal): tranche 1\'s vsix finding, unchanged, '
			+ 'plus this set ships inside a VS Code fork. <b>Salesforce</b> (apex): no '
			+ '<code>salesforce</code> entry, no citable vector &mdash; and this is the painful one, '
			+ 'because the Salesforce cloud is a clean silhouette that would have rendered '
			+ 'beautifully at 16 px. It is declined on sourcing alone. <b>Apple</b> (applescript) is '
			+ 'the exception that proves the rule is not mechanical: simple-icons DOES carry '
			+ '<code>apple</code> (CC0), so the tier is not empty &mdash; it is declined because the '
			+ 'Apple logo is the COMPANY\'s mark and not AppleScript\'s (tranche 1\'s safetensors '
			+ 'reading) and because Apple\'s identity guidelines forbid third-party use outright. '
			+ 'Both Material and vscode-icons desaturate it, which is a tell. <b>The counter-example '
			+ 'is abap:</b> SAP IS in simple-icons, so ABAP ships the SAP mark. That is what makes '
			+ 'the line a line and not a mood. <b>To overturn:</b> rule that a theme\'s MIT-licensed '
			+ 'trace of a removed corporate mark is an acceptable source, and six icons change in '
			+ 'one edit.'
	},
	{
		title: 'Four marks that exist, are published, and cannot hold 16 px',
		rule: 'L5 / prettier rider',
		superseded: 'RE-TESTED, NOT SUPERSEDED (fix round, 2026-09-03). Sourcing is free '
			+ 'now, so all four were re-measured with the whole pool open and every one still '
			+ 'fails on L5 — the ruling freed the licences, not the physics. ONE FACTUAL '
			+ 'CORRECTION: this flag says of ahk2 that #334455 at 1.86:1 is a contrast the lift '
			+ 'rule cannot reach "above the L 22 trigger". The fix round re-derived that trigger '
			+ 'to test CONTRAST at 3.0:1 rather than lightness, so the rule does reach it now — '
			+ 'and it changes nothing, because this flag\'s own study already rendered the mark '
			+ 'lifted and it is exactly as illegible. The new measurements and every reduction '
			+ 'attempted are in flag 42.',
		subjects: ['ada', 'agda', 'ahk2', 'apl'],
		text: 'These are NOT sourcing declines &mdash; the artwork is real and two of them are '
			+ 'cleanly licensed. They are legibility declines, and '
			+ '<code>proofs/agda-and-friends-study.png</code> renders every candidate at a true '
			+ '16 px so the verdicts can be checked instead of believed. <b>agda:</b> the project\'s '
			+ 'own bird (agda/agda, doc/user-manual/agda.svg) is drawn ENTIRELY in strokes &mdash; '
			+ '36 units on a 1200-unit mark, i.e. 0.37 px &mdash; and L8 bans strokes. Thicken to '
			+ 'L5\'s 1.2 px floor and the three parallel head strokes, which have 0.73 px of '
			+ 'clearance, fuse into one wedge; thicken further and it is a blot. Its body outline is '
			+ 'open, so it cannot be filled as a silhouette without inventing the closure. '
			+ '<b>ada:</b> ada-lang.io\'s mark is a three-letter LOGOTYPE (simple-icons '
			+ '<code>ada</code>, CC0). At the flat envelope &mdash; the widest fit the grid allows '
			+ '&mdash; the whole thing is 15.2 &times; 6.5 px and its ink runs measure '
			+ '0.50&ndash;1.00 px. This is the npm-wordmark case the pilot already ruled on, except '
			+ 'Ada publishes no square mark to fall back to. <b>ahk2:</b> AutoHotkey\'s keycap has '
			+ 'nothing in it over 0.50 px of sustained ink, and its official #334455 measures '
			+ '1.86:1 against the editor ground &mdash; no lift rule reaches it (L 26.7, above the '
			+ 'L 22 trigger) and inventing a brighter AutoHotkey blue is not R1\'s to do. '
			+ '<b>apl:</b> APL has no owner, so there is no official mark at all; the APL Wiki\'s '
			+ 'community logo is an apple-cube whose defining feature is a matrix subdivision, and '
			+ 'aplwiki.com refuses automated fetches (403 on every attempt). <b>To overturn any of '
			+ 'these</b> you are ruling that an icon may ship illegible, which is the one thing '
			+ 'every version of this style guide has refused.'
	},
	{
		title: 'abap ships the SAP mark &mdash; letters and all',
		rule: 'L2 / L5',
		subjects: ['abap'],
		text: 'The corporate-mark flag needs a counter-example or it is just a mood, and this is it. '
			+ 'ABAP is SAP\'s language and .abap files exist nowhere but inside a SAP system, so the '
			+ 'SAP mark applies (the AdvPL reading, and the opposite of tranche 1\'s safetensors '
			+ 'call). SAP publishes its own vector AND simple-icons carries a CC0 trace, so unlike '
			+ 'Adobe and Microsoft neither tier is empty. <b>The geometry is the CC0 trace, not '
			+ 'SAP\'s own file</b>, for a boring reason: SAP\'s file paints its field with a '
			+ '<code>&lt;polyline&gt;</code>, which is not a path, and rebuilding it would mean '
			+ 'transcribing brand coordinates by hand. The brand file is fetched to '
			+ '<code>sources-svg/sap-official.svg</code> and is what the fidelity strip shows. '
			+ '<b>What to look at:</b> the letters. Measured on the shipped 16 px render, the "SAP" '
			+ 'stems are 1.00&ndash;1.25 px &mdash; AT L5\'s official-forced floor rather than under '
			+ 'it &mdash; and printed white on the mark\'s own blue field, which is the '
			+ 'highest-contrast pairing in the tranche. They resolve. dotenv needed the prettier '
			+ 'rider at 0.50 px; this does not, and no reduction was made. <b>Licence, honestly:</b> '
			+ 'SAP trademark, no declared terms on the brand file; the shipped geometry is CC0.'
	},
	{
		title: 'advpl &mdash; the BRAND draws the variants, so working rule 1 needs a third mode',
		rule: 'working rule 1 (new mode)',
		subjects: ['advpl', 'advpl-include', 'advpl-ptm', 'advpl-tlpp'],
		text: 'Rule 1 as written has two branches: adapt a source theme\'s variant glyph (a), or '
			+ 'ship the family base identically (b). AdvPL fits neither, and it fits neither for the '
			+ 'best possible reason. <b>TOTVS ships the variant artwork itself.</b> '
			+ '<code>github.com/totvs/advpl-vscode</code> &mdash; TOTVS\'s own VS Code extension, '
			+ 'MIT &mdash; carries <code>icon_advpl.svg</code>, <code>icon_include.svg</code>, '
			+ '<code>icon_ptm.svg</code> and <code>icon_tlpp.svg</code>: the TOTVS symbol in four '
			+ 'colours, one per file type, differing in <b>nothing but the fill</b> (diffed, and the '
			+ 'geometry is character-for-character identical). So the per-variant colours here are '
			+ 'OFFICIAL, which is exactly what Material\'s angular hues are not. Each variant reads '
			+ 'its own file and ships its own hex: <code>#337AB7</code> blue, <code>#33B7B6</code> '
			+ 'teal, <code>#B73733</code> red, <code>#B7AC33</code> olive. <b>The declaration:</b> '
			+ 'the family is recorded with <code>mode: "recolour"</code>, byte-identity is NOT '
			+ 'expected, and the twin audit prints the four in its family lane with their real form '
			+ 'scores instead of failing them for sharing a silhouette. If you would rather rule 1 '
			+ 'stayed a two-branch rule, the alternative is collapsing all four onto one blue icon '
			+ 'under branch (b) &mdash; which would throw away colour the brand publishes.'
	},
	{
		title: 'affinity and affinitypublisher &mdash; one live mark, one retired one',
		rule: 'L2 / working rule 1(b)',
		subjects: ['affinity', 'affinitypublisher'],
		text: 'Two calls in one subject pair. <b>The mark:</b> Serif/Canva serves the Affinity mark '
			+ 'as a plain SVG at <code>affinity.serif.com/favicon.svg</code> &mdash; the pale-green '
			+ 'field with the black "a" swirl &mdash; so the brand tier wins outright and '
			+ 'vscode-icons traces the same drawing. Licence: none declared, Serif/Canva trademark. '
			+ 'That is the chrome situation from tranche 1 and it is flagged the same way. <b>The '
			+ 'family:</b> .afpub is an Affinity Publisher document, and Publisher DID have its own '
			+ 'app icon in the Affinity 2 suite &mdash; the red "canyon" illustration vscode-icons '
			+ 'still traces. Serif/Canva retired the three per-app icons when Affinity became one '
			+ 'application, so the mark the brand publishes for .afpub today is the Affinity mark '
			+ 'itself; and the retired icon would not have survived anyway, being an eleven-layer '
			+ 'gradient illustration that R1 flattens to a red triangle &mdash; the exact gestalt '
			+ 'failure the pilot gate rejected on docker and editorconfig. So rule 1(b): '
			+ 'affinitypublisher ships the Affinity mark byte-identically. <b>To overturn:</b> rule '
			+ 'that a retired app icon is still the file type\'s mark, and accept the flattening.'
	},
	{
		title: 'antlr &mdash; sourced, built, and then removed by the twin audit',
		rule: 'L9 gate 4 (R7/R8) / L2 sourcing (tier 3)',
		superseded: 'SUPERSEDED by the fix-round ruling (2026-09-03) — this flag\'s SECOND '
			+ 'option was taken: "rule that two brands whose real marks genuinely resemble each '
			+ 'other may both keep them and relax R8 for declared pairs". antlr is reinstated and '
			+ 'the antlr/chrome pair now sits in a declared LOOK-ALIKE lane that reports these '
			+ 'same scores every run and never fails. See flag 41 — and look at the study before '
			+ 'you accept it.',
		subjects: ['antlr', 'chrome'],
		text: 'The one subject in this tranche whose verdict was decided by a GATE and not by a '
			+ 'hunt, so the whole sequence is on the record. <b>The hunt succeeded</b>, on L2\'s '
			+ 'third tier &mdash; the first time that tier has fired anywhere in this set. '
			+ 'antlr.org publishes the mark (an orange-red disc with a white "A") only as '
			+ '<code>images/antlr-logo.png</code>, 220 &times; 80; every SVG path on the site and in '
			+ 'antlr/website-antlr4 answers 404, and tracing a PNG is freehand. simple-icons has no '
			+ '<code>antlr</code> entry &mdash; NOT the Adobe situation, just a small BSD-licensed '
			+ 'project. Three independent faithful vectors of the same drawing exist (vscode-icons '
			+ 'MIT, Material MIT, mike-lischke/vscode-antlr4) and vscode-icons\' carries the disc '
			+ 'AND the "A" in the mark\'s own two-layer construction. It was built from that vector '
			+ 'and its 16 px render was the cleanest circle-and-glyph in the slice. <b>Then the '
			+ 'cross-set twin audit failed it against tranche 1\'s chrome:</b> R8 form <b>0.798</b> '
			+ 'against the 0.72 bar (area IoU 0.969 &mdash; two discs of the same diameter are one '
			+ 'silhouette), and R7 on top of it, ANTLR\'s #E44A32 and Chrome\'s #EA4335 being 3.4 '
			+ 'degrees of hue apart. In the tree a <code>.crx</code> and a <code>.g4</code> would '
			+ 'have been the same red disc. No fit fixes it: the envelope law has no room to shrink '
			+ 'one disc by a quarter. Both renders are side by side at a true 16 px in '
			+ '<code>proofs/antlr-chrome-study.png</code>. <b>Your options:</b> accept the neutral '
			+ 'glyph (what ships); rule that two brands whose real marks genuinely resemble each '
			+ 'other may both keep them and relax R8 for declared pairs; or re-treat chrome, which '
			+ 'is tranche 1\'s and untouched here. The vector and the brand\'s PNG are both kept in '
			+ '<code>sources-svg/</code>, so reinstating it is a five-line edit.'
	},
	{
		title: 'Two prettier riders, both mechanical: alchemy and apib',
		rule: 'L5 / prettier rider',
		subjects: ['alchemy', 'apib'],
		text: 'Both marks are line drawings whose lines are under the floor, and both were fixed by '
			+ 'moving nothing &mdash; the onnx principle. <b>alchemy</b> (circle, inscribed '
			+ 'triangle, dot) is drawn with 1.4-unit STROKES, which L8 bans and which measure 0.90 '
			+ 'px anyway. The stroke-to-fill conversion is exact rather than a redraw: a stroke of '
			+ 'width t around radius r IS the annulus r &plusmn; t/2, and offsetting a triangle\'s '
			+ 'three edges by t/2 produces a similar triangle about its incentre, so every vertex '
			+ 'and angle stays put. t is then raised 1.4 &rarr; 2.0 units, landing the line on 1.23 '
			+ 'px. <b>apib</b> (three rings joined by two bars) has 0.59 px ring walls and 0.44 px '
			+ 'connectors. Each ring\'s counter is scaled about its own centre by 0.60 &mdash; wall '
			+ '0.59 &rarr; 1.26 px, hole still 2.01 px across, outer circles and centres untouched '
			+ '&mdash; and the two connectors are re-emitted as 3.6-unit bars (1.21 px) between the '
			+ 'official ring centres, which is precisely what prettier\'s surviving rows did. '
			+ '<b>The choice worth knowing about:</b> filling the apib rings SOLID was the easy '
			+ 'reduction and is what Material does. It clears the floor trivially and makes it a '
			+ 'different mark; the rings are kept as rings.'
	},
	{
		title: 'Four brand files, no declared licences &mdash; the chrome situation, four more times',
		rule: 'L2 licensing',
		superseded: 'SUPERSEDED as a question by the fix-round ruling (2026-09-03): licence '
			+ 'exposure no longer needs a decision, because it no longer gates anything. The '
			+ 'RECORD stands and grows — every source and licence is still written down verbatim, '
			+ 'here and on every subject the fix round added.',
		subjects: ['affinity', 'affinitypublisher', 'alloy', 'allure'],
		text: 'Tranche 1 shipped Google\'s chrome-logo.svg with "no declared licence &mdash; Google '
			+ 'trademark" written on the sheet, and that precedent is now carrying weight. Four more '
			+ 'subjects sit in the same place and each one is recorded, not smoothed over. '
			+ '<b>affinity / affinitypublisher:</b> Serif/Canva\'s own favicon.svg, no terms. '
			+ '<b>alloy:</b> grafana.com\'s own media asset, no terms &mdash; though the project it '
			+ 'belongs to (grafana/alloy) is Apache-2.0. <b>allure:</b> allurereport.org\'s own site '
			+ 'asset, no terms &mdash; the projects (allure2, allure3) are Apache-2.0. (antlr would '
			+ 'have been a fourth; the twin audit removed it first.) Against that, the '
			+ 'cleanly-licensed half of the tranche: advpl &times;4 (MIT), '
			+ 'abelljs (MIT), apib (MIT), alchemy (Apache-2.0) and everything from simple-icons '
			+ '(CC0). <b>Nothing here needs a decision to proceed</b> &mdash; it needs you to know '
			+ 'the shape of the exposure, and to say if the bar should be higher than chrome set it.'
	},
	{
		title: 'ahk2 has no family declared, and tranche 3 needs to know why',
		rule: 'working rule 1 / cross-tranche',
		superseded: 'RE-TESTED, NOT SUPERSEDED (fix round, 2026-09-03). The legibility call '
			+ 'it rests on was re-measured from both sides and holds, so ahk2 and autohotkey both '
			+ 'stay on the glyph and no family is declared — exactly as this flag predicted. See '
			+ 'flag 42.',
		subjects: ['ahk2'],
		text: 'The brief asked for a family declaration with <code>autohotkey</code> as a base '
			+ 'marked pending-tranche-3, so tranche 3 could assert byte-identity from the other '
			+ 'side. <b>That declaration is deliberately NOT made</b>, because the hunt came out the '
			+ 'other way: the AutoHotkey mark cannot hold 16 px (see the legibility flag), so ahk2 '
			+ 'ships the neutral glyph and there is no family mark for a base to be identical TO. '
			+ 'Declaring one would have been a fiction the check would have happily passed. '
			+ '<b>What tranche 3 should do:</b> measure <code>autohotkey</code> itself &mdash; it is '
			+ 'the same keycap, so the same numbers apply (nothing over 0.50 px of sustained ink, '
			+ '#334455 at 1.86:1) &mdash; and reach the same verdict, at which point both ids sit in '
			+ 'the <code>generic-code</code> collapse and no family is needed at all. <b>If you '
			+ 'overturn the legibility call</b>, ahk2 and autohotkey become a rule-1(b) family and '
			+ 'the declaration goes in tranche 3\'s module, where the base actually lives.'
	},
	{
		title: 'TOOLING &mdash; the slice sheet still describes tranche 1 only',
		rule: 'process',
		subjects: [],
		text: 'Not an icon call, but the sheet is what this gate is decided on, so it should not '
			+ 'mislead. <code>tools/build-slice-sheet.mjs</code> hard-codes tranche 1\'s narrative: '
			+ 'its header says the revision "covers the roster\'s archive and binary categories" '
			+ '(it now covers code as well), its second panel says one subject needed the prettier '
			+ 'rider (three do), and section 5 tells you to look at "flags 3, 4 and 7", which are '
			+ 'tranche 1\'s numbers. This tranche did not touch that file, on the brief\'s '
			+ 'instruction that its entire integration is <code>A01.t2.mjs</code>. <b>The fix is one '
			+ 'small edit</b> &mdash; drive those three sentences off the manifest the way the rest '
			+ 'of the page already is &mdash; and it wants doing before tranche 3 lands and makes it '
			+ 'worse.'
	}
];

// =============================================================================
// FIX-ROUND FLAGS — appended after every tranche's FLAGS, so 1-35 keep their
// numbers. Tranche 1's fix flags are 36-39; these are 40-42.
// =============================================================================

export const FIX_FLAGS = [
	{
		title: 'Six corporate marks reinstated &mdash; what each one turned out to be',
		rule: 'L2 sourcing (ruled) / working rule 1(b)',
		subjects: ['actionscript', 'adobe-swc', 'al', 'al-dal', 'apex', 'applescript'],
		text: 'Flag 13 declined six marks on one testable rule and the ruling voids the rule '
			+ 'outright. All six ship, and the hunts are worth reading because two of them came '
			+ 'out differently from what the flag assumed. <b>al / al-dal &mdash; the surprise.</b> '
			+ 'Flag 13 said vscode-icons "draws an AL monogram, which R1 has no place for". It is '
			+ 'not vscode-icons\' monogram: <b>Microsoft draws it</b>. The AL Language extension '
			+ 'for Dynamics 365 Business Central (<code>ms-dynamics-smb.al</code>, the extension '
			+ 'every .al file is edited with) ships <code>img/AL_file_logo.svg</code> &mdash; '
			+ 'titled inside the file "AL logo_VS_smallest version_v3" &mdash; and registers it in '
			+ 'its own file-icon theme against the <code>al</code> language id. vscode-icons is '
			+ 'tracing that file, down to the #2EA98E. So this is the brand\'s own mark for the '
			+ 'brand\'s own file type, and it is a faithful letterform lockup exactly as SAP\'s '
			+ '"SAP" is: measured, its stems run <b>1.63&ndash;1.81&nbsp;px</b>, half again '
			+ 'thicker than abap\'s 1.00&ndash;1.25 which the gate already passed. al-dal is rule '
			+ '1(b) on it &mdash; Microsoft ships one AL icon for the language, not one per file '
			+ 'type. <b>actionscript / adobe-swc.</b> Adobe\'s corporate red "A", three straight '
			+ 'strokes and an open counter, from gilbarbara/logos\' faithful vector (Adobe serves '
			+ 'no vector from adobe.com under any path that answers). Animate\'s and Flash '
			+ 'Professional\'s icons were looked at and rejected: both are LETTER PLATES ("An", '
			+ '"Fl"), a monogram in a box, which is what R1\'s letter ban exists to keep out. '
			+ 'adobe-swc is rule 1(b) on actionscript &mdash; a .swc is ActionScript compiled. '
			+ '<b>apex.</b> The Salesforce cloud, from devicon\'s MIT vector, with the '
			+ '"salesforce" wordmark set inside it dropped as a lockup. Flag 13 called this "the '
			+ 'painful one, because the cloud would have rendered beautifully"; it does &mdash; '
			+ '1.69&nbsp;px at the 5th percentile, the most comfortable mark in the tranche. '
			+ '<b>applescript &mdash; the one still worth arguing about.</b> AppleScript\'s OWN '
			+ 'icon was hunted first, as its identity really is the Script Editor parchment '
			+ 'scroll; that scroll lives inside macOS as <code>.icns</code> raster and Apple '
			+ 'publishes no vector of it, and L2 hard-rejects tracing a raster &mdash; a FIDELITY '
			+ 'rule the ruling does not reach. So the Apple logo ships, lifted to L&nbsp;88 by the '
			+ 'one documented L2 rule (Apple publishes the mark in black and white only). '
			+ '<b>That leaves the company-mark-for-a-language objection standing</b>, the same one '
			+ 'flag 38 raises for safetensors; both are yours to rule on together.'
	},
	{
		title: 'antlr is REINSTATED &mdash; and this is the one to look at before you accept it',
		rule: 'L9 gate 4 (R7/R8) / declared look-alike lane',
		ruling: true,
		subjects: ['antlr', 'chrome'],
		text: '<b>Look at <code>proofs/antlr-chrome-study.png</code> before reading further.</b> '
			+ 'antlr was never a licence decline: it was sourced, built, rendered as the cleanest '
			+ 'circle-and-glyph in the slice, and then removed by the cross-set twin audit for '
			+ 'colliding with tranche 1\'s chrome. Flag 18 listed three ways out and the ruling '
			+ 'takes the second: <i>"rule that two brands whose real marks genuinely resemble each '
			+ 'other may both keep them and relax R8 for declared pairs"</i>. <b>What is now in '
			+ 'the engine.</b> A new LOOK-ALIKE lane in <code>audit.mjs</code>, chartered by this '
			+ 'ruling. A declared pair is reported with its LIVE R7/R8 scores on every run and '
			+ 'never fails; the declaration must name both ids and the ruling that opened it, and '
			+ 'lives in the tranche that owns the mark. <b>An undeclared pair scoring the same '
			+ 'still fails</b>, which is the whole point &mdash; this is a lane, not a mute '
			+ 'button, and it prints exactly what it is exempting. <b>The numbers have not '
			+ 'changed</b>, because the geometry has not: R8 form <b>0.798</b> against the 0.72 '
			+ 'bar, area IoU <b>0.969</b> (two discs of the same diameter are one silhouette), the '
			+ 'two dominant reds <b>3.4 degrees</b> of hue apart. <b>What you are accepting:</b> '
			+ 'in the tree a <code>.crx</code> and a <code>.g4</code> are both a red disc, told '
			+ 'apart by a white "A" against four coloured blades. The study renders them side by '
			+ 'side at a true 16, 22 and 32&nbsp;px. If that is a step too far, say so and antlr '
			+ 'goes back to the glyph and the lane closes &mdash; it has exactly one member and '
			+ 'exists only for this pair.'
	},
	{
		title: 'The second rider attempts &mdash; four marks re-measured with sourcing free, four still out',
		rule: 'L5 / prettier rider',
		subjects: ['ada', 'agda', 'ahk2', 'apl'],
		text: 'The ruling freed the licences and not the physics, and flag 14\'s four are where '
			+ 'that shows. Every one was rebuilt and re-measured with the whole source pool open, '
			+ 'and every reduction that could be attempted was attempted &mdash; the bar being the '
			+ 'pilot\'s own editorconfig, which went from "a line drawing cannot survive" to an '
			+ 'approved reduction. <b>ada.</b> ada-lang.io\'s "Ada" logotype, CC0 from '
			+ 'simple-icons. At the flat envelope &mdash; the widest fit the grid allows &mdash; '
			+ 'the lockup is 15.2&nbsp;&times;&nbsp;6.5&nbsp;px and its ink runs measure '
			+ '<b>0.19&nbsp;px at the 5th percentile, 0.75 at the 25th, 0.94 at the median</b>. '
			+ 'The dotenv reduction has nothing to reduce TO: dropping letters off a three-letter '
			+ 'logotype leaves "A", which is a letter and not a mark, and Ada publishes no square '
			+ 'mark to fall back on the way npm did. <b>agda.</b> The project\'s own bird, drawn '
			+ 'entirely in 36-unit strokes on a 1200-unit mark = 0.37&nbsp;px, with an OPEN body '
			+ 'contour. Filling it as a silhouette invents the closure and produces a gray blob '
			+ 'with two eyes that is not the bird; thickening to L5\'s floor fuses the three '
			+ 'parallel head strokes, which have 0.73&nbsp;px of clearance. Both are rendered in '
			+ '<code>proofs/agda-and-friends-study.png</code>. <b>ahk2 (with autohotkey).</b> Three '
			+ 'reductions measured: the keycap at official weight (nothing over 0.50&nbsp;px), the '
			+ 'keycap with its ink LIFTED out of the #334455 contrast problem (identical '
			+ 'legibility &mdash; colour was never the binding constraint), and the keycap with '
			+ 'its counter shrunk to put the wall on 1.50&nbsp;px. Only the third clears the floor '
			+ 'and only by <b>deleting the "AHK"</b>, which leaves a plain rounded-square ring: '
			+ 'not the mark, and a shape the vocabulary already spends on generic-binary. '
			+ '<b>apl.</b> Unchanged and not a licence case at all &mdash; APL has no owner and no '
			+ 'official mark; the APL Wiki\'s community logo is a matrix-subdivided apple-cube '
			+ 'whose defining feature is the subdivision. <b>All four stay on the glyph</b>, and '
			+ 'the thing to notice is that the reason is now uniform: every subject still carrying '
			+ 'gray brackets in this tranche is there because it cannot be READ, or because there '
			+ 'is genuinely nothing to draw.'
	}
];
