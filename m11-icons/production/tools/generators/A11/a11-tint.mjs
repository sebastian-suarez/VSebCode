// a11-tint.mjs — spread the A11 GLYPH hues so R7 clears inside the slice, and clears the
// core config/tooling neighbours where it can. Anchored (brand-true) glyphs never move.
import { readFileSync } from 'node:fs';
import { ICONS as A } from './a11-icons-1.mjs';
import { ICONS as B } from './a11-icons-2.mjs';
import { ICONS as C } from './a11-icons-3.mjs';

const ROOT = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production';
const MINE = { ...A, ...B, ...C };
const manifest = JSON.parse(readFileSync(`${ROOT}/set-manifest.json`, 'utf8'));

const hsl = (hex) => {
	const r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255, b = parseInt(hex.slice(5, 7), 16) / 255;
	const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, l = (mx + mn) / 2;
	let h = 0;
	if (d) { h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; if (h < 0) { h += 360; } }
	return { h, s: (d ? d / (1 - Math.abs(2 * l - 1)) : 0) * 100, l: l * 100 };
};
const hex = ({ h, s, l }) => {
	s /= 100; l /= 100;
	const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2;
	const seg = [[c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x]][Math.floor(h / 60) % 6];
	return '#' + seg.map(v => Math.round((v + m) * 255).toString(16).padStart(2, '0').toUpperCase()).join('');
};
const dHue = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
const twin = (p, q) => p.s >= 25 && q.s >= 25 && dHue(p.h, q.h) < 12 && Math.abs(p.l - q.l) < 12 && Math.abs(p.s - q.s) < 25;

// core GLYPHs, split into config/tooling neighbours (hard) and the rest (soft)
const NEIGHBOUR = new Set(['config', 'editorconfig', 'eslint', 'stylelint', 'webpack', 'turborepo',
	'vitest', 'cypress', 'postcss', 'todo', 'makefile', 'git', 'json', 'markdown']);
const coreGlyphs = manifest.icons.filter(i => i.kind === 'file' && i.archetype === 'GLYPH' && !MINE[i.id])
	.map(i => ({ id: i.id, hsl: hsl(i.dominant), hard: NEIGHBOUR.has(i.id) }));

// brand-true hues that must not move, then the free ones. rome / vale / textlint / railway /
// rc / shadcn / slug sit in the neutral lane (HSL S < 25) and are R7-exempt, so they are out.
const FIXED = { svelteconfig: '#B84325', sublime: '#E3B063', 'sapphire-framework-cli': '#4A6FD0',
	semgrep: '#6FB05C', taplo: '#A87E5E' };
const ORDER = [...Object.keys(FIXED), 'quasar', 'shuttle', 'tsdown', 'pyup', 'trivy', 'remark',
	'puppeteer', 'tox', 'taze', 'rehype', 'stitches', 'trigger', 'steadybit', 'unibeautify',
	'solidarity', 'razzle', 'rspec', 'retext'];
const ANCHORED = new Set(Object.keys(FIXED));

const placed = [];
const out = {};
for (const id of ORDER) {
	const want = hsl(FIXED[id] ?? MINE[id].fill);
	const cands = [];
	if (ANCHORED.has(id)) { cands.push({ ...want }); }
	else {
		for (let dh = 0; dh <= 180; dh += 3) {
			for (const sgn of [1, -1]) {
				for (const s of [30, 36, 42, 48, 54]) {
					for (const l of [44, 49, 54, 59, 64]) {
						cands.push({ h: (want.h + sgn * dh + 360) % 360, s, l,
							cost: dh * 1.0 + Math.abs(s - want.s) * 0.35 + Math.abs(l - want.l) * 0.5 });
					}
				}
			}
		}
		cands.sort((a, b) => a.cost - b.cost);
	}
	let chosen = null, fallback = null;
	for (const c0 of cands) {
		const c = hsl(hex(c0));                       // test the quantised colour, not the ideal
		if (placed.some(p => twin(c, p.hsl))) { continue; }
		const hardHit = coreGlyphs.some(g => g.hard && twin(c, g.hsl));
		if (!fallback) { fallback = c0; }
		if (hardHit) { continue; }
		chosen = c0; break;
	}
	if (!chosen && ANCHORED.has(id) && placed.some(p => twin(want, p.hsl))) {
		console.log(`!! anchored ${id} still twins inside the slice`);
	}
	chosen = chosen || fallback || { ...want };
	const hx = hex(chosen);
	const real = hsl(hx);
	placed.push({ id, hsl: real });
	out[id] = hx;
}

for (const id of ORDER) {
	const soft = coreGlyphs.filter(g => !g.hard && twin(hsl(out[id]), g.hsl)).map(g => g.id);
	const hard = coreGlyphs.filter(g => g.hard && twin(hsl(out[id]), g.hsl)).map(g => g.id);
	console.log(`${id.padEnd(24)} ${MINE[id].fill} -> ${out[id]}${ANCHORED.has(id) ? '  (anchored)' : ''}` +
		`${hard.length ? '  HARD:' + hard.join(',') : ''}${soft.length ? '  soft:' + soft.join(',') : ''}`);
}
console.log('\nJSON', JSON.stringify(out));
