/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../base/test/common/utils.js';
import { matchesBrowserViewGroupFilter } from '../../common/browserViewGroup.js';

suite('BrowserViewGroup', () => {
	ensureNoDisposablesAreLeakedInTestSuite();

	test('matches browser IDs', () => {
		assert.deepStrictEqual({
			browserId: matchesBrowserViewGroupFilter('browser', { browserIds: ['browser', 'other'] }),
			otherBrowserId: matchesBrowserViewGroupFilter('browser', { browserIds: ['other'] }),
			noFilter: matchesBrowserViewGroupFilter('browser', {}),
		}, {
			browserId: true,
			otherBrowserId: false,
			noFilter: false,
		});
	});
});
