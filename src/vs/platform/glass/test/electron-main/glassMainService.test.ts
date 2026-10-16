/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import assert from 'assert';
import type electron from 'electron';
import { Emitter } from '../../../../base/common/event.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../base/test/common/utils.js';
import { NullLogService } from '../../../log/common/log.js';
import { IWindowSettings } from '../../../window/common/window.js';
import { IGlassOptions } from '../../common/glass.js';
import { GlassMainService } from '../../electron-main/glassMainService.js';

interface IFakeModule {
	supported: boolean;
	attached: IGlassOptions[];
	updated: { id: number; options: IGlassOptions }[];
	detached: number[];
	isSupported(): boolean;
	attach(handle: Buffer, options?: IGlassOptions): number;
	update(id: number, options: IGlassOptions): boolean;
	detach(id: number): boolean;
}

function fakeModule(supported = true): IFakeModule {
	return {
		supported,
		attached: [],
		updated: [],
		detached: [],
		isSupported() { return this.supported; },
		attach(_handle, options) { this.attached.push(options ?? {}); return this.attached.length; },
		update(id, options) { this.updated.push({ id, options }); return true; },
		detach(id) { this.detached.push(id); return true; }
	};
}

class TestGlassMainService extends GlassMainService {

	readonly nativeTheme = new Emitter<void>();
	reducedTransparency = false;
	windows: electron.BrowserWindow[] = [];

	constructor(private readonly fake: IFakeModule | Error, private readonly macintosh = true) {
		super(new NullLogService());
	}

	protected override async loadModule() {
		if (this.fake instanceof Error) {
			throw this.fake;
		}
		return this.fake;
	}

	protected override isMacintosh(): boolean { return this.macintosh; }
	protected override prefersReducedTransparency(): boolean { return this.reducedTransparency; }
	protected override onDidChangeNativeTheme(listener: () => void): IDisposable { return this.nativeTheme.event(listener); }
	protected override getAllWindows(): electron.BrowserWindow[] { return this.windows; }
}

function fakeWindow(id: number) {
	const closed: (() => void)[] = [];
	const backgrounds: string[] = [];
	const window = {
		id,
		backgrounds,
		isDestroyed: () => false,
		getNativeWindowHandle: () => Buffer.alloc(8),
		once: (event: string, listener: () => void) => { if (event === 'closed') { closed.push(listener); } },
		setBackgroundColor: (color: string) => { backgrounds.push(color); },
		close: () => closed.forEach(listener => listener())
	};
	return window as unknown as electron.BrowserWindow & typeof window;
}

