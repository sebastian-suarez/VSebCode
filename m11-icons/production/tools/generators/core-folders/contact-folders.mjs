// contact-folders.mjs — production/contact-folders.html (+ .png at 2x).
// Same shape and styling as tools/contact.mjs, but for the folder batch:
// closed+open pairs at 16 / 22 tree row / 32 / 64, an explorer strip that mixes
// the folders with batch-1 file icons, and a footer manifest.

import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { EMBLEMS } from './emblems.mjs';
import { shoot } from './shot.mjs';

const ROOT = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inner = (s) => s.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');

// the folder name each concept actually matches in core-tier.json, for the tree row
const TREE_NAME = {
	src: 'src', node: 'node_modules', dist: 'dist', test: 'tests', docs: 'docs',
	assets: 'assets', images: 'images', components: 'components', config: 'config',
	git: '.git', github: '.github', vscode: '.vscode', public: 'public',
	scripts: 'scripts', types: 'types', hooks: 'hooks', utils: 'utils',
	library: 'lib', api: 'api', styles: 'styles', app: 'app', view: 'views',
	server: 'server', db: 'database', route: 'routes', layout: 'layouts',
	model: 'models', middleware: 'middleware', services: 'services', next: '.next',
	docker: 'docker', coverage: 'coverage', i18n: 'i18n', fonts: 'fonts',
	template: 'templates', theme: 'themes', log: 'logs', temp: '.tmp',
	mock: '__mocks__', package: 'packages'
};

function load(kind, id) {
	const f = join(ROOT, 'svg', kind, `${id}.svg`);
	if (!existsSync(f)) { throw new Error(`missing ${f}`); }
	const src = readFileSync(f, 'utf8');
	return { inner: inner(src), bytes: Buffer.byteLength(src) };
}

const icons = EMBLEMS.map(e => {
	const c = load('folder', e.id);
	const o = load('folder', `${e.id}-open`);
	return { ...e, closed: c, open: o, name: TREE_NAME[e.id] || e.id, bytes: c.bytes + o.bytes };
});
const base = { closed: load('folder', 'folder'), open: load('folder', 'folder-open') };

// batch-1 file icons used in the explorer strips
const FILES = ['typescript', 'reactts', 'sass', 'json', 'markdown', 'dotenv', 'git',
	'docker', 'lock', 'yaml', 'shell', 'css'].filter(id => existsSync(join(ROOT, 'svg/file', `${id}.svg`)));
const files = Object.fromEntries(FILES.map(id => [id, load('file', id)]));

const defs = `<svg width="0" height="0" aria-hidden="true" style="position:absolute"><defs>
${icons.map(i => `<symbol id="f-${i.id}" viewBox="0 0 16 16">${i.closed.inner}</symbol>
<symbol id="fo-${i.id}" viewBox="0 0 16 16">${i.open.inner}</symbol>`).join('\n')}
<symbol id="f-folder" viewBox="0 0 16 16">${base.closed.inner}</symbol>
<symbol id="fo-folder" viewBox="0 0 16 16">${base.open.inner}</symbol>
${FILES.map(id => `<symbol id="x-${id}" viewBox="0 0 16 16">${files[id].inner}</symbol>`).join('\n')}
</defs></svg>`;

const use = (pfx, id, s, alt = '') =>
	`<svg class="ico" width="${s}" height="${s}" role="img" aria-label="${esc(alt)}"><use href="#${pfx}-${id}"/></svg>`;
const row = (pfx, id, label, depth = 0) =>
	`<span class="trow" style="padding-left:${8 + depth * 12}px">${use(pfx, id, 16)}<span>${esc(label)}</span></span>`;

const LADDER = icons.map(i => `
  <tr>
    <th scope="row"><span class="nm">${esc(i.id)}</span><span class="arch">${esc(i.desc)}</span></th>
    <td>${use('f', i.id, 16, `${i.id} 16px`)}</td>
    <td class="pair">${use('fo', i.id, 16, `${i.id} open 16px`)}</td>
    <td class="rowcell g">${row('f', i.id, i.name)}</td>
    <td class="rowcell">${row('fo', i.id, i.name)}</td>
    <td class="g">${use('f', i.id, 32, `${i.id} 32px`)}</td>
    <td class="pair">${use('fo', i.id, 32, `${i.id} open 32px`)}</td>
    <td class="g">${use('f', i.id, 64, `${i.id} 64px`)}</td>
    <td class="pair">${use('fo', i.id, 64, `${i.id} open 64px`)}</td>
  </tr>`).join('');

const BASEROW = `
  <tr class="baserow">
    <th scope="row"><span class="nm">folder</span><span class="arch">canon base — no emblem</span></th>
    <td>${use('f', 'folder', 16)}</td><td class="pair">${use('fo', 'folder', 16)}</td>
    <td class="rowcell g">${row('f', 'folder', 'assets')}</td>
    <td class="rowcell">${row('fo', 'folder', 'assets')}</td>
    <td class="g">${use('f', 'folder', 32)}</td><td class="pair">${use('fo', 'folder', 32)}</td>
    <td class="g">${use('f', 'folder', 64)}</td><td class="pair">${use('fo', 'folder', 64)}</td>
  </tr>`;

