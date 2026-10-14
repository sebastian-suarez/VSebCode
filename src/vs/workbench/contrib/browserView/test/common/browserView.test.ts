/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { Event } from '../../../../../base/common/event.js';
import { DisposableStore } from '../../../../../base/common/lifecycle.js';
import { upcastPartial } from '../../../../../base/test/common/mock.js';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../../base/test/common/utils.js';
import { browserZoomDefaultIndex, BrowserViewStorageScope, IBrowserViewService, IBrowserViewState } from '../../../../../platform/browserView/common/browserView.js';
import { ILogService } from '../../../../../platform/log/common/log.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../../platform/telemetry/common/telemetry.js';
import { IBrowserZoomService } from '../../common/browserZoomService.js';
import { BrowserViewModel, createBrowserViewEventEmitters } from '../../common/browserView.js';

suite('BrowserViewModel', () => {
	const store = ensureNoDisposablesAreLeakedInTestSuite();

	test('mirrors workbench-owned events before notifying local consumers without subscribing to IPC', () => {
		const eventStore = store.add(new DisposableStore());
		const emitters = createBrowserViewEventEmitters(eventStore);
		const model = store.add(new BrowserViewModel(
			'page', { windowId: 1 }, undefined,
			createInitialState(BrowserViewStorageScope.Global),
			upcastPartial<IBrowserViewService>({
				destroyBrowserView: async () => { },
				setBrowserZoomIndex: async () => { },
			}),
			emitters,
			upcastPartial<ITelemetryService>({}),
			upcastPartial<IStorageService>({}),
			upcastPartial<IBrowserZoomService>({ getEffectiveZoomIndex: () => browserZoomDefaultIndex, onDidChangeZoom: Event.None }),
			upcastPartial<ILogService>({}),
		));
		eventStore.add(Event.once(model.onWillDispose)(() => eventStore.dispose()));
		const received: string[] = [];
		const removed = store.add(model.onDidChangeTitle(() => received.push('removed')));
		removed.dispose();
		store.add(model.onDidNavigate(() => received.push(model.url)));
		store.add(model.onDidChangeTitle(() => received.push(model.title)));
		store.add(model.onDidChangeLoadingState(() => received.push(`loading:${model.loading}`)));
		store.add(model.onDidClose(() => received.push('closed')));
		store.add(model.onDidChangeFocus(() => received.push('unexpected focus')));
		store.add(model.onDidChangeVisibility(() => received.push('unexpected visibility')));
		emitters.onDidNavigate.fire({
			url: 'https://example.com/', title: 'initial', canGoBack: true, canGoForward: false, certificateError: undefined
		});
		emitters.onDidChangeTitle.fire({ title: 'Example' });
		emitters.onDidChangeLoadingState.fire({ loading: false });
		emitters.onDidClose.fire();
		model.dispose();
		emitters.onDidChangeTitle.fire({ title: 'after model disposal' });
		assert.deepStrictEqual({ received, canGoBack: model.canGoBack, titleAfterDisposal: model.title }, {
			received: ['https://example.com/', 'Example', 'loading:false', 'closed'],
			canGoBack: true,
			titleAfterDisposal: 'Example'
		});
	});
});

function createInitialState(storageScope: BrowserViewStorageScope): IBrowserViewState {
	return {
		url: 'https://blocked.example.com/',
		title: '',
		canGoBack: false,
		canGoForward: false,
		loading: false,
		focused: false,
		visible: false,
		isDevToolsOpen: false,
		lastScreenshot: undefined,
		lastFavicon: undefined,
		lastError: undefined,
		certificateError: undefined,
		storageScope,
		storageKeys: {},
		permissions: { origins: {} },
		browserZoomIndex: browserZoomDefaultIndex,
		isRemoteSession: false,
		device: undefined,
	};
}
