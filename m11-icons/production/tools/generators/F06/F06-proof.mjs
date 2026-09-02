#!/usr/bin/env node
// F06-proof.mjs — spill proof + 16 px raster proof for folder slice F06.
//
//   node F06-proof.mjs --spill            every variant, ink-outside-silhouette count
//   node F06-proof.mjs --grid id [id...]  16 px composite + emblem-coverage grids
//
// Uses the local pure-JS rasteriser (F06-raster.mjs); the Playwright chromium is
// saturated by the other concurrent slices, so nothing here shells out to it.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { mask, flatten } from './F06-raster.mjs';

const DIR = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/svg/folder';
const IDS = ('spin src-tauri sso stack stencil store story stylus sublime syntax target taskfile tasks ' +
	'telegram television toc tools trash travis trigger trunk ui unity update upload vagrant ' +
	'verdaccio vitepress vm vs vscode-test vue-directives vuepress vuex-store wakatime wasp ' +
	'windows windsurf wit wordpress www zeabur zed').split(' ');

const BOX = { closed: [5.30, 4.60, 13.50, 12.80], open: [7.26, 6.75, 13.06, 12.55] };

function paths(id) {
	const src = readFileSync(join(DIR, `${id}.svg`), 'utf8');
	return [...src.matchAll(/<path([^>]*?)d="([^"]*)"/g)].map(m => ({
		d: m[2],
		fill: (/fill="([^"]*)"/.exec(m[1]) || [])[1],
		rule: /evenodd/.test(m[1]) ? 'evenodd' : 'nonzero'
	}));
}

const grid = (n) => Array.from({ length: n }, (_, k) => (k + 0.5) * 16 / n);

// ---- spill ----------------------------------------------------------------------
function spill() {
	const N = 512; // 32x
	const g = grid(N);
	let fails = 0, worst = [];
	for (const id of IDS) {
		for (const v of ['', '-open']) {
			const P = paths(id + v);
			// closed: the tan body is path 0. open: the FRONT flap is path 1 (R9a binds
			// the open box to the flap, not to the whole silhouette).
			const holder = v ? [P[1].d] : [P[0].d];
			const base = mask(holder, g, g);
			const ink = mask([P[2].d], g, g, P[2].rule);
			let n = 0, at = null;
			for (let p = 0; p < ink.length; p++) {
				if (ink[p] && !base[p]) { n++; if (!at) { at = [(p % N) * 16 / N, ((p / N) | 0) * 16 / N]; } }
			}
			// bbox of the emblem vs its R9a box
			let x1 = 1e9, y1 = 1e9, x2 = -1e9, y2 = -1e9;
			for (const poly of flatten(P[2].d)) {
				for (const [x, y] of poly) {
					if (x < x1) { x1 = x; } if (x > x2) { x2 = x; }
					if (y < y1) { y1 = y; } if (y > y2) { y2 = y; }
				}
			}
			const B = BOX[v ? 'open' : 'closed'];
			const out = (x1 < B[0] - 0.005) || (y1 < B[1] - 0.005) || (x2 > B[2] + 0.005) || (y2 > B[3] + 0.005);
			if (n || out) {
				fails++;
				worst.push(`  ${id}${v}: ${n} px outside the ${v ? 'front flap' : 'folder body'}` +
					(at ? ` (first at ${at[0].toFixed(2)},${at[1].toFixed(2)})` : '') +
					(out ? `  BOX ESCAPE ink ${x1.toFixed(2)},${y1.toFixed(2)}→${x2.toFixed(2)},${y2.toFixed(2)} vs box ${B.join(',')}` : ''));
			}
		}
	}
	console.log(worst.join('\n'));
	console.log(`${IDS.length * 2} variants rasterised at 512x512 (32x) — ${fails} with ink outside the silhouette or the R9a box`);
	return fails;
}

// ---- 16 px raster ---------------------------------------------------------------
const RAMP = ' .:-=+*#%@';
const hex = (h) => h.startsWith('rgba')
	? (() => { const p = h.slice(5, -1).split(',').map(s => parseFloat(s)); return [p[0], p[1], p[2], p[3]]; })()
	: [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16), 1];
const lum = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

function gridFor(id) {
	const P = paths(id);
	const SS = 8, N = 16 * SS, g = grid(N);
	const layers = P.map(p => ({ m: mask([p.d], g, g, p.rule), c: hex(p.fill) }));
	const px = [], cov = [];
	for (let y = 0; y < 16; y++) {
		for (let x = 0; x < 16; x++) {
			let R = 0, G = 0, B = 0, e = 0;
			for (let sy = 0; sy < SS; sy++) {
				for (let sx = 0; sx < SS; sx++) {
					const p = (y * SS + sy) * N + x * SS + sx;
					let r = 0x12, gg = 0x13, b = 0x14;
					for (let L = 0; L < layers.length; L++) {
						if (layers[L].m[p]) {
							const [cr, cg, cb, ca] = layers[L].c;
							r = r + (cr - r) * ca; gg = gg + (cg - gg) * ca; b = b + (cb - b) * ca;
							if (L === layers.length - 1) { e++; }
						}
					}
					R += r; G += gg; B += b;
				}
			}
			const n = SS * SS;
			px.push([R / n, G / n, B / n]);
			cov.push(e / n);
		}
	}
	return { px, cov, fill: P[2].fill };
}

function show(id) {
	const { px, cov, fill } = gridFor(id);
	const L = px.map(p => lum(...p));
	const lo = Math.min(...L), hi = Math.max(...L);
	const rows = [], erows = [];
	for (let y = 0; y < 16; y++) {
		let a = '', b = '';
		for (let x = 0; x < 16; x++) {
			const i = y * 16 + x;
			a += RAMP[Math.max(0, Math.min(9, Math.round((L[i] - lo) / (hi - lo || 1) * 9)))];
			b += cov[i] === 0 ? ' ' : RAMP[Math.max(1, Math.min(9, Math.round(cov[i] * 9)))];
		}
		rows.push(a); erows.push(b);
	}
	const solid = cov.filter(c => c >= 0.75).length, touched = cov.filter(c => c >= 0.25).length;
	const tan = lum(0xBF, 0x93, 0x54), ink = lum(...hex(fill));
	console.log(`\n=== ${id}  fill ${fill}  Δlum vs tan ${Math.round(tan - ink)}  ` +
		`emblem px: ${solid} solid / ${touched} touched of 256`);
	for (let y = 0; y < 16; y++) { console.log(`  |${rows[y]}|   |${erows[y]}|`); }
}

const argv = process.argv.slice(2);
if (argv[0] === '--grid') { for (const id of argv.slice(1)) { show(id); } }
else { process.exit(spill()); }
