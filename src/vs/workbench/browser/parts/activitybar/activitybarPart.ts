/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import './media/activitybarpart.css';
import './media/activityaction.css';
import { localize, localize2 } from '../../../../nls.js';
import { ActionsOrientation } from '../../../../base/browser/ui/actionbar/actionbar.js';
import { Part } from '../../part.js';
import { mainWindow } from '../../../../base/browser/window.js';
import { ActivityBarPosition, IWorkbenchLayoutService, LayoutSettings, Parts, Position } from '../../../services/layout/browser/layoutService.js';
import { ColumnBand } from '../../layoutColumn.js';
import { IInstantiationService, ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { DisposableStore, MutableDisposable } from '../../../../base/common/lifecycle.js';
import { ToggleSidebarPositionAction, ToggleSidebarVisibilityAction } from '../../actions/layoutActions.js';
import { IThemeService, IColorTheme, registerThemingParticipant } from '../../../../platform/theme/common/themeService.js';
import { ACTIVITY_BAR_BACKGROUND, ACTIVITY_BAR_BORDER, ACTIVITY_BAR_FOREGROUND, ACTIVITY_BAR_ACTIVE_BORDER, ACTIVITY_BAR_BADGE_BACKGROUND, ACTIVITY_BAR_BADGE_FOREGROUND, ACTIVITY_BAR_INACTIVE_FOREGROUND, ACTIVITY_BAR_ACTIVE_BACKGROUND, ACTIVITY_BAR_DRAG_AND_DROP_BORDER, ACTIVITY_BAR_ACTIVE_FOCUS_BORDER, MODERN_ACTIVITY_BAR_BACKGROUND, MODERN_ACTIVITY_BAR_INACTIVE_BACKGROUND } from '../../../common/theme.js';
import { activeContrastBorder, contrastBorder, focusBorder } from '../../../../platform/theme/common/colorRegistry.js';
import { addDisposableListener, append, EventType, isAncestor, $, clearNode, Dimension } from '../../../../base/browser/dom.js';
import { assertReturnsDefined } from '../../../../base/common/types.js';
import { CustomMenubarControl } from '../titlebar/menubarControl.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { getMenuBarVisibility, MenuSettings } from '../../../../platform/window/common/window.js';
import { IAction, Separator, SubmenuAction, toAction } from '../../../../base/common/actions.js';
import { StandardKeyboardEvent } from '../../../../base/browser/keyboardEvent.js';
import { KeyCode } from '../../../../base/common/keyCodes.js';
import { HoverPosition } from '../../../../base/browser/ui/hover/hoverWidget.js';
import { GestureEvent } from '../../../../base/browser/touch.js';
import { IPaneCompositePart } from '../paneCompositePart.js';
import { IPaneCompositeBarOptions, PaneCompositeBar } from '../paneCompositeBar.js';
import { GlobalCompositeBar } from '../globalCompositeBar.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { Action2, IMenuService, MenuId, MenuRegistry, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ContextKeyExpr, IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
import { getContextMenuActions } from '../../../../platform/actions/browser/menuEntryActionViewItem.js';
import { IViewDescriptorService, ViewContainerLocation, ViewContainerLocationToString } from '../../../common/views.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
import { IViewsService } from '../../../services/views/common/viewsService.js';
import { SwitchCompositeViewAction } from '../compositeBarActions.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { FONT, updateActivityBarSize } from '../../../../base/common/font.js';
import { getFontSize } from '../../../../platform/configuration/common/fontConfiguration.js';

export class ActivitybarPart extends Part {

	static readonly ACTION_HEIGHT = 48;
	static readonly COMPACT_ACTION_HEIGHT = 28;
	static readonly COMPACT_ACTION_HEIGHT_RATIO = 28 / 48;

	static readonly ACTIVITYBAR_WIDTH = 48;
	static readonly COMPACT_ACTIVITYBAR_WIDTH = 36;

	/** Narrower dimensions used when the floating panels (Modern UI) experiment is enabled. */
	static readonly FLOATING_ACTION_HEIGHT = 36;
	static readonly FLOATING_ACTIVITYBAR_WIDTH = 36;
	static readonly FLOATING_COMPACT_ACTIVITYBAR_WIDTH = 28;
	static readonly FLOATING_COMPACT_ACTIVITYBAR_WIDTH_RATIO = 28 / 36;

	/**
	 * Vertical gap between activity bar items at the default size under the floating
	 * panels experiment. Published to CSS as `--activity-bar-action-gap` so that the
	 * stylesheet and the overflow computation cannot drift apart.
	 */
	static readonly FLOATING_ACTION_GAP = 8;

	/**
	 * The compact Modern UI density tightens that gap to match its denser rhythm.
	 */
	static readonly FLOATING_COMPACT_ACTION_GAP = 4;

	static readonly ICON_SIZE = 24;
	static readonly COMPACT_ICON_SIZE = 16;

	/**
	 * The rail's own horizontal padding, doubled: the space inside the card beside the icon
	 * column. Independent of the cluster perimeter so the icons keep their inset whatever the
	 * gutter is. Must match `--modern-ui-activitybar-lane` in `floatingPanels.css`.
	 */
	static readonly FLOATING_LANE = 8;
	static readonly FLOATING_COMPACT_LANE = 4;

	static readonly pinnedViewContainersKey = 'workbench.activity.pinnedViewlets2';
	static readonly placeholderViewContainersKey = 'workbench.activity.placeholderViewlets';
	static readonly viewContainersWorkspaceStateKey = 'workbench.activity.viewletsWorkspaceState';

	//#region IView

	get minimumWidth(): number { return this.baseWidth + this.floatingHorizontalGutter; }
	get maximumWidth(): number { return this.baseWidth + this.floatingHorizontalGutter; }
	readonly minimumHeight: number = 0;
	readonly maximumHeight: number = Number.POSITIVE_INFINITY;

	//#endregion

	/** The intrinsic activity bar width (excludes any floating gutter). */
	private get baseWidth(): number {
		if (this.layoutService.isFloatingPanelsEnabled()) {
			if (this._isCompact) {
				return FONT.activityBarSize36 * ActivitybarPart.FLOATING_COMPACT_ACTIVITYBAR_WIDTH_RATIO;
			}
			return FONT.activityBarSize36;
		}
		return this._isCompact ? FONT.activityBarSize36 : FONT.activityBarSize48;
	}

	/** The action (item) height that drives visible item sizing. */
	private get actionHeight(): number {
		if (this._isCompact) {
			return FONT.activityBarSize48 * ActivitybarPart.COMPACT_ACTION_HEIGHT_RATIO;
		}
		if (this.layoutService.isFloatingPanelsEnabled()) {
			return FONT.activityBarSize36;
		}
		return FONT.activityBarSize48;
	}

	/**
	 * Vertical gap rendered between two adjacent items. Only the floating panels
	 * experiment separates items, and only at the default activity bar size; the compact
	 * Modern UI density tightens it to match its denser rhythm.
	 */
	private get actionGap(): number {
		if (!this.layoutService.isFloatingPanelsEnabled() || this._isCompact) {
			return 0;
		}

		return this.layoutService.isModernUICompact() ? FONT.activityBarSize4 : FONT.activityBarSize8;
	}

	/**
	 * The vertical space a single item occupies in the bar (its height plus the gap that
	 * separates it from the next one). This drives the overflow computation, so it has to
	 * track the current activity bar size, otherwise items collapse into the overflow menu
	 * prematurely.
	 */
	private get compositeSize(): number {
		return this.actionHeight + this.actionGap;
	}

	private get floatingHorizontalGutter(): number {
		if (!this.layoutService.isFloatingPanelsEnabled()) {
			return 0;
		}

		// The rail's own lane beside the icon column. The rail is a flush surface of the side bar
		// column (`layoutColumn.css`), so it reserves no card perimeter or gap around it.
		return this.layoutService.isModernUICompact() ? FONT.activityBarSize4 : FONT.activityBarSize8;
	}

	private readonly compositeBar = this._register(new MutableDisposable<PaneCompositeBar>());
	private content: HTMLElement | undefined;
	private columnBand: ColumnBand | undefined;
	private _isCompact: boolean;
	private activeWindowId: number | undefined;

	constructor(
		private readonly location: ViewContainerLocation,
		private readonly paneCompositePart: IPaneCompositePart,
		@IInstantiationService private readonly instantiationService: IInstantiationService,
		@IWorkbenchLayoutService layoutService: IWorkbenchLayoutService,
		@IThemeService themeService: IThemeService,
		@IStorageService storageService: IStorageService,
		@IConfigurationService private readonly configurationService: IConfigurationService,
		@IHostService private readonly hostService: IHostService,
	) {
		super(Parts.ACTIVITYBAR_PART, { hasTitle: false }, themeService, storageService, layoutService);

		this._isCompact = this.configurationService.getValue<boolean>(LayoutSettings.ACTIVITY_BAR_COMPACT) ?? false;

		this._register(this.configurationService.onDidChangeConfiguration(e => {
			if (e.affectsConfiguration(LayoutSettings.ACTIVITY_BAR_COMPACT)) {
				this._isCompact = this.configurationService.getValue<boolean>(LayoutSettings.ACTIVITY_BAR_COMPACT) ?? false;
				this.updateCompactStyle();
				this.recreateCompositeBar();
				this._onDidChange.fire(undefined); // Signal grid that size constraints changed
			}

			// Floating panels changes the reserved left/bottom gutter (and therefore
			// the fixed part width): signal the grid that the size constraint changed.
			if (e.affectsConfiguration(LayoutSettings.MODERN_UI) || e.affectsConfiguration(LayoutSettings.MODERN_UI_DENSITY)) {
				this.updateCompactStyle();
				this.recreateCompositeBar();
				this._onDidChange.fire(undefined);
				if (this.element) {
					this.updateStyles();
				}
			}
		}));

		const updateStyles = () => {
			if (this.element) {
				this.updateStyles();
			}
		};
		this._register(this.hostService.onDidChangeFocus(updateStyles));
		this._register(this.hostService.onDidChangeActiveWindow(windowId => {
			this.activeWindowId = windowId;
			updateStyles();
		}));

		this._register(configurationService.onDidChangeConfiguration(e => {
			if (e.affectsConfiguration('workbench.activityBar.experimental.fontFamily') || (e.affectsConfiguration('workbench.activityBar.experimental.fontSize') || e.affectsConfiguration('workbench.experimental.fontSize'))) {
				this.applyActivityBarFontFamily();
				this.applyActivityBarFontSize();
				this.recreateCompositeBar();
				this._onDidChange.fire(undefined); // Signal grid that size constraints changed
			}
		}));
	}

	private updateCompactStyle(): void {
		if (this.element) {
			this.element.classList.toggle('compact', this._isCompact);
			// Mirrored on the workbench root for floatingPanels.css
			this.layoutService.mainContainer.classList.toggle('activitybar-compact', this._isCompact);
			this.element.style.setProperty('--activity-bar-width', `${this.baseWidth}px`);
			this.element.style.setProperty('--activity-bar-action-height', `${this.actionHeight}px`);
			this.element.style.setProperty('--activity-bar-action-gap', `${this.actionGap}px`);
			this.element.style.setProperty('--modern-ui-activitybar-lane', `${this.layoutService.isModernUICompact() ? FONT.activityBarSize4 : FONT.activityBarSize8}px`);
			this.element.style.setProperty('--activity-bar-icon-size', `${this._isCompact ? FONT.activityBarSize16 : FONT.activityBarSize24}px`);
		}
	}

	private recreateCompositeBar(): void {
		if (!this.content || !this.compositeBar.value) {
			return;
		}

		this.compositeBar.clear();
		clearNode(this.content);
		this.compositeBar.value = this.createCompositeBar();
		this.compositeBar.value.create(this.content);

		if (this.dimension) {
			this.layout(this.dimension.width, this.dimension.height);
		}
	}

	private createCompositeBar(): PaneCompositeBar {
		const compositeSize = this.compositeSize;
		const iconSize = this._isCompact ? FONT.activityBarSize16 : FONT.activityBarSize24;

		return this.instantiationService.createInstance(ActivityBarCompositeBar, this.location, {
			partContainerClass: 'activitybar',
			pinnedViewContainersKey: ActivitybarPart.pinnedViewContainersKey,
			placeholderViewContainersKey: ActivitybarPart.placeholderViewContainersKey,
			viewContainersWorkspaceStateKey: ActivitybarPart.viewContainersWorkspaceStateKey,
			orientation: ActionsOrientation.VERTICAL,
			icon: true,
			iconSize,
			activityHoverOptions: {
				position: () => this.layoutService.getSideBarPosition() === Position.LEFT ? HoverPosition.RIGHT : HoverPosition.LEFT,
			},
			preventLoopNavigation: true,
			recomputeSizes: false,
			fillExtraContextMenuActions: (actions, e?: MouseEvent | GestureEvent) => { },
			compositeSize,
			colors: (theme: IColorTheme) => ({
				activeForegroundColor: theme.getColor(ACTIVITY_BAR_FOREGROUND),
				inactiveForegroundColor: theme.getColor(ACTIVITY_BAR_INACTIVE_FOREGROUND),
				activeBorderColor: theme.getColor(ACTIVITY_BAR_ACTIVE_BORDER),
				activeBackground: theme.getColor(ACTIVITY_BAR_ACTIVE_BACKGROUND),
				badgeBackground: theme.getColor(ACTIVITY_BAR_BADGE_BACKGROUND),
				badgeForeground: theme.getColor(ACTIVITY_BAR_BADGE_FOREGROUND),
				dragAndDropBorder: theme.getColor(ACTIVITY_BAR_DRAG_AND_DROP_BORDER),
				activeBackgroundColor: undefined, inactiveBackgroundColor: undefined, activeBorderBottomColor: undefined,
			}),
			overflowActionSize: compositeSize,
		}, Parts.ACTIVITYBAR_PART, this.paneCompositePart, { actionHeight: this.actionHeight, actionGap: this.actionGap });
	}

	protected override createContentArea(parent: HTMLElement): HTMLElement {
		this.element = parent;
		this.content = append(this.element, $('.content'));

		// Apply font settings before show() so composite bar uses correct sizes
		this.applyActivityBarFontFamily(parent);
		this.applyActivityBarFontSize(parent);

		this.updateCompactStyle();

		if (this.layoutService.isVisible(Parts.ACTIVITYBAR_PART)) {
			this.show();
		}

		return this.content;
	}

	private applyActivityBarFontFamily(container?: HTMLElement): void {
		const target = container ?? this.getContainer();
		if (!target) {
			return;
		}

		const family = this.configurationService.getValue<string>('workbench.activityBar.experimental.fontFamily');

		if (family) {
			target.style.setProperty('--vscode-workbench-activitybar-font-family', family);
		} else {
			target.style.removeProperty('--vscode-workbench-activitybar-font-family');
		}

		this._onDidChange.fire(undefined); // Signal grid that size constraints changed
	}

	private applyActivityBarFontSize(container?: HTMLElement): void {
		const target = container ?? this.getContainer();
		if (!target) {
			return;
		}

		const configuredSize = getFontSize(this.configurationService, 'workbench.activityBar.experimental.fontSize', 16);

		updateActivityBarSize(configuredSize);

		target.style.setProperty('--vscode-workbench-activitybar-font-size', `${FONT.activityBarSize}px`);
		this.updateCompactStyle();

		this._onDidChange.fire(undefined); // Signal grid that size constraints changed
	}

	getPinnedPaneCompositeIds(): string[] {
		return this.compositeBar.value?.getPinnedPaneCompositeIds() ?? [];
	}

	getVisiblePaneCompositeIds(): string[] {
		return this.compositeBar.value?.getVisiblePaneCompositeIds() ?? [];
	}

	getPaneCompositeIds(): string[] {
		return this.compositeBar.value?.getPaneCompositeIds() ?? [];
	}

	focus(): void {
		this.compositeBar.value?.focus();
	}

	override updateStyles(): void {
		super.updateStyles();

		const container = assertReturnsDefined(this.getContainer());
		let backgroundColor = ACTIVITY_BAR_BACKGROUND;
		if (this.configurationService.getValue<boolean>(LayoutSettings.MODERN_UI) === true) {
			const isWindowActive = this.activeWindowId === undefined ? mainWindow.document.hasFocus() : this.activeWindowId === mainWindow.vscodeWindowId;
			const isInactive = !this.hostService.hasFocus || !isWindowActive;
			backgroundColor = isInactive ? MODERN_ACTIVITY_BAR_INACTIVE_BACKGROUND : MODERN_ACTIVITY_BAR_BACKGROUND;
		}
		const background = this.getColor(backgroundColor) || '';
		container.style.backgroundColor = background;

		// The rail is a flush surface of the side bar column in every mode (`layoutColumn.css`): its
		// inner edge is the `bordered` stroke in the activity bar border color.
		const borderColor = this.getColor(ACTIVITY_BAR_BORDER) || this.getColor(contrastBorder) || '';
		container.classList.toggle('bordered', !!borderColor);
		container.style.borderColor = borderColor;
	}

	show(focus?: boolean): void {
		if (!this.content) {
			return;
		}

		if (!this.compositeBar.value) {
			this.compositeBar.value = this.createCompositeBar();
			this.compositeBar.value.create(this.content);

			if (this.dimension) {
				this.layout(this.dimension.width, this.dimension.height);
			}
		}

		if (focus) {
			this.focus();
		}
	}

	hide(): void {
		if (!this.compositeBar.value) {
			return;
		}

		this.compositeBar.clear();

		if (this.content) {
			clearNode(this.content);
		}
	}

	override layout(width: number, height: number): void {
		super.layout(width, height, 0, 0);

		if (!this.content) {
			return; // not created yet
		}

		// The column band: the rail's items start below the title row's height (`layoutColumn.ts`)
		const columnBandHeight = this.layoutService.getColumnBandHeight();
		this.columnBand ??= new ColumnBand(this.element);
		this.columnBand.layout(columnBandHeight);

		const contentWidth = Math.max(0, width - this.floatingHorizontalGutter);
		const contentHeight = Math.max(0, height - columnBandHeight);

		// Layout contents
		const contentAreaSize = super.layoutContents(contentWidth, contentHeight).contentSize;

		// The first item has no preceding gap, so give one gap back to the composite bar.
		this.compositeBar.value?.layout(contentWidth, contentAreaSize.height + this.actionGap);
	}

	toJSON(): object {
		return {
			type: Parts.ACTIVITYBAR_PART
		};
	}
}

export class ActivityBarCompositeBar extends PaneCompositeBar {

	private element: HTMLElement | undefined;

	private readonly menuBar = this._register(new MutableDisposable<CustomMenubarControl>());
	private menuBarContainer: HTMLElement | undefined;
	private compositeBarContainer: HTMLElement | undefined;
	private readonly globalCompositeBar: GlobalCompositeBar | undefined;
	private lastLayoutDimensions: Dimension | undefined;

	private readonly keyboardNavigationDisposables = this._register(new DisposableStore());

	constructor(
		location: ViewContainerLocation,
		options: IPaneCompositeBarOptions,
		part: Parts,
		paneCompositePart: IPaneCompositePart,
		private readonly globalActivities: { readonly actionHeight: number; readonly actionGap: number } | undefined,
		@IInstantiationService instantiationService: IInstantiationService,
		@IStorageService storageService: IStorageService,
		@IExtensionService extensionService: IExtensionService,
		@IViewDescriptorService viewDescriptorService: IViewDescriptorService,
		@IViewsService viewService: IViewsService,
		@IContextKeyService contextKeyService: IContextKeyService,
		@IWorkbenchEnvironmentService environmentService: IWorkbenchEnvironmentService,
		@IConfigurationService private readonly configurationService: IConfigurationService,
		@IMenuService private readonly menuService: IMenuService,
		@IWorkbenchLayoutService layoutService: IWorkbenchLayoutService,
	) {
		super(location,
			{
				...options,
				fillExtraContextMenuActions: (actions, e) => {
					options.fillExtraContextMenuActions(actions, e);
					this.fillContextMenuActions(actions, e);
				}
			}, part, paneCompositePart, instantiationService, storageService, extensionService, viewDescriptorService, viewService, contextKeyService, environmentService, layoutService);

		if (globalActivities) {
			this.globalCompositeBar = this._register(instantiationService.createInstance(GlobalCompositeBar, () => this.getContextMenuActions(), (theme: IColorTheme) => this.options.colors(theme), this.options.activityHoverOptions));
			this._register(this.globalCompositeBar.onDidChange(() => {
				if (this.lastLayoutDimensions) {
					this.layout(this.lastLayoutDimensions.width, this.lastLayoutDimensions.height);
				}
			}));
		}

		// Register for configuration changes
		this._register(this.configurationService.onDidChangeConfiguration(e => {
			if (e.affectsConfiguration(MenuSettings.MenuBarVisibility)) {
				if (getMenuBarVisibility(this.configurationService) === 'compact') {
					this.installMenubar();
				} else {
					this.uninstallMenubar();
				}
			}
		}));
	}

	private fillContextMenuActions(actions: IAction[], e?: MouseEvent | GestureEvent) {
		// Menu
		const menuBarVisibility = getMenuBarVisibility(this.configurationService);
		if (menuBarVisibility === 'compact' || menuBarVisibility === 'hidden' || menuBarVisibility === 'toggle') {
			actions.unshift(...[toAction({ id: 'toggleMenuVisibility', label: localize('menu', "Menu"), checked: menuBarVisibility === 'compact', run: () => this.configurationService.updateValue(MenuSettings.MenuBarVisibility, menuBarVisibility === 'compact' ? 'toggle' : 'compact') }), new Separator()]);
		}

		if (menuBarVisibility === 'compact' && this.menuBarContainer && e?.target) {
			if (isAncestor(e.target as Node, this.menuBarContainer)) {
				actions.unshift(...[toAction({ id: 'hideCompactMenu', label: localize('hideMenu', "Hide Menu"), run: () => this.configurationService.updateValue(MenuSettings.MenuBarVisibility, 'toggle') }), new Separator()]);
			}
		}

		// Global Composite Bar
		if (this.globalCompositeBar) {
			actions.push(new Separator());
			actions.push(...this.globalCompositeBar.getContextMenuActions());
		}
		actions.push(new Separator());
		actions.push(...this.getActivityBarContextMenuActions());
	}

	private uninstallMenubar() {
		if (this.menuBar.value) {
			this.menuBar.value = undefined;
		}

		if (this.menuBarContainer) {
			this.menuBarContainer.remove();
			this.menuBarContainer = undefined;
		}
	}

	private installMenubar() {
		if (this.menuBar.value) {
			return; // prevent menu bar from installing twice #110720
		}

		this.menuBarContainer = $('.menubar');

		const content = assertReturnsDefined(this.element);
		content.prepend(this.menuBarContainer);

		// Menubar: install a custom menu bar depending on configuration
		this.menuBar.value = this.instantiationService.createInstance(CustomMenubarControl);
		this.menuBar.value.create(this.menuBarContainer);

	}

	private registerKeyboardNavigationListeners(): void {
		this.keyboardNavigationDisposables.clear();

		// Up/Down or Left/Right arrow on compact menu
		if (this.menuBarContainer) {
			this.keyboardNavigationDisposables.add(addDisposableListener(this.menuBarContainer, EventType.KEY_DOWN, e => {
				const kbEvent = new StandardKeyboardEvent(e);
				if (kbEvent.equals(KeyCode.DownArrow) || kbEvent.equals(KeyCode.RightArrow)) {
					this.focus();
				}
			}));
		}

		// Up/Down on Activity Icons
		if (this.compositeBarContainer) {
			this.keyboardNavigationDisposables.add(addDisposableListener(this.compositeBarContainer, EventType.KEY_DOWN, e => {
				const kbEvent = new StandardKeyboardEvent(e);
				if (kbEvent.equals(KeyCode.DownArrow) || kbEvent.equals(KeyCode.RightArrow)) {
					this.globalCompositeBar?.focus();
				} else if (kbEvent.equals(KeyCode.UpArrow) || kbEvent.equals(KeyCode.LeftArrow)) {
					this.menuBar.value?.toggleFocus();
				}
			}));
		}

		// Up arrow on global icons
		if (this.globalCompositeBar) {
			this.keyboardNavigationDisposables.add(addDisposableListener(this.globalCompositeBar.element, EventType.KEY_DOWN, e => {
				const kbEvent = new StandardKeyboardEvent(e);
				if (kbEvent.equals(KeyCode.UpArrow) || kbEvent.equals(KeyCode.LeftArrow)) {
					this.focus(this.getVisiblePaneCompositeIds().length - 1);
				}
			}));
		}
	}

	override create(parent: HTMLElement): HTMLElement {
		this.element = parent;

		// Install menubar if compact
		if (getMenuBarVisibility(this.configurationService) === 'compact') {
			this.installMenubar();
		}

		// View Containers action bar
		this.compositeBarContainer = super.create(this.element);

		// Global action bar
		if (this.globalCompositeBar) {
			this.globalCompositeBar.create(this.element);
		}

		// Keyboard Navigation
		this.registerKeyboardNavigationListeners();

		return this.compositeBarContainer;
	}

	override layout(width: number, height: number): void {
		this.lastLayoutDimensions = new Dimension(width, height);

		if (this.menuBarContainer) {
			if (this.options.orientation === ActionsOrientation.VERTICAL) {
				height -= this.menuBarContainer.clientHeight;
			} else {
				width -= this.menuBarContainer.clientWidth;
			}
		}
		if (this.globalCompositeBar && this.globalActivities) {
			if (this.options.orientation === ActionsOrientation.VERTICAL) {
				height -= this.globalCompositeBar.getHeight(this.globalActivities.actionHeight, this.globalActivities.actionGap);
			} else {
				width -= this.globalCompositeBar.element.clientWidth;
			}
		}
		super.layout(width, height);
	}

	getActivityBarContextMenuActions(): IAction[] {
		const activityBarPositionMenu = this.menuService.getMenuActions(MenuId.ActivityBarPositionMenu, this.contextKeyService, { shouldForwardArgs: true, renderShortTitle: true });
		const positionActions = getContextMenuActions(activityBarPositionMenu).secondary;
		const actions: IAction[] = [
			new SubmenuAction('workbench.action.activityBar.position', localize('activity bar position', "Activity Bar Position"), positionActions),
		];

		// Show size submenu only when activity bar is in default position
		const activityBarPosition = this.configurationService.getValue<string>(LayoutSettings.ACTIVITY_BAR_LOCATION);
		if (activityBarPosition === ActivityBarPosition.DEFAULT) {
			const isCompact = this.configurationService.getValue<boolean>(LayoutSettings.ACTIVITY_BAR_COMPACT) ?? false;
			const sizeActions = [
				toAction({ id: 'workbench.action.activityBar.size.default', label: localize('activityBarSizeDefault', "Default"), checked: !isCompact, run: () => this.configurationService.updateValue(LayoutSettings.ACTIVITY_BAR_COMPACT, false) }),
				toAction({ id: 'workbench.action.activityBar.size.compact', label: localize('activityBarSizeCompact', "Compact"), checked: isCompact, run: () => this.configurationService.updateValue(LayoutSettings.ACTIVITY_BAR_COMPACT, true) }),
			];
			actions.push(new SubmenuAction('workbench.action.activityBar.size', localize('activity bar size', "Activity Bar Size"), sizeActions));
		}

		actions.push(toAction({ id: ToggleSidebarPositionAction.ID, label: ToggleSidebarPositionAction.getLabel(this.layoutService), run: () => this.instantiationService.invokeFunction(accessor => new ToggleSidebarPositionAction().run(accessor)) }));

		if (this.part === Parts.SIDEBAR_PART) {
			actions.push(toAction({ id: ToggleSidebarVisibilityAction.ID, label: ToggleSidebarVisibilityAction.LABEL, run: () => this.instantiationService.invokeFunction(accessor => new ToggleSidebarVisibilityAction().run(accessor)) }));
		}

		return actions;
	}

}

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'workbench.action.activityBarLocation.default',
			title: {
				...localize2('positionActivityBarDefault', 'Move Activity Bar to Side'),
				mnemonicTitle: localize({ key: 'miDefaultActivityBar', comment: ['&& denotes a mnemonic'] }, "&&Default"),
			},
			shortTitle: localize('default', "Default"),
			category: Categories.View,
			toggled: ContextKeyExpr.equals(`config.${LayoutSettings.ACTIVITY_BAR_LOCATION}`, ActivityBarPosition.DEFAULT),
			menu: [{
				id: MenuId.ActivityBarPositionMenu,
				order: 1
			}, {
				id: MenuId.CommandPalette,
				when: ContextKeyExpr.and(ContextKeyExpr.notEquals(`config.${LayoutSettings.ACTIVITY_BAR_LOCATION}`, ActivityBarPosition.DEFAULT)),
			}]
		});
	}
	run(accessor: ServicesAccessor): void {
		const configurationService = accessor.get(IConfigurationService);
		configurationService.updateValue(LayoutSettings.ACTIVITY_BAR_LOCATION, ActivityBarPosition.DEFAULT);
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'workbench.action.activityBarLocation.top',
			title: {
				...localize2('positionActivityBarTop', 'Move Activity Bar to Top'),
				mnemonicTitle: localize({ key: 'miTopActivityBar', comment: ['&& denotes a mnemonic'] }, "&&Top"),
			},
			shortTitle: localize('top', "Top"),
			category: Categories.View,
			toggled: ContextKeyExpr.equals(`config.${LayoutSettings.ACTIVITY_BAR_LOCATION}`, ActivityBarPosition.TOP),
			menu: [{
				id: MenuId.ActivityBarPositionMenu,
				order: 2
			}, {
				id: MenuId.CommandPalette,
				when: ContextKeyExpr.and(ContextKeyExpr.notEquals(`config.${LayoutSettings.ACTIVITY_BAR_LOCATION}`, ActivityBarPosition.TOP)),
			}]
		});
	}
	run(accessor: ServicesAccessor): void {
		const configurationService = accessor.get(IConfigurationService);
		configurationService.updateValue(LayoutSettings.ACTIVITY_BAR_LOCATION, ActivityBarPosition.TOP);
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'workbench.action.activityBarLocation.bottom',
			title: {
				...localize2('positionActivityBarBottom', 'Move Activity Bar to Bottom'),
				mnemonicTitle: localize({ key: 'miBottomActivityBar', comment: ['&& denotes a mnemonic'] }, "&&Bottom"),
			},
			shortTitle: localize('bottom', "Bottom"),
			category: Categories.View,
			toggled: ContextKeyExpr.equals(`config.${LayoutSettings.ACTIVITY_BAR_LOCATION}`, ActivityBarPosition.BOTTOM),
			menu: [{
				id: MenuId.ActivityBarPositionMenu,
				order: 3
			}, {
				id: MenuId.CommandPalette,
				when: ContextKeyExpr.and(ContextKeyExpr.notEquals(`config.${LayoutSettings.ACTIVITY_BAR_LOCATION}`, ActivityBarPosition.BOTTOM)),
			}]
		});
	}
	run(accessor: ServicesAccessor): void {
		const configurationService = accessor.get(IConfigurationService);
		configurationService.updateValue(LayoutSettings.ACTIVITY_BAR_LOCATION, ActivityBarPosition.BOTTOM);
	}
});

