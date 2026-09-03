# VSebCode icons v2 — style guide

**Workstream M20** (opened 2026-09-02, Sebastian's directive). NON-BLOCKING: the shipped
M11 set stays the product default for testing; v2 replaces it in one swap when — and only
when — it is finished. Nothing here gates M12–M19 or M4.

**Style ruling = D22 — RULED (Sebastian 2026-09-03): R1 "True color"**, plus the
prettier rider (16 px-hostile official marks ship as readable reductions). The
production recipe card is §5 — that plus L1–L10 is the law for all v2 work. History:
round 1 (freehand A/B/C/D) REJECTED 2026-09-02 — "not even close to the real ones" —
which hardened L2 (geometry derives from official artwork, freehand banned); round 2
offered four treatments over faithful geometry and R1 won.

Working dir: `m20-icons-v2/` (umbrella). Samples for the style choice live in
`m20-icons-v2/samples/` (untracked until D22, M11-workshop precedent). v1 references:
shipped set `vscode/extensions/theme-vsebcode-icons/`, workshop `m11-icons/` (its
inventory, associations, and tools are REUSED — see §4).

---

## 1. Why v2 — autopsy of the v1 set

Sebastian's verdict (2026-09-02): the icons are not consistent — they look like different
styles in one set; letter icons follow no shared alignment/size/weight; brands with real
logos got generic drawings; folder emblems are too small to tell apart.

The evidence agrees, and the root cause is structural, not sloppy execution. The v1 spec
**legalized variety at the framework level**, so every icon can obey the spec while the
set still reads as patchwork:

- **Three archetypes mixed freely.** BADGE (colored box + letters), SILHOUETTE (free
  shape), GLYPH (bare drawing) sit shoulder to shoulder in one explorer listing. A box, a
  whale, a pair of braces and bare "ENV" letters are four different design languages.
- **Letters were per-icon judgment calls.** 1, 2 or 3 characters; uppercase, lowercase
  wordmarks ("npm") and mixed forms; boxed ("TS"), outline-boxed ("M↓") and bare ("ENV");
  "per-icon optical sizing" was the actual law (v1 spec §3 forbade uniform boxes). Result:
  no two letter icons share font size, alignment or container — exactly the complaint.
- **Brand fidelity was optional.** `editorconfig.svg` shipped as generic settings-sliders
  in a muted sage `#6F8F82` — EditorConfig has a well-known official logo (the rodent
  mascot on its site and extension). Any icon that invents a metaphor for a brand that
  owns a mark reads as "wrong" to anyone who knows the brand.
- **Palette drifted between two regimes.** Loud official hexes (TS `#3178C6`, npm red)
  next to invented muted tints (sage editorconfig, plum-era yaml). Two saturation worlds
  in one tree.
- **Folder emblems were micro-scenes.** Corner emblems at 6.5→8.2 px drawing telescopes,
  TVs, parrot heads. At the tree's real 16 px render that is undifferentiated mud; the
  base folder also stayed one sand color for nearly all concepts, so rows differ only by
  those unreadable few pixels. (`src.svg`: dark gray `<>` on sand — small AND
  low-contrast.)

What v1 got RIGHT — kept for v2: the technical format rules (flat SVG, viewBox 16, no
`<text>`, letter-paths, ≤2 KB), the validator/contact/raster tooling, the twin-audit
idea (R7/R8), the 16 px proof duty, and the merged inventory + name associations (the
entire matcher layer is style-agnostic and carries over untouched).

**The lesson, stated once:** consistency must live in the CONSTRUCTION RECIPE, not in
per-icon taste. v2 has ONE recipe per set; an icon is "done" when the recipe, not the
author, says so.

---

## 2. The laws — bind every candidate style

### L1 · One construction recipe
Every file icon in the set is built by the same recipe (the chosen style's recipe, §3).
Variety comes from the mark inside the recipe, never from switching frameworks. There are
no archetypes in v2. Folders have their own single recipe, rhymed with the file recipe.

### L2 · Brand-first sourcing — geometry DERIVES from the official artwork
*(Hardened 2026-09-02 after the round-1 rejection: "not even close to the real ones".)*
If a concept's brand publishes an official mark, the icon IS that mark — and its
geometry is **adapted from the official vector artwork**, never drawn from memory or
description. Sources, in preference order: the brand's own SVG (press kit / repo /
site), the simple-icons library (faithful maintained single-path vectors of ~3000
brands, CC0), the source icon themes' faithful assets. Adaptation means: fit into the
optical envelope, flatten gradients to their dominant flat stops, simplify ONLY what L5
forces at 16 px (log every simplification); it never means redrawing. Per-icon
provenance duty: record the source URL/slug (samples: `samples/sources.json`;
production: the slice manifest). Freehand geometry for a brand that owns a mark is a
HARD REJECT in review — as is inventing a metaphor for it (the v1 editorconfig failure).
Generic metaphors only for concepts with no mark (`log`, `lock`, `zip`, …), from one
shared glyph vocabulary. `m11-icons/inventory/brand-colors.json` (193 verified hexes)
is the color source of truth; extend it the same careful way.

### L3 · Letter law
Where the chosen style TYPESETS letters (§3 defines it per style — A's monograms, D's
re-set logotypes), letters are a SYSTEM, never a judgment call. *Erratum (samples,
2026-09-02): faithful logotypes in style B follow the BRAND's own geometry instead —
that is B's whole point (its TS sits cap 5.6 / baseline 12.8 / bottom-right, as the
brand draws it). The table binds typeset letters only:*

