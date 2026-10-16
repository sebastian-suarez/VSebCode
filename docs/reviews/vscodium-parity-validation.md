# VSCodium parity validation

The implementation starts from `0778ae2564bc0682c3947fb59378f8cf278ab5a3` and uses VSCodium `be70704abf84fc6c7721f94478dfcccd2dc6163e` as the patch reference. The [effect ledger](../plans/vscodium-parity-status.md) accounts for all 21 Missing and 11 Partial baseline entries and the additional requested effects. The complete primary draft was selected after parent-run comparison with the independent rival and is integrated into the main checkout. The final source, preparation and packaged checks pass. The changes remain uncommitted; no push or publication was performed.

## Reproducible acceptance

Both independent drafts receive the same parent acceptance fixtures. Their manifest SHA-256 values are listed below; earlier versions remain unchanged. The fixtures and execution records are under `/tmp/vsebcode-vscodium-parity/`; no personal editor profile or installed application was used.

| Fixture | Manifest SHA-256 | Additional coverage |
| --- | --- | --- |
| Version 1 | `8de06f614ef6f2055c8513408bd4ca05f77a6bd9d6f661d23f43d01b0853e1db` | Shared unit suites, preparation, packaged CLI and UI. |
| Version 2 | `7b3e19a369c28b09911f3b24c7686e0d9099617d9246c5354c0285b3c6769d97` | Source-map variants, fixed tabs, live Find resizing, moved views and narrow Extensions search. |
| Version 3 | `e974220f66af8977f59c7b6b64bd9ae6377ede8acfa27b740f89639d3a4e2477` | Fractional Find widths and maximize/reset. |
| Version 4 | `449ef24cb88dce951e3487524e8c6c1a050ec72bba26ae5096a702f30f395887` | Inline external-source-only changes, classic pane headers and first-shown regional search editor. |
| Version 5 | `d3397ad33a736d9d562308bae828c5fbc5350d44457da7f2b4a69462a2590b59` | Packaged CLI path stability with a user product-name override. |
| Version 6 | `61d552582801f20fbc9fa3baa3f27a9d210848ff39fb86f2849dfe0772f9045f` | Same UI/CLI behavior with the data root checked through renderer configuration and equivalent ignored-product diagnostics accepted. |
| Version 7 | `f551914bc85012cbb18204bdd3fd840338f606c7b1cb91ac2c343ff1876cce78` | Same UI scenarios, waiting for asynchronous command completion after clicking the confirmation button. |

| Check | Primary result |
| --- | --- |
| Node | 24.21.0, matching the required major version 24. |
| `npm run compile-client` | Passed, including client and Monaco type checks. |
| `npm run gulp compile-extensions` | Passed. |
| Build-tool type check and `env TMPDIR=/private/tmp npm run test` in `build/` | Passed; 695 tests, including source-map parsing, retrying sysroot downloads and separate-bundle data-path pinning. The canonical temporary path avoids an existing `/var` versus `/private/var` URL assertion mismatch. |
| Shared Electron acceptance plus focused runtime/font/notification regressions | Passed; all 320 tests in the exact frozen shared command also run against the rival. A final 274-test runtime run covers the approved log precedence, offered-version cooldown, profile filtering, deprecation migration, existing installation maintenance and update suppression. These runs overlap; they are not added as unique tests. |
| Chromium gallery/control-feed suite | Passed; 35 tests, including independent extension/version publication times. |
| Chromium list, pane and regional control suites | Passed; 26 tests. |
| Client type check, import layers, public API compile and Monaco compile | Passed. |
| Affected ESLint and hygiene | Passed; 166 code targets and 185 hygiene-checked files respectively. The final twelve code targets and associated documentation also pass the affected checks. |
| `npm run stylelint` | Passed; 293 CSS files. |
| `git diff --check` | Passed after removing trailing whitespace introduced by selector formatting. |
| Dependency and built-in-cache preparation | Passed through the actual fast-install entry point, including an up-to-date dependency state. |
| Optional native tree-sitter absence | Gulp task loading and extension-media preparation passed with the optional native packages temporarily absent; packages were restored and shipped WASM remained present. |
| macOS arm64 package | Rebuilt after final runtime fixes and launched with Electron 43.7.7; all 30 version 7 UI scenarios, nine version 6 CLI checks and both version 5 path-stability operations pass. |

