// final.mjs — the exact R7/R8 verdict for slice A06, using audit.mjs's rules end to end.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { rasterFills } from '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/tools/raster.mjs';

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

const roster = JSON.parse(readFileSync(new URL('./roster.json', import.meta.url), 'utf8'));
const core = JSON.parse(readFileSync(join(ROOT, 'set-manifest.json'), 'utf8')).icons.filter(i => i.kind === 'file');
const FAM = [
	['powershell', 'powershell-format', 'powershell-psd', 'powershell-psm', 'powershell-types'],
	['prisma', 'prismaconfig'], ['processing', 'processinglang'],
	['python', 'pyscript', 'pytyped', 'pythonconfig'], ['qbs', 'qml', 'qmldir', 'qrc'],
	['rust', 'ron', 'ra-syntax-tree', 'rust-toolchain'], ['r', 'rmd', 'rproj'], ['ruby', 'rake'],
	['scala', 'sbt'], ['rescript', 'rescript-interface', 'reason'], ['roblox', 'rbxmk'],
	['reactjs', 'reactts', 'reacttemplate'], ['sass', 'scss'], ['markdown', 'quarkdown'],
	['search', 'search-result'], ['redux-action', 'redux-reducer', 'redux-selector', 'redux-store'],
	['xml', 'rnc'], ['word', 'excel', 'powerpoint', 'publisher'],
	['typescript', 'typescriptdef'], ['js', 'jsconfig'], ['json', 'json5'], ['sql', 'sqlite'],
	['cheader', 'cppheader'], ['testjs', 'testts'], ['vite', 'vitest'], ['next', 'vercel']
];
const fam = new Map(); FAM.forEach((f, i) => f.forEach(id => fam.set(id, i)));
const sameFam = (a, b) => fam.has(a) && fam.get(a) === fam.get(b);

const mine = roster.map(r => ({ id: r.id, arch: r.arch, mine: true }));
const theirs = core.map(c => ({ id: c.id, arch: c.archetype, mine: false }));
const all = [...mine, ...theirs];
const measured = await rasterFills(all.map(e => ({ kind: 'file', id: e.id, path: join(ROOT, 'svg/file', `${e.id}.svg`) })));
const items = all.map(e => {
	const m = measured.get(`file/${e.id}`);
	return { ...e, dom: m.dominant, ...hsl(m.dominant), form: e.arch === 'BADGE' && m.mark.includes('1') ? m.mark : m.ink, mask: m.mask, bytes: m.bytes };
});

function iou(a, b) { let i = 0, u = 0; for (let k = 0; k < a.length; k++) { const x = a[k] === '1', y = b[k] === '1'; if (x && y) { i++; } if (x || y) { u++; } } return u ? i / u : 0; }
const outs = new Map();
function outline(mask, M) {
	if (outs.has(mask)) { return outs.get(mask); }
	const at = (x, y) => (x < 0 || y < 0 || x >= M || y >= M ? '0' : mask[y * M + x]);
	const e = new Uint8Array(M * M);
	for (let y = 0; y < M; y++) { for (let x = 0; x < M; x++) { if (at(x, y) === '1' && (at(x - 1, y) === '0' || at(x + 1, y) === '0' || at(x, y - 1) === '0' || at(x, y + 1) === '0')) { e[y * M + x] = 1; } } }
	const o = new Array(M * M).fill('0');
	for (let y = 0; y < M; y++) { for (let x = 0; x < M; x++) { if (!e[y * M + x]) { continue; } for (let dy = -1; dy <= 1; dy++) { for (let dx = -1; dx <= 1; dx++) { const nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < M && ny < M) { o[ny * M + nx] = '1'; } } } } }
	const s = o.join(''); outs.set(mask, s); return s;
}
const sim = (A, B) => Math.min(iou(A.form, B.form), iou(outline(A.form, A.mask), outline(B.form, B.mask)));

const colourHit = (a, b) => a.arch === b.arch && !sameFam(a.id, b.id)
	&& a.s >= NEUTRAL_S && b.s >= NEUTRAL_S
	&& dHue(a.h, b.h) < D_HUE && Math.abs(a.l - b.l) < D_LIGHT && Math.abs(a.s - b.s) < D_SAT;
const twin = (a, b) => colourHit(a, b) && !(a.arch === 'SILHOUETTE' && sim(a, b) < FORM_SEP);

const A = items.filter(i => i.mine);
let inner = [], outer = [], formHits = [];
for (let i = 0; i < A.length; i++) {
	for (let j = i + 1; j < A.length; j++) { if (twin(A[i], A[j])) { inner.push(`${A[i].id}/${A[j].id}`); } }
}
for (const a of A) {
	for (const b of items.filter(i => !i.mine)) { if (twin(a, b)) { outer.push(`${a.id} ~ ${b.id} (${a.arch}) ${a.dom}/${b.dom}`); } }
}
for (const a of A) {
	for (const b of items) {
		if (a.id === b.id || (b.mine && a.id > b.id) || a.arch !== b.arch || sameFam(a.id, b.id)) { continue; }
		const s = sim(a, b), bar = a.arch === 'BADGE' ? IOU_COLLIDE_BADGE : IOU_COLLIDE;
		if (s >= bar) { formHits.push(`${a.id}/${b.id} ${s.toFixed(2)}`); }
	}
}
console.log(`R7 within slice (hard):  ${inner.length ? inner.join(', ') : 'none'}`);
console.log(`R8 anywhere (hard):      ${formHits.length ? formHits.join(', ') : 'none'}`);
console.log(`\nR7 vs core, real twins after the SILHOUETTE form gate (${outer.length}) — §11.3 tolerated, logged:`);
for (const o of outer.sort()) { console.log('  ' + o); }
