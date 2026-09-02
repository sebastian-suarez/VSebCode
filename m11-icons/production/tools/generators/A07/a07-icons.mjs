// a07-icons.mjs — the A07 long-tail roster (sequelize … vash), 84 concepts.
//
// Every entry: id, archetype, colour source, an example matched filename and a group
// for the contact sheet, and the icon body. Letters come from letterpath.mjs; nothing
// here uses <text> or a font-family.

import { rr, rect, circ, circCW, poly, badge, glyphText, path } from './a07-lib.mjs';

const P = (fill, d, eo) => path(fill, d, eo);

// ---- shared bits ------------------------------------------------------------

// the canon test flask (testjs / testts), reused for the sanctioned test family
const FLASK = 'M6.3 1.9h3.4v1H9.2v2.6l3.7 6.6c.5.9-.1 2-1.1 2H4.2c-1 0-1.6-1.1-1.1-2l3.7-6.6V2.9H6.3z';
// the canon svelte ribbon, scaled 0.76 about (8,8) and nudged up-left for the JS/TS chips
const SVELTE_SMALL = 'M10.62 4.02A3.5 2.89 0 1 0 7.45 8.14A1.82 1.22 0 1 1 5.8 9.87L4.28 10.58'
	+ 'A3.5 2.89 0 1 0 7.45 6.46A1.82 1.22 0 1 1 9.11 4.73Z';

const B = (id, plate, text, opts) => {
	const { body, letters } = badge(plate, text, opts);
	return { body, letters, fills: [plate, (opts && opts.letterFill) || '#FFFFFF'] };
};

// ---- roster -----------------------------------------------------------------

const R = [];
const add = (o) => { R.push(o); return o; };

// 1 sequelize — the Sequelize S-ribbon (two half-annuli + a spine)
add({
	id: 'sequelize', archetype: 'SILHOUETTE', fill: '#4E9BD1', file: '.sequelizerc', group: 'data & markup',
	source: 'brand #52B0E7 → #4E9BD1',
	body: P('#4E9BD1',
		'M3.8 6.2A4.2 4.2 0 0 1 12.2 6.2H9.8A1.8 1.8 0 0 0 6.2 6.2Z'
		+ 'M3.8 9.8A4.2 4.2 0 0 0 12.2 9.8H9.8A1.8 1.8 0 0 1 6.2 9.8Z'
		+ 'M3.8 6.2H6.2L12.2 9.8H9.8Z')
});

// 2 shader — the shader ball (sphere + specular highlight)
add({
	id: 'shader', archetype: 'SILHOUETTE', fill: '#A87BC4', file: 'water.frag', group: 'shaders & 3D',
	source: 'no brand → #A87BC4 (vsicons shader violet)',
	body: P('#A87BC4', circ(8, 8, 5.9) + circ(5.9, 5.6, 1.75), true)
});

// 3 shaderlab — Unity's shader dialect: letters on a Unity-slate plate
add({ id: 'shaderlab', archetype: 'BADGE', fill: '#5E6B78', file: 'Toon.shader', group: 'shaders & 3D',
	source: 'no brand → #5E6B78 (Unity slate, neutral lane)', ...B('shaderlab', '#5E6B78', 'SL') });

// 4 shellcheck — the shell chevron with a lint tick
add({
	id: 'shellcheck', archetype: 'GLYPH', fill: '#7E9E6E', file: '.shellcheckrc', group: 'testing & QA',
	source: 'no brand → #7E9E6E (shell green, dimmed off canon shell; neutral lane)',
	body: P('#7E9E6E',
		poly([[2.6, 6.56], [6.4, 10.36], [13.6, 3.16], [13.6, 6.84], [6.4, 14.04], [2.6, 10.24]]))
});

// 5 signalstore — a signal broadcast (two arcs over a source dot)
add({
	id: 'signalstore', archetype: 'GLYPH', fill: '#B871C9', file: 'todos.store.ts', group: 'front-end & UI',
	source: 'no brand → #B871C9 (NgRx magenta-violet, lifted for 16 px contrast)',
	body: P('#B871C9',
		circ(8, 11.6, 1.7)
		+ 'M4.24 10.23A4 4 0 0 1 11.76 10.23L10.26 10.78A2.4 2.4 0 0 0 5.74 10.78Z'
		+ 'M1.8 9.34A6.6 6.6 0 0 1 14.2 9.34L12.7 9.89A5 5 0 0 0 3.3 9.89Z')
});

// 6 silverstripe — two silver stripes
add({
	id: 'silverstripe', archetype: 'SILHOUETTE', fill: '#B4BAC0', file: 'Page.ss', group: 'PHP & CMS',
	source: 'no brand → #B4BAC0 (the silver in the name)',
	body: P('#B4BAC0',
		poly([[9.9, 2.3], [12.3, 2.3], [8.1, 13.7], [5.7, 13.7]])
		+ poly([[5.7, 2.3], [8.1, 2.3], [3.9, 13.7], [1.5, 13.7]]))
});

