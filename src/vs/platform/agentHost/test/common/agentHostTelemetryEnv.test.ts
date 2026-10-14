/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../base/test/common/utils.js';
import { AgentHostMachineIdEnvKey, buildAgentHostTelemetryIdEnv } from '../../common/agentHostTelemetryEnv.js';

suite('agentHostTelemetryEnv', () => {
	ensureNoDisposablesAreLeakedInTestSuite();

	test('buildAgentHostTelemetryIdEnv forwards a present machine id and omits an empty one', () => {
		assert.deepStrictEqual([
			buildAgentHostTelemetryIdEnv({ machineId: 'm1' }),
			buildAgentHostTelemetryIdEnv({ machineId: '' }),
		], [
			{ [AgentHostMachineIdEnvKey]: 'm1' },
			{},
		]);
	});
});
