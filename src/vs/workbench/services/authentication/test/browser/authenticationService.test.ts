/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { Emitter, Event } from '../../../../../base/common/event.js';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../../base/test/common/utils.js';
import { URI } from '../../../../../base/common/uri.js';
import { AuthenticationAccessService } from '../../browser/authenticationAccessService.js';
import { AuthenticationService } from '../../browser/authenticationService.js';
import { AuthenticationProviderInformation, AuthenticationSessionsChangeEvent, IAuthenticationProvider } from '../../common/authentication.js';
import { TestExtensionService, TestStorageService } from '../../../../test/common/workbenchTestServices.js';
import { NullLogService } from '../../../../../platform/log/common/log.js';
import { ActivationKind } from '../../../extensions/common/extensions.js';

function createSession() {
	return { id: 'session1', accessToken: 'token1', account: { id: 'account', label: 'Account' }, scopes: ['test'] };
}

function createProvider(overrides: Partial<IAuthenticationProvider> = {}): IAuthenticationProvider {
	return {
		supportsMultipleAccounts: false,
		onDidChangeSessions: new Emitter<AuthenticationSessionsChangeEvent>().event,
		id: 'test',
		label: 'Test',
		getSessions: async () => [],
		createSession: async () => createSession(),
		removeSession: async () => { },
		...overrides
	};
}

