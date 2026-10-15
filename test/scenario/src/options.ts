/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import minimist from 'minimist';

const [, , ...args] = process.argv;
export const opts = minimist(args, {
	string: [
		'build',
		'wait-time',
		'test-repo',
		'electronArgs',
		'extensionDevelopmentPath'
	],
	boolean: [
		'verbose',
		'video',
		'autostart',
		'dev'
	],
	default: {
		verbose: false
	}
}) as {
	verbose?: boolean;
	build?: string;
	dev?: boolean;
	electronArgs?: string;
	video?: boolean;
	autostart?: boolean;
	extensionDevelopmentPath?: string;
};
