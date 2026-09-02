#!/usr/bin/env node
// audit.mjs — set-wide reconciliation: palette twins (R7) and form collisions (R8).
//
//   node audit.mjs                # full report
//   node audit.mjs --json         # machine-readable
//   node audit.mjs --near         # also list near-misses (for judging borderline pairs)
//   node audit.mjs --pair a b     # explain one pair
//
// Reads ../set-manifest.json for archetype / colour source / batch, and re-measures every
// SVG through tools/raster.mjs, so a retint is reflected without touching the manifest.
//
// R7  two icons are twins iff same archetype AND dhue < 12 AND dL < 12 AND dS < 25.
//     Chroma (HSL S) < 25 is the neutral lane and is exempt. R3 families are exempt.
//     Folders are exempt: R9 makes the tan plate law and the emblem the discriminator.
// R8  the same recognizable shape in the same archetype for unrelated concepts collides
//     even in a different hue. Scored as the smaller of area IoU and dilated-outline IoU
//     over the 64x64 shape mask (BADGE compares the letter mask — every badge plate is
//     identical by law — against a higher bar, since letter blocks always overlap).

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rasterFills } from './raster.mjs';

const DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(DIR, '..');
const argv = process.argv.slice(2);

// R7 thresholds
const D_HUE = 12, D_LIGHT = 12, D_SAT = 25, NEUTRAL_S = 25;
// R8 thresholds, on the combined area+outline form score. Two 2-3 letter badges always
// share the same ink band, so the BADGE bar is set where only a near-identical letter
// group can reach it (the worst honest pair in the set, PS vs Rs, scores 0.84).
const IOU_COLLIDE = 0.72, IOU_COLLIDE_BADGE = 0.92, IOU_NEAR = 0.60;
// R7, SILHOUETTE lane: two silhouettes whose shapes read this far apart are separated by
// form and are a hue neighbourhood, not a twin.
const FORM_SEP = 0.55;
// READING 3 — RATIFIED by the review lead 2026-09-02; it shipped provisionally with the
// full-coverage set and is now law. Still the lead's to overrule by flipping this
// constant. At full coverage the form qualifier extends to the BADGE and GLYPH lanes for
// any pair that involves a long-tail icon; the 155-core set keeps the strict archetype
// rule among itself, exactly as the lead ruled it in rounds 1-2.
//
// This is the same argument reconciliation.md's reading 1 makes, one order of magnitude
// on: "155 icons cannot be pairwise >= 12 degrees apart in hue (that allows 30)". The set
// now holds 375 BADGEs and 262 GLYPHs, so the strict lane is arithmetic, not defect —
// measured, over the 298 core-lane hits it produces, 282 score below 0.40 on form and
// exactly ONE reaches 0.55. spec.md §11.3 already concedes the point ("the wheel cannot
// hold 1,170 pairwise-distinct file hues"); this is where that concession lands
// mechanically. Set to false to restore the strict reading and see all 298.
const LONGTAIL_FORM_QUALIFIED = true;

