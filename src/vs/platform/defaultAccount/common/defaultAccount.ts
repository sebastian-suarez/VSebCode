/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ICopilotTokenInfo, IDefaultAccount, IDefaultAccountAuthenticationProvider, IPolicyData } from '../../../base/common/defaultAccount.js';
import { Event } from '../../../base/common/event.js';
import { createDecorator } from '../../instantiation/common/instantiation.js';
import { IManagedSettingsFreshness, MANAGED_SETTINGS_FRESHNESS_NOT_REQUIRED } from '../../policy/common/managedSettingsFreshness.js';

/**
 * Well-known GitHub URL paths used with {@link IDefaultAccountService.resolveGitHubUrl}.
 */
export const GitHubPaths = {
	copilotSettings: 'settings/copilot/features',
	billingBudgets: 'settings/copilot/features?utm_source=vscode',
	copilotUpgrade: 'github-copilot/upgrade?utm_source=vscode',
} as const;

/**
 * Outcome of the last `/copilot_internal/managed_settings` fetch.
 * - A numeric HTTP status code indicates the server responded with that code.
 * - `'ok'`: response parsed and adapted successfully (including an empty `{}` body).
 * - `'no-url'`: no `managedSettingsUrl` configured in product.json.
 * - `'no-response'`: network error, all sessions rejected, or active rate-limit backoff.
 * - `'parse-error'`: response received but JSON parsing failed.
 * - `null`: never fetched.
 */
export type ManagedSettingsFetchStatus = number | 'ok' | 'no-url' | 'no-response' | 'parse-error' | null;

export const MANAGED_SETTINGS_UPDATE_REQUIRED_ERROR_CODE = 'client_update_required';

export interface IManagedSettingsCompatibilityError {
	readonly errorCode: typeof MANAGED_SETTINGS_UPDATE_REQUIRED_ERROR_CODE;
	readonly clientVersion?: string;
	readonly minimumClientVersion?: string;
}

export interface IDefaultAccountRefreshOptions {
	readonly forceRefresh?: boolean;
	/** Refreshes entitlement data even when its cache is fresh. */
	readonly refreshEntitlements?: boolean;
	/** Allows an explicit user action to retry managed settings after a failed attempt. */
	readonly retryManagedSettings?: boolean;
}

export interface IDefaultAccountProvider {
	readonly defaultAccount: IDefaultAccount | null;
	readonly onDidChangeDefaultAccount: Event<IDefaultAccount | null>;
	readonly policyData: IPolicyData | null;
	readonly onDidChangePolicyData: Event<IPolicyData | null>;
	readonly copilotTokenInfo: ICopilotTokenInfo | null;
	readonly onDidChangeCopilotTokenInfo: Event<ICopilotTokenInfo | null>;
	readonly managedSettingsFetchStatus: ManagedSettingsFetchStatus;
	/** Timestamp (ms) of the last managed-settings fetch, or `null` if never fetched. */
	readonly managedSettingsFetchedAt: number | null;
	/** The raw JSON response from the managed-settings endpoint, for diagnostics. */
	readonly managedSettingsRawResponse: unknown;
	readonly managedSettingsCompatibilityError: IManagedSettingsCompatibilityError | null;
	readonly onDidChangeManagedSettingsCompatibilityError: Event<IManagedSettingsCompatibilityError | null>;
	readonly managedSettingsFreshness: IManagedSettingsFreshness;
	readonly onDidChangeManagedSettingsFreshness: Event<IManagedSettingsFreshness>;
	getDefaultAccountAuthenticationProvider(): IDefaultAccountAuthenticationProvider;

	/**
	 * Resolves a GitHub path against the selected session's enterprise server, or `https://github.com` for a non-enterprise provider.
	 * Returns `undefined` when enterprise authentication is selected but the session's server is unavailable.
	 */
	resolveGitHubUrl(path: string): string | undefined;

