/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import electron from 'electron';
import { createRequire } from 'module';
import { Emitter, Event } from '../../../base/common/event.js';
import { Disposable, IDisposable } from '../../../base/common/lifecycle.js';
import { isMacintosh } from '../../../base/common/platform.js';
import { createDecorator } from '../../instantiation/common/instantiation.js';
import { ILogService } from '../../log/common/log.js';
import { IWindowSettings } from '../../window/common/window.js';
import { IGlassOptions } from '../common/glass.js';

export const IGlassMainService = createDecorator<IGlassMainService>('glassMainService');

/**
 * Owns the native Liquid Glass layers of the main windows: loads the `@vsebcode/glass` module
 * once, decides whether a new window may use glass and keeps the layers of the windows that
 * do. The layer sits behind the web contents, so a glass window is created transparent and the
 * renderer paints everything except the side bar opaquely.
 */
export interface IGlassMainService {

	readonly _serviceBrand: undefined;

	/**
	 * Loads the native module. Resolves to whether glass can be attached in this process; a
	 * failure is logged once and leaves the service unavailable. Must complete before the first
	 * window is created.
	 */
	initialize(): Promise<boolean>;

	/** Whether the native module loaded and the system supports Liquid Glass. */
	readonly isAvailable: boolean;

	/**
	 * Fires with the window id when a window's layer goes away: the window closed, or the OS
	 * reduced-transparency preference turned on while it lived. The renderer of a living window
	 * paints its side bar opaque again on it.
	 */
	readonly onDidDetach: Event<number>;

	/**
	 * Whether a main window created now uses glass: macOS, the `window.glass` setting on, a
	 * custom title bar, no native tabs, neither the OS reduced-transparency preference nor the
	 * `workbench.reduceTransparency` setting (`reduceTransparency`) forcing opacity, and the
	 * module available.
	 */
	shouldUseGlass(windowSettings: IWindowSettings | undefined, hasNativeTitlebar: boolean, reduceTransparency: string | undefined): boolean;

	/**
	 * Attaches a glass layer behind the window's web contents. Returns whether the layer exists.
	 * The window keeps its opaque background color until `revealGlass`; `fallbackBackgroundColor`
	 * is the opaque color `coverGlass` paints and the color the window keeps when the layer has to
	 * go away while the window lives (the OS reduced-transparency preference turned on). A closed
	 * window releases its layer.
	 */
	attach(window: electron.BrowserWindow, options: IGlassOptions, fallbackBackgroundColor: string): boolean;

	/**
	 * Clears the opaque background of a glass window so the layer shows through the transparent
	 * parts of its document. The renderer asks for it once its splash is painted, so the window
	 * never shows bare glass; a window without a layer is left alone.
	 */
	revealGlass(window: electron.BrowserWindow): void;

	/** Paints the fallback color again, before a glass window loads a new document. */
	coverGlass(window: electron.BrowserWindow): void;

	/** Keeps the fallback color in step with the theme (the window background a glass window does not paint). */
	setFallbackBackgroundColor(window: electron.BrowserWindow, color: string): void;

	/** Whether the window's layer is currently hidden (the renderer paints its side bar opaque). */
	isGlassHidden(window: electron.BrowserWindow): boolean;

	/**
	 * Changes the options of the window's layer. Returns false when the window has none. Hiding
	 * the layer paints the fallback color behind the page again, showing it clears it.
	 */
	update(window: electron.BrowserWindow, options: IGlassOptions): boolean;

	/** Removes the window's layer, if any. */
	detach(window: electron.BrowserWindow): void;

	/** Whether the window currently has a glass layer. */
	isGlassWindow(window: electron.BrowserWindow): boolean;
}

interface IGlassModule {
	isSupported(): boolean;
	attach(handle: Buffer, options?: IGlassOptions): number;
	update(id: number, options: IGlassOptions): boolean;
	detach(id: number): boolean;
}

interface IGlassLayer {
	readonly id: number;
	fallbackBackgroundColor: string;
	hidden: boolean;
}

export class GlassMainService extends Disposable implements IGlassMainService {

	declare readonly _serviceBrand: undefined;

	private readonly _onDidDetach = this._register(new Emitter<number>());
	readonly onDidDetach = this._onDidDetach.event;

	private module: IGlassModule | undefined;
	private initialization: Promise<boolean> | undefined;
	private readonly layers = new Map<number /* window id */, IGlassLayer>();

	constructor(
		@ILogService private readonly logService: ILogService
	) {
		super();
	}

	get isAvailable(): boolean {
		return this.module?.isSupported() === true;
	}

	initialize(): Promise<boolean> {
		if (!this.initialization) {
			this.initialization = this.doInitialize();
		}
		return this.initialization;
	}

