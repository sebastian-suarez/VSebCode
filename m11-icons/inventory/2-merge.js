#!/usr/bin/env node
/**
 * M11 icon inventory — step 2: normalise, dedupe and merge the raw records
 * from raw.json into one concept list.
 *
 * Naming rule: canonical ids are kebab-case and follow vscode-icons' concept
 * naming when the three sources disagree, with a short explicit override list
 * (OVERRIDE_NAMING) where the vscode-icons id is cryptic or where Sebastian's
 * own vocabulary is the plural form.
 *
 * Output: merged-inventory.json (+ merged-index.json for the later steps)
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const raw = require('./raw.json');

// ---------------------------------------------------------------------------
// Normalisation
// ---------------------------------------------------------------------------

const normId = (e) => {
  let id = e.rawId.toLowerCase();
  if (e.kind === 'folder') id = id.replace(/^folder[-_]/, '');
  return id.replace(/[_\s]+/g, '-');
};

/**
 * Cross-source aliases: `<source>:<kind>:<normalised id>` -> canonical id.
 * Every entry here was confirmed by shared distinctive matchers (see
 * alias-candidates.txt, produced during the survey pass).
 */
const ALIAS = {
  // --- languages / core file types -----------------------------------------
  'material:file:javascript': 'js',
  'greaticons:file:javascript': 'js',
  'material:file:react': 'reactjs',
  'greaticons:file:react': 'reactjs',
  'material:file:react-ts': 'reactts',
  'greaticons:file:react-alt': 'reactts',
  'material:file:console': 'shell',
  'material:file:h': 'cheader',
  'greaticons:file:c-h': 'cheader',
  'material:file:hpp': 'cppheader',
  'greaticons:file:cpp-h': 'cppheader',
  'material:file:objective-c': 'objectivec',
  'material:file:objective-cpp': 'objectivecpp',
  'material:file:coffee': 'coffeescript',
  'material:file:dart': 'dartlang',
  'greaticons:file:dart': 'dartlang',
  'material:file:dart-generated': 'dartlang-generated',
  'material:file:d': 'dlang',
  'greaticons:file:d': 'dlang',
  'material:file:javaclass': 'class',
  'greaticons:file:java-alt': 'class',
  'greaticons:file:matlab-alt': 'matlab',
  'greaticons:file:rlang': 'r',
  'greaticons:file:pylite': 'python',
  'greaticons:file:jade': 'pug',
  'greaticons:file:rst': 'rest',
  'material:file:webassembly': 'wasm',
  'greaticons:file:webassembly': 'wasm',
  'material:file:wolframlanguage': 'wolfram',
  'material:file:apiblueprint': 'apib',
  'material:file:typescript-def': 'typescriptdef',
  'material:file:javascript-map': 'jsmap',
  'material:file:css-map': 'cssmap',
  'material:file:pascal': 'pascal',
  'vsicons:file:delphi': 'pascal',
  'greaticons:file:visualbasic': 'vb',
  'material:file:coldfusion': 'cf',
  'greaticons:file:coldfusion': 'cf',
  'greaticons:file:verilog-sys': 'systemverilog',
  'greaticons:file:opengl': 'glsl',
  'material:file:proto': 'protobuf',
  'greaticons:file:proto': 'protobuf',
  'material:file:robot': 'robotframework',
  'material:file:opa': 'rego',
  'material:file:pinejs': 'pine',
  'material:file:grafana-alloy': 'alloy',
  'material:file:apps-script': 'appscript',
  'material:file:denizenscript': 'denizenscript',
  'greaticons:file:denizen': 'denizenscript',
  'greaticons:file:dust': 'dustjs',
  'greaticons:file:gherkin': 'cucumber',
  'greaticons:file:flowtyped': 'flow',
  'greaticons:file:jenkinsfile': 'jenkins',
  'greaticons:file:snowpackjs': 'snowpack',
  'greaticons:file:nsis': 'nsi',
  'greaticons:file:rstudio': 'rproj',
  'material:file:salt': 'saltstack',
  'material:file:regedit': 'registry',
  'material:file:hosts': 'host',
  'material:file:agent': 'agents',
  'material:file:uml': 'plantuml',
  'greaticons:file:plantuml': 'plantuml',

  // --- generic buckets ------------------------------------------------------
  'material:file:document': 'text',
  'greaticons:file:notepad': 'text',
  'material:file:table': 'excel',
  'material:file:dll': 'binary',
  'material:file:adobe-illustrator': 'ai',
  'greaticons:file:illustrator': 'ai',
  'material:file:adobe-photoshop': 'photoshop',
  'material:file:tune': 'dotenv',
  'material:file:certificate': 'cert',
  'greaticons:file:certificate': 'cert',
  'material:file:database': 'sql',
  'greaticons:file:database': 'sql',
  'greaticons:file:database2': 'sqlite',
  'material:file:gemfile': 'bundler',
  'material:file:nodejs': 'node',
  'material:file:nodejs-alt': 'node',
  'greaticons:file:settings': 'config',
  'material:file:settings': 'config',
  'vsicons:file:gnu': 'makefile',
  'greaticons:file:settings-red': 'makefile',
  'greaticons:file:visualstudiocode': 'vscode',

  // --- tooling / config -----------------------------------------------------
  'material:file:lintstaged': 'lintstagedrc',
  'material:file:nano-staged': 'nanostaged',
  'material:file:nest': 'nestjs',
  'material:file:php-cs-fixer': 'phpcsfixer',
  'material:file:vue-config': 'vueconfig',
  'material:file:browserlist': 'browserslist',
  'greaticons:file:browserlist': 'browserslist',
  'material:file:semantic-release': 'semanticrelease',
  'material:file:pre-commit': 'precommit',
  'material:file:code-climate': 'codeclimate',
  'material:file:coderabbit-ai': 'coderabbit',
  'material:file:gemini-ai': 'gemini',
  'material:file:watchman': 'watchmanconfig',
  'material:file:buck': 'buckbuild',
  'material:file:gcp': 'gcloud',
  'material:file:istanbul': 'nyc',
  'material:file:windicss': 'windi',
  'material:file:tailwindcss': 'tailwind',
  'material:file:azure-pipelines': 'azurepipelines',
  'vsicons:file:turbo': 'turborepo',
  'greaticons:file:nextjs': 'next',
  'greaticons:file:vitejs': 'vite',
  'material:file:test-js': 'testjs',
  'material:file:test-ts': 'testts',
  'greaticons:file:testsjs': 'testjs',
  'greaticons:file:tests': 'testts',
  'material:file:go-mod': 'go-package',
  'greaticons:file:godotconfig': 'godot',
  'greaticons:file:godottres': 'tres',
  'greaticons:file:godottscn': 'tscn',
  'greaticons:file:godotuid': 'gduid',

  // --- folders --------------------------------------------------------------
  'material:folder:command': 'cli',
  'material:folder:lib': 'library',
  'material:folder:packages': 'package',
  'material:folder:database': 'db',
  'material:folder:class': 'model',
  'material:folder:font': 'fonts',
  'material:folder:typescript': 'types',
  'vsicons:folder:typings': 'types',
  'material:folder:hook': 'hooks',
  'vsicons:folder:hook': 'hooks',
  'material:folder:components': 'components',
  'vsicons:folder:component': 'components',
  'material:folder:css': 'styles',
  'vsicons:folder:style': 'styles',
  'material:folder:resource': 'assets',
  'vsicons:folder:asset': 'assets',
  'material:folder:scripts': 'scripts',
  'vsicons:folder:script': 'scripts',
  'material:folder:utils': 'utils',
  'vsicons:folder:tools': 'utils',
  'vsicons:folder:locale': 'i18n',
  'material:folder:views': 'view',
  'greaticons:folder:views': 'view',
  'material:folder:routes': 'route',
  'material:folder:benchmark': 'benchmark',
  'greaticons:folder:bench': 'benchmark',
  'material:folder:backup': 'backup',
  'greaticons:folder:save': 'backup',
  'greaticons:folder:build': 'dist',
  'greaticons:folder:tests': 'test',
  'greaticons:folder:conf': 'config',
  'greaticons:folder:db': 'db',
  'material:folder:turborepo': 'turborepo',
  'vsicons:folder:turbo': 'turborepo',
  'material:folder:azure-pipelines': 'azurepipelines',
};

