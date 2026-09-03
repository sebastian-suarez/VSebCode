// A01.t1.mjs — slice A01, tranche 1: the ARCHIVE and BINARY categories.
//
//   archive  android · chrome · debian · disc · vsix
//   binary   gpg · hex · jar · lib · onnx · python-misc · pytorch · safetensors
//
// Same law as the pilot (guide §5 / L1-L10, D22 R1 "True colour"): where a brand
// publishes a mark the icon IS that mark, adapted from the brand's own vector or
// a faithful CC0 trace of it, in the official colours; where no mark exists the
// concept takes the shared neutral vocabulary in one gray. Every source hunt,
// every reduction and every judgement call is recorded here and lands in the
// slice manifest and on the sheet.
//
// FIX ROUND, 2026-09-03. Sebastian ruled at the A01 gate: "I like the icons that
// are actually the real Icon... The licenses don't apply here because this is a
// personal project and will not be distributed." Licence, trademark and brand-usage
// policy therefore NO LONGER GATE SOURCING anywhere in this set, and the sourcing
// chain orders by FIDELITY alone. What did not change: L5's physics, the
// prettier-rider/gestalt reading, true colour, the letters ban, the twin audit, the
// neutral vocabulary for genuinely mark-less concepts, and the duty to record every
// source and licence verbatim — we still document what the licence IS, it just does
// not decide. This tranche rebuilt TWO subjects under it (vsix, safetensors) and
// re-hunted a third that stays neutral for a different reason (jar).
//
// SOURCE HUNT RESULT for these thirteen (fidelity order: brand SVG > a faithful
// vector of the real mark, from wherever it is licensed):
//
//   brand's own SVG   chrome (google.com/chrome), debian (debian.org/logos),
//                     pytorch (pytorch.github.io), safetensors (Hugging Face's own
//                     multi-colour logo — FIX ROUND)
//   faithful vector   vsix — Microsoft publishes the VS Code mark as raster only
//                     (the fork's own resources/ tree holds .icns and .ico and no
//                     vector), so devicon's MIT trace is the geometry (FIX ROUND)
//   simple-icons      android, gpg, onnx  — official artwork was hunted first and
//                     is unusable: Android publishes PNG only, GnuPG's artwork
//                     tree (git.gnupg.org) was serving 429/maintenance, and ONNX's
//                     own icon file is kept here as the fidelity reference but its
//                     facets are shaded grays R1 would have to carry achromatic
//   family (rule 1)   python-misc — the pilot's python master, byte for byte
//   NO MARK (rule 2)  disc, lib      -> object glyphs (optical disc, bound volume)
//                     jar            -> the generic-archive category glyph
//                     hex            -> the generic-binary category glyph
//
// jar is the one hard call left, and it is now a pure L5 call: Oracle's cup is
// sourceable and was built, and it is eight tapering brush strokes whose median ink
// run is 0.38 px. See FLAGS below.

import { subpaths, bbox, xform, roundRect, rewind } from '../pathkit.mjs';
import { opticalDisc, bookGlyph, genericArchive, genericBinary, genericCode } from '../geom.mjs';
import { NEUTRAL } from '../color.mjs';
import { officialPaths, officialShapes, icon, ENV } from '../spec-engine.mjs';
import { spec as pilotSpec } from '../sources.mjs';

const S = {};

// =============================================================================
// ARCHIVE
// =============================================================================

// --- android -------------------------------------------------------------------
// The 2019 Android brand mark: the robot HEAD — dome, two antennae, two eyes.
// Hunted for the brand's own vector first; developer.android.com publishes the
// robot as PNG (Android_Robot_100.png and friends) and android.com serves no SVG,
// so the CC0 trace is the source and its geometry is used with nothing removed:
// the eyes are counters of the same contour, so one path carries the whole mark.
S.android = {
	title: 'Android',
	brand: '#3DDC84',
	env: ENV.flat,
	source: {
		name: 'simple-icons', slug: 'android', license: 'CC0-1.0',
		url: 'https://partnermarketinghub.withgoogle.com/brands/android/visual-identity/visual-identity/logo-lock-ups',
		note: 'the robot head: one path, 3 subpaths (dome + antennae, and the two eyes '
			+ 'as counters). Brand\'s own vector hunted first and not available — the Android '
			+ 'brand pages publish the robot as PNG only'
	},
	simplifications: [],
	parts() {
		return [{ d: icon('android').path, fill: '#3DDC84' }];
	}
};

// --- chrome ----------------------------------------------------------------------
// Google publishes the mark itself: www.google.com/chrome ships chrome-logo.svg,
// a 48x48 file with five painted layers — the white ring disc, the three blades
// and the blue centre. simple-icons carries only a monochrome silhouette of it,
// so the brand's own file wins outright under L2 and R1 keeps all four colours.
//
// The blades are painted with linear gradients; L2 flattens each to its dominant
// flat stop, which here is the offset-1 stop of every gradient and reproduces
// Google's published flat palette exactly (#EA4335 / #FBBC04 / #34A853).
S.chrome = {
	title: 'Google Chrome',
	brand: '#EA4335',
	env: ENV.compact,
	source: {
		name: 'Google Chrome (brand\'s own SVG)', slug: 'chrome',
		license: 'no declared licence — Google trademark, used as the brand\'s own mark for '
			+ 'the brand\'s own file type (see flag)',
		url: 'https://www.google.com/chrome/static/images/chrome-logo.svg',
		artwork: 'chrome-official.svg',
		note: '48x48, five painted layers: #FFF ring disc r12, three gradient blades and the '
			+ '#1A73E8 centre r9.5, plus one fill:none path the file never paints. Fetched to '
			+ 'sources-svg/chrome-official.svg'
	},
	simplifications: [
		'the three blade gradients flattened to their dominant flat stops — offset 1 of each: '
		+ '#D93025->#EA4335 red, #FCC934->#FBBC04 yellow, #1E8E3E->#34A853 green (L2). Those '
		+ 'three hexes are Google\'s published flat palette',
		'the file\'s one fill:none path (the r24/r12 annulus that paints nothing) is dropped',
		'NOT simplified, and measured so you can rule on it: the official white ring between '
		+ 'the blue centre (r 9.5) and the blades (r 12) is 2.5/48 of the mark and lands on '
		+ '0.64 px at this envelope. It is kept at official proportions and renders as a light '
		+ 'seam rather than as a ring — the docker/editorconfig reading of L5 (official detail '
		+ 'the mark itself merges may fuse). Thickening it means shrinking Google\'s blue '
		+ 'centre from r 9.5 to r 7.5, a fifth of its diameter'
	],
	parts() {
		return officialShapes('chrome-official.svg')
			.filter(s => s.fill !== 'none')
			.map(s => ({ d: s.d, fill: s.fill || s.gradient[s.gradient.length - 1].color }));
	}
};

// --- debian -----------------------------------------------------------------------
// debian.org/logos publishes the Open Use Logo as openlogo-nd.svg — the swirl on
// its own, no wordmark. The file is an Illustrator export of a brush drawing: one
// long path carries the whole spiral and eleven detached specks carry the flecks
// the brush left behind. Measured at the shipped fit those specks are 0.02-0.63 px
// in their minor axis, so L5 drops them; the swirl itself is the official path with
// nothing changed.
S.debian = {
	title: 'Debian',
	brand: '#A81D33',   // brand-colors.json; the file itself ships #A80030
	env: ENV.tall,
	source: {
		name: 'Debian Open Use Logo (brand\'s own SVG)', slug: 'debian',
		license: 'LGPL-3.0-or-later or CC-BY-SA-3.0 (SPI, Inc. 1999)',
		url: 'https://www.debian.org/logos/openlogo-nd.svg',
		artwork: 'debian-official.svg',
		note: 'openlogo-nd.svg — the swirl without the "Debian" label; 12 paths in #A80030, '
			+ 'of which path 5 is the spiral and the other eleven are brush flecks. '
			+ 'brand-colors.json records Debian red as #A81D33 and that is what ships '
			+ '(npm/git/go precedent). Fetched to sources-svg/debian-official.svg'
	},
	simplifications: [
		'the eleven detached brush flecks (official paths 0-4 and 6-11) dropped: at the fit '
		+ 'this envelope allows their minor axes measure 0.02-0.63 px — every one of them under '
		+ 'two thirds of a pixel. The spiral, official path 5, is untouched',
		'official #A80030 replaced by brand-colors.json\'s #A81D33 for the PRIMARY hex, per the '
		+ 'colour source-of-truth rule the pilot ratified on npm, git and go'
	],
	parts() {
		const p = officialPaths('debian-official.svg');
		return [{ d: p[5].d, fill: '#A81D33' }];
	}
};

// --- disc --------------------------------------------------------------------------
// RULE 2, object metaphor. dmg / iso / vmdk / qcow are disk IMAGES; no brand owns
// the concept, and the object it names is an optical disc. One sub-shape: a ring
// with the spindle hole punched out.
S.disc = {
	title: 'Disc image (neutral glyph)',
	brand: NEUTRAL,
	neutral: true,
	env: { w: 13.2, h: 13.2 },
	source: {
		name: 'none — neutral glyph vocabulary', slug: null, license: null, url: null,
		note: 'no brand owns disk images; the optical disc is a new object glyph in the set\'s '
			+ 'own vocabulary (working rule 2), authored in geom.mjs as opticalDisc()'
	},
	simplifications: [],
	parts() {
		return [{ d: opticalDisc(), fill: NEUTRAL }];
	}
};

