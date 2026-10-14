/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import type { ProgressOptions } from 'vscode';
import { DeferredPromise } from '../../../../base/common/async.js';
import { encodeBase64, VSBuffer } from '../../../../base/common/buffer.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { IAuthorizationServerMetadata } from '../../../../base/common/oauth.js';
import { URI, UriComponents } from '../../../../base/common/uri.js';
import { mock } from '../../../../base/test/common/mock.js';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../base/test/common/utils.js';
import { ILogger, ILoggerService, NullLogger, NullLogService } from '../../../../platform/log/common/log.js';
import { INotificationSource } from '../../../../platform/notification/common/notification.js';
import { Progress } from '../../../../platform/progress/common/progress.js';
import { URLHandlerRouter } from '../../../../platform/url/common/urlIpc.js';
import { Client, IClientRouter, IConnectionHub } from '../../../../base/parts/ipc/common/ipc.js';
import { IAuthenticationProviderSessionOptions } from '../../../services/authentication/common/authentication.js';
import { DynamicAuthProvider, IAuthorizationToken, reviveAccountIcon, TokenStore } from '../../common/extHostAuthentication.js';
import { IProgressStepDto, MainThreadAuthenticationShape } from '../../common/extHost.protocol.js';
import { IExtHostInitDataService } from '../../common/extHostInitDataService.js';
import { IExtHostProgress } from '../../common/extHostProgress.js';
import { IExtHostUrlsService } from '../../common/extHostUrls.js';
import { IExtHostWindow } from '../../common/extHostWindow.js';
import { Proxied } from '../../../services/extensions/common/proxyIdentifier.js';
import { UIKind } from '../../../services/extensions/common/extensionHostProtocol.js';

/** Builds a structurally-valid JWT carrying the given claims. */
function jwt(claims: object): string {
	const segment = (value: object) => encodeBase64(VSBuffer.fromString(JSON.stringify(value)));
	return `${segment({ alg: 'none', typ: 'JWT' })}.${segment(claims)}.signature`;
}

suite('TokenStore', () => {

	const disposables = ensureNoDisposablesAreLeakedInTestSuite();

	function createStore(initialTokens: IAuthorizationToken[]): TokenStore {
		const persistence = {
			onDidChange: disposables.add(new Emitter<IAuthorizationToken[]>()).event,
			set: () => { }
		};
		return disposables.add(new TokenStore(persistence, initialTokens, new NullLogger()));
	}

	// Regression for the MCP sign-in loop: an explicit empty `token.scope` must derive empty session scopes, not the granted scopes from the JWT claims, else empty-scope lookups never match their own session.
	test('derives session scopes from the stored token.scope, falling back to JWT claims only when scope is absent', () => {
		const store = createStore([
			// Explicit empty scope must win over the scopes embedded in the JWT claims.
			{ access_token: jwt({ sub: 'a', scope: 'menu:read orders:create orders:cancel' }), token_type: 'Bearer', scope: '', created_at: 0 },
			// Absent scope (undefined) falls back to the JWT claims.
			{ access_token: jwt({ sub: 'b', scope: 'menu:read orders:create' }), token_type: 'Bearer', created_at: 0 },
			// A non-empty scope is authoritative over the JWT claims.
			{ access_token: jwt({ sub: 'c', scope: 'ignored:claim' }), token_type: 'Bearer', scope: 'read write', created_at: 0 },
		]);

		assert.deepStrictEqual(
			store.sessions.map(session => session.scopes),
			[[], ['menu:read', 'orders:create'], ['read', 'write']]
		);
	});
});

