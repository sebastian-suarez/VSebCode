// F01-emblems.mjs — the 45 emblems of folder slice F01, authored in the 0..10 field.
//
// One simple flat mark per concept. Neutral #4E545B unless a real brand earns its
// (darkened) hue; every fill is darker than the tan plate #BF9354 (R9 tone law).
// Feature floors, in field units: stems >= 2.0 (1.64 px closed), counters >= 1.2 (0.98 px).

import { readFileSync } from 'node:fs';
import { circ, ell, rrect, poly, bar, transformPath, bbox } from './F01-lib.mjs';
import { letterPath } from '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/tools/letterpath.mjs';

const FILE_SVG = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/svg/file';

/** Lift the mark out of an existing 16-box file icon and fit it into the 0..10 field. */
function fromFile(id) {
	const src = readFileSync(`${FILE_SVG}/${id}.svg`, 'utf8');
	const d = /<path[^>]*\sd="([^"]+)"/.exec(src)[1];
	const b = bbox(d);
	const k = Math.min(10 / b.w, 10 / b.h);
	return transformPath(d, k, (10 - b.w * k) / 2 - b.x1 * k, (10 - b.h * k) / 2 - b.y1 * k, 4);
}

/** A single Inter Bold letter, cap band centred on the field. */
function letter(text, cap = 8.6) {
	return letterPath({ text, cap, cx: 5, cy: 5, band: 'cap', precision: 4 }).d;
}

const N = '#4E545B';   // the folder family's neutral

