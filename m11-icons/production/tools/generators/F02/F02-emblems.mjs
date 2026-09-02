// F02-emblems.mjs — the 45 folder emblems of slice F02, authored in the 0–10 field.
// One simple flat mark each; neutral #4E545B unless a real brand earns its darkened hue.

import {
	poly, rect, rrect, circle, ellipse, bar, capsule, plus, arcBand, ellipseRing,
	star, insetPoly, fitPolys, P, M, L, C, A, Z
} from './F02-geom.mjs';

const N = '#4E545B';

// --- cubit: wireframe cube — hexagon ring + the three seams ------------------
// A solid 3-face cube loses its 16 px seams and becomes the node hexagon (R8);
// drawn as ink lines instead, every limb is 2.0 units (1.64 px) and survives.
function cube() {
	const T = [5, 0.3], UR = [9.7, 3.0], LR = [9.7, 7.2], B = [5, 9.9], LL = [0.3, 7.2],
		UL = [0.3, 3.0], Ctr = [5, 5.1];
	const k = 0.52;                        // inner hexagon: 2.0+ unit walls all round
	const to = (f) => ([x, y]) => [Ctr[0] + (x - Ctr[0]) * f, Ctr[1] + (y - Ctr[1]) * f];
	const seam = to(0.8);                  // stop inside the ring: the cap must not spill
	return [
		...poly([T, UR, LR, B, LL, UL]),
		...poly([T, UR, LR, B, LL, UL].map(to(k)), true),
		...bar(...Ctr, ...seam(UR), 2.0), ...bar(...Ctr, ...seam(UL), 2.0),
		...bar(...Ctr, ...seam(B), 2.0)
	];
}

