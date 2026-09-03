// pathkit.mjs — SVG path surgery for round 2.
//
// The round-2 rule (guide L2) is that geometry DERIVES from official vector
// artwork: we parse the real path, split it into its subpaths, measure them,
// affine-fit them into the 16-grid envelope and re-emit at 2 decimals. Nothing
// here invents a curve — every command that comes in comes back out.

import svgpath from 'svgpath';
import bounds from 'svg-path-bounds';

/** 2-decimal number, trailing zeros trimmed (matches geom.mjs's n()). */
export const n = (v) => {
	let s = (+v).toFixed(2);
	if (s.includes('.')) { s = s.replace(/0+$/, '').replace(/\.$/, ''); }
	return s === '-0' ? '0' : s;
};

/** Split a path's `d` into its subpaths (one string per `M`). */
export function subpaths(d) {
	const out = [];
	let cur = '';
	// absolute-ise first so every subpath is independent of the ones before it
	const abs = svgpath(d).abs().toString();
	for (const seg of abs.match(/[MmZzLlHhVvCcSsQqTtAa][^MmZzLlHhVvCcSsQqTtAa]*/g) || []) {
		if (/^M/.test(seg) && cur) { out.push(cur); cur = ''; }
		cur += seg;
	}
	if (cur) { out.push(cur); }
	return out.map(s => s.trim());
}

/** [x1, y1, x2, y2] of a path (curve-accurate — svg-path-bounds flattens). */
export function bbox(d) {
	const [x1, y1, x2, y2] = bounds(d);
	return { x1, y1, x2, y2, w: x2 - x1, h: y2 - y1, cx: (x1 + x2) / 2, cy: (y1 + y2) / 2 };
}

/** Signed area of a subpath's polygon hull — sign tells the winding direction. */
export function winding(d) {
	const pts = [];
	svgpath(d).abs().unarc().unshort().iterate((seg, _i, x, y) => {
		const t = seg[0];
		if (t === 'M' || t === 'L') { pts.push([seg[1], seg[2]]); }
		else if (t === 'C') { pts.push([seg[1], seg[2]], [seg[3], seg[4]], [seg[5], seg[6]]); }
		else if (t === 'Q') { pts.push([seg[1], seg[2]], [seg[3], seg[4]]); }
		else if (t === 'H') { pts.push([seg[1], y]); }
		else if (t === 'V') { pts.push([x, seg[1]]); }
	});
	let a = 0;
	for (let i = 0; i < pts.length; i++) {
		const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length];
		a += x0 * y1 - x1 * y0;
	}
	return a / 2;
}

/** Force a subpath's winding direction (+1 = clockwise in SVG's y-down space). */
export function rewind(d, dir) {
	return winding(d) * dir < 0 ? reverse(d) : d;
}

/** Reverse a subpath (cubics only — everything is unarc/unshort'ed first). */
export function reverse(d) {
	const segs = [];
	svgpath(d).abs().unarc().unshort().iterate((seg, _i, x, y) => {
		const t = seg[0];
		if (t === 'M') { segs.push(['M', seg[1], seg[2]]); }
		else if (t === 'L') { segs.push(['L', seg[1], seg[2]]); }
		else if (t === 'H') { segs.push(['L', seg[1], y]); }
		else if (t === 'V') { segs.push(['L', x, seg[1]]); }
		else if (t === 'C') { segs.push(['C', seg[1], seg[2], seg[3], seg[4], seg[5], seg[6]]); }
		else if (t === 'Q') {
			// promote to cubic so reversal is uniform
			const c1x = x + 2 / 3 * (seg[1] - x), c1y = y + 2 / 3 * (seg[2] - y);
			const c2x = seg[3] + 2 / 3 * (seg[1] - seg[3]), c2y = seg[4] + 2 / 3 * (seg[2] - seg[4]);
			segs.push(['C', c1x, c1y, c2x, c2y, seg[3], seg[4]]);
		}
	});
	const pt = (s) => (s[0] === 'C' ? [s[5], s[6]] : [s[1], s[2]]);
	const last = pt(segs[segs.length - 1]);
	let out = `M${last[0]} ${last[1]}`;
	for (let i = segs.length - 1; i > 0; i--) {
		const s = segs[i], prev = pt(segs[i - 1]);
		if (s[0] === 'C') { out += `C${s[3]} ${s[4]} ${s[1]} ${s[2]} ${prev[0]} ${prev[1]}`; }
		else { out += `L${prev[0]} ${prev[1]}`; }
	}
	return out + 'Z';
}

/**
 * Fit paths into the 16-grid. `parts` is a list of `d` strings that share ONE
 * transform (so relative geometry between colored layers never drifts); the
 * bbox that drives the fit is the union of `measure` (defaults to all parts).
 *
 * opts: { w, h, cx, cy, flipY, scale } — target ink size, target centre.
 *   `w`/`h` are maxima: the fit is uniform (aspect preserved), never squashed.
 */