// ---- explorer strips -------------------------------------------------------
const APP = [
	['fo', 'src', 'src', 0],
	['fo', 'components', 'components', 1],
	['f', 'view', 'views', 2],
	['f', 'hooks', 'hooks', 1],
	['f', 'library', 'lib', 1],
	['f', 'styles', 'styles', 1],
	['f', 'types', 'types', 1],
	['x', 'reactts', 'App.tsx', 1],
	['x', 'typescript', 'index.ts', 1],
	['x', 'sass', 'main.scss', 1],
	['f', 'test', 'tests', 0],
	['f', 'public', 'public', 0],
	['x', 'dotenv', '.env', 0],
	['x', 'git', '.gitignore', 0],
	['x', 'docker', 'Dockerfile', 0],
	['x', 'json', 'package.json', 0],
	['x', 'lock', 'pnpm-lock.yaml', 0],
	['x', 'markdown', 'README.md', 0]
];
const ROOTDIR = [
	['f', 'github', '.github', 0],
	['f', 'vscode', '.vscode', 0],
	['f', 'next', '.next', 0],
	['f', 'api', 'api', 0],
	['f', 'app', 'app', 0],
	['f', 'config', 'config', 0],
	['f', 'db', 'database', 0],
	['f', 'docs', 'docs', 0],
	['f', 'images', 'images', 0],
	['f', 'node', 'node_modules', 0],
	['f', 'package', 'packages', 0],
	['f', 'scripts', 'scripts', 0],
	['f', 'server', 'server', 0],
	['f', 'services', 'services', 0],
	['x', 'yaml', 'ci.yml', 0],
	['x', 'shell', 'build.sh', 0],
	['x', 'css', 'reset.css', 0],
	['x', 'markdown', 'CHANGELOG.md', 0]
];
const strip = (title, rows, bg) => `<div class="tree" style="background:${bg}">
  <div class="treehead">${esc(title)}</div>
  ${rows.map(([p, id, label, d]) => `<div class="row" style="padding-left:${14 + d * 12}px">${use(p, id, 16)}<span>${esc(label)}</span></div>`).join('\n  ')}
</div>`;

// ---- manifest --------------------------------------------------------------
const totalBytes = icons.reduce((a, i) => a + i.bytes, 0);
const TABLE = icons.map(i => `
  <tr>
    <td class="mono">${esc(i.id)}</td>
    <td class="mono dim">${esc(i.desc)}</td>
    <td class="mono"><span class="sw" style="background:${i.color}"></span>${esc(i.color)}</td>
    <td class="mono dim">${esc(i.src)}</td>
    <td class="mono num">${i.closed.bytes}</td>
    <td class="mono num">${i.open.bytes}</td>
  </tr>`).join('');

