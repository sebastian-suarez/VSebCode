/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { CodeWindow } from '../../../../../base/browser/window.js';
import { bufferToStream, VSBuffer } from '../../../../../base/common/buffer.js';
import { toDisposable } from '../../../../../base/common/lifecycle.js';
import { IRequestContext, IRequestOptions } from '../../../../../base/parts/request/common/request.js';
import { mock } from '../../../../../base/test/common/mock.js';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../../base/test/common/utils.js';
import { IMenuService } from '../../../../../platform/actions/common/actions.js';
import { IClipboardService } from '../../../../../platform/clipboard/common/clipboardService.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IDialogService } from '../../../../../platform/dialogs/common/dialogs.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { TestInstantiationService } from '../../../../../platform/instantiation/test/common/instantiationServiceMock.js';
import { ILogService, NullLogService } from '../../../../../platform/log/common/log.js';
import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
import { IRequestService } from '../../../../../platform/request/common/request.js';
import { IAuxiliaryWindow, IAuxiliaryWindowService } from '../../../../services/auxiliaryWindow/browser/auxiliaryWindowService.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { IHostService } from '../../../../services/host/browser/host.js';
import { IGitHubUploadService } from '../../browser/githubUploadService.js';
import { IssueFormService } from '../../browser/issueFormService.js';
import { IssueWebReporter } from '../../browser/issueReporterService.js';

suite('IssueFormService', () => {
	const store = ensureNoDisposablesAreLeakedInTestSuite();

	function createInstantiationService() {
		const instantiationService = store.add(new TestInstantiationService());
		instantiationService.stub(IMenuService, {});
		instantiationService.stub(IClipboardService, {});
		instantiationService.stub(IContextKeyService, {});
		instantiationService.stub(IDialogService, {});
		instantiationService.stub(IFileService, {});
		instantiationService.stub(ILogService, {});
		instantiationService.stub(IOpenerService, {});
		instantiationService.stub(IEditorService, {});
		instantiationService.stub(IHostService, {});
		instantiationService.stub(IGitHubUploadService, {});
		instantiationService.stub(IRequestService, {});
		return instantiationService;
	}

	function createResponse(body: string, statusCode = 200): IRequestContext {
		return { res: { statusCode, headers: {} }, stream: bufferToStream(VSBuffer.fromString(body)) };
	}

	function createSearchService(request: (options: IRequestOptions) => Promise<IRequestContext>) {
		const instantiationService = createInstantiationService();
		const logService = new NullLogService();
		instantiationService.stub(IRequestService, { request: options => request(options) });
		instantiationService.stub(ILogService, logService);
		return store.add(instantiationService.createInstance(IssueFormService));
	}

	test('search sends an anonymous request with the encoded public query', async () => {
		const requests: { query: string | null; authenticated: boolean }[] = [];
		const service = createSearchService(async options => {
			requests.push({
				query: new URL(String(options.url)).searchParams.get('q'),
				authenticated: Object.keys(options.headers ?? {}).some(header => header.toLowerCase() === 'authorization'),
			});
			return createResponse('{"items":[{"html_url":"https://github.com/owner/repo/issues/1","title":"Issue title","state":"open"}]}');
		});
		const query = 'title & labels #1';
		const results = await service.searchGitHubIssues('owner/repo', query, new AbortController().signal);
		assert.deepStrictEqual({ requests, results }, {
			requests: [{ query: `is:issue repo:owner/repo ${query}`, authenticated: false }],
			results: [{ html_url: 'https://github.com/owner/repo/issues/1', title: 'Issue title', state: 'open' }],
		});
	});

	test('malformed and failed searches remain failures rather than empty successful results', async () => {
		let calls = 0;
		const service = createSearchService(async () => ++calls === 1
			? createResponse('{"message":"Not Found"}', 404)
			: createResponse('{"items":"not-an-array"}'));
		await assert.rejects(service.searchGitHubIssues('owner/repo', 'first', new AbortController().signal), /404/);
		await assert.rejects(service.searchGitHubIssues('owner/repo', 'second', new AbortController().signal), /malformed/);
	});

	test('cancelled and disposed reporters do not issue search requests', async () => {
		let calls = 0;
		const service = createSearchService(async () => { calls++; return createResponse('{"items":[]}'); });
		const controller = new AbortController();
		const reason = new Error('cancelled');
		controller.abort(reason);
		await assert.rejects(service.searchGitHubIssues('owner/repo', 'query', controller.signal), error => error === reason);
		service.dispose();
		await assert.rejects(service.searchGitHubIssues('owner/repo', 'query', new AbortController().signal), /disposed/);
		assert.strictEqual(calls, 0);
	});

	test('disposes the legacy web reporter when its auxiliary window closes', async () => {
		const instantiationService = createInstantiationService();
		const iframe = document.createElement('iframe');
		document.body.appendChild(iframe);
		store.add(toDisposable(() => iframe.remove()));
		const targetWindow = iframe.contentWindow as CodeWindow;
		const events: string[] = [];
		instantiationService.stub(IAuxiliaryWindowService, {
			open: async () => new class extends mock<IAuxiliaryWindow>() {
				override readonly window = targetWindow;
				override readonly container = document.createElement('div');
				override readonly whenStylesHaveLoaded = Promise.resolve();
				override dispose(): void { events.push('window disposed'); }
			}()
		});
		instantiationService.stubInstance(IssueWebReporter, {
			render: () => { events.push('reporter rendered'); },
			dispose: () => { events.push('reporter disposed'); }
		});
		const service = store.add(instantiationService.createInstance(IssueFormService));
		await service.openAuxIssueReporterLegacy({
			styles: {}, zoomLevel: 0, enabledExtensions: [], restrictedMode: false,
			isInstallationPure: true, githubAccessToken: '',
		});
		targetWindow.dispatchEvent(new Event('beforeunload'));
		assert.deepStrictEqual(events, ['reporter rendered', 'window disposed', 'reporter disposed']);
	});
});
