// gen.mjs — emit the batch-2 production SVGs (ranks 25-48 of core-tier.json files).
// Temporary authoring harness: writes production/svg/file/<id>.svg only.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { letterPath } from '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/tools/letterpath.mjs';

const OUT = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/svg/file';

// ---- numeric helpers -------------------------------------------------------
const n = (v, p = 2) => {
	let s = (+v).toFixed(p);
	if (s.includes('.')) { s = s.replace(/0+$/, '').replace(/\.$/, ''); }
	if (s === '-0') { s = '0'; }
	return s.replace(/^(-?)0\./, '$1.');
};
const pt = (x, y) => `${n(x)} ${n(y)}`;

// polygon -> "M.. L.. Z" with repeat-command elision
function poly(points) {
	let d = 'M' + pt(...points[0]);
	for (let i = 1; i < points.length; i++) { d += (i === 1 ? 'L' : ' ') + pt(...points[i]); }
	return d + 'Z';
}

// thick polyline with miter joins and butt caps -> closed polygon
function thick(points, half) {
	const seg = [];
	for (let i = 0; i < points.length - 1; i++) {
		const [x1, y1] = points[i], [x2, y2] = points[i + 1];
		const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
		seg.push({ ux: dx / L, uy: dy / L, nx: -dy / L, ny: dx / L });
	}
	const side = (s) => {
		const out = [];
		const first = seg[0];
		out.push([points[0][0] + s * first.nx * half, points[0][1] + s * first.ny * half]);
		for (let i = 1; i < points.length - 1; i++) {
			const a = seg[i - 1], b = seg[i];
			// miter direction = normalised sum of the two normals, scaled by 1/cos(theta/2)
			let mx = a.nx + b.nx, my = a.ny + b.ny;
			const ml = Math.hypot(mx, my);
			mx /= ml; my /= ml;
			const cos = mx * a.nx + my * a.ny;
			const k = half / cos;
			out.push([points[i][0] + s * mx * k, points[i][1] + s * my * k]);
		}
		const last = seg[seg.length - 1];
		const e = points[points.length - 1];
		out.push([e[0] + s * last.nx * half, e[1] + s * last.ny * half]);
		return out;
	};
	return poly([...side(1), ...side(-1).reverse()]);
}

// ribbon around a sampled centre line f(t)->[x,y], constant thickness, butt ends
function ribbon(f, t0, t1, steps, half) {
	const c = [];
	for (let i = 0; i <= steps; i++) { c.push(f(t0 + (t1 - t0) * i / steps)); }
	return thick(c, half);
}

function svg(body) {
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${body}</svg>`;
}
const PLATE = (fill) => `<rect x="1" y="1" width="14" height="14" rx="3" fill="${fill}"/>`;
const letters = (opts, fill) => `<path fill="${fill}" d="${letterPath(opts).d}"/>`;

// circle as two arcs (compact, no <circle> needed inside a multi-subpath path)
const circ = (cx, cy, r) =>
	`M${pt(cx - r, cy)}A${n(r)} ${n(r)} 0 1 0 ${pt(cx + r, cy)}A${n(r)} ${n(r)} 0 1 0 ${pt(cx - r, cy)}Z`;

// plus sign outline: centre (cx,cy), half extent s, half bar b
function plus(cx, cy, s, b) {
	return poly([
		[cx - b, cy - s], [cx + b, cy - s], [cx + b, cy - b], [cx + s, cy - b],
		[cx + s, cy + b], [cx + b, cy + b], [cx + b, cy + s], [cx - b, cy + s],
		[cx - b, cy + b], [cx - s, cy + b], [cx - s, cy - b], [cx - b, cy - b]
	]);
}

// ---- icons -----------------------------------------------------------------
const icons = {};

// 25 font — GLYPH, a single Inter Bold "A" at the glyph ceiling, centred (law 2).
icons.font = svg(letters({ text: 'A', cap: 9.6, cy: 8 }, '#B4907A'));

// 26 pdf — SILHOUETTE, document page with a folded corner (flap in a lighter tint).
icons.pdf = svg(
	`<path fill="#C2483C" d="${poly([[2.7, 1.6], [8.9, 1.6], [13.3, 6], [13.3, 14.4], [2.7, 14.4]])}"/>` +
	`<path fill="#E08573" d="${poly([[8.9, 1.6], [13.3, 6], [8.9, 6]])}"/>`
);

// 27 xml — GLYPH, a facing pair of angle brackets.
icons.xml = svg(`<path fill="#7C93A6" d="${
	poly([[5.4, 3.6], [7.5, 3.6], [3.3, 8], [7.5, 12.4], [5.4, 12.4], [1.2, 8]]) +
	poly([[10.6, 3.6], [8.5, 3.6], [12.7, 8], [8.5, 12.4], [10.6, 12.4], [14.8, 8]])
}"/>`);

// 28 python — SILHOUETTE, the two interlocking hooks, two-tone, eyes knocked out.
const pyBlue =
	'M4.8 1.4H11.5A1.9 1.9 0 0 1 11.5 5.2H7.4V7.7A2.4 2.4 0 0 1 2.6 7.7V3.6A2.2 2.2 0 0 1 4.8 1.4Z' +
	circ(5.2, 3.3, .82);
