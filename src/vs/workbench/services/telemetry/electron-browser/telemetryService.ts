/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { generateUuid } from '../../../../base/common/uuid.js';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IStorageService, StorageScope } from '../../../../platform/storage/common/storage.js';
import { ClassifiedEvent, IGDPRProperty, OmitMetadata, StrictPropertyCheck } from '../../../../platform/telemetry/common/gdprTypings.js';
import { firstSessionDateStorageKey, ITelemetryData, ITelemetryService, TelemetryLevel } from '../../../../platform/telemetry/common/telemetry.js';
import { INativeWorkbenchEnvironmentService } from '../../environment/electron-browser/environmentService.js';

/**
 * The telemetry service of the desktop workbench. Nothing is sent: every log
 * call is a no-op and the level is fixed to `TelemetryLevel.NONE`. The service
 * still provides the identifiers that the extension API exposes through
 * `env.machineId` and `env.sessionId`.
 */
export class TelemetryService implements ITelemetryService {

	declare readonly _serviceBrand: undefined;

	readonly telemetryLevel = TelemetryLevel.NONE;
	readonly sendErrorTelemetry = false;
	readonly sessionId = generateUuid() + Date.now();
	readonly machineId: string;
	readonly firstSessionDate: string;

	constructor(
		@INativeWorkbenchEnvironmentService environmentService: INativeWorkbenchEnvironmentService,
		@IStorageService storageService: IStorageService
	) {
		this.machineId = environmentService.machineId;
		this.firstSessionDate = storageService.get(firstSessionDateStorageKey, StorageScope.APPLICATION) ?? new Date().toUTCString();
	}

	setExperimentProperty(name: string, value: string): void { }

	setCommonProperty(name: string, value: string | boolean | undefined): void { }

	publicLog(eventName: string, data?: ITelemetryData): void { }

	publicLog2<E extends ClassifiedEvent<OmitMetadata<T>> = never, T extends IGDPRProperty = never>(eventName: string, data?: StrictPropertyCheck<T, E>): void { }

	publicLogError(errorEventName: string, data?: ITelemetryData): void { }

	publicLogError2<E extends ClassifiedEvent<OmitMetadata<T>> = never, T extends IGDPRProperty = never>(eventName: string, data?: StrictPropertyCheck<T, E>): void { }
}

registerSingleton(ITelemetryService, TelemetryService, InstantiationType.Delayed);
