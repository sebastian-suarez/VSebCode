import { readFileSync, writeFileSync } from 'node:fs';
let s = readFileSync('solve.mjs', 'utf8');
s = s.replace(/const ANCHOR = \{[^}]*\};/, "const ANCHOR = { odin: '#4A42A0', phalcon: '#3E949E' };");
writeFileSync('solve.mjs', s);
console.log('ok');