suite('GlassMainService', () => {

	const store = ensureNoDisposablesAreLeakedInTestSuite();

	const settings = (glass: boolean | undefined, nativeTabs = false) => ({ glass, nativeTabs } as unknown as IWindowSettings);

	test('is unavailable until initialized, off macOS and without system support', async () => {
		const service = store.add(new TestGlassMainService(fakeModule()));
		assert.strictEqual(service.isAvailable, false);
		assert.strictEqual(await service.initialize(), true);
		assert.strictEqual(service.isAvailable, true);

		const linux = store.add(new TestGlassMainService(fakeModule(), false));
		assert.strictEqual(await linux.initialize(), false);

		const unsupported = store.add(new TestGlassMainService(fakeModule(false)));
		assert.strictEqual(await unsupported.initialize(), false);
		assert.strictEqual(unsupported.isAvailable, false);
	});

	test('a module that fails to load leaves the service unavailable without throwing', async () => {
		const service = store.add(new TestGlassMainService(new Error('dlopen failed')));
		assert.strictEqual(await service.initialize(), false);
		assert.strictEqual(service.isAvailable, false);
		assert.strictEqual(service.shouldUseGlass(settings(true), false, undefined), false);
	});

	test('the creation gate needs the setting, a custom title bar, no native tabs and no reduced transparency, by preference or setting', async () => {
		const service = store.add(new TestGlassMainService(fakeModule()));
		assert.strictEqual(service.shouldUseGlass(settings(true), false, undefined), false, 'before initialize');
		await service.initialize();
		assert.deepStrictEqual([
			service.shouldUseGlass(settings(true), false, undefined),
			service.shouldUseGlass(undefined, false, undefined),
			service.shouldUseGlass(settings(false), false, undefined),
			service.shouldUseGlass(settings(true), true, undefined),
			service.shouldUseGlass(settings(true, true), false, undefined),
		], [true, true, false, false, false]);
		service.reducedTransparency = true;
		assert.strictEqual(service.shouldUseGlass(settings(true), false, undefined), false);
		service.reducedTransparency = false;
		assert.deepStrictEqual([
			service.shouldUseGlass(settings(true), false, 'on'),
			service.shouldUseGlass(settings(true), false, 'off'),
			service.shouldUseGlass(settings(true), false, 'auto'),
		], [false, true, true]);
	});

	test('attach records the layer once per window and releases it when the window closes', async () => {
		const module = fakeModule();
		const service = store.add(new TestGlassMainService(module));
		await service.initialize();
		const window = fakeWindow(1);
		assert.strictEqual(service.attach(window, { style: 'regular', tintColor: '#18181899' }, '#1e1e1e'), true);
		assert.strictEqual(service.attach(window, { style: 'clear' }, '#1e1e1e'), true, 'a second attach keeps the existing layer');
		assert.deepStrictEqual(module.attached, [{ style: 'regular', tintColor: '#18181899' }]);
		assert.strictEqual(service.isGlassWindow(window), true);
		assert.strictEqual(service.update(window, { tintColor: '#00000000' }), true);
		assert.deepStrictEqual(module.updated, [{ id: 1, options: { tintColor: '#00000000' } }]);
		const detached: number[] = [];
		store.add(service.onDidDetach(id => detached.push(id)));
		assert.strictEqual(service.update(window, { hidden: true }), true);
		assert.strictEqual(service.isGlassHidden(window), true);
		assert.strictEqual(service.update(window, { tintColor: '#000000ff' }), true, 'an update without hidden keeps the state');
		assert.strictEqual(service.isGlassHidden(window), true);
		window.close();
		assert.deepStrictEqual(module.detached, [1], 'the native entry goes with the window');
		assert.deepStrictEqual(detached, [1], 'and the loss is announced once');
		assert.strictEqual(service.isGlassHidden(window), false);
		assert.strictEqual(service.isGlassWindow(window), false);
		assert.strictEqual(service.update(window, { tintColor: '#ffffffff' }), false);
		window.close();
		assert.deepStrictEqual(module.detached, [1], 'a second close releases nothing');
	});

	test('revealGlass and coverGlass paint a glass window only, with the fallback color kept current', async () => {
		const service = store.add(new TestGlassMainService(fakeModule()));
		await service.initialize();
		const glass = fakeWindow(1);
		const opaque = fakeWindow(2);
		service.attach(glass, {}, '#1e1e1e');
		service.revealGlass(glass);
		service.revealGlass(opaque);
		service.coverGlass(glass);
		service.setFallbackBackgroundColor(glass, '#f3f3f3');
		service.setFallbackBackgroundColor(opaque, '#f3f3f3');
		service.coverGlass(glass);
		service.coverGlass(opaque);
		service.update(glass, { hidden: true });
		service.update(glass, { tintColor: '#000000ff' });
		service.update(glass, { hidden: false });
		assert.deepStrictEqual([glass.backgrounds, opaque.backgrounds], [['#00000000', '#1e1e1e', '#f3f3f3', '#f3f3f3', '#00000000'], []]);
		service.detach(glass);
		service.revealGlass(glass);
		service.coverGlass(glass);
		assert.deepStrictEqual(glass.backgrounds, ['#00000000', '#1e1e1e', '#f3f3f3', '#f3f3f3', '#00000000'], 'a released layer paints nothing');
	});

	test('attach reports failure when the module returns no layer', async () => {
		const module = fakeModule();
		module.attach = () => -1;
		const service = store.add(new TestGlassMainService(module));
		await service.initialize();
		const window = fakeWindow(2);
		assert.strictEqual(service.attach(window, {}, '#1e1e1e'), false);
		assert.strictEqual(service.isGlassWindow(window), false);
	});

	test('reduced transparency turning on detaches every layer and paints the fallback color', async () => {
		const module = fakeModule();
		const service = store.add(new TestGlassMainService(module));
		await service.initialize();
		const first = fakeWindow(1);
		const second = fakeWindow(2);
		service.windows = [first, second];
		service.attach(first, {}, '#111111');
		service.attach(second, {}, '#222222');
		service.nativeTheme.fire(); // not reduced yet: nothing happens
		assert.deepStrictEqual(module.detached, []);
		const detached: number[] = [];
		store.add(service.onDidDetach(id => detached.push(id)));
		service.setFallbackBackgroundColor(second, '#333333');
		service.reducedTransparency = true;
		service.nativeTheme.fire();
		assert.deepStrictEqual(module.detached, [1, 2]);
		assert.deepStrictEqual(detached, [1, 2]);
		assert.deepStrictEqual([first.backgrounds, second.backgrounds], [['#111111'], ['#333333']]);
		assert.deepStrictEqual([service.isGlassWindow(first), service.isGlassWindow(second)], [false, false]);
	});
});
