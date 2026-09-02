// r7.mjs — R7 twin check for slice A06: hard inside the slice, reported against the core set.
// Same thresholds as tools/audit.mjs (D_HUE 12, D_LIGHT 12, D_SAT 25, neutral lane S < 25).
import { readFileSync } from 'node:fs';
// same maths as tools/audit.mjs (copied, not imported: audit.mjs runs its report on import)
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

const D_HUE = 12, D_LIGHT = 12, D_SAT = 25, NEUTRAL_S = 25;
const dHue = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };

const roster = JSON.parse(readFileSync(new URL('./roster.json', import.meta.url), 'utf8'));
const core = JSON.parse(readFileSync('/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/set-manifest.json', 'utf8'))
	.icons.filter(i => i.kind === 'file');

// R3 families declared for this slice (shared hue, different mark).
const FAM = [
	['powershell', 'powershell-format', 'powershell-psd', 'powershell-psm', 'powershell-types'],
	['prisma', 'prismaconfig'], ['processing', 'processinglang'],
	['python', 'pyscript', 'pytyped', 'pythonconfig'],
	['qbs', 'qml', 'qmldir', 'qrc'],
	['rust', 'ron', 'ra-syntax-tree', 'rust-toolchain'],
	['r', 'rmd', 'rproj'], ['ruby', 'rake'], ['scala', 'sbt'],
	['rescript', 'rescript-interface', 'reason'], ['roblox', 'rbxmk'],
	['reactjs', 'reactts', 'reacttemplate'], ['sass', 'scss'],
	['markdown', 'quarkdown'], ['search', 'search-result'],
	['redux-action', 'redux-reducer', 'redux-selector', 'redux-store'],
	['xml', 'rnc'], ['word', 'excel', 'powerpoint', 'publisher']
];
const fam = new Map();
FAM.forEach((f, i) => f.forEach(id => fam.set(id, i)));
const sameFam = (a, b) => fam.has(a) && fam.get(a) === fam.get(b);

const mine = roster.map(r => ({ id: r.id, arch: r.arch, hex: r.fills[0], ...hsl(r.fills[0]) }));
const theirs = core.map(c => ({ id: c.id, arch: c.archetype, hex: c.dominant, ...hsl(c.dominant) }));

function twin(a, b) {
	if (a.arch !== b.arch) { return false; }
	if (a.s < NEUTRAL_S || b.s < NEUTRAL_S) { return false; }
	if (sameFam(a.id, b.id)) { return false; }
	return dHue(a.h, b.h) < D_HUE && Math.abs(a.l - b.l) < D_LIGHT && Math.abs(a.s - b.s) < D_SAT;
}
const fmt = (x, y) => `${x.id} ${x.hex} (${x.arch[0]}, h${x.h.toFixed(0)} l${x.l.toFixed(0)} s${x.s.toFixed(0)})`
	+ `  ~  ${y.id} ${y.hex} (h${y.h.toFixed(0)} l${y.l.toFixed(0)} s${y.s.toFixed(0)})`
	+ `   dh ${dHue(x.h, y.h).toFixed(1)} dl ${Math.abs(x.l - y.l).toFixed(1)} ds ${Math.abs(x.s - y.s).toFixed(1)}`;

console.log('=== within-slice twins (HARD — must be empty except SILHOUETTE form-separated) ===');
let inner = 0;
for (let i = 0; i < mine.length; i++) {
	for (let j = i + 1; j < mine.length; j++) {
		if (twin(mine[i], mine[j])) { inner++; console.log('  ' + fmt(mine[i], mine[j])); }
	}
}
if (!inner) { console.log('  none'); }

console.log('\n=== slice vs core (tolerated across domains per §11.3 — log only) ===');
let outer = 0;
for (const a of mine) {
	for (const b of theirs) {
		if (twin(a, b)) { outer++; console.log('  ' + fmt(a, b)); }
	}
}
if (!outer) { console.log('  none'); }
console.log(`\n${inner} within-slice, ${outer} vs core`);