| rule | value |
| --- | --- |
| typeface | Inter Bold, as paths (`m11-icons/production/tools/letterpath.mjs`), never `<text>` |
| case | UPPERCASE only (exception: a faithful logotype the brand draws otherwise) |
| count | 1 or 2 characters. 3+ is banned — pick 2 or use a mark |
| 1-char | cap height **8.0 px**, baseline y = 12.0 |
| 2-char | cap height **6.2 px**, baseline y = 11.1, tracking 0.4 px |
| centering | the glyph-group ink box centers horizontally; baseline NEVER moves per icon |
| color | one ink per style (§3); never per-icon ink choices |

Same box, same size, same weight, same baseline, every time. This kills the v1 letter
chaos by construction.

### L4 · Grid & authoring method ("draw big, land on 16")
Answer to "create them big, then scale them down": the industry method (SF Symbols,
Material keylines, VS Code codicons) is **design AT the target grid, work ZOOMED**:

- Canvas/viewBox is `0 0 16 16`, always. Author at any magnification you like (tooling
  renders 64× for the eye) — but every coordinate is chosen ON the 16-grid.
- Snap horizontal/vertical edges to integer or half-pixel positions. Curves/diagonals are
  free, but their extremes snap.
- Free-drawing on a big canvas and shrinking is BANNED: detail lands off-grid, stems go
  fractional, 16 px renders blur. Scaling down discards information; designing at 16 and
  previewing big adds none to discard.
