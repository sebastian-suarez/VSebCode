/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';

export interface IGitHubUploadResult {
	readonly fileName: string;
	readonly assetUrl: string;
	readonly contentType: string;
}

export const IGitHubUploadService = createDecorator<IGitHubUploadService>('githubUploadService');

export interface IGitHubUploadService {
	readonly _serviceBrand: undefined;
	resolveRepositoryId(owner: string, repo: string, token?: string): Promise<string>;
	uploadViaMobileApi(token: string, repoId: string, files: { name: string; bytes: Uint8Array; contentType: string }[]): Promise<IGitHubUploadResult[]>;
}
