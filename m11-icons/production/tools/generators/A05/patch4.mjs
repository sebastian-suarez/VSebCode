import { readFileSync, writeFileSync } from 'node:fs';
let s = readFileSync('solve.mjs', 'utf8');
s = s.replace("		const bothBadge = icons.get(id).archetype === 'BADGE';", '		const bothBadge = false;');
writeFileSync('solve.mjs', s);
let r = readFileSync('roster.mjs', 'utf8');
r = r.replace("	mdx: ['odin'], eslint: ['odin'], kotlin: ['odin'], wasm: ['odin']",
	"	mdx: ['odin'], eslint: ['odin'], kotlin: ['odin'], wasm: ['odin'],\n	django: ['phalcon'], deno: ['phalcon'], supabase: ['phalcon']");
writeFileSync('roster.mjs', r);
console.log('ok');
