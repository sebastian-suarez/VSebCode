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
- **Stale-stylesheet probe gotcha** (learned 2026-09-02, M12 round 3): reusing a
  throwaway `--user-data-dir` across relaunches can serve a CACHED stylesheet —
  the css was current on disk (fetch returned it) yet absent from
  `document.styleSheets`. Before measuring CSS changes over CDP, reload with
  `Page.reload {ignoreCache: true}` (or use a fresh profile).
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

## Reference — isolated visual validation (Tart VM, D23)

Session-driven launches + screenshots run inside a local macOS VM so the host screen stays
free. Verified end-to-end 2026-09-02 (workbench launch from the shared mount, CDP up,
compositor `screencapture` with menu-bar/Dock vibrancy visible, no permission dialogs).
Sebastian's side is unchanged: `npm run watch` + optional `./scripts/code.sh` on the host.

| Action | Command (host) |
|---|---|
| Start VM (headless, repo shared) | `tart run vsebcode-vm --no-graphics --dir=vsebcode:/Users/sebastian.suarez/Projects/VSebCode` (long-running; background it) |
| VM IP (has been stable) | `tart ip vsebcode-vm` → `192.168.64.2` |
| SSH into guest | `ssh -i ~/.ssh/vsebcode_vm -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null admin@$(tart ip vsebcode-vm)` |
| Stop VM (end of session) | `tart stop vsebcode-vm` |

Guest facts: macOS 26.6.2 (Tahoe, matches host generation) · repo mounted at
`/Volumes/My Shared Files/vsebcode` (space in path — always quote) · node v24.19.0 in
`/usr/local/bin` (NOT on non-interactive ssh PATH — `export PATH=/usr/local/bin:$PATH`
first) · jq + curl present · SIP disabled · user `admin` (password `admin`), passwordless
sudo · remote shell is zsh (avoid bare `~` inside command strings — named-dir expansion).

Verified in-guest launch (host `out/` + `.build/electron` used directly — same arm64
macOS, ONE checkout serves both; nothing ever builds in the guest):

```
cd "/Volumes/My Shared Files/vsebcode/vscode" && export PATH=/usr/local/bin:$PATH && \
  (nohup ./scripts/code.sh --user-data-dir=/tmp/<short-udd> --remote-debugging-port=9222 \
   >/tmp/vseb-launch.log 2>&1 &)
# readiness: poll  curl -sf http://127.0.0.1:9222/json/version   (up in ~5-10s)
# capture:   screencapture -x /tmp/shot.png   (compositor-level, vibrancy included)
# fetch:     scp the PNG back to the host scratchpad
```

Rules & known limits:

- **Guest never writes to the mount** — host owns watch, git, and all repo writes.
- Mid-compile hazard is shared with the host loop: verify `out/` markers before launching.
- Screen-capture TCC: base image pre-grants the pre-Tahoe ssh identity only; macOS 26
  asks under `com.apple.sshd-session`. Fixed by a manual row insert (Sebastian ran it,
  2026-09-02). If capture ever prompts again, re-check that row.
- **Display: RESOLVED 2026-09-03** — VZ config is `3024x1964` (`tart set`; the earlier
  1512x982 try would have been 1x — always think in PIXELS, logical×2 for Retina), and
  the guest advertises the right mode list but re-picks remembered 1024×768@2x at EVERY
  boot. Fix = re-apply per boot, idempotent + instant: `displayplacer` v1.4.0 (in guest
  `/usr/local/bin`, prebuilt arm64 from GitHub releases) — parse "Persistent screen id"
  from `displayplacer list` (stable so far: `9A0911C6-7B3D-4140-93FB-DE91CCE602DB`), then
  `displayplacer "id:<ID> res:1512x982 hz:60 color_depth:7 scaling:on origin:(0,0)
  degree:0"` → captures 3024×1964 (14″ MBP logical size @2x). The launch skill's VM mode
  applies this automatically before launching. Related boot gotcha: `screencapture`
  right after VM boot fails with "could not create image from display" until the GUI
  session is up — retry-loop it.
- **Launch skill: ADAPTED (2026-09-03, ruled by Sebastian; fork commit `25326ee`,
  umbrella pin `70886b6`)** — VM mode is the DEFAULT for visual-validation rounds.
  `vscode/.claude/skills/launch/scripts/launch-vm.sh` does the whole dance (starts the
  VM if stopped, re-applies the display mode, waits capture-ready, launches on a virgin
  guest UDD + free CDP port, tunnels CDP to the host, prints launch.sh-style JSON);
  `capture-vm.sh <out.png> [delay]` = compositor shot → host path (correct captures are
  3024×1964). `--kill <id|all>` cleans instance+tunnel+dirs; `--stop-vm` also stops the
  VM. Host-mode launch.sh remains for authed flows + final checkpoints. Full docs in
  the skill's SKILL.md §"VM mode".
