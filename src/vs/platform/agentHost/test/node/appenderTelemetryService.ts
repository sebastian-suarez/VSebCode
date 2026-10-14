/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { mock } from '../../../../base/test/common/mock.js';
import { ITelemetryData, ITelemetryService, TelemetryLevel } from '../../../telemetry/common/telemetry.js';

/**
 * A telemetry service for tests that hands every event, with the common
 * properties mixed in, to a log callback.
 */
export class AppenderTelemetryService extends mock<ITelemetryService>() {

	override telemetryLevel = TelemetryLevel.USAGE;
	override sendErrorTelemetry = true;
	override sessionId = 'sessionId';
	override machineId = 'machineId';
	override firstSessionDate = 'firstSessionDate';

	private readonly _commonProperties = new Map<string, string | boolean>();

	constructor(private readonly _log: (eventName: string, data: ITelemetryData) => void) {
		super();
	}

	override setExperimentProperty(): void { }

	override setCommonProperty(name: string, value: string | boolean | undefined): void {
		if (value === undefined) {
			this._commonProperties.delete(name);
		} else {
			this._commonProperties.set(name, value);
		}
	}

	override publicLog(eventName: string, data?: ITelemetryData): void {
		this._log(eventName, { ...data, ...Object.fromEntries(this._commonProperties) });
	}

	override publicLog2(eventName: string, data?: ITelemetryData): void {
		this.publicLog(eventName, data);
	}

	override publicLogError(eventName: string, data?: ITelemetryData): void {
		this.publicLog(eventName, data);
	}

	override publicLogError2(eventName: string, data?: ITelemetryData): void {
		this.publicLog(eventName, data);
	}
}
