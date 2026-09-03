// spec-engine.mjs — the machinery every R1 registry shares.
//
// The pilot proved the recipe; production reuses it unchanged. Everything here
// was lifted VERBATIM out of the pilot's sources.mjs when slice work started, so
// a slice subject is fitted by exactly the code that fitted the pilot's twenty —
// which is what lets check.mjs keep asserting the pilot's bytes after the split.
//
// A registry is just an object of subject specs:
//
//   S.<id> = { title, brand, env, plate?, neutral?, folder?, source, simplifications, parts() }
//
// `parts()` returns `{ d, fill }` in SOURCE coordinates; `makeMaster(S)` hands
// back the `master(id, envOverride)` those specs are consumed through. One affine
// fits every part of a subject, so a file icon and its folder's face mark are the
// same geometry at two scales.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as si from 'simple-icons';
import svgpath from 'svgpath';
import { unionBBox, fit, ellipse, round } from './pathkit.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
export const SRCDIR = join(HERE, '..', 'sources-svg');
export const ROOT = join(HERE, '..');

export const officialPaths = (file) => {
	const raw = readFileSync(join(SRCDIR, file), 'utf8');
	return [...raw.matchAll(/<path[^>]*\sd="([^"]+)"[^>]*>/g)].map(m => ({
		d: m[1],
		fill: (m[0].match(/fill="(#[0-9a-fA-F]{3,8})"/) || [])[1] || null
	}));
};

/**
 * Same job, but for source files that park the fill on a wrapping <g> or hang a
 * transform off the path (git ships its diamond as one rotated square, Go puts
 * the wordmark in a translated group). The transform is baked into the data so
 * everything downstream sees plain path coordinates.
 */
export const officialLayers = (file) => {
	const raw = readFileSync(join(SRCDIR, file), 'utf8');
	const out = [];
	const stack = [];
	const tag = /<(\/?)(g|path|svg)\b([^>]*)>/g;
	for (const m of raw.matchAll(tag)) {
		const [, closing, name, attrs] = m;
		if (name === 'svg') { continue; }
		if (closing) { if (name === 'g') { stack.pop(); } continue; }
		const fill = (attrs.match(/\sfill="([^"]+)"/) || [])[1] || null;
		const tf = (attrs.match(/\stransform="([^"]+)"/) || [])[1] || null;
		if (name === 'g') { stack.push({ fill, tf }); continue; }
		const d = (attrs.match(/\sd="([^"]+)"/) || [])[1];
		if (!d) { continue; }
		const chain = [...stack, { fill, tf }];
		let p = svgpath(d);
		for (let i = chain.length - 1; i >= 0; i--) { if (chain[i].tf) { p = p.transform(chain[i].tf); } }
		const inherited = chain.map(c => c.fill).filter(Boolean).pop() || null;
		out.push({ d: p.abs().toString(), fill: inherited });
	}
	return out;
};

/**
 * Third shape of source file: a CorelDRAW export that parks its fills in a
 * `<style>` block and hangs a class off every path (EditorConfig's own logo).
 * The class table is resolved so callers see plain `{ d, fill }` again.
 */
