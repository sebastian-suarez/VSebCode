// A02.t1.mjs — slice A02, tranche 1: the CODE category, bosque → circom.
//
//   bosque · bower · brainfuck · bruno · buckbuild · bucklescript · c-al · c3 ·
//   cabal · caddy · cadence · cairo · cake · cakephp · cangjie · capnp · casc ·
//   cbx · cddl · cds · ceylon · cf · cfc · cfm · chef · chef-cookbook · chess ·
//   circom
//
// Same law as the pilot and slice A01 (guide §5 / L1-L10, D22 R1 "True colour",
// as amended at the A01 gate): where a brand publishes a mark the icon IS that
// mark, adapted from the brand's own vector or from whatever faithful vector of
// the real mark exists — licence and trademark are RECORDED and do not gate —
// and where no usable mark exists the concept takes the shared neutral vocabulary
// in one gray. Every source hunt, every reduction and every judgement call is
// written down here and lands in the slice manifest and on the sheet.
//
// SOURCE HUNT RESULT for these twenty-eight. The chain is ordered by FIDELITY
// alone (D22 amendment): the brand's own SVG, then any faithful vector of the
// real mark wherever it lives, then — only after a hunt that came up empty —
// the neutral vocabulary. Every failure below was actually attempted:
//
//   brand's own SVG   bower (bower.github.io/img/bower-logo.svg)
//                     bucklescript (rescript-lang.org's own brand file — see the
//                                   successor-brand flag)
//                     c3 (c3-lang.org/assets/logo.svg)
//                     cabal (haskell/cabal-website images/Cabal.svg)
//                     caddy (caddyserver.com/resources/images/logo-light.svg)
//                     cadence (cadence-lang.org/img/logo.svg)
//                     cake (cake-build/graphics svg/cake.svg)
//                     cakephp (cakephp.org/img/cake-logo.svg)
//                     circom (iden3.io/img/logos/circom.svg)
//                     cf / cfc / cfm — MOVED HERE BY THE FIX ROUND. Two Adobe
//                                   files: the 2021 ColdFusion logo and Adobe's
//                                   own FRAMED product icon, adobe.com/content/
//                                   dam/shared/images/product-icons/svg/
//                                   coldfusion.svg
//   faithful vector   bosque   — MICROSOFT PUBLISHES NO VECTOR: every file under
//                                microsoft/BosqueLanguage resources/brand/ that
//                                ends in .svg is a 4096 px PNG in an <image>
//                                wrapper (Bosque.svg 66 KB, the Fluent icon
//                                248 KB, Fabric-Bosque 697 KB — every one of them
//                                a single <image> tag). vscode-icons' vector of
//                                the same Fluent
//                                icon is the geometry
//                     buckbuild the ONE place in this tranche where the brand
//                                tier was sourced and then DECLINED: Buck 2's own
//                                vector is a leaping deer whose sustained ink
//                                runs are 0.22 / 0.38 / 0.88 px at the 5th, 25th
//                                and 50th percentiles — jar's numbers — and which
//                                does not read as an animal at 16 px. Buck 1's
//                                antler monogram, the mark for the same
//                                .buckconfig and published as a 300x150 PNG, runs
//                                0.50 / 0.97 / 1.25 px, so the faithful vector of
//                                THAT ships
//                     bruno    — usebruno/bruno ships assets/images/logo.png and
//                                logo-transparent.png and no vector; simple-icons'
//                                `bruno` is a MONOCHROME OUTLINE of it, and R1
//                                keeps multi-colour marks multi-colour, so
//                                vscode-icons' full-colour vector is the geometry
//                     cairo    — starkware-libs/cairo ships
//                                resources/img/cairo-logo-square.png, cairo-book
//                                ships Cairo_logo_500x500.png and
//                                www.cairo-lang.org serves PNG favicons; no SVG
//                                anywhere, and simple-icons' `cairo` is Cairo
//                                GRAPHICS, a different project entirely
//                     cangjie  — cangjie-lang.cn serves its logo as a PNG on a CDN
//                     casc     — CASC-Lang/CASC-Vscode ships icon.png and nothing
//                                else; the vscode-icons vector is that PNG's mark,
//                                drawn as polygons (see polyShapes below)
//                     ceylon   — ceylon-lang.org is now an Eclipse Foundation
//                                shell and the archived site's images/ tree is
//                                ceylon-logo.png only; gilbarbara/logos carries a
//                                faithful vector of the same elephant
//                     chef     — chef.io serves progress-chef-primary-logo-svg.svg,
//                                which is the PROGRESS corporate mark plus a
//                                "Progress Chef" wordmark, not Chef's own arc mark;
//                                gilbarbara/logos carries the arc mark as a vector
//   family (rule 1)   c-al  -> A01's al       · cds -> A01's abap (SAP)
//                     cfc / cfm      -> this tranche's cf (ColdFusion)
//                     chef-cookbook  -> this tranche's chef
//                     — FIX ROUND: cf / cfc / cfm used to point at A01's
//                       actionscript under a family called `adobe`. The ruling
//                       gave ColdFusion its own mark, so cf is the base now and
//                       that family is gone; A01's own adobe family is untouched.
//   NO MARK (rule 2)  chess                 -> a new OBJECT glyph, the rook
//                     brainfuck, capnp, cbx, cddl
//                                           -> the generic-code category glyph
//
// FOUR of the twenty-eight collapse to the bracket glyph and one takes an object
// glyph, which is the smallest collapse any tranche has run so far — the D22
// amendment is why. Only ONE of the five is a concept whose mark EXISTS: capnp,
// whose logo is an eleven-letter Victorian wordmark published as a 635x356 PNG
// with no vector anywhere, so L2's ban on tracing a raster ends it before its
// legibility is even reached. The other four own no mark at all. Every one
// carries its hunt below.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { subpaths, roundRect, round } from '../pathkit.mjs';
import { genericCode, chessRook } from '../geom.mjs';
import { NEUTRAL, WHITE } from '../color.mjs';
import { officialShapes, icon, ENV, SRCDIR } from '../spec-engine.mjs';
import { spec as a01Spec } from './A01.mjs';

const S = {};

// The generic-code glyph is authored 11.2 x 9.8 in geom.mjs and is placed at
// 13.0 x 11.4 — A01 tranche 2's constant, reproduced here VERBATIM rather than
// re-derived, because a category glyph belongs to the production line and not to
// a slice: check-slice.mjs asserts that this tranche's brackets are byte-equal to
// A01's, and the twin audit pools both slices' collapsed ids in one lane.
const CODE_ENV = { w: 13, h: 11.4 };

// =============================================================================
// local helpers — nothing here is shared, so nothing here can move a pilot byte
// =============================================================================

/**
 * WORKING RULE 2, category glyph. Four concepts in this tranche end up here and
 * they must be byte-identical with each other AND with A01's thirteen, so they go
 * through one factory that is A01.t2's, copied verbatim. `why` is the concept's
 * own hunt result and is what lands on the sheet.
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
 * A fifth shape of source file, and the first this set has met: an artwork drawn
 * entirely with `<polygon>` and `<polyline>` primitives (CASC's aperture, whose
 * eight blades are eight triangles). spec-engine's readers handle `<path>` and
 * `<circle>`; a polygon is a closed run of straight lines, so re-emitting its
 * points as `M x y L x y … Z` is a FORMAT conversion and not a redraw — exactly
 * what A01 tranche 2 already does by hand for SAP's `<polyline>` field. Kept
 * local on purpose: the engine is shared with the frozen sets and this tranche
 * has no business touching it for one file.
 */
