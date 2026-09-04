// A02.t2.mjs — slice A02, tranche 2: the CODE category, clojurescript → dinophp.
//
//   clojurescript · coala · cobol · coconut · cocos · codekit · codeql ·
//   coffeescript · coloredpetrinets · command · conan · confluence · context ·
//   controller · crystal · csproj · cssmap · cucumber · cuda · cue ·
//   cypress-spec · cython · dal · dartlang-generated · denizenscript · devenv ·
//   dhall · dinophp
//
// Same law as the pilot, slice A01 and this slice's tranche 1 (guide §5 / L1-L10,
// D22 R1 "True colour" as amended at the A01 gate): where a brand publishes a mark
// the icon IS that mark, adapted from the brand's own vector or from whatever
// faithful vector of the real mark exists — licence and trademark are RECORDED and
// do not gate — and where no usable mark exists the concept takes the shared
// neutral vocabulary in one gray. Every source hunt, every reduction and every
// judgement call is written down here and lands in the slice manifest and on the
// sheet.
//
// SEVEN OF THE TWENTY-EIGHT are ambiguous NAMES rather than obvious brands, and the
// roster entry decided each one before any hunting started — never the name:
//
//   command    `.command`, no language id: the macOS shell script Terminal runs on
//              a double-click. NOT the ⌘ key (which is what Material draws)
//   controller `.controller.js` / `.controller.ts`, icon-pack only: the MVC
//              controller file of an Angular/Ngrx/Qwik app. No brand, no object
//   context    `.ctx`, language id `context`: ConTeXt, Hans Hagen's TeX macro
//              package (Material added its icon in the "TeX/LaTeX related files"
//              PR #3042). NOT a React context or a .ctx data file
//   devenv     devenv.nix / devenv.lock / devenv.yaml: devenv.sh, the Nix developer
//              environment. NOT Visual Studio's devenv.exe
//   cssmap     `.css.map`: a CSS source map, so CSS's own mark applies
//   cue        `.cue`, language id `cue`: the CUE configuration language
//              (cuelang.org). NOT a CD cue sheet, which is what the extension
//              means to anyone who met it in a music player first
//   dal        `.dal` AND language id `dal`: the AL Language's definition files.
//              vscode-icons' own icon request (#1159) asks for the AL icon "via
//              language id `al`, `dal`", and its later request (#3125) describes
//              `.dal` as "AL Language definition files ... reconstructed on the fly
//              by the AL Language". A01's `al-dal` already claims the same `.dal`
//              extension — the two roster concepts CONVERGE, exactly as asp/aspx do
//
// SOURCE HUNT RESULT for these twenty-eight. The chain is ordered by FIDELITY alone
// (D22 amendment): the brand's own SVG, then any faithful vector of the real mark
// wherever it lives, then — only after a hunt that came up empty — the neutral
// vocabulary. Every failure below was actually attempted:
//
//   brand's own SVG   coala        (coala/coala docs/_static/images/coala_logo.svg,
//                                  mirrored as coala/artwork logo/coala_color.svg)
//                     coconut      (coconut-lang.org/safari-pinned-tab.svg — the
//                                  brand's own single-colour vector of its logo)
//                     codeql       (github/vscode-codeql media/logo.svg)
//                     coffeescript (jashkenas/coffeescript documentation/site/icon.svg)
//                     conan        (conan-io/conan .github/conan2-logo-for-dark.svg)
//                     confluence   (@atlaskit/logo, Atlassian's own package)
//                     crystal      (crystal-lang.org/assets/media/crystal_icon.svg)
//                     cssmap       (CSS-Next/logo.css css.small.svg — the CSS logo's
//                                  own SMALL-SIZE variant)
//                     cucumber     (cucumber.io/img/logo.svg)
//                     cuda         (nvidia.com .../nvidia-logo-black.svg)
//                     cue          (cue-lang/cuelang.org hugo/assets/svg/ui/cue.svg)
//                     cypress-spec (cypress.io/favicon.svg, dark-mode rules included)
//                     cython       (cython/cython docs/_static/cython-logo-C.svg)
//                     dartlang-gen (dart-lang/site-shared .../dart/logo/1080.svg)
//                     devenv       (cachix/devenv logos/devenv-dark-bg.svg)
//                     dhall        (dhall-lang/dhall-lang img/dhall-icon.svg)
//   faithful vector   clojurescript — clojurescript.org publishes the "cljs" mark as
//                                  PNG ONLY (images/cljs-logo-icon-256.png,
//                                  cljs-logo-60b.png) and clojure/clojurescript-site
//                                  carries no logo file at all; vscode-icons and
//                                  devicon both trace the same drawing in the same
//                                  two hexes (#96CA4B / #5F7FBF, which the PNG's own
//                                  pixels confirm as #96CA4B / #5E7FC0)
//                     cocos      — cocos.com serves rasters from a CDN
//                                  (img/favicon.png) and cocos/cocos-engine keeps
//                                  editor/dashboard/logo.png; simple-icons' `cocos`
//                                  is a faithful vector of the same mascot mark
//   family (rule 1)   csproj -> A01's aspx (the .NET family) · dal -> A01's al
//   NO MARK (rule 2)  command                -> the TERMINAL object glyph, A01's,
//                                              byte-shared across the slice boundary
//                     cobol, coloredpetrinets, context, controller, codekit,
//                     denizenscript, dinophp -> the generic-code category glyph
//
// SEVEN of the twenty-eight collapse to the bracket glyph and one takes an object
// glyph — 29%, against tranche 1's 18%. THREE of the seven are concepts whose mark
// EXISTS and cannot ship, and each failed for a different reason, which is the part
// of this tranche worth reading:
//
//   codekit       CodeKit's mark is a pair of angle brackets on an orange tile,
//                 published as raster only (apple-touch-icon.png, favicon-32.png);
//                 bdkjones/codekit holds no artwork and vscode-icons' file is not a
//                 trace of it but a re-drawing on a black disc. Tracing the raster
//                 is what L2 forbids — and the object the mark draws is the object
//                 the bracket glyph draws, which is recorded rather than dressed up
//   denizenscript Denizen's mark is a black "D" on a yellow tile, published as
//                 DenizenVSCode/logo.png and images/*.png on denizenscript.com;
//                 there is no SVG in ANY of the twenty-seven DenizenScript repos
//   dinophp       DinoPHP's mark is a red dinosaur and the brand DOES publish a
//                 vector (DinoPHP/vscode-bubble images/DinoPHP-icon.svg) — it is
//                 declined on two hard numbers, not on taste: 6.4 KB past L8's 4 KB
//                 CAP and sustained ink runs of 0.40 / 0.80 / 1.40 px, which is
//                 tranche 1's rejected Buck deer. Rendered at 16 px in
//                 proofs/A02-t2-collapse-study.png
//
// The other four own no mark at all: cobol is a 1959 ISO/ANSI standard language
// (vscode-icons draws a triceratops, a joke about its age; Material a gear with a
// "C"; devicon the word COBOL), coloredpetrinets is a formalism plus an ISO
// interchange format, context is ConTeXt — whose only mark is a TeX-style logotype
// set in its own koeieletters font, the LaTeX case tranche 1 ruled on for cbx — and
// controller is an MVC file-name convention.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { subpaths, rewind } from '../pathkit.mjs';
import { genericCode, terminalGlyph } from '../geom.mjs';
import { NEUTRAL, WHITE, lift } from '../color.mjs';
import { officialShapes, icon, ENV, SRCDIR } from '../spec-engine.mjs';
import { spec as a01Spec } from './A01.mjs';

const S = {};

// The generic-code glyph is authored 11.2 x 9.8 in geom.mjs and is placed at
// 13.0 x 11.4 — A01 tranche 2's constant, reproduced here VERBATIM rather than
// re-derived, because a category glyph belongs to the production line and not to a
// slice: check-slice.mjs asserts that this tranche's brackets are byte-equal to
// A01's, and the twin audit pools both slices' collapsed ids in one lane.
const CODE_ENV = { w: 13, h: 11.4 };

// =============================================================================
// local helpers — nothing here is shared, so nothing here can move a pilot byte
// =============================================================================

/**
 * WORKING RULE 2, category glyph. Seven concepts in this tranche end up here and
 * they must be byte-identical with each other, with tranche 1's four AND with
 * A01's thirteen, so they go through one factory that is A01.t2's, copied
 * verbatim. `why` is the concept's own hunt result and is what lands on the sheet.
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
 * WORKING RULE 2, OBJECT glyph — the terminal, opened by A01's fix round for `awk`
 * and `bat`. This factory is A01.t3's `shellGlyph` reproduced verbatim, envelope
 * included, for the same reason as codeGlyph: an object glyph shared by more than
 * one id is declared under `category_glyphs` and check-slice.mjs asserts the
 * payload is byte-equal to the approved slice's.
 */
const shellGlyph = (title, why) => ({
	title: `${title} (neutral glyph)`,
	brand: NEUTRAL,
	neutral: true,
	env: { w: 12.8, h: 10.4 },
	source: {
		name: 'none — neutral glyph vocabulary (object: terminal)', slug: null,
		license: null, url: null, note: why
	},
	simplifications: [],
	parts() { return terminalGlyph().map(d => ({ d, fill: NEUTRAL })); }
});

/**
 * A sixth shape of source file: Cypress's favicon paints its "y" as a `<polygon>`.
 * spec-engine's readers handle `<path>` and `<circle>`; a polygon is a closed run
 * of straight lines, so re-emitting its points as `M x y L x y … Z` is a FORMAT
 * conversion and not a redraw — the move A01 tranche 2 makes by hand for SAP's
 * `<polyline>` and tranche 1 makes for CASC's aperture. Kept local for the same
 * reason tranche 1 keeps its own copy: the engine is shared with the frozen sets
 * and neither tranche has any business touching it for one file.
 */
