import { readFileSync, writeFileSync } from 'node:fs';
const P='/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/svg';
const CANON={
 folder:['folder','<path fill="#BF9354" d="M1.5 4.1c0-.66.54-1.2 1.2-1.2h3.12c.34 0 .66.14.89.39l.95 1.01h5.64c.66 0 1.2.54 1.2 1.2v6.4c0 .66-.54 1.2-1.2 1.2H2.7c-.66 0-1.2-.54-1.2-1.2z"/><path fill="rgba(0,0,0,.14)" d="M1.5 5.55h13v.85h-13z"/>'],
 'folder-open':['folder','<path fill="#8F6D37" d="M1.5 4.1c0-.66.54-1.2 1.2-1.2h3.12c.34 0 .66.14.89.39l.95 1.01h4.94c.66 0 1.2.54 1.2 1.2v1h-12z"/><path fill="#C09553" d="M2.42 6.5h11.62c.78 0 1.35.73 1.17 1.49l-.98 3.9c-.13.54-.61.91-1.17.91H2.7c-.66 0-1.2-.54-1.2-1.2V7.7c0-.66.42-1.2.92-1.2z"/>'],
 typescript:['file','<rect x="1" y="1" width="14" height="14" rx="3" fill="#3178C6"/><text x="8" y="11.4" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-size="7.4" font-weight="700" fill="#FFFFFF">TS</text>'],
 css:['file','<path fill="#1572B6" d="M2.6 1.5h10.8l-.98 11L8 14.5l-4.42-2z"/><text x="8" y="10.6" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-size="7.2" font-weight="700" fill="#FFFFFF">3</text>'],
 markdown:['file','<rect x="0.75" y="3.75" width="14.5" height="8.5" rx="1.6" fill="none" stroke="#519ABA" stroke-width="1.3"/><path fill="#519ABA" d="M2.9 10.4V5.9h1.35L5.6 7.6l1.35-1.7H8.3v4.5H6.95V7.9L5.6 9.6 4.25 7.9v2.5z"/><path fill="#519ABA" d="M10.55 5.9h1.5v2.3h1.35L11.3 10.7 9.2 8.2h1.35z"/>'],
 npm:['file','<rect x="1.5" y="1.5" width="13" height="13" rx="2" fill="#CB3837"/><text x="8" y="10.4" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-size="5" font-weight="700" fill="#FFFFFF">npm</text>']
};
const pairs=Object.entries(CANON).map(([id,[kind,body]])=>{
  const prod=readFileSync(`${P}/${kind}/${id}.svg`,'utf8').replace(/^[\s\S]*?<svg[^>]*>/,'').replace(/<\/svg>\s*$/,'');
  return {id,canon:body,prod};
});
const page=`<!doctype html><meta charset=utf-8><body style="margin:0"><pre id=o>run</pre><script>
const PAIRS=${JSON.stringify(pairs)};
const uri=b=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">'+b+'</svg>');
const load=s=>new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=s;});
function px(img,S){const c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d');g.clearRect(0,0,S,S);g.drawImage(img,0,0,S,S);return g.getImageData(0,0,S,S).data;}
(async()=>{const res=[];
for(const p of PAIRS){
  const a=await load(uri(p.canon)), b=await load(uri(p.prod));
  const row={id:p.id};
  for(const S of [16,32,64]){
    const A=px(a,S),B=px(b,S);let diff=0,max=0,sum=0,ink=0;
    for(let i=0;i<A.length;i+=4){
      if(A[i+3]>8||B[i+3]>8) ink++;
      let d=0;for(let k=0;k<4;k++)d=Math.max(d,Math.abs(A[i+k]-B[i+k]));
      if(d>8)diff++; if(d>max)max=d; sum+=d;
    }
    row['s'+S]={px:S*S,ink,diff,pctOfInk:+(100*diff/Math.max(1,ink)).toFixed(1),maxDelta:max,meanDelta:+(sum/(A.length/4)).toFixed(2)};
  }
  res.push(row);
}
document.getElementById('o').textContent=JSON.stringify(res,null,1);})();
</script>`;
writeFileSync('drift.html',page);
console.log('wrote drift.html');
