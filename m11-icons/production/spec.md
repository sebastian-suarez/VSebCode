# M11 production spec — VSebCode file icons

The rules every production icon obeys. Batch 1 was authored against this file; later
batches are briefed from it. Where this document and the canon disagree, **the canon wins**
and this document is wrong and must be corrected.

- **Canon** — the six approved icons in `m10-nvim-prototype.html` (symbols `i-folder`,
  `i-foldero`, `i-ts`, `i-css`, `i-md`, `i-npm`). Their geometry, hexes and per-icon optical
  sizing are law. Production reproduces them exactly, with one transformation: `<text>`
  becomes letter paths (§5).
- **Concept list** — `m11-icons/inventory/core-tier.json`. `id` and `brandColor` come from
  there; ranks decide batch membership.
- **Ideation reference** — `m11-icons/pilot/sheet-b.png`, for silhouettes the canon does not
  cover. Its markdown and css cells contradict the canon and are void. Nothing is traced.

---

## 1. File format

```
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">…</svg>
```

| rule | detail |
| --- | --- |
| viewBox | exactly `0 0 16 16`. No `width`/`height` attributes — the consumer sizes it. |
| paint | flat solid fills only: `#RRGGBB`, or `rgba()` for the canon folder's shadow band. |
| forbidden | gradients, filters, masks, clip paths, patterns, `<image>`, `<use>`, `<style>`, `<script>`, `opacity` attributes. |
| strokes | forbidden, **one exception**: the outlined-rect GLYPH archetype (canon markdown, `stroke-width 1.3`). Any other icon that wants an outline draws it as a filled shape. |
| text | no `<text>`, no `<tspan>`, no `font-family` anywhere. Letters are outlines (§5). |
| references | nothing external: no `http(s):`, no `url()`, no `href`, no `@import`. |
| size | target **≤ 2 KB**, hard cap **4 KB**. Batch 1 averages 634 B, max 1408 B. |
| minify | 2 decimals max; drop leading zeros (`.5`), drop repeated command letters, drop zero-length linetos. Round only where it does not visibly move an edge. |
| elements | `<rect>` is allowed and preferred for the badge plate — it is smaller than the equivalent path and pixel-identical to the canon. Everything else is `<path>`. |

Multi-part marks are one `<path>` with several subpaths where they share a fill; knock-outs
use `fill-rule="evenodd"` (padlock keyhole, next disc, sql disc gaps).

## 2. Grid discipline

16 px is the primary render. 22 px is the real tree-row context. 32 and 64 only have to stay
clean — never optimise for them at 16 px's expense.

- Snap horizontal and vertical edges to integer or half-pixel coordinates wherever the shape
  allows. Diagonals and curves are free.
- Minimum feature: **1.3 px** stems / gaps (the canon markdown stroke). Anything thinner
  disappeared in the pilot. Counter-gaps between repeated blocks: **≥ 0.7 px** (docker).
- Do not centre by bounding box. Centre by mass, per icon (§4).

## 3. Optical sizing — the canon measurements

Uniform bounding boxes are forbidden; the pilot proved they read as inconsistent weight.
Every new shape is judged against these, extracted from the canon by rasterising each symbol
at 64× in Chromium and measuring the ink extents.

| canon icon | archetype | ink box (x, y) | w × h | notes |
| --- | --- | --- | --- | --- |
| `i-ts` plate | BADGE | 1 → 15, 1 → 15 | **14 × 14**, rx 3 | the badge plate for all new badges |
| `i-npm` plate | BADGE | 1.5 → 14.5, 1.5 → 14.5 | 13 × 13, rx 2 | canon-only; do not copy for new icons |
| `i-folder` | SILHOUETTE (wide) | 1.5 → 14.5, 2.9 → 13.1 | **13 × 10.2** | the wide-flat weight reference |
| `i-foldero` | SILHOUETTE (wide) | 1.5 → 15.24, 2.9 → 12.8 | 13.74 × 9.9 | same mass, flared lip |
| `i-css` shield | SILHOUETTE (tall) | 2.6 → 13.4, 1.5 → 14.5 | **10.8 × 13** | the tall weight reference |
| `i-md` glyph | GLYPH | 0.1 → 15.9, 3.1 → 12.9 | 15.8 × 9.8 | outer edge of a 14.5 × 8.5 rx 1.6 rect + 1.3 stroke |

