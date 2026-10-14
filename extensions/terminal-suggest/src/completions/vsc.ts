/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import code, { commonOptions, extensionManagementOptions, troubleshootingOptions } from './code';

// Options of the code spec that the CLI of this product does not accept
const unsupportedOptions = new Set(['--add-mcp', '--max-memory', '--sync', '--telemetry']);

const isSupportedOption = (option: Fig.Option): boolean => {
	const names = Array.isArray(option.name) ? option.name : [option.name];
	return !names.some(name => unsupportedOptions.has(name));
};

const vscCompletionSpec: Fig.Spec = {
	...code,
	name: 'vsc',
	description: 'VSebCode',
	// The CLI of this product has no subcommands, so the ones of the code spec are not offered
	subcommands: [],
	options: [
		...commonOptions,
		...extensionManagementOptions('vsc'),
		...troubleshootingOptions('vsc'),
	].filter(isSupportedOption),
};

export default vscCompletionSpec;
