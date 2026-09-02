import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { EMBLEMS } from './F05-emblems.mjs';
import { shoot } from './F05-shot.mjs';
const OUT='/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/svg/folder';
const ids=Object.keys(EMBLEMS);
const inner=(f)=>readFileSync(join(OUT,f),'utf8').replace(/^[\s\S]*?<svg[^>]*>/,'').replace(/<\/svg>\s*$/,'');
const cell=(id,s)=>`<div class=c><svg viewBox="0 0 16 16" width=76 height=76>${inner(id+s+'.svg')}</svg><div>${id}${s}</div></div>`;
const html=`<style>body{background:#121314;color:#8A9092;font:9px ui-monospace;margin:0;padding:10px}
.g{display:grid;grid-template-columns:repeat(10,1fr);gap:6px}.c{text-align:center}</style>
<div class=g>${ids.map(i=>cell(i,'')+cell(i,'-open')).join('')}</div>`;
writeFileSync('/tmp/F05-proof.html',html);
const r=shoot('/tmp/F05-proof.html','/tmp/F05-proof.png',920);
console.log('ok',r.width,r.height);
