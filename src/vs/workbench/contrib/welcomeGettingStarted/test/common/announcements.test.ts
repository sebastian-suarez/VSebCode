/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { VSBuffer, bufferToStream } from '../../../../../base/common/buffer.js';
import { CancellationToken } from '../../../../../base/common/cancellation.js';
import { mock } from '../../../../../base/test/common/mock.js';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../../base/test/common/utils.js';
import { IRequestContext, IRequestOptions } from '../../../../../base/parts/request/common/request.js';
import { IRequestService } from '../../../../../platform/request/common/request.js';
import { parseAnnouncements, WelcomeAnnouncements } from '../../common/announcements.js';

suite('Welcome announcements', () => {
	const store = ensureNoDisposablesAreLeakedInTestSuite();

	test('validates links, de-duplicates IDs and caps remote items', () => {
		const good = { id: 'one', title: '<b>Plain text</b>', url: 'https://example.org/news' };
		assert.deepStrictEqual(parseAnnouncements([null, good, good, { ...good, id: 'two', url: 'command:bad' }, { ...good, id: 'three', url: 'https://user@example.org' }]), [good]);
		assert.strictEqual(parseAnnouncements(Array.from({ length: 10 }, (_, index) => ({ ...good, id: String(index) }))).length, 5);
	});

	test('disabled makes no requests; concurrent calls and re-enabling reuse the page cache', async () => {
		let count = 0;
		let token: CancellationToken | undefined;
		const remote = [{ id: 'remote', title: 'Remote', url: 'https://example.org/' }];
		const builtIn = [{ id: 'local', title: 'Local', url: 'https://example.org/local' }];
		const requests = new class extends mock<IRequestService>() {
			override async request(_options: IRequestOptions, cancellation: CancellationToken): Promise<IRequestContext> {
				count++;
				token = cancellation;
				return { res: { statusCode: 200, headers: {} }, stream: bufferToStream(VSBuffer.fromString(JSON.stringify(remote))) };
			}
		};
		const page = store.add(new WelcomeAnnouncements(requests, builtIn));
		assert.deepStrictEqual(await page.get(false), builtIn);
		assert.strictEqual(count, 0);
		const result = await Promise.all([page.get(true), page.get(true)]);
		await page.get(false);
		await page.get(true);
		assert.deepStrictEqual([count, ...result], [1, [...remote, ...builtIn], [...remote, ...builtIn]]);
		page.dispose();
		assert.strictEqual(token?.isCancellationRequested, true);
		await store.add(new WelcomeAnnouncements(requests)).get(true);
		assert.strictEqual(count, 2);
	});

	test('a failed request is cached for this page', async () => {
		let count = 0;
		const requests = new class extends mock<IRequestService>() {
			override async request(): Promise<IRequestContext> {
				count++;
				throw new Error('offline');
			}
		};
		const page = store.add(new WelcomeAnnouncements(requests));
		await page.get(true);
		await page.get(true);
		assert.deepStrictEqual([count, await page.get(true)], [1, []]);
	});
});
