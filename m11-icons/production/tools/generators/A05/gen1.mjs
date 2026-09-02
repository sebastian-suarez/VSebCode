// gen1.mjs — A05 slice, icons 1–28.
import { letterPath } from '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/tools/letterpath.mjs';
import { PLATE, badgeLetters, glyphLetters, write, n, circ, circCW } from './a05lib.mjs';

const out = [];
const emit = (id, body) => out.push([id, write(id, body)]);

// 1. mson — GLYPH wordmark. MSON has no mark of its own; the extension is the read.
emit('mson', glyphLetters('MSON', { fill: '#7BA3C0', inkW: 13.8, ls: -0.02 }).d);

// 2. msw — BADGE, Mock Service Worker orange.
emit('msw', PLATE('#D4763C') + badgeLetters('MSW', { inkW: 11.0, ls: -0.02 }).d);

// 3. mustache — the real mark: a handlebar moustache.
emit('mustache', `<path fill="#B5824A" d="M1.3 5.9C3.5 4.1 6.1 4.5 8 5.9 9.9 4.5 12.5 4.1 14.7 5.9 14 10.8 10.5 12.3 8 9.2 5.5 12.3 2 10.8 1.3 5.9Z"/>`);

// 4-6. Miva Template trio — one plate, one letter group, a language chip on 5 and 6 (R3 family).
const MVT_PLATE = '#6E7F9E';
const mvtLetters = badgeLetters('MVT', { inkW: 11.0, ls: -0.02 }).d;
const chip = (fill) => `<path fill="${fill}" d="M9.8 1H12a3 3 0 0 1 3 3v2.2Z"/>`;
emit('mvt', PLATE(MVT_PLATE) + mvtLetters);
emit('mvtcss', PLATE(MVT_PLATE) + chip('#3E93C8') + mvtLetters);
emit('mvtjs', PLATE(MVT_PLATE) + chip('#E8D44D') + mvtLetters);

// 7. mwb — MySQL Workbench, MySQL teal-blue.
emit('mwb', glyphLetters('MWB', { fill: '#3D8296', inkW: 13.0, ls: -0.02 }).d);

// 8. mxml — Flex MXML.
emit('mxml', glyphLetters('MXML', { fill: '#9A6FA8', inkW: 13.8, ls: -0.02 }).d);

// 9. n64 — the N64 wordmark N, drawn as three geometric bars (R1: a drawn mark, not type).
emit('n64', `<path fill="#B0483E" d="M2.2 3.4h2.1v9.4H2.2ZM5 3.4h2.2l3.6 9.4H8.6ZM11.5 3.4h2.1v9.4h-2.1Z"/>`);

// 10. nanostaged
emit('nanostaged', PLATE('#7BA84E') + badgeLetters('NS', { inkW: 9.4 }).d);

// 11. nearly — light lilac plate, so the letters go dark (§4).
emit('nearly', PLATE('#BCA4D8') + badgeLetters('NE', { fill: '#3E3050', inkW: 9.4 }).d);

// 12. neo4j — the real mark: three connected nodes.
{
	const A = [3.5, 11.6], B = [8.3, 3.7], C = [12.5, 10.2];
	const edge = (p, q, w = 0.65) => {
		const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy);
		const px = (-dy / L) * w, py = (dx / L) * w;
		return `M${n(p[0] + px)} ${n(p[1] + py)}L${n(q[0] + px)} ${n(q[1] + py)}L${n(q[0] - px)} ${n(q[1] - py)}L${n(p[0] - px)} ${n(p[1] - py)}Z`;
	};
	const d = edge(A, B) + edge(B, C) + edge(A, C)
		+ circ(A[0], A[1], 2.3) + circ(B[0], B[1], 2) + circ(C[0], C[1], 1.8);
	emit('neo4j', `<path fill="#4581C3" d="${d}"/>`);
}

