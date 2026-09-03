// sources.mjs — the pilot roster, each mark ADAPTED from real vector artwork.
//
// Guide L2, hardened: geometry derives from the official files. Every subject
// below therefore reads its path data out of a real source (the brand's own SVG
// fetched into ../sources-svg/, or simple-icons' CC0 vectors) and does exactly
// three things to it: pick which subpaths carry which official colour, drop or
// re-space what L5 cannot hold at 16 px, and fit the result into the optical
// envelope. Nothing is drawn by hand except the concepts that own no mark
// (json, folder-src, folder-test), which come from the shared neutral glyph
// vocabulary.
//
// A subject is expressed as an ordered list of `parts` in SOURCE coordinates.
// One affine fits them all, so a file icon and its folder's face mark are the
// SAME geometry at two scales — that identity is what makes the pair rhyme (L7)
// and what the derivation gate asserts.
//
// The first twelve specs are the round-2 masters, ported VERBATIM: check.mjs
// asserts their fitted geometry still reproduces samples/masters/ byte for byte,
// so "carried, frozen" is a measurement and not a promise.
//
// The reader helpers, the envelope table and the fit machinery moved into
// spec-engine.mjs when production slices started, so the slice registries fit
// their subjects through the identical code path. This file is now just the
// PILOT'S registry plus the exports the pilot's tools already import.

import svgpath from 'svgpath';
import { subpaths, unionBBox, bbox, round, ellipse, roundRect, xform } from './pathkit.mjs';
import { brace, chevron, hexagon, check } from './geom.mjs';
import { NEUTRAL, WHITE, lift } from './color.mjs';
import { officialPaths, officialLayers, officialClassPaths, officialSvg, icon, ENV, makeMaster }
	from './spec-engine.mjs';

export { officialSvg, ENV };

// =============================================================================
// the subjects
// =============================================================================

const S = {};

// -----------------------------------------------------------------------------
// CARRIED FROM ROUND 2 — frozen by D22. Ported verbatim; check.mjs proves the
// fitted output is byte-identical to samples/masters/. Do not refit.
// -----------------------------------------------------------------------------

// --- typescript ---------------------------------------------------------------
// simple-icons ships the mark as square + S + T with the letters wound against
// the square, so the very same path list gives both the two-colour lockup and
// the knocked-out mono version. Nothing is simplified.
S.typescript = {
	title: 'TypeScript',
	brand: '#3178C6',
	env: ENV.compact,
	plate: true,   // the official mark is a FIELD carrying a glyph (R8 lane, see audit.mjs)
	source: {
		name: 'simple-icons', slug: 'typescript', license: 'CC0-1.0',
		url: 'https://www.typescriptlang.org/branding',
		note: 'official square + TS letterforms, single path, 3 subpaths'
	},
	simplifications: [],
	parts() {
		const sp = subpaths(icon('typescript').path);
		return [
			{ d: sp[0], fill: '#3178C6' },   // the square
			{ d: sp[1], fill: WHITE },       // S
			{ d: sp[2], fill: WHITE }        // T
		];
	}
};

