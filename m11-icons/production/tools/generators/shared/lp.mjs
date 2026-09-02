import { letterPath } from '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/tools/letterpath.mjs';
const jobs = JSON.parse(process.argv[2]);
for (const j of jobs) {
  const r = letterPath(j);
  const i = r.ink;
  console.log(`${j.tag}  size=${r.fontSize} bl=${r.baseline} ink ${i.x1},${i.y1} -> ${i.x2},${i.y2}  w=${i.w} h=${i.h}`);
  console.log(`  d="${r.d}"`);
}
