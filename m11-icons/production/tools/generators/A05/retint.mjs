// retint.mjs — apply hues.json (the R7 solution) to the slice SVGs.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/svg/file';
const hues = JSON.parse(readFileSync('./hues.json', 'utf8'));
const cache = JSON.parse(readFileSync('./formcache.json', 'utf8'));
const dom = new Map(cache.icons.map(i => [i.id, i.dominant]));

let n = 0;
for (const [id, next] of Object.entries(hues)) {
	const prev = dom.get(id);
	if (!prev || prev === next) { continue; }
	const f = join(DIR, `${id}.svg`);
	const src = readFileSync(f, 'utf8');
	const out = src.replaceAll(prev, next);
	if (out === src) { console.log(`!! ${id}: ${prev} not found`); continue; }
	writeFileSync(f, out, 'utf8');
	console.log(`${id.padEnd(22)} ${prev} -> ${next}`);
	n++;
}
console.log(`${n} retinted`);
