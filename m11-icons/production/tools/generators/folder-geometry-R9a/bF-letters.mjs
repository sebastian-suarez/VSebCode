import { emit } from './geom.mjs';
import { EMBLEMS } from './emblems.mjs';
import { readFileSync } from 'node:fs';
const SH='/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/svg/folder';
const OPTS={old:{k:.65,ox:7,oy:5.6},E:{k:.82,ox:5.3,oy:3.9},A:{k:.82,ox:5.3,oy:4.6},B:{k:.80,ox:5.5,oy:4.7},C:{k:.78,ox:5.7,oy:4.3},D:{k:.73,ox:6.2,oy:4.8}};
console.log('--- letterpath emblems re-bake at the new cap height ---');
for(const id of ['types','fonts','next']){
  const e=EMBLEMS.find(x=>x.id===id);
  const shipped=/ d="([^"]*)"\/><\/svg>/.exec(readFileSync(`${SH}/${id}.svg`,'utf8'))[1];
  for(const [n,T] of Object.entries(OPTS)){
    const d=emit(e.d(),T);
    const cmds=(d.match(/[A-Za-z]/g)||[]).length;
    const nums=(d.match(/-?[\d.]+/g)||[]).map(Number);
    const bad=nums.some(v=>!isFinite(v));
    console.log(`  ${id.padEnd(6)} ${n.padEnd(4)} cap*k=${(id==='types'?8.6:id==='fonts'?8.8:5.6)*T.k.toFixed(4)} len=${String(d.length).padStart(4)} cmds=${String(cmds).padStart(3)} ${bad?'NaN!':'ok'} ${n==='old'?(d===shipped?'== shipped':'!! DRIFT'):''}`);
  }
}
console.log('\n--- brand hues survive (fills are constants, not transformed) ---');
for(const id of ['github','next','docker','node','git','vscode']){
  const e=EMBLEMS.find(x=>x.id===id);
  const shipped=readFileSync(`${SH}/${id}.svg`,'utf8');
  const shipHex=/<path fill="(#[0-9A-Fa-f]{6})"[^>]*d="[^"]*"\/><\/svg>/.exec(shipped)[1];
  console.log(`  ${id.padEnd(8)} emblems.mjs ${e.color}  shipped ${shipHex}  ${e.color.toLowerCase()===shipHex.toLowerCase()?'MATCH':'DIFFER'}`);
}
