// a08-build.mjs — write the A08 slice icons + run the R7 report (scratch).
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROSTER, render } from './a08-roster.mjs';
import { twin, hsl } from './a08-lib.mjs';

const PROD = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production';
const work = JSON.parse(readFileSync(join(PROD, 'longtail-worklist.json'), 'utf8'));
const slice = work.slices.find(s => s.id === 'A08');
const want = slice.concepts.map(c => c.id);
const have = ROSTER.map(r => r.id);

const missing = want.filter(id => !have.includes(id));
const extra = have.filter(id => !want.includes(id));
if (missing.length) { console.log('MISSING:', missing.join(', ')); }
if (extra.length) { console.log('EXTRA:', extra.join(', ')); }
console.log(`roster ${have.length} / worklist ${want.length}`);

const dry = process.argv.includes('--dry');
let total = 0, max = 0, maxId = '';
for (const icon of ROSTER) {
	const src = render(icon);
	const bytes = Buffer.byteLength(src);
	total += bytes;
	if (bytes > max) { max = bytes; maxId = icon.id; }
	icon.bytes = bytes;
	if (!dry) { writeFileSync(join(PROD, 'svg', 'file', `${icon.id}.svg`), src, 'utf8'); }
}
console.log(`${ROSTER.length} icons — ${total} bytes total, ${Math.round(total / ROSTER.length)} avg, ${max} max (${maxId})`);

// ---- R7 ---------------------------------------------------------------------
const manifest = JSON.parse(readFileSync(join(PROD, 'set-manifest.json'), 'utf8'));
const core = manifest.icons.filter(i => i.kind === 'file');

const family = [
	['vb', 'vba', 'vbhtml', 'vbproj', 'vcxproj'],
	['visualstudio', 'vsixmanifest'],
	['xaml', 'xib'],
	['wgsl', 'wesl'],
	['wepy', 'wxml', 'wxss'],
	['xquery', 'xsl'],
	['bashly', 'bashly-settings', 'bashly-strings'],
	['bazel-ignore', 'bazel-version'],
	['bitbucket', 'bitbucketpipeline'],
	['astro-config', 'astroconfig', 'astro'],
	['vuex-store', 'vue'],
	['wit', 'wasm']
];
const sameFamily = (a, b) => family.some(f => f.includes(a) && f.includes(b));

console.log('\n--- R7 intra-slice (hard) ---');
let intra = 0;
for (let i = 0; i < ROSTER.length; i++) {
	for (let j = i + 1; j < ROSTER.length; j++) {
		const a = ROSTER[i], b = ROSTER[j];
		if (a.arch !== b.arch) { continue; }
		if (sameFamily(a.id, b.id)) { continue; }
		if (twin(a.fill, b.fill)) {
			intra++;
			console.log(`  ${a.arch}  ${a.id} ${a.fill}  ~  ${b.id} ${b.fill}`);
		}
	}
}
console.log(`  ${intra} intra-slice twin(s)${intra ? ' — SILHOUETTE pairs are form-qualified (§10.1)' : ''}`);

console.log('\n--- R7 vs core (log) ---');
for (const a of ROSTER) {
	const hits = core.filter(c => c.archetype === a.arch && !sameFamily(a.id, c.id) && twin(a.fill, c.dominant));
	if (hits.length) {
		console.log(`  ${a.id} ${a.fill} [${a.arch}] ~ ${hits.map(h => `${h.id} ${h.dominant}`).join(', ')}`);
	}
}

console.log('\n--- hue table ---');
for (const a of ROSTER) {
	const c = hsl(a.fill);
	console.log(`  ${a.id.padEnd(20)} ${a.arch.padEnd(11)} ${a.fill}  h${Math.round(c.h).toString().padStart(3)} s${Math.round(c.s).toString().padStart(3)} l${Math.round(c.l).toString().padStart(3)}${c.s < 25 ? '  (neutral)' : ''}`);
}
