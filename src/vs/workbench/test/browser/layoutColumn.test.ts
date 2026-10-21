/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { Direction, GridNode, ISerializableView, ISerializedGrid, ISerializedNode, isGridBranchNode, Orientation, SerializableGrid, Sizing } from '../../../base/browser/ui/grid/grid.js';
import { Event } from '../../../base/common/event.js';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../base/test/common/utils.js';
import { arrangeWorkbenchGridParts, ColumnBand, createWorkbenchGridDescriptor, doesPanelReachUnderAuxiliaryBar, getAuxiliaryWindowBarHeight, getColumnBandHeight, getContainerOffset, getNotificationsBandInsets, getTitleBandHeight, getTitleRowLeadingInset, getWorkbenchGridShape, isPanelMaximizable, IWorkbenchGridState, IWorkbenchGridViews, TITLE_ROW_WINDOW_CONTROLS_CLEARANCE } from '../../browser/layoutColumn.js';
import { isHorizontal, PanelAlignment, Parts, Position, WorkbenchGridShape } from '../../services/layout/browser/layoutService.js';
import { mainWindow } from '../../../base/browser/window.js';

const WIDTH = 1200;
const HEIGHT = 800;
const TITLE_BAR = 44;
const STATUS_BAR = 34;
const ACTIVITY_BAR = 48;

class StubPart implements ISerializableView {
	readonly element = mainWindow.document.createElement('div');
	readonly onDidChange = Event.None;

	constructor(
		readonly type: Parts,
		readonly minimumWidth: number,
		readonly maximumWidth: number,
		readonly minimumHeight: number,
		readonly maximumHeight: number
	) { }

	layout(): void { }

	toJSON(): object {
		return { type: this.type };
	}
}

type Views = IWorkbenchGridViews<StubPart> & { readonly titleBar: StubPart; readonly banner: StubPart; readonly statusBar: StubPart };

function createViews(): Views {
	const unbounded = Number.POSITIVE_INFINITY;
	return {
		titleBar: new StubPart(Parts.TITLEBAR_PART, 0, unbounded, TITLE_BAR, TITLE_BAR),
		banner: new StubPart(Parts.BANNER_PART, 0, unbounded, 26, 26),
		statusBar: new StubPart(Parts.STATUSBAR_PART, 0, unbounded, STATUS_BAR, STATUS_BAR),
		activityBar: new StubPart(Parts.ACTIVITYBAR_PART, ACTIVITY_BAR, ACTIVITY_BAR, 0, unbounded),
		sideBar: new StubPart(Parts.SIDEBAR_PART, 170, unbounded, 0, unbounded),
		editor: new StubPart(Parts.EDITOR_PART, 220, unbounded, 70, unbounded),
		panel: new StubPart(Parts.PANEL_PART, 300, unbounded, 77, unbounded),
		auxiliaryBar: new StubPart(Parts.AUXILIARYBAR_PART, 170, unbounded, 0, unbounded),
	};
}

function createState(overrides: Partial<IWorkbenchGridState> = {}): IWorkbenchGridState {
	return {
		shape: WorkbenchGridShape.ColumnWithBand,
		width: WIDTH,
		height: HEIGHT,
		sideBarPosition: Position.LEFT,
		panelPosition: Position.BOTTOM,
		panelAlignment: 'center',
		bannerFirst: false,
		sizes: { titleBar: TITLE_BAR, banner: 26, statusBar: STATUS_BAR, activityBar: ACTIVITY_BAR, sideBar: 256, auxiliaryBar: 300, panel: 200 },
		visibility: { titleBar: true, activityBar: false, sideBar: true, editor: true, panel: true, auxiliaryBar: true, statusBar: true },
		...overrides
	};
}

