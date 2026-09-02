import { readFileSync, writeFileSync } from 'node:fs';
let r = readFileSync('roster.mjs', 'utf8');
r = r.replace("	csharp: ['nunjucks', 'phalcon'], clojure: ['nunjucks', 'phalcon'],\n	deno: ['nunjucks', 'phalcon'], django: ['nunjucks', 'phalcon'],\n	protobuf: ['nunjucks', 'phalcon'], playwright: ['phalcon'], vue: ['phalcon'],",
	"	csharp: ['nunjucks'], clojure: ['nunjucks'], deno: ['nunjucks'], django: ['nunjucks'],");
r = r.replace("	mdx: ['odin'], eslint: ['odin'], kotlin: ['odin'], wasm: ['odin'],\n	supabase: ['phalcon']",
	"	mdx: ['odin'], eslint: ['odin'], kotlin: ['odin'], wasm: ['odin']");
writeFileSync('roster.mjs', r);
console.log('ok');
