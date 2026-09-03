#!/usr/bin/env node
// gen.mjs — emits the 32 style samples for the D22 ruling (8 subjects x 4 styles).
//
//   node tools/gen.mjs
//
// One recipe per style, applied by construction: the per-style sections below are
// the only place a style's constants live, so an icon can only differ from its
// row-mates in the MARK, never in the framework (guide L1).

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { letterPath } from '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/tools/letterpath.mjs';
import {
	n, roundPoly, hexagon, chevron, brace, braceLine, markdownM, markdownMLine,
	markdownArrow, markdownArrowLine, ring, whale, snake, snakeLine, mouse,
	FOLDER, FOLDER_LINE, circle, path, svg
} from './geom.mjs';

const OUT = '/Users/sebastian.suarez/Projects/VSebCode/m20-icons-v2/samples';
const DIRS = { a: 'a-chips', b: 'b-brand', c: 'c-wire', d: 'd-duotone' };

// ---- colour ------------------------------------------------------------------

const hex2 = (v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0');
function hsl(h, s, l) {
	h = ((h % 360) + 360) % 360; s /= 100; l /= 100;
	const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2;
	const t = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x]
		: h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
	return '#' + t.map(v => hex2((v + m) * 255)).join('').toUpperCase();
}
function toHsl(hexStr) {
	const [r, g, b] = [1, 3, 5].map(i => parseInt(hexStr.slice(i, i + 2), 16) / 255);
	const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, l = (mx + mn) / 2;
	let h = 0;
	if (d) {
		h = mx === r ? ((g - b) / d + (g < b ? 6 : 0)) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
		h *= 60;
	}
	const s = d ? d / (1 - Math.abs(2 * l - 1)) : 0;
	return [h, s * 100, l * 100];
}
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
/** Style A's band: brand hue kept, saturation/lightness pulled into one family. */
const chipBand = (brand) => {
	const [h, s, l] = toHsl(brand);
	return hsl(h, clamp(s, 45, 70), clamp(l, 45, 60));
};
/** Style D's 12-hue matrix. */
const snap = (h) => Math.round(h / 30) * 30;
const matrix = (brand) => {
	const H = snap(toHsl(brand)[0]);
	return { base: hsl(H, 58, 52), shade: hsl(H, 58, 34), hue: H };
};

// Verified brand marks and hexes (L2). editorconfig and markdown publish a mark
// but no colour: monochrome in the free-form styles, set-assigned hue in the
// container styles (see the report — this is an open ruling).
const BRAND = {
	typescript: '#3178C6',   // typescriptlang.org lozenge
	docker: '#2496ED',       // docker.com Moby whale
	python: '#3776AB',       // python.org two snakes
	pythonAlt: '#FFD43B',
	node: '#5FA04E',         // nodejs.org hexagon
	sand: '#BF9354'          // the set's generic-folder sand (v1, kept)
};
const ASSIGNED = { markdown: hsl(258, 52, 56), editorconfig: hsl(338, 54, 55) };

const WHITE = '#FFFFFF';

// ---- letters (L3) ------------------------------------------------------------

function letters(text, { cap, baseline, cx = 8, trackPx = 0, alignRight = null }) {
	const probe = letterPath({ text, cap, baseline, cx });
	const em = trackPx / probe.fontSize;
	let r = letterPath({ text, cap, baseline, cx, letterSpacing: em });
	if (alignRight !== null) {
		r = letterPath({ text, cap, baseline, cx: cx + (alignRight - r.ink.x2), letterSpacing: em });
	}
	return r;
}

// ---- style A — chips ---------------------------------------------------------
// chip: 14x14 rx3 at (1,1); mark white, centred, ink 8-10 px; letters per L3.

const A = {};
{
	const chip = (c) => `<rect x="1" y="1" width="14" height="14" rx="3" fill="${c}"/>`;
	const SLATE = hsl(212, 12, 44);
	const CH = {
		typescript: BRAND.typescript,
		docker: chipBand(BRAND.docker),
		python: chipBand(BRAND.python),
		node: chipBand(BRAND.node),
		markdown: ASSIGNED.markdown,
		editorconfig: ASSIGNED.editorconfig,
		json: SLATE,
		src: SLATE
	};

	const ts = letters('TS', { cap: 6.2, baseline: 11.1, trackPx: 0.4 });
	A.typescript = chip(CH.typescript) + path(ts.d, WHITE);

	const m = mouse(0.86);
	A.editorconfig = chip(CH.editorconfig) + path(m.head, WHITE)
		+ m.eyes.map(e => circle(e, CH.editorconfig)).join('');

	const bp = { y0: 3.1, y1: 12.9, hookX: 6.6, t: 1.6, nib: 1.4 };
	A.json = chip(CH.json) + path(brace(-1, bp), WHITE) + path(brace(1, bp), WHITE);

	A.markdown = chip(CH.markdown)
		+ path(markdownM(2.8, 5.5, 4.9, 4.7, 1.5), WHITE)
		+ path(markdownArrow(11.0, 5.5, 11.0, 1.6, 2.2, 2.4), WHITE);

	const w = whale({ bx0: 2.1, bx1: 11.9, byTop: 8.7, byBot: 12.9, cw: 2, ch: 2.4, gap: 1.5, tail: 2.4 });
	A.docker = chip(CH.docker) + path(w.boxes + w.body, WHITE);

	const sp = { barX0: 3.4, barX1: 11.6, barY0: 2.6, barH: 2.9, colW: 2.9, colY1: 8.5 };
	A.python = chip(CH.python) + path(snake(sp), WHITE) + path(snake(sp, true), WHITE);

	A['folder-src'] = path(FOLDER, CH.src)
		+ path(chevron(2.9, 8.75, 3.2, 3.9, 1.6, 1), WHITE)
		+ path(chevron(13.1, 8.75, 3.2, 3.9, 1.6, -1), WHITE);

	A['folder-node'] = path(FOLDER, CH.node) + path(hexagon(8, 8.75, 7.4, 8.1, 0.35), WHITE);
}

