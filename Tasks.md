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
  breaks past ~103 chars. **This bites the launch skill** (learned 2026-08-31): its default
  runDir under `$TMPDIR` (`/var/folders/...`) is ~105 chars → main dies with
  `listen EINVAL ... 1.12-main.sock` right after CDP comes up. Always launch with
  `TMPDIR=/tmp` so runDirs land at `/tmp/code-oss-dev/...`. Also: the dev app's GUI
  process name for AppleScript/frontmost is `Code - OSS`, not `Electron`.
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
- [x] Tabs: the −1px optical text nudge — `1a7b14c` (gated, text container only, rationale
  kept; noted: under `tabSizing: shrink/fixed` the overflow-gradient `::after` re-anchors
  to the text container — spec-exact port, glance if tab sizing ever changes)
- [x] Breadcrumbs 25px row — `8c35fbd` (D11 honest constant: `breadcrumbsHeight` getter
  feeds BOTH `EditorTitleControl` readers, 25 gated / 22 stock; relayout rides the tabs
  control's existing gate listener; scoped to `.breadcrumbs-below-tabs` only — the spec's
  unscoped selector would have silently diverged on single-tab inline breadcrumbs;
  `background: transparent !important` dropped as a proven no-op. Hairline is the spec's
  literal `rgba(204,204,204,0.2)` — NOT theme-tokenized; revisit if a light theme ever
  matters)
- [x] Drag regions + variants — `2811166` (one gated block in style.css, flat selectors,
  `:not(.fullscreen)` per the injection; banner inset + holes; M1 statusbar drag untouched).
  **Nosidebar fix included** (Sebastian's live find: lights over the first tab →
  `padding-left: calc(--traffic-lights-width + 8px)`, measurement-followed, no JS twin
  needed). Spec correction: the header no-drag hole cut at `.composite-bar`, not its
  container (container is full-width since slice 3 — would have killed the drag surface).
  Caveat attribution RESOLVED (stale injection prose from the bottom-band era): the
  native ~45.5pt strip covers header+tabs (inert-but-kept for y ≤ 12 rollback); the LIVE
  CSS drag surfaces are the 24px caption row + statusbar — verify by hand at the pass
- [x] **Acceptance — M2 CLOSED 2026-08-31**: dev-instance visual pass accepted by
  Sebastian (Dark 2026 seeded; structural battery all-green: 46/24/70 exact, zoom
  0/±1/±2 tracks 46 physical pt with caption constant 24, gate flips live both ways,
  nudge −1px, breadcrumbs 25+1 hairline with title total 72, drag map as designed,
  nosidebar clearance 94px). Remaining tails, owned as follows: the settings.json
  reduction is **Sebastian's to apply when he switches daily driving** — exact edit in
  [settings-m2-reduction.md](settings-m2-reduction.md); the one-time packaged-build
  verification **rides with M3's packaged pass** (virgin profile must show STOCK
  layout per D13; seeded profile the full bar)

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
   "workbench.activityBar.location": "top", "workbench.colorTheme": "Dark 2026" }`
   (Sebastian 2026-08-31: Dark 2026 primary, Dark Modern secondary. Dark 2026 verified
   live: D10 alpha composes — sideBar.background arrives as the theme color @ 0.3)
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

Governing decision: D14 (macOS-native always, no D13 gate; sticky colors value-level
alpha-0; dead search padding rule dropped). Slices approved 2026-08-31, delegated one
commit each, diff-reviewed:

- [x] **S1 landed** (`fff7895`, delegated; diff reviewed): `StickyScrollController`
  publishes `--tree-sticky-scroll-clip` (= scrollTop + sticky-widget height) on the
  `.monaco-list` root from `update()` on both paths, last-value guard, removed on
  controller disposal (covers sticky-off flips); var registered. Replaces
  `tree-sticky-mask.js`'s MutationObserver + 2s polling. Compile 0 errors, tree
  browser suite 78/78, hooks ON. Review verified `rerender()` can't move the height
  (same state object; real height changes arrive via onDidChangeContentHeight).
  Noted, not fixed (pre-existing upstream): sticky state is one step stale on find
  widget open/close until the next scroll — the clip stays consistent with the
  widget either way; clip math itself proven paddingTop-independent. No sticky unit
  harness exists anywhere upstream — a real test = new ~60-line suite, skipped by
  brief's escape hatch; behavior gets exercised live at the checkpoint battery.
- [x] **S2 landed** (`9237487`, delegated; diff reviewed): style.css M3 block
  (`.monaco-workbench.mac:not(.web) .part.sidebar`, deliberately no gate class) —
  mask on `.monaco-list-rows` from the S1 var, inset rounded rows (sticky rows
  inherit by specificity over tree.css), indent translateX(3px), scroll shadows off,
  pane-header 12px; zero `!important` (specificity table verified). Plus
  `MAC_TRANSPARENT_SURFACES` {sideBarStickyScroll.background, .shadow} forced to
  alpha 0 via new `transparentSurfaceOnMac` — exact D10 shape, same
  `ColorThemeData.getColor` site, both consumption paths verified (theme CSS vars +
  per-tree overrideStyles). Compile 0, tree 78/78, theme suites 3+8 passing,
  stylelint 0, hooks ON. Watch items: (1) upstream `styleOverrides` contrib
  (`workbench.experimental.modernUI`, default false) would tie our pane-header
  padding (0,6,0 vs 0,6,0, source order decides) and double-inset rows via its
  left/right offsets if ever enabled — inert today, decide if that setting ever
  turns on; (2) aux-bar sticky headers turn see-through (color-level force) without
  the mask → rows ghost there exactly as in the injection era — judge at checkpoint
  whether to extend the mask to `.part.auxiliarybar`.
- [x] **S3 landed** (`b679985`, delegated; diff reviewed): mac-scoped
  `height: 26px` override right after the stock toggle-replace rule in
  searchview.css (stock `top: 0` kept → anchored+centered on the first input row;
  (0,6,0) beats stock (0,3,0), no `!important`; the padding rule dropped per D14 —
  dead in the daily look). Stylelint 0, hooks ON. Parity note: 26px is a literal,
  same as the injection rule — under a non-default sidebar font size the
  custom-font block rescales textarea height but not this; revisit only if scaled
  sidebars ever matter. Replace-hidden state verified a no-op (widget collapses to
  the 26px row anyway).
- [x] **S4 landed** (`2c380fb`, delegated; diff reviewed): new
  `browser/media/hnUiFont.css` — the 10 @font-face rules verbatim from
  `hn-weight-shift.css` (all local(), no font files) + mac-scoped
  `--vscode-workbench-font-family: "HN UI", -apple-system, BlinkMacSystemFont,
  sans-serif` (tail mirrors stock mac `--monaco-font`); imported third in
  `style.ts`. Cascade contract documented in-file: vscodium's
  `workbench.experimental.fontFamily` still wins (inline var beats stylesheet).
  Compile 0, stylelint 0, hooks ON. Parity note: the mac CJK `--monaco-font`
  `:lang()` variants are shadowed by our always-set var (CJK glyphs fall through to
  -apple-system) — same behavior as the injection era; add four `:lang()`
  companions only if CJK UI ever matters.
- [ ] **Checkpoint round 1 — done 2026-08-31, verdict: fix round required.** CDP battery
  all-green (clip math exact incl. live scroll: 424 = 380 + 44; mask tracks; forces
  live; toggle 26px anchored; HN UI loaded; D14 no-gate split verified at stock
  settings). Sebastian's visual pass surfaced, all root-caused: (1) tab clipped −26px —
  LATENT M2 BUG: gated breadcrumbs CSS beats stock `.hidden` display:none on
  no-breadcrumb editors (Welcome) while JS correctly excludes the row → group
  auto-scrolls; M2 battery only measured with a file open. (2) pills can bleed under
  the lights when inset+pills exceed a narrow/zoomed sidebar (flex `center` → needs
  `safe center`; at default 299px nothing overflows through zoom +3, measured). (3)
  caption icons 11px = vscodium patch parity (identical rule in daily bundle) but
  under-sized next to 20px pills → 16px override approved. (4) guide-through-icon =
  seed ran stock tree.indent 8, shift calibrated for 16 → D15 default. (5) accordion
  header opaque = Dark 2026's sideBarSectionHeader.background, never in D10 sets →
  alpha-0 force approved. (6) sticky differentiation too subtle → D14 amendment (0.15
  tint + hairline + 140ms fade). Plus D15 recorded: design as default, no
  configuration — seeded-kit checkpoints retire; virgin = full design. Launch-skill
  learnings: relaunching the same profile needs full process-tree exit (port-free is
  NOT exited — dying instance still writes state; premature relaunch triggers
  single-instance arg-forwarding → ghost "Untitled (Workspace)" windows from revived
  backups; purge Workspaces/Backups/workspaceStorage after full exit) and must go
  through `./scripts/code.sh` (raw Electron lacks VSCODE_DEV env → workbench.html/NLS
  errors). `!!GH_REPO_PATH!!` placeholder 404s announcements fetch — add to the M4
  `!!APP_NAME!!` sweep.
- [x] **Fix round landed** (`bf73bb4` visual + `d350494` D15 defaults; delegated,
  diffs reviewed, hooks ON, tsgo-noEmit clean ×2, stylelint 0): F1 breadcrumbs
  `:not(.hidden)` + `:has()` guard (real sites: editortitlecontrol.css, NOT
  style.css); F2 `safe center` (sidebarpart.css); F4 sectionHeader → alpha-0 set;
  F5 16px codicon override (beats vendored (0,5,0) at (0,8,0); pills keep 20px at
  (0,14,0) — verified by count); F6 sticky → new `MAC_TINTED_STICKY_SURFACES` @
  0.15 + hairline + 140ms fade (empty keeps display:block + pointer-events:none —
  LOAD-BEARING: stale inline height persists at z-index 13; rows are torn out
  synchronously so the fade reads as fade-IN only, by design). D15: titlebar pair
  (desktop.contribution, `isMacintosh`), activityBar top + tree 16/always
  (`isMacintosh && isNative`), theme needed NOTHING (Dark 2026 already
  `ThemeSettingDefaults.COLOR_THEME_DARK`). No tests assert old defaults.
  **DEV-LOOP CORRECTION (supersedes the 2026-08-29 watch-anatomy note)**: this fork
  DISABLES esbuild transpile (`[vscodium] 00-build-disable-esbuild`,
  `useEsbuildTranspile = false`) — `npm run watch` typechecks but NEVER writes
  `out/`; every prior checkpoint ran on `out/` refreshed by per-slice agent
  compiles. Dev loop = `npm run compile` after changes (or decide later to revert
  that patch). Fix-round suites ran as baseline only (stale out/) — re-run after
  compile. Accepted parity notes: multi-diff entry headers in the sessions UI
  consume sectionHeader var → transparent on mac (dormant D12 surface); sticky-row
  vs container compositing (~0.28 plate over 0.15 band in the 8px gutters) — judge
  at round 2.
- [x] **D15 tails landed** (`d5e6a6e`, delegated; diff reviewed; tsgo clean, hooks
  ON): (a) `getTitleBarStyle` fallback → NATIVE on macOS (main-process registry
  never sees renderer defaults; full 9-consumer main-side audit in the agent
  report — all verdicts safe; bonus: kills a pre-existing stray
  `titleBarOverlay: true` main/renderer WCO mismatch; `windows.ts:243-247` forced
  hiddenInset unconditional, window chrome unchanged); (b)
  `COLOR_THEME_DARK_INITIAL_COLORS` re-derived from 2026-dark.json's include
  chain — 106/139 entries updated (full-palette coherence; consumer emits every
  id), id set unchanged; splash path proven to flow through `getColor`, so D10/D14
  alpha forces apply to the first frame automatically (plain hexes correct, the
  constant stays platform-shared). Post-compile probes owed: sheet offset gone
  (Save As sheet flush with window top), first-frame vars `#121314`/`#191A1B` with
  sideBar/titleBar at rgba(…,0.3). Noted for approval, not done:
  `COLOR_THEME_LIGHT_INITIAL_COLORS` has the identical staleness vs Light 2026
  (dormant while dark is the sole default; mechanical re-run if wanted).
