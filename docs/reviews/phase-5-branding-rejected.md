# Phase 5 (branding): review findings not acted on

Each area of phase 5 was executed by one agent and reviewed by a fresh-context reviewer; the findings below were rejected or deferred with the evidence recorded here (2026-10-14). Everything else the reviewers reported was applied.

## Product identity and packaging

- `.vscode/launch.json` configuration names such as "VS Code Server (Web)": developer-only labels of the launch configurations, never shown in the product; left to keep the upstream file mergeable.
- `resources/linux/rpm/code.spec.template` comment about "versions of VS Code alongside each other": a comment; the strings policy leaves comments alone.
- `resources/completions/*` `-p/--performance` entries: upstream staleness unrelated to the fork (`argv.ts` has no such option upstream either).

## Core strings and links

- `services/extensions/common/extensionsRegistry.ts` manifest descriptions for `engines.vscode`, `publisher` and `vscode:prepublish` name the product instead of "VS Code": the fork's `product.version` tracks upstream, so the engine range describes this product's version; the Marketplace is named as "the Marketplace".
- `workbench/browser/actions/helpActions.ts` newsletter action: product-gated on the unset `newsletterSignupUrl`, so it is never registered; deleting it and the product field is a later pass.
- `workbench/electron-browser/window.ts` emulated-build warning: no download button restored on `productService.downloadUrl`, because `product.json` sets no download URL; the warning still states what to do.
- Keychain troubleshooting links (`fwlink 2190713`, `2239490`) kept: the target section documents the OS keyring that secret storage still uses, although the page belongs to the removed Settings Sync feature.
- `nativeExtensionService.ts` `resolverExtensionNotFound` placeholder without argument: pre-existing upstream bug, out of scope.
- `extHostApiCommands.ts` and `extHostCommands.ts` API command documentation naming VS Code: API documentation describes upstream behaviour, like `vscode.d.ts`.

## Extensions

- `extensions/typescript-language-features/src/typescriptServiceClient.ts` keeps `['vscode-insiders'].includes(vscode.env.uriScheme)` after `'code-oss'` left: no behaviour change for the fork, and the minimal diff keeps upstream merges simple.
- The TypeScript crash prompt's "Report Issue" opens the product's issue reporter with the extension id only, without regenerating upstream's issue title and body: the reporter collects the extension and environment context itself.
- `extensions/terminal-suggest/src/completions/code.ts` keeps upstream's `code` CLI spec unchanged, including subcommands the fork does not have; the fork's own `vsc` spec filters them.
- `extensions/terminal-suggest/src/completions/azd.ts` keeps the Azure Developer CLI's own `copilot` and `coding-agent` subcommands: a third-party CLI specification.
- Theme labels "Dark (Visual Studio)" and "Light (Visual Studio)" stay: they name the palette they reproduce.
- `extensions/json-language-features/server/README.md`, `extensions/typescript-language-features/web/README.md` and the `CONTRIBUTING.md` files keep upstream names: developer documentation that is not packaged.

## Self-update removal and harnesses

- `test/smoke/src/main.ts` keeps `--skip-stable-build`: harmless after the download left; removing it would churn the harness options for no gain.
- `src/vs/code/electron-main/app.ts` debug log "Starting VS Code": a developer log line, not user-facing.
- The Windows installer (`build/win32/code.iss`, `inno_updater.exe`, `vcruntime140.dll`, the `inno-updater` gulp tasks) keeps its background-update plumbing: it cannot be tested without a Windows build; recorded as an open decision.

## Authentication

- No cleanup of stored `dynamicAuthProviders` state and `dynamicAuthProvider:*` secrets after deleting the dynamic provider: the feature never shipped in this product and a migration would outlive its purpose.
- No retry of dynamic client registration without the custom-scheme redirect URI (raised before the stack was deleted): moot after the deletion.

## Contributions

- `preferences/browser/preferencesSearch.ts` keeps the upstream names `getRemoteSearchProvider`, `RemoteSearchProvider` and `SettingMatchType.RemoteMatch` for a search that runs locally: internal names with no user-facing wording; renaming them would only create merge friction.
- `extensionsSlowActions.ts` keeps the upstream wiki link explaining `.cpuprofile` files: the issue is filed in the slow extension's own repository, and the fork still produces the same profile format.
- `webview/browser/pre/index.html` "An instance of the VS Code API has already been acquired": a developer-facing error naming the `acquireVsCodeApi` API, inside a CSP-hashed inline script.
