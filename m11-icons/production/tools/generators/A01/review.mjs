// review.mjs — compact blown-up 16 px proof sheet (own builder; shared tools untouched).
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { proof } from '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/tools/pixelproof.mjs';
import { ICONS } from './build-A01.mjs';

const DIR = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/svg/file';
const from = +(process.argv[2] ?? 0), to = +(process.argv[3] ?? ICONS.length);
const slice = ICONS.slice(from, to);
const entries = slice.map(i => ({ label: i.id, src: readFileSync(join(DIR, `${i.id}.svg`), 'utf8') }));
const r = await proof(entries);
const S = 6;
const cells = slice.map(i => {
	const px = r.get(i.id).px;
	let rects = '';
	for (let y = 0; y < 16; y++) {
		for (let x = 0; x < 16; x++) {
			const p = px[y * 16 + x];
			if (p.a < 0.02) { continue; }
			rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="rgb(${Math.round(p.r)},${Math.round(p.g)},${Math.round(p.b)})"/>`;
		}
	}
	return `<figure><svg width="${16 * S}" height="${16 * S}" viewBox="0 0 16 16" shape-rendering="crispEdges">` +
		`<rect width="16" height="16" fill="#121314"/>${rects}</svg><figcaption>${i.id}</figcaption></figure>`;
}).join('');
writeFileSync(join(import.meta.dirname, 'a01-review.html'),
	`<title>A01 proof</title><style>body{margin:0;background:#0C0D0E;padding:16px;font:11px/1.4 ui-monospace,Menlo,monospace;color:#8A9092}
.g{display:grid;grid-template-columns:repeat(8,${16 * S}px);gap:14px 16px}
figure{margin:0;text-align:center}figcaption{margin-top:5px;word-break:break-all}</style><div class="g">${cells}</div>`);
console.log('a01-review.html', slice.length);
