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
// Archetype / colourSource / batch / emblem are scraped once from every contact sheet's
// manifest footer — the six contact-batch*.html, contact-folders.html and the eighteen
// full-coverage slices contact-{A01..A12,F01..F06}.html — then MAINTAINED BY HAND in the
// JSON: a rerun keeps any value that differs from the scrape unless --fresh is passed.
// fills / dominant / coverage / bytes are always recomputed from the SVGs, so a
// retint is picked up without touching this file.
//
// MERGE-PRESERVING (assembly v2). The record is built by spreading the previous record
// first and overwriting only the measured keys, so hand-added keys — `round1`, `round2`,
// `reconciled`, `round3`, `note`, anything a future round adds — survive a rerun. The
// earlier version enumerated a fixed key list and silently dropped them.

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rasterFills } from './raster.mjs';

const DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(DIR, '..');
const OUT = join(ROOT, 'set-manifest.json');
const FRESH = process.argv.includes('--fresh');

const unesc = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
	.replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").replace(/&quot;/g, '"')
	.replace(/&rsquo;/g, '’').replace(/&#8217;/g, '’');
const cells = (row) => [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)]
	.map(m => unesc(m[1].replace(/<[^>]*>/g, '').trim()));

// ---- scrape the contact sheets ---------------------------------------------
//
// Eighteen slices were authored by eighteen agents and none of them used the same
// table markup: the manifest footer is `<table class="ftable">`, `<table class="man">`
// or a bare `<table>`, and its columns run in any order (some carry `#`, `path`,
// `fills`, `dominant`, `hex`). The one invariant is the header row: a manifest footer
// is the table whose `<th>`s contain `id` plus either `archetype` (file slice) or
// `emblem` (folder slice). Everything else is addressed by column NAME, never index.

const HEAD_RE = /<th[^>]*>([\s\S]*?)<\/th>/g;

function scrapeSheet(file, batch) {
	if (!existsSync(file)) { return []; }
	const html = readFileSync(file, 'utf8');
	const out = [];
	for (const t of html.matchAll(/<table[^>]*>([\s\S]*?)<\/table>/g)) {
		const table = t[1];
		// prefer an explicit <thead>; several slices emit the header row bare
		const headSrc = /<thead>([\s\S]*?)<\/thead>/.exec(table)?.[1]
			?? /<tr[^>]*>([\s\S]*?)<\/tr>/.exec(table)?.[1] ?? '';
		const head = [...headSrc.matchAll(HEAD_RE)]
			.map(m => unesc(m[1].replace(/<[^>]*>/g, '').trim()).toLowerCase());
		if (!head.includes('id')) { continue; }
		const isFolder = head.includes('emblem');
		if (!isFolder && !head.includes('archetype')) { continue; }
		const col = (...names) => {
			for (const n of names) { const i = head.indexOf(n); if (i >= 0) { return i; } }
			return -1;
		};
		const iId = col('id');
		const iArch = col('archetype');
		const iEmb = col('emblem');
		const iSrc = col('colour source', 'colour-source', 'colorsource', 'colour');
		for (const m of table.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)) {
			const c = cells(m[1]);
			if (!c.length) { continue; }
			const id = c[iId];
			if (!id || /\s/.test(id)) { continue; }
			const colourSource = iSrc >= 0 ? (c[iSrc] ?? '') : '';
			if (isFolder) {
				// one sheet row describes the pair; the -open variant inherits it
				const emblem = iEmb >= 0 ? (c[iEmb] ?? '') : '';
				out.push({ id, kind: 'folder', archetype: 'FOLDER', emblem, colourSource, batch });
				out.push({ id: `${id}-open`, kind: 'folder', archetype: 'FOLDER', emblem, colourSource, batch });
			} else {
				out.push({ id, kind: 'file', archetype: (c[iArch] ?? '').toUpperCase(), colourSource, batch });
			}
		}
	}
	return out;
}

// Order matters only for the rare id that appears on two sheets: the later (more
// specific) sheet wins, so the core batches are scraped first and the slices after.
const SHEETS = [
	...[1, 2, 3, 4, 5, 6].map(n => [`contact-batch${n}.html`, `batch${n}`]),
	['contact-folders.html', 'folders'],
	...['A01', 'A02', 'A03', 'A04', 'A05', 'A06', 'A07', 'A08', 'A09', 'A10', 'A11', 'A12',
		'F01', 'F02', 'F03', 'F04', 'F05', 'F06'].map(s => [`contact-${s}.html`, s])
];

const scraped = new Map();
const scrapeCounts = [];
for (const [file, batch] of SHEETS) {
	const rows = scrapeSheet(join(ROOT, file), batch);
	scrapeCounts.push([batch, rows.length]);
	for (const r of rows) { scraped.set(`${r.kind}/${r.id}`, r); }
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

// Ties in the dominant-fill vote, broken by hand. A two-tone mark whose halves land
// within a rounding step of 50/50 would otherwise flip dominant between reruns and
// take R7's whole reading with it (the ledger's python-misc note; same situation as
// the core python icon, resolved the same way).
const DOMINANT_TIEBREAK = { 'file/python-misc': '#6B92BE' };
const TIE_EPS = 0.02;

const icons = files.map(({ kind, id }) => {
	const key = `${kind}/${id}`;
	const s = scraped.get(key) ?? {};
	const p = previous.get(key) ?? {};
	const m = measured.get(key);
	// Spread the previous record FIRST: every hand-added key (round1/round2/round3,
	// reconciled, note, …) rides through untouched. Only the keys below are authoritative
	// from this run.
	const rec = {
		...p,
		id, kind,
		archetype: p.archetype ?? s.archetype ?? guessArchetype(m),
		fills: m.fills,
		dominant: dominantOf(key, m),
		coverage: m.coverage,
		colourSource: p.colourSource || s.colourSource || '',
		batch: p.batch || s.batch || '',
		bytes: m.bytes
	};
	if (s.emblem || p.emblem) { rec.emblem = p.emblem || s.emblem; }
	return rec;
});

function dominantOf(key, m) {
	const forced = DOMINANT_TIEBREAK[key];
	if (!forced || !m.coverage[forced]) { return m.dominant; }
	const top = Math.max(...Object.values(m.coverage));
	// only honour the tie-break when it really is a tie — a later redraw that makes one
	// tone genuinely dominant must not be overridden silently
	return (top - m.coverage[forced]) <= TIE_EPS ? forced : m.dominant;
}

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
const kept = icons.filter(i => i.round1 || i.round2 || i.round3 || i.reconciled).length;
console.log(`${OUT}  (${icons.length} icons)`);
console.log(`  archetypes: ${[...new Set(icons.map(i => i.archetype))].sort().join(', ')}`);
console.log(`  sheets scraped: ${scrapeCounts.filter(([, n]) => n).map(([b, n]) => `${b}:${n}`).join(' ')}`);
console.log(`  hand-maintained records preserved: ${kept}`);
if (missing.length) {
	console.log(`  no metadata for (${missing.length}): ${missing.map(i => `${i.kind}/${i.id}`).join(', ')}`);
}
