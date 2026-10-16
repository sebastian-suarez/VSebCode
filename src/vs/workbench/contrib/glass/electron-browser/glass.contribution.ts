/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Color } from '../../../../base/common/color.js';
import { Event } from '../../../../base/common/event.js';
import { Disposable, toDisposable } from '../../../../base/common/lifecycle.js';
import { IAccessibilityService } from '../../../../platform/accessibility/common/accessibility.js';
import { GLASS_TINT_OPACITY, glassAppearanceOfColorScheme, glassTintColor } from '../../../../platform/glass/common/glass.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { INativeHostService } from '../../../../platform/native/common/native.js';
import { isHighContrast } from '../../../../platform/theme/common/theme.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { SIDE_BAR_BACKGROUND } from '../../../common/theme.js';
import { IWorkbenchContribution, registerWorkbenchContribution2, WorkbenchPhase } from '../../../common/contributions.js';
import { INativeWorkbenchEnvironmentService } from '../../../services/environment/electron-browser/environmentService.js';
import { IWorkbenchLayoutService } from '../../../services/layout/browser/layoutService.js';
import './media/glass.css';

const TINT_PROPERTY = '--glass-sidebar-tint';

/**
 * Renders the primary side bar as glass in a window the main process created with a native
 * glass layer (`window.glass`): turns the layout service's glass side bar on unless the theme
 * is high contrast or transparency is reduced, and keeps the native layer in step with it,
 * hidden while the side bar is opaque, otherwise tinted with the theme's side bar color and
 * following the theme's appearance. The side bar part reports its own bounds for the backing's
 * hole. When the main process has released the layer (the OS reduced-transparency preference
 * turned on while the window lived), the side bar stays opaque until the window is recreated.
 */
export class GlassSideBarContribution extends Disposable implements IWorkbenchContribution {

	static readonly ID = 'workbench.contrib.glassSideBar';

	private layerLost = false;

	constructor(
		@INativeWorkbenchEnvironmentService environmentService: INativeWorkbenchEnvironmentService,
		@IWorkbenchLayoutService private readonly layoutService: IWorkbenchLayoutService,
		@IAccessibilityService private readonly accessibilityService: IAccessibilityService,
		@IThemeService private readonly themeService: IThemeService,
		@INativeHostService private readonly nativeHostService: INativeHostService,
		@ILogService private readonly logService: ILogService,
	) {
		super();

		if (!environmentService.window.glass) {
			return; // an opaque window: nothing to render differently
		}

		this._register(this.accessibilityService.onDidChangeReducedTransparency(() => this.update()));
		this._register(this.themeService.onDidColorThemeChange(() => this.update()));
		this._register(Event.filter(this.nativeHostService.onDidDetachGlass, windowId => windowId === environmentService.window.id)(() => this.loseLayer()));
		this._register(toDisposable(() => this.layoutService.setGlassSideBar(false)));

		this.update();
	}

	private update(): void {
		const theme = this.themeService.getColorTheme();
		const enabled = !this.layerLost && !isHighContrast(theme.type) && !this.accessibilityService.isTransparencyReduced();
		this.layoutService.setGlassSideBar(enabled);

		const sideBarBackground = theme.getColor(SIDE_BAR_BACKGROUND);
		this.layoutService.mainContainer.style.setProperty(TINT_PROPERTY, sideBarBackground ? Color.Format.CSS.formatRGBA(sideBarBackground.transparent(GLASS_TINT_OPACITY)) : 'transparent');
		if (this.layerLost) {
			return;
		}

		const tintColor = (sideBarBackground ? glassTintColor(sideBarBackground) : undefined) ?? '';
		this.nativeHostService.updateGlass({ hidden: !enabled, tintColor, appearance: glassAppearanceOfColorScheme(theme.type) }).then(attached => {
			if (!attached) {
				this.loseLayer();
			}
		}, error => this.logService.warn('[glass] Updating the glass layer failed', error));
	}

	private loseLayer(): void {
		if (this.layerLost || this._store.isDisposed) {
			return;
		}
		this.layerLost = true;
		this.logService.info('[glass] The window has no glass layer any more; the side bar stays opaque');
		this.layoutService.setGlassSideBar(false);
	}
}

registerWorkbenchContribution2(GlassSideBarContribution.ID, GlassSideBarContribution, WorkbenchPhase.BlockRestore);
