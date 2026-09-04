// targets.mjs — "which set am I building?", answered in one place.
//
// Every tool takes an optional slice id on the command line:
//
//   node tools/<tool>.mjs            -> the PILOT, exactly as before
//   node tools/<tool>.mjs A01        -> production slice A01
//
// A target carries its registry and its output directory; nothing else in the
// pipeline needs to know which of the two it is looking at.
//
// It answers the second question a slice gate asks as well — "what came BEFORE
// me?" — because an APPROVED slice stops being work in progress and joins the
// frozen, cross-asserted side of the toolchain exactly the way the pilot did.

import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(HERE, '..');

/**
 * THE APPROVED SLICES, in the order Sebastian ruled on them. The pilot is not in
 * the list: it is the ground every run stands on and is named separately wherever
 * it matters. A slice is appended here the moment its gate verdict comes back and
 * its outputs are committed, and from that moment every LATER slice must
 *
 *   · re-assert its icons, masters and sheet byte-identical against git HEAD
 *     (check-slice.mjs's frozen gate), and
 *   · score against its icons in one pool in the twin audit, carrying its declared
 *     families, collapses and look-alike pairs into the audit's lanes — a pair
 *     already ruled cannot start failing because a later slice ran.
 *
 * Each slice appends ITSELF here when its own verdict lands, and so on down the
 * line: one entry per gate verdict, in verdict order. The ORDER is the whole point
 * — it is what makes a slice's priors "the slices approved before me" rather than
 * "all of them".
 */
export const APPROVED = ['A01', 'A02'];

/**
 * The approved slices that come BEFORE `id`. An approved slice sees only what was
 * approved before it, which is why A01's own gate run is unchanged by any of this
 * (its priors are empty); a slice that is not in the list is the one being worked
 * on, so every approved slice is prior to it.
 */
export function priorSlices(id) {
	const i = APPROVED.indexOf(id);
	return i === -1 ? [...APPROVED] : APPROVED.slice(0, i);
}

/** Where a set's outputs live, whether it is the pilot or a slice. */
export const setDir = (id) => (id === 'pilot' ? join(ROOT, 'pilot') : join(ROOT, 'slices', id));

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
