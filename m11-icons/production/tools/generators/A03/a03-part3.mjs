// A03 roster, part 3: hy … jest-snapshot
import { icon, badge, P, glyphLetters } from './build-a03.mjs';

const disc = (x, y, r, cw = 0) => `M${x - r} ${y}a${r} ${r} 0 1 ${cw} ${2 * r} 0a${r} ${r} 0 1 ${cw}-${2 * r} 0Z`;

// 64 hy
badge('hy', '#D69846', 'hy', { ink: 9, band: 'x' }, 'no brand → #D69846 (Hy amber)');

// 65 hygen — the generator funnel.
icon('hygen', 'SILHOUETTE', '#A86FC0',
	P('#A86FC0', 'M2.2 2.4h11.6L9.3 8.4v3.6l-2.6 1.8V8.4Z'),
	'no brand → #A86FC0 (generator violet)');

// 66 hypr — the angular H.
icon('hypr', 'SILHOUETTE', '#4FB8C8',
	P('#4FB8C8', 'M5 1.8h2.4L4.6 14.2H2.2ZM11.2 1.8h2.4l-2.8 12.4H8.4ZM6.23 7h3.8l-.5 2.2h-3.8Z'),
	'Hyprland cyan → #4FB8C8');

// 67 icl
icon('icl', 'GLYPH', '#6E9E8E',
	glyphLetters('ICL', { ink: 12.2, letterSpacing: -0.02, fill: '#6E9E8E' }).d,
	'no brand → #6E9E8E (matte sea-green)');

// 68-70 Idris — one family: the language, its compiled bytecode, its package.
badge('idris', '#7E3A6E', 'Id', { ink: 9.2 }, 'Idris plum → #7E3A6E (BADGE red lane held by fla/flash + jbuilder) (family)');
badge('idrisbin', '#7E3A6E', 'ibc', { ink: 10, band: 'x' }, 'Idris plum → #7E3A6E (BADGE red lane held by fla/flash + jbuilder) (family)');
badge('idrispkg', '#7E3A6E', 'pkg', { ink: 10.2, band: 'x' }, 'Idris plum → #7E3A6E (BADGE red lane held by fla/flash + jbuilder) (family)');

// 71 imba — the lowercase wordmark, bare.
icon('imba', 'GLYPH', '#DEAD69',
	glyphLetters('imba', { band: 'x', ink: 11.6, cy: 8, fill: '#DEAD69' }).d,
	'Imba amber #FFC107 → #DEAD69');

// 72 inc — what an include is spelled with.
icon('inc', 'GLYPH', '#8E9AA6',
	glyphLetters('#', { cap: 8.8, fill: '#8E9AA6' }).d,
	'no brand → #8E9AA6 (neutral lane)');

// 73 infopath
badge('infopath', '#8A3FA8', 'IP', { ink: 9.2 }, 'InfoPath purple #7719AA → #8A3FA8');

// 74 informix
badge('informix', '#5A5FA8', 'IFX', { ink: 11, letterSpacing: -0.02 }, 'IBM blue → #5A5FA8');

// 75 ink — the nib.
icon('ink', 'SILHOUETTE', '#8E9AB0',
	P('#8E9AB0', 'M8 1.4 12.2 4.6c1 .8 1.4 2.1 1 3.3L8 14.6 2.8 7.9c-.4-1.2 0-2.5 1-3.3Z'
		+ 'M7.35 6.8h1.3v5.6L8 13.5l-.65-1.1Z' + disc(8, 5.5, 1.1), true),
	'no brand → #8E9AB0 (ink slate)');

// 76 innosetup — the install.
icon('innosetup', 'SILHOUETTE', '#6E93C4',
	P('#6E93C4', 'M6.9 1.6h2.2v4.6h2.6L8 9.8 4.3 6.2h2.6ZM2.2 10.4h3v1.6h5.6v-1.6h3v3.9H2.2Z'),
	'no brand → #6E93C4 (installer blue)');

// 77 io
badge('io', '#8A6E4E', 'io', { ink: 8.4, band: 'x' }, 'no brand → #8A6E4E (neutral lane)');

// 78 iodine — the element tile.
icon('iodine', 'GLYPH', '#A16FC0',
	P('#A16FC0', 'M3.4 2.6h9.2a1.4 1.4 0 0 1 1.4 1.4v8a1.4 1.4 0 0 1-1.4 1.4H3.4A1.4 1.4 0 0 1 2 12V4a1.4 1.4 0 0 1 1.4-1.4Zm0 1.4v8h9.2V4Z', true)
	+ glyphLetters('I', { cap: 5.4, fill: '#A16FC0' }).d,
	'iodine violet → #A16FC0');

// 79 ionic — the orbit.
icon('ionic', 'SILHOUETTE', '#4A80D6',
	P('#4A80D6', 'M2.25 10.33a6.2 4 -22 1 1 11.5-4.66a6.2 4 -22 1 1-11.5 4.66Z'
		+ 'M3.74 9.72a4.6 2.4 -22 1 0 8.52-3.44a4.6 2.4 -22 1 0-8.52 3.44Z' + disc(8, 8, 2.6, 1)),
	'brand #3880FF → #4A80D6');

// 80 jake
badge('jake', '#4F7A5E', 'JK', { ink: 9.5 }, 'no brand → #4F7A5E (neutral lane)');

// 81 janet
badge('janet', '#5E9E4E', 'jn', { ink: 8.8, band: 'x' }, 'no brand → #5E9E4E (Janet green)');

// 82 jbuilder — Ruby's JSON builder, on the ruby plate.
badge('jbuilder', '#A94152', 'jb', { ink: 8.8, band: 'x' }, 'Ruby red #A94152 (family with core ruby)');

// 83 jekyll — the doctor's flask.
icon('jekyll', 'SILHOUETTE', '#C25A4A',
	P('#C25A4A', 'M5.8 1.4h4.4v1.3H5.8ZM6.5 2.7h3v3.2l4 6.4a1.3 1.3 0 0 1-1.1 1.99H3.6A1.3 1.3 0 0 1 2.5 12.3l4-6.4Z'),
	'Jekyll red → #C25A4A');

// 84 jest-snapshot — the snapshot itself.
icon('jest-snapshot', 'SILHOUETTE', '#B23A55',
	P('#B23A55', 'M6.2 2.6h3.6l.9 1.6H13a1.4 1.4 0 0 1 1.4 1.4v7a1.4 1.4 0 0 1-1.4 1.4H3A1.4 1.4 0 0 1 1.6 12.6v-7A1.4 1.4 0 0 1 3 4.2h2.3Z'
		+ disc(8, 8.9, 3.1) + disc(8, 8.9, 1.6), true),
	'Jest maroon #B23A55 (family with core jest)');
