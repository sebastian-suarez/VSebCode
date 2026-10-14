/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../nls.js';
import { ConfigurationScope, Extensions as ConfigurationExtensions, IConfigurationRegistry } from '../../configuration/common/configurationRegistry.js';
import { Registry } from '../../registry/common/platform.js';

const configurationRegistry = Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration);
configurationRegistry.registerConfiguration({
	id: 'network',
	order: 14,
	title: localize('networkConfigurationTitle', "Network"),
	type: 'object',
	properties: {
		'network.meteredConnection': {
			type: 'string',
			enum: ['auto', 'on', 'off'],
			enumDescriptions: [
				localize('meteredConnection.auto', "Automatically detect metered connections using the operating system's network status."),
				localize('meteredConnection.on', "Always treat the network connection as metered. Automatic extension updates and automatic Git fetches will be paused."),
				localize('meteredConnection.off', "Never treat the network connection as metered.")
			],
			default: 'auto',
			scope: ConfigurationScope.APPLICATION,
			description: localize('meteredConnection', "Controls whether the current network connection should be treated as metered. When metered, automatic extension updates and automatic Git fetches are paused to reduce data usage."),
			tags: ['usesOnlineServices']
		}
	}
});