// R3 — sanctioned family rhymes: shared plate/hue with a different mark. Exempt from R7
// and R8. The first nine are the core set's own; everything after is the accumulated
// full-coverage list ratified by the review lead in production/assembly-v2-notes.md,
// one block per slice. Groups OVERLAP on purpose (bench-js is kin to js AND to its own
// trio), so membership is a set of group ids, not a partition — a partition would merge
// js, reactjs and typescript into one family through bench-* and exempt the three from
// each other, which is exactly the collision R7 exists to catch.
const FAMILIES = [
	// --- core (batches 1-6) ---
	['reactjs', 'reactts'], ['typescript', 'typescriptdef'], ['js', 'jsconfig'],
	['sql', 'sqlite'], ['cheader', 'cppheader'],
	['vite', 'vitest'], ['next', 'vercel'],
	// --- standing declarations (pre-wave) ---
	['testjs', 'testts', 'test-jsx'],
	['svelte', 'svelte-js', 'svelte-ts'],
	// --- A01 ---
	['java', 'jar', 'class'],
	['python', 'python-misc'],
	['actionscript', 'adobe-swc'],
	['affinity', 'affinitydesigner', 'affinityphoto', 'affinitypublisher'],
	['advpl', 'advpl-include', 'advpl-ptm', 'advpl-tlpp'],
	['al', 'al-dal'],
	['autohotkey', 'ahk2'],
	['azure', 'azurepipelines', 'azurestreamanalytics'],
	['bibliography', 'bibtex-style', 'bbx'],
	['bench-js', 'bench-jsx', 'bench-ts'],
	['js', 'bench-js'], ['reactjs', 'bench-jsx'], ['typescript', 'bench-ts'],
	['angular', 'angular-component', 'angular-directive', 'angular-guard',
		'angular-interceptor', 'angular-pipe', 'angular-resolver', 'angular-service'],
	// --- A02 ---
	['cf', 'cfc', 'cfm'],
	['c-al', 'dal'],
	['chef', 'chef-cookbook'],
	['cabal', 'haskell'],
	['csharp', 'csproj'],
	['css', 'cssmap'],
	['clojure', 'clojurescript'],
	['cypress', 'cypress-spec'],
	['dartlang', 'dartlang-generated'],
	['python', 'cython'],
	['elixir', 'eex'],
	['ruby', 'erb'],
	['xml', 'dtd'],
	['ocaml', 'dune'],
	// --- A03 ---
	['fla', 'flash'],
	['gamemaker', 'gamemaker2', 'gamemaker81'],
	['godot', 'gdscript', 'gduid', 'godot-assets', 'godotshader', 'tres', 'tscn'],
	['idris', 'idrisbin', 'idrispkg'],
	['haxe', 'haxecheckstyle', 'haxedevelop'],
	['firebasestorage', 'firestore'],
	['hashicorp', 'hcl'],
	['glsl', 'hlsl'],
	// --- A04 ---
	['tex', 'latex', 'latex-class', 'latex-package', 'lbx', 'latexmk',
		'context', 'doctex', 'doctex-installer', 'dtx'],
	// R3 pair, ruled 2026-09-02 (review lead). `.sty` IS the LaTeX package file, so round 3
	// asked whether these are one concept. They are not: the matchers do not overlap at all —
	// `sty` owns the EXTENSION `.sty`, `latex-package` owns the LANGUAGE ID `latex-package`,
	// and after R14 both resolve to their own icon, so neither is a dead twin. Declared as a
	// kin PAIR and not folded into the tex group above, because sty ships purple `#7E6FA8`
	// against the family's teal `#61BAB5` — it is kin by concept, not by hue.
	['sty', 'latex-package'],
	['lean', 'leanconfig'],
	['jsmap', 'map'],
	['marko', 'markojs'],
	['manifest', 'manifest-bak', 'manifest-skip'],
	['json', 'json5', 'jsonnet', 'json-schema'],
	['lua', 'luau'],
	// --- A05 ---
	['mvt', 'mvtcss', 'mvtjs'],
	['pascal', 'pascalproject'],
	['perl', 'perl6'],
	['objectivec', 'objectivecpp'],
	['tailwind', 'ng-tailwind'],
	['sql', 'plsql', 'plsql-package', 'plsql-package-body', 'plsql-package-header',
		'plsql-package-spec'],
	['ocaml', 'ocaml-intf', 'opam'],
	['nim', 'nimble'],
	['node', 'njsproj'],
	['python', 'numpy'], ['python', 'pip'],
	['mustache', 'nunjucks'],
	// --- A06 ---
	['powershell', 'powershell-format', 'powershell-psd', 'powershell-psm', 'powershell-types'],
	['python', 'pyscript', 'pytyped', 'pythonconfig'],
	['qbs', 'qml', 'qmldir', 'qrc'],
	['rust', 'ron', 'ra-syntax-tree', 'rust-toolchain'],
	['r', 'rmd', 'rproj'],
	['ruby', 'rake'],
	['scala', 'sbt'],
	['rescript', 'rescript-interface', 'reason'],
	['roblox', 'rbxmk'],
	['reactjs', 'reacttemplate'],
	['sass', 'scss'],
	['markdown', 'quarkdown'],
	['search', 'search-result'],
	['xml', 'rnc'],
	['redux-action', 'redux-reducer', 'redux-selector', 'redux-store'],
	['word', 'excel', 'powerpoint', 'publisher', 'access'],
	['prisma', 'prismaconfig'],
	['processing', 'processinglang'],
	// --- A08 ---
	['vb', 'vba', 'vbhtml', 'vbproj', 'vcxproj'],
	['visualstudio', 'vsix', 'vsixmanifest'],
	['xaml', 'xib'],
	['wgsl', 'wesl'],
	['wepy', 'wxml', 'wxss'],
	['xquery', 'xsl'],
	['bashly', 'bashly-hook', 'bashly-settings', 'bashly-strings'],
	['bazel', 'bazel-ignore', 'bazel-version'],
	['bitbucket', 'bitbucketpipeline'],
	['astro', 'astro-config', 'astroconfig'],
	['vue', 'vuex-store'],
	['wasm', 'wit'],
	// --- A09 ---
	['commitizen', 'commitlint'],
	['dbt', 'dbt-bouncer'],
	['deno', 'denoify'],
	['drizzle', 'drizzle-orm'],
	['expo', 'eas-metadata'],
	['go', 'go-package', 'go-work'],
	['funding', 'github-sponsors'],
	['bun', 'bunfig'],
	['cursor', 'cursorrules'],
	['dartlang', 'dartlang-ignore'],
	['firebase', 'firebasehosting'],
	['graphql', 'graphql-config'],
	['dotenv', 'direnv'],
	['container', 'devcontainer'],
	// --- A10 ---
	['markdownlint', 'markdownlint-ignore'],
	['nsri', 'nsri-integrity'],
	['pm2', 'pm2-ecosystem'],
	['panda', 'pandacss'],
	['heroku', 'procfile'],
	['kubernetes', 'helm'],
	['mdx', 'mdxlint', 'mdx-components'],
	['node', 'nodemon'],
	['reactjs', 'preact'],
	['php', 'phpcsfixer'],
	['postcss', 'postcssconfig'],
	['docker', 'hadolint'],
	// --- A11 ---
	['svelte', 'svelteconfig'],
	// --- A12 ---
	['vscode', 'vscode-test'],
	['vue', 'vueconfig'],
	['typescript', 'tsdoc'], ['typescript', 'typedoc'],
	['markdown', 'markdoc', 'markdoc-config'],
	['reactjs', 'svgr'],
	// --- folder slices (F01, F03, F04) ---
	['gemini', 'gemini-ai'],
	['interface', 'interfaces'],
	['gh-workflows', 'gitea-workflows'],
	['ngrx-actions', 'ngrx-effects', 'ngrx-entities', 'ngrx-entity', 'ngrx-reducer',
		'ngrx-selectors', 'ngrx-state', 'ngrx-store']
];

// Alias pairs — duplicate matchers in the merged inventory that resolve to the SAME
// artwork by design (the theme builder maps both keys at one definition). Byte-identical
// SVGs are not an R8 collision; flagging them would be flagging a decision.
const ALIASES = [
	['astro-config', 'astroconfig'],
	['bitbucket', 'bitbucketpipeline'],
	['panda', 'pandacss'],
	['marko', 'markojs']
];

