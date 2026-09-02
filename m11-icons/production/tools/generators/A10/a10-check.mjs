import { ROSTER } from './a10-roster.mjs';
import { hsl, twin, report } from './a10-hsl.mjs';
import { readFileSync, existsSync } from 'node:fs';
const OUT = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/svg/file';

// families exempt from R7/R8 (R3)
const FAM = new Set(['markdownlint|markdownlint-ignore', 'nsri|nsri-integrity', 'pm2|pm2-ecosystem',
	'panda|pandacss', 'heroku|procfile', 'kubernetes|helm', 'mdxlint|mdx', 'nodemon|node',
	'preact|reactjs', 'preact|reactts', 'phpcsfixer|php', 'postcssconfig|postcss',
	'markdownlint|markdown', 'hadolint|docker']);
const fam = (a, b) => FAM.has(`${a}|${b}`) || FAM.has(`${b}|${a}`);

const roster = ROSTER.map(([id, archetype, hex]) => ({ id, archetype, hex }));
let missing = 0;
for (const r of roster) { if (!existsSync(`${OUT}/${r.id}.svg`)) { console.log('MISSING', r.id); missing++; } }

// declared dominant vs what the file actually paints
for (const r of roster) {
	const src = readFileSync(`${OUT}/${r.id}.svg`, 'utf8');
	if (!src.includes(r.hex)) { console.log('HEX MISMATCH', r.id, r.hex); }
}

const hits = report(roster).filter(([a, b]) => !fam(a, b));
const slice = hits.filter(h => h[2] === 'SLICE');
const core = hits.filter(h => h[2] === 'CORE');
console.log('\n--- R7 in-slice (HARD, must be empty except SILHOUETTE form-qualified) ---');
for (const h of slice) { console.log(' ', h[0], 'vs', h[1], h[3]); }
console.log('\n--- R7 vs core (tolerated across domains, logged) ---');
for (const h of core) { console.log(' ', h[0], 'vs', h[1], h[3]); }
console.log('\ncounts:', roster.length, 'icons;',
	['BADGE', 'GLYPH', 'SILHOUETTE'].map(a => a + ' ' + roster.filter(r => r.archetype === a).length).join(', '));