// --- vsix ---------------------------------------------------------------------------
// REBUILT IN THE FIX ROUND (2026-09-03). Flag 3 declined Microsoft's VS Code ribbon
// on three grounds and every one of them was a LICENCE ground: no citable terms, no
// simple-icons entry after the trademark removal, and "stamping Microsoft's product
// mark on a file type is a call for you". The ruling makes all three non-binding, so
// the mark that honestly applies to a .vsix is the one that ships.
//
// SOURCING, by fidelity: Microsoft publishes the VS Code icon as raster only — the
// fork's own resources/ tree carries code.icns and code.ico and no vector anywhere,
// and code.visualstudio.com serves PNG. devicon's MIT vector is a faithful trace of
// the same drawing and is what the geometry comes from.
//
// WHAT L8 FORCES, and it turned out to cost almost nothing. The file paints the mark
// as three tonal wedges (#0065A9 / #007ACC / #1F9CF0) composited through an SVG
// <mask> whose own path is the official silhouette. L8 bans masks and the pipeline
// has no boolean intersect, so the wedges cannot be TRIMMED to that silhouette — but
// they were built both ways and the difference was measured on a 512 px raster
// rather than guessed:
//   · the three wedges, untrimmed, against the mask's own silhouette: IoU 0.9910,
//     with 0.28% of the wedges' ink outside the silhouette and 0.62% of the
//     silhouette not covered. At 16 px that is a fraction of one pixel on the
//     rounded corners;
//   · the silhouette on its own is exact, and single-tone.
// R1's law is "official colours verbatim, multi-colour kept", and giving up two of
// three official tones to buy back 0.3% of area is the wrong trade. The wedges ship.
//
// (Recorded because the first build of this subject got it wrong: the mask path's
// two subpaths are wound the SAME way, so under nonzero fill the triangular notch
// does not punch and the mark comes out as a solid blob with 11% too much ink. Both
// are in proofs/license-freed-study.png.)
S.vsix = {
	title: 'VS Code extension package',
	brand: '#007ACC',
	env: ENV.compact,
	source: {
		name: 'Visual Studio Code (faithful vector — devicon)', slug: 'vscode',
		license: 'MIT (devicons/devicon); the mark itself is a Microsoft trademark. Recorded '
			+ 'and NOT gating — the fix-round ruling makes licence and trademark non-binding '
			+ 'for this personal, non-distributed build',
		url: 'https://github.com/devicons/devicon/blob/master/icons/vscode/vscode-original.svg',
		artwork: 'vscode-devicon.svg',
		note: '128x128. The file paints three tonal wedges (#0065A9 / #007ACC / #1F9CF0) '
			+ 'through an SVG <mask> whose own path is the official silhouette — the ribbon '
			+ 'plus its triangular notch as a counter. Microsoft publishes no vector: the '
			+ 'fork\'s own resources/ tree holds code.icns and code.ico and nothing else, and '
			+ 'code.visualstudio.com serves PNG. Fetched to sources-svg/vscode-devicon.svg'
	},
	simplifications: [
		'the mark\'s three tonal wedges are composited through an SVG <mask> and L8 bans masks, '
		+ 'so they ship UNTRIMMED — the pipeline has no boolean intersect. The cost was measured '
		+ 'on a 512 px raster rather than assumed: against the mask\'s own silhouette the three '
		+ 'wedges score IoU 0.9910, with 0.28% of their ink outside it and 0.62% of it '
		+ 'uncovered, which is a fraction of one pixel on the rounded corners at 16 px',
		'the alternative was building the mask\'s own path as a single flat shape — geometrically '
		+ 'exact, and single-tone. R1 keeps multi-colour marks multi-colour, and giving up two of '
		+ 'the three official tones to buy back 0.3% of area is the wrong trade. Both are '
		+ 'rendered in proofs/license-freed-study.png',
		'the file\'s fifth layer is dropped: the mask\'s own path painted again at opacity 0.25 '
		+ 'under a white-to-transparent gradient — a sheen. L8 bans opacity and there is no flat '
		+ 'stop to keep (the gradient runs #FFF to #FFF at alpha 0), so there is nothing to '
		+ 'carry. The two <g filter="…"> drop shadows the file wraps two of the wedges in go the '
		+ 'same way: L8 bans filters, and a shadow is not geometry',
		'colours are the file\'s own three verbatim. brand-colors.json records VS Code as '
		+ '#007ACC, which is the middle of them and the tone the flat lockup uses, so the '
		+ 'source-of-truth rule fires and finds nothing to correct'
	],
	parts() {
		// shapes 1-3 are the three tonal wedges the file paints; shape 0 is the <mask>'s
		// own path and shape 4 the white-on-white overlay, and neither ships
		return officialShapes('vscode-devicon.svg').slice(1, 4).map(s => ({ d: s.d, fill: s.fill }));
	}
};

// =============================================================================
// BINARY
// =============================================================================

// --- gpg -----------------------------------------------------------------------------
// GnuPG's mark is a padlock with the GNU's head and mane inside it. The project's
// artwork tree (git.gnupg.org, artwork/) answered 429 "maintenance mode" on every
// attempt and gnupg.org itself publishes the logo as PNG, so the CC0 trace is the
// source. That trace is single-path, which knocks the mane out as a counter; R1
// keeps the mark two-colour instead, painting the official white mane back on top
// of the blue lock. The shackle's opening stays a counter, as it is in the mark.
S.gpg = {
	title: 'GnuPG',
	brand: '#0093DD',
	env: ENV.tall,
	source: {
		name: 'simple-icons', slug: 'gnuprivacyguard', license: 'CC0-1.0',
		url: 'https://git.gnupg.org/cgi-bin/gitweb.cgi?p=gnupg.git;a=tree;f=artwork/icons',
		note: 'the padlock with the GNU head; one path, 3 subpaths — lock contour, shackle '
			+ 'opening (counter), mane. Brand\'s own artwork hunted first: the gnupg.org git '
			+ 'artwork tree returned 429 (maintenance) and the site ships PNG only'
	},
	simplifications: [
		'the mark is repainted TWO-COLOUR: the trace is single-path and knocks the GNU\'s mane '
		+ 'out as a counter, but the official logo prints it white on the blue lock, so the '
		+ 'mane subpath is painted #FFFFFF over the lock instead of left as a hole. No geometry '
		+ 'is changed — the same three subpaths, in the official colours'
	],
	parts() {
		const sp = subpaths(icon('gnuprivacyguard').path);
		return [
			{ d: sp[0] + sp[1], fill: '#0093DD' },   // lock contour + shackle opening (counter)
			{ d: sp[2], fill: '#FFFFFF' }            // the GNU's mane, official white
		];
	}
};

// --- hex -------------------------------------------------------------------------------
// RULE 2, category glyph. hex covers .bin / .dat / .hex — raw bytes, the definition
// of the generic-binary bucket, and no object metaphor that is not already spoken
// for (a hex NUT would be a hexagon, and eslint's silhouette and node's folder mark
// are hexagons already — an R8 collision by construction). So it takes the category
// glyph, shared byte for byte with safetensors.
S.hex = {
	title: 'Binary data (neutral glyph)',
	brand: NEUTRAL,
	neutral: true,
	env: { w: 12.2, h: 12.2 },
	source: {
		name: 'none — neutral glyph vocabulary (category: binary)', slug: null, license: null,
		url: null,
		note: 'bin/dat/hex own no mark; the generic-binary category glyph, shared with '
			+ 'safetensors. A hex-nut reading was rejected: the hexagon is already eslint\'s '
			+ 'silhouette and node\'s folder mark'
	},
	simplifications: [],
	parts() {
		return [{ d: genericBinary(), fill: NEUTRAL }];
	}
};

