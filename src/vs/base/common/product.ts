/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IStringDictionary } from './collections.js';
import { PlatformName } from './platform.js';
import { IExtensionConfigurationPolicyReference, IPolicy } from './policy.js';

export interface IBuiltInExtension {
	readonly name: string;
	readonly version: string;
	readonly repo: string;
	readonly metadata: unknown;
}

export interface IProductWalkthrough {
	id: string;
	steps: IProductWalkthroughStep[];
}

export interface IProductWalkthroughStep {
	id: string;
	title: string;
	when: string;
	description: string;
	media:
	| { type: 'image'; path: string | { hc: string; hcLight?: string; light: string; dark: string }; altText: string }
	| { type: 'svg'; path: string; altText: string }
	| { type: 'markdown'; path: string };
}

export interface IFeaturedExtension {
	readonly id: string;
	readonly title: string;
	readonly description: string;
	readonly imagePath: string;
}

export type ExtensionUntrustedWorkspaceSupport = {
	readonly default?: boolean | 'limited';
	readonly override?: boolean | 'limited';
};

export type ExtensionVirtualWorkspaceSupport = {
	readonly default?: boolean;
	readonly override?: boolean;
};

export interface IProductConfiguration {
	readonly version: string;
	readonly date?: string;
	readonly quality?: string;
	readonly commit?: string;

	readonly nameShort: string;
	readonly nameLong: string;

	readonly win32AppUserModelId?: string;
	readonly win32MutexName?: string;
	readonly win32SetupMutexName?: string;
	readonly win32RegValueName?: string;
	readonly win32NameVersion?: string;
	readonly win32ContextMenu?: { readonly [arch: string]: { readonly clsid: string } };
	readonly applicationName: string;
	readonly linuxDesktopName?: string;
	readonly embedderIdentifier?: string;

	readonly urlProtocol: string;
	readonly dataFolderName: string; // location for extensions (e.g. ~/.vscode-insiders)
	readonly sharedDataFolderName: string; // location for shared data (e.g. ~/.vscode-insiders-shared)

	readonly builtInExtensions?: IBuiltInExtension[];
	readonly walkthroughMetadata?: IProductWalkthrough[];
	readonly featuredExtensions?: IFeaturedExtension[];

	readonly downloadUrl?: string;
	readonly target?: string;
	readonly nlsCoreBaseUrl?: string;
	/** Build-time hash of the commit and core NLS tables used to identify translated-message caches. */
	readonly nlsMetadataHash?: string;

	readonly settingsSearchBuildId?: number;
	readonly settingsSearchUrl?: string;

	readonly extensionsGallery?: {
		readonly serviceUrl: string;
		readonly controlUrl: string;
		readonly extensionUrlTemplate: string;
		readonly resourceUrlTemplate: string;
		readonly nlsBaseUrl: string;
	};

	readonly extensionPublisherOrgs?: readonly string[];
	readonly trustedExtensionPublishers?: readonly string[];

	readonly extensionRecommendations?: IStringDictionary<IExtensionRecommendations>;
	readonly configBasedExtensionTips?: IStringDictionary<IConfigBasedExtensionTip>;
	readonly exeBasedExtensionTips?: IStringDictionary<IExeBasedExtensionTip>;
	readonly remoteExtensionTips?: IStringDictionary<IRemoteExtensionTip>;
	readonly virtualWorkspaceExtensionTips?: IStringDictionary<IVirtualWorkspaceExtensionTip>;
	readonly extensionKeywords?: IStringDictionary<string[]>;
	readonly keymapExtensionTips?: readonly string[];
	readonly languageExtensionTips?: readonly string[];
	readonly trustedExtensionUrlPublicKeys?: IStringDictionary<string[]>;
	readonly trustedExtensionProtocolHandlers?: readonly string[];

	readonly commandPaletteSuggestedCommandIds?: string[];

	readonly openToWelcomeMainPage?: boolean;

	readonly documentationUrl?: string;
	readonly keyboardShortcutsUrlMac?: string;
	readonly keyboardShortcutsUrlLinux?: string;
	readonly keyboardShortcutsUrlWin?: string;
	readonly introductoryVideosUrl?: string;
	readonly tipsAndTricksUrl?: string;
	readonly newsletterSignupUrl?: string;
	readonly youTubeUrl?: string;
	readonly requestFeatureUrl?: string;
	readonly reportIssueUrl?: string;
	readonly reportMarketplaceIssueUrl?: string;
	readonly licenseUrl?: string;
	readonly privacyStatementUrl?: string;

