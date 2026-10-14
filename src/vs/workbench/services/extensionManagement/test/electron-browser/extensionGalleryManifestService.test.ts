/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { bufferToStream, VSBuffer } from '../../../../../base/common/buffer.js';
import { Event } from '../../../../../base/common/event.js';
import { IRequestContext, IRequestOptions } from '../../../../../base/parts/request/common/request.js';
import { mock } from '../../../../../base/test/common/mock.js';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../../base/test/common/utils.js';
import { TestConfigurationService } from '../../../../../platform/configuration/test/common/testConfigurationService.js';
import { IConfigurationChangeEvent, IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IEnvironmentService } from '../../../../../platform/environment/common/environment.js';
import { ExtensionGalleryManifestStatus, ExtensionGalleryServiceUrlConfigKey } from '../../../../../platform/extensionManagement/common/extensionGalleryManifest.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { TestInstantiationService } from '../../../../../platform/instantiation/test/common/instantiationServiceMock.js';
import { ISharedProcessService } from '../../../../../platform/ipc/electron-browser/services.js';
import { ILogService, NullLogService } from '../../../../../platform/log/common/log.js';
import { IProductService } from '../../../../../platform/product/common/productService.js';
import { IRequestService } from '../../../../../platform/request/common/request.js';
import { IStorageService, StorageScope, StorageTarget } from '../../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../../platform/telemetry/common/telemetry.js';
import { NullTelemetryService } from '../../../../../platform/telemetry/common/telemetryUtils.js';
import { IConfirmation, IDialogService } from '../../../../../platform/dialogs/common/dialogs.js';
import { IHostService } from '../../../host/browser/host.js';
import { IRemoteAgentService } from '../../../remote/common/remoteAgentService.js';
import { WorkbenchExtensionGalleryManifestService } from '../../electron-browser/extensionGalleryManifestService.js';

function mockResponse(statusCode: number, body: object): IRequestContext {
	return {
		res: { headers: {}, statusCode },
		stream: bufferToStream(VSBuffer.fromString(JSON.stringify(body))),
	};
}

// Gallery manifest response stub. A well-formed manifest with an (empty) `resources` array is a
// valid service index.
function createGalleryManifest() {
	return {
		version: '1.0',
		resources: [],
	};
}

suite('WorkbenchExtensionGalleryManifestService', () => {

	const disposableStore = ensureNoDisposablesAreLeakedInTestSuite();

	let instantiationService: TestInstantiationService;
	let requestHandler: (options: IRequestOptions) => IRequestContext | Promise<IRequestContext>;
	let requestedUrls: string[];
	let configurationService: TestConfigurationService;
	let storageData: Map<string, string>;
	let restartPrompts: string[];

	setup(() => {
		requestHandler = () => mockResponse(200, createGalleryManifest());
		requestedUrls = [];
		storageData = new Map();
		restartPrompts = [];

		configurationService = new TestConfigurationService({
			[ExtensionGalleryServiceUrlConfigKey]: 'https://marketplace.example.com',
		});

		instantiationService = disposableStore.add(new TestInstantiationService());

		instantiationService.stub(IProductService, {
			version: '1.0.0',
			extensionsGallery: {
				serviceUrl: 'https://default-marketplace.example.com',
				controlUrl: '',
				extensionUrlTemplate: '',
				resourceUrlTemplate: '',
				nlsBaseUrl: '',
			},
			nameLong: 'VS Code Test',
		});

		instantiationService.stub(IEnvironmentService, new class extends mock<IEnvironmentService>() {
		}());

		instantiationService.stub(IFileService, new class extends mock<IFileService>() {
		}());

		instantiationService.stub(ITelemetryService, NullTelemetryService);

		instantiationService.stub(IStorageService, new class extends mock<IStorageService>() {
			override get(key: string, _scope: StorageScope, fallbackValue: string): string;
			override get(key: string, _scope: StorageScope, fallbackValue?: string): string | undefined;
			override get(key: string, _scope: StorageScope, fallbackValue?: string): string | undefined {
				return storageData.get(key) ?? fallbackValue;
			}
			override store(key: string, value: string, _scope: StorageScope, _target: StorageTarget): void {
				storageData.set(key, value);
			}
			override remove(key: string, _scope: StorageScope): void {
				storageData.delete(key);
			}
		}());

		instantiationService.stub(IRemoteAgentService, new class extends mock<IRemoteAgentService>() {
			override getConnection() { return null; }
		}());

		instantiationService.stub(ISharedProcessService, new class extends mock<ISharedProcessService>() {
			override getChannel(_channelName: string): any {
				return {
					call: () => Promise.resolve(),
					listen: () => Event.None,
				};
			}
		}());

		instantiationService.stub(IConfigurationService, configurationService);

		instantiationService.stub(IRequestService, new class extends mock<IRequestService>() {
			override async request(options: IRequestOptions) {
				requestedUrls.push(options.url ?? '');
				return requestHandler(options);
			}
		}());

		instantiationService.stub(ILogService, new NullLogService());

		instantiationService.stub(IDialogService, new class extends mock<IDialogService>() {
			override async confirm(confirmation: IConfirmation) { restartPrompts.push(confirmation.message); return { confirmed: false }; }
		}());

		instantiationService.stub(IHostService, new class extends mock<IHostService>() {
			override async restart() { }
		}());
	});

	function createService(): WorkbenchExtensionGalleryManifestService {
		return disposableStore.add(instantiationService.createInstance(WorkbenchExtensionGalleryManifestService));
	}

	test('configured serviceUrl — fetches the manifest from that marketplace', async () => {
		const service = createService();
		await service.getExtensionGalleryManifest();

		assert.deepStrictEqual({ status: service.extensionGalleryManifestStatus, requestedUrls }, {
			status: ExtensionGalleryManifestStatus.Available,
			requestedUrls: ['https://marketplace.example.com'],
		});
	});

	test('configured serviceUrl — manifest fetch fails → Unavailable', async () => {
		requestHandler = () => { throw new Error('network failure'); };

		const service = createService();
		await service.getExtensionGalleryManifest();

		assert.strictEqual(service.extensionGalleryManifestStatus, ExtensionGalleryManifestStatus.Unavailable);
	});

	test('no configuredServiceUrl — uses default gallery manifest', async () => {
		configurationService.setUserConfiguration(ExtensionGalleryServiceUrlConfigKey, '');

		const service = createService();
		await service.getExtensionGalleryManifest();

		// With no configured marketplace serviceUrl the base class falls back to the product's
		// default gallery → Available.
		assert.strictEqual(service.extensionGalleryManifestStatus, ExtensionGalleryManifestStatus.Available);
	});

	// --- Configuration changes ---

	function fireConfigChange(...keys: string[]) {
		configurationService.onDidChangeConfigurationEmitter.fire({
			affectsConfiguration: (key: string) => keys.includes(key),
		} as IConfigurationChangeEvent);
	}

	test('changing serviceUrl mid-session prompts for restart', async () => {
		const service = createService();
		await service.getExtensionGalleryManifest();

		fireConfigChange(ExtensionGalleryServiceUrlConfigKey);

		assert.deepStrictEqual(restartPrompts, ['VS Code Test is now configured to a different Marketplace. Please restart to apply the changes.']);
	});

	test('an unrelated configuration change does not prompt for restart', async () => {
		const service = createService();
		await service.getExtensionGalleryManifest();

		fireConfigChange('editor.fontSize');

		assert.deepStrictEqual(restartPrompts, []);
	});
});
