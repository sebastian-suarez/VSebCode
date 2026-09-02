// a08-roster.mjs — the A08 slice: 84 file icons (scratch authoring source, not shipped).
// Winding contract: every solid subpath is clockwise, every hole counter-clockwise, so
// the default nonzero rule unions solids and punches holes (spec R11).
import {
	poly, polyCCW, rrect, circleCW, circleCCW, ellipseCW, ellipseCCW, arcBand, star, gear,
	vBand, rects, rectsCCW, badgeInk, glyphInk, glyphCap, path, plate, svg, n
} from './a08-lib.mjs';

const W = '#FFFFFF';

// palette ---------------------------------------------------------------------
const VB = '#6A4FC8';        // Visual Basic / .NET purple, brand #512BD4 lifted
const VS = '#8E63C8';        // Visual Studio purple
const WECHAT = '#3EA86B';    // WeChat mini-program green
const SHADER = '#6E7ED8';    // wgsl / wesl family
const XSLATE = '#708CA0';    // xquery / xsl (neutral lane)
const BAZEL = '#4E9E5E';
const BASHLY = '#7E9E4E';
const ASTRO = '#8E52BE';
const BITB = '#2A56C4';

const rad = (d) => d * Math.PI / 180;
const P = (cx, cy, r, a) => [cx + r * Math.cos(rad(a)), cy + r * Math.sin(rad(a))];

// ---- marks ------------------------------------------------------------------

// two stacked sheets (msbuild project files)
const sheets = () =>
	rrect(2.4, 4.4, 8.6, 9.2, 1.1)
	+ 'M5.6 2.4h6a1.6 1.6 0 0 1 1.6 1.6v8.4h-1.5V4.4a.6 .6 0 0 0-.6-.6H5.6Z';

// two wind curls
const wind = () => {
	const bar = (x1, x2, y, t) => rrect(x1, y - t / 2, x2 - x1, t, t / 2);
	return bar(1.8, 8.8, 4.2, 1.7) + arcBand(8.8, 5.85, 2.6, 1.05, -90, 118)
		+ bar(1.8, 10.6, 10.2, 1.7) + bar(1.8, 7.4, 13, 1.7);
};

// IC / chip
const chip = () => {
	const pins = [];
	for (const c of [5.35, 7.35, 9.35]) {
		pins.push([2.5, c, 1.9, 1.3], [11.6, c, 1.9, 1.3], [c, 2.5, 1.3, 1.9], [c, 11.6, 1.3, 1.9]);
	}
	return rrect(4, 4, 8, 8, 1) + rects(pins);
};

// square wave
const wave = () => rects([
	[1.6, 9.9, 3.9, 1.5], [5.2, 3.9, 1.5, 7.5], [5.2, 3.9, 3.7, 1.5],
	[8.9, 3.9, 1.5, 7.5], [8.9, 9.9, 3.7, 1.5], [11.1, 3.9, 1.5, 7.5], [11.1, 3.9, 3.3, 1.5]
]);

// isometric cube
const cubeBody = () => poly([[8, 8], [13.5, 4.9], [13.5, 11.1], [8, 14.2], [2.5, 11.1], [2.5, 4.9]]);
const cubeTop = () => poly([[8, 1.8], [13.5, 4.9], [8, 8], [2.5, 4.9]]);

// infinity ribbon (Visual Studio): a figure-eight band
const infinity = () => {
	const A = 6.2, B = 6.6, t = 2.6, N = 34;
	const out = [], inn = [];
	for (let i = 0; i < N; i++) {
		const u = i / N * 2 * Math.PI;
		const x = 8 + A * Math.sin(u), y = 8 + B * Math.sin(u) * Math.cos(u);
		const dx = A * Math.cos(u), dy = B * Math.cos(2 * u), L = Math.hypot(dx, dy);
		const nx = -dy / L * t / 2, ny = dx / L * t / 2;
		out.push([x + nx, y + ny]);
		inn.push([x - nx, y - ny]);
	}
	return poly([...out, ...inn.reverse()]);
};

// puzzle piece (vsix)
const puzzle = () =>
	'M2.2 3.2h3.4a1.9 1.9 0 1 1 3.6 0h3.2v3.3a1.9 1.9 0 1 0 0 3.6v3.3H2.2Z';

// VR visor with a nose notch
const visor = () =>
	'M4 4.5h8a2.4 2.4 0 0 1 2.4 2.4v2.2a2.4 2.4 0 0 1-2.4 2.4H9.9a.9 .9 0 0 1-.72-.36l-.78-1.04a.5 .5 0 0 0-.8 0'
	+ 'l-.78 1.04a.9 .9 0 0 1-.72 .36H4a2.4 2.4 0 0 1-2.4-2.4V6.9A2.4 2.4 0 0 1 4 4.5Z';

// clock
const clock = () =>
	circleCW(8, 8, 6.2) + circleCCW(8, 8, 4.7) + rects([[7.3, 4.9, 1.4, 3.8], [7.3, 7.3, 3.5, 1.4]]);

