const hsl = (hex) => {
  const nn = parseInt(hex.slice(1), 16);
  const r = ((nn >> 16) & 255) / 255, g = ((nn >> 8) & 255) / 255, b = (nn & 255) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let h = 0;
  if (d) { if (mx === r) h = 60 * (((g - b) / d) % 6); else if (mx === g) h = 60 * ((b - r) / d + 2); else h = 60 * ((r - g) / d + 4); }
  if (h < 0) h += 360;
  const l = (mx + mn) / 2, s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
};
const set = [
  ['b1','typescript','BADGE','#3178C6'],['b1','react','BADGE','#46B5D1'],['b1','js','BADGE','#E8D44D'],
  ['b1','sass','BADGE','#C4708F'],['b1','rust','BADGE','#A0523C'],['b1','toml','BADGE','#7E4A2E'],
  ['b1','yaml','BADGE','#7E6086'],['b1','npm','BADGE','#CB3837'],['b1','svg','BADGE','#DFA046'],
  ['b1','css','SIL','#1572B6'],['b1','html','SIL','#DB5430'],['b1','docker','SIL','#2E92D8'],
  ['b1','prisma','SIL','#8592AD'],['b1','next','SIL','#DADCE0'],['b1','node','SIL','#5FA04E'],
  ['b1','lock','SIL','#979CA3'],['b1','sql','SIL','#3E9B8E'],['b1','image','SIL','#A08BCC'],
  ['b1','markdown','GLYPH','#519ABA'],['b1','dotenv','GLYPH','#E3CB4E'],['b1','git','GLYPH','#E0603C'],
  ['b1','shell','GLYPH','#79BE4A'],['b1','json','GLYPH','#D6C13C'],
  ['B3','elixir','SIL','#9A5FAD'],['B3','scala','SIL','#C93A4A'],['B3','lua','SIL','#6C6ACB'],
  ['B3','nim','SIL','#C6C24C'],['B3','ocaml','SIL','#CC9038'],['B3','excel','SIL','#2F8F55'],
  ['B3','julia·red','SIL','#C4534C'],['B3','julia·grn','SIL','#529A46'],['B3','julia·vio','SIL','#9968C4'],
  ['B3','perl','BADGE','#5E6DB4'],['B3','clojure','BADGE','#55AD6E'],['B3','objectivec','BADGE','#A85596'],
  ['B3','wasm','BADGE','#866ED6'],['B3','cheader','BADGE','#A6ACB4'],['B3','cppheader','BADGE','#6F7982'],
  ['B3','protobuf','BADGE','#8CA24A'],['B3','sqlite','BADGE','#35897E'],
  ['B3','haskell','GLYPH','#8E80C6'],['B3','zig','GLYPH','#D89238'],['B3','erlang','GLYPH','#B8455F'],
  ['B3','fsharp','GLYPH','#35A0A0'],['B3','assembly','GLYPH','#4F9E7E'],['B3','solidity','GLYPH','#B2B0AC'],
  ['B3','graphql','GLYPH','#C43E93'],['B3','json5','GLYPH','#D6C13C'],['B3','r','GLYPH','#3D6EC8'],
];
const rows = set.map(([b,id,a,hex]) => ({ b,id,a,hex, ...hsl(hex) }));
for (const arch of ['BADGE','SIL','GLYPH']) {
  console.log('\n=== ' + arch + ' (sorted by hue; gap = to previous)');
  const g = rows.filter(r => r.a === arch).sort((x,y)=>x.h-y.h);
  g.forEach((r,i) => {
    const prev = g[(i-1+g.length)%g.length];
    let d = Math.abs(r.h - prev.h); if (d > 180) d = 360 - d;
    console.log(`  ${String(r.h).padStart(3)}°  S${String(r.s).padStart(3)} L${String(r.l).padStart(3)}  ${r.hex}  ${r.b.padEnd(3)} ${r.id.padEnd(11)} gap ${d}`);
  });
}
