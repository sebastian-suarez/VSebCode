/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createDecorator } from '../../instantiation/common/instantiation.js';
import { ClassifiedEvent, IGDPRProperty, OmitMetadata, StrictPropertyCheck } from './gdprTypings.js';

export const ITelemetryService = createDecorator<ITelemetryService>('telemetryService');

export interface ITelemetryData {
	from?: string;
	target?: string;
	[key: string]: string | unknown | undefined;
}

export interface ITelemetryService {

	readonly _serviceBrand: undefined;

	readonly telemetryLevel: TelemetryLevel;

	readonly sessionId: string;
	readonly machineId: string;
	readonly firstSessionDate: string;
	readonly msftInternal?: boolean;

	/**
	 * Whether error telemetry will get sent. If false, `publicLogError` will no-op.
	 */
	readonly sendErrorTelemetry: boolean;

	/**
	 * @deprecated Use publicLog2 and the typescript GDPR annotation where possible
	 */
	publicLog(eventName: string, data?: ITelemetryData): void;

	/**
	 * Sends a telemetry event that has been privacy approved.
	 * Do not call this unless you have been given approval.
	 */
	publicLog2<E extends ClassifiedEvent<OmitMetadata<T>> = never, T extends IGDPRProperty = never>(eventName: string, data?: StrictPropertyCheck<T, E>): void;

	/**
	 * @deprecated Use publicLogError2 and the typescript GDPR annotation where possible
	 */
	publicLogError(errorEventName: string, data?: ITelemetryData): void;

	publicLogError2<E extends ClassifiedEvent<OmitMetadata<T>> = never, T extends IGDPRProperty = never>(eventName: string, data?: StrictPropertyCheck<T, E>): void;

	setExperimentProperty(name: string, value: string): void;

	/**
	 * Sets a common property that will be attached to all telemetry events, or removes it when the value is undefined.
	 * Common properties are added after PII cleaning and cannot be overridden by event data.
	 */
	setCommonProperty(name: string, value: string | boolean | undefined): void;
}

export function telemetryLevelEnabled(service: ITelemetryService, level: TelemetryLevel): boolean {
	return service.telemetryLevel >= level;
}

/**
 * Replaces `/` and `\` with `|` in model identifiers to prevent the
 * telemetry pipeline from redacting them as file paths.
 */
export function escapeModelIdForTelemetry(modelId: string | undefined): string | undefined {
	return modelId?.replace(/[\/\\]/g, '|');
}

// Keys
export const currentSessionDateStorageKey = 'telemetry.currentSessionDate';
export const firstSessionDateStorageKey = 'telemetry.firstSessionDate';
export const lastSessionDateStorageKey = 'telemetry.lastSessionDate';
export const machineIdKey = 'telemetry.machineId';

// Configuration Keys
export const TELEMETRY_SECTION_ID = 'telemetry';

/**
 * The product sends no telemetry: every telemetry service reports
 * `TelemetryLevel.NONE`. The other levels remain for the code that
 * compares against them.
 */
export const enum TelemetryLevel {
	NONE = 0,
	CRASH = 1,
	ERROR = 2,
	USAGE = 3
}

/**
 * The string form of a telemetry level, used where a level travels as a
 * command line argument.
 */
export const enum TelemetryConfiguration {
	OFF = 'off',
	CRASH = 'crash',
	ERROR = 'error',
	ON = 'all'
}

export interface ICommonProperties {
	[name: string]: string | boolean | undefined;
}
