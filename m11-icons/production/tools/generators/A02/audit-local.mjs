// audit-local.mjs — R7/R8 audit for slice A02 against the core set, replicating
// tools/audit.mjs's scoring (imports its raster, does not touch shared state).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { rasterFills } from '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/tools/raster.mjs';
import { ICONS } from './icons.mjs';

const ROOT = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production';
const D_HUE = 12, D_LIGHT = 12, D_SAT = 25, NEUTRAL_S = 25;
const IOU_COLLIDE = 0.72, IOU_COLLIDE_BADGE = 0.92, FORM_SEP = 0.55;

const FAMILIES = [
	['reactjs', 'reactts'], ['typescript', 'typescriptdef'], ['js', 'jsconfig'],
	['json', 'json5'], ['sql', 'sqlite'], ['cheader', 'cppheader'],
	['testjs', 'testts'], ['vite', 'vitest'], ['next', 'vercel'],
	// A02 declared families
	['cf', 'cfc', 'cfm'], ['c-al', 'dal'],
	['context', 'doctex', 'doctex-installer', 'dtx', 'tex'],
	['chef', 'chef-cookbook'], ['cabal', 'haskell'], ['csproj', 'csharp'],
	['cssmap', 'css'], ['clojurescript', 'clojure'], ['cypress-spec', 'cypress'],
	['dartlang-generated', 'dartlang'], ['cython', 'python'], ['eex', 'elixir'],
	['erb', 'ruby'], ['dtd', 'xml'], ['dune', 'ocaml']
];
const fam = new Map();
FAMILIES.forEach((f, i) => f.forEach(id => fam.set(id, (fam.get(id) || []).concat(i))));
const sameFamily = (a, b) => (fam.get(a) || []).some(i => (fam.get(b) || []).includes(i));

function hsl(hex) {
	const r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255, b = parseInt(hex.slice(5, 7), 16) / 255;
	const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, l = (mx + mn) / 2;
	let h = 0;
	if (d) {
		h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
		h *= 60; if (h < 0) { h += 360; }
	}
	return { h, s: (d ? d / (1 - Math.abs(2 * l - 1)) : 0) * 100, l: l * 100 };
}
const dHue = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };

const manifest = JSON.parse(readFileSync(join(ROOT, 'set-manifest.json'), 'utf8'));
const mine = new Map(ICONS.map(i => [i.id, i]));
const entries = manifest.icons.filter(i => i.kind === 'file').map(i => ({ kind: 'file', id: i.id, path: join(ROOT, 'svg/file', `${i.id}.svg`), archetype: i.archetype, slice: false }))
	.concat(ICONS.map(i => ({ kind: 'file', id: i.id, path: join(ROOT, 'svg/file', `${i.id}.svg`), archetype: i.archetype, slice: true })));

const measured = await rasterFills(entries.map(e => ({ kind: e.kind, id: e.id, path: e.path })));
const icons = entries.map(e => {
	const m = measured.get(`file/${e.id}`);
	const form = e.archetype === 'BADGE' && m.mark.includes('1') ? m.mark : m.ink;
	return { ...e, dominant: m.dominant, hsl: hsl(m.dominant), form, mask: m.mask };
});

function iou(a, b) { let i = 0, u = 0; for (let k = 0; k < a.length; k++) { const x = a[k] === '1', y = b[k] === '1'; if (x && y) { i++; } if (x || y) { u++; } } return u ? i / u : 0; }
const outlines = new Map();
function outline(mask, M) {
	if (outlines.has(mask)) { return outlines.get(mask); }
	const at = (x, y) => (x < 0 || y < 0 || x >= M || y >= M ? '0' : mask[y * M + x]);
	const edge = new Uint8Array(M * M);
	for (let y = 0; y < M; y++) { for (let x = 0; x < M; x++) { if (at(x, y) === '1' && (at(x - 1, y) === '0' || at(x + 1, y) === '0' || at(x, y - 1) === '0' || at(x, y + 1) === '0')) { edge[y * M + x] = 1; } } }
	const out = new Array(M * M).fill('0');
	for (let y = 0; y < M; y++) {
		for (let x = 0; x < M; x++) {
			if (!edge[y * M + x]) { continue; }
			for (let dy = -1; dy <= 1; dy++) { for (let dx = -1; dx <= 1; dx++) { const nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < M && ny < M) { out[ny * M + nx] = '1'; } } }
		}
	}
	const s = out.join(''); outlines.set(mask, s); return s;
}
const formSim = (A, B) => { const area = iou(A.form, B.form), edge = iou(outline(A.form, A.mask), outline(B.form, B.mask)); return { area, edge, sim: Math.min(area, edge) }; };

const r7in = [], r7core = [], r7sep = [], r8 = [], r8near = [];
for (let a = 0; a < icons.length; a++) {
	for (let b = a + 1; b < icons.length; b++) {
		const A = icons[a], B = icons[b];
		if (!A.slice && !B.slice) { continue; }
		if (sameFamily(A.id, B.id)) { continue; }
		if (A.archetype === B.archetype) {
			const f = formSim(A, B);
			const bar = A.archetype === 'BADGE' ? IOU_COLLIDE_BADGE : IOU_COLLIDE;
			if (f.sim >= bar) { r8.push({ A, B, ...f }); }
			else if (f.sim >= bar - 0.12) { r8near.push({ A, B, ...f }); }
			if (A.hsl.s >= NEUTRAL_S && B.hsl.s >= NEUTRAL_S) {
				const dh = dHue(A.hsl.h, B.hsl.h), dl = Math.abs(A.hsl.l - B.hsl.l), ds = Math.abs(A.hsl.s - B.hsl.s);
				if (dh < D_HUE && dl < D_LIGHT && ds < D_SAT) {
					const rec = { A, B, dh, dl, ds, ...f };
					if (A.archetype === 'SILHOUETTE' && f.sim < FORM_SEP) { r7sep.push(rec); }
					else if (A.slice && B.slice) { r7in.push(rec); }
					else { r7core.push(rec); }
				}
			}
		}
	}
}
const tag = (x) => `${x.slice ? '' : 'core '}${x.id}(${x.archetype[0]} ${x.dominant})`;
console.log(`R7 in-slice (HARD): ${r7in.length}`);
r7in.forEach(r => console.log(`  ${tag(r.A)} ~ ${tag(r.B)}  dh${r.dh.toFixed(0)} dl${r.dl.toFixed(0)} ds${r.ds.toFixed(0)} form ${r.sim.toFixed(2)}`));
console.log(`\nR7 vs core (log): ${r7core.length}`);
r7core.forEach(r => console.log(`  ${tag(r.A)} ~ ${tag(r.B)}  dh${r.dh.toFixed(0)} dl${r.dl.toFixed(0)} ds${r.ds.toFixed(0)}`));
console.log(`\nR7 colour hits separated by form (SILHOUETTE lane): ${r7sep.length}`);
console.log(`\nR8 collisions (HARD everywhere): ${r8.length}`);
r8.forEach(r => console.log(`  ${tag(r.A)} ~ ${tag(r.B)}  form ${r.sim.toFixed(2)} (area ${r.area.toFixed(2)} edge ${r.edge.toFixed(2)})`));
console.log(`\nR8 near-misses (within 0.12 of the bar): ${r8near.length}`);
r8near.sort((x, y) => y.sim - x.sim).slice(0, 25).forEach(r => console.log(`  ${tag(r.A)} ~ ${tag(r.B)}  form ${r.sim.toFixed(2)}`));
