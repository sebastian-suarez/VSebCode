# VSebCode — Board

Personal macOS build of VS Code with the Xcode-like UI baked into source, replacing the
injection stack (Custom UI Style + Vibrancy extensions + JS shims) maintained in
`~/Projects/Settings`. Detailed checklists: [Tasks.md](Tasks.md).

**How this repo works** (D7): umbrella repo — docs here, code in two pinned submodules.
`vscode/` = fork of `microsoft/vscode` (branch `vsebcode`, base 1.126.0 @ `7e7950df`); all
editor changes are normal commits there. `vscodium/` = read-only pin of `VSCodium/vscodium`,
a patch library imported wholesale per D8 (minus the gallery patch) — we do NOT build through
its harness. Builds run inside `vscode/` with vscode's own npm/gulp tooling, executed by
Sebastian by hand (including the watch). Umbrella HEAD always records the exact
(vscode, vscodium) commit pair.

## Now

- **M10 — NeoVim keyboard UX — OPENED 2026-09-01, design phase (D19)**: first-view
  prototype BUILT + published — `m10-nvim-prototype.html` (umbrella root, untracked
  until approved) → artifact
  https://claude.ai/code/artifact/e76ac6e0-22f4-494b-8e72-6325de42466c (private,
  label `first-view-v1`; same file path re-publishes to the same URL). Authored per
  the D19 exception (Fable-5-max agent; macos-design + design-philosophy +
  artifact-design skills), session-reviewed: geometry contract (46/86/24/25+1/22,
  300 rail, 34×28 pills @20px, lights {18,16}), single-painter rail coat
  rgba(25,26,27,.30) + blur(52)/sat(1.9), palette resolved from the 2026-dark
  include chain, real `inlineTitleBar.ts` content, coherent numbers (Ln 35/Col 48 =
  the block cursor's true position; +6 ~2 −1 ↔ drawn gutter hunks; SCM badge 3 ↔ 3
  git-flagged rows), headless-render verified, zero external refs, no attribution.
  Flagged-call VERDICTS (Sebastian delegated 1–3 to the session, ruled 4–5
  himself, 2026-09-01): (1) git tints = THEME-RESOLVED (modified `#e5ba7d`;
  rule: every mockup color resolves through the 2026-dark chain); (2)
  line-height = the REAL 21px (`fontInfo.ts:14` golden ratio 1.5 × fontSize 14
  on mac) with a taller window — the 800px height was a tilde-spec, nothing
  gets cut; (3) staged active-scope guide DELETED — honest absence; demo it in
  a later view whose cursor sits inside a real block; (4) caption stays as
  mocked (dim #8C8C8C, true-center) — M10 design intent, product change at
  implementation; (5) NEW, Sebastian live: sidebar rail FULL HEIGHT owning the
  bottom-left corner, statusbar starts at the editor column's left edge (the
  NORMAL block was clipped by the corner radius; Xcode anatomy) —
  implementation-side grid surgery recorded in Tasks § M10. Fix round LANDED
  same day (same Fable-max agent; session re-review: render + greps green —
  single coat, `#e5ba7d` in / `#E2C08D` out, 21px, staged guide gone, no
  attribution/external refs); **v2 published to the same URL**, window now
  1280×870 exact-fit (editor body 777 = 37×21; hairline lives INSIDE the 25px
  breadcrumbs constant). Round 3 same day (Sebastian: sidebar content "too
  close to the borders"): view-CONTAINER padding 6px top / 8px sides — rows
  read 16px from the rail edges; VSCODE header, tree labels and the hint
  footer align on one x20 text column; **v3 published, same URL**.
  **APPROVED by Sebastian 2026-09-01 — first view CLOSED at v3**; prototype +
  docs committed umbrella-side. Follow-on directive same day: complete FILE
  ICON SET in the mockup icons' style → recorded as M11/D20. Later views
  GREEN-LIT (Sebastian, 2026-09-01), build order: (1) telescope overlay →
  (2) which-key → (3) flash jumps → (4) oil.nvim-style buffer file-ops
  (oil later built, then WITHDRAWN same day — § D19 amendments round 7);
  trouble list + harpoon revisit stay candidates, not green-lit (harpoon
  excluded from view 1 by choice). One page + own artifact URL per view from
  here on. **View 2 (telescope) APPROVED at v1 (Sebastian, 2026-09-01 —
  all 5 flags approved as mocked; the session's cursor-row note not taken
  up, stays as mocked)** →
  https://claude.ai/code/artifact/6eedd738-db38-4d42-8745-ca0ed2c936cc
  (`m10-nvim-telescope.html`, committed on approval; same path = same
  URL): find_files in the shipped picker vocabulary over the v3 scene —
  920×405 prompt-bottom horizontal panel @ 0.90 coat, no backdrop dim,
  lualine INSERT handoff, real 184/8196 fuzzy corpus, byte-real
  `titlebarPart.ts:90-107` preview @ 21px; verdicts durable as § D19
  amendments round 2 (the overlay vocabulary is now the M10 panel
  language). **View 3 (which-key) APPROVED at v1 (2026-09-01 — round
  DELEGATED by Sebastian: "take the decisions that fit the best";
  session ruled the map + all 4 flags approved as mocked, durable as
  § D19 amendments round 3)** →
  https://claude.ai/code/artifact/1c72b816-6134-4164-be0a-73befd1bfa49
  (`m10-nvim-whichkey.html`, committed on approval): 964×83 leader
  panel bottom-anchored to the editor column in the approved overlay
  vocabulary, `SPC` breadcrumb in the title row as our showcmd,
  statusbar v3-verbatim, first leader map `,` `/` `b` `d` `e` `f` `g`
  `w` (3 leaves + 5 groups, grounded-only). **View 4 (flash jumps)
  APPROVED at v1 (2026-09-01, delegated round — session ruled: dim =
  editor-foreground fade to the comment tone, no cmdline echo, flat
  accent label cells, all matches equal, g-excluded alphabet; § D19
  amendments round 5)** →
  https://claude.ai/code/artifact/18f2d6b7-5a9c-4ba0-8f28-59586cf45627
  (`m10-nvim-flash.html`, committed on approval; r4 baked pre-publish):
  `s hei`, 9 machine-verified real matches. **View 5 (oil) WITHDRAWN
  (Sebastian 2026-09-01, ruled in the animation session — "I dont like
  Oil, remove its mockup and anywhere that references it"): built +
  session-approved earlier the same day, then mockup DELETED and oil
  dropped from M10 scope and the implementation pipeline — § D19
  amendments round 7.** **GREEN-LIT QUEUE CLOSED** — views 2–4 built,
  reviewed, approved, published; view 5 built then withdrawn. **Geometry
  revision r4 same day** (Sebastian: tabs "too big"): tab row → stock
  35px, windows → 1280×859 — § D19 amendments round 4. **Font r6 same
  day**: UI face → GEIST (Sebastian confirmed live), all five views
  republished with it embedded — § D19 amendments round 6; research
  page https://claude.ai/code/artifact/974a0e56-c878-4852-84c8-b7826dbf4de5
  **Animation round APPROVED (Sebastian 2026-09-01, ruled in the
  animation session: "all flags approved as built, commit it" — all 6
  flags stand; § D19 amendments round 8)**: motion layer on views 1–3
  authored by session vsebcode-15, session-reviewed here
  (transform/opacity only, PRODUCT vs PRESENTATION values documented
  in-file, reduced-motion variants, safe JS), republished pre-verdict
  (approved state = published state), trio committed with the doc fold;
  flash gets the motion pass next (the vocabulary lives in the three
  files). **Hints r9 same day** (Sebastian: text under the sidebar
  cropped by the window shape; follow-up ruling "Drop it"): rail-hints
  overflow fixed by DROPPING the `d delete` hint at stock size — the
  session's interim metric shrink overruled — then the line
  RIGHT-ALIGNED to the rail's 16px inset (second follow-up: "still
  getting too close to the rounded edge"); all four views republished
  — § D19 amendments round 9; found + fixed in passing: the flash
  artifact was still serving the pre-Geist r4 page (the r6 republish
  never landed there), now current.
  **IMPLEMENTATION SCOPED 2026-09-02 — D21**: the approved design
  ships as milestones M12–M16 + gated vim tail M17–M19 (ratified plan
  + source-survey facts in
  [m10-implementation-plan.md](m10-implementation-plan.md)); trouble
  list · harpoon stay candidate views, revisitable. Design phase
  closed. **M12 SLICES ALL LANDED 2026-09-02** (own session): five
  delegated commits `f881c9a`→`fcbe249` on the fork, pin bumped —
  stock 35px tabs (zoom-overflow bug dead), Geist v1.800 vendored
  (woff2 wired into both loader maps + both hygiene lists, OFL
  entries), caption `#8c8c8c` + equal-rails true centering (splash
  constant mirrored), view-body 6/8 inset via new opt-in
  `contentPadding` Part option (rows x16, headers x20), relative
  numbers + active bracket-pair guide as mac-native defaults (the
  "slim git gutter" proved a no-op: stock width 3 = the mockup).
  Session dev battery green over CDP on a virgin profile. **M12 FIX
  ROUND same day (Sebastian's checkpoint verdicts, 4 more commits
  `d8c198c`→`cdb8f18`)**: light-mode breakage root-caused + fixed
  (`window.systemColorTheme` → `'dark'` default, both sites — vibrancy
  no longer follows a light OS); S4 container padding SUPERSEDED →
  6/8 inset moved to each sidebar pane's body (headers full-bleed,
  rows x16) with search's lopsided 2px margin fixed to symmetric 8px
  + width math re-tied; the daily settings.json BAKED as product
  defaults (120 keys, 19 skipped with receipts; resolves the
  git-blame flag); temporary `vsebcode.uiFontExperiment` setting =
  geist · sf-pro · sf-pro-light for the live font call (delete on
  ruling), joined by `vsebcode.uiFontSizeExperiment` (R5,
  `b70087d`) — one number scaling the whole UI off the vscodium
  patch's ratio machinery, per-surface keys still winning theirs.
  VSCodeVim ruled as the vim vehicle (D21 amendment).
  All battery-verified live incl. main-process themeSource proof in
  a light OS. **FONT RULED same day (D19 r10): SF PRO at default
  size** — both experiments retired + Geist unvendored as a pure
  deletion (`e246e6d`, R6 in Tasks § M12). **FIX ROUND 2 same day
  (second checkpoint verdicts, 4 commits `bdcdd6b`→`b1640cf`, R7–R10
  in Tasks § M12)**: tab row BACK at the 46pt band — S1 reverted
  byte-identical, the r4 stock ruling reversed by verdict (D19 r11);
  the zoom-overflow bug solved the NEW way instead — everything the
  fixed band shows (pill box/glyph/radius, tab label, tab file icon)
  now divides by `--zoom-factor`, so band content holds physical size
  at every zoom (composite-bar stale-width cache found + fixed via a
  next-frame remeasure); tab strip transparent —
  `editorGroupHeader.tabsBackground` joins the D14 alpha-0 set, the
  editor column reads as one surface (inactive-tab fills kept, flagged);
  his "gitlens" = the built-in SCM/Graph view (no GitLens installed
  anywhere) and its + explorer's selection-centering complaint
  root-caused as INK sitting ~1px low in the 22px row (the M2 tab
  half-leading skew) → −1px lift on the row text container, all
  sidebar lists. Batteries green at zoom 0 and live-flip 1.728.
  **FIX ROUND 3 same day (third checkpoint verdicts + two question-tool
  rulings, 3 commits `20e0e77`→`14bdc90`, R11–R13 in Tasks § M12; D19
  r12)**: rail-header line REMOVED (mockup-true — the seam keeps only
  the editor-column hairline); the strip's transparency REDONE as the
  ask meant it — `tabsBackground` moves to the 0.30 TRANSLUCENT set
  (byte-same coat as the sidebar, vibrancy through the strip) with the
  M1 opaque backstop pushed down to the editor body (+ empty-group grid
  boxes; the dimmed-group opacity trap dodged), and inactive tabs ruled
  NO-FILL (both variants alpha-0; active stays solid); SCM Changes
  gutter collapsed (input/button x40→x24 w+16, list-mode resources
  x56→x24; tree mode/graph/explorer untouched; inline-padding defeated
  via absolute positioning, indent-proof). 2×2-split pixel scan: zero
  translucent editor-body pixels. **FIX ROUND 4 same night (fourth
  findings, 2 commits `13f3363`+`8371053`, R14–R15 in Tasks § M12; D19
  r13)**: his alignment doubt MEASURED TRUE — traffic lights centered
  on 22 vs everything else on 23 (our `{18,16}` constant → y 17) and
  pills on fractional x (a VENDORED `.icon` margin bleeding 1.99px into
  the pill advance + a half-pixel flex-centering leftover → gated
  margin-clear + `column-gap` + `round(down,100%,2px)` container: pills
  integer at every sidebar width, advance exactly 36); SCM
  guide-overlap ("tired of this bug") root-caused — guides draw at the
  tree's indent stops, content sat left of them — and RULED "Flatten
  the pane properly": the Changes view is ONE x24 column (input,
  button, group headers, list-mode resources), repo rows keep the only
  real twisties, guides not drawn in the pane at all; group folding
  preserved (opacity-0 twistie keeps the sticky-row click path);
  supersedes R13; resolves flag 14. NOTE: that round's pin bump
  committed ALONE — board/Tasks carry live edits from concurrent peer
  sessions (M20 icons v2 + the D23 Tart-VM reference), so doc state
  rides the shared working tree. **FIX ROUND 5 2026-09-03 (fifth
  findings, 2 commits `30fe602`+`f021915`, R16–R17 in Tasks § M12; D19
  r14)**: his SCM misalignment MEASURED TRUE — accordion banner title
  x32, commit box + button x35 (stock 11px inner padding), list ink
  x24 — fixed onto ONE column: input/button padding zeroed (boxes
  24..271, right edge already the badge line) and the M3 pane-header
  12px → 4px so section titles land x24 in EVERY sidebar view
  (mockup's one-text-column; twistie hangs in the gutter; resolves
  flag 3). His "visually confirm the traffic lights" exposed R14 as an
  OVERSHOOT: compositor pixels show macOS centers the circles at
  y+6.75 (not y+6) — y:17 rendered 23.75 (0.75 LOW) where old y:16
  was 22.75 (0.25 high); fractional y truncates (16.25 probe =
  16 pixel-identical), so RULED BY MEASUREMENT back to y:16, the
  closest the integer API gets; comment records the model. Verified
  live in the Tart VM (D23): one x24 left column + x271 right column
  across the pane, explorer headers x24 with tree nesting intact,
  pills 36-advance integer yc23, tab icon/close 23 + label 22, lights
  22.75 vs pill ink 23.0; screenshots delivered. **CHECKPOINT
  APPROVED 2026-09-03 ("Approved, commit")** — round-5 surfaces
  stand; 18 parked flags stay in Tasks § M12; both repo pushes his.
  Pin bump committed ALONE at landing; the doc fold committed on the
  verdict (shared-tree state incl. the peer D23 records — all
  post-ruling). M12 remains open only for the packaged-verification
  close-out (markers list in Tasks § M12 Close).
