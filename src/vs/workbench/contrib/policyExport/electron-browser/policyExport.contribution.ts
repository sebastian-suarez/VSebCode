/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Copyright (c) Sebastian Suarez. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IWorkbenchContribution, registerWorkbenchContribution2, WorkbenchPhase } from '../../../common/contributions.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IWorkbenchConfigurationService } from '../../../services/configuration/common/configuration.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { INativeEnvironmentService } from '../../../../platform/environment/common/environment.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { INativeHostService } from '../../../../platform/native/common/native.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { Extensions, IConfigurationRegistry } from '../../../../platform/configuration/common/configurationRegistry.js';
import { IProgressService, ProgressLocation } from '../../../../platform/progress/common/progress.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { URI } from '../../../../base/common/uri.js';
import { VSBuffer } from '../../../../base/common/buffer.js';
import { PolicyCategory, PolicyCategoryData } from '../../../../base/common/policy.js';
import { ExportedPolicyDataDto } from '../common/policyDto.js';
import { join } from '../../../../base/common/path.js';
import { hasKey } from '../../../../base/common/types.js';
import { arePolicyReferenceTypesCompatible } from '../common/policyReference.js';

export class PolicyExportContribution extends Disposable implements IWorkbenchContribution {
	static readonly ID = 'workbench.contrib.policyExport';
	static readonly DEFAULT_POLICY_EXPORT_PATH = 'build/lib/policies/policyData.jsonc';

	constructor(
		@INativeEnvironmentService private readonly nativeEnvironmentService: INativeEnvironmentService,
		@IExtensionService private readonly extensionService: IExtensionService,
		@IFileService private readonly fileService: IFileService,
		@IWorkbenchConfigurationService private readonly configurationService: IWorkbenchConfigurationService,
		@INativeHostService private readonly nativeHostService: INativeHostService,
		@IProductService private readonly productService: IProductService,
		@IProgressService private readonly progressService: IProgressService,
		@ILogService private readonly logService: ILogService,
	) {
		super();

		// Skip for non-development flows
		if (this.nativeEnvironmentService.isBuilt) {
			return;
		}

		const policyDataPath = this.nativeEnvironmentService.exportPolicyData;
		if (policyDataPath !== undefined) {
			const defaultPath = join(this.nativeEnvironmentService.appRoot, PolicyExportContribution.DEFAULT_POLICY_EXPORT_PATH);
			void this.exportPolicyDataAndQuit(policyDataPath ? policyDataPath : defaultPath);
		}
	}

	private log(msg: string | undefined, ...args: unknown[]) {
		this.logService.info(`[${PolicyExportContribution.ID}]`, msg, ...args);
	}