const pyGold =
	'M11.2 14.6H4.5A1.9 1.9 0 0 1 4.5 10.8H8.6V8.3A2.4 2.4 0 0 1 13.4 8.3V12.4A2.2 2.2 0 0 1 11.2 14.6Z' +
	circ(10.8, 12.7, .82);
icons.python = svg(
	`<path fill="#3776AB" fill-rule="evenodd" d="${pyBlue}"/>` +
	`<path fill="#D8B44A" fill-rule="evenodd" d="${pyGold}"/>`
);

// 29 go — BADGE. Round caps, so the cap is trimmed to hold the canon TS ink width.
icons.go = svg(PLATE('#2E88A0') + letters({ text: 'GO', cap: 5.05, baseline: 11.33 }, '#FFFFFF'));

// 31 c — BADGE, the brand's pale slate plate, so the letter goes dark (spec §4).
icons.c = svg(PLATE('#A8B9CC') + letters({ text: 'C', cap: 7, baseline: 12.13 }, '#232C38'));

// 32 cpp — BADGE. Inter's "+" collapses below 1 px at badge scale, so the two
// pluses are drawn as geometry at a 1.3 px bar; only the C is a letterpath.
{
	const cap = 5.2, cx = 4.23, baseline = 11.39;
	const m = letterPath({ text: 'C', cap, cx, baseline });
	const cy = (m.ink.y1 + m.ink.y2) / 2;
	icons.cpp = svg(PLATE('#37648E') +
		`<path fill="#FFFFFF" d="${m.d}${plus(8.9, cy, 1.5, .65)}${plus(12.6, cy, 1.5, .65)}"/>`);
}

// 33 java — SILHOUETTE, steaming cup.
icons.java = svg(`<path fill="#C9832F" d="${
	'M3.2 7.1H11.2V10.1C11.2 12.25 9.41 13.9 7.2 13.9C4.99 13.9 3.2 12.25 3.2 10.1Z' +
	'M11 8.1C13.5 8.1 14.7 9.05 14.7 10.4C14.7 11.72 13.62 12.6 12.1 12.6H11V11.2H12.1C12.85 11.2 13.3 10.9 13.3 10.4C13.3 9.9 12.75 9.5 11 9.5Z' +
	poly([[4.55, 6.2], [5.75, 1.8], [7.05, 1.8], [5.85, 6.2]]) +
	poly([[7.45, 6.2], [8.65, 1.8], [9.95, 1.8], [8.75, 6.2]])
}"/>`);

// 34 vue — SILHOUETTE, the V with its inner notch.
icons.vue = svg(`<path fill="#4CB392" d="${
	poly([[1.4, 3], [5.45, 3], [8, 7.2], [10.55, 3], [14.6, 3], [8, 13.6]])
}"/>`);

// 35 license — SILHOUETTE, balance scale.
icons.license = svg(`<path fill="#C2A253" d="${
	'M7.3 3.6H8.7V13H7.3Z' +
	'M2.7 3.6H13.3V5H2.7Z' +
	'M4.4 13H11.6V14.4H4.4Z' +
	poly([[3.4, 5], [5.7, 9.4], [1.1, 9.4]]) +
	poly([[12.6, 5], [14.9, 9.4], [10.3, 9.4]])
}"/>`);

// 36 readme — SILHOUETTE, open book.
icons.readme = svg(`<path fill="#7EA6C2" d="${
	'M7.4 4.5C6.2 3.5 4.4 3 2.5 3 1.8 3 1.3 3.5 1.3 4.2V11.5C1.3 12.2 1.8 12.7 2.5 12.7 4.4 12.7 6.2 13 7.4 13.6Z' +
	'M8.6 4.5C9.8 3.5 11.6 3 13.5 3 14.2 3 14.7 3.5 14.7 4.2V11.5C14.7 12.2 14.2 12.7 13.5 12.7 11.6 12.7 9.8 13 8.6 13.6Z'
}"/>`);

// 37 editorconfig — GLYPH, three vertical sliders.
{
	const track = (cx) => `M${pt(cx - .65, 2.6)}H${n(cx + .65)}V13.4H${n(cx - .65)}Z`;
	const knob = (cx, cy) =>
		`M${pt(cx - 1.1, cy - 1.3)}H${n(cx + 1.1)}A.6 .6 0 0 1 ${pt(cx + 1.7, cy - .7)}V${n(cy + .7)}` +
		`A.6 .6 0 0 1 ${pt(cx + 1.1, cy + 1.3)}H${n(cx - 1.1)}A.6 .6 0 0 1 ${pt(cx - 1.7, cy + .7)}` +
		`V${n(cy - .7)}A.6 .6 0 0 1 ${pt(cx - 1.1, cy - 1.3)}Z`;
	icons.editorconfig = svg(`<path fill="#6F8F82" d="${
		track(3.6) + track(8) + track(12.4) + knob(3.6, 5.3) + knob(8, 10.2) + knob(12.4, 6.9)
	}"/>`);
}

