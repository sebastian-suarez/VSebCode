/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { getElementFontMetric } from '../../browser/font.js';
import { onDidChangeFontMetrics, updateSidebarSize } from '../../common/font.js';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../common/utils.js';

suite('Inherited UI font metrics', () => {
	const store = ensureNoDisposablesAreLeakedInTestSuite();

	test('controls follow independently sized regions and moving between them', () => {
		const root = document.body.appendChild(document.createElement('div'));
		try {
			const sidebar = root.appendChild(document.createElement('div'));
			const panel = root.appendChild(document.createElement('div'));
			sidebar.style.setProperty('--monaco-ui-font-size', '13px');
			panel.style.setProperty('--monaco-ui-font-size', '26px');
			const control = sidebar.appendChild(document.createElement('div'));
			assert.strictEqual(getElementFontMetric(control, 22), 22);
			panel.appendChild(control);
			assert.strictEqual(getElementFontMetric(control, 22), 44);
			panel.style.setProperty('--monaco-ui-font-size', '19.5px');
			assert.strictEqual(getElementFontMetric(control, 22), 33);
		} finally {
			root.remove();
		}
	});

	test('reapplying unchanged metrics does not invalidate controls', () => {
		let changes = 0;
		store.add(onDidChangeFontMetrics(() => changes++));
		try {
			updateSidebarSize(26);
			updateSidebarSize(26);
			assert.strictEqual(changes, 1);
		} finally {
			updateSidebarSize(13);
		}
	});
});