Derived envelopes for new work:

| archetype | envelope | mass target |
| --- | --- | --- |
| BADGE | exactly 14 × 14 at (1,1), rx 3 | plate is the mass; letters follow §5 |
| SILHOUETTE, wide-flat | ≈ 13–14.8 w × 9.7–10.4 h | judge against the folder |
| SILHOUETTE, tall | ≈ 10.8–11.4 w × 12–13.4 h | judge against the css shield |
| SILHOUETTE, compact solid (disc, hexagon) | ≈ 11.4–13 across | a solid disc/hex reads heavier per px than a shield — cap it below the badge plate |
| GLYPH | up to 15.8 × 9.8; limbs 1.3–2.0 px | lighter than a badge by design; do not chase badge mass |

Batch-1 measurements, for calibration:

| icon | w × h | icon | w × h |
| --- | --- | --- | --- |
| docker whale | 14.8 × 9.8 | node hexagon | 11.4 × 13.2 |
| prisma prism | 11.4 × 13.2 | next disc | 13 × 13 (r 6.5 at 8,8) |
| lock | 10 × 11.8 | sql cylinder | 11.2 × 13 |
| git branch | 10.6 × 12.7 | shell prompt | 12.6 × 9.4 |
| json braces | 9.8 × 12 | image peaks | 13.6 × 10.85 |
| dotenv `ENV` | 14.06 × 5.2 | html shield | 10.8 × 13 (canon geometry) |

## 4. Archetypes

### BADGE
Rounded square `<rect x="1" y="1" width="14" height="14" rx="3">` in the brand fill, with
1–3 bold letters. Letters are white unless the brand needs dark (JS `#323330` on `#E8D44D`;
any light plate — React cyan, SVG amber — takes a dark letter drawn from the plate hue).

Three caps is the ceiling (pilot). Cap heights that fit the 14 px plate with honest side
padding:

| letters | cap height | tracking | ink width | side padding |
| --- | --- | --- | --- | --- |
| 1 | 7.0 | 0 | ≈ 5.4 | 4.3 |
| 2 | 5.5 | 0 | ≈ 8.8 | 2.6 |
| 3 | 3.9 – 4.0 | −0.02 em | ≈ 10.8 – 11.4 | 1.3 – 1.6 |

### SILHOUETTE
One flat object shape (plus, at most, one satellite dot such as the image sun). Scale to the
§3 envelope that matches its proportion — never to the 16 px box.

### GLYPH
A bold flat mark with nothing behind it. Two forms:
- **outlined** — the canon markdown form: a rounded rect, `fill="none"`, `stroke-width 1.3`,
  plus solid letterforms inside. The only sanctioned stroke in the whole set.
- **solid** — filled limbs 1.3–2.0 px (git branch, shell prompt, json braces), or bare
  letterforms at cap 5.0–5.2 (dotenv) / up to 9.8 for a single letter.

## 5. Letters as paths

Every letterform is an **Inter Bold** outline produced by `tools/letterpath.mjs`
(opentype.js; `tools/fonts/Inter-Bold.ttf` with `tools/fonts/OFL.txt` beside it).

```
node tools/letterpath.mjs --text TS --cap 5.5 --cx 8 --baseline 11.52 --fill '#FFFFFF'
```

Sizing flags are exclusive: `--cap` (cap height in px, the default for caps and digits),
`--xheight` (lowercase), `--size` (raw font size), `--ink-height` (scale the rendered ink box).
Placement: `--cx` + `--hcenter ink|advance` horizontally (**ink** — optical — is the default
and the rule), `--baseline` or `--cy`/`--cy-ink` vertically. `--letter-spacing` is in em.
`--json` prints the resulting font size, baseline, advance and ink box.

### Two centring laws, both read off the canon

1. **Badge letters sit low.** Canon `i-ts` places a 5.214 cap on baseline 11.4 inside a plate
   spanning y 1 → 15: 41 % of the free vertical space is below the baseline. Canon `i-npm`
   independently agrees (39.9 %). So:

   ```
   baseline = plateBottom − 0.41 × (plateHeight − capHeight)
   ```

   which reproduces the canon exactly (cap 5.214 → 11.398 ≈ 11.4).

