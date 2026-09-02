// F01-lib.mjs — geometry helpers + SVG path affine transformer for the F01 folder slice.
//
// Emblems are authored in a 0..10 field and placed into the R9a boxes by one uniform
// scale + translate:
//   closed: 8.20 box at x 5.30-13.50, y 4.60-12.80   -> s .82, o (5.30, 4.60)
//   open:   5.80 box at x 7.26-13.06, y 6.75-12.55   -> s .58, o (7.26, 6.75)
// Verified against the existing production pair svg/folder/src.svg + src-open.svg.

export const BOX = {
	closed: { s: 0.82, ox: 5.30, oy: 4.60 },
	open: { s: 0.58, ox: 7.26, oy: 6.75 }
};

// ---- number formatting (matches the existing folder emblems: 2dp, no leading zero) ----
export function num(v, p = 2) {
	let s = v.toFixed(p);
	if (s.includes('.')) { s = s.replace(/0+$/, '').replace(/\.$/, ''); }
	if (s === '-0') { s = '0'; }
	return s.replace(/^(-?)0\./, '$1.');
}

// ---- path parsing --------------------------------------------------------------
const CMD = /[MmLlHhVvCcSsQqTtAaZz]/;
const NUM = /[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g;
const ARITY = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7, Z: 0 };

/** @returns {{cmd:string, args:number[]}[]} */
export function parsePath(d) {
	const out = [];
	let i = 0;
	let prev = null;
	while (i < d.length) {
		const ch = d[i];
		if (/[\s,]/.test(ch)) { i++; continue; }
		let cmd;
		if (CMD.test(ch)) { cmd = ch; i++; }
		else if (prev) { cmd = prev === 'M' ? 'L' : prev === 'm' ? 'l' : prev; }
		else { throw new Error(`path starts with "${ch}"`); }
		const n = ARITY[cmd.toUpperCase()];
		if (n === 0) { out.push({ cmd, args: [] }); prev = cmd; continue; }
		const args = [];
		while (args.length < n) {
			NUM.lastIndex = i;
			const m = NUM.exec(d);
			if (!m || m.index > i + 2) { throw new Error(`expected ${n} args for ${cmd} at ${i} in ${d.slice(i, i + 24)}`); }
			// skip separators between i and m.index
			if (/[^\s,]/.test(d.slice(i, m.index))) { throw new Error(`junk before number at ${i}`); }
			args.push(parseFloat(m[0]));
			i = m.index + m[0].length;
		}
		out.push({ cmd, args });
		prev = cmd;
	}
	return out;
}

/** Uniform scale + translate. Relative commands keep their relative semantics (scale only). */
export function transformPath(d, s, ox, oy, precision = 2) {
	const segs = parsePath(d);
	const X = v => ox + v * s;
	const Y = v => oy + v * s;
	const R = v => v * s;
	const parts = [];
	for (const { cmd, args } of segs) {
		const abs = cmd === cmd.toUpperCase();
		let a;
		switch (cmd.toUpperCase()) {
			case 'M': case 'L': case 'T':
				a = abs ? [X(args[0]), Y(args[1])] : [R(args[0]), R(args[1])]; break;
			case 'H': a = [abs ? X(args[0]) : R(args[0])]; break;
			case 'V': a = [abs ? Y(args[0]) : R(args[0])]; break;
			case 'C':
				a = abs ? [X(args[0]), Y(args[1]), X(args[2]), Y(args[3]), X(args[4]), Y(args[5])]
					: args.map(R); break;
			case 'S': case 'Q':
				a = abs ? [X(args[0]), Y(args[1]), X(args[2]), Y(args[3])] : args.map(R); break;
			case 'A':
				a = [R(args[0]), R(args[1]), args[2], args[3], args[4],
					abs ? X(args[5]) : R(args[5]), abs ? Y(args[6]) : R(args[6])]; break;
			case 'Z': a = []; break;
		}
		parts.push(cmd + a.map(v => num(v, precision)).join(' '));
	}
	return parts.join('');
}

