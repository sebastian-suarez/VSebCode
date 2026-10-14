/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { Emitter } from '../../../../../../../base/common/event.js';
import { DisposableStore } from '../../../../../../../base/common/lifecycle.js';
import { observableValue } from '../../../../../../../base/common/observable.js';
import { upcastPartial } from '../../../../../../../base/test/common/mock.js';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../../../../base/test/common/utils.js';
import { ConfigurationService } from '../../../../../../../platform/configuration/common/configurationService.js';
import { TestConfigurationService } from '../../../../../../../platform/configuration/test/common/testConfigurationService.js';
import { NullLogService } from '../../../../../../../platform/log/common/log.js';
import { AccountPolicyGateState, AccountPolicyGateUnsatisfiedReason, IAccountPolicyGateInfo, IAccountPolicyGateService } from '../../../../../../services/policies/common/accountPolicyService.js';
import { ChatInputPart, IChatModeChangeEvent } from '../../../../browser/widget/input/chatInputPart.js';
import { ChatMode, IChatMode, IChatModes } from '../../../../common/chatModes.js';
import { ChatConfiguration, ChatModeKind } from '../../../../common/constants.js';
import { IChatModelInputState, IInputModel } from '../../../../common/model/chatModel.js';
import { Target } from '../../../../common/promptSyntax/promptTypes.js';

