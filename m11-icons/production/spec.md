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
  theme/pins.json                 R14a hand-pinned matcher verdicts, self-documenting;
                                  same authority as core-tier.json's matcherCollisions
  theme/resolution-flip-diff.md   the R14 precedence diff: what moved, the escalation and
                                  its pins, what is still unreachable, three sanity scans
  tools/{letterpath,contact,contact-full,validate,raster,audit,pixelproof}.mjs
  tools/{make-set-manifest,build-theme,chromium}.mjs
  tools/fonts/{Inter-Bold.ttf,Inter-SemiBold.ttf,OFL.txt}
  tools/generators/<slice>/  the authoring sources, swept out of the session scratchpad
                             (READ ONLY - they write into svg/ if run; see its README)
  longtail-worklist.json     the 18 full-coverage slices and their concepts
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
node tools/build-theme.mjs --flip-report      # + theme/resolution-flip-diff.md (R14)
node tools/build-theme.mjs --core-first       # the withdrawn precedence, comparison only
node tools/audit.mjs --folders-hard           # gate on the R9b folder lane (off by default)
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
  tan plate) is ratified.
  **R9a — emblem boxes, ruled (Sebastian, 2026-09-01: "too small, make them bigger").**
  Emblems are authored in a 0–10 field and placed by one uniform scale + translate, so the
  box is the whole geometry. **Closed: an 8.20 box at x 5.30–13.50, y 4.60–12.80** — right
  edge 1.00 inside the base's x 14.5, and 0.30 clear of the body's top (y 4.30) and bottom
  (y 13.10) edges. That is all the body holds: right of the tab it is only 8.80 px tall, so
  8.20 with the former 1.00 px bottom inset would start at y 3.90 and paint 0.40 px of ink
  *outside* the silhouette on 19 of the 40 concepts — the anchor moved, the size did not.
  **Open: a 5.80 box at x 7.26–13.06, y 6.75–12.55** — the largest the front flap allows at
  0.25 px clearance from its top (y 6.5), bottom (y 12.8) and bottom-right cubic, whose
  terminus (13.06, 12.80) is what binds the right edge at every clearance. The §2
  minimum-feature floors scale with the box, **×1.26** off the former 6.50: the 2.0–2.6 unit
  stem now reads 1.64–2.13 px (was 1.30–1.69) and the 1.2–1.8 unit counter 0.98–1.48 px (was
  0.78–1.17). The **0.8× open-flap ratio is withdrawn as a ratified constant** — the flap's
  6.30 px height caps the open box on its own, and the ratio is now merely derived, **~0.707**.
  **R9b — folder emblems may share construction, ruled (review lead, 2026-09-02). R8 does
  NOT gate the folder lane.** Where two folder concepts share the *container* metaphor, the
  same construction is an honest concept rhyme and not a collision — `bloc` / `ngrx-store` /
  `devcontainer` / `vm` are four things that each hold something, and the four-way is
  separated by hue and by the context a folder name arrives in, exactly as an R3 family is.
  The 0.72 bar is also **uncalibrated at emblem scale**: it was measured on full-size file
  objects, and at 8.20 px the outline term stops discriminating because every candidate
  outline is the same circle — `atom` (nucleus in orbit), `target` (bullseye) and
  `deprecated` (slashed circle) score 0.73–0.85 against one another while reading as three
  different objects. That false cluster is the proof, not a coincidence. `tools/audit.mjs`
  keeps the lane and keeps `--folders-hard` available, **off by default**; it reports and
  never gates until a bar is measured for 8.20 px geometry.
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
  **R11a — the arc-radius rounding trap (F03, 2026-09-02).** The same bug fires on
  *rounding alone*: a radius that is exactly half its chord before minification becomes
  smaller than half its chord after `toFixed(2)`, and the renderer silently scales it back
  up — a different curve from the one that was proofed. **Floor emitted arc radii to 2 dp
  and check the chord against the floored value, not the computed one.** Emitting a radius
  a hair under half the chord is the safe direction; a hair over is not.
  **R11b — the headless-shell toolchain fix (F06 → assembly v2).** The
  `~/Library/Caches/ms-playwright/chromium-<build>` download is Chrome for Testing 147 and
  no longer honours `--headless --screenshot` / `--dump-dom`: every tool that shelled out
  to the `.app` hung forever. The resolver now prefers
  `chromium_headless_shell-<build>/chrome-headless-shell-mac-arm64/chrome-headless-shell`
  (0.39 s against infinite) and falls back to the `.app` only for caches that predate the
  split. It lives in one place, `tools/chromium.mjs`, consumed by `contact.mjs`,
  `contact-full.mjs`, `raster.mjs` and `pixelproof.mjs`.

- **R12 — Letters need a plate, and four is too many (A05, 2026-09-02).**
  A **bare four-letter wordmark GLYPH is banned**: four caps on nothing cannot hold the
  1.3 px minimum feature at 16 px and read as a smear. Letter-only marks go on a **plate**
  (the BADGE archetype) unless the fill is *dotenv-light* — peak contrast ≥ ≈ 0.8 against
  `#121314`, which is what lets the canon `dotenv` `ENV` stand as a bare glyph. Three caps
  remains the ceiling on a plate (§4), and R5 still sizes them ink-width-first.

