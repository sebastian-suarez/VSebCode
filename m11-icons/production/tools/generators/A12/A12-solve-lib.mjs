export function hsl(hex) {
	const r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255,
		b = parseInt(hex.slice(5, 7), 16) / 255;
	const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
	let h = 0, s = 0;
	if (mx !== mn) {
		const d = mx - mn;
		s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
		h = mx === r ? ((g - b) / d + (g < b ? 6 : 0)) : mx === g ? ((b - r) / d + 2) : ((r - g) / d + 4);
		h *= 60;
	}
	return [h, s * 100, l * 100];
}
