# Verification record

This audit changes research and review documents only. The product source remains at `95800bc5a6f6a286eb32d099bb772e5870cd4763`; `git diff --name-only` was empty during verification. Existing untracked `.codex/` state is unrelated. Later in the audit, an external edit added a UI design reference to `CLAUDE.md`; that edit was left untouched. The audit itself made no product-source changes.

## Inventory and source integrity

The manifest was derived from `git ls-files` in an isolated clone of `VSCodium/vscodium` at `be70704abf84fc6c7721f94478dfcccd2dc6163e`. It contains 76 patch-related files: 69 `.patch`, four `.patch.no`, one `.patch.yet`, and two JSON action files. The 69 `.patch` files include the development helper; this is a file count, not a count of patches active in every build. There are no additional `.patch`/`.diff` assets outside `patches/` in that tracked snapshot. The manifest records SHA-256, source line counts, diff target paths, and locally surviving target paths. Its diff headers name 352 distinct targets; this does not measure behavioral coverage.

All 76 assets and six supporting files (`upstream/stable.json`, `upstream/insider.json`, `prepare_vscode.sh`, `utils.sh`, `undo_telemetry.sh`, `product.json`) were independently re-fetched from immutable `raw.githubusercontent.com` commit URLs. All 82 SHA-256 values matched the clone. See `remote-verification.json`. A further 39 cited supporting files were re-fetched and hash-checked after the research notes were complete; all matched (`additional-source-verification.json`). This gives 121 independently re-fetched source files in total. Both upstream channel manifests select tag `1.140.0`, commit `07f806f999227108933c2e30515b26eecc1fda74`.

## Focused execution

Node is `v24.21.0`, matching the required major. `node --test build/lib/test/booleanPolicy.test.ts build/lib/test/policyConversion.test.ts` passed 21 tests in two suites, with no failures, skips, or cancellations. The existing BooleanPolicy test explicitly expects a Microsoft registry parent. These tests confirm current behavior; their success does not establish VSCodium parity.

A separate direct invocation of the current TypeScript policy renderer with the actual `product.json` passed five assertions reproducing the branding gap: the generated macOS profile names the app VSebCode but sets `PayloadOrganization` to Microsoft, its profile manifest advertises `https://code.visualstudio.com/`, the Windows policy namespace is `Microsoft.Policies.VSebCode`, and a minimal synthetic policy renders under `Software\Policies\Microsoft\VSebCode`. See `policy-probe.json`. No generated repository output was modified.

## Independent checks on material claims

- `build/package.json:45` selects `@vscode/vsce` 3.6.1. Its lock entry depends on `@vscode/vsce-sign`, and `build/node_modules/@vscode/vsce-sign/package.json` confirms installed version 2.1.0. The root `node_modules/@vscode/vsce-sign/package.json` is absent. This is a build-chain finding, not evidence that the verifier is shipped in the application.
- Installed `@vscode/policy-watcher` 1.6.0 exposes optional `registryPath` in `index.d.ts:21`. Its Windows source defaults to the Microsoft registry parent when no custom path is supplied; `src/vs/platform/policy/node/nativePolicyService.ts:33` supplies no options. Reproducing VSCodium's behavior therefore need not require downgrading to its older library fork.
- `src/vs/workbench/contrib/extensions/browser/extensionsWorkbenchService.ts:1221` already implements an extension auto-update delay, with a 12-hour fallback at line 1243 and a trusted-publisher bypass. `product.json` currently contains no trusted-publisher allowlist. This must not be reported as absence of any cooldown; VSCodium's 48-hour `extensions.minReleaseAge` mechanism differs.
- `src/bootstrap-meta.ts:23` loads repository-local `product.overrides.json` only when `VSCODE_DEV` is set. This is not packaged user-data-directory `product.json` support.
- `src/vs/workbench/services/commands/common/commandService.ts` contains no command filter or filter configuration dependency. `workbench.action.terminal.newLocal` remains declared. Existing terminal trust checks must be described separately from VSCodium's extra filter.
- The command-palette settings `workbench.commandPalette.experimental.askChatLocation`, `workbench.commandPalette.showAskInChat`, and `workbench.commandPalette.experimental.enableNaturalLanguageSearch` remain registered at `src/vs/workbench/browser/workbench.contribution.ts:527`, `:538`, and `:544`. Repository-wide production searches found only these registrations and two stale type fields in `src/vs/workbench/browser/quickaccess.ts`. This is leftover configuration, not evidence that a chat or online language service still executes.
- The exact `.data.microsoft.com` pattern from VSCodium's `undo_telemetry.sh` had no matches in the locally downloaded `.build/builtInExtensions` tree. Absence of VSCodium's blanket scrub is a pipeline difference; it is not proof of active telemetry or a guarantee about future downloads.

The audit does not claim a fresh full build, network capture, third-party extension compatibility run, Linux/Windows runtime validation, DMG creation, signing, notarization, or publication. The application was not changed.

## Document checks

The repository precommit command was attempted on the audit plan and JSON evidence files. It exited with “No hygiene-eligible files matched the requested paths” and checked zero files, because `build/filters.ts` limits the eligible tree and excludes these documentation locations. This is not recorded as a passing hygiene run. Separate JSON parse/schema, exact-assignment, unique-inventory, local-link existence, and source-line-bound checks validate the audit data; the report receives the same checks before review.

Final report validation reconciled 76 unique matrix rows against the manifest and the three source classification sets. Citation checks confirmed 184 distinct local file/line references and 119 distinct pinned VSCodium references in the report, plus 364 local and 536 pinned references in the research notes, all within file bounds. Citations below the external `CLAUDE.md` insertion were advanced by four lines to preserve their targets.
