// solve.mjs — pick hues that clear R7 hard-scope (in-slice + same-domain core), staying as
// close as possible to each concept's anchor (brand / recognized-theme) hue.
import { readFileSync, writeFileSync } from 'node:fs';
import { ARCH, FAMILIES, DOMAIN, famIndex, hsl, toHex, dHue } from './roster.mjs';

const cache = JSON.parse(readFileSync('./formcache.json', 'utf8'));
const icons = new Map(cache.icons.map(i => [i.id, i]));
const sim = cache.sim;
const simOf = (a, b) => sim[`${a}|${b}`] ?? sim[`${b}|${a}`] ?? 0;

const fam = famIndex();
const sameFamily = (a, b) => { const A = fam.get(a), B = fam.get(b); if (!A || !B) { return false; } for (const i of A) { if (B.has(i)) { return true; } } return false; };
const domainOf = new Map();
for (const [core, list] of Object.entries(DOMAIN)) { for (const id of list) { if (!domainOf.has(id)) { domainOf.set(id, new Set()); } domainOf.get(id).add(core); } }

// shared-plate groups: one colour variable each
const GROUPS = [
	['mvt', 'mvtcss', 'mvtjs'], ['pascal', 'pascalproject'],
	['plsql-package', 'plsql-package-body', 'plsql-package-header', 'plsql-package-spec']
];
// anchored to a brand or to a core family plate — these do not move
const LOCKED = new Set(['neo4j', 'nix', 'pgsql', 'perl6', 'objectivecpp', 'nimble', 'njsproj',
	'pip', 'ocaml-intf', 'platformio', 'msw', 'plsql', 'plsql-package', 'plsql-package-body',
	'plsql-package-header', 'plsql-package-spec']);

// hand-set anchors where the measured colour is not the intention (§11.2 read + craft).
const ANCHOR = { odin: '#4A42A0', phalcon: '#3E949E' };

const mine = Object.keys(ARCH);
const groupOf = new Map();
GROUPS.forEach((g, i) => g.forEach(id => groupOf.set(id, `g${i}`)));
const varOf = (id) => groupOf.get(id) ?? id;
const vars = new Map();
for (const id of mine) {
	const v = varOf(id);
	const base = ANCHOR[id] ?? icons.get(id).dominant;
	if (!vars.has(v)) { vars.set(v, { members: [], anchor: hsl(base), cur: hsl(base), locked: false }); }
	vars.get(v).members.push(id);
	if (LOCKED.has(id)) { vars.get(v).locked = true; }
}

const NEUTRAL = 25;
const isTwin = (A, B, ha, hb) => {
	if (ARCH[A] ? false : true) { /* noop */ }
	if (ha.s < NEUTRAL || hb.s < NEUTRAL) { return false; }
	if (!(dHue(ha.h, hb.h) < 12 && Math.abs(ha.l - hb.l) < 12 && Math.abs(ha.s - hb.s) < 25)) { return false; }
	const arch = icons.get(A).archetype;
	if (arch === 'SILHOUETTE' && simOf(A, B) < 0.55) { return false; }
	return true;
};

// hard-scope opponents. $11.3 only requires same-domain core, but the core is small enough
// that going hard against all of it is free craft when the solver can still land on 0.
const ALL_CORE_HARD = false;

function opponents(id) {
	const out = [];
	for (const other of icons.keys()) {
		if (other === id) { continue; }
		if (icons.get(other).archetype !== icons.get(id).archetype) { continue; }
		if (sameFamily(id, other)) { continue; }
		const mineToo = mine.includes(other);
		const dom = domainOf.get(id)?.has(other) || domainOf.get(other)?.has(id);
		// A BADGE is nothing but a plate, so hue IS the read (§6). Against core badges the
		// bar is hard even cross-domain; GLYPH / SILHOUETTE keep the §11.3 scope.
		const bothBadge = false;
		if (!mineToo && !dom && !bothBadge) { continue; }
		out.push(other);
	}
	return out;
}
const OPP = new Map(mine.map(id => [id, opponents(id)]));

const colourOf = (id) => vars.get(varOf(id)).cur;
function violations(idFilter = null) {
	const out = [];
	const seen = new Set();
	for (const id of mine) {
		for (const other of OPP.get(id)) {
			const k = [id, other].sort().join('|');
			if (seen.has(k)) { continue; }
			seen.add(k);
			const ha = colourOf(id), hb = mine.includes(other) ? colourOf(other) : hsl(icons.get(other).dominant);
			if (isTwin(id, other, ha, hb)) { out.push([id, other]); }
		}
	}
	return idFilter ? out.filter(p => p.includes(idFilter)) : out;
}

