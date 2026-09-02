// check.mjs — R7 / R8 report for slice A05, on the cached raster (run formcache.mjs first).
import { readFileSync } from 'node:fs';
import { ARCH, DOMAIN, famIndex, hsl, dHue } from './roster.mjs';

const IOU_BADGE = 0.92, IOU_OTHER = 0.72, FORM_SEP = 0.55, NEUTRAL = 25;
const cache = JSON.parse(readFileSync('./formcache.json', 'utf8'));
const icons = cache.icons.map(i => ({ ...i, hsl: hsl(i.dominant) }));
const sim = cache.sim;
const simOf = (a, b) => sim[`${a}|${b}`] ?? sim[`${b}|${a}`] ?? 0;

const fam = famIndex();
const sameFamily = (a, b) => { const A = fam.get(a), B = fam.get(b); if (!A || !B) { return false; } for (const i of A) { if (B.has(i)) { return true; } } return false; };
const domainOf = new Map();
for (const [core, list] of Object.entries(DOMAIN)) { for (const id of list) { if (!domainOf.has(id)) { domainOf.set(id, new Set()); } domainOf.get(id).add(core); } }

const hard = [], soft = [], r8 = [];
for (let a = 0; a < icons.length; a++) {
	for (let b = a + 1; b < icons.length; b++) {
		const A = icons[a], B = icons[b];
		if (!A.mine && !B.mine) { continue; }
		if (A.archetype !== B.archetype) { continue; }
		if (sameFamily(A.id, B.id)) { continue; }
		const s = simOf(A.id, B.id);
		const bar = A.archetype === 'BADGE' ? IOU_BADGE : IOU_OTHER;
		if (s >= bar - 0.08) { r8.push({ a: A.id, b: B.id, arch: A.archetype, s, bar, hit: s >= bar }); }
		if (A.hsl.s < NEUTRAL || B.hsl.s < NEUTRAL) { continue; }
		const dh = dHue(A.hsl.h, B.hsl.h), dl = Math.abs(A.hsl.l - B.hsl.l), ds = Math.abs(A.hsl.s - B.hsl.s);
		if (!(dh < 12 && dl < 12 && ds < 25)) { continue; }
		if (A.archetype === 'SILHOUETTE' && s < FORM_SEP) { continue; }
		const rec = { a: A.id, b: B.id, arch: A.archetype, dh: +dh.toFixed(1), dl: +dl.toFixed(1), ds: +ds.toFixed(1), s, ha: A.dominant, hb: B.dominant };
		const inSlice = A.mine && B.mine;
		const dom = domainOf.get(A.id)?.has(B.id) || domainOf.get(B.id)?.has(A.id);
		if (inSlice || dom) { hard.push({ ...rec, why: inSlice ? 'in-slice' : 'same-domain' }); } else { soft.push(rec); }
	}
}
const fmt = (r) => `${r.a} | ${r.b} | ${r.arch} | dh ${r.dh} dl ${r.dl} ds ${r.ds} | form ${r.s} | ${r.ha} ${r.hb}${r.why ? ' | ' + r.why : ''}`;
console.log(`=== R7 HARD (${hard.length}) ===`); hard.forEach(r => console.log(fmt(r)));
console.log(`\n=== R7 tolerated cross-domain (${soft.length}) ===`); soft.forEach(r => console.log(fmt(r)));
console.log(`\n=== R8 (${r8.length} at/near bar) ===`);
r8.forEach(r => console.log(`${r.hit ? 'COLLIDE' : 'near   '} ${r.a} | ${r.b} | ${r.arch} | ${r.s} (bar ${r.bar})`));
const bytes = icons.filter(i => i.mine).map(i => i.bytes);
console.log(`\nslice bytes: max ${Math.max(...bytes)}, avg ${Math.round(bytes.reduce((a, b) => a + b, 0) / bytes.length)}, total ${bytes.reduce((a, b) => a + b, 0)}`);
const arch = {}; for (const id of Object.keys(ARCH)) { arch[ARCH[id]] = (arch[ARCH[id]] || 0) + 1; }
console.log('archetypes:', arch);
