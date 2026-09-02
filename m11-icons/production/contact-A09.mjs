#!/usr/bin/env node
// contact-A09.mjs — contact sheet for M11 long-tail slice A09 (84 config concepts, b -> g).
//
//   node contact-A09.mjs          # -> contact-A09.html
//   node contact-A09.mjs --png    # also shoots contact-A09.png at 2x
//
// tools/contact.mjs carries a hard-coded batch-1 roster and cannot take a subset, so this is
// a thin local twin of it (same page structure, this slice's roster). Shared tools are not
// touched. Rows carry the real filenames the theme matches, grouped by what the tool does.

import { readFileSync, writeFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { homedir, tmpdir } from 'node:os';

const ROOT = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const TITLE = 'M11 long-tail slice A09';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// id -> [archetype, tree label (a real matcher), colour source]
const ROSTER = [
	['brunch', 'BADGE', 'brunch-config.js', 'no brand → warm taupe (neutral lane)'],
	['buf', 'BADGE', 'buf.gen.yaml', 'buf.build navy → lifted slate'],
	['buildkite', 'BADGE', 'buildkite.yaml', 'no brand → Material buildkite green'],
	['bundlemon', 'BADGE', '.bundlemonrc', 'no brand → light cyan'],
	['bundler', 'SILHOUETTE', 'Gemfile', 'brand #CC342D → #B8453C'],
	['bunfig', 'SILHOUETTE', 'bunfig.toml', 'bun family cream #E5D9C3 → #DCCCA6'],
	['capacitor', 'SILHOUETTE', 'capacitor.config.ts', 'brand #119EFF → #2E8FD0'],
	['cargo', 'SILHOUETTE', 'Cargo.toml', 'brand #CE422B → #B04A32'],
	['changie', 'BADGE', '.changie.yaml', 'no brand → dark olive gold'],
	['chromatic', 'BADGE', 'chromatic.config.json', 'brand spectrum magenta → #C44A96'],
	['circleci', 'SILHOUETTE', 'circle.yml', 'brand #343434 lifted → #A9AFB4'],
	['clangd', 'BADGE', '.clangd', 'C-family steel → neutral lane'],
	['cline', 'BADGE', '.clinerules', 'no brand → light steel'],
	['cloudflare', 'SILHOUETTE', 'wrangler.toml', 'brand #F38020 → #D9862F'],
	['cloudfoundry', 'BADGE', 'manifest.yml', 'brand cloud blue → pale steel'],
	['codacy', 'BADGE', '.codacy.yaml', 'brand teal → #63BFAE'],
	['codeclimate', 'BADGE', '.codeclimate.yml', 'no brand → slate green'],
	['codecov', 'SILHOUETTE', 'codecov.yaml', 'brand #F01F7A → #D24A8E'],
	['codemagic', 'BADGE', 'codemagic.yaml', 'no brand → steel (neutral lane)'],
	['coderabbit', 'SILHOUETTE', '.coderabbit.yaml', 'brand orange → #C9662E'],
	['coffeelint', 'SILHOUETTE', 'coffeelint.json', 'CoffeeScript brown → #A9825E'],
	['commitizen', 'BADGE', '.cz.json', 'commit-tool family green'],
	['commitlint', 'BADGE', '.commitlintrc', 'commit-tool family green (rhyme)'],
	['composer', 'BADGE', 'composer.json', 'brand #885630 → #A5714A'],
	['concourse', 'BADGE', 'concourse.yml', 'brand blue → slate (neutral lane)'],
	['conda', 'BADGE', '.condarc', 'brand #44A833 → #4E9E3E'],
	['container', 'SILHOUETTE', 'devcontainer-lock.json', 'devcontainer blue → #3E93C8'],
	['contentlayer', 'SILHOUETTE', 'contentlayer.config.ts', 'no brand → teal'],
	['context7', 'BADGE', 'context7.json', 'Upstash green → pale #9AD6C2'],
	['convex', 'BADGE', 'convex.json', 'brand convex red → #E27166'],
	['coveralls', 'BADGE', '.coveralls.yml', 'no brand → muted crimson'],
	['craco', 'BADGE', 'craco.config.js', 'CRA blue → pale steel (neutral lane)'],
	['crowdin', 'BADGE', 'crowdin.yml', 'brand green → light #9AD4AD'],
	['cspell', 'BADGE', '.cspell.config.js', 'brand blue → pale #A8CBE8'],
	['csscomb', 'SILHOUETTE', '.csscomb.json', 'CSS cyan → #35A3B8'],
	['csslint', 'BADGE', '.csslintrc', 'CSS blue → pale steel (neutral lane)'],
	['cursorrules', 'GLYPH', '.cursorrules', 'core cursor grey (family rhyme)'],
	['cvs', 'BADGE', '.cvsignore', 'no brand → light olive'],
	['darcs', 'BADGE', '.boringignore', 'no brand → deep violet'],
	['dartlang-ignore', 'SILHOUETTE', '.pubignore', 'Dart blue #35709E (family)'],
	['databricks', 'SILHOUETTE', 'databricks.yaml', 'brand #FF3621 → #D14A32'],
	['datadog', 'SILHOUETTE', 'datadog-ci.json', 'brand #632CA6 → #7E5CC4'],
	['dbt', 'BADGE', 'dbt_project.yml', 'brand dbt orange → #DB7742'],
	['dbt-bouncer', 'BADGE', 'dbt-bouncer.yml', 'dbt family orange (rhyme)'],
	['deepsource', 'BADGE', '.deepsource.toml', 'brand navy → slate (neutral lane)'],
	['denoify', 'BADGE', 'denoify.config.js', 'core deno #4FB88A (family rhyme)'],
	['dependabot', 'SILHOUETTE', 'dependabot.yml', 'brand #025E8C → #2E7898'],
	['dependencies', 'SILHOUETTE', 'dependencies.yml', 'no brand → steel blue'],
	['devcontainer', 'SILHOUETTE', 'devcontainer.json', 'devcontainer blue → #4E9ED0'],
	['devvit', 'SILHOUETTE', 'devvit.config.js', 'Reddit #FF4500 → #D2542E'],
	['direnv', 'BADGE', '.envrc', 'dotenv family yellow → #C4BC4E'],
	['dockertest', 'SILHOUETTE', 'docker-compose.test.yml', 'docker blue → #2E7CA8'],
	['dojo', 'BADGE', '.dojorc', 'no brand → sea grey (neutral lane)'],
	['doppler', 'BADGE', 'doppler.yaml', 'brand indigo → neutral lane'],
	['drizzle', 'BADGE', 'drizzle.config.dev.ts', 'brand #C5F74F → #B8D94A'],
	['drizzle-orm', 'SILHOUETTE', 'drizzle.config.ts', 'brand #C5F74F → #B8D94A'],
	['drone', 'SILHOUETTE', '.drone.yml', 'no brand → Material drone grey'],
	['eas-metadata', 'BADGE', 'store.config.json', 'core expo #68779E (family rhyme)'],
	['electron', 'SILHOUETTE', 'forge.config.ts', 'brand #47848F'],
	['eleventy', 'GLYPH', '.eleventy.js', 'no brand → warm grey (neutral lane)'],
	['esphome', 'SILHOUETTE', 'esphome.yaml', 'no brand → ESPHome light blue'],
	['fastly', 'SILHOUETTE', 'fastly.toml', 'brand fastly red → #C4413A'],
	['firebasehosting', 'SILHOUETTE', 'firebase.json', 'core firebase amber (family)'],
	['flareact', 'BADGE', 'flareact.config.js', 'Cloudflare amber → pale terracotta'],
	['fleet', 'BADGE', 'fleet.yaml', 'no brand → deep slate (neutral lane)'],
	['floobits', 'BADGE', '.flooignore', 'no brand → muted violet'],
	['flutter', 'SILHOUETTE', '.flutter-plugins', 'brand #02569B → #2E6E9E'],
	['flyio', 'SILHOUETTE', 'fly.toml', 'brand #24175B lifted → #6E5FB8'],
	['fnox', 'BADGE', '.fnox.toml', 'no brand → slate (neutral lane)'],
	['fossa', 'BADGE', '.fossaignore', 'brand teal → #189C7C'],
	['frontcommerce', 'BADGE', 'front-commerce.config.ts', 'no brand → dusty rose'],
	['funding', 'SILHOUETTE', 'funding.yml', 'sponsor heart pink → #D9628A'],
	['garden', 'SILHOUETTE', 'garden.yaml', 'no brand → garden green'],
	['gcloud', 'GLYPH', '.gcloudignore', 'brand #4285F4 → #6E9EE8'],
	['gemini', 'SILHOUETTE', 'gemini.md', 'Gemini blue-violet → #7E8FE0'],
	['github-sponsors', 'GLYPH', '.github/funding.yml', 'sponsor heart pink (outline, family)'],
	['gitpod', 'BADGE', '.gitpod.yml', 'brand #FFAE33 → pale #E8C48A'],
	['gleamconfig', 'BADGE', 'gleam.toml', 'Gleam pink #FFAFF3 → #E0A0D8'],
	['glide', 'BADGE', 'glide.yml', 'no brand → pale slate (neutral lane)'],
	['glitter', 'BADGE', '.glitterrc', 'no brand → pale violet'],
	['go-package', 'BADGE', 'go.mod', 'core go #2E88A0 (family rhyme)'],
	['go-work', 'BADGE', 'go.work', 'core go #2E88A0 (family rhyme)'],
	['graphql-config', 'SILHOUETTE', '.graphqlconfig', 'core graphql #C43E93 (family)'],
	['greenkeeper', 'BADGE', 'greenkeeper.json', 'brand green → #8CC46E']
];

const GROUPS = [
	['CI, release & automation', ['buildkite', 'changie', 'circleci', 'codemagic', 'commitizen',
		'commitlint', 'concourse', 'dependabot', 'drone', 'garden', 'gitpod']],
	['Quality, coverage & compliance', ['bundlemon', 'chromatic', 'codacy', 'codeclimate', 'codecov',
		'coderabbit', 'coffeelint', 'coveralls', 'cspell', 'csscomb', 'csslint', 'deepsource', 'fossa']],
	['Packages & dependencies', ['brunch', 'bundler', 'cargo', 'composer', 'conda', 'craco',
		'dependencies', 'gleamconfig', 'glide', 'go-package', 'go-work', 'greenkeeper']],
	['Build, bundle & framework config', ['bunfig', 'contentlayer', 'denoify', 'direnv', 'dojo',
		'drizzle', 'eleventy', 'flareact', 'frontcommerce', 'glitter']],
	['Containers, cloud & hosting', ['buf', 'cloudflare', 'cloudfoundry', 'container', 'datadog',
		'devcontainer', 'dockertest', 'doppler', 'esphome', 'fastly', 'firebasehosting', 'flyio',
		'fnox', 'gcloud']],
	['Data, ORM & schemas', ['context7', 'convex', 'crowdin', 'databricks', 'dbt', 'dbt-bouncer',
		'drizzle-orm', 'graphql-config']],
	['Apps & devices', ['capacitor', 'devvit', 'eas-metadata', 'electron', 'flutter', 'gemini']],
	['Editors, VCS & repo meta', ['clangd', 'cline', 'cursorrules', 'cvs', 'darcs', 'dartlang-ignore',
		'fleet', 'floobits', 'funding', 'github-sponsors']]
];

// core icons this slice shares a repo root with — the honest dedup test
const NEIGHBOURS = [
	['npm', 'package.json'], ['yaml', 'ci.yml'], ['toml', 'pyproject.toml'], ['docker', 'Dockerfile'],
	['eslint', '.eslintrc.json'], ['prettier', '.prettierrc'], ['git', '.gitignore'],
	['github-actions-workflow', 'ci.yaml'], ['editorconfig', '.editorconfig'], ['dotenv', '.env'],
	['lock', 'pnpm-lock.yaml'], ['tsconfig', 'tsconfig.json'], ['license', 'LICENSE'],
	['readme', 'README.md'], ['firebase', '.firebaserc'], ['go', 'main.go'], ['deno', 'deno.json'],
	['bun', 'bun.lockb'], ['expo', 'app.json'], ['cursor', '.cursor'], ['graphql', 'schema.graphql'],
	['dartlang', 'main.dart'], ['terraform', 'main.tf'], ['nginx', 'nginx.conf']
];

function load(id) {
	const file = join(ROOT, 'svg', 'file', `${id}.svg`);
	if (!existsSync(file)) { throw new Error(`missing ${file}`); }
	const src = readFileSync(file, 'utf8');
	return {
		id,
		inner: src.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, ''),
		bytes: Buffer.byteLength(src)
	};
}