	private async doInitialize(): Promise<boolean> {
		if (!this.isMacintosh()) {
			return false;
		}
		try {
			const module = await this.loadModule();
			if (typeof module.isSupported !== 'function') {
				throw new Error('the module exports no isSupported function');
			}
			if (!module.isSupported()) {
				this.logService.info('[glass] Liquid Glass is not available on this system');
				return false;
			}
			this.module = module;
			this.installReducedTransparencyListener();
			return true;
		} catch (error) {
			this.logService.warn('[glass] The native glass module could not be loaded; windows stay opaque', error);
			return false;
		}
	}

	/** The native module (its package entry is the binary itself); overridden by tests. */
	protected async loadModule(): Promise<IGlassModule> {
		const require = createRequire(import.meta.url);
		return require('@vsebcode/glass') as IGlassModule;
	}

	/** Platform and system state, overridden by tests. */
	protected isMacintosh(): boolean {
		return isMacintosh;
	}

	protected prefersReducedTransparency(): boolean {
		return electron.nativeTheme.prefersReducedTransparency;
	}

	protected onDidChangeNativeTheme(listener: () => void): IDisposable {
		electron.nativeTheme.on('updated', listener);
		return { dispose: () => electron.nativeTheme.removeListener('updated', listener) };
	}

	protected getAllWindows(): electron.BrowserWindow[] {
		return electron.BrowserWindow.getAllWindows();
	}

	private installReducedTransparencyListener(): void {
		this._register(this.onDidChangeNativeTheme(() => {
			if (this.prefersReducedTransparency() && this.layers.size > 0) {
				this.logService.info('[glass] Reduced transparency turned on; detaching the glass layers');
				for (const window of this.getAllWindows()) {
					const layer = this.layers.get(window.id);
					if (layer) {
						this.detach(window);
						window.setBackgroundColor(layer.fallbackBackgroundColor);
					}
				}
			}
		}));
	}

	shouldUseGlass(windowSettings: IWindowSettings | undefined, hasNativeTitlebar: boolean, reduceTransparency: string | undefined): boolean {
		return this.isMacintosh()
			&& this.isAvailable
			&& windowSettings?.glass !== false
			&& !hasNativeTitlebar
			&& windowSettings?.nativeTabs !== true
			&& !this.prefersReducedTransparency()
			&& reduceTransparency !== 'on';
	}

	attach(window: electron.BrowserWindow, options: IGlassOptions, fallbackBackgroundColor: string): boolean {
		if (!this.module || this.layers.has(window.id) || window.isDestroyed()) {
			return this.layers.has(window.id);
		}
		try {
			const windowId = window.id;
			const id = this.module.attach(window.getNativeWindowHandle(), options);
			if (id < 0) {
				return false;
			}
			this.layers.set(windowId, { id, fallbackBackgroundColor, hidden: false });
			window.once('closed', () => this.release(windowId)); // the window's views are gone with it
			this.logService.info(`[glass] Attached the glass layer to window ${windowId}`);
			return true;
		} catch (error) {
			this.logService.error('[glass] Attaching the glass layer failed', error);
			return false;
		}
	}

	update(window: electron.BrowserWindow, options: IGlassOptions): boolean {
		const layer = this.layers.get(window.id);
		if (!layer || !this.module) {
			return false;
		}
		if (!this.module.update(layer.id, options)) {
			return false;
		}
		if (typeof options.hidden === 'boolean') {
			layer.hidden = options.hidden;
			// A hidden layer gets the opaque fallback behind the page again, so nothing the renderer
			// has not painted yet (a live resize) shows the bare desktop; a shown one the clear background
			if (options.hidden) {
				this.coverGlass(window);
			} else {
				this.revealGlass(window);
			}
		}
		return true;
	}

	revealGlass(window: electron.BrowserWindow): void {
		if (this.layers.has(window.id) && !window.isDestroyed()) {
			window.setBackgroundColor('#00000000');
		}
	}

	coverGlass(window: electron.BrowserWindow): void {
		const layer = this.layers.get(window.id);
		if (layer && !window.isDestroyed()) {
			window.setBackgroundColor(layer.fallbackBackgroundColor);
		}
	}

	setFallbackBackgroundColor(window: electron.BrowserWindow, color: string): void {
		const layer = this.layers.get(window.id);
		if (layer) {
			layer.fallbackBackgroundColor = color;
		}
	}

	isGlassHidden(window: electron.BrowserWindow): boolean {
		return this.layers.get(window.id)?.hidden === true;
	}

	detach(window: electron.BrowserWindow): void {
		this.release(window.id);
	}

	private release(windowId: number): void {
		const layer = this.layers.get(windowId);
		if (!layer) {
			return;
		}
		this.layers.delete(windowId);
		try {
			this.module?.detach(layer.id);
		} catch (error) {
			this.logService.warn('[glass] Releasing the glass layer failed', error);
		}
		this.logService.trace(`[glass] Released the glass layer of window ${windowId}`);
		this._onDidDetach.fire(windowId);
	}

	isGlassWindow(window: electron.BrowserWindow): boolean {
		return this.layers.has(window.id);
	}
}
