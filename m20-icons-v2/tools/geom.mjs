// geom.mjs — the shared drawing primitives for the M20 icons-v2 set.
//
// Everything is authored ON the 16-grid (guide L4): the functions take grid
// coordinates and emit 2-decimal path data. No function ever scales a finished
// drawing — a smaller variant is a smaller set of arguments, so stems stay put.

import { ellipse, roundRect } from './pathkit.mjs';

export const n = (v) => {
	let s = (+v).toFixed(2);
	if (s.includes('.')) { s = s.replace(/0+$/, '').replace(/\.$/, ''); }
	return s === '-0' ? '0' : s;
};
export const P = (x, y) => `${n(x)} ${n(y)}`;

/** Rounded polygon: one radius, or one per vertex. */
export function roundPoly(pts, radii) {
	const N = pts.length;
	const r = (i) => (Array.isArray(radii) ? radii[i] : radii);
	const len = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
	const along = (a, b, d) => {
		const L = len(a, b) || 1;
		return [a[0] + (b[0] - a[0]) * d / L, a[1] + (b[1] - a[1]) * d / L];
	};
	let d = '';
	for (let i = 0; i < N; i++) {
		const p0 = pts[(i - 1 + N) % N], p1 = pts[i], p2 = pts[(i + 1) % N];
		const k = Math.min(r(i), len(p1, p0) / 2, len(p1, p2) / 2);
		const a = along(p1, p0, k), b = along(p1, p2, k);
		d += (i === 0 ? `M${P(...a)}` : `L${P(...a)}`);
		if (k > 0.001) { d += `Q${P(...p1)} ${P(...b)}`; }
	}
	return d + 'Z';
}

/** Pointy-top hexagon (the Node.js mark's silhouette). */
export function hexagon(cx, cy, w, h, r = 0.7) {
	const hw = w / 2, hh = h / 2, q = h / 4;
	return roundPoly([
		[cx, cy - hh], [cx + hw, cy - q], [cx + hw, cy + q],
		[cx, cy + hh], [cx - hw, cy + q], [cx - hw, cy - q]
	], r);
}

/**
 * A filled chevron ("<" when dir=-1, ">" when dir=+1) of constant thickness t,
 * tip at (xTip, cy), arms reaching back dx and up/down h.
 */
export function chevron(xTip, cy, dx, h, t, dir = -1) {
	const L = Math.hypot(dx, h);
	const v = t * L / dx;          // vertical inset at the arm ends
	const tx = t * L / h;          // horizontal inset at the tip
	const xa = xTip + dir * dx, xi = xTip + dir * tx;
	return roundPoly([
		[xa, cy - h], [xTip, cy], [xa, cy + h],
		[xa, cy + h - v], [xi, cy], [xa, cy - h + v]
	], [0.35, 0.5, 0.35, 0.35, 0.4, 0.35]);
}

/**
 * A curly brace. `dir` -1 draws "{" (hooks and stem on the left, nib pointing
 * out to the left); +1 mirrors it about x = 8.
 */
export function brace(dir, { y0, y1, hookX, t = 1.7, nib = 1.5, lip = 0.4 }) {
	const k = (y1 - y0) / 12;
	const a = 2.1 * k, b = 1.95 * k, c = 0.85 * k, mid = (y0 + y1) / 2;
	const X = (x) => (dir < 0 ? x : 16 - x);
	const hx = hookX, sR = hookX - lip, sL = sR - t, tip = sL - nib;
	const S = (x, y) => P(X(x), y);
	return `M${S(hx, y0)}`
		+ `C${S((hx + sL) / 2, y0)} ${S(sL, y0 + 0.75 * k)} ${S(sL, y0 + a)}`
		+ `L${S(sL, mid - b)}`
		+ `C${S(sL, mid - b + 0.7 * k)} ${S(sL - 0.55, mid - c)} ${S(tip, mid - c)}`
		+ `L${S(tip, mid + c)}`
		+ `C${S(sL - 0.55, mid + c)} ${S(sL, mid + b - 0.7 * k)} ${S(sL, mid + b)}`
		+ `L${S(sL, y1 - a)}`
		+ `C${S(sL, y1 - 0.75 * k)} ${S((hx + sL) / 2, y1)} ${S(hx, y1)}`
		+ `L${S(hx, y1 - t)}`
		+ `C${S(hx - 0.2, y1 - t)} ${S(sR, y1 - t - 0.15)} ${S(sR, y1 - a)}`
		+ `L${S(sR, mid + b)}`
		+ `C${S(sR, mid + 1.0 * k)} ${S(sR - 0.4, mid + 0.35 * k)} ${S(sL + 0.55, mid)}`
		+ `C${S(sR - 0.4, mid - 0.35 * k)} ${S(sR, mid - 1.0 * k)} ${S(sR, mid - b)}`
		+ `L${S(sR, y0 + a)}`
		+ `C${S(sR, y0 + a - 0.25)} ${S(hx - 0.2, y0 + t)} ${S(hx, y0 + t)}Z`;
}