// 7 simulink — a signal block with a step response and two signal stubs
add({
	id: 'simulink', archetype: 'SILHOUETTE', fill: '#4C93B5', file: 'plant.slx', group: 'science & maths',
	source: 'no brand → #4C93B5 (Simulink block blue)',
	body: P('#4C93B5',
		rr(3, 3.6, 10, 8.8, 1.4)
		+ poly([[4.6, 8.9], [7.3, 8.9], [7.3, 5.9], [11.4, 5.9], [11.4, 7.3], [8.7, 7.3], [8.7, 10.3], [4.6, 10.3]]),
		true)
		+ P('#4C93B5', rect(1.2, 7.3, 1.8, 1.4) + rect(13, 7.3, 1.8, 1.4))
});

// 8 singularity — a gravity funnel
add({
	id: 'singularity', archetype: 'SILHOUETTE', fill: '#9AA3B8', file: 'Singularity.def', group: 'infra & ops',
	source: 'no brand → #9AA3B8 (HPC slate)',
	body: P('#9AA3B8',
		'M2.2 4.4A5.8 2.4 0 1 1 13.8 4.4C13.8 6.7 9.7 10.5 8 14.3 6.3 10.5 2.2 6.7 2.2 4.4Z')
});

// 9 sino
add({ id: 'sino', archetype: 'BADGE', fill: '#6E7A98', file: 'main.sn', group: 'small languages',
	source: 'no brand → #6E7A98 (neutral lane)', ...B('sino', '#6E7A98', 'SN') });

// 10 siyuan
add({ id: 'siyuan', archetype: 'BADGE', fill: '#C88A80', file: 'note.sy', group: 'notes & docs',
	source: 'no brand → #C88A80 (SiYuan terracotta, lifted clear of canon npm)', ...B('siyuan', '#C88A80', 'SY') });

// 11 skipper — a sailboat (the HTTP router named for a skipper)
add({
	id: 'skipper', archetype: 'SILHOUETTE', fill: '#4E9AA8', file: 'routes.eskip', group: 'infra & ops',
	source: 'no brand → #4E9AA8',
	body: P('#4E9AA8',
		poly([[8.6, 2.2], [8.6, 9.2], [13.4, 9.2]])
		+ poly([[7.4, 3.4], [7.4, 9.2], [3.2, 9.2]])
		+ poly([[1.6, 10.6], [14.4, 10.6], [11.8, 14], [4.2, 14]]))
});

// 12 slang
add({ id: 'slang', archetype: 'BADGE', fill: '#7A6E96', file: 'lighting.slang', group: 'shaders & 3D',
	source: 'no brand → #7A6E96 (shader violet, neutral lane)', ...B('slang', '#7A6E96', 'SLG') });

// 13 slice — Ice's IDL: an ice crystal
add({
	id: 'slice', archetype: 'SILHOUETTE', fill: '#6FB2CE', file: 'Chat.ice', group: 'small languages',
	source: 'no brand → #6FB2CE (ice blue)',
	body: P('#6FB2CE',
		rect(7.15, 1.8, 1.7, 12.4)
		+ poly([[11.84, 12.95], [10.36, 13.8], [4.16, 3.06], [5.64, 2.21]])
		+ poly([[10.36, 2.21], [11.84, 3.06], [5.64, 13.8], [4.16, 12.95]])
		+ circCW(8, 8, 1.7))
});

// 14 slim
add({ id: 'slim', archetype: 'BADGE', fill: '#9E6E62', file: 'index.slim', group: 'templates',
	source: 'no brand → #9E6E62 (Ruby-adjacent brick, neutral lane)', ...B('slim', '#9E6E62', 'SLM') });

// 15 slint — a UI toggle
add({
	id: 'slint', archetype: 'SILHOUETTE', fill: '#5B84C9', file: 'app.slint', group: 'front-end & UI',
	source: 'no brand → #5B84C9 (Slint blue)',
	body: P('#5B84C9', rr(1.8, 4, 12.4, 8, 4) + circ(10.4, 8, 2.6), true)
});

// 16 sln — the Visual Studio double loop
add({
	id: 'sln', archetype: 'SILHOUETTE', fill: '#9670C8', file: 'App.sln', group: '.NET & Windows',
	source: 'no brand → #9670C8 (Visual Studio purple, lifted to carry the 2.2 px rings)',
	body: P('#9670C8', circ(4.4, 8, 3.6) + circ(4.4, 8, 1.4) + circ(11.6, 8, 3.6) + circ(11.6, 8, 1.4), true)
});

// 17 smarty — the template engine as a lightbulb
add({
	id: 'smarty', archetype: 'SILHOUETTE', fill: '#D0A83F', file: 'header.tpl', group: 'templates',
	source: 'no brand → #D0A83F',
	body: P('#D0A83F',
		circCW(8, 6.6, 4.6)
		+ rr(6.1, 10.6, 3.8, 1.6, 0.5)
		+ rr(6.6, 12.6, 2.8, 1.4, 0.5))
});