The preparation tests cover ordinary and escaped authorities, external and inline maps, multiple replacements on one line, embedded source content, omitted/null source content with rewritten external sources, a source-only change, URI-encoded inline maps including literal asterisks, binary and symlink exclusions, hidden directories, late built-in cache files and repeat execution. Version 4 preparation passes through the real install/cache paths. Focused build tests also validate custom sysroot paths, target ELF class/byte order, ripgrep architecture and rejected missing/malformed affected maps.

## Packaged behavior

The parent exercised native keymap and proxy loading, a generic proposed-API fixture, main/renderer/native-worker/browser-worker product and gallery precedence, invalid product-file diagnostics, Welcome disabled/fallback behavior, command denial/cancellation/confirmation/live changes, and settings persistence across restart. Service-extension installation is rejected from a local VSIX; a generic VSIX and Microsoft Marketplace `ms-vscode.hexeditor@1.11.1` install successfully. The broader installation-policy unit coverage checks all 26 approved IDs and its independence from optional control-feed/signature/allowlist settings. The maintainer explicitly chose to block updates and reinstalls too; existing copies keep running, and metadata-only copy/move operations at the same already-present location remain available.

Typography checks cover default geometry, global sizes 18 and 10, independent regional settings, reset, classic/light and modern/dark modes, keyboard focus while scrolling, auxiliary windows, fixed 240-pixel tab widths, and Find width/resizing/reset while changing the font from 26 to 13. Problems and Comments use panel-sized rows at panel size 26/sidebar size 13, then sidebar-sized rows after moving. Extensions search retains usable width and places its actions below the input at size 32 in a narrow sidebar. A retained-row test confirms an unfinished input value survives font remeasurement. The final version 7 packaged UI fixture completed successfully on the final bundle. It also confirms classic pane header line-height alignment, fractional Find maximize/reset at size 14, and an Extensions search editor first shown at regional size 32. The final default, enlarged and narrow-search screenshots were inspected. At the deliberately extreme 32px/200px sidebar combination, labels truncate while the search input and actions remain reachable.

## Main-checkout verification

Integration copied the complete primary draft and verified SHA-256 values for all 218 affected/new files. Unrelated untracked work was preserved. `npm run install-fast` completed without changing the selected source or lockfiles. The main checkout then passed client compilation, build-tool typecheck and all 695 build tests, 478 affected Electron tests, 59 Chromium tests, layer/API/Monaco checks, ESLint (166 targets), hygiene (185 checked files), stylelint and `git diff --check`. The final runtime changes were copied only after checking every previously integrated hash, then compiled and tested again in the main checkout. The Electron counts include upstream regression suites affected by the new environment property; they are not added to the isolated-draft counts as unique tests.

## Whole-draft comparison

The parent ran the frozen shared command unchanged on both implementations: primary 320 passed; rival 316 passed and four failed (Linux terminal invocation/quoting and command-filter behavior). The rival passed build-tool typecheck and all 717 build tests, preparation version 4, layers, public API, Monaco, stylelint and diff checks. It still failed client typecheck in its native extension-management test, ESLint (three findings), hygiene (51 findings), and two of its own 491 targeted tests (list remeasurement and blocked CLI installation expectations). Transpilation was run separately to exercise the rival despite the client type error; that does not turn its typecheck into a pass.

Both bundles passed the nine behavior-based CLI checks and product-name path-isolation fixture. The original CLI fixture rejected the rival's equivalent lowercase “ignored” diagnostic, and its original UI probe assumed a private environment-variable name; these were harness assumptions, not reported product defects. Version 6 corrects both assumptions identically for both drafts. The rival's UI then reached native startup and renderer checks but failed the browser-worker product-override probe. The primary's first version 6 run exposed a harness race after command confirmation; version 7 waits for the extension-host command to complete and passes all 30 scenarios. Earlier frozen fixtures and failure evidence are retained.

The primary was selected as a whole; no rival code was spliced into it. The final packaged artifact is `/tmp/vsebcode-vscodium-parity/primary-package-complete/VSebCode.app`; final UI, CLI and path results are in `primary-ui-verified`, `primary-cli-complete` and `primary-product-path-complete` respectively. All profiles and extension directories used for validation are disposable test directories.

## Review and execution limits

