#!/usr/bin/env node
// contact-A07.mjs — the contact sheet for long-tail slice A07 (sequelize … vash).
//
//   node contact-A07.mjs          # -> contact-A07.html
//   node contact-A07.mjs --png    # also shoots contact-A07.png at 2x
//
// A thin, slice-local sibling of tools/contact.mjs: it does not touch the shared
// toolchain. Every icon is inlined once as an SVG <symbol> and referenced with <use>,
// so the page makes no external request. Three views: the 16 px grid (the primary
// render), 22 px explorer rows carrying real matched filenames grouped by domain, and
// the manifest footer that tools/make-set-manifest.mjs scrapes (id / archetype /
// bytes / colour source).

import { readFileSync, writeFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { homedir, tmpdir } from 'node:os';

const ROOT = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const TITLE = 'M11 long tail — slice A07';

// id, archetype, an example matched filename, domain group, colour source
const ROSTER = [
	["sequelize", "SILHOUETTE", ".sequelizerc", "data & markup", "brand #52B0E7 → #4E9BD1"],
	["shader", "SILHOUETTE", "water.frag", "shaders & 3D", "no brand → #A87BC4 (vsicons shader violet)"],
	["shaderlab", "BADGE", "Toon.shader", "shaders & 3D", "no brand → #5E6B78 (Unity slate, neutral lane)"],
	["shellcheck", "GLYPH", ".shellcheckrc", "testing & QA", "no brand → #7E9E6E (shell green, dimmed off canon shell; neutral lane)"],
	["signalstore", "GLYPH", "todos.store.ts", "front-end & UI", "no brand → #B871C9 (NgRx magenta-violet, lifted for 16 px contrast)"],
	["silverstripe", "SILHOUETTE", "Page.ss", "PHP & CMS", "no brand → #B4BAC0 (the silver in the name)"],
	["simulink", "SILHOUETTE", "plant.slx", "science & maths", "no brand → #4C93B5 (Simulink block blue)"],
	["singularity", "SILHOUETTE", "Singularity.def", "infra & ops", "no brand → #9AA3B8 (HPC slate)"],
	["sino", "BADGE", "main.sn", "small languages", "no brand → #6E7A98 (neutral lane)"],
	["siyuan", "BADGE", "note.sy", "notes & docs", "no brand → #C88A80 (SiYuan terracotta, lifted clear of canon npm)"],
	["skipper", "SILHOUETTE", "routes.eskip", "infra & ops", "no brand → #4E9AA8"],
	["slang", "BADGE", "lighting.slang", "shaders & 3D", "no brand → #7A6E96 (shader violet, neutral lane)"],
	["slice", "SILHOUETTE", "Chat.ice", "small languages", "no brand → #6FB2CE (ice blue)"],
	["slim", "BADGE", "index.slim", "templates", "no brand → #9E6E62 (Ruby-adjacent brick, neutral lane)"],
	["slint", "SILHOUETTE", "app.slint", "front-end & UI", "no brand → #5B84C9 (Slint blue)"],
	["sln", "SILHOUETTE", "App.sln", ".NET & Windows", "no brand → #9670C8 (Visual Studio purple, lifted to carry the 2.2 px rings)"],
	["smarty", "SILHOUETTE", "header.tpl", "templates", "no brand → #D0A83F"],
	["sml", "BADGE", "main.sml", "small languages", "no brand → #6E6493 (ML family violet, neutral lane)"],
	["snakemake", "BADGE", "Snakefile", "science & maths", "no brand → #5E8E62 (Snakemake green, neutral lane)"],
	["snort", "SILHOUETTE", "local.snort", "infra & ops", "no brand → #D07E93 (the Snort pig)"],
	["sonarcloud", "SILHOUETTE", "sonar-project.properties", "infra & ops", "brand #F3702A → #DE7038"],
	["source", "BADGE", "MainWindow.xaml", "data & markup", "no brand → #6E7E92 (neutral lane)"],
	["spacengine", "SILHOUETTE", "system.spe", "shaders & 3D", "no brand → #6E7FC4"],
	["sparql", "BADGE", "people.rq", "data & markup", "no brand → #5E7E94 (neutral lane)"],
	["spwn", "BADGE", "level.spwn", "small languages", "no brand → #8E6E8E (neutral lane)"],
	["sqf", "BADGE", "init.sqf", "small languages", "no brand → #7E8466 (neutral lane)"],
	["squirrel", "SILHOUETTE", "main.nut", "small languages", "no brand → #A9793F (acorn brown)"],
	["sss", "BADGE", "style.sss", "CSS family", "no brand → #B58A4E (SugarSS amber)"],
	["sst", "BADGE", "sst.config.ts", "infra & ops", "no brand → #96667E (neutral lane)"],
	["stan", "SILHOUETTE", "model.stan", "science & maths", "no brand → #B5564E (Stan red)"],
	["stata", "BADGE", "analysis.do", "science & maths", "no brand → #5E6E8E (Stata navy, neutral lane)"],
	["stencil", "SILHOUETTE", "my-comp.stencil", "front-end & UI", "no brand → #7A77D4 (Stencil indigo, lifted for 16 px contrast)"],
	["storyboard", "SILHOUETTE", "Main.storyboard", "front-end & UI", "no brand → #7E93C9 (Xcode blue)"],
	["stryker", "GLYPH", "stryker.conf.json", "testing & QA", "no brand → #C08D82 (Stryker brick, lifted for 16 px contrast)"],
	["sty", "BADGE", "thesis.sty", "notes & docs", "no brand → #7E6FA8 (neutral lane)"],
	["stylable", "SILHOUETTE", "button.st.css", "CSS family", "no brand → #6EA8D4 (Stylable blue)"],
	["styled", "BADGE", "Button.styled", "CSS family", "no brand → #A87A94 (styled-components mauve, neutral lane)"],
	["stylus", "SILHOUETTE", "main.styl", "CSS family", "brand #333333 → #AEB4BA (lifted per §6.3)"],
	["svelte-js", "SILHOUETTE", "store.svelte.js", "front-end & UI", "canon svelte #B15B25 + js #E8D44D chip (R3 family)"],
	["svelte-ts", "SILHOUETTE", "store.svelte.ts", "front-end & UI", "canon svelte #B15B25 + ts #3178C6 chip (R3 family)"],
	["sway", "BADGE", "main.sw", "small languages", "no brand → #5E8C7E (neutral lane)"],
	["swig", "BADGE", "page.swig", "templates", "no brand → #8E7E5E (neutral lane)"],
	["symfony", "SILHOUETTE", "symfony.lock", "PHP & CMS", "brand #000000 → #C6CACE (lifted per §6.3)"],
	["systemverilog", "SILHOUETTE", "alu.sv", "science & maths", "no brand → #6E93B5 (silicon blue)"],
	["t4tt", "BADGE", "Model.tt", ".NET & Windows", "no brand → #6B5E8C (neutral lane)"],
	["tamagui", "BADGE", "tamagui.config.ts", "front-end & UI", "no brand → #9E6E68 (Tamagui rust, neutral lane)"],
	["tape", "SILHOUETTE", "index.tape", "testing & QA", "no brand → #B9A98C (cassette tan)"],
	["tarkine", "BADGE", "view.tark", "small languages", "no brand → #6E8E8E (neutral lane)"],
	["tcl", "SILHOUETTE", "build.tcl", "small languages", "no brand → #8296B0 (Tcl feather slate)"],
	["teal", "BADGE", "main.tl", "small languages", "no brand → #5A8F8F (neutral lane)"],
	["templ", "BADGE", "page.templ", "templates", "no brand → #6E8F7E (Go-adjacent, neutral lane)"],
	["tera", "BADGE", "index.tera", "templates", "no brand → #9E7A62 (Rust-adjacent, neutral lane)"],
	["test-jsx", "SILHOUETTE", "Button.spec.tsx", "testing & QA", "react #61DAFB → #46B5D1 (R3 family with testjs / testts)"],
	["testplane", "SILHOUETTE", "testplane.conf.ts", "testing & QA", "no brand → #5FA0C4"],
	["thinkscript", "SILHOUETTE", "strategy.tosts", "science & maths", "no brand → #4FA07E (ticker green)"],
	["tilt", "SILHOUETTE", "Tiltfile", "infra & ops", "no brand → #4FAF8F (Tilt green)"],
	["tldraw", "SILHOUETTE", "sketch.tldr", "notes & docs", "brand #000000 → #CFCCC8 (lifted per §6.3)"],
	["tm", "BADGE", "stack.tm.hcl", "infra & ops", "no brand → #7A8296 (Terramate slate, neutral lane)"],
	["tobi", "BADGE", "app.tobi", "small languages", "no brand → #6E8E6E (neutral lane)"],
	["toit", "BADGE", "main.toit", "small languages", "no brand → #8E8E5E (neutral lane)"],
	["toon", "BADGE", "data.toon", "data & markup", "no brand → #8A7E9E (neutral lane)"],
	["tree", "SILHOUETTE", "layout.tree", "data & markup", "no brand → #6FA37C"],
	["tres", "SILHOUETTE", "material.tres", "shaders & 3D", "godot #478CBF → #4A8CB8 (family with tscn)"],
	["tsbuildinfo", "SILHOUETTE", "tsconfig.tsbuildinfo", "front-end & UI", "ts #3178C6 lifted → #6E9CC9 (derived-artifact tone)"],
	["tscn", "SILHOUETTE", "level.tscn", "shaders & 3D", "godot #478CBF → #4A8CB8 (family with tres)"],
	["tsil", "BADGE", "main.ц", "small languages", "no brand → #8E6E7E (neutral lane)"],
	["tt", "BADGE", "page.tt2", "templates", "no brand → #6E7A9E (Perl-adjacent, neutral lane)"],
	["ttcn", "BADGE", "suite.ttcn3", "testing & QA", "no brand → #6E8E9E (neutral lane)"],
	["tuc", "BADGE", "flow.tuc", "small languages", "no brand → #8E7E6E (neutral lane)"],
	["twig", "SILHOUETTE", "base.html.twig", "templates", "brand #78C043 → #86B25A"],
	["twine", "SILHOUETTE", "story.twee", "notes & docs", "no brand → #4CA391"],
	["typo3", "GLYPH", "setup.typoscript", "PHP & CMS", "brand #FF8700 → #DE7F35"],
	["typst", "SILHOUETTE", "paper.typ", "notes & docs", "brand #239DAD → #3FA2AF"],
	["uiua", "BADGE", "main.ua", "small languages", "no brand → #7E8E6E (neutral lane)"],
	["unison", "BADGE", "scratch.u", "small languages", "no brand → #6E6E9E (neutral lane)"],
	["unity", "SILHOUETTE", "Scene.unity", "shaders & 3D", "brand #000000 → #C9CDD2 (lifted per §6.3)"],
	["url", "SILHOUETTE", "docs.url", "data & markup", "no brand → #6E93C4"],
	["uv", "GLYPH", "uv.lock", "infra & ops", "no brand → #A97BD1 (uv violet, lifted for 16 px contrast)"],
	["vala", "SILHOUETTE", "window.vala", "small languages", "no brand → #7E6BC8 (Vala violet)"],
	["valgrind", "SILHOUETTE", "leaks.supp", "testing & QA", "no brand → #8E7EA8 (Valgrind violet-grey)"],
	["vanilla-extract", "SILHOUETTE", "theme.css.ts", "CSS family", "no brand → #D5C08E (vanilla cream)"],
	["vapi", "BADGE", "gtk+-3.0.vapi", "small languages", "no brand → #8272A0 (Vala-adjacent, neutral lane)"],
	["varnish", "SILHOUETTE", "default.vcl", "infra & ops", "no brand → #C4553F (Varnish red)"],
	["vash", "BADGE", "index.vash", "templates", "no brand → #7E7A8E (neutral lane)"]
];

const GROUPS = ['front-end & UI', 'CSS family', 'templates', 'shaders & 3D', 'testing & QA',
	'infra & ops', 'science & maths', 'data & markup', 'PHP & CMS', '.NET & Windows',
	'notes & docs', 'small languages'];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const icons = ROSTER.map(([id, archetype, file, group, palette]) => {
	const p = join(ROOT, 'svg', 'file', `${id}.svg`);
	if (!existsSync(p)) { throw new Error(`missing ${p}`); }
	const src = readFileSync(p, 'utf8');
	return {
		id, archetype, file, group, palette,
		inner: src.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, ''),
		bytes: Buffer.byteLength(src)
	};
});
const byId = new Map(icons.map(i => [i.id, i]));

