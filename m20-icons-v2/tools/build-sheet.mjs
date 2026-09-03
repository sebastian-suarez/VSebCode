#!/usr/bin/env node
// build-sheet.mjs — pilot/sheet.html, the page the pilot gate is decided on.
//
//   node tools/build-sheet.mjs
//
// Self-contained: no external requests of any kind, every SVG inlined, system
// font stack, dark backdrop explicit, no scripts. check.mjs asserts all of that.

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as si from 'simple-icons';
import { FILES, FOLDERS, CARRIED, SUPERSEDED, SUPERSEDED_RULING, spec, officialSvg }
	from './sources.mjs';
import { shade, contrast, OPEN_SHADE_DL, OPEN_SHADE_FLOOR, BACKDROP } from './color.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, '..', 'pilot');
const V1 = '/Users/sebastian.suarez/Projects/VSebCode/vscode/extensions/theme-vsebcode-icons/icons';

const manifest = JSON.parse(readFileSync(join(OUT, 'manifest.json'), 'utf8'));
const clean = (s) => s.trim()
	.replace(' xmlns="http://www.w3.org/2000/svg"', '')
	.replace(/\s(?:width|height)="[^"]*"(?=[^>]*viewBox)/g, '');
const icon = (id) => clean(readFileSync(join(OUT, 'icons', `${id}.svg`), 'utf8'));
const rejected = (id) => clean(readFileSync(join(OUT, 'rejected', `${id}.svg`), 'utf8'));
const v1file = (n) => clean(readFileSync(join(V1, 'file', `${n}.svg`), 'utf8'));
const v1folder = (n) => clean(readFileSync(join(V1, 'folder', `${n}.svg`), 'utf8'));
const at = (src, px) => src.replace('<svg', `<svg width="${px}" height="${px}"`);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const SHIPPED = [...FILES, ...FOLDERS.flatMap(f => [f, `${f}-open`])];
const SVG = Object.fromEntries(SHIPPED.map(id => [id, icon(id)]));

// ---- section 2: every icon at four sizes ---------------------------------------
const label = (id) => {
	const base = id.replace(/-open$/, '');
	const m = manifest.subjects[base];
	const tag = id.endsWith('-open') ? 'open' : (m.carried ? 'carried' : 'new');
	return { title: m.title.replace(/\s*\(.*\)$/, ''), tag, id };
};
const sizesCard = (id) => {
	const l = label(id);
	return `<figure class="sz">
	<div class="sz-big">${at(SVG[id], 64)}</div>
	<div class="sz-row">${at(SVG[id], 32)}${at(SVG[id], 22)}${at(SVG[id], 16)}</div>
	<figcaption><b>${esc(l.title)}</b><span class="tg tg-${l.tag}">${l.tag}</span>
	<em>${esc(id)}</em></figcaption></figure>`;
};

// ---- section 3: the explorer listing --------------------------------------------
const TREE = [
	['src', 'folder-src-open', 0, 'v'],
	['App.vue', 'vue', 1], ['index.jsx', 'react', 1],
	['main.ts', 'typescript', 1], ['app.py', 'python', 1],
	['test', 'folder-test', 0, '>'],
	['node_modules', 'folder-node-open', 0, 'v'],
	['docker', 'folder-docker', 0, '>'],
	['.editorconfig', 'editorconfig', 0], ['.env', 'dotenv', 0],
	['.eslintrc.json', 'eslint', 0], ['.gitignore', 'git', 0],
	['.prettierrc', 'prettier', 0], ['Cargo.toml', 'rust', 0],
	['docker-compose.yaml', 'yaml', 0], ['Dockerfile', 'docker', 0],
	['go.mod', 'go', 0], ['package.json', 'npm', 0],
	['README.md', 'markdown', 0], ['tsconfig.json', 'json', 0]
];
// the twisty is drawn, not typed: a font glyph at 10 px is at the mercy of whatever
// the renderer substitutes, and this page has to look the same everywhere
const TWISTY = {
	v: '<svg class="tw" viewBox="0 0 16 16"><path fill="#8a9199" d="M4 6.2h8L8 11z"/></svg>',
	'>': '<svg class="tw" viewBox="0 0 16 16"><path fill="#8a9199" d="M6.2 4v8L11 8z"/></svg>',
	'': '<span class="tw"></span>'
};
const tree = () => TREE.map(([name, id, depth, tw]) =>
	`<div class="row" style="padding-left:${6 + depth * 14}px">${TWISTY[tw || '']}`
	+ `${at(SVG[id], 16)}<span class="lbl">${esc(name)}</span></div>`).join('');