// --- jar ---------------------------------------------------------------------------------
// RE-HUNTED IN THE FIX ROUND (2026-09-03) AND STILL NEUTRAL — on LEGIBILITY alone
// now, which is the half of flag 4 the ruling does not touch.
//
// The licence half is gone: with trademark non-binding, the Java cup is sourceable
// twice over — gilbarbara/logos and devicon both carry faithful vectors of Oracle's
// mark and both were fetched and built. The cup is kept at sources-svg/
// java-official.svg so the measurement can be re-checked.
//
// It cannot hold 16 px, and this is now a measurement rather than an inference. The
// mark is eight tapering brush strokes — four ellipse-like cup rings and two steam
// swirls — with no solid mass anywhere in it. Fitted at the tall envelope its
// sustained ink runs come back at 0.13 px at the 5th percentile, 0.25 at the 25th
// and 0.38 at the MEDIAN: not a mark with thin features, a mark that is nothing but
// thin features, which is blade's case with worse numbers. Three reductions were
// measured and all three fail (proofs/license-freed-study.png):
//   · the cup rings alone, at the wide envelope — 0.25 px at the 25th percentile;
//   · Duke, the Java mascot, from simple-icons' `openjdk` (CC0) — 0.31/0.38 px,
//     because Duke is a line drawing too;
//   · thickening the rings fuses them: their gaps run 0.38-0.69 px.
// A redrawn solid cup would clear the floor and is exactly the freehand geometry L2
// hard-rejects, which is a FIDELITY rule and not a licensing one. So jar keeps the
// generic-archive glyph, and it is now the only concept on it.
S.jar = {
	title: 'Java archive (neutral glyph)',
	brand: NEUTRAL,
	neutral: true,
	env: { w: 13, h: 11.1 },
	source: {
		name: 'none used — neutral glyph vocabulary (category: archive)', slug: null,
		license: null, url: null,
		note: 'RE-HUNTED under the fix-round ruling and still neutral, on LEGIBILITY alone. '
			+ 'Oracle\'s Java cup is sourceable now that trademark does not gate (gilbarbara/'
			+ 'logos and devicon both carry faithful vectors; the file is kept at '
			+ 'sources-svg/java-official.svg) and it was built and measured: at the tall '
			+ 'envelope its ink runs are 0.13 px at the 5th percentile, 0.25 at the 25th and '
			+ '0.38 at the median — eight tapering brush strokes with no solid mass in them. '
			+ 'The cup-rings-only and Duke (simple-icons `openjdk`) reductions measure 0.25 and '
			+ '0.38 px and fail too; thickening fuses rings 0.38-0.69 px apart. A redrawn solid '
			+ 'cup is freehand geometry, which L2 rejects on fidelity and not on licence. All '
			+ 'four renders are in proofs/license-freed-study.png'
	},
	simplifications: [],
	parts() {
		return genericArchive().map(d => ({ d, fill: NEUTRAL }));
	}
};

// --- lib ---------------------------------------------------------------------------------
// RULE 2, object metaphor. .a / .lib are static libraries; no brand, but the object
// the word names is a bound volume. Two sub-shapes — spine and cover, held apart by
// a 1.5 px gap so the pair reads as a book rather than as one panel.
S.lib = {
	title: 'Static library (neutral glyph)',
	brand: NEUTRAL,
	neutral: true,
	env: { w: 13, h: 10.4 },
	source: {
		name: 'none — neutral glyph vocabulary', slug: null, license: null, url: null,
		note: 'no brand owns .a/.lib; the bound volume is a new object glyph in the set\'s own '
			+ 'vocabulary (working rule 2), authored in geom.mjs as bookGlyph(). A '
			+ 'spine-plus-cover construction was drawn first and rejected at 16 px — two upright '
			+ 'bars read as a split panel, not as a book (proofs/neutral-vocabulary-study.png)'
	},
	simplifications: [],
	parts() {
		return bookGlyph().map(d => ({ d, fill: NEUTRAL }));
	}
};

// --- onnx ---------------------------------------------------------------------------------
// ONNX's icon is a polyhedron drawn as a wireframe: a heptagonal outline with eight
// triangular facets knocked out of it, so the mark IS its edges. Two sources exist
// and they are the same drawing — onnx.github.io's own ONNX-ICON.svg (kept in
// sources-svg/ as the fidelity reference; its repo declares no licence, so it is not
// what ships) and simple-icons' CC0 trace, which is the flattened single-path
// version of it. The trace ships.
//
// What L5 forces, MEASURED (nearest-neighbour distance between contours, at the
// shipped fit): the official facet-to-facet edges are 0.35 px. The mark is a
// wireframe of half-pixel lines and no fit the 16-grid allows changes that, so the
// prettier rider applies. The reduction thickens the edges WITHOUT moving the
// drawing: each facet counter is scaled about its own bbox centre by EDGE_K, which
// widens every internal edge and leaves the outline, the vertices, the facet count
// and the angles exactly where the official file puts them. Nothing is deleted and
// nothing is redrawn.
//
// It only half-works, and the manifest says so: the internal edges go 0.35 ->
// 0.50-0.84 px, but the binding constraint then moves to the rim where a facet's
// corner meets one of the outline's rounded vertex nodes, and that rim stays at
// 0.36 px however far the facets shrink. Deleting facets to get thick ink WAS
// measured (4 and 5 of the 8 kept, at three shrinks) and rejected: it turns the
// polyhedron into a blob with slits and stops being the mark. The study is
// proofs/onnx-edge-study.png.
const ONNX_EDGE_K = 0.8;
S.onnx = {
	title: 'ONNX',
	brand: '#005CED',
	env: { w: 13.2, h: 13.2 },
	source: {
		name: 'simple-icons', slug: 'onnx', license: 'CC0-1.0',
		url: 'https://github.com/onnx/onnx.github.io/blob/382e7036b616ce1555499ac41730245a2478513c/images/ONNX-ICON.svg',
		artwork: 'onnx-official.svg',
		note: 'the polyhedron wireframe: one path, 9 subpaths — the heptagonal outline plus '
			+ 'eight facet counters. The brand\'s own file is fetched to '
			+ 'sources-svg/onnx-official.svg for the fidelity strip but is NOT the shipped '
			+ 'geometry: onnx/onnx.github.io declares no licence, and its facets are shaded '
			+ 'grays that R1 would have to carry as an achromatic mark'
	},
	simplifications: [
		'PRETTIER RIDER. Measured at the shipped fit: the official facet-to-facet edges are '
		+ '0.35 px. The mark IS its edges, and no fit the 16-grid allows makes a half-pixel '
		+ 'wireframe readable',
		`every facet counter scaled about its own bbox centre by ${ONNX_EDGE_K}, which takes the `
		+ 'internal edges from 0.35 px to 0.50-0.84 px and leaves the outline, the vertices, the '
		+ 'facet count and every angle exactly where the official file puts them. Nothing is '
		+ 'deleted; the facets shrink, the drawing does not move',
		'HONEST LIMIT: the shrink does not clear L5. After it the narrowest place is the rim '
		+ 'where a facet corner meets one of the outline\'s rounded vertex nodes, and that rim '
		+ 'stays at 0.36 px no matter how far the facets shrink. It renders as antialiasing, '
		+ 'the same way editorconfig\'s 0.2 px linework does. Deleting facets to buy thick ink '
		+ 'was measured (4 and 5 of the 8 kept, at three shrinks) and rejected — it turns the '
		+ 'polyhedron into a blob with slits',
		'official colour: the icon file itself is achromatic (seven gray/white facet fills '
		+ 'over #333333 edges). #005CED is ONNX\'s published brand blue, which is what the '
		+ 'CC0 trace records and what ships — an achromatic icon here would sit in the '
		+ 'neutral lane with the mark-less glyphs'
	],
	parts() {
		const sp = subpaths(icon('onnx').path);
		const shrink = (d) => {
			const b = bbox(d);
			return xform(d, { sx: ONNX_EDGE_K, dx: b.cx * (1 - ONNX_EDGE_K), dy: b.cy * (1 - ONNX_EDGE_K) });
		};
		return [{ d: sp[0] + sp.slice(1).map(shrink).join(''), fill: '#005CED' }];
	}
};

// --- python-misc -----------------------------------------------------------------------------
// WORKING RULE 1, branch (b). python-misc is the python family's packaging variant
// (.whl / .egg / .pyc, requirements.txt, pyproject.toml). The rule asks first
// whether a source theme draws an established NON-LETTER variant glyph for it:
// Material does draw a python-misc icon, but it is a document sheet with the python
// logo dropped into the corner — a composition Material invented, not a variant mark
// anyone else uses; vscode-icons and Great Icons draw no python-misc at all. So
// there is no distinct variant geometry to adapt, and the concept ships the FAMILY
// BASE MARK identically: the pilot's python master, byte for byte, under its own id.
// Recorded in the manifest's `families` map and reported in the twin audit's family
// lane, where byte-identity is expected rather than a collision.
S['python-misc'] = {
	title: 'Python (packaging)',
	brand: '#3776AB',
	env: pilotSpec('python').env,
	family: { name: 'python', base: 'python', from: 'pilot', mode: 'identical' },
	source: { ...pilotSpec('python').source },
	simplifications: [
		'official gradients flattened to their dominant flat stops (L2) — inherited with the '
		+ 'family base',
		'WORKING RULE 1(b): no distinct non-letter variant glyph exists for this concept '
		+ '(Material composes a document sheet plus the python logo; vscode-icons and Great '
		+ 'Icons draw nothing), so python-misc ships the family base mark byte-identically '
		+ 'under its own id rather than inventing a desaturated or lettered variant'
	],
	parts() {
		return pilotSpec('python').parts();
	}
};

