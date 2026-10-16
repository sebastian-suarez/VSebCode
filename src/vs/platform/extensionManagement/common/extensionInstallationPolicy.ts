/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../nls.js';
import { ExtensionManagementError, ExtensionManagementErrorCode } from './extensionManagement.js';

/** Microsoft cloud/remote service extensions excluded from installation in this distribution. */
export const blockedServiceExtensions: readonly string[] = Object.freeze([
	'github.codespaces',
	'github.remotehub',
	'github.vscode-pull-request-github',
	'microsoft-isvexptools.powerplatform-vscode',
	'microsoft-isvexptools.powerplatform-vscode-preview',
	'ms-azuretools.vscode-azure-github-copilot',
	'ms-azuretools.vscode-azureappservice',
	'ms-azuretools.vscode-azureresourcegroups',
	'ms-azuretools.vscode-dev-azurecloudshell',
	'ms-toolsai.vscode-ai',
	'ms-toolsai.vscode-ai-remote',
	'ms-vscode-remote.remote-containers',
	'ms-vscode-remote.remote-ssh',
	'ms-vscode-remote.remote-ssh-edit',
	'ms-vscode-remote.remote-wsl',
	'ms-vscode-remote.vscode-remote-extensionpack',
	'ms-vscode.azure-repos',
	'ms-vscode.azure-sphere-tools-ui',
	'ms-vscode.remote-explorer',
	'ms-vscode.remote-repositories',
	'ms-vscode.remote-server',
	'ms-vsliveshare.vsliveshare',
	'ms-windows-ai-studio.vscode-foundry-training',
	'teamsdevapp.ms-teams-vscode-extension',
	'teamsdevapp.vscode-ai-foundry',
	'vscjava.migrate-java-to-azure',
]);

const blocked = new Set(blockedServiceExtensions);

/** Explains an installation restriction without disabling an already installed extension. */
export function getExtensionInstallationBlockReason(identifier: string): string | undefined {
	return blocked.has(identifier.toLowerCase())
		? localize('blockedServiceExtension', "Installation of '{0}' is blocked because this distribution excludes Microsoft cloud and remote service extensions.", identifier)
		: undefined;
}

/** Enforces the distribution policy on gallery, VSIX, dependency and profile installation paths. */
export function checkExtensionInstallation(identifier: string): void {
	const reason = getExtensionInstallationBlockReason(identifier);
	if (reason) {
		throw new ExtensionManagementError(reason, ExtensionManagementErrorCode.Unsupported);
	}
}
