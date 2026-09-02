#!/usr/bin/env node
// build-A01.mjs — emit the 84 icons of long-tail slice A01 into production/svg/file.
//   node build-A01.mjs           # write the SVGs
//   node build-A01.mjs --check   # R7 report only (no writes)

import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
	n, hsl, dHue, poly, circ, ell, rrect, bar, rbar, ring, rring, arcBand, ngon, gear,
	badgeLetters, glyphLetters, inlineLetters, path, plate, svg, letterInk
} from './a01-lib.mjs';

const OUT = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/svg/file';
const MANIFEST = '/Users/sebastian.suarez/Projects/VSebCode/m11-icons/production/set-manifest.json';

// ---- shared builders -------------------------------------------------------
const BADGE = (text, hex, opt = {}) => {
	const L = badgeLetters(text, hex, opt);
	return plate(hex) + path(L.fill, L.d);
};
const GLYPHTEXT = (text, hex, opt = {}) => path(hex, glyphLetters(text, opt).d);
const SOLID = (hex, d, eo = false) => path(hex, d, eo);

// The Angular family emblem set: one hue (core #CC3462, R3 family), seven marks.
const NG = '#CC3462';

// ---- roster ----------------------------------------------------------------
// id, archetype, dominant hex, colour source, tree label, body
export const ICONS = [

	// ============================ archive ============================
	{
		id: 'android', arch: 'SILHOUETTE', hex: '#4EBE80', label: 'AndroidManifest.xml',
		src: 'brand #3DDC84 → #4EBE80',
		body: (h) => SOLID(h,
			// dome + flat chin, two eye knock-outs, two antennae
			`M2.4 12.1V9A5.6 5.6 0 0 1 13.6 9V12.1Z` +
			circ(5.9, 7.2, .85) + circ(10.1, 7.2, .85) +
			bar(4.45, 2.2, 6, 4.3, 1.3) + bar(11.55, 2.2, 10, 4.3, 1.3), true)
	},
	{
		id: 'chrome', arch: 'SILHOUETTE', hex: '#5B8FD8', label: 'extension.crx',
		src: 'brand Chrome #4285F4 → #5B8FD8',
		// square + one knob + one socket: the browser-extension puzzle piece
		body: (h) => SOLID(h, rrect(2.4, 2.6, 9.2, 10.4, 1.2) + circ(11.9, 8.4, 2.05) + circ(7, 2.6, 1.9, true))
	},
	{
		id: 'debian', arch: 'GLYPH', hex: '#B82C38', label: 'package.deb',
		src: 'brand #A81D33 → #B82C38',
		// the swirl: a 280 deg outer band that hands over to an inner band and
		// spirals in — the open right-hand gap is what makes it read as Debian.
		body: (h) => SOLID(h, arcBand(8, 8.6, 5.5, 3.2, 30, 310) + arcBand(8, 8.6, 3.2, 1.4, -45, 30))
	},
	{
		id: 'disc', arch: 'SILHOUETTE', hex: '#9AA8B4', label: 'ubuntu.iso',
		src: 'no brand → #9AA8B4 (neutral lane)',
		body: (h) => SOLID(h, ell(8, 8, 6.6, 4.8) + ell(8, 8, 1.9, 1.35), true)
	},
	{
		id: 'vsix', arch: 'GLYPH', hex: '#2E93D8', label: 'theme.vsix',
		src: 'VS Code blue family → #2E93D8',
		body: (h) => SOLID(h, rrect(2, 2, 4.2, 4.2, .5) + rrect(7, 2, 4.2, 4.2, .5) +
			rrect(2, 7, 4.2, 4.2, .5) + rrect(8.4, 8.4, 4.2, 4.2, .5))
	},

	// ============================ binary =============================
	{
		id: 'gpg', arch: 'SILHOUETTE', hex: '#7B87BE', label: 'secring.gpg',
		src: 'no brand → #7B87BE',
		body: (h) => SOLID(h, rring(1.3, 3, 11.6, 7.8, 1.2, 1.3) +
			poly([[2.6, 4.2], [11.7, 4.2], [7.15, 8.1]]) +
			circ(11.9, 11.7, 2.7) + circ(11.9, 11.7, 1.15, true))
	},
	{
		id: 'hex', arch: 'GLYPH', hex: '#8996A8', label: 'firmware.hex',
		src: 'no brand → #8996A8 (neutral lane)',
		body: (h) => GLYPHTEXT('0x', h, { targetW: 11.4, band: 'ink', cy: 8 })
	},
	{
		id: 'jar', arch: 'SILHOUETTE', hex: '#B4762F', label: 'app.jar',
		src: 'R3 java family (#C9832F) → #B4762F',
		body: (h) => SOLID(h, rrect(3.4, 1.8, 9.2, 2.5, .8) + rrect(3, 5, 10, 8.7, 1.7))
	},
	{
		id: 'lib', arch: 'SILHOUETTE', hex: '#7C86A0', label: 'libcore.a',
		src: 'no brand → #7C86A0 (neutral lane)',
		body: (h) => SOLID(h,
			rrect(2.6, 2.6, 10, 2.7, .6) + rrect(10.4, 3.35, 1.2, 1.2, .2, true) +
			rrect(3.6, 6.65, 9, 2.7, .6) + rrect(4.5, 7.4, 1.2, 1.2, .2, true) +
			rrect(2.2, 10.7, 11, 2.7, .6) + rrect(10.6, 11.45, 1.2, 1.2, .2, true))
	},
	{
		id: 'onnx', arch: 'GLYPH', hex: '#9A63D8', label: 'model.onnx',
		src: 'no brand → #9A63D8',
		body: (h) => SOLID(h,
			bar(3.3, 3.6, 12.6, 8, 1.25) + bar(3.3, 8, 12.6, 8, 1.25) + bar(3.3, 12.4, 12.6, 8, 1.25) +
			circ(3.3, 3.6, 1.3) + circ(3.3, 8, 1.3) + circ(3.3, 12.4, 1.3) + circ(12.6, 8, 1.7))
	},
	{
		id: 'python-misc', arch: 'SILHOUETTE', hex: '#6B92BE', label: 'requirements.txt',
		src: 'R3 python family (#3776AB) → #6B92BE + #46617E (R2 two-tone)',
		body: (h) => SOLID(h,
			'M4.8 1.4H11.5A1.9 1.9 0 0 1 11.5 5.2H7.4V7.7A2.4 2.4 0 0 1 2.6 7.7V3.6A2.2 2.2 0 0 1 4.8 1.4Z' +
			circ(5.2, 3.3, .82), true) +
			SOLID('#46617E',
				'M11.2 14.6H4.5A1.9 1.9 0 0 1 4.5 10.8H8.6V8.3A2.4 2.4 0 0 1 13.4 8.3V12.4A2.2 2.2 0 0 1 11.2 14.6Z' +
				circ(10.8, 12.7, .82), true)
	},
	{
		id: 'pytorch', arch: 'SILHOUETTE', hex: '#CE5134', label: 'model.pt',
		src: 'brand #EE4C2C → #CE5134',
		body: (h) => SOLID(h, ring(8, 9.4, 5, 3.15) + rbar(8.3, 5.6, 11.2, 2.95, 1.75) + circ(12.05, 2.35, 1.15))
	},
	{
		id: 'safetensors', arch: 'SILHOUETTE', hex: '#D9B54C', label: 'model.safetensors',
		src: 'Hugging Face #FFD21E → #D9B54C',
		body: (h) => SOLID(h,
			rrect(2.6, 3, 10.8, 10, 1.4) + rrect(4.5, 4.4, .85, 7.2, .2, true) +
			circ(8.9, 8, 2.6, true) + circ(8.9, 8, 1.05) +
			rrect(3.6, 12.9, 1.9, 1.3, .35) + rrect(10.5, 12.9, 1.9, 1.3, .35))
	},

	// ============================= code ==============================
	{
		id: 'abap', arch: 'BADGE', hex: '#1F5E70', label: 'zreport.abap',
		src: 'no brand → SAP-blue read #1F5E70',
		body: (h) => BADGE('AB', h, { targetW: 9.5 })
	},
	{
		id: 'abc', arch: 'GLYPH', hex: '#C888C8', label: 'tune.abc',
		src: 'no brand → #C888C8',
		body: (h) => SOLID(h,
			ell(4.55, 11.15, 1.75, 1.35) + ell(10.75, 10.05, 1.75, 1.35) +
			bar(5.65, 11.15, 5.65, 3.4, 1.3) + bar(11.85, 10.05, 11.85, 2.3, 1.3) +
			poly([[5, 2.5], [12.5, 1.4], [12.5, 3.3], [5, 4.4]]))
	},
	{
		id: 'abelljs', arch: 'BADGE', hex: '#D4795E', label: 'index.abell',
		src: 'no brand → #D4795E',
		body: (h) => BADGE('abl', h, { targetW: 10.9 })
	},
	{
		id: 'actionscript', arch: 'BADGE', hex: '#8E2F3C', label: 'Main.as',
		src: 'Adobe red family → #8E2F3C',
		body: (h) => BADGE('AS', h, { targetW: 9.5 })
	},
	{
		id: 'ada', arch: 'BADGE', hex: '#6E9E5E', label: 'main.adb',
		src: 'no brand → #6E9E5E',
		body: (h) => BADGE('Ada', h, { targetW: 11 })
	},
	{
		id: 'adobe-swc', arch: 'BADGE', hex: '#8E2F3C', label: 'lib.swc',
		src: 'R3 Adobe family with actionscript → #8E2F3C',
		body: (h) => BADGE('SWC', h, { targetW: 11.2, letterSpacing: -0.02 })
	},
	{
		id: 'adonis', arch: 'BADGE', hex: '#3D3480', label: '.adonisrc.json',
		src: 'brand #5A45FF → #3D3480',
		body: (h) => BADGE('A', h, { targetW: 5.6 })
	},
	{
		id: 'advpl', arch: 'GLYPH', hex: '#2E7799', label: 'main.prw',
		src: 'no brand → #2E7799 (AdvPL family)',
		body: (h) => GLYPHTEXT('ADV', h, { targetW: 14.3, letterSpacing: -0.02 })
	},
	{
		id: 'advpl-include', arch: 'GLYPH', hex: '#2E7799', label: 'protheus.ch',
		src: 'R3 AdvPL family → #2E7799',
		body: (h) => GLYPHTEXT('CH', h, { targetW: 12.2 })
	},
	{
		id: 'advpl-ptm', arch: 'GLYPH', hex: '#2E7799', label: 'menu.ptm',
		src: 'R3 AdvPL family → #2E7799',
		body: (h) => GLYPHTEXT('PTM', h, { targetW: 14.3, letterSpacing: -0.02 })
	},
	{
		id: 'advpl-tlpp', arch: 'GLYPH', hex: '#2E7799', label: 'model.tlpp',
		src: 'R3 AdvPL family → #2E7799',
		body: (h) => GLYPHTEXT('TLP', h, { targetW: 14.3, letterSpacing: -0.02 })
	},
	{
		id: 'affectscript', arch: 'BADGE', hex: '#9E6E8E', label: 'mood.affect',
		src: 'no brand → #9E6E8E (neutral lane)',
		body: (h) => BADGE('AFF', h, { targetW: 11.2, letterSpacing: -0.02 })
	},
	{
		id: 'affinity', arch: 'SILHOUETTE', hex: '#6E5FB8', label: 'cover.af',
		src: 'Affinity blue-violet → #6E5FB8',
		body: (h) => SOLID(h, poly([[8, 1.8], [13.4, 8], [8, 14.2], [2.6, 8]]) +
			poly([[3.35, 7.55], [12.65, 7.55], [12.65, 8.45], [3.35, 8.45]]), true)
	},
	{
		id: 'affinitypublisher', arch: 'SILHOUETTE', hex: '#A8425C', label: 'book.afpub',
		src: 'R3 Affinity family, Publisher red → #A8425C',
		body: (h) => SOLID(h, poly([[8, 1.8], [13.4, 8], [8, 14.2], [2.6, 8]]) +
			poly([[5.05, 5.2], [10.95, 5.2], [10.4, 6.1], [5.6, 6.1]]) +
			poly([[3.35, 7.55], [12.65, 7.55], [12.65, 8.45], [3.35, 8.45]]), true)
	},
	{
		id: 'agda', arch: 'BADGE', hex: '#6E4088', label: 'Proof.agda',
		src: 'no brand → #6E4088',
		body: (h) => BADGE('Ag', h, { targetW: 9.6 })
	},
	{
		id: 'ahk2', arch: 'GLYPH', hex: '#4B9B52', label: 'script.ahk2',
		src: 'R3 AutoHotkey family → #4B9B52',
		body: (h) => SOLID(h, rring(2, 3, 12, 10, 2, 1.4)) +
			path(h, inlineLetters('2', { cap: 4.8, cx: 8, cy: 8 }))
	},
	{
		id: 'al', arch: 'GLYPH', hex: '#6E8296', label: 'Customer.al',
		src: 'no brand → #6E8296 (neutral lane)',
		body: (h) => GLYPHTEXT('AL', h, { targetW: 12.2 })
	},
	{
		id: 'al-dal', arch: 'GLYPH', hex: '#6E8296', label: 'Item.dal',
		src: 'R3 AL family → #6E8296',
		body: (h) => GLYPHTEXT('DAL', h, { targetW: 14.3, letterSpacing: -0.02 })
	},
	{
		id: 'alchemy', arch: 'SILHOUETTE', hex: '#C79A46', label: 'alchemy.run.ts',
		src: 'no brand → #C79A46',
		body: (h) => SOLID(h,
			'M5.9 2H10.1V3.4H8.95V6.5L13.1 12.5A1.4 1.4 0 0 1 11.95 14.4H4.05' +
			'A1.4 1.4 0 0 1 2.9 12.5L7.05 6.5V3.4H5.9Z')
	},
	{
		id: 'alloy', arch: 'SILHOUETTE', hex: '#8FA0AE', label: 'config.alloy',
		src: 'no brand → #8FA0AE (neutral lane, alloy = metal)',
		body: (h) => SOLID(h, rring(1.6, 3, 7.6, 7, 3.5, 1.4) + rring(6.8, 6, 7.6, 7, 3.5, 1.4))
	},
	{
		id: 'allure', arch: 'SILHOUETTE', hex: '#A8C04E', label: 'allurerc.js',
		src: 'no brand → #A8C04E',
		body: (h) => SOLID(h, rrect(2.6, 8.4, 3, 5.2, .7) + rrect(6.5, 5.6, 3, 8, .7) + rrect(10.4, 3.2, 3, 10.4, .7))
	},

	// --- Angular building blocks: R3 family, core angular hue, seven marks ---
	{
		id: 'angular-component', arch: 'GLYPH', hex: NG, label: 'app.component.ts',
		src: 'R3 angular family → canon #CC3462',
		body: (h) => SOLID(h, rring(4, 3.6, 9.4, 8.8, .9, 1.3) +
			rrect(2.2, 5.5, 3.2, 1.9, .3) + rrect(2.2, 8.6, 3.2, 1.9, .3))
	},
	{
		id: 'angular-directive', arch: 'GLYPH', hex: NG, label: 'hover.directive.ts',
		src: 'R3 angular family → canon #CC3462',
		body: (h) => SOLID(h,
			poly([[3, 3.4], [6.6, 3.4], [6.6, 4.9], [4.5, 4.9], [4.5, 11.1], [6.6, 11.1], [6.6, 12.6], [3, 12.6]]) +
			poly([[13, 3.4], [9.4, 3.4], [9.4, 4.9], [11.5, 4.9], [11.5, 11.1], [9.4, 11.1], [9.4, 12.6], [13, 12.6]]) +
			circ(8, 8, 1.5))
	},
	{
		id: 'angular-guard', arch: 'GLYPH', hex: NG, label: 'auth.guard.ts',
		src: 'R3 angular family → canon #CC3462',
		body: (h) => SOLID(h,
			'M8 2.3L12.9 4.05V8.5Q12.9 11.6 8 13.8Q3.1 11.6 3.1 8.5V4.05Z' +
			'M8 3.95L4.6 5.15V8.55Q4.6 10.6 8 12.1Q11.4 10.6 11.4 8.55V5.15Z' +
			poly([[6.5, 7.85], [7.35, 8.75], [9.75, 6.25], [10.75, 7.25], [7.35, 10.75], [5.5, 8.85]]), true)
	},
	{
		id: 'angular-interceptor', arch: 'GLYPH', hex: NG, label: 'token.interceptor.ts',
		src: 'R3 angular family → canon #CC3462',
		body: (h) => SOLID(h, rrect(1.8, 7.35, 6.2, 1.3, .3) +
			poly([[7.6, 5.6], [10.4, 8], [7.6, 10.4]]) + rrect(11.4, 3.2, 1.9, 9.6, .5))
	},
	{
		id: 'angular-pipe', arch: 'GLYPH', hex: NG, label: 'date.pipe.ts',
		src: 'R3 angular family → canon #CC3462',
		body: (h) => SOLID(h, poly([[2.4, 3.2], [13.6, 3.2], [9.4, 8.6], [9.4, 13.4], [6.6, 12], [6.6, 8.6]]))
	},
	{
		id: 'angular-resolver', arch: 'GLYPH', hex: NG, label: 'user.resolver.ts',
		src: 'R3 angular family → canon #CC3462',
		body: (h) => SOLID(h, rrect(7.1, 2.2, 1.8, 4.6, .3) + poly([[4.9, 6.4], [11.1, 6.4], [8, 9.8]]) +
			poly([[2.4, 9.6], [4.1, 9.6], [4.1, 11.9], [11.9, 11.9], [11.9, 9.6], [13.6, 9.6],
			[13.6, 12.4], [12.4, 13.6], [3.6, 13.6], [2.4, 12.4]]))
	},
	{
		id: 'angular-service', arch: 'GLYPH', hex: NG, label: 'api.service.ts',
		src: 'R3 angular family → canon #CC3462',
		body: (h) => SOLID(h, gear(8, 8, 6.4, 4.7, 8) + circ(8, 8, 2.1, true))
	},

	{
		id: 'antlers-html', arch: 'SILHOUETTE', hex: '#C05A8E', label: 'antlers.html',
		src: 'no brand → #C05A8E',
		body: (h) => SOLID(h, [1, -1].map(s => {
			const X = (x) => 8 + s * (x - 8);
			return rbar(X(7.5), 13.7, X(6.35), 9.1, 1.75) + rbar(X(6.35), 9.1, X(3.8), 3.7, 1.65) +
				rbar(X(5.5), 6.7, X(1.9), 5.6, 1.55) + rbar(X(4.6), 5.1, X(4.75), 1.9, 1.55);
		}).join(''))
	},
	{
		id: 'antlr', arch: 'SILHOUETTE', hex: '#B4683E', label: 'Expr.g4',
		src: 'no brand → #B4683E',
		body: (h) => SOLID(h, bar(8, 3.2, 3.8, 12.2, 1.35) + bar(8, 3.2, 12.2, 12.2, 1.35) +
			circ(8, 3.2, 1.9) + circ(3.8, 12.2, 1.9) + circ(12.2, 12.2, 1.9))
	},
	{
		id: 'anyscript', arch: 'BADGE', hex: '#D0DC68', label: 'model.any',
		src: 'no brand → #D0DC68 (dark letters)',
		body: (h) => BADGE('any', h, { targetW: 11.2 })
	},
	{
		id: 'apex', arch: 'SILHOUETTE', hex: '#45AEE6', label: 'AccountCtrl.cls',
		src: 'Salesforce blue #00A1E0 → #45AEE6',
		body: (h) => SOLID(h, circ(8, 7.4, 3.4) + circ(4.4, 9.4, 2.6) + circ(11.6, 9.2, 2.8) +
			rrect(4.4, 9.4, 7.2, 2.6, .8))
	},
	{
		id: 'apib', arch: 'SILHOUETTE', hex: '#3E6EA8', label: 'api.apib',
		src: 'no brand → blueprint #3E6EA8',
		body: (h) => SOLID(h, rrect(2.4, 1.5, 11.2, 13, 1.1) +
			rrect(4.3, 3.2, 5, .9, 0, true) +
			rrect(4.3, 5.4, 7.4, 7, .3, true) + rrect(5.6, 6.7, 4.8, 4.4, .2))
	},
	{
		id: 'apl', arch: 'GLYPH', hex: '#4855A4', label: 'matrix.apl',
		src: 'no brand → #4855A4',
		body: (h) => SOLID(h, rring(2.9, 2.9, 10.2, 10.2, .7, 1.4) + rrect(6.4, 6.4, 3.2, 3.2, .3))
	},
	{
		id: 'applescript', arch: 'SILHOUETTE', hex: '#B0A99E', label: 'build.applescript',
		src: 'no brand → #B0A99E (neutral lane)',
		body: (h) => SOLID(h, rrect(3.6, 3.4, 8.8, 9.2, .8) +
			rrect(2.4, 2.2, 11.2, 2.3, 1.15) + rrect(2.4, 11.5, 11.2, 2.3, 1.15))
	},
	{
		id: 'appscript', arch: 'BADGE', hex: '#7288A0', label: 'Code.gs',
		src: 'Apps Script blue → #7288A0 (neutral lane)',
		body: (h) => BADGE('GS', h, { targetW: 9.6 })
	},
	{
		id: 'appwrite', arch: 'SILHOUETTE', hex: '#D8506F', label: 'appwrite.json',
		src: 'brand #FD366E → #D8506F',
		body: (h) => SOLID(h, rbar(3.2, 13.3, 8, 3, 2.3) + rbar(8, 3, 12.8, 13.3, 2.3) +
			rrect(5.2, 9.2, 5.6, 2.1, 1.05))
	},
	{
		id: 'arduino', arch: 'SILHOUETTE', hex: '#3E9AA0', label: 'blink.ino',
		src: 'brand #00979D → #3E9AA0',
		body: (h) => SOLID(h, ring(4.7, 8, 4.1, 2.8) + ring(11.3, 8, 4.1, 2.8) +
			bar(3.05, 8, 6.35, 8, 1.3) + bar(4.7, 6.35, 4.7, 9.65, 1.3) + bar(9.65, 8, 12.95, 8, 1.3))
	},
	{
		id: 'asp', arch: 'BADGE', hex: '#6E5E8E', label: 'default.asp',
		src: 'no brand → #6E5E8E (neutral lane)',
		body: (h) => BADGE('ASP', h, { targetW: 11.2, letterSpacing: -0.02 })
	},
	{
		id: 'aspx', arch: 'GLYPH', hex: '#6B79C8', label: 'Default.aspx',
		src: '.NET #512BD4 → #6B79C8',
		body: (h) => GLYPHTEXT('NET', h, { targetW: 14.3, letterSpacing: -0.02 })
	},
	{
		id: 'atom', arch: 'SILHOUETTE', hex: '#D9843C', label: 'feed.atom',
		src: 'feed orange #F26522 → #D9843C',
		body: (h) => SOLID(h, circ(4.2, 11.8, 1.75) + arcBand(4.2, 11.8, 5.5, 4.1, 0, 90) +
			arcBand(4.2, 11.8, 9.4, 8, 0, 90))
	},
	{
		id: 'ats', arch: 'GLYPH', hex: '#A89078', label: 'list.ats',
		src: 'no brand → #A89078 (neutral lane)',
		body: (h) => GLYPHTEXT('ATS', h, { targetW: 14.3, letterSpacing: -0.02 })
	},
	{
		id: 'autohotkey', arch: 'GLYPH', hex: '#4B9B52', label: 'hotkeys.ahk',
		src: 'brand AHK green → #4B9B52',
		body: (h) => SOLID(h, rring(2, 3, 12, 10, 2, 1.4)) +
			path(h, inlineLetters('H', { cap: 4.8, cx: 8, cy: 8 }))
	},
	{
		id: 'autoit', arch: 'BADGE', hex: '#9CBEE2', label: 'installer.au3',
		src: 'AutoIt blue → #9CBEE2 (light plate, dark letters)',
		body: (h) => BADGE('AU3', h, { targetW: 11.2, letterSpacing: -0.02 })
	},
	{
		id: 'avalonia', arch: 'BADGE', hex: '#C0A2E8', label: 'MainWindow.axaml',
		src: 'Avalonia violet → #C0A2E8 (light plate, dark letters)',
		body: (h) => BADGE('Av', h, { targetW: 9.6 })
	},
	{
		id: 'avro', arch: 'GLYPH', hex: '#B4A0C0', label: 'user.avcs',
		src: 'no brand → #B4A0C0 (neutral lane)',
		body: (h) => GLYPHTEXT('avro', h, { targetW: 15 })
	},
	{
		id: 'awk', arch: 'GLYPH', hex: '#96C09A', label: 'report.awk',
		src: 'no brand → #96C09A',
		body: (h) => GLYPHTEXT('awk', h, { targetW: 14.6 })
	},
	{
		id: 'axure', arch: 'SILHOUETTE', hex: '#3E9184', label: 'wireframe.rp',
		src: 'Axure teal → #3E9184',
		body: (h) => SOLID(h, rring(1.6, 3, 12.8, 10, 1.4, 1.3) + rrect(2.9, 4.3, 10.2, 1.6, 0) +
			rrect(4, 7, 3.4, 3.4, .4) + rrect(8.6, 7, 3.4, 2, .4))
	},
	{
		id: 'azure', arch: 'SILHOUETTE', hex: '#2E8BD4', label: 'deploy.azcli',
		src: 'brand #0078D4 → #2E8BD4',
		body: (h) => SOLID(h, poly([[6.8, 1.9], [9.6, 1.9], [6.6, 8.2], [3.8, 8.2]]) +
			poly([[9.6, 1.9], [14.6, 13.9], [1.4, 13.9], [5.6, 10.6], [10, 10.6]]))
	},
	{
		id: 'azurestreamanalytics', arch: 'SILHOUETTE', hex: '#3C97D8', label: 'query.asaql',
		src: 'R3 azure family → #3C97D8',
		body: (h) => SOLID(h, [1.6, 5.7, 9.8].map(x =>
			poly([[x, 3.6], [x + 1.9, 3.6], [x + 4.2, 8], [x + 1.9, 12.4], [x, 12.4], [x + 2.3, 8]])).join(''))
	},
	{
		id: 'bak', arch: 'GLYPH', hex: '#84868C', label: 'settings.bak',
		src: 'no brand → #84868C (neutral lane, dim by design)',
		body: (h) => GLYPHTEXT('BAK', h, { targetW: 14.3, letterSpacing: -0.02 })
	},
	{
		id: 'ballerina', arch: 'BADGE', hex: '#B06E2E', label: 'service.bal',
		src: 'Ballerina orange → #B06E2E',
		body: (h) => BADGE('bal', h, { targetW: 10.9 })
	},
	{
		id: 'bashly-hook', arch: 'SILHOUETTE', hex: '#6E9A5A', label: 'src/before.sh',
		src: 'bash green family → #6E9A5A',
		body: (h) => SOLID(h, rrect(5, 1.9, 1.6, 3.6, .5) + rrect(9.4, 1.9, 1.6, 3.6, .5) +
			rrect(3, 5, 10, 5.4, 1.3) + rrect(6.9, 10.4, 2.2, 3.4, .9))
	},
	{
		id: 'bat', arch: 'SILHOUETTE', hex: '#6E8E9E', label: 'build.bat',
		src: 'no brand → #6E8E9E (neutral lane)',
		body: (h) => SOLID(h, rring(1.5, 3.2, 13, 9.6, 1.4, 1.3) + rrect(2.8, 4.5, 10.4, 1.5, 0) +
			bar(4.5, 7.6, 6.4, 9, 1.2) + bar(6.4, 9, 4.5, 10.4, 1.2) + rrect(7.4, 9.9, 3.1, 1.15, .3))
	},
	{
		id: 'bats', arch: 'SILHOUETTE', hex: '#8E7FB8', label: 'cli.bats',
		src: 'no brand → #8E7FB8',
		body: (h) => SOLID(h, poly([[2.2, 8.2], [4.4, 6.1], [6.6, 8.3], [11.7, 3.2], [13.9, 5.4], [6.6, 12.7]]))
	},
	{
		id: 'bazel', arch: 'SILHOUETTE', hex: '#4E9E5E', label: 'BUILD.bazel',
		src: 'Bazel green → #4E9E5E',
		body: (h) => SOLID(h,
			poly([[2.2, 2.2], [9, 2.2], [9, 5.6], [5.6, 5.6], [5.6, 9], [2.2, 9]]) +
			poly([[13.8, 13.8], [7, 13.8], [7, 10.4], [10.4, 10.4], [10.4, 7], [13.8, 7]]))
	},
	{
		id: 'bbx', arch: 'GLYPH', hex: '#9A6FA8', label: 'authoryear.bbx',
		src: 'R3 bibliography family → #9A6FA8 (neutral lane)',
		body: (h) => GLYPHTEXT('bbx', h, { targetW: 14.4 })
	},
	{
		id: 'beancount', arch: 'SILHOUETTE', hex: '#8A9E4E', label: 'ledger.beancount',
		src: 'no brand → #8A9E4E',
		body: (h) => SOLID(h, ell(8, 4, 5.3, 1.5) + ell(8, 8, 5.3, 1.5) + ell(8, 12, 5.3, 1.5))
	},
	{
		id: 'befunge', arch: 'GLYPH', hex: '#8A3EA8', label: 'hello.bf',
		src: 'no brand → #8A3EA8',
		body: (h) => SOLID(h,
			bar(8, 8.6, 8, 4.2, 1.4) + poly([[6, 4.6], [8, 1.7], [10, 4.6]]) +
			bar(8, 7.4, 8, 11.8, 1.4) + poly([[6, 11.4], [8, 14.3], [10, 11.4]]) +
			bar(8.6, 8, 4.2, 8, 1.4) + poly([[4.6, 6], [1.7, 8], [4.6, 10]]) +
			bar(7.4, 8, 11.8, 8, 1.4) + poly([[11.4, 6], [14.3, 8], [11.4, 10]]))
	},
	{
		id: 'behat', arch: 'SILHOUETTE', hex: '#6E9E3E', label: 'behat.yml',
		src: 'Gherkin/BDD green → #6E9E3E',
		body: (h) => SOLID(h, rbar(5.1, 11.9, 11, 4.6, 4.5) + bar(11, 4.6, 12.4, 2.7, 1.2) +
			circ(5.9, 10.6, .75, true) + circ(7.7, 8.4, .75, true) + circ(9.5, 6.2, .75, true))
	},
	{
		id: 'bench-js', arch: 'SILHOUETTE', hex: '#E8D44D', label: 'parse.bench.js',
		src: 'R3 js family → #E8D44D',
		body: (h) => stopwatch(h)
	},
	{
		id: 'bench-jsx', arch: 'SILHOUETTE', hex: '#46B5D1', label: 'render.bench.tsx',
		src: 'R3 react family → #46B5D1',
		body: (h) => stopwatch(h)
	},
	{
		id: 'bench-ts', arch: 'SILHOUETTE', hex: '#3178C6', label: 'parse.bench.ts',
		src: 'R3 typescript family → canon #3178C6',
		body: (h) => stopwatch(h)
	},
	{
		id: 'bibliography', arch: 'SILHOUETTE', hex: '#9A6FA8', label: 'refs.bib',
		src: 'no brand → #9A6FA8 (neutral lane)',
		body: (h) => SOLID(h, rrect(3.4, 1.8, 9.2, 10.6, 1) +
			poly([[8.6, 9], [10.9, 9], [10.9, 14.3], [9.75, 13], [8.6, 14.3]]) +
			rrect(4.9, 2.6, .85, 9, 0, true))
	},
	{
		id: 'bibtex-style', arch: 'GLYPH', hex: '#9A6FA8', label: 'plain.bst',
		src: 'R3 bibliography family → #9A6FA8 (neutral lane)',
		body: (h) => GLYPHTEXT('bst', h, { targetW: 14 })
	},
	{
		id: 'bicep', arch: 'SILHOUETTE', hex: '#3E9BB4', label: 'main.bicep',
		src: 'Bicep blue-teal → #3E9BB4',
		body: (h) => SOLID(h, rrect(1.8, 9.6, 8.6, 4, 1.8) + rrect(9.8, 3.4, 4, 8, 1.6) +
			rrect(9.2, 2.1, 4.6, 3.6, 1.5) + circ(8.6, 8.8, 2.9))
	},
	{
		id: 'biml', arch: 'BADGE', hex: '#3E7E2E', label: 'package.biml',
		src: 'no brand → #3E7E2E',
		body: (h) => BADGE('BML', h, { targetW: 11.2, letterSpacing: -0.02 })
	},
	{
		id: 'blade', arch: 'GLYPH', hex: '#A8422E', label: 'layout.blade.php',
		src: 'Laravel red #FF2D20 → #A8422E',
		body: (h) => GLYPHTEXT('@', h, { targetW: 10.4, band: 'ink', cy: 8 })
	},
	{
		id: 'blink', arch: 'SILHOUETTE', hex: '#6EA8C4', label: 'main.blink',
		src: 'no brand → #6EA8C4',
		body: (h) => SOLID(h, 'M1.6 8Q8-1.2 14.4 8Q8 17.2 1.6 8Z' + circ(8, 8, 2.6) + circ(8, 8, 1.3), true)
	},
	{
		id: 'blitzbasic', arch: 'BADGE', hex: '#BE4E92', label: 'game.bb',
		src: 'no brand → #BE4E92',
		body: (h) => BADGE('BB', h, { targetW: 9.6 })
	},
	{
		id: 'bolt', arch: 'SILHOUETTE', hex: '#A0906A', label: 'rules.bolt',
		src: 'no brand → #A0906A (neutral lane, brass)',
		body: (h) => SOLID(h, circ(8, 4.6, 4) + rrect(5.2, 3.9, 5.6, 1.4, .2, true) +
			poly([[6.1, 7.9], [9.9, 7.9], [9.9, 12.2], [8, 14.2], [6.1, 12.2]]))
	}
];

