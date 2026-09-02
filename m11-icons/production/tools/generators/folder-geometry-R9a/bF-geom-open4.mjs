// clearance of candidate boxRights (side 5.50, y 6.90..12.40) vs the full flap outline
const F = {
	topLeft:[2.42,6.5], topRight:[14.04,6.5], trC1:[14.82,6.5], trC2:[15.39,7.23], trEnd:[15.21,7.99],
	slantEnd:[14.23,11.89], brC1:[14.10,12.43], brC2:[13.62,12.80], brEnd:[13.06,12.80],
	botLeft:[2.7,12.80], blC1:[2.04,12.80], blC2:[1.5,12.26], blEnd:[1.5,11.6],
	vTop:[1.5,7.7], tlC1:[1.5,7.04], tlC2:[1.92,6.5], tlEnd:[2.42,6.5]
};
const bez=(a,b,c,d,t)=>{const u=1-t;return u*u*u*a+3*u*u*t*b+3*u*t*t*c+t*t*t*d;};
const bp=(p0,p1,p2,p3,t)=>[bez(p0[0],p1[0],p2[0],p3[0],t),bez(p0[1],p1[1],p2[1],p3[1],t)];
const N=8000, O=[];
const cub=(a,b,c,d)=>{for(let i=0;i<=N;i++)O.push(bp(a,b,c,d,i/N));};
const seg=(a,b)=>{for(let i=0;i<=N;i++){const f=i/N;O.push([a[0]+f*(b[0]-a[0]),a[1]+f*(b[1]-a[1])]);}};
seg(F.topLeft,F.topRight); cub(F.topRight,F.trC1,F.trC2,F.trEnd); seg(F.trEnd,F.slantEnd);
cub(F.slantEnd,F.brC1,F.brC2,F.brEnd); seg(F.brEnd,F.botLeft); cub(F.botLeft,F.blC1,F.blC2,F.blEnd);
seg(F.blEnd,F.vTop); cub(F.vTop,F.tlC1,F.tlC2,F.tlEnd);

const top=6.90, bot=12.40, side=5.50;
function report(rx,label){
	const pts=[],M=2000;
	for(let i=0;i<=M;i++){const f=i/M;
		pts.push([rx-side+f*side,top]); pts.push([rx-side+f*side,bot]);
		pts.push([rx,top+f*side]);      pts.push([rx-side,top+f*side]);}
	let m=Infinity,mp=null,mb=null;
	for(const p of pts){for(const b of O){const d=Math.hypot(p[0]-b[0],p[1]-b[1]);if(d<m){m=d;mp=p;mb=b;}}}
	console.log(`${label.padEnd(26)} right=${rx.toFixed(3)}  ox=${(rx-side).toFixed(3)}  minClear=${m.toFixed(4)}  at box(${mp[0].toFixed(2)},${mp[1].toFixed(2)}) -> flap(${mb[0].toFixed(2)},${mb[1].toFixed(2)})`);
	return m;
}
report(13.060,'strict erosion');
report(13.300,'mid');
report(13.400,'');
report(13.500,'aligned w/ closed 13.5');
report(13.564,'horizontal-only rule');
report(13.700,'too far');
console.log('');
// old box for reference
(function(){const t=7.0,b=12.2,s=5.2,rx=13.5;const pts=[],M=2000;
 for(let i=0;i<=M;i++){const f=i/M;pts.push([rx-s+f*s,t]);pts.push([rx-s+f*s,b]);pts.push([rx,t+f*s]);pts.push([rx-s,t+f*s]);}
 let m=Infinity,mp=null,mb=null;
 for(const p of pts){for(const q of O){const d=Math.hypot(p[0]-q[0],p[1]-q[1]);if(d<m){m=d;mp=p;mb=q;}}}
 console.log(`OLD box 5.20 @ x8.30..13.50 y7.0..12.2  minClear=${m.toFixed(4)} at box(${mp[0].toFixed(2)},${mp[1].toFixed(2)}) -> flap(${mb[0].toFixed(2)},${mb[1].toFixed(2)})`);})();
