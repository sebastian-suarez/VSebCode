// crop.mjs — screenshot a vertical slice of a page.  node crop.mjs <html> <png> <y> <h> [w]
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { shoot } from './shot.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const [, , src, png, y, h, w = '1240'] = process.argv;
const probe = join(HERE, `crop-probe.html`);
writeFileSync(probe, `<!doctype html><body style="margin:0;background:#121314">
<div style="width:${w}px;height:${h}px;overflow:hidden;position:relative">
<iframe src="file://${src}" scrolling="no" style="position:absolute;top:${-y}px;left:0;width:${w}px;height:${+y + +h + 200}px;border:0"></iframe>
</div>`);
console.log(shoot(probe, png, +w, 2));