// stopwatch — the bench-* family mark (declared after use above; hoisted function)
function stopwatch(h) {
	return SOLID(h, ring(8, 9.1, 5.4, 4.05) + rrect(6.6, 1.3, 2.8, 1.7, .5) +
		rrect(7.3, 2.6, 1.4, 1.6, 0) + bar(8, 9.1, 8, 5.9, 1.3) + circ(8, 9.1, 1));
}

// ---- emit ------------------------------------------------------------------
const MAIN = process.argv[1] && process.argv[1].endsWith('build-A01.mjs');
const CHECK = process.argv.includes('--check');
if (MAIN) { run(); }
function run() {

if (!CHECK) {
	mkdirSync(OUT, { recursive: true });
	let total = 0, max = 0, maxId = '';
	for (const i of ICONS) {
		const out = svg(i.body(i.hex));
		const b = Buffer.byteLength(out);
		total += b;
		if (b > max) { max = b; maxId = i.id; }
		writeFileSync(join(OUT, `${i.id}.svg`), out, 'utf8');
	}
	console.log(`wrote ${ICONS.length} icons — ${total} B total, ${Math.round(total / ICONS.length)} B avg, max ${max} B (${maxId})`);
}

// ---- R7 -------------------------------------------------------------------
// twins iff same archetype && dhue<12 && dL<12 && dS<25; neutral lane S<25 exempt;
// R3 families exempt; SILHOUETTE colour hits are form-qualified (reported, not failed).
const FAMILIES = [
	['java', 'jar', 'class'], ['python', 'python-misc'],
	['actionscript', 'adobe-swc'], ['affinity', 'affinitypublisher'],
	['advpl', 'advpl-include', 'advpl-ptm', 'advpl-tlpp'], ['al', 'al-dal'],
	['autohotkey', 'ahk2'], ['azure', 'azurestreamanalytics'],
	['bibliography', 'bibtex-style', 'bbx'],
	['bench-js', 'bench-jsx', 'bench-ts', 'js', 'reactjs', 'reactts', 'typescript'],
	['angular', 'angular-component', 'angular-directive', 'angular-guard',
		'angular-interceptor', 'angular-pipe', 'angular-resolver', 'angular-service']
];
const famOf = new Map();
FAMILIES.forEach((f, i) => f.forEach(id => famOf.set(id, i)));
const sameFam = (a, b) => famOf.has(a) && famOf.get(a) === famOf.get(b);

const core = JSON.parse(readFileSync(MANIFEST, 'utf8')).icons
	.filter(i => i.kind === 'file')
	.map(i => ({ id: i.id, arch: i.archetype, hex: i.dominant, core: true }));
const pool = [...ICONS.map(i => ({ id: i.id, arch: i.arch, hex: i.hex, core: false })), ...core];

const hard = [], formLane = [];
for (let a = 0; a < pool.length; a++) {
	for (let b = a + 1; b < pool.length; b++) {
		const A = pool[a], B = pool[b];
		if (A.core && B.core) { continue; }
		if (A.arch !== B.arch || sameFam(A.id, B.id)) { continue; }
		const ha = hsl(A.hex), hb = hsl(B.hex);
		if (ha.s < 25 || hb.s < 25) { continue; }
		if (!(dHue(ha.h, hb.h) < 12 && Math.abs(ha.l - hb.l) < 12 && Math.abs(ha.s - hb.s) < 25)) { continue; }
		const rec = `${A.id}${A.core ? '*' : ''} / ${B.id}${B.core ? '*' : ''}  ${A.arch}  ` +
			`${A.hex} ${B.hex}  dh ${n(dHue(ha.h, hb.h))} dL ${n(Math.abs(ha.l - hb.l))} dS ${n(Math.abs(ha.s - hb.s))}`;
		(A.arch === 'SILHOUETTE' ? formLane : hard).push(rec);
	}
}
console.log(`\n== R7 BADGE/GLYPH twins (hard) : ${hard.length} ==`);
hard.forEach(r => console.log('  ' + r));
console.log(`\n== R7 SILHOUETTE colour hits (form-qualified lane) : ${formLane.length} ==`);
formLane.forEach(r => console.log('  ' + r));
}