// 13. nest-controller — a routing hub: one core, three served arms.
{
	const hub = circ(8, 8, 2.1);
	const arm = (x2, y2) => {
		const dx = x2 - 8, dy = y2 - 8, L = Math.hypot(dx, dy);
		const px = (-dy / L) * 0.65, py = (dx / L) * 0.65;
		return `M${n(8 + px)} ${n(8 + py)}L${n(x2 + px)} ${n(y2 + py)}L${n(x2 - px)} ${n(y2 - py)}L${n(8 - px)} ${n(8 - py)}Z`;
	};
	const d = arm(8, 3.4) + arm(3.9, 11.4) + arm(12.1, 11.4)
		+ hub + circ(8, 2.5, 1.5) + circ(3.3, 11.7, 1.5) + circ(12.7, 11.7, 1.5);
	emit('nest-controller', `<path fill="#C4485F" d="${d}"/>`);
}

// 14. nest-decorator — the real mark: the decorator "@".
{
	const r = letterPath({ text: '@', inkHeight: 11.6, cx: 8, cy: 8, band: 'ink' });
	emit('nest-decorator', `<path fill="#A96BC4" d="${r.d}"/>`);
}

// 15. nest-filter — funnel.
emit('nest-filter', `<path fill="#C79A3A" d="M1.8 3.1h12.4l-4.7 5.6v5.2l-3-1.7V8.7Z"/>`);

// 16. nest-gateway — a plug: the socket the app is reached through.
emit('nest-gateway', `<path fill="#3F92B8" d="M5 1.8h1.5v3.4H5ZM9.5 1.8H11v3.4H9.5ZM4.4 4.8h7.2a1.4 1.4 0 0 1 1.4 1.4v2.4a1.4 1.4 0 0 1-1.4 1.4H4.4A1.4 1.4 0 0 1 3 8.6V6.2A1.4 1.4 0 0 1 4.4 4.8ZM7.15 10h1.7v4.2h-1.7Z"/>`);

// 17. nest-guard — a stop octagon.
{
	const R = 6.3, t = R * Math.SQRT1_2 * 0.828 / 2 + 0; // half-side projection
	const a = R * 0.4142;
	const pts = [[8 - R, 8 - a], [8 - a, 8 - R], [8 + a, 8 - R], [8 + R, 8 - a],
	[8 + R, 8 + a], [8 + a, 8 + R], [8 - a, 8 + R], [8 - R, 8 + a]];
	const poly = 'M' + pts.map(p => `${n(p[0])} ${n(p[1])}`).join('L') + 'Z';
	const bar = `M4.3 7.1v1.8h7.4V7.1Z`;
	emit('nest-guard', `<path fill="#4E9E6E" fill-rule="evenodd" d="${poly}${bar}"/>`);
	void t;
}

// 18. nest-interceptor — a request caught and turned.
emit('nest-interceptor', `<path fill="#D0763A" d="M1.8 10.2h7.8v1.6H1.8ZM8 6.1h1.6v5.7H8ZM8.8 2.3 12 6.5H5.6Z"/>`);

// 19. nest-middleware — three layers, the middle one inset.
emit('nest-middleware', `<path fill="#8A93A8" d="M1.6 2.6h12.8v2.4H1.6ZM3.4 6.8h9.2v2.4H3.4ZM1.6 11h12.8v2.4H1.6Z"/>`);

// 20. nest-module — a brick: the unit a Nest app is assembled from.
emit('nest-module', `<path fill="#6E86C4" d="M4.2 3.4h2.6v2.6H4.2ZM9.2 3.4h2.6v2.6H9.2ZM3.4 5.4h9.2a1 1 0 0 1 1 1v5.6a1 1 0 0 1-1 1H3.4a1 1 0 0 1-1-1V6.4a1 1 0 0 1 1-1Z"/>`);

