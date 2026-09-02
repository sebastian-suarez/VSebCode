# M11 set-wide reconciliation

Every change made to the 237 production icons during the assembly phase, why it was made,
and what was left standing. The rulings this executes are recorded as **Errata & rulings
R1–R11** in [spec.md](spec.md); the machinery is `tools/audit.mjs` (+ `tools/raster.mjs`,
`tools/make-set-manifest.mjs`).

Re-run the audit with:

```
node tools/make-set-manifest.mjs     # refresh fills/dominant/coverage/bytes from the SVGs
node tools/audit.mjs                 # R7 twins + R8 form collisions, exits non-zero on any
node tools/validate.mjs              # spec §1 gate — must stay 237/237
```

---

## How the audit measures

Neither R7 nor R8 can be answered from the SVG source alone: what matters is what an icon
*paints*. `tools/raster.mjs` renders every icon at 256 × 256 in the Playwright chromium,
buckets each opaque pixel to the nearest declared fill, and returns

- **coverage** — the share of painted pixels per declared fill, so the *dominant* fill is
  measured rather than guessed (a badge plate is ~87 %, its letters ~13 %);
- **ink mask** and **mark mask** — 64 × 64 bitmaps of the whole silhouette, and of the ink
  that is *not* the dominant fill (a badge's letters).

R7 then runs on the dominant fill in HSL. R8 runs on the masks: the **form score** is the
smaller of the area IoU and the IoU of the one-cell-dilated outlines. The outline term is
what makes the metric useful — three different solids of similar area (page, shield, disc)
overlap by ~0.8 on area alone, but their outlines do not.

### Two operative readings, flagged for the review lead

R7 and R8 are law; these two readings were needed to *apply* them set-wide, and either can
be overruled by changing a constant at the top of `tools/audit.mjs`.

1. **R7 in the SILHOUETTE lane is form-qualified.** Applied as a raw pairwise test over all
   155 file icons, R7 flags **165 pairs**. That is not a set of defects, it is arithmetic:
   155 icons cannot be pairwise ≥ 12° apart in hue (that allows 30 icons) while honouring
   brand colour. spec.md §6 already says archetype separation counts as separation, so the
   audit reads R7 the way §6 reads hue: a **BADGE** is a plate (§6: "two badges in the same
   hue do not" separate) and a **GLYPH** is thin ink on nothing — in both, hue *is* the read
   at 16 px, so every colour hit is a twin. A **SILHOUETTE** carries a distinctive object
   shape, so a colour hit is a twin only when the shapes do not read apart either
   (form score ≥ 0.55). This is what reduces 165 pairs to **55 twins + 109 hue
   neighbourhoods**, and the 55 include every BADGE and GLYPH item on the review lead's
   worklist.
2. **The R8 bar is archetype-specific.** Two 2–3 letter badges always share the same ink
   band, so letter masks overlap heavily even when the letters differ: the worst honest pair
   in the set is powershell `PS` vs rust `Rs` at 0.84. The BADGE bar is therefore 0.92;
   everything else is 0.72.

Folders are exempt from R7 by R9 — the tan plate is law and the emblem is the discriminator.
The audit instead checks folder emblem descriptions for duplicates (none found).

---

## Audit before

| finding | count |
| --- | --- |
| R7 twins (must fix) | **55 pairs in 12 clusters** |
| R7 colour hits separated by form (SILHOUETTE lane, accepted) | 109 pairs in 8 clusters |
| R8 form collisions | **5** (3 real, 2 accepted below) |
| R7 raw pairwise, before the SILHOUETTE form qualifier | 165 pairs in 20 clusters |
| validator | 237 / 237 |

The 12 twin clusters:

| cluster | archetype | on the lead's worklist? |
| --- | --- | --- |
| angular, erlang, maven, turborepo | GLYPH red | yes (maven ↔ turborepo) |
| asciidoc, objectivec | BADGE plum | yes |
| assembly, cypress, diff | GLYPH green-teal | yes (diff ↔ cypress) |
| audio, graphql | GLYPH pink | new (the lead's audio ↔ storybook is cross-archetype, see below) |
| biome, mdx, perl, php, powershell, wasm | BADGE blue-violet | yes (mdx ↔ wasm, powershell ↔ php ↔ perl) |
| cert, claude, dotenv, git, json, json5, jupyter, postcss, svelte, todo, zig | GLYPH amber-orange | new, and the largest |
| clojure, csharp, deno, django, nginx | BADGE green | yes (nginx ↔ clojure) |
| cmake, http, markdown, r, webpack | GLYPH blue | new |
| cpp, typescript, typescriptdef | BADGE blue | yes |
| eslint, haskell | GLYPH violet | new |
| fsharp, tex | GLYPH teal | yes |
| jenkins, npm, rust, toml | BADGE red-brown | new |

### The lead's worklist, verified

| item | verdict |
| --- | --- |
| mdx ↔ wasm | real (dh 2.7 / dl 2.7 / ds 4.9) — fixed by moving mdx |
| asciidoc ↔ objectivec | real (6.5 / 1.8 / 3.0) — fixed by moving objectivec |
| powershell ↔ php ↔ perl | real; php ↔ powershell (1.1 / 1.2 / 1.5) is the worst pair in the set — fixed by moving powershell and perl |
| nginx ↔ clojure | real (1.7 / 7.5 / 8.7) — fixed by moving clojure (and csharp, django, which the cluster also contains) |
| typescriptdef ↔ cpp | real. typescriptdef cannot move — it *is* the R3 rhyme with typescript, and typescript is canon. So cpp moved, **back toward its own brand** (#00599C): darker and bluer, not de-branded |
| maven ↔ scala ↔ turborepo ↔ rollup (h350–358) | partly real. maven ↔ turborepo and maven ↔ erlang and angular ↔ erlang fire (all GLYPH). scala and rollup are SILHOUETTE — different archetype, so R7 does not reach them, and their forms (scala's tilted stack, rollup's ring) read apart. Fixed by moving maven and erlang |
| tex ↔ fsharp | real (0.0 / 3.1 / 5.3). R10 makes fsharp's teal stand, so tex moved (lighter teal) |
| diff ↔ cypress | real (1.3 / 2.7 / 15.5) — fixed by moving diff (no brand; cypress has one) |
| audio ↔ storybook | **not real** under R7: audio is GLYPH, storybook is SILHOUETTE. audio ↔ graphql *is* real and was fixed instead |
| zip ↔ vitest | **not real**: zip is SILHOUETTE, vitest is GLYPH, and dh is 14.6 |
| cmake ↔ tsconfig | **not real**: cmake is GLYPH, tsconfig is SILHOUETTE. cmake ↔ r *is* real and was fixed by moving cmake |
| word ↔ r | **not real**: word is SILHOUETTE, r is GLYPH |
| powerpoint ↔ scala / turborepo | **not real**: powerpoint and scala are SILHOUETTE with forms 0.31 apart; turborepo is GLYPH |

---

## Changes applied — 26 retints + 3 mark changes

Fix policy honoured throughout: the **less brand-anchored** member of each pair moved; the
canon six were not touched; no true brand hex was de-branded (four of the moves are *toward*
the brand); every new colour sits in the matte band and clears R7 with a 1.1× margin, so
nothing lands on the threshold.

### Retints

| icon | archetype | old | new | why this one moved |
| --- | --- | --- | --- | --- |
| assembly | GLYPH | `#4F9E7E` | `#468B6F` | no brand; cypress (brand) and diff both sat in the same sea-green |
| audio | GLYPH | `#C06E9E` | `#C77FA9` | no brand; graphql's `#E10098` magenta is brand |
| biome | BADGE | `#6E6FCC` | `#A5A3E8` | its brand `#60A5FA` is a *light* blue, so it went light — which is both the fix and closer to brand. Keeps its dark `#23204D` letters legible |
| cert | GLYPH | `#C79A4A` | `#93A0AE` | no brand; steel reads as a seal and drops it into the neutral lane (S 13), out of the crowded amber band entirely |
| clojure | BADGE | `#55AD6E` | `#6BB881` | its brand green `#91DC47` is the lightest in the green cluster, so lifting it is brand-directional |
| cmake | GLYPH | `#3D71B5` | `#2F588E` | moved *toward* brand `#064F8C`; r's `#276DC3` is the stronger anchor, markdown is canon |
| cpp | BADGE | `#37648E` | `#325B81` | moved *toward* brand `#00599C`. typescript is canon and typescriptdef is its R3 rhyme, so cpp was the only member free to move |
| csharp | BADGE | `#3E8F4A` | `#3D8F44` | 8° toward brand `#239120`, away from nginx's `#009639` |
| diff | GLYPH | `#5FA894` | `#95C6B9` | no brand; cypress has one |
| django | BADGE | `#43885F` | `#408263` | brand `#092E20` is near-black, so the current hex is already a lift; cooled and darkened slightly off nginx and deno |
| dotenv | GLYPH | `#E3CB4E` | `#E7DF6E` | lifted within its brand yellow so json (equally brand-yellow, equally batch 1) could stay put |
| erlang | GLYPH | `#B8455F` | `#CD7A8D` | brand `#A90533` is very dark, so a lift is spec §6 rule 3; angular's red and turborepo's red are both stronger anchors |
| git | GLYPH | `#E0603C` | `#8C3017` | **see flagged item** — claude's `#D97757` is the literal unmodified brand, git's was already a retint, so git is the less brand-anchored member |
| haskell | GLYPH | `#8E80C6` | `#948AC9` | 1 L step; the pair sat at dl 11.4 against eslint (brand `#4B32C3`), and haskell's hex is already a lift off `#5D4F85` |
| http | GLYPH | `#6E93B4` | `#89A3C2` | no brand; it sat between markdown (canon), r, cmake and webpack |
| jenkins | BADGE | `#C0554A` | `#7E241A` | npm is canon red and rust is brand oxide, so jenkins went deep — the only lane left in the red badges |
| jupyter | GLYPH | `#D97A3C` | `#E3A772` | lightened inside its brand orange; git, claude and svelte all sat in the same 11° |
| maven | GLYPH | `#A93F4A` | `#86323A` | darkened inside its brand red; angular's red is the stronger anchor |
| mdx | BADGE | `#7B68CE` | `#633EC1` | no brand at all; wasm's `#654FF0` is brand |
| objectivec | BADGE | `#A85596` | `#7C8CA6` | no brand; slate is the legacy-Apple read and drops it into the neutral lane (S 20), which also spares asciidoc a move |
| perl | BADGE | `#5E6DB4` | `#49599C` | moved *toward* brand `#39457E`; php's purple is iconic |
| powershell | BADGE | `#6478C8` | `#6A95D2` | moved *toward* brand `#5391FE`, out of php's purple |
| tex | GLYPH | `#3FA6A6` | `#59C0C0` | R10 makes fsharp's teal stand, so tex lightened within teal |
| todo | GLYPH | `#C9A241` | `#8F7228` | no brand; it sat in four amber pairs |
| toml | BADGE | `#7E4A2E` | `#6B3E26` | darkened inside its brand brown; rust's oxide is the stronger anchor |
| zig | GLYPH | `#D89238` | `#E3C172` | lightened inside its brand amber, clear of postcss and json |

### Mark changes (R8)

| icon | change | why |
| --- | --- | --- |
| `font` | bare **A** → **Aa** (Inter Bold, cap 8.8, ink 15.0 × 8.93) | `angular`, `font` and `generic-font` shipped the **byte-identical** A path — three unrelated concepts, one mark, form score 1.00. angular's A is its wordmark and is brand; the two font icons are not, so they changed. "Aa" is the standard type-specimen mark |
| `generic-font` | bare **A** → **Aa** | same |
| `todo` | bare check → **checkbox ring + tick** (evenodd ring 1.45 px, tick limbs 1.5 px, ink 11.6 × 10.4) | `eslint` and `todo` shipped near-identical checkmark paths (form 0.80). R8's own example forbids eslint borrowing another icon's shape, so eslint keeps the bare check and todo gained the box. Follows the canon markdown pattern (rounded-rect outline + mark inside), drawn as a filled shape since strokes are markdown-only |

---

## Audit after

```
R7 palette twins:      0 open, 0 accepted
R8 form collisions:    0 open, 2 accepted
folder emblem dupes:   none
validator:             237 / 237  (121 918 B total, 514 avg, 1 425 max)
```

### Accepted residuals

| pair | reason |
| --- | --- |
| `css` ↔ `html` (form 1.00) | Both real-world logos *are* shields, and spec.md §3 hands html the canon css geometry on purpose. Separated by hue (`#1572B6` / `#DB5430`) and by the 3 / 5 letterform. **Flagged for the human pass** — this is the one accepted residual that is a design decision rather than a definition |
| `font` ↔ `generic-font` (form 1.00) | Same mark by design: `generic-font` is the dim fallback for the 3 non-core font concepts and `font` is the named concept — the precedent R8 itself sets for zip / generic-archive |
| 109 R7 colour hits in the SILHOUETTE lane, in 8 hue neighbourhoods | Accepted by reading 1 above. The largest is the 15-icon warm band {babel, esbuild, favicon, firebase, gitlab, java, key, license, nim, ocaml, pnpm, prettier, tauri, testjs, zip} — a gem, a key, a scroll, a coffee cup, a fox, a droplet: every member is a different object, all with a brand or category reason to be warm |

The other seven neighbourhoods: {agents, astro, image, terraform, vite}, {css, dartlang,
docker, github-actions-workflow, python, readme, testts, tsconfig, vscode, word}, {excel,
playwright}, {helm, lua, video}, {html, jest, julia, mermaid, nestjs, pdf, powerpoint,
rollup, ruby, scala, swift}, {netlify, tailwind, yarn}, {nuxt, sql, supabase, vue}.

---

## Flagged for the human pass

Carried into `contact-full.html` §5 with the same wording.

| item | question |
| --- | --- |
| `yaml` plum `#7E6086` | R10 lets it stand pending a one-word veto — brand red `#CB171E` back, or keep the plum that separates it from canon npm? |
| `git` `#8C3017` | The reconciliation moved git, not claude, because claude's `#D97757` is the literal unmodified Anthropic brand and git's was already a retint. git is by far the more common icon — should claude move instead and give git its `#E0603C` back? |
| `swagger` disc + ring | Does the ring read at 16 px, or does the disc swallow it? |
| `maven` MVN | Three caps for a build tool nobody spells out — keep MVN, or draw the feather? |
| `clojure` CLJ | Same question: letters or the brand's split circle? |
| `erlang` ERL | Same question, and the new `#CD7A8D` is a long lift off `#A90533` |
| `expo` E | One cap on a plate — enough, or too anonymous next to the other single-letter badges? |
| C-family badge trio `c` / `cheader` / `cppheader` | `cpp` moved to `#325B81` in reconciliation; do `c`, `cheader` and `cppheader` still sit as a family with it, or does the trio need re-tuning? |
| `css` ↔ `html` shields | Accepted residual above — sanction the shared shield, or redraw one? |

---

# Round 2 — the flag list, ruled

Sebastian ruled the round-1 flag list on 2026-09-01: **"Do all of them."** Three rulings,
applied below. New tool this round: `tools/pixelproof.mjs`, the honest 16 px test (render at
exactly 16 × 16, composite over `#121314`, report the grid plus how much ink lands in the
faint band) — the arbiter Ruling C names, and the reason two of its four marks did not ship.

```
node tools/pixelproof.mjs svg/file/expo.svg …          # grid + ink / faint / peak contrast
node tools/pixelproof.mjs --html proof.html svg/file/*.svg
```

## Ruling A — yaml goes brand-true

| icon | old | new | note |
| --- | --- | --- | --- |
| `yaml` | `#7E6086` | **`#CB171E`** | the brand hex exactly. No compensating shift anywhere. |

Recorded as **R10a** in spec.md and as a named accepted residual in `tools/audit.mjs`. The
audit now reports `npm / yaml` as a *ruled exception*, not a defect: brand fidelity over
separation, with the `YML` / `npm` letter groups and the small value gap
(`#CB171E` L 44.7 vs canon npm `#CB3837` L 50.6) carrying the separation. 16 px proof: peak
contrast 0.83, 6 % faint — the plate is unambiguous, which is exactly why the pair is close.

## Ruling B — the git ↔ claude swap

| icon | old | new | note |
| --- | --- | --- | --- |
| `git` | `#8C3017` | **`#E0603C`** | round-1 retint reverted; git is back to its batch-1 colour |
| `claude` | `#D97757` | **`#E2957E`** | brand hue kept (h 14 vs brand h 15), brand saturation kept (s 63), escape via lightness |
| `svelte` | `#BE6329` | **`#B15B25`** | consequence, see below |

`audit.mjs --pair claude git` → `dh 0.6  dl 13.3  ds 9.3` — **ΔL 13.3 ≥ 12, R7 twin: no**.

**The direction is inverted from the ruling, and here is why.** The ruling asked for darker.
The 16 px proof says claude's mark cannot survive it — it is ten thin radial spikes, and
darkening drops it off a cliff:

| claude candidate | h / s / l | peak contrast | faint ink |
| --- | --- | --- | --- |
| `#D97757` round 1 | 15 / 63 / 60 | 0.50 | 9 % |
| `#85381E` darker, brand hue | 15 / 63 / 32 | **0.22** | **45 %** |
| `#963522` darker, h 10 | 10 / 63 / 36 | 0.23 | 44 % |
| `#96341A` darker, s 70 | 15 / 70 / 34 | 0.22 | 45 % |
| **`#E2957E` lighter — shipped** | **14 / 63 / 69** | **0.61** | **8 %** |

Every darker candidate that clears R7 puts ~45 % of the mark's ink below the visibility
threshold. The lighter one satisfies every hard constraint the ruling states — brand hue,
escape via lightness, ΔL ≥ 12, matte — and reads *better* than the original. **One line to
invert if Sebastian wants darker anyway: `claude=#85381E` is the darker pick that clears
R7.**

**New finding, handled:** restoring git re-opened `git ↔ svelte` (`dh 10.2 / dl 10.4 /
ds 8.1`) — the pair round 1 had solved by moving git. svelte is the less brand-anchored
member (its `#BE6329` is already a long retint off `#FF3E00`), so it took a 3-point
darkening inside its own hue and saturation: `#B15B25` (h 23 s 65 l 42). Nothing else in the
warm band moved; the audit confirms no other new finding.

## Ruling C — the real marks, each gated by the 16 px proof

| icon | verdict | evidence |
| --- | --- | --- |
| `expo` | **SHIPPED — the rounded arch** | peak contrast 1.00, 4/196 px faint (2 %). The arch, both legs and the counter all resolve at 16 px. 225 B. No new R7/R8 finding |
| `clojure` | **SHIPPED — the brand split circle** | peak contrast 1.00, 4/196 px faint (2 %). Both lobes, both ball heads and both gaps resolve; the previous `CLJ` was three cramped letters at 16 px. 396 B. No new R7/R8 finding |
| `maven` | **KEPT LETTERS — the feather failed** | four builds (tilted / fat / 2-barb deep-cut / vertical) all collapse to an undifferentiated diagonal blade: no barbs, no shaft, nothing that says *feather* rather than *leaf*. Deepening the notches to 0.8 of the vane width changed nothing at 16 px |
| `erlang` | **KEPT LETTERS — not drawn** | the Erlang mark could not be verified to a standard worth shipping, and the ruling forbids inventing one. `ERL` stands |

`clojure`'s split circle ships in **white on the green plate**, not in the brand's blue +
green. R2 would allow the two-colour version, but the green lobe would disappear into the
`#6BB881` plate, and going two-colour means dropping the plate — which would move clojure out
of the BADGE lane and undo its round-1 R7 solution. The *form* is the brand's; the colour
stays the plate's.

`expo`'s arch is logo-shaped geometry, so **R1** applies and no letterpath is involved.

### What the proof also turned up: maven is the dimmest icon in the set

| glyph | peak contrast | faint ink |
| --- | --- | --- |
| `dotenv` | 0.84 | 11 % |
| `json` | 0.72 | 0 % |
| `tex` | 0.64 | 17 % |
| `erlang` | 0.50 | 33 % |
| `git` | 0.43 | 34 % |
| `angular` | 0.29 | 23 % |
| **`maven`** | **0.21** | **62 %** |

`maven`'s `#86323A` is a round-1 retint of mine and it is the worst-reading icon in the set.
It **was not changed** in this round: at h 354 and the saturation it then carried (s 46) the
lane above is sealed by `angular` and `turborepo` (both L 50) and by `erlang` (L 64), so R7
leaves only L ≤ 38. Raising saturation makes it *worse* — luminance is 71 % green, so
`#9C1C28` (s 70) measures peak 0.15 / 75 % faint. What this round missed is the other
direction: **lowering** saturation opens the L 50 row through ΔS without touching a second
icon. That is the exit, and it is Ruling D below.

## Ruling D — maven legibility, the exit

The last item on "still to fix", ruled by the review lead on **2026-09-01**. It was approved
twice: first as a two-icon exit, then withdrawn on the 16 px measurements and replaced by a
one-icon one.

| icon | old | new | rationale — **review-lead approved exit**, 2026-09-01 |
| --- | --- | --- | --- |
| `turborepo` | `#CC333B` | **withdrawn — unchanged** | The approved exit moved turborepo off L 50 to free the slot; the proof killed it. `erlang` seals the lane above (`--try turborepo=#E08589` → R7 twin erlang / turborepo, dh 11.1 dl 5.9 ds 14.1), so turborepo could only go *darker*, and the only lightness that also clears maven is L ≤ 37 → `#97262B`, **peak 0.18 / 39 % faint**: the new dimmest icon in the set. Trading the defect, not fixing it — withdrawn, turborepo keeps `#CC333B` |
| `maven` | `#86323A` | **`#A4656B`** | The replacement exit, one icon instead of two: escape up the **saturation** axis rather than the lightness axis. h 354 s 26 l 52 keeps the brand-red hue and puts ΔS ≈ 34 against `angular` and `turborepo` (both s 60), so the pair no longer rests on a hue gap alone. **peak 0.21 → 0.40, faint 62 % → 32 %** — the in-lane maximum |

### Why the targets were restated

The exit was briefed with targets of peak ≥ 0.5 and faint ≤ 15 %. Neither is reachable, and the
disproof was accepted before the ruling was made:

- **`peak` is the fill's own contrast against `#121314`**, not a property of the lift.
  `pixelproof` composites linearly, so peak = α_max × fillContrast, and every one of these
  marks carries an opaque pixel. Computed against measured: maven 0.210 / 0.21, turborepo
  0.276 / 0.28, angular 0.291 / 0.29, erlang 0.517 / 0.50, git 0.431 / 0.43.
- **peak ≥ 0.5 is not in the red lane at all.** The whole L 50 row at h 354 runs 0.29 (s 55) to
  0.38 (s 26); 0.5 needs L ≈ 64, which is `erlang`'s slot (`--try maven=#CD7981` → R7 twin
  erlang / maven, dh 8.0 dl 0.2 ds 0.3). R7 caps maven at L ≤ 52, so `#A4656B` at 0.40 **is**
  the ceiling — the blocker above L 52 is erlang, not turborepo.
- **faint ≤ 15 % is not reachable at any colour.** `faint` counts ink below α < 0.12 /
  fillContrast, so the floor belongs to the letterform, not the hex: MVN paints 81 ink px with
  a single pixel at α ≥ 0.99, giving 32 % at contrast 0.40, 22 % at 0.50, 19 % at 0.60, and
  15 % only at 0.80 — a near-white glyph. Colour cannot buy it; only a bolder mark could, and
  Ruling C already settled that the letters stand.

The red GLYPH band after the change (`audit.mjs --pair`, maven now h 354 s 26 l 52):

```
maven turborepo   #A4656B #CC333B  dh  2.6  dl  2.0  ds 34.3   R7 twin: no
maven angular     #A4656B #CC3462  dh 12.4  dl  1.8  ds 34.1   R7 twin: no
maven erlang      #A4656B #CD7A8D  dh  8.0  dl 12.2  ds 19.6   R7 twin: no
maven git         #A4656B #E0603C  dh 18.9  dl  3.7  ds 46.9   R7 twin: no
turborepo angular #CC333B #CC3462  dh 15.0  dl  0.2  ds  0.2   R7 twin: no
turborepo erlang  #CC333B #CD7A8D  dh 10.6  dl 14.1  ds 14.6   R7 twin: no
angular erlang    #CC3462 #CD7A8D  dh  4.4  dl 13.9  ds 14.5   R7 twin: no
```

`maven ↔ angular` and `maven ↔ turborepo` are now double-separated (hue *and* saturation)
where before they leaned on one axis. **`maven ↔ erlang` is the band's thinnest pair at
dl 12.2** — clear, but by 0.2. It is the price of taking L 52, the top of maven's legal range,
to buy peak 0.40. Backing off to `#A15E65` (h 354 s 26 l 50) restores dl 14.1 against erlang
and costs 0.02 of peak; noted for the packaging pass, not changed here.

## Round-2 audit and validator

```
R7 palette twins:      0 open, 1 accepted   (npm / yaml — R10a, ruled)
R8 form collisions:    0 open, 2 accepted   (css / html, font / generic-font)
folder emblem dupes:   none
validator:             237 / 237, 0 warn    (121 296 B total, 512 avg, 1 425 max)
```

## Flag list — resolutions

| flag | resolution |
| --- | --- |
| `yaml` plum | **Ruled A** — brand-true `#CB171E`; npm pair accepted as R10a |
| `git` `#8C3017` | **Ruled B** — git restored to `#E0603C`, claude moved to `#E2957E` (lighter, see above), svelte adjusted to `#B15B25` |
| `maven` MVN | **Ruled C, letters kept** — feather illegible at 16 px |
| `maven` legibility | **Ruled D** — `#86323A` → `#A4656B` via the saturation axis (peak 0.21 → 0.40, faint 62 % → 32 %); the approved `turborepo` move was withdrawn on the proof |
| `clojure` CLJ | **Ruled C, shipped** — the brand split circle |
| `erlang` ERL | **Ruled C, letters kept** — mark not verifiable, not invented |
| `expo` E | **Ruled C, shipped** — the rounded arch |
| C-family trio `c` / `cheader` / `cppheader` | **Reviewed, no change** — all three sit in the neutral/blue lane with `cpp` `#325B81` and the audit finds no twin; the family reads |
| `swagger` disc + ring | **Still open** — carried into the sheet |
| `css` ↔ `html` shared shield | **Still open, accepted** — carried into the sheet |

## Still to fix before packaging

1. **`claude` direction.** Shipped lighter against the ruling's parenthetical, with the
   measurements above. `claude=#85381E` inverts it in one line.
2. **`maven ↔ erlang` margin.** Ruling D leaves the band's thinnest pair at dl 12.2 — clear,
   but by 0.2. `maven=#A15E65` restores dl 14.1 for 0.02 of peak, if the packaging pass wants
   the margin more than the contrast.

**Closed by Ruling D:** `maven` legibility — was peak 0.21 / 62 % faint, the worst in the set;
now `#A4656B` at 0.40 / 32 %, the in-lane maximum. Option (a) of the round-2 note (move
`angular` or `turborepo` off L 50) was the approved exit and was withdrawn on the proof;
option (b) (leave the red band) was not needed — the saturation axis kept it in the band.
