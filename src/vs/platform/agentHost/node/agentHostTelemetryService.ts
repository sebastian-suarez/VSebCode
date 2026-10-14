/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable, isDisposable, toDisposable, type DisposableStore, type IDisposable } from '../../../base/common/lifecycle.js';
import { INativeEnvironmentService } from '../../environment/common/environment.js';
import { IFileService } from '../../files/common/files.js';
import { ILogService, ILoggerService } from '../../log/common/log.js';
import { IProductService } from '../../product/common/productService.js';
import { IRequestService } from '../../request/common/request.js';
import { ClassifiedEvent, IGDPRProperty, OmitMetadata, StrictPropertyCheck } from '../../telemetry/common/gdprTypings.js';
import { ITelemetryData, ITelemetryService, TelemetryLevel } from '../../telemetry/common/telemetry.js';
import { NullTelemetryService } from '../../telemetry/common/telemetryUtils.js';
import { AgentHostTelemetryLevelConfigKey, agentHostConfigValueToTelemetryLevel } from '../common/agentHostSchema.js';
import { IAgentHostRestrictedTelemetry, IAgentHostInternalTelemetryContext, IAgentHostRestrictedTelemetryContext, TelemetryMeasurements, TelemetryProps } from './agentHostRestrictedTelemetry.js';
import type { IAgentTelemetryContext } from '../common/agent.js';

export interface IAgentHostTelemetryServiceOptions {
	readonly environmentService: INativeEnvironmentService;
	readonly productService: IProductService;
	readonly fileService: IFileService;
	readonly loggerService: ILoggerService | undefined;
	readonly logService: ILogService;
	readonly disposables: DisposableStore;
	readonly disableTelemetry?: boolean;
	readonly fetchFn?: typeof globalThis.fetch;
	readonly requestService?: IRequestService;
	readonly readTelemetryLevelEnvironment?: () => string | undefined;
}

export interface IAgentHostTelemetryService extends ITelemetryService, IAgentHostRestrictedTelemetry {
	updateTelemetryLevel(telemetryLevel: TelemetryLevel): void;
	/** Register an account reader with provider-owned lifetime, never process-wide account properties. */
	registerCopilotTelemetryProvider(provider: string, getContext: () => IAgentTelemetryContext): IDisposable;
	/** Read the current account for point-in-time events. Delayed events must capture their own account context. */
	getCopilotTelemetryContext(provider: string): IAgentTelemetryContext | undefined;
}

export class AgentHostTelemetryService extends Disposable implements IAgentHostTelemetryService {
	declare readonly _serviceBrand: undefined;

	private _telemetryLevel: TelemetryLevel;

	/**
	 * Whether `/copilot_internal/user` enables enhanced/restricted telemetry. Defaults to `false`
	 * so nothing restricted is sent until the authenticated account confirms the opt-in.
	 */
	private _restrictedTelemetryEnabled = false;
	private _internalTelemetryEnabled = false;

	/** Whether the machine itself is internal, captured before any account can override it. */
	private readonly _internalMachine: boolean;
	private readonly _copilotTelemetryProviders = new Map<string, () => IAgentTelemetryContext>();

	constructor(
		private readonly _delegate: ITelemetryService,
		private readonly _restricted?: IAgentHostRestrictedTelemetry,
		copilotSdkVersion?: string,
		copilotRuntimeVersion?: string,
		initialTelemetryLevel: TelemetryLevel = TelemetryLevel.USAGE,
	) {
		super();
		this._telemetryLevel = initialTelemetryLevel;
		this._internalMachine = _delegate.msftInternal === true;
		this._register(toDisposable(() => this._copilotTelemetryProviders.clear()));
		if (isDisposable(_delegate)) {
			this._register(_delegate);
		}
		if (copilotSdkVersion) {
			// __GDPR__COMMON__ "common.copilotSdkVersion" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth", "comment": "The version of the Copilot SDK used by the Agent Host process." }
			this._delegate.setCommonProperty('common.copilotSdkVersion', copilotSdkVersion);
		}
		if (copilotRuntimeVersion) {
			// __GDPR__COMMON__ "common.copilotRuntimeVersion" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth", "comment": "The version of the Copilot runtime used by the Agent Host process." }
			this._delegate.setCommonProperty('common.copilotRuntimeVersion', copilotRuntimeVersion);
		}
	}

	get telemetryLevel(): TelemetryLevel {
		return Math.min(this._delegate.telemetryLevel, this._telemetryLevel);
	}

	get sendErrorTelemetry(): boolean {
		return this.telemetryLevel >= TelemetryLevel.ERROR && this._delegate.sendErrorTelemetry;
	}

	get sessionId(): string {
		return this._delegate.sessionId;
	}

	get machineId(): string {
		return this._delegate.machineId;
	}

	get firstSessionDate(): string {
		return this._delegate.firstSessionDate;
	}

	get msftInternal(): boolean | undefined {
		return this._delegate.msftInternal;
	}

	publicLog(eventName: string, data?: ITelemetryData): void {
		if (this.telemetryLevel < TelemetryLevel.USAGE) {
			return;
		}
		this._delegate.publicLog(eventName, data);
	}

	publicLogError(eventName: string, data?: ITelemetryData): void {
		if (this.telemetryLevel < TelemetryLevel.ERROR) {
			return;
		}
		this._delegate.publicLogError(eventName, data);
	}

	publicLog2<E extends ClassifiedEvent<OmitMetadata<T>> = never, T extends IGDPRProperty = never>(eventName: string, data?: StrictPropertyCheck<T, E>): void {
		if (this.telemetryLevel < TelemetryLevel.USAGE) {
			return;
		}
		this._delegate.publicLog2(eventName, data);
	}

