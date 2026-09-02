import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { homedir } from 'node:os';
const ROOT='/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production';
const ids='yarn pnpm bun deno webpack rollup esbuild babel biome turborepo nx vitest jest cypress playwright storybook testjs testts stylelint postcss svelte angular astro nuxt'.split(' ');
const b1='typescript css markdown npm docker node sql git shell image dotenv next prisma lock json svg yaml rust toml sass js reactjs html'.split(' ');
const sym=(id)=>{const s=readFileSync(join(ROOT,'svg/file',id+'.svg'),'utf8');return `<symbol id="p-${id}" viewBox="0 0 16 16">${s.replace(/^[\s\S]*?<svg[^>]*>/,'').replace(/<\/svg>\s*$/,'')}</symbol>`;};
const cell=(id)=>`<div class="c"><svg width="72" height="72"><use href="#p-${id}"/></svg><svg width="16" height="16"><use href="#p-${id}"/></svg><b>${id}</b></div>`;
const html=`<style>body{margin:0;background:#121314;font:11px ui-monospace,Menlo,monospace;color:#8A9092}
.g{display:grid;grid-template-columns:repeat(8,1fr);gap:14px;padding:16px}
.c{display:flex;flex-direction:column;align-items:center;gap:6px}
h3{color:#D7D9DA;font:12px ui-monospace;margin:14px 16px 0}</style>
<svg width="0" height="0" style="position:absolute"><defs>${[...ids,...b1].map(sym).join('')}</defs></svg>
<h3>batch 5 (ranks 97-120)</h3><div class="g">${ids.map(cell).join('')}</div>
<h3>batch 1 (for calibration)</h3><div class="g">${b1.map(cell).join('')}</div>`;
const out=join('${B5}','review.html');
writeFileSync(process.argv[2],html);
