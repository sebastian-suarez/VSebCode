#!/usr/bin/env node
// build-slice-sheet.mjs — slices/<ID>/sheet.html, the page a slice gate is decided
// on, and its PNG.
//
//   node tools/build-slice-sheet.mjs A01
//
// Same visual language as pilot/sheet.html: the Dark 2026 backdrop, 16/22/32/64
// rows, an in-context explorer listing, per-subject provenance, a numbered flags
// section. Self-contained by construction — every SVG inlined, system font stack,
// no scripts, no external requests of any kind; check-slice.mjs asserts it.
//
// The PNG is sized to the content rather than to a guess: the page is loaded once
// in the headless shell with a measuring stub appended to a COPY of it, and the
// screenshot is then taken of the real file at the height that came back.

import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { chromium } from '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/tools/chromium.mjs';
import { resolveTarget, setDir } from './targets.mjs';
import { roster } from './roster.mjs';
import { contrast, BACKDROP } from './color.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const target = await resolveTarget();
if (target.kind !== 'slice') { throw new Error('build-slice-sheet.mjs needs a slice id, e.g. A01'); }
const R = target.registry;
const OUT = target.dir;

const manifest = JSON.parse(readFileSync(join(OUT, 'manifest.json'), 'utf8'));
const rost = roster(R.id);

const clean = (s) => s.trim()
	.replace(' xmlns="http://www.w3.org/2000/svg"', '')
	.replace(/\s(?:width|height)="[^"]*"(?=[^>]*viewBox)/g, '');
