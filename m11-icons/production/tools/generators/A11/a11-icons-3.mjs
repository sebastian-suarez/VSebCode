// A11 slice, icons 57-84 (syncpack -> verdaccio).
import { P, PE, badge } from './a11-lib.mjs';

const circ = (cx, cy, r) => `M${cx - r} ${cy}a${r} ${r} 0 1 1 ${2 * r} 0a${r} ${r} 0 1 1 ${-2 * r} 0`;

export const ICONS = {};
const add = (id, archetype, fill, body, note) => { ICONS[id] = { archetype, fill, body, note }; };

// 57 syncpack — two packages held equal
add('syncpack', 'SILHOUETTE', '#4E9EA8',
	P('#4E9EA8', 'M2.8 4.2H5.4A1.2 1.2 0 0 1 6.6 5.4V10.6A1.2 1.2 0 0 1 5.4 11.8H2.8A1.2 1.2 0 0 1 1.6 10.6V5.4A1.2 1.2 0 0 1 2.8 4.2ZM10.6 4.2H13.2A1.2 1.2 0 0 1 14.4 5.4V10.6A1.2 1.2 0 0 1 13.2 11.8H10.6A1.2 1.2 0 0 1 9.4 10.6V5.4A1.2 1.2 0 0 1 10.6 4.2ZM7 6.2H9V7.5H7ZM7 8.5H9V9.8H7Z'),
	'no brand → syncpack teal #4E9EA8');

// 58 systemd — the unit power mark
add('systemd', 'SILHOUETTE', '#7E8894',
	P('#7E8894', 'M10.7 3.32A5.4 5.4 0 1 1 5.3 3.32L6.05 4.62A3.9 3.9 0 1 0 9.95 4.62ZM7.3 1.6H8.7V7.6H7.3Z'),
	'no brand → systemd steel #7E8894');

// 59 taplo — TOML table brackets
add('taplo', 'GLYPH', '#A87E5E',
	P('#A87E5E', `M2.4 2.8H6.4V4.4H4.2V11.6H6.4V13.2H2.4ZM13.6 2.8H9.6V4.4H11.8V11.6H9.6V13.2H13.6Z${circ(8, 8, 1.5)}`),
	'no brand → TOML tan #A87E5E');

// 60 taskfile — task clipboard
add('taskfile', 'SILHOUETTE', '#4E9E9E',
	PE('#4E9E9E', 'M6.2 1.6H9.8A.7 .7 0 0 1 10.5 2.3V3.6H5.5V2.3A.7 .7 0 0 1 6.2 1.6ZM4.2 2.8H11.8A1.4 1.4 0 0 1 13.2 4.2V12.6A1.4 1.4 0 0 1 11.8 14H4.2A1.4 1.4 0 0 1 2.8 12.6V4.2A1.4 1.4 0 0 1 4.2 2.8ZM5 6.2H11V7.5H5ZM5 9.2H9.4V10.5H5Z'),
	'no brand → Taskfile teal #4E9E9E');

// 61 taze — version bump
add('taze', 'GLYPH', '#6FA8C4',
	P('#6FA8C4', 'M1.8 9H4V13.4H1.8ZM5.4 6.6H7.6V13.4H5.4ZM9 4.2H11.2V13.4H9ZM11 2.2H14.4V5.6H13V4.5L11.4 6.1 10.4 5.1 12 3.5H11Z'),
	'no brand → taze green');

// 62 testcafe — chequered flag
add('testcafe', 'SILHOUETTE', '#4C8FA8',
	PE('#4C8FA8', 'M2.2 1.8H3.5V14.2H2.2ZM3.5 2.6H13.8V8.8H3.5ZM3.5 2.6H8.65V5.7H3.5ZM8.65 5.7H13.8V8.8H8.65Z'),
	'no brand → TestCafe blue #4C8FA8');

// 63 textlint — Aa with a rule (letterpath)
add('textlint', 'GLYPH', '#6E9EA8', null, 'no brand → prose olive-grey');

// 64 tfs — work-item board
add('tfs', 'SILHOUETTE', '#4E7FC4',
	PE('#4E7FC4', 'M2.6 2.8H5.4A.9 .9 0 0 1 6.3 3.7V12.3A.9 .9 0 0 1 5.4 13.2H2.6A.9 .9 0 0 1 1.7 12.3V3.7A.9 .9 0 0 1 2.6 2.8ZM6.6 2.8H9.4A.9 .9 0 0 1 10.3 3.7V12.3A.9 .9 0 0 1 9.4 13.2H6.6A.9 .9 0 0 1 5.7 12.3V3.7A.9 .9 0 0 1 6.6 2.8ZM10.6 2.8H13.4A.9 .9 0 0 1 14.3 3.7V12.3A.9 .9 0 0 1 13.4 13.2H10.6A.9 .9 0 0 1 9.7 12.3V3.7A.9 .9 0 0 1 10.6 2.8ZM2.6 4.4H5.4V6.4H2.6ZM2.6 7.4H5.4V9.4H2.6ZM6.7 4.4H9.3V6.4H6.7ZM10.7 4.4H13.4V6.4H10.7ZM10.7 7.4H13.4V9.4H10.7ZM10.7 10.4H13.4V12.4H10.7Z'),
	'no brand → Azure DevOps blue #4E7FC4');

