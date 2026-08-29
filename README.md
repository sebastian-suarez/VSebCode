# VSebCode

Personal macOS build of [VS Code](https://github.com/microsoft/vscode) with an Xcode-like UI
baked into the source — replacing a fragile injection stack (Custom UI Style + Vibrancy
extensions + JS shims) with real changes to the editor code.

Not affiliated with Microsoft or VSCodium. Personal project; upstream is MIT-licensed.

## Structure

```
VSebCode                 umbrella repo — docs + two pinned submodules
├── README.md  board.md  Tasks.md  CLAUDE.md
├── vscode/     → sebastian-suarez/vscode, fork of microsoft/vscode
│                 branch `vsebcode` (base 1.126.0, commit 7e7950df).
│                 ALL editor changes live here as normal commits.
└── vscodium/   → VSCodium/vscodium, read-only pin.
                  Never built from — used as a patch library whose
                  pieces are applied à la carte (telemetry off, etc.).
```

The umbrella's HEAD records the exact `(vscode, vscodium)` commit pair — that pair *is* the
definition of "VSebCode right now". Updating either is a deliberate, visible pin-bump commit.

## Getting started

```sh
git clone --recurse-submodules git@github.com:sebastian-suarez/VSebCode.git
cd VSebCode/vscode
git checkout vsebcode     # submodules check out detached; work happens on the branch
npm i                     # Node per .nvmrc (24.15); native modules need Xcode CLT
```

## Dev loop (two terminals, inside `vscode/`)

```sh
npm run watch        # T1: incremental compiler — leave running, wait for "Finished compilation"
./scripts/code.sh    # T2: launches the dev app ("Code - OSS dev"; first run downloads Electron)
```

- Renderer/workbench change → **Cmd+R** (Reload Window) in the dev app.
- Main-process change (e.g. `src/vs/platform/windows/electron-main/`) → relaunch `code.sh`.
- One-shot alternative to watch: `npm run compile`.

## Packaging a real .app

```sh
npm run gulp vscode-darwin-arm64       # → ../VSCode-darwin-arm64/Code - OSS.app  (umbrella root, gitignored)
npm run gulp vscode-darwin-arm64-min   # minified — what releases use; heavier compile (8 GB node heap)
```

Vanilla `product.json` ships with no extension gallery and "Code - OSS" branding — both are
scheduled to change in M4 (VSebCode rebrand + VS Code Marketplace; see [board.md](board.md)).

## Borrowing VSCodium patches

```sh
cd vscode
git apply ../vscodium/patches/00-telemetry-disable.patch   # then review + commit like any change
```

Caveat: if the copilot-removal patch is ever imported, full `npm run compile` breaks on
`compile-copilot` — use `npm run compile-client`, and launch with
`VSCODE_SKIP_PRELAUNCH=1 ./scripts/code.sh`.

## Making a change (the two-step commit)

1. Inside `vscode/`: edit → commit → **push** (`vsebcode` branch).
2. At the umbrella root: `git add vscode && git commit` (pin bump).

Forgetting step 1's push leaves the umbrella pointing at a commit GitHub doesn't have.

## Updating to a new VS Code release

1. `cd vscode && git fetch ms --tags` (`ms` = microsoft/vscode remote).
2. Pick the target: VSCodium's `upstream/stable.json` (in `vscodium/`) is the blessed stable pin.
3. `git rebase <new tag>` — conflicts are fixed in-tree with full context; then
   `git push --force-with-lease`.
4. Optionally bump the `vscodium/` pin to the matching release; pin-bump commit in the umbrella.
5. Rebuild and spot-check the churn-prone surfaces (titlebar, tabs, activity bar).

## Project docs

[board.md](board.md) — state, milestones, decisions (D#), risks. [Tasks.md](Tasks.md) —
per-milestone checklists and the command reference.