- **M20 — Icon set v2 — OPENED 2026-09-02, style phase (D22 PENDING)**:
  Sebastian's verdict on the shipped M11 set: NOT consistent — reads as
  different styles in one set; letter icons share no alignment/size/weight;
  generic drawings where brands own logos (editorconfig shipped as generic
  sliders); folder emblems too small to differentiate. **NON-BLOCKING by
  directive**: gates nothing, M11 keeps shipping as the testing set; v2
  integrates in ONE swap commit only when finished. Workshop
  `m20-icons-v2/` (umbrella): [style-guide.md](m20-icons-v2/style-guide.md)
  authored — v1 failure autopsy (root cause: the v1 spec legalized variety —
  3 archetypes mixed, per-icon optical letter sizing, optional brand
  fidelity, micro-emblem folders), binding craft laws L1–L10 (one
  construction recipe; brand-first with verification duty; rigid letter
  system; 16-grid zoom-don't-scale authoring; ≥8.5px centered folder
  glyphs), FOUR candidate styles for D22 (A Chips / B Brand true / C Wire /
  D Duotone; session recommends B), and the production plan — M11's
  inventory/associations/pins REUSED verbatim (payload-only swap, far
  cheaper than v1). 8-subject × 4-style samples + comparison sheet
  delegated (samples untracked until D22, M11 precedent). **Round 1 RULED
  same day**: samples built + sheet published →
  https://claude.ai/code/artifact/08b4a297-9ebc-428f-b144-2ba16e33adb8
  (`samples/sheet.html`, same path = same URL); Sebastian: brand-true
  DIRECTION confirmed, ALL FOUR candidates REJECTED — freehand marks "not
  even close to the real ones", "use another style system". L2 HARDENED:
  mark geometry derives from official vector artwork (press-kit/repo SVGs,
  simple-icons CC0, source-theme assets) — freehand geometry for a brand
  that owns a mark = hard reject; per-icon provenance duty. Round 2 = four
  TREATMENTS over one shared faithful master per subject (R1 true color /
  R2 one tint / R3 chips / R4 tamed color), 12 subjects (8 + react ·
  eslint · prettier · rust as fidelity stress tests); samples delegated,
  round-1 sample dirs parked as rejected history. **Round 2 built +
  RULED 2026-09-03 — D22 CLOSED: R1 TRUE COLOR** (+ prettier rider:
  16px-hostile official marks ship as readable reductions). One master
  per subject from the brand's own artwork (byte-level derivation gate
  proves the four treatments shared geometry); fidelity gate honest:
  10/12 "IS the logo", editorconfig solid-silhouette qualified, prettier
  the ruled reduction. Sheet republished same URL (`round2-faithful`).
  Recipe card locked into the guide (§5); guide errata from both rounds
  folded in (L5 1.2px official floor, L6 achromatic exemption, L8 2KB
  advisory, R2-folder neutral-white rule). **PILOT BUILT 2026-09-03
  (pilot session, delegated; gates re-run + proofs reviewed by the
  session) — SEBASTIAN GATE PENDING**: samples workshop committed
  (`2fef461`; session calls — sources-svg + round1-rejected both
  tracked); 24 icons untracked in `pilot/` + production toolchain
  `tools/`: 10 carried masters byte-identical (asserted), 6 autopsy
  offenders rebuilt from official artwork (npm square lockup ·
  dotenv ".E" rider reduction · yaml's real YA/ML lockup · git
  diamond · go wordmark · vue two-tone), 4 folder pairs closed+open
  (src · node · test · docker). All gates green: check 0 fail,
  16px proofs 19+5 marginal, twin audit 0 twins (4 blues clear),
  0 typeset letters. Pilot sheet →
  https://claude.ai/code/artifact/a6ff6bf2-1af0-4877-b5b4-f059239ec0d7
  — 13 flags presented. **GATE RULED same day: 22/24 APPROVED as
  built** — ratified: open-folder construction (shade formula, mark
  crosses the seam), color source-of-truth tiebreak (brand-colors
  wins primary, artwork wins secondary), dotenv ".E", yaml faithful,
  vue dark half, folder rulings; errata folded into the guide (§5 ×2
  + L5 gestalt). REJECTED: docker + editorconfig ("definitely NOT
  the docker or editorconfig logo") — D22 fidelity AMENDED for the
  two: the 3+1 deck lost the cargo pyramid, the silhouetted mascot
  lost the drawing. Fix round delegated + running (mascot rebuilt as
  drawn-feature rider reduction; deck densified at official box
  geometry, candidates measured, agent stops on a tie; other 22
  byte-frozen, asserted). Then: session review → republish same URL
  → his re-look at the two → pilot commit → slices. Details + resume
  in Tasks § M20.
- **M4 — Branding & marketplace**: full VSebCode rebrand (D2) + VS Code
  Marketplace (D3). Theme rider resolved: Dark 2026 became the product default
  via D15. Known inputs from earlier milestones: `!!APP_NAME!!`/`!!ORG_NAME!!`
  vscodium placeholders (UI + the 21 pre-existing build-script test failures),
  `!!GH_REPO_PATH!!` announcements 404, icons via Nano Banana Pro (`agy` CLI),
  and the `.vscode-oss` dataFolderName SHARED with daily VSCodium — the
  packaged fork lists the daily's extensions (vscode-icons) as installed
  until D2's `.vsebcode` flip separates them (M11 acceptance find,
  2026-09-01; cousin of the M3 `~/.code-oss-shared` recents leak).
  **M4 now also GATES the M10 vim tail M17–M19** — the ruled vehicle
  (marketplace vim extension, D21) needs D3's gallery baked

