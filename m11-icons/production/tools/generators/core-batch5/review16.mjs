import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const ROOT='/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production';
const mine='yarn pnpm bun deno webpack rollup esbuild babel biome turborepo nx vitest jest cypress playwright storybook testjs testts stylelint postcss svelte angular astro nuxt'.split(' ');
const labels={yarn:'yarn.lock',pnpm:'pnpm-lock.yaml',bun:'bun.lockb',deno:'deno.json',webpack:'webpack.config.js',rollup:'rollup.config.mjs',esbuild:'esbuild.config.js',babel:'.babelrc',biome:'biome.json',turborepo:'turbo.json',nx:'nx.json',vitest:'vitest.config.ts',jest:'jest.config.js',cypress:'cypress.config.ts',playwright:'playwright.config.ts',storybook:'Button.stories.tsx',testjs:'app.test.js',testts:'app.test.ts',stylelint:'.stylelintrc',postcss:'postcss.config.js',svelte:'App.svelte',angular:'angular.json',astro:'index.astro',nuxt:'nuxt.config.ts'};
const b1='typescript css markdown npm docker node sql git shell image dotenv next prisma lock json svg yaml rust toml sass js reactjs html'.split(' ');
const sym=(id)=>{const s=readFileSync(join(ROOT,'svg/file',id+'.svg'),'utf8');return `<symbol id="p-${id}" viewBox="0 0 16 16">${s.replace(/^[\s\S]*?<svg[^>]*>/,'').replace(/<\/svg>\s*$/,'')}</symbol>`;};
const row=(id)=>`<div class="r"><svg width="16" height="16"><use href="#p-${id}"/></svg><span>${labels[id]||id}</span></div>`;
const cell=(id)=>`<div class="c"><svg width="32" height="32"><use href="#p-${id}"/></svg><b>${id}</b></div>`;
const html=`<style>body{margin:0;background:#121314;font:11px ui-monospace,Menlo,monospace;color:#8A9092;display:flex;gap:30px;padding:16px}
.r{display:flex;align-items:center;gap:7px;height:22px;padding:0 10px}
.r span{font:13px -apple-system,sans-serif;color:#CCC}
.g{display:grid;grid-template-columns:repeat(6,1fr);gap:12px;align-content:start}
.c{display:flex;flex-direction:column;align-items:center;gap:4px}</style>
<svg width="0" height="0" style="position:absolute"><defs>${[...mine,...b1].map(sym).join('')}</defs></svg>
<div>${mine.map(row).join('')}</div>
<div class="g">${mine.map(cell).join('')}</div>
<div>${b1.map(id=>`<div class="r"><svg width="16" height="16"><use href="#p-${id}"/></svg><span>${id}</span></div>`).join('')}</div>`;
writeFileSync(process.argv[2],html);
