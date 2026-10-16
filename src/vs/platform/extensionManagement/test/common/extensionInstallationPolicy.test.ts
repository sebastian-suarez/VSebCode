/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { blockedServiceExtensions, checkExtensionInstallation } from '../../common/extensionInstallationPolicy.js';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../base/test/common/utils.js';

suite('Extension installation policy', () => {
	ensureNoDisposablesAreLeakedInTestSuite();
	test('service IDs are blocked case-insensitively, while generic tools and open clients remain available', () => {
		for (const id of blockedServiceExtensions) {
			assert.throws(() => checkExtensionInstallation(id.toUpperCase()), /installation/i);
		}
		for (const id of ['ms-python.python', 'ms-vscode.js-debug', 'ms-vscode.hexeditor', 'ms-azuretools.vscode-containers', 'ms-toolsai.jupyter', 'jeanp413.open-remote-ssh', 'jeanp413.open-remote-wsl']) {
			assert.doesNotThrow(() => checkExtensionInstallation(id));
		}
	});
});
