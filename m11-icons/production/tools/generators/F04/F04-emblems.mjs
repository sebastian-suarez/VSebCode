// F04-emblems.mjs — the 45 folder emblems of slice F04, authored in the 0..10 field.
//
// Each entry: { id, desc, fill, source, rule?, ops | letter }
//   ops    — geometry in the unit field (see F04-geom.mjs)
//   letter — { text, cap } routed through tools/letterpath.mjs at map time
//   rule   — 'evenodd' when knock-outs need it; omitted = nonzero winding

import {
	M, L, C, Q, A, Z, poly, rect, rrect, circle, ellipse, bar, taper, ngon,
	crescent, arcBand, wave
} from './F04-geom.mjs';

const NEUTRAL = '#4E545B';
const NGRX = '#7A3E92';
const cat = (...xs) => xs.flat();

// --- helpers used by more than one emblem ----------------------------------
const ringPoly = (cx, cy, r, n, wall) => cat(ngon(cx, cy, r, n, -Math.PI / 2, 1), ngon(cx, cy, r - wall, n, -Math.PI / 2, -1));

export const EMBLEMS = [
{
	id: 'less', desc: 'letter L', fill: '#1D365D',
	source: 'brandColor #1D365D (inventory)',
	letter: { text: 'L', cap: 8.4 }
},
{
	id: 'link', desc: 'two interlocked chain rings on the diagonal', fill: NEUTRAL,
	source: 'no brand → neutral',
	ops: cat(circle(3.3, 6.7, 2.8), circle(3.3, 6.7, .8, -1),
		circle(6.7, 3.3, 2.8), circle(6.7, 3.3, .8, -1))
},
{
	id: 'linux', desc: 'Tux penguin — belly knocked out, feet splayed', fill: NEUTRAL,
	source: 'brandColor #FCC624 is lighter than the tan → neutral (R9 tone law)',
	ops: cat(
		poly([[1, 9.9], [4.6, 8.4], [4.6, 9.9]]),
		poly([[9, 9.9], [5.4, 8.4], [5.4, 9.9]]),
		circle(5, 2.2, 2), poly([[5.4, 2.2], [8.1, 3.1], [5.4, 3.9]]),
		[M(5, 3), C(7.6, 3, 8.8, 5.6, 8.8, 7.4), C(8.8, 8.9, 7.2, 9.4, 5, 9.4),
			C(2.8, 9.4, 1.2, 8.9, 1.2, 7.4), C(1.2, 5.6, 2.4, 3, 5, 3), Z],
		ellipse(5, 6.6, 1.8, 1.9, -1))
},
{
	id: 'liquibase', desc: 'two liquid waves', fill: NEUTRAL,
	source: 'no brand → neutral',
	ops: cat(wave(.3, 9.7, 2.75, 1.35, 1.95), wave(.3, 9.7, 7.25, 1.35, 1.95))
},
{
	id: 'lottie', desc: 'play triangle knocked out of a rounded plate', fill: NEUTRAL,
	source: 'no brand → neutral', rule: 'evenodd',
	ops: cat(rrect(.4, 1.6, 9.2, 6.8, 1.4), poly([[4, 3.2], [7.2, 5], [4, 6.8]]))
},
{
	id: 'luau', desc: 'Lua orbit — pierced sphere with a moon', fill: '#4A48A8',
	source: 'family rhyme with core file lua #6C6ACB, darkened', rule: 'evenodd',
	ops: cat(circle(4.1, 5.72, 3.96), circle(5.76, 3.85, .83), circle(8.49, 1.69, 1.37))
},
{
	id: 'macos', desc: 'Apple silhouette with the bite and leaf', fill: NEUTRAL,
	source: 'Apple’s own mark is monochrome → neutral',
	// the bite is carved into the outline, never subtracted: a cutter that pokes
	// outside the body would paint under nonzero winding (spec R11).
	ops: cat(
		[M(5, 2.5), C(6.1, 1.55, 6.1, 1.55, 7.3, 1.9), C(8.05, 2.1, 8.6, 2.6, 8.95, 3.3),
			C(7.5, 3.7, 7.1, 4.3, 7.35, 5.05), C(7.55, 5.7, 8.15, 6.05, 8.85, 6.15),
			C(8.6, 7.8, 7.7, 9.9, 6.6, 9.9), C(5.9, 9.9, 5.6, 9.5, 5, 9.5),
			C(4.4, 9.5, 4.1, 9.9, 3.4, 9.9), C(2, 9.9, .8, 7.7, .6, 5.8),
			C(.4, 4, 1.1, 2.3, 2.7, 1.9), C(3.9, 1.55, 3.9, 1.55, 5, 2.5), Z],
		[M(5.2, 2.6), C(5, 1.3, 5.9, .2, 7.2, .1), C(7.4, 1.3, 6.6, 2.5, 5.2, 2.6), Z])
},
{
	id: 'mail', desc: 'envelope with a chevron flap', fill: NEUTRAL,
	source: 'no brand → neutral', rule: 'evenodd',
	ops: cat(rrect(.4, 1.2, 9.2, 7.6, .9),
		poly([[1, 2.4], [5, 5.5], [9, 2.4], [9, 3.95], [5, 7.05], [1, 3.95]]))
},
{
	id: 'mappings', desc: 'two columns crossed by an X of links', fill: NEUTRAL,
	source: 'no brand → neutral',
	ops: cat(rrect(.2, .6, 2.2, 8.8, .6), rrect(7.6, .6, 2.2, 8.8, .6),
		bar(2.4, 2.8, 7.6, 7.2, 1.6), bar(2.4, 7.2, 7.6, 2.8, 1.6))
},
{
	id: 'mariadb', desc: 'tiered database cylinder — top disc plus a tier line', fill: '#003545',
	source: 'brandColor #003545 (inventory)', rule: 'evenodd',
	// db family (R3): the core `db` cylinder carries one disc, this one carries a
	// second tier line so the pair reads as siblings, not as the same mark.
	ops: cat(
		[M(.7, 2.4), A(4.3, 2.2, 0, 0, 9.3, 2.4), L(9.3, 7.6), A(4.3, 2.2, 0, 1, .7, 7.6), Z],
		[M(.7, 2.4), A(4.3, 2.2, 0, 1, 9.3, 2.4), L(9.3, 3.7), A(4.3, 2.2, 0, 1, .7, 3.7), Z],
		[M(.7, 5), A(4.3, 2.2, 0, 0, 9.3, 5), L(9.3, 6.3), A(4.3, 2.2, 0, 1, .7, 6.3), Z])
},
{
	id: 'mediawiki', desc: 'letter W', fill: NEUTRAL,
	source: 'no brand → neutral',
	letter: { text: 'W', cap: 8.4 }
},
{
	id: 'memcached', desc: 'hash grid — two bars each way', fill: NEUTRAL,
	source: 'no brand → neutral',
	ops: cat(rect(2.1, .2, 2, 9.6), rect(5.9, .2, 2, 9.6),
		rect(.2, 2.1, 9.6, 2), rect(.2, 5.9, 9.6, 2))
},
{
	id: 'mercurial', desc: 'commit trunk with a side branch (VCS family)', fill: NEUTRAL,
	source: 'no brand → neutral',
	ops: cat(rrect(1.6, 1.9, 1.6, 6.2, .8), bar(2.4, 6, 7.8, 3, 1.6),
		circle(2.4, 1.9, 1.6), circle(2.4, 8.1, 1.6), circle(7.8, 3, 1.6))
},
{
	id: 'messages', desc: 'two offset chat bubbles', fill: NEUTRAL,
	source: 'no brand → neutral',
	ops: cat(rrect(.3, .4, 6.4, 4, 1.1), poly([[1.5, 4.2], [3.3, 4.2], [1.5, 6]]),
		rrect(3.6, 5.6, 6.1, 3.4, 1.1), poly([[8.4, 8.8], [6.8, 8.8], [8.4, 9.9]]))
},
{
	id: 'meta', desc: 'label tag with an eyelet', fill: NEUTRAL,
	source: 'no brand → neutral', rule: 'evenodd',
	ops: cat(poly([[.4, 5], [2.8, 1.8], [9.4, 1.8], [9.4, 8.2], [2.8, 8.2]]),
		circle(3.8, 5, 1))
},
{
	id: 'meteor', desc: 'comet head with a forked tail', fill: NEUTRAL,
	source: 'no brand → neutral',
	ops: cat(circle(7.3, 2.7, 2.3), taper(4.7, 5.3, 1.2, 8.8, 1.9, .8),
		taper(2.9, 2.7, .4, 5.2, 1.5, .6), taper(7.8, 6.6, 5.2, 9.2, 1.5, .6))
},
{
	id: 'metro', desc: 'train front — windshield and two lamps', fill: NEUTRAL,
	source: 'no brand → neutral', rule: 'evenodd',
	ops: cat(rrect(.6, .4, 8.8, 9.2, 2), rrect(2.6, 2.4, 4.8, 2.6, .5),
		circle(3.2, 7.4, .8), circle(6.8, 7.4, .8))
},
{
	id: 'migrations', desc: 'box → box, state moved forward', fill: NEUTRAL,
	source: 'no brand → neutral',
	ops: cat(rrect(0, 2.6, 2.8, 4.8, .7), poly([[4, 2.2], [6, 5], [4, 7.8]]),
		rrect(7.2, 2.6, 2.8, 4.8, .7))
},
{
	id: 'minecraft', desc: 'pickaxe', fill: NEUTRAL,
	source: 'no brand → neutral',
	ops: cat(bar(5.4, 2, 3.4, 9.4, 2),
		[M(.5, 4.8), Q(5, -.2, 9.5, 3), L(8.5, 4.8), Q(5, 2.4, 1.5, 6.4), Z])
},
{
	id: 'minikube', desc: 'Kubernetes heptagon ring with a hub', fill: '#2C5CA8',
	source: 'kubernetes brand #326CE5, darkened',
	ops: cat(ringPoly(5, 5, 4.95, 7, 2.2), circle(5, 5, 1.1))
},
{
	id: 'mjml', desc: 'letter M', fill: '#A3453A',
	source: 'MJML coral #F45E43, darkened',
	letter: { text: 'M', cap: 8.4 }
},
{
	id: 'mobile', desc: 'phone with a screen cut-out', fill: NEUTRAL,
	source: 'no brand → neutral', rule: 'evenodd',
	ops: cat(rrect(1.8, .2, 6.4, 9.6, 1.3), rrect(3.2, 1.8, 3.6, 6, .4))
},
{
	id: 'module', desc: 'IC chip with eight pins', fill: NEUTRAL,
	source: 'no brand → neutral',
	ops: cat(rrect(2.2, 2.2, 5.6, 5.6, .8),
		rect(.3, 2.4, 2.1, 1.6), rect(.3, 6, 2.1, 1.6),
		rect(7.6, 2.4, 2.1, 1.6), rect(7.6, 6, 2.1, 1.6),
		rect(2.4, .3, 1.6, 2.1), rect(6, .3, 1.6, 2.1),
		rect(2.4, 7.6, 1.6, 2.1), rect(6, 7.6, 1.6, 2.1))
},
{
	id: 'mojo', desc: 'flame', fill: '#A8481F',
	source: 'Mojo flame orange, darkened',
	ops: [M(5.6, .2), C(5.6, 2.4, 8.9, 3.6, 8.9, 6.4), C(8.9, 8.3, 7.2, 9.8, 5, 9.8),
		C(2.8, 9.8, 1.1, 8.3, 1.1, 6.4), C(1.1, 4.9, 2.1, 4, 2.9, 2.9),
		C(3, 4.4, 3.7, 5, 4.3, 5.3), C(3.9, 3.4, 4.3, 1.5, 5.6, .2), Z]
},
{
	id: 'molecule', desc: 'three atoms joined by bonds', fill: NEUTRAL,
	source: 'no brand → neutral',
	ops: cat(bar(5, 5.6, 5, 1.4, 1.8), bar(5, 5.6, 1.4, 8.6, 1.8), bar(5, 5.6, 8.6, 8.6, 1.8),
		circle(5, 5.6, 1.7), circle(5, 1.4, 1.3), circle(1.4, 8.6, 1.3), circle(8.6, 8.6, 1.3))
},
{
	id: 'mongodb', desc: 'MongoDB leaf with its vein', fill: '#3C7A4E',
	source: 'MongoDB green #47A248, darkened', rule: 'evenodd',
	ops: cat(
		[M(5, .3), C(8.2, 3, 9.3, 6, 6.6, 9), L(5, 9.9), L(3.4, 9), C(.7, 6, 1.8, 3, 5, .3), Z],
		rect(4.4, 1.6, 1.2, 7))
},
{
	id: 'moon', desc: 'crescent moon', fill: NEUTRAL,
	source: 'no brand → neutral',
	ops: crescent(5, 5, 4.6, 7.1, 3.7, 3.9)
},
{
	id: 'mypy', desc: 'magnifier — the type checker’s look', fill: NEUTRAL,
	source: 'no brand → neutral',
	ops: cat(circle(4, 4, 3.4), circle(4, 4, 1.4, -1), bar(6.3, 6.3, 8.9, 8.9, 2.2))
},
{
	id: 'mysql', desc: 'MySQL dolphin — detached dorsal fin, forked fluke', fill: '#4479A1',
	source: 'brandColor #4479A1 (inventory)',
	ops: cat(
		[M(.2, 6.8), C(.8, 4.6, 3, 3.4, 5.8, 3.6), C(7.4, 3.8, 8.4, 4.6, 8.6, 5.6),
			L(9.9, 5.4), L(9.5, 9.3), L(7.8, 7), C(6, 8, 2.6, 8.2, .2, 6.8), Z],
		poly([[4.4, 3.3], [5.8, .6], [7, 3.5]]))
},
{
	id: 'ngrx-actions', desc: 'lightning bolt (dispatch)', fill: NGRX,
	source: 'NgRx family purple (R3)',
	ops: poly([[7.6, .2], [1.2, 5.3], [4.4, 5.3], [2.8, 9.8], [9, 4.5], [5.4, 4.5]])
},
{
	id: 'ngrx-effects', desc: 'source dot with two radiating waves', fill: NGRX,
	source: 'NgRx family purple (R3)',
	ops: cat(circle(1.9, 5, 1.9),
		arcBand(1.9, 5, 3.2, 5, -58 * Math.PI / 180, 58 * Math.PI / 180),
		arcBand(1.9, 5, 6.2, 8, -36 * Math.PI / 180, 36 * Math.PI / 180))
},
{
	id: 'ngrx-entities', desc: 'three-row, two-column record table', fill: NGRX,
	source: 'NgRx family purple (R3)',
	ops: cat(rrect(.2, .4, 3.2, 2.2, .4), rrect(4.7, .4, 5.1, 2.2, .4),
		rrect(.2, 3.9, 3.2, 2.2, .4), rrect(4.7, 3.9, 5.1, 2.2, .4),
		rrect(.2, 7.4, 3.2, 2.2, .4), rrect(4.7, 7.4, 5.1, 2.2, .4))
},
{
	id: 'ngrx-reducer', desc: 'funnel', fill: NGRX,
	source: 'NgRx family purple (R3)',
	ops: poly([[.4, .6], [9.6, .6], [6.1, 5.2], [6.1, 9.4], [3.9, 8.2], [3.9, 5.2]])
},
{
	id: 'ngrx-selectors', desc: 'pointer — picking one thing out', fill: NGRX,
	source: 'NgRx family purple (R3)',
	ops: poly([[1.4, .5], [1.4, 8.6], [3.6, 6.5], [5.3, 9.9], [7.3, 9], [5.6, 5.8], [8.6, 5.5]])
},
{
	id: 'ngrx-state', desc: 'toggle switch', fill: NGRX,
	source: 'NgRx family purple (R3)', rule: 'evenodd',
	ops: cat(rrect(.2, 2, 9.6, 6, 3), circle(6.8, 5, 1.8))
},
{
	id: 'ngrx-store', desc: 'container holding one block', fill: NGRX,
	source: 'NgRx family purple (R3)',
	ops: cat(rrect(.4, .4, 9.2, 9.2, 1.4), rrect(2.4, 2.4, 5.2, 5.2, .7, -1),
		rrect(3.6, 3.6, 2.8, 2.8, .5))
},
{
	id: 'nix', desc: 'six-armed snowflake', fill: '#5277C3',
	source: 'brandColor #5277C3 (inventory)',
	ops: cat(bar(.2, 5, 9.8, 5, 2), bar(2.6, .84, 7.4, 9.16, 2), bar(7.4, .84, 2.6, 9.16, 2))
},
{
	id: 'notebooks', desc: 'notebook with a bookmark ribbon', fill: NEUTRAL,
	source: 'no brand → neutral', rule: 'evenodd',
	ops: cat(rrect(1, .6, 8, 8.8, .8),
		poly([[5.9, .6], [7.7, .6], [7.7, 5.6], [6.8, 4.5], [5.9, 5.6]]))
},
{
	id: 'notification', desc: 'bell', fill: NEUTRAL,
	source: 'no brand → neutral',
	ops: cat(circle(5, 1, .95),
		[M(.6, 8.3), C(1.7, 7.5, 2.15, 6.3, 2.15, 4.6), C(2.15, 2.6, 3.35, 1.2, 5, 1.2),
			C(6.65, 1.2, 7.85, 2.6, 7.85, 4.6), C(7.85, 6.3, 8.3, 7.5, 9.4, 8.3),
			L(9.4, 9.1), L(.6, 9.1), Z])
},
{
	id: 'nuget', desc: 'package with a ribbon and a top tab', fill: '#0B4A80',
	source: 'NuGet blue #004880, lifted',
	ops: cat(rrect(.6, 2.6, 8.8, 6.8, .8), rrect(3.4, .4, 3.2, 2.4, .5),
		rect(4.4, 2.8, 1.2, 6.6, -1))
},
{
	id: 'obsidian', desc: 'faceted gem', fill: '#6A4BA8',
	source: 'Obsidian purple, darkened', rule: 'evenodd',
	ops: cat(poly([[5, .3], [9.4, 3.4], [7.8, 9.7], [2.2, 9.7], [.6, 3.4]]),
		rect(4.3, 2.4, 1.4, 6.5))
},
{
	id: 'opencode', desc: 'terminal plate with a prompt caret', fill: NEUTRAL,
	source: 'monochrome brand → neutral', rule: 'evenodd',
	ops: cat(rrect(.4, 1.4, 9.2, 7.2, 1.3),
		poly([[2.3, 3], [3.6, 3], [6, 5], [3.6, 7], [2.3, 7], [4.7, 5]]),
		rect(6.6, 6.2, 2.4, 1.2))
},
{
	id: 'organism', desc: 'seven-cell rosette', fill: NEUTRAL,
	source: 'no brand → neutral',
	ops: cat(circle(5, 5, 1.3),
		...[0, 60, 120, 180, 240, 300].map(d =>
			circle(5 + 3.6 * Math.cos(d * Math.PI / 180), 5 + 3.6 * Math.sin(d * Math.PI / 180), 1.1)))
},
{
	id: 'other', desc: 'ellipsis on the diagonal', fill: NEUTRAL,
	source: 'no brand → neutral',
	ops: cat(circle(1.55, 1.55, 1.55), circle(5, 5, 1.55), circle(8.45, 8.45, 1.55))
},
{
	id: 'paket', desc: 'two stacked parcels', fill: NEUTRAL,
	source: 'no brand → neutral',
	ops: cat(rrect(2.2, .4, 6, 3.4, .6), rrect(.4, 5, 9.2, 4.6, .6))
}
];
