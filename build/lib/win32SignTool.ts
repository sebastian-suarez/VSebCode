/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as fs from 'node:fs';
import * as path from 'node:path';

/** Finds the newest installed SDK signing tool, retaining PATH resolution when no SDK tool exists. */
export function findSignTool(sdkBinDirectory: string | undefined, architecture: string = process.arch): string {
	if (sdkBinDirectory && fs.existsSync(sdkBinDirectory)) {
		const versions = fs.readdirSync(sdkBinDirectory).filter(version => /^\d+(?:\.\d+){3}$/.test(version)).sort((a, b) => b.localeCompare(a, 'en', { numeric: true }));
		const architectures = architecture === 'arm64' ? ['arm64', 'x64', 'x86'] : architecture === 'ia32' ? ['x86'] : ['x64', 'x86'];
		for (const version of versions) {
			for (const arch of architectures) {
				const candidate = path.join(sdkBinDirectory, version, arch, 'signtool.exe');
				if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
					return candidate;
				}
			}
		}
	}
	return 'signtool.exe';
}
