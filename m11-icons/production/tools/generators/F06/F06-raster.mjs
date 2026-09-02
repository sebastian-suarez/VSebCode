// F06-raster.mjs — a dependency-free SVG path rasteriser (nonzero, scanline).
// Enough of the grammar for these icons: M m L l H h V v C c S s Q q T t A a Z z,
// implicit command repetition, and endpoint->centre arc conversion with the
// spec's radius correction (the R11 "radii silently scaled up" case).

const TOK = /-?\d*\.?\d+(?:e[-+]?\d+)?|[a-zA-Z]/gi;

export function flatten(d, tol = 0.02) {
	const t = d.match(TOK) || [];
	let i = 0, cmd = '', x = 0, y = 0, sx = 0, sy = 0, px = 0, py = 0, qx = 0, qy = 0;
	const polys = []; let cur = null;
	const num = () => parseFloat(t[i++]);
	const open = () => { cur = [[x, y]]; polys.push(cur); };
	const push = (X, Y) => { if (!cur) { open(); } cur.push([X, Y]); };

	const cubic = (x1, y1, x2, y2, X, Y) => {
		const n = Math.max(4, Math.ceil(
			(Math.hypot(x1 - x, y1 - y) + Math.hypot(x2 - x1, y2 - y1) + Math.hypot(X - x2, Y - y2)) / tol / 3));
		for (let k = 1; k <= n; k++) {
			const s = k / n, u = 1 - s;
			push(u * u * u * x + 3 * u * u * s * x1 + 3 * u * s * s * x2 + s * s * s * X,
				u * u * u * y + 3 * u * u * s * y1 + 3 * u * s * s * y2 + s * s * s * Y);
		}
	};
	const quad = (x1, y1, X, Y) => {
		const n = Math.max(4, Math.ceil((Math.hypot(x1 - x, y1 - y) + Math.hypot(X - x1, Y - y1)) / tol / 2));
		for (let k = 1; k <= n; k++) {
			const s = k / n, u = 1 - s;
			push(u * u * x + 2 * u * s * x1 + s * s * X, u * u * y + 2 * u * s * y1 + s * s * Y);
		}
	};
	const arc = (rx, ry, rot, laf, sf, X, Y) => {
		if (rx === 0 || ry === 0) { push(X, Y); return; }
		rx = Math.abs(rx); ry = Math.abs(ry);
		const phi = rot * Math.PI / 180, cp = Math.cos(phi), sp = Math.sin(phi);
		const dx2 = (x - X) / 2, dy2 = (y - Y) / 2;
		const x1 = cp * dx2 + sp * dy2, y1 = -sp * dx2 + cp * dy2;
		const L = (x1 * x1) / (rx * rx) + (y1 * y1) / (ry * ry);
		if (L > 1) { const s = Math.sqrt(L); rx *= s; ry *= s; }
		let num0 = rx * rx * ry * ry - rx * rx * y1 * y1 - ry * ry * x1 * x1;
		const den = rx * rx * y1 * y1 + ry * ry * x1 * x1;
		if (num0 < 0) { num0 = 0; }
		let co = Math.sqrt(num0 / den);
		if (laf === sf) { co = -co; }
		const cx1 = co * rx * y1 / ry, cy1 = -co * ry * x1 / rx;
		const cx = cp * cx1 - sp * cy1 + (x + X) / 2, cy = sp * cx1 + cp * cy1 + (y + Y) / 2;
		const ang = (ux, uy, vx, vy) => {
			const dot = (ux * vx + uy * vy) / (Math.hypot(ux, uy) * Math.hypot(vx, vy));
			const a = Math.acos(Math.min(1, Math.max(-1, dot)));
			return (ux * vy - uy * vx < 0) ? -a : a;
		};
		const th1 = ang(1, 0, (x1 - cx1) / rx, (y1 - cy1) / ry);
		let dth = ang((x1 - cx1) / rx, (y1 - cy1) / ry, (-x1 - cx1) / rx, (-y1 - cy1) / ry);
		if (!sf && dth > 0) { dth -= 2 * Math.PI; }
		if (sf && dth < 0) { dth += 2 * Math.PI; }
		const n = Math.max(6, Math.ceil(Math.abs(dth) / Math.acos(Math.max(-1, 1 - tol / Math.max(rx, ry)))));
		for (let k = 1; k <= n; k++) {
			const th = th1 + dth * k / n, ct = Math.cos(th), st = Math.sin(th);
			push(cp * rx * ct - sp * ry * st + cx, sp * rx * ct + cp * ry * st + cy);
		}
	};

	while (i < t.length) {
		if (/[a-z]/i.test(t[i])) { cmd = t[i++]; }
		const rel = cmd === cmd.toLowerCase();
		const C = cmd.toUpperCase();
		if (C === 'M') {
			const X = num() + (rel ? x : 0), Y = num() + (rel ? y : 0);
			x = X; y = Y; sx = x; sy = y; open(); px = x; py = y; qx = x; qy = y;
			cmd = rel ? 'l' : 'L';
		} else if (C === 'L') {
			const X = num() + (rel ? x : 0), Y = num() + (rel ? y : 0);
			x = X; y = Y; push(x, y); px = x; py = y; qx = x; qy = y;
		} else if (C === 'H') {
			const X = num() + (rel ? x : 0); x = X; push(x, y); px = x; py = y; qx = x; qy = y;
		} else if (C === 'V') {
			const Y = num() + (rel ? y : 0); y = Y; push(x, y); px = x; py = y; qx = x; qy = y;
		} else if (C === 'C' || C === 'S') {
			let x1, y1;
			if (C === 'S') { x1 = 2 * x - px; y1 = 2 * y - py; } else { x1 = num() + (rel ? x : 0); y1 = num() + (rel ? y : 0); }
			const x2 = num() + (rel ? x : 0), y2 = num() + (rel ? y : 0);
			const X = num() + (rel ? x : 0), Y = num() + (rel ? y : 0);
			cubic(x1, y1, x2, y2, X, Y); px = x2; py = y2; x = X; y = Y; qx = x; qy = y;
		} else if (C === 'Q' || C === 'T') {
			let x1, y1;
			if (C === 'T') { x1 = 2 * x - qx; y1 = 2 * y - qy; } else { x1 = num() + (rel ? x : 0); y1 = num() + (rel ? y : 0); }
			const X = num() + (rel ? x : 0), Y = num() + (rel ? y : 0);
			quad(x1, y1, X, Y); qx = x1; qy = y1; x = X; y = Y; px = x; py = y;
		} else if (C === 'A') {
			const rx = num(), ry = num(), rot = num(), laf = num(), sf = num();
			const X = num() + (rel ? x : 0), Y = num() + (rel ? y : 0);
			arc(rx, ry, rot, laf, sf, X, Y); x = X; y = Y; px = x; py = y; qx = x; qy = y;
		} else if (C === 'Z') {
			// subpaths are implicitly closed by edges(); just rewind the pen
			x = sx; y = sy; cur = null; px = x; py = y; qx = x; qy = y;
		} else { i++; }
	}
	return polys.filter(p => p.length > 2);
}

