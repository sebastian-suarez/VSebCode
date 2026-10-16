/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../base/test/common/utils.js';
import { getFontSize } from '../../common/fontConfiguration.js';
import { TestConfigurationService } from './testConfigurationService.js';

suite('Workbench font configuration', () => {
	const store = ensureNoDisposablesAreLeakedInTestSuite();
	test('region inheritance uses current configuration independently of listener ordering', async () => {
		const configuration = new TestConfigurationService();
		store.add(configuration.onDidChangeConfigurationEmitter);
		const key = 'workbench.sideBar.experimental.fontSize';
		assert.equal(getFontSize(configuration, key, 13), 13);
		await configuration.setUserConfiguration('workbench.experimental.fontSize', 18);
		assert.deepStrictEqual([getFontSize(configuration, key, 13), getFontSize(configuration, 'workbench.statusBar.experimental.fontSize', 12)], [18, 12 * 18 / 13]);
		await configuration.setUserConfiguration(key, 14);
		assert.equal(getFontSize(configuration, key, 13), 14);
		await configuration.setUserConfiguration(key, undefined);
		await configuration.setUserConfiguration('workbench.experimental.fontSize', 10);
		assert.equal(getFontSize(configuration, key, 13), 10);
		await configuration.setUserConfiguration(key, Number.NaN);
		assert.equal(getFontSize(configuration, key, 13), 10);
		await configuration.setUserConfiguration(key, 100);
		assert.equal(getFontSize(configuration, key, 13), 32);
	});
});