export const EMBLEMS = {
	// ---- containers, structures ------------------------------------------------
	console: {
		fill: N, source: 'no brand → neutral',
		desc: 'gamepad — pill body, knocked-out d-pad and button (file/controller mark reduced)',
		d: [
			...rrect(0, 2.2, 10, 6.0, 2.6),
			...plus(3.2, 5.2, 3.8, 1.7, true), ...circle(7.6, 5.2, 1.2, true)
		]
	},
	constant: {
		fill: N, source: 'no brand → neutral',
		desc: 'pi — the unchanging value',
		d: [...rect(0.4, 1.0, 9.2, 2.2), ...rect(2.0, 3.2, 2.2, 5.8), ...rect(6.0, 3.2, 2.2, 5.8)]
	},
	container: {
		fill: N, source: 'no brand → neutral',
		desc: 'shipping container — ribbed box, three rib knock-outs',
		d: [
			...rrect(0, 2.2, 10, 6.0, 0.8),
			...rect(2.0, 3.5, 1.2, 3.4, true), ...rect(4.4, 3.5, 1.2, 3.4, true),
			...rect(6.8, 3.5, 1.2, 3.4, true)
		]
	},
	content: {
		fill: N, source: 'no brand → neutral',
		desc: 'article block — image square, two short lines, one full line',
		d: [
			...rrect(0, 1.55, 4.2, 4.2, 0.5),
			...rect(5.4, 1.55, 4.6, 1.5), ...rect(5.4, 4.25, 4.6, 1.5), ...rect(0, 6.95, 10, 1.5)
		]
	},
	context: {
		fill: N, source: 'no brand → neutral',
		desc: 'brackets enclosing a dot — the surrounding scope',
		d: [
			...poly([[0.4, 1.0], [4.0, 1.0], [4.0, 3.0], [2.6, 3.0], [2.6, 7.0], [4.0, 7.0], [4.0, 9.0], [0.4, 9.0]]),
			...poly([[9.6, 1.0], [9.6, 9.0], [6.0, 9.0], [6.0, 7.0], [7.4, 7.0], [7.4, 3.0], [6.0, 3.0], [6.0, 1.0]]),
			...circle(5.0, 5.0, 1.2)
		]
	},
	contract: {
		fill: N, source: 'no brand → neutral',
		desc: 'stamped page — one clause line and a round seal knocked out',
		d: [
			...rrect(0.5, 0.1, 9.0, 9.8, 0.9),
			...rect(2.1, 2.4, 5.8, 1.4, true), ...circle(6.6, 7.4, 1.5, true)
		]
	},
	controller: {
		fill: N, source: 'no brand → neutral',
		desc: 'dispatch hub — core disc with three spokes to handler dots',
		d: [
			...circle(5, 5.4, 1.6),
			...[270, 30, 150].flatMap(a => [
				...bar(...P(a, 1.3, 5, 5.4), ...P(a, 3.6, 5, 5.4), 2.0),
				...circle(...P(a, 3.6, 5, 5.4), 1.4)
			])
		]
	},
	core: {
		fill: N, source: 'no brand → neutral',
		desc: 'processor die — chip body with eight pins and a square core',
		d: [
			...rrect(2.0, 2.0, 6.0, 6.0, 0.6), ...rrect(3.8, 3.8, 2.4, 2.4, 0.3, true),
			...rect(0.2, 2.8, 1.8, 1.6), ...rect(0.2, 5.6, 1.8, 1.6),
			...rect(8.0, 2.8, 1.8, 1.6), ...rect(8.0, 5.6, 1.8, 1.6),
			...rect(2.8, 0.2, 1.6, 1.8), ...rect(5.6, 0.2, 1.6, 1.8),
			...rect(2.8, 8.0, 1.6, 1.8), ...rect(5.6, 8.0, 1.6, 1.8)
		]
	},
	cubit: {
		fill: N, source: 'no brand → neutral',
		desc: 'wireframe cube — hexagon outline with the three seams',
		d: cube()
	},
	cue: {
		fill: '#5A4C9E', source: 'file/cue plate #7E6ECE darkened',
		desc: 'letter C from the CUE badge',
		letter: 'C'
	},
	custom: {
		fill: N, source: 'no brand → neutral',
		desc: 'two sliders with knobs — personal settings',
		d: [
			...rrect(0, 2.0, 10, 1.6, 0.8), ...circle(3.0, 2.8, 1.9),
			...rrect(0, 6.4, 10, 1.6, 0.8), ...circle(7.0, 7.2, 1.9)
		]
	},

	// ---- data ------------------------------------------------------------------
	dal: {
		fill: N, source: 'no brand → neutral',
		desc: 'store cylinder with an access arrow (R3 rhyme with the core db folder)',
		d: [
			M(0, 1.6), A(2.7, 1.4, 0, 0, 1, 5.4, 1.6), L(5.4, 8.0),
			A(2.7, 1.4, 0, 0, 1, 0, 8.0), Z(),
			...rect(6.6, 4.0, 2.2, 2.0), ...poly([[8.4, 2.8], [10, 5.0], [8.4, 7.2]])
		]
	},
	dapr: {
		fill: '#1E5F7A', source: 'brand teal-blue, darkened for the tan',
		desc: 'sidecar — application block with its runtime block attached',
		d: [...rrect(0, 1.6, 6.4, 6.4, 0.9), ...rrect(7.6, 6.0, 2.4, 2.4, 0.5)]
	},
	dart: {
		fill: '#1B5E8A', source: 'brand #0175C2 darkened',
		desc: 'swept dart with a tail notch',
		d: [...poly([[5.0, 0.4], [9.7, 9.6], [5.0, 7.4], [0.3, 9.6]])]
	},
	databricks: {
		fill: '#A83A26', source: 'file/databricks #D14A32 darkened',
		desc: 'three stacked slanted bars (file mark, redrawn to the floors)',
		d: [0, 3.73, 7.46].flatMap(y =>
			poly([[1.3, y], [10, y], [8.7, y + 2.54], [0, y + 2.54]]))
	},
	datadog: {
		fill: '#4F2E8C', source: 'brand #632CA6 darkened (file/datadog #7E5CC4)',
		desc: 'the datadog head — body block with two ears (file mark reduced)',
		d: [
			...rrect(2.31, 2.94, 6.89, 7.06, 1.51),
			...poly([[0.8, 3.11], [0.8, 0], [4.16, 2.94]]),
			...poly([[9.2, 3.11], [5.84, 2.94], [9.2, 0]])
		]
	},
	debian: {
		fill: '#8E2032', source: 'brand #A81D33 darkened',
		desc: 'open swirl — thick C band with rounded terminals',
		d: [
			...arcBand(5, 5, 4.6, 2.5, 40, 340),
			...circle(...P(40, 3.55), 1.05), ...circle(...P(340, 3.55), 1.05)
		]
	},
	debug: {
		fill: N, source: 'no brand → neutral',
		desc: 'beetle — oval body, head and four legs (a split back reads as an arch at 16 px)',
		d: [
			...circle(5.0, 2.4, 2.0), ...ellipse(5.0, 6.2, 3.6, 3.4),
			...rect(0.2, 4.8, 2.0, 1.8), ...rect(0.2, 7.6, 2.0, 1.8),
			...rect(7.8, 4.8, 2.0, 1.8), ...rect(7.8, 7.6, 2.0, 1.8)
		]
	},
	decorators: {
		fill: N, source: 'no brand → neutral',
		desc: 'at-sign — ring, centre dot and tail',
		d: [
			...circle(4.6, 4.6, 4.4), ...circle(4.6, 4.6, 2.6, true), ...circle(4.6, 4.6, 1.3),
			...bar(7.4, 7.4, 9.0, 9.0, 2.0)
		]
	},
	delta: {
		fill: N, source: 'no brand → neutral',
		desc: 'delta triangle — the change set',
		d: [...poly([[5, 0.6], [9.8, 9.4], [0.2, 9.4]])]
	},
	dependabot: {
		fill: '#0A5A85', source: 'brand #025E8C darkened',
		desc: 'bot head — antenna, two eyes, mouth slot',
		d: [
			...circle(5.0, 1.1, 1.1), ...rect(4.0, 1.1, 2.0, 1.4),
			...rrect(0.6, 2.2, 8.8, 6.6, 1.6),
			...circle(3.4, 4.8, 1.0, true), ...circle(6.6, 4.8, 1.0, true),
			...rect(3.6, 7.0, 2.8, 1.2, true)
		]
	},
	deprecated: {
		fill: N, source: 'no brand → neutral',
		desc: 'no-entry — ring crossed by a bar',
		d: [
			...circle(5, 5, 4.9), ...circle(5, 5, 3.1, true), ...bar(2.2, 7.8, 7.8, 2.2, 2.0)
		]
	},
	desktop: {
		fill: N, source: 'no brand → neutral',
		desc: 'monitor on a stand, screen knocked out',
		d: [
			...rrect(0, 1.0, 10, 6.4, 0.9), ...rect(1.4, 2.4, 7.2, 3.6, true),
			...rect(4.0, 7.4, 2.0, 1.2), ...rrect(2.0, 8.6, 6.0, 1.4, 0.5)
		]
	},
	devcontainer: {
		fill: N, source: 'no brand → neutral',
		desc: 'container frame holding one workload (R3 rhyme with container)',
		d: [
			...rrect(0.2, 0.4, 9.6, 9.2, 1.2), ...rrect(2.2, 2.4, 5.6, 5.2, 0.6, true),
			...circle(5.0, 5.0, 1.4)
		]
	},
	development: {
		fill: N, source: 'no brand → neutral',
		desc: 'wrench — open jaw head on a diagonal handle',
		d: [
			// open jaw: a disc with a 60° bite taken out toward the upper right
			...arcBand(7.8, 2.2, 2.2, 0.55, 345, 285),
			...capsule(1.5, 8.9, 6.4, 4.0, 2.2)
		]
	},
	devenv: {
		fill: '#5A6EAE', source: 'file/devenv plate #5A6EAE (already darker than the tan)',
		desc: 'letter D from the DEV badge',
		letter: 'D'
	},
	directive: {
		fill: N, source: 'no brand → neutral',
		desc: 'signpost — pointed plate on a post',
		d: [
			...rect(0.6, 0.4, 2.2, 9.6),
			...poly([[2.8, 2.0], [8.4, 2.0], [10.0, 3.6], [8.4, 5.2], [2.8, 5.2]])
		]
	},
	download: {
		fill: N, source: 'no brand → neutral',
		desc: 'cloud with a descending arrow',
		d: [
			...circle(3.0, 2.6, 1.6), ...circle(5.6, 2.1, 2.0), ...circle(7.6, 2.9, 1.3),
			...rect(3.0, 2.6, 4.6, 1.4),
			...rect(4.0, 3.6, 2.0, 3.8), ...poly([[2.6, 7.2], [7.4, 7.2], [5.0, 10.0]])
		]
	},
	drizzle: {
		fill: '#6E8F2B', source: 'brand #C5F74F darkened',
		desc: 'three slanted rain bars',
		d: [
			...capsule(2.0, 2.4, 8.0, 1.2, 2.0),
			...capsule(1.0, 5.6, 9.0, 4.4, 2.0),
			...capsule(3.0, 8.8, 7.0, 7.8, 2.0)
		]
	},
	dump: {
		fill: N, source: 'no brand → neutral',
		desc: 'bin — lid, handle, tapered body with two slots',
		d: [
			...rect(3.8, 0, 2.4, 1.2), ...rrect(0.4, 1.2, 9.2, 1.8, 0.4),
			...poly([[1.2, 3.0], [8.8, 3.0], [8.0, 10.0], [2.0, 10.0]]),
			...rect(3.1, 4.6, 1.2, 3.8, true), ...rect(5.7, 4.6, 1.2, 3.8, true)
		]
	},

	// ---- e ---------------------------------------------------------------------
	e2e: {
		fill: N, source: 'no brand → neutral',
		desc: 'end to end — two terminals joined by one run',
		d: [...circle(2.4, 5.0, 2.4), ...circle(7.6, 5.0, 2.4), ...rect(2.4, 3.9, 5.2, 2.2)]
	},
	eas: {
		fill: '#5A6889', source: 'file/expo plate #68779E darkened',
		desc: 'Expo chevron — the open A',
		d: [...poly([[5, 0.6], [9.8, 9.6], [7.2, 9.6], [5, 5.0], [2.8, 9.6], [0.2, 9.6]])]
	},
	elasticbeanstalk: {
		fill: '#5E7F1E', source: 'AWS green #7AA116 darkened',
		desc: 'seedling on a ground bar',
		d: [
			...rrect(0.6, 8.4, 8.8, 1.6, 0.7), ...rect(4.0, 3.4, 2.0, 5.0),
			M(4.0, 4.8), C(2.0, 5.4, 0.6, 4.0, 0.8, 2.0), C(3.0, 2.2, 4.0, 3.4, 4.0, 4.8), Z(),
			M(6.0, 4.8), C(8.0, 5.4, 9.4, 4.0, 9.2, 2.0), C(7.0, 2.2, 6.0, 3.4, 6.0, 4.8), Z()
		]
	},
	electron: {
		fill: '#35707B', source: 'brand #47848F darkened',
		desc: 'atom — one tilted orbit around a nucleus',
		d: [...ellipseRing(5, 5, 4.9, 3.0, 2.9, 1.0, -30), ...circle(5, 5, 1.4)]
	},
	element: {
		fill: N, source: 'no brand → neutral',
		desc: 'node square with four anchor dots',
		d: [
			...rrect(3.4, 3.4, 3.2, 3.2, 0.4),
			...circle(1.4, 1.4, 1.4), ...circle(8.6, 1.4, 1.4),
			...circle(1.4, 8.6, 1.4), ...circle(8.6, 8.6, 1.4)
		]
	},
	enum: {
		fill: N, source: 'no brand → neutral',
		desc: 'enumerated list — three dotted members',
		d: [
			...circle(1.1, 1.6, 1.1), ...rect(3.4, 0.7, 6.6, 1.8),
			...circle(1.1, 5.0, 1.1), ...rect(3.4, 4.1, 6.6, 1.8),
			...circle(1.1, 8.4, 1.1), ...rect(3.4, 7.5, 6.6, 1.8)
		]
	},
	environment: {
		fill: N, source: 'no brand → neutral',
		desc: 'leaf with a midrib',
		d: [
			M(0.8, 9.2), C(0.4, 4.4, 3.4, 0.8, 9.2, 0.8), C(9.6, 5.6, 6.4, 9.6, 0.8, 9.2), Z(),
			...bar(2.4, 7.9, 6.9, 3.3, 1.2, true)
		]
	},
	environments: {
		fill: N, source: 'no brand → neutral',
		desc: 'two stacked cards — more than one environment',
		d: [
			...poly([[0, 0], [7.2, 0], [7.2, 2.0], [2.0, 2.0], [2.0, 7.2], [0, 7.2]]),
			...rrect(3.2, 3.2, 6.8, 6.8, 1.0)
		]
	},
	error: {
		fill: N, source: 'no brand → neutral',
		desc: 'disc with a knocked-out bang',
		d: [...circle(5, 5, 4.9), ...rect(4.0, 1.9, 2.0, 3.4, true), ...circle(5.0, 7.5, 1.0, true)]
	},
	event: {
		fill: N, source: 'no brand → neutral',
		desc: 'lightning bolt — the fired event',
		d: [...poly([[7.2, 0.2], [1.6, 5.4], [4.9, 5.4], [3.4, 9.8], [8.8, 4.2], [5.4, 4.2]])]
	},
	examples: {
		fill: N, source: 'no brand → neutral',
		desc: 'lightbulb over its base',
		d: [
			...circle(5.0, 3.6, 3.4), ...rect(3.6, 6.2, 2.8, 1.4),
			...rrect(3.4, 8.8, 3.2, 1.2, 0.4)
		]
	},
	export: {
		fill: N, source: 'no brand → neutral',
		desc: 'arrow leaving an open bracket',
		d: [
			...poly([[0, 0.8], [4.6, 0.8], [4.6, 2.8], [2.0, 2.8], [2.0, 7.2], [4.6, 7.2], [4.6, 9.2], [0, 9.2]]),
			...rect(3.4, 4.0, 4.2, 2.0), ...poly([[7.0, 2.6], [10.0, 5.0], [7.0, 7.4]])
		]
	},

	// ---- f ---------------------------------------------------------------------
	fastlane: {
		fill: '#3E8B66', source: 'file/fastlane #5FBE93 darkened',
		desc: 'the fastlane rocket with a porthole (file mark reduced)',
		d: [
			...poly([[0, 8.87], [4.02, 1.13], [5.98, 1.13], [10, 8.87]]),
			...circle(5.0, 5.6, 1.5, true)
		]
	},
	features: {
		fill: N, source: 'no brand → neutral',
		desc: 'five-point star — the shipped feature',
		d: star(5, 5.2, 4.9, 2.2)
	},
	filter: {
		fill: N, source: 'no brand → neutral',
		desc: 'funnel',
		d: [...poly([[0.2, 0.6], [9.8, 0.6], [6.2, 5.4], [6.2, 9.8], [3.8, 8.6], [3.8, 5.4]])]
	}
};
