// lib.mjs — drawing helpers for slice A02. Not a deliverable; the SVGs are.
import { letterPath } from '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/tools/letterpath.mjs';

export const n = (v, p = 2) => {
	let s = Number(v).toFixed(p);
	if (s.includes('.')) { s = s.replace(/0+$/, '').replace(/\.$/, ''); }
	if (s === '-0') { s = '0'; }
	return s.replace(/^(-?)0\./, '$1.');
};

/** join path pieces, stripping the space before a negative number */
export const d = (...parts) => parts.join(' ').replace(/\s+/g, ' ').replace(/ -/g, '-').trim();

/** full circle as two arcs. cw=true -> clockwise (outer), false -> hole under nonzero */
export function circle(cx, cy, r, cw = true) {
	const s = cw ? 1 : 0;
	return d(`M${n(cx - r)},${n(cy)}`,
		`A${n(r)},${n(r)} 0 1 ${s} ${n(cx + r)},${n(cy)}`,
		`A${n(r)},${n(r)} 0 1 ${s} ${n(cx - r)},${n(cy)}Z`);
}

/** axis-aligned rect, cw or ccw (hole) */
export function rect(x, y, w, h, cw = true) {
	return cw
		? d(`M${n(x)},${n(y)}H${n(x + w)}V${n(y + h)}H${n(x)}Z`)
		: d(`M${n(x)},${n(y)}V${n(y + h)}H${n(x + w)}V${n(y)}Z`);
}

/** rounded rect, clockwise (cw) or counter-clockwise hole */
export function rrect(x, y, w, h, r, cw = true) {
	const x2 = x + w, y2 = y + h;
	if (cw) {
		return d(`M${n(x + r)},${n(y)}H${n(x2 - r)}A${n(r)},${n(r)} 0 0 1 ${n(x2)},${n(y + r)}`,
			`V${n(y2 - r)}A${n(r)},${n(r)} 0 0 1 ${n(x2 - r)},${n(y2)}`,
			`H${n(x + r)}A${n(r)},${n(r)} 0 0 1 ${n(x)},${n(y2 - r)}`,
			`V${n(y + r)}A${n(r)},${n(r)} 0 0 1 ${n(x + r)},${n(y)}Z`);
	}
	return d(`M${n(x + r)},${n(y)}A${n(r)},${n(r)} 0 0 0 ${n(x)},${n(y + r)}`,
		`V${n(y2 - r)}A${n(r)},${n(r)} 0 0 0 ${n(x + r)},${n(y2)}`,
		`H${n(x2 - r)}A${n(r)},${n(r)} 0 0 0 ${n(x2)},${n(y2 - r)}`,
		`V${n(y + r)}A${n(r)},${n(r)} 0 0 0 ${n(x2 - r)},${n(y)}Z`);
}

/** polygon from flat [x,y,...] */
export function poly(...pts) {
	let s = `M${n(pts[0])},${n(pts[1])}`;
	for (let i = 2; i < pts.length; i += 2) { s += `L${n(pts[i])},${n(pts[i + 1])}`; }
	return d(s + 'Z');
}

// ---- letters -------------------------------------------------------------
// §5 law 1 / R5: badge letters sit 41 % low, measured on the ink box (caps and
// digits) or on the x-height band (lowercase, as canon bun does).

function sizeForInkWidth(text, targetW, letterSpacing, font) {
	const probe = letterPath({ text, size: 10, letterSpacing, font });
	return 10 * targetW / probe.ink.w;
}

/**
 * Badge letters: size by ink width (R5), place 41 % low.
 * @param {string} text
 * @param {{ink:number, fill:string, tracking?:number, lower?:boolean, font?:string}} o
 */
export function badgeText(text, o) {
	const letterSpacing = o.tracking || 0;
	const font = o.font;
	const size = sizeForInkWidth(text, o.ink, letterSpacing, font);
	const m = letterPath({ text, size, letterSpacing, font });
	const band = o.lower ? m.xBand : m.ink.h;
	const bottom = 15 - 0.41 * (14 - band);
	// place the measured band's bottom on `bottom`
	const r = o.lower
		? letterPath({ text, size, letterSpacing, font, cx: o.cx ?? 8, baseline: bottom })
		: letterPath({ text, size, letterSpacing, font, cx: o.cx ?? 8, cy: bottom - band / 2, band: 'ink' });
	return { el: `<path fill="${o.fill}" d="${r.d}"/>`, m: r };
}

/**
 * Glyph letters: centred on the optical centre (§5 law 2).
 */
export function glyphText(text, o) {
	const letterSpacing = o.tracking || 0;
	const font = o.font;
	const size = o.cap != null
		? undefined
		: sizeForInkWidth(text, o.ink, letterSpacing, font);
	const r = letterPath({
		text, size, cap: o.cap, letterSpacing, font,
		cx: o.cx ?? 8, cy: o.cy ?? 8, band: o.band || 'ink'
	});
	return { el: `<path fill="${o.fill}" d="${r.d}"/>`, m: r };
}

// ---- assembly ------------------------------------------------------------
export const PLATE = (fill) => `<rect x="1" y="1" width="14" height="14" rx="3" fill="${fill}"/>`;

export function svg(body) {
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${body}</svg>`;
}

export function path(fill, dd, evenodd = false) {
	return `<path fill="${fill}"${evenodd ? ' fill-rule="evenodd"' : ''} d="${dd}"/>`;
}

// ---- colour --------------------------------------------------------------
export function hsl(hex) {
	const r = parseInt(hex.slice(1, 3), 16) / 255;
	const g = parseInt(hex.slice(3, 5), 16) / 255;
	const b = parseInt(hex.slice(5, 7), 16) / 255;
	const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
	let h = 0, s = 0;
	if (mx !== mn) {
		const dd = mx - mn;
		s = l > 0.5 ? dd / (2 - mx - mn) : dd / (mx + mn);
		h = mx === r ? ((g - b) / dd + (g < b ? 6 : 0)) : mx === g ? ((b - r) / dd + 2) : ((r - g) / dd + 4);
		h *= 60;
	}
	return [h, s * 100, l * 100];
}
export const hueDist = (a, b) => { const dd = Math.abs(a - b) % 360; return dd > 180 ? 360 - dd : dd; };
