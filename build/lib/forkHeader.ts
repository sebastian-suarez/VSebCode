/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Applies the copyright header policy of the fork to the files changed since an upstream commit:
// node build/lib/forkHeader.ts <upstream-base-commit>

import { execFileSync } from 'child_process';
import fs from 'fs';
import minimatch from 'minimatch';
import path from 'path';
import { all, copyrightFilter } from '../filters.ts';

const headerStartLine = '/*---------------------------------------------------------------------------------------------';
const microsoftCopyrightLine = ' *  Copyright (c) Microsoft Corporation. All rights reserved.';
const forkCopyrightLine = ' *  Copyright (c) Sebastian Suarez. All rights reserved.';
const headerEndLines = [
	' *  Licensed under the MIT License. See License.txt in the project root for license information.',
	' *--------------------------------------------------------------------------------------------*/',
];

const upstreamHeader = [headerStartLine, microsoftCopyrightLine, ...headerEndLines];
const modifiedUpstreamHeader = [headerStartLine, microsoftCopyrightLine, forkCopyrightLine, ...headerEndLines];
const forkHeader = [headerStartLine, forkCopyrightLine, ...headerEndLines];

/**
 * The copyright headers hygiene accepts: the Microsoft header on upstream files, the Microsoft line
 * followed by the fork line on upstream files the fork modified, moved or extracted code from, and
 * the fork line alone on files the fork authored.
 */
export const copyrightHeaders: readonly (readonly string[])[] = [upstreamHeader, modifiedUpstreamHeader, forkHeader];

// Added files that were extracted or moved from upstream code: they keep the Microsoft line before the fork line
const UPSTREAM_DERIVED_FILES = new Set([
	'extensions/terminal-suggest/src/completions/vsc.ts',
	'extensions/terminal-suggest/src/test/completions/vsc.test.ts',
	'build/lib/ripgrep.ts',
	'src/vs/platform/policy/test/common/multiplexPolicyService.test.ts',
	'src/vs/platform/telemetry/common/telemetryConfiguration.ts',
]);

// Files that upstream generators write with the Microsoft header; build checks compare them with the generator output
const GENERATED_FILES = new Set([
	'src/vs/editor/common/standalone/standaloneEnums.ts',
	'src/vs/monaco.d.ts',
	'src/vs/platform/extensions/common/extensionsApiProposals.ts',
]);

const root = path.join(import.meta.dirname, '..', '..');

interface IChangedFile {
	readonly path: string;
	readonly added: boolean;
}

/**
 * Lists the files added, modified or moved between the given commit and HEAD.
 */
function getChangedFiles(base: string): IChangedFile[] {
	const output = execFileSync('git', ['diff', '--name-status', '-z', '-M', base, 'HEAD'], { cwd: root, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
	const fields = output.split('\0');
	const result: IChangedFile[] = [];
	let i = 0;
	while (fields[i]) {
		const status = fields[i++];
		// Renames (and copies, when copy detection is configured) name the source path first
		const moved = status.startsWith('R') || status.startsWith('C');
		if (moved) {
			i++;
		}
		const filePath = fields[i++];
		if (status === 'A') {
			result.push({ path: filePath, added: true });
		} else if (status === 'M' || moved) {
			result.push({ path: filePath, added: false });
		}
	}
	return result;
}

/**
 * Matches a path the way gulp-filter applies glob patterns in build/hygiene.ts: in order, a pattern
 * adds the path when it matches and a negated pattern removes it again.
 */
function matchesFilter(filePath: string, patterns: readonly string[]): boolean {
	let matched = false;
	for (const pattern of patterns) {
		if (pattern.startsWith('!')) {
			matched = matched && !minimatch(filePath, pattern.slice(1));
		} else {
			matched = matched || minimatch(filePath, pattern);
		}
	}
	return matched;
}

/**
 * Checks the leading lines of a file split into alternating lines and line endings.
 */
function hasHeader(parts: readonly string[], header: readonly string[]): boolean {
	return header.every((line, i) => parts[2 * i] === line);
}

/**
 * Gives every file changed since `base` whose header hygiene checks the header of the policy:
 * modified, moved and upstream-derived files get the fork line after the Microsoft line, added
 * files get the fork line instead of the Microsoft line.
 */
function applyForkHeaders(base: string): void {
	const modified: string[] = [];
	const added: string[] = [];
	const unexpected: string[] = [];
	let unchanged = 0;
	let generated = 0;

	for (const file of getChangedFiles(base)) {
		if (!matchesFilter(file.path, all) || !matchesFilter(file.path, copyrightFilter)) {
			continue;
		}
		const filePath = path.join(root, file.path);
		if (!fs.lstatSync(filePath, { throwIfNoEntry: false })?.isFile()) {
			continue;
		}
		// latin1 maps every byte to one character, so the rest of the file is written back byte for byte
		const parts = fs.readFileSync(filePath, 'latin1').split(/(\r\n|\r|\n)/);
		if (parts[0] !== headerStartLine) {
			continue;
		}
		if (GENERATED_FILES.has(file.path)) {
			generated++;
			continue;
		}

		const keepMicrosoftLine = !file.added || UPSTREAM_DERIVED_FILES.has(file.path);
		if (hasHeader(parts, keepMicrosoftLine ? modifiedUpstreamHeader : forkHeader)) {
			unchanged++;
			continue;
		}
		if (!hasHeader(parts, upstreamHeader)) {
			unexpected.push(file.path);
			continue;
		}

		if (keepMicrosoftLine) {
			// The fork line takes the line ending of the Microsoft line
			parts.splice(4, 0, forkCopyrightLine, parts[3]);
			modified.push(file.path);
		} else {
			parts[2] = forkCopyrightLine;
			added.push(file.path);
		}
		fs.writeFileSync(filePath, parts.join(''), 'latin1');
	}

	console.log(`Fork header since ${base}:`);
	console.log(`  rewritten to the Microsoft and Sebastian Suarez lines: ${modified.length}`);
	console.log(`  rewritten to the Sebastian Suarez line: ${added.length}`);
	console.log(`  already carrying the header of the policy: ${unchanged}`);
	console.log(`  generated, keeping the Microsoft header: ${generated}`);
	if (unexpected.length > 0) {
		console.log(`Left as they are, because their header is neither the Microsoft header nor the one of the policy (${unexpected.length}):`);
		for (const file of unexpected) {
			console.log(`  ${file}`);
		}
	}
	const changed = [...modified, ...added].sort();
	if (changed.length > 0) {
		console.log(`Changed files (${changed.length}):`);
		for (const file of changed) {
			console.log(`  ${file}`);
		}
	}
}

if (import.meta.main) {
	const base = process.argv[2];
	if (!base) {
		console.error('Usage: node build/lib/forkHeader.ts <upstream-base-commit>');
		process.exit(1);
	}
	applyForkHeaders(base);
}