// Residuals ruled acceptable. Key is the sorted pair, value is the reason printed by the
// report. Everything below the core block is a slice-review ruling carried over from
// production/assembly-v2-notes.md — each one was seen and ratified when its slice shipped.
const ACCEPTED = new Map(Object.entries({
	// --- core set, rounds 1-2 ---
	'generic-archive|zip': 'R8 accepted: the generic tier is dimmer by design (generic-archive is the fallback for 6 concepts, zip is the named concept)',
	'font|generic-font': 'R8 accepted, same precedent: generic-font is the dim fallback for the 3 non-core font concepts, font is the named concept',
	'css|html': 'R8 accepted + flagged: both real logos are shields and spec.md §3 gives html the canon css geometry on purpose; separated by hue (#1572B6 / #DB5430) and by the 3 / 5 letterform',
	'npm|yaml': 'R10a ruled exception (Sebastian, 2026-09-01): yaml is brand-true #CB171E, brand fidelity over separation. The R7 twin against canon npm #CB3837 is knowingly accepted; separation rests on the YML / npm letter groups and the small value gap',
	// --- A01 ---
	'debian|turborepo': 'A01 ruling: GLYPH, marks and domains separate; the only legal spot that keeps Debian brand-adjacent',
	// --- A04 ---
	'jinja|npm': 'A04 tolerated: template engine vs package manifest, different domains',
	'jinja|rust': 'A04 tolerated: template engine vs systems language, different domains',
	'kusto|typescript': 'A04 tolerated: query language vs core language badge',
	'cpp|less': 'A04 tolerated: stylesheet preprocessor vs systems language',
	'less|perl': 'A04 tolerated: stylesheet preprocessor vs scripting language',
	'lit|powershell': 'A04 tolerated: web-component library vs shell',
	'maya|sqlite': 'A04 tolerated: 3D suite vs embedded database',
	'mdsvex|rust': 'A04 tolerated: deliberate svelte-hue for mdsvex',
	'git|mojo': 'A04 tolerated: VCS vs language, different domains',
	'jupyter|mojo': 'A04 tolerated: notebook vs language, different domains',
	'cypress|lisp': 'A04 tolerated: brand-mandated on both sides',
	// --- A05 ---
	'django|phalcon': 'A05 ruling: PHP and Python frameworks almost never co-occur; letters differ',
	'plsql-package|rust': 'A05 ruling: brand-true on both sides (R10a precedent); Oracle + Cargo co-occurrence is nil',
	'plsql-package-body|rust': 'A05 ruling: same, the plsql-package quartet is brand-true',
	'plsql-package-header|rust': 'A05 ruling: same, the plsql-package quartet is brand-true',
	'plsql-package-spec|rust': 'A05 ruling: same, the plsql-package quartet is brand-true',
	// --- A06 ---
	'npm|rescript': 'A06 ruling: kept brand-true per the R10a reasoning',
	'postcss|rss': 'A06 ruling: kept per spec §11.2 (recognized hue wins)',
	// --- A07 ---
	'postcss|typo3': 'A07 tolerated §11.3 residual: GLYPH, dh 11 / dl 4 / ds 9, form .12 — the forms read nothing alike',
	'svelte|typo3': 'A07 tolerated §11.3 residual: GLYPH, dh 3 / dl 12 / ds 6, form .12',
	// --- A08 ---
	'cpp|xcode': 'A08 deliberate trade: xcode #26588A twins cpp rather than typescript, on the co-occurrence argument',
	// --- A11 ---
	'railway|shadcn': 'A11 ruling: neutral-lane pair accepted (silver precedent + letter separation)',
	'remix|unocss': 'A11 ruling: neutral-lane pair accepted (silver precedent + letter separation)',
	// --- A03 ---
	'hy|svg': 'A03 tolerated: the tightest of its 49 cross-domain pairs, dH 1.1 — the letters separate them'
}));

// Membership is a SET of group ids so overlapping declarations do not merge (see FAMILIES).
const familyOf = new Map();
const addGroups = (groups, offset) => groups.forEach((f, i) => f.forEach(id => {
	if (!familyOf.has(id)) { familyOf.set(id, new Set()); }
	familyOf.get(id).add(offset + i);
}));
addGroups(FAMILIES, 0);
addGroups(ALIASES, FAMILIES.length);
const aliasOf = new Map();
ALIASES.forEach(g => g.forEach(id => aliasOf.set(id, g[0])));
function sameFamily(a, b) {
	const x = familyOf.get(a), y = familyOf.get(b);
	if (!x || !y) { return false; }
	for (const g of x) { if (y.has(g)) { return true; } }
	return false;
}
const pairKey = (a, b) => [a, b].sort().join('|');

// ---- colour ----------------------------------------------------------------

export function hsl(hex) {
	const r = parseInt(hex.slice(1, 3), 16) / 255;
	const g = parseInt(hex.slice(3, 5), 16) / 255;
	const b = parseInt(hex.slice(5, 7), 16) / 255;
	const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
	const l = (mx + mn) / 2;
	let h = 0;
	if (d) {
		if (mx === r) { h = ((g - b) / d) % 6; }
		else if (mx === g) { h = (b - r) / d + 2; }
		else { h = (r - g) / d + 4; }
		h *= 60;
		if (h < 0) { h += 360; }
	}
	const s = d ? d / (1 - Math.abs(2 * l - 1)) : 0;
	return { h, s: s * 100, l: l * 100 };
}
const dHue = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };

// ---- data ------------------------------------------------------------------

const manifest = JSON.parse(readFileSync(join(ROOT, 'set-manifest.json'), 'utf8'));
const measured = await rasterFills(manifest.icons.map(i =>
	({ kind: i.kind, id: i.id, path: join(ROOT, 'svg', i.kind, `${i.id}.svg`) })));

// ---- §11 scoping ------------------------------------------------------------
//
// spec.md §11.3: the wheel cannot hold 1,161 pairwise-distinct file hues, so R7 is HARD
// within a domain and TOLERATED across domains that rarely share a directory. Two things
// define the hard lane here:
//
//   * the 155-core set (contact-batch1..6) — core icons are the ones a repo root actually
//     shows, so EVERY pair that touches a core icon is judged at the core's own rules;
//   * the domain, read off longtail-worklist.json's `category` (code / config / data /
//     doc / font / image / media / archive / binary) plus the declared R3 domain families.
//
// R8 is unscoped: the same mark for two unrelated concepts is a defect wherever it lands.
const CORE_BATCHES = new Set(['batch1', 'batch2', 'batch3', 'batch4', 'batch5', 'batch6', 'canon', 'folders']);
const domainOf = new Map();
{
	const wl = join(ROOT, 'longtail-worklist.json');
	if (existsSync(wl)) {
		for (const s of JSON.parse(readFileSync(wl, 'utf8')).slices) {
			for (const c of s.concepts) { domainOf.set(`${c.kind}/${c.id}`, c.category ?? 'unknown'); }
		}
	}
}

