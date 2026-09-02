#!/usr/bin/env node
// contact-A04.mjs — contact sheet for long-tail slice A04 (M11, D20 amendment 2).
//
//   node contact-A04.mjs          # -> contact-A04.html
//   node contact-A04.mjs --png    # also shoots contact-A04.png at 2x
//
// tools/contact.mjs carries a hard-coded batch-1 roster, so this slice ships its own
// thin sheet rather than modifying the shared tool. Same rules: every icon is inlined
// once as an SVG <symbol>, the page makes no external request, and the screenshot runs
// on the Playwright chromium under ~/Library/Caches/ms-playwright.
//
// Tree-row labels are real matched filenames, taken from the slice's matchers in
// longtail-worklist.json.

import { readFileSync, writeFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { homedir, tmpdir } from 'node:os';

const ROOT = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const SLICE = 'A04';
const TITLE = 'M11 long tail — slice A04';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// id -> [archetype, matched filename, colour source, group]
const ROSTER = [
	['jinja', 'BADGE', 'page.html.j2', 'no brand → jinja red #B0483C', 'markup'],
	['jsbeautify', 'SILHOUETTE', '.jsbeautifyrc', 'no brand → #BE9068', 'tooling'],
	['jscpd', 'SILHOUETTE', '.jscpd.json', 'no brand → #8F86C0', 'tooling'],
	['jsmap', 'SILHOUETTE', 'bundle.js.map', 'js gold, map family → #D8C05A', 'assets'],
	['jsonnet', 'GLYPH', 'config.jsonnet', 'json family form, green → #5FC46E', 'lang'],
	['jsp', 'BADGE', 'index.jsp', 'java family amber → #B87A26', 'lang'],
	['jss', 'BADGE', 'styles.jss', 'no brand → #C46FA8 (sass rhyme)', 'markup'],
	['juice', 'SILHOUETTE', 'email.juice', 'no brand → #C2565E', 'assets'],
	['just', 'BADGE', 'justfile', 'no brand → #6FB56C', 'tooling'],
	['k', 'BADGE', 'trades.k', 'no brand → #9B8B4A', 'lang'],
	['karma', 'SILHOUETTE', 'karma.conf.js', 'no brand → #4CA890', 'tooling'],
	['kcl', 'BADGE', 'kcl.mod', 'no brand → #A64A78', 'lang'],
	['keystone', 'SILHOUETTE', 'keystone.ts', 'no brand → #4AA396', 'tooling'],
	['kivy', 'SILHOUETTE', 'app.kv', 'no brand → neutral #7EA07A', 'lang'],
	['kl', 'BADGE', 'solver.kl', 'no brand → neutral #7E8894', 'lang'],
	['knex', 'SILHOUETTE', 'knexfile.js', 'no brand → #C4823C', 'tooling'],
	['knip', 'SILHOUETTE', '.knip.json', 'no brand → neutral #9AA8B4', 'tooling'],
	['kos', 'SILHOUETTE', 'launch.ks', 'no brand → #8FA6C4', 'lang'],
	['kusto', 'BADGE', 'queries.kql', 'azure data explorer blue → #3A6FB8', 'lang'],
	['label', 'SILHOUETTE', '.github/labeler.yml', 'no brand → #4FA0B8', 'tooling'],
	['laravel', 'SILHOUETTE', 'welcome.blade.php', 'brand #FF2D20 matted → #E04A3C', 'tooling'],
	['lark', 'SILHOUETTE', 'grammar.lark', 'no brand → #7FA6CE', 'assets'],
	['latex', 'BADGE', 'thesis.latex', 'tex family teal → #61BAB5', 'markup'],
	['latex-class', 'BADGE', 'article.cls', 'tex family teal → #61BAB5', 'markup'],
	['latex-package', 'BADGE', 'mystyle.sty', 'tex family teal → #61BAB5', 'markup'],
	['latexmk', 'GLYPH', '.latexmkrc', 'tex family teal → #61BAB5', 'markup'],
	['latino', 'BADGE', 'hola.lat', 'no brand → #BE6FC8', 'lang'],
	['lbx', 'BADGE', 'spanish.lbx', 'tex family teal → #61BAB5', 'markup'],
	['lean', 'GLYPH', 'Basic.lean', 'no brand → #A87FC0', 'lang'],
	['leanconfig', 'GLYPH', 'lakefile.lean', 'lean family violet → #9878B8', 'tooling'],
	['lefthook', 'SILHOUETTE', 'lefthook.yml', 'no brand → #C25A62', 'tooling'],
	['lemon', 'SILHOUETTE', 'parser.lemon', 'no brand → lemon #D8C24E', 'lang'],
	['less', 'BADGE', 'styles.less', 'brand #1D365D lifted → #2F4E7E', 'markup'],
	['lex', 'BADGE', 'scanner.flex', 'no brand → #6E9E3E', 'lang'],
	['libreoffice-base', 'SILHOUETTE', 'contacts.odb', 'LibreOffice module palette → #8A62B0', 'assets'],
	['libreoffice-draw', 'SILHOUETTE', 'diagram.odg', 'LibreOffice module palette → #C9A33E', 'assets'],
	['libreoffice-impress', 'SILHOUETTE', 'deck.odp', 'LibreOffice module palette → #D08344', 'assets'],
	['lighthouse', 'SILHOUETTE', '.lighthouserc.json', 'lighthouse orange → #DE9048', 'tooling'],
	['lilypond', 'GLYPH', 'score.ly', 'no brand → parchment #CFC3A8', 'markup'],
	['lime', 'SILHOUETTE', 'project.hxp', 'no brand → lime #8FBF4E', 'lang'],
	['liquid', 'SILHOUETTE', 'product.liquid', 'shopify liquid green → #6FAE5A', 'markup'],
	['lisp', 'GLYPH', 'core.lisp', 'brand #3FB68B matted → #46A98A', 'lang'],
	['lit', 'BADGE', 'counter.lit.ts', 'lit blue → #5E97DC', 'markup'],
	['livescript', 'BADGE', 'app.ls', 'no brand → neutral #6E8090', 'lang'],
	['lnk', 'GLYPH', 'Shortcut.lnk', 'no brand → neutral #93A0AE', 'assets'],
	['locale', 'SILHOUETTE', 'Localizable.strings', 'no brand → #5FA0C0', 'markup'],
	['lolcode', 'SILHOUETTE', 'hai.lol', 'no brand → #D0A05A', 'lang'],
	['lsl', 'BADGE', 'door.lsl', 'no brand → neutral #98A0A8', 'lang'],
	['luau', 'SILHOUETTE', 'init.luau', 'lua family form, luau blue → #4A9ED8', 'lang'],
	['lync', 'SILHOUETTE', 'meeting.crec', 'no brand → #4A8FC8', 'assets'],
	['lyric', 'SILHOUETTE', 'song.lrc', 'no brand → #B98BC4', 'assets'],
	['macaulay2', 'BADGE', 'ideals.m2', 'no brand → #7A4890', 'lang'],
	['manifest-bak', 'SILHOUETTE', 'manifest.bak', 'no brand → neutral #808C98', 'assets'],
	['manifest-skip', 'SILHOUETTE', 'manifest.skip', 'no brand → neutral #808C98', 'assets'],
	['map', 'SILHOUETTE', 'styles.css.map', 'no brand → neutral #93A0AE, map family', 'assets'],
	['marko', 'SILHOUETTE', 'index.marko', 'no brand → marko blue #3E8FC0', 'markup'],
	['markojs', 'SILHOUETTE', 'index.marko.js', 'marko family (same concept) → #3E8FC0', 'markup'],
	['master-co', 'SILHOUETTE', 'master.css.ts', 'no brand → #C9A03E', 'markup'],
	['mathematica', 'SILHOUETTE', 'analysis.nb', 'wolfram red #DD1100 matted → #C24A38', 'lang'],
	['maxscript', 'SILHOUETTE', 'rig.ms', 'no brand → #7CACB6', 'lang'],
	['maya', 'BADGE', 'shelf.mel', 'no brand → #2F8C74', 'lang'],
	['mdsvex', 'BADGE', 'post.svx', 'svelte family orange → #B85E2E', 'markup'],
	['mdx-components', 'SILHOUETTE', 'mdx-components.tsx', 'mdx family violet → #7A52C8', 'markup'],
	['mediawiki', 'BADGE', 'Page.mediawiki', 'no brand → wiki olive #C8C664', 'markup'],
	['mercurial', 'BADGE', '.hgignore', 'no brand → mercury blue-grey #6E8AA8', 'tooling'],
	['merlin', 'SILHOUETTE', '.merlin', 'ocaml family amber → #C08A3E', 'tooling'],
	['meson', 'SILHOUETTE', 'meson.build', 'no brand → neutral #7E8C9A', 'tooling'],
	['metal', 'SILHOUETTE', 'shaders.metal', 'no brand → neutral #8C98A8', 'lang'],
	['metro', 'SILHOUETTE', 'metro.config.js', 'no brand → #B85E4E', 'tooling'],
	['minecraft', 'SILHOUETTE', 'tick.mcfunction', 'minecraft creeper green → #6FA05B', 'lang'],
	['mint', 'SILHOUETTE', 'Main.mint', 'no brand → mint #5FB08A', 'lang'],
	['mist', 'SILHOUETTE', 'view.mist.ts', 'no brand → neutral #A6AEB6', 'assets'],
	['mivascript', 'BADGE', 'store.mv', 'no brand → neutral #86909C', 'lang'],
	['mjml', 'SILHOUETTE', 'welcome.mjml', 'mjml coral → #DB6350', 'markup'],
	['mlang', 'GLYPH', 'Transform.pq', 'power query brass → #BCAA72', 'lang'],
	['mocha', 'SILHOUETTE', '.mocharc.json', 'brand #8D6748', 'tooling'],
	['modernizr', 'BADGE', '.modernizrrc', 'no brand → neutral plum #6E4462', 'tooling'],
	['modernjs', 'BADGE', 'modern.config.ts', 'no brand → #534CB8', 'tooling'],
	['mojo', 'GLYPH', 'matmul.mojo', 'mojo fire orange → #DE6B3C', 'lang'],
	['mojolicious', 'GLYPH', 'layout.html.ep', 'no brand → #7E8FD0', 'tooling'],
	['moleculer', 'GLYPH', 'moleculer.config.js', 'no brand → #4FA36E', 'tooling'],
	['mongo', 'SILHOUETTE', 'seed.mongo', 'brand #47A248 matted → #4FA050', 'tooling'],
	['moonscript', 'SILHOUETTE', 'app.moon', 'no brand → neutral #A6ADB8', 'lang'],
	['mrpack', 'SILHOUETTE', 'modpack.mrpack', 'modrinth green → #4FB06E', 'tooling']
];

const GROUPS = [
	['lang', 'src/ — languages &amp; dialects'],
	['markup', 'views/ — templates, markup &amp; styling'],
	['tooling', 'repo root — build, test &amp; tooling'],
	['assets', 'assets/ — data, media &amp; platform']
];

// R7 pairs tolerated under §11.3 (different domain family): mine beside the core icon.
const TOLERATED = [
	['jinja', 'npm', 'BADGE red — template lang vs package manager'],
	['jinja', 'rust', 'BADGE red — template lang vs systems lang'],
	['kusto', 'typescript', 'BADGE blue — KQL query vs TS source'],
	['less', 'cpp', 'BADGE navy — CSS preprocessor vs C++'],
	['less', 'perl', 'BADGE navy — CSS preprocessor vs perl'],
	['lit', 'powershell', 'BADGE blue — web components vs shell'],
	['maya', 'sqlite', 'BADGE teal — 3D scripting vs database'],
	['mdsvex', 'rust', 'BADGE orange — svelte markdown vs systems lang'],
	['mojo', 'git', 'GLYPH orange — flame vs branch'],
	['mojo', 'jupyter', 'GLYPH orange — flame vs orbit'],
	['lisp', 'cypress', 'GLYPH green — brandColor #3FB68B mandated by §11.2'],
	['lisp', 'assembly', 'GLYPH green — brandColor #3FB68B mandated by §11.2'],
	['latexmk', 'tex', 'GLYPH teal — declared tex family (R3), deliberate']
];

const CORE_IDS = [...new Set(TOLERATED.map(t => t[1]))];

const load = (id) => {
	const file = join(ROOT, 'svg', 'file', `${id}.svg`);
	if (!existsSync(file)) { throw new Error(`missing ${file}`); }
	const src = readFileSync(file, 'utf8');
	return {
		inner: src.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, ''),
		bytes: Buffer.byteLength(src)
	};
};

