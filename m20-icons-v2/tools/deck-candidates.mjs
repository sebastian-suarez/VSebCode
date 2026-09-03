#!/usr/bin/env node
// deck-candidates.mjs — the measurement study behind docker's container grid.
//
//   node tools/deck-candidates.mjs [out.png]
//
// The pilot gate rejected docker's round-2 cargo (3+1, four boxes). "How many
// containers can the mark actually carry" is arithmetic, not taste, so this
// renders every layout the question allows next to the official artwork and
// prints the three numbers that decide it:
//
//   box size    — official subpath 7 is 2.49 x 2.26 source units. Translating it
//                 is faithful; scaling it is a deviation and is labelled as one.
//   gap         — L5's official-forced floor is 1.2 px at the shipped fit.
//   fin         — the whale's back is flat from x 0.6 to 17.4 and its tail fin
//                 stands at x 17.79 across the bottom row's height. The official
//                 mark keeps 1.50 u of clearance to it, which is what makes its
//                 real deck x 2.03 .. 16.29 = 14.26 u wide.
//
// The verdict this produced (2026-09-03): three columns is the maximum, and the
// most cargo three columns can carry while holding the floor is 3+3+1.

import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import * as si from 'simple-icons';
import { subpaths, bbox, unionBBox, fit, xform } from './pathkit.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, '..', 'pilot');
const png = process.argv[2] || join(OUT, 'proofs', 'docker-deck-candidates.png');

const SP = subpaths(si.siDocker.path);
const WHALE = SP[9], BOX = SP[7];
const BW = 2.49, BH = 2.26;
const ROW = [8.82, 6.10, 3.39];          // official row origins
const DECK = { x0: 2.03, x1: 16.29, c: 9.16 };
const FIN = 17.79;
const FLOOR = 1.2;
const ENV = { w: 15.2, h: 10.4 };
const PITCH = 4.50;                      // round-2 constant: 2.49 box + 2.01 gap
const at = (x, y, k = 1) => xform(BOX, { sx: k, dx: x - 4.95 * k, dy: y - 8.82 * k });

/** rows bottom-up as column-index lists on a `cols` ruler */
function deck(cols, rows, k = 1) {
	return rows.flatMap((idx, r) => idx.map(i => at(cols[i], ROW[r], k)));
}
const cols3 = [0, 1, 2].map(i => DECK.c - (2 * PITCH + BW) / 2 + i * PITCH);
const cols4 = [0, 1, 2, 3].map(i => DECK.c - (3 * PITCH + BW) / 2 + i * PITCH);
// four columns squeezed INSIDE the official deck span: the box has to shrink
const K4 = (DECK.x1 - DECK.x0 - 3 * (FLOOR / 0.6038)) / 4 / BW;
const P4 = BW * K4 + FLOOR / 0.6038;
const cols4in = [0, 1, 2, 3].map(i => DECK.x0 + i * P4);

const CANDS = [
	['3+1 · round 2, REJECTED at the gate', deck(cols3, [[0, 1, 2], [1]]), 1],
	['3+2', deck(cols3, [[0, 1, 2], [1, 2]]), 1],
	['3+2+1', deck(cols3, [[0, 1, 2], [1, 2], [2]]), 1],
	['3+3', deck(cols3, [[0, 1, 2], [0, 1, 2]]), 1],
	['3+3+1 · SHIPPED', deck(cols3, [[0, 1, 2], [0, 1, 2], [2]]), 1],
	['4+2 · deck overrun', deck(cols4, [[0, 1, 2, 3], [1, 2]]), 1],
	['4+3+1 · deck overrun', deck(cols4, [[0, 1, 2, 3], [1, 2, 3], [3]]), 1],
	['4+3+1 · box shrunk to fit', deck(cols4in, [[0, 1, 2, 3], [1, 2, 3], [3]], K4), K4],
	['5+3+1 · the official grid', [
		...[2.03, 4.95, 7.91, 10.84, 13.80].map(x => at(x, ROW[0])),
		...[4.95, 7.92, 10.84].map(x => at(x, ROW[1])),
		at(10.84, ROW[2])
	], 1]
];

