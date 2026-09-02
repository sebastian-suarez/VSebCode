#!/usr/bin/env node
// letterpath.mjs — turn a short string into ONE flat <path> for a 16x16 icon.
//
// Production icons carry no <text> and no font-family (see ../spec.md), so every
// badge / letter-glyph is baked to outlines here, from Inter Bold in ./fonts.
//
//   node letterpath.mjs --text TS --cap 5.3 --cx 8 --cy 8
//   node letterpath.mjs --text npm --ink-height 3.6 --cx 8 --cy-ink 9.55 --fill '#FFFFFF'
//
// Sizing (pick exactly one):
//   --size N        font size in px (SVG user units)
//   --cap N         scale so the font's cap height is N px
//   --xheight N     scale so the font's x-height is N px
//   --ink-height N  scale so the rendered ink box is exactly N px tall
//
// Placement:
//   --cx N          horizontal centre (default 8)
//   --hcenter K     'ink' (optical, default) | 'advance' (what text-anchor=middle does)
//   --cy N          vertical centre of the reference band (see --band)
//   --cy-ink N      vertical centre of the ink box (shorthand for --band ink --cy N)
//   --baseline N    explicit baseline; overrides --cy
//   --band K        band that --cy centres: 'cap' (default) | 'xheight' | 'ink'
//
// Extras: --font bold|semibold|<path>  --letter-spacing EM  --precision N (default 2)
//         --fill COLOR (emit a full <path> element)  --json (emit metrics too)

