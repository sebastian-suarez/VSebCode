// color.mjs — the one palette regime (guide L6) expressed as functions.
//
// Round 2 never picks a colour by eye: every hex an icon uses is either an
// official brand hex or one of these transforms applied to it.

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

/** Set neutrals. */
export const NEUTRAL = '#A6AEB6';   // the one ink for mark-less concepts (json, src)
export const SAND = '#BF9354';      // v1's generic-folder sand, kept (L7)
export const SLATE = '#5B6672';     // the neutral chip / neutral folder body
export const WHITE = '#FFFFFF';