/** Monoline brace, for the stroke style. */
export function braceLine(dir, { y0, y1, hookX, t = 1.7, nib = 1.5 }) {
	const k = (y1 - y0) / 12;
	const mid = (y0 + y1) / 2, a = 2.0 * k;
	const X = (x) => (dir < 0 ? x : 16 - x);
	const sL = hookX - t, tip = sL - nib;
	const S = (x, y) => P(X(x), y);
	return `M${S(hookX, y0)}C${S(sL, y0)} ${S(sL, y0 + 0.4)} ${S(sL, y0 + a)}`
		+ `L${S(sL, mid - 1.5 * k)}C${S(sL, mid - 0.4)} ${S(tip + 0.4, mid)} ${S(tip, mid)}`
		+ `C${S(tip + 0.4, mid)} ${S(sL, mid + 0.4)} ${S(sL, mid + 1.5 * k)}`
		+ `L${S(sL, y1 - a)}C${S(sL, y1 - 0.4)} ${S(sL, y1)} ${S(hookX, y1)}`;
}

/** The Markdown mark's "M": a filled zig-zag of constant stem t. */
export function markdownM(x0, y0, w, h, t) {
	const xa = x0, xb = x0 + t, xc = x0 + w / 2, xd = x0 + w - t, xe = x0 + w;
	const yT = y0, yB = y0 + h;
	const v1 = y0 + h * 0.378, v2 = y0 + h * 0.444, v3 = y0 + h * 0.822;
	return `M${P(xa, yB)}L${P(xa, yT)} ${P(xb, yT)} ${P(xc, v1)} ${P(xd, yT)} ${P(xe, yT)} `
		+ `${P(xe, yB)} ${P(xd, yB)} ${P(xd, v2)} ${P(xc, v3)} ${P(xb, v2)} ${P(xb, yB)}Z`;
}

/** Monoline "M". */
export function markdownMLine(x0, y0, w, h) {
	const xc = x0 + w / 2;
	return `M${P(x0, y0 + h)}L${P(x0, y0)} ${P(xc, y0 + h * 0.62)} ${P(x0 + w, y0)} ${P(x0 + w, y0 + h)}`;
}

/** The Markdown mark's down arrow: stem + solid head. */
export function markdownArrow(cx, y0, y1, sw, hw, hh) {
	const s = sw / 2, yh = y1 - hh;
	return `M${P(cx - s, y0)}L${P(cx + s, y0)} ${P(cx + s, yh)} ${P(cx + hw, yh)} `
		+ `${P(cx, y1)} ${P(cx - hw, yh)} ${P(cx - s, yh)}Z`;
}

export function markdownArrowLine(cx, y0, y1, hw) {
	return `M${P(cx, y0)}L${P(cx, y1)}M${P(cx - hw, y1 - hw)}L${P(cx, y1)} ${P(cx + hw, y1 - hw)}`;
}

/** Rounded-rectangle ring (a filled outline — the fill styles have no strokes). */
export function ring(x, y, w, h, r, t) {
	const o = roundPoly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], r);
	const i = roundPoly([
		[x + t, y + t], [x + w - t, y + t], [x + w - t, y + h - t], [x + t, y + h - t]
	], Math.max(0.2, r - t)).replace(/^M/, 'M');
	// reverse winding is unnecessary: fill-rule evenodd punches the hole
	return o + i;
}

