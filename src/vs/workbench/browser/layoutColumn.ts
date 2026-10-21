/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import './media/layoutColumn.css';
import { equals, tail } from '../../base/common/arrays.js';
import { Direction, GridNode, ISerializableView, ISerializedGrid, ISerializedLeafNode, ISerializedNode, isGridBranchNode, Orientation, SerializableGrid, Sizing } from '../../base/browser/ui/grid/grid.js';
import { isHorizontal, PanelAlignment, Parts, Position, TITLE_BAND_HEIGHT, WorkbenchGridShape } from '../services/layout/browser/layoutService.js';

/**
 * The grid shape of a workbench window. On the macOS desktop with the custom title bar the
 * window buttons sit over the side bar column, which spans the window height and reserves a band
 * as tall as the title row; everywhere else (the native title bar, Windows, Linux, the web) a
 * full-width title bar sits above the column and the main area.
 */
export function getWorkbenchGridShape(isMacintosh: boolean, isNative: boolean, nativeTitleBar: boolean): WorkbenchGridShape {
	return isMacintosh && isNative && !nativeTitleBar ? WorkbenchGridShape.ColumnWithBand : WorkbenchGridShape.ColumnBelowTitle;
}

/**
 * Whether a horizontal panel reaches under the secondary side bar, which sits on the side
 * opposite the column: with the `justify` alignment, or the alignment on that bar's side. The
 * primary side bar is the outer column and never shares a row with the panel, so for it every
 * alignment behaves like `center`.
 */
export function doesPanelReachUnderAuxiliaryBar(panelAlignment: PanelAlignment, sideBarPosition: Position): boolean {
	return !(panelAlignment === 'center' || (sideBarPosition === Position.RIGHT && panelAlignment === 'right') || (sideBarPosition === Position.LEFT && panelAlignment === 'left'));
}

/**
 * Where Modern UI anchors the notification toasts and center (`notificationsDialogs.css`, which
 * reads the two values as `--modern-ui-notifications-block-start-inset` and
 * `--modern-ui-notifications-block-end-inset`): 1px below the title row and the 8px gutter above
 * the status line, the gutter alone where a band is hidden. The heights are the bands as laid
 * out, which change with the density, the zoom and the status bar's font size, and the same ones
 * the notifications' height budgets reserve, so a notification never crosses a band.
 */
export function getNotificationsBandInsets(titleRowHeight: number, statusLineHeight: number): { readonly blockStart: number; readonly blockEnd: number } {
	const gutter = 8;
	return {
		blockStart: titleRowHeight > 0 ? titleRowHeight + 1 : gutter,
		blockEnd: statusLineHeight + gutter
	};
}

/**
 * Whether the panel can be maximized, which hides the editor: always at the sides, and only
 * when centered at the top or the bottom, as upstream's maximize action already requires. A
 * horizontal panel that reaches under the secondary side bar sits outside the middle row, so a
 * hidden editor beside a hidden secondary side bar would leave that row with no visible part:
 * the grid then hides the row, and a panel moved back into it later gets no size.
 */
export function isPanelMaximizable(panelPosition: Position, panelAlignment: PanelAlignment): boolean {
	return !isHorizontal(panelPosition) || panelAlignment === 'center';
}

/**
 * The height the column parts reserve at their top: the title row's height in the
 * {@link WorkbenchGridShape.ColumnWithBand} shape while the title row is visible, otherwise zero.
 */
export function getColumnBandHeight(shape: WorkbenchGridShape, titleBarVisible: boolean, titleBarHeight: number): number {
	return shape === WorkbenchGridShape.ColumnWithBand && titleBarVisible ? titleBarHeight : 0;
}

/**
 * The main window's title row height when the title band sets it: {@link TITLE_BAND_HEIGHT} in the
 * {@link WorkbenchGridShape.ColumnWithBand} shape at the default Modern UI density, otherwise
 * `undefined` (the compact density and Modern UI off keep upstream's heights).
 */
