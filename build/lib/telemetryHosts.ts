/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as fs from 'node:fs';
import * as path from 'node:path';
import { Transform } from 'node:stream';
import ts from 'typescript';
import type { RawSourceMap } from 'source-map';
import type Vinyl from 'vinyl';

interface HostEdit {
	offset: number;
	line: number;
	column: number;
	length: number;
}

const hostnamePattern = /((?:https?:)?(?:\\?\/){2})(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+data\.microsoft\.com(?=[:\\/?#\s"'`]|$)/gi;
const replacementHost = '0.0.0.0';
const binaryExtensions = new Set(['.node', '.dll', '.exe', '.so', '.dylib', '.a', '.lib', '.zip', '.gz', '.xz', '.br', '.vsix', '.asar', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.icns', '.pdf', '.woff', '.woff2', '.ttf', '.wasm', '.p7s', '.sig']);

function rewriteText(text: string, excluded?: { offset: number; length: number }): { text: string; edits: HostEdit[] } {
	const edits: HostEdit[] = [];
	const rewritten = text.replace(hostnamePattern, (match: string, prefix: string, offset: number) => {
		if (excluded && offset >= excluded.offset && offset < excluded.offset + excluded.length) {
			return match;
		}
		const start = offset + prefix.length;
		const before = text.slice(0, start);
		edits.push({ offset: start, line: before.split('\n').length, column: start - before.lastIndexOf('\n') - 1, length: match.length - prefix.length });
		return prefix + replacementHost;
	});
	return { text: rewritten, edits };
}

function shiftColumn(line: number, column: number, edits: readonly HostEdit[]): number {
	let shift = 0;
	for (const edit of edits) {
		if (edit.line === line && column > edit.column) {
			shift += Math.min(column - edit.column, replacementHost.length) - Math.min(column - edit.column, edit.length);
		}
	}
	return column + shift;
}

const base64Digits = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function decodeSegment(segment: string): number[] {
	const result: number[] = [];
	let value = 0;
	let shift = 0;
	for (const character of segment) {
		const digit = base64Digits.indexOf(character);
		if (digit < 0 || shift > 30) {
			throw new Error('invalid source-map VLQ');
		}
		value += (digit & 31) * 2 ** shift;
		if (digit & 32) {
			shift += 5;
		} else {
			result.push((value % 2 ? -1 : 1) * Math.floor(value / 2));
			value = 0;
			shift = 0;
		}
	}
	if (shift || ![1, 4, 5].includes(result.length)) {
		throw new Error('invalid source-map segment');
	}
	return result;
}

function encodeSegment(values: number[]): string {
	return values.map(value => {
		let encoded = '';
		let remaining = Math.abs(value) * 2 + (value < 0 ? 1 : 0);
		do {
			const digit = remaining % 32;
			remaining = Math.floor(remaining / 32);
			encoded += base64Digits[digit + (remaining ? 32 : 0)];
		} while (remaining);
		return encoded;
	}).join('');
}

interface SourceMapReference {
	value: string;
	offset: number;
	commentEnd: number;
}

function sourceMapCandidates(text: string): RegExpMatchArray[] {
	return [...text.matchAll(/\/\/[#@]\s*sourceMappingURL=(\S+)|\/\*[#@]\s*sourceMappingURL=((?:\*(?!\/)|[^\s*])+)/g)];
}

function sourceMapReference(text: string): SourceMapReference | undefined {
	const matches = sourceMapCandidates(text);
	if (!matches.length) {
		return undefined;
	}
	// Comment-looking text in a string, template or regular expression is executable
	// content, not a source-map directive. Read trivia only at real syntax boundaries.
	const positions = new Set(matches.map(match => match.index!));
	const comments = new Map<number, number>();
	const nodes: ts.Node[] = [ts.createSourceFile('telemetry.js', text, ts.ScriptTarget.Latest, false, ts.ScriptKind.JS)];
	while (nodes.length) {
		const node = nodes.pop()!;
		for (const position of [node.pos, node.end]) {
			for (const range of [...ts.getLeadingCommentRanges(text, position) ?? [], ...ts.getTrailingCommentRanges(text, position) ?? []]) {
				if (positions.has(range.pos)) {
					comments.set(range.pos, range.end);
				}
			}
		}
		ts.forEachChild(node, child => { nodes.push(child); });
	}
	for (const match of matches.reverse()) {
		const commentEnd = comments.get(match.index!);
		if (commentEnd !== undefined && match.index! + match[0].length <= commentEnd) {
			const value = match[1] ?? match[2];
			return { value, offset: match.index! + match[0].lastIndexOf(value), commentEnd };
		}
	}
	return undefined;
}

function rewriteFileText(filename: string, text: string): ReturnType<typeof rewriteText> {
	const rewritten = rewriteText(text);
	if (!rewritten.edits.length) {
		return rewritten;
	}
	const reference = /\.[cm]?js$/i.test(filename) ? sourceMapReference(text) : undefined;
	return reference ? rewriteText(text, { offset: reference.offset, length: reference.value.length }) : rewritten;
}

function externalSourceEdits(source: string, sourceRoot: string | undefined, filename: string, edits: ReadonlyMap<string, readonly HostEdit[]>): readonly HostEdit[] {
	if (typeof source !== 'string' || /^[a-z]+:/i.test(source) || /^[a-z]+:/i.test(sourceRoot ?? '') || path.posix.isAbsolute(source) || path.posix.isAbsolute(sourceRoot ?? '')) {
		return [];
	}
	const name = path.posix.normalize(path.posix.join(path.posix.dirname(filename), sourceRoot ?? '', decodeURIComponent(source)));
	return edits.get(name) ?? [];
}

function mapNeedsSourceRewrite(text: string, filename: string, edits: ReadonlyMap<string, readonly HostEdit[]>): boolean {
	if (rewriteText(text).edits.length) {
		return true;
	}
	try {
		const raw: RawSourceMap = JSON.parse(text);
		return Array.isArray(raw.sources) && raw.sources.some((source, index) => typeof raw.sourcesContent?.[index] !== 'string' && externalSourceEdits(source, raw.sourceRoot, filename, edits).length > 0);
	} catch {
		return false;
	}
}

function rewriteMap(text: string, generatedEdits: readonly HostEdit[], filename: string, fileEdits: ReadonlyMap<string, readonly HostEdit[]>): string {
	try {
		const raw: RawSourceMap & { sections?: unknown } = JSON.parse(text);
		if (Number(raw.version) !== 3 || typeof raw.mappings !== 'string' || !Array.isArray(raw.sources) || raw.sections) {
			throw new Error('only flat version 3 source maps are supported');
		}
		const sourceEdits = raw.sources.map((source, index) => {
			const content = raw.sourcesContent?.[index];
			if (typeof content !== 'string') {
				return externalSourceEdits(source, raw.sourceRoot, filename, fileEdits);
			}
			const rewritten = rewriteText(content);
			raw.sourcesContent![index] = rewritten.text;
			return rewritten.edits;
		});
		// Preserve source/name order, sourceRoot and all extension fields. Only position deltas change.
		let source = 0;
		let originalLine = 0;
		let originalColumn = 0;
		let previousOriginalColumn = 0;
		raw.mappings = raw.mappings.split(';').map((line, lineIndex) => {
			let generatedColumn = 0;
			let previousGeneratedColumn = 0;
			return line ? line.split(',').map(segment => {
				const values = decodeSegment(segment);
				generatedColumn += values[0];
				const updatedGeneratedColumn = shiftColumn(lineIndex + 1, generatedColumn, generatedEdits);
				values[0] = updatedGeneratedColumn - previousGeneratedColumn;
				previousGeneratedColumn = updatedGeneratedColumn;
				if (values.length > 1) {
					source += values[1];
					originalLine += values[2];
					originalColumn += values[3];
					if (source < 0 || source >= raw.sources.length || originalLine < 0 || originalColumn < 0) {
						throw new Error('invalid source-map position');
					}
					const updatedOriginalColumn = shiftColumn(originalLine + 1, originalColumn, sourceEdits[source]);
					values[3] = updatedOriginalColumn - previousOriginalColumn;
					previousOriginalColumn = updatedOriginalColumn;
				}
				return encodeSegment(values);
			}).join(',') : '';
		}).join(';');
		return JSON.stringify(raw);
	} catch (error) {
		throw new Error(`Cannot preserve source map while rewriting telemetry hosts in ${filename}: ${error}`);
	}
}

function textContent(filename: string, buffer: Buffer): string | undefined {
	if (binaryExtensions.has(path.extname(filename).toLowerCase()) || buffer.includes(0)) {
		return undefined;
	}
	try {
		return new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(buffer);
	} catch {
		return undefined;
	}
}

function hasInlineTelemetryMap(text: string, filename: string, fileEdits: ReadonlyMap<string, readonly HostEdit[]> = new Map()): boolean {
	const needsRewrite = (value: string): boolean => {
		const reference = /^data:application\/json(?:;charset=[^;,]+)?(;base64)?,(\S+)$/.exec(value);
		if (!reference) {
			return false;
		}
		try {
			const map = reference[1] ? Buffer.from(reference[2], 'base64').toString('utf8') : decodeURIComponent(reference[2]);
			return mapNeedsSourceRewrite(map, filename, fileEdits);
		} catch {
			return false;
		}
	};
	// Most files and maps are unaffected. Parse JavaScript only when a candidate map
	// needs a change, keeping full installed-tree scans inexpensive.
	if (!sourceMapCandidates(text).some(match => needsRewrite(match[1] ?? match[2]))) {
		return false;
	}
	const reference = sourceMapReference(text);
	return reference !== undefined && needsRewrite(reference.value);
}

/** Rewrites extracted text and its maps together; no archive or native signature is modified. */
export function rewriteTelemetryFiles(files: Map<string, Buffer>): void {
	const rewrittenMaps = new Set<string>();
	// Compute original edits before mutating any file, including referenced external sources.
	const fileEdits = new Map<string, readonly HostEdit[]>();
	for (const [filename, buffer] of files) {
		const text = textContent(filename, buffer);
		if (text !== undefined && !filename.endsWith('.map')) {
			fileEdits.set(filename, rewriteFileText(filename, text).edits);
		}
	}
	for (const [filename, buffer] of files) {
		if (filename.endsWith('.map')) {
			continue;
		}
		const original = textContent(filename, buffer);
		if (original === undefined) {
			continue;
		}
		const rewritten = rewriteFileText(filename, original);
		if (!rewritten.edits.length && !hasInlineTelemetryMap(original, filename, fileEdits)) {
			continue;
		}
		let text = rewritten.text;
		if (/\.[cm]?js$/i.test(filename)) {
			const match = sourceMapReference(original);
			if (match) {
				const reference = match.value;
				let updatedReference = reference;
				if (reference.startsWith('data:')) {
					if (original.slice(match.commentEnd).trim()) {
						throw new Error(`Cannot preserve inline source map before trailing code in ${filename}`);
					}
					const inline = /^data:application\/json(?:;charset=[^;,]+)?(;base64)?,(.*)$/.exec(reference);
					if (!inline) {
						throw new Error(`Unsupported inline source map in ${filename}`);
					}
					const map = inline[1] ? Buffer.from(inline[2], 'base64').toString('utf8') : decodeURIComponent(inline[2]);
					updatedReference = `data:application/json;base64,${Buffer.from(rewriteMap(map, rewritten.edits, filename, fileEdits)).toString('base64')}`;
				} else {
					const mapName = path.posix.normalize(path.posix.join(path.posix.dirname(filename), decodeURIComponent(reference)));
					const map = files.get(mapName);
					if (!map || /^[a-z]+:/i.test(reference) || path.posix.isAbsolute(reference) || mapName.startsWith('../')) {
						throw new Error(`Cannot rewrite ${filename}: source map ${reference} is missing or outside the prepared files.`);
					}
					files.set(mapName, Buffer.from(rewriteMap(map.toString('utf8'), rewritten.edits, mapName, fileEdits)));
					rewrittenMaps.add(mapName);
				}
				const originalOffset = match.offset;
				const offset = originalOffset + rewritten.edits.filter(edit => edit.offset < originalOffset).reduce((sum, edit) => sum + replacementHost.length - edit.length, 0);
				text = text.slice(0, offset) + updatedReference + text.slice(offset + reference.length);
			}
		}
		files.set(filename, Buffer.from(text));
	}
	for (const [filename, buffer] of files) {
		if (filename.endsWith('.map') && !rewrittenMaps.has(filename) && mapNeedsSourceRewrite(buffer.toString('utf8'), filename, fileEdits)) {
			files.set(filename, Buffer.from(rewriteMap(buffer.toString('utf8'), [], filename, fileEdits)));
		}
	}
}

/** Rewrites one explicitly selected installed tree, never following symbolic links. */
export function rewriteTelemetryDirectory(directory: string): number {
	const files = new Map<string, Buffer>();
	const regularFiles = new Set<string>();
	const visit = (relative: string) => {
		const absolute = path.join(directory, relative);
		if (!fs.existsSync(absolute) || fs.lstatSync(absolute).isSymbolicLink()) {
			return;
		}
		for (const entry of fs.readdirSync(absolute, { withFileTypes: true })) {
			if (entry.name === '.git' || entry.isSymbolicLink()) {
				continue;
			}
			const name = path.posix.join(relative, entry.name);
			if (entry.isDirectory()) {
				visit(name);
			} else if (entry.isFile()) {
				regularFiles.add(name);
				const buffer = fs.readFileSync(path.join(directory, name));
				const text = textContent(name, buffer);
				if (text !== undefined && (rewriteText(text).edits.length || hasInlineTelemetryMap(text, name))) {
					files.set(name, buffer);
				}
			}
		}
	};
	visit('');
	for (const [filename, buffer] of [...files]) {
		if (!/\.[cm]?js$/i.test(filename)) {
			continue;
		}
		const match = sourceMapReference(buffer.toString('utf8'));
		if (match && !match.value.startsWith('data:')) {
			const map = path.posix.normalize(path.posix.join(path.posix.dirname(filename), decodeURIComponent(match.value)));
			if (regularFiles.has(map)) {
				files.set(map, fs.readFileSync(path.join(directory, map)));
			}
		}
	}
	// A map may refer to a rewritten external source even when its generated file has no hostnames.
	const fileEdits = new Map<string, readonly HostEdit[]>();
	for (const [filename, buffer] of files) {
		if (!filename.endsWith('.map')) {
			fileEdits.set(filename, rewriteFileText(filename, buffer.toString('utf8')).edits);
		}
	}
	for (const filename of regularFiles) {
		if (filename.endsWith('.map') && !files.has(filename)) {
			const buffer = fs.readFileSync(path.join(directory, filename));
			if (mapNeedsSourceRewrite(buffer.toString('utf8'), filename, fileEdits)) {
				files.set(filename, buffer);
			}
		} else if (/\.[cm]?js$/i.test(filename) && !files.has(filename)) {
			const buffer = fs.readFileSync(path.join(directory, filename));
			const text = textContent(filename, buffer);
			if (text !== undefined && hasInlineTelemetryMap(text, filename, fileEdits)) {
				files.set(filename, buffer);
			}
		}
	}
	const originals = new Map(files);
	rewriteTelemetryFiles(files);
	let changed = 0;
	for (const [filename, buffer] of files) {
		if (!buffer.equals(originals.get(filename)!)) {
			fs.writeFileSync(path.join(directory, filename), buffer);
			changed++;
		}
	}
	return changed;
}

/** Transforms verified, extracted extension files before they enter the cache or package. */
export function rewriteTelemetryStream(): Transform {
	const entries: Vinyl[] = [];
	return new Transform({
		objectMode: true,
		transform(file: Vinyl, _encoding, callback) {
			entries.push(file);
			callback();
		},
		flush(callback) {
			try {
				const files = new Map<string, Buffer>();
				for (const file of entries) {
					if (file.isBuffer() && !file.isSymbolic()) {
						files.set(file.relative.replace(/\\/g, '/'), file.contents);
					}
				}
				rewriteTelemetryFiles(files);
				for (const file of entries) {
					if (file.isBuffer() && !file.isSymbolic()) {
						file.contents = files.get(file.relative.replace(/\\/g, '/'))!;
					}
					this.push(file);
				}
				callback();
			} catch (error) {
				callback(error instanceof Error ? error : new Error(String(error)));
			}
		}
	});
}
