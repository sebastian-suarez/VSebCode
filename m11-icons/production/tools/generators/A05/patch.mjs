import { readFileSync, writeFileSync } from 'node:fs';
let r = readFileSync('roster.mjs', 'utf8');
r = r.replace("	nginx: ['nunjucks'], cpp: ['odin'], go: ['phalcon']",
	["	nginx: ['nunjucks'], cpp: ['odin'], go: ['phalcon'],",
		"	csharp: ['nunjucks'], clojure: ['nunjucks'], deno: ['nunjucks'], django: ['nunjucks'],",
		"	mdx: ['odin'], eslint: ['odin'], kotlin: ['odin'], wasm: ['odin']"].join('\n'));
r = r.replace("	sqlite: ['plsql', 'pgsql', 'paket'],", "	sqlite: ['plsql', 'pgsql', 'paket', 'phalcon'],");
writeFileSync('roster.mjs', r);
console.log('ok');