registerAction2(class extends Action2 {
	constructor() {
		super({
			id: 'workbench.action.activityBarLocation.hide',
			title: {
				...localize2('hideActivityBar', 'Hide Activity Bar'),
				mnemonicTitle: localize({ key: 'miHideActivityBar', comment: ['&& denotes a mnemonic'] }, "&&Hidden"),
			},
			shortTitle: localize('hide', "Hidden"),
			category: Categories.View,
			toggled: ContextKeyExpr.equals(`config.${LayoutSettings.ACTIVITY_BAR_LOCATION}`, ActivityBarPosition.HIDDEN),
			menu: [{
				id: MenuId.ActivityBarPositionMenu,
				order: 4
			}, {
				id: MenuId.CommandPalette,
				when: ContextKeyExpr.and(ContextKeyExpr.notEquals(`config.${LayoutSettings.ACTIVITY_BAR_LOCATION}`, ActivityBarPosition.HIDDEN)),
			}]
		});
	}
	run(accessor: ServicesAccessor): void {
		const configurationService = accessor.get(IConfigurationService);
		configurationService.updateValue(LayoutSettings.ACTIVITY_BAR_LOCATION, ActivityBarPosition.HIDDEN);
	}
});

MenuRegistry.appendMenuItem(MenuId.MenubarAppearanceMenu, {
	submenu: MenuId.ActivityBarPositionMenu,
	title: localize('positionActivituBar', "Activity Bar Position"),
	group: '3_workbench_layout_move',
	order: 2,
});

