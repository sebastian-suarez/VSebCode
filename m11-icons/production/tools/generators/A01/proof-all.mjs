// proof-all.mjs — 16 px numbers for every A01 icon; grids only for the ids given.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { proof } from '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/tools/pixelproof.mjs';
import { ICONS } from './build-A01.mjs';

const DIR = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/svg/file';
const show = new Set(process.argv.slice(2));
const entries = ICONS.map(i => ({ label: i.id, src: readFileSync(join(DIR, `${i.id}.svg`), 'utf8') }));
const r = await proof(entries);
const rows = entries.map(e => ({ id: e.label, ...r.get(e.label) }));
rows.sort((a, b) => (b.faint / (b.ink || 1)) - (a.faint / (a.ink || 1)));
for (const x of rows) {
	console.log(`${x.id.padEnd(22)} ink ${String(x.ink).padStart(3)}  faint ${String(x.faint).padStart(3)}` +
		` (${String(Math.round(x.faint / (x.ink || 1) * 100)).padStart(3)}%)  peak ${x.peak.toFixed(2)}`);
}
for (const id of show) {
	const p = r.get(id);
	if (!p) { continue; }
	console.log(`\n${id}\n    +----------------+`);
	p.grid.forEach((row, i) => console.log(`${String(i).padStart(3)} |${row}|`));
	console.log('    +----------------+');
}