function createGrid(views: Views, state: IWorkbenchGridState): SerializableGrid<StubPart> {
	const byType = new Map<string, StubPart>(Object.values(views).map(view => [view.type, view]));
	const grid = SerializableGrid.deserialize<StubPart>(createWorkbenchGridDescriptor(state), { fromJSON: ({ type }: { type: Parts }) => byType.get(type)! }, { proportionalLayout: false });
	grid.layout(WIDTH, HEIGHT);
	return grid;
}

/** The descriptor's structure in a short notation: `H[...]` and `V[...]` branches of part names. */
function describe(node: ISerializedNode, orientation: Orientation): string {
	if (node.type === 'leaf') {
		const name = String((node.data as { type: Parts }).type).replace('workbench.parts.', '');
		return node.visible === false ? `(${name})` : name;
	}

	const children = node.data.map(child => describe(child, orientation === Orientation.HORIZONTAL ? Orientation.VERTICAL : Orientation.HORIZONTAL));
	return `${orientation === Orientation.HORIZONTAL ? 'H' : 'V'}[${children.join(', ')}]`;
}

function describeGrid(descriptor: ISerializedGrid): string {
	return describe(descriptor.root, descriptor.orientation);
}

interface IBox { readonly left: number; readonly top: number; readonly right: number; readonly bottom: number }

function boxes(grid: SerializableGrid<StubPart>): Map<StubPart, IBox> {
	const result = new Map<StubPart, IBox>();
	const visit = (node: GridNode<StubPart>) => {
		if (isGridBranchNode(node)) {
			node.children.forEach(visit);
		} else if (node.box.width > 0 && node.box.height > 0) {
			result.set(node.view, { left: node.box.left, top: node.box.top, right: node.box.left + node.box.width, bottom: node.box.top + node.box.height });
		}
	};
	visit(grid.getViews());
	return result;
}

/**
 * Checks every visible part's box against the grid shape and the arrangement, and returns the
 * violations found (none is the expected outcome).
 */
