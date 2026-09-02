// gen3.mjs — A05 slice, icons 57–84.
import { letterPath } from '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/tools/letterpath.mjs';
import { PLATE, badgeLetters, glyphLetters, write, n, circ, circCW } from './a05lib.mjs';

const out = [];
const emit = (id, body) => out.push([id, write(id, body)]);

// Hues that the slice-wide R7 pass tunes; kept in one table so a retint is one edit.
export const HUE = {
	palette: '#B7629C', pascal: '#4E7CA8', pascalproject: '#4E7CA8', pawn: '#B0906A',
	pcl: '#9E6EC4', pddl: '#6B79A6', 'pddl-happenings': '#8E7EA8', 'pddl-plan': '#4E8E8E',
	perl6: '#49599C', pgsql: '#4C6FC8', phalcon: '#3E8E9E', phpstan: '#5F6BAE',
	phpunit: '#4C9E5E', pine: '#3E8552', pipBox: '#3776AB', pipArrow: '#D8B44A',
	pipeline: '#7E93B0', pixi: '#C0913E', pkl: '#7E7ABE', plantuml: '#C4574E',
	plastic: '#46809E', platformio: '#C4703A', plop: '#C4923E', plsql: '#A8432F',
	poedit: '#4E92B8'
};

// 57. palette — the mixing board.
emit('palette', `<path fill="${HUE.palette}" fill-rule="evenodd" d="M8 2.2c3.8 0 6.6 2.4 6.6 5.6 0 2-1.4 3.1-2.9 3.1h-1.4c-1 0-1.7.6-1.7 1.5 0 .7.5 1.1.5 1.6 0 .5-.4.8-1.1.8-3.8 0-6.6-2.8-6.6-6.4S4.2 2.2 8 2.2Z${circCW(5.2, 6.1, .95)}${circCW(8, 4.9, .95)}${circCW(10.9, 6.3, .95)}"/>`);

// 58/59. pascal + its project file — one plate, two letter groups (R3 family).
emit('pascal', PLATE(HUE.pascal) + badgeLetters('PAS', { inkW: 11.0, ls: -0.02 }).d);
emit('pascalproject', PLATE(HUE.pascalproject) + badgeLetters('DPR', { inkW: 11.0, ls: -0.02 }).d);

// 60. pawn — the piece the language is named for.
emit('pawn', `<path fill="${HUE.pawn}" d="M8 1.6a2.4 2.4 0 0 1 1.6 4.2c1 .5 1.7 1.5 1.7 2.6 0 1.5-1 2.4-1.4 3.6l.5 2.2h2.5v1.8H3.1v-1.8h2.5l.5-2.2c-.4-1.2-1.4-2.1-1.4-3.6 0-1.1.7-2.1 1.7-2.6A2.4 2.4 0 0 1 8 1.6Z"/>`);

// 61. pcl — a point cloud.
{
	const pts = [[4, 5.2], [7.4, 3.4], [11, 4.8], [2.9, 8.8], [6.2, 7.4], [9.6, 8],
	[12.9, 8.4], [4.6, 11.6], [8.2, 11], [11.4, 12]];
	emit('pcl', `<path fill="${HUE.pcl}" d="${pts.map(p => circ(p[0], p[1], 1.05)).join('')}"/>`);
}

// 62. pddl
emit('pddl', glyphLetters('PDDL', { fill: HUE.pddl, inkW: 13.8, ls: -0.02 }).d);

// 63. pddl-happenings — events on a timeline.
emit('pddl-happenings', `<path fill="${HUE['pddl-happenings']}" d="M1.4 8.4h13.2v1.6H1.4ZM3.6 4.6h1.6v3.8H3.6ZM7.2 3.2h1.6v5.2H7.2ZM10.8 5.6h1.6v2.8h-1.6Z"/>`);

// 64. pddl-plan — the goal flag.
emit('pddl-plan', `<path fill="${HUE['pddl-plan']}" d="M2.6 1.8h1.6v12.4H2.6ZM4.2 2.4h9.5l-2.4 3.1 2.4 3.1H4.2Z"/>`);

// 65. perl6 — Raku, on perl's plate (R3 family).
emit('perl6', PLATE(HUE.perl6) + badgeLetters('P6', { inkW: 9.4 }).d);

// 66. pgsql — the elephant.
emit('pgsql', `<path fill="${HUE.pgsql}" fill-rule="evenodd" d="M8 2.4c2.8 0 5 2 5 4.6 0 1.4-.5 2.4-1.3 3.3-.5.6-.8 1.2-.8 2 0 .5.2.9.2 1.4 0 1-.8 1.7-1.8 1.7s-1.7-.7-1.7-1.7c0-1.4.6-2.1.6-2.9 0-.6-.4-1-1-1h-1v4.1c0 1-.8 1.7-1.8 1.7s-1.8-.7-1.8-1.7V7.4C2.6 4.6 5 2.4 8 2.4Z${circCW(9.9, 6.1, .85)}"/>`);

