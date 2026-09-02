#!/usr/bin/env node
// F06-gen.mjs — folder slice F06 (M11 long-tail wave).
//
// Every emblem is authored once in a 0-10 field (R9a) and placed by ONE uniform
// scale + translate into each variant's box:
//   closed  8.20 box at x 5.30-13.50, y 4.60-12.80   ->  X = 5.30 + .82x, Y = 4.60 + .82y
//   open    5.80 box at x  7.26-13.06, y 6.75-12.55  ->  X = 7.26 + .58x, Y = 6.75 + .58y
// The canon tan bases are byte-identical copies of svg/folder/folder{,-open}.svg.

import { writeFileSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { letterPath } from '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/tools/letterpath.mjs';

const OUT = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/svg/folder';

// ---- canon bases, lifted verbatim from folder.svg / folder-open.svg -------------
const SRC = readFileSync(join(OUT, 'folder.svg'), 'utf8');
const SRCO = readFileSync(join(OUT, 'folder-open.svg'), 'utf8');
const HEAD = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">';
const BASE = SRC.slice(HEAD.length, SRC.lastIndexOf('</svg>'));
const BASE_O = SRCO.slice(HEAD.length, SRCO.lastIndexOf('</svg>'));

// ---- placement ------------------------------------------------------------------
const BOX = {
	closed: { s: 0.82, ox: 5.30, oy: 4.60 },
	open: { s: 0.58, ox: 7.26, oy: 6.75 }
};

const num = (v) => {
	let s = (Math.round(v * 100) / 100).toFixed(2);
	s = s.replace(/0+$/, '').replace(/\.$/, '');
	if (s === '-0') { s = '0'; }
	return s.replace(/^(-?)0\./, '$1.');
};

// signed area in field units; > 0 matches the rect/circle "solid" winding used here.
function area(pts) {
	let a = 0;
	for (let i = 0; i < pts.length; i++) {
		const [x1, y1] = pts[i]; const [x2, y2] = pts[(i + 1) % pts.length];
		a += x1 * y2 - x2 * y1;
	}
	return a / 2;
}

function mk(kind) {
	const { s, ox, oy } = BOX[kind];
	const P = (x, y) => `${num(ox + s * x)} ${num(oy + s * y)}`;
	const R = (r) => num(s * r);
	const g = {
		P, R, s,
		// polygon; hole=true flips the winding so nonzero subtracts it
		poly(pts, hole = false) {
			const p = (area(pts) > 0) === !hole ? pts : [...pts].reverse();
			return 'M' + p.map(([x, y]) => P(x, y)).join('L') + 'Z';
		},
		rect(x1, y1, x2, y2, hole = false) {
			return g.poly([[x1, y1], [x2, y1], [x2, y2], [x1, y2]], hole);
		},
		rrect(x1, y1, x2, y2, r, hole = false) {
			const sw = hole ? 0 : 1;
			const A = (x, y) => `A${R(r)} ${R(r)} 0 0 ${sw} ${P(x, y)}`;
			if (hole) {
				return `M${P(x1 + r, y1)}${A(x1, y1 + r)}L${P(x1, y2 - r)}${A(x1 + r, y2)}` +
					`L${P(x2 - r, y2)}${A(x2, y2 - r)}L${P(x2, y1 + r)}${A(x2 - r, y1)}Z`;
			}
			return `M${P(x1 + r, y1)}L${P(x2 - r, y1)}${A(x2, y1 + r)}L${P(x2, y2 - r)}` +
				`${A(x2 - r, y2)}L${P(x1 + r, y2)}${A(x1, y2 - r)}L${P(x1, y1 + r)}Z`;
		},
		circle(cx, cy, r, hole = false) {
			const sw = hole ? 0 : 1;
			return `M${P(cx - r, cy)}A${R(r)} ${R(r)} 0 0 ${sw} ${P(cx + r, cy)} ` +
				`${R(r)} ${R(r)} 0 0 ${sw} ${P(cx - r, cy)}Z`;
		},
		// polar helper around (cx,cy); degrees, y-down (90 = below centre)
		pt(cx, cy, a, r) { const t = a * Math.PI / 180; return [cx + r * Math.cos(t), cy + r * Math.sin(t)]; },
		// annulus sector from a0 to a1 sweeping clockwise on screen (increasing angle)
		band(cx, cy, a0, a1, rOut, rIn) {
			const laf = (a1 - a0) > 180 ? 1 : 0;
			const o0 = g.pt(cx, cy, a0, rOut), o1 = g.pt(cx, cy, a1, rOut);
			const i1 = g.pt(cx, cy, a1, rIn), i0 = g.pt(cx, cy, a0, rIn);
			return `M${P(...o0)}A${R(rOut)} ${R(rOut)} 0 ${laf} 1 ${P(...o1)}` +
				`L${P(...i1)}A${R(rIn)} ${R(rIn)} 0 ${laf} 0 ${P(...i0)}Z`;
		}
	};
	return g;
}

// ---- the slice ------------------------------------------------------------------
// id: [fill, emblem(g) -> subpath[], description, colour source, evenodd?]
const N = '#4E545B';

const VUE = '#276B54';

const E = {
	spin: [N, (g) => [
		g.band(5, 5, -10, 250, 4.6, 2.6),
		g.poly([g.pt(5, 5, 250, 1.5), g.pt(5, 5, 250, 5.0), g.pt(5, 5, 288, 3.6)])
	], 'broken ring + arrowhead (rotation)', 'no brand → neutral'],

	'src-tauri': [N, (g) => [
		g.rrect(0, 0.9, 10, 9.1, 1.2),
		g.rect(2, 2.9, 8, 5.2, true)
	], 'app-window frame with a content slot (tauri file mark reduced)', 'tauri #D19A3C rejected (tan-hue clash) → neutral'],

	sso: [N, (g) => [
		g.circle(3, 5, 3),
		g.circle(3, 5, 1, true),
		g.rect(5.4, 4, 10, 6),
		g.rect(7.8, 6, 9.8, 7.8)
	], 'key: ringed bow, shaft, one tooth', 'no brand → neutral'],

	stack: [N, (g) => [
		g.poly([[5, 0.2], [10, 2.2], [5, 4.2], [0, 2.2]]),
		g.poly([[0, 5.6], [5, 7.6], [10, 5.6], [10, 7.8], [5, 9.8], [0, 7.8]])
	], 'layers: lead rhombus over a chevron band', 'no brand → neutral'],

	stencil: [N, (g) => [
		g.rrect(0, 0.6, 10, 9.4, 1.4),
		g.poly([[5, 2.8], [7.6, 7], [2.4, 7]], true)
	], 'stencil plate with a punched triangle', 'no brand → neutral'],

	store: [N, (g) => [
		`M${g.P(1.8, 4.6)}L${g.P(1.8, 4)}A${g.R(3.2)} ${g.R(3.2)} 0 0 1 ${g.P(8.2, 4)}` +
		`L${g.P(8.2, 4.6)}L${g.P(6.2, 4.6)}L${g.P(6.2, 4)}A${g.R(1.2)} ${g.R(1.2)} 0 0 0 ${g.P(3.8, 4)}` +
		`L${g.P(3.8, 4.6)}Z`,
		g.rrect(0.2, 3.9, 9.8, 10, 1.2)
	], 'shopping bag: looped handle over a body', 'no brand → neutral'],

	story: [null, null, '', ''], // filled in below (custom outline)

	stylus: ['#33383D', (g) => [
		`M${g.P(5, 0.2)}C${g.P(7.2, 3)} ${g.P(9.2, 4.4)} ${g.P(9.2, 5.6)}` +
		`A${g.R(4.2)} ${g.R(4.2)} 0 0 1 ${g.P(0.8, 5.6)}` +
		`C${g.P(0.8, 4.4)} ${g.P(2.8, 3)} ${g.P(5, 0.2)}Z`,
		`M${g.P(5, 3)}C${g.P(3.9, 4.6)} ${g.P(3, 5.2)} ${g.P(3, 5.8)}` +
		`A${g.R(2)} ${g.R(2)} 0 0 0 ${g.P(7, 5.8)}` +
		`C${g.P(7, 5.2)} ${g.P(6.1, 4.6)} ${g.P(5, 3)}Z`
	], 'hollow ink droplet (outlined against the solid theme drop)', 'brand #333333 → #33383D'],

	sublime: [N, null, 'letterpath “S” (Sublime wordmark)', 'brand #FF9800 rejected (tan-hue clash) → neutral'],

	syntax: [N, (g) => [
		g.rect(0, 1, 10, 4.2),
		g.poly([[0, 7.3], [2.5, 5.5], [5, 7.3], [7.5, 5.5], [10, 7.3],
			[10, 9.8], [7.5, 8], [5, 9.8], [2.5, 8], [0, 9.8]])
	], 'word bar over a spellcheck zigzag', 'no brand → neutral'],

	target: [N, (g) => [
		g.circle(5, 5, 5), g.circle(5, 5, 3, true), g.circle(5, 5, 1.4)
	], 'bullseye: ring + centre dot', 'no brand → neutral'],

	taskfile: [N, (g) => [
		g.poly([[1.6, 0.4], [9.4, 5], [1.6, 9.6]])
	], 'run triangle (task runner)', 'no brand → neutral'],

	tasks: [N, (g) => [
		g.rrect(0.6, 1.4, 9.4, 10, 1.2),
		g.rrect(3, 0, 7, 2.8, 0.9),
		g.rect(2.6, 3.7, 7.4, 5.1, true),
		g.rect(2.6, 6.3, 7.4, 7.7, true)
	], 'clipboard with two ruled lines', 'no brand → neutral'],

	telegram: ['#186C96', (g) => [
		g.poly([[10, 0.3], [0, 4.6], [3.4, 6], [3.4, 10], [5.6, 7.4]])
	], 'paper plane', 'brand #26A5E4 → #186C96'],

	television: [N, (g) => [
		g.rrect(0, 3.2, 10, 10, 1.2),
		g.poly([[3.6, 3.4], [6.3, 3.4], [3.6, 0.2], [0.9, 0.2]]),
		g.poly([[6.4, 3.4], [3.7, 3.4], [6.4, 0.2], [9.1, 0.2]])
	], 'TV set: screen with rabbit-ear antennae', 'no brand → neutral'],

	toc: [N, (g) => [
		g.circle(1, 1.4, 1), g.rect(3.4, 0.4, 10, 2.4),
		g.circle(1, 5, 1), g.rect(3.4, 4, 10, 6),
		g.circle(1, 8.6, 1), g.rect(3.4, 7.6, 7.6, 9.6)
	], 'bulleted contents list', 'no brand → neutral'],

	// R11: the jaw and the ring's counter are ONE hole subpath — two overlapping
	// reverse-wound holes would repaint their intersection under nonzero.
	tools: [N, (g) => [
		g.circle(2.8, 2.8, 2.8),
		`M${g.P(...g.pt(2.8, 2.8, 250, 0.8))}L${g.P(...g.pt(2.8, 2.8, 250, 2.8))}` +
		`A${g.R(2.8)} ${g.R(2.8)} 0 0 0 ${g.P(...g.pt(2.8, 2.8, 200, 2.8))}` +
		`L${g.P(...g.pt(2.8, 2.8, 200, 0.8))}` +
		`A${g.R(0.8)} ${g.R(0.8)} 0 1 0 ${g.P(...g.pt(2.8, 2.8, 250, 0.8))}Z`,
		g.poly([[4.85, 3.15], [9.65, 7.95], [7.95, 9.65], [3.15, 4.85]])
	], 'open-end wrench', 'no brand → neutral'],

	trash: [N, (g) => [
		g.rrect(0, 0, 10, 2, 0.5),
		g.poly([[1.2, 3.2], [8.8, 3.2], [7.9, 10], [2.1, 10]])
	], 'bin: lid bar over a tapered can', 'no brand → neutral'],

	travis: ['#226B6F', (g) => [
		g.rect(4, 0, 6, 2.8),
		g.rrect(0, 2.2, 10, 9.6, 1.6),
		g.circle(3, 5.4, 1, true),
		g.circle(7, 5.4, 1, true)
	], 'build-bot head with an antenna', 'brand #3EAAAF → #226B6F'],

	trigger: [N, (g) => [
		`M${g.P(1.4, 7.6)}C${g.P(1.4, -1.4)} ${g.P(8.6, -1.4)} ${g.P(8.6, 7.6)}Z`,
		g.rrect(0.2, 7.6, 9.8, 9.6, 0.6)
	], 'bell (event / webhook)', 'no brand → neutral'],

	trunk: [N, (g) => [
		g.poly([[5, 0], [8.6, 3.6], [1.4, 3.6]]),
		g.poly([[5, 2.4], [9.8, 7], [0.2, 7]]),
		g.rect(4, 6.6, 6, 10)
	], 'trunked conifer', 'no brand → neutral'],

	ui: [N, (g) => [
		g.poly([[1.6, 0.4], [1.6, 8.6], [3.9, 6.5], [5.6, 10], [7.6, 9.1], [6, 5.8], [9.4, 5.8]])
	], 'mouse pointer', 'no brand → neutral'],

	unity: ['#2B2F33', (g) => [
		g.poly([[5, 0.3], [9.2, 2.72], [9.2, 7.58], [5, 10], [0.8, 7.58], [0.8, 2.72]]),
		g.poly([[1.78, 2.42], [5, 4.28], [8.22, 2.42], [8.97, 3.72], [5.75, 5.58],
			[5.75, 9.3], [4.25, 9.3], [4.25, 5.58], [1.03, 3.72]], true)
	], 'isometric cube: hexagon with seamed faces', 'brand #000000 → #2B2F33'],

	update: [N, (g) => [
		g.poly([[0, 3.4], [5, 0], [10, 3.4], [10, 5.8], [5, 2.4], [0, 5.8]]),
		g.poly([[0, 7.6], [5, 4.2], [10, 7.6], [10, 10], [5, 6.6], [0, 10]])
	], 'double chevron up (upgrade)', 'no brand → neutral'],

	upload: [N, (g) => [
		g.poly([[5, 0], [8, 3], [2, 3]]),
		g.rect(4, 2.6, 6, 6.6),
		g.poly([[0, 6.4], [2, 6.4], [2, 8], [8, 8], [8, 6.4], [10, 6.4], [10, 10], [0, 10]])
	], 'arrow rising out of an open tray', 'no brand → neutral'],

	vagrant: ['#1450B8', (g) => [
		g.poly([[0, 1.2], [2.4, 1.2], [4.4, 8.6], [2, 8.6]]),
		g.poly([[10, 1.2], [7.6, 1.2], [5.6, 8.6], [8, 8.6]])
	], 'split “V” of two angled slabs', 'brand #1868F2 → #1450B8'],

	verdaccio: ['#2F6B4E', (g) => [
		g.circle(3.9, 5.5, 3.7),
		g.poly([[6.4, 3.4], [10, 5.5], [6.4, 7.6]]),
		g.circle(3.3, 4.4, 0.95, true)
	], 'parrot head (registry mascot)', 'no brand → #2F6B4E'],

	vitepress: ['#4A4FC4', (g) => [
		g.poly([[8.2, .8], [.6, 5.2], [4.2, 5.2], [2, 9.2], [9.6, 4.8], [6.8, 4.8]])
	], 'vite bolt', 'brand #646CFF → #4A4FC4'],

	vm: [N, (g) => [
		g.rrect(0, 0.4, 10, 9.6, 1.3),
		g.rect(2, 2.4, 8, 7.6, true),
		g.rrect(3.6, 3.8, 6.4, 6.2, 0.5)
	], 'machine inside a machine (nested frames)', 'no brand → neutral'],

	vs: ['#4A2A7A', (g) => [
		g.poly([[0, 1.2], [4.4, 5], [0, 8.8]]),
		g.poly([[10, 1.2], [5.6, 5], [10, 8.8]])
	], 'opposed ribbon halves (Visual Studio)', 'brand #5C2D91 → #4A2A7A'],

	'vscode-test': ['#0A5081', (g) => [
		g.rect(3.2, 0, 6.8, 2),
		g.poly([[3.8, 1.6], [6.2, 1.6], [6.2, 4], [9.6, 10], [0.4, 10], [3.8, 4]])
	], 'test flask', 'family with folder/vscode #0A5081'],

	'vue-directives': [VUE, (g) => [
		g.poly([[0, 0], [3.07, 0], [5, 3.96], [6.93, 0], [10, 0], [5, 10]])
	], 'vue chevron', 'brand #4CB392 → #276B54'],

	vuepress: [VUE, (g) => [
		g.poly([[0, 0], [3.07, 0], [5, 2.69], [6.93, 0], [10, 0], [5, 6.8]]),
		g.rect(0, 8, 10, 10)
	], 'vue chevron over a press baseline', 'brand #4CB392 → #276B54'],

	'vuex-store': [VUE, (g) => [
		`M${g.P(1.2, 1)}L${g.P(3, 1)}L${g.P(5, 4.4)}L${g.P(7, 1)}L${g.P(8.8, 1)}` +
		`A${g.R(1.2)} ${g.R(1.2)} 0 0 1 ${g.P(10, 2.2)}L${g.P(10, 8.4)}` +
		`A${g.R(1.2)} ${g.R(1.2)} 0 0 1 ${g.P(8.8, 9.6)}L${g.P(1.2, 9.6)}` +
		`A${g.R(1.2)} ${g.R(1.2)} 0 0 1 ${g.P(0, 8.4)}L${g.P(0, 2.2)}` +
		`A${g.R(1.2)} ${g.R(1.2)} 0 0 1 ${g.P(1.2, 1)}Z`
	], 'store box notched with the vue chevron', 'brand #4CB392 → #276B54'],

	wakatime: [N, (g) => [
		g.circle(5, 5, 5),
		g.poly([[4.3, 2.2], [5.7, 2.2], [5.7, 4.3], [7.6, 4.3], [7.6, 5.7], [4.3, 5.7]], true)
	], 'clock face with cut-out hands', 'no brand → neutral'],

	wasp: [N, (g) => [
		`M${g.P(3.2, 1.8)}L${g.P(7.6, 1.8)}L${g.P(10, 5)}L${g.P(7.6, 8.2)}L${g.P(3.2, 8.2)}` +
		`A${g.R(3.2)} ${g.R(3.2)} 0 0 1 ${g.P(3.2, 1.8)}Z`,
		g.rect(4.8, 1.8, 6.6, 8.2, true)
	], 'banded wasp abdomen', 'no brand → neutral'],

	windows: ['#0A5A96', (g) => [
		g.poly([[.6, 2.5], [4.6, 1.5], [4.6, 4.4], [.6, 4.4]]),
		g.poly([[5.8, 1.2], [9.8, .2], [9.8, 4.4], [5.8, 4.4]]),
		g.poly([[.6, 5.6], [4.6, 5.6], [4.6, 8.5], [.6, 7.5]]),
		g.poly([[5.8, 5.6], [9.8, 5.6], [9.8, 9.8], [5.8, 8.8]])
	], 'four-pane flag in perspective', 'brand #0078D4 → #0A5A96'],

	windsurf: [N, (g) => [
		`M${g.P(2.6, 0.2)}Q${g.P(8.2, 2.6)} ${g.P(8.8, 6.8)}L${g.P(2.6, 6.8)}Z`,
		g.rrect(0, 8, 10, 10, 0.9)
	], 'sail over a board', 'no brand → neutral'],

	wit: ['#4A3BB5', (g) => [
		g.rect(2.4, 0, 4.4, 3.8),
		g.rect(5.6, 0, 7.6, 3.8),
		g.rrect(1, 3.6, 9, 10, 1)
	], 'interface plug', 'wasm brand #654FF0 → #4A3BB5'],

	wordpress: ['#1A5E7D', (g) => [
		g.poly([[0, .8], [2.5, 5.2], [5, .8], [7.5, 5.2], [10, .8],
			[10, 4.85], [7.5, 9.25], [5, 4.85], [2.5, 9.25], [0, 4.85]])
	], 'drawn W (WordPress wordmark)', 'brand #21759B → #1A5E7D'],

	www: [N, (g) => {
		const c = (y1, y2, top) => {
			const hw = (y) => Math.sqrt(25 - (y - 5) ** 2);
			return top === 'cap-top'
				? `M${g.P(5 - hw(y2), y2)}A${g.R(5)} ${g.R(5)} 0 0 1 ${g.P(5 + hw(y2), y2)}Z`
				: top === 'cap-bottom'
					? `M${g.P(5 - hw(y1), y1)}A${g.R(5)} ${g.R(5)} 0 0 0 ${g.P(5 + hw(y1), y1)}Z`
					: `M${g.P(5 - hw(y1), y1)}A${g.R(5)} ${g.R(5)} 0 0 0 ${g.P(5 - hw(y2), y2)}` +
					`L${g.P(5 + hw(y2), y2)}A${g.R(5)} ${g.R(5)} 0 0 0 ${g.P(5 + hw(y1), y1)}Z`;
		};
		return [c(0, 2.8, 'cap-top'), c(4, 6, 'band'), c(7.2, 10, 'cap-bottom')];
	}, 'banded globe (three latitude slices)', 'no brand → neutral'],

	zeabur: [N, (g) => [
		g.rrect(0, 0.4, 10, 9.6, 1.5),
		g.poly([[2.4, 2.4], [7.6, 2.4], [7.6, 3.8], [4.9, 6.2], [7.6, 6.2], [7.6, 7.6],
			[2.4, 7.6], [2.4, 6.2], [5.1, 3.8], [2.4, 3.8]], true)
	], 'plate with a cut-out Z', 'no brand → neutral'],

	zed: ['#2B3038', (g) => [
		g.poly([[0, 0.6], [10, 0.6], [10, 2.8], [3.7, 7.2], [10, 7.2], [10, 9.4],
			[0, 9.4], [0, 7.2], [6.3, 2.8], [0, 2.8]])
	], 'drawn Z', 'no brand → #2B3038']
};

// story: the bookmark notch is cut into the book outline itself (a hole that
// touches the boundary would leave a hairline), so it needs a custom subpath.
E.story = ['#A33C76', (g) => [
	`M${g.P(1.6, 0)}L${g.P(5.6, 0)}L${g.P(5.6, 3)}L${g.P(6.5, 2.1)}L${g.P(7.4, 3)}` +
	`L${g.P(7.4, 0)}L${g.P(8.4, 0)}A${g.R(1)} ${g.R(1)} 0 0 1 ${g.P(9.4, 1)}` +
	`L${g.P(9.4, 9)}A${g.R(1)} ${g.R(1)} 0 0 1 ${g.P(8.4, 10)}L${g.P(1.6, 10)}` +
	`A${g.R(1)} ${g.R(1)} 0 0 1 ${g.P(0.6, 9)}L${g.P(0.6, 1)}` +
	`A${g.R(1)} ${g.R(1)} 0 0 1 ${g.P(1.6, 0)}Z`,
	g.rect(2.6, 2.2, 4, 7.8, true)
], 'book with a spine rule and a bookmark notch', 'brand #D0559B → #A33C76'];

// ---- letter emblems -------------------------------------------------------------
// cap heights are field units; both variants get the same mark, each mapped into
// its own box, so the letter is generated per variant at box scale.
const LETTERS = {
	sublime: { text: 'S', cap: 9.0 }
};

function letterFor(id, kind) {
	const spec = LETTERS[id];
	const { s, ox, oy } = BOX[kind];
	const cx = ox + s * 5, cy = oy + s * 5;
	if (spec.cap != null) {
		return letterPath({ text: spec.text, cap: spec.cap * s, cx, cy, band: 'cap', precision: 2 });
	}
	// width-constrained: probe at cap 10 and scale
	const probe = letterPath({ text: spec.text, cap: 10, cx, cy, band: 'cap' });
	const cap = 10 * (spec.inkWidth * s) / probe.ink.w;
	return letterPath({ text: spec.text, cap, cx, cy, band: 'cap', precision: 2 });
}

// ---- emit -----------------------------------------------------------------------
const manifest = [];
for (const [id, [fill, build, desc, source, evenodd]] of Object.entries(E)) {
	const rows = {};
	for (const kind of ['closed', 'open']) {
		let d, rule = '';
		if (build) {
			const g = mk(kind);
			d = build(g).join('');
			if (evenodd) { rule = ' fill-rule="evenodd"'; }
		} else {
			const lp = letterFor(id, kind);
			d = lp.d;
			rows.ink = lp.ink;
		}
		const emblem = `<path fill="${fill}"${rule} d="${d}"/>`;
		const body = (kind === 'closed' ? BASE : BASE_O) + emblem;
		const file = join(OUT, kind === 'closed' ? `${id}.svg` : `${id}-open.svg`);
		const svg = HEAD + body + '</svg>';
		writeFileSync(file, svg);
		rows[kind] = Buffer.byteLength(svg);
	}
	manifest.push({ id, fill, desc, source, bytes: rows.closed, bytesOpen: rows.open, ink: rows.ink });
}

writeFileSync(join(dirname(fileURLToPath(import.meta.url)), 'F06-manifest.json'),
	JSON.stringify(manifest, null, 1));
console.log(`wrote ${manifest.length * 2} files`);
for (const m of manifest) {
	if (m.ink) { console.log(`  ${m.id}: ink ${JSON.stringify(m.ink)}`); }
}