- [x] **Checkpoint round 2 — battery green, visual verdict: 3 changes** (2026-08-31).
  Compile saga resolved (two false "finished" = the watch's typecheck message; real
  `npm run compile` verified by marker-grep in out/ before launching — adopt that as
  standard practice). Virgin-profile battery all-green: D15 out of the box (gate ON,
  46/24 exact, pills 20px safe-center, Dark 2026 #121314, indent-16 guides always,
  HN UI), F1 tab fully visible (title 46 on Welcome, breadcrumbs correctly absent),
  F4 accordion transparent, F5 caption 16px, F6 tint+hairline+fade live, sticky clip
  exact under live scroll (1px probe delta = the hairline border, covered by itself),
  search toggle 26 centered, suites 78/3/8 + full node sweep 10896 passing (8
  pre-existing failures in the vscodium patch's own font.test.js — untouched since
  D8 import, first-ever run of that suite; decision pending). Sheet probe
  inconclusive visually (modern macOS Open panel presentation) — code path proven.
  Sebastian's verdict → round-2 fixes: (1) banner steals the lights row → banner
  moves to the BOTTOM (above statusbar, mac-native, grid change + CSS inset
  removal); (2) sticky 0.15 tint REJECTED on sight → fully transparent, hairline +
  fade only (row plates die with it); (3) D16: AI nuked — interim
  `chat.disableAIFeatures: true` default now, full excision = M9 next session.
- [ ] **Fix round 2 (delegated, two commits)**: banner-to-bottom + sticky alpha-0
  revert; interim AI-off default. Then: Sebastian compiles (verify markers in out/
  FIRST), relaunch virgin, re-verify (banner-at-bottom geometry with trust banner
  visible, pills stay on the lights line, toasts/quick-input sanity, sticky bare,
  no chat view), his final judge.