// robot head
const robot = () =>
	rrect(3.5, 5.1, 9, 6.6, 1.7) + rects([[7.35, 2.9, 1.3, 2.4]]) + circleCW(8, 2.7, 1.1)
	+ circleCCW(6, 8.4, 1.15) + circleCCW(10, 8.4, 1.15);

// speech bubble
const bubble = () =>
	rrect(3, 3.9, 10, 7, 1.8) + poly([[5.3, 10.4], [8.4, 10.4], [5.3, 13.4]]);

// seal / chop
const seal = () =>
	rrect(2.9, 1.6, 10.2, 12.8, 1.5)
	+ rectsCCW([[4.2, 7.2, 7.6, 1.3], [5.2, 3.4, 1.3, 3.1], [9.5, 3.4, 1.3, 3.1],
		[5.2, 9.2, 1.3, 3.2], [9.5, 9.2, 1.3, 3.2]]);

// wasp
const wasp = () =>
	ellipseCW(4.2, 5.9, 2.5, 1.35) + ellipseCW(11.8, 5.9, 2.5, 1.35) + circleCW(8, 3.4, 1.75)
	+ ellipseCW(8, 9.5, 2.9, 4.9) + rectsCCW([[5.1, 8.2, 5.8, 1], [5.3, 10.8, 5.4, 1]]);

// wolfram spikey
const spikey = () => star(8, 8, 6.7, 4.3, 8, -67.5);

// UI designer window
const uiwin = () => rrect(1.6, 2.6, 12.8, 10.8, 1.5) + rectsCCW([[6.4, 6, 7, 6.4]]);

// hammer
const hammer = () => bar(4.1, 6.6, 9.7, 3.9, 3.2) + bar(7.4, 6, 11, 12.6, 2.1);

// X (xorg)
const bar = (x1, y1, x2, y2, t) => {
	const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
	const ox = -dy / L * (t / 2), oy = dx / L * (t / 2);
	return poly([[x1 + ox, y1 + oy], [x2 + ox, y2 + oy], [x2 - ox, y2 - oy], [x1 - ox, y1 - oy]]);
};
const xmark = () => bar(3.1, 3.1, 12.9, 12.9, 2.3) + bar(12.9, 3.1, 3.1, 12.9, 2.3);

// yin yang
const yinyang = () =>
	circleCW(8, 8, 6.3)
	+ 'M8 1.7A3.15 3.15 0 0 1 8 8A3.15 3.15 0 0 0 8 14.3A6.3 6.3 0 0 0 8 1.7Z'
	+ circleCW(8, 11.15, 1.1) + circleCCW(8, 4.85, 1.1);

// snake (vyper): an S band, head at the top right
const snakeBody = () =>
	'M2.1 13.7C2.1 8.9 10.8 8.8 10.8 4.4h3.1c0 6.4-8.8 6.4-8.8 9.3Z';
const snakeHead = () => circleCW(12.35, 3.5, 2.35) + circleCCW(13.1, 2.95, .7);

// rocket
const rocketBody = () =>
	'M8 1.7c1.95 2.1 2.95 4.75 2.95 7.5v2.4H5.05V9.2C5.05 6.45 6.05 3.8 8 1.7Z'
	+ circleCCW(8, 5.7, 1.25);
const rocketFins = () =>
	poly([[5.05, 8.5], [5.05, 11.7], [2.4, 13.5], [3.3, 10.1]])
	+ poly([[10.95, 8.5], [10.95, 11.7], [13.6, 13.5], [12.7, 10.1]])
	+ rects([[5.5, 11.8, 5, 1.6]]);

// beer mug
const mug = () =>
	rrect(2.5, 3.4, 8.2, 2.4, 1) + circleCW(4.5, 3.6, 1.4) + circleCW(8.3, 3.4, 1.6)
	+ rrect(2.6, 5, 8, 8.4, 1.2) + arcBand(10.6, 9, 3.3, 1.8, -108, 108);

// bricks
const bricks = () => rects([
	[2.6, 3.1, 4.7, 3], [8, 3.1, 5.4, 3],
	[2.6, 6.8, 3, 3], [6.3, 6.8, 3.4, 3], [10.4, 6.8, 3, 3],
	[2.6, 10.5, 5.4, 3], [8.7, 10.5, 4.7, 3]
]);

// ban sign (ignore)
const ban = () =>
	circleCW(8, 8, 6.3) + circleCCW(8, 8, 4.5) + bar(4.15, 11.85, 11.85, 4.15, 1.8);

// bitbucket bucket
const bucket = () =>
	poly([[1.6, 2.9], [14.4, 2.9], [11.9, 13.3], [4.1, 13.3]])
	+ polyCCW([[5.3, 6.4], [10.7, 6.4], [9.9, 9.7], [6.1, 9.7]]);

