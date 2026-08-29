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
  `npm i` before the next watch/build.
- `[vscodium]` import commits bypass hooks (`--no-verify`): vscode's husky hygiene rejects
  VSCodium's placeholder strings. Keep hooks ON for our own commits.

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
- [ ] Screenshot checkpoint: **delivered 2026-08-29** (full screen + lights zoom sent in
  chat; throwaway instance cleaned up) — **base-look verdict pending from Sebastian**.
  Next session: on pass → Phase B; on adjust → targeted fix commit first. To relaunch a
  checkpoint instance: `vscode/.claude/skills/launch/scripts/launch.sh` from `vscode/`
  (prints JSON with pid/ports; kill pid + rm runDir when done). `out/` is compiled at
  `0773be2`; devtools carve-out check: Help menu → Toggle Developer Tools → that window
  should keep the normal macOS title bar

Phase B — only after the base look is approved:

- [ ] Workbench root transparent (`.monaco-workbench.mac:not(.web)`) with editor/statusbar/
  panel pinned opaque; per-part translucent hexes stay user-side
- [ ] Statusbar drag region (`.statusbar` drag / `.statusbar-item` no-drag, macOS-scoped)
- [ ] Screenshot checkpoint → **Acceptance**: Sebastian's visual pass on the dev instance
  and a packaged app

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

Post-sweep tail (surfaced 2026-08-29, pending approval — M7 otherwise closed):

- [ ] `scripts/chat-simulation/**` orphaned Copilot-Chat perf harness (+ `perf:chat*` npm
  scripts, 5 `.eslint-allowed-javascript-files` entries, `.github/skills/chat-perf/`) —
  NOT a clean delete: `test/smoke/src/utils.ts:129` imports its mock-llm-server
- [ ] Dangling doc links to the deleted copilot-instructions.md (`AGENTS.md:5`,
  `agentHost/node/claude/phase13-plan.md:135`) and the stale dir name in the
  pr-linux-test musl step comment
- [ ] `vscode/.claude/CLAUDE.md` is now a dangling symlink (its target was
  `.github/copilot-instructions.md`, deleted in the sweep) — remove the symlink, or land
  our own agent guidelines there

## M2 — Workbench layout in source (kills `zoom-css-vars.js`)

Port the `custom-ui-style.stylesheet` block from Settings/settings.json piece by piece;
delete each piece from settings as it lands.

- [ ] 46pt bar: tab-row height and sidebar-header height as real layout constants
- [ ] Sidebar header as view switcher (activityBar top) at 46pt: traffic-light left inset,
  centered 34×28 pills, 20px glyphs, badge pinned top-right, indicator off
- [ ] Traffic-light inset computed from the zoom factor in TS (`getZoomFactor`)
- [ ] Tabs: the −1px optical text nudge (text container only)
- [ ] Breadcrumbs: 25px row, background on the full-width wrapper, hairline ending the active
  tab at the bar
- [ ] Drag regions into part CSS (`activitybar`, statusbar, banner holes) — keep the
  inert-native-strip caveat as a comment
- [ ] No-sidebar / fullscreen / banner variants
- [ ] **Acceptance**: `custom-ui-style.stylesheet` block fully empty; layout correct at
  zoom 0 / ±1 / ±2

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