/**
 * Ids where we knowingly do NOT follow vscode-icons' name — either because it
 * is cryptic (`gnu` for Makefiles) or because Sebastian's own vocabulary uses
 * the plural. Kept explicit so the deviation is auditable.
 */
const OVERRIDE_NAMING = [
  'makefile', 'pascal', 'scripts', 'components', 'styles', 'assets',
  'utils', 'types', 'hooks', 'i18n', 'turborepo',
];

const canonical = (e) => {
  const id = normId(e);
  return ALIAS[`${e.source}:${e.kind}:${id}`] ?? id;
};

// ---------------------------------------------------------------------------
// Merge
// ---------------------------------------------------------------------------

const concepts = new Map();

for (const e of raw) {
  const id = canonical(e);
  const key = `${e.kind}|${id}`;
  if (!concepts.has(key)) {
    concepts.set(key, {
      id,
      kind: e.kind,
      extensions: new Set(),
      filenames: new Set(),
      languageIds: new Set(),
      folderNames: new Set(),
      sources: new Set(),
      packOnly: true,
    });
  }
  const c = concepts.get(key);
  c.sources.add(e.source);
  for (const x of e.extensions) c.extensions.add(x.toLowerCase());
  for (const x of e.filenames) c.filenames.add(x.toLowerCase());
  for (const x of e.languageIds) c.languageIds.add(x.toLowerCase());
  for (const x of e.folderNames) c.folderNames.add(x.toLowerCase());
  // A concept only counts as icon-pack-gated if every contributing record is.
  if (!e.pack) c.packOnly = false;
}

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