// edges of every subpath, implicitly closed
function edges(polys) {
	const e = [];
	for (const p of polys) {
		for (let k = 0; k < p.length; k++) {
			const a = p[k], b = p[(k + 1) % p.length];
			if (a[1] !== b[1]) { e.push([a[0], a[1], b[0], b[1]]); }
		}
	}
	return e;
}

/**
 * Nonzero-fill sample grid.
 * @param {string[]} ds path data strings, unioned (each rasterised with nonzero, then OR'd)
 * @param {number[]} xs sample x's  @param {number[]} ys sample y's
 * @returns {Uint8Array} ys.length * xs.length, 1 = inside
 */
export function mask(ds, xs, ys, rule = 'nonzero') {
	const out = new Uint8Array(xs.length * ys.length);
	for (const d of ds) {
		const E = edges(flatten(d));
		for (let r = 0; r < ys.length; r++) {
			const y = ys[r];
			const cross = [];
			for (const [x1, y1, x2, y2] of E) {
				if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) {
					cross.push([x1 + (y - y1) / (y2 - y1) * (x2 - x1), y2 > y1 ? 1 : -1]);
				}
			}
			if (!cross.length) { continue; }
			cross.sort((a, b) => a[0] - b[0]);
			let w = 0, ci = 0;
			const base = r * xs.length;
			for (let c = 0; c < xs.length; c++) {
				while (ci < cross.length && cross[ci][0] <= xs[c]) { w += cross[ci++][1]; }
				const inside = rule === 'evenodd' ? (Math.abs(w) % 2) === 1 : w !== 0;
				if (inside) { out[base + c] = 1; }
			}
		}
	}
	return out;
}