const defs = `<svg width="0" height="0" aria-hidden="true" style="position:absolute"><defs>
${icons.map(i => `<symbol id="a-${i.id}" viewBox="0 0 16 16">${i.inner}</symbol>`).join('\n')}
</defs></svg>`;

const use = (id, s, alt = '') =>
	`<svg class="ico" width="${s}" height="${s}" role="img" aria-label="${esc(alt)}"><use href="#a-${id}"/></svg>`;

const GRID = icons.map(i => `<figure class="cell">${use(i.id, 16, i.id)}
    <figcaption>${esc(i.id)}<span>${i.archetype[0] + i.archetype.slice(1).toLowerCase()}</span></figcaption></figure>`).join('\n  ');

const strip = (group, bg) => {
	const rows = icons.filter(i => i.group === group);
	return `<div class="tree"${bg ? ` style="background:${bg}"` : ''}>
    <div class="treehead">${esc(group)} · ${rows.length}</div>
    ${rows.map(i => `<div class="row">${use(i.id, 16)}<span>${esc(i.file)}</span></div>`).join('\n    ')}
  </div>`;
};
const TREES = GROUPS.map(g => strip(g)).join('\n  ');
const DARKER = GROUPS.slice(0, 4).map(g => strip(g, '#1E1E1E')).join('\n  ');

