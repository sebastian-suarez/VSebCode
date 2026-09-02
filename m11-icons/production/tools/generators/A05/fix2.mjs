// fix2.mjs — second proof round: weight and value fixes.
import { readFileSync } from 'node:fs';
import { write, n, circ, circCW } from './a05lib.mjs';

// pcl — round points keep antialiasing away; axis-aligned squares stay crisp at 16 px.
{
	const pts = [[2, 4.5], [6, 2.5], [10.5, 4], [2, 9], [6, 7], [11, 8.5], [4.5, 11.5], [9, 11.5]];
	const d = pts.map(p => `M${n(p[0])} ${n(p[1])}h2.5v2.5h-2.5Z`).join('');
	console.log('pcl', write('pcl', `<path fill="#9E6EC4" d="${d}"/>`));
}

// n64 — the diagonal did not travel far enough to read as the N; wider stride, lighter red.
console.log('n64', write('n64', `<path fill="#C85C4C" d="M2 3.4h2v9.4H2ZM4.7 3.4h2.6l4.2 9.4H8.9ZM12.2 3.4h2v9.4h-2Z"/>`));

// nest-controller — 1.3 px arms went faint; 1.8 px arms, bigger nodes, lighter crimson.
{
	const arm = (x2, y2) => {
		const dx = x2 - 8, dy = y2 - 8, L = Math.hypot(dx, dy), w = .9;
		const px = (-dy / L) * w, py = (dx / L) * w;
		return `M${n(8 + px)} ${n(8 + py)}L${n(x2 + px)} ${n(y2 + py)}L${n(x2 - px)} ${n(y2 - py)}L${n(8 - px)} ${n(8 - py)}Z`;
	};
	const d = arm(8, 3.2) + arm(3.7, 11.4) + arm(12.3, 11.4)
		+ circ(8, 8, 2.3) + circ(8, 2.4, 1.7) + circ(3.2, 11.8, 1.7) + circ(12.8, 11.8, 1.7);
	console.log('nest-controller', write('nest-controller', `<path fill="#D25E72" d="${d}"/>`));
}

// ng-tailwind — the wave ribbon was too thin to survive; 2.6 px band, tailwind's two passes.
{
	const wave = (x, y) => `M${n(x)} ${n(y)}C${n(x + 1.6)} ${n(y - 3)} ${n(x + 4.8)} ${n(y - 2.6)} ${n(x + 6.4)} ${n(y - .8)}`
		+ `c1.2 1.3 2.9 1.6 4.2.2v2.6c-1.3 1.4-3 1.1-4.2-.2-1.6-1.8-4.8-2.2-6.4.8Z`;
	console.log('ng-tailwind', write('ng-tailwind', `<path fill="#C8556F" d="${wave(1.6, 5.2)}${wave(3.8, 9.8)}"/>`));
}

// ngrx-actions — fatter star points, and a plum that carries at 16 px.
{
	const pts = [];
	for (let i = 0; i < 16; i++) {
		const rad = i % 2 ? 3.8 : 7;
		const a = (i * 22.5 - 90) * Math.PI / 180;
		pts.push(`${n(8 + rad * Math.cos(a))} ${n(8 + rad * Math.sin(a))}`);
	}
	console.log('ngrx-actions', write('ngrx-actions', `<path fill="#C86BB8" d="M${pts.join('L')}Z"/>`));
}

// onenote / pgsql — both sat under 0.4 peak contrast; lifted a step (§6.3).
const body = (id) => readFileSync(
	`/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/svg/file/${id}.svg`, 'utf8')
	.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
console.log('onenote', write('onenote', body('onenote').replaceAll('#8A4FB0', '#9E5FC4')));
console.log('pgsql', write('pgsql', body('pgsql').replaceAll('#4C6FC8', '#5A7BD4')));
void circCW;
