/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// The surfaces the fork removed from upstream, listed in build/removed-surfaces.txt: hygiene fails
// when one of them exists in the tree, and the upstream merge helper deletes again whatever an
// upstream merge brings back inside them.

import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export const removedSurfacesFile = 'build/removed-surfaces.txt';

/**
 * The removed surfaces: folders, listed with a trailing slash and matched by prefix, and single files.
 */
export interface IRemovedSurfaces {
	readonly folders: readonly string[];
	readonly files: ReadonlySet<string>;
}

/**
 * Parses the manifest: one path per line, relative to the repository root with forward slashes and
 * a trailing slash for a folder; blank lines and lines starting with `#` are ignored.
 */
export function parseRemovedSurfaces(text: string): IRemovedSurfaces {
	const folders: string[] = [];
	const files = new Set<string>();
	for (const rawLine of text.split(/\r\n|\n/)) {
		const line = rawLine.trim();
		if (!line || line.startsWith('#')) {
			continue;
		}
		if (line.endsWith('/')) {
			folders.push(line);
		} else {
			files.add(line);
		}
	}
	return { folders, files };
}

/**
 * Reads the manifest of the given repository.
 */
export function readRemovedSurfaces(repoRoot: string): IRemovedSurfaces {
	return parseRemovedSurfaces(fs.readFileSync(path.join(repoRoot, removedSurfacesFile), 'utf8'));
}

/**
 * Tells whether a repository-relative path is a removed surface or lies inside one.
 */
export function isRemovedSurface(surfaces: IRemovedSurfaces, filePath: string): boolean {
	const normalized = filePath.replace(/\\/g, '/');
	return surfaces.files.has(normalized) || surfaces.folders.some(folder => normalized.startsWith(folder));
}

/**
 * Lists the given paths, or every tracked file of the repository, that are removed surfaces.
 */
export function findRemovedSurfaces(repoRoot: string, paths?: readonly string[], surfaces: IRemovedSurfaces = readRemovedSurfaces(repoRoot)): string[] {
	const candidates = paths ?? execFileSync('git', ['ls-files', '-z'], { cwd: repoRoot, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 }).split('\0').filter(Boolean);
	return candidates.filter(candidate => isRemovedSurface(surfaces, candidate));
}

/**
 * The hygiene check: an error message naming the removed surfaces among the given paths, or in the
 * whole tree when no paths are given, or undefined when there are none.
 */
export function checkRemovedSurfaces(repoRoot: string, paths?: readonly string[]): string | undefined {
	const present = findRemovedSurfaces(repoRoot, paths);
	if (present.length === 0) {
		return undefined;
	}
	return [
		`The fork removed these surfaces (see ${removedSurfacesFile}); delete them again instead of bringing them back:`,
		...present.map(file => `  ${file}`),
	].join('\n');
}