// 18 sml
add({ id: 'sml', archetype: 'BADGE', fill: '#6E6493', file: 'main.sml', group: 'small languages',
	source: 'no brand → #6E6493 (ML family violet, neutral lane)', ...B('sml', '#6E6493', 'SML') });

// 19 snakemake
add({ id: 'snakemake', archetype: 'BADGE', fill: '#5E8E62', file: 'Snakefile', group: 'science & maths',
	source: 'no brand → #5E8E62 (Snakemake green, neutral lane)', ...B('snakemake', '#5E8E62', 'SMK') });

// 20 snort — the pig
add({
	id: 'snort', archetype: 'SILHOUETTE', fill: '#D07E93', file: 'local.snort', group: 'infra & ops',
	source: 'no brand → #D07E93 (the Snort pig)',
	body: P('#D07E93',
		poly([[3.4, 5.6], [4, 2.4], [7, 4.4]])
		+ poly([[12.6, 5.6], [12, 2.4], [9, 4.4]]))
		+ P('#D07E93',
			rr(2.6, 4.6, 10.8, 6.8, 3.4)
			+ rr(6, 6.4, 1.6, 3.2, 0.8)
			+ rr(8.4, 6.4, 1.6, 3.2, 0.8), true)
});

// 21 sonarcloud — the cloud
add({
	id: 'sonarcloud', archetype: 'SILHOUETTE', fill: '#DE7038', file: 'sonar-project.properties', group: 'infra & ops',
	source: 'brand #F3702A → #DE7038',
	body: P('#DE7038',
		'M4.8 12.6A3.4 3.4 0 0 1 4.9 6A4 4 0 0 1 12.2 6.8A3 3 0 0 1 11.8 12.6Z')
});

// 22 source
add({ id: 'source', archetype: 'BADGE', fill: '#6E7E92', file: 'MainWindow.xaml', group: 'data & markup',
	source: 'no brand → #6E7E92 (neutral lane)', ...B('source', '#6E7E92', 'SRC') });

// 23 spacengine — a ringed planet
add({
	id: 'spacengine', archetype: 'SILHOUETTE', fill: '#6E7FC4', file: 'system.spe', group: 'shaders & 3D',
	source: 'no brand → #6E7FC4',
	body: P('#6E7FC4',
		'M1.61 10.73A6.8 2.6 -20 1 0 14.39 6.07A6.8 2.6 -20 1 0 1.61 10.73Z'
		+ 'M2.93 10.25A5.4 1.4 -20 1 0 13.07 6.55A5.4 1.4 -20 1 0 2.93 10.25Z', true)
		+ P('#6E7FC4', circ(8, 7.3, 3.3))
});

// 24 sparql — the .rq query file
add({ id: 'sparql', archetype: 'BADGE', fill: '#5E7E94', file: 'people.rq', group: 'data & markup',
	source: 'no brand → #5E7E94 (neutral lane)', ...B('sparql', '#5E7E94', 'RQ') });

// 25 spwn
add({ id: 'spwn', archetype: 'BADGE', fill: '#8E6E8E', file: 'level.spwn', group: 'small languages',
	source: 'no brand → #8E6E8E (neutral lane)', ...B('spwn', '#8E6E8E', 'SP') });

// 26 sqf
add({ id: 'sqf', archetype: 'BADGE', fill: '#7E8466', file: 'init.sqf', group: 'small languages',
	source: 'no brand → #7E8466 (neutral lane)', ...B('sqf', '#7E8466', 'SQF') });

// 27 squirrel — the .nut acorn
add({
	id: 'squirrel', archetype: 'SILHOUETTE', fill: '#A9793F', file: 'main.nut', group: 'small languages',
	source: 'no brand → #A9793F (acorn brown)',
	body: P('#A9793F',
		rr(7.4, 1.6, 1.2, 1.9, 0.5)
		+ 'M3.4 6.2A4.6 3 0 0 1 12.6 6.2Z'
		+ 'M4.2 7C4.2 11 6 14.2 8 14.2S11.8 11 11.8 7Z')
});

// 28 sss
add({ id: 'sss', archetype: 'BADGE', fill: '#B58A4E', file: 'style.sss', group: 'CSS family',
	source: 'no brand → #B58A4E (SugarSS amber)', ...B('sss', '#B58A4E', 'SSS') });

// 29 sst
add({ id: 'sst', archetype: 'BADGE', fill: '#96667E', file: 'sst.config.ts', group: 'infra & ops',
	source: 'no brand → #96667E (neutral lane)', ...B('sst', '#96667E', 'SST') });