	refresh(options?: IDefaultAccountRefreshOptions): Promise<IDefaultAccount | null>;
	signIn(options?: { additionalScopes?: readonly string[];[key: string]: unknown }): Promise<IDefaultAccount | null>;
	signOut(): Promise<void>;
}

export const IDefaultAccountService = createDecorator<IDefaultAccountService>('defaultAccountService');

export interface IDefaultAccountService {
	readonly _serviceBrand: undefined;
	readonly onDidChangeDefaultAccount: Event<IDefaultAccount | null>;
	readonly onDidChangePolicyData: Event<IPolicyData | null>;
	readonly policyData: IPolicyData | null;
	readonly currentDefaultAccount: IDefaultAccount | null;
	readonly copilotTokenInfo: ICopilotTokenInfo | null;
	readonly onDidChangeCopilotTokenInfo: Event<ICopilotTokenInfo | null>;
	readonly managedSettingsFetchStatus: ManagedSettingsFetchStatus;
	/** Timestamp (ms) of the last managed-settings fetch, or `null` if never fetched. */
	readonly managedSettingsFetchedAt: number | null;
	/** The raw JSON response from the managed-settings endpoint, for diagnostics. */
	readonly managedSettingsRawResponse: unknown;
	readonly managedSettingsCompatibilityError: IManagedSettingsCompatibilityError | null;
	readonly onDidChangeManagedSettingsCompatibilityError: Event<IManagedSettingsCompatibilityError | null>;
	readonly managedSettingsFreshness: IManagedSettingsFreshness;
	readonly onDidChangeManagedSettingsFreshness: Event<IManagedSettingsFreshness>;
	getDefaultAccount(): Promise<IDefaultAccount | null>;
	getDefaultAccountAuthenticationProvider(): IDefaultAccountAuthenticationProvider;
	setDefaultAccountProvider(provider: IDefaultAccountProvider): void;
	refresh(options?: IDefaultAccountRefreshOptions): Promise<IDefaultAccount | null>;
	signIn(options?: { additionalScopes?: readonly string[];[key: string]: unknown }): Promise<IDefaultAccount | null>;
	signOut(): Promise<void>;

	/**
	 * Resolves a GitHub path against the selected session's enterprise server, or `https://github.com` for a non-enterprise provider.
	 * Returns `undefined` when enterprise authentication is selected but the session's server is unavailable.
	 */
	resolveGitHubUrl(path: string): string | undefined;
}

/**
 * A default account provider that never has an account: there is no account service to sign in to.
 */
export class NullDefaultAccountProvider implements IDefaultAccountProvider {
	readonly defaultAccount = null;
	readonly onDidChangeDefaultAccount = Event.None;
	readonly policyData = null;
	readonly onDidChangePolicyData = Event.None;
	readonly copilotTokenInfo = null;
	readonly onDidChangeCopilotTokenInfo = Event.None;
	readonly managedSettingsFetchStatus = null;
	readonly managedSettingsFetchedAt = null;
	readonly managedSettingsRawResponse = null;
	readonly managedSettingsCompatibilityError = null;
	readonly onDidChangeManagedSettingsCompatibilityError = Event.None;
	readonly managedSettingsFreshness = MANAGED_SETTINGS_FRESHNESS_NOT_REQUIRED;
	readonly onDidChangeManagedSettingsFreshness = Event.None;

	constructor(private readonly authenticationProvider: IDefaultAccountAuthenticationProvider) { }

	getDefaultAccountAuthenticationProvider(): IDefaultAccountAuthenticationProvider {
		return this.authenticationProvider;
	}

	resolveGitHubUrl(path: string): string {
		return `https://github.com/${path}`;
	}

	async refresh(): Promise<IDefaultAccount | null> {
		return null;
	}

	async signIn(): Promise<IDefaultAccount | null> {
		return null;
	}

	async signOut(): Promise<void> { }
}

export { MANAGED_SETTINGS_FRESHNESS_NOT_REQUIRED };