MenuRegistry.appendMenuItem(MenuId.ViewContainerTitleContext, {
	submenu: MenuId.ActivityBarPositionMenu,
	title: localize('positionActivituBar', "Activity Bar Position"),
	when: ContextKeyExpr.or(
		ContextKeyExpr.equals('viewContainerLocation', ViewContainerLocationToString(ViewContainerLocation.Sidebar)),
		ContextKeyExpr.equals('viewContainerLocation', ViewContainerLocationToString(ViewContainerLocation.AuxiliaryBar))
	),
	group: '3_workbench_layout_move',
	order: 1
});

registerAction2(class extends SwitchCompositeViewAction {
	constructor() {
		super({
			id: 'workbench.action.previousSideBarView',
			title: localize2('previousSideBarView', 'Previous Primary Side Bar View'),
			category: Categories.View,
			f1: true
		}, ViewContainerLocation.Sidebar, -1);
	}
});

registerAction2(class extends SwitchCompositeViewAction {
	constructor() {
		super({
			id: 'workbench.action.nextSideBarView',
			title: localize2('nextSideBarView', 'Next Primary Side Bar View'),
			category: Categories.View,
			f1: true
		}, ViewContainerLocation.Sidebar, 1);
	}
});

registerAction2(
	class FocusActivityBarAction extends Action2 {
		constructor() {
			super({
				id: 'workbench.action.focusActivityBar',
				title: localize2('focusActivityBar', 'Focus Activity Bar'),
				category: Categories.View,
				f1: true
			});
		}

		async run(accessor: ServicesAccessor): Promise<void> {
			const layoutService = accessor.get(IWorkbenchLayoutService);
			layoutService.focusPart(Parts.ACTIVITYBAR_PART);
		}
	});

