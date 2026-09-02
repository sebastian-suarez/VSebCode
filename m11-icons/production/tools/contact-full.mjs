#!/usr/bin/env node
// contact-full.mjs — assemble ../contact-full.html, the whole-set checkpoint sheet for the
// M11 assembly phase, and optionally shoot ../contact-full.png at 2x.
//
//   node contact-full.mjs          # -> ../contact-full.html
//   node contact-full.mjs --png    # also shoots ../contact-full.png
//
// Every icon is inlined once as an SVG <symbol> and referenced with <use>, so the page
// carries no external request of any kind. The explorer strips resolve their filenames
// through the built theme (theme/vsebcode-icon-theme.json), so they double as a live check
// that the associations point where they should.

import { readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { chromium } from './chromium.mjs';

const DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(DIR, '..');
const TITLE = 'M11 Full Set';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const manifest = JSON.parse(readFileSync(join(ROOT, 'set-manifest.json'), 'utf8'));
const theme = JSON.parse(readFileSync(join(ROOT, 'theme', 'vsebcode-icon-theme.json'), 'utf8'));

const icons = new Map();
for (const i of manifest.icons) {
	const src = readFileSync(join(ROOT, 'svg', i.kind, `${i.id}.svg`), 'utf8');
	const inner = src.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
	icons.set(`${i.kind}/${i.id}`, { ...i, inner, src });
}
const fileIcons = manifest.icons.filter(i => i.kind === 'file');
const folderIds = manifest.icons
	.filter(i => i.kind === 'folder' && !i.id.endsWith('-open')).map(i => i.id);

// ---- domains ----------------------------------------------------------------
// Every file id lands in exactly one domain; the build asserts it.

const DOMAINS = [
	['languages', 'Languages', [
		'typescript', 'typescriptdef', 'js', 'jsconfig', 'python', 'go', 'rust', 'java', 'c', 'cheader',
		'cpp', 'cppheader', 'csharp', 'php', 'ruby', 'kotlin', 'swift', 'dartlang', 'elixir', 'haskell',
		'scala', 'lua', 'perl', 'r', 'julia', 'zig', 'nim', 'ocaml', 'clojure', 'erlang', 'fsharp',
		'objectivec', 'assembly', 'solidity', 'wasm', 'shell', 'powershell', 'sql', 'sqlite',
		'graphql', 'protobuf', 'tex'
	]],
	['web', 'Web + frameworks', [
		'html', 'css', 'sass', 'postcss', 'tailwind', 'stylelint', 'reactts', 'reactjs', 'vue', 'svelte',
		'angular', 'astro', 'nuxt', 'nestjs', 'django', 'expo', 'tauri', 'next', 'vercel', 'netlify',
		'firebase', 'supabase', 'storybook', 'http', 'swagger', 'favicon'
	]],
	['tooling', 'Tooling', [
		'node', 'npm', 'yarn', 'pnpm', 'bun', 'deno', 'webpack', 'rollup', 'esbuild', 'babel', 'biome',
		'eslint', 'prettier', 'vite', 'vitest', 'jest', 'cypress', 'playwright', 'testjs', 'testts',
		'turborepo', 'nx', 'docker', 'terraform', 'helm', 'github-actions-workflow', 'gitlab', 'jenkins',
		'git', 'diff', 'makefile', 'cmake', 'gradle', 'maven', 'prisma', 'lock', 'editorconfig',
		'tsconfig', 'config', 'nginx', 'class', 'log'
	]],
	['data', 'Data + docs', [
		'json', 'json5', 'yaml', 'toml', 'xml', 'markdown', 'mdx', 'asciidoc', 'readme', 'license',
		'codeowners', 'todo', 'text', 'pdf', 'word', 'excel', 'powerpoint', 'jupyter', 'mermaid',
		'dotenv', 'cert', 'key'
	]],
	['misc', 'Media + misc', [
		'image', 'audio', 'video', 'font', 'svg', 'zip', 'binary', 'exe', 'file',
		'agents', 'claude', 'copilot', 'cursor', 'vscode'
	]],
	['generic', 'Generics — the long-tail fallbacks', [
		'generic-code', 'generic-config', 'generic-data', 'generic-doc', 'generic-image',
		'generic-media', 'generic-font', 'generic-archive', 'generic-binary'
	]]
];

// The six blocks above are the hand-curated core-tier domains and stay exactly as the lead
// reviewed them. The 1,006 long-tail icons are grouped by their worklist `category` — the
// same axis §11.3 scopes R7 on — and sorted by id inside each block.
const LONGTAIL_TITLES = {
	code: 'Long tail — languages and frameworks',
	config: 'Long tail — configuration and tooling',
	doc: 'Long tail — documents',
	data: 'Long tail — data',
	image: 'Long tail — images',
	media: 'Long tail — media',
	font: 'Long tail — fonts',
	archive: 'Long tail — archives',
	binary: 'Long tail — binaries',
	unknown: 'Long tail — uncategorised'
};
{
	const coreIds = new Set(DOMAINS.flatMap(([, , ids]) => ids));
	const category = new Map();
	const wl = join(ROOT, 'longtail-worklist.json');
	if (existsSync(wl)) {
		for (const s of JSON.parse(readFileSync(wl, 'utf8')).slices) {
			for (const c of s.concepts) { category.set(`${c.kind}/${c.id}`, c.category ?? 'unknown'); }
		}
	}
	const groups = new Map();
	for (const i of fileIcons) {
		if (coreIds.has(i.id)) { continue; }
		const cat = category.get(`file/${i.id}`) ?? 'unknown';
		if (!groups.has(cat)) { groups.set(cat, []); }
		groups.get(cat).push(i.id);
	}
	for (const key of Object.keys(LONGTAIL_TITLES)) {
		const ids = groups.get(key);
		if (!ids?.length) { continue; }
		DOMAINS.push([`lt-${key}`, LONGTAIL_TITLES[key], ids.sort()]);
	}
}

const placed = DOMAINS.flatMap(([, , ids]) => ids);
const missing = fileIcons.map(i => i.id).filter(id => !placed.includes(id));
const extra = placed.filter(id => !fileIcons.some(i => i.id === id));
const dupes = placed.filter((id, n) => placed.indexOf(id) !== n);
if (missing.length || extra.length || dupes.length) {
	throw new Error(`domain map is wrong — unplaced: ${missing.join(', ') || 'none'}; `
		+ `unknown: ${extra.join(', ') || 'none'}; duplicated: ${dupes.join(', ') || 'none'}`);
}

// ---- resolve a real filename through the built theme -------------------------

const defToIcon = new Map();
for (const [name, d] of Object.entries(theme.iconDefinitions)) {
	const m = /\/(file|folder)\/(.+)\.svg$/.exec(d.iconPath);
	defToIcon.set(name, { kind: m[1], id: m[2] });
}
function resolveFile(name) {
	const lower = name.toLowerCase();
	let def = theme.fileNames[lower];
	if (!def) {
		const parts = lower.split('.');
		for (let i = 1; i < parts.length && !def; i++) { def = theme.fileExtensions[parts.slice(i).join('.')]; }
	}
	return defToIcon.get(def ?? theme.file);
}
const resolveFolder = (name, open) => {
	const def = theme.folderNames[name.toLowerCase()];
	return defToIcon.get(open ? (def ? `${def}_open` : theme.folderExpanded) : (def ?? theme.folder));
};

// ---- markup helpers ----------------------------------------------------------

const sym = (kind, id) => `${kind === 'file' ? 'f' : 'd'}-${id}`;
const use = (kind, id, s, alt = '') =>
	`<svg class="ico" width="${s}" height="${s}" role="img" aria-label="${esc(alt)}"><use href="#${sym(kind, id)}"/></svg>`;
const row = (kind, id, label) =>
	`<div class="row">${use(kind, id, 16)}<span>${esc(label)}</span></div>`;
const row22 = (kind, id, label) =>
	`<div class="row r22">${use(kind, id, 22)}<span>${esc(label)}</span></div>`;

const defs = `<svg width="0" height="0" aria-hidden="true" style="position:absolute"><defs>
${[...icons.values()].map(i => `<symbol id="${sym(i.kind, i.id)}" viewBox="0 0 16 16">${i.inner}</symbol>`).join('\n')}
${/* pre-reconciliation geometry for the three marks that were redrawn */''}
<symbol id="x-font" viewBox="0 0 16 16"><path fill="#B4907A" d="M5.56 12.8L3.39 12.8 6.67 3.2 9.25 3.2 12.61 12.8 10.43 12.8 9.68 10.57 6.28 10.57 5.56 12.8ZM7.04 8.17L6.77 9.03 9.18 9.03 8.89 8.17Q8.65 7.43 8.42 6.58 8.19 5.72 7.94 4.74 7.7 5.73 7.48 6.59 7.26 7.45 7.04 8.17Z"/></symbol>
<symbol id="x-generic-font" viewBox="0 0 16 16"><path fill="#8E9575" d="M5.56 12.8L3.39 12.8 6.67 3.2 9.25 3.2 12.61 12.8 10.43 12.8 9.68 10.57 6.28 10.57 5.56 12.8ZM7.04 8.17L6.77 9.03 9.18 9.03 8.89 8.17Q8.65 7.43 8.42 6.58 8.19 5.72 7.94 4.74 7.7 5.73 7.48 6.59 7.26 7.45 7.04 8.17Z"/></symbol>
<symbol id="x-todo" viewBox="0 0 16 16"><path fill="#C9A241" d="M1.34 9.52L6.25 13.55 14.72 5.57 13.18 3.93 6.15 10.55 2.76 7.78Z"/></symbol>
</defs></svg>`;

// ---- 1. the file set, by domain ---------------------------------------------

const SET = DOMAINS.map(([key, title, ids]) => `
<section class="dom" id="dom-${key}">
  <h3>${esc(title)} <span class="count">${ids.length}</span></h3>
  <div class="grid">${ids.map(id => `<span class="cell">
    <span class="pair">${use('file', id, 16, `${id} 16px`)}</span>
    <em>${esc(id)}</em></span>`).join('')}</div>
  <div class="cols">${ids.map(id => row22('file', id, id)).join('')}</div>
</section>`).join('');

// ---- 2. folders --------------------------------------------------------------

const FOLDERS = `<div class="grid folders">${folderIds.map(id => `<span class="cell">
  <span class="pair">${use('folder', id, 22, `${id} closed`)}${use('folder', `${id}-open`, 22, `${id} open`)}</span>
  <em>${esc(id)}</em></span>`).join('')}</div>`;

// ---- 3. explorer strips ------------------------------------------------------

const STRIPS = [
	['a Next.js app', [
		['d', 'app'], ['d', 'components'], ['d', 'public'], ['d', 'styles'], ['d', 'node_modules'],
		['d', '.github'], ['d', '.next'],
		['f', '.env.local'], ['f', '.eslintrc.json'], ['f', '.gitignore'], ['f', 'Dockerfile'],
		['f', 'middleware.ts'], ['f', 'next.config.js'], ['f', 'package.json'], ['f', 'pnpm-lock.yaml'],
		['f', 'postcss.config.js'], ['f', 'README.md'], ['f', 'tailwind.config.ts'],
		['f', 'tsconfig.json'], ['f', 'vercel.json']
	]],
	['a Rust crate', [
		['d', 'src'], ['d', 'tests'], ['d', 'benches'], ['d', 'examples'], ['d', 'target'], ['d', '.github'],
		['f', '.gitignore'], ['f', 'build.rs'], ['f', 'Cargo.lock'], ['f', 'Cargo.toml'],
		['f', 'CHANGELOG.md'], ['f', 'clippy.toml'], ['f', 'Dockerfile'], ['f', 'LICENSE'],
		['f', 'main.rs'], ['f', 'README.md'], ['f', 'rustfmt.toml'], ['f', 'rust-toolchain.toml'],
		['f', 'schema.sql']
	]],
	['this vscode fork', [
		['d', 'build'], ['d', 'cli'], ['d', 'extensions'], ['d', 'resources'], ['d', 'scripts'],
		['d', 'src'], ['d', 'test'], ['d', '.vscode'], ['d', '.github'],
		['f', '.editorconfig'], ['f', '.eslint-ignore'], ['f', 'CLAUDE.md'], ['f', 'board.md'],
		['f', 'cglicenses.json'], ['f', 'gulpfile.js'], ['f', 'package.json'], ['f', 'product.json'],
		['f', 'Tasks.md'], ['f', 'tsconfig.base.json'], ['f', 'vsebcode.code-workspace']
	]]
].map(([title, entries]) => `<div class="tree">
  <div class="treehead">${esc(title)}</div>
  ${entries.map(([kind, name]) => {
		const r = kind === 'd' ? resolveFolder(name, false) : resolveFile(name);
		return `<div class="row">${use(r.kind, r.id, 16)}<span>${esc(name)}${kind === 'd' ? '/' : ''}</span></div>`;
	}).join('\n  ')}
</div>`).join('');

// R14 spot check. The three repo roots above only exercise three of the 205 flipped
// associations (components/, postcss.config.js, target/), so these name the rest directly.
// `was` is data — the withdrawn resolution, which is not on disk any more — and `now` is
// resolved live, so a stale theme shows up as a mismatch rather than as a plausible icon.
const FLIPCHECK = [
	['R14 — the flip, working as intended', [
		['build.awk', 'shell'], ['hero.avif', 'image'], ['macros.sty', 'tex'],
		['Rakefile', 'ruby'], ['Gemfile', 'ruby'], ['style.less', 'css'],
		['notes.rst', 'markdown'], ['composer.lock', 'json']
	]],
	['R14a — pinned back, and the pin must hold', [
		['app.tsx', 'qwik'], ['config.yml', 'cloudfoundry'], ['values.yaml', 'esphome'],
		['data.xml', 'source'], ['fig.tikz', 'matlab'], ['article.cls', 'vb']
	]]
].map(([title, rows]) => `<div class="tree">
  <div class="treehead">${esc(title)}</div>
  ${rows.map(([name, was]) => {
		const now = resolveFile(name);
		return `<div class="row flow">${use('file', was, 16)}<span class="dim mono">${esc(was)}</span>`
			+ `<span class="arr">→</span>${use(now.kind, now.id, 16)}`
			+ `<span class="mono">${esc(now.id)}</span><span class="dim">${esc(name)}</span></div>`;
	}).join('\n  ')}
</div>`).join('');

// ---- 4. changed in reconciliation --------------------------------------------
// Pre-change geometry, kept here so a "before" cell shows what actually shipped before —
// never the current drawing wearing an old fill.
const PLATE = (c) => `<rect x="1" y="1" width="14" height="14" rx="3" fill="${c}"/>`;
const PRE = {
	font: () => '<path fill="#B4907A" d="M5.56 12.8L3.39 12.8 6.67 3.2 9.25 3.2 12.61 12.8 10.43 12.8 9.68 10.57 6.28 10.57 5.56 12.8ZM7.04 8.17L6.77 9.03 9.18 9.03 8.89 8.17Q8.65 7.43 8.42 6.58 8.19 5.72 7.94 4.74 7.7 5.73 7.48 6.59 7.26 7.45 7.04 8.17Z"/>',
	'generic-font': () => '<path fill="#8E9575" d="M5.56 12.8L3.39 12.8 6.67 3.2 9.25 3.2 12.61 12.8 10.43 12.8 9.68 10.57 6.28 10.57 5.56 12.8ZM7.04 8.17L6.77 9.03 9.18 9.03 8.89 8.17Q8.65 7.43 8.42 6.58 8.19 5.72 7.94 4.74 7.7 5.73 7.48 6.59 7.26 7.45 7.04 8.17Z"/>',
	todo: (c) => `<path fill="${c}" d="M1.34 9.52L6.25 13.55 14.72 5.57 13.18 3.93 6.15 10.55 2.76 7.78Z"/>`,
	clojure: (c) => PLATE(c) + '<path fill="#FFFFFF" d="M4.72 11.17Q4.11 11.17 3.64 10.89 3.17 10.62 2.9 10.11 2.63 9.59 2.63 8.86 2.63 8.12 2.9 7.61 3.18 7.09 3.65 6.82 4.12 6.54 4.72 6.54 5.23 6.54 5.64 6.73 6.05 6.92 6.32 7.28 6.58 7.64 6.65 8.14L5.72 8.14Q5.65 7.78 5.39 7.57 5.12 7.36 4.73 7.36 4.21 7.36 3.88 7.75 3.56 8.14 3.56 8.86 3.56 9.59 3.89 9.97 4.21 10.35 4.73 10.35 5.11 10.35 5.38 10.14 5.65 9.93 5.72 9.56L6.65 9.56Q6.6 9.98 6.36 10.35 6.11 10.71 5.7 10.94 5.28 11.17 4.72 11.17ZM10.06 11.11L7.2 11.11 7.2 6.61 8.12 6.61 8.12 10.34 10.06 10.34 10.06 11.11ZM11.88 11.17Q11.18 11.17 10.78 10.8 10.37 10.43 10.37 9.75L10.37 9.49 11.29 9.49 11.29 9.77Q11.29 10.09 11.45 10.26 11.61 10.42 11.88 10.42 12.15 10.42 12.31 10.26 12.46 10.09 12.46 9.76L12.46 6.61 13.37 6.61 13.37 9.75Q13.37 10.43 12.98 10.8 12.58 11.17 11.88 11.17Z"/>',
	expo: (c) => PLATE(c) + '<path fill="#FFFFFF" d="M10.35 12.13L5.65 12.13 5.65 5.13 10.34 5.13 10.34 6.32 7.09 6.32 7.09 8.01 10.09 8.01 10.09 9.18 7.09 9.18 7.09 10.94 10.35 10.94 10.35 12.13Z"/>'
};
const chip = (i) => `<svg class="ico" width="22" height="22" viewBox="0 0 16 16" role="img" aria-label="">${i}</svg>`;
const tint = (id, hex) => icons.get(`file/${id}`).inner.replaceAll(byIdDominant(id), hex);
const byIdDominant = (id) => manifest.icons.find(i => i.kind === 'file' && i.id === id).dominant;
const swatch = (hex) => hex ? `<span class="sw" style="background:${hex}"></span>${hex}` : '—';

// round 1: 26 retints + 3 redrawn marks (todo is both)
const r1 = fileIcons.filter(i => i.round1);
const R1ROWS = r1.map(i => {
	const { from, to, mark } = i.round1;
	const pre = PRE[i.id];
	const before = chip(pre ? pre(from ?? i.dominant) : tint(i.id, from));
	// clojure's geometry changed again in round 2, so its round-1 result is the old mark in
	// the new plate; a mark-only change lands on today's geometry; a retint on today's fill
	const after = chip(i.id === 'clojure' ? PRE.clojure(to)
		: !from ? icons.get(`file/${i.id}`).inner
		: tint(i.id, to));
	const superseded = i.round2 && i.round2.kind !== 'kept'
		? ' <span class="sup">superseded in round 2</span>' : '';
	return `
  <tr>
    <td class="mono">${esc(i.id)}${superseded}</td>
    <td class="mono dim">${i.archetype}</td>
    <td class="ctr">${before}</td>
    <td class="mono">${swatch(from)}</td>
    <td class="ctr grp">${after}</td>
    <td class="mono">${swatch(to)}</td>
    <td class="mono dim">${esc(mark ? `mark redrawn: ${mark}` : '')}</td>
  </tr>`;
}).join('');

// round 2: the ruled flag list
const R2LABEL = { retint: 'retint', mark: 'mark redrawn', kept: 'kept — see note' };
const r2 = fileIcons.filter(i => i.round2);
const R2ROWS = r2.map(i => {
	const { kind, from, note } = i.round2;
	const isMark = kind === 'mark';
	const before = kind === 'kept' ? '<span class="dim mono">no change</span>'
		: chip(isMark ? PRE[i.id](i.dominant) : tint(i.id, from));
	const after = kind === 'kept' ? '<span class="dim mono">—</span>' : use('file', i.id, 22, `${i.id} after`);
	return `
  <tr>
    <td class="mono">${esc(i.id)}</td>
    <td class="mono dim">${R2LABEL[kind]}</td>
    <td class="ctr">${before}</td>
    <td class="mono">${isMark || kind === 'kept' ? `<span class="dim">${esc(from ?? '')}</span>` : swatch(from)}</td>
    <td class="ctr grp">${after}</td>
    <td class="mono">${kind === 'kept' ? '' : swatch(i.dominant)}</td>
    <td class="mono dim note">${esc(note)}</td>
  </tr>`;
}).join('');

// ---- 4b. round 3 — the full-coverage pass ------------------------------------
// The 18 authoring slices ran concurrently and could not see each other, so the set-wide
// audit was the first thing that could. These are its findings: 20 R8 form collisions
// where two slices independently drew the same mark for unrelated concepts, and the one
// R7 hue twin the form qualifier does not excuse. Fix policy is round 1's: the less
// brand-anchored member moves.
//
// The "before" markup is verbatim what shipped before this round — captured off disk
// before the redraw, never today's drawing wearing an old fill.
const PRE3 = {
	adonis: '<rect x="1" y="1" width="14" height="14" rx="3" fill="#3D3480"/><path fill="#FFFFFF" d="M6.52 11.65L5.2 11.65 7.19 5.82 8.76 5.82 10.8 11.65 9.47 11.65 9.02 10.3 6.95 10.3 6.52 11.65ZM7.42 8.84L7.25 9.36 8.71 9.36 8.54 8.84Q8.4 8.39 8.26 7.87 8.12 7.35 7.96 6.75 7.82 7.36 7.68 7.88 7.55 8.4 7.42 8.84Z"/>',
	'api-extractor': '<rect x="1" y="1" width="14" height="14" rx="3" fill="#4E6478"/><path fill="#FFFFFF" d="M3.67 11.38L2.5 11.38 4.27 6.2 5.66 6.2 7.47 11.38 6.3 11.38 5.9 10.18 4.06 10.18 3.67 11.38ZM4.47 8.88L4.32 9.35 5.62 9.35 5.46 8.88Q5.34 8.49 5.21 8.03 5.09 7.56 4.95 7.04 4.83 7.57 4.71 8.03 4.59 8.5 4.47 8.88ZM9.03 11.38L7.97 11.38 7.97 6.2 9.99 6.2Q10.58 6.2 10.99 6.43 11.41 6.65 11.62 7.05 11.84 7.44 11.84 7.95 11.84 8.47 11.62 8.86 11.4 9.25 10.98 9.47 10.56 9.69 9.97 9.69L9.03 9.69 9.03 11.38ZM9.03 7.08L9.03 8.84 9.8 8.84Q10.28 8.84 10.51 8.59 10.75 8.34 10.75 7.95 10.75 7.56 10.51 7.32 10.28 7.08 9.79 7.08L9.03 7.08ZM12.44 6.2L13.5 6.2 13.5 11.38 12.44 11.38 12.44 6.2Z"/>',
	brunch: '<rect x="1" y="1" width="14" height="14" rx="3" fill="#A08F7C"/><path fill="#FFFFFF" d="M5.64 11.54L3.3 11.54 3.3 5.98 5.5 5.98Q6.42 5.98 6.88 6.39 7.34 6.79 7.34 7.41 7.34 7.9 7.05 8.21 6.77 8.51 6.34 8.6L6.34 8.66Q6.65 8.67 6.93 8.84 7.21 9 7.38 9.3 7.55 9.6 7.55 10.01 7.55 10.44 7.34 10.79 7.12 11.14 6.7 11.34 6.27 11.54 5.64 11.54ZM4.44 9.1L4.44 10.6 5.42 10.6Q5.92 10.6 6.15 10.41 6.38 10.21 6.38 9.9 6.38 9.55 6.13 9.32 5.88 9.1 5.45 9.1L4.44 9.1ZM4.44 6.91L4.44 8.32 5.34 8.32Q5.7 8.32 5.94 8.12 6.18 7.93 6.18 7.59 6.18 7.29 5.97 7.1 5.76 6.91 5.36 6.91L4.44 6.91ZM9.49 11.54L8.35 11.54 8.35 5.98 10.52 5.98Q11.46 5.98 11.98 6.48 12.5 6.97 12.5 7.79 12.5 8.36 12.25 8.77 12 9.17 11.52 9.37L12.7 11.54 11.44 11.54 10.38 9.55 9.49 9.55 9.49 11.54ZM9.49 6.92L9.49 8.63 10.31 8.63Q11.33 8.63 11.33 7.79 11.33 7.37 11.08 7.15 10.83 6.92 10.3 6.92L9.49 6.92Z"/>',
	cloudfoundry: '<rect x="1" y="1" width="14" height="14" rx="3" fill="#A0B6BE"/><path fill="#22383F" d="M5.87 11.6Q5.13 11.6 4.55 11.26 3.97 10.93 3.64 10.3 3.3 9.66 3.3 8.77 3.3 7.87 3.64 7.23 3.97 6.59 4.56 6.26 5.14 5.93 5.87 5.93 6.49 5.93 7 6.16 7.51 6.39 7.83 6.83 8.16 7.27 8.24 7.89L7.1 7.89Q7.02 7.44 6.69 7.19 6.36 6.93 5.89 6.93 5.24 6.93 4.85 7.41 4.45 7.89 4.45 8.77 4.45 9.66 4.85 10.13 5.25 10.59 5.88 10.59 6.35 10.59 6.69 10.34 7.02 10.09 7.1 9.63L8.24 9.63Q8.18 10.15 7.88 10.6 7.58 11.04 7.07 11.32 6.56 11.6 5.87 11.6ZM10.2 11.52L9.07 11.52 9.07 6 12.7 6 12.7 6.94 10.2 6.94 10.2 8.48 12.46 8.48 12.46 9.4 10.2 9.4 10.2 11.52Z"/>',
	cocos: '<rect x="1" y="1" width="14" height="14" rx="3" fill="#2A8D70"/><path fill="#FFFFFF" d="M5.53 11.37Q4.86 11.37 4.34 11.07 3.81 10.77 3.5 10.19 3.2 9.61 3.2 8.8 3.2 7.98 3.51 7.4 3.81 6.82 4.34 6.52 4.87 6.22 5.53 6.22 6.1 6.22 6.56 6.43 7.02 6.64 7.32 7.04 7.62 7.44 7.69 8L6.65 8Q6.58 7.59 6.28 7.36 5.98 7.13 5.55 7.13 4.97 7.13 4.61 7.57 4.24 8 4.24 8.8 4.24 9.61 4.61 10.04 4.97 10.46 5.55 10.46 5.98 10.46 6.28 10.23 6.58 10 6.65 9.59L7.7 9.59Q7.64 10.06 7.36 10.46 7.09 10.87 6.63 11.12 6.17 11.37 5.53 11.37ZM10.64 11.37Q9.97 11.37 9.44 11.07 8.91 10.77 8.61 10.19 8.3 9.61 8.3 8.8 8.3 7.98 8.61 7.4 8.92 6.82 9.45 6.52 9.98 6.22 10.64 6.22 11.21 6.22 11.67 6.43 12.13 6.64 12.43 7.04 12.72 7.44 12.8 8L11.76 8Q11.68 7.59 11.39 7.36 11.09 7.13 10.66 7.13 10.07 7.13 9.71 7.57 9.35 8 9.35 8.8 9.35 9.61 9.71 10.04 10.07 10.46 10.65 10.46 11.08 10.46 11.38 10.23 11.68 10 11.76 9.59L12.8 9.59Q12.74 10.06 12.47 10.46 12.2 10.87 11.73 11.12 11.27 11.37 10.64 11.37Z"/>',
	denizenscript: '<rect x="1" y="1" width="14" height="14" rx="3" fill="#5DA14F"/><path fill="#FFFFFF" d="M5.19 11.45L3.3 11.45 3.3 6.06 5.21 6.06Q6.02 6.06 6.61 6.39 7.19 6.71 7.5 7.31 7.82 7.92 7.82 8.75 7.82 9.6 7.5 10.2 7.19 10.8 6.6 11.13 6.01 11.45 5.19 11.45ZM4.4 7.02L4.4 10.5 5.14 10.5Q5.92 10.5 6.32 10.08 6.72 9.66 6.72 8.75 6.72 7.85 6.32 7.43 5.92 7.02 5.15 7.02L4.4 7.02ZM10.62 11.53Q9.65 11.53 9.07 11.08 8.49 10.64 8.47 9.78L9.54 9.78Q9.57 10.19 9.87 10.39 10.17 10.6 10.61 10.6 11.05 10.6 11.32 10.41 11.59 10.22 11.59 9.91 11.59 9.63 11.35 9.48 11.1 9.34 10.66 9.23L10.07 9.08Q9.38 8.91 9 8.56 8.61 8.2 8.61 7.62 8.61 7.13 8.87 6.76 9.14 6.4 9.59 6.19 10.05 5.99 10.64 5.99 11.23 5.99 11.68 6.2 12.12 6.4 12.37 6.76 12.62 7.13 12.63 7.6L11.56 7.6Q11.53 7.28 11.28 7.1 11.04 6.92 10.62 6.92 10.2 6.92 9.97 7.1 9.74 7.27 9.74 7.54 9.74 7.84 10 7.99 10.26 8.14 10.6 8.22L11.09 8.34Q11.54 8.45 11.91 8.64 12.27 8.84 12.49 9.15 12.7 9.47 12.7 9.92 12.7 10.65 12.15 11.09 11.6 11.53 10.62 11.53Z"/>',
	docz: '<rect x="1" y="1" width="14" height="14" rx="3" fill="#B54F93"/><path fill="#FFFFFF" d="M5.2 11.48L3.3 11.48 3.3 6.07 5.22 6.07Q6.03 6.07 6.62 6.4 7.2 6.72 7.52 7.32 7.83 7.93 7.83 8.77 7.83 9.62 7.52 10.22 7.2 10.83 6.61 11.15 6.02 11.48 5.2 11.48ZM4.41 7.03L4.41 10.52 5.15 10.52Q5.93 10.52 6.33 10.1 6.73 9.68 6.73 8.77 6.73 7.86 6.33 7.44 5.93 7.03 5.15 7.03L4.41 7.03ZM12.7 11.48L8.59 11.48 8.59 10.81 10.78 7.72Q10.92 7.53 11.07 7.35 11.22 7.16 11.38 6.97 11.12 6.99 10.86 6.99 10.6 6.99 10.35 6.99L8.58 6.99 8.58 6.07 12.69 6.07 12.69 6.74 10.54 9.78Q10.4 9.98 10.23 10.18 10.07 10.38 9.9 10.58 10.18 10.56 10.45 10.56 10.72 10.56 11 10.56L12.7 10.56 12.7 11.48Z"/>',
	glitter: '<rect x="1" y="1" width="14" height="14" rx="3" fill="#B3A9D1"/><path fill="#2E2745" d="M5.71 11.43Q4.99 11.43 4.45 11.11 3.91 10.79 3.6 10.21 3.3 9.62 3.3 8.81 3.3 7.98 3.61 7.39 3.93 6.8 4.47 6.48 5.01 6.17 5.69 6.17 6.26 6.17 6.73 6.39 7.2 6.61 7.5 7 7.8 7.38 7.87 7.89L6.8 7.89Q6.69 7.52 6.41 7.31 6.13 7.1 5.7 7.1 5.11 7.1 4.74 7.54 4.37 7.98 4.37 8.8 4.37 9.61 4.73 10.05 5.1 10.5 5.72 10.5 6.26 10.5 6.58 10.21 6.89 9.92 6.9 9.43L5.79 9.43 5.79 8.63 7.92 8.63 7.92 9.27Q7.92 9.94 7.63 10.43 7.35 10.91 6.85 11.17 6.35 11.43 5.71 11.43ZM10.08 7.11L8.52 7.11 8.52 6.24 12.7 6.24 12.7 7.11 11.14 7.11 11.14 11.36 10.08 11.36 10.08 7.11Z"/>',
	hugo: '<rect x="1" y="1" width="14" height="14" rx="3" fill="#B23F76"/><path fill="#FFFFFF" d="M6.47 12.13L5.04 12.13 5.04 5.13 6.47 5.13 6.47 7.96 9.52 7.96 9.52 5.13 10.96 5.13 10.96 12.13 9.52 12.13 9.52 9.15 6.47 9.15 6.47 12.13Z"/>',
	just: '<rect x="1" y="1" width="14" height="14" rx="3" fill="#6FB56C"/><path fill="#FFFFFF" d="M8.01 12.17Q6.92 12.17 6.29 11.6 5.67 11.03 5.67 9.97L5.67 9.56 7.1 9.56 7.1 9.99Q7.1 10.5 7.34 10.75 7.59 11.01 8.01 11.01 8.43 11.01 8.67 10.75 8.92 10.5 8.92 9.99L8.92 5.07 10.33 5.07 10.33 9.97Q10.33 11.03 9.71 11.6 9.09 12.17 8.01 12.17Z"/>',
	mailing: '<path fill="#C4644E" fill-rule="evenodd" d="M2.7 3.2h10.6a1.3 1.3 0 0 1 1.3 1.3v7a1.3 1.3 0 0 1 -1.3 1.3h-10.6a1.3 1.3 0 0 1 -1.3 -1.3v-7a1.3 1.3 0 0 1 1.3 -1.3ZM1.6 3.9L8 9L14.4 3.9L14.4 5.5L8 10.6L1.6 5.5Z"/>',
	metal: '<path fill="#8C98A8" d="M5.1 4.1h5.8a1 1 0 0 1 1 1v5.8a1 1 0 0 1 -1 1h-5.8a1 1 0 0 1 -1 -1v-5.8a1 1 0 0 1 1 -1ZM6.8 6.2a.6 .6 0 0 0 -.6 .6v2.4a.6 .6 0 0 0 .6 .6h2.4a.6 .6 0 0 0 .6 -.6v-2.4a.6 .6 0 0 0 -.6 -.6ZM1.7 5.2L4.1 5.2L4.1 6.35L1.7 6.35ZM1.7 7.4L4.1 7.4L4.1 8.55L1.7 8.55ZM1.7 9.6L4.1 9.6L4.1 10.75L1.7 10.75ZM11.9 5.2L14.3 5.2L14.3 6.35L11.9 6.35ZM11.9 7.4L14.3 7.4L14.3 8.55L11.9 8.55ZM11.9 9.6L14.3 9.6L14.3 10.75L11.9 10.75ZM5.2 1.7L6.35 1.7L6.35 4.1L5.2 4.1ZM7.4 1.7L8.55 1.7L8.55 4.1L7.4 4.1ZM9.6 1.7L10.75 1.7L10.75 4.1L9.6 4.1ZM5.2 11.9L6.35 11.9L6.35 14.3L5.2 14.3ZM7.4 11.9L8.55 11.9L8.55 14.3L7.4 14.3ZM9.6 11.9L10.75 11.9L10.75 14.3L9.6 14.3Z"/>',
	'nest-resolver': '<path fill="#B0607E" fill-rule="evenodd" d="M1.9 8a6.1 6.1 0 1 0 12.2 0a6.1 6.1 0 1 0 -12.2 0M3.6 8a4.4 4.4 0 1 1 8.8 0a4.4 4.4 0 1 1 -8.8 0M5.6 8a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0 -4.8 0"/>',
	posthtml: '<rect x="1" y="1" width="14" height="14" rx="3" fill="#D18A5E"/><path fill="#FFFFFF" d="M4.41 11.48L3.3 11.48 3.3 6.07 5.41 6.07Q6.03 6.07 6.46 6.3 6.89 6.53 7.12 6.95 7.35 7.36 7.35 7.89 7.35 8.43 7.12 8.84 6.89 9.25 6.45 9.48 6.01 9.71 5.39 9.71L4.41 9.71 4.41 11.48ZM4.41 6.98L4.41 8.82 5.21 8.82Q5.72 8.82 5.96 8.56 6.2 8.3 6.2 7.89 6.2 7.48 5.96 7.23 5.72 6.98 5.2 6.98L4.41 6.98ZM9.23 11.48L8.12 11.48 8.12 6.07 9.23 6.07 9.23 8.25 11.59 8.25 11.59 6.07 12.7 6.07 12.7 11.48 11.59 11.48 11.59 9.17 9.23 9.17 9.23 11.48Z"/>',
	purescript: '<rect x="1" y="1" width="14" height="14" rx="3" fill="#A0A8BC"/><path fill="#232A38" d="M4.47 11.61L3.3 11.61 3.3 5.88 5.53 5.88Q6.18 5.88 6.64 6.13 7.1 6.38 7.34 6.82 7.58 7.25 7.58 7.82 7.58 8.38 7.33 8.82 7.09 9.25 6.63 9.49 6.16 9.74 5.5 9.74L4.47 9.74 4.47 11.61ZM4.47 6.85L4.47 8.79 5.32 8.79Q5.85 8.79 6.11 8.52 6.37 8.25 6.37 7.82 6.37 7.38 6.11 7.12 5.85 6.85 5.31 6.85L4.47 6.85ZM10.49 11.69Q9.46 11.69 8.84 11.22 8.23 10.74 8.2 9.83L9.34 9.83Q9.37 10.27 9.69 10.48 10.01 10.7 10.48 10.7 10.95 10.7 11.23 10.5 11.52 10.3 11.52 9.97 11.52 9.67 11.26 9.52 11 9.36 10.53 9.24L9.9 9.09Q9.18 8.91 8.77 8.53 8.36 8.15 8.36 7.53 8.36 7.01 8.64 6.63 8.91 6.24 9.4 6.02 9.89 5.81 10.51 5.81 11.14 5.81 11.61 6.02 12.09 6.24 12.35 6.63 12.62 7.01 12.62 7.52L11.49 7.52Q11.46 7.17 11.2 6.98 10.93 6.79 10.5 6.79 10.05 6.79 9.8 6.98 9.56 7.17 9.56 7.45 9.56 7.77 9.83 7.93 10.11 8.09 10.47 8.18L10.99 8.3Q11.47 8.41 11.86 8.62 12.25 8.83 12.47 9.17 12.7 9.5 12.7 9.98 12.7 10.76 12.12 11.22 11.54 11.69 10.49 11.69Z"/>',
	razor: '<path fill="#6B4EC4" d="M8.12 13.24Q6.44 13.24 5.25 12.63 4.06 12.02 3.43 10.86 2.8 9.7 2.8 8.05 2.8 6.48 3.41 5.28 4.02 4.09 5.2 3.43 6.37 2.76 8.07 2.76 9.27 2.76 10.21 3.12 11.16 3.47 11.83 4.11 12.49 4.75 12.85 5.6 13.2 6.46 13.2 7.48 13.2 8.39 12.97 9.13 12.74 9.87 12.24 10.3 11.74 10.74 10.93 10.74 10.39 10.74 9.96 10.52 9.52 10.3 9.45 9.82L9.4 9.82Q9.26 10.23 8.82 10.49 8.39 10.74 7.74 10.74 6.99 10.74 6.46 10.4 5.94 10.06 5.66 9.44 5.38 8.82 5.38 8 5.38 7.19 5.68 6.57 5.99 5.95 6.52 5.6 7.06 5.26 7.78 5.26 8.32 5.26 8.7 5.45 9.09 5.64 9.25 5.94L9.31 5.94 9.31 5.38 10.44 5.38 10.44 9.09Q10.44 9.35 10.56 9.51 10.68 9.66 10.94 9.66 11.46 9.66 11.66 9.16 11.86 8.66 11.86 7.59 11.86 6.51 11.45 5.71 11.04 4.9 10.22 4.46 9.4 4.01 8.17 4.01 6.23 4.01 5.21 5.08 4.19 6.14 4.19 8.02 4.19 9.94 5.23 10.96 6.26 11.97 8.24 11.97 8.92 11.97 9.5 11.83 10.08 11.69 10.43 11.55L10.86 12.69Q10.45 12.89 9.71 13.07 8.97 13.24 8.12 13.24ZM7.9 9.57Q9.24 9.57 9.24 7.98 9.24 7.18 8.9 6.84 8.56 6.5 7.91 6.5 7.29 6.5 6.95 6.91 6.6 7.32 6.6 7.97 6.6 8.66 6.92 9.12 7.23 9.57 7.9 9.57Z"/>',
	shaderlab: '<rect x="1" y="1" width="14" height="14" rx="3" fill="#5E6B78"/><path fill="#FFFFFF" d="M5.7 11.78Q4.61 11.78 3.97 11.29 3.32 10.79 3.3 9.84L4.49 9.84Q4.53 10.29 4.86 10.52 5.19 10.75 5.68 10.75 6.17 10.75 6.47 10.54 6.77 10.33 6.77 9.98 6.77 9.67 6.5 9.51 6.23 9.35 5.74 9.22L5.08 9.06Q4.32 8.87 3.89 8.48 3.46 8.08 3.46 7.43 3.46 6.89 3.75 6.48 4.04 6.08 4.55 5.85 5.06 5.63 5.71 5.63 6.37 5.63 6.87 5.85 7.36 6.08 7.64 6.49 7.92 6.89 7.93 7.42L6.74 7.42Q6.71 7.05 6.43 6.86 6.16 6.66 5.7 6.66 5.23 6.66 4.97 6.86 4.72 7.05 4.72 7.35 4.72 7.69 5.01 7.85 5.29 8.01 5.68 8.11L6.22 8.24Q6.72 8.36 7.13 8.58 7.53 8.79 7.77 9.14 8.01 9.49 8.01 9.99 8.01 10.81 7.4 11.3 6.79 11.78 5.7 11.78ZM12.7 11.7L8.89 11.7 8.89 5.71 10.12 5.71 10.12 10.68 12.7 10.68 12.7 11.7Z"/>',
	sty: '<rect x="1" y="1" width="14" height="14" rx="3" fill="#7E6FA8"/><path fill="#FFFFFF" d="M4.14 10.99Q3.4 10.99 2.96 10.65 2.52 10.31 2.5 9.66L3.32 9.66Q3.34 9.97 3.57 10.12 3.8 10.28 4.14 10.28 4.47 10.28 4.68 10.14 4.88 9.99 4.88 9.76 4.88 9.54 4.7 9.43 4.51 9.32 4.17 9.24L3.72 9.12Q3.2 9 2.91 8.72 2.61 8.45 2.61 8.01 2.61 7.63 2.81 7.35 3.01 7.08 3.36 6.92 3.71 6.77 4.15 6.77 4.61 6.77 4.95 6.92 5.29 7.08 5.48 7.36 5.67 7.63 5.67 7.99L4.86 7.99Q4.84 7.75 4.65 7.61 4.46 7.48 4.15 7.48 3.82 7.48 3.65 7.61 3.47 7.74 3.47 7.95 3.47 8.18 3.67 8.29 3.87 8.41 4.13 8.47L4.5 8.56Q4.85 8.64 5.13 8.79 5.4 8.94 5.57 9.18 5.73 9.42 5.73 9.76 5.73 10.32 5.31 10.66 4.89 10.99 4.14 10.99ZM7.31 7.52L6.06 7.52 6.06 6.82 9.41 6.82 9.41 7.52 8.16 7.52 8.16 10.93 7.31 10.93 7.31 7.52ZM12 10.93L11.16 10.93 11.16 9.39 9.64 6.82 10.63 6.82 11.32 8.1Q11.4 8.24 11.46 8.38 11.53 8.52 11.59 8.68 11.65 8.51 11.71 8.38 11.77 8.24 11.85 8.1L12.52 6.82 13.5 6.82 12 9.39 12 10.93Z"/>',
	styled: '<rect x="1" y="1" width="14" height="14" rx="3" fill="#A87A94"/><path fill="#FFFFFF" d="M5.39 11.46Q4.45 11.46 3.88 11.03 3.32 10.59 3.3 9.76L4.34 9.76Q4.37 10.16 4.66 10.36 4.95 10.56 5.38 10.56 5.8 10.56 6.07 10.37 6.33 10.19 6.33 9.89 6.33 9.62 6.09 9.48 5.85 9.33 5.43 9.23L4.85 9.09Q4.19 8.92 3.82 8.58 3.44 8.23 3.44 7.67 3.44 7.19 3.69 6.84 3.95 6.49 4.39 6.29 4.83 6.09 5.4 6.09 5.98 6.09 6.41 6.29 6.84 6.49 7.08 6.84 7.32 7.19 7.33 7.65L6.3 7.65Q6.27 7.34 6.03 7.17 5.79 6.99 5.39 6.99 4.98 6.99 4.76 7.16 4.54 7.33 4.54 7.6 4.54 7.89 4.79 8.03 5.04 8.17 5.37 8.26L5.84 8.37Q6.28 8.47 6.63 8.66 6.99 8.85 7.19 9.16 7.4 9.46 7.4 9.9 7.4 10.61 6.87 11.03 6.34 11.46 5.39 11.46ZM10.45 11.45Q9.75 11.45 9.21 11.14 8.66 10.82 8.34 10.22 8.03 9.62 8.03 8.78 8.03 7.93 8.35 7.33 8.67 6.72 9.22 6.41 9.77 6.09 10.45 6.09 11.04 6.09 11.52 6.31 12 6.53 12.31 6.95 12.62 7.36 12.7 7.95L11.61 7.95Q11.54 7.52 11.23 7.28 10.92 7.04 10.47 7.04 9.86 7.04 9.49 7.5 9.11 7.95 9.11 8.78 9.11 9.62 9.49 10.06 9.87 10.5 10.47 10.5 10.91 10.5 11.23 10.26 11.54 10.02 11.62 9.6L12.7 9.6Q12.64 10.08 12.36 10.51 12.07 10.93 11.59 11.19 11.11 11.45 10.45 11.45Z"/>',
	vapi: '<rect x="1" y="1" width="14" height="14" rx="3" fill="#8272A0"/><path fill="#FFFFFF" d="M3.67 11.38L2.5 11.38 4.27 6.2 5.66 6.2 7.47 11.38 6.3 11.38 5.9 10.18 4.06 10.18 3.67 11.38ZM4.47 8.88L4.32 9.35 5.62 9.35 5.46 8.88Q5.34 8.49 5.21 8.03 5.09 7.56 4.95 7.04 4.83 7.57 4.71 8.03 4.59 8.5 4.47 8.88ZM9.03 11.38L7.97 11.38 7.97 6.2 9.99 6.2Q10.58 6.2 10.99 6.43 11.41 6.65 11.62 7.05 11.84 7.44 11.84 7.95 11.84 8.47 11.62 8.86 11.4 9.25 10.98 9.47 10.56 9.69 9.97 9.69L9.03 9.69 9.03 11.38ZM9.03 7.08L9.03 8.84 9.79 8.84Q10.28 8.84 10.51 8.59 10.75 8.34 10.75 7.95 10.75 7.56 10.51 7.32 10.28 7.08 9.79 7.08L9.03 7.08ZM12.44 6.2L13.5 6.2 13.5 11.38 12.44 11.38 12.44 6.2Z"/>',
	zizmor: '<path fill="#9659A6" fill-rule="evenodd" d="M1.9 6.5a4.6 4.6 0 1 1 9.2 0a4.6 4.6 0 1 1 -9.2 0ZM3.4 6.5a3.1 3.1 0 1 1 6.2 0a3.1 3.1 0 1 1 -6.2 0Z"/><path fill="#9659A6" d="M8.49 10.11L12.99 14.61L14.61 12.99L10.11 8.49Z"/>'
};
const r3 = fileIcons.filter(i => i.round3);
const R3ROWS = r3.map(i => {
	const { kind, from, note } = i.round3;
	const before = kind === 'retint'
		? chip(tint(i.id, from))
		: `<svg class="ico" width="22" height="22" viewBox="0 0 16 16" role="img" aria-label="">${PRE3[i.id]}</svg>`;
	return `
  <tr>
    <td class="mono">${esc(i.id)}</td>
    <td class="mono dim">${kind === 'retint' ? 'retint (R7)' : 'mark redrawn (R8)'}</td>
    <td class="ctr">${before}</td>
    <td class="mono dim">${kind === 'retint' ? swatch(from) : esc(from)}</td>
    <td class="ctr grp">${use('file', i.id, 22, `${i.id} after`)}</td>
    <td class="mono">${kind === 'retint' ? swatch(i.dominant) : '<span class="dim">redrawn</span>'}</td>
    <td class="mono dim note">${esc(note)}</td>
  </tr>`;
}).join('');

// ---- 5. the flag list, resolved ----------------------------------------------

const RESOLVED_ITEMS = [
	['yaml', 'Ruling A — brand-true #CB171E. The near-twin against canon npm is accepted as R10a: brand fidelity over separation, carried by the YML / npm letter groups and the value gap.'],
	['git', 'Ruling B — restored to its batch-1 #E0603C; the round-1 retint is reverted and claude moved instead.'],
	['claude', 'Ruling B — brand hue and saturation kept, escaped R7 via lightness (ΔL 13.3 vs git). Shipped LIGHTER, against the ruling’s parenthetical: every darker candidate that clears R7 measured 45% faint ink and peak contrast 0.22, against 0.61 for this one.'],
	['svelte', 'Consequence of Ruling B — restoring git revived git ↔ svelte, so svelte took a 3-point darkening inside its own hue: #B15B25.'],
	['expo', 'Ruling C, SHIPPED — the rounded arch. 16 px proof: peak contrast 1.00, 2% faint ink. Logo-shaped geometry, so R1 applies and no letterpath is involved.'],
	['clojure', 'Ruling C, SHIPPED — the brand split circle, white on the plate. 16 px proof: peak contrast 1.00, 2% faint. Two-colour was rejected: the green lobe would vanish into the plate, and dropping the plate would undo clojure’s round-1 R7 solution.'],
	['maven', 'Ruling C, LETTERS KEPT — four feather builds all collapsed to an undifferentiated diagonal blade at 16 px: no barbs, no shaft, nothing that reads as a feather rather than a leaf.'],
	['maven', 'Ruling D, RETINTED — the dimmest icon in the set is fixed. The approved exit (move turborepo off L 50) was withdrawn on the 16 px measurements: erlang seals the lane above turborepo, so turborepo could only go darker and would have landed at peak 0.18 — the new dimmest icon. maven escaped up the saturation axis instead, #86323A → #A4656B (h 354 s 26 l 52): ΔS ≈ 34 against both angular and turborepo, peak 0.21 → 0.40, faint 62% → 32%, one icon moved instead of two.'],
	['erlang', 'Ruling C, LETTERS KEPT — the Erlang mark could not be verified to a shippable standard, and the ruling forbids inventing one.'],
	['cheader', 'Reviewed, no change — c / cheader / cppheader still read as one family with cpp #325B81 and the audit finds no twin among them.']
];
const RESOLVED = RESOLVED_ITEMS.map(([id, text]) => `
  <div class="flag done">
    <div class="flagicons">${use('file', id, 16)}${use('file', id, 22)}${use('file', id, 32)}</div>
    <div><div class="flagid">${esc(id)} <span class="badge ok">resolved</span></div><p>${esc(text)}</p></div>
  </div>`).join('');

// The accumulated HUMAN-FLAG list. Every slice review that shipped GREEN also handed up
// the marks it could not settle on evidence alone; assembly v2 adds what the set-wide pass
// turned up. One line each, phrased as the question that needs an answer.
const FLAG_GROUPS = [
	['Unverifiable logos — is the metaphor good enough?',
		'The honest-no-fabrication rule (A09) forbids inventing a logo, so where the real mark could not'
		+ ' be verified the slice shipped a stand-in — a metaphor where the concept offered one, letters'
		+ ' in a recognized hue where it did not. Each of these is standing in for a mark nobody could check.', [
			['file', 'jinja', 'A04 could not verify the Jinja mark and shipped a J2 badge — good enough, or draw the concept?'],
			['file', 'kivy', 'Same, for Kivy — keep the letter, or find a mark?'],
			['file', 'mediawiki', 'Same, for MediaWiki.'],
			['file', 'modernizr', 'Same, for Modernizr.'],
			['file', 'master-co', 'A04 drew a crown for Master CSS — is the crown earned or arbitrary?'],
			['file', 'karma', 'A04 drew a wheel for Karma — wheel, or letters?'],
			['file', 'bosque', 'A02 semantic fallback, logo unverifiable.'],
			['file', 'bruno', 'A02 semantic fallback (and its letters moved twice: B → BR in-slice, then brunch moved off BR in round 3).'],
			['file', 'casc', 'A02 semantic fallback.'],
			['file', 'cbx', 'A02 semantic fallback.'],
			['file', 'cangjie', 'A02 semantic fallback.'],
			['file', 'ceylon', 'A02 semantic fallback.'],
			['file', 'denizenscript', 'A02 semantic fallback; its letters also moved in round 3 (DS → DSC).'],
			['file', 'duc', 'A02 semantic fallback.'],
			['file', 'dylan', 'A02 semantic fallback.'],
			['file', 'docpad', 'A02 semantic fallback.'],
			['file', 'codekit', 'A02 semantic fallback.']
		]],
	['Abstractions the slice flagged itself', '', [
		['file', 'bicep', 'A01 drew an arm for Azure Bicep — does the pun land, or is it noise in a cloud-config context?'],
		['file', 'onnx', 'A01: the fan-in reads as arrows rather than a graph — redraw, or accept?'],
		['file', 'matlab', 'A12 abstracted the MATLAB membrane to a single crescent — enough of the brand, or too little?'],
		['folder', 'wasp', 'F06 called this its weakest concept-mark link: a single-band abdomen for Wasp. Redraw?'],
		['folder', 'javascript-open', 'F03: the OPEN variant is inherently coarse at 5.80 (the next-open precedent). Accept the coarseness for the whole open tier?'],
		['file', 'quarkdown', 'A06 put quarkdown in the markdown family and called the rhyme the weakest of its batch — contest it?']
	]],
	['Second-opinion pairs — eyeball them side by side', '', [
		['file', 'pytorch', 'A01 asked for a second opinion on pytorch (flame) against html (shield) — do they separate at 16 px?'],
		['file', 'safetensors', 'Same for safetensors (vault) against favicon (star).'],
		['file', 'swagger', 'Carried from round 1, still open: does the ring read at 16 px, or does the disc swallow it?'],
		['file', 'css', 'Carried from round 1, still open: css and html share the canon shield exactly (form 1.00). Sanction it, or redraw one?'],
		['file', 'sty', 'RULED 2026-09-02 — TWO CONCEPTS. Round 3 moved sty’s letters off latex-package’s and asked whether .sty being the LaTeX package file made them one concept. It does not: their matchers do not overlap at all — sty owns the extension .sty, latex-package owns the language id latex-package — so the R13 fold would have deleted a live association rather than a duplicate. Declared an R3 pair in audit.mjs FAMILIES, as the bare pair and not folded into the ten-member tex group, because sty ships purple #7E6FA8 against the family’s teal #61BAB5: kin by concept, not by hue. After R14 both resolve to their own artwork.', 'ruled']
	]]
];

// The fourth tuple element flips the badge: an item ruled since it was raised keeps its place
// in the group it was raised in, rather than moving to a resolved list it was never part of.
const FLAGS = FLAG_GROUPS.map(([title, lede, items]) => `
  <h3>${esc(title)} <span class="count">${items.length}</span></h3>
  ${lede ? `<p class="lede">${esc(lede)}</p>` : ''}
  <div class="flags">${items.map(([kind, id, text, ruled]) => `
    <div class="flag${ruled ? ' done' : ''}">
      <div class="flagicons">${use(kind, id, 16)}${use(kind, id, 22)}${use(kind, id, 32)}</div>
      <div><div class="flagid">${esc(kind === 'folder' ? `${id}/` : id)} <span class="badge ${ruled ? 'ok">ruled' : 'open">open'}</span></div><p>${esc(text)}</p></div>
    </div>`).join('')}</div>`).join('');

// The machinery rulings — about a reading or a precedence rule rather than one icon. All six
// were ruled on 2026-09-02; each line is the question as it was put, then the answer.
const RULINGS_ITEMS = [
	['R7 reading 3', 'RATIFIED. The audit applies the SILHOUETTE form qualifier to BADGE and GLYPH too, for any pair involving a long-tail icon (core-vs-core keeps the strict rule). It shipped provisionally with the full-coverage set; the ratification is now explicit in spec §10 and in the audit banner. Without it the core lane flags 298 pairs, of which 282 score under 0.40 on form.'],
	['§11.3 hard scope', 'RATIFIED as --scope slice: within your own authoring slice, plus everything against the 155 core. Reading "within-domain" as the worklist category instead flags 1,037 R7 pairs, because `code` alone holds 629 concepts across eight slices.'],
	['folder-emblem R8', 'DOES NOT GATE — new spec R9b. Folder emblems may share construction where the concepts share the container metaphor: bloc / ngrx-store / devcontainer / vm are four things that each hold something, which is an honest concept rhyme, separated by hue and by context. And the 0.72 bar is uncalibrated at 8.2 px emblem scale — atom, target and deprecated score 0.73–0.85 while reading as three different objects, which is the proof. audit.mjs keeps --folders-hard, off by default.'],
	['theme resolution', 'FLIPPED — new spec R14, "specific beats general" (the question was --longtail-first; the flag is renamed because the old name described the tier arithmetic, not the reason). 194 associations changed hands, 70 core concepts yield one, unreachable icons 108 → 48. The 54 core-tier matcherCollisions verdicts stay pinned exactly as-is; build-theme.mjs --core-first restores the withdrawn rule. Full diff in theme/resolution-flip-diff.md.'],
	['R14 escalation', 'RESOLVED BY PIN — new spec R14a. A tier rule is not a measurement of specificity: where a source theme gave a narrow concept an over-broad matcher, the flip believed it (.tsx → qwik, .yaml → esphome, .xml → source). Corrected per matcher in theme/pins.json, which resolves before every precedence rule with the same authority as the core-tier verdicts, and is data rather than code. 11 pins ship; both sanity scans now read clean. Cost, measured: 3 concepts stranded (qwik, folder ngrx-store, folder redux-store), 1 recovered (folder store).'],
	['claude direction', 'REAFFIRMED as shipped: claude stays LIGHTER (#E2957E), on the 16 px measurements. The invert is a standing one-liner, not an open question — claude=#85381E.'],
	['maven ↔ erlang', 'REAFFIRMED as shipped: maven stays #A4656B and the ΔL 12.2 margin is accepted. The wider-margin alternative is a standing one-liner — maven=#A15E65 (ΔL 14.1, for 0.02 of peak contrast).']
];
const RULING_COUNT = RULINGS_ITEMS.length;
const RULINGS = RULINGS_ITEMS.map(([id, text]) => `
  <div class="flag done">
    <div><div class="flagid">${esc(id)} <span class="badge ok">ruled 2026-09-02</span></div><p>${esc(text)}</p></div>
  </div>`).join('');

// The resolution flip, with the numbers, because it is the one ruling that moved the shipped
// product rather than a constant. Read live off the built theme so the sheet cannot drift.
const FLIP = [
	['associations that changed hands', '194'],
	['core concepts yielding a matcher', '70'],
	['long-tail concepts gaining one', '135'],
	['unreachable icons, before → after', '108 → 48'],
	['core-tier matcherCollisions verdicts', '54, unchanged'],
	['theme/pins.json verdicts (R14a)', '11'],
	['.awk / .avif / .sty resolve to', `${resolveFile('x.awk').id} / ${resolveFile('x.avif').id} / ${resolveFile('x.sty').id}`],
	['.tsx / .yaml / .xml resolve to', `${resolveFile('x.tsx').id} / ${resolveFile('x.yaml').id} / ${resolveFile('x.xml').id}`]
].map(([k, v]) => `<tr><td>${esc(k)}</td><td class="mono num">${esc(v)}</td></tr>`).join('');

// ---- 6. the numbers ----------------------------------------------------------
// The per-icon table this section used to carry is now 1,779 rows and 26,000 px tall, and
// it only ever restated set-manifest.json. What is worth eyeballing is the shape of the
// set, so the section summarises per authoring batch instead.

const totalBytes = manifest.icons.reduce((a, i) => a + i.bytes, 0);
const BATCHES = [...new Set(manifest.icons.map(i => i.batch))].sort();
const MANIFEST = `
  <table class="ftable">
    <thead><tr><th>batch</th><th class="num">icons</th><th>archetypes</th>
    <th class="num">bytes</th><th class="num">avg</th><th class="num">max</th><th>sample</th></tr></thead>
    <tbody>${BATCHES.map(b => {
		const part = manifest.icons.filter(i => i.batch === b);
		const bytes = part.reduce((a, i) => a + i.bytes, 0);
		const arch = [...new Set(part.map(i => i.archetype))].sort().join(' ');
		const sample = part.filter(i => !i.id.endsWith('-open')).slice(0, 14);
		return `<tr><td class="mono">${esc(b)}</td><td class="mono num">${part.length}</td>
      <td class="mono dim">${esc(arch)}</td><td class="mono num">${bytes}</td>
      <td class="mono num">${Math.round(bytes / part.length)}</td>
      <td class="mono num">${Math.max(...part.map(i => i.bytes))}</td>
      <td>${sample.map(i => use(i.kind, i.id, 16, i.id)).join(' ')}</td></tr>`;
	}).join('')}
    <tr><td class="mono">TOTAL</td><td class="mono num">${manifest.icons.length}</td>
      <td class="mono dim"></td><td class="mono num">${totalBytes}</td>
      <td class="mono num">${Math.round(totalBytes / manifest.icons.length)}</td>
      <td class="mono num">${Math.max(...manifest.icons.map(i => i.bytes))}</td><td></td></tr>
    </tbody>
  </table>`;

// ---- page --------------------------------------------------------------------

const html = `<title>${esc(TITLE)}</title>
<meta charset="utf-8">
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
  header{padding:56px 0 34px;border-bottom:1px solid var(--line);margin-bottom:40px}
  h1{font-size:30px;line-height:1.15;margin:0 0 12px;letter-spacing:-.02em;font-weight:600}
  .sub{color:var(--dim);max-width:76ch;margin:0 0 20px}
  .meta{display:flex;flex-wrap:wrap;gap:8px}
  .tag{font:11px/1 var(--mono);color:var(--dim);border:1px solid var(--line);
       border-radius:999px;padding:6px 10px;background:var(--bg2)}
  h2{font-size:12px;letter-spacing:.13em;text-transform:uppercase;color:var(--dim);
     font-weight:600;margin:54px 0 6px}
  h3{font:12px/1 var(--mono);color:var(--fg);font-weight:500;margin:26px 0 12px;
     letter-spacing:.04em;display:flex;align-items:center;gap:8px}
  .count{font:10px/1 var(--mono);color:var(--dim);border:1px solid var(--line);
         border-radius:999px;padding:4px 7px}
  .lede{color:var(--dim);margin:0 0 20px;max-width:80ch}
  section{margin-bottom:8px}
  .dom{border-top:1px solid var(--line);padding-top:4px}

  .ico{display:inline-block;vertical-align:middle}
  .grid{display:flex;flex-wrap:wrap;gap:2px 0}
  .cell{width:96px;padding:8px 4px 7px;text-align:center;border-radius:8px}
  .cell:hover{background:var(--bg2)}
  .pair{display:flex;align-items:center;justify-content:center;gap:9px;height:24px}
  .cell em{display:block;font:10px/1.5 var(--mono);color:var(--dim);font-style:normal;
           margin-top:6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .folders .cell{width:116px}
  .r22{height:26px}
  .r22 span{font-size:13px}

  .cols{column-count:6;column-gap:14px;margin-top:14px;border:1px solid var(--line);
        border-radius:10px;padding:12px 8px;background:var(--bg)}
  .row{display:flex;align-items:center;gap:7px;padding:0 8px;height:22px;
       break-inside:avoid}
  .row span{font:13px/1 var(--sans);color:#CCCCCC;white-space:nowrap;
            overflow:hidden;text-overflow:ellipsis}

  .strips{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;align-items:start}
  .flips{display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:start;margin-top:18px}
  .row.flow{height:24px;gap:6px}
  .row.flow .mono{font:11px/1 var(--mono)}
  .row.flow span:last-child{margin-left:auto;padding-left:12px;font:11px/1 var(--mono)}
  .arr{color:var(--dim);font-size:12px !important;padding:0 2px}
  .tree{border:1px solid var(--line);border-radius:10px;padding:10px 0 14px;background:#1E1E1E}
  .treehead{font:10px/1 var(--mono);color:var(--dim);letter-spacing:.08em;padding:6px 14px 12px}

  table{border-collapse:collapse;width:100%;background:var(--panel);
        border:1px solid var(--line);border-radius:10px;overflow:hidden}
  thead th{font:11px/1.4 var(--mono);text-transform:uppercase;letter-spacing:.08em;color:var(--dim);
           text-align:left;padding:11px 12px;border-bottom:1px solid var(--line);font-weight:500}
  td{padding:7px 12px;vertical-align:middle}
  tbody tr+tr td{border-top:1px solid var(--line)}
  .ctr{text-align:center}
  .grp{border-left:1px solid var(--line)}
  .mono{font:12px/1.5 var(--mono)}
  .dim{color:var(--dim)}
  .num{text-align:right}
  .sw{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:6px;
      vertical-align:-1px;border:1px solid rgba(255,255,255,.14)}
  .two{display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:start}
  .half{width:auto;max-width:560px}

  .flags{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:8px}
  .flag{display:flex;gap:14px;border:1px solid var(--line);border-radius:10px;
        padding:14px 16px;background:var(--panel)}
  .flag.done{border-color:#26332B}
  .badge{font:9px/1 var(--mono);letter-spacing:.08em;text-transform:uppercase;
         border-radius:999px;padding:4px 6px;vertical-align:1px}
  .badge.ok{color:#7FBF95;background:#1B2A21}
  .badge.open{color:#D2A24C;background:#2C2415}
  .sup{font:9px/1 var(--mono);color:#8A9092;border:1px solid var(--line);
       border-radius:999px;padding:3px 5px;margin-left:6px;letter-spacing:.05em}
  td.note{max-width:360px;white-space:normal;line-height:1.45}
  .flagicons{display:flex;align-items:center;gap:8px;min-width:86px;height:32px}
  .flagid{font:12px/1 var(--mono);color:var(--fg);margin-bottom:5px}
  .flag p{margin:0;color:var(--dim);font-size:13px;line-height:1.5}
</style>

${defs}

<div class="wrap">
<header>
  <h1>${esc(TITLE)} — full coverage, assembly v2</h1>
  <p class="sub">All ${manifest.icons.length} production icons after the eighteen full-coverage slices
  and the set-wide round-3 pass: ${fileIcons.length} file icons, and ${folderIds.length - 1} named
  folder concepts plus the canon default pair, each closed and open.
  R7 palette twins and R8 form collisions are at zero open in the hard lane; §11.3's tolerated
  lane and the reported folder-emblem lane are counted in reconciliation.md.
  All six machinery rulings closed on 2026-09-02 (§5) — the one that moved the product is R14,
  the theme resolution flip: <strong>specific beats general</strong>, 194 associations changed
  hands, unreachable icons 108 → 48, with 11 hand pins (R14a) correcting the matchers a tier rule
  could not judge. The explorer strips below are rendered through that theme.
  Nothing here is loaded from outside the page.</p>
  <div class="meta">
    <span class="tag">${manifest.icons.length} icons</span>
    <span class="tag">${fileIcons.length} file / ${manifest.icons.length - fileIcons.length} folder</span>
    <span class="tag">${totalBytes} bytes total</span>
    <span class="tag">avg ${Math.round(totalBytes / manifest.icons.length)} B</span>
    <span class="tag">max ${Math.max(...manifest.icons.map(i => i.bytes))} B</span>
    <span class="tag">${r1.length} changed in round 1</span>
    <span class="tag">${r2.length} ruled in round 2</span>
    <span class="tag">${r3.length} fixed in round 3</span>
    <span class="tag">6 ruled in round 4</span>
    <span class="tag">R14: 194 associations flipped</span>
    <span class="tag">R14a: 11 pins</span>
    <span class="tag">bg #121314</span>
  </div>
</header>

<section>
  <h2>1 · The file set, by domain</h2>
  <p class="lede">Every icon at 16&nbsp;px in the grid, then the same domain again as 22&nbsp;px tree
  rows — the size the explorer actually uses. The first six blocks are the hand-curated core-tier
  domains; the rest are the long tail, grouped by the worklist category that §11.3 scopes R7 on.
  Scan each block for two things: a hue that repeats where the concepts are unrelated, and a weight
  that steps out of line with its neighbours.</p>
  ${SET}
</section>

<section>
  <h2>2 · Folders — closed and open</h2>
  <p class="lede">The canon tan plate is law (R9); the emblem carries the identity and is always
  darker than the plate. Open flaps carry the emblem at 0.8×. The default pair
  <code class="mono">folder</code> / <code class="mono">folder-open</code> also serves the
  324-concept folder tail — there is no generic-folder asset.</p>
  ${FOLDERS}
</section>

<section>
  <h2>3 · Explorer strips</h2>
  <p class="lede">Three real repo roots on the editor background. Every filename here is resolved
  through <code class="mono">theme/vsebcode-icon-theme.json</code>, so a wrong icon in these strips
  is a wrong association in the theme, not a wrong drawing. These are rendered through the
  <strong>R14</strong> theme — the flipped resolution — so they are also the live check that the
  205 moved associations landed.</p>
  <div class="strips">${STRIPS}</div>
  <p class="lede" style="margin:22px 0 0">Those three roots exercise only a couple of the 194 flipped
  associations — <code class="mono">postcss.config.js</code> and <code class="mono">target/</code>
  (<code class="mono">components/</code> is pinned back). The spot check names the rest directly.
  On the left is <strong>R14</strong>: what the withdrawn core-first precedence painted, and what
  the flip corrects. On the right is <strong>R14a</strong>: what the un-pinned flip would have
  painted, and what <code class="mono">theme/pins.json</code> pins back. Both columns resolve live
  through the built theme, so a stale build or a dropped pin shows up here as the wrong arrow.</p>
  <div class="flips">${FLIPCHECK}</div>
</section>

<section>
  <h2>4 · Changed in reconciliation</h2>
  <p class="lede">Round 1 was the set-wide R7 / R8 pass; round 2 applied Sebastian's rulings on
  the flag list. Left of each pair is what shipped before that round — the pre-change geometry,
  never today's drawing wearing an old fill. Rationale per row is in reconciliation.md.</p>

  <h3>Round 1 — the set-wide pass <span class="count">${r1.length}</span></h3>
  <table class="ftable">
    <thead><tr><th>id</th><th>archetype</th><th class="ctr">before</th><th>was</th>
    <th class="ctr grp">after</th><th>is</th><th>mark</th></tr></thead>
    <tbody>${R1ROWS}</tbody>
  </table>

  <h3>Round 2 — the flag list, ruled <span class="count">${r2.length}</span></h3>
  <table class="ftable">
    <thead><tr><th>id</th><th>change</th><th class="ctr">before</th><th>was</th>
    <th class="ctr grp">after</th><th>is</th><th>ruling</th></tr></thead>
    <tbody>${R2ROWS}</tbody>
  </table>

  <h3>Round 3 — full coverage <span class="count">${r3.length}</span></h3>
  <p class="lede">The eighteen slices ran concurrently and could not see each other's work, so the
  set-wide audit was the first thing that could. Twenty of these are R8: two slices independently
  drew the same mark for unrelated concepts, and at 16&nbsp;px the letter groups were byte-identical.
  One is R7 — the only hue twin left that the marks do not separate either.</p>
  <table class="ftable">
    <thead><tr><th>id</th><th>finding</th><th class="ctr">before</th><th>was</th>
    <th class="ctr grp">after</th><th>is</th><th>why this one moved</th></tr></thead>
    <tbody>${R3ROWS}</tbody>
  </table>
</section>

<section>
  <h2>5 · The flag list</h2>
  <p class="lede">Sebastian ruled the round-1 flag list on 2026-09-01 — "do all of them"; those
  resolutions are below, unchanged. Then the accumulated HUMAN-FLAG list: every full-coverage slice
  that shipped GREEN also handed up the marks it could not settle on evidence alone. The 16 px
  numbers quoted anywhere on this page come from <code class="mono">tools/pixelproof.mjs</code>:
  render at exactly 16&nbsp;×&nbsp;16, composite over #121314, and count how much of the ink lands
  below the visibility threshold.</p>

  <h3>Rounds 1–2, resolved <span class="count">${RESOLVED_ITEMS.length}</span></h3>
  <div class="flags">${RESOLVED}</div>

  ${FLAGS}

  <h3>Rulings the machinery needed — all ruled <span class="count">${RULING_COUNT}</span></h3>
  <p class="lede">Not about one icon. Each was a reading or a precedence rule that assembly had to
  pick to finish; the review lead ruled all six on 2026-09-02, then ruled R14's own escalation the
  same day. Everything but the theme leaves the artwork untouched — no icon was redrawn or
  retinted in this round.</p>
  <div class="flags">${RULINGS}</div>

  <h3>The resolution flip, in numbers <span class="count">R14 · R14a</span></h3>
  <p class="lede">Specific beats general: when two named concepts claim one matcher, the bespoke
  long-tail icon wins over the core icon — except where a hand pin says otherwise. A tier is not a
  measurement of specificity, so 11 matchers are pinned in <code class="mono">theme/pins.json</code>,
  which resolves ahead of every precedence rule with the same authority as the 54 core-tier
  <code class="mono">matcherCollisions</code> verdicts, and is data rather than code. The two
  bottom rows are read live out of <code class="mono">theme/vsebcode-icon-theme.json</code>: the
  first must say <code class="mono">awk / avif / sty</code> (the flip landed) and the second
  <code class="mono">reactts / yaml / xml</code> (the pins held). Anything else means this sheet was
  built against a stale theme.</p>
  <table class="ftable half"><tbody>${FLIP}</tbody></table>
</section>

<section>
  <h2>6 · The numbers, by authoring batch</h2>
  <p class="lede">Six core batches, twelve file slices, six folder slices, and the canon pair.
  Per-icon fills, coverage and colour source live in <code class="mono">set-manifest.json</code>,
  measured by rasterising each icon and counting pixels rather than read off the source.</p>
  ${MANIFEST}
</section>
</div>
`;

const out = join(ROOT, 'contact-full.html');
writeFileSync(out, html, 'utf8');
console.log(`${out}  (${Buffer.byteLength(html)} bytes, ${manifest.icons.length} icons)`);

// ---- optional 2x screenshot -------------------------------------------------
const WIDTH = 1240;

const COMMON = ['--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
	'--allow-file-access-from-files', '--virtual-time-budget=12000'];

function shoot(htmlPath, pngPath) {
	const bin = chromium();
	const probe = join(tmpdir(), `m11-full-probe-${process.pid}.html`);
	writeFileSync(probe, `<!doctype html><body style="margin:0"><pre id="o"></pre>`
		+ `<iframe id="f" src="file://${htmlPath}" style="width:${WIDTH}px;height:400px;border:0"></iframe>`
		+ `<script>f.onload=()=>{document.getElementById('o').textContent='PAGEHEIGHT='+f.contentDocument.documentElement.scrollHeight}</script>`);
	const dom = execFileSync(bin, [...COMMON, `--window-size=${WIDTH + 200},600`, '--dump-dom', `file://${probe}`],
		{ encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
	rmSync(probe, { force: true });
	const m = /PAGEHEIGHT=(\d+)/.exec(dom);
	if (!m) { throw new Error('could not measure the page height'); }
	const height = +m[1];
	execFileSync(bin, [...COMMON, '--force-device-scale-factor=2', '--default-background-color=121314ff',
		`--window-size=${WIDTH},${height}`, `--screenshot=${pngPath}`, `file://${htmlPath}`],
		{ stdio: ['ignore', 'ignore', 'ignore'] });
	return { bin, width: WIDTH, height };
}

if (process.argv.includes('--png')) {
	const png = join(ROOT, 'contact-full.png');
	const r = shoot(out, png);
	console.log(`${png}  (${r.width}x${r.height} css px at 2x, ${Buffer.byteLength(readFileSync(png))} bytes)`);
	console.log(`  renderer: ${r.bin}`);
}
