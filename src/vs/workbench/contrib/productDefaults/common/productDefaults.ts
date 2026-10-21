/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IStringDictionary } from '../../../../base/common/collections.js';
import { USUAL_WORD_SEPARATORS } from '../../../../editor/common/core/wordHelper.js';
import { IConfigurationRegistry } from '../../../../platform/configuration/common/configurationRegistry.js';

/**
 * The code font of the editor and the terminal: the maintainer's patched font where it is
 * installed, then the design's SF Mono, then upstream's macOS fallbacks.
 */
const CODE_FONT_FAMILY = '\'Liga SFMono Nerd Font\', \'SF Mono\', Menlo, Monaco, \'Courier New\', monospace';

/**
 * VSebCode's own defaults for settings that the workbench and the built-in extensions register:
 * the look of the design and the maintainer's look and editing preferences. Every entry differs
 * from the upstream default; `docs/plans/ui-step-2-look-defaults.md` gives the source of each one.
 */
export const PRODUCT_DEFAULT_OVERRIDES: Readonly<IStringDictionary<unknown>> = Object.freeze({

	// Layout and workbench
	'workbench.activityBar.location': 'hidden',
	'workbench.editor.showTabs': 'none',
	'window.commandCenter': false,
	'workbench.layoutControl.enabled': false,
	'workbench.editor.enablePreview': false,
	'window.title': '${rootName}${separator}${activeEditorMedium}${dirty}',
	'workbench.editor.revealIfOpen': true,
	'workbench.editor.useModal': 'off',
	'workbench.settings.editor': 'json',
	'workbench.tips.enabled': false,
	'workbench.welcomePage.walkthroughs.openOnInstall': false,
	'workbench.view.showQuietly': { 'workbench.panel.output': true },
	'workbench.localHistory.maxFileEntries': 200,
	'problems.showCurrentInStatus': true,
	'workbench.list.smoothScrolling': true,
	'workbench.tree.indent': 16,
	'workbench.tree.renderIndentGuides': 'always',
	'zenMode.hideLineNumbers': false,
	'zenMode.showTabs': 'single',

	// Editor look
	'editor.minimap.enabled': false,
	'editor.renderLineHighlightOnlyWhenFocus': true,
	'editor.cursorSurroundingLines': 8,
	'editor.cursorSurroundingLinesStyle': 'all',
	'editor.fontFamily': CODE_FONT_FAMILY,
	'editor.fontSize': 14,
	'editor.fontLigatures': true,
	'editor.renderWhitespace': 'all',
	'editor.guides.bracketPairs': 'active',
	'editor.bracketPairColorization.independentColorPoolPerBracketType': true,
	'editor.showFoldingControls': 'always',
	'editor.cursorBlinking': 'smooth',
	'editor.cursorSmoothCaretAnimation': 'on',
	'editor.smoothScrolling': true,
	'editor.hover.delay': 100,
	'editor.inlineSuggest.showToolbar': 'always',
	'editor.suggest.showStatusBar': true,
	'scm.diffDecorations': 'gutter',
	'git.blame.editorDecoration.enabled': true,
	'diffEditor.hideUnchangedRegions.enabled': true,
	'diffEditor.experimental.showMoves': true,

	// Editing
	'editor.tabSize': 2,
	'editor.formatOnSave': true,
	'editor.formatOnPaste': true,
	'editor.wordWrap': 'bounded',
	'editor.wordWrapColumn': 120,
	'editor.linkedEditing': true,
	'editor.foldingImportsByDefault': true,
	'editor.dragAndDrop': false,
	'editor.copyWithSyntaxHighlighting': false,
	'editor.find.autoFindInSelection': 'multiline',
	'editor.autoClosingBrackets': 'always',
	'editor.autoClosingQuotes': 'always',
	'editor.wordSeparators': USUAL_WORD_SEPARATORS.replace('-', ''),
	'editor.suggest.insertMode': 'replace',
	'editor.suggest.localityBonus': true,
	'editor.suggest.matchOnWordStartOnly': false,
	'editor.acceptSuggestionOnCommitCharacter': false,
	'editor.tabCompletion': 'onlySnippets',
	'[rust]': {
		// The global tab size above would otherwise reach Rust, which has no language default.
		'editor.tabSize': 4,
		'editor.rulers': [100]
	},

	// TypeScript and JavaScript. The extension reads a unified `js/ts.*` key only when it carries a
	// user, workspace or language value and otherwise falls back to these legacy keys, so default
	// overrides of the unified keys would have no effect.
	'typescript.inlayHints.parameterNames.enabled': 'all',
	'javascript.inlayHints.parameterNames.enabled': 'all',
	'typescript.inlayHints.parameterNames.suppressWhenArgumentMatchesName': false,
	'javascript.inlayHints.parameterNames.suppressWhenArgumentMatchesName': false,
	'typescript.inlayHints.parameterTypes.enabled': true,
	'javascript.inlayHints.parameterTypes.enabled': true,
	'typescript.inlayHints.variableTypes.enabled': true,
	'javascript.inlayHints.variableTypes.enabled': true,
	'typescript.inlayHints.variableTypes.suppressWhenTypeMatchesName': false,
	'javascript.inlayHints.variableTypes.suppressWhenTypeMatchesName': false,
	'typescript.inlayHints.propertyDeclarationTypes.enabled': true,
	'javascript.inlayHints.propertyDeclarationTypes.enabled': true,
	'typescript.inlayHints.functionLikeReturnTypes.enabled': true,
	'javascript.inlayHints.functionLikeReturnTypes.enabled': true,
	'typescript.inlayHints.enumMemberValues.enabled': true,
	'typescript.updateImportsOnFileMove.enabled': 'always',
	'javascript.updateImportsOnFileMove.enabled': 'always',
	'typescript.preferences.autoImportSpecifierExcludeRegexes': ['^lodash$', '^node:test$'],
	'javascript.preferences.autoImportSpecifierExcludeRegexes': ['^lodash$', '^node:test$'],
	'typescript.preferences.preferTypeOnlyAutoImports': true,
	'typescript.tsserver.maxTsServerMemory': 4096,
	'typescript.enablePromptUseWorkspaceTsdk': true,

	// Files, search and explorer. Object values merge into the registered defaults.
	'files.eol': '\n',
	'files.defaultLanguage': 'typescript',
	'files.watcherExclude': {
		'**/node_modules/**': true,
		'**/.next/**': true,
		'**/dist/**': true,
		'**/build/**': true,
		'**/coverage/**': true,
		'**/.turbo/**': true,
		'**/target/**': true
	},
	'files.readonlyInclude': {
		'**/node_modules/**': true,
		'**/pnpm-lock.yaml': true,
		'**/package-lock.json': true,
		'**/yarn.lock': true,
		'**/bun.lock': true,
		'**/.next/**': true,
		'**/dist/**': true,
		'**/target/**': true
	},
	'search.smartCase': true,
	'search.showLineNumbers': true,
	'search.useParentIgnoreFiles': true,
	'search.seedWithNearestWord': true,
	'search.exclude': {
		'**/pnpm-lock.yaml': true,
		'**/package-lock.json': true,
		'**/yarn.lock': true,
		'**/bun.lock': true,
		'**/.next': true,
		'**/coverage': true,
		'**/target': true
	},
	'explorer.compactFolders': false,
	'explorer.incrementalNaming': 'smart',
	'explorer.fileNesting.enabled': true,
	'explorer.fileNesting.expand': false,
	'explorer.fileNesting.patterns': {
		'package.json': 'package-lock.json, pnpm-lock.yaml, yarn.lock, bun.lock, bun.lockb, .npmrc, .nvmrc, .node-version, pnpm-workspace.yaml',
		'*.ts': '${capture}.js, ${capture}.d.ts, ${capture}.test.ts, ${capture}.spec.ts',
		'*.tsx': '${capture}.ts, ${capture}.test.tsx, ${capture}.spec.tsx, ${capture}.stories.tsx, ${capture}.module.css, ${capture}.module.scss',
		'.env': '.env.*',
		'next.config.*': 'next-env.d.ts',
		'docker-compose.yml': 'docker-compose.*.yml, Dockerfile*, .dockerignore',
		'Dockerfile': 'Dockerfile.*, .dockerignore',
		'Cargo.toml': 'Cargo.lock'
	},
	'explorer.confirmDelete': false,
	'explorer.confirmDragAndDrop': false,

	// Terminal, debug, Markdown and Emmet
	'terminal.integrated.fontFamily': CODE_FONT_FAMILY,
	'terminal.integrated.fontSize': 14,
	'terminal.integrated.fontLigatures.enabled': true,
	'terminal.integrated.defaultProfile.osx': 'zsh',
	'terminal.integrated.scrollback': 10000,
	'terminal.integrated.copyOnSelection': true,
	'terminal.integrated.smoothScrolling': true,
	'terminal.integrated.confirmOnExit': 'hasChildProcesses',
	'debug.javascript.autoAttachFilter': 'onlyWithFlag',
	'debug.terminal.clearBeforeReusing': true,
	'debug.inlineValues': 'on',
	'markdown.preview.fontFamily': '\'Helvetica Neue\'',
	'markdown.preview.fontSize': 16,
	'markdown.preview.lineHeight': 1.5,
	'markdown.preview.typographer': true,
	'markdown.validate.enabled': true,
	'markdown.occurrencesHighlight.enabled': true,
	'markdown.updateLinksOnFileMove.enabled': 'always',
	'emmet.includeLanguages': { 'javascript': 'javascriptreact' },
	'emmet.triggerExpansionOnTab': true,
	'emmet.showSuggestionsAsSnippets': true,
	'emmet.useInlineCompletions': true,
	'emmet.syntaxProfiles': {
		'javascriptreact': { 'self_closing_tag': 'xhtml', 'attr_quotes': 'double' },
		'typescriptreact': { 'self_closing_tag': 'xhtml', 'attr_quotes': 'double' }
	},
	'emmet.preferences': {
		'css.floatUnit': 'rem',
		'profile.allowCompactBoolean': true,
		'bem.modifierSeparator': '--'
	}
});

/**
 * Registers {@link PRODUCT_DEFAULT_OVERRIDES} as default overrides of the given registry, without
 * caching them: the workbench would otherwise prefer a cached copy at the next start.
 */
export function registerProductDefaults(registry: Pick<IConfigurationRegistry, 'registerDefaultConfigurations'>): void {
	registry.registerDefaultConfigurations([{ overrides: PRODUCT_DEFAULT_OVERRIDES, donotCache: true }]);
}
