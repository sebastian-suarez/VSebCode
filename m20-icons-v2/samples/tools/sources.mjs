// sources.mjs — the 12 round-2 masters, each ADAPTED from real vector artwork.
//
// Guide L2, hardened: geometry derives from the official files. Every subject
// below therefore reads its path data out of a real source (simple-icons' CC0
// vectors, or a brand's own SVG fetched into ../sources-svg/) and does exactly
// three things to it: pick which subpaths carry which official colour, drop or
// re-space what L5 cannot hold at 16 px, and fit the result into the optical
// envelope. Nothing is drawn by hand except the two concepts that own no mark
// (json, folder-src), which come from the shared neutral glyph vocabulary.
//
// A subject is expressed as an ordered list of `parts` in SOURCE coordinates.
// One affine fits them all, so the colour layers and the single-fill mono path
// are the SAME geometry — that identity is what makes R1–R4 comparable.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as si from 'simple-icons';
import svgpath from 'svgpath';
import { subpaths, unionBBox, fit, round, ellipse, roundRect, xform } from './pathkit.mjs';
import { brace, chevron, hexagon } from './geom.mjs';
import { NEUTRAL, WHITE, lift } from './color.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const SRCDIR = join(HERE, '..', 'sources-svg');

const officialPaths = (file) => {
	const raw = readFileSync(join(SRCDIR, file), 'utf8');
	return [...raw.matchAll(/<path[^>]*\sd="([^"]+)"[^>]*>/g)].map(m => ({
		d: m[1],
		fill: (m[0].match(/fill="(#[0-9a-fA-F]{3,8})"/) || [])[1] || null
	}));
};
const icon = (slug) => si['si' + slug[0].toUpperCase() + slug.slice(1)];

// ---- the optical envelope system (guide §3 style B, one shared mass) ---------
// wide 13.8x10.2 = 141 px², compact 12.8x12.8 = 164 px², tall 11.2x13.2 = 148 px².
// A subject may widen its envelope only where L5 forces it (docker, markdown):
// both are very flat marks whose mass stays inside the same band.
export const ENV = {
	wide: { w: 13.8, h: 10.2 },
	compact: { w: 12.8, h: 12.8 },
	tall: { w: 11.2, h: 13.2 },
	flat: { w: 15.2, h: 9.6 },
	face: { w: 10.2, h: 8.2, cx: 8, cy: 8.35 }   // the folder face (L7)
};

/** One affine for every part of a subject. */
function place(parts, env) {
	const out = fit(parts.map(p => p.d), {
		w: env.w, h: env.h, cx: env.cx ?? 8, cy: env.cy ?? 8
	});
	return parts.map((p, i) => ({ ...p, d: out[i] }));
}

// =============================================================================
// the subjects
// =============================================================================

const S = {};

// --- typescript ---------------------------------------------------------------
// simple-icons ships the mark as square + S + T with the letters wound against
// the square, so the very same path list gives both the two-colour lockup and
// the knocked-out mono version. Nothing is simplified.
S.typescript = {
	title: 'TypeScript',
	brand: '#3178C6',
	env: ENV.compact,
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
// The official mascot is a LINE drawing: subpath 0 is the closed silhouette and
// everything after it is interior linework carved out of it. At 16 px that
// linework is sub-pixel, so L5 keeps the silhouette, the two spectacle lenses
// and the two ear counters, and drops the nose, mouth, whisker and tail strokes.
// The near ear (#3) carries the official pale pink.
S.editorconfig = {
	title: 'EditorConfig',
	brand: '#FEFEFE',
	chipHue: '#E0648A',        // L6 erratum: the set-assigned rose for container styles
	env: { w: 13.2, h: 12.8 },
	source: {
		name: 'simple-icons', slug: 'editorconfig', license: 'CC0-1.0',
		url: 'https://editorconfig.org',
		note: 'mascot silhouette; official colours sampled from '
			+ 'editorconfig/editorconfig.github.com logo.png (#FEFEFE body, #FFF2F2 ear)'
	},
	simplifications: [
		'kept subpaths 0/1/3/5/7 (silhouette, two ear counters, two spectacle lenses); '
		+ 'dropped 2/4/6/8/9/10/11 — nose, mouth, jaw and tail linework, all under 0.5 px at 16'
	],
	parts() {
		const sp = subpaths(icon('editorconfig').path);
		return [
			{ d: sp[0], fill: '#FEFEFE' },   // silhouette
			{ d: sp[1], fill: '#FEFEFE' },   // far-ear counter (knocked out)
			{ d: sp[5], fill: '#FEFEFE' },   // left lens
			{ d: sp[7], fill: '#FEFEFE' },   // right lens
			{ d: sp[3], fill: '#FFF2F2', mono: 'hole' }  // near ear — the official pink
		];
	}
};

// --- json ----------------------------------------------------------------------
// No brand, no mark: the shared neutral glyph vocabulary (round-1 master reused).
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
// The whale is used verbatim. The official 5+3+1 container grid puts 0.28 px
// gaps between containers at 16, so L5 reduces it to 3+1 — the container box
// itself (size, corner radius) is the official one, translated.
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
		'container grid reduced from the official 5+3+1 (nine boxes, 0.28 px gaps at 16) '
		+ 'to 3+1; the box is official subpath #7 translated, so its size and corner '
		+ 'radius are untouched and the gaps land at 1.27 px'
	],
	parts() {
		const sp = subpaths(icon('docker').path);
		const box = sp[7];                      // official container, bbox x 4.95..7.44 y 8.82..11.08
		const at = (x, y) => xform(box, { dx: x - 4.95, dy: y - 8.82 });
		return [
			{ d: sp[9], fill: '#2496ED' },        // the whale
			{ d: at(3.42, 8.82), fill: '#2496ED' },
			{ d: at(7.92, 8.82), fill: '#2496ED' },
			{ d: at(12.42, 8.82), fill: '#2496ED' },
			{ d: at(7.92, 6.10), fill: '#2496ED' }
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

function xformRotate(d, deg) { return svgpath(d).rotate(deg).toString(); }

export const SUBJECTS = ['typescript', 'editorconfig', 'json', 'markdown', 'docker',
	'python', 'react', 'eslint', 'prettier', 'rust', 'folder-src', 'folder-node'];

/**
 * Build one subject at an envelope. Returns the colour layers (R1's geometry),
 * the identical geometry as one flat path (R2/R3's), and the provenance.
 */
export function master(id, envOverride = null) {
	const s = S[id];
	if (!s) { throw new Error(`unknown subject ${id}`); }
	const parts = place(s.parts(), envOverride || s.env);
	// merge runs of the same fill into one <path> — geometry untouched
	const layers = [];
	for (const p of parts) {
		const last = layers[layers.length - 1];
		if (last && last.fill === p.fill) { last.d += p.d; } else { layers.push({ fill: p.fill, d: p.d }); }
	}
	const mono = parts.map(p => p.d).join('');
	const ink = unionBBox(parts.map(p => p.d));
	return { id, ...s, layers, mono, parts, ink };
}

export const spec = (id) => S[id];
