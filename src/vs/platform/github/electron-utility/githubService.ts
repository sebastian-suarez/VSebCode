/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Event } from '../../../base/common/event.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { INativeEnvironmentService } from '../../environment/common/environment.js';
import { ILogService } from '../../log/common/log.js';
import { INativeHostService } from '../../native/common/native.js';
import { IProductService } from '../../product/common/productService.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
import { createGitHubClientMetadata } from '../common/githubRequestMetadata.js';
import { GitHubService } from '../common/githubService.js';
import { createFetch } from './githubFetch.js';

export class SharedProcessGitHubService extends GitHubService {
	constructor(
		@INativeHostService nativeHostService: INativeHostService,
		@IConfigurationService configurationService: IConfigurationService,
		@INativeEnvironmentService environmentService: INativeEnvironmentService,
		@IProductService productService: IProductService,
		@ILogService logService: ILogService,
		@ITelemetryService telemetryService: ITelemetryService,
	) {
		super({
			fetch: createFetch(nativeHostService, configurationService, environmentService, logService),
			telemetrySource: 'sharedProcess',
			clientMetadata: createGitHubClientMetadata(productService, 'shared-process', 'node'),
			onDidChangeTelemetryLevel: Event.None,
		}, logService, telemetryService);
	}
}