// 21. nest-pipe — a pipe section with flanges.
emit('nest-pipe', `<path fill="#4EA898" d="M1.6 5.6h12.8v4.8H1.6ZM1.6 3.6h2.3v8.8H1.6ZM12.1 3.6h2.3v8.8h-2.3Z"/>`);

// 22. nest-resolver — a bullseye: the field the resolver pins down.
emit('nest-resolver', `<path fill="#B0607E" fill-rule="evenodd" d="${circ(8, 8, 6.1)}${circCW(8, 8, 4.4)}${circ(8, 8, 2.4)}"/>`);

// 23. nest-service — what the app provides, radiating from the injected source.
{
	const cx = 3.9, cy = 12.1, t = 1.6;
	const band = (R) => `M${n(cx + R)} ${n(cy)}A${n(R)} ${n(R)} 0 0 0 ${n(cx)} ${n(cy - R)}`
		+ `v${n(t)}A${n(R - t)} ${n(R - t)} 0 0 1 ${n(cx + R - t)} ${n(cy)}Z`;
	emit('nest-service', `<path fill="#9E8ACC" d="${circ(cx, cy, 1.7)}${band(4.9)}${band(8.7)}"/>`);
}

// 24. nextflow — three chevrons: the pipeline flowing forward.
{
	const chev = (x0) => `M${n(x0)} 4h1.9l3.1 4-3.1 4H${n(x0)}l3.1-4Z`;
	emit('nextflow', `<path fill="#35A98F" d="${chev(1)}${chev(4.6)}${chev(8.2)}"/>`);
}

// 25. ng-tailwind — the tailwind double wave in Angular's red (R3 family rhyme with tailwind).
{
	const wave = (x, y) => `M${n(x)} ${n(y)}c.5-2 1.8-3 3.8-3 3 0 3.4 2.3 5 2.7 1 .25 1.85-.1 2.6-1.1-.5 2-1.8 3-3.8 3-3 0-3.4-2.3-5-2.7-1-.25-1.85.1-2.6 1.1Z`;
	emit('ng-tailwind', `<path fill="#C8556F" d="${wave(3, 5)}${wave(1.6, 10.2)}"/>`);
}

// 26. ngrx-actions — the dispatch: one event going out in every direction.
{
	const rays = [];
	for (let i = 0; i < 8; i++) {
		const a = i * 45 * Math.PI / 180, w = 0.75;
		const p = [8 + 3.5 * Math.cos(a), 8 + 3.5 * Math.sin(a)];
		const q = [8 + 6.5 * Math.cos(a), 8 + 6.5 * Math.sin(a)];
		const px = -Math.sin(a) * w, py = Math.cos(a) * w;
		rays.push(`M${n(p[0] + px)} ${n(p[1] + py)}L${n(q[0] + px)} ${n(q[1] + py)}L${n(q[0] - px)} ${n(q[1] - py)}L${n(p[0] - px)} ${n(p[1] - py)}Z`);
	}
	emit('ngrx-actions', `<path fill="#B94FA8" d="${circ(8, 8, 2.4)}${rays.join('')}"/>`);
}

// 27. ngrx-effects — the side-effect loop.
emit('ngrx-effects', `<path fill="#7E6FC8" d="M8 2.1A5.9 5.9 0 1 1 2.1 8h1.7A4.2 4.2 0 1 0 8 3.8ZM8 .9 11.6 2.95 8 5Z"/>`);

// 28. ngrx-reducer — two streams folded into one.
emit('ngrx-reducer', `<path fill="#4E93B8" d="M2 2.7 7.9 6.6 7.1 7.9 1.2 4ZM2 13.3 7.9 9.4 7.1 8.1 1.2 12ZM6.6 7.25h4.9v1.5H6.6ZM10.7 4.6 14.6 8l-3.9 3.4Z"/>`);

for (const [id, bytes] of out) { console.log(`${id.padEnd(20)} ${bytes} B`); }
console.log(`${out.length} icons`);