function checkArrangement(grid: SerializableGrid<StubPart>, views: Views, state: { shape: WorkbenchGridShape; sideBarPosition: Position; panelPosition: Position; panelAlignment: PanelAlignment }): string[] {
	const violations: string[] = [];
	const all = boxes(grid);
	const box = (view: StubPart) => all.get(view);
	const check = (condition: boolean, message: string) => {
		if (!condition) {
			violations.push(message);
		}
	};

	const left = state.sideBarPosition === Position.LEFT;
	const title = box(views.titleBar);
	const status = box(views.statusBar);
	const activityBar = box(views.activityBar);
	const sideBar = box(views.sideBar);
	const columnWidth = (activityBar ? activityBar.right - activityBar.left : 0) + (sideBar ? sideBar.right - sideBar.left : 0);
	const mainLeft = left ? columnWidth : 0;
	const mainRight = left ? WIDTH : WIDTH - columnWidth;
	const columnTop = state.shape === WorkbenchGridShape.ColumnWithBand || !title ? 0 : title.bottom;

	// The column: the activity bar outermost, then the side bar, from the column's top to the window bottom
	if (activityBar) {
		check(activityBar.top === columnTop && activityBar.bottom === HEIGHT, 'activity bar spans the column height');
		check(left ? activityBar.left === 0 : activityBar.right === WIDTH, 'activity bar at the window edge');
	}
	if (sideBar) {
		check(sideBar.top === columnTop && sideBar.bottom === HEIGHT, 'side bar spans the column height');
		const edge = activityBar ? (left ? activityBar.right : activityBar.left) : (left ? 0 : WIDTH);
		check(left ? sideBar.left === edge : sideBar.right === edge, 'side bar next to the activity bar or the window edge');
	}

	// The title row: over the main area in the first shape, across the window in the second
	if (title) {
		check(title.top === 0, 'title bar at the top');
		const [titleLeft, titleRight] = state.shape === WorkbenchGridShape.ColumnWithBand ? [mainLeft, mainRight] : [0, WIDTH];
		check(title.left === titleLeft && title.right === titleRight, 'title bar spans its row');
	}

	// The status line: under the main area
	if (status) {
		check(status.bottom === HEIGHT && status.left === mainLeft && status.right === mainRight, 'status bar spans the main area');
	}

	// The middle: the editor, the panel and the secondary side bar between the bands, in the main area
	const middleTop = title ? title.bottom : 0;
	const middleBottom = status ? status.top : HEIGHT;
	for (const [name, view] of [['editor', views.editor], ['panel', views.panel], ['secondary side bar', views.auxiliaryBar]] as const) {
		const viewBox = box(view);
		if (viewBox) {
			check(viewBox.left >= mainLeft && viewBox.right <= mainRight && viewBox.top >= middleTop && viewBox.bottom <= middleBottom, `${name} inside the main area`);
		}
	}

	const editor = box(views.editor);
	const panel = box(views.panel);
	const auxiliaryBar = box(views.auxiliaryBar);
	if (auxiliaryBar) {
		check(left ? auxiliaryBar.right === mainRight : auxiliaryBar.left === mainLeft, 'secondary side bar opposite the column');
	}

	if (panel && editor) {
		if (!isHorizontal(state.panelPosition)) {
			check(panel.top === middleTop && panel.bottom === middleBottom, 'vertical panel spans the middle row');
			check(state.panelPosition === Position.LEFT ? panel.right === editor.left : panel.left === editor.right, 'vertical panel beside the editor');
		} else {
			const reach = doesPanelReachUnderAuxiliaryBar(state.panelAlignment, state.sideBarPosition) && !!auxiliaryBar;
			const [spanLeft, spanRight] = reach ? [mainLeft, mainRight] : [editor.left, editor.right];
			check(panel.left === spanLeft && panel.right === spanRight, `horizontal panel spans ${reach ? 'the main area' : 'the editor'}`);
			check(state.panelPosition === Position.BOTTOM ? panel.bottom === middleBottom && panel.top === editor.bottom : panel.top === middleTop && panel.bottom === editor.top, 'horizontal panel against the band');
			if (auxiliaryBar) {
				const auxTop = reach && state.panelPosition === Position.TOP ? panel.bottom : middleTop;
				const auxBottom = reach && state.panelPosition === Position.BOTTOM ? panel.top : middleBottom;
				check(auxiliaryBar.top === auxTop && auxiliaryBar.bottom === auxBottom, 'secondary side bar beside the panel or full height');
			}
		}
	}

	return violations;
}

/** What `Layout.setPanelPosition` does with the grid: the panel moves next to the editor, then horizontal positions are arranged. */
function setPanelPosition(grid: SerializableGrid<StubPart>, views: Views, arrangement: { sideBarPosition: Position; panelPosition: Position; panelAlignment: PanelAlignment }): void {
	const size = grid.getViewSize(views.panel);
	const direction = { [Position.BOTTOM]: Direction.Down, [Position.TOP]: Direction.Up, [Position.LEFT]: Direction.Left, [Position.RIGHT]: Direction.Right }[arrangement.panelPosition];
	grid.moveView(views.panel, isHorizontal(arrangement.panelPosition) ? 200 : 300, views.editor, direction);
	if (isHorizontal(arrangement.panelPosition)) {
		arrangeWorkbenchGridParts(grid, views, arrangement, { width: size.width, height: size.height });
	}
}

