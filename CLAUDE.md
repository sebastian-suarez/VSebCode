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
| Gallery values | Microsoft's own endpoints, set in `product.json` in phase 1 (`serviceUrl`, `itemUrl`, `publisherUrl`, `controlUrl`, `extensionUrlTemplate`, `resourceUrlTemplate`, `nlsBaseUrl`). |
| Extension signatures | Not verified. The verifier loads `@vscode/vsce-sign`, which is under Microsoft's proprietary vsce-sign license (use only with Microsoft products, no redistribution combined with other applications) and ships closed-source binaries, so it is not a dependency; `extensionSignatureVerificationService.ts` logs "Could not load vsce-sign module" once per install and proceeds. |
| Repository URLs | `licenseUrl`, `serverLicenseUrl` and `reportIssueUrl` point at `sebastian-suarez/VSebCode`. |
| Agent and editor files | `AGENTS.md` stays as a pointer to `CLAUDE.md`; the `ms-vscode.extension-test-runner` recommendation stays (open-source developer tooling). |

### Status

Source code under `src/` is still untouched: `main` is upstream commit `2b0c23ebbd8` (version 1.143.0-dev, 2026-10-13) plus the repository changes listed here. The `upstream` remote exists and fetches only `main`, `release/*` and tags (latest release tag at the time of writing: 1.141.1). Phase 1 (`docs/plans/phase-1-repo-tooling.md`) is complete as of 2026-10-14: `.github`, `.agents`, `.devcontainer`, `.config`, `build/azure-pipelines`, the cloud-sandbox install hooks, the private distro and Azure feed plumbing, the component-governance license overrides, the issue-triage notebooks and the Copilot workspace settings are gone; `AGENTS.md` points at this file; `product.json` lost the Microsoft endpoints and the Copilot auth and auto-update entries, points its license and issue URLs at this fork and configures the Microsoft Marketplace as `extensionsGallery`. The macOS entitlement plists now live in `build/darwin/entitlements`, and `build/agent-sdk/checkNativeOptionalDeps.ts` next to its only consumer. Validated at the end of the phase: `cd build && npm run typecheck` and `npm run test` (905 of 906 pass; the failure in `build/next/test/resources.test.ts` is a pre-existing macOS `/private/var` temp-path mismatch), `npm run compile-client`, `npm run install-fast -- --force` with a clean tree afterwards, and `./scripts/code.sh`, which downloaded the built-in extensions from the Marketplace with matching checksums and started the editor. Phase 2 (`docs/plans/phase-2-ai-packages.md`) was executed on 2026-10-14 with a reduced scope: `extensions/copilot` (the vendored Copilot Chat extension) is gone together with its npm scripts, its `build-fast` lane, its hygiene check, its gulp packaging tasks and the ripgrep-shim helpers of `build/lib/copilot.ts`; `extensions/prompt-basics`, `test/mcp` (with the `vscode-automation-mcp` entry of `.mcp.json`) and `scripts/mock-policy-server` are gone too. Three surfaces the plan assigned to the phase turned out to be coupled to the chat core and the agent host and were left in place pending the maintainer's confirmation (see "Open decisions"): the agents window (`src/vs/sessions` plus the awareness layer described in the removal map), the agent host, and the agent-host test harnesses. Validated at the end of the phase: `cd build && npm run typecheck` and `npm run test` (902 of 903 pass; the failure is the pre-existing `build/next/test/resources.test.ts` temp-path mismatch), `npm run install-fast -- --force` with a clean tree afterwards, `npm run compile-client`, and `./scripts/code.sh`, which synced the built-in extensions and started the editor without errors in the main or renderer logs. Next: execute `docs/plans/phase-3-microsoft-services.md` in a fresh session; it opens with the scope confirmations the maintainer has to give first. Update this section as surfaces are removed so later sessions do not re-discover the state.

## Commands

Node must match the major version in `.nvmrc` (24.x); `build/npm/preinstall.ts` refuses otherwise. `npm install` also installs the nested packages (`build/`, `remote/`, `extensions/`, `extensions/copilot`, `test/*`); the `builtInExtensions` of `product.json` are downloaded by `./scripts/code.sh` or `npm run download-builtin-extensions`, from the Marketplace now that `extensionsGallery` is set. When no dependency manifest changed, `npm install` returns early on a state hash; `npm run install-fast -- --force` runs the install scripts regardless.

