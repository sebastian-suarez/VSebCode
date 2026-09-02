// a07-build.mjs — write the A07 slice SVGs into production/svg/file/.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ICONS } from './a07-icons.mjs';
import { svg } from './a07-lib.mjs';

const ROOT = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production';
const worklist = JSON.parse(readFileSync(join(ROOT, 'longtail-worklist.json'), 'utf8'));
const slice = worklist.slices.find(s => s.id === 'A07');
const want = slice.concepts.map(c => c.id);

const have = ICONS.map(i => i.id);
const missing = want.filter(id => !have.includes(id));
const extra = have.filter(id => !want.includes(id));
const dupes = have.filter((id, i) => have.indexOf(id) !== i);
if (missing.length || extra.length || dupes.length) {
	console.log('MISSING:', missing.join(' '));
	console.log('EXTRA  :', extra.join(' '));
	console.log('DUPES  :', dupes.join(' '));
	process.exit(1);
}

let total = 0, max = 0, maxId = '';
for (const ic of ICONS) {
	const src = svg(ic.body);
	const bytes = Buffer.byteLength(src);
	total += bytes;
	if (bytes > max) { max = bytes; maxId = ic.id; }
	writeFileSync(join(ROOT, 'svg', 'file', `${ic.id}.svg`), src, 'utf8');
}
console.log(`${ICONS.length} icons written — ${total} B total, ${Math.round(total / ICONS.length)} B avg, max ${max} B (${maxId})`);
const byArch = {};
for (const i of ICONS) { byArch[i.archetype] = (byArch[i.archetype] || 0) + 1; }
console.log('archetypes:', JSON.stringify(byArch));