const icons = ROSTER.map(([id, archetype, label, palette]) => ({ ...load(id), archetype, label, palette }));
const byId = new Map(icons.map(i => [i.id, i]));
const neighbours = NEIGHBOURS.filter(([id]) => existsSync(join(ROOT, 'svg', 'file', `${id}.svg`))).map(([id]) => load(id));

const defs = `<svg width="0" height="0" aria-hidden="true" style="position:absolute"><defs>
${[...icons, ...neighbours].map(i => `<symbol id="p-${i.id}" viewBox="0 0 16 16">${i.inner}</symbol>`).join('\n')}
</defs></svg>`;

const use = (id, s, alt) =>
	`<svg class="ico" width="${s}" height="${s}" role="img" aria-label="${esc(alt)}"><use href="#p-${id}"/></svg>`;

const GRID = icons.map(i => `<figure class="cell">${use(i.id, 16, `${i.id} 16px`)}<figcaption>${esc(i.id)}</figcaption></figure>`).join('');

const LADDER = icons.map(i => `
  <tr>
    <th scope="row"><span class="nm">${esc(i.id)}</span><span class="arch">${i.archetype}</span></th>
    <td>${use(i.id, 16, `${i.id} 16px`)}</td>
    <td>${use(i.id, 22, `${i.id} 22px`)}</td>
    <td class="rowcell"><span class="trow">${use(i.id, 16, '')}<span>${esc(i.label)}</span></span></td>
    <td>${use(i.id, 32, `${i.id} 32px`)}</td>
    <td>${use(i.id, 64, `${i.id} 64px`)}</td>
  </tr>`).join('');