// --try id=#HEX,… — score a retint before it touches disk. A retint never changes form,
// so swapping the dominant in memory is exactly equivalent to editing the SVG.
const TRY = new Map();
if (argv.includes('--try')) {
	for (const spec of (argv[argv.indexOf('--try') + 1] ?? '').split(',').filter(Boolean)) {
		const [id, hex] = spec.split('=');
		TRY.set(id, hex.toUpperCase());
	}
}

const icons = manifest.icons.map(i => {
	const m = measured.get(`${i.kind}/${i.id}`);
	const dominant = (i.kind === 'file' && TRY.get(i.id)) || m.dominant;
	// BADGE plates are identical by law, so the letters are the form; everything else is
	// judged on its whole silhouette. A FOLDER's plate is law too (R9), so its emblem —
	// the ink that is not the tan — is what carries its identity.
	const form = (i.archetype === 'BADGE' || i.kind === 'folder') && m.mark.includes('1') ? m.mark : m.ink;
	const core = CORE_BATCHES.has(i.batch);
	return { ...i, dominant, coverage: m.coverage, hsl: hsl(dominant), form, mask: m.mask,
		bytes: m.bytes, core, domain: core ? 'core' : (domainOf.get(`${i.kind}/${i.id}`) ?? 'unknown') };
});
const byId = new Map(icons.map(i => [`${i.kind}/${i.id}`, i]));
const file = (id) => byId.get(`file/${id}`);

/**
 * Is this pair inside R7's HARD lane (§11.3)?
 *
 * Either side core always counts: the 155-core set is what a repo root actually shows,
 * so every pair touching it is judged at the core's own rules. What separates the two
 * long-tail readings is how wide "within-domain" is drawn:
 *
 *   --scope slice  (default, spec §11.3 as written: "HARD within your own slice")
 *       RATIFIED by the review lead 2026-09-02; shipped provisionally, now law.
 *       the slice is the unit an authoring agent could actually control.
 *   --scope domain (longtail-worklist.json `category`)
 *       measured and reported, not shipped: `code` alone holds 629 icons across A01-A08
 *       and `config` 297 across A08-A12, so this asks 262 GLYPHs to be pairwise >= 12
 *       degrees apart on a 360-degree wheel — which admits 30. See the run banner for
 *       what each reading costs.
 */
const SCOPE = argv.includes('--scope') ? argv[argv.indexOf('--scope') + 1] : 'slice';
const inScope = {
	slice: (A, B) => A.core || B.core || A.batch === B.batch,
	domain: (A, B) => A.core || B.core || A.domain === B.domain,
	all: () => true
};
if (!inScope[SCOPE]) { console.error(`unknown --scope "${SCOPE}" (slice | domain | all)`); process.exit(2); }
const hardScope = inScope[SCOPE];

// ---- form scoring, as bitsets ----------------------------------------------
//
// 1,161 file icons is 241k same-archetype pairs; scoring those on 4,096-character
// strings is minutes of work. The masks become 128-word bitsets once, and the IoU is
// popcount over AND / OR — the same number, three orders of magnitude cheaper.

const WORDS = 128;   // 64 x 64 bits
const bitsOf = new Map();
function bits(mask) {
	let v = bitsOf.get(mask);
	if (v) { return v; }
	v = new Uint32Array(WORDS);
	for (let i = 0; i < mask.length; i++) {
		if (mask.charCodeAt(i) === 49) { v[i >>> 5] |= 1 << (i & 31); }
	}
	bitsOf.set(mask, v);
	return v;
}
function popcount(x) {
	x -= (x >>> 1) & 0x55555555;
	x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
	x = (x + (x >>> 4)) & 0x0f0f0f0f;
	return (Math.imul(x, 0x01010101) >>> 24);
}
function iouBits(a, b) {
	let inter = 0, union = 0;
	for (let i = 0; i < WORDS; i++) {
		inter += popcount(a[i] & b[i]);
		union += popcount(a[i] | b[i]);
	}
	return union ? inter / union : 0;
}
function iou(a, b) { return iouBits(bits(a), bits(b)); }

/**
 * Outline of a mask, dilated by one cell. Area IoU alone cannot tell a shield from a
 * page from a disc — three different solids of similar area overlap by ~0.8. The
 * outline is what the eye actually reads, so form similarity is scored on it.
 */
const outlines = new Map();
function outline(mask, M) {
	if (outlines.has(mask)) { return outlines.get(mask); }
	const at = (x, y) => (x < 0 || y < 0 || x >= M || y >= M ? '0' : mask[y * M + x]);
	const edge = new Uint8Array(M * M);
	for (let y = 0; y < M; y++) {
		for (let x = 0; x < M; x++) {
			if (at(x, y) !== '1') { continue; }
			if (at(x - 1, y) === '0' || at(x + 1, y) === '0' || at(x, y - 1) === '0' || at(x, y + 1) === '0') {
				edge[y * M + x] = 1;
			}
		}
	}
	const out = new Array(M * M).fill('0');
	for (let y = 0; y < M; y++) {
		for (let x = 0; x < M; x++) {
			if (!edge[y * M + x]) { continue; }
			for (let dy = -1; dy <= 1; dy++) {
				for (let dx = -1; dx <= 1; dx++) {
					const nx = x + dx, ny = y + dy;
					if (nx >= 0 && ny >= 0 && nx < M && ny < M) { out[ny * M + nx] = '1'; }
				}
			}
		}
	}
	const s = out.join('');
	outlines.set(mask, s);
	return s;
}

