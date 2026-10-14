/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { structuralEquals } from '../../../../base/common/equals.js';
import { Disposable, DisposableStore, IDisposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { VSBuffer } from '../../../../base/common/buffer.js';
import { CDPEvent, CDPRequest, CDPResponse } from '../../../../platform/browserView/common/cdp/types.js';
import { ITunnelProxyInfo } from '../../../../platform/tunnel/common/tunnelProxy.js';
import { IStorageService, StorageScope } from '../../../../platform/storage/common/storage.js';
import {
	BrowserHistoryStore,
	ISerializedBrowserFaviconsSnapshot,
	ISerializedBrowserHistoryEntriesSnapshot,
} from '../../../../platform/browserView/common/browserHistory.js';
import {
	BrowserPermissionStore,
	IPermissionCategoryState,
} from '../../../../platform/browserView/common/browserPermissions.js';
import type { BrowserEditorInput, IBrowserEditorInputData } from './browserEditorInput.js';
import type { PreferredGroup } from '../../../services/editor/common/editorService.js';
import {
	IBrowserViewBounds,
	IBrowserViewNavigationEvent,
	IBrowserViewLoadingEvent,
	IBrowserViewLoadError,
	IBrowserViewFocusEvent,
	IBrowserViewKeyDownEvent,
	IBrowserViewTitleChangeEvent,
	IBrowserViewFaviconChangeEvent,
	IBrowserViewDevToolsStateEvent,
	IBrowserViewService,
	BrowserViewEventData,
	BrowserViewStorageScope,
	isInMemoryStorageScope,
	IBrowserViewCaptureScreenshotOptions,
	IBrowserViewFindInPageOptions,
	IBrowserViewFindInPageResult,
	IBrowserViewVisibilityEvent,
	IBrowserViewCertificateError,
	IBrowserViewEditorOpenOptions,
	BrowserViewSessionSelector,
	browserZoomDefaultIndex,
	browserZoomFactors,
	IBrowserViewState,
	IBrowserDeviceProfile,
	IBrowserViewPermissionRequestEvent,
	IBrowserViewHost,
} from '../../../../platform/browserView/common/browserView.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { isLocalhostAuthority } from '../../../../platform/url/common/trustedDomains.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IBrowserZoomService } from './browserZoomService.js';
import type { IntegratedBrowserOpenSource } from '../../../../platform/browserView/common/browserViewTelemetry.js';

/** Whether a browser URL belongs to the same destination host as the target URL. */
export function browserViewUrlMatches(candidateUrl: string | undefined, targetUrl: string, includeBlank = false): boolean {
	const target = URL.parse(targetUrl);
	if (!target || (target.protocol !== 'file:' && !target.host)) {
		return false;
	}
	if (includeBlank && (!candidateUrl || candidateUrl === 'about:blank')) {
		return true;
	}

	const candidate = URL.parse(candidateUrl ?? '');
	return candidate?.host === target.host ||
		(target.protocol === 'file:' && candidate?.protocol === 'file:') ||
		!!(candidate?.host && target.host && (
			candidate.host.endsWith('.' + target.host) ||
			target.host.endsWith('.' + candidate.host)
		));
}

/** Extracts the host from a URL string for zoom tracking purposes. */
function parseZoomHost(url: string): string | undefined {
	const parsed = URL.parse(url);
	if (!parsed?.host || (parsed.protocol !== 'http:' && parsed.protocol !== 'https:')) {
		return undefined;
	}
	return parsed.host;
}

function parseHistorySnapshot<T>(raw: string | undefined): T | undefined {
	if (!raw) {
		return undefined;
	}
	try {
		const parsed = JSON.parse(raw) as T;
		if (!parsed || typeof parsed !== 'object') {
			return undefined;
		}
		return parsed;
	} catch {
		return undefined;
	}
}

type IntegratedBrowserNavigationEvent = {
	navigationType: 'urlInput' | 'searchInput' | 'goBack' | 'goForward' | 'reload';
	isLocalhost: boolean;
};