const row = (id, label) => `<div class="row">${use(id, 16, '')}<span>${esc(label)}</span></div>`;
const tree = (head, rows) => `<div class="tree">
  <div class="treehead">${esc(head)}</div>
  ${rows.map(([id, label]) => row(id, label)).join('\n  ')}
</div>`;

const STRIPS = GROUPS.map(([name, ids]) =>
	tree(name, ids.map(id => [id, byId.get(id).label]))).join('');

// interleave the slice with the core config icons it will actually sit beside
const MIXED = [];
const flat = GROUPS.flatMap(([, ids]) => ids);
for (let i = 0; i < 26; i++) {
	MIXED.push([flat[i * 3 % flat.length], byId.get(flat[i * 3 % flat.length]).label]);
	if (NEIGHBOURS[i]) { MIXED.push(NEIGHBOURS[i]); }
}
const chunk = Math.ceil(MIXED.length / 3);
const MIX = [0, 1, 2].map(i =>
	tree(`a repo root — A09 interleaved with the core set (${i + 1}/3)`, MIXED.slice(i * chunk, (i + 1) * chunk))).join('');

const totalBytes = icons.reduce((a, i) => a + i.bytes, 0);
const counts = icons.reduce((m, i) => (m[i.archetype] = (m[i.archetype] || 0) + 1, m), {});

