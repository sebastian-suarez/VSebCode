import { writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { letterPath } from '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/tools/letterpath.mjs';
const CHROME = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const CASES = {
  typescript: { plate:'<rect x="1" y="1" width="14" height="14" rx="3" fill="#3178C6"/>',
    canonText:'<text x="8" y="11.4" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-size="7.4" font-weight="700" fill="#FFFFFF">TS</text>',
    text:'TS', mode:'cap', cx:7.859, baseline:11.4,
    cands:[['C width-match',5.214,0.065,0,0],['C dy-.1',5.214,0.065,0,-0.1],['C dy+.1',5.214,0.065,0,0.1],['C dx-.1',5.214,0.065,-0.1,0],['C cap5.28',5.28,0.052,0,0],['C ls.075',5.214,0.075,0,0]] },
  css: { plate:'<path fill="#1572B6" d="M2.6 1.5h10.8l-.98 11L8 14.5l-4.42-2z"/>',
    canonText:'<text x="8" y="10.6" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-size="7.2" font-weight="700" fill="#FFFFFF">3</text>',
    text:'3', mode:'cap', cx:7.883, baseline:10.6,
    cands:[['A canon-cap',5.073,0,0,0],['A dy-.1',5.073,0,0,-0.1],['A dy+.1',5.073,0,0,0.1],['A dx-.1',5.073,0,-0.1,0],['A cap5.12',5.12,0,0,0]] },
  npm: { plate:'<rect x="1.5" y="1.5" width="13" height="13" rx="2" fill="#CB3837"/>',
    canonText:'<text x="8" y="10.4" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-size="5" font-weight="700" fill="#FFFFFF">npm</text>',
    text:'npm', mode:'xheight', cx:7.906, baseline:10.4,
    cands:[['C ls.049',2.72,0.049,0,0],['C ls.058',2.72,0.058,0,0],['C ls.068',2.72,0.068,0,0],['C ls.058 dy-.1',2.72,0.058,0,-0.1],['C ls.058 dy+.1',2.72,0.058,0,0.1],['C xh2.76',2.76,0.05,0,0]] }
};
const jobs=[];
for(const [id,c] of Object.entries(CASES)) for(const [name,size,ls,dx,dy] of c.cands){
  const o={text:c.text,cx:c.cx+dx,baseline:c.baseline+dy,letterSpacing:ls,precision:2};
  if(c.mode==='cap')o.cap=size;else o.xheight=size;
  const r=letterPath(o);
  jobs.push({id,name,size,ls,dx,dy,plate:c.plate,canonText:c.canonText,d:r.d,inkW:r.ink.w,inkH:r.ink.h});
}
const page=`<!doctype html><meta charset=utf-8><body style="margin:0"><pre id=o>run</pre><script>
const JOBS=${JSON.stringify(jobs)};
const uri=(b,S)=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="'+S+'" height="'+S+'">'+b+'</svg>');
const load=s=>new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=s;});
async function px(b,S){const im=await load(uri(b,S));const c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d');g.drawImage(im,0,0,S,S);return g.getImageData(0,0,S,S).data;}
(async()=>{const out=[];const refs={};
for(const j of JOBS){for(const S of [16,32,64]){const k=j.id+'@'+S;if(!refs[k])refs[k]=await px(j.plate+j.canonText,S);}}
for(const j of JOBS){const row={id:j.id,name:j.name,size:j.size,ls:j.ls,dx:j.dx,dy:j.dy,inkW:j.inkW,inkH:j.inkH};
 for(const S of [16,32,64]){const A=refs[j.id+'@'+S],B=await px(j.plate+'<path fill="#FFFFFF" d="'+j.d+'"/>',S);
  let diff=0,sum=0;for(let i=0;i<A.length;i+=4){let d=0;for(let k=0;k<4;k++)d=Math.max(d,Math.abs(A[i+k]-B[i+k]));if(d>8)diff++;sum+=d;}
  row['d'+S]=diff;row['m'+S]=+(sum/(A.length/4)).toFixed(2);}
 out.push(row);}
document.getElementById('o').textContent=JSON.stringify(out);})();
</script>`;
writeFileSync('eval.html',page);
const dom=execFileSync(CHROME,['--headless','--disable-gpu','--no-sandbox','--allow-file-access-from-files','--virtual-time-budget=60000','--dump-dom','file://'+process.cwd()+'/eval.html'],{encoding:'utf8',stdio:['ignore','pipe','ignore'],maxBuffer:1<<28});
const rows=JSON.parse(/<pre id="o">([\s\S]*?)<\/pre>/.exec(dom)[1].replace(/&quot;/g,'"').replace(/&amp;/g,'&'));
console.log('id          cand           size    ls     dx    dy   inkW  inkH  d16  m16    d32  m32    d64  m64');
for(const r of rows) console.log(
 r.id.padEnd(11), r.name.padEnd(14), String(r.size).padEnd(7), String(r.ls).padEnd(6), String(r.dx).padEnd(5), String(r.dy).padEnd(4),
 String(r.inkW).padEnd(5), String(r.inkH).padEnd(5), String(r.d16).padStart(3), String(r.m16).padStart(6),
 String(r.d32).padStart(5), String(r.m32).padStart(6), String(r.d64).padStart(5), String(r.m64).padStart(6));
