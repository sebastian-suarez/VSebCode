// A12-solve.mjs — settle slice A12's palette against R7.
// Hard: BADGE-BADGE and GLYPH-GLYPH inside the slice (hue is the whole read there, §10.1).
// Soft: SILHOUETTE-SILHOUETTE (form-qualified lane) — minimised, not required to hit zero.
import { ALL } from './A12-build.mjs';
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

// hue slack in degrees: 0 = canon/family locked, 8 = brand-recognised, 40 = free
const SLACK = {
	'vscode-test': 0, vueconfig: 0, 'json-schema': 0, tsdoc: 0, svgr: 0, figma: 0, ai: 0, photoshop: 0,
	vim: 8, wrangler: 8, wxt: 8, yandex: 8, postman: 8, rojo: 8, access: 8, docusaurus: 8, windi: 8,
	'libreoffice-calc': 8, 'libreoffice-writer': 8, 'libreoffice-math': 8, markdoc: 0, openapi: 8,
	blender: 8, sketch: 8, drawio: 8, excalidraw: 8, lottie: 8, gltf: 8, matlab: 8,
	affinitydesigner: 8, affinityphoto: 8, svgo: 8
};
const slack = (id) => (SLACK[id] === undefined ? 30 : SLACK[id]);

const hex = ([h, s, l]) => {
	h = ((h % 360) + 360) % 360; s /= 100; l /= 100;
	const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2;
	const t = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] :
		h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
	return '#' + t.map(v => Math.round((v + m) * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
};
const dh = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
const twin = (A, B) => A.s >= 25 && B.s >= 25 && dh(A.h, B.h) < 12 &&
	Math.abs(A.l - B.l) < 12 && Math.abs(A.s - B.s) < 25;

const P = ALL.map(i => {
	const [h, s, l] = hsl(i.fills[0]);
	return { id: i.id, arch: i.arch, h, s, l, h0: h, s0: s, l0: l, sl: slack(i.id) };
});
const idx = new Map(P.map((p, i) => [p.id, i]));

function cost(list) {
	let c = 0;
	for (let i = 0; i < list.length; i++) {
		for (let j = i + 1; j < list.length; j++) {
			const a = list[i], b = list[j];
			if (a.arch !== b.arch) { continue; }
			if (!twin(a, b)) { continue; }
			c += a.arch === 'SILHOUETTE' ? 1 : 40;
		}
	}
	// stay near the briefed hue / value
	for (const p of list) {
		c += 0.11 * dh(p.h, p.h0) + 0.06 * Math.abs(p.s - p.s0) + 0.10 * Math.abs(p.l - p.l0);
	}
	return c;
}

let best = cost(P);
const HS = [0, 4, -4, 8, -8, 12, -12, 16, -16, 20, -20, 25, -25, 30, -30];
const SS = [0, 5, -5, 10, -10, 15, -15, 20, -20];
const LS = [0, 4, -4, 8, -8, 12, -12, 16, -16];
for (let pass = 0; pass < 40; pass++) {
	let moved = false;
	for (const p of P) {
		if (p.sl === 0) { continue; }
		const keep = { h: p.h, s: p.s, l: p.l };
		let localBest = best, pick = keep;
		for (const dhh of HS) {
			if (Math.abs(dhh) > p.sl) { continue; }
			for (const ds of SS) {
				for (const dl of LS) {
					p.h = p.h0 + dhh;
					p.s = Math.max(30, Math.min(74, p.s0 + ds));
					p.l = Math.max(38, Math.min(70, p.l0 + dl));
					const c = cost(P);
					if (c < localBest - 1e-9) { localBest = c; pick = { h: p.h, s: p.s, l: p.l }; }
				}
			}
		}
		Object.assign(p, pick);
		if (localBest < best - 1e-9) { best = localBest; moved = true; }
	}
	if (!moved) { break; }
}

let hard = 0, soft = 0;
for (let i = 0; i < P.length; i++) {
	for (let j = i + 1; j < P.length; j++) {
		if (P[i].arch !== P[j].arch || !twin(P[i], P[j])) { continue; }
		if (P[i].arch === 'SILHOUETTE') { soft++; console.log('SOFT', P[i].id, P[j].id); }
		else { hard++; console.log('HARD', P[i].arch, P[i].id, P[j].id); }
	}
}
console.log(`\nhard ${hard}, soft ${soft}, cost ${best.toFixed(2)}\n`);
for (const p of P) {
	const nh = hex([p.h, p.s, p.l]);
	if (nh !== hex([p.h0, p.s0, p.l0])) {
		console.log(`\t${JSON.stringify(p.id)}: '${nh}',  // was ${hex([p.h0, p.s0, p.l0])} — h${Math.round(p.h0)}→${Math.round(p.h)} s${Math.round(p.s0)}→${Math.round(p.s)} l${Math.round(p.l0)}→${Math.round(p.l)}`);
	}
}
void idx;
