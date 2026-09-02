#!/usr/bin/env node
// solve-hues.mjs — push the A03 BADGE/GLYPH hues apart until R7 is clean inside the
// slice, minimising both the move from the intended hue and the number of core twins.
import { readFileSync, writeFileSync } from 'node:fs';

const ROOT = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production';
const roster = JSON.parse(readFileSync(new URL('./roster.json', import.meta.url), 'utf8'));
const core = JSON.parse(readFileSync(`${ROOT}/set-manifest.json`, 'utf8')).icons.filter(i => i.kind === 'file');

function hsl(hex) {
	const r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255, b = parseInt(hex.slice(5, 7), 16) / 255;
	const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, l = (mx + mn) / 2;
	let h = 0;
	if (d) {
		if (mx === r) { h = ((g - b) / d) % 6; } else if (mx === g) { h = (b - r) / d + 2; } else { h = (r - g) / d + 4; }
		h *= 60; if (h < 0) { h += 360; }
	}
	return { h, s: (d ? d / (1 - Math.abs(2 * l - 1)) : 0) * 100, l: l * 100 };
}
function hex({ h, s, l }) {
	const S = s / 100, L = l / 100;
	const c = (1 - Math.abs(2 * L - 1)) * S, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = L - c / 2;
	const t = h / 60;
	const [r, g, b] = t < 1 ? [c, x, 0] : t < 2 ? [x, c, 0] : t < 3 ? [0, c, x] : t < 4 ? [0, x, c] : t < 5 ? [x, 0, c] : [c, 0, x];
	return '#' + [r, g, b].map(v => Math.round((v + m) * 255).toString(16).padStart(2, '0').toUpperCase()).join('');
}
const dHue = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
const twin = (a, b) => a.s >= 25 && b.s >= 25 && dHue(a.h, b.h) < 12 && Math.abs(a.l - b.l) < 12 && Math.abs(a.s - b.s) < 25;
// same test with a rounding margin, used while searching
const twinM = (a, b) => a.s >= 24 && b.s >= 24 && dHue(a.h, b.h) < 13.5 && Math.abs(a.l - b.l) < 13.5 && Math.abs(a.s - b.s) < 26.5;

const FAMILIES = [
	['fla', 'flash'], ['gamemaker', 'gamemaker2', 'gamemaker81'],
	['godot', 'gdscript', 'gduid', 'godot-assets', 'godotshader'],
	['idris', 'idrisbin', 'idrispkg'], ['haxe', 'haxedevelop'],
	['firebasestorage', 'firestore'], ['hashicorp', 'hcl'], ['glsl', 'hlsl']
];
const fam = new Map();
FAMILIES.forEach((f, i) => f.forEach(id => fam.set(id, i)));
const sameFam = (a, b) => fam.has(a) && fam.get(a) === fam.get(b);

// hues that carry real recognition and must not move
const PIN = new Set(['fla', 'flash', 'fsproj', 'gamemaker', 'gamemaker2', 'gamemaker81', 'gatsby',
	'gdscript', 'gduid', 'godotshader', 'graphqls', 'haxedevelop', 'hjson', 'idris', 'idrisbin',
	'idrispkg', 'jbuilder', 'fortran', 'hip', 'glimmer', 'flow']);

const mine = roster.filter(r => r.archetype !== 'SILHOUETTE').map(r => ({ ...r, ...hsl(r.fill), pinned: PIN.has(r.id) }));
const coreN = core.filter(c => c.archetype !== 'SILHOUETTE').map(c => ({ id: c.id, archetype: c.archetype, ...hsl(c.dominant) }));

const conflicts = (n, others, T = twin) => others.filter(o => o.id !== n.id && o.archetype === n.archetype && !sameFam(n.id, o.id) && T(n, o));

function solve() {
	for (let pass = 0; pass < 6; pass++) {
		let moved = 0;
		for (const n of mine) {
			if (n.pinned || n.s < 25) { continue; }
			const bad = conflicts(n, mine, twinM).length;
			const core0 = conflicts(n, coreN).length;
			let best = null, bestCost = bad ? Infinity : 0 + core0 * 3;
			if (bad === 0) { best = { h: n.h, s: n.s, l: n.l }; }
			for (let dh = -30; dh <= 30; dh += 1) {
				for (let ds = -22; ds <= 22; ds += 2) {
					for (let dl = -15; dl <= 15; dl += 1.5) {
						const c = { id: n.id, archetype: n.archetype, h: (n.h + dh + 360) % 360, s: Math.min(72, Math.max(28, n.s + ds)), l: Math.min(64, Math.max(32, n.l + dl)) };
						if (conflicts(c, mine, twinM).length) { continue; }
						const cost = 2.2 * Math.abs(dh) + 1.1 * Math.abs(c.l - n.l) + 0.45 * Math.abs(c.s - n.s) + 9 * conflicts(c, coreN, twinM).length;
						if (cost < bestCost) { bestCost = cost; best = { h: c.h, s: c.s, l: c.l }; }
					}
				}
			}
			if (best && (best.h !== n.h || best.s !== n.s || best.l !== n.l)) { Object.assign(n, best); moved++; }
		}
		if (!moved) { break; }
	}
}
solve();

const out = {};
for (const n of mine) {
	const h = hex(n);
	if (h !== n.fill) { out[n.id] = h; }
}
console.log('--- moves');
for (const [id, h] of Object.entries(out)) {
	const n = mine.find(m => m.id === id);
	console.log(`  ${id.padEnd(16)} ${n.fill} -> ${h}   ${n.archetype}`);
}
const remain = mine.flatMap(n => conflicts(n, mine).map(o => [n.id, o.id].sort().join('|')));
console.log(`\nwithin-slice R7 remaining: ${new Set(remain).size}`);
[...new Set(remain)].forEach(p => console.log('  ' + p));
const coreTw = mine.flatMap(n => conflicts(n, coreN).map(o => `${n.id} / ${o.id} (${n.archetype})`));
console.log(`\ncore twins remaining: ${coreTw.length}`);
coreTw.forEach(p => console.log('  ' + p));
writeFileSync(new URL('./hue-moves.json', import.meta.url), JSON.stringify(out, null, 1));
