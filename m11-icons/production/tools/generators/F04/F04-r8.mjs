// R8 self-check inside slice F04: pairwise form IoU of the closed emblems.
// Same idea as tools/audit.mjs — mask the emblem, normalise its bbox, score
// area IoU and dilated-outline IoU, take the smaller. Bar for non-BADGE: 0.72.
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
const jobs=EMBLEMS.map(e=>({id:e.id,base:uri('folder.svg'),icon:uri(e.id+'.svg')}));
const page=join(tmpdir(),`F04-r8-${process.pid}.html`);
writeFileSync(page,`<!doctype html><meta charset="utf-8"><pre id="o">P</pre><script>
const JOBS=${JSON.stringify(jobs)};const S=256,N=48;
const c=document.createElement('canvas');c.width=S;c.height=S;const g=c.getContext('2d',{willReadFrequently:true});
const load=u=>new Promise((r,j)=>{const i=new Image();i.onload=()=>r(i);i.onerror=j;i.src=u;});
(async()=>{const out={};
 for(const j of JOBS){const [b,k]=await Promise.all([load(j.base),load(j.icon)]);
  g.clearRect(0,0,S,S);g.drawImage(b,0,0,S,S);const B=g.getImageData(0,0,S,S).data;
  g.clearRect(0,0,S,S);g.drawImage(k,0,0,S,S);const K=g.getImageData(0,0,S,S).data;
  let x1=S,y1=S,x2=-1,y2=-1;const m=new Uint8Array(S*S);
  for(let p=0;p<S*S;p++){const o=p*4;
   const d=Math.abs(K[o]-B[o])+Math.abs(K[o+1]-B[o+1])+Math.abs(K[o+2]-B[o+2]);
   if(d>24){m[p]=1;const x=p%S,y=(p/S)|0;if(x<x1)x1=x;if(x>x2)x2=x;if(y<y1)y1=y;if(y>y2)y2=y;}}
  const w=x2-x1+1,h=y2-y1+1;const norm=new Uint8Array(N*N);
  for(let yy=0;yy<N;yy++)for(let xx=0;xx<N;xx++){
   const sx=x1+Math.floor(xx*w/N),sy=y1+Math.floor(yy*h/N);norm[yy*N+xx]=m[sy*S+sx];}
  out[j.id]=Array.from(norm);}
 document.getElementById('o').textContent='RESULT='+JSON.stringify(out);})();
</script>`);
const dom=execFileSync(chromium(),['--headless','--disable-gpu','--no-sandbox','--allow-file-access-from-files','--virtual-time-budget=60000','--dump-dom','file://'+page],{encoding:'utf8',maxBuffer:1<<28,stdio:['ignore','pipe','ignore']});
const masks=JSON.parse(/RESULT=(\{[\s\S]*?\})<\/pre>/.exec(dom)[1]);
const N=48;
const outline=m=>{const o=new Uint8Array(N*N);
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){const i=y*N+x;if(!m[i])continue;
  let edge=false;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;
   if(nx<0||ny<0||nx>=N||ny>=N||!m[ny*N+nx]){edge=true;break;}}
  if(edge)for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=x+dx,ny=y+dy;
   if(nx>=0&&ny>=0&&nx<N&&ny<N)o[ny*N+nx]=1;}}
 return o;};
const iou=(a,b)=>{let i=0,u=0;for(let p=0;p<N*N;p++){if(a[p]||b[p])u++;if(a[p]&&b[p])i++;}return u?i/u:0;};
const ids=Object.keys(masks);
const out=Object.fromEntries(ids.map(id=>[id,outline(masks[id])]));
const hits=[];
for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){
 const s=Math.min(iou(masks[ids[i]],masks[ids[j]]),iou(out[ids[i]],out[ids[j]]));
 if(s>=0.60)hits.push([s,ids[i],ids[j]]);}
hits.sort((a,b)=>b[0]-a[0]);
console.log('pairs at or above 0.60 (R8 bar for non-BADGE is 0.72):');
for(const [s,a,b] of hits)console.log(`  ${s.toFixed(3)}  ${a} / ${b}${s>=0.72?'   <-- OVER BAR':''}`);
if(!hits.length)console.log('  none');
console.log(`\n${ids.length*(ids.length-1)/2} pairs scored, ${hits.filter(h=>h[0]>=0.72).length} over the 0.72 bar`);