// candidate grid around the anchor
const DH = [0, -4, 4, -8, 8, -12, 12, -16, 16, -20, 20, -26, 26, -32, 32, -40, 40, -50, 50, -62, 62, -75, 75];
const DL = [0, -4, 4, -8, 8, -12, 12, -16, 16, -20, 20, -24, 24];
const DS = [0, -5, 5, -10, 10, -15, 15];
function candidates(anchor, arch) {
	const out = [];
	const sFloor = Math.min(30, anchor.s);       // never mute a mark into the grey lane
	for (const dh of DH) {
		for (const dl of DL) {
			for (const ds of DS) {
				const l = anchor.l + dl, s = anchor.s + ds;
				if (l < 30 || l > 74) { continue; }
				if (arch === 'BADGE' && (l < 33 || l > 62)) { continue; }   // white letters must hold
				if (s < sFloor || s > 78) { continue; }
				out.push({ c: { h: (anchor.h + dh + 360) % 360, s, l }, cost: Math.abs(dh) + 1.6 * Math.abs(dl) + 1.6 * Math.abs(ds) });
			}
		}
	}
	return out.sort((a, b) => a.cost - b.cost);
}

// iterative repair
let best = null;
for (let restart = 0; restart < 40; restart++) {
	for (const v of vars.values()) { v.cur = { ...v.anchor }; }
	const order = [...vars.keys()].filter(k => !vars.get(k).locked);
	for (let pass = 0; pass < 26; pass++) {
		const bad = violations();
		if (!bad.length) { break; }
		// shuffle a little on later restarts to escape local minima
		const shuffled = restart === 0 ? order : order.slice().sort(() => Math.random() - 0.5);
		for (const key of shuffled) {
			const v = vars.get(key);
			const mySet = new Set(v.members);
			const localBad = () => {
				let n = 0;
				for (const id of v.members) {
					for (const other of OPP.get(id)) {
						if (mySet.has(other) && other < id) { continue; }
						const hb = mine.includes(other) ? colourOf(other) : hsl(icons.get(other).dominant);
						if (isTwin(id, other, v.cur, hb)) { n++; }
					}
				}
				return n;
			};
			if (localBad() === 0) { continue; }
			const arch = ARCH[v.members[0]];
			let pick = null;
			for (const cand of candidates(v.anchor, arch)) {
				const save = v.cur; v.cur = cand.c;
				const nb = localBad();
				v.cur = save;
				if (nb === 0) { pick = cand.c; break; }
			}
			if (pick) { v.cur = pick; }
			else {
				// take the candidate with the fewest local violations, cheapest first
				let bestN = Infinity, bestC = null;
				for (const cand of candidates(v.anchor, arch)) {
					const save = v.cur; v.cur = cand.c;
					const nb = localBad();
					v.cur = save;
					if (nb < bestN) { bestN = nb; bestC = cand.c; if (nb === 0) { break; } }
				}
				if (bestC) { v.cur = bestC; }
			}
		}
	}
	const bad = violations();
	const cost = [...vars.values()].reduce((a, v) => a + dHue(v.cur.h, v.anchor.h) + 1.5 * Math.abs(v.cur.l - v.anchor.l) + 0.9 * Math.abs(v.cur.s - v.anchor.s), 0);
	if (!best || bad.length < best.bad.length || (bad.length === best.bad.length && cost < best.cost)) {
		best = { bad, cost, snap: new Map([...vars].map(([k, v]) => [k, { ...v.cur }])) };
	}
	if (best.bad.length === 0 && restart > 6) { break; }
}

for (const [k, c] of best.snap) { vars.get(k).cur = c; }
console.log(`unresolved hard R7: ${best.bad.length}`);
best.bad.forEach(p => console.log('  ', p.join(' | ')));

const result = {};
for (const id of mine) {
	const v = vars.get(varOf(id));
	const before = icons.get(id).dominant, after = toHex(v.cur);
	result[id] = after;
	if (before !== after) { console.log(`${id.padEnd(22)} ${before} -> ${after}   (dh ${dHue(v.cur.h, v.anchor.h).toFixed(0)} dl ${(v.cur.l - v.anchor.l).toFixed(0)} ds ${(v.cur.s - v.anchor.s).toFixed(0)})`); }
}
writeFileSync('./hues.json', JSON.stringify(result, null, 1));
