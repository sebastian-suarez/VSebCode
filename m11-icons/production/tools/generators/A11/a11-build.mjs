// a11-build.mjs — assemble the A11 slice SVGs into production/svg/file.
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { SVG, P, glyphLetters } from './a11-lib.mjs';
import { ICONS as A } from './a11-icons-1.mjs';
import { ICONS as B } from './a11-icons-2.mjs';
import { ICONS as C } from './a11-icons-3.mjs';

const OUT = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/svg/file';
export const ICONS = { ...A, ...B, ...C };

// --- the four letterform glyphs (§5: every typographic letter via letterpath) ---
{
	const f = ICONS.rc.fill;
	ICONS.rc.body = P(f, glyphLetters('RC', f, { cap: 7.55, cx: 8, cy: 8, tracking: -0.02 }).d);
}
{
	const f = ICONS.retext.fill;
	const a = glyphLetters('A', f, { cap: 8.4, cx: 8, cy: 6.6 });
	const wave = 'M2.6 12.4L5.3 10.9 8 12.4 10.7 10.9 13.4 12.4V13.9L10.7 12.4 8 13.9 5.3 12.4 2.6 13.9Z';
	ICONS.retext.body = P(f, a.d + wave);
}
{
	const f = ICONS.textlint.fill;
	const aa = glyphLetters('Aa', f, { cap: 7.2, cx: 8, cy: 6.8 });
	ICONS.textlint.body = P(f, aa.d + 'M2.6 12.2H13.4V13.6H2.6Z');
}
{
	const f = ICONS.svelteconfig.fill;
	ICONS.svelteconfig.body = P(f, glyphLetters('S', f, { cap: 10, cx: 8, cy: 8 }).d);
}

// --- final tints: R7 spread across the slice's GLYPH lane (a11-tint.mjs) plus the
// neutral-lane and BADGE/SILHOUETTE fixes ruled by the audit. ---
const TINT = {
 'svelteconfig': '#B84325',
 'sublime': '#E3B063',
 'sapphire-framework-cli': '#4A6FD0',
 'semgrep': '#6FB05C',
 'taplo': '#A87E5E',
 'quasar': '#4ABDC9',
 'shuttle': '#CA9B7D',
 'tsdown': '#6787AD',
 'pyup': '#5A6BA8',
 'trivy': '#8C9AD4',
 'remark': '#7A51C2',
 'puppeteer': '#419F6C',
 'tox': '#77B691',
 'taze': '#6BC27A',
 'rehype': '#A97DCA',
 'stitches': '#8350AA',
 'trigger': '#B264C9',
 'steadybit': '#B45F9F',
 'unibeautify': '#C26B97',
 'solidarity': '#AF6EAF',
 'razzle': '#C26B85',
 'rspec': '#924F57',
 'retext': '#CAAC7D',
 'rome': '#A89A88',
 'vale': '#8E96A8',
 'textlint': '#9AA08E',
 'railway': '#CED1D6',
 'shadcn': '#B9BEC6',
 'slashup': '#6656A8',
 'swc': '#5A56A0'
};
for (const [id, hex] of Object.entries(TINT)) {
	const i = ICONS[id];
	if (!i) { throw new Error(`tint: no ${id}`); }
	if (i.body) { i.body = i.body.split(i.fill).join(hex); }
	i.note = i.note.replace(i.fill, hex);
	i.fill = hex;
}

mkdirSync(OUT, { recursive: true });
const rows = [];
for (const [id, i] of Object.entries(ICONS)) {
	if (!i.body) { throw new Error(`${id}: no body`); }
	const src = SVG(i.body);
	writeFileSync(join(OUT, `${id}.svg`), src, 'utf8');
	rows.push({ id, archetype: i.archetype, fill: i.fill, bytes: Buffer.byteLength(src), note: i.note });
}
writeFileSync('/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/contact-A11-roster.json',
	JSON.stringify(Object.fromEntries(rows.map(r => [r.id, { archetype: r.archetype, fill: r.fill, note: r.note }])), null, 1) + '\n', 'utf8');
rows.sort((a, b) => b.bytes - a.bytes);
console.log(`${rows.length} icons written to ${OUT}`);
console.log(`bytes: max ${rows[0].bytes} (${rows[0].id}), avg ${Math.round(rows.reduce((s, r) => s + r.bytes, 0) / rows.length)}`);
const arch = {};
for (const r of rows) { arch[r.archetype] = (arch[r.archetype] || 0) + 1; }
console.log('archetypes:', arch);
