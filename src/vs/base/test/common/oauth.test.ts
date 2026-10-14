/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as assert from 'assert';
import { parseWWWAuthenticateHeader, scopesMatch } from '../../common/oauth.js';
import { ensureNoDisposablesAreLeakedInTestSuite } from './utils.js';

suite('OAuth', () => {
	ensureNoDisposablesAreLeakedInTestSuite();
	suite('Scope Matching', () => {
		test('scopesMatch should return true for identical scopes', () => {
			const scopes1 = ['test', 'scopes'];
			const scopes2 = ['test', 'scopes'];
			assert.strictEqual(scopesMatch(scopes1, scopes2), true);
		});

		test('scopesMatch should return true for scopes in different order', () => {
			const scopes1 = ['6f1cc985-85e8-487e-b0dd-aa633302a731/.default', 'VSCODE_TENANT:organizations'];
			const scopes2 = ['VSCODE_TENANT:organizations', '6f1cc985-85e8-487e-b0dd-aa633302a731/.default'];
			assert.strictEqual(scopesMatch(scopes1, scopes2), true);
		});

		test('scopesMatch should return false for different scopes', () => {
			const scopes1 = ['test', 'scopes'];
			const scopes2 = ['different', 'scopes'];
			assert.strictEqual(scopesMatch(scopes1, scopes2), false);
		});

		test('scopesMatch should return false for different length arrays', () => {
			const scopes1 = ['test'];
			const scopes2 = ['test', 'scopes'];
			assert.strictEqual(scopesMatch(scopes1, scopes2), false);
		});

		test('scopesMatch should handle complex Microsoft scopes', () => {
			const scopes1 = ['6f1cc985-85e8-487e-b0dd-aa633302a731/.default', 'VSCODE_TENANT:organizations'];
			const scopes2 = ['VSCODE_TENANT:organizations', '6f1cc985-85e8-487e-b0dd-aa633302a731/.default'];
			assert.strictEqual(scopesMatch(scopes1, scopes2), true);
		});

		test('scopesMatch should handle empty arrays', () => {
			assert.strictEqual(scopesMatch([], []), true);
		});

		test('scopesMatch should handle single scope arrays', () => {
			assert.strictEqual(scopesMatch(['single'], ['single']), true);
			assert.strictEqual(scopesMatch(['single'], ['different']), false);
		});

		test('scopesMatch should handle duplicate scopes within arrays', () => {
			const scopes1 = ['scope1', 'scope2', 'scope1'];
			const scopes2 = ['scope2', 'scope1', 'scope1'];
			assert.strictEqual(scopesMatch(scopes1, scopes2), true);
		});

		test('scopesMatch should handle undefined values', () => {
			assert.strictEqual(scopesMatch(undefined, undefined), true);
			assert.strictEqual(scopesMatch(['read'], undefined), false);
			assert.strictEqual(scopesMatch(undefined, ['write']), false);
		});

		test('scopesMatch should handle mixed undefined and empty arrays', () => {
			assert.strictEqual(scopesMatch([], undefined), false);
			assert.strictEqual(scopesMatch(undefined, []), false);
			assert.strictEqual(scopesMatch([], []), true);
		});
	});

	suite('Parsing Functions', () => {
		test('parseWWWAuthenticateHeader should correctly parse simple header', () => {
			const result = parseWWWAuthenticateHeader('Bearer');
			assert.strictEqual(result.length, 1);
			assert.strictEqual(result[0].scheme, 'Bearer');
			assert.deepStrictEqual(result[0].params, {});
		});

		test('parseWWWAuthenticateHeader should correctly parse header with parameters', () => {
			const result = parseWWWAuthenticateHeader('Bearer realm="api", error="invalid_token", error_description="The access token expired"');

			assert.strictEqual(result.length, 1);
			assert.strictEqual(result[0].scheme, 'Bearer');
			assert.deepStrictEqual(result[0].params, {
				realm: 'api',
				error: 'invalid_token',
				error_description: 'The access token expired'
			});
		});

		test('parseWWWAuthenticateHeader should correctly parse parameters with equal signs', () => {
			const result = parseWWWAuthenticateHeader('Bearer resource_metadata="https://example.com/.well-known/oauth-protected-resource?v=1"');
			assert.strictEqual(result.length, 1);
			assert.strictEqual(result[0].scheme, 'Bearer');
			assert.deepStrictEqual(result[0].params, {
				resource_metadata: 'https://example.com/.well-known/oauth-protected-resource?v=1'
			});
		});

		test('parseWWWAuthenticateHeader should correctly parse multiple', () => {
			const result = parseWWWAuthenticateHeader('Bearer realm="api", error="invalid_token", error_description="The access token expired", Basic realm="hi"');

			assert.strictEqual(result.length, 2);
			assert.strictEqual(result[0].scheme, 'Bearer');
			assert.deepStrictEqual(result[0].params, {
				realm: 'api',
				error: 'invalid_token',
				error_description: 'The access token expired'
			});
			assert.strictEqual(result[1].scheme, 'Basic');
			assert.deepStrictEqual(result[1].params, {
				realm: 'hi'
			});
		});
	});
});
