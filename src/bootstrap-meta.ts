/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { isProductOverride, mergeProductOverrides, applyGalleryOverrides } from './vs/base/common/productOverrides.js';
import { setUserDataPath } from './vs/platform/environment/node/userDataPath.js';
import type { IProductConfiguration } from './vs/base/common/product.js';

const require = createRequire(import.meta.url);

let productObj: Partial<IProductConfiguration> & { BUILD_INSERT_PRODUCT_CONFIGURATION?: string } = { BUILD_INSERT_PRODUCT_CONFIGURATION: 'BUILD_INSERT_PRODUCT_CONFIGURATION' }; // DO NOT MODIFY, PATCHED DURING BUILD
if (productObj['BUILD_INSERT_PRODUCT_CONFIGURATION']) {
	productObj = require('../product.json'); // Running out of sources
}

let pkgObj = { BUILD_INSERT_PACKAGE_CONFIGURATION: 'BUILD_INSERT_PACKAGE_CONFIGURATION' }; // DO NOT MODIFY, PATCHED DURING BUILD
if (pkgObj['BUILD_INSERT_PACKAGE_CONFIGURATION']) {
	pkgObj = require('../package.json'); // Running out of sources
}

let productOverridesObj = {};
if (process.env['VSCODE_DEV']) {
	try {
		productOverridesObj = require('../product.overrides.json');
		productObj = Object.assign(productObj, productOverridesObj);
	} catch (error) { /* ignore */ }
}

export const product = productObj;
export const pkg = pkgObj;

/** Loads the selected profile root's product overrides before any product consumers initialize. */
export function loadUserProduct(userDataPath: string): void {
	const file = join(userDataPath, 'product.json');
	try {
		const overrides: unknown = JSON.parse(readFileSync(file, 'utf8'));
		if (isProductOverride(overrides)) {
			Object.assign(product, mergeProductOverrides(product, overrides));
		} else {
			console.warn(`Ignoring product overrides in ${file}: expected a JSON object.`);
		}
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
			console.warn(`Unable to read product overrides in ${file}:`, error);
		}
	}
	applyGalleryOverrides(product, process.env);
	setUserDataPath(userDataPath);
	process.env['VSCODE_USER_DATA_DIR'] = userDataPath;
	// bootstrap-esm may have initialized its snapshot before the selected data path was known.
	globalThis._VSCODE_PRODUCT_JSON = { ...product };
}
