/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import * as sinon from 'sinon';
import { Event } from '../../../../base/common/event.js';
import { joinPath } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { mock } from '../../../../base/test/common/mock.js';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../base/test/common/utils.js';
import { IConfigurationService } from '../../../configuration/common/configuration.js';
import { TestConfigurationService } from '../../../configuration/test/common/testConfigurationService.js';
import { IDownloadService } from '../../../download/common/download.js';
import { INativeEnvironmentService } from '../../../environment/common/environment.js';
import { ExtensionType, TargetPlatform } from '../../../extensions/common/extensions.js';
import { FileService } from '../../../files/common/fileService.js';
import { IFileService } from '../../../files/common/files.js';
import { InMemoryFileSystemProvider } from '../../../files/common/inMemoryFilesystemProvider.js';
import { TestInstantiationService } from '../../../instantiation/test/common/instantiationServiceMock.js';
import { ILogService, NullLogService } from '../../../log/common/log.js';
import { IProductService } from '../../../product/common/productService.js';
import { ITelemetryService } from '../../../telemetry/common/telemetry.js';
import { NullTelemetryService } from '../../../telemetry/common/telemetryUtils.js';
import { IUriIdentityService } from '../../../uriIdentity/common/uriIdentity.js';
import { UriIdentityService } from '../../../uriIdentity/common/uriIdentityService.js';
import { IUserDataProfilesService } from '../../../userDataProfile/common/userDataProfile.js';
import { IExtensionGalleryManifestService } from '../../common/extensionGalleryManifest.js';
import { ExtensionManagementErrorCode, ExtensionSignatureVerificationCode, IAllowedExtensionsService, IExtensionGalleryService, IGalleryExtension, ILocalExtension, InstallOperation, VerifyExtensionSignatureConfigKey } from '../../common/extensionManagement.js';
import { IExtensionsProfileScannerService, IScannedProfileExtension } from '../../common/extensionsProfileScannerService.js';
import { IExtensionsScannerService } from '../../common/extensionsScannerService.js';
import { ExtensionsDownloader } from '../../node/extensionDownloader.js';
import { ExtensionManagementService, ExtensionsScanner } from '../../node/extensionManagementService.js';

class TestExtensionManagementService extends ExtensionManagementService {

	override async getTargetPlatform(): Promise<TargetPlatform> {
		return TargetPlatform.DARWIN_ARM64;
	}
}

class TestExtensionsDownloader extends mock<ExtensionsDownloader>() {
	override readonly download = sinon.stub<Parameters<ExtensionsDownloader['download']>, ReturnType<ExtensionsDownloader['download']>>();
	override readonly delete = sinon.stub<[URI], Promise<void>>();
	override dispose(): void { }
}

