#!/usr/bin/env node
// contact-A12.mjs — thin contact sheet for long-tail slice A12 (82 file icons).
// Local to this slice; the shared tools/ are untouched.
//
//   node contact-A12.mjs          # -> contact-A12.html
//   node contact-A12.mjs --png    # also shoots contact-A12.png at 2x
//
// Every icon is inlined once as an SVG <symbol> and referenced with <use>, so the
// page makes no external request. Tree rows carry the real filenames the slice
// matches, taken from longtail-worklist.json.

import { readFileSync, writeFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { homedir, tmpdir } from 'node:os';

const ROOT = dirname(fileURLToPath(import.meta.url));
const TITLE = 'M11 long-tail A12';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const slice = JSON.parse(readFileSync(join(ROOT, 'longtail-worklist.json'), 'utf8'))
	.slices.find(s => s.id === 'A12');

// Nicest real match to show in a tree row; otherwise the first filename, otherwise
// a plausible stem for the first extension.
const LABEL = {
	access: 'customers.accdb', dbml: 'schema.dbml', geojson: 'boundaries.geojson',
	jsonld: 'context.jsonld', 'libreoffice-calc': 'budget.ods', parquet: 'events.parquet',
	doxygen: 'api.dox', epub: 'handbook.epub', 'libreoffice-writer': 'brief.odt',
	org: 'notes.org', patch: 'fix-crash.patch', rest: 'index.rst', textile: 'page.textile',
	toc: 'toc', glyphs: 'Inter.glyphs', 'libreoffice-math': 'formula.odf',
	affinitydesigner: 'poster.afdesign', affinityphoto: 'cover.afphoto', ai: 'logo.ai',
	aseprite: 'sprite.aseprite', avif: 'hero.avif', drawio: 'flow.drawio',
	eps: 'diagram.eps', excalidraw: 'sketch.excalidraw', figma: 'ui.fig', gimp: 'mockup.xcf',
	icon: 'app.ico', krita: 'paint.kra', matlab: 'solve.m', photoshop: 'banner.psd',
	sketch: 'kit.sketch', '3d': 'chair.3ds', blender: 'scene.blend', gltf: 'robot.gltf',
	lottie: 'spinner.lottie', subtitles: 'episode.srt', windi: 'windi.config.ts',
	'design-tokens': 'tokens.json', 'json-schema': 'schema.json', instructions: 'instructions.md',
	prompt: 'prompt.md', skill: 'skill.md', markdoc: 'guide.mdoc', openapi: 'openapi.yaml',
	'dependencies-update': '.ncurc.json', horusec: 'horusec-config.json',
	'language-configuration': 'language-configuration.json', rojo: 'default.project.json',
	verified: 'attestation.sigstore.json', postman: 'api.postman_collection.json',
	architecture: 'ARCHITECTURE.md', authors: 'AUTHORS', changelog: 'CHANGELOG.md',
	citation: 'CITATION.cff', conduct: 'CODE_OF_CONDUCT.md', contributing: 'CONTRIBUTING.md',
	credits: 'CREDITS.md', installation: 'INSTALL', roadmap: 'ROADMAP.md',
	unlicense: 'UNLICENSE', humanstxt: 'humans.txt', tsdoc: 'tsdoc.json'
};
function label(c) {
	if (LABEL[c.id]) { return LABEL[c.id]; }
	const f = c.match.filenames || [], e = c.match.extensions || [];
	if (f.length) { return f[0]; }
	if (e.length) { return e[0].includes('.') ? e[0].replace(/^\./, '') : `example.${e[0]}`; }
	return c.id;
}

const GROUPS = [
	['config', 'Config — 15'], ['data', 'Data — 14'], ['doc', 'Doc — 28'],
	['font', 'Font — 3'], ['image', 'Image — 17'], ['media', 'Media — 5']
];

// archetype + colour source, from the authoring pass.
const META = {
	vim: ["SILHOUETTE", "brand #019733 → matte"],
	"vscode-test": ["SILHOUETTE", "core #2782C2 (R3 family: vscode)"],
	vueconfig: ["SILHOUETTE", "brand #4FC08D → core #4CB392 (R3 family: vue)"],
	watchmanconfig: ["SILHOUETTE", "no brand → #7C8AA6 (neutral lane)"],
	webhint: ["SILHOUETTE", "no brand → #CAA67A"],
	wercker: ["BADGE", "no brand → #8E5A78"],
	windi: ["SILHOUETTE", "brand #48B0F7 → matte, lifted"],
	wpml: ["SILHOUETTE", "no brand → #5A7E9E"],
	wrangler: ["SILHOUETTE", "brand Cloudflare #F6821F → matte, split from blender"],
	wxt: ["BADGE", "brand green → matte"],
	xo: ["GLYPH", "no brand → #8A4C38"],
	yamllint: ["GLYPH", "no brand → #833F42"],
	yandex: ["BADGE", "brand #FC3F1D → matte, darkened clear of npm"],
	yeoman: ["SILHOUETTE", "no brand → #5B99A9"],
	zizmor: ["SILHOUETTE", "no brand → #9659A6"],
	access: ["BADGE", "brand #A4373A → matte"],
	dbml: ["SILHOUETTE", "no brand → #3C7485"],
	"dependencies-update": ["GLYPH", "no brand → #79B786"],
	"design-tokens": ["SILHOUETTE", "no brand → #8E7CC0"],
	geojson: ["SILHOUETTE", "no brand → #7FA83E"],
	horusec: ["SILHOUETTE", "no brand → #307FC2"],
	"json-schema": ["GLYPH", "core #D6C13C (R3 family: json)"],
	jsonld: ["GLYPH", "no brand → #7262AA"],
	"language-configuration": ["GLYPH", "no brand → #89AEC3"],
	"libreoffice-calc": ["GLYPH", "brand LO Calc green → matte"],
	parquet: ["GLYPH", "no brand → #8E7248 (oak)"],
	postman: ["SILHOUETTE", "brand #FF6C37 → matte"],
	rojo: ["BADGE", "brand red → matte, split from npm/rust"],
	verified: ["SILHOUETTE", "no brand → #5AB4B4"],
	architecture: ["SILHOUETTE", "no brand → #A09488 (neutral lane)"],
	authors: ["SILHOUETTE", "no brand → #6E7EA8 (ink)"],
	changelog: ["SILHOUETTE", "no brand → #7E6A44"],
	citation: ["GLYPH", "no brand → #8A9EB4 (neutral lane)"],
	conduct: ["SILHOUETTE", "no brand → #A0606E (neutral lane)"],
	contributing: ["SILHOUETTE", "no brand → #4FA890"],
	credits: ["SILHOUETTE", "no brand → #AEB4BA (neutral lane)"],
	docusaurus: ["SILHOUETTE", "brand #3ECC5F → matte"],
	doxygen: ["BADGE", "no brand → #7A6E86 (neutral lane)"],
	epub: ["SILHOUETTE", "no brand → #3E8E8E"],
	humanstxt: ["GLYPH", "no brand → #C09070"],
	installation: ["GLYPH", "no brand → #5EABD8"],
	instructions: ["SILHOUETTE", "no brand → #A8955E"],
	"libreoffice-writer": ["GLYPH", "brand LO Writer blue → matte"],
	markdoc: ["GLYPH", "core-adjacent #519ABA (R3 family: markdown)"],
	openapi: ["BADGE", "brand #6BA539 → matte"],
	org: ["BADGE", "no brand → #7E6EA8"],
	patch: ["SILHOUETTE", "no brand → #C68D7E"],
	prompt: ["GLYPH", "no brand → #9B7FD0"],
	readthedocs: ["BADGE", "no brand → #5A7E70 (neutral lane)"],
	rest: ["GLYPH", "no brand → #8E7E9E (neutral lane)"],
	roadmap: ["SILHOUETTE", "no brand → #B7854B"],
	skill: ["SILHOUETTE", "no brand → #7E8FC8"],
	textile: ["GLYPH", "no brand → #CB959F"],
	toc: ["GLYPH", "no brand → #8E9EA8 (neutral lane)"],
	tsdoc: ["GLYPH", "core #3178C6 (R3 family: typescript)"],
	typedoc: ["SILHOUETTE", "core-adjacent TS blue, lifted"],
	unlicense: ["GLYPH", "no brand → #A9A79E (neutral lane)"],
	fantasticon: ["SILHOUETTE", "no brand → #C86EA8"],
	glyphs: ["GLYPH", "no brand → #B6ADA4 (neutral lane)"],
	"libreoffice-math": ["GLYPH", "brand LO Math red → matte"],
	affinitydesigner: ["SILHOUETTE", "brand Affinity Designer blue → matte"],
	affinityphoto: ["SILHOUETTE", "brand Affinity Photo purple → matte"],
	ai: ["BADGE", "brand Adobe dark plate lifted per §6.3; wordmark #FF9A00 → #E09140 (R2)"],
	aseprite: ["GLYPH", "no brand → #C4547E"],
	avif: ["GLYPH", "no brand → #4EA8A6"],
	drawio: ["GLYPH", "brand #F08705 → matte"],
	eps: ["GLYPH", "no brand → #8E9E5E"],
	excalidraw: ["GLYPH", "brand #6965DB → matte"],
	figma: ["SILHOUETTE", "brand five-colour mark → matte (R2)"],
	gimp: ["SILHOUETTE", "no brand → #9C8A5E"],
	icon: ["SILHOUETTE", "no brand → #6E80C8"],
	krita: ["SILHOUETTE", "no brand → #649BAF"],
	matlab: ["SILHOUETTE", "brand MathWorks orange → matte"],
	photoshop: ["BADGE", "brand Adobe dark plate #001E36 lifted per §6.3; wordmark #31A8FF → #4FA8E0 (R2)"],
	sketch: ["SILHOUETTE", "brand #F7B500 → matte"],
	svgo: ["GLYPH", "core-adjacent svg amber #DFA046"],
	svgr: ["SILHOUETTE", "core react #46B5D1 (R3 rhyme: reactjs)"],
	"3d": ["GLYPH", "no brand → #63C4D3"],
	blender: ["SILHOUETTE", "brand #E87D0D → matte"],
	gltf: ["GLYPH", "brand glTF vermilion → matte"],
	lottie: ["GLYPH", "brand LottieFiles #00DDB3 → matte"],
	subtitles: ["GLYPH", "no brand → #A8ADB4 (neutral lane)"]
};
const meta = (id) => ({ arch: META[id][0], src: META[id][1] });

const icons = slice.concepts.map(c => {
	const file = join(ROOT, 'svg', 'file', `${c.id}.svg`);
	if (!existsSync(file)) { throw new Error(`missing ${file}`); }
	const src = readFileSync(file, 'utf8');
	return {
		id: c.id, category: c.category, label: label(c),
		archetype: meta(c.id).arch, palette: meta(c.id).src,
		inner: src.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, ''),
		bytes: Buffer.byteLength(src)
	};
});

