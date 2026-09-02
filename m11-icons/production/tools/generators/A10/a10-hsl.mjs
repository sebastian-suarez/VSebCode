// A10 scratch: HSL + R7 checker for the slice roster against core set-manifest.json.
import { readFileSync } from 'node:fs';

export function hsl(hex) {
	const n = parseInt(hex.slice(1), 16);
	const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
	const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
	let h = 0;
	if (d) {
		if (max === r) { h = ((g - b) / d) % 6; }
		else if (max === g) { h = (b - r) / d + 2; }
		else { h = (r - g) / d + 4; }
		h *= 60; if (h < 0) { h += 360; }
	}
	const l = (max + min) / 2;
	const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
	return { h, s: s * 100, l: l * 100 };
}

export function twin(a, b) {
	if (a.archetype !== b.archetype) { return false; }
	const A = hsl(a.hex), B = hsl(b.hex);
	if (A.s < 25 || B.s < 25) { return false; }          // neutral lane exempt (R7)
	let dh = Math.abs(A.h - B.h); if (dh > 180) { dh = 360 - dh; }
	return dh < 12 && Math.abs(A.l - B.l) < 12 && Math.abs(A.s - B.s) < 25;
}

const core = JSON.parse(readFileSync('/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/set-manifest.json', 'utf8'))
	.icons.filter(i => i.kind === 'file')
	.map(i => ({ id: i.id, archetype: i.archetype, hex: i.dominant, core: true }));

export function report(roster) {
	const all = [...core, ...roster];
	const hits = [];
	for (let i = 0; i < roster.length; i++) {
		for (const other of all) {
			if (other === roster[i]) { continue; }
			if (twin(roster[i], other)) {
				hits.push([roster[i].id, other.id, other.core ? 'CORE' : 'SLICE', roster[i].archetype]);
			}
		}
	}
	return hits;
}

if (process.argv[2] === '--hex') {
	for (const h of process.argv.slice(3)) {
		const v = hsl(h);
		console.log(h, `h=${v.h.toFixed(1)} s=${v.s.toFixed(1)} l=${v.l.toFixed(1)}`);
	}
}
if (process.argv[2] === '--near') {
	// --near ARCHETYPE #HEX  -> which core icons it twins with
	const probe = { id: 'probe', archetype: process.argv[3], hex: process.argv[4] };
	for (const c of core) { if (twin(probe, c)) { console.log('twin with core', c.id, c.hex, c.archetype); } }
	const v = hsl(probe.hex);
	console.log(`${probe.hex} h=${v.h.toFixed(1)} s=${v.s.toFixed(1)} l=${v.l.toFixed(1)}`);
}