	publicLogError2<E extends ClassifiedEvent<OmitMetadata<T>> = never, T extends IGDPRProperty = never>(eventName: string, data?: StrictPropertyCheck<T, E>): void {
		if (this.telemetryLevel < TelemetryLevel.ERROR) {
			return;
		}
		this._delegate.publicLogError2(eventName, data);
	}

	sendGHTelemetryEvent(eventName: string, properties?: TelemetryProps, measurements?: TelemetryMeasurements): void {
		if (this.telemetryLevel < TelemetryLevel.USAGE) {
			return;
		}
		this._restricted?.sendGHTelemetryEvent(eventName, properties, measurements);
	}

	sendEnhancedGHTelemetryEvent(eventName: string, properties?: TelemetryProps, measurements?: TelemetryMeasurements): void {
		if (this.telemetryLevel < TelemetryLevel.USAGE || !this._restrictedTelemetryEnabled) {
			return;
		}
		this._restricted?.sendEnhancedGHTelemetryEvent(eventName, properties, measurements);
	}

	sendEnhancedGHTelemetryEventForContext(context: IAgentHostRestrictedTelemetryContext, eventName: string, properties?: TelemetryProps, measurements?: TelemetryMeasurements): void {
		if (this.telemetryLevel < TelemetryLevel.USAGE || !context.restrictedTelemetryEnabled) {
			return;
		}
		this._restricted?.sendEnhancedGHTelemetryEventForContext(context, eventName, properties, measurements);
	}

	sendInternalMSFTTelemetryEvent(eventName: string, properties?: TelemetryProps, measurements?: TelemetryMeasurements): void {
		if (this.telemetryLevel < TelemetryLevel.USAGE || !this._internalTelemetryEnabled) {
			return;
		}
		this._restricted?.sendInternalMSFTTelemetryEvent(eventName, properties, measurements);
	}

	sendInternalMSFTTelemetryEventForContext(context: IAgentHostInternalTelemetryContext, eventName: string, properties?: TelemetryProps, measurements?: TelemetryMeasurements): void {
		if (this.telemetryLevel < TelemetryLevel.USAGE || !context.isInternal) {
			return;
		}
		this._restricted?.sendInternalMSFTTelemetryEventForContext(context, eventName, properties, measurements);
	}

	setCopilotTrackingId(trackingId: string | undefined): void {
		this._restricted?.setCopilotTrackingId(trackingId);
	}

	setRestrictedTelemetryEndpoint(endpointUrl: string | undefined): void {
		this._restricted?.setRestrictedTelemetryEndpoint(endpointUrl);
	}

	setRestrictedTelemetryEnabled(enabled: boolean): void {
		this._restrictedTelemetryEnabled = enabled;
		// Mirror onto the sender so the restricted-table writer enforces the same `rt` gate
		// independently (defense in depth), matching the extension's opted-in-only reporter.
		this._restricted?.setRestrictedTelemetryEnabled(enabled);
	}

	setInternalTelemetryContext(context: IAgentHostInternalTelemetryContext | undefined): void {
		this._internalTelemetryEnabled = context?.isInternal === true;
		if (context) {
			// Signing in to an external account has to clear the account half of the signal again.
			this._delegate.setCommonProperty('common.msftInternal', this._internalMachine || this._internalTelemetryEnabled);
		}
		this._restricted?.setInternalTelemetryContext(context);
	}

	setExperimentProperty(name: string, value: string): void {
		this._delegate.setExperimentProperty(name, value);
	}

	setCommonProperty(name: string, value: string | boolean | undefined): void {
		this._delegate.setCommonProperty(name, value);
		this._restricted?.setCommonProperty(name, value);
	}

	registerCopilotTelemetryProvider(provider: string, getContext: () => IAgentTelemetryContext): IDisposable {
		this._copilotTelemetryProviders.set(provider, getContext);
		return toDisposable(() => {
			if (this._copilotTelemetryProviders.get(provider) === getContext) {
				this._copilotTelemetryProviders.delete(provider);
			}
		});
	}

	getCopilotTelemetryContext(provider: string): IAgentTelemetryContext | undefined {
		return this._copilotTelemetryProviders.get(provider)?.();
	}

	updateTelemetryLevel(telemetryLevel: TelemetryLevel): void {
		this._telemetryLevel = Math.min(this._telemetryLevel, telemetryLevel);
	}
}

export function updateAgentHostTelemetryLevelFromConfig(telemetryService: ITelemetryService, config: Record<string, unknown> | undefined): void {
	const telemetryLevel = config?.[AgentHostTelemetryLevelConfigKey];
	const telemetryLevelValue = agentHostConfigValueToTelemetryLevel(telemetryLevel);
	if (!isAgentHostTelemetryService(telemetryService) || telemetryLevelValue === undefined) {
		return;
	}
	telemetryService.updateTelemetryLevel(telemetryLevelValue);
}

export function isAgentHostTelemetryService(telemetryService: ITelemetryService): telemetryService is IAgentHostTelemetryService {
	return typeof (telemetryService as IAgentHostTelemetryService).updateTelemetryLevel === 'function';
}

/**
 * The agent host sends no telemetry: the service wraps the null telemetry
 * service so that the level reported to the agents is `TelemetryLevel.NONE`.
 */
export async function createAgentHostTelemetryService(options: IAgentHostTelemetryServiceOptions): Promise<IAgentHostTelemetryService> {
	const { productService, disposables } = options;
	return disposables.add(new AgentHostTelemetryService(NullTelemetryService, undefined, productService.copilotVersions?.sdk, productService.copilotVersions?.runtime, TelemetryLevel.NONE));
}