2. **Silhouette and glyph letters are centred.** Canon `i-css` puts its "3" cap band at
   5.527 → 10.6, centre 8.06 — geometrically centred on the shield. Canon `i-md`'s
   letterforms centre on 8.15. So centre the cap band on the shape's optical centre
   (`--cy 8` for a mark that fills the box).

### Reproducing a canon `<text>`

Match the SF Pro cap height (or x-height), the baseline, and the ink-box centre; then add
letter-spacing so the ink width matches too. Inter Bold runs ≈ 5 % narrower than SF Pro Bold
at these sizes, so without tracking a canon badge's letters shrink by ~0.45 px.

Measured canon ink boxes (Chromium raster at 64×, `-apple-system` = SF Pro):

| canon | string @ size | baseline | ink box | w × h | centre | SF cap / x-height |
| --- | --- | --- | --- | --- | --- | --- |
| `i-ts` | `TS` @ 7.4 | 11.4 | 3.172, 6.047 → 12.547, 11.531 | 9.375 × 5.484 | 7.859, 8.789 | cap 5.214 |
| `i-css` | `3` @ 7.2 | 10.6 | 5.906, 5.406 → 9.859, 10.719 | 3.953 × 5.313 | 7.883, 8.063 | cap 5.073 |
| `i-npm` | `npm` @ 5 | 10.4 | 2.531, 7.656 → 13.281, 11.297 | 10.75 × 3.641 | 7.906, 9.477 | x-height 2.72 |

The three invocations that reproduce them (these are shipped in batch 1):

```
letterpath --text TS  --cap 5.214     --cx 7.859 --baseline 11.4 --letter-spacing 0.065
letterpath --text 3   --cap 5.073     --cx 7.883 --baseline 10.6
letterpath --text npm --xheight 2.72  --cx 7.906 --baseline 10.4 --letter-spacing 0.058
```

Those parameters were chosen by grid-searching cap × tracking × sub-pixel offset against the
canon render at 16 / 32 / 64 px and taking the set that minimises mean channel delta across
all three — not just at 16 px, where the optimum overfits the pixel grid and degrades 32/64.

## 6. Palette

1. `brandColor` from `core-tier.json` when present.
2. Desaturate anything ultra-bright until it feels matte against `#121314`. The canon is the
   calibration: `#3178C6`, `#1572B6`, `#519ABA`, `#BF9354`, `#CB3837`. Batch-1 examples:
   `#F7DF1E → #E8D44D`, `#61DAFB → #46B5D1`, `#FFB13B → #DFA046`, `#CE422B → #A0523C`.
3. Lift anything too dark to sit on `#121314`: `#2D3748 → #8592AD` (prisma),
   `#000000 → #DADCE0` (next).
4. When `brandColor` is absent, choose a matte hue that does not collide with a neighbouring
   concept: `#979CA3` (lock), `#3E9B8E` (sql), `#A08BCC` (image).
5. **The canon six hexes are immutable.**
6. A hue collision with a canon icon outranks brand fidelity — see the yaml decision in §9.
   Archetype separation (badge vs glyph vs silhouette) counts as separation; two badges in
   the same hue do not.

## 7. Naming and layout

```
production/
  spec.md
  reconciliation.md          every set-wide change, with before/after audit numbers
  set-manifest.json          id, kind, archetype, fills, dominant, coverage, colour source, batch
  svg/file/<id>.svg          ids exactly as in core-tier.json
  svg/folder/<id>.svg        plus `folder` and `folder-open`, the two canon defaults,
                             which core-tier.json's folders array does not carry
  theme/vsebcode-icon-theme.json
  tools/{letterpath,contact,contact-full,validate,raster,audit,pixelproof}.mjs
  tools/{make-set-manifest,build-theme}.mjs
  tools/fonts/{Inter-Bold.ttf,Inter-SemiBold.ttf,OFL.txt}
  contact-<batch>.html/.png, contact-full.html/.png
```

## 8. Toolchain

