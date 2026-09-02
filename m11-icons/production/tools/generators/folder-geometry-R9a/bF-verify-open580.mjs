// prove the shipped open box: min Euclidean clearance box-outline <-> flap-outline
const F={topLeft:[2.42,6.5],topRight:[14.04,6.5],trC1:[14.82,6.5],trC2:[15.39,7.23],trEnd:[15.21,7.99],
 slantEnd:[14.23,11.89],brC1:[14.10,12.43],brC2:[13.62,12.80],brEnd:[13.06,12.80],
 botLeft:[2.7,12.80],blC1:[2.04,12.80],blC2:[1.5,12.26],blEnd:[1.5,11.6],
 vTop:[1.5,7.7],tlC1:[1.5,7.04],tlC2:[1.92,6.5],tlEnd:[2.42,6.5]};
const bez=(a,b,c,d,t)=>{const u=1-t;return u*u*u*a+3*u*u*t*b+3*u*t*t*c+t*t*t*d;};
const bp=(p0,p1,p2,p3,t)=>[bez(p0[0],p1[0],p2[0],p3[0],t),bez(p0[1],p1[1],p2[1],p3[1],t)];
const N=8000,O=[];
const cub=(a,b,c,d)=>{for(let i=0;i<=N;i++)O.push(bp(a,b,c,d,i/N));};
const seg=(a,b)=>{for(let i=0;i<=N;i++){const f=i/N;O.push([a[0]+f*(b[0]-a[0]),a[1]+f*(b[1]-a[1])]);}};
seg(F.topLeft,F.topRight);cub(F.topRight,F.trC1,F.trC2,F.trEnd);seg(F.trEnd,F.slantEnd);
cub(F.slantEnd,F.brC1,F.brC2,F.brEnd);seg(F.brEnd,F.botLeft);cub(F.botLeft,F.blC1,F.blC2,F.blEnd);
seg(F.blEnd,F.vTop);cub(F.vTop,F.tlC1,F.tlC2,F.tlEnd);

const ox=7.26,oy=6.75,side=5.80,rx=ox+side,by=oy+side;
const pts=[],M=3000;
for(let i=0;i<=M;i++){const f=i/M;
 pts.push([ox+f*side,oy]);pts.push([ox+f*side,by]);pts.push([rx,oy+f*side]);pts.push([ox,oy+f*side]);}
let m=Infinity,mp=null,mb=null;
for(const p of pts)for(const b of O){const d=Math.hypot(p[0]-b[0],p[1]-b[1]);if(d<m){m=d;mp=p;mb=b;}}
console.log(`OPEN box  x ${ox.toFixed(3)}–${rx.toFixed(3)}  y ${oy.toFixed(3)}–${by.toFixed(3)}  side ${side.toFixed(2)}`);
console.log(`  min Euclidean clearance to the flap outline = ${m.toFixed(4)}`);
console.log(`  binding: box(${mp[0].toFixed(3)},${mp[1].toFixed(3)}) -> flap(${mb[0].toFixed(3)},${mb[1].toFixed(3)})`);
console.log(`  top ${(oy-6.5).toFixed(2)}  bottom ${(12.8-by).toFixed(2)}  BR corner->cubic terminus (13.06,12.80) = ${Math.hypot(rx-13.06,by-12.80).toFixed(4)}`);
console.log(`  ratio vs closed 8.20 = ${(side/8.2).toFixed(4)}`);
