# Phase 2: self-contained AI packages

Executable plan for the second removal phase of the VSebCode fork. It is written for a fresh Claude Code session: read `CLAUDE.md` first, then this file, then work top to bottom. Every path and count was verified against the tree at the end of phase 1 (2026-10-14); re-check with `git ls-files <path>` or `git grep` before acting, because upstream merges move things.

## Scope correction (ask first)

The adopted plan in `CLAUDE.md` lists "the agent-host platform and services" in this phase. That does not work in this order: `src/vs/platform/agentHost` (2861 files, 719 of them the e2e tests under `test/node/e2e`) and `src/vs/workbench/services/agentHost` (21 files) are imported by 310 files in `src/vs/workbench/contrib/chat`, by the three workbench entry files, by `src/vs/code/electron-main/app.ts`, the shared process, `src/vs/server/node/{serverServices,serverAgentHostManager,agentHostChannel}.ts`, and by `mcp`, `terminalContrib`, `terminal`, `canvases`, `inlineChat` and `editTelemetry`. Removing them before the chat core means editing the chat core twice.

**Ask** the maintainer to confirm the proposal: move the agent host, together with everything that only exists for it, to phase 4 (with `contrib/chat`), and keep in this phase only the packages with no importers under `src/vs`. The items that move with the agent host are: the root and `remote/package.json` dependencies `@github/copilot-sdk`, `@vscode/copilot-api`, `@anthropic-ai/sdk`, `@devcontainers/cli` (spawned by `src/vs/platform/agentHost/node/devContainerAgentHostService.ts`) and `@modelcontextprotocol/sdk`; the `copilotRuntimeVersion` field of `package.json` with `build/lib/copilot.ts` (+ test) and the check in `build/gulpfile.vscode.ts` (lines 48-50 and 202-203, which also inject `copilotVersions` into the shipped `product.json`); `build/{agentHost,agent-sdk,codex,dictation-runtime}` with the `codex:*` and `agent-host:*` scripts (`build/agent-sdk/checkNativeOptionalDeps.ts` was moved there in phase 1 for this reason); `build/lib/{agentHostDependencies,dictationRuntime}.ts` and their tests; `foundry-local-sdk` and the loader patch at the end of `build/npm/postinstall.ts` (consumed by `src/vs/platform/localTranscription`); the `@github/copilot*` globs in `build/darwin/{create-universal-app,verify-macho}.ts` and `build/.moduleignore`; the ESLint rule `.eslint-plugin-local/code-no-private-agent-host-meta-import.ts`; the `agentHost` entries of `.vscode/settings.json` (`files.readonlyInclude`) and `.gitignore` (`!/src/vs/platform/agentHost/test/node/e2e/coverage/`); and the launch configurations "Attach to Agent Host Process", "VS Code Agent Host" and "Renderer and Agent Host processes".

Everything below assumes that answer. If the maintainer prefers to keep the original order, the agent host becomes a section of its own that must be executed together with the chat core.

## Ground rules

- One surface per commit, mechanical deletions separate from edits to surviving code (see "How to work in this fork" in `CLAUDE.md`). The numbered sections below are the suggested commit boundaries; split a section into a mechanical and an adaptation commit when it has both.
- Items marked **ask** are maintainer decisions. Ask before acting on them; do not assume.
- Validation after each section that touched the named inputs:
  - anything under `src/`: `npm run typecheck-client`, then `npm run valid-layers-check` (folders were deleted), `npm run eslint -- <changed .ts files>`, and the unit tests next to the adapted code (`./scripts/test.sh --run <file>` or `npm run test-node -- --run <file>`).
  - `build/**`, `scripts/**` or `eslint.config.js`: `cd build && npm run typecheck && npm run test` (one pre-existing failure in `build/next/test/resources.test.ts` on macOS: a `/private/var` versus `/var` temp-path mismatch; anything else is new), then `npm run eslint -- <changed files>`.
  - `package.json`, `build/npm/dirs.ts` or `.vscode-test.js`: `npm run install-fast -- --force` once at the end of the phase, so the lock files and the install scripts are exercised; the tree must stay clean afterwards.
  - Any file with a copyright header: `npm run precommit -- <files>`.
  - End of phase: `npm run compile-client`, `./scripts/code.sh` (starts the editor), and `./scripts/code.sh --agents` must be rejected as an unknown option.

## 1. The vendored Copilot Chat extension

`extensions/copilot` (4193 tracked files, publisher `GitHub`) has no importer under `src/vs`; the mentions there are strings and comments in `platform/agentHost`, `platform/otel`, `contrib/agentsVoice` and `contrib/chat`, which later phases delete. Its own dependency tree lives in `extensions/copilot/package.json`, so nothing changes in the root `package.json` dependencies.

