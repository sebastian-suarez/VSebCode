/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { toDisposable } from '../../../../../base/common/lifecycle.js';
import { Schemas } from '../../../../../base/common/network.js';
import { extUri } from '../../../../../base/common/resources.js';
import { URI } from '../../../../../base/common/uri.js';
import { upcastPartial } from '../../../../../base/test/common/mock.js';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../../base/test/common/utils.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { FileOperationError, FileOperationResult, IFileService, IFileStatWithPartialMetadata } from '../../../../../platform/files/common/files.js';
import { TestInstantiationService } from '../../../../../platform/instantiation/test/common/instantiationServiceMock.js';
import { IOpener, IOpenerService } from '../../../../../platform/opener/common/opener.js';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';
import { REVEAL_IN_EXPLORER_COMMAND_ID } from '../../../files/browser/fileConstants.js';
import { WorkbenchOpenerContribution } from '../../browser/opener.contribution.js';

suite('WorkbenchOpenerContribution', () => {
	const store = ensureNoDisposablesAreLeakedInTestSuite();
	const root = URI.file('/workspace/project');

	function createOpener(options: { roots?: URI[]; isDirectory?: boolean; statError?: Error } = {}) {
		const instantiation = store.add(new TestInstantiationService());
		const calls: object[] = [];
		let registered: IOpener | undefined;
		instantiation.stub(IOpenerService, upcastPartial<IOpenerService>({
			registerOpener: opener => {
				registered = opener;
				return toDisposable(() => { registered = undefined; });
			},
			open: async (uri, openOptions) => {
				calls.push({ external: uri.toString(), options: openOptions });
				assert.strictEqual(await registered!.open(uri, openOptions), false);
				return true;
			},
		}));
		instantiation.stub(ICommandService, upcastPartial<ICommandService>({
			executeCommand: async (id, uri: URI) => { calls.push({ command: id, uri: uri.toString() }); },
		}));
		instantiation.stub(IWorkspaceContextService, upcastPartial<IWorkspaceContextService>({
			isInsideWorkspace: uri => (options.roots ?? [root]).some(folder => extUri.isEqualOrParent(uri, folder)),
		}));
		instantiation.stub(IFileService, upcastPartial<IFileService>({
			hasProvider: uri => [Schemas.file, Schemas.vscodeRemote].includes(uri.scheme),
			stat: async uri => {
				calls.push({ stat: uri.toString() });
				if (options.statError) {
					throw options.statError;
				}
				return upcastPartial<IFileStatWithPartialMetadata>({ isDirectory: options.isDirectory ?? true });
			},
		}));
		const opener = store.add(instantiation.createInstance(WorkbenchOpenerContribution));
		return { opener, calls, get registered() { return registered; } };
	}

	for (const uri of [root, URI.file('/workspace/project/nested/'), URI.from({ scheme: Schemas.vscodeRemote, authority: 'ssh-remote+host', path: '/project/src' })]) {
		test(`reveals workspace folders through the existing command (${uri.toString()})`, async () => {
			const { opener, calls } = createOpener({ roots: [root, uri.with({ path: '/project' })] });
			assert.deepStrictEqual({ handled: await opener.open(uri), calls }, {
				handled: true,
				calls: [{ stat: uri.toString() }, { command: REVEAL_IN_EXPLORER_COMMAND_ID, uri: uri.toString() }],
			});
		});
	}

	test('preserves file opening', async () => {
		const { opener, calls } = createOpener({ isDirectory: false });
		assert.deepStrictEqual({ handled: await opener.open(root), calls }, { handled: false, calls: [{ stat: root.toString() }] });
	});

	test('normalizes paths and strips line selections before checking folders', async () => {
		const { opener, calls } = createOpener();
		await opener.open(URI.file('/workspace/project/src/../nested').with({ fragment: 'L12' }).toString());
		const uri = URI.file('/workspace/project/nested').toString();
		assert.deepStrictEqual(calls, [{ stat: uri }, { command: REVEAL_IN_EXPLORER_COMMAND_ID, uri }]);
	});

	for (const { uri, roots } of [
		{ uri: URI.file('/elsewhere/folder with spaces'), roots: [root] },
		{ uri: URI.file('/workspace/project-other'), roots: [root] },
		{ uri: root, roots: [] },
	]) {
		test(`leaves local folders outside the workspace to the default opener (${uri.toString()}, roots: ${roots.length})`, async () => {
			const { opener, calls } = createOpener({ roots });
			assert.deepStrictEqual({ handled: await opener.open(uri, { fromUserGesture: true }), calls }, { handled: false, calls: [] });
		});
	}

	for (const uri of [URI.parse('https://example.com'), URI.parse('command:example'), URI.parse('untitled:example'), URI.parse('vscode-remote://host/elsewhere')]) {
		test(`does not intercept unrelated links: ${uri.toString()}`, async () => {
			const { opener, calls } = createOpener();
			assert.deepStrictEqual({ handled: await opener.open(uri), calls }, { handled: false, calls: [] });
		});
	}

	test('does not intercept explicitly external links', async () => {
		const { opener, calls } = createOpener();
		assert.deepStrictEqual({ handled: await opener.open(root, { openExternal: true }), calls }, { handled: false, calls: [] });
	});

	test('leaves missing paths to the default opener', async () => {
		const { opener } = createOpener({ statError: new FileOperationError('Missing', FileOperationResult.FILE_NOT_FOUND) });
		assert.strictEqual(await opener.open(root), false);
	});

	test('propagates unexpected stat errors', async () => {
		const error = new FileOperationError('Permission denied', FileOperationResult.FILE_PERMISSION_DENIED);
		const { opener } = createOpener({ statError: error });
		await assert.rejects(opener.open(root), error);
	});

	test('unregisters on disposal', () => {
		const fixture = createOpener();
		assert.strictEqual(fixture.registered, fixture.opener);
		fixture.opener.dispose();
		assert.strictEqual(fixture.registered, undefined);
	});
});