export const EMBLEMS = {

	// ---- A ----------------------------------------------------------------
	admin: {
		fill: N, source: 'no brand -> neutral', mark: 'shield',
		d: 'M.8 .6L9.2 .6L9.2 5.3C9.2 7.9 6.9 9.3 5 9.8C3.1 9.3 .8 7.9 .8 5.3Z'
	},

	android: {
		fill: '#2E8055', source: 'file android #4EBE80 darkened', mark: 'android robot (file mark, reduced)',
		rule: 'evenodd', d: fromFile('android')
	},

	animation: {
		fill: N, source: 'no brand -> neutral', mark: 'three tweened discs on a diagonal',
		d: circ(1.3, 8.7, 0.9) + circ(4.4, 6, 1.5) + circ(7.8, 2.4, 2.2)
	},

	ansible: {
		fill: '#B31717', source: 'brand #EE0000 darkened', mark: 'disc with a chevron counter',
		d: circ(5, 5, 4.9) + poly([[1.8, 7], [5, 3], [8.2, 7], [6.4, 7], [5, 5.2], [3.6, 7]], false)
	},

	apache: {
		fill: '#8E2F2C', source: 'file apache #C0403C darkened', mark: 'feather (file mark, reduced)',
		d: fromFile('apache')
	},

	apollo: {
		fill: '#311C87', source: 'brand #311C87', mark: 'rocket: capsule and two fins',
		d: 'M5 .3C6.4 1.9 6.4 3.6 6.4 6L6.4 9.7L3.6 9.7L3.6 6C3.6 3.6 3.6 1.9 5 .3Z'
			+ poly([[2.4, 5.2], [2.4, 9.7], [.2, 9.7]])
			+ poly([[7.6, 5.2], [9.8, 9.7], [7.6, 9.7]])
	},

	appwrite: {
		fill: '#A03350', source: 'file appwrite #D8506F darkened', mark: 'angular A (file mark, reduced)',
		d: fromFile('appwrite')
	},

	arangodb: {
		fill: '#2F6357', source: 'recognized green, shifted teal (no file icon)', mark: 'three widening layers',
		d: ell(5, 1.1, 2.9, 1.1) + ell(5, 5, 3.9, 1.1) + ell(5, 8.9, 4.9, 1.1)
	},

	archive: {
		fill: N, source: 'no brand -> neutral', mark: 'archive box: lid, body, handle slot',
		d: rrect(0.4, 0.6, 9.2, 2.6, 0.5) + rrect(1.3, 4.4, 7.4, 5.3, 0.5)
			+ rrect(3.4, 6, 3.2, 1.5, 0.3, false)
	},

	atom: {
		fill: N, source: 'no brand -> neutral', mark: 'nucleus in an orbit ring',
		d: circ(5, 5, 4.9) + circ(5, 5, 2.9, false) + circ(5, 5, 1.4)
	},

	attachment: {
		fill: N, source: 'no brand -> neutral', mark: 'thumbtack: head, collar, needle',
		d: circ(5, 2.6, 2.6) + rrect(1.2, 4.4, 7.6, 1.5, 0.5)
			+ poly([[4.2, 5.9], [5.8, 5.9], [5, 10]])
	},

	aurelia: {
		fill: '#383E80', source: 'file aurelia #4A52A8 darkened (3-letter badge cannot reduce)',
		mark: 'flat-top hexagon ring',
		d: poly([[2.5, 0.4], [7.5, 0.4], [10, 5], [7.5, 9.6], [2.5, 9.6], [0, 5]])
			+ poly([[3.63, 2.47], [6.38, 2.47], [7.75, 5], [6.38, 7.53], [3.63, 7.53], [2.25, 5]], false)
	},

	aws: {
		fill: '#A05F0B', source: 'brand #FF9900 darkened', mark: 'smile crescent',
		d: 'M.4 2.2A4.69 4.69 0 1 0 9.6 2.2A5.18 5.18 0 0 1 .4 2.2Z'
	},

	azure: {
		fill: '#1F6499', source: 'file azure #2E8BD4 darkened', mark: 'two-piece Azure slash',
		d: poly([[4.4, 0.4], [6.8, 0.4], [3.6, 6.4], [1.2, 6.4]])
			+ poly([[7.2, 2.6], [9.8, 9.6], [1, 9.6], [2.4, 7.6], [6.8, 7.6]])
	},

	azurepipelines: {
		fill: '#1F6BA3', source: 'file azurepipelines #2E86C8 darkened', mark: 'two pipeline triangles (file mark, reduced)',
		d: poly([[7.2, 0.4], [9.8, 9.7], [4.6, 9.7]]) + poly([[1.8, 4.6], [3.4, 9.7], [0.2, 9.7]])
	},

	// ---- B ----------------------------------------------------------------
	backup: {
		fill: N, source: 'no brand -> neutral', mark: 'clock disc with a hand counter',
		d: circ(5, 5, 4.9) + poly([[4.3, 1.8], [5.7, 1.8], [5.7, 4.4], [8.6, 4.4], [8.6, 5.8], [4.3, 5.8]], false)
	},

	base: {
		fill: N, source: 'no brand -> neutral', mark: 'plinth on a base slab',
		d: poly([[3.4, 1.2], [6.6, 1.2], [7.2, 6.2], [2.8, 6.2]]) + rrect(0.4, 7.4, 9.2, 2.4, 0.6)
	},

	batch: {
		fill: N, source: 'no brand -> neutral', mark: 'six-item grid',
		d: [[0, 1.88], [3.75, 1.88], [7.5, 1.88], [0, 5.63], [3.75, 5.63], [7.5, 5.63]]
			.map(([x, y]) => rrect(x, y, 2.5, 2.5, 0.5)).join('')
	},

	benchmark: {
		fill: N, source: 'no brand -> neutral', mark: 'three ascending bars',
		d: rrect(0.1, 6.3, 2.4, 3.4, 0.5) + rrect(3.8, 3.6, 2.4, 6.1, 0.5) + rrect(7.5, 0.9, 2.4, 8.8, 0.5)
	},

	bibliography: {
		fill: '#6B4A78', source: 'file bibliography #9A6FA8 darkened', mark: 'closed book with a spine and a bookmark',
		d: rrect(1.2, 0.6, 1.8, 8.8, 0.5) + rrect(4.2, 0.6, 4.6, 8.8, 0.5)
			+ poly([[5.6, 0.6], [7.4, 0.6], [7.4, 4.2], [6.5, 3.3], [5.6, 4.2]], false)
	},

	bicep: {
		fill: '#2E7488', source: 'file bicep #3E9BB4 darkened', mark: 'dumbbell',
		d: rrect(0.4, 1.8, 2.6, 6.4, 0.6) + rrect(7, 1.8, 2.6, 6.4, 0.6) + rrect(2.8, 3.9, 4.4, 2.2, 0)
	},

	blender: {
		fill: '#AC661C', source: 'file blender #E8913F darkened', mark: 'blender ring and wedge (file mark, reduced)',
		d: circ(6.4, 5.55, 3.59) + circ(6.4, 5.55, 1.41, false)
			+ poly([[0, 0.86], [5.47, 0.86], [6.56, 3.2], [2.66, 3.2]])
	},

	bloc: {
		fill: N, source: 'no brand -> neutral', mark: 'block inside a block boundary',
		d: rrect(0.4, 0.4, 9.2, 9.2, 1) + rrect(2.4, 2.4, 5.2, 5.2, 0.4, false)
			+ rrect(3.8, 3.8, 2.4, 2.4, 0.4)
	},

	blueprint: {
		fill: N, source: 'no brand -> neutral', mark: 'drafting compass',
		d: circ(5, 1.3, 1.3)
			+ poly([[4, 1.3], [5.6, 1.3], [2.5, 9.8], [0.2, 9.8]])
			+ poly([[4.4, 1.3], [6, 1.3], [9.8, 9.8], [7.5, 9.8]])
	},

	bot: {
		fill: N, source: 'no brand -> neutral', mark: 'square bot head with an antenna',
		d: circ(5, 1, 1) + rrect(4.3, 1.6, 1.4, 1.6, 0) + rrect(0.8, 3, 8.4, 6.6, 1.2)
			+ rrect(2.8, 5.4, 1.6, 1.6, 0.3, false) + rrect(5.6, 5.4, 1.6, 1.6, 0.3, false)
	},

	bower: {
		fill: '#8C3A24', source: 'file bower #C4573C darkened', mark: 'bower bird head (file mark, reduced)',
		d: fromFile('bower')
	},

	buildkite: {
		fill: '#3A7A3E', source: 'file buildkite #5DBE61 darkened', mark: 'kite with a tail knot',
		d: poly([[5, 0.3], [8.7, 3.5], [5, 7.3], [1.3, 3.5]])
			+ poly([[3.4, 7.7], [4.5, 8.8], [3.4, 9.9], [2.3, 8.8]])
	},

	// ---- C ----------------------------------------------------------------
	cake: {
		fill: '#7A4A22', source: 'file cake #C08A5A darkened', mark: 'cake with a candle (file mark, re-spaced)',
		d: circ(5, 0.9, 0.9) + rrect(4.4, 3, 1.2, 2, 0)
			+ rrect(0.6, 5, 8.8, 4.7, 1)
			+ rrect(0.6, 6.4, 8.8, 1.2, 0, false)
	},

	cargo: {
		fill: '#94402A', source: 'file cargo #B04A32 darkened', mark: 'crate, two panels (file mark, reduced)',
		d: rrect(0.4, 1.4, 9.2, 7.2, 0.8)
			+ rrect(1.8, 2.8, 2.6, 4.4, 0.2, false) + rrect(5.6, 2.8, 2.6, 4.4, 0.2, false)
	},

	cart: {
		fill: N, source: 'no brand -> neutral', mark: 'shopping basket with a handle',
		d: 'M2.8 .4L7.2 .4A1 1 0 0 1 8.2 1.4L8.2 3.8L9.5 3.8L8 9.6L2 9.6L.5 3.8L1.8 3.8L1.8 1.4A1 1 0 0 1 2.8 .4Z'
			+ rrect(3.8, 2.2, 2.4, 1.6, 0, false)
	},

	certificate: {
		fill: '#4A5560', source: 'file cert #93A0AE darkened', mark: 'seal rosette with ribbon tails',
		d: circ(5, 3.2, 3.2) + poly([[2.6, 5.6], [7.4, 5.6], [7.4, 10], [5, 8.2], [2.6, 10]])
	},

	changesets: {
		fill: '#5A4C8A', source: 'changesets violet', mark: 'change plate with a plus counter',
		d: rrect(0.4, 0.4, 9.2, 9.2, 1.2)
			+ poly([[3.9, 1.9], [6.1, 1.9], [6.1, 3.9], [8.1, 3.9], [8.1, 6.1], [6.1, 6.1],
				[6.1, 8.1], [3.9, 8.1], [3.9, 6.1], [1.9, 6.1], [1.9, 3.9], [3.9, 3.9]], false)
	},

	chef: {
		fill: '#A34A1E', source: 'file chef #D07A46 darkened', mark: 'chef hat (file mark, re-spaced)',
		d: circ(2.4, 4.2, 2.4) + circ(5, 3.2, 2.7) + circ(7.6, 4.2, 2.4)
			+ rrect(1.6, 4.2, 6.8, 2.4, 0) + rrect(1.6, 7.8, 6.8, 2, 0.7)
	},

	ci: {
		fill: N, source: 'no brand -> neutral', mark: 'build pennant on a pole',
		d: rrect(1, 0.4, 2, 9.3, 0) + poly([[3, 0.9], [9.6, 3.2], [3, 5.5]])
	},

	circleci: {
		fill: '#2E2E2E', source: 'brand #343434', mark: 'letter C (Inter Bold)',
		d: letter('C'), letters: 'C'
	},

	cli: {
		fill: N, source: 'no brand -> neutral', mark: 'terminal plate with a prompt counter',
		d: rrect(0.2, 0.9, 9.6, 8.2, 1)
			+ poly([[1.6, 2.8], [3.8, 2.8], [6, 4.8], [3.8, 6.8], [1.6, 6.8], [3.8, 4.8]], false)
			+ rrect(6.2, 6.6, 2.4, 1.2, 0, false)
	},

	client: {
		fill: N, source: 'no brand -> neutral', mark: 'monitor on a stand',
		d: rrect(0.4, 0.6, 9.2, 6.6, 0.9) + rrect(2.4, 2.6, 5.2, 2.6, 0.3, false)
			+ rrect(4, 7.2, 2, 1.2, 0) + rrect(2.2, 8.4, 5.6, 1.4, 0.5)
	},

	cline: {
		fill: N, source: 'no brand -> neutral', mark: 'agent sparkle pair',
		d: 'M4.2 .4C4.5 2.9 5.7 4.1 8.2 4.4C5.7 4.7 4.5 5.9 4.2 8.4C3.9 5.9 2.7 4.7 .2 4.4C2.7 4.1 3.9 2.9 4.2 .4Z'
			+ 'M8.4 6.5C8.5 7.6 9 8.1 10 8.2C9 8.3 8.5 8.8 8.4 9.9C8.3 8.8 7.8 8.3 6.8 8.2C7.8 8.1 8.3 7.6 8.4 6.5Z'
	},

	'cloud-functions': {
		fill: N, source: 'no brand -> neutral', mark: 'cloud with a bolt counter',
		d: circ(5, 3.4, 3.2) + circ(2.4, 5.6, 2) + circ(7.6, 5.6, 1.9)
			+ rrect(0.4, 5.6, 9.2, 4, 1)
			+ poly([[4.8, 2.8], [7, 2.8], [5.66, 5], [7, 5], [4.8, 8.4], [2.6, 8.4],
				[3.94, 6.2], [2.6, 6.2]], false)
	},

	cloudflare: {
		fill: '#A76318', source: 'file cloudflare #D9862F darkened', mark: 'cloud with two streaks',
		d: circ(7, 4.6, 2.3) + circ(5, 5.8, 1.7) + rrect(3.3, 5.8, 6.5, 2.8, 0.7)
			+ rrect(0.2, 3.9, 1.9, 1.4, 0.5) + rrect(0.2, 6.5, 1.9, 1.4, 0.5)
	},

	cluster: {
		fill: N, source: 'no brand -> neutral', mark: 'three clustered nodes',
		d: circ(5, 2.2, 2) + circ(2.2, 7.6, 2) + circ(7.8, 7.6, 2)
	},

	cobol: {
		fill: '#3F5A85', source: 'file cobol #5E7BA8 darkened', mark: 'punched card (file mark, simplified)',
		d: poly([[0.2, 3], [1.6, 1.6], [9.8, 1.6], [9.8, 8.6], [0.2, 8.6]])
			+ rrect(1.4, 4.4, 1.5, 1.6, 0, false) + rrect(4.25, 4.4, 1.5, 1.6, 0, false)
			+ rrect(7.1, 4.4, 1.5, 1.6, 0, false)
	},

	common: {
		fill: N, source: 'no brand -> neutral', mark: 'two-set Venn', rule: 'evenodd',
		d: circ(3.4, 5, 3.2) + circ(6.6, 5, 3.2)
	},

	composer: {
		fill: '#6B4426', source: 'brand #885630 darkened', mark: 'music note',
		d: ell(3.2, 7.9, 2.2, 1.8) + rrect(5, 0.6, 2, 7.4, 0)
			+ 'M7 .6C8.8 1.6 9.6 2.8 9.4 4.6C8.8 3.2 8 2.6 7 2.4Z'
	},

	connection: {
		fill: N, source: 'no brand -> neutral', mark: 'chain link',
		d: rrect(0.2, 2.2, 6, 5.6, 2.8) + rrect(1.6, 4, 2, 2, 0.9, false)
			+ rrect(3.8, 2.2, 6, 5.6, 2.8) + rrect(6.4, 4, 2, 2, 0.9, false)
	}
};
