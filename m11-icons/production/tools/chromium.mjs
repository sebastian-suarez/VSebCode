// The one place that answers "which browser binary do we rasterise with".
//
// Assembly v2 fix. The ms-playwright `chromium-<build>` download is now Chrome for
// Testing 147, which dropped the old `--headless --screenshot / --dump-dom` flags:
// every tool that shelled out to the .app hung forever. The sibling
// `chromium_headless_shell-<build>` download is the real headless shell and still
// honours them (0.39 s vs infinite), so it is preferred and the .app is only a
// fallback for caches that predate the split.
//
// Consumed by contact.mjs, contact-full.mjs, raster.mjs and pixelproof.mjs.

import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const CACHE = join(homedir(), 'Library/Caches/ms-playwright');

function builds(prefix) {
	if (!existsSync(CACHE)) { return []; }
	return readdirSync(CACHE)
		.filter(d => new RegExp(`^${prefix}-\\d+$`).test(d))
		.sort((a, b) => +b.split('-').pop() - +a.split('-').pop());
}

// Preferred: the headless shell, whose binary path is fixed.
function headlessShell() {
	for (const b of builds('chromium_headless_shell')) {
		const bin = join(CACHE, b, 'chrome-headless-shell-mac-arm64', 'chrome-headless-shell');
		if (existsSync(bin)) { return bin; }
	}
	return null;
}

// Fallback: the full .app bundle, whose name varies by build.
function fullApp() {
	for (const b of builds('chromium')) {
		const macos = join(CACHE, b, 'chrome-mac-arm64');
		if (!existsSync(macos)) { continue; }
		for (const app of readdirSync(macos).filter(f => f.endsWith('.app'))) {
			const bin = join(macos, app, 'Contents/MacOS', app.replace(/\.app$/, ''));
			if (existsSync(bin)) { return bin; }
		}
	}
	return null;
}

export function chromium() {
	const bin = headlessShell() || fullApp();
	if (!bin) { throw new Error(`no Playwright chromium under ${CACHE}`); }
	return bin;
}
