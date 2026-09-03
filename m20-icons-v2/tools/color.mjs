// color.mjs — the one palette regime (guide L6) expressed as functions.
//
// R1 never picks a colour by eye: every hex an icon uses is either an official
// brand hex or one of these transforms applied to it.

const hex2 = (v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0');

export function hsl(h, s, l) {
	h = ((h % 360) + 360) % 360; s /= 100; l /= 100;
	const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2;
	const t = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x]
		: h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
	return '#' + t.map(v => hex2((v + m) * 255)).join('').toUpperCase();
}

export function toHsl(hexStr) {
	const [r, g, b] = [1, 3, 5].map(i => parseInt(hexStr.slice(i, i + 2), 16) / 255);
	const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, l = (mx + mn) / 2;
	let h = 0;
	if (d) {
		h = mx === r ? ((g - b) / d + (g < b ? 6 : 0)) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
		h *= 60;
	}
	const s = d ? d / (1 - Math.abs(2 * l - 1)) : 0;
	return [h, s * 100, l * 100];
}

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/**
 * The one documented visibility lift (L2): a mark whose official hex is too
 * dark to clear the `#121314` backdrop is raised to L 88 with its hue and
 * saturation intact. Only markdown's `#000000` trips it in this set.
 */
export function lift(hexStr) {
	const [h, s, l] = toHsl(hexStr);
	return l < 22 ? hsl(h, s, 88) : hexStr;
}

/**
 * R3's chip band (S 45–70 / L 45–60) and R4's set band (S 45–70 / L 45–62).
 * Hue is never touched. Achromatic inks (white mascots, the neutral gray) are
 * EXEMPT from the saturation floor — clamping S on a hueless colour would
 * invent a hue, which is exactly the kind of judgement call L6 bans.
 */
export function band(hexStr, { sLo = 45, sHi = 70, lLo = 45, lHi = 62 } = {}) {
	const [h, s, l] = toHsl(hexStr);
	if (s < 12) { return hsl(h, s, clamp(l, 0, 92)); }
	return hsl(h, clamp(s, sLo, sHi), clamp(l, lLo, lHi));
}

export const chipBand = (hexStr) => band(lift(hexStr), { lLo: 45, lHi: 60 });
export const tamed = (hexStr) => band(lift(hexStr), { lLo: 45, lHi: 62 });

/**
 * SET CONSTANT — the open folder's second tone (NEW with the pilot).
 *
 * L7 makes closed and open ONE construction, so the open state may not pick its
 * own colours. The back sheet is therefore the body colour stepped down a fixed
 * DL 15 in HSL, hue and saturation untouched, with a floor so a dark brand body
 * cannot collapse into the backdrop. One formula for every folder, sand
 * included: it reproduces v1's own hand-picked sand pair (#BF9354 body ->
 * #8F6D37 back) to within two units per channel, which is why 15 is the step.
 */
export const OPEN_SHADE_DL = 15;
export const OPEN_SHADE_FLOOR = 18;
export function shade(hexStr) {
	const [h, s, l] = toHsl(hexStr);
	return hsl(h, s, Math.max(OPEN_SHADE_FLOOR, l - OPEN_SHADE_DL));
}

/** Relative luminance / WCAG contrast — the L5 contrast duty, measured. */
export function luminance(hexStr) {
	const c = [1, 3, 5].map(i => {
		const v = parseInt(hexStr.slice(i, i + 2), 16) / 255;
		return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
	});
	return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
export function contrast(a, b) {
	const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
	return (x + 0.05) / (y + 0.05);
}

/** Set neutrals. */
export const NEUTRAL = '#A6AEB6';   // the one ink for mark-less concepts (json, src, test)
export const SAND = '#BF9354';      // v1's generic-folder sand, kept (L7)
export const SLATE = '#5B6672';     // the neutral chip / neutral folder body
export const WHITE = '#FFFFFF';
export const BACKDROP = '#121314';  // Dark 2026 editor ground — the design target