/**
 * The Docker whale: back with N containers, a wedge body and the tail flipper.
 * Returns { boxes, body } path data.
 */
export function whale({ bx0, bx1, byTop, byBot, cw, ch, gap, count = 3, tail = 2.3, seat = 0 }) {
	const span = count * cw + (count - 1) * gap;
	const cx0 = bx0 + ((bx1 - bx0) - span) / 2 - 0.2;
	const cy0 = byTop - seat - ch;
	let boxes = '';
	for (let i = 0; i < count; i++) {
		const x = cx0 + i * (cw + gap);
		boxes += roundPoly([[x, cy0], [x + cw, cy0], [x + cw, cy0 + ch], [x, cy0 + ch]], 0.3);
	}
	const body = roundPoly([
		[bx0, byTop], [bx1 - tail * 0.2, byTop], [bx1 - tail - 1.1, byBot], [bx0 + 1.2, byBot]
	], [0.5, 0.8, 1.3, 2.4])
		+ roundPoly([
			[bx1 - tail - 0.2, byTop + 0.2], [bx1 + tail * 0.62, byTop - tail * 1.2],
			[bx1 + tail * 0.28, byTop + 1.8]
		], [0.6, 0.5, 0.8]);
	return { boxes, body };
}

/**
 * One Python snake: a thick hook (bar + column). `flip` rotates it 180° about
 * (8,8) to make the second snake, exactly as the mark's own symmetry does.
 */
export function snake({ barX0, barX1, barY0, barH, colW, colY1 }, flip = false) {
	const barY1 = barY0 + barH, colX1 = barX0 + colW;
	const pts = [
		[barX0, barY0], [barX1, barY0], [barX1, barY1], [colX1, barY1],
		[colX1, colY1], [barX0, colY1]
	];
	// a 180° turn keeps the winding, so the radii follow their vertices unchanged
	const rad = [barH / 2, barH / 2, barH / 2, 0.5, colW / 2, colW / 2];
	const T = ([x, y]) => (flip ? [16 - x, 16 - y] : [x, y]);
	return roundPoly(pts.map(T), rad);
}

/** Monoline hook for the same mark. */
export function snakeLine({ barX0, barX1, barY0, colY1 }, flip = false) {
	const T = (x, y) => (flip ? [16 - x, 16 - y] : [x, y]);
	const a = T(barX0, colY1), b = T(barX0, barY0), c = T(barX1, barY0);
	return `M${P(...a)}L${P(...b)} ${P(...c)}`;
}

/**
 * The EditorConfig mascot: a wedge head with two round ears and the spectacles,
 * drawn as counters. `s` scales the whole mark about (8, 8.3).
 */
export function mouse(s = 1, dy = 0) {
	const T = (x, y) => [8 + (x - 8) * s, 8.4 + (y - 8.4) * s + dy];
	// one closed outline: snout, flank, two ear bumps, cheek, chin
	const pts = [[2.9, 13.1], [3.6, 6.6], [4.7, 2.3], [7.7, 5.0], [11.4, 2.5], [13.0, 7.3], [9.7, 12.8]];
	const rad = [0.9, 1.5, 1.7, 1.4, 1.8, 2.4, 2.4].map(r => r * s);
	const head = roundPoly(pts.map(([x, y]) => T(x, y)), rad);
	const eyes = [[6.4, 8.4, 0.9], [9.5, 9.0, 0.9]].map(([x, y, r]) => {
		const [X, Y] = T(x, y);
		return { cx: X, cy: Y, r: r * s };
	});
	return { head, eyes };
}

/**
 * A check mark of constant thickness `t`: a short arm down-right into the vertex,
 * a long arm up-right out of it. The joint is a true miter, so the stem never
 * pinches — which is what makes it survive the folder face's 8 px.
 * `w`/`h` are the ink box, `(cx, cy)` its centre.
 */
