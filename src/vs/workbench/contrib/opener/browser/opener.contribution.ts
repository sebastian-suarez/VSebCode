/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from '../../../../base/common/lifecycle.js';
import { Schemas } from '../../../../base/common/network.js';
import { normalizePath } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { FileOperationResult, IFileService, toFileOperationResult } from '../../../../platform/files/common/files.js';
import { extractSelection, IOpener, IOpenerService, OpenOptions } from '../../../../platform/opener/common/opener.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { registerWorkbenchContribution2, WorkbenchPhase } from '../../../common/contributions.js';
import { REVEAL_IN_EXPLORER_COMMAND_ID } from '../../files/browser/fileConstants.js';

export class WorkbenchOpenerContribution extends Disposable implements IOpener {
	public static readonly ID = 'workbench.contrib.opener';

	constructor(
		@IOpenerService openerService: IOpenerService,
		@ICommandService private readonly commandService: ICommandService,
		@IFileService private readonly fileService: IFileService,
		@IWorkspaceContextService private readonly workspaceContextService: IWorkspaceContextService,
	) {
		super();

		this._register(openerService.registerOpener(this));
	}

	async open(link: URI | string, options?: OpenOptions): Promise<boolean> {
		if (options?.openExternal) {
			return false;
		}

		let { uri } = extractSelection(typeof link === 'string' ? URI.parse(link) : link);
		if (uri.scheme === Schemas.file) {
			uri = normalizePath(uri);
		}
		if (!this.workspaceContextService.isInsideWorkspace(uri) || !this.fileService.hasProvider(uri)) {
			return false;
		}

		let isDirectory: boolean;
		try {
			isDirectory = (await this.fileService.stat(uri)).isDirectory;
		} catch (error) {
			if (error instanceof Error && toFileOperationResult(error) === FileOperationResult.FILE_NOT_FOUND) {
				return false;
			}
			throw error;
		}
		if (!isDirectory) {
			return false;
		}

		await this.commandService.executeCommand(REVEAL_IN_EXPLORER_COMMAND_ID, uri);
		return true;
	}
}


registerWorkbenchContribution2(WorkbenchOpenerContribution.ID, WorkbenchOpenerContribution, WorkbenchPhase.Eventually);