// 30 stan — the normal distribution
add({
	id: 'stan', archetype: 'SILHOUETTE', fill: '#B5564E', file: 'model.stan', group: 'science & maths',
	source: 'no brand → #B5564E (Stan red)',
	body: P('#B5564E', 'M1.6 12.8C4.4 12.8 5.6 3.2 8 3.2S11.6 12.8 14.4 12.8Z')
});

// 31 stata
add({ id: 'stata', archetype: 'BADGE', fill: '#5E6E8E', file: 'analysis.do', group: 'science & maths',
	source: 'no brand → #5E6E8E (Stata navy, neutral lane)', ...B('stata', '#5E6E8E', 'STA') });

// 32 stencil — a stencil plate
add({
	id: 'stencil', archetype: 'SILHOUETTE', fill: '#7A77D4', file: 'my-comp.stencil', group: 'front-end & UI',
	source: 'no brand → #7A77D4 (Stencil indigo, lifted for 16 px contrast)',
	body: P('#7A77D4',
		rr(1.8, 2.6, 12.4, 10.8, 1.8)
		+ circ(5, 8, 2.3)
		+ poly([[10.6, 5.4], [13.2, 8], [10.6, 10.6], [8, 8]]), true)
});

// 33 storyboard — three panels
add({
	id: 'storyboard', archetype: 'SILHOUETTE', fill: '#7E93C9', file: 'Main.storyboard', group: 'front-end & UI',
	source: 'no brand → #7E93C9 (Xcode blue)',
	body: P('#7E93C9', rr(1.2, 3.4, 4, 9.2, 0.9) + rr(6, 3.4, 4, 9.2, 0.9) + rr(10.8, 3.4, 4, 9.2, 0.9))
});

// 34 stryker — the mutant killed
add({
	id: 'stryker', archetype: 'GLYPH', fill: '#C08D82', file: 'stryker.conf.json', group: 'testing & QA',
	source: 'no brand → #C08D82 (Stryker brick, lifted for 16 px contrast)',
	body: P('#C08D82', poly([[11.43, 13.06], [8, 9.63], [4.57, 13.06], [2.94, 11.43], [6.37, 8],
		[2.94, 4.57], [4.57, 2.94], [8, 6.37], [11.43, 2.94], [13.06, 4.57], [9.63, 8], [13.06, 11.43]]))
});

// 35 sty
add({ id: 'sty', archetype: 'BADGE', fill: '#7E6FA8', file: 'thesis.sty', group: 'notes & docs',
	source: 'no brand → #7E6FA8 (neutral lane)', ...B('sty', '#7E6FA8', 'STY') });

// 36 stylable — a paint roller
add({
	id: 'stylable', archetype: 'SILHOUETTE', fill: '#6EA8D4', file: 'button.st.css', group: 'CSS family',
	source: 'no brand → #6EA8D4 (Stylable blue)',
	body: P('#6EA8D4',
		rr(1.6, 2.4, 9.6, 4, 1)
		+ rect(10.6, 3.6, 2.8, 1.5)
		+ rect(11.6, 5.1, 1.8, 3.6)
		+ rr(10.4, 8.7, 4.2, 4.9, 1.2))
});

// 37 styled
add({ id: 'styled', archetype: 'BADGE', fill: '#A87A94', file: 'Button.styled', group: 'CSS family',
	source: 'no brand → #A87A94 (styled-components mauve, neutral lane)', ...B('styled', '#A87A94', 'SC') });

// 38 stylus — the pen
add({
	id: 'stylus', archetype: 'SILHOUETTE', fill: '#AEB4BA', file: 'main.styl', group: 'CSS family',
	source: 'brand #333333 → #AEB4BA (lifted per §6.3)',
	body: P('#AEB4BA',
		poly([[11.9, 1.7], [14.3, 4.1], [6.3, 12.1], [3.9, 9.7]])
		+ poly([[3.35, 10.25], [5.75, 12.65], [1.9, 14.1]]))
});

// 39 svelte-js
add({
	id: 'svelte-js', archetype: 'SILHOUETTE', fill: '#B15B25', file: 'store.svelte.js', group: 'front-end & UI',
	source: 'canon svelte #B15B25 + js #E8D44D chip (R3 family)',
	fills: ['#B15B25', '#E8D44D'],
	body: P('#B15B25', SVELTE_SMALL) + P('#E8D44D', rr(10, 10, 4.6, 4.6, 1.1))
});

// 40 svelte-ts
add({
	id: 'svelte-ts', archetype: 'SILHOUETTE', fill: '#B15B25', file: 'store.svelte.ts', group: 'front-end & UI',
	source: 'canon svelte #B15B25 + ts #3178C6 chip (R3 family)',
	fills: ['#B15B25', '#3178C6'],
	body: P('#B15B25', SVELTE_SMALL) + P('#3178C6', rr(10, 10, 4.6, 4.6, 1.1))
});

// 41 sway
add({ id: 'sway', archetype: 'BADGE', fill: '#5E8C7E', file: 'main.sw', group: 'small languages',
	source: 'no brand → #5E8C7E (neutral lane)', ...B('sway', '#5E8C7E', 'SW') });

