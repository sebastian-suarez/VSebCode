import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { EMBLEMS } from './emblems.mjs';
import { icon, CLOSED, OPEN } from './bF-apply.mjs';
const SH='/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/svg/folder';
let same=0,diff=[];
for(const e of EMBLEMS) for(const open of [false,true]){
  const n=`${e.id}${open?'-open':''}.svg`;
  (readFileSync(join(SH,n),'utf8')===icon(e,open,CLOSED.A))?same++:diff.push(n);
}
console.log(`shipped == generated at (closed A ${CLOSED.A.side}, open ${OPEN.side}): ${same}/80`, diff.length?'DIFF '+diff.join(' '):'');
// sample the actual emblem extents on disk
const ext=(n)=>{const d=/ d="([^"]*)"\/><\/svg>/.exec(readFileSync(join(SH,n),'utf8'))[1];
  const nums=[...d.matchAll(/-?\d*\.?\d+/g)].map(m=>+m[0]);
  const ys=[];for(let i=1;i<nums.length;i+=2)ys.push(nums[i]);
  return `y ${Math.min(...ys).toFixed(2)}–${Math.max(...ys).toFixed(2)}`;};
console.log('  node.svg      emblem', ext('node.svg'), ' (box y 4.60–12.80, folder body top 4.30)');
console.log('  node-open.svg emblem', ext('node-open.svg'),' (box y 6.75–12.55, flap 6.50–12.80)');