const TABLE = icons.map(i => `
  <tr>
    <td class="mono">${esc(i.id)}</td>
    <td class="mono">${i.archetype}</td>
    <td class="mono num">${i.bytes}</td>
    <td class="mono dim">${esc(i.palette)}</td>
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
     font-weight:600;margin:52px 0 6px}
  h2:first-of-type{margin-top:0}
  .lede{color:var(--dim);margin:0 0 22px;max-width:78ch}

  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));gap:4px;
        background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:14px}
  .cell{margin:0;display:flex;align-items:center;gap:8px;padding:7px 8px;border-radius:6px}
  .cell figcaption{font:11px/1.3 var(--mono);color:var(--dim);white-space:nowrap;
                   overflow:hidden;text-overflow:ellipsis}

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
        break-inside:avoid}
  .treehead{font:10px/1.4 var(--mono);color:var(--dim);letter-spacing:.08em;padding:6px 14px 12px;
            text-transform:uppercase}
  .tree .row{display:flex;align-items:center;gap:7px;padding:0 14px;height:22px}
  .tree .row span{font:13px/1 var(--sans);color:#CCCCCC;white-space:nowrap;
                  overflow:hidden;text-overflow:ellipsis}
  .strips{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;align-items:start}
  .mixwrap{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;align-items:start}
  .mixwrap .tree{grid-column:span 1}

  .mono{font:12px/1.5 var(--mono)}
  .dim{color:var(--dim)}
  .num{text-align:right}
  .ftable td{text-align:left;padding:8px 14px}
  .ftable td.num{text-align:right}
  tfoot td{border-top:1px solid var(--line);color:var(--dim);font:12px/1.5 var(--mono)}
</style>

${defs}

<div class="wrap">
<header>
  <h1>${esc(TITLE)} — contact sheet</h1>
  <p class="sub">84 config-domain long-tail concepts (ids <code>brunch</code>&nbsp;→&nbsp;<code>greenkeeper</code>),
  hand-authored to <code>spec.md</code> §11. No &lt;text&gt;, no font-family, no gradients, no external
  references: every letterform is an Inter&nbsp;Bold outline baked by <code>tools/letterpath.mjs</code>,
  ink-width-first and 41&nbsp;% low. Real marks where the mark survives 16&nbsp;px; letters are the
  fallback. R7 is clean inside the slice and against the core set; R8 is clean set-wide.</p>
  <div class="meta">
    <span class="tag">${icons.length} icons</span>
    <span class="tag">${counts.SILHOUETTE || 0} silhouette</span>
    <span class="tag">${counts.BADGE || 0} badge</span>
    <span class="tag">${counts.GLYPH || 0} glyph</span>
    <span class="tag">${totalBytes} bytes total</span>
    <span class="tag">avg ${Math.round(totalBytes / icons.length)} B</span>
    <span class="tag">max ${Math.max(...icons.map(i => i.bytes))} B</span>
    <span class="tag">bg #121314</span>
  </div>
</header>

<section>
  <h2>The slice at 16 px</h2>
  <p class="lede">The primary render, at the size the explorer actually paints.</p>
  <div class="grid">${GRID}</div>
</section>

<section>
  <h2>Explorer rows — 22 px rows, 16 px icons, real matched filenames</h2>
  <p class="lede">Grouped by what the tool does, which is how these files cluster in a repo.</p>
  <div class="strips">${STRIPS}</div>
</section>

<section>
  <h2>Mixed with the core set</h2>
  <p class="lede">The listing where a twin against an existing icon would show.</p>
  <div class="mixwrap">${MIX}</div>
</section>

<section>
  <h2>Size ladder</h2>
  <p class="lede">16 px is the target; the 22 px tree row is the real context; 32 and 64 only have to stay clean.</p>
  <table>
    <thead><tr><th>concept</th><th>16</th><th>22</th><th>tree row (22 px)</th><th>32</th><th>64</th></tr></thead>
    <tbody>${LADDER}</tbody>
  </table>
</section>

<section>
  <h2>Manifest</h2>
  <table class="ftable">
    <thead><tr><th>id</th><th>archetype</th><th class="num">bytes</th><th>colour source</th></tr></thead>
    <tbody>${TABLE}</tbody>
    <tfoot><tr><td colspan="2">${icons.length} icons</td><td class="num">${totalBytes}</td><td>—</td></tr></tfoot>
  </table>
</section>
</div>
`;

const out = join(ROOT, 'contact-A09.html');
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
	const probe = join(tmpdir(), `m11-contactA09-probe-${process.pid}.html`);
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
	const png = join(ROOT, 'contact-A09.png');
	const r = shoot(out, png);
	console.log(`${png}  (${r.width}x${r.height} css px at 2x, ${Buffer.byteLength(readFileSync(png))} bytes)`);
	console.log(`  renderer: ${r.bin}`);
}
