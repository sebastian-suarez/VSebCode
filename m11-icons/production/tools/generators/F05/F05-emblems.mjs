// F05-emblems.mjs — the 45 folder emblems of slice F05, authored in the 0..10 field.
//
// One simple flat mark each. Feature floors (R9a, closed box): stems >= 2.0 field units
// (1.64 px), counters >= 1.2 field units (0.98 px). Tone law: every emblem is darker than
// the tan plate #BF9354 (HSL L 53.9%); a brand hue only where the brand earns it.

import {
	poly, polyHole, rrect, rrectHole, circle, circleHole, ring, bar, capsule,
	raw, pol, cv, cvHole, yHoleHex
} from './F05-geom.mjs';

const N = '#4E545B';            // the folder-set neutral
const PURPLE = '#5F4289';       // redux family: svg/file redux-* plate #7A55B0 darkened
const GREEN = '#4A7D49';        // seed family: svg/file/seedkit.svg #5FA05E darkened
const barHole = (x1, y1, x2, y2, w) => {
	const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
	const nx = (dy / len) * (w / 2), ny = (-dx / len) * (w / 2);
	return polyHole([[x1 + nx, y1 + ny], [x2 + nx, y2 + ny], [x2 - nx, y2 - ny], [x1 - nx, y1 - ny]]);
};

