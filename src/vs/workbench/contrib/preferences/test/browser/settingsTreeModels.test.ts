/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../../base/test/common/utils.js';
import { settingKeyToDisplayFormat, parseQuery, IParsedQuery, sanitizeId, SearchResultModel, SearchResultIdx, ISettingsEditorViewState, SettingsTreeSettingElement, SettingsTreeModel } from '../../browser/settingsTreeModels.js';
import { mock } from '../../../../../base/test/common/mock.js';
import { ILanguageService } from '../../../../../editor/common/languages/language.js';
import { ConfigurationTarget } from '../../../../../platform/configuration/common/configuration.js';
import { ConfigurationScope } from '../../../../../platform/configuration/common/configurationRegistry.js';
import { TestConfigurationService } from '../../../../../platform/configuration/test/common/testConfigurationService.js';
import { TestInstantiationService } from '../../../../../platform/instantiation/test/common/instantiationServiceMock.js';
import { IProductService } from '../../../../../platform/product/common/productService.js';
import { IWorkbenchConfigurationService } from '../../../../services/configuration/common/configuration.js';
import { IWorkbenchEnvironmentService } from '../../../../services/environment/common/environmentService.js';
import { ISetting, SettingMatchType } from '../../../../services/preferences/common/preferences.js';
import { IUserDataProfileService } from '../../../../services/userDataProfile/common/userDataProfile.js';
import { TestProductService, TestUserDataProfileService } from '../../../../test/common/workbenchTestServices.js';

suite('SettingsTree deprecation warnings', () => {
	const store = ensureNoDisposablesAreLeakedInTestSuite();

	for (const search of [false, true]) {
		test(`keeps opted-in warnings visible without exposing unconfigured deprecated settings (search=${search})`, async () => {
			const instantiationService = store.add(new TestInstantiationService());
			const configuration = new class extends TestConfigurationService {
				isSettingAppliedForAllProfiles(): boolean { return false; }
			}({ 'test.configured': true });
			store.add(configuration.onDidChangeConfigurationEmitter);
			instantiationService.stub(IWorkbenchConfigurationService, configuration);
			instantiationService.stub(ILanguageService, { isRegisteredLanguageId: () => true });
			instantiationService.stub(IUserDataProfileService, new TestUserDataProfileService());
			instantiationService.stub(IProductService, TestProductService);
			instantiationService.stub(IWorkbenchEnvironmentService, {});
			const viewState: ISettingsEditorViewState = { settingsTarget: ConfigurationTarget.USER_LOCAL };
			const model = store.add(search
				? instantiationService.createInstance(SearchResultModel, viewState, null, true)
				: instantiationService.createInstance(SettingsTreeModel, viewState, true));
			const settings = ['test.upcoming', 'test.deprecated', 'test.configured', 'test.explicitlyHidden', 'test.normal'].map(key => new class extends mock<ISetting>() {
				override key = key;
				override type = 'boolean';
				override description = [];
				override scope = ConfigurationScope.RESOURCE;
				override deprecationMessage = key === 'test.normal' ? undefined : 'This setting will be deprecated soon.';
				override deprecationMessageShowInSettings = key === 'test.upcoming' ? true : key === 'test.explicitlyHidden' ? false : undefined;
			}());
			const update = () => {
				if (model instanceof SearchResultModel) {
					model.setResult(SearchResultIdx.Local, {
						filterMatches: settings.map(setting => ({ setting, matches: [], matchType: SettingMatchType.None, keyMatchScore: 0, score: 0 })),
						exactMatch: false,
					});
				} else {
					model.update({ id: 'deprecationWarnings', label: '', settings });
				}
			};
			const visible = () => model.root.children
				.filter((child): child is SettingsTreeSettingElement => child instanceof SettingsTreeSettingElement)
				.map(child => ({ key: child.setting.key, warning: child.setting.deprecationMessage }));
			update();
			const initial = visible();
			await configuration.setUserConfiguration('test.configured', undefined);
			update();
			assert.deepStrictEqual({ initial, reset: visible() }, {
				initial: [
					{ key: 'test.upcoming', warning: 'This setting will be deprecated soon.' },
					{ key: 'test.configured', warning: 'This setting will be deprecated soon.' },
					{ key: 'test.normal', warning: undefined },
				],
				reset: [
					{ key: 'test.upcoming', warning: 'This setting will be deprecated soon.' },
					{ key: 'test.normal', warning: undefined },
				],
			});
		});
	}
});

