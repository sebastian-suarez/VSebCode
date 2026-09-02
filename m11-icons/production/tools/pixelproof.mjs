#!/usr/bin/env node
// pixelproof.mjs — the honest 16 px test (the pilot's method).
//
// Renders an icon at exactly 16x16 in the Playwright chromium, composites it over the
// editor background #121314, and prints the result as a 16x16 character grid plus the
// numbers that decide whether a mark ships: how much ink survives, how much of it is
// too dim to see, and how many pixels carry the mark's defining feature.
//
//   node pixelproof.mjs svg/file/maven.svg svg/file/expo.svg
//   node pixelproof.mjs --file /tmp/candidate.svg --label "maven feather"
//   node pixelproof.mjs --html ../proof.html svg/file/*.svg   # blown-up sheet, 14x nearest
//
// A mark passes when its silhouette is still recognizable in the grid at 16 px and its
// ink is not mostly in the two dimmest bands. No downsampling tricks: the browser
// rasterises the SVG at 16 px the same way the explorer does.

import { readFileSync, writeFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join, basename } from 'node:path';
import { execFileSync } from 'node:child_process';
import { homedir, tmpdir } from 'node:os';

const BG = [0x12, 0x13, 0x14];
const RAMP = ' .:-=+*#%@';          // 10 levels, dark -> bright

export function chromium() {
	const cache = join(homedir(), 'Library/Caches/ms-playwright');
	const builds = readdirSync(cache).filter(d => /^chromium-\d+$/.test(d))
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

const lum = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const BG_LUM = lum(...BG);

/**
 * @param {{label:string, src:string}[]} entries
 * @returns {Promise<Map<string,{px:{r,g,b,a}[], grid:string, ink:number, faint:number, peak:number}>>}
 */
export async function proof(entries) {
	const payload = entries.map(e => ({
		label: e.label,
		uri: 'data:image/svg+xml;base64,' + Buffer.from(e.src, 'utf8').toString('base64')
	}));
	const page = join(tmpdir(), `m11-proof-${process.pid}.html`);
	writeFileSync(page, `<!doctype html><meta charset="utf-8"><body><pre id="o">PENDING</pre><script>
const ICONS = ${JSON.stringify(payload)};
const c = document.createElement('canvas'); c.width = 16; c.height = 16;
const g = c.getContext('2d', { willReadFrequently: true });
(async () => {
  const out = {};
  for (const it of ICONS) {
    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = () => rej(new Error(it.label)); img.src = it.uri; });
    g.clearRect(0, 0, 16, 16);
    g.drawImage(img, 0, 0, 16, 16);
    out[it.label] = Array.from(g.getImageData(0, 0, 16, 16).data);
  }
  document.getElementById('o').textContent = 'PROOF=' + JSON.stringify(out);
})().catch(e => { document.getElementById('o').textContent = 'PROOFERR=' + e.message; });
</script>`);
	const dom = execFileSync(chromium(), ['--headless', '--disable-gpu', '--no-sandbox',
		'--hide-scrollbars', '--allow-file-access-from-files', '--virtual-time-budget=20000',
		'--window-size=400,300', '--dump-dom', `file://${page}`],
		{ encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 32 * 1024 * 1024 });
	rmSync(page, { force: true });
	const pre = /<pre id="o">([\s\S]*?)<\/pre>/.exec(dom);
	if (!pre) { throw new Error('proof produced no output element'); }
	if (pre[1].startsWith('PROOFERR=')) { throw new Error(`proof failed: ${pre[1].slice(9)}`); }
	if (!pre[1].startsWith('PROOF=')) { throw new Error('proof did not finish'); }
	const raw = JSON.parse(pre[1].slice(6));

	const out = new Map();
	for (const e of entries) {
		const d = raw[e.label];
		const px = [], rows = [];
		let ink = 0, faint = 0, peak = 0;
		for (let y = 0; y < 16; y++) {
			let row = '';
			for (let x = 0; x < 16; x++) {
				const i = (y * 16 + x) * 4;
				const a = d[i + 3] / 255;
				// composite over the editor background, exactly as the explorer does
				const r = d[i] * a + BG[0] * (1 - a);
				const gg = d[i + 1] * a + BG[1] * (1 - a);
				const b = d[i + 2] * a + BG[2] * (1 - a);
				px.push({ r, g: gg, b, a });
				const contrast = (lum(r, gg, b) - BG_LUM) / (255 - BG_LUM);   // 0..1 above the bg
				if (a > 0.04) { ink++; if (contrast < 0.12) { faint++; } }
				peak = Math.max(peak, contrast);
				row += RAMP[Math.min(9, Math.max(0, Math.round(contrast * 9)))];
			}
			rows.push(row);
		}
		out.set(e.label, { px, grid: rows, ink, faint, peak });
	}
	return out;
}

// ---- CLI --------------------------------------------------------------------

if (process.argv[1] && basename(process.argv[1]) === 'pixelproof.mjs') {
	const argv = process.argv.slice(2);
	const htmlAt = argv.indexOf('--html');
	const htmlOut = htmlAt >= 0 ? argv[htmlAt + 1] : null;
	const files = argv.filter((a, i) => !a.startsWith('--') && !(htmlAt >= 0 && i === htmlAt + 1));
	if (!files.length) { console.error('usage: node pixelproof.mjs [--html out.html] <svg…>'); process.exit(2); }
	const entries = files.map(f => ({ label: basename(f, '.svg'), src: readFileSync(f, 'utf8'), file: f }));
	const r = await proof(entries);

	for (const e of entries) {
		const p = r.get(e.label);
		console.log(`\n${e.label}  —  ink ${p.ink}/256 px, faint ${p.faint} (${Math.round(p.faint / (p.ink || 1) * 100)}% of ink), peak contrast ${p.peak.toFixed(2)}`);
		console.log('    +----------------+');
		p.grid.forEach((row, y) => console.log(` ${String(y).padStart(2)} |${row}|`));
		console.log('    +----------------+');
	}

	if (htmlOut) {
		const cells = entries.map(e => {
			const p = r.get(e.label);
			const rects = p.px.map((c, i) => c.a <= 0.02 ? '' :
				`<rect x="${i % 16}" y="${Math.floor(i / 16)}" width="1" height="1" fill="rgb(${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)})"/>`).join('');
			return `<figure><svg width="224" height="224" viewBox="0 0 16 16" shape-rendering="crispEdges">`
				+ `<rect width="16" height="16" fill="#121314"/>${rects}</svg>`
				+ `<figcaption>${e.label}<br><span>ink ${p.ink} · faint ${p.faint} · peak ${p.peak.toFixed(2)}</span></figcaption></figure>`;
		}).join('');
		writeFileSync(htmlOut, `<title>16 px pixel proof</title><style>
body{margin:0;background:#121314;color:#D7D9DA;font:13px/1.5 -apple-system,system-ui,sans-serif;padding:28px}
.g{display:flex;flex-wrap:wrap;gap:20px}figure{margin:0;text-align:center}
figcaption{font:11px/1.5 ui-monospace,Menlo,monospace;color:#8A9092;margin-top:8px}
figcaption span{color:#5C6163}</style><div class="g">${cells}</div>`);
		console.log(`\n${htmlOut}`);
	}
}
