// A03 roster, part 1: fastlane … gcode
import { icon, badge, P, glyphLetters } from './build-a03.mjs';

// 1 fastlane — the lane itself, in perspective, with its centre dashes knocked out.
icon('fastlane', 'SILHOUETTE', '#5FBE93',
	P('#5FBE93', 'M1.35 13.4H14.65L9.3 3.1H6.7ZM7.25 13.05h1.5v-2.1h-1.5zM7.35 9.85h1.3v-1.8h-1.3z', true),
	'no brand → #5FBE93 (fastlane mint)');

// 2 fauna — the two-lobe Fauna leaf.
icon('fauna', 'SILHOUETTE', '#9C5FC4',
	P('#9C5FC4', 'M8 2.2C11.9 4.4 13.4 8.2 12 11.9 9.6 10.7 8.2 8.5 8 6ZM8 13.8C4.1 11.6 2.6 7.8 4 4.1 6.4 5.3 7.8 7.5 8 10Z'),
	'no brand → #9C5FC4 (Fauna violet)');

// 3 fbx — binary 3D interchange; a cube would collide with the node hexagon (R8), so letters.
badge('fbx', '#6E8598', 'FBX', { ink: 10.9, letterSpacing: -0.02 }, 'no brand → #6E8598 (neutral 3D slate)');

// 4 firebasestorage — a handled bucket: storage, kept clear of the sql cylinder (R8).
icon('firebasestorage', 'SILHOUETTE', '#EBBE45',
	P('#EBBE45', 'M4.7 4.6a3.3 3.3 0 0 1 6.6 0h-1.5a1.8 1.8 0 0 0-3.6 0ZM2.7 5.2h10.6l-1.24 7.9a1.4 1.4 0 0 1-1.38 1.2H5.32a1.4 1.4 0 0 1-1.38-1.2Z'),
	'Firebase amber #FFCA28 → #EBBE45 (family with core firebase)');

// 5 firestore — stacked document layers.
icon('firestore', 'SILHOUETTE', '#E0A23C',
	P('#E0A23C', 'M8 1.9 13.6 3.4 8 4.9 2.4 3.4ZM8 6.2 13.6 7.7 8 9.2 2.4 7.7ZM8 10.5 13.6 12 8 13.5 2.4 12Z'),
	'Firebase amber → #E0A23C (family with core firebase)');

// 6 fitbit — the ascending dot field.
icon('fitbit', 'GLYPH', '#328190',
	P('#328190', [[3.4, 13.1], [6.4, 13.1], [6.4, 10.4], [9.4, 13.1], [9.4, 10.4], [9.4, 7.7],
		[12.4, 13.1], [12.4, 10.4], [12.4, 7.7], [12.4, 5]]
		.map(([x, y]) => `M${x - .95} ${y}a.95 .95 0 1 0 1.9 0a.95 .95 0 1 0-1.9 0Z`).join('')),
	'Fitbit teal #00B0B9 → #328190');

// 7 fla — Adobe Flash source.
badge('fla', '#8A2036', 'FLA', { ink: 10.9, letterSpacing: -0.02 }, 'Adobe Flash dark plate red → #8A2036 (family with flash)');

// 8 flash — the compiled swf/swc side of the same product.
badge('flash', '#8A2036', 'SWF', { ink: 11.1, letterSpacing: -0.02 }, 'Adobe Flash dark plate red → #8A2036 (family with fla)');

// 9 flatbuffers — a bracketed buffer of cells.
icon('flatbuffers', 'GLYPH', '#4A55A0',
	P('#4A55A0', 'M1.9 3.6h2v1.3H3.2v6.2h.7v1.3h-2ZM14.1 3.6h-2v1.3h.7v6.2h-.7v1.3h2ZM4.6 6.9h1.75v2.2H4.6ZM7.13 6.9h1.75v2.2H7.13ZM9.65 6.9h1.75v2.2H9.65Z'),
	'no brand → #4A55A0 (serialization indigo)');

// 10 flow — a typed value flowing through a turn.
icon('flow', 'GLYPH', '#C4923A',
	P('#C4923A', 'M3 12.8V10.4c0-2.4 1.9-4 4.3-4h3.3V3.8L15 7.4l-4.4 3.6V8.4H7.3c-1.3 0-2.3.9-2.3 2.2v2.6Z'),
	'no brand → #C4923A (Flow honey)');

// 11 flowgorithm — terminator, connector, decision diamond.
icon('flowgorithm', 'SILHOUETTE', '#4A93C4',
	P('#4A93C4', 'M5.7 1.6h4.6a1.4 1.4 0 0 1 0 2.8H5.7a1.4 1.4 0 0 1 0-2.8ZM7.35 4.6h1.3v1.6h-1.3ZM8 6.2 13.2 9.7 8 13.2 2.8 9.7Z'),
	'no brand → #4A93C4 (flowchart blue)');

// 12 flutter-package — the Flutter mark, from the official geometry.
icon('flutter-package', 'SILHOUETTE', '#46A8DC',
	P('#46A8DC', 'M9.24 1.42 2.7 7.96 4.73 9.99 13.29 1.42ZM9.18 7.47 5.69 10.96 7.72 13.02 9.75 11 13.29 7.47ZM7.72 13.02 9.26 14.56H13.29L9.75 11Z'),
	'Flutter #54C5F8 → #46A8DC (family with core dartlang)');

// 13 formkit — two form fields, one filled.
icon('formkit', 'GLYPH', '#28A86A',
	P('#28A86A', 'M1.8 3h12.4v4H1.8Zm1.3 1.3v1.4h9.8V4.3ZM1.8 9h12.4v4H1.8Zm1.3 1.3v1.4h9.8v-1.4ZM3.4 10.3h4.4v1.4H3.4Z', true),
	'no brand → #28A86A (FormKit green)');