// ---- flattening (bbox + spill assertions) --------------------------------------
function arcPoints(x0, y0, rx, ry, rot, laf, sf, x1, y1, n = 24) {
	if (rx === 0 || ry === 0) { return [[x1, y1]]; }
	const phi = rot * Math.PI / 180, cos = Math.cos(phi), sin = Math.sin(phi);
	const dx = (x0 - x1) / 2, dy = (y0 - y1) / 2;
	const x1p = cos * dx + sin * dy, y1p = -sin * dx + cos * dy;
	rx = Math.abs(rx); ry = Math.abs(ry);
	const lam = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
	if (lam > 1) { const k = Math.sqrt(lam); rx *= k; ry *= k; }
	const sign = laf === sf ? -1 : 1;
	const numr = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p;
	const den = rx * rx * y1p * y1p + ry * ry * x1p * x1p;
	const co = sign * Math.sqrt(Math.max(0, numr / den));
	const cxp = co * rx * y1p / ry, cyp = -co * ry * x1p / rx;
	const cx = cos * cxp - sin * cyp + (x0 + x1) / 2;
	const cy = sin * cxp + cos * cyp + (y0 + y1) / 2;
	const ang = (ux, uy, vx, vy) => {
		const d = (ux * vx + uy * vy) / (Math.hypot(ux, uy) * Math.hypot(vx, vy));
		const a = Math.acos(Math.min(1, Math.max(-1, d)));
		return (ux * vy - uy * vx < 0 ? -a : a);
	};
	const th0 = ang(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry);
	let dth = ang((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry);
	if (!sf && dth > 0) { dth -= 2 * Math.PI; } else if (sf && dth < 0) { dth += 2 * Math.PI; }
	const pts = [];
	for (let i = 1; i <= n; i++) {
		const t = th0 + dth * i / n;
		pts.push([cos * rx * Math.cos(t) - sin * ry * Math.sin(t) + cx,
			sin * rx * Math.cos(t) + cos * ry * Math.sin(t) + cy]);
	}
	return pts;
}

/** Flatten to polylines (one per subpath). Absolute commands only + relative support. */
export function flatten(d, n = 24) {
	const segs = parsePath(d);
	const subs = []; let cur = null;
	let x = 0, y = 0, sx = 0, sy = 0, px = 0, py = 0, prevC = '';
	const push = (nx, ny) => { cur.push([nx, ny]); x = nx; y = ny; };
	for (const { cmd, args } of segs) {
		const u = cmd.toUpperCase(), rel = cmd !== u;
		const ax = v => (rel ? x + v : v), ay = v => (rel ? y + v : v);
		if (u === 'M') {
			cur = []; subs.push(cur);
			push(ax(args[0]), ay(args[1])); sx = x; sy = y; prevC = 'M';
		} else if (u === 'L') { push(ax(args[0]), ay(args[1])); prevC = 'L'; }
		else if (u === 'H') { push(rel ? x + args[0] : args[0], y); prevC = 'L'; }
		else if (u === 'V') { push(x, rel ? y + args[0] : args[0]); prevC = 'L'; }
		else if (u === 'C' || u === 'S' || u === 'Q' || u === 'T') {
			let c1x, c1y, c2x, c2y, ex, ey;
			if (u === 'C') { [c1x, c1y, c2x, c2y, ex, ey] = [ax(args[0]), ay(args[1]), ax(args[2]), ay(args[3]), ax(args[4]), ay(args[5])]; }
			else if (u === 'S') {
				c1x = /[CS]/.test(prevC) ? 2 * x - px : x; c1y = /[CS]/.test(prevC) ? 2 * y - py : y;
				[c2x, c2y, ex, ey] = [ax(args[0]), ay(args[1]), ax(args[2]), ay(args[3])];
			} else if (u === 'Q') {
				const qx = ax(args[0]), qy = ay(args[1]); ex = ax(args[2]); ey = ay(args[3]);
				c1x = x + 2 / 3 * (qx - x); c1y = y + 2 / 3 * (qy - y);
				c2x = ex + 2 / 3 * (qx - ex); c2y = ey + 2 / 3 * (qy - ey);
				px = qx; py = qy;
			} else {
				const qx = /[QT]/.test(prevC) ? 2 * x - px : x, qy = /[QT]/.test(prevC) ? 2 * y - py : y;
				ex = ax(args[0]); ey = ay(args[1]);
				c1x = x + 2 / 3 * (qx - x); c1y = y + 2 / 3 * (qy - y);
				c2x = ex + 2 / 3 * (qx - ex); c2y = ey + 2 / 3 * (qy - ey);
				px = qx; py = qy;
			}
			const x0 = x, y0 = y;
			for (let i = 1; i <= n; i++) {
				const t = i / n, m = 1 - t;
				cur.push([m * m * m * x0 + 3 * m * m * t * c1x + 3 * m * t * t * c2x + t * t * t * ex,
					m * m * m * y0 + 3 * m * m * t * c1y + 3 * m * t * t * c2y + t * t * t * ey]);
			}
			if (u === 'C' || u === 'S') { px = c2x; py = c2y; }
			x = ex; y = ey; prevC = u;
		} else if (u === 'A') {
			const ex = rel ? x + args[5] : args[5], ey = rel ? y + args[6] : args[6];
			for (const p of arcPoints(x, y, args[0], args[1], args[2], args[3], args[4], ex, ey, n)) { cur.push(p); }
			x = ex; y = ey; prevC = 'A';
		} else if (u === 'Z') { if (cur && cur.length) { cur.push([sx, sy]); } x = sx; y = sy; prevC = 'Z'; }
	}
	return subs;
}

export function bbox(d) {
	let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
	for (const sub of flatten(d, 48)) {
		for (const [x, y] of sub) {
			if (x < x1) { x1 = x; } if (y < y1) { y1 = y; }
			if (x > x2) { x2 = x; } if (y > y2) { y2 = y; }
		}
	}
	return { x1, y1, x2, y2, w: x2 - x1, h: y2 - y1 };
}

// ---- primitives, authored in the 0..10 field -----------------------------------
// Winding matters: everything uses the default nonzero rule, so a solid subpath is
// clockwise (sweep 1 / positive shoelace) and a knock-out is counter-clockwise.

const f = v => num(v, 4);

/** Circle. cw=true -> solid, cw=false -> knock-out. */
export function circ(cx, cy, r, cw = true) {
	const s = cw ? 1 : 0;
	return `M${f(cx - r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 ${s} ${f(cx + r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 ${s} ${f(cx - r)} ${f(cy)}Z`;
}

/** Axis-aligned ellipse. */
export function ell(cx, cy, rx, ry, cw = true) {
	const s = cw ? 1 : 0;
	return `M${f(cx - rx)} ${f(cy)}A${f(rx)} ${f(ry)} 0 1 ${s} ${f(cx + rx)} ${f(cy)}A${f(rx)} ${f(ry)} 0 1 ${s} ${f(cx - rx)} ${f(cy)}Z`;
}

/** Rounded rect (rad 0 = plain rect). */
export function rrect(x, y, w, h, rad = 0, cw = true) {
	const r = Math.min(rad, w / 2, h / 2);
	if (r <= 0) {
		return cw
			? `M${f(x)} ${f(y)}L${f(x + w)} ${f(y)}L${f(x + w)} ${f(y + h)}L${f(x)} ${f(y + h)}Z`
			: `M${f(x)} ${f(y)}L${f(x)} ${f(y + h)}L${f(x + w)} ${f(y + h)}L${f(x + w)} ${f(y)}Z`;
	}
	const a = (rx, ry) => `A${f(r)} ${f(r)} 0 0 ${cw ? 1 : 0} ${f(rx)} ${f(ry)}`;
	if (cw) {
		return `M${f(x + r)} ${f(y)}L${f(x + w - r)} ${f(y)}${a(x + w, y + r)}L${f(x + w)} ${f(y + h - r)}`
			+ `${a(x + w - r, y + h)}L${f(x + r)} ${f(y + h)}${a(x, y + h - r)}L${f(x)} ${f(y + r)}${a(x + r, y)}Z`;
	}
	return `M${f(x + r)} ${f(y)}${a(x, y + r)}L${f(x)} ${f(y + h - r)}${a(x + r, y + h)}L${f(x + w - r)} ${f(y + h)}`
		+ `${a(x + w, y + h - r)}L${f(x + w)} ${f(y + r)}${a(x + w - r, y)}Z`;
}

const shoelace = pts => pts.reduce((s, p, i) => {
	const q = pts[(i + 1) % pts.length];
	return s + (p[0] * q[1] - q[0] * p[1]);
}, 0);

/** Polygon from [x,y] pairs; orientation is forced (cw=true -> solid). */
export function poly(pts, cw = true) {
	const p = shoelace(pts) > 0 === cw ? pts : [...pts].reverse();
	return 'M' + p.map(q => `${f(q[0])} ${f(q[1])}`).join('L') + 'Z';
}

/** Bar of half-width hw along the segment a->b (a solid stroke, square caps). */
export function bar(ax, ay, bx, by, hw, cw = true) {
	const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy);
	const nx = -dy / len * hw, ny = dx / len * hw;
	return poly([[ax + nx, ay + ny], [bx + nx, by + ny], [bx - nx, by - ny], [ax - nx, ay - ny]], cw);
}
