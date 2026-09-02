// A10 part 1 — hack … ini
import { letters, write, n, circle, ellipse, rrect, rect, poly, plate } from './a10-lib.mjs';

const out = [];
const emit = (id, inner) => out.push([id, write(id, inner)]);

// capsule (rounded-end bar) from P to Q, radius r
function cap(x1, y1, x2, y2, r) {
	const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
	const ux = dx / L, uy = dy / L, px = -uy * r, py = ux * r;
	return `M${n(x1 + px)} ${n(y1 + py)}L${n(x2 + px)} ${n(y2 + py)}` +
		`A${n(r)} ${n(r)} 0 0 1 ${n(x2 - px)} ${n(y2 - py)}L${n(x1 - px)} ${n(y1 - py)}` +
		`A${n(r)} ${n(r)} 0 0 1 ${n(x1 + px)} ${n(y1 + py)}Z`;
}

// 1 hack — BADGE, hacklang amber, lowercase hh on the x-height band (R5)
emit('hack', plate('#A46E33') +
	letters({ text: 'hh', xheight: 4.6, cx: 8, baseline: 11.15, fill: '#FFFFFF' }));

// 2 hadolint — SILHOUETTE magnifier, docker blue (deliberate Dockerfile-linter rhyme)
emit('hadolint',
	`<path fill="#3E92C6" fill-rule="evenodd" d="${circle(6.4, 6.4, 4.6)}${circle(6.4, 6.4, 2.85, 0)}"/>` +
	`<path fill="#3E92C6" d="${poly([8.87, 10.66, 12.72, 14.51, 14.51, 12.72, 10.66, 8.87])}"/>`);

// 3 happo — SILHOUETTE two offset frames (visual regression), neutral
emit('happo',
	`<path fill="#8C8FA8" fill-rule="evenodd" d="${rrect(1.4, 2.4, 9.4, 7.6, 1.2)}${rrect(2.7, 3.7, 6.8, 5, .6)}"/>` +
	`<path fill="#8C8FA8" d="${rrect(5.6, 6.4, 9, 7.2, 1.2)}"/>`);

// 4 hardhat — SILHOUETTE hard hat (brand yellow, matte)
emit('hardhat',
	`<path fill="#DFB63F" d="M3.4 11.4C3.4 5.4 4.8 3.2 8 3.2C11.2 3.2 12.6 5.4 12.6 11.4Z` +
	`${ellipse(8, 11.4, 6.6, 1.35)}"/>`);

// 5 harmonix — SILHOUETTE tuning fork
emit('harmonix',
	`<path fill="#4FA8A0" d="${rect(2.9, 1.7, 2, 7.2)}${rect(11.1, 1.7, 2, 7.2)}` +
	`M2.9 8.2h10.2v1.3a1.3 1.3 0 0 1-1.3 1.3H4.2a1.3 1.3 0 0 1-1.3-1.3Z${rrect(7.05, 10.6, 1.9, 3.7, .8)}"/>`);

// 6 haxecheckstyle — SILHOUETTE ruler (Haxe orange)
emit('haxecheckstyle',
	`<path fill="#D07C2E" fill-rule="evenodd" d="${rrect(1.2, 4.4, 13.6, 7.2, 1.2)}` +
	`${rect(3.2, 4.4, 1.2, 3.4)}${rect(5.4, 4.4, 1.2, 2.2)}${rect(7.6, 4.4, 1.2, 3.4)}` +
	`${rect(9.8, 4.4, 1.2, 2.2)}${rect(12, 4.4, 1.2, 3.4)}"/>`);

// 7 helix — SILHOUETTE double helix (Perforce Helix / .p4ignore)
emit('helix',
	`<path fill="#3E9E7A" d="M7.25 1.8C9.65 1.8 11.85 3 11.85 4.9C11.85 6.8 9.65 8 7.25 8` +
	`C4.85 8 2.65 9.2 2.65 11.1C2.65 13 4.85 14.2 7.25 14.2L8.75 14.2C6.35 14.2 4.15 13 4.15 11.1` +
	`C4.15 9.2 6.35 8 8.75 8C11.15 8 13.35 6.8 13.35 4.9C13.35 3 11.15 1.8 8.75 1.8Z` +
	`M8.75 1.8C6.35 1.8 4.15 3 4.15 4.9C4.15 6.8 6.35 8 8.75 8C11.15 8 13.35 9.2 13.35 11.1` +
	`C13.35 13 11.15 14.2 8.75 14.2L7.25 14.2C9.65 14.2 11.85 13 11.85 11.1C11.85 9.2 9.65 8 7.25 8` +
	`C4.85 8 2.65 6.8 2.65 4.9C2.65 3 4.85 1.8 7.25 1.8Z` +
	`${rect(4.5, 2.95, 7, 1.1)}${rect(4.5, 5.75, 7, 1.1)}${rect(4.5, 9.15, 7, 1.1)}${rect(4.5, 11.95, 7, 1.1)}"/>`);

