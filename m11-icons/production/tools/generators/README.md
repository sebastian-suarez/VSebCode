# Slice generators — rescued from the session scratchpad

The M11 icons were authored by 24 concurrent agents, each in its own throwaway scratchpad.
The SVGs are the product and they are in `../../svg/`; **these are the sources that produced
them** — the mark geometry, the hue solvers, the roster tables, the proof harnesses. F05's
review flagged that they existed only in scratch and would evaporate with the session, so
assembly v2 swept them here.

**Nothing in this directory is a production tool.** Nothing here was run during the sweep,
and none of it is on the packaging path. The shipped toolchain is `../*.mjs`. Most of these
scripts carry absolute paths into `m11-icons/production/` and would **overwrite the shipped
SVGs** if executed — read them, do not run them.

## What was found

All 18 full-coverage slices left generators behind, plus five of the six core batches and
the folder-geometry work. 222 files in 27 slots.

| slot | files | what it is |
| --- | --- | --- |
| `A01` … `A12` | 14, 6, 10, 4, 25, 9, 6, 5, 4, 12, 9, 10 | the twelve file slices |
| `F01` … `F06` | 6, 10, 8, 15, 8, 8 | the six folder slices |
| `core-batch1` | 1 | `build-svgs.mjs`, the 26 batch-1 icons |
| `core-batch2` | 3 | emitter + the dense proof grid + the mixed tree strip |
| `core-batch3` | 3 | emitter, hue audit, contact sheet |
| `core-batch5` | 9 | emitter, letter metrics, the 16 px review harness |
| `core-batch6` | 2 | emitter + contact sheet |
| `core-folders` | 5 | the 40 core folder emblems: `geom.mjs` (the 0–10 field primitives), `emblems.mjs` (the marks), `build.mjs` |
| `folder-geometry-R9a` | 14 | the R9a re-anchoring: closed 8.20 box, open 5.80 @ 0.25, the spill checks that proved both |
| `packaging` | 1 | the packaged-theme structural self-check |
| `shared` | 15 | review helpers with no single owner — screenshot, crop, zoom, bbox, drift, letterpath dumps |

### Lost

| slice | status |
| --- | --- |
| **core-batch4** | **LOST** — no emitter, sheet or roster survived. It is the only batch with nothing at all. |
| A04 | **thin** — `build-A04.mjs` + `qa.mjs` + its roster survived; the per-icon geometry passes did not. |
| A08, A09 | thin — build + roster + lib survived; the redraw passes did not. |

Everything else is complete enough to re-derive its slice.

## Reading them

Each slice follows roughly the same shape, under whatever names its agent picked:

- a **lib** (`*-lib.mjs`, `a05lib.mjs`, `F0*-geom.mjs`) — path helpers, the field-unit
  transform, winding-safe circle/bar primitives;
- a **roster** (`roster*.json`, `*-roster.mjs`, `files.txt`) — id → archetype, fill,
  colour source, one line of rationale per icon;
- one or more **emitters** (`build*.mjs`, `gen*.mjs`, `*-icons-*.mjs`, `*-part*.mjs`) —
  the actual mark geometry;
- a **solver** (`solve*.mjs`, `*-r7.mjs`, `hue*.mjs`, `*-tint.mjs`) — the R7 escape search;
- **proofs** (`*-proof.mjs`, `*-spill.mjs`, `check*.mjs`, `*-r8*.mjs`) — 16 px legibility,
  folder-emblem containment, in-slice R7/R8.

The `patch*.mjs` and `fix*.mjs` files in `A05` are its edit history, not a build order: each
one rewrites the file before it. Read `a05lib.mjs` → `roster.mjs` → `gen1..3.mjs` first.