// ---- style B — brand true ----------------------------------------------------
// the mark itself, normalised onto one mass system; official hexes verbatim;
// monochrome marks lifted to one light ink; mark-less concepts one gray.

const B = {};
{
	const LIFT = '#E4E8EB';    // the documented visibility lift for black-and-white marks
	const GRAY = '#A6AEB6';    // the one neutral ink (mark-less concepts)
	const LINE = '#1B1E22';    // the mascot's own black line ink

	const ts = letters('TS', { cap: 5.6, baseline: 12.8, trackPx: 0.3, alignRight: 13.6 });
	B.typescript = path(roundPoly([[1, 1], [15, 1], [15, 15], [1, 15]], 2.4), BRAND.typescript)
		+ path(ts.d, WHITE);

	const m = mouse(0.95);
	B.editorconfig = path(m.head, LIFT) + m.eyes.map(e => circle(e, LINE)).join('');

	const bp = { y0: 2.4, y1: 13.6, hookX: 6.8, t: 1.7, nib: 1.6 };
	B.json = path(brace(-1, bp), GRAY) + path(brace(1, bp), GRAY);

	B.markdown = path(ring(0.7, 3.3, 14.6, 9.4, 2.0, 1.5), LIFT, ' fill-rule="evenodd"')
		+ path(markdownM(2.9, 5.7, 5.0, 4.6, 1.5), LIFT)
		+ path(markdownArrow(11.3, 5.7, 10.6, 1.6, 2.1, 2.3), LIFT);

	const w = whale({ bx0: 1.2, bx1: 12.2, byTop: 8.4, byBot: 13.4, cw: 2.3, ch: 2.6, gap: 1.5, tail: 2.4 });
	B.docker = path(w.boxes + w.body, BRAND.docker);

	const sp = { barX0: 3.2, barX1: 12.4, barY0: 1.5, barH: 3.5, colW: 3.5, colY1: 9.0 };
	B.python = path(snake(sp), BRAND.python) + path(snake(sp, true), BRAND.pythonAlt)
		+ circle({ cx: 5.0, cy: 3.25, r: 0.85 }, WHITE)
		+ circle({ cx: 11.0, cy: 12.75, r: 0.85 }, WHITE);

	B['folder-src'] = path(FOLDER, BRAND.sand)
		+ path(chevron(2.9, 8.75, 3.2, 3.9, 1.6, 1), WHITE)
		+ path(chevron(13.1, 8.75, 3.2, 3.9, 1.6, -1), WHITE);

	B['folder-node'] = path(FOLDER, BRAND.node) + path(hexagon(8, 8.75, 7.4, 8.1, 0.35), WHITE);
}

// ---- style C — wire ----------------------------------------------------------
// one ink, one stroke weight (1.5), round caps/joins; at most one accent element
// per icon, in the concept's hue.

const C = {};
{
	const INK = '#A9B0B8';
	const acc = (brand) => { const [h, s, l] = toHsl(brand); return hsl(h, clamp(s, 50, 65), clamp(l, 55, 65)); };
	const g = (d, stroke = INK) => `<g fill="none" stroke="${stroke}" stroke-width="1.5" `
		+ `stroke-linecap="round" stroke-linejoin="round">${d}</g>`;
	const p = (d) => `<path d="${d}"/>`;

	C.typescript = g(p(roundPoly([[2.3, 2.3], [13.7, 2.3], [13.7, 13.7], [2.3, 13.7]], 2.2)))
		+ circle({ cx: 10.7, cy: 10.7, r: 1.1 }, acc(BRAND.typescript));

	const m = mouse(0.8);
	C.editorconfig = g(p(m.head)) + circle({ ...m.eyes[1], r: 0.85 }, INK);

	const bp = { y0: 3.0, y1: 13.0, hookX: 6.4, t: 1.6, nib: 1.4 };
	C.json = g(p(braceLine(-1, bp)) + p(braceLine(1, bp)));

	C.markdown = g(p(roundPoly([[1.5, 4.2], [14.5, 4.2], [14.5, 11.8], [1.5, 11.8]], 1.8))
		+ p(markdownMLine(3.0, 6.2, 3.9, 3.6))
		+ p(markdownArrowLine(11.1, 6.2, 9.9, 1.4)));

	C.docker = g(p(roundPoly([[2.0, 8.9], [10.2, 8.9], [13.5, 6.2], [11.3, 9.9], [9.2, 12.3],
		[3.3, 12.3]], [0.5, 0.3, 0.5, 0.4, 1.3, 1.8]))
		+ p('M3.9 8.9V6.8M6.5 8.9V6.8M9.1 8.9V6.8'))
		+ circle({ cx: 4.6, cy: 10.6, r: 1.0 }, acc(BRAND.docker));

	const sp = { barX0: 4.2, barX1: 11.6, barY0: 4.0, colY1: 9.0 };
	C.python = g(p(snakeLine(sp))) + g(p(snakeLine(sp, true)), acc(BRAND.pythonAlt));

	C['folder-src'] = g(p(FOLDER_LINE)
		+ p('M5.9 7 4 9.2 5.9 11.4') + p('M10.1 7 12 9.2 10.1 11.4'));

	C['folder-node'] = g(p(FOLDER_LINE) + p(hexagon(8, 8.9, 4.6, 5.3, 0.4)), acc(BRAND.node));
}

