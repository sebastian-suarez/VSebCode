// A11 slice, icons 28-56 (ruff -> swc).
import { P, PE, badge } from './a11-lib.mjs';

const circ = (cx, cy, r) => `M${cx - r} ${cy}a${r} ${r} 0 1 1 ${2 * r} 0a${r} ${r} 0 1 1 ${-2 * r} 0`;

export const ICONS = {};
const add = (id, archetype, fill, body, note) => { ICONS[id] = { archetype, fill, body, note }; };

// 28 ruff — swept wings
add('ruff', 'SILHOUETTE', '#A6C45E',
	P('#A6C45E', 'M8 6.2L3.4 2.8 4.6 7.4 1.6 9.6 8 13.4 14.4 9.6 11.4 7.4 12.6 2.8Z'),
	'brand #D7FF64 matted to #A6C45E');

// 29 sails — sailboat
add('sails', 'SILHOUETTE', '#3E86C4',
	P('#3E86C4', 'M8.2 1.8V10.2H2.4ZM9.2 3.6L13.2 10.2H9.2ZM1.6 11H14.4L12.4 13.8H3.6Z'),
	'brand #14ACC2 shifted to Sails blue #3E86C4');

// 30 sapphire-framework-cli — four-point spark
add('sapphire-framework-cli', 'GLYPH', '#4A6FD0',
	P('#4A6FD0', 'M8 1.6C8.6 5.6 10.4 7.4 14.4 8 10.4 8.6 8.6 10.4 8 14.4 7.4 10.4 5.6 8.6 1.6 8 5.6 7.4 7.4 5.6 8 1.6Z'),
	'no brand → sapphire blue #4A6FD0');

// 31 screwdriver — screwdriver on the diagonal
add('screwdriver', 'SILHOUETTE', '#4E8FB0',
	P('#4E8FB0', 'M1.76 10.56L5.44 14.24 9.26 10.42 5.58 6.74ZM6.36 7.52L8.48 9.64 9.33 8.79 7.21 6.67ZM7.67 7.13L8.87 8.33 11.27 5.93 10.07 4.73ZM10.07 4.73L11.27 5.93 13.07 5.19 10.81 2.93Z'),
	'no brand → Screwdriver.cd steel blue #4E8FB0');

// 32 seedkit — sprout
add('seedkit', 'SILHOUETTE', '#5FA05E',
	P('#5FA05E', 'M7.35 6.4H8.65V13.6H7.35ZM7.4 8.6C4.4 8.6 2.2 6.8 2.2 4 5.4 4 7.4 5.8 7.4 8.6ZM8.6 7.4C8.6 4.4 10.8 2.4 13.8 2.4 13.8 5.4 11.6 7.4 8.6 7.4Z'),
	'no brand → sprout green #5FA05E');

// 33 semanticrelease — version tag
add('semanticrelease', 'SILHOUETTE', '#C7A150',
	PE('#C7A150', 'M2.2 2.6H9.2L14.2 8 9.2 13.4H2.2ZM4.05 8a1.15 1.15 0 1 1 2.3 0a1.15 1.15 0 1 1-2.3 0'),
	'no brand → release gold #C7A150');

// 34 semgrep — pattern crosshair
add('semgrep', 'GLYPH', '#6FB05C',
	PE('#6FB05C', `${circ(8, 8, 3.7)}${circ(8, 8, 2.4)}M7.3 1.8H8.7V4.6H7.3ZM7.3 11.4H8.7V14.2H7.3ZM1.8 7.3H4.6V8.7H1.8ZM11.4 7.3H14.2V8.7H11.4Z`),
	'no brand → Semgrep green #6FB05C');

// 35 serverless — the three-bar mark
add('serverless', 'SILHOUETTE', '#D45B54',
	P('#D45B54', 'M5.6 2.8H13.4V5.2H4.4ZM1.6 6.4H14.4V8.8H1.6ZM2.6 10H11.6L10.4 12.4H2.6Z'),
	'brand #FD5750 matted to #D45B54');

// 36 shadcn — the slash mark
add('shadcn', 'GLYPH', '#C9CCD1',
	P('#C9CCD1', 'M11.83 1.84L13.37 2.96 5.17 14.16 3.63 13.04ZM9.27 8.93L13.07 12.73 11.73 14.07 7.93 10.27Z'),
	'brand #000000 lifted to #C9CCD1 (§6.3)');

// 37 shuttle — orbit
add('shuttle', 'GLYPH', '#D9722F',
	PE('#D9722F', `M1.8 9.2a6.2 3.4 0 1 1 12.4 0a6.2 3.4 0 1 1-12.4 0M3.2 9.2a4.8 2 0 1 1 9.6 0a4.8 2 0 1 1-9.6 0${circ(9.4, 4.2, 2.1)}`),
	'brand #F25100 desaturated to a warm bronze to clear the Svelte orange (R7)');

