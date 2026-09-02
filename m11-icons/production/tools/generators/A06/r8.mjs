// r8.mjs — R8 form collisions + R7 SILHOUETTE form-separation for slice A06.
// Reuses tools/raster.mjs (read-only) and re-implements audit.mjs's iou / outline / formSim.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { rasterFills } from '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/tools/raster.mjs';

const ROOT = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production';
const IOU_COLLIDE = 0.72, IOU_COLLIDE_BADGE = 0.92, FORM_SEP = 0.55;

const roster = JSON.parse(readFileSync(new URL('./roster.json', import.meta.url), 'utf8'));
const core = JSON.parse(readFileSync(join(ROOT, 'set-manifest.json'), 'utf8'))
	.icons.filter(i => i.kind === 'file');

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
	['xml', 'rnc'], ['word', 'excel', 'powerpoint', 'publisher'],
	['typescript', 'typescriptdef'], ['js', 'jsconfig'], ['json', 'json5'], ['sql', 'sqlite'],
	['cheader', 'cppheader'], ['testjs', 'testts'], ['vite', 'vitest'], ['next', 'vercel']
];
const fam = new Map();
FAM.forEach((f, i) => f.forEach(id => fam.set(id, i)));
const sameFam = (a, b) => fam.has(a) && fam.get(a) === fam.get(b);

const entries = [
	...roster.map(r => ({ kind: 'file', id: r.id, path: join(ROOT, 'svg/file', `${r.id}.svg`), arch: r.arch, mine: true })),
	...core.map(c => ({ kind: 'file', id: c.id, path: join(ROOT, 'svg/file', `${c.id}.svg`), arch: c.archetype, mine: false }))
];
const seen = new Set(); const uniq = entries.filter(e => !seen.has(e.id) && seen.add(e.id));
const measured = await rasterFills(uniq.map(({ kind, id, path }) => ({ kind, id, path })));

const items = uniq.map(e => {
	const m = measured.get(`file/${e.id}`);
	return { ...e, form: e.arch === 'BADGE' && m.mark.includes('1') ? m.mark : m.ink, mask: m.mask };
});

function iou(a, b) {
	let inter = 0, union = 0;
	for (let k = 0; k < a.length; k++) {
		const x = a[k] === '1', y = b[k] === '1';
		if (x && y) { inter++; }
		if (x || y) { union++; }
	}
	return union ? inter / union : 0;
}
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
			for (let dy = -1; dy <= 1; dy++) {
				for (let dx = -1; dx <= 1; dx++) {
					const nx = x + dx, ny = y + dy;
					if (nx >= 0 && ny >= 0 && nx < M && ny < M) { out[ny * M + nx] = '1'; }
				}
			}
		}
	}
	const s = out.join('');
	outlines.set(mask, s);
	return s;
}
const formSim = (A, B) => {
	const area = iou(A.form, B.form);
	const edge = iou(outline(A.form, A.mask), outline(B.form, B.mask));
	return { area, edge, sim: Math.min(area, edge) };
};

console.log('== R8 form collisions involving A06 (bar 0.72, BADGE 0.92) ==');
const near = [];
let hits = 0;
for (const A of items.filter(i => i.mine)) {
	for (const B of items) {
		if (A.id >= B.id && B.mine) { continue; }
		if (A.id === B.id || (!B.mine && false)) { continue; }
		if (A.arch !== B.arch || sameFam(A.id, B.id)) { continue; }
		const f = formSim(A, B);
		const bar = A.arch === 'BADGE' ? IOU_COLLIDE_BADGE : IOU_COLLIDE;
		if (f.sim >= bar) { hits++; console.log(`  COLLIDE ${A.id} / ${B.id} (${A.arch}) form ${f.sim.toFixed(2)} area ${f.area.toFixed(2)} edge ${f.edge.toFixed(2)}`); }
		else if (f.sim >= bar - 0.12) { near.push(`  near    ${A.id} / ${B.id} (${A.arch}) form ${f.sim.toFixed(2)}`); }
	}
}
if (!hits) { console.log('  none'); }
console.log(`\n== near misses (within 0.12 of the bar) ==\n${near.join('\n') || '  none'}`);

// R7 SILHOUETTE lane: the within-slice colour hits must be separated by form (< 0.55)
const PAIRS = process.argv.slice(2);
if (PAIRS.length) {
	console.log('\n== form score for the within-slice SILHOUETTE colour hits ==');
	for (const p of PAIRS) {
		const [a, b] = p.split('/');
		const A = items.find(i => i.id === a), B = items.find(i => i.id === b);
		const f = formSim(A, B);
		console.log(`  ${p.padEnd(34)} form ${f.sim.toFixed(2)} (area ${f.area.toFixed(2)} edge ${f.edge.toFixed(2)}) ${f.sim < FORM_SEP ? 'separated' : 'TWIN'}`);
	}
}
