// A10 part 4 — objidconfig … protractor
import { write, letters, n, circle, ellipse, rrect, rect, poly, plate, capsule, arcBand, badgeLetters, glyphLetters } from './a10-lib.mjs';

const out = [];
const emit = (id, inner) => out.push([id, write(id, inner)]);

// rotated ellipse ring (jupyter's arc trick), as two arcs
function tilted(cx, cy, rx, ry, deg, sweep = 1) {
	const t = deg * Math.PI / 180;
	const dx = rx * Math.cos(t), dy = rx * Math.sin(t);
	return `M${n(cx - dx)} ${n(cy - dy)}A${n(rx)} ${n(ry)} ${n(deg)} 0 ${sweep} ${n(cx + dx)} ${n(cy + dy)}` +
		`A${n(rx)} ${n(ry)} ${n(deg)} 0 ${sweep} ${n(cx - dx)} ${n(cy - dy)}Z`;
}

// 61 objidconfig — SILHOUETTE label tag
emit('objidconfig',
	`<path fill="#9E7FB8" fill-rule="evenodd" d="M6 2.4h6.7a1.3 1.3 0 0 1 1.3 1.3v8.6a1.3 1.3 0 0 1-1.3 1.3H6L1.8 9.4V6.6Z` +
	`${circle(4.9, 8, 1.15, 0)}"/>`);

// 62 opencode — SILHOUETTE terminal window
emit('opencode',
	`<path fill="#AEB3B8" fill-rule="evenodd" d="${rrect(1.4, 2.6, 13.2, 10.8, 1.4)}` +
	`${rect(1.4, 5.2, 13.2, 1)}${rect(3.8, 8.2, 2.6, 2.6)}${rect(7.6, 9.8, 4.6, 1)}"/>`);

// 63 opentofu — SILHOUETTE tofu block with a cut corner
emit('opentofu',
	`<path fill="#D8B93E" fill-rule="evenodd" d="${rrect(2, 2, 12, 12, 1.6)}${rrect(8.6, 2, 5.4, 5.4, 1.4)}"/>` +
	`<path fill="#D8B93E" d="${rrect(9.9, 3.3, 2.8, 2.8, .8)}"/>`);

// 64 orval — BADGE Or (OpenAPI client generator)
emit('orval', plate('#7A3162') + badgeLetters('Or', { width: 9.4, fill: '#FFFFFF' }));

// 65 oxc — GLYPH ox (Oxc / oxlint)
emit('oxc', letters({ text: 'ox', 'ink-height': 6.8, cx: 8, 'cy-ink': 8, fill: '#BA5CD1' }));

// 66 packship — SILHOUETTE container ship
emit('packship',
	`<path fill="#3E92A8" d="${poly([1.4, 9.6, 14.6, 9.6, 12.6, 13.4, 3.4, 13.4])}` +
	`${rect(3.6, 6.6, 2.6, 2.6)}${rect(7, 6.6, 2.6, 2.6)}${rect(10.4, 6.6, 2.6, 2.6)}` +
	`${rect(5.3, 3.6, 2.6, 2.6)}${rect(8.7, 3.6, 2.6, 2.6)}"/>`);

// 67 panda — SILHOUETTE panda face (R2 two-tone: the brand IS black and white)
const pandaFace = (light, dark) =>
	`<path fill="${dark}" d="${circle(3.6, 4.2, 2.1)}${circle(12.4, 4.2, 2.1)}"/>` +
	`<path fill="${light}" d="${circle(8, 8.6, 5)}"/>` +
	`<path fill="${dark}" d="${ellipse(5.7, 8, 1.45, 1.9)}${ellipse(10.3, 8, 1.45, 1.9)}` +
	`${ellipse(8, 10.9, 1.05, .8)}"/>`;
emit('panda', pandaFace('#D8D4CC', '#6E6A64'));

// 68 pandacss — same mark on the Panda CSS yellow (R3 family with panda: one tool, two source names)
emit('pandacss', pandaFace('#DFC24E', '#4A3C14'));

// 69 parcel — SILHOUETTE wrapped parcel
emit('parcel',
	`<path fill="#C48A3E" fill-rule="evenodd" d="${rrect(1.8, 3, 12.4, 10.4, 1.2)}` +
	`${rect(7.2, 3, 1.6, 10.4)}${rect(1.8, 7.4, 12.4, 1.6)}"/>`);

// 70 payload — SILHOUETTE facet pair
emit('payload',
	`<path fill="#B0B6BE" d="${poly([8, 1.4, 13.6, 7.4, 2.4, 7.4])}${poly([2.4, 8.6, 13.6, 8.6, 8, 14.6])}"/>`);

// 71 pdm — GLYPH pdm (python dependency manager)
emit('pdm', letters({ text: 'pdm', xheight: 3.6, cx: 8, 'cy-ink': 8, fill: '#8482AD' }));

// 72 peeky — SILHOUETTE binoculars
emit('peeky',
	`<path fill="#4E9E8E" d="${circle(4.4, 10.1, 3.5)}${circle(11.6, 10.1, 3.5)}` +
	`${rect(2.6, 3, 3.6, 7.1)}${rect(9.8, 3, 3.6, 7.1)}${rect(6.2, 5.4, 3.6, 2.1)}"/>`);

