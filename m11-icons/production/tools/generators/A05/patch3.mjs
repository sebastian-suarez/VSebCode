import { readFileSync, writeFileSync } from 'node:fs';
let s = readFileSync('solve.mjs', 'utf8');
s = s.replace(
	'			const localBad = () => violations().filter(p => mySet.has(p[0]) || mySet.has(p[1])).length;',
	['			const localBad = () => {',
		'				let n = 0;',
		'				for (const id of v.members) {',
		'					for (const other of OPP.get(id)) {',
		'						if (mySet.has(other) && other < id) { continue; }',
		'						const hb = mine.includes(other) ? colourOf(other) : hsl(icons.get(other).dominant);',
		'						if (isTwin(id, other, v.cur, hb)) { n++; }',
		'					}',
		'				}',
		'				return n;',
		'			};'].join('\n'));
writeFileSync('solve.mjs', s);
console.log('ok');
