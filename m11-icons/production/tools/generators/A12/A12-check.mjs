// A12-check.mjs — report only: in-slice R7 under the §10 applied reading.
import { ALL } from './A12-build.mjs';
import { hsl } from './A12-solve-lib.mjs';
const dh=(a,b)=>{const d=Math.abs(a-b)%360;return d>180?360-d:d;};
const twin=(A,B)=>A.s>=25&&B.s>=25&&dh(A.h,B.h)<12&&Math.abs(A.l-B.l)<12&&Math.abs(A.s-B.s)<25;
const P=ALL.map(i=>{const[h,s,l]=hsl(i.fills[0]);return{id:i.id,arch:i.arch,hex:i.fills[0],h,s,l};});
let hard=0,soft=0;
for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){
  if(P[i].arch!==P[j].arch||!twin(P[i],P[j]))continue;
  if(P[i].arch==='SILHOUETTE'){soft++;console.log(`SOFT(form-qualified) ${P[i].id} ${P[i].hex} ~ ${P[j].id} ${P[j].hex}`);}
  else{hard++;console.log(`HARD ${P[i].arch} ${P[i].id} ${P[i].hex} ~ ${P[j].id} ${P[j].hex}`);}
}
console.log(`\nin-slice: hard ${hard}, soft ${soft}`);
const neutral=P.filter(p=>p.s<25).map(p=>p.id);
console.log(`neutral lane (S<25, R7-exempt): ${neutral.length} — ${neutral.join(', ')}`);
