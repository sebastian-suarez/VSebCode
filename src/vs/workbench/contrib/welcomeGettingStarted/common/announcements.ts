/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CancellationTokenSource } from '../../../../base/common/cancellation.js';
import { Disposable, toDisposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { asText, IRequestService } from '../../../../platform/request/common/request.js';

/** A plain-text announcement with an external link. */
export interface IWelcomeAnnouncement {
	readonly id: string;
	readonly title: string;
	readonly url: string;
}

/** Validates untrusted feed data and limits the number of displayed announcements. */
export function parseAnnouncements(value: unknown): IWelcomeAnnouncement[] {
	if (!Array.isArray(value)) {
		return [];
	}
	const result: IWelcomeAnnouncement[] = [];
	const ids = new Set<string>();
	for (const item of value) {
		if (!item || typeof item.id !== 'string' || !item.id || typeof item.title !== 'string' || !item.title.trim() || typeof item.url !== 'string') {
			continue;
		}
		try {
			const uri = URI.parse(item.url, true);
			if (!['https', 'http'].includes(uri.scheme) || !uri.authority || uri.authority.includes('@') || ids.has(item.id)) {
				continue;
			}
			ids.add(item.id);
			result.push({ id: item.id, title: item.title, url: uri.toString() });
			if (result.length === 5) {
				break;
			}
		} catch {
			// Ignore malformed entries without hiding the remaining feed.
		}
	}
	return result;
}

/** A page-owned cache, including failures, with cancellation when its page closes. */
export class WelcomeAnnouncements extends Disposable {
	private readonly cancellation = new CancellationTokenSource();
	private request: Promise<IWelcomeAnnouncement[]> | undefined;

	constructor(private readonly requestService: IRequestService, private readonly builtIn: readonly IWelcomeAnnouncement[] = []) {
		super();
		this._register(toDisposable(() => this.cancellation.dispose(true)));
	}

	/** Returns built-in content immediately when online announcements are disabled. */
	get(enabled: boolean): Promise<IWelcomeAnnouncement[]> {
		if (!enabled) {
			return Promise.resolve(this.builtIn.slice(0, 5));
		}
		this.request ??= this.load().catch(() => this.builtIn.slice(0, 5));
		return this.request;
	}

	private async load(): Promise<IWelcomeAnnouncement[]> {
		const response = await this.requestService.request({
			url: 'https://raw.githubusercontent.com/sebastian-suarez/VSebCode/main/announcements-extra.json',
			type: 'GET',
			timeout: 5000,
			callSite: 'welcome.announcements'
		}, this.cancellation.token);
		if (response.res.statusCode !== 200) {
			return this.builtIn.slice(0, 5);
		}
		const text = await asText(response);
		if (!text || text.length > 1024 * 1024) {
			return this.builtIn.slice(0, 5);
		}
		return [...parseAnnouncements(JSON.parse(text)), ...this.builtIn].slice(0, 5);
	}
}
