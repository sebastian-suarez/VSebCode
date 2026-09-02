// A10 part 2 — jasmine … lynx
import { write, circle, ellipse, rrect, rect, poly, plate, capsule, ngon, badgeLetters } from './a10-lib.mjs';

const out = [];
const emit = (id, inner) => out.push([id, write(id, inner)]);

// 19 jasmine — SILHOUETTE jasmine flower (brand plum)
{
	const petals = [];
	for (let i = 0; i < 5; i++) {
		const a = (-90 + i * 72) * Math.PI / 180;
		petals.push(circle(8 + 3.35 * Math.cos(a), 8 + 3.35 * Math.sin(a), 2.55));
	}
	emit('jasmine', `<path fill="#9B4E93" fill-rule="evenodd" d="${petals.join('')}${circle(8, 8, 1.15, 0)}"/>`);
}

// 20 jetbrains — BADGE IJ (.iml / IntelliJ module)
emit('jetbrains', plate('#A63F53') + badgeLetters('IJ', { width: 9.3, fill: '#FFFFFF', spacing: 0.06 }));

// 21 jpm — SILHOUETTE jetpack (Mozilla Jetpack package manager)
emit('jpm',
	`<path fill="#C87A3C" d="${rrect(2.9, 2.2, 3.6, 8.6, 1.8)}${rrect(9.5, 2.2, 3.6, 8.6, 1.8)}` +
	`${rect(6.3, 5.2, 3.4, 1.7)}` +
	`${poly([3.5, 11, 5.9, 11, 4.7, 14.4])}${poly([10.1, 11, 12.5, 11, 11.3, 14.4])}"/>`);

// 22 jshint — SILHOUETTE lint funnel (js hue)
emit('jshint',
	`<path fill="#D8C24A" d="${poly([1.6, 2.6, 14.4, 2.6, 9.4, 8.7, 9.4, 13.6, 6.6, 13.6, 6.6, 8.7])}"/>`);

// 23 jsr — BADGE jsr (brand yellow → deep gold, js badge band avoided)
emit('jsr', plate('#9E8B22') + badgeLetters('jsr', { width: 10.6, fill: '#FFFFFF', band: 'x' }));

// 24 keystatic — SILHOUETTE arch / keystone
emit('keystatic',
	`<path fill="#4E9A9E" fill-rule="evenodd" d="M1.8 13.6V7.6a6.2 6.2 0 0 1 12.4 0v6h-2.8v-6a3.4 3.4 0 0 0-6.8 0v6Z"/>`);

// 25 kitchenci — SILHOUETTE chef's toque (Test Kitchen)
emit('kitchenci',
	`<path fill="#D9A047" d="${circle(5.1, 5.6, 2.8)}${circle(8, 4.7, 3.1)}${circle(10.9, 5.6, 2.8)}` +
	`${rect(4.1, 5.6, 7.8, 4.8)}${rrect(3.7, 10.2, 8.6, 3, .7)}"/>`);

// 26 kite — SILHOUETTE kite with a tail
emit('kite',
	`<path fill="#7A7BD4" d="${poly([8, 1.4, 12.4, 5.8, 8, 11.2, 3.6, 5.8])}"/>` +
	`<path fill="#7A7BD4" d="${poly([9.9, 11.35, 11.15, 12.6, 9.9, 13.85, 8.65, 12.6])}` +
	`${poly([6.8, 13.2, 7.9, 14.3, 6.8, 15.4, 5.7, 14.3])}"/>`);

// 27 kodiak — SILHOUETTE bear paw (Kodiak merge bot)
emit('kodiak',
	`<path fill="#9A6E4E" d="${ellipse(8, 10.4, 3.6, 3.2)}` +
	`${circle(3.6, 6, 1.4)}${circle(6.4, 4.4, 1.4)}${circle(9.6, 4.4, 1.4)}${circle(12.4, 6, 1.4)}"/>`);

