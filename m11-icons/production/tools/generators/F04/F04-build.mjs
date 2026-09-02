#!/usr/bin/env node
// F04-build.mjs — emit svg/folder/<id>.svg + <id>-open.svg for slice F04.
//
// The canon tan bases are spliced in VERBATIM: the closed/open files are read off
// disk and the emblem <path> is inserted before </svg>. Nothing else is touched.

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { BOX, mapOps, serialize, bbox } from './F04-geom.mjs';
import { EMBLEMS } from './F04-emblems.mjs';
import { letterPath } from '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/tools/letterpath.mjs';

const SVG = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/svg/folder';
const write = !process.argv.includes('--dry');

const canon = {
	closed: readFileSync(join(SVG, 'folder.svg'), 'utf8').trimEnd(),
	open: readFileSync(join(SVG, 'folder-open.svg'), 'utf8').trimEnd()
};
for (const k of ['closed', 'open']) {
	if (!canon[k].endsWith('</svg>')) { throw new Error(`canon ${k} does not end in </svg>`); }
}
const base = {
	closed: canon.closed.slice(0, -'</svg>'.length),
	open: canon.open.slice(0, -'</svg>'.length)
};

// Letters are sized in the unit field, then scaled with the box. Fit first so a
// wide cap (W) never runs past the 10-unit field.
const LIMIT = { w: 9.6, h: 9.8 };
function fitCap(text, cap) {
	const probe = letterPath({ text, cap, cx: 5, cy: 5, precision: 4 });
	const k = Math.min(LIMIT.w / probe.ink.w, LIMIT.h / probe.ink.h, 1);
	return cap * k;
}

const rows = [];
let maxBytes = 0, totalBytes = 0;

for (const e of EMBLEMS) {
	let unitBox;
	const d = {};
	if (e.letter) {
		const cap = fitCap(e.letter.text, e.letter.cap);
		const probe = letterPath({ text: e.letter.text, cap, cx: 5, cy: 5, precision: 4 });
		unitBox = { x1: probe.ink.x1, y1: probe.ink.y1, x2: probe.ink.x2, y2: probe.ink.y2 };
		for (const v of ['closed', 'open']) {
			const { s, tx, ty } = BOX[v];
			d[v] = letterPath({
				text: e.letter.text, cap: cap * s,
				cx: tx + 5 * s, cy: ty + 5 * s, precision: 2
			}).d;
		}
		e.capUnits = +cap.toFixed(3);
	} else {
		unitBox = bbox(e.ops);
		for (const v of ['closed', 'open']) {
			const { s, tx, ty } = BOX[v];
			d[v] = serialize(mapOps(e.ops, s, tx, ty));
		}
	}

	const eps = 0.02;
	const spill = [];
	if (unitBox.x1 < -eps) { spill.push(`x1 ${unitBox.x1.toFixed(2)}`); }
	if (unitBox.y1 < -eps) { spill.push(`y1 ${unitBox.y1.toFixed(2)}`); }
	if (unitBox.x2 > 10 + eps) { spill.push(`x2 ${unitBox.x2.toFixed(2)}`); }
	if (unitBox.y2 > 10 + eps) { spill.push(`y2 ${unitBox.y2.toFixed(2)}`); }
	if (spill.length) { throw new Error(`${e.id}: emblem leaves the 0..10 field — ${spill.join(', ')}`); }

	const fr = e.rule ? ` fill-rule="${e.rule}"` : '';
	const files = {
		closed: `${base.closed}<path fill="${e.fill}"${fr} d="${d.closed}"/></svg>`,
		open: `${base.open}<path fill="${e.fill}"${fr} d="${d.open}"/></svg>`
	};
	const bytes = { closed: Buffer.byteLength(files.closed), open: Buffer.byteLength(files.open) };
	maxBytes = Math.max(maxBytes, bytes.closed, bytes.open);
	totalBytes += bytes.closed + bytes.open;

	if (write) {
		writeFileSync(join(SVG, `${e.id}.svg`), files.closed);
		writeFileSync(join(SVG, `${e.id}-open.svg`), files.open);
	}
	rows.push({
		id: e.id, desc: e.desc, fill: e.fill, source: e.source,
		bytes: bytes.closed, bytesOpen: bytes.open,
		box: [+unitBox.x1.toFixed(2), +unitBox.y1.toFixed(2), +unitBox.x2.toFixed(2), +unitBox.y2.toFixed(2)],
		w: +(unitBox.x2 - unitBox.x1).toFixed(2), h: +(unitBox.y2 - unitBox.y1).toFixed(2),
		letter: e.letter ? `${e.letter.text} cap ${e.capUnits}u` : ''
	});
}

writeFileSync('/private/tmp/claude-501/-Users-sebastian-suarez-Projects-VSebCode/cd497411-6ae3-485b-8bfb-25848c779b0a/scratchpad/F04-manifest.json',
	JSON.stringify(rows, null, 1));

for (const r of rows) {
	console.log(`${r.id.padEnd(15)} ${String(r.bytes).padStart(4)}/${String(r.bytesOpen).padStart(4)}B  ` +
		`${r.fill}  box ${r.w}x${r.h} @ ${r.box.join(',')}  ${r.letter}`);
}
console.log(`\n${rows.length} concepts, ${rows.length * 2} files, ${totalBytes} bytes total, ` +
	`${Math.round(totalBytes / (rows.length * 2))} avg, ${maxBytes} max`);