/**
 * Form similarity: both the filled area and the outline have to agree, so the score is
 * the smaller of the two. `floor` is an early exit — sim can never exceed area, so an
 * area below every bar we test against makes the outline pass pointless. 0.55 is the
 * lowest bar in the file (FORM_SEP); IOU_NEAR is 0.60.
 */
function formSim(A, B, floor = FORM_SEP) {
	const area = iouBits(bits(A.form), bits(B.form));
	if (area < floor) { return { area, edge: area, sim: area, early: true }; }
	const edge = iouBits(bits(outline(A.form, A.mask)), bits(outline(B.form, B.mask)));
	return { area, edge, sim: Math.min(area, edge) };
}

// ---- R7: palette twins ------------------------------------------------------

const twins = [], separated = [], nearTwins = [], tolerated = [];
const files = icons.filter(i => i.kind === 'file');
// index by archetype: the pairwise loops only ever compare like with like, and skipping
// 1.3 M archetype-mismatched iterations is most of the run time at full coverage
const byArchetype = new Map();
for (const i of files) {
	if (!byArchetype.has(i.archetype)) { byArchetype.set(i.archetype, []); }
	byArchetype.get(i.archetype).push(i);
}

for (const lane of byArchetype.values()) {
	for (let a = 0; a < lane.length; a++) {
		for (let b = a + 1; b < lane.length; b++) {
			const A = lane[a], B = lane[b];
			if (sameFamily(A.id, B.id)) { continue; }
			if (A.hsl.s < NEUTRAL_S || B.hsl.s < NEUTRAL_S) { continue; }   // neutral lane
			const dh = dHue(A.hsl.h, B.hsl.h), dl = Math.abs(A.hsl.l - B.hsl.l), ds = Math.abs(A.hsl.s - B.hsl.s);
			if (!(dh < D_HUE && dl < D_LIGHT && ds < D_SAT)) {
				if (hardScope(A, B) && dh < D_HUE * 1.5 && dl < D_LIGHT * 1.4 && ds < D_SAT * 1.4) {
					nearTwins.push({ a: A.id, b: B.id, archetype: A.archetype, dh, dl, ds, ...formSim(A, B) });
				}
				continue;
			}
			const f = formSim(A, B);
			const rec = { a: A.id, b: B.id, archetype: A.archetype, dh, dl, ds, ...f,
				domains: `${A.domain}/${B.domain}` };
			// A BADGE is a plate (§6: "two badges in the same hue do not" separate) and a GLYPH
			// is thin ink on nothing — in both, hue IS the read at 16 px, so any colour hit is a
			// twin. A SILHOUETTE carries a distinctive object shape, so a colour hit is a twin
			// only when the shapes do not read apart either (see FORM_SEP).
			const formQualified = A.archetype === 'SILHOUETTE'
				|| (LONGTAIL_FORM_QUALIFIED && !(A.core && B.core));   // reading 3
			if (formQualified && f.sim < FORM_SEP) { separated.push(rec); }
			else if (hardScope(A, B)) { twins.push(rec); }
			else { tolerated.push(rec); }   // §11.3 cross-domain long-tail lane
		}
	}
}

// twin clusters: a chain of twin pairs is one problem, not N problems
function cluster(pairs) {
	const parent = new Map();
	const find = (x) => { while (parent.get(x) !== x) { parent.set(x, parent.get(parent.get(x))); x = parent.get(x); } return x; };
	for (const p of pairs) { for (const id of [p.a, p.b]) { if (!parent.has(id)) { parent.set(id, id); } } }
	for (const p of pairs) { parent.set(find(p.a), find(p.b)); }
	const groups = new Map();
	for (const p of pairs) {
		const k = find(p.a);
		if (!groups.has(k)) { groups.set(k, { members: new Set(), pairs: [] }); }
		groups.get(k).members.add(p.a); groups.get(k).members.add(p.b); groups.get(k).pairs.push(p);
	}
	return [...groups.values()].map(g => ({ members: [...g.members].sort(), pairs: g.pairs }));
}

// ---- R8: form collisions ----------------------------------------------------

// R8 is unscoped by §11.3 — "the same mark, same archetype" is a defect wherever the two
// concepts live. Only declared families and alias pairs are exempt.
const forms = [], nearForms = [];
for (const lane of byArchetype.values()) {
	for (let a = 0; a < lane.length; a++) {
		for (let b = a + 1; b < lane.length; b++) {
			const A = lane[a], B = lane[b];
			if (sameFamily(A.id, B.id)) { continue; }
			const bar = A.archetype === 'BADGE' ? IOU_COLLIDE_BADGE : IOU_COLLIDE;
			const f = formSim(A, B, IOU_NEAR);
			if (f.sim >= bar) {
				forms.push({ a: A.id, b: B.id, archetype: A.archetype, ...f, domains: `${A.domain}/${B.domain}` });
			} else if (f.sim >= IOU_NEAR) {
				nearForms.push({ a: A.id, b: B.id, archetype: A.archetype, ...f, domains: `${A.domain}/${B.domain}` });
			}
		}
	}
}

// folders: the plate is law (R9), so the emblem carries the identity. Two checks —
// the emblem DESCRIPTION (cheap, catches two slices naming the same object) and the
// emblem GEOMETRY through the same R8 form score, which is what the F04 cross-slice
// checklist actually needs: six folder slices ran concurrently and none could see the
// others' emblems.
const folderEmblems = new Map();
const closedFolders = icons.filter(i => i.kind === 'folder' && !i.id.endsWith('-open'));
for (const f of closedFolders) {
	const k = (f.emblem ?? '').toLowerCase().trim();
	if (!k || k.startsWith('none')) { continue; }
	if (!folderEmblems.has(k)) { folderEmblems.set(k, []); }
	folderEmblems.get(k).push(f.id);
}
// a declared family that shares one mark in two hues (F03's gh-workflows / gitea-workflows)
// is a rhyme, not a duplicate
const folderDupes = [...folderEmblems.entries()].filter(([, v]) =>
	v.length > 1 && v.some((x, i) => v.some((y, j) => i !== j && !sameFamily(x, y))));

