// gen2.mjs — A05 slice, icons 29–56.
import { letterPath } from '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/tools/letterpath.mjs';
import { PLATE, badgeLetters, glyphLetters, write, n, circ, circCW } from './a05lib.mjs';

const out = [];
const emit = (id, body) => out.push([id, write(id, body)]);

// 29. ngrx-selectors — a magnifier: the slice picked out of the store.
{
	const ring = `${circ(6.4, 6.4, 4.3)}${circCW(6.4, 6.4, 2.6)}`;
	const handle = `M8.62 10.18 12.62 14.18 14.18 12.62 10.18 8.62Z`;
	emit('ngrx-selectors',
		`<path fill="#C98A3E" fill-rule="evenodd" d="${ring}"/><path fill="#C98A3E" d="${handle}"/>`);
}

// 30. ngrx-state — the store: a container holding one value.
emit('ngrx-state', `<path fill="#3F9E86" fill-rule="evenodd" d="M2.2 2.2h11.6v11.6H2.2ZM4.5 4.5v7h7v-7ZM6.6 6.6h2.8v2.8H6.6Z"/>`);

// 31. nimble — nim's yellow plate, so the letters go dark (§4).
emit('nimble', PLATE('#C6C24C') + badgeLetters('NB', { fill: '#33321A', inkW: 9.4 }).d);

// 32. ninja — a hood and an eye slit.
emit('ninja', `<path fill="#98A0A8" fill-rule="evenodd" d="M2.4 8.6a5.6 5.6 0 0 1 11.2 0v2.6a3 3 0 0 1-3 3H5.4a3 3 0 0 1-3-3ZM4.5 7.2h2.9v1.8H4.5ZM8.6 7.2h2.9v1.8H8.6Z"/>`);

// 33. nitro — boost: the arrow and its speed lines.
emit('nitro', `<path fill="#D9A03E" d="M8.4 3.4 14.6 8l-6.2 4.6ZM1.4 4.2h5.2v1.6H1.4ZM1.4 7.2h6.4v1.6H1.4ZM1.4 10.2h5.2v1.6H1.4Z"/>`);

// 34. nix — the flake: six arms, each forked.
{
	const arms = [];
	const P = (r, deg) => { const a = deg * Math.PI / 180; return [8 + r * Math.cos(a), 8 + r * Math.sin(a)]; };
	const bar = (p, q, w) => {
		const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy);
		const px = (-dy / L) * w, py = (dx / L) * w;
		return `M${n(p[0] + px)} ${n(p[1] + py)}L${n(q[0] + px)} ${n(q[1] + py)}L${n(q[0] - px)} ${n(q[1] - py)}L${n(p[0] - px)} ${n(p[1] - py)}Z`;
	};
	for (const deg of [90, 150, 210, 270, 330, 30]) {
		arms.push(bar(P(0, 0), P(6.3, deg), 0.8));
		arms.push(bar(P(3.5, deg), P(5.5, deg - 42), 0.65));
		arms.push(bar(P(3.5, deg), P(5.5, deg + 42), 0.65));
	}
	emit('nix', `<path fill="#5277C3" d="${arms.join('')}"/>`);
}

// 35. njsproj
emit('njsproj', PLATE('#5FA04E') + badgeLetters('NJS', { inkW: 11.0, ls: -0.02 }).d);

// 36. noc
emit('noc', glyphLetters('NOC', { fill: '#6E7C8E', inkW: 13.0, ls: -0.02 }).d);

// 37. nsi — NSIS.
emit('nsi', glyphLetters('NSIS', { fill: '#6E90B8', inkW: 13.6, ls: -0.02 }).d);

// 38. numpy — the token users read in every import line.
emit('numpy', PLATE('#4A86B8') + badgeLetters('np', { inkW: 9.4 }).d);

// 39. nunjucks — the .njk extension.
emit('nunjucks', glyphLetters('NJK', { fill: '#4E9E62', inkW: 12.8, ls: -0.02 }).d);

// 40. nushell — a terminal pane with a prompt.
emit('nushell', `<path fill="#38856A" fill-rule="evenodd" d="M3 3h10a1.6 1.6 0 0 1 1.6 1.6v6.8A1.6 1.6 0 0 1 13 13H3a1.6 1.6 0 0 1-1.6-1.6V4.6A1.6 1.6 0 0 1 3 3ZM4.6 5.7 3.6 6.7 4.9 8 3.6 9.3l1 1L7.2 8ZM8 9.2h3.4v1.3H8Z"/>`);

