// bF-geom-open.mjs — honest computation of the largest emblem box the OPEN
// folder's front flap allows with ~0.4 px clearance from top, bottom and the
// slanted right edge.
//
// Front flap (canon, verbatim):
//   M2.42 6.5 h11.62 c.78 0 1.35.73 1.17 1.49 l-.98 3.9
//   c-.13.54-.61.91-1.17.91 H2.7 c-.66 0-1.2-.54-1.2-1.2 V7.7
//   c0-.66.42-1.2.92-1.2 z

const CLEAR = 0.4;

// absolute geometry of the flap outline
const P = {
	topLeft: [2.42, 6.5],
	topRight: [14.04, 6.5],
	trC1: [14.82, 6.5], trC2: [15.39, 7.23], trEnd: [15.21, 7.99],
	slantEnd: [14.23, 11.89],
	brC1: [14.10, 12.43], brC2: [13.62, 12.80], brEnd: [13.06, 12.80],
	botLeft: [2.7, 12.80]
};

const bez = (a, b, c, d, t) => {
	const u = 1 - t;
	return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
};
const bezPt = (p0, p1, p2, p3, t) => [
	bez(p0[0], p1[0], p2[0], p3[0], t),
	bez(p0[1], p1[1], p2[1], p3[1], t)
];

// --- 1. vertical extent -----------------------------------------------------
const FLAP_TOP = 6.5;
const FLAP_BOT = 12.80;
const boxTop = FLAP_TOP + CLEAR;
const boxBot = FLAP_BOT - CLEAR;
const side = boxBot - boxTop;
console.log(`flap y-span   : ${FLAP_TOP} .. ${FLAP_BOT}  (height ${(FLAP_BOT - FLAP_TOP).toFixed(3)})`);
console.log(`box  y-span   : ${boxTop} .. ${boxBot}  -> max side ${side.toFixed(3)} px (top+bottom clearance ${CLEAR} each)`);

// --- 2. right boundary of the flap, sampled --------------------------------
// Returns the flap's right-edge x at a given y (for y inside the flap).
function rightX(y) {
	if (y <= P.trEnd[1]) {
		// top-right cubic: solve for t where y(t) = y
		let lo = 0, hi = 1;
		for (let i = 0; i < 80; i++) {
			const m = (lo + hi) / 2;
			(bez(P.topRight[1], P.trC1[1], P.trC2[1], P.trEnd[1], m) < y) ? lo = m : hi = m;
		}
		return bez(P.topRight[0], P.trC1[0], P.trC2[0], P.trEnd[0], (lo + hi) / 2);
	}
	if (y <= P.slantEnd[1]) {
		const f = (y - P.trEnd[1]) / (P.slantEnd[1] - P.trEnd[1]);
		return P.trEnd[0] + f * (P.slantEnd[0] - P.trEnd[0]);
	}
	// bottom-right cubic
	let lo = 0, hi = 1;
	for (let i = 0; i < 80; i++) {
		const m = (lo + hi) / 2;
		(bez(P.slantEnd[1], P.brC1[1], P.brC2[1], P.brEnd[1], m) < y) ? lo = m : hi = m;
	}
	return bez(P.slantEnd[0], P.brC1[0], P.brC2[0], P.brEnd[0], (lo + hi) / 2);
}

console.log(`\nright edge probe:`);
for (const y of [6.5, 6.9, 7.99, 9.0, 10.0, 11.0, 11.89, 12.2, 12.4, 12.6]) {
	console.log(`  y=${y.toFixed(2)}  x=${rightX(y).toFixed(4)}`);
}

// --- 3. min horizontal room over the box's y-range --------------------------
let minX = Infinity, minAtY = 0;
for (let y = boxTop; y <= boxBot + 1e-9; y += 0.0005) {
	const x = rightX(y);
	if (x < minX) { minX = x; minAtY = y; }
}
console.log(`\nmin right-edge x over y in [${boxTop}, ${boxBot}] = ${minX.toFixed(4)} at y=${minAtY.toFixed(3)}`);

// --- 4. true perpendicular clearance ---------------------------------------
// Sample the whole right boundary (top-right cubic + slant + bottom-right cubic
// + bottom edge) and find the largest boxRight whose rect keeps >= CLEAR from it.
const boundary = [];
for (let i = 0; i <= 400; i++) { boundary.push(bezPt(P.topRight, P.trC1, P.trC2, P.trEnd, i / 400)); }
for (let i = 0; i <= 400; i++) {
	const f = i / 400;
	boundary.push([P.trEnd[0] + f * (P.slantEnd[0] - P.trEnd[0]), P.trEnd[1] + f * (P.slantEnd[1] - P.trEnd[1])]);
}
for (let i = 0; i <= 400; i++) { boundary.push(bezPt(P.slantEnd, P.brC1, P.brC2, P.brEnd, i / 400)); }
for (let i = 0; i <= 400; i++) { boundary.push([P.brEnd[0] - (i / 400) * (P.brEnd[0] - P.botLeft[0]), 12.80]); }
for (let i = 0; i <= 400; i++) { boundary.push([P.topLeft[0] + (i / 400) * (P.topRight[0] - P.topLeft[0]), 6.5]); }

// distance from a point to the rect's boundary-relevant edges is not what we
// want; we want: min distance from ANY point of the rect's outline to the flap
// outline (rect is fully inside the flap).
function minClearance(rx, ry, s) {
	const pts = [];
	const N = 300;
	for (let i = 0; i <= N; i++) {
		const f = i / N;
		pts.push([rx - s + f * s, ry]);          // top
		pts.push([rx - s + f * s, ry + s]);      // bottom
		pts.push([rx, ry + f * s]);              // right
		pts.push([rx - s, ry + f * s]);          // left
	}
	let m = Infinity;
	for (const p of pts) {
		for (const b of boundary) {
			const d = Math.hypot(p[0] - b[0], p[1] - b[1]);
			if (d < m) { m = d; }
		}
	}
	return m;
}

// binary search boxRight so that perpendicular clearance == CLEAR
let lo = minX - 2, hi = minX + 0.5;
for (let i = 0; i < 40; i++) {
	const mid = (lo + hi) / 2;
	(minClearance(mid, boxTop, side) >= CLEAR) ? lo = mid : hi = mid;
}
const boxRight = lo;
console.log(`\nlargest boxRight with >= ${CLEAR} px PERPENDICULAR clearance = ${boxRight.toFixed(4)}`);
console.log(`  (horizontal-only rule would give ${(minX - CLEAR).toFixed(4)})`);
console.log(`  achieved min clearance = ${minClearance(boxRight, boxTop, side).toFixed(4)}`);

const ox = boxRight - side;
console.log(`\n==> OPEN BOX: side ${side.toFixed(2)}  x ${ox.toFixed(3)}..${boxRight.toFixed(3)}  y ${boxTop.toFixed(3)}..${boxBot.toFixed(3)}`);
console.log(`    { ox: ${ox.toFixed(2)}, oy: ${boxTop.toFixed(2)}, k: ${(side / 10).toFixed(3)} }`);
