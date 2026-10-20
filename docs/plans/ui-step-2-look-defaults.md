# UI step 2: look and editing defaults

Second step of the UI roadmap (`docs/plans/ui-roadmap.md`): the fork's own defaults for the design's look and for the maintainer's look and editing preferences, registered once at startup from one fork contribution, plus Error Lens as the recommended extension. The only upstream feature code it changes is the accessibility fix of the empty editor group in `editorGroupView.ts`.

## Decisions (2026-10-20)

- Scope: the design's look (the "most of the look is configuration" table of the Neovim-first screen map, `~/Projects/VSebCode-design/VSebCode Screen Map v2.dc.html`, and the settings panel of `VSebCode v10.dc.html`) and the maintainer's look and editing preferences (their `settings.json` of 2026-10-20).
- Conflicts: the mockup wins where it states or draws a value; the maintainer's file applies where the mockup is silent. So inlay hints stay always on and are drawn in the code font without padding, references highlight in the current file only, completion ghost text stays off and new terminals open in the panel; the mockup's tree indent (16px a level) and always-visible tree guides agree with the maintainer's values.
- Code font: `'Liga SFMono Nerd Font', 'SF Mono', Menlo, Monaco, 'Courier New', monospace` for the editor and the terminal; the editor at 14px with ligatures (the mockup panel and the maintainer agree), and the terminal matches it at 14px with ligatures (decided 2026-10-20).
- Theme: Dark 2026 stays the default, with no override; the maintainer's `Dark+` is dropped. The v10 mockup is recolored to Dark 2026 in the design folder as separate work.
- From the roadmap: tabs `none`; relative line numbers, lightbulb off and code lens off belong to step 14, where the maintainer's `"relative"` and `"off"` are recorded; `window.density.layout` keeps its default `"default"` (the screen map's `"compact"` is superseded); Error Lens is the recommended extension, styled in step 6; Todo Tree was dropped after the validation check (see the decisions below). The mockup panel's blame default (`false`) contradicts its own settings table and the roadmap; blame is on.

## Left out, and why

