# VSebCode — Tasks

Working checklists per milestone. Board-level view and decisions: [board.md](board.md).

## Reference — build & dev loop (all run from `vscode/`, by hand)

| Action | Command |
|---|---|
| One-time setup | `npm i` |
| Incremental compile (leave running) | `npm run watch` — wait for "Finished compilation" |
| Launch dev app | `./scripts/code.sh` (Cmd+R reloads renderer changes; main-process changes need a relaunch) |
| One-shot compile | `npm run compile` |
| Package .app | `npm run gulp vscode-darwin-arm64` → `../VSCode-darwin-arm64/Code - OSS.app` (umbrella root, gitignored); `-min` = minified |
| Import a vscodium patch | `git apply ../vscodium/patches/<name>.patch`, review, commit |
| Record submodule pins | umbrella root: `git add vscode vscodium && git commit` |

Environment notes (carried from the harness era, still apply):

- Node pin `.nvmrc` = 24.15; local 24.19 satisfies it.
- 16 GB RAM: gulp packaging runs an 8 GB node heap — close heavy apps.
- Isolated test profiles: `--user-data-dir` must be a **short path** — the main-process socket
  breaks past ~103 chars.
- Copilot is fully removed (patch 53 + `8e8353bf` sources/wiring + `4dce613` agentHost
  cleanup). Full `npm run compile` is green — plain `./scripts/code.sh` works, no
  `VSCODE_SKIP_PRELAUNCH` needed. `src/typings/anthropic-sdk.d.ts` stands in for the
  type-only `@anthropic-ai/sdk` imports patch 53 de-installed; delete that shim if the
  dependency ever returns.
- The patch import changed `package.json`/`package-lock.json` (root and `remote/`) — re-run
  `npm i` before the next watch/build. *Done — Sebastian ran it; the resulting lockfile
  drift is committed (`cc871b7`, 2026-08-31).*
- **Watch anatomy** (learned 2026-08-29): `npm run watch` = 3 parallel lanes via
  npm-run-all2; ONLY the `watch-client-transpile` lane (`node build/next/index.ts
  transpile --watch`) writes `out/` — gulp `watch-client` is typecheck/codicons only
  (`build/gulpfile.ts:40`) and keeps printing happily even when the transpile lane has
  died. If `out/` goes stale under a "running" watch, `ps aux | grep build/next` — no
  process = the transpile lane crashed; restart the watch or one-shot `npm run compile`.
  Also: dev workbench loads CSS/JS from `out/` (not `src/`), so CSS edits need that lane.
