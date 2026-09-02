#!/usr/bin/env node
/**
 * M11 icon inventory — step 1: extract raw concept records from the three
 * upstream icon themes.
 *
 * The TypeScript sources are plain object literals once imports and type
 * annotations are stripped, so we rewrite them into evaluable JS and run them
 * in a vm sandbox rather than regex-scraping nested arrays.
 *
 * Output: raw.json
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const SRC = path.join(__dirname, 'sources');
const read = (f) => fs.readFileSync(path.join(SRC, f), 'utf8');

/** Strip `import ...;` statements (single- and multi-line). */
const stripImports = (code) => code.replace(/^import[\s\S]*?from\s+'[^']*';\s*$/gm, '');

/** Drop `: SomeType` / `: SomeType[]` annotations on the exported const. */
const stripExport = (code, name) =>
  code
    .replace(new RegExp(`export const ${name}\\s*(:[^=]+)?=`), `const ${name} =`)
    // trailing `} satisfies Record<string, ILanguage>;` on the literal
    .replace(/\s+satisfies\s+[^;]+;/g, ';')
    .replace(/\s+as\s+const\b/g, '');

/** Any enum-ish namespace resolves to its own member name. */
const nameProxy = () => new Proxy({}, { get: (_t, k) => (typeof k === 'string' ? k : undefined) });

// ---------------------------------------------------------------------------
// Material Icon Theme
// ---------------------------------------------------------------------------

// Re-implementation of src/core/patterns/patterns.ts (mapPatterns), so that
// `patterns:` entries expand to the same fileNames the extension ships.
const mapPatterns = (patterns) =>
  Object.entries(patterns).flatMap(([fileName, pattern]) => {
    switch (pattern) {
      case 'Ecmascript':
        return ['js', 'mjs', 'cjs', 'ts', 'mts', 'cts'].map((e) => `${fileName}.${e}`);
      case 'Configuration':
        return ['json', 'jsonc', 'json5', 'yaml', 'yml', 'toml'].map((e) => `${fileName}.${e}`);
      case 'NodeEcosystem':
        return [
          'js', 'mjs', 'cjs', 'ts', 'mts', 'cts',
          'json', 'jsonc', 'json5', 'yaml', 'yml', 'toml',
        ].map((e) => `${fileName}.${e}`);
      case 'Cosmiconfig': {
        const exts = [
          '', '.json', '.jsonc', '.json5', '.yaml', '.yml', '.toml',
          '.js', '.mjs', '.cjs', '.ts', '.mts', '.cts',
        ];
        return [
          ...exts.map((e) => `.${fileName}rc${e}`),
          ...exts.map((e) => `.config/${fileName}rc${e}`),
          ...exts.filter(Boolean).map((e) => `${fileName}.config${e}`),
        ];
      }
      case 'Yaml':
        return [`${fileName}.yaml`, `${fileName}.yml`];
      case 'Dotfile':
        return [`.${fileName}`, fileName];
      default:
        throw new Error(`Unhandled material pattern: ${pattern}`);
    }
  });

const parseByPattern = (raw) =>
  raw.map(({ patterns, fileNames = [], ...rest }) => ({
    ...rest,
    fileNames: patterns ? [...mapPatterns(patterns), ...fileNames] : fileNames,
  }));

function runMaterial(file, constName) {
  const code = stripExport(stripImports(read(file)), constName);
  const sandbox = {
    parseByPattern,
    FileNamePattern: nameProxy(),
    IconPack: nameProxy(),
    module: { exports: {} },
  };
  vm.createContext(sandbox);
  vm.runInContext(`${code}\nmodule.exports = ${constName};`, sandbox);
  return sandbox.module.exports;
}

const materialFiles = runMaterial('material-fileIcons.ts', 'fileIcons');
const materialFolders = runMaterial('material-folderIcons.ts', 'folderIcons');
const materialLangs = runMaterial('material-languageIcons.ts', 'languageIcons');

const material = [];

for (const icon of materialFiles.icons) {
  material.push({
    source: 'material',
    kind: 'file',
    rawId: icon.name,
    extensions: icon.fileExtensions ?? [],
    filenames: icon.fileNames ?? [],
    languageIds: [],
    folderNames: [],
    // `clone` entries are colour-shifted re-uses of another icon's artwork.
    clonedFrom: icon.clone?.base ?? null,
    light: !!icon.light,
    // Icons only present when a specific icon pack (angular/react/...) is on.
    pack: icon.enabledFor ? [].concat(icon.enabledFor) : null,
  });
}

for (const lang of materialLangs) {
  material.push({
    source: 'material',
    kind: 'file',
    rawId: lang.name,
    extensions: [],
    filenames: [],
    languageIds: [].concat(lang.ids ?? []),
    folderNames: [],
    clonedFrom: lang.clone?.base ?? null,
    light: !!lang.light,
    pack: lang.enabledFor ? [].concat(lang.enabledFor) : null,
  });
}

