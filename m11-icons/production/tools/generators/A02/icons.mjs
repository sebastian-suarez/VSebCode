// icons.mjs — slice A02 roster. One entry per concept in longtail-worklist.json A02.
import { circle, rect, rrect, poly, d, badgeText, glyphText, PLATE, svg, path, n } from './lib.mjs';

const W = '#FFFFFF';

/** badge: plate + letters (white unless `ink` given) */
function badge(fill, text, inkW, o = {}) {
	const t = badgeText(text, { ink: inkW, fill: o.ink || W, tracking: o.tracking, lower: o.lower });
	return svg(PLATE(fill) + t.el);
}
/** bare letter glyph */
function letters(fill, text, inkW, o = {}) {
	const t = glyphText(text, { ink: inkW, fill, tracking: o.tracking, cy: o.cy, cap: o.cap, band: o.band });
	return svg(t.el);
}

export const ICONS = [

// ---------------------------------------------------------------- B --------
{
	id: 'bosque', label: 'Bosque', archetype: 'SILHOUETTE', fill: '#4E8C5A',
	colour: 'no brand → forest green (bosque = forest; vsicons green lane)',
	svg: (f) => svg(path(f, d(
		poly(8, 1.9, 11.1, 6.3, 4.9, 6.3),
		poly(8, 4.9, 13.1, 11.3, 2.9, 11.3),
		rect(7.1, 11.3, 1.8, 2.6))))
},
{
	id: 'bower', label: 'Bower', archetype: 'SILHOUETTE', fill: '#C4573C',
	colour: 'bower brand #EF5734 → matte',
	svg: (f) => svg(path(f, d(
		circle(6.9, 8.4, 4.7),
		poly(10.2, 6.4, 14.8, 8.6, 10.4, 10.8),
		circle(8.2, 7.1, 1.0, false))))
},
{
	id: 'brainfuck', label: 'Brainfuck', archetype: 'GLYPH', fill: '#A8768F',
	colour: 'no brand → muted mauve (neutral-lane chroma)',
	svg: (f) => svg(path(f, d(
		'M1.7,3.4H4.7V4.8H3.1V11.2H4.7V12.6H1.7Z',
		'M14.3,3.4H11.3V4.8H12.9V11.2H11.3V12.6H14.3Z',
		rect(7.3, 5.0, 1.4, 6.0),
		rect(5.6, 7.3, 4.8, 1.4))))
},
{
	id: 'bruno', label: 'Bruno', archetype: 'BADGE', fill: '#E1A07F', letters: 'BR',
	colour: 'no brand → light peach plate (usebruno orange lane); dark ink per §4',
	svg: (f) => badge(f, 'BR', 9.4, { ink: '#3E1E0F' })
},
{
	id: 'buckbuild', label: 'Buck', archetype: 'GLYPH', fill: '#8E96A4', letters: 'BK',
	colour: 'no brand → neutral slate (maven-wordmark lane)',
	svg: (f) => letters(f, 'BK', 11.0)
},
{
	id: 'bucklescript', label: 'BuckleScript', archetype: 'BADGE', fill: '#9A8574', letters: 'BS',
	colour: 'no brand → neutral tan (neutral lane; ReScript red is blocked by npm/yaml)',
	svg: (f) => badge(f, 'BS', 9.4)
},

// ---------------------------------------------------------------- C --------
{
	id: 'c-al', label: 'C AL', archetype: 'BADGE', fill: '#4F78BF', letters: 'AL',
	colour: 'no brand → Dynamics blue (family: c-al / dal)',
	svg: (f) => badge(f, 'AL', 9.4)
},
{
	id: 'c3', label: 'C3', archetype: 'BADGE', fill: '#A573D3', letters: 'C3',
	colour: 'no brand → violet (kept off the C/C++ blue-grey lane); dark ink per §4',
	svg: (f) => badge(f, 'C3', 9.4, { ink: '#2F1646' })
},
{
	id: 'cabal', label: 'Cabal', archetype: 'GLYPH', fill: '#9A8FD0', letters: 'CBL',
	colour: 'Haskell purple family (cabal is Haskell’s build tool)',
	svg: (f) => letters(f, 'CBL', 12.4)
},
{
	id: 'caddy', label: 'Caddy', archetype: 'BADGE', fill: '#68A23F', letters: 'C',
	colour: 'no brand → caddy green',
	svg: (f) => badge(f, 'C', 5.9)
},
{
	id: 'cadence', label: 'Cadence', archetype: 'BADGE', fill: '#389463', letters: 'CDC',
	colour: 'no brand → Flow green (Cadence is Flow’s language)',
	svg: (f) => badge(f, 'CDC', 11.2)
},
{
	id: 'cairo', label: 'Cairo', archetype: 'SILHOUETTE', fill: '#C0673E',
	colour: 'no brand → Starknet burnt orange',
	svg: (f) => svg(path(f, d(
		poly(8, 2.3, 14.1, 12.9, 1.9, 12.9),
		rect(7.05, 9.6, 1.9, 3.3, false))))
},
{
	id: 'cake', label: 'Cake', archetype: 'SILHOUETTE', fill: '#C08A5A',
	colour: 'no brand → cake tan (C# Make)',
	svg: (f) => svg(path(f, d(
		rect(4.5, 3.4, 1.3, 3.6),
		rect(7.35, 2.4, 1.3, 4.6),
		rect(10.2, 3.4, 1.3, 3.6),
		'M2.0,9.4C2.0,8.3 3.0,7.8 4.0,8.3C5.0,8.8 6.0,8.3 6.6,7.8C7.2,8.6 8.8,8.6 9.4,7.8C10.0,8.3 11.0,8.8 12.0,8.3C13.0,7.8 14.0,8.3 14.0,9.4V12.2A1.4,1.4 0 0 1 12.6,13.6H3.4A1.4,1.4 0 0 1 2.0,12.2Z')))
},
{
	id: 'cakephp', label: 'CakePHP', archetype: 'BADGE', fill: '#7C3331', letters: 'CP',
	colour: 'CakePHP red → deep matte (clears npm on value)',
	svg: (f) => badge(f, 'CP', 9.4)
},
{
	id: 'cangjie', label: 'Cangjie', archetype: 'BADGE', fill: '#973F65', letters: 'CJ',
	colour: 'no brand → Cangjie plum',
	svg: (f) => badge(f, 'CJ', 9.4)
},
{
	id: 'capnp', label: 'Cap’n Proto', archetype: 'GLYPH', fill: '#3EA866',
	colour: 'no brand → capnp green',
	svg: (f) => svg(path(f, d(
		'M4,5.6H6V10.4H4A2.4,2.4 0 0 1 4,5.6Z',
		rect(6.9, 5.6, 2.2, 4.8),
		'M10,5.6H12A2.4,2.4 0 0 1 12,10.4H10Z')))
},
{
	id: 'casc', label: 'Casc', archetype: 'GLYPH', fill: '#9BA1A6', letters: 'CAS',
	colour: 'no brand → neutral slate',
	svg: (f) => letters(f, 'CAS', 12.2)
},
{
	id: 'cbx', label: 'Cbx', archetype: 'SILHOUETTE', fill: '#B5738A',
	colour: 'no brand → comic rose',
	svg: (f) => svg(path(f, d(
		rrect(1.4, 2.8, 5.4, 6.0, 0.6),
		rrect(7.4, 2.8, 7.2, 2.6, 0.6),
		rrect(7.4, 6.2, 7.2, 2.6, 0.6),
		rrect(1.4, 9.6, 13.2, 3.6, 0.6))))
},
{
	id: 'cddl', label: 'Cddl', archetype: 'GLYPH', fill: '#8D9CB4', letters: 'CD',
	colour: 'no brand → CBOR blue-grey, neutral lane',
	svg: (f) => letters(f, 'CD', 11.0)
},
{
	id: 'cds', label: 'Cds', archetype: 'BADGE', fill: '#86C5D5', letters: 'cds',
	colour: 'no brand → SAP CAP blue',
	svg: (f) => badge(f, 'cds', 10.4, { lower: true, ink: '#152C37' })
},
{
	id: 'ceylon', label: 'Ceylon', archetype: 'GLYPH', fill: '#C4813E', letters: 'CEY',
	colour: 'no brand → ceylon amber-brown',
	svg: (f) => letters(f, 'CEY', 12.2)
},
{
	id: 'cf', label: 'ColdFusion', archetype: 'BADGE', fill: '#46586E', letters: 'CF',
	colour: 'Adobe ColdFusion deep slate blue, neutral lane (family: cf / cfc / cfm)',
	svg: (f) => badge(f, 'CF', 9.4)
},
{
	id: 'cfc', label: 'Cfc', archetype: 'BADGE', fill: '#46586E', letters: 'CFC',
	colour: 'ColdFusion family plate',
	svg: (f) => badge(f, 'CFC', 11.2)
},
{
	id: 'cfm', label: 'ColdFusion Markup', archetype: 'BADGE', fill: '#46586E', letters: 'CFM',
	colour: 'ColdFusion family plate',
	svg: (f) => badge(f, 'CFM', 11.2)
},
{
	id: 'chef', label: 'Chef', archetype: 'SILHOUETTE', fill: '#D07A46',
	colour: 'Chef orange',
	svg: (f) => svg(path(f, d(
		circle(4.8, 5.9, 2.5),
		circle(8, 4.8, 2.8),
		circle(11.2, 5.9, 2.5),
		rect(4.6, 5.9, 6.8, 2.1),
		'M4.6,8.8H11.4V12.6A1,1 0 0 1 10.4,13.6H5.6A1,1 0 0 1 4.6,12.6Z')))
},
{
	id: 'chef-cookbook', label: 'Chef Cookbook', archetype: 'SILHOUETTE', fill: '#A85E33',
	colour: 'Chef family, darker (emblem tone)',
	svg: (f) => svg(path(f, d(
		rrect(7.2, 3.9, 1.6, 1.8, 0.5),
		rrect(3.0, 5.6, 10.0, 1.6, 0.5),
		rect(1.6, 8.2, 1.9, 1.5),
		rect(12.5, 8.2, 1.9, 1.5),
		'M3.6,7.8H12.4V11.4A2.2,2.2 0 0 1 10.2,13.6H5.8A2.2,2.2 0 0 1 3.6,11.4Z')))
},
{
	id: 'chess', label: 'Chess', archetype: 'SILHOUETTE', fill: '#C3BEB6',
	colour: 'no brand → bone white (chess piece)',
	svg: (f) => svg(path(f, d(
		circle(8, 4.2, 2.3),
		poly(6.4, 6.0, 9.6, 6.0, 10.0, 7.4, 6.0, 7.4),
		'M6.0,7.4C6.0,9.6 5.2,11.0 4.4,11.9H11.6C10.8,11.0 10.0,9.6 10.0,7.4Z',
		rrect(3.4, 11.9, 9.2, 1.9, 0.5))))
},
{
	id: 'circom', label: 'Circom', archetype: 'GLYPH', fill: '#966ECF',
	colour: 'no brand → ZK violet',
	svg: (f) => svg(path(f, d(
		'M5.2,4.3H7.6A3.7,3.7 0 0 1 7.6,11.7H5.2Z',
		rect(1.6, 5.75, 3.6, 1.3),
		rect(1.6, 8.95, 3.6, 1.3),
		rect(11.3, 7.35, 3.1, 1.3))))
},
{
	id: 'clojurescript', label: 'ClojureScript', archetype: 'BADGE', fill: '#4C8FBF',
	colour: 'ClojureScript blue (family: clojure mark, cljs plate)',
	svg: (f) => svg(PLATE(f) + path(W,
		'M10.49 4.01A4.7 4.7 0 0 1 8.65 12.65L8.36 10.57A2.6 2.6 0 0 0 9.38 5.8ZM10.01 11.61a1.5 1.5 0 1 0 -3 0a1.5 1.5 0 1 0 3 0ZM5.51 11.99A4.7 4.7 0 0 1 7.35 3.35L7.64 5.43A2.6 2.6 0 0 0 6.62 10.2ZM8.99 4.39a1.5 1.5 0 1 0 -3 0a1.5 1.5 0 1 0 3 0Z'))
},
{
	id: 'coala', label: 'Coala', archetype: 'SILHOUETTE', fill: '#9AA0A6',
	colour: 'no brand → koala grey',
	svg: (f) => svg(path(f, d(
		circle(3.9, 5.4, 2.05),
		circle(12.1, 5.4, 2.05),
		circle(8, 8.6, 4.2),
		circle(8, 9.4, 1.25, false),
		circle(6.1, 7.5, 0.62, false),
		circle(9.9, 7.5, 0.62, false))))
},
{
	id: 'cobol', label: 'COBOL', archetype: 'SILHOUETTE', fill: '#6E8AB5',
	colour: 'no brand → mainframe blue',
	svg: (f) => svg(path(f, d(
		'M1.4,5.2L3.0,3.6H14.6V12.4H1.4Z',
		rect(3.4, 5.9, 1.9, 2.0, false),
		rect(6.6, 5.9, 1.9, 2.0, false),
		rect(9.8, 5.9, 1.9, 2.0, false),
		rect(5.0, 9.0, 1.9, 2.0, false),
		rect(8.2, 9.0, 1.9, 2.0, false),
		rect(11.4, 9.0, 1.9, 2.0, false))))
},
{
	id: 'coconut', label: 'Coconut', archetype: 'SILHOUETTE', fill: '#8A6A4A',
	colour: 'no brand → coconut husk brown',
	svg: (f) => svg(path(f, d(
		circle(8, 8.4, 5.0),
		poly(8, 6.2, 9.5, 3.2, 6.5, 3.2),
		circle(6.3, 7.6, 0.85, false),
		circle(9.6, 7.4, 0.85, false),
		circle(8, 10.1, 0.85, false))))
},
{
	id: 'cocos', label: 'Cocos', archetype: 'BADGE', fill: '#2A8D70', letters: 'CC',
	colour: 'no brand → Cocos deep green',
	svg: (f) => badge(f, 'CC', 9.6)
},
{
	id: 'codekit', label: 'CodeKit', archetype: 'SILHOUETTE', fill: '#C4634E',
	colour: 'no brand → toolbox red',
	svg: (f) => svg(path(f, d(
		'M5.6,3.2H10.4A1.3,1.3 0 0 1 11.7,4.5V6.6H10.1V5.0A0.4,0.4 0 0 0 9.7,4.6H6.3A0.4,0.4 0 0 0 5.9,5.0V6.6H4.3V4.5A1.3,1.3 0 0 1 5.6,3.2Z',
		rrect(1.2, 6.6, 13.6, 6.8, 1.2),
		rect(6.9, 8.6, 2.2, 1.7, false))))
},
{
	id: 'codeql', label: 'Codeql', archetype: 'GLYPH', fill: '#A464C4',
	colour: 'no brand → CodeQL violet',
	svg: (f) => svg(path(f, d(
		circle(6.9, 6.9, 4.0),
		circle(6.9, 6.9, 2.2, false),
		poly(9.55, 10.75, 11.05, 9.25, 14.3, 12.5, 12.8, 14.0))))
},
{
	id: 'coffeescript', label: 'CoffeeScript', archetype: 'SILHOUETTE', fill: '#8B6448',
	colour: 'CoffeeScript brown',
	svg: (f) => svg(path(f, d(
		'M3.2,5.0H11.6V9.2A2.8,2.8 0 0 1 8.8,12.0H6A2.8,2.8 0 0 1 3.2,9.2Z',
		'M11.6,6.0H12.6A2.1,2.1 0 0 1 12.6,10.2H11.6V8.8H12.5A0.7,0.7 0 0 0 12.5,7.4H11.6Z',
		rrect(1.6, 12.4, 12.8, 1.6, 0.7))))
},
{
	id: 'coloredpetrinets', label: 'Coloredpetrinets', archetype: 'GLYPH', fill: '#818DA7',
	colour: 'no brand → petri-net slate, neutral lane',
	svg: (f) => svg(path(f, d(
		circle(3.1, 8, 2.1), circle(3.1, 8, 0.95, false),
		circle(12.9, 8, 2.1), circle(12.9, 8, 0.95, false),
		rect(7.15, 4.6, 1.7, 6.8),
		rect(5.4, 7.5, 1.4, 1.0),
		rect(9.2, 7.5, 1.4, 1.0))))
},
{
	id: 'command', label: 'Command', archetype: 'GLYPH', fill: '#B6BCC0',
	colour: 'no brand → key-cap silver (macOS ⌘)',
	svg: (f) => svg(path(f, d(
		circle(4.35, 4.35, 2.15), circle(4.35, 4.35, 0.95, false),
		circle(11.65, 4.35, 2.15), circle(11.65, 4.35, 0.95, false),
		circle(4.35, 11.65, 2.15), circle(4.35, 11.65, 0.95, false),
		circle(11.65, 11.65, 2.15), circle(11.65, 11.65, 0.95, false),
		rect(5.55, 5.55, 4.9, 4.9), rect(6.95, 6.95, 2.1, 2.1, false))))
},
{
	id: 'conan', label: 'Conan', archetype: 'GLYPH', fill: '#5E63B5', letters: 'CON',
	colour: 'no brand → conan indigo',
	svg: (f) => letters(f, 'CON', 12.4)
},
{
	id: 'confluence', label: 'Confluence', archetype: 'GLYPH', fill: '#6183D1',
	colour: 'Atlassian blue',
	svg: (f) => svg(path(f, d(
		'M1.08,4.10A10,10 0 0 1 10.93,5.84L9.06,8.06A7.1,7.1 0 0 0 2.07,6.83Z',
		'M14.92,11.90A10,10 0 0 1 5.07,10.16L6.94,7.94A7.1,7.1 0 0 0 13.93,9.17Z')))
},
{
	id: 'context', label: 'Context', archetype: 'GLYPH', fill: '#4EA8A8', letters: 'CTX',
	colour: 'TeX teal family (ConTeXt)',
	svg: (f) => letters(f, 'CTX', 12.4)
},
{
	id: 'controller', label: 'Controller', archetype: 'SILHOUETTE', fill: '#7A70B2',
	colour: 'no brand → controller violet',
	svg: (f) => svg(path(f, d(
		'M4.2,5.4H11.8A3.5,3.5 0 0 1 15.1,10.1L14.2,12.7A1.9,1.9 0 0 1 10.9,13.1L9.5,11.1H6.5L5.1,13.1A1.9,1.9 0 0 1 1.8,12.7L0.9,10.1A3.5,3.5 0 0 1 4.2,5.4Z',
		rect(4.15, 6.95, 1.5, 3.2, false),
		rect(3.3, 7.8, 3.2, 1.5, false),
		circle(10.8, 7.7, 0.85, false),
		circle(12.4, 9.3, 0.85, false))))
},
{
	id: 'crystal', label: 'Crystal', archetype: 'SILHOUETTE', fill: '#DCDFE3',
	colour: 'brand #000000 → lifted silver (spec §6.3)',
	svg: (f) => svg(path(f, d(
		poly(6.8, 1.7, 10.0, 6.6, 8.7, 14.2, 4.9, 14.2, 3.4, 6.6),
		poly(11.6, 4.4, 13.4, 8.0, 12.6, 14.2, 9.8, 14.2, 10.5, 8.0))))
},
{
	id: 'csproj', label: 'C# Project', archetype: 'BADGE', fill: '#3D8F44', letters: 'PRJ',
	colour: 'C# green family plate (csproj is the C# project file)',
	svg: (f) => badge(f, 'PRJ', 11.2)
},
{
	id: 'cssmap', label: 'CSS Source Map', archetype: 'SILHOUETTE', fill: '#3E85BE',
	colour: 'CSS blue family (source map for css)',
	svg: (f) => svg(path(f, d(
		poly(1.4, 4.0, 5.5, 2.6, 5.5, 12.0, 1.4, 13.4),
		poly(6.2, 2.6, 10.2, 4.0, 10.2, 13.4, 6.2, 12.0),
		poly(10.9, 4.0, 14.6, 2.6, 14.6, 12.0, 10.9, 13.4))))
},
{
	id: 'cucumber', label: 'Cucumber', archetype: 'SILHOUETTE', fill: '#5AA83C',
	colour: 'Cucumber green',
	svg: (f) => svg(path(f, d(
		rrect(10.4, 1.9, 1.7, 1.6, 0.5),
		'M3.32,9.25L8.12,3.65A3,3 0 0 1 12.68,7.55L7.88,13.15A3,3 0 0 1 3.32,9.25Z',
		circle(6.2, 10.5, 0.7, false),
		circle(8.0, 8.4, 0.7, false),
		circle(9.8, 6.3, 0.7, false))))
},
{
	id: 'cuda', label: 'CUDA', archetype: 'SILHOUETTE', fill: '#86A83A',
	colour: 'NVIDIA green → matte',
	svg: (f) => svg(path(f, d(
		rect(1.8, 5.1, 2.2, 1.3), rect(1.8, 7.35, 2.2, 1.3), rect(1.8, 9.6, 2.2, 1.3),
		rect(12.0, 5.1, 2.2, 1.3), rect(12.0, 7.35, 2.2, 1.3), rect(12.0, 9.6, 2.2, 1.3),
		rect(5.1, 1.8, 1.3, 2.2), rect(7.35, 1.8, 1.3, 2.2), rect(9.6, 1.8, 1.3, 2.2),
		rect(5.1, 12.0, 1.3, 2.2), rect(7.35, 12.0, 1.3, 2.2), rect(9.6, 12.0, 1.3, 2.2),
		rrect(4.0, 4.0, 8.0, 8.0, 1.2),
		rrect(6.3, 6.3, 3.4, 3.4, 0.6, false))))
},
{
	id: 'cue', label: 'Cue', archetype: 'BADGE', fill: '#5149C1', letters: 'CUE',
	colour: 'no brand → CUE indigo',
	svg: (f) => badge(f, 'CUE', 11.2)
},
{
	id: 'cypress-spec', label: 'Cypress Spec', archetype: 'GLYPH', fill: '#56BFA0',
	colour: 'Cypress green family (spec variant of the cy mark)',
	svg: (f) => svg(glyphText('cy', { ink: 11.0, fill: f, cy: 6.6 }).el + path(f, rect(4.0, 12.2, 8.0, 1.4)))
},
{
	id: 'cython', label: 'Cython', archetype: 'GLYPH', fill: '#86B4DF', letters: 'Cy',
	colour: 'Python-blue family, lifted for bare-letter contrast',
	svg: (f) => letters(f, 'Cy', 10.8, { cy: 8.2 })
},

// ---------------------------------------------------------------- D --------
{
	id: 'dal', label: 'Dal', archetype: 'BADGE', fill: '#4F78BF', letters: 'DAL',
	colour: 'Dynamics blue family (with c-al)',
	svg: (f) => badge(f, 'DAL', 11.2)
},
{
	id: 'dartlang-generated', label: 'Dart (generated)', archetype: 'SILHOUETTE', fill: '#5F7F96',
	colour: 'Dart blue desaturated — generated tier is dimmer by design',
	svg: (f) => svg(path(f, d(
		poly(13.33, 2.92, 2.67, 8.49, 7.10, 9.56, 7.75, 13.08),
		circle(10.0, 13.0, 0.8), circle(11.9, 13.0, 0.8), circle(13.8, 13.0, 0.8))))
},
{
	id: 'denizenscript', label: 'Denizen', archetype: 'BADGE', fill: '#5DA14F', letters: 'DS',
	colour: 'no brand → Minecraft green (Denizen scripting)',
	svg: (f) => badge(f, 'DS', 9.4)
},
{
	id: 'devenv', label: 'Devenv', archetype: 'BADGE', fill: '#6E7A96', letters: 'DEV',
	colour: 'no brand → dev-shell slate, neutral lane',
	svg: (f) => badge(f, 'DEV', 11.2)
},
{
	id: 'dhall', label: 'Dhall', archetype: 'BADGE', fill: '#5E7A87', letters: 'DH',
	colour: 'no brand → Dhall steel, neutral lane',
	svg: (f) => badge(f, 'DH', 9.4)
},
{
	id: 'dinophp', label: 'Dinophp', archetype: 'SILHOUETTE', fill: '#7C8BCE',
	colour: 'PHP indigo lineage (DinoPHP)',
	svg: (f) => svg(path(f, d(
		poly(0.8, 9.2, 4.6, 9.2, 4.6, 12.4),
		rrect(3.4, 8.4, 7.2, 4.2, 2.0),
		rect(4.6, 12.0, 1.9, 1.9),
		rect(7.9, 12.0, 1.9, 1.9),
		'M8.4,10.6C8.4,6.6 9.4,4.0 11.6,4.0V6.6C10.6,6.6 10.2,8.4 10.2,10.6Z',
		rrect(10.8, 3.0, 3.8, 2.8, 1.2),
		circle(13.4, 4.1, 0.55, false))))
},
{
	id: 'dlang', label: 'D', archetype: 'GLYPH', fill: '#B4534C', letters: 'D',
	colour: 'D language red → matte',
	svg: (f) => letters(f, 'D', null, { cap: 9.6 })
},
{
	id: 'docpad', label: 'Docpad', archetype: 'SILHOUETTE', fill: '#4E8C8C',
	colour: 'no brand → docpad teal',
	svg: (f) => svg(path(f, d(
		rect(3.8, 1.8, 1.4, 2.8), rect(7.3, 1.8, 1.4, 2.8), rect(10.8, 1.8, 1.4, 2.8),
		rrect(1.8, 3.6, 12.4, 10.2, 1.3),
		rect(4.0, 6.8, 7.8, 1.3, false),
		rect(4.0, 9.6, 5.4, 1.3, false))))
},
{
	id: 'doctex', label: 'Doctex', archetype: 'GLYPH', fill: '#4EA8A8', letters: 'DOC',
	colour: 'TeX teal family (documented TeX source)',
	svg: (f) => letters(f, 'DOC', 12.4)
},
{
	id: 'doctex-installer', label: 'Doctex Installer', archetype: 'GLYPH', fill: '#4EA8A8', letters: 'INS',
	colour: 'TeX teal family (.ins installer)',
	svg: (f) => letters(f, 'INS', 11.6)
},
{
	id: 'docz', label: 'Docz', archetype: 'BADGE', fill: '#B54F93', letters: 'DZ',
	colour: 'no brand → Docz magenta',
	svg: (f) => badge(f, 'DZ', 9.4)
},
{
	id: 'dotjs', label: 'doT.js', archetype: 'BADGE', fill: '#B4B63E', letters: 'dot',
	colour: 'JS gold family, olive-shifted (clears the js plate)',
	svg: (f) => badge(f, 'dot', 10.6, { lower: true })
},
{
	id: 'doxyfile', label: 'Doxyfile', archetype: 'BADGE', fill: '#728B9D', letters: 'DOX',
	colour: 'no brand → Doxygen steel, neutral lane',
	svg: (f) => badge(f, 'DOX', 11.2)
},
{
	id: 'drools', label: 'Drools', archetype: 'BADGE', fill: '#8D6058', letters: 'DRL',
	colour: 'no brand → brick, neutral lane',
	svg: (f) => badge(f, 'DRL', 11.2)
},
{
	id: 'dtd', label: 'Dtd', archetype: 'GLYPH', fill: '#8496A6', letters: 'DTD',
	colour: 'XML slate family (neutral lane)',
	svg: (f) => letters(f, 'DTD', 12.4)
},
{
	id: 'dtx', label: 'Dtx', archetype: 'GLYPH', fill: '#4EA8A8', letters: 'dtx',
	colour: 'TeX teal family',
	svg: (f) => letters(f, 'dtx', 11.0)
},
{
	id: 'duc', label: 'Duc', archetype: 'GLYPH', fill: '#9E8C6E', letters: 'duc',
	colour: 'no brand → duc sand',
	svg: (f) => letters(f, 'duc', 11.4)
},
{
	id: 'duckdb', label: 'Duckdb', archetype: 'SILHOUETTE', fill: '#DDBF4E',
	colour: 'DuckDB yellow',
	svg: (f) => svg(path(f, d(
		circle(5.7, 7.7, 4.1),
		'M8.4,6.5L12.3,7.2A1.6,1.6 0 0 1 12.3,10.4L8.4,11.1Z',
		circle(5.6, 5.9, 1.05, false))))
},
{
	id: 'dune', label: 'Dune', archetype: 'SILHOUETTE', fill: '#BD9251',
	colour: 'OCaml-lineage sand (dune is OCaml’s build tool)',
	svg: (f) => svg(path(f, d(
		'M4.2,9.0C5.4,5.5 9.4,5.0 11.8,7.0C12.7,7.8 13.6,8.6 14.6,9.0Z',
		'M1.4,13.6C2.8,10.5 6.2,9.1 9.0,10.6C11.0,11.7 12.6,12.8 14.6,13.6Z')))
},
{
	id: 'dustjs', label: 'Dust', archetype: 'GLYPH', fill: '#A59188',
	colour: 'no brand → dust taupe, neutral lane',
	svg: (f) => svg(path(f, d(
		circle(3.0, 11.4, 1.7), circle(6.6, 9.0, 1.35), circle(9.7, 6.9, 1.05),
		circle(12.2, 5.1, .8), circle(14.1, 3.7, .6))))
},
{
	id: 'dvc', label: 'Dvc', archetype: 'BADGE', fill: '#42BDAC', letters: 'DVC',
	colour: 'DVC teal-cyan',
	svg: (f) => badge(f, 'DVC', 11.2)
},
{
	id: 'dylan', label: 'Dylan', archetype: 'GLYPH', fill: '#C577C5', letters: 'DY',
	colour: 'no brand → Dylan orchid',
	svg: (f) => letters(f, 'DY', 11.0)
},

// ---------------------------------------------------------------- E --------
{
	id: 'earthly', label: 'Earthly', archetype: 'SILHOUETTE', fill: '#3FA87A',
	colour: 'Earthly green',
	svg: (f) => svg(path(f, d(
		circle(8, 7.8, 4.2),
		'M1.88,11.08A6.6,2.3 -22 1 1 14.12,6.12A6.6,2.3 -22 1 1 1.88,11.08Z',
		'M3.18,10.55A5.2,1.15 -22 1 0 12.82,6.65A5.2,1.15 -22 1 0 3.18,10.55Z')))
},
{
	id: 'edge', label: 'Edge', archetype: 'BADGE', fill: '#C15BC2', letters: 'EDG',
	colour: 'no brand → Edge template orchid',
	svg: (f) => badge(f, 'EDG', 11.2)
},
{
	id: 'eex', label: 'Eex', archetype: 'BADGE', fill: '#965AAA', letters: 'EEX',
	colour: 'Elixir purple family (EEx templates)',
	svg: (f) => badge(f, 'EEX', 11.2)
},
{
	id: 'ejs', label: 'EJS', archetype: 'BADGE', fill: '#B89D32', letters: 'EJS',
	colour: 'EJS gold (JS lane, darkened to clear the js plate)',
	svg: (f) => badge(f, 'EJS', 11.2)
},
{
	id: 'elastic', label: 'Elasticsearch', archetype: 'SILHOUETTE', fill: '#3D97AD',
	colour: 'brand #005571 lifted to sit on #121314 (spec §6.3)',
	svg: (f) => svg(path(f, d(
		'M10.73,12.75A5.8,5.8 0 1 1 10.73,3.25L9.29,5.3A3.3,3.3 0 1 0 9.29,10.7Z',
		rrect(9.6, 3.0, 5.0, 2.5, 1.25),
		rrect(9.6, 6.75, 4.6, 2.5, 1.25),
		circle(11.4, 11.8, 1.5))))
},
{
	id: 'elm', label: 'Elm', archetype: 'SILHOUETTE', fill: '#5A9BC4',
	colour: 'Elm blue (tangram mark)',
	svg: (f) => svg(path(f, d(
		poly(8, 1.6, 13.4, 7.0, 2.6, 7.0),
		poly(1.6, 7.8, 6.2, 12.4, 1.6, 12.4),
		poly(8.4, 8.0, 11.2, 10.8, 8.4, 13.6, 5.6, 10.8),
		poly(9.8, 7.8, 14.4, 7.8, 14.4, 12.4))))
},
{
	id: 'emacs', label: 'Emacs', archetype: 'BADGE', fill: '#614A96', letters: 'EL',
	colour: 'Emacs purple (Emacs Lisp)',
	svg: (f) => badge(f, 'EL', 9.4)
},
{
	id: 'email', label: 'Email', archetype: 'SILHOUETTE', fill: '#8CA0B8',
	colour: 'no brand → envelope slate',
	svg: (f) => svg(`<path fill="${f}" fill-rule="evenodd" d="${d(
		rrect(1.2, 3.9, 13.6, 8.2, 1.0),
		'M1.2,4.6L8,9.3L14.8,4.6V6.0L8,10.7L1.2,6.0Z')}"/>`)
},
{
	id: 'ember', label: 'Ember', archetype: 'BADGE', fill: '#C86141', letters: 'E',
	colour: 'brand #E04E39 → matte, hue-shifted off canon npm',
	svg: (f) => badge(f, 'E', 5.4)
},
{
	id: 'ensime', label: 'Ensime', archetype: 'GLYPH', fill: '#B56982', letters: 'EN',
	colour: 'no brand → Scala-lineage rose',
	svg: (f) => letters(f, 'EN', 11.2)
},
{
	id: 'erb', label: 'Erb', archetype: 'BADGE', fill: '#9C3A4F', letters: 'ERB',
	colour: 'Ruby red family, deepened (ERB templates)',
	svg: (f) => badge(f, 'ERB', 11.2)
},
{
	id: 'falcon', label: 'Falcon', archetype: 'SILHOUETTE', fill: '#6E9AC4',
	colour: 'no brand → falcon slate blue',
	svg: (f) => svg(path(f, d(
		'M8,12.4C6.4,10.2 3.8,8.0 1.2,6.6C3.4,6.0 5.6,6.2 7.2,7.2L8,3.2L8.8,7.2C10.4,6.2 12.6,6.0 14.8,6.6C12.2,8.0 9.6,10.2 8,12.4Z')))
}

];
