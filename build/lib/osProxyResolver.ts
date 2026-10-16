/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as path from 'path';
import { ensureNpmPackage, type EnsureNpmPackageOptions } from './npmPackage.ts';

// The musl variants are never selected as a target, but must be listed so they are excluded from packaging.
export const osProxyResolverPlatforms = [
	'darwin-arm64', 'darwin-x64',
	'linux-arm-gnueabihf', 'linux-arm64-gnu', 'linux-arm64-musl', 'linux-loong64-gnu', 'linux-ppc64le-gnu', 'linux-riscv64-gnu', 'linux-x64-gnu', 'linux-x64-musl',
	'win32-arm64-msvc', 'win32-x64-msvc',
];

function toOSProxyResolverPlatform(platform: string, arch: string): string | undefined {
	switch (platform) {
		case 'darwin':
			return arch === 'arm64' || arch === 'x64' ? `darwin-${arch}` : undefined;
		case 'linux':
			switch (arch) {
				case 'arm':
				case 'armhf': return 'linux-arm-gnueabihf';
				case 'arm64': return 'linux-arm64-gnu';
				case 'loong64': return 'linux-loong64-gnu';
				case 'ppc64le': return 'linux-ppc64le-gnu';
				case 'riscv64': return 'linux-riscv64-gnu';
				case 'x64': return 'linux-x64-gnu';
			}
			return undefined;
		case 'win32':
			return arch === 'arm64' || arch === 'x64' ? `win32-${arch}-msvc` : undefined;
	}
	return undefined;
}

export function getOSProxyResolverPlatformFiles(platform: string, arch: string, nodeModulesRoot = 'node_modules'): string[] {
	const target = toOSProxyResolverPlatform(platform, arch);
	return target ? [path.posix.join(nodeModulesRoot, '@vscodium', `os-proxy-resolver-${target}`, '**')] : [];
}

export function getOSProxyResolverExcludeFilter(platform: string, arch: string): string[] {
	const target = toOSProxyResolverPlatform(platform, arch);
	return [
		'**',
		...osProxyResolverPlatforms
			.filter(candidate => candidate !== target)
			.map(candidate => `!**/node_modules/@vscodium/os-proxy-resolver-${candidate}/**`),
	];
}

export function ensureOSProxyResolverPlatformPackage(platform: string, arch: string, nodeModulesRoot = 'node_modules', options: EnsureNpmPackageOptions = {}): void {
	const target = toOSProxyResolverPlatform(platform, arch);
	if (target) {
		ensureNpmPackage(`@vscodium/os-proxy-resolver-${target}`, nodeModulesRoot, options);
	}
}
