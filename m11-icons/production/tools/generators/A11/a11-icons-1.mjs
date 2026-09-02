// A11 slice, icons 1-27 (publiccode -> rubocop).
import { P, PE, badge } from './a11-lib.mjs';

const circ = (cx, cy, r) => `M${cx - r} ${cy}a${r} ${r} 0 1 1 ${2 * r} 0a${r} ${r} 0 1 1 ${-2 * r} 0`;

export const ICONS = {};
const add = (id, archetype, fill, body, note) => { ICONS[id] = { archetype, fill, body, note }; };

// 1 publiccode — civic building (pediment, columns, plinth)
add('publiccode', 'SILHOUETTE', '#5E8CAE',
	P('#5E8CAE', 'M8 3L14.2 6.3H1.8ZM2.4 6.9H13.6V8H2.4ZM3.3 8.6H5.1V11.7H3.3ZM7.1 8.6H8.9V11.7H7.1ZM10.9 8.6H12.7V11.7H10.9ZM1.8 12.3H14.2V13.4H1.8Z'),
	'no brand → civic blue #5E8CAE (vsicons publiccode reads blue)');

// 2 pulumi — cloud over three fall-lines (infrastructure delivery)
add('pulumi', 'SILHOUETTE', '#8B4FA0',
	P('#8B4FA0', `${circ(8, 6.3, 3)}${circ(4.6, 7.4, 2.1)}${circ(11.7, 7.5, 2)}M4.6 7H11.7V9.5H4.6ZM4.5 10.6H6L4.9 13.5H3.4ZM7.9 10.6H9.4L8.3 13.5H6.8ZM11.3 10.6H12.8L11.7 13.5H10.2Z`),
	'no brand → Pulumi violet #8A3391 lifted to #8B4FA0');

// 3 puppeteer — marionette: control bar, strings, head
add('puppeteer', 'GLYPH', '#46A396',
	P('#46A396', `M3.2 2.4H12.8V3.7H3.2ZM5 3.7H6.3V8.6H5ZM9.7 3.7H11V8.6H9.7Z${circ(8, 10.5, 2.9)}`),
	'no brand → Puppeteer mint #40B5A4, pulled green to clear the slice teal lane (R7)');

// 4 purgecss — broom
add('purgecss', 'SILHOUETTE', '#5FA98F',
	PE('#5FA98F', 'M7.3 1.6H8.7V7.4H7.3ZM4.3 7.4H11.7L13.4 13.6H2.6ZM6.1 10.5H7V13.6H6.1ZM9 10.5H9.9V13.6H9Z'),
	'no brand → matte green #5FA98F (sweep/purge)');

// 5 pyenv — stack of version discs
add('pyenv', 'SILHOUETTE', '#5C86B0',
	P('#5C86B0', 'M3.1 4.3a4.9 1.45 0 1 1 9.8 0a4.9 1.45 0 1 1-9.8 0M3.1 8a4.9 1.45 0 1 1 9.8 0a4.9 1.45 0 1 1-9.8 0M3.1 11.7a4.9 1.45 0 1 1 9.8 0a4.9 1.45 0 1 1-9.8 0'),
	'no brand → python blue-grey #5C86B0 (kept off core python #3776AB)');

// 6 pypi — package carton with a seam
add('pypi', 'SILHOUETTE', '#3775A9',
	PE('#3775A9', 'M1.8 3.2H14.2V5.6H1.8ZM2.6 5.6H13.4V13.8H2.6ZM7.25 3.2H8.75V5.6H7.25Z'),
	'brand #3775A9');

// 7 pytest — round-bottom flask
add('pytest', 'SILHOUETTE', '#4E9FBF',
	P('#4E9FBF', `M5.9 1.6H10.1V3H5.9ZM6.8 3H9.2V6.4H6.8Z${circ(8, 9.4, 5)}`),
	'no brand → pytest doc blue #4E9FBF');

// 8 pyup — double up-chevron (dependency bump)
add('pyup', 'GLYPH', '#6FA8B8',
	P('#6FA8B8', 'M8 2.6L13.2 7.4L11.6 8.8L8 5.5L4.4 8.8L2.8 7.4ZM8 7.6L13.2 12.4L11.6 13.8L8 10.5L4.4 13.8L2.8 12.4Z'),
	'no brand → muted indigo (R7 spread across the slice glyph lane)');

// 9 quasar — ring with a tail (the Q mark, drawn as geometry per R1)
add('quasar', 'GLYPH', '#3FA0C9',
	PE('#3FA0C9', `${circ(7.4, 7.4, 5.2)}${circ(7.4, 7.4, 3.4)}M9.1 7.7L12.7 11.3L11.3 12.7L7.7 9.1Z`),
	'no brand → Quasar aqua');