export function check(cx, cy, w, h, t) {
	const x0 = cx - w / 2, x1 = cx + w / 2, y0 = cy - h / 2, y1 = cy + h / 2;
	const vx = x0 + w * 0.355, vy = y1;                 // the vertex, on the ink floor
	const A = [x0, y1 - h * 0.42], V = [vx, vy], B = [x1, y0];
	const unit = (p, q) => {
		const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy);
		return [dx / L, dy / L];
	};
	const u1 = unit(A, V), u2 = unit(V, B);
	const nrm = (u) => [u[1], -u[0]];                   // left-hand normal
	const n1 = nrm(u1), n2 = nrm(u2);
	// miter at the vertex: where the two offset arms meet
	const miter = (sgn) => {
		const bx = n1[0] + n2[0], by = n1[1] + n2[1];
		const bl = Math.hypot(bx, by);
		const cosHalf = (u1[0] * -u2[0] + u1[1] * -u2[1] + 1) / 2;   // (1 + cos)/2 = cos^2(th/2)
		const k = (t / 2) / Math.max(0.35, Math.sqrt(Math.max(0.02, cosHalf)));
		return [V[0] + sgn * bx / bl * k, V[1] + sgn * by / bl * k];
	};
	const o = (p, n, sgn) => [p[0] + sgn * n[0] * t / 2, p[1] + sgn * n[1] * t / 2];
	return roundPoly([
		o(A, n1, 1), miter(1), o(B, n2, 1),
		o(B, n2, -1), miter(-1), o(A, n1, -1)
	], [t * 0.28, t * 0.3, t * 0.28, t * 0.28, t * 0.42, t * 0.28]);
}

/** The set's one folder silhouette (v1's proven mass, kept per L7). */
export const FOLDER = 'M1.5 4.1c0-.66.54-1.2 1.2-1.2h3.12c.34 0 .66.14.89.39l.95 1.01h5.64'
	+ 'c.66 0 1.2.54 1.2 1.2v6.4c0 .66-.54 1.2-1.2 1.2H2.7c-.66 0-1.2-.54-1.2-1.2z';

/**
 * The OPEN state, both panels — v1's proven open silhouette, verbatim (L7 keeps
 * the base mass). The back sheet stands behind in the shade tone, the pocket
 * tips forward in the body tone and juts past the closed folder's right edge.
 * The face mark is painted over both at the SAME coordinates it holds when the
 * folder is closed, so closed and open really are one construction.
 */
export const FOLDER_OPEN_BACK = 'M1.5 4.1c0-.66.54-1.2 1.2-1.2h3.12c.34 0 .66.14.89.39l.95 1.01h4.94'
	+ 'c.66 0 1.2.54 1.2 1.2v1h-12z';
export const FOLDER_OPEN_FRONT = 'M2.42 6.5h11.62c.78 0 1.35.73 1.17 1.49l-.98 3.9c-.13.54-.61.91-1.17.91'
	+ 'H2.7c-.66 0-1.2-.54-1.2-1.2V7.7c0-.66.42-1.2.92-1.2z';

/** Its monoline twin, inset by half a stroke. */
export const FOLDER_LINE = 'M2.25 12.65V4.35c0-.5.4-.9.9-.9h2.65c.25 0 .5.1.67.29l.85.91h5.53'
	+ 'c.5 0 .9.4.9.9v7.1c0 .5-.4.9-.9.9H3.15c-.5 0-.9-.4-.9-.9z';

// =============================================================================
// THE NEUTRAL GLYPH VOCABULARY (working rule 2, opened with slice A01)
// =============================================================================
//
// R1 gives mark-less concepts "the shared neutral glyph vocabulary in one gray"
// (guide §5). The pilot opened it with four glyphs — brace, chevron, hexagon,
// check — and production needs it to carry the long tail, so the rules are:
//
//   · max 2 sub-shapes, authored ON the 16-grid, one gray, no scenes;
//   · a concept with a natural OBJECT metaphor gets that object (disc, book);
//   · a concept without one takes its CATEGORY glyph, and category glyphs are
//     SHARED byte for byte across every concept that falls back to them — that
//     sharing is declared in the slice manifest's `neutral_collapse` record and
//     reported in the twin audit's own lane, never hidden;
//   · every new glyph is checked against the ones already in the vocabulary for
//     R8 form collisions before it ships.
//
// Sizes below are the AUTHORED ink; each spec picks an envelope that fits them
// at (or very near) 1:1, so the stems here are the stems that ship.

