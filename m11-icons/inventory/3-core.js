#!/usr/bin/env node
/**
 * M11 icon inventory — step 3: curate the core tier and emit the final
 * merged-inventory.json (with generic-<category> fallbacks on everything the
 * core tier does not cover).
 *
 * Selection rule, applied by hand over the merged list:
 *   every concept present in >= 2 sources that is plausibly common in 2026
 *   web/systems development, UNION Sebastian's own stack must-haves.
 * Order in the arrays below IS the rank (1 = draw first).
 *
 * Outputs: core-tier.json, merged-inventory.json
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const merged = require('./merged-index.json');

// Ids that come in from Sebastian's actual stack rather than from source
// overlap — some of these are single-source concepts and are kept anyway.
const MUST_HAVE = new Set([
  'typescript', 'reactts', 'js', 'reactjs', 'json', 'json5', 'markdown', 'css', 'sass',
  'html', 'rust', 'toml', 'yaml', 'docker', 'dotenv', 'prisma', 'next', 'node', 'npm',
  'lock', 'git', 'shell', 'sql', 'svg', 'image', 'font', 'pdf', 'xml', 'python', 'go',
  'swift', 'c', 'cpp', 'java', 'vue', 'license', 'readme', 'editorconfig', 'eslint',
  'prettier', 'tsconfig', 'vite', 'tailwind',
  'folder:src', 'folder:node', 'folder:dist', 'folder:test', 'folder:docs',
  'folder:assets', 'folder:images', 'folder:components', 'folder:config', 'folder:git',
  'folder:github', 'folder:vscode', 'folder:public', 'folder:scripts', 'folder:types',
  'folder:hooks', 'folder:utils', 'folder:library', 'folder:api', 'folder:styles',
  'folder:app', 'folder:view', 'folder:server', 'folder:db',
]);

/** ~140 file concepts, ranked. */
const CORE_FILES = [
  // 1-43 — the daily stack
  'typescript', 'reactts', 'js', 'reactjs', 'json', 'markdown', 'css', 'sass', 'html',
  'rust', 'toml', 'yaml', 'docker', 'dotenv', 'prisma', 'next', 'node', 'npm', 'lock',
  'git', 'shell', 'sql', 'svg', 'image', 'font', 'pdf', 'xml', 'python', 'go', 'swift',
  'c', 'cpp', 'java', 'vue', 'license', 'readme', 'editorconfig', 'eslint', 'prettier',
  'tsconfig', 'vite', 'tailwind', 'text',

  // 44-65 — the rest of the mainstream language set
  'csharp', 'php', 'ruby', 'kotlin', 'dartlang', 'elixir', 'haskell', 'scala', 'lua',
  'perl', 'r', 'julia', 'zig', 'nim', 'ocaml', 'clojure', 'erlang', 'fsharp',
  'objectivec', 'assembly', 'solidity', 'wasm', 'cheader', 'cppheader',

  // 66-81 — data, docs and binary buckets
  'graphql', 'protobuf', 'json5', 'sqlite', 'excel', 'word', 'powerpoint', 'mdx',
  'asciidoc', 'tex', 'audio', 'video', 'zip', 'binary', 'exe', 'key', 'cert',

  // 82-92 — build systems and platform config
  'powershell', 'makefile', 'cmake', 'gradle', 'maven', 'config', 'log', 'diff',
  'typescriptdef', 'jsconfig', 'class', 'nginx',

  // 93-112 — JS/TS ecosystem tooling
  'yarn', 'pnpm', 'bun', 'deno', 'webpack', 'rollup', 'esbuild', 'babel', 'biome',
  'turborepo', 'nx', 'vitest', 'jest', 'cypress', 'playwright', 'storybook', 'testjs',
  'testts', 'stylelint', 'postcss',

  // 113-121 — frameworks
  'svelte', 'angular', 'astro', 'nuxt', 'nestjs', 'django', 'expo', 'tauri', 'jupyter',

  // 122-133 — infra, CI and services
  'terraform', 'helm', 'github-actions-workflow', 'gitlab', 'jenkins', 'vercel',
  'netlify', 'firebase', 'supabase', 'http', 'swagger', 'mermaid',

  // 134-141 — the 2026 AI/editor layer + housekeeping
  'claude', 'copilot', 'agents', 'cursor', 'vscode', 'favicon', 'todo', 'codeowners',
];

/** ~40 folder concepts, ranked. */
const CORE_FOLDERS = [
  'src', 'node', 'dist', 'test', 'docs', 'assets', 'images', 'components', 'config',
  'git', 'github', 'vscode', 'public', 'scripts', 'types', 'hooks', 'utils', 'library',
  'api', 'styles', 'app', 'view', 'server', 'db',
  'route', 'layout', 'model', 'middleware', 'services', 'next', 'docker', 'coverage',
  'i18n', 'fonts', 'template', 'theme', 'log', 'temp', 'mock', 'package',
];

// ---------------------------------------------------------------------------

const byKey = new Map(merged.map((c) => [`${c.kind}|${c.id}`, c]));

