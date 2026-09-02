import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const L = JSON.parse(readFileSync('/private/tmp/claude-501/-Users-sebastian-suarez-Projects-VSebCode/cd497411-6ae3-485b-8bfb-25848c779b0a/scratchpad/b5/letters.json', 'utf8'));
const OUT = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/svg/file';
const plate = (fill) => `<rect x="1" y="1" width="14" height="14" rx="3" fill="${fill}"/>`;
const p = (fill, d, rule) => `<path fill="${fill}"${rule ? ' fill-rule="evenodd"' : ''} d="${d}"/>`;

const icons = {
  // 97 yarn — ball of yarn: disc with two crossing strand cuts
  yarn: p('#2A8496', 'M14.1 8C14.1 11.37 11.37 14.1 8 14.1C4.63 14.1 1.9 11.37 1.9 8C1.9 4.63 4.63 1.9 8 1.9C11.37 1.9 14.1 4.63 14.1 8ZM3.4 4.77 13.1 10.37 12.6 11.23 2.9 5.63ZM2.9 10.37 12.6 4.77 13.1 5.63 3.4 11.23Z', true),
  // 98 pnpm — 3x3 package grid, centre open
  pnpm: p('#D4832F', 'M2.2 2.2h3.3v3.3H2.2zM6.35 2.2h3.3v3.3H6.35zM10.5 2.2h3.3v3.3h-3.3zM2.2 6.35h3.3v3.3H2.2zM10.5 6.35h3.3v3.3h-3.3zM2.2 10.5h3.3v3.3H2.2zM6.35 10.5h3.3v3.3H6.35zM10.5 10.5h3.3v3.3h-3.3z'),
  // 99 bun — cream badge, dark lowercase wordmark
  bun: plate('#E5D9C3') + p('#3B3020', L.bun),
  // 100 deno — mint badge, dark D
  deno: plate('#4FB88A') + p('#0E3527', L.deno),
  // 101 webpack — four facets of the bundle cube
  webpack: p('#7FBBD8', 'M8.45 2.45 13.55 7.55 8.45 7.55ZM8.45 13.55 13.55 8.45 8.45 8.45ZM7.55 13.55 2.45 8.45 7.55 8.45ZM7.55 2.45 2.45 7.55 7.55 7.55Z'),
  // 102 rollup — scroll: rolled tube, sheet, second roll
  rollup: p('#C43C3C', 'M3.5 3.1a2 2 0 0 1 2 2v5.8a2 2 0 0 1-4 0V5.1a2 2 0 0 1 2-2zM3.5 6.8a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 1 0 0-2.4zM5.5 6.3h6.9v3.4H5.5zM13.45 5.5a1.05 1.05 0 0 1 1.05 1.05v2.9a1.05 1.05 0 0 1-2.1 0V6.55a1.05 1.05 0 0 1 1.05-1.05z', true),
  // 103 esbuild — bundler funnel
  esbuild: p('#ADB544', 'M1.8 2.9h12.4v2L9.15 10v3.5H6.85V10L1.8 4.9z'),
  // 104 babel — the tower, stepped
  babel: p('#A6862A', 'M7.2 1.4h1.6v1.2H7.2zM5.3 3.3h5.4v2H5.3zM4.1 6h7.8v2H4.1zM3.2 8.7h9.6v2H3.2zM2.3 11.4h11.4v2.2H2.3z'),
  // 105 biome — violet badge, dark B
  biome: plate('#6E6FCC') + p('#23204D', L.biome),
  // 106 turborepo — boost ring
  turborepo: p('#CC333B', 'M14.2 8C14.2 11.42 11.42 14.2 8 14.2C4.58 14.2 1.8 11.42 1.8 8C1.8 4.58 4.58 1.8 8 1.8C11.42 1.8 14.2 4.58 14.2 8ZM12.3 8C12.3 10.37 10.37 12.3 8 12.3C5.63 12.3 3.7 10.37 3.7 8C3.7 5.63 5.63 3.7 8 3.7C10.37 3.7 12.3 5.63 12.3 8ZM8 4.8 10.4 10.2 5.6 10.2Z', true),
  // 107 nx — slate badge, NX
  nx: plate('#5E6E94') + p('#FFFFFF', L.nx),
  // 108 vitest — bolt
  vitest: p('#93A833', 'M9.9 1.6 3.5 9.3h3.7l-1.1 5.1L12.5 6.7H8.8z'),
  // 109 jest — the hat
  jest: p('#B23A55', 'M10.3 1.9Q12.2 6.6 11.8 11.7H4.5Q5.1 6 10.3 1.9ZM3.3 11.7h9.4a1 1 0 0 1 0 2H3.3a1 1 0 0 1 0-2z'),
  // 110 cypress — cy
  cypress: p('#56BFA0', L.cypress),
  // 111 playwright — theatre mask
  playwright: p('#3C9E52', 'M2.5 4.3C2.5 3.25 3.35 2.55 4.4 2.75 5.7 3 6.9 3.15 8 3.15 9.1 3.15 10.3 3 11.6 2.75 12.65 2.55 13.5 3.25 13.5 4.3 13.5 8.9 11.1 13.8 8 13.8 4.9 13.8 2.5 8.9 2.5 4.3ZM5.85 5.55a1.4 1.05 0 1 0 0 2.1 1.4 1.05 0 1 0 0-2.1zM10.15 5.55a1.4 1.05 0 1 0 0 2.1 1.4 1.05 0 1 0 0-2.1z', true),
  // 112 storybook — book with spine and tab
  storybook: p('#D0559B', 'M4.3 1.7h7.4c.72 0 1.3.58 1.3 1.3v10c0 .72-.58 1.3-1.3 1.3H4.3C3.58 14.3 3 13.72 3 13V3c0-.72.58-1.3 1.3-1.3zM5.1 3h1v10h-1zM9.4 1.7h1.6v3.3l-.8-.9-.8.9z', true),
  // 113 testjs — flask, js yellow
  testjs: p('#DFCA55', 'M6.3 1.9h3.4v1H9.2v2.6l3.7 6.6c.5.9-.1 2-1.1 2H4.2c-1 0-1.6-1.1-1.1-2l3.7-6.6V2.9H6.3z'),
  // 114 testts — flask, ts blue
  testts: p('#6FA8DB', 'M6.3 1.9h3.4v1H9.2v2.6l3.7 6.6c.5.9-.1 2-1.1 2H4.2c-1 0-1.6-1.1-1.1-2l3.7-6.6V2.9H6.3z'),
  // 115 stylelint — SL
  stylelint: p('#9AA3A9', L.stylelint),
  // 116 postcss — PC
  postcss: p('#D0942F', L.postcss),
  // 117 svelte — the ribbon S
  svelte: p('#BE6329', 'M12.17 3.69A4.6 3.8 0 1 0 8 9.1A2.4 1.6 0 1 1 5.83 11.38L3.83 12.31A4.6 3.8 0 1 0 8 6.9A2.4 1.6 0 1 1 10.18 4.62Z'),
  // 118 angular — A
  angular: p('#CC3462', L.angular),
  // 119 astro — the spire
  astro: p('#8E52BE', 'M8.5 1.5C9.6 5.3 11.9 10.2 13.7 14.1H2.3C4.6 10.2 6.9 5.3 8.5 1.5Z'),
  // 120 nuxt — hollow peak
  nuxt: p('#2CA675', 'M8 2.4 14.5 13.6H1.5ZM8 6.4 11.1 11.6H4.9Z', true)
};
let total = 0;
for (const [id, inner] of Object.entries(icons)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${inner}</svg>`;
  writeFileSync(join(OUT, id + '.svg'), svg);
  total += Buffer.byteLength(svg);
  console.log(String(Buffer.byteLength(svg)).padStart(5) + '  ' + id);
}
console.log('total', total, 'avg', Math.round(total / Object.keys(icons).length));
