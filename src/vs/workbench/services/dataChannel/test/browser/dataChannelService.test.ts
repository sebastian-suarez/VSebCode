/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../../base/test/common/utils.js';
import { parseLinkPresentation } from '../../../../../platform/dataChannel/common/dataChannel.js';
import { linkPresentationProviderKinds } from '../../browser/dataChannelService.js';

suite('DataChannelService', () => {

	ensureNoDisposablesAreLeakedInTestSuite();

	test('link presentation contribution supports the pull request kind', () => {
		assert.ok(linkPresentationProviderKinds.includes('pullRequest'));
	});

	test('link presentation kinds exclude the removed session kind', () => {
		assert.deepStrictEqual(linkPresentationProviderKinds, ['resource', 'issue', 'pullRequest', 'commit', 'file', 'folder', 'repository', 'branch']);
		assert.throws(() => parseLinkPresentation({ kind: 'session' }), /Invalid link presentation payload/);
	});
});
