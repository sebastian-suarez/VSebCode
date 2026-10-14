/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { Schemas } from '../../../../../base/common/network.js';
import { URI } from '../../../../../base/common/uri.js';
import { mock } from '../../../../../base/test/common/mock.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { TestConfigurationService } from '../../../../../platform/configuration/test/common/testConfigurationService.js';
import { FileService } from '../../../../../platform/files/common/fileService.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { InMemoryFileSystemProvider } from '../../../../../platform/files/common/inMemoryFilesystemProvider.js';
import { TestInstantiationService } from '../../../../../platform/instantiation/test/common/instantiationServiceMock.js';
import { NullLogService } from '../../../../../platform/log/common/log.js';
import { IRemoteAuthorityResolverService, WebSocketRemoteConnection } from '../../../../../platform/remote/common/remoteAuthorityResolver.js';
import { IStorageService, StorageScope, StorageTarget } from '../../../../../platform/storage/common/storage.js';
import { IWorkspaceContextService, toWorkspaceFolder } from '../../../../../platform/workspace/common/workspace.js';
import { IWorkspaceTrustEnablementService, IWorkspaceTrustInfo } from '../../../../../platform/workspace/common/workspaceTrust.js';
import { Workspace } from '../../../../../platform/workspace/test/common/testWorkspace.js';
import { Memento } from '../../../../common/memento.js';
import { IWorkbenchEnvironmentService } from '../../../environment/common/environmentService.js';
import { IUriIdentityService } from '../../../../../platform/uriIdentity/common/uriIdentity.js';
import { UriIdentityService } from '../../../../../platform/uriIdentity/common/uriIdentityService.js';
import { WorkspaceTrustEnablementService, WorkspaceTrustManagementService, WORKSPACE_TRUST_STORAGE_KEY } from '../../common/workspaceTrust.js';
import { TestContextService, TestStorageService, TestWorkspaceTrustEnablementService } from '../../../../test/common/workbenchTestServices.js';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../../base/test/common/utils.js';
import { Mutable } from '../../../../../base/common/types.js';