export function getTitleBandHeight(shape: WorkbenchGridShape, modernUI: boolean, compact: boolean): number | undefined {
	return shape === WorkbenchGridShape.ColumnWithBand && modernUI && !compact ? TITLE_BAND_HEIGHT : undefined;
}

/**
 * How far right of the window buttons' left edge the title row's content starts in the v10
 * mockup (buttons drawn at 18px, content at 86px).
 */
export const TITLE_ROW_WINDOW_CONTROLS_CLEARANCE = 68;

/**
 * The leading inset of the title row's content, in CSS pixels from the title row's leading edge,
 * so it clears the window buttons: {@link TITLE_ROW_WINDOW_CONTROLS_CLEARANCE} right of the
 * buttons' left edge, minus the width of a column on the left, which already covers part of
 * them. `windowControlsLeft` is `undefined` while the buttons are not over the title row (full
 * screen, the second shape, buttons on the right).
 */
export function getTitleRowLeadingInset(windowControlsLeft: number | undefined, leftColumnWidth: number): number {
	if (windowControlsLeft === undefined) {
		return 0;
	}

	return Math.max(0, Math.round(windowControlsLeft + TITLE_ROW_WINDOW_CONTROLS_CLEARANCE - leftColumnWidth));
}

/**
 * The offsets of a window's container below its title row: the banner counts only in the main
 * window, which owns it, and the title row is the window's own, zero while that window hides it.
 * With the command center showing, the quick input opens over the title row and the banner.
 */
export function getContainerOffset(isMainWindow: boolean, bannerHeight: number, titleBarHeight: number, commandCenter: boolean): { top: number; quickPickTop: number } {
	let top = 0;
	let quickPickTop = 0;

	if (isMainWindow && bannerHeight > 0) {
		top = bannerHeight;
		quickPickTop = top;
	}

	if (titleBarHeight > 0) {
		top += titleBarHeight;
		quickPickTop = commandCenter ? 6 : top;
	}

	return { top, quickPickTop };
}

/**
 * The height of a bar (title row or status line) in an auxiliary window, which shows and hides
 * its own bars and keeps upstream's heights: the part's rendered height, zero while it is hidden.
 */
export function getAuxiliaryWindowBarHeight(part: HTMLElement | undefined): number {
	return part?.offsetHeight ?? 0;
}

/**
 * Where the movable parts of the grid go. Shared by {@link createWorkbenchGridDescriptor} and
 * {@link arrangeWorkbenchGridParts}.
 */
export interface IWorkbenchGridArrangement {
	readonly sideBarPosition: Position;
	readonly panelPosition: Position;
	readonly panelAlignment: PanelAlignment;
}

/**
 * The sizes a grid descriptor starts from. A hidden part keeps the size it returns to.
 */
export interface IWorkbenchGridSizes {
	/** The title bar's height. */
	readonly titleBar: number;
	/** The banner's height. */
	readonly banner: number;
	/** The status bar's height. */
	readonly statusBar: number;
	/** The activity bar's width. */
	readonly activityBar: number;
	/** The primary side bar's width. */
	readonly sideBar: number;
	/** The secondary side bar's width. */
	readonly auxiliaryBar: number;
	/** The panel's height when it is horizontal, its width otherwise. */
	readonly panel: number;
}

/**
 * Which parts a grid descriptor starts visible. The banner always starts hidden; the banner
 * service shows it.
 */
export interface IWorkbenchGridVisibility {
	readonly titleBar: boolean;
	readonly activityBar: boolean;
	readonly sideBar: boolean;
	readonly editor: boolean;
	readonly panel: boolean;
	readonly auxiliaryBar: boolean;
	readonly statusBar: boolean;
}

/**
 * The input of {@link createWorkbenchGridDescriptor}.
 */
export interface IWorkbenchGridState extends IWorkbenchGridArrangement {
	readonly shape: WorkbenchGridShape;
	readonly width: number;
	readonly height: number;
	/** The web puts the banner above the title bar when it has no window controls overlay. */
	readonly bannerFirst: boolean;
	readonly sizes: IWorkbenchGridSizes;
	readonly visibility: IWorkbenchGridVisibility;
}

