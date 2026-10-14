# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

VSebCode is a fork of `microsoft/vscode` ("Code - OSS") whose purpose is to remove everything Microsoft-specific and everything AI-specific from the editor, guided by VSCodium's patch set plus our own analysis. Upstream's engineering conventions still apply to the code that remains; the fork-specific rules below say what gets removed, how, and what is still undecided.

Maintainer rule: when it is unclear whether something counts as "Microsoft" or "AI", or how far a removal should go, ask the maintainer and propose options. Do not assume.

### Decisions already made (2026-10-14)

| Topic | Decision |
|---|---|
| Scope | Remove all four groups: the built-in AI stack including the `vscode.chat` / `vscode.lm` extension APIs; Microsoft online services (telemetry, experiments, surveys, update checks, Settings Sync, Cloud Changes, tunnels); the Microsoft/GitHub account providers and the `github` extension; Microsoft/Copilot repo tooling (`.github`, Azure Pipelines, 1ES config, agent-host build tooling). |
| Keep | Open-source Microsoft tooling the build needs: TypeScript, Electron, `@vscode/ripgrep`, the `ms-vscode.js-debug*` built-ins listed in `product.json`, the `git` extension, the generic `authentication` services. |
| Upstream tracking | Commits directly on `main`. Periodically merge upstream release tags (never upstream `main`) from an `upstream` remote. |
| Extension gallery | Microsoft Marketplace, chosen by the maintainer knowing that its terms of use are limited to Microsoft products. |
| Product identity | VSebCode: `nameShort` / `nameLong` `VSebCode`, `applicationName` `vsebcode`, `dataFolderName` `.vsebcode`, own URL protocol, bundle identifier and Windows GUIDs. |

### Status

Source code is still untouched: `main` is upstream commit `2b0c23ebbd8` (version 1.143.0-dev, 2026-10-13) plus the repository changes listed here. The `upstream` remote exists and fetches only `main`, `release/*` and tags (latest release tag at the time of writing: 1.141.1). Done so far (two commits on `main`): the upstream CI workflows, composite actions and Dependabot config were removed from `.github`, together with the build-script test that read the workflow files; the vendor-neutral engineering notes were moved from `.github/instructions` and the design-philosophy skill to `docs/guidelines/`. Next: execute `docs/plans/phase-1-repo-tooling.md` in a fresh session. Update this section as surfaces are removed so later sessions do not re-discover the state.

## Commands

Node must match the major version in `.nvmrc` (24.x); `build/npm/preinstall.ts` refuses otherwise. `npm install` also installs the nested packages (`build/`, `remote/`, `extensions/`, `extensions/copilot`, `test/*`), downloads the `builtInExtensions` from `product.json`, and creates the gitignored symlinks `.claude/CLAUDE.md` -> `.github/copilot-instructions.md` and `.claude/skills` -> `.agents/skills`. This root file is the committed one.

| Task | Command |
|---|---|
| Install or refresh dependencies | `npm install` (first time), `npm run install-fast` (skips up-to-date installs) |
| Download Electron (version pinned in `.npmrc`) | `npm run electron`; `scripts/code.sh` and `scripts/test.sh` do it on demand |
| Client build with type-check | `npm run compile-client` |
| Incremental client build, no type-check | `npm run build-fast -- --client-only` (`--force` rebuilds everything; state lives in `.build/build-fast/state.json`) |
| Client + built-in extensions | `npm run build-fast`, or `npm run gulp compile-extensions` for the extensions alone |
| Watch | `npm run watch-client`, or the daemon pair `npm run watch-clientd` / `npm run kill-watch-clientd` |
| Type-check only | `npm run typecheck-client`; `cd build && npm run typecheck` for the build tooling |
| Run from sources | `./scripts/code.sh [folder]` (downloads Electron, compiles if `out/` is missing, fetches built-ins); `./scripts/code-cli.sh`, `./scripts/code-web.sh`, `./scripts/code-server.sh` |
| Lint | `npm run eslint -- <files>` (cached by content), `npm run stylelint` |
| Hygiene (copyright header, tabs, formatting) | `npm run precommit -- <files>`; with no files it checks the git index; `npm run hygiene` checks the whole repo |
| Layering | `npm run valid-layers-check`, whenever imports cross layers or folders are deleted |
| Other checks | `npm run check-cyclic-dependencies` (needs `out/`), `npm run vscode-dts-compile-check`, `npm run monaco-compile-check`, `npm run define-class-fields-check` |

