// A12-build.mjs — emit slice A12 into production/svg/file/ and report.
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { svg } from './A12-lib.mjs';
import { ICONS_1 } from './A12-icons-1.mjs';
import { ICONS_2 } from './A12-icons-2.mjs';
import { ICONS_3 } from './A12-icons-3.mjs';

const OUT = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/svg/file';
export const ALL = [...ICONS_1, ...ICONS_2, ...ICONS_3];

const seen = new Set();
for (const i of ALL) {
	if (seen.has(i.id)) { throw new Error('duplicate id ' + i.id); }
	seen.add(i.id);
}

if (process.argv.includes('--write')) {
	mkdirSync(OUT, { recursive: true });
	let total = 0, max = 0, maxId = '';
	for (const i of ALL) {
		const src = svg(i.body);
		const b = Buffer.byteLength(src);
		total += b; if (b > max) { max = b; maxId = i.id; }
		writeFileSync(join(OUT, `${i.id}.svg`), src, 'utf8');
	}
	console.log(`${ALL.length} icons written; ${total} B total, ${Math.round(total / ALL.length)} B avg, max ${max} B (${maxId})`);
	const arch = {};
	for (const i of ALL) { arch[i.arch] = (arch[i.arch] || 0) + 1; }
	console.log('archetypes:', JSON.stringify(arch));
	const over = ALL.map(i => [i.id, Buffer.byteLength(svg(i.body))]).filter(([, b]) => b > 2048);
	if (over.length) { console.log('over 2 KB target:', over.map(([id, b]) => `${id} ${b}`).join(', ')); }
}
