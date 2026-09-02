// A12-r7.mjs — R7 twin check: hard inside slice A12, informational vs the core manifest.
import { readFileSync } from 'node:fs';
import { ALL } from './A12-build.mjs';

const MAN = JSON.parse(readFileSync(
	'/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/set-manifest.json', 'utf8'));

export function hsl(hex) {
	const r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255,
		b = parseInt(hex.slice(5, 7), 16) / 255;
	const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
	let h = 0, s = 0;
	if (mx !== mn) {
		const d = mx - mn;
		s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
		h = mx === r ? ((g - b) / d + (g < b ? 6 : 0)) : mx === g ? ((b - r) / d + 2) : ((r - g) / d + 4);
		h *= 60;
	}
	return [h, s * 100, l * 100];
}
const dh = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
const twin = (A, B) => A.arch === B.arch && A.s >= 25 && B.s >= 25 &&
	dh(A.h, B.h) < 12 && Math.abs(A.l - B.l) < 12 && Math.abs(A.s - B.s) < 25;

const mine = ALL.map(i => {
	const [h, s, l] = hsl(i.fills[0]);
	return { id: i.id, arch: i.arch, hex: i.fills[0], h, s, l };
});
const core = MAN.icons.filter(i => i.kind === 'file').map(i => {
	const [h, s, l] = hsl(i.dominant);
	return { id: i.id, arch: i.archetype, hex: i.dominant, h, s, l };
});

const fmt = (x) => `${x.id}(${x.arch[0]} ${x.hex} h${Math.round(x.h)} s${Math.round(x.s)} l${Math.round(x.l)})`;

console.log('=== HARD: within slice A12 ===');
let n1 = 0;
for (let i = 0; i < mine.length; i++) {
	for (let j = i + 1; j < mine.length; j++) {
		if (twin(mine[i], mine[j])) {
			n1++;
			console.log(`  ${fmt(mine[i])}  ~  ${fmt(mine[j])}   dh ${dh(mine[i].h, mine[j].h).toFixed(0)} dL ${Math.abs(mine[i].l - mine[j].l).toFixed(0)} dS ${Math.abs(mine[i].s - mine[j].s).toFixed(0)}`);
		}
	}
}
console.log(`  ${n1} in-slice twins\n`);

console.log('=== vs core set-manifest (tolerated cross-domain, logged) ===');
let n2 = 0;
for (const a of mine) {
	for (const b of core) {
		if (twin(a, b)) { n2++; console.log(`  ${fmt(a)}  ~  core ${fmt(b)}`); }
	}
}
console.log(`  ${n2} core near-twins`);
