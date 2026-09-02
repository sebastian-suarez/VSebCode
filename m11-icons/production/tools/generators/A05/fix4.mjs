// fix4.mjs — four-letter bare wordmarks are mush at 16 px (mson proof: cap 4.1, unreadable).
// Everything drops to three letters, or to two at a bigger cap.
import { PLATE, badgeLetters, glyphLetters, write } from './a05lib.mjs';

console.log('mson', write('mson', glyphLetters('MSN', { fill: '#97B6CD', inkW: 12.8, ls: -0.02 }).d));
console.log('mxml', write('mxml', PLATE('#9A6FA8') + badgeLetters('MX', { inkW: 9.4 }).d));
console.log('nsi', write('nsi', glyphLetters('NSI', { fill: '#6E90B8', inkW: 12.4, ls: -0.02 }).d));
console.log('otne', write('otne', glyphLetters('OT', { fill: '#9E7A5E', inkW: 10.4, maxCap: 8 }).d));
console.log('pddl', write('pddl', glyphLetters('PD', { fill: '#6B79A6', inkW: 10.4, maxCap: 8 }).d));
console.log('pixi', write('pixi', glyphLetters('PIX', { fill: '#926E2F', inkW: 12.4, ls: -0.02 }).d));
