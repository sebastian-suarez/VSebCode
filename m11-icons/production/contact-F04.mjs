#!/usr/bin/env node
// contact-F04.mjs — contact sheet for long-tail folder slice F04 (D20 amendment 2).
//
//   node contact-F04.mjs          # -> contact-F04.html
//   node contact-F04.mjs --png    # also shoots contact-F04.png at 2x
//
// tools/contact.mjs carries a hard-coded batch-1 file roster, so this slice ships
// its own thin sheet rather than modifying the shared tool. Same rules: every icon
// is inlined once as an SVG <symbol>, the page makes no external request, and the
// screenshot runs on the Playwright chromium under ~/Library/Caches/ms-playwright.

import { readFileSync, writeFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { homedir, tmpdir } from 'node:os';

const ROOT = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const SLICE = 'F04';
const TITLE = 'M11 long tail — folder slice F04';
const WIDTH = 1280;
const BG = '#121314';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// id, emblem description, colour source, the real folder name used in the tree row
const ROSTER = [
	['less', 'letter L', 'brandColor #1D365D (inventory)', 'less'],
	['link', 'two interlocked chain rings on the diagonal', 'no brand → neutral', 'links'],
	['linux', 'Tux penguin — belly knocked out, feet splayed', 'brand #FCC624 is lighter than the tan → neutral (R9 tone law)', 'ubuntu'],
	['liquibase', 'two liquid waves', 'no brand → neutral', 'liquibase'],
	['lottie', 'play triangle knocked out of a rounded plate', 'no brand → neutral', 'lottie'],
	['luau', 'Lua orbit — pierced sphere with a moon', 'family rhyme with core file lua #6C6ACB, darkened', 'luau'],
	['macos', 'Apple silhouette with the bite and leaf', 'Apple’s own mark is monochrome → neutral', 'macos'],
	['mail', 'envelope with a chevron flap', 'no brand → neutral', 'mailers'],
	['mappings', 'two columns crossed by an X of links', 'no brand → neutral', 'mappings'],
	['mariadb', 'tiered database cylinder — top disc plus a tier line', 'brandColor #003545 (inventory)', 'mariadb'],
	['mediawiki', 'letter W', 'no brand → neutral', 'mediawiki'],
	['memcached', 'hash grid — two bars each way', 'no brand → neutral', 'memcached'],
	['mercurial', 'commit trunk with a side branch (VCS family)', 'no brand → neutral', '.hg'],
	['messages', 'two offset chat bubbles', 'no brand → neutral', 'messages'],
	['meta', 'label tag with an eyelet', 'no brand → neutral', 'metadata'],
	['meteor', 'comet head with a forked tail', 'no brand → neutral', '.meteor'],
	['metro', 'train front — windshield and two lamps', 'no brand → neutral', 'metro'],
	['migrations', 'box → box, state moved forward', 'no brand → neutral', 'migrations'],
	['minecraft', 'pickaxe', 'no brand → neutral', '.minecraft'],
	['minikube', 'Kubernetes heptagon ring with a hub', 'kubernetes brand #326CE5, darkened', 'minikube'],
	['mjml', 'letter M', 'MJML coral #F45E43, darkened', 'mjml'],
	['mobile', 'phone with a screen cut-out', 'no brand → neutral', 'mobile'],
	['module', 'IC chip with eight pins', 'no brand → neutral', 'modules'],
	['mojo', 'flame', 'Mojo flame orange, darkened', 'mojo'],
	['molecule', 'three atoms joined by bonds', 'no brand → neutral', 'molecules'],
	['mongodb', 'MongoDB leaf with its vein', 'MongoDB green #47A248, darkened', 'mongodb'],
	['moon', 'crescent moon', 'no brand → neutral', 'moon'],
	['mypy', 'magnifier — the type checker’s look', 'no brand → neutral', '.mypy_cache'],
	['mysql', 'MySQL dolphin — detached dorsal fin, forked fluke', 'brandColor #4479A1 (inventory)', 'mysql'],
	['ngrx-actions', 'lightning bolt (dispatch)', 'NgRx family purple (R3)', 'actions'],
	['ngrx-effects', 'source dot with two radiating waves', 'NgRx family purple (R3)', 'effects'],
	['ngrx-entities', 'three-row, two-column record table', 'NgRx family purple (R3)', 'entities'],
	['ngrx-reducer', 'funnel', 'NgRx family purple (R3)', 'reducers'],
	['ngrx-selectors', 'pointer — picking one thing out', 'NgRx family purple (R3)', 'selectors'],
	['ngrx-state', 'toggle switch', 'NgRx family purple (R3)', 'state'],
	['ngrx-store', 'container holding one block', 'NgRx family purple (R3)', 'store'],
	['nix', 'six-armed snowflake', 'brandColor #5277C3 (inventory)', 'nix'],
	['notebooks', 'notebook with a bookmark ribbon', 'no brand → neutral', 'notebooks'],
	['notification', 'bell', 'no brand → neutral', 'notifications'],
	['nuget', 'package with a ribbon and a top tab', 'NuGet blue #004880, lifted', '.nuget'],
	['obsidian', 'faceted gem', 'Obsidian purple, darkened', 'obsidian'],
	['opencode', 'terminal plate with a prompt caret', 'monochrome brand → neutral', 'opencode'],
	['organism', 'seven-cell rosette', 'no brand → neutral', 'organisms'],
	['other', 'ellipsis on the diagonal', 'no brand → neutral', 'misc'],
	['paket', 'two stacked parcels', 'no brand → neutral', '.paket']
];

// core folders shown beside the slice for weight / hue comparison only
const CORE = ['folder', 'db', 'docker', 'git', 'node', 'config', 'package', 'src', 'test', 'api', 'images', 'vscode'];

const load = (id) => {
	const file = join(ROOT, 'svg', 'folder', `${id}.svg`);
	if (!existsSync(file)) { throw new Error(`missing ${file}`); }
	const src = readFileSync(file, 'utf8');
	return {
		inner: src.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, ''),
		bytes: Buffer.byteLength(src),
		fill: (src.match(/fill="(#[0-9A-Fa-f]{6})"(?![\s\S]*fill="#)/) || [])[1] || ''
	};
};

const icons = ROSTER.map(([id, emblem, source, tree]) => {
	const closed = load(id);
	const open = load(`${id}-open`);
	// the emblem fill is the last solid hex in the file
	const hex = (readFileSync(join(ROOT, 'svg', 'folder', `${id}.svg`), 'utf8')
		.match(/fill="(#[0-9A-Fa-f]{6})"/g) || []).pop().slice(6, 13);
	return { id, emblem, source, tree, closed, open, hex };
});
const core = CORE.flatMap(id => [{ id, ...load(id) }, { id: `${id}-open`, ...load(`${id}-open`) }]);

const symbols = [
	...icons.flatMap(i => [`<symbol id="s-${i.id}" viewBox="0 0 16 16">${i.closed.inner}</symbol>`,
		`<symbol id="s-${i.id}-open" viewBox="0 0 16 16">${i.open.inner}</symbol>`]),
	...core.map(c => `<symbol id="c-${c.id}" viewBox="0 0 16 16">${c.inner}</symbol>`)
];
const defs = `<svg width="0" height="0" aria-hidden="true" style="position:absolute"><defs>\n${symbols.join('\n')}\n</defs></svg>`;

const use = (pfx, id, s, alt) =>
	`<svg class="ico" width="${s}" height="${s}" role="img" aria-label="${esc(alt)}"><use href="#${pfx}-${id}"/></svg>`;

// --- 1. the ladder: every concept, closed + open, at 64 / 32 / 22 / 16 -------
const LADDER = icons.map(i => `<div class="row">
  <div class="sizes">
    ${use('s', i.id, 64, `${i.id} closed 64`)}${use('s', `${i.id}-open`, 64, `${i.id} open 64`)}
    ${use('s', i.id, 32, `${i.id} closed 32`)}${use('s', `${i.id}-open`, 32, `${i.id} open 32`)}
    ${use('s', i.id, 22, `${i.id} closed 22`)}${use('s', `${i.id}-open`, 22, `${i.id} open 22`)}
    ${use('s', i.id, 16, `${i.id} closed 16`)}${use('s', `${i.id}-open`, 16, `${i.id} open 16`)}
  </div>
  <div class="meta"><b>${esc(i.id)}</b><span class="sw" style="background:${i.hex}"></span><code>${i.hex}</code>
    <div class="em">${esc(i.emblem)}</div></div>
</div>`).join('\n');

// --- 2. the real context: a 22 px tree row with real folder names ------------
const half = Math.ceil(icons.length / 2);
const treeCol = (list) => list.map((i, n) => `<div class="tr" style="padding-left:${12 + (n % 3) * 14}px">
  ${use('s', n % 2 ? `${i.id}-open` : i.id, 22, i.tree)}<span>${esc(i.tree)}</span></div>`).join('\n');
const TREE = `<div class="tree">${treeCol(icons.slice(0, half))}</div><div class="tree">${treeCol(icons.slice(half))}</div>`;

// --- 3. mixed strip: slice icons interleaved with the core folders -----------
const mix = [];
for (let n = 0; n < Math.max(icons.length, core.length); n++) {
	if (core[n]) { mix.push(`<span class="mx core">${use('c', core[n].id, 32, core[n].id)}</span>`); }
	const i = icons[n % icons.length];
	if (n < icons.length) {
		mix.push(`<span class="mx">${use('s', i.id, 32, i.id)}</span>`);
		mix.push(`<span class="mx">${use('s', `${i.id}-open`, 32, `${i.id} open`)}</span>`);
	}
}
const mix16 = [];
for (let n = 0; n < Math.max(icons.length, core.length); n++) {
	if (core[n]) { mix16.push(`<span class="mx core">${use('c', core[n].id, 16, core[n].id)}</span>`); }
	if (n < icons.length) {
		mix16.push(`<span class="mx">${use('s', icons[n].id, 16, icons[n].id)}</span>`);
		mix16.push(`<span class="mx">${use('s', `${icons[n].id}-open`, 16, icons[n].id)}</span>`);
	}
}

// --- 4. manifest footer ------------------------------------------------------
const totalBytes = icons.reduce((a, i) => a + i.closed.bytes + i.open.bytes, 0);
const MANIFEST = `<table>
<thead><tr><th>id</th><th>emblem</th><th>hex</th><th>colour source</th><th class="n">closed</th><th class="n">open</th></tr></thead>
<tbody>
${icons.map(i => `<tr><td><code>${esc(i.id)}</code></td><td>${esc(i.emblem)}</td>
<td><span class="sw" style="background:${i.hex}"></span><code>${i.hex}</code></td>
<td class="src">${esc(i.source)}</td><td class="n">${i.closed.bytes} B</td><td class="n">${i.open.bytes} B</td></tr>`).join('\n')}
</tbody>
<tfoot><tr><td colspan="4">${icons.length} concepts · ${icons.length * 2} files</td>
<td class="n" colspan="2">${totalBytes} B total · ${Math.round(totalBytes / (icons.length * 2))} B avg ·
${Math.max(...icons.flatMap(i => [i.closed.bytes, i.open.bytes]))} B max</td></tr></tfoot>
</table>`;

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>${esc(TITLE)}</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 28px 32px 40px; width: ${WIDTH}px; background: ${BG};
    color: #C9CED6; font: 13px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  h1 { font-size: 19px; font-weight: 600; margin: 0 0 4px; color: #E6E9ED; }
  h2 { font-size: 13px; font-weight: 600; margin: 34px 0 12px; color: #8B929C;
    text-transform: uppercase; letter-spacing: .08em; }
  .lede { margin: 0 0 6px; color: #8B929C; max-width: 90ch; }
  .ico { display: block; }
  .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px 20px; }
  .row { display: flex; align-items: center; gap: 14px; padding: 8px 10px;
    border: 1px solid #22262B; border-radius: 8px; background: #16181A; }
  .sizes { display: flex; align-items: center; gap: 6px; }
  .sizes .ico + .ico { margin-left: -2px; }
  .meta { min-width: 0; }
  .meta b { color: #E6E9ED; font-weight: 600; }
  .em { color: #7E858F; font-size: 11.5px; }
  code { font: 11px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace; color: #9AA2AC; }
  .sw { display: inline-block; width: 9px; height: 9px; border-radius: 2px;
    margin: 0 4px 0 8px; vertical-align: baseline; outline: 1px solid #2B3037; }
  .trees { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0 28px; }
  .tree { background: #181A1C; border: 1px solid #22262B; border-radius: 8px; padding: 8px 4px; }
  .tr { display: flex; align-items: center; gap: 7px; height: 24px; font-size: 13px; color: #C0C6CE; }
  .strip { background: #16181A; border: 1px solid #22262B; border-radius: 8px;
    padding: 10px; display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
  .strip.small { gap: 4px; }
  .mx { display: inline-flex; padding: 2px; border-radius: 4px; }
  .mx.core { background: #23282E; outline: 1px solid #333A42; }
  table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
  th, td { text-align: left; padding: 3px 8px; border-bottom: 1px solid #1F2328; vertical-align: top; }
  th { color: #7E858F; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; font-size: 10px; }
  td.n, th.n { text-align: right; font-variant-numeric: tabular-nums; color: #8B929C; }
  td.src { color: #8B929C; }
  tfoot td { border-bottom: 0; color: #7E858F; padding-top: 8px; }
</style></head><body>
${defs}
<h1>${esc(TITLE)}</h1>
<p class="lede">45 concepts · 90 files. Canon tan base verbatim + one emblem mapped into the
R9a box by a uniform scale + translate (closed 8.20 at 5.30–13.50 / 4.60–12.80, open 5.80 at
7.26–13.06 / 6.75–12.55). Emblems are darker than the tan; a brand hue only where the brand
earns it. Background is the editor’s ${BG}.</p>

<h2>Closed + open, 64 / 32 / 22 / 16</h2>
<div class="grid">${LADDER}</div>

<h2>22 px tree rows, real folder names</h2>
<div class="trees">${TREE}</div>

<h2>Mixed with the core folders — 32 px (boxed = core)</h2>
<div class="strip">${mix.join('')}</div>

<h2>Mixed with the core folders — 16 px (boxed = core)</h2>
<div class="strip small">${mix16.join('')}</div>

<h2>Manifest</h2>
${MANIFEST}
</body></html>`;

const out = join(ROOT, `contact-${SLICE}.html`);
writeFileSync(out, html);
console.log(`${out}  (${icons.length} concepts, ${icons.length * 2} files, ${Buffer.byteLength(html)} bytes)`);

// ---- screenshot -------------------------------------------------------------
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
	// Pass 1: measure the document height through an iframe (headless --screenshot
	// only captures the window, so the window has to be sized to the document).
	const probe = join(tmpdir(), `F04-contact-probe-${process.pid}.html`);
	writeFileSync(probe, `<!doctype html><body style="margin:0"><pre id="o"></pre>` +
		`<iframe id="f" src="file://${htmlPath}" style="width:${WIDTH}px;height:400px;border:0"></iframe>` +
		`<script>f.onload=()=>{document.getElementById('o').textContent='PAGEHEIGHT='+f.contentDocument.documentElement.scrollHeight}</script>`);
	const dom = execFileSync(bin, [...COMMON, `--window-size=${WIDTH + 200},600`, '--dump-dom', `file://${probe}`],
		{ encoding: 'utf8', maxBuffer: 1 << 26, stdio: ['ignore', 'pipe', 'ignore'] });
	rmSync(probe, { force: true });
	const m = /PAGEHEIGHT=(\d+)/.exec(dom);
	if (!m) { throw new Error('could not measure the page height'); }
	const height = +m[1];

	execFileSync(bin, [...COMMON, '--force-device-scale-factor=2', `--default-background-color=${BG.slice(1)}ff`,
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