import { readFileSync } from 'node:fs';
import { dirname, join, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import opentypeNs from 'opentype.js';

const opentype = opentypeNs.default || opentypeNs;
const DIR = dirname(fileURLToPath(import.meta.url));
const FONTS = {
	bold: join(DIR, 'fonts', 'Inter-Bold.ttf'),
	semibold: join(DIR, 'fonts', 'Inter-SemiBold.ttf')
};

const fontCache = new Map();

// opentype.parse wants a plain ArrayBuffer.
function readFontBuffer(file) {
	const b = readFileSync(file);
	return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
}
function font(which = 'bold') {
	const file = FONTS[which] || (isAbsolute(which) ? which : join(DIR, which));
	if (!fontCache.has(file)) { fontCache.set(file, opentype.parse(readFontBuffer(file))); }
	return fontCache.get(file);
}

const num = (v, p) => {
	let s = v.toFixed(p);
	if (s.includes('.')) { s = s.replace(/0+$/, '').replace(/\.$/, ''); }
	if (s === '-0') { s = '0'; }
	return s.replace(/^(-?)0\./, '$1.');
};

function serialize(commands, p) {
	const out = [];
	let prev = '';
	let cur = '';
	for (const c of commands) {
		if (c.type === 'Z') { out.push('Z'); prev = 'Z'; cur = ''; continue; }
		const here = num(c.x, p) + ',' + num(c.y, p);
		// TrueType->cubic conversion leaves zero-length linetos everywhere; drop them.
		if (c.type === 'L' && here === cur) { continue; }
		cur = here;
		const args =
			c.type === 'C' ? [c.x1, c.y1, c.x2, c.y2, c.x, c.y] :
				c.type === 'Q' ? [c.x1, c.y1, c.x, c.y] : [c.x, c.y];
		const body = args.map(v => num(v, p)).join(' ').replace(/ -/g, '-');
		// Repeat-command elision ("L1 2L3 4" -> "L1 2 3 4"). Never for M: a repeated
		// moveto without its letter is read as an implicit lineto.
		if (c.type === prev && c.type !== 'M') { out.push(body.startsWith('-') ? body : ' ' + body); }
		else { out.push(c.type + body); prev = c.type; }
	}
	return out.join('');
}

/**
 * Build a single outline path for `text`.
 * @returns {{d:string, fontSize:number, baseline:number, ink:{x1,y1,x2,y2,w,h}, advance:number, capBand:number, xBand:number}}
 */
export function letterPath(opts) {
	const {
		text,
		font: which = 'bold',
		size, cap, xheight, inkHeight,
		cx = 8, cy, baseline: baselineOpt,
		hcenter = 'ink',
		band: bandOpt,
		letterSpacing = 0,
		precision = 2
	} = opts;

	if (!text) { throw new Error('letterPath: --text is required'); }
	const f = font(which);
	const upm = f.unitsPerEm;
	const capRatio = f.tables.os2.sCapHeight / upm;
	const xRatio = f.tables.os2.sxHeight / upm;
	const draw = (px) => f.getPath(text, 0, 0, px, { kerning: true, letterSpacing });

	let fontSize;
	if (size != null) { fontSize = size; }
	else if (cap != null) { fontSize = cap / capRatio; }
	else if (xheight != null) { fontSize = xheight / xRatio; }
	else if (inkHeight != null) {
		const probe = draw(100).getBoundingBox();
		fontSize = 100 * inkHeight / (probe.y2 - probe.y1);
	} else { throw new Error('letterPath: one of size / cap / xheight / inkHeight is required'); }

	const path = draw(fontSize);
	const bb = path.getBoundingBox();          // baseline at y=0, y grows downward
	const advance = f.getAdvanceWidth(text, fontSize, { kerning: true, letterSpacing });
	const capBand = capRatio * fontSize;
	const xBand = xRatio * fontSize;

	const band = bandOpt || (inkHeight != null ? 'ink' : 'cap');
	let baseline;
	if (baselineOpt != null) {
		baseline = baselineOpt;
	} else {
		const c = cy == null ? 8 : cy;
		if (band === 'ink') { baseline = c - (bb.y1 + bb.y2) / 2; }
		else if (band === 'xheight') { baseline = c + xBand / 2; }
		else { baseline = c + capBand / 2; }
	}
	const dx = hcenter === 'advance' ? cx - advance / 2 : cx - (bb.x1 + bb.x2) / 2;
	const dy = baseline;

	const commands = path.commands.map(c => {
		const o = { type: c.type };
		if (c.type !== 'Z') { o.x = c.x + dx; o.y = c.y + dy; }
		if (c.type === 'C') { o.x1 = c.x1 + dx; o.y1 = c.y1 + dy; o.x2 = c.x2 + dx; o.y2 = c.y2 + dy; }
		if (c.type === 'Q') { o.x1 = c.x1 + dx; o.y1 = c.y1 + dy; }
		return o;
	});

	return {
		d: serialize(commands, precision),
		fontSize: +fontSize.toFixed(4),
		baseline: +dy.toFixed(4),
		advance: +advance.toFixed(3),
		capBand: +capBand.toFixed(3),
		xBand: +xBand.toFixed(3),
		ink: {
			x1: +(bb.x1 + dx).toFixed(3), y1: +(bb.y1 + dy).toFixed(3),
			x2: +(bb.x2 + dx).toFixed(3), y2: +(bb.y2 + dy).toFixed(3),
			w: +(bb.x2 - bb.x1).toFixed(3), h: +(bb.y2 - bb.y1).toFixed(3)
		}
	};
}

// ---- CLI -----------------------------------------------------------------
function main(argv) {
	const a = {};
	for (let i = 0; i < argv.length; i++) {
		const k = argv[i];
		if (!k.startsWith('--')) { continue; }
		const name = k.slice(2);
		const next = argv[i + 1];
		if (next === undefined || next.startsWith('--')) { a[name] = true; }
		else { a[name] = next; i++; }
	}
	const f = (v) => (v === undefined ? undefined : parseFloat(v));
	const res = letterPath({
		text: a.text,
		font: a.font,
		size: f(a.size),
		cap: f(a.cap),
		xheight: f(a.xheight),
		inkHeight: f(a['ink-height']),
		cx: a.cx === undefined ? 8 : f(a.cx),
		cy: a['cy-ink'] !== undefined ? f(a['cy-ink']) : f(a.cy),
		band: a['cy-ink'] !== undefined ? 'ink' : a.band,
		baseline: f(a.baseline),
		hcenter: a.hcenter || 'ink',
		letterSpacing: a['letter-spacing'] === undefined ? 0 : f(a['letter-spacing']),
		precision: a.precision === undefined ? 2 : parseInt(a.precision, 10)
	});
	if (a.json) { console.log(JSON.stringify(res, null, 1)); return; }
	if (a.fill) { console.log(`<path fill="${a.fill}" d="${res.d}"/>`); return; }
	console.log(res.d);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
	main(process.argv.slice(2));
}