suite('Workbench layout column', () => {

	ensureNoDisposablesAreLeakedInTestSuite();

	test('the grid shape follows the platform and the title bar style', () => {
		assert.deepStrictEqual({
			macCustom: getWorkbenchGridShape(true, true, false),
			macNative: getWorkbenchGridShape(true, true, true),
			macWeb: getWorkbenchGridShape(true, false, false),
			windowsCustom: getWorkbenchGridShape(false, true, false),
		}, {
			macCustom: WorkbenchGridShape.ColumnWithBand,
			macNative: WorkbenchGridShape.ColumnBelowTitle,
			macWeb: WorkbenchGridShape.ColumnBelowTitle,
			windowsCustom: WorkbenchGridShape.ColumnBelowTitle,
		});
	});

	test('a horizontal panel reaches under the secondary side bar with justify or that bar\'s alignment', () => {
		const alignments: PanelAlignment[] = ['center', 'justify', 'left', 'right'];
		assert.deepStrictEqual({
			sideBarLeft: alignments.map(alignment => doesPanelReachUnderAuxiliaryBar(alignment, Position.LEFT)),
			sideBarRight: alignments.map(alignment => doesPanelReachUnderAuxiliaryBar(alignment, Position.RIGHT)),
		}, {
			sideBarLeft: [false, true, false, true],
			sideBarRight: [false, true, true, false],
		});
	});

	test('the band follows the title row in the first shape only, and the title row clears the window buttons', () => {
		assert.deepStrictEqual({
			band: getColumnBandHeight(WorkbenchGridShape.ColumnWithBand, true, 44),
			bandCompact: getColumnBandHeight(WorkbenchGridShape.ColumnWithBand, true, 32),
			bandFullScreen: getColumnBandHeight(WorkbenchGridShape.ColumnWithBand, false, 44),
			bandBelowTitle: getColumnBandHeight(WorkbenchGridShape.ColumnBelowTitle, true, 35),
			titleBand: getTitleBandHeight(WorkbenchGridShape.ColumnWithBand, true, false),
			titleBandCompact: getTitleBandHeight(WorkbenchGridShape.ColumnWithBand, true, true),
			titleBandModernUIOff: getTitleBandHeight(WorkbenchGridShape.ColumnWithBand, false, false),
			titleBandBelowTitle: getTitleBandHeight(WorkbenchGridShape.ColumnBelowTitle, true, false),
			insetNoColumn: getTitleRowLeadingInset(16, 0),
			insetMockup: getTitleRowLeadingInset(18, 0),
			insetActivityBarOnly: getTitleRowLeadingInset(16, ACTIVITY_BAR),
			insetSideBar: getTitleRowLeadingInset(16, 256),
			insetZoomed: getTitleRowLeadingInset(16 / 1.44, 0),
			insetNoButtons: getTitleRowLeadingInset(undefined, 0),
		}, {
			band: 44,
			bandCompact: 32,
			bandFullScreen: 0,
			bandBelowTitle: 0,
			titleBand: 44,
			titleBandCompact: undefined,
			titleBandModernUIOff: undefined,
			titleBandBelowTitle: undefined,
			insetNoColumn: 16 + TITLE_ROW_WINDOW_CONTROLS_CLEARANCE,
			insetMockup: 86,
			insetActivityBarOnly: 16 + TITLE_ROW_WINDOW_CONTROLS_CLEARANCE - ACTIVITY_BAR,
			insetSideBar: 0,
			insetZoomed: Math.round(16 / 1.44 + TITLE_ROW_WINDOW_CONTROLS_CLEARANCE),
			insetNoButtons: 0,
		});
	});

	test('descriptors of both shapes', () => {
		const snapshot = (overrides: Partial<IWorkbenchGridState>) => describeGrid(createWorkbenchGridDescriptor(createState(overrides)));
		assert.deepStrictEqual({
			band: snapshot({}),
			bandSideBarRight: snapshot({ sideBarPosition: Position.RIGHT }),
			bandJustify: snapshot({ panelAlignment: 'justify' }),
			bandTopRight: snapshot({ panelPosition: Position.TOP, panelAlignment: 'right' }),
			bandPanelLeft: snapshot({ panelPosition: Position.LEFT }),
			bandPanelRightSideBarRight: snapshot({ panelPosition: Position.RIGHT, sideBarPosition: Position.RIGHT }),
			bandHidden: snapshot({ visibility: { titleBar: false, activityBar: true, sideBar: false, editor: true, panel: false, auxiliaryBar: false, statusBar: false } }),
			belowTitle: snapshot({ shape: WorkbenchGridShape.ColumnBelowTitle }),
			belowTitleJustifySideBarRight: snapshot({ shape: WorkbenchGridShape.ColumnBelowTitle, panelAlignment: 'justify', sideBarPosition: Position.RIGHT }),
			bannerFirstBand: snapshot({ bannerFirst: true }),
			bannerFirstBelowTitle: snapshot({ shape: WorkbenchGridShape.ColumnBelowTitle, bannerFirst: true }),
		}, {
			band: 'H[(activitybar), sidebar, V[titlebar, (banner), H[V[editor, panel], auxiliarybar], statusbar]]',
			bandSideBarRight: 'H[V[titlebar, (banner), H[auxiliarybar, V[editor, panel]], statusbar], sidebar, (activitybar)]',
			bandJustify: 'H[(activitybar), sidebar, V[titlebar, (banner), H[editor, auxiliarybar], panel, statusbar]]',
			bandTopRight: 'H[(activitybar), sidebar, V[titlebar, (banner), panel, H[editor, auxiliarybar], statusbar]]',
			bandPanelLeft: 'H[(activitybar), sidebar, V[titlebar, (banner), H[panel, editor, auxiliarybar], statusbar]]',
			bandPanelRightSideBarRight: 'H[V[titlebar, (banner), H[auxiliarybar, editor, panel], statusbar], sidebar, (activitybar)]',
			bandHidden: 'H[activitybar, (sidebar), V[(titlebar), (banner), H[V[editor, (panel)], (auxiliarybar)], (statusbar)]]',
			belowTitle: 'V[titlebar, H[(activitybar), sidebar, V[(banner), H[V[editor, panel], auxiliarybar], statusbar]]]',
			belowTitleJustifySideBarRight: 'V[titlebar, H[V[(banner), H[auxiliarybar, editor], panel, statusbar], sidebar, (activitybar)]]',
			bannerFirstBand: 'H[(activitybar), sidebar, V[(banner), titlebar, H[V[editor, panel], auxiliarybar], statusbar]]',
			bannerFirstBelowTitle: 'V[(banner), titlebar, H[(activitybar), sidebar, V[H[V[editor, panel], auxiliarybar], statusbar]]]',
		});
	});

	test('a grid built from any arrangement places every part', () => {
		const violations: string[] = [];
		for (const shape of [WorkbenchGridShape.ColumnWithBand, WorkbenchGridShape.ColumnBelowTitle]) {
			for (const sideBarPosition of [Position.LEFT, Position.RIGHT]) {
				for (const panelPosition of [Position.BOTTOM, Position.TOP, Position.LEFT, Position.RIGHT]) {
					for (const panelAlignment of ['center', 'justify', 'left', 'right'] as const) {
						for (const activityBar of [false, true]) {
							const views = createViews();
							const state = createState({ shape, sideBarPosition, panelPosition, panelAlignment, visibility: { titleBar: true, activityBar, sideBar: true, editor: true, panel: true, auxiliaryBar: true, statusBar: true } });
							const grid = createGrid(views, state);
							violations.push(...checkArrangement(grid, views, state).map(violation => `${shape} ${sideBarPosition} ${panelPosition} ${panelAlignment} activity bar ${activityBar}: ${violation}`));
							grid.dispose();
						}
					}
				}
			}
		}

		assert.deepStrictEqual(violations, []);
	});

	test('moving the side bar and the panel keeps every part in place', () => {
		const violations: string[] = [];
		for (const shape of [WorkbenchGridShape.ColumnWithBand, WorkbenchGridShape.ColumnBelowTitle]) {
			const views = createViews();
			let arrangement = { shape, sideBarPosition: Position.LEFT, panelPosition: Position.BOTTOM, panelAlignment: 'center' as PanelAlignment };
			const grid = createGrid(views, createState({ shape, visibility: { titleBar: true, activityBar: true, sideBar: true, editor: true, panel: true, auxiliaryBar: true, statusBar: true } }));
			const step = (label: string, change: () => void) => {
				change();
				violations.push(...checkArrangement(grid, views, arrangement).map(violation => `${shape} after ${label}: ${violation}`));
			};

			const steps: [string, () => void][] = [];
			for (const sideBarPosition of [Position.LEFT, Position.RIGHT]) {
				steps.push([`side bar ${sideBarPosition}`, () => {
					arrangement = { ...arrangement, sideBarPosition };
					arrangeWorkbenchGridParts(grid, views, arrangement, { width: Sizing.Distribute, height: Sizing.Distribute });
				}]);
				for (const panelPosition of [Position.TOP, Position.BOTTOM, Position.LEFT, Position.RIGHT, Position.TOP, Position.BOTTOM]) {
					steps.push([`panel ${panelPosition} with the side bar ${sideBarPosition}`, () => {
						arrangement = { ...arrangement, panelPosition };
						setPanelPosition(grid, views, arrangement);
					}]);
					if (isHorizontal(panelPosition)) {
						for (const panelAlignment of ['justify', 'left', 'right', 'center', 'right', 'justify', 'center'] as const) {
							steps.push([`alignment ${panelAlignment} with the panel ${panelPosition} and the side bar ${sideBarPosition}`, () => {
								arrangement = { ...arrangement, panelAlignment };
								arrangeWorkbenchGridParts(grid, views, arrangement, { width: Sizing.Distribute, height: Sizing.Distribute });
							}]);
						}
					}
				}
			}

			for (const [label, change] of steps) {
				step(label, change);
			}

			// Hiding and showing parts moves nothing: every remaining part keeps its place
			for (const view of [views.sideBar, views.activityBar, views.auxiliaryBar, views.panel, views.titleBar, views.statusBar]) {
				step(`hiding the ${view.type}`, () => grid.setViewVisible(view, false));
				step(`showing the ${view.type}`, () => grid.setViewVisible(view, true));
			}

			grid.dispose();
		}

		assert.deepStrictEqual(violations, []);
	});

	test('notifications anchor 1px below the title row and the gutter above the status line', () => {
		assert.deepStrictEqual({
			defaultDensity: getNotificationsBandInsets(TITLE_BAR, STATUS_BAR),
			compactDensity: getNotificationsBandInsets(32, 26),
			// Upstream's Modern UI values follow from its own bands: a 35px title bar, a 28px status bar
			upstreamBands: getNotificationsBandInsets(35, 28),
			// Zoomed out, the title row keeps its screen height and grows in CSS pixels
			zoomedOut: getNotificationsBandInsets(52.8, STATUS_BAR),
			largerStatusFont: getNotificationsBandInsets(TITLE_BAR, 48.7),
			titleRowHidden: getNotificationsBandInsets(0, STATUS_BAR),
			statusLineHidden: getNotificationsBandInsets(TITLE_BAR, 0),
		}, {
			defaultDensity: { blockStart: 45, blockEnd: 42 },
			compactDensity: { blockStart: 33, blockEnd: 34 },
			upstreamBands: { blockStart: 36, blockEnd: 36 },
			zoomedOut: { blockStart: 53.8, blockEnd: 42 },
			largerStatusFont: { blockStart: 45, blockEnd: 56.7 },
			titleRowHidden: { blockStart: 8, blockEnd: 42 },
			statusLineHidden: { blockStart: 45, blockEnd: 8 },
		});
	});

	test('the panel maximizes at the sides, and at the top or the bottom only when centered', () => {
		const alignments: PanelAlignment[] = ['center', 'justify', 'left', 'right'];
		assert.deepStrictEqual({
			bottom: alignments.map(alignment => isPanelMaximizable(Position.BOTTOM, alignment)),
			top: alignments.map(alignment => isPanelMaximizable(Position.TOP, alignment)),
			left: alignments.map(alignment => isPanelMaximizable(Position.LEFT, alignment)),
			right: alignments.map(alignment => isPanelMaximizable(Position.RIGHT, alignment)),
		}, {
			bottom: [true, false, false, false],
			top: [true, false, false, false],
			left: [true, true, true, true],
			right: [true, true, true, true],
		});
	});

	test('a maximized panel fills the middle while the side bar and the panel move', () => {
		// Maximizing hides the editor beside the hidden secondary side bar; a maximizable panel
		// keeps the middle row showing, so every move leaves the panel the whole middle and the
		// editor comes back with its size
		const violations: string[] = [];
		const positions = [Position.BOTTOM, Position.TOP, Position.LEFT, Position.RIGHT];
		for (const shape of [WorkbenchGridShape.ColumnWithBand, WorkbenchGridShape.ColumnBelowTitle]) {
			for (const panelAlignment of ['center', 'justify', 'left', 'right'] as const) {
				for (const start of positions.filter(position => isPanelMaximizable(position, panelAlignment))) {
					const views = createViews();
					const state = createState({ shape, panelPosition: start, panelAlignment });
					const grid = createGrid(views, { ...state, visibility: { ...state.visibility, auxiliaryBar: false } });
					let arrangement = { sideBarPosition: Position.LEFT, panelPosition: start, panelAlignment };
					const check = (label: string) => {
						const all = boxes(grid);
						const sideBar = all.get(views.sideBar);
						const title = all.get(views.titleBar);
						const status = all.get(views.statusBar);
						if (!sideBar || !title || !status) {
							violations.push(`${shape} ${panelAlignment} from ${start}, ${label}: a band or the column has no size`);
							return;
						}
						const [mainLeft, mainRight] = arrangement.sideBarPosition === Position.LEFT ? [sideBar.right, WIDTH] : [0, sideBar.left];
						const expected = { left: mainLeft, top: title.bottom, right: mainRight, bottom: status.top };
						const panel = all.get(views.panel);
						if (!panel || panel.left !== expected.left || panel.top !== expected.top || panel.right !== expected.right || panel.bottom !== expected.bottom) {
							violations.push(`${shape} ${panelAlignment} from ${start}, ${label}: panel ${JSON.stringify(panel)} instead of ${JSON.stringify(expected)}`);
						}
					};

					grid.setViewVisible(views.editor, false);
					check('maximized');
					arrangement = { ...arrangement, sideBarPosition: Position.RIGHT };
					arrangeWorkbenchGridParts(grid, views, arrangement, { width: Sizing.Distribute, height: Sizing.Distribute });
					check('side bar right');
					for (const panelPosition of positions.filter(position => isPanelMaximizable(position, panelAlignment))) {
						arrangement = { ...arrangement, panelPosition };
						setPanelPosition(grid, views, arrangement);
						check(`panel ${panelPosition}`);
					}
					grid.setViewVisible(views.editor, true);
					if (!boxes(grid).get(views.editor)) {
						violations.push(`${shape} ${panelAlignment} from ${start}: the editor shows again without a size`);
					}
					grid.dispose();
				}
			}
		}

		assert.deepStrictEqual(violations, []);
	});

	test('the panel waits while it and the editor are hidden, and takes its place once they show', () => {
		// A maximized secondary side bar hides the editor, the panel and the side bar; the panel
		// moved next to the hidden editor would wrap both in a branch that the grid shows without
		// a visible part and sizes to nothing, collapsing the maximized bar with the middle row
		const violations: string[] = [];
		for (const shape of [WorkbenchGridShape.ColumnWithBand, WorkbenchGridShape.ColumnBelowTitle]) {
			for (const panelPosition of [Position.BOTTOM, Position.TOP, Position.LEFT, Position.RIGHT]) {
				for (const panelAlignment of ['center', 'justify', 'left', 'right'] as const) {
					const label = `${shape} panel ${panelPosition} ${panelAlignment}`;
					const views = createViews();
					const state = createState({ shape, panelPosition, panelAlignment });
					const grid = createGrid(views, { ...state, visibility: { ...state.visibility, sideBar: false, editor: false, panel: false, auxiliaryBar: true } });
					const arrangement = { sideBarPosition: Position.RIGHT, panelPosition, panelAlignment };

					if (arrangeWorkbenchGridParts(grid, views, arrangement, { width: Sizing.Invisible(300), height: Sizing.Invisible(200) })) {
						violations.push(`${label}: the panel moved while hidden beside the hidden editor`);
					}
					const all = boxes(grid);
					const auxiliaryBar = all.get(views.auxiliaryBar);
					const middle = { left: 0, top: all.get(views.titleBar)?.bottom, right: WIDTH, bottom: all.get(views.statusBar)?.top };
					if (JSON.stringify(auxiliaryBar) !== JSON.stringify(middle)) {
						violations.push(`${label}: the maximized secondary side bar is ${JSON.stringify(auxiliaryBar)} instead of ${JSON.stringify(middle)}`);
					}

					grid.setViewVisible(views.editor, true);
					grid.setViewVisible(views.panel, true);
					if (!arrangeWorkbenchGridParts(grid, views, arrangement, { width: Sizing.Distribute, height: Sizing.Distribute })) {
						violations.push(`${label}: the panel still waits once it shows`);
					}
					violations.push(...checkArrangement(grid, views, { shape, ...arrangement }).map(violation => `${label}: ${violation}`));
					grid.dispose();
				}
			}
		}

		assert.deepStrictEqual(violations, []);
	});

	test('each window offsets by its own title row and bars, the banner only in the main window', () => {
		const titleRow = mainWindow.document.createElement('div');
		titleRow.style.height = '32px';
		const statusLine = mainWindow.document.createElement('div');
		statusLine.style.height = '22px';
		mainWindow.document.body.append(titleRow, statusLine);
		try {
			const auxiliaryTitleRow = getAuxiliaryWindowBarHeight(titleRow);
			const auxiliaryStatusLine = getAuxiliaryWindowBarHeight(statusLine);
			statusLine.style.display = 'none'; // a compact auxiliary window hides its status line
			const compactStatusLine = getAuxiliaryWindowBarHeight(statusLine);

			assert.deepStrictEqual({
				mainWithBanner: getContainerOffset(true, 26, 44, false),
				mainCommandCenter: getContainerOffset(true, 0, 44, true),
				mainFullScreen: getContainerOffset(true, 26, 0, true),
				// The main window in full screen with its banner, the auxiliary one windowed with its own title row
				auxiliaryWindowed: getContainerOffset(false, 26, auxiliaryTitleRow, false),
				auxiliaryStatusLine,
				compactStatusLine,
				noPart: getAuxiliaryWindowBarHeight(undefined),
			}, {
				mainWithBanner: { top: 70, quickPickTop: 70 },
				mainCommandCenter: { top: 44, quickPickTop: 6 },
				mainFullScreen: { top: 26, quickPickTop: 26 },
				auxiliaryWindowed: { top: 32, quickPickTop: 32 },
				auxiliaryStatusLine: 22,
				compactStatusLine: 0,
				noPart: 0,
			});
		} finally {
			titleRow.remove();
			statusLine.remove();
		}
	});

	test('the column band pads the part and covers the band with a drag region', () => {
		const part = mainWindow.document.createElement('div');
		const band = new ColumnBand(part);
		const read = () => {
			const element = part.querySelector<HTMLElement>(':scope > .column-band');
			return { paddingTop: part.style.paddingTop, band: element && element.style.display !== 'none' ? element.style.height : undefined };
		};

		band.layout(44);
		const withBand = read();
		band.layout(0);
		const withoutBand = read();
		band.layout(32);
		const compactBand = read();

		assert.deepStrictEqual({ withBand, withoutBand, compactBand, bands: part.querySelectorAll('.column-band').length }, {
			withBand: { paddingTop: '44px', band: '44px' },
			withoutBand: { paddingTop: '', band: undefined },
			compactBand: { paddingTop: '32px', band: '32px' },
			bands: 1,
		});
	});
});
