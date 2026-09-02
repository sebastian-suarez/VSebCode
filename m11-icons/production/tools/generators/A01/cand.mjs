import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { proof } from '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/tools/pixelproof.mjs';
import { poly, circ, rrect, rbar, bar, svg, path } from './a01-lib.mjs';
const C = [
 ['bat-curve','#8E7FB8','M8 3.2C6.9 3.2 6.2 4.1 6.2 5.2L1.5 4.4Q3.9 7.2 2.2 10.4L6.3 9.4 8 12.6 9.7 9.4 13.8 10.4Q12.1 7.2 14.5 4.4L9.8 5.2C9.8 4.1 9.1 3.2 8 3.2Z',false],
 ['bat-wide','#8E7FB8','M8 4C7 4 6.4 4.8 6.4 5.8L1.4 4.6Q4.2 7.6 2.4 11.2L6.4 9.8 8 13 9.6 9.8 13.6 11.2Q11.8 7.6 14.6 4.6L9.6 5.8C9.6 4.8 9 4 8 4Z',false],
 ['check',   '#8E7FB8', poly([[2.2,8.2],[4.4,6.1],[6.6,8.3],[11.7,3.2],[13.9,5.4],[6.6,12.7]]),false],
 ['screw',   '#A0906A', circ(8,4.4,4)+rrect(5.2,3.7,5.6,1.4,.2,true)+poly([[6.2,7.6],[9.8,7.6],[8.7,13.9],[7.3,13.9]]),false],
 ['screw2',  '#A0906A', circ(8,4.6,4)+rrect(5.2,3.9,5.6,1.4,.2,true)+poly([[6.1,7.9],[9.9,7.9],[9.9,12.2],[8,14.2],[6.1,12.2]]),false],
 ['nut',     '#A0906A', poly([[4.6,2],[11.4,2],[14,8],[11.4,14],[4.6,14],[2,8]])+circ(8,8,3,true),false]
];
const entries = C.map(([id,hex,d,eo])=>({label:id, src: svg(path(hex,d,eo))}));
const r = await proof(entries);
const S=6;
const cells = entries.map(e=>{const px=r.get(e.label).px;let rects='';
 for(let y=0;y<16;y++)for(let x=0;x<16;x++){const p=px[y*16+x];if(p.a<0.02)continue;
  rects+=`<rect x="${x}" y="${y}" width="1" height="1" fill="rgb(${Math.round(p.r)},${Math.round(p.g)},${Math.round(p.b)})"/>`;}
 return `<figure><svg width="${16*S}" height="${16*S}" viewBox="0 0 16 16" shape-rendering="crispEdges"><rect width="16" height="16" fill="#121314"/>${rects}</svg><figcaption>${e.label}</figcaption></figure>`;}).join('');
writeFileSync(join(import.meta.dirname,'cand.html'),`<style>body{margin:0;background:#0C0D0E;padding:16px;font:11px ui-monospace,Menlo;color:#8A9092}.g{display:grid;grid-template-columns:repeat(6,96px);gap:14px 16px}figure{margin:0;text-align:center}figcaption{margin-top:5px}</style><div class="g">${cells}</div>`);
