#!/usr/bin/env node
// emit-a03.mjs — write the A03 SVGs and print the roster table.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROSTER, SVG, OUT } from './build-a03.mjs';
import './a03-part1.mjs';
import './a03-part2.mjs';
import './a03-part3.mjs';

const WORK = JSON.parse((await import('node:fs')).readFileSync(
	'/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/longtail-worklist.json', 'utf8'));
const want = WORK.slices.find(s => s.id === 'A03').concepts.map(c => c.id);

const have = ROSTER.map(r => r.id);
const missing = want.filter(id => !have.includes(id));
const extra = have.filter(id => !want.includes(id));
const dupes = have.filter((id, i) => have.indexOf(id) !== i);
if (missing.length) { console.log('MISSING:', missing.join(', ')); }
if (extra.length) { console.log('EXTRA:', extra.join(', ')); }
if (dupes.length) { console.log('DUPLICATE:', dupes.join(', ')); }

let total = 0, max = 0;
for (const r of ROSTER) {
	const svg = SVG(r.body);
	const bytes = Buffer.byteLength(svg);
	total += bytes; max = Math.max(max, bytes);
	writeFileSync(join(OUT, `${r.id}.svg`), svg, 'utf8');
}
const by = {};
for (const r of ROSTER) { by[r.archetype] = (by[r.archetype] || 0) + 1; }
console.log(`\n${ROSTER.length} icons written to ${OUT}`);
console.log('archetypes:', Object.entries(by).map(([k, v]) => `${k} ${v}`).join(', '));
console.log(`bytes: ${total} total, ${Math.round(total / ROSTER.length)} avg, ${max} max`);
writeFileSync(new URL('./roster.json', import.meta.url),
	JSON.stringify(ROSTER.map(({ id, archetype, fill, note }) => ({ id, archetype, fill, note })), null, 1));