`npm run compile` and `npm run watch` also build the vendored Copilot extension (`compile-copilot`, `watch-copilot`); use the client-only variants until that lane is removed. Git hooks are not installed (`husky` is disabled in `package.json`), so run eslint and hygiene yourself before committing. Commit signing is enabled in this checkout: never bypass it and never use `--no-verify`.

### Tests

Unit tests run against the compiled output in `out/`, so build first. The Electron runner is the reference environment; tests live in `src/vs/**/test/<environment>/` mirroring the folder of the code under test.

```bash
./scripts/test.sh                                                  # all unit tests (Electron)
./scripts/test.sh src/vs/editor/test/common/model.test.ts          # one file (a bare path means --run)
./scripts/test.sh --run <file> --grep "test title"                 # filter by Mocha title
./scripts/test.sh --runGlob "**/editor/test/**/*.test.js"          # by glob over out/
./scripts/test.sh --dev                                            # Electron window with dev tools
npm run test-node -- --run src/vs/base/test/common/async.test.ts   # Node runner (common and node layers)
npm run test-browser -- --browser chromium                         # Playwright runner (common and browser layers)
./scripts/test-integration.sh --run <file>                         # API/integration tests; also --grep <pattern>, --suite git
npm run smoketest                                                  # UI smoke tests in test/smoke
```

Use `ensureNoDisposablesAreLeakedInTestSuite()`, call `sinon.restore()` in `teardown`, prefer one `assert.deepStrictEqual` snapshot over many assertions, and never stub globals: make the dependency injectable and pass a fake.

## Architecture

### Layers and target environments

`src/vs` is ordered `base` -> `platform` -> `editor` -> `workbench` -> `code` (Electron main process and CLI) and `server` (remote extension host), plus `sessions`, the agent sessions window, which sits above `workbench`. A layer may only import from layers below it. Inside each layer, folder names fix the runtime: `common` (plain JS), `browser` (DOM), `node`, `electron-browser` (renderer with Electron IPC), `electron-utility`, `electron-main`. Both rules are enforced by the `local/code-import-patterns` ESLint rule configured in `eslint.config.js` and by `npm run valid-layers-check`; `src/vs/sessions/LAYERS.md` documents the sessions-specific rules.

### Only entry points load code

The workbench loads exactly what its entry files import: `src/vs/workbench/workbench.common.main.ts`, `workbench.desktop.main.ts`, `workbench.web.main.ts`, and `src/vs/sessions/sessions.*.main.ts` for the agents window. A feature is a folder under `src/vs/workbench/contrib/<name>` with one `*.contribution.ts` entry point that registers services (`registerSingleton`) and workbench contributions (`src/vs/workbench/common/contributions.ts`) and is imported from one of those main files. Removing a feature therefore starts at the entry file: drop the import, delete the folder, fix what no longer compiles. Services are consumed only through constructor injection (`@IFooService`), and other contributions may use a feature only through its single `common` API file, never its internals.

### Extension API

`src/vscode-dts/vscode.d.ts` is the stable API and `vscode.proposed.<name>.d.ts` the proposals; `src/vs/platform/extensions/common/extensionsApiProposals.ts` is generated from those file names by `build/lib/apiProposalNames.ts`, so never edit it by hand. Every API area is a pair: `src/vs/workbench/api/common/extHost<X>.ts` in the extension host and `src/vs/workbench/api/browser/mainThread<X>.ts` in the renderer, connected through `extHost.protocol.ts`. Built-in extensions opt into proposals with `enabledApiProposals` in their `package.json`. Removing an API means removing the d.ts, both halves of the pair, the protocol entries and every `enabledApiProposals` reference, then running `npm run vscode-dts-compile-check`.

