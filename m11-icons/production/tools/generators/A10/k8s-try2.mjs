import { circle, ngon, svg } from './a10-lib.mjs';
import { writeFileSync } from 'node:fs';
writeFileSync('/tmp/a10-k8s-c.svg', svg(`<path fill="#3A6BC0" fill-rule="evenodd" d="${ngon(8, 8, 6.7, 7)}${ngon(8, 8, 3.4, 7)}"/><path fill="#3A6BC0" d="${circle(8, 8, 1.45)}"/>`));