suite('AuthenticationService', () => {
	const disposables = ensureNoDisposablesAreLeakedInTestSuite();

	let authenticationService: AuthenticationService;

	setup(() => {
		const storageService = disposables.add(new TestStorageService());
		const authenticationAccessService = disposables.add(new AuthenticationAccessService(storageService));
		authenticationService = disposables.add(new AuthenticationService(new TestExtensionService(), authenticationAccessService, new NullLogService()));
	});

	teardown(() => {
		// Dispose the authentication service after each test
		authenticationService.dispose();
	});

	suite('declaredAuthenticationProviders', () => {
		test('registerDeclaredAuthenticationProvider', async () => {
			const changed = Event.toPromise(authenticationService.onDidChangeDeclaredProviders);
			const provider: AuthenticationProviderInformation = {
				id: 'github',
				label: 'GitHub'
			};
			authenticationService.registerDeclaredAuthenticationProvider(provider);

			// Assert that the provider is added to the declaredProviders array and the event fires
			assert.equal(authenticationService.declaredProviders.length, 1);
			assert.deepEqual(authenticationService.declaredProviders[0], provider);
			await changed;
		});

		test('unregisterDeclaredAuthenticationProvider', async () => {
			const provider: AuthenticationProviderInformation = {
				id: 'github',
				label: 'GitHub'
			};
			authenticationService.registerDeclaredAuthenticationProvider(provider);
			const changed = Event.toPromise(authenticationService.onDidChangeDeclaredProviders);
			authenticationService.unregisterDeclaredAuthenticationProvider(provider.id);

			// Assert that the provider is removed from the declaredProviders array and the event fires
			assert.equal(authenticationService.declaredProviders.length, 0);
			await changed;
		});
	});

	suite('authenticationProviders', () => {
		test('isAuthenticationProviderRegistered', async () => {
			const registered = Event.toPromise(authenticationService.onDidRegisterAuthenticationProvider);
			const provider = createProvider();
			assert.equal(authenticationService.isAuthenticationProviderRegistered(provider.id), false);
			authenticationService.registerAuthenticationProvider(provider.id, provider);
			assert.equal(authenticationService.isAuthenticationProviderRegistered(provider.id), true);
			const result = await registered;
			assert.deepEqual(result, { id: provider.id, label: provider.label });
		});

		test('unregisterAuthenticationProvider', async () => {
			const unregistered = Event.toPromise(authenticationService.onDidUnregisterAuthenticationProvider);
			const provider = createProvider();
			authenticationService.registerAuthenticationProvider(provider.id, provider);
			assert.equal(authenticationService.isAuthenticationProviderRegistered(provider.id), true);
			authenticationService.unregisterAuthenticationProvider(provider.id);
			assert.equal(authenticationService.isAuthenticationProviderRegistered(provider.id), false);
			const result = await unregistered;
			assert.deepEqual(result, { id: provider.id, label: provider.label });
		});

		test('getProviderIds', () => {
			const provider1 = createProvider({
				id: 'provider1',
				label: 'Provider 1'
			});
			const provider2 = createProvider({
				id: 'provider2',
				label: 'Provider 2'
			});

			authenticationService.registerAuthenticationProvider(provider1.id, provider1);
			authenticationService.registerAuthenticationProvider(provider2.id, provider2);

			const providerIds = authenticationService.getProviderIds();

			// Assert that the providerIds array contains the registered provider ids
			assert.deepEqual(providerIds, [provider1.id, provider2.id]);
		});

		test('getProvider', () => {
			const provider = createProvider();

			authenticationService.registerAuthenticationProvider(provider.id, provider);

			const retrievedProvider = authenticationService.getProvider(provider.id);

			// Assert that the retrieved provider is the same as the registered provider
			assert.deepEqual(retrievedProvider, provider);
		});
	});

	suite('authenticationSessions', () => {
		test('getSessions - base case', async () => {
			let isCalled = false;
			const provider = createProvider({
				getSessions: async () => {
					isCalled = true;
					return [createSession()];
				},
			});
			authenticationService.registerAuthenticationProvider(provider.id, provider);
			const sessions = await authenticationService.getSessions(provider.id);

			assert.equal(sessions.length, 1);
			assert.ok(isCalled);
		});

		test('getSessions - authorization server is not registered', async () => {
			let isCalled = false;
			const provider = createProvider({
				getSessions: async () => {
					isCalled = true;
					return [createSession()];
				},
			});
			authenticationService.registerAuthenticationProvider(provider.id, provider);
			await assert.rejects(
				() => authenticationService.getSessions(provider.id, [], { authorizationServer: URI.parse('https://example.com') }),
				/does not support the authorization server/
			);
			assert.ok(!isCalled);
		});

		test('getSessions - forwards requests for an authorization server the provider supports', async () => {
			const requestedServers: (string | undefined)[] = [];
			const provider = createProvider({
				authorizationServers: [URI.parse('https://login.example.com/tenant'), URI.parse('https://*.example.org/*')],
				getSessions: async (_scopes, options) => {
					requestedServers.push(options.authorizationServer?.toString(true));
					return [createSession()];
				},
			});
			authenticationService.registerAuthenticationProvider(provider.id, provider);

			// An exact match ignores case; a glob matches every server it covers.
			await authenticationService.getSessions(provider.id, [], { authorizationServer: URI.parse('https://login.example.com/Tenant') });
			await authenticationService.getSessions(provider.id, [], { authorizationServer: URI.parse('https://auth.example.org/tenant') });

			assert.deepStrictEqual(requestedServers, ['https://login.example.com/Tenant', 'https://auth.example.org/tenant']);
		});

		test('createSession', async () => {
			const emitter = new Emitter<AuthenticationSessionsChangeEvent>();
			const provider = createProvider({
				onDidChangeSessions: emitter.event,
				createSession: async () => {
					const session = createSession();
					emitter.fire({ added: [session], removed: [], changed: [] });
					return session;
				},
			});
			const changed = Event.toPromise(authenticationService.onDidChangeSessions);
			authenticationService.registerAuthenticationProvider(provider.id, provider);
			const session = await authenticationService.createSession(provider.id, ['repo']);

			// Assert that the created session matches the expected session and the event fires
			assert.ok(session);
			const result = await changed;
			assert.deepEqual(result, {
				providerId: provider.id,
				label: provider.label,
				event: { added: [session], removed: [], changed: [] }
			});
		});

		test('getSessions - forwards resource option to provider', async () => {
			let receivedResource: string | undefined;
			const provider = createProvider({
				getSessions: async (_scopes, options) => {
					receivedResource = options.resource;
					return [createSession()];
				},
			});
			authenticationService.registerAuthenticationProvider(provider.id, provider);
			await authenticationService.getSessions(provider.id, ['scope'], { resource: 'https://api.example.com/' });

			assert.strictEqual(receivedResource, 'https://api.example.com/');
		});

		test('createSession - forwards resource option to provider', async () => {
			let receivedResource: string | undefined;
			const provider = createProvider({
				createSession: async (_scopes, options) => {
					receivedResource = options.resource;
					return createSession();
				},
			});
			authenticationService.registerAuthenticationProvider(provider.id, provider);
			await authenticationService.createSession(provider.id, ['scope'], { resource: 'https://api.example.com/' });

			assert.strictEqual(receivedResource, 'https://api.example.com/');
		});

		test('removeSession', async () => {
			const emitter = new Emitter<AuthenticationSessionsChangeEvent>();
			const session = createSession();
			const provider = createProvider({
				onDidChangeSessions: emitter.event,
				removeSession: async () => emitter.fire({ added: [], removed: [session], changed: [] })
			});
			const changed = Event.toPromise(authenticationService.onDidChangeSessions);
			authenticationService.registerAuthenticationProvider(provider.id, provider);
			await authenticationService.removeSession(provider.id, session.id);

			const result = await changed;
			assert.deepEqual(result, {
				providerId: provider.id,
				label: provider.label,
				event: { added: [], removed: [session], changed: [] }
			});
		});

		test('onDidChangeSessions', async () => {
			const emitter = new Emitter<AuthenticationSessionsChangeEvent>();
			const provider = createProvider({
				onDidChangeSessions: emitter.event,
				getSessions: async () => []
			});
			authenticationService.registerAuthenticationProvider(provider.id, provider);

			const changed = Event.toPromise(authenticationService.onDidChangeSessions);
			const session = createSession();
			emitter.fire({ added: [], removed: [], changed: [session] });

			const result = await changed;
			assert.deepEqual(result, {
				providerId: provider.id,
				label: provider.label,
				event: { added: [], removed: [], changed: [session] }
			});
		});
	});

});

