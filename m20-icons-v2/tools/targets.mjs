// targets.mjs — "which set am I building?", answered in one place.
//
// Every tool takes an optional slice id on the command line:
//
//   node tools/<tool>.mjs            -> the PILOT, exactly as before
//   node tools/<tool>.mjs A01        -> production slice A01
//
// A target carries its registry and its output directory; nothing else in the
// pipeline needs to know which of the two it is looking at.

import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(HERE, '..');

/** The slice id in an argv, if there is one: a bare `A01` / `F03`-shaped token. */
export function sliceArg(argv = process.argv.slice(2)) {
	const flagged = argv.map(a => /^--slice=(.+)$/.exec(a)).find(Boolean);
	if (flagged) { return flagged[1]; }
	return argv.find(a => /^[AF]\d{2}$/.test(a)) || null;
}

export async function resolveTarget(id = sliceArg()) {
	if (!id) {
		const pilot = await import('./sources.mjs');
		return {
			id: 'pilot', kind: 'pilot', label: 'M20 icons v2 — pilot',
			dir: join(ROOT, 'pilot'), registry: pilot.REGISTRY, mod: pilot
		};
	}
	const file = join(HERE, 'slices', `${id}.mjs`);
	if (!existsSync(file)) { throw new Error(`no registry for slice ${id} (expected tools/slices/${id}.mjs)`); }
	const mod = await import(`./slices/${id}.mjs`);
	return {
		id, kind: 'slice', label: mod.LABEL || id,
		dir: join(ROOT, 'slices', id), registry: mod.REGISTRY, mod
	};
}