## Next

- **M5 — Signing & updates**: Developer ID signature, updater story

## Later
- **M8 — Claude ghost text**: inline completions backed by Sebastian's Claude
  subscription (no API-key billing). RESHAPED by D16 and emptied of substrate by
  M9: the in-tree Agent-SDK glue is gone — a future design session decides its
  own vehicle (bundled extension is the natural candidate; the editor
  inline-completions ENGINE was deliberately preserved through M9). Claude has
  no FIM API — prompted-completion design + latency prototype first. *Recorded
  2026-08-31 (D12); reshaped by D16.*
- **M6 — Sync ritual**: rebase `vsebcode` onto the next stable tag, bump pins (see README)
- **Settings repo cleanup**: strip the hack block from `settings.json` once M1–M3 land

## Done

- 2026-09-02 — **M11 complete — VSebCode icon theme (D20), shipped as product
  default**: own flat-matte icon set in the M10 mockup language, **1,779
  icons**, default file icon theme of the fork; picker = VSebCode Icons +
  None. Arc: 3-source merged inventory (1,534 concepts; Material 35.4M +
  vscode-icons 24.5M [naming reference] + Great Icons 2.3M, pinned upstream
  commits) → NBP pilot via `agy` (raster→trace REJECTED on 16px +
  file-weight evidence) → gate: NBP sheet B as style bible, production
  HAND-AUTHORED SVGs (Inter-Bold letter PATHS, per-icon optical sizing,
  <2KB target) → six review-gated batches (237 SVGs; rulings R1-R11) →
  reconciliation + assembly (audit 0; fileNames-shadowing bug caught) →
  fork packaging `14023da` (built-in `extensions/theme-vsebcode-icons`,
  default flipped at BOTH hardcoded sites) → acceptance-session rulings:
  AI-name file icons KEEP; stock themes OUT — theme-seti `1dbd8e5` + the
  exposed vs-minimal `80720c4`; "vscode-icons still installed" root-caused
  to the shared `.vscode-oss` dataFolderName → recorded as M4 input →
  coverage REOPENED (D20 amendment 2, "FIX IT"): 18 bespoke long-tail
  slices → assembly v2 (specific-beats-general, 54+11 pinned verdicts,
  1779/1779 gates green, sheet v3) → v2 packaging `4129e69`, branch pushed
  → runbook EXECUTED by the session on Sebastian's "Do it yourself":
  compile+markers green, dev + packaged virgin boots both applied the
  theme out of the box (state-DB proof), long-tail bespoke + folder
  closed/open swap verified live over CDP, bundle carries 1,779 SVGs with
  zero seti residue; screenshots delivered. **PASS — Sebastian 2026-09-02
  ("Close it")**. Follow-ups live elsewhere: `.vsebcode` dataFolder split
  (M4); daily-driver `workbench.iconTheme` drop + vscode-icons extension
  uninstall (settings follow-up, Tasks § M11 tail); orphaned seti-ui block
  in tool-regenerated ThirdPartyNotices.txt (one-block cut on request).
  References: full-set sheet
  https://claude.ai/code/artifact/e3f8fc9e-9d7d-4ce3-98ba-f39b7a24cb83 ;
  workshop `m11-icons/` (spec.md, reconciliation.md, tooling, worklist)
- 2026-09-01 — **Agent-skills install audited + vendored (D18)**: 20-skill install
  (8 microsoft/vscode + 12 emilkowalski/skills) audited against `8e8353bf` —
  lock-tracked content verified byte-identical to live upstream main (gh api),
  every post-baseline delta attributable to VS Code team PRs, zero
  malicious/suspicious instructions. Kept upstream's new `!important`
  prohibition; rewrote the three font-token sections to fork reality (delegated;
  diff reviewed); removed `validate-ui-scenario`; committed umbrella-side —
  submodules untouched, no pin change. Same-day follow-up (decisions delegated
  by Sebastian; emil skills untouched): in-tree stale-AI cleanup in `vscode/` —
  ux-theming agents-token rows → fork-accurate text, memory-leak-audit
  chat-leak step dropped (`54962c7`, hooks ON, pushed); vendored copies aligned
  byte-identical; design-philosophy's 3 links repointed through `vscode/`;
  pin bumped; both repos pushed.
- 2026-09-01 — **M9 complete — AI excision (D16/D17)**: 16 delegated,
  diff-reviewed commits on `vsebcode`, hooks ON (`988c87fc3ad`→`b3c3e98a4c7`
  code + `4df1eb7570c` lockfiles; pins `51dfa21`→`6d8ea15`+close): **3,547
  files, +1,414/−806,834** plus −286 lockfile lines. Survey-first per D16 (4
  parallel agents, one session), scope ratified as D17 + C-phase verdicts; the
  execution reordered mid-flight after a mutual-import check (kept-file strips
  + leaf consumers first, provider trees with the roots, machinery last — the
  full site map, hand-offs and phase ledger live in
  [m9-excision-plan.md](m9-excision-plan.md) + Tasks.md § M9). Gone: the three
  D16 roots + 17 more AI trees, the extension-facing AI API (namespaces, d.ts
  block, 39 proposals; unknown manifest contribution points verified silently
  ignored), sessions-window machinery to the last context key, Copilot
  entitlement/policy/managed-settings + default-account stack, MCP at every
  layer, CLI `chat`/`agent`/`--agents`, 4 npm deps + both typings shims,
  smoke/automation/test-mcp harness, AI CI/docs; C3 folded in the two approved
  M3 round-3 hygiene fixes (aux-bar repaint rule, dead composite-bar colors).
  Zero new test failures at every step (stash-verified baselines; remaining
  failures pre-date M9: vscodium font tests ×4, `!!APP_NAME!!`/`!!ORG_NAME!!`
  placeholder artifacts, one upstream disposable leak). Notable saves during
  review: proxy-identifier pairing (ext-host startup throw), the
  `onboardingVariationA` module-level product assert (startup crash), live
  notebook inlineDiff stack kept, action-widget header background restored
  (had silently broken with the chat color), webContentExtractor eager-get
  main-process crash avoided. Acceptance: dev boot approved; packaged
  bundle marker-greps all green (AI absent, M1–M3 markers at packaged-era
  counts, shipped product.json clean); virgin .app pass approved — **M9
  CLOSED**. Accepted inert leftovers catalogued in Tasks.md § M9 tail.
- 2026-08-31 — **M3 complete — tree & type polish + design-as-default** (four slices +
  three checkpoint fix-rounds, all delegated and diff-reviewed, hooks ON; pins
  `6bef040`→`a75746d`, final vscode `6f2061ab8cf`): `fff7895` native sticky clip var
  (kills `tree-sticky-mask.js`), `9237487` source-list sidebar CSS + transparent
  sticky colors, `b679985` search toggle anchor (dead padding rule dropped per D14),
  `2c380fb` HN UI product font (kills `hn-weight-shift.css`), `bf73bb4` five visual
  fixes (breadcrumbs hidden-state −26px bug, safe-center pills, transparent
  accordion headers, 16px caption codicons, sticky hairline+fade), `d350494` D15
  defaults (titlebar pair, activity bar top, tree 16/always; Dark 2026 already
  default), `d5e6a6e` main-process native fallback + Dark 2026 first-frame palette,
  `fe36ad4` banner above the statusbar + bare sticky, `6370b80` aux bar hidden
  (the real "chat window"), `6f2061a` single-painter material (uniform 0.3
  everywhere). Acceptance: virgin dev instance approved; packaged virgin .app
  approved (carries M2's one-time packaged verification; bundle marker-grep-verified
  first). Both injection shims retired; Custom UI Style + Vibrancy uninstall +
  settings reduction = Sebastian at daily-driver switch per settings-m3-reduction.md.
  Learnings recorded: this fork's watch never emits (esbuild transpile patched off —
  compile by hand + verify out/ markers before launching); packaged executable is
  `Contents/MacOS/Code - OSS`; shared-storage recents leak across profiles.
  DEFERRED FIX (Sebastian at the packaged pass): the fixed-physical 46pt bar makes
  tab text/icons overflow at higher zoom levels (bar shrinks in CSS px while glyphs
  grow) — future slice: clamp or scale the physical constants under zoom