/**
 * Optical disc — the object glyph for disc images (dmg / iso / vmdk).
 * One sub-shape: a ring, spindle hole punched out under nonzero winding.
 * Authored ink 13.2 x 13.2; ring wall 4.6, hole 2.0 radius.
 */
export function opticalDisc(cx = 8, cy = 8, r = 6.6, hole = 2) {
	return ellipse(cx, cy, r, r, true) + ellipse(cx, cy, hole, hole, false);
}

/**
 * A bound volume — the object glyph for static libraries (.a / .lib).
 * Two sub-shapes: the two page panels of an OPEN book, splayed from a 1.6 gutter.
 * (A spine-plus-cover construction was drawn and measured first and rejected at
 * 16 px — two upright bars read as a split panel, not as a book.)
 * Authored ink 13.0 x 10.4.
 */
export function bookGlyph() {
	return [
		roundPoly([[1.5, 4.3], [7.2, 3.1], [7.2, 12.5], [1.5, 13.5]], 0.5),
		roundPoly([[8.8, 3.1], [14.5, 4.3], [14.5, 13.5], [8.8, 12.5]], 0.5)
	];
}

/**
 * A musical note — the object glyph for music-notation sources (.abc).
 * Two sub-shapes: a tilted notehead (a rounded rhombus, which is what an oval
 * head becomes on the 16-grid) and the stem WITH its flag as one contour, so the
 * pair fuses into a single silhouette the way the drawn glyph does.
 * Authored ink 9.9 x 12.0; stem 1.7, flag reach 3.7.
 */
export function noteGlyph() {
	return [
		roundPoly([[2.6, 12.4], [6.4, 10.4], [8.7, 12.2], [4.9, 14.2]], 1.3),
		roundPoly([
			[7, 12.6], [7, 2.2], [8.7, 2.2], [12.5, 4.9], [11.5, 8.8], [8.7, 6.4], [8.7, 12.6]
		], [0.4, 0.5, 0.5, 1.4, 1.1, 0.6, 0.4])
	];
}

/**
 * CATEGORY GLYPH · generic-archive — a lidded box. Two sub-shapes (lid, body)
 * plus the body's latch as a counter; the 1.5 gap under the lid is what keeps
 * the silhouette from collapsing into one rectangle.
 * Authored ink 13.0 x 11.1.
 */
export function genericArchive() {
	return [
		roundRect(1.5, 2.7, 13, 3, 0.65),                                   // lid
		roundRect(2.4, 7.2, 11.2, 6.6, 0.75) + roundRect(6.7, 8.9, 2.6, 2.4, 0.45, false)
	];
}

/**
 * CATEGORY GLYPH · generic-binary — a punched byte block: one plate with a 2x2
 * grid of square counters. One sub-shape, so it never fuses; the counters are
 * what separate it from a plate mark's solid field.
 * Authored ink 11.4 x 11.4; walls 1.8, counters 3.0.
 */
export function genericBinary() {
	let d = roundRect(2.3, 2.3, 11.4, 11.4, 1.1);
	for (const y of [4.1, 8.9]) {
		for (const x of [4.1, 8.9]) { d += roundRect(x, y, 3, 3, 0.5, false); }
	}
	return d;
}

/**
 * CATEGORY GLYPH · generic-code — the angle-bracket pair, at file scale. It is
 * deliberately the same construction as the src/ folder's face mark (L7 asks the
 * pair to rhyme), one size up.
 * Authored ink 13.2 x 9.8.
 */
export function genericCode() {
	return [
		chevron(2.4, 8, 3.9, 4.9, 1.9, 1),
		chevron(13.6, 8, 3.9, 4.9, 1.9, -1)
	];
}

/**
 * OBJECT GLYPH · terminal — the shell window a script is run in: one plate with
 * the prompt chevron and the cursor bar punched out of it as counters, so the
 * whole glyph is ONE sub-shape that cannot fuse. Opened by the fix round for
 * `bat` and `awk`; drawn and measured first as tranche 3's deferred candidate
 * (proofs/object-glyph-study.png), and shipped unchanged from that drawing.
 * Authored ink 12.8 x 10.4; plate walls 1.6, chevron stroke 1.4, cursor 1.4.
 */