// 65 tiltfile — the tilted plate
add('tiltfile', 'SILHOUETTE', '#D4A03E',
	PE('#D4A03E', `M10.51 2.62L2.62 5.49 5.49 13.38 13.38 10.51Z${circ(8, 8, 1.9)}`),
	'no brand → Tilt amber #D4A03E');

// 66 tmux — split panes
add('tmux', 'SILHOUETTE', '#5FA85C',
	PE('#5FA85C', 'M3 3H13A1.2 1.2 0 0 1 14.2 4.2V11.8A1.2 1.2 0 0 1 13 13H3A1.2 1.2 0 0 1 1.8 11.8V4.2A1.2 1.2 0 0 1 3 3ZM2.9 4.1H7.2V11.9H2.9ZM8.2 4.1H13.1V7.5H8.2ZM8.2 8.5H13.1V11.9H8.2Z'),
	'brand #1BB91F matted to #5FA85C');

// 67 tobimake — toolbox
add('tobimake', 'SILHOUETTE', '#A8846E',
	PE('#A8846E', 'M6 2.2H10A1.2 1.2 0 0 1 11.2 3.4V4.6H9.8V3.6H6.2V4.6H4.8V3.4A1.2 1.2 0 0 1 6 2.2ZM3 4.6H13A1.2 1.2 0 0 1 14.2 5.8V12A1.2 1.2 0 0 1 13 13.2H3A1.2 1.2 0 0 1 1.8 12V5.8A1.2 1.2 0 0 1 3 4.6ZM6.6 6.8H9.4V8.4H6.6Z'),
	'no brand → build tan #A8846E');

// 68 tox — environment matrix
add('tox', 'GLYPH', '#5FA07A',
	P('#5FA07A', `${circ(3.4, 5, 1.5)}${circ(8, 5, 1.5)}${circ(12.6, 5, 1.5)}${circ(3.4, 11, 1.5)}${circ(8, 11, 1.5)}${circ(12.6, 11, 1.5)}`),
	'no brand → tox green #5FA07A');

// 69 travis — T badge
add('travis', 'BADGE', '#3EAAAF', badge('#3EAAAF', 'T').body, 'brand #3EAAAF');

// 70 trigger — event fired from a boundary
add('trigger', 'GLYPH', '#A85FC4',
	P('#A85FC4', 'M2.4 2.8H4.4V13.2H2.4ZM6 7.2H11.4V8.8H6ZM11 5.2L14.4 8 11 10.8Z'),
	'no brand → trigger violet #A85FC4');

// 71 trivy — scanned shield
add('trivy', 'GLYPH', '#5F86C4',
	PE('#5F86C4', `M8 1.8L13.4 3.6V8.4C13.4 11.4 11 13.4 8 14.4 5 13.4 2.6 11.4 2.6 8.4V3.6ZM8 3.6L11.6 4.8V8.4C11.6 10.3 10 11.8 8 12.6 6 11.8 4.4 10.3 4.4 8.4V4.8Z${circ(8, 8, 1.5)}`),
	'no brand → Trivy blue #5F86C4');

// 72 truffle — the truffle itself
add('truffle', 'SILHOUETTE', '#A8785E',
	P('#A8785E', 'M1.8 8.4C1.8 4.8 4.6 2.4 8 2.4 11.4 2.4 14.2 4.8 14.2 8.4ZM6.4 8.4H9.6V12.4A1.6 1.6 0 0 1 6.4 12.4Z'),
	'no brand → truffle earth #A8785E');

// 73 trunk — the trunk
add('trunk', 'SILHOUETTE', '#6FA05C',
	P('#6FA05C', 'M8 1.6L11.8 6H4.2ZM8 4.6L12.8 9H3.2ZM8 7.6L13.8 12H2.2ZM6.9 12H9.1V14H6.9Z'),
	'no brand → Trunk green #6FA05C');

// 74 tsdown — bundle down
add('tsdown', 'GLYPH', '#4A8FC4',
	P('#4A8FC4', 'M8 10.8L2.6 5.6 4.5 3.8 8 7.2 11.5 3.8 13.4 5.6ZM2.6 12H13.4V13.6H2.6Z'),
	'no brand → tsdown blue #4A8FC4');

