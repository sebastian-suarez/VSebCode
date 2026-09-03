#!/usr/bin/env node
// probe.mjs — the measuring bench. Prints a source's subpath structure, bboxes and
// the stem width each subpath would land on once fitted, so an L5 verdict is a
// number and not an opinion. Working tool: nothing in the pilot depends on it.
//
//   node tools/probe.mjs si:git 13.2 13.2
//   node tools/probe.mjs file:go-official.svg 15.2 9.6

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as si from 'simple-icons';
import svgpath from 'svgpath';
import { subpaths, bbox, unionBBox } from './pathkit.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, '..', 'sources-svg');

const [what, W = '13.2', H = '13.2'] = process.argv.slice(2);
const parts = [];

if (what.startsWith('si:')) {
	const slug = what.slice(3);
	const o = si['si' + slug[0].toUpperCase() + slug.slice(1)];
	console.log(`simple-icons ${o.slug} · ${o.title} · #${o.hex}`);
	subpaths(o.path).forEach((d, i) => parts.push({ i, d, fill: '#' + o.hex }));
} else {
	const raw = readFileSync(join(SRC, what.replace(/^file:/, '')), 'utf8');
	let i = 0;
	for (const m of raw.matchAll(/<path[^>]*\sd="([^"]+)"[^>]*>/g)) {
		const fill = (m[0].match(/fill="([^"]+)"/) || [])[1] || null;
		const tf = (m[0].match(/transform="([^"]+)"/) || [])[1] || null;
		let d = m[1];
		if (tf) { d = svgpath(d).transform(tf).toString(); }
		for (const sp of subpaths(d)) { parts.push({ i: i++, d: sp, fill, tf: !!tf }); }
	}
}

const all = unionBBox(parts.map(p => p.d));
const s = Math.min(+W / all.w, +H / all.h);
console.log(`union ${all.x1.toFixed(2)},${all.y1.toFixed(2)} .. ${all.x2.toFixed(2)},${all.y2.toFixed(2)}`
	+ `  ${all.w.toFixed(2)} x ${all.h.toFixed(2)}  aspect ${(all.w / all.h).toFixed(3)}`);
console.log(`fit into ${W} x ${H}: scale ${s.toFixed(4)} -> ink ${(all.w * s).toFixed(2)} x ${(all.h * s).toFixed(2)}`
	+ `  mass ${(all.w * s * all.h * s).toFixed(0)} px2\n`);
console.log('  #  fill      bbox (source)                w x h          at 16px');
for (const p of parts) {
	const b = bbox(p.d);
	console.log(`  ${String(p.i).padStart(2)}  ${(p.fill || '-').padEnd(9)} `
		+ `${b.x1.toFixed(2)},${b.y1.toFixed(2)} .. ${b.x2.toFixed(2)},${b.y2.toFixed(2)}`.padEnd(29)
		+ `${b.w.toFixed(2)} x ${b.h.toFixed(2)}`.padEnd(15)
		+ `${(b.w * s).toFixed(2)} x ${(b.h * s).toFixed(2)}`);
}
