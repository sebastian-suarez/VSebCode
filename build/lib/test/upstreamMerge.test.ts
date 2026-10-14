/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { execFileSync, spawnSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { suite, test } from 'node:test';
import { removedSurfacesFile } from '../removedSurfaces.ts';
import { advanceUpstreamBase, runUpstreamMerge, upstreamBaseBranch } from '../upstreamMerge.ts';

interface IRepo {
	readonly root: string;
	git(...args: string[]): string;
	write(files: Record<string, string>): void;
	remove(file: string): void;
	commit(message: string): string;
	isAncestor(commit: string, descendant: string): boolean;
}

function createRepo(): IRepo {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'vsebcode-upstream-merge-'));
	const git = (...args: string[]): string => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
	git('init', '-q', '-b', 'main');
	git('config', 'user.email', 'test@example.com');
	git('config', 'user.name', 'Test');
	git('config', 'commit.gpgsign', 'false');
	git('config', 'tag.gpgsign', 'false');
	return {
		root,
		git,
		write(files) {
			for (const [file, content] of Object.entries(files)) {
				fs.mkdirSync(path.join(root, path.dirname(file)), { recursive: true });
				fs.writeFileSync(path.join(root, file), content);
			}
		},
		remove(file) {
			git('rm', '-r', '-q', '--', file);
		},
		commit(message) {
			git('add', '-A');
			git('commit', '-q', '-m', message);
			return git('rev-parse', 'HEAD');
		},
		isAncestor(commit, descendant) {
			return spawnSync('git', ['-C', root, 'merge-base', '--is-ancestor', commit, descendant]).status === 0;
		},
	};
}

/**
 * Upstream: a base commit, then a release branch tagged 1.1.0 that touches a removed folder and
 * surviving code and adds a folder, a product field, a dependency and an API proposal.
 * The fork: the base plus the removal of `src/vs/platform/removed`, with the manifest.
 */
function createHistory(repo: IRepo): { base: string; tag: string } {
	repo.write({
		'src/vs/platform/keep/a.ts': 'export const a = 1;\n',
		'src/vs/platform/keep/moved.ts': 'export const moved = 1;\n',
		'src/vs/platform/removed/r.ts': 'r1\n',
		'product.json': '{\n\t"nameShort": "Code"\n}\n',
		'package.json': '{\n\t"dependencies": {\n\t\t"x": "1"\n\t}\n}\n',
	});
	const base = repo.commit('upstream base');
	repo.git('branch', upstreamBaseBranch);
	repo.git('checkout', '-q', '-b', 'release');
	repo.git('mv', 'src/vs/platform/keep/moved.ts', 'src/vs/platform/removed/moved.ts');
	repo.write({
		'src/vs/platform/keep/a.ts': 'export const a = 2;\n',
		'src/vs/platform/keep/n.ts': 'export const n = 1;\n',
		'src/vs/platform/removed/r.ts': 'r2\n',
		'src/vs/platform/removed/n.ts': 'new\n',
		'src/vs/platform/newFeature/x.ts': 'export const x = 1;\n',
		'src/vscode-dts/vscode.proposed.foo.d.ts': 'declare module \'vscode\' { }\n',
		'product.json': '{\n\t"nameShort": "Code",\n\t"newField": true\n}\n',
		'package.json': '{\n\t"dependencies": {\n\t\t"x": "1",\n\t\t"y": "2"\n\t}\n}\n',
	});
	repo.commit('release work');
	repo.git('tag', '1.1.0');
	repo.git('checkout', '-q', 'main');
	repo.remove('src/vs/platform/removed');
	repo.write({ [removedSurfacesFile]: '# fork\nsrc/vs/platform/removed/\n' });
	repo.commit('fork: remove the surface');
	return { base, tag: '1.1.0' };
}