suite('AuthenticationService - tryActivateProvider', () => {
	const disposables = ensureNoDisposablesAreLeakedInTestSuite();

	let authenticationService: AuthenticationService;

	setup(() => {
		const storageService = disposables.add(new TestStorageService());
		const authenticationAccessService = disposables.add(new AuthenticationAccessService(storageService));
		authenticationService = disposables.add(new AuthenticationService(new TestExtensionService(), authenticationAccessService, new NullLogService()));
	});

	teardown(() => {
		authenticationService.dispose();
	});

	test('should resolve when provider registers even if activateByEvent never resolves (#315841)', async () => {
		// Dispose the service created in setup to release the extension point handler,
		// so we can create a new one with a hanging activateByEvent.
		authenticationService.dispose();

		const storageService = disposables.add(new TestStorageService());
		const authAccessService = disposables.add(new AuthenticationAccessService(storageService));
		// Simulate a deadlocked extension host: activateByEvent never resolves.
		const hangingExtService = new class extends TestExtensionService {
			override activateByEvent(_activationEvent: string, _activationKind?: ActivationKind): Promise<void> {
				return new Promise<void>(() => { /* never resolves */ });
			}
		};
		authenticationService = disposables.add(new AuthenticationService(hangingExtService, authAccessService, new NullLogService()));

		const provider = createProvider({ getSessions: async () => [createSession()] });

		// Start getSessions — this calls tryActivateProvider which fires activateByEvent.
		// Since activateByEvent never resolves, the old code would deadlock here.
		const sessionsPromise = authenticationService.getSessions(provider.id);

		// Simulate the local extension host registering the provider
		// while the webworker host is still stuck.
		authenticationService.registerAuthenticationProvider(provider.id, provider);

		// The Promise.race in tryActivateProvider should unblock immediately.
		const sessions = await sessionsPromise;
		assert.strictEqual(sessions.length, 1);
	});

	test('should resolve when activateByEvent completes and provider is already registered', async () => {
		const provider = createProvider({ getSessions: async () => [createSession()] });
		authenticationService.registerAuthenticationProvider(provider.id, provider);

		const sessions = await authenticationService.getSessions(provider.id);
		assert.strictEqual(sessions.length, 1);
	});
});