const polyShapes = (file) => {
	const raw = readFileSync(join(SRCDIR, file), 'utf8');
	const out = [];
	for (const m of raw.matchAll(/<(polygon|polyline)\b([^>]*)>/g)) {
		const pts = (m[2].match(/\spoints="([^"]+)"/) || [])[1].trim().split(/[\s,]+/).map(Number);
		const fill = (m[2].match(/fill:\s*(#[0-9a-fA-F]{3,6})/)
			|| m[2].match(/\sfill="(#[0-9a-fA-F]{3,6})"/) || [])[1] || null;
		let d = '';
		for (let i = 0; i < pts.length; i += 2) { d += `${i ? 'L' : 'M'}${pts[i]} ${pts[i + 1]}`; }
		out.push({ d: `${d}Z`, fill });
	}
	return out;
};

/**
 * A SIXTH shape of source file, brought in by the fix round: an Adobe product
 * icon, whose field is a `<rect>` with a corner radius rather than a path.
 * spec-engine's readers walk `<path>` and `<circle>` and skip a `<rect>` entirely
 * — which is why the gate build never actually had Adobe's plate in its hands,
 * only the two letters that sit on it. A rounded rectangle is four lines and four
 * corner arcs, so re-emitting one through pathkit's own `roundRect` is a FORMAT
 * conversion and not a redraw, exactly as `polyShapes` above is for CASC's
 * `<polygon>` blades. Kept local for the same reason: the engine is shared with
 * the frozen sets and this tranche has no business touching it for one file.
 *
 * Returns `{ x, y, w, h, r, fill }` in document order, with the enclosing `<g>`
 * translates folded in (Adobe's exports park the artboard offset there).
 */
const rectShapes = (file) => {
	const raw = readFileSync(join(SRCDIR, file), 'utf8');
	const cls = Object.fromEntries([...raw.matchAll(
		/\.([A-Za-z][\w-]*)\s*\{[^}]*?fill\s*:\s*(#[0-9a-fA-F]{3,8})\s*;?[^}]*\}/g)]
		.map(m => [m[1], m[2].toUpperCase()]));
	const out = [];
	const stack = [];
	const shift = (attrs) => {
		const t = attrs.match(/\stransform="translate\(\s*(-?[\d.]+)[\s,]+(-?[\d.]+)\s*\)"/);
		return t ? [+t[1], +t[2]] : [0, 0];
	};
	for (const m of raw.matchAll(/<(\/?)(g|rect|svg)\b([^>]*)>/g)) {
		const [, closing, name, attrs] = m;
		if (name === 'svg') { continue; }
		if (closing) { if (name === 'g') { stack.pop(); } continue; }
		if (name === 'g') { stack.push(shift(attrs)); continue; }
		const own = shift(attrs);
		const dx = stack.reduce((a, t) => a + t[0], own[0]);
		const dy = stack.reduce((a, t) => a + t[1], own[1]);
		const num = (k) => +((attrs.match(new RegExp(`\\s${k}="([^"]+)"`)) || [])[1] ?? 0);
		const c = (attrs.match(/\sclass="([^"]+)"/) || [])[1];
		out.push({
			x: num('x') + dx, y: num('y') + dy, w: num('width'), h: num('height'),
			r: num('rx') || num('ry'),
			fill: ((attrs.match(/\sfill="(#[0-9a-fA-F]{3,8})"/) || [])[1]
				|| (c && cls[c]) || null)
		});
	}
	return out;
};

/** The offset-1 stop of a gradient layer — the flattening chrome ratified. */
const flat = (s) => s.fill || s.gradient[s.gradient.length - 1].color;

/**
 * A cross-slice family variant, branch (b): the concept ships an APPROVED slice's
 * master byte for byte under its own id. The base's own spec supplies the
 * envelope, the geometry and the provenance, so there is exactly one place the
 * bytes can come from and check-slice.mjs re-asserts the equality against
 * slices/A01/masters/<base>.svg rather than trusting this comment. `family` is
 * the FAMILIES key, which is not always the base's id — cf's base is
 * actionscript and its family is `adobe`.
 */
const fromA01 = (family, base, title, why) => {
	const b = a01Spec(base);
	return {
		title,
		brand: b.brand,
		env: b.env,
		...(b.plate ? { plate: true } : {}),
		family: { name: family, base, from: 'A01', mode: 'identical' },
		source: { ...b.source },
		simplifications: [...b.simplifications, why],
		parts() { return a01Spec(base).parts(); }
	};
};

// =============================================================================
// bosque — Microsoft Research / Mark Marron
// =============================================================================
// Bosque is the regularised-programming experiment Microsoft Research opened in
// 2019 and handed back to its creator in 2023; a `.bsq` is its source file, so
// the mark that applies is Bosque's own — the Fluent-styled stack of green tiles
// with a white lambda on the front one, which is what microsoft/BosqueLanguage
// publishes under resources/brand/.
//
// SOURCING, and this is the whole hunt: MICROSOFT PUBLISHES NO VECTOR OF IT.
// Every file in that tree whose name ends in .svg is a raster in an SVG wrapper —
// resources/brand/Bosque.svg (66 KB) and both icon variants (fabric_fluent
// 248 KB, js_based 24 KB) contain exactly one tag between <svg> and </svg>: an
// <image> at 4096x4096 whose href is a base64 PNG data URI. The combined lockup
// is a 697 KB PNG the same way. L2 forbids tracing a raster, so the geometry
// comes from vscode-icons' vector of the same Fluent icon.
//
// What that vector already drops, and we keep dropped: the official icon has
// "BSQ" set across the back tile. vscode-icons draws the tiles and the lambda and
// leaves the letters out; the tile they sit on measures 9.60 x 3.13 px at this
// envelope, so three letters inside it could not clear L5's floor and the trace
// made the cut L5 would have forced.
S.bosque = {
	title: 'Bosque',
	brand: '#107C10',
	env: ENV.compact,
	source: {
		name: 'Bosque (faithful vector — vscode-icons)', slug: 'bosque',
		license: 'MIT (vscode-icons/vscode-icons); the Bosque brand assets are MIT under '
			+ 'microsoft/BosqueLanguage. Recorded and NOT gating',
		url: 'https://github.com/microsoft/BosqueLanguage/tree/master/resources/brand',
		artwork: 'bosque-vsicons.svg',
		note: '32x32, six painted layers: four back tiles (#1C601C / #206E20 / #247B24 / '
			+ '#288928), the #107C10 front tile and the #FEFEFE lambda. Microsoft\'s own brand '
			+ 'tree publishes NO vector — resources/brand/Bosque.svg, icon/fabric_fluent/'
			+ 'Bosque_Logo.svg and icon/js_based/Bosque_Logo.svg are each a single 4096 px '
			+ '<image> tag whose href is a base64 PNG data URI, wrapped in an <svg>; '
			+ 'combined/Fabric-Bosque.svg is a 697 KB PNG the same way. Fetched to '
			+ 'sources-svg/bosque-vsicons.svg'
	},
	simplifications: [
		'the official icon sets "BSQ" across the back tile and the vector this geometry comes '
		+ 'from already leaves it out. Kept out: the tile the word sits on measures 9.60 x 3.13 px '
		+ 'at this envelope, so three letters inside it could not clear L5\'s floor and the trace '
		+ 'made the cut L5 would have forced',
		'the back tiles\' two darkest tones measure 2.43:1 (#1C601C) and 2.93:1 (#206E20) against '
		+ '#121314 — under the 3.0:1 lift trigger. They are NOT lifted: they are the shading of a '
		+ 'tile stack whose front tile (#107C10, 3.47:1) carries the 3.31 x 4.80 px lambda, and '
		+ 'lifting a back sheet to L 88 would put the palest tone of the icon behind its brightest'
	],
	parts() {
		return officialShapes('bosque-vsicons.svg').map(s => ({ d: s.d, fill: s.fill }));
	}
};

// =============================================================================
// bower — the Bower package manager
// =============================================================================
// bower.json / .bowerrc are Bower's own files and Bower publishes its own vector:
// bower/bower.github.io holds img/bower-logo.svg, the bird's head in eight flat
// layers. Brand tier, first try. simple-icons carries a CC0 monochrome trace of
// the same bird, which R1 does not want — the mark is five colours.
S.bower = {
	title: 'Bower',
	brand: '#EF5734',
	env: ENV.wide,
	source: {
		name: 'Bower (brand\'s own SVG)', slug: 'bower', license: 'MIT (bower/bower.github.io)',
		url: 'https://github.com/bower/bower.github.io/blob/master/img/bower-logo.svg',
		artwork: 'bower-official.svg',
		note: '462x407, eight painted layers: the #543729 outline, the #00ACEE blue crest '
			+ 'feather, the #2BAF2B wing, the #FFCC2F breast, the #CECECE beak, the #EF5734 head, '
			+ 'and the eye as a #FFCC2F ring around a #543729 pupil. simple-icons\' `bower` is a '
			+ 'CC0 monochrome trace of the same bird and is not used: R1 keeps multi-colour marks '
			+ 'multi-colour. Fetched to sources-svg/bower-official.svg'
	},
	simplifications: [
		'NOT reduced, and measured at the shipped fit: the smallest feature the mark carries is the '
		+ 'pupil at 1.19 x 1.20 px, with the beak at 2.36 x 1.39, the crest feather at 1.97 x 2.17 '
		+ 'and the eye ring at 1.99 x 2.00 — every one of them at or over L5\'s 1.2 px '
		+ 'official-forced floor. The mark\'s sustained ink runs are 2.28 px at the 25th percentile '
		+ 'and 4.38 at the median',
		'the #543729 outline measures 1.73:1 against #121314 and is NOT lifted: it is the mark\'s '
		+ 'own contour line, it prints against the head\'s orange for most of its length, and '
		+ 'raising it to L 88 would draw Bower\'s bird with a white keyline. What it costs on the '
		+ 'dark backdrop is that the bird reads by its five bright fills rather than by its '
		+ 'outline, which is what the mark does on any dark ground'
	],
	parts() {
		return officialShapes('bower-official.svg').map(s => ({ d: s.d, fill: s.fill }));
	}
};

// =============================================================================
// brainfuck
// =============================================================================
// RULE 2, category glyph. Brainfuck is Urban Müller's 1993 eight-instruction
// esolang; it has no owner, no project and no mark, and none of the three source
// themes traces one — Material draws a pink BRAIN, which is a pun on the name and
// exactly the kind of invented metaphor the v1 autopsy rejected (the concept does
// not name a brain; it is named after an idiom). So the category glyph.
S.brainfuck = codeGlyph('Brainfuck',
	'Brainfuck is a 1993 esolang with no owner, no project site and no mark; nothing to hunt. '
	+ 'Material draws a brain, which is a pun on the name rather than a mark, and vscode-icons '
	+ 'draws nothing. The generic-code category glyph, shared byte for byte with A01\'s thirteen');

// =============================================================================
// bruno — the Bruno API client
// =============================================================================
// A `.bru` is Bruno's own request file, so Bruno's mark applies: the golden
// retriever's head the project puts on its README, its site and its app icon.
//
// SOURCING, by fidelity: usebruno/bruno ships assets/images/logo.png and
// logo-transparent.png and no vector anywhere in the repository. simple-icons
// carries `bruno` (CC0), but it is a MONOCHROME OUTLINE of the dog — R1 keeps
// multi-colour marks multi-colour — so the geometry comes from vscode-icons'
// full-colour vector of the same drawing, which matches the official PNG layer
// for layer (head #F1A842, nose #414141, tongue #E55947, black keyline).
S.bruno = {
	title: 'Bruno',
	brand: '#F4AA41',
	env: ENV.compact,
	source: {
		name: 'Bruno (faithful vector — vscode-icons)', slug: 'bruno',
		license: 'MIT (vscode-icons/vscode-icons); the Bruno artwork itself is MIT under '
			+ 'usebruno/bruno. Recorded and NOT gating',
		url: 'https://github.com/usebruno/bruno/blob/main/assets/images/logo-transparent.png',
		artwork: 'bruno-vsicons.svg',
		note: '32x32, six painted layers: the #F1A842 head, the black keyline, the #414141 nose, '
			+ 'the black eyes, the #E55947 tongue and the black muzzle line. usebruno/bruno '
			+ 'publishes PNG only; simple-icons\' `bruno` (CC0) is a single-path MONOCHROME '
			+ 'OUTLINE of the same dog and is not used, because R1 keeps multi-colour marks '
			+ 'multi-colour. Fetched to sources-svg/bruno-vsicons.svg'
	},
	simplifications: [
		'the black KEYLINE layer is dropped — the single biggest path in the file (3037 characters '
		+ 'of the 6.5 KB source) and the one that put the icon over L8\'s 4 KB hard cap. It '
		+ 'measures 1.13:1 against #121314, so on the product backdrop it paints nothing a reader '
		+ 'can see; what it costs is that Bruno\'s head keeps its full outer contour instead of '
		+ 'being trimmed by an invisible line. Both builds are in proofs/A02-t1-study.png',
		'the eyes, the nose and the muzzle line are KEPT black: they print on the mark\'s own '
		+ 'golden field, where the pilot\'s dotenv erratum says ink is never lifted, and they are '
		+ 'what makes the shape a dog rather than a blob'
	],
	parts() {
		// document order minus layer 1, the keyline (see the simplification log)
		const sh = officialShapes('bruno-vsicons.svg');
		return [0, 2, 3, 4, 5].map(i => ({ d: sh[i].d, fill: sh[i].fill || '#000000' }));
	}
};

// =============================================================================
// buckbuild — Buck / Buck2 (Meta)
// =============================================================================
// `.buckconfig`, `.buckjavaargs` and `BUCK` files belong to Meta's Buck build
// system, and BOTH generations of it read the same `.buckconfig`. That matters,
// because the two generations have different marks: Buck 1 (facebook/buck, now
// archived) draws a blue ANTLER monogram — a stag's head reduced to eight strokes
// — and publishes it as docs/static/logo.png, a 300x150 raster; Buck 2
// (facebook/buck2, the current one) draws a full leaping BUCK and publishes it as
// website/static/img/logo.svg, a real vector.
//
// The fidelity chain says the current Buck's own vector; L5's physics overrules
// it, and that is the whole of this call. Both were built and rendered at a true
// 16 px (proofs/A02-t1-study.png):
//   · the DEER's sustained ink runs are 0.22 px at the 5th percentile, 0.38 at
//     the 25th and 0.88 at the MEDIAN — jar's numbers, which A01 rejected on L5
//     alone. Opening the envelope to 13.6 x 14.4 moves them to 0.25 / 0.41 /
//     0.94, and at 16 px it is an orange hook with a two-pronged fork on top;
//   · the ANTLER monogram runs 0.50 / 0.97 / 1.25 / 1.41 px at the 5th, 25th,
//     50th and 75th — two to three times the deer at every percentile — and at
//     16 px every tine survives and it is a stag's head.
// L5's contrast duty and its detail budget are physics rather than preference,
// and an icon may not ship illegible. So the antler ships, from vscode-icons'
// faithful vector of Buck 1's raster — the same tier this tranche uses five other
// times, and the A01 antlr precedent. Flagged, because it means the set carries
// the RETIRED generation's mark for a file both generations read.
S.buckbuild = {
	title: 'Buck (Meta)',
	brand: '#4A69A5',
	env: ENV.compact,
	source: {
		name: 'Buck (faithful vector — vscode-icons)', slug: 'buckbuild',
		license: 'MIT (vscode-icons/vscode-icons); the Buck artwork is Apache-2.0 / MIT under '
			+ 'facebook/buck. Recorded and NOT gating',
		url: 'https://github.com/facebook/buck/blob/main/docs/static/logo.png',
		artwork: 'buck-vsicons.svg',
		note: '32x32, two #4A69A5 paths: the antler monogram and the arrowhead inside it. Buck 1 '
			+ 'publishes this mark as docs/static/logo.png, a 300x150 raster, so the vector is a '
			+ 'faithful trace of it (Material traces the same drawing in its own palette). '
			+ 'BUCK 2 — the current generation, which reads the same .buckconfig — publishes its '
			+ 'own vector at facebook/buck2 website/static/img/logo.svg, a leaping deer in an '
			+ '#AF4F39 -> #F69635 gradient; it is fetched to sources-svg/buck-official.svg, it '
			+ 'wins the fidelity chain, and it loses to L5 (see the flag). Fetched to '
			+ 'sources-svg/buck-vsicons.svg'
	},
	simplifications: [
		'THE BRAND TIER WAS SOURCED AND DECLINED ON L5. Buck 2\'s own vector was fetched, fitted '
		+ 'at two envelopes and measured: the deer\'s sustained ink runs are 0.22 px at the 5th '
		+ 'percentile, 0.38 at the 25th and 0.88 at the MEDIAN — jar\'s numbers, which A01 '
		+ 'rejected on L5 alone — and opening the envelope to 13.6 x 14.4 only moves them to '
		+ '0.25 / 0.41 / 0.94. Buck 1\'s antler monogram runs 0.50 / 0.97 / 1.25 px at the same '
		+ 'three percentiles, two to three times the deer at every one of them. Both renders are '
		+ 'in proofs/A02-t1-study.png',
		'NOT reduced, and the honest limit is recorded rather than dressed up: the monogram is a '
		+ 'LINE DRAWING and its runs sit at 1.25 px at the median, under L5\'s 1.5 px floor and '
		+ 'at the 1.2 px official-forced one. What saves it at 16 px is that every stroke is '
		+ 'axis-aligned or at 45 degrees, so it lands on pixel edges instead of straddling them — '
		+ 'the 16 px proof is where to check that, and it holds',
		'colour is the trace\'s own #4A69A5, which is Buck\'s blue as its raster prints it '
		+ '(3.41:1 against #121314, clear of the lift trigger). brand-colors.json has no buck '
		+ 'entry and simple-icons has none either, so there is nothing to reconcile it against'
	],
	parts() {
		return officialShapes('buck-vsicons.svg').map(s => ({ d: s.d, fill: '#4A69A5' }));
	}
};

// =============================================================================
// bucklescript — ReScript
// =============================================================================
// A SUCCESSOR-BRAND call, and it is flagged as one. `bsconfig.json`, `.bsb.lock`
// and `.cmj` are BuckleScript's file names, and BuckleScript no longer exists as
// a brand: it renamed itself ReScript in August 2020 (the same repository, now
// rescript-lang/rescript-compiler), and bucklescript.github.io today serves one
// `<meta http-equiv="refresh" content="0; url=https://rescript-lang.org">` and
// nothing else. bsconfig.json stayed ReScript's config file name until v11.
//
// SOURCING: BuckleScript's own mark could not be found at all — the redirect
// leaves nothing behind, BuckleScript/bucklescript.github.io has no branding
// directory, and neither simple-icons nor gilbarbara/logos has ever carried a
// `bucklescript` entry. What the successor publishes is its own brand file, so
// that is what ships. Material's teal "BS" plate is Material's own monogram.
//
// This is a PLATE mark (an official field carrying a glyph), like A01's abap, so
// the twin audit scores its glyph rather than its rounded square.
S.bucklescript = {
	title: 'BuckleScript (ReScript)',
	brand: '#E6484F',
	env: ENV.compact,
	plate: true,
	source: {
		name: 'ReScript (brand\'s own SVG)', slug: 'rescript',
		license: 'MIT (rescript-lang/rescript-lang.org); the mark is the ReScript Association\'s. '
			+ 'Recorded and NOT gating',
		url: 'https://github.com/rescript-lang/rescript-lang.org/blob/master/apps/docs/public/brand/rescript-logo.svg',
		artwork: 'rescript-official.svg',
		note: '816x193 lockup: the mark is a 192x193 rounded square painted with a three-stop '
			+ '#E84F4F/#DB4646/#CB3939 gradient, a white dot and a white bar; the rest of the file '
			+ 'is the "ReScript" wordmark. BuckleScript\'s OWN mark was hunted first and does not '
			+ 'survive its rename: bucklescript.github.io is a bare meta-refresh to '
			+ 'rescript-lang.org, BuckleScript/bucklescript.github.io keeps no branding '
			+ 'directory, and neither simple-icons nor gilbarbara/logos has a bucklescript entry. '
			+ 'Fetched to sources-svg/rescript-official.svg'
	},
	simplifications: [
		'the wordmark is dropped and the 192 px mark ships alone — the icon is the symbol',
		'the field\'s three-stop gradient (#E84F4F / #DB4646 / #CB3939) is flattened to #E6484F, '
		+ 'which is the hex ReScript itself publishes as its brand red on rescript-lang.org/brand '
		+ 'and the one simple-icons records; it sits inside the ramp rather than at one end of it',
		'the file\'s third mark layer is dropped: it is the white bar painted again in black at '
		+ 'fill-opacity 0.2, i.e. a drop shadow. L8 bans opacity and a shadow is not geometry'
	],
	parts() {
		const sh = officialShapes('rescript-official.svg');
		return [
			{ d: sh[1].d, fill: '#E6484F' },   // the rounded-square field
			{ d: sh[4].d, fill: WHITE },       // the bar
			{ d: sh[2].d, fill: WHITE }        // the dot
		];
	}
};

// =============================================================================
// c-al — C/AL (Microsoft Dynamics NAV)
// =============================================================================
// WORKING RULE 1, branch (b), across the slice boundary. A `.cal` is a C/AL
// source file: Client/server Application Language, the language of Dynamics NAV
// and the direct ancestor of AL, which A01 already ships with MICROSOFT'S OWN
// mark (the #2EA98E "AL" lockup extracted from the ms-dynamics-smb.al extension).
//
// The rule asks first whether a source theme draws an established NON-LETTER
// variant glyph for the variant. vscode-icons does draw one — but what it draws
// is the MICROSOFT DYNAMICS 365 sail, the mark of the whole product suite, which
// covers Sales, Finance, Supply Chain and everything else Dynamics sells. That is
// not a C/AL glyph; it is a corporate suite mark standing in for a language, one
// step further out than the company-mark rider reaches. Microsoft itself ships
// ONE mark for this language family and registers it against the `al` language id.
//
// So branch (a) has nothing to adapt and c-al ships A01's al master byte for byte.
// Flagged, because the Dynamics reading is a real alternative and one edit away.
S['c-al'] = fromA01('al', 'al', 'C/AL (Dynamics NAV)',
	'WORKING RULE 1(b), cross-slice: C/AL is AL\'s direct ancestor in the same Microsoft product '
	+ 'line and Microsoft ships one AL mark for the family, registered against the `al` language '
	+ 'id. Branch (a) was checked and declined: vscode-icons draws the Microsoft DYNAMICS 365 '
	+ 'sail for c-al, which is the mark of the whole product suite rather than a C/AL variant '
	+ 'glyph. So c-al ships A01\'s al master byte-identically under its own id');

// =============================================================================
// c3 — the C3 programming language
// =============================================================================
// c3-lang.org publishes its own mark at /assets/logo.svg: the "C3" logotype in a
// left-to-right blue-to-violet gradient, one path with two subpaths. The brand
// tier, first try. It is a letterform lockup exactly as SAP's "SAP" and
// Microsoft's "AL" are, so L3's typeset-letter ban does not reach it — this is
// the brand's own source geometry, not a monogram we set.
//
// The gradient is the interesting part. It runs #2563EB at offset 0 to #7C3AED at
// offset 1 across the whole logotype, which means the C sits in the blue end and
// the 3 in the violet end. Flattening the WHOLE mark to one stop would throw away
// half of what the mark looks like, so it is flattened PER SUBPATH to the stop
// that subpath actually sits on: the C blue, the 3 violet. No geometry moves, and
// the result is the two hexes the brand's own CSS names.
S.c3 = {
	title: 'C3',
	brand: '#2563EB',
	env: ENV.wide,
	source: {
		name: 'C3 (brand\'s own SVG)', slug: 'c3',
		license: 'LGPL-3.0 (c3lang/c3c); no separate licence is declared on the site asset. '
			+ 'Recorded and NOT gating',
		url: 'https://c3-lang.org/assets/logo.svg',
		artwork: 'c3-official.svg',
		note: '353x217, ONE path (id="C3") with two subpaths — the C at x 5..187 and the 3 at '
			+ 'x 195..348 — painted with a horizontal linear gradient whose stops the file writes '
			+ 'as rgb(37,99,235) and rgb(124,58,237). c3lang/c3c itself carries no vector (its '
			+ 'only logo file is resources/nsis/logo.ico). Fetched to sources-svg/c3-official.svg'
	},
	simplifications: [
		'the horizontal gradient is flattened PER SUBPATH rather than for the whole mark: the C '
		+ 'takes the offset-0 stop #2563EB and the 3 the offset-1 stop #7C3AED, which is the '
		+ 'colour each glyph actually sits on in the ramp. Flattening both to one stop would drop '
		+ 'half of what the mark looks like; no geometry moves either way',
		'NOT reduced, and measured at the shipped fit: the logotype\'s sustained ink runs are '
		+ '1.72 px at the 25th percentile and 2.00 px at the median, so it clears L5\'s 1.5 px '
		+ 'floor without help — thicker than abap\'s SAP letters, which the A01 gate passed at '
		+ '1.00-1.25 px'
	],
	parts() {
		const sp = subpaths(officialShapes('c3-official.svg')[0].d);
		return [{ d: sp[0], fill: '#2563EB' }, { d: sp.slice(1).join(''), fill: '#7C3AED' }];
	}
};

// =============================================================================
// cabal — Haskell's Cabal
// =============================================================================
// `.cabal` and cabal.project are Cabal's own files and Cabal publishes its own
// vector: haskell/cabal-website holds images/Cabal.svg. The file is a 2005-era
// Inkscape drawing that carries the logo TWICE — once for light grounds and once
// for dark — and each copy is one star plus the "Cabal" logotype. The symbol is
// the star; the icon is the symbol.
//
// Which star: the file's two copies differ only by colour, and the one that comes
// with the WHITE logotype (the dark-ground version) uses #567DD9, the lighter
// blue. On the #121314 backdrop that is the copy the brand itself would use, so
// that is the copy that ships. The other, #2E5BC1, measures 3.00:1 and still
// trips the lift by a hair.
S.cabal = {
	title: 'Cabal (Haskell)',
	brand: '#567DD9',
	env: { w: 12.4, h: 12.4 },
	source: {
		name: 'Cabal (brand\'s own SVG)', slug: 'cabal',
		license: 'BSD-3-Clause (haskell/cabal-website). Recorded and NOT gating',
		url: 'https://github.com/haskell/cabal-website/blob/master/images/Cabal.svg',
		artwork: 'cabal-official.svg',
		note: 'an Inkscape drawing on a 744x1052 canvas with no viewBox, carrying the lockup '
			+ 'TWICE: a dark-ground copy (#567DD9 star + white "Cabal") and a light-ground copy '
			+ '(#2E5BC1 star + black "Cabal"). haskell/cabal itself ships no logo file, and '
			+ 'neither simple-icons nor gilbarbara/logos carries a cabal entry. Fetched to '
			+ 'sources-svg/cabal-official.svg'
	},
	simplifications: [
		'the "Cabal" logotype is dropped and the star ships alone — the icon is the symbol',
		'of the file\'s two copies of the mark, the DARK-GROUND one ships: its star is #567DD9 '
		+ '(4.72:1 against #121314) where the light-ground copy\'s is #2E5BC1, which measures '
		+ '3.00:1 and still trips the lift by a hair. Same geometry, and the copy the brand '
		+ 'itself uses on a dark page',
		'NOT reduced: the star is 9.42 x 12.40 px of ink and its sustained runs are 1.81 px at '
		+ 'the 25th percentile and 5.47 at the median, so every point resolves. What to judge is '
		+ 'not legibility but IDENTITY — a five-pointed '
		+ 'star is the most generic shape any subject in this tranche ships, and it is Cabal\'s '
		+ 'whole symbol. Flagged'
	],
	parts() {
		return [{ d: officialShapes('cabal-official.svg')[1].d, fill: '#567DD9' }];
	}
};

// =============================================================================
// caddy — the Caddy web server
// =============================================================================
// A Caddyfile is Caddy's own config, and caddyserver.com publishes the mark:
// /resources/images/logo-light.svg, a 603x147 lockup whose first three painted
// layers are the symbol — the ring, and the green "shed" with its node dot inside
// it — and whose remaining seven are the "caddy" wordmark and a registered-mark
// glyph 0.14 px across.
//
// The ring's colour is the one judgement here. The file paints it with a
// three-stop gradient — rgb(35,217,59) green, rgb(119,196,247) pale blue,
// rgb(0,89,209) deep blue — and neither end works as the flat stop: offset 0
// duplicates the shed's own #22B638, and offset 1 measures 2.97:1 against
// #121314, three hundredths under the lift trigger, which would then push Caddy's
// blue to L 88. #1F88C0 is the flat Caddy blue simple-icons records for the brand,
// it sits inside the ramp, and it measures 4.73:1. That is what ships.
S.caddy = {
	title: 'Caddy',
	brand: '#1F88C0',
	env: ENV.compact,
	source: {
		name: 'Caddy (brand\'s own SVG)', slug: 'caddy',
		license: 'Apache-2.0 (caddyserver/caddy); the site asset declares no separate terms. '
			+ 'Recorded and NOT gating',
		url: 'https://caddyserver.com/resources/images/logo-light.svg',
		artwork: 'caddy-official.svg',
		note: '603x147 lockup. Layer 0 is the ring, painted with a three-stop linear gradient '
			+ '(rgb(35,217,59) / rgb(119,196,247) / rgb(0,89,209)); layers 1 and 2 are the '
			+ 'rgb(34,182,56) shed and its node; layers 3-9 are the "caddy" wordmark and a '
			+ 'registered mark that measures 0.14 px at this envelope. brand-colors.json has no '
			+ 'caddy entry, so simple-icons\' #1F88C0 stands as the primary (the abap precedent). '
			+ 'Fetched to sources-svg/caddy-official.svg'
	},
	simplifications: [
		'the wordmark and the registered mark are dropped and the symbol ships alone',
		'the ring\'s three-stop gradient is flattened to #1F88C0, the flat Caddy blue simple-icons '
		+ 'records for the brand, rather than to either end of the ramp: offset 0 (rgb(35,217,59)) '
		+ 'is the shed\'s own green and would paint the whole mark one colour, and offset 1 '
		+ '(rgb(0,89,209)) measures 2.97:1 against #121314 — under the 3.0:1 lift trigger, so '
		+ 'flattening there would immediately lift Caddy\'s blue to L 88. #1F88C0 sits inside the '
		+ 'ramp and measures 4.73:1',
		'the shed and its node keep the file\'s own rgb(34,182,56) = #22B638 verbatim',
		'NOT reduced, and the number that matters is recorded: the ring\'s wall is 1.07 px at '
		+ 'this envelope (outer 12.80, counter 10.65) and the mark\'s sustained ink runs are '
		+ '0.84 px at the 25th percentile and 1.03 at the median. That is the chrome situation — '
		+ 'official detail under the 1.2 px floor, kept at official proportions because thickening '
		+ 'the ring means shrinking Caddy\'s shed inside it. The 16 px proof says what survives'
	],
	parts() {
		const sh = officialShapes('caddy-official.svg');
		return [
			{ d: sh[0].d, fill: '#1F88C0' },
			{ d: sh[1].d + sh[2].d, fill: '#22B638' }
		];
	}
};

// =============================================================================
// cadence — Cadence (Flow)
// =============================================================================
// The roster's `cadence` is `.cdc` / languageId `cadence`, which is Flow's
// resource-oriented smart-contract language and not Uber's workflow engine or
// Cadence Design Systems. cadence-lang.org publishes the mark at /img/logo.svg —
// a 600x120 lockup whose last three paths are the symbol (two nested rounded
// squares with the arrow between them) in #00DB80, and whose first seven are the
// "Cadence" wordmark in #2A1E3C.
//
// The file paints through a <style> block whose class rules are written with HTML
// numeric entities for the newlines, so the engine's class reader does not resolve
// them; the two class fills are read off the file and named here instead, which is
// the same move A01 made on SAP's polyline. Nothing about the geometry changes.
S.cadence = {
	title: 'Cadence (Flow)',
	brand: '#00DB80',
	env: ENV.compact,
	source: {
		name: 'Cadence (brand\'s own SVG)', slug: 'cadence',
		license: 'Apache-2.0 (onflow/cadence-lang.org). Recorded and NOT gating',
		url: 'https://cadence-lang.org/img/logo.svg',
		artwork: 'cadence-official.svg',
		note: '600x120 lockup, ten paths: the last three (class cls-2, fill #00DB80) are the '
			+ 'symbol and the first seven (class cls-1, fill #2A1E3C) are the "Cadence" wordmark. '
			+ 'The file\'s <style> block writes its newlines as &#10; entities, so the fills are '
			+ 'read off the file and named in this spec rather than resolved by the engine — the '
			+ 'SAP-polyline move, geometry untouched. onflow/cadence itself ships no logo. '
			+ 'Fetched to sources-svg/cadence-official.svg'
	},
	simplifications: [
		'the "Cadence" wordmark (the seven #2A1E3C paths) is dropped and the symbol ships alone',
		'NOT reduced, and measured at the shipped fit: the symbol\'s sustained ink runs are '
		+ '2.00 px at the 25th percentile and 2.28 at the median, with its three shapes at '
		+ '9.86 x 9.86, 9.02 x 8.98 and 4.38 x 4.35 px. It clears L5 outright and is the cleanest '
		+ 'branded mark in the tranche at 16 px'
	],
	parts() {
		return officialShapes('cadence-official.svg').slice(7).map(s => ({ d: s.d, fill: '#00DB80' }));
	}
};

// =============================================================================
// cairo — Cairo (Starknet)
// =============================================================================
// The roster's `cairo` is `.cairo` / languageId `cairo`: StarkWare's provable
// programming language, NOT the cairo graphics library. That distinction decides
// the source, because simple-icons' `cairographics` is the library's mark and
// using it here would be a false mark on the wrong project.
//
// SOURCING: Starknet publishes the Cairo mark as raster everywhere it publishes
// it at all — starkware-libs/cairo has resources/img/cairo-logo-square.png,
// cairo-book/cairo-book has src/icons/Cairo_logo_500x500.png, and
// www.cairo-lang.org serves only PNG favicons. vscode-icons' vector of the same
// drawing is the geometry.
//
// The mark is a NEGATIVE-SPACE logo: one red contour, with the running figure cut
// out of the disc and open to the outside at the lower left. There is no white
// ink in it — on a light page the runner reads white because the page is white,
// and on this backdrop it reads dark, which is what the mark does on any dark
// ground (Starknet's own dark-ground lockup behaves the same way). So the runner
// is left as the counter it is; there is no closed contour to paint white.
S.cairo = {
	title: 'Cairo (Starknet)',
	brand: '#FE4A3C',
	env: ENV.compact,
	source: {
		name: 'Cairo (faithful vector — vscode-icons)', slug: 'cairo',
		license: 'MIT (vscode-icons/vscode-icons); the mark is StarkWare\'s. Recorded and NOT '
			+ 'gating',
		url: 'https://github.com/starkware-libs/cairo/blob/main/resources/img/cairo-logo-square.png',
		artwork: 'cairo-vsicons.svg',
		note: '32x32, one #FE4A3C path with two subpaths: the disc with the runner cut out of it, '
			+ 'and the runner\'s head as a second counter. Starknet publishes this mark as raster '
			+ 'only — starkware-libs/cairo has resources/img/cairo-logo-square.png, '
			+ 'cairo-book/cairo-book has Cairo_logo_500x500.png and www.cairo-lang.org serves PNG '
			+ 'favicons. simple-icons\' `cairographics` is the CAIRO GRAPHICS library, a different '
			+ 'project, and is deliberately not used. Fetched to sources-svg/cairo-vsicons.svg'
	},
	simplifications: [
		'the runner is left as the mark\'s own NEGATIVE SPACE and not repainted white: it is cut '
		+ 'out of the disc and open to the outside at the lower left, so there is no closed '
		+ 'contour to paint (the gpg move needs one). On the #121314 backdrop it therefore reads '
		+ 'dark, which is what the mark does on any dark ground',
		'NOT reduced, and measured at the shipped fit: the disc is 12.80 x 12.36 px, the runner\'s '
		+ 'head counter 2.44 px across, and the mark\'s sustained ink runs are 1.38 px at the '
		+ '25th percentile and 3.81 at the median — over L5\'s 1.2 px official-forced floor'
	],
	parts() {
		return [{ d: officialShapes('cairo-vsicons.svg')[0].d, fill: '#FE4A3C' }];
	}
};

// =============================================================================
// cake — Cake (C# Make)
// =============================================================================
// A `.cake` file is a Cake build script, and Cake publishes its own artwork:
// cake-build/graphics holds svg/cake.svg, the slice of cake with a wrench laid
// across it. Brand tier, first try — and the most detailed mark in the tranche,
// nineteen painted layers on a 1000 px canvas.
//
// WHAT L5 FORCES, measured layer by layer at the shipped fit rather than judged:
// seven of the nineteen have a minor axis under 1.0 px — the three 0.44 px crumbs
// on the wrench handle, a 0.35 px icing highlight, a 0.84 px cream edge and two
// shadow lines at 0.42 and 0.16 px. Those seven are dropped. The twelve that stay
// are the ones that carry the drawing: the slice's outline and body, its icing
// and cream, and the wrench's three tonal faces. Nothing is thickened and nothing
// is moved; the mark keeps its own proportions and its own eight colours.
const CAKE_KEEP = [0, 1, 2, 3, 4, 5, 6, 7, 11, 13, 14, 15];
S.cake = {
	title: 'Cake (C# Make)',
	brand: '#995700',
	env: ENV.tall,
	source: {
		name: 'Cake (brand\'s own SVG)', slug: 'cake',
		license: 'MIT (cake-build/graphics). Recorded and NOT gating',
		url: 'https://github.com/cake-build/graphics/blob/master/svg/cake.svg',
		artwork: 'cake-official.svg',
		note: '1000x1000, nineteen painted layers in eight colours: the #4A1700 outline, the '
			+ '#995700 sponge, #FFFFFF icing, #FFE05C cream, and the wrench in #534741 / #736357 '
			+ 'over its own #4A1700 outline. Cake\'s site serves only assets/img/logo.png, so the '
			+ 'graphics repository is the vector source. Fetched to sources-svg/cake-official.svg'
	},
	simplifications: [
		'SEVEN of the nineteen layers are dropped, each measured at the shipped fit: three crumbs '
		+ 'on the wrench handle at 0.44 x 0.45 px, an icing highlight at 0.78 x 0.35, a cream edge '
		+ 'at 0.84 x 2.17 and two shadow lines at 3.18 x 0.42 and 1.28 x 0.16. Every one is under '
		+ 'L5\'s 1.2 px official-forced floor in its minor axis; the smallest layer that STAYS '
		+ 'measures 1.32 px in its minor axis, so the cut lands exactly on the floor and not on '
		+ 'taste. The twelve that stay are the outline, the sponge, the icing, the cream and the '
		+ 'wrench\'s three tonal faces',
		'nothing is thickened and nothing is moved — this is a deletion of sub-pixel detail, not '
		+ 'a prettier-rider rebuild. The mark keeps its own proportions and its own eight colours',
		'the #4A1700 outline measures 1.25:1 against #121314 and is NOT lifted: it is the drawing\'s '
		+ 'own contour and its shadow tone, it prints against the sponge for most of its length, '
		+ 'and raising it to L 88 would put the palest colour of the icon on its outermost edge. '
		+ 'What it costs at 16 px is that the slice reads by its sponge, icing and cream'
	],
	parts() {
		const sh = officialShapes('cake-official.svg');
		return CAKE_KEEP.map(i => ({ d: sh[i].d, fill: sh[i].fill }));
	}
};

// =============================================================================
// cakephp — CakePHP
// =============================================================================
// A `.ctp` is a CakePHP view template, so CakePHP's mark applies, and the brand
// publishes it: cakephp.org/img/cake-logo.svg. Note that cake and cakephp are
// UNRELATED brands with unrelated marks — a C# build system and a PHP framework —
// which was checked rather than assumed.
//
// The file is the WHITE lockup (the version CakePHP puts on its own dark pages),
// twenty-four layers of which three are the cake: the top and the two lower
// halves. The cream bands between them are the mark's own negative space in every
// version of it — the red logo on a white page shows white bands because the page
// is white — so they stay negative space here and read dark. The three cake
// layers ship in the brand's published red.
S.cakephp = {
	title: 'CakePHP',
	brand: '#D33C43',
	env: ENV.wide,
	source: {
		name: 'CakePHP (brand\'s own SVG)', slug: 'cakephp',
		license: 'MIT (the CakePHP project); the site asset declares no separate terms. Recorded '
			+ 'and NOT gating',
		url: 'https://cakephp.org/img/cake-logo.svg',
		artwork: 'cakephp-official.svg',
		note: '230x24.7 lockup, twenty-four #FFFFFF layers of which three are the cake (the top '
			+ 'at x 0..32 and the two lower halves) and twenty-one are "CakePHP Build fast, grow '
			+ 'solid.". This is the WHITE version, the one CakePHP uses on dark pages; '
			+ 'brand-colors.json has no cakephp entry, so simple-icons\' #D33C43 stands as the '
			+ 'primary. Fetched to sources-svg/cakephp-official.svg'
	},
	simplifications: [
		'the wordmark and the tagline (twenty-one of the twenty-four layers) are dropped and the '
		+ 'cake ships alone — the icon is the symbol',
		'the fetched file is the WHITE lockup and the three cake layers are painted in the brand\'s '
		+ 'published red #D33C43: same geometry, the colour the mark carries on any ground that '
		+ 'is not its own white version (the npm/git/go colour source-of-truth rule)',
		'the two CREAM BANDS stay negative space, which is what they are in the official artwork — '
		+ 'the red mark on a white page shows white bands because the page is white, and there is '
		+ 'no cream ink to carry. On the #121314 backdrop they read dark, so the cake arrives as '
		+ 'three red tiers (13.08 x 6.12, 6.54 x 4.08 and 6.54 x 3.31 px, sustained runs 2.03 px '
		+ 'at the 25th percentile and 4.03 at the median) rather than as red-and-cream. '
		+ 'vscode-icons paints them white explicitly, which is a prettier icon and not the mark; '
		+ 'both are in proofs/A02-t1-study.png'
	],
	parts() {
		const sh = officialShapes('cakephp-official.svg');
		return [16, 17, 18].map(i => ({ d: sh[i].d, fill: '#D33C43' }));
	}
};

// =============================================================================
// cangjie — Cangjie (Huawei)
// =============================================================================
// `.cj` is Cangjie, Huawei's language for HarmonyOS, and it has its own mark: a
// blue bracket and a green bracket facing each other, printed to the left of the
// 仓颉 / Cangjie lockup. cangjie-lang.cn serves that lockup as a PNG on a CDN and
// publishes no vector; vscode-icons' two-path vector reproduces the bracket pair
// and its two hexes exactly, so it is the geometry.
S.cangjie = {
	title: 'Cangjie (Huawei)',
	brand: '#0673FE',
	env: ENV.compact,
	source: {
		name: 'Cangjie (faithful vector — vscode-icons)', slug: 'cangjie',
		license: 'MIT (vscode-icons/vscode-icons); the mark is Huawei\'s. Recorded and NOT gating',
		url: 'https://cangjie-lang.cn/',
		artwork: 'cangjie-vsicons.svg',
		note: '32x32, two painted layers: the #0673FE left bracket and the #00F196 right one. '
			+ 'cangjie-lang.cn publishes the lockup as a CDN PNG (logo.81433277.png) and no '
			+ 'vector; the Cangjie sources are hosted on gitcode rather than GitHub and carry no '
			+ 'branding directory. Fetched to sources-svg/cangjie-vsicons.svg'
	},
	simplifications: [
		'the 仓颉 / Cangjie wordmark beside the symbol is not part of the vector and is not drawn — '
		+ 'the icon is the bracket pair, which is how Huawei uses the mark on its own favicon',
		'NOT reduced, and measured at the shipped fit: the two brackets are 8.40 x 12.80 and '
		+ '4.60 x 10.42 px and their sustained ink runs are 1.97 px at the 25th percentile and '
		+ '2.78 at the median, all over L5\'s 1.5 px floor'
	],
	parts() {
		return officialShapes('cangjie-vsicons.svg').map(s => ({ d: s.d, fill: s.fill }));
	}
};

// =============================================================================
// capnp — Cap'n Proto
// =============================================================================
// RULE 2, category glyph, and the only concept in this tranche that has a real
// mark and cannot ship it.
//
// Cap'n Proto's logo exists and was hunted properly: capnproto.org/images/logo.png
// and capnproto/capnproto's doc/images/logo.png are the same 635x356 raster, and
// it is a WORDMARK — "CAP'N PROTO" set in two lines of a Victorian slab face over
// "serialization protocol" in 6 pt. There is no symbol anywhere in the project,
// no SVG in the repository (its only vector is doc/images/twitter.svg), no
// simple-icons entry and no gilbarbara entry.
//
// A wordmark of eleven letters on two lines has no reading at 16 px, and tracing
// the raster is banned by L2 whatever the licence says — which ends it before the
// legibility question is even reached. vscode-icons draws a red plate reading
// "C'nP", which is a three-letter monogram it invented; Material draws a red "C".
// Both are the thing R1's letter ban exists to keep out. So capnp takes the
// bracket glyph.
S.capnp = codeGlyph('Cap\'n Proto',
	'Cap\'n Proto\'s mark exists and cannot ship. It is a WORDMARK — "CAP\'N PROTO" over '
	+ '"serialization protocol" in a Victorian slab face — published only as a 635x356 raster '
	+ '(capnproto.org/images/logo.png, mirrored at doc/images/logo.png); the project has no '
	+ 'symbol, no SVG of the logo, and neither simple-icons nor gilbarbara/logos carries an '
	+ 'entry. Two things end it before L5 is even reached: there is no vector of the mark '
	+ 'anywhere, and tracing the raster is what L2 forbids on FIDELITY grounds — the one rule '
	+ 'the D22 amendment does not reach. Even with a vector, an eleven-letter wordmark on two '
	+ 'lines has no reading at 16 px. '
	+ 'vscode-icons\' red "C\'nP" plate and Material\'s red "C" are both invented monograms');

// =============================================================================
// casc — the CASC language
// =============================================================================
// `.casc` is CASC-Lang/CASC, a JVM language — not Blizzard's Content Addressable
// Storage Container, which shares the acronym; vscode-icons' own icon request
// (issue #2688) names the language and its marketplace extension, which is how
// the ambiguity was settled rather than guessed.
//
// SOURCING: CASC publishes its mark as CASC-Vscode/icon.png, a raster, and there
// is no vector in any of the org's eight repositories. vscode-icons' file is a
// faithful vector of that PNG — the same eight-bladed aperture in the same
// #FF6A00 and #00C7FF — so it is the geometry. It is also the first source file
// in this set drawn entirely with `<polygon>`, hence polyShapes() above.
//
// WHAT L5 FORCES: the mark sets "CA SC" in white across the aperture's black
// centre, and each of those four letters lands in a 1.82 x 2.54 px box at the
// shipped fit, which puts their strokes at a fraction of a pixel. They are
// dropped. The black octagonal field they sit on goes with them: it is unfilled
// in the source, i.e. black, and black measures 1.13:1 against #121314, so it
// paints nothing a reader can see; dropping it lets the blades fill the envelope
// instead of the field's empty corners. What ships is the aperture, which is what
// the mark IS.
S.casc = {
	title: 'CASC',
	brand: '#FF6A00',
	env: ENV.compact,
	source: {
		name: 'CASC (faithful vector — vscode-icons)', slug: 'casc',
		license: 'MIT (vscode-icons/vscode-icons); the CASC sources are Apache-2.0 '
			+ '(CASC-Lang/CASC). Recorded and NOT gating',
		url: 'https://github.com/CASC-Lang/CASC-Vscode/blob/main/icon.png',
		artwork: 'casc-vsicons.svg',
		note: '32x32 drawn as PRIMITIVES, not paths: one unfilled black octagon, then eight '
			+ 'aperture blades as polygons (four #00C7FF, four #FF6A00), then the four white '
			+ '"CA SC" letters as paths. CASC-Lang publishes the mark as CASC-Vscode/icon.png and '
			+ 'has no vector in any of its eight repositories. The subject is the JVM LANGUAGE at '
			+ 'CASC-Lang/CASC — vscode-icons issue #2688 names it and its marketplace extension — '
			+ 'and not Blizzard\'s Content Addressable Storage Container, which shares the '
			+ 'acronym. Fetched to sources-svg/casc-vsicons.svg'
	},
	simplifications: [
		'the four white "CA SC" letters are dropped: at the shipped fit each lands in a '
		+ '1.82 x 2.54 px box, which puts their strokes at a fraction of a pixel — far under L5\'s '
		+ '1.2 px official-forced floor',
		'the black octagonal field behind the blades is dropped with them. The source leaves it '
		+ 'unfilled, i.e. black, and black measures 1.13:1 against #121314 — it paints nothing a '
		+ 'reader can see on the product backdrop — and without it the eight blades fill the '
		+ 'envelope instead of the field\'s empty corners',
		'the eight blades themselves are untouched, in the mark\'s own two hexes; at the compact '
		+ 'envelope they measure 3.15 x 5.33 px at the smallest and 6.10 x 3.75 at the largest, '
		+ 'and the mark\'s sustained ink runs are 0.84 px at the 25th percentile and 1.66 at the '
		+ 'median — the low quartile is the taper of an aperture blade, not a thin feature, and '
		+ 'the 16 px proof is where that shows'
	],
	parts() {
		return polyShapes('casc-vsicons.svg')
			.filter(s => s.fill)
			.map(s => ({ d: s.d, fill: s.fill }));
	}
};

// =============================================================================
// cbx — BibLaTeX citation style
// =============================================================================
// RULE 2, category glyph. `.cbx` is one of BibLaTeX's three style files — `.bbx`
// bibliography, `.cbx` CITATION, `.lbx` localisation — and Material's own file
// list confirms the reading (it registers bbx, cbx and lbx together in its LaTeX
// block). BibLaTeX is a CTAN package with no mark; LaTeX's own logotype is a
// five-letter word set in a way no icon can hold, and it would be the parent
// package's mark on a child's file type in any case. Material draws a book with
// quotation marks on it, which is Material's own metaphor for "citation".
S.cbx = codeGlyph('BibLaTeX citation style',
	'`.cbx` is BibLaTeX\'s CITATION style file, one of the bbx/cbx/lbx trio (Material registers '
	+ 'the three together). BibLaTeX is a CTAN package and owns no mark; LaTeX\'s own logotype is '
	+ 'a five-letter word with raised and lowered glyphs that no 16 px icon can hold, and it '
	+ 'would be a parent package\'s mark on a child\'s file type. Material draws a book with '
	+ 'quotation marks, its own metaphor. The generic-code category glyph');

// =============================================================================
// cddl — Concise Data Definition Language
// =============================================================================
// RULE 2, category glyph. CDDL is an IETF standard (RFC 8610) for describing CBOR
// and JSON data structures. A standards document has no brand and no mark, the
// IETF publishes none for individual RFCs, and vscode-icons draws green braces
// around 0s and 1s — which is a generic code metaphor, drawn once for one file
// type instead of shared, and this set has a shared one.
S.cddl = codeGlyph('CDDL',
	'CDDL is an IETF standard — RFC 8610, the data-definition language for CBOR and JSON. A '
	+ 'standards document has no brand and no mark; the IETF publishes none per RFC, and there is '
	+ 'nothing to hunt. vscode-icons draws braces around 0s and 1s, which is a generic code '
	+ 'metaphor drawn once for one file type; this set has a shared one. The generic-code '
	+ 'category glyph');

// =============================================================================
// cds — SAP Core Data Services
// =============================================================================
// WORKING RULE 1, branch (b), across the slice boundary. A `.cds` is a Core Data
// Services model in SAP's Cloud Application Programming model — the language ids
// the roster records (cds, cds-markdown-injection) are the SAP CDS extension's —
// so this is SAP's own language and SAP's mark applies, exactly as it does for
// A01's abap. The company-mark rider is what makes that legal and it was ratified
// at the A01 gate.
//
// Branch (a) first: no source theme draws a distinct non-letter CDS glyph. Material
// draws a cloud with an arrow through it, which is a metaphor for "cloud platform"
// and not a variant mark; vscode-icons draws no cds at all. So cds ships A01's abap
// master byte for byte — the same SAP parallelogram, under its own id.
S.cds = fromA01('sap', 'abap', 'SAP CDS (Core Data Services)',
	'WORKING RULE 1(b), cross-slice: .cds is a Core Data Services model in SAP\'s Cloud '
	+ 'Application Programming model, so SAP\'s mark applies for the same reason it applies to '
	+ 'abap (the company-mark rider, ratified at the A01 gate). Branch (a) was checked and is '
	+ 'empty — Material draws a cloud with an arrow, a platform metaphor rather than a variant '
	+ 'glyph, and vscode-icons draws no cds — so cds ships A01\'s abap master byte-identically '
	+ 'under its own id');

// =============================================================================
// ceylon — Ceylon (Red Hat / Eclipse)
// =============================================================================
// `.ceylon` is the Ceylon language, and its mark is the elephant — Ceylon, the
// island, the elephant. The project is archived and the mark went with it:
// ceylon-lang.org is now an Eclipse Foundation shell whose only vector is
// Eclipse's own logo, and the archived eclipse-archived/ceylon-lang.org tree has
// images/ceylon-logo.png and ceylon-logo-2x.png and no SVG at all.
// gilbarbara/logos carries a faithful vector of the same elephant, so that is the
// geometry; vscode-icons independently traces the same drawing, which is the
// corroboration L2 likes and not the source.
S.ceylon = {
	title: 'Ceylon',
	brand: '#E3A835',
	env: ENV.wide,
	source: {
		name: 'Ceylon (faithful vector — gilbarbara/logos)', slug: 'ceylon',
		license: 'no declared licence — gilbarbara/logos ships no LICENSE file; the mark is the '
			+ 'Eclipse Ceylon project\'s. Recorded and NOT gating, per the A01 fix-round ruling '
			+ '(the Adobe situation, ruled)',
		url: 'https://github.com/gilbarbara/logos/blob/main/logos/ceylon.svg',
		artwork: 'ceylon-gilbarbara.svg',
		note: '512x174 lockup, four layers: the #AB710A far legs and ear line, the #E3A835 '
			+ 'elephant, a white-to-#AB710A gradient painted over the same contour as a shading '
			+ 'pass, and the "ceylon" wordmark in its own gradient. ceylon-lang.org is now an '
			+ 'Eclipse Foundation shell and the archived eclipse-archived/ceylon-lang.org tree '
			+ 'publishes the logo as images/ceylon-logo.png only. vscode-icons traces the same '
			+ 'elephant, which corroborates the drawing without being the source. Fetched to '
			+ 'sources-svg/ceylon-gilbarbara.svg'
	},
	simplifications: [
		'the "ceylon" wordmark is dropped and the elephant ships alone — the icon is the symbol',
		'the file\'s third layer is dropped: it repaints the elephant\'s own contour with a '
		+ 'white-to-#AB710A gradient as a shading pass. L8 bans gradients and there is no flat '
		+ 'stop worth keeping — flattening it would repaint the whole animal in one of the two '
		+ 'colours already on the icon',
		'NOT reduced otherwise, and measured at the shipped fit: the two far legs are 1.34 and '
		+ '1.83 px wide, the gap between the near pair is a 1.46 x 2.26 px counter, and the '
		+ 'mark\'s sustained ink runs are 1.09 px at the 25th percentile and 2.09 at the median. '
		+ 'The legs sit at L5\'s 1.2 px official-forced floor rather than comfortably over it'
	],
	parts() {
		const sh = officialShapes('ceylon-gilbarbara.svg');
		return [{ d: sh[0].d, fill: '#AB710A' }, { d: sh[1].d, fill: '#E3A835' }];
	}
};

// =============================================================================
// cf + cfc + cfm — Adobe ColdFusion   ·   REBUILT BY THE FIX ROUND (2026-09-03)
// =============================================================================
// The gate shipped these three as Adobe's corporate red "A" (A01's actionscript),
// under flag 1, because Adobe's own ColdFusion plate is a #002258 field that
// measures 1.21:1 against #121314 — at 16 px the plate was not there and two pale
// letters were left floating. Sebastian OVERTURNED that at the A02 gate, with a
// directive rather than a preference: "In those cases you can use a background in
// a frame with their corners rounded (like in previous iterations)", and, asked
// which frame, he picked Adobe's own — "fetch Adobe's actual ColdFusion product
// icon: bright rounded frame + dark field + Cf letters, colors verbatim."
//
// THE LAW THAT MOVED, and it is general: a mark whose own FIELD cannot clear the
// backdrop may ship the brand's own FRAMED construction. The frame carries the
// silhouette, and the dark field inside it stops being backdrop-meeting ink and
// becomes mark-interior ink — which is never lifted (the §5 lift/plate erratum,
// now amended to say so). Nothing here is a colour we invented: the frame is the
// mnemonic's own hue, the field is Adobe's own navy, unlifted.
//
// THE HUNT — and Adobe publishes the frame, so nothing had to be derived from
// taste. Two Adobe files, both fetched and kept:
//
//   coldfusion-official.svg        Adobe's 2021 ColdFusion logo, the "Outline no
//                                  shadow" cut — a 56x54 #002258 rounded rect,
//                                  rx/ry 9.9138, carrying the #7BADFF "Cf". This
//                                  is the PLATE, the CORNER RADIUS, the LETTERS
//                                  and all three colours, verbatim.
//   coldfusion-framed-official.svg Adobe's OWN framed ColdFusion product icon,
//                                  served from adobe.com's product-icon directory
//                                  (/content/dam/shared/images/product-icons/svg/
//                                  coldfusion.svg) and carrying Adobe's internal
//                                  filename `cf_builder_2016_appicon.svg` in its
//                                  id attribute. 256 x 249.6: a #CADBFE ring —
//                                  built exactly the way L8 forces us to build
//                                  one, an outer rect with an inner rect wound
//                                  against it, no stroke anywhere — around a
//                                  #000F34 field, with the "Cf" on top. This is
//                                  the FRAME, and the geometry below is measured
//                                  off it.
//
// THE MEASUREMENTS. Adobe's frame is a fixed fraction of the icon's width:
// 10.7 / 256 = 0.0418 on ColdFusion's own framed cut, and exactly 10 / 240 =
// 1/24 on the two siblings Adobe serves from the same directory in the same
// generation (framemaker-framed-official.svg and robohelp-framed-official.svg,
// Adobe's own rh_12_app_RGB).
// Adobe's framed ColdFusion is SQUARE-cornered, so the rounding Sebastian asked
// for comes from Adobe as well: photoshop-ipad-official.svg, Adobe's rounded
// framed cut, is a 240 x 234 outer rect at r 42.5 around a 220 x 214 field at
// r 36.3, inset 10 — and 42.5 / 240 = 0.17708 is the SAME rounded rectangle as
// ColdFusion's own plate (9.9138 / 56 = 0.17703). So the outer radius is
// ColdFusion's own, and the only number borrowed from a sibling is the inner
// one: 36.3 / 42.5 = 0.8541 of it.
//
// WHAT THE PRETTIER RIDER HAD TO CHANGE, and it is one number. Adobe's w/24 frame
// measures 2.33 units on the 56-wide plate, which at the compact envelope is
// 0.53 px — five times under L5's 1.2 px official-forced floor, and the fix round
// rendered it: a halo, not a frame. The rider therefore thickens the ONE element
// that carries the silhouette, and it is thickened inside Adobe's own way of
// specifying it — the frame stays a fraction of the plate width, the denominator
// moves from 24 to 10. Ten is the largest denominator that clears the floor
// (w/11 lands at 1.16 px, w/10 at 1.28 px), so this is the smallest legal
// departure from Adobe's proportion, not a taste. Everything else — plate,
// radius, letters, three colours — is Adobe's, untouched.
const CF_ART = 'coldfusion-official.svg';
const CF_FRAME_ADOBE = 1 / 24;        // Adobe's own: 10/240 on the framed siblings
const CF_FRAME = 1 / 10;              // the rider's, the least that clears 1.2 px
const CF_INNER_R = 36.3 / 42.5;       // photoshop-ipad-official.svg: inner r / outer r

/**
 * Adobe's framed construction, assembled from Adobe's own artwork. The FRAME is a
 * filled ring and not a stroke (L8), which means the inner contour has to be wound
 * AGAINST the outer one so plain nonzero fill punches it out — the same trap A01's
 * vsix flag records, where two same-wound subpaths came out as a solid blob.
 * pathkit's `roundRect` takes the winding as an argument for exactly this.
 *
 * The field is Adobe's whole plate rather than the ring's inner rectangle. Adobe's
 * own file insets its field rect to the ring's inner edge; painting the full plate
 * and laying the ring on its border is the same picture without a seam for the
 * rasteriser to find in the corners, and it keeps Adobe's rect on the icon verbatim.
 */
const cfParts = () => {
	const plate = rectShapes(CF_ART)[0];          // 0,0 56 x 54, r 9.9138, #002258
	const mnemonic = officialShapes(CF_ART);      // the "C" and the "f", #7BADFF
	const ink = mnemonic[0].fill;
	const f = plate.w * CF_FRAME;
	const outer = roundRect(plate.x, plate.y, plate.w, plate.h, plate.r, true);
	return [
		{ d: outer, fill: plate.fill },
		{ d: outer + roundRect(plate.x + f, plate.y + f, plate.w - 2 * f, plate.h - 2 * f,
			plate.r * CF_INNER_R, false), fill: ink },
		...mnemonic.map(s => ({ d: s.d, fill: ink }))
	];
};

const CF_SOURCE = {
	name: 'Adobe ColdFusion (brand\'s own SVG, both cuts)', slug: 'coldfusion',
	license: 'Adobe trademark and brand assets, all rights reserved. RECORDED AND NOT GATING, '
		+ 'per the A01 fix-round ruling — this is a personal, non-distributed build',
	url: 'https://www.adobe.com/content/dam/shared/images/product-icons/svg/coldfusion.svg',
	artwork: CF_ART,
	note: 'TWO Adobe files, because Adobe publishes the mark twice. (1) '
		+ 'coldfusion-official.svg — the 2021 logo, "Outline no shadow", 56x54: a #002258 '
		+ 'rounded rect at rx/ry 9.9138 under a #7BADFF "Cf" in two paths. Supplies the plate, '
		+ 'the corner radius, the letters and every colour. (2) coldfusion-framed-official.svg '
		+ '— Adobe\'s own FRAMED product icon, fetched from adobe.com\'s product-icon directory '
		+ 'and carrying Adobe\'s internal name cf_builder_2016_appicon.svg in its id, 256x249.6: '
		+ 'a #CADBFE ring (outer rect + counter-wound inner rect, no stroke) inset 10.7 around a '
		+ '#000F34 field. Supplies the FRAME. Its inset is 10.7/256 = 4.18% of the width; the '
		+ 'two siblings Adobe serves from the same directory in the same generation — '
		+ 'framemaker-framed-official.svg and robohelp-framed-official.svg, Adobe\'s own '
		+ 'rh_12_app_RGB — are 10/240 = 1/24 '
		+ 'exactly. Adobe\'s framed cut is square-cornered, so the rounding comes from Adobe\'s '
		+ 'own rounded framed cut, photoshop-ipad-official.svg (240x234 outer r 42.5, 220x214 '
		+ 'field r 36.3, inset 10): 42.5/240 = 0.17708 is ColdFusion\'s own plate radius '
		+ '(9.9138/56 = 0.17703) to five decimals, so only the INNER radius ratio, 36.3/42.5 = '
		+ '0.8541, is borrowed. Wikimedia Commons carries the 2021 logo as "Adobe ColdFusion logo '
		+ '2021.svg" and the rounded framed cut as "Adobe Photoshop iPad 2019.svg"; the framed '
		+ 'ColdFusion and FrameMaker cuts come from adobe.com itself'
};

const CF_SIMPLIFICATIONS = [
	'THE FIX-ROUND CONSTRUCTION (ruled 2026-09-03). Adobe\'s framed product icon ships: the '
	+ '#7BADFF frame carries the silhouette against #121314, the #002258 field is now '
	+ 'mark-interior ink rather than backdrop-meeting ink, and the "Cf" is Adobe\'s own. The '
	+ 'field is NOT lifted — that is the §5 lift/plate erratum as the ruling amended it, not an '
	+ 'exemption: ink that prints on the mark\'s own field never lifts, and here the frame is '
	+ 'what meets the backdrop (#7BADFF measures 8.21:1)',
	'PRETTIER RIDER, one number. Adobe\'s frame is a fixed fraction of the icon width — '
	+ '10.7/256 on ColdFusion\'s own framed cut, 10/240 = 1/24 on the FrameMaker and RoboHelp '
	+ 'cuts Adobe serves beside it. On the 56-wide plate that is 2.33 units, which lands at '
	+ '0.53 px at the shipped fit: five times under L5\'s 1.2 px official-forced floor, and a '
	+ 'halo rather than a frame when rendered. The frame is thickened inside Adobe\'s own '
	+ 'specification form, w/24 -> w/10 = 5.6 units = 1.28 px. w/11 was measured first and '
	+ 'lands at 1.16 px, under the floor, so w/10 is the SMALLEST legal departure from Adobe\'s '
	+ 'proportion rather than a chosen weight',
	'the corner radii are Adobe\'s and only one of them is borrowed: the outer is ColdFusion\'s '
	+ 'own plate radius, 9.9138 on 56 (0.17703 of the width), and the inner is 0.8541 of it — '
	+ 'the ratio Adobe draws in photoshop-ipad-official.svg, its own ROUNDED framed cut, whose '
	+ 'outer radius (42.5/240 = 0.17708) is ColdFusion\'s plate radius to five decimals. '
	+ 'Adobe\'s framed ColdFusion is square-cornered; the ruling asked for rounded corners and '
	+ 'Adobe\'s own system supplies them',
	'the frame is a FILLED RING, not a stroke — L8 bans stroke= — built as Adobe builds it in '
	+ 'its own file: an outer contour with an inner one wound against it, punched by plain '
	+ 'nonzero fill. Adobe declares fill-rule:evenodd on the same construction; this set emits '
	+ 'no fill-rule, so the winding does the work (the trap A01\'s vsix flag records, where two '
	+ 'same-wound subpaths came back as a solid blob, was checked for here and the ring is open)',
	'NOT reduced otherwise, and measured at the shipped fit: the frame runs a flat 1.28 px, the '
	+ 'field is 10.24 x 9.78 px inside it, and the "Cf" is 7.10 x 6.18 px with 1.57 px of field '
	+ 'between the letters and the frame. The letters are the thin part of this mark — their '
	+ 'sustained ink runs are 0.97 px at the 5th percentile, 1.06 at the 25th and 1.19 px at '
	+ 'the MEDIAN, which is Adobe\'s own drawing at 16 px and not the fit. They are not '
	+ 'thickened: redrawing a brand\'s letterforms is the freehand geometry L2 hard-rejects'
];

// `cf` matches .cfm/.cfc/.cfml/.lucee and the cfml language ids, `cfc` is a
// ColdFusion Component and `cfm` a ColdFusion Markup page. Adobe publishes ONE
// ColdFusion mark, not one per file extension, so the three are one family and the
// two variants are rule 1(b) of the base — the family is `coldfusion` now, and the
// `adobe` family the gate declared (whose only members were these three, pointing
// at A01's actionscript) is gone with the construction it existed for.
const CF_MEMBER_WHY = 'WORKING RULE 1(b): Adobe publishes ONE ColdFusion mark, not one per file '
	+ 'extension, and no source theme draws a distinct non-letter variant glyph for a .cfc or a '
	+ '.cfm — vscode-icons redraws the same Cf plate for both — so branch (a) has nothing to '
	+ 'adapt and the variant ships the family base mark byte-identically under its own id';

S.cf = {
	title: 'ColdFusion (Adobe)',
	brand: '#002258',
	env: ENV.compact,
	plate: true,   // an official FIELD carrying a glyph (R8 lane, see audit.mjs)
	source: CF_SOURCE,
	simplifications: CF_SIMPLIFICATIONS,
	parts: cfParts
};
S.cfc = {
	title: 'ColdFusion Component (Adobe)',
	brand: S.cf.brand,
	env: S.cf.env,
	plate: true,
	family: { name: 'coldfusion', base: 'cf', from: 'A02', mode: 'identical' },
	source: { ...CF_SOURCE },
	simplifications: [...CF_SIMPLIFICATIONS, CF_MEMBER_WHY],
	parts() { return S.cf.parts(); }
};
S.cfm = {
	title: 'ColdFusion Markup (Adobe)',
	brand: S.cf.brand,
	env: S.cf.env,
	plate: true,
	family: { name: 'coldfusion', base: 'cf', from: 'A02', mode: 'identical' },
	source: { ...CF_SOURCE },
	simplifications: [...CF_SIMPLIFICATIONS, CF_MEMBER_WHY],
	parts() { return S.cf.parts(); }
};

// =============================================================================
// chef + chef-cookbook — Chef
// =============================================================================
// Berksfile, chefignore and Policyfile.rb are Chef Infra's own files, so Chef's
// mark applies. WHICH Chef mark is the question the hunt answered, and the answer
// is not the one chef.io serves.
//
// chef.io's primary logo today is progress-chef-primary-logo-svg.svg: the PROGRESS
// corporate symbol — Progress acquired Chef in 2020 — beside a "Progress Chef"
// wordmark. That symbol is Progress's, not Chef's; putting it on a Berksfile would
// be a parent company's mark standing in for a product that has its own. Chef's
// own mark is the arc "C", the concentric orange-and-slate ring the project used
// through 2020 and the one every icon set and simple-icons still carries.
// gilbarbara/logos has it as a vector in both official colours, so that ships.
//
// chef-cookbook is branch (b): a `.ckbk` is a Chef cookbook, the same family one
// level down, and no source theme draws a distinct variant glyph for it —
// vscode-icons composes a BOOK with the chef mark dropped onto its cover, which is
// its own composition and not a variant mark.
S.chef = {
	title: 'Chef',
	brand: '#F38B00',
	env: ENV.compact,
	source: {
		name: 'Chef (faithful vector — gilbarbara/logos)', slug: 'chef',
		license: 'no declared licence — gilbarbara/logos ships no LICENSE file; the mark is '
			+ 'Progress Software\'s. Recorded and NOT gating, per the A01 fix-round ruling',
		url: 'https://github.com/gilbarbara/logos/blob/main/logos/chef.svg',
		artwork: 'chef-gilbarbara.svg',
		note: '256x274 lockup: layers 0-3 are the "CHEF" wordmark and layers 4-16 are the arc '
			+ 'mark — thirteen concentric arc segments in #F38B00 orange and #435363 slate. '
			+ 'chef.io\'s own asset (progress-chef-primary-logo-svg.svg) is the PROGRESS corporate '
			+ 'symbol plus a "Progress Chef" wordmark, i.e. the parent company\'s mark rather than '
			+ 'Chef\'s; simple-icons\' `chef` (#F09820) is a single-path monochrome flattening of '
			+ 'the same arc mark, which R1 does not want. Fetched to sources-svg/chef-gilbarbara.svg'
	},
	simplifications: [
		'the "CHEF" wordmark (layers 0-3) is dropped and the arc mark ships alone',
		'NOT reduced, and this is the call to look at: thirteen arc segments is far past L5\'s '
		+ '"about three distinguishable sub-shapes", but they are not thirteen sub-shapes — they '
		+ 'are one concentric ring, and every candidate reduction deletes rings and turns Chef\'s '
		+ 'mark into a plain "C". Measured at the compact envelope: the segments span '
		+ '1.54 x 2.58 px at the smallest and 10.88 x 5.60 at the largest, and the mark\'s '
		+ 'sustained ink runs are 0.53 px at the 5th percentile, 1.09 at the 25th and 1.22 at the '
		+ 'MEDIAN — thin, three times jar\'s 0.38 but under the 1.2 px official-forced floor at '
		+ 'the quartile. That is why the 16 px verdict is marginal, and it says so',
		'the #435363 slate measures 2.35:1 against #121314 — under the 3.0:1 lift trigger — and is '
		+ 'NOT lifted: it is the second tone of a two-tone mark whose primary is #F38B00 at '
		+ '7.53:1, and raising it to L 88 (#DBE0E6) would turn Chef\'s slate into near-white and '
		+ 'invert the mark\'s own tonal order'
	],
	parts() {
		return officialShapes('chef-gilbarbara.svg').slice(4).map(s => ({ d: s.d, fill: s.fill }));
	}
};
// WORKING RULE 1(b), inside this slice: a .ckbk is a Chef cookbook, and Chef ships
// one mark for the product rather than one per artefact.
S['chef-cookbook'] = {
	title: 'Chef cookbook',
	brand: '#F38B00',
	env: ENV.compact,
	family: { name: 'chef', base: 'chef', from: 'A02', mode: 'identical' },
	source: { ...S.chef.source },
	simplifications: [
		...S.chef.simplifications,
		'WORKING RULE 1(b): a .ckbk is a Chef cookbook — the same family one level down — and no '
		+ 'source theme draws a distinct non-letter variant glyph for it. vscode-icons composes a '
		+ 'BOOK with the chef mark dropped on its cover, which is its own composition and not a '
		+ 'variant mark, so branch (a) has nothing to adapt and chef-cookbook ships the family '
		+ 'base mark byte-identically under its own id'
	],
	parts() { return S.chef.parts(); }
};

// =============================================================================
// chess — .pgn / .fen
// =============================================================================
// RULE 2, OBJECT metaphor. `.pgn` is Portable Game Notation and `.fen` is
// Forsyth-Edwards Notation: two open formats for recording chess games and
// positions. Neither has an owner — PGN is a 1994 community standard and FEN is
// from a 19th-century newspaper column — and no brand owns chess. The object the
// concept names is a chess piece, so it gets one: a new object glyph in the set's
// own vocabulary, authored in geom.mjs as chessRook().
//
// WHICH PIECE, decided by measurement rather than by taste (the study is
// proofs/chess-piece-study.png). A pawn, a king and a knight were drawn to the
// same vocabulary discipline and fitted to the same envelope. The knight — the
// piece most sets reach for — loses its muzzle and mane at 16 px and arrives as a
// blob with a notch; the king's cross is a 1.3 px bar over a 1.5 px stem and
// breaks up; the pawn survives but is a circle over a cone, which is the shape a
// map pin and a person glyph also make. The ROOK's distinguishing feature is its
// battlements, and they are 2.5 px teeth separated by 1.75 px notches — the only
// candidate whose identifying detail is over L5's floor by construction.
S.chess = {
	title: 'Chess notation (neutral glyph)',
	brand: NEUTRAL,
	neutral: true,
	env: { w: 11.6, h: 13.4 },
	source: {
		name: 'none — neutral glyph vocabulary', slug: null, license: null, url: null,
		note: 'no brand owns chess: .pgn is a 1994 community standard and .fen is from a '
			+ '19th-century newspaper column. The chess rook is a new object glyph in the set\'s '
			+ 'own vocabulary (working rule 2), authored in geom.mjs as chessRook(). A pawn, a '
			+ 'king and a knight were drawn and measured against it first '
			+ '(proofs/chess-piece-study.png); the rook wins because its battlements are 2.5 px '
			+ 'teeth on 1.75 px notches, the only candidate whose identifying detail clears L5 by '
			+ 'construction. Material independently reaches for a chess piece and draws a king'
	},
	simplifications: [],
	parts() {
		return chessRook().map(d => ({ d, fill: NEUTRAL }));
	}
};

// =============================================================================
// circom — circom (iden3 / 0KIMS)
// =============================================================================
// `.circom` is a circom arithmetic-circuit source, and circom has a symbol as well
// as a wordmark: iden3.io serves img/logos/circom.svg, in which the first two
// layers are the mark — a C-shaped ring with a bar driven through it — and the
// remaining seven are the "circom" letters. iden3/circom itself publishes only
// mkdocs/docs/circom-logo-black.png, so the site's vector is the source.
//
// The mark is achromatic: a white ring and a bar painted with a #C6C6C6 -> #4E4E4E
// gradient. The bar is flattened to its offset-0 stop rather than offset-1, and
// the reason is measured: #4E4E4E is 2.24:1 against #121314, which trips the lift,
// and lifting an achromatic ink lands it at L 88 = #E0E0E0 — indistinguishable
// from the white ring it is supposed to contrast with. #C6C6C6 is 10.89:1 and
// keeps the mark two-tone.
S.circom = {
	title: 'circom',
	brand: '#FFFFFF',
	env: ENV.wide,
	source: {
		name: 'circom (brand\'s own SVG)', slug: 'circom',
		license: 'GPL-3.0 (iden3/circom); the site asset declares no separate terms. Recorded and '
			+ 'NOT gating',
		url: 'https://iden3.io/img/logos/circom.svg',
		artwork: 'circom-official.svg',
		note: '186x38 lockup, nine layers: layer 0 is the white C-ring, layer 1 the bar through '
			+ 'it (painted with a #C6C6C6 -> #4E4E4E gradient), and layers 2-8 are the "circom" '
			+ 'letters. iden3/circom publishes only mkdocs/docs/circom-logo-black.png, a 635 px '
			+ 'raster of the same lockup. Fetched to sources-svg/circom-official.svg'
	},
	simplifications: [
		'the "circom" wordmark (layers 2-8) is dropped and the symbol ships alone',
		'the bar\'s gradient is flattened to its OFFSET-0 stop #C6C6C6 rather than to offset 1, '
		+ 'and the reason is a measurement: #4E4E4E is 2.24:1 against #121314, so it trips the '
		+ '3.0:1 lift trigger, and lifting an achromatic ink puts it at L 88 = #E0E0E0, which is '
		+ 'the white ring it exists to contrast with. #C6C6C6 measures 10.89:1 and keeps the mark '
		+ 'two-tone',
		'NOT reduced, and measured at the shipped fit: the ring is 8.85 x 4.53 px with a '
		+ '1.71 x 1.26 px counter, the bar is 13.56 x 5.16, and the mark\'s sustained ink runs are '
		+ '1.25 px at the 25th percentile and 1.31 at the median — at L5\'s official-forced floor '
		+ 'rather than over the 1.5 px one, which is what makes the 16 px verdict marginal'
	],
	parts() {
		const sh = officialShapes('circom-official.svg');
		return [{ d: sh[0].d, fill: WHITE }, { d: sh[1].d, fill: '#C6C6C6' }];
	}
};

// =============================================================================
// module exports — the shape A02.mjs merges
// =============================================================================

export const SPECS = S;

/** Sheet order: the roster's own order. */
export const ORDER = ['bosque', 'bower', 'brainfuck', 'bruno', 'buckbuild', 'bucklescript',
	'c-al', 'c3', 'cabal', 'caddy', 'cadence', 'cairo', 'cake', 'cakephp', 'cangjie', 'capnp',
	'casc', 'cbx', 'cddl', 'cds', 'ceylon', 'cf', 'cfc', 'cfm', 'chef', 'chef-cookbook',
	'chess', 'circom'];

/**
 * L9 gate 2 — the 16 px proof, eyeballed. Read off the slice's own
 * proofs/proof-16px.png (every icon at a true 16 px next to a 10x
 * nearest-neighbour blow-up) and written down here, not asserted by a machine.
 */
export const PROOF16 = {
	bosque: ['pass (marginal)', 'the four back tiles fuse into one green field — only the front '
		+ 'tile\'s edge separates them — so what arrives is a green block with a white lambda on '
		+ 'it. The lambda holds and is what identifies the mark; the stack reads as depth rather '
		+ 'than as four sheets, which is what the official Fluent icon does at this size'],
	bower: ['pass (marginal)', 'unmistakably a bird: the orange head, the eye ring and the yellow '
		+ 'breast all separate. The green wing arrives as one wedge rather than as feathers and '
		+ 'the gray beak is a 2.4 px speck, and the #543729 keyline is invisible on the backdrop '
		+ 'by construction — so the bird reads by its five bright fills, which is what the mark '
		+ 'does on any dark ground'],
	brainfuck: ['pass', 'the bracket pair, 2.2 px stems, byte-identical to A01\'s thirteen — this '
		+ 'is A01\'s own verdict re-read at slice scale'],
	bruno: ['pass', 'the best-resolving branded mark in the tranche: both ears, the muzzle, both '
		+ 'eyes, the gray nose and the red tongue all separate, and it reads as a dog rather than '
		+ 'as a golden blob. Dropping the black keyline cost nothing visible — it measured 1.13:1'],
	buckbuild: ['pass (marginal)', 'the antler monogram arrives whole — five tines, the muzzle '
		+ 'line and the arrowhead all separate — and it is unmistakably a stag\'s head. Marginal '
		+ 'because the strokes run 1.25 px at the median, under L5\'s floor: what saves them is '
		+ 'that they are axis-aligned or at 45 degrees and land on pixel edges. The current '
		+ 'generation\'s own vector, the deer, runs 0.88 px at the median and is an orange hook '
		+ 'at this size — flagged'],
	bucklescript: ['pass', 'the red field with the white bar and its dot; both counters hold, the '
		+ 'rounded corners survive and the plate reads as a plate'],
	'c-al': ['pass', 'byte-identical to A01\'s al, as declared — Microsoft\'s AL lockup with its '
		+ 'stems at 1.63/1.81 px. A01\'s own verdict at slice scale'],
	c3: ['pass', 'both characters legible and the blue/violet split survives: the C\'s aperture '
		+ 'stays open and the 3\'s bowls do not fill in, at runs of 1.72/2.00 px'],
	cabal: ['pass', 'a clean five-pointed star, all five points resolving. The flag on this one is '
		+ 'about identity rather than legibility — it renders perfectly and says nothing about '
		+ 'Haskell'],
	caddy: ['pass (marginal)', 'the blue ring closes, the green shed reads as a padlock and the '
		+ 'node dot separates from the ring. What does not resolve is the shed\'s own internal '
		+ 'notch, so the mark arrives as "a lock in a ring" rather than as Caddy\'s shed — the '
		+ 'mark\'s own drawing at this size, not the fit'],
	cadence: ['pass', 'the cleanest branded mark in the tranche: the two nested squares stay apart '
		+ 'and the diagonal arrow reads as an arrow, at runs of 2.00/2.28 px'],
	cairo: ['pass (marginal)', 'the red disc and the runner both arrive, but the runner is the '
		+ 'mark\'s own negative space, so it reads as a dark bite out of the disc rather than as a '
		+ 'white figure; the head counter does separate from the body. That is the mark on a dark '
		+ 'ground and not the fit — flagged so it can be ruled on'],
	cake: ['pass (marginal)', 'the wedge, the white icing, the yellow cream and the gray wrench all '
		+ 'land and it reads as a slice with a tool laid across it. The wrench\'s jaws do not open, '
		+ 'and the #4A1700 outline is invisible on the backdrop so the slice\'s edges are its '
		+ 'colour boundaries. The most detailed mark in the tranche and the one closest to its '
		+ 'limit'],
	cakephp: ['pass (marginal)', 'three red tiers, cleanly separated, with the cream '
		+ 'bands reading dark — so the cake arrives as a striped red cylinder rather than as '
		+ 'red-and-cream. What to rule on is the negative-space call, which is flagged, not the '
		+ 'render'],
	cangjie: ['pass', 'both brackets hold, the gap between them stays open and the blue/green '
		+ 'split is unmistakable, at runs of 1.97/2.78 px'],
	capnp: ['pass', 'the bracket pair, byte-identical to the other three. The thing to read here '
		+ 'is the flag on why Cap\'n Proto\'s own mark — an eleven-letter wordmark that exists '
		+ 'only as a raster — cannot come with it'],
	casc: ['pass', 'the eight-bladed aperture reads as an aperture: every blade separates and the '
		+ 'orange and cyan halves are clean. Dropping the "CA SC" letters is what made this work — '
		+ 'with them it was a coloured ring full of mud'],
	cbx: ['pass', 'the bracket pair, byte-identical to the other three'],
	cddl: ['pass', 'the bracket pair, byte-identical to the other three'],
	cds: ['pass', 'byte-identical to A01\'s abap, as declared: the SAP field with its three letters '
		+ 'knocked out, white on blue. A01\'s own verdict at slice scale'],
	ceylon: ['pass (marginal)', 'the elephant\'s body, head, ear and all four legs land and the '
		+ 'trunk curls. The darker far legs (1.34 and 1.83 px wide) read as a shadow rather than '
		+ 'as legs and the counter between the near pair only just holds at 1.46 px, so it reads '
		+ 'as an elephant-shaped animal rather than as a drawn elephant'],
	// FIX ROUND — re-eyeballed on the rebuilt icon, not carried over
	cf: ['pass (marginal)', 'the ruling\'s own test, and it passes it: the #7BADFF frame carries '
		+ 'the silhouette cleanly at a flat 1.28 px, the rounded corners survive, and what arrives '
		+ 'is unmistakably an Adobe product icon in ColdFusion\'s blue rather than the dark hole '
		+ 'flag 1 measured. Marginal for the letters and not for the frame: the "Cf" is 7.10 x '
		+ '6.18 px at sustained runs of 0.97 / 1.06 / 1.19 px, so the C reads as an open arc and '
		+ 'the f as a stem with a crossbar rather than as crisp letterforms. That is Adobe\'s own '
		+ 'drawing at this size — it is the same two paths in the frameless cut, where the plate '
		+ 'was invisible as well — and thickening them would be redrawing a brand\'s letterforms, '
		+ 'which L2 hard-rejects. Beside typescript and dotenv on the sheet, the plate reads as '
		+ 'well and the glyph reads worse'],
	cfc: ['pass (marginal)', 'byte-identical to cf, as declared — the same framed plate and the '
		+ 'same marginal verdict'],
	cfm: ['pass (marginal)', 'byte-identical to cf, as declared — the same framed plate and the '
		+ 'same marginal verdict'],
	chef: ['pass (marginal)', 'an orange-and-slate ring, and honestly that is all: the individual '
		+ 'arc segments do not resolve and the mark reads as a target rather than as a "C" built '
		+ 'of arcs. It is still recognisably Chef\'s colours and Chef\'s shape, and every '
		+ 'reduction that would buy thicker ink deletes rings and stops being the mark — see the '
		+ 'flag'],
	'chef-cookbook': ['pass (marginal)', 'byte-identical to chef, as declared — the same ring and '
		+ 'the same marginal verdict'],
	chess: ['pass', 'the rook\'s three battlements and their two notches resolve cleanly and the '
		+ 'base plate stays separate at its 1.5 px gap. Unmistakably a chess piece, which is what '
		+ 'the piece study was for'],
	circom: ['pass (marginal)', 'the C-ring and the bar both land, and the bar\'s lighter gray does '
		+ 'separate from the white ring — but only just: at 16 px the two tones read as one light '
		+ 'mark with a bar through it rather than as two. Reads as circom\'s symbol']
};

/** Working rule 1 — declared brand families. */
export const FAMILIES = {
	al: {
		base: 'al', base_set: 'A01', members: ['c-al'], mode: 'identical',
		why: 'C/AL is AL\'s direct ancestor in the same Microsoft product line and Microsoft ships '
			+ 'one AL mark for the family, registered against the `al` language id. Branch (a) was '
			+ 'checked: vscode-icons draws the Microsoft DYNAMICS 365 sail for c-al, which is the '
			+ 'product suite\'s corporate mark rather than a C/AL variant glyph, so there is '
			+ 'nothing to adapt and the variant ships the family base byte-identically'
	},
	sap: {
		base: 'abap', base_set: 'A01', members: ['cds'], mode: 'identical',
		why: '.cds is a Core Data Services model in SAP\'s Cloud Application Programming model, so '
			+ 'SAP\'s mark applies for the same reason it applies to abap (the company-mark rider, '
			+ 'ratified at the A01 gate). No source theme draws a distinct non-letter CDS glyph — '
			+ 'Material draws a cloud with an arrow, a platform metaphor — so branch (b) applies'
	},
	// REPLACES the `adobe` family the gate declared. That one existed only to point
	// cf, cfc and cfm at A01's actionscript, and the fix-round ruling took the
	// construction away, so the family goes with it: ColdFusion now has a mark of its
	// own in this slice and the two variants are rule 1(b) of THAT. A01's own adobe
	// family (actionscript, adobe-swc) is untouched and stays A01-side.
	coldfusion: {
		base: 'cf', base_set: 'A02', members: ['cfc', 'cfm'], mode: 'identical',
		why: 'RULED 2026-09-03 — Sebastian, overturning flag 1: "In those cases you can use a '
			+ 'background in a frame with their corners rounded (like in previous iterations)", '
			+ 'and, on which frame, "Adobe\'s own framed icon — fetch Adobe\'s actual ColdFusion '
			+ 'product icon: bright rounded frame + dark field + Cf letters, colors verbatim." '
			+ 'So cf ships Adobe\'s framed ColdFusion construction and is the family base. Adobe '
			+ 'publishes ONE ColdFusion mark, not one per file extension, and no source theme '
			+ 'draws a distinct non-letter variant glyph for a .cfc or a .cfm — vscode-icons '
			+ 'redraws the same Cf plate for both — so branch (a) has nothing to adapt and cfc '
			+ 'and cfm ship the base byte-identically under their own ids'
	},
	chef: {
		base: 'chef', base_set: 'A02', members: ['chef-cookbook'], mode: 'identical',
		why: 'a .ckbk is a Chef cookbook, the same family one level down. vscode-icons composes a '
			+ 'BOOK with the chef mark on its cover, which is its own composition rather than a '
			+ 'variant glyph, so branch (a) has nothing to adapt and the variant ships the family '
			+ 'base mark byte-identically'
	}
};

/** Working rule 2 — the neutral vocabulary as this tranche uses it. */
export const NEUTRAL_COLLAPSE = {
	object_glyphs: {
		chess: 'chess rook — the castellated tower and its base plate, held apart by a 1.5 px gap '
			+ '(geom.chessRook)'
	},
	category_glyphs: {
		// The same payload A01 ships: CODE_ENV and genericCode() are reproduced from
		// A01.t2 verbatim, and check-slice.mjs asserts one member of this list is
		// byte-equal to one of A01's before the slice can pass.
		'generic-code': ['brainfuck', 'capnp', 'cbx', 'cddl']
	}
};

/** New vocabulary entries this tranche contributes to the slice's record. */
export const VOCABULARY = {
	'chess rook': 'geom.chessRook — a castellated tower over a separate base plate, the object a '
		+ '.pgn or .fen file records a game of'
};

/**
 * What the brand actually ships, for the fidelity strip and the sheet's provenance
 * panes. Display-safe: no gradients, no <style>, no external references, because
 * both surfaces are gated for that. Neutral concepts return null — no brand owns
 * them, so there is nothing to be faithful to.
 */
const wrap = (viewBox, body) => `<svg viewBox="${viewBox}">${body}</svg>`;
const fileSvg = (viewBox, file, fills) => wrap(viewBox, officialShapes(file)
	.filter(s => s.fill !== 'none')
	.map((s, i) => `<path fill="${(fills && fills[i]) || flat(s)}" d="${s.d}"/>`).join(''));

/**
 * Adobe publishes the ColdFusion mark TWICE, this build reads both, so the pane
 * shows both at the same height: LEFT the 2021 logo — the plate, its corner
 * radius, the "Cf" and every colour the icon ships — and RIGHT Adobe's own framed
 * product icon, which is where the frame comes from and which is square-cornered,
 * so the pane also shows what the ruling's rounded corners had to be derived for.
 * Rebuilt from parsed shapes rather than sanitised in place: both files paint
 * through a `<style>` block, which neither this pane nor the fidelity strip may
 * carry. The framed cut's class fills are named for the same reason cadence's are
 * — its `.st0`/`.st1` rules lead with fill-rule, which the shared reader skips.
 */
const cfOriginal = () => {
	const plate = rectShapes(CF_ART)[0];
	const framed = rectShapes('coldfusion-framed-official.svg')[0];   // 10.7,10.7 234.7x228.3
	const k = plate.h / 249.6;                                        // to the 2021 cut's height
	const x = plate.w + 6;
	return wrap(`0 0 ${(x + 256 * k).toFixed(2)} ${plate.h}`,
		`<path fill="${plate.fill}" d="${round(roundRect(plate.x, plate.y, plate.w, plate.h, plate.r, true))}"/>`
		+ officialShapes(CF_ART).map(s => `<path fill="${s.fill}" d="${s.d}"/>`).join('')
		+ `<g transform="translate(${x} 0) scale(${k.toFixed(5)})">`
		+ `<path fill="${framed.fill}" d="M${framed.x} ${framed.y}h${framed.w}v${framed.h}`
		+ `h${-framed.w}Z"/>`
		+ officialShapes('coldfusion-framed-official.svg')
			.map(s => `<path fill="#CADBFE" d="${s.d}"/>`).join('')
		+ '</g>');
};

export const ORIGINAL = {
	bosque: () => fileSvg('0 0 32 32', 'bosque-vsicons.svg'),
	bower: () => fileSvg('0 0 462.53 406.61', 'bower-official.svg'),
	brainfuck: () => null,
	bruno: () => wrap('0 0 32 32', officialShapes('bruno-vsicons.svg')
		.map(s => `<path fill="${s.fill || '#000000'}" d="${s.d}"/>`).join('')),
	buckbuild: () => fileSvg('0 0 32 32', 'buck-vsicons.svg', ['#4A69A5', '#4A69A5']),
	// the mark alone, gradient resolved and the fill-opacity shadow layer left out —
	// the provenance pane may carry neither a gradient nor an opacity
	bucklescript: () => wrap('0 0 192.45 193.74', [
		`<path fill="#E6484F" d="${officialShapes('rescript-official.svg')[1].d}"/>`,
		`<path fill="#FFFFFF" d="${officialShapes('rescript-official.svg')[4].d}"/>`,
		`<path fill="#FFFFFF" d="${officialShapes('rescript-official.svg')[2].d}"/>`
	].join('')),
	'c-al': () => wrap('0 0 255 255', officialShapes('al-microsoft.svg')
		.map(s => `<path fill="#2EA98E" d="${s.d}"/>`).join('')),
	// the logotype with its horizontal gradient resolved per subpath, which is how it
	// ships: the C on the offset-0 stop, the 3 on the offset-1 stop
	c3: () => {
		const sp = subpaths(officialShapes('c3-official.svg')[0].d);
		return wrap('0 0 353 217', `<path fill="#2563EB" d="${sp[0]}"/>`
			+ `<path fill="#7C3AED" d="${sp.slice(1).join('')}"/>`);
	},
	// the dark-ground copy of the lockup: its star and its white "Cabal". The file has
	// no viewBox (a 744x1052 Inkscape canvas), so the pane names the box the mark sits in
	cabal: () => {
		const sh = officialShapes('cabal-official.svg');
		return wrap('90 150 540 160', `<path fill="#567DD9" d="${sh[1].d}"/>`
			+ `<path fill="#FFFFFF" d="${sh[3].d}"/>`);
	},
	// the whole lockup, gradients resolved: the ring to the #1F88C0 the icon ships,
	// the shed to its own rgb() green, the wordmark letters to the ramp's middle stop
	caddy: () => {
		const sh = officialShapes('caddy-official.svg');
		return wrap('0 0 596.83 150.24', sh.filter(s => s.fill !== 'none').map((s, i) => {
			const fill = i === 0 ? '#1F88C0' : (s.fill && s.fill.startsWith('rgb')
				? '#22B638' : (s.fill || '#77C4F7'));
			return `<path fill="${fill}" d="${s.d}"/>`;
		}).join(''));
	},
	// the file paints through a <style> block, which the pane may not carry, so the two
	// class fills are named: #2A1E3C wordmark, #00DB80 symbol
	cadence: () => wrap('0 0 600 120', officialShapes('cadence-official.svg')
		.map((s, i) => `<path fill="${i < 7 ? '#2A1E3C' : '#00DB80'}" d="${s.d}"/>`).join('')),
	cairo: () => fileSvg('0 0 32 32', 'cairo-vsicons.svg'),
	cake: () => fileSvg('0 0 1000 1000', 'cake-official.svg'),
	// the brand's own WHITE lockup, as fetched — the pane shows what was downloaded and
	// the icon carries the brand's red, which the simplification log explains
	cakephp: () => fileSvg('0 0 230 24.673', 'cakephp-official.svg'),
	cangjie: () => fileSvg('0 0 32 32', 'cangjie-vsicons.svg'),
	capnp: () => null,
	// the aperture as the file draws it, polygons and all, plus the black field and the
	// four white letters the icon drops
	casc: () => wrap('0 0 32 32', polyShapes('casc-vsicons.svg')
		.map(s => `<path fill="${s.fill || '#000000'}" d="${s.d}"/>`).join('')
		+ officialShapes('casc-vsicons.svg')
			.map(s => `<path fill="#FFFFFF" d="${s.d}"/>`).join('')),
	cbx: () => null,
	cddl: () => null,
	cds: () => {
		const raw = readFileSync(join(SRCDIR, 'sap-official.svg'), 'utf8');
		const pts = (raw.match(/<polyline[^>]*points="([^"]+)"/) || [])[1].trim().split(/\s+/);
		const stops = [...raw.matchAll(/stop-color="(#[0-9a-fA-F]{3,6})"/g)].map(m => m[1]);
		let d = '';
		for (let i = 0; i < pts.length; i += 2) { d += `${i ? 'L' : 'M'}${pts[i]} ${pts[i + 1]}`; }
		return wrap('0 0 412.38 204', `<path fill="${stops[stops.length - 1]}" d="${d}Z"/>`
			+ officialShapes('sap-official.svg').map(s => `<path fill="#FFFFFF" d="${s.d}"/>`).join(''));
	},
	// the elephant and its wordmark, with both gradient layers resolved to a flat stop
	ceylon: () => wrap('0 0 512 174', officialShapes('ceylon-gilbarbara.svg')
		.map(s => `<path fill="${s.fill || '#AB710A'}" d="${s.d}"/>`).join('')),
	// FIX ROUND: was Adobe's corporate red A (adobe-official.svg), which is what the
	// three used to ship. Both ColdFusion cuts now, because the icon reads both.
	cf: cfOriginal,
	cfc: cfOriginal,
	cfm: cfOriginal,
	chef: () => fileSvg('0 0 256 274', 'chef-gilbarbara.svg'),
	'chef-cookbook': () => fileSvg('0 0 256 274', 'chef-gilbarbara.svg'),
	chess: () => null,
	circom: () => wrap('0 0 186 38', officialShapes('circom-official.svg')
		.map((s, i) => `<path fill="${i === 1 ? '#C6C6C6' : '#FFFFFF'}" d="${s.d}"/>`).join(''))
};

// =============================================================================
// STUDIES — the measured alternatives behind the calls that needed one
// =============================================================================
//
// The pilot's docker deck is the precedent: where a reduction or a decline is a
// judgement, the rejected candidates get rendered next to the shipped one at a
// true 16 px, so the verdict can be checked instead of believed.

const card = (name, body) => {
	const at = (px, cls = '', st = '') =>
		`<svg ${cls} ${st} width="${px}" height="${px}" viewBox="0 0 16 16">${body}</svg>`;
	return `<div class="c">${at(64)}<div class="t">${at(16)}${at(22)}${at(32)}</div>`
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

export const STUDIES = [
	{
		id: 'A02-t1-study',
		width: 1160, height: 1180,
		html: (place) => {
			const cf = officialShapes('coldfusion-official.svg');
			const adobe = officialShapes('adobe-official.svg');
			const br = officialShapes('bruno-vsicons.svg');
			const buckDeer = officialShapes('buck-official.svg').filter(s => s.fill !== 'none');
			const antler = officialShapes('buck-vsicons.svg');
			const ck = officialShapes('cake-official.svg');
			const cp = officialShapes('cakephp-official.svg');
			const vcp = officialShapes('cakephp-vsicons.svg');
			const cards = [
				card('cf &mdash; SHIPPED<br>Adobe\'s corporate A (A01\'s actionscript)',
					place([{ d: adobe[0].d, fill: '#FA0F00' }], ENV.wide))
					.replace('class="c"', 'class="c win"'),
				card('cf &mdash; Adobe\'s ColdFusion plate<br>REJECTED: the field is 1.21:1',
					place(cf.map(s => ({ d: s.d, fill: s.fill })), ENV.compact)),
				card('bruno &mdash; SHIPPED<br>no keyline: 5 layers',
					place([0, 2, 3, 4, 5].map(i => ({ d: br[i].d, fill: br[i].fill || '#000000' })),
						ENV.compact))
					.replace('class="c"', 'class="c win"'),
				card('bruno &mdash; keyline KEPT<br>REJECTED: over L8\'s 4 KB cap, 1.13:1',
					place(br.map(s => ({ d: s.d, fill: s.fill || '#000000' })), ENV.compact)),
				card('buckbuild &mdash; SHIPPED<br>Buck 1\'s antler, runs 0.50 / 0.97 / 1.25 px',
					place(antler.map(s => ({ d: s.d, fill: '#4A69A5' })), ENV.compact))
					.replace('class="c"', 'class="c win"'),
				card('buckbuild &mdash; Buck 2\'s own vector<br>REJECTED: runs 0.22 / 0.38 / 0.88 px',
					place(buckDeer.map(s => ({ d: s.d, fill: '#F69635' })), ENV.tall)),
				card('buckbuild &mdash; the same deer, opened up<br>REJECTED: no fit makes it an animal',
					place(buckDeer.map(s => ({ d: s.d, fill: '#F69635' })), { w: 13.6, h: 14.4 })),
				card('cake &mdash; SHIPPED<br>12 layers, 7 sub-pixel ones dropped',
					place(CAKE_KEEP.map(i => ({ d: ck[i].d, fill: ck[i].fill })), ENV.tall))
					.replace('class="c"', 'class="c win"'),
				card('cake &mdash; all 19 official layers<br>the 7 dropped run 0.16&ndash;0.84 px',
					place(ck.map(s => ({ d: s.d, fill: s.fill })), ENV.tall)),
				card('cakephp &mdash; SHIPPED<br>the brand\'s geometry in brand red',
					place([16, 17, 18].map(i => ({ d: cp[i].d, fill: '#D33C43' })), ENV.wide))
					.replace('class="c"', 'class="c win"'),
				card('cakephp &mdash; cream bands painted white<br>vscode-icons\' reading, not the mark',
					place(vcp.map(s => ({ d: s.d, fill: s.fill })), ENV.wide))
			];
			return page(
				'<h2>The five calls in tranche 1 that are judgements, measured</h2>'
				+ '<p>Every card is the real engine\'s fit at a true 16&nbsp;px. <b>cf</b>: Adobe '
				+ 'publishes a ColdFusion product icon and it is declined on a measurement — its '
				+ '#002258 field is <b>1.21:1</b> against the backdrop, so at 16&nbsp;px the plate '
				+ 'disappears and two pale letters are left floating, which is the typeset-letter '
				+ 'icon R1 abolished. <b>bruno</b>: the black keyline is the biggest path in the '
				+ 'file, measures 1.13:1, and is what put the icon over L8\'s 4&nbsp;KB hard cap. '
				+ '<b>buckbuild</b>: both Bucks read the same <code>.buckconfig</code>, and the '
				+ 'fidelity chain and the physics disagree &mdash; Buck&nbsp;2 publishes a vector '
				+ 'whose sustained ink runs are 0.22 / 0.38 / 0.88&nbsp;px and which is an orange hook at '
				+ 'this size, so Buck&nbsp;1\'s antler monogram (a 300&times;150 PNG, traced) '
				+ 'ships instead. <b>cake</b>: seven of nineteen official layers measure '
				+ '0.16&ndash;0.84&nbsp;px and are dropped; nothing is thickened. <b>cakephp</b>: '
				+ 'the cream bands are the mark\'s own negative space in every official version, '
				+ 'so they read dark here &mdash; painting them white is prettier and is not the '
				+ 'mark. Judge the 16&nbsp;px column.</p>', cards);
		}
	},
	{
		id: 'chess-piece-study',
		width: 1000, height: 520,
		html: (place) => {
			const g = (ds) => ds.map(d => ({ d, fill: NEUTRAL }));
			// the three rejected pieces, drawn to the same vocabulary discipline as the
			// shipped rook (max 2 sub-shapes, on the 16-grid, one gray, no scenes)
			const pawn = [
				'M10.5 4.1a2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1 5 0Z'
				+ 'M6.2 5.8h3.6q.28 1.03-.7 1.8l2.1 4.1H4.8l2.1-4.1q-.98-.77-.7-1.8Z',
				'M3.9 12.4h8.6q.6 0 .6.6v1.1q0 .6-.6.6H3.9q-.6 0-.6-.6v-1.1q0-.6.6-.6Z'
			];
			const king = [
				'M7.4 1.3h1.2q.3 0 .3.3v1h1q.3 0 .3.3v1.1q0 .3-.3.3h-1v1q0 .3-.3.3H7.4q-.3 0-.3-.3v-1'
				+ 'h-1q-.3 0-.3-.3V2.9q0-.3.3-.3h1v-1q0-.3.3-.3Z',
				'M5.4 6.2h5.2q1.1 0 1.6 1l.8 2q.4 1-.3 1.8l-1 1.1q-.5.7-1.4.7H5.7q-.9 0-1.4-.7l-1-1.1'
				+ 'q-.7-.8-.3-1.8l.8-2q.5-1 1.6-1Z'
			];
			const knight = [
				'M5.2 1.6 7 3h2.6q1.1 0 1.9 1l1.1 1.4q.5.7.5 1.6V12H3.9l.5-2.8L6.6 7l-1.6.4'
				+ 'q-1 .2-1.4-.7l-.2-.5q-.3-.7.2-1.2l1.6-1.6Z',
				'M3.3 12.7h9.4q.5 0 .5.5v1.2q0 .5-.5.5H3.3q-.5 0-.5-.5v-1.2q0-.5.5-.5Z'
			];
			const cards = [
				card('chess &mdash; SHIPPED, the rook<br>2.5 px teeth on 1.75 px notches',
					place(g(chessRook()), { w: 11.6, h: 13.4 }))
					.replace('class="c"', 'class="c win"'),
				card('the pawn<br>REJECTED: a circle over a cone',
					place(g(pawn), { w: 12.4, h: 13.2 })),
				card('the king<br>REJECTED: the cross breaks up',
					place(g(king), { w: 12.4, h: 12.2 })),
				card('the knight<br>REJECTED: a blob with a notch',
					place(g(knight), { w: 12.6, h: 13.4 }))
			];
			return page(
				'<h2>chess &mdash; which piece, decided at 16&nbsp;px</h2><p>No brand owns chess, '
				+ 'so <code>.pgn</code> and <code>.fen</code> take an OBJECT glyph, and the object '
				+ 'is a piece. Four were drawn to the same vocabulary discipline &mdash; at most '
				+ 'two sub-shapes, authored on the 16-grid, one gray, no scenes &mdash; and fitted '
				+ 'by the same engine. The <b>knight</b> is the piece most icon sets reach for and '
				+ 'it loses its muzzle and mane at this size; the <b>king</b>\'s cross is a '
				+ '1.3&nbsp;px bar over a 1.5&nbsp;px stem and breaks up; the <b>pawn</b> survives '
				+ 'but is a circle over a cone, the shape a map pin and a person glyph also make. '
				+ 'The <b>rook</b>\'s identifying feature is its battlements, and they are '
				+ '2.5&nbsp;px teeth separated by 1.75&nbsp;px notches &mdash; the only candidate '
				+ 'whose distinguishing detail clears L5 by construction.</p>', cards);
		}
	},
	// ---- ADDED BY THE FIX ROUND (2026-09-03) ------------------------------------
	// The ruling replaced a decline with a construction, and a construction has
	// numbers in it. Every card here is the real engine's fit at a true 16 px: what
	// the gate shipped, what flag 1 measured, Adobe's frame at Adobe's own ratio,
	// the one denominator that was tried and failed, and what ships.
	{
		id: 'coldfusion-frame-study',
		width: 1180, height: 640,
		html: (place) => {
			const plate = rectShapes(CF_ART)[0];
			const mn = officialShapes(CF_ART);
			const ink = mn[0].fill;
			const framedAt = (ratio) => {
				const f = plate.w * ratio;
				const outer = roundRect(plate.x, plate.y, plate.w, plate.h, plate.r, true);
				return [
					{ d: outer, fill: plate.fill },
					{ d: outer + roundRect(plate.x + f, plate.y + f, plate.w - 2 * f,
						plate.h - 2 * f, plate.r * CF_INNER_R, false), fill: ink },
					...mn.map(s => ({ d: s.d, fill: ink }))
				];
			};
			const bare = [
				{ d: roundRect(plate.x, plate.y, plate.w, plate.h, plate.r, true), fill: plate.fill },
				...mn.map(s => ({ d: s.d, fill: ink }))
			];
			const as = a01Spec('actionscript');
			const scale = ENV.compact.w / plate.w;          // the fit the plate lands on
			const px = (ratio) => (plate.w * ratio * scale).toFixed(2);
			const cards = [
				card('cf &mdash; SHIPPED<br>Adobe\'s frame at w/10 = 1.28&nbsp;px',
					place(framedAt(CF_FRAME), ENV.compact))
					.replace('class="c"', 'class="c win"'),
				card(`cf &mdash; Adobe's frame VERBATIM, w/24<br>REJECTED: ${px(CF_FRAME_ADOBE)}&nbsp;px, `
					+ 'a halo not a frame', place(framedAt(CF_FRAME_ADOBE), ENV.compact)),
				card(`cf &mdash; w/11<br>REJECTED: ${px(1 / 11)}&nbsp;px, under L5's floor`,
					place(framedAt(1 / 11), ENV.compact)),
				card('cf &mdash; the BARE plate flag 1 measured<br>the field is 1.21:1 &mdash; '
					+ 'not there at 16&nbsp;px', place(bare, ENV.compact)),
				card('cf &mdash; WAS: Adobe\'s corporate A<br>what the gate shipped (A01\'s '
					+ 'actionscript)', place(as.parts(), as.env))
			];
			return page(
				'<h2>cf / cfc / cfm &mdash; the ruling, and the one number the rider had to '
				+ 'move</h2><p>Sebastian at the A02 gate, overturning flag&nbsp;1: <i>"In those '
				+ 'cases you can use a background in a frame with their corners rounded (like in '
				+ 'previous iterations)"</i> &mdash; and, asked which frame, <i>"Adobe\'s own '
				+ 'framed icon."</i> Adobe publishes one: '
				+ '<code>coldfusion-framed-official.svg</code>, served from adobe.com\'s '
				+ 'product-icon directory and carrying Adobe\'s own filename '
				+ '<code>cf_builder_2016_appicon.svg</code> &mdash; a bright ring around a dark '
				+ 'field with the Cf on top, built as an outer rectangle with a counter-wound '
				+ 'inner one, which is exactly how L8 forces this set to build a frame. Adobe\'s '
				+ 'ring is <b>10.7/256</b> of the width there and <b>10/240 = w/24</b> exactly on '
				+ 'the FrameMaker and RoboHelp icons Adobe serves beside it. <b>On the 56-wide '
				+ 'ColdFusion plate that is 0.53&nbsp;px</b>, five times under L5\'s '
				+ '1.2&nbsp;px official-forced floor &mdash; card two is what that looks like. The '
				+ 'prettier rider thickens the ONE element that carries the silhouette, inside '
				+ 'Adobe\'s own way of specifying it: the denominator moves 24&nbsp;&rarr;&nbsp;10. '
				+ 'Card three is w/11, the one that was tried first and lands at 1.16&nbsp;px, '
				+ 'which is why w/10 is the SMALLEST legal departure from Adobe\'s proportion and '
				+ 'not a chosen weight. Everything else is Adobe\'s: the plate, its '
				+ '9.9138/56 corner radius, the two letter paths, and all three colours. Judge '
				+ 'the 16&nbsp;px column.</p>', cards);
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
		title: 'cf / cfc / cfm — Adobe publishes a ColdFusion mark and this build declines it',
		rule: 'working rule 1 / L5 / L6',
		superseded: 'OVERTURNED by the A02 gate ruling (2026-09-03). Sebastian: "In those cases '
			+ 'you can use a background in a frame with their corners rounded (like in previous '
			+ 'iterations)" — and, on which frame, "Adobe\'s own framed icon". The 1.21:1 '
			+ 'measurement below still stands and is still the reason the BARE plate could not '
			+ 'ship; what the ruling changed is that a field which cannot clear the backdrop no '
			+ 'longer ends the hunt, because the brand\'s own FRAMED construction puts a '
			+ 'silhouette around it. All three now ship Adobe\'s framed ColdFusion icon; see '
			+ 'flag 52. Kept in place because the hunt and the measurement it records are still '
			+ 'the hunt and the measurement.',
		subjects: ['cf', 'cfc', 'cfm'],
		text: 'The flag to argue with if any of them is. <code>.cfm</code> and <code>.cfc</code> '
			+ 'are Adobe ColdFusion files, and unlike A01\'s actionscript — which never had a mark '
			+ 'of its own — ColdFusion HAS one: the 2021 product icon, a #002258 rounded square '
			+ 'carrying a pale-blue "Cf". It is fetched, built and rendered in '
			+ '<code>proofs/A02-t1-study.png</code>, and it is declined on a MEASUREMENT rather '
			+ 'than on the A01 reading that a letter plate is a monogram in a box. <b>The '
			+ 'number:</b> that navy field measures <b>1.21:1</b> against #121314 — below even '
			+ 'bicep\'s 2.04:1, which the pilot rejected — so on the product backdrop the plate '
			+ 'is not there. What arrives at 16&nbsp;px is two pale-blue letters floating in '
			+ 'space, which is exactly the typeset-letter icon R1 abolished, and lifting the '
			+ 'field to clear the bar would invent a colour Adobe does not print. So all three '
			+ 'ship Adobe\'s corporate red A, byte-identical to A01\'s actionscript and '
			+ 'adobe-swc. <b>What that costs in the tree:</b> five ids — .as, .swc, .cfm, .cfc, '
			+ '.cfml — now look the same. That is rule 1(b) working as written, and the '
			+ 'alternative is a plate you cannot see. <b>To overturn:</b> say the Cf plate ships '
			+ 'and it does, with its field lifted or with the letters alone.'
	},
	{
		title: 'c-al takes Microsoft\'s AL mark, not the Dynamics 365 sail',
		rule: 'working rule 1',
		subjects: ['c-al'],
		text: 'A <code>.cal</code> is a C/AL source file — Client/server Application Language, '
			+ 'the language of Dynamics NAV and the direct ancestor of AL, which A01 already '
			+ 'ships with Microsoft\'s own #2EA98E lockup. Rule 1 asks branch (a) first, and '
			+ 'there IS an established variant glyph here: vscode-icons draws the <b>Microsoft '
			+ 'Dynamics 365 sail</b> for c-al. It is declined because that sail is the mark of '
			+ 'the whole product suite — Sales, Finance, Supply Chain, Business Central and the '
			+ 'rest — rather than anything to do with C/AL; using it puts a corporate suite mark '
			+ 'on a language file, one step further out than the company-mark rider reaches, and '
			+ 'it would also be the only Dynamics-marked icon in the set. Microsoft itself ships '
			+ 'ONE mark for this language family and registers it against the <code>al</code> '
			+ 'language id. So branch (b): c-al is byte-identical to '
			+ '<code>slices/A01/masters/al.svg</code>, and the slice check asserts that rather '
			+ 'than trusting it. In the tree an <code>.al</code> and a <code>.cal</code> will look '
			+ 'the same. <b>To overturn:</b> rule that the Dynamics sail may stand for C/AL and '
			+ 'it becomes a one-source hunt.'
	},
	{
		title: 'cds wears SAP\'s mark — the company-mark rider, used for the second time',
		rule: 'L2 / working rule 1',
		subjects: ['cds'],
		text: 'A <code>.cds</code> is a Core Data Services model in SAP\'s Cloud Application '
			+ 'Programming model, and the language ids the roster records '
			+ '(<code>cds</code>, <code>cds-markdown-injection</code>) are the SAP CDS '
			+ 'extension\'s. The company-mark rider ratified at the A01 gate — a format created '
			+ 'and owned by a company may wear that company\'s mark — therefore fires exactly as '
			+ 'it did for abap, and cds ships the SAP parallelogram byte-identically. <b>Worth '
			+ 'knowing before you agree:</b> this is the second SAP-marked icon in the set, so '
			+ 'an <code>.abap</code> and a <code>.cds</code> are now the same picture, and CDS is '
			+ 'a little further from SAP than ABAP is — ABAP exists nowhere but inside a SAP '
			+ 'system, while <code>.cds</code> files are written by anyone using the (Apache-2.0, '
			+ 'npm-published) CAP toolchain. It is still SAP\'s language and SAP\'s specification. '
			+ 'Material\'s alternative is a cloud with an arrow through it, which is a metaphor '
			+ 'for "cloud platform" and not a mark.'
	},
	{
		title: 'chef — Chef\'s own arc mark, not the Progress corporate symbol chef.io serves',
		rule: 'L2 sourcing',
		subjects: ['chef', 'chef-cookbook'],
		text: 'The hunt turned up two marks and they are not the same brand. <b>What chef.io '
			+ 'serves today</b> is <code>progress-chef-primary-logo-svg.svg</code>: the PROGRESS '
			+ 'corporate symbol — Progress acquired Chef in 2020 — beside a "Progress Chef" '
			+ 'wordmark. <b>What ships</b> is Chef\'s own arc "C", the concentric orange-and-slate '
			+ 'ring the project used through 2020, which gilbarbara/logos carries as a vector in '
			+ 'both official colours and which simple-icons, vscode-icons and Material all still '
			+ 'draw. The reasoning is the mirror image of the cds flag: putting the PARENT '
			+ 'COMPANY\'s symbol on a Berksfile would be a corporate mark standing in for a '
			+ 'product that has its own, where the rider only covers a company standing in for a '
			+ 'format it owns. <b>The honest caveat:</b> Chef\'s arc mark is retired branding. If '
			+ 'you would rather the set follow the current owner, the Progress symbol is one '
			+ 'fetch away.'
	},
	{
		title: 'chef — thirteen arc segments, and why none of them is deleted',
		rule: 'L5 / prettier rider',
		subjects: ['chef', 'chef-cookbook'],
		text: 'Chef\'s mark is a "C" built from thirteen concentric arc segments, which is far '
			+ 'past L5\'s "about three distinguishable sub-shapes". It ships whole anyway, and '
			+ 'here is the working. They are not thirteen sub-shapes: they are ONE ring, and at '
			+ 'the compact envelope the segments span 1.54&times;2.58&nbsp;px at the smallest '
			+ 'and 10.88&times;5.60 at the largest, with the mark\'s sustained ink runs at '
			+ '<b>0.53&nbsp;px at the 5th percentile, 1.09 at the 25th and 1.22 at the '
			+ 'median</b> — three times jar\'s 0.38, which A01 rejected, and still under the '
			+ '1.2&nbsp;px official-forced floor at the quartile. Every '
			+ 'reduction that would buy thicker ink deletes rings, and a Chef mark with its rings '
			+ 'deleted is a plain letter C, which is the gestalt failure the pilot ruling names '
			+ '(docker\'s deck, editorconfig\'s linework). <b>The 16&nbsp;px verdict is marginal '
			+ 'and says so:</b> what arrives is an orange-and-slate target, not a legible set of '
			+ 'concentric arcs. <b>Colour:</b> the #435363 slate measures 2.35:1 against #121314 '
			+ '— under the 3.0:1 lift trigger — and is deliberately NOT lifted: it is the second '
			+ 'tone of a two-tone mark whose primary is #F38B00 at 7.53:1, and lifting it to '
			+ 'L&nbsp;88 (#DBE0E6) would make Chef\'s slate the palest thing in the icon.'
	},
	{
		title: 'bucklescript ships ReScript\'s mark — a SUCCESSOR-BRAND call, not a company one',
		rule: 'L2 sourcing',
		subjects: ['bucklescript'],
		text: 'A new shape of call, so it is flagged rather than assumed. <code>bsconfig.json</code>, '
			+ '<code>.bsb.lock</code> and <code>.cmj</code> are BuckleScript\'s file names, and '
			+ 'BuckleScript no longer exists as a brand: it renamed itself ReScript in August '
			+ '2020 — the same repository, now <code>rescript-lang/rescript-compiler</code> — and '
			+ '<code>bucklescript.github.io</code> today serves one meta-refresh to '
			+ 'rescript-lang.org and nothing else. <code>bsconfig.json</code> stayed ReScript\'s '
			+ 'own config file name until v11 renamed it. <b>The hunt:</b> BuckleScript\'s own '
			+ 'mark could not be found at all — the redirect leaves nothing behind, '
			+ '<code>BuckleScript/bucklescript.github.io</code> keeps no branding directory, and '
			+ 'neither simple-icons nor gilbarbara/logos has ever carried a bucklescript entry. '
			+ 'Material draws a teal "BS" plate, which is its own monogram. <b>So the successor\'s '
			+ 'own brand file ships</b>, which is a RENAME rather than a company standing in for '
			+ 'a format — closer to al/al-dal than to safetensors. <b>One consequence to note:</b> '
			+ 'when a later slice reaches <code>rescript</code>, the two ids will want the same '
			+ 'mark and will have to be declared a family across slices.'
	},
	{
		title: 'cabal ships a five-pointed star, which is the whole of Cabal\'s symbol',
		rule: 'L2 / R8',
		subjects: ['cabal'],
		text: 'Not a legibility flag — an IDENTITY one. haskell/cabal-website publishes '
			+ '<code>images/Cabal.svg</code>, and the mark in it is one star plus the "Cabal" '
			+ 'logotype; drop the logotype, as every icon in this set does, and what is left is a '
			+ 'plain five-pointed star. It reads perfectly at 16&nbsp;px (9.42&times;12.40&nbsp;px of '
			+ 'ink, runs 1.81&nbsp;px at the 25th percentile and 5.47 at the median) and it is '
			+ 'the most generic shape any subject '
			+ 'in this tranche ships — nothing about it says Haskell, or build tool, or Cabal. '
			+ 'It is nonetheless the brand\'s own symbol, and inventing something more '
			+ 'distinctive is exactly what L2 forbids. <b>Colour:</b> the file carries the lockup '
			+ 'twice, once for light grounds and once for dark; the dark-ground copy\'s star is '
			+ '#567DD9 (4.72:1) and the light-ground copy\'s is #2E5BC1, which measures 3.00:1 '
			+ 'and still trips the lift by a hair, so the dark-ground copy ships. <b>The '
			+ 'alternative</b> is Haskell\'s own '
			+ 'lambda for Cabal\'s files, which would be a language\'s mark on its build tool — '
			+ 'the cds rider stretched further than it has been stretched so far.'
	},
	{
		title: 'buckbuild — the brand tier was sourced and then declined on L5',
		rule: 'L2 sourcing / L5',
		subjects: ['buckbuild'],
		text: 'The only subject in this tranche where the fidelity chain and the physics disagree, '
			+ 'so it is written out in full. <code>.buckconfig</code>, '
			+ '<code>.buckjavaargs</code> and <code>BUCK</code> are read by BOTH generations of '
			+ 'Meta\'s build system, and the two generations draw different marks. '
			+ '<b>Buck&nbsp;2</b> (facebook/buck2, current) publishes a real vector at '
			+ '<code>website/static/img/logo.svg</code>: a leaping deer in an '
			+ '#AF4F39&nbsp;&rarr;&nbsp;#F69635 gradient. <b>Buck&nbsp;1</b> (facebook/buck, '
			+ 'archived) draws an antler monogram and publishes it as '
			+ '<code>docs/static/logo.png</code>, a 300&times;150 raster that vscode-icons and '
			+ 'Material both trace. The chain says Buck&nbsp;2 and L5 overrules it, measured at a '
			+ 'true 16&nbsp;px rather than argued: <b>the deer\'s sustained ink runs are 0.22&nbsp;px '
			+ 'at the 5th percentile, 0.38 at the 25th and 0.88 at the median</b> — jar\'s '
			+ 'numbers, which A01 rejected on L5 alone — and opening its envelope to '
			+ '13.6&times;14.4 moves them only to 0.25 / 0.41 / 0.94. At 16&nbsp;px it is an '
			+ 'orange hook with a fork on top. The antler monogram runs '
			+ '<b>0.50 / 0.97 / 1.25&nbsp;px</b> at the same three percentiles and every tine '
			+ 'survives, because its strokes are axis-aligned or at 45&deg; and land on pixel '
			+ 'edges. <b>The honest limit:</b> 1.25&nbsp;px at the median is still under L5\'s '
			+ '1.5&nbsp;px floor — this is the better of two sub-floor marks, not a comfortable '
			+ 'one. All three renders are in '
			+ '<code>proofs/A02-t1-study.png</code>. <b>What this costs, and it is the reason to '
			+ 'flag it:</b> the set now carries the RETIRED generation\'s mark for a file the '
			+ 'current one also reads. <b>To overturn:</b> rule that the current brand\'s vector '
			+ 'ships whatever it looks like at 16&nbsp;px, and the deer goes back in one edit.'
	},
	{
		title: 'bruno drops the black keyline that Bruno\'s dog is drawn with',
		rule: 'L8 / L5',
		subjects: ['bruno'],
		text: 'Bruno\'s mark is a golden retriever\'s head drawn with a heavy black keyline, and '
			+ 'the keyline is dropped. Two reasons, both measured. <b>Bytes:</b> it is the biggest '
			+ 'path in the source — 3037 characters of 6.5&nbsp;KB — and keeping it puts the icon '
			+ 'over L8\'s <b>4&nbsp;KB hard cap</b>, which is a fail and not an advisory. '
			+ '<b>Contrast:</b> it measures <b>1.13:1</b> against #121314, so on the product '
			+ 'backdrop it paints nothing a reader can see; the safetensors precedent (finger '
			+ 'seams, same two reasons at once) is the shape of this call. What it costs is that '
			+ 'the head keeps its full outer contour instead of being trimmed by an invisible '
			+ 'line, which makes the dog very slightly larger than the official drawing. The eyes, '
			+ 'the nose and the muzzle line stay black — they print on the mark\'s own golden '
			+ 'field, where the pilot\'s dotenv erratum says ink is never lifted, and they are '
			+ 'what makes the shape a dog. <b>Sourcing note:</b> usebruno/bruno publishes PNG '
			+ 'only and simple-icons\' <code>bruno</code> is a monochrome OUTLINE, so the geometry '
			+ 'is vscode-icons\' full-colour vector — R1 keeps multi-colour marks multi-colour.'
	},
	{
		title: 'cakephp\'s cream bands are negative space, so they read dark',
		rule: 'R1 / L5',
		subjects: ['cakephp'],
		text: 'CakePHP\'s mark is a three-tier cake, and the cream between the tiers is not ink: '
			+ 'in every official version — the red one on a white page and the white one on '
			+ 'cakephp.org\'s dark pages alike — the bands are the ground showing through. So they '
			+ 'stay negative space here and read dark, and the cake arrives at 16&nbsp;px as three '
			+ 'red tiers rather than as red-and-cream. This is NOT the gpg move: there the '
			+ 'official logo genuinely prints the GNU\'s mane white over the blue lock, so there '
			+ 'was white ink to restore. <b>What the alternative looks like:</b> vscode-icons '
			+ 'paints the bands white explicitly, which is a prettier icon at this size and is not '
			+ 'the mark; both are side by side in <code>proofs/A02-t1-study.png</code>. '
			+ '<b>Sourcing:</b> the fetched file is CakePHP\'s WHITE lockup (the one it uses on '
			+ 'dark pages); the three cake layers ship in the brand\'s published red #D33C43, '
			+ 'which is the npm/git/go colour rule.'
	},
	{
		title: 'cairo is Starknet\'s language, not the graphics library — and its runner is a hole',
		rule: 'L2 / R1',
		subjects: ['cairo'],
		text: 'Two things worth checking. <b>Which Cairo:</b> the roster\'s <code>.cairo</code> / '
			+ 'languageId <code>cairo</code> is StarkWare\'s provable-computation language, not '
			+ 'the cairo graphics library — simple-icons\' <code>cairographics</code> is the '
			+ 'library\'s mark and using it here would put the wrong project\'s logo on the file '
			+ 'type. Starknet publishes the Cairo mark as raster everywhere '
			+ '(<code>cairo-logo-square.png</code>, <code>Cairo_logo_500x500.png</code>, PNG '
			+ 'favicons on cairo-lang.org), so the geometry is vscode-icons\' vector of it. '
			+ '<b>The runner:</b> the mark is one red contour with the running figure cut OUT of '
			+ 'the disc and open to the outside at the lower left. There is no white ink in it — '
			+ 'the runner is white on a white page because the page is white — and there is no '
			+ 'closed contour to repaint, so on #121314 the figure reads dark. That is what the '
			+ 'mark does on any dark ground, including Starknet\'s own dark lockups, but it does '
			+ 'mean the icon arrives as a red disc with a dark bite rather than as a red disc '
			+ 'with a white runner.'
	},
	{
		title: 'caddy\'s ring is a three-stop gradient and neither end of it can ship',
		rule: 'L2 / L6',
		subjects: ['caddy'],
		text: 'A flattening decision that is not the chrome default, so here is the arithmetic. '
			+ 'Caddy paints its ring with a three-stop linear gradient: rgb(35,217,59) green &rarr; '
			+ 'rgb(119,196,247) pale blue &rarr; rgb(0,89,209) deep blue. L2\'s "dominant flat '
			+ 'stop" is normally offset&nbsp;1 (the chrome ruling), and here <b>offset&nbsp;1 '
			+ 'measures 2.97:1</b> against #121314 — three hundredths under the 3.0:1 lift trigger, '
			+ 'so taking it would immediately lift Caddy\'s blue to L&nbsp;88 and repaint the mark '
			+ 'pale. <b>Offset&nbsp;0</b> is the same green as the shed inside the ring, so taking '
			+ 'it would flatten the whole symbol to one colour. What ships is <b>#1F88C0</b>, the '
			+ 'flat Caddy blue simple-icons records for the brand: it sits inside the ramp and '
			+ 'measures 4.73:1. brand-colors.json has no caddy entry, so this is the abap '
			+ 'precedent — simple-icons\' hex stands where the source of truth is silent. '
			+ '<b>One more number, recorded because it is under the floor:</b> the ring\'s wall '
			+ 'is 1.07&nbsp;px at this envelope (outer 12.80, counter 10.65) and the mark\'s '
			+ 'runs are 0.84&nbsp;px at the 25th percentile. That is the chrome situation — '
			+ 'official detail kept at official proportions, because thickening the ring means '
			+ 'shrinking Caddy\'s shed inside it.'
	},
	{
		title: 'c3\'s gradient is flattened per letter rather than for the whole mark',
		rule: 'L2',
		subjects: ['c3'],
		text: 'c3-lang.org draws the "C3" logotype as ONE path with a horizontal '
			+ '#2563EB&nbsp;&rarr;&nbsp;#7C3AED gradient across it, which means the C sits in the '
			+ 'blue end and the 3 in the violet end. Flattening the whole mark to one stop is the '
			+ 'letter of the chrome ruling and would throw away half of what the mark looks like, '
			+ 'so it is flattened <b>per subpath</b> instead: the C takes offset&nbsp;0, the 3 '
			+ 'takes offset&nbsp;1. No geometry moves and the two hexes are the brand\'s own. '
			+ '<b>Letters:</b> this is a faithful logotype from the brand\'s own file, so L3\'s '
			+ 'typeset-letter ban does not reach it — the abap / al / typescript reading. Its '
			+ 'sustained ink runs are 1.72&nbsp;px at the 25th percentile and 2.00 at the '
			+ 'median, thicker than abap\'s SAP letters which the A01 gate passed at '
			+ '1.00&ndash;1.25&nbsp;px.'
	},
	{
		title: 'circom\'s bar takes the LIGHT end of its gradient, against the chrome default',
		rule: 'L2 / L6',
		subjects: ['circom'],
		text: 'circom\'s symbol is achromatic — a white C-ring with a bar driven through it — and '
			+ 'the bar is painted with a #C6C6C6&nbsp;&rarr;&nbsp;#4E4E4E gradient. The '
			+ 'offset&nbsp;1 stop the chrome ruling would take measures <b>2.24:1</b> against '
			+ '#121314, which trips the 3.0:1 lift trigger; and lifting an ACHROMATIC ink lands it '
			+ 'at L&nbsp;88 = #E0E0E0, which is the white ring the bar exists to contrast with — '
			+ 'the lift would erase the mark\'s only tonal difference. So the bar takes '
			+ 'offset&nbsp;0, #C6C6C6 at 10.89:1, and the mark stays two-tone. Recorded because it '
			+ 'is the second flattening in this tranche that does not take offset&nbsp;1, and both '
			+ 'are for the same reason: the lift trigger and the gradient ends disagree.'
	},
	{
		title: 'RULE 2 in practice — one object glyph and four brackets, the smallest collapse yet',
		rule: 'working rule 2',
		subjects: ['chess', 'brainfuck', 'capnp', 'cbx', 'cddl'],
		text: 'Five of the twenty-eight own no usable mark, which is 18% against A01 tranche 2\'s '
			+ '37% — the D22 amendment is why, and this tranche is the first built entirely under '
			+ 'it. <b>chess</b> gets an OBJECT glyph, a new one: no brand owns chess (<code>.pgn</code> '
			+ 'is a 1994 community standard, <code>.fen</code> is from a newspaper column), so it '
			+ 'takes a piece, and which piece was decided by measurement in '
			+ '<code>proofs/chess-piece-study.png</code>. <b>Four take the bracket glyph</b>, and '
			+ 'only ONE of them is a mark that exists and cannot ship: <code>capnp</code>, whose '
			+ 'logo is an eleven-letter Victorian wordmark published as a 635&times;356 PNG with no '
			+ 'symbol anywhere in the project — and tracing a raster is the FIDELITY rule the '
			+ 'amendment does not reach, which ends it before the legibility question is. The other three '
			+ 'own no mark at all: <code>brainfuck</code> is a 1993 esolang with no project, '
			+ '<code>cddl</code> is IETF RFC&nbsp;8610, and <code>cbx</code> is a BibLaTeX citation '
			+ 'style. All four payloads are byte-identical to A01\'s thirteen and the slice check '
			+ 'asserts that across the slice boundary.'
	},
	{
		title: 'bosque, bruno, cairo, cangjie, casc, ceylon and chef ship from third-party vectors',
		rule: 'L2 sourcing',
		subjects: ['bosque', 'bruno', 'cairo', 'cangjie', 'casc', 'ceylon', 'chef'],
		text: 'L2 asks for the brand\'s own vector first and the hunt is recorded rather than '
			+ 'assumed. Six came up empty, each for a different reason (chef is a seventh and has '
			+ 'its own flag: the vector chef.io serves is the Progress corporate mark). '
			+ '<b>bosque:</b> every file '
			+ 'in microsoft/BosqueLanguage\'s <code>resources/brand/</code> tree whose name ends '
			+ 'in .svg is a PNG in an <code>&lt;image&gt;</code> wrapper — the Fluent icon is '
			+ '248&nbsp;KB of base64 at 4096&nbsp;px, the combined lockup 697&nbsp;KB. '
			+ '<b>bruno:</b> usebruno/bruno ships <code>logo.png</code> and no vector, and '
			+ 'simple-icons\' entry is a monochrome outline. <b>cairo:</b> starkware-libs/cairo, '
			+ 'cairo-book and cairo-lang.org publish PNG only. <b>cangjie:</b> cangjie-lang.cn '
			+ 'serves its logo from a CDN as a PNG. <b>casc:</b> CASC-Lang\'s only artwork is '
			+ '<code>CASC-Vscode/icon.png</code>. <b>ceylon:</b> the project is archived and its '
			+ 'site tree holds <code>ceylon-logo.png</code> only. All six ship from a faithful '
			+ 'vector of the same drawing — four from vscode-icons, one from gilbarbara/logos — '
			+ 'which is the A01 antlr precedent, and every one was checked against the official '
			+ 'raster before it was used.'
	},
	{
		title: 'casc is a JVM language, not Blizzard\'s archive format',
		rule: 'L2 / roster reading',
		subjects: ['casc'],
		text: 'Recorded because the acronym is genuinely ambiguous and the wrong reading would '
			+ 'have put a game publisher\'s mark on a source file. "CASC" is best known as '
			+ 'Blizzard\'s Content Addressable Storage Container, a binary game-data archive. The '
			+ 'roster\'s <code>casc</code> is not that: it is <b>CASC-Lang/CASC</b>, a JVM '
			+ 'language, and the evidence is vscode-icons\' own icon request (issue #2688), which '
			+ 'names the language, links its marketplace extension '
			+ '(<code>ChAoS-UnItY.casc-lang</code>) and attaches the aperture logo this icon is '
			+ 'built from. <b>The reduction:</b> the mark sets "CA SC" in white across the '
			+ 'aperture\'s black centre, and at the shipped fit each of those four letters lands in '
			+ 'a 1.82&times;2.54&nbsp;px box — strokes at a fraction of a pixel — so they are '
			+ 'dropped; the black field goes with them, because the source leaves it unfilled '
			+ '(black measures 1.13:1 against #121314) and it paints nothing a reader can see. '
			+ 'What ships is '
			+ 'the eight-bladed aperture, which is what the mark is.'
	},
	{
		title: 'cake and bower keep dark contour tones that the backdrop swallows',
		rule: 'L5 contrast duty',
		subjects: ['cake', 'bower', 'bosque'],
		text: 'Three marks in this tranche carry a tone under the 3.0:1 lift trigger, and none of '
			+ 'them is lifted. The measurements: <b>cake</b>\'s #4A1700 outline at 1.25:1, '
			+ '<b>bower</b>\'s #543729 keyline at 1.73:1, <b>bosque</b>\'s two darkest back '
			+ 'tiles at 2.43:1 and 2.93:1. In all three the tone is a CONTOUR or a SHADE inside a '
			+ 'multi-colour drawing, not the mark\'s ink: it prints against the mark\'s own bright '
			+ 'fills for most of its length, and lifting it to L&nbsp;88 would put the palest '
			+ 'colour of the icon on its outermost edge and invert the drawing\'s tonal order. The '
			+ 'lift is opt-in per subject exactly so this can be declined, and the pilot\'s dotenv '
			+ 'erratum is the same reading from the other side. <b>What it costs at 16&nbsp;px:</b> '
			+ 'all three read by their bright fills rather than by their outlines — the cake by '
			+ 'its sponge and icing, the bird by its head and wing, the Bosque tiles by the front '
			+ 'one. That is what these marks do on any dark ground.'
	}
];

// =============================================================================
// FIX-ROUND FLAGS — numbered AFTER every tranche's FLAGS, so 1-51 keep the numbers
// the A02 gate was decided on. A02.mjs appends the tranches' FIX_FLAGS in module
// order, and this tranche is the only one the ruling moved, which puts these at
// 52-53.
// =============================================================================

export const FIX_FLAGS = [
	{
		title: 'THE RULING — a mark whose FIELD cannot clear the backdrop may ship the brand\'s '
			+ 'own FRAME',
		rule: 'guide §5 lift/plate erratum, amended / L5 contrast duty',
		ruling: true,
		subjects: ['cf', 'cfc', 'cfm'],
		text: 'Recorded first because it is a law and not a subject. Flag&nbsp;1 declined Adobe\'s '
			+ 'ColdFusion plate on a measurement — its #002258 field is <b>1.21:1</b> against '
			+ '#121314, so at 16&nbsp;px the plate is not there and two pale letters are left '
			+ 'floating. Sebastian overturned it with a directive: <i>"In those cases you can use '
			+ 'a background in a frame with their corners rounded (like in previous '
			+ 'iterations)"</i>, and, asked which frame, picked the brand\'s own — <i>"Adobe\'s '
			+ 'own framed icon &mdash; fetch Adobe\'s actual ColdFusion product icon: bright '
			+ 'rounded frame + dark field + Cf letters, colors verbatim."</i> <b>What that binds, '
			+ 'set-wide:</b> where a brand publishes a FRAMED construction, a mark whose own field '
			+ 'cannot clear the backdrop may ship it. The frame carries the silhouette; the dark '
			+ 'field inside it is then <em>mark-interior ink</em>, which the §5 erratum already '
			+ 'says is never lifted (dotenv\'s black on its yellow field is the same reading). So '
			+ 'the trigger for a dark plate is no longer "lift it or drop it" — it is "does the '
			+ 'brand draw a frame?" <b>What it does NOT change:</b> the frame has to be the '
			+ 'BRAND\'s, derived from the brand\'s own artwork like any other geometry (L2), and '
			+ 'it still has to clear L5 at 16&nbsp;px — an invented keyline, or one too thin to '
			+ 'see, is not a construction, it is a decoration. <b>Scale:</b> three subjects in '
			+ 'this slice. cf, cfc and cfm are the only ones the trigger reaches; every other '
			+ 'plate in A02 already clears the backdrop on its own field.'
	},
	{
		title: 'cf / cfc / cfm — Adobe\'s framed ColdFusion icon, and the one number the rider '
			+ 'moved',
		rule: 'L2 sourcing (ruled) / L8 / L5 prettier rider',
		subjects: ['cf', 'cfc', 'cfm'],
		text: '<b>Provenance first, because the frame is Adobe\'s and not ours.</b> Adobe '
			+ 'publishes the ColdFusion mark twice and this build reads both, both fetched and '
			+ 'both in the provenance pane. (1) <code>coldfusion-official.svg</code>, the 2021 '
			+ 'logo, "Outline no shadow": a 56&times;54 #002258 rounded rect at rx/ry '
			+ '<b>9.9138</b> under a #7BADFF "Cf" in two paths — the plate, the corner radius, '
			+ 'the letters and every colour. (2) <code>coldfusion-framed-official.svg</code>, '
			+ 'Adobe\'s OWN framed ColdFusion product icon, fetched from adobe.com\'s product-icon '
			+ 'directory and still carrying Adobe\'s internal filename '
			+ '<code>cf_builder_2016_appicon.svg</code> in its id: 256&times;249.6, a #CADBFE ring '
			+ 'inset <b>10.7</b> around a #000F34 field. <b>The frame constant, measured on four '
			+ 'Adobe files rather than guessed:</b> 10.7/256 = 4.18% here, and exactly 10/240 = '
			+ '<b>w/24</b> on FrameMaker and RoboHelp, the two siblings Adobe serves from the same '
			+ 'directory in the same generation, and on Adobe\'s rounded framed cut as well. '
			+ '<b>The corners.</b> Adobe\'s framed ColdFusion is SQUARE-cornered and the ruling '
			+ 'asked for rounded, so the rounding comes from Adobe too: '
			+ '<code>photoshop-ipad-official.svg</code> is a 240&times;234 outer rect at r 42.5 '
			+ 'around a 220&times;214 field at r 36.3, and 42.5/240&nbsp;=&nbsp;0.17708 is '
			+ 'ColdFusion\'s own plate radius (9.9138/56&nbsp;=&nbsp;0.17703) to five decimals — '
			+ 'the same rounded rectangle at two scales. So the outer radius is ColdFusion\'s own '
			+ 'and the ONLY number borrowed from a sibling is the inner ratio, 36.3/42.5 = '
			+ '<b>0.8541</b>. <b>The one thing that had to change, and it is the flag to argue '
			+ 'with.</b> Adobe\'s w/24 frame is 2.33 units on the 56-wide plate, which is '
			+ '<b>0.53&nbsp;px</b> at the shipped fit — five times under L5\'s 1.2&nbsp;px '
			+ 'official-forced floor, and rendered in '
			+ '<code>proofs/coldfusion-frame-study.png</code> it is a halo, not a frame. The '
			+ 'prettier rider thickens the one element that carries the silhouette, and it is '
			+ 'thickened inside Adobe\'s own way of specifying it: the frame stays a fraction of '
			+ 'the plate width and the denominator moves <b>24&nbsp;&rarr;&nbsp;10</b>, giving '
			+ '5.6 units = <b>1.28&nbsp;px</b>. w/11 was measured first and lands at '
			+ '1.16&nbsp;px, under the floor, so w/10 is the SMALLEST legal departure from '
			+ 'Adobe\'s proportion rather than a weight somebody liked. <b>L8:</b> the frame is a '
			+ 'filled RING, never a stroke — an outer contour with an inner one wound against it, '
			+ 'punched by plain nonzero fill, which is how Adobe draws it too (it declares '
			+ 'fill-rule:evenodd; this set emits none, so the winding does the work). A01\'s vsix '
			+ 'flag records what happens when two subpaths are wound the same way and the counter '
			+ 'never opens; that was checked for here. <b>What it costs at 16&nbsp;px:</b> the '
			+ 'frame reads and the letters are marginal — the "Cf" is 7.10&times;6.18&nbsp;px at '
			+ 'sustained ink runs of 0.97 / 1.06 / <b>1.19&nbsp;px</b>, so it arrives as an open '
			+ 'arc beside a crossed stem rather than as crisp letterforms. That is Adobe\'s own '
			+ 'drawing at this size, and thickening it would be redrawing a brand\'s letterforms, '
			+ 'which L2 hard-rejects. <b>To overturn:</b> say the frame should be heavier and the '
			+ 'denominator moves again — the study renders w/24, w/11 and w/10 side by side so '
			+ 'the trade is visible rather than argued.'
	}
];

/**
 * FIX ROUND (2026-09-03) — what this tranche rebuilt under the ruling, for the
 * slice's own fix_round record and the sheet's before/after strip. Nothing was
 * re-hunted and left standing: the ruling reached exactly one call in this
 * tranche, and it moved it.
 */
export const FIX_ROUND = {
	rebuilt: ['cf', 'cfc', 'cfm'],
	rehunted_and_unchanged: [],
	// What the three USED to ship, for the sheet's "was" pane. The strip's default
	// reading — the roster's declared category glyph — is wrong here: flag 1 did not
	// leave these gray, it put them on the `adobe` family, so all three shipped A01's
	// actionscript master, Adobe's red A, under rule 1(b).
	was: {
		cf: { set: 'A01', id: 'actionscript' },
		cfc: { set: 'A01', id: 'actionscript' },
		cfm: { set: 'A01', id: 'actionscript' }
	},
	notes: {
		cf: 'flag 1 declined Adobe\'s ColdFusion plate on a measurement — a #002258 field at '
			+ '1.21:1 against #121314 — and the ruling overturns it by supplying a construction: '
			+ 'the brand\'s own FRAMED icon, where the frame carries the silhouette and the dark '
			+ 'field becomes mark-interior ink. Adobe publishes that frame '
			+ '(adobe.com/content/dam/shared/images/product-icons/svg/coldfusion.svg, internally '
			+ 'cf_builder_2016_appicon.svg) as a ring inset 10.7 on a 256-wide icon; FrameMaker '
			+ 'and RoboHelp, served beside it, are 10/240 = w/24 exactly. Adobe\'s framed cut is '
			+ 'square-cornered, so the ruling\'s rounded corners come from Adobe\'s own rounded '
			+ 'framed cut (photoshop-ipad-official.svg), whose outer radius IS ColdFusion\'s plate '
			+ 'radius to five decimals and whose inner radius is 0.8541 of it. One number moved: '
			+ 'w/24 is 0.53 px at the shipped fit, so the prettier rider thickens the frame to '
			+ 'w/10 = 1.28 px, the smallest denominator that clears L5\'s 1.2 px floor (w/11 = '
			+ '1.16 px was measured and rejected).',
		cfc: 'rule 1(b) of the rebuilt cf, byte for byte: Adobe publishes one ColdFusion mark and '
			+ 'no source theme draws a distinct .cfc variant glyph. The family key changed with '
			+ 'the construction — `adobe` (pointing at A01\'s actionscript) is gone and '
			+ '`coldfusion` has cf as its own base.',
		cfm: 'rule 1(b) of the rebuilt cf, byte for byte, for the same reason as cfc.'
	}
};