export function fit(parts, opts) {
	const { w = 16, h = 16, cx = 8, cy = 8, srcH = null, flipY = false } = opts;
	const measure = opts.measure || parts;
	const b = unionBBox(measure);
	const s = Math.min(w / b.w, h / b.h);
	// NB: no unarc() — a uniform scale keeps elliptical arcs intact, and expanding
	// them to cubics costs ~50% more bytes for no visual gain (L8's size budget).
	return parts.map((d) => {
		let p = svgpath(d).abs();
		if (flipY) { p = p.translate(0, -srcH).scale(1, -1); }
		return round(p
			.translate(-b.cx, -(flipY ? srcH - b.cy : b.cy))
			.scale(s)
			.translate(cx, cy)
			.toString());
	});
}

export function unionBBox(parts) {
	const bs = parts.map(bbox);
	const x1 = Math.min(...bs.map(v => v.x1)), y1 = Math.min(...bs.map(v => v.y1));
	const x2 = Math.max(...bs.map(v => v.x2)), y2 = Math.max(...bs.map(v => v.y2));
	return { x1, y1, x2, y2, w: x2 - x1, h: y2 - y1, cx: (x1 + x2) / 2, cy: (y1 + y2) / 2 };
}

/** Apply an arbitrary affine and round. */
export function xform(d, { sx = 1, sy = sx, dx = 0, dy = 0 }) {
	return round(svgpath(d).abs().scale(sx, sy).translate(dx, dy).toString());
}

/** Round every coordinate to 2 decimals and compact the output (L8). */
export function round(d) {
	return svgpath(d).round(2).toString()
		.replace(/\s+/g, ' ')
		.replace(/ ?([A-Za-z]) ?/g, '$1')
		.replace(/(\.\d+|\d)\s+-/g, '$1-')
		.trim();
}

/**
 * Ellipse as one cubic contour. `cw` picks the winding so a ring can be built
 * from an outer contour plus a reversed inner one under plain nonzero fill.
 */
export function ellipse(cx, cy, rx, ry, cw = true) {
	const k = 0.5522847498, ax = rx * k, ay = ry * k;
	const p = cw
		? [[cx + rx, cy], [cx + rx, cy + ay, cx + ax, cy + ry, cx, cy + ry],
			[cx - ax, cy + ry, cx - rx, cy + ay, cx - rx, cy],
			[cx - rx, cy - ay, cx - ax, cy - ry, cx, cy - ry],
			[cx + ax, cy - ry, cx + rx, cy - ay, cx + rx, cy]]
		: [[cx + rx, cy], [cx + rx, cy - ay, cx + ax, cy - ry, cx, cy - ry],
			[cx - ax, cy - ry, cx - rx, cy - ay, cx - rx, cy],
			[cx - rx, cy + ay, cx - ax, cy + ry, cx, cy + ry],
			[cx + ax, cy + ry, cx + rx, cy + ay, cx + rx, cy]];
	return `M${p[0].join(' ')}` + p.slice(1).map(c => `C${c.join(' ')}`).join('') + 'Z';
}

/** Rounded rectangle as one contour, winding selectable (same reason). */
export function roundRect(x, y, w, h, r, cw = true) {
	r = Math.max(0, Math.min(r, w / 2, h / 2));
	const k = 0.5522847498 * r;
	const d = cw
		? `M${x + r} ${y}H${x + w - r}C${x + w - r + k} ${y} ${x + w} ${y + r - k} ${x + w} ${y + r}`
			+ `V${y + h - r}C${x + w} ${y + h - r + k} ${x + w - r + k} ${y + h} ${x + w - r} ${y + h}`
			+ `H${x + r}C${x + r - k} ${y + h} ${x} ${y + h - r + k} ${x} ${y + h - r}`
			+ `V${y + r}C${x} ${y + r - k} ${x + r - k} ${y} ${x + r} ${y}Z`
		: `M${x + r} ${y}C${x + r - k} ${y} ${x} ${y + r - k} ${x} ${y + r}`
			+ `V${y + h - r}C${x} ${y + h - r + k} ${x + r - k} ${y + h} ${x + r} ${y + h}`
			+ `H${x + w - r}C${x + w - r + k} ${y + h} ${x + w} ${y + h - r + k} ${x + w} ${y + h - r}`
			+ `V${y + r}C${x + w} ${y + r - k} ${x + w - r + k} ${y} ${x + w - r} ${y}Z`;
	return d;
}

/** Optical-mass fit: scale so the ink AREA matches a target, capped by w/h. */
export function areaFit(parts, { area, w, h, cx = 8, cy = 8, measure = null }) {
	const m = measure || parts;
	const b = unionBBox(m);
	const byArea = Math.sqrt(area / (b.w * b.h));
	const s = Math.min(byArea, w / b.w, h / b.h);
	return { parts: fit(parts, { w: b.w * s, h: b.h * s, cx, cy, measure: m }), scale: s, src: b };
}
