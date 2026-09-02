// build.mjs — emit slice A02 SVGs into production/svg/file/
import { writeFileSync, readFileSync } from 'node:fs';
import { ICONS } from './icons.mjs';

const PROD = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production';
const work = JSON.parse(readFileSync(`${PROD}/longtail-worklist.json`, 'utf8'));
const slice = work.slices.find(s => s.id === 'A02');
const want = slice.concepts.map(c => c.id);

const have = ICONS.map(i => i.id);
const missing = want.filter(i => !have.includes(i));
const extra = have.filter(i => !want.includes(i));
if (missing.length) { console.log('MISSING:', missing.join(', ')); }
if (extra.length) { console.log('EXTRA  :', extra.join(', ')); }
console.log(`roster ${have.length} / worklist ${want.length}`);
const dupes = have.filter((x, i) => have.indexOf(x) !== i);
if (dupes.length) { console.log('DUPES  :', dupes.join(', ')); }

if (process.argv.includes('--check')) { process.exit(missing.length || extra.length ? 1 : 0); }

let bytes = 0, max = 0, maxId = '';
for (const ic of ICONS) {
	const src = ic.svg(ic.fill);
	const b = Buffer.byteLength(src);
	bytes += b; if (b > max) { max = b; maxId = ic.id; }
	writeFileSync(`${PROD}/svg/file/${ic.id}.svg`, src);
}
const by = {};
for (const i of ICONS) { by[i.archetype] = (by[i.archetype] || 0) + 1; }
console.log('wrote', ICONS.length, 'icons —', JSON.stringify(by));
console.log(`bytes: ${bytes} total, ${Math.round(bytes / ICONS.length)} avg, ${max} max (${maxId})`);