// 38 eslint — GLYPH, a bold check (hexagons are taken by node; chevrons by shell).
icons.eslint = svg(`<path fill="#5D4EBE" d="${
	thick([[1.9, 8.5], [6.2, 12.2], [14.1, 4.4]], 1.05)
}"/>`);

// 39 prettier — SILHOUETTE, wand and sparkle.
icons.prettier = svg(`<path fill="#E0A83E" d="${
	thick([[2.5, 14.1], [9.6, 7]], 1.4) +
	'M12.3 1.5C12.3 3 13.5 4.2 15 4.2 13.5 4.2 12.3 5.4 12.3 6.9 12.3 5.4 11.1 4.2 9.6 4.2 11.1 4.2 12.3 3 12.3 1.5Z'
}"/>`);

// 40 tsconfig — SILHOUETTE, cog in the canon TS blue (family tie, different archetype).
{
	const R = 6.4, r = 5.05, hub = 2.05, teeth = 8;
	const P = [];
	const at = (rad, deg) => [8 + rad * Math.cos(deg * Math.PI / 180), 8 + rad * Math.sin(deg * Math.PI / 180)];
	for (let i = 0; i < teeth; i++) {
		const a = i * (360 / teeth);
		P.push(at(r, a - 13.5), at(R, a - 9), at(R, a + 9), at(r, a + 13.5));
	}
	icons.tsconfig = svg(`<path fill="#3178C6" fill-rule="evenodd" d="${poly(P) + circ(8, 8, hub)}"/>`);
}

// 41 vite — SILHOUETTE, bolt.
icons.vite = svg(`<path fill="#A96BD8" d="${
	poly([[10.4, 1.5], [2.9, 9.5], [7.1, 9.5], [5.7, 14.5], [13.1, 6.4], [8.9, 6.4]])
}"/>`);

// 42 tailwind — SILHOUETTE, the two offset waves.
{
	const wave = (x0, cy) => ribbon(
		(t) => [x0 + t * 12, cy + 1.55 * Math.sin(2 * Math.PI * t)], 0, 1, 12, 1.2);
	icons.tailwind = svg(`<path fill="#3FAFC4" d="${wave(2.6, 5.4) + wave(1.4, 10.6)}"/>`);
}

// 43 text — GLYPH, a paragraph of rules (last line short).
icons.text = svg(`<path fill="#95918C" d="${
	'M1.6 3.55H14.4V5.05H1.6Z M1.6 7.25H14.4V8.75H1.6Z M1.6 10.95H10.2V12.45H1.6Z'.replace(/ M/g, 'M')
}"/>`);

// 44 csharp — BADGE.
icons.csharp = svg(PLATE('#3E8F4A') + letters({ text: 'C#', cap: 5.3, baseline: 11.43 }, '#FFFFFF'));

// 45 php — BADGE, lowercase wordmark (the canon npm badge sanctions lowercase).
icons.php = svg(PLATE('#6A7BC8') + letters({ text: 'php', xheight: 3.45, baseline: 10.39 }, '#FFFFFF'));

// 46 ruby — SILHOUETTE, cut gem.
icons.ruby = svg(`<path fill="#A94152" d="${
	poly([[5, 3.2], [11, 3.2], [13.6, 6.9], [8, 14.3], [2.4, 6.9]])
}"/>`);

// 47 kotlin — BADGE.
icons.kotlin = svg(PLATE('#9A5FBE') + letters({ text: 'KT', cap: 5.5, baseline: 11.52 }, '#FFFFFF'));

// 48 dartlang — SILHOUETTE, a thrown dart (a plain arrowhead read as "play").
icons.dartlang = svg(`<path fill="#35709E" d="${
	poly([[14.5, 1.8], [1.5, 8.6], [6.9, 9.9], [7.7, 14.2]])
}"/>`);

// 30 swift — SILHOUETTE, the swift in flight.
icons.swift = svg(`<path fill="#DD6E5B" d="${
	'M2.1 2.2C5.6 3 8.5 4.7 10.6 7.1 9.2 4.9 7 3.1 4.2 1.8 7.9 2.6 11.1 4.7 13.1 7.7' +
	'C13.7 6.5 13.9 5.1 13.6 3.6 15 6.3 15.2 9.2 14.1 11.5 14.5 12.5 14.5 13.5 14.1 14.4' +
	'13.5 13.2 12.2 12.9 11 13.4 9.1 14.2 6.5 14 4 12.4 2.7 11.6 1.8 10.6 1.3 9.6' +
	'3.2 11 6 11.6 8.7 10.7 6.1 9.5 3.7 6.6 2.1 2.2Z'
}"/>`);

// ---- write -----------------------------------------------------------------
let total = 0;
for (const [id, src] of Object.entries(icons)) {
	writeFileSync(join(OUT, `${id}.svg`), src, 'utf8');
	total += Buffer.byteLength(src);
	console.log(String(Buffer.byteLength(src)).padStart(5), id);
}
console.log(`${Object.keys(icons).length} icons, ${total} bytes, avg ${Math.round(total / Object.keys(icons).length)}`);