// 8 heroku — GLYPH the Heroku angled H (R1: drawn geometry, not type)
emit('heroku',
	`<path fill="#8455CE" d="${rect(3, 2.4, 2, 11.2)}${rect(11, 2.4, 2, 11.2)}` +
	`${poly([5, 9.4, 11, 5.6, 11, 7.9, 5, 11.7])}"/>`);

// 9 histoire — SILHOUETTE quill
emit('histoire',
	`<path fill="#C4608F" d="M13.7 1.9C13.9 7.5 10.6 12 5.4 13.1C4.3 7.9 8.2 3 13.7 1.9Z` +
	`${poly([5.4, 11.4, 7.5, 13.5, 2.2, 14.5])}"/>`);

// 10 homeassistant — SILHOUETTE house with the HA circuit knocked out
emit('homeassistant',
	`<path fill="#4CB4E0" fill-rule="evenodd" d="M8 1.5L14.5 7.6V14.2H1.5V7.6Z` +
	`${cap(8, 12.5, 8, 9.4, .85)}${cap(8, 9.4, 5, 6.4, .85)}${cap(8, 9.4, 11, 6.4, .85)}"/>`);

// 11 host — SILHOUETTE server rack (hosts file), neutral steel
emit('host',
	`<path fill="#8B9AA6" fill-rule="evenodd" d="${rrect(1.8, 2.4, 12.4, 3.2, .9)}${circle(3.7, 4, .62)}${rrect(8.8, 3.55, 3.8, .9, .45)}` +
	`${rrect(1.8, 6.4, 12.4, 3.2, .9)}${circle(3.7, 8, .62)}${rrect(8.8, 7.55, 3.8, .9, .45)}` +
	`${rrect(1.8, 10.4, 12.4, 3.2, .9)}${circle(3.7, 12, .62)}${rrect(8.8, 11.55, 3.8, .9, .45)}"/>`);

// 12 htmlhint — SILHOUETTE lightbulb (html hue)
emit('htmlhint',
	`<path fill="#C9603E" d="${circle(8, 6, 4.4)}${rect(6.2, 10, 3.6, 1.7)}${rrect(5.8, 12.4, 4.4, 1.7, .75)}"/>`);

// 13 htmlvalidate — SILHOUETTE rubber stamp (html hue)
emit('htmlvalidate',
	`<path fill="#C25A3C" d="${rrect(6.2, 2.2, 3.6, 3.4, 1)}${poly([5.2, 5.4, 10.8, 5.4, 12.4, 9.8, 3.6, 9.8])}` +
	`${rrect(1.8, 11, 12.4, 2.6, .9)}"/>`);

// 14 hugo — BADGE, single H (brand pink → matte)
emit('hugo', plate('#B23F76') +
	letters({ text: 'H', cap: 7, cx: 8, baseline: 12.13, fill: '#FFFFFF' }));

// 15 husky — SILHOUETTE husky head (git hooks)
emit('husky',
	`<path fill="#7E96B0" fill-rule="evenodd" d="${poly([2.6, 1.6, 5.8, 3.5, 3.5, 7.2])}` +
	`${poly([13.4, 1.6, 10.2, 3.5, 12.5, 7.2])}` +
	`M3.2 4.6C2.6 9 4.6 12.4 8 14.4C11.4 12.4 13.4 9 12.8 4.6C11 5.8 5 5.8 3.2 4.6Z` +
	`${circle(5.9, 8, .82)}${circle(10.1, 8, .82)}${poly([8, 12.2, 6.7, 10.5, 9.3, 10.5])}"/>`);

// 16 ifanr-cloud — SILHOUETTE cloud
emit('ifanr-cloud',
	`<path fill="#5AA8D8" d="${circle(5.2, 9, 3.2)}${circle(8.4, 7.2, 3.9)}${circle(11.6, 9.6, 2.9)}` +
	`${rrect(2, 9.8, 12, 3.4, 1.2)}"/>`);

// 17 imgbot — SILHOUETTE robot head
emit('imgbot',
	`<path fill="#4FA3B4" fill-rule="evenodd" d="${rrect(2.4, 4.6, 11.2, 9, 2.2)}` +
	`${rect(7.4, 1.9, 1.2, 2.7)}${circle(8, 1.5, 1.35)}` +
	`${circle(5.6, 8.2, 1.3, 0)}${circle(10.4, 8.2, 1.3, 0)}${rrect(5.6, 11, 4.8, 1.1, .55)}"/>`);

// 18 ini — GLYPH [=] section syntax (letterpath)
emit('ini', letters({ text: '[=]', 'ink-height': 9.6, cx: 8, 'cy-ink': 8, fill: '#A8A08C' }));

for (const [id, bytes] of out) { console.log(String(bytes).padStart(5), id); }