const folderForms = [], folderNearForms = [];
for (let a = 0; a < closedFolders.length; a++) {
	for (let b = a + 1; b < closedFolders.length; b++) {
		const A = closedFolders[a], B = closedFolders[b];
		if (sameFamily(A.id, B.id)) { continue; }
		if (!A.form.includes('1') || !B.form.includes('1')) { continue; }   // the canon bare pair
		const f = formSim(A, B, IOU_NEAR);
		if (f.sim >= IOU_COLLIDE) { folderForms.push({ a: A.id, b: B.id, archetype: 'FOLDER', ...f }); }
		else if (f.sim >= IOU_NEAR) { folderNearForms.push({ a: A.id, b: B.id, archetype: 'FOLDER', ...f }); }
	}
}

// ---- report -----------------------------------------------------------------

const accepted = (r) => ACCEPTED.get(pairKey(r.a, r.b));
const openTwins = twins.filter(t => !accepted(t));
const openForms = forms.filter(f => !accepted(f));
const openFolderForms = folderForms.filter(f => !accepted(f));

// The matte band (§6): retints are searched inside it, never outside.
const MATTE = { sMin: 26, sMax: 72, lMin: 32, lMax: 70 };
// A retint must not land ON the R7 threshold — it clears it by this much.
const MARGIN = 1.1;

/** Does colour `c` clear every R7 conflict for icon `me`, against `pool`? */
function clears(me, c, pool, margin = 1) {
	if (c.s < NEUTRAL_S) { return true; }                    // neutral lane
	for (const r of pool) {
		if (r.id === me.id || r.archetype !== me.archetype || sameFamily(r.id, me.id)) { continue; }
		if (r.hsl.s < NEUTRAL_S) { continue; }
		if (me.archetype === 'SILHOUETTE' && formSim(me, r).sim < FORM_SEP) { continue; }
		if (dHue(c.h, r.hsl.h) < D_HUE * margin && Math.abs(c.l - r.hsl.l) < D_LIGHT * margin
			&& Math.abs(c.s - r.hsl.s) < D_SAT * margin) { return false; }
	}
	return true;
}

/**
 * A brand icon may be lightened, darkened or muted, but not re-hued — its hue IS the
 * brand. An icon whose colour source says "no brand" is free to move anywhere.
 */
const HUE_LOCK = argv.includes('--hue-lock') ? +argv[argv.indexOf('--hue-lock') + 1] : 360;
const hueLocked = (i) => /brand|canon|family/.test(i.colourSource ?? '') && !/no brand/.test(i.colourSource ?? '');

/** Clear colours for `me`, ordered by distance from `anchor`, coarse-deduplicated. */
function candidates(me, anchor, pool, n = 12) {
	const lock = hueLocked(me) ? HUE_LOCK : 360;
	// Desaturating to escape a twin just makes mud, so S is the dearest axis; a darker or
	// lighter version of the same brand hue still reads as the brand, so L is the cheapest.
	const cost = (c) => dHue(c.h, anchor.h) * 1.4 + Math.abs(c.l - anchor.l) * 1.0 + Math.abs(c.s - anchor.s) * 2.2;
	const hits = [];
	for (let h = 0; h < 360; h += 1) {
		for (let s = MATTE.sMin; s <= MATTE.sMax; s += 1) {
			for (let l = MATTE.lMin; l <= MATTE.lMax; l += 1) {
				const c = { h, s, l };
				if (dHue(h, me.hsl.h) > lock) { continue; }
				if (clears(me, c, pool, MARGIN)) { hits.push({ c, cost: cost(c) }); }
			}
		}
	}
	hits.sort((a, b) => a.cost - b.cost);
	const out = [], seen = new Set();
	for (const x of hits) {
		const bucket = `${Math.round(x.c.h / 6)}|${Math.round(x.c.l / 6)}`;
		if (seen.has(bucket)) { continue; }
		seen.add(bucket);
		out.push({ ...x, hex: toHex(x.c) });
		if (out.length >= n) { break; }
	}
	return out;
}

const brandOf = (i) => {
	const m = /#[0-9A-Fa-f]{6}/.exec(i.colourSource ?? '');
	return m ? m[0].toUpperCase() : i.dominant;
};

// --suggest id [--anchor #HEX] — the closest colours to the anchor that clear every R7
// conflict this icon has, so a retint can be chosen by evidence rather than by eye.
if (argv.includes('--suggest')) {
	// --suggest id[=#ANCHOR][,id…] — one or many, each optionally anchored on a hex of
	// your choosing (default: the brand hex named in the icon's colour source).
	for (const spec of (argv[argv.indexOf('--suggest') + 1] ?? '').split(',').filter(Boolean)) {
		const [id, hex] = spec.split('=');
		const me = file(id);
		if (!me) { console.error(`unknown file icon "${id}"`); process.exit(2); }
		const anchor = hsl((hex ?? brandOf(me)).toUpperCase());
		console.log(`\n${id} (${me.archetype}) now ${me.dominant} h${me.hsl.h.toFixed(0)} s${me.hsl.s.toFixed(0)} l${me.hsl.l.toFixed(0)}  [${me.colourSource}]`);
		console.log(`  anchor h${anchor.h.toFixed(0)} s${anchor.s.toFixed(0)} l${anchor.l.toFixed(0)} — nearest clear colours:`);
		for (const x of candidates(me, anchor, files)) {
			console.log(`    ${x.hex}  h${String(x.c.h).padStart(3)} s${String(x.c.s).padStart(2)} l${String(x.c.l).padStart(2)}  cost ${x.cost.toFixed(1)}`);
		}
	}
	process.exit(0);
}

