import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
const P='/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/svg';
const items=[];
for(const kind of ['file','folder']) for(const f of readdirSync(`${P}/${kind}`).sort()){
  const src=readFileSync(`${P}/${kind}/${f}`,'utf8');
  items.push({id:f.replace(/\.svg$/,''),kind,inner:src.replace(/^[\s\S]*?<svg[^>]*>/,'').replace(/<\/svg>\s*$/,'')});
}
writeFileSync('bbox.html',`<!doctype html><meta charset=utf-8><body style="margin:0"><pre id=o></pre>
<svg id="stage" width="16" height="16" viewBox="0 0 16 16">${items.map((i,n)=>`<g id="g${n}">${i.inner}</g>`).join('')}</svg>
<script>const I=${JSON.stringify(items.map(i=>i.id))};const out=I.map((id,n)=>{const b=document.getElementById('g'+n).getBBox();
return {id,x1:+b.x.toFixed(2),y1:+b.y.toFixed(2),x2:+(b.x+b.width).toFixed(2),y2:+(b.y+b.height).toFixed(2),w:+b.width.toFixed(2),h:+b.height.toFixed(2)};});
document.getElementById('o').textContent=JSON.stringify(out);</script>`);
