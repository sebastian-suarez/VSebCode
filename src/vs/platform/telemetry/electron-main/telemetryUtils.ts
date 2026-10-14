/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ILogService } from '../../log/common/log.js';
import { IStateService } from '../../state/node/state.js';
import { machineIdKey } from '../common/telemetry.js';
import { resolveMachineId as resolveNodeMachineId } from '../node/telemetryUtils.js';

export async function resolveMachineId(stateService: IStateService, logService: ILogService): Promise<string> {
	logService.trace('Resolving machine identifier...');
	const machineId = await resolveNodeMachineId(stateService, logService);
	stateService.setItem(machineIdKey, machineId);
	logService.trace(`Resolved machine identifier: ${machineId}`);
	return machineId;
}