suite('ChatInputPart mode validation', () => {
	const store = ensureNoDisposablesAreLeakedInTestSuite();
	const refreshGate: IAccountPolicyGateInfo = {
		state: AccountPolicyGateState.Restricted,
		reason: AccountPolicyGateUnsatisfiedReason.ManagedSettingsRefresh,
	};
	const inactiveGate: IAccountPolicyGateInfo = { state: AccountPolicyGateState.Inactive };
	const customMode = upcastPartial<IChatMode>({
		id: 'test-custom-agent',
		kind: ChatModeKind.Agent,
		isBuiltin: false,
	});

	function createInput(initialMode: IChatMode = ChatMode.Agent, initialGate = inactiveGate, agentEnabled = true, services?: { configurationService: ConfigurationService; gateService: IAccountPolicyGateService }) {
		const inputStore = store.add(new DisposableStore());
		const modeChanges = store.add(new Emitter<void>());
		const gateChanges = store.add(new Emitter<IAccountPolicyGateInfo>());
		const testConfigurationService = new TestConfigurationService({ [ChatConfiguration.AgentEnabled]: agentEnabled });
		store.add(testConfigurationService.onDidChangeConfigurationEmitter);
		const configurationService = services?.configurationService ?? testConfigurationService;
		let gateInfo = initialGate;
		let availableModes = [ChatMode.Agent, ChatMode.Ask, ChatMode.Edit, customMode];
		const modes: IChatModes = {
			onDidChange: modeChanges.event,
			get builtin() { return availableModes.filter(mode => mode.isBuiltin); },
			get custom() { return availableModes.filter(mode => !mode.isBuiltin); },
			findModeById: id => availableModes.find(mode => mode.id === id),
			findModeByName: name => availableModes.find(mode => mode.name?.get() === name),
			waitForPendingUpdates: async () => { },
		};
		const accountPolicyGateService = services?.gateService ?? {
			_serviceBrand: undefined,
			get gateInfo() { return gateInfo; },
			onDidChangeGateInfo: gateChanges.event,
			async whenInitialized(): Promise<void> { },
		};
		const currentMode = observableValue<IChatMode>('currentMode', initialMode);
		const persistedState = observableValue<IChatModelInputState>('persistedState', {
			inputText: '',
			attachments: [],
			mode: { id: initialMode.id, kind: initialMode.kind },
			selectedModel: undefined,
			selections: [],
			contrib: {},
		});
		const persistedModes: string[] = [];
		const inputModel = upcastPartial<IInputModel>({
			state: persistedState,
			setState: state => {
				persistedState.set({ ...persistedState.get(), ...state }, undefined);
				persistedModes.push(persistedState.get().mode.id);
			},
		});
		const input: ChatInputPart = Object.assign(Object.create(ChatInputPart.prototype), {
			_store: inputStore,
			options: { supportsChangingModes: true },
			accountPolicyGateService,
			configurationService,
			agentService: { get hasToolsAgent() { return configurationService.getValue<boolean>(ChatConfiguration.AgentEnabled); } },
			chatSessionsService: { getCustomAgentTargetForSessionType: () => Target.GitHubCopilot },
			_currentModeObservable: currentMode,
			_currentLanguageModel: observableValue('currentLanguageModel', undefined),
			_currentChatModesObservable: observableValue('currentChatModes', modes),
			_onDidChangeCurrentChatMode: store.add(new Emitter<IChatModeChangeEvent>()),
			_inputModel: inputModel,
			_chatSessionIsEmpty: true,
			_emptyInputState: observableValue<IChatModelInputState | undefined>('emptyInputState', undefined),
			logService: new NullLogService(),
			getCurrentInputState: () => ({
				...persistedState.get(),
				mode: { id: currentMode.get().id, kind: currentMode.get().kind },
			}),
		});
		const registerValidation = Reflect.get(ChatInputPart.prototype, 'registerChatModeValidation') as (this: ChatInputPart) => void;
		registerValidation.call(input);
		store.add(configurationService.onDidChangeConfiguration(e => {
			if (e.affectsConfiguration(ChatConfiguration.AgentEnabled)) {
				modeChanges.fire();
			}
		}));

		return {
			input,
			persistedModes,
			snapshot: () => ({
				currentMode: currentMode.get().id,
				persistedMode: persistedState.get().mode.id,
				agentEnabled: configurationService.getValue<boolean>(ChatConfiguration.AgentEnabled),
			}),
			setGate: (info: IAccountPolicyGateInfo) => {
				gateInfo = info;
				gateChanges.fire(info);
			},
			setAgentEnabled: async (enabled: boolean) => {
				await testConfigurationService.setUserConfiguration(ChatConfiguration.AgentEnabled, enabled);
				modeChanges.fire();
			},
			setAvailableModes: (available: IChatMode[]) => {
				availableModes = available;
				modeChanges.fire();
			},
		};
	}

	for (const mode of [ChatMode.Agent, customMode]) {
		test(`preserves ${mode.id} through refresh, draft writes and recovery`, async () => {
			const harness = createInput(mode);
			harness.setGate(refreshGate);
			await harness.setAgentEnabled(false);
			harness.setAvailableModes([ChatMode.Ask, ChatMode.Edit]);
			harness.input.validateAgentMode();
			harness.input.flushInputStateToModel();
			const blocked = harness.snapshot();
			harness.setAvailableModes([ChatMode.Agent, ChatMode.Ask, ChatMode.Edit, customMode]);
			await harness.setAgentEnabled(true);
			harness.setGate(inactiveGate);

			assert.deepStrictEqual({ blocked, recovered: harness.snapshot(), writes: harness.persistedModes }, {
				blocked: { currentMode: mode.id, persistedMode: mode.id, agentEnabled: false },
				recovered: { currentMode: mode.id, persistedMode: mode.id, agentEnabled: true },
				writes: [mode.id],
			});
		});
	}

	test('clears an agent scoped to the previous harness', () => {
		const scopedMode = upcastPartial<IChatMode>({
			...customMode,
			sessionTypes: ['remote-agent-host-test-copilotcli'],
		});
		const harness = createInput(scopedMode);
		const checkModeInSessionPool = Reflect.get(ChatInputPart.prototype, 'checkModeInSessionPool') as (this: ChatInputPart, sessionType: string) => void;

		checkModeInSessionPool.call(harness.input, 'local');

		assert.deepStrictEqual({ ...harness.snapshot(), writes: harness.persistedModes }, {
			currentMode: 'agent',
			persistedMode: 'test-custom-agent',
			agentEnabled: true,
			writes: [],
		});
	});

	test('preserves Agent when constructed while the refresh gate is already active', () => {
		const harness = createInput(ChatMode.Agent, refreshGate, false);
		harness.input.validateAgentMode();
		harness.input.flushInputStateToModel();

		assert.deepStrictEqual(harness.snapshot(), { currentMode: 'agent', persistedMode: 'agent', agentEnabled: false });
	});

	test('applies a resolved Agent-disabled policy even when enablement stays false', async () => {
		const harness = createInput();
		harness.setGate(refreshGate);
		await harness.setAgentEnabled(false);
		harness.setGate(inactiveGate);

		assert.deepStrictEqual({ ...harness.snapshot(), writes: harness.persistedModes }, {
			currentMode: 'ask', persistedMode: 'ask', agentEnabled: false, writes: ['ask'],
		});
	});

	test('continues to fall back to Ask when Agent is disabled outside the refresh gate', async () => {
		const harness = createInput();
		await harness.setAgentEnabled(false);

		assert.deepStrictEqual(harness.snapshot(), { currentMode: 'ask', persistedMode: 'ask', agentEnabled: false });
	});

	test('continues to validate other account restrictions', async () => {
		const harness = createInput();
		harness.setGate({ state: AccountPolicyGateState.Restricted, reason: AccountPolicyGateUnsatisfiedReason.OrgNotApproved });
		await harness.setAgentEnabled(false);

		assert.deepStrictEqual(harness.snapshot(), { currentMode: 'ask', persistedMode: 'ask', agentEnabled: false });
	});

	test('does not change an existing Ask selection when the gate clears', async () => {
		const harness = createInput(ChatMode.Ask);
		harness.setGate(refreshGate);
		await harness.setAgentEnabled(false);
		await harness.setAgentEnabled(true);
		harness.setGate(inactiveGate);

		assert.deepStrictEqual({ ...harness.snapshot(), writes: harness.persistedModes }, {
			currentMode: 'ask', persistedMode: 'ask', agentEnabled: true, writes: [],
		});
	});
});
