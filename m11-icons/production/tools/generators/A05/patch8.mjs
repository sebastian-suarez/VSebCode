import { readFileSync, writeFileSync } from 'node:fs';
let r = readFileSync('roster.mjs', 'utf8');
r = r.replace("django: ['nunjucks'],", "django: ['nunjucks', 'phalcon'],");
writeFileSync('roster.mjs', r);
console.log('ok');
