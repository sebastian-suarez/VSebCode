/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IEnvironmentService } from '../../../../platform/environment/common/environment.js';
import { refineServiceDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { IWorkbenchEnvironmentService } from '../common/environmentService.js';

export const IBrowserWorkbenchEnvironmentService = refineServiceDecorator<IEnvironmentService, IBrowserWorkbenchEnvironmentService>(IEnvironmentService);

/** Environment information available to workbench renderers. */
export interface IBrowserWorkbenchEnvironmentService extends IWorkbenchEnvironmentService {

	/**
	 * Gets whether a resolver extension is expected for the environment.
	 */
	readonly expectsResolverExtension: boolean;
}
