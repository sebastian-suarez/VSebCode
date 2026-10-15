/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Merges an upstream release tag into the fork: node build/lib/upstreamMerge.ts <tag> [--no-fetch]
// It audits the two upstream sides, advances the upstream-base branch, merges the tag with git's
// directory-rename heuristic off, deletes again what comes back inside the removed surfaces and
// prints what is left for a human: the remaining conflicts, the additions outside the removed
// surfaces, and the new folders, product fields, dependencies and API proposals of upstream.

import { execFileSync, spawnSync } from 'child_process';
import { isRemovedSurface, readRemovedSurfaces, type IRemovedSurfaces } from './removedSurfaces.ts';

export const upstreamBaseBranch = 'upstream-base';
const mainBranch = 'main';
const upstreamRemote = 'upstream';

// Files that may conflict between upstream main and a release branch without blocking the base:
// manifests and lock files (version pins) and generated data, where the tag's side is taken
const conflictableFiles: readonly RegExp[] = [
	/(^|\/)package(-lock)?\.json$/,
	/^product\.json$/,
	/^build\/lib\/policies\/policyData\.jsonc$/,
	/^ThirdPartyNotices\.txt$/,
	/^cgmanifest\.json$/,
];

// The folders whose new children an upstream merge must have reviewed: a new feature or package
const watchedRoots: readonly string[] = ['src/vs/workbench/contrib', 'src/vs/workbench/services', 'src/vs/workbench/api', 'src/vs/platform', 'src/vs/editor/contrib', 'extensions'];
const dependencyManifests: readonly string[] = ['package.json', 'extensions/package.json', 'build/package.json'];
const dependencySections: readonly string[] = ['dependencies', 'devDependencies', 'optionalDependencies'];

/**
 * What an upstream tag adds beyond the surfaces the fork already knows.
 */
export interface IUpstreamDelta {
	readonly newFolders: readonly string[];
	readonly newProductFields: readonly string[];
	readonly newDependencies: readonly string[];
	readonly newApiProposals: readonly string[];
}

/**
 * The result of a merge run: the merge is staged but not committed.
 */
export interface IUpstreamMergeReport {
	readonly tag: string;
	readonly preMergeHead: string;
	readonly oldBase: string;
	readonly newBase: string;
	readonly removed: readonly string[];
	readonly removedAdditions: readonly string[];
	readonly remainingConflicts: readonly string[];
	readonly remainingAdditions: readonly string[];
	readonly delta: IUpstreamDelta;
}

export interface IUpstreamMergeOptions {
	readonly fetch: boolean;
	readonly sign: boolean;
}

