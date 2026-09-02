import { readFileSync } from 'node:fs';
import { mask } from './F06-raster.mjs';
const DIR='/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/svg/folder';
const IDS='src test config docs node images git assets dist coverage theme types scripts hooks mock'.split(' ');
const SS=8,N=16*SS,g=Array.from({length:N},(_,k)=>(k+.5)*16/N);
const lum=(r,gg,b)=>.2126*r+.7152*gg+.0722*b, TAN=lum(0xBF,0x93,0x54);
const rows=[];
for(const id of IDS){ const o=[];
 for(const v of ['','-open']){
  const src=readFileSync(`${DIR}/${id}${v}.svg`,'utf8');
  const ps=[...src.matchAll(/<path([^>]*?)d="([^"]*)"/g)];
  const last=ps[ps.length-1];
  const rule=/evenodd/.test(last[1])?'evenodd':'nonzero';
  const m=mask([last[2]],g,g,rule);
  let solid=0,touch=0;
  for(let y=0;y<16;y++)for(let x=0;x<16;x++){let e=0;
    for(let sy=0;sy<SS;sy++)for(let sx=0;sx<SS;sx++) e+=m[(y*SS+sy)*N+x*SS+sx];
    const c=e/(SS*SS); if(c>=.75)solid++; if(c>=.25)touch++;}
  o.push([solid,touch]);
 }
 const fill=/fill="(#[0-9A-Fa-f]{6})"[^>]*\/>\s*$/.exec(readFileSync(`${DIR}/${id}.svg`,'utf8').trim());
 const f=[...readFileSync(`${DIR}/${id}.svg`,'utf8').matchAll(/fill="(#[0-9A-Fa-f]{6})"/g)].pop()[1];
 const d=Math.round(TAN-lum(parseInt(f.slice(1,3),16),parseInt(f.slice(3,5),16),parseInt(f.slice(5,7),16)));
 rows.push({id,f,d,c:o[0],o:o[1]});
}
rows.sort((a,b)=>a.o[0]-b.o[0]);
for(const r of rows) console.log(`${r.id.padEnd(15)} ${r.f}  Δ${String(r.d).padStart(3)}   closed ${String(r.c[0]).padStart(2)}/${String(r.c[1]).padStart(2)}   open ${String(r.o[0]).padStart(2)}/${String(r.o[1]).padStart(2)}`);