// Only the `specific` folder theme carries real folder concepts; `classic` and
// `none` are the plain/disabled variants.
const specific = materialFolders.find((t) => t.name === 'specific');
for (const icon of specific.icons) {
  material.push({
    source: 'material',
    kind: 'folder',
    rawId: icon.name,
    extensions: [],
    filenames: [],
    languageIds: [],
    folderNames: icon.folderNames ?? [],
    clonedFrom: icon.clone?.base ?? null,
    light: !!icon.light,
    pack: icon.enabledFor ? [].concat(icon.enabledFor) : null,
  });
}

// ---------------------------------------------------------------------------
// vscode-icons
// ---------------------------------------------------------------------------

function runVsicons(file, langs) {
  const code = stripExport(stripImports(read(file)), 'extensions');
  const sandbox = {
    FileFormat: nameProxy(),
    languages: langs,
    module: { exports: {} },
  };
  vm.createContext(sandbox);
  vm.runInContext(`${code}\nmodule.exports = extensions;`, sandbox);
  return sandbox.module.exports;
}

const vsLangs = (() => {
  const code = stripExport(stripImports(read('vsicons-languages.ts')), 'languages');
  const sandbox = { module: { exports: {} } };
  vm.createContext(sandbox);
  vm.runInContext(`${code}\nmodule.exports = languages;`, sandbox);
  return sandbox.module.exports;
})();

const vsFiles = runVsicons('vsicons-supportedExtensions.ts', vsLangs);
const vsFolders = runVsicons('vsicons-supportedFolders.ts', vsLangs);

const vsicons = [];

for (const e of vsFiles.supported) {
  // `disabled: true` marks alternate artwork that is off by default.
  if (e.disabled) continue;
  const ids = (e.languages ?? []).flatMap((l) => [].concat(l.ids ?? []));
  const known = (e.languages ?? []).flatMap((l) => [].concat(l.knownExtensions ?? []));
  const list = e.extensions ?? [];
  // `filenamesGlob` x `extensionsGlob` is a cartesian product of whole file
  // names — e.g. ['astro.config'] x ['js','ts'] -> astro.config.js/.ts.
  const globbed = (e.filenamesGlob ?? []).flatMap((n) =>
    (e.extensionsGlob ?? []).map((x) => `${n}.${x}`)
  );
  vsicons.push({
    source: 'vsicons',
    kind: 'file',
    rawId: e.icon,
    // `filename: true` means the `extensions` array holds whole file names.
    extensions: e.filename ? known : [...list, ...known],
    filenames: e.filename ? [...list, ...globbed] : globbed,
    languageIds: ids,
    folderNames: [],
    clonedFrom: null,
    light: !!e.light,
    pack: null,
  });
}

for (const e of vsFolders.supported) {
  if (e.disabled) continue;
  vsicons.push({
    source: 'vsicons',
    kind: 'folder',
    rawId: e.icon,
    extensions: [],
    filenames: [],
    languageIds: [],
    folderNames: e.extensions ?? [],
    clonedFrom: null,
    light: !!e.light,
    pack: null,
  });
}

// ---------------------------------------------------------------------------
// VSCode Great Icons
// ---------------------------------------------------------------------------

const great = JSON.parse(read('greaticons-icons.json'));
const greatMap = new Map();

const greatEntry = (defId, kind) => {
  if (!greatMap.has(defId)) {
    greatMap.set(defId, {
      source: 'greaticons',
      kind,
      rawId: defId,
      extensions: [],
      filenames: [],
      languageIds: [],
      folderNames: [],
      clonedFrom: null,
      light: false,
      pack: null,
    });
  }
  return greatMap.get(defId);
};

for (const [ext, def] of Object.entries(great.fileExtensions ?? {})) {
  greatEntry(def, 'file').extensions.push(ext);
}
for (const [name, def] of Object.entries(great.fileNames ?? {})) {
  greatEntry(def, 'file').filenames.push(name);
}
for (const [id, def] of Object.entries(great.languageIds ?? {})) {
  greatEntry(def, 'file').languageIds.push(id);
}
for (const [name, def] of Object.entries(great.folderNames ?? {})) {
  greatEntry(def, 'folder').folderNames.push(name);
}

const greaticons = [...greatMap.values()].map((e) => ({
  ...e,
  // `_f_typescript` -> typescript, `_fd_build` -> build
  rawId: e.rawId.replace(/^_fd_/, '').replace(/^_f_/, ''),
}));

// ---------------------------------------------------------------------------

const all = [...material, ...vsicons, ...greaticons];
fs.writeFileSync(path.join(__dirname, 'raw.json'), `${JSON.stringify(all, null, 2)}\n`);

const count = (src, kind) => all.filter((e) => e.source === src && e.kind === kind).length;
for (const src of ['material', 'vsicons', 'greaticons']) {
  console.log(`${src}: ${count(src, 'file')} file, ${count(src, 'folder')} folder`);
}
console.log(`total raw records: ${all.length}`);