suite('SettingsTree search results', () => {
	const store = ensureNoDisposablesAreLeakedInTestSuite();

	function createModel() {
		const configuration = new class extends TestConfigurationService {
			isSettingAppliedForAllProfiles(): boolean { return false; }
		}();
		store.add(configuration.onDidChangeConfigurationEmitter);
		const instantiationService = store.add(new TestInstantiationService());
		instantiationService.stub(IWorkbenchConfigurationService, configuration);
		instantiationService.stub(ILanguageService, { isRegisteredLanguageId: () => true });
		instantiationService.stub(IUserDataProfileService, new TestUserDataProfileService());
		instantiationService.stub(IProductService, TestProductService);
		instantiationService.stub(IWorkbenchEnvironmentService, {});
		return store.add(instantiationService.createInstance(SearchResultModel,
			{ settingsTarget: ConfigurationTarget.USER_LOCAL, query: 'test' }, null, true));
	}

	function createMatch(key: string) {
		return {
			setting: new class extends mock<ISetting>() {
				override key = key;
				override type = 'boolean';
				override description = [];
				override scope = ConfigurationScope.APPLICATION;
			}(),
			matches: [], matchType: SettingMatchType.RemoteMatch, keyMatchScore: 0, score: 0,
		};
	}

	test('refreshes after local results are cleared', () => {
		const model = createModel();
		model.setResult(SearchResultIdx.Local, { filterMatches: [createMatch('test.local')], exactMatch: true });
		model.setResult(SearchResultIdx.Local, null);
		model.updateChildren();

		assert.deepStrictEqual({
			results: model.getUniqueSearchResults(),
			count: model.getUniqueResultsCount(),
		}, { results: { filterMatches: [], exactMatch: false }, count: 0 });
	});

	test('retains remote results without local results', () => {
		const model = createModel();
		const match = createMatch('test.remote');
		model.setResult(SearchResultIdx.Local, null);
		model.setResult(SearchResultIdx.Remote, { filterMatches: [match], exactMatch: false });
		model.updateChildren();

		assert.deepStrictEqual({
			results: model.getUniqueSearchResults(),
			keys: model.root.children.map(child => child instanceof SettingsTreeSettingElement ? child.setting.key : child.id),
			count: model.getUniqueResultsCount(),
		}, { results: { filterMatches: [match], exactMatch: false }, keys: ['test.remote'], count: 1 });
	});

	test('preserves local exact matches and remote deduplication', () => {
		const model = createModel();
		const localMatch = createMatch('test.local');
		const remoteMatch = createMatch('test.remote');
		model.setResult(SearchResultIdx.Local, { filterMatches: [localMatch], exactMatch: true });
		model.setResult(SearchResultIdx.Remote, { filterMatches: [localMatch, remoteMatch], exactMatch: false });

		assert.deepStrictEqual(model.getUniqueSearchResults(), {
			filterMatches: [localMatch, remoteMatch],
			exactMatch: true,
		});
	});
});