// 42 swig
add({ id: 'swig', archetype: 'BADGE', fill: '#8E7E5E', file: 'page.swig', group: 'templates',
	source: 'no brand → #8E7E5E (neutral lane)', ...B('swig', '#8E7E5E', 'SWG') });

// 43 symfony — the plate with the S cut out
add({
	id: 'symfony', archetype: 'SILHOUETTE', fill: '#C6CACE', file: 'symfony.lock', group: 'PHP & CMS',
	source: 'brand #000000 → #C6CACE (lifted per §6.3)',
	body: P('#C6CACE',
		rr(1.6, 1.6, 12.8, 12.8, 3.2)
		+ 'M4.4 7A3.6 3.6 0 0 1 11.6 7H9.6A1.6 1.6 0 0 0 6.4 7Z'
		+ 'M4.4 9A3.6 3.6 0 0 0 11.6 9H9.6A1.6 1.6 0 0 1 6.4 9Z'
		+ 'M4.4 7H6.4L11.6 9H9.6Z', true)
});

// 44 systemverilog — an IC
add({
	id: 'systemverilog', archetype: 'SILHOUETTE', fill: '#6E93B5', file: 'alu.sv', group: 'science & maths',
	source: 'no brand → #6E93B5 (silicon blue)',
	body: P('#6E93B5',
		rr(3.6, 3.6, 8.8, 8.8, 1.2) + rect(5, 5, 1.6, 1.6), true)
		+ P('#6E93B5',
			rect(1.4, 5, 2.2, 1.3) + rect(1.4, 7.35, 2.2, 1.3) + rect(1.4, 9.7, 2.2, 1.3)
			+ rect(12.4, 5, 2.2, 1.3) + rect(12.4, 7.35, 2.2, 1.3) + rect(12.4, 9.7, 2.2, 1.3))
});

// 45 t4tt
add({ id: 't4tt', archetype: 'BADGE', fill: '#6B5E8C', file: 'Model.tt', group: '.NET & Windows',
	source: 'no brand → #6B5E8C (neutral lane)', ...B('t4tt', '#6B5E8C', 'T4') });

// 46 tamagui
add({ id: 'tamagui', archetype: 'BADGE', fill: '#9E6E68', file: 'tamagui.config.ts', group: 'front-end & UI',
	source: 'no brand → #9E6E68 (Tamagui rust, neutral lane)', ...B('tamagui', '#9E6E68', 'TG') });

// 47 tape — the cassette
add({
	id: 'tape', archetype: 'SILHOUETTE', fill: '#B9A98C', file: 'index.tape', group: 'testing & QA',
	source: 'no brand → #B9A98C (cassette tan)',
	body: P('#B9A98C',
		rr(1.6, 3.4, 12.8, 9.2, 1.4)
		+ rr(3.6, 5.4, 8.8, 3.8, 0.7)
		+ circ(6, 7.3, 1.35) + circ(10, 7.3, 1.35)
		+ rect(4.2, 10.6, 1.4, 1) + rect(10.4, 10.6, 1.4, 1), true)
});

// 48 tarkine
add({ id: 'tarkine', archetype: 'BADGE', fill: '#6E8E8E', file: 'view.tark', group: 'small languages',
	source: 'no brand → #6E8E8E (neutral lane)', ...B('tarkine', '#6E8E8E', 'TRK') });

// 49 tcl — the Tcl feather
add({
	id: 'tcl', archetype: 'SILHOUETTE', fill: '#8296B0', file: 'build.tcl', group: 'small languages',
	source: 'no brand → #8296B0 (Tcl feather slate)',
	body: P('#8296B0',
		'M13.6 1.8C13.6 7 10.4 11 5.9 11.6L2.5 14.2 1.7 13.4 4.3 10C4.9 5.5 8.6 2 13.6 1.8Z')
});

// 50 teal
add({ id: 'teal', archetype: 'BADGE', fill: '#5A8F8F', file: 'main.tl', group: 'small languages',
	source: 'no brand → #5A8F8F (neutral lane)', ...B('teal', '#5A8F8F', 'TL') });

// 51 templ
add({ id: 'templ', archetype: 'BADGE', fill: '#6E8F7E', file: 'page.templ', group: 'templates',
	source: 'no brand → #6E8F7E (Go-adjacent, neutral lane)', ...B('templ', '#6E8F7E', 'TPL') });

// 52 tera
add({ id: 'tera', archetype: 'BADGE', fill: '#9E7A62', file: 'index.tera', group: 'templates',
	source: 'no brand → #9E7A62 (Rust-adjacent, neutral lane)', ...B('tera', '#9E7A62', 'TER') });

