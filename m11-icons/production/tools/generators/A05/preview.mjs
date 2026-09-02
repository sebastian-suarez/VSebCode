// preview.mjs — compact review sheets: big geometry grid, and a small-size grid.
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EMBLEMS } from './emblems.mjs';
import { icon, BASE_CLOSED, BASE_OPEN } from './build.mjs';
import { shoot } from './shot.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const inner = (s) => s.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');

const items = EMBLEMS.map(e => ({
	id: e.id, desc: e.desc,
	closed: inner(icon(e, false)), open: inner(icon(e, true))
}));

const defs = `<svg width="0" height="0" style="position:absolute"><defs>
${items.map(i => `<symbol id="c-${i.id}" viewBox="0 0 16 16">${i.closed}</symbol><symbol id="o-${i.id}" viewBox="0 0 16 16">${i.open}</symbol>`).join('\n')}
<symbol id="c-folder" viewBox="0 0 16 16">${BASE_CLOSED}</symbol>
<symbol id="o-folder" viewBox="0 0 16 16">${BASE_OPEN}</symbol>
</defs></svg>`;
const use = (p, id, s) => `<svg width="${s}" height="${s}" style="display:block"><use href="#${p}-${id}"/></svg>`;

const CSS = `body{margin:0;background:#121314;color:#D7D9DA;font:12px/1.4 -apple-system,sans-serif;padding:20px}
.grid{display:grid;gap:14px 10px}
.cell{text-align:center}
.pair{display:flex;gap:6px;justify-content:center;align-items:flex-end}
.nm{font:10px/1.3 ui-monospace,monospace;color:#9AA0A6;margin-top:5px}
.ds{font:9px/1.2 ui-monospace,monospace;color:#63696D}
h2{font:11px/1 ui-monospace,monospace;letter-spacing:.1em;color:#8A9092;margin:0 0 14px}`;

function sheet(size, cols, file, width) {
	const cells = items.map(i => `<div class="cell"><div class="pair">${use('c', i.id, size)}${use('o', i.id, size)}</div>
<div class="nm">${i.id}</div><div class="ds">${i.desc}</div></div>`).join('');
	writeFileSync(join(HERE, file + '.html'),
		`<title>${file}</title><style>${CSS}.grid{grid-template-columns:repeat(${cols},1fr)}</style>${defs}
<h2>closed + open @ ${size}px</h2><div class="grid">${cells}</div>`, 'utf8');
	const r = shoot(join(HERE, file + '.html'), join(HERE, file + '.png'), width, 2);
	console.log(file, r.width + 'x' + r.height);
}

sheet(64, 5, 'p64', 760);
sheet(22, 10, 'p22', 700);

// 16 px tree, mixed with batch-1 file icons
const tree = items.map(i => `<div class="r">${use('c', i.id, 16)}<span>${i.id}</span></div>`).join('');
writeFileSync(join(HERE, 'p16.html'),
	`<title>p16</title><style>${CSS}
.cols{display:flex;gap:20px}
.tree{background:#1E1E1E;padding:6px 0;border-radius:6px;width:150px}
.r{display:flex;align-items:center;gap:6px;height:22px;padding:0 10px}
.r span{font:13px/1 -apple-system,sans-serif;color:#CCC}
.r svg{flex:none}</style>${defs}
<h2>16 px in a 22 px row</h2>
<div class="cols">
 <div class="tree">${items.slice(0, 14).map(i => `<div class="r">${use('c', i.id, 16)}<span>${i.id}</span></div>`).join('')}</div>
 <div class="tree">${items.slice(14, 27).map(i => `<div class="r">${use('c', i.id, 16)}<span>${i.id}</span></div>`).join('')}</div>
 <div class="tree">${items.slice(27).map(i => `<div class="r">${use('c', i.id, 16)}<span>${i.id}</span></div>`).join('')}</div>
 <div class="tree">${items.slice(0, 14).map(i => `<div class="r">${use('o', i.id, 16)}<span>${i.id}</span></div>`).join('')}</div>
 <div class="tree">${items.slice(14, 27).map(i => `<div class="r">${use('o', i.id, 16)}<span>${i.id}</span></div>`).join('')}</div>
 <div class="tree">${items.slice(27).map(i => `<div class="r">${use('o', i.id, 16)}<span>${i.id}</span></div>`).join('')}</div>
</div>`, 'utf8');
console.log('p16', shoot(join(HERE, 'p16.html'), join(HERE, 'p16.png'), 1100, 3).height);