// --- editorconfig --------------------------------------------------------------
// REBUILT AT THE PILOT FIX ROUND (2026-09-03). The round-2 master flattened the
// mascot into a white silhouette with two dark slashes for lenses; Sebastian's
// gate verdict was that it is not the EditorConfig logo, and he is right — the
// official mark is a hand-drawn LINE drawing, and the flattening threw the
// drawing away.
//
// Sourcing (L2, preference order): the brand publishes its own vector after all —
// editorconfig/editorconfig holds assets/EditorConfig_Logo.svg, a CorelDRAW export
// of the mascot. It is fetched into ../sources-svg/ and used instead of
// simple-icons, so the geometry AND the colours are now the brand's own.
//
// Structure of that file: one #020202 path carries the whole ink drawing — its
// subpath 10 is the outer contour of everything (head, both ears, the spectacles
// where they overhang the face, the whisker), and subpaths 0-9 are the enclosed
// white regions punched out of it. Under nonzero winding, painting the contour and
// then painting the counters back on top in their official colours reproduces the
// drawing exactly, at half the bytes of emitting the contour twice.
//
// What L5 forces (all measured at the shipped 13.2 px fit — see the fix-round
// flags on the sheet): the ink line is 0.33 px on the head contour and 0.16-0.21
// px around the spectacle rims. Nothing can make a 0.2 px rim readable, so the
// PRETTIER RIDER applies: the lens interiors and the pupils are NOT painted back,
// which merges rim + lens + pupil into one solid spectacle per eye (3.45 x 1.91 px
// and 3.61 x 1.97 px), and the nostril is not painted back either, which turns the
// official 0.2 px nostril outline into a solid 1.82 x 0.89 px nose.
S.editorconfig = {
	title: 'EditorConfig',
	brand: '#FDFDFD',
	chipHue: '#E0648A',        // L6 erratum: the set-assigned rose for container styles
	env: { w: 13.2, h: 12.8 },
	source: {
		name: 'EditorConfig (brand\'s own SVG)', slug: 'editorconfig',
		license: 'none declared — editorconfig/editorconfig ships no LICENSE file and the '
			+ 'GitHub API reports license: null. Used as the brand\'s own mark for the brand\'s '
			+ 'own file type. FLAGGED for a ruling: simple-icons carries a CC0 trace of the same '
			+ 'drawing with the same subpath structure, and the identical construction on it '
			+ 'renders the same icon — but at 4475 B, over L8\'s 4 KB hard cap, so the CC0 '
			+ 'fallback would need a further reduction to ship',
		url: 'https://github.com/editorconfig/editorconfig/blob/master/assets/EditorConfig_Logo.svg',
		note: 'the hand-drawn mascot: one #020202 ink path (outer contour + 10 counters) '
			+ 'over #FDFDFD face regions, #FDF2F2 / #FEF3F3 ear interiors, #E3E3F8 pupils. '
			+ 'Fetched to sources-svg/editorconfig-official.svg. Replaces the round-2 '
			+ 'simple-icons silhouette, which the pilot gate rejected'
	},
	simplifications: [
		'PRETTIER RIDER. The mark is a line drawing whose lines are unreadable at 16 px: '
		+ 'the head contour is 0.33 px and the spectacle rims 0.16-0.21 px at the shipped fit',
		'the spectacles ship SOLID: the lens interiors (counters 3 and 5) and the pupils '
		+ '(counters 2 and 4) are not painted back, so official rim + lens + pupil merge into '
		+ 'one dark lens each — 3.45 x 1.91 px (left) and 3.61 x 1.97 px (right), with the '
		+ 'official 0.56 px bridge gap between them. The official rims already join at the '
		+ 'bridge, so the merge follows the mark',
		'the nostril (counter 0) is not painted back either: its official outline is 0.2 px, '
		+ 'and filling it solid gives a 1.82 x 0.89 px nose — the minor axis is under the '
		+ '1.2 px floor, kept because the alternative is a 0.2 px ring',
		'the pale-lavender pupils #E3E3F8 (0.39 x 0.52 px), the #EFEFEF cheek highlight and '
		+ 'the #FAF1F1 nostril fill are dropped — all under half a pixel',
		'the head contour, ear rims and whisker survive as sub-pixel ink (0.16-0.33 px) and '
		+ 'render as antialiasing rather than as line; on the #121314 backdrop the outer '
		+ 'contour is dark-on-dark, so the visible silhouette is the white face itself'
	],
	parts() {
		const sp = subpaths(officialClassPaths('editorconfig-official.svg')[6].d);
		return [
			{ d: sp[10], fill: '#020202' },              // the ink drawing's outer contour
			{ d: sp[1] + sp[7], fill: '#FDFDFD' },       // lower + upper face
			{ d: sp[9], fill: '#FEF3F3' },               // upper-left ear interior
			{ d: sp[8], fill: '#FDF2F2' }                // right ear interior
		];
	}
};

// --- json ----------------------------------------------------------------------
// No brand, no mark: the shared neutral glyph vocabulary.
S.json = {
	title: 'JSON (neutral glyph)',
	brand: NEUTRAL,
	chipHue: '#5B6672',
	neutral: true,
	env: { w: 11.4, h: 13.2 },
	source: { name: 'none — neutral glyph vocabulary', slug: null, license: null, url: null,
		note: 'JSON publishes no mark; braces from the set\'s own glyph vocabulary (L2)' },
	simplifications: [],
	parts() {
		const bp = { y0: 2.4, y1: 13.6, hookX: 6.8, t: 1.7, nib: 1.6 };
		return [{ d: brace(-1, bp), fill: NEUTRAL }, { d: brace(1, bp), fill: NEUTRAL }];
	}
};

