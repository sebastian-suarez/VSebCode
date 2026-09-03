#!/usr/bin/env node
// fidelity.mjs — the standing gate round 1 had no answer for.
//
// Per subject: the ORIGINAL artwork the brand ships, rendered verbatim; the fitted
// master this set derives from it; and that master at a true 16 px. The question
// the strip has to answer honestly is "would someone who knows this brand call the
// master the real logo?".
//
//   node tools/fidelity.mjs [new|all|fix] [out.png]
//   node tools/fidelity.mjs A01 [out.png]
//
// `fix` is the two subjects the pilot gate rejected and the fix round rebuilt. With
// a slice id every subject the slice built gets a row, and the slice's registry
// supplies what the brand ships (its ORIGINAL map) instead of the pilot's table.

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import * as si from 'simple-icons';
import { SUBJECTS, NEW, SUPERSEDED, FOLDERS, spec, officialSvg } from './sources.mjs';
import { resolveTarget, sliceArg } from './targets.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const target = await resolveTarget();
const isSlice = target.kind === 'slice';
const R = target.registry;
const OUT = target.dir;
const rest = process.argv.slice(2).filter(a => a !== sliceArg() && !a.startsWith('--slice='));
const which = isSlice ? 'all' : (['all', 'fix'].includes(rest[0]) ? rest[0] : 'new');
const png = (isSlice ? rest[0] : rest[1]) || join(OUT, 'proofs', `fidelity-${which}.png`);

const file = (f) => readFileSync(join(ROOT, 'sources-svg', f), 'utf8')
	.replace(/<\?xml[^>]*\?>/, '').replace(/<!--[\s\S]*?-->/g, '')
	.replace(/<style[^>]*>[\s\S]*?<\/style>/g, '');
const siSvg = (slug, fill) => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">'
	+ `<path fill="${fill}" d="${si['si' + slug[0].toUpperCase() + slug.slice(1)].path}"/></svg>`;

// what the brand actually ships, unmodified — the pilot's table; a slice brings
// its own, declared per tranche next to the spec that uses it
const PILOT_ORIGINAL = {
	typescript: () => siSvg('typescript', '#3178C6'),
	// the brand's own CorelDRAW export, fills inlined out of its <style> block
	editorconfig: () => officialSvg('editorconfig-official.svg'),
	json: () => null,
	markdown: () => file('markdown-official.svg').replace('fill="#000"', 'fill="#E0E0E0"'),
	docker: () => siSvg('docker', '#2496ED'),
	python: () => siSvg('python', '#3776AB'),
	react: () => file('react-official.svg'),
	eslint: () => file('eslint-official.svg'),
	prettier: () => file('prettier-icon-clean-centred.svg'),
	rust: () => siSvg('rust', '#CE422B'),
	// npm's own file parks its two fills in a <style> block; inline them so the
	// source pane shows what the brand actually ships and not two black paths
	npm: () => file('npm-official-n.svg')
		.replace(/class="cls-1"/, 'fill="#C12127"').replace(/class="cls-2"/, 'fill="#FFFFFF"'),
	dotenv: () => file('dotenv-official.svg'),
	yaml: () => siSvg('yaml', '#CB171E'),
	git: () => file('git-official.svg'),
	go: () => file('go-official.svg'),
	vue: () => file('vue-official.svg'),
	'folder-src': () => null,
	'folder-node': () => siSvg('nodedotjs', '#5FA04E'),
	'folder-test': () => null,
	'folder-docker': () => siSvg('docker', '#2496ED')
};

const ORIGINAL = isSlice ? R.ORIGINAL : PILOT_ORIGINAL;
const IDS = isSlice ? R.SUBJECTS
	: which === 'all' ? SUBJECTS : which === 'fix' ? SUPERSEDED : NEW;
const specOf = (id) => (isSlice ? R.spec(id) : spec(id));
const isFolderOf = (id) => (isSlice ? R.FOLDERS.includes(id) : FOLDERS.includes(id));
// sources declare their own px/pt sizing all over the place — drop it on the root
// <svg> only, then ask for the size this pane wants
const size = (s, px) => s.replace(/<svg\b[^>]*>/, (tag) => tag
	.replace(/\s(?:width|height)="[^"]*"/g, '')
	.replace('<svg', `<svg width="${px}" height="${px}"`));

