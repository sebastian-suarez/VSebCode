// emblems.mjs — the 40 folder emblems, authored in a 0..10 field.
//
// One family, one weight: every mark is a single flat shape (or a small union /
// knock-out of shapes) built from the same vocabulary — solid body, 2.0-2.6 unit
// stem, 1.2-1.8 unit counter-gap. At the closed scale (k = .65) that is a
// 1.3-1.7 px limb and a .8-1.2 px gap.

import { rect, circle, ellipse, poly, thick, bar, chevron, gear, letter } from './geom.mjs';

const cat = (...xs) => [].concat(...xs);

// ---- palette ---------------------------------------------------------------
// The emblem sits ON the tan folder (#BF9354), not on #121314, so "quiet" means
// darker than the base, never brighter. NEUTRAL is the spec's muted-band grey
// (#979CA3, the lock) taken down to sit under the tan.
export const NEUTRAL = '#4E545B';
export const COLORS = {
	neutral: NEUTRAL,
	node: '#3D7A31',      // brand #5FA04E, deepened for the tan ground
	git: '#9C3A1F',       // brand #F05032 — same hue family as the tan, so deepened hard
	vscode: '#0A5081',    // brand #007ACC, deepened
	docker: '#1E6EA8',    // brand #2496ED, deepened (kept a step lighter than vscode)
	next: '#2E3236',      // brand #000000, lifted off pure black
	github: '#34383D'     // no brandColor; the mark's near-black, dimmed
};