	readonly checksums?: { [path: string]: string };
	readonly checksumFailMoreInfoUrl?: string;

	readonly portable?: string;

	readonly extensionKind?: { readonly [extensionId: string]: ('ui' | 'workspace' | 'web')[] };
	readonly extensionPointExtensionKind?: { readonly [extensionPointId: string]: ('ui' | 'workspace' | 'web')[] };
	readonly extensionSyncedKeys?: { readonly [extensionId: string]: string[] };

	readonly extensionEnabledApiProposals?: { readonly [extensionId: string]: string[] };
	readonly extensionUntrustedWorkspaceSupport?: { readonly [extensionId: string]: ExtensionUntrustedWorkspaceSupport };
	readonly extensionVirtualWorkspacesSupport?: { readonly [extensionId: string]: ExtensionVirtualWorkspaceSupport };
	readonly extensionProperties: IStringDictionary<{
		readonly hasPrereleaseVersion?: boolean;
		readonly excludeVersionRange?: string;
	}>;
	readonly extensionsForceVersionByQuality?: readonly string[];

	readonly linkProtectionTrustedDomains?: readonly string[];

	readonly darwinUniversalAssetId?: string;
	readonly darwinBundleIdentifier?: string;
	readonly profileTemplatesUrl?: string;

	readonly commonlyUsedSettings?: string[];

	readonly remoteDefaultExtensionsIfInstalledLocally?: string[];

	/**
	 * Maps an extension-contributed setting key to either a full enterprise {@link IPolicy}
	 * (the setting owns/"parents" the policy — the original syntax) or an
	 * {@link IExtensionConfigurationPolicyReference} (`{ policyReference: { name } }`), attaching the
	 * setting to a policy owned by an in-code setting. References let a `product.json`-provided
	 * setting be governed by a policy whose `value` callback — which JSON cannot carry — lives in code.
	 */
	readonly extensionConfigurationPolicy?: IStringDictionary<IPolicy | IExtensionConfigurationPolicyReference>;

	/**
	 * When running as an embedded app, the parent VS Code's policy
	 * identity (win32RegValueName / darwinBundleIdentifier) so that
	 * enterprise policies deployed to the parent also apply here.
	 */
	parentPolicyConfig?: {
		win32RegValueName?: string;
		darwinBundleIdentifier?: string;
		urlProtocol?: string;
	};
}

export interface IExtensionRecommendations {
	readonly onFileOpen: IFileOpenCondition[];
	readonly onSettingsEditorOpen?: ISettingsEditorOpenCondition;
}

export interface ISettingsEditorOpenCondition {
	readonly prerelease?: boolean | string;
	readonly descriptionOverride?: string;
}

export interface IExtensionRecommendationCondition {
	readonly important?: boolean;
	readonly whenInstalled?: string[];
	readonly whenNotInstalled?: string[];
}

export type IFileOpenCondition = IFileLanguageCondition | IFilePathCondition | IFileContentCondition;

export interface IFileLanguageCondition extends IExtensionRecommendationCondition {
	readonly languages: string[];
}

export interface IFilePathCondition extends IExtensionRecommendationCondition {
	readonly pathGlob: string;
}

export type IFileContentCondition = (IFileLanguageCondition | IFilePathCondition) & { readonly contentPattern: string };

export interface IConfigBasedExtensionTip {
	configPath: string;
	configName: string;
	configScheme?: string;
	recommendations: IStringDictionary<{
		name: string;
		contentPattern?: string;
		important?: boolean;
		isExtensionPack?: boolean;
		whenNotInstalled?: string[];
	}>;
}

export interface IExeBasedExtensionTip {
	friendlyName: string;
	windowsPath?: string;
	important?: boolean;
	recommendations: IStringDictionary<{ name: string; important?: boolean; isExtensionPack?: boolean; whenNotInstalled?: string[] }>;
}

export interface IRemoteExtensionTip {
	friendlyName: string;
	extensionId: string;
	supportedPlatforms?: PlatformName[];
	startEntry?: {
		helpLink: string;
		startConnectLabel: string;
		startCommand: string;
		priority: number;
	};
}

export interface IVirtualWorkspaceExtensionTip {
	friendlyName: string;
	extensionId: string;
	supportedPlatforms?: PlatformName[];
	startEntry: {
		helpLink: string;
		startConnectLabel: string;
		startCommand: string;
		priority: number;
	};
}