// --- markdown -------------------------------------------------------------------
// dcurtis/markdown-mark is the mark's home repo. Its frame is 10/128 of the
// height, i.e. 0.63 px at 16 — invisible. The frame is therefore rebuilt with
// the SAME construction the official file uses (inset by t, corner radius 15-t)
// at t = 18, which lands it on 1.32 px; the M and the arrow are the official
// paths untouched, re-centred inside the thicker frame.
S.markdown = {
	title: 'Markdown',
	brand: lift('#000000'),   // official mark is black — the one L2 visibility lift
	chipHue: '#8B6FDB',       // L6 erratum: set-assigned violet for container styles
	env: ENV.flat,
	source: {
		name: 'markdown-mark (official repo)', slug: 'markdown', license: 'CC0-1.0',
		url: 'https://github.com/dcurtis/markdown-mark',
		note: 'svg/markdown-mark.svg — frame + M + down-arrow'
	},
	simplifications: [
		'frame stroke widened from the official 10/128 (0.63 px at 16) to 18/128 (1.32 px) '
		+ 'using the file\'s own inset construction — L5 minimum stem',
		'official black #000000 lifted to L 88 for the #121314 backdrop (the one L2 lift rule)'
	],
	parts() {
		const p = officialPaths('markdown-official.svg');
		const [M, arrow] = subpaths(p[1].d);     // the second path holds both glyphs
		const t = 18;
		const ink = this.brand;
		// the group keeps its official size; only its centring is recomputed
		const g = unionBBox([M, arrow]);
		const inner = { x: t, y: t, w: 208 - 2 * t, h: 128 - 2 * t };
		const dx = inner.x + (inner.w - g.w) / 2 - g.x1;
		const dy = inner.y + (inner.h - g.h) / 2 - g.y1;
		return [
			{ d: roundRect(0, 0, 208, 128, 15, true), fill: ink },
			{ d: roundRect(t, t, 208 - 2 * t, 128 - 2 * t, Math.max(0, 15 - t), false), fill: ink },
			{ d: xform(M, { dx, dy }), fill: ink },
			{ d: xform(arrow, { dx, dy }), fill: ink }
		];
	}
};

// --- docker ---------------------------------------------------------------------
// DECK RELOADED AT THE PILOT FIX ROUND (2026-09-03). The whale is verbatim in both
// rounds; what the gate rejected was the cargo. Round 2 shipped 3+1 — four boxes,
// the top one floating alone — and four boxes out of nine is not the loaded deck
// the mark is known for.
//
// The official grid is 5+3+1 on five columns at x 2.03 / 4.95 / 7.91 / 10.84 /
// 13.80 (pitch 2.93, gap 0.44 u) and three rows at y 8.82 / 6.10 / 3.39 (pitch
// 2.715, vertical gap 0.46 u). At any fit the 16-grid allows, the official
// horizontal gap is 0.26-0.29 px, so the column count has to come down.
//
// How far down is arithmetic, not taste (all measured; the study is
// pilot/proofs/docker-deck-candidates.png):
//   · the whale's back is flat from x 0.6 to x 17.4, and its tail fin stands at
//     x 17.79 across the bottom row's height. The official mark keeps 1.50 u of
//     clearance to that fin, i.e. its deck really spans x 2.03 .. 16.29 = 14.26 u.
//   · FOUR official-size boxes need 4x2.49 + 3x1.896 = 15.65 u to hold the 1.2 px
//     floor — 1.4 u more than the deck has. Pushed in anyway they cut the fin
//     clearance to 0.64 u (0.38 px) and the rightmost container fuses with the tail.
//   · four boxes INSIDE the deck instead force the box down to 86% of official
//     (1.29 px) and the gap to 1.15 px, under the floor.
//   · THREE columns fit with room to spare, at the round-2 pitch of 4.50 u.
// So: three columns, and the cargo is restored by filling them — 3+3+1, seven of
// the official nine, with the top box on the right-hand column exactly as the
// official's top box sits at the right end of the tier below it.
S.docker = {
	title: 'Docker',
	brand: '#2496ED',
	env: { w: 15.2, h: 10.4 },
	source: {
		name: 'simple-icons', slug: 'docker', license: 'CC0-1.0',
		url: 'https://www.docker.com/company/newsroom/media-resources',
		note: 'Moby whale, single path: 9 container squares + body'
	},
	simplifications: [
		'container grid reduced from the official 5+3+1 (nine boxes on five columns, '
		+ '0.26 px gaps at any allowed fit) to 3+3+1 on three columns — seven boxes. The '
		+ 'box is official subpath #7 translated, so its size and corner radius are '
		+ 'untouched (1.50 x 1.36 px), and the gaps land at 1.21 px, over L5\'s '
		+ 'official-forced 1.2 px floor',
		'three columns is the maximum: four official-size boxes need 15.65 u to hold the '
		+ 'floor and the whale\'s deck (x 2.03 .. 16.29, bounded by the tail fin at 17.79) '
		+ 'is 14.26 u, so a fourth column either cuts the fin clearance from the official '
		+ '1.50 u to 0.64 u or shrinks the box to 86% of official at a 1.15 px gap',
		'the official row pitch is kept, so the 0.46 u vertical gaps stay 0.28 px and the '
		+ 'rows fuse into columns exactly as they do in the official mark (L5 erratum)',
		'adding the third tier makes the mark taller than wide-envelope: the fit becomes '
		+ 'height-bound, so the ink is 14.50 x 10.40 (mass 151) instead of round 2\'s '
		+ '15.20 x 9.18 (mass 140)'
	],
	parts() {
		const sp = subpaths(icon('docker').path);
		const box = sp[7];                      // official container, bbox x 4.95..7.44 y 8.82..11.08
		const at = (x, y) => xform(box, { dx: x - 4.95, dy: y - 8.82 });
		const PITCH = 4.50;                     // round-2 constant: 2.49 box + 2.01 gap
		const COL = [0, 1, 2].map(i => 9.16 - (2 * PITCH + 2.49) / 2 + i * PITCH);
		const ROW = [8.82, 6.10, 3.39];         // official row origins
		return [
			{ d: sp[9], fill: '#2496ED' },        // the whale
			...COL.map(x => ({ d: at(x, ROW[0]), fill: '#2496ED' })),
			...COL.map(x => ({ d: at(x, ROW[1]), fill: '#2496ED' })),
			{ d: at(COL[2], ROW[2]), fill: '#2496ED' }
		];
	}
};