// 73 percy — SILHOUETTE camera (visual snapshots)
emit('percy',
	`<path fill="#9E66BF" fill-rule="evenodd" d="${rrect(1.4, 4.2, 13.2, 9, 1.6)}${rrect(4.6, 2.4, 3.6, 1.8, .6)}` +
	`${circle(8, 8.7, 2.75, 0)}${circle(8, 8.7, 1.35)}${circle(12.3, 6.3, .7, 0)}"/>`);

// 74 phpcsfixer — SILHOUETTE wrench on the php hue (R3 family with core php)
emit('phpcsfixer',
	`<path fill="#6A7BC8" d="${capsule(4, 12, 11.4, 4.6, 1.15)}"/>` +
	`<path fill="#6A7BC8" d="${arcBand(12.2, 3.8, 1.35, 2.6, 50, 335)}"/>`);

// 75 phraseapp — SILHOUETTE globe (localization)
emit('phraseapp',
	`<path fill="#3E93C4" fill-rule="evenodd" d="${circle(8, 8, 6.2)}` +
	`${rect(2.4, 5.6, 11.2, .9)}${rect(2.4, 9.5, 11.2, .9)}${rect(7.55, 1.9, .9, 12.2)}"/>`);

// 76 pm2 — BADGE PM2
emit('pm2', plate('#2C30B9') + badgeLetters('PM2', { width: 11, fill: '#FFFFFF', spacing: -0.02 }));

// 77 pm2-ecosystem — SILHOUETTE process cluster (R3 family with pm2)
emit('pm2-ecosystem',
	`<path fill="#6A6EE0" d="${rrect(6.2, 6.2, 3.6, 3.6, .9)}` +
	`${capsule(5.4, 8, 6.4, 8, .6)}${capsule(9.6, 8, 10.6, 8, .6)}` +
	`${capsule(8, 5.4, 8, 6.4, .6)}${capsule(8, 9.6, 8, 10.6, .6)}` +
	`${circle(3.2, 8, 1.85)}${circle(12.8, 8, 1.85)}${circle(8, 3.2, 1.85)}${circle(8, 12.8, 1.85)}"/>`);

// 78 postcssconfig — SILHOUETTE transform chevrons on the postcss hue (R3 family)
emit('postcssconfig',
	`<path fill="#D0942F" d="${poly([1.3, 3, 2.9, 3, 5.3, 8, 2.9, 13, 1.3, 13, 3.7, 8])}` +
	`${poly([6, 3, 7.6, 3, 10, 8, 7.6, 13, 6, 13, 8.4, 8])}` +
	`${poly([10.7, 3, 12.3, 3, 14.7, 8, 12.3, 13, 10.7, 13, 13.1, 8])}"/>`);

// 79 posthtml — BADGE PH
emit('posthtml', plate('#D18A5E') + badgeLetters('PH', { width: 9.4, fill: '#FFFFFF' }));

// 80 preact — SILHOUETTE atom (R3 family with core reactjs)
emit('preact',
	`<path fill="#8A5CD6" fill-rule="evenodd" d="${tilted(8, 8, 6.3, 2.7, 0)}${tilted(8, 8, 4.9, 1.3, 0, 0)}"/>` +
	`<path fill="#8A5CD6" fill-rule="evenodd" d="${tilted(8, 8, 6.3, 2.7, 60)}${tilted(8, 8, 4.9, 1.3, 60, 0)}"/>` +
	`<path fill="#8A5CD6" fill-rule="evenodd" d="${tilted(8, 8, 6.3, 2.7, 120)}${tilted(8, 8, 4.9, 1.3, 120, 0)}"/>` +
	`<path fill="#8A5CD6" d="${circle(8, 8, 1.5)}"/>`);

// 81 precommit — SILHOUETTE hook (git pre-commit)
emit('precommit',
	`<path fill="#8E9E4E" d="${arcBand(8, 8.2, 2.8, 5, 0, 180)}${capsule(11.9, 2.4, 11.9, 8.2, 1.1)}"/>`);

// 82 prefect — SILHOUETTE paper plane (orchestration)
emit('prefect',
	`<path fill="#3E63D0" d="${poly([14.2, 2, 1.8, 7.2, 6.6, 9])}${poly([6.6, 9, 8.3, 13.6, 14.2, 2])}"/>`);

// 83 procfile — SILHOUETTE dyno (R3 family with heroku)
emit('procfile',
	`<path fill="#8455CE" fill-rule="evenodd" d="${rrect(1.6, 3.8, 12.8, 8.4, 4.2)}` +
	`${poly([6.3, 5.4, 11, 8, 6.3, 10.6])}"/>`);

// 84 protractor — SILHOUETTE protractor
emit('protractor',
	`<path fill="#C43E5E" fill-rule="evenodd" d="M1.2 12.2A6.8 6.8 0 0 1 14.8 12.2Z` +
	`M5.1 12.2A2.9 2.9 0 0 1 10.9 12.2Z` +
	`${arcBand(8, 12.2, 4.9, 6.2, 213, 219)}${arcBand(8, 12.2, 4.9, 6.2, 267, 273)}` +
	`${arcBand(8, 12.2, 4.9, 6.2, 321, 327)}"/>` +
	`<path fill="#C43E5E" d="${rrect(1.2, 12.2, 13.6, 1.9, .9)}"/>`);

for (const [id, bytes] of out) { console.log(String(bytes).padStart(5), id); }
