// roster.mjs — the slice's roster of record.
//
// v2 does not invent its own worklist: §4 of the guide says the matcher layer
// carries over verbatim, so a slice's roster is the corresponding entry in the
// m11 production worklist. This reads it, nothing more.

import { readFileSync } from 'node:fs';

const WORKLIST = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/longtail-worklist.json';

export function roster(sliceId) {
	const w = JSON.parse(readFileSync(WORKLIST, 'utf8'));
	const s = w.slices.find(x => x.id === sliceId);
	if (!s) { throw new Error(`slice ${sliceId} is not in ${WORKLIST}`); }
	return {
		source: 'm11-icons/production/longtail-worklist.json',
		generated: w.generated,
		id: s.id, kind: s.kind, count: s.concepts.length,
		concepts: s.concepts,
		ids: s.concepts.map(c => c.id),
		byId: Object.fromEntries(s.concepts.map(c => [c.id, c]))
	};
}