/**
 * To be used in telemetry. This is the  source for an address-bar-initiated navigation:
 * whether the user typed a URL or ran a web search. Defaults to `'urlInput'` when omitted.
 */
export type BrowserNavigationSource = 'urlInput' | 'searchInput';

/**
 * Options for a navigation initiated via {@link IBrowserViewModel.loadURL}
 * (and {@link BrowserEditorInput.navigate}).
 */
export interface INavigateOptions {
	/**
	 * Source of the navigation, for telemetry purposes. Defaults to `'urlInput'` when omitted.
	 */
	readonly source?: BrowserNavigationSource;
}

type IntegratedBrowserNavigationClassification = {
	navigationType: { classification: 'SystemMetaData'; purpose: 'FeatureInsight'; comment: 'How the navigation was triggered' };
	isLocalhost: { classification: 'SystemMetaData'; purpose: 'FeatureInsight'; isMeasurement: true; comment: 'Whether the URL is a localhost address' };
	owner: 'kycutler';
	comment: 'Tracks navigation patterns in integrated browser';
};


/**
 * View state stored in editor options when opening a browser view.
 */
export interface IBrowserEditorViewState {
	readonly url?: string;
	readonly title?: string;
	readonly favicon?: string;
}

export const IBrowserViewWorkbenchService = createDecorator<IBrowserViewWorkbenchService>('browserViewWorkbenchService');

/** The editor that renders a page in the Integrated Browser. */
export const BrowserViewEditorId = 'workbench.editor.browser';

export interface IBrowserViewWorkbenchCreateOptions {
	readonly session: BrowserViewSessionSelector;
	readonly initialUrl?: string;
	readonly associatedResource?: URI;
	readonly openSource?: IntegratedBrowserOpenSource;
}

/**
 * Workbench-level service for browser views that provides model-based access to browser views.
 * This service manages browser view models that proxy to the main process browser view service.
 */
export interface IBrowserViewWorkbenchService {
	readonly _serviceBrand: undefined;

	/** Returns true if the remote proxy is enabled; i.e. we are in a remote workspace and the setting is enabled. */
	willUseRemoteProxy(): boolean;

	/**
	 * Set the tunnel-proxy credentials resolved by the window's local node
	 * extension host (which hosts the HTTPS tunnel proxy), or `undefined` to
	 * clear them. Folded into the window configuration sent to the main
	 * process so this window's remote browser views (re)apply the proxy.
	 */
	setRemoteProxyInfo(info: ITunnelProxyInfo | undefined): void;

	/**
	 * Fires when the set of known browser views changes, or a model is created for an existing input.
	 */
	readonly onDidChangeBrowserViews: Event<void>;

	/**
	 * Get all known browser views, keyed by id and iterated in the order they
	 * were opened. A view is registered when its open is requested, so this
	 * order is independent of how quickly each page then loads.
	 */
	getKnownBrowserViews(): Map<string, BrowserEditorInput>;

	/**
	 * Resolve the preferred editor group for opening an integrated browser
	 * editor. Honors the `workbench.browser.newTabPlacement` setting, routing new
	 * tabs into a dedicated (locked) side group or auxiliary window when
	 * configured. When the workbench forces editors into a modal part
	 * (`workbench.editor.useModal: 'all'`), browser opens that target the active
	 * group (or leave it unspecified) are
	 * redirected to the main editor area so the browser docks instead of opening
	 * as a modal overlay. Explicit placements (side group, auxiliary window, a
	 * specific group) are left untouched.
	 */
	getPreferredGroup(preferredGroup?: PreferredGroup): Promise<PreferredGroup | undefined>;

	/** Creates and resolves a browser view, optionally requesting editor presentation. */
	createBrowserView(options: IBrowserViewWorkbenchCreateOptions, editorOpenOptions?: IBrowserViewEditorOpenOptions): Promise<BrowserEditorInput>;

