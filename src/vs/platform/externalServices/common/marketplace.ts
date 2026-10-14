/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IHeaders } from '../../../base/parts/request/common/request.js';
import { IProductService } from '../../product/common/productService.js';

/**
 * The headers every Marketplace request carries. No user or machine identifier
 * is sent.
 */
export async function resolveMarketplaceHeaders(version: string, productService: IProductService): Promise<IHeaders> {
	return {
		'X-Market-Client-Id': `VSCode ${version}`,
		'User-Agent': `VSCode ${version} (${productService.nameShort})`
	};
}
