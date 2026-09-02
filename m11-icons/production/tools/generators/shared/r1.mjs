import { readFileSync, writeFileSync } from 'node:fs';
const P = 'set-manifest.json';
const j = JSON.parse(readFileSync(P, 'utf8'));
const R1 = { assembly:['#4F9E7E','#468B6F'], audio:['#C06E9E','#C77FA9'], biome:['#6E6FCC','#A5A3E8'],
  cert:['#C79A4A','#93A0AE'], clojure:['#55AD6E','#6BB881'], cmake:['#3D71B5','#2F588E'],
  cpp:['#37648E','#325B81'], csharp:['#3E8F4A','#3D8F44'], diff:['#5FA894','#95C6B9'],
  django:['#43885F','#408263'], dotenv:['#E3CB4E','#E7DF6E'], erlang:['#B8455F','#CD7A8D'],
  git:['#E0603C','#8C3017'], haskell:['#8E80C6','#948AC9'], http:['#6E93B4','#89A3C2'],
  jenkins:['#C0554A','#7E241A'], jupyter:['#D97A3C','#E3A772'], maven:['#A93F4A','#86323A'],
  mdx:['#7B68CE','#633EC1'], objectivec:['#A85596','#7C8CA6'], perl:['#5E6DB4','#49599C'],
  powershell:['#6478C8','#6A95D2'], tex:['#3FA6A6','#59C0C0'], todo:['#C9A241','#8F7228'],
  toml:['#7E4A2E','#6B3E26'], zig:['#D89238','#E3C172'] };
const M1 = { font: 'bare A -> Aa', 'generic-font': 'bare A -> Aa', todo: 'bare check -> checkbox + tick' };
let n = 0;
for (const i of j.icons) {
	if (i.kind !== 'file') { continue; }
	const c = R1[i.id], m = M1[i.id];
	if (!c && !m) { continue; }
	i.round1 = { kind: c && m ? 'retint + mark' : c ? 'retint' : 'mark',
		...(c ? { from: c[0], to: c[1] } : {}), ...(m ? { mark: m } : {}) };
	n++;
}
writeFileSync(P, JSON.stringify(j, null, '\t') + '\n');
console.log(n, 'round-1 records written');
