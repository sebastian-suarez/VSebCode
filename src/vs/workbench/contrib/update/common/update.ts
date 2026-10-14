/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ContextKeyExpr, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { InEditorZenModeContext, MenuBarVisibleContext } from '../../../common/contextkeys.js';

export const ShowCurrentReleaseNotesActionId = 'update.showCurrentReleaseNotes';

export const UpdateTitleBarContext = new RawContextKey<boolean>('updateTitleBar', false);

export const UpdateTitleBarEditorVisibleContext = ContextKeyExpr.and(
	UpdateTitleBarContext,
	InEditorZenModeContext.negate(),
	ContextKeyExpr.not('inDebugMode')
)!;

export const UpdateGlobalActivityBadgeVisibleContext = ContextKeyExpr.or(
	UpdateTitleBarEditorVisibleContext.negate(),
	MenuBarVisibleContext.negate(),
	ContextKeyExpr.notEquals('config.workbench.activityBar.location', 'top')
)!;