// ---- section 4: v1 -> v2 ----------------------------------------------------------
const AUTOPSY = [
	['npm', v1file('npm'), 'A freehand lowercase wordmark set inside a rounded plate — '
		+ 'not npm\'s letterforms, not npm\'s lockup. v2 is npm\'s own 16&nbsp;px square asset.'],
	['dotenv', v1file('dotenv'), 'Bare yellow "ENV" letters, no mark at all, and the drifted '
		+ '#E7DF6E instead of the brand\'s #ECD53F. v2 is the official yellow field with the '
		+ 'official ink, reduced under the prettier rider (flag&nbsp;3).'],
	['yaml', v1file('yaml'), 'A red box with FOUR typeset letters — the exact letter chaos the '
		+ 'autopsy named. YAML does own a mark, and v2 uses it (flag&nbsp;5).'],
	['git', v1file('git'), 'A freehand branch glyph in a drifted #E0603C. v2 is git-scm.com\'s '
		+ 'own diamond, branch knocked out, in Pantone 1788C.'],
	['go', v1file('go'), 'White "GO" typeset in a box, in #2E88A0 — a hue Go does not use. '
		+ 'v2 is the Go wordmark itself in #00ADD8.'],
	['vue', v1file('vue'), 'A single-colour flat triangle in #4CB392. Vue\'s mark is two-tone '
		+ 'and vuejs/art publishes both layers; v2 uses them.'],
	['folder-test', v1folder('test'), 'A dark-slate check parked top-right at ~8&nbsp;px on the '
		+ 'same sand body every other folder used. v2 centres it, whitens it and gives it '
		+ '9.78&nbsp;px of ink.'],
	['folder-docker', v1folder('docker'), 'A micro-scene whale in #1E6EA8 on sand, ~7&nbsp;px '
		+ 'across. v2 puts Docker\'s blue in the BODY and knocks the official whale out white '
		+ 'at 10.2&nbsp;px.']
];
const autopsy = () => AUTOPSY.map(([id, old, why]) => `<div class="ap">
	<div class="ap-name"><b>${esc(id)}</b></div>
	<div class="ap-pair"><span class="ap-tag">v1</span>${at(old, 32)}${at(old, 16)}</div>
	<div class="ap-arrow">&rarr;</div>
	<div class="ap-pair v2"><span class="ap-tag">v2</span>${at(SVG[id], 32)}${at(SVG[id], 16)}</div>
	<div class="ap-why">${why}</div></div>`).join('');

// ---- section 5: the pilot fix round ---------------------------------------------------
// The two subjects the gate rejected, shown four ways: what the brand ships, what v1
// ships today, what the pilot offered and was told was wrong, and what replaced it.
const OFFICIAL_ART = {
	docker: () => `<svg viewBox="0 0 24 24"><path fill="#2496ED" d="${si.siDocker.path}"/></svg>`,
	editorconfig: () => officialSvg('editorconfig-official.svg')
};
const FIXES = [
	['docker', 'Dockerfile', 'docker',
		'Four containers out of the official nine, the top one floating alone. The whale was '
		+ 'never the problem &mdash; the cargo was.',
		'The deck is reloaded to 3+3+1, seven containers on the three columns the 1.2&nbsp;px '
		+ 'floor allows. Same official box, same official whale, all gaps 1.21&nbsp;px.'],
	['editorconfig', '.editorconfig', 'editorconfig',
		'The mascot flattened into a white silhouette with two dark slashes for lenses and a '
		+ 'wire loop for an ear. The official mark is a line DRAWING; this threw the drawing away.',
		'Re-sourced from EditorConfig\'s OWN vector and rebuilt as a light face carrying the '
		+ 'official dark features: solid spectacles, a solid nose, both ear interiors in the '
		+ 'brand\'s pinks.']
];
const fixRound = () => FIXES.map(([id, v1name, v1icon, was, now]) => `<div class="fx">
	<div class="fx-head"><b>${esc(id)}</b><span class="fx-tag">rejected ${SUPERSEDED_RULING}</span></div>
	<div class="fx-strip">
		<div class="fx-cell"><span class="fx-lbl">official artwork</span>
			<div class="fx-pane">${at(OFFICIAL_ART[id](), 32)}${at(OFFICIAL_ART[id](), 16)}</div></div>
		<div class="fx-cell"><span class="fx-lbl">v1, shipping today</span>
			<div class="fx-pane">${at(v1file(v1icon), 32)}${at(v1file(v1icon), 16)}</div></div>
		<div class="fx-cell"><span class="fx-lbl">pilot &mdash; rejected</span>
			<div class="fx-pane bad">${at(rejected(id), 32)}${at(rejected(id), 16)}</div></div>
		<div class="fx-cell"><span class="fx-lbl">fix round</span>
			<div class="fx-pane good">${at(SVG[id], 32)}${at(SVG[id], 16)}</div></div>
	</div>
	<div class="fx-why"><p><b>What was wrong.</b> ${was}</p><p><b>What ships now.</b> ${now}</p></div>
	<div class="fx-file"><code>${esc(v1name)}</code></div></div>`).join('');