// --- pytorch ---------------------------------------------------------------------------------
// pytorch.github.io ships the icon on its own: assets/images/logo-icon.svg, the
// flame ring and its dot, both in #EE4C2C. Two shapes, official colour, nothing to
// simplify.
S.pytorch = {
	title: 'PyTorch',
	brand: '#EE4C2C',
	env: ENV.tall,
	source: {
		name: 'PyTorch (brand\'s own SVG)', slug: 'pytorch',
		license: 'BSD-3-Clause (pytorch/pytorch.github.io); PyTorch is a trademark of the LF',
		url: 'https://github.com/pytorch/pytorch.github.io/blob/master/assets/images/logo-icon.svg',
		artwork: 'pytorch-official.svg',
		note: 'logo-icon.svg — the open flame ring plus the dot, one path and one circle, both '
			+ '#EE4C2C. brand-colors.json records the same hex. Fetched to '
			+ 'sources-svg/pytorch-official.svg'
	},
	simplifications: [],
	parts() {
		return officialShapes('pytorch-official.svg').map(s => ({ d: s.d, fill: '#EE4C2C' }));
	}
};

// --- safetensors -------------------------------------------------------------------------------
// REBUILT IN THE FIX ROUND (2026-09-03). Flag 7 declined the Hugging Face face on
// MEANING rather than on licence — "HF's smiling face is the company's mark, not the
// format's" — and the fix-round ruling re-rules it: Sebastian's stated preference is
// for the icons that are actually the real icon, and HF created and owns the format
// (github.com/huggingface/safetensors). The meaning question is not dissolved by the
// ruling the way the licence questions are, so it is FLAGGED for his re-look rather
// than treated as settled.
//
// SOURCING, by fidelity: Hugging Face publishes its own vector, and it is
// MULTI-COLOUR — the #FFD21E face inside an #FF9D0B ring, #3A3B45 eyes, an #FF323D
// mouth and two #FFD21E hands. simple-icons flattens the whole thing to one yellow
// path; R1 keeps multi-colour marks multi-colour, so the brand's own file ships.
S.safetensors = {
	title: 'Safetensors (Hugging Face)',
	brand: '#FFD21E',
	env: ENV.compact,
	source: {
		name: 'Hugging Face (brand\'s own SVG)', slug: 'huggingface',
		license: 'no declared licence on the asset — Hugging Face trademark. Recorded and NOT '
			+ 'gating, per the fix-round ruling (the chrome situation, ruled)',
		url: 'https://huggingface.co/front/assets/huggingface_logo-noborder.svg',
		artwork: 'huggingface-official.svg',
		note: '95x88, six painted layers: the #FFD21E face, its #FF9D0B ring, two #3A3B45 '
			+ 'eyes, the #FF323D mouth and the two #FFD21E hands. simple-icons carries a CC0 '
			+ 'trace of the same drawing flattened to ONE yellow path, which R1 does not want. '
			+ 'Fetched to sources-svg/huggingface-official.svg'
	},
	simplifications: [
		'the CC0 trace is NOT used: simple-icons\' `huggingface` renders the whole mark as a '
		+ 'single #FFD21E path, and R1 keeps multi-colour marks multi-colour, so the brand\'s '
		+ 'own six-layer file ships instead',
		'the FINGER SEAMS inside the two hands are dropped, for both of L5\'s reasons at once: '
		+ 'measured at the shipped fit they run 0.44 px, so they do not resolve at 16 px, and '
		+ 'they cost 1.7 KB of a 5.2 KB icon — which is what put the whole mark over L8\'s 4 KB '
		+ 'HARD CAP. The hands keep their official contour and their official yellow palm and '
		+ 'lose the separation between the fingers, which is visible above about 32 px; both '
		+ 'renders are side by side in proofs/license-freed-study.png. After the cut the icon is '
		+ '3499 B',
		'NOT reduced otherwise, and measured: what arrives at 16 px is a yellow face inside its '
		+ 'darker ring, two dark eyes, a red mouth and a hand cupped on each side. The hands read '
		+ 'as mitts rather than as hands, which is the mark\'s own drawing at this size and not '
		+ 'the fit; the 16 px verdict records that as marginal'
	],
	parts() {
		const sh = officialShapes('huggingface-official.svg');
		// The two hand layers each END with a long subpath that draws the finger seams.
		// They measure 0.44 px at the shipped fit — they do not resolve at 16 px — and
		// they cost 1.7 KB of a 5.2 KB icon, which is what put it over L8's 4 KB hard cap.
		// Dropped: the hands keep their official contour and their yellow palm and lose
		// the separation between the fingers, which is visible above about 32 px.
		const HANDS = [5, 7];
		return sh.map((s, i) => (HANDS.includes(i)
			? { d: subpaths(s.d).slice(0, -1).join(''), fill: s.fill }
			: { d: s.d, fill: s.fill }));
	}
};

// =============================================================================
// module exports — the shape A01.mjs merges
// =============================================================================

export const SPECS = S;

/** Sheet order: the roster's own order, archive then binary. */
export const ORDER = ['android', 'chrome', 'debian', 'disc', 'vsix',
	'gpg', 'hex', 'jar', 'lib', 'onnx', 'python-misc', 'pytorch', 'safetensors'];

/**
 * L9 gate 2 — the 16 px proof, eyeballed. Read off the slice's own
 * proofs/proof-16px.png (every icon at a true 16 px next to a 10x
 * nearest-neighbour blow-up) and written down here, not asserted by a machine.
 */
export const PROOF16 = {
	android: ['pass', 'the dome, both antennae and both eye counters all hold — the most legible '
		+ 'branded mark in the tranche'],
	chrome: ['pass', 'all four official colours separate, and the 0.64 px white ring really does '
		+ 'render: it reads as a thin light circle between the blue centre and the blades, not as '
		+ 'a smudge. The flag stands anyway because the number is under the floor'],
	debian: ['pass (marginal)', 'reads as the swirl, but only the inner two thirds of it: the '
		+ 'brush tapers to nothing by construction, so the outer tail antialiases to a faint pink '
		+ 'and the mark reads as a red curl rather than a full spiral. That is the mark\'s own '
		+ 'drawing, not the fit'],
	disc: ['pass', 'ring and spindle both clean; unmistakably a disc'],
	vsix: ['pass', 'FIX ROUND. The VS Code ribbon in all three of its official blues, and it is '
		+ 'unmistakable at 16 px: the notch stays open, the fold between the two darker wedges '
		+ 'reads as a fold, and the pale right bar separates. 1.31 px at the 5th percentile. The '
		+ 'thing the mask cost is invisible here — 0.28% of the ink sits outside the official '
		+ 'silhouette, which is a fraction of a pixel on the corners'],
	gpg: ['pass', 'blue padlock with the shackle opening still open, and the GNU\'s mane resolves '
		+ 'into three distinct white strokes rather than one wedge'],
	hex: ['pass', 'plate with four open counters; the 1.8 px walls hold'],
	jar: ['pass', 'the archive box, and now the only concept carrying it. The glyph itself is '
		+ 'clean; what to read is the flag on why the Java cup — sourceable since the ruling, '
		+ 'built, and measured at a 0.38 px median run — still cannot come with it'],
	lib: ['pass', 'two page panels with the gutter open; reads as an open book. The rejected '
		+ 'spine-plus-cover construction read as a split panel at this size'],
	onnx: ['pass (marginal)', 'reads as a blue faceted polyhedron and nothing more: the outline '
		+ 'and the sense of internal structure survive, but no individual edge resolves. The '
		+ 'thickened facets are visibly better than the official wireframe and visibly better '
		+ 'than every deletion candidate — this is the mark\'s ceiling at 16 px'],
	'python-misc': ['pass', 'both snakes hold and the blue/yellow split survives — it is the '
		+ 'pilot\'s python master, so this is the pilot\'s own verdict re-read at slice scale'],
	pytorch: ['pass', 'the flame ring closes cleanly and the dot stays separate from it'],
	safetensors: ['pass (marginal)', 'FIX ROUND. The Hugging Face face, and it arrives as one: '
		+ 'the yellow head inside its darker ring, two dark eyes, the red mouth and a hand on '
		+ 'each side all separate at 16 px. Marginal because the finger seams (0.44 px at the '
		+ '5th percentile) do not resolve, so the hands read as two mitts rather than as hands '
		+ '— which is the mark\'s own drawing at this size, not the fit. The call to argue with '
		+ 'is not the render: it is whether the COMPANY\'s face belongs on a format dozens of '
		+ 'unrelated tools write. That is flagged']
};

/** Working rule 1 — declared brand families. */
export const FAMILIES = {
	python: {
		base: 'python', base_set: 'pilot', members: ['python-misc'], mode: 'identical',
		why: 'no source theme draws a distinct non-letter variant glyph for python-misc '
			+ '(Material composes a document sheet plus the python logo, which is its own '
			+ 'invention; vscode-icons and Great Icons draw nothing), so rule 1(b) applies and '
			+ 'the variant ships the family base mark byte-identically under its own id'
	}
};

/** Working rule 2 — the neutral vocabulary as this tranche uses it. */
export const NEUTRAL_COLLAPSE = {
	object_glyphs: {
		disc: 'optical disc — a ring with the spindle hole punched out (geom.opticalDisc)',
		lib: 'bound volume — the two page panels of an open book, splayed from a 1.6 px gutter (geom.bookGlyph)'
	},
	category_glyphs: {
		// FIX ROUND: vsix left for the VS Code ribbon and safetensors for the Hugging
		// Face logo, so both category glyphs are down to a single concept each. They stay
		// declared — the glyph is still the archive/binary fallback the long tail will
		// fill, and a one-member group is what an honest collapse record looks like when
		// the other member found its mark.
		'generic-archive': ['jar'],
		'generic-binary': ['hex']
	}
};