const polyPaths = (file) => {
	const raw = readFileSync(join(SRCDIR, file), 'utf8');
	const out = [];
	for (const m of raw.matchAll(/<(polygon|polyline)\b([^>]*)>/g)) {
		const pts = (m[2].match(/\spoints="([^"]+)"/) || [])[1].trim().split(/[\s,]+/).map(Number);
		let d = '';
		for (let i = 0; i < pts.length; i += 2) { d += `${i ? 'L' : 'M'}${pts[i]} ${pts[i + 1]}`; }
		out.push({ d: `${d}Z` });
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
 * slices/A01/masters/<base>.svg rather than trusting this comment. `family` is the
 * FAMILIES key, which is not always the base's id — csproj's base is aspx and its
 * family is `dotnet`. (Tranche 1 carries the same helper; both are three lines
 * over the registry's own accessor and neither tranche imports the other.)
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
// clojurescript — ClojureScript
// =============================================================================
// A `.cljs` is a ClojureScript source file, and ClojureScript has its own mark: the
// "cljs" logotype inside a ring whose left half is Clojure green and whose right
// half is Clojure blue. It is NOT Clojure's mark (the two interlocking circles) —
// same family, different drawing — so shipping Clojure's would be the wrong
// project's logo on the file type, the distinction tranche 1 made for cairo.
//
// SOURCING: clojurescript.org publishes the mark as RASTER ONLY —
// images/cljs-logo-icon-256.png, cljs-logo-icon-32.png and cljs-logo-60b.png — and
// clojure/clojurescript-site, the site's own repository, carries no logo file at
// all (its only images are four screenshots). vscode-icons and devicon both trace
// the same drawing; the trace's two hexes (#96CA4B, #5F7FBF) are the PNG's own
// pixels to within a unit (#96CA4B, #5E7FC0 by census), which is the corroboration
// L2 likes. vscode-icons' is the geometry because devicon's is drawn with STROKES
// and L8 has no strokes.
//
// WHAT L5 SAYS, and it is the flag: at the open envelope the ring's wall lands on
// 0.90-1.00 px and the four letters on 0.50-0.60 px — a third of L5's floor and
// half of abap's SAP letters, which the A01 gate passed at 1.00-1.25. The letters
// are nonetheless KEPT, because they are the whole of what makes this mark
// ClojureScript's rather than a two-tone ring: dropping them is the reduction the
// pilot's gestalt erratum names (docker's deck, editorconfig's linework), and the
// ring alone would be a bare circle among four other rings in this slice. The
// 16 px verdict says what that costs, and both builds are in
// proofs/A02-t2-study.png.
S.clojurescript = {
	title: 'ClojureScript',
	brand: '#5F7FBF',
	env: ENV.open,
	source: {
		name: 'ClojureScript (faithful vector — vscode-icons)', slug: 'clojurescript',
		license: 'MIT (vscode-icons/vscode-icons); the mark is the ClojureScript project\'s '
			+ '(clojure/clojurescript, EPL-1.0). Recorded and NOT gating',
		url: 'https://clojurescript.org/images/cljs-logo-icon-256.png',
		artwork: 'clojurescript-vsicons.svg',
		note: '32x32, seven painted layers: five for the "cljs" letters (the c and l in #96CA4B, '
			+ 'the j, its tittle and the s in #5F7FBF) and two for the ring halves. '
			+ 'clojurescript.org publishes this mark as PNG only (images/cljs-logo-icon-256.png, '
			+ 'cljs-logo-icon-32.png, cljs-logo-60b.png) and clojure/clojurescript-site holds no '
			+ 'logo file; a colour census of the 256 px PNG returns #96CA4B and #5E7FC0, which is '
			+ 'this vector\'s palette. devicon traces the same drawing but with STROKES, which L8 '
			+ 'does not take. Fetched to sources-svg/clojurescript-vsicons.svg'
	},
	simplifications: [
		'the envelope is the OPEN one (13.6 x 13.6, the react/git/yaml envelope for marks whose '
		+ 'corners are empty) rather than compact, and that is L5 forcing it: the ring\'s wall '
		+ 'measures 0.85 px at compact and 0.90-1.00 px here, so the widest envelope the mass '
		+ 'system allows is the one that ships',
		'NOT reduced, and the numbers are the reason this is flagged rather than celebrated: at '
		+ 'the shipped fit the mark\'s sustained ink runs are 0.50 px at the 5th percentile, 0.70 '
		+ 'at the 25th and 0.95 at the median, and measured on their own the four letters run '
		+ '0.45 / 0.55 / 0.60 px against the ring\'s 0.85 / 0.90 / 1.00. That is under L5\'s '
		+ '1.2 px official-forced floor everywhere and half of abap\'s SAP letters, which the A01 '
		+ 'gate passed at 1.00-1.25 px',
		'the letters are kept anyway: "cljs" IS the mark — strip it and what is left is a bare '
		+ 'two-tone ring, which says nothing about ClojureScript and would sit in this slice '
		+ 'beside four other rings (cue, cypress-spec, coconut, chef). That is the gestalt '
		+ 'failure the pilot ruling names, so the reduction is declined and the cost is carried '
		+ 'in the 16 px verdict instead. Both builds are in proofs/A02-t2-study.png'
	],
	parts() {
		return officialShapes('clojurescript-vsicons.svg').map(s => ({ d: s.d, fill: s.fill }));
	}
};

// =============================================================================
// coala — the coala linting framework
// =============================================================================
// `.coafile` and `.coarc` are coala's own config files, and coala publishes its own
// vector: docs/_static/images/coala_logo.svg in coala/coala, the same file as
// logo/coala_color.svg in coala/artwork. The mark is the koala head on a green
// disc. (coala.io itself is gone — the domain now serves an unrelated gambling
// site — which is why the repositories are the source of record.)
//
// WHAT THE FILE IS, because it decides the reduction: a 2015-era Inkscape drawing
// carrying the artwork TWICE — once painted with xlink-chained gradients and once
// with flat fills — plus TWO black line-art layers of 17,280 and 26,396 characters,
// plus a 0.65-opacity PNG tracing underlay in an <image> tag. What ships is the
// FLAT copy: the green disc, the koala's head and cheek shade, its nose, mouth and
// two eyes. Eight layers, 1.7 KB, every colour the file's own.
const COALA_KEEP = [15, 16, 17, 18, 8, 9, 10, 24];
S.coala = {
	title: 'coala',
	brand: '#CCDE9C',
	env: ENV.compact,
	source: {
		name: 'coala (brand\'s own SVG)', slug: 'coala',
		license: 'AGPL-3.0 (coala/coala); the same artwork is CC0-1.0 in coala/artwork. Recorded '
			+ 'and NOT gating',
		url: 'https://github.com/coala/coala/blob/master/docs/_static/images/coala_logo.svg',
		artwork: 'coala-official.svg',
		note: 'a 48x48 Inkscape drawing (447 KB as published) carrying the mark TWICE — a '
			+ 'gradient-painted copy whose gradients are xlink:href-chained, and a flat copy in '
			+ '#6B9753 / #CCDE9C green, #BAA59A head, #8E7A72 cheek shade, #2C3E50 nose and mouth, '
			+ '#37495E and black eyes — plus two black line-art layers and one 0.65-opacity PNG '
			+ 'tracing underlay. The <image> layer is stripped ON FETCH (L8 bans <image>, and a '
			+ 'tracing underlay is not part of the drawing); the 27 paths and 2 circles are '
			+ 'untouched. coala/artwork carries the identical file as logo/coala_color.svg. '
			+ 'coala.io no longer belongs to the project. Fetched to sources-svg/coala-official.svg'
	},
	simplifications: [
		'the file\'s TWO BLACK LINE-ART layers are dropped — 43,676 characters of path data between '
		+ 'them, ten times L8\'s 4 KB hard cap on their own, and black measures 1.13:1 against '
		+ '#121314 so on the product backdrop they paint nothing a reader can see. This is bruno\'s '
		+ 'call from tranche 1 (the keyline: over the cap AND invisible) and not editorconfig\'s '
		+ 'flattening: what is left is the drawing\'s own flat colour layers, not a silhouette',
		'the gradient-painted copy of the mark is dropped with them: the file draws the artwork '
		+ 'twice and the gradients are chained through xlink:href, so they carry no stops to flatten '
		+ 'to. The flat copy is the same drawing with the same geometry',
		'the flat copy\'s last layer — a #4D6C3B crescent across the disc\'s bottom half — is '
		+ 'dropped too: in document order it paints over the koala\'s chin, and at 16 px it changed '
		+ 'nothing that could be seen (both builds were rendered and compared)',
		'NOT reduced otherwise, and measured at the shipped fit: the disc is 12.10 px across, the '
		+ 'head 11.11 x 11.23, the nose 2.04 x 2.69 and the two eyes 0.86 x 0.98 and 0.87 x 0.98. '
		+ 'The mark\'s sustained ink runs are 4.05 px at the 5th percentile and 10.65 at the '
		+ 'median — the thickest mark in this tranche by a wide margin',
		'the #2C3E50 nose (1.69:1) and #37495E eye (2.02:1) are NOT lifted: they print on the '
		+ 'koala\'s own #BAA59A field, where the pilot\'s dotenv erratum says ink is never lifted, '
		+ 'and they are what makes the shape a koala rather than a blob'
	],
	parts() {
		const sh = officialShapes('coala-official.svg');
		return COALA_KEEP.map(i => ({ d: sh[i].d, fill: sh[i].fill }));
	}
};

// =============================================================================
// cobol — COBOL
// =============================================================================
// RULE 2, category glyph. `.cbl` / `.cob` / language id `cobol` is the 1959
// business language standardised by ANSI and ISO — a specification with no owner,
// no project site and no mark. The three source themes each invent one and none of
// them traces anything: vscode-icons draws a blue TRICERATOPS (a joke about the
// language's age, the same shape of pun as its auk for awk, which A01 rejected),
// Material a gear with a "C" in it, and devicon the word "COBOL" set in a serif.
S.cobol = codeGlyph('COBOL',
	'COBOL is an ISO/ANSI standard language from 1959 with no owner, no project site and no mark; '
	+ 'there is nothing to hunt. vscode-icons draws a triceratops — a joke about the language\'s '
	+ 'age, the same kind of pun as its auk for awk, which A01 rejected — Material draws a gear '
	+ 'with a "C" in it, and devicon draws the word COBOL in a serif face. All three are invented '
	+ 'metaphors or wordmarks. The generic-code category glyph, shared byte for byte with A01\'s '
	+ 'thirteen and tranche 1\'s four');

// =============================================================================
// coconut — the Coconut language
// =============================================================================
// A `.coco` is a Coconut source file — the functional superset of Python — and
// Coconut's mark is a black ring around a lambda whose upper-left arm is a green
// palm frond, so the λ reads as a coconut palm.
//
// SOURCING: evhub/coconut publishes NO artwork at all (there is not one image file
// in the repository) and coconut-lang.org serves the logo as coconut.png. What it
// also serves is safari-pinned-tab.svg — a VECTOR of the same drawing, made by the
// brand with potrace and published by the brand, which is the top of the fidelity
// chain rather than a trace of ours. It is single-colour, which is what a pinned
// tab is; the ring and the palm are separate paths, so the mark keeps its two
// shapes.
//
// COLOUR, and this is the flag: a census of the official PNG gives #000000 for the
// ring, #7E3B1B for the palm's trunk and #076007 for its frond. Against #121314
// those measure 1.13:1, 2.24:1 and 2.38:1 — every ink in this mark is under the
// 3.0:1 lift trigger, so this is the first subject in the set where the lift fires
// TWICE. Ring and palm both go to L 88 with hue and saturation intact (#E0E0E0 and
// #F4D9CD); the alternative — dropping the invisible ring the way tranche 1's casc
// drops its black field — is in proofs/A02-t2-study.png and loses the mark's outer
// form.
S.coconut = {
	title: 'Coconut',
	brand: '#7E3B1B',
	env: ENV.compact,
	source: {
		name: 'Coconut (brand\'s own SVG)', slug: 'coconut',
		license: 'Apache-2.0 (evhub/coconut); the site asset declares no separate terms. Recorded '
			+ 'and NOT gating',
		url: 'https://coconut-lang.org/safari-pinned-tab.svg',
		artwork: 'coconut-official.svg',
		note: '362x362, two black paths inside one transform group: the ring and the lambda-palm. '
			+ 'The file\'s own metadata says "Created by potrace 1.14" — it is the BRAND\'s vector '
			+ 'of the brand\'s logo, published for Safari pinned tabs, and it is the only vector '
			+ 'that exists: evhub/coconut contains no image files whatever and coconut-lang.org '
			+ 'otherwise serves coconut.png plus favicons. A colour census of that PNG gives '
			+ '#000000 ring, #7E3B1B trunk, #076007 frond. Fetched to '
			+ 'sources-svg/coconut-official.svg'
	},
	simplifications: [
		'the mark is single-colour in the brand\'s own vector and is painted from the official '
		+ 'raster\'s own census: the ring #000000, the palm #7E3B1B (the cakephp rule from tranche '
		+ '1 — the brand\'s geometry in the colour the mark carries). The frond\'s #076007 green is '
		+ 'lost with it: the pinned-tab vector fuses trunk and frond into one contour, and splitting '
		+ 'them would be drawing rather than adapting',
		'BOTH inks are lifted, which is new: #000000 measures 1.13:1 and #7E3B1B 2.24:1 against '
		+ '#121314, so every ink in this mark trips the 3.0:1 trigger and each goes to L 88 with '
		+ 'hue and saturation intact (#E0E0E0 and #F4D9CD). What it costs is that the mark arrives '
		+ 'pale rather than black-and-brown, and that the two inks now sit at the same lightness — '
		+ 'they are told apart by hue and by shape, not by tone',
		'NOT reduced, and this is the thinnest mark in the tranche: the ring is 12.80 px across '
		+ 'with an 0.69 px WALL (outer 12.80, counter 11.43) and the palm is 6.08 x 8.67 px inside '
		+ 'it, so the mark\'s sustained ink runs are 0.70 px at the 5th percentile, 0.75 at the '
		+ '25th and 0.90 at the median — half of L5\'s official-forced floor, and the reason the '
		+ '16 px verdict is marginal. What saves it at 16 px is that a thin CIRCLE antialiases to '
		+ 'a continuous line where a thin straight stem drops out; the proof is where to check '
		+ 'that. Dropping the ring (casc\'s move) buys 1.00 / 1.40 / 1.50 px and loses the mark\'s '
		+ 'outer form; both are in proofs/A02-t2-study.png'
	],
	parts() {
		const sh = officialShapes('coconut-official.svg');
		return [{ d: sh[0].d, fill: lift('#000000') }, { d: sh[1].d, fill: lift('#7E3B1B') }];
	}
};

// =============================================================================
// cocos — the Cocos engine
// =============================================================================
// `.prefab` and `.scene` are Cocos Creator's own scene files, so Cocos's mark
// applies: the flame-headed mascot with two round eyes, drawn against a square
// frame with "COCOS" set beneath it.
//
// SOURCING: cocos.com is a JavaScript site that serves its branding as rasters from
// a CDN (website-resource-prod.sudden.ltd, plus img/favicon.png), and
// cocos/cocos-engine ships editor/dashboard/logo.png and a tree of app-icon PNGs —
// no vector anywhere. simple-icons carries `cocos` (CC0), a faithful single-colour
// vector of the same mascot in the brand's #55C2E1, so that is the geometry.
//
// WHAT L5 FORCES: the mark has eighteen subpaths and seven of them are the letters
// of "COCOS", each 2.4-2.9 x 3.7 units on a 24-unit canvas — 1.5 px tall at the
// shipped fit with strokes a fraction of that. They go, and the frame goes with
// them: it is a 0.4 px rule at this envelope, and dropping it lets the mascot fill
// the envelope instead of sitting in the frame's empty corners (tranche 1's casc
// call, on the same numbers). What ships is the head and its eyes, which is what
// the mark IS.
S.cocos = {
	title: 'Cocos',
	brand: '#55C2E1',
	env: ENV.compact,
	source: {
		name: 'Cocos (faithful vector — simple-icons)', slug: 'cocos',
		license: 'CC0-1.0 (simple-icons); the mark is Cocos\'s. Recorded and NOT gating',
		url: 'https://www.cocos.com/en/',
		artwork: null,
		note: 'simple-icons\' single-path `cocos` in #55C2E1, eighteen subpaths: the frame, the '
			+ 'mascot\'s head and its outline, six small face details, two eyes with their pupils '
			+ 'and the seven letters of "COCOS". Cocos publishes no vector — cocos.com serves its '
			+ 'branding as CDN rasters (img/favicon.png) and cocos/cocos-engine keeps '
			+ 'editor/dashboard/logo.png and app-icon PNGs; a colour census of the dashboard logo '
			+ 'returns the same cyan family (#29CAE3)'
	},
	simplifications: [
		'the seven "COCOS" letters are dropped: each is 2.4-2.9 x 3.7 units on the mark\'s 24-unit '
		+ 'canvas, i.e. about 1.5 px tall at the shipped fit with strokes a fraction of a pixel — '
		+ 'far under L5\'s 1.2 px official-forced floor',
		'the square FRAME behind the mascot is dropped with them: its rule measures 0.40 px at this '
		+ 'envelope, and with the frame in the fit the whole mark\'s runs are 0.15 / 0.40 / 0.45 px '
		+ 'because the fit has to hold the frame\'s empty corners. Without it the mascot fills the '
		+ 'envelope and the runs are 0.40 / 0.95 / 1.55 px — the casc reduction from tranche 1, on '
		+ 'the same reasoning',
		'the six sub-pixel face details (1.2-1.4 units, i.e. under 0.8 px here) go with them; the '
		+ 'two eyes stay, at 2.70 x 3.06 and 2.83 x 3.08 px, because they are what makes the shape '
		+ 'a face. Both builds are in proofs/A02-t2-study.png',
		'the mark is single-colour in the brand\'s own use as well as in this vector, so nothing is '
		+ 'flattened: #55C2E1 measures 9.03:1 against #121314'
	],
	parts() {
		const sp = subpaths(icon('cocos').path);
		return [1, 2, 7, 8].map(i => ({ d: sp[i], fill: '#55C2E1' }));
	}
};

// =============================================================================
// codekit — CodeKit
// =============================================================================
// RULE 2, category glyph, and the most uncomfortable collapse in this tranche.
//
// `.kit` files and config.codekit* belong to CodeKit, Bryan Jones's macOS build
// app, and CodeKit HAS a mark: an orange rounded tile carrying a pair of black
// angle brackets. It is published as raster only — codekitapp.com serves
// images/apple-touch-icon.png and images/favicon-32.png, the site's only SVGs are
// its feature icons, and github.com/bdkjones/codekit is an issue tracker with no
// artwork in it. L2's ban on tracing a raster is a FIDELITY rule and the D22
// amendment does not reach it, so the mark cannot ship.
//
// vscode-icons' file_type_codekit.svg is not a way round that: it is a BLACK DISC
// carrying white brackets — a different container, inverted colours — and its own
// commit message ("Convert PNG to SVG (part 9)") says what it is. On the product
// backdrop its disc measures 1.13:1, so what would arrive is two white brackets on
// nothing.
//
// Which leaves the honest thing to write down: the object CodeKit's mark draws is
// the object the bracket glyph draws. The collapse is recorded as what it is.
S.codekit = codeGlyph('CodeKit',
	'CodeKit\'s mark exists and cannot ship. It is a pair of black angle brackets on an orange '
	+ 'tile, published as RASTER ONLY: codekitapp.com serves images/apple-touch-icon.png and '
	+ 'images/favicon-32.png (the site\'s other SVGs are feature icons, not the app mark) and '
	+ 'github.com/bdkjones/codekit carries no artwork at all. Tracing the raster is what L2 '
	+ 'forbids on FIDELITY grounds — the one rule the D22 amendment does not reach — and '
	+ 'vscode-icons\' file is not a trace of it either: it draws the brackets on a BLACK DISC in '
	+ 'inverted colours (its commit says "Convert PNG to SVG"), and that disc measures 1.13:1 '
	+ 'against #121314. Worth saying plainly: the object CodeKit\'s mark draws is the object the '
	+ 'generic-code glyph draws, so this collapse loses the tile and the orange, not the idea');

// =============================================================================
// codeql — GitHub CodeQL
// =============================================================================
// A `.ql` is a CodeQL query, and CodeQL is GitHub's — so this is the company-mark
// rider's third use in the set, except that it barely needs it: GitHub publishes a
// mark for CodeQL ITSELF rather than for the company. github/vscode-codeql ships
// media/logo.svg, a rounded-square frame with "QL" set inside it, and that is the
// geometry.
//
// COLOUR, which is the one judgement here. logo.svg paints the mark #24292F —
// GitHub's ink, drawn for a light UI, and 1.27:1 against #121314. The same
// repository publishes the same mark as media/VS-marketplace-CodeQL-icon.png, the
// product icon the Marketplace shows, and a colour census of it returns #1E7DFF on
// white. So the icon takes the mark's geometry from the vector and its colour from
// the brand's own full-colour publication of the same mark — the cakephp rule from
// tranche 1 — which is also what vscode-icons independently does.
S.codeql = {
	title: 'CodeQL (GitHub)',
	brand: '#1E7DFF',
	env: ENV.compact,
	source: {
		name: 'CodeQL (brand\'s own SVG)', slug: 'codeql',
		license: 'MIT (github/vscode-codeql); the mark is GitHub\'s. Recorded and NOT gating',
		url: 'https://github.com/github/vscode-codeql/blob/main/extensions/ql-vscode/media/logo.svg',
		artwork: 'codeql-github.svg',
		note: '16x16, two #24292F paths: the "QL" glyph (the Q with its tail and the L) and the '
			+ 'rounded-square frame, drawn with fill-rule evenodd. The same directory holds '
			+ 'media/VS-marketplace-CodeQL-icon.png, the 916 px product icon, whose colour census '
			+ 'is 47% #FFFFFF and 36% #1E7DFF — the same mark in the brand\'s full-colour form. '
			+ 'Fetched to sources-svg/codeql-github.svg'
	},
	simplifications: [
		'the frame is drawn with fill-rule evenodd in the source and is re-wound instead: the outer '
		+ 'contour clockwise, the inner one reversed, so the counter punches under plain nonzero '
		+ 'fill (A01\'s bashly/vscode move). No coordinate changes',
		'the mark is painted #1E7DFF, the blue of GitHub\'s own Marketplace icon for CodeQL, and not '
		+ 'the #24292F the vector carries: that ink is GitHub\'s light-UI gray and measures 1.27:1 '
		+ 'against #121314, so it would either disappear or have to be lifted to L 88 — a near-white '
		+ 'CodeQL mark that GitHub does not print. #1E7DFF measures 4.81:1. Same geometry, the '
		+ 'colour the brand publishes for the product (the npm/git/go source-of-truth rule)',
		'NOT reduced, and measured at the shipped fit: the frame is 12.80 px square with a 1.20 px '
		+ 'wall and the "QL" 8.40 x 5.11 px inside it, with the letters\' own runs at 0.95 px at '
		+ 'the 25th percentile and 1.05 at the median. That is abap\'s band (1.00-1.25 px, passed at '
		+ 'the A01 gate) and it is source geometry, not typeset letters, so L3 does not reach it'
	],
	parts() {
		const sh = officialShapes('codeql-github.svg');
		const fr = subpaths(sh[1].d);
		return [
			{ d: rewind(fr[0], -1) + rewind(fr[1], 1), fill: '#1E7DFF' },
			{ d: sh[0].d, fill: '#1E7DFF' }
		];
	}
};

// =============================================================================
// coffeescript — CoffeeScript
// =============================================================================
// `.coffee`, `.cson` and `.iced` are CoffeeScript's files and the brand publishes
// its own mark: jashkenas/coffeescript holds documentation/site/icon.svg, the
// steaming cup that heads coffeescript.org, as one path. Brand tier, first try.
// (documentation/site/logo.svg in the same directory is the cup plus the
// "CoffeeScript" logotype; the icon is the symbol.)
//
// The mark is COLOURLESS — the file names no fill, which is black — so R1's
// monochrome rule applies and the lift with it: black measures 1.13:1 against
// #121314. The hex lifted is #2F2625, the dark roast simple-icons records for the
// brand and the colour the site's own cup prints in; at S 11.7 it is inside the
// achromatic exemption, so the lift moves lightness only and the result (#E4DDDD)
// keeps the mark's warmth.
S.coffeescript = {
	title: 'CoffeeScript',
	brand: '#2F2625',
	env: ENV.wide,
	source: {
		name: 'CoffeeScript (brand\'s own SVG)', slug: 'coffeescript',
		license: 'MIT (jashkenas/coffeescript). Recorded and NOT gating',
		url: 'https://github.com/jashkenas/coffeescript/blob/main/documentation/site/icon.svg',
		artwork: 'coffeescript-official.svg',
		note: '458x372, ONE unfilled path (i.e. black): the cup, its handle, the saucer and the '
			+ 'two steam curls, all as one contour with counters. The same directory holds '
			+ 'documentation/site/logo.svg, the cup plus the "CoffeeScript" logotype at 566x100. '
			+ 'brand-colors.json has no coffeescript entry, so simple-icons\' #2F2625 stands as the '
			+ 'primary (the abap precedent). Fetched to sources-svg/coffeescript-official.svg'
	},
	simplifications: [
		'the mark is colourless in the brand\'s own file and takes the LIFT: #2F2625 measures '
		+ '1.26:1 against #121314 — under the 3.0:1 trigger — and goes to L 88 with hue and '
		+ 'saturation intact (#E4DDDD). At S 11.7 the ink is inside L6\'s achromatic exemption, so '
		+ 'nothing is saturation-clamped and the cup keeps its warmth. This is markdown\'s call, '
		+ 'on markdown\'s numbers',
		'NOT reduced, and the low quartile is the steam: the cup body is 12.56 x 10.20 px with a '
		+ '1.9 px wall and the saucer 1.4 px deep, but the two steam curls are 0.5-0.9 px lines, '
		+ 'which pulls the mark\'s sustained runs to 0.30 px at the 5th percentile and 0.55 at the '
		+ '25th while the median sits at 0.90 and the 75th at 3.75. Dropping the steam would leave '
		+ 'a plain cup, which is a mug and not CoffeeScript\'s mark; it stays, and the 16 px proof '
		+ 'says what survives'
	],
	parts() {
		return officialShapes('coffeescript-official.svg').map(s => ({ d: s.d, fill: lift('#2F2625') }));
	}
};

// =============================================================================
// coloredpetrinets — coloured Petri nets
// =============================================================================
// RULE 2, category glyph. `.cpn` is a CPN Tools model and `.pnml` is the Petri Net
// Markup Language, the ISO/IEC 15909-2 interchange format — a formalism from Carl
// Adam Petri's 1962 thesis plus a standards document, neither of which has an owner
// or a mark. CPN Tools itself has a logo and publishes it as raster only
// (cpntools.org/wp-content/uploads/2018/01/logo.png, 256 px), which L2's raster ban
// ends; and it would be one tool's mark on a pair of formats that outlive it —
// `.pnml` is read by a dozen tools. Material draws a place-transition-place
// diagram, which is a picture of a Petri net rather than a mark.
S.coloredpetrinets = codeGlyph('Coloured Petri nets',
	'`.cpn` is a CPN Tools model and `.pnml` is the Petri Net Markup Language, ISO/IEC 15909-2 — a '
	+ 'formalism and a standards document, neither with an owner or a mark. CPN Tools has a logo '
	+ 'and publishes it as a 256 px raster only (cpntools.org/wp-content/uploads/2018/01/logo.png), '
	+ 'which L2\'s raster ban ends before legibility is reached, and it would in any case be one '
	+ 'tool\'s mark on an interchange format a dozen tools read. Material draws a '
	+ 'place-transition-place diagram — a picture of a Petri net, not a mark. The generic-code '
	+ 'category glyph');

// =============================================================================
// command — a macOS .command script
// =============================================================================
// RULE 2, OBJECT glyph, reusing A01's terminal. A `.command` file is a plain shell
// script with the executable bit set: double-clicking it in Finder opens Terminal
// and runs it. That is the same concept as A01's `.bat` and `.awk` — the object the
// file names is the shell window it runs in — so it takes the SAME glyph, byte for
// byte, rather than a new one.
//
// Material draws the ⌘ key symbol, which reads the name rather than the file: ⌘ is
// Apple's modifier-key glyph, it has nothing to do with a shell script, and it is
// Apple's mark rather than anyone's file-type icon.
S.command = shellGlyph('macOS .command script',
	'a `.command` file is a shell script with the executable bit set — Finder opens Terminal and '
	+ 'runs it on a double-click — so it names the same object A01\'s bat and awk name, and takes '
	+ 'A01\'s TERMINAL object glyph byte for byte rather than a new one. Nothing to hunt: the file '
	+ 'type is a macOS convention with no owner and no mark. Material draws the ⌘ key symbol, '
	+ 'which reads the name instead of the file — ⌘ is Apple\'s modifier-key glyph and has nothing '
	+ 'to do with a shell script');

// =============================================================================
// conan — the Conan C/C++ package manager
// =============================================================================
// conanfile.py and conanfile.txt are Conan's own recipes, and Conan publishes its
// own vector: conan-io/conan holds .github/conan2-logo-for-dark.svg, the lockup
// JFrog uses on dark pages. Eleven layers, of which seven are the symbol — the
// isometric cube with the "C" cut into its top face — two are the "CONAN 2.0 /
// C/C++ Package Manager" wordmark, one is the divider rule between the two halves
// of the lockup, and one is the JFrog frog.
//
// The frog is the interesting drop. JFrog owns Conan, and the rider ratified at the
// A01 gate covers a company's mark on a format IT owns — but Conan has its own
// mark, so putting the parent company's frog on a conanfile would be tranche 1's
// chef situation exactly (chef.io serving the Progress symbol), and the same answer
// applies: the product's own mark ships.
S.conan = {
	title: 'Conan',
	brand: '#21AFFF',
	env: ENV.compact,
	source: {
		name: 'Conan (brand\'s own SVG)', slug: 'conan',
		license: 'MIT (conan-io/conan); the mark is JFrog\'s. Recorded and NOT gating',
		url: 'https://github.com/conan-io/conan/blob/develop2/.github/conan2-logo-for-dark.svg',
		artwork: 'conan-official.svg',
		note: '1400x264 lockup, eleven layers: the cube in three tones (two faces painted with a '
			+ '#0086FD -> #21AFFF gradient, the top face #86C7F7 and the right faces #A9DCFC), the '
			+ 'white "CONAN 2.0 / C/C++ Package Manager" wordmark, a divider rule, and the #40BE46 '
			+ 'JFrog frog. conan.io is a JavaScript site that serves no vector; simple-icons\' '
			+ '`conan` (#6699CB) is a single-path monochrome flattening of the same cube, which R1 '
			+ 'does not want. Fetched to sources-svg/conan-official.svg'
	},
	simplifications: [
		'the wordmark and the divider rule are dropped and the cube ships alone — the icon is the '
		+ 'symbol',
		'the JFROG FROG is dropped: JFrog owns Conan, but Conan has its own mark, so the frog would '
		+ 'be a parent company\'s symbol standing in for a product that has one — tranche 1\'s chef '
		+ 'call (chef.io serving the Progress corporate mark) with the same answer. The '
		+ 'company-mark rider covers a company standing in for a format it owns, which is not this',
		'the two gradient faces are flattened to their offset-1 stop #21AFFF (7.65:1 against '
		+ '#121314), the chrome ruling\'s default; the offset-0 stop #0086FD measures 5.16:1 and '
		+ 'either would read, so the default stands. The #86C7F7 top face and #A9DCFC right faces '
		+ 'are the file\'s own flat fills, untouched',
		'NOT reduced, and measured at the shipped fit: the cube is 12.80 x 12.75 px, its "C" counter '
		+ '6.77 x 3.64, and the mark\'s sustained ink runs are 2.40 px at the 5th percentile and '
		+ '9.75 at the median — one of the two or three most comfortable marks in the tranche'
	],
	parts() {
		const sh = officialShapes('conan-official.svg');
		return [0, 1, 2, 3, 4, 5, 6].map(i => ({ d: sh[i].d, fill: flat(sh[i]) }));
	}
};

// =============================================================================
// confluence — Atlassian Confluence
// =============================================================================
// A `.confluence` file is Confluence wiki markup, so Confluence's mark applies —
// the product's own, not Atlassian's corporate one, so the company-mark rider is
// not needed here either.
//
// SOURCING: Atlassian's brand pages are a JavaScript portal with no fetchable
// asset, but Atlassian PUBLISHES its logos as code — the @atlaskit/logo package
// (Apache-2.0, Atlassian's own design system) carries every product mark as an
// inline SVG string. Version 21.6.0's confluence/icon.js is the CURRENT mark: a
// #1868DB rounded tile with the two white "sails" on it. That is the brand's own
// artwork and it is already flat.
//
// This is a PLATE mark (an official field carrying a glyph), like A01's abap and
// aspx, so the twin audit scores its glyph rather than its rounded square. The
// legacy standalone sails — the gradient-blue pair every icon set still draws — are
// in the same package under legacy-logos/ and are flagged as the alternative.
S.confluence = {
	title: 'Confluence (Atlassian)',
	brand: '#1868DB',
	env: ENV.compact,
	plate: true,
	source: {
		name: 'Confluence (brand\'s own SVG)', slug: 'confluence',
		license: 'Apache-2.0 (@atlaskit/logo 21.6.0, Atlassian Pty Ltd); the mark is Atlassian\'s '
			+ 'trademark. Recorded and NOT gating',
		url: 'https://unpkg.com/@atlaskit/logo/dist/esm/artifacts/logo-components/confluence/icon.js',
		artwork: 'confluence-atlassian.svg',
		note: '24x24, two paths: the #1868DB rounded tile (the package writes it as '
			+ 'var(--tile-color, #1868db)) and the white two-sail glyph (var(--icon-color, white)). '
			+ 'Atlassian ships no downloadable SVG on its brand pages — the design system package '
			+ 'IS the publication. The same package\'s legacy-logos/confluence/icon.js carries the '
			+ 'older standalone sails, the gradient-blue mark vscode-icons and devicon both draw. '
			+ 'Extracted to sources-svg/confluence-atlassian.svg'
	},
	simplifications: [
		'nothing is reduced: the mark is two flat paths as Atlassian ships them. The tile is '
		+ '12.80 px square and the sails 7.20 x 6.89 px inside it, and the glyph\'s own sustained '
		+ 'runs are 1.85 px at the 25th percentile',
		'the CSS custom properties the package wraps the fills in (var(--tile-color, #1868db), '
		+ 'var(--icon-color, white)) are resolved to their defaults, which are the brand colours; '
		+ 'L8 has no variables',
		'the #1868DB tile measures 3.58:1 against #121314 and is not lifted, and the white glyph '
		+ 'prints on the mark\'s own field where the pilot\'s dotenv erratum says ink is never '
		+ 'lifted'
	],
	parts() {
		const sh = officialShapes('confluence-atlassian.svg');
		return [{ d: sh[0].d, fill: '#1868DB' }, { d: sh[1].d, fill: WHITE }];
	}
};

// =============================================================================
// context — ConTeXt
// =============================================================================
// RULE 2, category glyph, and a straight application of tranche 1's cbx ruling.
// `.ctx` with language id `context` is ConTeXt, Hans Hagen's TeX macro package
// (Material's icon for it arrived in its "add new icons for TeX/LaTeX related
// files" PR #3042, which is how the reading was confirmed rather than assumed).
//
// THE HUNT: contextgarden.net is a MediaWiki whose only images are per-topic
// section badges; pragma-ade.com serves logo-ade.svg, which is PRAGMA ADE's
// corporate mark and not ConTeXt's; and the contextgarden/context distribution
// contains no logo file at all — what it contains is `koeielogos.afm`, a FONT, of
// which the ConTeXt logotype is a glyph. That is the LaTeX situation cbx recorded:
// the mark is a word set with raised and lowered letters, and no 16 px icon holds
// it. Material draws a grid of coloured squares, its own invention.
S.context = codeGlyph('ConTeXt',
	'`.ctx` / language id `context` is ConTeXt, Hans Hagen\'s TeX macro package (Material added '
	+ 'its icon in the "TeX/LaTeX related files" PR #3042). ConTeXt has no symbol: '
	+ 'wiki.contextgarden.net is a MediaWiki whose only images are per-topic section badges, the '
	+ 'contextgarden/context distribution contains no logo file — its ConTeXt logotype lives in a '
	+ 'FONT, fonts/afm/hoekwater/koeieletters/koeielogos.afm — and the one vector pragma-ade.com '
	+ 'serves (logo-ade.svg) is PRAGMA ADE\'s corporate mark, not the package\'s. A logotype set '
	+ 'with raised and lowered letters is exactly what tranche 1\'s cbx ruled cannot hold at '
	+ '16 px. Material draws a grid of coloured squares, its own invention. The generic-code '
	+ 'category glyph');

// =============================================================================
// controller — an MVC controller file
// =============================================================================
// RULE 2, category glyph. `.controller.js` / `.controller.ts` is Material's
// icon-pack-only entry for the controller layer of an Angular, Ngrx or Qwik app —
// a NAMING CONVENTION, not a product: there is no controller brand, no controller
// project and nothing to hunt. Rule 2 then asks whether the concept names a
// drawable OBJECT, and it does not: an MVC controller is a role in an architecture.
// Material draws a gear, which is its metaphor for "machinery"; the same gear would
// serve config, build or service files equally well, which is what makes it a
// metaphor rather than a mark.
S.controller = codeGlyph('MVC controller',
	'`.controller.js` / `.controller.ts` is the controller layer of an Angular, Ngrx or Qwik app — '
	+ 'a file-NAMING convention with no product, no owner and no mark, and nothing to hunt. Rule '
	+ '2\'s object test fails too: an MVC controller is a role in an architecture, not a drawable '
	+ 'object. Material draws a gear, which is its metaphor for machinery and would serve config, '
	+ 'build or service files equally well. The generic-code category glyph');

// =============================================================================
// crystal — the Crystal language
// =============================================================================
// `.cr` and `.ecr` are Crystal's files and Crystal publishes its own media kit:
// crystal-lang.org/media/ offers crystal_icon.svg, crystal_logo.svg and the mascot,
// and the icon is the mark — the faceted crystal, one path with the inner facet cut
// out of it. (crystal-lang/crystal-website carries the identical path as
// _includes/icons/crystal.svg.)
//
// The mark is colourless and brand-colors.json says so explicitly: `"crystal":
// "#000000"`. Black measures 1.13:1 against #121314, so the lift fires and the
// crystal ships at L 88 — markdown's case, and the reason the source of truth
// records a black there in the first place.
S.crystal = {
	title: 'Crystal',
	brand: '#000000',
	env: ENV.compact,
	source: {
		name: 'Crystal (brand\'s own SVG)', slug: 'crystal',
		license: 'no separate licence on the media kit; crystal-lang/crystal is Apache-2.0 and '
			+ 'crystal-lang/crystal-website declares none. Recorded and NOT gating',
		url: 'https://crystal-lang.org/assets/media/crystal_icon.svg',
		artwork: 'crystal-official.svg',
		note: '193.2x206.7, one unfilled path (i.e. black) with two subpaths — the crystal\'s outer '
			+ 'contour and the facet cut out of it — plus a fill:none bounding rectangle the icon '
			+ 'drops. crystal-lang/crystal-website carries the identical path as '
			+ '_includes/icons/crystal.svg, and crystal-lang.org/media/ offers the same file in its '
			+ 'media kit. Fetched to sources-svg/crystal-official.svg'
	},
	simplifications: [
		'the file\'s fill:none bounding rectangle is dropped — it is a canvas guide, not geometry',
		'the mark takes the LIFT: brand-colors.json records crystal as #000000, which measures '
		+ '1.13:1 against #121314, so it goes to L 88 (#E0E0E0) with hue and saturation intact. '
		+ 'This is exactly the case the trigger exists for, and it is markdown\'s',
		'NOT reduced, and measured at the shipped fit: the crystal is 12.80 x 12.78 px with its '
		+ 'facet counter 6.26 x 6.23, and the mark\'s sustained ink runs are 0.80 px at the 5th '
		+ 'percentile, 2.65 at the 25th and 4.25 at the median — the 5th percentile is the point '
		+ 'where two facets meet, not a thin feature'
	],
	parts() {
		return officialShapes('crystal-official.svg')
			.filter(s => s.fill !== 'none')
			.map(s => ({ d: s.d, fill: lift('#000000') }));
	}
};

// =============================================================================
// csproj — a C# / MSBuild project file
// =============================================================================
// WORKING RULE 1, branch (b), across the slice boundary. A `.csproj` is an MSBuild
// project file for a .NET project, so the .NET mark applies for exactly the reason
// A01's asp and aspx carry it — and A01 already did the hard part: its fix round
// ruled asp and aspx one family on Microsoft's own CC0 .NET logo, reduced by the
// prettier rider to the official dot and N at 2.5x (dotenv's constant).
//
// Branch (a) first, and it is not empty: vscode-icons draws a csproj icon. What it
// draws is the VISUAL STUDIO ribbon with a green "C#" laid over it — the IDE's
// corporate mark composed with a language monogram, which is neither a .NET variant
// glyph nor anything Microsoft publishes. Declined, and csproj ships A01's aspx
// master byte for byte.
S.csproj = fromA01('dotnet', 'aspx', 'C# project (MSBuild)',
	'WORKING RULE 1(b), cross-slice: a .csproj is an MSBuild project file for a .NET project, so '
	+ 'the .NET mark applies for the same reason it applies to A01\'s asp and aspx. Branch (a) was '
	+ 'checked and declined: vscode-icons draws the VISUAL STUDIO ribbon with a green "C#" over it '
	+ '— the IDE\'s corporate mark composed with a language monogram, not a .NET variant glyph and '
	+ 'not anything Microsoft publishes. So csproj ships A01\'s aspx master byte-identically under '
	+ 'its own id, including its prettier-rider ".N" reduction');

// =============================================================================
// cssmap — a CSS source map
// =============================================================================
// A `.css.map` is a CSS source map: the file a compiler writes beside its CSS so a
// debugger can point at the Sass or Less it came from. The concept is CSS's, so
// CSS's mark applies — and CSS has had an official one since 2024: the purple
// rounded square with "CSS" knocked out of it, published at CSS-Next/logo.css under
// CC0 and carried by simple-icons as `css` (#663399, which is rebeccapurple).
//
// WHICH FILE, and it is the whole reason this fits: the repository publishes the
// mark in three cuts — css.svg, css.small.svg and css.square.svg — and css.small is
// the BRAND'S OWN SMALL-SIZE VARIANT, the letters set larger and heavier inside the
// same field. Measured on the letters alone at the compact envelope, the standard
// cut runs 0.95 px at the 25th percentile and 1.05 at the median; the small cut
// runs 1.25 and 1.40, over L5's 1.2 px official-forced floor. The brand did the
// prettier rider's work itself, so this icon does not have to. Both are in
// proofs/A02-t2-study.png.
//
// This is a PLATE mark, like A01's aspx, whose #512BD4 field measures 2.34:1 and
// passed its gate; #663399 measures 2.21:1 and is treated identically — official
// colours verbatim, no lift, the white ink printing on the mark's own field.
S.cssmap = {
	title: 'CSS source map',
	brand: '#663399',
	env: ENV.compact,
	plate: true,
	source: {
		name: 'CSS (the logo\'s own repository)', slug: 'css',
		license: 'CC0-1.0 (CSS-Next/logo.css). Recorded and NOT gating',
		url: 'https://github.com/CSS-Next/logo.css/blob/main/css.small.svg',
		artwork: 'css-official-small.svg',
		note: '1000x1000, two paths: the #663399 (rebeccapurple) rounded field and the white "CSS" '
			+ 'knocked out of it. This is the SMALL-SIZE cut the repository publishes beside '
			+ 'css.svg and css.square.svg — same mark, letters set larger and heavier for small '
			+ 'renders. simple-icons carries the same logo as `css` and records this repository as '
			+ 'its source; brand-colors.json\'s css entry (#663399) agrees with the field. Fetched '
			+ 'to sources-svg/css-official-small.svg (the standard cut is kept alongside as '
			+ 'css-official.svg for the study)'
	},
	simplifications: [
		'the brand\'s SMALL-SIZE cut ships rather than the standard one, and the difference is '
		+ 'measured: the standard cut\'s letters run 0.85 / 0.95 / 1.05 px at the 5th, 25th and '
		+ '50th percentiles at this envelope, the small cut\'s 1.10 / 1.25 / 1.40 — over L5\'s '
		+ '1.2 px official-forced floor where the standard cut is under it. Nothing is redrawn: '
		+ 'this is the brand\'s own small-size artwork',
		'official colours verbatim: the #663399 field and the #FFFFFF ink. The field measures '
		+ '2.21:1 against #121314 — under the 3.0:1 trigger — and is NOT lifted, which is A01\'s '
		+ 'aspx treatment on aspx\'s numbers (#512BD4 at 2.34:1, passed at the gate): lifting a '
		+ 'field to L 88 would leave white letters on near-white and invent a colour the brand does '
		+ 'not print. The white ink prints on the mark\'s own field, where the pilot\'s dotenv '
		+ 'erratum says ink is never lifted',
		'the letterforms are the brand\'s own source geometry, so L3\'s typeset-letter ban does not '
		+ 'reach them (the abap / al / typescript reading)',
		'NOT otherwise reduced: the field is 12.80 px square and the "CSS" 11.47 x 6.48 px inside it'
	],
	parts() {
		const sh = officialShapes('css-official-small.svg');
		return [{ d: sh[0].d, fill: '#663399' }, { d: sh[1].d, fill: WHITE }];
	}
};

// =============================================================================
// cucumber — Cucumber
// =============================================================================
// A `.feature` file is a Gherkin feature specification, Cucumber's own format, and
// cucumber.io publishes the mark at /img/logo.svg: the green cucumber slice with
// its seven white seeds, three layers of which one is an unfilled bounding
// rectangle. Brand tier, first try, and one of the cleanest marks in the tranche.
S.cucumber = {
	title: 'Cucumber',
	brand: '#00A818',
	env: ENV.tall,
	source: {
		name: 'Cucumber (brand\'s own SVG)', slug: 'cucumber',
		license: 'MIT (cucumber/cucumber); the site asset declares no separate terms. Recorded and '
			+ 'NOT gating',
		url: 'https://cucumber.io/img/logo.svg',
		artwork: 'cucumber-official.svg',
		note: '32.5x37.1, three layers: an unfilled bounding rectangle, the #00A818 slice (a disc '
			+ 'with the stem tail at its lower right) and the seven #FFFFFF seeds. simple-icons '
			+ 'records #23D96C for the brand and draws the same slice as a single-colour outline, '
			+ 'which R1 does not want — the mark is green AND white. Fetched to '
			+ 'sources-svg/cucumber-official.svg'
	},
	simplifications: [
		'the unfilled bounding rectangle is dropped — a canvas guide, not geometry',
		'NOT reduced, and measured at the shipped fit: the slice is 11.20 x 12.70 px, the seed '
		+ 'cluster 7.51 x 7.06, the individual seeds about 1.7 x 2.6 px, and the mark\'s sustained '
		+ 'ink runs are 2.50 px at the 5th percentile and 9.60 at the median. It clears L5 outright',
		'the colours are the file\'s own: #00A818 (5.86:1 against #121314) and white. '
		+ 'brand-colors.json has no cucumber entry; simple-icons\' #23D96C is a different green '
		+ 'from the one the brand\'s own asset paints, so the artwork\'s own fill stands (the '
		+ 'npm/git/go rule)'
	],
	parts() {
		const sh = officialShapes('cucumber-official.svg');
		return [{ d: sh[1].d, fill: '#00A818' }, { d: sh[2].d, fill: WHITE }];
	}
};

// =============================================================================
// cuda — NVIDIA CUDA
// =============================================================================
// `.cu` and `.cuh` are CUDA C++ sources. CUDA is NVIDIA's — the language, the
// toolkit and the trademark — and it has no separate symbol of its own: NVIDIA
// brands it with a "CUDA" wordmark beside the corporate eye. So this is the
// COMPANY-MARK RIDER, ratified at the A01 gate (a format created and owned by a
// company may wear that company's mark) and used here for the third time in the set
// after safetensors and cds. It is flagged, as the rider's uses are.
//
// SOURCING: NVIDIA publishes the eye as a vector on its own site —
// nvidia.com/content/dam/en-zz/Solutions/about-nvidia/nvidia-brochure/images/
// nvidia-logo-black.svg, an Illustrator export titled "NVIDIA_Logo_V" whose first
// layer is the #76B900 eye and whose remaining two are the "NVIDIA" wordmark and
// its registered-trademark glyph. vscode-icons and Material both draw the same eye
// for cuda, which is the corroboration and not the source.
S.cuda = {
	title: 'CUDA (NVIDIA)',
	brand: '#76B900',
	env: ENV.wide,
	source: {
		name: 'NVIDIA (brand\'s own SVG)', slug: 'nvidia',
		license: 'no licence is declared on the asset; the mark is NVIDIA\'s registered trademark. '
			+ 'Recorded and NOT gating (D22 amendment)',
		url: 'https://www.nvidia.com/content/dam/en-zz/Solutions/about-nvidia/nvidia-brochure/'
			+ 'images/nvidia-logo-black.svg',
		artwork: 'nvidia-official.svg',
		note: '974.7x179.7, an Adobe Illustrator export identified in the file as "NVIDIA_Logo_V": '
			+ 'layer 2 is the #76B900 eye, layers 0 and 1 are the "NVIDIA" wordmark and its '
			+ 'registered-trademark glyph. CUDA itself has no symbol — NVIDIA sets it as a wordmark '
			+ 'beside this eye — so the company-mark rider is what puts a mark on .cu at all. '
			+ 'Fetched to sources-svg/nvidia-official.svg'
	},
	simplifications: [
		'the "NVIDIA" wordmark and the registered-trademark glyph are dropped and the eye ships '
		+ 'alone — the icon is the symbol',
		'NOT reduced, and measured at the shipped fit: the eye is 13.80 x 9.12 px and the mark\'s '
		+ 'sustained ink runs are 0.70 px at the 5th percentile, 1.10 at the 25th and 1.40 at the '
		+ 'median. The low quartile is the eye\'s own inner spiral, which tapers to a point by '
		+ 'construction — that is the mark\'s drawing and not the fit, and the 16 px proof is where '
		+ 'to check it',
		'the colour is NVIDIA\'s #76B900 verbatim (7.71:1 against #121314); brand-colors.json has '
		+ 'no cuda or nvidia entry and simple-icons records the same hex'
	],
	parts() {
		return [{ d: officialShapes('nvidia-official.svg')[2].d, fill: '#76B900' }];
	}
};

// =============================================================================
// cue — CUE
// =============================================================================
// A `.cue` with language id `cue` is a CUE configuration file (cuelang.org), not a
// CD cue sheet — the roster's language id settles it. CUE publishes two marks in
// its own site repository: hugo/assets/svg/logo.svg, the "CUE" logotype inside two
// concentric rings, and hugo/assets/svg/ui/cue.svg, the ICON — the same mark with
// the letters gone and the rings redrawn as four concentric bands.
//
// The icon is what ships, and that is not a reduction anyone made here: it is the
// brand's own small-size mark, the way Microsoft's AL_file_logo.svg is Microsoft's
// own file icon. It is also what L5 would have forced — the logotype's letters
// measure 0.40 px at this envelope and its rings 0.30-0.65 px, against the icon's
// 1.15 / 1.20 / 1.35. Both are in proofs/A02-t2-study.png.
//
// COLOUR: the site paints its logo with $c-blue, #232A68, which measures 1.42:1
// against #121314. The lift fires and the mark goes to L 88 with hue and saturation
// intact (#D1D4F0) — and the brand's own header does the analogous thing, printing
// this navy on a white disc.
S.cue = {
	title: 'CUE',
	brand: '#232A68',
	env: ENV.compact,
	source: {
		name: 'CUE (brand\'s own SVG)', slug: 'cue',
		license: 'Apache-2.0 (cue-lang/cuelang.org). Recorded and NOT gating',
		url: 'https://github.com/cue-lang/cuelang.org/blob/master/hugo/assets/svg/ui/cue.svg',
		artwork: 'cue-official-icon.svg',
		note: '24x24, one unfilled path with four concentric contours — CUE\'s own UI icon. The '
			+ 'site\'s full logo (hugo/assets/svg/logo.svg, 128x128) is the same rings with the '
			+ '"CUE" logotype inside them and is kept alongside as cue-official.svg for the study. '
			+ 'Neither file names a fill: the site\'s stylesheet paints the logo with '
			+ '$c-blue = #232A68 (hugo/assets/scss/config/colors.scss, used by '
			+ 'components/header.scss) on a white disc. cue-lang/cue itself ships no logo and '
			+ 'simple-icons has no cue entry. Fetched to sources-svg/cue-official-icon.svg'
	},
	simplifications: [
		'the brand\'s own ICON ships rather than its logotype lockup, which is both the brand\'s '
		+ 'own choice for small sizes and what L5 would have forced: at this envelope the '
		+ 'logotype\'s rings run 0.30 / 0.35 / 0.65 px and its letters 0.40 px, against the icon\'s '
		+ '1.15 / 1.20 / 1.35. Both builds are in proofs/A02-t2-study.png',
		'the mark takes the LIFT: #232A68 — the site\'s own $c-blue — measures 1.42:1 against '
		+ '#121314 and goes to L 88 with hue and saturation intact (#D1D4F0). The brand\'s own '
		+ 'header solves the same problem the other way, printing the navy mark on a white disc',
		'NOT reduced: four concentric bands at 12.80 px across, walls 1.15-1.35 px, sustained ink '
		+ 'runs 1.15 / 1.20 / 1.35 / 1.80 px — at L5\'s official-forced floor rather than over the '
		+ '1.5 px one, which is what the 16 px verdict reports'
	],
	parts() {
		return officialShapes('cue-official-icon.svg').map(s => ({ d: s.d, fill: lift('#232A68') }));
	}
};

// =============================================================================
// cypress-spec — a Cypress spec file
// =============================================================================
// `.cy.js`, `.cy.ts` and their five siblings are Cypress test specs, so Cypress's
// mark applies. cypress.io publishes it at /favicon.svg: the ring of four arcs with
// "cy" inside it, in the brand's #58D09E green.
//
// THE FIND THAT DECIDES THE COLOURS: that file carries the brand's OWN DARK-MODE
// RULES. Its <style> block says `.solid { fill: #1B1E2E }` and then, inside
// `@media (prefers-color-scheme: dark)`, `.solid { fill: white }` — so Cypress
// itself specifies that on a dark ground its "cy" is white and its fading arc runs
// #58D09E -> #FFFFFF rather than #58D09E -> #1B1E2E. This icon ships the brand's
// dark-mode reading. Nothing is lifted, because the brand already answered the
// question the lift exists to answer.
S['cypress-spec'] = {
	title: 'Cypress spec',
	brand: '#58D09E',
	env: ENV.compact,
	source: {
		name: 'Cypress (brand\'s own SVG)', slug: 'cypress',
		license: 'MIT (cypress-io/cypress); the site asset declares no separate terms. Recorded and '
			+ 'NOT gating',
		url: 'https://www.cypress.io/favicon.svg',
		artwork: 'cypress-official.svg',
		note: '48x48, six layers: four arcs (two flat #58D09E, one painted with a #58D09E -> '
			+ 'transparent gradient, one with a class whose dark-mode rule is a #58D09E -> #FFFFFF '
			+ 'gradient), the "c" as a path and the "y" as a POLYGON. The file\'s own <style> block '
			+ 'carries a @media (prefers-color-scheme: dark) section that repaints .solid white — '
			+ 'the brand\'s dark-ground treatment, which is what this icon ships. cypress-io/cypress '
			+ 'publishes assets/cypress-logo-dark.png and a 16 px monochrome '
			+ 'packages/frontend-shared/.../cypress-logo_x16.svg; simple-icons records #69D3A7 from '
			+ 'the press kit. Fetched to sources-svg/cypress-official.svg'
	},
	simplifications: [
		'the four arcs are flattened to ONE flat stop, #58D09E: two of them already carry it as a '
		+ 'flat fill, the third fades #58D09E to transparent (L8 has no opacity) and the fourth\'s '
		+ 'dark-mode gradient runs #58D09E -> #FFFFFF. Taking the shared solid stop keeps the ring '
		+ 'one colour, which is what the ring is',
		'the "cy" is painted WHITE on the brand\'s own instruction: the file\'s '
		+ '@media (prefers-color-scheme: dark) block sets .solid to white, so this is Cypress\'s '
		+ 'dark-ground artwork rather than a lift. The light-mode #1B1E2E measures 1.13:1 against '
		+ '#121314 and would have needed one',
		'the "y" is a <polygon> in the source and is re-emitted as an equivalent path — a format '
		+ 'conversion, no coordinate moved (tranche 1\'s casc move, A01\'s SAP polyline before it)',
		'NOT reduced, and measured at the shipped fit: the ring is 12.74 x 12.80 px with a 1.05 px '
		+ 'wall, the "cy" 8.50 x 7.43, and the mark\'s sustained ink runs are 0.85 px at the 5th '
		+ 'percentile, 0.95 at the 25th and 1.05 at the median — under the official-forced floor, '
		+ 'which is the ring\'s own drawing at this size',
		'the id is the SPEC variant and it ships the base Cypress mark: no source theme draws a '
		+ 'distinct non-letter spec glyph (vscode-icons composes the older drop-and-circle logo, '
		+ 'Material has no cypress-spec at all), so branch (a) is empty. There is no `cypress` '
		+ 'subject in the pilot or in an approved slice yet, so this is not a family declaration '
		+ 'either — when a later slice reaches it, the two ids will have to be declared one'
	],
	parts() {
		const sh = officialShapes('cypress-official.svg');
		const y = polyPaths('cypress-official.svg')[0];
		return [
			{ d: sh[0].d + sh[1].d + sh[2].d + sh[4].d, fill: '#58D09E' },
			{ d: sh[3].d + y.d, fill: WHITE }
		];
	}
};

// =============================================================================
// cython — Cython
// =============================================================================
// `.pyx` and `.pxd` are Cython sources, and Cython publishes its own mark:
// cython/cython holds docs/_static/cython-logo-C.svg, the gray "C" with Python's
// two-snake logo set inside its opening. (docs/_static/cython-logo.svg is the same
// mark plus the "ython" of the wordmark.)
//
// THE COLOUR CALL: the file is an Inkscape drawing whose snakes are painted with
// Python's own gradients (#306998 -> #5A9FD4 and #FFD43B -> #FFE873). Flattening
// them per the chrome ruling would give the SET TWO DIFFERENT PYTHON BLUES, because
// the pilot already ships the identical logo — python — at #3776AB / #FFD43B, which
// is brand-colors.json's python entry. The snakes therefore take the set's own
// python hexes; the "C", which is Cython's and not Python's, keeps the file's
// #646464.
S.cython = {
	title: 'Cython',
	brand: '#646464',
	env: ENV.compact,
	source: {
		name: 'Cython (brand\'s own SVG)', slug: 'cython',
		license: 'Apache-2.0 (cython/cython). Recorded and NOT gating',
		url: 'https://github.com/cython/cython/blob/master/docs/_static/cython-logo-C.svg',
		artwork: 'cython-official.svg',
		note: '207x196 Inkscape drawing, four layers: a soft drop shadow, the #646464 "C", and '
			+ 'Python\'s two snakes painted with Python\'s own gradients (#306998 -> #5A9FD4 blue, '
			+ '#FFD43B -> #FFE873 yellow). docs/_static/cython-logo.svg is the same mark with the '
			+ '"ython" of the wordmark beside it, and cythonlogo.png / cython-logo-light.png are '
			+ 'the raster cuts. Fetched to sources-svg/cython-official.svg'
	},
	simplifications: [
		'the drop-shadow layer is dropped: it is a gradient shading pass under the snakes (L8 bans '
		+ 'gradients) and at the shipped fit it is a 0.9 px smudge',
		'the snakes are painted #3776AB and #FFD43B — the hexes the pilot\'s `python` already ships '
		+ 'and brand-colors.json records for python — rather than the file\'s own gradient stops '
		+ '(#306998 -> #5A9FD4, #FFD43B -> #FFE873). The mark inside Cython\'s C IS the Python '
		+ 'logo, and flattening per stop would put two different Python blues in one set for one '
		+ 'logo. The yellow is the same hex either way',
		'the "C" keeps the file\'s own #646464, which is Cython\'s and not Python\'s. It measures '
		+ '3.14:1 against #121314 — over the 3.0:1 lift trigger by a hair, so it is not lifted, and '
		+ 'that thinness of margin is recorded rather than hidden',
		'NOT reduced, and measured at the shipped fit: the "C" is 12.80 x 12.12 px, the two snakes '
		+ '5.68 x 5.69 and 5.70 x 5.80, and the mark\'s sustained ink runs are '
		+ '0.55 px at the 5th percentile, 1.55 at the 25th and 2.45 at the median. The 5th '
		+ 'percentile is the snakes\' 0.55 px tails, which is where this mark spends its detail '
		+ 'budget'
	],
	parts() {
		const sh = officialShapes('cython-official.svg');
		return [
			{ d: sh[1].d, fill: '#646464' },
			{ d: sh[2].d, fill: '#3776AB' },
			{ d: sh[3].d, fill: '#FFD43B' }
		];
	}
};

// =============================================================================
// dal — the AL Language's definition files
// =============================================================================
// WORKING RULE 1, branch (b), across the slice boundary — and the roster's own
// convergence, which is what makes it easy. A02's `dal` matches extension `.dal`
// AND language id `dal`; A01's `al-dal` matches extension `.dal`. The two concepts
// claim the same file type, exactly as A01's asp and aspx do, and A01 already
// settled what a `.dal` is: vscode-icons' icon request #1159 asks for the AL icon
// "via language id `al`, `dal`", and request #3125 describes `.dal` as "AL Language
// definition files ... reconstructed on the fly by the AL Language". So `dal` is
// Microsoft's AL, one file type down, and it takes Microsoft's own AL mark.
//
// Branch (a) first: vscode-icons draws TWO icons here and neither is a variant
// glyph. `file_type_dal.svg` — the one registered against the language id — is a
// BAR CHART with a rising arrow, a generic analytics metaphor with nothing to do
// with AL; `file_type_al_dal.svg` — registered against the extension — is the AL
// monogram recoloured dusty red, which A01 already declined as vscode-icons' own
// invention. So there is nothing to adapt and dal ships A01's al master byte for
// byte, joining al-dal and tranche 1's c-al in the family.
S.dal = fromA01('al', 'al', 'AL definition file (Business Central)',
	'WORKING RULE 1(b), cross-slice: the roster gives A02\'s `dal` the extension .dal AND the '
	+ 'language id `dal`, and A01\'s `al-dal` the extension .dal — the two concepts claim the same '
	+ 'file type, the asp/aspx situation. vscode-icons\' own icon requests settle what it is: '
	+ '#1159 asks for the AL icon "via language id `al`, `dal`" and #3125 calls .dal "AL Language '
	+ 'definition files ... reconstructed on the fly by the AL Language". Branch (a) was checked '
	+ 'and is empty twice over: vscode-icons\' file_type_dal.svg is a BAR CHART with a rising '
	+ 'arrow (a generic analytics metaphor) and its file_type_al_dal.svg is the AL monogram '
	+ 'recoloured dusty red, which A01 already declined as the theme\'s own invention. So dal '
	+ 'ships A01\'s al master — Microsoft\'s own #2EA98E AL lockup — byte-identically under its '
	+ 'own id');

// =============================================================================
// dartlang-generated — generated Dart files
// =============================================================================
// `.g.dart` and `.freezed.dart` are the files build_runner writes beside a Dart
// source, so this is Dart's own file type and Dart's mark applies. Dart publishes
// it: dart-lang/site-shared holds src/_assets/image/dart/logo/1080.svg, the folded
// blue mark, seven layers of which four are the drawing.
//
// THE VARIANT QUESTION, asked in rule 1's order. Branch (a): does a source theme
// draw an established NON-LETTER variant glyph for generated Dart? Both draw one
// and both are RECOLOURS — Material paints the Dart mark gray, vscode-icons paints
// it red — which is the theme's own invention rather than a variant the brand
// draws, the same reading A01 made for al-dal's dusty red. The (recolour) branch is
// for brands that draw their own variants that way (TOTVS's advpl), which Google
// does not. So the base mark ships under this id.
//
// It is NOT a family declaration: there is no `dart` subject in the pilot or in an
// approved slice to be the base, so there is nothing to be byte-identical TO. When
// a later slice reaches `dart`, the two ids will have to be declared one — the same
// note tranche 1 leaves for bucklescript/rescript.
S['dartlang-generated'] = {
	title: 'Dart (generated)',
	brand: '#0175C2',
	env: ENV.compact,
	source: {
		name: 'Dart (brand\'s own SVG)', slug: 'dart',
		license: 'no LICENSE file in dart-lang/site-shared; the Dart logo is Google\'s trademark '
			+ 'and the SDK is BSD-3-Clause. Recorded and NOT gating',
		url: 'https://github.com/dart-lang/site-shared/blob/main/src/_assets/image/dart/logo/1080.svg',
		artwork: 'dart-official.svg',
		note: '1080x1080, seven layers: the #01579B dark faces (two of them), the #40C4FF and '
			+ '#29B6F6 light faces, two white highlight slivers and a white gradient gloss over the '
			+ 'whole mark. brand-colors.json has no dart entry, so simple-icons\' #0175C2 stands as '
			+ 'the primary (the abap precedent); the drawing\'s own fills carry the secondary '
			+ 'layers. Fetched to sources-svg/dart-official.svg'
	},
	simplifications: [
		'the white gradient gloss is dropped (L8 bans gradients, and a gloss is a lighting effect '
		+ 'rather than geometry), and the two white highlight slivers go with it: they are painted '
		+ 'under the mark\'s own dark face in document order, so removing them changes nothing that '
		+ 'renders — both builds were compared pixel for pixel',
		'the #01579B dark face measures 2.51:1 against #121314 and is NOT lifted: it is the shaded '
		+ 'side of a two-tone mark whose light faces are #40C4FF (9.35:1) and #29B6F6 (8.07:1), and '
		+ 'lifting it to L 88 would put the palest colour of the icon on its shadow side and invert '
		+ 'the drawing\'s tonal order (tranche 1\'s bosque reading)',
		'NOT reduced, and measured at the shipped fit: the mark is 12.80 x 10.60 px in four faces '
		+ 'of 2.61 x 8.00, 7.92 x 2.61, 8.34 x 8.33 and 10.61 x 8.33 px, and its sustained ink runs '
		+ 'are 2.65 px at the 5th percentile and 9.35 at the median — it clears L5 outright',
		'WORKING RULE 1, branch (a) checked and declined: Material and vscode-icons both '
		+ 'differentiate generated Dart by RECOLOURING the same mark (gray and red respectively), '
		+ 'which is a theme\'s invention and not a variant glyph the brand draws — A01\'s al-dal '
		+ 'reading. The base mark therefore ships under this id. No family is declared because no '
		+ '`dart` subject exists in the pilot or an approved slice yet'
	],
	parts() {
		const sh = officialShapes('dart-official.svg');
		return [0, 1, 2, 3].map(i => ({ d: sh[i].d, fill: sh[i].fill }));
	}
};

// =============================================================================
// denizenscript — DenizenScript
// =============================================================================
// RULE 2, category glyph, after a hunt that found a mark and no vector of it. A
// `.dsc` is a Denizen script — the scripting language of the Denizen plugin for
// Minecraft servers — and Denizen's mark is a black "D" on a yellow tile.
//
// THE HUNT: denizenscript.com serves its branding as PNGs (images/*.png,
// discimg/denizen_logo.png), DenizenScript/DenizenVSCode ships logo.png, and there
// is NOT ONE .svg file in any of the twenty-seven repositories the DenizenScript
// organisation publishes. L2's ban on tracing a raster ends it. Material draws a
// yellow "D" in its own typeface, which is a monogram it set rather than the
// brand's geometry — the thing R1's letter ban exists to keep out.
S.denizenscript = codeGlyph('DenizenScript',
	'Denizen\'s mark exists and cannot ship. A `.dsc` is a Denizen script (the scripting language '
	+ 'of the Denizen plugin for Minecraft servers) and the mark is a black "D" on a yellow tile, '
	+ 'published as RASTER ONLY: denizenscript.com serves images/*.png and '
	+ 'discimg/denizen_logo.png, DenizenScript/DenizenVSCode ships logo.png, and there is not one '
	+ '.svg file in any of the twenty-seven repositories the DenizenScript organisation publishes. '
	+ 'Tracing the raster is what L2 forbids on fidelity grounds. Material draws a yellow "D" in '
	+ 'its own typeface, which is a monogram it set and not the brand\'s letterform. The '
	+ 'generic-code category glyph');

// =============================================================================
// devenv — devenv.sh
// =============================================================================
// devenv.nix, devenv.lock and devenv.yaml belong to devenv.sh, the Nix-based
// developer-environment tool (NOT Visual Studio's devenv.exe, which is what the
// name suggests to anyone who met it there first). cachix/devenv publishes its own
// logos, and it publishes them PER GROUND: logos/devenv-dark-bg.svg is the version
// the brand itself uses on a dark background, so that is the file this set takes.
//
// The mark is eight squares in a staircase — four #425C82 blue, four #FBFBFB white
// — with the "devenv" wordmark beneath. The squares are the symbol.
S.devenv = {
	title: 'devenv.sh',
	brand: '#425C82',
	env: ENV.compact,
	source: {
		name: 'devenv (brand\'s own SVG)', slug: 'devenv',
		license: 'Apache-2.0 (cachix/devenv). Recorded and NOT gating',
		url: 'https://github.com/cachix/devenv/blob/main/logos/devenv-dark-bg.svg',
		artwork: 'devenv-official.svg',
		note: '480x480, fourteen layers: eight squares (four #425C82, four #FBFBFB) and the six '
			+ 'letters of the "devenv" wordmark. This is the DARK-BACKGROUND cut the brand '
			+ 'publishes beside logos/devenv-light-bg.svg, which is the same drawing with the white '
			+ 'squares black. docs/public/favicon.svg is the same eight squares again. Fetched to '
			+ 'sources-svg/devenv-official.svg'
	},
	simplifications: [
		'the "devenv" wordmark is dropped and the eight squares ship alone — the icon is the symbol',
		'the brand\'s own DARK-BACKGROUND cut is the source: its four white squares are black in '
		+ 'the light cut, so taking the light one would put four invisible squares on the product '
		+ 'backdrop. Nothing is recoloured — this is the artwork the brand draws for this ground',
		'the #425C82 blue measures 2.73:1 against #121314 — under the 3.0:1 trigger — and is NOT '
		+ 'lifted: it is one half of a deliberately two-tone mark whose other half is #FBFBFB at '
		+ '17.98:1, and lifting it to L 88 would make all eight squares the same near-white and '
		+ 'delete the drawing (the chef reading from tranche 1, arrived at from the other side)',
		'NOT reduced: eight 2.93 x 2.92 px squares on a 12.80 x 9.50 px staircase, sustained ink '
		+ 'runs 2.90 / 2.95 / 2.95 px on 0.36 px gaps — the most uniform mark in the tranche and '
		+ '382 bytes on disk'
	],
	parts() {
		const sh = officialShapes('devenv-official.svg');
		return [0, 1, 2, 3, 4, 5, 6, 7].map(i => ({ d: sh[i].d, fill: sh[i].fill }));
	}
};

// =============================================================================
// dhall — Dhall
// =============================================================================
// `.dhall` and `.dhallb` are Dhall's own files and dhall-lang/dhall-lang publishes
// the mark at img/dhall-icon.svg: a disc with a fountain-pen nib and its ink drop
// cut out of it, one path in #484848. Brand tier, first try. (img/dhall-logo.svg is
// the same nib beside the "Dhall" logotype.)
//
// The file is drawn with fill-rule evenodd — the nib and the drop are counters —
// so the subpaths are re-wound rather than the rule carried, which is A01's bashly
// move and changes no coordinate. #484848 measures 2.03:1 against #121314, so the
// lift fires; at S 0 the ink is achromatic and L 88 lands on #E0E0E0.
S.dhall = {
	title: 'Dhall',
	brand: '#484848',
	env: ENV.compact,
	source: {
		name: 'Dhall (brand\'s own SVG)', slug: 'dhall',
		license: 'BSD-3-Clause (dhall-lang/dhall-lang). Recorded and NOT gating',
		url: 'https://github.com/dhall-lang/dhall-lang/blob/master/img/dhall-icon.svg',
		artwork: 'dhall-official.svg',
		note: '200x200, ONE #484848 path with three subpaths under fill-rule evenodd: the disc, the '
			+ 'nib-and-shaft counter and the ink-drop counter. img/dhall-logo.svg is the same nib '
			+ 'beside the "Dhall" logotype at 600x200, and docs/_static/dhall-logo.svg is a third '
			+ 'copy. simple-icons has no dhall entry and gilbarbara/logos has none. Fetched to '
			+ 'sources-svg/dhall-official.svg'
	},
	simplifications: [
		'the source\'s fill-rule evenodd is replaced by winding: the disc clockwise, the two '
		+ 'counters reversed, so they punch under plain nonzero fill (A01\'s bashly move). No '
		+ 'coordinate changes',
		'the mark takes the LIFT: #484848 measures 2.03:1 against #121314 — under the 3.0:1 '
		+ 'trigger — and goes to L 88 (#E0E0E0). The ink is achromatic (S 0), so the lift moves '
		+ 'lightness only and L6\'s achromatic exemption keeps saturation out of it',
		'NOT reduced, and measured at the shipped fit: the disc is 12.80 px across, the nib counter '
		+ '4.19 x 7.76 px and the ink drop 1.52 px, and the mark\'s sustained ink runs are 2.35 px '
		+ 'at the 25th percentile and 4.90 at the median. The 5th percentile (0.25 px) is the '
		+ 'nib\'s own point, which is a taper and not a feature'
	],
	parts() {
		const sp = subpaths(officialShapes('dhall-official.svg')[0].d);
		return [{ d: sp.map((d, i) => rewind(d, i === 0 ? 1 : -1)).join(''), fill: lift('#484848') }];
	}
};

// =============================================================================
// dinophp — DinoPHP
// =============================================================================
// RULE 2, category glyph, and the only concept in this tranche where the brand
// publishes a real vector and it is still declined.
//
// `.bubble`, `.html.bubble` and `.php.bubble` are Bubble templates — the template
// language of the DinoPHP framework (dinophp.com, DinoPHP/BubbleTemplateEngine) —
// so DinoPHP's mark applies: the red dinosaur it prints beside the "DiNO php"
// wordmark. And the brand does publish it as a vector:
// DinoPHP/vscode-bubble images/DinoPHP-icon.svg, seven paths in #E92744 and white.
// (Material's red dinosaur is a trace of the same drawing; the DinoPHP organisation
// forks Material's repository, which is how that icon got there.)
//
// TWO HARD NUMBERS END IT, both measured at the compact envelope and rendered at a
// true 16 px in proofs/A02-t2-collapse-study.png:
//   · the fitted icon is 6,461 BYTES — past L8's 4 KB HARD CAP by 60%, and the cap
//     is a fail and not an advisory. Every layer is a body part, so there is no
//     sub-pixel detail to delete: dropping any one of them removes a leg, the tail
//     or the head;
//   · its sustained ink runs are 0.40 px at the 5th percentile, 0.80 at the 25th
//     and 1.40 at the median — Buck 2's deer, which tranche 1 rejected on L5 alone
//     (0.22 / 0.38 / 0.88), in the same territory and for the same reason: a
//     full-body animal at 16 px is a silhouette with legs that do not resolve.
// Opening the envelope to 13.6 x 13.6 moves the runs to 0.40 / 0.85 / 1.50 and the
// bytes to 6,507. There is no fit that saves it.
S.dinophp = codeGlyph('DinoPHP (Bubble)',
	'DinoPHP\'s mark exists, has a real vector, and is declined on two hard numbers. A `.bubble` '
	+ 'is a template for the Bubble engine of the DinoPHP framework, and DinoPHP publishes its red '
	+ 'dinosaur at DinoPHP/vscode-bubble images/DinoPHP-icon.svg (seven paths, #E92744 and white; '
	+ 'Material\'s red dinosaur is a trace of the same drawing). Fitted at the compact envelope it '
	+ 'is 6,461 BYTES — 60% past L8\'s 4 KB HARD CAP, which is a fail and not an advisory — and '
	+ 'its sustained ink runs are 0.40 / 0.80 / 1.40 px at the 5th, 25th and 50th percentiles, '
	+ 'which is tranche 1\'s rejected Buck deer (0.22 / 0.38 / 0.88). Every layer is a body part, '
	+ 'so there is nothing sub-pixel to delete — dropping one removes a leg, the tail or the head '
	+ '— and opening the envelope to 13.6 x 13.6 only moves the runs to 0.40 / 0.85 / 1.50. The '
	+ 'mark is rendered at a true 16 px in proofs/A02-t2-collapse-study.png. The generic-code '
	+ 'category glyph');

// =============================================================================
// module exports — the shape A02.mjs merges
// =============================================================================

export const SPECS = S;

/** Sheet order: the roster's own order. */
export const ORDER = ['clojurescript', 'coala', 'cobol', 'coconut', 'cocos', 'codekit', 'codeql',
	'coffeescript', 'coloredpetrinets', 'command', 'conan', 'confluence', 'context', 'controller',
	'crystal', 'csproj', 'cssmap', 'cucumber', 'cuda', 'cue', 'cypress-spec', 'cython', 'dal',
	'dartlang-generated', 'denizenscript', 'devenv', 'dhall', 'dinophp'];

/**
 * L9 gate 2 — the 16 px proof, eyeballed. Read off the slice's own
 * proofs/proof-16px.png (every icon at a true 16 px next to a 10x
 * nearest-neighbour blow-up) and written down here, not asserted by a machine.
 */
export const PROOF16 = {
	clojurescript: ['pass (marginal)', 'the two-tone ring arrives whole and the green/blue split is '
		+ 'unmistakable. The "cljs" inside it arrives as FOUR SEPARATE MARKS rather than as four '
		+ 'letters — at 0.60 px stems you can see that there is a word and cannot read it, and at '
		+ '22 px it starts to. What that leaves is a ring with something written in it, which is '
		+ 'what ClojureScript\'s mark looks like at this size and not a fit failure. Flagged, with '
		+ 'the letterless build measured beside it'],
	coala: ['pass', 'a koala head on a green disc: both ears, the muzzle, the dark nose and both '
		+ 'eyes separate, and the cheek shade reads as shading rather than as a second animal. The '
		+ 'thickest mark in the tranche (runs 4.05 / 10.65 px) and the one that loses least at '
		+ '16 px'],
	cobol: ['pass', 'the bracket pair, 2.2 px stems, byte-identical to A01\'s thirteen and tranche '
		+ '1\'s four — A01\'s own verdict re-read at slice scale'],
	coconut: ['pass (marginal)', 'better than the numbers predicted: the ring closes all the way '
		+ 'round on an 0.69 px wall — a thin CIRCLE antialiases to a continuous line where a thin '
		+ 'straight stem would drop out — and the lambda-palm inside it keeps both legs and its '
		+ 'hooked frond. Marginal on two counts: that wall is half L5\'s floor, and both inks are '
		+ 'lifted, so the two shapes sit at the same lightness and the mark arrives as one pale '
		+ 'ring-and-lambda instead of black-on-brown. Flagged'],
	cocos: ['pass (marginal)', 'the mascot\'s head and both eyes land and it reads as a cartoon '
		+ 'face; the flame crest keeps two of its notches and loses the rest, so the head arrives '
		+ 'closer to a rounded square than to a flame. The eyes are what carry it. Dropping the '
		+ 'frame and the "COCOS" letters is what made even that work'],
	codekit: ['pass', 'the bracket pair, byte-identical to the other six. The thing to read here is '
		+ 'the flag on why CodeKit\'s own mark — the same brackets, on an orange tile, published as '
		+ 'raster only — cannot come with it'],
	codeql: ['pass (marginal)', 'the blue frame closes and the "QL" holds together at 1.05 px '
		+ 'stems — the Q keeps its counter open and its tail, and the L reads as an L, which is '
		+ 'abap\'s band. Marginal because the frame\'s 1.20 px wall and the letters are the same '
		+ 'weight, so at a true 16 px the mark reads as a busy blue tile before it reads as "QL"'],
	coffeescript: ['pass', 'unmistakably a cup on a saucer: the body, the handle\'s counter and the '
		+ 'saucer all separate. The two steam curls are 0.5-0.9 px lines and arrive as a faint '
		+ 'flourish rather than as steam — the mark\'s own drawing at this size, not the fit'],
	coloredpetrinets: ['pass', 'the bracket pair, byte-identical to the other six'],
	command: ['pass', 'the terminal glyph — the plate with its prompt chevron and cursor bar — '
		+ 'byte-identical to A01\'s awk and bat, as declared. A01\'s own verdict at slice scale'],
	conan: ['pass', 'the cleanest branded mark in the tranche: the cube reads as a cube, its three '
		+ 'faces stay tonally apart and the "C" cut into the top face survives at 3.6 px. Runs '
		+ '2.40 / 9.75 px'],
	confluence: ['pass', 'the blue tile with the two white sails; the gap between the sails holds '
		+ 'and the tile\'s rounded corners survive. Reads as Confluence\'s current mark, which is '
		+ 'what it is'],
	context: ['pass', 'the bracket pair, byte-identical to the other six'],
	controller: ['pass', 'the bracket pair, byte-identical to the other six'],
	crystal: ['pass', 'a clean faceted crystal, its inner facet open and its six edges resolving. '
		+ 'The lift is what makes it visible at all — at #000000 this icon would be a hole in the '
		+ 'backdrop'],
	csproj: ['pass', 'byte-identical to A01\'s aspx, as declared: the #512BD4 field with the '
		+ 'official dot and N at 2.5x. A01\'s own verdict at slice scale'],
	cssmap: ['pass (marginal)', 'all three letters separate at 1.40 px stems and both S bowls stay '
		+ 'open — the brand\'s small-size cut earns its keep. Marginal for the field rather than '
		+ 'the letters: at 2.21:1 the violet reads as a ground behind white letters rather than as '
		+ 'a plate carrying them, which is A01\'s aspx at 2.34:1 and the same trade'],
	cucumber: ['pass', 'the slice reads as a cucumber slice: the green field, the stem tail and all '
		+ 'seven white seeds resolve, and the seeds stay separate from each other. Runs '
		+ '2.50 / 9.60 px'],
	cuda: ['pass (marginal)', 'the eye is unmistakably NVIDIA\'s: the outer contour and the pupil '
		+ 'both land. Its inner spiral tapers under a pixel at the tail, so the eye arrives with a '
		+ 'closed swirl rather than an open one — the mark\'s own drawing at this size'],
	cue: ['pass', 'four concentric bands, every one of them separate, at walls of 1.15-1.35 px. It '
		+ 'is a target rather than anything that says CUE, which is the honest limit of the '
		+ 'brand\'s own icon; the lift keeps it visible'],
	'cypress-spec': ['pass (marginal)', 'the green ring closes and the white "cy" inside it reads '
		+ 'as two letters — the y\'s descender is what carries it. At 0.95 px the ring is thin '
		+ 'enough that it greys slightly against the backdrop. The brand\'s own dark-mode colours, '
		+ 'so nothing here is our invention'],
	cython: ['pass (marginal)', 'the gray C and the two Python snakes all arrive and the blue/'
		+ 'yellow pair is unmistakable; the snakes\' tails are 0.55 px and fuse into the bodies, so '
		+ 'what reads is "a C with the Python logo in it" rather than two separate snakes. That is '
		+ 'exactly what the mark is'],
	dal: ['pass', 'byte-identical to A01\'s al, as declared — Microsoft\'s AL lockup with its stems '
		+ 'at 1.63/1.81 px. Same mark as tranche 1\'s c-al, same verdict'],
	'dartlang-generated': ['pass', 'the Dart mark whole: the fold reads, the light and dark faces '
		+ 'stay apart and the notch at the top left survives. Runs 2.65 / 9.35 px — one of the '
		+ 'three cleanest in the tranche'],
	denizenscript: ['pass', 'the bracket pair, byte-identical to the other six'],
	devenv: ['pass', 'eight squares in a staircase, every gap holding at 0.36 px and the blue/white '
		+ 'split clean. The blue squares are dim on the backdrop by construction (2.73:1) so the '
		+ 'staircase reads white-first, which is what the brand\'s own dark-ground artwork does'],
	dhall: ['pass', 'the disc with the nib and its ink drop punched out of it; both counters hold '
		+ 'and the nib reads as a nib. The lift is what makes it visible — at #484848 the disc '
		+ 'would be a smudge'],
	dinophp: ['pass', 'the bracket pair, byte-identical to the other six. The flag and the collapse '
		+ 'study are where to check the decline: DinoPHP\'s own dinosaur vector is 6.4 KB against '
		+ 'L8\'s 4 KB cap and runs 0.40 / 0.80 / 1.40 px']
};

/** Working rule 1 — declared brand families. */
export const FAMILIES = {
	dotnet: {
		base: 'aspx', base_set: 'A01', members: ['csproj'], mode: 'identical',
		why: 'a .csproj is an MSBuild project file for a .NET project, so the .NET mark applies '
			+ 'for the same reason it applies to A01\'s asp and aspx, which its fix round already '
			+ 'ruled one family on Microsoft\'s CC0 .NET logo. Branch (a) was checked and '
			+ 'declined: vscode-icons draws the Visual Studio ribbon with a green "C#" over it, '
			+ 'which is the IDE\'s corporate mark composed with a language monogram rather than a '
			+ '.NET variant glyph. So csproj ships the family base byte-identically'
	},
	// BOTH A02 members of the AL family are named here, tranche 1's c-al included, and
	// that is a property of the registry rather than a claim on tranche 1's subject:
	// A02.mjs merges FAMILIES with Object.assign, so two tranches declaring the same
	// family NAME do not union — the later module's entry replaces the earlier one, and
	// the members it leaves out drop out of the twin audit's family lane and start
	// failing as undeclared twins (al vs c-al, c-al vs dal: form 1.000). The fix that
	// does not touch a frozen file is for this entry to be the union. Tranche 1's own
	// reasoning for c-al is in its spec and its flag, unchanged.
	al: {
		base: 'al', base_set: 'A01', members: ['c-al', 'dal'], mode: 'identical',
		why: 'Microsoft ships ONE AL mark for this language family and registers it against the '
			+ '`al` language id, so every variant takes it byte-identically. `dal` (this tranche): '
			+ 'the roster gives it the extension .dal AND the language id `dal` while A01\'s '
			+ '`al-dal` has the extension .dal, so the two concepts claim the same file type — the '
			+ 'asp/aspx situation — and vscode-icons\' own icon requests say what it is (#1159 asks '
			+ 'for the AL icon "via language id `al`, `dal`"; #3125 calls .dal "AL Language '
			+ 'definition files"). Branch (a) is empty twice over: the theme\'s file_type_dal.svg '
			+ 'is a bar chart with a rising arrow and its file_type_al_dal.svg is the AL monogram '
			+ 'recoloured dusty red, which A01 already declined. `c-al` (tranche 1): C/AL is AL\'s '
			+ 'direct ancestor in the same product line, and branch (a) there is the Microsoft '
			+ 'Dynamics 365 sail — a product-suite mark rather than a C/AL variant glyph. Tranche '
			+ '1\'s own entry carries that reasoning in full'
	}
};

/** Working rule 2 — the neutral vocabulary as this tranche uses it. */
export const NEUTRAL_COLLAPSE = {
	object_glyphs: {
		// REUSED, not opened: A01's fix round authored geom.terminalGlyph for awk and bat
		// and this tranche takes it byte for byte. It is listed under category_glyphs as
		// well, which is the machinery that makes the sharing assertable across the slice
		// boundary (A01 tranche 3's own note on the point).
		terminal: 'shell window — a plate with the prompt chevron and the cursor bar punched out as '
			+ 'counters (geom.terminalGlyph). A01\'s glyph, reused unchanged for `command`, the '
			+ 'macOS shell script Finder runs in Terminal'
	},
	category_glyphs: {
		// The same payload A01 and tranche 1 ship: CODE_ENV and genericCode() are
		// reproduced from A01.t2 verbatim, and check-slice.mjs asserts one member of this
		// list is byte-equal to one of A01's before the slice can pass.
		'generic-code': ['cobol', 'codekit', 'coloredpetrinets', 'context', 'controller',
			'denizenscript', 'dinophp'],
		// the reused OBJECT glyph, declared here so the cross-slice byte assertion and the
		// twin audit's collapse lane both see it
		terminal: ['command']
	}
};

/**
 * What the brand actually ships, for the fidelity strip and the sheet's provenance
 * panes. Display-safe: no gradients, no <style>, no external references, because
 * both surfaces are gated for that. Neutral concepts return null — no brand owns
 * them, so there is nothing to be faithful to. Two panes are deliberately dim:
 * coconut's mark and crystal's are drawn in inks that measure 1.13:1 against this
 * backdrop, and seeing that is the argument for the lift.
 */
const wrap = (viewBox, body) => `<svg viewBox="${viewBox}">${body}</svg>`;
const fileSvg = (viewBox, file, fills) => wrap(viewBox, officialShapes(file)
	.filter(s => s.fill !== 'none')
	.map((s, i) => `<path fill="${(fills && fills[i]) || flat(s)}" d="${s.d}"/>`).join(''));

export const ORIGINAL = {
	// the vsicons trace as fetched: five letter layers and the two ring halves
	clojurescript: () => fileSvg('0 0 32 32', 'clojurescript-vsicons.svg'),
	// the flat copy of the official drawing plus its black line art, which the icon drops —
	// the gradient copy cannot be shown at all (its gradients are xlink-chained and carry
	// no stops, and L8 has no gradients anyway)
	coala: () => {
		const sh = officialShapes('coala-official.svg');
		return wrap('0 0 48 48', [...COALA_KEEP, 28, 14]
			.map(i => `<path fill="${sh[i].fill || '#000000'}" d="${sh[i].d}"/>`).join(''));
	},
	cobol: () => null,
	// the brand's own potrace vector in the official raster's own colours: a black ring and
	// a #7E3B1B palm. Both measure under 2.3:1 on this backdrop, which is the whole reason
	// the icon lifts them
	coconut: () => {
		const sh = officialShapes('coconut-official.svg');
		return wrap('0 0 362 362', `<path fill="#000000" d="${sh[0].d}"/>`
			+ `<path fill="#7E3B1B" d="${sh[1].d}"/>`);
	},
	// simple-icons' whole mark — frame, mascot, face details and the "COCOS" letters the
	// icon drops
	cocos: () => wrap('0 0 24 24', `<path fill="#55C2E1" d="${icon('cocos').path}"/>`),
	codekit: () => null,
	// GitHub's own file, in the file's own #24292F: the frame re-wound so the counter
	// punches, and the "QL" inside it
	codeql: () => {
		const sh = officialShapes('codeql-github.svg');
		const fr = subpaths(sh[1].d);
		return wrap('0 0 16 16', `<path fill="#24292F" d="${rewind(fr[0], -1) + rewind(fr[1], 1)}"/>`
			+ `<path fill="#24292F" d="${sh[0].d}"/>`);
	},
	// the cup as the brand draws it: unfilled in the file, i.e. black
	coffeescript: () => wrap('-76 212 458 369', officialShapes('coffeescript-official.svg')
		.map(s => `<path fill="#2F2625" d="${s.d}"/>`).join('')),
	coloredpetrinets: () => null,
	command: () => null,
	// the whole lockup with the cube's gradients resolved: the JFrog frog, the divider and
	// the wordmark the icon drops, and the cube it keeps
	conan: () => wrap('0 0 1400 264', officialShapes('conan-official.svg')
		.filter(s => s.fill !== 'none' && s.d.length > 20)
		.map(s => `<path fill="${flat(s)}" d="${s.d}"/>`).join('')),
	confluence: () => fileSvg('0 0 24 24', 'confluence-atlassian.svg', ['#1868DB', '#FFFFFF']),
	context: () => null,
	controller: () => null,
	// the media kit's own icon, in the black brand-colors.json records — dim here on
	// purpose, which is what the lift answers
	crystal: () => wrap('0 0 193.2 206.7', officialShapes('crystal-official.svg')
		.filter(s => s.fill !== 'none')
		.map(s => `<path fill="#000000" d="${s.d}"/>`).join('')),
	// Microsoft's .NET logo as its own file draws it: the field is a <rect width="456"
	// height="456" fill="#512BD4"> in the source, re-emitted here as the identical path
	// (the format conversion A01 does with its own rects() reader), and the four ".NET"
	// glyphs knocked out of it in white — the E and the T are what the icon's
	// prettier-rider reduction drops
	csproj: () => {
		const sh = officialShapes('dotnet-official.svg');
		return wrap('0 0 456 456', '<path fill="#512BD4" d="M0 0h456v456H0z"/>'
			+ sh.map(s => `<path fill="#FFFFFF" d="${s.d}"/>`).join(''));
	},
	// the brand's SMALL-SIZE cut, which is what ships; the standard cut is in the study
	cssmap: () => fileSvg('0 0 1000 1000', 'css-official-small.svg'),
	// the fills run over the FILTERED layer list, so the dropped fill:none rectangle is
	// not in them: slice then seeds
	cucumber: () => fileSvg('0.06 0.56 32.5 37.13', 'cucumber-official.svg', ['#00A818', '#FFFFFF']),
	// the eye and the wordmark; the file's two wordmark layers carry no fill of their own
	cuda: () => wrap('0 0 974.7 179.7', officialShapes('nvidia-official.svg')
		.map((s, i) => `<path fill="${i === 2 ? '#76B900' : '#FFFFFF'}" d="${s.d}"/>`).join('')),
	// the brand's LOGOTYPE lockup, in the site's own $c-blue: the letters and the two rings
	// the icon replaces with CUE's own four-band icon
	cue: () => wrap('0 0 128 128', officialShapes('cue-official.svg')
		.map(s => `<path fill="#232A68" d="${s.d}"/>`).join('')),
	// the favicon's DARK-MODE reading, which is what ships: the four arcs at their shared
	// solid stop and the "cy" white (the "y" polygon re-emitted as a path)
	'cypress-spec': () => {
		const sh = officialShapes('cypress-official.svg');
		const y = polyPaths('cypress-official.svg')[0];
		return wrap('0 0 48 48', [sh[0], sh[1], sh[2], sh[4]].map(s => `<path fill="#58D09E" d="${s.d}"/>`).join('')
			+ `<path fill="#FFFFFF" d="${sh[3].d}"/><path fill="#FFFFFF" d="${y.d}"/>`);
	},
	// the drop shadow the icon leaves out is a gradient, so the pane shows the mark without
	// it, in the file's own gradient stops rather than the set's python hexes
	cython: () => {
		const sh = officialShapes('cython-official.svg');
		return wrap('0 0 207 196', `<path fill="#646464" d="${sh[1].d}"/>`
			+ `<path fill="#306998" d="${sh[2].d}"/><path fill="#FFD43B" d="${sh[3].d}"/>`);
	},
	dal: () => wrap('0 0 255 255', officialShapes('al-microsoft.svg')
		.map(s => `<path fill="#2EA98E" d="${s.d}"/>`).join('')),
	// the six drawing layers as the brand paints them. The file's seventh layer is a
	// white-to-white gradient gloss over the whole mark: L8 has no gradients, and
	// flattening it to either stop would paint the pane solid white
	'dartlang-generated': () => wrap('0 0 1080 1080', officialShapes('dart-official.svg')
		.slice(0, 6).map(s => `<path fill="${s.fill}" d="${s.d}"/>`).join('')),
	denizenscript: () => null,
	// the dark-background cut as fetched: the eight squares and the wordmark
	devenv: () => fileSvg('0 0 480 480', 'devenv-official.svg'),
	// the nib as the brand draws it, re-wound so the counters punch under nonzero fill
	dhall: () => {
		const sp = subpaths(officialShapes('dhall-official.svg')[0].d);
		return wrap('0 0 200 200',
			`<path fill="#484848" d="${sp.map((d, i) => rewind(d, i === 0 ? 1 : -1)).join('')}"/>`);
	},
	// the mark that was declined: DinoPHP's own vector, shown so the decline can be checked
	dinophp: () => wrap('0 0 1424 1368', officialShapes('dinophp-official.svg')
		.filter(s => s.d.length > 20)
		.map(s => `<path fill="${s.fill || '#E92744'}" d="${s.d}"/>`).join(''))
};

// =============================================================================
// STUDIES — the measured alternatives behind the calls that needed one
// =============================================================================
//
// The pilot's docker deck is the precedent and tranche 1 followed it: where a
// reduction or a decline is a judgement, the rejected candidates get rendered next
// to the shipped one at a true 16 px, so the verdict can be checked instead of
// believed.

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
		id: 'A02-t2-study',
		width: 1160, height: 1180,
		html: (place) => {
			const cl = officialShapes('clojurescript-vsicons.svg');
			const cn = officialShapes('coconut-official.svg');
			const sp = subpaths(icon('cocos').path);
			const small = officialShapes('css-official-small.svg');
			const std = officialShapes('css-official.svg');
			const cueI = officialShapes('cue-official-icon.svg');
			const cueL = officialShapes('cue-official.svg');
			const cards = [
				card('clojurescript &mdash; SHIPPED<br>whole mark, letters at 0.60 px',
					place(cl.map(s => ({ d: s.d, fill: s.fill })), ENV.open))
					.replace('class="c"', 'class="c win"'),
				card('clojurescript &mdash; letters dropped<br>REJECTED: a bare ring says nothing',
					place([5, 6].map(i => ({ d: cl[i].d, fill: cl[i].fill })), ENV.open)),
				card('coconut &mdash; SHIPPED<br>ring + palm, both inks lifted',
					place([{ d: cn[0].d, fill: lift('#000000') }, { d: cn[1].d, fill: lift('#7E3B1B') }],
						ENV.compact))
					.replace('class="c"', 'class="c win"'),
				card('coconut &mdash; ring dropped (casc\'s move)<br>REJECTED: loses the mark\'s outer form',
					place([{ d: cn[1].d, fill: lift('#7E3B1B') }], ENV.tall)),
				card('coconut &mdash; official inks, no lift<br>REJECTED: 1.13:1 and 2.24:1',
					place([{ d: cn[0].d, fill: '#000000' }, { d: cn[1].d, fill: '#7E3B1B' }], ENV.compact)),
				// the mascot's eyes are COUNTERS in the mark's single path, so both cocos cards
				// pass their subpaths as ONE part: studies.mjs emits a <path> per part, and
				// four separate paths would fill the eyes in
				card('cocos &mdash; SHIPPED<br>mascot + eyes, runs 0.40 / 0.95 / 1.55',
					place([{ d: [1, 2, 7, 8].map(i => sp[i]).join(''), fill: '#55C2E1' }], ENV.compact))
					.replace('class="c"', 'class="c win"'),
				card('cocos &mdash; the whole mark<br>REJECTED: frame + letters, runs 0.15 / 0.40 / 0.45',
					place([{ d: sp.join(''), fill: '#55C2E1' }], ENV.compact)),
				card('cssmap &mdash; SHIPPED<br>the brand\'s SMALL cut, letters 1.40 px',
					place([{ d: small[0].d, fill: '#663399' }, { d: small[1].d, fill: WHITE }], ENV.compact))
					.replace('class="c"', 'class="c win"'),
				card('cssmap &mdash; the standard cut<br>REJECTED: letters 1.05 px, under the floor',
					place([{ d: std[0].d, fill: '#663399' }, { d: std[1].d, fill: WHITE }], ENV.compact)),
				card('cue &mdash; SHIPPED<br>the brand\'s own icon, walls 1.15&ndash;1.35 px',
					place(cueI.map(s => ({ d: s.d, fill: lift('#232A68') })), ENV.compact))
					.replace('class="c"', 'class="c win"'),
				card('cue &mdash; the brand\'s logotype lockup<br>REJECTED: rings 0.30 px, letters 0.40 px',
					place(cueL.map(s => ({ d: s.d, fill: lift('#232A68') })), ENV.compact))
			];
			return page(
				'<h2>The five reductions in tranche 2 that are judgements, measured</h2>'
				+ '<p>Every card is the real engine\'s fit at a true 16&nbsp;px. '
				+ '<b>clojurescript</b>: the brand publishes this mark as PNG only and its "cljs" '
				+ 'runs 0.60&nbsp;px at the shipped fit &mdash; dropping the letters buys a clean '
				+ 'ring that says nothing about ClojureScript and would sit beside four other '
				+ 'rings in this slice, so the letters stay and the verdict carries the cost. '
				+ '<b>coconut</b>: every ink in the mark is under the 3.0:1 trigger '
				+ '(#000000 at 1.13, #7E3B1B at 2.24), so the lift fires twice; the third card is '
				+ 'what the official inks look like on the product backdrop. <b>cocos</b>: the '
				+ 'frame and the seven "COCOS" letters cost the mascot its whole envelope. '
				+ '<b>cssmap</b>: the CSS logo\'s own repository publishes a SMALL-SIZE cut, and '
				+ 'its letters clear L5\'s official-forced floor where the standard cut\'s do not '
				+ '&mdash; the brand did the prettier rider\'s work itself. <b>cue</b>: CUE '
				+ 'publishes both an icon and a logotype lockup; the icon is the brand\'s own '
				+ 'small-size answer and the only one that survives. Judge the 16&nbsp;px '
				+ 'column.</p>', cards);
		}
	},
	{
		id: 'A02-t2-collapse-study',
		width: 1000, height: 560,
		html: (place) => {
			const dn = officialShapes('dinophp-official.svg').filter(s => s.d.length > 20);
			const dinoParts = dn.map(s => ({ d: s.d, fill: s.fill || '#E92744' }));
			const cards = [
				card('dinophp &mdash; SHIPPED<br>the generic-code glyph',
					place(genericCode().map(d => ({ d, fill: NEUTRAL })), CODE_ENV))
					.replace('class="c"', 'class="c win"'),
				card('dinophp &mdash; the brand\'s own vector<br>REJECTED: 6,461 B vs L8\'s 4 KB cap',
					place(dinoParts, ENV.compact)),
				card('dinophp &mdash; the same mark, opened up<br>REJECTED: runs 0.40 / 0.85 / 1.50 px',
					place(dinoParts, ENV.open)),
				card('for scale &mdash; tranche 1\'s rejected Buck deer<br>ran 0.22 / 0.38 / 0.88 px',
					place(officialShapes('buck-official.svg').filter(s => s.fill !== 'none')
						.map(s => ({ d: s.d, fill: '#F69635' })), ENV.tall))
			];
			return page(
				'<h2>dinophp &mdash; a mark with a real vector, declined on two hard numbers</h2>'
				+ '<p>Three of this tranche\'s seven bracket collapses are concepts whose mark '
				+ 'EXISTS. <b>codekit</b> and <b>denizenscript</b> are raster-only, which L2\'s '
				+ 'fidelity rule ends before legibility is reached. <b>dinophp</b> is the '
				+ 'interesting one: DinoPHP publishes a real vector of its red dinosaur '
				+ '(<code>DinoPHP/vscode-bubble images/DinoPHP-icon.svg</code>), and it still '
				+ 'cannot ship. Fitted at the compact envelope the icon is <b>6,461 bytes</b> '
				+ '&mdash; 60% past L8\'s 4&nbsp;KB HARD CAP, which is a fail and not an advisory '
				+ '&mdash; and its sustained ink runs are <b>0.40 / 0.80 / 1.40&nbsp;px</b>. Every '
				+ 'layer is a body part, so there is no sub-pixel detail to delete; opening the '
				+ 'envelope moves the runs to 0.40 / 0.85 / 1.50 and the bytes to 6,507. The '
				+ 'fourth card is tranche 1\'s Buck&nbsp;2 deer, rejected on the same grounds, for '
				+ 'scale.</p>', cards);
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
		title: 'cuda wears NVIDIA\'s eye — the company-mark rider, used for the third time',
		rule: 'L2 / the company-mark rider',
		subjects: ['cuda'],
		text: 'A <code>.cu</code> or <code>.cuh</code> is a CUDA C++ source. CUDA is NVIDIA\'s '
			+ 'language, NVIDIA\'s toolkit and NVIDIA\'s trademark, and it has NO symbol of its '
			+ 'own — NVIDIA brands it as a "CUDA" wordmark set beside the corporate eye. So the '
			+ 'rider ratified at the A01 gate (a format created and owned by a company may wear '
			+ 'that company\'s mark, safetensors &rarr; Hugging Face, bolt &rarr; Firebase) is '
			+ 'what puts a mark on this file type at all, and this is its third use after '
			+ 'safetensors and tranche 1\'s cds. <b>The sourcing is the brand\'s own:</b> '
			+ 'nvidia.com serves the eye as a vector in its brochure assets '
			+ '(<code>nvidia-logo-black.svg</code>, an Illustrator export titled '
			+ '"NVIDIA_Logo_V"); the wordmark and the registered-trademark glyph are dropped. '
			+ 'vscode-icons and Material both draw the same eye for cuda, which is corroboration '
			+ 'and not the source. <b>What to weigh:</b> a <code>.cu</code> file now carries a '
			+ 'company logo rather than a language mark, and NVIDIA\'s eye will read as "NVIDIA" '
			+ 'rather than "CUDA" to anyone who knows it. The alternative is the bracket glyph, '
			+ 'which says nothing at all.'
	},
	{
		title: 'cssmap ships CSS\'s own letter plate, and its field measures 2.21:1',
		rule: 'R1 / L5 / L6',
		subjects: ['cssmap'],
		text: 'A <code>.css.map</code> is a CSS source map, so CSS\'s mark applies, and CSS has '
			+ 'had an official one since 2024: the rebeccapurple (#663399) rounded field with '
			+ '"CSS" knocked out of it, published CC0 at <code>CSS-Next/logo.css</code> and '
			+ 'carried by simple-icons as <code>css</code>. Two things to check before agreeing. '
			+ '<b>The field:</b> #663399 measures <b>2.21:1</b> against #121314 — under the 3.0:1 '
			+ 'lift trigger — so on the product backdrop the plate is dim and the white letters '
			+ 'carry the mark. That is A01\'s aspx exactly (a #512BD4 field at 2.34:1, passed at '
			+ 'the gate) and it is treated identically: official colours verbatim, no lift, '
			+ 'because lifting a field to L&nbsp;88 leaves white ink on near-white. <b>The '
			+ 'letters:</b> the repository publishes THREE cuts and this icon takes '
			+ '<code>css.small.svg</code>, the brand\'s own small-size variant, whose letters run '
			+ '1.10 / 1.25 / 1.40&nbsp;px against the standard cut\'s 0.85 / 0.95 / 1.05 — over '
			+ 'L5\'s official-forced floor where the standard cut is under it. The brand did the '
			+ 'prettier rider\'s work itself; both are in <code>proofs/A02-t2-study.png</code>. '
			+ '<b>One consequence:</b> when a later slice reaches <code>css</code> — and it will, '
			+ 'plus scss, less and postcss — the ids will want the same mark and will have to be '
			+ 'declared a family across slices.'
	},
	{
		title: 'codeql takes GitHub\'s geometry and the Marketplace icon\'s blue, not the file\'s gray',
		rule: 'L2 / L6',
		subjects: ['codeql'],
		text: 'GitHub publishes a mark for CodeQL itself — <code>github/vscode-codeql</code> '
			+ 'ships <code>media/logo.svg</code>, a rounded-square frame with "QL" in it — so the '
			+ 'company-mark rider is not needed here. What IS a judgement is the colour. That '
			+ 'file paints the mark <b>#24292F</b>, GitHub\'s light-UI ink, which measures '
			+ '<b>1.27:1</b> against #121314: on the product backdrop it is not there, and the '
			+ 'lift would put CodeQL\'s mark at L&nbsp;88, a near-white GitHub does not print. The '
			+ 'same directory holds <code>media/VS-marketplace-CodeQL-icon.png</code>, the product '
			+ 'icon the Marketplace shows, and a colour census of it returns <b>#1E7DFF</b> on '
			+ 'white — the same mark in the brand\'s full-colour form, at 4.81:1. So the geometry '
			+ 'comes from the vector and the colour from the brand\'s own colour publication of '
			+ 'the same mark, which is the npm/git/go source-of-truth rule and the move tranche 1 '
			+ 'made for cakephp. vscode-icons independently draws this mark in the same blue. '
			+ '<b>To overturn:</b> rule that the file\'s own gray ships and it lifts to #DCE0E4 in '
			+ 'one edit.'
	},
	{
		title: 'confluence ships Atlassian\'s CURRENT tile mark, not the sails every icon set draws',
		rule: 'L2 sourcing',
		subjects: ['confluence'],
		text: 'A <code>.confluence</code> file is Confluence wiki markup, so the product\'s own '
			+ 'mark applies. <b>The sourcing is unusual and worth recording:</b> Atlassian '
			+ 'publishes no downloadable SVG on its brand pages — the brand portal is a '
			+ 'JavaScript application — but it publishes its logos AS CODE, in '
			+ '<code>@atlaskit/logo</code> (Apache-2.0, Atlassian Pty Ltd, its own design system '
			+ 'package), where every product mark is an inline SVG string. Version 21.6.0\'s '
			+ '<code>confluence/icon.js</code> is the CURRENT mark: a #1868DB rounded tile with '
			+ 'the two white sails on it. <b>What that changes:</b> vscode-icons, devicon and '
			+ 'gilbarbara all draw the LEGACY mark — the standalone gradient-blue sails with no '
			+ 'tile — which is what most people picture. Atlassian retired it; the same package '
			+ 'still carries it under <code>legacy-logos/</code>. This icon follows the brand '
			+ 'rather than the icon sets, which means a plate mark (R8 scores its glyph, like '
			+ 'abap and aspx) rather than a free silhouette. <b>To overturn:</b> say the legacy '
			+ 'sails ship and they do, from the same package.'
	},
	{
		title: 'csproj joins A01\'s .NET family — five ids now look the same',
		rule: 'working rule 1',
		subjects: ['csproj'],
		text: 'A <code>.csproj</code> is an MSBuild project file for a .NET project, and A01\'s '
			+ 'fix round already ruled asp and aspx one family on Microsoft\'s own CC0 .NET logo, '
			+ 'reduced by the prettier rider to the official dot and N at 2.5x. csproj is the same '
			+ 'family and ships the same bytes. <b>Branch (a) was checked and is not empty:</b> '
			+ 'vscode-icons draws a csproj icon — the VISUAL STUDIO ribbon with a green "C#" laid '
			+ 'over it. It is declined because that is the IDE\'s corporate mark composed with a '
			+ 'language monogram: Visual Studio does not own <code>.csproj</code> (MSBuild does, '
			+ 'and dotnet build reads it without an IDE anywhere), and Microsoft publishes no '
			+ 'csproj mark. <b>What it costs in the tree:</b> <code>.asp</code>, '
			+ '<code>.aspx</code>, <code>.ascx</code>, <code>.asa</code> and <code>.csproj</code> '
			+ 'are now one picture. That is rule 1(b) working as written. <b>To overturn:</b> rule '
			+ 'that the C# language mark may stand for its project file and csproj gets its own '
			+ 'hunt.'
	},
	{
		title: 'dal is A01\'s al-dal under a second id — the roster gives both the same extension',
		rule: 'working rule 1',
		subjects: ['dal'],
		text: 'Recorded because it looks like a duplicate and is one. The roster gives A02\'s '
			+ '<code>dal</code> the extension <code>.dal</code> AND the language id '
			+ '<code>dal</code>, and gives A01\'s <code>al-dal</code> the extension '
			+ '<code>.dal</code> — two concepts, one file type, which is the asp/aspx situation '
			+ 'A01 already ruled on. <b>What a .dal is</b> comes from vscode-icons\' own icon '
			+ 'requests: #1159 asks for the AL icon "via language id <code>al</code>, '
			+ '<code>dal</code>", and #3125 describes <code>.dal</code> as "AL Language definition '
			+ 'files ... reconstructed on the fly by the AL Language". So it is Microsoft\'s AL, '
			+ 'one file type down, and it takes Microsoft\'s own AL mark — the same bytes as '
			+ 'A01\'s al and al-dal and tranche 1\'s c-al. <b>Branch (a) is empty twice over:</b> '
			+ 'vscode-icons\' <code>file_type_dal.svg</code> (the one registered against the '
			+ 'language id) is a BAR CHART with a rising arrow, a generic analytics metaphor, and '
			+ 'its <code>file_type_al_dal.svg</code> is the AL monogram recoloured dusty red, '
			+ 'which A01 already declined as the theme\'s own invention. <b>In the tree</b> four '
			+ 'ids now carry Microsoft\'s AL lockup.'
	},
	{
		title: 'clojurescript keeps a wordmark that does not resolve at 16 px',
		rule: 'L5 / the gestalt erratum',
		subjects: ['clojurescript'],
		text: 'The flag most likely to be argued with in this tranche. ClojureScript\'s mark is '
			+ 'the "cljs" logotype inside a two-tone ring, and clojurescript.org publishes it as '
			+ 'PNG only (<code>images/cljs-logo-icon-256.png</code>), so the geometry is '
			+ 'vscode-icons\' faithful vector — whose two hexes a colour census of the official '
			+ 'PNG confirms. <b>The numbers:</b> at the open envelope (13.6&times;13.6, the widest '
			+ 'the mass system allows and itself forced by L5) the mark\'s sustained ink runs are '
			+ '0.50 / 0.70 / 0.95&nbsp;px, and measured alone the four letters run '
			+ '<b>0.45 / 0.55 / 0.60&nbsp;px</b> — half of abap\'s SAP letters, which the A01 gate '
			+ 'passed at 1.00&ndash;1.25. At 16&nbsp;px they are a smudge. <b>Why they stay:</b> '
			+ '"cljs" IS the mark. Strip it and what is left is a bare ring, which says nothing '
			+ 'about ClojureScript and would join four other rings in this slice alone (cue, '
			+ 'cypress-spec, coconut, and tranche 1\'s chef) — the gestalt failure the pilot '
			+ 'ruling names. Both builds are in <code>proofs/A02-t2-study.png</code>. <b>To '
			+ 'overturn:</b> say the ring ships alone and it does, in one edit — or rule that '
			+ 'ClojureScript may wear Clojure\'s own mark (the interlocking circles), which is the '
			+ 'family reading and would need a <code>clojure</code> subject to be the base.'
	},
	{
		title: 'dinophp\'s mark has a real vector and is declined on L8\'s byte cap and L5',
		rule: 'L8 / L5 / working rule 2',
		subjects: ['dinophp'],
		text: 'The first subject in the set where a BRAND-TIER vector is rejected by the format '
			+ 'law rather than by legibility alone. A <code>.bubble</code> is a template for the '
			+ 'Bubble engine of the DinoPHP framework, and DinoPHP publishes its red dinosaur at '
			+ '<code>DinoPHP/vscode-bubble images/DinoPHP-icon.svg</code> — seven paths, #E92744 '
			+ 'and white, and the drawing Material traces. <b>The two numbers:</b> fitted at the '
			+ 'compact envelope the icon is <b>6,461 bytes</b>, 60% past L8\'s <b>4&nbsp;KB hard '
			+ 'cap</b> (a fail, not the 2&nbsp;KB advisory), and its sustained ink runs are '
			+ '<b>0.40 / 0.80 / 1.40&nbsp;px</b> — tranche 1\'s rejected Buck&nbsp;2 deer '
			+ '(0.22 / 0.38 / 0.88) in the same territory. <b>Why there is no reduction:</b> every '
			+ 'layer is a body part — head, neck, tail, two legs, eye — so nothing sub-pixel can '
			+ 'be deleted; dropping one removes a limb. Opening the envelope to 13.6&times;13.6 '
			+ 'moves the runs to 0.40 / 0.85 / 1.50 and the bytes to 6,507. All of it is rendered '
			+ 'in <code>proofs/A02-t2-collapse-study.png</code>. <b>To overturn:</b> rule that the '
			+ '4&nbsp;KB cap may be raised for a full-colour animal, and the dinosaur ships as '
			+ 'built.'
	},
	{
		title: 'codekit collapses to the bracket glyph, and its own mark IS a bracket pair',
		rule: 'L2 sourcing / working rule 2',
		subjects: ['codekit'],
		text: 'Written down because the irony is real and a reviewer should see it rather than '
			+ 'discover it. CodeKit\'s mark is a pair of black angle brackets on an orange tile — '
			+ 'the same object the set\'s generic-code glyph draws in gray. It is published as '
			+ 'RASTER ONLY: codekitapp.com serves <code>images/apple-touch-icon.png</code> and '
			+ '<code>images/favicon-32.png</code> (its other SVGs are feature icons), and '
			+ '<code>github.com/bdkjones/codekit</code> is an issue tracker with no artwork in it. '
			+ 'Tracing a raster is what L2 forbids on FIDELITY grounds — the one rule the D22 '
			+ 'amendment does not reach. <b>vscode-icons is not a way round it:</b> its file draws '
			+ 'the brackets on a BLACK DISC in inverted colours (its own commit message says '
			+ '"Convert PNG to SVG"), and that disc measures 1.13:1 against #121314, so what would '
			+ 'arrive is two white brackets on nothing — which is the collapse glyph with extra '
			+ 'steps. <b>What the collapse costs, precisely:</b> the tile and the orange, not the '
			+ 'idea. <b>To overturn:</b> rule that an official tile may be re-drawn as a plate '
			+ 'under traced bracket geometry, and codekit ships branded.'
	},
	{
		title: 'coconut lifts BOTH of its inks — the first two-ink lift in the set',
		rule: 'L2 lift / L6',
		subjects: ['coconut'],
		text: 'Coconut\'s mark is a black ring around a lambda whose upper arm is a palm frond, '
			+ 'and every ink in it is too dark for this backdrop: <b>#000000 at 1.13:1</b> (the '
			+ 'ring) and <b>#7E3B1B at 2.24:1</b> (the palm), both under the 3.0:1 trigger. The '
			+ 'lift is opt-in per subject and here it is taken TWICE, each ink going to L&nbsp;88 '
			+ 'with hue and saturation intact (#E0E0E0 and #F4D9CD). <b>What that costs:</b> the '
			+ 'two inks now sit at the same lightness, so the mark is told apart by hue and shape '
			+ 'rather than by tone — it arrives pale, where the official mark is black-and-brown '
			+ 'on white. <b>The alternatives, both rendered in '
			+ '<code>proofs/A02-t2-study.png</code>:</b> dropping the invisible ring the way '
			+ 'tranche 1\'s casc drops its black field (buys runs of 1.00 / 1.40 / 1.50&nbsp;px '
			+ 'and loses the mark\'s outer form), or shipping the official inks unlifted (a mark '
			+ 'you cannot see). <b>Sourcing note, also new:</b> the vector is the BRAND\'s own '
			+ 'potrace of its own logo — <code>coconut-lang.org/safari-pinned-tab.svg</code>, '
			+ 'published for Safari pinned tabs — because evhub/coconut contains no image files at '
			+ 'all. It is single-colour, which is why the frond\'s green (#076007) is lost: trunk '
			+ 'and frond are one contour in it, and splitting them would be drawing.'
	},
	{
		title: 'cypress-spec ships the brand\'s own DARK-MODE artwork',
		rule: 'L2 / L6',
		subjects: ['cypress-spec'],
		text: 'A find worth recording because it is the first time a brand answered the lift '
			+ 'question for us. <code>cypress.io/favicon.svg</code> carries a <code>&lt;style&gt;'
			+ '</code> block with a <code>@media (prefers-color-scheme: dark)</code> section: on a '
			+ 'dark ground Cypress repaints its "cy" <b>white</b> (from #1B1E2E, which measures '
			+ '1.13:1 here and would otherwise have needed the lift) and swaps one arc\'s gradient '
			+ 'from #58D09E&nbsp;&rarr;&nbsp;#1B1E2E to #58D09E&nbsp;&rarr;&nbsp;#FFFFFF. This '
			+ 'icon ships that reading, so nothing about its colour is our invention. The four '
			+ 'arcs flatten to the solid stop #58D09E they share, and the "y" is a '
			+ '<code>&lt;polygon&gt;</code> re-emitted as a path (the casc conversion). <b>Two '
			+ 'notes:</b> the ring\'s wall is 1.05&nbsp;px, under L5\'s official-forced floor, '
			+ 'which is what makes the verdict marginal; and this is the SPEC id wearing the base '
			+ 'Cypress mark, which is not a family declaration because no <code>cypress</code> '
			+ 'subject exists in the pilot or an approved slice yet — when one does, the two will '
			+ 'have to be declared one family, the same note tranche 1 leaves for '
			+ 'bucklescript/rescript.'
	},
	{
		title: 'dartlang-generated ships Dart\'s base mark, and the themes\' recolours are declined',
		rule: 'working rule 1',
		subjects: ['dartlang-generated'],
		text: '<code>.g.dart</code> and <code>.freezed.dart</code> are the files build_runner '
			+ 'writes beside a Dart source, so this is Dart\'s own file type. Rule 1 asks branch '
			+ '(a) first — an established NON-LETTER variant glyph in the source themes — and both '
			+ 'themes have one: Material paints the Dart mark GRAY for generated files, '
			+ 'vscode-icons paints it RED. Both are declined for the reason A01 declined al-dal\'s '
			+ 'dusty red: a theme recolouring a brand\'s mark is the theme\'s invention, where the '
			+ '(recolour) branch is for brands that draw their own variants that way (TOTVS\'s '
			+ 'advpl). So the base mark ships under this id, from Dart\'s own '
			+ '<code>dart-lang/site-shared</code> vector. <b>Two consequences:</b> a '
			+ '<code>.g.dart</code> and a <code>.dart</code> will look identical once a later '
			+ 'slice ships <code>dart</code> — and at that point the two ids must be declared a '
			+ 'family across slices, because nothing in the set can be the base today. <b>What was '
			+ 'dropped:</b> the file\'s white gradient gloss and two highlight slivers that render '
			+ 'under the mark\'s own dark face; both builds were compared pixel for pixel.'
	},
	{
		title: 'cython paints the Python logo inside its C in the SET\'s python hexes',
		rule: 'L2 / L6',
		subjects: ['cython'],
		text: 'Cython\'s own vector paints its two snakes with Python\'s own gradients '
			+ '(#306998&nbsp;&rarr;&nbsp;#5A9FD4 and #FFD43B&nbsp;&rarr;&nbsp;#FFE873). Flattening '
			+ 'them per the chrome ruling would put <b>two different Python blues in one set for '
			+ 'one logo</b>, because the pilot already ships the identical mark — '
			+ '<code>python</code> — at #3776AB / #FFD43B, which is brand-colors.json\'s python '
			+ 'entry and the source of truth. So the snakes take the set\'s python hexes and the '
			+ '"C", which is Cython\'s own and not Python\'s, keeps the file\'s #646464. <b>One '
			+ 'number worth seeing:</b> that #646464 measures <b>3.14:1</b> against #121314 — over '
			+ 'the 3.0:1 lift trigger by four hundredths. It is not lifted, and how close that is '
			+ 'is recorded rather than hidden. <b>To overturn:</b> rule that the artwork\'s own '
			+ 'stops win over the set\'s hex and the snakes go to #306998, a blue that measures '
			+ '3.19:1.'
	},
	{
		title: 'devenv, dartlang-generated and coala keep dark tones the backdrop swallows',
		rule: 'L5 contrast duty',
		subjects: ['devenv', 'dartlang-generated', 'coala', 'cssmap'],
		text: 'Four marks in this tranche carry a tone under the 3.0:1 lift trigger and none of '
			+ 'them is lifted. The measurements: <b>devenv</b>\'s #425C82 blue squares at '
			+ '<b>2.73:1</b>, <b>dartlang-generated</b>\'s #01579B shadow faces at <b>2.51:1</b>, '
			+ '<b>coala</b>\'s #2C3E50 nose at 1.69:1 and #37495E eye at 2.02:1, and '
			+ '<b>cssmap</b>\'s #663399 field at <b>2.21:1</b>. Each declines the lift for a '
			+ 'reason the set has already ruled on: coala\'s two print on the koala\'s own field '
			+ '(the pilot\'s dotenv erratum — ink on the mark\'s own field is never lifted); '
			+ 'dart\'s is the shaded side of a two-tone mark whose light faces measure 9.35:1 and '
			+ '8.07:1, so lifting it would invert the drawing\'s tonal order (tranche 1\'s bosque '
			+ 'reading); devenv\'s is one half of a deliberately two-tone mark whose other half is '
			+ '#FBFBFB, so lifting it would make all eight squares near-white and delete the '
			+ 'drawing; and cssmap\'s is A01\'s aspx case, where lifting the field leaves white '
			+ 'letters on near-white. <b>What it costs at 16&nbsp;px:</b> devenv reads white-first '
			+ 'with the blue squares as shadow, dart reads as a light mark with a dark fold, and '
			+ 'cssmap reads as white letters with a violet ground. That is what these marks do on '
			+ 'any dark ground.'
	},
	{
		title: 'FIVE subjects take the lift — the largest group in the set so far',
		rule: 'L2 lift (A01 erratum 2)',
		subjects: ['coconut', 'coffeescript', 'crystal', 'cue', 'dhall'],
		text: 'The contrast-derived trigger the A01 fix round ruled in (backdrop-meeting ink '
			+ 'under 3.0:1 against #121314 lifts to L&nbsp;88, hue and saturation intact) fires '
			+ 'for five of this tranche\'s twenty branded subjects, where the whole set had three '
			+ 'callers before it. The reason is a category rather than an accident: these are '
			+ 'MONOCHROME marks drawn for light pages. <b>The numbers:</b> crystal #000000 at '
			+ '1.13:1 (and brand-colors.json records that black itself), coffeescript #2F2625 at '
			+ '1.26:1, cue #232A68 at 1.42:1, dhall #484848 at 2.03:1, coconut #000000 and '
			+ '#7E3B1B at 1.13:1 and 2.24:1. <b>Two of them are worth a second look:</b> cue\'s '
			+ 'navy is the site\'s own <code>$c-blue</code>, and the brand solves the same problem '
			+ 'differently — its header prints the mark on a white disc rather than lightening it; '
			+ 'and coffeescript and crystal are inside L6\'s achromatic exemption (S&nbsp;11.7 and '
			+ 'S&nbsp;0), so their lift moves lightness only. <b>If the lift is wrong for any of '
			+ 'them</b> the alternative is a white disc behind the mark, which is a container this '
			+ 'style does not have, or an icon you cannot see.'
	},
	{
		title: 'coala drops 43 KB of the official drawing\'s own line art',
		rule: 'L8 / L5',
		subjects: ['coala'],
		text: 'coala\'s logo file is a 2015 Inkscape drawing and the honest description of it is '
			+ 'a mess: it carries the artwork TWICE (once painted with xlink-chained gradients '
			+ 'that hold no stops, once in flat fills), plus TWO black line-art layers of 17,280 '
			+ 'and 26,396 characters, plus a 0.65-opacity PNG tracing underlay in an '
			+ '<code>&lt;image&gt;</code> tag. What ships is the FLAT copy — green disc, koala '
			+ 'head, cheek shade, nose, mouth, two eyes — at 1.7&nbsp;KB. <b>The line art is '
			+ 'dropped for bruno\'s two reasons at once:</b> 43,676 characters is ten times L8\'s '
			+ '4&nbsp;KB hard cap on its own, and black measures 1.13:1 against #121314, so it '
			+ 'paints nothing a reader can see. <b>Why this is not editorconfig\'s failure:</b> '
			+ 'the pilot rejected flattening a mark that is REALLY a line drawing into a '
			+ 'silhouette; coala\'s drawing has flat colour layers of its own and they are what '
			+ 'ships — the koala keeps its shape, its shading and its face. The '
			+ '<code>&lt;image&gt;</code> underlay is stripped on fetch (L8 bans it, and a tracing '
			+ 'underlay is not part of the drawing), which is the only edit made to any fetched '
			+ 'file in this tranche.'
	},
	{
		title: 'cocos drops its frame and its wordmark — the mascot alone fills the envelope',
		rule: 'L5 / prettier rider',
		subjects: ['cocos'],
		text: 'Cocos publishes no vector (cocos.com serves CDN rasters; cocos/cocos-engine keeps '
			+ '<code>editor/dashboard/logo.png</code>), so the geometry is simple-icons\' faithful '
			+ 'vector of the mascot mark — the flame-headed character in a square frame with '
			+ '"COCOS" beneath it. Eighteen subpaths, and eleven of them go. <b>The letters:</b> '
			+ 'each is 2.4&ndash;2.9&times;3.7 units on a 24-unit canvas, about 1.5&nbsp;px tall '
			+ 'at the fit with strokes a fraction of that. <b>The frame:</b> its rule is '
			+ '0.40&nbsp;px, and holding it in the fit costs the mascot the envelope — with the '
			+ 'frame the whole mark runs 0.15 / 0.40 / 0.45&nbsp;px, without it 0.40 / 0.95 / '
			+ '1.55. That is tranche 1\'s casc reduction on the same reasoning (drop the field the '
			+ 'reader cannot see, let the symbol fill the box). <b>What is kept:</b> the head, its '
			+ 'outline and the two eyes; the six sub-pixel face details go. Both builds are in '
			+ '<code>proofs/A02-t2-study.png</code>.'
	},
	{
		title: 'RULE 2 in practice — one reused object glyph and seven brackets, three of them marks that exist',
		rule: 'working rule 2',
		subjects: ['command', 'cobol', 'codekit', 'coloredpetrinets', 'context', 'controller',
			'denizenscript', 'dinophp'],
		text: 'Eight of the twenty-eight own no usable mark — 29%, against tranche 1\'s 18% and '
			+ 'A01 tranche 2\'s 37%. <b>command</b> takes an OBJECT glyph and it is A01\'s, not a '
			+ 'new one: a <code>.command</code> file is a shell script Finder runs in Terminal, '
			+ 'which is the object <code>.bat</code> and <code>.awk</code> name, so it ships '
			+ '<code>geom.terminalGlyph</code> byte for byte across the slice boundary (Material '
			+ 'draws the ⌘ key symbol, which reads the name rather than the file). <b>Seven take '
			+ 'the bracket glyph</b>, and THREE of those are concepts whose mark exists: '
			+ '<code>codekit</code> and <code>denizenscript</code> publish theirs as raster only, '
			+ 'which L2\'s fidelity rule ends, and <code>dinophp</code> publishes a real vector '
			+ 'that fails L8\'s byte cap and L5 together (its own flag). The other four own no '
			+ 'mark at all: <code>cobol</code> is a 1959 ISO standard (vscode-icons draws a '
			+ 'triceratops, a joke about its age), <code>coloredpetrinets</code> is a formalism '
			+ 'plus ISO/IEC 15909-2, <code>context</code> is ConTeXt — whose only mark is a '
			+ 'logotype living in a FONT, tranche 1\'s cbx ruling exactly — and '
			+ '<code>controller</code> is an MVC file-naming convention. All seven payloads are '
			+ 'byte-identical to A01\'s thirteen and tranche 1\'s four, and the slice check '
			+ 'asserts that across the slice boundary.'
	},
	{
		title: 'the ambiguous names, and what the roster made them',
		rule: 'L2 / roster reading',
		subjects: ['command', 'controller', 'context', 'devenv', 'cssmap', 'cue', 'cocos'],
		text: 'Recorded because a wrong reading here would have put a real brand\'s mark on the '
			+ 'wrong file type, and each of these was checked rather than assumed. '
			+ '<b>command</b>: <code>.command</code> with no language id is the macOS shell script '
			+ 'Terminal runs on a double-click — not the ⌘ key, which is what Material draws. '
			+ '<b>controller</b>: <code>.controller.js</code>/<code>.ts</code>, icon-pack only, is '
			+ 'the MVC controller layer of an Angular/Ngrx/Qwik app — a naming convention with no '
			+ 'owner. <b>context</b>: <code>.ctx</code> with language id <code>context</code> is '
			+ 'ConTeXt, the TeX macro package; Material added its icon in the "TeX/LaTeX related '
			+ 'files" PR #3042, which is the corroboration. <b>devenv</b>: devenv.nix / devenv.lock '
			+ '/ devenv.yaml is devenv.sh, the Nix developer-environment tool — NOT Visual '
			+ 'Studio\'s devenv.exe. <b>cssmap</b>: <code>.css.map</code> is a CSS source map, so '
			+ 'CSS\'s mark applies. <b>cue</b>: <code>.cue</code> with language id '
			+ '<code>cue</code> is the CUE configuration language, not a CD cue sheet. '
			+ '<b>cocos</b>: <code>.prefab</code> / <code>.scene</code> are Cocos Creator\'s scene '
			+ 'files, so the engine\'s mark applies rather than a generic scene metaphor.'
	},
	{
		title: 'conan drops the JFrog frog its own lockup carries',
		rule: 'L2 sourcing',
		subjects: ['conan'],
		text: 'The mirror of tranche 1\'s chef flag, and it comes out the same way. Conan\'s own '
			+ 'brand file — <code>conan-io/conan .github/conan2-logo-for-dark.svg</code> — is a '
			+ 'lockup: the isometric Conan cube on the left, a divider rule, then the '
			+ '"CONAN 2.0 / C/C++ Package Manager" wordmark and the green JFROG FROG. JFrog owns '
			+ 'Conan, and the company-mark rider covers a company standing in for a format IT '
			+ 'owns — but Conan HAS its own mark, so the frog would be a parent company\'s symbol '
			+ 'standing in for a product that does not need it, which is the Progress/Chef '
			+ 'situation exactly. The cube ships; the frog, the rule and the wordmark are dropped. '
			+ '<b>The flattening:</b> the cube\'s two gradient faces take their offset-1 stop '
			+ '#21AFFF (7.65:1); the offset-0 stop #0086FD measures 5.16:1 and either would read, '
			+ 'so the chrome default stands.'
	}
];
