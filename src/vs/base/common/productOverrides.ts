/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/** Whether a parsed JSON value is an object suitable for a product override. */
export function isProductOverride(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value) && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
}

/** Recursively merges JSON objects, replacing arrays and scalar values without invoking prototypes. */
export function mergeProductOverrides(base: object, overrides: Record<string, unknown>): Record<string, unknown> {
	const result: Record<string, unknown> = { ...base };
	for (const [key, value] of Object.entries(overrides)) {
		if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
			continue;
		}
		result[key] = isProductOverride(value) ? mergeProductOverrides(isProductOverride(result[key]) ? result[key] : {}, value) : sanitizeValue(value);
	}
	return result;
}

function sanitizeValue(value: unknown): unknown {
	if (Array.isArray(value)) {
		return value.map(sanitizeValue);
	}
	return isProductOverride(value) ? mergeProductOverrides({}, value) : value;
}

/** Applies the optional gallery environment values without dropping other gallery capabilities. */
export function applyGalleryOverrides(product: { extensionsGallery?: object }, environment: Record<string, string | undefined>): void {
	const keys = {
		VSCODE_GALLERY_SERVICE_URL: 'serviceUrl',
		VSCODE_GALLERY_CONTROL_URL: 'controlUrl',
		VSCODE_GALLERY_ITEM_URL: 'itemUrl',
		VSCODE_GALLERY_LATEST_URL_TEMPLATE: 'latestUrlTemplate',
		VSCODE_GALLERY_EXTENSION_URL_TEMPLATE: 'extensionUrlTemplate',
		VSCODE_GALLERY_RESOURCE_URL_TEMPLATE: 'resourceUrlTemplate',
	};
	for (const [variable, key] of Object.entries(keys)) {
		const value = environment[variable];
		if (value) {
			product.extensionsGallery = { ...product.extensionsGallery, [key]: value };
		}
	}
}