// circular arrow (CI)
const ciarrow = () => {
	const cx = 8, cy = 8.2, ro = 4.7, ri = 3.2, end = 340;
	const [mx, my] = P(cx, cy, (ro + ri) / 2, end);
	const tx = -Math.sin(rad(end)), ty = Math.cos(rad(end));      // tangent, increasing angle
	const nx = -ty, ny = tx;                                      // normal
	const hw = 2.6, len = 2.7;
	return arcBand(cx, cy, ro, ri, 40, end)
		+ poly([[mx + nx * hw, my + ny * hw], [mx - nx * hw, my - ny * hw], [mx + tx * len, my + ty * len]]);
};

// shell prompt
const prompt = () => vBand([[4.3, 4.9], [7.4, 8], [4.3, 11.1]], 1.7) + rects([[8.2, 9.9, 3.6, 1.5]]);

// settings sliders
const sliders = () => rects([
	[3, 4.4, 10, 1.4], [3, 7.3, 10, 1.4], [3, 10.2, 10, 1.4],
	[9.4, 3.3, 1.8, 3.6], [4.6, 6.2, 1.8, 3.6], [10.2, 9.1, 1.8, 3.6]
]);

// globe
const globe = () =>
	circleCW(8, 8, 6.2) + circleCCW(8, 8, 4.7)
	+ ellipseCW(8, 8, 3, 6.2) + ellipseCCW(8, 8, 1.55, 4.7)
	+ rects([[1.8, 7.25, 12.4, 1.5]]);

// medal
const medal = () =>
	poly([[3.9, 1.7], [6.4, 1.7], [9, 7.2], [6.5, 7.2]]) + poly([[12.1, 1.7], [9.6, 1.7], [7, 7.2], [9.5, 7.2]])
	+ circleCW(8, 10.5, 3.8) + circleCCW(8, 10.5, 1.7);

// azure "A", two tone
const azureDark = () => poly([[9.1, 2.2], [14.4, 13.4], [4.6, 13.4]]);
const azureLite = () => poly([[5.9, 5.3], [9.5, 13.4], [1.6, 13.4]]);

// amplify chevron
const amplifyMark = () => poly([[8, 2.4], [14.4, 13.6], [11.4, 13.6], [8, 7.7], [4.6, 13.6], [1.6, 13.6]]);

// geometric letter A (ansible / aurelia)
const letterA = () =>
	bar(8, 2.2, 3.1, 13.6, 2.2) + bar(8, 2.2, 12.9, 13.6, 2.2) + rects([[4.85, 9.3, 6.3, 1.8]]);

// apache feather
const feather = () =>
	'M13.8 2C13.73 5.97 7.92 13.33 3.2 13.8 3.16 9.06 9.86 2.5 13.8 2Z';

// paint brush
const brushHandle = () => poly([[12.7, 2], [14.2, 3.5], [9.1, 8.9], [7.5, 7.3]]);
const brushHead = () => 'M7.1 7.7 9.1 9.7 5.7 12.9a2.7 2.7 0 0 1-3.8-3.8Z';

// astro gear: a gear whose hole is the astro cone
const astroGear = () => gear(8, 8, 6.6, 4.9, 8, .55) + polyCCW([[8, 4.5], [10.6, 11], [5.4, 11]]);

// assembling blocks
const blocks = () =>
	rrect(2.3, 2.3, 5.2, 5.2, 1) + rrect(8.5, 2.3, 5.2, 5.2, 1) + rrect(2.3, 8.5, 5.2, 5.2, 1)
	+ poly([[11.2, 8.2], [14.2, 11.2], [11.2, 14.2], [8.2, 11.2]]);

// shield
const shield = () => 'M8 2.9 12.6 4.3v3.9c0 2.5-1.9 4.3-4.6 5-2.7-.7-4.6-2.5-4.6-5V4.3Z';

// lightning bolt
const bolt = () => poly([[10.1, 2.5], [4.6, 8.9], [7.7, 8.9], [6.3, 13.5], [11.6, 6.9], [8.5, 6.9]]);

// zigzag (vvvvvv)
const zigzag = () => vBand([[1.5, 5], [4.75, 10.8], [8, 5], [11.25, 10.8], [14.5, 5]], 2.3);

// vuex: vue chevron over a store base
const vuexV = () => poly([[14.8, 2.1], [9.17, 2.1], [8, 4.11], [6.83, 2.1], [1.2, 2.1], [8, 13.9]]);
const vuexInner = () => poly([[8, 9.15], [3.87, 2.1], [6.51, 2.1], [8, 4.67], [9.49, 2.1], [12.13, 2.1]]);

