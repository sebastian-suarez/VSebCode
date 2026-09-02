import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { homedir } from 'node:os';
const ROOT='/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production';
const ids = process.argv.slice(2);
function chromium(){const cache=join(homedir(),'Library/Caches/ms-playwright');
 for(const b of readdirSync(cache).filter(d=>/^chromium-\d+$/.test(d)).sort((a,b)=>+b.split('-')[1]-+a.split('-')[1])){
  const m=join(cache,b,'chrome-mac-arm64');
  for(const app of readdirSync(m).filter(f=>f.endsWith('.app'))){const bin=join(m,app,'Contents/MacOS',app.replace(/\.app$/,''));if(existsSync(bin))return bin;}}
 throw new Error('no chromium');}
const inner=id=>readFileSync(join(ROOT,'svg/folder',id+'.svg'),'utf8').replace(/^[\s\S]*?<svg[^>]*>/,'').replace(/<\/svg>\s*$/,'');
const cells=ids.map(id=>`<div class="c"><svg viewBox="0 0 16 16" width="150" height="150">${inner(id)}</svg><svg viewBox="0 0 16 16" width="150" height="150">${inner(id+'-open')}</svg><div class="l">${id}</div></div>`).join('');
writeFileSync('F04-zoom.html',`<meta charset="utf-8"><style>body{background:#121314;color:#aeb4bd;font:13px sans-serif;margin:10px}.g{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.c{border:1px solid #24272c;padding:4px;text-align:center}</style><div class="g">${cells}</div>`);
execFileSync(chromium(),['--headless','--disable-gpu','--no-sandbox','--hide-scrollbars','--allow-file-access-from-files','--virtual-time-budget=6000','--default-background-color=121314ff','--window-size=1000,1400','--screenshot=F04-zoom.png','file://'+process.cwd()+'/F04-zoom.html'],{stdio:['ignore','ignore','ignore']});
console.log('ok');
