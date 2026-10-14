/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export interface IAuthenticationChallenge {
	scheme: string;
	params: Record<string, string>;
}

export function parseWWWAuthenticateHeader(wwwAuthenticateHeaderValue: string): IAuthenticationChallenge[] {
	const challenges: IAuthenticationChallenge[] = [];

	// According to RFC 7235, multiple challenges are separated by commas
	// But parameters within a challenge can also be separated by commas
	// We need to identify scheme names to know where challenges start

	// First, split by commas while respecting quoted strings
	const tokens: string[] = [];
	let current = '';
	let inQuotes = false;

	for (let i = 0; i < wwwAuthenticateHeaderValue.length; i++) {
		const char = wwwAuthenticateHeaderValue[i];

		if (char === '"') {
			inQuotes = !inQuotes;
			current += char;
		} else if (char === ',' && !inQuotes) {
			if (current.trim()) {
				tokens.push(current.trim());
			}
			current = '';
		} else {
			current += char;
		}
	}

	if (current.trim()) {
		tokens.push(current.trim());
	}

	// Now process tokens to identify challenges
	// A challenge starts with a scheme name (a token that doesn't contain '=' and is followed by parameters or is standalone)
	let currentChallenge: { scheme: string; params: Record<string, string> } | undefined;

	for (const token of tokens) {
		const hasEquals = token.includes('=');

		if (!hasEquals) {
			// This token doesn't have '=', so it's likely a scheme name
			if (currentChallenge) {
				challenges.push(currentChallenge);
			}
			currentChallenge = { scheme: token.trim(), params: {} };
		} else {
			// This token has '=', it could be:
			// 1. A parameter for the current challenge
			// 2. A new challenge that starts with "Scheme param=value"

			const spaceIndex = token.indexOf(' ');
			if (spaceIndex > 0) {
				const beforeSpace = token.substring(0, spaceIndex);
				const afterSpace = token.substring(spaceIndex + 1);

				// Check if what's before the space looks like a scheme name (no '=')
				if (!beforeSpace.includes('=') && afterSpace.includes('=')) {
					// This is a new challenge starting with "Scheme param=value"
					if (currentChallenge) {
						challenges.push(currentChallenge);
					}
					currentChallenge = { scheme: beforeSpace.trim(), params: {} };

					// Parse the parameter part
					const equalIndex = afterSpace.indexOf('=');
					if (equalIndex > 0) {
						const key = afterSpace.substring(0, equalIndex).trim();
						const value = afterSpace.substring(equalIndex + 1).trim().replace(/^"|"$/g, '');
						if (key && value !== undefined) {
							currentChallenge.params[key] = value;
						}
					}
					continue;
				}
			}

			// This is a parameter for the current challenge
			if (currentChallenge) {
				const equalIndex = token.indexOf('=');
				if (equalIndex > 0) {
					const key = token.substring(0, equalIndex).trim();
					const value = token.substring(equalIndex + 1).trim().replace(/^"|"$/g, '');
					if (key && value !== undefined) {
						currentChallenge.params[key] = value;
					}
				}
			}
		}
	}

	// Don't forget the last challenge
	if (currentChallenge) {
		challenges.push(currentChallenge);
	}

	return challenges;
}

/**
 * Checks if two scope lists are equivalent, regardless of order.
 * This is useful for comparing OAuth scopes where the order should not matter.
 *
 * @param scopes1 First list of scopes to compare (can be undefined)
 * @param scopes2 Second list of scopes to compare (can be undefined)
 * @returns true if the scope lists contain the same scopes (order-independent), false otherwise
 *
 * @example
 * ```typescript
 * scopesMatch(['read', 'write'], ['write', 'read']) // Returns: true
 * scopesMatch(['read'], ['write']) // Returns: false
 * scopesMatch(undefined, undefined) // Returns: true
 * scopesMatch(['read'], undefined) // Returns: false
 * ```
 */
export function scopesMatch(scopes1: readonly string[] | undefined, scopes2: readonly string[] | undefined): boolean {
	if (scopes1 === scopes2) {
		return true;
	}
	if (!scopes1 || !scopes2) {
		return false;
	}
	if (scopes1.length !== scopes2.length) {
		return false;
	}

	// Sort both arrays for comparison to handle different orderings
	const sortedScopes1 = [...scopes1].sort();
	const sortedScopes2 = [...scopes2].sort();

	return sortedScopes1.every((scope, index) => scope === sortedScopes2[index]);
}
