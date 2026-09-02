#!/usr/bin/env node
// make-set-manifest.mjs — (re)build ../set-manifest.json, the maintained metadata map
// for the whole production set.
//
//   node make-set-manifest.mjs          # rebuild, preserving hand edits
//   node make-set-manifest.mjs --fresh  # rebuild from the batch sheets only
//
// Per icon: id, kind, archetype, fills (declared, document order), dominant fill,
// coverage (rendered px share per fill), colourSource, batch, bytes.
//
// Archetype / colourSource / batch are scraped once from the six contact-batch*.html
// manifest footers and contact-folders.html, then MAINTAINED BY HAND in the JSON:
// a rerun keeps any value that differs from the scrape unless --fresh is passed.
// fills / dominant / coverage / bytes are always recomputed from the SVGs, so a
// retint is picked up without touching this file.

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rasterFills } from './raster.mjs';

const DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(DIR, '..');
const OUT = join(ROOT, 'set-manifest.json');
const FRESH = process.argv.includes('--fresh');

const unesc = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
	.replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
const cells = (row) => [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)]
	.map(m => unesc(m[1].replace(/<[^>]*>/g, '').trim()));

// ---- scrape the batch sheets -----------------------------------------------

function scrapeSheet(file, batch) {
	if (!existsSync(file)) { return []; }
	const html = readFileSync(file, 'utf8');
	const out = [];
	// every <table class="ftable"> whose header carries an `id` column is a manifest
	// (batch 6 ships two: its own concepts, then the generics)
	for (const t of html.matchAll(/<table class="ftable">([\s\S]*?)<\/table>/g)) {
		const table = t[1];
		const head = [...(/<thead>([\s\S]*?)<\/thead>/.exec(table)?.[1] ?? '')
			.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/g)].map(m => unesc(m[1].replace(/<[^>]*>/g, '').trim()));
		if (!head.includes('id')) { continue; }
		const col = (n) => head.indexOf(n);
		for (const m of table.matchAll(/<tr>([\s\S]*?)<\/tr>/g)) {
			const c = cells(m[1]);
			if (!c.length) { continue; }
			const id = c[col('id')];
			if (!id) { continue; }
			if (head.includes('emblem')) {
				// folder sheet: id | emblem | hex | colour source | closed B | open B
				out.push({ id, kind: 'folder', archetype: 'FOLDER', emblem: c[col('emblem')],
					colourSource: c[col('colour source')], batch });
				out.push({ id: `${id}-open`, kind: 'folder', archetype: 'FOLDER',
					emblem: c[col('emblem')], colourSource: c[col('colour source')], batch });
			} else {
				out.push({ id, kind: 'file', archetype: c[col('archetype')],
					colourSource: c[col('colour source')], batch });
			}
		}
	}
	return out;
}

const scraped = new Map();
for (const n of [1, 2, 3, 4, 5, 6]) {
	for (const r of scrapeSheet(join(ROOT, `contact-batch${n}.html`), `batch${n}`)) {
		scraped.set(`${r.kind}/${r.id}`, r);
	}
}
for (const r of scrapeSheet(join(ROOT, 'contact-folders.html'), 'folders')) {
	scraped.set(`${r.kind}/${r.id}`, r);
}
// the canon default pair is not in core-tier.json's folders array, so no sheet row carries it
scraped.set('folder/folder', { id: 'folder', kind: 'folder', archetype: 'FOLDER',
	emblem: 'none (canon plate)', colourSource: 'canon #BF9354', batch: 'canon' });
scraped.set('folder/folder-open', { id: 'folder-open', kind: 'folder', archetype: 'FOLDER',
	emblem: 'none (canon flared lip)', colourSource: 'canon #8F6D37 / #C09553', batch: 'canon' });

// ---- the icons on disk ------------------------------------------------------

const files = [];
for (const kind of ['file', 'folder']) {
	for (const e of readdirSync(join(ROOT, 'svg', kind)).sort()) {
		if (e.endsWith('.svg')) { files.push({ kind, id: e.replace(/\.svg$/, '') }); }
	}
}

const previous = !FRESH && existsSync(OUT)
	? new Map(JSON.parse(readFileSync(OUT, 'utf8')).icons.map(i => [`${i.kind}/${i.id}`, i]))
	: new Map();

const measured = await rasterFills(files.map(f => ({ ...f, path: join(ROOT, 'svg', f.kind, `${f.id}.svg`) })));

const icons = files.map(({ kind, id }) => {
	const key = `${kind}/${id}`;
	const s = scraped.get(key) ?? {};
	const p = previous.get(key) ?? {};
	const m = measured.get(key);
	const rec = {
		id, kind,
		archetype: p.archetype ?? s.archetype ?? guessArchetype(m),
		fills: m.fills,
		dominant: m.dominant,
		coverage: m.coverage,
		colourSource: p.colourSource ?? s.colourSource ?? '',
		batch: p.batch ?? s.batch ?? '',
		bytes: m.bytes
	};
	if (s.emblem || p.emblem) { rec.emblem = p.emblem ?? s.emblem; }
	if (p.note) { rec.note = p.note; }
	return rec;
});

function guessArchetype(m) {
	return /<rect x="1" y="1" width="14" height="14" rx="3"/.test(m.src) ? 'BADGE' : 'SILHOUETTE';
}

writeFileSync(OUT, JSON.stringify({
	note: 'Maintained metadata map for the M11 production set. fills/dominant/coverage/bytes are '
		+ 'recomputed by tools/make-set-manifest.mjs from the SVGs; archetype/colourSource/batch/emblem '
		+ 'are hand-maintained (a rerun preserves them unless --fresh).',
	generated: new Date().toISOString().slice(0, 10),
	counts: { file: icons.filter(i => i.kind === 'file').length, folder: icons.filter(i => i.kind === 'folder').length },
	icons
}, null, '\t') + '\n');

const missing = icons.filter(i => !i.archetype || !i.colourSource);
console.log(`${OUT}  (${icons.length} icons)`);
console.log(`  archetypes: ${[...new Set(icons.map(i => i.archetype))].sort().join(', ')}`);
if (missing.length) { console.log(`  no metadata for: ${missing.map(i => i.id).join(', ')}`); }