const svg = (b) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${b}</svg>`;
const rows = CANDS.map(([name, boxes, k]) => {
	const parts = [WHALE, ...boxes];
	const u = unionBBox(parts);
	const s = Math.min(ENV.w / u.w, ENV.h / u.h);
	const out = svg(`<path fill="#2496ED" d="${fit(parts, { w: ENV.w, h: ENV.h, cx: 8, cy: 8 }).join('')}"/>`);
	const bb = boxes.map(bbox);
	const tiers = new Map();
	for (const b of bb) { const key = b.y1.toFixed(2); tiers.set(key, [...(tiers.get(key) || []), b]); }
	const tier = [...tiers.entries()].sort((a, b) => +b[0] - +a[0]).map(([y, r]) => {
		r.sort((a, c) => a.x1 - c.x1);
		return { y: +y, n: r.length, gap: r.length > 1 ? (r[1].x1 - r[0].x2) * s : null,
			x0: r[0].x1, x1: r[r.length - 1].x2 };
	});
	const gaps = tier.filter(t => t.gap !== null).map(t => t.gap);
	const base = tier[0];
	const ink = unionBBox(fit(parts, { w: ENV.w, h: ENV.h, cx: 8, cy: 8 }));
	return { name, out, s, k, n: boxes.length, tier, ink,
		minGap: gaps.length ? Math.min(...gaps) : Infinity,
		fin: (FIN - base.x1) * s, span: [base.x0, base.x1], boxPx: BW * k * s };
});

const A = (s, px) => s.replace('<svg ', `<svg width="${px}" height="${px}" `);
const official = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">'
	+ `<path fill="#2496ED" d="${si.siDocker.path}"/></svg>`;
const verdict = (r) => {
	const bad = [];
	if (r.minGap < FLOOR) { bad.push(`gap ${r.minGap.toFixed(2)} px under the 1.2 px floor`); }
	if (r.span[0] < DECK.x0 - 0.01 || r.span[1] > DECK.x1 + 0.01) {
		bad.push(`deck runs x ${r.span[0].toFixed(2)}..${r.span[1].toFixed(2)}, outside the official `
			+ `${DECK.x0}..${DECK.x1}; fin clearance ${r.fin.toFixed(2)} px`);
	}
	if (r.k !== 1) { bad.push(`box scaled to ${(r.k * 100).toFixed(0)}% of official`); }
	return bad.length ? `<span class="bad">rejected — ${bad.join('; ')}</span>`
		: `<span class="ok">legal — ${r.n} containers</span>`;
};

let html = `<!doctype html><meta charset="utf-8"><style>
body{background:#17191b;margin:0;padding:18px;color:#c9d1d9;
	font:12px/1.5 -apple-system,BlinkMacSystemFont,"SF Pro Text",system-ui,sans-serif}
h1{font-size:16px;color:#e6e8ea;margin:0 0 4px;font-weight:640}
p.lead{color:#8b949e;margin:0 0 16px;max-width:104ch}
table{border-collapse:collapse;width:100%}
td{padding:8px 10px;border-bottom:1px solid #26292c;vertical-align:middle}
.p{background:#121314;border-radius:7px;padding:6px;display:inline-block}
svg{display:block}.px{image-rendering:pixelated}
.n{font:600 12.5px system-ui;color:#e6e8ea;width:210px}
.m{font:10.5px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace;color:#8b949e}
.bad{color:#e8836b}.ok{color:#86cf9b}
</style><body>
<h1>docker · container-deck candidates</h1>
<p class="lead">Whale = official subpath 9, untouched, in every row. Box = official subpath 7
(2.49&times;2.26 u), translated only unless the row says otherwise. Columns sit on the round-2
pitch of 4.50 u (2.49 box + 2.01 gap). The official deck spans x&nbsp;2.03&ndash;16.29 because
the whale's tail fin stands at x&nbsp;17.79 across the bottom row and the mark keeps 1.50&nbsp;u
of clearance to it. Each row shows 64&nbsp;px, a true 16&nbsp;px, and that 16&nbsp;px render at 7&times;.</p>
<table><tr><td class="n">OFFICIAL artwork</td>
<td><div class="p"><svg width="64" height="64" viewBox="0 0 24 24"><path fill="#2496ED" d="${si.siDocker.path}"/></svg></div></td>
<td><div class="p">${A(official, 16)}</div></td>
<td><div class="p">${A(official, 16).replace('<svg ', '<svg class="px" style="width:112px;height:112px" ')}</div></td>
<td class="m">9 containers, 5+3+1 on five columns<br>gap 0.44 u · deck 2.03..16.29 · fin clearance 1.50 u</td></tr>`;
for (const r of rows) {
	html += `<tr><td class="n">${r.name}</td><td><div class="p">${A(r.out, 64)}</div></td>`
		+ `<td><div class="p">${A(r.out, 16)}</div></td>`
		+ `<td><div class="p">${A(r.out, 16).replace('<svg ', '<svg class="px" style="width:112px;height:112px" ')}</div></td>`
		+ `<td class="m">${r.n} containers · box ${r.boxPx.toFixed(2)} px · fit scale ${r.s.toFixed(4)}<br>`
		+ r.tier.map(t => `${t.n}× y${t.y}${t.gap ? ` gap ${t.gap.toFixed(2)} px` : ''}`).join(' · ')
		+ `<br>bottom row x ${r.span[0].toFixed(2)}..${r.span[1].toFixed(2)} · `
		+ `fin clearance ${r.fin.toFixed(2)} px · ink ${r.ink.w.toFixed(2)}×${r.ink.h.toFixed(2)} `
		+ `(mass ${(r.ink.w * r.ink.h).toFixed(0)})<br>${verdict(r)}</td></tr>`;
}
html += '</table></body>';

const tmp = join(tmpdir(), 'm20.deck.html');
writeFileSync(tmp, html);
execFileSync('node', [join(HERE, 'shot.mjs'), tmp, png, '1080', String(260 + rows.length * 152), '2']);
console.log(`wrote ${png} — ${rows.length} candidates`);
for (const r of rows) {
	console.log(`  ${r.name.padEnd(36)} ${String(r.n).padStart(2)} boxes  box ${r.boxPx.toFixed(2)}  `
		+ `min gap ${r.minGap.toFixed(2)}  fin ${r.fin.toFixed(2)}  `
		+ `deck ${r.span[0].toFixed(2)}..${r.span[1].toFixed(2)}  `
		+ `ink ${r.ink.w.toFixed(2)}x${r.ink.h.toFixed(2)}`);
}
