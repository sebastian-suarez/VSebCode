import { readFileSync, writeFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { homedir, tmpdir } from 'node:os';
const ROOT='/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production';
const SCR='/private/tmp/claude-501/-Users-sebastian-suarez-Projects-VSebCode/cd497411-6ae3-485b-8bfb-25848c779b0a/scratchpad';
const IDS=process.argv[2].split(',');
const SIZE=+(process.argv[3]||64);
const OUTNAME=process.argv[4]||'review';
const cells=IDS.map(id=>{
  const src=readFileSync(join(ROOT,'svg','file',id+'.svg'),'utf8');
  const inner=src.replace(/^[\s\S]*?<svg[^>]*>/,'').replace(/<\/svg>\s*$/,'');
  return {id,inner};
});
const html=`<title>r</title><style>body{margin:0;background:#121314;font:11px ui-monospace,Menlo,monospace;color:#8A9092}
.g{display:flex;flex-wrap:wrap;gap:10px;padding:14px}
.c{width:${Math.max(SIZE+24,86)}px;text-align:center}
.c svg{display:block;margin:0 auto 5px}
</style><div class="g">${cells.map(c=>`<div class="c"><svg width="${SIZE}" height="${SIZE}" viewBox="0 0 16 16">${c.inner}</svg><span>${c.id}</span></div>`).join('')}</div>`;
const f=join(SCR,OUTNAME+'.html'); writeFileSync(f,html);
function chromium(){const cache=join(homedir(),'Library/Caches/ms-playwright');
 for(const b of readdirSync(cache).filter(d=>/^chromium-\d+$/.test(d)).sort((a,b)=>+b.split('-')[1]-+a.split('-')[1])){
  const m=join(cache,b,'chrome-mac-arm64');
  for(const app of readdirSync(m).filter(x=>x.endsWith('.app'))){const bin=join(m,app,'Contents/MacOS',app.replace(/\.app$/,''));if(existsSync(bin))return bin;}}
 throw new Error('no chromium');}
const bin=chromium();
const W=+(process.argv[5]||900);
const COMMON=['--headless','--disable-gpu','--no-sandbox','--hide-scrollbars','--allow-file-access-from-files','--virtual-time-budget=6000'];
const probe=join(tmpdir(),`rp-${process.pid}.html`);
writeFileSync(probe,`<!doctype html><body style="margin:0"><pre id="o"></pre><iframe id="f" src="file://${f}" style="width:${W}px;height:400px;border:0"></iframe><script>f.onload=()=>{document.getElementById('o').textContent='H='+f.contentDocument.documentElement.scrollHeight}</script>`);
const dom=execFileSync(bin,[...COMMON,`--window-size=${W+200},600`,'--dump-dom',`file://${probe}`],{encoding:'utf8',stdio:['ignore','pipe','ignore']});
rmSync(probe,{force:true});
const h=/H=(\d+)/.exec(dom)[1];
const png=join(SCR,OUTNAME+'.png');
execFileSync(bin,[...COMMON,'--force-device-scale-factor=2','--default-background-color=121314ff',`--window-size=${W},${h}`,`--screenshot=${png}`,`file://${f}`],{stdio:'ignore'});
console.log(png,W,h);