function leaf(type: Parts, size: number, visible: boolean): ISerializedLeafNode {
	return { type: 'leaf', data: { type }, size, visible };
}

function branch(data: ISerializedNode[], size: number): ISerializedNode {
	return { type: 'branch', data, size, visible: data.some(node => node.visible !== false) };
}

/**
 * Builds the workbench grid of the main window.
 *
 * - {@link WorkbenchGridShape.ColumnWithBand}: a horizontal root `[activity bar, side bar, main]`,
 *   main being vertical, `[title bar, banner, middle row, status bar]`.
 * - {@link WorkbenchGridShape.ColumnBelowTitle}: a vertical root `[title bar, body]`, body being
 *   horizontal, `[activity bar, side bar, main]`, and main vertical, `[banner, middle row, status bar]`.
 *
 * A side bar on the right mirrors the column (`[main, side bar, activity bar]`). The middle row
 * holds the editor and the secondary side bar, on the side opposite the column, as direct
 * children in every state: the grid flattens a branch left with one child, which would move
 * every location below it. A vertical panel sits beside the editor in the middle row; a
 * horizontal panel shares a column with the editor inside the row, or sits in main above or
 * below the row when it reaches under the secondary side bar
 * ({@link doesPanelReachUnderAuxiliaryBar}).
 */
export function createWorkbenchGridDescriptor(state: IWorkbenchGridState): ISerializedGrid {
	const { shape, width, height, sizes, visibility } = state;
	const sideBarLeft = state.sideBarPosition !== Position.RIGHT;
	const visibleSize = (size: number, visible: boolean) => visible ? size : 0;

	const titleBar = leaf(Parts.TITLEBAR_PART, sizes.titleBar, visibility.titleBar);
	const banner = leaf(Parts.BANNER_PART, sizes.banner, false);
	const statusBar = leaf(Parts.STATUSBAR_PART, sizes.statusBar, visibility.statusBar);
	const activityBar = leaf(Parts.ACTIVITYBAR_PART, sizes.activityBar, visibility.activityBar);
	const sideBar = leaf(Parts.SIDEBAR_PART, sizes.sideBar, visibility.sideBar);
	const auxiliaryBar = leaf(Parts.AUXILIARYBAR_PART, sizes.auxiliaryBar, visibility.auxiliaryBar);
	const panel = leaf(Parts.PANEL_PART, sizes.panel, visibility.panel);
	const editor = leaf(Parts.EDITOR_PART, 0, visibility.editor);

	const titleBarHeight = visibleSize(sizes.titleBar, visibility.titleBar);
	const statusBarHeight = visibleSize(sizes.statusBar, visibility.statusBar);
	const columnWidth = visibleSize(sizes.activityBar, visibility.activityBar) + visibleSize(sizes.sideBar, visibility.sideBar);
	const mainWidth = Math.max(0, width - columnWidth);
	const bodyHeight = shape === WorkbenchGridShape.ColumnWithBand ? height : Math.max(0, height - titleBarHeight);
	const mainContentHeight = Math.max(0, bodyHeight - (shape === WorkbenchGridShape.ColumnWithBand ? titleBarHeight : 0) - statusBarHeight);

	// Middle row: the editor (with the panel when it does not reach under the secondary side bar)
	// and the secondary side bar on the side opposite the column
	const panelHorizontal = isHorizontal(state.panelPosition);
	const panelInMain = panelHorizontal && doesPanelReachUnderAuxiliaryBar(state.panelAlignment, state.sideBarPosition);
	const panelHeight = panelHorizontal ? visibleSize(sizes.panel, visibility.panel) : 0;
	const middleRowHeight = Math.max(0, mainContentHeight - (panelInMain ? panelHeight : 0));
	const auxiliaryBarWidth = visibleSize(sizes.auxiliaryBar, visibility.auxiliaryBar);

	let editorArea: ISerializedNode[];
	if (!panelHorizontal) {
		editor.size = Math.max(0, mainWidth - auxiliaryBarWidth - visibleSize(sizes.panel, visibility.panel));
		editorArea = state.panelPosition === Position.LEFT ? [panel, editor] : [editor, panel];
	} else if (panelInMain) {
		editor.size = Math.max(0, mainWidth - auxiliaryBarWidth);
		editorArea = [editor];
	} else {
		editor.size = Math.max(0, middleRowHeight - panelHeight);
		editorArea = [branch(state.panelPosition === Position.BOTTOM ? [editor, panel] : [panel, editor], Math.max(0, mainWidth - auxiliaryBarWidth))];
	}
	const middleRow = branch(sideBarLeft ? [...editorArea, auxiliaryBar] : [auxiliaryBar, ...editorArea], middleRowHeight);

	// Main area: the title bar and the banner (first shape) or the banner alone (second shape),
	// a panel that reaches under the secondary side bar, the middle row and the status bar
	const main: ISerializedNode[] = [];
	if (shape === WorkbenchGridShape.ColumnWithBand) {
		main.push(...(state.bannerFirst ? [banner, titleBar] : [titleBar, banner]));
	} else if (!state.bannerFirst) {
		main.push(banner);
	}
	if (panelInMain && state.panelPosition === Position.TOP) {
		main.push(panel);
	}
	main.push(middleRow);
	if (panelInMain && state.panelPosition === Position.BOTTOM) {
		main.push(panel);
	}
	main.push(statusBar);

	const mainArea = branch(main, mainWidth);
	const column = sideBarLeft ? [activityBar, sideBar, mainArea] : [mainArea, sideBar, activityBar];

	if (shape === WorkbenchGridShape.ColumnWithBand) {
		return { root: branch(column, height), orientation: Orientation.HORIZONTAL, width, height };
	}

	const body = branch(column, bodyHeight);
	return { root: branch(state.bannerFirst ? [banner, titleBar, body] : [titleBar, body], width), orientation: Orientation.VERTICAL, width, height };
}

