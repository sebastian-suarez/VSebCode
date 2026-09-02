import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { EMBLEMS } from './F05-emblems.mjs';
import { shoot } from './F05-shot.mjs';
const OUT='/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/svg/folder';
const ids=Object.keys(EMBLEMS);
const inner=(f)=>readFileSync(join(OUT,f),'utf8').replace(/^[\s\S]*?<svg[^>]*>/,'').replace(/<\/svg>\s*$/,'');
const defs=ids.flatMap(i=>[`<symbol id="a-${i}" viewBox="0 0 16 16">${inner(i+'.svg')}</symbol>`,
  `<symbol id="b-${i}" viewBox="0 0 16 16">${inner(i+'-open.svg')}</symbol>`]).join('');
const u=(p,i,s)=>`<svg width=${s} height=${s}><use href="#${p}-${i}"/></svg>`;
const row=i=>`<div class=r>${u('a',i,16)}${u('b',i,16)}<span>${i}</span></div>`;
const html=`<style>body{background:#121314;color:#CCC;font:13px/1 -apple-system,sans-serif;margin:0;padding:12px}
.g{display:grid;grid-template-columns:repeat(3,1fr);gap:0 20px}
.r{display:flex;align-items:center;gap:6px;height:22px}</style>
<svg width=0 height=0 style="position:absolute"><defs>${defs}</defs></svg>
<div class=g>${ids.map(row).join('')}</div>`;
writeFileSync('/tmp/F05-16.html',html);
shoot('/tmp/F05-16.html','/tmp/F05-16.png',640);
