/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { ITreeNode } from '../../../../../base/browser/ui/tree/tree.js';
import { ToolBar } from '../../../../../base/browser/ui/toolbar/toolbar.js';
import { IAction } from '../../../../../base/common/actions.js';
import { Disposable, toDisposable } from '../../../../../base/common/lifecycle.js';
import { URI } from '../../../../../base/common/uri.js';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../../base/test/common/utils.js';
import { ConfigurationTarget, IConfigurationOverrides, IConfigurationValue } from '../../../../../platform/configuration/common/configuration.js';
import { ConfigurationScope } from '../../../../../platform/configuration/common/configurationRegistry.js';
import { TestConfigurationService } from '../../../../../platform/configuration/test/common/testConfigurationService.js';
import { ISetting } from '../../../../services/preferences/common/preferences.js';
import { SettingsTarget } from '../../browser/preferencesWidgets.js';
import { AbstractSettingRenderer, ISettingChangeEvent, SettingTreeRenderers } from '../../browser/settingsTree.js';
import { SettingsTreeElement, SettingsTreeGroupElement, SettingsTreeModel, SettingsTreeSettingElement } from '../../browser/settingsTreeModels.js';
import { APPLY_ALL_PROFILES_SETTING } from '../../../../services/configuration/common/configuration.js';
import { mock } from '../../../../../base/test/common/mock.js';
import { workbenchInstantiationService } from '../../../../test/browser/workbenchTestServices.js';

class TestSettingRenderer extends AbstractSettingRenderer {
	readonly templateId = 'test';
	toolbarDisposed = false;

	constructor() {
		super(
			[],
			(_setting: ISetting, _settingTarget: SettingsTarget): IAction[] => [],
			undefined!,
			undefined!,
			undefined!,
			{
				createInstance: () => ({
					dispose() { },
					updateScopeOverrides() { },
					updateWorkspaceTrust() { },
					updateDefaultOverrideIndicator() { },
					updatePreviewIndicator() { },
					updateAdvancedIndicator() { },
				})
			} as never,
			undefined!,
			undefined!,
			undefined!,
			new TestConfigurationService(),
			undefined!,
			undefined!,
			undefined!,
			undefined!,
			{ setupDelayedHover: () => Disposable.None } as never,
			undefined!,
		);
	}

	renderTemplate(container: HTMLElement) {
		return this.renderCommonTemplate(undefined, container, 'test');
	}

	renderElement(element: ITreeNode<SettingsTreeSettingElement, never>, index: number, templateData: unknown): void {
		this.renderSettingElement(element, index, templateData as never);
	}

	protected override renderSettingToolbar(_container: HTMLElement): ToolBar {
		return {
			setActions() { },
			dispose: () => this.toolbarDisposed = true
		} as unknown as ToolBar;
	}

	protected renderValue(): void {
	}
}

function createSettingElement(deprecationMessageSeverity: 'warning' | 'info'): SettingsTreeSettingElement {
	const element = new SettingsTreeSettingElement(
		{
			key: 'test.setting',
			type: 'string',
			description: [],
			deprecationMessage: 'Deprecated setting',
			deprecationMessageSeverity,
		} as unknown as ISetting,
		new SettingsTreeGroupElement('test', undefined, 'Test', 0, false),
		ConfigurationTarget.USER_LOCAL,
		true,
		undefined,
		undefined!,
		{ extensionRecommendations: undefined } as never,
		{ currentProfile: { isDefault: true } } as never,
		new TestConfigurationService() as unknown as never,
	);
	element.inspectSelf = () => { };
	return element;
}

