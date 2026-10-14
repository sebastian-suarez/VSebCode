/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as nls from '../../../../nls.js';
import severity from '../../../../base/common/severity.js';
import { Disposable, MutableDisposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { IActivityService, NumberBadge, IBadge, ProgressBadge } from '../../../services/activity/common/activity.js';
import { IInstantiationService, ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IStorageService, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { IUpdateService, State as UpdateState, StateType } from '../../../../platform/update/common/update.js';
import { INotificationService, NotificationPriority } from '../../../../platform/notification/common/notification.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IBrowserWorkbenchEnvironmentService } from '../../../services/environment/browser/environmentService.js';
import { isWeb } from '../../../../base/common/platform.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { RawContextKey, IContextKey, IContextKeyService, ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { MenuRegistry, MenuId } from '../../../../platform/actions/common/actions.js';
import { CommandsRegistry } from '../../../../platform/commands/common/commands.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IVersion, tryParseVersion } from '../common/updateUtils.js';
import { UpdateGlobalActivityBadgeVisibleContext } from '../common/update.js';

export const CONTEXT_UPDATE_STATE = new RawContextKey<string>('updateState', StateType.Uninitialized);
export const MAJOR_MINOR_UPDATE_AVAILABLE = new RawContextKey<boolean>('majorMinorUpdateAvailable', false);

async function showReleaseNotes(accessor: ServicesAccessor): Promise<void> {
	const openerService = accessor.get(IOpenerService);
	const productService = accessor.get(IProductService);

	if (productService.releaseNotesUrl) {
		await openerService.open(URI.parse(productService.releaseNotesUrl));
	} else {
		throw new Error(nls.localize('update.noReleaseNotesOnline', "This version of {0} does not have release notes online", productService.nameLong));
	}
}

/**
 * Appends update-related menu items to the given menu. This registers menu items
 * for all update states (idle, checking, downloading, etc.) that show the current
 * update status. The underlying commands (`update.check`, `update.restart`, etc.)
 * must be registered separately.
 */
export function appendUpdateMenuItems(menuId: MenuId, group: string): void {
	MenuRegistry.appendMenuItem(menuId, {
		group,
		command: {
			id: 'update.check',
			title: nls.localize('checkForUpdates', "Check for Updates...")
		},
		when: CONTEXT_UPDATE_STATE.isEqualTo(StateType.Idle)
	});

	MenuRegistry.appendMenuItem(menuId, {
		group,
		command: {
			id: 'update.checking',
			title: nls.localize('checkingForUpdates2', "Checking for Updates..."),
			precondition: ContextKeyExpr.false()
		},
		when: CONTEXT_UPDATE_STATE.isEqualTo(StateType.CheckingForUpdates)
	});

	MenuRegistry.appendMenuItem(menuId, {
		group,
		command: {
			id: 'update.downloadNow',
			title: nls.localize('download update_1', "Download Update (1)")
		},
		when: CONTEXT_UPDATE_STATE.isEqualTo(StateType.AvailableForDownload)
	});

	MenuRegistry.appendMenuItem(menuId, {
		group,
		command: {
			id: 'update.downloading',
			title: nls.localize('DownloadingUpdate', "Downloading Update..."),
			precondition: ContextKeyExpr.false()
		},
		when: CONTEXT_UPDATE_STATE.isEqualTo(StateType.Downloading)
	});

	MenuRegistry.appendMenuItem(menuId, {
		group,
		command: {
			id: 'update.install',
			title: nls.localize('installUpdate...', "Install Update... (1)")
		},
		when: CONTEXT_UPDATE_STATE.isEqualTo(StateType.Downloaded)
	});

	MenuRegistry.appendMenuItem(menuId, {
		group,
		command: {
			id: 'update.updating',
			title: nls.localize('installingUpdate', "Installing Update..."),
			precondition: ContextKeyExpr.false()
		},
		when: CONTEXT_UPDATE_STATE.isEqualTo(StateType.Updating)
	});

	MenuRegistry.appendMenuItem(menuId, {
		group,
		command: {
			id: 'update.cancelling',
			title: nls.localize('cancellingUpdateMenuEntry', "Cancelling Update..."),
			precondition: ContextKeyExpr.false()
		},
		when: CONTEXT_UPDATE_STATE.isEqualTo(StateType.Cancelling)
	});

	MenuRegistry.appendMenuItem(menuId, {
		group,
		order: 2,
		command: {
			id: 'update.restart',
			title: nls.localize('restartToUpdate', "Restart to Update (1)")
		},
		when: CONTEXT_UPDATE_STATE.isEqualTo(StateType.Ready)
	});
}

function isMajorMinorUpdate(before: IVersion, after: IVersion): boolean {
	return before.major < after.major || before.minor < after.minor;
}

export class ProductContribution implements IWorkbenchContribution {

	private static readonly KEY = 'releaseNotes/lastVersion';

	constructor(
		@IStorageService storageService: IStorageService,
		@INotificationService notificationService: INotificationService,
		@IBrowserWorkbenchEnvironmentService environmentService: IBrowserWorkbenchEnvironmentService,
		@IOpenerService openerService: IOpenerService,
		@IConfigurationService configurationService: IConfigurationService,
		@IHostService hostService: IHostService,
		@IProductService productService: IProductService,
	) {
		if (isWeb) {
			return;
		}

		hostService.hadLastFocus().then(async hadLastFocus => {
			if (!hadLastFocus) {
				return;
			}

			const lastVersion = tryParseVersion(storageService.get(ProductContribution.KEY, StorageScope.APPLICATION, ''));
			const currentVersion = tryParseVersion(productService.version);
			const shouldShowReleaseNotes = configurationService.getValue<boolean>('update.showReleaseNotes');
			const releaseNotesUrl = productService.releaseNotesUrl;

			// was there a major/minor update? if so, offer the release notes
			if (shouldShowReleaseNotes && !environmentService.skipReleaseNotes && releaseNotesUrl && lastVersion && currentVersion && isMajorMinorUpdate(lastVersion, currentVersion)) {
				notificationService.prompt(
					severity.Info,
					nls.localize('read the release notes', "Welcome to {0} v{1}! Would you like to read the Release Notes?", productService.nameLong, productService.version),
					[{
						label: nls.localize('releaseNotes', "Release Notes"),
						run: () => {
							const uri = URI.parse(releaseNotesUrl);
							openerService.open(uri);
						}
					}],
					{ priority: NotificationPriority.OPTIONAL }
				);
			}

			storageService.store(ProductContribution.KEY, productService.version, StorageScope.APPLICATION, StorageTarget.MACHINE);
		});
	}
}

export class UpdateContribution extends Disposable implements IWorkbenchContribution {

	private state: UpdateState;
	private readonly badgeDisposable = this._register(new MutableDisposable());
	private updateStateContextKey: IContextKey<string>;
	private majorMinorUpdateAvailableContextKey: IContextKey<boolean>;

	constructor(
		@IStorageService storageService: IStorageService,
		@IInstantiationService private readonly instantiationService: IInstantiationService,
		@IDialogService private readonly dialogService: IDialogService,
		@IUpdateService private readonly updateService: IUpdateService,
		@IActivityService private readonly activityService: IActivityService,
		@IContextKeyService private readonly contextKeyService: IContextKeyService,
		@IProductService private readonly productService: IProductService,
		@IHostService private readonly hostService: IHostService,
	) {
		super();
		this.state = updateService.state;
		this.updateStateContextKey = CONTEXT_UPDATE_STATE.bindTo(contextKeyService);
		this.majorMinorUpdateAvailableContextKey = MAJOR_MINOR_UPDATE_AVAILABLE.bindTo(contextKeyService);

		this._register(updateService.onStateChange(this.onUpdateStateChange, this));

		const updateGlobalActivityBadgeContextKeys = new Set(UpdateGlobalActivityBadgeVisibleContext.keys());
		this._register(contextKeyService.onDidChangeContext(e => {
			if (e.affectsSome(updateGlobalActivityBadgeContextKeys)) {
				this.updateBadge(this.updateService.state);
			}
		}));

		this.onUpdateStateChange(this.updateService.state);

		/*
		The `update/lastKnownVersion` and `update/updateNotificationTime` storage keys are used in
		combination to figure out when to show a message to the user that he should update.

		This message should appear if the user has received an update notification but hasn't
		updated since 5 days.
		*/

		const currentVersion = this.productService.commit;
		const lastKnownVersion = storageService.get('update/lastKnownVersion', StorageScope.APPLICATION);

		// if current version != stored version, clear both fields
		if (currentVersion !== lastKnownVersion) {
			storageService.remove('update/lastKnownVersion', StorageScope.APPLICATION);
			storageService.remove('update/updateNotificationTime', StorageScope.APPLICATION);
		}

		this.registerGlobalActivityActions();
	}

	private async onUpdateStateChange(state: UpdateState): Promise<void> {
		this.updateStateContextKey.set(state.type);

		switch (state.type) {
			case StateType.Idle:
				// Themed dialog shown from the last focused window; the windowless macOS case is handled by the main process.
				if (state.notAvailable && !state.error && await this.hostService.hadLastFocus()) {
					this.dialogService.info(nls.localize('noUpdatesAvailable', "There are currently no updates available."));
				}
				break;

			case StateType.Ready: {
				const productVersion = state.update.productVersion;
				if (productVersion) {
					const currentVersion = tryParseVersion(this.productService.version);
					const nextVersion = tryParseVersion(productVersion);
					this.majorMinorUpdateAvailableContextKey.set(Boolean(currentVersion && nextVersion && isMajorMinorUpdate(currentVersion, nextVersion)));
				}
				break;
			}
		}

		this.updateBadge(state);

		this.state = state;
	}

	private updateBadge(state: UpdateState): void {
		let badge: IBadge | undefined;

		if (state.type === StateType.AvailableForDownload || state.type === StateType.Downloaded || state.type === StateType.Ready) {
			badge = new NumberBadge(1, () => nls.localize('updateIsReady', "New {0} update available.", this.productService.nameShort));
		} else if (state.type === StateType.CheckingForUpdates) {
			badge = new ProgressBadge(() => nls.localize('checkingForUpdates', "Checking for {0} updates...", this.productService.nameShort));
		} else if (state.type === StateType.Downloading || state.type === StateType.Overwriting) {
			badge = new ProgressBadge(() => nls.localize('downloading', "Downloading {0} update...", this.productService.nameShort));
		} else if (state.type === StateType.Updating) {
			badge = new ProgressBadge(() => nls.localize('updating', "Updating {0}...", this.productService.nameShort));
		} else if (state.type === StateType.Cancelling) {
			badge = new ProgressBadge(() => nls.localize('cancellingUpdate', "Cancelling {0} update...", this.productService.nameShort));
		}

		this.badgeDisposable.clear();

		if (badge && this.contextKeyService.contextMatchesRules(UpdateGlobalActivityBadgeVisibleContext)) {
			this.badgeDisposable.value = this.activityService.showGlobalActivity({ badge });
		}
	}

	private registerGlobalActivityActions(): void {
		CommandsRegistry.registerCommand('update.check', () => this.updateService.checkForUpdates(true));
		CommandsRegistry.registerCommand('update.checking', () => { });
		CommandsRegistry.registerCommand('update.downloadNow', () => this.updateService.downloadUpdate(true));
		CommandsRegistry.registerCommand('update.downloading', () => { });
		CommandsRegistry.registerCommand('update.install', () => this.updateService.applyUpdate());
		CommandsRegistry.registerCommand('update.updating', () => { });
		CommandsRegistry.registerCommand('update.cancelling', () => { });
		CommandsRegistry.registerCommand('update.restart', () => this.updateService.quitAndInstall());
		CommandsRegistry.registerCommand('_update.state', () => {
			return this.state;
		});

		appendUpdateMenuItems(MenuId.GlobalActivity, '7_update');

		if (this.productService.quality === 'stable') {
			CommandsRegistry.registerCommand('update.showUpdateReleaseNotes', () => {
				if (this.updateService.state.type !== StateType.Ready) {
					return;
				}

				this.instantiationService.invokeFunction(accessor => showReleaseNotes(accessor));
			});
			MenuRegistry.appendMenuItem(MenuId.GlobalActivity, {
				group: '7_update',
				order: 1,
				command: {
					id: 'update.showUpdateReleaseNotes',
					title: nls.localize('showUpdateReleaseNotes', "Show Update Release Notes")
				},
				when: ContextKeyExpr.and(CONTEXT_UPDATE_STATE.isEqualTo(StateType.Ready), MAJOR_MINOR_UPDATE_AVAILABLE)
			});
		}
	}
}