| Task | Command |
|---|---|
| Install or refresh dependencies | `npm install` (first time), `npm run install-fast` (skips up-to-date installs) |
| Download Electron (version pinned in `.npmrc`) | `npm run electron`; `scripts/code.sh` and `scripts/test.sh` do it on demand |
| Client build with type-check | `npm run compile-client` |
| Incremental build, no type-check | `npm run build-fast` (two lanes, client and built-in extensions; `--client-only` skips the extensions, `--force` rebuilds everything; state lives in `.build/build-fast/state.json`) |
| Built-in extensions alone | `npm run gulp compile-extensions` |
| Watch | `npm run watch-client`, or the daemon pair `npm run watch-clientd` / `npm run kill-watch-clientd` |
| Type-check only | `npm run typecheck-client`; `cd build && npm run typecheck` for the build tooling |
| Run from sources | `./scripts/code.sh [folder]` (downloads Electron, compiles if `out/` is missing, fetches built-ins); `./scripts/code-cli.sh`, `./scripts/code-web.sh`, `./scripts/code-server.sh` |
| Lint | `npm run eslint -- <files>` (cached by content), `npm run stylelint` |
| Hygiene (copyright header, tabs, formatting) | `npm run precommit -- <files>`; with no files it checks the git index; `npm run hygiene` checks the whole repo |
| Layering | `npm run valid-layers-check`, whenever imports cross layers or folders are deleted |
| Other checks | `npm run check-cyclic-dependencies` (needs `out/`), `npm run vscode-dts-compile-check`, `npm run monaco-compile-check`, `npm run define-class-fields-check` |

`npm run compile` is the same as `compile-client`; `npm run watch` runs the client transpile, the client type-check and the extension watchers. Git hooks are not installed (`husky` is disabled in `package.json`), so run eslint and hygiene yourself before committing. Commit signing is enabled in this checkout: never bypass it and never use `--no-verify`.

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

`product.json` carries the product identity and every service endpoint; its shape is `IProductConfiguration` in `src/vs/base/common/product.ts`, so adding or removing a field means updating that interface. A gitignored `product.overrides.json` next to it is merged at startup by `src/bootstrap-meta.ts` and is the place for local experiments. `build/lib/builtInExtensions.ts` downloads the `builtInExtensions` list from the gallery (`extensionsGallery.serviceUrl` is set since phase 1), validated against the pinned `sha256`.

### Built-in extensions

`extensions/*` are compiled by gulp (`build/gulpfile.extensions.ts`, esbuild for webviews). The vendored Copilot Chat extension left in phase 2; what remains of its build support serves the agent host: the `copilotRuntimeVersion` field of the root `package.json`, which `build/gulpfile.vscode.ts` validates against `@github/copilot-sdk` when the gulpfile loads, and the `@github/copilot-sdk` packaging helpers of `build/lib/copilot.ts`. That check runs for every gulp task, so the dependency, the field and the check must be removed together.

### Build system

Gulp (`build/gulpfile*.ts`, invoked as `npm run gulp <task>`) orchestrates compilation, extensions, packaging (`gulpfile.vscode.{win32,linux}.ts`, `build/{win32,linux,darwin}`, `resources/`) and hygiene. The TypeScript transpile and bundle steps are esbuild in `build/next` (`build-fast`, `transpile`, `bundle`; working notes in `docs/guidelines/build-next.md`). Build scripts are TypeScript run directly by `node`, so they need no compile step. `cli/` is the Rust `code` CLI (tunnels and server launcher) and `remote/` holds the dependency manifests of the server build.

## Engineering notes

Upstream's topic guides live in `docs/guidelines/` (moved from `.github/instructions`; their `applyTo` frontmatter still states which files each guide covers). Read the matching guide before editing: `coding-guidelines.md`, `source-code-organization.md` and `best-practices.md` for any change under `src/vs`; `writing-tests.md` for tests; `disposable.md` and `observables.md` for lifecycle and reactive code; `tree-widgets.md` for list and tree UI; `design-philosophy.md`, `design-philosophy-reference.md`, `design-tokens.md` and `css-best-practices.md` for CSS and visual work; `accessibility.md` for ARIA and screen-reader support; `notebook.md` and `interactive.md` for those contribs; `build-next.md` for `build/next`; `oss-license-review.md` for `ThirdPartyNotices.txt`; `committing.md` for commits.