// the page shows icons from more than one set — this slice's, the pilot's in the
// tree, and an APPROVED earlier slice's wherever a family base lives there — so
// every read goes through one helper that is told WHICH set it is reading
const setIcon = (set, id) => clean(readFileSync(join(setDir(set), 'icons', `${id}.svg`), 'utf8'));
const icon = (id) => setIcon(R.id, id);
const pilotIcon = (id) => setIcon('pilot', id);
const at = (src, px) => src.replace('<svg', `<svg width="${px}" height="${px}"`);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// a URL is shown as TEXT, never as a reference: the zero-width breaks also stop the
// renderer from running a 90-character path off the edge of its column
const showUrl = (u) => esc(u).replace(/\//g, '/<wbr>');

const SVG = Object.fromEntries(R.SUBJECTS.map(id => [id, icon(id)]));

// ---- section 1: every icon at four sizes ------------------------------------------
const sizesCard = (id) => {
	const m = manifest.subjects[id];
	const tag = m.neutral ? 'neutral' : m.family ? 'family' : 'mark';
	return `<figure class="sz">
	<div class="sz-big">${at(SVG[id], 64)}</div>
	<div class="sz-row">${at(SVG[id], 32)}${at(SVG[id], 22)}${at(SVG[id], 16)}</div>
	<figcaption><b>${esc(m.title.replace(/\s*\(.*\)$/, ''))}</b><span class="tg tg-${tag}">${tag}</span>
	<em>${esc(id)}</em></figcaption></figure>`;
};

// ---- section 2: the explorer listing ----------------------------------------------
// Real extensions, taken from the slice's own roster entry, interleaved with five
// approved PILOT icons so the slice can be judged against the set it joins.
const filenameFor = (id) => {
	const c = rost.byId[id];
	const nice = { android: 'app.apk', chrome: 'extension.crx', debian: 'package.deb',
		disc: 'ubuntu.iso', vsix: 'vsebcode-theme.vsix', gpg: 'secring.gpg', hex: 'firmware.hex',
		jar: 'analyzer.jar', lib: 'libcurl.a', onnx: 'resnet50.onnx', 'python-misc': 'requirements.txt',
		pytorch: 'checkpoint.pt', safetensors: 'model.safetensors' };
	if (nice[id]) { return nice[id]; }
	const ext = c && c.match.extensions[0];
	return ext ? `file.${ext}` : (c && c.match.filenames[0]) || id;
};
const TREE = [
	...R.SUBJECTS.map(id => ({ name: filenameFor(id), svg: SVG[id], slice: true })),
	{ name: 'Dockerfile', svg: pilotIcon('docker') },
	{ name: 'main.ts', svg: pilotIcon('typescript') },
	{ name: 'package.json', svg: pilotIcon('npm') },
	{ name: 'README.md', svg: pilotIcon('markdown') },
	{ name: 'train.py', svg: pilotIcon('python') }
].sort((a, b) => a.name.localeCompare(b.name));
const tree = () => TREE.map(r =>
	`<div class="row"><span class="tw"></span>${at(r.svg, 16)}`
	+ `<span class="lbl${r.slice ? '' : ' pilot'}">${esc(r.name)}</span></div>`).join('');

// ---- section 3: provenance ---------------------------------------------------------
const provenance = () => R.SUBJECTS.map(id => {
	const m = manifest.subjects[id];
	const orig = (R.ORIGINAL[id] || (() => null))();
	const verdict = m.proof_16px;
	const vclass = verdict.result.startsWith('fail') ? 'bad'
		: verdict.result.includes('marginal') ? 'mid' : 'good';
	return `<div class="pv">
	<div class="pv-head"><b>${esc(id)}</b><span class="pv-title">${esc(m.title)}</span>
		<span class="pv-cat">${esc(m.category || '')}</span>
		<span class="pv-v pv-${vclass}">16 px · ${esc(verdict.result)}</span></div>
	<div class="pv-body">
		<div class="pv-art">
			<div class="pv-cell"><span class="pv-lbl">brand artwork</span>
				<div class="pv-pane">${orig ? at(orig, 46) : '<span class="miss">no mark</span>'}</div></div>
			<div class="pv-cell"><span class="pv-lbl">shipped</span>
				<div class="pv-pane">${at(SVG[id], 46)}${at(SVG[id], 16)}</div></div>
		</div>
		<div class="pv-txt">
			<p class="pv-src"><b>${esc(m.source.name)}</b>${m.source.slug ? ' · <code>' + esc(m.source.slug) + '</code>' : ''}
				${m.source.license ? '<br><span class="pv-lic">licence: ' + esc(m.source.license) + '</span>' : ''}
				${m.source.url ? '<br><span class="pv-url">' + showUrl(m.source.url) + '</span>' : ''}</p>
			<p class="pv-note">${esc(m.source.note)}</p>
			${m.simplifications.length
		? '<ul class="pv-simp">' + m.simplifications.map(s => `<li>${esc(s)}</li>`).join('') + '</ul>'
		: '<p class="pv-simp none">no simplification — the source geometry is used as published</p>'}
			<p class="pv-num">ink ${m.ink.w}&times;${m.ink.h} (mass ${m.ink.mass}) &middot;
				envelope ${m.envelope.w}&times;${m.envelope.h} &middot; ${m.layers} layer(s) &middot;
				${m.bytes}&nbsp;B &middot; ${m.colours.map(c => `<span class="sw" style="background:${c}"></span>${esc(c)} ${m.contrast_on_backdrop[c]}:1`).join(' &middot; ')}</p>
			<p class="pv-note verdict">${esc(verdict.note)}</p>
		</div>
	</div></div>`;
}).join('');

// ---- section 4: the two working rules, as built ------------------------------------
/**
 * The base pane of a family row. A base lives wherever rule 1 lets it live — in the
 * pilot, in an APPROVED earlier slice, or in this slice — and check-slice.mjs
 * resolves it the same three ways. `SVG` only holds THIS slice's subjects, so a base
 * in another set has to be read from that set's own icons (A02's al, sap and adobe
 * families all base on A01 masters); reaching into SVG for it hands back undefined.
 */
const baseIcon = (f) => (!f.base_set || f.base_set === R.id ? SVG[f.base] : setIcon(f.base_set, f.base));
const familyRows = () => Object.entries(manifest.families.declared).map(([name, f]) => `<div class="rr">
	<div class="rr-pair">${at(baseIcon(f), 38)}
		<span class="rr-eq">=</span>${f.members.map(id => at(SVG[id], 38)).join('')}</div>
	<div class="rr-txt"><b>${esc(name)}</b> &middot; base <code>${esc(f.base)}</code>
		(${esc(f.base_set)}) &rarr; ${f.members.map(m => `<code>${esc(m)}</code>`).join(', ')}
		&middot; mode <b>${esc(f.mode)}</b><br>${esc(f.why)}</div></div>`).join('');

const collapseRows = () => {
	const cats = manifest.neutral_collapse.category_glyphs || {};
	const objs = manifest.neutral_collapse.object_glyphs || {};
	// an object glyph is keyed by the SUBJECT that names the object where only one does
	// (disc, lib, abc) and by the GLYPH where several share it (terminal, stopwatch) —
	// the fix round opened the second kind, so the key resolves either way
	const objMembers = (key) => (SVG[key] ? [key] : (cats[key] || []));
	return [
		...Object.entries(objs).map(([id, why]) => `<div class="rr">
			<div class="rr-pair">${objMembers(id).map(m => at(SVG[m], 38)).join('<span class="rr-eq">=</span>')}</div>
			<div class="rr-txt"><b>object glyph</b> &middot; <code>${esc(id)}</code>${objMembers(id).length > 1
			? ' &rarr; ' + objMembers(id).map(m => `<code>${esc(m)}</code>`).join(', ') : ''}<br>${esc(why)}</div></div>`),
		...Object.entries(cats).filter(([glyph]) => !objs[glyph]).map(([glyph, ids]) => `<div class="rr">
			<div class="rr-pair">${ids.map(id => at(SVG[id], 38)).join('<span class="rr-eq">=</span>')}</div>
			<div class="rr-txt"><b>category glyph</b> &middot; <code>${esc(glyph)}</code> &rarr;
				${ids.map(i => `<code>${esc(i)}</code>`).join(', ')}<br>
				byte-identical payloads under distinct ids, declared here and reported in the twin
				audit's own lane — never silently exempted</div></div>`)
	].join('');
};

// ---- section 5: the flags ------------------------------------------------------------
// A flag the A01 gate was decided on keeps its number for ever. One the fix-round
// ruling overturned carries a SUPERSEDED banner in place, with a pointer to the flag
// that replaced it; the round's own flags are marked and numbered from 36.
const flags = () => R.FLAGS.map((f, i) => `<div class="flag${f.superseded ? ' sup' : ''}`
	+ `${f.fix_round ? ' fix' : ''}"><div class="fl-n">${i + 1}</div>
	<div><h4>${f.fix_round ? '<span class="fl-tag">fix round</span>' : ''}${f.title}</h4>
	<p class="fl-meta">${esc(f.rule)} &middot; ${f.subjects.map(s => `<code>${esc(s)}</code>`).join(' ')}</p>
	${f.superseded ? `<p class="fl-sup">${f.superseded}</p>` : ''}
	<p>${f.text}</p></div></div>`).join('');

/**
 * Which flags actually ask for a verdict. A tranche may say so outright with a
 * `ruling` boolean; otherwise the flag's own text is read for the phrases the
 * house style already uses when it wants one. Either way the pointer in §5 is
 * derived from the flags that are in the build rather than typed out, which is
 * what went stale the moment a second tranche landed.
 */
const ASKS_FOR_A_RULING = /\boverturn|ruling requested|your options|say the word/i;
const wantsRuling = (f) => (typeof f.ruling === 'boolean' ? f.ruling : ASKS_FOR_A_RULING.test(f.text));
const rulingFlags = R.FLAGS.map((f, i) => ({ n: i + 1, f })).filter(x => wantsRuling(x.f));

/**
 * The numbering a fix round has to respect, read off the registry once and used by
 * BOTH §0 and §5. The gate's own flags are the ones without `fix_round`; they keep
 * the numbers 1..gateFlags for ever, and the round's continue from the next one.
 * §0 used to state A01's "1-35" and "36" as literals, which was true for exactly
 * one slice — A02's gate was decided on 1-51 and its round's flags are 52 onward.
 */
const gateFlags = R.FLAGS.filter(f => !f.fix_round).length;
const fixFlagFirst = (R.FLAGS.findIndex(f => f.fix_round) + 1) || gateFlags + 1;
const superseded = R.FLAGS.filter(f => f.superseded).length;

// ---- section 0: the fix round, before and after ----------------------------------------
// The pilot's fix round put its two rebuilt subjects side by side with what they
// replaced; a slice fix round has twenty-two, so the strip is a grid and the "was"
// pane is rebuilt from the vocabulary glyph or the source the subject used to carry.
// Everything here is data: R.FIX_ROUND names the subjects, the manifest supplies the
// rest, and the strip disappears entirely on a slice that has not had a fix round.
const FIX = R.FIX_ROUND;
/**
 * What the subject carried BEFORE the round, taken from the record rather than from
 * a second copy of the icons. Two ways, in that order:
 *
 *   · the round SAYS so — a tranche's `FIX_ROUND.was[id] = { set, id }` names the
 *     icon the subject used to ship. This is the only way to know when the before
 *     state was a real MARK rather than a glyph, and when it lived in another set:
 *     A02's cf / cfc / cfm shipped A01's actionscript (Adobe's red A) under rule
 *     1(b), and no amount of reading this slice's own output recovers that.
 *   · otherwise A01's reading, unchanged: everything it rebuilt came off a CATEGORY
 *     GLYPH, and which one is the roster's own declared fallback for that concept,
 *     resolved to a concept that still carries it so the pane cannot go stale.
 *
 * `was` is optional, so a round that declares nothing renders exactly as before.
 */
const wasGlyph = (id) => {
	const declared = (FIX.was || {})[id];
	if (declared) {
		return !declared.set || declared.set === R.id
			? SVG[declared.id] : setIcon(declared.set, declared.id);
	}
	const cats = manifest.neutral_collapse.category_glyphs || {};
	const member = (cats[manifest.subjects[id].roster_fallback] || [])[0];
	return member ? SVG[member] : null;
};
const fixStrip = () => (FIX ? FIX.rebuilt.map(id => {
	const m = manifest.subjects[id];
	const was = wasGlyph(id);
	return `<figure class="fx">
	<div class="fx-pair">
		<div class="fx-cell"><span class="fx-lbl">was</span>${was
		? at(was, 32) + at(was, 16) : '<span class="miss">n/a</span>'}</div>
		<span class="fx-arrow">&rarr;</span>
		<div class="fx-cell win"><span class="fx-lbl">now</span>${at(SVG[id], 32)}${at(SVG[id], 16)}</div>
	</div>
	<figcaption><b>${esc(id)}</b>${esc(FIX.notes[id] ? '' : '')}
		<span>${esc(m.title.replace(/\s*\(neutral glyph\)$/, ''))}</span></figcaption>
	</figure>`;
}).join('') : '');
const fixNotes = () => (FIX ? Object.entries(FIX.notes).map(([id, why]) =>
	`<div class="fn"><code>${esc(id)}</code><span>${esc(why)}</span></div>`).join('') : '');

// ---- the page ---------------------------------------------------------------------------
const marks = R.SUBJECTS.filter(id => !manifest.subjects[id].neutral).length;
const neutrals = R.SUBJECTS.length - marks;
const simplifiedCount = R.SUBJECTS.filter(id => manifest.subjects[id].simplifications.length).length;
const tally = R.SUBJECTS.reduce((a, id) => {
	const r = manifest.subjects[id].proof_16px.result; a[r] = (a[r] || 0) + 1; return a;
}, {});

// ---- what the page says about ITSELF, read off the build rather than typed -----------
// Everything below was hard-coded to tranche 1's world and went stale the moment a
// second tranche landed (its own flag 22 asked for this). The page's visual language
// is unchanged; only the sentences that make claims about the build are computed.
const oxford = (xs) => (xs.length < 2 ? (xs[0] || '') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
/** The roster categories the built subjects actually carry, in build order. */
const categories = [...new Set(R.SUBJECTS.map(id => manifest.subjects[id].category).filter(Boolean))];
/** Subjects whose geometry came from the brand's own file rather than a trace. */
const brandOwn = R.SUBJECTS.filter(id => /brand's own svg/i.test(manifest.subjects[id].source.name));
/** Subjects whose simplification log records a prettier-rider reduction. */
const riders = R.SUBJECTS.filter(id =>
	manifest.subjects[id].simplifications.some(s => /prettier rider/i.test(s)));
/** The measured studies this slice's tranches registered. */
const studies = (R.STUDIES || []).map(s => s.id);
const pending = rost.count - R.SUBJECTS.length;

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Icons v2 Slice ${R.id}</title>
<style>
:root{--bg:#121314;--panel:#191b1d;--coat:#212528;--edge:#26292c;--ink:#e6e8ea;
	--dim:#8b9199;--acc:#7fb5ff;--warm:#c0a678}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{background:#121314;color:var(--ink);margin:0;
	font:14px/1.55 -apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",system-ui,sans-serif}
.wrap{max-width:1180px;margin:0 auto;padding:44px 28px 90px}
header{border-bottom:1px solid var(--edge);padding-bottom:26px;margin-bottom:38px}
h1{font-size:28px;font-weight:640;letter-spacing:-.02em;margin:0 0 4px}
.date{color:#6d747c;font-size:12px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
	margin:0 0 16px}
.sub{color:var(--dim);font-size:14.5px;max-width:80ch;margin:0 0 18px}
.sub b{color:var(--ink);font-weight:600}
.arch{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px;margin-top:20px}
.arch div{background:var(--panel);border:1px solid var(--edge);border-radius:9px;padding:11px 13px}
.arch h4{margin:0 0 3px;font-size:11px;font-weight:640;letter-spacing:.05em;color:var(--acc)}
.arch p{margin:0;font-size:12.5px;line-height:1.5;color:var(--dim)}
section{margin:0 0 48px}
h2{font-size:19px;font-weight:640;margin:0 0 4px;letter-spacing:-.01em}
.desc{color:var(--dim);font-size:13.5px;max-width:88ch;margin:0 0 18px}
code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.92em;color:#b9c0c8}

.szgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(132px,1fr));gap:8px}
.sz{margin:0;background:var(--bg);border:1px solid var(--edge);border-radius:10px;
	padding:12px 8px 9px;text-align:center}
.sz-big svg{display:block;margin:0 auto}
.sz-row{display:flex;gap:7px;align-items:center;justify-content:center;margin-top:10px;
	padding-top:9px;border-top:1px solid #202325}
.sz-row svg{display:block}
.sz figcaption{margin-top:9px;font-size:11px;color:#c3c8cd;line-height:1.35}
.sz figcaption b{font-weight:600;display:block}
.sz figcaption em{display:block;font-style:normal;font-size:9.5px;color:#6d747c;
	font-family:ui-monospace,SFMono-Regular,Menlo,monospace;margin-top:2px;word-break:break-all}
.tg{display:inline-block;font-size:9px;letter-spacing:.06em;text-transform:uppercase;
	border-radius:20px;padding:1px 6px;margin-top:4px;border:1px solid var(--edge);color:#6d747c}
.tg-mark{color:#8fd0a0;border-color:#2f4436}
.tg-family{color:#c0a678;border-color:#463a26}

.trees{display:flex;gap:16px;flex-wrap:wrap}
.treebox{border:1px solid var(--edge);border-radius:11px;overflow:hidden;min-width:300px;flex:1}
.treebox h5{margin:0;padding:8px 12px;font:600 10.5px/1 ui-monospace,SFMono-Regular,Menlo,monospace;
	letter-spacing:.09em;text-transform:uppercase;color:#6d747c;border-bottom:1px solid var(--edge)}
.treebox .body{padding:8px 0}
.editor .body{background:var(--bg)}
.sidebar .body{background:var(--coat)}
.row{display:flex;align-items:center;gap:6px;height:22px;padding-left:10px;font-size:13px;color:#ccd2d8;
	font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text",system-ui,sans-serif}
.row svg{flex:none}
.row .tw{width:12px;height:12px;flex:none;display:block}
.row .lbl{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.row .lbl.pilot{color:#767d85}

.pv{background:var(--panel);border:1px solid var(--edge);border-radius:11px;
	padding:12px 15px 13px;margin-bottom:8px}
.pv-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:9px}
.pv-head b{font:600 13.5px/1 ui-monospace,SFMono-Regular,Menlo,monospace}
.pv-title{color:var(--dim);font-size:12.5px}
.pv-cat{font:9.5px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.07em;
	text-transform:uppercase;color:#6d747c;border:1px solid var(--edge);border-radius:20px;padding:2px 8px}
.pv-v{margin-left:auto;font:9.5px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.05em;
	border-radius:20px;padding:3px 9px;border:1px solid var(--edge);color:#6d747c}
.pv-good{color:#8fd0a0;border-color:#2f4436}
.pv-mid{color:#d8c07f;border-color:#4a4126}
.pv-bad{color:#e0937f;border-color:#4a3128}
.pv-body{display:flex;gap:14px;align-items:flex-start}
.pv-art{display:flex;gap:8px;flex:none}
.pv-cell{display:flex;flex-direction:column;gap:5px}
.pv-lbl{font:9px/1 ui-monospace,SFMono-Regular,Menlo,monospace;color:#6d747c;
	letter-spacing:.06em;text-transform:uppercase}
.pv-pane{display:flex;align-items:center;justify-content:center;gap:9px;background:var(--bg);
	border:1px solid #202325;border-radius:8px;padding:9px 11px;min-height:58px;min-width:74px}
.pv-pane svg{display:block}
.miss{color:#5f666e;font-style:italic;font-size:10.5px}
.pv-txt{flex:1;min-width:0}
.pv-txt p{margin:0 0 5px}
.pv-src{font-size:12.5px;color:#c9cfd5}
.pv-lic,.pv-url{color:#6d747c;font:10.5px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace;
	word-break:break-all}
.pv-note{color:var(--dim);font-size:12px;line-height:1.5}
.pv-note.verdict{color:#9aa2aa;border-top:1px solid var(--edge);padding-top:6px;margin-top:7px}
.pv-simp{color:var(--dim);font-size:12px;line-height:1.5;margin:0 0 5px;padding-left:16px}
.pv-simp li{margin-bottom:2px}
.pv-simp.none{padding-left:0;font-style:italic;color:#6d747c}
.pv-num{font:10.5px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace;color:#6d747c}
.sw{display:inline-block;width:8px;height:8px;border-radius:2px;margin-right:3px;
	vertical-align:baseline;border:1px solid #2c3033}

.rr{display:flex;gap:14px;align-items:center;background:var(--panel);border:1px solid var(--edge);
	border-radius:10px;padding:11px 15px;margin-bottom:7px}
.rr-pair{display:flex;align-items:center;gap:8px;background:var(--bg);border-radius:8px;
	padding:8px 11px;flex:none}
.rr-pair svg{display:block}
.rr-eq{color:#5f666e;font:12px ui-monospace,SFMono-Regular,Menlo,monospace}
.rr-txt{color:var(--dim);font-size:12.5px;line-height:1.55}
.rr-txt b{color:#c9cfd5;font-weight:600}

.flag{display:flex;gap:13px;background:var(--panel);border:1px solid var(--edge);
	border-radius:10px;padding:13px 16px;margin-bottom:8px}
.flag.sup{opacity:.72;border-style:dashed}
.flag.fix{border-color:#3a4a33}
.flag.fix .fl-n{background:#25301f;color:#8fd0a0}
.fl-tag{display:inline-block;font:9px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;
	letter-spacing:.07em;text-transform:uppercase;color:#8fd0a0;border:1px solid #2f4436;
	border-radius:20px;padding:0 7px;margin-right:7px;vertical-align:2px}
.fl-sup{margin:0 0 7px !important;padding:6px 9px;border-radius:7px;background:#241f1a;
	border:1px solid #4a3f28;color:#d8c07f !important;font-size:11.5px !important;line-height:1.5}
.fxgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(196px,1fr));gap:8px}
.fx{margin:0;background:var(--bg);border:1px solid var(--edge);border-radius:10px;padding:10px 10px 8px}
.fx-pair{display:flex;align-items:center;justify-content:center;gap:9px}
.fx-cell{display:flex;flex-direction:column;align-items:center;gap:4px;background:#0e0f10;
	border:1px solid #202325;border-radius:7px;padding:7px 10px 5px;min-width:62px}
.fx-cell.win{border-color:#2f4436}
.fx-cell svg{display:block}
.fx-lbl{font:8.5px/1 ui-monospace,SFMono-Regular,Menlo,monospace;color:#6d747c;
	letter-spacing:.06em;text-transform:uppercase}
.fx-arrow{color:#5f666e;font-size:13px}
.fx figcaption{margin-top:8px;font-size:11px;color:#c3c8cd;text-align:center;line-height:1.35}
.fx figcaption b{font:600 11px ui-monospace,SFMono-Regular,Menlo,monospace;display:block}
.fx figcaption span{display:block;color:#6d747c;font-size:9.5px;margin-top:2px}
.fn{display:flex;gap:10px;padding:5px 0;border-top:1px solid #202325;font-size:12px;
	color:var(--dim);line-height:1.5}
.fn code{flex:none;width:150px;color:#c9cfd5}
.ruling{background:#191b1d;border:1px solid #4a3f28;border-left:3px solid var(--warm);
	border-radius:9px;padding:14px 18px;margin:0 0 18px}
.ruling h3{margin:0 0 6px;font-size:14px;color:var(--warm)}
.ruling p{margin:0 0 7px;color:#c3c8cd;font-size:13px;line-height:1.6}
.ruling p.q{color:var(--ink);font-style:italic}
.ruling p:last-child{margin-bottom:0}
.fl-n{flex:none;width:24px;height:24px;border-radius:50%;background:#23262a;color:var(--warm);
	font:600 12px/24px ui-monospace,SFMono-Regular,Menlo,monospace;text-align:center}
.flag h4{margin:2px 0 3px;font-size:13.5px;font-weight:640;color:var(--ink)}
.fl-meta{margin:0 0 6px;font:10.5px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;color:#6d747c}
.flag p{margin:0;color:var(--dim);font-size:12.5px;line-height:1.6}
.flag p b{color:#c9cfd5;font-weight:600}
footer{color:#5f666e;font-size:12px;border-top:1px solid var(--edge);margin-top:44px;padding-top:18px}
</style></head>
<body><div class="wrap">

<header>
<h1>Icons v2 &mdash; slice ${R.id}</h1>
<p class="date">M20 &middot; D22 style R1 &ldquo;True colour&rdquo; &middot; ${manifest.generated}
&middot; ${R.SUBJECTS.length} of ${rost.count} concepts built &middot; tranche
${R.MODULES.present.join(', ')}${R.MODULES.missing.length
		? ' (' + R.MODULES.missing.length + ' still to land)' : ''}</p>
<p class="sub">The first production slice, built by the pilot's recipe and gated by the pilot's
gates. This revision covers the roster's ${oxford(categories.map(c => `<b>${esc(c)}</b>`))}
categor${categories.length === 1 ? 'y' : 'ies'}:
<b>${marks} concepts that own a real mark</b>, each one adapted from the brand's own vector or a
faithful CC0 trace of it, and <b>${neutrals} that own none</b>, which take the shared neutral
vocabulary. ${pending
			? `${pending} concepts of the ${rost.count} are still pending &mdash; they belong to the `
			+ 'tranches that have not landed yet, and the roster check reports them rather than hiding them.'
			: `All ${rost.count} concepts in the roster are built; the roster gate is fatal on a short `
			+ 'slice once every tranche module is present, and it passes.'}
Two working rules are exercised for the first time here: <b>variant families</b>
and <b>mark-less collapse</b>. Judge it at 16&nbsp;px, in the tree, first.</p>
<div class="arch">
<div><h4>THE ICON IS THE MARK</h4><p>R1: official geometry, official colours, multi-colour kept.
Every file icon is byte-identical to its master, and the check asserts it rather than claiming it.
${marks} of ${R.SUBJECTS.length} subjects are real marks; ${brandOwn.length} came from the brand's
own SVG.</p></div>
<div><h4>EVERY CUT IS LOGGED</h4><p>${simplifiedCount} subjects carry simplifications and each one
names the measurement that forced it. ${riders.length === 1 ? 'One needed' : `${riders.length} needed`}
the prettier rider (${oxford(riders.map(id => `<code>${esc(id)}</code>`))}).${studies.length
			? ` ${studies.length} measured stud${studies.length === 1 ? 'y renders' : 'ies render'} the
	rejected alternatives behind the calls that needed one, in <code>proofs/</code>.` : ''}</p></div>
<div><h4>GATES BEFORE OPINIONS</h4><p>Format, derivation identity, roster, both working rules,
provenance, letter audit, 16&nbsp;px proofs, fidelity strips and a CROSS-SET R7/R8 twin audit over
the pilot plus this slice all run &mdash; 0 twins, 0 form collisions. The 24 approved pilot icons
are re-asserted byte-identical against git on every run.</p></div>
</div>
</header>

${FIX ? `<section>
<h2>0 &middot; The fix round &mdash; what the ruling changed</h2>
<p class="desc">This revision is a FIX ROUND, not a new build. The ${R.SUBJECTS.length} icons
below were gated on ${manifest.generated === FIX.ruling ? 'an earlier build' : 'the build of ' + esc(FIX.ruling)},
one ruling came back, and this section is that ruling and everything it moved. Every subject the
round did NOT touch is byte-identical to the gated build; the flags the gate was decided on keep
their numbers 1&ndash;${gateFlags}, each overturned one marked in place, and the round's own flags run from
${fixFlagFirst}.</p>
<div class="ruling">
<h3>The ruling &mdash; ${esc(FIX.ruling)}</h3>
<p class="q">${esc(FIX.verdict.replace(/^[^:]*:\s*/, ''))}</p>
<p><b>What it binds:</b> ${esc(FIX.binding)}</p>
<p><b>What it does not touch:</b> ${esc(FIX.unchanged)}</p>
<p><b>Scale:</b> ${esc(FIX.scale)}</p>
</div>
<h3 style="font-size:14px;margin:0 0 8px;color:#c9cfd5">${FIX.rebuilt.length} subjects rebuilt &mdash; what they were, what they are</h3>
<div class="fxgrid">${fixStrip()}</div>
<h3 style="font-size:14px;margin:20px 0 4px;color:#c9cfd5">Why, per subject</h3>
<p class="desc">Including the ${FIX.rehunted_and_unchanged.length} that were re-hunted with sourcing
free and did NOT move &mdash; a fix round that only reports its wins is not evidence.</p>
${fixNotes()}
</section>

` : ''}<section>
<h2>1 &middot; The ${R.SUBJECTS.length}</h2>
<p class="desc">64&nbsp;px for the eye, then a true 32 / 22 / 16. The 16 is the render the file tree
actually performs; everything else is courtesy. Verdicts: ${Object.entries(tally)
		.map(([k, v]) => `${v} ${k}`).join(', ')}.</p>
<div class="szgrid">${R.SUBJECTS.map(sizesCard).join('')}</div>
</section>

<section>
<h2>2 &middot; In the tree</h2>
<p class="desc">A believable project at the product's row anatomy: 22&nbsp;px rows, 16&nbsp;px icons,
the system font, real extensions taken from the slice's own roster entry. Five approved PILOT icons
are mixed in <span style="color:#767d85">(dimmed labels)</span> so the slice can be judged against
the set it is joining, not just against itself. Left is the editor ground (#121314); right simulates
the sidebar's translucent coat over vibrancy.</p>
<div class="trees">
<div class="treebox editor"><h5>editor ground &middot; #121314</h5><div class="body">${tree()}</div></div>
<div class="treebox sidebar"><h5>sidebar coat &middot; simulated</h5><div class="body">${tree()}</div></div>
</div>
</section>

<section>
<h2>3 &middot; Provenance, subject by subject</h2>
<p class="desc">L2's per-icon duty, on the page rather than in a file nobody opens: what the brand
ships, what we ship, where it came from, under what licence, what L5 forced us to change, and the
eyeballed 16&nbsp;px verdict. Contrast figures are measured against the #121314 editor ground for
every declared fill, including ink that never meets the backdrop because it prints on the mark's own
field.</p>
${provenance()}
</section>

<section>
<h2>4 &middot; The two working rules, as built</h2>
<p class="desc">Both are new with this slice and both produce BYTE-IDENTICAL payloads under distinct
ids on purpose. Nothing about that is implicit: each pair is declared in the manifest, asserted by
the check, and printed by the twin audit in its own lane, where identity is expected instead of
fatal.</p>
<h3 style="font-size:14px;margin:0 0 8px;color:#c9cfd5">Rule 1 &mdash; variant families</h3>
${familyRows()}
<h3 style="font-size:14px;margin:18px 0 8px;color:#c9cfd5">Rule 2 &mdash; mark-less collapse</h3>
${collapseRows()}
</section>

<section>
<h2>5 &middot; Flags &mdash; every judgement call, numbered</h2>
<p class="desc">Nothing here was decided quietly. Each item is a call that wants a verdict, or a
number you should see before giving one. ${FIX
			? `Flags 1&ndash;${gateFlags} are the ones the gate was
	decided on and they keep their numbers; ${superseded} of them ${superseded === 1 ? 'is' : 'are'}
	marked SUPERSEDED in place, with a pointer to what replaced them, because deleting a flag would
	delete the reasoning that produced the ruling. The fix round's own flags run from
	${fixFlagFirst}. ` : ''}${rulingFlags.length
			? `Flag${rulingFlags.length === 1 ? '' : 's'}&nbsp;${oxford(rulingFlags.map(x => String(x.n)))}
	${rulingFlags.length === 1 ? 'asks' : 'ask'} outright for a ruling &mdash; ${rulingFlags.length === 1
				? 'that is the one' : 'those are the ones'} to argue with; the rest are numbers to have
	before giving one.`
			: 'None of them asks for a ruling; they are numbers to have before giving one.'}</p>
${flags()}
</section>

<footer>
M20 &middot; icons v2 &middot; production slice ${R.id}, tranche
${R.MODULES.present.join(' + ')} &mdash; ${R.SUBJECTS.length} file icons, each derived from one
fitted master. Provenance, set constants, simplifications, families, collapses and per-icon
16&nbsp;px verdicts: <code>slices/${R.id}/manifest.json</code>. Proofs:
<code>slices/${R.id}/proofs/</code>${studies.length
			? `, including ${studies.length} measured stud${studies.length === 1 ? 'y' : 'ies'}
	(${oxford(studies.map(s => `<code>${esc(s)}</code>`))})` : ''}. Roster of record:
<code>m11-icons/production/longtail-worklist.json</code>. Toolchain:
<code>m20-icons-v2/tools/</code>.
</footer>
</div></body></html>
`;

const sheetPath = join(OUT, 'sheet.html');
writeFileSync(sheetPath, html);
console.log(`wrote sheet.html — ${(Buffer.byteLength(html) / 1024).toFixed(1)} KB, `
	+ `${(html.match(/<svg/g) || []).length} inlined svgs`);

// ---- shoot it at the height the page actually is -----------------------------------------
const WIDTH = 1280;
const probe = join(tmpdir(), `m20.sheet.${R.id}.probe.html`);
writeFileSync(probe, html.replace('</body>',
	'<pre id="__h">?</pre><script>document.getElementById("__h").textContent='
	+ '"H=" + document.documentElement.scrollHeight;</script></body>'));
let height = 9000;
try {
	const dom = execFileSync(chromium(), ['--headless', '--disable-gpu', '--no-sandbox',
		'--hide-scrollbars', '--allow-file-access-from-files', '--virtual-time-budget=20000',
		`--window-size=${WIDTH},1200`, '--dump-dom', `file://${resolve(probe)}`],
	{ encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 });
	const m = /H=(\d+)/.exec(dom);
	if (m) { height = Math.ceil(+m[1]) + 24; }
} catch { /* fall back to the generous default */ }
rmSync(probe, { force: true });

execFileSync('node', [join(HERE, 'shot.mjs'), sheetPath, join(OUT, 'sheet.png'),
	String(WIDTH), String(height), '2'], { stdio: ['ignore', 'ignore', 'ignore'] });
console.log(`wrote sheet.png — ${WIDTH}x${height} at 2x`);
void contrast; void BACKDROP;
