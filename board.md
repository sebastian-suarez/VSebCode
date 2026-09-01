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
  (2) which-key → (3) flash jumps → (4) oil.nvim-style buffer file-ops;
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
  `s hei`, 9 machine-verified real matches. **View 5 (oil) APPROVED at
  v1 (2026-09-01, delegated round — session ruled all 6 flags as
  mocked; § Tasks M10 for the list)** →
  https://claude.ai/code/artifact/78c781ee-0660-4df3-9fb8-bc1125830183
  (`m10-nvim-oil.html`, committed on approval): the REAL
  `src/vs/workbench/browser` listing as an oil buffer (24/24 rows
  machine-checked), mid-flight case-toggle rename of the genuinely
  lowercase upstream `panecomposite.ts`. **GREEN-LIT QUEUE COMPLETE** —
  views 2–5 all built, reviewed, approved, published. **Geometry
  revision r4 same day** (Sebastian: tabs "too big"): tab row → stock
  35px, windows → 1280×859 — § D19 amendments round 4. **Font r6 same
  day**: UI face → GEIST (Sebastian confirmed live), all five views
  republished with it embedded — § D19 amendments round 6; research
  page https://claude.ai/code/artifact/974a0e56-c878-4852-84c8-b7826dbf4de5
  **Animation round IN FLIGHT (session vsebcode-15)**: demo motion
  layered on views 1–3 per Sebastian ("add animations, use emil
  skills"; his ruling: the Emil frequency gate is WAIVED — overlays DO
  animate in the product; craft values stay), session-reviewed here
  (transform/opacity only, PRODUCT vs PRESENTATION values documented
  in-file, reduced-motion variants, safe JS) + republished; that
  session's flag round is pending with Sebastian — the three animated
  files commit with its verdicts; flash/oil get the motion pass after.
  NEXT (Sebastian's calls): further views (trouble list · harpoon
  stay candidates) and/or implementation scoping.
- **M11 — VSebCode icon theme — OPENED 2026-09-01 (D20)**: own complete
  file-icon set in the M10 mockup icons' visual language, generated with Nano
  Banana Pro via `agy` (D2's icon tooling), vectorized, packaged as a built-in
  icon theme, shipped as the product DEFAULT. Top-3 source themes fixed by
  install count (marketplace gallery API 2026-09-01): Material Icon Theme
  35.4M · vscode-icons 24.5M (Sebastian's favorite — naming reference) ·
  VSCode Great Icons 2.3M. Phase 1 COMPLETE 2026-09-01: (a) **INVENTORY
  LANDED** — 1534 merged concepts (1170 file / 364 folder; 189 in all three
  sources, 344 in two) parsed from pinned upstream commits (Material's
  filename DSL reimplemented, vsicons glob products expanded, 131 disabled
  entries excluded), core tier 145 file + 40 folder ranked, 269 sparse-honest
  brand colors, 54 core matcher collisions resolved (33 hand-pinned), long
  tail annotated `generic-<category>`; (b) **PILOT LANDED
  2026-09-01** → checkpoint artifact
  https://claude.ai/code/artifact/b486caca-e065-4a3b-a997-c87921d05461
  (M10 A/B, size ladders, true-16px pixel grid, both sheets, master prompt,
  re-runnable pipeline.sh). Findings: agy invocation proven — headless
  REQUIRES `--dangerously-skip-permissions` (image tool wants a `command`
  permission print mode can't prompt; used scoped to generation runs); NBP
  capped the sheet at 1024² (probe reached 2048² — per-request negotiation);
  style drift across runs LOW; "flat" disobeyed at pixel level (12k+
  colors/badge → posterize-5 before vtracer; traced SVGs 11–76KB vs <2KB
  hand-authored); 16px verdict 8 survive / 7 marginal / 1 mush (rust). A/B
  vs the approved M10 icons: uniform bounding box ≠ optical weight (M10 pads
  per icon); the master prompt contradicted approved designs on markdown+css
  (fix those cells before any reuse); M10 hand-authoring already solves 3 of
  the 7 marginals. SESSION RECOMMENDATION at the gate: lock NBP sheet B as
  the STYLE BIBLE, HAND-AUTHOR the production SVGs in the M10 language with
  per-icon optical sizing (raster→trace rejected on 16px + file-weight
  evidence). **GATE RULED 2026-09-01 — both recommendations ACCEPTED**
  ("use your recommendations"; D20 amendment): style signed off, NBP sheet B
  locked as style bible (markdown+css cells corrected to M10 canon),
  production = hand-authored SVGs. **Production phase OPEN**: ~185 core
  concepts + ~10 category generics in review-gated batches (~24/batch by
  family; opus-coder); toolkit (Inter-Bold letter-path generator — no <text>
  in shipped SVGs — + contact-sheet builder) rides with batch 1; then
  icon-theme JSON assembly from core-tier matchers; then fork packaging
  (built-in extension + default flip, D15-style). **Batch 1 LANDED +
  review-green 2026-09-01** (26 icons: files ranks 1-24 + the 2 canon
  folders; toolkit built): canon fidelity MEASURED per-pixel — folder /
  folder-open / markdown bit-identical at 16/32/64, TS/css/npm differ only
  on Inter-vs-SF letterform antialiasing (grid-searched fit, principled
  optimum across all three sizes); validator 26/26, 16.5KB total (avg 634B,
  max 1.4KB); two centring laws derived from the canon into spec.md (badge
  letters sit low at ~41% below-baseline share; silhouette/glyph letters
  cap-centred). ONE pending Sebastian yes/no (non-blocking, spec.md §9):
  yaml shipped OFF-BRAND muted plum #7E6086 — brand red #CB171E is a
  near-twin of canon npm red in the same repo roots; one-line revert if
  vetoed. Noted weak pair (kept): reactts/reactjs as TSX/JSX cyan badges.
  **Batches 2-6 (files ranks 25-145 + category generics + default file) and
  the folders batch (38 concepts × closed+open, canon-base + emblem
  template) IN FLIGHT in parallel, 6 opus-coder agents**; per-batch
  contact-sheet review gates, then cross-set hue/monogram audit at
  assembly.
- **M4 — Branding & marketplace**: full VSebCode rebrand (D2) + VS Code
  Marketplace (D3). Theme rider resolved: Dark 2026 became the product default
  via D15. Known inputs from earlier milestones: `!!APP_NAME!!`/`!!ORG_NAME!!`
  vscodium placeholders (UI + the 21 pre-existing build-script test failures),
  `!!GH_REPO_PATH!!` announcements 404, icons via Nano Banana Pro (`agy` CLI)

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
- **D19 amendments round 2 (view-2 telescope verdicts — Sebastian 2026-09-01,
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
