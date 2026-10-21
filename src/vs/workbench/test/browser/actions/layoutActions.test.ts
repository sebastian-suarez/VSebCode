/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../base/test/common/utils.js';
import { MenuRegistry } from '../../../../platform/actions/common/actions.js';
import { IContext } from '../../../../platform/contextkey/common/contextkey.js';
import '../../../browser/actions/layoutActions.js';
import { isPanelMaximizable } from '../../../browser/layoutColumn.js';
import { IsAuxiliaryWindowFocusedContext, PanelAlignmentContext, PanelPositionContext } from '../../../common/contextkeys.js';
import { PanelAlignment, Position, positionToString } from '../../../services/layout/browser/layoutService.js';

suite('Layout actions', () => {

	ensureNoDisposablesAreLeakedInTestSuite();

	test('the editor area toggles wherever the panel can be maximized', () => {
		const precondition = MenuRegistry.getCommand('workbench.action.toggleEditorVisibility')?.precondition;
		assert.ok(precondition);

		const alignments: PanelAlignment[] = ['center', 'justify', 'left', 'right'];
		const positions = [Position.BOTTOM, Position.TOP, Position.LEFT, Position.RIGHT];
		const enabled = (position: Position, alignment: PanelAlignment) => {
			const values: Record<string, unknown> = {
				[PanelPositionContext.key]: positionToString(position),
				[PanelAlignmentContext.key]: alignment,
				[IsAuxiliaryWindowFocusedContext.key]: false
			};
			const context: IContext = { getValue: <T>(key: string) => values[key] as T | undefined };
			return precondition.evaluate(context);
		};

		assert.deepStrictEqual(
			positions.map(position => alignments.map(alignment => enabled(position, alignment))),
			positions.map(position => alignments.map(alignment => isPanelMaximizable(position, alignment)))
		);
	});
});