```
node tools/letterpath.mjs --text … --cap … --cx … --baseline …   # one letter group -> one path
node tools/contact.mjs --batch batch1 --title "M11 Batch 1" --png # sheet + 2x screenshot
node tools/validate.mjs                                          # gate the whole svg tree

node tools/raster.mjs svg/file/x.svg          # what an icon actually paints (fills, masks)
node tools/make-set-manifest.mjs              # rebuild ../set-manifest.json from the SVGs
node tools/audit.mjs                          # R7 twins + R8 form collisions, set-wide
node tools/audit.mjs --suggest id[=#ANCHOR]   # nearest colours that clear R7 for one icon
node tools/audit.mjs --try id=#HEX,…          # score a retint without touching disk
node tools/audit.mjs --plan --movable a,b,c   # greedy minimal retint plan
node tools/pixelproof.mjs svg/file/x.svg       # the honest 16 px test (grid, ink, faint, peak)
node tools/contact-full.mjs --png             # the whole-set checkpoint sheet
node tools/build-theme.mjs                    # theme/vsebcode-icon-theme.json + self-check
```

`contact.mjs` inlines every icon once as an SVG `<symbol>` and renders it at 16 / 22 / tree
row / 32 / 64 with the canon originals beside their twins, then screenshots with the
Playwright chromium under `~/Library/Caches/ms-playwright`. `validate.mjs` enforces §1 and
exits non-zero on any failure. Both must be clean before a batch is reported done.

`npm i` runs inside `tools/` only; `tools/node_modules` never leaves the machine.

## 9. Decisions this spec records

- **Badge letters sit 41 % low** (§5, law 1) — derived from the canon rather than
  textbook cap-centring, so new badges sit beside `i-ts` without a visible step.
