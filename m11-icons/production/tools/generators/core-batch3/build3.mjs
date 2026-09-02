// build3.mjs — author the batch-3 (ranks 49-72) production SVGs.
// Local scratch tool: writes ../production/svg/file/<id>.svg only.

import { writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { letterPath } from '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/tools/letterpath.mjs';

const OUT = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/svg/file';

// ---- number + path helpers -------------------------------------------------
const n = (v) => {
	let s = (+v).toFixed(2);
	if (s.includes('.')) { s = s.replace(/0+$/, '').replace(/\.$/, ''); }
	if (s === '-0') { s = '0'; }
	return s.replace(/^(-?)0\./, '$1.');
};
const circ = (cx, cy, r) =>
	`M${n(cx - r)} ${n(cy)}a${n(r)} ${n(r)} 0 1 0 ${n(2 * r)} 0a${n(r)} ${n(r)} 0 1 0${n(-2 * r)} 0Z`;
const ell = (cx, cy, rx, ry) =>
	`M${n(cx - rx)} ${n(cy)}a${n(rx)} ${n(ry)} 0 1 0 ${n(2 * rx)} 0a${n(rx)} ${n(ry)} 0 1 0${n(-2 * rx)} 0Z`;
const box = (x, y, w, h) => `M${n(x)} ${n(y)}h${n(w)}v${n(h)}H${n(x)}Z`;
// repeat-command elision: "M a bL c d e f…Z"
const poly = (pts) => {
	const [h, ...t] = pts.map(([x, y]) => `${n(x)} ${n(y)}`);
	return `M${h}L${t.join(' ')}Z`.replace(/ -/g, '-');
};

// Translate an absolute-command path (used once, to re-cut json's braces for json5).
function translate(d, dx, dy) {
	const ARGS = { M: 2, L: 2, C: 6, S: 4, Q: 4, T: 2, H: 1, V: 1, A: 7, Z: 0 };
	const toks = d.match(/[A-Za-z]|-?\d*\.?\d+(?:e-?\d+)?/g);
	const out = [];
	let cmd = '';
	for (let i = 0; i < toks.length;) {
		if (/[A-Za-z]/.test(toks[i])) { cmd = toks[i++]; }
		if (cmd === 'Z' || cmd === 'z') { out.push('Z'); continue; }
		if (cmd !== cmd.toUpperCase()) { throw new Error('relative command in translate(): ' + cmd); }
		const k = ARGS[cmd];
		const a = toks.slice(i, i + k).map(Number);
		i += k;
		if (cmd === 'H') { a[0] += dx; }
		else if (cmd === 'V') { a[0] += dy; }
		else if (cmd === 'A') { a[5] += dx; a[6] += dy; }
		else { for (let j = 0; j < k; j += 2) { a[j] += dx; a[j + 1] += dy; } }
		out.push(cmd + a.map(n).join(' '));
	}
	return out.join('').replace(/ -/g, '-');
}

// ---- letterforms -----------------------------------------------------------
const L = (text, o) => letterPath({ text, cx: 8, ...o }).d;
// Badge law 1: baseline = 15 - .41 * (14 - cap)
const bl = (cap) => +(15 - 0.41 * (14 - cap)).toFixed(3);

const svg = (body) =>
	`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${body}</svg>`;
const plate = (fill) => `<rect x="1" y="1" width="14" height="14" rx="3" fill="${fill}"/>`;
const p = (fill, d, rule) => `<path fill="${fill}"${rule ? ` fill-rule="${rule}"` : ''} d="${d}"/>`;
const badge = (fill, ink, text, cap, ls = 0) =>
	svg(plate(fill) + p(ink, L(text, { cap, letterSpacing: ls, baseline: bl(cap) })));

const icons = {};

// 49 elixir — SILHOUETTE droplet, brand #4B275F lifted to a matte plum
icons.elixir = svg(p('#9A5FAD',
	'M8 1.6C10.3 4.6 13.2 6.3 13.2 9.4a5.2 5.2 0 0 1-10.4 0C2.8 6.3 5.7 4.6 8 1.6Z'));

// 50 haskell — GLYPH lambda
icons.haskell = svg(p('#8E80C6', L('λ', { inkHeight: 11.2, cy: 8, band: 'ink' })));

// 51 scala — SILHOUETTE two stacked ribbons ("stairs")
icons.scala = svg(p('#C93A4A',
	'M2.4 2.8C6.2 2.1 10.2 3.1 13.6 5v3.2C10.2 6.3 6.2 5.3 2.4 6Z' +
	'M2.4 7.2C6.2 6.5 10.2 7.5 13.6 9.4v3.2C10.2 10.7 6.2 9.7 2.4 10.4Z'));

// 52 lua — SILHOUETTE planet (with the logo's hole) + satellite moon
icons.lua = svg(p('#6C6ACB',
	circ(6.9, 9, 5.5) + circ(9.2, 6.4, 1.15) + circ(13, 3.4, 1.9), 'evenodd'));

// 53 perl — BADGE PL
icons.perl = badge('#5E6DB4', '#FFFFFF', 'PL', 5.5);

// 54 r — GLYPH bare R. The logo's grey torus behind a blue R turns to mud at 16 px
// (both walls land on 1.8 px and the letter crosses them), so only the R survives.
icons.r = svg(p('#3D6EC8', L('R', { cap: 9.6, baseline: 12.8 })));

// 55 julia — SILHOUETTE three dots (the Julia trio, desaturated)
icons.julia = svg(
	p('#C4534C', circ(8, 5.2, 2.9)) +
	p('#529A46', circ(4.7, 10.9, 2.9)) +
	p('#9968C4', circ(11.3, 10.9, 2.9)));

// 56 zig — GLYPH angular Z
icons.zig = svg(p('#D89238', 'M2.8 3H13.2v2.4L6.9 10.6H13.2V13H2.8v-2.4L9.1 5.4H2.8Z'));

// 57 nim — SILHOUETTE crown + base bar
icons.nim = svg(p('#C6C24C',
	poly([[1.4, 11.5], [1.4, 4.2], [5.05, 7.6], [8, 3.4], [10.95, 7.6], [14.6, 4.2], [14.6, 11.5]]) +
	box(1.4, 12.4, 13.2, 1.5)));

// 58 ocaml — SILHOUETTE dromedary
icons.ocaml = svg(p('#CC9038',
	'M1.9 10.6C1.9 8.6 2.6 7.1 3.9 6.2 4.9 4.9 6.3 4.1 7.8 4.1 9.4 4.1 10.5 5.1 10.9 6.6v4Z' +
	'M10.5 8.9C10.5 6.6 11 4.9 11.9 3.9V3h3v1.8l-1.5.6C12.9 6.2 12.7 7.4 12.7 8.9Z' +
	box(3.3, 10.2, 2, 3.4) + box(8.5, 10.2, 2, 3.4)));

// 59 clojure — BADGE CLJ (green half of the brand pair; the blue is TS/prisma territory)
icons.clojure = badge('#55AD6E', '#FFFFFF', 'CLJ', 4.5, -0.02);

// 60 erlang — GLYPH bare ERL
icons.erlang = svg(p('#B8455F', L('ERL', { cap: 5.2, baseline: 10.6 })));

// 61 fsharp — GLYPH bare F#
icons.fsharp = svg(p('#35A0A0', L('F#', { cap: 7, baseline: 11.5 })));

// 62 objectivec — BADGE OC (no brandColor)
icons.objectivec = badge('#A85596', '#FFFFFF', 'OC', 4.8);

// 63 assembly — GLYPH chip (no brandColor)
const pins = [5.5, 8, 10.5].flatMap(c => [
	box(c - 0.65, 2.2, 1.3, 1.7), box(c - 0.65, 12.1, 1.3, 1.7),
	box(2.2, c - 0.65, 1.7, 1.3), box(12.1, c - 0.65, 1.7, 1.3)
]).join('');
icons.assembly = svg(p('#4F9E7E',
	box(3.9, 3.9, 8.2, 8.2) + box(6.1, 6.1, 3.8, 3.8) + pins, 'evenodd'));

// 64 solidity — GLYPH sheared hourglass, brand #363636 lifted to a warm neutral
icons.solidity = svg(p('#B2B0AC',
	poly([[8.6, 2], [14, 6.2], [8.6, 7.6], [3.2, 6.2]]) +
	poly([[7.4, 14], [2, 9.8], [7.4, 8.4], [12.8, 9.8]])));

// 65 wasm — BADGE WA
icons.wasm = badge('#866ED6', '#FFFFFF', 'WA', 4.9, -0.045);

// 66 cheader — BADGE H, C's own plate colour flattened to a near-neutral slate
icons.cheader = badge('#A6ACB4', '#1B2026', 'H', 7);

// 67 cppheader — BADGE HPP, same family one value deeper
icons.cppheader = badge('#6F7982', '#FFFFFF', 'HPP', 4.15, -0.02);

// 68 graphql — GLYPH node triangle
const bar = (ax, ay, bx, by, w) => {
	const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy);
	const px = (dy / len) * (w / 2), py = (-dx / len) * (w / 2);
	return poly([[ax + px, ay + py], [bx + px, by + py], [bx - px, by - py], [ax - px, ay - py]]);
};
const A = [8, 3.4], B = [3.6, 11.2], C = [12.4, 11.2];
icons.graphql = svg(p('#C43E93',
	bar(...A, ...B, 1.5) + bar(...A, ...C, 1.5) + bar(...B, ...C, 1.5) +
	circ(...A, 1.7) + circ(...B, 1.7) + circ(...C, 1.7)));