Both review/fix rounds are complete. Failed second-round invocations were retried against the same frozen snapshots after the quota reset; no third review round was started. Confirmed findings were reproduced or checked against source before correction. [Rejected findings](vscodium-parity-rejected.md) include their evidence and intentional compatibility choices. Coverage is tracked by scope, file and snapshot hash under `review-round1/` and `review-round2/` in the evidence directory.

The second task-aware and independent artifact-only reviews both completed all eight supplied scopes: shared font controls, view logic, workbench typography, view CSS, build tooling, runtime product/path handling, runtime features and extension policy. The five artifact-only quota failures were eventually retried successfully. Earlier same-vendor fallback reviews are retained as supplemental evidence, not independent coverage. The independent plan review at the start did not complete because of the quota limit; its disclosed fallback remains the only plan attack. Later implementation reviews do not retroactively satisfy that missing planning review.

Final-round corrections cover list horizontal caches and hidden/detached measurement, first-layout regional controls and mixed call-stack rows, fractional Find sizing, inline source-map discovery/parsing, retrying/checksummed sysroot downloads, Windows UNC setup order, process-wide data-path pinning, approved Linux log isolation, command registration during confirmation, offered-version release age and extension-policy batch/update behavior. Parent-run regression tests cover the corrected behavior. The final fixes were not sent through a third review round; no post-fix reviewer approval is claimed. The final delta from review snapshots is recorded in `review-round2/post-review-changes.json`; it includes the late call-stack CSS adjustment and regional-control regression file that were absent from the supplied coverage manifests. A 50,000-row retained-list benchmark measured approximately 27 ms for initial insertion and 24 ms for font refresh on this machine, which is evidence for the reviewed performance concern, not a cross-platform guarantee.

Linux and Windows execution remains deferred by the maintainer. Extra Linux architectures are registered but explicitly blocked until the required Electron 43.7.7 assets, trusted checksums, native modules, compiler and sysroot are supplied; s390x additionally lacks resolver-package support. LoongArch uses `loong64` for Debian and `loongarch64` for RPM. No installer upgrade, Windows signing-tool execution, Linux package installation or extra-architecture runtime success is claimed. Icons, signing, notarization and publication remain outside this task. The announcement file is prepared locally; no remote feed publication is performed.

## Blocklist decision validation — 2026-10-15

The maintainer confirmed that the existing blocklist stays unchanged. This follow-up compared the documented list with the implementation and freshly compiled output: all contain the same 26 unique IDs in the same order. Installation, update and reinstallation restrictions remain unchanged; existing copies are not disabled or deleted, and metadata-only copy/move operations at the same already-present location remain available.

This run started at `2026-10-15T19:52:05Z` from the existing uncommitted parity implementation, based on HEAD `0778ae2564bc0682c3947fb59378f8cf278ab5a3`; the validated sources include modified and untracked policy/enforcement files and tests, so that commit alone does not reproduce this run. The source-file hash manifest is `0d3094c8e5861a0cd0cde52dff3c32be87d5176cceef88548ab8effd60f18207` (SHA-256). Build and launcher Node was `v24.21.0`; the tests ran in Electron's bundled runtime. Exact commands, logs, exit codes, policy hashes and the source baseline are retained in `/private/tmp/vsebcode-blocklist-validation/`.

`npm run build-fast -- --client-only` passed (exit 0), refreshing the compiled client and test output. The affected Electron run passed 229 tests with no failures (exit 0): `./scripts/test.sh --run src/vs/platform/extensionManagement/test/common/extensionInstallationPolicy.test.ts --run src/vs/platform/extensionManagement/test/node/extensionManagementService.test.ts --run src/vs/workbench/contrib/extensions/test/electron-browser/extensionsWorkbenchService.test.ts`. This total includes the extension enablement suite loaded by those files. The first sandboxed launch aborted before test execution (exit 134); the approved run outside that sandbox produced the passing result.

The suites cover all blocked IDs, representative permitted tools, gallery rejection despite optional safety overrides, blocked deprecation replacements, profile batch filtering, metadata-only copy/move behavior and update suppression for an installed blocked extension. They do not directly exercise blocked dependency/location installs, reinstalls against an existing installation or activation of an already-installed blocked extension. Earlier packaged checks above remain separate evidence and were not rerun here.

All source-file hashes and the Git index were unchanged after the build and tests; only this validation subsection was then added. No policy or test code changed, so the conditional macOS app rebuild was unnecessary and was not performed. No new packaged-app validation, commit or push is claimed.