### product.json

`product.json` carries the product identity and every service endpoint; its shape is `IProductConfiguration` in `src/vs/base/common/product.ts`, so adding or removing a field means updating that interface. A gitignored `product.overrides.json` next to it is merged at startup by `src/bootstrap-meta.ts` and is the place for local experiments. `build/lib/builtInExtensions.ts` downloads the `builtInExtensions` list from GitHub releases, or from the gallery once `extensionsGallery.serviceUrl` is set.

### Built-in extensions and the vendored Copilot extension

`extensions/*` are compiled by gulp (`build/gulpfile.extensions.ts`, esbuild for webviews). `extensions/copilot` is different: it is the GitHub Copilot Chat extension vendored into the tree (publisher `GitHub`, 4193 tracked files), built by its own `npm run compile`, and pinned to a runtime through the `copilotRuntimeVersion` field of the root `package.json`, which `build/gulpfile.vscode.ts` validates against `@github/copilot-sdk` when the gulpfile loads. That check runs for every gulp task, so the dependency, the field and the check must be removed together.

### Build system

Gulp (`build/gulpfile*.ts`, invoked as `npm run gulp <task>`) orchestrates compilation, extensions, packaging (`gulpfile.vscode.{win32,linux}.ts`, `build/{win32,linux,darwin}`, `resources/`) and hygiene. The TypeScript transpile and bundle steps are esbuild in `build/next` (`build-fast`, `transpile`, `bundle`; working notes in `docs/guidelines/build-next.md`). Build scripts are TypeScript run directly by `node`, so they need no compile step. `cli/` is the Rust `code` CLI (tunnels and server launcher) and `remote/` holds the dependency manifests of the server build.

## Engineering notes

Upstream's topic guides live in `docs/guidelines/` (moved from `.github/instructions`; their `applyTo` frontmatter still states which files each guide covers). Read the matching guide before editing: `coding-guidelines.md`, `source-code-organization.md` and `best-practices.md` for any change under `src/vs`; `writing-tests.md` for tests; `disposable.md` and `observables.md` for lifecycle and reactive code; `tree-widgets.md` for list and tree UI; `design-philosophy.md`, `design-philosophy-reference.md`, `design-tokens.md` and `css-best-practices.md` for CSS and visual work; `accessibility.md` for ARIA and screen-reader support; `notebook.md` and `interactive.md` for those contribs; `build-next.md` for `build/next`; `oss-license-review.md` for `ThirdPartyNotices.txt`; `committing.md` for commits.

## Removal map

Everything below is still present. Use it to locate the surfaces for a removal and to know what else breaks. Counts are non-test `.ts` files at the time of writing.

### AI stack