- **yaml is off-brand.** `core-tier.json` gives `#CB171E`, which at 16 px is the same red
  square as the canon npm badge — both are common in a repo root. Batch 1 ships a muted
  plum `#7E6086` (the pilot sheet's YML colour). Reverting to brand is a one-line change if
  Sebastian prefers brand fidelity over separation.
- **`folder` / `folder-open` ids** are not in `core-tier.json` (its `folders` array holds
  named folders like `src`, `dist`). They keep those ids as the theme defaults.

---

## 10. Errata & rulings

The review lead's rulings at the end of the six authoring batches. **These are law and they
amend everything above them**; where §1–§9 disagree with this section, this section wins.
`tools/audit.mjs` enforces R7 and R8 mechanically; `reconciliation.md` logs what enforcing
them changed.

- **R1 — Logo-shaped geometric marks do not need letterpath.** A mark that happens to be
  shaped like a letter but is drawn as geometry (the zig Z, the svelte ribbon S, the TeX
  wordmark trick) is a drawn shape, not type. Genuinely typographic letters — badge caps,
  the dotenv `ENV`, the canon `npm` — still go through §5.
- **R2 — Multi-colour marks are allowed where the brand identity requires it.** The julia
  trio, python's two tones and the pdf flap are sanctioned. This is an exception to the
  one-fill habit, not a licence: the second colour has to be doing brand work.
- **R3 — Family rhymes are sanctioned.** A shared plate or hue with a *different* mark is a
  deliberate family, not a collision: `reactjs`/`reactts`, `typescriptdef`/`typescript`,
  `jsconfig`/`js`, `json5`/`json`, `sqlite`/`sql`, `cheader`/`cppheader`,
  `testjs`/`testts`, `vitest`/`vite` (the bolts), `vercel`/`next` (lifted-black silver).
  **Family pairs are exempt from R7 and R8.**
- **R4 — §3's GLYPH envelope heights are descriptive, not caps.** A radial glyph may run to
  13 × 13; a hollow compact shape may exceed the solid span cap. §3 records what the canon
  measured, not a ceiling to clip new work to.
- **R5 — Badge sizing is ink-width-first.** Size a badge's letters so the *ink width* lands
  at ≈ 9.0–9.8 for two letters and 10.6–11.4 for three; the cap height is derived from that,
  not chosen first. §5's law 1 (41 % low) applies to the **ink box** — the canon npm agrees
  at 10.4. Lowercase with an ascender is placed on the x-height band, as bun is.
- **R6 — §2's 1.3 px minimum is for drawn geometry only.** It never applies to letter stems;
  letterforms are governed by §5 and R5.
- **R7 — The official twin threshold.** Two icons are twins **iff** same archetype **and**
  Δhue < 12° **and** ΔL < 12 **and** ΔS < 25, measured in HSL on the dominant fill. Chroma
  (HSL S) below 25 is the **neutral lane** and is exempt. R3 families are exempt.
- **R8 — Form collision.** The same recognizable shape, in the same archetype, for unrelated
  concepts is a collision **even in a different hue** — the eslint-vs-node-hexagon rule.
  `zip` vs `generic-archive` is accepted: the generic tier is dimmer by design.
- **R9 — Folders.** There is **no** `generic-folder` asset; the canon `folder` / `folder-open`
  pair serves the 324-concept fallback. The emblem tone law (an emblem is darker than the
  tan plate) and the 0.8× emblem ratio on open flaps are both ratified.
- **R10 — Deliberate off-brands stand.** powerpoint crimson, nim chartreuse, astro purple,
  fsharp teal.
  **R10a — yaml, ruled (Sebastian, 2026-09-01): brand fidelity over separation.** The plum
  is withdrawn; yaml is `#CB171E` exactly. This knowingly re-creates the near-twin against
  canon npm `#CB3837` — separation rests on the `YML` / `npm` letter groups and the small
  value gap, and nothing else shifts to compensate. `tools/audit.mjs` carries the pair as a
  named accepted residual, not as a defect to fix.
- **R11 — Toolchain notes.** Nonzero winding cancels a circle and a rect that overlap when
  they are wound in opposite directions (the helm bug — wind them the same way, or use
  `fill-rule="evenodd"` deliberately). SVG arc radii are silently scaled up when the chord
  is longer than 2r (the docker-emblem bug — check the chord before trusting the radius).

### How R7 and R8 are applied set-wide

Two readings were needed to run R7 and R8 across 155 file icons at once. Both live as
constants at the top of `tools/audit.mjs` and are the review lead's to overrule.

1. **R7's SILHOUETTE lane is form-qualified.** As a raw pairwise test R7 flags 165 pairs,
   which is arithmetic rather than defect: 155 icons cannot be pairwise ≥ 12° apart in hue.
   Following §6 ("archetype separation counts as separation"), a BADGE is a plate and a
   GLYPH is thin ink on nothing — hue *is* the read, so every colour hit is a twin. A
   SILHOUETTE carries a distinctive object shape, so a colour hit there is a twin only when
   the forms also fail to read apart (form score ≥ 0.55). Folders are exempt entirely by R9.
2. **R8's bar is archetype-specific.** The form score is the smaller of area IoU and
   dilated-outline IoU over a 64 × 64 mask; for BADGE it is measured on the letters, since
   every plate is identical by law. Two short letter groups always overlap heavily
   (`PS` vs `Rs` scores 0.84), so the BADGE bar is 0.92 and everything else is 0.72.

## §11 — Long-tail addendum (D20 amendment 2, Sebastian 2026-09-01: full coverage, "FIX IT")

The core-tier curation is overturned as the coverage model: every matcher-bearing concept
in the merged inventory gets a bespoke icon. Generics remain only as the final fallback
for extensions no source theme knows. Rules for the long-tail waves (slices in
`longtail-worklist.json`):

1. Same craft bar as the core: archetypes, optical envelopes, centring laws (incl. the
   R5 ink-width badge law), letterpath for every typographic letter, matte fills, 16-px
   grid, ≤4 KB.
2. HUE: `brandColor` when the inventory has one; otherwise the hue users already
   recognize from the source themes — vscode-icons preferred (Sebastian's reference),
   then Material. Do not invent novel hues when a recognized one exists.
3. R7 SCOPE (the wheel cannot hold 1,170 pairwise-distinct file hues): R7 is HARD within
   your own slice and against core icons of the same domain family (check
   `set-manifest.json`); across long-tail concepts of different slices/domains that
   rarely co-occur in one directory, near-twins are TOLERATED — log them in your report,
   do not block on them. R8 (same mark, same archetype) stays hard everywhere.
4. MARKS: prefer the concept's real mark whenever it survives the 16-px proof; letters
   are the fallback, not the default. A letter badge must not duplicate a same-hue
   same-archetype letter group in your slice or the core manifest.
5. PROOF DUTY: run `tools/pixelproof.mjs` on at least your five riskiest marks; redraw
   anything that reads as mush.
6. FOLDER slices: canon tan base verbatim + one emblem per the folder-family rules
   (§ folders); the emblem may be the concept's file-icon mark reduced, tone law applies
   (darker than the tan, brand hue only when it earns it); closed + `-open` variants.