suite('Native ExtensionManagementService - packaged downloads', () => {
	const disposables = ensureNoDisposablesAreLeakedInTestSuite();
	const root = URI.from({ scheme: 'vscode-tests', path: '/extensions' });
	const location = joinPath(root, 'pub.extension-1.0.0.vsix');
	const extension = new class extends mock<IGalleryExtension>() {
		override readonly identifier = { id: 'pub.extension', uuid: 'extension-uuid' };
		override readonly isSigned = true;
		override readonly private = false;
	};
	let instantiationService: TestInstantiationService;
	let downloader: TestExtensionsDownloader;
	let configurationService: TestConfigurationService;
	let requireSignature: boolean;

	setup(async () => {
		instantiationService = disposables.add(new TestInstantiationService());
		const logService = new NullLogService();
		const fileService = disposables.add(new FileService(logService));
		disposables.add(fileService.registerProvider(root.scheme, disposables.add(new InMemoryFileSystemProvider())));
		await fileService.createFolder(root);
		instantiationService.stub(ILogService, logService);
		instantiationService.stub(IFileService, fileService);
		instantiationService.stub(IUriIdentityService, disposables.add(new UriIdentityService(fileService)));
		instantiationService.stub(INativeEnvironmentService, { isBuilt: true });
		instantiationService.stub(IProductService, { version: '1.143.0', quality: 'stable' });
		instantiationService.stub(ITelemetryService, NullTelemetryService);
		instantiationService.stub(IExtensionGalleryService, { isEnabled: () => true });
		instantiationService.stub(IAllowedExtensionsService, {});
		instantiationService.stub(IDownloadService, {});
		instantiationService.stub(IUserDataProfilesService, { profiles: [], onDidChangeProfiles: Event.None });
		instantiationService.stub(IExtensionsScannerService, {
			userExtensionsLocation: root,
			async initializeDefaultProfileExtensions() { },
		});
		instantiationService.stub(IExtensionsProfileScannerService, {
			onAddExtensions: Event.None,
			onDidAddExtensions: Event.None,
			onRemoveExtensions: Event.None,
			onDidRemoveExtensions: Event.None,
		});
		instantiationService.stubInstance(ExtensionsScanner, {
			onExtract: Event.None,
			async scanAllUserExtensions() { return []; },
			dispose() { },
		});
		requireSignature = true;
		instantiationService.stub(IExtensionGalleryManifestService, {
			async getExtensionGalleryManifest() {
				return { version: '1.0.0', resources: [], capabilities: { extensionQuery: {}, signing: { allPublicRepositorySigned: requireSignature } } };
			},
		});
		configurationService = new TestConfigurationService();
		disposables.add(configurationService.onDidChangeConfigurationEmitter);
		instantiationService.stub(IConfigurationService, configurationService);
		downloader = new TestExtensionsDownloader();
		downloader.delete.resolves();
		instantiationService.stubInstance(ExtensionsDownloader, downloader);
	});

	teardown(() => sinon.restore());

	test('distribution block rejects gallery installs even when optional safety checks are disabled', async () => {
		await configurationService.setUserConfiguration('extensions.excludeUnsafes', false);
		await configurationService.setUserConfiguration('extensions.allowed', { '*': true });
		instantiationService.stub(IAllowedExtensionsService, { isAllowed: () => true });
		const service = disposables.add(instantiationService.createInstance(TestExtensionManagementService));
		const blocked = new class extends mock<IGalleryExtension>() {
			override readonly identifier = { id: 'MS-VSCODE-REMOTE.REMOTE-SSH', uuid: 'blocked-uuid' };
		};
		assert.notStrictEqual(await service.canInstall(blocked), true);
		await assert.rejects(service.installFromGallery(blocked, { profileLocation: root, installGivenVersion: true, donotVerifySignature: true }), { code: ExtensionManagementErrorCode.Unsupported });
		assert.strictEqual(downloader.download.called, false);
	});

	test('deprecation migration rejects a blocked replacement before requesting it', async () => {
		let galleryRequests = 0;
		let manifestRequests = 0;
		instantiationService.stub(IExtensionGalleryService, {
			isEnabled: () => true,
			async getExtensionsControlManifest() {
				return { malicious: [], deprecated: { 'pub.extension': { extension: { id: 'ms-vscode-remote.remote-ssh', displayName: 'Remote SSH', autoMigrate: { storage: false } } } }, search: [], autoUpdate: {} };
			},
			async getExtensions() {
				galleryRequests++;
				return [];
			},
			async getManifest() {
				manifestRequests++;
				return null;
			},
		});
		const service = disposables.add(instantiationService.createInstance(TestExtensionManagementService));
		await assert.rejects(service.installFromGallery(extension, { profileLocation: root }), { code: ExtensionManagementErrorCode.Unsupported });
		assert.deepStrictEqual([galleryRequests, manifestRequests, downloader.download.called], [0, 0, false]);
	});

	test('blocked extensions retain metadata-only copy and move operations but reject replacement or new registration', async () => {
		const local = new class extends mock<ILocalExtension>() {
			override readonly identifier = { id: 'ms-vscode-remote.remote-ssh' };
			override readonly location = joinPath(root, 'remote-ssh');
			override readonly type = ExtensionType.User;
		};
		const scanned: IScannedProfileExtension = { identifier: local.identifier, version: '1.0.0', location: local.location, metadata: {} };
		let target: IScannedProfileExtension | undefined = scanned;
		let metadataUpdates = 0;
		const destination = joinPath(root, 'destination');
		const profileScanner = instantiationService.stub(IExtensionsProfileScannerService, {
			async scanProfileExtensions(profile) { return profile.toString() === destination.toString() ? (target ? [target] : []) : [scanned]; },
			async updateMetadata() { metadataUpdates++; return []; },
			async addExtensionsToProfile() { throw new Error('Unexpected installation'); },
			async removeExtensionsFromProfile() { throw new Error('Unexpected removal'); },
		});
		const scanner = disposables.add(new ExtensionsScanner(async () => { }, instantiationService.get(IFileService), instantiationService.get(IExtensionsScannerService), profileScanner, instantiationService.get(IUriIdentityService), NullTelemetryService, new NullLogService()));
		sinon.stub(scanner, 'scanLocalExtension').resolves(local);
		for (const operation of ['copyExtension', 'moveExtension'] as const) {
			target = scanned;
			assert.strictEqual(await scanner[operation](local, root, destination, { pinned: true }), local);
			target = { ...scanned, location: joinPath(root, 'old-remote-ssh') };
			await assert.rejects(scanner[operation](local, root, destination, {}), { code: ExtensionManagementErrorCode.Unsupported });
			target = undefined;
			await assert.rejects(scanner[operation](local, root, destination, {}), { code: ExtensionManagementErrorCode.Unsupported });
		}
		assert.strictEqual(metadataUpdates, 2);
	});

	test('profile batches skip blocked extensions while retaining permitted copies', async () => {
		const makeLocal = (id: string) => new class extends mock<ILocalExtension>() {
			override readonly identifier = { id };
			override readonly location = joinPath(root, id);
			override readonly type = ExtensionType.User;
			override readonly targetPlatform = TargetPlatform.UNIVERSAL;
			override readonly manifest = { publisher: id.split('.')[0], name: id.split('.')[1], version: '1.0.0', engines: { vscode: '*' } };
		};
		const blocked = makeLocal('ms-vscode-remote.remote-ssh');
		const permitted = makeLocal('parity.generic');
		const copied: string[][] = [];
		const warnings: string[] = [];
		const logService = new class extends NullLogService {
			override warn(message: string): void { warnings.push(message); }
		};
		instantiationService.stub(ILogService, logService);
		const profileScanner = instantiationService.stub(IExtensionsProfileScannerService, {
			onAddExtensions: Event.None, onDidAddExtensions: Event.None, onRemoveExtensions: Event.None, onDidRemoveExtensions: Event.None,
			async addExtensionsToProfile(extensions) { copied.push(extensions.map(([extension]) => extension.identifier.id)); return []; },
		});
		const scanner = disposables.add(new ExtensionsScanner(async () => { }, instantiationService.get(IFileService), instantiationService.get(IExtensionsScannerService), profileScanner, instantiationService.get(IUriIdentityService), NullTelemetryService, logService));
		sinon.stub(scanner, 'scanAllUserExtensions').resolves([]);
		sinon.stub(scanner, 'scanExtensions').resolves([blocked, permitted]);
		sinon.stub(scanner, 'scanMetadata').resolves({ source: 'gallery' });
		const maintenance = sinon.stub(scanner, 'unsetExtensionsForRemoval').resolves();
		const destination = joinPath(root, 'destination');
		await scanner.copyExtensions(root, destination, { version: '1.143.0' });
		instantiationService.stubInstance(ExtensionsScanner, scanner);
		const service = disposables.add(instantiationService.createInstance(TestExtensionManagementService));
		const installed = await service.installExtensionsFromProfile([blocked.identifier, permitted.identifier], root, destination);
		assert.deepStrictEqual({ copied, installed: installed.map(extension => extension.identifier.id), maintenance: maintenance.firstCall.args.map(key => key.id), warnings: warnings.length }, {
			copied: [['parity.generic'], ['parity.generic']], installed: ['parity.generic'], maintenance: ['parity.generic'], warnings: 2
		});
	});

	for (const configuredValue of [undefined, true]) {
		test(`packaged download succeeds without the optional verifier (verification setting: ${configuredValue})`, async () => {
			await configurationService.setUserConfiguration(VerifyExtensionSignatureConfigKey, configuredValue);
			downloader.download.resolves({ location, verificationStatus: undefined });
			const service = disposables.add(instantiationService.createInstance(TestExtensionManagementService));

			const actual = await service.download(extension, InstallOperation.Install, false);

			assert.deepStrictEqual({ location: actual, downloadArguments: downloader.download.firstCall.args, deleted: downloader.delete.called }, {
				location,
				downloadArguments: [extension, InstallOperation.Install, true, undefined],
				deleted: false,
			});
		});
	}

	test('packaged download succeeds when verification succeeds', async () => {
		downloader.download.resolves({ location, verificationStatus: ExtensionSignatureVerificationCode.Success });
		const service = disposables.add(instantiationService.createInstance(TestExtensionManagementService));

		assert.deepStrictEqual({ location: await service.download(extension, InstallOperation.Install, false), deleted: downloader.delete.called }, { location, deleted: false });
	});

	for (const [verificationStatus, code] of [
		[ExtensionSignatureVerificationCode.PackageIntegrityCheckFailed, ExtensionManagementErrorCode.SignatureVerificationFailed],
		[ExtensionSignatureVerificationCode.SignatureIsInvalid, ExtensionManagementErrorCode.SignatureVerificationFailed],
		[ExtensionSignatureVerificationCode.NotSigned, ExtensionManagementErrorCode.SignatureVerificationFailed],
		[ExtensionSignatureVerificationCode.UnknownError, ExtensionManagementErrorCode.SignatureVerificationInternal],
	] as const) {
		test(`packaged download rejects ${verificationStatus} and deletes the download`, async () => {
			downloader.download.resolves({ location, verificationStatus });
			const service = disposables.add(instantiationService.createInstance(TestExtensionManagementService));

			await assert.rejects(service.download(extension, InstallOperation.Install, false), { code });
			assert.deepStrictEqual(downloader.delete.args, [[location]]);
		});
	}

	test('packaged download accepts unsigned extensions when the gallery does not require signatures', async () => {
		requireSignature = false;
		downloader.download.resolves({ location, verificationStatus: ExtensionSignatureVerificationCode.NotSigned });
		const service = disposables.add(instantiationService.createInstance(TestExtensionManagementService));

		assert.deepStrictEqual({ location: await service.download(extension, InstallOperation.Install, false), deleted: downloader.delete.called }, { location, deleted: false });
	});
});