// 38 sitemap — site hierarchy
add('sitemap', 'SILHOUETTE', '#6E9AC0',
	P('#6E9AC0', 'M6.4 1.8H9.6A.8 .8 0 0 1 10.4 2.6V3.8A.8 .8 0 0 1 9.6 4.6H6.4A.8 .8 0 0 1 5.6 3.8V2.6A.8 .8 0 0 1 6.4 1.8ZM7.4 4.6H8.6V6.4H7.4ZM2.8 6.4H13.2V7.6H2.8ZM2.8 7.6H4V9.4H2.8ZM7.4 7.6H8.6V9.4H7.4ZM12 7.6H13.2V9.4H12ZM2.4 9.4H4.4A.8 .8 0 0 1 5.2 10.2V12.4A.8 .8 0 0 1 4.4 13.2H2.4A.8 .8 0 0 1 1.6 12.4V10.2A.8 .8 0 0 1 2.4 9.4ZM7 9.4H9A.8 .8 0 0 1 9.8 10.2V12.4A.8 .8 0 0 1 9 13.2H7A.8 .8 0 0 1 6.2 12.4V10.2A.8 .8 0 0 1 7 9.4ZM11.6 9.4H13.6A.8 .8 0 0 1 14.4 10.2V12.4A.8 .8 0 0 1 13.6 13.2H11.6A.8 .8 0 0 1 10.8 12.4V10.2A.8 .8 0 0 1 11.6 9.4Z'),
	'no brand → wayfinding blue #6E9AC0');

// 39 slashup — slash command bubble
add('slashup', 'SILHOUETTE', '#7E6FC4',
	PE('#7E6FC4', 'M4 2.4H12A2.2 2.2 0 0 1 14.2 4.6V9.2A2.2 2.2 0 0 1 12 11.4H8L4.6 14.2V11.4H4A2.2 2.2 0 0 1 1.8 9.2V4.6A2.2 2.2 0 0 1 4 2.4ZM9.5 4.5H11.4L6.5 9.6H4.6Z'),
	'no brand → command violet #7E6FC4');

// 40 slug — url slug
add('slug', 'GLYPH', '#8E86A8',
	P('#8E86A8', 'M2.8 6.8H4.2A1.2 1.2 0 0 1 4.2 9.2H2.8A1.2 1.2 0 0 1 2.8 6.8ZM7.6 6.8H8.6A1.2 1.2 0 0 1 8.6 9.2H7.6A1.2 1.2 0 0 1 7.6 6.8ZM12 6.8H13.2A1.2 1.2 0 0 1 13.2 9.2H12A1.2 1.2 0 0 1 12 6.8ZM6.5 5.2H7.7L5.9 10.8H4.7ZM11 5.2H12.2L10.4 10.8H9.2Z'),
	'no brand → violet-grey, neutral lane (HSL S < 25, R7-exempt)');

// 41 smithery — anvil
add('smithery', 'SILHOUETTE', '#8A9098',
	P('#8A9098', 'M2.2 4H12.4L13.9 6.2H2.2ZM5 6.2H9.6L9 10.2H5.6ZM3.2 10.2H11.4V13.2H3.2Z'),
	'no brand → forge steel #8A9098');

// 42 snapcraft — snap-fit brick
add('snapcraft', 'SILHOUETTE', '#C97A45',
	P('#C97A45', 'M4.2 2.6H5.4A.6 .6 0 0 1 6 3.2V4.6H3.6V3.2A.6 .6 0 0 1 4.2 2.6ZM10.6 2.6H11.8A.6 .6 0 0 1 12.4 3.2V4.6H10V3.2A.6 .6 0 0 1 10.6 2.6ZM3.2 4.6H12.8A1.2 1.2 0 0 1 14 5.8V11.4A1.2 1.2 0 0 1 12.8 12.6H3.2A1.2 1.2 0 0 1 2 11.4V5.8A1.2 1.2 0 0 1 3.2 4.6Z'),
	'brand #E95420 matted to #C97A45');

// 43 snaplet — camera
add('snaplet', 'SILHOUETTE', '#C4568E',
	PE('#C4568E', `M5 2.8H9.4L10.2 4.4H4.2ZM3.4 4.4H12.6A1.6 1.6 0 0 1 14.2 6V11.4A1.6 1.6 0 0 1 12.6 13H3.4A1.6 1.6 0 0 1 1.8 11.4V6A1.6 1.6 0 0 1 3.4 4.4Z${circ(8, 8.7, 2.5)}${circ(8, 8.7, 1.1)}`),
	'no brand → Snaplet pink #C4568E');

// 44 snowpack — snowflake
add('snowpack', 'SILHOUETTE', '#4E9ED0',
	P('#4E9ED0', 'M2.2 7.25H13.8V8.75H2.2ZM10.25 2.6L11.55 3.36 5.75 13.4 4.45 12.65ZM5.75 2.6L4.45 3.36 10.25 13.4 11.55 12.65Z'),
	'no brand → Snowpack blue #4E9ED0');