- **R1a — logo-shaped geometry, ratified cases.** R1 covers more than the zig Z, the svelte
  ribbon S and the TeX wordmark trick it was written from. Also ratified as *drawn shapes,
  not type*, and therefore correctly built without `letterpath`:
  **wordpress** — the fat zigzag W (F06; a letterpath W was proved impossible at emblem
  scale); **brainfuck** — the `[` + `]` syntax mark (A02); **heroku** — the angled H (A10);
  **markuplint** — the drawn chevrons, whose inner M is a letterpath (A10). The zig and
  svelte precedents stand unchanged and are restated here as the reference cases.

- **R13 — Alias pairs.** The merged inventory carries duplicate matchers for one concept
  under two ids: `astro-config` / `astroconfig`, `bitbucket` / `bitbucketpipeline`,
  `panda` / `pandacss`, `marko` / `markojs`. These ship **identical artwork by design** —
  one definition, two keys. They are not an R8 collision and must not be "fixed": the theme
  builder maps both ids to a single icon definition, and `tools/audit.mjs` carries them in
  its `ALIASES` list, exempt from R7 and R8 exactly as an R3 family is.

- **R14 — theme resolution is SPECIFIC BEATS GENERAL, ruled (review lead, 2026-09-02).**
  When two named concepts claim one matcher, the **bespoke long-tail icon wins over the core
  icon**. This was raised as the open question `--longtail-first` and is renamed on
  ratification, because "long-tail first" names the tier arithmetic and not the reason: the
  reason is §11's own logic — `.awk` deserves the awk icon, not `shell`'s broad claim on
  every script extension; `.avif` deserves avif, not `image`'s claim on every raster format.
  Core-over-long-tail was never ruled; it is what the core tier did when the long tail had no
  icons to lose with, and at full coverage it left **109 bespoke icons unreachable**. Three
  things the flip does **not** touch: the **54 explicit `matcherCollisions` verdicts** in
  `inventory/core-tier.json` still resolve first and are pinned exactly as written; **generic
  still loses to every named icon**, across matcher kinds; **rank** still orders core against
  core. Shipped in `tools/build-theme.mjs` as the default, with `--core-first` as the escape
  flag. Measured after the pins below: **194 associations move, 70 core concepts yield one,
  unreachable 108 → 48**. `--flip-report` regenerates `theme/resolution-flip-diff.md`, which
  carries the full diff, the residual unreachable list and three sanity scans.
  **R14a — the pin file, ruled (review lead, 2026-09-02).** A tier rule is not a measurement
  of specificity: where an upstream source theme gave a narrow concept an over-broad matcher,
  R14 believes it (Material's `qwik` claims `.tsx` outright; vsicons' `esphome` claims
  `.yaml`). The correction is **per matcher, in `theme/pins.json`** — read by
  `build-theme.mjs` and resolved **before every precedence rule, in either mode, with exactly
  the authority of the 54 `matcherCollisions` verdicts**, which it is merged with. It is
  deliberately *data, not code*: the rule stays one line and the exceptions stay a list
  anyone can read. Two shapes are pinned, and they are the standing test for any new pin:
  **eponymous** — a matcher whose value IS a concept's own id belongs to that concept
  (`.xml`→`xml`, `components/`→`components`); and **blast radius** — a matcher a top-ranked
  core concept covers in the real world stays with it unless the challenger is genuinely
  narrower (`.tsx`→`reactts`, `.cls`→`tex`). **11 pins ship.** Every pin is validated against
  the claim map at build time — a matcher nobody claims, or a winner that does not claim it,
  fails the build rather than being ignored — and each records what its losers still resolve
  through. Three concepts are stranded by them, on purpose and in writing (`qwik`,
  folder `ngrx-store`, folder `redux-store`); one (folder `store`) is recovered.

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
3. **Reading 3 — the form qualifier extends past SILHOUETTE at full coverage
   (assembly v2, 2026-09-02). RATIFIED by the review lead, 2026-09-02** — it shipped
   provisionally with the full-coverage set and is now law, not a reading awaiting a
   verdict. Reading 1's argument was
   "155 icons cannot be pairwise ≥ 12° apart in hue (that allows 30)". The set now holds
   375 BADGEs and 262 GLYPHs, so the strict BADGE/GLYPH lane became arithmetic rather than
   defect: applied at full coverage it flags **298 core-lane pairs, of which 282 score
   below 0.40 on form and exactly one reaches 0.55**. The audit therefore applies the
   SILHOUETTE form qualifier to *every* archetype for any pair involving a long-tail icon,
   and keeps the strict rule among the 155 core, where the lead's rounds 1–2 stand.
   `LONGTAIL_FORM_QUALIFIED = false` at the top of `tools/audit.mjs` restores the strict
   reading and prints all 298. The one pair that survives the qualifier
   (`cocos` ↔ `sqlite`, form 0.62) was fixed in round 3, not tolerated.
4. **§11.3's hard scope is the authoring slice, not the worklist category. RATIFIED by the
   review lead, 2026-09-02** — shipped provisionally, now law (`--scope slice`, the default;
   `--scope domain` and `--scope all` are the other two readings and are measured in the
   round-3 log). The `code` category alone holds 629 concepts across eight
   slices, so reading "within-domain" as "within-category" recreates reading 1's arithmetic
   problem one level up: it flags 1,037 R7 pairs against `slice`'s 298. Either side being a
   **core icon always makes the pair hard**, in every scope.

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
   (R9 / R9a); the emblem may be the concept's file-icon mark reduced, tone law applies
   (darker than the tan, brand hue only when it earns it); closed + `-open` variants.