1. `git rm -r extensions/copilot`.
2. `package.json` scripts: `compile` becomes `npm run gulp compile` (drop the `npm-run-all2` pair with `compile-copilot`); `watch` and `watch-transpile` lose `watch-copilot`; delete `compile-copilot`, `watch-copilot`, `watch-copilotd`, `kill-watch-copilotd`, `copilot:setup` and `copilot:get_token`. Update the Commands table in `CLAUDE.md` accordingly (the "use the client-only variants" sentence becomes moot).
3. `build/npm/dirs.ts`: drop `'extensions/copilot'`.
4. `build/next/build-fast.ts`: remove the `copilot` lane (`COPILOT_BUILD_ARGS`, the `BuildLane` member, the snapshot and plan fields) and the matching cases in `build/next/test/build-fast.test.ts`; update `docs/guidelines/build-next.md` where it describes the lane.
5. `build/hygiene.ts`: remove the `engines.vscode` check that reads `extensions/copilot/package.json` (function near line 31 and the call near line 356).
6. `build/filters.ts`: remove the four `'!extensions/copilot/**'` exclusions; `build/lib/extensions.ts`: remove the Copilot special case (`grep -n copilot build/lib/extensions.ts`).
7. `build/copilot-migrate-pr.ts` (migrates pull requests from the Copilot Chat repository): delete.
8. `build/darwin/create-universal-app.ts` and `build/darwin/verify-macho.ts`: drop only the `**/extensions/copilot/**` globs; the `@github/copilot-sdk` globs belong to the agent host.
9. Lint and test config: the `extensions/copilot` entries of `.eslint-ignore`, `eslint.config.js`, `.eslint-allowed-javascript-files` (30 lines) and `.eslint-allowed-bracket-notation-files`; the fixture path in `.eslint-plugin-local/tests/code-no-sync-fs.test.ts`; the `copilot` entry of `.vscode-test.js`; `test/smoke/src/utils.ts` (check what it reads from the extension).
10. `.vscode/tasks.json`: "Copilot - Build" and "Kill Copilot - Build"; `.vscode/launch.json`: the configurations that build or load `extensions/copilot` (`grep -n copilot .vscode/launch.json`).

## 2. The agents window (`src/vs/sessions`)

`src/vs/sessions` (1057 files) has no `import` from outside the folder; `contrib/chat` mentions it only in comments and component fixtures. The main process opens it by URL, so the wiring below is what breaks.

1. `git rm -r src/vs/sessions`, then `src/vs/platform/windows/electron-main/agentsWindow.ts` and `src/vs/platform/windows/test/electron-main/agentsWindow.test.ts`.
2. Adapt the main process: `src/vs/platform/windows/electron-main/{windowImpl,windows,windowsMainService}.ts` (the `vs/sessions/electron-browser/sessions.html` URL and the agents-window branch), `src/vs/platform/window/common/window.ts` (+ `window.test.ts`), `src/vs/platform/native/common/native.ts` and `electron-main/nativeHostMainService.ts`, `src/vs/code/electron-main/app.ts`, `src/vs/code/test/electron-utility/sharedProcess/contrib/storageDataCleaner.test.ts`. Use `git grep -n -i "agentsWindow\|sessionsWindow" src/vs/platform src/vs/code` as the checklist.
3. CLI: remove the `agents` option (and the deprecated `sessions` alias it carries) from `src/vs/platform/environment/node/argv.ts` and the `agents` field from `src/vs/platform/environment/common/argv.ts`; `npm run typecheck-client` lists the readers.
4. Workbench leftovers that only served the window: `src/vs/workbench/contrib/agentsVoice/browser/agentsVoiceWindowService.ts` (check whether the file survives without the window or waits for the `agentsVoice` removal in phase 4), `src/vs/workbench/test/browser/componentFixtures/sessions/` and the sessions cases in `componentFixtures/fixtureUtils.ts`, the `vs/sessions` comments in `src/vs/workbench/contrib/modernUI/browser/media/{commandCenter,editorBorder}.css`.
5. Bundling: `build/gulpfile.vscode.ts` (the four `vs/sessions/...` entries near line 144 and `resources/win32/sessions.ico` near line 330), `build/next/index.ts` (`vs/sessions/sessions.desktop.main`, `vs/sessions/electron-browser/sessions`, `sessionsWebEntryPoint` and its special case near line 697), `build/next/resources.ts` (lines 29-30, 40-41, 77-79), `build/stylelint.ts` (the design-system scoping to `src/vs/sessions`), `build/lib/i18n.ts` with `build/lib/i18n.resources.json` and `build/lib/test/i18n.test.ts`.
6. Dev tunnels web bundle: `build/next/devTunnelsWeb.ts` writes into `vs/sessions/contrib/providers/remoteAgentHost/browser`. Delete it with `build/next/devTunnelsWebEntry.js`, `build/next/devTunnelsShims/`, the `bundle-dev-tunnels-web` script and the seven `build/next/devTunnels*` lines of `.eslint-allowed-javascript-files`.
7. Scripts and vite: `scripts/code-sessions-web.{js,sh}`, `build/vite/mobile-multi-diff.ts` and `build/vite/mobile-multi-diff-worker.ts` (check `build/vite/package.json` scripts and `build/vite/vite.config.*` for references).
8. Config: the sessions layer rules in `eslint.config.js` (`grep -n sessions eslint.config.js`), `src/tsec.exemptions.json` (two `vs/sessions/electron-browser/sessions.ts` entries), `test/unit/node/index.js` line 68, the `src/vs/sessions` lines of `.eslint-allowed-javascript-files` and `.eslint-allowed-bracket-notation-files`, the commented `src/vs/sessions/**` line in `.vscode/settings.json`.
9. Resources: `resources/win32/sessions.ico` and any other `sessions`/`agents` asset (`git ls-files resources | grep -i "sessions\|agents"`).
10. Tests: `test/smoke/src/areas/agentsWindow` (5 files), `test/automation/src/agentsWindow.ts` and its exports in `test/automation/src/{index,workbench}.ts`, the agents-window references in `test/smoke/src/main.ts`; the smoke areas `test/smoke/src/areas/chat/{chatModelConfig,chatSandbox}.test.ts` stay until phase 4 unless they only drive the agents window.
11. `.vscode/tasks.json`: "Run Agents" and "Build Fast & Run Agents"; `.vscode/launch.json`: "VS Code Agents" and "Launch VS Code Agents Internal".
12. `CLAUDE.md`: remove `sessions` from the layer list in "Architecture" and the `src/vs/sessions/LAYERS.md` reference.