// --- python ----------------------------------------------------------------------
// The official two-snake mark: subpath 0+1 is the upper-left snake and its eye,
// 2+3 the lower-right one. The gradients of the python.org artwork flatten to
// the two published flat stops. Nothing is simplified.
S.python = {
	title: 'Python',
	brand: '#3776AB',
	env: { w: 12.8, h: 12.8 },
	source: {
		name: 'simple-icons', slug: 'python', license: 'CC0-1.0',
		url: 'https://www.python.org/community/logos/',
		note: 'two-snake mark; official gradients flattened to #3776AB / #FFD43B'
	},
	simplifications: ['official gradients flattened to their dominant flat stops (L2)'],
	parts() {
		const sp = subpaths(icon('python').path);
		return [
			{ d: sp[0], fill: '#3776AB' }, { d: sp[1], fill: '#3776AB' },
			{ d: sp[2], fill: '#FFD43B' }, { d: sp[3], fill: '#FFD43B' }
		];
	}
};

// --- react -------------------------------------------------------------------------
// The official logo is parametric: r 2.05 nucleus, three rx 11 / ry 4.2 ellipses
// at 0/60/120 degrees, stroke 1. That stroke is 0.55 px at 16, so the ONLY
// change is the stroke weight (1 -> 2.73 source units = 1.5 px); every radius,
// angle and ratio is the official file's.
S.react = {
	title: 'React',
	brand: '#61DAFB',
	env: { w: 13.6, h: 13.6 },
	source: {
		name: 'React logo (create-react-app fixture, the canonical file)', slug: 'react',
		license: 'CC BY 4.0 / MIT (facebook)',
		url: 'https://github.com/facebook/create-react-app/blob/282c03f9525fdf8061ffa1ec50dce89296d916bd/test/fixtures/relative-paths/src/logo.svg',
		note: 'circle r 2.05 + 3 ellipses rx 11 ry 4.2 at 0/60/120, stroke 1'
	},
	simplifications: [
		'orbit stroke widened from the official 1 unit (0.55 px at 16) to 2.73 units '
		+ '(1.50 px) — L5 minimum stem; radii, aspect and the 60-degree spacing are official'
	],
	parts() {
		const rx = 11, ry = 4.2, t = 2.727, out = [];
		for (const deg of [0, 60, 120]) {
			const rot = (d) => round(
				(deg ? xformRotate(d, deg) : d));
			out.push({ d: rot(ellipse(0, 0, rx + t / 2, ry + t / 2, true)), fill: '#61DAFB' });
			out.push({ d: rot(ellipse(0, 0, rx - t / 2, ry - t / 2, false)), fill: '#61DAFB' });
		}
		out.push({ d: ellipse(0, 0, 2.05, 2.05, true), fill: '#61DAFB' });
		return out;
	}
};

// --- eslint ------------------------------------------------------------------------
// eslint.org's own icon.svg: a #4B32C3 hexagonal ring plus the #8080F2 inner
// hexagon. Both are used verbatim.
S.eslint = {
	title: 'ESLint',
	brand: '#4B32C3',
	env: { w: 12.8, h: 12.8 },
	source: {
		name: 'ESLint (brand\'s own SVG)', slug: 'eslint', license: 'MIT (eslint.org)',
		url: 'https://raw.githubusercontent.com/eslint/eslint.org/main/src/static/icon.svg',
		note: 'two official layers: #4B32C3 outer ring, #8080F2 inner hexagon'
	},
	simplifications: [],
	parts() {
		const p = officialPaths('eslint-official.svg');
		const inner = p.find(x => x.fill && x.fill.toUpperCase() === '#8080F2');
		const outer = p.find(x => x.fill && x.fill.toUpperCase() === '#4B32C3');
		const os = subpaths(outer.d);
		return [
			...os.map(d => ({ d, fill: '#4B32C3' })),
			{ d: inner.d, fill: '#8080F2' }
		];
	}
};

