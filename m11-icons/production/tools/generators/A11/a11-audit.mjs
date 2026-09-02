// a11-audit.mjs — local R7/R8 + envelope check for the A11 slice (read-only on shared tools).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { rasterFills } from '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/tools/raster.mjs';
import { ICONS as A } from './a11-icons-1.mjs';
import { ICONS as B } from './a11-icons-2.mjs';
import { ICONS as C } from './a11-icons-3.mjs';

const ROOT = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production';
const MINE = { ...A, ...B, ...C };
const manifest = JSON.parse(readFileSync(join(ROOT, 'set-manifest.json'), 'utf8'));
const core = manifest.icons.filter(i => i.kind === 'file' && !MINE[i.id]);

const D_HUE = 12, D_LIGHT = 12, D_SAT = 25, NEUTRAL_S = 25;
const IOU_COLLIDE = 0.72, IOU_COLLIDE_BADGE = 0.92, FORM_SEP = 0.55;

function hsl(hex) {
	const r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255, b = parseInt(hex.slice(5, 7), 16) / 255;
	const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, l = (mx + mn) / 2;
	let h = 0;
	if (d) { h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; if (h < 0) { h += 360; } }
	return { h, s: (d ? d / (1 - Math.abs(2 * l - 1)) : 0) * 100, l: l * 100 };
}
const dHue = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };

const entries = [
	...Object.keys(MINE).map(id => ({ kind: 'file', id, path: join(ROOT, 'svg/file', `${id}.svg`), mine: true, archetype: MINE[id].archetype })),
	...core.map(i => ({ kind: 'file', id: i.id, path: join(ROOT, 'svg/file', `${i.id}.svg`), mine: false, archetype: i.archetype }))
];
const measured = await rasterFills(entries);

function iou(a, b) { let i = 0, u = 0; for (let k = 0; k < a.length; k++) { const x = a[k] === '1', y = b[k] === '1'; if (x && y) { i++; } if (x || y) { u++; } } return u ? i / u : 0; }
const oc = new Map();
function outline(mask, M) {
	if (oc.has(mask)) { return oc.get(mask); }
	const at = (x, y) => (x < 0 || y < 0 || x >= M || y >= M ? '0' : mask[y * M + x]);
	const out = new Array(M * M).fill('0');
	for (let y = 0; y < M; y++) {
		for (let x = 0; x < M; x++) {
			if (at(x, y) !== '1') { continue; }
			if (at(x - 1, y) === '1' && at(x + 1, y) === '1' && at(x, y - 1) === '1' && at(x, y + 1) === '1') { continue; }
			for (let dy = -1; dy <= 1; dy++) { for (let dx = -1; dx <= 1; dx++) { const nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < M && ny < M) { out[ny * M + nx] = '1'; } } }
		}
	}
	const s = out.join(''); oc.set(mask, s); return s;
}
const sim = (X, Y) => Math.min(iou(X.form, Y.form), iou(outline(X.form, 64), outline(Y.form, 64)));

const icons = entries.map(e => {
	const m = measured.get(`file/${e.id}`);
	const form = e.archetype === 'BADGE' && m.mark.includes('1') ? m.mark : m.ink;
	// ink bbox in 16-unit space
	let x1 = 64, y1 = 64, x2 = -1, y2 = -1;
	for (let y = 0; y < 64; y++) { for (let x = 0; x < 64; x++) { if (m.ink[y * 64 + x] === '1') { if (x < x1) { x1 = x; } if (x > x2) { x2 = x; } if (y < y1) { y1 = y; } if (y > y2) { y2 = y; } } } }
	return { ...e, dominant: m.dominant, hsl: hsl(m.dominant), form, bytes: m.bytes, w: +((x2 - x1 + 1) / 4).toFixed(1), h: +((y2 - y1 + 1) / 4).toFixed(1), fills: m.fills };
});
const byId = new Map(icons.map(i => [i.id, i]));

console.log('--- envelopes (mine) ---');
for (const i of icons.filter(x => x.mine).sort((a, b) => a.id.localeCompare(b.id))) {
	const flag = i.archetype === 'BADGE' ? '' :
		(i.w > 15.0 || i.h > 14.0 ? '  << oversize' : (i.w < 8.5 && i.h < 8.5 ? '  << undersized' : ''));
	console.log(`${i.id.padEnd(24)} ${i.archetype.padEnd(11)} ${i.dominant} ${String(i.w).padStart(5)} x ${String(i.h).padStart(5)}${flag}`);
}

const twinsMine = [], twinsCore = [], formsMine = [], formsCore = [];
for (let a = 0; a < icons.length; a++) {
	for (let b = a + 1; b < icons.length; b++) {
		const A2 = icons[a], B2 = icons[b];
		if (!A2.mine && !B2.mine) { continue; }
		if (A2.archetype !== B2.archetype) { continue; }
		const both = A2.mine && B2.mine;
		const f = sim(A2, B2);
		const bar = A2.archetype === 'BADGE' ? IOU_COLLIDE_BADGE : IOU_COLLIDE;
		if (f >= bar) { (both ? formsMine : formsCore).push({ a: A2.id, b: B2.id, arch: A2.archetype, f }); }
		if (A2.hsl.s < NEUTRAL_S || B2.hsl.s < NEUTRAL_S) { continue; }
		const dh = dHue(A2.hsl.h, B2.hsl.h), dl = Math.abs(A2.hsl.l - B2.hsl.l), ds = Math.abs(A2.hsl.s - B2.hsl.s);
		if (!(dh < D_HUE && dl < D_LIGHT && ds < D_SAT)) { continue; }
		if (A2.archetype === 'SILHOUETTE' && f < FORM_SEP) { continue; }   // separated by form
		(both ? twinsMine : twinsCore).push({ a: A2.id, b: B2.id, arch: A2.archetype, dh: +dh.toFixed(1), dl: +dl.toFixed(1), ds: +ds.toFixed(1), f: +f.toFixed(2) });
	}
}
const show = (t, rows) => { console.log(`\n--- ${t} (${rows.length}) ---`); rows.forEach(r => console.log(JSON.stringify(r))); };
show('R7 twins WITHIN slice (hard)', twinsMine);
show('R7 twins vs core (hard for same domain family)', twinsCore);
show('R8 form collisions WITHIN slice (hard)', formsMine);
show('R8 form collisions vs core (hard)', formsCore);

// near-miss forms, for judging
const near = [];
for (let a = 0; a < icons.length; a++) {
	for (let b = a + 1; b < icons.length; b++) {
		const A2 = icons[a], B2 = icons[b];
		if (!A2.mine && !B2.mine) { continue; }
		if (A2.archetype !== B2.archetype || A2.archetype === 'BADGE') { continue; }
		const f = sim(A2, B2);
		if (f >= 0.62 && f < IOU_COLLIDE) { near.push({ a: A2.id, b: B2.id, f: +f.toFixed(2), both: A2.mine && B2.mine }); }
	}
}
show('R8 near-misses (0.62-0.72)', near.sort((x, y) => y.f - x.f));