// 45 snyk — vulnerability beetle
add('snyk', 'SILHOUETTE', '#7C79A8',
	PE('#7C79A8', `M2 5L5.2 6.4V7.7L2 6.3ZM1.7 8.6H5.2V9.9H1.7ZM2 13.9L5.2 12.5V11.2L2 12.6ZM14 5L10.8 6.4V7.7L14 6.3ZM14.3 8.6H10.8V9.9H14.3ZM14 13.9L10.8 12.5V11.2L14 12.6Z${circ(8, 3.8, 1.8)}M4.8 8.4a3.2 4.4 0 1 1 6.4 0a3.2 4.4 0 1 1-6.4 0M7.6 5H8.4V11.8H7.6Z`),
	'brand #4C4A73 lifted to #7C79A8');

// 46 solidarity — linked rings
add('solidarity', 'GLYPH', '#A8748C',
	PE('#A8748C', `${circ(5.6, 5.7, 3.9)}${circ(5.6, 5.7, 2.1)}${circ(10.4, 10.3, 3.9)}${circ(10.4, 10.3, 2.1)}`),
	'no brand → muted orchid');

// 47 spin — three-blade pinwheel
add('spin', 'SILHOUETTE', '#3EA0A8',
	P('#3EA0A8', `M8 8L8 1.6 12.4 4.2ZM8 8L13.54 11.2 9.09 13.71ZM8 8L2.46 11.2 2.51 6.09Z${circ(8, 8, 1.6)}`),
	'no brand → Spin teal #3EA0A8');

// 48 stackblitz — bolt in a disc
add('stackblitz', 'SILHOUETTE', '#2E7ACC',
	PE('#2E7ACC', `${circ(8, 8, 6.2)}M8.9 3.4L5.2 8.6H7.6L7.1 12.6 10.8 7.4H8.4Z`),
	'brand #1269D3 matted to #2E7ACC');

// 49 steadybit — resilience trace
add('steadybit', 'GLYPH', '#B45C9E',
	P('#B45C9E', 'M1.6 7.45H4.8V8.95H1.6ZM5.51 7.97L7.01 3.37 5.59 3.83 4.09 8.43ZM5.56 3.74L7.26 12.94 8.74 12.66 7.04 3.46ZM8.71 12.57L10.21 7.97 8.79 8.43 7.29 13.03ZM9.5 7.45H14.4V8.95H9.5Z'),
	'no brand → chaos magenta #B45C9E');

// 50 stitches — seam and stitches
add('stitches', 'GLYPH', '#A88ECC',
	P('#A88ECC', 'M1.8 7.4H14.2V8.5H1.8ZM2 11.6L4 4.4H5.5L3.5 11.6ZM6.25 11.6L8.25 4.4H9.75L7.75 11.6ZM10.5 11.6L12.5 4.4H14V11.6Z'),
	'no brand → Stitches lilac #A88ECC');

// 51 styleci — paint bucket
add('styleci', 'SILHOUETTE', '#6E86C8',
	P('#6E86C8', 'M2.6 4.6C2.6 2.2 4.2 1.4 6 1.4 7.8 1.4 9.4 2.2 9.4 4.6H8C8 3.2 7.2 2.7 6 2.7 4.8 2.7 4 3.2 4 4.6ZM1.6 5.2H10.4L9.4 13.2A1.1 1.1 0 0 1 8.3 14.2H3.7A1.1 1.1 0 0 1 2.6 13.2ZM12.9 6.6C13.9 8.2 14.4 9.1 14.4 9.9A1.5 1.5 0 0 1 11.4 9.9C11.4 9.1 11.9 8.2 12.9 6.6Z'),
	'no brand → StyleCI indigo #6E86C8');

// 52 stylish-haskell — lambda
add('stylish-haskell', 'SILHOUETTE', '#9A7EC4',
	P('#9A7EC4', 'M4.4 2.4H7.2L13.6 13.6H10.8L8.2 8.8 5.2 13.6H2.4L6.6 6.6Z'),
	'brand-adjacent Haskell violet, shifted to #9A7EC4');

// 53 sublime — staggered bars
add('sublime', 'GLYPH', '#D9922F',
	P('#D9922F', 'M5 2.6H13.9L12.7 5.4H3.8ZM4.1 6.3H13L11.8 9.1H2.9ZM3.2 10H12.1L10.9 12.8H2Z'),
	'brand #FF9800 matted to #D9922F');

// 54 subversion — the fan
add('subversion', 'SILHOUETTE', '#C46E4A',
	P('#C46E4A', 'M8 13.4L1.8 6.6 4.4 4.2ZM8 13.4L6.2 3 9.8 3ZM8 13.4L11.6 4.2 14.2 6.6Z'),
	'no brand → Subversion terracotta #C46E4A');

// 55 svelteconfig — Svelte S monogram (letterpath)
add('svelteconfig', 'GLYPH', '#C46A3A', null, 'brand #FF3E00 matted to #C46A3A');

// 56 swc — SWC badge
add('swc', 'BADGE', '#7A5FA8', badge('#7A5FA8', 'SWC', '#FFFFFF', { inkWidth: 11.0, tracking: -0.02 }).body,
	'no brand → SWC indigo (kept off core mdx)');
