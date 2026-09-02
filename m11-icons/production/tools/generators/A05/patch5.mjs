import { readFileSync, writeFileSync } from 'node:fs';
let r = readFileSync('roster.mjs', 'utf8');
r = r.replace("	nginx: ['nunjucks'], cpp: ['odin'], go: ['phalcon'],",
	"	nginx: ['nunjucks', 'phalcon'], cpp: ['odin'], go: ['phalcon'],");
r = r.replace("	csharp: ['nunjucks'], clojure: ['nunjucks'], deno: ['nunjucks'], django: ['nunjucks'],",
	"	csharp: ['nunjucks', 'phalcon'], clojure: ['nunjucks', 'phalcon'],\n	deno: ['nunjucks', 'phalcon'], django: ['nunjucks', 'phalcon'],\n	protobuf: ['nunjucks', 'phalcon'], playwright: ['phalcon'], vue: ['phalcon'],");
r = r.replace("	django: ['phalcon'], deno: ['phalcon'], supabase: ['phalcon']", "	supabase: ['phalcon']");
writeFileSync('roster.mjs', r);
console.log('ok');
