/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import fs from 'fs';
import path from 'path';

// Some dependencies ship their native binary in a per-platform package that is
// declared as an *optional* dependency of a small base package — e.g.
// `@openai/codex` and `@anthropic-ai/claude-agent-sdk` are thin launchers and
// the real binaries live in `@openai/codex-<platform>-<arch>` /
// `@anthropic-ai/claude-agent-sdk-<platform>-<arch>`. `npm install` / `npm ci`
// do NOT fail when an optional dependency cannot be installed, so a transient
// hiccup can leave the base package present while the per-platform package is
// missing (see https://github.com/microsoft/vscode/pull/323881).
//
// `findMissingNativeOptionalDep` detects this. The agent-SDK producer
// (build/agent-sdk/package.ts) runs it after its scratch `npm ci` so a
// binary-less tarball is never built.

/**
 * Returns the name of the required per-platform package that is missing from
 * `nodeModulesDir`, or `undefined` when nothing is wrong.
 *
 * A base package (e.g. `@openai/codex`) ships its native binary in a
 * per-platform optional dependency named `<base>-<target>` (e.g.
 * `@openai/codex-linux-x64`, `@anthropic-ai/claude-agent-sdk-linux-x64-musl`).
 * npm does not fail when an optional dependency cannot be installed, so this
 * detects a base package that ended up installed without its matching native
 * package.
 *
 * `target` is the `<platform>-<arch>[-<libc>]` suffix — e.g. `darwin-arm64`,
 * `linux-x64`, `linux-x64-musl`.
 *
 * Only enforced when the base package itself is installed; if it is not, the
 * dependency simply was not requested here and there is nothing to verify.
 */
export function findMissingNativeOptionalDep(nodeModulesDir: string, basePackage: string, target: string): string | undefined {
	if (!fs.existsSync(path.join(nodeModulesDir, basePackage))) {
		return undefined;
	}
	const platformPackage = `${basePackage}-${target}`;
	if (!fs.existsSync(path.join(nodeModulesDir, platformPackage))) {
		return platformPackage;
	}
	return undefined;
}
