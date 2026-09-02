// A10 scratch: shared helpers for emitting slice SVGs.
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

export const PROD = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production';
export const OUT = join(PROD, 'svg', 'file');
const LP = join(PROD, 'tools', 'letterpath.mjs');

/** letterpath -> one <path> element string */
export function letters(opts) {
	const args = [];
	for (const [k, v] of Object.entries(opts)) {
		args.push('--' + k);
		if (v !== true && v !== '') { args.push(String(v)); }
	}
	return execFileSync('node', [LP, ...args], { encoding: 'utf8' }).trim();
}

export function svg(inner) {
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${inner}</svg>`;
}

export function write(id, inner) {
	mkdirSync(OUT, { recursive: true });
	const s = svg(inner);
	writeFileSync(join(OUT, `${id}.svg`), s, 'utf8');
	return Buffer.byteLength(s);
}

/** number -> compact string (2dp, no leading zero, no trailing zeros) */
export function n(v) {
	let s = (Math.round(v * 100) / 100).toFixed(2);
	s = s.replace(/0+$/, '').replace(/\.$/, '');
	if (s === '-0') { s = '0'; }
	return s.replace(/^(-?)0\./, '$1.');
}

/** circle as two arcs, ready to sit inside a path d */
export function circle(cx, cy, r, sweep = 1) {
	return `M${n(cx - r)} ${n(cy)}a${n(r)} ${n(r)} 0 1 ${sweep} ${n(2 * r)} 0a${n(r)} ${n(r)} 0 1 ${sweep} ${n(-2 * r)} 0Z`;
}

/** axis-aligned rounded rect subpath */
export function rrect(x, y, w, h, r) {
	return `M${n(x + r)} ${n(y)}h${n(w - 2 * r)}a${n(r)} ${n(r)} 0 0 1 ${n(r)} ${n(r)}v${n(h - 2 * r)}a${n(r)} ${n(r)} 0 0 1 ${n(-r)} ${n(r)}h${n(-(w - 2 * r))}a${n(r)} ${n(r)} 0 0 1 ${n(-r)} ${n(-r)}v${n(-(h - 2 * r))}a${n(r)} ${n(r)} 0 0 1 ${n(r)} ${n(-r)}Z`;
}

/** plain rect subpath (wound clockwise) */
export function rect(x, y, w, h) {
	return `M${n(x)} ${n(y)}h${n(w)}v${n(h)}h${n(-w)}Z`;
}

/** polygon from [x,y,...] pairs */
export function poly(pts) {
	const out = [];
	for (let i = 0; i < pts.length; i += 2) { out.push((i ? 'L' : 'M') + n(pts[i]) + ' ' + n(pts[i + 1])); }
	return out.join('') + 'Z';
}

/** canon badge plate */
export function plate(fill) {
	return `<rect x="1" y="1" width="14" height="14" rx="3" fill="${fill}"/>`;
}

/** R5 / law-1 badge baseline from an ink box height */
export function badgeBaseline(inkHeight) {
	return 15 - 0.41 * (14 - inkHeight);
}

/** ellipse as two arcs */
export function ellipse(cx, cy, rx, ry, sweep = 1) {
	return `M${n(cx - rx)} ${n(cy)}a${n(rx)} ${n(ry)} 0 1 ${sweep} ${n(2 * rx)} 0a${n(rx)} ${n(ry)} 0 1 ${sweep} ${n(-2 * rx)} 0Z`;
}

/** capsule (rounded-end bar) */
export function capsule(x1, y1, x2, y2, r) {
	const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
	const px = -dy / L * r, py = dx / L * r;
	return `M${n(x1 + px)} ${n(y1 + py)}L${n(x2 + px)} ${n(y2 + py)}` +
		`A${n(r)} ${n(r)} 0 0 1 ${n(x2 - px)} ${n(y2 - py)}L${n(x1 - px)} ${n(y1 - py)}` +
		`A${n(r)} ${n(r)} 0 0 1 ${n(x1 + px)} ${n(y1 + py)}Z`;
}

/** regular polygon, first vertex at `start` degrees */
export function ngon(cx, cy, r, sides, start = -90) {
	const pts = [];
	for (let i = 0; i < sides; i++) {
		const a = (start + i * 360 / sides) * Math.PI / 180;
		pts.push(cx + r * Math.cos(a), cy + r * Math.sin(a));
	}
	return poly(pts);
}

/**
 * Badge letters sized ink-width-first (R5) and placed 41 % low (§5 law 1)
 * on the ink box (caps/digits) or the x-height band (lowercase with ascenders).
 * @param {string} text
 * @param {{width:number, fill:string, spacing?:number, band?:'ink'|'x', font?:string}} o
 */
export function badgeLetters(text, o) {
	const band = o.band || 'ink';
	const key = band === 'x' ? 'xheight' : 'cap';
	const probe = (v) => JSON.parse(letters({
		text, [key]: v, cx: 8, baseline: 11, json: true,
		...(o.spacing ? { 'letter-spacing': o.spacing } : {}),
		...(o.font ? { font: o.font } : {})
	}));
	let lo = 1.5, hi = 9;
	for (let i = 0; i < 34; i++) {
		const mid = (lo + hi) / 2;
		if (probe(mid).ink.w < o.width) { lo = mid; } else { hi = mid; }
	}
	const size = Math.round(((lo + hi) / 2) * 1000) / 1000;
	const m = probe(size);
	const h = band === 'x' ? size : m.ink.h;
	const baseline = Math.round((15 - 0.41 * (14 - h)) * 100) / 100;
	return letters({
		text, [key]: size, cx: 8, baseline, fill: o.fill,
		...(o.spacing ? { 'letter-spacing': o.spacing } : {}),
		...(o.font ? { font: o.font } : {})
	});
}

/** annulus sector: cx,cy, inner/outer radius, start/end angle in degrees (0 = +x, screen-clockwise) */
export function arcBand(cx, cy, rIn, rOut, a0, a1) {
	const rad = (d) => d * Math.PI / 180;
	const P = (r, a) => [cx + r * Math.cos(rad(a)), cy + r * Math.sin(rad(a))];
	const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
	const [ax, ay] = P(rOut, a0), [bx, by] = P(rOut, a1);
	const [cx2, cy2] = P(rIn, a1), [dx, dy] = P(rIn, a0);
	return `M${n(ax)} ${n(ay)}A${n(rOut)} ${n(rOut)} 0 ${large} 1 ${n(bx)} ${n(by)}` +
		`L${n(cx2)} ${n(cy2)}A${n(rIn)} ${n(rIn)} 0 ${large} 0 ${n(dx)} ${n(dy)}Z`;
}

/** GLYPH letters: sized to an ink width, ink box centred on (8, cy) — §5 law 2 */
export function glyphLetters(text, o) {
	const probe = (v) => JSON.parse(letters({
		text, cap: v, cx: 8, baseline: 11, json: true,
		...(o.spacing ? { 'letter-spacing': o.spacing } : {})
	}));
	let lo = 1, hi = 14;
	for (let i = 0; i < 34; i++) {
		const mid = (lo + hi) / 2;
		if (probe(mid).ink.w < o.width) { lo = mid; } else { hi = mid; }
	}
	const size = Math.round(((lo + hi) / 2) * 1000) / 1000;
	return letters({
		text, cap: size, cx: 8, 'cy-ink': o.cy ?? 8, fill: o.fill,
		...(o.spacing ? { 'letter-spacing': o.spacing } : {})
	});
}