// 69 protobuf — BADGE PB (no brandColor)
icons.protobuf = badge('#8CA24A', '#FFFFFF', 'PB', 5.5);

// 70 json5 — GLYPH: the json braces re-cut wider, with a 5 between them
const jsonSrc = readFileSync(join(OUT, 'json.svg'), 'utf8');
const jsonD = /<path fill="#D6C13C" d="([^"]+)"/.exec(jsonSrc)[1];
const [braceL, braceR] = jsonD.split(/(?=M9\.3 2)/);
icons.json5 = svg(p('#D6C13C',
	translate(braceL, -1.85, 0) + translate(braceR, 1.85, 0) +
	L('5', { cap: 6.4, baseline: 11.2 })));

// 71 sqlite — BADGE DB, deliberately in the sql cylinder's teal (database family)
icons.sqlite = badge('#35897E', '#FFFFFF', 'DB', 5.2, -0.02);

// 72 excel — SILHOUETTE spreadsheet grid
icons.excel = svg(p('#2F8F55',
	box(1.5, 3, 13, 2.2) +
	[6.2, 10.1].flatMap(y => [[1.5, 3.65], [6.15, 3.7], [10.85, 3.65]]
		.map(([x, w]) => box(x, y, w, 2.9))).join('')));

for (const [id, src] of Object.entries(icons)) {
	writeFileSync(join(OUT, `${id}.svg`), src + '\n', 'utf8');
	console.log(String(Buffer.byteLength(src) + 1).padStart(5), id);
}
