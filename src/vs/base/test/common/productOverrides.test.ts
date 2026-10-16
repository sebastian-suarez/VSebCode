/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { applyGalleryOverrides, isProductOverride, mergeProductOverrides } from '../../common/productOverrides.js';
import { ensureNoDisposablesAreLeakedInTestSuite } from './utils.js';

suite('Product overrides', () => {
	ensureNoDisposablesAreLeakedInTestSuite();

	test('plain objects merge, arrays and scalars replace, dangerous keys never merge', () => {
		const base = { gallery: { url: 'default', other: true }, array: [1, 2], value: 1 };
		const overrides = JSON.parse('{"gallery":{"url":"custom","__proto__":{"polluted":true}},"array":[3],"value":null,"__proto__":{"polluted":true},"constructor":{"prototype":{"polluted":true}}}');
		assert.deepStrictEqual(mergeProductOverrides(base, overrides), { gallery: { url: 'custom', other: true }, array: [3], value: null });
		assert.deepStrictEqual(base, { gallery: { url: 'default', other: true }, array: [1, 2], value: 1 });
		assert.deepStrictEqual(mergeProductOverrides({}, JSON.parse('{"array":[{"constructor":{"polluted":true},"nested":[{"__proto__":{"polluted":true},"value":1}]}]}')), { array: [{ nested: [{ value: 1 }] }] });
		assert.deepStrictEqual([null, [], 1, 'text', new Date(), {}].map(isProductOverride), [false, false, false, false, false, true]);
	});

	test('all gallery environment overrides preserve unrelated fields', () => {
		const product = { extensionsGallery: { serviceUrl: 'default', publisherUrl: 'retained' } };
		applyGalleryOverrides(product, {
			VSCODE_GALLERY_SERVICE_URL: 'service', VSCODE_GALLERY_CONTROL_URL: 'control',
			VSCODE_GALLERY_ITEM_URL: 'item', VSCODE_GALLERY_LATEST_URL_TEMPLATE: 'latest',
			VSCODE_GALLERY_EXTENSION_URL_TEMPLATE: 'extension', VSCODE_GALLERY_RESOURCE_URL_TEMPLATE: 'resource'
		});
		assert.deepStrictEqual(product.extensionsGallery, { serviceUrl: 'service', controlUrl: 'control', itemUrl: 'item', latestUrlTemplate: 'latest', extensionUrlTemplate: 'extension', resourceUrlTemplate: 'resource', publisherUrl: 'retained' });
	});
});