- `[vscodium]` import commits bypass hooks (`--no-verify`): vscode's husky hygiene rejects
  VSCodium's placeholder strings. Keep hooks ON for our own commits — since 2026-08-31
  that works EVERYWHERE: the `00-ui-custom-font` hygiene arc (874 → 0 errors) landed as
  `64b030dc` (2 files) + `59c5366` (18 files) + `166727b` (8 base/editor files restored
  to pristine upstream; their rules relocated to
  `workbench/browser/media/uiCustomFontWidgets.css`, wired via `style.ts` — rebase
  instructions live in its header) + `f84e5e9` (component fixtures load it too) +
  `913e32d` (codicon's duplicate sidebar rule deleted). Remaining vendored foothold
  outside the workbench layer: 2 rules in `codicon.css`, kept BY DECISION — the file is
  hygiene-exempt (`!**/codicon/**`, `build/filters.ts:130`) and its early base-layer
  load position is LOAD-BEARING: its broad rules tie ~110 selectors at equal
  specificity and lose all of them purely by document order; relocating would flip
  reachable ties (e.g. sessions chat codicon sizes). Mind both facts at every M6
  reimport of the font patch.

Harness-era-only notes (kept in case VSCodium's build scripts ever return): `cargo` at
`~/.cargo/bin` on PATH for `build_cli.sh`; `dev/build.sh -s` needs
`rm -rf vscode/cli/openssl` first.

## M0 — Prove the toolchain (redo under D7; Sebastian drives the build)

- [x] Prereqs (gh, rustup, jq, Node, Xcode, disk) — carried, verified 2026-08-28
- [x] GitHub: `microsoft/vscode` forked → `sebastian-suarez/vscode`; umbrella
  `sebastian-suarez/VSebCode` created (public, real README + description)
- [x] Submodules pinned: `vscode/` @ 7e7950df (1.126.0, branch `vsebcode`),
  `vscodium/` @ d14478d
- [x] D8: 41 VSCodium patches imported onto `vsebcode` → pin `58b6f34` (2026-08-29);
  remaining M0 steps run on the patched tree
- [x] `cd vscode && npm i` *(Sebastian, 2026-08-28)*
- [x] `npm run watch` reaches "Finished compilation" *(Sebastian, 2026-08-28)*
- [x] `./scripts/code.sh` boots the dev instance *(Sebastian, 2026-08-28)*
- [x] `npm run gulp vscode-darwin-arm64` packages `Code - OSS.app`; boots with an isolated,
  short-path `--user-data-dir` *(Sebastian, 2026-08-29)*
- [x] Hands-on acceptance passed *(Sebastian, 2026-08-29)* — on the patched, Copilot-free
  tree. (No marketplace in vanilla `product.json` — extension installs arrive with M4/D3.)

## M1 — Window patches (redo per D9)

Re-briefed 2026-08-29: minimal-first, one concern per commit, screenshot checkpoints. D6c
(dim when unfocused) reaffirmed; the old rejection was visual details + structure.

Phase A — base look (three commits, delegated):

- [x] `titleBarStyle: 'hiddenInset'` + `trafficLightPosition: {x: 18, y: 16}` in
  `defaultBrowserWindowOptions` (macOS); `forceNativeTitlebar` windows (devtools, GPU-info,
  process explorer) keep stock chrome — `2875caf`, 2026-08-29
- [x] `vibrancy: 'under-window'` + `backgroundColor: '#00000000'`; deliberately no
  `visualEffectState` (D6c/D9) — `2b18b09`
- [x] Splash-repaint guard: `themeMainServiceImpl.ts` `updateBackgroundColor` early-return
  on macOS; splash storage writes + `updateSystemColorTheme` verified untouched — `0773be2`

Phase A notes: the `overrides?.transparent` path (windows.ts ~266) would combine with our
vibrancy but has zero in-tree callers today — watch it if a transparent auxiliary window
ever appears. Expect NO visible blur in a default-settings profile until Phase B — the
workbench still paints opaque; Phase A's visible change is the inset centered lights.
- [x] Screenshot checkpoint **passed** (Sebastian, 2026-08-29) — Phase A base look approved
  (screenshots also on Desktop as `vsebcode-m1-phaseA-*.png`). For Phase B's checkpoint:
  relaunch via `vscode/.claude/skills/launch/scripts/launch.sh` from `vscode/` (prints JSON
  with pid/ports; kill pid + rm runDir when done); `out/` compiled at `0773be2`; devtools
  carve-out check: Help → Toggle Developer Tools keeps the normal macOS title bar

Phase B — only after the base look is approved:

- [x] Workbench root transparent (`.monaco-workbench.mac:not(.web)`) with editor/statusbar/
  panel pinned opaque; per-part translucent hexes stay user-side — `81f7eaa`, 2026-08-29.
  Static CSS in `browser/media/style.css` out-specifies the dynamic root rule
  (`style.ts:19`, untouched — Windows subpixel-AA); the pins are a `var(--vscode-editor-background)`
  backstop UNDER the parts' inline theme styles (editorPart/panelPart/statusbarPart all
  self-paint with `|| ''` fallbacks). Splash chain verified: its opaque body style is
  removed on load (`partsSplash.ts:110-121`)
- [x] Statusbar drag region (`.statusbar` drag / `.statusbar-item` no-drag, macOS-scoped)
  — `7d29890`. Flat selectors on purpose (nested lists expand per outer selector and
  silently miss). Delta vs the old injection block: its drag rules also sat under
  `:not(.fullscreen)` — omitted per the minimal spec since dragging is inert in fullscreen;
  re-add if fullscreen ever misbehaves
- [x] D10 — baked-in translucency (decided + landed 2026-08-31, supersedes "hexes stay
  user-side"): absolute 0.30 alpha for sideBar / sideBarTitle / activityBar /
  activityBarTop / titleBar.active+inactiveBackground, applied at theme color resolution
  (`ColorThemeData.getColor` wraps private `resolveColor`; helper + `MAC_TRANSLUCENT_SURFACES`
  set in `common/theme.ts`; titlebar makeOpaque-skip kept; macOS native only) — `f727c45`,
  pin `636a69b`. Delegated; diff reviewed; compile exit 0; targeted theme tests 48/0;
  runtime probe verified defaults, customization-tint-preserved-alpha-forced, CSS vars.
  Value-level ⇒ list bodies, sticky scroll, splash first frame and aux bar inherit
  translucency, as the old settings hexes did. Survey fallout, accepted as-is:
  `diffEditor.unchangedRegionBackground` + `notebook.cellEditorBackground` derive from
  sideBar.background → now a 0.3 tint over the opaque editor (cosmetic; re-register their
  defaults if unwanted); sessions-window agents colors derive too (unverified there);
  issue-reporter window styles from sideBar.background with no vibrancy behind it;
  activitybar icon-strip CSS `inherit` double-paints ~0.51 behind the icon column —
  matches the old injection look, one-line fix exists if the eye disagrees; titlebar
  `.light` class never set on mac (`fromHex` can't parse rgba) — harmless,
  Windows/Linux-only rule. Watch all of these at M6 rebases
- [x] Screenshot checkpoint → **Acceptance**: Sebastian's visual pass on the dev instance
  and a packaged app. Checkpoint plan: Sebastian runs `npm run watch` (CSS must reach
  `out/` — the launcher only compiles when `out/` is missing); session launches via the
  launch skill, seeds the throwaway profile's settings with the four translucent hexes
  (sideBar/sideBarTitle/activityBar/activityBarTop @ `#1e1e1e4d` — kit ready in session
  scratchpad), verifies computed styles over CDP, screenshots via `screencapture`
  (CDP shots cannot capture vibrancy — compositor-level only), then kill pid + rm runDir.
  **State 2026-08-31**: screenshots taken (Desktop `vsebcode-m1-phaseB-01-default` /
  `-02-sidebar-panel`) and session-reviewed — transparency works on the four seeded
  surfaces, pinned parts opaque; blur itself is not judgeable against a featureless
  backdrop (put a busy window/wallpaper behind the app for the visual pass). Scope
  confirmed vs Settings/settings.json: the daily look alphas ONLY the four side-rail
  surfaces @ `4d` (+ overlay widgets @ `e6`) — opaque titlebar/tabs/editor/panel/statusbar
  is the target look, not a Phase B gap. Pending: Sebastian's dev-instance verdict, then
  the packaged-app pass. **Packaged-app gotcha (2026-08-31)**: the .app runs its own fresh
  profile at `~/Library/Application Support/Code - OSS` (dev uses `code-oss-dev`) — with no
  settings there, ALL surfaces paint opaque by design, so "no transparency" in a virgin
  packaged app is expected, not a build defect. Bundle verified to contain all five M1
  commits: `hiddenInset`/`under-window`/`trafficLightPosition`/`#00000000` in
  `Resources/app/out/main.js`, root-transparency selectors + statusbar drag in
  `out/vs/workbench/workbench.desktop.main.css`. Seed the four hexes in that profile to
  judge the look. *Superseded by D10 (2026-08-31): post-D10 builds show the translucency
  natively — no profile seeding anywhere in the checkpoint flow anymore.*
  **Accepted 2026-08-31**: Sebastian approved the D10 baked look on the dev instance and
  a fresh `14:41` packaged build (bundle grep-verified to carry Phase A + B + D10) —
  **M1 closed**

## M7 — Copilot leftovers sweep (unblocked; independent of M1)

Inert remnants surfaced by the excision commits (`8e8353bf`, `4dce613`) — one delegated
commit deleting:

- [x] `.vscode/tasks.json`: the dead "Copilot - Build" / "Kill Copilot - Build" tasks — done
  2026-08-29 (`6c05931`), incl. their two dangling `dependsOn` refs
- [x] `.vscode-test.js`: the copilot suite entry — done 2026-08-29
- [x] MS-internal CI/dev files — done 2026-08-29: `build/azure-pipelines/copilot/*`,
  `product-copilot*.yml`, `common/downloadCopilotVsix.ts`, `build/copilot-migrate-pr.ts`,
  and the 2 copilot-only workflows (`copilot-setup-steps.yml`; `chat-lib-package.yml` —
  copilot-only by content despite the "chat-lib" name). The "~7 workflows" turned out mixed —
  see new item below
- [x] `eslint.config.js` `@github/copilot-sdk` lines removed; `@anthropic-ai/*` intact —
  done 2026-08-29 (`77a7f3ee`)
- [x] 6 stale doc-comment refs in `claudeToolDisplay.ts` / `editChunkExtractor.ts` — done
- [x] All 15 dangling `build/azure-pipelines/**` refs pruned (sweep grep returns nothing) —
  done
- [x] Mixed workflows: copilot jobs/steps pruned from `pr.yml` (4 jobs — a 4th dead one
  found beyond the survey), `pr-node-modules.yml`, `pr-{linux,darwin,win32}-test.yml`;
  `chat-perf.yml` deleted whole (cannot function without the extension);
  `no-engineering-system-changes.yml` copilot-bot branches removed, core guard intact — done
- [x] `.vscode/launch.json` glob + `.github/copilot-instructions.md` + copilot issue
  template removed — done
- [x] **Acceptance**: compile exit 0; gulp task list loads; agentHost unit suite executed —
  1927 passing / 54 pending / 0 failing (2026-08-29)

Post-sweep tail — resolved 2026-08-31, **M7 fully closed**:

- [x] `scripts/chat-simulation/**` deleted FULLY per Sebastian's call (accepting the loss
  of agents-window smoke coverage): harness (17 files), `perf:chat*` npm scripts, 5
  eslint-allowlist entries, `.github/skills/chat-perf/`, the 3 dependent smoke suites
  (`copilotCli`/`chatSessions`/`agentsWindow` — all needed its mock-llm-server + Copilot
  auth-bypass env), their `main.ts` wiring, and the 4 Copilot helpers in
  `test/smoke/src/utils.ts` — `4553778` (−8,924 lines). `chatDisabled` suite kept.
  Verified: `cd test/smoke && npm run compile` exit 0, targeted eslint clean, hooks ON
- [x] Dangling copilot-instructions.md links fixed in the same commit (`AGENTS.md`,
  `phase13-plan.md`); pr-linux-test musl comment reworded to current reality (the SDK is
  a root devDependency consumed by `agentHost`; the step itself is still needed)
- [x] `vscode/.claude/CLAUDE.md` dangling symlink removed (was untracked — no commit)

## M2 — Workbench layout in source (kills `zoom-css-vars.js`)

Port the `custom-ui-style.stylesheet` block from Settings/settings.json piece by piece;
delete each piece from settings as it lands.

- [x] **Pre-M2 gate — landed 2026-08-31** (`64b030dc`, delegated; diff reviewed): vendored
  `00-ui-custom-font` sections in the two CSS files reindented to tabs (whitespace-only —
  `git diff -w` empty) and SIX vars registered in `vscode-known-variables.json` (the
  briefed three + `--monaco-font` / `--vscode-workbench-font-family` /
  `--vscode-workbench-font-size` — same patch, same file; hooks could not pass with only
  three). Commit made with hooks ON. Cost stands: mechanical redo if the patch is ever
  drop-and-reimported. Fallout → "Post-gate follow-ups" below

Post-gate follow-ups (approved 2026-08-31 with D11 — landed same day):

- [x] Hygiene sweep `59c5366` (delegated; diff reviewed): 18 CSS files reindented — pure
  whitespace (`git diff -w` empty; per-file vendored provenance verified by
  reconstructing each pre-patch file and running hygiene's indent predicate on both) +
  7 more vars registered → unknown-variable errors across the whole patch now 0; 618 of
  874 starting errors cleared. Two transform rules needed (4-space AND one stray
  space+tab line in `auxiliaryBarPart.css:32`). Hooks ON
- [x] `.gitignore` `.chat-simulation-data` line dropped — `4efaa11`
- [x] `dumpFailureDiagnostics` removed from smoke utils (−92 lines incl. the `fs` import
  that became unused with it; remaining imports verified live) — `4efaa11`; smoke
  compile + eslint green, hooks ON
- [x] **Layer-checker pocket — resolved by workbench-layer rewrite** (Sebastian's call
  2026-08-31; delegated, diffs reviewed, hooks ON): `166727b` restores all 8
  base/editor files byte-identical to pre-patch upstream and moves their 369 vendored
  lines into `uiCustomFontWidgets.css` (cascade audit: no reachable order-dependent
  change; the one equal-specificity co-match is dominated by a higher-specificity rule
  in the same group). `f84e5e9` routes the stylesheet to component fixtures (they
  render in `.monaco-workbench`/`.part` wrappers but don't load `style.ts`; brief's
  3-file premise corrected en route — only `fixtureUtils.ts` needed the import, the
  sessions fixtures inherit it via the module graph). codicon.css full relocation
  REJECTED on audit evidence (110 equal-specificity ties resolved today by its early
  load position, some provably reachable); only its duplicate sidebar/auxbar rule
  deleted — `913e32d`, no-op proven via ESM import order (codicon.css always precedes
  `style.css:381`'s identical winning copy). Patch-wide hygiene: 874 → 0

- [x] **Slice 1 landed** (`7f3a2be`, delegated; diff reviewed): TS-owned zoom + gate
  infra — `inlineTitleBar.ts` (constants 46/86/24, per-window state mirroring
  `WindowManager`) + `InlineTitleBarLayout` contribution (BlockStartup; sets
  `--zoom-factor` on every container incl. aux windows; toggles `.inline-titlebar`
  from `isVisible(TITLEBAR_PART)` main / `shouldShowCustomTitleBar` aux; reacts to
  zoom, part visibility, fullscreen, the two D13 settings); CSS vars
  `--titlebar-height`/`--traffic-lights-width` under
  `.monaco-workbench.mac:not(.web).inline-titlebar` in `style.css`. Replaces
  `zoom-css-vars.js` polling with `getZoomFactor`/`onDidChangeZoomLevel`
- [x] **Slice 2 landed** (`ef54f60`, delegated; diff reviewed): 46pt bar as true
  constants — the "70px" site is `PartLayout.HEADER_HEIGHT/TITLE_HEIGHT` (35+35,
  `part.ts:217`); new `headerHeight()`/`titleHeight()` option callbacks (borderWidth
  idiom); `SidebarPart` feeds 46/zoom + 24 when gated & LEFT; tabs: `tabHeight` getter
  returns physical 46/zoom under the gate (compact stock; JS is the single source,
  CSS var follows via `updateTabHeight`); zoom/gate listeners re-apply per window.
  Unit: part.test.ts 4/4, workbench browser glob 260 passing. VISUAL PENDING the
  slice-3 checkpoint. Quirks noted: `.title-label` keeps stock 12px padding-left
  (~12px off true center — judge at checkpoint; injection had it too);
  `multiEditorTabsControl.ts:1957` offsetHeight===tabHeight compare breaks on
  fractional heights with `wrapTabs` on (pre-existing for non-13 font sizes)
- [x] **Gate refinements landed** (`e24dd1b`, delegated; diff reviewed): config-semantics
  gate via new `isCustomTitleBarDisabled()` in layoutService.ts (shouldShowCustomTitleBar
  minus both fullscreen terms — virgin profiles never flip; our config keeps 46pt tabs
  in fullscreen like the injection); fullscreen/part-visibility listeners dropped, config
  listener covers the predicate's full setting set. Caption conditioned on the header
  EXISTING via new `Part.hasHeaderArea` (not the location setting — agent proved the
  setting desyncs when the activity bar is hidden/auto-hidden and that the cached
  position field is stale mid-relayout); CSS mirrors with `:has(> .header-or-footer.header)`
- [x] **Slice 3 landed** (`17f5378`, delegated; diff reviewed): view-switcher pills —
  traffic-light inset as header `padding-left: var(--traffic-lights-width)` PLUS the
  JS width math: `layoutCompositeBar`'s bare `16:8` literals promoted to named
  constants behind a new `protected getCompositeBarPadding()`; `SidebarPart` override
  returns 86/zoom + 4 under the gate (inset replaces the stock left padding) so pill
  overflow math agrees with the screen. Pills as gated CSS (no `!important` — each
  stock rule it overrides identified individually): 34×28, 20px glyphs
  (+ `--activity-bar-icon-size: 20px` for masked URI icons — one deliberate addition
  beyond the literal spec), indicator off, badge top-right. Item widths are
  DOM-measured (`compositeSize: 0`) so no JS pill constants needed.
  `--traffic-lights-width` registered. activitybarPart tests 15/15, glob 260 passing
- [x] Traffic-light inset computed from the zoom factor in TS (`getZoomFactor`) — var
  infra in slice 1, JS width math + CSS consumer in slice 3
- [ ] Tabs: the −1px optical text nudge (text container only)
- [ ] Breadcrumbs: 25px row, background on the full-width wrapper, hairline ending the active
  tab at the bar (D11: real 25px layout constant — editor lays out honestly, no
  under-statusbar air)
- [ ] Drag regions into part CSS (`activitybar`, statusbar, banner holes) — keep the
  inert-native-strip caveat as a comment
- [ ] No-sidebar / fullscreen / banner variants
- [ ] **Acceptance**: `custom-ui-style.stylesheet` block reduced to M3-only leftovers
  (sidebar source-list rows, sticky mask, indent guides, scroll shadow, pane-header,
  search view — the block mixes M2 and M3 material); layout correct at zoom 0 / ±1 / ±2

### M2 checkpoint plan (written 2026-08-31; primary checkpoint after slice 3, quick
sanity peek after slice 2 optional)

Roles per D7: Sebastian runs watch + judges; the session drives launch/CDP/screenshots.

1. **Sebastian**: from `vscode/`, `npm run watch` → wait for "Finished compilation"
   (CSS/TS must reach `out/` — the launcher only compiles when `out/` is missing; if
   `out/` seems stale: `ps aux | grep build/next`, no process = transpile lane died).
2. **Session**: launch via the launch skill
   (`vscode/.claude/skills/launch/scripts/launch.sh`, prints JSON pid/ports/runDir).
3. **Session**: seed the throwaway profile's `User/settings.json` with the M2 kit, then
   FULL relaunch (same runDir) — `window.titleBarStyle` is read at window creation, a
   renderer reload is not enough:
   `{ "window.titleBarStyle": "native", "window.customTitleBarVisibility": "never",
   "workbench.activityBar.location": "top", "workbench.colorTheme": "Dark+" }`
   (D13: without the first two the gate class must stay OFF and geometry stock — that
   itself is a checkpoint assertion.)
4. **Session, over CDP** (structure only — CDP cannot see vibrancy):
   - gate class present on `.monaco-workbench`; `--zoom-factor` var == real zoom
   - tab row height ≈ 46 CSS px at zoom 0; `--editor-group-tab-height` follows
   - sidebar composite header ≈ 46; title caption row = 24; sidebar content bottom
     flush with statusbar top (46 + 24 = 70)
   - zoom cycle via `workbench.action.zoomIn/Out` to +1/+2/−1/−2: each level, CSS px
     heights = 46 / zoomFactor (physical 46pt constant)
   - gate flip: set `customTitleBarVisibility: "auto"` in the seeded settings → class
     drops + stock geometry returns live; revert to "never" (a `titleBarStyle` flip
     needs a relaunch — out of scope for the live check)
5. **Session**: `screencapture` shots (compositor-level, captures vibrancy — CDP shots
   cannot): zoom 0 + one zoomed level, with a busy window/wallpaper behind the app so
   translucency and the 46pt bar read against something.
6. **Sebastian, visual pass** (the real acceptance): lights vertically centered in the
   46pt bar; tab text sits right in the full-height tabs; title caption row reads as a
   slim 24px band; nothing double-painted; zoom levels feel identical physically.
7. **Cleanup**: kill pid, `rm -rf` runDir; Sebastian stops the watch when done.

Expected-rough per stage (do NOT fail the checkpoint on these): after slice 3 — tab
text ~1px low (slice 4), breadcrumbs still 22px (slice 5), no drag surfaces beyond
statusbar (slice 6). Watch-list items from the slice 2+3 reviews to JUDGE at the
checkpoint: `.title-label` stock 12px padding-left puts the centered caption ~12px
right of true center (injection had it too — decide keep/fix); pill `border-radius`
is shape-without-fill (stock `background: none !important` on codicon labels — the
rounding only shows if hover/checked paints; if a filled pill is wanted, that rule is
the one to gate); `.action-item.icon` stays 35px tall (label centers fine — revisit
only if the hit target feels wrong). Packaged-app pass: once at M2 close, not per
slice (gulp build + virgin profile must show STOCK layout per D13 + seeded profile
shows the bar).

## M3 — Tree & type polish (kills `tree-sticky-mask.js`; both extensions uninstalled)

- [ ] Sticky-scroll mask inside the tree widget (`src/vs/base/browser/ui/tree/`)
- [ ] Sidebar lists: inset rounded rows, indent-guide 3px shift onto chevrons, pane-header
  padding, scroll shadow off
- [ ] Search view: widget padding + replace-toggle anchored to the first input row
- [ ] HN UI font: ship the `hn-weight-shift.css` @font-face weight map in product CSS;
  workbench font-family → 'HN UI'
- [ ] **Acceptance**: Custom UI Style and Vibrancy uninstalled, both JS shims retired,
  UI pixel-identical

## M4 — Branding & marketplace (full rebrand per D2, VS Code Marketplace per D3)

Baseline: the old install was fresh (settings + extensions only, re-added by hand) — no
data-migration tasks. All changes are commits to `product.json` and resources in `vscode/`.

- [ ] `product.json` identity: `nameShort`/`nameLong` → VSebCode; `applicationName` (CLI) →
  `vsebcode`; `dataFolderName` → `.vsebcode`; `darwinBundleIdentifier` →
  `dev.sebastiansuarez.vsebcode`; `urlProtocol` → `vsebcode`; sweep remaining macOS-relevant
  identity fields
- [ ] `extensionsGallery` → VS Code Marketplace: the 8 values recorded in D3
- [ ] Icons/images: generate with Nano Banana Pro via the `agy` CLI; regenerate `.icns`
- [ ] `!!APP_NAME!!` literals (surfaced 2026-08-31, pending approval): imported vscodium
  patches embed VSCodium's build-harness placeholder verbatim — we skip their substitution
  step, so it shows raw in the UI (seen in the SCM-viewlet welcome text, Phase B
  screenshot 02). Sweep/replace during the rebrand
- [ ] Check window title, About dialog, dock name, CLI binary name
- [ ] **Acceptance**: app presents as VSebCode everywhere; an MS-marketplace-only extension
  installs; settings + extensions re-added by hand in the new profile

## M5 — Signing & updates

- [ ] `security find-identity -v -p codesigning` — confirm the Developer ID Application cert
- [ ] Sign the packaged app (`codesign --deep --force --options runtime` + entitlements from
  `vscode/build/darwin/`) — old harness-specific signing notes live in the session backup
- [ ] **Acceptance**: `codesign -dv` shows Developer ID; keychain and TCC grants survive a
  rebuild without re-prompting
- [ ] Updater: verify update checks are off/no-op in this build (`update.mode`, product config)
- [ ] Optional: notarize with `xcrun notarytool` (only if ever distributed)

## M6 — Upstream sync ritual (each stable release)

- [ ] First dry run + document (README has the shape): fetch `ms`, pick the tag via
  vscodium's `upstream/stable.json`, rebase `vsebcode`, `push --force-with-lease`, bump both
  pins in the umbrella, rebuild, spot-check the 46pt-bar surfaces, re-sign (M5)
- [ ] Optional: recurring reminder or a small `sync.sh`

## Settings repo follow-up (after M1–M3)

- [ ] Strip the title-bar hack block + `custom-ui-style.external.imports` from
  `settings.json`; tag the last injection-era commit first
- [ ] Retire `zoom-css-vars.js` / `tree-sticky-mask.js` / `hn-weight-shift.css` from the
  Settings repo (shipped in product now)
- [ ] Update Settings/CLAUDE.md to point here