// Each entry: { mark, fill, source, parts | letter, bbox? }
export const EMBLEMS = {

	pdm: {
		mark: 'bold P (Inter Bold cap band, centred)', fill: N, source: 'no brand -> neutral',
		letter: { text: 'P', capUnits: 8.6 }
	},

	phpmailer: {
		mark: 'envelope, V flap knocked out', fill: '#565A87', source: 'PHP #777BB4 darkened',
		parts: () => [
			raw([0.4, 1.8, 9.6, 8.2],
				['M', 0.4, 1.8], ['L', 9.6, 1.8], ['L', 9.6, 7.3], ['A', 0.9, 1, 8.7, 8.2],
				['L', 1.3, 8.2], ['A', 0.9, 1, 0.4, 7.3], ['Z']),
			polyHole([[0.4, 1.8], [5.0, 4.9], [9.6, 1.8], [9.6, 3.4], [5.0, 6.5], [0.4, 3.4]])
		]
	},

	pipe: {
		mark: 'tube in three segments (two joints)', fill: N, source: 'no brand -> neutral',
		parts: () => [
			capsule(2.4, 5.0, 7.6, 5.0, 4.0),
			rrectHole(2.667, 3.0, 1.2, 4.0),
			rrectHole(6.133, 3.0, 1.2, 4.0)
		]
	},

	plastic: {
		mark: 'isometric cube, three faces split by a Y seam', fill: '#46809E',
		source: 'svg/file/plastic.svg plate #46809E',
		parts: () => [
			poly([pol(5, 5, 4.8, -90), pol(5, 5, 4.8, -30), pol(5, 5, 4.8, 30),
				pol(5, 5, 4.8, 90), pol(5, 5, 4.8, 150), pol(5, 5, 4.8, 210)]),
			yHoleHex(5, 5, 4.8, 0.6, [-90, 30, 150])
		]
	},

	platformio: {
		mark: 'dev board: MCU window + two mounting holes', fill: '#8E4F28',
		source: 'svg/file/platformio.svg plate #C4703A darkened',
		parts: () => [
			rrect(0.6, 1.4, 8.8, 7.2, 1.0),
			circleHole(2.4, 3.4, 0.8), circleHole(2.4, 6.6, 0.8),
			rrectHole(4.6, 3.3, 3.4, 3.4, 0.4)
		]
	},

	plugin: {
		mark: 'mains plug: two pins, body, lead', fill: N, source: 'no brand -> neutral',
		parts: () => [
			rrect(2.4, 0.4, 2.0, 2.8, 0.4),
			rrect(5.6, 0.4, 2.0, 2.8, 0.4),
			rrect(1.6, 3.0, 6.8, 4.0, 1.0),
			rrect(4.0, 7.0, 2.0, 2.6, 0.4)
		]
	},

	policy: {
		mark: 'gavel over its block', fill: N, source: 'no brand -> neutral',
		parts: () => [
			bar(2.2, 3.6, 7.0, 1.4, 2.7),
			bar(5.0, 3.0, 7.3, 6.4, 2.2),
			rrect(0.4, 8.4, 9.2, 1.6, 0.4)
		]
	},

	postman: {
		mark: 'paper plane (the file mark, reduced)', fill: '#9E4726',
		source: 'svg/file/postman.svg #E56B3A darkened',
		parts: () => [poly([[0, 3.6], [9.6, 0], [5.55, 8.1], [3.9, 5.025]])]
	},

	private: {
		mark: 'padlock, shackle closed, round keyhole', fill: N, source: 'no brand -> neutral',
		parts: () => [
			raw([2.4, 2.2, 7.6, 5.4],
				['M', 2.4, 5.4], ['L', 2.4, 4.8], ['A', 2.6, 1, 7.6, 4.8], ['L', 7.6, 5.4],
				['L', 5.6, 5.4], ['L', 5.6, 4.8], ['A', 0.6, 0, 4.4, 4.8], ['L', 4.4, 5.4], ['Z']),
			rrect(1.4, 5.0, 7.2, 4.8, 1.1),
			circleHole(5.0, 7.4, 0.95)
		]
	},

	project: {
		mark: 'pennant on a staff', fill: N, source: 'no brand -> neutral',
		parts: () => [
			rrect(1.4, 0.6, 2.0, 8.8, 0.4),
			poly([[3.4, 0.8], [9.4, 0.8], [7.8, 2.7], [9.4, 4.6], [3.4, 4.6]])
		]
	},

	prompts: {
		mark: 'four-point sparkle', fill: N, source: 'no brand -> neutral',
		parts: () => [
			cv(['M', 5, 0.4], ['Q', 6.0, 4.0, 9.6, 5], ['Q', 6.0, 6.0, 5, 9.6],
				['Q', 4.0, 6.0, 0.4, 5], ['Q', 4.0, 4.0, 5, 0.4], ['Z'])
		]
	},

	proto: {
		mark: 'exchange arrows (wire protocol)', fill: N, source: 'no brand -> neutral',
		parts: () => [
			rrect(0.3, 1.3, 7.0, 2.0, 0.3),
			poly([[6.9, 0.2], [9.7, 2.3], [6.9, 4.4]]),
			rrect(2.7, 6.7, 7.0, 2.0, 0.3),
			poly([[3.1, 5.6], [0.3, 7.7], [3.1, 9.8]])
		]
	},

	pytest: {
		mark: 'round-bottom flask (the file mark, reduced)', fill: '#3F819B',
		source: 'svg/file/pytest.svg #4E9FBF darkened',
		parts: () => [
			rrect(3.2, 0.6, 3.6, 1.4, 0.35),
			rrect(4.0, 1.4, 2.0, 2.4, 0.2),
			circle(5, 6.4, 3.3)
		]
	},

	pytorch: {
		mark: 'flame ring with the offset dot', fill: '#AD442C', source: 'svg/file/pytorch.svg #CE5134 darkened',
		parts: () => [
			raw([1.7, 6.3 - 3.3 * 0.9272, 8.3, 9.6],
				['M', ...pol(5, 6.3, 3.3, -68)], ['A2', 3.3, 1, 1, ...pol(5, 6.3, 3.3, 248)],
				['L', ...pol(5, 6.3, 1.3, 248)], ['A2', 1.3, 1, 0, ...pol(5, 6.3, 1.3, -68)], ['Z']),
			circle(7.8, 1.3, 1.15)
		]
	},

	quasar: {
		mark: 'Q — ring with the tail crossing its wall (the file mark, reduced)', fill: '#389099',
		source: 'svg/file/quasar.svg #4ABDC9 darkened',
		parts: () => [...ring(5, 4.9, 4.3, 2.3), capsule(6.0, 6.0, 8.4, 8.4, 2.2)]
	},

	queue: {
		mark: 'three items on a directed rail', fill: N, source: 'no brand -> neutral',
		parts: () => [
			rrect(0.2, 2.0, 2.4, 2.4, 0.5), rrect(3.8, 2.0, 2.4, 2.4, 0.5), rrect(7.4, 2.0, 2.4, 2.4, 0.5),
			rrect(0.2, 6.4, 8.0, 1.9, 0.35),
			poly([[7.4, 5.3], [9.8, 7.35], [7.4, 9.4]])
		]
	},

	ravendb: {
		mark: 'raven head with a beak', fill: N, source: 'no brand -> neutral',
		parts: () => [
			circle(4.4, 5.0, 3.3),
			poly([[6.8, 3.4], [9.7, 5.2], [6.8, 7.0]]),
			circleHole(3.7, 4.2, 0.8)
		]
	},

	'react-components': {
		mark: 'UML component box with two connector tabs', fill: '#2E7A91',
		source: 'React #61DAFB darkened',
		parts: () => [
			rrect(2.4, 1.6, 7.2, 6.8, 0.8),
			rrect(0.4, 2.4, 3.2, 2.0, 0.3),
			rrect(0.4, 5.6, 3.2, 2.0, 0.3)
		]
	},

	redis: {
		mark: 'three stacked data plates', fill: '#8E2A2E', source: 'brand #FF4438 darkened',
		parts: () => [1.6, 5.0, 8.4].map(cy =>
			poly([[0.4, cy], [2.4, cy - 1.1], [7.6, cy - 1.1], [9.6, cy], [7.6, cy + 1.1], [2.4, cy + 1.1]]))
	},

	redux: {
		mark: 'three store nodes in a triangle', fill: PURPLE, source: 'brand #764ABC darkened',
		parts: () => [circle(5, 1.5, 1.5), circle(2.0, 7.6, 1.5), circle(8.0, 7.6, 1.5)]
	},

	'redux-actions': {
		mark: 'lightning bolt (dispatched action)', fill: PURPLE, source: 'redux family',
		parts: () => [
			poly([[1.5, 0.2], [8.5, 0.2], [5.7, 4.04], [8.5, 4.04], [3.6, 9.8], [3.6, 5.48], [1.5, 5.48]])
		]
	},

	'redux-reducer': {
		mark: 'funnel (fold to one value)', fill: PURPLE, source: 'redux family',
		parts: () => [
			poly([[0.4, 0.8], [9.6, 0.8], [6.1, 5.2], [6.1, 9.2], [3.9, 9.2], [3.9, 5.2]])
		]
	},

	'redux-selector': {
		mark: 'pointer arrow (picks a slice)', fill: PURPLE, source: 'redux family',
		parts: () => [
			poly([[2.0, 0.6], [2.0, 8.6], [4.2, 6.5], [5.6, 9.6], [7.5, 8.8], [6.1, 5.9], [8.6, 5.9]])
		]
	},

	'redux-store': {
		mark: 'nested container tile (single source of truth)', fill: PURPLE,
		source: 'redux family (file mark is a cylinder = the db folder, R8)',
		parts: () => [rrect(0.6, 0.6, 8.8, 8.8, 1.8), rrectHole(3.4, 3.4, 3.2, 3.2, 0.6)]
	},

	'redux-toolkit': {
		mark: 'open-end spanner', fill: PURPLE, source: 'redux family',
		parts: () => [
			capsule(2.0, 8.4, 6.4, 4.0, 2.3),
			poly([[7.4, 0.2], [8.775, 1.52], [6.9, 2.6], [8.775, 3.68], [7.4, 5.0], [4.9, 2.6]])
		]
	},

	repository: {
		mark: 'archive box: lid, body, hand slot', fill: N, source: 'no brand -> neutral',
		parts: () => [
			rrect(0.4, 1.2, 9.2, 2.4, 0.4),
			rrect(1.2, 3.6, 7.6, 5.6, 0.5),
			rrectHole(3.4, 5.6, 3.2, 1.4, 0.5)
		]
	},

	resolver: {
		mark: 'source node resolving into an arrow', fill: N, source: 'no brand -> neutral',
		parts: () => [
			circle(1.5, 5.0, 1.5),
			rrect(4.2, 4.0, 3.2, 2.0, 0.2),
			poly([[6.6, 2.0], [9.6, 5.0], [6.6, 8.0]])
		]
	},

	review: {
		mark: 'magnifier', fill: N, source: 'no brand -> neutral',
		parts: () => [...ring(3.9, 3.9, 3.3, 1.3), capsule(6.1, 6.1, 8.6, 8.6, 2.1)]
	},

	robot: {
		mark: 'robot head with an antenna', fill: N, source: 'no brand -> neutral',
		parts: () => [
			rrect(4.0, 0.4, 2.0, 1.6, 0.4),
			rrect(0.8, 2.0, 8.4, 7.4, 1.6),
			rrectHole(2.4, 4.6, 1.8, 1.8, 0.5),
			rrectHole(5.8, 4.6, 1.8, 1.8, 0.5)
		]
	},

	rules: {
		mark: 'ruler with three graduations', fill: N, source: 'no brand -> neutral',
		parts: () => [
			rrect(0.4, 3.0, 9.2, 4.0, 0.6),
			rrectHole(1.65, 5.2, 1.3, 1.8), rrectHole(4.35, 5.2, 1.3, 1.8), rrectHole(7.05, 5.2, 1.3, 1.8)
		]
	},

	salt: {
		mark: 'salt shaker: capped, dome-shouldered body', fill: N, source: 'no brand -> neutral',
		parts: () => [
			raw([1.8, 3.0, 8.2, 9.9],
				['M', 1.8, 9.9], ['L', 1.8, 6.2], ['A', 3.2, 1, 8.2, 6.2], ['L', 8.2, 9.9], ['Z']),
			rrect(3.4, 0.6, 3.2, 2.8, 0.7)
		]
	},

	sandbox: {
		mark: 'sand pail: handle, rim, tapered body', fill: N, source: 'no brand -> neutral',
		parts: () => [
			raw([1.9, 1.1, 8.1, 4.2],
				['M', 1.9, 4.2], ['A', 3.1, 1, 8.1, 4.2], ['L', 6.1, 4.2], ['A', 1.1, 0, 3.9, 4.2], ['Z']),
			rrect(1.3, 4.2, 7.4, 1.5, 0.35),
			poly([[1.7, 5.7], [8.3, 5.7], [7.4, 9.7], [2.6, 9.7]])
		]
	},

	scons: {
		mark: 'construction cone on its base', fill: N, source: 'no brand -> neutral',
		parts: () => [
			poly([[4.0, 0.6], [6.0, 0.6], [7.169, 4.4], [2.831, 4.4]]),
			poly([[2.462, 5.6], [7.538, 5.6], [8.4, 8.4], [1.6, 8.4]]),
			rrect(0.4, 8.4, 9.2, 1.6, 0.4)
		]
	},

	scrap: {
		mark: 'waste bin with two ribs', fill: N, source: 'no brand -> neutral',
		parts: () => [
			rrect(3.8, 0.2, 2.4, 1.4, 0.4),
			rrect(0.4, 1.6, 9.2, 1.8, 0.4),
			poly([[1.2, 3.4], [8.8, 3.4], [8.0, 9.8], [2.0, 9.8]]),
			rrectHole(3.3, 5.0, 1.2, 3.2, 0.3),
			rrectHole(5.5, 5.0, 1.2, 3.2, 0.3)
		]
	},

	secure: {
		mark: 'shield with a keyhole', fill: N, source: 'no brand -> neutral',
		parts: () => [
			cv(['M', 0.8, 1.0], ['L', 9.2, 1.0], ['L', 9.2, 5.0],
				['C', 9.2, 7.6, 7.4, 9.0, 5.0, 9.9], ['C', 2.6, 9.0, 0.8, 7.6, 0.8, 5.0], ['Z']),
			raw([3.6, 3.35, 6.4, 7.2],
				['M', 6.15, 4.5], ['A', 1.15, 0, 3.85, 4.5], ['L', 3.6, 7.2], ['L', 6.4, 7.2], ['Z'])
		]
	},

	seeders: {
		mark: 'seed crate with a single shoot', fill: GREEN,
		source: 'seed family, vsicons/material green',
		parts: () => [
			rrect(1.4, 5.4, 7.2, 4.2, 0.7),
			rrect(4.0, 2.6, 2.0, 2.8, 0.3),
			cv(['M', 5.6, 3.6], ['Q', 8.4, 3.4, 8.8, 0.8], ['Q', 6.0, 1.2, 5.6, 3.6], ['Z'])
		]
	},

	seedkit: {
		mark: 'sprout: stem with two leaves (the file mark, reduced)', fill: GREEN,
		source: 'svg/file/seedkit.svg #5FA05E darkened',
		parts: () => [
			rrect(4.0, 4.6, 2.0, 5.0, 0.4),
			cv(['M', 4.8, 5.8], ['Q', 1.2, 5.6, 0.8, 2.4], ['Q', 4.4, 2.8, 4.8, 5.8], ['Z']),
			cv(['M', 5.2, 5.8], ['Q', 8.8, 5.6, 9.2, 2.4], ['Q', 5.6, 2.8, 5.2, 5.8], ['Z'])
		]
	},

	serverless: {
		mark: 'lambda', fill: '#A84842', source: 'svg/file/serverless.svg #D45B54 darkened',
		parts: () => [bar(3.6, 1.2, 7.6, 9.0, 2.3), bar(5.3, 4.4, 2.2, 9.0, 2.3)]
	},

	shader: {
		mark: 'shaded sphere with a specular highlight (the file mark, reduced)', fill: '#7B5A8F',
		source: 'svg/file/shader.svg #A87BC4 darkened',
		parts: () => [circle(5, 5, 4.4), circleHole(3.7, 3.7, 1.1)]
	},

	shared: {
		mark: 'two discs sharing a knocked-out lens', fill: N, source: 'no brand -> neutral',
		parts: () => [
			circle(3.6, 5.0, 3.3), circle(6.4, 5.0, 3.3),
			raw([3.1, 2.012, 6.9, 7.988],
				['M', 5, 7.988], ['A', 3.3, 0, 5, 2.012], ['A', 3.3, 0, 5, 7.988], ['Z'])
		]
	},

	simulations: {
		mark: 'die, three pips (Monte Carlo)', fill: N, source: 'no brand -> neutral',
		parts: () => [
			rrect(0.6, 0.6, 8.8, 8.8, 1.8),
			circleHole(2.8, 2.8, 0.85), circleHole(5, 5, 0.85), circleHole(7.2, 7.2, 0.85)
		]
	},

	skills: {
		mark: 'mortarboard', fill: N, source: 'no brand -> neutral',
		parts: () => [
			poly([[5.0, 0.4], [9.8, 3.1], [5.0, 5.8], [0.2, 3.1]]),
			cv(['M', 2.5, 4.6], ['L', 7.5, 4.6], ['L', 7.5, 7.6], ['Q', 5.0, 9.6, 2.5, 7.6], ['Z'])
		]
	},

	snapcraft: {
		mark: 'lugged crate (the file mark, reduced)', fill: '#8A5230',
		source: 'svg/file/snapcraft.svg #C97A45 darkened',
		parts: () => [
			rrect(1.4, 0.2, 2.0, 2.2, 0.35),
			rrect(6.6, 0.2, 2.0, 2.2, 0.35),
			rrect(0.6, 2.2, 8.8, 7.2, 1.0)
		]
	},

	snaplet: {
		mark: 'camera (the file mark, reduced to a solid lens)', fill: '#9B4470',
		source: 'svg/file/snaplet.svg #C4568E darkened',
		parts: () => [
			poly([[2.6, 0.4], [6.2, 0.4], [7.0, 2.4], [2.0, 2.4]]),
			rrect(0.2, 2.4, 9.6, 6.8, 1.2),
			circleHole(5.0, 5.8, 1.7)
		]
	},

	snippet: {
		mark: 'bracketed fragment [ . ]', fill: N, source: 'no brand -> neutral',
		parts: () => [
			poly([[0.4, 0.6], [3.4, 0.6], [3.4, 2.6], [2.4, 2.6], [2.4, 7.4], [3.4, 7.4], [3.4, 9.4], [0.4, 9.4]]),
			poly([[9.6, 0.6], [9.6, 9.4], [6.6, 9.4], [6.6, 7.4], [7.6, 7.4], [7.6, 2.6], [6.6, 2.6], [6.6, 0.6]]),
			rrect(4.0, 4.0, 2.0, 2.0, 0.4)
		]
	}
};