// 10 railway — rails and ties
add('railway', 'GLYPH', '#C8CBD0',
	P('#C8CBD0', 'M4.6 2.2H6V13.8H4.6ZM10 2.2H11.4V13.8H10ZM3 4H13V5.3H3ZM3 7.35H13V8.65H3ZM3 10.7H13V12H3Z'),
	'brand #0B0D0E lifted to #C8CBD0 (§6.3)');

// 11 razzle — dazzle stripes
add('razzle', 'GLYPH', '#C4587E',
	P('#C4587E', 'M5.6 2.4H7.6L5.6 13.6H3.6ZM9 2.4H11L9 13.6H7ZM12.4 2.4H14.4L12.4 13.6H10.4Z'),
	'no brand → matte rose #C4587E');

// 12 rc — bare RC letterforms
add('rc', 'GLYPH', '#8A8F98', null, 'no brand → neutral #8A8F98');

// 13 reactrouter — routed S-path between two nodes
add('reactrouter', 'SILHOUETTE', '#D4535E',
	P('#D4535E', `M2.6 4H4.6V12.8H2.6ZM3.6 10.8H12.2V12.8H3.6Z${circ(3.6, 4, 2.2)}${circ(12.2, 11.8, 2.2)}`),
	'brand #F44250 matted to #D4535E');

// 14 registry — four-pane window mark
add('registry', 'SILHOUETTE', '#4E8FC4',
	P('#4E8FC4', 'M2 3.9L7.4 2.9V7.5H2ZM8.2 2.75L14 1.7V7.5H8.2ZM2 8.2H7.4V12.8L2 11.9ZM8.2 8.2H14V14L8.2 13.05Z'),
	'no brand → Windows blue #4E8FC4');

// 15 rehype — double right-chevron (hypertext pipeline)
add('rehype', 'GLYPH', '#9A7FC8',
	P('#9A7FC8', 'M5 3.6L7.9 8L5 12.4H2.9L5.8 8L2.9 3.6ZM10.9 3.6L13.8 8L10.9 12.4H8.8L11.7 8L8.8 3.6Z'),
	'no brand → unified violet #9A7FC8');

// 16 remark — a pair of quote marks
add('remark', 'GLYPH', '#5B94C4',
	P('#5B94C4', `${circ(4.8, 6, 2.3)}M2.5 6H7.1L4.1 11.2ZM${11.2 - 2.3} 6a2.3 2.3 0 1 1 4.6 0a2.3 2.3 0 1 1-4.6 0M8.9 6H13.5L10.5 11.2Z`),
	'no brand → unified violet (R7 spread; kept off core markdown)');

// 17 remix — light plate, dark R
add('remix', 'BADGE', '#D2D5D9', badge('#D2D5D9', 'R', '#23272B').body,
	'brand #000000 lifted to plate #D2D5D9 with a dark letter (§4)');

// 18 render — service rack
add('render', 'SILHOUETTE', '#3E9BB0',
	PE('#3E9BB0', 'M3 3H13A.8 .8 0 0 1 13.8 3.8V5.2A.8 .8 0 0 1 13 6H3A.8 .8 0 0 1 2.2 5.2V3.8A.8 .8 0 0 1 3 3ZM3 6.6H13A.8 .8 0 0 1 13.8 7.4V8.8A.8 .8 0 0 1 13 9.6H3A.8 .8 0 0 1 2.2 8.8V7.4A.8 .8 0 0 1 3 6.6ZM3 10.2H13A.8 .8 0 0 1 13.8 11V12.4A.8 .8 0 0 1 13 13.2H3A.8 .8 0 0 1 2.2 12.4V11A.8 .8 0 0 1 3 10.2ZM3.45 4.5a.85 .85 0 1 1 1.7 0a.85 .85 0 1 1-1.7 0M3.45 8.1a.85 .85 0 1 1 1.7 0a.85 .85 0 1 1-1.7 0M3.45 11.7a.85 .85 0 1 1 1.7 0a.85 .85 0 1 1-1.7 0'),
	'brand #1A1F6C is the plate hue family; rack uses #3E9BB0');