function git(repoRoot: string, args: readonly string[]): string {
	return execFileSync('git', ['-C', repoRoot, ...args], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function gitResult(repoRoot: string, args: readonly string[]): { status: number; stdout: string; stderr: string } {
	const result = spawnSync('git', ['-C', repoRoot, ...args], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
	return { status: result.status ?? 1, stdout: result.stdout ?? '', stderr: (result.stderr ?? '').trim() };
}

function nulSeparated(output: string): string[] {
	return output.split('\0').filter(Boolean);
}

function readJson(repoRoot: string, ref: string, file: string): Record<string, unknown> {
	const result = gitResult(repoRoot, ['show', `${ref}:${file}`]);
	if (result.status !== 0) {
		return {};
	}
	try {
		return JSON.parse(result.stdout) as Record<string, unknown>;
	} catch {
		return {};
	}
}

/**
 * The paths that conflict between the upstream base and the tag and that are neither removed
 * surfaces nor manifests. They must be empty before the base is advanced, because the base is
 * built with `-X theirs`, which would resolve them silently in favour of the tag.
 */
export function auditUpstreamSides(repoRoot: string, base: string, tag: string, surfaces: IRemovedSurfaces): string[] {
	const result = gitResult(repoRoot, ['merge-tree', '--write-tree', '--no-messages', '--name-only', '-z', base, tag]);
	if (result.status === 0) {
		return [];
	}
	if (result.status !== 1) {
		throw new Error(`git merge-tree ${base} ${tag} failed: ${result.stderr}`);
	}
	const [, ...conflicted] = nulSeparated(result.stdout);
	return conflicted.filter(filePath => !isRemovedSurface(surfaces, filePath) && !conflictableFiles.some(pattern => pattern.test(filePath)));
}

/**
 * Advances the upstream base to the pure upstream merge of its commit and the tag, as a merge
 * commit with both as parents, and returns the new commit. The two upstream sides may only
 * disagree inside removed surfaces and manifests (see auditUpstreamSides); there the tag wins.
 */
export function advanceUpstreamBase(repoRoot: string, tag: string, sign: boolean): string {
	const oldBase = git(repoRoot, ['rev-parse', '--verify', `refs/heads/${upstreamBaseBranch}`]);
	const tagCommit = git(repoRoot, ['rev-parse', '--verify', `${tag}^{commit}`]);
	if (gitResult(repoRoot, ['merge-base', '--is-ancestor', tagCommit, oldBase]).status === 0) {
		return oldBase;
	}
	const tree = gitResult(repoRoot, ['merge-tree', '--write-tree', '--no-messages', '-X', 'theirs', oldBase, tagCommit]);
	if (tree.status !== 0) {
		throw new Error(`The upstream base and ${tag} conflict beyond what -X theirs resolves; build the base by hand in a scratch worktree as the merge of ${oldBase.slice(0, 11)} and ${tag}:\n${tree.stdout.trim()}`);
	}
	const treeId = tree.stdout.trim().split('\n')[0];
	const commit = git(repoRoot, ['commit-tree', ...(sign ? ['-S'] : []), treeId, '-p', oldBase, '-p', tagCommit, '-m', `upstream: ${tag} merged`]);
	git(repoRoot, ['update-ref', `refs/heads/${upstreamBaseBranch}`, commit, oldBase]);
	return commit;
}

/**
 * Merges the tag into the current branch without committing, and returns the paths left
 * unmerged and the paths the merge adds. Directory-rename detection is off because the fork
 * deletes whole folders, which the heuristic would otherwise map onto unrelated renamed folders.
 */
export function mergeTag(repoRoot: string, tag: string): { conflicted: string[]; added: string[] } {
	const result = gitResult(repoRoot, ['-c', 'merge.directoryRenames=false', 'merge', '--no-ff', '--no-commit', tag]);
	if (result.status !== 0 && result.status !== 1) {
		throw new Error(`git merge ${tag} failed: ${result.stderr}`);
	}
	return {
		conflicted: nulSeparated(git(repoRoot, ['diff', '--name-only', '-z', '--diff-filter=U'])),
		added: nulSeparated(git(repoRoot, ['diff', '--cached', '--name-only', '-z', '--no-renames', '--diff-filter=A'])),
	};
}

/**
 * Deletes from the index and the working tree the given paths that are removed surfaces, and
 * returns them.
 */
export function deleteRemovedSurfaces(repoRoot: string, paths: readonly string[], surfaces: IRemovedSurfaces): string[] {
	const covered = [...new Set(paths.filter(filePath => isRemovedSurface(surfaces, filePath)))].sort();
	for (let i = 0; i < covered.length; i += 200) {
		git(repoRoot, ['--literal-pathspecs', 'rm', '-q', '-f', '--', ...covered.slice(i, i + 200)]);
	}
	return covered;
}

/**
 * Aborts the merge in progress and returns git's error when that fails.
 */
export function abortMerge(repoRoot: string): string | undefined {
	const result = gitResult(repoRoot, ['merge', '--abort']);
	return result.status === 0 ? undefined : result.stderr || `git merge --abort exited with ${result.status}`;
}

/**
 * Describes what upstream added between two bases: new folders under the watched roots, new
 * `product.json` fields, new dependencies of the manifests and new API proposals.
 */
export function describeUpstreamDelta(repoRoot: string, oldBase: string, newBase: string): IUpstreamDelta {
	const added = nulSeparated(git(repoRoot, ['diff', '--name-only', '-z', '--no-renames', '--diff-filter=A', oldBase, newBase]));
	const newFolders = new Set<string>();
	for (const root of watchedRoots) {
		const existing = new Set(git(repoRoot, ['ls-tree', '--name-only', oldBase, `${root}/`]).split('\n'));
		for (const file of added) {
			if (!file.startsWith(`${root}/`)) {
				continue;
			}
			const folder = `${root}/${file.slice(root.length + 1).split('/')[0]}`;
			if (folder !== file && !existing.has(folder)) {
				newFolders.add(`${folder}/`);
			}
		}
	}
	const oldProduct = readJson(repoRoot, oldBase, 'product.json');
	const newProduct = readJson(repoRoot, newBase, 'product.json');
	const newProductFields = Object.keys(newProduct).filter(field => !Object.hasOwn(oldProduct, field));
	const newDependencies: string[] = [];
	for (const manifest of dependencyManifests) {
		const oldManifest = readJson(repoRoot, oldBase, manifest);
		const newManifest = readJson(repoRoot, newBase, manifest);
		for (const section of dependencySections) {
			const oldSection = (oldManifest[section] ?? {}) as Record<string, string>;
			const newSection = (newManifest[section] ?? {}) as Record<string, string>;
			for (const name of Object.keys(newSection)) {
				if (!Object.hasOwn(oldSection, name)) {
					newDependencies.push(`${name} (${manifest})`);
				}
			}
		}
	}
	const proposalPattern = /^src\/vscode-dts\/vscode\.proposed\.(.+)\.d\.ts$/;
	const newApiProposals = added.map(file => proposalPattern.exec(file)?.[1]).filter((name): name is string => name !== undefined);
	return { newFolders: [...newFolders].sort(), newProductFields, newDependencies, newApiProposals };
}

/**
 * Runs the whole sync: the preconditions, the audit, the merge, the deletions and the base. The
 * merge is left staged for the human steps that follow. The base is advanced only once the merge
 * is in the index, and a failure after the merge aborts it, so that a failed run leaves the
 * repository as it was; a base advanced by an earlier run that was aborted afterwards is reused.
 */
export function runUpstreamMerge(repoRoot: string, tag: string, options: IUpstreamMergeOptions): IUpstreamMergeReport {
	if (git(repoRoot, ['status', '--porcelain']) !== '') {
		throw new Error('The working tree must be clean before an upstream merge.');
	}
	const branch = gitResult(repoRoot, ['symbolic-ref', '--short', 'HEAD']).stdout.trim();
	if (branch !== mainBranch) {
		throw new Error(`The upstream merge runs on ${mainBranch}, because it advances ${upstreamBaseBranch}; the current branch is ${branch || 'detached'}.`);
	}
	if (options.fetch) {
		git(repoRoot, ['fetch', upstreamRemote, '--tags']);
	}
	if (gitResult(repoRoot, ['rev-parse', '--verify', '--quiet', `${tag}^{commit}`]).status !== 0) {
		throw new Error(`The tag ${tag} does not exist; run git fetch ${upstreamRemote} --tags.`);
	}
	const tagCommit = git(repoRoot, ['rev-parse', '--verify', `${tag}^{commit}`]);
	const preMergeHead = git(repoRoot, ['rev-parse', 'HEAD']);
	if (gitResult(repoRoot, ['merge-base', '--is-ancestor', tagCommit, preMergeHead]).status === 0) {
		throw new Error(`The tag ${tag} is already merged.`);
	}
	if (gitResult(repoRoot, ['rev-parse', '--verify', '--quiet', `refs/heads/${upstreamBaseBranch}`]).status !== 0) {
		throw new Error(`The branch ${upstreamBaseBranch} does not exist; it holds the upstream content the fork contains.`);
	}
	const surfaces = readRemovedSurfaces(repoRoot);
	let oldBase = git(repoRoot, ['rev-parse', `refs/heads/${upstreamBaseBranch}`]);
	let baseAlreadyAdvanced = false;
	const baseSecondParent = gitResult(repoRoot, ['rev-parse', '--verify', '--quiet', `${upstreamBaseBranch}^2`]).stdout.trim();
	if (baseSecondParent && gitResult(repoRoot, ['merge-base', '--is-ancestor', baseSecondParent, preMergeHead]).status !== 0) {
		// An earlier run advanced the base and its merge was aborted
		const previousBase = git(repoRoot, ['rev-parse', `${upstreamBaseBranch}^1`]);
		if (baseSecondParent !== tagCommit) {
			throw new Error(`The branch ${upstreamBaseBranch} is ahead of ${mainBranch}: an earlier sync of ${baseSecondParent.slice(0, 11)} was aborted. Restore the base first: git update-ref refs/heads/${upstreamBaseBranch} ${previousBase} ${oldBase}`);
		}
		// The same tag again: report against the base before it
		oldBase = previousBase;
		baseAlreadyAdvanced = true;
	} else if (gitResult(repoRoot, ['merge-base', '--is-ancestor', tagCommit, oldBase]).status === 0) {
		throw new Error(`The branch ${upstreamBaseBranch} already contains ${tag}; merge a newer tag.`);
	}
	// The base must hold exactly the upstream content main contains: no upstream commit outside main
	const foreignCommit = gitResult(repoRoot, ['rev-list', '--no-merges', '-n', '1', oldBase, `^${preMergeHead}`]).stdout.trim();
	if (foreignCommit) {
		throw new Error(`The branch ${upstreamBaseBranch} contains the upstream commit ${foreignCommit.slice(0, 11)} that ${mainBranch} does not; the base must be the merge of the previous base and the merged tag only.`);
	}
	if (!baseAlreadyAdvanced) {
		const audit = auditUpstreamSides(repoRoot, oldBase, tagCommit, surfaces);
		if (audit.length > 0) {
			throw new Error(`The upstream base and ${tag} conflict in surviving files, which -X theirs would resolve silently; build the base by hand in a scratch worktree as the merge of ${oldBase.slice(0, 11)} and ${tag}:\n${audit.map(file => `  ${file}`).join('\n')}`);
		}
	}
	const { conflicted, added } = mergeTag(repoRoot, tag);
	let removed: string[];
	let newBase: string;
	try {
		removed = deleteRemovedSurfaces(repoRoot, [...conflicted, ...added], surfaces);
		newBase = baseAlreadyAdvanced ? git(repoRoot, ['rev-parse', `refs/heads/${upstreamBaseBranch}`]) : advanceUpstreamBase(repoRoot, tag, options.sign);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		const abortError = abortMerge(repoRoot);
		if (abortError) {
			throw new Error(`${message}\nThe merge could not be aborted (${abortError}); the index still holds the merge of ${tag}. Run git merge --abort by hand and check git status before retrying.`);
		}
		throw new Error(`${message}\nThe merge was aborted; the working tree is back at ${preMergeHead.slice(0, 11)} and ${upstreamBaseBranch} is unchanged.`);
	}
	const removedSet = new Set(removed);
	const addedSet = new Set(added);
	return {
		tag,
		preMergeHead,
		oldBase,
		newBase,
		removed,
		removedAdditions: removed.filter(file => addedSet.has(file)),
		remainingConflicts: conflicted.filter(file => !removedSet.has(file)),
		remainingAdditions: added.filter(file => !removedSet.has(file)),
		delta: describeUpstreamDelta(repoRoot, oldBase, newBase),
	};
}

/**
 * Formats the report with the steps that remain for a human.
 */
export function formatReport(report: IUpstreamMergeReport): string {
	const list = (title: string, items: readonly string[]): string[] => items.length === 0 ? [`${title}: none`] : [`${title} (${items.length}):`, ...items.map(item => `  ${item}`)];
	return [
		`Merged ${report.tag} into the working tree and the index, not committed yet.`,
		`${upstreamBaseBranch}: ${report.oldBase.slice(0, 11)} -> ${report.newBase.slice(0, 11)}`,
		`Deleted again inside the removed surfaces: ${report.removed.length - report.removedAdditions.length} conflicting paths`,
		...list('New upstream files deleted inside the removed surfaces, check that none of them is wanted', report.removedAdditions),
		...list('Conflicts to resolve by hand', report.remainingConflicts),
		...list('Additions outside the removed surfaces, to keep or to add to build/removed-surfaces.txt', report.remainingAdditions),
		...list('New upstream folders', report.delta.newFolders),
		...list('New product.json fields', report.delta.newProductFields),
		...list('New dependencies', report.delta.newDependencies),
		...list('New API proposals', report.delta.newApiProposals),
		'',
		'Next: resolve the conflicts hunk by hunk (an upstream hunk is dropped only when it concerns a removed surface), review the additions, then `git commit` for the merge commit, and check that the fork changes the same paths as before plus the new upstream files deleted above:',
		`  diff <(git diff --name-only ${report.oldBase.slice(0, 11)} ${report.preMergeHead.slice(0, 11)}) <(git diff --name-only ${upstreamBaseBranch} HEAD)`,
		...(report.newBase === report.oldBase ? [] : [`To abort this merge instead, run git merge --abort and restore the base: git update-ref refs/heads/${upstreamBaseBranch} ${report.oldBase} ${report.newBase}`]),
		`Then: npm install, npm run fork-header -- ${upstreamBaseBranch} (no rewrite expected), npm run typecheck-client, and the validation list of CLAUDE.md.`,
	].join('\n');
}

if (import.meta.main) {
	const args = process.argv.slice(2);
	const tag = args.find(arg => !arg.startsWith('--'));
	if (!tag) {
		console.error('Usage: node build/lib/upstreamMerge.ts <tag> [--no-fetch]');
		process.exit(1);
	}
	const repoRoot = process.cwd();
	const sign = gitResult(repoRoot, ['config', '--get', 'commit.gpgsign']).stdout.trim() === 'true';
	try {
		console.log(formatReport(runUpstreamMerge(repoRoot, tag, { fetch: !args.includes('--no-fetch'), sign })));
	} catch (error) {
		console.error(error instanceof Error ? error.message : String(error));
		process.exit(1);
	}
}