## Removal map

Everything below is still present unless a bullet says otherwise. Use it to locate the surfaces for a removal and to know what else breaks. Counts are non-test `.ts` files at the time of writing.

### AI stack

- Core: `src/vs/workbench/contrib/chat` (1352 files) is imported by 365 files outside it: all of `src/vs/sessions` (198), `terminalContrib` (35), `mcp` (20), `browserView` (17), `agentsVoice` (16), `workbench/api` (22), `inlineChat` (10), `notebook` (9), and a long tail in `scm`, `search`, `extensions`, `debug`, `codeEditor`, `tasks`, `canvases`, `accessibility`, `welcome*`, `update`, `testing`, `quickaccess`, `markers`, `issue`, `authentication`. Remove dependents first, the core last.
- Agents window: `src/vs/sessions` (1057 tracked files, entry points `sessions.*.main.ts`), opened by the `--agents` CLI flag in `src/vs/platform/environment/node/argv.ts`, plus `scripts/code-sessions-web.*`, `build/vite/mobile-multi-diff*.ts`, `build/next/devTunnelsWeb.ts` with its shims, `resources/win32/sessions.ico`, `test/smoke/src/areas/agentsWindow`, `test/automation/src/agentsWindow.ts`, and the sessions entries of `build/gulpfile.vscode.ts`, `build/next/{index,resources}.ts`, `build/stylelint.ts`, `build/lib/i18n*`, `eslint.config.js`, `src/tsec.exemptions.json` and `test/unit/node/index.js`. No file outside the folder imports it, but the window is not self-contained: the main process creates it (`platform/windows/electron-main/{agentsWindow,windowsMainService,windowImpl}.ts`, `platform/window/common/window.ts`, `platform/native/common/native.ts` with `electron-main/nativeHostMainService.ts`, `code/electron-main/app.ts`, `launchMainService.ts`, `onboardingTryoutHandoff.ts`, `workspacesHistoryMainService.ts`, the agents profile in `platform/userDataProfile`, `platform/chat/common/agentsWindowInvitation.ts`) and marks it with `isSessionsWindow` in the window configuration, from which a workbench-wide awareness layer derives: `IsSessionsWindowContext` (116 uses outside chat, 48 inside), `environmentService.isSessionsWindow` (about 60 and 90), the `agentsWindow` per-setting override of the configuration registry and settings editor, the `agentsWindow` extension capability with the `agentsWindowActivation` and `agentsWindowConfiguration` API proposals (enabled by the `git` and `npm` extensions), `IssueSource.AgentsWindow`, `product.sessionsWindowAllowedExtensions`, and the `openAgentsWindow` and invitation methods of `INativeHostService`. About 190 files outside the folder reference it, half of them in `contrib/chat`, so it leaves together with the chat core (phase 4, pending confirmation).
- Platform and services: `src/vs/platform/{agentHost,agentPlugins,chat,copilotConnectors,mcp,customizationMarketplace,otel}`, `src/vs/workbench/services/{agentHost,agentEditorComments,aiRelatedInformation,chat,mcp}`. `platform/agentHost` is imported by 310 files in `contrib/chat`, by the three workbench entry files, `code/electron-main/app.ts`, the shared process and `src/vs/server`, so it leaves together with the chat core (see the scope correction in `docs/plans/phase-2-ai-packages.md`).
- Contribs: `inlineChat`, `mcp`, `agentsVoice`, `speech`, `remoteCodingAgents`, `welcomeAgentSessions`, `canvases`, `editTelemetry/browser/telemetry/aiEditTelemetry`, `notebook/browser/{contrib,controller,view/cellParts}/chat`, `terminalContrib/{chat,chatAgentTools,voice}`.
- Extension API: the `chat` and `lm` namespaces of `vscode.d.ts`, 33 `vscode.proposed.*.d.ts` files, and the `extHost` / `mainThread` pairs for `ChatAgents2`, `ChatCodeMapper`, `ChatContext`, `ChatDebug`, `ChatInputNotification`, `ChatOutputRenderer`, `ChatQuota`, `ChatSessions`, `ChatStatus`, `LanguageModels`, `LanguageModelTools`, `Mcp`, `Embeddings` / `EmbeddingVector`, `AiRelatedInformation`, `AgentEditorComments`.
- Extensions: `extensions/copilot` and `extensions/prompt-basics` left in phase 2; the `git.addAICoAuthor` setting in `extensions/git/package.json` remains.
- Build and script wiring: `package.json` scripts `codex:*`, `agent-host:*`, `test-agent-host-e2e*`, `perf:chat*`; dependencies `@github/copilot-sdk`, `@vscode/copilot-api`, `@anthropic-ai/sdk`, `@anthropic-ai/claude-agent-sdk`, `@modelcontextprotocol/sdk`, `@devcontainers/cli` (spawned by the agent host's dev-container service) and `foundry-local-sdk` (used by `platform/localTranscription` and patched at the end of `build/npm/postinstall.ts`); `build/lib/copilot.ts` (now only the `@github/copilot-sdk` packaging helpers), `build/{agentHost,agent-sdk,codex,dictation-runtime}` (including `build/agent-sdk/checkNativeOptionalDeps.ts`, moved there in phase 1), the `@github/copilot*` globs of `build/.moduleignore` and `build/darwin/{create-universal-app,verify-macho}.ts`; the "Run Agents" task in `.vscode/tasks.json` and the agent-host and agents launch configurations; `test/integration/agentHost` (the runner of the agent host's e2e tests, invoked by `scripts/test-integration.sh` and tested by `build/lib/testAgentHostE2EStartup.test.ts`), `scripts/chat-simulation` (its `common/mock-llm-server.ts` is used by the agent host's test helpers and by `test/smoke/src/utils.ts`), `scripts/code-agent-host.*` (run by the "VS Code Agent Host" launch configuration) and `scripts/sync-agent-host-protocol.ts` (generates `platform/agentHost/common/state/protocol`). Phase 2 removed the Copilot extension scripts, `build/copilot-migrate-pr.ts`, the Copilot lane of `build/next/build-fast.ts`, the "Copilot - Build" and "Launch MCP Server" tasks, `test/mcp` and `scripts/mock-policy-server`.
- `product.json`: `defaultChatAgent` (not optional in `IProductConfiguration`) and the now empty `builtInExtensionsEnabledWithAutoUpdates`; in `src/vs/base/common/product.ts` the interface fields `trustedExtensionAuthAccess`, `sessionsWindowAllowedExtensions`, `agentsTelemetryAppName`, `voiceWsUrl`, `agentSdks`, `copilotVersions`, `dictationRuntime` and `mcpGallery` (their values left `product.json` in phase 1 or were never set in the OSS file).
- Long tail: 143 more files mention Copilot outside those folders, mostly `terminalContrib`, `workbench/api`, `platform/{mcp,github,policy,telemetry,otel}`, `services/accounts`, `contrib/issue`, `browser/actions`, `editor/contrib/inlineCompletions`. `grep -rli copilot src/vs` is the checklist.

### Microsoft online services

- Telemetry: `ITelemetryService` is injected in 674 files, so keep the interface and bind `NullTelemetryService` from `src/vs/platform/telemetry/common/telemetryUtils.ts` instead of deleting it. Remove the senders: `src/vs/platform/telemetry/{common,browser,node}/1dsAppender.ts`, `customEndpointTelemetryService` (node and `electron-browser`), their wiring in `src/vs/code/electron-utility/sharedProcess/sharedProcessMain.ts`, `src/vs/code/node/cliProcessMain.ts`, `src/vs/server/node/serverServices.ts` and `src/vs/workbench/services/telemetry`; the contribs `telemetry`, `editTelemetry`, `bracketPairColorizer2Telemetry`, `terminalContrib/telemetry`, `tags` (hashes git remotes for telemetry), `debug/node/telemetryApp.ts`, `services/policies/browser/policyTelemetry.contribution.ts`; dependencies `@microsoft/1ds-core-js`, `@microsoft/1ds-post-js`, `@vscode/telemetry-extractor`; the `mixin-telemetry-docs` script. Thirteen built-in extensions carry an `aiKey` and depend on `@vscode/extension-telemetry`: `git`, `github`, `github-authentication`, `microsoft-authentication`, `typescript-language-features`, `html-`, `json-` and `markdown-language-features`, `markdown-math`, `mermaid-markdown-features`, `media-preview`, `merge-conflict`, `simple-browser`.
- Experiments: `src/vs/platform/assignment`, `src/vs/workbench/services/assignment` (31 importers), the `tas-client` dependency, `tasConfig` in `product.json`.
- Surveys: `src/vs/workbench/contrib/surveys`, the `npsSurveyUrl` and `surveys` fields.
- Updates: `src/vs/platform/update`, `src/vs/workbench/contrib/update`, driven by `updateUrl` (unset in OSS builds).
- Settings Sync and Cloud Changes: `src/vs/platform/userDataSync`, `src/vs/workbench/services/userDataSync`, `contrib/userDataSync` (registered in all three workbench entry files), `contrib/editSessions`.
- Tunnels: `src/vs/platform/{remoteTunnel,tunnel}`, `src/vs/workbench/services/tunnel`, `contrib/remoteTunnel`, `extensions/tunnel-forwarding`, the `@microsoft/dev-tunnels-*` dependencies, and the tunnel subcommands of `cli/`.
- Endpoints: `product.json` carries no Microsoft endpoint any more (phase 1 removed `webviewContentExternalBaseUrlTemplate` and `voiceWsUrl`), but `src/vs/workbench/services/environment/browser/environmentService.ts` still falls back to a hardcoded `vscode-cdn.net` webview template in the web build.

### Microsoft/GitHub accounts

`extensions/{microsoft-authentication,github-authentication,github}`, `src/vs/platform/github` and `src/vs/workbench/services/{github,accounts}` (`trustedExtensionAuthAccess` left `product.json` in phase 1). The generic `src/vs/workbench/services/authentication` and `contrib/authentication` stay: they are the API every auth provider extension uses.

### Microsoft/Copilot repo tooling

Removed in phase 1, and `test/mcp` with the `vscode-automation-mcp` entry of `.mcp.json` in phase 2. What is left of the Copilot developer tooling (the agents entries of `.vscode/tasks.json` and the agent-host and agents entries of `.vscode/launch.json`) is tracked under the AI stack above.

### Branding

The identity fields of `product.json` (`nameShort`, `nameLong`, `applicationName`, `dataFolderName`, `serverApplicationName`, `serverDataFolderName`, `tunnelApplicationName`, `urlProtocol`, `win32*`, `darwinBundleIdentifier`, `darwinProfile*UUID`, `linuxDesktopName`, `linuxIconName`; `licenseUrl`, `serverLicenseUrl` and `reportIssueUrl` already point at this fork); icons and packaging templates in `resources/{darwin,win32,linux}` (`code.icns`, `code.ico`, `code.png`, `*.desktop`, `code.appdata.xml`, `debian/`, `rpm/`, `snap/`), `build/win32/code.iss`, `resources/server`; `README.md`, `CONTRIBUTING.md`, `SECURITY.md`. Windows GUIDs and the macOS bundle identifier must be newly generated, not edited. The Microsoft copyright line in `LICENSE.txt` and the header on upstream source files are MIT obligations and stay.

## Removal plan (adopted 2026-10-14)

Work through the groups in this order. Each phase must leave `npm run compile-client` and the checks green before the next one starts. Phase plans live in `docs/plans/`; write the next one at the end of each phase.

1. Done (2026-10-14). Repo tooling and `product.json` endpoints: the rest of `.github`, `AGENTS.md`, `build/azure-pipelines`, `.config`, `.devcontainer`, `.agents`, the `distro` and feed scripts, the postinstall symlink block, and the Microsoft endpoints and Copilot values of `product.json`. Cheap, and equivalent to what VSCodium does. Step-by-step plan: `docs/plans/phase-1-repo-tooling.md`.
2. Done (2026-10-14) with a reduced scope: `extensions/copilot` with its build lane, `extensions/prompt-basics`, `test/mcp` with the `vscode-automation-mcp` entry of `.mcp.json`, `scripts/mock-policy-server`, and the Copilot entries of `.vscode/tasks.json` and `.vscode/launch.json`. The agents window, the agent host and the agent-host test harnesses stayed because they are coupled to the chat core; see "Open decisions". Plan: `docs/plans/phase-2-ai-packages.md`.
3. Microsoft services: bind `NullTelemetryService`, delete the 1DS appenders and endpoint services, the telemetry contribs, the assignment service and `tas-client`, and the extensions' `aiKey` / `@vscode/extension-telemetry`; then surveys, update, Settings Sync, Cloud Changes, tunnels, and the account extensions. Plan: `docs/plans/phase-3-microsoft-services.md`.
4. Chat core and extension API: `contrib/chat` with every dependent in the removal map, the agents window and the agent host with their harnesses (once the two scope corrections are confirmed), the `chat` / `lm` namespaces, their proposals and `extHost` / `mainThread` pairs, and the long tail found by `grep -rli copilot src/vs`.
5. Branding, once the product no longer references Microsoft services.

## How to work in this fork

- One surface per commit, and keep the mechanical part (deleted folders, dropped imports) separate from the adaptation part (edits to surviving code). This keeps upstream merges reviewable.
- Removal order for a workbench feature: entry-file import -> contribution folder -> dependents reported by `npm run typecheck-client` -> `eslint.config.js` import-pattern entries that name the deleted folder -> `npm run valid-layers-check` -> hygiene -> targeted tests. Delete whole folders rather than leaving dead code or feature flags.
- Keep `package.json`, `package-lock.json`, `extensions/package.json` and `remote/package.json` consistent when dropping dependencies; run `npm install` afterwards instead of editing lock files.
- Syncing with upstream: the `upstream` remote fetches only `main`, `release/*` and tags. Run `git fetch upstream --tags`, then `git merge <release-tag>`. Upstream `main` moves daily and most of its churn is in the removed areas. Conflicts inside deleted folders are resolved by deleting again; afterwards re-run the checks above and update the Status section.
- Upstream conventions still apply to surviving code: tabs; PascalCase types and enum values, camelCase functions and properties, whole words in names; JSDoc on exported functions, classes, interfaces and enums; user-facing strings through `nls.localize` with `{0}` placeholders and double quotes, single quotes everywhere else; title-style capitalization for command labels, buttons and menu items; arrow functions, braces on every block, `export function` at top level; no `any` or `unknown` unless unavoidable; register every disposable (`DisposableStore`, `MutableDisposable`, `DisposableMap`) and return disposables from methods that are called repeatedly; service dependencies only through constructor injection, never through `IInstantiationService` later; `IEditorService` to open editors; `IHoverService` for tooltips; correlated file watchers from `fileService.createWatcher`; never read or write another component's storage keys; every source file keeps the Microsoft copyright header until the header policy below is decided.
- Markdown: do not hard-wrap prose; one paragraph per source line.

## Open decisions (ask before acting)

- Scope correction proposed by the phase 2 plan, not yet confirmed: move `src/vs/platform/agentHost`, `src/vs/workbench/services/agentHost` and everything that only exists for them (the list under "Scope correction" in `docs/plans/phase-2-ai-packages.md`) to phase 4, because 310 chat files import the agent host.
- Scope correction found while executing phase 2, not yet confirmed: move the agents window (`src/vs/sessions` and the awareness layer described in the removal map) and the agent-host test harnesses (`test/integration/agentHost`, `scripts/chat-simulation`, `scripts/code-agent-host.*`, `scripts/sync-agent-host-protocol.ts`) to phase 4 for the same reason. If the maintainer wants the window gone earlier, it is a step of its own (about 190 files outside the folder, half of them chat code that phase 4 deletes anyway), not part of phase 3.
- Copyright header for fork-authored or heavily modified files. `npm run precommit` currently requires the exact Microsoft header (`copyrightHeaderLines` in `build/hygiene.ts`). Suggested: accept both headers in hygiene, keep the Microsoft header on upstream files, use a VSebCode header on new files.
- Where "AI" stops at the editor level: `editor/contrib/inlineCompletions` and the `InlineCompletionItemProvider` API are generic ghost-text infrastructure also used by non-AI providers; `browserView` (the integrated browser) is used by agents but is also a user feature.
- Updates: disable `contrib/update` entirely, or point `updateUrl` at a fork-owned release feed.
- `cli/`: keep the Rust CLI without the tunnel subcommands, or drop it. Likewise whether the server build (`src/vs/server`, `remote/`) and the web build stay.
- `linkProtectionTrustedDomains`: unset in the OSS `product.json`; decide whether the Marketplace and GitHub domains should be trusted for outgoing links.
- Branding assets: the source of new icons, and the `code-oss` -> `vsebcode` rename of the launcher scripts in `resources/*/bin`.
