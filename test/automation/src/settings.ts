/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Editor } from './editor';
import { Editors } from './editors';
import { Code } from './code';
import { QuickAccess } from './quickaccess';
import { SEED_USER_SETTINGS } from './electron';

const SEARCH_BOX_NATIVE_EDIT_CONTEXT = '.settings-editor .suggest-input-container .monaco-editor .native-edit-context';
const SEARCH_BOX_TEXTAREA = '.settings-editor .suggest-input-container .monaco-editor textarea';

export class SettingsEditor {
	constructor(private code: Code, private editors: Editors, private editor: Editor, private quickaccess: QuickAccess) { }

	/**
	 * Write a single setting key value pair.
	 *
	 * Warning: You may need to set `editor.wordWrap` to `"on"` if this is called with a really long
	 * setting.
	 */
	async addUserSetting(setting: string, value: string): Promise<void> {
		this.refuseSeededKeys([setting]);
		await this.openUserSettingsFile();

		await this.editors.selectTab('settings.json');
		await this.code.dispatchKeybinding('right', () =>
			this.editor.waitForEditorSelection('settings.json', (s) => this._acceptEditorSelection(this.code.editContextEnabled, s)));
		await this.editor.waitForTypeInEditor('settings.json', `"${setting}": ${value},`);
		await this.editors.saveOpenedFile();
	}

	/**
	 * Write several settings faster than multiple calls to {@link addUserSetting}.
	 *
	 * Warning: You will likely also need to set `editor.wordWrap` to `"on"` if `addUserSetting` is
	 * called after this in the test.
	 */
	async addUserSettings(settings: [key: string, value: string][]): Promise<void> {
		this.refuseSeededKeys(settings.map(([key]) => key));
		await this.openUserSettingsFile();

		await this.editors.selectTab('settings.json');
		await this.code.dispatchKeybinding('right', () =>
			this.editor.waitForEditorSelection('settings.json', (s) => this._acceptEditorSelection(this.code.editContextEnabled, s)));
		// One entry per line: VSebCode wraps lines at 120 columns by default, and a typed line that wraps
		// moves its rendered rest out of order, past the lines below, where the typed-text check reads it.
		for (const [index, [key, value]] of settings.entries()) {
			if (index > 0) {
				await this.newLine();
			}
			await this.editor.waitForTypeInEditor('settings.json', `"${key}": ${value},`);
		}
		await this.editors.saveOpenedFile();
	}

	async clearUserSettings(): Promise<void> {
		await this.openUserSettingsFile();
		await this.quickaccess.runCommand('editor.action.selectAll');
		await this.code.dispatchKeybinding('Delete', async () => {
			await this.editor.waitForEditorContents('settings.json', contents => contents === '');
		});
		await this.editor.waitForTypeInEditor('settings.json', `{`); // will auto close }
		// Restore the launch seed the way the launcher writes it, one entry per line below the `{`, so
		// the first line stays as short as in an empty settings file.
		for (const [key, value] of SEED_USER_SETTINGS) {
			await this.newLine();
			await this.editor.waitForTypeInEditor('settings.json', `"${key}": ${value},`);
		}
		await this.editors.saveOpenedFile();
		await this.quickaccess.runCommand('workbench.action.closeActiveEditor');
	}

	async openUserSettingsFile(): Promise<void> {
		await this.quickaccess.runCommand('workbench.action.openSettingsJson');
		await this.editor.waitForEditorFocus('settings.json', 1);
	}

	async openUserSettingsUI(): Promise<void> {
		await this.quickaccess.runCommand('workbench.action.openSettings2');
		await this.code.waitForActiveElement(this._editContextSelector());
	}

	async searchSettingsUI(query: string): Promise<void> {
		await this.openUserSettingsUI();

		await this.code.waitAndClick(this._editContextSelector());
		await this.code.dispatchKeybinding(process.platform === 'darwin' ? 'cmd+a' : 'ctrl+a', async () => { });
		await this.code.dispatchKeybinding('Delete', async () => {
			await this.code.waitForElements('.settings-editor .settings-count-widget', false, results => !results || (results?.length === 1 && !results[0].textContent));
		});
		await this.code.waitForTypeInEditor(this._editContextSelector(), query);
		await this.code.waitForElements('.settings-editor .settings-count-widget', false, results => results?.length === 1 && results[0].textContent.includes('Found'));
	}

	private _editContextSelector() {
		return !this.code.editContextEnabled ? SEARCH_BOX_TEXTAREA : SEARCH_BOX_NATIVE_EDIT_CONTEXT;
	}

	/**
	 * Presses Enter and waits for the cursor to reach the next line, read from the status bar because
	 * the editor renders only the visible lines.
	 */
	private async newLine(): Promise<void> {
		const cursor = '.statusbar-item[id="status.editor.selection"]';
		const lineOf = (text: string) => Number(/Ln (\d+)/.exec(text)?.[1]);
		const before = lineOf(await this.code.waitForTextContent(cursor, undefined, text => !isNaN(lineOf(text))));
		await this.code.dispatchKeybinding('Enter', async () => {
			await this.code.waitForTextContent(cursor, undefined, text => lineOf(text) === before + 1);
		});
	}

	/**
	 * The helpers type on the first line, above the launch seed, and a later duplicate key wins, so a
	 * seeded key a test sets would keep the seed's value: refuse it rather than let the seed win.
	 */
	private refuseSeededKeys(keys: string[]): void {
		const seeded = keys.filter(key => SEED_USER_SETTINGS.some(([seedKey]) => seedKey === key));
		if (seeded.length) {
			throw new Error(`The smoke settings seed would override these settings the test sets: ${seeded.join(', ')}. Take them out of SEED_USER_SETTINGS in test/automation/src/electron.ts.`);
		}
	}

	private _acceptEditorSelection(editContextEnabled: boolean, s: { selectionStart: number; selectionEnd: number }): boolean {
		if (!editContextEnabled) {
			return true;
		}
		return s.selectionStart === 1 && s.selectionEnd === 1;
	}
}
