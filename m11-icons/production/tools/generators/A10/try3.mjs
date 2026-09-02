import { circle, capsule, arcBand, svg, poly } from './a10-lib.mjs';
import { writeFileSync } from 'node:fs';
writeFileSync('/tmp/a10-nsri.svg', svg(`<path fill="#469E38" d="${arcBand(8, 8.4, 4.6, 6.1, 152, 388)}${arcBand(8, 8.4, 2.2, 3.7, 162, 378)}${circle(8, 8.4, 1.3)}"/>`));
writeFileSync('/tmp/a10-mondoo.svg', svg(`<path fill="#6E5FD0" fill-rule="evenodd" d="${circle(8, 8, 6.5)}${circle(8, 8, 4.9, 0)}"/><path fill="#6E5FD0" d="${circle(8, 8, 1.5)}${capsule(8, 8, 11.5, 4.5, .8)}"/>`));
writeFileSync('/tmp/a10-mise.svg', svg(`<path fill="#57A76E" d="M12.3 1.8C13.3 6.5 11 10.5 6.6 12.4L3.5 9.3Z${capsule(4.9, 10.7, 2.2, 13.4, 1.15)}"/>`));
