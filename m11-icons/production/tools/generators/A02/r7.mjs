// r7.mjs — R7 twin check for slice A02: hard within the slice, reported vs core.
import { readFileSync } from 'node:fs';
import { ICONS } from './icons.mjs';
import { hsl, hueDist } from './lib.mjs';

const PROD = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production';
const core = JSON.parse(readFileSync(`${PROD}/set-manifest.json`, 'utf8')).icons.filter(i => i.kind === 'file');

// Declared families (R3 spirit): exempt from R7/R8 against each other.
const FAM = [
	['cf', 'cfc', 'cfm'],
	['c-al', 'dal'],
	['doctex', 'doctex-installer', 'dtx'],
	['chef', 'chef-cookbook'],
	['cabal', 'haskell'],
	['csproj', 'csharp'],
	['cssmap', 'css'],
	['clojurescript', 'clojure'],
	['cypress-spec', 'cypress'],
	['dartlang-generated', 'dartlang'],
	['cython', 'python'],
	['eex', 'elixir'],
	['erb', 'ruby'],
	['dtd', 'xml'],
	['dune', 'ocaml'],
	['context', 'tex']
];
const famKey = new Map();
FAM.forEach((f, i) => f.forEach(id => { famKey.set(id, (famKey.get(id) || []).concat(i)); }));
const sameFamily = (a, b) => (famKey.get(a) || []).some(i => (famKey.get(b) || []).includes(i));

const mine = ICONS.map(i => ({ id: i.id, archetype: i.archetype, hex: i.fill, hsl: hsl(i.fill), slice: true }));
const all = mine.concat(core.map(i => ({ id: i.id, archetype: i.archetype, hex: i.dominant, hsl: hsl(i.dominant), slice: false })));

function twin(a, b) {
	if (a.archetype !== b.archetype) { return false; }
	if (a.hsl[1] < 25 || b.hsl[1] < 25) { return false; }        // neutral lane
	return hueDist(a.hsl[0], b.hsl[0]) < 12 && Math.abs(a.hsl[2] - b.hsl[2]) < 12 && Math.abs(a.hsl[1] - b.hsl[1]) < 25;
}
const fmt = (x) => `${x.id}(${x.archetype[0]}${x.hex} h${Math.round(x.hsl[0])} s${Math.round(x.hsl[1])} l${Math.round(x.hsl[2])})`;

const inSlice = [], vsCore = [];
for (let i = 0; i < all.length; i++) {
	for (let j = i + 1; j < all.length; j++) {
		const a = all[i], b = all[j];
		if (!a.slice && !b.slice) { continue; }
		if (sameFamily(a.id, b.id)) { continue; }
		if (!twin(a, b)) { continue; }
		const rec = { a, b, d: [hueDist(a.hsl[0], b.hsl[0]), Math.abs(a.hsl[2] - b.hsl[2]), Math.abs(a.hsl[1] - b.hsl[1])].map(v => Math.round(v)) };
		(a.slice && b.slice ? inSlice : vsCore).push(rec);
	}
}
console.log(`== IN-SLICE (HARD, must be zero): ${inSlice.length}`);
for (const r of inSlice) { console.log(`  ${fmt(r.a)}  ~  ${fmt(r.b)}   Δh${r.d[0]} ΔL${r.d[1]} ΔS${r.d[2]}`); }
console.log(`\n== VS CORE (${vsCore.length}) — hard only for same-domain neighbours`);
for (const r of vsCore) {
	const core_ = r.a.slice ? r.b : r.a, m = r.a.slice ? r.a : r.b;
	console.log(`  ${fmt(m)}  ~  core ${fmt(core_)}   Δh${r.d[0]} ΔL${r.d[1]} ΔS${r.d[2]}`);
}
