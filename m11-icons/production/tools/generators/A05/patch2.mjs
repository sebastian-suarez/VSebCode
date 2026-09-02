import { readFileSync, writeFileSync } from 'node:fs';
let s = readFileSync('solve.mjs', 'utf8');
s = s.replace('		if (!mineToo && !dom && !ALL_CORE_HARD) { continue; }',
	['		// A BADGE is nothing but a plate, so hue IS the read (§6). Against core badges the',
		'		// bar is hard even cross-domain; GLYPH / SILHOUETTE keep the §11.3 scope.',
		'		const bothBadge = icons.get(id).archetype === \'BADGE\';',
		'		if (!mineToo && !dom && !bothBadge) { continue; }'].join('\n'));
writeFileSync('solve.mjs', s);
console.log('ok');