const defs = `<svg width="0" height="0" aria-hidden="true" style="position:absolute"><defs>
${icons.map(i => `<symbol id="a-${i.id}" viewBox="0 0 16 16">${i.inner}</symbol>`).join('\n')}
</defs></svg>`;

const use = (id, s, alt) =>
	`<svg class="ico" width="${s}" height="${s}" role="img" aria-label="${esc(alt)}"><use href="#a-${id}"/></svg>`;

const ladder = (group) => icons.filter(i => i.category === group).map(i => `
  <tr>
    <th scope="row"><span class="nm">${esc(i.id)}</span><span class="arch">${i.archetype}</span></th>
    <td>${use(i.id, 16, `${i.id} 16px`)}</td>
    <td>${use(i.id, 22, `${i.id} 22px`)}</td>
    <td class="rowcell"><span class="trow">${use(i.id, 16, '')}<span>${esc(i.label)}</span></span></td>
    <td>${use(i.id, 32, `${i.id} 32px`)}</td>
    <td>${use(i.id, 64, `${i.id} 64px`)}</td>
  </tr>`).join('');

const tree = (group, heading) => `<div class="tree">
  <div class="treehead">${esc(heading)}</div>
  ${icons.filter(i => i.category === group)
		.map(i => `<div class="row">${use(i.id, 16, '')}<span>${esc(i.label)}</span></div>`).join('\n  ')}
</div>`;