const TITLE = 'M11 Folders';
const html = `<title>${TITLE}</title>
<style>
  :root{
    --bg:#121314; --bg2:#191A1B; --panel:#1C1E1F; --line:#2A2D2E;
    --fg:#D7D9DA; --dim:#8A9092;
    --mono:ui-monospace,SFMono-Regular,"SF Mono",Menlo,monospace;
    --sans:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.55 var(--sans);
       -webkit-font-smoothing:antialiased;padding:0 0 96px}
  .wrap{max-width:1180px;margin:0 auto;padding:0 28px}
  header{padding:56px 0 36px;border-bottom:1px solid var(--line);margin-bottom:44px}
  h1{font-size:30px;line-height:1.15;margin:0 0 12px;letter-spacing:-.02em;font-weight:600}
  .sub{color:var(--dim);max-width:74ch;margin:0 0 20px}
  .meta{display:flex;flex-wrap:wrap;gap:8px}
  .tag{font:11px/1 var(--mono);color:var(--dim);border:1px solid var(--line);
       border-radius:999px;padding:6px 10px;background:var(--bg2)}
  h2{font-size:12px;letter-spacing:.13em;text-transform:uppercase;color:var(--dim);
     font-weight:600;margin:52px 0 6px}
  h2:first-of-type{margin-top:0}
  .lede{color:var(--dim);margin:0 0 22px;max-width:80ch}
  .lede code{font:12px/1 var(--mono);color:#B9BEC2}

  table{border-collapse:collapse;width:100%;background:var(--panel);
        border:1px solid var(--line);border-radius:10px;overflow:hidden}
  thead th{font:11px/1.4 var(--mono);text-transform:uppercase;letter-spacing:.08em;color:var(--dim);
           text-align:center;padding:12px 6px;border-bottom:1px solid var(--line);font-weight:500}
  thead th:first-child,tbody th{text-align:left}
  tbody th{font-weight:400;padding:9px 14px;white-space:nowrap}
  .nm{font:12px/1 var(--mono);color:var(--fg)}
  .arch{display:block;font:10px/1.6 var(--mono);color:var(--dim);letter-spacing:.03em;
        max-width:20ch;white-space:normal}
  td{padding:9px 6px;text-align:center;vertical-align:middle}
  tbody tr+tr th,tbody tr+tr td{border-top:1px solid var(--line)}
  .g{border-left:1px solid var(--line)}
  .pair{padding-left:2px}
  .ico{display:inline-block;vertical-align:middle}
  .rowcell{text-align:left;padding:9px 4px}
  .trow{display:inline-flex;align-items:center;gap:7px;height:22px;padding-right:10px;border-radius:4px}
  .trow span{font:13px/1 var(--sans);color:#CCCCCC;white-space:nowrap}
  .baserow th,.baserow td{background:#171819}

  .tree{border:1px solid var(--line);border-radius:10px;padding:10px 0 14px;
        width:300px;flex:none}
  .treehead{font:10px/1 var(--mono);color:var(--dim);letter-spacing:.08em;padding:6px 14px 12px}
  .tree .row{display:flex;align-items:center;gap:7px;height:22px}
  .tree .row span{font:13px/1 var(--sans);color:#CCCCCC;white-space:nowrap}
  .tree .row .ico{flex:none}
  .strips{display:flex;gap:20px;align-items:flex-start;flex-wrap:wrap}

  .mono{font:12px/1.5 var(--mono)}
  .dim{color:var(--dim)}
  .num{text-align:right}
  .sw{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:7px;
      vertical-align:-1px;border:1px solid #00000055}
  .ftable td{text-align:left;padding:8px 12px}
  .ftable td.num{text-align:right}
  tfoot td{border-top:1px solid var(--line);color:var(--dim);font:12px/1.5 var(--mono)}
</style>

${defs}

<div class="wrap">
<header>
  <h1>${TITLE} — production contact sheet</h1>
  <p class="sub">Every named folder is the canon tan base, byte-for-byte, plus one flat emblem
  anchored in the bottom-right corner. Closed uses a 6.5&nbsp;px emblem box ending 1&nbsp;px inside
  the folder's corner; open drops to 4.9&nbsp;px so the mark clears the front flap, which is only
  6.3&nbsp;px tall. Emblems are darker than the tan — quiet is recessive, not bright — and only
  a brand earns colour.</p>
  <div class="meta">
    <span class="tag">${icons.length} concepts</span>
    <span class="tag">${icons.length * 2} files</span>
    <span class="tag">${totalBytes} bytes total</span>
    <span class="tag">avg ${Math.round(totalBytes / (icons.length * 2))} B</span>
    <span class="tag">max ${Math.max(...icons.map(i => Math.max(i.closed.bytes, i.open.bytes)))} B</span>
    <span class="tag">bg #121314</span>
  </div>
</header>

<section>
  <h2>Size ladder</h2>
  <p class="lede">Closed and open side by side at every size. 16&nbsp;px is the primary render,
  the 22&nbsp;px row is the real explorer context (labelled with the folder name the concept
  actually matches in <code>core-tier.json</code>), 32 and 64 only have to stay clean.
  The first row is the untouched canon base for reference.</p>
  <table>
    <thead><tr><th>concept</th><th>16</th><th class="pair">open</th>
    <th class="g">tree row 22</th><th>tree row 22 open</th>
    <th class="g">32</th><th class="pair">open</th>
    <th class="g">64</th><th class="pair">open</th></tr></thead>
    <tbody>${BASEROW}${LADDER}</tbody>
  </table>
</section>

<section>
  <h2>As a tree</h2>
  <p class="lede">The proof that matters: folders mixed with batch-1 file icons in a real
  explorer listing. The tan mass has to stay the constant, the emblems have to stay under it,
  and nothing may out-shout a file badge.</p>
  <div class="strips">
    ${strip('an app · 22px rows · 16px icons', APP, '#1E1E1E')}
    ${strip('a repo root', ROOTDIR, '#1E1E1E')}
    ${strip('on the editor background', APP, '#121314')}
  </div>
</section>

<section>
  <h2>Manifest</h2>
  <table class="ftable">
    <thead><tr><th>id</th><th>emblem</th><th>hex</th><th>colour source</th>
    <th class="num">closed B</th><th class="num">open B</th></tr></thead>
    <tbody>${TABLE}</tbody>
    <tfoot><tr><td colspan="4">${icons.length} concepts · ${icons.length * 2} files
    · canon base verbatim in every one</td>
    <td class="num">${icons.reduce((a, i) => a + i.closed.bytes, 0)}</td>
    <td class="num">${icons.reduce((a, i) => a + i.open.bytes, 0)}</td></tr></tfoot>
  </table>
</section>
</div>
`;

const out = join(ROOT, 'contact-folders.html');
writeFileSync(out, html, 'utf8');
console.log(`${out}  (${Buffer.byteLength(html)} bytes)`);
const png = join(ROOT, 'contact-folders.png');
const r = shoot(out, png, 1240, 2);
console.log(`${png}  (${r.width}x${r.height} css px at 2x, ${r.bytes} bytes)`);
console.log(`  renderer: ${r.bin}`);
