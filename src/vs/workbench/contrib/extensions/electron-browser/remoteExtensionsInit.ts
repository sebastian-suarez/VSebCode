/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IExtensionGalleryService, InstallExtensionInfo } from '../../../../platform/extensionManagement/common/extensionManagement.js';
import { areSameExtensions } from '../../../../platform/extensionManagement/common/extensionManagementUtil.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { REMOTE_DEFAULT_IF_LOCAL_EXTENSIONS } from '../../../../platform/remote/common/remote.js';
import { IRemoteExtensionsScannerService } from '../../../../platform/remote/common/remoteExtensionsScanner.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IExtensionManagementServerService } from '../../../services/extensionManagement/common/extensionManagement.js';
import { IRemoteAgentService } from '../../../services/remote/common/remoteAgentService.js';
import { IExtensionsWorkbenchService } from '../common/extensions.js';

export class InstallRemoteExtensionsContribution implements IWorkbenchContribution {
	constructor(
		@IRemoteAgentService private readonly remoteAgentService: IRemoteAgentService,
		@IRemoteExtensionsScannerService private readonly remoteExtensionsScannerService: IRemoteExtensionsScannerService,
		@IExtensionGalleryService private readonly extensionGalleryService: IExtensionGalleryService,
		@IExtensionManagementServerService private readonly extensionManagementServerService: IExtensionManagementServerService,
		@IExtensionsWorkbenchService private readonly extensionsWorkbenchService: IExtensionsWorkbenchService,
		@ILogService private readonly logService: ILogService,
		@IConfigurationService private readonly configurationService: IConfigurationService
	) {
		this.installExtensionsIfInstalledLocallyInRemote();
		this.installFailedRemoteExtensions();
	}

	private async installExtensionsIfInstalledLocallyInRemote(): Promise<void> {
		if (!this.remoteAgentService.getConnection()) {
			return;
		}

		if (!this.extensionManagementServerService.remoteExtensionManagementServer) {
			this.logService.error('No remote extension management server available');
			return;
		}

		if (!this.extensionManagementServerService.localExtensionManagementServer) {
			this.logService.error('No local extension management server available');
			return;
		}

		const settingValue = this.configurationService.getValue<string[]>(REMOTE_DEFAULT_IF_LOCAL_EXTENSIONS);
		if (!settingValue?.length) {
			return;
		}

		const alreadyInstalledLocally = await this.extensionsWorkbenchService.queryLocal(this.extensionManagementServerService.localExtensionManagementServer);
		const alreadyInstalledRemotely = await this.extensionsWorkbenchService.queryLocal(this.extensionManagementServerService.remoteExtensionManagementServer);
		const extensionsToInstall = alreadyInstalledLocally
			.filter(ext => settingValue.some(id => areSameExtensions(ext.identifier, { id })))
			.filter(ext => !alreadyInstalledRemotely.some(e => areSameExtensions(e.identifier, ext.identifier)));


		if (!extensionsToInstall.length) {
			return;
		}

		await Promise.allSettled(extensionsToInstall.map(ext => {
			this.extensionsWorkbenchService.installInServer(ext, this.extensionManagementServerService.remoteExtensionManagementServer!, { donotIncludePackAndDependencies: true });
		}));
	}

	private async installFailedRemoteExtensions(): Promise<void> {
		if (!this.remoteAgentService.getConnection()) {
			return;
		}

		const { failed } = await this.remoteExtensionsScannerService.whenExtensionsReady();
		if (failed.length === 0) {
			this.logService.trace('No extensions relayed from server');
			return;
		}

		if (!this.extensionManagementServerService.remoteExtensionManagementServer) {
			this.logService.error('No remote extension management server available');
			return;
		}

		this.logService.info(`Installing '${failed.length}' extensions relayed from server`);
		const galleryExtensions = await this.extensionGalleryService.getExtensions(failed.map(({ id }) => ({ id })), CancellationToken.None);
		const installExtensionInfo: InstallExtensionInfo[] = [];
		for (const { id, installOptions } of failed) {
			const extension = galleryExtensions.find(e => areSameExtensions(e.identifier, { id }));
			if (extension) {
				installExtensionInfo.push({
					extension, options: {
						...installOptions,
						downloadExtensionsLocally: true,
					}
				});
			} else {
				this.logService.warn(`Relayed failed extension '${id}' from server is not found in the gallery`);
			}
		}

		if (installExtensionInfo.length) {
			await Promise.allSettled(installExtensionInfo.map(e => this.extensionManagementServerService.remoteExtensionManagementServer!.extensionManagementService.installFromGallery(e.extension, e.options)));
		}
	}
}