// 41. nvidia — the eye.
emit('nvidia', `<path fill="#6FA82E" d="M2 9.6C2 5.6 5.4 3 9.4 3c1.9 0 3.5.5 4.6 1.5-1.1-.5-2.4-.8-3.8-.8-3.4 0-5.8 1.9-5.8 4.8 0 2.2 1.5 3.7 3.8 3.7 2.4 0 4.2-1.6 4.2-3.8 0-1.4-.7-2.4-1.9-2.8 2.5.2 4.1 1.8 4.1 4 0 2.8-2.5 4.8-6.2 4.8C3.9 14.4 2 12.5 2 9.6Z"/>`);

// 42. objectivecpp — the objectivec plate (R3 family), with the ++ said in the letters.
emit('objectivecpp', PLATE('#7C8CA6') + badgeLetters('OC+', { inkW: 11.0, ls: -0.02 }).d);

// 43. ocaml-intf — .mli, in ocaml's tan (GLYPH separates it from the ocaml camel).
emit('ocaml-intf', glyphLetters('MLI', { fill: '#CC9038', inkW: 12.4, ls: -0.02 }).d);

// 44. ocx
emit('ocx', glyphLetters('OCX', { fill: '#8478A8', inkW: 13.0, ls: -0.02 }).d);

// 45. odin
emit('odin', PLATE('#3E6EA8') + badgeLetters('OD', { inkW: 9.4 }).d);

// 46. ogone — the .o3 extension.
emit('ogone', PLATE('#B0567A') + badgeLetters('O3', { inkW: 9.4 }).d);

// 47. onenote — a tabbed notebook with the N knocked out.
{
	const N = letterPath({ text: 'N', cap: 6.6, cx: 6.7, cy: 8, band: 'cap' });
	emit('onenote', `<path fill="#8A4FB0" fill-rule="evenodd" d="M3.4 2h7.2a1.2 1.2 0 0 1 1.2 1.2v9.6a1.2 1.2 0 0 1-1.2 1.2H3.4a1.2 1.2 0 0 1-1.2-1.2V3.2A1.2 1.2 0 0 1 3.4 2ZM12 3.4h2v2.2h-2ZM12 6.9h2v2.2h-2ZM12 10.4h2v2.2h-2ZM${N.d.slice(1)}"/>`);
}

// 48. opam — OCaml's package manager, one step down ocaml's tan.
emit('opam', PLATE('#B07C36') + badgeLetters('OP', { inkW: 9.4 }).d);

// 49. opencl
emit('opencl', PLATE('#5B8C74') + badgeLetters('CL', { inkW: 9.4 }).d);

// 50. openhab — the house.
emit('openhab', `<path fill="#D2703A" fill-rule="evenodd" d="M8 2.2 14.4 7.4h-1.8v6.4H3.4V7.4H1.6ZM6.9 9.6h2.2v4.2H6.9Z"/>`);

// 51. openscad — a solid with a hole cut out of it: the CSG difference.
emit('openscad', `<path fill="#C7A32E" fill-rule="evenodd" d="M2.4 2.4h11.2v11.2H2.4Z${circCW(10, 10, 3.5)}"/>`);

// 52. oso — the bear.
emit('oso', `<path fill="#6E86B8" fill-rule="evenodd" d="${circ(3.9, 4.8, 2.1)}${circ(12.1, 4.8, 2.1)}${circ(8, 9.2, 4.8)}${circCW(8, 11.1, 1.7)}"/>`);

// 53. otne
emit('otne', glyphLetters('OTNE', { fill: '#9E7A5E', inkW: 13.8, ls: -0.02 }).d);

// 54. outlook — mail.
emit('outlook', `<path fill="#5391C4" fill-rule="evenodd" d="M2.4 3.2h11.2a1 1 0 0 1 1 1v7.6a1 1 0 0 1-1 1H2.4a1 1 0 0 1-1-1V4.2a1 1 0 0 1 1-1ZM2 4.4 8 8.9 14 4.4v1.6L8 10.5 2 6Z"/>`);

// 55. ovpn
emit('ovpn', PLATE('#AC6A36') + badgeLetters('VPN', { inkW: 11.0, ls: -0.02 }).d);

// 56. paket
emit('paket', PLATE('#46829E') + badgeLetters('PK', { inkW: 9.4 }).d);

for (const [id, bytes] of out) { console.log(`${id.padEnd(20)} ${bytes} B`); }
console.log(`${out.length} icons`);