- Every icon is judged at 16 px first (the tree's true render), in a 22 px row context;
  32/64 only have to stay clean. Never optimize for 64 at 16's expense.

### L5 · Legibility minimums
- Minimum stem/gap: **1.5 px** at 16 (raised from v1's 1.3 — thin stems were part of the
  mud). Minimum counter (enclosed gap): 0.8 px. *Erratum (samples): the gap minimum
  binds SEPARATELY-READ features; sub-shapes the official mark effectively merges may
  fuse into one silhouette (docker's containers seat directly on the whale's back).*
  *Erratum 2 (round-2 samples): where the OFFICIAL geometry forces it, feature gaps may
  drop to ≥ 1.2 px (docker's container grid at 1.27, markdown's M stem at 1.46) —
  official proportions outrank the round number; below 1.2 px the official detail is
  simplified instead (rust's bolt circles dropped, prettier reduced).*
- Detail budget: at most ~3 distinguishable sub-shapes per icon at 16 px. If the official
  mark carries more, simplify until it fits (keep the mark's gestalt, drop its interior
  detail).
- Contrast duty (dark-first; the product backdrop is Dark 2026 — editor `#121314`,
  sidebar a 0.30 translucent coat over vibrancy): every fill must clear the backdrop by a
  comfortable margin; the style's palette bands (§3) are chosen so this holds by
  construction. Light-theme variants are a later, optional pass (the theme format
  supports them); dark is the design target.
- *Erratum (pilot gate, ruled 2026-09-03): a simplification that is legal by the
  numbers but loses the mark's GESTALT is still a fidelity failure — docker's deck
  thinned to 3+1 boxes stopped reading as the loaded-cargo whale, and editorconfig's
  solid-silhouette flattening destroyed a mark that is really a line drawing (both
  D22-carried, both REJECTED at the pilot gate). A reduction must keep what makes the
  mark THAT mark; when official detail cannot hold the floor, thicken/redistribute it
  prettier-style before deleting it.*

### L6 · Palette law
One palette REGIME for the whole set — never two. Per style (§3), but always: hues may
come from brands, saturation/lightness live inside the style's fixed bands; neutral
(non-brand) concepts all share the same one or two neutral inks. Off-brand muting either
applies to every icon or to none. *Erratum (samples): brands with a mark but NO
canonical color (markdown, editorconfig) get a rule, not a judgment call — container
styles (A/D) assign each one a set hue recorded in the palette table (samples: markdown
violet, editorconfig rose); free-form styles (B/C) keep them monochrome in the style's
lifted ink.* *Erratum 2 (round-2 samples): ACHROMATIC EXEMPTION — inks with S < 12
(whites, grays, near-blacks) are exempt from any saturation floor/clamp; clamping a
hueless ink invents a color (R4 would have turned editorconfig's white mascot red).*

### L7 · Folder law
- The differentiator must be BIG: either the folder BODY carries the concept's color, or
  the face carries a glyph whose **largest ink dimension is ≥ 8 px** at 16 — centered on
  the face, never a corner micro-emblem. (v1's 8.2 px corner emblems are the ceiling of
  what failed; v2 centers and simplifies instead of shrinking scenes.) *Erratum
  (samples): the original "≥ 8.5×8.5" was geometrically impossible — the v1 folder
  silhouette's front face is only ~9.2 px tall, and style C's stroked cavity ~6.8 px;
  the reworded law is what the samples actually hold (e.g. chevrons 10.2×7.8, centered
  at the face's mass).*
- Folder glyphs come from a constrained vocabulary: max 2 sub-shapes, no scenes, no
  perspective. If the concept's file icon is a mark, the folder glyph is that mark
  simplified — the pair must rhyme.
- Closed/open are one construction: same glyph, same colors, flap state changes. Open
  never hides the glyph.
- One base folder silhouette for the whole set (v1's silhouette is fine and proven; keep
  its mass).

### L8 · File format (inherited from v1 spec §1, unchanged)
`viewBox="0 0 16 16"`, no width/height; flat solid fills; no gradients/filters/masks/
clip-paths/`<image>`/`<use>`/`<style>`/`<script>`/opacity attributes; no `<text>` ever;
no external references; ≤ 2 KB target, 4 KB hard cap; 2-decimal coordinates. Strokes
only if the chosen style is stroke-based (style C) — then stroke-width is the style
constant and appears in every icon identically. *Erratum (round-2 samples): the 2 KB
target is ADVISORY for faithful complex marks — official geometry costs bytes
(editorconfig 3.7 KB, rust 3.65 KB vs a ~950 B set average); the 4 KB cap is the law,
the validator warns above 2 KB and fails above 4.*

### L9 · QA gates (all reused/adapted from m11 tooling)
1. `validate.mjs` (adapted to the chosen style's constants) — format + geometry laws.
2. **16 px proof** per icon: rasterized, eyeballed, pass/fail recorded. Non-negotiable.
3. Contact sheet per slice at 16/22/32/64 on the Dark 2026 backdrop + an in-context
   explorer listing — the sheet is what review judges.
4. Twin audit across the set (R7-style hue/ΔL/ΔS thresholds + R8 form collisions) so two
   concepts never converge.
5. Letter audit (styles with letters): assert every letter icon's baseline/cap-height
   equals the L3 table by measurement, not by eye.

### L10 · Per-icon pre-flight checklist
Before an icon enters a contact sheet: recipe followed? official mark verified (L2)?
grid-snapped (L4)? stems ≥ 1.5 (L5)? palette bands (L6)? letters exactly L3? ≤ 2 KB
(L8)? 16 px proof taken (L9)?

---

## 3. Style candidates — ROUND 2 (D22 RULED: R1 · 2026-09-03; §5 is the operative recipe)

All round-2 candidates share **identical faithful geometry per subject** (one fitted
master mark per subject, adapted from the official artwork per L2 — built once, then
treated four ways). They differ ONLY in treatment: color regime, container, folders.
Samples: 12 subjects per style (the original 8 + react · eslint · prettier · rust as
fidelity stress tests) in `m20-icons-v2/samples/` + the comparison sheet.

### R1 — "True color" (the official mark, verbatim)
- **Recipe:** the fitted faithful mark in its official colors — multi-color kept where
  the brand is multi-color (python blue+yellow, eslint two-purple), free-form on the
  optical envelope system. Mark-less concepts: the neutral glyph vocabulary in one gray.
- **Folders:** body tinted with the concept hue, the faithful mark in white ≥ 8 px on
  the face; generic folders sand.
- **Trade-off:** the loudest rainbow of the four; multi-color micro-detail can muddy at
  16 px (L5 simplifications, logged).

### R2 — "One tint" (faithful shape, single brand hue)
- **Recipe:** the same fitted mark rendered as ONE flat fill in the brand's primary hex
  (the simple-icons look, recolored per brand); neutrals in the shared gray.
- **Folders:** one sand body for ALL folders; the concept's mark in its brand hue,
  ≥ 8 px, centered on the face. *Erratum (samples): NEUTRAL concepts keep a WHITE face
  mark — the neutral gray ink is chosen against `#121314` and dies on sand (measured
  ~1.16:1); gray-on-sand is exactly the v1 `src.svg` failure. Same reading applies in
  every treatment: mark-less folders (src) use the sand body + white neutral glyph.*
- **Trade-off:** loses multi-color identities (python's yellow, eslint's second purple);
  shape + hue carry everything. The calmest faithful row.

### R3 — "Chips" (faithful mark in white, uniform container)
- **Recipe:** the 14×14 rx3 chip in the brand hue (S 45–70 / L 45–60 clamp), the fitted
  faithful mark knocked out white inside (ink 8–10 px). Round 1's chip idea, real
  geometry.
- **Folders:** folder body = chip color, white faithful mark ≥ 8 px.
- **Trade-off:** wide marks crop small inside the chip; internal color detail flattens
  to white; heaviest color area per row.

### R4 — "Tamed color" (official colors, normalized)
- **Recipe:** R1's multi-color faithful marks, but every hex normalized into set bands
  (S 45–70, L 45–62, hue untouched) so the rainbow sits in one saturation world.
- **Folders:** as R1, with normalized hues.
- **Trade-off:** hexes stop being exact (purists notice); everything else is R1.

---

## 3-history — ROUND 1 candidates (ALL REJECTED, Sebastian 2026-09-02)

Kept as history per house style; geometry in these recipes was freehand — the rejection
that produced L2's hardening. Their treatment ideas survive above (A→R3, B→R1/R2,
D's taming→R4).

### Style A — "Chips" (uniform container)
- **Recipe:** every file icon is the SAME chip — rounded square 14×14, rx 3, at (1,1)
  (v1's proven badge plate) — filled with the concept's color; the mark (or L3 monogram)
  sits white, centered, ink box 8–10 px (up to 11 where holding L5 gaps needs it —
  samples: python).
- **Letters:** allowed as the fallback for any concept whose mark doesn't survive
  simplification — always inside the chip, always L3.
- **Palette:** brand hue, clamped into one band (S 45–70, L 45–60) so chips read as one
  family; neutral concepts share one slate chip.
- **Folders:** the folder silhouette IS the chip: body tinted with the concept's chip
  color, white ≥ 8.5 px glyph centered on the face; generic folder = neutral slate.
- **Feel:** calm, extremely uniform grid of colored squares (JetBrains/Nova territory).
- **Trade-off:** silhouette personality is gone — the docker whale and python snakes live
  inside squares like everything else. Recognition leans on color + white mark.

### Style B — "Brand true" (faithful marks, normalized) ← the expert recommendation
- **Recipe:** the file icon IS the official mark, free-form — no container unless the
  brand's own mark has one (the TS lozenge stays a lozenge, the docker whale is a whale,
  editorconfig is its mascot head). Normalization does the consistency work: one optical
  mass system (tall ≈ 11×13 / wide ≈ 13×10 / compact ≈ 12 envelopes with ONE shared mass
  target), shared corner-rounding grammar, everything on the L4 grid.
- **Letters:** ONLY when the official logo is letters, drawn as the brand draws them
  (TS/JS/CSS…); never as an invented fallback. Mark-less concepts use the shared neutral
  glyph vocabulary in one gray ink — utility files deliberately recede, real brands pop.
- **Palette:** official brand hexes VERBATIM (brand-colors.json), with one documented
  visibility lift rule for too-dark marks on the dark backdrop; neutrals share one ink.
- **Folders:** body tinted with the concept's hue (full-body color — the row reads at a
  glance), white ≥ 8.5 px glyph centered on the face; generic folder = the sand folder.
- **Feel:** the vscode-icons/Material family feel — colorful, instantly recognizable —
  executed with discipline those sets lack.
- **Trade-off:** the rainbow. Consistency lives in the envelope/palette laws rather than
  a constant container, so review must actually enforce them (the audits exist).
- **Why recommended:** a file tree's job is instant recognition; his reference themes
  (vscode-icons favorite, Material) live here; and the editorconfig complaint is, at
  heart, a demand for brand fidelity — this style makes fidelity the recipe.

### Style C — "Wire" (monoline, native-minimal)
- **Recipe:** everything is line art — one stroke weight (1.5 px at 16), round caps and
  joins, no fills except at most one 2×2 px accent dot. Brand marks simplified to their
  outline gestalt.
- **Letters:** never. Letter-brands become their boxed outline mark where the brand has
  one, else a neutral glyph.
- **Palette:** one ink for all (`#A9B0B8`-class) + at most one accent element per icon
  in the concept's hue (clamped S 50–65, L 55–65).
- **Folders:** outline folder + inner line glyph ≥ 8.5 px; branded folders tint the
  stroke.
- **Feel:** the most macOS-native of the four — SF-Symbols restraint, matches the
  vibrancy chrome beautifully. The tree goes quiet.
- **Trade-off:** weakest differentiation at 16 px across 1,161 file types and the least
  brand recognition; also the biggest redraw effort. The honest minimal pole, offered
  because it is the look the rest of VSebCode's chrome speaks. *Sample finding: with
  letters banned, every letter-brand loses its identity — the TS sample is an empty
  outlined box with one blue dot, and js/css and kin would follow; on the light strip
  the whole row nearly disappears.*

### Style D — "Duotone" (two-tone flat, tamed palette)
- **Recipe:** solid, chunky, geometric redraws of each mark — exactly two tones per icon:
  base = the concept's hue snapped to a 12-hue matrix (S 50–65, L 52), shade = same hue
  at L 34 for structure. No outlines, no containers.
- **Letters:** logotype-only (like B) but RE-SET in Inter Bold per L3, so TS/JS/CSS
  render as one typographic family rather than three faithful-but-different logos.
- **Palette:** the matrix IS the palette — brand hues are snapped to it, which kills the
  loud-vs-muted clash by construction. Neutrals = one gray pair from the same matrix.
- **Folders:** duotone folder — body at the concept's base tone, flap/shadow at the
  shade tone, white ≥ 8.5 px glyph.
- **Feel:** modern, cohesive AND colorful; reads "designed as one set" hardest of the
  four.
- **Trade-off:** brand hexes are approximated (nearest matrix hue), and every mark is a
  stylized redraw — fidelity trades against family resemblance. *Sample findings: white
  joins base+shade as the universal counter-ink (a mark inside a plate is mush at
  base-on-shade contrast — the strict two-tone reading failed at 16 px); the matrix
  COLLIDES real neighbours — typescript (H211), docker (H206) and python (H207) all
  snap to 210 and share one base/shade pair, leaving form as their only separator; the
  L34 shade tone runs close to invisible on `#121314` (markdown's ring).*

---

## 4. After D22 — production plan (own sessions, one phase per session)

What v2 does NOT redo: the merged inventory, the name/extension/language associations,
the specific-beats-general theme logic, the pins — the entire matcher layer ships today
and carries over verbatim. v2 swaps SVG payloads under the same ids (1,161 file + 618
folder), which makes it dramatically cheaper than v1.

1. **Phase 0 (this session):** this guide + 4-style samples + D22 ruling. Lock the
   chosen style's section into a production recipe with exact constants (the chosen
   style's numbers move from §3 into a §5 "recipe card"; the other three styles stay as
   history).
2. **Pilot** (~24 icons: the 8 sample subjects + the worst v1 offenders + 4 folders,
   closed+open): full pipeline through the L9 gates → Sebastian gate BEFORE mass work
   (M11 precedent: the pilot caught what specs missed).
3. **Slices:** file slices + folder slices sized like v1's A01–A12/F01–F06, each
   review-gated on its contact sheet; worklist reused from
   `m11-icons/production/longtail-worklist.json` + set-manifest ids.
4. **Assembly:** twin/letter audits across the whole set, reconciliation, theme build —
   associations untouched, iconPaths only.
5. **Integration (the ONLY moment v2 touches the fork):** one packaging commit swapping
   the SVG trees inside `extensions/theme-vsebcode-icons` + pin bump; acceptance runbook
   = M11's (dev boot + packaged virgin boot + spot checks). Until this lands, the v1 set
   keeps shipping.

---

## 5. Recipe card — R1 "True color" (RULED, D22, 2026-09-03)

The operative production recipe. Reference implementation: `samples/masters/` +
`samples/r1-true/` + `samples/tools/` (build.mjs derives icons from masters; check.mjs
gates; fidelity.mjs renders source-vs-master proofs). Everything below is L1–L10 plus
the round-2 constants as sampled and ruled.

**File icons**
- ONE fitted MASTER per concept, adapted from the official vector artwork (L2 pipeline:
  brand SVG / simple-icons / source-theme asset → affine fit into the optical envelope →
  gradients flattened to their dominant flat stops → only L5-forced simplifications,
  each logged). The R1 icon IS the master: official colors verbatim, multi-color kept.
- Optical envelopes (ink): wide ≈ 13–15.2 × 9–10.4 · tall ≈ 10.8–11.4 × 12–13.4 ·
  compact ≈ 11.4–13 across. One mass system; judge against the sampled twelve.
- Colorless official marks stay monochrome; black lifts to the light ink (~L 88,
  markdown-class) for the dark backdrop. Achromatic exemption: S < 12 inks are never
  saturation-clamped. *Erratum (pilot, ruled 2026-09-03): the lift applies to ink that
  MEETS THE BACKDROP — ink printing on the mark's own field is never lifted (dotenv's
  black on its yellow field). Color source-of-truth on a conflict between
  `brand-colors.json` and the brand's own file: brand-colors wins the PRIMARY hex, the
  artwork's own fills win secondary layers (npm/git/go precedent, approved as built).*
- Mark-less concepts (json, log, lock, …): the shared neutral glyph vocabulary in one
  gray ink (`#A6AEB6`-class). TYPESET LETTERS DO NOT EXIST in R1 — letterforms appear
  only as source geometry (TS's lozenge letters etc.); the L3 table stays dormant.
- **Prettier rider (ruled with D22):** an official mark that is physically unreadable at
  16 px (sub-1.2 px features at any allowed fit) ships as a READABLE REDUCTION — keep
  the official colors and distinctive proportions/edge behavior, reduce element count
  and thicken to clear L5 (official-forced floor 1.2 px); log every reduction in the
  slice manifest. Sample precedent: prettier 11 rows → 4, bar 10 → 26 units, official
  right edges held.

**Folders**
- Concept-hue BODY (the brand's primary hex) + the concept's master knocked out WHITE,
  ≥ 8 px largest ink dimension, centered on the face. Mark-less folders: sand body
  (`#BF9354` v1 base) + white neutral glyph — never gray-on-sand. Closed/open = one
  construction, same mark, flap state only.
- Open state (ruled at the pilot gate, 2026-09-03): v1's two-panel open silhouette
  verbatim (back sheet + tipped pocket); the second tone derives by formula
  `shade(body) = hsl(h, s, max(18, l − 15))` — hue/saturation untouched, floored so a
  dark body cannot collapse into the backdrop (reproduces v1's hand-picked sand pair
  within two units per channel). The face mark is byte-identical in both states and
  crosses the panel seam — approved as built.

**Gates per slice (production)**
- check.mjs format law (L8; 2 KB advisory / 4 KB fail) + derivation assert (icon path
  data byte-equal to its master's) + 16 px proofs + FIDELITY PROOF (official source vs
  master, side by side, per subject — the round-1 failure is a standing gate) + twin
  audit (R7/R8) + provenance entry (source name/slug/URL, license, simplifications) in
  the slice manifest.
