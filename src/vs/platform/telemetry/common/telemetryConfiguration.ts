/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { PolicyCategory } from '../../../base/common/policy.js';
import { localize } from '../../../nls.js';
import { ConfigurationScope, Extensions, IConfigurationRegistry } from '../../configuration/common/configurationRegistry.js';
import { Registry } from '../../registry/common/platform.js';
import { TELEMETRY_SECTION_ID } from './telemetry.js';

/**
 * The product sends no telemetry, so the telemetry section only carries the
 * feedback switch that gates the issue reporter and the other feedback entry
 * points. The setting keeps its upstream identifier because the
 * `EnableFeedback` policy and the extensions that read it depend on it.
 */
Registry.as<IConfigurationRegistry>(Extensions.Configuration).registerConfiguration({
	'id': TELEMETRY_SECTION_ID,
	'order': 1,
	'type': 'object',
	'title': localize('telemetryConfigurationTitle', "Telemetry"),
	'properties': {
		'telemetry.feedback.enabled': {
			type: 'boolean',
			default: true,
			scope: ConfigurationScope.APPLICATION,
			description: localize('telemetry.feedback.enabled', "Enable feedback mechanisms such as the issue reporter and other feedback options."),
			policy: {
				name: 'EnableFeedback',
				category: PolicyCategory.Telemetry,
				minimumVersion: '1.99',
				localization: { description: { key: 'telemetry.feedback.enabled', value: localize('telemetry.feedback.enabled', "Enable feedback mechanisms such as the issue reporter and other feedback options.") } },
			}
		}
	},
});
