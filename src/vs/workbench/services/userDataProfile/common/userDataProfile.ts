/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { isUndefined } from '../../../../base/common/types.js';
import { Event } from '../../../../base/common/event.js';
import { localize, localize2 } from '../../../../nls.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { IUserDataProfile, IUserDataProfileOptions, IUserDataProfileUpdateOptions, ProfileResourceType, ProfileResourceTypeFlags } from '../../../../platform/userDataProfile/common/userDataProfile.js';
import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { URI } from '../../../../base/common/uri.js';
import { registerIcon } from '../../../../platform/theme/common/iconRegistry.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { ITreeItem, ITreeItemLabel } from '../../../common/views.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';

export interface DidChangeUserDataProfileEvent {
	readonly previous: IUserDataProfile;
	readonly profile: IUserDataProfile;
	join(promise: Promise<void>): void;
}

export const IUserDataProfileService = createDecorator<IUserDataProfileService>('IUserDataProfileService');
export interface IUserDataProfileService {
	readonly _serviceBrand: undefined;
	readonly currentProfile: IUserDataProfile;
	readonly onDidChangeCurrentProfile: Event<DidChangeUserDataProfileEvent>;
	updateCurrentProfile(currentProfile: IUserDataProfile): Promise<void>;
}

export interface IProfileTemplateInfo {
	readonly name: string;
	readonly url: string;
}

export const IUserDataProfileManagementService = createDecorator<IUserDataProfileManagementService>('IUserDataProfileManagementService');
export interface IUserDataProfileManagementService {
	readonly _serviceBrand: undefined;

	createProfile(name: string, options?: IUserDataProfileOptions): Promise<IUserDataProfile>;
	createAndEnterProfile(name: string, options?: IUserDataProfileOptions): Promise<IUserDataProfile>;
	createAndEnterTransientProfile(): Promise<IUserDataProfile>;
	removeProfile(profile: IUserDataProfile): Promise<void>;
	updateProfile(profile: IUserDataProfile, updateOptions: IUserDataProfileUpdateOptions): Promise<IUserDataProfile>;
	switchProfile(profile: IUserDataProfile): Promise<void>;
	getBuiltinProfileTemplates(): Promise<IProfileTemplateInfo[]>;
	getDefaultProfileToUse(): IUserDataProfile;
}

export interface IUserDataProfileTemplate {
	readonly name: string;
	readonly icon?: string;
	readonly settings?: string;
	readonly keybindings?: string;
	readonly tasks?: string;
	readonly snippets?: string;
	readonly globalState?: string;
	readonly extensions?: string;
}

export function isUserDataProfileTemplate(thing: unknown): thing is IUserDataProfileTemplate {
	const candidate = thing as IUserDataProfileTemplate | undefined;

	return !!(candidate && typeof candidate === 'object'
		&& (isUndefined(candidate.settings) || typeof candidate.settings === 'string')
		&& (isUndefined(candidate.globalState) || typeof candidate.globalState === 'string')
		&& (isUndefined(candidate.extensions) || typeof candidate.extensions === 'string'));
}

export const PROFILE_URL_AUTHORITY_PREFIX = 'profile-';
export function isProfileURL(uri: URI): boolean {
	return uri.authority.startsWith(PROFILE_URL_AUTHORITY_PREFIX);
}

export interface IUserDataProfileCreateOptions extends IUserDataProfileOptions {
	readonly name?: string;
	readonly resourceTypeFlags?: ProfileResourceTypeFlags;
}

export interface IProfileImportOptions extends IUserDataProfileCreateOptions {
	readonly name?: string;
	readonly icon?: string;
	readonly mode?: 'apply';
}

export const IUserDataProfileImportExportService = createDecorator<IUserDataProfileImportExportService>('IUserDataProfileImportExportService');
export interface IUserDataProfileImportExportService {
	readonly _serviceBrand: undefined;

	resolveProfileTemplate(uri: URI): Promise<IUserDataProfileTemplate | null>;
	exportProfile(profile: IUserDataProfile, exportFlags?: ProfileResourceTypeFlags): Promise<void>;
	createFromProfile(from: IUserDataProfile, options: IUserDataProfileCreateOptions, token: CancellationToken): Promise<IUserDataProfile | undefined>;
	createProfileFromTemplate(profileTemplate: IUserDataProfileTemplate, options: IUserDataProfileCreateOptions, token: CancellationToken): Promise<IUserDataProfile | undefined>;
	createTroubleshootProfile(): Promise<void>;
}

export interface IProfileResourceInitializer {
	initialize(content: string): Promise<void>;
}

export interface IProfileResource {
	getContent(profile: IUserDataProfile): Promise<string>;
	apply(content: string, profile: IUserDataProfile): Promise<void>;
}

export interface IProfileResourceTreeItem extends ITreeItem {
	readonly type: ProfileResourceType;
	readonly label: ITreeItemLabel;
	isFromDefaultProfile(): boolean;
	getChildren(): Promise<IProfileResourceChildTreeItem[] | undefined>;
	getContent(): Promise<string>;
}

export interface IProfileResourceChildTreeItem extends ITreeItem {
	parent: IProfileResourceTreeItem;
}

export const defaultUserDataProfileIcon = registerIcon('defaultProfile-icon', Codicon.settings, localize('defaultProfileIcon', 'Icon for Default Profile.'));

export const PROFILES_TITLE = localize2('profiles', 'Profiles');
export const PROFILES_CATEGORY = { ...PROFILES_TITLE };
export const PROFILE_EXTENSION = 'code-profile';
export const PROFILE_FILTER = [{ name: localize('profile', "Profile"), extensions: [PROFILE_EXTENSION] }];
export const CURRENT_PROFILE_CONTEXT = new RawContextKey<string>('currentProfile', '');
export const HAS_PROFILES_CONTEXT = new RawContextKey<boolean>('hasProfiles', false);