// 28 kubernetes — SILHOUETTE heptagon + knocked-out wheel (helm-family rhyme, R3)
{
	emit('kubernetes',
		`<path fill="#3A6BC0" fill-rule="evenodd" d="${ngon(8, 8, 6.7, 7)}${ngon(8, 8, 3.4, 7)}"/>` +
		`<path fill="#3A6BC0" d="${circle(8, 8, 1.45)}"/>`);
}

// 29 lerna — SILHOUETTE hydra (brand violet)
emit('lerna',
	`<path fill="#9A5FD0" d="${poly([5, 13.6, 11, 13.6, 10, 10.8, 6, 10.8])}` +
	`${capsule(8, 11.8, 3.7, 5.5, .82)}${capsule(8, 11.8, 8, 3.1, .82)}${capsule(8, 11.8, 12.3, 5.5, .82)}` +
	`${circle(3.7, 5.5, 1.8)}${circle(8, 3.1, 1.8)}${circle(12.3, 5.5, 1.8)}"/>`);

// 30 liara — BADGE Li (cloud PaaS)
emit('liara', plate('#A745B8') + badgeLetters('Li', { width: 9.3, fill: '#FFFFFF', spacing: 0.04 }));

// 31 licensebat — SILHOUETTE bat
emit('licensebat',
	`<path fill="#8A7FB8" d="${poly([8, 6.4, 4.8, 4.6, 1.3, 4, 3, 7.2, 1.6, 7.4, 3.6, 9.4, 2.9, 11, 5.6, 9.8, 8, 11.6])}` +
	`${poly([8, 6.4, 11.2, 4.6, 14.7, 4, 13, 7.2, 14.4, 7.4, 12.4, 9.4, 13.1, 11, 10.4, 9.8, 8, 11.6])}` +
	`${ellipse(8, 8.6, 1.3, 2.6)}${circle(8, 5.4, 1.5)}` +
	`${poly([6.9, 4.7, 7.2, 2.6, 8.1, 4.2])}${poly([9.1, 4.7, 8.8, 2.6, 7.9, 4.2])}"/>`);

// 32 lintstagedrc — SILHOUETTE broom
emit('lintstagedrc',
	`<path fill="#5FA88E" fill-rule="evenodd" d="${rect(7.3, 1.6, 1.4, 6.6)}` +
	`${poly([5, 8, 11, 8, 13, 13.8, 3, 13.8])}` +
	`${rect(5.65, 10.4, .9, 3.4)}${rect(7.55, 10.4, .9, 3.4)}${rect(9.45, 10.4, .9, 3.4)}"/>`);

// 33 livekit — GLYPH level-meter bars
emit('livekit',
	`<path fill="#85CED6" d="${rrect(2.2, 5.4, 2.6, 5.2, 1.3)}${rrect(6.7, 2.4, 2.6, 11.2, 1.3)}` +
	`${rrect(11.2, 5.4, 2.6, 5.2, 1.3)}"/>`);

// 34 lychee — SILHOUETTE lychee fruit (link checker)
emit('lychee',
	`<path fill="#C4566B" fill-rule="evenodd" d="${circle(8, 9.4, 4.5)}` +
	`${circle(6.4, 8.2, .62, 0)}${circle(9.4, 7.9, .62, 0)}${circle(7.8, 10.7, .62, 0)}` +
	`${circle(10.2, 10.9, .62, 0)}${circle(5.9, 11.3, .62, 0)}"/>` +
	`<path fill="#C4566B" d="${rect(7.55, 3.4, .9, 2)}` +
	`M8.5 4.6C9.6 2.4 11.6 1.7 13.4 2.1C12.8 4.1 10.8 5.2 8.5 4.6Z"/>`);

// 35 lynx — SILHOUETTE cat eye
emit('lynx',
	`<path fill="#C9A24E" fill-rule="evenodd" d="M1.6 8C4 2.6 12 2.6 14.4 8C12 13.4 4 13.4 1.6 8Z` +
	`M8 4.7C6.8 6 6.8 10 8 11.3C9.2 10 9.2 6 8 4.7Z"/>`);

for (const [id, bytes] of out) { console.log(String(bytes).padStart(5), id); }