- Core: `src/vs/workbench/contrib/chat` (1352 files) is imported by 365 files outside it: all of `src/vs/sessions` (198), `terminalContrib` (35), `mcp` (20), `browserView` (17), `agentsVoice` (16), `workbench/api` (22), `inlineChat` (10), `notebook` (9), and a long tail in `scm`, `search`, `extensions`, `debug`, `codeEditor`, `tasks`, `canvases`, `accessibility`, `welcome*`, `update`, `testing`, `quickaccess`, `markers`, `issue`, `authentication`. Remove dependents first, the core last.
- Agents window: `src/vs/sessions` (908 files, entry points `sessions.*.main.ts`), opened by the `--agents` CLI flag in `src/vs/platform/environment/node/argv.ts`, plus `scripts/code-sessions-web.*` and `build/vite/mobile-multi-diff*.ts`.
- Platform and services: `src/vs/platform/{agentHost,agentPlugins,chat,copilotConnectors,mcp,customizationMarketplace,otel}`, `src/vs/workbench/services/{agentHost,agentEditorComments,aiRelatedInformation,chat,mcp}`.
- Contribs: `inlineChat`, `mcp`, `agentsVoice`, `speech`, `remoteCodingAgents`, `welcomeAgentSessions`, `canvases`, `editTelemetry/browser/telemetry/aiEditTelemetry`, `notebook/browser/{contrib,controller,view/cellParts}/chat`, `terminalContrib/{chat,chatAgentTools,voice}`.
- Extension API: the `chat` and `lm` namespaces of `vscode.d.ts`, 33 `vscode.proposed.*.d.ts` files, and the `extHost` / `mainThread` pairs for `ChatAgents2`, `ChatCodeMapper`, `ChatContext`, `ChatDebug`, `ChatInputNotification`, `ChatOutputRenderer`, `ChatQuota`, `ChatSessions`, `ChatStatus`, `LanguageModels`, `LanguageModelTools`, `Mcp`, `Embeddings` / `EmbeddingVector`, `AiRelatedInformation`, `AgentEditorComments`.
- Extensions: `extensions/copilot`, `extensions/prompt-basics`, and the `git.addAICoAuthor` setting in `extensions/git/package.json`.
- Build and script wiring: `package.json` scripts `compile-copilot`, `watch-copilot*`, `copilot:*`, `codex:*`, `agent-host:*`, `test-agent-host-e2e*`, `perf:chat*`; dependencies `@github/copilot-sdk`, `@vscode/copilot-api`, `@anthropic-ai/sdk`, `@anthropic-ai/claude-agent-sdk`; `build/lib/copilot.ts`, `build/{agentHost,agent-sdk,codex,dictation-runtime}`, `build/copilot-migrate-pr.ts`, the Copilot lane in `build/next/build-fast.ts`; the "Copilot - Build", "Run Agents" and "Launch MCP Server" tasks in `.vscode/tasks.json`; `test/mcp`, `test/integration/agentHost`, `scripts/chat-simulation`, `scripts/code-agent-host.*`, `scripts/sync-agent-host-protocol.ts`.
- `product.json`: `defaultChatAgent` (not optional in `IProductConfiguration`), `trustedExtensionAuthAccess`, `builtInExtensionsEnabledWithAutoUpdates`, `sessionsWindowAllowedExtensions`, `agentsTelemetryAppName`, `voiceWsUrl`, plus the `agentSdks`, `copilotVersions`, `dictationRuntime` and `mcpGallery` interface fields.
- Long tail: 143 more files mention Copilot outside those folders, mostly `terminalContrib`, `workbench/api`, `platform/{mcp,github,policy,telemetry,otel}`, `services/accounts`, `contrib/issue`, `browser/actions`, `editor/contrib/inlineCompletions`. `grep -rli copilot src/vs` is the checklist.

### Microsoft online services

- Telemetry: `ITelemetryService` is injected in 674 files, so keep the interface and bind `NullTelemetryService` from `src/vs/platform/telemetry/common/telemetryUtils.ts` instead of deleting it. Remove the senders: `src/vs/platform/telemetry/{common,browser,node}/1dsAppender.ts`, `customEndpointTelemetryService` (node and `electron-browser`), their wiring in `src/vs/code/electron-utility/sharedProcess/sharedProcessMain.ts`, `src/vs/code/node/cliProcessMain.ts`, `src/vs/server/node/serverServices.ts` and `src/vs/workbench/services/telemetry`; the contribs `telemetry`, `editTelemetry`, `bracketPairColorizer2Telemetry`, `terminalContrib/telemetry`, `tags` (hashes git remotes for telemetry), `debug/node/telemetryApp.ts`, `services/policies/browser/policyTelemetry.contribution.ts`; dependencies `@microsoft/1ds-core-js`, `@microsoft/1ds-post-js`, `@vscode/telemetry-extractor`; the `mixin-telemetry-docs` script. Thirteen built-in extensions carry an `aiKey` and depend on `@vscode/extension-telemetry`: `git`, `github`, `github-authentication`, `microsoft-authentication`, `typescript-language-features`, `html-`, `json-` and `markdown-language-features`, `markdown-math`, `mermaid-markdown-features`, `media-preview`, `merge-conflict`, `simple-browser`.
- Experiments: `src/vs/platform/assignment`, `src/vs/workbench/services/assignment` (31 importers), the `tas-client` dependency, `tasConfig` in `product.json`.
- Surveys: `src/vs/workbench/contrib/surveys`, the `npsSurveyUrl` and `surveys` fields.
- Updates: `src/vs/platform/update`, `src/vs/workbench/contrib/update`, driven by `updateUrl` (unset in OSS builds).
- Settings Sync and Cloud Changes: `src/vs/platform/userDataSync`, `src/vs/workbench/services/userDataSync`, `contrib/userDataSync` (registered in all three workbench entry files), `contrib/editSessions`.
- Tunnels: `src/vs/platform/{remoteTunnel,tunnel}`, `src/vs/workbench/services/tunnel`, `contrib/remoteTunnel`, `extensions/tunnel-forwarding`, the `@microsoft/dev-tunnels-*` dependencies, and the tunnel subcommands of `cli/`.
- Endpoints in `product.json`: `webviewContentExternalBaseUrlTemplate` (vscode-cdn.net) and `voiceWsUrl`.

