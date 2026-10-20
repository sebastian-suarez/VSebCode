/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Extensions, IConfigurationRegistry } from '../../../../platform/configuration/common/configurationRegistry.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { registerProductDefaults } from './productDefaults.js';

// Registered when the module loads: the configuration service builds its default model and the
// layout reads the activity bar, tab and command center settings before any contribution runs.
registerProductDefaults(Registry.as<IConfigurationRegistry>(Extensions.Configuration));
