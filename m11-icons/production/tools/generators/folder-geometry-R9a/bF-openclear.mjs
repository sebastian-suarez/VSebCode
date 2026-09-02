// open box as a function of the clearance, for the ratio conversation
const F={slantEnd:[14.23,11.89],brC1:[14.10,12.43],brC2:[13.62,12.80],brEnd:[13.06,12.80]};
const bez=(a,b,c,d,t)=>{const u=1-t;return u*u*u*a+3*u*u*t*b+3*u*t*t*c+t*t*t*d;};
const bp=(t)=>[bez(F.slantEnd[0],F.brC1[0],F.brC2[0],F.brEnd[0],t),bez(F.slantEnd[1],F.brC1[1],F.brC2[1],F.brEnd[1],t)];
const cur=[];for(let i=0;i<=40000;i++)cur.push(bp(i/40000));
const dist=p=>{let m=Infinity;for(const b of cur)m=Math.min(m,Math.hypot(p[0]-b[0],p[1]-b[1]));return m;};
console.log('clear  side   box y          boxRight  ox     ratio vs closed 8.20 / 8.00 / 7.80 / 7.30');
for(const c of [0.40,0.35,0.30,0.25,0.20]){
  const top=6.5+c,bot=12.8-c,side=bot-top;
  let lo=12,hi=14.1;for(let i=0;i<60;i++){const m=(lo+hi)/2;(dist([m,bot])>=c)?lo=m:hi=m;}
  const rx=lo,ox=rx-side;
  console.log(`${c.toFixed(2)}   ${side.toFixed(2)}   ${top.toFixed(2)}–${bot.toFixed(2)}    ${rx.toFixed(3)}    ${ox.toFixed(3)}  ${(side/8.2).toFixed(3)} / ${(side/8.0).toFixed(3)} / ${(side/7.8).toFixed(3)} / ${(side/7.3).toFixed(3)}`);
}
console.log('\nclosed side that would preserve R9\'s ratified 0.80x open ratio, given open max 5.50:', (5.50/0.8).toFixed(3));