### Microsoft/GitHub accounts

`extensions/{microsoft-authentication,github-authentication,github}`, `src/vs/platform/github`, `src/vs/workbench/services/{github,accounts}`, and `trustedExtensionAuthAccess` in `product.json`. The generic `src/vs/workbench/services/authentication` and `contrib/authentication` stay: they are the API every auth provider extension uses.

### Microsoft/Copilot repo tooling

`.github/` (what remains: `copilot-instructions.md`, the Microsoft- and AI-specific `instructions/*.md`, skills, agents, hooks, learnings, commands; the workflows and Dependabot config are already removed), `AGENTS.md`, `build/azure-pipelines`, `.config/{1espt,guardian}`, `.devcontainer`, `.agents/skills/launch`, `.mcp.json`, the `distro` field of `package.json` with `update-distro`, `setup-feed` / `reauth-feed`, the `perf:css` script (it runs a file under `.github/skills`), and the `.vscode/extensions.json` recommendations. `build/npm/postinstall.ts` creates the `.claude/*` symlinks and throws when `.github/copilot-instructions.md` is missing, so remove that block in the same change that removes the file. The vendor-neutral engineering notes already live in `docs/guidelines/`; nothing else in `.github/instructions` is worth keeping.

### Branding

The identity fields of `product.json` (`nameShort`, `nameLong`, `applicationName`, `dataFolderName`, `serverApplicationName`, `serverDataFolderName`, `tunnelApplicationName`, `urlProtocol`, `win32*`, `darwinBundleIdentifier`, `darwinProfile*UUID`, `linuxDesktopName`, `linuxIconName`, `licenseUrl`, `reportIssueUrl`); icons and packaging templates in `resources/{darwin,win32,linux}` (`code.icns`, `code.ico`, `code.png`, `*.desktop`, `code.appdata.xml`, `debian/`, `rpm/`, `snap/`), `build/win32/code.iss`, `resources/server`; `README.md`, `CONTRIBUTING.md`, `SECURITY.md`. Windows GUIDs and the macOS bundle identifier must be newly generated, not edited. The Microsoft copyright line in `LICENSE.txt` and the header on upstream source files are MIT obligations and stay.

## Removal plan (adopted 2026-10-14)

Work through the groups in this order. Each phase must leave `npm run compile-client` and the checks green before the next one starts. Phase plans live in `docs/plans/`; write the next one at the end of each phase.