export const officialClassPaths = (file) => {
	const raw = readFileSync(join(SRCDIR, file), 'utf8');
	const table = Object.fromEntries([...raw.matchAll(/\.(fil\d+)\s*\{\s*fill:\s*(#[0-9a-fA-F]{3,8})\s*\}/g)]
		.map(m => [m[1], m[2].toUpperCase()]));
	return [...raw.matchAll(/<path[^>]*\sclass="([^"]+)"[^>]*\sd="([^"]+)"[^>]*\/>/g)]
		.map(m => ({ d: m[2], fill: table[m[1]] || null, cls: m[1] }));
};

/**
 * Fourth shape, and the general one — NEW WITH THE SLICES.
 *
 * A brand SVG that mixes `<circle>` primitives with `<path>`, wraps them in
 * `<g>`, parks its colour in `style="fill:…"` or a `<style>` class table rather
 * than an attribute, and paints some layers with a gradient — Google's own
 * chrome-logo.svg does most of that at once, ONNX's Illustrator export does the
 * rest. Circles come out as their exact cubic ellipse (a circle IS a circle, so
 * that is a format conversion and not a redraw) and a `fill:url(#id)` layer comes
 * back with its gradient's STOPS attached, so the spec that uses it has to name
 * the flat stop it keeps (L2: "flatten gradients to their dominant flat stops")
 * in its own simplification log instead of this reader guessing for it.
 *
 * Returns `{ d, fill, gradient }` in document order; `fill` is `'none'` for a
 * layer the file paints with nothing, which callers drop.
 */
/** `#fff` -> `#FFFFFF`, so every downstream hex is one shape. */
export const expandHex = (v) => {
	const s = v.trim().toUpperCase();
	return /^#[0-9A-F]{3}$/.test(s) ? '#' + [...s.slice(1)].map(c => c + c).join('') : s;
};

export const officialShapes = (file) => {
	const raw = readFileSync(join(SRCDIR, file), 'utf8');
	const grads = {};
	for (const g of raw.matchAll(/<(?:linear|radial)Gradient[^>]*\sid="([^"]+)"[^>]*>([\s\S]*?)<\/(?:linear|radial)Gradient>/g)) {
		grads[g[1]] = [...g[2].matchAll(/<stop[^>]*>/g)].map(s => ({
			offset: +((s[0].match(/\soffset="([^"]+)"/) || [])[1] ?? 0),
			color: ((s[0].match(/stop-color[:=]"?\s*(#[0-9a-fA-F]{3,8})/) || [])[1] || '').toUpperCase()
		}));
	}
	const classes = {};
	for (const c of raw.matchAll(/\.([A-Za-z][\w-]*)\s*\{\s*fill\s*:\s*(#[0-9a-fA-F]{3,8})\s*;?\s*\}/g)) {
		classes[c[1]] = c[2].toUpperCase();
	}
	const paintOf = (attrs) => {
		const cls = (attrs.match(/\sclass="([^"]+)"/) || [])[1];
		const v = ((attrs.match(/\sfill="([^"]+)"/) || [])[1]
			|| (attrs.match(/style="[^"]*fill:\s*([^;"]+)/) || [])[1]
			|| (cls && classes[cls]) || '').trim();
		if (!v) { return { fill: null, gradient: null }; }
		const u = v.match(/^url\(#([^)]+)\)$/);
		if (u) { return { fill: null, gradient: grads[u[1]] || [] }; }
		return { fill: v.startsWith('#') ? expandHex(v) : v, gradient: null };
	};
	const out = [];
	const stack = [];
	for (const m of raw.matchAll(/<(\/?)(g|path|circle|svg)\b([^>]*)>/g)) {
		const [, closing, name, attrs] = m;
		if (name === 'svg') { continue; }
		if (closing) { if (name === 'g') { stack.pop(); } continue; }
		const tf = (attrs.match(/\stransform="([^"]+)"/) || [])[1] || null;
		if (name === 'g') { stack.push({ paint: paintOf(attrs), tf }); continue; }
		const own = paintOf(attrs);
		const chain = [...stack, { paint: own, tf }];
		const inherited = chain.map(c => c.paint).filter(p => p.fill || p.gradient).pop()
			|| { fill: null, gradient: null };
		let d;
		if (name === 'circle') {
			const num = (k) => +((attrs.match(new RegExp(`\\s${k}="([^"]+)"`)) || [])[1] ?? 0);
			d = ellipse(num('cx'), num('cy'), num('r'), num('r'), true);
		} else {
			d = (attrs.match(/\sd="([^"]+)"/) || [])[1];
			if (!d) { continue; }
		}
		let p = svgpath(d);
		for (let i = chain.length - 1; i >= 0; i--) { if (chain[i].tf) { p = p.transform(chain[i].tf); } }
		out.push({ ...inherited, d: round(p.abs().toString()) });
	}
	return out;
};

/**
 * The same file, sanitised for DISPLAY (the fidelity strip and the sheet both
 * show what the brand ships, and both pages must stay free of external
 * references, `<style>` blocks and xlink — check.mjs asserts that).
 */
export function officialSvg(file) {
	const raw = readFileSync(join(SRCDIR, file), 'utf8');
	const table = Object.fromEntries([...raw.matchAll(/\.(fil\d+)\s*\{\s*fill:\s*(#[0-9a-fA-F]{3,8})\s*\}/g)]
		.map(m => [m[1], m[2].toUpperCase()]));
	return raw
		.replace(/<\?xml[^>]*\?>/g, '').replace(/<!DOCTYPE[^>]*>/g, '')
		.replace(/<!--[\s\S]*?-->/g, '').replace(/<defs>[\s\S]*?<\/defs>/g, '')
		.replace(/<metadata[^>]*\/>/g, '')
		.replace(/class="(fil\d+)"/g, (_m, c) => `fill="${table[c] || '#000000'}"`)
		.replace(/\sxmlns:xlink="[^"]*"/g, '').replace(/\sxmlns="[^"]*"/g, '')
		.replace(/\sxml:space="[^"]*"/g, '')
		.replace(/\sstyle="[^"]*"/g, ' style="fill-rule:evenodd"')
		.replace(/\s(?:width|height)="[^"]*"/g, '')
		.trim();
}

/** simple-icons accessor: `icon('docker').path`. */
export const icon = (slug) => si['si' + slug[0].toUpperCase() + slug.slice(1)];

/** The simple-icons library version + licence, for a manifest's tooling block. */
export const simpleIconsMeta = () => {
	const pkg = JSON.parse(readFileSync(join(HERE, 'node_modules', 'simple-icons', 'package.json'), 'utf8'));
	return { version: pkg.version, license: pkg.license };
};

// ---- the optical envelope system (guide §5, one shared mass) -----------------
// wide 13.8x10.2 = 141 px², compact 12.8x12.8 = 164 px², tall 11.2x13.2 = 148 px².
// A subject may widen its envelope only where L5 forces it (docker, markdown,
// git, yaml): each is logged with the feature that forced it.
export const ENV = {
	wide: { w: 13.8, h: 10.2 },
	compact: { w: 12.8, h: 12.8 },
	tall: { w: 11.2, h: 13.2 },
	flat: { w: 15.2, h: 9.6 },
	open: { w: 13.6, h: 13.6 },                  // marks whose corners are empty (react, git, yaml)
	face: { w: 10.2, h: 8.2, cx: 8, cy: 8.35 }   // the folder face (L7)
};

/** One affine for every part of a subject. */
export function place(parts, env) {
	const out = fit(parts.map(p => p.d), {
		w: env.w, h: env.h, cx: env.cx ?? 8, cy: env.cy ?? 8
	});
	return parts.map((p, i) => ({ ...p, d: out[i] }));
}

/**
 * Bind a registry to the one builder every tool goes through. Returns the colour
 * layers (what R1 paints), the identical geometry as one flat path (what a
 * folder face knocks out white), and the provenance.
 */
export function makeMaster(S) {
	return function master(id, envOverride = null) {
		const s = S[id];
		if (!s) { throw new Error(`unknown subject ${id}`); }
		const parts = place(s.parts(), envOverride || s.env);
		// merge runs of the same fill into one <path> — geometry untouched
		const layers = [];
		for (const p of parts) {
			const last = layers[layers.length - 1];
			if (last && last.fill === p.fill) { last.d += p.d; } else { layers.push({ fill: p.fill, d: p.d }); }
		}
		const mono = parts.map(p => p.d).join('');
		const ink = unionBBox(parts.map(p => p.d));
		return { id, ...s, layers, mono, parts, ink };
	};
}

// ---- SVG emission (identical in every tool that writes an icon) --------------
export const svgDoc = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${body}</svg>`;
export const pathTag = (d, fill) => `<path fill="${fill}" d="${d}"/>`;
export const layersToBody = (ls) => ls.map(l => pathTag(l.d, l.fill)).join('');