	/** Creates an unlisted ephemeral view for embedding outside the browser editor. */
	createExternalBrowserView(initialUrl: string, openSource?: IntegratedBrowserOpenSource): Promise<IBrowserViewModel>;

	/**
	 * Get an existing browser view for the given ID, or create a new one if it doesn't exist.
	 * The underlying browser view is not created until the editor is opened or the model is resolved.
	 */
	getOrCreateLazy(data: IBrowserEditorInputData): BrowserEditorInput;

	/**
	 * Clear all storage data for the global browser session
	 */
	clearGlobalStorage(): Promise<void>;

	/**
	 * Clear all storage data for the current workspace browser session
	 */
	clearWorkspaceStorage(): Promise<void>;
}

export const IBrowserViewCDPService = createDecorator<IBrowserViewCDPService>('browserViewCDPService');

/**
 * Workbench-level service for managing CDP (Chrome DevTools Protocol) sessions
 * against browser views. Handles group lifecycle and window ID resolution.
 */
export interface IBrowserViewCDPService {
	readonly _serviceBrand: undefined;

	/**
	 * Create a new CDP group for a browser view.
	 * The window ID is resolved from the editor group containing the browser.
	 * @param browserId The browser view identifier.
	 * @returns The ID of the newly created group.
	 */
	createSessionGroup(browserId: string): Promise<string>;

	/** Destroy a CDP group. */
	destroySessionGroup(groupId: string): Promise<void>;

	/** Send a CDP message to a group. */
	sendCDPMessage(groupId: string, message: CDPRequest): Promise<void>;

	/** Fires when a CDP message is received. */
	onCDPMessage(groupId: string): Event<CDPResponse | CDPEvent>;

	/** Fires when a CDP group is destroyed. */
	onDidDestroy(groupId: string): Event<void>;
}


/**
 * A browser view model that represents a single browser view instance in the workbench.
 * This model proxies calls to the main process browser view service using its unique ID.
 */
export interface IBrowserViewModel extends IDisposable {
	readonly id: string;
	readonly host: IBrowserViewHost;
	readonly associatedResource: URI | undefined;
	readonly url: string;
	readonly title: string;
	readonly favicon: string | undefined;
	readonly screenshot: VSBuffer | undefined;
	readonly loading: boolean;
	readonly focused: boolean;
	readonly visible: boolean;
	readonly canGoBack: boolean;
	readonly isDevToolsOpen: boolean;
	readonly canGoForward: boolean;
	readonly error: IBrowserViewLoadError | undefined;
	readonly certificateError: IBrowserViewCertificateError | undefined;
	readonly storageScope: BrowserViewStorageScope;
	readonly history: BrowserHistoryStore;
	readonly permissions: BrowserPermissionStore;
	readonly isRemoteSession: boolean;
	readonly zoomFactor: number;
	readonly canZoomIn: boolean;
	readonly canZoomOut: boolean;
	readonly device: IBrowserDeviceProfile | undefined;

	readonly onDidChangeZoom: Event<void>;
	readonly onWillNavigate: Event<string>;
	readonly onDidNavigate: Event<IBrowserViewNavigationEvent>;
	readonly onDidChangeLoadingState: Event<IBrowserViewLoadingEvent>;
	readonly onDidChangeFocus: Event<IBrowserViewFocusEvent>;
	readonly onDidChangeDevToolsState: Event<IBrowserViewDevToolsStateEvent>;
	readonly onDidKeyCommand: Event<IBrowserViewKeyDownEvent>;
	readonly onDidChangeTitle: Event<IBrowserViewTitleChangeEvent>;
	readonly onDidChangeFavicon: Event<IBrowserViewFaviconChangeEvent>;
	readonly onDidFindInPage: Event<IBrowserViewFindInPageResult>;
	readonly onDidChangeVisibility: Event<IBrowserViewVisibilityEvent>;
	readonly onDidClose: Event<void>;
	readonly onWillDispose: Event<void>;
	readonly onDidChangeDevice: Event<IBrowserDeviceProfile | undefined>;
	readonly onDidChangeRemoteStatus: Event<boolean>;
	readonly onDidRequestPermission: Event<IBrowserViewPermissionRequestEvent>;

