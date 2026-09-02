import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { homedir } from 'node:os';
const ROOT = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production';
const ids = ['class','key','cmake'];
const cells = ids.map(id => {
  const src = readFileSync(join(ROOT,'svg/file',id+'.svg'),'utf8');
  const inner = src.replace(/^[\s\S]*?<svg[^>]*>/,'').replace(/<\/svg>\s*$/,'');
  return `<div class=c><svg viewBox="0 0 16 16" width="96" height="96">${inner}</svg>
  <svg viewBox="0 0 16 16" width="32" height="32">${inner}</svg>
  <svg viewBox="0 0 16 16" width="16" height="16">${inner}</svg><div>${id}</div></div>`;
}).join('\n');
const html = `<style>body{margin:0;background:#121314;color:#8A9092;font:11px ui-monospace,monospace}
.g{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:10px}
.c{display:flex;flex-direction:column;align-items:center;gap:4px;padding:6px;background:#151617}
</style><div class=g>${cells}</div>`;
writeFileSync('/private/tmp/claude-501/-Users-sebastian-suarez-Projects-VSebCode/cd497411-6ae3-485b-8bfb-25848c779b0a/scratchpad/grid.html', html);
const cache = join(homedir(),'Library/Caches/ms-playwright');
const b = readdirSync(cache).filter(d=>/^chromium-\d+$/.test(d)).sort((a,b)=>+b.split('-')[1]-+a.split('-')[1])[0];
const macos = join(cache,b,'chrome-mac-arm64');
const app = readdirSync(macos).find(f=>f.endsWith('.app'));
const bin = join(macos,app,'Contents/MacOS',app.replace(/\.app$/,''));
execFileSync(bin,['--headless','--disable-gpu','--no-sandbox','--hide-scrollbars','--allow-file-access-from-files','--virtual-time-budget=5000','--window-size=620,600','--default-background-color=121314ff','--screenshot=/private/tmp/claude-501/-Users-sebastian-suarez-Projects-VSebCode/cd497411-6ae3-485b-8bfb-25848c779b0a/scratchpad/grid.png','file:///private/tmp/claude-501/-Users-sebastian-suarez-Projects-VSebCode/cd497411-6ae3-485b-8bfb-25848c779b0a/scratchpad/grid.html'],{stdio:'ignore'});
console.log('ok');