export function terminalGlyph() {
	return [
		roundRect(1.6, 2.8, 12.8, 10.4, 1.2)
		+ roundPoly([[3.2, 7], [4.9, 8], [3.2, 9], [4.2, 10], [7, 8], [4.2, 6]], 0.4)
		+ roundRect(8.2, 9.2, 4.2, 1.4, 0.5, false)
	];
}

/**
 * OBJECT GLYPH · stopwatch — the object a benchmark reads: a ring with its dial
 * punched out and the crown bar seated on top. Two sub-shapes. Opened by the fix
 * round for the bench-* family; drawn and measured first as tranche 3's declined
 * candidate (proofs/bench-family-study.png) and shipped unchanged from it.
 * Authored ink 11.2 x 13.2; ring wall 2.2, dial 6.8 across, crown 2.8 x 1.8.
 */
export function stopwatchGlyph() {
	return [
		ellipse(8, 9.2, 5.6, 5.6, true) + ellipse(8, 9.2, 3.4, 3.4, false),
		roundPoly([[6.6, 1.6], [9.4, 1.6], [9.4, 3.4], [6.6, 3.4]], 0.6)
	];
}

/**
 * OBJECT GLYPH · chess rook — the object a .pgn / .fen file records a game of.
 * Two sub-shapes: the castellated tower (battlements, waist and flared body as
 * ONE contour, the way a turned piece is one silhouette) and the base plate,
 * held apart by a 1.5 gap so the piece reads as a piece and not as a column.
 * Opened by slice A02 for `chess`; a pawn, a king and a knight were drawn and
 * measured against it first (proofs/chess-piece-study.png) — the rook is the one
 * whose distinguishing feature, the battlements, is made of 1.75 px notches that
 * survive 16 px, where the knight's muzzle and the king's cross do not.
 * Authored ink 11.6 x 13.4; teeth 2.5, notches 1.75, waist 7.4, base 1.9 tall.
 */
export function chessRook() {
	return [
		roundPoly([
			[2.5, 1.6], [5, 1.6], [5, 3.9], [6.75, 3.9], [6.75, 1.6], [9.25, 1.6],
			[9.25, 3.9], [11, 3.9], [11, 1.6], [13.5, 1.6],
			[13.5, 6.3], [11.7, 7.8], [12.5, 11.6], [3.5, 11.6], [4.3, 7.8], [2.5, 6.3]
		], 0.45),
		roundRect(2.2, 13.1, 11.6, 1.9, 0.5)
	];
}

/**
 * OBJECT GLYPH · envelope — the object an .eml / .msg / .mbox / .ics file IS.
 * ONE sub-shape: the body, with the flap's V punched out of it as a counter, so
 * the glyph cannot fuse and its silhouette is the envelope rather than a plate.
 * Opened by slice A02 for `email`; a filled body and a hollow frame were drawn
 * and measured against each other, and against the terminal glyph already in the
 * vocabulary, before this one shipped (proofs/email-glyph-study.png).
 * Authored ink 13.0 x 9.2; band above the flap 2.0, flap stroke 1.5, and the V
 * spans 9.8 of the body's 13.0 so the glyph reads as a letter and not as a box
 * with a chevron in it.
 */
export function envelopeGlyph() {
	const t = 1.5, xL = 3.1, xR = 12.9, yTop = 5.4, yBot = 9.8;
	const W = (xR - xL) / 2, H = yBot - yTop, L = Math.hypot(W, H);
	const dy = t * L / W, ix = dy * W / H;          // the V's own inner offsets
	const flap = roundPoly([
		[xL, yTop], [8, yBot], [xR, yTop],
		[xR - ix, yTop], [8, yBot - dy], [xL + ix, yTop]
	], [0.3, 0.55, 0.3, 0.3, 0.5, 0.3]);
	return [roundRect(1.5, 3.4, 13, 9.2, 1.3) + flap];
}

export const circle = (c, fill) => `<circle cx="${n(c.cx)}" cy="${n(c.cy)}" r="${n(c.r)}" fill="${fill}"/>`;
export const path = (d, fill, extra = '') => `<path${extra} fill="${fill}" d="${d}"/>`;
export const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${body}</svg>`;