suite('DynamicAuthProvider', () => {

	const disposables = ensureNoDisposablesAreLeakedInTestSuite();

	class TestDynamicAuthProvider extends DynamicAuthProvider {
		generateNewClientIdCalls = 0;

		protected override async _generateNewClientId(): Promise<void> {
			this.generateNewClientIdCalls++;
		}
	}

	interface ITestServer {
		readonly authorizationServer: string;
		readonly serverMetadata: IAuthorizationServerMetadata;
	}

	const resource = 'https://resource.example.com/api';

	const servers: Record<string, ITestServer> = {
		generic: {
			authorizationServer: 'https://auth.example.com',
			serverMetadata: {
				issuer: 'https://auth.example.com',
				authorization_endpoint: 'https://auth.example.com/authorize',
				token_endpoint: 'https://auth.example.com/token',
				response_types_supported: ['code'],
				scopes_supported: ['openid', 'profile', 'offline_access'],
			},
		},
		// The Microsoft identity platform gets the same requests as every other authorization server.
		entra: {
			authorizationServer: 'https://login.microsoftonline.com/organizations/v2.0',
			serverMetadata: {
				issuer: 'https://login.microsoftonline.com/organizations/v2.0',
				authorization_endpoint: 'https://login.microsoftonline.com/organizations/oauth2/v2.0/authorize',
				token_endpoint: 'https://login.microsoftonline.com/organizations/oauth2/v2.0/token',
				response_types_supported: ['code'],
				scopes_supported: ['openid', 'profile', 'offline_access'],
			},
		},
	};

	function createProvider(options: ITestServer & {
		readonly resource: string;
		readonly initialTokens?: IAuthorizationToken[];
		readonly fetcher?: typeof fetch;
		readonly uiKind?: UIKind;
		/** Receives every opened URI; its result is the result of `openUri`, `false` (cancelled) by default. */
		readonly onDidOpenUri?: (uri: string) => boolean;
		/** Answers `$waitForUriHandler`; never settles by default. */
		readonly waitForUriHandler?: (expectedUri: UriComponents) => Promise<UriComponents>;
		/** The window id that `createAppUri` appends to the query, as the desktop URL service does; none by default. */
		readonly windowId?: number;
	}): TestDynamicAuthProvider {
		const loggerService = new class extends mock<ILoggerService>() {
			override createLogger(): ILogger {
				return new NullLogger();
			}
		}();
		const proxy = new class extends mock<Proxied<MainThreadAuthenticationShape>>() {
			override $setSessionsForDynamicAuthProvider = (): Promise<void> => Promise.resolve();
			// Never settles by default, so an abandoned authorization flow leaves no rejected promise behind.
			override $waitForUriHandler = (expectedUri: UriComponents): Promise<UriComponents> => options.waitForUriHandler?.(expectedUri) ?? new Promise<UriComponents>(() => { });
		}();
		const extHostWindow = new class extends mock<IExtHostWindow>() {
			override async openUri(uri: string | URI): Promise<boolean> {
				return options.onDidOpenUri?.(uri.toString()) ?? false;
			}
		}();
		const extHostUrls = new class extends mock<IExtHostUrlsService>() {
			override async createAppUri(uri: URI): Promise<URI> {
				if (options.windowId === undefined) {
					return uri;
				}
				return uri.with({ query: uri.query ? `${uri.query}&windowId=${options.windowId}` : `windowId=${options.windowId}` });
			}
		}();
		const initData = new class extends mock<IExtHostInitDataService>() {
			override environment = { appUriScheme: 'vscode', appName: 'Test' } as IExtHostInitDataService['environment'];
			override uiKind = options.uiKind ?? UIKind.Desktop;
		}();
		const extHostProgress = new class extends mock<IExtHostProgress>() {
			override async withProgressFromSource<R>(_source: string | INotificationSource, _options: ProgressOptions, task: (progress: Progress<IProgressStepDto>, token: CancellationToken) => Thenable<R>): Promise<R> {
				return task(new Progress<IProgressStepDto>(() => { }), CancellationToken.None);
			}
		}();
		return disposables.add(new TestDynamicAuthProvider(
			extHostWindow,
			extHostUrls,
			initData,
			extHostProgress,
			loggerService,
			proxy,
			URI.parse(options.authorizationServer),
			options.serverMetadata,
			{ resource: options.resource },
			'client-id',
			undefined,
			disposables.add(new Emitter()),
			options.initialTokens ?? [],
			options.fetcher,
		));
	}

	test('does not rotate the client while silently refreshing a token', async () => {
		let fetchCalls = 0;
		const fetcher: typeof fetch = async () => {
			fetchCalls++;
			return new Response(JSON.stringify({ error: 'invalid_client' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		};
		const provider = createProvider({
			authorizationServer: 'https://mcp.example.com',
			serverMetadata: {
				issuer: 'https://mcp.example.com',
				response_types_supported: ['code'],
				token_endpoint: 'https://mcp.example.com/token',
			},
			resource: 'https://mcp.example.com/resource',
			initialTokens: [{
				access_token: jwt({ sub: 'account' }),
				token_type: 'Bearer',
				scope: '',
				expires_in: 1,
				refresh_token: 'refresh-token',
				created_at: 0,
			}],
			fetcher,
		});

		const sessions = await provider.getSessions([], { silent: true } satisfies IAuthenticationProviderSessionOptions);

		assert.deepStrictEqual({
			sessions,
			fetchCalls,
			generateNewClientIdCalls: provider.generateNewClientIdCalls,
			clientId: provider.clientId,
		}, {
			sessions: [],
			fetchCalls: 1,
			generateNewClientIdCalls: 0,
			clientId: 'client-id',
		});
	});

	test('refresh sends the resource indicator and no scope to every authorization server', async () => {
		const results: Record<string, { body: Record<string, string>; scopes: (readonly string[])[] }> = {};
		for (const [name, server] of Object.entries(servers)) {
			const bodies: Record<string, string>[] = [];
			const fetcher: typeof fetch = async (_input, init) => {
				bodies.push(Object.fromEntries(new URLSearchParams(String(init?.body))));
				return new Response(JSON.stringify({
					access_token: jwt({ sub: 'account' }),
					token_type: 'Bearer',
					expires_in: 3600,
					refresh_token: 'new-refresh',
				}), {
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				});
			};
			const provider = createProvider({
				...server,
				resource,
				initialTokens: [{
					access_token: jwt({ sub: 'account', jti: 'expired' }),
					token_type: 'Bearer',
					scope: 'api://res/Read',
					expires_in: 1,
					refresh_token: 'refresh-token',
					created_at: 0,
				}],
				fetcher,
			});

			const sessions = await provider.getSessions(['api://res/Read'], { silent: true } satisfies IAuthenticationProviderSessionOptions);
			results[name] = { body: bodies[0], scopes: sessions.map(session => session.scopes) };
		}

		const refreshResult = {
			body: { client_id: 'client-id', grant_type: 'refresh_token', refresh_token: 'refresh-token', resource },
			scopes: [['api://res/Read']],
		};
		assert.deepStrictEqual(results, {
			generic: refreshResult,
			entra: refreshResult,
		});
	});

	test('authorization URL requests offline_access when advertised, sends the resource indicator and redirects to the product URL protocol', async () => {
		const results: Record<string, { scope: string | null; resource: string | null; prompt: string | null; redirectUri: string | null }> = {};
		for (const [name, server] of Object.entries(servers)) {
			const openedUris: string[] = [];
			const provider = createProvider({
				...server,
				resource,
				onDidOpenUri: uri => {
					openedUris.push(uri);
					return false;
				},
			});

			await assert.rejects(provider.createSession(['api://res/Read'], {}));

			const params = new URL(openedUris[0]).searchParams;
			results[name] = {
				scope: params.get('scope'),
				resource: params.get('resource'),
				prompt: params.get('prompt'),
				redirectUri: params.get('redirect_uri'),
			};
		}

		assert.deepStrictEqual(results, {
			generic: { scope: 'api://res/Read offline_access', resource, prompt: null, redirectUri: 'vscode://dynamicauthprovider/auth.example.com/authorize' },
			entra: { scope: 'api://res/Read offline_access', resource, prompt: null, redirectUri: 'vscode://dynamicauthprovider/login.microsoftonline.com/authorize' },
		});
	});

	/**
	 * Answers the authorization request the way the authorization server does: it redirects to the `redirect_uri` with the
	 * `code` and the given `state` (the requested one by default) appended as percent-encoded query parameters. The
	 * callback is the URI as the main process parses it from the URL the operating system hands over.
	 */
	function redirectFromAuthorizationServer(callback: DeferredPromise<UriComponents>, state?: string): (uri: string) => boolean {
		return uri => {
			const params = new URL(uri).searchParams;
			void callback.complete(URI.parse(`${params.get('redirect_uri')}?code=authorization-code&state=${encodeURIComponent(state ?? params.get('state')!)}`));
			return true;
		};
	}

	/** Routes a callback through the main process's URL handler router over the given windows; `next` is the active-window fallback. */
	async function routeCallback(callback: UriComponents, windowIds: number[], activeWindowId: number): Promise<string> {
		const connections = windowIds.map(id => ({ ctx: `window:${id}` }) as IConnectionHub<string>['connections'][number]);
		const hub: IConnectionHub<string> = { connections, onDidAddConnection: Event.None, onDidRemoveConnection: Event.None };
		const activeWindowRouter = new class implements IClientRouter<string> {
			async routeCall(): Promise<Client<string>> { return connections.find(c => c.ctx === `window:${activeWindowId}`)!; }
			async routeEvent(): Promise<Client<string>> { throw new Error('unexpected'); }
		}();
		const client = await new URLHandlerRouter(activeWindowRouter, new NullLogService()).routeCall(hub, 'handleURL', [callback]);
		return client.ctx;
	}

	test('URL handler flow exchanges the code that the product URL protocol callback delivers', async () => {
		const callback = new DeferredPromise<UriComponents>();
		const expectedUris: string[] = [];
		const tokenRequests: Record<string, string>[] = [];
		const provider = createProvider({
			...servers.generic,
			resource,
			waitForUriHandler: expectedUri => {
				expectedUris.push(URI.revive(expectedUri).toString());
				return callback.p;
			},
			onDidOpenUri: redirectFromAuthorizationServer(callback),
			fetcher: async (_input, init) => {
				tokenRequests.push(Object.fromEntries(new URLSearchParams(String(init?.body))));
				return new Response(JSON.stringify({ access_token: jwt({ sub: 'account' }), token_type: 'Bearer' }), {
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				});
			},
		});

		const session = await provider.createSession(['api://res/Read'], {});

		const redirectUri = 'vscode://dynamicauthprovider/auth.example.com/authorize';
		assert.deepStrictEqual({
			expectedUris,
			tokenRequests: tokenRequests.map(({ code, redirect_uri }) => ({ code, redirect_uri })),
			scopes: session.scopes,
		}, {
			expectedUris: [redirectUri],
			tokenRequests: [{ code: 'authorization-code', redirect_uri: redirectUri }],
			scopes: ['api://res/Read'],
		});
	});

	test('URL handler flow reaches the originating window after the active window changed before authorization completed', async () => {
		const callback = new DeferredPromise<UriComponents>();
		const authorizationStates: string[] = [];
		let routedTo: string | undefined;
		const provider = createProvider({
			...servers.generic,
			resource,
			windowId: 1,
			waitForUriHandler: async () => {
				// The user focuses window 2 while the browser shows the authorization page; the main process must still
				// route the callback to window 1, where this handler waits.
				routedTo = await routeCallback(await callback.p, [1, 2], 2);
				return callback.p;
			},
			onDidOpenUri: uri => {
				authorizationStates.push(new URL(uri).searchParams.get('state')!);
				return redirectFromAuthorizationServer(callback)(uri);
			},
			fetcher: async () => new Response(JSON.stringify({ access_token: jwt({ sub: 'account' }), token_type: 'Bearer' }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			}),
		});

		const session = await provider.createSession(['api://res/Read'], {});

		assert.deepStrictEqual({
			states: authorizationStates.map(state => state.replace(/nonce=[0-9a-f]{32}/, 'nonce=<nonce>')),
			routedTo,
			scopes: session.scopes,
		}, {
			states: ['nonce=<nonce>&windowId=1'],
			routedTo: 'window:1',
			scopes: ['api://res/Read'],
		});
	});

	test('URL handler flow without a window id falls back to the active window', async () => {
		const callback = new DeferredPromise<UriComponents>();
		const provider = createProvider({
			...servers.generic,
			resource,
			waitForUriHandler: () => callback.p,
			onDidOpenUri: redirectFromAuthorizationServer(callback),
			fetcher: async () => new Response('{}', { status: 500 }),
		});
		const sessionPromise = provider.createSession(['api://res/Read'], {});

		assert.strictEqual(await routeCallback(await callback.p, [1, 2], 2), 'window:2');
		await assert.rejects(sessionPromise);
	});

	test('URL handler flow rejects a callback whose state does not match the request', async () => {
		const callback = new DeferredPromise<UriComponents>();
		let tokenRequests = 0;
		const provider = createProvider({
			...servers.generic,
			resource,
			waitForUriHandler: () => callback.p,
			onDidOpenUri: redirectFromAuthorizationServer(callback, 'forged-state'),
			fetcher: async () => {
				tokenRequests++;
				return new Response('{}', { status: 500 });
			},
		});

		await assert.rejects(provider.createSession(['api://res/Read'], {}));

		assert.strictEqual(tokenRequests, 0);
	});

	test('offers no URL handler flow in the browser and fails with a clear error', async () => {
		const openedUris: string[] = [];
		const provider = createProvider({
			...servers.generic,
			resource,
			uiKind: UIKind.Web,
			onDidOpenUri: uri => {
				openedUris.push(uri);
				return false;
			},
		});

		await assert.rejects(provider.createSession(['api://res/Read'], {}), /requires the desktop application/);

		assert.deepStrictEqual(openedUris, []);
	});
});

suite('Account Icon Revival', () => {

	ensureNoDisposablesAreLeakedInTestSuite();

	const iconComponents: UriComponents = { scheme: 'https', authority: 'example.com', path: '/avatar.png', query: '', fragment: '' };

	test('reviveAccountIcon revives a present icon into a URI and leaves a missing icon undefined', () => {
		const withIcon: { id: string; label: string; icon?: UriComponents } = { id: 'account-with-icon', label: 'Has Icon', icon: iconComponents };
		const withoutIcon: { id: string; label: string; icon?: UriComponents } = { id: 'account-without-icon', label: 'No Icon' };

		assert.deepStrictEqual(
			[reviveAccountIcon(withIcon), reviveAccountIcon(withoutIcon)],
			[
				{ ...withIcon, icon: URI.from(iconComponents) },
				{ ...withoutIcon, icon: undefined }
			]
		);
	});
});