const missing = [];
const build = (ids, kind) =>
  ids
    .map((id, i) => {
      const c = byKey.get(`${kind}|${id}`);
      if (!c) {
        missing.push(`${kind}:${id}`);
        return null;
      }
      const mustHave = MUST_HAVE.has(kind === 'folder' ? `folder:${id}` : id);
      const entry = {
        rank: i + 1,
        id: c.id,
        kind: c.kind,
        label: c.label,
        category: c.category,
        sources: c.sources,
        selectedBy: mustHave
          ? c.sources.length >= 2
            ? 'must-have + multi-source'
            : 'must-have'
          : 'multi-source',
        match: c.match,
      };
      if (c.brandColor) entry.brandColor = c.brandColor;
      return entry;
    })
    .filter(Boolean);

const coreFiles = build(CORE_FILES, 'file');
const coreFolders = build(CORE_FOLDERS, 'folder');

if (missing.length) {
  console.log(`WARNING — core ids absent from merged inventory: ${missing.join(', ')}`);
}

// --- matcher collisions inside the core tier -------------------------------
// The merged matchers are the union of three themes that disagree, so the same
// extension can land on two core concepts. Default resolution is "lowest rank
// wins", which is right for the generic-vs-generic cases but wrong wherever a
// specific concept collides with a broader one — those are pinned by hand here.
const MATCH_OVERRIDE = {
  'lang:typescriptreact': 'reactts',
  'ext:jsx': 'reactjs',
  'lang:javascriptreact': 'reactjs',
  'ext:json5': 'json5',
  'lang:json5': 'json5',
  'name:jsconfig.json': 'jsconfig',
  'name:tsconfig.json': 'tsconfig',
  'ext:pcss': 'postcss',
  'ext:postcss': 'postcss',
  'ext:sass': 'sass',
  'ext:scss': 'sass',
  'name:package.json': 'npm',
  'name:package-lock.json': 'npm',
  'lang:diff': 'diff',
  'ext:db': 'sqlite',
  'ext:db3': 'sqlite',
  'ext:sqlite': 'sqlite',
  'ext:sqlite3': 'sqlite',
  'ext:pdb': 'binary',
  'ext:enc': 'binary',
  'ext:csv': 'excel',
  'ext:tsv': 'excel',
  'lang:csv': 'excel',
  'lang:tsv': 'excel',
  'ext:exe': 'exe',
  'dir:utils': 'utils',
  'dir:mocks': 'mock',
  'dir:__mocks__': 'mock',
  'dir:.github': 'github',
  'dir:layout': 'layout',
  'dir:layouts': 'layout',
  'dir:_layout': 'layout',
  'dir:_layouts': 'layout',
};

const collisions = [];
for (const kind of ['file', 'folder']) {
  const list = kind === 'file' ? coreFiles : coreFolders;
  const owners = new Map();
  for (const c of list) {
    const keys = [
      ...c.match.extensions.map((x) => `ext:${x}`),
      ...c.match.filenames.map((x) => `name:${x}`),
      ...c.match.languageIds.map((x) => `lang:${x}`),
      ...c.match.folderNames.map((x) => `dir:${x}`),
    ];
    for (const k of keys) {
      if (!owners.has(k)) owners.set(k, []);
      owners.get(k).push(c);
    }
  }
  for (const [k, list2] of owners) {
    if (list2.length > 1) {
      const sorted = [...list2].sort((a, b) => a.rank - b.rank);
      const pinned = MATCH_OVERRIDE[k];
      const winner = pinned && sorted.some((c) => c.id === pinned) ? pinned : sorted[0].id;
      collisions.push({
        matcher: k,
        kind,
        winner,
        resolvedBy: pinned ? 'hand-pinned' : 'rank',
        losers: sorted.map((c) => c.id).filter((id) => id !== winner),
      });
    }
  }
}

fs.writeFileSync(
  path.join(__dirname, 'core-tier.json'),
  `${JSON.stringify(
    {
      note:
        'Curated core tier for the VSebCode default file-icon theme. Rank is draw ' +
        'order; matcherCollisions lists matchers claimed by more than one core ' +
        'concept (lowest rank wins).',
      selectionRule:
        'every concept in >=2 upstream themes that is plausibly common in 2026 ' +
        'web/systems development, UNION the must-haves from Sebastian stack',
      counts: { file: coreFiles.length, folder: coreFolders.length },
      files: coreFiles,
      folders: coreFolders,
      matcherCollisions: collisions,
    },
    null,
    2
  )}\n`
);

// --- final merged inventory -------------------------------------------------

const coreIds = new Set([
  ...coreFiles.map((c) => `file|${c.id}`),
  ...coreFolders.map((c) => `folder|${c.id}`),
]);

const inventory = merged.map((c) => {
  const entry = {
    id: c.id,
    kind: c.kind,
    label: c.label,
    match: c.match,
    sources: c.sources,
  };
  if (c.brandColor) entry.brandColor = c.brandColor;
  entry.category = c.category;
  if (coreIds.has(`${c.kind}|${c.id}`)) {
    entry.core = true;
  } else {
    entry.fallback = `generic-${c.category}`;
  }
  if (c.iconPackOnly) entry.iconPackOnly = true;
  return entry;
});

fs.writeFileSync(
  path.join(__dirname, 'merged-inventory.json'),
  `${JSON.stringify(inventory, null, 2)}\n`
);

console.log(`core tier: ${coreFiles.length} file + ${coreFolders.length} folder`);
console.log(`matcher collisions inside core tier: ${collisions.length}`);
console.log(`merged-inventory.json: ${inventory.length} concepts`);
console.log(
  `  with fallback annotation: ${inventory.filter((c) => c.fallback).length}`
);
