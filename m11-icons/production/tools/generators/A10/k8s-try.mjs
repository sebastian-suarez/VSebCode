import { circle, capsule, ngon, svg } from './a10-lib.mjs';
import { writeFileSync } from 'node:fs';
const sp = (r0, r1, hw) => { const a = []; for (let i = 0; i < 7; i++) { const t = (-90 + i * 360 / 7) * Math.PI / 180; a.push(capsule(8 + r0 * Math.cos(t), 8 + r0 * Math.sin(t), 8 + r1 * Math.cos(t), 8 + r1 * Math.sin(t), hw)); } return a.join(''); };
writeFileSync('/tmp/a10-k8s-a.svg', svg(`<path fill="#3A6BC0" fill-rule="evenodd" d="${ngon(8, 8, 6.7, 7)}${circle(8, 8, 2.1, 0)}${sp(1.9, 5.1, .78)}"/>`));
writeFileSync('/tmp/a10-k8s-b.svg', svg(`<path fill="#3A6BC0" fill-rule="evenodd" d="${ngon(8, 8, 6.7, 7)}${circle(8, 8, 2.6, 0)}"/>`));
