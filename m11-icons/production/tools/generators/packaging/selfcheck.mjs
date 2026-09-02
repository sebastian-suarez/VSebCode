// Structural self-check of the packaged theme, mirroring the checks in
// m11-icons/production/tools/build-theme.mjs (--check mode) but resolving
// iconPaths against the shipped extension layout.

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';

const EXT = '/Users/sebastian.suarez/Projects/VSebCode/vscode/extensions/theme-vsebcode-icons';
const OUT = join(EXT, 'icons', 'vsebcode-icon-theme.json');
const OUT_DIR = dirname(OUT);
const manifest = JSON.parse(readFileSync('/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/set-manifest.json', 'utf8'));

const onDisk = new Set(manifest.icons.map(i => `${i.kind}/${i.id}`));
const defName = (kind, id, open = false) => kind === 'file'
	? `_${id}`
	: (id === 'folder' ? (open ? '_folder_open' : '_folder') : `_folder_${id}${open ? '_open' : ''}`);

const raw = readFileSync(OUT, 'utf8');
const subject = JSON.parse(raw);
const errors = [];

// 1. every referenced iconPath exists
for (const [name, d] of Object.entries(subject.iconDefinitions)) {
	const p = join(OUT_DIR, d.iconPath);
	if (!existsSync(p)) { errors.push(`definition ${name} -> missing file ${d.iconPath}`); }
}
// 1b. every icon on disk is defined
for (const key of onDisk) {
	const [kind, id] = key.split('/');
	const name = kind === 'folder' && id.endsWith('-open')
		? defName('folder', id.replace(/-open$/, ''), true)
		: defName(kind, id);
	if (!subject.iconDefinitions[name]) { errors.push(`svg/${key}.svg has no icon definition`); }
}
// 2. no association maps to a missing definition
const assocMaps = ['fileExtensions', 'fileNames', 'languageIds', 'folderNames', 'folderNamesExpanded'];
for (const m of assocMaps) {
	for (const [key, def] of Object.entries(subject[m])) {
		if (!subject.iconDefinitions[def]) { errors.push(`${m}["${key}"] -> undefined definition ${def}`); }
	}
}
for (const d of ['file', 'folder', 'folderExpanded']) {
	if (!subject.iconDefinitions[subject[d]]) { errors.push(`default "${d}" -> undefined definition ${subject[d]}`); }
}
// 3. no duplicate keys (JSON cannot carry them; verify the source text instead)
for (const m of [...assocMaps, 'iconDefinitions']) {
	const seg = new RegExp(`"${m}": \\{([\\s\\S]*?)\\n\\t\\}`).exec(raw);
	if (!seg) { errors.push(`${m}: could not locate segment in source text`); continue; }
	const keys = [...seg[1].matchAll(/^\t\t"((?:[^"\\]|\\.)*)":/gm)].map(x => x[1]);
	const seen = new Set(), dupes = new Set();
	for (const k of keys) { if (seen.has(k)) { dupes.add(k); } seen.add(k); }
	if (dupes.size) { errors.push(`${m} has duplicate keys: ${[...dupes].join(', ')}`); }
}
// 4. every closed folder has its expanded twin, and vice versa
for (const k of Object.keys(subject.folderNames)) {
	if (!subject.folderNamesExpanded[k]) { errors.push(`folderNames["${k}"] has no expanded twin`); }
}
for (const k of Object.keys(subject.folderNamesExpanded)) {
	if (!subject.folderNames[k]) { errors.push(`folderNamesExpanded["${k}"] has no closed twin`); }
}
// 5. dark-only product
for (const k of ['light', 'highContrast']) {
	if (subject[k]) { errors.push(`"${k}" variant present -- the product is dark-only`); }
}
// 6. packaged layout: every iconPath is theme-file relative into ./file or ./folder
for (const [name, d] of Object.entries(subject.iconDefinitions)) {
	if (!/^\.\/(file|folder)\/[^/]+\.svg$/.test(d.iconPath)) { errors.push(`definition ${name} -> non-packaged iconPath ${d.iconPath}`); }
}
// 7. the package.json theme entry points at this file
const pkg = JSON.parse(readFileSync(join(EXT, 'package.json'), 'utf8'));
const contributed = pkg.contributes.iconThemes[0];
if (!existsSync(join(EXT, contributed.path))) { errors.push(`package.json iconThemes path ${contributed.path} does not resolve`); }
const nls = JSON.parse(readFileSync(join(EXT, 'package.nls.json'), 'utf8'));
for (const v of [pkg.displayName, pkg.description, contributed.label]) {
	const key = v.replace(/^%|%$/g, '');
	if (!nls[key]) { errors.push(`package.nls.json is missing key "${key}"`); }
}

const defs = Object.keys(subject.iconDefinitions).length;
const fileDefs = Object.values(subject.iconDefinitions).filter(d => d.iconPath.includes('/file/')).length;
console.log(`checked ${OUT}`);
console.log(`  iconDefinitions      ${defs}  (${fileDefs} file, ${defs - fileDefs} folder)`);
console.log(`  fileExtensions       ${Object.keys(subject.fileExtensions).length}`);
console.log(`  fileNames            ${Object.keys(subject.fileNames).length}`);
console.log(`  languageIds          ${Object.keys(subject.languageIds).length}`);
console.log(`  folderNames          ${Object.keys(subject.folderNames).length}`);
console.log(`  folderNamesExpanded  ${Object.keys(subject.folderNamesExpanded).length}`);
console.log(`  extension id         ${pkg.publisher}.${pkg.name}-${contributed.id}`);

if (errors.length) {
	console.log(`\nSELF-CHECK FAILED -- ${errors.length} problem(s):`);
	for (const e of errors.slice(0, 40)) { console.log(`  ${e}`); }
	if (errors.length > 40) { console.log(`  ... and ${errors.length - 40} more`); }
	process.exit(1);
}
console.log('\nself-check clean');