	layout(bounds: IBrowserViewBounds): Promise<void>;
	setVisible(visible: boolean): Promise<void>;
	loadURL(url: string, options?: INavigateOptions): Promise<void>;
	goBack(): Promise<void>;
	goForward(): Promise<void>;
	reload(hard?: boolean): Promise<void>;
	toggleDevTools(): Promise<void>;
	captureScreenshot(options?: IBrowserViewCaptureScreenshotOptions): Promise<VSBuffer>;
	focus(force?: boolean): Promise<void>;
	findInPage(text: string, options?: IBrowserViewFindInPageOptions): Promise<void>;
	stopFindInPage(keepSelection?: boolean): Promise<void>;
	getSelectedText(): Promise<string>;
	clearStorage(): Promise<void>;
	trustCertificate(host: string, fingerprint: string): Promise<void>;
	untrustCertificate(host: string, fingerprint: string): Promise<void>;
	deleteHistory(entryIds?: readonly number[]): Promise<void>;
	setPermissions(origin: string, grants: readonly IPermissionCategoryState[]): Promise<void>;
	selectDevice(requestId: string, deviceId: string | null): Promise<void>;
	zoomIn(): Promise<void>;
	zoomOut(): Promise<void>;
	resetZoom(): Promise<void>;
	setDevice(device: IBrowserDeviceProfile | undefined): Promise<void>;
}

export type BrowserViewEventEmitters = { [K in keyof BrowserViewEventData]: Emitter<BrowserViewEventData[K]> };

export function createBrowserViewEventEmitters(store: DisposableStore): BrowserViewEventEmitters {
	return {
		onDidChangeDeviceEmulation: store.add(new Emitter<BrowserViewEventData['onDidChangeDeviceEmulation']>()),
		onDidChangeDevToolsState: store.add(new Emitter<BrowserViewEventData['onDidChangeDevToolsState']>()),
		onDidChangeFavicon: store.add(new Emitter<BrowserViewEventData['onDidChangeFavicon']>()),
		onDidChangeFocus: store.add(new Emitter<BrowserViewEventData['onDidChangeFocus']>()),
		onDidChangeLoadingState: store.add(new Emitter<BrowserViewEventData['onDidChangeLoadingState']>()),
		onDidChangePermissions: store.add(new Emitter<BrowserViewEventData['onDidChangePermissions']>()),
		onDidChangeRemoteStatus: store.add(new Emitter<BrowserViewEventData['onDidChangeRemoteStatus']>()),
		onDidChangeTitle: store.add(new Emitter<BrowserViewEventData['onDidChangeTitle']>()),
		onDidChangeVisibility: store.add(new Emitter<BrowserViewEventData['onDidChangeVisibility']>()),
		onDidClose: store.add(new Emitter<BrowserViewEventData['onDidClose']>()),
		onDidFindInPage: store.add(new Emitter<BrowserViewEventData['onDidFindInPage']>()),
		onDidKeyCommand: store.add(new Emitter<BrowserViewEventData['onDidKeyCommand']>()),
		onDidNavigate: store.add(new Emitter<BrowserViewEventData['onDidNavigate']>()),
		onDidRequestPermission: store.add(new Emitter<BrowserViewEventData['onDidRequestPermission']>()),
	};
}

