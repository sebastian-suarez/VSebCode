// bF-geom-open2.mjs — open-flap box, corrected.
// Vertical placement is fixed by the flap's horizontal top (6.5) and bottom
// (12.8) edges + 0.4 clearance each  ->  side = 5.50, y 6.90..12.40.
// The only free parameter is boxRight, set by clearance from the flap's RIGHT
// boundary chain (top-right cubic -> slant -> bottom-right cubic).

const CLEAR = 0.4;
const P = {
	topRight: [14.04, 6.5], trC1: [14.82, 6.5], trC2: [15.39, 7.23], trEnd: [15.21, 7.99],
	slantEnd: [14.23, 11.89],
	brC1: [14.10, 12.43], brC2: [13.62, 12.80], brEnd: [13.06, 12.80]
};
const bez = (a, b, c, d, t) => { const u = 1 - t; return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d; };
const bezPt = (p0, p1, p2, p3, t) => [bez(p0[0], p1[0], p2[0], p3[0], t), bez(p0[1], p1[1], p2[1], p3[1], t)];

// dense samples of the right boundary chain only
const chain = [];
const N = 4000;
for (let i = 0; i <= N; i++) { chain.push(bezPt(P.topRight, P.trC1, P.trC2, P.trEnd, i / N)); }
for (let i = 0; i <= N; i++) { const f = i / N; chain.push([P.trEnd[0] + f * (P.slantEnd[0] - P.trEnd[0]), P.trEnd[1] + f * (P.slantEnd[1] - P.trEnd[1])]); }
for (let i = 0; i <= N; i++) { chain.push(bezPt(P.slantEnd, P.brC1, P.brC2, P.brEnd, i / N)); }

const boxTop = 6.5 + CLEAR, boxBot = 12.8 - CLEAR, side = boxBot - boxTop;

// min distance from the box's right edge segment (x=rx, y in [boxTop,boxBot]) to the chain
function rightClearance(rx) {
	let m = Infinity, at = null;
	for (const b of chain) {
		// distance from point b to the vertical segment
		const cy = Math.min(Math.max(b[1], boxTop), boxBot);
		const d = Math.hypot(b[0] - rx, b[1] - cy);
		if (d < m) { m = d; at = b; }
	}
	return { d: m, at };
}

let lo = 12.0, hi = 14.2;
for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; (rightClearance(mid).d >= CLEAR) ? lo = mid : hi = mid; }
const perpRight = lo;
const r = rightClearance(perpRight);

// horizontal-only rule for comparison
function rightX(y) {
	let best = null, bd = Infinity;
	for (const b of chain) { const d = Math.abs(b[1] - y); if (d < bd) { bd = d; best = b; } }
	return best[0];
}
let minX = Infinity, minAtY = 0;
for (let y = boxTop; y <= boxBot + 1e-9; y += 0.001) { const x = rightX(y); if (x < minX) { minX = x; minAtY = y; } }

console.log(`side              : ${side.toFixed(3)}  (y ${boxTop.toFixed(2)} .. ${boxBot.toFixed(2)})`);
console.log(`horizontal rule   : min right-x ${minX.toFixed(4)} at y ${minAtY.toFixed(3)}  -> boxRight ${(minX - CLEAR).toFixed(4)}`);
console.log(`perpendicular rule: boxRight ${perpRight.toFixed(4)}  (nearest chain pt ${r.at[0].toFixed(3)},${r.at[1].toFixed(3)}, d=${r.d.toFixed(4)})`);
console.log('');
for (const rule of [['perpendicular', perpRight], ['horizontal', minX - CLEAR]]) {
	const rx = rule[1], ox = rx - side;
	console.log(`${rule[0].padEnd(14)} -> { ox: ${ox.toFixed(2)}, oy: ${boxTop.toFixed(2)}, k: ${(side / 10).toFixed(3)} }   box x ${ox.toFixed(3)}..${rx.toFixed(3)}  y ${boxTop.toFixed(2)}..${boxBot.toFixed(2)}`);
}
// what clearance did the OLD open box have?
const oldRight = 8.3 + 5.2, oldTop = 7.0, oldBot = 7.0 + 5.2;
console.log(`\nOLD open box: x 8.300..${oldRight.toFixed(3)} y ${oldTop}..${oldBot}  side 5.20`);
console.log(`  top clearance ${(oldTop - 6.5).toFixed(2)}, bottom clearance ${(12.8 - oldBot).toFixed(2)}`);
let m = Infinity;
for (const b of chain) { const cy = Math.min(Math.max(b[1], oldTop), oldBot); m = Math.min(m, Math.hypot(b[0] - oldRight, b[1] - cy)); }
console.log(`  right perpendicular clearance ${m.toFixed(3)}`);
