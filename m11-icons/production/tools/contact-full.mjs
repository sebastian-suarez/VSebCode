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

import { readFileSync, writeFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { homedir, tmpdir } from 'node:os';

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
    <span class="pair">${use('file', id, 16, `${id} 16px`)}${use('file', id, 22, `${id} 22px`)}</span>
    <em>${esc(id)}</em></span>`).join('')}</div>
  <div class="cols">${ids.map(id => row('file', id, id)).join('')}</div>
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

// ---- 5. the flag list, resolved ----------------------------------------------

const RESOLVED = [
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
].map(([id, text]) => `
  <div class="flag done">
    <div class="flagicons">${use('file', id, 16)}${use('file', id, 22)}${use('file', id, 32)}</div>
    <div><div class="flagid">${esc(id)} <span class="badge ok">resolved</span></div><p>${esc(text)}</p></div>
  </div>`).join('');

const OPEN_ITEMS = [
	['swagger', 'Does the ring read at 16 px, or does the disc swallow it?'],
	['css', 'css and html share the canon shield exactly (form 1.00). Accepted as an R8 residual because both real logos are shields — sanction it, or redraw one?']
];
const OPEN = OPEN_ITEMS.map(([id, text]) => `
  <div class="flag">
    <div class="flagicons">${use('file', id, 16)}${use('file', id, 22)}${use('file', id, 32)}</div>
    <div><div class="flagid">${esc(id)} <span class="badge open">open</span></div><p>${esc(text)}</p></div>
  </div>`).join('');

// ---- 6. manifest -------------------------------------------------------------

const totalBytes = manifest.icons.reduce((a, i) => a + i.bytes, 0);
const mrow = (i) => `
  <tr>
    <td class="ctr">${use(i.kind, i.id, 16)}</td>
    <td class="mono">${esc(i.id)}</td>
    <td class="mono dim">${i.archetype}</td>
    <td class="mono">${i.fills.map(f => f.startsWith('#')
		? `<span class="sw" style="background:${f}"></span>` : '').join('')}${esc(i.fills.join(' '))}</td>
    <td class="mono num">${i.bytes}</td>
    <td class="mono dim">${esc(i.batch)}</td>
  </tr>`;
const half = Math.ceil(manifest.icons.length / 2);
const MANIFEST = [manifest.icons.slice(0, half), manifest.icons.slice(half)].map(part => `
  <table class="ftable">
    <thead><tr><th></th><th>id</th><th>archetype</th><th>fills</th><th class="num">bytes</th><th>batch</th></tr></thead>
    <tbody>${part.map(mrow).join('')}</tbody>
  </table>`).join('');

// ---- page --------------------------------------------------------------------

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
  .cell{width:118px;padding:10px 4px 9px;text-align:center;border-radius:8px}
  .cell:hover{background:var(--bg2)}
  .pair{display:flex;align-items:center;justify-content:center;gap:9px;height:24px}
  .cell em{display:block;font:10px/1.5 var(--mono);color:var(--dim);font-style:normal;
           margin-top:6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .folders .cell{width:132px}

  .cols{column-count:5;column-gap:18px;margin-top:16px;border:1px solid var(--line);
        border-radius:10px;padding:12px 8px;background:var(--bg)}
  .row{display:flex;align-items:center;gap:7px;padding:0 8px;height:22px;
       break-inside:avoid}
  .row span{font:13px/1 var(--sans);color:#CCCCCC;white-space:nowrap;
            overflow:hidden;text-overflow:ellipsis}

  .strips{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;align-items:start}
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
  <h1>${esc(TITLE)} — assembly checkpoint</h1>
  <p class="sub">All ${manifest.icons.length} production icons after the set-wide reconciliation:
  ${fileIcons.length} file icons, and ${folderIds.length - 1} named folder concepts plus the canon
  default pair, each closed and open.
  Palette twins (R7) and form collisions (R8) are clean; see reconciliation.md for what moved
  and for the accepted residuals. Nothing here is loaded from outside the page.</p>
  <div class="meta">
    <span class="tag">${manifest.icons.length} icons</span>
    <span class="tag">${fileIcons.length} file / ${manifest.icons.length - fileIcons.length} folder</span>
    <span class="tag">${totalBytes} bytes total</span>
    <span class="tag">avg ${Math.round(totalBytes / manifest.icons.length)} B</span>
    <span class="tag">max ${Math.max(...manifest.icons.map(i => i.bytes))} B</span>
    <span class="tag">${r1.length} changed in round 1</span>
    <span class="tag">${r2.length} ruled in round 2</span>
    <span class="tag">bg #121314</span>
  </div>
</header>

<section>
  <h2>1 · The file set, by domain</h2>
  <p class="lede">Each icon at 16&nbsp;px and 22&nbsp;px, then the same domain as 22&nbsp;px tree rows —
  the size the explorer actually uses. Scan each block for two things: a hue that repeats where the
  concepts are unrelated, and a weight that steps out of line with its neighbours.</p>
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
  is a wrong association in the theme, not a wrong drawing.</p>
  <div class="strips">${STRIPS}</div>
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
</section>

<section>
  <h2>5 · The flag list</h2>
  <p class="lede">Sebastian ruled the round-1 flag list on 2026-09-01 — "do all of them".
  Resolutions first, then what is still open. The 16 px numbers quoted here come from
  <code class="mono">tools/pixelproof.mjs</code>: render at exactly 16&nbsp;×&nbsp;16, composite over
  #121314, and count how much of the ink lands below the visibility threshold.</p>
  <div class="flags">${RESOLVED}</div>
  <h3>Still open <span class="count">${OPEN_ITEMS.length}</span></h3>
  <div class="flags">${OPEN}</div>
</section>

<section>
  <h2>6 · Manifest</h2>
  <p class="lede">Every asset on disk, with the fills it actually paints (measured by rasterising
  each icon and counting pixels, not read off the source).</p>
  <div class="two">${MANIFEST}</div>
</section>
</div>
`;

const out = join(ROOT, 'contact-full.html');
writeFileSync(out, html, 'utf8');
console.log(`${out}  (${Buffer.byteLength(html)} bytes, ${manifest.icons.length} icons)`);

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