export class BrowserViewModel extends Disposable implements IBrowserViewModel {
	private _url: string = '';
	private _title: string = '';
	private _favicon: string | undefined = undefined;
	private _screenshot: VSBuffer | undefined = undefined;
	private _loading: boolean = false;
	private _focused: boolean = false;
	private _visible: boolean = false;
	private _isDevToolsOpen: boolean = false;
	private _canGoBack: boolean = false;
	private _canGoForward: boolean = false;
	private _error: IBrowserViewLoadError | undefined = undefined;
	private _certificateError: IBrowserViewCertificateError | undefined = undefined;
	private _storageScope: BrowserViewStorageScope = BrowserViewStorageScope.Ephemeral;
	private _isRemoteSession: boolean = false;
	private _isInMemory: boolean = false;
	private _zoomHost: string | undefined = undefined;
	private _browserZoomIndex: number = browserZoomDefaultIndex;
	private _device: IBrowserDeviceProfile | undefined;

	readonly history = this._register(new BrowserHistoryStore());
	readonly permissions = this._register(new BrowserPermissionStore());

	get onDidNavigate() { return this._remoteEvents.onDidNavigate.event; }
	get onDidChangeLoadingState() { return this._remoteEvents.onDidChangeLoadingState.event; }
	get onDidChangeFocus() { return this._remoteEvents.onDidChangeFocus.event; }
	get onDidChangeDevToolsState() { return this._remoteEvents.onDidChangeDevToolsState.event; }
	get onDidKeyCommand() { return this._remoteEvents.onDidKeyCommand.event; }
	get onDidChangeTitle() { return this._remoteEvents.onDidChangeTitle.event; }
	get onDidChangeFavicon() { return this._remoteEvents.onDidChangeFavicon.event; }
	get onDidFindInPage() { return this._remoteEvents.onDidFindInPage.event; }
	get onDidChangeVisibility() { return this._remoteEvents.onDidChangeVisibility.event; }
	get onDidClose() { return this._remoteEvents.onDidClose.event; }
	get onDidChangeRemoteStatus() { return this._remoteEvents.onDidChangeRemoteStatus.event; }
	get onDidRequestPermission() { return this._remoteEvents.onDidRequestPermission.event; }

	private readonly _onDidChangeDevice = this._register(new Emitter<IBrowserDeviceProfile | undefined>());
	readonly onDidChangeDevice: Event<IBrowserDeviceProfile | undefined> = this._onDidChangeDevice.event;

	private readonly _onDidChangeZoom = this._register(new Emitter<void>());
	readonly onDidChangeZoom: Event<void> = this._onDidChangeZoom.event;

	private readonly _onWillDispose = this._register(new Emitter<void>());
	readonly onWillDispose: Event<void> = this._onWillDispose.event;

	private readonly _onWillNavigate = this._register(new Emitter<string>());
	readonly onWillNavigate: Event<string> = this._onWillNavigate.event;