suite('Workspace Trust', () => {
	const store = ensureNoDisposablesAreLeakedInTestSuite();

	let instantiationService: TestInstantiationService;
	let configurationService: TestConfigurationService;
	let environmentService: Mutable<IWorkbenchEnvironmentService>;

	setup(async () => {
		instantiationService = store.add(new TestInstantiationService());

		configurationService = new TestConfigurationService();
		instantiationService.stub(IConfigurationService, configurationService);

		environmentService = {} as IWorkbenchEnvironmentService;
		instantiationService.stub(IWorkbenchEnvironmentService, environmentService);

		const fileService = store.add(new FileService(new NullLogService()));
		const uriIdentityService = store.add(new UriIdentityService(fileService));

		instantiationService.stub(IFileService, fileService);
		instantiationService.stub(IUriIdentityService, uriIdentityService);
		instantiationService.stub(IRemoteAuthorityResolverService, new class extends mock<IRemoteAuthorityResolverService>() { });
	});

	suite('Enablement', () => {
		test('workspace trust enabled', async () => {
			await configurationService.setUserConfiguration('security', getUserSettings(true, true));
			const testObject = store.add(instantiationService.createInstance(WorkspaceTrustEnablementService));

			assert.strictEqual(testObject.isWorkspaceTrustEnabled(), true);
		});

		test('workspace trust disabled (user setting)', async () => {
			await configurationService.setUserConfiguration('security', getUserSettings(false, true));
			const testObject = store.add(instantiationService.createInstance(WorkspaceTrustEnablementService));

			assert.strictEqual(testObject.isWorkspaceTrustEnabled(), false);
		});

		test('workspace trust disabled (--disable-workspace-trust)', () => {
			instantiationService.stub(IWorkbenchEnvironmentService, { ...environmentService, disableWorkspaceTrust: true });
			const testObject = store.add(instantiationService.createInstance(WorkspaceTrustEnablementService));

			assert.strictEqual(testObject.isWorkspaceTrustEnabled(), false);
		});
	});

	suite('Management', () => {
		let storageService: TestStorageService;
		let workspaceService: TestContextService;

		teardown(() => {
			Memento.clear(StorageScope.WORKSPACE);
		});

		setup(() => {
			storageService = store.add(new TestStorageService());
			instantiationService.stub(IStorageService, storageService);

			workspaceService = new TestContextService();
			instantiationService.stub(IWorkspaceContextService, workspaceService);

			instantiationService.stub(IWorkspaceTrustEnablementService, new TestWorkspaceTrustEnablementService());
		});

		test('empty workspace - trusted', async () => {
			await configurationService.setUserConfiguration('security', getUserSettings(true, true));
			workspaceService.setWorkspace(new Workspace('empty-workspace'));
			const testObject = await initializeTestObject();

			assert.strictEqual(true, testObject.isWorkspaceTrusted());
		});

		test('empty workspace - untrusted', async () => {
			await configurationService.setUserConfiguration('security', getUserSettings(true, false));
			workspaceService.setWorkspace(new Workspace('empty-workspace'));
			const testObject = await initializeTestObject();

			assert.strictEqual(false, testObject.isWorkspaceTrusted());
		});

		test('empty workspace - trusted, open trusted file', async () => {
			await configurationService.setUserConfiguration('security', getUserSettings(true, true));
			const trustInfo: IWorkspaceTrustInfo = { uriTrustInfo: [{ uri: URI.parse('file:///Folder'), trusted: true }] };
			storageService.store(WORKSPACE_TRUST_STORAGE_KEY, JSON.stringify(trustInfo), StorageScope.APPLICATION_SHARED, StorageTarget.MACHINE);

			environmentService.filesToOpenOrCreate = [{ fileUri: URI.parse('file:///Folder/file.txt') }];
			instantiationService.stub(IWorkbenchEnvironmentService, { ...environmentService });

			workspaceService.setWorkspace(new Workspace('empty-workspace'));
			const testObject = await initializeTestObject();

			assert.strictEqual(true, testObject.isWorkspaceTrusted());
		});

		test('empty workspace - trusted, open untrusted file', async () => {
			await configurationService.setUserConfiguration('security', getUserSettings(true, true));

			environmentService.filesToOpenOrCreate = [{ fileUri: URI.parse('file:///Folder/foo.txt') }];
			instantiationService.stub(IWorkbenchEnvironmentService, { ...environmentService });

			workspaceService.setWorkspace(new Workspace('empty-workspace'));
			const testObject = await initializeTestObject();

			assert.strictEqual(false, testObject.isWorkspaceTrusted());
		});

		test('remote workspace does not inherit trust through backslash traversal', async () => {
			await configurationService.setUserConfiguration('security', getUserSettings(true, true));
			const root = URI.from({ scheme: Schemas.vscodeRemote, authority: 'host', path: '/c:/lab/ws' });
			const workspaceUri = URI.parse(`${root.toString()}/..%5Cevilfolder`);
			environmentService.remoteAuthority = root.authority;
			store.add(instantiationService.get(IFileService).registerProvider(Schemas.vscodeRemote, store.add(new InMemoryFileSystemProvider())));
			instantiationService.stub(IRemoteAuthorityResolverService, {
				getCanonicalURI: async uri => uri,
				resolveAuthority: async authority => ({
					authority: { authority, connectTo: new WebSocketRemoteConnection('localhost', 0), connectionToken: undefined }
				}),
			});
			workspaceService.setWorkspace(new Workspace('remote-workspace', [toWorkspaceFolder(workspaceUri)]));
			const testObject = await initializeTestObject();
			await testObject.workspaceResolved;
			await testObject.setUrisTrust([root], true);

			const uris = [
				workspaceUri,
				URI.parse(`${root.toString()}/../evilfolder`),
				root.with({ path: '/c:/lab/evilfolder' }),
				URI.parse(`${root.toString()}/child`),
			];
			const trustInfo = await Promise.all(uris.map(uri => testObject.getUriTrustInfo(uri)));
			assert.deepStrictEqual({
				workspaceTrusted: testObject.isWorkspaceTrusted(),
				uriTrust: trustInfo.map(info => info.trusted),
			}, {
				workspaceTrusted: false,
				uriTrust: [false, false, false, true],
			});
		});

		test('setWorkspaceTrust waits for trust transition participants before resolving', async () => {
			await configurationService.setUserConfiguration('security', getUserSettings(true, true));
			workspaceService.setWorkspace(new Workspace('folder-workspace', [toWorkspaceFolder(URI.parse('file:///Folder'))]));
			const testObject = await initializeTestObject();

			let releaseParticipant!: () => void;
			const participantCanComplete = new Promise<void>(resolve => releaseParticipant = resolve);

			let participantStartedResolve!: () => void;
			const participantStarted = new Promise<void>(resolve => participantStartedResolve = resolve);

			let participantStartedFlag = false;
			let participantCompleted = false;
			let trustChangeEventFired = false;

			const participantCompletedPromise = new Promise<void>(resolve => {
				store.add(testObject.addWorkspaceTrustTransitionParticipant({
					async participate(trusted: boolean): Promise<void> {
						if (trusted) {
							participantStartedFlag = true;
							participantStartedResolve();
							await participantCanComplete;
							participantCompleted = true;
							resolve();
						}
					}
				}));
			});

			store.add(testObject.onDidChangeTrust(trusted => {
				if (trusted) {
					trustChangeEventFired = true;
				}
			}));

			await testObject.setWorkspaceTrust(false);
			assert.deepStrictEqual({
				trusted: testObject.isWorkspaceTrusted(),
				participantStarted: participantStartedFlag,
				participantCompleted,
				trustChangeEventFired
			}, {
				trusted: false,
				participantStarted: false,
				participantCompleted: false,
				trustChangeEventFired: false
			});

			const setWorkspaceTrustPromise = testObject.setWorkspaceTrust(true);
			let setWorkspaceTrustResolved = false;
			setWorkspaceTrustPromise.then(() => setWorkspaceTrustResolved = true);

			try {
				await participantStarted;
				await Promise.resolve();

				assert.deepStrictEqual({
					setWorkspaceTrustResolved,
					trusted: testObject.isWorkspaceTrusted(),
					participantStarted: participantStartedFlag,
					participantCompleted,
					trustChangeEventFired
				}, {
					setWorkspaceTrustResolved: false,
					trusted: true,
					participantStarted: true,
					participantCompleted: false,
					trustChangeEventFired: false
				});
			} finally {
				releaseParticipant();
				await participantCompletedPromise;
			}

			await setWorkspaceTrustPromise;
			await Promise.resolve();

			assert.deepStrictEqual({
				setWorkspaceTrustResolved,
				trusted: testObject.isWorkspaceTrusted(),
				participantCompleted,
				trustChangeEventFired
			}, {
				setWorkspaceTrustResolved: true,
				trusted: true,
				participantCompleted: true,
				trustChangeEventFired: true
			});
		});

		async function initializeTestObject(): Promise<WorkspaceTrustManagementService> {
			const workspaceTrustManagementService = store.add(instantiationService.createInstance(WorkspaceTrustManagementService));
			await workspaceTrustManagementService.workspaceTrustInitialized;

			return workspaceTrustManagementService;
		}
	});

	function getUserSettings(enabled: boolean, emptyWindow: boolean) {
		return { workspace: { trust: { emptyWindow, enabled } } };
	}
});
