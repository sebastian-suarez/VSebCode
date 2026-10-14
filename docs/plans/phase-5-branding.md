# Phase 5: Branding, Microsoft endpoints and the remaining decisions

Executable plan for the fifth removal phase of the VSebCode fork. It is written for a fresh Claude Code session: read `CLAUDE.md` first, then this file, then work top to bottom. The paths and counts come from the state at the end of phase 4 (2026-10-14); re-check with `git ls-files <path>` or `git grep` before acting, because upstream merges move things.

## Confirm first (ask)

- Product identity values. `CLAUDE.md` fixes `nameShort` / `nameLong` `VSebCode`, `applicationName` `vsebcode`, `dataFolderName` `.vsebcode`, an own URL protocol, bundle identifier and Windows GUIDs. **Ask** for the exact values of `urlProtocol` (suggest `vsebcode`), `darwinBundleIdentifier` (suggest `com.sebastiansuarez.vsebcode`), `linuxDesktopName`, `linuxIconName`, `serverApplicationName` / `serverDataFolderName` (suggest `vsebcode-server` / `.vsebcode-server`), `sharedDataFolderName`, `win32DirName`, `win32NameVersion`, `win32RegValueName`, `win32AppUserModelId`, `win32ShellNameShort` and `win32MutexName`. Windows GUIDs (`win32x64AppId`, `win32arm64AppId`, `win32x64UserAppId`, `win32arm64UserAppId`) and the macOS profile UUIDs (`darwinProfileUUID`, `darwinProfilePayloadUUID`) must be newly generated with `uuidgen`, never edited from Microsoft's values.
- Icons. **Ask** where the new icons come from: `resources/darwin/code.icns`, `resources/win32/code.ico` (plus the per-language file icons under `resources/win32/*.ico` and `resources/darwin/*.icns`, which are Microsoft's artwork), `resources/linux/code.png`, `src/vs/workbench/browser/media/code-icon.svg` and the letterpress SVGs under `src/vs/workbench/browser/parts/editor/media`. Until new artwork exists, keep the Code - OSS icons (MIT) and record it as a known gap.
- Launcher rename. `resources/darwin/bin/code.sh`, `resources/linux/bin/code.sh`, `resources/server/bin-dev/remote-cli/code.{sh,cmd}` and the `code` command installed by the packaging templates: **ask** whether the command becomes `vsebcode` (consistent with `applicationName`) or stays `code`.
- Documentation links. 367 non-test files under `src/vs` link to `aka.ms`, `code.visualstudio.com`, `*.microsoft.com`, `vscode.dev` or `github.com/microsoft/vscode` (112 in `workbench/contrib`, 53 in `workbench/services`, 30 in `workbench/browser`, 22 in `workbench/api`, the rest in `base`, `editor`, `platform`). Most are "Learn more" links in setting descriptions, walkthroughs and error messages. **Ask** which policy applies: keep links that document a feature the fork still ships (they point at the upstream manual), and remove only links to Microsoft products and services (Copilot, Marketplace terms, surveys, privacy statements). Removing all of them means rewriting hundreds of localized strings.
- `linkProtectionTrustedDomains`: unset in `product.json`; **ask** whether the Marketplace (`marketplace.visualstudio.com`, `*.vsassets.io`, `*.vscode-unpkg.net`) and `github.com` should be trusted for outgoing links.
- Copyright header. `npm run precommit` requires the exact Microsoft header (`copyrightHeaderLines` in `build/hygiene.ts`). **Ask** to confirm the suggestion from `CLAUDE.md`: accept both headers in hygiene, keep the Microsoft header on upstream files, use a VSebCode header on new files. Phase 4 added `build/lib/ripgrep.ts` and `src/vs/platform/policy/test/common/multiplexPolicyService.test.ts` (moved) under the Microsoft header.
- Updates. `platform/update` and `contrib/update` are idle without `updateUrl`. **Ask** whether to host a fork-owned release feed or delete the self-update stack.
- Server and web builds. `src/vs/server`, `remote/`, `src/vs/workbench/browser/web.main.ts`, `scripts/code-web.sh`, `scripts/code-server.sh`, `build/gulpfile.reh.ts`, `resources/server`: **ask** whether they stay (they still compile and the web server serves webviews from its own static route) or leave in this phase.

## Ground rules

- One surface per commit, mechanical renames separate from edits to surviving code (see "How to work in this fork" in `CLAUDE.md`).
- Items marked **ask** are maintainer decisions. Ask before acting on them; do not assume.
- Validation after each section: `npm run typecheck-client`, `npm run eslint -- <changed .ts files>`, `npm run precommit -- <files>`, `cd build && npm run typecheck && npm run test` for build changes, and the unit tests next to adapted code. End of phase: `npm run compile-client`, `./scripts/code.sh --user-data-dir .build/smoke-ud --extensions-dir .build/smoke-ext`, `npm run gulp compile-extensions`, and one packaged build per platform the maintainer targets (`npm run gulp vscode-darwin-arm64` or the matching task) to check the identity values in the bundle.

## 1. Product identity

- `product.json`: the identity fields listed under "Confirm first" (`nameShort`, `nameLong`, `applicationName`, `dataFolderName`, `sharedDataFolderName`, `serverApplicationName`, `serverDataFolderName`, `urlProtocol`, `win32*`, `darwinBundleIdentifier`, `darwinProfileUUID`, `darwinProfilePayloadUUID`, `linuxDesktopName`, `linuxIconName`). `IProductConfiguration` in `src/vs/base/common/product.ts` does not change.
- Everything that hard-codes `code-oss`, `Code - OSS`, `vscode-oss`, `CodeOSS` or `com.visualstudio.code.oss` outside `product.json`: `git grep -n -i "code-oss\|code - oss\|vscode-oss\|codeoss\|visualstudio.code" -- . ':!**/node_modules/**' ':!**/*.lock' ':!package-lock.json'` is the checklist (packaging templates, `build/win32/code.iss`, `resources/linux/*.desktop`, `resources/linux/code.appdata.xml`, the `.vscode/tasks.json` user data directories, the smoke test defaults in `test/smoke/src/main.ts` and `test/automation`).
- The user data directory and extensions directory defaults derive from `dataFolderName` at runtime; document the migration for existing `.vscode-oss` profiles in the README (none is performed by the product).

## 2. Packaging templates and icons

- macOS: `resources/darwin/code.icns`, the file-type icons, `build/darwin/entitlements`, and `build/lib/electron.ts`, which feeds `darwinExecutable` (`product.nameShort`), `darwinBundleIdentifier`, the application icon and the `urlSchemes` (`product.urlProtocol`) into the Electron packaging; the policy renderers in `build/lib/policies/{render,policyGenerator}.ts` also read `darwinBundleIdentifier` for the macOS profile.
- Windows: `resources/win32/code.ico` and the file-type icons, `build/win32/code.iss` with `build/win32/i18n/*.isl`, `build/gulpfile.vscode.win32.ts` (installer names, mutex, registry values, context menu CLSIDs under `win32ContextMenu` if the maintainer keeps the Explorer integration), `resources/win32/VisualElementsManifest.xml`.
- Linux: `resources/linux/code.png`, `code.desktop`, `code-url-handler.desktop`, `code-workspace.xml`, `code.appdata.xml`, `resources/linux/{debian,rpm,snap}`, `build/gulpfile.vscode.linux.ts`, `build/linux`.
- Server: `resources/server`, `build/gulpfile.reh.ts` (`serverApplicationName`, the `bin` helpers), if the server build stays.
- Workbench: `src/vs/workbench/browser/media/code-icon.svg`, the letterpress SVGs, the `product.nameLong` uses in the about dialog and the title bar (they read `product.json`, so no change beyond the values), the Windows `VisualElementsManifest.xml`.

## 3. Launcher scripts

- `resources/darwin/bin/code.sh`, `resources/linux/bin/code.sh`, `resources/server/bin-dev/*`, the PATH entry of `build/win32/code.iss`, the `@@NAME@@` substitutions of `build/gulpfile.vscode.linux.ts`, and the "Shell Command: Install 'code' command in PATH" action in `src/vs/workbench/electron-browser/actions/installActions.ts`, which reads `product.applicationName`.
- The development launchers `scripts/code.sh`, `scripts/code.bat`, `scripts/code-cli.sh` stay as they are.

## 4. Microsoft endpoints that survived phases 3 and 4

- `src/vs/workbench/contrib/webview/common/webview.ts`: `webviewResourceBaseHost = 'vscode-cdn.net'` is the nominal authority of webview resource URIs (never fetched). Rename it to a fork-owned authority; every webview `Content-Security-Policy` and the service worker in `src/vs/workbench/contrib/webview/browser/pre` derive from it, and `extensions/*` that construct `vscode-cdn.net` URIs by hand (`git grep -n "vscode-cdn.net" extensions src`) follow.
- `src/vs/base/common/oauth.ts` registers `code.visualstudio.com` and `vscode.dev` as the OAuth client metadata of the generic authentication flows (`client_uri`, `logo_uri`, the redirect URIs); point them at the fork's URL and protocol.
- `build/gulpfile.vscode.ts`: `sourceMappingURLBase` points at `https://main.vscode-cdn.net/sourcemaps/<commit>`; set it to a fork-owned location or drop the rewrite.
- `build/vite/workbench-vite.html` and `build/rspack/workbench-rspack.html` embed the Marketplace values of `product.json` for the dev servers (regenerated in phase 4); keep them in sync with `product.json` or generate them at build time.
- Keep: the Marketplace headers for `vsassets.io` in `platform/windows/electron-main/windowImpl.ts`, `vscode-unpkg.net` in the workbench CSP and `visualstudio.com` in `platform/extensionManagement/common/configRemotes.ts` (generic SaaS host list) serve the Marketplace, which stays by decision.

## 5. Documentation links and strings

- After the policy decision above: `git grep -n "aka.ms\|visualstudio.com\|microsoft.com\|vscode.dev\|github.com/microsoft/vscode" src/vs ':!**/test/**'` and the same over `extensions/*/package.json`, `extensions/*/package.nls.json` and `extensions/*/README.md`.
- Strings that name the product: `git grep -n "VS Code\|Visual Studio Code" src/vs extensions ':!**/test/**'` (localized strings should read the product name from `product.nameShort` / `nameLong` where upstream does not already do so; leave the literal name in comments and in the extension API documentation that describes the upstream behaviour).
- `README.md`, `CONTRIBUTING.md`, `SECURITY.md`, `AGENTS.md` (stays a pointer to `CLAUDE.md`), `.vscode/extensions.json`, `docs/guidelines/*.md` where they describe Microsoft processes (the issue triage, the endgame, the Azure pipelines).
- `LICENSE.txt` keeps the Microsoft copyright line and the MIT license; upstream source files keep their header (MIT obligation). `ThirdPartyNotices.txt` is regenerated after the dependency changes (`docs/guidelines/oss-license-review.md`).

## 6. Decisions deferred from earlier phases

- Updates: implement the release feed (`updateUrl`, the `update.mode` setting, a fork-owned feed format compatible with `platform/update`) or delete `platform/update` and `contrib/update` with the `update.*` settings.
- Server and web builds: delete `src/vs/server`, `remote/`, `src/vs/workbench/browser/web.main.ts` with `workbench.web.main.ts`, `scripts/code-web.*`, `scripts/code-server.*`, `build/gulpfile.reh.ts`, `build/gulpfile.vscode.web.ts`, `resources/server`, the `serverApplicationName` fields, and the remote extension host of `src/vs/workbench/api/node`, or keep them and brand them.
- Copyright header: the dual-header hygiene rule in `build/hygiene.ts` and the header on fork-authored files.
- `linkProtectionTrustedDomains`.

## 7. Close the phase

1. Update `CLAUDE.md`: the Status section, the "Branding" part of the removal map (which should become empty), the "Microsoft online services" endpoint notes, the open decisions, and the product identity row of "Decisions already made".
2. Run the full validation list from "Ground rules", including one packaged build.
3. Decide the next phase: upstream release-tag merge (`git fetch upstream --tags`, `git merge <tag>`), with the Status section as the checklist of surfaces to re-delete on conflict.

## Out of scope for this phase

The Marketplace (stays by decision), the extension signature verifier (not a dependency, by decision), and upstream features that merely mention Microsoft in comments.
