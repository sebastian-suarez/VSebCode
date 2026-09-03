#!/usr/bin/env node
// inspect.mjs — look at raw source artwork side by side, big and at 16 px, before
// deciding what L5 forces. Working tool; nothing in the pilot depends on it.
//
//   node tools/inspect.mjs [out.png]

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import * as si from 'simple-icons';

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, '..', 'sources-svg');
const png = process.argv[2] || '/tmp/inspect.png';

const rd = (f) => readFileSync(join(SRC, f), 'utf8')
	.replace(/<\?xml[^>]*\?>/, '').replace(/<!--[\s\S]*?-->/g, '')
	.replace(/\s(?:width|height)="[^"]*"/g, '');
const sisvg = (slug, c) => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">'
	+ `<path fill="${c}" d="${si['si' + slug[0].toUpperCase() + slug.slice(1)].path}"/></svg>`;

const ITEMS = [
	['npm · own n.svg', rd('npm-official-n.svg')],
	['npm · simple-icons', sisvg('npm', '#CB3837')],
	['dotenv · own', rd('dotenv-official.svg')],
	['dotenv · simple-icons', sisvg('dotenv', '#ECD53F')],
	['yaml · simple-icons', sisvg('yaml', '#CB171E')],
	['git · own', rd('git-official.svg')],
	['git · simple-icons', sisvg('git', '#F05032')],
	['go · own', rd('go-official.svg')],
	['vue · own', rd('vue-official.svg')],
	['vue · simple-icons', sisvg('vuedotjs', '#41B883')]
];

const at = (s, px) => s.replace(/<svg /, `<svg width="${px}" height="${px}" `);
let html = `<!doctype html><meta charset="utf-8"><style>
body{background:#121314;color:#c9d1d9;font:12px system-ui;margin:0;padding:16px}
.c{display:inline-block;text-align:center;margin:7px;background:#1e2124;padding:9px;border-radius:8px;width:170px}
.c svg{display:block;margin:0 auto}
.t{display:flex;gap:6px;justify-content:center;align-items:center;margin-top:7px}
.n{margin-top:7px;color:#8b949e;font-size:11px}
</style><body>`;
for (const [n, s] of ITEMS) {
	html += `<div class="c">${at(s, 140)}<div class="t">${at(s, 16)}${at(s, 22)}${at(s, 32)}</div>`
		+ `<div class="n">${n}</div></div>`;
}
writeFileSync('/tmp/.inspect.html', html + '</body>');
execFileSync('node', [join(HERE, 'shot.mjs'), '/tmp/.inspect.html', png, '1120', '760', '2']);
console.log(`wrote ${png}`);