- 2026-08-31 — **M2 complete — workbench layout in source** (six slices + two gate
  refinements, all delegated, diff-reviewed, hooks ON; pins `a292612`→`b0c05c1`):
  `7f3a2be` zoom/gate infra (`InlineTitleBarLayout`, `--zoom-factor`, D13 gate class),
  `ef54f60` 46pt tab row + sidebar header 46/zoom with fixed 24px caption (D11; the
  70px site was `PartLayout.HEADER/TITLE_HEIGHT`), `e24dd1b` config-semantics gate
  (`isCustomTitleBarDisabled`) + caption keyed off `Part.hasHeaderArea`, `17f5378`
  view-switcher pills (34×28/20px, JS width math via `getCompositeBarPadding`),
  `1a7b14c` −1px tab-text lift, `8c35fbd` honest 25px breadcrumbs row, `2811166` drag
  surfaces + nosidebar clearance (Sebastian's live find at the checkpoint) + banner.
  Acceptance: CDP structural battery all-green at zoom 0/±1/±2, gate flips live both
  ways, Dark 2026 composing with D10 alpha; Sebastian's dev-instance visual pass
  accepted. `zoom-css-vars.js` superseded. Tails: settings.json reduction = Sebastian
  applies at daily-driver switch (settings-m2-reduction.md); packaged verification
  rides with M3. Checkpoint learnings recorded (launch skill needs `TMPDIR=/tmp`;
  drag-caveat attribution resolved: live surfaces = caption row + statusbar)
- 2026-08-31 — **Layer pocket resolved — hygiene arc complete (874 → 0, hooks ON
  everywhere)** (delegated; diffs reviewed): `166727b` workbench-layer rewrite — 8
  base/editor files byte-identical to pre-patch upstream again, their 369 vendored
  lines now in `workbench/browser/media/uiCustomFontWidgets.css` (provenance + rebase
  notes in the header; cascade audit clean). `f84e5e9` loads it in component fixtures.
  `913e32d` drops codicon.css's duplicate sidebar rule (no-op proven via import order).
  codicon full relocation REJECTED on audit evidence: its early load position resolves
  ~110 equal-specificity ties, some reachable — its 2 remaining vendored rules stay by
  decision; fragility recorded for M6 reimports
- 2026-08-31 — **Post-gate follow-ups landed** (delegated; diffs reviewed; hooks ON):
  `59c5366` sweeps the remaining vendored ui-custom-font CSS — 18 files pure-whitespace
  reindent (vendored provenance verified against the pre-patch tree) + 7 vars → 618/874
  errors cleared, unknown-variable class extinguished. `4efaa11` drops the
  chat-simulation ignore rule and dead `dumpFailureDiagnostics` (+ its newly-unused
  `fs` import). Remaining: 244 errors across 8 base/editor-layer files hit stylelint's
  layer-checker (`.monaco-workbench` below the workbench layer) — decision pending;
  `codicon.css` found silently hygiene-exempt
- 2026-08-31 — **Pre-M2 gate + M7 fully closed** (both delegated; diffs reviewed; hooks
  ON, no `--no-verify`): `64b030dc` brings the vendored ui-custom-font CSS under hygiene
  (tabs reindent, whitespace-only; 6 vars registered — 3 more than briefed, required to
  pass). `4553778` deletes the chat-simulation harness FULLY per Sebastian's verdict —
  incl. its 3 dependent smoke suites (agents-window coverage consciously dropped), the
  Copilot helpers in smoke utils, npm/eslint/skill wiring — and fixes the dangling
  copilot-instructions links (−8,924 lines). Untracked `.claude/CLAUDE.md` symlink
  removed. Smoke typecheck + targeted eslint green. Fallout: 23 more CSS files carry the
  same hygiene residue (incl. M2/M3-path `paneCompositePart.css`, `searchview.css`) —
  sweep pending approval (Tasks.md)
- 2026-08-31 — **M1 complete (redo per D9, finished per D10)**: Phase A `2875caf`/`2b18b09`/
  `0773be2` (hiddenInset + inset lights, under-window vibrancy + transparent window, splash
  guard), Phase B `81f7eaa`/`7d29890` (transparent workbench root with editor/panel/
  statusbar pinned opaque, statusbar drag), D10 `f727c45` (30% translucency baked at theme
  resolution for side rail + titlebar — value-level, so list bodies/sticky scroll/splash/
  aux bar inherit; survey fallout in Tasks.md). Final pin `636a69b`. Acceptance: Sebastian's
  visual pass approved on the dev instance and a bundle-verified packaged build — no
  settings anywhere; the injection stack's window look is fully superseded. Same-day
  housekeeping: lockfile refresh `cc871b7`/`cecf1e9`, stray root lockfile deleted,
  `.obsidian/` gitignored, `!!APP_NAME!!` literal surfaced for M4
- 2026-08-28 — Prereqs: gh 2.98, rustup (Rust 1.98.0), jq 1.7.1, Node 24.19 (≥ pinned 24.15),
  full Xcode, 361 GB free
- 2026-08-28 — **Rollback**: harness-era M0/M1 rejected on Sebastian's manual review. Old
  VSCodium-fork repo deleted (by Sebastian), local tree wiped. Docs and the M1 patch file kept
  in a session backup; reusable knowledge carried into these docs
- 2026-08-28 — **Reset to M0 start under D7**: `microsoft/vscode` forked →
  `sebastian-suarez/vscode` (branch `vsebcode` @ 7e7950df); umbrella
  `sebastian-suarez/VSebCode` created (public) with real README + description; submodules
  pinned (vscode @ 7e7950df / 1.126.0, vscodium @ d14478d)
- 2026-08-29 — **D8 executed**: 41 VSCodium stock patches imported as per-patch commits,
  vscode pin → `58b6f34`; `00-settings-gallery` skipped. Copilot **agent host** gutted by
  patch 53 (that's what wrote `~/.copilot` + `agent-host-config.json` on boot);
  `extensions/copilot` sources still in tree (deletion pending approval). Imports committed
  `--no-verify` — vscode's husky hygiene rejects VSCodium's placeholder files
- 2026-08-29 — **Copilot excised** (approved): `extensions/copilot` (4,159 files) + remaining
  build wiring removed in `8e8353bf` (delegated; diff reviewed); also fixed patch 53's
  dangling task ref that broke `npm run gulp vscode-darwin-arm64` task loading; 2.3 GB of
  untracked copilot build junk cleared from disk. `@vscode/copilot-api` dep kept (used by
  agentHost/claude glue). Known red: `npm run compile` still fails from patch-53 residue in
  `src/vs/platform/agentHost/**` — cleanup task pending approval
- 2026-08-29 — **agentHost residue cleaned** (`4dce613`, delegated; diff reviewed): dead
  Copilot CLI agent subtree deleted (43 files, −24k lines), `buildForwardedChatError`
  restored for its live callers, type-only `@anthropic-ai/sdk` imports satisfied via
  `src/typings/anthropic-sdk.d.ts`. `npm run compile` exit 0, typecheck/layers/gulp all
  clean — SKIP_PRELAUNCH caveat retired
- 2026-08-29 — **M0 complete (redo under D7/D8)**: Sebastian drove the whole loop by hand —
  `npm i`, watch, dev boot, `npm run gulp vscode-darwin-arm64`, packaged `Code - OSS.app`
  booted with an isolated short-path profile — and hands-on acceptance passed on the
  patched, Copilot-free tree
- 2026-08-29 — **M7 slice landed** (`6c05931`, delegated; diff reviewed): deleted
  `azure-pipelines/copilot/`, `product-copilot*.yml`, `downloadCopilotVsix.ts`,
  `copilot-migrate-pr.ts`, 2 copilot-only workflows (`chat-lib-package.yml` copilot-only by
  content despite its name); `.vscode/tasks.json` copilot tasks + dangling `dependsOn` refs
  and the `.vscode-test.js` suite entry removed. JSONC/node/gulp checks green. Surfaced for
  approval: 15 dangling MS-CI refs, 7 mixed workflows, launch.json glob, .github copilot docs
- 2026-08-29 — **M7 complete** (`77a7f3ee`, delegated; diff reviewed): eslint copilot-sdk
  allowlist lines, 6 stale doc-comments, all 15 dangling azure-pipelines refs, copilot jobs
  pruned from the mixed workflows (a 4th dead job in pr.yml caught beyond the brief),
  `chat-perf.yml` deleted (cannot function without the extension), launch.json glob +
  `.github` copilot docs removed. Acceptance: compile exit 0, gulp task list loads, and the
  pruned agentHost unit suite executed for the first time — 1927 passing / 0 failing. Small
  post-sweep tail recorded in Tasks.md, pending approval

## Decisions

- **D1 Patch strategy** — *superseded by D7.* Was: changes as `patches/user/*.patch` through
  VSCodium's built-in hook.
- **D2 Branding depth** — **full rebrand**: name VSebCode, bundle id
  `dev.sebastiansuarez.vsebcode`, `applicationName`/CLI `vsebcode`, `dataFolderName`
  `.vsebcode`, url protocol `vsebcode`, app-support dirs, icons (generated with Nano Banana
  Pro via the `agy` CLI). No profile/keychain/TCC migration worth protecting — the old install
  was fresh. *Decided 2026-08-28.*
- **D3 Marketplace** — **Microsoft VS Code Marketplace**, not Open VSX: bake the
  `extensionsGallery` values from the old user-level override
  (`~/Library/Application Support/VSCodium/product.json`, verified 2026-08-28) into the
  build's product config. The marketplace ToS nominally reserves it for official VS Code
  products — accepted for this personal build. *Decided 2026-08-28.*
- **D4 Update cadence** — track stable releases monthly-ish; quarterly acceptable but mind
  Electron/Chromium security fixes. *Default.*
- **D5 Quality** — stable, not insiders. *Decided.*
- **D6** — *dropped 2026-08-28*: window-patch approach details from the rolled-back M1;
  re-decide at the M1 redo brief.
- **D7 Structure & reset** — full rollback to the start of M0 after manual review, rebuilt as
  **umbrella + submodules**: editor work = normal commits on the `vsebcode` branch of an own
  `microsoft/vscode` fork; `vscodium` = read-only pinned patch library; **builds/watch are
  executed by Sebastian by hand**; both repos public; docs carried over and reset. Supersedes
  D1. *Decided 2026-08-28.*

- **D8 Full stock patch import** — apply the entire VSCodium patch library onto `vsebcode`
  *before* M1, so visual work happens on the final layout (VSCodium feel as the base — "VS
  Code like 2018"), **except** the gallery patch `00-settings-gallery` (D3 = MS Marketplace,
  baked at M4). One commit per patch, named `[vscodium] <name>`, mapping 1:1 to the library
  for future rebases (carry each, or drop-and-reimport the updated copy). *Decided by
  Sebastian 2026-08-29.*
- **D10 Baked-in translucency (macOS-only product)** — the translucent look ships as a
  product default like Xcode's vibrant chrome, NOT via user settings: sideBar, sideBarTitle,
  activityBar, activityBarTop AND titleBar (active+inactive) paint at **absolute 30% alpha**
  of their resolved theme color, applied at **theme color resolution**
  (`ColorThemeData.getColor`) so EVERY consumer paints translucent — part chrome, sidebar
  tree/list bodies, sticky scroll, splash persistence, aux bar via shared/derived colors,
  global `--vscode-*` vars — replicating what the settings hexes effectively did; themes
  and setting re-tints keep working, alpha is forced to 0.30; macOS native only
  (`isMacintosh && isNative`), web untouched. *Refined from seam-level to value-level
  2026-08-31 (Sebastian) after the first implementation left sidebar bodies opaque.* Supersedes Phase B's
  "per-part translucent hexes stay user-side". Editor/panel/statusbar stay pinned opaque
  per D9. *Decided by Sebastian 2026-08-31.*
- **D13 M2 geometry gating** — the baked 46pt layout applies CONDITIONALLY: macOS native
  AND the custom titlebar row hidden (Sebastian's daily `window.titleBarStyle: "native"`
  + `customTitleBarVisibility: "never"`; the workbench re-layouts on these config
  changes, so the gate is live). Virgin profiles keep stock geometry + M1 window
  dressing. Window/activity-bar settings stay user-side; baking them as product
  defaults is deferred to M4. *Decided by Sebastian 2026-08-31.*
- **D14 M3 gating & sticky bake** — M3's tree/type cosmetics ship D10-style: **macOS-native
  always** (`.monaco-workbench.mac:not(.web)` CSS scope / `isMacintosh && isNative`), NOT
  D13-gated — virgin profiles show stock geometry (D13) + M1/D10 dressing + M3 trees/font.
  `sideBarStickyScroll.background` + `.shadow` **forced to alpha 0 at theme resolution**
  (value-level, extending D10's mechanism, macOS native only) — the in-source mask +
  transparent sticky fix a real D10 artifact (0.51 double-tint band + rows ghosting behind
  sticky headers in today's virgin builds). The injection spec's search-view padding rule
  (`.search-widget-container`, singular) verified DEAD in the daily VSCodium bundle (real
  class is plural `search-widgets-container`) → dropped; only the toggle-replace anchor
  ports (its `bottom: auto` also dead — the effective piece is `height: 26px` over stock
  `height: 100%`). *Decided by Sebastian 2026-08-31.*
- **D15 Design as default — no configuration required** (supersedes D13's virgin-stock
  stance and the M4 theme rider): a virgin profile boots into the FULL VSebCode design.
  Product defaults (user-overridable, macOS-guarded where the setting is platform-shared):
  `window.titleBarStyle: "native"` + `window.customTitleBarVisibility: "never"` (gate ON
  by default), `workbench.activityBar.location: "top"`, `workbench.tree.indent: 16` +
  `renderIndentGuides: "always"` (the M3 +3px guide shift is calibrated for indent 16 —
  stock 8 puts guides through file icons), and Dark 2026 as the default color theme.
  Packaged-pass criterion flips: virgin profile must show the full design; the D13 gate
  still flips live when a user overrides the titlebar pair. *Decided by Sebastian
  2026-08-31 at the M3 checkpoint ("you should not [add configurations], this should be
  enabled by default").*
- **D14 amendments (M3 checkpoint round 1, Sebastian 2026-08-31)**: sticky-header
  differentiation — `sideBarStickyScroll.background` force moves from alpha 0 to a
  **0.15 tint** of the theme color (no ghosting now that the mask hides rows beneath) +
  1px bottom hairline `rgba(204,204,204,0.2)` + a 140ms opacity fade (strong ease-out,
  transition not keyframes; per-row/scroll-linked motion rejected by the animation
  frequency gate; empty-state `display:none` swapped for `opacity:0` mac-side; shadow
  stays alpha 0). `sideBarSectionHeader.background` JOINS the alpha-0 force set
  (accordion headers on bare translucency — Dark 2026 ships it opaque). Sidebar
  caption/pane action codicons restored to stock 16px glyphs via mac-scoped override
  (the vscodium patch's 11px scaling is daily-parity but reads under-sized next to the
  20px pills; vendored file stays pristine).
- **D16 AI excision — NUKE, supersedes D12** (Sebastian 2026-08-31, M3 checkpoint round
  2: "right now I don't want anything related with AI"): `contrib/chat`,
  `platform/agentHost` (incl. the `node/claude` Agent-SDK glue), `src/vs/sessions`, and
  all AI/chat wiring (views, commands, menus, settings, deps `@vscode/copilot-api` +
  `@anthropic-ai/*` typings shim, `chatDisabled` smoke) get REMOVED — own next-session
  phase (M9) with a dependency survey first (chat services have reverse deps across
  contribs). Interim, landing in M3's round-2 fixes: `chat.disableAIFeatures`
  defaults `true` product-side so the chat window is gone from the UI today; that
  default dies with the setting at M9. M8 (Claude ghost text) is REshaped: no longer
  rides dormant in-tree substrate — future design decides its own vehicle. M6 rebase
  burden drops with the excised surface.
- **D14 amendments round 2 (Sebastian 2026-08-31)**: sticky stack reverts to **fully
  transparent** (alpha 0 — the 0.15 tint of round 1 rejected on sight; hairline +
  140ms fade carry the differentiation alone; the double-painted sticky-row plates
  die with it). **Banner moves to the BOTTOM of the workbench** (above the statusbar,
  macOS native): any top banner steals the traffic-lights row and shoves the pills
  off the lights line — the lights are immovable, so the strip above must always be
  the sidebar header/tabs; banner CSS drops the traffic-light inset, keeps drag +
  no-drag holes. Round 3 (same day) adds the **single-painter material model,
  amending D10**: the sidebar PART alone paints the 0.30 material; interior
  surfaces are alpha 0 — `sideBarTitle.background` moves from the 0.30 set to the
  transparent set, and the sidebar list body stops re-painting `sideBar.background`
  (measured patchwork: caption + tree body composited 0.51 over the part's 0.30
  while pills row + pane headers sat at 0.30).
- **D17 M9 scope ratification** (Sebastian 2026-08-31, at the survey checkpoint —
  four verdicts on the survey's gray areas): (1) **full extended kill list** — every
  AI-named/AI-only surface dies, incl. MCP (contrib+platform+services+CLI
  `--add-mcp`), speech/voice + editor dictation, Copilot entitlement/managed-settings
  plumbing, agent sandbox + network filter, `test/mcp`, deps (`@vscode/copilot-api`,
  `@anthropic-ai/claude-agent-sdk`, `@openai/codex`, `zod`, both typings shims);
  (2) **`browserView` deleted whole** (general embedded browser + its platform tiers
  + webContentExtractor), not stripped; (3) **extension-facing API fully removed** —
  `vscode.{lm,chat,ai,speech,interactive}` namespaces, ~100 type exports, the
  contiguous `vscode.d.ts` AI block, ~39 proposed-API files; no inert stubs
  (verified: unknown manifest contribution points are silently ignored; calls hit a
  contained TypeError); (4) **sessions-window plumbing fully stripped** —
  `isSessionsWindow` (~193 refs), `agentsWindow` config-schema property (~30 uses),
  agents profile/window machinery, `WindowEnablement`. Accepted consequences
  recorded in m9-excision-plan.md §4 (incl. the ~100 kept-file strip sites as new,
  mostly trivial, M6 conflict surface — traded against the deleted trees no longer
  conflicting at all).
- **D18 Agent skills — umbrella-only, audited install** (Sebastian 2026-09-01): agent
  skills live in the UMBRELLA repo alone (`.agents/skills/` + `.claude/skills/`
  symlinks + `skills-lock.json`, committed) — `vscode/` stays AI-sterile: never add
  skill/agent files there (its surviving non-AI upstream `.github/skills/` stay as
  M9 left them). Installed copies get fork-accuracy edits where upstream drifts
  from the fork — first case: upstream's generic `--vscode-fontSize/fontWeight-*`
  ramp postdates base 1.126 (and M9 deleted the agents ramp), so
  ux-css-layout / ux-theming / design-philosophy were rewritten to the fork's real
  tokens (`--vscode-bodyFontSize`(-small/-xSmall) + literal 400/600 weights, M9
  wording). `validate-ui-scenario` REJECTED (its `test/scenario/` runner absent
  from the fork; references M9-deleted `test/mcp`). `hygiene` = manual vendored
  copy of the fork's own file (upstream deleted the skill) — deliberately OUTSIDE
  the lock, the skills CLI doesn't manage it. The 12 emilkowalski/skills entries
  installed same day, unaudited (no baseline; audit on request).
- **D19 M10 — NeoVim keyboard-first UX, prototype phase** (Sebastian 2026-09-01):
  new milestone M10 — an IDE UX inspired by his old NeoVim rig, layered ON the
  shipped M1–M3 design (chrome/material/geometry unchanged; palette = Dark 2026,
  NOT an nvim colorscheme). First-view scope: (1) neo-tree-style explorer —
  keyboard cursor row, per-row git letter glyphs + tinted filenames, devicon-style
  file icons, keymap hint footer (`j/k · h/l · a · r · d · /`); (2) lualine-style
  statusbar — NORMAL mode block, branch, diff counts, diagnostics, position
  cluster; flat segments, NO powerline chevrons; (3) full vim editor dressing —
  hybrid relative line numbers, slim gitsigns gutter bars, active indent-scope
  guide (all three already live in the daily settings.json; Error Lens + inline
  git blame virtual text ride along as faithful extras). EXCLUDED from view 1:
  harpoon pins / bufferline tab restyle (revisitable). Overlay surfaces
  (telescope, which-key, flash, oil.nvim, trouble) = candidate later views, each
  individually green-lit. Medium: static HTML mockup pages at the umbrella root,
  published as artifacts. Authoring exception for M10 prototypes ONLY: Fable 5
  max or Opus 5 max allowed, session's call — the opus-coder delegation policy
  stands everywhere else. *Decided by Sebastian 2026-09-01 (prototype-brief
  Q&A).*
- **D19 amendments (first-view verdicts, 2026-09-01)**: mockup ground rules set
  by the flag round — every color THEME-RESOLVED through the 2026-dark include
  chain (no stock-VS-Code hexes: modified tint is `#e5ba7d`, not `#E2C08D`);
  metrics honest to the product (editor line-height = mac golden-ratio 21px @
  fontSize 14 — grow the frame, never fudge the metric); NO staged elements (a
  dressing feature the real editor would not draw stays absent — the scope
  guide waits for a view whose cursor sits inside a block)
- **D20 M11 icon theme** (Sebastian 2026-09-01, on approving the M10 first
  view: "I love the icons you made, lets make a complete set"): an own icon
  collection in the mockup icons' language — flat solid matte brand colors,
  three archetypes (letter BADGE / object SILHOUETTE / bare GLYPH), no
  gradients/outlines/shadows, 16px-first — concept-sourced from a merged
  inventory of the 3 most-installed marketplace icon themes (Material Icon
  Theme + vscode-icons [favorite, naming wins] + VSCode Great Icons);
  generated with Nano Banana Pro through `agy`, converted to SVG (or whatever
  the icon-theme format needs), shipped as the DEFAULT file icon theme in the
  fork (D15-style bake). Strategy delegated to the session and chosen: one
  master style-prompt + 4×4 grid-sheet batches for intra-set consistency;
  curated core tier (~140 file + ~40 folder concepts) gets bespoke icons, the
  long tail maps to category generics (as the source themes themselves do);
  PILOT CHECKPOINT (16 icons end-to-end incl. 16px gate) before any mass
  generation.
- **D20 amendment — gate ruling** (Sebastian 2026-09-01: "use your
  recommendations", both questions): style SIGNED OFF with the pilot's
  palette transfer; NBP sheet B = locked STYLE BIBLE, its markdown + css
  cells corrected to the approved M10 designs before any reuse; production
  route = HAND-AUTHORED SVGs in the M10 language — per-icon optical sizing
  (never uniform bounding boxes), 16px pixel-grid discipline, flat fills
  only, letters as PATHS (Inter Bold, SIL OFL, generated via opentype
  tooling — no <text> nodes and no font-family in shipped SVGs), <2KB
  target / 4KB hard cap per icon, the M10 six carried as canon (letterforms
  re-rendered as paths, geometry/hexes untouched). NBP retained for
  ideation only, never shipped assets.. Design-intent deltas vs today's
  shipped product, to be baked at M10 implementation: **caption row** = dim
  foreground (#8C8C8C-class) + true row-centering (also settles the M2
  watch-list ~12px off-center quirk — judged now); **full-height sidebar** —
  the rail owns the window's bottom-left corner and the **statusbar spans only
  the editor column** (Sebastian, live: the NORMAL block was clipped by the
  corner radius; Xcode's full-height source list is the reference) — stock
  paints the statusbar full-width, so this is workbench grid surgery.
  **Sidebar view-body padding** (round 3, Sebastian: content "too close to the
  borders"): the pane/composite CONTENT container gets 6px top / 8px
  horizontal padding — generic, so explorer/search/git all inherit; combined
  with the M3 8px row inset, rows land 16px from the rail edges and
  header/labels/footer share one text column.
- **D20 amendment 2 — FULL COVERAGE, curation overturned** (Sebastian
  2026-09-01: "I specifically said to extract as many icons as you can …
  they leave configuration files like .xo or .prettierrc to fallback into
  their file type icon, which is not how its supposed to be. FIX IT"):
  the core-tier model is OVERTURNED as the coverage strategy — EVERY
  matcher-bearing concept in the merged inventory gets a bespoke icon
  (+1,006 file + 268 folder-pair concepts; only the 10 matcher-less
  decorations skip). Generic category icons remain solely as the final
  fallback for extensions no source theme knows. Long-tail craft rules =
  spec §11 (same bar; hue fidelity to the source themes, vscode-icons
  preferred; R7 hard in-slice + vs same-domain core, tolerated-and-logged
  across rarely-co-occurring long-tail pairs; R8 hard everywhere; 16px
  proof duty). The first fork packaging (`14023da`) is SUPERSEDED by a v2
  commit once coverage lands — the acceptance runbook is ON HOLD.
  all five flags approved as mocked)**: (1) finder layout = telescope
  horizontal, prompt at the BOTTOM, descending sort — best match adjacent to
  the prompt; (2) the finder is a window-centered 920px panel on the
  0.90-alpha overlay coat (quickInput.background) — at implementation this
  REPLACES stock's 600px opaque top-drop quick open; (3) overlays do NOT dim
  the world behind them; (4) focus handoff: while a prompt owns focus the
  lualine block flips to INSERT (green, editorGutter.addedBackground-class
  tint approved) and the editor loses its block cursor (one cursor total —
  the prompt beam), while Ln/Col + scroll% keep reporting the background
  editor; (5) picker/panel rows wear the M3 inset-row cosmetics (22px, 7px
  radius), query/keys render mono vs UI-font rows, label-OR-path match
  highlighting, read-only previews show absolute line numbers and no
  whitespace glyphs. The overlay vocabulary (quickInput*/pickerGroup tokens,
  radius 12, shadow-xl, #202122 @ 0.90) is the M10 panel language from here
  on. Session's cursor-row note (explorer keyboard-cursor row keeps its
  active tint under finder focus) not taken up — stays as mocked.
- **D21 M10 implementation scoping — RATIFIED** (Sebastian 2026-09-02, four
  verdicts in the scoping session; full plan + the five-agent source survey's
  file:line facts in [m10-implementation-plan.md](m10-implementation-plan.md)):
  the approved M10 design ships as SIX milestones + a gated tail. **M12
  base-scene parity**: stock-tab revert (D19 r4 deletion, kills the M3-deferred
  zoom-overflow bug) · Geist swap (woff2 needs BOTH esbuild loader maps + BOTH
  hygiene filter lists extended) · caption dim+center (dim lands as a
  2026-dark.json value — the caption paints via an inline style; kill the
  part.css 12px in the gated scope) · sidebar body padding 6/8 (MUST pair with
  box-sizing — `.content` is JS-px-sized) · **S5 NEW by verdict: view-1 editor
  dressing bakes as D15-style defaults** (relative numbers, slim git gutter,
  active scope guide; values lifted from the daily settings.json at the brief).
  **M13 grid surgery**: full-height rail + editor-column statusbar — grid tree
  re-parent proven expressible, NO persisted-state migration; includes as S0
  the survey-FOUND PRE-EXISTING BUG (adjustPartPositions' hard-coded `[2,…]`
  GridLocations stale since M3's banner move — activity bar at `default`
  location + sidebar-position toggle corrupts the grid; masked by our
  defaults; fix = getViewLocation-derived); panel alignment pins `center`
  under the gate (structurally incompatible otherwise); splash prepaint +
  corner-radius + part-cycling move in lockstep. **M14 lualine statusbar**:
  entry-model recomposition (addEntry/overrideEntry/updateEntryVisibility —
  no part surgery); diff counts + scroll% built fresh (survey: nothing stock
  computes either); NO mode block until M17. **M15 neo-tree explorer**: letter
  keymap rides the proven keybinding-beats-typeahead path (lists ask the
  keybinding service before consuming printable keys — no core patch);
  Part-level footer mechanism exists for the hint line; git letter badge →
  right-aligned column restyle. **M16 telescope quick input**: one widget
  serves every picker so the restyle is global by construction; bottom-prompt
  descending needs the data-order choke point + activation-default flips
  (rows are absolutely positioned — CSS can't reverse); 0.90 coat via the D10
  theme-resolution mechanism (new constant; 0.30 is a shared absolute) +
  single-painter alpha-0 on the list's second coat. **Modal tail M17–M19 —
  vehicle RULED: MARKETPLACE VIM EXTENSION** (VSCodeVim or vscode-neovim;
  specific pick + integration depth = M17's research round; vscode-neovim
  could run real which-key/flash plugins, reshaping M18/M19) — **M4's gallery
  becomes a hard prerequisite of the tail**; mockup-fidelity deltas where the
  extension owns the surface get surfaced per-view. Core has no mode signal
  (survey: `InputMode` = insert/overtype only; no vim extension in the daily
  rig). One milestone per session; M4 interleaves at Sebastian's call.
- **D21 amendment — vim vehicle pinned: VSCODEVIM (Sebastian 2026-09-02, at the
  M12 checkpoint round: "there is an extension called VSCodeVim, thats what
  you should use to get the vim behaviour")**: the M17 research round's
  extension question is CLOSED — VSCodeVim, not vscode-neovim. M17 becomes
  integration-only (mode wiring, lualine mode block, M16 INSERT-handoff flip);
  M18 which-key and M19 flash take the own-widget-driven-by-extension-state
  shape (VSCodeVim runs no upstream nvim plugins; its easymotion is the
  flash-adjacent surface — judged at the M19 brief). M4's marketplace gallery
  stays the hard prerequisite of the tail.
- **D22 M20 icon style — RULED: R1 "TRUE COLOR" (Sebastian 2026-09-03)** —
  the official mark verbatim in official colors over faithful sourced
  geometry (guide §5 recipe card is the operative law), plus the PRETTIER
  RIDER ruled the same round: an official mark physically unreadable at
  16px ships as a readable reduction (official colors + distinctive
  proportions kept, elements reduced/thickened to clear L5's 1.2px
  official floor, every reduction logged). Ruling history: round 1
  (2026-09-02) rejected all four freehand candidates and hardened L2;
  round 2 offered R1–R4 treatments on faithful geometry, R1 won. Original
  entry follows. (opened 2026-09-02): pick the v2 icon
  construction recipe among the four candidates in
  [m20-icons-v2/style-guide.md](m20-icons-v2/style-guide.md) §3 — A "Chips"
  (uniform colored container) / B "Brand true" (faithful official marks,
  normalized; session recommendation) / C "Wire" (monoline native-minimal) /
  D "Duotone" (two-tone flat, tamed 12-hue matrix). Guide laws L1–L10 bind
  whichever wins. Ruling locks the recipe card into the guide; pilot before
  mass production. **Round 1 (2026-09-02): A/B/C/D ALL REJECTED** —
  brand-true direction confirmed but the freehand samples failed fidelity
  ("not even close to the real ones"); L2 hardened — geometry must derive
  from official vector artwork, freehand banned. **Round 2 candidates**
  (all on identical faithful geometry, differing only in treatment):
  R1 "True color" (official marks verbatim) / R2 "One tint" (faithful
  shape, single brand hue) / R3 "Chips" (faithful mark white on uniform
  chip) / R4 "Tamed color" (official colors normalized into set bands).
- **D23 Isolated visual validation — TART VM (Sebastian 2026-09-02: live
  testing "is blocking me from using my computer"; Docker-style isolation
  requested; four options offered — headless code-web loop, background-window
  capture, macOS VM, batching — ruled: Tart with a shared volume)**:
  session-driven launch/CDP/`screencapture` rounds move into a local macOS VM
  (`vsebcode-vm`, cloned from `ghcr.io/cirruslabs/macos-tahoe-base` — Tahoe
  guest to match the host's rendering). The repo is shared into the guest via
  `tart run --dir` (virtiofs, Docker-volume style); host and guest are both
  arm64 macOS, so ONE checkout + one `out/` + one node_modules serve both
  sides — nothing builds inside the guest. D7 roles unchanged: Sebastian runs
  `npm run watch` + judges (and can launch `./scripts/code.sh` on the host
  anytime); the session drives the guest over SSH, so nothing appears on the
  host screen. Convention: the guest only READS the mount (host owns watch +
  git). Docker itself rejected — Linux guests can't render the macOS surfaces
  this project is about (SF Pro, vibrancy, native titlebar); in-VM vibrancy
  composites against the VM's own desktop = real compositor output. Known
  fallback if virtiofs launch is slow: copy `out/` guest-local pre-launch.
  **Setup state 2026-09-02: VERIFIED end-to-end** — tart 2.32.1 (brew,
  `cirruslabs/cli` tap trusted); VM `vsebcode-vm` from
  `macos-tahoe-base:latest` (guest macOS 26.6.2); SSH key
  `~/.ssh/vsebcode_vm`; node v24.19.0 in guest; workbench launched from the
  virtiofs mount (CDP up in ~5s — virtiofs slowness fear unfounded);
  compositor `screencapture` over ssh captures vibrancy. Screen-capture TCC
  needed a manual fix (macOS 26 renamed the ssh identity to
  `com.apple.sshd-session`; the sqlite grant was classifier-blocked for the
  session, Sebastian ran it by hand). **Follow-up ruled 2026-09-03 ("fix the
  display resolution and adapt the launch skill") — BOTH DONE**: display =
  VZ config `3024x1964` + per-boot `displayplacer` re-apply (guest re-picks
  1024×768@2x at every boot; re-apply is idempotent, launch-vm.sh does it) →
  captures 3024×1964 = 1512×982@2x; launch skill = VM mode as DEFAULT for
  visual rounds (delegated to opus-coder, reviewed; fork `25326ee`, pin
  `70886b6` — launch-vm.sh / capture-vm.sh / SKILL.md §"VM mode", CDP
  tunnelled to host, virgin-only). Guest login-restore disabled (boot
  resurrected stale instances). Loop commands: Tasks.md §"isolated visual
  validation". VM left STOPPED — launch-vm.sh auto-starts it.
- **D19 amendments round 4 — tab row reverts to stock (Sebastian 2026-09-01:
  "the tabs are too big"; two options offered — combine tabs+breadcrumbs
  inside the 46 band, or drop the tab/top-bar alignment and take stock
  tabs; session picked STOCK per the delegated-round protocol)**: the
  editor column's tab row returns to the default 35px height; the 46pt
  physical band remains ONLY as the rail header (lights + pills; 24px
  caption unchanged); the honest 25px breadcrumbs row stays. Rationale:
  the full-height rail (round 1) already retired the one-band-across-the-
  seam story; stock tabs are a code DELETION at implementation (revert M2
  slice-2's gated tab-height surgery + the slice-4 −1px nudge; KEEP the
  nosidebar lights-clearance padding); and the M3-deferred zoom-overflow
  bug dies with the fixed-physical tab height. Mockup set recalibrated:
  window 1280×859 exact-fit (35 tabs + 25 crumbs + 777 editor + 22
  statusbar), telescope panel top 166→163, which-key top 757→746; all
  views updated + republished to their URLs, renders re-verified. Veto
  window open: option A (compact tabs+crumbs combined inside the 46 band)
  remains available if stock reads wrong.
- **D19 amendments round 8 — ANIMATION ROUND (Sebastian 2026-09-01, ruled
  in the animation session: all 6 flags approved as built)**: motion
  enters the M10 design. Ground ruling: the Emil frequency-gate restraint
  (keyboard-opened surfaces never animate) is WAIVED for this design
  (Sebastian: "Emil design dont belong to this design"); Emil craft rules
  still bind — transform/opacity only, strong ease-out, enter fast / exit
  faster, reduced-motion variants. PRODUCT motion spec (ships at
  implementation): (1) overlay entrances 180ms on
  cubic-bezier(0.23,1,0.32,1) — telescope fade + scale 0.97→1 from its
  own center (modal-class, not trigger-anchored); which-key fade + 8px
  rise off its statusbar gap, after the timeoutlen pause; (2) overlay
  dismiss 120ms fade-out; (3) lualine NORMAL↔INSERT flip = 120ms
  crossfade; (4) prompt beam blinks at the editor cadence — 500ms
  halves (`viewCursors.ts:32` BLINK_INTERVAL). DURABLE manners: the
  block cursor never blinks; keystroke state steps are instant — the
  cursor teleports, no motion on j/k or cursor moves;
  prefers-reduced-motion = opacity-only variants. PRESENTATION layer
  (demo-only, never ships): view-1 j·j/k·k explorer-cursor walk at
  keystroke rhythm, 480ms window settle on load, rest beats, r·replay
  control under each window. Every view file carries a MOTION CSS
  section splitting PRODUCT from PRESENTATION values — the
  implementation phase reads PRODUCT lines only. Verification recorded:
  settled animated frame pixel-identical to the approved static scene
  (AE 0/0/0.2px on the 1280×859 window crops, real-clock headless
  renders). Flash gets the same pass next.
- **D19 amendments round 9 — RAIL HINTS COMPACTED (Sebastian 2026-09-01:
  "Compact the text under the sidebar, some of it is getting cropped by
  the window shape")**: the keyboard-hint footer at the rail bottom
  ("j/k move · … · / filter") measured ≈283px from its x20 anchor —
  filling the 300px rail flush into the statusbar seam, shoulder to
  shoulder with the 26px bottom-left corner arc, so ends clipped at
  some zooms/renderers. Fix (metric-only; all six hints and the x20
  text-column anchor kept): font 10.5px → 10px, separator-dot padding
  5px → 4px per side — the line now ends ≈21px clear of the seam.
  Applied to all four view files (identical block), headless renders
  re-verified corner-clean, all four artifacts republished to their
  URLs. Found + fixed in passing: the flash artifact was still serving
  the pre-Geist r4 page (the r6 "all five republished" never actually
  landed on flash's URL — it still had the Helvetica-Neue face, likely
  where the crop read worst); flash's URL now serves the committed
  Geist page with r9 baked. **Ruled by Sebastian (same day, on the
  offered alternative: "Drop it")**: the metric shrink is OUT — hint
  line back at stock 10.5px / 5px dot padding, and the `d delete` hint
  dropped instead; five hints survive in their original order
  ("j/k move · h/l fold · a add · r rename · / filter"), line ends
  ≈57px clear of the seam. Re-verified on headless renders of all four
  views, all four artifacts republished to their URLs. **Second
  follow-up ruled by Sebastian (same day: "Still getting too close to
  the rounded edge, align it to start from the right side")**: the
  line is RIGHT-ALIGNED — anchored 16px off the rail's right edge (the
  straight statusbar seam, no arc there; 16px = the rail's established
  content inset) and growing leftward. It now starts ≈59px from the
  window's left edge (the corner arc reaches 26px) and ends 16px
  before the seam; the x20 left text-column tie is dropped for this
  row only. Re-verified on headless renders of all four views, all
  four artifacts republished.
- **D19 amendment round 10 — UI FACE RULED: SF PRO (Sebastian 2026-09-02,
  on the live A/B the M12 debug experiments enabled: "Leave the default
  font size, use sfpro")**: the workbench UI font is SF PRO at the default
  13px — supersedes round 6's Geist pick. Implemented exactly as round 6
  recorded for this runner-up, "a pure deletion" (`e246e6d`): NO font layer
  ships at all — the stock mac `--monaco-font` fallback
  (`-apple-system, BlinkMacSystemFont, sans-serif`) IS SF Pro. Geist fully
  UNVENDORED (both woff2, geistUiFont.css, the ThirdPartyNotices OFL block,
  the cgmanifest entry, and the woff2 loader-map + hygiene-filter wiring —
  every file byte-restored to its pre-Geist state); BOTH temporary
  `vsebcode.uiFontExperiment` / `uiFontSizeExperiment` settings and their
  machinery deleted per the close-out plan; the vscodium
  `workbench.experimental.fontFamily` override path untouched and verified
  working both directions. SF Pro Light REJECTED — the round-6 light-shift
  retirement stands. One-token deviation on the restored patch surface,
  hooks-forced (pre-M2-gate precedent): `let family` → `const family` in
  updateFontFamily (prefer-const fires once the experiment's reassignment
  is gone; first commit ever to stage that file). The committed mockups
  keep Geist embedded as design history — they are not product.
- **D19 amendment round 11 — TAB ROW BACK AT THE 46pt BAND, CONTENT GOES
  PHYSICAL (Sebastian 2026-09-02, second M12 checkpoint: "I want the tab to
  be the same size as the activity bar again, like before … make the
  activity bar icons and the tab icon + filename change their sizes (like
  font size) based on the zoom level, since the top bar is fixed … the
  background of the tab container to be transparent")**: REVERSES round 4's
  stock-tabs ruling by exercising the veto it left open — stock read wrong
  live (traffic-lights spacing broken, hairline misaligned against the rail
  header). The editor tab row returns to the inline-title-bar physical
  height (M12-S1 reverted byte-identical, `bdcdd6b`, incl. the −1px label
  lift). The zoom-overflow bug that round 4 traded the band away for is
  solved head-on instead: everything the fixed band SHOWS — pill box,
  radius and glyph, tab label text, tab file icon — is sized in physical
  points too (`calc(X / var(--zoom-factor))`, `1b71790`), so band and
  content hold constant on-screen size at every zoom; tab boxes/paddings/
  min-max widths deliberately stay CSS-px (zoom still resizes the layout).
  Plus: `editorGroupHeader.tabsBackground` joins the D14 alpha-0 force set
  (`e10d246`) — the strip stops banding `#191A1B` across the editor column
  and shows the opaque editor `#121314`; inactive-tab fills kept pending
  his call. The committed mockups keep round 4's 35px tab row as design
  history — the implementation is the live truth. Amends rounds 4 and the
  M3-era deferred-overflow record.
- **D19 amendment round 12 — SEAM LINE, STRIP MATERIAL, SCM GUTTER
  (Sebastian 2026-09-02, third M12 checkpoint; the two design forks put
  through the question tool, all recommendations approved)**: (1) the
  stock line under the top-located composite bar (`sideBarActivityBar-
  Top.border`) is REMOVED under the gate — the mockup draws no rail
  line; the breadcrumbs' top hairline is the seam's only line (also
  moots the once-observed 1px title-stack offset — nothing left to
  misalign). (2) Round 11's strip reading is SUPERSEDED: "transparent"
  meant the SIDEBAR'S MATERIAL — `editorGroupHeader.tabsBackground`
  joins the 0.30 translucent set (not the alpha-0 set), the editor
  part's D9 opaque pin moves from the part to the editor BODY (empty
  groups pinned at their grid box — an inactive empty group dims to
  opacity 0.5, so an own-fill would leak vibrancy), and INACTIVE TABS
  paint no fill (mockup: tabs show the strip; only the active tab is
  solid — `tab.inactiveBackground` + unfocused twin → alpha-0 set).
  D9's "editor opaque" now formally means the editor BODY + empty
  groups; the title band is chrome and carries material. Accepted
  approximations recorded as flags 15/16 (opaque single-tab band, tab
  fade-gradient flatten). (3) SCM Changes: dead twistie gutters
  collapse (rows that never render a twistie stop reserving the
  column; list-mode resources included, tree mode untouched) — the
  16px row grammar stays; flag 14 holds the files-vs-group-header
  outdent for his verdict.
- **D19 amendment round 13 — ONE CENTERLINE + FLAT CHANGES PANE (Sebastian
  2026-09-02/03, fourth M12 checkpoint: "are you sure all the components
  in the top bar are aligned? … I'm tired of this bug, and ran out of
  solutions. suggest me something"; SCM fork put through the question
  tool — RULED "Flatten the pane properly")**: (1) the 46pt band's
  optical contract is EXPLICIT — every component centers on 23: traffic
  lights move to `{18,17}` (12pt buttons → center 23; supersedes M1's
  `{18,16}`), pills sit on whole pixels with a uniform 36px advance
  (vendored `.icon` margin cleared in the gated block, `column-gap`
  parts them, container width rounds down to even so flex-centering
  halves come out whole), tab icons already on 23, tab TEXT stays on 22
  by design (the optical ink lift — rows and tabs alike). (2) the
  Source Control CHANGES view adopts the flat one-column grammar AHEAD
  of M15 (the explorer's own flattening): commit input, action button,
  resource-group headers and list-mode resources all on one column 8px
  inside the rows; repo rows keep the only real twisties; INDENT GUIDES
  ARE NOT DRAWN in the pane (both view modes) — the class of
  content-over-guide bugs dies structurally, not per-case. Tree mode
  keeps stock folder nesting inside groups (flag 17 watches the header→
  folder step). Supersedes the round-12 gutter-collapse shape (R13);
  resolves its flag 14.
- **D19 amendments round 7 — VIEW 5 (OIL) WITHDRAWN (Sebastian 2026-09-01,
  ruled in the animation session, relayed: "I dont like Oil, remove its
  mockup and anywhere that references it to impolement" [implement])**:
  overrules the same-day delegated approval — `m10-nvim-oil.html` deleted
  (recoverable at `1436a80`), the oil artifact stays private/orphaned
  (tooling cannot unpublish), oil.nvim-style buffer file-ops are OUT of
  M10 and the implementation phase entirely. Flash stays fully in scope;
  trouble/harpoon candidate status unchanged. Candidate-list history in
  D19 stays as written per house amend-don't-rewrite style.
- **D19 amendments round 6 — UI face = GEIST (research round; delegated
  pick CONFIRMED by Sebastian live: "Lets use Geist", 2026-09-01)**. His
  directive: HN Light "looks like a marketing product" — change to
  something that aligns with the app, research it, installed-on-Mac not
  required. Research: 9-candidate specimen on the true-size chrome slice
  → https://claude.ai/code/artifact/974a0e56-c878-4852-84c8-b7826dbf4de5
  (HN baseline · SF system · SF light-shifted · Avenir Next · Seravek ·
  Inter · Geist · Mona Sans · IBM Plex Sans). RULING: **Geist** —
  Vercel's developer-interface face, OFL, Regular+SemiBold ≈ 92 KB;
  SF-adjacent metrics sit native on the Mac with enough voice to read
  chosen. The HN light-shift RETIRES (Apple HIG bars Light-weight UI
  text; the airiness survives in the color hierarchy, untouched). SF Pro
  system weights = recorded runner-up (a pure deletion, if ever
  wanted). Editor mono (Liga SFMono NF) untouched. Mockups embed Geist
  as data URIs (~124 KB/page; still zero external refs). PRODUCT
  follow-up at implementation: replace M3 S4 (`hnUiFont.css` + its
  style.ts import) with vendored Geist woff2 + the same
  workbench-font-family registration; injection-era
  `hn-weight-shift.css` fully superseded.
- **D19 amendments round 5 (view-4 flash verdicts — delegated round, session
  ruled 2026-09-01, all as mocked)**: (1) flash's backdrop dim ships as an
  editor-FOREGROUND fade — unmatched buffer text flattens to the theme's
  comment tone (FlashBackdrop→Comment, flash.nvim's own default link); no
  scrim, no panel — the round-2 no-dim rule governs PANELS and stands;
  gutter numbers, git bars, cursorline, block cursor and all chrome never
  dim; (2) no cmdline/pattern echo — the lualine keeps no showcmd/cmdline
  segment (round-3 precedent); OPEN design-intent question for the
  implementation phase: where the typed flash pattern lives; (3) jump
  labels = flat single-char cells, interactive-key accent `#48A0C7` ground
  with editor-ground glyph (block-cursor grammar; no radius at char
  scale); (4) all matches band equally with
  `editor.findMatchHighlightBackground` — bidirectional `s` has no
  current-match promotion; (5) label alphabet excludes any char that could
  extend the live search (the g rule), assignment nearest-to-cursor
  (Δrow, then Δcol).
- **D19 amendments round 3 (view-3 which-key verdicts — round DELEGATED by
  Sebastian 2026-09-01, "take the decisions that fit the best"; session
  ruled, all as mocked)**: (1) the FIRST LEADER MAP is locked at prototype
  level — `,` Settings · `/` Grep in files · `b` +buffer · `d` +diagnostics
  · `e` Explorer · `f` +find (telescope) · `g` +git · `w` +window (3 leaves
  + 5 groups, byte-sorted, column-major); the grounded-only rule is durable:
  keymap content may only reference surfaces that exist (no entries for
  non-green-lit candidates); (2) leader-panel form = editor-column strip
  floated on the M3 8px grammar (8px side insets + 8px above the statusbar),
  not edge-to-edge — follows the editor-column logic of the full-height-rail
  anatomy; (3) the pending-prefix breadcrumb in the panel's 25px title row
  is the M10 showcmd home; the lualine gets NO showcmd segment (honest
  absence, durable); (4) panel entry colors: keys `#48A0C7` (the
  interactive-key accent), groups `#d2a8ff` (2026-dark tokenColors
  entity.name.function), separator `→` U+2192 (Nerd-Font `➜` rejected),
  leaf descriptions sentence case / groups lowercase `+noun`. Delegation
  protocol recorded: when Sebastian delegates a round, the session rules it,
  records the delegation per round, and leaves a plain veto window in the
  reply.
- **D12 Chat substrate stays; ghost text recorded as M8** — *superseded by D16 2026-08-31.* — the remaining chat surface
  ships inert, VSCodium-style: `contrib/chat` (14 MB), `platform/agentHost` (8.7 MB,
  incl. the `node/claude` Agent-SDK glue), `src/vs/sessions` (5.8 MB) all KEEP — dormant
  without a provider, no M6 rebase burden, and the designated substrate for M8 ghost
  text. Smoke `areas/task/` (core task system, not Copilot residue) and
  `chatDisabled.test.ts` also keep. *Decided by Sebastian 2026-08-31.*
- **D11 M2 true-constants** — M2 ports the injection look with honest layout math, not CSS
  overrides fighting stock JS: the sidebar title row is FIXED at 24px (dropping the
  injection-era 70 − 46/zoom grow-when-zoomed behavior; identical at the daily zoom 0),
  and breadcrumbs get a real 25px layout constant (editor bottom lands exactly on the
  statusbar; the old ~8px "cheap air" push under the statusbar at full scroll is dropped).
  Also approved same round: full 23-file hygiene sweep before M2 code, plus the two
  chat-sim trivia deletions (`.gitignore` line, dead `dumpFailureDiagnostics`). *Decided
  by Sebastian 2026-08-31.*
- **D9 M1 redo approach** — the old M1's rejection causes: **visual details** and the
  **patch-era approach/structure** (not the unfocused dimming — D6c dim-when-unfocused is
  reaffirmed). Redo minimal-first: Phase A = hiddenInset + lights {18,16} (D6b carve-out
  kept), `under-window` vibrancy + transparent background (no `visualEffectState`),
  splash-repaint guard (D6e) — one concern per commit, screenshot checkpoints from an
  isolated dev instance before Sebastian's visual pass. Phase B (workbench-root
  transparency with pinned parts, statusbar drag) only after the base look is approved.
  *Decided by Sebastian 2026-08-29.*

## Risks / known limits

- Upstream churn on our surfaces (titlebar / tabs / activity bar) now surfaces as **rebase
  conflicts** at sync time — fixed in-tree with full context, instead of the harness era's
  patch-apply failures that blocked builds.
- M9 changed the M6 rebase profile: the ~20 deleted AI trees conflict trivially
  ("deleted by us" — re-delete whatever upstream adds there), but the ~100
  strip-sites in kept files (extHost.protocol/api.impl, workbench mains,
  notebook/terminal/scm, argv, buildfiles) are a permanent, mostly-trivial
  conflict surface — m9-excision-plan.md is the reference for what was cut where.
- Submodule tax: an editor change needs a commit+push in `vscode/` AND a pin-bump commit in
  the umbrella; forgetting the inner push leaves the umbrella pointing at an unpushed commit.
- Electron/macOS limits ride along unchanged: CSS drag regions stay inert inside the native
  titlebar strip, and `backdrop-filter` stays a no-op under vibrancy. Fixing either means
  forking Electron — out of scope.
- 16 GB RAM: gulp packaging runs an 8 GB node heap; close heavy apps during full builds.
