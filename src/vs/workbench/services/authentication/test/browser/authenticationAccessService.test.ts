/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../../base/test/common/utils.js';
import { TestInstantiationService } from '../../../../../platform/instantiation/test/common/instantiationServiceMock.js';
import { IStorageService, StorageScope, StorageTarget } from '../../../../../platform/storage/common/storage.js';
import { TestStorageService } from '../../../../test/common/workbenchTestServices.js';
import { AuthenticationAccessService, IAuthenticationAccessService } from '../../browser/authenticationAccessService.js';
import { AllowedExtension } from '../../common/authentication.js';

suite('AuthenticationAccessService', () => {
	const disposables = ensureNoDisposablesAreLeakedInTestSuite();

	let instantiationService: TestInstantiationService;
	let storageService: TestStorageService;
	let authenticationAccessService: IAuthenticationAccessService;

	setup(() => {
		instantiationService = disposables.add(new TestInstantiationService());

		// Set up storage service
		storageService = disposables.add(new TestStorageService());
		instantiationService.stub(IStorageService, storageService);

		// Create the service instance
		authenticationAccessService = disposables.add(instantiationService.createInstance(AuthenticationAccessService));
	});

	suite('isAccessAllowed', () => {
		test('returns undefined for unknown extension', () => {
			const result = authenticationAccessService.isAccessAllowed('github', 'user@example.com', 'unknown-extension');
			assert.strictEqual(result, undefined);
		});

		test('returns stored allowed state when extension is in storage', () => {
			// Add extension to storage
			authenticationAccessService.updateAllowedExtensions('github', 'user@example.com', [{
				id: 'stored-extension',
				name: 'Stored Extension',
				allowed: false
			}]);

			const result = authenticationAccessService.isAccessAllowed('github', 'user@example.com', 'stored-extension');
			assert.strictEqual(result, false);
		});

		test('returns true for extension in storage with allowed=true', () => {
			authenticationAccessService.updateAllowedExtensions('github', 'user@example.com', [{
				id: 'allowed-extension',
				name: 'Allowed Extension',
				allowed: true
			}]);

			const result = authenticationAccessService.isAccessAllowed('github', 'user@example.com', 'allowed-extension');
			assert.strictEqual(result, true);
		});

		test('returns true for extension in storage with undefined allowed property (legacy behavior)', () => {
			// Simulate legacy data where allowed property didn't exist
			const legacyExtension: AllowedExtension = {
				id: 'legacy-extension',
				name: 'Legacy Extension'
				// allowed property is undefined
			};

			authenticationAccessService.updateAllowedExtensions('github', 'user@example.com', [legacyExtension]);

			const result = authenticationAccessService.isAccessAllowed('github', 'user@example.com', 'legacy-extension');
			assert.strictEqual(result, true);
		});
	});

	suite('readAllowedExtensions', () => {
		test('returns empty array when no data exists', () => {
			const result = authenticationAccessService.readAllowedExtensions('github', 'user@example.com');
			assert.strictEqual(result.length, 0);
		});

		test('returns stored extensions', () => {
			const extensions: AllowedExtension[] = [
				{ id: 'extension1', name: 'Extension 1', allowed: true },
				{ id: 'extension2', name: 'Extension 2', allowed: false }
			];

			authenticationAccessService.updateAllowedExtensions('github', 'user@example.com', extensions);

			const result = authenticationAccessService.readAllowedExtensions('github', 'user@example.com');
			assert.strictEqual(result.length, 2);
			assert.strictEqual(result[0].id, 'extension1');
			assert.strictEqual(result[0].allowed, true);
			assert.strictEqual(result[1].id, 'extension2');
			assert.strictEqual(result[1].allowed, false);
		});

		test('handles malformed storage data gracefully', () => {
			// Directly store malformed data in storage
			storageService.store('github-user@example.com', 'invalid-json', StorageScope.APPLICATION, StorageTarget.USER);

			const result = authenticationAccessService.readAllowedExtensions('github', 'user@example.com');
			assert.strictEqual(result.length, 0); // Should return empty array instead of throwing
		});
	});

	suite('updateAllowedExtensions', () => {
		test('adds new extensions to storage', () => {
			const extensions: AllowedExtension[] = [
				{ id: 'extension1', name: 'Extension 1', allowed: true },
				{ id: 'extension2', name: 'Extension 2', allowed: false }
			];

			authenticationAccessService.updateAllowedExtensions('github', 'user@example.com', extensions);

			const result = authenticationAccessService.readAllowedExtensions('github', 'user@example.com');
			assert.strictEqual(result.length, 2);
			assert.strictEqual(result[0].id, 'extension1');
			assert.strictEqual(result[1].id, 'extension2');
		});

		test('updates existing extension allowed status', () => {
			// First add an extension
			authenticationAccessService.updateAllowedExtensions('github', 'user@example.com', [
				{ id: 'extension1', name: 'Extension 1', allowed: true }
			]);

			// Then update its allowed status
			authenticationAccessService.updateAllowedExtensions('github', 'user@example.com', [
				{ id: 'extension1', name: 'Extension 1', allowed: false }
			]);

			const result = authenticationAccessService.readAllowedExtensions('github', 'user@example.com');
			assert.strictEqual(result.length, 1);
			assert.strictEqual(result[0].allowed, false);
		});

		test('updates existing extension name when new name is provided', () => {
			// First add an extension with default name
			authenticationAccessService.updateAllowedExtensions('github', 'user@example.com', [
				{ id: 'extension1', name: 'extension1', allowed: true }
			]);

			// Then update with a proper name
			authenticationAccessService.updateAllowedExtensions('github', 'user@example.com', [
				{ id: 'extension1', name: 'My Extension', allowed: true }
			]);

			const result = authenticationAccessService.readAllowedExtensions('github', 'user@example.com');
			assert.strictEqual(result.length, 1);
			assert.strictEqual(result[0].name, 'My Extension');
		});

		test('does not update name when new name is same as ID', () => {
			// First add an extension with a proper name
			authenticationAccessService.updateAllowedExtensions('github', 'user@example.com', [
				{ id: 'extension1', name: 'My Extension', allowed: true }
			]);

			// Then try to update with ID as name (should keep existing name)
			authenticationAccessService.updateAllowedExtensions('github', 'user@example.com', [
				{ id: 'extension1', name: 'extension1', allowed: false }
			]);

			const result = authenticationAccessService.readAllowedExtensions('github', 'user@example.com');
			assert.strictEqual(result.length, 1);
			assert.strictEqual(result[0].name, 'My Extension'); // Should keep the original name
			assert.strictEqual(result[0].allowed, false); // But update the allowed status
		});

		test('fires onDidChangeExtensionSessionAccess event', () => {
			let eventFired = false;
			let eventData: { providerId: string; accountName: string } | undefined;

			const subscription = authenticationAccessService.onDidChangeExtensionSessionAccess(e => {
				eventFired = true;
				eventData = e;
			});
			disposables.add(subscription);

			authenticationAccessService.updateAllowedExtensions('github', 'user@example.com', [
				{ id: 'extension1', name: 'Extension 1', allowed: true }
			]);

			assert.strictEqual(eventFired, true);
			assert.ok(eventData);
			assert.strictEqual(eventData.providerId, 'github');
			assert.strictEqual(eventData.accountName, 'user@example.com');
		});
	});

	suite('removeAllowedExtensions', () => {
		test('removes all extensions from storage', () => {
			// First add some extensions
			authenticationAccessService.updateAllowedExtensions('github', 'user@example.com', [
				{ id: 'extension1', name: 'Extension 1', allowed: true },
				{ id: 'extension2', name: 'Extension 2', allowed: false }
			]);

			// Verify they exist
			const result = authenticationAccessService.readAllowedExtensions('github', 'user@example.com');
			assert.ok(result.length > 0);

			// Remove them
			authenticationAccessService.removeAllowedExtensions('github', 'user@example.com');

			// Verify storage is empty
			const storedData = storageService.get('github-user@example.com', StorageScope.APPLICATION);
			assert.strictEqual(storedData, undefined);
		});

		test('fires onDidChangeExtensionSessionAccess event', () => {
			let eventFired = false;
			let eventData: { providerId: string; accountName: string } | undefined;

			// First add an extension
			authenticationAccessService.updateAllowedExtensions('github', 'user@example.com', [
				{ id: 'extension1', name: 'Extension 1', allowed: true }
			]);

			// Then listen for the remove event
			const subscription = authenticationAccessService.onDidChangeExtensionSessionAccess(e => {
				eventFired = true;
				eventData = e;
			});
			disposables.add(subscription);

			authenticationAccessService.removeAllowedExtensions('github', 'user@example.com');

			assert.strictEqual(eventFired, true);
			assert.ok(eventData);
			assert.strictEqual(eventData.providerId, 'github');
			assert.strictEqual(eventData.accountName, 'user@example.com');
		});
	});
});