let html = `<!doctype html><meta charset="utf-8"><style>
body{background:#1b1e21;color:#c9d1d9;font:11px ui-monospace,SFMono-Regular,monospace;margin:0;padding:16px}
h1{font:600 15px system-ui;margin:0 0 4px;color:#e6edf3}
p.lead{color:#8b949e;margin:0 0 14px;max-width:920px;font:12px/1.5 system-ui}
.row{display:flex;align-items:center;gap:14px;background:#232629;border-radius:8px;
	padding:9px 12px;margin-bottom:7px}
.name{width:118px;font:600 12px system-ui;color:#e6edf3}
.pane{background:#121314;border-radius:5px;padding:5px;display:flex;align-items:center;
	justify-content:center;width:74px;height:74px}
.pane.sm{width:34px;height:34px}
.lbl{font-size:9px;color:#6e7681;width:52px}
.notes{flex:1;color:#8b949e;font:11px/1.45 system-ui}
.notes b{color:#c9d1d9;font-weight:600}
.miss{color:#6e7681;font-style:italic}
</style><body>
<h1>${isSlice ? `M20 slice ${R.id}` : 'M20 pilot'} · fidelity proof — ${isSlice
	? `all ${IDS.length} subjects` : which === 'all' ? 'all 20 marks'
		: which === 'fix' ? 'the two marks the pilot gate rejected, rebuilt'
			: 'the 6 new file marks + 2 new folder marks'}</h1>
<p class="lead">Left: the artwork the brand ships, rendered verbatim. Middle: the fitted master
this set derives from it (folders show the shipped closed icon, whose white glyph is that
master at face scale). Right: the shipped icon at a true 16&nbsp;px. ${isSlice
	? 'Mark-less concepts are exempt — no brand owns them, so there is nothing to be faithful to.'
	: 'json, folder-src and\nfolder-test are exempt — no brand owns those concepts.'}</p>`;

for (const id of IDS) {
	const s = specOf(id);
	const orig = ORIGINAL[id]();
	const isFolder = isFolderOf(id);
	const m = readFileSync(join(OUT, isFolder ? 'icons' : 'masters', `${id}.svg`), 'utf8').trim();
	const shipped = readFileSync(join(OUT, 'icons', `${id}.svg`), 'utf8').trim();
	const simp = (s.simplifications || []);
	html += `<div class="row"><div class="name">${id}</div>`
		+ '<div class="lbl">source</div>'
		+ `<div class="pane">${orig ? size(orig, 64) : '<span class="miss">n/a</span>'}</div>`
		+ `<div class="lbl">${isFolder ? 'shipped' : 'master'}</div><div class="pane">${size(m, 64)}</div>`
		+ `<div class="pane sm">${size(shipped, 16)}</div>`
		+ `<div class="notes"><b>${s.source.name}</b>`
		+ (s.source.slug ? ` · ${s.source.slug}` : '')
		+ (simp.length ? `<br>${simp.map(x => '— ' + x).join('<br>')}`
			: '<br>— no simplification: the source geometry is used as published')
		+ '</div></div>';
}
html += '</body>';

const tmp = join(tmpdir(), `m20.fidelity.${target.id}.html`);
writeFileSync(tmp, html);
// a row is as tall as its simplification log, so the strip has to grow with it —
// the fix round's two subjects carry four and five logged cuts each
// a slice's logs run longer than the pilot's, so its rows are sized from the text
// that will actually wrap rather than from a flat per-entry allowance
const rowHeight = isSlice
	? (id) => Math.max(116, 84 + 19 * (specOf(id).simplifications || [])
		.reduce((a, t) => a + Math.max(1, Math.ceil(t.length / 100)), 1))
	: (id) => Math.max(116, 76 + 42 * (specOf(id).simplifications || []).length);
execFileSync('node', [join(HERE, 'shot.mjs'), tmp, png, '1200',
	String(210 + IDS.reduce((a, id) => a + rowHeight(id), 0)), '2']);
console.log(`wrote ${png} — ${IDS.length} subjects`);