// 67. phalcon
emit('phalcon', PLATE(HUE.phalcon) + badgeLetters('PH', { inkW: 9.4 }).d);

// 68. phpstan
emit('phpstan', PLATE(HUE.phpstan) + badgeLetters('PS', { inkW: 9.4 }).d);

// 69. phpunit — the green bar, said as a tick.
emit('phpunit', `<path fill="${HUE.phpunit}" d="M2 8.6 4 6.6 6.3 8.9 12.2 2.8 14.2 4.8 6.3 12.9Z"/>`);

// 70. pine
emit('pine', `<path fill="${HUE.pine}" d="M8 1.6 12.2 7.2H10.2L13.4 11.6H9v2.8H7v-2.8H2.6L5.8 7.2H3.8Z"/>`);

// 71. pip — a python package, going in (R2: python's two tones are the identity).
emit('pip', `<path fill="${HUE.pipBox}" d="M1.8 3.4h12.4v2.2H1.8ZM2.6 6.2h10.8v7.6H2.6Z"/><path fill="${HUE.pipArrow}" d="M7 6.6h2v3.2h2.2L8 12.8 4.8 9.8H7Z"/>`);

// 72. pipeline — three stages, wired.
emit('pipeline', `<path fill="${HUE.pipeline}" d="M1.2 4.4h3.6v7.2H1.2ZM6.2 4.4h3.6v7.2H6.2ZM11.2 4.4h3.6v7.2h-3.6ZM4.8 7.4h1.4v1.2H4.8ZM9.8 7.4h1.4v1.2H9.8Z"/>`);

// 73. pixi
emit('pixi', glyphLetters('PIXI', { fill: HUE.pixi, inkW: 13.4, ls: -0.02 }).d);

// 74. pkl
emit('pkl', PLATE(HUE.pkl) + badgeLetters('pkl', { inkW: 10.4 }).d);

// 75. plantuml — a UML class box.
emit('plantuml', `<path fill="${HUE.plantuml}" fill-rule="evenodd" d="M2.2 2.6h11.6v10.8H2.2ZM3.4 6h9.2v1.2H3.4ZM3.4 8.8h9.2v1.2H3.4Z"/>`);

// 76. plastic
emit('plastic', PLATE(HUE.plastic) + badgeLetters('PL', { inkW: 9.4 }).d);

// 77. platformio
emit('platformio', PLATE(HUE.platformio) + badgeLetters('PIO', { inkW: 11.0, ls: -0.02 }).d);

// 78. plop — the drop.
emit('plop', `<path fill="${HUE.plop}" d="M8 1.8c2.8 3.4 5 5.9 5 8.2A5 5 0 0 1 3 10c0-2.3 2.2-4.8 5-8.2Z"/>`);

// 79. plsql — Oracle's store (R3 family with sql / sqlite).
emit('plsql', `<path fill="${HUE.plsql}" fill-rule="evenodd" d="M2.6 3.8C2.6 2.6 5 1.7 8 1.7s5.4.9 5.4 2.1v8.4c0 1.2-2.4 2.1-5.4 2.1s-5.4-.9-5.4-2.1ZM2.6 6.7h10.8v1H2.6Z"/>`);

// 80-83. the PL/SQL package quartet — one plate, four letter groups (R3 family).
for (const [id, text] of [['plsql-package', 'PKG'], ['plsql-package-body', 'BDY'],
['plsql-package-header', 'HDR'], ['plsql-package-spec', 'SPC']]) {
	emit(id, PLATE(HUE.plsql) + badgeLetters(text, { inkW: 11.0, ls: -0.02 }).d);
}

// 84. poedit — the translated string.
{
	const A = letterPath({ text: 'A', cap: 5.4, cx: 8, cy: 6.6, band: 'cap' });
	emit('poedit', `<path fill="${HUE.poedit}" fill-rule="evenodd" d="M2.4 2.6h11.2a1.4 1.4 0 0 1 1.4 1.4v6.4a1.4 1.4 0 0 1-1.4 1.4H8.4l-3.4 2.6v-2.6H2.4A1.4 1.4 0 0 1 1 10.4V4a1.4 1.4 0 0 1 1.4-1.4ZM${A.d.slice(1)}"/>`);
}

for (const [id, bytes] of out) { console.log(`${id.padEnd(22)} ${bytes} B`); }
console.log(`${out.length} icons`);