	constructor(
		readonly id: string,
		readonly host: IBrowserViewHost,
		readonly associatedResource: URI | undefined,
		initialState: IBrowserViewState,
		private readonly browserViewService: IBrowserViewService,
		private readonly _remoteEvents: BrowserViewEventEmitters,
		@ITelemetryService private readonly telemetryService: ITelemetryService,
		@IStorageService private readonly storageService: IStorageService,
		@IBrowserZoomService private readonly zoomService: IBrowserZoomService,
		@ILogService private readonly logService: ILogService,
	) {
		super();

		// Initialize state
		this._url = initialState.url;
		this._title = initialState.title;
		this._loading = initialState.loading;
		this._focused = initialState.focused;
		this._visible = initialState.visible;
		this._isDevToolsOpen = initialState.isDevToolsOpen;
		this._canGoBack = initialState.canGoBack;
		this._canGoForward = initialState.canGoForward;
		this._screenshot = initialState.lastScreenshot;
		this._favicon = initialState.lastFavicon;
		this._error = initialState.lastError;
		this._certificateError = initialState.certificateError;
		this._storageScope = initialState.storageScope;
		this._isRemoteSession = initialState.isRemoteSession;
		this._browserZoomIndex = initialState.browserZoomIndex;
		this._device = initialState.device;
		this._isInMemory = isInMemoryStorageScope(this._storageScope);
		this._zoomHost = parseZoomHost(this._url);

		const { history: entriesKey, favicons: faviconsKey } = initialState.storageKeys;
		if (entriesKey) {
			this._reloadHistoryEntries(entriesKey);
			this._register(this.storageService.onDidChangeValue(
				StorageScope.APPLICATION, entriesKey, this._store,
			)(() => this._reloadHistoryEntries(entriesKey)));
		}
		if (faviconsKey) {
			this._reloadHistoryFavicons(faviconsKey);
			this._register(this.storageService.onDidChangeValue(
				StorageScope.APPLICATION, faviconsKey, this._store,
			)(() => this._reloadHistoryFavicons(faviconsKey)));
		}

		// Permissions are synced via browser-view state + a dynamic event rather
		// than storage, so they work for ephemeral sessions (which never persist).
		this.permissions.hydrate(initialState.permissions);
		this._register(this._remoteEvents.onDidChangePermissions.event(
			snapshot => this.permissions.hydrate(snapshot)));

		// Sync initial zoom
		const effectiveZoomIndex = this.zoomService.getEffectiveZoomIndex(this._zoomHost, this._isInMemory);
		if (effectiveZoomIndex !== this._browserZoomIndex) {
			void this.setBrowserZoomIndex(effectiveZoomIndex).catch(e => {
				this.logService.warn(`[BrowserViewModel] Failed to set initial zoom:`, e);
			});
		}
		// Set up state synchronization

		this._register(this.zoomService.onDidChangeZoom(({ host, isInMemoryChange }) => {
			if (isInMemoryChange && !this._isInMemory) {
				return;
			}
			if (host === undefined || host === this._zoomHost) {
				void this.setBrowserZoomIndex(
					this.zoomService.getEffectiveZoomIndex(this._zoomHost, this._isInMemory)
				).catch(() => { });
			}
		}));

		this._register(this.onDidNavigate(e => {
			// Clear favicon on navigation to a different host
			if (URL.parse(e.url)?.host !== URL.parse(this._url)?.host) {
				this._favicon = undefined;
			}

			this._zoomHost = parseZoomHost(e.url);
			this._url = e.url;
			this._title = e.title;
			this._canGoBack = e.canGoBack;
			this._canGoForward = e.canGoForward;
			this._certificateError = e.certificateError;

			// Always forceApply because Chromium resets zoom on cross-origin navigation,
			// and an origin change may not correspond to a host change (e.g. http→https).
			void this.setBrowserZoomIndex(
				this.zoomService.getEffectiveZoomIndex(this._zoomHost, this._isInMemory),
				true
			);
		}));

		this._register(this.onDidChangeLoadingState(e => {
			this._loading = e.loading;
			this._error = e.error;
		}));

		this._register(this.onDidChangeDevToolsState(e => {
			this._isDevToolsOpen = e.isDevToolsOpen;
		}));

		this._register(this.onDidChangeTitle(e => {
			this._title = e.title;
		}));

		this._register(this.onDidChangeFavicon(e => {
			this._favicon = e.favicon;
		}));

		this._register(this.onDidChangeFocus(({ focused }) => {
			this._focused = focused;
		}));

		this._register(this.onDidChangeVisibility(({ visible }) => {
			this._visible = visible;
		}));

		this._register(this._remoteEvents.onDidChangeDeviceEmulation.event(device => {
			if (!structuralEquals(this._device, device)) {
				this._device = device;
				this._onDidChangeDevice.fire(device);
			}
		}));

		this._register(this.onDidChangeRemoteStatus(isRemoteSession => {
			this._isRemoteSession = isRemoteSession;
		}));
	}

