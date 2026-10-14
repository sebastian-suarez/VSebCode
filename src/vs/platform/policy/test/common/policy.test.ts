/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../base/test/common/utils.js';
import { IStringDictionary } from '../../../../base/common/collections.js';
import { PolicyName } from '../../../../base/common/policy.js';
import { AbstractPolicyService, PolicyDefinition, PolicyValue } from '../../common/policy.js';

class TestPolicyService extends AbstractPolicyService {
	update(name: PolicyName, value: PolicyValue | undefined): boolean {
		return this.updatePolicyValue(name, value);
	}

	protected async _updatePolicyDefinitions(_policyDefinitions: IStringDictionary<PolicyDefinition>): Promise<void> {
		// no-op: the OS/file watcher is irrelevant for these tests
	}
}

suite('AbstractPolicyService', () => {

	ensureNoDisposablesAreLeakedInTestSuite();

	test('serialize() returns the definitions with their values so policiesData can be sent over IPC', async () => {
		const service = new TestPolicyService();

		await service.updatePolicyDefinitions({
			'BooleanDefinition': { type: 'boolean' },
			'StringDefinition': { type: 'string' }
		});
		service.update('BooleanDefinition', false);

		const serialized = service.serialize();

		assert.deepStrictEqual(serialized, {
			'BooleanDefinition': { definition: { type: 'boolean' }, value: false },
			'StringDefinition': { definition: { type: 'string' }, value: undefined }
		});
		// The whole payload must be structured-clone-safe (this is how it is delivered to the
		// renderer as part of the window configuration's policiesData).
		assert.doesNotThrow(() => structuredClone(serialized));

		service.dispose();
	});

	test('tracks value changes', () => {
		const service = new TestPolicyService();
		const states: { changed: boolean; value: PolicyValue | undefined }[] = [];
		const update = (value: PolicyValue | undefined) => {
			states.push({ changed: service.update('Policy', value), value: service.getPolicyValue('Policy') });
		};

		update(false);
		update(false);
		update(true);
		update(undefined);
		update(undefined);

		assert.deepStrictEqual(states, [
			{ changed: true, value: false },
			{ changed: false, value: false },
			{ changed: true, value: true },
			{ changed: true, value: undefined },
			{ changed: false, value: undefined },
		]);

		service.dispose();
	});
});