// ---- the roster ------------------------------------------------------------
// id, colour, colour source, emblem description, geometry, fill-rule
export const EMBLEMS = [
	{
		id: 'src', color: NEUTRAL, src: 'no brand → neutral',
		desc: 'angle brackets < >',
		d: () => cat(
			chevron(0.2, 5, 4.0, 4.4, 2.2),
			chevron(9.8, 5, 6.0, 4.4, 2.2)
		)
	},
	{
		id: 'node', color: COLORS.node, src: 'brand #5FA04E → #3D7A31',
		desc: 'node hexagon',
		d: () => poly([[5, 0], [9.33, 2.5], [9.33, 7.5], [5, 10], [0.67, 7.5], [0.67, 2.5]])
	},
	{
		id: 'dist', color: NEUTRAL, src: 'no brand → neutral',
		desc: 'down arrow onto a baseline (build output)',
		d: () => cat(
			rect(3.9, 0, 2.2, 3.6),
			poly([[1.7, 3.4], [8.3, 3.4], [5, 6.9]]),
			rect(1, 8.4, 8, 1.6, 0.4)
		)
	},
	{
		id: 'test', color: NEUTRAL, src: 'no brand → neutral',
		desc: 'check mark',
		d: () => thick([[0.9, 5.5], [3.8, 8.3], [9.1, 1.9]], 1.2)
	},
	{
		id: 'docs', color: NEUTRAL, src: 'no brand → neutral',
		desc: 'page with a folded corner, two text lines',
		evenodd: true,
		d: () => cat(
			[['M', 1.3, 0.3], ['L', 5.9, 0.3], ['L', 8.7, 3.1], ['L', 8.7, 9.7], ['L', 1.3, 9.7], ['Z']],
			rect(2.8, 5, 4.4, 1.6),
			rect(2.8, 7.4, 4.4, 1.6)
		)
	},
	{
		id: 'assets', color: NEUTRAL, src: 'no brand → neutral',
		desc: 'gem / diamond',
		d: () => poly([[5, 0.2], [9.6, 5], [5, 9.8], [0.4, 5]])
	},
	{
		id: 'images', color: NEUTRAL, src: 'no brand → neutral',
		desc: 'two peaks and a sun',
		d: () => cat(
			poly([[0.2, 9.8], [3.4, 3.4], [6.6, 9.8]]),
			poly([[5.2, 9.8], [7.6, 5.2], [10, 9.8]]),
			circle(8.3, 2.1, 1.6)
		)
	},
	{
		id: 'components', color: NEUTRAL, src: 'no brand → neutral',
		desc: 'puzzle piece — one nub, one notch',
		d: () => [
			['M', 0.6, 1.7], ['L', 2.8, 1.7], ['A', 1.6, 1.6, 0, 0, 0, 6, 1.7],
			['L', 8, 1.7], ['L', 8, 3.7], ['A', 1.6, 1.6, 0, 0, 1, 8, 6.9],
			['L', 8, 9.3], ['L', 0.6, 9.3], ['Z']
		]
	},
	{
		id: 'config', color: NEUTRAL, src: 'no brand → neutral',
		desc: 'six-tooth gear',
		evenodd: true,
		d: () => cat(gear(5, 5, 5, 3.3, 6, 0.52), circle(5, 5, 1.65))
	},
	{
		id: 'git', color: COLORS.git, src: 'brand #F05032 → #9C3A1F',
		desc: 'branch fork — three commit nodes',
		d: () => cat(
			bar([5, 8.1], [5, 5.4], 1.8),
			bar([5, 5.9], [2.2, 2.3], 1.8),
			bar([5, 5.9], [7.8, 2.3], 1.8),
			circle(5, 8.1, 1.9), circle(2.2, 2.3, 1.9), circle(7.8, 2.3, 1.9)
		)
	},
	{
		id: 'github', color: COLORS.github, src: 'no brandColor → dimmed near-black #34383D',
		desc: 'octocat head — round head, two ears',
		d: () => cat(
			circle(5, 6, 3.8),
			poly([[1.9, 4], [2.5, 0.7], [5, 2.8]]),
			poly([[8.1, 4], [5, 2.8], [7.5, 0.7]])
		)
	},
	{
		id: 'vscode', color: COLORS.vscode, src: 'brand #007ACC → #0A5081',
		desc: 'VS Code ribbon',
		d: () => poly([[6.65, 0.1], [9.8, 1.6], [9.8, 8.4], [6.65, 9.9], [0.6, 6.2], [0.6, 3.8]])
	},
	{
		id: 'public', color: NEUTRAL, src: 'no brand → neutral',
		desc: 'browser window',
		evenodd: true,
		d: () => cat(
			rect(0.2, 0.9, 9.6, 8.2, 1.2),
			rect(0.2, 3.2, 9.6, 1.1),
			circle(2, 2.05, 0.62), circle(3.9, 2.05, 0.62)
		)
	},
	{
		id: 'scripts', color: NEUTRAL, src: 'no brand → neutral',
		desc: 'shell prompt >_',
		d: () => cat(
			chevron(4.9, 4.4, 0.6, 3.9, 2.2),
			rect(5.6, 8.1, 4, 1.7, 0.3)
		)
	},
	{
		id: 'types', color: NEUTRAL, src: 'no brand → neutral',
		desc: 'letter T (Inter Bold outline)',
		d: () => letter('T', 8.6, 5, 5)
	},
	{
		id: 'hooks', color: NEUTRAL, src: 'no brand → neutral',
		desc: 'hook',
		d: () => [
			['M', 6.4, 0.4], ['L', 8.6, 0.4], ['L', 8.6, 6], ['A', 3.6, 3.6, 0, 0, 1, 1.4, 6],
			['L', 1.4, 4.6], ['L', 3.6, 4.6], ['L', 3.6, 6], ['A', 1.4, 1.4, 0, 0, 0, 6.4, 6], ['Z']
		]
	},
	{
		id: 'utils', color: NEUTRAL, src: 'no brand → neutral',
		desc: 'toolbox with a handle',
		evenodd: true,
		d: () => cat(
			rect(0.5, 3.8, 9, 5.6, 0.9),
			rect(3.2, 1.2, 3.6, 2.6, 0.6),
			rect(4.3, 2.3, 1.4, 1.5)
		)
	},
	{
		id: 'library', color: NEUTRAL, src: 'no brand → neutral',
		desc: 'open book',
		d: () => cat(
			poly([[0.5, 2.5], [4.3, 1.3], [4.3, 8.5], [0.5, 9.5]]),
			poly([[9.5, 2.5], [9.5, 9.5], [5.7, 8.5], [5.7, 1.3]])
		)
	},
	{
		id: 'api', color: NEUTRAL, src: 'no brand → neutral',
		desc: 'plug',
		d: () => cat(
			rect(3.1, 0.2, 1.5, 2.6, 0.3),
			rect(5.9, 0.2, 1.5, 2.6, 0.3),
			rect(1.6, 2.6, 6.8, 4, 0.7),
			rect(4, 6.6, 2, 3.2, 0.5)
		)
	},
	{
		id: 'styles', color: NEUTRAL, src: 'no brand → neutral',
		desc: 'paint brush',
		d: () => cat(
			bar([9.2, 1], [5.6, 4.6], 1.9),
			bar([5.3, 4.6], [3, 6.9], 3.1),
			poly([[3.3, 6.4], [4.4, 7.5], [0.7, 9.9]])
		)
	},
	{
		id: 'app', color: NEUTRAL, src: 'no brand → neutral',
		desc: '2x2 app grid',
		d: () => cat(
			rect(0, 0, 4.1, 4.1, 0.9), rect(5.9, 0, 4.1, 4.1, 0.9),
			rect(0, 5.9, 4.1, 4.1, 0.9), rect(5.9, 5.9, 4.1, 4.1, 0.9)
		)
	},
	{
		id: 'view', color: NEUTRAL, src: 'no brand → neutral',
		desc: 'eye',
		evenodd: true,
		d: () => cat(
			[['M', 0.2, 5], ['Q', 5, 0.4, 9.8, 5], ['Q', 5, 9.6, 0.2, 5], ['Z']],
			circle(5, 5, 1.9)
		)
	},
	{
		id: 'server', color: NEUTRAL, src: 'no brand → neutral',
		desc: 'two rack units with status slots',
		evenodd: true,
		d: () => cat(
			rect(0.3, 1.1, 9.4, 3.4, 0.8), rect(1.5, 2.3, 1.3, 1),
			rect(0.3, 5.5, 9.4, 3.4, 0.8), rect(1.5, 6.7, 1.3, 1)
		)
	},
	{
		id: 'db', color: NEUTRAL, src: 'no brand → neutral',
		desc: 'database cylinder with a rim line',
		evenodd: true,
		d: () => cat(
			[['M', 0.7, 2.4], ['A', 4.3, 2.2, 0, 0, 0, 9.3, 2.4], ['L', 9.3, 7.6],
				['A', 4.3, 2.2, 0, 0, 1, 0.7, 7.6], ['Z']],
			[['M', 0.7, 2.4], ['A', 4.3, 2.2, 0, 0, 1, 9.3, 2.4], ['L', 9.3, 3.7],
				['A', 4.3, 2.2, 0, 0, 1, 0.7, 3.7], ['Z']]
		)
	},
	{
		id: 'route', color: NEUTRAL, src: 'no brand → neutral',
		desc: 'map pin',
		evenodd: true,
		d: () => cat(
			[['M', 1.5, 3.7], ['A', 3.5, 3.5, 0, 1, 1, 8.5, 3.7],
				['C', 8.5, 6.3, 5, 9.9, 5, 9.9], ['C', 5, 9.9, 1.5, 6.3, 1.5, 3.7], ['Z']],
			circle(5, 3.6, 1.4)
		)
	},
	{
		id: 'layout', color: NEUTRAL, src: 'no brand → neutral',
		desc: 'layout wireframe — sidebar and two panes',
		d: () => cat(
			rect(0.4, 0.8, 3.2, 8.4, 0.5),
			rect(5, 0.8, 4.6, 3.6, 0.5),
			rect(5, 5.6, 4.6, 3.6, 0.5)
		)
	},
	{
		id: 'model', color: NEUTRAL, src: 'no brand → neutral',
		desc: 'entity diagram — one block over two',
		d: () => cat(
			rect(2.9, 0.5, 4.2, 3.1, 0.5),
			rect(0.1, 6.4, 4.2, 3.1, 0.5),
			rect(5.7, 6.4, 4.2, 3.1, 0.5)
		)
	},
	{
		id: 'middleware', color: NEUTRAL, src: 'no brand → neutral',
		desc: 'three layers, the middle one inset',
		d: () => cat(
			rect(0.4, 0.4, 9.2, 2.2, 0.5),
			rect(2.6, 3.9, 4.8, 2.2, 0.5),
			rect(0.4, 7.4, 9.2, 2.2, 0.5)
		)
	},
	{
		id: 'services', color: NEUTRAL, src: 'no brand → neutral',
		desc: 'cloud',
		d: () => cat(
			rect(0.8, 6, 8.4, 3.2, 1.6),
			circle(3.4, 5.2, 2.7),
			circle(6.7, 5.6, 2.4)
		)
	},
	{
		id: 'next', color: COLORS.next, src: 'brand #000000 → #2E3236',
		desc: 'Next.js disc with a knocked-out N',
		evenodd: true,
		d: () => cat(circle(5, 5, 4.9), letter('N', 5.6, 5, 5))
	},
	{
		id: 'docker', color: COLORS.docker, src: 'brand #2496ED → #1E6EA8',
		desc: 'two containers on a hull',
		d: () => cat(
			rect(2.3, 1.5, 2.6, 2.6, 0.3),
			rect(5.7, 1.5, 2.6, 2.6, 0.3),
			[['M', 0.6, 5.2], ['L', 9.4, 5.2], ['L', 9.4, 7.2],
				['A', 4.4, 2.4, 0, 0, 1, 0.6, 7.2], ['Z']]
		)
	},
	{
		id: 'coverage', color: NEUTRAL, src: 'no brand → neutral',
		desc: 'pie chart with a missing quadrant',
		d: () => [
			['M', 5, 0.2], ['A', 4.8, 4.8, 0, 1, 0, 9.8, 5], ['L', 5, 5], ['Z']
		]
	},
	{
		id: 'i18n', color: NEUTRAL, src: 'no brand → neutral',
		desc: 'speech bubble',
		d: () => cat(
			rect(0.4, 0.6, 9.2, 7, 2),
			poly([[2.4, 6.4], [5.4, 6.4], [2.4, 9.8]])
		)
	},
	{
		id: 'fonts', color: NEUTRAL, src: 'no brand → neutral',
		desc: 'letter A (Inter Bold outline)',
		d: () => letter('A', 8.8, 5, 5)
	},
	{
		id: 'template', color: NEUTRAL, src: 'no brand → neutral',
		desc: 'duplicated sheets',
		d: () => cat(
			// the sheet behind, reduced to the L-strip that clears the front one
			[['M', 4.1, 0.4], ['L', 8.9, 0.4], ['A', 0.7, 0.7, 0, 0, 1, 9.6, 1.1],
				['L', 9.6, 5.9], ['A', 0.7, 0.7, 0, 0, 1, 8.9, 6.6], ['L', 7.7, 6.6],
				['L', 7.7, 2.3], ['L', 3.4, 2.3], ['L', 3.4, 1.1],
				['A', 0.7, 0.7, 0, 0, 1, 4.1, 0.4], ['Z']],
			rect(0.4, 3.4, 6.2, 6.2, 0.7)
		)
	},
	{
		id: 'theme', color: NEUTRAL, src: 'no brand → neutral',
		desc: 'colour drop',
		d: () => [
			['M', 5, 0.2], ['C', 7.2, 3, 9.2, 4.4, 9.2, 5.6],
			['A', 4.2, 4.2, 0, 0, 1, 0.8, 5.6], ['C', 0.8, 4.4, 2.8, 3, 5, 0.2], ['Z']
		]
	},
	{
		id: 'log', color: NEUTRAL, src: 'no brand → neutral',
		desc: 'three record lines',
		d: () => cat(
			rect(0.6, 1.2, 8.8, 1.7, 0.4),
			rect(0.6, 4.15, 8.8, 1.7, 0.4),
			rect(0.6, 7.1, 5.4, 1.7, 0.4)
		)
	},
	{
		id: 'temp', color: NEUTRAL, src: 'no brand → neutral',
		desc: 'hourglass',
		d: () => cat(
			rect(0.5, 0.2, 9, 1.5, 0.3),
			poly([[1.2, 1.7], [8.8, 1.7], [5.6, 5], [8.8, 8.3], [1.2, 8.3], [4.4, 5]]),
			rect(0.5, 8.3, 9, 1.5, 0.3)
		)
	},
	{
		id: 'mock', color: NEUTRAL, src: 'no brand → neutral',
		desc: 'pencil',
		d: () => cat(
			bar([9, 1.2], [3.3, 6.9], 2.9),
			poly([[2.1, 6.1], [3.9, 7.9], [0.4, 9.6]])
		)
	},
	{
		id: 'package', color: NEUTRAL, src: 'no brand → neutral',
		desc: 'box with a lid seam',
		evenodd: true,
		d: () => cat(
			rect(0.6, 1.2, 8.8, 8.2, 0.9),
			rect(0.6, 3.8, 8.8, 1.4)
		)
	}
];
