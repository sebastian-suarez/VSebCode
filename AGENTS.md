# AGENTS.md

Shared rules for every coding agent (Claude Code, Codex, Antigravity) working in this repository. `CLAUDE.md` imports this file and adds the project knowledge base: the decisions already made, the status of each removal phase, the architecture notes and the removal map. Read both before changing anything.

## What this repository is

VSebCode is a fork of `microsoft/vscode` (Code - OSS) that removes everything Microsoft-specific and everything AI-specific from the editor, guided by VSCodium's patch set plus our own analysis, and ships under its own brand (`nameShort` `VSebCode`, `applicationName` `vsc`, data folder `.vsebcode`). The only Microsoft service it keeps is the extension Marketplace. Upstream's engineering conventions apply to the code that remains. `main` tracks the latest upstream release tag, merged from the `upstream` remote with `npm run upstream-merge -- <tag>`, never upstream `main`.

## Ask, do not assume

When it is unclear whether something counts as "Microsoft" or "AI", how far a removal should go, or which of several approaches the maintainer wants, stop and ask, proposing concrete options with a recommendation. Items marked **ask** in `docs/plans/*.md` and the "Open decisions" of `CLAUDE.md` are maintainer decisions.

## Build and test

Node must match the major version in `.nvmrc` (24.x). From the repository root:

- Install: `npm install` the first time, `npm run install-fast` afterwards (`-- --force` reruns the install scripts). Lock files change only through `npm install`.
- Build: `npm run compile-client` (client with type-check), `npm run build-fast` (incremental, no type-check), `npm run gulp compile-extensions` (built-in extensions), `./scripts/code.sh --user-data-dir .build/smoke-ud --extensions-dir .build/smoke-ext` (run from sources).
- Checks: `npm run typecheck-client`, `npm run eslint -- <files>`, `npm run precommit -- <files>` (hygiene: header, tabs, formatting), `npm run valid-layers-check` after any import across layers or any folder deletion, `npm run vscode-dts-compile-check`, `npm run monaco-compile-check`, and `cd build && npm run typecheck && npm run test` for the build tooling.
- Tests run against `out/`, so build first: `./scripts/test.sh [file]` (Electron, the reference runner), `./scripts/test.sh --run <file> --grep "<title>"`, `npm run test-node -- --run <file>`, `npm run test-browser -- --browser chromium`, `./scripts/test-integration.sh --run <file>`, `npm run smoketest`.
- Tests live in `src/vs/**/test/<environment>/` mirroring the code under test. Use `ensureNoDisposablesAreLeakedInTestSuite()`, call `sinon.restore()` in `teardown`, prefer one `assert.deepStrictEqual` snapshot over many assertions, and never stub globals: make the dependency injectable and pass a fake.

## Off limits

- Generated files, never edited by hand: `src/vs/platform/extensions/common/extensionsApiProposals.ts` (built from the `src/vscode-dts` file names), `src/vs/monaco.d.ts`, `build/lib/policies/policyData.jsonc` (`npm run export-policy-data`) and every `package-lock.json`.
- Build outputs and local state: `out/`, `out-*/`, `.build/`, `node_modules/`, `product.overrides.json`.
- License obligations: the Microsoft copyright line in `LICENSE.txt` and the header of upstream source files stay. The copyright header has three accepted shapes, enforced by `build/hygiene.ts` and eslint: unmodified upstream files keep the Microsoft header, upstream files the fork modified carry the Microsoft line followed by `Copyright (c) Sebastian Suarez. All rights reserved.`, and files the fork authored carry the Sebastian Suarez line alone; `npm run fork-header -- upstream-base` applies it after an upstream merge (the branch `upstream-base` holds the upstream content `main` contains).
- The identity and gallery values of `product.json` and `IProductConfiguration` in `src/vs/base/common/product.ts` change only on a maintainer decision.
- Removed surfaces (the built-in AI and chat stack, telemetry senders, experiments, surveys, Settings Sync, Cloud Changes, tunnels, the Microsoft and GitHub account extensions, the self-update feed) are not reintroduced; `build/removed-surfaces.txt` lists them, hygiene fails when one exists, and upstream merge conflicts inside them are resolved by deleting again (`npm run upstream-merge -- <tag>` does it, see `CLAUDE.md`).
- Git: commit or push only when asked; never bypass commit signing or hooks (`--no-verify`); no AI-assistant attribution anywhere (no `Co-Authored-By` trailers, no "Generated with" footers, no AI accounts as collaborators or reviewers).

## How to change code

- One surface per commit; keep the mechanical part (deleted folders, dropped imports) separate from the adaptation part (edits to surviving code) so upstream merges stay reviewable. Delete whole folders rather than leaving dead code or feature flags.
- Removal order for a workbench feature: entry-file import -> contribution folder -> dependents reported by `npm run typecheck-client` -> `eslint.config.js` import-pattern entries that name the deleted folder -> `npm run valid-layers-check` -> hygiene -> targeted tests.
- Keep `package.json`, `extensions/package.json` and the nested manifests consistent when dropping dependencies, then run `npm install`.
- Read the matching guide in `docs/guidelines/` before editing: `coding-guidelines.md`, `source-code-organization.md` and `best-practices.md` for any change under `src/vs`; `writing-tests.md` for tests; `disposable.md` and `observables.md` for lifecycle and reactive code; `tree-widgets.md` for list and tree UI; `design-philosophy.md`, `design-philosophy-reference.md`, `design-tokens.md` and `css-best-practices.md` for CSS and visual work; `accessibility.md` for ARIA and screen-reader support; `notebook.md` and `interactive.md` for those contribs; `build-next.md` for `build/next`; `oss-license-review.md` for `ThirdPartyNotices.txt`; `committing.md` for commits.
- Upstream conventions apply to surviving code: tabs; PascalCase types and enum values, camelCase functions and properties, whole words in names; JSDoc on exported functions, classes, interfaces and enums; user-facing strings through `nls.localize` with `{0}` placeholders and double quotes, single quotes everywhere else; title-style capitalization for command labels, buttons and menu items; arrow functions, braces on every block, `export function` at top level; no `any` or `unknown` unless unavoidable; register every disposable (`DisposableStore`, `MutableDisposable`, `DisposableMap`) and return disposables from methods that are called repeatedly; service dependencies only through constructor injection, never through `IInstantiationService` later; `IEditorService` to open editors; `IHoverService` for tooltips; correlated file watchers from `fileService.createWatcher`; never read or write another component's storage keys.
- Markdown: do not hard-wrap prose; one paragraph per source line.

## Review protocol, every artifact

1. Verify first: run the tests and checks yourself and recompute any number or citation. Never trust "done".
2. Then two fresh-context reviews: one Claude review that sees only the artifact, and one `/codex:adversarial-review` that also sees the task.
3. Check every finding against the code, or against a failing test, before acting on it.
4. Log the findings you reject, with the evidence, in `docs/reviews/<topic>-rejected.md`.
