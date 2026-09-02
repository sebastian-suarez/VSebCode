import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
const OUT = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/svg/file';
const p = (fill, d, rule) => `<path fill="${fill}"${rule ? ' fill-rule="evenodd"' : ''} d="${d}"/>`;
const fixes = {
  yarn: p('#2A8496', 'M14.1 8C14.1 11.37 11.37 14.1 8 14.1C4.63 14.1 1.9 11.37 1.9 8C1.9 4.63 4.63 1.9 8 1.9C11.37 1.9 14.1 4.63 14.1 8ZM3.1 6.3Q7.4 2.4 12.5 4.9L12.5 6.15Q7.4 3.65 3.1 7.55ZM3.5 10Q7.8 6.1 12.9 8.6L12.9 9.85Q7.8 7.35 3.5 11.25Z', true),
  rollup: p('#C43C3C', 'M2.9 2.6a1.3 1.3 0 0 1 1.3 1.3v8.2a1.3 1.3 0 0 1-2.6 0V3.9a1.3 1.3 0 0 1 1.3-1.3zM4.2 3.6h7.6v8.8H4.2zM13.1 2.6a1.3 1.3 0 0 1 1.3 1.3v8.2a1.3 1.3 0 0 1-2.6 0V3.9a1.3 1.3 0 0 1 1.3-1.3z'),
  jest: p('#B23A55', 'M10.3 1.9Q12.2 6.5 11.8 11.5H4.5Q5.1 5.9 10.3 1.9ZM3.4 11.5h9.2a1.15 1.15 0 0 1 0 2.3H3.4a1.15 1.15 0 0 1 0-2.3z'),
  astro: p('#8E52BE', 'M8.5 1.5C9.6 5.3 11.9 10.2 13.7 14.1H2.3C4.6 10.2 6.9 5.3 8.5 1.5ZM8.5 8.4 10.5 14.1 6.3 14.1Z', true)
};
for (const [id, inner] of Object.entries(fixes)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${inner}</svg>`;
  writeFileSync(join(OUT, id + '.svg'), svg);
  console.log(String(Buffer.byteLength(svg)).padStart(5) + '  ' + id);
}
