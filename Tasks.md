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
- [ ] `npm run gulp vscode-darwin-arm64` packages `Code - OSS.app`; boots with an isolated,
  short-path `--user-data-dir` *(Sebastian)*
- [ ] Hands-on acceptance: open a project, run an integrated-terminal task, edit + save.
  (No marketplace in vanilla `product.json` — extension installs arrive with M4/D3.)

## M1 — Window patches (redo) — scope TBD

Previous attempt rolled back 2026-08-28 after manual review. Re-brief with Sebastian before
any work: what to keep or change versus the old approach (hiddenInset + traffic lights at
{18,16}, `under-window` vibrancy, splash-repaint guard, statusbar drag region). Work lands as
commits on `vsebcode`.

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
