// geom.mjs — the shared drawing primitives for the M20 style samples.
//
// Everything is authored ON the 16-grid (guide L4): the functions take grid
// coordinates and emit 2-decimal path data. No function ever scales a finished
// drawing — a smaller variant is a smaller set of arguments, so stems stay put.

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

/** The set's one folder silhouette (v1's proven mass, kept per L7). */
export const FOLDER = 'M1.5 4.1c0-.66.54-1.2 1.2-1.2h3.12c.34 0 .66.14.89.39l.95 1.01h5.64'
	+ 'c.66 0 1.2.54 1.2 1.2v6.4c0 .66-.54 1.2-1.2 1.2H2.7c-.66 0-1.2-.54-1.2-1.2z';

/** Its monoline twin, inset by half a stroke. */
export const FOLDER_LINE = 'M2.25 12.65V4.35c0-.5.4-.9.9-.9h2.65c.25 0 .5.1.67.29l.85.91h5.53'
	+ 'c.5 0 .9.4.9.9v7.1c0 .5-.4.9-.9.9H3.15c-.5 0-.9-.4-.9-.9z';

export const circle = (c, fill) => `<circle cx="${n(c.cx)}" cy="${n(c.cy)}" r="${n(c.r)}" fill="${fill}"/>`;
export const path = (d, fill, extra = '') => `<path${extra} fill="${fill}" d="${d}"/>`;
export const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${body}</svg>`;