// --plan --movable id,id,… — greedy minimal retint plan. The movable list is ordered
// least-brand-anchored first; the planner only ever moves the most-movable member of a
// twin pair, and always to the colour nearest that icon's own brand anchor.
if (argv.includes('--plan')) {
	const movable = (argv[argv.indexOf('--movable') + 1] ?? '').split(',').filter(Boolean);
	const max = argv.includes('--max') ? +argv[argv.indexOf('--max') + 1] : movable.length;
	const rank = new Map(movable.map((id, i) => [id, i]));
	const pool = files.map(i => ({ ...i }));
	const plan = [];
	for (let pass = 0; pass < max; pass++) {
		const open = [];
		for (let a = 0; a < pool.length; a++) {
			for (let b = a + 1; b < pool.length; b++) {
				const A = pool[a], B = pool[b];
				if (A.archetype !== B.archetype || sameFamily(A.id, B.id)) { continue; }
				if (A.hsl.s < NEUTRAL_S || B.hsl.s < NEUTRAL_S) { continue; }
				const dh = dHue(A.hsl.h, B.hsl.h), dl = Math.abs(A.hsl.l - B.hsl.l), ds = Math.abs(A.hsl.s - B.hsl.s);
				if (!(dh < D_HUE && dl < D_LIGHT && ds < D_SAT)) { continue; }
				if (A.archetype === 'SILHOUETTE' && formSim(A, B).sim < FORM_SEP) { continue; }
				open.push([A, B]);
			}
		}
		if (!open.length) { break; }
		// the icon that is both movable and involved in the most open pairs goes first
		const load = new Map();
		for (const [A, B] of open) { for (const X of [A, B]) { load.set(X.id, (load.get(X.id) ?? 0) + 1); } }
		const target = [...load.keys()].filter(id => rank.has(id))
			.sort((x, y) => (load.get(y) - load.get(x)) || (rank.get(x) - rank.get(y)))[0];
		if (!target) { break; }
		const me = pool.find(i => i.id === target);
		// anchor on the icon's current colour: every current colour already passed its own
		// batch review, so the smallest move away from it is the least disruptive fix.
		const [best] = candidates(me, me.hsl, pool, 1);
		if (!best) { plan.push({ id: target, from: me.dominant, to: null }); rank.delete(target); continue; }
		plan.push({ id: target, from: me.dominant, to: best.hex, pairs: load.get(target), anchor: brandOf(me) });
		me.dominant = best.hex; me.hsl = hsl(best.hex);
		rank.delete(target);
	}
	console.log(`plan — ${plan.length} retint(s)`);
	for (const p of plan) {
		console.log(`  ${p.id.padEnd(16)} ${p.from} -> ${p.to ?? 'NO CLEAR COLOUR IN THE MATTE BAND'}  `
			+ `(anchor ${p.anchor}, was in ${p.pairs} open pair(s))`);
	}
	console.log(`\n--try ${plan.filter(p => p.to).map(p => `${p.id}=${p.to}`).join(',')}`);
	process.exit(0);
}

function toHex({ h, s, l }) {
	const S = s / 100, L = l / 100;
	const c = (1 - Math.abs(2 * L - 1)) * S, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = L - c / 2;
	const t = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x]
		: h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
	return '#' + t.map(v => Math.round((v + m) * 255).toString(16).padStart(2, '0').toUpperCase()).join('');
}

if (argv.includes('--pair')) {
	const [x, y] = argv.slice(argv.indexOf('--pair') + 1);
	const A = file(x), B = file(y);
	if (!A || !B) { console.error('unknown id'); process.exit(2); }
	const dh = dHue(A.hsl.h, B.hsl.h), dl = Math.abs(A.hsl.l - B.hsl.l), ds = Math.abs(A.hsl.s - B.hsl.s);
	const f = (i) => `${i.id} ${i.dominant} ${i.archetype} h${i.hsl.h.toFixed(0)} s${i.hsl.s.toFixed(0)} l${i.hsl.l.toFixed(0)}`;
	console.log(f(A)); console.log(f(B));
	console.log(`dh ${dh.toFixed(1)}  dl ${dl.toFixed(1)}  ds ${ds.toFixed(1)}  iou ${iou(A.form, B.form).toFixed(3)}`);
	console.log(`R7 twin: ${A.archetype === B.archetype && A.hsl.s >= NEUTRAL_S && B.hsl.s >= NEUTRAL_S
		&& dh < D_HUE && dl < D_LIGHT && ds < D_SAT ? 'YES' : 'no'}${sameFamily(A.id, B.id) ? ' (R3 family, exempt)' : ''}`);
	const M = A.mask;
	for (let r = 0; r < M; r++) {
		console.log(A.form.slice(r * M, (r + 1) * M).replace(/0/g, '.').replace(/1/g, '#') + '  '
			+ B.form.slice(r * M, (r + 1) * M).replace(/0/g, '.').replace(/1/g, '#'));
	}
	process.exit(0);
}

if (argv.includes('--json')) {
	console.log(JSON.stringify({ twins, separated, nearTwins, tolerated, forms, nearForms,
		folderDupes, folderForms, folderNearForms, clusters: cluster(openTwins) }, null, '\t'));
	process.exit(0);
}

const hexOf = (id) => (file(id) ?? byId.get(`folder/${id}`)).dominant;
const row = (r) => `  ${r.a.padEnd(24)} ${r.b.padEnd(24)} ${r.archetype.padEnd(11)} `
	+ `${hexOf(r.a)} ${hexOf(r.b)}  `
	+ (r.dh !== undefined ? `dh ${r.dh.toFixed(1).padStart(5)} dl ${r.dl.toFixed(1).padStart(5)} ds ${r.ds.toFixed(1).padStart(5)}  ` : '')
	+ `form ${r.sim.toFixed(2)} (area ${r.area.toFixed(2)} edge ${r.edge.toFixed(2)})`
	+ (r.domains ? `  [${r.domains}]` : '');