	get url(): string { return this._url; }
	get title(): string { return this._title; }
	get favicon(): string | undefined { return this._favicon; }
	get loading(): boolean { return this._loading; }
	get focused(): boolean { return this._focused; }
	get visible(): boolean { return this._visible; }
	get isDevToolsOpen(): boolean { return this._isDevToolsOpen; }
	get canGoBack(): boolean { return this._canGoBack; }
	get canGoForward(): boolean { return this._canGoForward; }
	get screenshot(): VSBuffer | undefined { return this._screenshot; }
	get error(): IBrowserViewLoadError | undefined { return this._error; }
	get certificateError(): IBrowserViewCertificateError | undefined { return this._certificateError; }
	get storageScope(): BrowserViewStorageScope { return this._storageScope; }
	get isRemoteSession(): boolean { return this._isRemoteSession; }
	get zoomFactor(): number { return browserZoomFactors[this._browserZoomIndex]; }
	get canZoomIn(): boolean { return this._browserZoomIndex < browserZoomFactors.length - 1; }
	get canZoomOut(): boolean { return this._browserZoomIndex > 0; }
	get device(): IBrowserDeviceProfile | undefined { return this._device; }

	async layout(bounds: IBrowserViewBounds): Promise<void> {
		return this.browserViewService.layout(this.id, bounds);
	}

	async setVisible(visible: boolean): Promise<void> {
		this._visible = visible; // Set optimistically so model is in sync immediately
		return this.browserViewService.setVisible(this.id, visible);
	}

	async loadURL(url: string, options?: INavigateOptions): Promise<void> {
		this.logNavigationTelemetry(options?.source ?? 'urlInput', url);
		this._onWillNavigate.fire(url);

		// Prepend http:// for bare localhost authorities (e.g. "localhost:3000").
		if (/^localhost(:|\/|$)/i.test(url)) {
			url = 'http://' + url;
		} else if (!URL.parse(url)?.protocol) {
			// No scheme — default to http://; sites typically upgrade to https://.
			url = 'http://' + url;
		}

		return this.browserViewService.loadURL(this.id, url);
	}

	async goBack(): Promise<void> {
		this.logNavigationTelemetry('goBack', this._url);
		return this.browserViewService.goBack(this.id);
	}

	async goForward(): Promise<void> {
		this.logNavigationTelemetry('goForward', this._url);
		return this.browserViewService.goForward(this.id);
	}

	async reload(hard?: boolean): Promise<void> {
		this.logNavigationTelemetry('reload', this._url);
		return this.browserViewService.reload(this.id, hard);
	}

	async toggleDevTools(): Promise<void> {
		return this.browserViewService.toggleDevTools(this.id);
	}

	async captureScreenshot(options?: IBrowserViewCaptureScreenshotOptions): Promise<VSBuffer> {
		const result = await this.browserViewService.captureScreenshot(this.id, options);
		// Store full-page screenshots for display in UI as placeholders
		if (!options?.screenRect && !options?.pageRect && !options?.fullPage) {
			this._screenshot = result;
		}
		return result;
	}

	async focus(force?: boolean): Promise<void> {
		return this.browserViewService.focus(this.id, force);
	}

	async findInPage(text: string, options?: IBrowserViewFindInPageOptions): Promise<void> {
		return this.browserViewService.findInPage(this.id, text, options);
	}

	async stopFindInPage(keepSelection?: boolean): Promise<void> {
		return this.browserViewService.stopFindInPage(this.id, keepSelection);
	}

	async getSelectedText(): Promise<string> {
		return this.browserViewService.getSelectedText(this.id);
	}

	async clearStorage(): Promise<void> {
		return this.browserViewService.clearStorage(this.id);
	}

	async trustCertificate(host: string, fingerprint: string): Promise<void> {
		return this.browserViewService.trustCertificate(this.id, host, fingerprint);
	}

	async untrustCertificate(host: string, fingerprint: string): Promise<void> {
		return this.browserViewService.untrustCertificate(this.id, host, fingerprint);
	}

	async deleteHistory(entryIds?: readonly number[]): Promise<void> {
		// Mirror locally so the workbench updates immediately; the eventual
		// storage change event from the main-process flush will re-hydrate to
		// the same content.
		if (entryIds === undefined) {
			this.history.clear();
		} else {
			for (const id of entryIds) {
				this.history.entries.delete(id);
			}
		}
		return this.browserViewService.deleteBrowserHistory(this.id, entryIds);
	}