// ---- section 6: the flags -----------------------------------------------------------
const sandShade = shade('#BF9354');
const vueContrast = contrast('#35495E', BACKDROP).toFixed(2);
const inkContrast = contrast('#020202', BACKDROP).toFixed(2);
const RULED = 'RULED &mdash; APPROVED ' + SUPERSEDED_RULING;
const FLAGS = [
	['NEW RULE — the open-folder construction and its second tone',
		`L7 makes closed and open ONE construction, so the open state may not pick its own
		colours. The pilot keeps v1's proven two-panel open silhouette verbatim (back sheet
		standing behind, pocket tipped forward and jutting past the right edge) and derives
		the second tone by formula: <code>shade(body) = hsl(h, s, max(${OPEN_SHADE_FLOOR},
		l &minus; ${OPEN_SHADE_DL}))</code> — hue and saturation untouched, floored so a dark
		brand body cannot collapse into the backdrop. One formula for every folder, sand
		included; it reproduces v1's own hand-picked sand pair (#BF9354 &rarr; #8F6D37; the
		formula gives ${sandShade}) to within two units per channel.
		<b>Consequence you should look at:</b> the face mark is byte-identical in both states,
		so on the open folder it crosses the seam between the two panels — see src/ and test/
		in the tree above. The panels differ only in lightness, so the white glyph reads
		continuously, but it is painted over both sheets rather than on the pocket alone.
		The alternative is a smaller or lower mark in the open state, which breaks the
		one-construction rule and drops folder-node under L7's 8&nbsp;px.`],
	['npm ships its SQUARE lockup, not its wordmark',
		`npm publishes two marks. The wide wordmark (780&times;250) lands on 0.97&nbsp;px stems
		at the widest fit the 16-grid allows. The square mark — <code>npm&nbsp;square/n.svg</code>,
		authored by npm at 16&times;16 — lands on 1.60&nbsp;px and needs no reduction at all,
		so that is what ships, geometry untouched, hard corners and all. Two colour notes:
		npm's own file ships <code>#C12127</code>, and <code>brand-colors.json</code> (L2's
		declared colour source of truth) records npm red as <code>#CB3837</code>. The pilot
		uses #CB3837. Same shape of question for git (<code>#f03c2e</code> in the file,
		<code>#F05032</code> in brand-colors) and go (<code>#00acd7</code> vs
		<code>#00ADD8</code>). One rule, applied uniformly — but it is a rule that has not
		been ratified.`],
	['dotenv — the prettier rider fires, and this is the weakest icon in the pilot',
		`Measured: the official ".ENV" bar is 0.50&nbsp;px at the compact envelope, and still
		only 0.77&nbsp;px if the square is thrown away and the bare wordmark is stretched
		across the whole grid. Unreadable at any allowed fit, so the rider applies. What
		ships: the official field, the official ink, and the official dot + E letterform
		scaled 2.5&times; as one group so the E's bar lands on 1.24&nbsp;px. N and V are
		gone. Alternatives measured and rejected: "ENV" without the dot (0.93&nbsp;px),
		".EN" (0.72&nbsp;px), the field alone with no glyph at all. If ".E" reads wrong to
		you, the honest fallbacks are the bare yellow field or a single "E".`],
	['dotenv\'s black is NOT lifted — a clarification to the visibility-lift rule',
		`The documented lift raises any official hex below L&nbsp;22 to L&nbsp;88 (markdown's
		#000000 is the only case in round 2). dotenv's ink is #000000 too, but it prints on
		the mark's own yellow field and never meets the backdrop. Lifting it would invent a
		colour the brand does not use. The pilot therefore reads the rule as applying to ink
		that MEETS THE BACKDROP. New wording, needs ratifying.`],
	['yaml owns a mark after all — and it is a hard read at 16&nbsp;px',
		`The brief expected yaml to be mark-less. It is not: yaml.org ships the stacked
		YA&nbsp;/&nbsp;ML lockup and simple-icons carries a faithful vector of it, so the
		neutral vocabulary does not apply and the icon is the real mark in the real red.
		Honest verdict on the 16&nbsp;px proof: it reads as a red letter BLOCK — the four
		letters are present and their bars clear the 1.2&nbsp;px official floor (1.25&nbsp;px
		after the envelope was widened to 13.6), but they are not individually legible at
		16&nbsp;px. That is the mark's own construction, not a fit failure. Reducing to the
		top row ("YA") would double the stems and stop being the mark.`],
	['Two envelopes widened, both forced by L5',
		`git 12.8 &rarr; 13.6 (official branch connector 1.14 &rarr; 1.21&nbsp;px) and yaml
		12.8 &rarr; 13.6 (thinnest bar 1.17 &rarr; 1.25&nbsp;px). 13.6 is not a new number —
		it is react's envelope, and all three marks share the same reason for it: their
		corners are empty, so the bounding box may be larger without the icon reading larger.
		Recorded as <code>ENV.open</code> in the manifest.`],
	['go loses its motion lines',
		`The three speed lines are 3.7/78.4 of the mark — 0.37&nbsp;px at any allowed fit.
		Dropped under L5, which is also what lets the "GO" itself fill the flat envelope and
		land on a 2.09&nbsp;px ring wall. The letterforms are the brand's own outlines, not
		typeset letters.`],
	[`vue is two-tone, and the dark half measures ${vueContrast}:1 against the backdrop`,
		`The two layers come from vuejs/art's own <code>logo.svg</code> — no derivation games,
		no freehand. The inner V is #35495E, and against the #121314 editor ground that is
		${vueContrast}:1. It does NOT trip the documented visibility lift (that rule fires
		below L&nbsp;22; #35495E sits at L&nbsp;28.8), and applying the lift anyway would
		turn Vue's dark half into a pale grey and destroy the mark. So the pilot ships it
		faithful and puts the number in front of you. Mitigation in the geometry: the dark V
		is enclosed by green on every side except a 0.39&nbsp;px rim at the top.
		<b>Precedent worth knowing:</b> eslint's official outer purple #4B32C3 measures
		2.25:1 on the same backdrop and D22 already ruled it in, so this is a band the set
		has accepted once — but it was never stated as a rule.`],
	['folder-test uses the check, not the beaker',
		`Mark-less concept, so the glyph comes from the neutral vocabulary. The check is ONE
		sub-shape with a constant 2.9-unit stem and lands 9.78&nbsp;px of ink on the face; a
		beaker needs a neck and a body, and the neck is about 1.1&nbsp;px at that scale. It
		also keeps v1's association, so nobody has to relearn the row.`],
	['folder-docker drops the containers',
		`L7 asks the folder glyph to be the file icon's mark simplified. The container grid
		holds 1.21&nbsp;px gaps on the file icon but only 0.85&nbsp;px once the mark is
		squeezed onto the 10.2&nbsp;px face, so the whale body carries the face alone —
		official subpath, untouched, one sub-shape inside L7's two-shape budget.
		<b>Unchanged by the fix round:</b> the face master and both folder icons are
		byte-identical to the build you approved; only the FILE icon's deck moved.`],
	['Twin audit: 0 twins, 0 form collisions, 7 colour hits separated by form',
		`The four blues behave: only typescript &harr; docker lands inside R7's thresholds
		(dh&nbsp;5.4 / dL&nbsp;5.1 / dS&nbsp;24.5) and their forms score 0.039, so they are a
		hue neighbourhood, not a twin. docker &harr; react (dh&nbsp;13.1) and docker &harr; go
		(dh&nbsp;14.0) are outside the thresholds. Deliberately tolerated, all separated by
		form: rust&harr;npm 0.100, rust&harr;yaml 0.321, rust&harr;git 0.298, npm&harr;yaml
		0.078, python&harr;dotenv 0.124, and folder-src&harr;folder-test — identical sand by
		law, separated only by the glyph at 0.212. Re-run after the fix round: editorconfig's
		dominant fill is still its near-white face (#FDFDFD, S&nbsp;0, neutral lane) and its
		new #020202 ink is bucketed with it, so markdown &harr; editorconfig stays a neutral-lane
		pair separated by form (0.131, was 0.201).`],
	['New sub-rule in the twin audit: the PLATE lane',
		`typescript, npm and dotenv are all an official rectangle carrying a glyph. Scored on
		their silhouettes they collide at 0.997&ndash;1.000, which says nothing — the
		rectangle is the brands' choice, not ours. The audit therefore ports m11's BADGE
		treatment: two plates are compared GLYPH to glyph, against the higher 0.92 bar. They
		score 0.129&ndash;0.297. The <code>plate</code> flag is a property of the artwork,
		declared per subject, not a judgement made inside the audit.`],
	['Three carried icons are over the 2&nbsp;KB advisory target',
		`rust 3654&nbsp;B, editorconfig ${manifest.subjects.editorconfig.bytes}&nbsp;B, python
		2168&nbsp;B — all well under the 4&nbsp;KB hard cap and all three the price of official
		geometry (L8's round-2 erratum). editorconfig came DOWN from 3700&nbsp;B in the fix
		round even though it now carries the whole drawing: painting the ink contour once and
		the official counters back on top costs less than emitting the contour twice.`],

	// ---- new with the fix round (FIRST_FIX_FLAG points at this entry) ------------------
	['FIX ROUND &middot; editorconfig is re-sourced from EditorConfig\'s own vector',
		`The rejected version came from simple-icons. Checking the brand first, as L2 asks:
		<code>editorconfig/editorconfig</code> holds <code>assets/EditorConfig_Logo.svg</code>,
		a CorelDRAW export of the mascot — so the brand DOES publish a vector, and it is now
		the source. That changes provenance and palette together: the face is the file's own
		<code>#FDFDFD</code> (was a #FEFEFE sampled off <code>logo.png</code>), the ear
		interiors are <code>#FDF2F2</code> and <code>#FEF3F3</code>, the ink is
		<code>#020202</code>. The file is kept in <code>sources-svg/editorconfig-official.svg</code>
		for the standing fidelity gate. <b>The call:</b> a brand asset found in a code repo
		rather than a press kit is still the brand's asset, and it outranks simple-icons under
		L2's preference order. Worth ratifying.
		<b>Licence, honestly:</b> that repo ships no LICENSE file and GitHub reports
		<code>license: null</code>, so unlike every other source in this pilot the file carries
		no declared terms — it is a brand mark used for the brand's own file type, which is what
		every icon theme does, but it is not CC0 like the source it replaced. The fallback was
		measured, not assumed: simple-icons' trace has the SAME subpath structure and the
		identical construction on it renders the same icon &mdash; but at 4475&nbsp;B against
		this file's 2640&nbsp;B, which is <b>over L8's 4&nbsp;KB hard cap</b>, so going back to
		CC0 geometry would also need a further reduction to pass the format gate. Your call,
		and it is a real trade rather than a free one.`],
	['FIX ROUND &middot; how the mascot survives 16&nbsp;px: solid features, not lines',
		`Measured at the shipped fit: the head contour is 0.33&nbsp;px of ink and the spectacle
		rims are 0.16&ndash;0.21&nbsp;px. No fit makes a 0.2&nbsp;px rim readable, so the
		prettier rider applies and the reduction is done by NOT painting three official
		counters back: the lens interiors and pupils stay ink, which merges rim + lens + pupil
		into one solid lens each (3.45&times;1.91&nbsp;px left, 3.61&times;1.97&nbsp;px right,
		with the official 0.56&nbsp;px bridge gap still open between them); and the nostril
		stays ink, which turns a 0.2&nbsp;px outline into a solid 1.82&times;0.89&nbsp;px nose.
		<b>Two things to know.</b> The nose's minor axis is 0.89&nbsp;px, under the
		1.2&nbsp;px floor — kept because the only alternative is the 0.2&nbsp;px ring. And the
		head contour, ear rims and whisker are still in the file at 0.16&ndash;0.33&nbsp;px:
		they render as antialiasing, which is what gives the icon its drawn feel at 32 and
		64&nbsp;px, and they cost nothing at 16.`],
	['FIX ROUND &middot; editorconfig\'s ink is #020202 and is NOT lifted &mdash; with one honest edge',
		`Flag&nbsp;4's clarification says the visibility lift applies to ink that meets the
		BACKDROP, not to ink printed on the mark's own field. editorconfig's ink prints on the
		white face, so it is not lifted — lifting it to L&nbsp;88 would erase the mascot's
		glasses. <b>The edge:</b> that same ink also forms the drawing's outer contour, so a
		0.33&nbsp;px rim of #020202 does sit against #121314, at ${inkContrast}:1. It reads as a soft
		edge on the white face rather than as a line, and the visible silhouette is the face
		itself — but the number is in the manifest and you should see it.`],
	['FIX ROUND &middot; the pink ear interiors are kept and are invisible at 16&nbsp;px',
		`The official ears are <code>#FDF2F2</code> and <code>#FEF3F3</code> against a
		<code>#FDFDFD</code> face — about one unit of lightness apart. They are real official
		colours and the achromatic exemption (L6 erratum&nbsp;2) protects them from any
		saturation clamp, so the pilot ships them; at 16&nbsp;px they are indistinguishable
		from the face and only the ear rims separate the ears. Two 100-byte paths that do
		nothing at the target size. <b>The alternative</b> is dropping them and shipping a
		one-colour face, which is smaller and 16-px-identical but stops being the brand's
		palette. Kept faithful; say the word and they go.`],
	['FIX ROUND &middot; docker&apos;s deck: three columns is the ceiling, and 3+3+1 fills it',
		`The whale's back is flat from x&nbsp;0.6 to 17.4 and its tail fin stands at
		x&nbsp;17.79, which is why the official deck really spans x&nbsp;2.03&ndash;16.29
		(14.26&nbsp;u, keeping 1.50&nbsp;u of fin clearance). FOUR official-size boxes need
		15.65&nbsp;u to hold the 1.2&nbsp;px floor. Pushed in anyway, the fin clearance drops
		to 0.38&ndash;0.40&nbsp;px and the last container fuses with the tail; squeezed inside
		the deck instead, the box shrinks to 83% of official at a 1.20&nbsp;px gap. Both are
		rejected. Three columns fit comfortably, so the cargo is restored by FILLING them:
		<b>3+3+1, seven of the official nine</b>, box untouched, every gap 1.21&nbsp;px, fin
		clearance 1.74&nbsp;px. The top box sits on the right-hand column because that is where
		the official mark puts its top box — at the right end of the tier below.
		<b>Every layout measured is rendered side by side in</b>
		<code>pilot/proofs/docker-deck-candidates.png</code>, including the legal ones that
		carry less cargo (3+2 at five, 3+3 and 3+2+1 at six) — if seven reads busy to you, six
		is one line of code away.`],
	['FIX ROUND &middot; docker&apos;s optical mass moved 140 &rarr; 151',
		`The third tier makes the mark taller than the wide envelope, so the fit becomes
		height-bound: the ink is 14.50&times;10.40 instead of 15.20&times;9.18 and the whale is
		4.6% smaller. That is inside the set's range (go 118, git 185) and the envelope constant
		itself did not move, but it is a real change to a carried subject's mass and it is here
		rather than buried in the manifest.`],
	['FIX ROUND &middot; the D22 carry gate is amended, not switched off',
		`The pilot's carry gate asserted that all twelve D22-carried subjects still refit to
		<code>samples/masters/</code> byte for byte. Two of them were rejected at this gate, so
		that assertion is now two-sided: <b>10&nbsp;of&nbsp;12 byte-identical, and exactly
		docker and editorconfig SUPERSEDED&nbsp;BY&nbsp;PILOT (${SUPERSEDED_RULING})</b>. A
		superseded subject that quietly refits to its round-2 bytes fails the gate just as
		loudly as a frozen one that drifted, so the amendment cannot hide a regression. The
		ruling date is recorded in the gate output and in <code>manifest.json</code>.`]
];
// ruled at the pilot gate, 2026-09-03 (1-based, matching the numbers on the page)
const RULED_FLAGS = new Set([1, 2, 3, 4, 5, 8, 9, 10]);
// the first flag raised by the fix round, so the copy can never drift from the list
const FIRST_FIX_FLAG = FLAGS.findIndex(([t]) => t.startsWith('FIX ROUND')) + 1;
const flags = () => FLAGS.map(([t, body], i) =>
	`<div class="flag"><div class="fl-n${RULED_FLAGS.has(i + 1) ? ' done' : ''}">${i + 1}</div>`
	+ `<div><h4>${t}${RULED_FLAGS.has(i + 1) ? `<span class="ruled">${RULED}</span>` : ''}</h4>`
	+ `<p>${body}</p></div></div>`).join('');