const totalBytes = icons.reduce((a, i) => a + i.bytes, 0);
const counts = icons.reduce((a, i) => (a[i.archetype] = (a[i.archetype] || 0) + 1, a), {});

const TABLE = icons.map(i => `
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
     font-weight:600;margin:52px 0 14px}
  h2:first-of-type{margin-top:0}
  .lede{color:var(--dim);margin:-8px 0 20px;max-width:78ch}

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

  .tree{border:1px solid var(--line);border-radius:10px;padding:10px 0 14px;background:var(--bg)}
  .treehead{font:10px/1 var(--mono);color:var(--dim);letter-spacing:.08em;padding:6px 14px 12px}
  .tree .row{display:flex;align-items:center;gap:7px;padding:0 14px;height:22px}
  .tree .row span{font:13px/1 var(--sans);color:#CCCCCC;white-space:nowrap;overflow:hidden;
                  text-overflow:ellipsis}
  .strips{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;align-items:start}
  .strips.alt .tree{background:#1E1E1E}

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
  <h1>${esc(TITLE)} — 82 file icons</h1>
  <p class="sub">Long-tail slice A12 of the M11 full-coverage wave (D20 amendment 2). Hand-authored SVGs:
  no &lt;text&gt;, no font-family, no gradients, no external references — every letterform is an
  Inter&nbsp;Bold outline baked by tools/letterpath.mjs. 16&nbsp;px is the primary render; the 22&nbsp;px
  tree rows carry the real filenames this slice matches.</p>
  <div class="meta">
    <span class="tag">${icons.length} icons</span>
    ${Object.entries(counts).map(([k, v]) => `<span class="tag">${v} ${k.toLowerCase()}</span>`).join('\n    ')}
    <span class="tag">${totalBytes} bytes total</span>
    <span class="tag">avg ${Math.round(totalBytes / icons.length)} B</span>
    <span class="tag">max ${Math.max(...icons.map(i => i.bytes))} B</span>
    <span class="tag">bg #121314</span>
  </div>
</header>

${GROUPS.map(([g, h]) => `<section>
  <h2>${esc(h)}</h2>
  <table>
    <thead><tr><th>concept</th><th>16</th><th>22</th><th>tree row (22 px)</th><th>32</th><th>64</th></tr></thead>
    <tbody>${ladder(g)}</tbody>
  </table>
</section>`).join('\n')}

<section>
  <h2>As a set — explorer listings</h2>
  <p class="lede">Each group as one listing on the editor background, then the same on #1E1E1E.</p>
  <div class="strips">${GROUPS.map(([g, h]) => tree(g, h.replace(/ — .*/, ''))).join('')}</div>
  <div style="height:18px"></div>
  <div class="strips alt">${GROUPS.map(([g, h]) => tree(g, h.replace(/ — .*/, '') + ' · #1E1E1E')).join('')}</div>
</section>

<section>
  <h2>Manifest</h2>
  <table class="ftable">
    <thead><tr><th>id</th><th>path</th><th>archetype</th><th class="num">bytes</th><th>colour source</th></tr></thead>
    <tbody>${TABLE}</tbody>
    <tfoot><tr><td colspan="3">${icons.length} icons · ${Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(' · ')}</td>
      <td class="num">${totalBytes}</td><td>—</td></tr></tfoot>
  </table>
</section>
</div>
`;

const out = join(ROOT, 'contact-A12.html');
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

if (process.argv.includes('--png')) {
	const bin = chromium();
	const probe = join(tmpdir(), `a12-contact-probe-${process.pid}.html`);
	writeFileSync(probe, `<!doctype html><body style="margin:0"><pre id="o"></pre>` +
		`<iframe id="f" src="file://${out}" style="width:${WIDTH}px;height:400px;border:0"></iframe>` +
		`<script>f.onload=()=>{document.getElementById('o').textContent='PAGEHEIGHT='+f.contentDocument.documentElement.scrollHeight}</script>`);
	const dom = execFileSync(bin, [...COMMON, `--window-size=${WIDTH + 200},600`, '--dump-dom', `file://${probe}`],
		{ encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
	rmSync(probe, { force: true });
	const m = /PAGEHEIGHT=(\d+)/.exec(dom);
	if (!m) { throw new Error('could not measure the page height'); }
	const png = join(ROOT, 'contact-A12.png');
	execFileSync(bin, [...COMMON, '--force-device-scale-factor=2', '--default-background-color=121314ff',
		`--window-size=${WIDTH},${m[1]}`, `--screenshot=${png}`, `file://${out}`],
		{ stdio: ['ignore', 'ignore', 'ignore'] });
	console.log(`${png}  (${WIDTH}x${m[1]} css px at 2x, ${Buffer.byteLength(readFileSync(png))} bytes)`);
	console.log(`  renderer: ${bin}`);
}