1. Repo tooling and `product.json` endpoints: the rest of `.github`, `AGENTS.md`, `build/azure-pipelines`, `.config`, `.devcontainer`, `.agents`, the `distro` and feed scripts, the postinstall symlink block, and the Microsoft endpoints and Copilot values of `product.json`. Cheap, and equivalent to what VSCodium does. Step-by-step plan: `docs/plans/phase-1-repo-tooling.md`.
2. Self-contained AI packages: `extensions/copilot` with its build lane and dependencies, `src/vs/sessions` with the `--agents` window and its scripts, the agent-host platform and services, `test/mcp` with the `vscode-automation-mcp` entry of `.mcp.json`, `test/integration/agentHost`, `scripts/chat-simulation`, `scripts/mock-policy-server`, and the Copilot entries of `.vscode/tasks.json` and `.vscode/launch.json`.
3. Microsoft services: bind `NullTelemetryService`, delete the 1DS appenders and endpoint services, the telemetry contribs, the assignment service and `tas-client`, and the extensions' `aiKey` / `@vscode/extension-telemetry`; then surveys, update, Settings Sync, Cloud Changes, tunnels, and the account extensions.
4. Chat core and extension API: `contrib/chat` with every dependent in the removal map, the `chat` / `lm` namespaces, their proposals and `extHost` / `mainThread` pairs, and the long tail found by `grep -rli copilot src/vs`.
5. Branding, once the product no longer references Microsoft services.

## How to work in this fork

- One surface per commit, and keep the mechanical part (deleted folders, dropped imports) separate from the adaptation part (edits to surviving code). This keeps upstream merges reviewable.
- Removal order for a workbench feature: entry-file import -> contribution folder -> dependents reported by `npm run typecheck-client` -> `eslint.config.js` import-pattern entries that name the deleted folder -> `npm run valid-layers-check` -> hygiene -> targeted tests. Delete whole folders rather than leaving dead code or feature flags.
- Keep `package.json`, `package-lock.json`, `extensions/package.json` and `remote/package.json` consistent when dropping dependencies; run `npm install` afterwards instead of editing lock files.
- Syncing with upstream: the `upstream` remote fetches only `main`, `release/*` and tags. Run `git fetch upstream --tags`, then `git merge <release-tag>`. Upstream `main` moves daily and most of its churn is in the removed areas. Conflicts inside deleted folders are resolved by deleting again; afterwards re-run the checks above and update the Status section.
- Upstream conventions still apply to surviving code: tabs; PascalCase types and enum values, camelCase functions and properties, whole words in names; JSDoc on exported functions, classes, interfaces and enums; user-facing strings through `nls.localize` with `{0}` placeholders and double quotes, single quotes everywhere else; title-style capitalization for command labels, buttons and menu items; arrow functions, braces on every block, `export function` at top level; no `any` or `unknown` unless unavoidable; register every disposable (`DisposableStore`, `MutableDisposable`, `DisposableMap`) and return disposables from methods that are called repeatedly; service dependencies only through constructor injection, never through `IInstantiationService` later; `IEditorService` to open editors; `IHoverService` for tooltips; correlated file watchers from `fileService.createWatcher`; never read or write another component's storage keys; every source file keeps the Microsoft copyright header until the header policy below is decided.
- Markdown: do not hard-wrap prose; one paragraph per source line.

## Open decisions (ask before acting)

- Copyright header for fork-authored or heavily modified files. `npm run precommit` currently requires the exact Microsoft header (`copyrightHeaderLines` in `build/hygiene.ts`). Suggested: accept both headers in hygiene, keep the Microsoft header on upstream files, use a VSebCode header on new files.
- Where "AI" stops at the editor level: `editor/contrib/inlineCompletions` and the `InlineCompletionItemProvider` API are generic ghost-text infrastructure also used by non-AI providers; `browserView` (the integrated browser) is used by agents but is also a user feature.
- Updates: disable `contrib/update` entirely, or point `updateUrl` at a fork-owned release feed.
- `cli/`: keep the Rust CLI without the tunnel subcommands, or drop it. Likewise whether the server build (`src/vs/server`, `remote/`) and the web build stay.
- Gallery details: the exact `extensionsGallery` values (`serviceUrl`, `controlUrl`, `extensionUrlTemplate`, `resourceUrlTemplate`, `nlsBaseUrl`), `linkProtectionTrustedDomains`, and whether extension signature verification stays.
- Branding assets: the source of new icons, and the `code-oss` -> `vsebcode` rename of the launcher scripts in `resources/*/bin`.
