#!/usr/bin/env node
// contact-A05.mjs — contact sheet for long-tail slice A05 (M11 full-coverage wave, D20 a2).
//
//   node contact-A05.mjs          # -> contact-A05.html
//   node contact-A05.mjs --png    # also shoots contact-A05.png at 2x
//
// tools/contact.mjs carries a hard-coded batch-1 roster, so this slice ships its own thin
// sheet rather than modifying the shared tool (same precedent as contact-batch2/4.mjs).
// Same rules: every icon is inlined once as an SVG <symbol>, the page makes no external
// request, and the screenshot runs on the Playwright chromium under
// ~/Library/Caches/ms-playwright.

import { readFileSync, writeFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { homedir, tmpdir } from 'node:os';

const ROOT = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const SLICE = 'A05';
const TITLE = 'M11 long-tail A05';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// group, id, archetype, tree row (a real matched filename), colour source
const ROSTER = [
	['NestJS roles', 'nest-controller', 'GLYPH', 'users.controller.ts', 'nest crimson, lifted for 1.8 px arms'],
	['NestJS roles', 'nest-decorator', 'GLYPH', 'roles.decorator.ts', 'role tint — violet'],
	['NestJS roles', 'nest-filter', 'SILHOUETTE', 'http.filter.ts', 'role tint — amber'],
	['NestJS roles', 'nest-gateway', 'SILHOUETTE', 'events.gateway.ts', 'role tint — blue'],
	['NestJS roles', 'nest-guard', 'SILHOUETTE', 'auth.guard.ts', 'role tint — green'],
	['NestJS roles', 'nest-interceptor', 'GLYPH', 'logging.interceptor.ts', 'role tint — orange'],
	['NestJS roles', 'nest-middleware', 'GLYPH', 'logger.middleware.ts', 'role tint — slate'],
	['NestJS roles', 'nest-module', 'SILHOUETTE', 'app.module.ts', 'role tint — indigo'],
	['NestJS roles', 'nest-pipe', 'SILHOUETTE', 'validation.pipe.ts', 'role tint — teal'],
	['NestJS roles', 'nest-resolver', 'SILHOUETTE', 'users.resolver.ts', 'role tint — rose'],
	['NestJS roles', 'nest-service', 'SILHOUETTE', 'users.service.ts', 'role tint — periwinkle'],

	['Angular &amp; NgRx', 'ng-tailwind', 'SILHOUETTE', 'ng-tailwind.js', 'angular rose + the tailwind wave (R3 family)'],
	['Angular &amp; NgRx', 'ngrx-actions', 'GLYPH', 'user.actions.ts', 'role tint — plum'],
	['Angular &amp; NgRx', 'ngrx-effects', 'GLYPH', 'user.effects.ts', 'role tint — violet'],
	['Angular &amp; NgRx', 'ngrx-reducer', 'GLYPH', 'user.reducer.ts', 'role tint — lime'],
	['Angular &amp; NgRx', 'ngrx-selectors', 'SILHOUETTE', 'user.selectors.ts', 'role tint — amber'],
	['Angular &amp; NgRx', 'ngrx-state', 'SILHOUETTE', 'user.state.ts', 'role tint — teal'],

	['Databases', 'mwb', 'SILHOUETTE', 'schema.mwb', 'MySQL #00758F → lifted teal-blue'],
	['Databases', 'neo4j', 'SILHOUETTE', 'graph.cypher', 'brand #4581C3, verbatim'],
	['Databases', 'pgsql', 'SILHOUETTE', 'report.pgsql', 'brand #4169E1 → matte, lifted for 16 px'],
	['Databases', 'plsql', 'SILHOUETTE', 'report.ddl', 'Oracle red, lifted one step for the cylinder'],
	['Databases', 'plsql-package', 'BADGE', 'orders.pck', 'Oracle red plate (R3 family)'],
	['Databases', 'plsql-package-body', 'BADGE', 'orders.pkb', 'Oracle red plate (R3 family)'],
	['Databases', 'plsql-package-header', 'BADGE', 'orders.pkh', 'Oracle red plate (R3 family)'],
	['Databases', 'plsql-package-spec', 'BADGE', 'orders.pks', 'Oracle red plate (R3 family)'],

	['Templates &amp; data formats', 'mson', 'BADGE', 'schema.mson', 'no brand → slate blue'],
	['Templates &amp; data formats', 'mustache', 'SILHOUETTE', 'email.mustache', 'no brand → moustache tan'],
	['Templates &amp; data formats', 'mvt', 'BADGE', 'product.mvt', 'no brand → slate plate'],
	['Templates &amp; data formats', 'mvtcss', 'BADGE', 'theme.mvt', 'slate plate + css chip (R3 family)'],
	['Templates &amp; data formats', 'mvtjs', 'BADGE', 'cart.mvt', 'slate plate + js chip (R3 family)'],
	['Templates &amp; data formats', 'mxml', 'BADGE', 'Main.mxml', 'no brand → violet'],
	['Templates &amp; data formats', 'nunjucks', 'BADGE', 'page.njk', 'nunjucks green, lifted to clear nginx / csharp'],

	['Languages &amp; runtimes', 'nearly', 'BADGE', 'grammar.ne', 'no brand → lilac (light plate, dark letters §4)'],
	['Languages &amp; runtimes', 'numpy', 'BADGE', 'weights.npy', 'brand #013243 unusable → NumPy #4DABCF lane'],
	['Languages &amp; runtimes', 'nushell', 'SILHOUETTE', 'setup.nu', 'nu green, darkened to clear supabase'],
	['Languages &amp; runtimes', 'objectivecpp', 'BADGE', 'Bridge.mm', 'objectivec plate #7C8CA6 (R3 family)'],
	['Languages &amp; runtimes', 'ocaml-intf', 'GLYPH', 'parser.mli', 'ocaml tan, lifted for a bare-letter glyph'],
	['Languages &amp; runtimes', 'odin', 'BADGE', 'main.odin', 'no brand → deep indigo (blue twinned cpp / typescript / powershell)'],
	['Languages &amp; runtimes', 'ogone', 'BADGE', 'app.o3', 'no brand → rose'],
	['Languages &amp; runtimes', 'opencl', 'BADGE', 'matmul.opencl', 'no brand → green-grey'],
	['Languages &amp; runtimes', 'otne', 'BADGE', 'model.otne', 'no brand → tan'],
	['Languages &amp; runtimes', 'pascal', 'BADGE', 'unit1.pas', 'no brand → Delphi blue (R3 family)'],
	['Languages &amp; runtimes', 'pascalproject', 'BADGE', 'project1.dpr', 'same plate, different letters (R3 family)'],
	['Languages &amp; runtimes', 'pawn', 'SILHOUETTE', 'gamemode.pwn', 'no brand → tan'],
	['Languages &amp; runtimes', 'perl6', 'BADGE', 'script.pl6', 'perl plate #49599C (R3 family)'],
	['Languages &amp; runtimes', 'pine', 'SILHOUETTE', 'strategy.pine', 'no brand → pine green'],
	['Languages &amp; runtimes', 'pkl', 'BADGE', 'config.pkl', 'no brand → periwinkle'],

	['Tooling &amp; package managers', 'msw', 'BADGE', 'mockServiceWorker.js', 'MSW orange → matte'],
	['Tooling &amp; package managers', 'nanostaged', 'BADGE', '.nano-staged.json', 'no brand → lint green'],
	['Tooling &amp; package managers', 'nextflow', 'GLYPH', 'main.nf', 'Nextflow #0DC09D → matte'],
	['Tooling &amp; package managers', 'nimble', 'BADGE', 'app.nimble', 'nim #C6C24C (R3 family, dark letters)'],
	['Tooling &amp; package managers', 'ninja', 'SILHOUETTE', 'build.ninja', 'no brand → grey'],
	['Tooling &amp; package managers', 'nitro', 'GLYPH', 'nitro.config.ts', 'nitro amber, lifted for 16 px'],
	['Tooling &amp; package managers', 'nix', 'SILHOUETTE', 'flake.nix', 'brand #5277C3, verbatim'],
	['Tooling &amp; package managers', 'njsproj', 'BADGE', 'App.njsproj', 'node #5FA04E (R3 family)'],
	['Tooling &amp; package managers', 'nsi', 'BADGE', 'installer.nsi', 'no brand → NSIS blue'],
	['Tooling &amp; package managers', 'ocx', 'SILHOUETTE', 'ocx.toml', 'no brand → violet'],
	['Tooling &amp; package managers', 'opam', 'BADGE', 'dune.opam', 'ocaml tan family, shifted olive (R7)'],
	['Tooling &amp; package managers', 'oso', 'SILHOUETTE', 'policy.polar', 'no brand → indigo'],
	['Tooling &amp; package managers', 'paket', 'BADGE', 'paket.dependencies', 'no brand → teal, lifted to clear sqlite'],
	['Tooling &amp; package managers', 'phalcon', 'BADGE', 'index.volt', 'no brand → green-teal (clears nginx, go, sqlite, php)'],
	['Tooling &amp; package managers', 'phpstan', 'BADGE', 'phpstan.neon', 'php-adjacent indigo'],
	['Tooling &amp; package managers', 'phpunit', 'GLYPH', 'phpunit.xml', 'no brand → test green'],
	['Tooling &amp; package managers', 'pip', 'SILHOUETTE', 'Pipfile', 'python #3776AB + #D8B44A (R2, R3 family)'],
	['Tooling &amp; package managers', 'pipeline', 'SILHOUETTE', 'deploy.pipeline', 'no brand → slate blue'],
	['Tooling &amp; package managers', 'pixi', 'BADGE', 'pixi.toml', 'no brand → gold'],
	['Tooling &amp; package managers', 'plastic', 'BADGE', 'plastic.workspace', 'no brand → steel blue'],
	['Tooling &amp; package managers', 'platformio', 'BADGE', 'platformio.ini', 'PlatformIO orange → matte'],
	['Tooling &amp; package managers', 'plop', 'SILHOUETTE', 'plopfile.js', 'no brand → amber'],

	['Planning &amp; modelling', 'openscad', 'SILHOUETTE', 'bracket.scad', 'OpenSCAD yellow → matte'],
	['Planning &amp; modelling', 'pddl', 'BADGE', 'domain.pddl', 'no brand → slate'],
	['Planning &amp; modelling', 'pddl-happenings', 'GLYPH', 'run.happenings', 'no brand → violet'],
	['Planning &amp; modelling', 'pddl-plan', 'SILHOUETTE', 'solution.plan', 'no brand → teal'],
	['Planning &amp; modelling', 'plantuml', 'SILHOUETTE', 'sequence.puml', 'no brand → red'],

	['Apps, assets &amp; platforms', 'n64', 'GLYPH', 'mario.z64', 'N64 red → lifted'],
	['Apps, assets &amp; platforms', 'noc', 'BADGE', 'render.noc', 'no brand → slate'],
	['Apps, assets &amp; platforms', 'nvidia', 'SILHOUETTE', 'kernel.cl', 'NVIDIA #76B900 → matte'],
	['Apps, assets &amp; platforms', 'onenote', 'SILHOUETTE', 'notes.one', 'OneNote #7719AA → lifted'],
	['Apps, assets &amp; platforms', 'openhab', 'SILHOUETTE', 'home.things', 'openHAB orange → matte'],
	['Apps, assets &amp; platforms', 'outlook', 'SILHOUETTE', 'invite.msg', 'Outlook #0F6CBD → matte'],
	['Apps, assets &amp; platforms', 'ovpn', 'BADGE', 'client.ovpn', 'OpenVPN orange → deepened (R7)'],
	['Apps, assets &amp; platforms', 'palette', 'SILHOUETTE', 'swatches.gpl', 'no brand → magenta'],
	['Apps, assets &amp; platforms', 'pcl', 'SILHOUETTE', 'scan.pcd', 'no brand → violet'],
	['Apps, assets &amp; platforms', 'poedit', 'SILHOUETTE', 'messages.po', 'no brand → blue']
];

// core neighbours shown for hue / weight comparison only
const NEIGHBOURS = ['nestjs', 'angular', 'sql', 'sqlite', 'python', 'php', 'perl', 'ocaml',
	'objectivec', 'nim', 'node', 'shell', 'tailwind', 'markdown', 'json', 'xml', 'npm', 'typescript'];

const load = (id) => {
	const file = join(ROOT, 'svg', 'file', `${id}.svg`);
	if (!existsSync(file)) { throw new Error(`missing ${file}`); }
	const src = readFileSync(file, 'utf8');
	const fills = [...new Set([...src.matchAll(/fill="(#[0-9A-Fa-f]{6})"/g)].map(m => m[1].toUpperCase()))];
	return {
		inner: src.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, ''),
		bytes: Buffer.byteLength(src),
		fills
	};
};