// 75 tslint — the rule
add('tslint', 'SILHOUETTE', '#4A7FA8',
	PE('#4A7FA8', 'M2.6 3.8H13.4A1 1 0 0 1 14.4 4.8V11.2A1 1 0 0 1 13.4 12.2H2.6A1 1 0 0 1 1.6 11.2V4.8A1 1 0 0 1 2.6 3.8ZM3.4 3.8H4.4V7.6H3.4ZM5.6 3.8H6.6V6.4H5.6ZM7.8 3.8H8.8V7.6H7.8ZM10 3.8H11V6.4H10ZM12.2 3.8H13.2V7.6H12.2Z'),
	'no brand → TSLint muted blue #4A7FA8 (kept off canon #3178C6)');

// 76 ty — TY badge
add('ty', 'BADGE', '#6E9EAE', badge('#6E9EAE', 'TY', '#FFFFFF', { inkWidth: 9.4 }).body,
	'no brand → Astral slate #6E9EAE');

// 77 umi — the sea
add('umi', 'SILHOUETTE', '#3E8FC4',
	P('#3E8FC4', 'M1.6 4.2C3.2 2.2 4.8 2.2 6.4 4.2 8 6.2 9.6 6.2 11.2 4.2 12.4 2.7 13.6 2.4 14.4 3.2V5.8C13.6 5 12.4 5.3 11.2 6.8 9.6 8.8 8 8.8 6.4 6.8 4.8 4.8 3.2 4.8 1.6 6.8ZM1.6 10.4C3.2 8.4 4.8 8.4 6.4 10.4 8 12.4 9.6 12.4 11.2 10.4 12.4 8.9 13.6 8.6 14.4 9.4V12C13.6 11.2 12.4 11.5 11.2 13 9.6 15 8 15 6.4 13 4.8 11 3.2 11 1.6 13Z'),
	'no brand → Umi sea blue #3E8FC4');

// 78 unibeautify — three sparks
add('unibeautify', 'GLYPH', '#C46E9E',
	P('#C46E9E', 'M5.4 2C6 4.5 7.1 5.6 9.6 6.2 7.1 6.8 6 7.9 5.4 10.4 4.8 7.9 3.7 6.8 1.2 6.2 3.7 5.6 4.8 4.5 5.4 2ZM11.4 6.8C11.8 8.6 12.6 9.4 14.4 9.8 12.6 10.2 11.8 11 11.4 12.8 11 11 10.2 10.2 8.4 9.8 10.2 9.4 11 8.6 11.4 6.8ZM12 1.6C12.3 2.9 12.9 3.5 14.2 3.8 12.9 4.1 12.3 4.7 12 6 11.7 4.7 11.1 4.1 9.8 3.8 11.1 3.5 11.7 2.9 12 1.6Z'),
	'no brand → beautify pink #C46E9E');

// 79 unocss — U badge
add('unocss', 'BADGE', '#C6C9CE', badge('#C6C9CE', 'U', '#24272B').body,
	'brand #333333 lifted to plate #C6C9CE with a dark letter (§4)');

// 80 vagrant — the V
add('vagrant', 'SILHOUETTE', '#4E7FD4',
	P('#4E7FD4', 'M2.2 2.6H5.8L8 9 10.2 2.6H13.8L9.6 13.6H6.4Z'),
	'brand #1868F2 matted to #4E7FD4');

// 81 vale — pilcrow
add('vale', 'GLYPH', '#7E96B8',
	P('#7E96B8', 'M6.6 2.6H13.4V4.2H11.8V13.4H10.2V4.2H9V13.4H7.4V8.6H6.6A3 3 0 0 1 6.6 2.6Z'),
	'no brand → prose blue-grey, neutral lane (HSL S < 25, R7-exempt)');

// 82 vapor — the droplet
add('vapor', 'SILHOUETTE', '#7E7FD4',
	P('#7E7FD4', 'M8 2C10.7 5.4 12.5 7.7 12.5 9.7A4.5 4.5 0 0 1 3.5 9.7C3.5 7.7 5.3 5.4 8 2Z'),
	'no brand → Vapor periwinkle #7E7FD4');

// 83 velite — fanned content cards
add('velite', 'SILHOUETTE', '#B8874E',
	P('#B8874E', 'M1.6 6.2L7.6 2.4 9.4 5.2 3.4 9ZM5.4 3.6H12.6A1 1 0 0 1 13.6 4.6V12.8A1 1 0 0 1 12.6 13.8H5.4A1 1 0 0 1 4.4 12.8V4.6A1 1 0 0 1 5.4 3.6Z'),
	'no brand → Velite ochre #B8874E');

// 84 verdaccio — V badge
add('verdaccio', 'BADGE', '#7E9166', badge('#7E9166', 'V').body, 'brand #4B5E40 lifted to #7E9166');