// --- prettier ----------------------------------------------------------------------
// The 16 px stress case, and it loses: the official icon is 11 rows of 10-unit
// bars in a 210 canvas — 0.76 px a bar, 0.76 px a gap. Rows are reduced 11 -> 4
// and bar height raised 10 -> 26 so the bars clear L5; each surviving row keeps
// its official segment count, order and colours, with the segment gaps widened
// from 10 to 22 units and the segments rescaled to keep the row's right edge.
S.prettier = {
	title: 'Prettier',
	brand: '#F7B93E',
	env: { w: 11.6, h: 13.2 },
	source: {
		name: 'prettier-logo (official repo)', slug: 'prettier', license: 'MIT (prettier)',
		url: 'https://github.com/prettier/prettier-logo/blob/master/images/prettier-icon-clean-centred.svg',
		note: '23 rounded bars on an 11-row grid; palette #56B3B4 #EA5E5E #F7BA3E #BF85BF'
	},
	simplifications: [
		'rows reduced from 11 to 4 (official rows 0 / 60 / 120 / 160 kept, re-pitched to 62)',
		'bar height raised from 10 to 26 source units so a bar is 1.62 px at 16 (L5)',
		'segment gaps widened from 10 to 22 units, segments rescaled to hold each row\'s '
		+ 'official right edge; shortest bar is 1.54 px'
	],
	parts() {
		const ROWS = [
			[[15, 130, '#56B3B4']],
			[[15, 30, '#F7BA3E'], [55, 20, '#56B3B4'], [135, 60, '#EA5E5E']],
			[[15, 50, '#56B3B4'], [75, 50, '#EA5E5E'], [135, 40, '#BF85BF']],
			[[15, 60, '#BF85BF']]
		];
		const H = 26, GAP = 22, PITCH = 62;
		const out = [];
		ROWS.forEach((row, i) => {
			const right = row[row.length - 1][0] + row[row.length - 1][1];
			const total = right - 15, sum = row.reduce((a, r) => a + r[1], 0);
			const k = (total - (row.length - 1) * GAP) / sum;
			let x = 15;
			for (const [, w, fill] of row) {
				out.push({ d: roundRect(x, i * PITCH, w * k, H, H / 2, true), fill });
				x += w * k + GAP;
			}
		});
		return out;
	}
};

// --- rust ---------------------------------------------------------------------------
// The cog with the R. The five 1.5-unit bolt circles are 0.8 px at 16 and read
// as dirt, so L5 drops them; the cog, its ring and the R are official.
S.rust = {
	title: 'Rust',
	brand: '#CE422B',   // brand-colors.json (the official artwork itself is black)
	env: { w: 13.2, h: 13.2 },
	source: {
		name: 'simple-icons', slug: 'rust', license: 'CC0-1.0',
		url: 'https://www.rust-lang.org/policies/media-guide',
		note: 'gear + inner ring + R, single path, 10 subpaths'
	},
	simplifications: [
		'the five 1.5-unit bolt circles (subpaths 1/3/4/8/9) dropped — 0.83 px at 16'
	],
	parts() {
		const sp = subpaths(icon('rust').path);
		const ink = this.brand;
		return [0, 2, 5, 6, 7].map(i => ({ d: sp[i], fill: ink }));
	}
};

// --- folder-src ------------------------------------------------------------------------
S['folder-src'] = {
	title: 'src/ (neutral glyph)',
	brand: NEUTRAL,
	chipHue: '#5B6672',
	neutral: true, folder: true,
	env: { w: 13.6, h: 10.4 },
	source: { name: 'none — neutral glyph vocabulary', slug: null, license: null, url: null,
		note: 'no brand owns "src"; chevrons from the set\'s own glyph vocabulary (L2)' },
	simplifications: [],
	parts() {
		return [
			{ d: chevron(2.9, 8.75, 3.2, 3.9, 1.6, 1), fill: NEUTRAL },
			{ d: chevron(13.1, 8.75, 3.2, 3.9, 1.6, -1), fill: NEUTRAL }
		];
	}
};

