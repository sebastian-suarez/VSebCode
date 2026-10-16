/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import './bootstrap-cli.js'; // this MUST come before other imports as it changes global state
import { configurePortable } from './bootstrap-node.js';
import { bootstrapESM } from './bootstrap-esm.js';
import { resolveNLSConfiguration } from './vs/base/node/nls.js';
import { product, loadUserProduct } from './bootstrap-meta.js';
import { getUserDataPath } from './vs/platform/environment/node/userDataPath.js';
import { addUNCHostToAllowlist, getUNCHost } from './vs/base/node/unc.js';
import minimist from 'minimist';

// NLS
const nlsConfiguration = await resolveNLSConfiguration({ userLocale: 'en', osLocale: 'en', commit: product.commit, nlsMetadataHash: product.nlsMetadataHash, userDataPath: '', nlsMetadataPath: import.meta.dirname });
process.env['VSCODE_NLS_CONFIG'] = JSON.stringify(nlsConfiguration); // required for `bootstrap-esm` to pick up NLS messages

// Enable portable support
configurePortable(product);
const userDataArgs = minimist(process.argv.slice(2), { string: ['user-data-dir'] });
const userDataPath = getUserDataPath(userDataArgs, product.nameShort ?? 'vsebcode-dev');
const userDataUNCHost = getUNCHost(userDataPath);
if (userDataUNCHost) {
	addUNCHostToAllowlist(userDataUNCHost);
}
loadUserProduct(userDataPath);

// Signal processes that we got launched as CLI
process.env['VSCODE_CLI'] = '1';

// Bootstrap ESM
await bootstrapESM();

// Load Server
await import('./vs/code/node/cli.js');