	private async exportPolicyDataAndQuit(policyDataPath: string): Promise<void> {
		try {
			await this.progressService.withProgress({
				location: ProgressLocation.Notification,
				title: `Exporting policy data to ${policyDataPath}`
			}, async (_progress) => {
				this.log('Export started. Waiting for configurations to load.');
				await this.extensionService.whenInstalledExtensionsRegistered();
				await this.configurationService.whenRemoteConfigurationLoaded();

				this.log('Extensions and configuration loaded.');
				const configurationRegistry = Registry.as<IConfigurationRegistry>(Extensions.Configuration);
				const configurationProperties = {
					...configurationRegistry.getExcludedConfigurationProperties(),
					...configurationRegistry.getConfigurationProperties(),
				};

				const policyData: ExportedPolicyDataDto = {
					categories: Object.values(PolicyCategory).map(category => ({
						key: category,
						name: PolicyCategoryData[category].name
					})),
					policies: []
				};

				for (const [key, schema] of Object.entries(configurationProperties)) {
					// Check for the localization property for now to remain backwards compatible.
					if (schema.policy?.localization) {
						policyData.policies.push({
							key,
							name: schema.policy.name,
							category: schema.policy.category,
							minimumVersion: schema.policy.minimumVersion,
							localization: {
								description: schema.policy.localization.description,
								enumDescriptions: schema.policy.localization.enumDescriptions,
							},
							type: schema.type,
							default: schema.default,
							enum: schema.enum,
							included: schema.included !== false,
						});
					}
				}
				this.log(`Discovered ${policyData.policies.length} policies to export.`);

				// Merge the extension configuration policies of the product.
				const extensionPolicies = this.productService.extensionConfigurationPolicy;
				// Reference-shaped product entries (extension settings attaching to an in-code-owned
				// policy), collected by owning policy name so they can be linked below.
				const productReferencesByPolicyName = new Map<string, string[]>();
				if (extensionPolicies) {
					const existingKeys = new Set(policyData.policies.map(p => p.key));
					let added = 0;
					let referenced = 0;
					for (const [key, entry] of Object.entries(extensionPolicies)) {
						if (existingKeys.has(key)) {
							continue;
						}
						// A reference entry carries a `policyReference` pointer; the owner — and its
						// `value` callback — is declared by an in-code setting. Link it below instead
						// of merging it as an owner.
						if (hasKey(entry, { policyReference: true })) {
							const ownerName = entry.policyReference?.name;
							if (!ownerName) {
								throw new Error(`Extension policy reference '${key}' is missing required 'policyReference.name' field.`);
							}
							const list = productReferencesByPolicyName.get(ownerName) ?? [];
							list.push(key);
							productReferencesByPolicyName.set(ownerName, list);
							referenced++;
							continue;
						}
						// Owner ("parent") entry: full catalog metadata is required.
						if (!entry.name || !entry.category || !entry.localization?.description) {
							throw new Error(`Extension policy '${key}' is missing required 'name', 'category', or 'localization.description' field.`);
						}
						policyData.policies.push({
							key,
							name: entry.name,
							category: entry.category,
							minimumVersion: entry.minimumVersion,
							localization: {
								description: entry.localization.description,
								enumDescriptions: entry.localization.enumDescriptions,
							},
							type: 'boolean',
							default: true,
							included: true,
						});
						added++;
					}
					this.log(`Merged ${added} extension configuration policies (${referenced} references).`);
				}

				// Link policyReference settings and enforce type match (same value is applied verbatim).
				// References come from both in-code settings (`getPolicyReferenceConfigurations`) and
				// reference-shaped product entries collected above.
				const policyReferenceConfigurations = configurationRegistry.getPolicyReferenceConfigurations();
				const linkedProductReferenceNames = new Set<string>();
				let linkedReferences = 0;
				for (const policy of policyData.policies) {
					const references = new Set<string>(policyReferenceConfigurations.get(policy.name) ?? []);
					const productReferences = productReferencesByPolicyName.get(policy.name);
					if (productReferences) {
						for (const productRefKey of productReferences) {
							references.add(productRefKey);
						}
						linkedProductReferenceNames.add(policy.name);
					}
					if (references.size > 0) {
						for (const referenceKey of references) {
							const referenceType = configurationProperties[referenceKey]?.type;
							// Extension-contributed reference settings are not registered in the
							// headless export process, so their type cannot be validated here; only
							// enforce the type match for settings present in the registry.
							if (referenceType !== undefined && !arePolicyReferenceTypesCompatible(policy.type, referenceType)) {
								throw new Error(`Policy '${policy.name}': setting '${referenceKey}' (type '${referenceType}') declares a 'policyReference' to a policy of type '${policy.type}'. A 'policyReference' must match the owning setting's type.`);
							}
						}
						policy.referencedSettings = [...references].sort();
						linkedReferences += references.size;
					}
				}
				// A reference must point at an owner. An unmatched product reference means the
				// in-code owner was not loaded/registered — surface it rather than silently dropping.
				for (const policyName of productReferencesByPolicyName.keys()) {
					if (!linkedProductReferenceNames.has(policyName)) {
						throw new Error(`Extension policy reference to '${policyName}' has no owning policy. Ensure an in-code setting declares 'policy: { name: '${policyName}', ... }'.`);
					}
				}
				this.log(`Linked ${linkedReferences} referenced settings across ${policyData.policies.length} policies.`);

				const disclaimerComment = `/** THIS FILE IS AUTOMATICALLY GENERATED USING \`npm run export-policy-data\`. DO NOT MODIFY IT MANUALLY. **/`;
				const policyDataFileContent = `${disclaimerComment}\n${JSON.stringify(policyData, null, 4)}\n`;
				await this.fileService.writeFile(URI.file(policyDataPath), VSBuffer.fromString(policyDataFileContent));
				this.log(`Successfully exported ${policyData.policies.length} policies to ${policyDataPath}.`);
			});

			await this.nativeHostService.exit(0);
		} catch (error) {
			this.log('Failed to export policy', error);
			await this.nativeHostService.exit(1);
		}
	}
}

registerWorkbenchContribution2(
	PolicyExportContribution.ID,
	PolicyExportContribution,
	WorkbenchPhase.Eventually,
);