/**
 * FIX ROUND (2026-09-03) — what this tranche rebuilt under the ruling, for the
 * slice's own fix_round record and the sheet's before/after strip.
 */
export const FIX_ROUND = {
	rebuilt: ['vsix', 'safetensors'],
	rehunted_and_unchanged: ['jar'],
	notes: {
		vsix: 'flag 3 declined Microsoft\'s VS Code ribbon on three LICENCE grounds and the '
			+ 'ruling voids all three. Microsoft publishes no vector (the fork\'s own '
			+ 'resources/ tree is .icns and .ico), so devicon\'s MIT trace supplies the '
			+ 'geometry. The file masks three tonal wedges into one silhouette; L8 bans masks, '
			+ 'so the wedges ship untrimmed — measured at IoU 0.9910 against that silhouette, '
			+ 'which costs 0.28% of area and keeps all three official blues.',
		safetensors: 'flag 7 declined the Hugging Face face on MEANING, not licence. The '
			+ 'ruling\'s real-icon preference re-rules it and HF\'s own multi-colour vector '
			+ 'ships; the meaning question — a company\'s mark on a format many tools write — '
			+ 'is FLAGGED for a re-look rather than treated as settled.',
		jar: 'the licence half of flag 4 is void and Oracle\'s cup was sourced and built; it '
			+ 'stays neutral on L5 alone, at a 0.38 px median ink run, with Duke and a '
			+ 'cup-rings-only reduction measured and failing too.'
	}
};

/** New vocabulary entries this tranche contributes to the slice's record. */
export const VOCABULARY = {
	'optical disc': 'geom.opticalDisc — a ring with the spindle hole punched out',
	'bound volume': 'geom.bookGlyph — an open book, two page panels off a 1.6 px gutter',
	'generic-archive': 'geom.genericArchive — a lidded box with a latch counter',
	'generic-binary': 'geom.genericBinary — a punched byte block, 2x2 counters',
	'generic-code': 'geom.genericCode — the angle-bracket pair at file scale'
};

/**
 * What the brand actually ships, for the fidelity strip and the sheet's provenance
 * panes. Display-safe: no gradients, no <style>, no external references, because
 * both surfaces are gated for that. Neutral concepts return null — no brand owns
 * them, so there is nothing to be faithful to.
 */
const wrap = (viewBox, body) => `<svg viewBox="${viewBox}">${body}</svg>`;
const siSvg = (slug, fill) => wrap('0 0 24 24', `<path fill="${fill}" d="${icon(slug).path}"/>`);

export const ORIGINAL = {
	android: () => siSvg('android', '#3DDC84'),
	// the brand's own file, with its three blade gradients resolved to the flat stops
	// this set ships (the sheet may not carry gradient defs)
	chrome: () => wrap('0 0 48 48', officialShapes('chrome-official.svg')
		.filter(s => s.fill !== 'none')
		.map(s => `<path fill="${s.fill || s.gradient[s.gradient.length - 1].color}" d="${s.d}"/>`)
		.join('')),
	// rebuilt from the official paths rather than sanitised in place: the Illustrator
	// export opens with a multi-line entity DOCTYPE that no regex should be trusted with
	debian: () => wrap('0 0 87 108', officialPaths('debian-official.svg')
		.map(p => `<path fill="#A80030" d="${p.d}"/>`).join('')),
	disc: () => null,
	// the three tonal wedges the brand's file paints, in document order and in their own
	// hexes — which is what ships, because the <mask> the file composites them through
	// trims 0.28% of their ink and neither this pane nor an icon may carry a mask. The
	// study is where the trimmed and untrimmed shapes are put side by side
	vsix: () => wrap('0 0 128 128', officialShapes('vscode-devicon.svg').slice(1, 4)
		.map(s => `<path fill="${s.fill}" d="${s.d}"/>`).join('')),
	gpg: () => siSvg('gnuprivacyguard', '#0093DD'),
	hex: () => null,
	// Oracle's cup, kept and rendered even though it does not ship: the fidelity pane is
	// where a MEASURED decline gets to show its working
	jar: () => wrap('0 0 256 346', officialShapes('java-official.svg')
		.map(s => `<path fill="${s.fill}" d="${s.d}"/>`).join('')),
	lib: () => null,
	// the brand's own icon file, class fills resolved — this is the achromatic artwork
	// the shipped CC0 trace is a flattening of
	onnx: () => wrap('0 0 195 195', officialShapes('onnx-official.svg')
		.map(s => `<path fill="${s.fill}" d="${s.d}"/>`).join('')),
	'python-misc': () => siSvg('python', '#3776AB'),
	pytorch: () => wrap('0.6 1067.9 90.3 109.1', officialShapes('pytorch-official.svg')
		.map(s => `<path fill="#EE4C2C" d="${s.d}"/>`).join('')),
	safetensors: () => wrap('0 0 95 88', officialShapes('huggingface-official.svg')
		.map(s => `<path fill="${s.fill}" d="${s.d}"/>`).join(''))
};

// =============================================================================
// STUDIES — the measured alternatives behind the two calls that needed one
// =============================================================================
//
// The pilot's docker deck is the precedent: where a reduction is a judgement, the
// rejected candidates get rendered next to the shipped one at a true 16 px, so the
// verdict can be checked instead of believed.

const card = (name, body) => {
	const at = (px, cls = '', st = '') =>
		`<svg ${cls} ${st} width="${px}" height="${px}" viewBox="0 0 16 16">${body}</svg>`;
	return `<div class="c">${at(64)}<div class="t">${at(16)}${at(22)}${at(32)}</div>`
		+ `${at(16, 'class="px"', 'style="width:150px;height:150px"')}<div class="n">${name}</div></div>`;
};
const page = (lead, cards) => `<style>
body{background:#1e2124;color:#c9d1d9;font:11px ui-monospace,SFMono-Regular,monospace;margin:0;padding:14px}
h2{font:600 13px system-ui;margin:2px 0 4px;color:#e6edf3}
p{color:#8b949e;font:12px/1.5 system-ui;max-width:100ch;margin:0 0 12px}
.g{display:flex;flex-wrap:wrap;gap:9px}
.c{background:#121314;padding:8px 8px 4px;border-radius:7px;text-align:center;width:166px}
.px{image-rendering:pixelated;display:block;margin:6px auto 2px}
.t{display:flex;gap:7px;justify-content:center;align-items:center;margin-top:6px}
.n{font-size:9.5px;color:#8b949e;margin-top:4px}
.c.win{outline:1px solid #2f4436}
</style><body>${lead}<div class="g">${cards.join('')}</div></body>`;

const onnxCandidate = (keep, k) => {
	const sp = subpaths(icon('onnx').path);
	const sh = (d) => {
		const b = bbox(d);
		return k === 1 ? d : xform(d, { sx: k, dx: b.cx * (1 - k), dy: b.cy * (1 - k) });
	};
	return [{ d: sp[0] + keep.map(i => sh(sp[i])).join(''), fill: '#005CED' }];
};

