/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../base/test/common/utils.js';
import { ITelemetryData, ITelemetryService, TelemetryLevel } from '../../../telemetry/common/telemetry.js';
import { AgentHostTelemetryLevelConfigKey, telemetryLevelToAgentHostConfigValue } from '../../common/agentHostSchema.js';
import { IAgentHostRestrictedTelemetry, IAgentHostInternalTelemetryContext, IAgentHostRestrictedTelemetryContext, TelemetryProps } from '../../node/agentHostRestrictedTelemetry.js';
import { AgentHostTelemetryService, updateAgentHostTelemetryLevelFromConfig } from '../../node/agentHostTelemetryService.js';

class TestTelemetryService implements ITelemetryService {
	declare readonly _serviceBrand: undefined;

	telemetryLevel = TelemetryLevel.USAGE;
	sendErrorTelemetry = true;
	sessionId = 'sessionId';
	machineId = 'machineId';
	firstSessionDate = 'firstSessionDate';
	readonly events: { eventName: string; data: ITelemetryData | undefined }[] = [];
	readonly errorEvents: { eventName: string; data: ITelemetryData | undefined }[] = [];
	readonly commonProperties: Record<string, string | boolean> = {};

	publicLog(eventName: string, data?: ITelemetryData): void {
		this.events.push({ eventName, data });
	}

	publicLogError(eventName: string, data?: ITelemetryData): void {
		this.errorEvents.push({ eventName, data });
	}

	publicLog2(eventName: string, data?: ITelemetryData): void {
		this.events.push({ eventName, data });
	}

	publicLogError2(eventName: string, data?: ITelemetryData): void {
		this.errorEvents.push({ eventName, data });
	}

	setExperimentProperty(): void { }
	setCommonProperty(name: string, value: string | boolean | undefined): void {
		if (value === undefined) {
			delete this.commonProperties[name];
		} else {
			this.commonProperties[name] = value;
		}
	}
}

class TestRestrictedSink implements IAgentHostRestrictedTelemetry {
	readonly enhanced: string[] = [];
	readonly standard: string[] = [];
	readonly trackingIds: (string | undefined)[] = [];
	readonly endpoints: (string | undefined)[] = [];
	readonly enabledFlags: boolean[] = [];
	readonly internal: string[] = [];
	readonly internalContexts: (IAgentHostInternalTelemetryContext | undefined)[] = [];
	readonly commonProperties: Record<string, string | boolean> = {};

	sendGHTelemetryEvent(eventName: string, _properties?: TelemetryProps): void {
		this.standard.push(eventName);
	}
	sendEnhancedGHTelemetryEvent(eventName: string, _properties?: TelemetryProps): void {
		this.enhanced.push(eventName);
	}
	sendEnhancedGHTelemetryEventForContext(_context: IAgentHostRestrictedTelemetryContext, eventName: string): void {
		this.enhanced.push(eventName);
	}
	sendInternalMSFTTelemetryEvent(eventName: string): void {
		this.internal.push(eventName);
	}
	sendInternalMSFTTelemetryEventForContext(_context: IAgentHostInternalTelemetryContext, eventName: string): void {
		this.internal.push(eventName);
	}
	setCopilotTrackingId(trackingId: string | undefined): void {
		this.trackingIds.push(trackingId);
	}
	setRestrictedTelemetryEndpoint(endpointUrl: string | undefined): void {
		this.endpoints.push(endpointUrl);
	}
	setRestrictedTelemetryEnabled(enabled: boolean): void {
		this.enabledFlags.push(enabled);
	}
	setInternalTelemetryContext(context: IAgentHostInternalTelemetryContext | undefined): void {
		this.internalContexts.push(context);
	}
	setCommonProperty(name: string, value: string | boolean | undefined): void {
		if (value === undefined) {
			delete this.commonProperties[name];
		} else {
			this.commonProperties[name] = value;
		}
	}
}

