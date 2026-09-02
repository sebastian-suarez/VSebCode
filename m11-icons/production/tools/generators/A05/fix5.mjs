// fix5.mjs — the bare-letter GLYPH ruling.
//
// The 16 px proof says a bare letter group only survives without a plate when the hue is as
// light as the canon dotenv (#E7DF6E, peak 0.84). At #377587 / #6E7C8E / #926E2F the stems
// dissolve (mwb 20% faint peak 0.37, noc 39% faint, pixi 36% faint). So every dark
// letter-only mark moves onto a plate, and two concepts that do have a real mark take it.
import { PLATE, badgeLetters, glyphLetters, write, n } from './a05lib.mjs';

const B = (id, plate, text, opts = {}) =>
	console.log(id, write(id, PLATE(plate) + badgeLetters(text, { inkW: text.length >= 3 ? 11.0 : 9.4, ls: text.length >= 3 ? -0.02 : 0, ...opts }).d));

B('mson', '#5D82A8', 'MSN');
B('mxml', '#9A6FA8', 'MX');
B('noc', '#6E7C8E', 'NOC');
B('nsi', '#4E7CA8', 'NSI');
B('nunjucks', '#3E8E56', 'NJK');
B('otne', '#9E7A5E', 'OT');
B('pddl', '#6B79A6', 'PD');
B('pixi', '#B08432', 'PX');

// ocaml-intf keeps the bare-letter GLYPH — it just needs dotenv's value to hold at 16 px.
console.log('ocaml-intf', write('ocaml-intf', glyphLetters('MLI', { fill: '#DDA954', inkW: 12.4, ls: -0.02 }).d));

// mwb — a MySQL Workbench file IS an EER model: two tables and the relation between them.
{
	const table = (x, y) => `M${n(x)} ${n(y)}h6.2v5.2h-6.2Z`
		+ `M${n(x + .8)} ${n(y + 1.6)}h4.6v.9h-4.6Z` + `M${n(x + .8)} ${n(y + 3.3)}h4.6v.9h-4.6Z`;
	console.log('mwb', write('mwb', `<path fill="#3F869E" fill-rule="evenodd" d="${table(1.2, 1.8)}${table(8.6, 9)}M3.65 7h1.3v5.25H3.65ZM3.65 10.95h5.6v1.3H3.65Z"/>`));
}

// ocx — a component manifest: the piece that plugs into the rest.
console.log('ocx', write('ocx', `<path fill="#8478A8" d="M2.6 2.6h5v.9a1.6 1.6 0 1 1 1.8 0v-.9h3.4V6h-.9a1.6 1.6 0 1 0 0 1.8h.9v5.6H8.4v-.9a1.6 1.6 0 1 0-1.8 0v.9H2.6Z"/>`));