export const STUDIES = [
	{
		// FIX ROUND. The ruling freed the sourcing; it did not free the physics, and jar
		// is where those two come apart. Every candidate the licence used to hide is
		// built here at a true 16 px so the decline can be checked instead of believed.
		id: 'license-freed-study',
		width: 1120, height: 830,
		html: (place) => {
			const java = officialShapes('java-official.svg');
			const cup = java.filter(s => s.fill === '#5382A1');
			const vs = officialShapes('vscode-devicon.svg');
			const cards = [
				card('jar &mdash; Oracle\'s cup, official<br>runs 0.13 / 0.25 / 0.38 px',
					place(java.map(s => ({ d: s.d, fill: s.fill })), ENV.tall)),
				card('jar &mdash; the cup rings alone<br>REJECTED: 0.25 px at p25',
					place(cup.map(s => ({ d: s.d, fill: s.fill })), ENV.wide)),
				card('jar &mdash; Duke (CC0 openjdk)<br>REJECTED: a line drawing too',
					place([{ d: icon('openjdk').path, fill: '#E5E5E5' }], ENV.tall)),
				card('jar &mdash; SHIPPED<br>the generic-archive glyph',
					place(genericArchive().map(d => ({ d, fill: NEUTRAL })), { w: 13, h: 11.1 }))
					.replace('class="c"', 'class="c win"'),
				card('vsix &mdash; SHIPPED<br>the three official tonal wedges',
					place(vs.slice(1, 4).map(s => ({ d: s.d, fill: s.fill })), ENV.compact))
					.replace('class="c"', 'class="c win"'),
				card('vsix &mdash; the mask\'s own silhouette<br>exact, and single-tone: IoU 0.991',
					place([{ d: rewind(subpaths(vs[0].d)[0], 1)
						+ rewind(subpaths(vs[0].d)[1], -1), fill: '#007ACC' }], ENV.compact)),
				card('vsix &mdash; the silhouette as written<br>REJECTED: both subpaths wind the '
					+ 'same way, so the notch never punches',
					place([{ d: vs[0].d, fill: '#007ACC' }], ENV.compact)),
				card('safetensors &mdash; SHIPPED<br>HF\'s own six-layer vector',
					place(officialShapes('huggingface-official.svg').map(s => ({ d: s.d, fill: s.fill })),
						ENV.compact))
					.replace('class="c"', 'class="c win"'),
				card('safetensors &mdash; the CC0 trace<br>REJECTED: one flat yellow path',
					place([{ d: icon('huggingface').path, fill: '#FFD21E' }], ENV.compact)),
				card('safetensors &mdash; seams KEPT<br>5235 B: over L8\'s 4 KB hard cap',
					place(officialShapes('huggingface-official.svg').map(x => ({ d: x.d, fill: x.fill })),
						ENV.compact))
			];
			return page(
				'<h2>What the ruling freed in tranche 1 &mdash; and the one thing it did not</h2>'
				+ '<p>Licence and trademark stopped gating sourcing on 2026-09-03, so the three '
				+ 'tranche-1 declines were re-hunted with the whole pool open. <b>vsix</b> and '
				+ '<b>safetensors</b> both found their marks and ship them. <b>jar</b> did not, and '
				+ 'this is the evidence: Oracle\'s cup was fetched, fitted and measured, and its '
				+ 'sustained ink runs are 0.13&nbsp;px at the 5th percentile, 0.25 at the 25th and '
				+ '<b>0.38 at the median</b> &mdash; eight tapering brush strokes with no solid mass '
				+ 'in them. The cup rings alone and Java\'s own Duke mascot measure no better; '
				+ 'thickening the rings fuses them at 0.38&ndash;0.69&nbsp;px of clearance. The only '
				+ 'reduction that would read is a redrawn cup, which is freehand geometry for a '
				+ 'brand that owns a mark &mdash; a FIDELITY rule the ruling does not reach. '
				+ 'Judge the 16&nbsp;px column.</p>', cards);
		}
	},
	{
		id: 'onnx-edge-study',
		width: 1080, height: 700,
		html: (place) => {
			const ALL = [1, 2, 3, 4, 5, 6, 7, 8];
			const rows = [
				['official — all 8 facets, x1<br>edges 0.35 px', ALL, 1, false],
				['SHIPPED — all 8, x0.8<br>edges 0.50-0.84 px', ALL, 0.8, true],
				['all 8, x0.72<br>edges close up', ALL, 0.72, false],
				['4 biggest facets kept, x1', [1, 2, 4, 7], 1, false],
				['4 biggest, x0.9', [1, 2, 4, 7], 0.9, false],
				['5 facets kept, x0.88', [1, 2, 4, 5, 7], 0.88, false]
			];
			return page(
				'<h2>ONNX — the prettier rider, measured</h2><p>The mark is a wireframe: a heptagon '
				+ 'outline with eight facet counters, and the edges between them are 0.35&nbsp;px at '
				+ 'the shipped fit. Two families of reduction were measured. <b>Shrinking the facets '
				+ 'about their own centres</b> thickens every internal edge without moving a single '
				+ 'vertex — that is what ships, at 0.8. <b>Deleting facets</b> buys thicker ink and '
				+ 'loses the mark: at 4 or 5 facets the polyhedron is a blob with slits. Judge the '
				+ '16&nbsp;px column, not the blow-up.</p>',
				rows.map(([n, keep, k, win]) => card(n, place(onnxCandidate(keep, k), { w: 13.2, h: 13.2 }))
					.replace('class="c"', win ? 'class="c win"' : 'class="c"'))
			);
		}
	},
	{
		id: 'neutral-vocabulary-study',
		width: 1080, height: 760,
		html: (place) => {
			const g = (d) => [{ d, fill: NEUTRAL }];
			const many = (ds) => ds.map(d => ({ d, fill: NEUTRAL }));
			const cards = [
				card('lib A — spine + cover<br>REJECTED: reads as a split panel', place(many([
					roundRect(1.9, 2.2, 2.5, 11.6, 0.55), roundRect(5.9, 2.2, 8.2, 11.6, 0.85)
				]), { w: 12.2, h: 11.6 })),
				card('lib B — open book<br>SHIPPED', place(many(bookGlyph()), { w: 13, h: 10.4 }))
					.replace('class="c"', 'class="c win"'),
				card('lib C — three spines on a shelf<br>REJECTED: reads as bars, and three shapes',
					place(many([
						roundRect(2.1, 3.4, 2.8, 10.2, 0.6), roundRect(6, 2.4, 2.8, 11.2, 0.6),
						roundRect(9.9, 3.9, 4, 9.7, 0.6)
					]), { w: 11.8, h: 11.2 })),
				card('disc — spindle r 2.0<br>SHIPPED', place(g(opticalDisc()), { w: 13.2, h: 13.2 }))
					.replace('class="c"', 'class="c win"'),
				card('disc — spindle r 2.6<br>REJECTED: reads as a ring', place(g(opticalDisc(8, 8, 6.6, 2.6)), { w: 13.2, h: 13.2 })),
				card('generic-archive — vsix, jar', place(many(genericArchive()), { w: 13, h: 11.1 })),
				card('generic-binary — hex, safetensors', place(g(genericBinary()), { w: 12.2, h: 12.2 })),
				card('generic-code — designed, unused in t1', place(many(genericCode()), { w: 13.2, h: 9.8 }))
			];
			return page(
				'<h2>The neutral vocabulary as slice A01 leaves it</h2><p>Working rule 2 keeps the '
				+ 'vocabulary to at most two sub-shapes per glyph, authored on the 16-grid, one gray, '
				+ 'no scenes. Two object glyphs and three category glyphs are added here; the '
				+ 'rejected constructions are shown next to what shipped, and every new glyph was '
				+ 'checked for R8 form collisions against the pilot\'s brace, chevron, hexagon and '
				+ 'check as well as against each other.</p>', cards);
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
		title: 'RULE 1 in practice — python-misc ships python\'s mark, byte for byte',
		rule: 'working rule 1(b)',
		subjects: ['python-misc'],
		text: 'The rule asks first whether a source theme draws an established NON-LETTER variant '
			+ 'glyph. Material does draw <code>python-misc.svg</code>, but it is a document sheet '
			+ 'with the python logo dropped in the corner — Material\'s own composition, not a '
			+ 'variant mark; vscode-icons and Great Icons draw no python-misc at all. So branch '
			+ '(b) applies: the variant ships the family base mark IDENTICALLY under its own id. '
			+ 'The payload is byte-equal to <code>pilot/masters/python.svg</code> and the slice '
			+ 'check asserts that equality rather than trusting it. In the tree, a '
			+ '<code>requirements.txt</code> and an <code>app.py</code> will look the same — that '
			+ 'is the rule working, not a bug, and the alternative is inventing a desaturated or '
			+ 'lettered python that no brand publishes.'
	},
	{
		title: 'RULE 2 in practice — three category glyphs, and what they will carry',
		rule: 'working rule 2',
		superseded: 'PARTLY SUPERSEDED by the fix-round ruling (2026-09-03): vsix and '
			+ 'safetensors both found their marks, so generic-archive now carries jar alone and '
			+ 'generic-binary carries hex alone. The rule and the glyphs are unchanged.',
		subjects: ['vsix', 'jar', 'hex', 'safetensors', 'disc', 'lib'],
		text: 'Six of the thirteen own no usable mark. Two get an OBJECT glyph — disc becomes an '
			+ 'optical disc, lib a bound volume — and four fall back to a CATEGORY glyph: '
			+ '<code>generic-archive</code> (a lidded box) carries vsix and jar, '
			+ '<code>generic-binary</code> (a punched byte block) carries hex and safetensors. '
			+ 'Those pairs are byte-identical on purpose and are listed in the manifest\'s '
			+ '<code>neutral_collapse</code> record and in the twin audit\'s own neutral lane, '
			+ 'never silently exempted. <code>generic-code</code> (the angle-bracket pair, the '
			+ 'src/ folder mark one size up) is designed and in geom.mjs but no A01 tranche-1 '
			+ 'concept uses it yet. All five glyphs hold the vocabulary discipline: at most two '
			+ 'sub-shapes, authored on the 16-grid, one gray, no scenes.'
	},
	{
		title: 'vsix — the VS Code mark is real, and this build declines to use it',
		rule: 'L2 sourcing / working rule 2',
		superseded: 'SUPERSEDED by the fix-round ruling (2026-09-03) — licence and trademark no '
			+ 'longer gate sourcing, which voids all three grounds below. vsix ships the VS Code '
			+ 'ribbon; see flag 37. Kept in place because the hunt it records is still the hunt.',
		subjects: ['vsix'],
		text: 'A <code>.vsix</code> is a VS Code extension package, so Microsoft\'s ribbon is the '
			+ 'mark that honestly applies. It is not shipped, for three reasons you should weigh '
			+ 'together: Microsoft publishes no icon vector under terms L2 can cite; '
			+ '<b>simple-icons v16.29.0 carries no Microsoft marks at all</b> — '
			+ '<code>visualstudiocode</code>, <code>microsoft</code> and their kin are gone from '
			+ 'the library, which is a trademark removal and not an oversight, so the CC0 tier is '
			+ 'empty; and this set ships inside a VS Code <em>fork</em>, where stamping '
			+ 'Microsoft\'s product mark on a file type is a call for you and not for a build. '
			+ 'vscode-icons independently reaches the same conclusion and draws a neutral gray '
			+ 'glyph. <b>Your options:</b> keep the archive box; use VSebCode\'s OWN product mark '
			+ 'once it exists; or rule that the VS Code ribbon may be traced from the fork\'s own '
			+ 'resources.'
	},
	{
		title: 'jar — the Java cup fails L2 twice, so jar goes neutral',
		rule: 'L2 sourcing / L5 / working rule 2',
		superseded: 'HALF SUPERSEDED by the fix-round ruling (2026-09-03). Reason (1), sourcing, '
			+ 'is void: the cup was sourced and built. Reason (2), legibility, stands and is now '
			+ 'measured rather than argued — see flag 39. jar stays on the archive glyph.',
		subjects: ['jar'],
		text: 'JAR is Java ARchive and the coffee-cup mark applies, so this is the flag to argue '
			+ 'with if any of them is. Why it is not shipped: <b>(1) sourcing</b> — Oracle '
			+ 'publishes no Java mark under citable terms and simple-icons has no '
			+ '<code>java</code> entry in v16.29.0, so both of L2\'s first two tiers are empty; '
			+ 'the only faithful vector available is vscode-icons\' trace. <b>(2) legibility</b> '
			+ '— the mark it traces is a calligraphic drawing of eight tapering brush strokes '
			+ 'with no solid cup anywhere in it. Every stroke is sub-pixel at 16 px, and the only '
			+ 'reduction that would read is a redrawn cup, which is freehand geometry for a brand '
			+ 'that owns a mark: L2\'s hard reject, and the exact failure that got round 1 thrown '
			+ 'out. So jar takes the archive box, byte-identical with vsix. <b>To overturn this '
			+ 'you would have to rule twice</b> — once that a third-party trace of an Oracle mark '
			+ 'is an acceptable source, and once that redrawing it is an acceptable reduction.'
	},
	{
		title: 'chrome — Google\'s own SVG, four official colours, and a 0.64&nbsp;px white ring',
		rule: 'L2 / L5',
		subjects: ['chrome'],
		text: 'Google publishes <code>chrome-logo.svg</code> on google.com/chrome, so the brand '
			+ 'tier wins outright over simple-icons\' monochrome silhouette and R1 keeps all four '
			+ 'colours. Two things to look at. <b>The gradients:</b> the three blades are painted '
			+ 'with linear gradients and L2 flattens each to its dominant flat stop — the '
			+ 'offset-1 stop of each, which lands exactly on Google\'s published flat palette '
			+ '(#EA4335 / #FBBC04 / #34A853). <b>The white ring:</b> the official separator '
			+ 'between the blue centre (r&nbsp;9.5) and the blades (r&nbsp;12) is 2.5/48 of the '
			+ 'mark, which is <b>0.64&nbsp;px</b> at this envelope. It is kept at official '
			+ 'proportions and renders as a light seam rather than a ring — the same reading L5\'s '
			+ 'erratum already applied to docker\'s 0.28&nbsp;px container gaps and '
			+ 'editorconfig\'s 0.2&nbsp;px linework. Thickening it to clear 1.2&nbsp;px means '
			+ 'shrinking Google\'s blue centre from r&nbsp;9.5 to r&nbsp;7.5 — a fifth off its '
			+ 'diameter. Kept faithful; say the word and it thickens. <b>Licence, honestly:</b> '
			+ 'no declared terms, Google trademark — the editorconfig situation again.'
	},
	{
		title: 'onnx — the prettier rider thickens a wireframe without moving it',
		rule: 'L5 / prettier rider',
		subjects: ['onnx'],
		text: 'The ONNX icon IS its edges: a heptagonal outline with eight triangular facets '
			+ 'knocked out, and measured at the shipped fit those edges are '
			+ '<b>0.35&nbsp;px</b>. Unreadable as published, so the rider fires. The reduction '
			+ 'is mechanical rather than editorial: <b>each facet counter is scaled about its '
			+ 'own bbox centre by 0.8</b>, which takes the internal edges to '
			+ '0.50&ndash;0.84&nbsp;px and leaves the outline, the vertex positions, the facet '
			+ 'count and every angle exactly where the official file puts them. Nothing is '
			+ 'deleted, nothing is redrawn — the facets shrink, the drawing does not move. '
			+ '<b>And it does not clear L5, which you should know before ruling:</b> after the '
			+ 'shrink the narrowest place is the rim where a facet corner meets one of the '
			+ 'outline\'s rounded vertex nodes, and that rim sits at 0.36&nbsp;px however far '
			+ 'the facets go. It renders as antialiasing, exactly as editorconfig\'s '
			+ '0.2&nbsp;px linework does. Deleting facets to buy thick ink was measured — 4 and '
			+ '5 of the 8 kept, at three shrink factors, all in '
			+ '<code>proofs/onnx-edge-study.png</code> — and rejected: it turns the polyhedron '
			+ 'into a blob with slits and stops being the mark. <b>The honest 16&nbsp;px verdict '
			+ 'is marginal</b>, and the alternatives are worse. '
			+ '<b>Colour:</b> ONNX\'s own icon file is achromatic (seven gray/white facets over '
			+ '#333333 edges); #005CED is the brand blue the CC0 trace records and what ships, '
			+ 'because an achromatic ONNX would sit in the neutral lane next to the mark-less '
			+ 'glyphs. <b>Licence:</b> the brand\'s own file is kept in <code>sources-svg/</code> '
			+ 'for the fidelity strip but does not ship — <code>onnx/onnx.github.io</code> '
			+ 'declares no licence, so the CC0 trace of the same drawing is what the geometry '
			+ 'comes from.'
	},
	{
		title: 'safetensors is NOT stamped with the Hugging Face face',
		rule: 'L2 / working rule 2',
		superseded: 'SUPERSEDED by the fix-round ruling (2026-09-03) — the real-icon preference '
			+ 'overturns the decline and the HF face ships. The MEANING objection this flag makes '
			+ 'is a different question from the licence ones the ruling settles, so it is carried '
			+ 'forward for a re-look rather than dismissed: see flag 38.',
		subjects: ['safetensors'],
		text: 'The brief asked the question, so here is the answer with the evidence. The format '
			+ 'is Hugging Face\'s — <code>github.com/huggingface/safetensors</code> — and HF does '
			+ 'publish an official vector of its mark. It is deliberately not used: safetensors '
			+ 'publishes no mark of its OWN, and HF\'s smiling face is the company\'s mark, not '
			+ 'the format\'s. <code>.safetensors</code> files are written by dozens of tools with '
			+ 'no Hugging Face connection, so stamping the face on all of them claims an '
			+ 'ownership the format does not carry — unlike <code>.pt</code> (PyTorch\'s own '
			+ 'format, PyTorch\'s own mark) or <code>.onnx</code>, where the project and the '
			+ 'format are the same thing. It is not a rule-1 family variant either. '
			+ 'vscode-icons independently draws a neutral glyph. <b>Overturn it</b> and '
			+ 'safetensors becomes the HF face; the artwork is one fetch away.'
	},
	{
		title: 'android, gpg and onnx ship from simple-icons after the brand tier came up empty',
		rule: 'L2 sourcing',
		subjects: ['android', 'gpg', 'onnx'],
		text: 'L2 asks for the brand\'s own vector first, and the hunt is recorded rather than '
			+ 'assumed. <b>android:</b> developer.android.com and android.com publish the robot '
			+ 'as PNG only (Android_Robot_100.png answers 200; every SVG path answers 404), and '
			+ 'tracing a PNG is freehand. <b>gpg:</b> GnuPG\'s artwork lives in the project\'s '
			+ 'git tree at <code>git.gnupg.org</code>, which answered <em>429 Too Many Requests / '
			+ 'GnuPG Git Maintenance</em> on every attempt; gnupg.org itself ships the logo as '
			+ 'PNG. <b>onnx:</b> the brand\'s file was fetched and is in '
			+ '<code>sources-svg/</code>, but its repo declares no licence. All three therefore '
			+ 'ship from simple-icons\' CC0 traces, which is L2\'s second tier working exactly as '
			+ 'written. If any of the three matters enough, the brand file can be re-hunted '
			+ 'later without touching the geometry pipeline.'
	},
	{
		title: 'debian keeps the swirl and drops eleven brush flecks',
		rule: 'L5',
		subjects: ['debian'],
		text: 'The Open Use Logo is an Illustrator export of a brush drawing: one long path for '
			+ 'the spiral and eleven detached specks for the flecks the brush left. At this fit '
			+ 'the specks measure 0.02&ndash;0.63&nbsp;px in their minor axis, every one of them '
			+ 'under two thirds of a pixel, so L5 drops them; the spiral is the official path '
			+ 'with nothing '
			+ 'changed. <b>What you should judge at 16&nbsp;px</b> is the spiral\'s own taper — '
			+ 'the brush thins to nothing at the tail by construction, the way yaml\'s letters '
			+ 'are thin by construction. That is the mark, not the fit.'
	},
	{
		title: 'gpg is repainted two-colour from a single-path trace',
		rule: 'R1 / L2',
		subjects: ['gpg'],
		text: 'The official GnuPG logo is a blue padlock with the GNU\'s mane printed WHITE '
			+ 'across it. simple-icons, like all its icons, is single-path, so the trace knocks '
			+ 'the mane out as a counter and it would render as backdrop-through-lock. R1 keeps '
			+ 'multi-colour marks multi-colour, so the mane subpath is painted #FFFFFF over the '
			+ 'lock instead of being left as a hole — the same move the pilot made on '
			+ 'typescript\'s S and T. <b>No geometry changes:</b> same three subpaths, same '
			+ 'winding, official colours. The shackle\'s opening stays a counter, as the mark '
			+ 'draws it.'
	}
];

// =============================================================================
// FIX-ROUND FLAGS — numbered AFTER every tranche's flags, so 1-35 keep the
// numbers the gate was decided on. A01.mjs appends these three tranches' FIX_FLAGS
// in module order, which puts this tranche's at 36-39.
// =============================================================================

export const FIX_FLAGS = [
	{
		title: 'THE RULING, and the exact line it moved',
		rule: 'D22 amendment / L2 sourcing',
		ruling: true,
		subjects: [],
		text: 'Recorded first because every flag after it depends on it. Sebastian at the A01 '
			+ 'gate, 2026-09-03: <i>"I like the icons that are actually the real Icon. Why is '
			+ 'there a lot of the same angled brackets? The licenses don\'t apply here because '
			+ 'this is a personal project and will not be distributed."</i> <b>What that '
			+ 'changes:</b> licence, trademark and brand-usage policy NO LONGER GATE SOURCING '
			+ 'anywhere in this set. Every subject that went neutral because a mark could not be '
			+ 'licensed, or that avoided its true mark on trademark grounds, gets that mark now, '
			+ 'and the sourcing chain orders by FIDELITY alone — brand SVG first, then whichever '
			+ 'faithful vector of the real mark exists, wherever it is licensed. Repo logos, '
			+ 'favicons, product icons and extension assets are all in scope. <b>What it does '
			+ 'NOT change, and this is the important half:</b> L5\'s physics (an icon may still '
			+ 'not ship illegible), the prettier-rider and gestalt reading, true colour, the ban '
			+ 'on typeset letters, the twin audit, the neutral vocabulary for concepts that '
			+ 'genuinely own no mark, and the L2 rule that geometry may never be traced from a '
			+ 'raster or drawn freehand — that one is a FIDELITY rule and it still binds, which '
			+ 'is why beancount and the Axure app icon are still neutral. <b>Provenance duty is '
			+ 'untouched:</b> every source and every licence is still recorded verbatim on this '
			+ 'page. We still document what the licence is; it just does not decide. <b>Scale of '
			+ 'the change:</b> 20 of the slice\'s 40 gray-bracket icons leave the collapse, plus '
			+ 'vsix and safetensors out of tranche 1\'s archive and binary glyphs.'
	},
	{
		title: 'vsix — the VS Code ribbon ships, and what the mask cost it',
		rule: 'L2 sourcing (ruled) / L8 / L5',
		subjects: ['vsix'],
		text: 'Flag 3 declined this on three grounds and the ruling voids all three. '
			+ '<b>Sourcing, by fidelity:</b> Microsoft publishes no vector of the mark — the '
			+ 'fork\'s own <code>vscode/resources/</code> tree holds <code>code.icns</code> and '
			+ '<code>code.ico</code> and no SVG anywhere, and code.visualstudio.com serves PNG '
			+ '— so devicon\'s MIT trace of the same drawing supplies the geometry. <b>What L8 '
			+ 'forced, and what it turned out to cost.</b> The file paints the mark as three tonal '
			+ 'wedges (#0065A9 / #007ACC / #1F9CF0) composited through an SVG '
			+ '<code>&lt;mask&gt;</code> whose own path is the official silhouette. L8 bans masks '
			+ 'and the pipeline has no boolean intersect, so the wedges cannot be trimmed to that '
			+ 'silhouette — but both were built and the difference was MEASURED on a 512&nbsp;px '
			+ 'raster rather than guessed: <b>IoU 0.9910</b>, with 0.28% of the wedges\' ink '
			+ 'outside the silhouette and 0.62% of the silhouette uncovered. At 16&nbsp;px that is '
			+ 'a fraction of one pixel on the rounded corners. The alternative was the silhouette '
			+ 'alone: geometrically exact, and single-tone. R1 keeps multi-colour marks '
			+ 'multi-colour, and giving up two of three official tones to buy back 0.3% of area is '
			+ 'the wrong trade, so <b>the wedges ship and all three official blues survive</b>. '
			+ '<b>One thing worth recording because it nearly went wrong:</b> the mask path\'s two '
			+ 'subpaths are wound the SAME way, so building it as a single shape under nonzero '
			+ 'fill leaves the triangular notch un-punched and the mark comes out as a solid blob '
			+ 'with 11% too much ink. The first build of this subject did exactly that and the '
			+ 'study caught it; all three renders are in '
			+ '<code>proofs/license-freed-study.png</code>. At 16&nbsp;px the shipped mark keeps '
			+ 'its notch open, the fold between the two darker wedges reads as a fold, and the pale '
			+ 'right bar separates.'
	},
	{
		title: 'safetensors ships the Hugging Face face — and the MEANING question is still open',
		rule: 'L2 / working rule 2',
		ruling: true,
		subjects: ['safetensors'],
		text: '<b>Flagged for your re-look, because this one is not the same shape as the '
			+ 'others.</b> Flag 7 declined the HF face on MEANING and not on licence: '
			+ 'safetensors publishes no mark of its own, HF\'s smiling face is the COMPANY\'s '
			+ 'mark, and <code>.safetensors</code> files are written by dozens of tools with no '
			+ 'Hugging Face connection. The ruling settles licence questions; it does not, on '
			+ 'its face, settle that one. It is overturned here on your stated preference for '
			+ 'the icons that are actually the real icon, plus the fact that Hugging Face '
			+ 'created and owns the format (<code>github.com/huggingface/safetensors</code>) '
			+ '— which makes this closer to <code>.pt</code> and PyTorch than the flag allowed. '
			+ '<b>The same reading now carries four more subjects</b> — bolt (Firebase\'s flame '
			+ 'on Firebase Bolt), and, the other way, blink, biml and anyscript stay neutral '
			+ 'because their parent marks fail on other grounds. If you would rather a '
			+ 'company\'s mark never stood in for a format it owns, say so and safetensors and '
			+ 'bolt go back to their glyphs in one edit. <b>Sourcing:</b> HF\'s own vector is '
			+ 'multi-colour — the #FFD21E face in an #FF9D0B ring, #3A3B45 eyes, an #FF323D '
			+ 'mouth, two hands — and simple-icons flattens all of it to one yellow path, so the '
			+ 'brand\'s own file ships and R1 keeps the colours.'
	},
	{
		title: 'jar — the licence half of flag 4 is void, and the physics half is not',
		rule: 'L5 / prettier rider',
		subjects: ['jar'],
		text: 'The flag most likely to be argued with, so here is the working. With trademark '
			+ 'non-binding the Java cup is sourceable twice over and it was fetched, fitted and '
			+ 'measured rather than assumed: the file is kept at '
			+ '<code>sources-svg/java-official.svg</code> and rendered in the provenance pane, '
			+ 'and every candidate is at a true 16 px in '
			+ '<code>proofs/license-freed-study.png</code>. <b>The numbers.</b> Oracle\'s mark is '
			+ 'eight tapering brush strokes — four cup rings and two steam swirls, no solid mass '
			+ 'anywhere — and at the tall envelope its sustained ink runs are <b>0.13 px at the '
			+ '5th percentile, 0.25 at the 25th and 0.38 at the MEDIAN</b>. That is blade\'s case '
			+ 'with worse numbers: not a mark with some thin features, a mark that is nothing but '
			+ 'thin features. <b>Three reductions were measured and all three fail:</b> the cup '
			+ 'rings without the steam (0.25 px at the 25th percentile); <b>Duke</b>, Java\'s own '
			+ 'mascot, from simple-icons\' CC0 <code>openjdk</code> (0.31 / 0.38 px — Duke is a '
			+ 'line drawing too); and thickening the rings, which fuses them, their gaps being '
			+ '0.38&ndash;0.69 px apart. <b>The one thing that would work is a redrawn solid '
			+ 'cup</b>, and that is freehand geometry for a brand that owns a mark — L2\'s hard '
			+ 'reject, and a FIDELITY rule rather than a licensing one, so the ruling does not '
			+ 'reach it. To overturn you would be ruling that this set may draw a brand\'s mark '
			+ 'from memory, which is the ruling that got round 1 thrown out.'
	}
];