// ---- the page -------------------------------------------------------------------------
const carriedCount = CARRIED.filter(id => FILES.includes(id)).length;
const simplifiedCount = Object.values(manifest.subjects).filter(s => s.simplifications.length).length;
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Icons v2 Pilot</title>
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
.tg-new{color:#8fd0a0;border-color:#2f4436}
.tg-open{color:#c0a678;border-color:#463a26}

.trees{display:flex;gap:16px;flex-wrap:wrap}
.treebox{border:1px solid var(--edge);border-radius:11px;overflow:hidden;min-width:300px;flex:1}
.treebox h5{margin:0;padding:8px 12px;font:600 10.5px/1 ui-monospace,SFMono-Regular,Menlo,monospace;
	letter-spacing:.09em;text-transform:uppercase;color:#6d747c;border-bottom:1px solid var(--edge)}
.treebox .body{padding:8px 0}
.editor .body{background:var(--bg)}
.sidebar .body{background:var(--coat)}
.row{display:flex;align-items:center;gap:6px;height:22px;font-size:13px;color:#ccd2d8;
	font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text",system-ui,sans-serif}
.row svg{flex:none}
.row .tw{width:12px;height:12px;flex:none;display:block}
.row .lbl{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

.ap{display:grid;grid-template-columns:96px 108px 26px 108px 1fr;align-items:center;gap:10px;
	background:var(--panel);border:1px solid var(--edge);border-radius:10px;
	padding:10px 14px;margin-bottom:7px}
.ap-name b{font-size:12.5px;font-weight:600}
.ap-pair{display:flex;align-items:center;gap:9px;background:var(--bg);border-radius:7px;
	padding:7px 9px;min-height:48px}
.ap-tag{font:9px/1 ui-monospace,SFMono-Regular,Menlo,monospace;color:#6d747c;
	letter-spacing:.08em;text-transform:uppercase;width:14px}
.ap-pair.v2{outline:1px solid #2f4436}
.ap-arrow{text-align:center;color:#5f666e}
.ap-why{color:var(--dim);font-size:12px;line-height:1.5}

.fx{background:var(--panel);border:1px solid var(--edge);border-radius:11px;
	padding:13px 16px 14px;margin-bottom:10px}
.fx-head{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.fx-head b{font:600 14px/1 ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--ink)}
.fx-tag{font-size:9.5px;letter-spacing:.07em;text-transform:uppercase;color:#e0937f;
	border:1px solid #4a3128;border-radius:20px;padding:2px 8px}
.fx-strip{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:9px}
.fx-cell{display:flex;flex-direction:column;gap:5px}
.fx-lbl{font:9.5px/1 ui-monospace,SFMono-Regular,Menlo,monospace;color:#6d747c;
	letter-spacing:.06em;text-transform:uppercase}
.fx-pane{display:flex;align-items:center;justify-content:center;gap:12px;background:var(--bg);
	border:1px solid #202325;border-radius:8px;padding:11px 8px;min-height:60px}
.fx-pane svg{display:block}
.fx-pane.bad{border-color:#4a3128}
.fx-pane.good{border-color:#2f4436}
.fx-why{margin-top:11px;color:var(--dim);font-size:12.5px;line-height:1.6}
.fx-why p{margin:0 0 4px}
.fx-why b{color:#c9cfd5;font-weight:600}
.fx-file{margin-top:6px;font-size:11px;color:#6d747c}

.flag{display:flex;gap:13px;background:var(--panel);border:1px solid var(--edge);
	border-radius:10px;padding:13px 16px;margin-bottom:8px}
.fl-n{flex:none;width:24px;height:24px;border-radius:50%;background:#23262a;color:var(--warm);
	font:600 12px/24px ui-monospace,SFMono-Regular,Menlo,monospace;text-align:center}
.fl-n.done{background:#1e2b22;color:#8fd0a0}
.ruled{display:inline-block;margin-left:8px;font:9.5px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace;
	letter-spacing:.06em;color:#8fd0a0;border:1px solid #2f4436;border-radius:20px;
	padding:1px 8px;vertical-align:middle}
.flag h4{margin:2px 0 5px;font-size:13.5px;font-weight:640;color:var(--ink)}
.flag p{margin:0;color:var(--dim);font-size:12.5px;line-height:1.6}
.flag p b{color:#c9cfd5;font-weight:600}
footer{color:#5f666e;font-size:12px;border-top:1px solid var(--edge);margin-top:44px;padding-top:18px}
</style></head>
<body><div class="wrap">

<header>
<h1>Icons v2 &mdash; pilot</h1>
<p class="date">M20 &middot; D22 style R1 &ldquo;True colour&rdquo; &middot; ${manifest.generated}
&middot; 24 icons &middot; fix round after the ${SUPERSEDED_RULING} gate</p>
<p class="sub">Twenty-four icons, built by the production recipe, before any mass work starts.
The roster is deliberate: <b>${carriedCount} carried file marks</b> frozen by D22 and refitted
here byte for byte, so the pilot proves the toolchain reproduces the ruling exactly;
<b>6 new file marks</b> picked straight out of the v1 autopsy &mdash; the freehand redraws, the
drifted hues and the letter chaos (npm, dotenv, yaml, git, go, vue); and <b>4 folder pairs</b>,
closed and open, which is where the one genuinely new rule lives. Every mark's geometry comes
from the brand's own vector artwork or simple-icons; nothing is drawn from memory.
<b>This revision is the fix round:</b> ${SUPERSEDED.join(' and ')} were rejected at the gate and
rebuilt &mdash; section&nbsp;4 shows them &mdash; and nothing else in the set moved. Judge it at
16&nbsp;px, in the tree, first.</p>
<div class="arch">
<div><h4>THE ICON IS THE MARK</h4><p>R1: official geometry, official colours, multi-colour
kept. A file icon is byte-identical to its master; a folder is the same master knocked out
white on a concept-hue body. Both are asserted, not asserted-to.</p></div>
<div><h4>EVERY CUT IS LOGGED</h4><p>${simplifiedCount} subjects carry simplifications and each
one names the measurement that forced it. Three icons needed the prettier rider &mdash; dotenv,
prettier itself, and now editorconfig, whose 0.2&nbsp;px linework cannot survive 16&nbsp;px as
line.</p></div>
<div><h4>GATES BEFORE OPINIONS</h4><p>Format, carry identity (now 10 frozen + 2 superseded by
ruling), derivation identity, folder mass, provenance, letter audit, 16&nbsp;px proofs, fidelity
strips and the R7/R8 twin audit all run &mdash; 0 twins, 0 form collisions.</p></div>
</div>
</header>

<section>
<h2>1 &middot; The twenty-four</h2>
<p class="desc">64&nbsp;px for the eye, then a true 32 / 22 / 16. The 16 is the render the file
tree actually performs; everything else is courtesy.</p>
<div class="szgrid">${SHIPPED.map(sizesCard).join('')}</div>
</section>

<section>
<h2>2 &middot; In the tree</h2>
<p class="desc">A believable project at the product's row anatomy: 22&nbsp;px rows, 16&nbsp;px
icons, the system font. Left is the editor ground (#121314); right simulates the sidebar's
translucent coat over vibrancy. Two folders are open, two closed.</p>
<div class="trees">
<div class="treebox editor"><h5>editor ground &middot; #121314</h5><div class="body">${tree()}</div></div>
<div class="treebox sidebar"><h5>sidebar coat &middot; simulated</h5><div class="body">${tree()}</div></div>
</div>
</section>

<section>
<h2>3 &middot; v1 &rarr; v2, the autopsy made visible</h2>
<p class="desc">The eight concepts this pilot exists to fix, shipped icon on the left, pilot
icon on the right, both at 32 and at a true 16&nbsp;px.</p>
${autopsy()}
</section>

<section>
<h2>4 &middot; The fix round</h2>
<p class="desc">Twenty-two of the twenty-four icons were approved as built on
${SUPERSEDED_RULING}. Two were not &mdash; <em>&ldquo;that is definitely NOT the docker or
editorconfig logo&rdquo;</em> &mdash; and only those two were rebuilt. Left to right: what the
brand publishes, what v1 ships in the product today, what the pilot offered and was told was
wrong, and what replaced it. Every pane at 32&nbsp;px and a true 16&nbsp;px, on the editor
ground. Everything else in this sheet, folder-docker included, is byte-identical to the build
you looked at.</p>
${fixRound()}
</section>

<section>
<h2>5 &middot; Flags &mdash; every judgement call, numbered</h2>
<p class="desc">Nothing here was decided quietly. Each item is a call that wants a verdict, or a
number you should see before giving one. The ${RULED_FLAGS.size} marked
<span class="ruled">${RULED}</span> already have one; flags&nbsp;${FIRST_FIX_FLAG}&ndash;${FLAGS.length}
are new with the fix round and do not.</p>
${flags()}
</section>

<footer>
M20 &middot; icons v2 pilot &middot; 16 file icons + 4 folder pairs, all derived from one fitted
master each. Provenance, set constants, simplifications and per-icon 16&nbsp;px verdicts:
<code>pilot/manifest.json</code>. Proofs: <code>pilot/proofs/</code>, including the docker deck
study <code>docker-deck-candidates.png</code>. The two rejected pilot icons are kept verbatim in
<code>pilot/rejected/</code> so this page can show them. Toolchain:
<code>m20-icons-v2/tools/</code>.
</footer>
</div></body></html>
`;

writeFileSync(join(OUT, 'sheet.html'), html);
console.log(`wrote sheet.html — ${(Buffer.byteLength(html) / 1024).toFixed(1)} KB, `
	+ `${(html.match(/<svg/g) || []).length} inlined svgs`);
void spec;
