/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { relativePath } from '../../../base/common/resources.js';
import { URI } from '../../../base/common/uri.js';
import { IEnvironmentService } from '../../environment/common/environment.js';
import { IFileService } from '../../files/common/files.js';

export interface ILogFile {
	readonly relativePath: string;
	readonly contents: string;
}

/**
 * Only used in browser contexts where the log files are not stored on disk
 * but in IndexedDB. A method to get all logs with their contents so that
 * CI automation can persist them.
 */
export async function getLogs(fileService: IFileService, environmentService: IEnvironmentService): Promise<ILogFile[]> {
	const result: ILogFile[] = [];

	await doGetLogs(fileService, result, environmentService.logsHome, environmentService.logsHome);

	return result;
}

async function doGetLogs(fileService: IFileService, logs: ILogFile[], curFolder: URI, logsHome: URI): Promise<void> {
	const stat = await fileService.resolve(curFolder);

	for (const { resource, isDirectory } of stat.children || []) {
		if (isDirectory) {
			await doGetLogs(fileService, logs, resource, logsHome);
		} else {
			const contents = (await fileService.readFile(resource)).value.toString();
			if (contents) {
				const path = relativePath(logsHome, resource);
				if (path) {
					logs.push({ relativePath: path, contents });
				}
			}
		}
	}
}
