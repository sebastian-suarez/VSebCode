/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { VSBuffer } from '../../../../base/common/buffer.js';
import { URI } from '../../../../base/common/uri.js';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../base/test/common/utils.js';
import { IFileService } from '../../../files/common/files.js';
import { FileService } from '../../../files/common/fileService.js';
import { InMemoryFileSystemProvider } from '../../../files/common/inMemoryFilesystemProvider.js';
import { NullLogService } from '../../../log/common/log.js';
import { FilePolicyService } from '../../common/filePolicyService.js';
import { MultiplexPolicyService } from '../../common/multiplexPolicyService.js';

suite('MultiplexPolicyService', () => {

	const disposables = ensureNoDisposablesAreLeakedInTestSuite();

	let fileService: IFileService;
	let policyService: MultiplexPolicyService;
	const logService = new NullLogService();

	const policyFileA = URI.file('policyFileA').with({ scheme: 'vscode-tests' });
	const policyFileB = URI.file('policyFileB').with({ scheme: 'vscode-tests' });

	setup(async () => {
		fileService = disposables.add(new FileService(logService));
		disposables.add(fileService.registerProvider('vscode-tests', disposables.add(new InMemoryFileSystemProvider())));
		policyService = disposables.add(new MultiplexPolicyService([
			disposables.add(new FilePolicyService(policyFileA, fileService, logService)),
			disposables.add(new FilePolicyService(policyFileB, fileService, logService)),
		], logService));
	});

	test('no policy', async () => {
		const values = await policyService.updatePolicyDefinitions({ 'PolicySettingA': { type: 'string' } });

		assert.deepStrictEqual({ values, value: policyService.getPolicyValue('PolicySettingA') }, { values: {}, value: undefined });
	});

	test('merges the policies of every service', async () => {
		await fileService.writeFile(policyFileA, VSBuffer.fromString(JSON.stringify({ 'PolicySettingA': 'policyValueA' })));
		await fileService.writeFile(policyFileB, VSBuffer.fromString(JSON.stringify({ 'PolicySettingB': 'policyValueB' })));

		const values = await policyService.updatePolicyDefinitions({ 'PolicySettingA': { type: 'string' }, 'PolicySettingB': { type: 'string' } });

		assert.deepStrictEqual({ values, serialized: policyService.serialize() }, {
			values: { 'PolicySettingA': 'policyValueA', 'PolicySettingB': 'policyValueB' },
			serialized: {
				'PolicySettingA': { definition: { type: 'string' }, value: 'policyValueA' },
				'PolicySettingB': { definition: { type: 'string' }, value: 'policyValueB' },
			}
		});
	});

	test('the last service wins for overlapping policies', async () => {
		await fileService.writeFile(policyFileA, VSBuffer.fromString(JSON.stringify({ 'PolicySettingA': 'first' })));
		await fileService.writeFile(policyFileB, VSBuffer.fromString(JSON.stringify({ 'PolicySettingA': 'second' })));

		await policyService.updatePolicyDefinitions({ 'PolicySettingA': { type: 'string' } });

		assert.strictEqual(policyService.getPolicyValue('PolicySettingA'), 'second');
	});
});
