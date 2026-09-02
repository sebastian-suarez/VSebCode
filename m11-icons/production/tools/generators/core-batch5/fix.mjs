import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
const OUT = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/svg/file';
const p = (fill, d, rule) => `<path fill="${fill}"${rule ? ' fill-rule="evenodd"' : ''} d="${d}"/>`;
const fixes = {
  // ball of yarn: disc with two curved wrap grooves (no crossing -> no even-odd artefact)
  yarn: p('#2A8496', 'M14.1 8C14.1 11.37 11.37 14.1 8 14.1C4.63 14.1 1.9 11.37 1.9 8C1.9 4.63 4.63 1.9 8 1.9C11.37 1.9 14.1 4.63 14.1 8ZM3.35 5.2Q7.7 2.2 12.15 5.6L12.15 6.6Q7.7 3.3 3.35 6.2ZM3.85 9.9Q8.3 12.8 12.65 10.4L12.65 11.4Q8.3 13.9 3.85 10.9Z', true),
  // scroll: sheet between two rolls
  rollup: p('#C43C3C', 'M2.9 2.8a1.3 1.3 0 0 1 1.3 1.3v7.8a1.3 1.3 0 0 1-2.6 0V4.1a1.3 1.3 0 0 1 1.3-1.3zM4.2 4.6h7.6v6.8H4.2zM13.1 2.8a1.3 1.3 0 0 1 1.3 1.3v7.8a1.3 1.3 0 0 1-2.6 0V4.1a1.3 1.3 0 0 1 1.3-1.3z'),
  // babel: the tower, four steps
  babel: p('#A6862A', 'M7.1 1.5h1.8v1.6H7.1zM5 3.8h6v2.4H5zM3.6 6.9h8.8v2.4H3.6zM2.4 10h11.2v3.6H2.4z'),
  // turborepo: boost ring
  turborepo: p('#CC333B', 'M14.2 8C14.2 11.42 11.42 14.2 8 14.2C4.58 14.2 1.8 11.42 1.8 8C1.8 4.58 4.58 1.8 8 1.8C11.42 1.8 14.2 4.58 14.2 8ZM12.3 8C12.3 10.37 10.37 12.3 8 12.3C5.63 12.3 3.7 10.37 3.7 8C3.7 5.63 5.63 3.7 8 3.7C10.37 3.7 12.3 5.63 12.3 8ZM8 5.6 11.5 9.6 10.1 10.8 8 8.4 5.9 10.8 4.5 9.6Z', true),
  // playwright: mask with angled eye slits
  playwright: p('#3C9E52', 'M2.5 4.3C2.5 3.25 3.35 2.55 4.4 2.75 5.7 3 6.9 3.15 8 3.15 9.1 3.15 10.3 3 11.6 2.75 12.65 2.55 13.5 3.25 13.5 4.3 13.5 8.9 11.1 13.8 8 13.8 4.9 13.8 2.5 8.9 2.5 4.3ZM4.4 6.3 7.1 5.9 7.1 7.6 4.4 7.2ZM11.6 6.3 8.9 5.9 8.9 7.6 11.6 7.2Z', true),
  // astro: the spire, legs open at the base
  astro: p('#8E52BE', 'M8.5 1.5C9.6 5.3 11.9 10.2 13.7 14.1H2.3C4.6 10.2 6.9 5.3 8.5 1.5ZM8.5 6.9C8.9 8.6 9.7 11.6 10.3 14.1H6.1C6.9 11.6 7.9 8.6 8.5 6.9Z', true),
  // nuxt: hollow peak, flattened so it reads as a mountain rather than a warning sign
  nuxt: p('#2CA675', 'M8 3 14.8 13.6H1.2ZM8 7 11.4 11.6H4.6Z', true)
};
for (const [id, inner] of Object.entries(fixes)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${inner}</svg>`;
  writeFileSync(join(OUT, id + '.svg'), svg);
  console.log(String(Buffer.byteLength(svg)).padStart(5) + '  ' + id);
}
