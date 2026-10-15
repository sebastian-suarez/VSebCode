/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import { bufferToStream, VSBuffer } from '../../../../../base/common/buffer.js';
import { URI } from '../../../../../base/common/uri.js';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../../base/test/common/utils.js';
import { FileService } from '../../../../../platform/files/common/fileService.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { InMemoryFileSystemProvider } from '../../../../../platform/files/common/inMemoryFilesystemProvider.js';
import { TestInstantiationService } from '../../../../../platform/instantiation/test/common/instantiationServiceMock.js';
import { NullLogService } from '../../../../../platform/log/common/log.js';
import { IProductService } from '../../../../../platform/product/common/productService.js';
import { IRequestContext, IRequestOptions } from '../../../../../base/parts/request/common/request.js';
import { IRequestService } from '../../../../../platform/request/common/request.js';
import { IUriIdentityService } from '../../../../../platform/uriIdentity/common/uriIdentity.js';
import { UriIdentityService } from '../../../../../platform/uriIdentity/common/uriIdentityService.js';
import { UserDataProfileImportExportService } from '../../browser/userDataProfileImportExportService.js';

const PROFILE = { name: 'Team' };

suite('UserDataProfileImportExportService', () => {

	const disposables = ensureNoDisposablesAreLeakedInTestSuite();
	let requestedUrls: string[];
	let testObject: UserDataProfileImportExportService;

	setup(async () => {
		requestedUrls = [];
		const instantiationService = disposables.add(new TestInstantiationService());
		const fileService = disposables.add(new FileService(new NullLogService()));
		disposables.add(fileService.registerProvider('file', disposables.add(new InMemoryFileSystemProvider())));
		await fileService.writeFile(URI.file('/profiles/team.code-profile'), VSBuffer.fromString(JSON.stringify(PROFILE)));

		instantiationService.stub(IFileService, fileService);
		instantiationService.stub(IUriIdentityService, disposables.add(new UriIdentityService(fileService)));
		instantiationService.stub(IProductService, { urlProtocol: 'vsebcode' });
		instantiationService.stub(IRequestService, {
			async request(options: IRequestOptions): Promise<IRequestContext> {
				requestedUrls.push(options.url ?? '');
				return { res: { headers: {}, statusCode: 200 }, stream: bufferToStream(VSBuffer.fromString(JSON.stringify(PROFILE))) };
			}
		});
		testObject = disposables.add(instantiationService.createInstance(UserDataProfileImportExportService));
	});

	test('fetches HTTP(S) URLs, including hosts whose name starts with profile-, and resolves profile-file links locally', async () => {
		const resolve = async (uri: string) => (await testObject.resolveProfileTemplate(URI.parse(uri)))?.name ?? null;
		assert.deepStrictEqual({
			https: await resolve('https://example.org/team.code-profile'),
			profileNamedHost: await resolve('https://profile-share.example.org/team.code-profile'),
			profileFileLink: await resolve(`vsebcode://profile-file/${encodeURIComponent('file:///profiles/team.code-profile')}`),
			otherProfileLink: await resolve('vsebcode://profile-github/abc123'),
			requestedUrls,
		}, {
			https: 'Team',
			profileNamedHost: 'Team',
			profileFileLink: 'Team',
			otherProfileLink: null,
			requestedUrls: ['https://example.org/team.code-profile', 'https://profile-share.example.org/team.code-profile'],
		});
	});
});
