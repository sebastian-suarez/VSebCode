#!/usr/bin/env node
// raster.mjs — measure what an icon actually paints.
//
// Reads the SVGs, renders each one at 256x256 in the Playwright chromium under
// ~/Library/Caches/ms-playwright, and counts fully-opaque pixels per colour. That
// gives the true dominant fill and the coverage share of every colour — a plate
// under a letterform, a two-tone mark, a folder's shadow band — without guessing
// path areas analytically. It also returns 64x64 shape masks, which is how the
// audit compares FORM without looking at colour.
//
//   node raster.mjs svg/file/typescript.svg …   # ad-hoc, prints a table
//
// Exports rasterFills(entries) -> Map("kind/id" ->
//   { fills, dominant, coverage, bytes, src, mask, ink, mark }).
// `fills` are the literal fills declared in the source, in document order; `coverage`
// maps declared fill -> share of painted pixels; `ink` is the whole silhouette and
// `mark` the ink that is not the dominant fill (a badge's letters), both as
// mask*mask '0'/'1' strings.

import { readFileSync, writeFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join, basename } from 'node:path';
import { execFileSync } from 'node:child_process';
import { homedir, tmpdir } from 'node:os';

const SIZE = 256;
const MASK = 64;   // shape-mask resolution (SIZE must be a multiple of it)

export function chromium() {
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

/** Literal fills declared in an SVG source, in document order, de-duplicated. */
export function declaredFills(src) {
	const out = [];
	for (const m of src.matchAll(/(?:fill|stroke)\s*=\s*"([^"]*)"/g)) {
		const v = m[1].trim();
		if (v === 'none' || v === 'currentColor') { continue; }
		const hex = v.startsWith('#') ? v.toUpperCase() : v.replace(/\s+/g, '');
		if (!out.includes(hex)) { out.push(hex); }
	}
	return out;
}

/**
 * @param {{kind:string,id:string,path:string}[]} entries
 * @returns {Promise<Map<string,{fills:string[],dominant:string,coverage:Record<string,number>,bytes:number,src:string}>>}
 */
