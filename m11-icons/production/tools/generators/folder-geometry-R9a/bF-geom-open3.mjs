// bF-geom-open3.mjs — open-flap box, final formulation.
// Constraint: the emblem box must lie inside the front flap ERODED by 0.4 px,
// i.e. every point of the box is >= 0.4 px (Euclidean) from the flap outline.
// Vertical: flap top 6.5 / bottom 12.8 are horizontal -> box y 6.90..12.40,
// side = 5.50. Free parameter: boxRight, bounded by the bottom-right cubic.

const CLEAR = 0.4;
const F = {                       // full flap outline, in order
	topLeft: [2.42, 6.5], topRight: [14.04, 6.5],
	trC1: [14.82, 6.5], trC2: [15.39, 7.23], trEnd: [15.21, 7.99],
	slantEnd: [14.23, 11.89],
	brC1: [14.10, 12.43], brC2: [13.62, 12.80], brEnd: [13.06, 12.80],
	botLeft: [2.7, 12.80], blC1: [2.04, 12.80], blC2: [1.5, 12.26], blEnd: [1.5, 11.6],
	vTop: [1.5, 7.7], tlC1: [1.5, 7.04], tlC2: [1.92, 6.5], tlEnd: [2.42, 6.5]
};
const bez = (a, b, c, d, t) => { const u = 1 - t; return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d; };
const bezPt = (p0, p1, p2, p3, t) => [bez(p0[0], p1[0], p2[0], p3[0], t), bez(p0[1], p1[1], p2[1], p3[1], t)];

const N = 6000;
const outline = [];
const cub = (a, b, c, d) => { for (let i = 0; i <= N; i++) { outline.push(bezPt(a, b, c, d, i / N)); } };
const seg = (a, b) => { for (let i = 0; i <= N; i++) { const f = i / N; outline.push([a[0] + f * (b[0] - a[0]), a[1] + f * (b[1] - a[1])]); } };
seg(F.topLeft, F.topRight);
cub(F.topRight, F.trC1, F.trC2, F.trEnd);
seg(F.trEnd, F.slantEnd);
cub(F.slantEnd, F.brC1, F.brC2, F.brEnd);
seg(F.brEnd, F.botLeft);
cub(F.botLeft, F.blC1, F.blC2, F.blEnd);
seg(F.blEnd, F.vTop);
cub(F.vTop, F.tlC1, F.tlC2, F.tlEnd);

const boxTop = 6.5 + CLEAR, boxBot = 12.8 - CLEAR, side = boxBot - boxTop;

// the bottom-right cubic alone (the binding curve for boxRight)
const brCurve = [];
for (let i = 0; i <= 20000; i++) { brCurve.push(bezPt(F.slantEnd, F.brC1, F.brC2, F.brEnd, i / 20000)); }
const distToBR = (p) => { let m = Infinity; for (const b of brCurve) { m = Math.min(m, Math.hypot(p[0] - b[0], p[1] - b[1])); } return m; };

// also the slant + top-right cubic (guard: they must not bind first)
const upper = [];
for (let i = 0; i <= 20000; i++) { const f = i / 20000; upper.push([F.trEnd[0] + f * (F.slantEnd[0] - F.trEnd[0]), F.trEnd[1] + f * (F.slantEnd[1] - F.trEnd[1])]); }
for (let i = 0; i <= 20000; i++) { upper.push(bezPt(F.topRight, F.trC1, F.trC2, F.trEnd, i / 20000)); }

function rightEdgeClearance(rx, pts) {
	let m = Infinity;
	for (const b of pts) { const cy = Math.min(Math.max(b[1], boxTop), boxBot); m = Math.min(m, Math.hypot(b[0] - rx, b[1] - cy)); }
	return m;
}

// binding: bottom-right corner (rx, boxBot) vs the bottom-right cubic
let lo = 12.5, hi = 14.0;
for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; (distToBR([mid, boxBot]) >= CLEAR) ? lo = mid : hi = mid; }
const boxRight = lo;

console.log(`side                    : ${side.toFixed(3)}   (box y ${boxTop.toFixed(2)} .. ${boxBot.toFixed(2)})`);
console.log(`boxRight (0.4 from BR cubic): ${boxRight.toFixed(4)}`);
console.log(`  corner (${boxRight.toFixed(3)}, ${boxBot}) -> dist to BR cubic  = ${distToBR([boxRight, boxBot]).toFixed(4)}`);
console.log(`  right edge -> dist to slant/top-right chain = ${rightEdgeClearance(boxRight, upper).toFixed(4)}  (must be >= ${CLEAR})`);

// global check: min distance from the whole box outline to the whole flap outline
function globalMin(rx) {
	const pts = []; const M = 1200;
	for (let i = 0; i <= M; i++) {
		const f = i / M;
		pts.push([rx - side + f * side, boxTop]);
		pts.push([rx - side + f * side, boxBot]);
		pts.push([rx, boxTop + f * side]);
		pts.push([rx - side, boxTop + f * side]);
	}
	let m = Infinity;
	for (const p of pts) { for (const b of outline) { const d = Math.hypot(p[0] - b[0], p[1] - b[1]); if (d < m) { m = d; } } }
	return m;
}
console.log(`  GLOBAL min clearance box-outline <-> flap-outline = ${globalMin(boxRight).toFixed(4)}`);
console.log(`  (at boxRight+0.05 it would be ${globalMin(boxRight + 0.05).toFixed(4)})`);

const ox = boxRight - side;
console.log(`\n==> OPEN BOX  { ox: ${ox.toFixed(2)}, oy: ${boxTop.toFixed(2)}, k: ${(side / 10).toFixed(3)} }`);
console.log(`    x ${ox.toFixed(3)} .. ${boxRight.toFixed(3)}   y ${boxTop.toFixed(2)} .. ${boxBot.toFixed(2)}   side ${side.toFixed(2)} px`);
console.log(`    vs OLD 5.20 -> x${(side / 5.2).toFixed(4)}`);