// 53 test-jsx — the canon flask, react cyan (R3 family with testjs / testts)
add({
	id: 'test-jsx', archetype: 'SILHOUETTE', fill: '#46B5D1', file: 'Button.spec.tsx', group: 'testing & QA',
	source: 'react #61DAFB → #46B5D1 (R3 family with testjs / testts)',
	body: P('#46B5D1', FLASK)
});

// 54 testplane — the plane
add({
	id: 'testplane', archetype: 'SILHOUETTE', fill: '#5FA0C4', file: 'testplane.conf.ts', group: 'testing & QA',
	source: 'no brand → #5FA0C4',
	body: P('#5FA0C4', poly([[14.8, 1.8], [1.6, 7.5], [6.4, 9.4], [9.6, 14]]))
});

// 55 thinkscript — candlesticks
add({
	id: 'thinkscript', archetype: 'SILHOUETTE', fill: '#4FA07E', file: 'strategy.tosts', group: 'science & maths',
	source: 'no brand → #4FA07E (ticker green)',
	body: P('#4FA07E',
		rect(4.3, 2.8, 1, 9.4) + rr(2.8, 4.6, 4, 5.6, 0.5)
		+ rect(10.3, 4.2, 1, 9) + rr(8.8, 6, 4, 5.6, 0.5))
});

// 56 tilt — the tilted frame
add({
	id: 'tilt', archetype: 'SILHOUETTE', fill: '#4FAF8F', file: 'Tiltfile', group: 'infra & ops',
	source: 'no brand → #4FAF8F (Tilt green)',
	body: P('#4FAF8F',
		poly([[8, 1.6], [14.4, 8], [8, 14.4], [1.6, 8]])
		+ poly([[8, 5], [11, 8], [8, 11], [5, 8]]), true)
});

// 57 tldraw — a hand-drawn frame with a handle
add({
	id: 'tldraw', archetype: 'SILHOUETTE', fill: '#CFCCC8', file: 'sketch.tldr', group: 'notes & docs',
	source: 'brand #000000 → #CFCCC8 (lifted per §6.3)',
	body: P('#CFCCC8',
		'M2.2 3C5.6 2.2 10.4 2.4 13.6 3.1 14.2 6 14.1 10.2 13.5 13 10 13.8 5.4 13.7 2.4 13 1.8 9.8 1.8 6 2.2 3Z'
		+ 'M3.6 4.4C6.4 3.8 10 4 12.4 4.5 12.8 6.6 12.8 10 12.3 11.7 9.6 12.3 6 12.2 3.7 11.7 3.3 9.4 3.3 6.6 3.6 4.4Z', true)
		+ P('#CFCCC8', circ(12.9, 12.4, 1.5))
});

// 58 tm
add({ id: 'tm', archetype: 'BADGE', fill: '#7A8296', file: 'stack.tm.hcl', group: 'infra & ops',
	source: 'no brand → #7A8296 (Terramate slate, neutral lane)', ...B('tm', '#7A8296', 'TM') });

// 59 tobi
add({ id: 'tobi', archetype: 'BADGE', fill: '#6E8E6E', file: 'app.tobi', group: 'small languages',
	source: 'no brand → #6E8E6E (neutral lane)', ...B('tobi', '#6E8E6E', 'TB') });

// 60 toit
add({ id: 'toit', archetype: 'BADGE', fill: '#8E8E5E', file: 'main.toit', group: 'small languages',
	source: 'no brand → #8E8E5E (neutral lane)', ...B('toit', '#8E8E5E', 'TOI') });

// 61 toon
add({ id: 'toon', archetype: 'BADGE', fill: '#8A7E9E', file: 'data.toon', group: 'data & markup',
	source: 'no brand → #8A7E9E (neutral lane)', ...B('toon', '#8A7E9E', 'TO') });

// 62 tree — the hierarchy
add({
	id: 'tree', archetype: 'SILHOUETTE', fill: '#6FA37C', file: 'layout.tree', group: 'data & markup',
	source: 'no brand → #6FA37C',
	body: P('#6FA37C',
		rr(6, 1.8, 4, 3.4, 0.6)
		+ rect(7.35, 5.2, 1.3, 1.8) + rect(3.6, 7, 8.8, 1.3)
		+ rect(2.95, 8.3, 1.3, 2.5) + rect(11.75, 8.3, 1.3, 2.5)
		+ rr(1.6, 10.8, 4, 3.4, 0.6) + rr(10.4, 10.8, 4, 3.4, 0.6))
});

// 63 tres — the Godot resource gem
add({
	id: 'tres', archetype: 'SILHOUETTE', fill: '#4A8CB8', file: 'material.tres', group: 'shaders & 3D',
	source: 'godot #478CBF → #4A8CB8 (family with tscn)',
	body: P('#4A8CB8', poly([[4.4, 3.2], [11.6, 3.2], [14.4, 6.8], [8, 13.9], [1.6, 6.8]]))
});