// --- folder-node -------------------------------------------------------------------------
// The 2024 Node.js mark is a hexagonal OUTLINE holding "JS", and the J is fused
// into the outline as one contour. At the 8 px a folder face allows, that ring
// is 0.7 px and the letters vanish, so L7 takes the mark's outer silhouette —
// the official hexagon at its published 21.28:24.08 aspect — as a solid.
S['folder-node'] = {
	title: 'node_modules/ (Node.js)',
	brand: '#5FA04E',
	folder: true,
	env: ENV.tall,
	source: {
		name: 'simple-icons', slug: 'nodedotjs', license: 'CC0-1.0',
		url: 'https://nodejs.org/en/about/branding',
		note: 'hexagon outline with JS; outer silhouette taken solid'
	},
	simplifications: [
		'hexagon taken as a solid at the official 21.28 x 24.08 aspect: the official '
		+ 'ring is 0.70 px and the JS letterforms unreadable at the folder face\'s 8 px (L5/L7)'
	],
	parts() {
		return [{ d: hexagon(0, 0, 21.28, 24.08, 1.9), fill: '#5FA04E' }];
	}
};

// -----------------------------------------------------------------------------
// NEW WITH THE PILOT — the worst v1 offenders, re-sourced from official artwork.
// -----------------------------------------------------------------------------

// --- npm ---------------------------------------------------------------------------
// v1 drew a freehand lowercase "npm" wordmark. npm publishes TWO lockups: the
// 780x250 wordmark (npm-logo-red.svg) and the SQUARE mark (npm square/n.svg),
// authored at 16x16 for exactly this job. The wordmark's stems are 0.97 px at
// the widest fit the grid allows, the square's are 1.6 px — so the square is the
// lockup, no reduction needed, and the letterform is the brand's own "n".
S.npm = {
	title: 'npm',
	brand: '#CB3837',
	env: ENV.compact,
	plate: true,
	source: {
		name: 'npm (brand\'s own SVG)', slug: 'npm', license: 'npm/logos, brand assets',
		url: 'https://github.com/npm/logos/blob/master/npm%20square/n.svg',
		note: 'the official square mark, authored at 16x16: solid field + white "n". '
			+ 'The file itself ships #C12127; brand-colors.json (L2\'s colour source of '
			+ 'truth) records npm red as #CB3837 and that is what ships'
	},
	simplifications: [
		'lockup choice, not a reduction: npm\'s wide wordmark (780x250) lands on 0.97 px '
		+ 'stems at the grid\'s widest fit, so the brand\'s own SQUARE mark is used — its '
		+ 'stems are 1.60 px and its geometry is untouched'
	],
	parts() {
		const p = officialLayers('npm-official-n.svg');
		const field = subpaths(p[0].d)[0];        // the square, without its knocked-out counter
		return [
			{ d: field, fill: '#CB3837' },
			{ d: p[1].d, fill: WHITE }              // the official "n"
		];
	}
};

// --- dotenv -------------------------------------------------------------------------
// v1 shipped bare yellow "ENV" letters. The official mark (dotenv's own
// dotenv.svg, and simple-icons' vector of it) is a #ECD53F square with a black
// ".ENV" set across its lower quarter. Measured: the letter bars are 7.75/200 of
// the square, i.e. 0.50 px at the compact envelope, and 0.77 px even with the
// square thrown away and the bare wordmark stretched across the whole 16-grid.
// This is the prettier rider's case: element count comes down and what survives
// is thickened until it clears the official-forced 1.2 px floor.
S.dotenv = {
	title: 'dotenv (.env)',
	brand: '#ECD53F',
	env: ENV.compact,
	plate: true,
	source: {
		name: 'dotenv (brand\'s own SVG)', slug: 'dotenv', license: 'BSD-2-Clause (motdotla/dotenv)',
		url: 'https://github.com/motdotla/dotenv/blob/master/dotenv.svg',
		note: '200x200 #ECD53F square with black ".ENV" at y 132..178'
	},
	simplifications: [
		'PRETTIER RIDER. The official ".ENV" is 0.50 px in the bar at the compact '
		+ 'envelope and 0.77 px with the square dropped and the wordmark filling the '
		+ 'grid — unreadable at any allowed fit',
		'letters N and V dropped; the surviving ".E" is the official dot and the official '
		+ 'E letterform, scaled 2.5x as ONE group so the E\'s bar lands on 1.24 px, and '
		+ 're-centred on the square (the official lockup is a poster lockup, parked in the '
		+ 'lower quarter)',
		'official colours kept verbatim: #ECD53F field, #000000 ink. The black is NOT '
		+ 'lifted — it prints on the mark\'s own field and never meets the backdrop'
	],
	parts() {
		const p = officialLayers('dotenv-official.svg');
		const square = p[0].d, dot = p[1].d;
		const [E] = subpaths(p[2].d);              // E, N, V — only E survives
		const k = 2.5;
		const g = unionBBox([dot, E]);
		const dx = 100 - (g.cx * k), dy = 100 - (g.cy * k);
		return [
			{ d: square, fill: '#ECD53F' },
			{ d: xform(dot, { sx: k, dx, dy }), fill: '#000000' },
			{ d: xform(E, { sx: k, dx, dy }), fill: '#000000' }
		];
	}
};