const icons = ROSTER.map(([group, id, archetype, label, palette], i) =>
	({ n: i + 1, group, id, archetype, label, palette, ...load(id) }));
const neighbours = NEIGHBOURS.map(id => ({ id, ...load(id) }));
const groups = [...new Set(icons.map(i => i.group))];

const defs = `<svg width="0" height="0" aria-hidden="true" style="position:absolute"><defs>
${icons.map(i => `<symbol id="p-${i.id}" viewBox="0 0 16 16">${i.inner}</symbol>`).join('\n')}
${neighbours.map(i => `<symbol id="n-${i.id}" viewBox="0 0 16 16">${i.inner}</symbol>`).join('\n')}
</defs></svg>`;

const use = (pfx, id, s, alt) =>
	`<svg class="ico" width="${s}" height="${s}" role="img" aria-label="${esc(alt)}"><use href="#${pfx}-${id}"/></svg>`;

const ladder = (g) => icons.filter(i => i.group === g).map(i => `
  <tr>
    <th scope="row"><span class="nm">${esc(i.id)}</span><span class="arch">${i.archetype}</span></th>
    <td>${use('p', i.id, 16, `${i.id} 16px`)}</td>
    <td>${use('p', i.id, 22, `${i.id} 22px`)}</td>
    <td class="rowcell"><span class="trow">${use('p', i.id, 16, '')}<span>${esc(i.label)}</span></span></td>
    <td>${use('p', i.id, 32, `${i.id} 32px`)}</td>
    <td>${use('p', i.id, 64, `${i.id} 64px`)}</td>
  </tr>`).join('');

