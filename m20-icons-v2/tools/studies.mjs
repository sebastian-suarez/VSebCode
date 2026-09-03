#!/usr/bin/env node
// studies.mjs — render the measured studies a slice's tranches register.
//
//   node tools/studies.mjs A01
//
// The pilot set the precedent with pilot/proofs/docker-deck-candidates.png: where a
// reduction is a judgement call, the rejected candidates get rendered next to the
// shipped one at a true 16 px so the verdict can be checked instead of believed. A
// tranche declares its studies as
//
//   STUDIES = [{ id, width, height, html(place) }]
//
// and is handed `place(parts, env)` — the same fit the build uses, so a study
// cannot drift from what ships.

import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { resolveTarget } from './targets.mjs';
import { place, pathTag } from './spec-engine.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const target = await resolveTarget();
const studies = target.registry.STUDIES || [];
if (!studies.length) { console.log('no studies registered'); process.exit(0); }

const OUT = join(target.dir, 'proofs');
mkdirSync(OUT, { recursive: true });

/** What a study is given: fitted parts, already an SVG body. */
const placeBody = (parts, env) => place(parts, env).map(p => pathTag(p.d, p.fill)).join('');

for (const s of studies) {
	const html = `<!doctype html><meta charset="utf-8">${s.html(placeBody)}`;
	const tmp = join(tmpdir(), `m20.study.${target.id}.${s.id}.html`);
	writeFileSync(tmp, html);
	const png = join(OUT, `${s.id}.png`);
	execFileSync('node', [join(HERE, 'shot.mjs'), tmp, png,
		String(s.width || 1080), String(s.height || 700), String(s.scale || 1)],
	{ stdio: ['ignore', 'ignore', 'ignore'] });
	console.log(`wrote proofs/${s.id}.png`);
}