// --- yaml ---------------------------------------------------------------------------
// v1 shipped a red rounded box with four TYPESET letters. YAML does own a mark —
// yaml.org's stacked YA/ML lockup — and simple-icons carries a faithful vector of
// it, so the concept is NOT mark-less and the neutral vocabulary does not apply.
// The lockup is used verbatim: the same four letters, but the brand's own
// letterforms, the brand's own red, and no invented container.
S.yaml = {
	title: 'YAML',
	brand: '#CB171E',
	env: ENV.open,
	source: {
		name: 'simple-icons', slug: 'yaml', license: 'CC0-1.0',
		url: 'https://yaml.org',
		note: 'the yaml.org stacked wordmark, YA over ML, single path, 5 subpaths '
			+ '(Y, A, A-counter, L, M)'
	},
	simplifications: [
		'envelope widened from compact 12.8 to 13.6 (the react envelope): the lockup\'s '
		+ 'thinnest bar is 2.199/24 of the mark and lands on 1.17 px at 12.8, 1.25 px at 13.6 '
		+ '— L5\'s official-forced 1.2 px floor'
	],
	parts() {
		return [{ d: icon('yaml').path, fill: '#CB171E' }];
	}
};

// --- git ----------------------------------------------------------------------------
// v1 drew a freehand branch glyph in a drifted #E0603C. git-scm.com publishes the
// mark itself: a 58-unit rounded square rotated -45 with the branch knocked out of
// it, so the branch reads as backdrop-through-diamond exactly as the brand draws it.
S.git = {
	title: 'Git',
	brand: '#F05032',
	env: ENV.open,
	source: {
		name: 'Git (brand\'s own SVG)', slug: 'git', license: 'CC BY 3.0 (Jason Long)',
		url: 'https://git-scm.com/images/logos/downloads/Git-Icon-1788C.svg',
		note: 'Git-Icon-1788C.svg — one path, rotate(-45) baked in; the branch is a '
			+ 'counter, not a second colour. The file ships #f03c2e; brand-colors.json '
			+ 'records Pantone 1788C as #F05032 and that is what ships'
	},
	simplifications: [
		'envelope widened from compact 12.8 to 13.6: the official branch connector is '
		+ '7/78.86 of the mark and lands on 1.14 px at 12.8, 1.21 px at 13.6 — L5\'s '
		+ 'official-forced 1.2 px floor. Nothing in the geometry is changed'
	],
	parts() {
		const p = officialLayers('git-official.svg');
		return [{ d: p[0].d, fill: '#F05032' }];
	}
};

// --- go -----------------------------------------------------------------------------
// v1 shipped a white "GO" in a wrong-hue #2E88A0 box. The official logo is the Go
// wordmark with three motion lines to its left; those lines are 3.7/78 of the
// height and land on 0.37 px, so L5 drops them and the wordmark itself — the
// brand's own letterforms — is what ships.
S.go = {
	title: 'Go',
	brand: '#00ADD8',
	env: ENV.flat,
	source: {
		name: 'Go (brand\'s own SVG)', slug: 'go', license: 'CC BY 4.0 (Go Authors)',
		url: 'https://go.dev/images/go-logo-blue.svg',
		note: 'three motion lines + G + o; the file ships #00acd7, brand-colors.json '
			+ 'records #00ADD8 and that is what ships'
	},
	simplifications: [
		'the three motion lines (official paths 0/1/2) dropped — 3.7/78.4 of the mark, '
		+ '0.37 px at any allowed fit',
		'the "o" keeps its official counter: ring wall 2.09 px, counter 3.97 px at 16'
	],
	parts() {
		const p = officialLayers('go-official.svg');
		// paths 0..2 are the motion lines; 3 is the G and 4 the o (outer + counter)
		return [
			{ d: p[3].d, fill: '#00ADD8' },
			{ d: p[4].d, fill: '#00ADD8' }
		];
	}
};