suite('AgentHostTelemetryService', () => {
	const disposables = ensureNoDisposablesAreLeakedInTestSuite();

	test('uses the launch telemetry level before a client connects and only becomes more restrictive', () => {
		const delegate = new TestTelemetryService();
		const service = disposables.add(new AgentHostTelemetryService(delegate, undefined, undefined, undefined, TelemetryLevel.USAGE));

		service.publicLog('beforeClientLevel', { count: 1 });
		service.updateTelemetryLevel(TelemetryLevel.ERROR);
		service.publicLog('afterClientLevel', { count: 2 });
		service.publicLogError('afterClientLevelError', { count: 3 });
		service.updateTelemetryLevel(TelemetryLevel.NONE);
		service.updateTelemetryLevel(TelemetryLevel.USAGE);
		service.publicLog2('afterDisable');
		service.publicLogError2('afterDisableError');

		assert.deepStrictEqual({
			telemetryLevel: service.telemetryLevel,
			sendErrorTelemetry: service.sendErrorTelemetry,
			events: delegate.events,
			errorEvents: delegate.errorEvents,
		}, {
			telemetryLevel: TelemetryLevel.NONE,
			sendErrorTelemetry: false,
			events: [{ eventName: 'beforeClientLevel', data: { count: 1 } }],
			errorEvents: [{ eventName: 'afterClientLevelError', data: { count: 3 } }],
		});
	});

	test('forwards setting and clearing common properties to standard and restricted telemetry', () => {
		const delegate = new TestTelemetryService();
		const sink = new TestRestrictedSink();
		const service = disposables.add(new AgentHostTelemetryService(delegate, sink));

		service.setCommonProperty('copilotSku', 'copilot_for_business_seat');
		const afterSet = { delegate: { ...delegate.commonProperties }, restricted: { ...sink.commonProperties } };
		service.setCommonProperty('copilotSku', undefined);

		assert.deepStrictEqual({ afterSet, afterClear: { delegate: delegate.commonProperties, restricted: sink.commonProperties } }, {
			afterSet: {
				delegate: { copilotSku: 'copilot_for_business_seat' },
				restricted: { copilotSku: 'copilot_for_business_seat' },
			},
			afterClear: {
				delegate: {},
				restricted: {},
			},
		});
	});

	test('marks msftInternal for an internal account and clears it again on account change', () => {
		const delegate = new TestTelemetryService();
		const service = disposables.add(new AgentHostTelemetryService(delegate, new TestRestrictedSink()));
		const account = (isInternal: boolean) => ({ isInternal, trackingId: 'tid', userName: 'user', isVscodeTeamMember: false });

		service.setInternalTelemetryContext(undefined);
		const beforeSignIn = { ...delegate.commonProperties };
		service.setInternalTelemetryContext(account(true));
		const afterInternalAccount = { ...delegate.commonProperties };
		service.setInternalTelemetryContext(account(false));

		assert.deepStrictEqual({ beforeSignIn, afterInternalAccount, afterExternalAccount: delegate.commonProperties }, {
			beforeSignIn: {},
			afterInternalAccount: { 'common.msftInternal': true },
			afterExternalAccount: { 'common.msftInternal': false },
		});
	});

	test('uses most restrictive client telemetry level', () => {
		const service = disposables.add(new AgentHostTelemetryService(new TestTelemetryService()));

		service.updateTelemetryLevel(TelemetryLevel.ERROR);
		service.updateTelemetryLevel(TelemetryLevel.USAGE);

		assert.strictEqual(service.telemetryLevel, TelemetryLevel.ERROR);
	});

	test('adds the Copilot SDK and runtime versions as common properties', () => {
		const delegate = new TestTelemetryService();
		disposables.add(new AgentHostTelemetryService(delegate, undefined, '1.0.9-preview.3', '1.0.78'));

		assert.deepStrictEqual(delegate.commonProperties, {
			'common.copilotSdkVersion': '1.0.9-preview.3',
			'common.copilotRuntimeVersion': '1.0.78',
		});
	});

	test('updates telemetry level from root config string enum', () => {
		const service = disposables.add(new AgentHostTelemetryService(new TestTelemetryService()));

		updateAgentHostTelemetryLevelFromConfig(service, {
			[AgentHostTelemetryLevelConfigKey]: telemetryLevelToAgentHostConfigValue(TelemetryLevel.ERROR),
		});

		assert.strictEqual(service.telemetryLevel, TelemetryLevel.ERROR);
	});

	test('enhanced GH telemetry is gated on the restricted (rt) opt-in; standard GH telemetry is not', () => {
		const restricted = new TestRestrictedSink();
		const service = disposables.add(new AgentHostTelemetryService(new TestTelemetryService(), restricted));
		service.updateTelemetryLevel(TelemetryLevel.USAGE);

		service.sendEnhancedGHTelemetryEvent('request.options.tools'); // dropped: rt disabled by default
		service.sendGHTelemetryEvent('completion'); // sent: standard GH telemetry is not rt-gated
		service.setRestrictedTelemetryEnabled(true);
		service.sendEnhancedGHTelemetryEvent('request.options.tools'); // sent: rt now enabled
		service.setCopilotTrackingId('tid-1');
		service.setRestrictedTelemetryEndpoint('https://ghe.example/telemetry');

		assert.deepStrictEqual({
			enhanced: restricted.enhanced,
			standard: restricted.standard,
			trackingIds: restricted.trackingIds,
			endpoints: restricted.endpoints,
		}, {
			enhanced: ['request.options.tools'],
			standard: ['completion'],
			trackingIds: ['tid-1'],
			endpoints: ['https://ghe.example/telemetry'],
		});
		// The rt opt-in is mirrored onto the sender (defense in depth), matching the extension's
		// opted-in-only restricted reporter.
		assert.deepStrictEqual(restricted.enabledFlags, [true]);
	});

	test('enhanced GH telemetry stays suppressed when telemetry is disabled, even for an rt=1 user', () => {
		const delegate = new TestTelemetryService();
		delegate.telemetryLevel = TelemetryLevel.ERROR; // user opted below USAGE
		const restricted = new TestRestrictedSink();
		const service = disposables.add(new AgentHostTelemetryService(delegate, restricted));
		service.updateTelemetryLevel(TelemetryLevel.USAGE);

		service.setRestrictedTelemetryEnabled(true); // rt=1
		service.sendEnhancedGHTelemetryEvent('request.options.tools');
		service.sendGHTelemetryEvent('completion');

		// Neither standard nor enhanced GH telemetry is delegated below USAGE, regardless of rt.
		assert.deepStrictEqual({ enhanced: restricted.enhanced, standard: restricted.standard }, { enhanced: [], standard: [] });
	});

	test('internal telemetry is independently gated and identity is cleared on account changes', () => {
		const restricted = new TestRestrictedSink();
		const service = disposables.add(new AgentHostTelemetryService(new TestTelemetryService(), restricted));
		service.updateTelemetryLevel(TelemetryLevel.USAGE);
		const internalContext = { isInternal: true, trackingId: 'tid-1', userName: 'octocat', isVscodeTeamMember: true };

		service.sendInternalMSFTTelemetryEvent('beforeIdentity');
		service.setInternalTelemetryContext(internalContext);
		service.sendInternalMSFTTelemetryEvent('internal');
		service.setInternalTelemetryContext(undefined);
		service.sendInternalMSFTTelemetryEvent('afterClear');

		assert.deepStrictEqual({ internal: restricted.internal, contexts: restricted.internalContexts }, {
			internal: ['internal'],
			contexts: [internalContext, undefined],
		});
	});
});