// 64 tsbuildinfo — the cached copy
add({
	id: 'tsbuildinfo', archetype: 'SILHOUETTE', fill: '#6E9CC9', file: 'tsconfig.tsbuildinfo', group: 'front-end & UI',
	source: 'ts #3178C6 lifted → #6E9CC9 (derived-artifact tone)',
	body: P('#6E9CC9', rr(2, 2, 8.2, 8.2, 1.3) + rr(4.7, 4.7, 9.7, 9.7, 1.8), true)
		+ P('#6E9CC9', rr(5.6, 5.6, 7.9, 7.9, 1.3))
});

// 65 tscn — the Godot head
add({
	id: 'tscn', archetype: 'SILHOUETTE', fill: '#4A8CB8', file: 'level.tscn', group: 'shaders & 3D',
	source: 'godot #478CBF → #4A8CB8 (family with tres)',
	body: P('#4A8CB8',
		'M3 5.6C3 3.9 4.6 2.8 8 2.8S13 3.9 13 5.6V9.8C13 11.8 11 13 8 13S3 11.8 3 9.8Z'
		+ circ(5.6, 7, 1.3) + circ(10.4, 7, 1.3)
		+ rr(6.2, 9.9, 3.6, 1.2, 0.5), true)
});

// 66 tsil — the extension is literally "ц"
add({ id: 'tsil', archetype: 'BADGE', fill: '#8E6E7E', file: 'main.ц', group: 'small languages',
	source: 'no brand → #8E6E7E (neutral lane)', ...B('tsil', '#8E6E7E', 'Ц', { ink: null, cap: 7 }) });

// 67 tt
add({ id: 'tt', archetype: 'BADGE', fill: '#6E7A9E', file: 'page.tt2', group: 'templates',
	source: 'no brand → #6E7A9E (Perl-adjacent, neutral lane)', ...B('tt', '#6E7A9E', 'TT') });

// 68 ttcn
add({ id: 'ttcn', archetype: 'BADGE', fill: '#6E8E9E', file: 'suite.ttcn3', group: 'testing & QA',
	source: 'no brand → #6E8E9E (neutral lane)', ...B('ttcn', '#6E8E9E', 'TTC') });

// 69 tuc
add({ id: 'tuc', archetype: 'BADGE', fill: '#8E7E6E', file: 'flow.tuc', group: 'small languages',
	source: 'no brand → #8E7E6E (neutral lane)', ...B('tuc', '#8E7E6E', 'TUC') });

// 70 twig — the sprig
add({
	id: 'twig', archetype: 'SILHOUETTE', fill: '#86B25A', file: 'base.html.twig', group: 'templates',
	source: 'brand #78C043 → #86B25A',
	body: P('#86B25A',
		'M7.1 14.4C6.6 10.2 7.4 6.8 9.4 3.8L10.9 4.8C9.2 7.6 8.4 10.8 8.7 14.4Z'
		+ 'M7.5 10.4C5.2 10.8 2.8 9.4 1.6 7 4.2 6 6.9 7 8.1 9.2Z'
		+ 'M9.6 7.4C10 4.8 12 2.6 14.4 2.2 14.6 5 13 7.4 10.4 8.4Z')
});

// 71 twine — the spool
add({
	id: 'twine', archetype: 'SILHOUETTE', fill: '#4CA391', file: 'story.twee', group: 'notes & docs',
	source: 'no brand → #4CA391',
	body: P('#4CA391',
		rr(2.6, 2.6, 10.8, 2.4, 0.6) + rr(2.6, 11, 10.8, 2.4, 0.6)
		+ rr(5.4, 5, 5.2, 6, 0.4)
		+ rect(5.4, 6.6, 5.2, 0.8) + rect(5.4, 8.6, 5.2, 0.8), true)
});

// 72 typo3 — the TYPO3 T
add({
	id: 'typo3', archetype: 'GLYPH', fill: '#DE7F35', file: 'setup.typoscript', group: 'PHP & CMS',
	source: 'brand #FF8700 → #DE7F35',
	body: P('#DE7F35', 'M2.2 2.6H13.8V6.2H9.9V13.6H6.1V6.2H2.2Z')
});

// 73 typst — the Typst t
add({
	id: 'typst', archetype: 'SILHOUETTE', fill: '#3FA2AF', file: 'paper.typ', group: 'notes & docs',
	source: 'brand #239DAD → #3FA2AF',
	body: P('#3FA2AF',
		'M6 1.8H9.2V5.2H12.4V7.6H9.2V11C9.2 12.3 10 12.8 12 12.6V14.4C8 14.8 6 13.6 6 11.2V7.6H3.4V5.2H6Z')
});

// 74 uiua
add({ id: 'uiua', archetype: 'BADGE', fill: '#7E8E6E', file: 'main.ua', group: 'small languages',
	source: 'no brand → #7E8E6E (neutral lane)', ...B('uiua', '#7E8E6E', 'UA') });

