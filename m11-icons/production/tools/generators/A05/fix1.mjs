// fix1.mjs — redraws after the first 16 px proof round.
import { write, n, circ, circCW } from './a05lib.mjs';

// nest-service — the broadcast arcs read as scattered strokes at 16 px; a gear is the
// unambiguous "the thing that does the work" mark and clears R8 against config/tsconfig.
{
	const R = 6.4, r = 4.7, cx = 8, cy = 8;
	const P = (rad, deg) => { const a = (deg - 90) * Math.PI / 180; return `${n(cx + rad * Math.cos(a))} ${n(cy + rad * Math.sin(a))}`; };
	const pts = [];
	for (let i = 0; i < 8; i++) { const b = i * 45; pts.push(P(R, b - 13), P(R, b + 13), P(r, b + 20), P(r, b + 25)); }
	console.log('nest-service', write('nest-service', `<path fill="#9B7ACC" fill-rule="evenodd" d="M${pts.join('L')}Z${circCW(cx, cy, 2.1)}"/>`));
}

// pcl — 2.1 px points half-vanished; seven 3.2 px points read as a cloud.
{
	const pts = [[4.2, 4.4], [8.6, 3], [12.2, 5.6], [3, 9.4], [7.6, 7.8], [11.6, 10.2], [6.8, 12.6]];
	console.log('pcl', write('pcl', `<path fill="#9E6EC4" d="${pts.map(p => circ(p[0], p[1], 1.6)).join('')}"/>`));
}

// mustache — read fine but sat 6.5 px tall; stretched to the wide-flat band.
console.log('mustache', write('mustache', `<path fill="#B5824A" d="M1.3 5.3C3.5 2.9 6.1 3.5 8 5.3 9.9 3.5 12.5 2.9 14.7 5.3 14 11.6 10.5 13.6 8 9.6 5.5 13.6 2 11.6 1.3 5.3Z"/>`));

// ngrx-actions — separate rays antialiased away; one solid eight-point star instead.
{
	const pts = [];
	for (let i = 0; i < 16; i++) {
		const rad = i % 2 ? 3.1 : 7;
		const a = (i * 22.5 - 90) * Math.PI / 180;
		pts.push(`${n(8 + rad * Math.cos(a))} ${n(8 + rad * Math.sin(a))}`);
	}
	console.log('ngrx-actions', write('ngrx-actions', `<path fill="#B94FA8" d="M${pts.join('L')}Z"/>`));
}

// pgsql — the first blob read as two legs; head + ear + trunk, with the eye knocked out.
console.log('pgsql', write('pgsql', `<path fill="#4C6FC8" fill-rule="evenodd" d="${circ(8.4, 6.6, 4.4)}${circ(4.2, 7, 2.9)}M11.3 9.2c0 2.7-1 3.6-2.7 5l-1.7-1.8c1.3-1.1 1.9-1.7 1.9-3.2Z${circCW(9.9, 5.6, .8)}"/>`));

// ninja — the eye slits were a single scanline; one row taller each.
console.log('ninja', write('ninja', `<path fill="#98A0A8" fill-rule="evenodd" d="M2.4 8.6a5.6 5.6 0 0 1 11.2 0v2.6a3 3 0 0 1-3 3H5.4a3 3 0 0 1-3-3ZM4.5 6.9h2.9v2.2H4.5ZM8.6 6.9h2.9v2.2H8.6Z"/>`));
