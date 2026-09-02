// scratch: render candidate emblem paths straight onto the canon bases
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { homedir } from 'node:os';
import { BOX, mapOps, serialize, bbox } from './F04-geom.mjs';
const ROOT='/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/svg/folder';
function chromium(){const cache=join(homedir(),'Library/Caches/ms-playwright');
 for(const b of readdirSync(cache).filter(d=>/^chromium-\d+$/.test(d)).sort((a,b)=>+b.split('-')[1]-+a.split('-')[1])){
  const m=join(cache,b,'chrome-mac-arm64');
  for(const app of readdirSync(m).filter(f=>f.endsWith('.app'))){const bin=join(m,app,'Contents/MacOS',app.replace(/\.app$/,''));if(existsSync(bin))return bin;}}
 throw new Error('no chromium');}
const closed=readFileSync(join(ROOT,'folder.svg'),'utf8').trim().slice(0,-6);
const open=readFileSync(join(ROOT,'folder-open.svg'),'utf8').trim().slice(0,-6);
export function show(cands, png='F04-try.png'){
  const cells=cands.map(c=>{
    const b=bbox(c.ops);
    const fr=c.rule?` fill-rule="${c.rule}"`:'';
    const mk=(base,v)=>`${base}<path fill="${c.fill||'#4E545B'}"${fr} d="${serialize(mapOps(c.ops,BOX[v].s,BOX[v].tx,BOX[v].ty))}"/></svg>`;
    const bad = b.x1<-0.02||b.y1<-0.02||b.x2>10.02||b.y2>10.02 ? ' SPILL' : '';
    return `<div class="c">${[[mk(closed,'closed'),150],[mk(open,'open'),150],[mk(closed,'closed'),32],[mk(open,'open'),32],[mk(closed,'closed'),16],[mk(open,'open'),16]]
      .map(([s,w])=>s.replace('<svg ',`<svg width="${w}" height="${w}" `)).join('')}<div class="l">${c.name} [${b.x1.toFixed(1)},${b.y1.toFixed(1)} → ${b.x2.toFixed(1)},${b.y2.toFixed(1)}]${bad}</div></div>`;
  }).join('');
  writeFileSync('F04-try.html',`<meta charset="utf-8"><style>body{background:#121314;color:#aeb4bd;font:13px sans-serif;margin:10px}.g{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.c{border:1px solid #24272c;padding:4px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}</style><div class="g">${cells}</div>`);
  execFileSync(chromium(),['--headless','--disable-gpu','--no-sandbox','--hide-scrollbars','--allow-file-access-from-files','--virtual-time-budget=6000','--default-background-color=121314ff','--window-size=1000,1200',`--screenshot=${png}`,'file://'+process.cwd()+'/F04-try.html'],{stdio:['ignore','ignore','ignore']});
  console.log('ok '+png);
}
