// A03 roster, part 2: gdscript … hurl
import { icon, badge, P, glyphLetters } from './build-a03.mjs';

const disc = (x, y, r) => `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0-${2 * r} 0Z`;

// 29 gdscript — the Godot plate.
badge('gdscript', '#478CBF', 'GD', { ink: 9.6 }, 'Godot brand #478CBF (family)');

// 30 gduid — Godot's resource-id sidecar.
icon('gduid', 'GLYPH', '#6FA6C8',
	glyphLetters('UID', { ink: 11.4, letterSpacing: -0.02, fill: '#6FA6C8' }).d,
	'Godot blue, lifted → #6FA6C8 (family)');

// 31 genstat — the summation sign, drawn as geometry (R1).
icon('genstat', 'GLYPH', '#5E9E86',
	P('#5E9E86', 'M2.8 2.8h10.4v1.9H6.2l4.2 3.3-4.2 3.3h7v1.9H2.8v-1.7l4.8-3.5L2.8 4.5Z'),
	'no brand → #5E9E86 (statistics green)');

// 32 gleam — Lucy, Gleam's star.
icon('gleam', 'SILHOUETTE', '#D68FC6',
	P('#D68FC6', (() => {
		// Lucy: five fat, convex arms with rounded tips — not the sharp star favicon owns (R8).
		const cx = 8, cy = 8.4, R = 6.1, r = 3.05, bulge = .9;
		const pt = (a, rad) => [cx + rad * Math.cos(a * Math.PI / 180), cy + rad * Math.sin(a * Math.PI / 180)];
		const tip = k => pt(-90 + 72 * k, R), val = k => pt(-54 + 72 * k, r);
		const ctl = (A, B) => {
			const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
			const d = Math.hypot(mx - cx, my - cy);
			return [mx + (mx - cx) / d * bulge, my + (my - cy) / d * bulge];
		};
		const f = p => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`;
		let d = 'M' + f(val(4));
		for (let k = 0; k < 5; k++) {
			d += 'Q' + f(ctl(k ? val(k - 1) : val(4), tip(k))) + ' ' + f(tip(k));
			d += 'Q' + f(ctl(tip(k), val(k))) + ' ' + f(val(k));
		}
		return d + 'Z' + disc(6.6, 7.2, .68) + disc(9.4, 7.2, .68);
	})(), true),
	'Gleam pink #FFAFF3 → #D68FC6'); //

// 33 glimmer — the glimmer.
icon('glimmer', 'GLYPH', '#D27B4B',
	P('#D27B4B', 'M6.8 2Q7.55 6.65 12.2 7.4Q7.55 8.15 6.8 12.8Q6.05 8.15 1.4 7.4Q6.05 6.65 6.8 2ZM13.3 10.6Q13.6 12.1 15.1 12.4Q13.6 12.7 13.3 14.2Q13 12.7 11.5 12.4Q13 12.1 13.3 10.6Z'),
	'Ember/Glimmer #E04E39 → #D27B4B');

// 34 glsl — a triangle being rasterised, scanline by scanline.
icon('glsl', 'GLYPH', '#4A8581',
	P('#4A8581', 'M6.1 5h3.8v1.5H6.1ZM4.88 7.3h6.24v1.5H4.88ZM3.64 9.6h8.72v1.5H3.64ZM2.4 11.9h11.2v1.5H2.4Z'),
	'no brand → #4A8581 (shader steel)');

// 35 gnuplot — axes and a curve.
icon('gnuplot', 'GLYPH', '#7E8FC0',
	P('#7E8FC0', 'M2.2 2.4h1.3v10.6H2.2ZM2.2 11.7h11.8V13H2.2ZM4.4 11.3c2.6 0 3.2-4 5-5.8 1.1-1.1 2.4-1.7 4-1.9v1.3c-1.3.2-2.3.7-3.1 1.5-1.9 1.9-2.4 6.2-5.9 6.2Z'),
	'no brand → #7E8FC0 (plot indigo)');

// 36 goctl — the go-zero generator.
badge('goctl', '#6AACB5', 'ctl', { ink: 9.6, band: 'x' }, 'Go cyan, lifted off core go → #6AACB5');

// 37 godot — the robot head.
icon('godot', 'SILHOUETTE', '#478CBF',
	P('#478CBF', 'M2.6 2.8h10.8v5.6c0 2.2-1.5 3.9-3.2 4.8v1.4H8.6v-1.1H7.4v1.1H5.8v-1.4C4.1 12.3 2.6 10.6 2.6 8.4Z'
		+ disc(5.6, 6.6, 1.35) + disc(10.4, 6.6, 1.35) + disc(5.6, 6.6, .6) + disc(10.4, 6.6, .6)
		+ 'M6.2 9.7h3.6v1.2H6.2Z', true),
	'brand #478CBF');

// 38 godot-assets — the primitives a Godot scene is built from.
icon('godot-assets', 'SILHOUETTE', '#478CBF',
	P('#478CBF', disc(8, 4.4, 2.5) + 'M1.6 8.6h4.6v4.6H1.6ZM11.8 8.6 14.4 13.2H9.2Z'),
	'brand #478CBF (family)');

// 39 godotshader — the material preview ball.
icon('godotshader', 'GLYPH', '#478CBF',
	P('#478CBF', disc(8, 8, 5.6) + disc(5.8, 5.6, 1.5), true),
	'brand #478CBF (family)');

// 40 google — the G.
icon('google', 'SILHOUETTE', '#4A85C8',
	P('#4A85C8', 'M13.91 6.98A6 6 0 1 1 13.12 4.87L11.07 6.12A3.6 3.6 0 1 0 11.55 7.39ZM8 6.9H13.9V9.5H8Z'),
	'Google blue #4285F4 → #4A85C8');

// 41 grain — an ear of wheat.
icon('grain', 'SILHOUETTE', '#D89E45',
	P('#D89E45', 'M7.4 6.4h1.2v7.8H7.4ZM8 1.4 9.9 4.5 8 7 6.1 4.5Z'
		+ [9.4, 13].map(y => `M7.4 ${y}L2.6 ${(y - 1.6).toFixed(1)}L3.6 ${(y - 4).toFixed(1)}L7.4 ${(y - 2.2).toFixed(1)}Z`
			+ `M8.6 ${y}L13.4 ${(y - 1.6).toFixed(1)}L12.4 ${(y - 4).toFixed(1)}L8.6 ${(y - 2.2).toFixed(1)}Z`).join('')),
	'Grain #F5A623 → #D89E45');

// 42 graphcool
badge('graphcool', '#9289BC', 'GC', { ink: 9.6 }, 'no brand → #9289BC (graphcool violet)');

// 43 graphqls — the GraphQL schema plate; core graphql keeps the glyph.
badge('graphqls', '#C43E93', 'GQL', { ink: 11.2, letterSpacing: -0.02 }, 'GraphQL #E10098 → #C43E93 (family with core graphql)');

// 44 graphviz — two DOT nodes and an edge.
icon('graphviz', 'GLYPH', '#83C2B7',
	P('#83C2B7', 'M3.8 1.6h8.4a1.2 1.2 0 0 1 1.2 1.2v1.2a1.2 1.2 0 0 1-1.2 1.2H3.8a1.2 1.2 0 0 1-1.2-1.2V2.8A1.2 1.2 0 0 1 3.8 1.6ZM3.8 11h8.4a1.2 1.2 0 0 1 1.2 1.2v1.2a1.2 1.2 0 0 1-1.2 1.2H3.8a1.2 1.2 0 0 1-1.2-1.2v-1.2A1.2 1.2 0 0 1 3.8 11ZM7.35 5h1.3v3.6h-1.3ZM8 11 5.9 8.2h4.2Z'),
	'no brand → #83C2B7 (DOT steel)');

// 45 gridsome — the grid, one cell rounded off.
icon('gridsome', 'SILHOUETTE', '#6FBE6A',
	P('#6FBE6A', 'M1.9 1.9h5v5h-5ZM9.1 1.9h5v5h-5ZM1.9 9.1h5v5h-5Z' + disc(11.6, 11.6, 2.5)),
	'Gridsome green #00A672 → #6FBE6A (clear of core nuxt/vue)');

// 46 grit
badge('grit', '#A8B84C', 'GT', { ink: 9.4, letterFill: '#3E4A18' }, 'no brand → #A8B84C (light plate, dark letters)');

// 47 grok — the angled slash mark.
icon('grok', 'GLYPH', '#D6D8DA',
	P('#D6D8DA', 'M9.6 1.8h3.6L6.4 14.2H2.8ZM12.6 8.4h2.2L11.2 14.2H9Z'),
	'brand black → #D6D8DA (lifted, neutral lane)');

// 48 groovy
badge('groovy', '#46697C', 'GR', { ink: 9.6 }, 'Groovy blue-grey → #46697C');

// 49 grunt — the task-runner cog.
icon('grunt', 'SILHOUETTE', '#DCA33F',
	P('#DCA33F', (() => {
		const pts = [];
		for (let k = 0; k < 8; k++) {
			for (const [a, r] of [[k * 45 - 13, 4.6], [k * 45 - 9, 6.2], [k * 45 + 9, 6.2], [k * 45 + 13, 4.6]]) {
				const t = a * Math.PI / 180;
				pts.push(`${(8 + r * Math.cos(t)).toFixed(2)} ${(8 + r * Math.sin(t)).toFixed(2)}`);
			}
		}
		return 'M' + pts.join(' ') + 'Z' + disc(8, 8, 2.1);
	})(), true),
	'Grunt amber → #DCA33F');

// 50 gulp — the gulp itself.
icon('gulp', 'SILHOUETTE', '#CF5B52',
	P('#CF5B52', 'M3.2 5.2h9.6l-1.02 8.1a1.3 1.3 0 0 1-1.29 1.14H5.51A1.3 1.3 0 0 1 4.22 13.3ZM9.4 5.2 12.4 1.2l1.5 1.1-2.9 2.9Z'),
	'Gulp red → #CF5B52');

// 51 haml — the % that opens every haml tag.
icon('haml', 'GLYPH', '#C4566B',
	glyphLetters('%', { cap: 9.8, fill: '#C4566B' }).d,
	'Haml crimson → #C4566B');

// 52 handlebars — the moustache the family is named for.
icon('handlebars', 'SILHOUETTE', '#D4763C',
	P('#D4763C', 'M8 6.6C9.8 4.8 12.3 4.1 13.6 5.5 14.9 6.9 14.5 9.9 12.9 11.1 11.6 12.1 9.9 11.7 9.2 10.3 8.9 9.7 8.5 9.1 8 8.6 7.5 9.1 7.1 9.7 6.8 10.3 6.1 11.7 4.4 12.1 3.1 11.1 1.5 9.9 1.1 6.9 2.4 5.5 3.7 4.1 6.2 4.8 8 6.6Z'),
	'Handlebars #F0772B → #D4763C');

// 53 harbour — the anchor.
icon('harbour', 'SILHOUETTE', '#6E9EC0',
	P('#6E9EC0', 'M8 1.4a2 2 0 1 1 0 4a2 2 0 1 1 0-4Zm0 1.3a.7 .7 0 1 0 0 1.4a.7 .7 0 1 0 0-1.4ZM7.3 4.6h1.4v9.9H7.3ZM4 6h8v1.3H4ZM2.2 8.8c0 3.1 2.5 5.7 5.8 5.7v-1.4c-2.5 0-4.4-2-4.4-4.3ZM13.8 8.8c0 3.1-2.5 5.7-5.8 5.7v-1.4c2.5 0 4.4-2 4.4-4.3ZM1.1 8h2.4L2.3 10.2ZM14.9 8h-2.4l1.2 2.2Z', true),
	'no brand → #6E9EC0 (harbour blue)');

// 54 hashicorp — the H.
icon('hashicorp', 'SILHOUETTE', '#C9CDD2',
	P('#C9CDD2', 'M2.4 3.2 5.9 1.4v5.4h4.2V4.4l3.5-1.8v10.2l-3.5 1.8V9.2H5.9v5.4L2.4 12.8Z'),
	'brand black → #C9CDD2 (lifted, neutral lane)');

// 55 haxe — the pinwheel of four triangles.
icon('haxe', 'SILHOUETTE', '#D2822E',
	P('#D2822E', 'M8 7.2 2.6 1.8h10.8ZM8.8 8 14.2 2.6v10.8ZM8 8.8 13.4 14.2H2.6ZM7.2 8 1.8 13.4V2.6Z'),
	'Haxe #EA8220 → #D2822E');

// 56 haxedevelop
badge('haxedevelop', '#A8632A', 'HD', { ink: 9.6 }, 'Haxe orange, darkened for the plate → #A8632A (family)');

// 57 hcl
badge('hcl', '#9E6FD0', 'HCL', { ink: 11.2, letterSpacing: -0.02 }, 'HashiCorp violet #844FBA → #9E6FD0');

// 58 hip
icon('hip', 'GLYPH', '#C4453C',
	glyphLetters('HIP', { ink: 12.4, letterSpacing: -0.02, fill: '#C4453C' }).d,
	'AMD red → #C4453C');

// 59 hjson
badge('hjson', '#B8A63C', 'HJ', { ink: 9.5, letterFill: '#453B0C' }, 'JSON yellow, darkened off core js → #B8A63C');

// 60 hlsl
badge('hlsl', '#78879E', 'HL', { ink: 9.5 }, 'no brand → #78879E (neutral lane)');

// 61 huff
badge('huff', '#6E5F8C', 'HF', { ink: 9.5 }, 'no brand → #6E5F8C (neutral lane)');

// 62 hunspell — a word under the spell-checker's squiggle.
icon('hunspell', 'GLYPH', '#93A2AE',
	glyphLetters('a', { band: 'x', ink: 5.4, cy: 5.9, fill: '#93A2AE' }).d
	+ P('#93A2AE', 'M2.4 12.4 4.6 10.4 6.8 12.4 9 10.4 11.2 12.4 13.4 10.4v1.7l-2.2 2-2.2-2-2.2 2-2.2-2-2.2 2Z'),
	'no brand → #93A2AE (neutral lane)');

// 63 hurl — thrown.
icon('hurl', 'SILHOUETTE', '#5FB08C',
	P('#5FB08C', 'M14.4 2 1.6 7.4 6.1 9.2ZM14.4 2 6.9 10 9.1 14Z'),
	'Hurl green → #5FB08C');
