import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EMBLEMS } from './emblems.mjs';
import { icon } from './build.mjs';
import { shoot } from './shot.mjs';
const HERE = dirname(fileURLToPath(import.meta.url));
const inner = (s) => s.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
const defs = `<svg width="0" height="0" style="position:absolute"><defs>
${EMBLEMS.map(e => `<symbol id="o-${e.id}" viewBox="0 0 16 16">${inner(icon(e, true))}</symbol>`).join('')}
</defs></svg>`;
const u = (id, s) => `<svg width="${s}" height="${s}" style="display:block"><use href="#o-${id}"/></svg>`;
writeFileSync(join(HERE, 'oc.html'), `<style>body{margin:0;background:#121314;padding:16px;font:10px ui-monospace,monospace;color:#8A9092}
.g{display:grid;grid-template-columns:repeat(10,1fr);gap:12px 8px}.c{text-align:center}
.p{display:flex;gap:6px;justify-content:center;align-items:center}</style>${defs}
<div class="g">${EMBLEMS.map(e => `<div class="c"><div class="p">${u(e.id, 96)}</div><div class="p">${u(e.id, 22)}${u(e.id, 16)}</div>${e.id}</div>`).join('')}</div>`);
console.log(shoot(join(HERE, 'oc.html'), join(HERE, 'oc.png'), 1200, 2).height);
