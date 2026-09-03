#!/usr/bin/env node
// shot.mjs — render an HTML file to PNG with the headless shell (chromium.mjs
// picks the binary that still honours --screenshot).
//
//   node tools/shot.mjs page.html out.png 1200 900 [scale]

import { execFileSync } from 'node:child_process';
import { chromium } from '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/tools/chromium.mjs';
import { resolve } from 'node:path';

const [html, png, w = '1200', h = '900', scale = '2'] = process.argv.slice(2);
execFileSync(chromium(), ['--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
	'--allow-file-access-from-files', '--virtual-time-budget=15000',
	`--force-device-scale-factor=${scale}`, `--window-size=${w},${h}`,
	`--screenshot=${resolve(png)}`, `file://${resolve(html)}`], { stdio: 'inherit' });
