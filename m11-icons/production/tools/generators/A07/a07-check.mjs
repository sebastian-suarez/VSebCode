// a07-check.mjs — R7 / R8 for the A07 slice, using the same method as tools/audit.mjs
// (imported read-only; nothing under tools/ is modified).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { rasterFills } from '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/tools/raster.mjs';
import { ICONS } from './a07-icons.mjs';

const ROOT = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production';
const D_HUE = 12, D_LIGHT = 12, D_SAT = 25, NEUTRAL_S = 25;
const IOU_COLLIDE = 0.72, IOU_COLLIDE_BADGE = 0.92, FORM_SEP = 0.55;

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
const dHue = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };

const outlines = new Map();
function outline(mask, M) {
	if (outlines.has(mask)) { return outlines.get(mask); }
	const at = (x, y) => (x < 0 || y < 0 || x >= M || y >= M ? '0' : mask[y * M + x]);
	const edge = new Uint8Array(M * M);
	for (let y = 0; y < M; y++) {
		for (let x = 0; x < M; x++) {
			if (at(x, y) !== '1') { continue; }
			if (at(x - 1, y) === '0' || at(x + 1, y) === '0' || at(x, y - 1) === '0' || at(x, y + 1) === '0') { edge[y * M + x] = 1; }
		}
	}
	const out = new Array(M * M).fill('0');
	for (let y = 0; y < M; y++) {
		for (let x = 0; x < M; x++) {
			if (!edge[y * M + x]) { continue; }
			for (let dy = -1; dy <= 1; dy++) { for (let dx = -1; dx <= 1; dx++) {
				const nx = x + dx, ny = y + dy;
				if (nx >= 0 && ny >= 0 && nx < M && ny < M) { out[ny * M + nx] = '1'; }
			} }
		}
	}
	const s = out.join(''); outlines.set(mask, s); return s;
}
function iou(a, b) { let i = 0, u = 0; for (let k = 0; k < a.length; k++) { const x = a[k] === '1', y = b[k] === '1'; if (x && y) { i++; } if (x || y) { u++; } } return u ? i / u : 0; }
function formSim(A, B) {
	const area = iou(A.form, B.form);
	const edge = iou(outline(A.form, A.mask), outline(B.form, B.mask));
	return { area, edge, sim: Math.min(area, edge) };
}

// ---- data ------------------------------------------------------------------
const manifest = JSON.parse(readFileSync(join(ROOT, 'set-manifest.json'), 'utf8'));
const core = manifest.icons.filter(i => i.kind === 'file');
const mine = ICONS.map(i => ({ id: i.id, kind: 'file', archetype: i.archetype, slice: 'A07' }));
const entries = [...core.map(i => ({ ...i, slice: 'core' })), ...mine];

const measured = await rasterFills(entries.map(i => ({ kind: 'file', id: i.id, path: join(ROOT, 'svg/file', `${i.id}.svg`) })));
const icons = entries.map(i => {
	const m = measured.get(`file/${i.id}`);
	const form = i.archetype === 'BADGE' && m.mark.includes('1') ? m.mark : m.ink;
	return { ...i, dominant: m.dominant, hsl: hsl(m.dominant), form, mask: m.mask, coverage: m.coverage,
		inkPx: (m.ink.match(/1/g) || []).length };
});
const byId = new Map(icons.map(i => [i.id, i]));

// families declared for this slice (R3 extensions, logged in the report)
const FAM = [['testjs', 'testts', 'test-jsx'], ['svelte', 'svelte-js', 'svelte-ts'], ['tres', 'tscn']];
const famOf = new Map(); FAM.forEach((f, n) => f.forEach(id => famOf.set(id, n)));
const sameFam = (a, b) => famOf.has(a) && famOf.get(a) === famOf.get(b);

console.log('--- ink sanity (rendered 64x64 mask pixels; a winding bug shows as a hole) ---');
const thin = icons.filter(i => i.slice === 'A07' && i.inkPx < 700).sort((a, b) => a.inkPx - b.inkPx);
console.log(thin.map(i => `${i.id}:${i.inkPx}`).join('  '));

console.log('\n--- R7 (hard: A07 x A07, and A07 x same-domain core) ---');
const r7hard = [], r7tol = [], r7sep = [];
for (let a = 0; a < icons.length; a++) {
	for (let b = a + 1; b < icons.length; b++) {
		const A = icons[a], B = icons[b];
		if (A.slice === 'core' && B.slice === 'core') { continue; }
		if (A.archetype !== B.archetype) { continue; }
		if (sameFam(A.id, B.id)) { continue; }
		if (A.hsl.s < NEUTRAL_S || B.hsl.s < NEUTRAL_S) { continue; }
		const dh = dHue(A.hsl.h, B.hsl.h), dl = Math.abs(A.hsl.l - B.hsl.l), ds = Math.abs(A.hsl.s - B.hsl.s);
		if (!(dh < D_HUE && dl < D_LIGHT && ds < D_SAT)) { continue; }
		const f = formSim(A, B);
		const rec = `${A.id}(${A.slice}) | ${B.id}(${B.slice})  ${A.archetype}  dh${dh.toFixed(0)} dl${dl.toFixed(0)} ds${ds.toFixed(0)} form${f.sim.toFixed(2)}  ${A.dominant}/${B.dominant}`;
		if (A.archetype === 'SILHOUETTE' && f.sim < FORM_SEP) { r7sep.push(rec); }
		else if (A.slice === 'A07' && B.slice === 'A07') { r7hard.push('HARD ' + rec); }
		else { r7tol.push('tol  ' + rec); }
	}
}
console.log(r7hard.length ? r7hard.join('\n') : '(no in-slice twins)');
console.log('\ncross-slice / core tolerated twins:');
console.log(r7tol.length ? r7tol.join('\n') : '(none)');
console.log(`\nSILHOUETTE colour hits separated by form: ${r7sep.length}`);
if (process.argv.includes('--sep')) { console.log(r7sep.join('\n')); }

console.log('\n--- R8 (form collisions, any hue) ---');
const r8 = [];
for (let a = 0; a < icons.length; a++) {
	for (let b = a + 1; b < icons.length; b++) {
		const A = icons[a], B = icons[b];
		if (A.slice === 'core' && B.slice === 'core') { continue; }
		if (A.archetype !== B.archetype) { continue; }
		if (sameFam(A.id, B.id)) { continue; }
		const bar = A.archetype === 'BADGE' ? IOU_COLLIDE_BADGE : IOU_COLLIDE;
		const f = formSim(A, B);
		if (f.sim >= bar - 0.12) {
			r8.push(`${f.sim >= bar ? 'COLLIDE' : 'near   '} ${A.id}(${A.slice}) | ${B.id}(${B.slice})  ${A.archetype}  sim ${f.sim.toFixed(2)} (area ${f.area.toFixed(2)} edge ${f.edge.toFixed(2)})`);
		}
	}
}
console.log(r8.length ? r8.sort().join('\n') : '(no collisions or near-misses)');
