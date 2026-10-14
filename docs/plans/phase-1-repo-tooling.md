# Phase 1: repo tooling and product.json endpoints

Executable plan for the first removal phase of the VSebCode fork. It is written for a fresh Claude Code session: read `CLAUDE.md` first, then this file, then work top to bottom. Every item was verified against the tree on 2026-10-14 (commit `373d0d95edf` and its parent); re-check a path with `git ls-files <path>` or `grep` before acting on it, because upstream merges move things.

## Ground rules

- One surface per commit, mechanical deletions separate from edits to surviving code (see "How to work in this fork" in `CLAUDE.md`). Suggested commit boundaries are the numbered sections below.
- Items marked **ask** are maintainer decisions. Ask before acting on them; do not assume. Everything else is already decided.
- Nothing in `src/vs` is deleted in this phase. The only `src` edit allowed is in `src/vs/base/common/product.ts`, and only if a `product.json` change needs it.
- Validation after each section that touched the named inputs:
  - `build/**` or `scripts/**` edited: `cd build && npm run typecheck`, then `npm run eslint -- <changed .ts files>`.
  - `src/vs/base/common/product.ts` edited: `npm run typecheck-client`.
  - `product.json` edited: `node -e "require('./product.json')"` for syntax, then `./scripts/code.sh` once at the end of the phase to confirm the editor starts (this compiles if `out/` is missing and takes several minutes).
  - `package.json` or `build/npm/*` edited: `npm install` once at the end of the phase, so the lock file and the edited postinstall are exercised.
  - Any file with a copyright header: `npm run precommit -- <files>`.

## 1. The rest of `.github` and the agent-harness links

What is left in `.github` after the CI removal (102 files): `copilot-instructions.md`, `instructions/` (10 Microsoft- or AI-specific guides), `skills/` (69 files), `agents/`, `hooks/`, `learnings/`, `commands/`, `commands.json`, `classifier.json`, `CODEOWNERS`, `CODENOTIFY`, `ISSUE_TEMPLATE/`, `pull_request_template.md`, `endgame/`, `codeql/`, `insiders.yml`, `sandbox.yml`, `similarity.yml`.

1. `git rm -r .github`. The vendor-neutral guides were already moved to `docs/guidelines`; nothing else is worth keeping.
2. `build/npm/postinstall.ts`: delete the block that creates `.claude/CLAUDE.md` and `.claude/skills` symlinks (search for `ensureAgentHarnessLink`; remove the function and its two call sites). Without this, `npm install` throws once `.github/copilot-instructions.md` is gone.
3. `.agents/`: `git rm -r .agents` (only the `launch` skill, which seeds a Copilot-authenticated profile). Remove the matching `.gitignore` lines (`.agents/...`, `.github/...`, `.v[0-9]*/`, `.agent-validation/`). Keep the `.claude/` ignore line.
4. `package.json`: remove the `perf:css` script (it runs `.github/skills/auto-perf-optimize/scripts/workbench-css-performance.mts`). **Ask** whether the maintainer wants that CSS performance script kept under `scripts/` instead; default is delete.
5. `.eslint-allowed-javascript-files`: remove the `.github/skills/heap-snapshot-analysis/...` line.
6. `.vscode/settings.json`: remove the `// --- Chat ---` block at the top (`inlineChat.affordance`, `chat.tools.terminal.autoApprove`, `chat.editing.explainChanges.enabled`) and the `chat.agentSkillsLocations` entry near the bottom.
7. `AGENTS.md` currently points at `.github/copilot-instructions.md`. **Ask**: rewrite it as a two-line pointer to `CLAUDE.md` (recommended, since other agent tools read `AGENTS.md`) or delete it.
8. Cloud sandbox plumbing (the Copilot coding-agent environment hook): `.github/hooks/cloud-sandbox.json` goes with step 1, so also remove `build/npm/cloudSandbox.ts`, `build/npm/cloudSandboxSetup.ts`, `build/lib/test/cloudSandbox.test.ts`, and the calls into them from `build/npm/preinstall.ts`, `build/npm/postinstall.ts` and `build/npm/fast-install.ts` (`isCloudSandbox`, `prepareCloudSandbox`, `finishCloudSandbox`, `raiseCloudSandboxFileLimit`). Keep this as its own commit.
9. Local, uncommitted: the `.claude/CLAUDE.md` and `.claude/skills` symlinks on the maintainer's machine now dangle; delete them (`rm .claude/CLAUDE.md .claude/skills`). `.claude/` is gitignored, so this is not part of the commit.

