/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { Dimension } from '../../../base/browser/dom.js';
import { invalidateFontMetrics } from '../../../base/common/font.js';
import { toDisposable } from '../../../base/common/lifecycle.js';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../base/test/common/utils.js';
import { SuggestEnabledInput } from '../../contrib/codeEditor/browser/suggestEnabledInput/suggestEnabledInput.js';
import { CallStackFrame, CallStackWidget, SkippedCallFrames } from '../../contrib/debug/browser/callStackWidget.js';
import { workbenchInstantiationService } from './workbenchTestServices.js';
import { IUserInteractionService, MockUserInteractionService } from '../../../platform/userInteraction/browser/userInteractionService.js';

suite('Regional font controls', () => {
	const store = ensureNoDisposablesAreLeakedInTestSuite();

	test('suggest input adopts its region font after construction and moving', () => {
		const container = document.createElement('div');
		container.style.setProperty('--monaco-ui-font-size', '26px');
		store.add(toDisposable(() => container.remove()));
		const instantiationService = workbenchInstantiationService(undefined, store);
		instantiationService.stub(IUserInteractionService, new MockUserInteractionService());
		const input = store.add(instantiationService.createInstance(SuggestEnabledInput, 'font-test', container, { provideResults: () => [] }, 'Search', 'font-test:search', {}));
		document.body.appendChild(container);
		input.layout(new Dimension(300, 40));
		assert.deepStrictEqual([input.inputWidget.getRawOptions().fontSize, input.inputWidget.getRawOptions().lineHeight], [26, 40]);
		container.style.setProperty('--monaco-ui-font-size', '13px');
		input.layout(new Dimension(300, 20));
		assert.deepStrictEqual([input.inputWidget.getRawOptions().fontSize, input.inputWidget.getRawOptions().lineHeight], [13, 20]);
	});

	test('call frames and skipped frames share regional sizing after attachment and changes', async () => {
		const container = document.createElement('div');
		container.style.setProperty('--monaco-ui-font-size', '26px');
		store.add(toDisposable(() => container.remove()));
		const instantiationService = workbenchInstantiationService(undefined, store);
		const widget = store.add(instantiationService.createInstance(CallStackWidget, container, undefined));
		widget.setFrames([new CallStackFrame('First'), new SkippedCallFrames('Skipped', async () => [])]);
		document.body.appendChild(container);
		widget.layout(200, 300);
		assert.deepStrictEqual(Array.from(container.querySelectorAll<HTMLElement>('.monaco-list-row'), row => row.getBoundingClientRect().height), [48, 48]);
		container.style.setProperty('--monaco-ui-font-size', '13px');
		invalidateFontMetrics();
		await Promise.resolve();
		assert.deepStrictEqual(Array.from(container.querySelectorAll<HTMLElement>('.monaco-list-row'), row => row.getBoundingClientRect().height), [24, 24]);
	});
});
