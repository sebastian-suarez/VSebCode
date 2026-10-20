/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../../base/test/common/utils.js';
import { USUAL_WORD_SEPARATORS } from '../../../../../editor/common/core/wordHelper.js';
import { Extensions, IConfigurationDefaults, IConfigurationNode, IConfigurationRegistry, OVERRIDE_PROPERTY_REGEX, overrideIdentifiersFromKey } from '../../../../../platform/configuration/common/configurationRegistry.js';
import { Registry } from '../../../../../platform/registry/common/platform.js';
import { PRODUCT_DEFAULT_OVERRIDES, registerProductDefaults } from '../../common/productDefaults.js';

const CODE_FONT_FAMILY = '\'Liga SFMono Nerd Font\', \'SF Mono\', Menlo, Monaco, \'Courier New\', monospace';

suite('Product defaults', () => {

	ensureNoDisposablesAreLeakedInTestSuite();

	test('the table matches the step 2 plan', () => {
		assert.deepStrictEqual(PRODUCT_DEFAULT_OVERRIDES, {
			'workbench.activityBar.location': 'hidden',
			'workbench.editor.showTabs': 'none',
			'window.commandCenter': false,
			'workbench.layoutControl.enabled': false,
			'workbench.editor.enablePreview': false,
			'accessibility.dimUnfocused.enabled': true,
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
			'editor.wordSeparators': '`~!@#$%^&*()=+[{]}\\|;:\'",.<>/?',
			'editor.suggest.insertMode': 'replace',
			'editor.suggest.localityBonus': true,
			'editor.suggest.matchOnWordStartOnly': false,
			'editor.acceptSuggestionOnCommitCharacter': false,
			'editor.tabCompletion': 'onlySnippets',
			'[rust]': { 'editor.tabSize': 4, 'editor.rulers': [100] },
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
	});

	test('the table leaves out unified TypeScript keys, settings the main process reads and removed surfaces', () => {
		const keys = Object.keys(PRODUCT_DEFAULT_OVERRIDES);
		const removedSurfacePrefixes = ['chat.', 'inlineChat.', 'mcp.', 'telemetry.', 'update.', 'settingsSync.', 'workbench.cloudChanges.', 'remote.tunnels.', 'github.', 'github-enterprise.', 'microsoft-authentication.', 'accessibility.voice.'];
		assert.deepStrictEqual({
			unified: keys.filter(key => key.startsWith('js/ts.')),
			readByMain: keys.filter(key => ['files.hotExit', 'window.newWindowProfile', 'window.glass'].includes(key)),
			removed: keys.filter(key => key === 'workbench.enableExperiments' || removedSurfacePrefixes.some(prefix => key.startsWith(prefix))),
			frozen: Object.isFrozen(PRODUCT_DEFAULT_OVERRIDES),
			wordSeparators: PRODUCT_DEFAULT_OVERRIDES['editor.wordSeparators'] === USUAL_WORD_SEPARATORS.replace('-', '') && USUAL_WORD_SEPARATORS.includes('-'),
		}, {
			unified: [],
			readByMain: [],
			removed: [],
			frozen: true,
			wordSeparators: true,
		});
	});
});

suite('Product defaults registration', () => {

	ensureNoDisposablesAreLeakedInTestSuite();

	test('registers the table once, as uncached default overrides', () => {
		const calls: IConfigurationDefaults[][] = [];
		registerProductDefaults({ registerDefaultConfigurations: defaults => calls.push(defaults) });

		assert.deepStrictEqual({
			calls,
			sameTable: calls[0]?.[0]?.overrides === PRODUCT_DEFAULT_OVERRIDES
		}, {
			calls: [[{ overrides: PRODUCT_DEFAULT_OVERRIDES, donotCache: true }]],
			sameTable: true
		});
	});

	// The registry class is not exported and constructing one registers a JSON schema globally, so
	// these tests use the global registry with keys of their own and remove them again.
	const registry = Registry.as<IConfigurationRegistry>(Extensions.Configuration);

	test('an object override merges into the default of a setting registered before it', () => {
		const node: IConfigurationNode = { id: 'productDefaultsTest', properties: { 'productDefaultsTest.object': { type: 'object', default: { upstream: true } } } };
		const defaults: IConfigurationDefaults = { overrides: { 'productDefaultsTest.object': { fork: true } } };
		registry.registerConfiguration(node);
		registry.registerDefaultConfigurations([defaults]);
		try {
			assert.deepStrictEqual(registry.getConfigurationProperties()['productDefaultsTest.object'].default, { upstream: true, fork: true });
		} finally {
			registry.deregisterDefaultConfigurations([defaults]);
			registry.deregisterConfigurations([node]);
		}
	});

	test('a setting registered after the override takes it as its default, as built-in extension settings do', () => {
		const defaults: IConfigurationDefaults = { overrides: { 'productDefaultsTest.later': 'fork' } };
		const node: IConfigurationNode = { id: 'productDefaultsTest', properties: { 'productDefaultsTest.later': { type: 'string', default: 'upstream' } } };
		registry.registerDefaultConfigurations([defaults]);
		registry.registerConfiguration(node);
		try {
			assert.strictEqual(registry.getConfigurationProperties()['productDefaultsTest.later'].default, 'fork');
		} finally {
			registry.deregisterConfigurations([node]);
			registry.deregisterDefaultConfigurations([defaults]);
		}
	});

	test('the registry reads the [rust] block as a language override', () => {
		// Registering it for real would leave the rust identifier in the global registry, which has no
		// way to remove one, so this checks the classification the registry applies to the key.
		const languageKeys = Object.keys(PRODUCT_DEFAULT_OVERRIDES).filter(key => OVERRIDE_PROPERTY_REGEX.test(key));
		assert.deepStrictEqual(languageKeys.map(key => overrideIdentifiersFromKey(key)), [['rust']]);
	});
});