suite('SettingsTree renderer', () => {
	const store = ensureNoDisposablesAreLeakedInTestSuite();

	suite('array overrides', () => {
		function renderArray(settingsTarget: SettingsTarget, defaultValue: string[]) {
			const key = 'terminal.integrated.commandsToSkipShell';
			const userValue = [...defaultValue, '-workbench.action.quickOpen'];
			const defaults = new TestConfigurationService({ [key]: defaultValue });
			const scoped = new TestConfigurationService({ [key]: userValue });
			const configuration = new class extends TestConfigurationService {
				isSettingAppliedForAllProfiles(): boolean { return false; }
				override inspect<T>(key: string, overrides?: IConfigurationOverrides): IConfigurationValue<T> {
					const inspected = super.inspect<T>(key, overrides);
					const defaultValue = defaults.getValue<T>(key);
					const scopedValue = scoped.getValue<T>(key);
					return {
						...inspected,
						defaultValue,
						workspaceValue: settingsTarget === ConfigurationTarget.WORKSPACE ? scopedValue : undefined,
						workspaceFolderValue: URI.isUri(settingsTarget) ? scopedValue : undefined,
						value: scopedValue ?? inspected.userValue ?? defaultValue,
					};
				}
			}({ [key]: userValue, [APPLY_ALL_PROFILES_SETTING]: [] });
			for (const service of [defaults, scoped, configuration]) {
				store.add(service.onDidChangeConfigurationEmitter);
			}
			const instantiationService = workbenchInstantiationService({ configurationService: () => configuration }, store);
			const model = store.add(instantiationService.createInstance(SettingsTreeModel, { settingsTarget }, true));
			model.update({
				id: 'test', label: 'Test',
				settings: [new class extends mock<ISetting>() {
					override key = key;
					override type = 'array';
					override arrayItemType = 'string';
					override description = [];
					override scope = ConfigurationScope.RESOURCE;
				}()],
			});
			const element = model.getElementsByName(key)![0];
			const renderers = store.add(instantiationService.createInstance(SettingTreeRenderers));
			const renderer = renderers.allRenderers.find(renderer => renderer.templateId === 'settings.array.template')!;
			const container = document.createElement('div');
			const template = renderer.renderTemplate(container);
			store.add(toDisposable(() => renderer.disposeTemplate(template)));
			const node = new class extends mock<ITreeNode<SettingsTreeElement, never>>() { override element = element; }();
			renderer.renderElement(node, 0, template);
			const changes: Pick<ISettingChangeEvent, 'value' | 'manualReset'>[] = [];
			store.add(renderers.onDidChangeSetting(({ value, manualReset }) => changes.push({ value, manualReset })));
			const removeLastItem = () => {
				const remove = Array.from(container.querySelectorAll<HTMLElement>('[aria-label="Remove Item"]')).at(-1);
				assert.ok(remove, 'The array item must be removable');
				remove.click();
			};
			return { changes, removeLastItem };
		}

		for (const { name, target, expected } of [
			{ name: 'Workspace', target: ConfigurationTarget.WORKSPACE, expected: [] },
			{ name: 'Folder', target: URI.file('/workspace'), expected: [] },
			{ name: 'User', target: ConfigurationTarget.USER_LOCAL, expected: undefined },
		] as const) {
			test(`clearing a configured array respects the ${name} target`, () => {
				const { changes, removeLastItem } = renderArray(target, []);
				removeLastItem();
				assert.deepStrictEqual(changes, [{ value: expected, manualReset: false }]);
			});
		}
	});

	test('disposes the setting toolbar with its template', () => {
		const renderer = new TestSettingRenderer();
		const template = renderer.renderTemplate(document.createElement('div'));

		assert.strictEqual(renderer.toolbarDisposed, false);
		renderer.disposeTemplate(template);
		assert.strictEqual(renderer.toolbarDisposed, true);

		renderer.dispose();
	});

	test('renders an opted-in deprecation warning separately from the description', () => {
		const renderer = store.add(new TestSettingRenderer());
		const template = renderer.renderTemplate(document.createElement('div'));
		const element = store.add(createSettingElement('warning'));
		store.add(element.parent!);
		element.setting.deprecationMessage = 'This setting will be deprecated soon.';
		element.setting.deprecationMessageShowInSettings = true;

		try {
			renderer.renderElement({ element } as never, 0, template);
			const icon = template.deprecationWarningElement.firstElementChild;
			assert.deepStrictEqual({
				text: template.deprecationWarningElement.textContent,
				iconClasses: icon?.className,
				iconRole: icon?.getAttribute('role'),
				iconAriaLabel: icon?.getAttribute('aria-label'),
				isInfo: template.containerElement.classList.contains('is-deprecated-info'),
			}, {
				text: 'This setting will be deprecated soon.',
				iconClasses: 'codicon codicon-error',
				iconRole: 'img',
				iconAriaLabel: 'Warning',
				isInfo: false,
			});
		} finally {
			renderer.disposeTemplate(template);
		}
	});

	test('renders informational deprecation severity', () => {
		const renderer = new TestSettingRenderer();
		const template = renderer.renderTemplate(document.createElement('div'));
		const element = createSettingElement('info');

		renderer.renderElement({ element } as never, 0, template);

		const icon = template.deprecationWarningElement.firstElementChild;
		assert.deepStrictEqual({
			isDeprecated: template.containerElement.classList.contains('is-deprecated'),
			isDeprecatedInfo: template.containerElement.classList.contains('is-deprecated-info'),
			iconClasses: icon?.className,
			iconRole: icon?.getAttribute('role'),
			iconAriaLabel: icon?.getAttribute('aria-label'),
		}, {
			isDeprecated: true,
			isDeprecatedInfo: true,
			iconClasses: 'codicon codicon-info',
			iconRole: 'img',
			iconAriaLabel: 'Info',
		});

		renderer.disposeTemplate(template);
		element.parent?.dispose();
		element.dispose();
		renderer.dispose();
	});
});