// 14 forth — the 4th, bare.
icon('forth', 'GLYPH', '#6A5293',
	glyphLetters('4th', { ink: 11.6, fill: '#6A5293' }).d,
	'no brand → #6A5293 (matte violet, clear of the GLYPH warm lane)');

// 15 fortran — fortran-lang ships a purple F; the F is the mark.
icon('fortran', 'GLYPH', '#8C6BC0',
	glyphLetters('F', { cap: 9.6, fill: '#8C6BC0' }).d,
	'fortran-lang purple #734F96 → #8C6BC0');

// 16 fossil — an ammonite: a shell ring that thickens to the aperture.
icon('fossil', 'SILHOUETTE', '#7A9E63',
	P('#7A9E63', 'M13 11.53A5.9 5.9 0 1 1 13.9 8.4L12.7 8.4A3.3 3.3 0 1 0 11.05 11.26Z'),
	'no brand → #7A9E63 (fossil moss)');

// 17 foxpro — the fox.
icon('foxpro', 'SILHOUETTE', '#D2622F',
	P('#D2622F', 'M3.4 4.8h9.2l-.6 4.4c-.4 2.4-2.2 4.2-4 5-1.8-.8-3.6-2.6-4-5ZM3.4 4.8 2.7 1.7 6.2 3.9ZM12.6 4.8 13.3 1.7 9.8 3.9ZM5.35 7.6a.75 .75 0 1 0 1.5 0a.75 .75 0 1 0-1.5 0ZM9.15 7.6a.75 .75 0 1 0 1.5 0a.75 .75 0 1 0-1.5 0Z', true),
	'no brand → #D2622F (FoxPro rust)');

// 18 freemarker
badge('freemarker', '#C08060', 'FTL', { ink: 10.8, letterSpacing: -0.02 }, 'no brand → #C08060 (template tan)');

// 19 fritzing — a breadboard.
icon('fritzing', 'GLYPH', '#A38A5C',
	P('#A38A5C', 'M3 3.2h10a1.4 1.4 0 0 1 1.4 1.4v6.8a1.4 1.4 0 0 1-1.4 1.4H3a1.4 1.4 0 0 1-1.4-1.4V4.6A1.4 1.4 0 0 1 3 3.2Z'
		+ [5.6, 8, 10.4].flatMap(y => [4, 6.6, 9.2, 11.8].map(x => `M${x - .65} ${y}a.65 .65 0 1 0 1.3 0a.65 .65 0 1 0-1.3 0Z`)).join(''), true),
	'no brand → #A38A5C (copper)');

// 20 fsproj — the F# plate; core fsharp is the bare glyph, this is the project.
badge('fsproj', '#35A0A0', 'F#', { ink: 9.4 }, 'F# teal #378BBA → #35A0A0 (family with core fsharp)');

// 21 fthtml
badge('fthtml', '#5E7A8C', 'ft', { ink: 8.2, band: 'x' }, 'no brand → #5E7A8C (neutral lane)');

// 22 fusebox — a box with a lit fuse.
icon('fusebox', 'SILHOUETTE', '#5F6FA8',
	P('#5F6FA8', 'M3.1 5.4h9.8a1.3 1.3 0 0 1 1.3 1.3v6a1.3 1.3 0 0 1-1.3 1.3H3.1a1.3 1.3 0 0 1-1.3-1.3v-6a1.3 1.3 0 0 1 1.3-1.3ZM9.6 5.4c0-2.3 1.5-3.4 3.2-3.4v1.4c-1.1 0-1.9.7-1.9 2ZM12.75 2.2a1.05 1.05 0 1 1 2.1 0a1.05 1.05 0 1 1-2.1 0Z'),
	'no brand → #5F6FA8 (FuseBox indigo)');

// 23 galen — a layout box under measurement.
icon('galen', 'GLYPH', '#6FB3B8',
	P('#6FB3B8', 'M2.4 2.6h11.2v6.8H2.4Zm1.3 1.3v4.2h8.6V3.9ZM2 11.9 4.4 10.5v2.8ZM14 11.9 11.6 10.5v2.8ZM4.2 11.3h7.6v1.2H4.2Z', true),
	'no brand → #6FB3B8 (layout steel)');

// 24-26 GameMaker — one family, three versions.
badge('gamemaker', '#3F9E6B', 'GM', { ink: 9.5 }, 'GameMaker green → #3F9E6B (family)');
badge('gamemaker2', '#3F9E6B', 'GM2', { ink: 11.2, letterSpacing: -0.02 }, 'GameMaker green → #3F9E6B (family)');
badge('gamemaker81', '#3F9E6B', 'G81', { ink: 11, letterSpacing: -0.02 }, 'GameMaker green → #3F9E6B (family)');

// 27 gatsby — the purple G.
badge('gatsby', '#6B3FA0', 'G', { ink: 5.5 }, 'brand #663399 → #6B3FA0');

// 28 gcode — the nozzle laying down layers.
icon('gcode', 'GLYPH', '#8A93A0',
	P('#8A93A0', 'M5.4 2.4h5.2v3H5.4ZM5.4 5.4h5.2L8.9 7.9H7.1ZM7.3 7.9h1.4v1.1H7.3ZM2.6 10.2h10.8v1.3H2.6ZM2.6 12.4h10.8v1.3H2.6Z'),
	'no brand → #8A93A0 (machine graphite, neutral lane)');
