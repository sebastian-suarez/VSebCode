// A01.t3.mjs — slice A01, tranche 3: the CODE category, appscript → bolt.
//
//   appscript · appwrite · arduino · asp · aspx · atom · ats · autohotkey ·
//   autoit · avalonia · avro · awk · axure · azure · azurestreamanalytics ·
//   bak · ballerina · bashly-hook · bat · bats · bazel · bbx · beancount ·
//   befunge · behat · bench-js · bench-jsx · bench-ts · bibliography ·
//   bibtex-style · bicep · biml · blade · blink · blitzbasic · bolt
//
// Same law as the pilot and tranches 1-2 (guide §5 / L1-L10, D22 R1 "True
// colour"): where a brand publishes a mark the icon IS that mark, adapted from
// the brand's own vector or a faithful trace of it, in the official colours;
// where no usable mark exists the concept takes the shared neutral vocabulary in
// one gray. Every source hunt, every reduction and every judgement call is
// recorded here.
//
// SOURCE HUNT RESULT for these thirty-six (L2 preference order: brand SVG >
// simple-icons > a source theme's faithful vector of a real mark):
//
//   brand's own SVG   appwrite (appwrite.io), avalonia (AvaloniaUI/Avalonia,
//                     MIT), avro (apache/avro, Apache-2.0), bats
//                     (bats-core/bats-core, MIT), bazel (bazelbuild/
//                     bazel-website, Apache-2.0), bicep (Azure/bicep, MIT)
//   simple-icons      arduino, autoit — the brand tier was hunted first in both
//                     cases and is recorded below where it exists but could not
//                     be used (Arduino's own published lockup draws the infinity
//                     WITHOUT the plus and minus that make it the Arduino mark;
//                     autoitscript.com ships a .ico and nothing else)
//   source theme      ballerina — ballerina.io publishes the wordmark as SVG and
//                     the SYMBOL nowhere, and simple-icons has no ballerina
//                     entry, so L2's third tier fires (the tier tranche 2 opened
//                     on antlr). vscode-icons and Material trace the same
//                     symbol independently, which is the corroboration L2 wants
//   NO MARK (rule 2)  the other twenty-seven -> the generic-code category glyph,
//                     byte-identical with tranche 2's thirteen
//
// TWENTY-SEVEN of thirty-six collapse, which with tranche 2's thirteen makes
// FORTY of the slice's eighty-four one payload. That is the largest single fact
// about A01 and it is the headline flag, with the four piles separated and every
// one of them carrying its measurement:
//
//   LICENCE      azure, azurestreamanalytics — Microsoft's Azure icon terms are
//                published and quotable, and they do not permit this use
//   16 PX        appscript, aspx, autohotkey, behat, blade — five marks that
//                exist, four of which are CLEANLY LICENSED, and none of which
//                survives the tree's real render
//   NOT OURS     bashly-hook, biml, blink, bolt — a product's or a company's
//                mark is not the format's (tranche 1's safetensors reading)
//   NO MARK      the remaining sixteen, which own no artwork at all
//
// Two findings in here correct tranche 2's flag 13 on the facts, and both are
// flagged rather than quietly applied: simple-icons v16.29.0 DOES carry
// Microsoft marks (`dotnet`, `blazor`), and github.com/dotnet/brand publishes
// the .NET logo under CC0-1.0. The Microsoft line still holds for azure — but it
// holds on Microsoft's own published icon terms, not on absence from a CC0
// library.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import svgpath from 'svgpath';
import { subpaths, ellipse, roundRect, unionBBox, xform, rewind } from '../pathkit.mjs';
import { genericCode, genericBinary, genericArchive, bookGlyph, roundPoly, terminalGlyph,
	stopwatchGlyph } from '../geom.mjs';
import { NEUTRAL, WHITE, lift } from '../color.mjs';
import { officialShapes, icon, ENV, SRCDIR } from '../spec-engine.mjs';

const S = {};

// The generic-code glyph is authored 13.2 x 9.8 in geom.mjs and placed at 13 x
// 11.4 — tranche 2's constant, repeated here as a literal on purpose. Forty
// concepts across two tranche modules have to emit the SAME BYTES, and
// check-slice.mjs asserts that byte-identity across the merged group; importing
// the number would hide the coupling, so it is written out and the check proves
// it rather than the import promising it.
const CODE_ENV = { w: 13, h: 11.4 };

// =============================================================================
// local helpers — nothing here is shared, so nothing here can move a pilot byte
// =============================================================================

/**
 * WORKING RULE 2, category glyph. Twenty-seven concepts in this tranche end up
 * here and they must be byte-identical with each other AND with tranche 2's
 * thirteen, so they go through one factory. `why` is the concept's own hunt
 * result and is what lands on the sheet.
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
 * `<polygon points="…">` re-emitted as a closed path. Used once, on Bicep's own
 * file, whose isometric field is a polygon rather than a path. This is a FORMAT
 * conversion and not a transcription: every coordinate comes out of the file's
 * own `points` attribute in the order the file writes it, which is exactly why
 * tranche 2 declined to do the same thing by hand for SAP's polyline.
 */
