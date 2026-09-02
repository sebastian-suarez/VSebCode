import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { EMBLEMS } from './F02-emblems.mjs';

const d = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/svg/folder';
const inner = (s) => s.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').trim();
const B = {
	closed: inner(readFileSync(join(d, 'folder.svg'), 'utf8')),
	open: inner(readFileSync(join(d, 'folder-open.svg'), 'utf8'))
};
let bad = 0, n = 0;
for (const id of Object.keys(EMBLEMS)) {
	for (const v of ['closed', 'open']) {
		const f = join(d, v === 'open' ? `${id}-open.svg` : `${id}.svg`);
		const body = inner(readFileSync(f, 'utf8'));
		if (!body.startsWith(B[v])) { console.log('BASE DRIFT', f); bad++; }
		if (!/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 16 16">/.test(readFileSync(f, 'utf8'))) {
			console.log('HEADER DRIFT', f); bad++;
		}
		n++;
	}
}
console.log(`${n} files checked, ${bad} with drift`);
console.log(`canon closed base: ${Buffer.byteLength(B.closed)} B, open: ${Buffer.byteLength(B.open)} B`);