// ---- roster -----------------------------------------------------------------
export const ROSTER = [
	// ===== Visual Basic / Visual Studio family =====
	{
		id: 'vb', label: 'Visual Basic', tree: 'Module1.vb', arch: 'BADGE', fill: VB,
		src: 'brand #512BD4 → #6A4FC8 (lifted, §6.3)', letters: 'VB',
		body: plate(VB) + path(W, badgeInk('VB', 9.4).d)
	},
	{
		id: 'vba', label: 'Vba', tree: 'ThisWorkbook.cls', arch: 'BADGE', fill: VB,
		src: 'vb family (R3) #6A4FC8', letters: 'VBA',
		body: plate(VB) + path(W, badgeInk('VBA', 11, { letterSpacing: -.02 }).d)
	},
	{
		id: 'vbhtml', label: 'Vbhtml', tree: 'Index.vbhtml', arch: 'BADGE', fill: VB,
		src: 'vb family (R3) #6A4FC8', letters: '@ (razor sigil)',
		body: plate(VB) + path(W, badgeInk('@', 8.8).d)
	},
	{
		id: 'vbproj', label: 'Vbproj', tree: 'App.vbproj', arch: 'SILHOUETTE', fill: VB,
		src: 'vb family (R3) #6A4FC8',
		body: path(VB, sheets())
	},
	{
		id: 'vcxproj', label: 'Vcxproj', tree: 'App.vcxproj', arch: 'SILHOUETTE', fill: '#5E7A96',
		src: 'msbuild family (R3), C++ blue → neutral steel #5E7A96',
		body: path('#5E7A96', sheets())
	},
	{
		id: 'visualstudio', label: 'Visual Studio', tree: '.vsconfig', arch: 'SILHOUETTE', fill: VS,
		src: 'VS purple → #8E63C8',
		body: path(VS, infinity())
	},
	{
		id: 'vsixmanifest', label: 'Vsixmanifest', tree: 'source.extension.vsixmanifest', arch: 'SILHOUETTE', fill: VS,
		src: 'VS family (R3) #8E63C8',
		body: path(VS, puzzle())
	},
	// ===== V =====
	{
		id: 'vedic', label: 'Vedic', tree: 'hymn.vedic', arch: 'GLYPH', fill: '#C08442',
		src: 'no brand → saffron #C08442', letters: 'VED',
		body: path('#C08442', glyphInk('VED', 13.4, { letterSpacing: -.02 }).d)
	},
	{
		id: 'velocity', label: 'Velocity', tree: 'page.vm', arch: 'BADGE', fill: '#3F8E76',
		src: 'no brand → #3F8E76', letters: 'VTL',
		body: plate('#3F8E76') + path(W, badgeInk('VTL', 11, { letterSpacing: -.02 }).d)
	},
	{
		id: 'vento', label: 'Vento', tree: 'layout.vto', arch: 'GLYPH', fill: '#78D0DE',
		src: 'no brand → wind cyan #78D0DE',
		body: path('#78D0DE', wind())
	},
	{
		id: 'verilog', label: 'Verilog', tree: 'alu.v', arch: 'SILHOUETTE', fill: '#3E9E8E',
		src: 'no brand → #3E9E8E',
		body: path('#3E9E8E', chip())
	},
	{
		id: 'verse', label: 'Verse', tree: 'game.verse', arch: 'BADGE', fill: '#2A7272',
		src: 'no brand → #2A7272', letters: 'VRS',
		body: plate('#2A7272') + path(W, badgeInk('VRS', 11, { letterSpacing: -.02 }).d)
	},
	{
		id: 'vfl', label: 'Vfl', tree: 'layout.vfl', arch: 'GLYPH', fill: '#8E96A0',
		src: 'no brand → neutral #8E96A0', letters: 'VFL',
		body: path('#8E96A0', glyphInk('VFL', 13.4, { letterSpacing: -.02 }).d)
	},
	{
		id: 'vhdl', label: 'VHDL', tree: 'counter.vhdl', arch: 'GLYPH', fill: '#2E4EA8',
		src: 'no brand → #2E4EA8',
		body: path('#2E4EA8', wave())
	},
	{
		id: 'virtual', label: 'Virtual', tree: 'machine.vbox', arch: 'SILHOUETTE', fill: '#4C7FA8',
		src: 'VirtualBox blue → #4C7FA8 + lit face #6E9EC4', fills2: ['#6E9EC4'],
		body: path('#4C7FA8', cubeBody()) + path('#6E9EC4', cubeTop())
	},
	{
		id: 'vlang', label: 'V', tree: 'main.v', arch: 'GLYPH', fill: '#6690C4',
		src: 'brand #5D87BF → #6690C4', letters: 'V',
		body: path('#6690C4', glyphCap('V', 9.6).d)
	},
	{
		id: 'volt', label: 'Volt', tree: 'index.volt', arch: 'BADGE', fill: '#A0742E',
		src: 'no brand → #A0742E', letters: 'VLT',
		body: plate('#A0742E') + path(W, badgeInk('VLT', 11, { letterSpacing: -.02 }).d)
	},
	{
		id: 'vr', label: 'VR', tree: 'scene.vr.ts', arch: 'SILHOUETTE', fill: '#8A72D0',
		src: 'no brand → #8A72D0',
		body: path('#8A72D0', visor())
	},
	{
		id: 'vroom', label: 'Vroom', tree: 'plugin.vroom', arch: 'GLYPH', fill: '#5E9E5E',
		src: 'vim green → #5E9E5E', letters: 'VRM',
		body: path('#5E9E5E', glyphInk('VRM', 13.4, { letterSpacing: -.02 }).d)
	},
	{
		id: 'vuex-store', label: 'Vuex Store', tree: 'store.ts', arch: 'SILHOUETTE', fill: '#4CB392',
		src: 'vue family (R3) #4CB392 over #35806A (the two-tone vue mark)', fills2: ['#35806A'],
		body: path('#35806A', vuexV()) + path('#4CB392', vuexInner())
	},
	{
		id: 'vvvvvv', label: 'Vvvvvv', tree: 'level.vvvvvv', arch: 'GLYPH', fill: '#A8C43E',
		src: 'no brand → #A8C43E',
		body: path('#A8C43E', zigzag())
	},
	{
		id: 'vyper', label: 'Vyper', tree: 'token.vy', arch: 'SILHOUETTE', fill: '#3E8E9E',
		src: 'no brand → #3E8E9E',
		body: path('#3E8E9E', snakeBody()) + path('#3E8E9E', snakeHead())
	},
	// ===== W =====
	{
		id: 'wakatime', label: 'Wakatime', tree: '.wakatime-project', arch: 'SILHOUETTE', fill: '#4A8FC0',
		src: 'no brand → #4A8FC0',
		body: path('#4A8FC0', clock())
	},
	{
		id: 'wallaby', label: 'Wallaby', tree: 'wallaby.js', arch: 'BADGE', fill: '#8E5A38',
		src: 'no brand → #8E5A38', letters: 'WB',
		body: plate('#8E5A38') + path(W, badgeInk('WB', 9.4).d)
	},
	{
		id: 'wally', label: 'Wally', tree: 'wally.toml', arch: 'BADGE', fill: '#78B4E0',
		src: 'no brand → #78B4E0', letters: 'WL',
		body: plate('#78B4E0') + path(W, badgeInk('WL', 9.4).d)
	},
	{
		id: 'warp', label: 'Warp', tree: 'WARP.md', arch: 'BADGE', fill: '#52C4B4',
		src: 'no brand → #52C4B4', letters: 'WP',
		body: plate('#52C4B4') + path(W, badgeInk('WP', 9.4).d)
	},
	{
		id: 'wasp', label: 'Wasp', tree: 'main.wasp', arch: 'SILHOUETTE', fill: '#D8C03E',
		src: 'brand #FFCC00 → #D8C03E',
		body: path('#D8C03E', wasp())
	},
	{
		id: 'wdio', label: 'Wdio', tree: 'wdio.conf.ts', arch: 'BADGE', fill: '#D0603A',
		src: 'brand #EA5906 → #D0603A',
		body: plate('#D0603A') + path(W, robot())
	},
	{
		id: 'weblate', label: 'Weblate', tree: '.weblate', arch: 'BADGE', fill: '#5EA83E',
		src: 'no brand → #5EA83E',
		body: plate('#5EA83E') + path(W, bubble())
	},
	{
		id: 'wenyan', label: 'Wenyan', tree: 'poem.wy', arch: 'SILHOUETTE', fill: '#B84A46',
		src: 'seal red → #B84A46',
		body: path('#B84A46', seal())
	},
	{
		id: 'wepy', label: 'Wepy', tree: 'index.wpy', arch: 'BADGE', fill: WECHAT,
		src: 'WeChat green #07C160 → #3EA86B', letters: 'WPY',
		body: plate(WECHAT) + path(W, badgeInk('WPY', 11, { letterSpacing: -.02 }).d)
	},
	{
		id: 'werf', label: 'werf', tree: 'werf.yaml', arch: 'BADGE', fill: '#5A748E',
		src: 'no brand → #5A748E (neutral lane)', letters: 'WRF',
		body: plate('#5A748E') + path(W, badgeInk('WRF', 11, { letterSpacing: -.02 }).d)
	},
	{
		id: 'wesl', label: 'Wesl', tree: 'shader.wesl', arch: 'GLYPH', fill: SHADER,
		src: 'wgsl family (R3) #6E7ED8', letters: 'WE',
		body: path(SHADER, glyphInk('WE', 12).d)
	},
	{
		id: 'wgsl', label: 'WGSL', tree: 'shader.wgsl', arch: 'GLYPH', fill: SHADER,
		src: 'no brand → #6E7ED8', letters: 'WG',
		body: path(SHADER, glyphInk('WG', 12).d)
	},
	{
		id: 'wikitext', label: 'Wikitext', tree: 'article.wikitext', arch: 'BADGE', fill: '#8A8E96',
		src: 'wiki grey → #8A8E96 (neutral lane)', letters: 'W',
		body: plate('#8A8E96') + path(W, badgeInk('W', 9.2).d)
	},
	{
		id: 'wit', label: 'Wit', tree: 'world.wit', arch: 'GLYPH', fill: '#8A72D6',
		src: 'wasm family (R3) → #8A72D6', letters: 'WIT',
		body: path('#8A72D6', glyphInk('WIT', 13.4, { letterSpacing: -.02 }).d)
	},
	{
		id: 'wolfram', label: 'Wolfram', tree: 'notebook.wl', arch: 'SILHOUETTE', fill: '#C4432E',
		src: 'brand #DD1100 → #C4432E',
		body: path('#C4432E', spikey())
	},
	{
		id: 'wurst', label: 'Wurst', tree: 'unit.wurst', arch: 'BADGE', fill: '#96566E',
		src: 'no brand → #96566E', letters: 'WUR',
		body: plate('#96566E') + path(W, badgeInk('WUR', 11, { letterSpacing: -.02 }).d)
	},
	{
		id: 'wxml', label: 'Wxml', tree: 'index.wxml', arch: 'BADGE', fill: WECHAT,
		src: 'WeChat family (R3) #3EA86B', letters: '<>',
		body: plate(WECHAT) + path(W, badgeInk('<>', 10).d)
	},
	{
		id: 'wxss', label: 'Wxss', tree: 'index.wxss', arch: 'BADGE', fill: WECHAT,
		src: 'WeChat family (R3) #3EA86B', letters: '{}',
		body: plate(WECHAT) + path(W, badgeInk('{}', 7.6).d)
	},
	// ===== X =====
	{
		id: 'xaml', label: 'XAML', tree: 'MainWindow.xaml', arch: 'SILHOUETTE', fill: '#6A7ECC',
		src: 'no brand → #6A7ECC',
		body: path('#6A7ECC', uiwin())
	},
	{
		id: 'xcode', label: 'Xcode', tree: '.xcode-version', arch: 'BADGE', fill: '#26588A',
		src: 'Xcode blue → #26588A',
		body: plate('#26588A') + path(W, hammer())
	},
	{
		id: 'xfl', label: 'Xfl', tree: 'movie.xfl', arch: 'BADGE', fill: '#4A4458',
		src: 'Animate ink plate #4A4458 (neutral lane) + #E8705E letters', fills2: ['#E8705E'], letters: 'XFL',
		body: plate('#4A4458') + path('#E8705E', badgeInk('XFL', 11, { letterSpacing: -.02 }).d)
	},
	{
		id: 'xi', label: 'XI', tree: 'main.xi', arch: 'GLYPH', fill: '#7E8EA0',
		src: 'no brand → neutral #7E8EA0', letters: 'ξ',
		body: path('#7E8EA0', glyphCap('ξ', 9, { cy: 7.4 }).d)
	},
	{
		id: 'xib', label: 'Xib', tree: 'MainMenu.xib', arch: 'SILHOUETTE', fill: '#4C8CC8',
		src: 'xaml family (R3), Xcode blue #4C8CC8',
		body: path('#4C8CC8', uiwin())
	},
	{
		id: 'xliff', label: 'Xliff', tree: 'messages.xlf', arch: 'BADGE', fill: '#3EA0A8',
		src: 'no brand → #3EA0A8', letters: 'XLF',
		body: plate('#3EA0A8') + path(W, badgeInk('XLF', 11, { letterSpacing: -.02 }).d)
	},
	{
		id: 'xmake', label: 'xmake', tree: 'xmake.lua', arch: 'BADGE', fill: '#5E8E7E',
		src: 'no brand → #5E8E7E (neutral lane)', letters: 'XM',
		body: plate('#5E8E7E') + path(W, badgeInk('XM', 9.4).d)
	},
	{
		id: 'xorg', label: 'Xorg', tree: '.XCompose', arch: 'GLYPH', fill: '#8A94A0',
		src: 'X.Org black → neutral #8A94A0 (§6.3 lift)',
		body: path('#8A94A0', xmark())
	},
	{
		id: 'xquery', label: 'XQuery', tree: 'query.xquery', arch: 'BADGE', fill: XSLATE,
		src: 'xml slate → #708CA0 (neutral lane)', letters: 'XQ',
		body: plate(XSLATE) + path(W, badgeInk('XQ', 9.4).d)
	},
	{
		id: 'xsl', label: 'XSL', tree: 'transform.xsl', arch: 'BADGE', fill: XSLATE,
		src: 'xquery family (R3) #708CA0', letters: 'XSL',
		body: plate(XSLATE) + path(W, badgeInk('XSL', 11, { letterSpacing: -.02 }).d)
	},
	// ===== Y / Z =====
	{
		id: 'yacc', label: 'Yacc', tree: 'parser.bison', arch: 'BADGE', fill: '#B0A03E',
		src: 'no brand → #B0A03E', letters: 'YC',
		body: plate('#B0A03E') + path(W, badgeInk('YC', 9.4).d)
	},
	{
		id: 'yang', label: 'YANG', tree: 'model.yang', arch: 'SILHOUETTE', fill: '#6E9EB8',
		src: 'no brand → #6E9EB8',
		body: path('#6E9EB8', yinyang())
	},
	{
		id: 'zeabur', label: 'Zeabur', tree: 'zeabur.json', arch: 'BADGE', fill: '#C45ECC',
		src: 'no brand → #C45ECC', letters: 'Z',
		body: plate('#C45ECC') + path(W, badgeInk('Z', 5.8).d)
	},
	{
		id: 'zephir', label: 'Zephir', tree: 'kernel.zep', arch: 'BADGE', fill: '#5E7E8E',
		src: 'no brand → #5E7E8E (neutral lane)', letters: 'ZEP',
		body: plate('#5E7E8E') + path(W, badgeInk('ZEP', 11, { letterSpacing: -.02 }).d)
	},
	// ===== config: A =====
	{
		id: 'aikido', label: 'Aikido', tree: '.aikido', arch: 'BADGE', fill: '#A86A64',
		src: 'no brand → #A86A64',
		body: plate('#A86A64') + path(W, shield())
	},
	{
		id: 'allcontributors', label: 'Allcontributors', tree: '.all-contributorsrc', arch: 'SILHOUETTE', fill: '#C08A4E',
		src: 'no brand → #C08A4E',
		body: path('#C08A4E', medal())
	},
	{
		id: 'amplify', label: 'Amplify', tree: 'amplify.yml', arch: 'SILHOUETTE', fill: '#D8892E',
		src: 'AWS orange #FF9900 → #D8892E',
		body: path('#D8892E', amplifyMark())
	},
	{
		id: 'ansible', label: 'Ansible', tree: 'playbook.ansible', arch: 'GLYPH', fill: '#C03A38',
		src: 'brand #EE0000 → #C03A38',
		body: path('#C03A38', letterA())
	},
	{
		id: 'apache', label: 'Apache', tree: '.htaccess', arch: 'SILHOUETTE', fill: '#C0403C',
		src: 'brand #D22128 → #C0403C',
		body: path('#C0403C', feather())
	},
	{
		id: 'api-extractor', label: 'Api Extractor', tree: 'api-extractor.json', arch: 'BADGE', fill: '#4E6478',
		src: 'no brand → #4E6478 (neutral lane)', letters: 'API',
		body: plate('#4E6478') + path(W, badgeInk('API', 11, { letterSpacing: -.02 }).d)
	},
	{
		id: 'apollo', label: 'Apollo', tree: 'apollo.config.js', arch: 'SILHOUETTE', fill: '#5A4EB8',
		src: 'brand #311C87 → #5A4EB8 (lifted, §6.3)',
		body: path('#5A4EB8', rocketBody()) + path('#5A4EB8', rocketFins())
	},
	{
		id: 'appsemble', label: 'Appsemble', tree: 'app-definition.yaml', arch: 'SILHOUETTE', fill: '#D8846E',
		src: 'no brand → #D8846E',
		body: path('#D8846E', blocks())
	},
	{
		id: 'appveyor', label: 'AppVeyor', tree: 'appveyor.yml', arch: 'BADGE', fill: '#7E8E9E',
		src: 'no brand → #7E8E9E (neutral lane)',
		body: plate('#7E8E9E') + path(W, ciarrow())
	},
	{
		id: 'assembly-script', label: 'Assembly Script', tree: 'asconfig.json', arch: 'BADGE', fill: '#C2C6CC',
		src: 'brand #000000 → #C2C6CC (§6.3 lift, dark letters)', fills2: ['#26282B'], letters: 'as',
		body: plate('#C2C6CC') + path('#26282B', badgeInk('as', 9.4).d)
	},
	{
		id: 'astro-config', label: 'Astro Config', tree: 'astro.config.mjs', arch: 'SILHOUETTE', fill: ASTRO,
		src: 'astro family (R3) #8E52BE',
		body: path(ASTRO, astroGear())
	},
	{
		id: 'astroconfig', label: 'Astroconfig', tree: 'astro.config.ts', arch: 'SILHOUETTE', fill: ASTRO,
		src: 'astro family (R3) #8E52BE — same matcher as astro-config',
		body: path(ASTRO, astroGear())
	},
	{
		id: 'astyle', label: 'Astyle', tree: '.astylerc', arch: 'SILHOUETTE', fill: '#6E9E9E',
		src: 'no brand → #6E9E9E (neutral lane)',
		body: path('#6E9E9E', brushHandle()) + path('#6E9E9E', brushHead())
	},
	{
		id: 'asyncapi', label: 'Asyncapi', tree: 'asyncapi.yaml', arch: 'BADGE', fill: '#62D4A8',
		src: 'no brand → #62D4A8', letters: 'ASY',
		body: plate('#62D4A8') + path(W, badgeInk('ASY', 11, { letterSpacing: -.02 }).d)
	},
	{
		id: 'attw', label: 'Attw', tree: '.attw.json', arch: 'BADGE', fill: '#7E5A7E',
		src: 'no brand → #7E5A7E (neutral lane)', letters: 'ATW',
		body: plate('#7E5A7E') + path(W, badgeInk('ATW', 11, { letterSpacing: -.02 }).d)
	},
	{
		id: 'aurelia', label: 'Aurelia', tree: 'aurelia.json', arch: 'BADGE', fill: '#4A52A8',
		src: 'no brand → #4A52A8', letters: 'AUR',
		body: plate('#4A52A8') + path(W, badgeInk('AUR', 11, { letterSpacing: -.02 }).d)
	},
	{
		id: 'auto', label: 'Auto', tree: '.autorc', arch: 'BADGE', fill: '#6E8E5E',
		src: 'no brand → #6E8E5E (neutral lane)', letters: 'AU',
		body: plate('#6E8E5E') + path(W, badgeInk('AU', 9.4).d)
	},
	{
		id: 'azurepipelines', label: 'Azure Pipelines', tree: 'azure-pipelines.yml', arch: 'SILHOUETTE', fill: '#2E86C8',
		src: 'brand #0078D4 → #2E86C8 + #5EA8DC', fills2: ['#5EA8DC'],
		body: path('#5EA8DC', azureLite()) + path('#2E86C8', azureDark())
	},
	// ===== config: B =====
	{
		id: 'bashly', label: 'Bashly', tree: 'src/bashly.yml', arch: 'BADGE', fill: BASHLY,
		src: 'no brand → #7E9E4E',
		body: plate(BASHLY) + path(W, prompt())
	},
	{
		id: 'bashly-settings', label: 'Bashly Settings', tree: 'bashly-settings.yml', arch: 'BADGE', fill: BASHLY,
		src: 'bashly family (R3) #7E9E4E',
		body: plate(BASHLY) + path(W, sliders())
	},
	{
		id: 'bashly-strings', label: 'Bashly Strings', tree: 'src/bashly-strings.yml', arch: 'BADGE', fill: BASHLY,
		src: 'bashly family (R3) #7E9E4E', letters: '”',
		body: plate(BASHLY) + path(W, badgeInk('”', 7.2).d)
	},
	{
		id: 'bazaar', label: 'Bazaar', tree: '.bzrignore', arch: 'BADGE', fill: '#8E7E9E',
		src: 'no brand → #8E7E9E (neutral lane)', letters: 'BZR',
		body: plate('#8E7E9E') + path(W, badgeInk('BZR', 11, { letterSpacing: -.02 }).d)
	},
	{
		id: 'bazel-ignore', label: 'Bazel Ignore', tree: '.bazelignore', arch: 'SILHOUETTE', fill: BAZEL,
		src: 'bazel family (R3) #4E9E5E',
		body: path(BAZEL, ban())
	},
	{
		id: 'bazel-version', label: 'Bazel Version', tree: '.bazelversion', arch: 'SILHOUETTE', fill: BAZEL,
		src: 'bazel family (R3) #4E9E5E',
		body: path(BAZEL, bricks())
	},
	{
		id: 'bitbucket', label: 'Bitbucket', tree: 'bitbucket-pipelines.yaml', arch: 'SILHOUETTE', fill: BITB,
		src: 'brand #0052CC → #2A56C4',
		body: path(BITB, bucket())
	},
	{
		id: 'bitbucketpipeline', label: 'Bitbucket Pipelines', tree: 'bitbucket-pipelines.yml', arch: 'SILHOUETTE', fill: BITB,
		src: 'brand #0052CC → #2A56C4 — same matcher as bitbucket',
		body: path(BITB, bucket())
	},
	{
		id: 'bithound', label: 'Bithound', tree: '.bithoundrc', arch: 'BADGE', fill: '#7A8496',
		src: 'no brand → #7A8496 (neutral lane)', letters: 'BH',
		body: plate('#7A8496') + path(W, badgeInk('BH', 9.4).d)
	},
	{
		id: 'blitz', label: 'Blitz', tree: 'blitz.config.ts', arch: 'BADGE', fill: '#A05CD8',
		src: 'brand #6700EB → #A05CD8',
		body: plate('#A05CD8') + path(W, bolt())
	},
	{
		id: 'brew', label: 'Homebrew', tree: 'Brewfile', arch: 'SILHOUETTE', fill: '#D8A040',
		src: 'brand #FBB040 → #D8A040',
		body: path('#D8A040', mug())
	},
	{
		id: 'browserslist', label: 'Browserslist', tree: '.browserslistrc', arch: 'SILHOUETTE', fill: '#C8A24E',
		src: 'no brand → #C8A24E',
		body: path('#C8A24E', globe())
	}
];

export const render = (icon) => svg(icon.body);
