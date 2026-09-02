// a09-roster.mjs — slice A09 (84 config-domain long-tail concepts, b -> g).
// arch: BADGE (plate + letterpath letters) | SILHOUETTE | GLYPH.
// `src` records the colour source for the contact-sheet manifest.

export const ROSTER = [

// ---- b ---------------------------------------------------------------------
{
	id: 'brunch', arch: 'BADGE', text: 'BR', hex: '#A08F7C',
	src: 'no brand -> warm taupe (neutral lane)'
},
{
	id: 'buf', arch: 'BADGE', text: 'BUF', hex: '#5C6E8C',
	src: 'buf.build navy -> lifted slate'
},
{
	id: 'buildkite', arch: 'BADGE', text: 'BK', hex: '#5DBE61',
	src: 'no brand -> Material buildkite green #5DBE61'
},
{
	id: 'bundlemon', arch: 'BADGE', text: 'BM', hex: '#8FD0DC', letterFill: '#123A42',
	src: 'no brand -> light cyan (dark letters)'
},
{
	id: 'bundler', arch: 'SILHOUETTE', hex: '#B8453C',
	body: '<path fill="#B8453C" d="M3 2.4h2.8v3.8H3zM6.5 2.4h2.8v3.8H6.5zM10 2.4h2.8v3.8H10zM2.2 6.9h11.6v2.2H2.2zM3 9.8h2.8v3.8H3zM6.5 9.8h2.8v3.8H6.5zM10 9.8h2.8v3.8H10z"/>',
	src: 'brand #CC342D -> #B8453C'
},
{
	id: 'bunfig', arch: 'SILHOUETTE', hex: '#DCCCA6',
	body: '<path fill="#DCCCA6" d="M1.5 11.1a6.5 6.6 0 0 1 13 0v1.5a.9 .9 0 0 1-.9 .9H2.4a.9 .9 0 0 1-.9-.9z"/>',
	src: 'bun family cream #E5D9C3 -> #DCCCA6'
},
{
	id: 'capacitor', arch: 'SILHOUETTE', hex: '#2E8FD0',
	body: '<path fill="#2E8FD0" d="M1.2 7.35h4.5v1.3H1.2zM10.3 7.35h4.5v1.3H10.3zM5.7 2.6h1.4v10.8H5.7zM8.9 2.6h1.4v10.8H8.9z"/>',
	src: 'brand #119EFF -> #2E8FD0'
},
{
	id: 'cargo', arch: 'SILHOUETTE', hex: '#B04A32',
	body: '<path fill="#B04A32" fill-rule="evenodd" d="M2.4 3.5h11.2a.8 .8 0 0 1 .8 .8v8.4a.8 .8 0 0 1-.8 .8H2.4a.8 .8 0 0 1-.8-.8V4.3a.8 .8 0 0 1 .8-.8ZM2.9 5h4.2v6.4H2.9zM8.9 5h4.2v6.4H8.9z"/>',
	src: 'brand #CE422B -> #B04A32'
},

// ---- c ---------------------------------------------------------------------
{
	id: 'changie', arch: 'BADGE', text: 'CHG', hex: '#83723F',
	src: 'no brand -> dark olive gold'
},
{
	id: 'chromatic', arch: 'BADGE', text: 'CH', hex: '#C44A96',
	src: 'brand spectrum magenta -> #C44A96'
},
{
	id: 'circleci', arch: 'SILHOUETTE', hex: '#A9AFB4',
	body: '<path fill="#A9AFB4" d="M13.92 5.85A6.3 6.3 0 1 0 13.92 10.15L12.13 9.5A4.4 4.4 0 1 1 12.13 6.5Z"/><path fill="#A9AFB4" d="M8 5.5a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0-5Z"/>',
	src: 'brand #343434 lifted -> #A9AFB4'
},
{
	id: 'clangd', arch: 'BADGE', text: 'cd', hex: '#8A9AAE',
	src: 'C-family steel -> #8A9AAE (neutral lane)'
},
{
	id: 'cline', arch: 'BADGE', text: 'CLN', hex: '#A6B3C6', letterFill: '#2A3646',
	src: 'no brand -> light steel (dark letters)'
},
{
	id: 'cloudflare', arch: 'SILHOUETTE', hex: '#D9862F',
	body: '<path fill="#D9862F" d="M2 9v2.5a1.3 1.3 0 0 0 1.3 1.3h9.4a1.3 1.3 0 0 0 1.3-1.3V9zM5 5.9a2.9 2.9 0 1 0 0 5.8a2.9 2.9 0 1 0 0-5.8ZM9 3.3a3.9 3.9 0 1 0 0 7.8a3.9 3.9 0 1 0 0-7.8ZM12.4 7.2a2.2 2.2 0 1 0 0 4.4a2.2 2.2 0 1 0 0-4.4Z"/>',
	src: 'brand #F38020 -> #D9862F'
},

// ---- c (continued) ---------------------------------------------------------
{
	id: 'cloudfoundry', arch: 'BADGE', text: 'CF', hex: '#A0B6BE', letterFill: '#22383F',
	src: 'brand cloud blue -> pale steel (neutral lane, dark letters)'
},
{
	id: 'codacy', arch: 'BADGE', text: 'CY', hex: '#63BFAE', letterFill: '#143A33',
	src: 'brand teal -> #63BFAE (dark letters)'
},
{
	id: 'codeclimate', arch: 'BADGE', text: 'CC', hex: '#6E8F7E',
	src: 'no brand -> slate green (neutral lane)'
},
{
	id: 'codecov', arch: 'SILHOUETTE', hex: '#D24A8E',
	body: '<path fill="#D24A8E" d="M1.6 8.4a6.4 5.6 0 0 1 12.8 0z"/><path fill="#D24A8E" d="M7.25 8.4h1.5v3.4a1.9 1.9 0 0 1-3.8 0h1.5a.4 .4 0 0 0 .8 0z"/>',
	src: 'brand #F01F7A -> #D24A8E'
},
{
	id: 'codemagic', arch: 'BADGE', text: 'CM', hex: '#7C8FA0',
	src: 'no brand -> steel (neutral lane)'
},
{
	id: 'coderabbit', arch: 'SILHOUETTE', hex: '#C9662E',
	body: '<path fill="#C9662E" d="M8 6.5a5 3.7 0 1 0 0 7.4a5 3.7 0 1 0 0-7.4Z"/><path fill="#C9662E" d="M7.5 3.4a1.3 1.3 0 0 0-2.6 0v4.4h2.6zM11.1 3.4a1.3 1.3 0 0 0-2.6 0v4.4h2.6z"/>',
	src: 'brand orange -> #C9662E'
},
{
	id: 'coffeelint', arch: 'SILHOUETTE', hex: '#A9825E',
	body: '<path fill="#A9825E" d="M2.2 4.2h9.2l-1 8a1.3 1.3 0 0 1-1.3 1.1H4.5a1.3 1.3 0 0 1-1.3-1.1z"/><path fill="#A9825E" d="M11.6 5.5a3.1 3.1 0 0 1 0 6.2v-1.5a1.6 1.6 0 0 0 0-3.2z"/>',
	src: 'CoffeeScript brown -> #A9825E'
},
{
	id: 'commitizen', arch: 'BADGE', text: 'cz', hex: '#6FA847',
	src: 'commit-tool family green -> #6FA847'
},
{
	id: 'commitlint', arch: 'BADGE', text: 'CL', hex: '#6FA847',
	src: 'commit-tool family green -> #6FA847 (family rhyme with commitizen)'
},
{
	id: 'composer', arch: 'BADGE', text: 'CO', hex: '#A5714A',
	src: 'brand #885630 -> #A5714A'
},
{
	id: 'concourse', arch: 'BADGE', text: 'CNC', hex: '#7C93A8',
	src: 'brand blue -> slate (neutral lane)'
},
{
	id: 'conda', arch: 'BADGE', text: 'CN', hex: '#4E9E3E',
	src: 'brand #44A833 -> #4E9E3E'
},
{
	id: 'container', arch: 'SILHOUETTE', hex: '#3E93C8',
	body: '<path fill="#3E93C8" fill-rule="evenodd" d="M2.4 3.6h11.2a1 1 0 0 1 1 1v6.8a1 1 0 0 1-1 1H2.4a1 1 0 0 1-1-1V4.6a1 1 0 0 1 1-1ZM3.1 6.6h9.8v1.3H3.1zM3.1 9h9.8v1.3H3.1z"/>',
	src: 'devcontainer blue -> #3E93C8'
},
{
	id: 'contentlayer', arch: 'SILHOUETTE', hex: '#5FA8A0',
	body: '<path fill="#5FA8A0" d="M8 1.8 14.4 5.1 8 8.4 1.6 5.1Z"/><path fill="#5FA8A0" d="M1.6 7.6 8 11 14.4 7.6v1.3L8 12.3 1.6 8.9Z"/>',
	src: 'no brand -> teal'
},
{
	id: 'context7', arch: 'BADGE', text: 'C7', hex: '#9AD6C2', letterFill: '#17453A',
	src: 'Upstash green -> pale #9AD6C2 (dark letters)'
},
{
	id: 'convex', arch: 'BADGE', text: 'CX', hex: '#E27166',
	src: 'brand convex red -> #E27166'
},
{
	id: 'coveralls', arch: 'BADGE', text: 'CV', hex: '#A8455A',
	src: 'no brand -> muted crimson'
},
{
	id: 'craco', arch: 'BADGE', text: 'CRA', hex: '#8FAEB8',
	src: 'CRA blue -> pale steel (neutral lane)', letterFill: '#233A42'
},
{
	id: 'crowdin', arch: 'BADGE', text: 'CW', hex: '#9AD4AD', letterFill: '#173A26',
	src: 'brand green -> light #9AD4AD (dark letters)'
},
{
	id: 'cspell', arch: 'BADGE', text: 'ABC', hex: '#A8CBE8', letterFill: '#1B3A52',
	src: 'brand blue -> pale #A8CBE8 (dark letters)'
},
{
	id: 'csscomb', arch: 'SILHOUETTE', hex: '#35A3B8',
	body: '<path fill="#35A3B8" d="M1.7 3h12.6v2.7H1.7z"/><path fill="#35A3B8" d="M1.95 5.7h1.7l-.4 7.6h-.9zM4.65 5.7h1.7l-.4 7.6h-.9zM7.35 5.7h1.7l-.4 7.6h-.9zM10.05 5.7h1.7l-.4 7.6h-.9zM12.75 5.7h1.7l-.4 7.6h-.9z"/>',
	src: 'CSS cyan -> #35A3B8'
},
{
	id: 'csslint', arch: 'BADGE', text: 'CSL', hex: '#849AAF',
	src: 'CSS blue -> pale steel (neutral lane)'
},
{
	id: 'cursorrules', arch: 'GLYPH', hex: '#9FAAB8',
	body: '<path fill="#9FAAB8" d="M1.6 2.6h10.4v1.4H1.6zM1.6 5.7h8v1.4H1.6zM1.6 8.8h5.2v1.4H1.6z"/><path fill="#9FAAB8" d="M8.4 7.4 13.9 11.9 11.5 12.2 12.7 14.3 11.4 14.9 10.2 12.8 8.4 14.3Z"/>',
	src: 'core cursor grey #9FAAB8 (family rhyme, GLYPH)'
},
{
	id: 'cvs', arch: 'BADGE', text: 'CVS', hex: '#ADBB81', letterFill: '#2E3616',
	src: 'no brand -> light olive (dark letters)'
},
{
	id: 'darcs', arch: 'BADGE', text: 'DA', hex: '#4A3D71',
	src: 'no brand -> deep violet'
},
{
	id: 'dartlang-ignore', arch: 'SILHOUETTE', hex: '#35709E',
	body: '<path fill="#35709E" fill-rule="evenodd" d="M8 2.1a5.9 5.9 0 1 0 0 11.8a5.9 5.9 0 1 0 0-11.8ZM8 3.9a4.1 4.1 0 1 1 0 8.2a4.1 4.1 0 1 1 0-8.2Z"/><path fill="#35709E" d="M4.28 11.72 12.62 3.38 13.97 4.73 5.63 13.07Z"/>',
	src: 'Dart blue #35709E (core dartlang family)'
},
{
	id: 'databricks', arch: 'SILHOUETTE', hex: '#D14A32',
	body: '<path fill="#D14A32" d="M2.6 3h11l-1.6 2.4H1zM2.6 6.8h11l-1.6 2.4H1zM2.6 10.6h11L12 13H1z"/>',
	src: 'brand #FF3621 -> #D14A32'
},
{
	id: 'datadog', arch: 'SILHOUETTE', hex: '#7E5CC4',
	body: '<path fill="#7E5CC4" d="M4.8 5.4h6.4a1.8 1.8 0 0 1 1.8 1.8v4.8a1.8 1.8 0 0 1-1.8 1.8H4.8a1.8 1.8 0 0 1-1.8-1.8V7.2a1.8 1.8 0 0 1 1.8-1.8Z"/><path fill="#7E5CC4" d="M3 5.6V1.9l4 3.5zM13 5.6V1.9L9 5.4z"/>',
	src: 'brand #632CA6 -> #7E5CC4'
},

// ---- d (continued) ---------------------------------------------------------
{
	id: 'dbt', arch: 'BADGE', text: 'dbt', hex: '#DB7742',
	src: 'brand dbt orange -> #DB7742'
},
{
	id: 'dbt-bouncer', arch: 'BADGE', text: 'dbb', hex: '#DB7742',
	src: 'dbt family orange #DB7742 (family rhyme with dbt)'
},
{
	id: 'deepsource', arch: 'BADGE', text: 'DS', hex: '#6E7C94',
	src: 'brand navy -> slate (neutral lane)'
},
{
	id: 'denoify', arch: 'BADGE', text: 'DY', hex: '#4FB88A', letterFill: '#0E3527',
	src: 'core deno #4FB88A (family rhyme with deno)'
},
{
	id: 'dependabot', arch: 'SILHOUETTE', hex: '#2E7898',
	body: '<path fill="#2E7898" fill-rule="evenodd" d="M3.2 5.4h9.6a1.7 1.7 0 0 1 1.7 1.7v4.8a1.7 1.7 0 0 1-1.7 1.7H3.2a1.7 1.7 0 0 1-1.7-1.7V7.1a1.7 1.7 0 0 1 1.7-1.7ZM5.9 8a1.2 1.2 0 1 1 0 2.4a1.2 1.2 0 1 1 0-2.4ZM10.1 8a1.2 1.2 0 1 1 0 2.4a1.2 1.2 0 1 1 0-2.4Z"/><path fill="#2E7898" d="M7.35 3.4h1.3v2.4h-1.3z"/><path fill="#2E7898" d="M8 1.3a1.3 1.3 0 1 0 0 2.6a1.3 1.3 0 1 0 0-2.6Z"/>',
	src: 'brand #025E8C -> #2E7898'
},
{
	id: 'dependencies', arch: 'SILHOUETTE', hex: '#7E9EB8',
	body: '<path fill="#7E9EB8" d="M8 1.2a1.7 1.7 0 1 0 0 3.4a1.7 1.7 0 1 0 0-3.4ZM3.6 10.7a1.7 1.7 0 1 0 0 3.4a1.7 1.7 0 1 0 0-3.4ZM12.4 10.7a1.7 1.7 0 1 0 0 3.4a1.7 1.7 0 1 0 0-3.4Z"/><path fill="#7E9EB8" d="M7.35 4.4h1.3v3.2h-1.3zM2.95 7h10.1v1.3H2.95zM2.95 8h1.3v2.9h-1.3zM11.75 8h1.3v2.9h-1.3z"/>',
	src: 'no brand -> steel blue'
},
{
	id: 'devcontainer', arch: 'SILHOUETTE', hex: '#4E9ED0',
	body: '<path fill="#4E9ED0" d="M6 3.4 7.4 4.7 4.3 8 7.4 11.3 6 12.6 1.6 8ZM10 3.4 8.6 4.7 11.7 8 8.6 11.3 10 12.6 14.4 8Z"/><path fill="#4E9ED0" d="M7 6.6h2a.4 .4 0 0 1 .4 .4v2a.4 .4 0 0 1-.4 .4h-2a.4 .4 0 0 1-.4-.4V7a.4 .4 0 0 1 .4-.4Z"/>',
	src: 'devcontainer blue -> #4E9ED0'
},
{
	id: 'devvit', arch: 'SILHOUETTE', hex: '#D2542E',
	body: '<path fill="#D2542E" fill-rule="evenodd" d="M8 5.7a3.9 3.9 0 1 0 0 7.8a3.9 3.9 0 1 0 0-7.8ZM6.5 8.1a.9 .9 0 1 1 0 1.8a.9 .9 0 1 1 0-1.8ZM9.5 8.1a.9 .9 0 1 1 0 1.8a.9 .9 0 1 1 0-1.8Z"/><path fill="#D2542E" d="M3.2 7.6a1.6 1.6 0 1 0 0 3.2a1.6 1.6 0 1 0 0-3.2ZM12.8 7.6a1.6 1.6 0 1 0 0 3.2a1.6 1.6 0 1 0 0-3.2ZM7.3 3.4h1.4v3.2H7.3Z"/><path fill="#D2542E" d="M8 1.6a1.25 1.25 0 1 0 0 2.5a1.25 1.25 0 1 0 0-2.5Z"/>',
	src: 'Reddit brand #FF4500 -> #D2542E'
},
{
	id: 'direnv', arch: 'BADGE', text: 'ENV', hex: '#C4BC4E', letterFill: '#3A380F',
	src: 'dotenv family yellow -> #C4BC4E (dark letters)'
},
{
	id: 'dockertest', arch: 'SILHOUETTE', hex: '#2E7CA8',
	body: '<path fill="#2E7CA8" d="M2 1.9h3v2.7H2zM5.7 1.9h3v2.7h-3zM9.4 1.9h3v2.7h-3z"/><path fill="#2E7CA8" d="M6.9 14 3.1 10.2 5 8.3 6.9 10.2 11.7 5.4 13.6 7.3Z"/>',
	src: 'docker blue -> #2E7CA8'
},
{
	id: 'dojo', arch: 'BADGE', text: 'DJ', hex: '#7EA89A',
	src: 'no brand -> sea grey (neutral lane)'
},
{
	id: 'doppler', arch: 'BADGE', text: 'DP', hex: '#6E76A0',
	src: 'brand indigo -> #6E76A0 (neutral lane)'
},
{
	id: 'drizzle', arch: 'BADGE', text: 'DZ', hex: '#B8D94A', letterFill: '#2E3A10',
	src: 'brand #C5F74F -> #B8D94A (dark letters)'
},
{
	id: 'drizzle-orm', arch: 'SILHOUETTE', hex: '#B8D94A',
	body: '<path fill="#B8D94A" d="M4.6 2.6h3l-1.4 2.4h-3zM8 2.6h3l-1.4 2.4h-3zM11.4 2.6h3l-1.4 2.4h-3zM3.8 6.2h3l-1.4 2.4h-3zM7.2 6.2h3l-1.4 2.4h-3zM10.6 6.2h3l-1.4 2.4h-3zM3 9.8h3l-1.4 2.4h-3zM6.4 9.8h3l-1.4 2.4h-3zM9.8 9.8h3l-1.4 2.4h-3z"/>',
	src: 'brand #C5F74F -> #B8D94A'
},
{
	id: 'drone', arch: 'SILHOUETTE', hex: '#93A4B0',
	body: '<path fill="#93A4B0" d="M3.73 2.67 13.33 12.27 12.27 13.33 2.67 3.73ZM13.33 3.73 3.73 13.33 2.67 12.27 12.27 2.67Z"/><path fill="#93A4B0" d="M3.2 1.45a1.75 1.75 0 1 0 0 3.5a1.75 1.75 0 1 0 0-3.5ZM12.8 1.45a1.75 1.75 0 1 0 0 3.5a1.75 1.75 0 1 0 0-3.5ZM3.2 11.05a1.75 1.75 0 1 0 0 3.5a1.75 1.75 0 1 0 0-3.5ZM12.8 11.05a1.75 1.75 0 1 0 0 3.5a1.75 1.75 0 1 0 0-3.5Z"/><path fill="#93A4B0" d="M6.2 6.2h3.6a1 1 0 0 1 1 1v1.6a1 1 0 0 1-1 1H6.2a1 1 0 0 1-1-1V7.2a1 1 0 0 1 1-1Z"/>',
	src: 'no brand -> Material drone grey'
},

// ---- e / f -----------------------------------------------------------------
{
	id: 'eas-metadata', arch: 'BADGE', text: 'EAS', hex: '#68779E',
	src: 'core expo #68779E (family rhyme with expo)'
},
{
	id: 'electron', arch: 'SILHOUETTE', hex: '#47848F',
	body: '<path fill="#47848F" fill-rule="evenodd" d="M13.54 4.8A6.6 3.3 -30 1 1 2.46 11.2A6.6 3.3 -30 1 1 13.54 4.8ZM11.9 5.75A5 1.6 -30 1 0 4.1 10.25A5 1.6 -30 1 0 11.9 5.75Z"/><path fill="#47848F" d="M8 6a2 2 0 1 0 0 4a2 2 0 1 0 0-4Z"/>',
	src: 'brand #47848F'
},
{
	id: 'eleventy', arch: 'GLYPH', text: '11', inkHeight: 9.6, hex: '#B49088',
	src: 'no brand -> warm grey (neutral lane); 11ty wordmark digits'
},
{
	id: 'esphome', arch: 'SILHOUETTE', hex: '#3FA8C4',
	body: '<path fill="#3FA8C4" fill-rule="evenodd" d="M8 1.8 14.6 7.4 12.9 7.4 12.9 13.4 3.1 13.4 3.1 7.4 1.4 7.4ZM6.5 8.8h3v3h-3z"/>',
	src: 'no brand -> ESPHome light blue'
},
{
	id: 'fastly', arch: 'SILHOUETTE', hex: '#C4413A',
	body: '<path fill="#C4413A" d="M3 2.8 7 8 3 13.2 1.4 11.7 4.3 8 1.4 4.3ZM9.2 2.8 13.2 8 9.2 13.2 7.6 11.7 10.5 8 7.6 4.3Z"/>',
	src: 'brand fastly red -> #C4413A'
},
{
	id: 'firebasehosting', arch: 'SILHOUETTE', hex: '#E0B04A',
	body: '<path fill="#E0B04A" d="M8.6 2.2C10.4 4.6 11.8 6.4 11.8 8.4A3.8 3.8 0 0 1 4.2 8.4C4.2 6.9 4.9 5.5 6 4.6 5.9 6.2 6.4 7.2 7.1 7.7 8.1 6.7 8.9 4.6 8.6 2.2Z"/><path fill="#E0B04A" d="M2 12.2h12v1a.6 .6 0 0 1-.6 .6H2.6a.6 .6 0 0 1-.6-.6z"/>',
	src: 'core firebase amber -> #E0B04A (family rhyme with firebase)'
},
{
	id: 'flareact', arch: 'BADGE', text: 'FL', hex: '#CB9D86', letterFill: '#3E2419',
	src: 'Cloudflare amber -> pale terracotta (dark letters)'
},
{
	id: 'fleet', arch: 'BADGE', text: 'FT', hex: '#5E7386',
	src: 'no brand -> deep slate (neutral lane)'
},
{
	id: 'floobits', arch: 'BADGE', text: 'FB', hex: '#8A7EB0',
	src: 'no brand -> muted violet'
},
{
	id: 'flutter', arch: 'SILHOUETTE', hex: '#2E6E9E',
	body: '<path fill="#2E6E9E" d="M13.4 1.9 5.9 9.4 2.6 9.4 10.1 1.9ZM13.4 7.6 10.2 10.8 13.4 14 7.4 14 4.2 10.8 7.4 7.6Z"/>',
	src: 'brand #02569B -> #2E6E9E'
},
{
	id: 'flyio', arch: 'SILHOUETTE', hex: '#6E5FB8',
	body: '<path fill="#6E5FB8" d="M8 1.6a4.6 4.6 0 0 1 4.6 4.6c0 2.6-2.3 4.4-3.2 5.6h-2.8C5.7 10.6 3.4 8.8 3.4 6.2A4.6 4.6 0 0 1 8 1.6Z"/><path fill="#6E5FB8" d="M6.5 12.4h3v1.2a.6 .6 0 0 1-.6 .6H7.1a.6 .6 0 0 1-.6-.6z"/>',
	src: 'brand #24175B lifted -> #6E5FB8'
},
{
	id: 'fnox', arch: 'BADGE', text: 'FX', hex: '#8A9EA8',
	src: 'no brand -> slate (neutral lane)'
},
{
	id: 'fossa', arch: 'BADGE', text: 'FO', hex: '#189C7C',
	src: 'brand teal -> #189C7C'
},
{
	id: 'frontcommerce', arch: 'BADGE', text: 'FC', hex: '#C2938E',
	src: 'no brand -> dusty rose'
},
{
	id: 'funding', arch: 'SILHOUETTE', hex: '#D9628A',
	body: '<path fill="#D9628A" d="M8 13.8C5.2 11.4 1.8 9 1.8 6.4A3.4 3.4 0 0 1 8 4.5A3.4 3.4 0 0 1 14.2 6.4C14.2 9 10.8 11.4 8 13.8Z"/>',
	src: 'sponsor heart pink -> #D9628A'
},

// ---- g ---------------------------------------------------------------------
{
	id: 'garden', arch: 'SILHOUETTE', hex: '#4E9E5E',
	body: '<path fill="#4E9E5E" d="M7.35 4.6h1.3v9.2h-1.3z"/><path fill="#4E9E5E" d="M7.4 4.1A3 1.55 -28 1 1 2.1 6.9A3 1.55 -28 1 1 7.4 4.1ZM8.7 6.6A3 1.55 28 1 0 14 9.4A3 1.55 28 1 0 8.7 6.6Z"/>',
	src: 'no brand -> garden green'
},
{
	id: 'gcloud', arch: 'GLYPH', hex: '#6E9EE8',
	body: '<path fill="#6E9EE8" fill-rule="evenodd" d="M3.36 11.6A2.8 2.8 0 0 1 4.64 6.21A3.5 3.5 0 0 1 11.45 6.61A2.6 2.6 0 0 1 12.6 11.6ZM4.9 10.25A1.85 1.85 0 0 1 5.75 6.7A2.31 2.31 0 0 1 10.25 6.96A1.72 1.72 0 0 1 11 10.25Z"/>',
	src: 'brand #4285F4 -> #6E9EE8'
},
{
	id: 'gemini', arch: 'SILHOUETTE', hex: '#7E8FE0',
	body: '<path fill="#7E8FE0" d="M8 1.2C8.6 5.2 10.8 7.4 14.8 8 10.8 8.6 8.6 10.8 8 14.8 7.4 10.8 5.2 8.6 1.2 8 5.2 7.4 7.4 5.2 8 1.2Z"/>',
	src: 'Gemini blue-violet -> #7E8FE0'
},
{
	id: 'github-sponsors', arch: 'GLYPH', hex: '#E890B8',
	body: '<path fill="#E890B8" fill-rule="evenodd" d="M8 13.8C5.2 11.4 1.8 9 1.8 6.4A3.4 3.4 0 0 1 8 4.5A3.4 3.4 0 0 1 14.2 6.4C14.2 9 10.8 11.4 8 13.8ZM8 11.4C6.3 9.9 4.1 8.5 4.1 6.9A2 2 0 0 1 8 6A2 2 0 0 1 11.9 6.9C11.9 8.5 9.7 9.9 8 11.4Z"/>',
	src: 'sponsor heart pink -> #E890B8 (outline, funding family)'
},
{
	id: 'gitpod', arch: 'BADGE', text: 'GP', hex: '#E8C48A', letterFill: '#4A3418',
	src: 'brand #FFAE33 -> pale #E8C48A (dark letters)'
},
{
	id: 'gleamconfig', arch: 'BADGE', text: 'GL', hex: '#E0A0D8', letterFill: '#4A2545',
	src: 'Gleam pink #FFAFF3 -> #E0A0D8 (dark letters)'
},
{
	id: 'glide', arch: 'BADGE', text: 'GD', hex: '#A4B2BE', letterFill: '#243039',
	src: 'no brand -> pale slate (neutral lane, dark letters)'
},
{
	id: 'glitter', arch: 'BADGE', text: 'GT', hex: '#B3A9D1', letterFill: '#2E2745',
	src: 'no brand -> pale violet (dark letters)'
},
{
	id: 'go-package', arch: 'BADGE', text: 'mod', hex: '#2E88A0',
	src: 'core go #2E88A0 (family rhyme with go)'
},
{
	id: 'go-work', arch: 'BADGE', text: 'wk', hex: '#2E88A0',
	src: 'core go #2E88A0 (family rhyme with go)'
},
{
	id: 'graphql-config', arch: 'SILHOUETTE', hex: '#C43E93',
	body: '<path fill="#C43E93" fill-rule="evenodd" d="M8 1.7 13.46 4.85 13.46 11.15 8 14.3 2.54 11.15 2.54 4.85ZM8 3.8 4.36 5.9 4.36 10.1 8 12.2 11.64 10.1 11.64 5.9Z"/>',
	src: 'core graphql #C43E93 (family rhyme with graphql)'
},
{
	id: 'greenkeeper', arch: 'BADGE', text: 'GK', hex: '#8CC46E', letterFill: '#233A16',
	src: 'brand green -> #8CC46E (dark letters)'
}

];