	async setPermissions(origin: string, grants: readonly IPermissionCategoryState[]): Promise<void> {
		// Mirror locally so the workbench reflects the decision immediately
		this.permissions.setMany(origin, grants);
		return this.browserViewService.setPermissions(this.id, origin, grants);
	}

	async selectDevice(requestId: string, deviceId: string | null): Promise<void> {
		return this.browserViewService.selectDevice(this.id, requestId, deviceId);
	}

	/**
	 * @param forceApply When true, the IPC call is made even if the local cached zoom index
	 * already matches the requested value. Pass true after cross-document navigation because
	 * Chromium resets the zoom to its per-origin default, making the cache stale.
	 */
	private async setBrowserZoomIndex(zoomIndex: number, forceApply = false): Promise<void> {
		const clamped = Math.max(0, Math.min(zoomIndex, browserZoomFactors.length - 1));
		if (!forceApply && clamped === this._browserZoomIndex) {
			return;
		}
		this._browserZoomIndex = clamped;
		await this.browserViewService.setBrowserZoomIndex(this.id, this._browserZoomIndex);
		this._onDidChangeZoom.fire();
	}

	async zoomIn(): Promise<void> {
		if (!this.canZoomIn) {
			return;
		}
		await this.setBrowserZoomIndex(this._browserZoomIndex + 1);
		if (this._zoomHost) {
			this.zoomService.setHostZoomIndex(this._zoomHost, this._browserZoomIndex, this._isInMemory);
		}
	}

	async zoomOut(): Promise<void> {
		if (!this.canZoomOut) {
			return;
		}
		await this.setBrowserZoomIndex(this._browserZoomIndex - 1);
		if (this._zoomHost) {
			this.zoomService.setHostZoomIndex(this._zoomHost, this._browserZoomIndex, this._isInMemory);
		}
	}

	async resetZoom(): Promise<void> {
		const defaultIndex = this.zoomService.getEffectiveZoomIndex(undefined, false);
		await this.setBrowserZoomIndex(defaultIndex);
		if (this._zoomHost) {
			this.zoomService.setHostZoomIndex(this._zoomHost, defaultIndex, this._isInMemory);
		}
	}

	async setDevice(device: IBrowserDeviceProfile | undefined): Promise<void> {
		// Update model state optimistically so dependent UI reacts immediately;
		// the echo from the main process is filtered by deep comparison.
		if (!structuralEquals(this._device, device)) {
			this._device = device;
			this._onDidChangeDevice.fire(device);
		}
		return this.browserViewService.setDeviceEmulation(this.id, device);
	}

	private _reloadHistoryEntries(key: string): void {
		const raw = this.storageService.get(key, StorageScope.APPLICATION);
		this.history.entries.hydrate(parseHistorySnapshot<ISerializedBrowserHistoryEntriesSnapshot>(raw));
	}

	private _reloadHistoryFavicons(key: string): void {
		const raw = this.storageService.get(key, StorageScope.APPLICATION);
		this.history.favicons.hydrate(parseHistorySnapshot<ISerializedBrowserFaviconsSnapshot>(raw));
	}

	/**
	 * Log navigation telemetry event
	 */
	private logNavigationTelemetry(navigationType: IntegratedBrowserNavigationEvent['navigationType'], url: string): void {
		let localhost: boolean;
		try {
			localhost = isLocalhostAuthority(new URL(url).host);
		} catch {
			localhost = false;
		}

		this.telemetryService.publicLog2<IntegratedBrowserNavigationEvent, IntegratedBrowserNavigationClassification>(
			'integratedBrowser.navigation',
			{
				navigationType,
				isLocalhost: localhost
			}
		);
	}

	override dispose(): void {
		this._onWillDispose.fire();

		// Clean up the browser view when the model is disposed
		void this.browserViewService.destroyBrowserView(this.id);

		super.dispose();
	}
}
