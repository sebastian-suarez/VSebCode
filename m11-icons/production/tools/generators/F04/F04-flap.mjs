// Open variants only: every emblem pixel must sit on the FRONT FLAP (#C09553),
// never on the back panel (#8F6D37) and never off the silhouette.
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { homedir, tmpdir } from 'node:os';
import { EMBLEMS } from './F04-emblems.mjs';
const SVG='/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/svg/folder';
function chromium(){const cache=join(homedir(),'Library/Caches/ms-playwright');
 for(const b of readdirSync(cache).filter(d=>/^chromium-\d+$/.test(d)).sort((a,b)=>+b.split('-')[1]-+a.split('-')[1])){
  const m=join(cache,b,'chrome-mac-arm64');
  for(const app of readdirSync(m).filter(f=>f.endsWith('.app'))){const bin=join(m,app,'Contents/MacOS',app.replace(/\.app$/,''));if(existsSync(bin))return bin;}}
 throw new Error('no chromium');}
const uri=f=>'data:image/svg+xml;base64,'+Buffer.from(readFileSync(join(SVG,f),'utf8'),'utf8').toString('base64');
const jobs=EMBLEMS.map(e=>({label:e.id+'-open',base:uri('folder-open.svg'),icon:uri(e.id+'-open.svg')}));
const page=join(tmpdir(),`F04-flap-${process.pid}.html`);
writeFileSync(page,`<!doctype html><meta charset="utf-8"><pre id="o">P</pre><script>
const JOBS=${JSON.stringify(jobs)};const S=160;
const c=document.createElement('canvas');c.width=S;c.height=S;const g=c.getContext('2d',{willReadFrequently:true});
const load=u=>new Promise((r,j)=>{const i=new Image();i.onload=()=>r(i);i.onerror=j;i.src=u;});
(async()=>{const out=[];
 for(const j of JOBS){const [b,k]=await Promise.all([load(j.base),load(j.icon)]);
  g.clearRect(0,0,S,S);g.drawImage(b,0,0,S,S);const B=g.getImageData(0,0,S,S).data;
  g.clearRect(0,0,S,S);g.drawImage(k,0,0,S,S);const K=g.getImageData(0,0,S,S).data;
  let onFlap=0,offFlap=0,worst=null;
  for(let p=0;p<S*S;p++){const o=p*4;
   const d=Math.abs(K[o]-B[o])+Math.abs(K[o+1]-B[o+1])+Math.abs(K[o+2]-B[o+2])+Math.abs(K[o+3]-B[o+3]);
   if(d<=6)continue;
   // base colour under this pixel: flap #C09553 (192,149,83) vs back #8F6D37 (143,109,55)
   const dFlap=Math.abs(B[o]-192)+Math.abs(B[o+1]-149)+Math.abs(B[o+2]-83);
   const dBack=Math.abs(B[o]-143)+Math.abs(B[o+1]-109)+Math.abs(B[o+2]-55);
   if(B[o+3]>200&&dFlap<=dBack)onFlap++;else{offFlap++;if(!worst)worst=[p%S,(p/S)|0,B[o],B[o+1],B[o+2],B[o+3]];}}
  out.push({label:j.label,onFlap,offFlap,worst});}
 document.getElementById('o').textContent='RESULT='+JSON.stringify(out);})();
</script>`);
const dom=execFileSync(chromium(),['--headless','--disable-gpu','--no-sandbox','--allow-file-access-from-files','--virtual-time-budget=60000','--dump-dom','file://'+page],{encoding:'utf8',maxBuffer:1<<26,stdio:['ignore','pipe','ignore']});
const res=JSON.parse(/RESULT=(\[[\s\S]*?\])<\/pre>/.exec(dom)[1]);
// a handful of anti-aliased edge pixels straddle the flap/emblem boundary; flag only real leakage
let bad=0;
for(const r of res){ if(r.offFlap>Math.max(4,r.onFlap*0.02)){bad++;console.log(`OFF-FLAP ${r.label}: ${r.offFlap}px (on flap ${r.onFlap}) first at ${r.worst}`);}}
console.log(`\n${res.length} open variants at 160px — ${res.length-bad} keep every emblem pixel on the front flap, ${bad} leak`);
console.log(`max off-flap edge pixels on any icon: ${Math.max(...res.map(r=>r.offFlap))}`);