suite('SettingsTree', () => {
	test('settingKeyToDisplayFormat', () => {
		assert.deepStrictEqual(
			settingKeyToDisplayFormat('foo.bar'),
			{
				category: 'Foo',
				label: 'Bar'
			});

		assert.deepStrictEqual(
			settingKeyToDisplayFormat('foo.bar.etc'),
			{
				category: 'Foo › Bar',
				label: 'Etc'
			});

		assert.deepStrictEqual(
			settingKeyToDisplayFormat('fooBar.etcSomething'),
			{
				category: 'Foo Bar',
				label: 'Etc Something'
			});

		assert.deepStrictEqual(
			settingKeyToDisplayFormat('foo'),
			{
				category: '',
				label: 'Foo'
			});

		assert.deepStrictEqual(
			settingKeyToDisplayFormat('foo.1leading.number'),
			{
				category: 'Foo › 1leading',
				label: 'Number'
			});

		assert.deepStrictEqual(
			settingKeyToDisplayFormat('foo.1Leading.number'),
			{
				category: 'Foo › 1 Leading',
				label: 'Number'
			});
	});

	test('settingKeyToDisplayFormat - with category', () => {
		assert.deepStrictEqual(
			settingKeyToDisplayFormat('foo.bar', 'foo'),
			{
				category: '',
				label: 'Bar'
			});

		assert.deepStrictEqual(
			settingKeyToDisplayFormat('disableligatures.ligatures', 'disableligatures'),
			{
				category: '',
				label: 'Ligatures'
			});

		assert.deepStrictEqual(
			settingKeyToDisplayFormat('foo.bar.etc', 'foo'),
			{
				category: 'Bar',
				label: 'Etc'
			});

		assert.deepStrictEqual(
			settingKeyToDisplayFormat('fooBar.etcSomething', 'foo'),
			{
				category: 'Foo Bar',
				label: 'Etc Something'
			});

		assert.deepStrictEqual(
			settingKeyToDisplayFormat('foo.bar.etc', 'foo/bar'),
			{
				category: '',
				label: 'Etc'
			});

		assert.deepStrictEqual(
			settingKeyToDisplayFormat('foo.bar.etc', 'something/foo'),
			{
				category: 'Bar',
				label: 'Etc'
			});

		assert.deepStrictEqual(
			settingKeyToDisplayFormat('bar.etc', 'something.bar'),
			{
				category: '',
				label: 'Etc'
			});

		assert.deepStrictEqual(
			settingKeyToDisplayFormat('fooBar.etc', 'fooBar'),
			{
				category: '',
				label: 'Etc'
			});


		assert.deepStrictEqual(
			settingKeyToDisplayFormat('fooBar.somethingElse.etc', 'fooBar'),
			{
				category: 'Something Else',
				label: 'Etc'
			});
	});

	test('settingKeyToDisplayFormat - known acronym/term', () => {
		assert.deepStrictEqual(
			settingKeyToDisplayFormat('css.someCssSetting'),
			{
				category: 'CSS',
				label: 'Some CSS Setting'
			});

		assert.deepStrictEqual(
			settingKeyToDisplayFormat('powershell.somePowerShellSetting'),
			{
				category: 'PowerShell',
				label: 'Some PowerShell Setting'
			});

		assert.deepStrictEqual(
			settingKeyToDisplayFormat('ocaml.server.extendedHover'),
			{
				category: 'OCaml › Server',
				label: 'Extended Hover'
			});
	});

	test('parseQuery', () => {
		function testParseQuery(input: string, expected: IParsedQuery) {
			assert.deepStrictEqual(
				parseQuery(input),
				expected,
				input
			);
		}

		testParseQuery(
			'',
			<IParsedQuery>{
				tags: [],
				extensionFilters: [],
				query: '',
				featureFilters: [],
				idFilters: [],
				languageFilter: undefined
			});

		testParseQuery(
			'@modified',
			<IParsedQuery>{
				tags: ['modified'],
				extensionFilters: [],
				query: '',
				featureFilters: [],
				idFilters: [],
				languageFilter: undefined
			});

		testParseQuery(
			'@tag:foo',
			<IParsedQuery>{
				tags: ['foo'],
				extensionFilters: [],
				query: '',
				featureFilters: [],
				idFilters: [],
				languageFilter: undefined
			});

		testParseQuery(
			'@modified foo',
			<IParsedQuery>{
				tags: ['modified'],
				extensionFilters: [],
				query: 'foo',
				featureFilters: [],
				idFilters: [],
				languageFilter: undefined
			});

		testParseQuery(
			'@tag:foo @modified',
			<IParsedQuery>{
				tags: ['foo', 'modified'],
				extensionFilters: [],
				query: '',
				featureFilters: [],
				idFilters: [],
				languageFilter: undefined
			});

		testParseQuery(
			'@tag:foo @modified my query',
			<IParsedQuery>{
				tags: ['foo', 'modified'],
				extensionFilters: [],
				query: 'my query',
				featureFilters: [],
				idFilters: [],
				languageFilter: undefined
			});

		testParseQuery(
			'test @modified query',
			<IParsedQuery>{
				tags: ['modified'],
				extensionFilters: [],
				query: 'test  query',
				featureFilters: [],
				idFilters: [],
				languageFilter: undefined
			});

		testParseQuery(
			'test @modified',
			<IParsedQuery>{
				tags: ['modified'],
				extensionFilters: [],
				query: 'test',
				featureFilters: [],
				idFilters: [],
				languageFilter: undefined
			});

		testParseQuery(
			'query has @ for some reason',
			<IParsedQuery>{
				tags: [],
				extensionFilters: [],
				query: 'query has @ for some reason',
				featureFilters: [],
				idFilters: [],
				languageFilter: undefined
			});

		testParseQuery(
			'@ext:github.vscode-pull-request-github',
			<IParsedQuery>{
				tags: [],
				extensionFilters: ['github.vscode-pull-request-github'],
				query: '',
				featureFilters: [],
				idFilters: [],
				languageFilter: undefined
			});

		testParseQuery(
			'@ext:github.vscode-pull-request-github,vscode.git',
			<IParsedQuery>{
				tags: [],
				extensionFilters: ['github.vscode-pull-request-github', 'vscode.git'],
				query: '',
				featureFilters: [],
				idFilters: [],
				languageFilter: undefined
			});
		testParseQuery(
			'@feature:scm',
			<IParsedQuery>{
				tags: [],
				extensionFilters: [],
				featureFilters: ['scm'],
				query: '',
				idFilters: [],
				languageFilter: undefined
			});

		testParseQuery(
			'@feature:scm,terminal',
			<IParsedQuery>{
				tags: [],
				extensionFilters: [],
				featureFilters: ['scm', 'terminal'],
				query: '',
				idFilters: [],
				languageFilter: undefined
			});
		testParseQuery(
			'@id:files.autoSave',
			<IParsedQuery>{
				tags: [],
				extensionFilters: [],
				featureFilters: [],
				query: '',
				idFilters: ['files.autoSave'],
				languageFilter: undefined
			});

		testParseQuery(
			'@id:files.autoSave,terminal.integrated.commandsToSkipShell',
			<IParsedQuery>{
				tags: [],
				extensionFilters: [],
				featureFilters: [],
				query: '',
				idFilters: ['files.autoSave', 'terminal.integrated.commandsToSkipShell'],
				languageFilter: undefined
			});

		testParseQuery(
			'@lang:cpp',
			<IParsedQuery>{
				tags: [],
				extensionFilters: [],
				featureFilters: [],
				query: '',
				idFilters: [],
				languageFilter: 'cpp'
			});

		testParseQuery(
			'@lang:cpp,python',
			<IParsedQuery>{
				tags: [],
				extensionFilters: [],
				featureFilters: [],
				query: '',
				idFilters: [],
				languageFilter: 'cpp'
			});
	});

	test('sanitizeId replaces all dots and slashes', () => {
		assert.deepStrictEqual(
			[
				sanitizeId('root.editor.font.size'),
				sanitizeId('group/subgroup/setting.key'),
				sanitizeId('no-special-chars'),
				sanitizeId('single.dot'),
			],
			[
				'root_editor_font_size',
				'group_subgroup_setting_key',
				'no-special-chars',
				'single_dot',
			]
		);
	});

	ensureNoDisposablesAreLeakedInTestSuite();
});