- [x] **Checkpoint round 3 — battery green; Sebastian's judge found the material
  patchwork** (2026-08-31): banner-above-statusbar exact (852+26=878, lights row at
  0 with banner up, `--banner-height` 26px feeding toasts, quick input at 0), aux
  bar gone + Cmd+⌥+B toggles, sticky fully bare with live hairline. THEN measured
  paint-stack map (elementsFromPoint per region): pills row 0.3, caption
  **0.51** (sideBarTitle 0.3 re-paints over the part's 0.3), pane headers 0.3,
  tree body **0.51** (per-list style element re-paints sideBar.background on
  `.monaco-list-rows`) — the patchwork Sebastian saw. Fix approved: single-painter
  model (part alone paints 0.3; interiors alpha 0) — AMENDS D10: sideBarTitle moves
  to the transparent set; sidebar `.monaco-list-rows` background transparent in the
  M3 CSS block; sweep for other same-color re-paints.
- [x] **Fix round 3 landed + round-4 verify + DEV ACCEPTANCE** (`6f2061ab8cf`,
  delegated; diff reviewed; hooks ON): single-painter material — sideBarTitle →
  transparent set (amends D10), sidebar `.monaco-list-rows` background transparent
  ((0,6,0) beats the per-list (0,3,0); drop feedback survives via its `!important`;
  drag images/row fills proven unaffected). Sweep: aux-bar editor-background second
  coat + chat-interior sidebar-color fills reported for M9's shadow; composite-bar
  active/inactive color fields found dead upstream. Post-compile map measured:
  EVERY region exactly one 0.3 coat (pills/caption/pane headers/tree body/gutters/
  below-tree). **Sebastian approved the dev instance 2026-08-31 — M3 dev acceptance
  DONE.**
- [x] **Packaged pass APPROVED — M3 CLOSED 2026-08-31** (carried M2's one-time
  packaged verification): bundle marker-grep all-green (CSS: clip mask, HN UI ×11,
  safe center, breadcrumbs guard, banner-height; JS: force sets, banner-last, clip
  publisher, 2026 splash, aux-hidden + titlebar defaults; main.js: mac-native
  fallback + M1 hiddenInset). Virgin .app booted (executable is
  `Contents/MacOS/Code - OSS`, NOT `Electron`): gate ON out of the box, Dark 2026
  first frame, HN UI, nosidebar tab clearance — Sebastian approved. Known quirk
  (not ours): Recents leak across profiles via `~/.code-oss-shared` shared storage.
  **DEFERRED FIX recorded on the board**: at higher zoom levels the fixed-physical
  46pt bar overflows tab text/icons (bar shrinks in CSS px, glyphs grow) — future
  slice: clamp/scale the physical constants under zoom.
- [ ] After close: Sebastian's daily-driver switch per
  [settings-m3-reduction.md](settings-m3-reduction.md) (supersedes the M2 doc):
  settings reduction, uninstall Custom UI Style + Vibrancy, retire the three shims
  launch skill with `TMPDIR=/tmp`; CDP battery — clip var tracks scroll/sticky height,
  mask boundary sits under the sticky widget, row inset 8/…/7px incl. sticky rows,
  indent-guide shift, pane-header 12px, no scroll shadows, toggle-replace 26px on the
  first row, computed workbench font-family resolves HN UI faces, no D13-gate coupling
  (M3 look present with stock titlebar settings too); `screencapture` shots; then
  Sebastian's visual pass.
- [ ] **Packaged pass** (carries M2's one-time verification): gulp build; virgin
  profile = STOCK geometry per D13 while showing M1/D10 dressing + M3 trees/font per
  D14; M2-seeded profile = the full 46pt bar.
- [ ] **Acceptance**: UI pixel-identical to the injection daily look; both JS shims
  retired. Sebastian's own follow-ups at daily-driver switch: uninstall Custom UI
  Style + Vibrancy, apply the settings edit (M2 doc + M3 pieces: vibrancy settings,
  `font.sansSerif`, remaining external imports, stylesheet block, sticky zero-hexes)

## M9 — AI excision (D16/D17; site map in [m9-excision-plan.md](m9-excision-plan.md))

Survey done 2026-08-31; scope ratified as D17. One delegated commit per slice, hooks
ON, `Area: sentence` subjects, no AI attribution. Every slice: `npm run compile` exit
0 + targeted eslint/suites + grep-proof of zero remaining imports of the removed area
(this fork's watch never writes `out/` — compile by hand). NO gulp packaging until B1
lands (build entry wiring is removed there). Resume cold: read the plan doc first.

- [x] **S1 — Extension-facing API surface LANDED 2026-08-31** (`988c87fc3ad` api
  surface −25,640 lines; `545746feae6` built-in extensions −1,812; delegated, diff
  reviewed, hooks ON): 35 modules + 32 proxy IDs + shapes, 5 namespaces +
  `createChatStatusItem` + `isAgentSessionsWorkspace` + `languageModelAccessInformation`,
  ~110 returned exports + extHostTypes `//#region Chat` (101 exports), `vscode.d.ts`
  19594–21226, 28 proposed dts deleted / 8 emptied to placeholders / 3 kept
  (constraint #7 recorded — proposal names live until their last consumer),
  `extensionsApiProposals` regen proven byte-stable under compile. Extensions: git
  AI co-author feature + `agentsWindow` overrides, TS AI quick fixes
  (`CompositeCommand` relocated), mermaid chat renderer (editor preview kept),
  api-tests AI suites. Verified: compile 0, dts-compile-check 0, eslint 0, api
  suites 614/0 + 67 + 8 + 78, per-extension typechecks green, grep proofs clean
  (re-run at review). Follow-ups routed: aiTextSearchProvider + search AI members →
  S7; git `_chat.editSessions.accept`/`_aiEdits.*` calls → S7; XAA orphan chain +
  schema associations + placeholder deletion → S10; mcp.json association → S2.
  Pre-existing (NOT ours): 4 failures in vscodium-patch `font.test.js` — known
  since M3 round 2, decision still pending.
Execution reordered 2026-08-31 after a mutual-import check (plan §3 "REVISED
EXECUTION ORDER"): provider dirs the roots import (mcp, inlineChat, speech,
agentsVoice, browserView, webContentExtractor, networkFilter, sandbox,
editTelemetry-AI, chatEntitlementService) can only die WITH the roots in B1;
kept-file strips + leaf consumers go early (A phases). Content inventories stay in
the plan's S2–S12 sections.

- [x] **A1 — Terminal AI consumers LANDED 2026-08-31** (`f37e1113ab3`, delegated;
  diff reviewed; hooks ON; 146 files, −33,929): four dirs deleted +
  terminal.all/contribExports/context-keys/menus/decorationAddon/tabbed-view
  strips; `terminalTabsChatEntry` + its CSS removed (load-bearing catch: kept UI
  injected the now-unregistered `ITerminalChatService` non-optionally);
  `XtermTerminal` `resource` param dropped (7 call sites); chat command/setting
  ids INLINED as literals in terminalContribExports with die-with-chat comments
  (contrib/chat still reads them). Verified: compile 0 ×2, tsc noEmit (needs
  `NODE_OPTIONS=--max-old-space-size=12288`), eslint 0, terminal suites 1858/0
  with the −348 delta proven to be exactly the deleted dirs' suite labels.
  DEFERRED to B1 (root importers verified): `agentHostTerminalService.ts` (11
  chat/sessions importers) + `agentHostPty`/`ahpTerminalCommandSource`/
  `chatTerminalCommandMirror` + tests + the `terminal.contribution.ts:49,60`
  singleton + the inlined literal members + 4 orphaned sandbox re-exports.
  Interim caveat live: `ITerminalChatService` declared-but-unregistered until B1.
- [x] **A2 LANDED 2026-09-01** (`5c0a35fac30`, delegated; diff reviewed; hooks ON):
  consumers unwired (commandsQuickAccess AI matching, preferencesSearch AI
  provider, main-file imports); the trio DIRS deferred to B1 — THE RULE caught
  `sessions.common.main.ts:79-81` importing all three (earlier "0 importers"
  measurement was wrong)
- [x] **A3 LANDED 2026-09-01** (`aeb58ae0e52`, delegated; diff reviewed; hooks ON;
  173 files, −17,343): full S7 sweep + A1 hand-offs + editorDictation/voice
  settings + git `_chat.editSessions.accept`/`_aiEdits.*` + welcomeAgentSessions
  deleted; onboardingVariationA assert gone (C1 unblocked); aux-bar new-user
  branch removed whole (behavior-preserving — mac `hidden` default untouched, no
  path opens it for virgin windows); commandCenter always compact; relauncher
  tests retargeted to a generic key. Verified: compile 0, tsc noEmit 0,
  valid-layers-check 0, eslint 0, git ext tsc 0, workbench browser sweep
  9332/60/15 vs baseline 9389/60/15 — the −57 exactly = deleted suites, the 15
  failures byte-identical pre-existing dev-build artifacts (`!!APP_NAME!!`
  substitution + mangled-name compares + 1 undisposed-disposable; predate M9).
  DEFERRED to B1 by THE RULE: ai-services trio dirs, `scmHistoryChatContext.ts`
  (+ SCMHistoryItemTransferData relocation still owed then),
  `searchChatContext.ts`, `notebookChatUtils.ts`, `contrib/remoteCodingAgents`
  (+ main-file line 422), `aiEditTelemetryService` (+ its
  `mainThreadLanguageFeatures.ts:40` injection), Copilot PMF survey pane
  (sessions mains import it; workbench registrations removed),
  `componentFixtures/chat/{chatFixtureUtils,renderChatInput}.ts` +
  `sessions/mockCodeReviewService.ts`, workbenchTestServices chat stubs,
  `accessibility.contribution.ts:16` speech signal contribution +
  `AccessibilityVoiceSettingId`/`SpeechTimeoutDefault` re-exports (chat voice
  actions import them). PENDING SEBASTIAN: cellDiagnostics fate + stripped
  welcomeOnboarding fate (asked at checkpoint)
- [x] **A3-verdicts + A4 + A5 LANDED 2026-09-01** (`29233fda638` cellDiagnostics +
  welcomeOnboarding deleted whole incl. build globs/i18n entry + dead setting;
  `c63488449fc` Copilot entitlement/policy strip; `89e61fd1c54` process de-wiring;
  delegated, diffs reviewed, hooks ON, roots-untouched verified by empty diff):
  assignment Copilot filter, chat-enablement migration (only writer of
  `chat.disableAIFeatures`), accountPolicyGate contribution, node
  copilotManagedSettings impl + IPC + desktop client, copilotTokenInfo plumbing,
  inline-completions SKU/telemetry/`github.copilot.nes` rename chain cut
  (`RenameInferenceEngine` kept test-only pending C1 cut per D16 reshape);
  app/sharedProcess/cli/server lost mcp+sandbox+networkFilter+webContentExtractor
  +Playwright (webContentExtractor de-registration was load-bearing — eager
  `accessor.get` = main-process crash), `--add-mcp` + MCP help category gone,
  auth MCP actions + preferences McpSettingsRenderer + mcp.json schema
  association + mcp/agents.md diagnostics tags gone. Verified per commit:
  compile 0, eslint 0, valid-layers-check 0, suites 386/0 notebook (−2 = deleted
  tests), 582/15 accounts-glob (−8 = deleted suites; 15 pre-existing), 780/0
  platform-glob (zero delta). DEFERRED to B1 (blockers verified):
  copilotManagedSettings common/ipc files (sessions.main + chat.shared import),
  accountPolicyService.ts entirely (sessions.main ctor + policyBlocked contrib),
  base defaultAccount copilot fields (chat/agentHost readers),
  completionsEnablement.ts (chatStatus readers), LM provider extension tag,
  profile mcpResource/SyncResource.Mcp (mcp+sessions read), managedSettings.ts,
  defaultAccount defaultChatAgent pipeline (10 chat + 9 sessions readers; per
  D17 the enterprise account-policy/managed-settings stack dies with it — B1/C1).
  NEW C1 items routed: mainThreadLanguageFeatures:1516 isCopilotLikeExtension
  read, RenameInferenceEngine cut, renameSymbol orphans (commandId, tracker
  service singleton + its 2 main-file imports, emptyResponseInformation option,
  supportsRename), notebook write-only error context keys, IProductOnboardingTheme
  + product.json onboardingThemes, auth MCP data-table column, config-editing
  mcp.json jsonc filename map, diagnostics claude/agent tags, developerActions
  IAccountPolicyGateService read. Interim caveats live: sessions.main
  getChannel('copilotManagedSettings') dead until B1; agent services
  unregistered while dirs remain.
- [x] **B1 — THE ROOTS COMMIT LANDED 2026-09-01** (`b93b80a9edd`, delegated; diff
  reviewed; hooks ON; **2742 files, −697,069 lines**): all 20+ AI trees deleted +
  every deferred hand-off + main-file/electron/shared/server/CLI/build wiring.
  Verified: compile 0, tsgo noEmit 0, valid-layers-check 0, eslint 0, gulp 324
  tasks load, smoke compile 0, browser sweep 4984/8 fail node 7241/5 fail — ZERO
  new failures (drops = deleted suites; disappeared failures = deleted trees'
  own; remaining 13 = pre-existing IssueReporter/CommandService/font.test set).
  Uncataloged fallout fixed + cataloged (biggest: the `browsers` extension API
  removed end-to-end; `build/lib/copilot.ts`'s non-AI ripgrep filter relocated to
  new `build/lib/ripgrep.ts`; `SCMHistoryItemTransferData` relocated to
  scm/common/history.ts). Shapes chosen and reviewed: `accountPolicyService`
  DELETED whole (desktop → policyChannel ?? NullPolicyService; web → Null;
  **MultiplexPolicyService now testless** — C2 may add a replacement test);
  `IDefaultAccountService` KEPT reduced (enterprise marketplace/update/sign-in
  readers are real; entitlements/policy/MCP-registry/managed-settings pipelines
  gone; C1 must remove `product.defaultChatAgent` together with its remaining
  read). themeMainServiceImpl surgery verified minimal (M1/D15 logic intact).
  Accepted contained delta: light-theme floating-panels background editor→sidebar
  under `workbench.experimental.modernUI` (default OFF, upstream feature —
  D15 design unaffected); `--vscode-agents-fontWeight-semiBold` → literal 600
  (identical computed value). Size/token registries KEPT (real kept consumers —
  constraint #4 verified not-clean); design-token stylelint now path-only (weight
  category gone). B2-forced early: mcp profile/config-layer closure,
  `handleChatRequest`, `--agents`/`agent-plugins-dir` arg readers. 135
  isSessionsWindow/agentsWindow/openAgentsWindow refs remain for B2.
- [x] **B2 LANDED 2026-09-01** (`9e2d585f625`, delegated; diff reviewed; hooks ON;
  114 files, +389/−1402): env member + 103 context-key guards + WindowEnablement
  + agentsWindow schema property (44 override sites) + preferences override UI +
  electron-main window/profile machinery (openAgentsWindow, sessions html path,
  agents profile + prompts/languageModels/agentPlugins resources) + telemetry/
  storage/ext-host propagation + issue-reporter AgentsWindow source + git
  extension when-clauses + dangling proposed-dts tsconfig include. Verified:
  compile/tsgo/layers/eslint 0, node 7238 (−3 = deleted tests) browser 13443
  (−5), failing sets byte-identical to baseline (stash-verified). Behavior
  guards honored: SYSTEM_PROFILES_HOME kept (deleting would purge a real user
  dir), WindowKind assignment header preserved via constant, IssueReporter
  template shape preserved exactly. Routed → C1: FallbackApplicationStorage
  client/server orphan chain, `setFallbackStorage` dead param,
  `MenuId.ModalEditorTitleContext` single-consumer orphan. → C2: re-check
  extension tsconfigs for S1 dts leftovers.
- [ ] **C1 — Platform residue + product** (plan S10: ~70 MenuIds,
  menusExtensionPoint AI keys, activation events, chat signals + 2 MP3s,
  editor/base residue, codicons, marshallingIds, product.json/product.ts AI fields
  + OSS fallback, known-variables 80 vars, themes chat overrides, XAA orphan chain,
  last proposal placeholders + extensionsApiProposals regen, orphan-closure sweep,
  final straggler grep)
- [x] **C2 LANDED 2026-09-01** (`7f900966b65`, delegated; diff reviewed; hooks ON;
  149 files, −14,683): default-account stack + `defaultChatAgent` field deleted
  end-to-end (C-phase verdict 1; gallery SKU gate → plain manifest fetch,
  mock-policy-server script deleted); agent-CLI shell types/title patterns/
  setting nuked (verdict 2); diagnostics AI-tool tags + editsKept/editsUndone
  signals + MP3s (verdict 3); rename-telemetry closure incl. monaco.d.ts +
  styleOverrides dead selectors (verdict 4 — notebook inlineDiff stack KEPT: the
  guard caught that it's LIVE behind non-AI `toggleInlineView()`, only chat
  class names/scheme cleaned); deps dropped root+remote (lockfiles untouched —
  Sebastian's `npm i`), both typings shims deleted, cglicenses row removed;
  smoke chat area + automation chat/agentsWindow + test/mcp deleted (+ smoke
  accessibility Chat block); sessions-e2e workflow, agent-sdk-produce.yml + 7
  refs, .github AI docs/skills/classifier/commands/CODENOTIFY rows, saved-search
  prune, .vscode tasks/launch/mcp entries, policyData.jsonc ALL 28 dead AI
  policies + 2 empty categories + fixture (widened, accepted), terminal-suggest
  dead flags, vite DomWidget branch; NEW MultiplexPolicyService test (5 tests —
  replaces coverage lost in C1). Verified: all 7 build checks 0, node 7215/5
  (+5 = new suite), browser 13370/12, failure sets byte-identical pre-existing;
  grep proofs zero outside lockfiles (66+5 lockfile hits pending npm i).
  KNOWN: component-explorer dev viewer resolved `zod` via root node_modules —
  if a vite/rspack dev run breaks post-npm-i, add zod to
  build/{vite,rspack}/package.json devDeps.
- [x] **C3 LANDED 2026-09-01** (`99019ba270e`, delegated; diff reviewed; hooks
  ON): aux-bar embedded-editor sideBar-background repaint rule deleted; 4 dead
  ICompositeBarColors fields + their theme lookups removed across 4 parts
  (read-check re-verified: zero property reads in src/; ACTIVITY_BAR_ACTIVE_*
  colors stay live via theming participant + CSS vars). ActivitybarPart 14/14.
- [x] **Tail commit LANDED 2026-09-01** (`b3c3e98a4c7`, delegated; diff reviewed;
  hooks ON; 26 files, −943): all six approved leftovers gone; node + build-script
  suites byte-identical (stash-verified pre-existing failures: FONT ×4,
  CommandService, and the `!!ORG_NAME!!` ADMX placeholders from the vscodium
  branding patch). **M9 CODE COMPLETE — 15 commits `988c87fc3ad`→`b3c3e98a4c7`,
  3,547 files, +1,414/−806,834.** Accepted inert leftovers (noted, by choice):
  `add-policy/SKILL.md` examples cite the two removed PolicyCategory members;
  `.gitignore` `.local.prompt.md` symmetry rows; `.vscode/settings.json`
  aiStats/azureMcp dev settings; frozen `McpGalleryServiceUrl` policy-renderer
  fixtures (decoupled golden data).
- [x] **ACCEPTANCE PASSED — M9 CLOSED 2026-09-01**: push + `npm i` (drift
  `4df1eb7570c`) + compile done; out/ marker gate green (AI absent, M1 markers
  in `windows.js` — dev `main.js` is just the loader, bundling is package-time);
  dev boot APPROVED; packaged bundle greps all green (0 AI refs, hiddenInset +
  under-window in bundled main.js, sticky-clip ×2 + HN UI ×11, product.json
  clean); virgin .app APPROVED ("final design will come later" = future polish,
  not an M9 reservation). Runbook kept below for reference:
- [x] **Acceptance battery — Sebastian's runbook** (session side is done: every
  build check 0, sweeps clean, grep proofs recorded per slice above):
  1. Push the branch (session's push was permission-blocked):
     `git -C vscode push origin vsebcode`
  2. From `vscode/`: `npm i` (regenerates root + remote lockfiles after the C2
     dep drops; postinstall covers remote/). Then tell the session — it commits
     the lockfile drift (M1 precedent `cc871b7`). If a component-explorer
     vite/rspack dev run ever complains about `zod`, the fix is adding it to
     `build/{vite,rspack}/package.json` devDeps.
  3. `npm run compile` — then verify out/ markers BEFORE launching (M3 practice).
     Absence checks: `grep -rc "chat.contribution\|agentHostMain\|sessions.desktop.main" out/vs | grep -v :0` should print nothing.
  4. Dev boot `./scripts/code.sh`, fresh profile. Visual pass: M1–M3 design
     intact out of the box (46pt bar, translucency single-coat, Dark 2026 first
     frame, HN UI, tree polish); ZERO AI surface — palette finds nothing for
     chat/copilot/mcp/agent, settings search `chat.` empty, Help menu has no
     "Ask @vscode", Accounts menu has no sign-in-to-AI entry, aux bar still
     toggles (Cmd+⌥+B, empty), watermark has no "Open Chat"; terminal / scm
     (quick diff) / debug (action-widget header background — C1 restored it to
     banner-background, glance it) / notebook / search / tasks all behave;
     dialogs + quick input still rounded (size-token registration verified in
     code — glance confirms).
  5. Packaged: `npm run gulp vscode-darwin-arm64` → virgin boot of
     `../VSCode-darwin-arm64/Code - OSS.app` (executable `Contents/MacOS/Code - OSS`);
     bundle absence greps: `grep -c "agentHostMain\|chat.contribution\|sessions.desktop.main" "../VSCode-darwin-arm64/Code - OSS.app/Contents/Resources/app/out/vs/workbench/workbench.desktop.main.js"` → 0, and the sessions html absent from Resources.
  6. Verdict to the session → board close-out.
- [x] Pin-bump commits in the umbrella — done: `d33557a` (code-complete pin →
  `b3c3e98`), `6d8ea15` (lockfile pin → `4df1eb7`), plus the close-out docs
  commit; all pushed

## M10 — NeoVim keyboard UX (D19; design phase)

Prototype-first: static HTML mockups of the nvim-inspired UX on the shipped design,
one view per round, Sebastian judges each. Source of truth = one page per view at the
umbrella root (view 1: `m10-nvim-prototype.html`; view 2: `m10-nvim-telescope.html`;
view 3: `m10-nvim-whichkey.html`; view 4: `m10-nvim-flash.html`; view 5 was
`m10-nvim-oil.html`, deleted on withdrawal — D19 r7);
iterate by editing the view's file and re-publishing — the SAME file path keeps the
SAME artifact URL, a NEW view gets its own file + URL. View 1 references: his `~/Projects/Settings/settings.json`
(relative numbers, minimap off, Error Lens, inline blame, Liga SFMono NF, vscode-icons)
and the `2026-dark.json` include chain for every color.

- [x] First view built + published 2026-09-01 (delegated to a Fable-5-max agent per
  the D19 exception; session diff-review + headless-render verification): activity
  pills + neo-tree-style explorer + stock tabs/breadcrumbs + vim-dressed editor
  (real `inlineTitleBar.ts` snippet) + lualine statusbar, Dark 2026 —
  https://claude.ai/code/artifact/e76ac6e0-22f4-494b-8e72-6325de42466c
- [x] Flagged calls resolved 2026-09-01 (1–3 delegated to the session, 4–5
  Sebastian): theme-resolved tints · real 21px line-height + taller window ·
  staged guide deleted · caption as mocked · full-height sidebar with
  editor-scoped statusbar — verdicts + ground rules in board § D19 amendments
- [x] Sebastian's verdict on the first view as a whole — **APPROVED 2026-09-01 at
  v3** (verdict round + breathing-room padding applied; same artifact URL)
- [ ] Product follow-ups for the implementation phase (accepted design intents,
  NOT started): workbench grid surgery — full-height sidebar owning the
  bottom-left corner + statusbar starting at the editor column's left edge
  (stock statusbar is full-width); caption row → dim foreground + true
  centering (settles the M2 watch-list ~12px off-center quirk); sidebar
  view-body padding 6px top / 8px horizontal on the pane/composite CONTENT
  container — generic across views (explorer/search/git), stacking on the
  M3 8px row inset; **tab row → stock (D19 r4)**: REVERT M2 slice-2's gated
  tab-height surgery (`tabHeight` getter 46/zoom + listeners) and the
  slice-4 −1px text nudge — keep the nosidebar lights-clearance padding and
  the 25px breadcrumbs constant; the M3-deferred zoom-overflow fix dies
  with the revert (stock tabs scale normally); **UI font → Geist (D19
  r6)**: replace M3 S4's `hnUiFont.css` + its style.ts import with
  vendored Geist woff2 (OFL; Regular + SemiBold) and the same
  workbench-font-family registration — `hn-weight-shift.css` fully
  superseded; **overlay/motion spec (APPROVED — D19 r8)**: telescope
  180ms fade+scale ease-out-strong,
  which-key 8px rise after the timeoutlen beat, 120ms dismiss, 120ms
  INSERT crossfade, beam blink 500ms halves, instant state steps
- [x] Later views green-lit — **Sebastian 2026-09-01**, build order: telescope
  overlay → which-key → flash jumps → oil.nvim-style buffer file-ops (trouble
  diagnostics list · harpoon revisit = candidates, not green-lit; oil later
  withdrawn — D19 r7)
- [x] View 2 — telescope overlay **APPROVED at v1, 2026-09-01** — all 5 flags
  approved as mocked (recorded durable in board § D19 amendments round 2);
  the session's cursor-row note not taken up → active tint stays as mocked.
  File committed on approval (same path re-publishes to the same URL) →
  https://claude.ai/code/artifact/6eedd738-db38-4d42-8745-ca0ed2c936cc
  Reference record: 920×405 panel (400 results + 1 sep + 517 preview; 403
  inner = 6+16×22+6 results + 39 prompt = 25 title + 18×21 preview lines),
  picker tokens from 2026-dark (coat #202122 @ 0.90, border #333536, focus
  row #297AA0, match highlights #48A0C7, INSERT block #72C892); coherence
  re-verified independently at review: 184/8196 = real rg counts, 16/16
  result paths on disk, true greedy highlight positions, byte-real
  `titlebarPart.ts` 90–107 of 1026
- [x] View 3 — which-key **APPROVED at v1, 2026-09-01** — round DELEGATED by
  Sebastian ("take the decisions that fit the best"); session ruled the
  leader map + all 4 flags approved as mocked (durable in board § D19
  amendments round 3). File committed on approval (same path = same URL) →
  https://claude.ai/code/artifact/1c72b816-6134-4164-be0a-73befd1bfa49
  Reference record: 964×83 strip bottom-anchored to the editor column on
  the M3 8px grammar (left 300+8, top 870−22−8−83; 81 inner = 25 title +
  6+2×22+6 entries), approved panel vocabulary (#202122 @ 0.90, border
  #333536, radius 12, shadow-xl), 4×2 grid column-major, byte-sorted keys;
  review re-verified independently: openSettings/findInFiles ids real,
  #d2a8ff ×2 in 2026-dark.json, diff vs v3 scene = panel+title+legend
  only, geometry untouched, rail coat ×1, zero http/attribution
- [x] View 4 — flash jumps **APPROVED at v1, 2026-09-01** (delegated round;
  session ruled all 5 flags as mocked, durable in board § D19 amendments
  round 5; the r4 tab/window patch applied in-session before publish).
  File committed on approval →
  https://claude.ai/code/artifact/18f2d6b7-5a9c-4ba0-8f28-59586cf45627
  Reference record: `s hei` — 9 real case-insensitive matches in the 37
  visible lines, machine-verified (builder's flashcheck.py, re-run at
  review post-patch: 9/9 positions, labels a s d f h j k l q assigned
  nearest-to-cursor with g excluded — every match continues "heig" — and
  zero other char diffs vs the v3 buffer); match band #27678280 =
  editor.findMatchHighlightBackground (2026-dark:122 verbatim, provenance
  re-verified after a truncated-grep false alarm), backdrop dim =
  foreground fade to comment tone #8b949e (FlashBackdrop→Comment, flash's
  own default link), label = flat char cell #48A0C7/#121314; builder's
  own render pass caught + fixed a dropped statusbar CSS section
- [x] View 5 — oil.nvim buffer file-ops: built + session-approved
  2026-09-01, then **WITHDRAWN by Sebastian the same day** (ruled in the
  animation session; mockup deleted — recoverable at `1436a80` — artifact
  orphaned-private, OUT of M10 and implementation scope; § board D19
  amendments round 7)
- [x] **Font r6 — UI face → Geist (D19 amendments round 6; Sebastian
  confirmed live)** 2026-09-01: 9-candidate research specimen (committed
  as `m10-font-research.html`) →
  https://claude.ai/code/artifact/974a0e56-c878-4852-84c8-b7826dbf4de5
  All five views carry embedded Geist (Regular 400-599 / SemiBold
  600-1000 data URIs; HN light-shift block removed; still zero external
  refs). COMMIT STATE: flash + oil font swaps committed here; views
  1–3's swaps ride the animation-round commit (same files)
- [x] **Animation round APPROVED 2026-09-01** (owned by session
  vsebcode-15; Sebastian ruled there: "all flags approved as built,
  commit it" — all 6 flags stand; durable as board § D19 amendments
  round 8). Motion layer on views 1–3 session-reviewed here
  (transform/opacity only, one ease-out-strong curve, PRODUCT vs
  PRESENTATION values documented in-file, prefers-reduced-motion
  variants, safe class-toggle JS — no network/storage/eval);
  published state = approved state; trio committed with this fold.
  Page affordance: `r` or the r·replay button re-runs the demo.
  NEXT: flash gets the same pass (motion vocabulary lives in the three
  files). Rewrite guard stands: preserve the MOTION sections +
  .play/.out/.kwalk/.mcov/.ecur hooks; walk geometry assumes 22px
  tree rows
- [ ] Only after mockups are accepted: scope the implementation milestones
  (keyboard tree navigation is the first candidate — the one capability VS Code
  genuinely lacks today)
- Resume cold: open the view artifacts (URLs in the view items above); each view's
  html at the umbrella root is its source — view 1 committed at `a884069`, later
  views stay untracked until approved

## M11 — VSebCode icon theme (D20)

Own file-icon set in the M10 mockup icons' language, NBP-generated via `agy`,
default icon theme in the fork. Working dir: `m11-icons/` (umbrella).

- [x] Inventory LANDED 2026-09-01 (`m11-icons/inventory/`, delegated;
  session-reviewed): `merged-inventory.json` 1534 concepts,
  `core-tier.json` 145 file + 40 folder ranked (+ 54 collision resolutions),
  `stats.md` provenance/overlap; extraction scripts + raw upstream files kept
  as provenance. Naming = vscode-icons with 11 audited overrides. Untracked
  until the gate ruling
- [x] Pilot LANDED 2026-09-01 (`m11-icons/pilot/`, delegated; session-reviewed +
  published): 16-icon NBP sheet through the full pipeline; checkpoint page →
  https://claude.ai/code/artifact/b486caca-e065-4a3b-a997-c87921d05461 —
  findings + M10 A/B recorded in the board M11 entry. `pipeline.sh` re-runs
  the slice/key/trace steps; tools installed: imagemagick + potrace (brew),
  vtracer 0.6.5 (cargo). Dir stays untracked until the gate ruling
- [x] **Gate RULED 2026-09-01** — both session recommendations accepted
  ("use your recommendations"; D20 amendment): style bible locked,
  production = hand-authored SVGs in the M10 language
- [x] Batch 1 LANDED + review-green 2026-09-01 (`m11-icons/production/`):
  spec.md + toolkit (letterpath/contact/validate + Inter Bold OFL) + 26
  icons; canon drift measured per-pixel (3 bit-identical, 3
  letterform-AA-only); validator 26/26; centring laws in spec. PENDING
  Sebastian (non-blocking): yaml off-brand plum vs npm-twin brand red
  (spec.md §9)
- [x] ALL SIX parallel batches LANDED + review-green 2026-09-01: 237 SVGs
  (145 core files + 10 category generics + default file + 40 folders ×
  closed/open on the canon-base emblem system; no generic-folder asset by
  ruling — canon pair serves the 324-concept fallback). Validator 237/237,
  ~107KB total (avg ~500B/icon). Per-batch gate rulings accumulated (R1-R11:
  family-rhyme sanction, ink-width badge law + descender/lowercase forms,
  twin threshold Δh12/ΔL12/ΔS25 + neutral-lane exemption, form-collision
  gate, logo-mark letterpath exemption; standing off-brands: yaml plum
  [Sebastian veto open], powerpoint crimson, nim, astro, fsharp). Known
  debt: cross-batch hue twins enumerated by batch 4's audit
- [x] ASSEMBLY LANDED + session-verified 2026-09-01: reconciliation 26
  retints + 3 mark redraws → audit 0 open (2 accepted R8 residuals + 109
  silhouette hue-neighbourhoods, reasons logged); spec errata R1-R11 +
  §10 operative readings; tooling versioned (audit/raster/set-manifest/
  contact-full/build-theme); theme JSON self-check clean (237 defs, 2010
  ext, 1668 names, 624 langs, 368+368 folders, 1015 long-tail→generics;
  1554 shadowing generic name rules dropped — VS Code resolves fileNames
  before fileExtensions); full-set sheet →
  https://claude.ai/code/artifact/e3f8fc9e-9d7d-4ce3-98ba-f39b7a24cb83 ;
  validator 237/237 re-run by the session; Geist r6 checked — icon canon
  letterforms unaffected (view-1 defs still -apple-system)
- [x] **GATE RULED 2026-09-01 — Sebastian: "Do all of them"** (three-round
  execution, all gates green): yaml → brand `#CB171E` (R10a ruled
  exception vs npm — his call, separation rests on letters + value gap);
  git restored `#E0603C`, claude → `#E2957E` (LIGHTER, vs the ruling's
  "darker" — measured: every R7-clearing dark bury ~45% of the sunburst's
  thin spikes; one-line invert `#85381E` recorded; svelte −3L
  consequence); expo → rounded-arch mark SHIPPED (16px proof 1.00/2%),
  clojure → brand split-circle SHIPPED (1.00/2%, white-on-plate); maven
  feather + erlang mark FAILED the 16px proof honestly → letters kept.
  Maven legibility follow-up: micro-fix agent DISPROVED the stated
  peak/faint targets (peak = hex-vs-bg property, faint = letterform alpha
  floor), withdrew the approved two-icon exit on evidence (turborepo
  would become the new dimmest at 0.18) and surfaced the saturation
  escape — ruled + shipped `#A4656B` (0.21→0.40 peak, 62→32% faint, ONE
  icon, turborepo untouched; erlang-axis ΔL 12.2 thin-margin accepted,
  `#A15E65` alternative recorded). Audit exit 0 (accepted: npm/yaml
  ruled · css/html · font/generic-font), validator 237/237, sheet
  republished (`full-set-v2-ruled`, same artifact URL). Tooling caveat:
  `make-set-manifest.mjs` rerun would strip hand-added round keys — fix
  before any manifest regen. requirements.txt → text (inventory matcher
  call, revisit if wanted)
- [x] Fork packaging LANDED 2026-09-01 (`14023da` on `vsebcode`, delegated;
  diff reviewed; hooks ON; 244 files +6140/−3): `extensions/
  theme-vsebcode-icons` (theme-seti pattern; 155+82 SVGs byte-identical to
  the workshop, theme JSON with rewritten prefixes, NLS,
  ThirdPartyNotices = Inter OFL text verbatim, CRLF per .gitattributes);
  default flip at BOTH sites — `ThemeSettingDefaults.FILE_ICON_THEME` AND
  the independently-hardcoded `DEFAULT_FILE_ICON_THEME_ID`
  (`vscode.theme-vsebcode-icons-vsebcode-icons`, computed id proven equal;
  missing it would have reset to Seti on startup) + one truthful comment
  in editor.ts. Build wiring: none needed (glob-driven, verified against
  every theme-seti site). Verified: compile 0 (63/63 clean), self-check 7
  checks clean w/ exact counts, eslint 0, hygiene 0, targeted theme suite
  3/3, `diff -r` svg trees empty, grep `vs-seti` residue = 1 inert perf
  fixture. theme-seti kept selectable. NOTE for Sebastian: the set ships
  `claude`/`agents`/`copilot`/`cursor` FILE icons (they decorate files
  like CLAUDE.md/AGENTS.md in user repos — file recognition, not AI
  features; one word drops them if unwanted next to D16) — RULED KEEP
  (Sebastian 2026-09-01, acceptance session)
- [x] **FULL-COVERAGE WAVES COMPLETE 2026-09-02** (D20 amendment 2, "FIX
  IT") — ALL 18 slices landed + review-green (12 file A01–A12 incl. one
  connection-drop recovery, 6 folder F01–F06): tree now **1,161 file +
  618 folder = 1,779 SVGs**, every slice validated 0-fail with in-slice
  R7/R8 hard-clean, all-proofed 16px discipline, per-slice rulings +
  family declarations accumulated in
  `production/assembly-v2-notes.md` (the assembly ledger). Notables:
  xo shipped (A12, drawn X+O); gleam→Lucy fixed the wave's one real form
  collision; F06 diagnosed the Chrome-147 toolchain hang + fix; slice
  agents caught six+ winding-rule bugs at proof.
- [x] **ASSEMBLY v2 COMPLETE 2026-09-02** (three rounds, ledger fully
  consumed): chromium headless-shell fix landed in tools/; set-manifest
  merge-preserving + regenerated (1779, 0 missing); audit FAMILIES 9→132
  + alias pairs, R7 reading 3 + slice-scope RATIFIED, 21 cross-slice
  letter/mark collisions fixed in round 3, R9b folder-emblem lane
  (reported, not gating); spec errata R11a/R11b/R12/R1a/R13/R14/R14a;
  generators swept to tools/generators/ (27 slots; core-batch4 lost);
  **theme = SPECIFIC-BEATS-GENERAL** (D20-am2 logic: .awk→awk,
  .avif→avif, .sty→sty, Rakefile→rake) with 54 core-tier + **11
  pins.json verdicts** (build-gated, fault-injection proven; pins killed
  the .tsx→qwik / .yaml→esphome / .yml→cloudfoundry / .xml→source
  hijacks + generic store/ dirs); 194 associations flipped to bespoke;
  48 unreachable (+11 open twins) incl. 3 pin-stranded (qwik/ngrx-store/
  redux-store — only matchers were over-broad claims; honest cost,
  recorded). GATES: validate 1779/1779 · audit 0 hard open · theme
  self-check clean. Sheet v3 published (same artifact URL,
  `full-set-v3-coverage`); human-flag list (28 taste calls, all shipped
  with fallbacks) lives on the sheet + resolution-flip-diff.md
- [x] **Fork v2 packaging LANDED 2026-09-02** (`4129e69754f` on
  `80720c4`; the authoring agent hit the session usage limit
  mid-verification — the session completed verification directly, all
  green): asset-only commit, extension icon trees byte-identical to the
  workshop (1,161 + 618), shipped theme = 1775 defs / 2021 ext / 3223
  names / 624 langs / 1093+1093 folders, 0 missing iconPaths, 0 dangling
  associations, all SVGs ASCII, hooks ON, no attribution. Branch now
  FOUR unpushed commits: `14023da` → `1dbd8e5` → `80720c4` → `4129e69`.
  **The on-hold acceptance runbook is now LIVE** — run it against this
  HEAD (picker = VSebCode Icons + None; spot-checks: `Cargo.toml` →
  Rust, `.xo-config` → xo, `.awk` → awk, `store/` → generic bag,
  folder marks at the big size). Pin bumped.
  **Emblem-size ruling (Sebastian 2026-09-01: folder emblems "too small,
  make them bigger")**: closed emblem box 6.5 → 8.2px (same bottom-right
  anchor, 1px inside the corner; limb/counter minimums scale ×1.26; tone
  law unchanged), open variant = flap-maximum (~6.2–6.6px, same
  clearance logic). Resize of the existing 40 core folder pairs
  delegated + spec § folders updated; F01–F06 launch AFTER it lands with
  the new geometry; A07–A12 (files, unaffected) launched in parallel
- [x] Stock icon themes REMOVED by ruling (acceptance session
  2026-09-01→02; delegated to one agent, both diffs reviewed; hooks ON):
  `1dbd8e5` deletes `extensions/theme-seti` whole (+ its
  eslint-allowlist line; i18n/tests verified non-referencing), `80720c4`
  deletes theme-defaults' exposed `vs-minimal` contribution (manifest
  block + NLS line + `fileicons/`; 10 color themes mechanically verified
  intact, zero orphan NLS keys). Both: compile 0, hygiene 0,
  WorkbenchThemeService 3/3 + TokenStyleResolving 7/7, grep-proofs
  clean. Accepted leftovers: inert uri.perf corpus paths (consumer suite
  hard-disabled); seti-ui block in tool-regenerated root
  ThirdPartyNotices.txt (one-block cut on request). Picker end-state =
  VSebCode Icons + None. Pre-hold early-run evidence: default flip
  applied on BOTH boots (dev + virgin packaged profiles, state-DB
  proof); the "vscode-icons installed" sighting = `.vscode-oss`
  extensions dir shared with daily VSCodium → recorded as an M4 input
- [ ] **Acceptance — Sebastian's runbook — ON HOLD until the v2 packaging**
  (run it once, against the complete set; session side done):
  1. ~~Push the branch~~ DONE by the session 2026-09-02 (`54962c7..4129e69`
     pushed — all four icon-theme commits on origin; pin resolves)
  2. From `vscode/`: `npm run compile`, then verify out/ markers BEFORE
     launching (M3 practice; dev out/ is unbundled):
     `grep -rl "vsebcode-icons" out/vs/workbench/services/themes/ | head -3`
     — non-empty = the default flip reached out/
  3. Dev boot `./scripts/code.sh`, fresh profile: tree shows VSebCode
     Icons out of the box (no `workbench.iconTheme` set anywhere); File
     Icon Theme picker offers ONLY "VSebCode Icons" and "None" (Seti +
     Minimal removed by ruling, `1dbd8e5` + `80720c4`); folder
     expand/collapse swaps closed/open variants; spot-check a TS repo
     (ts/tsx/json/md/folders) and `Cargo.toml` → Rust icon (the
     fileNames-shadowing fix)
  4. Packaged `npm run gulp vscode-darwin-arm64` → virgin `.app` boots
     with the set as default (packaging is the only proof the SVG tree
     lands in the bundle)
  5. Verdict to a session → M11 close-out on the board
- [ ] After close: `settings.json` `"workbench.iconTheme": "vscode-icons"`
  becomes droppable at the daily-driver switch (the baked default
  replaces it); vscode-icons extension uninstallable
- [ ] Package as a built-in icon-theme extension in `vscode/` + product default
  (delegated implementation; D15-style bake)
- [ ] Acceptance: virgin build boots with the VSebCode icon set as default

## M4 — Branding & marketplace (full rebrand per D2, VS Code Marketplace per D3)

Baseline: the old install was fresh (settings + extensions only, re-added by hand) — no
data-migration tasks. All changes are commits to `product.json` and resources in `vscode/`.

- [ ] `product.json` identity: `nameShort`/`nameLong` → VSebCode; `applicationName` (CLI) →
  `vsebcode`; `dataFolderName` → `.vsebcode`; `darwinBundleIdentifier` →
  `dev.sebastiansuarez.vsebcode`; `urlProtocol` → `vsebcode`; sweep remaining macOS-relevant
  identity fields. The `.vsebcode` flip also ENDS the `~/.vscode-oss/extensions`
  sharing with daily VSCodium (M11 acceptance find: the packaged fork listed the
  daily's vscode-icons as installed; cousin of the M3 `~/.code-oss-shared`
  recents leak)
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

- [ ] **M2 slice available now** (Sebastian applies, at daily-driver switch):
  [settings-m2-reduction.md](settings-m2-reduction.md) — drops the electron block,
  the zoom shim import, all M2 stylesheet material + the D10-superseded side-rail
  hexes; keeps M3-pending pieces
- [ ] Strip the title-bar hack block + `custom-ui-style.external.imports` from
  `settings.json`; tag the last injection-era commit first
- [ ] Retire `zoom-css-vars.js` / `tree-sticky-mask.js` / `hn-weight-shift.css` from the
  Settings repo (shipped in product now)
- [ ] Update Settings/CLAUDE.md to point here