const SECTIONS = groups.map(g => `<section>
  <h2>${g}</h2>
  <table>
    <thead><tr><th>concept</th><th>16</th><th>22</th><th>tree row (22 px)</th><th>32</th><th>64</th></tr></thead>
    <tbody>${ladder(g)}</tbody>
  </table>
</section>`).join('\n');

const treeOf = (list, pfx, head) => `<div class="tree">
  <div class="treehead">${esc(head)}</div>
  ${list.map(i => `<div class="row">${use(pfx, i.id, 16, '')}<span>${esc(i.label || i.id)}</span></div>`).join('\n  ')}
</div>`;

const half = Math.ceil(icons.length / 2);
const STRIPS = `<div class="strips">${treeOf(icons.slice(0, half), 'p', 'explorer · 22 px rows · 16 px icons')}${treeOf(icons.slice(half), 'p', 'on #1E1E1E')}</div>`;

const SWATCHES = neighbours.map(i =>
	`<span class="sw">${use('n', i.id, 22, `${i.id} 22px`)}<span>${esc(i.id)}</span></span>`).join('');

const totalBytes = icons.reduce((a, i) => a + i.bytes, 0);
const counts = icons.reduce((a, i) => ({ ...a, [i.archetype]: (a[i.archetype] || 0) + 1 }), {});