// ---- style D — duotone -------------------------------------------------------
// two tones per icon from the 12-hue matrix: base L52 carries the mark, shade L34
// carries its structure. White is the one counter-ink (D's own folder rule).

const D = {};
{
	const NEUTRAL = { base: hsl(212, 10, 52), shade: hsl(212, 10, 34) };
	const M = {
		typescript: matrix(BRAND.typescript),
		docker: matrix(BRAND.docker),
		python: matrix(BRAND.python),
		node: matrix(BRAND.node),
		markdown: matrix(ASSIGNED.markdown),
		editorconfig: matrix(ASSIGNED.editorconfig),
		json: NEUTRAL,
		src: NEUTRAL
	};

	const ts = letters('TS', { cap: 6.2, baseline: 11.1, trackPx: 0.4 });
	D.typescript = path(roundPoly([[1, 1], [15, 1], [15, 15], [1, 15]], 3), M.typescript.base)
		+ path('M1 12L15 12Q15 15 12 15L4 15Q1 15 1 12Z', M.typescript.shade)
		+ path(ts.d, WHITE);

	const m = mouse(0.95);
	D.editorconfig = path(m.head, M.editorconfig.base)
		+ m.eyes.map(e => circle(e, M.editorconfig.shade)).join('');

	const bp = { y0: 2.4, y1: 13.6, hookX: 6.8, t: 1.7, nib: 1.6 };
	D.json = path(brace(-1, bp), M.json.base) + path(brace(1, bp), M.json.base);

	D.markdown = path(ring(0.7, 3.3, 14.6, 9.4, 2.0, 1.5), M.markdown.shade, ' fill-rule="evenodd"')
		+ path(markdownM(2.9, 5.7, 5.0, 4.6, 1.5), M.markdown.base)
		+ path(markdownArrow(11.3, 5.7, 10.6, 1.6, 2.1, 2.3), M.markdown.base);

	const w = whale({ bx0: 1.2, bx1: 12.2, byTop: 8.4, byBot: 13.4, cw: 2.3, ch: 2.6, gap: 1.5, tail: 2.4 });
	D.docker = path(w.body, M.docker.base) + path(w.boxes, M.docker.shade);

	const sp = { barX0: 3.2, barX1: 12.4, barY0: 1.5, barH: 3.5, colW: 3.5, colY1: 9.0 };
	D.python = path(snake(sp), M.python.base) + path(snake(sp, true), M.python.shade);

	const band = 'M1.5 5.5h13v1.1h-13z';
	D['folder-src'] = path(FOLDER, M.src.base) + path(band, M.src.shade)
		+ path(chevron(2.9, 8.75, 3.2, 3.9, 1.6, 1), WHITE)
		+ path(chevron(13.1, 8.75, 3.2, 3.9, 1.6, -1), WHITE);

	D['folder-node'] = path(FOLDER, M.node.base) + path(band, M.node.shade)
		+ path(hexagon(8, 8.75, 7.4, 8.1, 0.35), WHITE);
}

// ---- write -------------------------------------------------------------------

const SUBJECTS = ['typescript', 'editorconfig', 'json', 'markdown', 'docker', 'python',
	'folder-src', 'folder-node'];
const SETS = { a: A, b: B, c: C, d: D };

let worst = 0;
for (const [key, dir] of Object.entries(DIRS)) {
	mkdirSync(join(OUT, dir), { recursive: true });
	for (const id of SUBJECTS) {
		const body = SETS[key][id];
		if (!body) { throw new Error(`missing ${key}/${id}`); }
		const src = svg(body);
		writeFileSync(join(OUT, dir, `${id}.svg`), src);
		const bytes = Buffer.byteLength(src);
		worst = Math.max(worst, bytes);
		console.log(`${dir}/${id}.svg`.padEnd(34) + String(bytes).padStart(5) + ' B');
	}
}
console.log(`\nlargest ${worst} B (cap 2048)`);
