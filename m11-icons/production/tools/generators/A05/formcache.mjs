// formcache.mjs — one raster pass; caches archetype + form mask + form-similarity pairs.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { rasterFills } from '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/tools/raster.mjs';
import { ARCH } from './roster.mjs';

const ROOT = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production';
const manifest = JSON.parse(readFileSync(join(ROOT, 'set-manifest.json'), 'utf8'));
const coreFiles = manifest.icons.filter(i => i.kind === 'file');
const mine = Object.keys(ARCH);
const entries = [
	...mine.map(id => ({ kind: 'file', id, path: join(ROOT, 'svg/file', `${id}.svg`) })),
	...coreFiles.map(i => ({ kind: 'file', id: i.id, path: join(ROOT, 'svg/file', `${i.id}.svg`) }))
];
const measured = await rasterFills(entries);
const arch = new Map(coreFiles.map(i => [i.id, i.archetype]));
for (const [id, a] of Object.entries(ARCH)) { arch.set(id, a); }

const icons = [...new Set(entries.map(e => e.id))].map(id => {
	const m = measured.get(`file/${id}`);
	const a = arch.get(id);
	return { id, archetype: a, dominant: m.dominant, bytes: m.bytes, mine: mine.includes(id), form: a === 'BADGE' && m.mark.includes('1') ? m.mark : m.ink };
});

function iou(a, b) { let i = 0, u = 0; for (let k = 0; k < a.length; k++) { const x = a[k] === '1', y = b[k] === '1'; if (x && y) { i++; } if (x || y) { u++; } } return u ? i / u : 0; }
const outCache = new Map();
function outline(mask, M = 64) {
	if (outCache.has(mask)) { return outCache.get(mask); }
	const at = (x, y) => (x < 0 || y < 0 || x >= M || y >= M ? '0' : mask[y * M + x]);
	const edge = new Uint8Array(M * M), out = new Array(M * M).fill('0');
	for (let y = 0; y < M; y++) { for (let x = 0; x < M; x++) { if (at(x, y) !== '1') { continue; } if (at(x - 1, y) === '0' || at(x + 1, y) === '0' || at(x, y - 1) === '0' || at(x, y + 1) === '0') { edge[y * M + x] = 1; } } }
	for (let y = 0; y < M; y++) { for (let x = 0; x < M; x++) { if (!edge[y * M + x]) { continue; } for (let dy = -1; dy <= 1; dy++) { for (let dx = -1; dx <= 1; dx++) { const nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < M && ny < M) { out[ny * M + nx] = '1'; } } } } }
	const s = out.join(''); outCache.set(mask, s); return s;
}

const sim = {};
for (let a = 0; a < icons.length; a++) {
	for (let b = a + 1; b < icons.length; b++) {
		const A = icons[a], B = icons[b];
		if (!A.mine && !B.mine) { continue; }
		if (A.archetype !== B.archetype) { continue; }
		sim[`${A.id}|${B.id}`] = +Math.min(iou(A.form, B.form), iou(outline(A.form), outline(B.form))).toFixed(3);
	}
}
writeFileSync('./formcache.json', JSON.stringify({
	icons: icons.map(({ id, archetype, dominant, bytes, mine: m }) => ({ id, archetype, dominant, bytes, mine: m })),
	sim
}));
console.log(`cached ${icons.length} icons, ${Object.keys(sim).length} same-archetype pairs`);
