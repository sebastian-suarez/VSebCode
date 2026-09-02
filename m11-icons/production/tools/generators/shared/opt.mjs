import { writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { letterPath } from '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/tools/letterpath.mjs';

const CHROME = process.env.HOME + '/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

const CASES = {
  typescript: {
    plate: '<rect x="1" y="1" width="14" height="14" rx="3" fill="#3178C6"/>',
    canonText: '<text x="8" y="11.4" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-size="7.4" font-weight="700" fill="#FFFFFF">TS</text>',
    text: 'TS', mode: 'cap', base: 5.214, cx: 7.859, baseline: 11.4
  },
  css: {
    plate: '<path fill="#1572B6" d="M2.6 1.5h10.8l-.98 11L8 14.5l-4.42-2z"/>',
    canonText: '<text x="8" y="10.6" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-size="7.2" font-weight="700" fill="#FFFFFF">3</text>',
    text: '3', mode: 'cap', base: 5.073, cx: 7.883, baseline: 10.6
  },
  npm: {
    plate: '<rect x="1.5" y="1.5" width="13" height="13" rx="2" fill="#CB3837"/>',
    canonText: '<text x="8" y="10.4" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-size="5" font-weight="700" fill="#FFFFFF">npm</text>',
    text: 'npm', mode: 'xheight', base: 2.72, cx: 7.906, baseline: 10.4
  }
};

const range = (a, b, s) => { const o = []; for (let v = a; v <= b + 1e-9; v += s) { o.push(+v.toFixed(3)); } return o; };

function build(c, size, ls, dx, dy) {
  const o = { text: c.text, cx: c.cx + dx, baseline: c.baseline + dy, letterSpacing: ls, precision: 2 };
  if (c.mode === 'cap') { o.cap = size; } else { o.xheight = size; }
  return letterPath(o).d;
}

function run(jobs) {
  const page = `<!doctype html><meta charset=utf-8><body style="margin:0"><pre id=o>run</pre><script>
const JOBS=${JSON.stringify(jobs)};
const uri=b=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">'+b+'</svg>');
const load=s=>new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=s;});
const cv=document.createElement('canvas');cv.width=cv.height=16;const g=cv.getContext('2d');
async function px(b){const im=await load(uri(b));g.clearRect(0,0,16,16);g.drawImage(im,0,0,16,16);return g.getImageData(0,0,16,16).data;}
(async()=>{const out=[];
 const refs={};
 for(const j of JOBS){ if(!refs[j.id]) refs[j.id]=await px(j.plate+j.canonText); }
 for(const j of JOBS){
   const A=refs[j.id], B=await px(j.plate+'<path fill="'+j.fill+'" d="'+j.d+'"/>');
   let diff=0,sum=0;
   for(let i=0;i<A.length;i+=4){let d=0;for(let k=0;k<4;k++)d=Math.max(d,Math.abs(A[i+k]-B[i+k]));if(d>8)diff++;sum+=d;}
   out.push({id:j.id,size:j.size,ls:j.ls,dx:j.dx,dy:j.dy,diff,sum:+(sum/256).toFixed(3)});
 }
 document.getElementById('o').textContent=JSON.stringify(out);})();
</script>`;
  writeFileSync('opt.html', page);
  const dom = execFileSync(CHROME, ['--headless', '--disable-gpu', '--no-sandbox', '--allow-file-access-from-files',
    '--virtual-time-budget=120000', '--dump-dom', 'file://' + process.cwd() + '/opt.html'],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1 << 28 });
  const m = /<pre id="o">([\s\S]*?)<\/pre>/.exec(dom);
  return JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
}

const stage = (id, sizes, lss, dxs, dys) => {
  const c = CASES[id];
  const jobs = [];
  for (const size of sizes) for (const ls of lss) for (const dx of dxs) for (const dy of dys) {
    jobs.push({ id, plate: c.plate, canonText: c.canonText, fill: '#FFFFFF', size, ls, dx, dy, d: build(c, size, ls, dx, dy) });
  }
  const res = run(jobs).sort((a, b) => a.diff - b.diff || a.sum - b.sum);
  return res;
};

for (const id of Object.keys(CASES)) {
  const c = CASES[id];
  let r1 = stage(id, range(c.base * 0.92, c.base * 1.10, c.base * 0.02), range(-0.02, 0.10, 0.02), [0], [0]);
  const b1 = r1[0];
  let r2 = stage(id, range(b1.size - c.base * 0.02, b1.size + c.base * 0.02, c.base * 0.01),
    range(b1.ls - 0.02, b1.ls + 0.02, 0.01), range(-0.2, 0.2, 0.1), range(-0.2, 0.2, 0.1));
  const b2 = r2[0];
  const baseline = r1.find(x => Math.abs(x.size - c.base) < 1e-6 && x.ls === 0);
  console.log(id, '| as-shipped(diff,sum):', baseline ? `${baseline.diff},${baseline.sum}` : 'n/a',
    '| stage1 best:', JSON.stringify(b1), '| stage2 best:', JSON.stringify(b2));
}