- **Guest login-restore is OFF** (`TALLogoutSavesState=false`, set 2026-09-03): before
  that, macOS resurrected old Code OSS instances at every VM boot (with stale argv —
  one zombie survived plain `pkill`, needed `-9`). If a mystery instance ever shows up
  in the guest again, check that defaults key first.

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
- [ ] Product follow-ups for the implementation phase (accepted design intents;
  ROUTED 2026-09-02 into the D21 milestones — grid surgery/statusbar → M13,
  caption + padding + tab revert + Geist → M12, overlay/motion → M16+; tracked
  in § M12–M19, kept here as the design-intent record): workbench grid surgery — full-height sidebar owning the
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
- [x] Only after mockups are accepted: scope the implementation milestones — DONE
  2026-09-02: D21 ratified M12–M16 + gated vim tail M17–M19; plan + survey facts
  in [m10-implementation-plan.md](m10-implementation-plan.md), checklists in
  § M12–M19 below (keyboard tree navigation = M15)
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
- [x] **Acceptance — RUN 2026-09-02, PASSED** (v2 packaged + pushed; hold
  lifted; steps 2–4 executed by the session on Sebastian's "Do it
  yourself"; his verdict "Close it" closed M11):
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
  **Steps 2–4 EXECUTED BY THE SESSION 2026-09-02 (Sebastian: "Do it
  yourself") — all green, full evidence in board § M11**: compile 0 +
  markers; dev + packaged virgin boots each applied `vsebcode-icons`
  out of the box (state-DB proof); picker = None + VSebCode Icons
  (packaged adds the daily's marketplace vscode-icons via the shared
  `.vscode-oss` extensions dir — expected, M4 fixes); 11-file spot
  folder all bespoke incl. Cargo.toml→cargo + lib.rs→rust; src folder
  closed↔open swap live; bundle 1,779 SVGs, zero `vs-seti`,
  theme-defaults iconThemes-free. Screenshots sent. VERDICT: PASS —
  Sebastian 2026-09-02 ("Close it") — **M11 CLOSED**, board Done entry
  written
- [ ] After close: `settings.json` `"workbench.iconTheme": "vscode-icons"`
  becomes droppable at the daily-driver switch (the baked default
  replaces it); vscode-icons extension uninstallable
- [x] Package as a built-in icon-theme extension in `vscode/` + product default
  (delegated implementation; D15-style bake) — done: `14023da` (core set) +
  `4129e69` (v2 full coverage); stock themes removed `1dbd8e5`/`80720c4`
- [x] Acceptance: virgin build boots with the VSebCode icon set as default —
  verified 2026-09-02 (dev + packaged virgin boots, session battery;
  Sebastian's pass)

## M12–M19 — M10 implementation arc (D21; scoped + ratified 2026-09-02)

Reference for every slice: [m10-implementation-plan.md](m10-implementation-plan.md) —
the ratified plan carries the five-agent source survey's exact file:line facts per
milestone. One milestone per session; every slice = one delegated commit
(opus-coder), diff-reviewed, hooks ON, no AI attribution. M4 interleaves at
Sebastian's call and HARD-GATES M17–M19 (the vim extension needs the marketplace).
Dev-loop reminders: this fork's watch never writes `out/` — compile by hand + verify
markers; launch skill with `TMPDIR=/tmp`.

### M12 — Base-scene parity (five slices + fix rounds 1–5 LANDED 2026-09-02/03; Sebastian's checkpoint pending)

All slices delegated (opus-coder), diff-reviewed, hooks ON, no AI attribution;
per-slice `npm run compile` exit 0. Session dev battery run over CDP the same day
(virgin profile, launch skill with `TMPDIR=/tmp`) — every structural assertion
green; details per slice below.

- [x] **S1 landed** (`f881c9aebb2`): stock 35px tab row — inlineTitleBar import +
  zoom/titlebar listeners + tabHeight inline branch + the −1px nudge rule deleted
  (2 files, −34 lines). KEPT as planned: sidebar 46/24 feed, nosidebar clearance,
  25px breadcrumbs (editorTitleControl.ts's inlineTitleBar import is the
  breadcrumbs constant — stays by design), stock `tabsSize35` plumbing. The
  M3-deferred zoom-overflow bug is dead — battery: tabs hold 35 CSS px at zoom
  1.44 with zero clipping while the rail header keeps physical 46pt (31.94 CSS px)
  and the caption 24.
- [x] **S2 landed** (`bcb6d1068`): Geist v1.800 Regular+SemiBold woff2 vendored
  (91.5 KB total, OFL 1.1; official static builds — 975 glyphs, name tables
  intact; bytes extracted from the approved mockup data URIs, upstream provenance
  vercel/geist-font tag `1.8.0` @ `91158e0`, resolved via gh). `geistUiFont.css`
  replaces `hnUiFont.css` (same var + cascade contract; HN light-shift retired).
  `.woff2` added to BOTH esbuild loader maps (optimize.ts, next/index.ts) and
  BOTH filters.ts hygiene lists; ThirdPartyNotices OFL block (alphabetical slot)
  + cgmanifest git entry. stylelint 0; woff2 verified copied into out/ and
  accepted by the commit hook. **Packaged-pass duty**: first gulp build through
  the new loader entries — grep the bundle for the two woff2 assets.
- [x] **S3 landed** (`f7c91fed0f8`): caption dim + true centering. Dim =
  `sideBarTitle.foreground` `#bfbfbf`→`#8c8c8c` in 2026-dark.json + the
  `COLOR_THEME_DARK_INITIAL_COLORS` splash mirror (light constant untouched —
  known-stale, dormant). Centering = equal-rails CSS in the gated caption block:
  empty `::before` + `.title-actions` both `flex: 1 1 0`, label hugs its text;
  overrides part.css's 12px label padding AND compositepart.css's 8px actions
  padding (a third stock rule the plan missed — it outranks part.css's 5px);
  zero `!important`. Agent probe in the repo's own Electron: 0px off-center in
  all normal cases, first toolbar button x identical before/after. Battery live:
  Δ −0.5px, caption h2 inline color rgb(140,140,140).
- [x] **S4 landed** (`3e7b39f72c8`): view-body padding 6px top / 8px sides.
  CSS `box-sizing: border-box; padding: 6px 8px 0` on `.part.sidebar > .content`
  (mac-native always-on, the M3 family) + new opt-in `contentPadding` Part option
  (headerHeight idiom) wired ONLY by SidebarPart under `isMacintosh && isNative`:
  the element keeps the full JS-px box, the composite is announced the reduced
  size. Probe (real compiled PartLayout + real stylesheets, offscreen Electron):
  rows x16 off the rail, pane-header content column x20, no overflow, composite
  284@300, panel/auxbar byte-identical (control case), minimum widths safe
  (sidebar paneview is vertical — width is orthogonal, no splitview assertion).
- [x] **S5 landed** (`fcbe24987be`): dressing as product defaults —
  `editor.lineNumbers` `'on'`→`'relative'` and `editor.guides.bracketPairs`
  `false`→`'active'`, `isMacintosh && isNative` ternaries at the editorOptions.ts
  declarations. lineNumbers needed BOTH its runtime default and its separately
  hardcoded schema default flipped — one `relativeByDefault` const feeds both
  (guides derives its schema default, one edit). Monaco API doc-comments
  deliberately untouched (standalone/web stays stock, so they stay true). Third
  dressing piece = NO-OP by evidence: `scm.diffDecorationsGutterWidth` stock
  default 3 already IS the mockup's 3px bars; colors are theme-resolved
  `editorGutter.*` tokens. 4284 editor tests pass, none asserted the old
  defaults. Battery live (virgin JS buffer): hybrid gutter `1 2* 1 2` with
  absolute on the cursor line, `bracket-indent-guide … indent-active` rendering.
- [x] **Session dev battery** (2026-09-02, virgin profile over CDP): gate ON out
  of the box, Dark 2026 `rgba(25,26,27,0.3)` coat, plus every slice assertion
  above. CDP screenshot on file; compositor `screencapture` came back black —
  display locked, so vibrancy shots wait for Sebastian. Console clean except the
  known languageDetection-worker `require` dev noise. Observed, pre-existing:
  a virgin EMPTY window boots with the sidebar HIDDEN (Cmd+B shows it) — not an
  M12 regression; flag below asks whether D15 should force it visible.
**FIX ROUND 2026-09-02 — Sebastian's checkpoint verdicts, four slices landed
same day** (each delegated, diff-reviewed, hooks ON; his directives verbatim in
the round briefs):

- [x] **R1 landed** (`d8c198c2580`): "completely broken when the system is in
  light mode" root-caused — `window.systemColorTheme` defaulted `'default'`
  (native appearance follows the OS), so a light OS rendered the under-window
  vibrancy LIGHT behind the transparent window's dark 0.30 coats. Default →
  `'dark'` on macOS (his daily rig's own value, settings.json:371) at BOTH
  sites: the main-process Setting fallback (themeMainServiceImpl.ts:46 — the
  one that runs; main never sees workbench-registered defaults) + the schema
  (themes.contribution.ts). User-overridable. Battery: main-process inspector
  shows `themeSource: "dark"`, `shouldUseDarkColors: true` while the OS sat in
  light mode. LEARNING: @playwright/cli CDP sessions EMULATE
  prefers-color-scheme (renderer matchMedia says "light" even when nativeTheme
  is pinned dark) — appearance checks must interrogate the main process over
  its inspector port, never matchMedia through playwright.
- [x] **R2 landed** (`63aee3c943b`) — SUPERSEDES S4 (Sebastian: "remove the
  padding, and added to the accordion content container EXCEPT FOR SEARCH,
  SEARCH HAS ITS CONTENT ALMOST TOUCHING THE BORDERS, FIX IT"): S4's container
  padding + `contentPadding` Part option fully reverted (three files
  byte-identical to pre-S4); instead each SIDEBAR pane's `.pane-body` takes
  6/8/0 border-box, paired via a new opt-in `bodyPadding` hook on
  `Pane.layout` (paneview.ts — the real choke point; a ViewPane-level
  subtraction would arrive after subclasses read the numbers, and shrinking
  `size` corrupts `expandedSize` replay) with ViewPane answering
  location-live (`getViewLocationById === Sidebar`, mac-native) so
  panel/aux-bar-located views stay stock (probe-proven). Headers now run
  FULL-WIDTH to the rail; rows stay x16. Search: the stock lopsided
  `margin: 0 12px 0 2px` on `.search-widgets-container` (the 2px = "almost
  touching") zeroed in the sidebar scope → widgets symmetric at 8px;
  SearchView width math re-tied to the same constant (`widthOffset` reads
  `bodyPadding` — CSS/JS cannot drift); toggle-replace chevron re-anchored to
  the widget (measured broken by the inset — it anchored to the pane corner).
  Battery live (real folder): headers x0 full-bleed, body 6/8, rows x16,
  search widgets 8/8 + chevron 26px @ x8 + results x16, container reverted to
  0/content-box. Notes kept stock by decision: `.wide` breakpoint reads box
  width; upstream ±2px pattern-input slop preserved (identical in panel).
- [x] **R3 landed** (`322ff936f14`) — "Bake all the setting in my repo
  directly into the build": new `vsebcodeDefaults.contribution.ts`
  (electron-browser, imported by workbench.desktop.main.ts) registers the
  daily `~/Projects/Settings/settings.json` as DEFAULT overrides via
  `registerDefaultConfigurations`, `isMacintosh && isNative`, source =
  product.nameLong. 139 keys dispositioned: 120 baked byte-identical
  (machine-diffed), 19 skipped with receipts — 8 already product code
  (tree indent/guides, titlebar pair, activityBar top, lineNumbers,
  bracketPairs, systemColorTheme), 3 would regress the fork's design
  (colorTheme "Dark+", iconTheme "vscode-icons", the stale-1e1e1e
  colorCustomizations block), 8 dead/superseded (chat.disableAIFeatures,
  vscode_vibrancy.* ×2, custom-ui-style.* ×4, window.zoomLevel).
  Settings UI shows them as product-attributed DEFAULTS (no "modified" tag;
  "Default setting value overridden by <product>" hover). Latent-until-
  installed keys proven: errorLens.fontFamily + debug.javascript.
  autoAttachFilter apply the moment a schema registers. This RESOLVES old
  parked flag 1 (git.blame.editorDecoration.enabled bakes — his "all"
  includes it). Registry probe: fontSize 12→14 at the default layer,
  `[rust]`/`[markdown]` language overrides registered. Battery live (virgin):
  editor 14px SFMono, minimap 0-width stub, custom tab labels
  ("src/index"), reversed window-title pattern, Tab Size 2, whitespace
  glyphs, Auto Attach "With Flag".
- [x] **R4 landed** (`cdb8f188ab4`) — "I want to test how does it look with
  SFPro and SFPro light… a sort of debug option": temporary setting
  `vsebcode.uiFontExperiment` = `geist` (default) · `sf-pro` · `sf-pro-light`,
  registered in fork-owned `vsebcodeUiFontExperiment.ts` (deliberately NOT
  inside the vscodium patch's context window; `included: isMacintosh &&
  !isWeb`, tags experimental, description says temporary/delete-on-ruling).
  Single writer preserved: rides `updateFontFamily` in workbench.ts —
  precedence `workbench.experimental.fontFamily` (wins, experiment fully
  inert incl. the light class) → experiment → Geist stylesheet default;
  `sf-pro` = `-apple-system` (that IS SF Pro; no font files), `sf-pro-light`
  adds a `uifont-sf-light` class = base weight 300 by inheritance (explicit
  weights keep — pane headers hold 700), rule lives in geistUiFont.css under
  a DELETE-ON-RULING debug header. 6-case precedence matrix probe-proven +
  live-switch (memoization extended so an experiment-only change isn't
  swallowed). Battery live: flip to sf-pro-light applies without reload
  (SF family, weight 300, headers 700), revert restores Geist exactly.
  HOW TO USE: settings.json → `"vsebcode.uiFontExperiment": "sf-pro"` or
  `"sf-pro-light"` — applies live; remove the key (or `"geist"`) for Geist;
  `workbench.experimental.fontFamily` overrides everything while set.
- [x] **R5 landed** (`b70087d265f`) — "add a debug configuration to change the
  overall fontsize": `vsebcode.uiFontSizeExperiment` (number, default 13 =
  stock, clamp 6–32) in the same debug node — ONE knob scaling the whole UI:
  it resolves the base the vscodium font patch's `updateDefaultSize()`
  derives every surface from at its stock ratio (workbench/sidebar/tabs/
  bottomPane = base, statusBar ×12/13, activityBar ×16/13). Precedence:
  explicit `workbench.experimental.fontSize` (user-set) wins → experiment →
  stock 13; per-surface `workbench.*.experimental.fontSize` keys still win
  their own surface (probe + live-proven: sidebar 11 under experiment 16).
  ARCHITECTURE FINDING: listener registration order is parts-FIRST,
  workbench-LAST (receipt chain down to the emitter's append-ordered
  delivery), so the naive "workbench updates defaults first" design would
  read stale values — instead an idempotent fork-owned
  `applyUiFontSizeBase()` is called by every consumer before reading; the
  CSS var keeps its single writer. SEVEN listener sites extended (a 6th
  surface found: auxiliaryBarPart listens via `SidebarPart.
  fontSizeSettingsKey`, invisible to a literal grep). Battery live: 13→16
  scales var/rows/caption-text/statusbar-text exactly (tabs 35→43.1,
  statusbar 22→27.1 — the patch's own font-driven heights, inherited);
  46pt header / 24 caption / pills stay design-fixed; editor.fontSize
  untouched; clearing the key restores stock exactly. Pre-existing, left
  alone by scope: the vscodium GLOBAL size key still doesn't live-propagate
  on its own (no part ever listened to it — only our experiment key does
  now). HOW TO USE: `"vsebcode.uiFontSizeExperiment": 14` (or any 6–32) —
  live, no reload; delete the key for stock 13; combine freely with
  `vsebcode.uiFontExperiment`.
- [x] **R6 landed — FONT RULED (`e246e6de7ea`)**: Sebastian, on the live A/B
  ("Leave the default font size, use sfpro") → UI face = SF PRO at default
  13px (D19 amendment round 10). Pure deletion, 17 files +16/−430: both
  experiments (R4 face + R5 size) reverted — the seven touched TS files
  byte-identical to `322ff936f14` except ONE hooks-forced token (`let
  family` → `const family` in the restored vscodium updateFontFamily;
  prefer-const fires once the experiment's reassignment is gone, and this
  was the first commit ever to stage that file — pre-M2-gate precedent for
  minimal patch-surface touches under hooks-ON); Geist UNVENDORED (woff2
  ×2, css, style.ts import, ThirdPartyNotices block, cgmanifest entry,
  woff2 loader/hygiene wiring — ThirdPartyNotices/cgmanifest/build files
  byte-identical to `f881c9aebb2`). No font layer remains: stock mac
  `--monaco-font` = `-apple-system` IS SF Pro (probe + virgin-boot live:
  computed family `-apple-system…`, weight 400, size 13px, workbench var
  unset, document.fonts carries only codicons; vscodium fontFamily
  override verified both directions). compile 0, stylelint 0, tree clean.
  NOTE for the M6 rebase ledger: the `00-ui-custom-font` patch's
  workbench.ts line now reads `const family` in-tree.
- [x] Session battery for the round (virgin profile + real demo folder over
  CDP, 2026-09-02): all four slices verified live as noted above; system
  appearance flipped light→dark during the R1 check and RESTORED (his OS
  ends in dark mode); compositor screenshots still blocked (Screen Recording
  permission — terminal captures come back black), CDP screenshot delivered.
  Leaked agent-probe instances found + killed at cleanup (R2/R3-era offscreen
  Electron trees) — sweep `ps aux | grep "Code - OSS"` at every session end.
**FIX ROUND 2 2026-09-02 — Sebastian's second checkpoint verdicts, four slices
landed same day** (one opus-coder run, four commits, each diff-reviewed; hooks
ON, no AI attribution; `npm run compile` exit 0 after every commit). His
"gitlens" READ AS the built-in Source Control view + its Graph pane — no
GitLens exists anywhere on this machine (`~/.vscode-oss{,-dev}/extensions`
hold only vscode-icons; no `gitlens.*` settings keys) and the Graph pane is
the GitLens-look-alike; its pane-body insets measured CORRECT (rows x16,
symmetric), so the real shared defect was the row-label seat — R10:

- [x] **R7 landed** (`bdcdd6bbb92`) — "I want the tab to be the same size as
  the activity bar again, like before": S1's stock-tabs commit REVERTED — the
  gated physical `tabHeight` branch, zoom/inline-titlebar listeners and the
  −1px label lift are back; PROOF: both files byte-identical to the pre-S1
  state (`git diff 4129e69754f bdcdd6bbb92 -- <2 files>` empty). This
  exercises the veto D19 r4 left open (stock read wrong live: lights spacing
  + hairline misalignment) → D19 amendment round 11 on the board. Mockups
  stay at 35px tabs as the historical r4 record — implementation is the
  live truth.
- [x] **R8 landed** (`1b717905346`) — "make the activity bar icons and the
  tab icon + filename change their sizes based on the zoom level": every
  size the fixed 46pt band shows is now PHYSICAL — pill box 34×28, radius 6,
  glyph 20, tab label (reads the patch's `--vscode-workbench-tabs-font-size`,
  so per-surface config still wins) and tab file icon 16 all divide by
  `--zoom-factor`. Tab BOXES/paddings/min-max widths deliberately stay
  CSS-px (zooming resizes layout; only the shown content pins). This kills
  the M3-deferred zoom-overflow bug WITHOUT giving up the band — battery at
  factor 1.728: band+tabs 26.62px, label 7.52, icon 9.26, glyph 11.57, pills
  inside the header. FOUND+FIXED en route: the composite bar caches item
  widths from one DOM measure, so a LIVE zoom flip decided overflow against
  the dead layout (A/B: live flip 4 pills + chevron vs cold boot 5 + none at
  the same width) — new thin `recomputeSizes()` pass-throughs
  (PaneCompositeBar → AbstractPaneCompositePart) called from SidebarPart's
  zoom handler on the NEXT ANIMATION FRAME, because SidebarPart is
  constructed before `InlineTitleBarLayout` registers and so hears zoom
  changes before `--zoom-factor` is rewritten. Vendored patch files
  untouched; no `!important` (13–14 classes out-specify the vendored
  cascade).
- [x] **R9 landed** (`e10d246fefc`) — "background of the tab container
  transparent": `editorGroupHeader.tabsBackground` joins
  `MAC_TRANSPARENT_SURFACES` (the D14 alpha-0 force set) — the strip stops
  painting its own `#191A1B` band and shows the editor part's opaque
  `#121314`, so the editor column reads as one surface top to bottom.
  Consumers audited: group view title paint goes transparent (intended); the
  tabs control `.flatten()`s the color against editor background for the tab
  fade gradients → they now fade to the color that actually shows. Inactive
  tabs deliberately KEEP their `#191A1B` fills (flag below). node suite
  identical before/after (7215 pass, same 5 pre-existing failures,
  stash-verified baseline).
- [x] **R10 landed** (`b1640cfb612`) — the explorer/"gitlens" selection
  centering: the label BOX measures dead-center in the 22px row (3.5px each
  side) but the INK reads ~1px low — the same ascent>descent half-leading
  skew the M2 tab nudge documents. Fix: `top: -1px` on
  `.monaco-list-row .monaco-icon-label-container` (text container ONLY — the
  ::before file icon is separately centered, same rationale as tabs), all
  sidebar lists (explorer, SCM, Graph, outline, sticky rows). Probed: text
  container −1px in all three views; row, icon-label and icon ::before boxes
  unmoved; lift lands nowhere else (breadcrumbs/pane headers/statusbar
  clean).
- [x] Session battery round 2 (2026-09-02, dev instance over CDP after
  reload): gate ON, tab band 46+26=72 with strip inline
  `rgba(25,26,27,0)` over editor `#121314`, pills 34×28@20 r6, row lift −1
  exact; LIVE zoom→3 flip: band+tabs 26.62 both columns, label 7.52, icon
  9.26, glyph 11.57, radius 3.47, pills inside header, remeasure fires;
  restore to 0 exact. Paint-stack probe confirmed the transparent-root/0.3
  coat design intact (CDP captures composite it over white — the recorded
  vibrancy-blindness, NOT a regression). Session instances killed + runDirs
  removed; Sebastian's own hand-launched dev instance (relative-path
  `./scripts/code.sh` tree) left RUNNING — it renders pre-round code until
  a Cmd+R.
**FIX ROUND 3 2026-09-02 — Sebastian's third checkpoint verdicts, three
slices landed same day** (one opus-coder run, three commits, each
diff-reviewed; hooks ON, no AI attribution; compile 0 each). His three
findings measured first, then the two design forks put to him via the
question tool — all three recommendations APPROVED (rulings recorded as
D19 amendment round 12 on the board):

- [x] **R11 landed** (`20e0e77a660`) — "the line under the tabs and under
  the activity bar arent aligned": the rail line = stock
  `paneCompositePart.css:41` border under a top-located composite bar
  (`sideBarActivityBarTop.border`, defaulting from
  `sideBarSectionHeader.border` `#2A2B2C`); the editor hairline
  (breadcrumbs border-top `rgba(204,204,204,0.2)` at y=46) is a DIFFERENT
  color and each 1px line subpixel-snaps on its own at fractional zooms.
  The approved mockup draws NO rail line — RULED: remove it (gated CSS,
  9-vs-4 specificity, no `!important`); with the gate off the stock
  separator returns (probe-proven both ways). The one probe-instance
  where the whole editor title stack once measured y=-1 (post
  reload+zoom-cycle with a diff editor) stayed UNREPRODUCED on clean
  boots — with the rail line gone, seam misalignment is structurally
  impossible; watch at checkpoints.
- [x] **R12 landed** (`71fca7614b7`) — "the background of the tabs
  container ... not transparent like the sidebar": R9's alpha-0-over-
  opaque-editor superseded — `editorGroupHeader.tabsBackground` MOVES to
  `MAC_TRANSLUCENT_SURFACES` (the 0.30 coat: strip resolves
  `rgba(25,26,27,0.3)`, byte-identical to the sidebar) and the M1 opaque
  backstop moves DOWN a layer: `.part.editor` + `EditorPart.updateStyles`
  container paint go clear on mac-native, the opaque pin now sits on
  `.editor-group-container > .editor-container` plus, for EMPTY groups,
  on the grid's `.split-view-view:has(> .editor-group-container.empty)`
  box — deliberately NOT the group itself: an inactive empty group dims
  to opacity 0.5, which would take an own-fill down with it and leak
  vibrancy (D9 violation). RULED with it: inactive tabs paint NO fill
  (mockup-true) — `tab.inactiveBackground` + `tab.unfocusedInactive-
  Background` join the alpha-0 set; active tab stays solid editor color;
  hover/drop/markers/borders untouched. Audit held: grid seams are
  overlay-drawn (pixel scan: 0 of 3,675,360 device px below the band
  translucent in a 2×2 split), centered-layout margins self-paint,
  modal editor part self-paints, aux/floating windows same-path.
  Accepted approximations, flagged: tab fade gradients flatten to
  `rgb(20,21,22)`; single-tab `noTabsBackground` band stays opaque.
- [x] **R13 landed** (`14bdc900aab`) — "too much padding inside the
  'changes' accordion": RULED collapse the dead twistie gutter, keep the
  16px row grammar. The gutter is INLINE padding `TreeRenderer` writes on
  the twistie box (CSS can't outrank it without `!important`) → the
  empty twistie goes `position: absolute` (already w0 + hidden) and
  `.monaco-tl-contents` takes `margin-left: 8px` — indent-proof, no
  baked `tree.indent` constant. Scope: commit-input + action-button rows
  (both view modes) and resource rows in `list-view-mode` only; tree
  mode stock (leaves must not outdent their folders); repo + group rows
  keep their REAL twisties; graph view excluded BY NAME
  (`:not(.scm-history-view)` — it carries `.scm-view.list-view-mode`
  too). `SCMInputWidget.layout` measures the DOM (no widthOffset-style
  constant) so the input widened by itself. Numbers: input/button
  x40 w243 → x24 w259 (editor inside x36 w234), list-mode resources
  x56 → x24; repo x46, group x62, graph x16, explorer — all unchanged.
- [x] Session battery round 3 (cache-busting reload — see the new env
  note): rail border `0px none` + hairline intact; strip
  `rgba(25,26,27,0.3)` with part/content transparent, editor body
  `#121314` opaque, active tab solid; SCM input/button x24 w259, graph
  row x16 w267 unchanged. Inactive-tab alpha-0 verified in the agent's
  probe (battery had one tab open). Session instances killed + runDirs
  removed; Sebastian's own 21:55 hand-launched instance left running —
  it renders pre-round-3 code until a Cmd+R.
**FIX ROUND 4 2026-09-02/03 — Sebastian's fourth-round findings, two slices
landed** (one opus-coder run, both diff-reviewed; hooks ON, no AI
attribution; compile 0 each). His alignment doubt MEASURED TRUE (lights
centered on 22, everything else on 23; pills on fractional x) and the SCM
guide-overlap root-caused; the SCM way out put to him — RULED: "Flatten
the pane properly" (D19 amendment round 13 on the board):

- [x] **R14 landed** (`13f33637a09`) — one centerline for the top band:
  (a) traffic lights `trafficLightPosition` y 16→17 — 12pt buttons now
  center on 23 = the 46pt band's midline where pills and tab icons
  already sit (tab TEXT stays on 22 by design — the optical ink lift);
  MAIN-PROCESS constant, needs a full relaunch, invisible to CDP —
  Sebastian's eye confirms. (b) pills on whole pixels: the fractional
  35.99 advance root-caused to the VENDORED ui-custom-font rule
  `.part.sidebar .icon { margin-right: calc(font-size × 0.153846) }` in
  scm.css (meant for repo-row icons; a pill is `.action-item.icon`) —
  vendored file untouched, our gated block clears the margin and parts
  pills with `column-gap: calc(2px / zoom)` instead (a gap doesn't hang
  off the last pill, so centering lands truer); the half-pixel centering
  leftover killed via `flex: 0 0 auto; width: round(down, 100%, 2px)`
  on the container (even box ⇒ whole-pixel halves at EVERY sidebar
  width) + `getCompositeBarPadding() + 1` so the overflow budget never
  counts the rounded-off pixel. Battery: pills 101/137/173/209/245,
  advances exactly 36×4, integer at widths 298–303, zoom-3 live flip
  clean, tabs unmoved.
- [x] **R15 landed** (`8371053afc0`) — SUPERSEDES R13 (its two rules
  reworked into one block): the Changes view reads as ONE COLUMN — commit
  input, action button, resource-GROUP HEADERS and (list-mode) resources
  all at x24 w259; repo rows keep their real twisties at x46 (the one
  true hierarchy); indent guides NOT DRAWN anywhere in the pane (both
  view modes — this kills the lines-through-content bug for good, they
  can never overlap what no longer exists). Group-header twisties fade
  via `opacity: 0` NOT `visibility` — an invisible box still answers the
  mouse, preserving the sticky-row toggle path
  (`expandOnlyOnTwistieClick` there); label-click fold/unfold verified
  live both directions. Tree mode: input/button/header flat, folders
  keep twisties + nesting (files x78/x94/x110/x126). Single-repo
  workspace probed: same column, no repo row. Graph + explorer
  byte-unchanged. Resolves flag 14 (nothing left to outdent).
- [x] Session battery round 4: pills integer + uniform (above); SCM flat
  column live on the umbrella workspace, 0 visible guides, group toggle
  16→10→16 rows, input editor widened; graph keeps its guides.
  INCIDENT, recorded: the round-4 agent's cleanup ran
  `rm -rf /tmp/code-oss-dev` WHOLESALE, deleting the live profile of a
  session-owned probe instance — instance killed, no durable loss; RULE
  for every future agent brief: cleanup targets ONLY the runDirs the
  agent itself created, never the shared parent.
**FIX ROUND 5 2026-09-03 — Sebastian's fifth-round findings, two slices
landed** (one opus-coder run, both diff-reviewed; hooks ON, no AI
attribution; compile 0 + repo stylelint 0). His SCM call MEASURED TRUE —
the accordion banner title sat at x32, the commit box and the button at
x35 (stock 11px inner padding on `.scm-input`/`.button-container`),
while the list ink sits at x24 — and his "visually confirm the traffic
lights" exposed that R14 OVERSHOT: on the compositor the circles render
centered at y+6.75 (not the nominal y+6), so y:17 = 23.75, 0.75pt BELOW
the 23 midline, where the old y:16 = 22.75 was only 0.25 high;
fractional y truncates (a y:16.25 out/-probe rendered pixel-identical
to 16 — Electron's gfx::Point is integer), so 16 is the closest the API
can express:

- [x] **R16 landed** (`30fe602831d`) — banner, commit box and button
  join the one column: `.scm-input` + `.button-container` stock
  `padding-left: 11px` zeroed in the fork's one-column scm.css block
  (boxes land x24; right edge stays 271 = the badge column, via the
  vendored right padding); the M3 pane-header rule 12px → 4px so the
  section title ink lands x24 (4 + twistie 2+16+2), the chevron hanging
  in the 8px gutter like tree twisties — GLOBAL to every sidebar pane
  header by the shared rule (explorer DEMO-REPO/OUTLINE/TIMELINE probed
  x24 too; the mockup's one-text-column intent). Battery live: input
  box 24..271, button 24..271, pane-header titles 23.98, group headers
  + resource icons 24, badges right 271; explorer tree rows keep their
  nesting (src x46, children x62). Resolves flag 3.
- [x] **R17 landed** (`f0219155abb`) — lights on the MEASURED center
  line: `trafficLightPosition` y 17 → 16, the windows.ts comment now
  records the empirical model (Tahoe @2x centers the circles at
  y+6.75; fractional positions truncate to whole points). Compositor
  scan after: circles 22.75 vs pill ink 23.0 — half a device pixel
  high, the best the integer API can do (17 re-measured 23.75).
- [x] Session battery round 5 (Tart VM per D23; virgin throwaway
  profile + a /tmp demo git repo; `security.workspace.trust.enabled:
  false` seeded — Restricted Mode otherwise blocks git and the SCM
  view renders EMPTY): all numbers above, plus pills
  101/137/173/209/245 yc23 (advances 36, gaps 2, integer) and tab
  {icon yc23, label ink 22 by design, close yc23, h46} re-verified
  unchanged; before/after screenshots delivered in-chat. VM ledger
  notes: after a host `npm run compile` rewrites out/ wholesale, the
  guest's virtiofs view can serve stale ENOENT (out/main.js) — VM
  restart remounts and clears it; one GPU-process crash took the app
  AND the VM down mid-session (headless-VM flakiness; restart cured);
  the display re-pick ritual + demo-repo + trust seed are all
  re-applied per VM boot.
- [x] **Checkpoint (Sebastian) — APPROVED 2026-09-03 ("Approved,
  commit")**: round-5 surfaces pass; docs committed on the verdict
  (the shared-tree doc state was all post-ruling record, incl. the
  peer D23 VM-mode fold). Pushes remain his. The judged list, kept
  for the record — out/ compiled at `f0219155abb`; R17's lights are
  MAIN-PROCESS: quit the dev instance and relaunch
  `./scripts/code.sh` (Cmd+R is NOT enough this round). Judge: the
  one-column SCM pane (banner title, commit-box edge, button edge,
  group headers, file icons on one left line; input/button/badges on
  one right line), section titles on the content column in EVERY
  sidebar view (explorer/debug too — global by design, mockup-true),
  lights vs pills/tab icons (lights now sit half a device pixel HIGH —
  the closest the integer API allows; exact 23 is not expressible),
  plus the round-3/4 surfaces if not yet judged (single seam line,
  translucent strip, inactive tabs, flat Changes pane, group folding).
  Flag 17 still up for a look (tree-mode x24 header → x78 folders).
  Pushes are yours: `cd vscode && git push origin vsebcode` then
  umbrella `git push`.
- [ ] **Parked flags for verdicts** (updated after fix round 2; old flag 1
  RESOLVED by R3, old S4-padding flag superseded by R2):
  (1) S3 caption-row drag strip slightly smaller (no-drag actions box spans
  its rail: ~+8px at 300px) — acceptable, or move no-drag onto the action
  items? (2) diff editors inherit relative line numbers — keep or pin `'on'`?
  (3) RESOLVED by round 5 (R16): pane-header text on the x24 content
  column everywhere, twistie in the gutter. (4) empty-window virgin boot hides the
  sidebar (pre-existing) — force visible as a default? (5) dev-only:
  rspack.serve-out.config.mts lacks a `.woff2` asset rule (component-explorer
  harness) — one-liner if wanted. (6) 2026-dark.json mixes `#8c8c8c` with
  `#8C8C8C` — cosmetic. (7) NEW from R3: `preventExperimentOverride` flag not
  set on the baked defaults — an experiment-tagged setting's A/B treatment
  could outrank them (moot-ish: `workbench.enableExperiments: false` is
  itself baked) — set the flag anyway? (8) NEW from R3: baked
  `security.workspace.trust.untrustedFiles: "open"` — his value, noted
  because it is security-relevant. (9) RESOLVED by round 3: inactive tabs
  RULED no-fill (mockup-true), landed in R12. (10) NEW from R8: the pill
  count badge is pinned `top: calc(50% - 13px)` for the 28px pill — at
  zoom 3 it rides ~5px above the shrunken pill; rule wanted? (11) NEW
  from R8, gaps accepted by scope: glyph-FONT icon themes in tabs still
  scale with zoom (our SVG set is pinned; only bites if a font icon theme
  is ever installed); toggling the inline title bar itself, or zooming
  while the sidebar is hidden, can leave the pill-width cache stale until
  the next item change (same pre-existing cache shape). (12) OBSERVED,
  pre-existing stock behavior, untouched: the Source Control Graph pane
  HEADER's action toolbar (repo picker + branch picker + 5 actions) is
  ~279px wide and clips at a 300px rail — its last icons cut at the edge,
  title crushed to "G…"; stock has no max-width plumbing for pane-header
  toolbars. Fix wanted? (13) from R9/R12, cosmetic: getting-started
  walkthrough SVGs fill their mock title bars with
  `editorGroupHeader.tabsBackground` and now draw those rects as the 0.3
  coat. (14) RESOLVED by round 4: the R15 flatten puts headers and files
  on one x24 column — nothing outdents anything. (15) NEW from R12:
  single-tab mode
  (`workbench.editor.showTabs: "single"`) keeps an OPAQUE band
  (`noTabsBackground` untouched, deliberate) — extend the material there
  if that mode ever matters? (16) NEW from R12, accepted approximation:
  tab overflow fade gradients flatten the 0.3 strip against the editor
  to solid `rgb(20,21,22)` — exact only while the strip was opaque.
  (17) NEW from R15, for his eye: TREE view mode steps from the flat
  x24 group header straight to x78 folders (stock nesting deliberately
  kept — folders must read as folders); re-rule only if the 54px jump
  reads wrong. (18) NEW from R14, left alone: the vendored
  `.part.sidebar .icon` margin rule still over-matches every other
  `.icon` in the sidebar — only the pills opt out; watch at M6
  reimports. (19) pre-existing, noted by the round-4 agent: the
  composite bar's overflow budget counts `clientWidth` per pill and
  ignores the 2px gaps — optimistic by 8px at five pills; unchanged.
- [ ] Close: packaged verification — bundle markers now REFLECT R6 + fix
  rounds 2–5 (round 5 adds: `trafficLightPosition` y 16 in main.js —
  supersedes round 4's y 17 — plus scm.css `padding-left: 0` on the
  input/button pair and pane-header `padding-left: 4px` in style.css;
  round 4 added: `round(down, 100%, 2px)` + `column-gap` in
  sidebarpart.css, the
  one-column scm.css block with `.monaco-tl-indent` display:none):
  NO woff2 anywhere (Geist unvendored), no `vsebcode.uiFont*`
  strings, workbench falls back to `--monaco-font`; 46pt tab band restored
  (inlineTitleBar import back in the tabs control), `/ var(--zoom-factor`
  calcs in sidebarpart + multieditortabscontrol CSS, row-label lift rule;
  round 3: `editorGroupHeader.tabsBackground` in the TRANSLUCENT set +
  both inactive-tab fills in the transparent set, `.part.editor` OUT of
  the opaque backstop with `.editor-container` + `:has(empty)` pins in,
  rail-header `border-bottom: none` gated rule, scm.css gutter-collapse
  rules; plus the standing slice markers (pane-body insets, defaults
  blob, systemColorTheme dark). Font ruling DONE (R6); experiments
  deleted. Board/Tasks close-out. Pin bumps recorded 2026-09-02 at each
  landing.

### M13 — Grid surgery (full-height rail + editor-column statusbar)

Four delegated commits LANDED 2026-09-03 (one session; diffs reviewed, hooks ON,
no attribution, nothing pushed). out/ compiled at `d4cf18c60ac` — Sebastian's
judge needs only quit + `./scripts/code.sh` (renderer-side; a plain relaunch is
cleanest).

- [x] **S0 landed** (`d8621e132ab`): `Grid.getViewLocation` made public (was
  private, house-style doc); `adjustPartPositions` derives the middle-section
  root index from the editor's location — the four stale `[2,…]` literals gone
  (they addressed the BANNER leaf under our banner-last root). Suites 43/195
  green. Live repro at the battery: activity bar `default` + double
  sidebar-position toggle = clean; the old banner-split is dead.
- [x] **S1 landed** (`be2c00b549c`): the surgery. Under the gate — inline
  titlebar + sidebar LEFT + HORIZONTAL panel — root = [titlebar, main row];
  main row = [activitybar, sidebar (full height), column, auxiliarybar]; column
  = [editor, panel, banner, statusbar] (statusbar bottom-most, panel top or
  bottom). Ungated = stock, proven BYTE-EQUIVALENT across all 16,384
  arrangement combinations (agent harness). Alignment read as `center` under
  the gate at the two arrangement-math sites (B2; stored setting untouched).
  Runtime flips via idempotent `updateBannerAndStatusBarPlacement()` —
  inline-titlebar event + setSideBarPosition + BOTH sides of setPanelPosition
  (rows evacuate BEFORE a vertical-panel move unmakes the column; ordering
  proven by counter-example on a real grid, 8-case choreography test). Full
  moveView audit table in the agent report.
- [x] **S2 landed** (`2d527dd1521`): the lockstep copies. New root class
  `statusbar-in-editor-column` (LayoutClasses; boot via getLayoutClasses +
  every runtime placement change — grid DOM is flat siblings, CSS can't see
  the tree). Splash: `IPartsSplash.layoutInfo.statusBarInEditorColumn`
  (optional → old stored splashes paint one stock first frame, self-heal),
  writer restates the predicate over public state (comment ties it to
  layout.ts), painter: all three side strips full height + statusDiv
  left/width = the column. Statusbar focus radius: bottom-left → 0 under the
  class; `.part.sidebar.left:focus` gains 10/16px (Tahoe) in sidebarpart.css.
  Audited no-change: status-border-top hairline (part-relative), all four
  `--banner-height` toast/center offsets, part-cycling ring, M1 statusbar
  drag.
- [x] **S3 landed** (`d4cf18c60ac`, from the battery's live find): with the aux
  bar MAXIMIZED (editor+panel hidden) the column's only visible child was the
  fixed-height statusbar → the grid pinned it to the WINDOW TOP (gridview
  maximumSize clamps the whole middle section to 22px). Fix = predicate split:
  `wantsFullHeightSideBar` (shape: gate+LEFT+horizontal) feeds the alignment
  clamps; `hasFullHeightSideBar` = wants ∧ (editor visible ∨ panel visible)
  feeds descriptor/class/placement/splash — rows EVACUATE to stock root while
  the column has no flexible child, rejoin when one returns. Triggers:
  setEditorHidden/setPanelHidden straddle the grid flip (out before the last
  flexible row goes, in after one is back — wrong order collapses the middle
  section to 0, proven). The split also fixes boot-into-persisted-aux-max with
  non-center alignment (refined clamp would have nested the sidebar into the
  column). Panel-maximized untouched (panel = flexible child, correct since
  S1). Bonus: splash aux-max width marker made the first-frame statusbar
  vanish — now paints stock full-width there.
- [x] **Session battery (Tart VM per D23, virgin profile + /tmp demo repo)
  all-green 2026-09-03**: boot geometry exact at 1200×800 (rail 0,0→300,800
  owns the corner; statusbar 300→1200 at y778; editor left = statusbar left);
  Restricted-Mode banner lives IN-COLUMN (300→1200 × 752..778, dismiss returns
  the 26px to the editor); editor→panel→statusbar stacking exact (512/266/22);
  empty-window boot = full-width statusbar (hidden sidebar collapses the
  column — honest); sidebar right ⇒ stock + class off, left ⇒ column back;
  panel right ⇒ stock (vertical fallback, evacuation clean), bottom ⇒ column;
  gate off (`customTitleBarVisibility: auto`) ⇒ stock incl. 32px title row,
  never ⇒ column, both LIVE; zoom +2/reset tracks; aux visible ⇒ statusbar
  stops at the aux edge (aux full height); aux MAXIMIZED ⇒ statusbar to root
  bottom full-width + class off, un-maximize ⇒ rejoin (S3 verified); S0 repro
  clean; stored splash `{statusBarInEditorColumn: true, titleBarHeight: 0}`
  on a clean session; splash-frame capture agrees with the settled frame
  (full-height strip, column statusbar, before the workbench loads).
  Screenshots delivered in-chat (banner scene, SCM one-column scene on the
  full-height rail, stacked panel scene, splash frame).
- [x] **Checkpoint (Sebastian) — APPROVED 2026-09-03 ("Approved, commit it")**:
  corner + seam pass on the dev instance; pin bump committed on the verdict.
  Flag verdicts ruled in-session, recorded below.
- [x] **Flags RULED 2026-09-03 (all six in-session, question round)**:
  (1) VERTICAL panel fallback RATIFIED as built — **with an ANNOTATION:
  re-evaluate after the MVP** (his wording: keep it for now, he feels stuck
  at this step — bias to momentum; a future round may design the full-height
  rail for side-docked panels).
  (2) Maximize predicates: FIX RULED — `isPanelMaximized()`/
  `panelOpensMaximized()` read the effective (wants-clamped) alignment;
  delegated as the post-checkpoint fix round.
  (3) Inert `.part.sidebar.left:focus` radius rule: KEEP (future-proof
  mirror of the statusbar rule).
  (4) Statusbar bottom-RIGHT focus radius: MAKE CONDITIONAL — drops when
  the visible aux bar owns that corner (`noauxiliarybar` gate); aux gets
  the inert mirror rule (same family as flag 3). Delegated, same round.
  (5) Rail bottom strip stays NON-draggable — ruled fine (rail content;
  statusbar + top rows still drag).
  (6) `getNeighborPart` semantic shift under the gate: accepted as the
  honest reading of the new geometry (informational; no change).
  (7) `launch-vm.sh` shquote bug: FIX RULED (`printf '%q'`-class one-liner,
  round-trip-proven); delegated, same round, tooling commit.
- [x] **Flag fix round LANDED 2026-09-03** (delegated; diffs reviewed; hooks ON;
  2 commits): `c54bc6fb45e` — new `getEffectivePanelAlignment()` (wants-clamped)
  feeds `isPanelMaximized`/`panelOpensMaximized` (flag 2); statusbar
  bottom-RIGHT focus radius drops when a visible aux bar owns the corner
  (`:not(.noauxiliarybar)` on the column class — the two classes verified
  never to collide with aux-MAXIMIZED, where the column class is off) + the
  aux bar gets the inert mirror radius rule (flag 4). The other two clamp
  sites keep their parameterized reads by design (different signatures — a
  no-arg helper doesn't fit them; noted, no behavior gap). `258e36f6337` —
  launch-vm `shquote` → `printf '%q'`, both quoting layers round-trip-proven
  on 6 extra-arg cases + the env-prefix site (old failed ALL extra-arg
  cases, incl. plain paths). LATENT, recorded not fixed: `capture-vm.sh`
  carries a byte-identical copy of the old shquote — can never fire today
  (its only arg is a generated quote-free path); same one-liner if it ever
  gains call sites. Verification: compile 0, eslint 0, hygiene 0, suites
  43/195 at baseline, `bash -n` clean. These two ride the NEXT battery/
  packaged pass for live proof (focus-state cosmetics + a predicate read —
  suite-covered; not worth a dedicated VM round).
- [ ] Close: packaged verification rides the next packaged pass together with
  M12's (M2→M3 precedent). M13 markers for that grep: `getViewLocation` public
  in grid.js; `statusbar-in-editor-column` in workbench js + css;
  `wantsFullHeightSideBar`/`hasFullHeightSideBar` + the descriptor
  `bottomSection` in layout js; `statusBarInEditorColumn` in themeService +
  partsSplash + the splash painter (electron-browser workbench.ts);
  `.part.sidebar.left:focus` radius in sidebarpart.css; statusbar
  bottom-left-radius 0 rule in statusbarpart.css.
- [ ] Battery ledger (VM notes, carry forward): `security.workspace.trust.enabled`
  needs a FULL app restart (window reload is not enough — the restricted
  banner can survive a reload as stale UI; seed it before first boot, or
  kill -9 + manual relaunch with the folder arg, the pattern that worked);
  partsSplash stops saving layoutInfo for the session after a
  titlebar-affecting settings flip (`_didChangeTitleBarStyle` latch) — a
  mid-battery gate flip freezes the stored splash, harmless in real use;
  the single-instance relaunch hazard needs `pkill -9` + pgrep-gone before
  relaunching a reused UDD (SIGTERM leaves a crash-restore dialog that
  forwards new launches).

### M14 — Lualine statusbar (approved bar: NORMAL │ branch · +n ~n −n · ⚠n … Ln,Col · % · UTF-8 · LF · lang; NO mode block until M17)

- [x] **Brief flag round RULED (Sebastian 2026-09-03, all four as recommended)**:
  (1) DROP-LIST — all five hidden by default via `updateEntryVisibility`
  (user-restorable by right-click; seed applied ONCE per profile so re-shows
  stick): `status.host` remote indicator, `status.scm.1` sync-changes,
  `status.editor.indentation`, `status.notifications` bell,
  `status.languageStatus` braces. Conditional stock entries (debug, tasks,
  ports, zoom, screen-reader…) untouched — they appear in their scenarios.
  (2) ZERO-HIDING — lualine-true: problems segment shows only non-zero tiers
  (info tier never; whole segment gone at 0/0, stock `status.problems` hidden,
  replaced by an own entry), diff segment gone when the active file is clean;
  dot separators collapse with their segment. (3) SCROLL % — vim ruler
  formula: floor(cursorLine × 100 / totalLines), plain `N%` (session finding:
  the mockup's 33% = Ln 35 of the ~106-line scene = cursor-line %, NOT
  viewport offset ~5% — coherent-numbers law). (4) BRANCH TEXT — bare name:
  dirty-suffix markers stripped in the built-in git extension's checkout
  title; the diff segment carries dirtiness. Session groundwork verified:
  every mockup hex IS the 2026-dark resolved value (statusBar #191A1B/#8C8C8C,
  diff = editorGutter added/modified/deleted #72C892/#0078D4/#F28772, warn
  #CCA700) — zero theme edits; diff counts = ACTIVE-FILE line hunks
  (board: "+6 ~2 −1 ↔ drawn gutter hunks"), quick-diff sourced.
- [x] **Both commits LANDED 2026-09-03** (delegated; diffs reviewed; hooks ON,
  no attribution; NOT pushed, pin bump waits on the checkpoint):
  `7156c311105` composition — new contrib
  `src/vs/workbench/contrib/lualineStatus/` (layering-legal home for the
  quick-diff import; registered desktop.main, `isMacintosh && isNative`,
  AfterRestored) + M14 CSS block appended to statusbarpart.css (agent call,
  fork precedent; zero `!important`, backgrounds/radii untouched); entries
  `status.vsebcode.diff` LEFT 9999 / `.problems` LEFT 9998 (replaces stock
  `status.problems`, cmd toggleProblems, 10K+ packing kept) /
  `.scroll` RIGHT 100.45; seed key
  `workbench.statusbar.vsebcode.dropSeed` (PROFILE/USER — same scope as the
  hidden set); custom-DOM segments ride a BLANK stock label (' ', not '')
  stretched inset:0 under the painted content — keeps hitbox/hover/focus/
  aria/command alive with no `!important` (empty text would be display:none
  + aria-hidden); dot = ::before at right:100% in a 22px margin gutter on
  the vsebcode items, `first-visible-item` kills the leading dot; diff
  counts replicate QuickDiffDecorator's filter byte-for-byte (visible
  providers, non-primary overlap suppressed); U+2212 escaped (hygiene
  unicode allowlist). `a6ec5af786d` git ext — checkout TITLE uses new
  `bareHeadLabel` (headLabel's ref line minus the `*`/`+`/`!` ternaries —
  no regex, a `feat+` branch survives); tooltip/icon/rebase/running-ref
  untouched. Verification (agent, reviewed): compile 0, typecheck-client 0,
  valid-layers-check 0, git-ext tsc 0, eslint 0 on touched files, hooks
  passed, statusbar model suite 10/10 pre=post, drop ids ×1 each,
  i18n.resources.json entry (eslint code-translation-remind).
- [x] Don't trample — verified in review + live: M1 drag/no-drag (probed:
  bar=drag, items=no-drag), D9/D10 backstop + M13 radius rules untouched
  (CSS diff), hover-grouping JS live (hover paints #323233 inline).
- [x] **Session VM battery (D23) ALL-GREEN 2026-09-03** (virgin guest UDD,
  /tmp/m14-demo repo, branch `vsebcode`, 106-line clean file): trust-gated
  boot then bar = bare `vsebcode` alone (clean repo: no dots, no diff/
  problems segments; scroll 0% at Ln 1; right order selection→scroll→
  encoding→eol→mode; NO Spaces/braces/bell/remote/sync — all 6 hidden in
  DOM); disk edits +6/~2/−1 (3 hunks, numstat 8/3) → segment `+6 ~2 −1` in
  the exact theme rgb (114,200,146 / 0,120,212 / 242,135,114), branch stays
  BARE with dirty tree (commit 2 live), aria "6 lines added…"; bad.json
  (1 err + 2 dup-key warns) → `⊗1 ⚠2` (#F14C4C / #CCA700), tooltip
  "Errors: 1, Warnings: 2"; active-editor switch to clean file → diff
  segment fully REMOVED (0 DOM nodes), problems dot follows branch directly
  (no stray dots any combination); Ln 37 → 33% = floor(37·100/111) exact;
  native context menu (native titlebar ⇒ native menus, invisible to CDP —
  driven via guest osascript key codes, no extra TCC needed) shows every
  drop as an unchecked restorable row; bell re-shown through the REAL menu
  → visible, then NEW WINDOW ran the seed path again: marker respected,
  bell STAYS (state.vscdb: hidden = the 5 ids minus notifications,
  dropSeed=true); bell re-hidden for the design state. Screenshots
  delivered (full bar + context menu + flow-ins flag scene + design
  state). Battery ledger adds: playwright daemon idle-drops the CDP
  attach — re-attach same session name; statusbar right-click = NATIVE
  menu under our titlebar default (osascript `key code` drives it).
- [x] **Flag round RULED 2026-09-03 (question round)**: (3) FLOW-INS — the
  auto-attach chip (`vscode.debug-auto-launch.status.debug.autoAttach`) and
  `statusbar.currentProblem` JOIN the default drop set (functionality
  keeps working — auto-attach setting + problems.showCurrentInStatus bake
  both stay; chips right-click restorable); the GIT BLAME statusbar item
  stays VISIBLE as stock (the editor's inline blame is a separate surface,
  unaffected). (4) diff zero-tier hiding APPROVED as built. Fix round
  delegated (same agent): the two new drops behind a VERSIONED seed —
  already-seeded profiles get ONLY the delta, user re-shows survive, v1
  five never re-applied; plural nit ("1 lines removed") folded in.
  Spacing flags (1) 0-inset hover boxes + (2) 22px dot gutter = judged at
  Sebastian's visual pass with the checkpoint verdict.
- [x] **Fix round LANDED + upgrade-battery green 2026-09-03** (same agent;
  diff reviewed): `6d907e2fc2a` — drop set restructured into GENERATIONS
  (g1 = the six, g2 = auto-attach chip id
  `vscode.debug-auto-launch.status.debug.autoAttach` — verified in source:
  extHostStatusBar composes `${extensionId}.${entryId}` — +
  `statusbar.currentProblem`); marker now stores the seeded generation
  (legacy boolean 'true' parses as g1; NaN-safe), `DROP_SEED_GENERATION`
  derived from the last group so the pair can't drift; upgrade contract
  commented: NEVER extend an old generation, always add a new one. Plural
  nit fixed house-style (conditional 1/N localize per tier; aria keeps
  zero tiers enumerated — agent deviation, kept: fuller for screen
  readers). git blame item untouched (grep-proved). Compile 0,
  typecheck-client 0, eslint 0, hooks passed. VM battery: VIRGIN profile →
  all 8 hidden in one pass, marker '2', auto-attach chip gone from the
  boot bar; V1→V2 UPGRADE simulated for real (DB downgraded to
  marker='true' + hidden=five-minus-bell, manual same-UDD relaunch) →
  delta applied (7 hidden: five + two new), bell STAYED visible, marker
  → '2'. Battery ledger adds: recompiling while the VM runs poisons the
  guest's virtiofs view of out/ (dir listing fine, reads ENOENT) — reboot
  the VM after host recompiles before launching.
- [x] **CHECKPOINT APPROVED 2026-09-03 ("Approved the mas commit and
  continue with the next step")**: both sight-flags stand as built
  (0-inset hover boxes, 22px dot gutter); pin bump + doc fold committed
  on the verdict (docs carry the peer M20 A01 gate-pending records —
  shared-tree precedent); pushes his (fork ahead 3 + the pin bump).
  Parity note stands: the branch TOOLTIP still reads
  `vsebcode*, Checkout Branch/Tag...`. Packaged markers ride the next
  packaged pass with M12/M13's.

### M15 — Neo-tree explorer keyboard UX

- [x] **Brief flag round RULED (Sebastian 2026-09-03, both as recommended)**:
  (1) TYPE-AHEAD — disabled for the explorer tree (`typeNavigationEnabled:
  false`, option verified live at `listWidget.ts:483/1068`); `/` = list.find
  owns the filtering job; every other tree keeps stock type-ahead. (2)
  SHIFT+A — `explorer.newFolder` joins the map as `a`'s neo-tree companion
  (a = add file, A = add directory; beyond the ruled six by verdict; the
  hint footer stays at the five r9 hints — A undisplayed like d).
- [x] **All three commits LANDED 2026-09-03** (delegated; diffs reviewed; hooks
  ON, no attribution; NOT pushed, pin bump waits on the checkpoint):
  `61a9afb5f56` letter keymap — one `isMacintosh && isNative` block in
  fileActions.contribution.ts, nine `registerKeybindingRule` calls at the
  neighbors' exact weight (WorkbenchContrib + explorerCommandsWeightBonus 10)
  under `FilesExplorerFocusCondition`: j/k→list.focusDown/Up,
  h/l→list.collapse/expand (each carrying its stock rule's own can-collapse/
  can-expand terms), a→explorer.newFile, shift+a→explorer.newFolder (ruled),
  r→renameFile (!root ∧ writable), d→moveFileToTrash
  (ExplorerResourceMoveableToTrash — INERT on non-trashable resources where
  stock Delete falls back to permanent deleteFile; left inert by design, flag
  if it ever bites), /→list.find; the letters keep typing in every input box
  (`!inputFocus` term proven — rename/new-file/find are real `<input>`s);
  explorer tree gets `typeNavigationEnabled: !(isMacintosh && isNative)` —
  the ruled type-ahead disable, this tree only. `48cf2894047` hint footer —
  `IPartOptions.footerHeight` callback in the headerHeight idiom; SidebarPart
  installs a 22px footer (= statusbar height, one band across the seam) under
  `isInlineTitleBar && sidebar LEFT`, re-evaluated on inline-titlebar flips +
  updateStyles (side switches); five r9 hints right-aligned, `padding-right:
  16px`, 10.5px fixed (band is fixed-height; deliberate vs the sidebar-font-
  scaled git letter), tones = descriptionForeground @ .72/.34 via color-mix
  (mockup gives keys and words ONE tone — the mockup is the law), hairline
  rgba(204,204,204,0.13), footer paints nothing (single-painter);
  activityBar.location "bottom" collision settled in getCompositeBarPosition
  (hints keep the one footer, switcher answers TOP under the gate — but see
  the battery note: stock auto-migration makes the default-config path moot).
  `f9604dacaf7` cursor + git column — style.css M3-block additions:
  `outline: none` on focused sidebar rows (the wash IS the cursor —
  list.focusBackground resolves to the mockup's exact #3994BC26; ring kept in
  HC where it is the indication; removal deliberately SIDEBAR-WIDE, every
  list draws the same pill); git letter `::after` → explicit right column
  (`margin: 0 6px 0 auto`, flex-shrink 0, row-centered, full strength, 11px
  = sidebar-font × 0.846154), explorer-folders-view only. Verification
  (agent, session-reviewed): compile 0 ×3, eslint 0, hooks passed, targeted
  suites 103/0 (explorer 67, part+viewlet 7, list/tree 29), zero
  `!important`/hex-literal greps clean, registrations proven in out/.
- [x] **Session VM battery (D23) ALL-GREEN 2026-09-03** (virgin guest UDD,
  /tmp/m15-demo repo): footer 22px flex right-aligned rightInset exactly 16,
  five hints + aria-hidden dots at .72/.34 tones, band EXACTLY on the
  statusbar's row (both top 846 h 22; content bottom = footer top — layout
  math holds; rail owns the corner); keymap end-to-end — j/k walk, l/h
  expand/collapse (aria-proven), type-ahead OFF proven (x then j moves
  instantly), / focuses the tree find box and letters type into it ("app"),
  a / shift+a / r all open their input boxes (letters land, ESC cancels),
  d moved lib to the guest Trash with NO dialog — CORRECT: the M12 bake
  ships his `explorer.confirmDelete: false`; cursor row = rgba(57,148,188,
  0.15) wash, outline none, 7px pill; git letters "M"/"U" in ONE column
  (all labels end at the same right edge), 11px, full-strength theme tints
  (M #e5ba7d, U #73c991 exact); footer leaves and returns LIVE on sidebar
  right/left flips. activityBar "bottom" under DEFAULT config: stock
  layout.ts:427 auto-writes customTitleBarVisibility "auto" (any move to
  top/bottom while "never") → the GATE drops and the whole fork geometry
  falls back stock — the collision branch only governs layered-config
  corners (e.g. workspace "never" + user "bottom"); recorded, nothing to
  fix. Battery ledger adds: (1) trusting a restricted window LIVE leaves
  extension-contributed color vars unemitted (git tints paint gray) until
  reload — stock-shaped, virgin trusted boots fine; (2) rapid settings.json
  printf-rewrites over ssh can KILL the guest window's config watcher
  (changes stop arriving, workbench state freezes vs file) — pace writes or
  relaunch instead of live-flipping; (3) Cmd+W with no editors closes the
  window; (4) a file with problems shows the error tint + combined "N, U"
  badge over the git color (stock decoration precedence). M14 cross-check
  live in the same scene: bare branch, diff `~2` only on the dirty file,
  problems `⊗3`, scroll 33% = floor(1·100/3), hidden set honored.
- [x] **Checkpoint flag round RULED (Sebastian 2026-09-03, both as
  recommended)**: (1) FOOTER SCOPE — always shown (window anatomy, one
  constant band; inert hints on non-files views accepted); (2) IDLE CURSOR —
  stock (no `list.inactiveFocusBackground` theme add; wash returns with
  focus; revisit if daily use disorients). Screenshots delivered (window,
  tree, seam band).
- [x] **Fix round LANDED 2026-09-03 (checkpoint verdict at his live look:
  "all the commands fit, so add delete hint back and center all of them";
  same agent; diff reviewed)**: `6d85b1d199d` — the hint line carries SIX
  hints in keymap order (`d delete` restored between rename and filter)
  and CENTERS on the row with symmetric 16px padding. Supersedes BOTH
  D19-r9 crop rulings (drop-d + right-align-16px — made against the
  mockup's crop; neither reason survives the real window; the commit body
  records the supersession). A stays undisplayed (the shifted half of the
  `a` already on the line). TS/CSS comments rewritten to the new truth.
  Compile 0, eslint 0, hooks passed, targeted suites 62/0, change proven
  in out/. VM re-verified live: six hints, justify center, gaps EQUAL
  both sides — 6.7px each at the default 299px rail (the 286px line eats
  symmetrically into the 16px inset, unclipped; narrow rails now give up
  BOTH ends evenly where r9's pin lost only the left; glance at the
  corner at the pass); crop delivered. Committed mockups keep the r9
  five-hint line as design history (r11 precedent — the implementation
  is the live truth).
- [x] **CHECKPOINT APPROVED 2026-09-03 ("Looks good to me, approved,
  commit")**: all sight-flags stand as built — centered six-hint line
  (snug sides + corner clearance included), hint tone/size, 6px
  git-letter inset, sidebar-wide ring removal, cursor wash. Pin bump +
  doc fold committed on the verdict (peer M20 A02 work-in-progress rides
  the shared tree untracked, not committed); pushes his (fork ahead 7:
  M14's three + M15's four). Packaged markers ride the next packaged
  pass with M12/M13/M14's. M15 CLOSED except that packaged close-out.

### M16 — Telescope quick input (one widget = every picker; restyle is global)

**BUILT + battery-green 2026-09-03 (own session; five delegated commits, each
diff-reviewed; hooks ON; NOT pushed — pin bump waits on the gate). SEBASTIAN
GATE PENDING — flag list below.**

- [x] **S1 geometry + order** (`a584dccfd3a`): width `min(920, W−32)` (0.62
  golden cut ruled out — it would cap the panel at 794 in the mockup's own
  window); bottom-anchored at `(H−405)×0.64` (mockup's 36/64 split), top/left
  viewState IGNORED — persistence dead both directions, drag off (stock
  `no-drag` mechanism); visual flip = `column-reverse` (DOM untouched → focus +
  SR order stock); descending order at `_setElementsToTree` (top level + each
  separator's children; arrays stay provider-order so every stored index holds)
  + the tree sorter negated (the query path the array can't decide); activation
  flips via `firstItemFocus`/`secondItemFocus`/`lastItemFocus` consts + new
  `QuickPickFocus.SecondLast` (appended, no renumber); list Go-to-First/Last
  keybindings keep meaning top/bottom. 2 scroll tests made platform-neutral
  (measure resting scrollTop instead of assuming 0). Stock path proven: all
  guards forced off → suites byte-green.
- [x] **S2 coat** (`6b20ad4eb02`): new 0.90 tier in theme.ts —
  `MAC_OVERLAY_SURFACE_ALPHA`/`MAC_OVERLAY_SURFACES` (exactly
  quickInput.background) + `overlaySurfaceOnMac`, third branch at the D10
  `getColor` site; sets proven disjoint; resolution proof rgba(32,33,34,0.9)
  under 2026 Dark with the 0.3 tier undisturbed. quickInputTitle.background →
  MAC_TRANSPARENT_SURFACES (sole consumer = the strip; audit in report).
  List's second coat dropped at the feed (`listBackground: undefined` under
  `glassPanel`); sticky separator KEEPS `treeStickyScrollBackground:
  quickInputBackground` — alpha-0 letter of the plan deviated BY MEASUREMENT:
  the fallback is sideBar.background @0.3 (wrong hue + rows ghost through);
  strip paints ≈0.99 effective, flagged (F6). `overflow: hidden` clips the
  stock 12px xLarge radius; stale 5px titlebar corners zeroed. Var audit:
  walkthrough SVGs ~2/255 shift (benign), boot initial-colors carry the glass.
- [x] **S3 rows + prompt** (`1c13e8d54bf`): 16-row cap (CSS `calc(16*22px)` +
  6px pads = column 364; controller governor hands `undefined` while the
  window holds the panel — an inline max-height would beat the CSS — and
  shrinks only under 437px window with 16px margins); rows = M3 pills (8px
  insets, 7px radius, entry `0 6px 0 4px`), sticky + separator-as-item
  aligned; match highlights un-bolded (colors = stock tokens = the approved
  ones); focus ring starved (`--vscode-list-focusOutline: transparent` on the
  widget — the stock rule carries `!important`; HC excluded, keeps its ring);
  meta/description 12px; prompt strip 39 = 1px `pickerGroup.border` hairline +
  6px pads + 26px input; query monospace 13px (input element only). All
  beaten stock rules listed with specificity pairs in the session record.
- [x] **S4 motion + truing** (`633656f9a3e`): entrance 180ms fade + scale
  0.97→1 `cubic-bezier(0.23,1,0.32,1)` from own center; dismiss 120ms — the
  mockup's PRODUCT block adds scale 0.985 (plan said plain fade; mockup wins,
  F8); reduced-motion keeps timing, drops scale (mockup spec — not instant).
  Hide defers only the PICTURE: `is-hiding` + `pointer-events: none` +
  `animationend` (literal — `dom.EventType.ANIMATION_END` resolves to the
  never-firing webkit-prefixed name under Electron's UA, see notes) + 160ms
  disposable fallback in one store; `display:none` at settle; teardown-path
  guard (store disposed → instant hide). `hide()` changed by ONE statement —
  onHide/`inQuickOpen`/focus-restore order byte-identical (trace in record);
  `isVisible()` = class read (6 callers audited; `focus()` was the one that
  would have stolen focus back mid-fade). Entrance replays from hidden or
  mid-fade; wizard step-to-step does NOT pulse (deliberate, F9). Truing:
  progress strip `:not(.active)` → height 0 (idle panel exactly 405; loading
  +2px at the division line); row ink to mockup x6 icon / x27 name (both icon
  paths + tree); S3's toggle-centering concern MEASURED FALSE — struck.
- [x] **S5 border-box** (`374d13d0572`): battery found the panel rendering 922
  — the 1px theme border sat outside the 920. `box-sizing: border-box` per
  the mockup's explicit "920×405 border-box (918×403 inner)". DnD reads dead
  under the flag; anchored branch dormant in-tree (no callers, verified).
- [x] **S6 preview pane** (`79941f61cc5`, ruled in by F1 "Yes, add it"): the
  panel splits 400 | 1px `pickerGroup.border` | 517 when a picker's item SET
  contains file-backed items (duck-type `resource: URI` +
  `canHandleResource`; Cmd+P + workspace symbols split; palette + goto-line
  never do; goto-symbol-in-file carries `uri` not `resource` — stays
  full-width, see notes). Layer-clean: platform knows only a 5-method
  `IQuickInputPreview` contract on `IQuickInputOptions` (attach/setItems→
  split?/setFocus/layout/hide) + a left-column host created ONLY under the
  flag (non-mac DOM byte-identical) + new `QuickInputList.onDidSetItems`;
  the workbench side (`quickInputPreview.ts`, injected at the workbench
  service's existing `createController` options) owns the embedded
  `CodeEditorWidget` (`isSimpleWidget`, `contributions: []`, readOnly,
  minimap/folding/sticky off, 6px scrollbar) + `ITextModelService`
  references (released on every path), 100ms settle debounce +
  cancellation, aux-window rebuild by `vscodeWindowId`. Pane =
  `peekViewEditor.background` at 0.90 via LOCAL `color-mix` (NOT added to
  the overlay set — real peek views untouched); editor's two own paints
  starved by var-redefinition inside the pane only; 25px crumb title
  (`descriptionForeground`, chevron codicons, filename never shrinks);
  ABSOLUTE line numbers set explicitly — the D19 "previews keep absolute
  line numbers" ruling lands here against the M12 relative default; file's
  own effective editor font settings passed through (a hand-built widget
  ignores user settings — would have rendered Menlo 12); rangeless items
  reveal top, symbol picks center their range; non-interactive v1
  (pointer-events none, tabIndex −1, aria-hidden — the list row already
  announces the file); widget grid single-column default (byte-same look)
  → `has-preview` 400/1/minmax(0,1fr); pane released at dismiss-SETTLE,
  never mid-fade. valid-layers-check green.
- [x] **S7 alignment commands hidden** (`7c3dc725530`, ruled by F3 "Hide
  them"): the two `alignQuickInput*` Action2s not registered + Customize
  Layout rows AND their "Quick Input Position" section header gone under
  the same `telescopePanel` const; the picker's Reset button's unawaited
  `executeCommand('...alignQuickInputTop')` ALSO gated — against an
  unregistered command it rejects unhandled on every Reset press (forced
  by the ruling, judged in-flight). Platform `setAlignment` API + context
  key untouched; full reference sweep table in the session record; no
  test asserts the ids; non-mac byte-stock.
- [x] **S8 pinned split height** (`f253ecc1d2d`, ruled at the re-look:
  "set a semi-fixed size... scales down with the editor, either by
  percentage or breakpoints" — PERCENTAGE chosen, a threshold jump is
  visible): one derived figure `pinned = max(75, min(405, round(H ×
  405/859), H−32))` (405/859 = the mockup's own panel-to-window share;
  new `TELESCOPE_HEIGHT_SHARE`); split state pins `style.height` to it
  (short lists leave glass ABOVE the rows — column-reverse main-start is
  the bottom); unsplit stays content-driven; the bottom anchor derives
  from the same figure in BOTH states so the prompt line is the window's
  answer alone (byte-identical to round 1 at H≥859: 405/296 at 868); the
  shrink governor unified on it (`pinned − 53` below 405). Write-path
  trace closed every stale-height route (show() clears the class via
  `setElements([])` before the entrance's own updateLayout). Arithmetic
  table in the session record; at 868/859/1200 all values byte-equal
  round 1.
- [x] **S9 whole-row snap** (`3965f303548`, from the S8 review): the stock
  inline-cap snap `floor(h/44)*44+6` could EXCEED the handed budget by up
  to 5px (top row shaved under `overflow:hidden`) and lands fractional
  22px rows at shrink windows (600px → 10.27 rows). Under the flags the
  snap is `floor(h/22)*22` — whole telescope rows, never over budget —
  in `quickInputList.layout` AND the tree controller twin (which got its
  own `telescopePanel` const + platform import, sibling-idiom); stock
  formula byte-kept flag-off; the M16 style.css governor comment
  rewritten to the S8 truth (comment-only). Spot-table: budgets
  277/230/183/153/88 → 264/220/176/132/88, all ≤ budget, all mod-22
  zero (old overshot 88→94). Also recorded, not acted: anchored pickers
  + `has-preview` is a latent S6 edge (anchor-blind class toggle; zero
  in-tree anchored callers — dormant).
- [x] **VM battery (D23) 30/0** — fresh instance, fork repo as workspace:
  gate class; entrance/dismiss animation names + mid-fade cancel + no ghost;
  920 border-box exact; centered; bottom offset 296 = (868−405)×0.64 exact;
  list-above-prompt; coat rgba(32,33,34,0.9); 12px/hidden/column-reverse;
  single painter (elementsFromPoint: exactly one paint in the widget stack);
  16 rows, focused = bottom row, gap-to-prompt 6; height 405 at cap; input
  26px mono 13; header 6px + 1px hairline; progress idle 0; highlight weight
  400; pill r7/ml8/w=list−16; ink x6/x27; outline none/transparent; fill
  rgb(41,122,160); ArrowUp = exactly one 22px row; ENTER on bottom row opened
  titlebarPart.ts (accept = best match, end-to-end); dismiss lingers with
  focus already out; settle to display:none; reduced-motion both names; the
  palette same geometry + sticky bg 0.9. Screenshots delivered (find-files
  over titlebarPart.ts + palette).
- [x] **VM battery round 2 (post S6/S7) 41/0** — all 30 round-1 probes green
  unchanged, plus: split engages on Cmd+P (left column 400 exact, pane 517,
  grid `400px 1px 517px`); crumbs follow focus (crumb tail == focused row
  label, incl. after an 8-step arrow sprint with input keeping focus); pane
  material `color(srgb …/0.9)` == rgba(25,26,27,0.9) exact with the editor's
  own paint transparent; ABSOLUTE numbers proven (1,2,3 in the pane while
  the build's default is relative); font parity pane==main 14px/21px; height
  405 with the split on; dismiss fades the WHOLE picture (crumbs still
  present mid-fade) then releases at settle (crumb count 0, display none);
  palette stays no-split full-width; "move quick input" palette query
  returns ZERO alignment commands (S7 proven live). Two battery-probe
  artifacts fixed en route (grid reads flexDirection `row` legitimately;
  color-mix serializes as `color(srgb)`). Screenshot delivered (split
  find-files: pane showing titlebarPart.ts, crumbs + absolute gutter).
- [x] **S10 telescope-large size** (`51f75e45d86`, ruled via question round:
  offered mockup-proportions-uncapped / taller-only / telescope-large —
  **Sebastian picked TELESCOPE LARGE**): the panel is now SHARES of the
  window with nothing capping from above — `TELESCOPE_WIDTH_SHARE = 0.8`,
  `TELESCOPE_HEIGHT_SHARE = 0.65` (bottom share 0.64, floor 75, `−32`
  guards unchanged); the mockup's 920×405 is SUPERSEDED by verdict (r4
  precedent). The governor is now the ONLY list-height authority — hands
  `panelHeight − 53` (whole-row-snapped) in EVERY window and both states;
  the CSS 16-row cap deleted (padding kept; stock's 20-row rule never
  binds — inline wins, written before first paint). Results column stays
  fixed 400 — the pane absorbs ALL width growth. At his 1512×982:
  1210×638, 26 rows, pane 807. Identity recorded: unsplit ≤ split by
  0–21px (snap slack), prompt line unaffected. Comment sweep: zero stale
  920/405/sixteen-row claims outside the superseded-figures note.
  Side effects recorded (flags R6/R7): sub-504px-wide windows overflow
  the 400 results column into the clip (threshold was ~434 pre-S10;
  degenerate); dormant anchored pickers lost the removed CSS ceiling
  (zero in-tree callers).
- [x] **VM battery round 3 (post S8/S9) 45/0** — all round-2 probes green
  unchanged, plus the sizing ruling proven live: 1-result split query →
  panel STILL 405 (pane 403 full height, 331px glass above the row);
  1-row filtered palette → 75px content-driven; **prompt line invariant
  split vs unsplit: 571 == 571** (the shared-figure anchor's whole
  point); CDP device-metrics 600px window → panel 283, prompt line 203 —
  the 405/859 share to the pixel (`min(405, round(600×405/859)) = 283`,
  `round((600−283)×0.64) = 203`). Screenshot delivered (1-result split:
  pinned panel, glass above the pill, full-height pane).
- [x] **S11 liquid glass** (`22d851b738f`, ruled: "add blur to the background
  ... exactly as the material in the sidebar"): `quickInput.background`
  MOVES into `MAC_TRANSLUCENT_SURFACES` (the sidebar's own 0.30 tier) and
  the S2 overlay tier (0.9) RETIRES whole (set + helper + getColor branch
  deleted — clean partial revert, two sets remain, disjointness re-proven);
  the widget gains `backdrop-filter: blur(52px) saturate(1.9)` — the
  D19-approved CSS approximation of the vibrancy material (the rail's own
  figures), needed because the panel floats over the OPAQUE editor which
  window-vibrancy can't reach. Pane color-mix 90%→30% (one sheet). Motion
  verdict: Chromium 148 composits backdrop-filter with group opacity — the
  blur fades, no pop (verified reasoning, confirmed live). Resolution
  proofs: quickInput rgba(32,33,34,0.3), sideBar 0.3 unchanged, title
  alpha-0 unchanged, peekViewEditor untouched.
- [x] **S12 sticky pill single-coat** (`7636f83f511`): S11's letter put the
  sticky glass on the CONTAINER; measured at 0.3 that reads as a two-tone
  band (abstractTree generates the tint for container AND row; the pill's
  8px inset shows the container coat in the gutters: 0.51/0.657 steps).
  Ruled to the fork's own laws: container starved (`background-color:
  transparent`, (0,5,0) over generated (0,4,0)), the pinned ROW carries
  `backdrop-filter: blur(12px)` over its generated 0.30 tint (tie-break to
  the generated rule by document order — recorded). One coat everywhere,
  one glass pill pinned; geometry safety verified (rows share the pill's
  column, overflow hidden).
- [x] **S13 comment truth** (`14b79f37f2e`): the S11 sticky-feed comment's
  two stale clauses rewritten (container paints nothing; blur is on the
  row); comment-only.
- [x] **S16 OPAQUE PANEL** (`79ed5ab228b`, ruled: "It looks terrible just
  use an opaque background then" — supersedes BOTH the mockup's 0.90 and
  the glass ruling; verdict chain in the commit body): the material
  stack S11–S15 unwound to plain opaque theme colors (+54/−181) —
  `quickInputBackground` leaves the translucent set (joins NOTHING;
  resolves stock `#202122`), the inline paint returns byte-stock, both
  `::before` underlays deleted, zero `backdrop-filter` anywhere, pane =
  plain opaque `peekViewEditor.background` (`#191A1B` — its tone
  differentiation RETURNS, resolving R9), sticky pill = opaque cover by
  itself (S12 container starve kept as single-painter hygiene), title
  strip alpha-0 kept, comment sweep to the opaque story (incl. two
  theme.ts paragraphs the change falsified). Geometry/order/cosmetics/
  motion/preview structure untouched. Resolution proofs green;
  Theme|Color 113/0. **Resolves by dissolution: R9 (differentiation
  back), R10 (walkthrough SVGs opaque again), R11 (no glass, no
  readback question), R12 (nothing to pop).**
- [x] **S17 rename** (`ff89606852b`): `glassPanel` → `telescopePanel` in
  quickInputService.ts (3 lines) — the flag named for the panel, not
  its material; matches its three siblings verbatim.
- [x] **VM battery round 7 (opaque) 45/0** — widget inline `#202122`
  opaque, zero filters (widget + pseudo probes), single painter =
  the widget itself, pane `#191A1B`; all geometry/order/motion probes
  green unchanged. Screenshot delivered (solid panel over the deep
  tree — nothing shows through).
- [x] **S14 blur edge falloff fix** (`c8c447b7282`, ruled: "the filter is
  not being applied to the entire container, just to the center and dims
  outwards" — the classic backdrop-filter falloff: the readback is
  clipped to the filtered element's box, the kernel starves at the rim):
  both filters move onto OVERSIZED `::before` underlays clipped by the
  existing overflow — widget `inset:-104px` (2×52), sticky pill
  `inset:-24px` (2×12), both `z-index:-1` inside verified stacking
  contexts (abs pseudo ≠ grid item; underlay above the coat, below all
  content; pill's pseudo lands in the sticky container's context BELOW
  the generated tint — deliberate divergence from the brief's letter,
  since a one-row tint inside a 12px kernel would never reach full
  strength; ruled to the S13-documented layering).
- [x] **S15 coat onto the underlay** (`32dee8d9aa8`, closes S14 review
  risk 1 — GEOMETRIC certainty, not a maybe: with the coat inside the
  box and the readback 104px past it, the rim tint would halve —
  "dims outward" returning as coat feathering): the widget paints NO
  inline background under `telescopePanel`; the underlay carries
  `background: var(--vscode-quickInput-background)` — an element's
  background composites OVER its own backdrop-filter output, so the
  visible result is a uniform 0.30 coat over full-strength blur at
  every pixel. Comment-truth ride-alongs on two neighbouring
  paragraphs the change falsified.
- [x] **VM battery round 6 (underlay expectations) 45/0** + targeted
  experiments: corner + center glass crops = full-strength fog TO THE
  RIM incl. the rounded corner (falloff PROVEN FIXED; just-outside
  sidebar ink bleeds softly in — correct glass-edge optics); coat
  uniform (no rim feathering). **Instrument lesson (ops): CDP
  `Page.captureScreenshot` CANNOT observe compositor-driven
  opacity/transform animations — it reads the main-thread tree
  (frames showed opacity≈0 while the screen faded); animation claims
  need guest `screencapture` timing.** Mid-fade blur contribution
  under the underlay structure could not be conclusively measured
  even with a slowed fade → recorded as R12 (live-look item).
  Deep-tree recheck: R11 (sidebar-strip crisp pass-through)
  structurally unchanged under the underlay, as predicted.
- [x] **VM battery round 5 (glass expectations) 45/0** — coat rgba(32,33,
  34,0.3) + backdropFilter blur(52px) saturate(1.9) on the widget; single
  painter at 0.3; pane [25,26,27,0.3]; all geometry/order/motion probes
  green unchanged. **Glass verified over the editor by controlled pixel
  experiment**: filter-on = full fog, filter-off = legible bleed-through
  (CDP clip diff, crops kept in session scratch).
- [x] **VM battery round 4 (post S10, share-aware expectations) 45/0** —
  every probe recomputed from the shares and green at 1440×868: width
  1152, split height 564, prompt line at bottom 195 (invariant 672==672
  split vs unsplit), pane 749, palette 23 rows @ 559 content-driven,
  1-result split holds 564 with 490px glass, emulated 600px window →
  390/134 exact. Screenshot delivered (telescope-large split over the
  editor).
- [ ] **Sebastian gate — flag verdicts** (round 1 RULED 2026-09-03: F1 "Yes,
  add it" → preview pane BUILDS as S6; F3 "Hide them" → S7; F6+F7 "Its ok" —
  sticky strip + shadow stand as built; F8 "Its ok" — dismiss scale stands.
  Remaining flags were presented as stand-unless-objected; final gate ruling
  comes with the S6/S7 re-look):
  - **F1** mockup's right-hand 400px preview pane is NOT in the ratified plan
    scope — panel ships full-width results; the editor behind stays the
    preview surface. **RULED: ADD IT → S6** (400 | 1px pickerGroup sep |
    rest; pane = peekViewEditor.background at the panel's 0.90 LOCAL alpha;
    25px crumb title; embedded read-only editor, ABSOLUTE line numbers —
    lands the D19 "previews keep absolute line numbers" note; split engages
    only for file-backed item sets, palette stays full-width).
  - **F2** no in-input match counter ("184/8196") — not scoped.
  - **F3** "Move Quick Input to Top/Center" commands are visually inert now
    (position baked). **RULED: HIDE THEM → S7.**
  - **F4** validation message rests on the panel's bottom edge (below input).
  - **F5** multi-step titlebar sits at the panel's FOOT, transparent; loading
    pickers draw the 2px progress bar at the division line (+2px while
    loading).
  - **F6** pinned separator strip paints the coat twice (≈0.99, near-solid) —
    the plan's alpha-0 deviated by measurement (fallback = sideBar 0.3 + rows
    ghosting). ~1% focused-row cast possible beneath it. **RULED: STANDS.**
  - **F7** sticky-scroll shadow (shared `scrollbarShadow`) still smudges under
    a pinned separator over the glass; clearing it needs a TS feed override
    (no dedicated color id). **RULED: STANDS (shadow stays).**
  - **F8** dismiss ships the mockup's 0.985 scale + fade (plan text said
    plain fade); reduced-motion keeps 180/120 timing, opacity-only.
    **RULED: STANDS.**
  - **F9** wizard/multi-step pickers do not replay the entrance per step.
  - **F10** panel height is a constant until the window can't hold it
    (<437px → shrink, 16px margins) — mirrors the width rule.
  - **F11** input placeholder renders monospace too.
  - **F12** no unit test asserts the mac surface sets (D10 precedent had
    none; a platform-gated test would be a new precedent — want one?).
  - **F13** palette with empty history reads pure-alphabetical reversed (A at
    the bottom); with usage the recently-used group sits at the bottom.
- [x] **Sebastian final gate — APPROVED 2026-09-04 ("Approved, commit")**.
  Approval covers the presented state (A01 precedent): the standing
  flags R1–R8 below stand as built; F1/F3 were BUILT (S6/S7), the
  sizing ruling BUILT (S8+S9), telescope-large BUILT (S10), the
  material arc closed OPAQUE (S16/S17); F6/F7/F8 ruled standing;
  un-objected round-1 flags (F2, F4, F5, F9–F13) stand as presented.
  Flag record kept below for history:
  - **R1** rangeless file picks preview from the TOP of the file (symbol
    picks center their line); the mockup's lines 90–107 were scene
    dressing.
  - **R2** pane is non-interactive v1 — no click/scroll in the preview,
    keyboard never leaves the prompt. Interaction = later candidate.
  - **R3** gutter is monaco-true: ~37px at 3-digit files, grows a digit at
    a time (mockup drew a flat 40).
  - **R4** goto-symbol-in-file (Cmd+Shift+O) stays full-width — its items
    point into the file already open behind the panel (and carry `uri`,
    not `resource`). Follow-up candidate if the pane is wanted there.
  - **R5** Customize Layout's Reset no longer sends the alignment command
    on mac (it would reject unhandled against the unregistered id; the
    position is baked regardless).
  - **R6** (post-S10) below ~504px window width the fixed 400px results
    column + hairline outgrow the 80% panel and clip at the sheet edge —
    degenerate windows only (pre-S10 threshold was ~434; a split-suppress
    width gate is the fix if ever wanted).
  - **R7** (post-S10) dormant anchored pickers lost the removed CSS row
    ceiling (can reach stock-like heights again; zero in-tree callers —
    the branch is dead code today).
  - **R8** (post-S10) switching between a splitting and a non-splitting
    query nudges the panel's TOP edge by ≤21px (whole-row snap slack);
    the prompt line never moves — the intended reading of the invariant,
    just more visible at 23 rows than 16.
  - **R9 RESOLVED by S16** (opaque pane restores the full tone
    differentiation).
  - **R10 RESOLVED by S16** (the SVG token resolves opaque again).
  - **R12 MOOT by S16** (no filter, nothing to pop).
  - **R11 MOOT by S16** (no glass; the investigation ledger + the ops
    lesson about CDP-vs-compositor stay recorded below for any future
    translucent surface). Original record: (post-S11, INVESTIGATED IN
    FULL — evidence crops in session
    scratch): where the panel overlaps the SIDEBAR (~150px strip), the
    sidebar's own ink (deep tree labels, file icons reaching past CSS
    144) shows through the glass CRISP instead of fogged, on the real
    screen. Root cause: content in the window's TRANSLUCENT/vibrancy
    region never joins Chromium's backdrop-filter readback in the live
    window compositing (transparent-window limitation, electron#20357
    family); the opaque editor fogs perfectly. Exhausted on a live
    reproducing scene: mask removal, layer promotion (translateZ/
    will-change), epsilon-alpha root background, clip-path replacement —
    none reach the on-screen path. NOT fixable CSS-side. The 0.3 coat
    still dims the ink; shallow trees only edge-bleed (which is correct
    glass optics — the 52px blur smearing just-outside labels into the
    first ~50px). ACCEPT as a material limitation, or rule a mitigation
    (denser coat = diverges from the sidebar-exact ruling).
- [x] On approval (done 2026-09-04): fork pushed, pin bump + doc fold
  committed on the verdict. Packaged markers still ride the next
  packaged pass with M12's (M12 § Close carries the list).

M16 session notes (ops + follow-up candidates, no verdict needed):
- `dom.EventType.ANIMATION_END` is DEAD under Electron (UA says AppleWebKit →
  resolves to `webkitAnimationEnd`, which Chromium never fires; zero in-repo
  users today). Candidate one-line cleanup some hygiene round.
- Hidden-input pickers keep stock 4px list margins (header rule scoped to
  `:not(.hidden-input)`).
- VM ops (bit us this session): after a HOST recompile, the guest's VirtioFS
  view of `out/` can go stale/ENOENT — a `Page.reload` mid-rebuild wedges the
  window (dev workbench can't recover from a bare navigate; main process owns
  its window config). Remedy: `--stop-vm` + fresh launch. Also: `launch-vm.sh`
  with NO args LAUNCHES a new instance (it is not a status command), and a
  second instance steals focus which auto-closes the first window's quick
  input mid-capture.
- **Glass verification ops (M16 S11 lesson): CDP captures LIE about
  backdrop-filter over the translucent chrome** — `Page.captureScreenshot`
  renders offscreen and applies the blur to the sidebar subtree; the real
  window compositor does not (R11). Any glass-over-vibrancy claim must be
  judged on compositor captures (`capture-vm.sh`/`screencapture`), never CDP
  crops. Conversely CDP crops are the right instrument for glass-over-editor
  (opaque) proofs, incl. filter-on/off pixel diffs.

### M17–M19 — vim tail (GATED on M4; vehicle RULED: VSCodeVim — D21 amendment 2026-09-02)

- [ ] M17 — VSCodeVim integration (the research round's extension question is
  CLOSED — Sebastian ruled VSCodeVim over vscode-neovim at the M12 checkpoint
  round): mode-block wiring (extension statusbar item; overrideEntry restyle,
  priority remap/CSS order for far-left position), 120ms INSERT crossfade,
  M16 handoff flip; per-view fidelity deltas surfaced for verdicts
- [ ] M18 — which-key per view 3: own widget driven by VSCodeVim's state
  (VSCodeVim runs no upstream nvim plugins)
- [ ] M19 — flash per view 4: same own-widget shape; VSCodeVim's easymotion is
  the flash-adjacent surface, judged at the brief (r5 open point stands:
  where the typed pattern lives — no cmdline echo ruled)

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

## M20 — Icon set v2 (D22; NON-BLOCKING)

Full redesign of the icon set under ONE construction recipe. Gates nothing — the M11
set keeps shipping for testing; v2 integrates in one swap commit when finished.
Working dir: `m20-icons-v2/` (umbrella). The law: [style-guide.md](m20-icons-v2/style-guide.md)
(v1 autopsy · laws L1–L10 · 4 style candidates · production plan). Reused from
`m11-icons/` verbatim: inventory, name/ext/lang associations, pins, theme logic
(payload-only swap — 1,161 file + 618 folder ids), tools (validate / letterpath /
chromium+raster / contact / audit), brand-colors.json (193 verified hexes).

- [x] Style guide authored (2026-09-02): failure autopsy, L1–L10, candidates
  A Chips / B Brand true / C Wire / D Duotone, production plan
- [x] ROUND 1 samples: 8 subjects × 4 styles + sheet — built, reviewed, published
  (artifact 08b4a297), RULED 2026-09-02: all four REJECTED (freehand fidelity
  failure); guide L2 hardened + §3 replaced by round-2 treatments; round-1 dirs
  parked as rejected history
- [x] ROUND 2 samples LANDED + review-green 2026-09-03: 12 subjects × 4 treatments
  over ONE shared faithful master each (official artwork + simple-icons CC0;
  byte-level derivation gate in check.mjs; fidelity proofs source-vs-master;
  provenance in samples/sources.json); sheet republished, same artifact URL
  (`round2-faithful`). Candid finds: prettier officially unreadable at 16px
  (0.76px bars) → shipped reduction; editorconfig solid-silhouette (line-art
  mascot under 0.5px); react absent from shipped v1 (nearest = reactjs JSX badge)
- [x] **D22 RULED 2026-09-03: R1 TRUE COLOR** + prettier rider (readable
  reductions for 16px-hostile official marks) — §5 recipe card locked into the
  guide; both rounds' errata folded in (L5 1.2px official floor, L6 achromatic
  exemption, L8 2KB advisory, neutral-folder white-mark rule)
- [x] Samples workshop committed (`2fef461`, 2026-09-03, pilot session):
  `.gitignore` ignores `samples/tools/node_modules/` + `tools/node_modules/`;
  session calls per the delegation — `sources-svg/` TRACKED (inputs to the
  standing fidelity gate; licenses in sources.json) and `round1-rejected/`
  TRACKED (rejected history, house style); everything else under samples/
  tracked too (119 files — all four treatment dirs stay, check.mjs gates all
  five; sheet.html/png + fidelity-proof.png = review evidence, m11 precedent)
- [x] **Pilot BUILT 2026-09-03 (delegated; session re-ran gates + reviewed
  proofs/sheet) — SEBASTIAN GATE PENDING.** 24 icons in `m20-icons-v2/pilot/`
  + production toolchain `m20-icons-v2/tools/` + artwork store
  `m20-icons-v2/sources-svg/` (all three UNTRACKED until the gate;
  rebuild: `cd m20-icons-v2 && node tools/gates.mjs`). Roster: 10 carried
  file masters (byte-identical to samples, asserted in check) + 6 autopsy
  offenders rebuilt from official artwork (npm = the brand's own 16×16
  square lockup; dotenv = prettier-rider ".E" reduction; yaml = the real
  YA/ML lockup, NOT mark-less as guessed; git #F05032 diamond; go wordmark
  minus 0.37px motion lines; vue two-tone from vuejs/art) + 4 folder pairs
  closed+open (src, node carried; test = white check; docker = white whale,
  containers dropped at face scale). Gates: check 0 fail / 6 advisories
  (editorconfig·rust·python carried >2KB, D22-priced); 16px proofs 19 pass +
  5 marginal (editorconfig, eslint, rust, yaml, vue — recorded per icon in
  manifest.json); fidelity strips new+all; twin audit 0 twins / 0 form
  collisions, 7 color hits separated by form, 4 blues measured clear, new
  PLATE sub-rule (plates score glyph-to-glyph); letter audit 0 typeset.
  Sheet → https://claude.ai/code/artifact/a6ff6bf2-1af0-4877-b5b4-f059239ec0d7
  (`pilot/sheet.html`, same path = same URL) — 13 numbered flags, key ones:
  open-folder NEW construction (v1 two-panel silhouette + shade(body)=
  hsl(h,s,max(18,l−15)); white mark byte-identical both states so it crosses
  the panel seam), color source-of-truth conflict (brand-colors.json vs the
  brands' own files: npm/git/go differ; rule applied = brand-colors wins
  primary, artwork wins secondary layers — UNRATIFIED), dotenv ".E"
  (fallbacks: bare field or single E), yaml 16px = red letter block (the
  mark's own construction, not a fit failure), vue inner #35495E at 2.01:1
  kept faithful (eslint 2.25:1 = D22 precedent; lift-rule wording clarified:
  applies to ink that MEETS THE BACKDROP — errata candidate). Pilot commit +
  guide errata fold wait on the verdicts.
- [x] **GATE RULED 2026-09-03: 22/24 APPROVED as built.** Ratified with them:
  open-folder construction + shade formula (flag 1), color source-of-truth
  tiebreak (flag 2: brand-colors.json wins the primary hex, the artwork's own
  fills win secondary layers), dotenv ".E" (flag 3), lift = backdrop-meeting
  ink only (flag 4), yaml faithful lockup (flag 5), vue dark half at 2.01:1
  (flag 8), folder-test check (flag 9), folder-docker whale-only face
  (flag 10). Ratified errata FOLDED into the guide same day (§5 lift/color
  tiebreak, §5 open-folder construction, L5 gestalt erratum). REJECTED:
  docker + editorconfig ("definitely NOT the docker or editorconfig logo") —
  D22's per-icon fidelity verdicts AMENDED for the two carried subjects:
  docker's 3+1 deck lost the loaded-cargo pyramid; editorconfig's solid
  silhouette destroyed the drawn mascot (the official mark is line art).
- [x] **Fix round LANDED 2026-09-03 (delegated; session re-ran gates +
  reviewed proofs) — republished, same URL.** Only 4 SVGs changed (docker +
  editorconfig, master+icon; sha256-asserted the other 22 icons and all
  other masters byte-identical, folder-docker untouched). docker: deck
  3+1 → **3+3+1 (7 boxes)** — official box geometry translated only,
  1.21px gaps over the 1.2 floor, rows fuse into columns exactly as the
  official; 9-candidate study PNG proves 3 columns is the ceiling (4-wide
  overruns the deck or shrinks the box; `proofs/docker-deck-candidates.png`);
  fit now height-bound, ink 14.50×10.40. editorconfig: RE-SOURCED to the
  brand's own vector (`editorconfig/editorconfig` assets/EditorConfig_Logo.svg
  → `sources-svg/editorconfig-official.svg`) — ink contour + official
  counters painted back in official colors (#FDFDFD face, pink ears),
  spectacles ship SOLID (rim+lens+pupil merged; rider), nose solid; 2640B
  (down from 3700). Rejected bytes kept in `pilot/rejected/` for the sheet's
  fix-round strip. Gates: 0 fail, carry gate two-sided (10 frozen + 2
  superseded-by-pilot), 16px proofs 20+4 marginal (editorconfig marginal →
  pass), twin re-run clean (markdown↔editorconfig form 0.131). New flags
  14–20 on the sheet; **flag 14 wants a ruling before slices**: the
  editorconfig artwork repo ships NO license (recorded verbatim; fallback =
  simple-icons CC0 same-construction, but 4475B = over the 4KB cap, would
  need further reduction). Minor: 6-box variants (3+3 / 3+2+1) are a
  one-line swap if 7 feels crowded.
- [x] **APPROVED (Sebastian 2026-09-03) — PILOT PHASE CLOSED.** Both fixes
  pass as built; approval covers the presented state, so flag 14 rules WITH
  it: editorconfig keeps the brand's own vector as source, the repo's missing
  license recorded verbatim in provenance (CC0 simple-icons same-construction
  documented as the escape hatch — needs a byte reduction if ever swapped);
  the 7-box deck stands. Pilot committed `0007b9b` (84 files: pilot/ +
  tools/ + sources-svg/, add-by-path; rejected bytes kept in
  `pilot/rejected/` as history).
- [ ] Production slices (own sessions — one slice batch per session):
  file + folder slices sized like v1's A01–A12 / F01–F06, each review-gated on
  its contact sheet. Worklist = `m11-icons/production/longtail-worklist.json` +
  set-manifest ids (payload-only swap, associations untouched); §5 + the
  pilot-ruled errata are the law (gestalt erratum, color tiebreak,
  backdrop-lift scope, open-folder shade formula, plate lane in the audit).
  Letter audit stays dormant in R1 (assert 0 typeset letters per slice)
- [ ] **SLICE A01 BUILT 2026-09-03 (own session, 3 delegated tranches; session
  re-ran gates + reviewed proofs/sheet each round) — SEBASTIAN GATE PENDING.**
  All 84 worklist concepts (5 archive · 8 binary · 71 code, android→bolt).
  Toolchain made SLICE-AWARE this session: `node tools/gates.mjs A01` builds +
  gates `slices/A01/` (no arg = pilot mode, unchanged); slice registry =
  `tools/slices/A01.mjs` merging tranche modules `A01.t1/t2/t3.mjs` (contract
  at the top of A01.mjs — dropping a module file in is the whole integration);
  shared spec engine extracted to `tools/spec-engine.mjs` + `targets.mjs` /
  `roster.mjs` / `build-slice.mjs` / `check-slice.mjs` / `build-slice-sheet.mjs` /
  `studies.mjs`; pilot re-gated BYTE-FROZEN after every round (git-clean proven;
  the slice check re-asserts it every run). Gates green: check 0 fail /
  4 advisories (debian+python-misc >2KB, D22-priced), 16px proofs 79 pass +
  5 marginal (debian, onnx, alchemy, avro, bats — each the mark's own
  construction, recorded per icon), twin audit 0 twins / 0 form collisions
  (52 colour hits separated by form; 29 family + 782 collapse pairs declared
  in their own lanes, never silent), letter audit 0 typeset. 20 branded ships
  incl. SAP, chrome (Google's own file), TOTVS's advpl family in its own four
  official hues (new family mode `recolour`), bicep (FIRST Microsoft mark:
  Azure/bicep plain MIT, no trademark rider — checked), arduino, bazel, avro,
  gpg, pytorch, adonis, allure. TWO WORKING RULES opened with the slice
  (recorded in manifest + on the sheet, need ratification): R1-families
  (variant glyph in official colours / byte-identical base / brand's own
  recolour) and R2-collapse (mark-less → neutral vocabulary). Headline flags:
  **40/84 byte-identical on the gray generic-code glyph** (letters banned +
  marks unsourceable or 16px-hostile; two relief levers measured — 3 extra
  object glyphs or L2 tier-3 relaxation); **angular ×7 one red payload**
  (Material has NO variant geometry — clone+colour entries only, verified in
  the pinned source); antlr's real mark REMOVED by the twin gate vs chrome
  (0.798 form on the 0.72 bar); corporate-mark line ruled testable + then
  CORRECTED by t3 (flag 25: simple-icons DOES carry `dotnet`/`blazor`;
  github.com/dotnet/brand is CC0 — csharp/fsharp/vb noted for later slices);
  Azure declined on Microsoft's own published terms (but Azure/bicep vendors
  the full Azure icon set under MIT — Sebastian's call, flag 26); bench-*
  per-language family precedent (flag 24, generalises to test-js/spec-ts
  kin). 35 numbered flags total, full text on the sheet §5 +
  `slices/A01/manifest.json`. Sheet →
  https://claude.ai/code/artifact/8a69846a-43c3-4479-a078-c52b901e9cd1
  (`slices/A01/sheet.html`, same path = same URL). NOTHING committed:
  slice outputs + tranche modules + new sources-svg files untracked,
  tool files modified unstaged — commit rides the gate verdict (pilot
  precedent). `.playwright-cli/` at repo root = disposable headless-shell
  cache from the shot tooling, not a deliverable.
- [ ] **GATE ROUND 1 RULED + FIX ROUND LANDED 2026-09-03 — RE-LOOK
  PENDING.** Sebastian's ruling = **D22 AMENDMENT: license/trademark
  non-binding** (personal, non-distributed build; real icons preferred;
  L2 orders by fidelity alone; license facts still recorded verbatim) —
  binds A02+ too. Fix round (delegated; session re-ran gates + reviewed):
  **brackets 40 → 20**, branded 37 → 54. Shipped: vsix (VS Code ribbon),
  safetensors (HF face — meaning question flagged 38), actionscript +
  adobe-swc (Adobe A, 1b family), apex (Salesforce cloud), applescript
  (Apple logo lifted), al + al-dal (Microsoft's own AL mark from the
  ms-dynamics-smb.al extension, 1b), azure + azurestreamanalytics (1b),
  bolt (Firebase flame), bashly-hook ($ chevron, marginal), riders
  appscript / aspx+asp (one .NET ".N" family, dotenv-pattern) / blade
  (filled contour); antlr REINSTATED (new declared LOOK-ALIKE audit lane
  vs chrome — reported every run, never fails, single-membered).
  Stayed gray with receipts: jar (Java cup = 8 tapering brushstrokes,
  physics not license — flag 39), rider dead-ends ada · agda ·
  autohotkey+ahk2 · behat (flag 42/46), empty re-hunts biml · axure ·
  blink · blitzbasic · beancount. Vocabulary opened: stopwatch (bench
  ×3, marginal — per-language precedent flag 48), terminal (bat + awk).
  Engine: lift trigger L<22 → **contrast<3.0:1** (WCAG 1.4.11; opt-in
  per subject; pilot 44/44 byte-identical proven; §5 guide erratum OWED
  at commit), look-alike lane in audit.mjs, fix-round strip §0 +
  supersession banners on the sheet. Gates green both modes (0 fail, 6
  advisories — debian/python-misc/safetensors ×2 >2KB; 16px 74+10
  marginal; twins 0/0 with 33 family + 194 collapse + 1 look-alike
  declared; letters 0). 15 flags superseded in place (2,3,4,7,12,13,14,
  18,20,21,23,24,26,27,34), new 36–50; sheet republished same URL.
  **RE-LOOK asks**: antlr strip (41), safetensors/bolt company-mark
  reading (38), asp/aspx one payload (44), bashly-hook (47), stopwatch
  (48), lift-constant ratification (50/0).
- [x] **APPROVED (Sebastian 2026-09-03) — SLICE A01 CLOSED.** Approval
  covers the presented state; all six re-look asks rule as built
  (antlr↔chrome pair stands, company-mark-on-format ratified, asp/aspx
  one family, bashly-hook `$`, stopwatch precedent, lift trigger
  contrast<3.0:1). Errata folded into the guide (L2 D22 license
  amendment + company-mark rider; §5 lift erratum 2; §5
  families/collapse/look-alike laws). Slice committed on the verdict:
  docs + guide + tools + tools/slices/ + slices/A01/ + sources-svg
  add-by-path, umbrella only, no pin (`vscode` pointer = live peer
  state, excluded; `.playwright-cli/` cache excluded).
- [x] **SLICE A02 BUILT 2026-09-03 (own session: toolchain prep + 3 delegated
  tranches t1 bosque→circom / t2 clojurescript→dinophp / t3 dlang→falcon, 28
  each; gates re-run + proofs/sheet session-reviewed per round; t1/t2 outputs
  hash-proven untouched by later tranches) — GATE RULED + FIX ROUND FOLDED
  same day; APPROVED, SLICE CLOSED.**
  All 84 worklist concepts (slices[1], all category code). TOOLCHAIN EXTENSION
  (prep round): prior APPROVED slices join the gate — `targets.mjs` `APPROVED`
  list (order-bearing; append 'A02' there at ITS approval, one line per
  verdict) feeds check-slice's FROZEN gate (pilot + priors vs HEAD), the twin
  pool (audit.mjs pools pilot + priors + slice, priors' family/collapse/
  look-alike declarations ride into the lanes), cross-slice family bases
  (`base_set: 'A01'`), cross-slice category-glyph byte-identity, and
  `A02.mjs` registry (null FIX_ROUND until a gate rules; `pilot_frozen`
  manifest KEY kept to keep A01's committed manifest byte-stable — honest
  covers text instead). Sheet-builder fix mid-slice: cross-slice family base
  panes (setIcon/setDir unification). OUTCOMES: 61 branded / 23 neutral
  (20 generic-code byte-equal to A01's, chess ROOK + email ENVELOPE new
  object glyphs in geom.mjs — both measured against alternatives in studies —
  + command on A01's terminal); families al (c-al t1 + dal t2, UNION
  declared in t2 — registry Object.assign clobbers same-name FAMILIES,
  later tranche must carry earlier members; recorded gotcha), dotnet
  (csproj→aspx), sap (cds→abap), adobe (cf/cfc/cfm→actionscript, Adobe's
  own Cf plate measured 1.21:1 and declined), chef (+cookbook), latex
  OPENED in-slice (doctex base + dtx + doctex-installer, the Project's
  kingfisher reduced 6984B→1739B per the prettier rider); kin-without-base
  shipped under variant ids + flagged for future families (erb=Ruby gem,
  eex=Elixir drop, cssmap=official CSS logo small cut, cypress-spec,
  dartlang-generated); 2 new look-alike pairs PROPOSED (duckdb↔emacs 0.940,
  duckdb↔ember 0.986 — ember has an official rounded-square overturn);
  5 lifts (largest group yet — crystal #000 per brand-colors, cue, dhall,
  coconut two-ink first, +1), 4 dark tones deliberately unlifted; declines
  with receipts: drools (0.55px median), dinophp (6461B > 4KB cap + L5),
  buckbuild ships Buck 1's readable antler over Buck 2's 0.22/0.38px deer
  (ruling asked), doxyfile/capnp wordmark-raster dead-ends, edge's only
  SVG is a potraced solid square. Gates green both modes (A02: check 0
  fail / 20 advisories all >2KB-priced; roster 84/84 modules 3/3;
  pilot+A01 frozen; 16px 58+26 marginal; twins 0/0 — 54 family + 786
  collapse + 3 look-alike declared; letters 0 · pilot + A01 reruns green,
  committed tree byte-clean). 51 flags, 6 studies. Sheet →
  https://claude.ai/code/artifact/4460a259-137b-409c-a99e-6742df4357a0
  (`slices/A02/sheet.html`, own URL per slice; same path = same URL to
  republish). **GATE RULED same day (Sebastian, itemized on the 7 chat
  asks)**: 2 c-al/dal on AL · 3 buckbuild antler · 4 cuda NVIDIA · 6
  duckdb look-alike pairs · 7 dune/ejs/eex/erb/elm — all "Ok" as built;
  5 LaTeX kingfisher explained (question tool), CONFIRMED as built; 1
  ColdFusion OVERTURNED with a directive — "In those cases you can use
  a background in a frame with their corners rounded (like in previous
  iterations)", clarified pick: ADOBE'S OWN FRAMED ICON; overall
  "Approved". **FIX ROUND folded same day** (delegated; session
  reviewed + re-gated): cf/cfc/cfm re-ship Adobe's REAL framed
  ColdFusion icon — hunt found the framed cut on adobe.com's own
  product-icons tree (internal id `cf_builder_2016_appicon`; fetched
  via the aem.live mirror, byte-confirmed; + framed FrameMaker/RoboHelp
  corroborating the w/24 inset and framed Photoshop-iPad supplying the
  one missing ratio, inner r = 0.8541 × outer); frame built as an L8
  filled ring (counter-wound inner rect, no stroke), thickened INSIDE
  Adobe's spec form w/24 → w/10 = 1.28px (w/11 measured 1.16 = under
  the floor first — smallest legal departure); #7BADFF frame+letters /
  #002258 field verbatim UNLIFTED (mark-interior ink per the erratum);
  16px verdict pass (marginal) — letters 0.97/1.06/1.19px are Adobe's
  own drawing. Trio leaves the red-A adobe family → own `coldfusion`
  family (base cf, A02); flag 1 SUPERSEDED in place → fix flags 52
  (ruling) + 53 (build); A02.mjs PREAMBLE filled (the designed edit);
  frame study added (shipped w/10 · Adobe w/24 · rejected w/11 · bare
  plate); new local `rectShapes()` reader in t1 (spec-engine's
  officialShapes skips <rect> — recorded). Surgical proof: exactly
  6/168 outputs changed (cf/cfc/cfm ×2 dirs, hash-asserted). Plate
  lane clean: cf's max vs any non-family plate 0.162 on the 0.92 bar;
  one informational near-twin (trio ↔ dartlang-generated, form 0.102).
  RULED LAW folded as guide §5 ERRATUM 3 (framed-plate construction:
  frame carries the silhouette, field = interior ink never lifted,
  brand's own framed cut > sibling-corroborated ratios, thickening
  inside the brand's spec form). `targets.mjs` APPROVED = ['A01','A02'].
  Sheet-record defects found by the round FIXED tool-side pre-republish
  (section-0 flag numbers derived not hardcoded; fix-strip "was" panes
  resolve a declared FIX_ROUND.was map — optional field added to the
  tranche contract, A01 semantics untouched; pluralization; stale
  APPROVED comment reworded). TOOL FOLLOW-UPS for a later round,
  RECORDED NOT DONE: (a) gates.mjs does not FAIL when build-slice-sheet
  throws — check-slice gates the sheet already on disk, a crash + stale
  sheet passes silently (t3 hit it, caught by grep); (b) pathkit `bbox`
  measures the control-point hull, not true curve extents — ejs mis-fit
  at 53% caught + fixed locally via de-Casteljau split in the t3
  module; an ENGINE fix would refit approved sets and break
  byte-freezes, so it needs its own ruled round. KNOWN CHURN: any
  pilot/A01/A02 regate on a later UTC date rewrites committed
  manifest/sheet `generated` date lines (+ the sheets' fix-round
  ternary sentences) — diff, verify date-only, `git checkout --`
  restore (procedure applied every time this session; A02's own
  manifest committed with generated 2026-09-04, its fix-round build
  date — the ruling date 2026-09-03 is what its sheet §0 prints).
- [ ] **SLICE A03 BUILT 2026-09-04 (own session: 3 delegated tranches t1
  fastlane→gcode / t2 gdscript→haxedevelop / t3 hcl→jest-snapshot, 28 each;
  gates session-re-run + proofs/sheet/studies reviewed per round; earlier
  tranches sha256-proven untouched at every round + build determinism proven
  across independent runs) — SEBASTIAN GATE PENDING.** All 84 worklist
  concepts (slices[2], all category code): **57 branded / 27 neutral**
  (t1 22/6 · t2 19/9 · t3 16/12). Registry `tools/slices/A03.mjs` copied
  from A02's shape (PREAMBLE null until a gate rules); no engine/tool file
  touched — tranche-local helpers only (t1's `sourceShapes` superset reader
  incl. rect/polygon/ellipse + style-class gradients, copied per tranche by
  design). FAMILIES (5): `firebase` base A01 bolt (firestore +
  firebasestorage; Google's own per-product logomarks fetched + DECLINED on
  measurement — badge 6.35px/0.63px strokes, 1.9× rescue fails gestalt;
  firebase-product-study), `gamemaker` ×3 in-slice (brand's own mask-icon
  #71B417; 8.1's retired gear declined on L5), `godot` ×5 in-slice
  (gdscript/gduid/godot-assets/godotshader byte-ride the brand's head;
  greaticons recolour ×5 / Material redraw / vsicons globe all measured off
  — godot-family-study), `hashicorp` (hcl on t2's H — FIRST cross-tranche
  family; parts re-derived from the same artwork, gate proves output
  byte-identity; per-product marks Terraform/Vault/etc. declined as
  inapplicable to the language), `ruby` base A02 erb (jbuilder — FIRST
  family on an approved slice's kin). FRAMED ×2 (erratum-3 2nd + 3rd
  applications): fla = Adobe Animate (field 1.02:1, dimmest yet), flash =
  Flash Player (1.11:1); constants reproduced from A02 verbatim, Animate's
  own rect rx 42.5/240 corroborates Adobe's radius three ways. DARK-SCHEME
  WHITE ×2: grit + hashicorp ship the ink their own SVGs declare under
  `@media (prefers-color-scheme: dark)` (first stylesheet-declared colors;
  gamemaker's mask-icon link was the markup precedent; grit's lift
  alternative measured + named). LIFT ×1: fauna #3A1AB6 1.77:1 → #D3C9F7
  (the mark's only ink meets the backdrop; deep indigo becomes lavender —
  headline ask). RIDERS: flatbuffers 17-bubble exhaust dropped, gulp straw
  dropped + TWO-CUT MIX (geometry from the white cut, hex from the 8KB
  color cut), handlebars 3-of-6 layers to the byte cap (faintest icon in
  the set — ask), groovy script-off-the-star (A02's extraction ×3).
  COLLAPSES 27, each with receipts; headline declines: idris trio — own
  frond vectored by the project at 0.00/0.14/0.56 px / 6.2% coverage,
  worse at the quartile than fossil + harbour, vsicons' per-variant badges
  fail with it; DEPARTS from the expected family, overturn path + family
  declaration ready in flag 38 — grunt (4 vectors: 19,955B/47 layers …
  simple-icons 0.16/0.38/0.44 — byte cap AND L5), harbour (real 1,258B
  vector at 0.09/0.34/0.50), haml, graphviz (87-layer scene), and the
  consistent WORDMARK line: glsl=OpenGL (t2) → hlsl=DirectX 3.03:1,
  hip=AMD 4.19:1, informix=IBM 2.49:1 (t3, all via the company-mark
  rider, all measured in A03-t3-declines); icl (vsicons cropped a company
  AVATAR — koala), ink (INKY's rendered app icon, not ink's raster-only
  logotype). IDENTIFICATIONS: `.hypr` = KIBO COMMERCE not Hyprland —
  upstream PR's own words + Kibo's raster's 3 hexes match vsicons' trace
  to the digit (flag 39; Hyprland's blades fetched + set aside for any
  future hyprland concept); fbx = the only vector anywhere, authorship
  uncorroborated (weakest ID, flag 3); hy = Cuddles the cuddlefish
  (hylang's own header/favicon; the "(hy)" logotype 0.31px declined).
  PLATES: fortran 2.91:1 + gatsby 2.21:1 (t1) + infopath 2.15:1 +
  innosetup 1.43:1 (t3) all ship faithful-dark UNLIFTED (field = mark
  -interior ink; no brand frame exists) — ONE ruling asked for all four;
  innosetup's navy is the ratified offset-1 chrome on a 10-stop ramp, the
  #66C1F0 alternative rendered beside it (flag 42). KIN-WITHOUT-BASE
  ledger with named arrival points: flutter-package (flutter → A09 +
  folder F03), fsproj (fsharp → core-tier.json, rank 61, claims .fsproj
  itself), graphqls (graphql → core tier rank 68), jest-snapshot (jest →
  core tier); jbuilder resolved into the ruby family instead. RECORD-FIX
  round pre-gate (session-directed; A02 sheet-defect precedent): t1's
  flag + prose and t2's graphqls flag corrected from the false "in no
  slice's roster" claim to the verified arrival facts; 168 icon+master
  SVGs proven byte-identical through the fix (aggregate 2860b754…),
  three-state reach proof (t1 comment edit reaches zero outputs; t2 flag
  reaches manifest/sheet only). LOOK-ALIKE +2: gatsby↔duckdb 0.986 +
  glimmer↔duckdb 0.986 (duck head's 3rd + 4th pairings; why only
  non-plates pair with it documented in-module); ionic 0.461 max +
  innosetup glyph-scored 0.085–0.149 needed NO declaration (measured).
  GATES GREEN both my re-runs and every agent run: check 0 fail / 26
  advisory (13 subjects >2KB, all D22-priced, cap-legal), roster 84/84
  modules 3/3, pilot+A01+A02 FROZEN pass, 16px 63 pass + 21 marginal
  (every marginal carries an honest note), twins 0/0 with 66 family +
  2217 collapse + 5 look-alike declared, letters 0. 50 flags, 6 studies
  (A03-t1-study, firebase-product-study, A03-t2-study,
  godot-family-study, A03-t3-declines, A03-t3-choices). Sheet →
  https://claude.ai/code/artifact/e27e42f2-e104-4b13-a62e-87546a188ee4
  (`slices/A03/sheet.html`, own URL per slice; republish = same path from
  this session or pass the URL). NOTHING COMMITTED: slice outputs +
  3 tranche modules + registry + ~47 new sources-svg files untracked;
  commit rides the gate verdict (add-by-path, umbrella only, no pin;
  peer-session root files `implemented*.md` + `.playwright-cli/` + the
  live `vscode` pointer excluded — M16 peer session live this whole
  session, its board/Tasks § M16 records ride the shared tree per
  precedent). GATE ASKS (chat summary of 2026-09-04): (1) four dim plate
  fields, one ruling; (2) fauna's lavender lift; (3) fastlane +
  handlebars ship-marginal-vs-collapse; (4) idris trio collapse vs
  family; (5) hypr=Kibo confirm; (6) innosetup navy vs bright; rest
  as built (framed pair, white pair, gulp mix, family duplicates
  .hcl/.sentinel + .jbuilder/.erb, fritzing stroke-decline rule, fbx,
  flash .swc overlap with A01's frozen adobe-swc — flags 1–50 on the
  sheet).
- [ ] Assembly: cross-set twin audit (R7/R8 thresholds), reconciliation, theme build —
  associations untouched, iconPaths only
- [ ] Integration (the ONLY fork touch): one packaging commit swapping the SVG trees
  in `extensions/theme-vsebcode-icons` + pin bump; acceptance = M11 runbook (compile
  + markers, dev boot, packaged virgin boot, spot checks incl. `.editorconfig` and
  folder differentiation at tree size)

Resume cold: read the style guide (§5 incl. the A01-ratified laws = THE LAW) and
the slice A01 arc above. STATE 2026-09-03: **SLICE A01 CLOSED** — approved +
committed (84/84: 54 branded / 30 neutral incl. 20 generic-code); sheet artifact
8a69846a… (republish = same `slices/A01/sheet.html` path from its session, or
pass the URL). Ruled law now in the guide, binding A02+: D22 license amendment
(fidelity-only sourcing; provenance still records license verbatim),
company-mark-on-format rider, families (a/b/recolour modes), neutral collapse,
look-alike lane, lift trigger contrast<3.0:1, dotnet-CC0 note for
csharp/fsharp/vb. STATE NOW: **SLICE A02 CLOSED** — approved + committed
(84/84: 61 branded incl. the framed-ColdFusion fix round / 23 neutral;
the A02 item above carries the full arc: outcomes, verdict, fix round,
tool follow-ups, the sheet URL — artifact 4460a259…, republish = same
`slices/A02/sheet.html` path from its session, or pass the URL). Ruled
law now in the guide, binding A03+: §5 erratum 3 framed-plate
construction (frame carries the silhouette; interior field never
lifted; brand's framed cut > sibling-corroborated ratios; thickening
inside the brand's spec form). STATE NOW: **SLICE A03 BUILT 2026-09-04 —
SEBASTIAN GATE PENDING** (the A03 item above carries the full arc:
outcomes, families, declines, identifications, the record-fix round, the
gate asks; sheet artifact e27e42f2… — republish = same
`slices/A03/sheet.html` path from its session, or pass the URL; gates
green 84/84, nothing committed). ON THE VERDICT: fold ruled errata into
the guide if any; append 'A03' to `tools/targets.mjs` APPROVED (one line,
order-bearing); commit add-by-path — board.md Tasks.md style-guide.md(if
errata) tools/slices/A03*.mjs slices/A03/ sources-svg/(new files) —
umbrella only, no pin; EXCLUDE the live `vscode` pointer, peer root files
`implemented*.md`, `.playwright-cli/` (M16 peer session's board/Tasks
§ M16 records ride the doc fold per shared-tree precedent). NEXT SESSION
after that = slice A04 (worklist slices[3]) through the same contract:
registry `tools/slices/A04.mjs` (copy A03.mjs's shape — its PREAMBLE-null
comment is the pre-ruling template), ~3 tranches, gate via
`cd m20-icons-v2 && node tools/gates.mjs A04` (pilot + A01 + A02 + A03
then all frozen), NEW sheet artifact per slice, Sebastian gate, commit on
verdict. Tranche-brief gotchas that BIND future tranches/slices: FAMILIES
same-name clobber (later module unions earlier members), studies.mjs
one-path-per-part winding, pathkit bbox control-point hull (probe fits
before trusting; A02.t3 de-Casteljau precedent), gates.mjs sheet-crash
gap (verify sheet mtime after every run), future families owed when the
base concept arrives (ruby→erb+jbuilder [family OPEN at erb/A02 since
A03], elixir→eex, css→cssmap, cypress→cypress-spec,
dart→dartlang-generated, latex open at doctex/A02, flutter→
flutter-package at A09+F03, and at the CORE build: fsharp→fsproj,
graphql→graphqls, jest→jest-snapshot — core-tier.json carries
fsharp(61)/graphql(68)/jest/ruby; a future hyprland concept takes the
blades, NOT hypr's Kibo mark). Slices A04–A12 + F01–F06 + a core-batch
slice follow the same rhythm; then assembly (cross-set audits,
reconciliation, theme build) → the single integration swap commit in
`extensions/theme-vsebcode-icons` + pin bump (M11 runbook acceptance).