## 2. Microsoft build pipelines and compliance config

1. `git rm -r build/azure-pipelines` (151 files) and `.config/` (1ES pipeline templates, Guardian config, `configuration.winget`).
2. `build/filters.ts`: remove the two `!build/azure-pipelines/**` patterns.
3. `build/gulpfile.vscode.win32.ts`: `signWin32Path` points at `build/azure-pipelines/common/sign-win32.ts`, which drives Microsoft's ESRP signing service. Remove the signing step and the constant; the fork cannot use ESRP.
4. Delete the tests that only exercise pipeline modules: `build/lib/test/testCheckpoint.test.ts`, `build/lib/test/testCheckpointTemplates.test.ts`, `build/lib/test/captureDarwinMemory.test.ts`. Re-check with `grep -rl azure-pipelines build/lib/test`.
5. `.mention-bot` and `.lsifrc.json` (Microsoft PR bot and LSIF indexing config): delete.
6. Component governance. Keep every `cgmanifest.json`: the root one is imported by `build/linux/debian/calculate-deps.ts`, the two under `src/vs/base` by the Monaco task in `build/gulpfile.editor.ts`, and the rest are inert. Delete `cglicenses.json`, `.vscode/cglicenses.schema.json`, the schema mapping for it in `.vscode/settings.json`, `build/lib/builtInExtensionsCG.ts` and the `download-builtin-extensions-cg` script. `ThirdPartyNotices.txt` stays; it was generated by the deleted pipeline and is now maintained by hand.
7. `.vscode/notebooks/*.github-issues` (ten issue-triage notebooks that query `microsoft/vscode`): delete. Keep `.vscode/searches`.

## 3. Dev container

1. `git rm -r .devcontainer`.
2. `package.json`: drop the `@devcontainers/cli` devDependency; `build/gulpfile.vscode.ts`: drop the `**/@devcontainers/cli/**` exclusion pattern.
3. `README.md`: remove the "Development Container" section now so the README does not describe a deleted folder. The rest of the README is rewritten in the branding phase.

## 4. Private distro and feed plumbing

1. `package.json`: remove the `distro` field and the `update-distro`, `setup-feed` and `reauth-feed` scripts; delete `build/npm/update-distro.ts`.
2. The `.build/distro/npm` handling in `build/npm/dirs.ts`, `build/lib/dependencies.ts` and `build/npm/postinstall.ts` (including the `.gitconfig-distro` mount) only exists for Microsoft's private overlay repository. Remove it.
3. Leave `.npmrc` alone (`ms_build_id` and the Electron headers URL are needed to build native modules), and leave `nodejsArtifactFeed` / `electronArtifactFeed` in `product.json` as empty strings: `build/lib/electron.ts` and `build/gulpfile.reh.ts` read them and an empty value means the public downloads.

## 5. `product.json` endpoints and Copilot fields

Interface: `IProductConfiguration` in `src/vs/base/common/product.ts`. Remove values only; the interface fields whose consumers live in AI code (`voiceWsUrl`, `agentsTelemetryAppName`, `sessionsWindowAllowedExtensions`, `defaultChatAgent`) are deleted together with those consumers in later phases.