export async function rasterFills(entries) {
	const loaded = entries.map(e => {
		const src = readFileSync(e.path, 'utf8');
		return { ...e, src, bytes: Buffer.byteLength(src) };
	});

	const payload = loaded.map(e => ({
		key: `${e.kind}/${e.id}`,
		// only hex fills are buckets; an rgba shading band merges into the colour it shades
		buckets: declaredFills(e.src).filter(f => f.startsWith('#')),
		uri: 'data:image/svg+xml;base64,' + Buffer.from(e.src, 'utf8').toString('base64')
	}));

	const page = join(tmpdir(), `m11-raster-${process.pid}.html`);
	writeFileSync(page, `<!doctype html><meta charset="utf-8"><body><pre id="o">PENDING</pre><script>
const ICONS = ${JSON.stringify(payload)};
const S = ${SIZE};
const c = document.createElement('canvas'); c.width = S; c.height = S;
const g = c.getContext('2d', { willReadFrequently: true });
const rgb = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
(async () => {
  const out = {};
  for (const it of ICONS) {
    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = () => rej(new Error(it.key)); img.src = it.uri; });
    g.clearRect(0, 0, S, S);
    g.drawImage(img, 0, 0, S, S);
    const d = g.getImageData(0, 0, S, S).data;
    const buckets = it.buckets.map(rgb);
    const counts = {};
    const owner = new Int16Array(S * S).fill(-1);   // which declared fill paints each ink pixel
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 128) { continue; }             // edge against the page: not ink
      // bucket to the nearest declared fill: interior antialiasing between two fills,
      // and shading bands, belong to the colour they sit closest to.
      let best = 0, bd = Infinity;
      for (let b = 0; b < buckets.length; b++) {
        const dr = d[i] - buckets[b][0], dg = d[i + 1] - buckets[b][1], db = d[i + 2] - buckets[b][2];
        const q = dr * dr + dg * dg + db * db;
        if (q < bd) { bd = q; best = b; }
      }
      owner[i >> 2] = best;
      if (d[i + 3] === 255) { counts[it.buckets[best]] = (counts[it.buckets[best]] || 0) + 1; }
    }
    // M x M shape masks: all ink, and the ink that is NOT the dominant fill (a badge's
    // letters, a plate's mark) — the second is what distinguishes two same-plate badges.
    let dom = 0, dn = -1;
    for (let b = 0; b < it.buckets.length; b++) {
      const n = counts[it.buckets[b]] || 0;
      if (n > dn) { dn = n; dom = b; }
    }
    const M = ${MASK}, step = S / M;
    const ink = [], mark = [];
    for (let my = 0; my < M; my++) {
      for (let mx = 0; mx < M; mx++) {
        let a = 0, k = 0;
        for (let y = my * step; y < (my + 1) * step; y++) {
          for (let x = mx * step; x < (mx + 1) * step; x++) {
            const o = owner[y * S + x];
            if (o >= 0) { a++; if (o !== dom) { k++; } }
          }
        }
        ink.push(a * 2 >= step * step ? '1' : '0');
        mark.push(k * 2 >= step * step ? '1' : '0');
      }
    }
    out[it.key] = { counts, ink: ink.join(''), mark: mark.join('') };
  }
  document.getElementById('o').textContent = 'RASTER=' + JSON.stringify(out);
})().catch(e => { document.getElementById('o').textContent = 'RASTERERR=' + e.message; });
</script>`);

	const dom = execFileSync(chromium(), ['--headless', '--disable-gpu', '--no-sandbox',
		'--hide-scrollbars', '--allow-file-access-from-files', '--virtual-time-budget=60000',
		'--window-size=400,300', '--dump-dom', `file://${page}`],
		{ encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 });
	rmSync(page, { force: true });

	const pre = /<pre id="o">([\s\S]*?)<\/pre>/.exec(dom);
	if (!pre) { throw new Error('raster produced no output element'); }
	const text = pre[1];
	if (text.startsWith('RASTERERR=')) { throw new Error(`raster failed: ${text.slice(10)}`); }
	if (!text.startsWith('RASTER=')) { throw new Error('raster did not finish (chromium timed out)'); }
	const counts = JSON.parse(text.slice(7));

	const result = new Map();
	for (const e of loaded) {
		const key = `${e.kind}/${e.id}`;
		const r = counts[key] ?? { counts: {}, ink: '', mark: '' };
		const total = Object.values(r.counts).reduce((a, b) => a + b, 0) || 1;
		const coverage = {};
		for (const [k, v] of Object.entries(r.counts).sort((a, b) => b[1] - a[1])) {
			coverage[k] = +(v / total).toFixed(4);
		}
		result.set(key, {
			fills: declaredFills(e.src),
			dominant: Object.keys(coverage)[0] ?? '#000000',
			coverage,
			bytes: e.bytes,
			src: e.src,
			mask: MASK,
			ink: r.ink,
			mark: r.mark
		});
	}
	return result;
}

// ---- CLI --------------------------------------------------------------------

if (process.argv[1] && basename(process.argv[1]) === 'raster.mjs') {
	const paths = process.argv.slice(2);
	if (!paths.length) { console.error('usage: node raster.mjs <svg…>'); process.exit(2); }
	const r = await rasterFills(paths.map(p => ({ kind: 'x', id: basename(p, '.svg'), path: p })));
	for (const [k, v] of r) {
		console.log(`${k.slice(2).padEnd(22)} dominant ${v.dominant}  declared ${v.fills.join(' ')}`);
		console.log(`  coverage ${Object.entries(v.coverage).map(([c, s]) => `${c} ${(s * 100).toFixed(1)}%`).join('  ')}`);
	}
}
