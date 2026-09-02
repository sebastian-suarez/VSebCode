#!/usr/bin/env node
// a09-audit.mjs — R7/R8 for slice A09 against itself and the core set.
// Mirrors tools/audit.mjs's thresholds and scoring; scoped to pairs that involve A09.
//
//   node a09-audit.mjs           # violations
//   node a09-audit.mjs --near    # + near misses
//   node a09-audit.mjs --free ARCH HUE   # hexes near HUE that clear R7 for ARCH

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { rasterFills } from '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/tools/raster.mjs';
import { ROSTER } from './a09-roster.mjs';

const ROOT = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production';
const argv = process.argv.slice(2);
const D_HUE = 12, D_LIGHT = 12, D_SAT = 25, NEUTRAL_S = 25;
const IOU_COLLIDE = 0.72, IOU_COLLIDE_BADGE = 0.92, IOU_NEAR = 0.6, FORM_SEP = 0.55;

// families: same product / deliberate rhyme -> exempt from R7 and R8 (R3)
const FAMILIES = [
	['commitizen', 'commitlint'], ['dbt', 'dbt-bouncer'], ['deno', 'denoify'],
	['drizzle', 'drizzle-orm'], ['expo', 'eas-metadata'], ['go', 'go-package', 'go-work'],
	['funding', 'github-sponsors'], ['bun', 'bunfig'], ['cursor', 'cursorrules'],
	['dartlang', 'dartlang-ignore'], ['firebase', 'firebasehosting'],
	['graphql', 'graphql-config'], ['dotenv', 'direnv'], ['container', 'devcontainer']
];
const famOf = new Map();
FAMILIES.forEach((f, i) => f.forEach(id => famOf.set(id, i)));
const sameFamily = (a, b) => famOf.has(a) && famOf.get(a) === famOf.get(b);

export function hsl(hex) {
	const r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255, b = parseInt(hex.slice(5, 7), 16) / 255;
	const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
	const l = (mx + mn) / 2;
	let h = 0;
	if (d) {
		if (mx === r) { h = ((g - b) / d) % 6; } else if (mx === g) { h = (b - r) / d + 2; } else { h = (r - g) / d + 4; }
		h *= 60; if (h < 0) { h += 360; }
	}
	return { h, s: (d ? d / (1 - Math.abs(2 * l - 1)) : 0) * 100, l: l * 100 };
}
const dHue = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };

const manifest = JSON.parse(readFileSync(join(ROOT, 'set-manifest.json'), 'utf8'));
const mine = new Set(ROSTER.map(r => r.id));
const core = manifest.icons.filter(i => i.kind === 'file' && !mine.has(i.id));

const entries = [
	...core.map(i => ({ kind: 'file', id: i.id, path: join(ROOT, 'svg/file', `${i.id}.svg`), archetype: i.archetype, own: false })),
	...ROSTER.map(r => ({ kind: 'file', id: r.id, path: join(ROOT, 'svg/file', `${r.id}.svg`), archetype: r.arch, own: true }))
];
const measured = await rasterFills(entries.map(e => ({ kind: e.kind, id: e.id, path: e.path })));

const icons = entries.map(e => {
	const m = measured.get(`file/${e.id}`);
	const form = e.archetype === 'BADGE' && m.mark.includes('1') ? m.mark : m.ink;
	return { ...e, dominant: m.dominant, hsl: hsl(m.dominant), form, mask: m.mask };
});

function iou(a, b) {
	let inter = 0, union = 0;
	for (let k = 0; k < a.length; k++) { const x = a[k] === '1', y = b[k] === '1'; if (x && y) { inter++; } if (x || y) { union++; } }
	return union ? inter / union : 0;
}
const outlines = new Map();
function outline(mask, M) {
	if (outlines.has(mask)) { return outlines.get(mask); }
	const at = (x, y) => (x < 0 || y < 0 || x >= M || y >= M ? '0' : mask[y * M + x]);
	const edge = new Uint8Array(M * M);
	for (let y = 0; y < M; y++) { for (let x = 0; x < M; x++) {
		if (at(x, y) !== '1') { continue; }
		if (at(x - 1, y) === '0' || at(x + 1, y) === '0' || at(x, y - 1) === '0' || at(x, y + 1) === '0') { edge[y * M + x] = 1; }
	} }
	const out = new Array(M * M).fill('0');
	for (let y = 0; y < M; y++) { for (let x = 0; x < M; x++) {
		if (!edge[y * M + x]) { continue; }
		for (let dy = -1; dy <= 1; dy++) { for (let dx = -1; dx <= 1; dx++) {
			const nx = x + dx, ny = y + dy;
			if (nx >= 0 && ny >= 0 && nx < M && ny < M) { out[ny * M + nx] = '1'; }
		} }
	} }
	const s = out.join(''); outlines.set(mask, s); return s;
}
const formSim = (A, B) => {
	const area = iou(A.form, B.form);
	const edge = iou(outline(A.form, A.mask), outline(B.form, B.mask));
	return { area, edge, sim: Math.min(area, edge) };
};