registerThemingParticipant((theme, collector) => {

	const activityBarActiveBorderColor = theme.getColor(ACTIVITY_BAR_ACTIVE_BORDER);
	if (activityBarActiveBorderColor) {
		collector.addRule(`
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.checked .active-item-indicator:before {
				border-left-color: ${activityBarActiveBorderColor};
			}
		`);
	}

	const activityBarActiveFocusBorderColor = theme.getColor(ACTIVITY_BAR_ACTIVE_FOCUS_BORDER);
	if (activityBarActiveFocusBorderColor) {
		collector.addRule(`
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.checked:focus::before {
				visibility: hidden;
			}

			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.checked:focus .active-item-indicator:before {
				visibility: visible;
				border-left-color: ${activityBarActiveFocusBorderColor};
			}
		`);
	}

	const activityBarActiveBackgroundColor = theme.getColor(ACTIVITY_BAR_ACTIVE_BACKGROUND);
	if (activityBarActiveBackgroundColor) {
		collector.addRule(`
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.checked .active-item-indicator {
				z-index: 0;
				background-color: ${activityBarActiveBackgroundColor};
			}
		`);
	}

	// Styling with Outline color (e.g. high contrast theme)
	const outline = theme.getColor(activeContrastBorder);
	if (outline) {
		collector.addRule(`
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item .action-label::before{
				padding: 6px;
			}

			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.active .action-label::before,
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.active:hover .action-label::before,
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.checked .action-label::before,
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.checked:hover .action-label::before {
				outline: 1px solid ${outline};
			}

			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item:hover .action-label::before {
				outline: 1px dashed ${outline};
			}

			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item:focus .active-item-indicator:before {
				border-left-color: ${outline};
			}
		`);
	}

	// Styling without outline color
	else {
		const focusBorderColor = theme.getColor(focusBorder);
		if (focusBorderColor) {
			collector.addRule(`
				.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item:focus .active-item-indicator::before {
						border-left-color: ${focusBorderColor};
					}
				`);
		}
	}
});