const LABELS = require('./labels.json');

const titleCase = (id) =>
  id
    .split('-')
    .map((w) => (w.length <= 2 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)))
    .join(' ');

const labelFor = (c) => LABELS[`${c.kind}:${c.id}`] ?? LABELS[c.id] ?? titleCase(c.id);

// ---------------------------------------------------------------------------
// Fallback categories
// ---------------------------------------------------------------------------

const EXT_CATEGORY = {
  image: ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'ico', 'webp', 'avif', 'tiff', 'tif', 'svg',
    'psd', 'ai', 'eps', 'heic', 'heif', 'raw', 'cr2', 'nef', 'xcf', 'kra', 'sketch', 'fig',
    'afphoto', 'afdesign', 'jxl', 'apng', 'ase', 'aseprite'],
  font: ['ttf', 'otf', 'woff', 'woff2', 'eot', 'fnt', 'fon', 'pfb', 'sfd', 'ttc', 'glyphs'],
  media: ['mp3', 'wav', 'flac', 'ogg', 'aac', 'm4a', 'wma', 'aiff', 'mid', 'midi',
    'mp4', 'mkv', 'avi', 'mov', 'wmv', 'webm', 'flv', 'm4v', 'mpg', 'mpeg', '3gp',
    'srt', 'vtt', 'ass', 'sub'],
  archive: ['zip', 'tar', 'gz', 'bz2', 'xz', 'rar', '7z', 'tgz', 'zst', 'lz', 'lzma',
    'jar', 'war', 'ear', 'iso', 'dmg', 'pkg', 'deb', 'rpm', 'apk', 'aab', 'whl', 'crx',
    'nupkg', 'vsix', 'xpi'],
  binary: ['exe', 'dll', 'so', 'dylib', 'bin', 'o', 'a', 'lib', 'obj', 'class', 'pyc',
    'wasm', 'elf', 'msi', 'app', 'com', 'sys', 'ko', 'node', 'hex', 'img', 'safetensors',
    'onnx', 'pt', 'pth', 'ilk', 'pdb'],
  doc: ['md', 'markdown', 'mdx', 'txt', 'rtf', 'pdf', 'doc', 'docx', 'odt', 'epub',
    'rst', 'adoc', 'asciidoc', 'tex', 'org', 'textile', 'pages', 'chm', 'djvu'],
  data: ['json', 'json5', 'jsonc', 'jsonl', 'ndjson', 'csv', 'tsv', 'xls', 'xlsx', 'xlsm',
    'ods', 'sql', 'db', 'sqlite', 'sqlite3', 'db3', 'mdb', 'accdb', 'parquet', 'avro',
    'proto', 'geojson', 'jsonld', 'rdf', 'graphql', 'gql', 'dbml', 'arrow'],
  config: ['yaml', 'yml', 'toml', 'ini', 'cfg', 'conf', 'properties', 'env', 'plist',
    'editorconfig', 'lock', 'rc', 'dotenv'],
};