// 19 renovate — paint roller
add('renovate', 'SILHOUETTE', '#6B72C0',
	P('#6B72C0', 'M3.4 2.6H11A.9 .9 0 0 1 11.9 3.5V4.5A.9 .9 0 0 1 11 5.4H3.4A.9 .9 0 0 1 2.5 4.5V3.5A.9 .9 0 0 1 3.4 2.6ZM11.9 3.35H12.6A.7 .7 0 0 1 13.3 4.05V7.6H12V4.65H11.9ZM11.9 7.6H13.3A.6 .6 0 0 1 13.9 8.2V13A.6 .6 0 0 1 13.3 13.6H11.9A.6 .6 0 0 1 11.3 13V8.2A.6 .6 0 0 1 11.9 7.6Z'),
	'brand #1A1F6C lifted to #6B72C0');

// 20 retext — A with a proofing squiggle
add('retext', 'GLYPH', '#C48A4E', null, 'no brand → warm sand');

// 21 robots — robot head
add('robots', 'SILHOUETTE', '#8A93A0',
	PE('#8A93A0', `${circ(8, 2, 1)}M7.4 2.6H8.6V4.6H7.4ZM4.8 4.2H11.2A2.2 2.2 0 0 1 13.4 6.4V11A2.2 2.2 0 0 1 11.2 13.2H4.8A2.2 2.2 0 0 1 2.6 11V6.4A2.2 2.2 0 0 1 4.8 4.2ZM4.35 7.6a1.25 1.25 0 1 1 2.5 0a1.25 1.25 0 1 1-2.5 0M9.15 7.6a1.25 1.25 0 1 1 2.5 0a1.25 1.25 0 1 1-2.5 0M5.6 10.2H10.4V11.4H5.6Z`),
	'no brand → neutral steel #8A93A0');

// 22 rocket — release rocket
add('rocket', 'SILHOUETTE', '#C0563F',
	PE('#C0563F', 'M8 1.4C10.2 3.4 11.2 6.2 11.2 9V11.2H4.8V9C4.8 6.2 5.8 3.4 8 1.4ZM4.8 7.8L3 10.3V12.7L4.8 11.5ZM11.2 7.8L13 10.3V12.7L11.2 11.5ZM6.6 11.8H9.4L8 14.6ZM6.75 6a1.25 1.25 0 1 1 2.5 0a1.25 1.25 0 1 1-2.5 0'),
	'no brand → release red #C0563F');

// 23 rolldown — bars funnelling into a bundle
add('rolldown', 'SILHOUETTE', '#D07C3C',
	P('#D07C3C', 'M2.4 2.6H13.6V4H2.4ZM3.8 5H12.2V6.4H3.8ZM5.2 7.4H10.8V8.8H5.2ZM4.9 9.8H11.1L8 13.6Z'),
	'no brand → Rolldown amber #D07C3C (kept off rollup red)');

// 24 rome — classical column
add('rome', 'GLYPH', '#C89A55',
	PE('#C89A55', 'M4.2 2.6H11.8V4.2H4.2ZM5.6 4.2H10.4V11.4H5.6ZM3.8 11.4H12.2V13.4H3.8ZM7.5 4.8H8.5V10.8H7.5Z'),
	'no brand → Roman travertine, neutral lane (HSL S < 25, R7-exempt)');

// 25 rspec — spec list
add('rspec', 'GLYPH', '#B4535F',
	P('#B4535F', `${circ(3.2, 4.2, 1.1)}M5.4 3.4H13.6A.8 .8 0 0 1 13.6 5H5.4A.8 .8 0 0 1 5.4 3.4Z${circ(3.2, 8.1, 1.1)}M5.4 7.3H13.6A.8 .8 0 0 1 13.6 8.9H5.4A.8 .8 0 0 1 5.4 7.3Z${circ(3.2, 12, 1.1)}M5.4 11.2H10.8A.8 .8 0 0 1 10.8 12.8H5.4A.8 .8 0 0 1 5.4 11.2Z`),
	'no brand → RSpec maroon #B4535F');

// 26 rstack — stacked perspective bars
add('rstack', 'SILHOUETTE', '#D4703A',
	P('#D4703A', 'M5.7 3H10.3V7.6H5.7ZM2.2 8.4H6.8V13H2.2ZM9.2 8.4H13.8V13H9.2Z'),
	'no brand → Rspack orange #D4703A');

// 27 rubocop — police cap
add('rubocop', 'SILHOUETTE', '#7E8AA8',
	P('#7E8AA8', 'M2.8 8.6C2.8 4.6 5 2.6 8 2.6C11 2.6 13.2 4.6 13.2 8.6ZM2.4 9H13.6V10.6H2.4ZM1.6 10.9H14.4C14.4 12.7 11.6 13.7 8 13.7C4.4 13.7 1.6 12.7 1.6 10.9Z'),
	'no brand → RuboCop slate blue #7E8AA8');
