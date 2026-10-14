/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import 'mocha';
import vscCompletionSpec from '../../completions/vsc';
import { testPaths, type ISuiteSpec } from '../helpers';
import { codeSpecOptionsAndSubcommands } from './code.test';

// The CLI of this product has no subcommands and does not accept these options of the code spec
const unsupportedOptions = ['--add-mcp <json>', '--max-memory <memory>', '--sync <sync>', '--telemetry'];
const vscSpecOptions = codeSpecOptionsAndSubcommands.filter(c => c.startsWith('-') && !unsupportedOptions.includes(c));

export const vscTestSuite: ISuiteSpec = {
	name: 'vsc',
	completionSpecs: vscCompletionSpec,
	availableCommands: 'vsc',
	testSpecs: [
		{ input: 'vsc |', expectedCompletions: vscSpecOptions, expectedResourceRequests: { type: 'both', cwd: testPaths.cwd } },
		{ input: 'vsc --install-extension |', expectedCompletions: ['vsc'], expectedResourceRequests: { type: 'both', cwd: testPaths.cwd } },
		{ input: 'vsc --log |', expectedCompletions: ['critical', 'error', 'warn', 'info', 'debug', 'trace', 'off'] },
	]
};
