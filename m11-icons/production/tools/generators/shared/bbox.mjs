import { readFileSync } from 'node:fs';
const ids=process.argv.slice(2);
for(const id of ids){
 const s=readFileSync(`/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/svg/file/${id}.svg`,'utf8');
 const nums=[];
 for(const m of s.matchAll(/ d="([^"]*)"/g)){ for(const t of m[1].match(/-?\d*\.?\d+/g)||[]) nums.push(+t); }
 for(const m of s.matchAll(/<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/g)){
   nums.push(+m[1],+m[2]); nums.push(+m[1]+ +m[3], +m[2]+ +m[4]);
 }
 const xs=nums.filter((_,i)=>i%2===0), ys=nums.filter((_,i)=>i%2===1);
 console.log(id.padEnd(26), 'x', Math.min(...xs).toFixed(2), Math.max(...xs).toFixed(2), ' y', Math.min(...ys).toFixed(2), Math.max(...ys).toFixed(2));
}