// 75 unison — the .u file
add({ id: 'unison', archetype: 'BADGE', fill: '#6E6E9E', file: 'scratch.u', group: 'small languages',
	source: 'no brand → #6E6E9E (neutral lane)', ...B('unison', '#6E6E9E', 'U', { ink: null, cap: 7 }) });

// 76 unity — the cube
add({
	id: 'unity', archetype: 'SILHOUETTE', fill: '#C9CDD2', file: 'Scene.unity', group: 'shaders & 3D',
	source: 'brand #000000 → #C9CDD2 (lifted per §6.3)',
	body: P('#C9CDD2',
		poly([[8, 1.8], [14, 5.2], [8, 8.6], [2, 5.2]])
		+ poly([[2, 6.2], [7.4, 9.3], [7.4, 14.6], [2, 11.5]])
		+ poly([[14, 6.2], [8.6, 9.3], [8.6, 14.6], [14, 11.5]]))
});

// 77 url — the external link
add({
	id: 'url', archetype: 'SILHOUETTE', fill: '#6E93C4', file: 'docs.url', group: 'data & markup',
	source: 'no brand → #6E93C4',
	body: P('#6E93C4',
		poly([[2.4, 5.2], [8, 5.2], [8, 6.9], [4.1, 6.9], [4.1, 12.3], [9.5, 12.3], [9.5, 8.4],
			[11.2, 8.4], [11.2, 14], [2.4, 14]])
		+ poly([[9, 2.2], [13.8, 2.2], [13.8, 7], [12, 7], [12, 5.3], [8.6, 8.7], [7.3, 7.4],
			[10.7, 4], [9, 4]]))
});

// 78 uv — the lowercase wordmark
add({
	id: 'uv', archetype: 'GLYPH', fill: '#A97BD1', file: 'uv.lock', group: 'infra & ops',
	source: 'no brand → #A97BD1 (uv violet, lifted for 16 px contrast)',
	body: P('#A97BD1', glyphText('uv', { xheight: 7, cy: 8 }).d)
});

// 79 vala — the Vala V
add({
	id: 'vala', archetype: 'SILHOUETTE', fill: '#7E6BC8', file: 'window.vala', group: 'small languages',
	source: 'no brand → #7E6BC8 (Vala violet)',
	body: P('#7E6BC8', poly([[1.8, 3.2], [5.4, 3.2], [8.2, 10.6], [11.6, 2.6], [14.2, 3.8], [9.8, 13.8], [6.6, 13.8]]))
});

// 80 valgrind — the magnifier
add({
	id: 'valgrind', archetype: 'SILHOUETTE', fill: '#8E7EA8', file: 'leaks.supp', group: 'testing & QA',
	source: 'no brand → #8E7EA8 (Valgrind violet-grey)',
	body: P('#8E7EA8', circ(6.6, 6.6, 4.6) + circ(6.6, 6.6, 2.9), true)
		+ P('#8E7EA8', poly([[9.6, 7.9], [13, 11.3], [13, 14.7], [9.6, 11.3]]))
});

// 81 vanilla-extract — the bottle
add({
	id: 'vanilla-extract', archetype: 'SILHOUETTE', fill: '#D5C08E', file: 'theme.css.ts', group: 'CSS family',
	source: 'no brand → #D5C08E (vanilla cream)',
	body: P('#D5C08E',
		rr(6.6, 1.6, 2.8, 2.8, 0.5)
		+ 'M3.8 6.6C3.8 5.4 5.4 4.4 5.4 4.4H10.6C10.6 4.4 12.2 5.4 12.2 6.6V12.7A1.5 1.5 0 0 1 10.7 14.2H5.3A1.5 1.5 0 0 1 3.8 12.7Z'
		+ rr(5.4, 8.2, 5.2, 3.4, 0.4), true)
});

// 82 vapi
add({ id: 'vapi', archetype: 'BADGE', fill: '#8272A0', file: 'gtk+-3.0.vapi', group: 'small languages',
	source: 'no brand → #8272A0 (Vala-adjacent, neutral lane)', ...B('vapi', '#8272A0', 'API') });

// 83 varnish — the can
add({
	id: 'varnish', archetype: 'SILHOUETTE', fill: '#C4553F', file: 'default.vcl', group: 'infra & ops',
	source: 'no brand → #C4553F (Varnish red)',
	body: P('#C4553F',
		'M3.8 4.2A4.2 3.2 0 0 1 12.2 4.2H10.6A2.6 2 0 0 0 5.4 4.2Z'
		+ rr(3, 4.2, 10, 1.6, 0.5)
		+ rr(3.4, 5.8, 9.2, 8, 0.8))
});

// 84 vash
add({ id: 'vash', archetype: 'BADGE', fill: '#7E7A8E', file: 'index.vash', group: 'templates',
	source: 'no brand → #7E7A8E (neutral lane)', ...B('vash', '#7E7A8E', 'VSH') });

export const ICONS = R.map(i => ({ ...i, fills: i.fills || [i.fill] }));