- The old Vibrancy and Custom UI Style setup, dropped by the maintainer: `window.titleBarStyle` `native`, `window.customTitleBarVisibility` `never`, `workbench.activityBar.location` `top`, `vscode_vibrancy.*`, `custom-ui-style.*`, the translucent `workbench.colorCustomizations`, `terminal.integrated.gpuAcceleration` `off` and `window.systemColorTheme` `dark`.
- Settings of removed features: `chat.disableAIFeatures`, `telemetry.telemetryLevel`, `workbench.enableExperiments`, `update.showReleaseNotes`.
- Third-party extension settings and formatters: `editor.defaultFormatter` (Prettier, `[markdown]` markdownlint, `[rust]` rust-analyzer), `rust-analyzer.*`, `errorLens.fontFamily` (step 6 styles Error Lens), `editor.semanticTokenColorCustomizations` (rust-analyzer's `mutable` and `unsafe` modifiers) and `workbench.iconTheme` `vscode-icons`. Without Prettier, format on save and on paste use the built-in formatters.
- Project-specific: `workbench.editor.customLabels.patterns` (Next.js routes).
- Safety prompts kept by decision (2026-10-20): `security.workspace.trust.untrustedFiles` stays `"prompt"` and `terminal.integrated.enableMultiLinePasteWarning` stays `"auto"`, since they guard against trusting or running content; the maintainer's user settings keep their own values.
- Redundant or ineffective: the `files.associations` entry `.env*` (the built-in `dotenv` language already covers `.env` and `.env.*`, `extensions/dotenv/package.json:18`) and the `editor.tokenColorCustomizations` rule for `keyword.other.dotenv` (the built-in grammar never emits that scope).
- Read by the main process, which never loads workbench contributions: `files.hotExit` (`src/vs/platform/backup/electron-main/backupMainService.ts:100`) and `window.newWindowProfile` (`src/vs/platform/windows/electron-main/windowsMainService.ts:1443`). A registration shared with main would not reach it either: main's `DefaultConfiguration` builds defaults only for properties registered in main (`src/vs/platform/configuration/common/configurations.ts:47-55`), and neither is. Giving main the same default would mean registering them in main or editing those readers; not in this step, so both stay in the maintainer's user settings. `window.glass` is not touched.

## Defaults

Only keys whose value differs from the current default, checked on 2026-10-20 with a throwaway extension that dumps `inspect().defaultValue` from a fresh profile and against `extensions/typescript-language-features/package.json` for the legacy TypeScript keys. Sources: D design table, P mockup panel, M maintainer, R roadmap, F font decision.

Layout and workbench:

| Key | Value | Source | Now |
|---|---|---|---|
| `workbench.activityBar.location` | `"hidden"` | D | `"default"` |
| `workbench.editor.showTabs` | `"none"` | D, R | `"multiple"` |
| `window.commandCenter` | `false` | D, M | `true` |
| `workbench.layoutControl.enabled` | `false` | D | `true` |
| `workbench.editor.enablePreview` | `false` | D, M | `true` |
| `accessibility.dimUnfocused.enabled` | `true` (opacity stays `0.75`) | D, P | `false` |
| `window.title` | `"${rootName}${separator}${activeEditorMedium}${dirty}"` | M | `"${activeEditorShort}${separator}${rootName}${separator}${profileName}"` |
| `workbench.editor.revealIfOpen` | `true` | M | `false` |
| `workbench.editor.useModal` | `"off"` | M | `"some"` |
| `workbench.settings.editor` | `"json"` | M | `"ui"` |
| `workbench.tips.enabled` | `false` | M | `true` |
| `workbench.welcomePage.walkthroughs.openOnInstall` | `false` | M | `true` |
| `workbench.view.showQuietly` | `{"workbench.panel.output": true}` | M | `{}` |
| `workbench.localHistory.maxFileEntries` | `200` | M | `50` |
| `problems.showCurrentInStatus` | `true` | M | `false` |
| `workbench.list.smoothScrolling` | `true` | M | `false` |
| `workbench.tree.indent` | `16` | M, as the mockup's tree | `8` |
| `workbench.tree.renderIndentGuides` | `"always"` | M, as the mockup's tree | `"onHover"` |
| `zenMode.hideLineNumbers` | `false` | M | `true` |
| `zenMode.showTabs` | `"single"` | M | `"multiple"` |

Editor look:

| Key | Value | Source | Now |
|---|---|---|---|
| `editor.minimap.enabled` | `false` | D, M | `true` |
| `editor.renderLineHighlightOnlyWhenFocus` | `true` | D | `false` |
| `editor.cursorSurroundingLines` | `8` | D, M | `0` |
| `editor.cursorSurroundingLinesStyle` | `"all"` | D | `"default"` |
| `editor.fontFamily` | the code font chain | F | `"Menlo, Monaco, 'Courier New', monospace"` |
| `editor.fontSize` | `14` | P, M | `12` |
| `editor.fontLigatures` | `true` | M | `false` |
| `editor.renderWhitespace` | `"all"` | M | `"selection"` |
| `editor.guides.bracketPairs` | `"active"` | M | `false` |
| `editor.bracketPairColorization.independentColorPoolPerBracketType` | `true` | M | `false` |
| `editor.showFoldingControls` | `"always"` | M | `"mouseover"` |
| `editor.cursorBlinking` | `"smooth"` | M | `"blink"` |
| `editor.cursorSmoothCaretAnimation` | `"on"` | M | `"off"` |
| `editor.smoothScrolling` | `true` | M | `false` |
| `editor.hover.delay` | `100` | M | `300` |
| `editor.inlineSuggest.showToolbar` | `"always"` | M | `"onHover"` |
| `editor.suggest.showStatusBar` | `true` | M | `false` |
| `scm.diffDecorations` | `"gutter"` | D | `"all"` |
| `git.blame.editorDecoration.enabled` | `true` | D, M, R | `false` |
| `diffEditor.hideUnchangedRegions.enabled` | `true` | M | `false` |
| `diffEditor.experimental.showMoves` | `true` | M | `false` |

Editing:

| Key | Value | Source | Now |
|---|---|---|---|
| `editor.tabSize` | `2` (per file, `editor.detectIndentation` still wins) | M | `4` |
| `editor.formatOnSave`, `editor.formatOnPaste` | `true` | M | `false` |
| `editor.wordWrap` | `"bounded"` (the built-in `[markdown]` `"on"` still wins) | M | `"off"` |
| `editor.wordWrapColumn` | `120` | M | `80` |
| `editor.linkedEditing`, `editor.foldingImportsByDefault` | `true` | M | `false` |
| `editor.dragAndDrop`, `editor.copyWithSyntaxHighlighting` | `false` | M | `true` |
| `editor.find.autoFindInSelection` | `"multiline"` | M | `"never"` |
| `editor.autoClosingBrackets`, `editor.autoClosingQuotes` | `"always"` | M | `"languageDefined"` |
| `editor.wordSeparators` | the default string without the hyphen | M | `USUAL_WORD_SEPARATORS` (`src/vs/editor/common/core/wordHelper.ts:10`) |
| `editor.suggest.insertMode` | `"replace"` | M | `"insert"` |
| `editor.suggest.localityBonus` | `true` | M | `false` |
| `editor.suggest.matchOnWordStartOnly`, `editor.acceptSuggestionOnCommitCharacter` | `false` | M | `true` |
| `editor.tabCompletion` | `"onlySnippets"` | M | `"off"` |
| `[rust]` `editor.rulers` | `[100]` | M | `[]` |
| `[rust]` `editor.tabSize` | `4` | M | `4`, but only through the global default, which this table changes to `2`; no language default exists |

TypeScript and JavaScript: the extension uses a `js/ts.*` value only when a user, workspace or language value is set, a non-empty `inspect().languageIds` included, and otherwise reads the legacy key (`readUnifiedConfig`, `extensions/typescript-language-features/src/utils/configuration.ts:23-57`). The defaults therefore go on the legacy `typescript.*` and `javascript.*` keys. A `[typescript]` block was rejected: it would make JavaScript files skip their legacy fallback, and it cannot reach window-scoped keys such as the memory limit. All rows are M.

| Keys (`typescript.` and `javascript.` unless noted) | Value | Now |
|---|---|---|
| `inlayHints.parameterNames.enabled` | `"all"` | `"none"` |
| `inlayHints.parameterNames.suppressWhenArgumentMatchesName`, `inlayHints.variableTypes.suppressWhenTypeMatchesName` | `false` | `true` |
| `inlayHints.parameterTypes.enabled`, `inlayHints.variableTypes.enabled`, `inlayHints.propertyDeclarationTypes.enabled`, `inlayHints.functionLikeReturnTypes.enabled` | `true` | `false` |
| `typescript.inlayHints.enumMemberValues.enabled` (no `javascript.` key) | `true` | `false` |
| `updateImportsOnFileMove.enabled` | `"always"` | `"prompt"` |
| `preferences.autoImportSpecifierExcludeRegexes` | `["^lodash$", "^node:test$"]` | `[]` |
| `typescript.preferences.preferTypeOnlyAutoImports` | `true` | `false` |
| `typescript.tsserver.maxTsServerMemory` (read for `js/ts.tsserver.maxMemory`) | `4096` | `3072` |
| `typescript.enablePromptUseWorkspaceTsdk` (read for `js/ts.tsdk.promptToUseWorkspaceVersion`) | `true` | `false` |

Files, search and explorer (all M):

| Key | Value | Now |
|---|---|---|
| `files.eol` | `"\n"` | `"auto"` |
| `files.defaultLanguage` | `"typescript"` | `""` |
| `files.watcherExclude` | adds `**/node_modules/**`, `**/.next/**`, `**/dist/**`, `**/build/**`, `**/coverage/**`, `**/.turbo/**`, `**/target/**` | six VCS globs, kept by the merge |
| `files.readonlyInclude` | `**/node_modules/**`, `**/pnpm-lock.yaml`, `**/package-lock.json`, `**/yarn.lock`, `**/bun.lock`, `**/.next/**`, `**/dist/**`, `**/target/**` | `{}` |
| `search.smartCase`, `search.showLineNumbers`, `search.useParentIgnoreFiles`, `search.seedWithNearestWord` | `true` | `false` |
| `search.exclude` | adds the four lockfiles, `**/.next`, `**/coverage`, `**/target` | three globs, kept by the merge |
| `explorer.compactFolders` | `false` | `true` |
| `explorer.incrementalNaming` | `"smart"` | `"simple"` |
| `explorer.fileNesting.enabled` | `true` | `false` |
| `explorer.fileNesting.expand` | `false` | `true` |
| `explorer.fileNesting.patterns` | the maintainer's eight patterns over upstream's six; theirs replace `*.ts`, `*.tsx` and `package.json` | six patterns |
| `explorer.confirmDelete`, `explorer.confirmDragAndDrop` | `false` (decided 2026-10-20: deletes go to the Trash, moves can be undone) | `true` |

Terminal, debug, Markdown and Emmet:

| Key | Value | Source | Now |
|---|---|---|---|
| `terminal.integrated.fontFamily` | the code font chain | F | `""` (the editor's font) |
| `terminal.integrated.fontSize` | `14` | F | `12` |
| `terminal.integrated.fontLigatures.enabled` | `true` | F | `false` |
| `terminal.integrated.defaultProfile.osx` | `"zsh"` | P, M | `null` (`$SHELL`) |
| `terminal.integrated.scrollback` | `10000` | M | `1000` |
| `terminal.integrated.copyOnSelection`, `terminal.integrated.smoothScrolling` | `true` | M | `false` |
| `terminal.integrated.confirmOnExit` | `"hasChildProcesses"` | M | `"never"` |
| `debug.javascript.autoAttachFilter` | `"onlyWithFlag"` | M | `"disabled"` (built-in js-debug) |
| `debug.terminal.clearBeforeReusing` | `true` | M | `false` |
| `debug.inlineValues` | `"on"` (the panel's "Inline variable values" on) | P | `"auto"`, which shows them only for languages with an inline-values provider (`debugEditorContribution.ts:771`) |
| `markdown.preview.fontFamily` | `"'Helvetica Neue'"` | M | the system UI stack |
| `markdown.preview.fontSize` | `16` | M | `14` |
| `markdown.preview.lineHeight` | `1.5` | M | `1.6` |
| `markdown.preview.typographer`, `markdown.validate.enabled`, `markdown.occurrencesHighlight.enabled` | `true` | M | `false` |
| `markdown.updateLinksOnFileMove.enabled` | `"always"` | M | `"never"` |
| `emmet.includeLanguages` | `{"javascript": "javascriptreact"}` | M | `{}` |
| `emmet.triggerExpansionOnTab`, `emmet.showSuggestionsAsSnippets`, `emmet.useInlineCompletions` | `true` | M | `false` |
| `emmet.syntaxProfiles` | `javascriptreact` and `typescriptreact` with `self_closing_tag` `"xhtml"` and `attr_quotes` `"double"` | M | `{}` |
| `emmet.preferences` | `css.floatUnit` `"rem"`, `profile.allowCompactBoolean` `true`, `bem.modifierSeparator` `"--"` | M | `{}` |

## Mechanism

- `src/vs/workbench/contrib/productDefaults/common/productDefaults.ts` (fork-authored) holds the table as one frozen `IStringDictionary<unknown>`, grouped like the tables above, with the `[rust]` block.
- `productDefaults.contribution.ts` in the same folder calls `Registry.as<IConfigurationRegistry>(Extensions.Configuration).registerDefaultConfigurations([{ overrides, donotCache: true }])` at module top level, so the defaults exist before the configuration service builds its default model and before the layout reads `workbench.activityBar.location`, `workbench.editor.showTabs` and `window.commandCenter`. `donotCache` because the workbench otherwise caches non-language overrides and prefers the cached copy at the next start (`src/vs/workbench/services/configuration/browser/configuration.ts:94-119`). No `source` is passed.
- One import in `workbench.desktop.main.ts`, next to the glass contribution (line 161). It sits after `workbench.common.main.js` (line 16), so the core object settings (`files.watcherExclude`, `search.exclude`, `explorer.fileNesting.patterns`, `workbench.view.showQuietly`) are already registered and the overrides merge into their defaults (`src/vs/platform/configuration/common/configurationRegistry.ts:580-610`). Extension settings (git, markdown, emmet, TypeScript, js-debug) register later and take the stored override when they do (`:919-938`); for their object settings that replaces the package default, which for emmet is `{}`.

## Recommended extensions

`product.json` gets `extensionRecommendations` for `usernamehw.errorlens` (on the Marketplace on 2026-10-20) with one non-important `onFileOpen` condition whose `pathGlob` (`**/*`) matches any file (`fileBasedRecommendations.ts` matches it against the file URI). It then appears under Recommended in the Extensions view after a file opens, without a notification. Todo Tree is not recommended (see the decisions below). The field already exists in `IProductConfiguration` (`src/vs/base/common/product.ts:102`); no other product field changes.

## Test harnesses

The smoke and integration suites start from a fresh profile, so they now run with these defaults. The smoke launcher (`test/automation/src/electron.ts`) seeds `User/settings.json` with the upstream values of the settings a failing smoke test proves it needs, and `clearUserSettings` (`test/automation/src/settings.ts:49`) writes that seed instead of an empty object. At least `workbench.editor.showTabs` and `workbench.activityBar.location` are expected: `selectTab` clicks editor tabs, and the accessibility and preferences tests wait for `.activitybar`. The integration suite (`scripts/test-integration.sh`, a fresh profile plus `extensions/vscode-api-tests/testWorkspace/.vscode/settings.json`) gets a seed only where a failure proves it; `editor.formatOnSave`, `files.defaultLanguage` and `editor.tabSize` are the likely candidates. Each seeded setting is listed in this plan's status with the test that needed it. A product switch that turns the fork's defaults off under the test drivers was rejected: it would put test-only code in the product.

## Validation

- Unit test `src/vs/workbench/contrib/productDefaults/test/common/productDefaults.test.ts`: a `deepStrictEqual` snapshot of the table, plus invariants: no `js/ts.*` key, none of `files.hotExit`, `window.newWindowProfile` and `window.glass`, and no key of a removed surface.
- `npm run compile-client` before any suite: the Electron, integration and smoke runners load `out/` and compile only when it is missing (`build/lib/preLaunch.ts:42-46`), and `typecheck-client` emits nothing. The Electron run must list the new test file.
- `npm run typecheck-client`, `npm run eslint` and `npm run precommit` on the changed files, `npm run valid-layers-check`, the full `./scripts/test.sh`, `./scripts/test-integration.sh` and `npm run smoketest`.
- The throwaway dump extension, rerun from a fresh profile, confirms every effective default, including the merged objects and the extension keys; a TypeScript file shows the parameter-name and type hints.
- The recommended extensions are installed in a test profile and must activate on 1.143.0-dev and draw their decorations (done for Error Lens and Todo Tree on 2026-10-20; see the decisions below).
- Captures, per the roadmap rules: a fresh profile in dark, light and high contrast, the side bar on the left and on the right, both densities, zoom, a reload, a second window, the Extensions view with the Error Lens recommendation, and search, source control and extensions opened from the keyboard (⇧⌘F, ⌃⇧G, ⇧⌘X) with the activity bar hidden.

## Upstream files touched

`src/vs/workbench/workbench.desktop.main.ts` (one import) and `product.json` (`extensionRecommendations`); the runs required `test/automation/src/electron.ts` (the seed and its writer), `test/automation/src/settings.ts` (`clearUserSettings` restores the seed, `addUserSettings` types one entry per line, both helpers refuse seeded keys, `newLine` follows the cursor), `test/automation/src/editor.ts` (the typed-text check reads lines in visual order), `test/smoke/src/areas/preferences/preferences.test.ts` (the long-entry regression case) and `scripts/test-integration.sh` (the suite seed); the round 1 accessibility fix touches `src/vs/workbench/browser/parts/editor/editorGroupView.ts` and its test `src/vs/workbench/services/editor/test/browser/editorGroupsService.test.ts`. Fork-authored: the `contrib/productDefaults` folder and its test.

## Decisions on the open questions (2026-10-20)

- Safety prompts: VSebCode turns off only the two explorer confirmations; the prompts for untrusted files and multi-line terminal paste keep upstream's defaults.
- Todo Tree: recommended if the validation shows it activating and drawing its highlights on 1.143.0-dev, and revisited in step 6; otherwise Error Lens alone is recommended and the TODO highlights are decided in step 6. Outcome (2026-10-20): Error Lens alone. On the packaged 1.143.0-dev app with a fresh profile, `usernamehw.errorlens` 3.29.0 activates and draws its inline diagnostics, while `Gruntfuggly.todo-tree` 0.0.226 activates but reports "Todo-Tree: Failed to find vscode-ripgrep" and draws no TODO, FIXME or HACK highlights: the app ships ripgrep as `@vscode/ripgrep-universal` (`node_modules.asar.unpacked/@vscode/ripgrep-universal/bin/darwin-arm64/rg`) and Todo Tree only looks for `vscode-ripgrep` or `@vscode/ripgrep`. Pointing `todo-tree.ripgrep.ripgrep` at that absolute path works only after a restart and depends on where the app is installed, so it is no default. Screenshots, kept locally: `.build/ui-step-2/extcheck/errorlens-todotree.png` and `.build/ui-step-2/extcheck/todotree-after-relaunch.png`. The TODO highlights are decided in step 6.
- Terminal: 14px with ligatures, matching the editor.

## Status

Implemented on main on 2026-10-20 in five commits (`e21e491c4c8` adds the fork header line the glass step left out of three files, `fe97e0c8694` the accessibility fix, `1a3abaadf0d` the harness seeds, `abefb400ac2` the defaults, `f4f89cafa2c` the Error Lens recommendation): `contrib/productDefaults` (`productDefaults.ts` with the table and `registerProductDefaults`, `productDefaults.contribution.ts`, the unit tests), the import in `workbench.desktop.main.ts`, `product.json` `extensionRecommendations` for Error Lens only, the accessibility fix of the empty editor group (`editorGroupView.ts` with a test in `editorGroupsService.test.ts`), the integration seed in `scripts/test-integration.sh` and the smoke seed and settings helpers in `test/automation/src/{electron,settings}.ts`.

Deviation from the validation list: the maintainer's `npm run watch` was running, so `npm run compile-client` was not run (it would race with the watch); instead every changed file was checked to have a compiled copy in `out/` newer than its source, and the Electron run lists the new tests.

Validated after the round 1 fixes: `npm run typecheck-client` (0 errors); `npm run eslint` on the changed TypeScript files (product.json has no eslint configuration) and `npm run precommit` on every changed file; `npm run valid-layers-check`; the automation package's type check; the product defaults suites (6 tests), `editorGroupsService.test.ts` (71), `modalEditorGroup.test.ts` (45) and `editorGroupModel.test.ts` (50); the full `./scripts/test.sh` (16528 passing, 204 pending, 0 failing); `npm run smoketest` (79 passing, 23 pending, 0 failing); the integration API folder suite (327 passing, 30 pending) and Emmet suite (176 passing) run with `--suite`, which leave the test workspace fixture unchanged; and, before round 1, the throwaway dump extension from a fresh profile, which matches all 123 expected effective defaults (merged objects, extension keys and the `[rust]` values included) with no other default changed.

After the round 2 fixes, which touch only the smoke harness: the automation and smoke type checks, eslint and `npm run precommit` on the changed files, and the full `npm run smoketest` (80 passing, 23 pending, 0 failing, with the new long-entry case).

Integration suite before round 1: the node.js stage fails one test that predates this step, `FileSearchEngine` › `Files: extraFiles only` (3 results instead of 1); it fails the same way with the defaults import removed, and `fileSearch.ts` and the test match `upstream-base`. Because the script stops there (`set -e`), the 15 extension suites were run with `--suite`: API folder 327, API workspace 4, colorize 109, terminal suggest 380, TypeScript 56, Markdown 181, Emmet 176, Git 82, Git Base 14, ipynb 37, notebook output 38, configuration editing 12, CSS 9, HTML 71 and JSON 39 passing, none failing. Terminal suggest's `PathExecutableCache` › `results are the same on successive calls` failed once because an executable appeared on `PATH` between two calls and passed on the rerun.

Seeds, each proven by a run that fails with the defaults and passes with the defaults import removed:

- Integration (`scripts/test-integration.sh`, the suite profile's `User/settings.json`): `editor.tabSize` `4` for "vscode API - editors" › "issue #16573"; `editor.formatOnSave` `false`, because the API folder suite saves the tracked `extensions/vscode-api-tests/testWorkspace/.vscode/settings.json` and format on save strips its final newline, leaving the tree dirty; `emmet.triggerExpansionOnTab` `false` for seventeen "Tests for Expand Abbreviations" cases; `emmet.includeLanguages` `{ "javascript": null }` for the two "No expanding text ... inside script tag with javascript type" cases, since a user value merges into the default object and Emmet ignores the null mapping.
- Smoke (`SEED_USER_SETTINGS` in `test/automation/src/electron.ts`): `workbench.editor.showTabs` `"multiple"` for "Preferences" (selectTab clicks tabs) and `workbench.editor.enablePreview` `true` for "Data Loss" › "verifies opened editors are restored" ("View: Keep Editor" exists only with preview editors). No smoke test sets either key itself.
- Removed in round 1: the smoke seeds `editor.wordWrap` `"off"` and `workbench.tips.enabled` `true`. The first worked around a harness problem, the second hid a product accessibility defect; both are fixed at the cause below.

Smoke harness after round 1: the launcher writes the seed one entry per line below a lone `{` (merging it into a settings file a test writes before launch, as "Integrated Browser" does), `clearUserSettings` restores it the same way, `addUserSettings` types one entry per line, and `addUserSetting` and `addUserSettings` throw on a seeded key, naming it, because the helpers type on the first line, above the seed, and the later duplicate key would win. After round 2: the typed-text check (`waitForEditorContents` in `editor.ts`) reads the rendered lines in their visual order, sorted by their position, so an entry longer than the wrap column reads back whole; `newLine` waits for the cursor line in the status bar to advance instead of counting rendered rows, which the editor limits to the visible range; and the launcher keeps an existing settings file's text, comments and trailing commas included, inserting only the seed entries whose key is missing after its first `{`. The Preferences smoke suite has a regression case, an entry of about 150 columns typed through both helpers above the seed, which fails with the old DOM-order read and passes with the visual-order one. Typing one entry per line is the root cause fix for the terminal hooks: the terminal helper typed its settings as one line of about 150 characters, which wraps at the fork's 120 columns, and the rendered rest of a wrapped line moves past the lines below, where the typed-text check reads it out of order; upstream types on an unwrapped line. `openUserSettingsFile` is upstream's again.

Accessibility fix: the empty editor group container is focusable and labelled ("Editor Group 1 (empty)") but had no role, so axe reports `aria-prohibited-attr` (serious) when the watermark tips are off, which is this step's default. `updateContainer` in `editorGroupView.ts` now gives the empty container `role="region"`, as upstream does for the focusable, labelled welcome content of an empty view (`viewPane.ts:164`), and removes it with the label when the group fills; `editorGroupsService.test.ts` covers both states. The accessibility smoke test passes with tips off. The defect exists upstream whenever the tips are off, so the fix is worth offering upstream.

## Review

Codex adversarial review of the first draft, 2026-10-20, verdict "needs attention", three medium findings, all verified against the code and folded in; none rejected. (1) The draft dropped `[rust]` `editor.tabSize` `4` as the default, but there is no Rust language default and the table moves the global default to `2`, so new Rust files would indent by 2; the row is back. (2) The mockup panel turns inline variable values on, and the fork's `"auto"` shows them only when the language has an inline-values provider (`debugEditorContribution.ts:771`); `debug.inlineValues` `"on"` is added. (3) The runners compile only when `out/` is missing, so validation now starts with `npm run compile-client` and checks that the new test ran. The main session also checked the unflagged central claim that `js/ts.*` default overrides are ignored (`readUnifiedConfig` reads a `js/ts.*` key only when a user, workspace or language value exists). Raw output: `.build/ui-step-2/reviews/codex-round-1.txt`.

Implementation review, round 1, 2026-10-20: a Codex adversarial review (`.build/ui-step-2/reviews/codex-implementation-round-1.txt`, verdict "needs attention") and a fresh-context review that ran on Codex (GPT-6 Astra) as the fallback reviewer (`.build/ui-step-2/reviews/astra-fresh-review-round-1.txt`). Both reported the same two medium findings, both verified and fixed. (1) The smoke seed `workbench.tips.enabled` `true` hid the empty editor group's accessibility defect instead of fixing it: the group now carries `role="region"` while empty, the seed is gone, and the scan passes with tips off. (2) Seeded values silently defeated settings a test sets, because the helpers type above the seed and the later duplicate key wins (the terminal helper asked for `editor.wordWrap` `"on"` and ran with `"off"`): the seed is written and restored one entry per line, `addUserSettings` types one entry per line, which removes the wrap failure the `editor.wordWrap` seed worked around, that seed is gone, and the helpers refuse a seeded key. The fresh-context review added two low findings. (3) The unit tests pinned the table but not its registration: `registerProductDefaults` is tested with a capturing fake (one registration, uncached), the registry semantics the plan relies on are tested on the global registry with keys of the test's own that it removes again (an object override merges into a registered default; a setting registered later takes the override as its default), and the `[rust]` block is checked against the registry's own language-override classification, because registering it for real would leave the identifier in the global registry, which cannot remove one. (4) The plan names the review tool: rejected, see `docs/reviews/ui-step-2-look-defaults-rejected.md`. Validation in this round also added the integration seed `editor.formatOnSave` `false` for the fixture that format on save rewrote.

Implementation review, round 2, 2026-10-20, on the round 1 fixes: the same two reviewers (`.build/ui-step-2/reviews/codex-implementation-round-2.txt` and `.build/ui-step-2/reviews/astra-fresh-review-round-2.txt`). Codex reported one medium finding: an entry longer than 120 columns still wraps, and the typed-text check read the rendered lines in DOM order, where Monaco can place the rest of a wrapped line after the seed lines. Fixed by reading the lines in visual order, sorted by their position (the driver exposes no model text, which Codex preferred), with a regression case in the Preferences smoke suite that fails without the fix. The fresh-context review reported two medium findings: `newLine` counted rendered rows, which the editor limits to the visible range, so a long settings file could time out (now it follows the cursor line in the status bar); and the launcher's `JSON.parse` rejected comments and trailing commas and then skipped seeding (now it keeps the file's text and inserts only the missing seed entries). It also reported two low findings: the plan's scope summary still named two recommended extensions and no upstream feature change (fixed), and the naming of the review tool (rejected again, see `docs/reviews/ui-step-2-look-defaults-rejected.md`). Round 2 was the last review round the protocol allows; the round 2 fixes are verified by the suites rather than by a third round: the automation and smoke type checks, eslint and hygiene on the changed files, and the full `npm run smoketest` (80 passing, 23 pending, 0 failing, the long-entry regression case included).
