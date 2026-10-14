/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Emitter, Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ExtensionIdentifier } from '../../../../platform/extensions/common/extensions.js';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { IStorageService, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { AllowedExtension } from '../common/authentication.js';

export const IAuthenticationAccessService = createDecorator<IAuthenticationAccessService>('IAuthenticationAccessService');
export interface IAuthenticationAccessService {
	readonly _serviceBrand: undefined;

	readonly onDidChangeExtensionSessionAccess: Event<{ providerId: string; accountName: string }>;

	/**
	 * Check extension access to an account
	 * @param providerId The id of the authentication provider
	 * @param accountName The account name that access is checked for
	 * @param extensionId The id of the extension requesting access
	 * @returns Returns true or false if the user has opted to permanently grant or disallow access, and undefined
	 * if they haven't made a choice yet
	 */
	isAccessAllowed(providerId: string, accountName: string, extensionId: string): boolean | undefined;
	readAllowedExtensions(providerId: string, accountName: string): AllowedExtension[];
	updateAllowedExtensions(providerId: string, accountName: string, extensions: AllowedExtension[]): void;
	removeAllowedExtensions(providerId: string, accountName: string): void;
}

// TODO@TylerLeonhardt: Move this class to MainThreadAuthentication
// TODO@TylerLeonhardt: Should this class only keep track of allowed things and throw away disallowed ones?
export class AuthenticationAccessService extends Disposable implements IAuthenticationAccessService {
	_serviceBrand: undefined;

	private _onDidChangeExtensionSessionAccess: Emitter<{ providerId: string; accountName: string }> = this._register(new Emitter<{ providerId: string; accountName: string }>());
	readonly onDidChangeExtensionSessionAccess: Event<{ providerId: string; accountName: string }> = this._onDidChangeExtensionSessionAccess.event;

	constructor(
		@IStorageService private readonly _storageService: IStorageService
	) {
		super();
	}

	isAccessAllowed(providerId: string, accountName: string, extensionId: string): boolean | undefined {
		const extensionKey = ExtensionIdentifier.toKey(extensionId);
		const allowList = this.readAllowedExtensions(providerId, accountName);
		const extensionData = allowList.find(extension => extension.id === extensionKey);
		if (!extensionData) {
			return undefined;
		}
		// This property didn't exist on this data previously, inclusion in the list at all indicates allowance
		return extensionData.allowed !== undefined
			? extensionData.allowed
			: true;
	}

	readAllowedExtensions(providerId: string, accountName: string): AllowedExtension[] {
		let allowedExtensions: AllowedExtension[] = [];
		try {
			const allowedExtensionsSrc = this._storageService.get(`${providerId}-${accountName}`, StorageScope.APPLICATION);
			if (allowedExtensionsSrc) {
				allowedExtensions = JSON.parse(allowedExtensionsSrc);
			}
		} catch (err) { }

		return allowedExtensions;
	}

	updateAllowedExtensions(providerId: string, accountName: string, extensions: AllowedExtension[]): void {
		const allowList = this.readAllowedExtensions(providerId, accountName);
		for (const extension of extensions) {
			const extensionKey = ExtensionIdentifier.toKey(extension.id);
			const index = allowList.findIndex(e => e.id === extensionKey);
			if (index === -1) {
				allowList.push({
					...extension,
					id: extensionKey
				});
			} else {
				allowList[index].allowed = extension.allowed;
				// Update name if provided and not already set to a proper name
				if (extension.name && extension.name !== extensionKey && allowList[index].name !== extension.name) {
					allowList[index].name = extension.name;
				}
			}
		}

		this._storageService.store(`${providerId}-${accountName}`, JSON.stringify(allowList), StorageScope.APPLICATION, StorageTarget.USER);
		this._onDidChangeExtensionSessionAccess.fire({ providerId, accountName });
	}

	removeAllowedExtensions(providerId: string, accountName: string): void {
		this._storageService.remove(`${providerId}-${accountName}`, StorageScope.APPLICATION);
		this._onDidChangeExtensionSessionAccess.fire({ providerId, accountName });
	}
}

registerSingleton(IAuthenticationAccessService, AuthenticationAccessService, InstantiationType.Delayed);