// --- vue ------------------------------------------------------------------------------
// v1 shipped a single-colour #4CB392 flat triangle. The official mark is TWO
// layers and vuejs/art publishes them as two paths — the green V and the dark V
// nested in it — so R1's multi-colour rule applies with no derivation games.
S.vue = {
	title: 'Vue.js',
	brand: '#41B883',
	env: ENV.compact,
	source: {
		name: 'Vue.js (brand\'s own SVG)', slug: 'vuedotjs', license: 'MIT (vuejs/art)',
		url: 'https://github.com/vuejs/art/blob/master/logo.svg',
		note: 'two official layers: the outer V and the nested inner V. The file ships '
			+ '#42b883 / #35495e; the pilot uses #41B883 / #35495E (1/255 apart in red)'
	},
	simplifications: [],
	parts() {
		const p = officialLayers('vue-official.svg');
		return [
			{ d: p[0].d, fill: '#41B883' },
			{ d: p[1].d, fill: '#35495E' }
		];
	}
};

// --- folder-test ------------------------------------------------------------------------
// Mark-less: no brand owns "test". v1 used a checkmark and the association is
// worth keeping, so the neutral vocabulary's check is the glyph — ONE sub-shape,
// constant 2.2 px stem, nothing to fuse at the folder face's 8 px. (The obvious
// alternative, a beaker, needs a neck and a body: the neck is 1.1 px on that face.)
S['folder-test'] = {
	title: 'test/ (neutral glyph)',
	brand: NEUTRAL,
	chipHue: '#5B6672',
	neutral: true, folder: true,
	env: { w: 13.2, h: 10.0 },
	source: { name: 'none — neutral glyph vocabulary', slug: null, license: null, url: null,
		note: 'no brand owns "test"; the check comes from the set\'s own glyph vocabulary (L2)' },
	simplifications: [],
	parts() {
		return [{ d: check(8, 8, 13.2, 10.0, 2.9), fill: NEUTRAL }];
	}
};

// --- folder-docker ---------------------------------------------------------------------
// L7: the folder glyph is the file icon's mark simplified, so the pair rhymes.
// The docker master's container grid holds 1.27 px gaps at the file envelope but
// only 0.85 px once the mark is squeezed onto the 10.2 px face, so the containers
// go and the official whale body carries the face on its own — one sub-shape,
// inside L7's two-shape budget.
S['folder-docker'] = {
	title: 'docker/ (Docker)',
	brand: '#2496ED',
	folder: true,
	env: { w: 15.2, h: 10.4 },
	source: S.docker.source,
	simplifications: [
		'the container boxes dropped for the folder face: their gaps are 1.21 px on the '
		+ 'file icon but 0.85 px at the face\'s 10.2 px, under L5\'s floor. The whale body '
		+ 'is official subpath #9, untouched (L7 two-shape budget). APPROVED at the pilot '
		+ 'gate 2026-09-03 (flag 10) — the face master and both icons are unchanged by the '
		+ 'fix round, byte for byte'
	],
	parts() {
		const sp = subpaths(icon('docker').path);
		return [{ d: sp[9], fill: '#2496ED' }];
	}
};

function xformRotate(d, deg) { return svgpath(d).rotate(deg).toString(); }

// -----------------------------------------------------------------------------

/** The ten carried file marks, in sheet order, then the six new ones. */
export const FILES = ['typescript', 'python', 'docker', 'markdown', 'editorconfig', 'json',
	'react', 'eslint', 'prettier', 'rust',
	'npm', 'dotenv', 'yaml', 'git', 'go', 'vue'];
export const FOLDERS = ['folder-src', 'folder-node', 'folder-test', 'folder-docker'];
export const SUBJECTS = [...FILES, ...FOLDERS];

/** Carried in from round 2 — D22 froze these twelve subjects at the style ruling. */
export const CARRIED = ['typescript', 'editorconfig', 'json', 'markdown', 'docker',
	'python', 'react', 'eslint', 'prettier', 'rust', 'folder-src', 'folder-node'];

/**
 * AMENDED AT THE PILOT GATE (2026-09-03). Two of the twelve carried subjects were
 * REJECTED there — "that is definitely NOT the docker or editorconfig logo" — and
 * rebuilt in the fix round. Their round-2 masters are therefore superseded on
 * purpose: the carry gate asserts the OTHER ten still refit to samples/masters/
 * byte for byte, and asserts that exactly these two do not.
 */
export const SUPERSEDED = ['docker', 'editorconfig'];
export const SUPERSEDED_RULING = '2026-09-03';

/** New with the pilot — these are what the fidelity proof has to answer for. */
export const NEW = SUBJECTS.filter(id => !CARRIED.includes(id));

/**
 * Build one subject at an envelope. Returns the colour layers (what R1 paints),
 * the identical geometry as one flat path (what a folder face knocks out white),
 * and the provenance.
 */
export const master = makeMaster(S);

export const spec = (id) => S[id];

/** The pilot registry, in the shape every slice registry also answers in. */
export const REGISTRY = {
	id: 'pilot', kind: 'pilot', specs: S,
	FILES, FOLDERS, SUBJECTS, master, spec
};

void bbox; void unionBBox;