/**
 * The views of the workbench parts in the grid.
 */
export interface IWorkbenchGridViews<T extends ISerializableView> {
	readonly activityBar: T;
	readonly sideBar: T;
	readonly editor: T;
	readonly panel: T;
	readonly auxiliaryBar: T;
}

/**
 * Moves the column parts, the secondary side bar and the panel of a grid built by
 * {@link createWorkbenchGridDescriptor} to where `arrangement` puts them, keeping the invariants
 * the descriptor starts from: the column parts stay in the branch beside the main area, the
 * secondary side bar stays a direct child of the middle row, and a horizontal panel either
 * shares a column with the editor or sits in main next to the middle row.
 *
 * `panelSizing` is the panel's size when it moves beside the editor (`width`) or into a column
 * with it (`height`), or {@link Sizing.Invisible} while it is hidden.
 *
 * Returns whether the panel was arranged too: it is left where it is while it and the editor are
 * both hidden, and the caller arranges the grid again once either shows.
 */
export function arrangeWorkbenchGridParts<T extends ISerializableView>(grid: SerializableGrid<T>, views: IWorkbenchGridViews<T>, arrangement: IWorkbenchGridArrangement, panelSizing: { readonly width: number | Sizing; readonly height: number | Sizing }): boolean {
	const sideBarLeft = arrangement.sideBarPosition !== Position.RIGHT;

	// The column: the activity bar outermost, then the side bar, beside the main area
	const column = getParentLocation(grid, views.sideBar);
	const columnLength = getChildCount(grid, column);
	moveWithinBranch(grid, views.activityBar, column, sideBarLeft ? 0 : columnLength - 1);
	moveWithinBranch(grid, views.sideBar, column, sideBarLeft ? 1 : columnLength - 2);

	// The secondary side bar: at the middle row's end opposite the column
	const middleRow = getParentLocation(grid, views.auxiliaryBar);
	moveWithinBranch(grid, views.auxiliaryBar, middleRow, sideBarLeft ? getChildCount(grid, middleRow) - 1 : 0);

	// The panel waits while it and the editor are both hidden (a maximized secondary side bar):
	// moved next to the hidden editor, it would wrap both in a new branch that the grid shows
	// without a visible part and sizes to nothing, collapsing the middle row
	if (!grid.isViewVisible(views.editor) && !grid.isViewVisible(views.panel)) {
		return false;
	}

	// The panel
	if (!isHorizontal(arrangement.panelPosition)) {
		grid.moveView(views.panel, panelSizing.width, views.editor, arrangement.panelPosition === Position.LEFT ? Direction.Left : Direction.Right);
	} else if (doesPanelReachUnderAuxiliaryBar(arrangement.panelAlignment, arrangement.sideBarPosition)) {
		const [main, middleRowIndex] = tail(middleRow);
		const [panelParent, panelIndex] = tail(getLocation(grid, views.panel));
		const below = arrangement.panelPosition === Position.BOTTOM;
		if (equals(panelParent, main)) {
			const middleRowIndexWithoutPanel = panelIndex < middleRowIndex ? middleRowIndex - 1 : middleRowIndex;
			moveWithinBranch(grid, views.panel, main, below ? middleRowIndexWithoutPanel + 1 : middleRowIndexWithoutPanel);
		} else {
			// Leaving the editor's column collapses it into the editor; main keeps its indices
			grid.moveViewTo(views.panel, [...main, below ? middleRowIndex + 1 : middleRowIndex]);
		}
	} else {
		grid.moveView(views.panel, panelSizing.height, views.editor, arrangement.panelPosition === Position.BOTTOM ? Direction.Down : Direction.Up);
	}

	return true;
}