const totalBytes = icons.reduce((a, i) => a + i.bytes, 0);
const counts = icons.reduce((a, i) => { a[i.archetype] = (a[i.archetype] || 0) + 1; return a; }, {});

const TABLE = icons.map(i => `<tr>
    <td class="mono">${esc(i.id)}</td>
    <td class="mono dim">svg/file/${esc(i.id)}.svg</td>
    <td class="mono">${i.archetype}</td>
    <td class="mono num">${i.bytes}</td>
    <td class="mono dim">${esc(i.palette)}</td>
  </tr>`).join('\n  ');

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
  .sub{color:var(--dim);max-width:76ch;margin:0 0 20px}
  .meta{display:flex;flex-wrap:wrap;gap:8px}
  .tag{font:11px/1 var(--mono);color:var(--dim);border:1px solid var(--line);
       border-radius:999px;padding:6px 10px;background:var(--bg2)}
  h2{font-size:12px;letter-spacing:.13em;text-transform:uppercase;color:var(--dim);
     font-weight:600;margin:52px 0 6px}
  h2:first-of-type{margin-top:0}
  .lede{color:var(--dim);margin:0 0 22px;max-width:80ch}

  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));gap:2px;
        background:var(--line);border:1px solid var(--line);border-radius:10px;overflow:hidden}
  .cell{margin:0;background:var(--panel);padding:14px 6px 11px;text-align:center}
  .cell figcaption{font:10px/1.5 var(--mono);color:var(--dim);margin-top:9px;
                   word-break:break-all}
  .cell figcaption span{display:block;color:#5C6163;letter-spacing:.05em}
  .ico{display:inline-block;vertical-align:middle;image-rendering:auto}

  .strips{display:grid;grid-template-columns:repeat(auto-fill,minmax(268px,1fr));gap:18px;align-items:start}
  .tree{border:1px solid var(--line);border-radius:10px;padding:8px 0 12px;background:var(--bg)}
  .treehead{font:10px/1 var(--mono);color:var(--dim);letter-spacing:.08em;padding:8px 14px 12px;
            text-transform:uppercase}
  .tree .row{display:flex;align-items:center;gap:7px;padding:0 14px;height:22px}
  .tree .row span{font:13px/1 var(--sans);color:#CCCCCC;white-space:nowrap;overflow:hidden;
                  text-overflow:ellipsis}

  table{border-collapse:collapse;width:100%;background:var(--panel);
        border:1px solid var(--line);border-radius:10px;overflow:hidden}
  thead th{font:11px/1.4 var(--mono);text-transform:uppercase;letter-spacing:.08em;color:var(--dim);
           text-align:left;padding:12px 14px;border-bottom:1px solid var(--line);font-weight:500}
  td{padding:8px 14px;vertical-align:middle}
  tbody tr+tr td{border-top:1px solid var(--line)}
  .mono{font:12px/1.5 var(--mono)}
  .dim{color:var(--dim)}
  .num,th.num{text-align:right}
  tfoot td{border-top:1px solid var(--line);color:var(--dim);font:12px/1.5 var(--mono)}
</style>

${defs}

<div class="wrap">
<header>
  <h1>${esc(TITLE)} — contact sheet</h1>
  <p class="sub">84 hand-authored icons for the D20 amendment-2 full-coverage wave, spec.md §11.
  No &lt;text&gt;, no font-family, no gradients, no external references: every letterform is an
  Inter&nbsp;Bold outline baked by tools/letterpath.mjs, sized ink-width-first (R5) and set
  41&nbsp;% low on the plate. Real marks wherever they survive the 16&nbsp;px proof; letters are
  the fallback for the concepts that carry no mark of their own.</p>
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
  <h2>16 px grid</h2>
  <p class="lede">The primary render, at 1:1. Anything that does not read here does not ship.</p>
  <div class="grid">
  ${GRID}
  </div>
</section>

<section>
  <h2>Explorer rows — 22 px, real matched filenames</h2>
  <p class="lede">The real usage context: 22&nbsp;px rows, 16&nbsp;px icons, grouped by the domain
  the concepts actually co-occur in. R7 is judged inside these groups, where two files really do
  sit in one directory.</p>
  <div class="strips">
  ${TREES}
  </div>
</section>

<section>
  <h2>On #1E1E1E</h2>
  <p class="lede">The same rows on the lighter editor background, as a value check.</p>
  <div class="strips">
  ${DARKER}
  </div>
</section>

<section>
  <h2>Manifest</h2>
  <table class="ftable">
    <thead><tr><th>id</th><th>path</th><th>archetype</th><th class="num">bytes</th><th>colour source</th></tr></thead>
    <tbody>
  ${TABLE}
    </tbody>
    <tfoot><tr><td colspan="3">${icons.length} icons — slice A07</td><td class="num">${totalBytes}</td><td>—</td></tr></tfoot>
  </table>
</section>
</div>
`;

const out = join(ROOT, 'contact-A07.html');
writeFileSync(out, html, 'utf8');
console.log(`${out}  (${Buffer.byteLength(html)} bytes, ${icons.length} icons, ${totalBytes} icon bytes)`);

// ---- optional 2x screenshot -------------------------------------------------
const WIDTH = 1240;

function chromium() {
	const cache = join(homedir(), 'Library/Caches/ms-playwright');
	const builds = readdirSync(cache).filter(d => /^chromium-\d+$/.test(d))
		.sort((a, b) => +b.split('-')[1] - +a.split('-')[1]);
	for (const b of builds) {
		const macos = join(cache, b, 'chrome-mac-arm64');
		for (const app of readdirSync(macos).filter(fn => fn.endsWith('.app'))) {
			const bin = join(macos, app, 'Contents/MacOS', app.replace(/\.app$/, ''));
			if (existsSync(bin)) { return bin; }
		}
	}
	throw new Error(`no Playwright chromium under ${cache}`);
}

const COMMON = ['--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
	'--allow-file-access-from-files', '--virtual-time-budget=8000'];

if (argv.includes('--png')) {
	const bin = chromium();
	const probe = join(tmpdir(), `a07-contact-probe-${process.pid}.html`);
	writeFileSync(probe, `<!doctype html><body style="margin:0"><pre id="o"></pre>`
		+ `<iframe id="f" src="file://${out}" style="width:${WIDTH}px;height:400px;border:0"></iframe>`
		+ `<script>f.onload=()=>{document.getElementById('o').textContent='PAGEHEIGHT='+f.contentDocument.documentElement.scrollHeight}</script>`);
	const dom = execFileSync(bin, [...COMMON, `--window-size=${WIDTH + 200},600`, '--dump-dom', `file://${probe}`],
		{ encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
	rmSync(probe, { force: true });
	const m = /PAGEHEIGHT=(\d+)/.exec(dom);
	if (!m) { throw new Error('could not measure the page height'); }
	const png = join(ROOT, 'contact-A07.png');
	execFileSync(bin, [...COMMON, '--force-device-scale-factor=2', '--default-background-color=121314ff',
		`--window-size=${WIDTH},${m[1]}`, `--screenshot=${png}`, `file://${out}`],
		{ stdio: ['ignore', 'ignore', 'ignore'] });
	console.log(`${png}  (${WIDTH}x${m[1]} css px at 2x, ${Buffer.byteLength(readFileSync(png))} bytes)`);
	console.log(`  renderer: ${bin}`);
}