// --free ARCH HUE: hexes near a hue that clear R7 for a new icon of that archetype
if (argv[0] === '--free') {
	const arch = argv[1].toUpperCase();
	const hue = +argv[2];
	const peers = icons.filter(i => i.archetype === arch);
	const ok = [];
	for (let h = hue - 25; h <= hue + 25; h += 5) {
		for (let s = 30; s <= 75; s += 5) {
			for (let l = 30; l <= 80; l += 4) {
				const hh = ((h % 360) + 360) % 360;
				const c = (1 - Math.abs(2 * l / 100 - 1)) * s / 100, x = c * (1 - Math.abs((hh / 60) % 2 - 1)), m = l / 100 - c / 2;
				const [r1, g1, b1] = hh < 60 ? [c, x, 0] : hh < 120 ? [x, c, 0] : hh < 180 ? [0, c, x] : hh < 240 ? [0, x, c] : hh < 300 ? [x, 0, c] : [c, 0, x];
				const hex = '#' + [r1, g1, b1].map(v => Math.round((v + m) * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
				const q = hsl(hex);
				const clash = peers.some(p => p.hsl.s >= NEUTRAL_S && q.s >= NEUTRAL_S
					&& dHue(p.hsl.h, q.h) < D_HUE && Math.abs(p.hsl.l - q.l) < D_LIGHT && Math.abs(p.hsl.s - q.s) < D_SAT);
				if (!clash) { ok.push(`${hex} h${Math.round(q.h)} s${Math.round(q.s)} l${Math.round(q.l)}`); }
			}
		}
	}
	console.log(ok.join('\n') || '(nothing clears)');
	process.exit(0);
}

const r7 = [], r8 = [], near = [], sep = [];
for (let a = 0; a < icons.length; a++) {
	for (let b = a + 1; b < icons.length; b++) {
		const A = icons[a], B = icons[b];
		if (!A.own && !B.own) { continue; }
		if (A.archetype !== B.archetype) { continue; }
		if (sameFamily(A.id, B.id)) { continue; }
		const dh = dHue(A.hsl.h, B.hsl.h), dl = Math.abs(A.hsl.l - B.hsl.l), ds = Math.abs(A.hsl.s - B.hsl.s);
		const neutral = A.hsl.s < NEUTRAL_S || B.hsl.s < NEUTRAL_S;
		if (!neutral && dh < D_HUE && dl < D_LIGHT && ds < D_SAT) {
			const f = formSim(A, B);
			const rec = { a: A.id, b: B.id, arch: A.archetype, dh, dl, ds, ...f, ha: A.dominant, hb: B.dominant, bothMine: A.own && B.own };
			if (A.archetype === 'SILHOUETTE' && f.sim < FORM_SEP) { sep.push(rec); } else { r7.push(rec); }
		} else if (!neutral && dh < D_HUE * 1.4 && dl < D_LIGHT * 1.3 && ds < D_SAT * 1.3) {
			near.push({ a: A.id, b: B.id, arch: A.archetype, dh, dl, ds });
		}
		const f2 = formSim(A, B);
		const bar = A.archetype === 'BADGE' ? IOU_COLLIDE_BADGE : IOU_COLLIDE;
		if (f2.sim >= bar) { r8.push({ a: A.id, b: B.id, arch: A.archetype, ...f2, bothMine: A.own && B.own }); }
		else if (f2.sim >= IOU_NEAR) { near.push({ a: A.id, b: B.id, arch: A.archetype, r8near: f2.sim.toFixed(2) }); }
	}
}

const fmt = (p) => `${p.a} | ${p.b}  [${p.arch}] ${p.ha ?? ''} ${p.hb ?? ''} dh ${p.dh?.toFixed(1)} dl ${p.dl?.toFixed(1)} ds ${p.ds?.toFixed(1)} sim ${p.sim?.toFixed(2)}${p.bothMine ? '  << both A09' : ''}`;
console.log(`R7 twins: ${r7.length}`);
r7.forEach(p => console.log('  ' + fmt(p)));
console.log(`\nR8 form collisions: ${r8.length}`);
r8.forEach(p => console.log(`  ${p.a} | ${p.b} [${p.arch}] area ${p.area.toFixed(2)} edge ${p.edge.toFixed(2)} sim ${p.sim.toFixed(2)}${p.bothMine ? '  << both A09' : ''}`));
console.log(`\nR7 colour hits separated by form (SILHOUETTE): ${sep.length}`);
sep.forEach(p => console.log('  ' + fmt(p)));
if (argv.includes('--near')) {
	console.log(`\nnear misses: ${near.length}`);
	near.forEach(p => console.log(`  ${p.a} | ${p.b} [${p.arch}] ${p.r8near ? 'R8 sim ' + p.r8near : `dh ${p.dh.toFixed(1)} dl ${p.dl.toFixed(1)} ds ${p.ds.toFixed(1)}`}`));
}
