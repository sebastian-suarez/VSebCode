#!/usr/bin/env node
// validate.mjs — gate every production icon against ../spec.md.
//
//   node validate.mjs             # validates ../svg/**
//   node validate.mjs ../svg/file # validates one directory
//
// Checks, per file: parses as XML, <= 4096 bytes, viewBox "0 0 16 16", no <text>,
// no font-family, no external reference of any kind (http/https/url()/xlink/@import),
// no gradients/filters/masks/images, no stroke outside the sanctioned glyph exception,
// and every fill/stroke colour is a flat literal.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(DIR, '..');
const HARD_CAP = 4096;
const SOFT_CAP = 2048;

// Icons allowed to carry the canon's deliberate outlined-rect stroke (spec.md, GLYPH).
const STROKE_ALLOWED = new Set(['markdown']);

function walk(dir) {
	const out = [];
	for (const e of readdirSync(dir)) {
		const p = join(dir, e);
		if (statSync(p).isDirectory()) { out.push(...walk(p)); }
		else if (extname(p) === '.svg') { out.push(p); }
	}
	return out;
}

function check(file) {
	const id = file.split('/').pop().replace(/\.svg$/, '');
	const src = readFileSync(file, 'utf8');
	const bytes = Buffer.byteLength(src);
	const errors = [];
	const warnings = [];

	// 1. parses (structural, no DOM available in plain node: tag balance + entity sanity)
	const tags = [...src.matchAll(/<\/?([a-zA-Z][\w:-]*)/g)].map(m => m[0]);
	const stack = [];
	for (const m of src.matchAll(/<(\/?)([a-zA-Z][\w:-]*)([^>]*?)(\/?)>/g)) {
		const [, close, name, attrs, self] = m;
		if (close) {
			if (stack.pop() !== name) { errors.push(`unbalanced </${name}>`); }
		} else if (!self && !/\/$/.test(attrs)) { stack.push(name); }
	}
	if (stack.length) { errors.push(`unclosed <${stack.join('>, <')}>`); }
	if (!/^<svg[\s>]/.test(src.trim())) { errors.push('root element is not <svg>'); }
	if (tags.length === 0) { errors.push('no markup'); }

	// 2. size
	if (bytes > HARD_CAP) { errors.push(`${bytes} bytes > hard cap ${HARD_CAP}`); }
	else if (bytes > SOFT_CAP) { warnings.push(`${bytes} bytes over the ${SOFT_CAP} target`); }

	// 3. viewBox
	const vb = /viewBox\s*=\s*"([^"]*)"/.exec(src);
	if (!vb) { errors.push('no viewBox'); }
	else if (vb[1].trim().replace(/\s+/g, ' ') !== '0 0 16 16') { errors.push(`viewBox "${vb[1]}" != "0 0 16 16"`); }

	// 4. banned nodes / attributes
	if (/<text[\s>]/.test(src)) { errors.push('<text> node'); }
	if (/<tspan[\s>]/.test(src)) { errors.push('<tspan> node'); }
	if (/font-family/i.test(src)) { errors.push('font-family'); }
	if (/<(linearGradient|radialGradient|filter|mask|clipPath|pattern|image|use|style|script|foreignObject)[\s>]/i.test(src)) {
		errors.push('banned element: ' + RegExp.$1);
	}
	if (/https?:/i.test(src.replace(/xmlns(:\w+)?="[^"]*"/g, ''))) { errors.push('http(s) reference'); }
	if (/url\(/i.test(src)) { errors.push('url() reference'); }
	if (/xlink:href|(?<!xmlns:xlink=")href\s*=/.test(src)) { errors.push('href reference'); }
	if (/@import/i.test(src)) { errors.push('@import'); }

	// 5. paint is flat
	for (const m of src.matchAll(/(fill|stroke)\s*=\s*"([^"]*)"/g)) {
		const v = m[2].trim();
		if (v === 'none' || v === 'currentColor') { continue; }
		if (/^#[0-9a-fA-F]{3,8}$/.test(v)) { continue; }
		if (/^rgba?\([\d\s.,%]+\)$/.test(v)) { continue; }
		errors.push(`non-flat paint ${m[1]}="${v}"`);
	}
	if (/stroke\s*=\s*"(?!none)/.test(src) && !STROKE_ALLOWED.has(id)) {
		errors.push('stroke outside the sanctioned GLYPH exception');
	}
	if (/opacity\s*=\s*"/.test(src)) { warnings.push('opacity attribute (prefer an rgba fill)'); }

	return { id, file, bytes, errors, warnings };
}

const targets = process.argv.slice(2).length
	? process.argv.slice(2).flatMap(p => (statSync(p).isDirectory() ? walk(p) : [p]))
	: walk(join(ROOT, 'svg'));

let bad = 0, warn = 0, total = 0;
const results = targets.sort().map(check);
for (const r of results) {
	total += r.bytes;
	const rel = relative(ROOT, r.file);
	if (r.errors.length) { bad++; console.log(`FAIL ${rel}\n     ${r.errors.join('\n     ')}`); }
	else if (r.warnings.length) { warn++; console.log(`WARN ${rel}  ${r.warnings.join('; ')}`); }
}
console.log(`\n${results.length} icon(s) — ${results.length - bad} pass, ${bad} fail, ${warn} warn`);
console.log(`bytes: ${total} total, ${Math.round(total / results.length)} avg, ${Math.max(...results.map(r => r.bytes))} max (target ${SOFT_CAP}, cap ${HARD_CAP})`);
process.exit(bad ? 1 : 0);