suite('upstream merge', () => {

	test('advances the base, merges the tag, deletes the removed surfaces again and reports the rest', () => {
		const repo = createRepo();
		try {
			const { base } = createHistory(repo);
			const preMergeHead = repo.git('rev-parse', 'HEAD');
			const report = runUpstreamMerge(repo.root, '1.1.0', { fetch: false, sign: false });
			const newBase = repo.git('rev-parse', upstreamBaseBranch);
			repo.git('commit', '-q', '-m', 'Merge upstream release tag 1.1.0');
			assert.deepStrictEqual({
				report: { ...report, delta: { ...report.delta } },
				baseParents: repo.git('log', '-1', '--format=%P', upstreamBaseBranch).split(' ').length,
				baseKeepsUpstreamContent: repo.git('show', `${upstreamBaseBranch}:src/vs/platform/removed/r.ts`),
				unmergedAfterRun: repo.git('diff', '--name-only', '--diff-filter=U'),
				mergedSurvivingFile: repo.git('show', 'HEAD:src/vs/platform/keep/a.ts'),
				removedFolderAfterMerge: repo.git('ls-files', 'src/vs/platform/removed'),
				manifestKept: repo.git('ls-files', removedSurfacesFile),
				tagMerged: repo.isAncestor('1.1.0', 'HEAD'),
				forkChangedPathsBefore: repo.git('diff', '--name-only', base, preMergeHead),
				forkChangedPathsAfter: repo.git('diff', '--name-only', upstreamBaseBranch, 'HEAD'),
			}, {
				report: {
					tag: '1.1.0',
					preMergeHead,
					oldBase: base,
					newBase,
					removed: ['src/vs/platform/removed/moved.ts', 'src/vs/platform/removed/n.ts', 'src/vs/platform/removed/r.ts'],
					removedAdditions: ['src/vs/platform/removed/moved.ts', 'src/vs/platform/removed/n.ts'],
					remainingConflicts: [],
					remainingAdditions: ['src/vs/platform/keep/n.ts', 'src/vs/platform/newFeature/x.ts', 'src/vscode-dts/vscode.proposed.foo.d.ts'],
					delta: {
						newFolders: ['src/vs/platform/newFeature/'],
						newProductFields: ['newField'],
						newDependencies: ['y (package.json)'],
						newApiProposals: ['foo'],
					},
				},
				baseParents: 2,
				baseKeepsUpstreamContent: 'r2',
				unmergedAfterRun: '',
				mergedSurvivingFile: 'export const a = 2;',
				removedFolderAfterMerge: '',
				manifestKept: removedSurfacesFile,
				tagMerged: true,
				forkChangedPathsBefore: `${removedSurfacesFile}\nsrc/vs/platform/removed/r.ts`,
				forkChangedPathsAfter: `${removedSurfacesFile}\nsrc/vs/platform/removed/moved.ts\nsrc/vs/platform/removed/n.ts\nsrc/vs/platform/removed/r.ts`,
			});
		} finally {
			fs.rmSync(repo.root, { recursive: true, force: true });
		}
	});

	test('stops before touching anything when the two upstream sides conflict in surviving code', () => {
		const repo = createRepo();
		try {
			createHistory(repo);
			// Upstream main moved past the release cut on the same line the tag changes
			repo.git('checkout', '-q', upstreamBaseBranch);
			repo.write({ 'src/vs/platform/keep/a.ts': 'export const a = 3;\n' });
			const movedBase = repo.commit('upstream main moved on');
			repo.git('checkout', '-q', 'main');
			repo.git('merge', '-q', '--no-edit', upstreamBaseBranch);
			let message = '';
			try {
				runUpstreamMerge(repo.root, '1.1.0', { fetch: false, sign: false });
			} catch (error) {
				message = error instanceof Error ? error.message : String(error);
			}
			assert.deepStrictEqual({
				mentionsFile: message.includes('src/vs/platform/keep/a.ts'),
				mentionsHand: message.includes('by hand'),
				treeClean: repo.git('status', '--porcelain'),
				baseUnchanged: repo.git('rev-parse', upstreamBaseBranch) === movedBase,
				notMerged: repo.isAncestor('1.1.0', 'HEAD'),
			}, {
				mentionsFile: true,
				mentionsHand: true,
				treeClean: '',
				baseUnchanged: true,
				notMerged: false,
			});
		} finally {
			fs.rmSync(repo.root, { recursive: true, force: true });
		}
	});

	test('aborts the merge and keeps the base when a step after the merge fails', () => {
		const repo = createRepo();
		try {
			const { base } = createHistory(repo);
			const head = repo.git('rev-parse', 'HEAD');
			// Signing fails, so advancing the base fails after the tag is merged into the index
			repo.git('config', 'gpg.format', 'openpgp');
			repo.git('config', 'gpg.program', 'false');
			let message = '';
			try {
				runUpstreamMerge(repo.root, '1.1.0', { fetch: false, sign: true });
			} catch (error) {
				message = error instanceof Error ? error.message : String(error);
			}
			assert.deepStrictEqual({
				aborted: message.includes('The merge was aborted'),
				treeClean: repo.git('status', '--porcelain'),
				headUnchanged: repo.git('rev-parse', 'HEAD') === head,
				baseUnchanged: repo.git('rev-parse', upstreamBaseBranch) === base,
				removedFolderStillAbsent: repo.git('ls-files', 'src/vs/platform/removed'),
			}, {
				aborted: true,
				treeClean: '',
				headUnchanged: true,
				baseUnchanged: true,
				removedFolderStillAbsent: '',
			});
		} finally {
			fs.rmSync(repo.root, { recursive: true, force: true });
		}
	});

	test('reuses a base advanced by an earlier run whose merge was aborted', () => {
		const repo = createRepo();
		try {
			const { base } = createHistory(repo);
			const advanced = advanceUpstreamBase(repo.root, '1.1.0', false);
			const report = runUpstreamMerge(repo.root, '1.1.0', { fetch: false, sign: false });
			assert.deepStrictEqual({
				oldBase: report.oldBase,
				newBase: report.newBase,
				baseKept: repo.git('rev-parse', upstreamBaseBranch) === advanced,
				delta: { ...report.delta },
				removed: report.removed,
			}, {
				oldBase: base,
				newBase: advanced,
				baseKept: true,
				delta: {
					newFolders: ['src/vs/platform/newFeature/'],
					newProductFields: ['newField'],
					newDependencies: ['y (package.json)'],
					newApiProposals: ['foo'],
				},
				removed: ['src/vs/platform/removed/moved.ts', 'src/vs/platform/removed/n.ts', 'src/vs/platform/removed/r.ts'],
			});
		} finally {
			fs.rmSync(repo.root, { recursive: true, force: true });
		}
	});

	test('refuses a tag the base already contains from a later sync', () => {
		const repo = createRepo();
		try {
			createHistory(repo);
			// A later tag on top of 1.1.0 was already synced into the base
			repo.git('checkout', '-q', 'release');
			repo.write({ 'src/vs/platform/keep/later.ts': 'export const later = 1;\n' });
			repo.commit('later release work');
			repo.git('tag', '1.2.0');
			repo.git('checkout', '-q', 'main');
			advanceUpstreamBase(repo.root, '1.2.0', false);
			let message = '';
			try {
				runUpstreamMerge(repo.root, '1.1.0', { fetch: false, sign: false });
			} catch (error) {
				message = error instanceof Error ? error.message : String(error);
			}
			assert.deepStrictEqual({ message, treeClean: repo.git('status', '--porcelain') }, {
				message: `The branch ${upstreamBaseBranch} already contains 1.1.0; merge a newer tag.`,
				treeClean: '',
			});
		} finally {
			fs.rmSync(repo.root, { recursive: true, force: true });
		}
	});

	test('refuses a dirty tree, a missing tag, a tag already merged and another branch', () => {
		const repo = createRepo();
		try {
			createHistory(repo);
			const attempt = (tag: string): string => {
				try {
					runUpstreamMerge(repo.root, tag, { fetch: false, sign: false });
					return '';
				} catch (error) {
					return error instanceof Error ? error.message : String(error);
				}
			};
			repo.write({ 'dirty.txt': 'x' });
			const dirty = attempt('1.1.0');
			fs.rmSync(path.join(repo.root, 'dirty.txt'));
			const missing = attempt('9.9.9');
			repo.git('tag', '0.0.1', 'HEAD~1');
			const merged = attempt('0.0.1');
			repo.git('checkout', '-q', '-b', 'feature');
			const branch = attempt('1.1.0');
			assert.deepStrictEqual({ dirty, missing, merged, branch }, {
				dirty: 'The working tree must be clean before an upstream merge.',
				missing: 'The tag 9.9.9 does not exist; run git fetch upstream --tags.',
				merged: 'The tag 0.0.1 is already merged.',
				branch: `The upstream merge runs on main, because it advances ${upstreamBaseBranch}; the current branch is feature.`,
			});
		} finally {
			fs.rmSync(repo.root, { recursive: true, force: true });
		}
	});
});