console.log(`M11 set audit — ${icons.length} icons (${files.length} file, ${icons.length - files.length} folder)`);
console.log(`R7 thresholds: dhue<${D_HUE} dL<${D_LIGHT} dS<${D_SAT}, neutral lane S<${NEUTRAL_S}`);
console.log(`R7 SILHOUETTE lane: a colour hit whose form score is < ${FORM_SEP} is separated by form`);
if (LONGTAIL_FORM_QUALIFIED) {
	console.log('R7 READING 3 (RATIFIED 2026-09-02): the form qualifier extends to BADGE and'
		+ ' GLYPH for any pair involving a long-tail icon; core-vs-core keeps the strict rule');
}
console.log(`R7 §11.3 scope --scope ${SCOPE}: HARD when either side is core (${files.filter(f => f.core).length} icons)`
	+ (SCOPE === 'slice' ? ' or both come from one authoring slice' : SCOPE === 'domain' ? ' or both share a worklist domain' : '')
	+ '; everything else is the tolerated lane');
console.log(`R8 threshold: form score >= ${IOU_COLLIDE} (BADGE ${IOU_COLLIDE_BADGE}), unscoped; ${FAMILIES.length} R3 families + ${ALIASES.length} alias pairs exempt\n`);

console.log(`== R7 palette twins (HARD lane): ${openTwins.length} open, ${twins.length - openTwins.length} accepted ==`);
for (const c of cluster(openTwins)) {
	console.log(` cluster {${c.members.join(', ')}}`);
	for (const p of c.pairs) { console.log(row(p)); }
}
if (!openTwins.length) { console.log('  none'); }

console.log(`\n== R8 form collisions, files: ${openForms.length} open, ${forms.length - openForms.length} accepted ==`);
for (const f of openForms) { console.log(row(f)); }
if (!openForms.length) { console.log('  none'); }

// R9b — RULED 2026-09-02 (review lead): this lane does NOT gate. `--folders-hard` stays
// available and stays off by default.
//
// Two independent reasons, both in spec.md R9b. First, folder emblems MAY share
// construction where the concepts share the container metaphor: bloc / ngrx-store /
// devcontainer / vm are four things that each hold something, and an honest concept rhyme
// is separated by hue and by the context a folder name arrives in, exactly as an R3 family
// is. Second, the bar is uncalibrated at this scale. 0.72 is the file SILHOUETTE bar,
// measured on full-size objects; an emblem is a simple shape in an 8.20 box, and the
// outline term — the thing that tells a shield from a page from a disc at full size —
// stops discriminating when every candidate outline is the same circle: atom (nucleus in
// orbit), target (bullseye) and deprecated (slashed circle) score 0.73-0.85 against each
// other while reading as three different objects. That false cluster is the proof.
// The lane keeps reporting, because a measured bar for 8.20 px geometry would make it
// gate; until someone measures one, a file-scale number is not evidence about emblems.
const FOLDERS_HARD = argv.includes('--folders-hard');
console.log(`\n== R8 folder emblems (R9b: ${FOLDERS_HARD ? 'gating, --folders-hard' : 'reported only, does not gate - ruled 2026-09-02'}): `
	+ `${openFolderForms.length} at or over ${IOU_COLLIDE}, ${folderNearForms.length} near ==`);
for (const f of openFolderForms) { console.log(row(f)); }
if (!openFolderForms.length) { console.log('  none'); }

if (twins.length - openTwins.length || forms.length - openForms.length || folderForms.length - openFolderForms.length) {
	console.log('\n== accepted residuals ==');
	for (const r of [...twins, ...forms, ...folderForms].filter(accepted)) {
		console.log(`  ${r.a} / ${r.b} — ${accepted(r)}`);
	}
}

console.log(`\n== R7 §11.3 tolerated lane (cross-domain long-tail): ${tolerated.length} pair(s) ==`);
{
	const byDomains = new Map();
	for (const t of tolerated) {
		const k = t.domains.split('/').sort().join(' / ');
		byDomains.set(k, (byDomains.get(k) ?? 0) + 1);
	}
	for (const [k, n] of [...byDomains].sort((x, y) => y[1] - x[1])) { console.log(`  ${k.padEnd(24)} ${n}`); }
	if (!tolerated.length) { console.log('  none'); }
	if (argv.includes('--tolerated')) { for (const t of tolerated) { console.log(row(t)); } }
}

console.log(`\n== R7 colour hits separated by form (${separated.length}, SILHOUETTE lane) ==`);
console.log(`  ${cluster(separated).length} hue neighbourhood(s); largest ${Math.max(0, ...cluster(separated).map(c => c.members.length))} icons`);

if (folderDupes.length) {
	console.log('\n== folder emblems described identically ==');
	for (const [k, v] of folderDupes) { console.log(`  ${v.join(', ')} — "${k}"`); }
}

if (argv.includes('--near')) {
	console.log(`\n== R7 near-misses (${nearTwins.length}) ==`);
	for (const p of nearTwins.sort((x, y) => x.dh - y.dh)) { console.log(row(p)); }
	console.log(`\n== R8 near-misses, files (${nearForms.length}) ==`);
	for (const p of nearForms.sort((x, y) => y.sim - x.sim)) { console.log(row(p)); }
	console.log(`\n== R8 near-misses, folder emblems (${folderNearForms.length}) ==`);
	for (const p of folderNearForms.sort((x, y) => y.sim - x.sim)) { console.log(row(p)); }
}

const open = openTwins.length + openForms.length + (FOLDERS_HARD ? openFolderForms.length : 0);
console.log(`\n${open} open hard finding(s); ${tolerated.length} tolerated (§11.3), `
	+ `${separated.length} form-separated, ${twins.length - openTwins.length + forms.length - openForms.length} accepted`
	+ (FOLDERS_HARD ? '' : `, ${openFolderForms.length} folder-emblem reported (R9b: does not gate)`));
process.exit(open ? 1 : 0);