const icons = ROSTER.map(([id, archetype, label, palette, group]) => {
	const { inner, bytes } = load(id);
	return { id, archetype, label, palette, group, inner, bytes };
});
const core = CORE_IDS.map(id => ({ id, ...load(id) }));

const defs = `<svg width="0" height="0" aria-hidden="true" style="position:absolute"><defs>
${icons.map(i => `<symbol id="p-${i.id}" viewBox="0 0 16 16">${i.inner}</symbol>`).join('\n')}
${core.map(i => `<symbol id="c-${i.id}" viewBox="0 0 16 16">${i.inner}</symbol>`).join('\n')}
</defs></svg>`;

const use = (pfx, id, s, alt) =>
	`<svg class="ico" width="${s}" height="${s}" role="img" aria-label="${esc(alt)}"><use href="#${pfx}-${id}"/></svg>`;

const ARCHES = ['BADGE', 'GLYPH', 'SILHOUETTE'];
const ladder = ARCHES.map(a => {
	const rows = icons.filter(i => i.archetype === a).map(i => `
  <tr>
    <th scope="row"><span class="nm">${esc(i.id)}</span><span class="arch">${i.palette.replace(/^.*→\s*/, '')}</span></th>
    <td>${use('p', i.id, 16, `${i.id} 16px`)}</td>
    <td>${use('p', i.id, 22, `${i.id} 22px`)}</td>
    <td class="rowcell"><span class="trow">${use('p', i.id, 16, '')}<span>${esc(i.label)}</span></span></td>
    <td>${use('p', i.id, 32, `${i.id} 32px`)}</td>
    <td>${use('p', i.id, 64, `${i.id} 64px`)}</td>
  </tr>`).join('');
	return `<h3>${a} — ${icons.filter(i => i.archetype === a).length}</h3>
  <table>
    <thead><tr><th>concept</th><th>16</th><th>22</th><th>tree row (22 px)</th><th>32</th><th>64</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}).join('\n');

const trees = GROUPS.map(([g, title]) => {
	const rows = icons.filter(i => i.group === g);
	return `<div class="tree">
    <div class="treehead">${title} · ${rows.length}</div>
    ${rows.map(i => `<div class="row">${use('p', i.id, 16, '')}<span>${esc(i.label)}</span></div>`).join('\n    ')}
  </div>`;
}).join('\n');

const tolerated = TOLERATED.map(([mine, coreId, why]) => `
  <tr>
    <td class="mono">${esc(mine)}</td>
    <td>${use('p', mine, 16, '')} ${use('p', mine, 22, '')}</td>
    <td class="mono dim">${esc(coreId)}</td>
    <td class="grp">${use('c', coreId, 16, '')} ${use('c', coreId, 22, '')}</td>
    <td class="mono dim">${esc(why)}</td>
  </tr>`).join('');

const totalBytes = icons.reduce((a, i) => a + i.bytes, 0);
const table = icons.map(i => `
  <tr>
    <td class="mono">${esc(i.id)}</td>
    <td class="mono dim">svg/file/${esc(i.id)}.svg</td>
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
  h3{font:11px/1 var(--mono);letter-spacing:.1em;color:var(--dim);margin:26px 0 10px;font-weight:500}
  .lede{color:var(--dim);margin:0 0 22px;max-width:80ch}

  table{border-collapse:collapse;width:100%;background:var(--panel);
        border:1px solid var(--line);border-radius:10px;overflow:hidden}
  thead th{font:11px/1.4 var(--mono);text-transform:uppercase;letter-spacing:.08em;color:var(--dim);
           text-align:center;padding:12px 8px;border-bottom:1px solid var(--line);font-weight:500}
  thead th:first-child,tbody th{text-align:left}
  tbody th{font-weight:400;padding:9px 14px;white-space:nowrap}
  .nm{font:12px/1 var(--mono);color:var(--fg)}
  .arch{display:block;font:10px/1.6 var(--mono);color:var(--dim);letter-spacing:.04em}
  td{padding:9px 8px;text-align:center;vertical-align:middle}
  tbody tr+tr th,tbody tr+tr td{border-top:1px solid var(--line)}
  .grp{border-left:1px solid var(--line)}
  .ico{display:inline-block;vertical-align:middle}
  .rowcell{text-align:left;padding-left:16px}
  .trow{display:inline-flex;align-items:center;gap:7px;height:22px;padding:0 8px;border-radius:4px}
  .trow span{font:13px/1 var(--sans);color:#CCCCCC;white-space:nowrap}

  .strips{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;align-items:start}
  .tree{border:1px solid var(--line);border-radius:10px;padding:10px 0 14px;background:var(--bg)}
  .treehead{font:10px/1.3 var(--mono);color:var(--dim);letter-spacing:.06em;padding:6px 12px 12px}
  .tree .row{display:flex;align-items:center;gap:7px;padding:0 12px;height:22px}
  .tree .row span{font:12px/1 var(--sans);color:#CCCCCC;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

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
  <h1>${esc(TITLE)} — production contact sheet</h1>
  <p class="sub">${icons.length} hand-authored icons for the M11 full-coverage wave (D20 amendment 2, spec §11).
  No &lt;text&gt;, no font-family, no gradients, no external references: every letterform is an
  Inter&nbsp;Bold outline baked by tools/letterpath.mjs, everything else is drawn geometry on the 16 grid.
  Hues follow brandColor where the inventory carries one, otherwise the hue the source themes already use.</p>
  <div class="meta">
    <span class="tag">${icons.length} icons</span>
    <span class="tag">${ARCHES.map(a => `${icons.filter(i => i.archetype === a).length} ${a.toLowerCase()}`).join(' · ')}</span>
    <span class="tag">${totalBytes} bytes total</span>
    <span class="tag">avg ${Math.round(totalBytes / icons.length)} B</span>
    <span class="tag">max ${Math.max(...icons.map(i => i.bytes))} B</span>
    <span class="tag">bg #121314</span>
  </div>
</header>

<section>
  <h2>Size ladder, by archetype</h2>
  <p class="lede">16&nbsp;px is the primary target; the 22&nbsp;px tree row is the real usage context;
  32 and 64 only have to stay clean. Grouped by archetype so mass reads against its own envelope
  (badge plate 14&nbsp;×&nbsp;14, silhouette against the folder / css shield, glyph lighter by design).</p>
  ${ladder}
</section>

<section>
  <h2>As directories</h2>
  <p class="lede">The slice split into the four places these files actually land, at 22&nbsp;px rows with
  the filenames the slice's matchers claim.</p>
  <div class="strips">${trees}</div>
</section>

<section>
  <h2>R7 pairs tolerated under §11.3</h2>
  <p class="lede">Long-tail concepts cannot all be pairwise distinct on the wheel. R7 is held hard inside
  the slice (only the declared families — tex, lean, marko, map — repeat a hue) and against same-domain
  core icons. These pairs cross domain families that rarely share a directory: logged, not fixed.</p>
  <table>
    <thead><tr><th>A04</th><th>16 / 22</th><th>core</th><th class="grp">16 / 22</th><th>why it stands</th></tr></thead>
    <tbody>${tolerated}</tbody>
  </table>
</section>

<section>
  <h2>Manifest</h2>
  <table class="ftable">
    <thead><tr><th>id</th><th>path</th><th>archetype</th><th class="num">bytes</th><th>colour source</th></tr></thead>
    <tbody>${table}</tbody>
    <tfoot><tr><td colspan="3">${icons.length} icons</td><td class="num">${totalBytes}</td><td>—</td></tr></tfoot>
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
	const builds = readdirSync(cache).filter(d => /^chromium-\d+$/.test(d))
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
	const probe = join(tmpdir(), `a04-contact-probe-${process.pid}.html`);
	writeFileSync(probe, `<!doctype html><body style="margin:0"><pre id="o"></pre>` +
		`<iframe id="f" src="file://${htmlPath}" style="width:${WIDTH}px;height:400px;border:0"></iframe>` +
		`<script>f.onload=()=>{document.getElementById('o').textContent='PAGEHEIGHT='+f.contentDocument.documentElement.scrollHeight}</script>`);
	const dom = execFileSync(bin, [...COMMON, `--window-size=${WIDTH + 200},600`, '--dump-dom', `file://${probe}`],
		{ encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 });
	rmSync(probe, { force: true });
	const m = /PAGEHEIGHT=(\d+)/.exec(dom);
	if (!m) { throw new Error('could not measure the page height'); }
	execFileSync(bin, [...COMMON, '--force-device-scale-factor=2', '--default-background-color=121314ff',
		`--window-size=${WIDTH},${m[1]}`, `--screenshot=${pngPath}`, `file://${htmlPath}`],
		{ stdio: ['ignore', 'ignore', 'ignore'] });
	return { bin, width: WIDTH, height: +m[1] };
}

if (argv.includes('--png')) {
	const png = join(ROOT, `contact-${SLICE}.png`);
	const r = shoot(out, png);
	console.log(`${png}  (${r.width}x${r.height} css px at 2x, ${Buffer.byteLength(readFileSync(png))} bytes)`);
	console.log(`  renderer: ${r.bin}`);
}
