// yarn: one spiral cut through the ball, emitted as Hermite->cubic segments
const CX = 8, CY = 8, R0 = 5.2, PITCH = 2.5, TURNS = 1.4, W = 1.1;
const b = PITCH / (2 * Math.PI);
const pt = (t, off) => {
  const r = R0 - b * t - off;
  return [CX + r * Math.cos(t), CY + r * Math.sin(t)];
};
const der = (t, off) => {              // d/dt of (r cos t, r sin t) with r = R0 - b t - off
  const r = R0 - b * t - off;
  return [-b * Math.cos(t) - r * Math.sin(t), -b * Math.sin(t) + r * Math.cos(t)];
};
const n = (v) => { let s = v.toFixed(2).replace(/0+$/, '').replace(/\.$/, ''); if (s === '-0') s = '0'; return s.replace(/^(-?)0\./, '$1.'); };
const SEG = 9, TMAX = TURNS * 2 * Math.PI, dt = TMAX / SEG;
function arm(off, reverse) {
  const out = [];
  for (let i = 0; i < SEG; i++) {
    const t0 = reverse ? TMAX - i * dt : i * dt;
    const t1 = reverse ? TMAX - (i + 1) * dt : (i + 1) * dt;
    const h = (t1 - t0) / 3;
    const [x0, y0] = pt(t0, off), [x1, y1] = pt(t1, off);
    const [dx0, dy0] = der(t0, off), [dx1, dy1] = der(t1, off);
    out.push(`C${n(x0 + dx0 * h)} ${n(y0 + dy0 * h)} ${n(x1 - dx1 * h)} ${n(y1 - dy1 * h)} ${n(x1)} ${n(y1)}`);
  }
  return out.join('');
}
const [sx, sy] = pt(0, 0);
const [ex, ey] = pt(TMAX, W);
const d = `M${n(sx)} ${n(sy)}${arm(0, false)}L${n(pt(TMAX, W)[0])} ${n(pt(TMAX, W)[1])}${arm(W, true)}Z`;
console.log(d.length, 'chars');
console.log(d);
