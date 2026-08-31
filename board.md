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

- **M3 — Tree & type polish** (next session): sticky-header mask in the tree widget,
  source-list rows, HN UI font — retires `tree-sticky-mask.js` +
  `hn-weight-shift.css`, uninstalls both extensions. Source spec: the M3-only
  leftovers in Settings/settings.json (see settings-m2-reduction.md for exactly which
  pieces remain). M3's packaged pass also carries M2's one-time packaged
  verification (virgin profile = stock layout per D13)

## Next

- **M4 — Branding & marketplace**: full VSebCode rebrand (D2) + VS Code Marketplace (D3).
  Candidate rider (Sebastian 2026-08-31, undecided): Dark 2026 as the product default
  theme

## Later
- **M8 — Claude ghost text**: inline completions backed by Sebastian's Claude
  subscription via the Claude Code / Agent SDK glue already in `platform/agentHost`
  (persistent host process; subscription auth rides the Claude Code login — no API-key
  billing). Dedicated design session after M2/M3: in-core provider vs bundled
  extension, prompted-completion design (Claude has no FIM API), latency prototype
  first. *Recorded 2026-08-31 (D12).*
- **M4 — Branding & marketplace**: full VSebCode rebrand (D2) + VS Code Marketplace (D3)
- **M5 — Signing & updates**: Developer ID signature, updater story
- **M6 — Sync ritual**: rebase `vsebcode` onto the next stable tag, bump pins (see README)
- **Settings repo cleanup**: strip the hack block from `settings.json` once M1–M3 land

## Done

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
- **D12 Chat substrate stays; ghost text recorded as M8** — the remaining chat surface
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
- Submodule tax: an editor change needs a commit+push in `vscode/` AND a pin-bump commit in
  the umbrella; forgetting the inner push leaves the umbrella pointing at an unpushed commit.
- Electron/macOS limits ride along unchanged: CSS drag regions stay inert inside the native
  titlebar strip, and `backdrop-filter` stays a no-op under vibrancy. Fixing either means
  forking Electron — out of scope.
- 16 GB RAM: gulp packaging runs an 8 GB node heap; close heavy apps during full builds.