const TABLE = icons.map(i => `
  <tr>
    <td class="mono num">${i.n}</td>
    <td class="mono">${esc(i.id)}</td>
    <td class="mono dim">svg/file/${esc(i.id)}.svg</td>
    <td class="mono">${i.archetype}</td>
    <td class="mono">${i.fills.map(f => `<span class="chip" style="background:${f}"></span>${f}`).join(' ')}</td>
    <td class="mono num">${i.bytes}</td>
    <td class="mono dim">${i.palette}</td>
  </tr>`).join('');

const html = `<title>${esc(TITLE)}</title>
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
     font-weight:600;margin:52px 0 14px}
  section:first-of-type h2{margin-top:0}
  .lede{color:var(--dim);margin:0 0 22px;max-width:78ch}

  table{border-collapse:collapse;width:100%;background:var(--panel);
        border:1px solid var(--line);border-radius:10px;overflow:hidden}
  thead th{font:11px/1.4 var(--mono);text-transform:uppercase;letter-spacing:.08em;color:var(--dim);
           text-align:center;padding:12px 8px;border-bottom:1px solid var(--line);font-weight:500}
  thead th:first-child,tbody th{text-align:left}
  tbody th{font-weight:400;padding:9px 14px;white-space:nowrap}
  .nm{font:12px/1 var(--mono);color:var(--fg)}
  .arch{display:block;font:10px/1.6 var(--mono);color:var(--dim);letter-spacing:.06em}
  td{padding:9px 8px;text-align:center;vertical-align:middle}
  tbody tr+tr th,tbody tr+tr td{border-top:1px solid var(--line)}
  .ico{display:inline-block;vertical-align:middle}
  .rowcell{text-align:left;padding-left:16px}
  .trow{display:inline-flex;align-items:center;gap:7px;height:22px;padding:0 8px;border-radius:4px}
  .trow span{font:13px/1 var(--sans);color:#CCCCCC;white-space:nowrap}

  .tree{border:1px solid var(--line);border-radius:10px;padding:10px 0 14px;background:var(--bg);
        max-width:380px}
  .treehead{font:10px/1 var(--mono);color:var(--dim);letter-spacing:.08em;padding:6px 14px 12px}
  .tree .row{display:flex;align-items:center;gap:7px;padding:0 14px;height:22px}
  .tree .row span{font:13px/1 var(--sans);color:#CCCCCC;white-space:nowrap}
  .strips{display:grid;grid-template-columns:380px 380px;gap:20px;align-items:start}
  .strips .tree:nth-child(2){background:#1E1E1E}

  .swatches{display:flex;flex-wrap:wrap;gap:14px;background:var(--panel);border:1px solid var(--line);
            border-radius:10px;padding:16px}
  .sw{display:inline-flex;align-items:center;gap:6px}
  .sw span{font:11px/1 var(--mono);color:var(--dim)}

  .mono{font:12px/1.5 var(--mono)}
  .dim{color:var(--dim)}
  .num{text-align:right}
  .chip{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:4px;
        vertical-align:-1px;box-shadow:0 0 0 1px #ffffff18}
  .ftable td{text-align:left;padding:8px 14px}
  .ftable td.num{text-align:right}
  tfoot td{border-top:1px solid var(--line);color:var(--dim);font:12px/1.5 var(--mono)}
</style>

${defs}

<div class="wrap">
<header>
  <h1>${esc(TITLE)} — production contact sheet</h1>
  <p class="sub">Long-tail slice A05 of the full-coverage wave: ${icons.length} concepts from
  <code>mson</code> to <code>poedit</code>. Hand-authored SVGs — no &lt;text&gt;, no font-family,
  no gradients, no external references; every letterform is an Inter&nbsp;Bold outline baked by
  tools/letterpath.mjs. Real marks wherever the concept has one that survives 16&nbsp;px; letters
  are the fallback.</p>
  <div class="meta">
    <span class="tag">${icons.length} icons</span>
    <span class="tag">${counts.BADGE || 0} badge · ${counts.SILHOUETTE || 0} silhouette · ${counts.GLYPH || 0} glyph</span>
    <span class="tag">${totalBytes} bytes total</span>
    <span class="tag">avg ${Math.round(totalBytes / icons.length)} B</span>
    <span class="tag">max ${Math.max(...icons.map(i => i.bytes))} B</span>
    <span class="tag">bg #121314</span>
  </div>
</header>

<p class="lede">16&nbsp;px is the primary target; the 22&nbsp;px tree row with its real matched
filename is the usage context; 32 and 64 only have to stay clean.</p>

${SECTIONS}

<section>
  <h2>As a set</h2>
  <p class="lede">The whole slice as one explorer listing, on the editor background and on #1E1E1E.</p>
  ${STRIPS}
</section>

<section>
  <h2>Against the core</h2>
  <p class="lede">The same-domain core neighbours this slice is measured against — R7 is hard
  against these (§11.3), and against every other icon in the slice.</p>
  <div class="swatches">${SWATCHES}</div>
</section>

<section>
  <h2>Manifest</h2>
  <table class="ftable">
    <thead><tr><th class="num">#</th><th>id</th><th>path</th><th>archetype</th><th>fills</th><th class="num">bytes</th><th>colour source</th></tr></thead>
    <tbody>${TABLE}</tbody>
    <tfoot><tr><td colspan="5">${icons.length} icons</td><td class="num">${totalBytes}</td><td>—</td></tr></tfoot>
  </table>
</section>
</div>
`;

