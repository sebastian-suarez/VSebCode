/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../base/test/common/utils.js';
import { isLoopbackHost, parseAuthorityWithPort } from '../../common/remoteHosts.js';

suite('remoteHosts', () => {

	ensureNoDisposablesAreLeakedInTestSuite();

	test('parseAuthority hostname', () => {
		assert.deepStrictEqual(parseAuthorityWithPort('localhost:8080'), { host: 'localhost', port: 8080 });
	});

	test('parseAuthority ipv4', () => {
		assert.deepStrictEqual(parseAuthorityWithPort('127.0.0.1:8080'), { host: '127.0.0.1', port: 8080 });
	});

	test('parseAuthority ipv6', () => {
		assert.deepStrictEqual(parseAuthorityWithPort('[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:8080'), { host: '[2001:0db8:85a3:0000:0000:8a2e:0370:7334]', port: 8080 });
	});

	test('isLoopbackHost', () => {
		// loopback hosts
		assert.strictEqual(isLoopbackHost('localhost'), true);
		assert.strictEqual(isLoopbackHost('LOCALHOST'), true);
		assert.strictEqual(isLoopbackHost('127.0.0.1'), true);
		assert.strictEqual(isLoopbackHost('::1'), true);
		assert.strictEqual(isLoopbackHost('[::1]'), true);

		// non-loopback hosts
		assert.strictEqual(isLoopbackHost('evil.com'), false);
		assert.strictEqual(isLoopbackHost('192.168.0.1'), false);
		assert.strictEqual(isLoopbackHost('10.0.0.1'), false);
		assert.strictEqual(isLoopbackHost('[2001:0db8:85a3:0000:0000:8a2e:0370:7334]'), false);
	});

});
