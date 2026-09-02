import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { homedir } from 'node:os';
import { EMBLEMS } from './F01-emblems.mjs';
const FOLDER='/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/svg/folder';
const inner=f=>readFileSync(join(FOLDER,f),'utf8').replace(/^[\s\S]*?<svg[^>]*>/,'').replace(/<\/svg>\s*$/,'');
const size = +(process.argv[2]||72);
const variant = process.argv[3]||'closed';
const ids=Object.keys(EMBLEMS);
const cells=ids.map(id=>{
  const f = variant==='open' ? `${id}-open.svg` : `${id}.svg`;
  return `<figure><svg width="${size}" height="${size}" viewBox="0 0 16 16">${inner(f)}</svg><figcaption>${id}</figcaption></figure>`;
}).join('');
const html=`<title>p</title><style>body{margin:0;background:#121314;color:#8A9092;font:10px/1.4 ui-monospace,Menlo,monospace;padding:14px}
.g{display:flex;flex-wrap:wrap;gap:10px}figure{margin:0;text-align:center;width:${size+14}px}figcaption{margin-top:3px;font-size:9px;word-break:break-all}</style><div class="g">${cells}</div>`;
const p='/tmp/F01-proof.html'; writeFileSync(p,html);
function chromium(){const c=join(homedir(),'Library/Caches/ms-playwright');
 for(const b of readdirSync(c).filter(d=>/^chromium-\d+$/.test(d)).sort((a,b)=>+b.split('-')[1]-+a.split('-')[1])){
  const m=join(c,b,'chrome-mac-arm64');
  for(const app of readdirSync(m).filter(f=>f.endsWith('.app'))){const bin=join(m,app,'Contents/MacOS',app.replace(/\.app$/,''));if(existsSync(bin))return bin;}}
 throw new Error('no chromium');}
const W=+(process.argv[4]||900), H=+(process.argv[5]||900);
execFileSync(chromium(),['--headless','--disable-gpu','--no-sandbox','--hide-scrollbars','--allow-file-access-from-files',
 '--virtual-time-budget=6000','--force-device-scale-factor=1','--default-background-color=121314ff',
 `--window-size=${W},${H}`,`--screenshot=/tmp/F01-proof-${variant}-${size}.png`,`file://${p}`],{stdio:'ignore'});
console.log(`/tmp/F01-proof-${variant}-${size}.png`);
