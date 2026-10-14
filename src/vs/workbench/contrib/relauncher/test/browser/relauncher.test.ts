/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { DisposableStore } from '../../../../../base/common/lifecycle.js';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../../base/test/common/utils.js';
import { ConfigurationTarget } from '../../../../../platform/configuration/common/configuration.js';
import { TestConfigurationService } from '../../../../../platform/configuration/test/common/testConfigurationService.js';
import { IDialogService } from '../../../../../platform/dialogs/common/dialogs.js';
import { IProductService } from '../../../../../platform/product/common/productService.js';
import { IHostService } from '../../../../services/host/browser/host.js';
import { SettingsChangeRelauncher } from '../../browser/relauncher.contribution.js';

suite('SettingsChangeRelauncher', () => {

	const disposables = new DisposableStore();

	let restartCount: number;
	let confirmResult: boolean;
	let confirmCount: number;

	function createRelauncher(initialConfiguration: Record<string, unknown>): TestConfigurationService {
		// `update()` reads `config.window.titleBarStyle` unconditionally on native, so
		// the `window` object must always be present on the configuration root.
		initialConfiguration.window ??= {};
		const configurationService = new TestConfigurationService(initialConfiguration);

		const hostService = { hasFocus: true, restart: async () => { restartCount++; } } as Partial<IHostService> as IHostService;
		const dialogService = { confirm: async () => { confirmCount++; return { confirmed: confirmResult }; } } as Partial<IDialogService> as IDialogService;
		const productService = { nameLong: 'Test Product' } as Partial<IProductService> as IProductService;

		disposables.add(new SettingsChangeRelauncher(hostService, configurationService, productService, dialogService));

		return configurationService;
	}

	function fireChange(configurationService: TestConfigurationService, key: string, source = ConfigurationTarget.USER): void {
		configurationService.onDidChangeConfigurationEmitter.fire({
			source,
			affectedKeys: new Set([key]),
			change: { keys: [key], overrides: [] },
			affectsConfiguration: (configuration: string) => configuration === key,
		});
	}

	async function changeSetting<T extends Record<string, unknown>>(key: string, createConfiguration: () => T, applyChange: (configuration: T) => void, source = ConfigurationTarget.USER): Promise<void> {
		const configuration = createConfiguration();
		const configurationService = createRelauncher(configuration);

		applyChange(configuration);
		fireChange(configurationService, key, source);
		await Promise.resolve();
	}

	setup(() => {
		restartCount = 0;
		confirmCount = 0;
		confirmResult = false;
	});

	teardown(() => {
		disposables.clear();
	});

	test('prompts to restart when telemetry.feedback.enabled changes', async () => {
		confirmResult = true;
		await changeSetting(
			'telemetry.feedback.enabled',
			() => ({ telemetry: { feedback: { enabled: true } } }),
			c => c.telemetry.feedback.enabled = false);

		assert.strictEqual(confirmCount, 1, 'should prompt to restart');
		assert.strictEqual(restartCount, 1, 'should restart when confirmed');
	});

	test('does not prompt to restart when an unrelated setting changes', async () => {
		confirmResult = true;
		await changeSetting(
			'editor.fontSize',
			() => ({ editor: { fontSize: 12 } }),
			c => c.editor.fontSize = 14);

		assert.strictEqual(confirmCount, 0, 'should not prompt to restart');
		assert.strictEqual(restartCount, 0, 'should not restart');
	});

	test('does not restart when the confirmation is declined', async () => {
		confirmResult = false;
		await changeSetting(
			'telemetry.feedback.enabled',
			() => ({ telemetry: { feedback: { enabled: true } } }),
			c => c.telemetry.feedback.enabled = false);

		assert.strictEqual(confirmCount, 1, 'should prompt to restart');
		assert.strictEqual(restartCount, 0, 'should not restart when declined');
	});

	test('does not prompt when only the default value changes', async () => {
		confirmResult = true;
		await changeSetting(
			'telemetry.feedback.enabled',
			() => ({ telemetry: { feedback: { enabled: true } } }),
			c => c.telemetry.feedback.enabled = false,
			ConfigurationTarget.DEFAULT);

		assert.strictEqual(confirmCount, 0, 'should not prompt for default changes');
		assert.strictEqual(restartCount, 0);
	});

	ensureNoDisposablesAreLeakedInTestSuite();
});