const out = join(ROOT, `contact-${SLICE}.html`);
writeFileSync(out, html, 'utf8');
console.log(`${out}  (${Buffer.byteLength(html)} bytes, ${icons.length} icons, ${totalBytes} icon bytes)`);

// ---- optional 2x screenshot -------------------------------------------------
const WIDTH = 1240;

function chromium() {
	const cache = join(homedir(), 'Library/Caches/ms-playwright');
	const builds = readdirSync(cache)
		.filter(d => /^chromium-\d+$/.test(d))
		.sort((a, b) => +b.split('-')[1] - +a.split('-')[1]);
	for (const b of builds) {
		const macos = join(cache, b, 'chrome-mac-arm64');
		for (const app of readdirSync(macos).filter(f => f.endsWith('.app'))) {
			const bin = join(macos, app, 'Contents/MacOS', app.replace(/\.app$/, ''));
			if (existsSync(bin)) { return bin; }
		}
	}
	throw new Error(`no Playwright chromium under ${cache}`);
}

const COMMON = ['--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
	'--allow-file-access-from-files', '--virtual-time-budget=8000'];

function shoot(htmlPath, pngPath) {
	const bin = chromium();
	const probe = join(tmpdir(), `m11-contact-a05-probe-${process.pid}.html`);
	writeFileSync(probe, `<!doctype html><body style="margin:0"><pre id="o"></pre>` +
		`<iframe id="f" src="file://${htmlPath}" style="width:${WIDTH}px;height:400px;border:0"></iframe>` +
		`<script>f.onload=()=>{document.getElementById('o').textContent='PAGEHEIGHT='+f.contentDocument.documentElement.scrollHeight}</script>`);
	const dom = execFileSync(bin, [...COMMON, `--window-size=${WIDTH + 200},600`, '--dump-dom', `file://${probe}`],
		{ encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 });
	rmSync(probe, { force: true });
	const m = /PAGEHEIGHT=(\d+)/.exec(dom);
	if (!m) { throw new Error('could not measure the page height'); }
	const height = +m[1];

	execFileSync(bin, [...COMMON, '--force-device-scale-factor=2', '--default-background-color=121314ff',
		`--window-size=${WIDTH},${height}`, `--screenshot=${pngPath}`, `file://${htmlPath}`],
		{ stdio: ['ignore', 'ignore', 'ignore'] });
	return { bin, width: WIDTH, height };
}

if (argv.includes('--png')) {
	const png = join(ROOT, `contact-${SLICE}.png`);
	const r = shoot(out, png);
	console.log(`${png}  (${r.width}x${r.height} css px at 2x, ${Buffer.byteLength(readFileSync(png))} bytes)`);
	console.log(`  renderer: ${r.bin}`);
}