const polys = (file) => {
	const raw = readFileSync(join(SRCDIR, file), 'utf8');
	return [...raw.matchAll(/<polygon[^>]*>/g)].map((m) => {
		const pts = (m[0].match(/points="([^"]+)"/) || [])[1].trim().split(/[\s,]+/).map(Number);
		let d = '';
		for (let i = 0; i < pts.length; i += 2) { d += `${i ? 'L' : 'M'}${pts[i]} ${pts[i + 1]}`; }
		return {
			d: `${d}Z`,
			fill: (m[0].match(/fill:\s*(#[0-9a-fA-F]{3,8})/) || [])[1] || null,
			gradient: /fill:\s*url\(/.test(m[0])
		};
	});
};

/**
 * `<rect>` re-emitted as a closed path — the same format conversion `polys()` does
 * for bicep's polygon, added by the FIX ROUND because Microsoft's own .NET logo
 * paints its field with a rect and `officialShapes()` reads paths and circles only.
 * Every coordinate comes out of the element's own x/y/width/height attributes, so
 * this is a reader and not a transcription.
 */
const rects = (file) => {
	const raw = readFileSync(join(SRCDIR, file), 'utf8');
	return [...raw.matchAll(/<rect[^>]*>/g)].map((m) => {
		const num = (k) => +((m[0].match(new RegExp(`\\s${k}="([^"]+)"`)) || [])[1] ?? 0);
		const x = num('x'), y = num('y'), w = num('width'), h = num('height');
		return { d: `M${x} ${y}H${x + w}V${y + h}H${x}Z`, fill: (m[0].match(/fill="([^"]+)"/) || [])[1] };
	});
};

/**
 * Which of a file's painted elements carry an ALPHA — an `opacity` or `fill-opacity`
 * attribute — in document order. L8 bans opacity outright, so such a layer cannot
 * ship, and compositing it by hand would invent a hex the file never declares (the
 * bicep cube-face reading). Added by the FIX ROUND after Firebase's flame turned out
 * to carry a 0.2-alpha shadow sliver painted in a REAL hex (#A52714) — which a
 * filter on the fill colour alone does not catch, and which would otherwise have
 * shipped at full strength.
 *
 * The indices line up with officialShapes(), which pushes path and circle elements
 * in the same document order.
 */
const alphaLayers = (file) => {
	const raw = readFileSync(join(SRCDIR, file), 'utf8');
	const out = new Set();
	let i = 0;
	for (const m of raw.matchAll(/<(path|circle)\b[^>]*>/g)) {
		if (/\s(?:fill-)?opacity\s*=/.test(m[0])) { out.add(i); }
		i++;
	}
	return out;
};

/**
 * Arcs expanded to cubics. Only a STUDY needs this and nothing that ships goes
 * through it: `svg-path-bounds`, which the fit measures with, mis-splits an arc
 * whose flag pair is packed against the next number (`a.5.5 0 01.014.1`), and
 * two of the paths the illegibility study renders — simple-icons' `autohotkey`
 * and Laravel's own logomark — are written exactly that way. svgpath's parser
 * reads them correctly, so those paths are re-emitted through it before the
 * study measures them. No geometry changes; this is the same normalisation
 * `subpaths()` already performs on its way past.
 */
const unarc = (d) => svgpath(d).abs().unarc().unshort().toString();

/** The stops of a file's linear gradients, in document order. */
const gradientStops = (file) => [...readFileSync(join(SRCDIR, file), 'utf8')
	.matchAll(/stop-color:\s*(#[0-9a-fA-F]{3,8})/g)].map(m => m[1].toUpperCase());

/**
 * The STROKED elements of a source file, as `{ d, width }`, with `<line>` and
 * `<circle>` expanded to path data. Only the fidelity strip uses this: it shows
 * what the brand ships, strokes and all (the alchemy precedent), so the display
 * copy has to be read from the file rather than typed out.
 */
const strokedPaths = (file) => {
	const raw = readFileSync(join(SRCDIR, file), 'utf8');
	const out = [];
	for (const m of raw.matchAll(/<(path|line|circle)\b[^>]*>/g)) {
		if (!/stroke:\s*#/.test(m[0])) { continue; }
		const num = (k) => +((m[0].match(new RegExp(`\\s${k}="([^"]+)"`)) || [])[1] ?? 0);
		const width = +((m[0].match(/stroke-width:\s*([\d.]+)/) || [])[1] || 1);
		if (m[1] === 'line') { out.push({ d: `M${num('x1')} ${num('y1')}L${num('x2')} ${num('y2')}`, width }); }
		else if (m[1] === 'circle') { out.push({ d: ellipse(num('cx'), num('cy'), num('r'), num('r'), true), width }); }
		else {
			const d = (m[0].match(/\sd="([\s\S]*?)"/) || [])[1];
			if (d) { out.push({ d: d.replace(/\s+/g, ' ').trim(), width }); }
		}
	}
	return out;
};

// =============================================================================
// appscript — Google Apps Script
// =============================================================================
// RULE 2 on legibility, after a hunt that succeeded twice over. The mark is real,
// it is Google's, and it is available under terms L2 can cite: simple-icons
// v16.29.0 carries `googleappsscript` (CC0) at Google's own #4285F4. There is no
// sourcing objection here at all — this is the ada/agda pile, not the Adobe pile.
//
// What kills it, MEASURED at every envelope the grid allows: the mark is a fan of
// five tapering blades with four detached dots, nine subpaths on a 24-unit
// artboard. The blades are 2.9 units wide at their base and taper to nothing, and
// the dots are 2.8 units across. At the widest fit (open, 13.6) the sustained ink
// runs come back at 0.25-0.88 px, against L5's official-forced 1.2 px floor: the
// 25th percentile is 0.88 and the median 2.13, which is another way of saying
// that the fat middle of each blade reads and every edge between them does not.
// The 16 px render is a blue scatter — see the study.
//
// REBUILT IN THE FIX ROUND (2026-09-03) — and this one was never a licence case, so
// the rebuild is a straight second attempt at the reduction, editorconfig-grade.
//
// Flag 27's numbers were right about the OFFICIAL mark: nine subpaths (four tapering
// blades and FIVE detached dots), sustained ink runs 0.75 px at the 5th percentile
// and 0.94 at the 25th even at the open envelope, and a 16 px render that is a blue
// scatter. What flag 27 did not do is try the reduction L5's detail budget actually
// asks for — "keep the mark's gestalt, drop its interior detail".
//
// THE REDUCTION, measured: the five dots are the fan's pivot studs and they are the
// interior detail. Dropping them and keeping the four blades at the open envelope
// takes the ink runs to 2.25 px at the 25th percentile and 3.06 at the median — over
// the floor everywhere except the blade tips, which taper by construction. Every
// blade keeps its official contour, its official angle and its official position;
// nothing is thickened, moved or redrawn. What arrives at 16 px is a blue fan, which
// is the mark's gestalt; what is lost is the studs, which never resolved anyway.
//
// Both readings are rendered at a true 16 px in proofs/license-freed-t3-study.png.
const APPSCRIPT_BLADES = [0, 1, 4, 6];
S.appscript = {
	title: 'Google Apps Script',
	brand: '#4285F4',
	env: ENV.open,
	source: {
		name: 'simple-icons', slug: 'googleappsscript', license: 'CC0-1.0',
		url: 'https://about.google/brand-resource-center/',
		note: 'the fan — one path, 9 subpaths: four tapering blades and five detached pivot '
			+ 'dots, at Google\'s own #4285F4. There was never a sourcing objection here; flag 27 '
			+ 'declined it on legibility and the fix round retried the reduction'
	},
	simplifications: [
		'PRETTIER RIDER. Measured at the open envelope — the widest fit the grid allows a mark '
		+ 'with empty corners — the official nine-subpath fan runs 0.75 px at the 5th percentile '
		+ 'and 0.94 px at the 25th, against L5\'s 1.2 px official-forced floor. At 16 px it is a '
		+ 'blue scatter',
		'the FIVE detached pivot dots are dropped and the four blades kept, which is exactly what '
		+ 'L5\'s detail budget asks for — keep the gestalt, drop the interior detail. That takes '
		+ 'the ink to 2.25 px at the 25th percentile and 3.06 px at the median. Every blade keeps '
		+ 'its official contour, angle and position: nothing is thickened, moved or redrawn, and '
		+ 'the deletion is the whole of the reduction',
		'the alternative reductions were measured and are worse: thickening the blades fuses them '
		+ '(they sit 0.31-0.38 px apart at this fit) and keeping two of the five dots is an '
		+ 'arbitrary half-measure that reads as a fan with two specks. Both are in '
		+ 'proofs/license-freed-t3-study.png'
	],
	parts() {
		const sp = subpaths(icon('googleappsscript').path);
		return [{ d: APPSCRIPT_BLADES.map(i => sp[i]).join(''), fill: '#4285F4' }];
	}
};

// =============================================================================
// appwrite — Appwrite
// =============================================================================
// appwrite.io serves its own logomark as a plain SVG at assets/logomark/logo.svg:
// two paths in #FD366E, the open "C" and the bar that closes its mouth. Brand
// tier, first try, and simple-icons' CC0 trace of the same drawing agrees with it
// hex for hex — which is the corroboration L2 likes and not the source.
//
// Nothing to simplify: measured at the wide envelope the thinnest sustained run
// is 1.38 px and the 5th percentile 2.50 px, so the whole mark sits clear of the
// floor. It is the most comfortable brand file in the tranche after bazel.
//
// Licence, honestly: no declared terms on the asset; appwrite/appwrite itself is
// BSD-3-Clause. That is tranche 1's chrome situation and it is flagged the same
// way.
S.appwrite = {
	title: 'Appwrite',
	brand: '#FD366E',
	env: ENV.wide,
	source: {
		name: 'Appwrite (brand\'s own SVG)', slug: 'appwrite',
		license: 'no declared licence on the asset — Appwrite trademark; the project '
			+ '(appwrite/appwrite) is BSD-3-Clause (chrome precedent; see the flags)',
		url: 'https://appwrite.io/assets/logomark/logo.svg',
		artwork: 'appwrite-official.svg',
		note: '112x98, two paths in #FD366E: the open bracket and the bar that closes it. '
			+ 'simple-icons\' CC0 trace records the same drawing and the same hex, which corroborates '
			+ 'the source without being it. Fetched to sources-svg/appwrite-official.svg'
	},
	simplifications: [],
	parts() {
		return officialShapes('appwrite-official.svg').map(s => ({ d: s.d, fill: '#FD366E' }));
	}
};

// =============================================================================
// arduino — Arduino
// =============================================================================
// The one subject in this tranche where the brand tier was reached, kept, and
// then NOT shipped, and the reason is fidelity rather than licensing.
//
// content.arduino.cc publishes Arduino_logo_teal.svg — the brand's own lockup:
// the infinity symbol over the "Arduino" wordmark, plus the registered-trademark
// glyph, seven paths, all #00878F. It is fetched and it is what the fidelity
// strip shows. Its infinity has THREE subpaths — the outer contour and the two
// loop counters — and nothing else: the file draws a plain infinity.
//
// The Arduino mark is not a plain infinity. It is the infinity with a MINUS in
// the left loop and a PLUS in the right one, which is the whole point of the
// drawing, and both simple-icons (CC0) and Material and vscode-icons draw it that
// way. So the CC0 trace ships: five subpaths, outer contour, two counters, the
// minus and the plus, at the brand's own #00878F.
//
// What L5 says, MEASURED at the flat envelope (the widest fit for a 2.1:1 mark):
// the ring itself runs 1.25-1.50 px and clears the floor; the minus bar is 1.13
// units of 24 and lands on 0.72 px, and the plus strokes with it. Those two
// features are UNDER the floor and are kept at official proportions anyway — the
// docker/chrome reading of L5, where official detail the mark itself carries as a
// fine feature is kept rather than thickened. At 16 px they render as a dark
// notch in each loop, which is what turns a generic infinity back into Arduino.
// Judge that at 16 px; the alternative is a plain infinity that is nobody's mark.
S.arduino = {
	title: 'Arduino',
	brand: '#00878F',
	env: ENV.flat,
	source: {
		name: 'simple-icons', slug: 'arduino', license: 'CC0-1.0',
		url: 'https://content.arduino.cc/website/Arduino_logo_teal.svg',
		artwork: 'arduino-official.svg',
		note: 'the infinity with the minus and plus in its loops — one path, 5 subpaths. Arduino\'s '
			+ 'OWN lockup is fetched to sources-svg/arduino-official.svg and is what the fidelity '
			+ 'strip shows, but it is not the shipped geometry: its infinity is drawn WITHOUT the '
			+ 'plus and minus (three subpaths, outer contour plus two plain counters), and a plain '
			+ 'infinity is not the Arduino mark. Material and vscode-icons both draw the plus and '
			+ 'minus too. brand-colors.json has no arduino entry, so the brand\'s own #00878F stands'
	},
	simplifications: [
		'the brand\'s own published file is NOT the source: content.arduino.cc\'s '
		+ 'Arduino_logo_teal.svg is a lockup (infinity + "Arduino" wordmark + the registered mark) '
		+ 'whose infinity has no plus and no minus in it. The CC0 trace carries the full mark, so '
		+ 'L2\'s second tier ships and the brand file stays as the fidelity reference',
		'NOT reduced, and measured so it can be ruled on: at the flat envelope the ring runs '
		+ '1.25-1.50 px and clears L5\'s floor, but the minus bar is 1.13 of 24 source units and '
		+ 'lands on 0.72 px, with the plus strokes beside it. Both are kept at official proportions '
		+ '— the docker/chrome reading, where fine official detail is kept rather than thickened. '
		+ 'They render as a notch in each loop, and they are what makes this Arduino rather than a '
		+ 'generic infinity'
	],
	parts() {
		return [{ d: icon('arduino').path, fill: '#00878F' }];
	}
};

// =============================================================================
// asp — classic ASP
// =============================================================================
// RULE 2, and this is the pile's simplest member once the concept is read
// correctly. `asp` matches .asa/.asax/.ascx/.asp and the language ids "asp" and
// "asp (html)": CLASSIC ASP, Microsoft's 1996 Active Server Pages, which predates
// .NET by five years. Classic ASP never had a mark of its own — not a retired
// one, not a deprecated one, none — and Microsoft's current .NET mark is not
// retroactively its. vscode-icons draws the letters "ASP" in a teal of its own
// choosing, which R1 has no place for.
//
// (aspx is a different call and gets its own entry: .aspx IS ASP.NET, and ASP.NET
// IS .NET, whose mark is real, published and CC0.)
// FIX ROUND (2026-09-03): see aspx below. The two concepts CONVERGE on the roster —
// asp's own extension list is .asa/.asax/.ascx/.asp/.aspx, and three of those five
// (.asax, .ascx, .aspx) are ASP.NET files, which aspx also claims — so the pair is
// declared a rule-1(b) family on the .NET mark rather than left to disagree in the
// tree. The reasoning and the alternative are flagged; this is a judgement call and
// it is the one place in the fix round where the honest answer is genuinely split.
S.asp = null;   // defined below, next to aspx, so the family reads in one place

// =============================================================================
// aspx — ASP.NET / .NET
// =============================================================================
// RULE 2 on legibility, and the counter-example the brief asked for — pointing
// the opposite way from what anyone expected.
//
// SOURCING, which is the part that changes a tranche-2 finding. Flag 13 states
// that "no Microsoft marks remain in simple-icons v16.29.0". That is not correct:
// v16.29.0 carries `dotnet` (#512BD4) and `blazor`, and simple-icons records
// dotnet's source as github.com/dotnet/brand/logo/dotnet-logo.svg with a DECLARED
// CC0-1.0 licence. That repo is Microsoft's own .NET brand repo; it is licensed
// CC0-1.0 and its README says in as many words that you may "use the
// illustrations and logo to represent .NET in related content". The file is
// fetched to sources-svg/dotnet-official.svg. So for aspx both of L2's tiers are
// full, the licence is the cleanest in the tranche, and the corporate-mark
// argument does not apply.
//
// LEGIBILITY, which is what actually decides it. The .NET logo is a 456x456
// #512BD4 field with ".NET" knocked out of it in white — a four-glyph logotype
// inside a plate. The letters occupy 324 x 118.5 of the 456 field, i.e. 71% of
// its width and 26% of its height, and their stems are 19.2 units. Fitted at the
// compact envelope the plate is 12.75 px and the stems land on 0.54 px. That is
// less than HALF of abap's SAP letters (1.00-1.25 px, which passed) and under
// half of L5's floor. The 16 px render is a purple square with a white smear on
// it, and the study shows it next to abap so the two can be compared directly.
//
// REBUILT IN THE FIX ROUND (2026-09-03) — and again this was never a licence case.
// Flag 25 already established that dotnet/brand is CC0-1.0 and Microsoft's own; flag
// 27 declined it on legibility, saying "the only reductions available are dropping
// the field (leaving a bare wordmark, which is ada's case) or dropping letters
// (leaving '.N', which is not a mark)". The second half of that is wrong, and the
// PILOT already proved it wrong: dotenv's official ".ENV" measured 0.50 px, the
// prettier rider dropped the N and the V, scaled the surviving ".E" 2.5x as ONE
// group and re-centred it on the square, and the pilot gate approved it as built.
//
// THE SAME REDUCTION, on the same numbers. The .NET logo is a #512BD4 field with a
// four-glyph ".NET" knocked out of it in white; measured on the letters alone at the
// compact envelope, their stems land on 0.50 px. Keep the official dot and the
// official "N", scale that pair 2.5x as one group — dotenv's own constant — and
// re-centre it on the field: the stems come back at 1.25 px at the 5th percentile
// and 1.38 at the median, over L5's official-forced floor. Every letterform is
// Microsoft's own geometry; nothing is re-drawn, and the group's internal spacing is
// the file's own. k = 2.2 was measured too and lands on 1.13 px, under the floor.
//
// WHICH LETTERS: the dot and the N, because that is what the lockup leads with and
// what dotenv's precedent takes — the leading glyphs, not a chosen pair.
//
// WORKING RULE 1(b) for asp: the roster gives `asp` the extensions .asa, .asax,
// .ascx, .asp AND .aspx, and gives `aspx` .ascx and .aspx — so the two concepts
// overlap on two extensions and three of asp's five are ASP.NET files. Left to
// disagree they would put two different icons on the same file types depending on
// which matcher rule wins. They are therefore declared a family on the .NET mark.
// The cost is honest and is flagged: a classic Global.asa gets .NET's mark, and
// classic ASP predates .NET by five years.
const ASPX_K = 2.5;
const dotnetSpec = (title, isBase) => ({
	title,
	brand: '#512BD4',
	env: ENV.compact,
	plate: true,   // an official FIELD carrying a glyph (R8 lane, see audit.mjs)
	...(isBase ? {} : { family: { name: 'dotnet', base: 'aspx', from: 'A01', mode: 'identical' } }),
	source: {
		name: '.NET (Microsoft\'s own brand repo)', slug: 'dotnet', license: 'CC0-1.0 '
			+ '(github.com/dotnet/brand) — the cleanest-licensed source in the slice, and its '
			+ 'README says you may "use the illustrations and logo to represent .NET in related '
			+ 'content"',
		url: 'https://github.com/dotnet/brand/blob/main/logo/dotnet-logo.svg',
		artwork: 'dotnet-official.svg',
		note: '456x456: the #512BD4 field with the four-glyph ".NET" logotype knocked out of it '
			+ 'in white — the field, the dot, and N, E, T as four separate paths. simple-icons '
			+ 'carries the same mark as slug `dotnet`, which is how flag 25 found the repo'
	},
	simplifications: [
		'PRETTIER RIDER, the dotenv reduction executed on the same numbers. Measured on the '
		+ 'letters alone at the compact envelope, the official ".NET" stems land on 0.50 px — '
		+ 'the identical measurement dotenv\'s ".ENV" gave, and less than half of abap\'s SAP '
		+ 'letters (1.00-1.25 px), which passed',
		`letters E and T dropped; the surviving ".N" is the official dot and the official N, `
		+ `scaled ${ASPX_K}x as ONE group — dotenv's own constant — and re-centred on the field. `
		+ 'The stems come back at 1.25 px at the 5th percentile and 1.38 px at the median, over '
		+ 'L5\'s official-forced 1.2 px floor. k = 2.2 was measured and lands on 1.13 px, under '
		+ 'it. Every letterform is Microsoft\'s own geometry and the pair\'s internal spacing is '
		+ 'the file\'s own',
		'official colours kept verbatim: #512BD4 field, #FFFFFF ink. The white is not lifted and '
		+ 'the purple is not brightened — the ink prints on the mark\'s own field',
		...(isBase ? [] : [
			'WORKING RULE 1(b): the roster gives `asp` the extensions .asa/.asax/.ascx/.asp/.aspx '
			+ 'and `aspx` the extensions .ascx/.aspx, so the two concepts overlap on two of them '
			+ 'and three of asp\'s five are ASP.NET files. Left to disagree they would put two '
			+ 'different icons on the same file types depending on which matcher rule won, so asp '
			+ 'ships the family base mark byte-identically. The cost is real and flagged: a '
			+ 'classic Global.asa gets .NET\'s mark, and classic ASP predates .NET by five years'
		])
	],
	parts() {
		// the field is a <rect> in the brand's file, so it comes through the local reader;
		// the four letter glyphs are paths, in the lockup's own order: dot, N, E, T
		const field = rects('dotnet-official.svg')[0];
		const [dot, N] = officialShapes('dotnet-official.svg').map(x => x.d);
		const g = unionBBox([dot, N]);
		const dx = 228 - g.cx * ASPX_K, dy = 228 - g.cy * ASPX_K;
		return [
			{ d: field.d, fill: '#512BD4' },
			{ d: xform(dot, { sx: ASPX_K, dx, dy }) + xform(N, { sx: ASPX_K, dx, dy }), fill: WHITE }
		];
	}
});
S.aspx = dotnetSpec('ASP.NET', true);
S.asp = dotnetSpec('ASP / ASP.NET', false);

// =============================================================================
// atom — the Atom Syndication Format
// =============================================================================
// RULE 2 after reading the concept rather than its name. An `.atom` file is an
// ATOM FEED — the Atom Syndication Format, RFC 4287, an IETF standard and a
// sibling of RSS. It is not the Atom editor, which never used the extension, and
// the editor's sunset is beside the point.
//
// A published IETF format has no owner and no mark. The evidence that the themes
// agree: Material maps `.atom` to its XML icon, in the same extension list as
// .bpmn, .dita and .xml.dist; vscode-icons draws a science-diagram atom — a
// nucleus with three orbits in four muted colours — which is a pun on the name
// and traces nothing.
S.atom = codeGlyph('Atom feed',
	'no mark exists, and the concept is not what the name suggests: an `.atom` file is an ATOM FEED '
	+ '(the Atom Syndication Format, RFC 4287, an IETF standard), not an Atom-editor file — the '
	+ 'editor never used the extension. Material agrees and maps `.atom` to its XML icon, in the same '
	+ 'list as .bpmn and .dita; vscode-icons draws a science-diagram atom, which is a pun on the name '
	+ 'and traces nothing. A published IETF format has no owner and no mark');

// =============================================================================
// ats — ATS (Applied Type System)
// =============================================================================
// RULE 2. ATS is a research language out of Boston University; its home is
// ats-lang.sourceforge.net, which refuses automated fetches (403 on every
// attempt), and ats-lang.github.io carries no images at all. simple-icons has no
// entry.
//
// What does exist is a Wikimedia Commons file, "The ATS Logo.svg" — and it is not
// a source L2 can use: its Commons metadata records it as CC BY-SA 4.0 "own
// work", i.e. a Wikipedia contributor's drawing, and the file itself is a potrace
// autotrace of a bitmap (its own metadata says so). A contributor's autotrace of
// an unknown raster is not the brand's artwork and is not a faithful vector of a
// verified official mark; it is exactly the freehand-from-a-bitmap route L2
// hard-rejects. vscode-icons draws a yellow disc with a script glyph, which
// matches neither.
S.ats = codeGlyph('ATS',
	'no usable mark: ats-lang.sourceforge.net refuses automated fetches (403) and ats-lang.github.io '
	+ 'carries no images; simple-icons has no entry. Wikimedia Commons holds "The ATS Logo.svg", '
	+ 'which is NOT a source L2 can use — its own metadata records it as a contributor\'s CC BY-SA '
	+ '4.0 "own work" and as a potrace autotrace of a bitmap, which is the freehand-from-a-raster '
	+ 'route L2 hard-rejects. vscode-icons draws a yellow disc with a script glyph that matches '
	+ 'neither');

// =============================================================================
// autohotkey — AutoHotkey
// =============================================================================
// RULE 2, executing tranche 2's flag 21 exactly as it asked.
//
// Flag 21 measured the AutoHotkey mark on ahk2 and found it fails twice, then
// deliberately declined to declare a family and told this tranche to measure
// `autohotkey` itself and reach its own verdict. Measured here, independently,
// on the same simple-icons `autohotkey` trace at the same compact envelope:
//
//   · LEGIBILITY. Nothing in the mark exceeds 0.50 px of sustained ink. The
//     keycap's outline wall and the "AHK" letter stems both come back at
//     0.25-0.50 px, with a 25th percentile of 0.63 px. Confirmed.
//   · CONTRAST. The official #334455 measures 1.86:1 against the #121314 editor
//     ground and sits at L 26.7, above the L 22 the lift rule triggers on, so no
//     rule reaches it and inventing a brighter AutoHotkey blue is not R1's to do.
//     Confirmed, and the study shows the mark with its ink lifted anyway, which
//     changes nothing about the legibility.
//
// So the verdict is the same on both sides, and flag 21's own instruction
// applies: autohotkey ships the neutral glyph, both ids sit in the generic-code
// collapse, and NO family is declared — there is no family mark for a base to be
// identical to. That is recorded in the flags so the pair reads consistently.
S.autohotkey = codeGlyph('AutoHotkey',
	'a real mark exists (the "AHK" keycap — autohotkey.com ships ahk_logo.svg and simple-icons '
	+ 'traces it CC0 as `autohotkey`) and fails twice at 16 px, re-measured independently of tranche '
	+ '2: nothing in the mark exceeds 0.50 px of sustained ink (outline wall and letter stems both '
	+ '0.25-0.50 px, 25th percentile 0.63 px), and the official #334455 measures 1.86:1 against the '
	+ '#121314 ground. FIX ROUND: the lift rule\'s trigger was re-derived to test contrast at '
	+ '3.0:1 rather than lightness at L 22, so that objection is now SOLVED — and it changes '
	+ 'nothing, because the study already showed the mark lifted and it is exactly as illegible. '
	+ 'Tranche 2\'s flag '
	+ '21 asked for exactly this measurement and it comes out the same way, so autohotkey and ahk2 '
	+ 'both sit in the generic-code collapse and NO family is declared — see the flags. RE-TESTED '
	+ 'in the fix round: sourcing was never the objection here, and the one reduction that clears '
	+ 'L5 — shrinking the keycap\'s counter until the wall reaches 1.50 px — only does so by '
	+ 'deleting the "AHK", which leaves a plain rounded-square ring that is not the mark. '
	+ 'autohotkey.com\'s own modern logo was fetched too and is worse: 137.78 x 22.19 units of '
	+ '"AutoHotkey" spelled out as seventy-five gradient-painted keycaps');

// =============================================================================
// autoit — AutoIt
// =============================================================================
// AutoIt's mark is a blue disc with a white ring around it and a white chevron
// "A" inside, and autoitscript.com publishes it as a favicon.ico and nothing
// else — a 48/32/16 px raster bundle, which is not a vector. simple-icons carries
// the CC0 trace at the brand's own #5D83AC, three subpaths (disc, ring, glyph),
// so L2's second tier ships.
//
// Measured at the compact envelope: the ring is the binding feature at 1.25 px
// (5th percentile) with a median of 1.50, so the mark clears L5's floor
// everywhere except the chevron's own tip. The 16 px render keeps all three
// features apart.
//
// Contrast, recorded because it is the dimmest brand hue in the tranche after
// bicep's alternative: #5D83AC measures 4.70:1 on the editor ground.
S.autoit = {
	title: 'AutoIt',
	brand: '#5D83AC',
	env: ENV.compact,
	source: {
		name: 'simple-icons', slug: 'autoit', license: 'CC0-1.0',
		url: 'https://www.autoitscript.com',
		note: 'the disc with the white ring and the chevron "A" — one path, 3 subpaths. AutoIt\'s '
			+ 'own site publishes the mark as favicon.ico (a 48/32/16 px raster bundle) and no vector '
			+ 'anywhere, so the CC0 trace is the source. brand-colors.json has no autoit entry, so '
			+ 'simple-icons\' #5D83AC — which is the brand\'s own blue — stands'
	},
	simplifications: [],
	parts() {
		return [{ d: icon('autoit').path, fill: '#5D83AC' }];
	}
};

// =============================================================================
// avalonia — Avalonia
// =============================================================================
// The cleanest brand-tier find in the tranche. AvaloniaUI/Avalonia is MIT and
// carries build/Assets/icon.svg: one path in #007DF9, four subpaths — the
// squared-off "a" bowl, its counter, the notch and the detached dot on the left.
// Nothing to flatten, nothing to drop.
//
// Colour, and the one thing to know: simple-icons records Avalonia as #165BFF
// (sourced from avaloniaui.net) and the brand's own repo file paints #007DF9.
// brand-colors.json has no avalonia entry, so the pilot's source-of-truth rule
// never fires and L2's own preference decides: the brand's own file wins outright
// over a trace of the brand's website, geometry and colour together.
S.avalonia = {
	title: 'Avalonia',
	brand: '#007DF9',
	env: ENV.compact,
	source: {
		name: 'Avalonia (brand\'s own SVG)', slug: 'avalonia', license: 'MIT (AvaloniaUI/Avalonia)',
		url: 'https://github.com/AvaloniaUI/Avalonia/blob/master/build/Assets/icon.svg',
		artwork: 'avalonia-official.svg',
		note: '48x48, one path in #007DF9 with 4 subpaths: the squared "a" bowl, its counter, the '
			+ 'corner notch and the detached dot. simple-icons records Avalonia as #165BFF from '
			+ 'avaloniaui.net; brand-colors.json has no entry, so the brand\'s own repo file wins '
			+ 'geometry AND colour under L2. Fetched to sources-svg/avalonia-official.svg'
	},
	simplifications: [],
	parts() {
		return [{ d: officialShapes('avalonia-official.svg')[0].d, fill: '#007DF9' }];
	}
};

// =============================================================================
// avro — Apache Avro
// =============================================================================
// The brief asked what Avro's actual mark is, and the answer is: not a feather.
// The Apache feather belongs to the FOUNDATION; Avro is one of its projects and
// publishes its own mark in its own repo — apache/avro, Apache-2.0,
// doc/assets/images/logo.svg. It is an angular three-colour dart: the pale
// #1CCCFC body and its second wing, a #0068E0 lower vane and a #000094 shadow
// vane, on a 35x30 artboard.
//
// Two things are recorded rather than smoothed over.
//
// COLOUR. simple-icons carries `apacheavro` at #30638E, a single flat blue that
// is neither of the artwork's blues; the brand's own file is three-colour and R1
// keeps multi-colour marks multi-colour, so the artwork wins. The #000094 shadow
// vane measures 1.26:1 against the #121314 editor ground and effectively reads as
// a hole in the mark. The lift rule does not reach it — not on a threshold, but on
// SCOPE: the pilot's erratum fires the lift on a mark's own ink where that ink meets
// the backdrop, and never on one facet of a multi-tone mark, because lifting one
// vane of three would invent a colour Avro does not publish. (The fix round widened
// the lift's trigger from L 22 to a 3.0:1 contrast test; it is opt-in per subject
// and avro does not opt in, so nothing here moved.) It is kept, and the number is
// on the sheet.
//
// GEOMETRY. Measured at the compact envelope the dart's spine runs 1.38-3.63 px
// and the wing tips taper to 0.50 px, which is the mark's own drawing rather than
// the fit — the same reading debian's brush taper got. Nothing is simplified.
S.avro = {
	title: 'Apache Avro',
	brand: '#1CCCFC',
	env: ENV.compact,
	source: {
		name: 'Apache Avro (brand\'s own SVG)', slug: 'avro', license: 'Apache-2.0 (apache/avro)',
		url: 'https://github.com/apache/avro/blob/main/doc/assets/images/logo.svg',
		artwork: 'avro-official.svg',
		note: '35x30, four paths: the #1CCCFC dart body and its second wing, a #0068E0 vane and a '
			+ '#000094 shadow vane. NOT the Apache feather, which is the foundation\'s mark and not '
			+ 'Avro\'s. simple-icons\' `apacheavro` flattens the whole thing to one #30638E, which R1 '
			+ 'does not want. Fetched to sources-svg/avro-official.svg'
	},
	simplifications: [
		'the CC0 trace is NOT used: simple-icons\' `apacheavro` renders the mark as a single flat '
		+ '#30638E, and R1 keeps multi-colour marks multi-colour, so the brand\'s own three-colour '
		+ 'file ships instead',
		'the #000094 shadow vane is NOT lifted and measures 1.26:1 on the #121314 ground, so at 16 px '
		+ 'it reads as a dark notch between the two bright vanes rather than as a third colour. The '
		+ 'lift rule does not reach it on SCOPE rather than on a threshold: the pilot\'s erratum '
		+ 'fires it on a mark\'s own ink where that ink meets the backdrop and never on one facet '
		+ 'of a multi-tone mark, because lifting one vane of three would invent a colour Avro does '
		+ 'not publish',
		'NOT reduced, and measured: the dart\'s spine runs 1.38-3.63 px at this envelope and its wing '
		+ 'tips taper to 0.50 px. That taper is the mark\'s own drawing, the way debian\'s brush '
		+ 'thins to nothing, and not a consequence of the fit'
	],
	parts() {
		return officialShapes('avro-official.svg').map(s => ({ d: s.d, fill: s.fill }));
	}
};

// =============================================================================
// awk — AWK
// =============================================================================
// RULE 2. AWK is a POSIX utility named after Aho, Weinberger and Kernighan; it is
// a specification with no owner and no mark. vscode-icons draws a black AUK — the
// seabird — which is a pun on the name and traces nothing; Material files .awk
// with its shell icon, in the same extension list as .sh, .bash and .zsh.
//
// A shell/terminal object glyph WAS considered here, because Material's reading
// is a fair one and it would also serve bat and bashly-hook. It is not added, for
// two reasons that are on the sheet: tranche 2 already put applescript — a
// scripting language with the same claim — on the generic-code glyph, so adding
// the glyph now would make the set inconsistent with a decision three subjects
// ago; and the vocabulary is better opened in the slice that actually contains
// `shell` and `bash`, where the ruling can move applescript with it.
// THE TERMINAL OBJECT GLYPH, OPENED BY THE FIX ROUND (2026-09-03).
//
// Tranche 3 built and measured this glyph and then declined it for ONE stated
// reason: "tranche 2 already put applescript — a scripting language with the same
// claim — on the generic-code glyph, so adding the glyph now would make the set
// inconsistent with a decision three subjects ago". The fix round moved applescript
// to the Apple logo, so that reason is gone, and the fix round's brief charters the
// glyph outright if bat lands on it.
//
// WHY IT IS AN OBJECT GLYPH AND NOT A METAPHOR: working rule 2's test is whether the
// concept NAMES an object. A .bat and a .awk are not run by a metaphor — they are
// run in a terminal, and Material independently files both with its shell icon. That
// is the same test disc, lib and abc passed, and it is a narrower reading than the
// one the stopwatch needed.
//
// R8: checked against the whole vocabulary and every shipped mark before it opened,
// which is the vocabulary discipline; the numbers are printed by the twin audit on
// every run. L5: 1.81 px at the 5th percentile, 2.63 at the 25th, one sub-shape with
// two counters so nothing can fuse.
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
S.awk = shellGlyph('AWK',
	'no mark exists: AWK is a POSIX utility named after its three authors, a specification with no '
	+ 'owner and no artwork, and vscode-icons draws a black auk (the seabird), which is a pun on '
	+ 'the name and traces nothing. FIX ROUND: it takes the TERMINAL object glyph, new in '
	+ 'geom.mjs. Tranche 3 built and measured this glyph and declined it for one reason — that '
	+ 'applescript was already on the generic-code glyph and opening a shell glyph would make the '
	+ 'set inconsistent three subjects back — and the fix round moved applescript to the Apple '
	+ 'logo, so the reason is gone. Material independently files .awk with its shell icon');

// =============================================================================
// axure — Axure RP
// =============================================================================
// RULE 2 after a hunt that found artwork and no MARK. axure.com publishes
// images/2019/04/logo-black.svg, and it is a LOGOTYPE: the word "Axure" set in
// #272727 with three of its letters accented (#74BB11 green, #009CD9 blue,
// #EB2084 pink), 118 x 29 units. There is no symbol anywhere on the site — the
// only other vector it serves is a marketing infinity illustration, which is not
// a mark — and simple-icons has no axure entry.
//
// A five-letter logotype at 118:29 is ada's case with two more letters: at the
// flat envelope the whole thing is 15.2 x 3.7 px. Nothing was built, because
// there is nothing that could be.
S.axure = codeGlyph('Axure RP',
	'no usable mark, RE-HUNTED in the fix round with licence free and still nothing. axure.com '
	+ 'publishes exactly three images of itself: images/2019/04/logo-black.svg, which is the word '
	+ '"Axure" in #272727 with three accented letters at 118 x 29 units — ada\'s case with two more '
	+ 'letters, 15.2 x 3.7 px at the flat envelope; images/2021/03/infinity.svg, which sits in a '
	+ 'mid-page marketing block rather than in any logo position, is a plain blue infinity, and '
	+ 'would R8-collide head-on with arduino\'s real infinity two subjects away; and '
	+ 'images/2026/01/Axure_RP_icon.png, the APP icon, as a raster — and L2 hard-rejects tracing a '
	+ 'raster, which is a fidelity rule the ruling does not reach. simple-icons has no entry');

// =============================================================================
// azure + azurestreamanalytics — Microsoft Azure
// =============================================================================
// RULE 2, and the Microsoft line is redrawn here on firmer ground than tranche 2
// had.
//
// Tranche 2's flag 13 declines Microsoft marks because "both L2 tiers are empty".
// The first half of that is now known to be false — simple-icons v16.29.0 carries
// `dotnet` and `blazor`, and dotnet/brand publishes the .NET logo CC0 — so the
// rule needs a better test than absence from a library, and Microsoft supplies
// one itself.
//
// Microsoft publishes the Azure marks, as the Azure architecture icon set, with
// terms printed on the download page and quoted here verbatim:
//
//   "Microsoft permits the use of these icons in architectural diagrams, training
//    materials, or documentation. You can copy, distribute, and display the icons
//    only for the permitted use unless granted explicit permission by Microsoft.
//    Microsoft reserves all other rights."
//
// A file-type icon inside a shipped product is none of those three permitted
// uses, and R1's pipeline necessarily MODIFIES the artwork (affine fit, gradient
// flattening), which the terms do not permit at all. That is a licence decline
// with a citation, not an inference from a missing slug.
//
// The complication, recorded because it is real: Azure/bicep (MIT) VENDORS that
// same icon set at src/vscode-bicep-ui/.../azure-architecture-icons/, including
// analytics/00042-icon-service-Stream-Analytics-Jobs.svg — which is exactly
// azurestreamanalytics's official artwork, sitting inside an MIT repo. Whether a
// repo licence can re-license artwork the rights-holder publishes under narrower
// terms is a question for a human, so it is flagged rather than assumed either
// way. Note that bicep's OWN logo does not raise it: that file is original to the
// repo and is shipped (see bicep below).
//
// vscode-icons traces the Azure "A" for azure and the gear-and-waves service icon
// for azurestreamanalytics; both are traces of the same restricted artwork. The
// two ids are recorded as a related pair in the flags so a ruling moves both.
// REBUILT IN THE FIX ROUND (2026-09-03). Flag 26 is the cleanest licence decline in
// the slice — it quotes Microsoft's own terms verbatim — and the ruling dissolves it
// outright: licence does not gate. So azure ships the Azure "A".
//
// SOURCING, by fidelity. The Azure architecture icon set is SERVICE icons and does
// not contain the corporate A (the fix round checked: the vendored set inside
// Azure/bicep has 176 files across nineteen categories and none of them is the
// mark). Microsoft serves no vector of the A from azure.microsoft.com either. What
// exists are faithful vectors of the same official artwork — devicon (MIT) and
// gilbarbara/logos both carry it with Microsoft's own gradient stops — and devicon's
// is the licensed one, so it supplies the geometry.
//
// R1 flattening, logged: the two gradients go to their offset-1 stops (the chrome
// reading), which is #0669BC for the left wedge and #2892DF for the right; the flat
// #0078D4 connector is the file's own and is also brand-colors.json's Azure blue, so
// the source-of-truth rule fires and agrees with the artwork; and the file's fourth
// layer — a pure-black gradient at stop-opacity 0.3 down to 0, the shadow under the
// fold — is DROPPED, because L8 bans opacity and compositing it by hand would invent
// a hex the file never declares. That is bicep's cube-face reduction again.
//
// Measured at the compact envelope: 2.56 px at the 5th percentile, 4.19 at the 25th.
const azureFlat = (s) => s.fill || s.gradient[s.gradient.length - 1].color;
/**
 * The Azure file's fourth layer is a SHADING WASH: a gradient whose stops declare
 * stop-opacity only and no stop-color at all, so it is black at 0.3 alpha falling to
 * 0 — the shadow under the fold. L8 bans opacity and there is no hex to flatten to,
 * so it is dropped. Testing for "no declared colour" is the honest test; testing for
 * #000000 is not, because the file never writes that hex.
 */
const isShadingWash = (s) => !!s.gradient && s.gradient.every(g => !g.color);
const AZURE_SRC = {
	name: 'Microsoft Azure (faithful vector — devicon)', slug: 'azure',
	license: 'MIT (devicons/devicon); the mark itself is a Microsoft trademark, and Microsoft\'s '
		+ 'own Azure icon terms read verbatim: "Microsoft permits the use of these icons in '
		+ 'architectural diagrams, training materials, or documentation. You can copy, '
		+ 'distribute, and display the icons only for the permitted use unless granted explicit '
		+ 'permission by Microsoft. Microsoft reserves all other rights." Recorded in full and '
		+ 'NOT gating, per the fix-round ruling',
	url: 'https://github.com/devicons/devicon/blob/master/icons/azure/azure-original.svg',
	artwork: 'azure-devicon.svg',
	note: '128x128, four painted layers: the left wedge under a #114A8B->#0669BC gradient, the '
		+ 'flat #0078D4 connector, a shading wash whose stops carry stop-opacity 0.3->0 and no '
		+ 'stop-color at all, and the right wedge under #3CCBF4->#2892DF. The Azure ARCHITECTURE icon set does not contain '
		+ 'this mark — it is service icons, 176 of them in the copy Azure/bicep vendors, and none '
		+ 'is the corporate A — and azure.microsoft.com serves no vector, so this is the '
		+ 'faithful-vector tier. Fetched to sources-svg/azure-devicon.svg'
};
S.azure = {
	title: 'Microsoft Azure',
	brand: '#0078D4',
	env: ENV.compact,
	source: { ...AZURE_SRC },
	simplifications: [
		'the two wedge gradients flattened to their dominant flat stops — offset 1 of each: '
		+ '#114A8B->#0669BC left, #3CCBF4->#2892DF right (L2, the reading chrome ratified)',
		'the file\'s fourth layer is DROPPED: a shading wash whose five gradient stops declare '
		+ 'stop-opacity only (0.3 falling to 0) and no stop-color at all, i.e. black at low '
		+ 'alpha — the shadow under the fold. L8 bans opacity and there is no hex to flatten it '
		+ 'to, since the file never writes one; compositing it by hand would invent a colour. '
		+ 'That is bicep\'s cube-face reduction again. The mark keeps its three official blues '
		+ 'and loses the shading between them',
		'the flat #0078D4 connector is the file\'s own AND brand-colors.json\'s Azure blue, so '
		+ 'the pilot\'s colour source-of-truth rule fires and finds nothing to correct',
		'NOT reduced, and measured: at the compact envelope the mark runs 2.56 px at the 5th '
		+ 'percentile and 4.19 px at the 25th — nothing in it is near L5\'s floor'
	],
	parts() {
		return officialShapes('azure-devicon.svg')
			.filter(s => !isShadingWash(s))
			.map(s => ({ d: s.d, fill: azureFlat(s) }));
	}
};

// WORKING RULE 1(b), decided by MEASUREMENT rather than by preference. With the
// licence gone, azurestreamanalytics's own official artwork is available and was
// built: 00042-icon-service-Stream-Analytics-Jobs.svg out of the set Azure/bicep
// vendors, kept at sources-svg/azure-stream-analytics-official.svg. It does not
// survive. The service icon is a gray gradient cog with three thin cyan stream arcs
// threaded through it, and at the compact envelope its sustained ink runs are
// 0.50 px at the 5th percentile, 0.69 at the 25th and 1.19 at the median — the arcs
// are drawn as ~0.9-unit strokes on an 18-unit artboard and land on 0.65 px. At
// 16 px it is a gray blob with a cyan smear, and the reduction available (drop the
// arcs) leaves a cog, which is not the mark and is a generic object besides.
//
// So branch (a) has a variant glyph and it cannot be read, which is the case rule 1
// did not have before: the honest fallback is branch (b), and .asaql is an Azure
// service file, so the family base is azure and the payload is byte-identical.
S.azurestreamanalytics = {
	title: 'Azure Stream Analytics',
	brand: '#0078D4',
	env: ENV.compact,
	family: { name: 'azure', base: 'azure', from: 'A01', mode: 'identical' },
	source: { ...AZURE_SRC },
	simplifications: [
		...S.azure.simplifications,
		'WORKING RULE 1(b), decided by measurement. This concept HAS its own official artwork — '
		+ '00042-icon-service-Stream-Analytics-Jobs.svg, from the Azure architecture icon set '
		+ 'Azure/bicep vendors, fetched to sources-svg/azure-stream-analytics-official.svg and '
		+ 'rendered in proofs/license-freed-t3-study.png — and it cannot hold 16 px: a gray '
		+ 'gradient cog with three cyan stream arcs threaded through it, the arcs drawn as '
		+ '0.9-unit strokes on an 18-unit artboard, landing on 0.65 px, with the whole mark '
		+ 'measuring 0.50 / 0.69 / 1.19 px at the 5th, 25th and 50th percentiles. Dropping the '
		+ 'arcs leaves a cog, which is not the mark. So the variant ships the family base — the '
		+ 'Azure mark — byte-identically under its own id'
	],
	parts() { return S.azure.parts(); }
};

// =============================================================================
// bak — backup files
// =============================================================================
// RULE 2, category glyph. `.bak` / `.back` / `.backup` are backup copies: no
// brand, and no OBJECT either — "backup" names a state, not a thing, which is
// the test working rule 2 actually applies (disc names a disc, lib names a
// volume, abc names a note). vscode-icons draws a document with a circular
// restore arrow, which is a two-scene composition rather than a mark and past the
// vocabulary's two-sub-shape budget. So the category glyph, and the roster agrees
// — it files bak under `code` with `generic-code` as its own fallback.
S.bak = codeGlyph('Backup file',
	'no brand and no object: "backup" names a state rather than a thing, so working rule 2\'s object '
	+ 'branch does not apply the way it does to disc, lib and abc, and the category glyph does. The '
	+ 'roster files bak under `code` with `generic-code` as its own declared fallback. vscode-icons '
	+ 'draws a document plus a circular restore arrow, which is a two-element scene past the '
	+ 'vocabulary\'s budget');

// =============================================================================
// ballerina — Ballerina
// =============================================================================
// L2's THIRD tier, for the second time in this set (tranche 2 opened it on
// antlr). The hunt, in order:
//   · ballerina.io publishes images/ballerina-logo.svg — and it is the WORDMARK
//     only: 660 x 122 units of #464646 letterforms with no symbol in the file at
//     all. Every other symbol URL the site could plausibly serve answers 404 and
//     its favicon is an .ico. There is no brand vector of the symbol;
//   · simple-icons has no `ballerina` entry;
//   · TWO independent faithful vectors of the symbol exist and agree with each
//     other: vscode-icons' file_type_ballerina.svg (MIT) and Material's
//     ballerina.svg (MIT) draw the same eight-piece figure — the mirrored pair of
//     dancers, arms up, in the brand's teal. That agreement between two
//     independent traces is the corroboration L2's third tier asks for.
// The vscode-icons vector ships, kept at sources-svg/ballerina-vsicons.svg.
//
// Colour: vscode-icons paints #20B4AE and Material #00BFA5. brand-colors.json has
// no ballerina entry, so there is no source-of-truth rule to fire; #20B4AE is the
// teal Ballerina's own site uses and is what ships.
//
// Measured at the tall envelope: the figures' limbs run 2.38 px at the 25th
// percentile with a median of 3.25, so the mark is one of the most comfortable in
// the tranche; only the pointed feet drop below the floor, and those are the
// mark's own drawing.
S.ballerina = {
	title: 'Ballerina',
	brand: '#20B4AE',
	env: ENV.tall,
	source: {
		name: 'vscode-icons (faithful vector, L2 tier 3)', slug: 'ballerina',
		license: 'MIT (vscode-icons/vscode-icons); Ballerina is a WSO2 trademark',
		url: 'https://github.com/vscode-icons/vscode-icons/blob/master/icons/file_type_ballerina.svg',
		artwork: 'ballerina-vsicons.svg',
		note: 'the mirrored pair of dancers — one path, 8 subpaths, in #20B4AE. L2 tier 3, the tier '
			+ 'tranche 2 opened on antlr: ballerina.io publishes images/ballerina-logo.svg, which is '
			+ 'the WORDMARK ONLY (660x122 of #464646 letterforms, no symbol in the file), its favicon '
			+ 'is an .ico, and simple-icons has no entry. Material traces the same symbol '
			+ 'independently (in #00BFA5), which is the corroboration the tier asks for. Fetched to '
			+ 'sources-svg/ballerina-vsicons.svg'
	},
	simplifications: [
		'L2 TIER 3: the geometry comes from vscode-icons\' MIT vector rather than from Ballerina, '
		+ 'because Ballerina publishes the wordmark as SVG and the symbol nowhere. Material\'s '
		+ 'independent trace of the same symbol agrees shape for shape, which is what makes this a '
		+ 'faithful vector of a real mark and not an invention',
		'colour: vscode-icons paints #20B4AE and Material #00BFA5; brand-colors.json has no ballerina '
		+ 'entry, so no source-of-truth rule fires and #20B4AE — the teal ballerina.io itself uses — '
		+ 'ships'
	],
	parts() {
		return officialShapes('ballerina-vsicons.svg').map(s => ({ d: s.d, fill: '#20B4AE' }));
	}
};

// =============================================================================
// bashly-hook — Bashly
// =============================================================================
// RULE 2, and the ahk2 situation from the other side: a VARIANT whose base is not
// in this slice.
//
// `bashly-hook` matches src/before.sh, src/after.sh and src/initialize.sh — the
// lifecycle hooks of Bashly, a Ruby-based bash CLI generator. Bashly does publish
// artwork: DannyBen/bashly carries support/img/bashly-logo.svg. It is a LOCKUP —
// the word "bashly" set beside a hexagonal chevron with a "$" knocked out of it
// — and the "$" is knocked out with an SVG `<mask>`, which L8 bans outright and
// which is the mark's entire content.
//
// Even setting the mask aside, this is a hook file rather than a bashly file: the
// mark that would apply is the base concept's, `bashly` is not in the A01 roster
// (it belongs to a later slice), and there is nothing here for working rule 1 to
// be a variant OF. So no family is declared — the same reasoning tranche 2
// applied to ahk2 — and the concept takes the category glyph.
// REBUILT IN THE FIX ROUND (2026-09-03), and the objection turned out to be a
// reader bug rather than a law. Flag 23 put this on the glyph because bashly's
// symbol is "a hexagonal chevron with a '$' knocked out of it by an SVG `mask`
// element — and L8 bans masks, the mask being the entire content of the glyph".
//
// L8 bans masks in the SHIPPED icon; it does not ban reading one. The mask here is
// the simplest kind there is: a white rectangle that shows everything, with the "$"
// painted black over it to hide that shape. "Show the chevron except where the $ is"
// is exactly a COUNTER, so the conversion is the same class of move as tranche 3's
// polygon reader on bicep and spec-engine's circle reader — a format conversion in
// which every coordinate is the file's own. The chevron is emitted clockwise and the
// $ counter-clockwise, and nonzero winding punches the hole the mask described.
//
// Measured at the compact envelope: 1.88 px at the 25th percentile with the $'s
// counter open at 1.56 px. The wordmark beside the symbol in the lockup is dropped
// (it is a lockup; the symbol is the mark), which is the apex reading.
//
// COLOUR, and this is where the fix round had to touch the engine. The file paints
// the symbol #434343, which is drawn for a light README and measures 1.88:1 on the
// #121314 ground. It is achromatic (S 0), so L6's achromatic exemption bars any
// saturation clamp, and the L2 visibility lift is the rule that applies — except
// that the lift's trigger was written as `L < 22` and #434343 is L 26.3, so it did
// not fire. That is the same gap tranche 2 hit on AutoHotkey's #334455 (L 26.7,
// 1.86:1) and recorded as "no lift rule reaches it".
//
// The trigger is RE-DERIVED in color.mjs to test CONTRAST rather than lightness,
// because contrast against the backdrop is what L5's duty is actually about, at a
// bar of 3.0:1. See the note there for the evidence; the short version is that
// L 22 achromatic measures 1.59:1, so the old rule fired only below about 1.6, and
// the set has never shipped a branded primary dimmer than 4.70:1 nor kept a field
// dimmer than 2.34. The lift stays OPT-IN per subject, so no icon that does not ask
// for it can move, and the pilot's 44 files are byte-identical after the change.
//
// NO FAMILY, still: `bashly` itself is not an A01 roster id, so there is no base in
// this slice for rule 1 to make this a variant of. Tranche 3's reasoning stands; only
// the mark changed.
S['bashly-hook'] = {
	title: 'Bashly hook',
	brand: lift('#434343'),
	env: ENV.compact,
	source: {
		name: 'Bashly (brand\'s own SVG)', slug: 'bashly', license: 'MIT (DannyBen/bashly)',
		url: 'https://github.com/DannyBen/bashly/blob/master/support/img/bashly-logo.svg',
		artwork: 'bashly-official.svg',
		note: '535x150 lockup: the hexagonal chevron symbol and the "bashly" wordmark beside it, '
			+ 'both painted #434343 through an SVG <mask> that knocks a "$" out of them. Only the '
			+ 'symbol ships. src/before.sh, src/after.sh and src/initialize.sh are bashly '
			+ 'lifecycle hooks and exist nowhere but inside a bashly project, which is the '
			+ 'antlers-html/Statamic reading. Fetched to sources-svg/bashly-official.svg'
	},
	simplifications: [
		'the file\'s <mask> is converted to a COUNTER, which is a format conversion and not a '
		+ 'redraw: the mask is a white rectangle (show everything) with the "$" painted black '
		+ 'over it (hide that shape), i.e. "the chevron except where the $ is". The chevron ships '
		+ 'wound clockwise and the $ counter-clockwise so nonzero punches the same hole, with '
		+ 'every coordinate the file\'s own — the bicep-polygon and circle-reader class of move',
		'the "bashly" wordmark beside the symbol is dropped: the file is a LOCKUP and the symbol '
		+ 'is the mark, which is the reading apex ships under',
		'official #434343 lifted to L 88 (#E0E0E0, 14.09:1) for the #121314 backdrop — the one '
		+ 'documented L2 visibility lift, hue and saturation (both zero) untouched. The mark is '
		+ 'drawn for a light README and measures 1.88:1 on the editor ground as published. NOTE '
		+ 'that this required the lift\'s TRIGGER to be re-derived: it read `L < 22` and #434343 '
		+ 'is L 26.3, the same gap tranche 2 hit on AutoHotkey. It now tests contrast against the '
		+ 'backdrop at 3.0:1, which is what L5\'s duty is about — see color.mjs and the flags',
		'NOT reduced, and measured: at the compact envelope the symbol runs 1.88 px at the 25th '
		+ 'percentile with the $ counter open at 1.56 px',
		'NO FAMILY is declared: `bashly` itself is not an A01 roster id, so there is no base in '
		+ 'this slice for working rule 1 to make this a variant of — tranche 3\'s reasoning, '
		+ 'unchanged, with a real mark on it now'
	],
	parts() {
		const ds = officialShapes('bashly-official.svg').map(s => s.d);
		// ds[0] is the "$" (the mask's knock-out), ds[1] the chevron, ds[2] the wordmark
		return [{ d: rewind(ds[1], 1) + rewind(ds[0], -1), fill: lift('#434343') }];
	}
};

// =============================================================================
// bat — Windows batch files
// =============================================================================
// RULE 2, with one trap flagged in the brief and confirmed here. A `.bat` is a
// Windows batch script: Microsoft's file type, no mark of its own, and the same
// nothing classic ASP has.
//
// THE TRAP: simple-icons v16.29.0 does carry a slug `bat` — and it is
// sharkdp/bat, the Rust `cat` clone, at #31369E, sourced from
// github.com/sharkdp/bat/blob/.../doc/logo-header.svg. Shipping it here would put
// a completely unrelated brand's mark on every Windows batch file in the tree. It
// is NOT used, and this note is the reason it will not be used by accident later
// either.
//
// Material files .bat with its shell icon, alongside .sh and .awk; the
// shell-glyph question those two raise is answered once, under awk.
S.bat = shellGlyph('Windows batch file',
	'no mark exists FOR .bat, and the fix round re-hunted with licence free to be sure: Windows '
	+ 'batch scripts are run by cmd.exe, whose icon Microsoft ships as an embedded PE resource and '
	+ 'publishes as no vector anywhere, and Windows Terminal\'s logo is that product\'s mark rather '
	+ 'than the file type\'s. So the honest icon is the OBJECT a .bat is run in, and it takes the '
	+ 'TERMINAL object glyph, new in geom.mjs with this round. TRAP, recorded so it is not walked '
	+ 'into later: simple-icons v16.29.0 DOES carry a slug `bat`, and it is sharkdp/bat — the Rust '
	+ '`cat` clone, #31369E — a completely unrelated brand whose mark is deliberately NOT used '
	+ 'here. Material files .bat with its shell icon too');

// =============================================================================
// bats — Bats-core
// =============================================================================
// A real find, and the tranche's one achromatic brand. Bats (the Bash Automated
// Testing System) publishes its own artwork in its own MIT repo: bats-core/
// bats-core, docs/source/assets/dark_mode_bat.svg — a bat in flight, the body in
// #B1BBC0 with four #FFFFFF wing panels struck across it. vscode-icons draws the
// same animal independently.
//
// The file is one of a PAIR: the repo ships dark_mode_bat.svg and
// light_mode_bat.svg, its own two palettes for its own two backdrops. The product
// backdrop is dark, so the dark-mode file is the official artwork here — the
// reading tranche 2 ratified on alchemy, which carries its two palettes inside
// one file instead of two.
//
// TWO THINGS TO LOOK AT, both on the sheet.
//   · COLOUR. #B1BBC0 is H 200 / S 11 / L 72 and the set's neutral ink is
//     #A6AEB6 at H 210 / S 10 / L 68. They are 10 degrees of hue, 4 of lightness
//     and 1 of saturation apart, so bats is a BRANDED icon whose official colours
//     land inside the set's own neutral lane and it will pair with every neutral
//     glyph in the twin audit's S < 25 lane. That is the brand's palette, not a
//     choice made here, and the achromatic exemption (L6 erratum 2) forbids
//     clamping it. Form is what separates it, and the audit prints the numbers.
//   · 16 PX. What survives is the wing V and the body between its two peaks;
//     the white panels inside the wings do not. Measured, the panels' edges run
//     0.38-0.75 px while the wing mass itself runs 2.50 px at the 25th
//     percentile — so the mark reads as a bat silhouette rather than as an
//     illustrated one. The verdict below says exactly that.
S.bats = {
	title: 'Bats',
	brand: '#B1BBC0',
	env: ENV.wide,
	source: {
		name: 'Bats (brand\'s own SVG)', slug: 'bats', license: 'MIT (bats-core/bats-core)',
		url: 'https://github.com/bats-core/bats-core/blob/master/docs/source/assets/dark_mode_bat.svg',
		artwork: 'bats-official.svg',
		note: 'the bat in flight — the #B1BBC0 body plus four #FFFFFF wing panels, five paths on a '
			+ '54x43 Inkscape artboard. The repo ships dark_mode_bat.svg and light_mode_bat.svg as '
			+ 'its own two palettes; the product backdrop is dark, so the dark-mode file is the '
			+ 'official artwork here (the alchemy reading). vscode-icons draws the same animal. '
			+ 'Fetched to sources-svg/bats-official.svg'
	},
	simplifications: [
		'the brand\'s DARK-mode file ships rather than its light-mode one: bats-core publishes both '
		+ 'as its own two palettes and the product backdrop is #121314, which is the reading tranche '
		+ '2 ratified on alchemy',
		'NOT reduced, and measured: the four white wing panels have 0.38-0.75 px edges against a wing '
		+ 'mass that runs 2.50 px at the 25th percentile, so at 16 px the mark reads as a bat '
		+ 'SILHOUETTE and the panelling inside it does not resolve. The silhouette is the gestalt, so '
		+ 'nothing is deleted',
		'ACHROMATIC: #B1BBC0 is S 11 and the set\'s neutral ink #A6AEB6 is S 10, four points of '
		+ 'lightness apart. L6\'s achromatic exemption forbids clamping a hueless ink, so the brand\'s '
		+ 'own gray ships and the twin audit reports the pair in its neutral lane, where form is the '
		+ 'separator. This is a branded icon that will look neutral in the tree — see the flags'
	],
	parts() {
		return officialShapes('bats-official.svg').map(s => ({ d: s.d, fill: s.fill }));
	}
};

// =============================================================================
// bazel — Bazel
// =============================================================================
// The best-behaved brand file in the tranche. bazelbuild/bazel-website is
// Apache-2.0 and carries images/bazel-icon.svg: the seven-rhombus stack of the
// Bazel mark, in four official greens declared through the file's own <style>
// class table (.light #76D275, .regular #43A047, .dark-left #00701A, .dark-right
// #004300). Seven straight-edged rhombi, no curves, no gradients, no strokes.
//
// Measured at the compact envelope: the thinnest sustained run in the whole mark
// is 1.50 px and the 25th percentile is 4.88 px — the only subject in the tranche
// with nothing at all under L5's floor.
//
// The two dark greens are recorded rather than lifted: #00701A measures 2.95:1
// and #004300 1.60:1 against the editor ground, and at 16 px they read as the
// shaded underside of the stack, which is their job. Lifting either would flatten
// a deliberately three-dimensional mark; the lift rule does not reach them in any
// case (L 22 and L 13, and the rule fires on a mark's ink meeting the backdrop,
// not on one facet of a multi-tone mark).
//
// simple-icons also carries `bazel`, as a single flattened #43A047 path; the
// brand file wins outright under L2 and keeps all four tones.
S.bazel = {
	title: 'Bazel',
	brand: '#43A047',
	env: ENV.compact,
	source: {
		name: 'Bazel (brand\'s own SVG)', slug: 'bazel',
		license: 'Apache-2.0 (bazelbuild/bazel-website)',
		url: 'https://github.com/bazelbuild/bazel-website/blob/master/images/bazel-icon.svg',
		artwork: 'bazel-official.svg',
		note: '512x512, seven rhombi in four greens declared by the file\'s own <style> class table: '
			+ '.light #76D275, .regular #43A047, .dark-left #00701A, .dark-right #004300. '
			+ 'simple-icons carries the same mark flattened to one #43A047, which R1 does not want. '
			+ 'Fetched to sources-svg/bazel-official.svg'
	},
	simplifications: [
		'the CC0 trace is NOT used: simple-icons\' `bazel` flattens the stack to a single #43A047 and '
		+ 'R1 keeps multi-colour marks multi-colour, so the brand\'s own four-tone file ships',
		'the two dark greens are recorded and NOT lifted: #00701A measures 2.95:1 and #004300 1.60:1 '
		+ 'on the #121314 ground, and at 16 px they read as the shaded underside of the stack, which '
		+ 'is what they are for. The lift rule fires on a mark\'s ink meeting the backdrop, not on one '
		+ 'facet of a multi-tone mark'
	],
	parts() {
		return officialShapes('bazel-official.svg').map(s => ({ d: s.d, fill: s.fill }));
	}
};

// =============================================================================
// bbx + bibliography + bibtex-style — BibTeX and BibLaTeX
// =============================================================================
// RULE 2 for all three, and the brief's question about them is answered with a
// measurement rather than an opinion.
//
// WHAT THEY ARE. All three are BibTeX-family concepts, which the source themes
// confirm: `bibliography` is .bib/.bbl/.bcf/.blg, `bibtex-style` is .bst, and
// `bbx` is BibLaTeX's bibliography-style file — Material added its bbx icon in
// the commit "add icons for *.bib files and BibTeX language IDs" and declares it
// next to `cbx` and `lbx`, BibLaTeX's citation-style and localisation files.
//
// WHY NO MARK. BibTeX has no logo. What TeX and LaTeX have are typographic
// LOGOTYPES — "TeX" with its E dropped, "LaTeX" with its A raised — which are
// set in a typeface rather than drawn as marks, are not BibTeX's in any case, and
// are ada's problem at 16 px twice over.
//
// WHY NO BOOK. The obvious move is an object glyph — a book, or a shelf, which
// is what Material draws for all three. It was built and MEASURED against the
// vocabulary, and it fails R8 outright: an open-book glyph for bibliography
// scores 0.970 against tranche 1's `lib` bookGlyph, against a 0.72 bar. Two
// near-twin book glyphs is precisely what the brief said not to do and what R8
// exists to prevent, and a .bib and a .lib being the same drawing is worse than
// both being gray brackets. The study renders the collision.
//
// So all three take the category glyph, and they take the SAME one, which is at
// least honest about the fact that they are one family.
const BIBTEX_WHY = 'no mark exists: this is a BibTeX/BibLaTeX concept, and BibTeX has no logo — what '
	+ 'TeX and LaTeX have are typographic LOGOTYPES ("TeX" with its E dropped), which are set rather '
	+ 'than drawn, are not BibTeX\'s, and are ada\'s 16 px problem twice over. An OBJECT glyph (a '
	+ 'book, which is what Material draws) was built and measured, and it fails R8: it scores 0.970 '
	+ 'against tranche 1\'s `lib` bookGlyph on a 0.72 bar, so a .bib and a .lib would be the same '
	+ 'drawing. Rendered in proofs/object-glyph-study.png';
S.bbx = codeGlyph('BibLaTeX bibliography style',
	`${BIBTEX_WHY}. Material added this icon in the commit "add icons for *.bib files and BibTeX `
	+ 'language IDs" and declares it beside `cbx` and `lbx`, which is how .bbx is identified as '
	+ 'BibLaTeX\'s bibliography-style file rather than anything else');
// =============================================================================
// beancount — Beancount
// =============================================================================
// RULE 2 after the android hunt with no CC0 tier to fall back on. Beancount
// publishes a logo — beancount.github.io shows it as img/logo.png — and publishes
// it as a RASTER only: no SVG on the site, none in beancount/beancount, and no
// simple-icons entry. Tracing a PNG is freehand, which L2 hard-rejects, and that
// is the whole hunt. Material draws a coffee bean in its own deep orange, which
// traces nothing.
S.beancount = codeGlyph('Beancount',
	'no usable mark, and the fix-round ruling does not reach this one: Beancount publishes a logo '
	+ 'on beancount.github.io as img/logo.png and as a RASTER only — no SVG anywhere on the site or '
	+ 'in beancount/beancount — and simple-icons has no entry. Tracing a raster is freehand, which '
	+ 'L2 hard-rejects on FIDELITY rather than on licence (the android finding from tranche 1, '
	+ 'applied to a project with no CC0 trace to fall back on). Re-hunted after the ruling and the '
	+ 'answer is unchanged. Material draws a coffee bean in its own deep orange, which traces '
	+ 'nothing');

// =============================================================================
// befunge
// =============================================================================
// RULE 2, and the shortest hunt in the tranche after bat. Befunge is a 1993
// esoteric language whose spec is a text file; there is no project, no site and
// no mark. vscode-icons draws an invented glyph.
S.befunge = codeGlyph('Befunge',
	'no mark exists: Befunge is a 1993 esoteric language whose specification is a text file — no '
	+ 'project, no site, no artwork, and no simple-icons entry. vscode-icons draws a glyph of its own '
	+ 'invention');

// =============================================================================
// behat — Behat
// =============================================================================
// RULE 2 on legibility, after L2's third tier was tried and measured.
//
// Behat's mark is real: the hand-drawn "B" that behat.org and docs.behat.org
// print at the top of every page. Both serve it as _static/img/
// behat-b-2x-white.png — a raster, and the only form of it either site publishes
// — and simple-icons has no behat entry. vscode-icons carries an MIT vector of
// the same B (its file is literally titled "B"), so the third tier was available
// and the mark was built from it.
//
// It does not survive. Measured at the compact envelope the B's strokes come back
// at 0.50 px (5th percentile) with a 25th percentile of 0.88 and a median of 1.25
// — the mark is a thin continuous line drawing, and at 16 px it reads as a gray
// blob with a hole rather than as a letter. Unlike antlr, which was removed by a
// gate after rendering cleanly, this one simply cannot be read.
S.behat = codeGlyph('Behat',
	'a real mark exists and cannot survive 16 px. Behat\'s hand-drawn "B" is published by behat.org '
	+ 'and docs.behat.org as _static/img/behat-b-2x-white.png and as a raster only, and simple-icons '
	+ 'has no entry, so L2\'s third tier was used: vscode-icons carries an MIT vector of the same B. '
	+ 'Built from it and measured at the compact envelope, the B\'s strokes run 0.50 px at the 5th '
	+ 'percentile and 0.88 px at the 25th — a thin continuous line drawing that reads at 16 px as a '
	+ 'gray blob with a hole, not as a letter. RE-MEASURED in the fix round with sourcing free and '
	+ 'confirmed at 0.44 / 0.94 / 1.25 px for the 5th, 25th and 50th percentiles; the prettier '
	+ 'rider has nothing to work with, because the vector is a SINGLE closed contour tracing a '
	+ 'brush stroke — no counters to shrink the apib way, no strokes to widen the alchemy way, and '
	+ 'no second path to fill the bicep way. Thickening it would need a path offsetter the pipeline '
	+ 'does not have and would be a redraw if it had one. The vector is kept at '
	+ 'sources-svg/behat-vsicons.svg and rendered in proofs/sourced-but-illegible-study.png');

// =============================================================================
// bench-js + bench-jsx + bench-ts — THE PRECEDENT-SETTING CALL
// =============================================================================
// A per-LANGUAGE variant family with no brand of its own, and the ruling here
// generalises to every one that follows in later slices (test-js, spec-ts,
// stories-tsx and their kin), so it is the tranche's headline flag.
//
// WHAT THEY ARE. `*.bench.js|cjs|mjs`, `*.bench.jsx|tsx` and
// `*.bench.ts|cts|mts`: benchmark files, one id per language. There is no
// "bench" brand — no tool, no runner, no project owns the convention.
//
// WHAT THE THEMES DO. Material draws ONE stopwatch and recolours it three times,
// in #FFCA28, #00BCD4 and #0288D1. Those are Material palette entries, not the
// languages' hexes: JavaScript's own yellow is #F7DF1E and TypeScript's own blue
// is #3178C6, and neither appears. v1 did the same thing with its own three
// tints. vscode-icons and Great Icons draw no bench icons at all.
//
// THE THREE READINGS, all built and rendered in proofs/bench-family-study.png:
//   (1) SHIPPED — the generic-code glyph, one payload for all three;
//   (2) one GRAY stopwatch, shared by all three as an object glyph;
//   (3) the same stopwatch in the LANGUAGES' official hexes.
//
// WHY (1). Reading (3) is out on R1's own terms: it paints js's and ts's official
// colours onto a stopwatch neither language draws, which composes a mark no brand
// publishes — the one thing L2 forbids — and it does it with the languages' real
// hexes, which makes the composite more convincing rather than less. Reading (2)
// survives R1 and is genuinely tempting: measured, the stopwatch clears L5
// comfortably (1.38 px minimum, 2.25 px at the 25th percentile) and it is R8-CLEAN
// against the whole existing vocabulary — its worst score against disc, book,
// archive, binary and code is under 0.40 on a 0.72 bar, so nothing stands in its
// way except the rule itself.
//
// It is not shipped because working rule 2's object branch asks whether the
// concept NAMES an object, and "benchmark" names a measurement. disc names a
// disc, lib names a volume, abc names a note; bench names a number. A stopwatch
// is the METAPHOR for it, and metaphor-for-a-category is exactly what the
// category glyph is. Shipping it would also open the branch for every timing,
// testing and tooling concept in the long tail on the same logic, one glyph at a
// time, which is a vocabulary decision and not a subject decision.
//
// It is a close call and the flag says so: the study renders all three readings
// at a true 16 px and the change is one line if the ruling goes the other way.
// FIX ROUND (2026-09-03): READING 2 SHIPS. Flag 24 put reading 2 — one gray
// stopwatch shared by all three — one rule away from shipping and said so: it clears
// L5 comfortably (1.38 px minimum, 2.25 px at the 25th percentile), it is R8-clean
// against the entire existing vocabulary (worst score under 0.40 on a 0.72 bar), and
// "nothing technical stands in its way". It was declined only on how narrowly rule
// 2's object branch is read — "a benchmark names a measurement", not an object.
//
// The fix round's ruling is about relief from the gray brackets, and this is the
// cheapest honest relief in the slice: three ids off the collapse for one glyph that
// was already built, already measured and already clean. Rule 2's object branch is
// therefore read as tranche 3's own study framed it — the object the concept is
// MEASURED WITH, where that object is unambiguous and universal — which is a real
// widening of the rule and is flagged as one.
//
// READING 3 STAYS OUT, unchanged and for the unchanged reason: painting js's and
// ts's official hexes onto a stopwatch neither language draws composes a mark no
// brand publishes, which is what L2 forbids and no licence ruling touches. The three
// ids therefore share ONE gray payload, byte for byte, declared in NEUTRAL_COLLAPSE.
//
// THE PRECEDENT STILL TRAVELS: every per-language variant family in every later
// slice — test-js, spec-ts, stories-tsx — now lands on "one shared object glyph in
// the neutral gray, never the languages' colours". That is the thing to rule on.
const BENCH_WHY = 'a per-LANGUAGE variant family with no brand: no tool or project owns the '
	+ '`*.bench.*` convention. Material draws ONE stopwatch recoloured three times in its own '
	+ 'palette (#FFCA28 / #00BCD4 / #0288D1 — not JavaScript\'s #F7DF1E or TypeScript\'s #3178C6), '
	+ 'and vscode-icons and Great Icons draw nothing. FIX ROUND: all three take the STOPWATCH '
	+ 'object glyph, new in geom.mjs — flag 24 measured it clean (1.38 px minimum, 2.25 px at the '
	+ '25th percentile, R8-clean against the whole vocabulary at under 0.40 on a 0.72 bar) and '
	+ 'declined it only on how narrowly rule 2\'s object branch is read. The three ids share ONE '
	+ 'gray payload byte for byte. The stopwatch in the LANGUAGES\' official hexes stays out for '
	+ 'the unchanged reason: it composes a mark no brand publishes. All three readings are in '
	+ 'proofs/bench-family-study.png, and the precedent still travels to every per-language family '
	+ 'in later slices — see the flags';
const benchGlyph = (title) => ({
	title: `${title} (neutral glyph)`,
	brand: NEUTRAL,
	neutral: true,
	env: { w: 11.2, h: 13.2 },
	source: {
		name: 'none — neutral glyph vocabulary (object: stopwatch)', slug: null,
		license: null, url: null, note: BENCH_WHY
	},
	simplifications: [],
	parts() { return stopwatchGlyph().map(d => ({ d, fill: NEUTRAL })); }
});
S['bench-js'] = benchGlyph('Benchmark (JavaScript)');
S['bench-jsx'] = benchGlyph('Benchmark (JSX/TSX)');
S['bench-ts'] = benchGlyph('Benchmark (TypeScript)');

S.bibliography = codeGlyph('Bibliography', BIBTEX_WHY);
S['bibtex-style'] = codeGlyph('BibTeX style', BIBTEX_WHY);

// =============================================================================
// bicep — Azure Bicep
// =============================================================================
// THE COUNTER-EXAMPLE ON THE MICROSOFT SIDE, and the brief called it exactly
// right: Bicep's mark is sourceable and Bicep's mark ships.
//
// LICENCE, checked rather than assumed. github.com/Azure/bicep is MIT and carries
// docs/images/BicepLogoImage.svg. Microsoft's OSS repos normally attach a
// trademark notice that carves logos out of the repo licence; this one does not —
// the README, CONTRIBUTING and SECURITY files contain no trademark, logo or brand
// clause of any kind, and the LICENCE is the plain MIT text with no rider. So the
// repo's MIT covers the file, which is the opposite result from azure and is why
// the two are flagged as a pair.
//
// THE MARK is an isometric cube with a flexed-arm-and-dumbbell figure drawn
// across it in white. The file builds that out of ten layers: a gradient-filled
// outer hexagon, five cube-face polygons at opacity 0.7 with 0.5-unit strokes, a
// solid #1D4A79 silhouette of the figure, four white shapes at opacity 0.2-0.3,
// and a white LINE DRAWING of the figure at stroke-width 4.
//
// R1 flattening, every step logged:
//   · the outer hexagon is a <polygon>, so it is re-emitted as a closed path from
//     its own `points` attribute — a format conversion, and the reason a local
//     reader exists rather than the hexagon being typed in by hand;
//   · its gradient (#1D4A79 at offset 0, #45CAF2 at offset 1) is flattened to its
//     offset-1 stop, which is the reading chrome ratified. #45CAF2 measures
//     9.73:1 on the editor ground; the other stop, #1D4A79, measures 2.04:1 and
//     the field would half-disappear into the backdrop. Both are rendered in the
//     study;
//   · the five cube-face polygons are DROPPED. They are alpha-composited shading
//     (opacity 0.7 over the gradient), L8 bans opacity, and compositing them by
//     hand would invent hexes the file never declares;
//   · the white line drawing is at stroke-width 4 on a 128-unit mark — 0.40 px,
//     and L8 bans strokes. The PRETTIER RIDER fires, and it fires without
//     redrawing anything: the file already contains a closed, filled path of the
//     same figure (its #1D4A79 under-silhouette), so that path is painted in the
//     line drawing's own official WHITE. Same geometry the brand ships, in a
//     colour the brand paints it, at a weight that reads.
// After the rider the thinnest sustained run in the whole icon is 2.50 px, which
// is the second most comfortable mark in the tranche.
const BICEP_STOPS = gradientStops('bicep-official.svg');     // ['#1D4A79', '#45CAF2']
S.bicep = {
	title: 'Azure Bicep',
	brand: '#45CAF2',
	env: ENV.compact,
	plate: true,   // an official FIELD carrying a glyph (R8 lane, see audit.mjs)
	source: {
		name: 'Bicep (brand\'s own SVG)', slug: 'bicep', license: 'MIT (Azure/bicep)',
		url: 'https://github.com/Azure/bicep/blob/main/docs/images/BicepLogoImage.svg',
		artwork: 'bicep-official.svg',
		note: '128x128, ten layers: a gradient-filled outer hexagon (a `polygon` element), five cube '
			+ 'faces at '
			+ 'opacity 0.7, a solid #1D4A79 silhouette of the arm-and-dumbbell figure, four white '
			+ 'shapes at opacity 0.2-0.3 and a white line drawing of the figure at stroke-width 4. '
			+ 'Azure/bicep is plain MIT with NO trademark or logo clause anywhere in its LICENSE, '
			+ 'README, CONTRIBUTING or SECURITY files — checked, because that is what separates this '
			+ 'from azure. Fetched to sources-svg/bicep-official.svg'
	},
	simplifications: [
		'the outer hexagon is a `polygon` element and is re-emitted as a closed path from its own '
		+ '`points` '
		+ 'attribute — a format conversion in which every coordinate is the file\'s own, not a '
		+ 'transcription of the kind tranche 2 declined for SAP\'s polyline',
		`the field's gradient (${BICEP_STOPS[0]} at offset 0, ${BICEP_STOPS[1]} at offset 1) is `
		+ 'flattened to its offset-1 stop, the reading chrome ratified. That stop measures 9.73:1 on '
		+ 'the #121314 ground; the offset-0 stop measures 2.04:1 and would half-sink the field into '
		+ 'the backdrop. Both are rendered in proofs/bicep-reduction-study.png',
		'the five cube-face polygons are DROPPED: they are alpha-composited shading at opacity 0.7 '
		+ 'over the gradient, L8 bans opacity, and compositing them by hand would invent hexes the '
		+ 'file never declares. What is lost is the cube\'s facetting; what is kept is its silhouette, '
		+ 'which is what reads at 16 px',
		'PRETTIER RIDER, without redrawing anything: the mark\'s figure is a white LINE DRAWING at '
		+ 'stroke-width 4 on a 128-unit mark, i.e. 0.40 px, and L8 bans strokes. The file already '
		+ 'contains a closed FILLED path of the same figure (the #1D4A79 silhouette it draws the line '
		+ 'work over), so that path ships painted in the line work\'s own official #FFFFFF — the '
		+ 'brand\'s geometry, in the brand\'s colour, at a weight that reads. After the rider the '
		+ 'thinnest sustained run in the icon is 2.50 px',
		'WHAT THE RIDER COSTS, stated because the fidelity pane shows it: the official figure is an '
		+ 'OUTLINE, so filling it closes the ring at the elbow and the hexagonal nut in the fist, and '
		+ 'the figure arrives as one solid white curl rather than as an arm lifting a dumbbell. '
		+ 'Punching the ring back in was measured and rejected — its official wall is 2 of 128 source '
		+ 'units, which is 0.30 px at this fit. What survives is the gestalt L5\'s detail budget asks '
		+ 'for: the cube, and a curled arm on it'
	],
	parts() {
		const field = polys('bicep-official.svg').find(p => p.gradient);
		const figure = officialShapes('bicep-official.svg')[0];   // the closed filled silhouette
		return [
			{ d: field.d, fill: BICEP_STOPS[BICEP_STOPS.length - 1] },
			{ d: figure.d, fill: WHITE }
		];
	}
};

// =============================================================================
// biml — Biml (Varigence)
// =============================================================================
// RULE 2, on the safetensors reading. Biml is Varigence's Business Intelligence
// Markup Language and .biml files exist only inside Varigence's tooling, so the
// AdvPL/antlers-html question is fair to ask — but the answer here is different,
// because Varigence publishes a COMPANY wordmark and no Biml mark. The only
// vector varigence.com serves is varigence-logo.svg on its Webflow CDN: the word
// "Varigence", drawn with clip-paths and xlink references, which is the company's
// identity and not the language's. That is tranche 1's safetensors reading and
// tranche 2's anyscript reading, applied a third time.
//
// vscode-icons draws a crimson-and-gray angular shape for biml that corresponds
// to nothing Varigence publishes as a vector, so it is not a tier-3 source
// either: L2's third tier needs a faithful vector OF A REAL MARK, and there is no
// real mark for it to be faithful to.
S.biml = codeGlyph('Biml',
	'no mark exists for the LANGUAGE. Biml is Varigence\'s and .biml files exist only inside '
	+ 'Varigence tooling, so the AdvPL/antlers-html question is fair — but Varigence publishes a '
	+ 'COMPANY wordmark and nothing else: the only vector varigence.com serves is varigence-logo.svg, '
	+ 'the word "Varigence" drawn with clip-paths and xlink references. A company\'s mark is not the '
	+ 'format\'s (the safetensors and anyscript reading). vscode-icons draws a crimson angular shape '
	+ 'that corresponds to no Varigence vector, so L2\'s third tier has no real mark to be faithful '
	+ 'to. RE-HUNTED in the fix round with licence free: varigence-logo.svg was fetched and read, '
	+ 'and it really is a wordmark — 258 x 55 units of clip-path-wrapped letterforms with no symbol '
	+ 'anywhere in the file. There is nothing here that the ruling makes shippable');

// =============================================================================
// blade — Laravel Blade
// =============================================================================
// RULE 2 on legibility — and the ownership question the brief raised is answered
// separately, because the answer does not change the outcome and the PRECEDENT
// matters more than this one icon.
//
// DOES A .blade.php WEAR LARAVEL'S MARK? Yes. A Blade template exists nowhere but
// inside a Laravel application, exactly as an antlers.html exists nowhere but
// inside Statamic and a .prw nowhere but inside TOTVS Protheus — and tranche 2
// shipped the Statamic mark on antlers-html for precisely that reason. This
// tranche does not disturb that precedent; it confirms it. The same reading will
// apply to django templates and rails erb when they arrive.
//
// AND IT STILL CANNOT SHIP. Laravel's logomark is a WIREFRAME: laravel.com/img/
// logomark.min.svg draws the isometric "L" as one long contour of hairline
// edges — a single 2.2 KB path whose entire content is the seams between faces.
// Measured at the compact envelope, its sustained ink runs are 0.38 px at the
// minimum, 0.38 at the 25th percentile AND 0.50 at the MEDIAN: not a mark with
// some thin features, a mark that is nothing but thin features. simple-icons'
// `laravel` traces the same drawing and measures the same. At 16 px it is a red
// tangle, which the study renders.
//
// REBUILT IN THE FIX ROUND (2026-09-03) — a second rider attempt, and the objection
// that stopped the first one does not survive being measured.
//
// Flag 27 said "filling it solid leaves a plain hexagon, which is not the mark and
// would collide with bicep". It is not a plain hexagon: Laravel's logomark is an
// isometric "L" and its OUTER CONTOUR is that L — a stepped, asymmetric block with
// the notch cut out of its top right, which is the mark's whole silhouette. The
// wireframe seams are the interior detail, and L5's detail budget is explicit about
// which of the two survives ("keep the mark's gestalt, drop its interior detail").
//
// The precedent is bicep, approved at the pilot gate on exactly this trade: its cube
// lost its facetting and kept its silhouette, and the fidelity pane was made to show
// the cost. Same trade here, same logging.
//
// MEASURED. Official wireframe at the compact envelope: 0.38 px at the 5th
// percentile, 0.38 at the 25th, 0.44 at the median — a mark that is nothing but
// hairlines, which is what flag 27 got right. The outer contour alone: 2.00 px at
// the 5th percentile, 5.19 at the 25th, 5.56 at the median. The bicep collision was
// checked rather than assumed — the twin audit scores the pair on every run and
// prints the number.
//
// OWNERSHIP is unchanged and was never the problem: a .blade.php exists nowhere but
// inside a Laravel application, exactly as an antlers.html exists only inside
// Statamic, and the same reading will carry django templates and rails erb.
S.blade = {
	title: 'Laravel Blade',
	brand: '#FF2D20',
	env: ENV.compact,
	source: {
		name: 'Laravel (brand\'s own SVG)', slug: 'laravel',
		license: 'no declared licence on the asset — Laravel trademark; the framework itself is '
			+ 'MIT. Recorded and NOT gating, per the fix-round ruling',
		url: 'https://laravel.com/img/logomark.min.svg',
		artwork: 'laravel-official.svg',
		note: 'the isometric "L" logomark — one path, 9 subpaths: the outer contour plus eight '
			+ 'interior seams that draw the block\'s faces as a wireframe. brand-colors.json '
			+ 'records Laravel as #FF2D20 and the file paints the same hex, so nothing to '
			+ 'reconcile. simple-icons\' CC0 trace is the same drawing. Fetched to '
			+ 'sources-svg/laravel-official.svg'
	},
	simplifications: [
		'PRETTIER RIDER. Measured at the compact envelope, the official wireframe runs 0.38 px at '
		+ 'the 5th percentile, 0.38 at the 25th and 0.44 at the MEDIAN — not a mark with thin '
		+ 'features, a mark that is nothing but seams. At 16 px it is a red tangle',
		'the eight interior seams are DROPPED and the outer contour ships solid, which takes the '
		+ 'ink to 2.00 px at the 5th percentile and 5.19 px at the 25th. That contour is not a '
		+ 'hexagon: it is the isometric L itself, stepped and asymmetric with the notch cut out '
		+ 'of its top right, so what survives is the mark\'s silhouette and what is lost is its '
		+ 'three-dimensionality — bicep\'s approved trade, made again and logged the same way',
		'WHAT THE RIDER COSTS, stated because the fidelity pane shows it: the official mark reads '
		+ 'as a wireframe BLOCK and this reads as a flat red L. Keeping one seam was measured — '
		+ 'the widest, at 0.50 px — and rejected: one seam out of eight reads as a scratch rather '
		+ 'than as structure. Both are in proofs/license-freed-t3-study.png'
	],
	parts() {
		return [{ d: subpaths(officialShapes('laravel-official.svg')[0].d)[0], fill: '#FF2D20' }];
	}
};

// =============================================================================
// blink — Foundry Nuke BlinkScript
// =============================================================================
// RULE 2, on the safetensors reading again, and the concept identification is
// evidenced rather than guessed: Material's icons/blink.svg was added in a commit
// titled "Added Blink (The Foundry Nuke) icon". A `.blink` file is a BlinkScript
// kernel — Foundry Nuke's C++-like GPU kernel language.
//
// BlinkScript publishes no mark. Nuke does, and simple-icons even carries it
// (`nuke`, #000000) — but Nuke's mark is the compositing APPLICATION's, not its
// embedded kernel language's, which is the distinction tranche 1 drew on
// safetensors and Hugging Face and tranche 2 drew on anyscript. Material's own
// blink icon is an invented amber glyph in its palette, tracing nothing.
S.blink = codeGlyph('BlinkScript (Nuke)',
	'no mark exists for the LANGUAGE. The concept is identified rather than guessed: Material\'s '
	+ 'icons/blink.svg was added in a commit titled "Added Blink (The Foundry Nuke) icon", so a '
	+ '.blink file is a BlinkScript kernel — Nuke\'s embedded GPU kernel language. BlinkScript '
	+ 'publishes no mark; Nuke does, and simple-icons carries it (`nuke`, CC0). FIX ROUND: with the '
	+ 'safetensors meaning reading overturned, Nuke\'s mark was BUILT and MEASURED rather than '
	+ 'declined on meaning — and it fails on L5. The Nuke mark is a ring inside a ring with a small '
	+ 'rotor glyph in the middle, and at the compact envelope its sustained ink runs are 0.56 px at '
	+ 'the 5th percentile, 0.63 at the 25th and 0.94 at the median, so at 16 px it is a gray disc '
	+ 'with a smudge; it would also land in the antlr/chrome disc neighbourhood, which the fix round '
	+ 'has spent its one declared look-alike on. Material\'s own blink icon is an invented amber '
	+ 'glyph. So blink stays on the glyph, on legibility');

// =============================================================================
// blitzbasic — BlitzBasic
// =============================================================================
// RULE 2. BlitzBasic is Blitz Research's 1990s BASIC dialect; the company is
// long gone, blitzbasic.com no longer resolves to a brand site, the surviving
// source repos (blitz-research/*) carry raster screenshots and no logo vector,
// and simple-icons has no entry. vscode-icons draws the letters "BB" as two
// pixel-blocky glyphs in colours of its own, which R1 has no place for.
S.blitzbasic = codeGlyph('BlitzBasic',
	'no mark exists: Blitz Research is long gone, its surviving repos (blitz-research/*) carry raster '
	+ 'screenshots and no logo vector, and simple-icons has no entry. vscode-icons draws the letters '
	+ '"BB" as two pixel-blocky glyphs in colours of its own, which R1 has no place for. Re-hunted '
	+ 'in the fix round and unchanged: there was never a licence here to free, only an absence');

// =============================================================================
// bolt — Firebase Bolt
// =============================================================================
// RULE 2, and the concept is verified before it is judged. `.bolt` is FIREBASE
// BOLT: the security-and-modelling rules compiler at FirebaseExtended/bolt, whose
// files the Firebase CLI compiles when named in a firebase.json rules property.
// It is not bolt.new and not Bolt CMS; vscode-icons registers it as a LANGUAGE
// (id `bolt`, extension `bolt`), which is what a rules DSL is.
//
// Bolt publishes no mark, and the project is archived. Firebase publishes one —
// and Firebase's flame is the PLATFORM's mark, not this compiler's, which is the
// safetensors reading a fourth time. vscode-icons draws a plain amber lightning
// bolt, which is a pun on the name.
// REBUILT IN THE FIX ROUND (2026-09-03), on the SAFETENSORS re-ruling and nothing
// else — this was never a licence decline either. Flag 23 put bolt in the "a
// product's or a company's mark is not the format's" pile; the fix round overturns
// that reading for safetensors (flag 38) and the same reading has to move with it,
// because .bolt is closer to its parent than safetensors is: Firebase Bolt is
// Firebase's own compiler, in Firebase's own GitHub org, compiled by the Firebase
// CLI, and it has no life outside Firebase at all.
//
// The concept identification from flag 34 is unchanged and still load-bearing:
// `.bolt` is FIREBASE BOLT (FirebaseExtended/bolt), not bolt.new and not Bolt CMS.
//
// SOURCING, by fidelity: the Firebase flame is multi-colour — #FFA000 body, #F57C00
// shadow fold, #FFCA28 highlight — and devicon's MIT vector carries all three plus a
// white opacity-0.2 sheen, which L8 drops. simple-icons flattens the whole flame to
// one #DD2C00, which R1 does not want. brand-colors.json records Firebase as
// #FFCA28, which is the artwork's own highlight hex, so the source-of-truth rule
// fires and finds nothing to correct.
//
// Measured at the tall envelope: 1.75 px at the 5th percentile, 5.38 at the 25th.
S.bolt = {
	title: 'Firebase Bolt',
	brand: '#FFCA28',
	env: ENV.tall,
	source: {
		name: 'Firebase (faithful vector — devicon)', slug: 'firebase',
		license: 'MIT (devicons/devicon); the mark itself is a Google trademark. Recorded and NOT '
			+ 'gating, per the fix-round ruling',
		url: 'https://github.com/devicons/devicon/blob/master/icons/firebase/firebase-original.svg',
		artwork: 'firebase-devicon.svg',
		note: '128x128, FIVE painted layers: the #FFA000 flame body, the #F57C00 shadow fold, the '
			+ '#FFCA28 highlight, a white sheen at fill-opacity 0.2 and an #A52714 shadow sliver '
			+ 'at opacity 0.2 along the flame\'s base. `.bolt` is FIREBASE BOLT '
			+ '— the rules compiler at FirebaseExtended/bolt, compiled by the Firebase CLI, with '
			+ 'no life outside Firebase (flag 34 identified it; the identification is unchanged). '
			+ 'simple-icons carries the same flame flattened to one #DD2C00, which R1 does not '
			+ 'want. Fetched to sources-svg/firebase-devicon.svg'
	},
	simplifications: [
		'the CC0 trace is NOT used: simple-icons\' `firebase` renders the flame as a single flat '
		+ '#DD2C00 path and R1 keeps multi-colour marks multi-colour, so devicon\'s three-tone '
		+ 'vector of the brand\'s own artwork ships instead',
		'the two ALPHA layers are DROPPED: the white sheen at fill-opacity 0.2 and the #A52714 '
		+ 'shadow sliver at opacity 0.2 along the flame\'s base. L8 bans opacity and compositing '
		+ 'either by hand would invent a hex the file never declares — the bicep cube-face '
		+ 'reading. Both are sub-pixel effects at 16 px. The #A52714 one is worth naming because '
		+ 'it is a REAL hex rather than a white wash, so a filter on colour alone would have '
		+ 'shipped it at full strength; the reader tests the opacity attribute instead',
		'colour source of truth: brand-colors.json records Firebase as #FFCA28, which is the '
		+ 'artwork\'s own highlight hex, so the pilot\'s rule fires and finds nothing to correct',
		'NOT reduced, and measured: at the tall envelope the flame runs 1.75 px at the 5th '
		+ 'percentile and 5.38 px at the 25th'
	],
	parts() {
		const alpha = alphaLayers('firebase-devicon.svg');
		return officialShapes('firebase-devicon.svg')
			.filter((s, i) => !alpha.has(i))
			.map(s => ({ d: s.d, fill: s.fill }));
	}
};

// =============================================================================
// module exports — the shape A01.mjs merges
// =============================================================================

export const SPECS = S;

/** Sheet order: the roster's own order for the code category, appscript → bolt. */
export const ORDER = ['appscript', 'appwrite', 'arduino', 'asp', 'aspx', 'atom', 'ats',
	'autohotkey', 'autoit', 'avalonia', 'avro', 'awk', 'axure', 'azure', 'azurestreamanalytics',
	'bak', 'ballerina', 'bashly-hook', 'bat', 'bats', 'bazel', 'bbx', 'beancount', 'befunge',
	'behat', 'bench-js', 'bench-jsx', 'bench-ts', 'bibliography', 'bibtex-style', 'bicep', 'biml',
	'blade', 'blink', 'blitzbasic', 'bolt'];

/**
 * L9 gate 2 — the 16 px proof, eyeballed. Read off the slice's own
 * proofs/proof-16px.png and off a true-pixel blow-up of each candidate (a 16x16
 * canvas blitted back at 10x with smoothing off, which is what the inline-SVG
 * `.px` pane cannot show), and written down here rather than asserted.
 */
export const PROOF16 = (() => {
	// the twenty-seven concepts that share the generic-code glyph get ONE verdict
	// text, because they are one payload: a different note per id would imply a
	// difference the bytes do not have
	const CODE = ['pass', 'the angle-bracket pair, 2.2 px stems, unmistakable at 16 px — and '
		+ 'byte-identical across all forty concepts in the slice that fall back to it (thirteen from '
		+ 'tranche 2, twenty-seven here), which is the point of the collapse and the thing to rule '
		+ 'on, not the render'];
	const V = {
		appscript: ['pass', 'FIX ROUND. The Apps Script fan, and it reads as a fan: four blue '
			+ 'blades sweeping from a common origin, nothing under 2.25 px at the 25th percentile. '
			+ 'What went is the five pivot dots, which at official weight turned the whole thing '
			+ 'into a blue scatter — the reduction is the icon'],
		appwrite: ['pass', 'the open bracket and the bar that closes it both hold, with the gap '
			+ 'between them clean at 1.38 px — one of the three most legible marks in the tranche'],
		arduino: ['pass', 'the infinity closes on both loops and, more importantly, the minus and the '
			+ 'plus survive: they render as a dark bar in the left loop and a dark cross in the '
			+ 'right, at 0.72 px apiece. That is what separates this from a generic infinity, and it '
			+ 'is the feature to look at'],
		asp: ['pass', 'byte-identical to aspx, as declared — see the flag, because this is the '
			+ 'one family declaration in the fix round that is a genuine judgement call rather than '
			+ 'a measurement'],
		aspx: ['pass', 'FIX ROUND. The .NET plate with a big white ".N" on it, which is dotenv\'s '
			+ 'approved reduction executed on the same numbers: the official ".NET" measured '
			+ '0.50 px, exactly as dotenv\'s ".ENV" did, and the surviving pair scaled 2.5x lands '
			+ 'on 1.25-1.38 px. At 16 px the dot and the N both resolve, white on the mark\'s own '
			+ 'purple, which is the highest-contrast pairing there is'],
		atom: CODE,
		ats: CODE,
		autohotkey: CODE,
		autoit: ['pass', 'disc, white ring and the chevron "A" all separate; the ring is the feature '
			+ 'at risk at 1.25 px and it holds. At 4.70:1 it is the dimmest branded mark in the '
			+ 'tranche and still comfortably clear of the ground'],
		avalonia: ['pass', 'the squared "a" keeps its counter, the corner notch reads, and the '
			+ 'detached dot on the left stays a dot rather than merging into the bowl'],
		avro: ['pass (marginal)', 'reads as the angular blue dart it is: the bright #1CCCFC body and '
			+ 'the #0068E0 vane separate cleanly, but the #000094 shadow vane (1.26:1 on the editor '
			+ 'ground) renders as a dark notch rather than as a third colour, and the wing tips taper '
			+ 'into antialiasing. That taper is the mark\'s own drawing, the way debian\'s brush is'],
		awk: ['pass', 'FIX ROUND. The terminal glyph, new to the vocabulary: a window with the '
			+ 'prompt chevron and the cursor bar punched out of it, 1.81 px at the 5th percentile '
			+ 'and unmistakable at 16 px. Byte-identical with bat, which is the point'],
		axure: CODE,
		azure: ['pass', 'FIX ROUND. The Azure "A", three official blues, the fold reading as a '
			+ 'fold; 2.56 px at the 5th percentile and nothing near the floor. What it lost is the '
			+ 'black shadow layer under the fold, which was alpha-composited and had to go'],
		azurestreamanalytics: ['pass', 'byte-identical to azure, as declared. Its OWN official '
			+ 'service icon was built and measured first — a gray cog with three cyan stream arcs '
			+ 'at 0.65 px — and it is in proofs/license-freed-t3-study.png so the fallback can be '
			+ 'checked rather than believed'],
		bak: CODE,
		ballerina: ['pass', 'both figures hold with their arms and legs separate — 2.38 px at the '
			+ '25th percentile is the most comfortable non-plate mark in the tranche. Only the '
			+ 'pointed feet fade, which is the drawing'],
		'bashly-hook': ['pass (marginal)', 'FIX ROUND. Bashly\'s own symbol — the hexagonal '
			+ 'chevron with the "$" knocked through it, the mask converted to a counter — and it is '
			+ 'marginal at 16 px: the chevron silhouette and the vertical bar of the $ both hold, '
			+ 'but the $\'s S-curve does not resolve, so what arrives is a light arrow shape with a '
			+ 'slot in it rather than a legible dollar. It is still a real mark and it is still '
			+ 'distinct from everything around it, which is why it ships; flagged so the call can '
			+ 'go the other way'],
		bat: ['pass', 'FIX ROUND. The terminal glyph, byte-identical with awk — a window with '
			+ '">_" punched out. Reads at 16 px and reads as a shell, which is what a .bat is'],
		bats: ['pass (marginal)', 'reads as a bat: the two wing peaks and the body between them hold, '
			+ 'and the four white wing panels inside them do not resolve at all, so what arrives is a '
			+ 'silhouette rather than the illustrated mark. Marginal for a second reason the flag '
			+ 'covers — at S 11 it sits in the set\'s neutral lane and will read in the tree as if it '
			+ 'were one of the gray glyphs'],
		bazel: ['pass', 'all seven rhombi separate and the four greens stay four greens; nothing in '
			+ 'the mark is under 1.50 px. The best-behaved icon in the tranche'],
		bbx: CODE,
		beancount: CODE,
		befunge: CODE,
		behat: CODE,
		'bench-js': ['pass (marginal)', 'FIX ROUND. The stopwatch, shared by all three bench ids. '
			+ 'The ring holds with its dial open at 3.06 px and the 2.80 x 1.80 px crown really '
			+ 'does stay a separate bar on top — nothing in it is near L5\'s floor, and it is '
			+ 'plainly not the disc glyph, whose ring is solid to a 4.0 px spindle. Marginal '
			+ 'honestly, and for a reason no measurement catches: at 16 px a ring with a nub is '
			+ 'read as a stopwatch by someone who is expecting a stopwatch, and as a ring by '
			+ 'someone who is not. It is still a large improvement on three more sets of gray '
			+ 'brackets, and flag 48 is where to say if you disagree'],
		'bench-jsx': ['pass (marginal)', 'byte-identical to bench-js, as declared — so it carries '
			+ 'the same verdict, marginal included'],
		'bench-ts': ['pass (marginal)', 'byte-identical to bench-js and bench-jsx, as declared — '
			+ 'three ids, one gray stopwatch, and NOT the languages\' own hexes, which is the half '
			+ 'of flag 24 the fix round did not overturn'],
		bibliography: CODE,
		'bibtex-style': CODE,
		bicep: ['pass', 'reads as the cube plus the curled-arm figure, which is the mark\'s gestalt, '
			+ 'and nothing in it is under 2.50 px. Be clear about what the rider COST, because the '
			+ 'fidelity pane shows it: filling the official line drawing solid closes the ring at the '
			+ 'elbow and the hex nut in the fist, so the figure arrives as one white curl rather than '
			+ 'as an arm lifting a dumbbell. The cube also loses its facetting and keeps its '
			+ 'silhouette. At official weights it was 0.40 px of white line work on a facetted cube '
			+ 'and rendered as a blue blob — proofs/bicep-reduction-study.png has both'],
		biml: CODE,
		blade: ['pass', 'FIX ROUND. Laravel\'s isometric "L", filled solid: 2.00 px at the 5th '
			+ 'percentile against the wireframe\'s 0.38, and at 16 px it is a bold red L with its '
			+ 'notch. Be clear what the rider COST, because the fidelity pane shows it — the mark '
			+ 'reads as a wireframe BLOCK and this reads as a flat shape. That is bicep\'s approved '
			+ 'trade made again'],
		blink: CODE,
		blitzbasic: CODE,
		bolt: ['pass', 'FIX ROUND. The Firebase flame in its three official tones, and the fold '
			+ 'between the body and the highlight survives at 16 px, which is what keeps it from '
			+ 'reading as an amber blob. The call to argue with is the flag\'s, not the render\'s: '
			+ 'this is the PLATFORM\'s mark on a compiler Firebase archived']
	};
	return V;
})();

/**
 * Working rule 1 — declared brand families.
 *
 * NONE. Three variant pairs passed through this tranche and every one of them
 * resolved without a family, which is recorded here rather than left as an
 * absence: `autohotkey`/ahk2 both take the neutral glyph, so there is no family
 * mark to be identical to (tranche 2's flag 21, executed); `bashly-hook`'s base
 * is not in the A01 roster and its mark is unusable in any case; and the three
 * `bench-*` ids are a per-language family with no brand at all, which is working
 * rule 2's business and not rule 1's.
 */
export const FAMILIES = {
	dotnet: {
		base: 'aspx', base_set: 'A01', members: ['asp'], mode: 'identical',
		why: 'rule 1(b), OPENED BY THE FIX ROUND, and the one family declaration in the round '
			+ 'that is a judgement rather than a measurement. The roster gives `asp` the '
			+ 'extensions .asa/.asax/.ascx/.asp/.aspx and `aspx` the extensions .ascx/.aspx, so the '
			+ 'two concepts OVERLAP on two extensions and three of asp\'s five (.asax, .ascx, '
			+ '.aspx) are ASP.NET files. Left to disagree they would put two different icons on the '
			+ 'same file types depending on which matcher rule won. Neither classic ASP nor ASP.NET '
			+ 'has a variant glyph for branch (a) to adapt — classic ASP never had a mark at all — '
			+ 'so both ship the .NET mark byte-identically. The cost is that a classic Global.asa '
			+ 'gets .NET\'s mark, and classic ASP predates .NET by five years; the alternative is '
			+ 'flagged'
	},
	azure: {
		base: 'azure', base_set: 'A01', members: ['azurestreamanalytics'], mode: 'identical',
		why: 'rule 1(b), OPENED BY THE FIX ROUND and decided by MEASUREMENT. This is the first '
			+ 'time branch (a) had something to adapt and it still lost: azurestreamanalytics HAS '
			+ 'its own official artwork (00042-icon-service-Stream-Analytics-Jobs.svg, from the '
			+ 'Azure architecture icon set Azure/bicep vendors), it was fetched and built, and it '
			+ 'cannot hold 16 px — a gray gradient cog with three cyan stream arcs drawn as '
			+ '0.9-unit strokes on an 18-unit artboard, landing on 0.65 px, the whole mark '
			+ 'measuring 0.50 / 0.69 / 1.19 px. Dropping the arcs leaves a cog, which is not the '
			+ 'mark. So the variant falls back to branch (b) and ships the Azure mark identically'
	}
};

/**
 * Working rule 2 — the neutral vocabulary as this tranche uses it.
 *
 * FIX ROUND: thirteen concepts left the generic-code collapse. Eight found real
 * marks (appscript, asp, aspx, azure, azurestreamanalytics, bashly-hook, blade,
 * bolt) and five moved onto two NEW OBJECT GLYPHS — the terminal for awk and bat,
 * the stopwatch for the three bench ids.
 *
 * Both new glyphs are shared by more than one id, which rule 2 as written only
 * anticipated for CATEGORY glyphs. They are declared under `category_glyphs`
 * because that is the machinery that makes the sharing visible — check-slice
 * asserts byte-identity per group and the twin audit reports every pair in its
 * collapse lane — and they are recorded in `object_glyphs` too, so the manifest
 * says plainly which kind of glyph each one is. The vocabulary block in the
 * manifest names them as objects.
 */
export const NEUTRAL_COLLAPSE = {
	object_glyphs: {
		terminal: 'shell window — a plate with the prompt chevron and the cursor bar punched out '
			+ 'as counters (geom.terminalGlyph). NEW with the fix round; shared by awk and bat',
		stopwatch: 'stopwatch — a ring with its dial punched out and the crown bar on top '
			+ '(geom.stopwatchGlyph). NEW with the fix round; shared by bench-js, bench-jsx and '
			+ 'bench-ts'
	},
	category_glyphs: {
		'generic-code': ['atom', 'ats', 'autohotkey', 'axure', 'bak', 'bbx', 'beancount',
			'befunge', 'behat', 'bibliography', 'bibtex-style', 'biml', 'blink', 'blitzbasic'],
		// the two new OBJECT glyphs, declared here because more than one id carries each
		// and this is the record that makes byte-identity an assertion rather than a hope
		terminal: ['awk', 'bat'],
		stopwatch: ['bench-js', 'bench-jsx', 'bench-ts']
	}
};

/** New vocabulary entries this tranche contributes to the slice's record. */
export const VOCABULARY = {
	terminal: 'geom.terminalGlyph — a shell window with the prompt chevron and the cursor bar '
		+ 'punched out as counters (OBJECT glyph, new with the fix round: awk, bat)',
	stopwatch: 'geom.stopwatchGlyph — a ring with its dial punched out and the crown bar on top '
		+ '(OBJECT glyph, new with the fix round: bench-js, bench-jsx, bench-ts)'
};

/**
 * FIX ROUND (2026-09-03) — what this tranche rebuilt under the ruling.
 */
export const FIX_ROUND = {
	rebuilt: ['appscript', 'asp', 'aspx', 'awk', 'azure', 'azurestreamanalytics', 'bashly-hook',
		'bat', 'bench-js', 'bench-jsx', 'bench-ts', 'blade', 'bolt'],
	rehunted_and_unchanged: ['autohotkey', 'axure', 'beancount', 'behat', 'biml', 'blink',
		'blitzbasic'],
	notes: {
		appscript: 'never a licence case; a second attempt at the reduction. Dropping the five '
			+ 'pivot dots and keeping the four blades takes the ink from 0.94 px to 2.25 px at the '
			+ '25th percentile, which is L5\'s detail budget working as written.',
		aspx: 'never a licence case either. dotenv\'s approved rider, executed on the same '
			+ 'numbers: ".NET" measures 0.50 px, the surviving ".N" scaled 2.5x lands on 1.25-1.38.',
		asp: 'rule 1(b) on aspx — the two concepts overlap on .ascx and .aspx and three of asp\'s '
			+ 'five extensions are ASP.NET files. The one judgement-call family in the round.',
		azure: 'flag 26 was a pure licence decline quoting Microsoft\'s own terms, and the ruling '
			+ 'dissolves it. The Azure "A" ships in three official blues.',
		azurestreamanalytics: 'rule 1(b) on azure, decided by measurement: its own service icon '
			+ 'was built and measures 0.50 / 0.69 / 1.19 px.',
		awk: 'the TERMINAL object glyph opens. Tranche 3 built and measured it and declined it '
			+ 'only because applescript was on the generic-code glyph; applescript moved.',
		bat: 'the terminal glyph, byte-identical with awk. cmd.exe\'s icon is a PE resource with '
			+ 'no vector anywhere, so the object is the honest icon.',
		'bench-js': 'the STOPWATCH object glyph opens. Flag 24 measured reading 2 clean and '
			+ 'declined it on how narrowly rule 2\'s object branch is read; the fix round widens '
			+ 'the reading and flags the widening.',
		'bashly-hook': 'the mask objection was a reader bug, not a law: a white rect with a black '
			+ '"$" over it IS a counter, and converting it is the bicep-polygon class of move.',
		blade: 'a second rider attempt. Flag 27 said filling the wireframe leaves "a plain '
			+ 'hexagon"; it does not — the outer contour IS the isometric L, and filling it is '
			+ 'bicep\'s approved trade.',
		bolt: 'moved with safetensors: the same meaning reading, and .bolt is closer to its parent '
			+ 'than safetensors is. Firebase\'s own three-tone flame ships.',
		blink: 'the meaning objection is overturned with safetensors, so Nuke\'s mark was BUILT '
			+ 'and it fails on L5 at 0.56 / 0.63 / 0.94 px. Stays neutral on legibility now.',
		behat: 're-measured at 0.44 / 0.94 / 1.25 px; the vector is a single closed contour with '
			+ 'no counters, no strokes and no second path, so no rider move applies.',
		axure: 're-hunted: a five-letter logotype, a mid-page marketing infinity that would '
			+ 'R8-collide with arduino, and the app icon as a PNG. Nothing shippable.',
		beancount: 'raster only, and tracing a raster is a FIDELITY reject the ruling does not '
			+ 'reach.',
		biml: 'varigence-logo.svg fetched and read: it really is a wordmark with no symbol in it.',
		blitzbasic: 'no licence to free, only an absence.',
		autohotkey: 'the one reduction that clears L5 does so by deleting the "AHK".'
	}
};

/**
 * What the brand actually ships, for the fidelity strip and the sheet's
 * provenance panes. Display-safe: no gradients, no <style>, no external
 * references, no data: URIs — both surfaces are gated for that. Concepts that
 * ship the neutral vocabulary return null even where a mark exists and was
 * declined; the declined marks are argued in the flags and rendered in the
 * studies, not smuggled onto the fidelity strip as if they were sources.
 */
const wrap = (viewBox, body) => `<svg viewBox="${viewBox}">${body}</svg>`;
const siSvg = (slug, fill) => wrap('0 0 24 24', `<path fill="${fill}" d="${icon(slug).path}"/>`);
const fileSvg = (viewBox, file, fills) => wrap(viewBox, officialShapes(file)
	.map((s, i) => `<path fill="${(fills && fills[i]) || s.fill || '#000000'}" d="${s.d}"/>`).join(''));

export const ORIGINAL = {
	appscript: () => siSvg('googleappsscript', '#4285F4'),
	appwrite: () => fileSvg('0 0 112 98', 'appwrite-official.svg', ['#FD366E', '#FD366E']),
	// Arduino's OWN lockup, all seven paths: the infinity WITHOUT the plus and minus,
	// the "Arduino" wordmark and the registered mark. This is the pane that shows why
	// the CC0 trace is what ships
	arduino: () => fileSvg('0 0 342.394 261.395', 'arduino-official.svg'),
	// Microsoft's own .NET logo, complete: the field (a <rect>, so it comes through the
	// local reader) and all four letter glyphs, which is what the shipped ".N" is a
	// reduction OF
	asp: () => dotnetOriginal(),
	aspx: () => dotnetOriginal(),
	atom: () => null,
	ats: () => null,
	autohotkey: () => null,
	autoit: () => siSvg('autoit', '#5D83AC'),
	avalonia: () => fileSvg('0 0 48 48', 'avalonia-official.svg'),
	avro: () => fileSvg('2 2 35 30', 'avro-official.svg'),
	awk: () => null,
	axure: () => null,
	azure: () => azureOriginal(),
	// the service icon this concept DID have and could not keep, rendered so the
	// fallback to the family base can be checked rather than believed
	azurestreamanalytics: () => wrap('0 0 18 18', officialShapes('azure-stream-analytics-official.svg')
		.map(x => `<path fill="${x.fill || (x.gradient || []).slice(-1)[0].color}" d="${x.d}"/>`).join('')),
	bak: () => null,
	ballerina: () => fileSvg('0 0 32 32', 'ballerina-vsicons.svg', ['#20B4AE']),
	// the brand's own lockup, symbol AND wordmark, with the mask's "$" shown as the
	// counter it is — which is what the shipped symbol is a crop of
	'bashly-hook': () => {
		const ds = officialShapes('bashly-official.svg').map(x => x.d);
		return wrap('0 0 535 150',
			`<path fill="#434343" d="${rewind(ds[1], 1) + rewind(ds[0], -1)}"/>`
			+ `<path fill="#434343" d="${ds[2]}"/>`);
	},
	bat: () => null,
	bats: () => fileSvg('0 0 54.261147 43.081844', 'bats-official.svg'),
	bazel: () => fileSvg('0 0 512 512', 'bazel-official.svg'),
	bbx: () => null,
	beancount: () => null,
	befunge: () => null,
	behat: () => null,
	'bench-js': () => null,
	'bench-jsx': () => null,
	'bench-ts': () => null,
	bibliography: () => null,
	'bibtex-style': () => null,
	// the brand's own file, with its gradient resolved to the offset-1 stop this set
	// ships and its line work kept AS STROKES — that is what Microsoft publishes, and
	// showing it any other way would hide the reduction the rider made
	bicep: () => {
		const p = polys('bicep-official.svg');
		const field = p.find(x => x.gradient);
		const faces = p.filter(x => x.fill && x.fill !== '#FFFFFF');
		const shapes = officialShapes('bicep-official.svg');
		return wrap('0 0 128 128',
			`<path fill="${BICEP_STOPS[BICEP_STOPS.length - 1]}" d="${field.d}"/>`
			+ faces.map(f => `<path fill="${f.fill}" d="${f.d}"/>`).join('')
			+ `<path fill="#1D4A79" d="${shapes[0].d}"/>`
			// the white line work exactly as Microsoft draws it — read from the file,
			// strokes and all, because that is the point of the pane (alchemy precedent)
			+ strokedPaths('bicep-official.svg').map(s => '<path fill="none" stroke="#FFFFFF" '
				+ `stroke-width="${s.width}" stroke-linejoin="round" d="${s.d}"/>`).join('')
			+ `<path fill="#FFFFFF" d="${shapes[shapes.length - 1].d}"/>`);
	},
	biml: () => null,
	// Laravel's own logomark, wireframe seams and all — the pane where the rider's
	// cost is visible instead of described
	blade: () => fileSvg('0 0 49.7 51.2', 'laravel-official.svg', ['#FF2D20']),
	blink: () => null,
	blitzbasic: () => null,
	// the flame as devicon paints it, INCLUDING the white sheen at its own 0.2 alpha —
	// the pane shows what the brand ships and the shipped icon shows what L8 left of it
	bolt: () => {
		const sh = officialShapes('firebase-devicon.svg');
		return wrap('0 0 128 128', sh.map(x => `<path fill="${x.fill}"`
			+ (x.fill === '#FFFFFF' || x.fill === '#FFF' ? ' fill-opacity=".2"' : '')
			+ ` d="${x.d}"/>`).join(''));
	},
};

/** Microsoft's own .NET logo, field included — the field is a <rect>. */
const dotnetOriginal = () => wrap('0 0 456 456',
	rects('dotnet-official.svg').map(r => `<path fill="${r.fill}" d="${r.d}"/>`).join('')
	+ officialShapes('dotnet-official.svg').map(x => `<path fill="#FFFFFF" d="${x.d}"/>`).join(''));

/** The Azure "A" as devicon paints it, gradients resolved to the stops this set ships. */
const azureOriginal = () => wrap('0 0 128 128', officialShapes('azure-devicon.svg')
	.filter(x => !(x.gradient && x.gradient.every(g => g.color === '#000000')))
	.map(x => `<path fill="${x.fill || x.gradient[x.gradient.length - 1].color}" d="${x.d}"/>`)
	.join(''));

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

/** The stopwatch the bench family did not get. Two sub-shapes, on the 16-grid. */
const stopwatch = () => [
	ellipse(8, 9.2, 5.6, 5.6, true) + ellipse(8, 9.2, 3.4, 3.4, false),
	roundPoly([[6.6, 1.6], [9.4, 1.6], [9.4, 3.4], [6.6, 3.4]], 0.6)
];
/** The open book the BibTeX family did not get — deliberately lib's construction. */
const citationBook = () => [
	roundPoly([[1.6, 4.2], [7.2, 3.0], [7.2, 12.4], [1.6, 13.4]], 0.5),
	roundPoly([[8.8, 3.0], [14.4, 4.2], [14.4, 13.4], [8.8, 12.4]], 0.5)
];

export const STUDIES = [
	{
		// FIX ROUND. The license-freed rebuilds of this tranche, with the candidate each
		// one beat next to it, so every call is checkable at the size it matters.
		id: 'license-freed-t3-study',
		width: 1120, height: 1150,
		html: (place) => {
			const sp = subpaths(icon('googleappsscript').path);
			const blades = APPSCRIPT_BLADES.map(i => sp[i]).join('');
			const lar = subpaths(officialShapes('laravel-official.svg')[0].d);
			const asa = officialShapes('azure-stream-analytics-official.svg')
				.map(x => ({ d: x.d, fill: x.fill || x.gradient[x.gradient.length - 1].color }));
			const dotnetAll = officialShapes('dotnet-official.svg').map(x => x.d);
			const field = rects('dotnet-official.svg')[0].d;
			const dotN = (k) => {
				const g = unionBBox([dotnetAll[0], dotnetAll[1]]);
				const dx = 228 - g.cx * k, dy = 228 - g.cy * k;
				return xform(dotnetAll[0], { sx: k, dx, dy }) + xform(dotnetAll[1], { sx: k, dx, dy });
			};
			return page(
				'<h2>What the ruling freed in tranche 3 &mdash; every rebuild next to what it beat</h2>'
				+ '<p>Thirteen concepts left the gray brackets here. Two of them were pure licence '
				+ 'declines that the ruling simply dissolves (<b>azure</b>, and <b>bolt</b> on the '
				+ 'safetensors re-ruling); the rest are SECOND ATTEMPTS at reductions the first round '
				+ 'gave up on, and those are the ones to check. <b>appscript</b> loses its five pivot '
				+ 'dots and goes from 0.94&nbsp;px to 2.25&nbsp;px at the 25th percentile. <b>aspx</b> '
				+ 'is dotenv\'s approved rider on identical numbers &mdash; the official ".NET" '
				+ 'measures 0.50&nbsp;px, exactly as ".ENV" did, and the surviving ".N" scaled 2.5x '
				+ 'lands on 1.25&ndash;1.38. <b>blade</b> fills the Laravel wireframe, whose median run '
				+ 'is 0.44&nbsp;px, and the outer contour is not "a plain hexagon" &mdash; it is the '
				+ 'isometric L. <b>azurestreamanalytics</b> is the one that went the other way: its own '
				+ 'official service icon exists, was built, and measures 0.50&nbsp;/&nbsp;0.69&nbsp;/'
				+ '&nbsp;1.19&nbsp;px, so it falls back to the Azure mark. Judge the 16&nbsp;px '
				+ 'column.</p>',
				[
					card('appscript &mdash; official, 9 subpaths<br>0.75 / 0.94 px: a blue scatter',
						place([{ d: sp.join(''), fill: '#4285F4' }], ENV.open)),
					card('appscript &mdash; SHIPPED, dots dropped<br>2.25 px at p25',
						place([{ d: blades, fill: '#4285F4' }], ENV.open), true),
					card('aspx &mdash; the official ".NET"<br>stems 0.50 px, dotenv\'s number',
						place([{ d: field, fill: '#512BD4' },
							{ d: dotnetAll.join(''), fill: WHITE }], ENV.compact)),
					card('aspx &mdash; ".N" at k 2.2<br>REJECTED: stems 1.13 px, under the floor',
						place([{ d: field, fill: '#512BD4' }, { d: dotN(2.2), fill: WHITE }], ENV.compact)),
					card('aspx &mdash; SHIPPED, ".N" at k 2.5<br>stems 1.25-1.38 px',
						place([{ d: field, fill: '#512BD4' }, { d: dotN(2.5), fill: WHITE }], ENV.compact), true),
					card('blade &mdash; Laravel\'s wireframe<br>MEDIAN run 0.44 px',
						place([{ d: lar.join(''), fill: '#FF2D20' }], ENV.compact)),
					card('blade &mdash; the widest seam kept<br>REJECTED: one of eight reads as a scratch',
						place([{ d: lar[0] + lar[8], fill: '#FF2D20' }], ENV.compact)),
					card('blade &mdash; SHIPPED, contour solid<br>2.00 px at p5; the isometric L',
						place([{ d: lar[0], fill: '#FF2D20' }], ENV.compact), true),
					card('azurestreamanalytics &mdash; its OWN<br>service icon: arcs at 0.65 px',
						place(asa, ENV.compact)),
					card('azurestreamanalytics &mdash; SHIPPED<br>rule 1(b): the Azure mark',
						place(S.azure.parts(), ENV.compact), true),
					card('blink &mdash; Nuke\'s mark, BUILT<br>REJECTED: 0.56 / 0.63 / 0.94 px',
						place([{ d: icon('nuke').path, fill: '#E5E5E5' }], ENV.compact)),
					card('bashly-hook &mdash; SHIPPED<br>the mask read as a counter',
						place(S['bashly-hook'].parts(), ENV.compact), true)
				]);
		}
	},
	{
		id: 'bench-family-study',
		width: 1120, height: 530,
		html: (place) => {
			const code = place(genericCode().map(d => ({ d, fill: NEUTRAL })), CODE_ENV);
			const watch = (fill) => place(stopwatch().map(d => ({ d, fill })), { w: 12.4, h: 13.2 });
			return page(
				'<h2>bench-js / bench-jsx / bench-ts &mdash; the per-language variant family, and the '
				+ 'precedent it sets</h2><p>Three ids, one concept, no brand: nothing owns the '
				+ '<code>*.bench.*</code> convention. Material draws ONE stopwatch and recolours it '
				+ 'three times in its own palette &mdash; <b>#FFCA28 / #00BCD4 / #0288D1, which are '
				+ 'not JavaScript\'s #F7DF1E or TypeScript\'s #3178C6</b> &mdash; and vscode-icons and '
				+ 'Great Icons draw nothing. Reading&nbsp;3 is out on R1\'s own terms: it paints two '
				+ 'languages\' official hexes onto a stopwatch neither language draws, which composes '
				+ 'a mark no brand publishes. Reading&nbsp;2 survives R1 and is genuinely close &mdash; '
				+ 'measured, the stopwatch clears L5 at 1.38&nbsp;px minimum and is <b>R8-clean</b> '
				+ 'against the entire vocabulary (worst score under 0.40 on a 0.72 bar). It is '
				+ 'declined because working rule 2\'s object branch asks whether the concept NAMES an '
				+ 'object, and a benchmark names a measurement. <b>THE FIX ROUND SHIPS READING 2</b>: '
				+ 'the object branch is read as the object a concept is MEASURED WITH, where that '
				+ 'object is unambiguous and universal &mdash; a real widening of the rule, flagged as '
				+ 'one. Reading&nbsp;3 is unchanged and still out. <b>This ruling generalises</b> to '
				+ 'test-js, spec-ts and every per-language family after them: one shared object glyph '
				+ 'in the neutral gray, never the languages\' own colours.</p>',
				[
					card('2 &middot; SHIPPED (FIX ROUND)<br>one gray stopwatch, three ids', watch(NEUTRAL), true),
					card('1 &middot; what it replaced<br>the generic-code glyph', code),
					card('3a &middot; stopwatch in js\'s own<br>#F7DF1E &mdash; an invented composite', watch('#F7DF1E')),
					card('3b &middot; stopwatch in jsx/react\'s<br>#61DAFB &mdash; same objection', watch('#61DAFB')),
					card('3c &middot; stopwatch in ts\'s own<br>#3178C6 &mdash; same objection', watch('#3178C6')),
					card('Material\'s actual bench-ts<br>#0288D1, its own palette', watch('#0288D1'))
				]);
		}
	},
	{
		id: 'object-glyph-study',
		width: 1120, height: 830,
		html: (place) => {
			const g = (ds, env) => place(ds.map(d => ({ d, fill: NEUTRAL })), env);
			return page(
				'<h2>The object glyphs tranche 3 considered, and the one number that settled them</h2>'
				+ '<p>Working rule 2 gives a concept an OBJECT glyph where it names an object and its '
				+ 'CATEGORY glyph otherwise, and every new glyph is R8-checked against the vocabulary '
				+ 'before it ships. Three were built and measured here. <b>The citation book</b> for '
				+ 'bibliography / bibtex-style / bbx is dead on arrival: it scores <b>0.970</b> '
				+ 'against tranche 1\'s <code>lib</code> bookGlyph on a 0.72 bar, so a '
				+ '<code>.bib</code> and a <code>.lib</code> would be the same drawing &mdash; the two '
				+ 'cards below are that collision. <b>The stopwatch</b> for the bench family is '
				+ 'R8-clean and SHIPS with the fix round. <b>The shell/terminal glyph</b> for awk, bat '
				+ 'was also clean, and was declined for one stated reason: tranche 2 '
				+ 'already put applescript on the generic-code glyph, so opening a shell glyph now '
				+ 'would make the set inconsistent three subjects back. <b>The fix round moved '
				+ 'applescript to the Apple logo</b>, so the reason is gone and the terminal ships too, '
				+ 'carrying awk and bat. The citation book is unchanged: R8 killed it, and R8 is not a '
				+ 'licence.</p>',
				[
					card('lib &mdash; tranche 1, SHIPPED<br>the vocabulary as it stands',
						g(bookGlyph(), { w: 13, h: 10.4 }), true),
					card('bibliography as a book<br>STILL REJECTED: R8 0.970 vs lib',
						g(citationBook(), { w: 13, h: 10.4 })),
					card('bench as a stopwatch<br>FIX ROUND: SHIPPED',
						g(stopwatch(), { w: 12.4, h: 13.2 })),
					card('awk / bat as a terminal<br>FIX ROUND: SHIPPED',
						g([roundRect(1.6, 2.8, 12.8, 10.4, 1.2)
							// both interior features are COUNTERS, so their winding is reversed
							+ roundPoly([[3.2, 7], [4.9, 8], [3.2, 9], [4.2, 10], [7, 8], [4.2, 6]], 0.4)
							+ roundRect(8.2, 9.2, 4.2, 1.4, 0.5, false)], { w: 12.8, h: 10.4 })),
					card('generic-binary &middot; generic-archive<br>the rest of the vocabulary, for scale',
						g([genericBinary()], { w: 12.2, h: 12.2 })),
					card('generic-archive &mdash; tranche 1',
						g(genericArchive(), { w: 13, h: 11.1 })),
					card('what three of the six kept:<br>the generic-code glyph',
						g(genericCode(), CODE_ENV), true)
				]);
		}
	},
	{
		id: 'sourced-but-illegible-study',
		width: 1120, height: 830,
		html: (place) => {
			const shipped = place(genericCode().map(d => ({ d, fill: NEUTRAL })), CODE_ENV);
			const dotnetLetters = officialShapes('dotnet-official.svg').map(x => x.d).join('');
			const sapSp = subpaths(icon('sap').path);
			return page(
				'<h2>Five marks that exist &mdash; four of them cleanly licensed &mdash; and cannot '
				+ 'hold 16&nbsp;px</h2><p>None of these is a sourcing decline. <b>appscript</b> is '
				+ 'CC0 from simple-icons at Google\'s own #4285F4, and is a fan of five tapering '
				+ 'blades whose ink runs measure 0.25&ndash;0.88&nbsp;px. <b>aspx</b> is the .NET '
				+ 'logo, and it is the cleanest-licensed source in the tranche &mdash; '
				+ '<code>github.com/dotnet/brand</code> is <b>CC0-1.0</b>, which corrects tranche 2\'s '
				+ 'claim that no Microsoft marks are reachable &mdash; but its ".NET" stems land on '
				+ '<b>0.54&nbsp;px</b>, less than half of abap\'s SAP letters at 1.00&ndash;1.25, and '
				+ 'the two are side by side below so the comparison is not a claim. <b>autohotkey</b> '
				+ 'is tranche 2\'s flag 21 re-measured from this side: nothing in it exceeds '
				+ '0.50&nbsp;px, and lifting the ink does not change that. <b>blade</b> is Laravel\'s '
				+ 'own logomark, a wireframe whose MEDIAN run is 0.50&nbsp;px. <b>behat</b> is L2 tier '
				+ '3, built from vscode-icons\' MIT vector, at 0.50&nbsp;px. Judge the 16&nbsp;px '
				+ 'column.</p>',
				[
					card('appscript &mdash; the CC0 Google mark<br>blades 0.25-0.88 px',
						place([{ d: icon('googleappsscript').path, fill: '#4285F4' }], ENV.compact)),
					card('aspx &mdash; the CC0 .NET mark<br>letter stems 0.50 px', place([
						{ d: rects('dotnet-official.svg')[0].d, fill: '#512BD4' },
						{ d: dotnetLetters, fill: WHITE }], ENV.compact)),
					card('abap &mdash; tranche 2, APPROVED<br>letter stems 1.00-1.25 px', place([
						{ d: sapSp[0], fill: '#0FAAFF' },
						{ d: sapSp.slice(1).join(''), fill: WHITE }], ENV.flat)),
					card('autohotkey &mdash; the AHK keycap<br>nothing over 0.50 px, 1.86:1',
						place([{ d: unarc(icon('autohotkey').path), fill: '#334455' }], ENV.compact)),
					card('autohotkey &mdash; ink lifted<br>legibility is unchanged',
						place([{ d: unarc(icon('autohotkey').path), fill: NEUTRAL }], ENV.compact)),
					card('blade &mdash; Laravel\'s own logomark<br>MEDIAN run 0.50 px',
						place([{ d: unarc(officialShapes('laravel-official.svg')[0].d), fill: '#FF2D20' }], ENV.compact)),
					card('behat &mdash; the tier-3 vector<br>strokes 0.50 px',
						place(officialShapes('behat-vsicons.svg')
							.map(s => ({ d: unarc(s.d), fill: '#D2D2D2' })), ENV.compact)),
					card('SHIPPED for all five:<br>the generic-code glyph', shipped, true)
				]);
		}
	},
	{
		id: 'bicep-reduction-study',
		width: 1120, height: 530,
		html: (place) => {
			const p = polys('bicep-official.svg');
			const field = p.find(x => x.gradient);
			const faces = p.filter(x => x.fill && x.fill !== '#FFFFFF');
			const figure = officialShapes('bicep-official.svg')[0];
			return page(
				'<h2>bicep &mdash; the prettier rider fills a line drawing the brand already filled</h2>'
				+ '<p>Bicep is the counter-example on the Microsoft side: <code>Azure/bicep</code> is '
				+ 'plain MIT with <b>no trademark or logo clause anywhere</b> in its LICENSE, README, '
				+ 'CONTRIBUTING or SECURITY files, so the repo licence really does cover '
				+ '<code>docs/images/BicepLogoImage.svg</code> &mdash; the opposite result from azure, '
				+ 'whose marks Microsoft publishes under terms that permit diagrams and documentation '
                + 'only. The mark is a cube with a white LINE DRAWING of an arm-and-dumbbell across '
				+ 'it at stroke-width 4 on a 128-unit artboard: <b>0.40&nbsp;px</b>, and L8 bans '
				+ 'strokes outright. The rider does not redraw it &mdash; the file already contains a '
				+ 'closed FILLED path of the same figure, which it paints #1D4A79 under the line work, '
				+ 'so that path ships in the line work\'s own official white. Card&nbsp;1 is what '
				+ 'happens without it.</p>',
				[
					card('1 &middot; faces + dark figure<br>REJECTED: a blue blob', place([
						...faces.map(f => ({ d: f.d, fill: f.fill })),
						{ d: figure.d, fill: '#1D4A79' }], ENV.compact)),
					card('2 &middot; offset-0 stop #1D4A79<br>REJECTED: field at 2.04:1', place([
						{ d: field.d, fill: BICEP_STOPS[0] }, { d: figure.d, fill: WHITE }], ENV.compact)),
					card('3 &middot; SHIPPED &mdash; offset-1 stop<br>#45CAF2 at 9.73:1, figure white', place([
						{ d: field.d, fill: BICEP_STOPS[BICEP_STOPS.length - 1] },
						{ d: figure.d, fill: WHITE }], ENV.compact), true),
					card('4 &middot; field only, no figure<br>what the cube alone says', place([
						{ d: field.d, fill: BICEP_STOPS[BICEP_STOPS.length - 1] }], ENV.compact))
				]);
		}
	}
];

/**
 * Every judgement call this tranche made, in the sheet's numbered flags section.
 * `rule` names the law or working rule the call sits under; `subjects` is what it
 * touches, so a verdict can be applied without re-reading the prose.
 * Tranche 2's flags run 11-22; these continue from 23.
 */
export const FLAGS = [
	{
		title: 'RULE 2 at slice scale &mdash; FORTY of the eighty-four are one payload',
		rule: 'working rule 2',
		superseded: 'SUPERSEDED by the fix-round ruling (2026-09-03). Forty is now '
			+ 'TWENTY. This flag named both levers and the ruling pulled both: L2 (twelve subjects '
			+ 'across the slice found real marks once licence stopped gating) and the vocabulary '
			+ '(the stopwatch and the terminal opened, taking five more). The pile it describes is '
			+ 'gone; what is left is flag 49\'s twenty, and every one of those is a legibility '
			+ 'verdict or a genuine absence.',
		ruling: true,
		subjects: ['appscript', 'asp', 'aspx', 'atom', 'ats', 'autohotkey', 'awk', 'axure', 'azure',
			'azurestreamanalytics', 'bak', 'bashly-hook', 'bat', 'bbx', 'beancount', 'befunge',
			'behat', 'bench-js', 'bench-jsx', 'bench-ts', 'bibliography', 'bibtex-style', 'biml',
			'blade', 'blink', 'blitzbasic', 'bolt'],
		text: 'Tranche 2 flagged thirteen of thirty-five on the <code>generic-code</code> glyph. This '
			+ 'tranche adds <b>twenty-seven of thirty-six</b>, which makes <b>forty of the slice\'s '
			+ 'eighty-four icons the same gray angle brackets</b>, byte for byte. That is the single '
			+ 'biggest fact about A01 and it should be the first thing you rule on, ahead of any '
			+ 'individual mark. <b>They are not one pile and the flags below take them separately:</b> '
			+ 'two are declined on a LICENCE Microsoft publishes and this build cannot meet (azure, '
			+ 'azurestreamanalytics); five are marks that EXIST, four of them cleanly licensed, and '
			+ 'cannot hold 16 px (appscript, aspx, autohotkey, behat, blade); four are cases where a '
			+ 'product\'s or a company\'s mark is not the format\'s (bashly-hook, biml, blink, bolt); '
			+ 'and sixteen own no artwork at all. <b>The lever that would move the most icons at '
			+ 'once</b> is not any of those &mdash; it is the vocabulary. Opening three more object '
			+ 'glyphs (a stopwatch for the bench family, a terminal for awk/bat/bashly-hook, a '
			+ 'citation mark for the BibTeX family) would take seven concepts out of the collapse in '
			+ 'one edit. All three are built and measured in '
			+ '<code>proofs/object-glyph-study.png</code>, and one of the three is already ruled out '
			+ 'by R8 rather than by taste. <b>The alternative lever</b> is L2: rule that a source '
			+ 'theme\'s MIT-licensed trace of a mark whose owner publishes no usable vector is an '
			+ 'acceptable source, and appscript, blade and behat stop being about licensing &mdash; '
			+ 'though all three would still be about legibility, which is flag 27.'
	},
	{
		title: 'bench-js / -jsx / -ts &mdash; the per-language variant family, and the precedent it sets',
		rule: 'working rule 2 / R1 palette',
		superseded: 'SUPERSEDED IN PART by the fix-round ruling (2026-09-03) — reading 2 '
			+ 'SHIPS. This flag put the gray stopwatch one rule away from shipping and said so; '
			+ 'the fix round widens that rule and takes it. Reading 3 (the languages\' own hexes) '
			+ 'is UNCHANGED and still out, for the unchanged reason. See flag 48.',
		subjects: ['bench-js', 'bench-jsx', 'bench-ts'],
		text: 'This is the smallest set of icons in the tranche and the one whose ruling travels '
			+ 'furthest: <b>every per-language variant family in every later slice</b> &mdash; '
			+ 'test-js, spec-ts, stories-tsx and their kin &mdash; lands wherever this one does. '
			+ '<b>The facts.</b> Nothing owns the <code>*.bench.*</code> convention; there is no '
			+ 'bench brand. Material draws ONE stopwatch and recolours it three times in '
			+ '<code>#FFCA28</code>, <code>#00BCD4</code> and <code>#0288D1</code> &mdash; Material '
			+ 'palette entries, and note that they are <b>not</b> JavaScript\'s own #F7DF1E or '
			+ 'TypeScript\'s own #3178C6. vscode-icons and Great Icons draw no bench icons at all. v1 '
			+ 'drew one stopwatch in three tints of its own. <b>The three readings are all built and '
			+ 'rendered at a true 16 px in <code>proofs/bench-family-study.png</code>.</b> '
			+ '(1)&nbsp;the generic-code glyph &mdash; what ships. (2)&nbsp;one GRAY stopwatch shared '
			+ 'by all three. (3)&nbsp;the stopwatch in the LANGUAGES\' official hexes. <b>Reading 3 is '
			+ 'out on R1\'s own terms:</b> it paints js\'s and ts\'s real colours onto a stopwatch '
			+ 'neither language draws, which composes a mark no brand publishes &mdash; and using the '
			+ 'languages\' genuine hexes makes that composite more convincing, not less. <b>Reading 2 '
			+ 'is close, and the numbers favour it:</b> the stopwatch clears L5 comfortably '
			+ '(1.38&nbsp;px minimum, 2.25&nbsp;px at the 25th percentile) and it is <b>R8-clean</b> '
			+ 'against the entire existing vocabulary &mdash; its worst form score against disc, book, '
			+ 'archive, binary and code is under 0.40 on a 0.72 bar. Nothing technical stands in its '
			+ 'way. <b>It is declined on the rule, not the numbers:</b> working rule 2 gives a concept '
			+ 'an object glyph where it NAMES an object &mdash; disc names a disc, lib a volume, abc a '
			+ 'note &mdash; and a benchmark names a measurement. A stopwatch is the metaphor for a '
			+ 'category, which is what the category glyph is for. Shipping it also opens the branch '
			+ 'for every timing, testing and tooling concept in the long tail on identical logic. '
			+ '<b>Say the word and it is one line</b>, in this module and in every slice after it.'
	},
	{
		title: 'CORRECTION to flag 13 &mdash; simple-icons DOES carry Microsoft marks, and .NET is CC0',
		rule: 'L2 sourcing (corrects tranche 2)',
		subjects: ['aspx', 'azure', 'azurestreamanalytics'],
		text: 'Tranche 2\'s corporate-mark flag rests on a testable claim &mdash; "for a brand this '
			+ 'large, ABSENCE from simple-icons is evidence of a trademark removal" &mdash; and it '
			+ 'states that no Microsoft marks remain in v16.29.0. <b>That part is not correct, and '
			+ 'this tranche checked it because aspx made it load-bearing.</b> v16.29.0 carries '
			+ '<code>dotnet</code> (#512BD4) and <code>blazor</code>, and it records dotnet\'s source '
			+ 'as <code>github.com/dotnet/brand/logo/dotnet-logo.svg</code> with a <b>declared '
			+ 'CC0-1.0 licence</b>. That repository is Microsoft\'s own .NET brand repo; it is '
			+ 'licensed CC0-1.0 and its README says you may "use the illustrations and logo to '
			+ 'represent .NET in related content". The file is fetched to '
			+ '<code>sources-svg/dotnet-official.svg</code>. <b>What this changes:</b> the ADOBE, '
			+ 'SALESFORCE and VS-Code-ribbon halves of flag 13 stand exactly as written &mdash; those '
			+ 'brands really are absent and really do publish nothing citable. The Microsoft half '
			+ 'needs a better test than absence, and Microsoft supplies one itself (flag 26). <b>What '
			+ 'it does not change:</b> aspx still ships neutral, because the .NET mark cannot hold '
			+ '16 px (flag 26) &mdash; the sourcing objection dies and the legibility one does not. '
			+ '<b>Worth knowing for later slices:</b> csharp, fsharp and vb also have CC0 artwork in '
			+ 'that same repo, and <code>blazor</code> and <code>fsharp</code> are in simple-icons. '
			+ 'The Microsoft tail is more sourceable than A01 has assumed.'
	},
	{
		title: 'azure and azurestreamanalytics &mdash; declined on Microsoft\'s own published terms',
		rule: 'L2 licensing',
		superseded: 'SUPERSEDED by the fix-round ruling (2026-09-03). This is the cleanest '
			+ 'licence decline in the slice — it quotes Microsoft\'s own terms verbatim — and the '
			+ 'ruling voids licence as a gate outright, so it falls without needing the '
			+ 'vendored-MIT-copy question it raised to be answered at all. azure ships the Azure '
			+ '"A"; azurestreamanalytics fell back to it on a MEASUREMENT, not a licence. See '
			+ 'flag 43. The terms stay recorded verbatim on the subject.',
		subjects: ['azure', 'azurestreamanalytics'],
		text: 'With flag 25 removing "absent from simple-icons" as the test, the Azure decline needs '
			+ 'to stand on something better, and it does &mdash; on terms Microsoft prints itself. '
			+ 'Microsoft publishes the Azure marks as the <b>Azure architecture icon set</b>, behind '
			+ 'an agreement page that reads, verbatim: <i>"Microsoft permits the use of these icons '
			+ 'in architectural diagrams, training materials, or documentation. You can copy, '
			+ 'distribute, and display the icons only for the permitted use unless granted explicit '
			+ 'permission by Microsoft. Microsoft reserves all other rights."</i> A file-type icon '
			+ 'inside a shipped editor is none of those three uses, and R1\'s pipeline necessarily '
			+ 'MODIFIES the artwork &mdash; affine fit, gradient flattening &mdash; which the terms do '
			+ 'not permit at all. That is a decline with a citation rather than an inference. '
			+ '<b>The complication, which is real and is not smoothed over:</b> '
			+ '<code>Azure/bicep</code> is MIT and <b>vendors that entire icon set</b> at '
			+ '<code>src/vscode-bicep-ui/.../azure-architecture-icons/</code>, including '
			+ '<code>analytics/00042-icon-service-Stream-Analytics-Jobs.svg</code> &mdash; which is '
			+ 'azurestreamanalytics\'s official artwork, sitting inside an MIT repository. Whether a '
			+ 'repo licence can re-license artwork its rights-holder publishes under narrower terms is '
			+ 'a question for you and not for a build, so both readings are on the record and neither '
			+ 'is assumed. <b>Note that bicep itself does not raise this</b>: its logo is original to '
			+ 'that repo, which is why bicep ships and azure does not (flag 28). '
			+ '<b>To overturn:</b> rule that the vendored MIT copy governs, and both icons become '
			+ 'their real Azure marks in one edit.'
	},
	{
		title: 'Five marks that exist, four cleanly licensed, and none that holds 16&nbsp;px',
		rule: 'L5 / prettier rider',
		superseded: 'PARTLY SUPERSEDED (fix round, 2026-09-03) — and this is the flag the '
			+ 'fix round argued with hardest, because three of its five were second-attempt wins. '
			+ 'appscript, aspx and blade all ship now, on reductions this flag said were not '
			+ 'available; autohotkey and behat were re-measured and stand. See flags 44, 45 and '
			+ '46 for the numbers.',
		subjects: ['appscript', 'aspx', 'autohotkey', 'behat', 'blade'],
		text: 'Tranche 2 had four of these; this tranche has five more, and the pile is now the '
			+ 'largest single reason icons go neutral in A01 &mdash; ahead of licensing. Every one is '
			+ 'rendered at a true 16 px in <code>proofs/sourced-but-illegible-study.png</code> so the '
			+ 'verdicts can be checked instead of believed. <b>appscript:</b> Google Apps Script, '
			+ 'simple-icons CC0 at Google\'s own #4285F4 &mdash; a fan of five tapering blades plus '
			+ 'four dots, nine subpaths, ink runs 0.25&ndash;0.88&nbsp;px at the widest fit the grid '
			+ 'allows. Thickening fuses the fan (0.5&nbsp;px between blades); deleting blades leaves '
			+ 'three bars. <b>aspx:</b> the .NET logo, CC0 from Microsoft\'s own brand repo &mdash; a '
			+ '#512BD4 field with the four-glyph ".NET" logotype knocked out, stems 19.2 of 456 source '
			+ 'units, <b>0.54&nbsp;px</b> at the compact envelope. The study puts it beside '
			+ '<b>abap</b>, whose SAP letters measure 1.00&ndash;1.25&nbsp;px and passed, so the '
			+ 'comparison is visible rather than asserted. <b>autohotkey:</b> tranche 2\'s flag 21 '
			+ 're-measured from this side and confirmed &mdash; nothing over 0.50&nbsp;px, #334455 at '
			+ '1.86:1, and the study lifts the ink to show colour is not the problem. <b>blade:</b> '
			+ 'Laravel\'s own logomark is a WIREFRAME whose <b>median</b> run is 0.50&nbsp;px; filling '
			+ 'it solid leaves a plain hexagon that is not the mark and would collide with bicep. '
			+ '<b>behat:</b> L2 tier 3, built from vscode-icons\' MIT vector of the hand-drawn "B", '
			+ 'strokes at 0.50&nbsp;px, and at 16 px a gray blob with a hole. <b>To overturn any of '
			+ 'these</b> you are ruling that an icon may ship illegible, which every version of this '
			+ 'guide has refused.'
	},
	{
		title: 'bicep ships &mdash; the Microsoft counter-example, and why the licence really is different',
		rule: 'L2 sourcing / L5 prettier rider',
		subjects: ['bicep'],
		text: 'The brief asked whether Azure/bicep\'s MIT licence actually covers its logo assets. '
			+ '<b>It does, and it was checked rather than assumed.</b> Microsoft\'s OSS repositories '
			+ 'normally attach a trademark notice that carves logos out of the repo licence &mdash; '
			+ 'the standard "Authorized use of Microsoft trademarks or logos is subject to Microsoft\'s '
			+ 'Trademark &amp; Brand Guidelines" clause. <code>Azure/bicep</code> has no such clause '
			+ 'anywhere: not in LICENSE (plain MIT, no rider), not in README, not in CONTRIBUTING, not '
			+ 'in SECURITY. <code>docs/images/BicepLogoImage.svg</code> is therefore MIT-licensed '
			+ 'artwork, and bicep ships its real mark while azure does not &mdash; which is exactly '
			+ 'what makes the Azure decline a line rather than a mood. <b>What the rider did.</b> The '
			+ 'mark is an isometric cube with a white arm-and-dumbbell figure drawn across it at '
			+ '<b>stroke-width 4 on a 128-unit artboard = 0.40&nbsp;px</b>, and L8 bans strokes. The '
			+ 'reduction redraws nothing: the file already contains a <b>closed, filled path of the '
			+ 'same figure</b> (the #1D4A79 silhouette it paints the line work over), so that path '
			+ 'ships in the line work\'s own official white. Same geometry, brand\'s colour, a weight '
			+ 'that reads. <b>What it costs, and the fidelity pane shows it:</b> the official figure '
			+ 'is an OUTLINE, so filling it closes the ring at the elbow and the hexagonal nut in the '
			+ 'fist &mdash; the icon arrives as a cube with a solid white curl on it rather than as an '
			+ 'arm lifting a dumbbell. Punching the ring back in was measured and rejected: its '
			+ 'official wall is 2 of 128 source units, 0.30&nbsp;px at this fit. What survives is what '
			+ 'L5\'s detail budget asks to survive &mdash; the mark\'s gestalt, minus its interior '
			+ 'detail. <b>What was dropped:</b> the five cube-face polygons, which are '
			+ 'alpha-composited shading at opacity 0.7 (L8 bans opacity, and compositing them by hand '
			+ 'would invent hexes the file never declares). The cube keeps its silhouette and loses '
			+ 'its facetting. <b>Which blue:</b> the field\'s gradient runs #1D4A79 to #45CAF2 and is '
			+ 'flattened to its offset-1 stop, the reading chrome ratified; that stop measures 9.73:1 '
			+ 'on the editor ground where the other measures 2.04:1. All of it is in '
			+ '<code>proofs/bicep-reduction-study.png</code>.'
	},
	{
		title: 'autohotkey &mdash; tranche 2\'s flag 21 executed, and no family declared',
		rule: 'working rule 1 / cross-tranche',
		subjects: ['autohotkey', 'ahk2'],
		text: 'Flag 21 deliberately withheld a family declaration for <code>ahk2</code> and asked this '
			+ 'tranche to measure <code>autohotkey</code> itself and reach its own verdict, so that a '
			+ 'fiction would not be recorded from one side. <b>Done, independently, and it comes out '
			+ 'the same.</b> On the same simple-icons trace at the same compact envelope: nothing in '
			+ 'the AutoHotkey keycap exceeds <b>0.50&nbsp;px</b> of sustained ink (outline wall and '
			+ '"AHK" letter stems both 0.25&ndash;0.50, 25th percentile 0.63), and the official '
			+ '<code>#334455</code> measures <b>1.86:1</b> on the #121314 ground at L 26.7, above the '
			+ 'L 22 the lift rule triggers on. <code>proofs/sourced-but-illegible-study.png</code> '
			+ 'renders it twice, once in the official ink and once lifted, to show that colour is not '
			+ 'the problem. <b>So the pair is now consistently recorded:</b> autohotkey and ahk2 both '
			+ 'ship the <code>generic-code</code> glyph, both sit in the merged collapse group, both '
			+ 'are byte-identical, and <b>NO family is declared for either</b> &mdash; there is no '
			+ 'family mark for a base to be identical to, which is precisely what flag 21 predicted. '
			+ '<b>If you overturn the legibility call</b>, ahk2 and autohotkey become a rule-1(b) '
			+ 'family and the declaration goes here, in the module where the base lives.'
	},
	{
		title: 'bats is a BRANDED icon that will look neutral in the tree',
		rule: 'L6 achromatic exemption / R7',
		subjects: ['bats'],
		text: 'Not a decision to make, a consequence to see before you see it in the tree. Bats-core '
			+ 'publishes its own mark in its own MIT repo &mdash; a bat in flight, and this is a real '
			+ 'brand-tier find &mdash; and the colours it publishes it in are <b>#B1BBC0 with #FFFFFF '
			+ 'wing panels</b>. The set\'s neutral ink is <b>#A6AEB6</b>. Those are 10 degrees of hue, '
			+ '4 of lightness and 1 of saturation apart: <code>bats</code> is a branded icon whose '
			+ 'official palette lands <em>inside the set\'s own neutral lane</em>, and the twin audit '
			+ 'will pair it with every gray glyph in the S&nbsp;&lt;&nbsp;25 lane it reports. '
			+ 'L6\'s achromatic exemption forbids clamping a hueless ink &mdash; it is the rule that '
			+ 'stopped R4 turning editorconfig\'s white mascot red &mdash; so the brand\'s gray ships '
			+ 'and form is what separates it. <b>The second thing to look at:</b> what survives at '
			+ '16 px is the wing V and the body between its peaks; the four white panels inside the '
			+ 'wings (0.38&ndash;0.75&nbsp;px edges against a 2.50&nbsp;px wing mass) do not resolve, '
			+ 'so the icon arrives as a bat SILHOUETTE rather than as the illustrated mark. The '
			+ 'verdict is recorded as marginal for both reasons. <b>The repo ships light-mode and '
			+ 'dark-mode files</b> as its own two palettes; the dark-mode file is what ships here, '
			+ 'which is the reading tranche 2 ratified on alchemy.'
	},
	{
		title: 'ballerina &mdash; L2\'s third tier, used a second time and corroborated twice',
		rule: 'L2 sourcing (tier 3)',
		ruling: true,
		subjects: ['ballerina'],
		text: 'Tranche 2 opened L2\'s third tier on antlr and then lost the icon to the twin audit, so '
			+ 'this is the first subject in the set to actually SHIP from it, and the hunt is on the '
			+ 'record in full. <b>Tier 1 exists and is the wrong file:</b> ballerina.io publishes '
			+ '<code>images/ballerina-logo.svg</code>, which is the WORDMARK ONLY &mdash; 660&times;122 '
			+ 'units of #464646 letterforms with no symbol anywhere in the file &mdash; and its '
			+ 'favicon is an .ico. Every plausible symbol URL answers 404. <b>Tier 2 is empty:</b> '
			+ 'simple-icons has no <code>ballerina</code> entry. <b>Tier 3 is corroborated:</b> '
			+ 'vscode-icons (MIT) and Material (MIT) each carry a vector of the same mirrored '
			+ 'dancer-pair symbol, drawn independently and agreeing shape for shape, which is what '
			+ 'separates a faithful vector of a real mark from one theme\'s invention. vscode-icons\' '
			+ 'ships and is kept at <code>sources-svg/ballerina-vsicons.svg</code>. <b>Colour:</b> '
			+ 'vscode-icons paints #20B4AE and Material #00BFA5; brand-colors.json has no ballerina '
			+ 'entry so no source-of-truth rule fires, and #20B4AE &mdash; the teal ballerina.io itself '
			+ 'uses &mdash; ships. <b>What this sets up:</b> if tier 3 is acceptable here, the same '
			+ 'reasoning would reinstate antlr (flag 18) and would reach appscript, blade and behat '
			+ '&mdash; except that those three fail on legibility rather than sourcing, so only antlr '
			+ 'actually moves.'
	},
	{
		title: 'arduino &mdash; the brand\'s own file is not the brand\'s own mark',
		rule: 'L2 sourcing / L5',
		subjects: ['arduino'],
		text: 'A case L2\'s preference order does not anticipate: the brand tier was reached, the file '
			+ 'is genuine, and it is still not what ships. <code>content.arduino.cc</code> publishes '
			+ '<code>Arduino_logo_teal.svg</code> &mdash; the infinity over the "Arduino" wordmark, '
			+ 'seven paths, all #00878F &mdash; and its infinity has <b>three subpaths: the outer '
			+ 'contour and two plain loop counters</b>. No plus. No minus. A plain infinity is not the '
			+ 'Arduino mark; the minus in the left loop and the plus in the right one are the whole '
			+ 'point of the drawing, and simple-icons, Material and vscode-icons all three draw them. '
			+ 'So the CC0 trace ships and the brand file stays as the fidelity reference, where you '
			+ 'can see the difference for yourself in the provenance pane. <b>What to judge at '
			+ '16 px:</b> the plus and minus are 1.13 of 24 source units and land on '
			+ '<b>0.72&nbsp;px</b>, under L5\'s floor, and they are kept at official proportions '
			+ 'anyway &mdash; the docker and chrome reading, where fine official detail is kept rather '
			+ 'than thickened. They render as a dark notch in each loop. Thicken them and the loops '
			+ 'close up; drop them and the icon is a generic infinity symbol that belongs to nobody.'
	},
	{
		title: 'Three brand files, no declared licences &mdash; and five that are clean',
		rule: 'L2 licensing',
		subjects: ['appwrite', 'avalonia', 'avro', 'ballerina', 'bats', 'bazel', 'bicep'],
		text: 'Tranche 1 shipped Google\'s chrome-logo.svg with "no declared licence" written on the '
			+ 'sheet and tranche 2 added four more; the balance improves sharply here, which is worth '
			+ 'recording because it is the first tranche where most of the branded subjects are '
			+ 'cleanly licensed. <b>No declared terms (the chrome situation):</b> '
			+ '<code>appwrite</code> &mdash; appwrite.io\'s own logomark asset, no terms on the file, '
			+ 'though the project itself is BSD-3-Clause. That is the only one of the nine branded '
			+ 'subjects in this position. <b>Cleanly licensed:</b> <code>avalonia</code> MIT '
			+ '(AvaloniaUI/Avalonia), <code>avro</code> Apache-2.0 (apache/avro), <code>bats</code> '
			+ 'MIT (bats-core/bats-core), <code>bazel</code> Apache-2.0 (bazelbuild/bazel-website), '
			+ '<code>bicep</code> MIT (Azure/bicep, checked for a trademark rider and there is none). '
			+ '<b>Licensed, but by a third party:</b> <code>ballerina</code> is MIT from vscode-icons '
			+ 'and the MARK is a WSO2 trademark &mdash; the licence covers the vector, not the '
			+ 'trademark, which is the same shape of exposure every tier-2 simple-icons subject '
			+ 'already carries. <b>CC0 from simple-icons:</b> <code>arduino</code>, '
			+ '<code>autoit</code>. Nothing here needs a decision to proceed; it needs you to know '
			+ 'the shape of the exposure and to say if the bar should be higher than chrome set it.'
	},
	{
		title: 'Four concepts identified before they were judged &mdash; and one trap not walked into',
		rule: 'process / L2',
		superseded: 'CARRIED FORWARD, not superseded. Every identification here is still '
			+ 'load-bearing and three of them decided a fix-round rebuild: bolt really is FIREBASE '
			+ 'Bolt (so Firebase\'s flame is what applies), blink really is Nuke\'s BlinkScript '
			+ '(so Nuke\'s mark was the one built and measured), and the sharkdp/bat trap is still '
			+ 'a trap — bat took the terminal object glyph, not that slug.',
		subjects: ['atom', 'bbx', 'blink', 'bolt', 'bat'],
		text: 'The brief asked for these to be verified rather than assumed, and in four cases the '
			+ 'roster label is misleading enough that the verdict would have been wrong without it. '
			+ '<b>atom</b> is not the Atom editor: an <code>.atom</code> file is an Atom FEED (the '
			+ 'Atom Syndication Format, RFC 4287), the editor never used the extension, and Material '
			+ 'confirms it by mapping <code>.atom</code> to its XML icon alongside .bpmn and .dita. '
			+ 'vscode-icons draws a science-diagram atom, which is a pun. <b>bbx</b> is not a BASIC '
			+ 'dialect: Material added its bbx icon in the commit <i>"add icons for *.bib files and '
			+ 'BibTeX language IDs"</i> and declares it next to <code>cbx</code> and <code>lbx</code>, '
			+ 'so it is BibLaTeX\'s bibliography-style file and belongs with bibliography and '
			+ 'bibtex-style. <b>blink</b> is not the browser engine: Material\'s icon was added as '
			+ '<i>"Added Blink (The Foundry Nuke) icon"</i>, so a <code>.blink</code> file is a '
			+ 'BlinkScript kernel. <b>bolt</b> is not bolt.new and not Bolt CMS: it is Firebase Bolt, '
			+ 'the archived security-rules compiler at FirebaseExtended/bolt. <b>And the trap:</b> '
			+ 'simple-icons v16.29.0 carries a slug <code>bat</code>, and it is <b>sharkdp/bat, the '
			+ 'Rust <code>cat</code> clone</b>, at #31369E. Shipping it would have put an unrelated '
			+ 'brand\'s mark on every Windows batch file in the tree. It is not used, and this flag '
			+ 'exists so nobody uses it later by accident.'
	},
	{
		title: 'TOOLING &mdash; the slice sheet\'s stale prose is now driven off the data',
		rule: 'process',
		subjects: [],
		// this flag QUOTES the phrases the §5 selector looks for, so it would select
		// itself; the override the fix introduced is the right way to say otherwise,
		// and using it here is also the only test that the override works
		ruling: false,
		text: 'Tranche 2\'s flag 22 chartered exactly one file beyond this module, and it is done. '
			+ '<code>tools/build-slice-sheet.mjs</code> had three sentences hard-coded to tranche 1\'s '
			+ 'world and they are now computed from the merged slice and its manifest, with no '
			+ 'cosmetic change to a page that is already approved. <b>(1) The coverage sentence</b> '
			+ 'said the revision "covers the roster\'s archive and binary categories"; it now names '
			+ 'the categories the built subjects actually carry, taken from the manifest, so it says '
			+ '"archive, binary and code" today and stays right whatever lands next. <b>(2) The '
			+ 'prettier-rider count</b> said "one subject needed the prettier rider (onnx)" when three '
			+ 'did by tranche 2 and four do now; the sheet counts subjects whose simplification log '
			+ 'records a rider and names them, so the number cannot drift again. <b>(3) The '
			+ '"flags 3, 4 and 7 are the ones to argue with" pointer</b> was tranche 1\'s numbering '
			+ 'and had been wrong since tranche 2 landed; the sheet now selects the flags that '
			+ 'actually ask for a verdict, reading each flag\'s own text for the phrases the house '
			+ 'style already uses for that ("to overturn", "ruling requested", "your options", "say '
			+ 'the word"), with an optional <code>ruling</code> boolean a tranche may set to override '
			+ 'the reading. That works on all three tranches without any of them being edited. Two '
			+ 'smaller stale spots went with it: the "three came from the brand\'s own SVG" count and '
			+ 'the study filenames named in the footer. <b>Proofs:</b> <code>node tools/gates.mjs '
			+ 'A01</code> and <code>node '
			+ 'tools/gates.mjs</code> (pilot mode) both re-run green, and <code>git status</code> '
			+ 'shows <code>pilot/</code> and <code>samples/</code> byte-clean.'
	}
];

// =============================================================================
// FIX-ROUND FLAGS — appended after every tranche's FLAGS. Tranche 1's are 36-39,
// tranche 2's 40-42; these are 43-51.
// =============================================================================

export const FIX_FLAGS = [
	{
		title: 'azure ships &mdash; and azurestreamanalytics fell back on a measurement, not a licence',
		rule: 'L2 licensing (ruled) / working rule 1(b)',
		subjects: ['azure', 'azurestreamanalytics'],
		text: 'Flag 26 is the best-argued licence decline in the slice — it quotes Microsoft\'s own '
			+ 'terms verbatim rather than inferring anything — and the ruling voids it outright, '
			+ 'which also means the hard question it raised (whether Azure/bicep\'s MIT licence can '
			+ 're-license artwork Microsoft publishes under narrower terms) <b>never has to be '
			+ 'answered</b>. The terms stay written on the subject, verbatim, because provenance '
			+ 'duty is untouched. <b>Sourcing, and a finding worth recording:</b> the Azure '
			+ 'ARCHITECTURE icon set does not contain the corporate "A" at all. The fix round '
			+ 'walked the copy Azure/bicep vendors — 176 files across nineteen categories — and '
			+ 'every one is a SERVICE icon; the mark itself is published as no vector by Microsoft '
			+ 'anywhere. So the geometry is devicon\'s MIT vector of the same official artwork, '
			+ 'with its two gradients flattened to their offset-1 stops (#0669BC, #2892DF) and the '
			+ 'flat #0078D4 connector kept, which is also brand-colors.json\'s Azure blue. '
			+ '<b>What was dropped:</b> a fourth layer &mdash; a shading wash whose five gradient '
			+ 'stops declare <code>stop-opacity</code> only (0.3 falling to 0) and no '
			+ '<code>stop-color</code> at all, i.e. black at low alpha: the shadow under the fold. '
			+ 'L8 bans opacity and there is no hex to flatten it to, because the file never writes '
			+ 'one. That is bicep\'s cube-face reduction, again. <b>azurestreamanalytics is the interesting half.</b> Its OWN official artwork '
			+ 'is now available too, and the fix round built it rather than assuming: '
			+ '<code>00042-icon-service-Stream-Analytics-Jobs.svg</code>, a gray gradient cog with '
			+ 'three cyan stream arcs threaded through it. The arcs are 0.9-unit strokes on an '
			+ '18-unit artboard and land on <b>0.65&nbsp;px</b>; the whole mark measures '
			+ '0.50&nbsp;/&nbsp;0.69&nbsp;/&nbsp;1.19&nbsp;px. Dropping the arcs leaves a cog, '
			+ 'which is not the mark and is a generic object besides. So this is the first time '
			+ 'working rule 1 branch (a) had a real variant glyph to adapt and LOST it to L5, and '
			+ 'the honest fallback is branch (b): .asaql is an Azure service file, so it ships the '
			+ 'Azure mark byte-identically. Both are in '
			+ '<code>proofs/license-freed-t3-study.png</code>.'
	},
	{
		title: 'aspx ships the .NET plate &mdash; and asp is the one family call that is a judgement',
		rule: 'L5 / prettier rider / working rule 1(b)',
		ruling: true,
		subjects: ['aspx', 'asp'],
		text: '<b>The reduction first, because it is not a judgement at all.</b> Flag 27 declined '
			+ 'the .NET mark saying "the only reductions available are dropping the field (leaving '
			+ 'a bare wordmark, which is ada\'s case) or dropping letters (leaving \'.N\', which is '
			+ 'not a mark)". The pilot had already ruled otherwise: dotenv\'s official ".ENV" '
			+ 'measured <b>0.50&nbsp;px</b>, the prettier rider dropped the N and the V, scaled the '
			+ 'surviving ".E" 2.5x as ONE group and re-centred it on the square, and the pilot gate '
			+ 'approved it as built. The .NET numbers are the same to two decimals: measured on the '
			+ 'letters alone, the official ".NET" stems land on <b>0.50&nbsp;px</b>, and the '
			+ 'surviving ".N" at dotenv\'s own k&nbsp;=&nbsp;2.5 comes back at '
			+ '<b>1.25&ndash;1.38&nbsp;px</b>, over L5\'s floor. k&nbsp;=&nbsp;2.2 was measured too '
			+ 'and lands on 1.13, under it. Every letterform is Microsoft\'s own geometry and the '
			+ 'pair\'s spacing is the file\'s own. The source is the cleanest-licensed in the slice '
			+ 'either way: <code>github.com/dotnet/brand</code>, CC0-1.0, which flag 25 found. '
			+ '<b>Now the judgement, and it is genuinely split.</b> The roster gives '
			+ '<code>asp</code> the extensions .asa, .asax, .ascx, .asp AND .aspx, and gives '
			+ '<code>aspx</code> the extensions .ascx and .aspx. They OVERLAP on two, and three of '
			+ 'asp\'s five (.asax, .ascx, .aspx) are ASP.NET files. <b>Converged</b> (what ships): '
			+ 'both take the .NET mark as a rule-1(b) family, the tree is consistent, and the cost '
			+ 'is that a classic <code>Global.asa</code> wears .NET\'s mark although classic ASP '
			+ 'predates .NET by five years. <b>Split</b> (the alternative): aspx takes the mark and '
			+ 'asp stays on the gray glyph, which is more correct about 1996 and means a '
			+ '<code>Global.asax</code> — an ASP.NET file — gets a gray glyph, and which of the two '
			+ 'icons a <code>.aspx</code> actually shows then depends on which matcher rule wins. '
			+ '<b>Convergence is what ships and it is one line to split.</b>'
	},
	{
		title: 'appscript and blade &mdash; two reductions flag 27 said were not available',
		rule: 'L5 / prettier rider',
		subjects: ['appscript', 'blade'],
		text: 'Neither of these was ever a licence case, so the fix round owed them a second '
			+ 'attempt at the reduction rather than a re-hunt — the bar being the pilot\'s own '
			+ 'editorconfig, which went from "a line drawing cannot survive" to an approved '
			+ 'reduction in one round. <b>appscript.</b> The official mark is nine subpaths: four '
			+ 'tapering blades and FIVE detached pivot dots, and at the open envelope it measures '
			+ '0.75&nbsp;px at the 5th percentile and 0.94 at the 25th — a blue scatter at 16&nbsp;'
			+ 'px, exactly as flag 27 said. What flag 27 did not try is the reduction L5\'s detail '
			+ 'budget actually asks for: <b>drop the five dots, keep the four blades</b>. That '
			+ 'takes the ink to <b>2.25&nbsp;px at the 25th percentile and 3.06 at the median</b>, '
			+ 'and every blade keeps its official contour, angle and position — nothing thickened, '
			+ 'moved or redrawn. What arrives is a blue fan, which is the mark\'s gestalt; what is '
			+ 'lost is studs that never resolved. <b>blade.</b> Flag 27 said "filling it solid '
			+ 'leaves a plain hexagon, which is not the mark and would collide with bicep". It is '
			+ 'not a plain hexagon: Laravel\'s logomark is an isometric "L" and its OUTER CONTOUR '
			+ 'is that L — stepped and asymmetric, with the notch cut out of its top right. The '
			+ 'wireframe seams are the interior detail, the official wireframe\'s MEDIAN run is '
			+ '<b>0.44&nbsp;px</b>, and the contour alone measures <b>2.00&nbsp;px at the 5th '
			+ 'percentile and 5.19 at the 25th</b>. That is bicep\'s trade, approved at the pilot '
			+ 'gate: the cube lost its facetting and kept its silhouette. <b>What the rider costs '
			+ 'is stated on the subject and visible in the fidelity pane:</b> the official mark '
			+ 'reads as a wireframe BLOCK and this reads as a flat red L. Keeping the widest single '
			+ 'seam was measured (0.50&nbsp;px) and rejected — one seam of eight reads as a scratch '
			+ 'rather than as structure. The bicep collision was CHECKED and not assumed; the twin '
			+ 'audit scores the pair on every run and prints the number.'
	},
	{
		title: 'The rider attempts that failed &mdash; behat, blink and autohotkey, re-measured',
		rule: 'L5 / prettier rider',
		subjects: ['behat', 'blink', 'autohotkey'],
		text: 'Recorded at the same length as the wins, because a fix round that only reports its '
			+ 'successes is not evidence. <b>behat.</b> Re-measured at 0.44&nbsp;/&nbsp;0.94&nbsp;/'
			+ '&nbsp;1.25&nbsp;px for the 5th, 25th and 50th percentiles. The rider has no move '
			+ 'available here and that is a structural fact rather than a preference: the tier-3 '
			+ 'vector is a SINGLE closed contour tracing a brush stroke — no counters to shrink the '
			+ 'apib way, no strokes to widen the alchemy way, no second filled path to adopt the '
			+ 'bicep way. Thickening it would need a path offsetter the pipeline does not have, and '
			+ 'would be a redraw if it had one. <b>blink.</b> This one changed CATEGORY rather than '
			+ 'outcome. Flag 23 filed it under "a product\'s mark is not the format\'s", and the '
			+ 'fix round overturns that reading for safetensors and bolt — so Nuke\'s mark had to '
			+ 'be built and measured rather than declined on meaning. It fails on L5: the mark is a '
			+ 'ring inside a ring with a small rotor glyph, measuring '
			+ '0.56&nbsp;/&nbsp;0.63&nbsp;/&nbsp;0.94&nbsp;px, and at 16&nbsp;px it is a gray disc '
			+ 'with a smudge. It would also land in the antlr/chrome disc neighbourhood, and the '
			+ 'fix round has spent its one declared look-alike. <b>autohotkey (with ahk2).</b> Three '
			+ 'reductions measured, in flag 42, and the only one that clears the floor does so by '
			+ 'deleting the "AHK" and leaving a rounded-square ring. The brand\'s own modern logo '
			+ 'was fetched too and is worse: 137.78&nbsp;&times;&nbsp;22.19 units of "AutoHotkey" '
			+ 'spelled out as seventy-five gradient-painted keycaps. <b>All three stay on the '
			+ 'glyph, and all three are now legibility verdicts rather than sourcing ones</b>, '
			+ 'which is the shape the whole neutral pile has taken.'
	},
	{
		title: 'bashly-hook &mdash; the mask objection was a reader bug, not a law',
		rule: 'L8 / L2 sourcing',
		subjects: ['bashly-hook'],
		text: 'Flag 23 filed this under "no mark" on the grounds that bashly\'s symbol is "a '
			+ 'hexagonal chevron with a \'$\' knocked out of it by an SVG <code>mask</code> element '
			+ '&mdash; and L8 bans masks, the mask being the entire content of the glyph". <b>L8 '
			+ 'bans masks in the shipped icon; it does not ban reading one.</b> The mask here is '
			+ 'the simplest kind there is: a white rectangle that shows everything, with the "$" '
			+ 'painted black over it to hide that shape. "The chevron except where the $ is" is '
			+ 'the definition of a COUNTER, so converting it is the same class of move as tranche '
			+ '3\'s own polygon reader on bicep and the engine\'s circle reader — every coordinate '
			+ 'is the file\'s own, the chevron is emitted clockwise and the $ counter-clockwise, '
			+ 'and nonzero winding punches the hole the mask described. Measured at the compact '
			+ 'envelope: 1.88&nbsp;px at the 25th percentile with the $\'s counter open at '
			+ '1.56&nbsp;px. The wordmark beside the symbol is dropped as a lockup (the apex '
			+ 'reading), and the official #434343 — which is drawn for a light README and measures '
			+ '2.01:1 on the editor ground — is lifted to L&nbsp;88 by the one documented L2 rule, '
			+ 'hue and saturation untouched. <b>The 16&nbsp;px verdict is MARGINAL and says why:</b> '
			+ 'the chevron and the $\'s vertical bar hold, the S-curve does not, so what arrives is '
			+ 'a light arrow with a slot in it rather than a legible dollar. It ships because it is '
			+ 'a real mark and a distinct one; if you would rather have the gray brackets than a '
			+ 'marginal symbol, this is the subject to say it on. <b>No family is declared</b>, '
			+ 'unchanged from tranche 3: <code>bashly</code> itself is not an A01 roster id, so '
			+ 'there is no base here for rule 1 to make this a variant of.'
	},
	{
		title: 'The vocabulary opens twice &mdash; the stopwatch and the terminal',
		rule: 'working rule 2 (widened)',
		ruling: true,
		subjects: ['bench-js', 'bench-jsx', 'bench-ts', 'awk', 'bat'],
		text: '<b>This is a rule change and it is flagged as one.</b> Five concepts left the gray '
			+ 'brackets not because a licence fell but because working rule 2\'s OBJECT branch was '
			+ 'read more generously, and that reading will travel. <b>The stopwatch (bench-js, '
			+ 'bench-jsx, bench-ts).</b> Flag 24 measured this glyph clean and said so in as many '
			+ 'words — 1.38&nbsp;px minimum, 2.25 at the 25th percentile, R8-clean against the '
			+ 'entire vocabulary at under 0.40 on a 0.72 bar, "nothing technical stands in its way" '
			+ '&mdash; and declined it on one sentence: "a benchmark names a measurement", not an '
			+ 'object. The fix round reads the branch as <i>the object a concept is MEASURED WITH, '
			+ 'where that object is unambiguous and universal</i>. A benchmark is timed; the '
			+ 'stopwatch is not a metaphor for it the way a lightning bolt is a metaphor for speed. '
			+ '<b>Reading 3 is untouched and still out:</b> painting js\'s and ts\'s official hexes '
			+ 'onto a stopwatch neither language draws composes a mark no brand publishes, which no '
			+ 'licence ruling reaches. <b>The precedent still travels</b> and now travels somewhere '
			+ 'specific: every per-language variant family in every later slice — test-js, spec-ts, '
			+ 'stories-tsx — lands on ONE shared object glyph in the neutral gray, never the '
			+ 'languages\' own colours. <b>The terminal (awk, bat).</b> This one needed no rule '
			+ 'change at all. Tranche 3 built it, measured it R8-clean, and declined it for exactly '
			+ 'one stated reason: "tranche 2 already put applescript on the generic-code glyph, so '
			+ 'adding the glyph now would make the set inconsistent with a decision three subjects '
			+ 'ago". <b>applescript moved to the Apple logo in this round</b>, so the reason is '
			+ 'gone. A .bat and a .awk are run in a terminal, Material independently files both '
			+ 'with its shell icon, and cmd.exe\'s own icon is a PE resource Microsoft publishes as '
			+ 'no vector — so the object is the honest icon. Measured 1.81&nbsp;/&nbsp;2.63&nbsp;px, '
			+ 'one sub-shape with two counters, nothing that can fuse. <b>What you may want to rule '
			+ 'on:</b> whether the terminal should also carry the shell and bash concepts when they '
			+ 'arrive, which is a later slice\'s question but this round\'s precedent; and whether '
			+ 'bashly-hook, whose files are literally <code>src/before.sh</code>, belongs on the '
			+ 'terminal rather than on bashly\'s own symbol. It ships on the symbol, because R1 '
			+ 'prefers a real mark.'
	},
	{
		title: 'THE BRACKET COUNT &mdash; forty is now twenty, and what the twenty are',
		rule: 'working rule 2',
		ruling: true,
		subjects: ['ada', 'affectscript', 'agda', 'ahk2', 'anyscript', 'apl', 'atom', 'ats',
			'autohotkey', 'axure', 'bak', 'bbx', 'beancount', 'befunge', 'behat', 'bibliography',
			'bibtex-style', 'biml', 'blink', 'blitzbasic'],
		text: 'The question that opened the gate was "why is there a lot of the same angled '
			+ 'brackets?", and this is the answer in numbers. <b>Forty of eighty-four carried the '
			+ 'generic-code glyph; twenty do.</b> <b>Fifteen</b> found real marks once licence '
			+ 'stopped gating or once a reduction was attempted a second time &mdash; actionscript, '
			+ 'adobe-swc, al, al-dal, antlr, apex, applescript, appscript, asp, aspx, azure, '
			+ 'azurestreamanalytics, bashly-hook, blade, bolt &mdash; and <b>five</b> moved onto the '
			+ 'two new object glyphs (awk and bat to the terminal, the three bench ids to the '
			+ 'stopwatch). Add vsix and safetensors, which came off tranche 1\'s archive and binary '
			+ 'glyphs, and <b>seventeen subjects gained a real mark in this round</b>. Counting the '
			+ 'whole slice rather than one glyph: <b>84 icons, 54 now carrying a real mark against '
			+ '37 before</b>, and 30 on the neutral vocabulary against 47. <b>The twenty that '
			+ 'remain, sorted by why:</b> '
			+ '<b>(a) the mark exists and cannot be read at 16&nbsp;px</b> — ada, agda, ahk2, '
			+ 'autohotkey, behat, blink. Six, every one re-measured this round with sourcing free, '
			+ 'every reduction attempted and logged (flags 42 and 46). <b>(b) there is genuinely no '
			+ 'mark to draw</b> — affectscript, anyscript, apl, atom, ats, bak, bbx, befunge, '
			+ 'bibliography, bibtex-style, biml, blitzbasic. Twelve, and these are not declines at '
			+ 'all: a published IETF format, a POSIX-adjacent esoteric language, a company that no '
			+ 'longer exists, a wiki\'s community logo, a state rather than a thing. <b>(c) the '
			+ 'artwork is raster only</b> — axure, beancount. Two, and this is the one class the '
			+ 'ruling deliberately does NOT reach: tracing a raster is freehand geometry, which L2 '
			+ 'rejects on fidelity, and that is the rule the round-1 rejection created. <b>Nothing '
			+ 'in the twenty is there for a licence any more.</b> If you want the number lower '
			+ 'still, the remaining levers are: rule that a redrawn mark is acceptable when the '
			+ 'official one cannot be read (which would take jar, ada, agda, ahk2, autohotkey, '
			+ 'behat and blink, and would reverse the round-1 rejection); or open more object '
			+ 'glyphs, one measured R8 check at a time, for the concepts in pile (b) that name '
			+ 'something — bak names a copy, atom names a feed.'
	},
	{
		title: 'TOOLING &mdash; the five engine edits this round made, and their proofs',
		rule: 'process',
		subjects: [],
		ruling: false,
		text: 'Everything the fix round changed outside the three tranche modules, with the proof '
			+ 'for each. <b>(0) <code>color.mjs</code> &mdash; the one that is a SET CONSTANT and '
			+ 'wants your ruling.</b> The L2 visibility lift triggered on <code>L &lt; 22</code>, '
			+ 'which was calibrated on the only case the pilot had (markdown\'s pure black) and '
			+ 'measures the wrong thing: L5\'s duty is about CONTRAST against the backdrop. '
			+ 'L&nbsp;22 achromatic is #383838, which measures 1.59:1, so the old rule fired only '
			+ 'below about 1.6 &mdash; which is why tranche 2 had to write "no lift rule reaches '
			+ 'it" of AutoHotkey\'s #334455 at 1.86:1, and why bashly\'s #434343 at 1.88:1 hit the '
			+ 'same gap. <b>The trigger now tests contrast at 3.0:1</b> (WCAG 2.1\'s non-text '
			+ 'minimum), target unchanged at L&nbsp;88, hue and saturation still untouched. The '
			+ 'set\'s own evidence brackets that line from both sides: the dimmest branded PRIMARY '
			+ 'it has ever shipped is autoit\'s #5D83AC at 4.70:1, and the dimmest field it '
			+ 'REJECTED is bicep\'s #1D4A79 at 2.04:1 &mdash; nothing sits between 2.4 and 4.7. '
			+ 'The lift is still OPT-IN per subject, so no icon that does not call it can move: '
			+ 'the three callers are markdown, applescript and bashly-hook, and <b>the pilot\'s 44 '
			+ 'files are byte-identical after the change</b>. <b>(1) <code>geom.mjs</code></b> '
			+ 'gains two vocabulary glyphs, '
			+ '<code>terminalGlyph()</code> and <code>stopwatchGlyph()</code>, both shipped '
			+ 'unchanged from the drawings tranche 3 already built and measured in its own studies '
			+ '&mdash; no existing function was touched, so no existing icon can move. <b>(2) '
			+ '<code>audit.mjs</code></b> gains the LOOK-ALIKE lane flag 41 charters: a declared '
			+ 'pair is reported with its live R7/R8 scores and never fails, an undeclared pair '
			+ 'scoring the same still fails, and the lane prints what it is exempting on every run. '
			+ 'It is fed from the registry (<code>LOOKALIKE</code>), so a declaration lives in the '
			+ 'tranche that owns the mark. <b>(3) <code>build-slice.mjs</code></b> records the '
			+ 'round: a <code>fix_round</code> block in the manifest (the pilot\'s own pattern) '
			+ 'merged from each tranche\'s <code>FIX_ROUND</code>, and the neutral vocabulary list '
			+ 'is now read off the registry instead of being hard-coded — the same staleness bug '
			+ 'flag 22 caught on the sheet, fixed in the manifest before it could bite. <b>(4) '
			+ '<code>build-slice-sheet.mjs</code></b> gains the fix-round strip: every rebuilt '
			+ 'subject shown as what-it-was next to what-it-is, at a true 16&nbsp;px, plus '
			+ 'supersession banners on the flags the ruling overturned. Flags are numbered so the '
			+ 'gate\'s own 1&ndash;35 keep their numbers and the fix round\'s continue from 36. '
			+ '<b>Proofs:</b> <code>node tools/gates.mjs A01</code> green at 84/84 with 0 failures '
			+ 'and 0 undeclared collisions; <code>node tools/gates.mjs</code> (pilot mode) green; '
			+ '<code>git status</code> shows <code>pilot/</code> and <code>samples/</code> '
			+ 'byte-clean; every A01 subject the fix round did NOT touch was sha256-compared '
			+ 'before and after and is byte-identical; and the pilot\'s own 44 files were '
			+ 'sha256-compared across the <code>color.mjs</code> edit specifically.'
	}
];