/**
 * The location of a view in the grid, as the grid's own (private) locations count it: the
 * indices of the branches from the root down to the view.
 */
export function getLocation<T extends ISerializableView>(grid: SerializableGrid<T>, view: T): number[] {
	const location = findLocation(grid.getViews(), view);
	if (!location) {
		throw new Error('View not found in the workbench grid');
	}

	return location;
}

function findLocation<T extends ISerializableView>(node: GridNode<T>, view: T): number[] | undefined {
	if (!isGridBranchNode(node)) {
		return node.view === view ? [] : undefined;
	}

	for (let index = 0; index < node.children.length; index++) {
		const location = findLocation(node.children[index], view);
		if (location) {
			return [index, ...location];
		}
	}

	return undefined;
}

function getParentLocation<T extends ISerializableView>(grid: SerializableGrid<T>, view: T): number[] {
	return tail(getLocation(grid, view))[0];
}

function getChildCount<T extends ISerializableView>(grid: SerializableGrid<T>, location: number[]): number {
	let node: GridNode<T> = grid.getViews();
	for (const index of location) {
		if (!isGridBranchNode(node)) {
			throw new Error('Invalid branch location');
		}
		node = node.children[index];
	}

	if (!isGridBranchNode(node)) {
		throw new Error('Invalid branch location');
	}

	return node.children.length;
}

function moveWithinBranch<T extends ISerializableView>(grid: SerializableGrid<T>, view: T, parent: number[], index: number): void {
	const [currentParent, currentIndex] = tail(getLocation(grid, view));
	if (!equals(currentParent, parent)) {
		throw new Error('The view is not a child of the branch');
	}

	if (currentIndex !== index) {
		// Within a branch the grid inserts before the given index of the current order
		grid.moveViewTo(view, [...parent, index > currentIndex ? index + 1 : index]);
	}
}

/**
 * The band a column part reserves at its top: the part pads its content down by the band's
 * height, so its own surface (glass or opaque) paints behind the band, and a window drag region
 * covers the band, so it moves the window like the title row beside it.
 */
export class ColumnBand {

	private element: HTMLElement | undefined;

	constructor(private readonly part: HTMLElement) { }

	/**
	 * Applies the band's height (zero removes the band).
	 */
	layout(height: number): void {
		this.part.style.paddingTop = height > 0 ? `${height}px` : '';

		if (height > 0 && !this.element) {
			this.element = this.part.ownerDocument.createElement('div');
			this.element.className = 'column-band';
			this.part.appendChild(this.element);
		}

		if (this.element) {
			this.element.style.height = `${height}px`;
			this.element.style.display = height > 0 ? '' : 'none';
		}
	}
}