## 3. Test harnesses and scripts

1. `test/mcp` (30 files) with the `vscode-automation-mcp` entry of `.mcp.json` (keep `component-explorer`) and the `'test/mcp'` entry of `build/npm/dirs.ts`; `.vscode/tasks.json` "Launch MCP Server".
2. `test/integration/agentHost` (4 files) with the `test-agent-host-e2e` and `test-agent-host-e2e-coverage` scripts and `build/lib/testAgentHostE2EStartup.test.ts`. The agent host's own e2e tests under `src/vs/platform/agentHost/test/node/e2e` go with the agent host.
3. `scripts/chat-simulation` (16 files) with the `perf:chat` and `perf:chat-leak` scripts, the `.chat-simulation-data` line of `.gitignore` and its five lines in `.eslint-allowed-javascript-files`.
4. `scripts/mock-policy-server` (6 files; mocks the Copilot managed-settings and policy endpoints) with the `mock-policy-server` script.
5. `scripts/code-agent-host.{js,sh}` and `scripts/sync-agent-host-protocol.ts` (developer launchers for the agent host process; removing them does not affect compilation) with their `.eslint-allowed-javascript-files` lines. **Ask** only if the maintainer wants to keep launching the agent host until phase 4.

## 4. `extensions/prompt-basics`

Six files providing language basics for `.prompt.md`, `.instructions.md`, `.agent.md` and `SKILL.md` files. No references outside the folder: `git rm -r extensions/prompt-basics`. `extensions/json/package.json` still associates `**/.github/hooks/*.json` with a schema for user workspaces; that is an extension feature, not repo tooling, and stays until phase 4 decides about the AI-specific JSON schemas.

## 5. Close the phase

1. Update `CLAUDE.md`: the Status section, the Commands table (`compile` and `watch` no longer build Copilot; `build-fast` has two lanes), the Architecture section (no `sessions` layer), the "AI stack" bullets of the removal map (what is gone, and the agent-host list from the scope correction above), and the removal plan.
2. Run the full validation list from "Ground rules", including `npm run install-fast -- --force`, `npm run compile-client` and `./scripts/code.sh`.
3. Draft `docs/plans/phase-3-microsoft-services.md` from the "Microsoft online services" and "Microsoft/GitHub accounts" parts of the removal map, following the structure of this file. Start with the telemetry inventory: `ITelemetryService` stays, `NullTelemetryService` is bound, the 1DS appenders and the thirteen extensions' `aiKey` go.

## Out of scope for this phase

`src/vs/platform/agentHost` and everything listed in the scope correction, `contrib/chat` and its dependents, the `chat` and `lm` extension APIs, `src/vs/platform/{agentPlugins,chat,copilotConnectors,mcp,customizationMarketplace,otel}`, `src/vs/workbench/services/{agentEditorComments,aiRelatedInformation,chat,mcp}`, the `inlineChat`, `mcp`, `agentsVoice`, `speech`, `remoteCodingAgents`, `welcomeAgentSessions` and `canvases` contribs, `defaultChatAgent` in `product.json`, telemetry, accounts and branding.
