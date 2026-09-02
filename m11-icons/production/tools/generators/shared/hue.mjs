const hex2hsl = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let h = 0;
  if (d) {
    if (mx === r) h = 60 * (((g - b) / d) % 6);
    else if (mx === g) h = 60 * ((b - r) / d + 2);
    else h = 60 * ((r - g) / d + 4);
  }
  if (h < 0) h += 360;
  const l = (mx + mn) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
};
// id, archetype, hex   (archetype: B badge, S silhouette, G glyph)
const batch1 = [
  ['typescript','B','#3178C6'],['css','S','#1572B6'],['markdown','G','#519ABA'],['npm','B','#CB3837'],
  ['docker','S','#2E92D8'],['node','S','#5FA04E'],['sql','S','#3E9B8E'],['git','G','#E0603C'],
  ['shell','G','#79BE4A'],['image','S','#A08BCC'],['dotenv','G','#E3CB4E'],['next','S','#DADCE0'],
  ['prisma','S','#8592AD'],['lock','S','#979CA3'],['json','G','#D6C13C'],['svg','B','#DFA046'],
  ['yaml','B','#7E6086'],['rust','B','#A0523C'],['toml','B','#7E4A2E'],['sass','B','#C4708F'],
  ['js','B','#E8D44D'],['reactjs','B','#46B5D1'],['reactts','B','#46B5D1'],['html','S','#DB5430'],
];
const mine = [
  ['yarn','S','#2A8496'],['pnpm','S','#D4832F'],['bun','B','#E5D9C3'],['deno','B','#4FB88A'],
  ['webpack','G','#7FBBD8'],['rollup','S','#C43C3C'],['esbuild','S','#ADB544'],['babel','S','#A6862A'],
  ['biome','B','#6E6FCC'],['turborepo','G','#CE4038'],['nx','B','#5E6E94'],['vitest','G','#93A833'],
  ['jest','S','#B23A55'],['cypress','G','#56BFA0'],['playwright','S','#3C9E52'],['storybook','S','#D0559B'],
  ['testjs','S','#DFCA55'],['testts','S','#6FA8DB'],['stylelint','G','#9AA3A9'],['postcss','G','#D0942F'],
  ['svelte','G','#BE6329'],['angular','G','#CC3462'],['astro','S','#8E52BE'],['nuxt','S','#2CA675'],
];
const all = [...batch1.map(x=>[...x,'b1']), ...mine.map(x=>[...x,'b5'])];
console.log('--- my palette ---');
for (const [id,a,hex] of mine) { const c = hex2hsl(hex); console.log(`${id.padEnd(11)} ${a} ${hex}  h=${String(c.h).padStart(3)} s=${String(c.s).padStart(3)} l=${String(c.l).padStart(3)}`); }
const dh = (a,b) => { const d = Math.abs(a-b)%360; return d>180?360-d:d; };
console.log('\n--- same-archetype pairs that are close (h<18 AND l<14 AND s-diff<25) ---');
for (let i=0;i<all.length;i++) for (let j=i+1;j<all.length;j++) {
  const [ia,aa,ha,ba]=all[i], [ib,ab,hb,bb]=all[j];
  if (aa!==ab) continue;
  if (ba==='b1'&&bb==='b1') continue;
  const A=hex2hsl(ha), B=hex2hsl(hb);
  const H=dh(A.h,B.h), L=Math.abs(A.l-B.l), S=Math.abs(A.s-B.s);
  if (H<18 && L<14 && S<25) console.log(`  ${ia}(${ba}) vs ${ib}(${bb}) [${aa}]  dh=${H} dl=${L} ds=${S}`);
}
