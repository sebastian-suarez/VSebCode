import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { homedir } from 'node:os';
import { ROSTER } from './a08-roster.mjs';
const PROD='/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production';
const which = process.argv[2] ? process.argv[2].split(',') : null;
const list = which ? ROSTER.filter(i=>which.includes(i.id)) : ROSTER;
const cells = list.map(i=>{
  const src=readFileSync(join(PROD,'svg','file',`${i.id}.svg`),'utf8');
  const inner=src.replace(/^[\s\S]*?<svg[^>]*>/,'').replace(/<\/svg>$/,'');
  return `<figure><div class=r>
   <svg width=16 height=16 viewBox="0 0 16 16">${inner}</svg>
   <svg width=32 height=32 viewBox="0 0 16 16">${inner}</svg>
   <svg width=64 height=64 viewBox="0 0 16 16">${inner}</svg></div>
   <figcaption>${i.id}</figcaption></figure>`;}).join('');
const html=`<!doctype html><meta charset=utf-8><style>
body{margin:0;background:#121314;color:#D7D9DA;font:11px/1.4 ui-monospace,Menlo,monospace;padding:20px}
.g{display:flex;flex-wrap:wrap;gap:14px}
figure{margin:0;width:150px;background:#1A1C1D;border-radius:8px;padding:10px 4px 6px;text-align:center}
.r{display:flex;align-items:center;justify-content:center;gap:10px;height:66px}
figcaption{margin-top:6px;color:#9AA0A2}</style><div class=g>${cells}</div>`;
const out=join(process.cwd(),'a08-review.html'); writeFileSync(out,html);
const cache=join(homedir(),'Library/Caches/ms-playwright');
const b=readdirSync(cache).filter(d=>/^chromium-\d+$/.test(d)).sort((a,b)=>+b.split('-')[1]-+a.split('-')[1])[0];
const macos=join(cache,b,'chrome-mac-arm64'); const app=readdirSync(macos).find(f=>f.endsWith('.app'));
const bin=join(macos,app,'Contents/MacOS',app.replace(/\.app$/,''));
const rows=Math.ceil(list.length/8); const h=rows*130+60;
execFileSync(bin,['--headless','--disable-gpu','--no-sandbox','--hide-scrollbars','--allow-file-access-from-files','--virtual-time-budget=6000','--force-device-scale-factor=2','--default-background-color=121314ff',`--window-size=1360,${h}`,`--screenshot=${join(process.cwd(),'a08-review.png')}`,`file://${out}`],{stdio:'ignore'});
console.log('a08-review.png', rows, h);
