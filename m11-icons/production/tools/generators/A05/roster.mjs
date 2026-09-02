// roster.mjs — A05 slice: archetypes, declared R3 families, same-domain core neighbours.

export const ARCH = {
	mson: 'BADGE', msw: 'BADGE', mustache: 'SILHOUETTE', mvt: 'BADGE', mvtcss: 'BADGE',
	mvtjs: 'BADGE', mwb: 'SILHOUETTE', mxml: 'BADGE', n64: 'GLYPH', nanostaged: 'BADGE',
	nearly: 'BADGE', neo4j: 'SILHOUETTE', 'nest-controller': 'GLYPH', 'nest-decorator': 'GLYPH',
	'nest-filter': 'SILHOUETTE', 'nest-gateway': 'SILHOUETTE', 'nest-guard': 'SILHOUETTE',
	'nest-interceptor': 'GLYPH', 'nest-middleware': 'GLYPH', 'nest-module': 'SILHOUETTE',
	'nest-pipe': 'SILHOUETTE', 'nest-resolver': 'SILHOUETTE', 'nest-service': 'SILHOUETTE',
	nextflow: 'GLYPH', 'ng-tailwind': 'SILHOUETTE', 'ngrx-actions': 'GLYPH',
	'ngrx-effects': 'GLYPH', 'ngrx-reducer': 'GLYPH', 'ngrx-selectors': 'SILHOUETTE',
	'ngrx-state': 'SILHOUETTE', nimble: 'BADGE', ninja: 'SILHOUETTE', nitro: 'GLYPH',
	nix: 'SILHOUETTE', njsproj: 'BADGE', noc: 'BADGE', nsi: 'BADGE', numpy: 'BADGE',
	nunjucks: 'BADGE', nushell: 'SILHOUETTE', nvidia: 'SILHOUETTE', objectivecpp: 'BADGE',
	'ocaml-intf': 'GLYPH', ocx: 'SILHOUETTE', odin: 'BADGE', ogone: 'BADGE', onenote: 'SILHOUETTE',
	opam: 'BADGE', opencl: 'BADGE', openhab: 'SILHOUETTE', openscad: 'SILHOUETTE',
	oso: 'SILHOUETTE', otne: 'BADGE', outlook: 'SILHOUETTE', ovpn: 'BADGE', paket: 'BADGE',
	palette: 'SILHOUETTE', pascal: 'BADGE', pascalproject: 'BADGE', pawn: 'SILHOUETTE',
	pcl: 'SILHOUETTE', pddl: 'BADGE', 'pddl-happenings': 'GLYPH', 'pddl-plan': 'SILHOUETTE',
	perl6: 'BADGE', pgsql: 'SILHOUETTE', phalcon: 'BADGE', phpstan: 'BADGE', phpunit: 'GLYPH',
	pine: 'SILHOUETTE', pip: 'SILHOUETTE', pipeline: 'SILHOUETTE', pixi: 'BADGE', pkl: 'BADGE',
	plantuml: 'SILHOUETTE', plastic: 'BADGE', platformio: 'BADGE', plop: 'SILHOUETTE',
	plsql: 'SILHOUETTE', 'plsql-package': 'BADGE', 'plsql-package-body': 'BADGE',
	'plsql-package-header': 'BADGE', 'plsql-package-spec': 'BADGE', poedit: 'SILHOUETTE'
};

// R3 family rhymes declared by this slice (shared plate / shared mark, different role).
export const FAMILIES = [
	['mvt', 'mvtcss', 'mvtjs'],
	['pascal', 'pascalproject'],
	['perl6', 'perl'],
	['objectivecpp', 'objectivec'],
	['ng-tailwind', 'tailwind'],
	['plsql', 'plsql-package', 'plsql-package-body', 'plsql-package-header',
		'plsql-package-spec', 'sql', 'sqlite', 'pgsql'],
	['ocaml-intf', 'ocaml', 'opam'],
	['nimble', 'nim'], ['njsproj', 'node'], ['numpy', 'python'], ['pip', 'python'],
	['nunjucks', 'mustache']
];

// R7 is HARD against these core icons (§11.3: same domain family).
export const DOMAIN = {
	nestjs: ['nest-controller', 'nest-decorator', 'nest-filter', 'nest-gateway', 'nest-guard',
		'nest-interceptor', 'nest-middleware', 'nest-module', 'nest-pipe', 'nest-resolver', 'nest-service'],
	angular: ['ngrx-actions', 'ngrx-effects', 'ngrx-reducer', 'ngrx-selectors', 'ngrx-state', 'ng-tailwind'],
	sql: ['plsql', 'pgsql', 'plsql-package', 'plsql-package-body', 'plsql-package-header', 'plsql-package-spec'],
	sqlite: ['plsql', 'pgsql', 'paket', 'phalcon'],
	python: ['numpy', 'pip'], php: ['phpstan', 'phpunit', 'phalcon'],
	perl: ['perl6'], ocaml: ['ocaml-intf', 'opam'], objectivec: ['objectivecpp'],
	nim: ['nimble'], node: ['njsproj'], tailwind: ['ng-tailwind'],
	npm: ['pip', 'paket', 'opam'], jenkins: ['pipeline'],
	markdown: ['mson', 'ngrx-reducer'], json: ['mson', 'nitro'], json5: ['mson', 'nitro'],
	xml: ['mxml'], jest: ['phpunit'], vitest: ['phpunit'], cypress: ['phpunit'],
	shell: ['nushell', 'ngrx-reducer'],
	// four cross-domain neighbours too close to leave: web-project greens, systems blues, teals
	nginx: ['nunjucks', 'phalcon'], cpp: ['odin'], go: ['phalcon'],
	csharp: ['nunjucks'], clojure: ['nunjucks'], deno: ['nunjucks'], django: ['nunjucks'],
	mdx: ['odin'], eslint: ['odin'], kotlin: ['odin'], wasm: ['odin']
};

export const famIndex = () => {
	const m = new Map();
	FAMILIES.forEach((f, i) => f.forEach(id => { if (!m.has(id)) { m.set(id, new Set()); } m.get(id).add(i); }));
	return m;
};

export function hsl(hex) {
	const r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255, b = parseInt(hex.slice(5, 7), 16) / 255;
	const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, l = (mx + mn) / 2;
	let h = 0;
	if (d) {
		if (mx === r) { h = ((g - b) / d) % 6; } else if (mx === g) { h = (b - r) / d + 2; } else { h = (r - g) / d + 4; }
		h *= 60; if (h < 0) { h += 360; }
	}
	return { h, s: (d ? d / (1 - Math.abs(2 * l - 1)) : 0) * 100, l: l * 100 };
}

export function toHex({ h, s, l }) {
	const S = s / 100, L = l / 100;
	const c = (1 - Math.abs(2 * L - 1)) * S, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = L - c / 2;
	const seg = Math.floor(((h % 360) + 360) % 360 / 60);
	const [r, g, b] = [[c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x]][seg];
	const ch = (v) => Math.round(Math.min(255, Math.max(0, (v + m) * 255))).toString(16).padStart(2, '0').toUpperCase();
	return `#${ch(r)}${ch(g)}${ch(b)}`;
}

export const dHue = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