1. Remove the keys `voiceWsUrl` (Microsoft voice endpoint), `webviewContentExternalBaseUrlTemplate` (vscode-cdn.net; the environment service falls back to the local webview origin), `agentsTelemetryAppName`, `trustedExtensionAuthAccess` (silent GitHub-auth access for Copilot Chat) and `sessionsWindowAllowedExtensions`.
2. Set `builtInExtensionsEnabledWithAutoUpdates` to `[]` (the field is non-optional).
3. Leave `defaultChatAgent` in place: it is a non-optional field with 46 consumers in the chat code, which phase 4 deletes. Removing it now only creates throwaway null checks.
4. **Ask** before retargeting the repository URLs `licenseUrl`, `serverLicenseUrl` and `reportIssueUrl` from `microsoft/vscode` to this fork. It is a one-line change each and the issue URL in particular sends users to the wrong tracker today.
5. **Ask** before adding the gallery. The maintainer chose the Microsoft Marketplace (see `CLAUDE.md`). The type requires `serviceUrl`, `controlUrl`, `extensionUrlTemplate`, `resourceUrlTemplate` and `nlsBaseUrl`. The values Microsoft's own builds use are, to the best of this session's knowledge, `https://marketplace.visualstudio.com/_apis/public/gallery`, `https://main.vscode-cdn.net/extensions/marketplace.json`, `https://www.vscode-unpkg.net/_gallery/{publisher}/{name}/latest`, `https://{publisher}.vscode-unpkg.net/{publisher}/{name}/{version}/{path}` and `https://www.vscode-unpkg.net/_lp/`. Verify them against a real installation's `product.json` before committing (macOS: `/Applications/Visual Studio Code.app/Contents/Resources/app/product.json`; Linux: `/usr/share/code/resources/app/product.json`; Windows: `%LOCALAPPDATA%\Programs\Microsoft VS Code\resources\app\product.json`). No installation was present on the maintainer's machine when this plan was written. Two consequences to mention when asking: `build/lib/builtInExtensions.ts` switches from GitHub releases to the gallery for the `builtInExtensions` downloads once `serviceUrl` is set, and extension signature verification (`src/vs/platform/extensionManagement/node/extensionSignatureVerificationService.ts`) should be checked for how it behaves without the signing package, which is not in `package.json`.

## 6. Editor workspace recommendations

`.vscode/extensions.json`: keep `dbaeumer.vscode-eslint` and `connor4312.esbuild-problem-matchers`; remove `github.vscode-pull-request-github`, `ms-vscode.vscode-github-issue-notebooks`, `typescriptteam.native-preview` and `ms-vscode.ts-customized-language-service`. **Ask** about `ms-vscode.extension-test-runner`: Microsoft-published, but it is the only way to run extension tests from the editor UI.

`.vscode/tasks.json` and `.vscode/launch.json` keep their Copilot and agents-window entries until phase 2 removes the things they launch.

## 7. Close the phase

1. Update `CLAUDE.md`: the Status section (what phase 1 removed, the new HEAD), the sentence in "Commands" that says `npm install` creates `.claude` symlinks, the "Microsoft/Copilot repo tooling" paragraph of the removal map, and mark phase 1 done in the removal plan.
2. Run the full validation list from "Ground rules" one more time, including `npm install` and `./scripts/code.sh`.
3. If there is time, draft `docs/plans/phase-2-ai-packages.md` from the "AI stack" part of the removal map, following the structure of this file. Phase 2 also owns `.mcp.json` (drop the `vscode-automation-mcp` entry together with `test/mcp`; keep `component-explorer`), `scripts/mock-policy-server`, and the Copilot entries in `.vscode/tasks.json` and `.vscode/launch.json`.

## Out of scope for this phase

Anything under `src/vs` (except the one interface file above), `extensions/copilot`, `src/vs/sessions`, `test/mcp`, `scripts/chat-simulation`, telemetry, accounts, branding (names, icons, `README.md`, `CONTRIBUTING.md`, `SECURITY.md`), and the copyright-header policy, which is still an open decision in `CLAUDE.md`.
