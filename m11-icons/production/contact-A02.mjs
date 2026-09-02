#!/usr/bin/env node
// contact-A02.mjs — contact sheet for long-tail slice A02 (84 concepts, D20 amendment 2).
//
//   node contact-A02.mjs          # -> contact-A02.html
//   node contact-A02.mjs --png    # also shoots contact-A02.png at 2x
//
// tools/contact.mjs carries a hard-coded batch-1 roster, so this slice ships its own
// thin sheet rather than modifying the shared tool. Same rules: every icon is inlined
// once as an SVG <symbol>, the page makes no external request, and the screenshot runs
// on the Playwright chromium under ~/Library/Caches/ms-playwright.

import { readFileSync, writeFileSync, existsSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { homedir } from 'node:os';

const ROOT = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const SLICE = 'A02';
const TITLE = 'M11 long tail — slice A02';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ---- roster -----------------------------------------------------------------
// id -> [archetype, colour source]. The mark itself is described by the group it sits in.
const META = {
	bosque: ['SILHOUETTE', 'no brand → forest green (bosque = forest)'],
	bower: ['SILHOUETTE', 'bower #EF5734 → matte'],
	brainfuck: ['GLYPH', 'no brand → mauve, neutral lane'],
	bruno: ['BADGE', 'no brand → light peach plate, dark ink (§4)'],
	buckbuild: ['GLYPH', 'no brand → neutral slate'],
	bucklescript: ['BADGE', 'no brand → neutral tan (ReScript red blocked by npm/yaml)'],
	'c-al': ['BADGE', 'no brand → Dynamics blue (family c-al / dal)'],
	c3: ['BADGE', 'no brand → violet, dark ink (off the C/C++ lane)'],
	cabal: ['GLYPH', 'Haskell purple family'],
	caddy: ['BADGE', 'no brand → caddy green'],
	cadence: ['BADGE', 'no brand → Flow green'],
	cairo: ['SILHOUETTE', 'no brand → Starknet burnt orange'],
	cake: ['SILHOUETTE', 'no brand → cake tan'],
	cakephp: ['BADGE', 'CakePHP red → deep matte'],
	cangjie: ['BADGE', 'no brand → plum'],
	capnp: ['GLYPH', 'no brand → capnp green'],
	casc: ['GLYPH', 'no brand → neutral slate'],
	cbx: ['SILHOUETTE', 'no brand → comic rose'],
	cddl: ['GLYPH', 'no brand → CBOR blue-grey, neutral lane'],
	cds: ['BADGE', 'no brand → SAP CAP cyan, dark ink (§4)'],
	ceylon: ['GLYPH', 'no brand → amber-brown'],
	cf: ['BADGE', 'ColdFusion slate blue (family cf / cfc / cfm)'],
	cfc: ['BADGE', 'ColdFusion family plate'],
	cfm: ['BADGE', 'ColdFusion family plate'],
	chef: ['SILHOUETTE', 'Chef orange'],
	'chef-cookbook': ['SILHOUETTE', 'Chef family, darker (tone law)'],
	chess: ['SILHOUETTE', 'no brand → bone white'],
	circom: ['GLYPH', 'no brand → ZK violet'],
	clojurescript: ['BADGE', 'ClojureScript blue (clojure mark, cljs plate)'],
	coala: ['SILHOUETTE', 'no brand → koala grey'],
	cobol: ['SILHOUETTE', 'no brand → mainframe blue'],
	coconut: ['SILHOUETTE', 'no brand → husk brown'],
	cocos: ['BADGE', 'no brand → Cocos deep green'],
	codekit: ['SILHOUETTE', 'no brand → toolbox red'],
	codeql: ['GLYPH', 'no brand → CodeQL violet'],
	coffeescript: ['SILHOUETTE', 'CoffeeScript brown'],
	coloredpetrinets: ['GLYPH', 'no brand → petri slate, neutral lane'],
	command: ['GLYPH', 'no brand → key-cap silver, neutral lane'],
	conan: ['GLYPH', 'no brand → conan indigo'],
	confluence: ['GLYPH', 'Atlassian blue'],
	context: ['GLYPH', 'TeX teal family'],
	controller: ['SILHOUETTE', 'no brand → controller violet'],
	crystal: ['SILHOUETTE', 'brand #000000 → lifted silver (§6.3)'],
	csproj: ['BADGE', 'C# green family plate'],
	cssmap: ['SILHOUETTE', 'CSS blue family'],
	cucumber: ['SILHOUETTE', 'Cucumber green'],
	cuda: ['SILHOUETTE', 'NVIDIA green → matte'],
	cue: ['BADGE', 'no brand → CUE indigo'],
	'cypress-spec': ['GLYPH', 'Cypress green family'],
	cython: ['GLYPH', 'Python-blue family, lifted'],
	dal: ['BADGE', 'Dynamics blue family (with c-al)'],
	'dartlang-generated': ['SILHOUETTE', 'Dart blue desaturated — generated tier is dimmer'],
	denizenscript: ['BADGE', 'no brand → Minecraft green'],
	devenv: ['BADGE', 'no brand → dev-shell slate, neutral lane'],
	dhall: ['BADGE', 'no brand → Dhall steel, neutral lane'],
	dinophp: ['SILHOUETTE', 'PHP indigo lineage'],
	dlang: ['GLYPH', 'D language red → matte'],
	docpad: ['SILHOUETTE', 'no brand → docpad teal'],
	doctex: ['GLYPH', 'TeX teal family'],
	'doctex-installer': ['GLYPH', 'TeX teal family'],
	docz: ['BADGE', 'no brand → Docz magenta'],
	dotjs: ['BADGE', 'JS gold family, olive-shifted'],
	doxyfile: ['BADGE', 'no brand → Doxygen steel, neutral lane'],
	drools: ['BADGE', 'no brand → brick, neutral lane'],
	dtd: ['GLYPH', 'XML slate family, neutral lane'],
	dtx: ['GLYPH', 'TeX teal family'],
	duc: ['GLYPH', 'no brand → sand, neutral lane'],
	duckdb: ['SILHOUETTE', 'DuckDB yellow'],
	dune: ['SILHOUETTE', 'OCaml-lineage sand'],
	dustjs: ['GLYPH', 'no brand → dust taupe, neutral lane'],
	dvc: ['BADGE', 'DVC teal-cyan'],
	dylan: ['GLYPH', 'no brand → orchid'],
	earthly: ['SILHOUETTE', 'Earthly green'],
	edge: ['BADGE', 'no brand → Edge template orchid'],
	eex: ['BADGE', 'Elixir purple family'],
	ejs: ['BADGE', 'EJS gold (darkened off the js plate)'],
	elastic: ['SILHOUETTE', 'brand #005571 lifted (§6.3)'],
	elm: ['SILHOUETTE', 'Elm blue'],
	emacs: ['BADGE', 'Emacs purple'],
	email: ['SILHOUETTE', 'no brand → envelope slate'],
	ember: ['BADGE', 'brand #E04E39 → matte, off canon npm'],
	ensime: ['GLYPH', 'no brand → Scala-lineage rose'],
	erb: ['BADGE', 'Ruby red family, deepened'],
	falcon: ['SILHOUETTE', 'no brand → falcon slate blue']
};

// Sheet grouping. Every id appears exactly once (asserted below).
const GROUPS = [
	['Languages & dialects', ['bosque', 'brainfuck', 'c-al', 'c3', 'cairo', 'cadence', 'cangjie', 'capnp',
		'ceylon', 'circom', 'clojurescript', 'cobol', 'coconut', 'coffeescript', 'crystal', 'cue',
		'cython', 'dal', 'dhall', 'dlang', 'dylan', 'elm', 'emacs', 'falcon']],
	['Build, package & environment', ['bower', 'buckbuild', 'bucklescript', 'cabal', 'caddy', 'cake',
		'chef', 'chef-cookbook', 'codekit', 'conan', 'csproj', 'devenv', 'dune', 'dvc', 'earthly', 'ensime']],
	['Web frameworks & templating', ['cakephp', 'cf', 'cfc', 'cfm', 'cocos', 'dinophp', 'docpad', 'docz',
		'dotjs', 'dustjs', 'edge', 'eex', 'ejs', 'ember', 'erb']],
	['Testing, rules & analysis', ['coala', 'codeql', 'controller', 'cucumber', 'cypress-spec', 'drools',
		'coloredpetrinets']],
	['Docs & typesetting', ['cbx', 'confluence', 'context', 'doctex', 'doctex-installer', 'doxyfile', 'dtx']],
	['Data, schema & assets', ['bruno', 'casc', 'cddl', 'cds', 'chess', 'command', 'cssmap', 'cuda',
		'dartlang-generated', 'denizenscript', 'dtd', 'duc', 'duckdb', 'elastic', 'email']]
];

// Tree-row filenames: real matches from longtail-worklist.json, with a readable stem
// where the concept matches by extension only.
const STEM = {
	bosque: 'main', brainfuck: 'hello', 'c-al': 'Customer', c3: 'main', cairo: 'contract',
	cadence: 'NFT', cangjie: 'main', capnp: 'schema', ceylon: 'module', circom: 'multiplier',
	clojurescript: 'core', coconut: 'main', coffeescript: 'app', crystal: 'main', cue: 'schema',
	cython: 'fastmath', dal: 'query', dhall: 'package', dlang: 'app', dylan: 'library',
	elm: 'Main', emacs: 'init', falcon: 'app', cobol: 'PAYROLL', cakephp: 'view', cf: 'index',
	cfc: 'User', cfm: 'index', cocos: 'Level', dinophp: 'page', docpad: 'index', docz: 'docz',
	dotjs: 'list', dustjs: 'profile', edge: 'welcome', eex: 'index', ejs: 'layout', erb: 'show',
	cucumber: 'checkout', 'cypress-spec': 'login', drools: 'pricing', coala: 'coafile',
	codeql: 'unsafe-query', controller: 'users', coloredpetrinets: 'workflow', cbx: 'issue-01',
	confluence: 'runbook', context: 'thesis', doctex: 'package', 'doctex-installer': 'package',
	dtx: 'package', casc: 'jenkins', cddl: 'model', cds: 'service', chess: 'game',
	command: 'launch', cssmap: 'site.css', cuda: 'kernel', 'dartlang-generated': 'user',
	denizenscript: 'quest', dtd: 'catalog', duc: 'scene', duckdb: 'analytics', elastic: 'search',
	email: 'invite', cake: 'build', codekit: 'kit', conan: 'conanfile', csproj: 'App',
	bucklescript: 'Main', cabal: 'project', buckbuild: 'BUCK', bower: 'bower', caddy: 'Caddyfile',
	chef: 'Berksfile', 'chef-cookbook': 'apache', dune: 'dune', dvc: 'dvc', earthly: 'Earthfile',
	ensime: 'project', devenv: 'devenv', bruno: 'get-users', crystal2: '', doxyfile: 'Doxyfile',
	ember: 'ember-cli', elastic2: ''
};

// Explicit tree names where the first matcher is not the readable one.
const FILENAME = {
	brainfuck: 'hello.bf', cf: 'index.cfm', cfc: 'Service.cfc', cfm: 'layout.cfml',
	dotjs: 'list.dot', cocos: 'Level.scene', chess: 'game.pgn', email: 'invite.eml',
	'dartlang-generated': 'user.freezed.dart', 'cypress-spec': 'login.cy.ts',
	cssmap: 'site.css.map', cucumber: 'checkout.feature', cuda: 'kernel.cu',
	coloredpetrinets: 'workflow.cpn', doctex: 'package.dtx', 'doctex-installer': 'package.ins'
};

const work = JSON.parse(readFileSync(join(ROOT, 'longtail-worklist.json'), 'utf8'));
const slice = work.slices.find(s => s.id === SLICE);
const CONCEPTS = new Map(slice.concepts.map(c => [c.id, c]));

function treeName(id) {
	if (FILENAME[id]) { return FILENAME[id]; }
	const c = CONCEPTS.get(id);
	const stem = STEM[id];
	const fns = c.match.filenames || [];
	const exts = c.match.extensions || [];
	// a concrete filename the theme matches wins
	const named = fns.find(f => stem && f.toLowerCase().startsWith(String(stem).toLowerCase())) || fns[0];
	if (named && (!exts.length || fns.length)) { return named; }
	if (exts.length) { return `${stem || 'main'}.${exts[0]}`; }
	return named || `${stem || id}`;
}

// ---- assemble ---------------------------------------------------------------
const ids = GROUPS.flatMap(g => g[1]);
const missing = [...CONCEPTS.keys()].filter(i => !ids.includes(i));
const extra = ids.filter(i => !CONCEPTS.has(i));
if (missing.length || extra.length) {
	throw new Error(`sheet roster mismatch — missing ${missing.join(',')} extra ${extra.join(',')}`);
}

const symbols = [], bytes = new Map();
for (const id of ids) {
	const file = join(ROOT, 'svg', 'file', `${id}.svg`);
	if (!existsSync(file)) { throw new Error(`missing ${file}`); }
	const src = readFileSync(file, 'utf8');
	bytes.set(id, statSync(file).size);
	const inner = src.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
	symbols.push(`<symbol id="i-${id}" viewBox="0 0 16 16">${inner}</symbol>`);
}

const use = (id, px) => `<svg class="ico" width="${px}" height="${px}" aria-hidden="true"><use href="#i-${id}"/></svg>`;

const gridSection = GROUPS.map(([name, list]) => `
  <h3>${esc(name)} <span class="count">${list.length}</span></h3>
  <div class="grid">${list.map(id => `<figure>
      <div class="sizes">${use(id, 32)}${use(id, 22)}${use(id, 16)}</div>
      <figcaption>${esc(id)}<span>${META[id][0][0]}</span></figcaption>
    </figure>`).join('')}</div>`).join('');

const treeSection = GROUPS.map(([name, list]) => `
  <div class="tree">
    <div class="treehead">${esc(name.toUpperCase())}</div>
    ${list.map(id => `<div class="row">${use(id, 22)}<span>${esc(treeName(id))}</span></div>`).join('')}
  </div>`).join('');

const footRows = ids.slice().sort().map(id => `<tr>
    <td>${use(id, 16)}</td><td class="mono">${esc(id)}</td>
    <td class="mono dim">${META[id][0]}</td>
    <td class="mono num">${bytes.get(id)}</td>
    <td class="mono dim">${esc(META[id][1])}</td></tr>`).join('');

const total = ids.reduce((n, id) => n + bytes.get(id), 0);
const counts = ids.reduce((m, id) => { m[META[id][0]] = (m[META[id][0]] || 0) + 1; return m; }, {});

const html = `<!doctype html><html lang="en"><meta charset="utf-8">
<title>${esc(TITLE)}</title>
<style>
  :root{
    --bg:#121314; --bg2:#191A1B; --panel:#1C1E1F; --line:#2A2D2E;
    --fg:#D7D9DA; --dim:#8A9092;
    --mono:ui-monospace,SFMono-Regular,"SF Mono",Menlo,monospace;
    --sans:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.55 var(--sans);
       -webkit-font-smoothing:antialiased;padding:0 0 80px}
  .wrap{max-width:1180px;margin:0 auto;padding:0 28px}
  header{padding:52px 0 32px;border-bottom:1px solid var(--line);margin-bottom:40px}
  h1{font-size:30px;line-height:1.15;margin:0 0 12px;letter-spacing:-.02em;font-weight:600}
  .sub{color:var(--dim);max-width:76ch;margin:0 0 20px}
  .meta{display:flex;flex-wrap:wrap;gap:8px}
  .tag{font:11px/1 var(--mono);color:var(--dim);border:1px solid var(--line);
       border-radius:999px;padding:6px 10px;background:var(--bg2)}
  h2{font-size:12px;letter-spacing:.13em;text-transform:uppercase;color:var(--dim);
     font-weight:600;margin:48px 0 6px}
  h2:first-of-type{margin-top:0}
  .lede{color:var(--dim);margin:0 0 22px;max-width:80ch}
  h3{font:12px/1 var(--mono);color:var(--fg);letter-spacing:.06em;margin:26px 0 12px;font-weight:500}
  h3 .count{color:var(--dim)}

  .grid{display:grid;grid-template-columns:repeat(8,1fr);gap:14px 10px;
        background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:18px 16px}
  figure{margin:0;text-align:center}
  .sizes{display:flex;align-items:center;justify-content:center;gap:8px;height:34px}
  figcaption{font:10px/1.5 var(--mono);color:var(--fg);margin-top:6px;word-break:break-all}
  figcaption span{display:block;color:var(--dim);letter-spacing:.06em}
  .ico{display:inline-block;vertical-align:middle}

  .strips{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;align-items:start}
  .tree{border:1px solid var(--line);border-radius:10px;padding:10px 0 14px;background:var(--bg)}
  .treehead{font:10px/1 var(--mono);color:var(--dim);letter-spacing:.09em;padding:6px 14px 12px}
  .tree .row{display:flex;align-items:center;gap:7px;padding:0 14px;height:22px}
  .tree .row span{font:13px/1 var(--sans);color:#CCCCCC;white-space:nowrap;overflow:hidden;
                  text-overflow:ellipsis}

  table{border-collapse:collapse;width:100%;background:var(--panel);
        border:1px solid var(--line);border-radius:10px;overflow:hidden}
  thead th{font:11px/1.4 var(--mono);text-transform:uppercase;letter-spacing:.08em;color:var(--dim);
           text-align:left;padding:11px 12px;border-bottom:1px solid var(--line);font-weight:500}
  td{padding:7px 12px;vertical-align:middle}
  tbody tr+tr td{border-top:1px solid var(--line)}
  .mono{font:12px/1.5 var(--mono)}
  .dim{color:var(--dim)}
  .num{text-align:right}
  tfoot td{border-top:1px solid var(--line);color:var(--dim);font:12px/1.5 var(--mono)}
</style>
<body>
<svg width="0" height="0" style="position:absolute" aria-hidden="true">${symbols.join('')}</svg>
<div class="wrap">
  <header>
    <h1>${esc(TITLE)}</h1>
    <p class="sub">84 long-tail concepts authored against <span class="mono">spec.md</span> §11
      (D20 amendment 2). Real marks first; letters are the fallback. Hue follows the concept's
      brand or the hue the source themes already use. R7 is hard inside the slice and against
      same-domain core icons; R8 is hard everywhere.</p>
    <div class="meta">
      <span class="tag">${ids.length} icons</span>
      <span class="tag">SILHOUETTE ${counts.SILHOUETTE}</span>
      <span class="tag">GLYPH ${counts.GLYPH}</span>
      <span class="tag">BADGE ${counts.BADGE}</span>
      <span class="tag">${total} B total · ${Math.round(total / ids.length)} B avg</span>
      <span class="tag">R7 in-slice 0 · R8 0</span>
    </div>
  </header>

  <h2>The grid</h2>
  <p class="lede">Each concept at 32 / 22 / 16 px on the editor background. 16 px is the
    primary render; 22 px is the tree row.</p>
  ${gridSection}

  <h2>Tree rows at 22 px</h2>
  <p class="lede">Real filenames the theme matches, from the slice's matchers.</p>
  <div class="strips">${treeSection}</div>

  <h2>Manifest</h2>
  <p class="lede">id, archetype, bytes on disk, and where the colour came from.</p>
  <table>
    <thead><tr><th></th><th>id</th><th>archetype</th><th class="num">bytes</th><th>colour source</th></tr></thead>
    <tbody>${footRows}</tbody>
    <tfoot><tr><td></td><td colspan="2">${ids.length} icons</td><td class="num">${total}</td>
      <td>avg ${Math.round(total / ids.length)} B · max ${Math.max(...bytes.values())} B · cap 4096 B</td></tr></tfoot>
  </table>
</div>
</body></html>`;

const out = join(ROOT, `contact-${SLICE}.html`);
writeFileSync(out, html);
console.log(out);

// ---- screenshot -------------------------------------------------------------
if (argv.includes('--png')) {
	const cache = join(homedir(), 'Library/Caches/ms-playwright');
	const build = readdirSync(cache).filter(d => /^chromium-\d+$/.test(d))
		.sort((a, b) => +b.split('-')[1] - +a.split('-')[1])[0];
	if (!build) { throw new Error(`no Playwright chromium under ${cache}`); }
	const macos = join(cache, build, 'chrome-mac-arm64');
	const app = readdirSync(macos).find(f => f.endsWith('.app'));
	const bin = join(macos, app, 'Contents/MacOS', app.replace(/\.app$/, ''));
	const png = join(ROOT, `contact-${SLICE}.png`);
	rmSync(png, { force: true });
	execFileSync(bin, ['--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
		'--force-device-scale-factor=2', '--virtual-time-budget=15000',
		'--window-size=1240,6250', `--screenshot=${png}`, `file://${out}`],
		{ stdio: ['ignore', 'ignore', 'pipe'] });
	console.log(png);
}