const EXT_TO_CAT = new Map();
for (const [cat, list] of Object.entries(EXT_CATEGORY)) {
  for (const ext of list) if (!EXT_TO_CAT.has(ext)) EXT_TO_CAT.set(ext, cat);
}

const CATEGORY_OVERRIDE = require('./category-overrides.json');

const looksLikeConfig = (name) =>
  /^\./.test(name) ||
  /(^|[.-])(config|conf|settings|rc)(\.|$)/.test(name) ||
  /\.(ya?ml|toml|ini|cfg|properties|json5?|jsonc)$/.test(name);

function categorise(c) {
  if (c.kind === 'folder') return 'folder';
  if (CATEGORY_OVERRIDE[c.id]) return CATEGORY_OVERRIDE[c.id];

  const exts = [...c.extensions];
  const votes = {};
  for (const ext of exts) {
    // `spec.ts`, `js.map`, `d.ts` — score on the trailing segment too.
    const tail = ext.split('.').pop();
    const cat = EXT_TO_CAT.get(ext) ?? EXT_TO_CAT.get(tail);
    if (cat) votes[cat] = (votes[cat] ?? 0) + 1;
  }
  const ranked = Object.entries(votes).sort((a, b) => b[1] - a[1]);
  // A clear majority of the concept's own extensions decides it.
  if (ranked.length && ranked[0][1] >= Math.max(1, exts.length / 2)) return ranked[0][0];

  if (!exts.length && c.filenames.size && [...c.filenames].every(looksLikeConfig)) {
    return 'config';
  }
  if (ranked.length) return ranked[0][0];
  return 'code';
}

// ---------------------------------------------------------------------------
// Brand colours (only where the real brand colour is unambiguous)
// ---------------------------------------------------------------------------

const BRAND = require('./brand-colors.json');

// ---------------------------------------------------------------------------
// Emit
// ---------------------------------------------------------------------------

const SOURCE_ORDER = { material: 0, vsicons: 1, greaticons: 2 };
const sortStr = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

const out = [...concepts.values()]
  .map((c) => {
    const entry = {
      id: c.id,
      kind: c.kind,
      label: labelFor(c),
      match: {
        extensions: [...c.extensions].sort(sortStr),
        filenames: [...c.filenames].sort(sortStr),
        languageIds: [...c.languageIds].sort(sortStr),
        folderNames: [...c.folderNames].sort(sortStr),
      },
      sources: [...c.sources].sort((a, b) => SOURCE_ORDER[a] - SOURCE_ORDER[b]),
    };
    if (BRAND[c.id]) entry.brandColor = BRAND[c.id];
    entry.category = categorise(c);
    if (c.packOnly) entry.iconPackOnly = true;
    return entry;
  })
  .sort((a, b) => (a.kind === b.kind ? sortStr(a.id, b.id) : a.kind === 'file' ? -1 : 1));

fs.writeFileSync(
  path.join(__dirname, 'merged-index.json'),
  `${JSON.stringify(out, null, 2)}\n`
);

console.log(`merged concepts: ${out.length}`);
console.log(`  file:   ${out.filter((c) => c.kind === 'file').length}`);
console.log(`  folder: ${out.filter((c) => c.kind === 'folder').length}`);
console.log(`in 3 sources: ${out.filter((c) => c.sources.length === 3).length}`);
console.log(`in 2 sources: ${out.filter((c) => c.sources.length === 2).length}`);
console.log(`in 1 source:  ${out.filter((c) => c.sources.length === 1).length}`);
console.log(`brand colours: ${out.filter((c) => c.brandColor).length}`);
console.log(`naming overrides vs vscode-icons: ${OVERRIDE_NAMING.join(', ')}`);
console.log(`generic labels (no curated label): ${
  out.filter((c) => !LABELS[`${c.kind}:${c.id}`] && !LABELS[c.id]).length
}`);
