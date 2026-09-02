#!/usr/bin/env node
// check-a03.mjs — R7/R8 for slice A03: hard inside the slice + against core icons,
// measured the same way tools/audit.mjs measures (rasterFills + HSL on the dominant).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { rasterFills } from '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/tools/raster.mjs';
// same formula as tools/audit.mjs (importing it would run its CLI)
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

const ROOT = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production';
const roster = JSON.parse(readFileSync(new URL('./roster.json', import.meta.url), 'utf8'));
const core = JSON.parse(readFileSync(join(ROOT, 'set-manifest.json'), 'utf8')).icons.filter(i => i.kind === 'file');

const D_HUE = 12, D_LIGHT = 12, D_SAT = 25, NEUTRAL_S = 25;
const IOU_COLLIDE = 0.72, IOU_COLLIDE_BADGE = 0.92, FORM_SEP = 0.55;
const dHue = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };

// declared families inside the slice (R3-style rhymes) — exempt from R7/R8 between members
const FAMILIES = [
	['fla', 'flash'], ['gamemaker', 'gamemaker2', 'gamemaker81'],
	['godot', 'gdscript', 'gduid', 'godot-assets', 'godotshader'],
	['idris', 'idrisbin', 'idrispkg'], ['haxe', 'haxedevelop'],
	['firebasestorage', 'firestore'], ['hashicorp', 'hcl'], ['glsl', 'hlsl']
];
const fam = new Map();
FAMILIES.forEach((f, i) => f.forEach(id => fam.set(id, i)));
const sameFam = (a, b) => fam.has(a) && fam.get(a) === fam.get(b);

const all = [...roster.map(r => ({ ...r, mine: true })), ...core.map(c => ({ id: c.id, archetype: c.archetype, mine: false }))];
const measured = await rasterFills(all.map(i => ({ kind: 'file', id: i.id, path: join(ROOT, 'svg/file', `${i.id}.svg`) })));
for (const i of all) {
	const m = measured.get(`file/${i.id}`);
	i.dominant = m.dominant; i.hsl = hsl(m.dominant); i.bytes = m.bytes;
	i.form = i.archetype === 'BADGE' && m.mark.includes('1') ? m.mark : m.ink;
}

function iou(a, b) {
	let inter = 0, union = 0;
	for (let k = 0; k < a.length; k++) { const x = a[k] === '1', y = b[k] === '1'; if (x && y) { inter++; } if (x || y) { union++; } }
	return union ? inter / union : 0;
}
function outline(mask, M = 64) {
	const o = new Array(M * M).fill('0');
	for (let y = 0; y < M; y++) {
		for (let x = 0; x < M; x++) {
			if (mask[y * M + x] !== '1') { continue; }
			let edge = false;
			for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
				const nx = x + dx, ny = y + dy;
				if (nx < 0 || ny < 0 || nx >= M || ny >= M || mask[ny * M + nx] !== '1') { edge = true; }
			}
			if (edge) { for (let dy = -1; dy <= 1; dy++) { for (let dx = -1; dx <= 1; dx++) {
				const nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < M && ny < M) { o[ny * M + nx] = '1'; }
			} } }
		}
	}
	return o.join('');
}
const outlines = new Map(all.map(i => [i.id, outline(i.form)]));
const formScore = (a, b) => Math.min(iou(a.form, b.form), iou(outlines.get(a.id), outlines.get(b.id)));

const r7hard = [], r7soft = [], r8 = [];
for (let i = 0; i < all.length; i++) {
	for (let j = i + 1; j < all.length; j++) {
		const a = all[i], b = all[j];
		if (!a.mine && !b.mine) { continue; }
		if (sameFam(a.id, b.id)) { continue; }
		const fs = formScore(a, b);
		if (a.archetype === b.archetype) {
			const bar = a.archetype === 'BADGE' ? IOU_COLLIDE_BADGE : IOU_COLLIDE;
			if (fs >= bar) { r8.push(`R8 ${a.id} / ${b.id} — ${a.archetype} form ${fs.toFixed(2)} >= ${bar}`); }
		}
		if (a.archetype !== b.archetype) { continue; }
		if (a.hsl.s < NEUTRAL_S || b.hsl.s < NEUTRAL_S) { continue; }
		if (!(dHue(a.hsl.h, b.hsl.h) < D_HUE && Math.abs(a.hsl.l - b.hsl.l) < D_LIGHT && Math.abs(a.hsl.s - b.hsl.s) < D_SAT)) { continue; }
		if (a.archetype === 'SILHOUETTE' && fs < FORM_SEP) { continue; }
		const line = `${a.id} ${a.dominant} / ${b.id} ${b.dominant} — ${a.archetype} dH ${dHue(a.hsl.h, b.hsl.h).toFixed(1)} dL ${Math.abs(a.hsl.l - b.hsl.l).toFixed(1)} dS ${Math.abs(a.hsl.s - b.hsl.s).toFixed(1)} form ${fs.toFixed(2)}`;
		(a.mine && b.mine ? r7hard : r7soft).push(line);
	}
}
console.log(`--- R7 HARD (within slice): ${r7hard.length}`);
r7hard.forEach(l => console.log('  ' + l));
console.log(`--- R7 vs core (log / judge domain): ${r7soft.length}`);
r7soft.forEach(l => console.log('  ' + l));
console.log(`--- R8: ${r8.length}`);
r8.forEach(l => console.log('  ' + l));
