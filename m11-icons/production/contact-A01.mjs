#!/usr/bin/env node
// contact-A01.mjs — contact sheet for M11 long-tail slice A01 (84 concepts).
//
//   node contact-A01.mjs          # -> contact-A01.html
//   node contact-A01.mjs --png    # also shoots contact-A01.png at 2x
//
// tools/contact.mjs carries a hard-coded batch-1 roster and cannot take a subset,
// so this is a thin local twin of it: the same page structure and CSS, this slice's
// roster, no canon-drift section (none of the canon six live here), and the 22 px
// tree strips grouped by concept family with the filenames the matchers really hit.

import { readFileSync, writeFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { homedir, tmpdir } from 'node:os';

const ROOT = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const TITLE = 'M11 Long-tail A01';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const GROUPS = {
	pkg: 'Packages, images & binaries',
	ng: 'Angular building blocks (R3 family)',
	lang: 'Languages & dialects',
	tool: 'Frameworks, platforms & tooling',
	doc: 'Design, docs & data',
	bench: 'Benchmarks (R3 family)'
};

// id, archetype, tree label (a filename its matchers really hit), colour source, group
const ROSTER = [
	["android","SILHOUETTE","AndroidManifest.xml","brand #3DDC84 → #4EBE80","pkg"],
	["chrome","SILHOUETTE","extension.crx","brand Chrome #4285F4 → #5B8FD8","pkg"],
	["debian","GLYPH","package.deb","brand #A81D33 → #B82C38","pkg"],
	["disc","SILHOUETTE","ubuntu.iso","no brand → #9AA8B4 (neutral lane)","pkg"],
	["vsix","GLYPH","theme.vsix","VS Code blue family → #2E93D8","pkg"],
	["gpg","SILHOUETTE","secring.gpg","no brand → #7B87BE","pkg"],
	["hex","GLYPH","firmware.hex","no brand → #8996A8 (neutral lane)","pkg"],
	["jar","SILHOUETTE","app.jar","R3 java family (#C9832F) → #B4762F","pkg"],
	["lib","SILHOUETTE","libcore.a","no brand → #7C86A0 (neutral lane)","pkg"],
	["onnx","GLYPH","model.onnx","no brand → #9A63D8","pkg"],
	["python-misc","SILHOUETTE","requirements.txt","R3 python family (#3776AB) → #6B92BE + #46617E (R2 two-tone)","pkg"],
	["pytorch","SILHOUETTE","model.pt","brand #EE4C2C → #CE5134","pkg"],
	["safetensors","SILHOUETTE","model.safetensors","Hugging Face #FFD21E → #D9B54C","pkg"],
	["abap","BADGE","zreport.abap","no brand → SAP-blue read #1F5E70","lang"],
	["abc","GLYPH","tune.abc","no brand → #C888C8","lang"],
	["abelljs","BADGE","index.abell","no brand → #D4795E","lang"],
	["actionscript","BADGE","Main.as","Adobe red family → #8E2F3C","lang"],
	["ada","BADGE","main.adb","no brand → #6E9E5E","lang"],
	["adobe-swc","BADGE","lib.swc","R3 Adobe family with actionscript → #8E2F3C","lang"],
	["adonis","BADGE",".adonisrc.json","brand #5A45FF → #3D3480","tool"],
	["advpl","GLYPH","main.prw","no brand → #2E7799 (AdvPL family)","lang"],
	["advpl-include","GLYPH","protheus.ch","R3 AdvPL family → #2E7799","lang"],
	["advpl-ptm","GLYPH","menu.ptm","R3 AdvPL family → #2E7799","lang"],
	["advpl-tlpp","GLYPH","model.tlpp","R3 AdvPL family → #2E7799","lang"],
	["affectscript","BADGE","mood.affect","no brand → #9E6E8E (neutral lane)","lang"],
	["affinity","SILHOUETTE","cover.af","Affinity blue-violet → #6E5FB8","doc"],
	["affinitypublisher","SILHOUETTE","book.afpub","R3 Affinity family, Publisher red → #A8425C","doc"],
	["agda","BADGE","Proof.agda","no brand → #6E4088","lang"],
	["ahk2","GLYPH","script.ahk2","R3 AutoHotkey family → #4B9B52","lang"],
	["al","GLYPH","Customer.al","no brand → #6E8296 (neutral lane)","lang"],
	["al-dal","GLYPH","Item.dal","R3 AL family → #6E8296","lang"],
	["alchemy","SILHOUETTE","alchemy.run.ts","no brand → #C79A46","tool"],
	["alloy","SILHOUETTE","config.alloy","no brand → #8FA0AE (neutral lane, alloy = metal)","tool"],
	["allure","SILHOUETTE","allurerc.js","no brand → #A8C04E","tool"],
	["angular-component","GLYPH","app.component.ts","R3 angular family → canon #CC3462","ng"],
	["angular-directive","GLYPH","hover.directive.ts","R3 angular family → canon #CC3462","ng"],
	["angular-guard","GLYPH","auth.guard.ts","R3 angular family → canon #CC3462","ng"],
	["angular-interceptor","GLYPH","token.interceptor.ts","R3 angular family → canon #CC3462","ng"],
	["angular-pipe","GLYPH","date.pipe.ts","R3 angular family → canon #CC3462","ng"],
	["angular-resolver","GLYPH","user.resolver.ts","R3 angular family → canon #CC3462","ng"],
	["angular-service","GLYPH","api.service.ts","R3 angular family → canon #CC3462","ng"],
	["antlers-html","SILHOUETTE","antlers.html","no brand → #C05A8E","lang"],
	["antlr","SILHOUETTE","Expr.g4","no brand → #B4683E","tool"],
	["anyscript","BADGE","model.any","no brand → #D0DC68 (dark letters)","lang"],
	["apex","SILHOUETTE","AccountCtrl.cls","Salesforce blue #00A1E0 → #45AEE6","lang"],
	["apib","SILHOUETTE","api.apib","no brand → blueprint #3E6EA8","doc"],
	["apl","GLYPH","matrix.apl","no brand → #4855A4","lang"],
	["applescript","SILHOUETTE","build.applescript","no brand → #B0A99E (neutral lane)","lang"],
	["appscript","BADGE","Code.gs","Apps Script blue → #7288A0 (neutral lane)","lang"],
	["appwrite","SILHOUETTE","appwrite.json","brand #FD366E → #D8506F","tool"],
	["arduino","SILHOUETTE","blink.ino","brand #00979D → #3E9AA0","lang"],
	["asp","BADGE","default.asp","no brand → #6E5E8E (neutral lane)","lang"],
	["aspx","GLYPH","Default.aspx",".NET #512BD4 → #6B79C8","lang"],
	["atom","SILHOUETTE","feed.atom","feed orange #F26522 → #D9843C","doc"],
	["ats","GLYPH","list.ats","no brand → #A89078 (neutral lane)","lang"],
	["autohotkey","GLYPH","hotkeys.ahk","brand AHK green → #4B9B52","lang"],
	["autoit","BADGE","installer.au3","AutoIt blue → #9CBEE2 (light plate, dark letters)","lang"],
	["avalonia","BADGE","MainWindow.axaml","Avalonia violet → #C0A2E8 (light plate, dark letters)","lang"],
	["avro","GLYPH","user.avcs","no brand → #B4A0C0 (neutral lane)","doc"],
	["awk","GLYPH","report.awk","no brand → #96C09A","lang"],
	["axure","SILHOUETTE","wireframe.rp","Axure teal → #3E9184","tool"],
	["azure","SILHOUETTE","deploy.azcli","brand #0078D4 → #2E8BD4","tool"],
	["azurestreamanalytics","SILHOUETTE","query.asaql","R3 azure family → #3C97D8","tool"],
	["bak","GLYPH","settings.bak","no brand → #84868C (neutral lane, dim by design)","doc"],
	["ballerina","BADGE","service.bal","Ballerina orange → #B06E2E","lang"],
	["bashly-hook","SILHOUETTE","src/before.sh","bash green family → #6E9A5A","tool"],
	["bat","SILHOUETTE","build.bat","no brand → #6E8E9E (neutral lane)","lang"],
	["bats","SILHOUETTE","cli.bats","no brand → #8E7FB8","tool"],
	["bazel","SILHOUETTE","BUILD.bazel","Bazel green → #4E9E5E","tool"],
	["bbx","GLYPH","authoryear.bbx","R3 bibliography family → #9A6FA8 (neutral lane)","doc"],
	["beancount","SILHOUETTE","ledger.beancount","no brand → #8A9E4E","doc"],
	["befunge","GLYPH","hello.bf","no brand → #8A3EA8","lang"],
	["behat","SILHOUETTE","behat.yml","Gherkin/BDD green → #6E9E3E","tool"],
	["bench-js","SILHOUETTE","parse.bench.js","R3 js family → #E8D44D","bench"],
	["bench-jsx","SILHOUETTE","render.bench.tsx","R3 react family → #46B5D1","bench"],
	["bench-ts","SILHOUETTE","parse.bench.ts","R3 typescript family → canon #3178C6","bench"],
	["bibliography","SILHOUETTE","refs.bib","no brand → #9A6FA8 (neutral lane)","doc"],
	["bibtex-style","GLYPH","plain.bst","R3 bibliography family → #9A6FA8 (neutral lane)","doc"],
	["bicep","SILHOUETTE","main.bicep","Bicep blue-teal → #3E9BB4","tool"],
	["biml","BADGE","package.biml","no brand → #3E7E2E","lang"],
	["blade","GLYPH","layout.blade.php","Laravel red #FF2D20 → #A8422E","lang"],
	["blink","SILHOUETTE","main.blink","no brand → #6EA8C4","lang"],
	["blitzbasic","BADGE","game.bb","no brand → #BE4E92","lang"],
	["bolt","SILHOUETTE","rules.bolt","no brand → #A0906A (neutral lane, brass)","tool"]
];

const icons = ROSTER.map(([id, archetype, label, palette, group]) => {
	const file = join(ROOT, 'svg', 'file', `${id}.svg`);
	if (!existsSync(file)) { throw new Error(`missing ${file}`); }
	const src = readFileSync(file, 'utf8');
	const inner = src.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
	return { id, archetype, label, palette, group, inner, bytes: Buffer.byteLength(src) };
});

const byGroup = Object.keys(GROUPS).map(g => ({ key: g, name: GROUPS[g], list: icons.filter(i => i.group === g) }));
const totalBytes = icons.reduce((a, i) => a + i.bytes, 0);
const counts = ['BADGE', 'GLYPH', 'SILHOUETTE'].map(a => `${a} ${icons.filter(i => i.archetype === a).length}`).join(' · ');

const defs = `<svg width="0" height="0" aria-hidden="true" style="position:absolute"><defs>
${icons.map(i => `<symbol id="p-${i.id}" viewBox="0 0 16 16">${i.inner}</symbol>`).join('\n')}
</defs></svg>`;

const use = (id, s, alt) =>
	`<svg class="ico" width="${s}" height="${s}" role="img" aria-label="${esc(alt)}"><use href="#p-${id}"/></svg>`;

// 16 px grid, grouped
const GRID = byGroup.map(g => `
  <h3>${esc(g.name)} <span class="cnt">${g.list.length}</span></h3>
  <div class="grid">${g.list.map(i => `<figure><span class="cell">${use(i.id, 16, `${i.id} 16px`)}</span>
    <figcaption>${esc(i.id)}</figcaption></figure>`).join('')}</div>`).join('');

// size ladder
const LADDER = icons.map(i => `
  <tr>
    <th scope="row"><span class="nm">${esc(i.id)}</span><span class="arch">${i.archetype}</span></th>
    <td>${use(i.id, 16, `${i.id} 16px`)}</td>
    <td>${use(i.id, 22, `${i.id} 22px`)}</td>
    <td class="rowcell"><span class="trow">${use(i.id, 16, '')}<span>${esc(i.label)}</span></span></td>
    <td>${use(i.id, 32, `${i.id} 32px`)}</td>
    <td>${use(i.id, 64, `${i.id} 64px`)}</td>
  </tr>`).join('');

// 22 px explorer strips, one per group
const strip = (g, bg) => `<div class="tree"${bg ? ` style="background:${bg}"` : ''}>
  <div class="treehead">${esc(g.name)}</div>
  ${g.list.map(i => `<div class="row">${use(i.id, 16, '')}<span>${esc(i.label)}</span></div>`).join('\n  ')}
</div>`;

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
    --fg:#D7D9DA; --dim:#8A9092; --acc:#6FA8DC;
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
  h3{font:11px/1 var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--dim);
     font-weight:500;margin:26px 0 12px}
  h3 .cnt{color:#5D6467}
  .lede{color:var(--dim);margin:0 0 22px;max-width:80ch}

  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));gap:4px 0;
        background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:14px 8px}
  .grid figure{margin:0;display:flex;flex-direction:column;align-items:center;gap:7px;padding:8px 4px}
  .cell{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;
        border-radius:5px;background:var(--bg)}
  figcaption{font:10px/1.3 var(--mono);color:var(--dim);text-align:center;word-break:break-all}

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
  .treehead{font:10px/1.3 var(--mono);color:var(--dim);letter-spacing:.06em;padding:6px 14px 12px}
  .tree .row{display:flex;align-items:center;gap:7px;padding:0 14px;height:22px}
  .tree .row span{font:13px/1 var(--sans);color:#CCCCCC;white-space:nowrap}
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
  <h1>${esc(TITLE)} — long-tail contact sheet</h1>
  <p class="sub">Slice A01 of the M11 full-coverage wave (spec.md §11): ${icons.length} hand-authored
  SVGs. No &lt;text&gt;, no font-family, no gradients, no external references — every letterform is
  an Inter&nbsp;Bold outline baked by tools/letterpath.mjs. Real marks wherever they survive the
  16&nbsp;px proof; letters are the fallback, not the default.</p>
  <div class="meta">
    <span class="tag">${icons.length} icons</span>
    <span class="tag">${counts}</span>
    <span class="tag">${totalBytes} bytes total</span>
    <span class="tag">avg ${Math.round(totalBytes / icons.length)} B</span>
    <span class="tag">max ${Math.max(...icons.map(i => i.bytes))} B</span>
    <span class="tag">bg #121314</span>
  </div>
</header>

<section>
  <h2>16 px grid</h2>
  <p class="lede">The primary render, grouped by concept family. Nothing here may rely on a
  size above 16&nbsp;px to be readable.</p>
  ${GRID}
</section>

<section>
  <h2>Explorer strips — 22 px rows</h2>
  <p class="lede">The real usage context: 16&nbsp;px icons on 22&nbsp;px tree rows, with the
  filenames this slice's matchers actually claim. Top block on the editor background, second
  block on #1E1E1E.</p>
  <div class="strips">${byGroup.map(g => strip(g)).join('')}</div>
  <div style="height:18px"></div>
  <div class="strips alt">${byGroup.map(g => strip(g, '#1E1E1E')).join('')}</div>
</section>

<section>
  <h2>Size ladder</h2>
  <p class="lede">16&nbsp;px is the target; the 22&nbsp;px tree row is the context;
  32 and 64 only have to stay clean.</p>
  <table>
    <thead><tr><th>concept</th><th>16</th><th>22</th><th>tree row (22 px)</th><th>32</th><th>64</th></tr></thead>
    <tbody>${LADDER}</tbody>
  </table>
</section>

<section>
  <h2>Manifest</h2>
  <table class="ftable">
    <thead><tr><th>id</th><th>path</th><th>archetype</th><th class="num">bytes</th><th>colour source</th></tr></thead>
    <tbody>${TABLE}</tbody>
    <tfoot><tr><td colspan="3">${icons.length} icons — ${counts}</td><td class="num">${totalBytes}</td><td>—</td></tr></tfoot>
  </table>
</section>
</div>
`;

const out = join(ROOT, 'contact-A01.html');
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
	const probe = join(tmpdir(), `m11-a01-probe-${process.pid}.html`);
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
	const png = join(ROOT, 'contact-A01.png');
	const r = shoot(out, png);
	console.log(`${png}  (${r.width}x${r.height} css px at 2x, ${Buffer.byteLength(readFileSync(png))} bytes)`);
	console.log(`  renderer: ${r.bin}`);
}
