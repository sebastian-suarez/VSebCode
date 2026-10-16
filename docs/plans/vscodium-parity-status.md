# VSCodium parity implementation status

The baseline audit covers VSCodium commit `be70704abf84fc6c7721f94478dfcccd2dc6163e` against VSebCode `0778ae2564bc0682c3947fb59378f8cf278ab5a3`. This follow-up accounts for all 21 Missing and 11 Partial patch entries, plus the explicitly requested channel and post-install effects. The original audit remains a historical baseline. The passing primary draft is integrated into the main checkout. Both second-round review streams have returned for all eight supplied scopes. The primary passes the final checks; the rival has documented compile and behavioral failures. Detailed comparison and review limits are recorded in the validation report; no post-fix reviewer approval is claimed.

## Maintainer decisions

Preserve removed AI/chat, updater, server/standalone-web and Microsoft account/service surfaces, the absent extension-signature verifier policy, local Settings search and the theme walkthrough. Keep Microsoft Marketplace and generic development extensions. Use `Sebastian Suarez` for policy organization, `SebastianSuarez` for the Windows vendor segment, `/etc/vsc/policy.json` for Linux policy, and the approved repository's `main/announcements-extra.json` feed. Keep Electron 43.7.7 on every architecture. The approved installation block is recorded in [vscodium-blocked-extensions.json](vscodium-blocked-extensions.json).

## Effect ledger

Paths below are relative to the pinned VSCodium `patches/` directory. “Preserved boundary” means the maintainer explicitly retained a previous decision; it is not an unimplemented compatible effect.

| Patch | Result in this draft |
| --- | --- |
| `00-brand-remove-branding.patch` | Existing VSebCode identity remains. Stale AI wording in the modern UI setting is removed. Theme walkthrough, upstream developer wording and pending replacement artwork remain by decision. |
| `00-community-add-announcements.patch` | Validated text-only Welcome links, maximum five entries, page-lifetime request/failure cache, disabled fallback, cancellation, localized UI and the approved empty feed. |
| `00-security-add-command-filter.patch` | Application-scoped `on`/`off`/`ask` rules in workbench command dispatch, default `terminal.newLocal` denial, localized confirmation and live configuration. Existing trust gates remain. This is a command-dispatch filter, not a sandbox for extension code. |
| `00-settings-gallery.patch` | Six gallery environment overrides, custom latest URL template and propagation to renderer/native/browser extension hosts; official Marketplace defaults remain. |
| `00-settings-user-product.patch` | Selected user-data product overrides in main/CLI before consumers initialize; recursive plain-object merge, array/scalar/null replacement, prototype-key exclusion, diagnostics for invalid roots and stable selected path. |
| `00-telemetry-disable.patch` | Three orphan Command Palette AI/NLP settings and stale fields removed. Deleted senders remain deleted; working local Settings search remains enabled. |
| `60-security-add-option-for-malicious-ext.patch` | Machine-scoped default-on control feed; disabled makes no request and returns the complete current empty manifest including `autoUpdate`. |
| `00-ui-custom-font.patch` | Twelve settings, inherited/clamped regional metrics, live list remeasurement and surviving CSS/control/view targets adapted. Workbench-specific CSS resides in the workbench layer. Deleted AI/session targets remain absent. The font-relative sizes are exact fractions of each region's base size (13px, 12px for the status bar, 16px for the activity bar) with that base as the fallback, and they replace the upstream declarations in place instead of duplicating rules, so the cascade (including the Modern UI connected tabs and status bar margins) and the rendered geometry at the default size are unchanged; the icon theme keeps its own icon font size. |
| `00-ui-improve-eol-banner.patch` | Stored-dismissal display guard with explicit/default application scope. No updater, EOL content or dismissal writer is introduced. |
| `00-vsce-use-custom-lib.patch` | Build tool and both listFiles callers use `@vscodium/vsce`; npm-generated build lock excludes `@vscode/vsce-sign`. The intentionally absent runtime verifier stays absent. |
| `10-version-add-release.patch` | Snap uses the human-readable package version; timestamp-specific version changes remain inapplicable to this fork's version scheme. |
| `12-update-add-cooldown.patch` | Extension update visibility has the 48-hour default, rounded/absolute age, zero bypass and boundary tests. By maintainer decision, age uses the offered version's publication time so frequent prereleases cannot keep an older stable update hidden. Product updater remains removed. |
| `20-keymap-use-custom-lib.patch` | VSCodium native-keymap package, imports, pruning, lint/native checks and npm lock updated; macOS packaged loading exercised. |
| `21-policy-use-custom-lib.patch` | Approved policy branding and registry paths; current policy-watcher's supported `registryPath` API retained. Removed managed-AI policy remains absent. |
| `22-osproxy-use-custom-lib.patch` | VSCodium proxy packages, fetch/pruning/universal rules and extra Linux mappings; macOS packaged loading exercised. Removed AI diagnostics remain absent. |
| `30-build-add-missing-dependencies.patch` | Build-tool native tree-sitter is optional, npm lock metadata regenerated; task loading and unaffected preparation exercised with native packages absent. Shipped WASM remains. |
| `50-build-improve-gulp-tasks.patch` | Reusable desktop prepack/per-target packing with existing full/CI entry points, one registration, no macOS packaging stats or private-property mangling. REH/Copilot products remain removed. |
| `61-extension-close-connection.patch` | Desktop control requests close the connection, preserving request metadata; browser requests omit the forbidden header. |
| `linux/00-asset-fix-rpm-version.patch` | `Release: el8` and `%config(noreplace)` on packaged product.json. |
| `linux/00-env-improve-xdg-path.patch` | Git and generic Flatpak IPC paths use a validated app ID under the runtime directory; normal fallbacks remain. |
| `linux/00-log-use-state-home.patch` | User-state paths propagate through main/window/renderer; Linux default and portable state layouts and explicit log paths are preserved. Explicit CLI/app-data selection keeps logs with that data; app-state can override the location, with separate hashed subdirectories for isolated profiles. |
| `linux/00-policy-use-custom-path.patch` | Linux system policy reads `/etc/vsc/policy.json`. |
| `linux/00-terminal-cmd-in-shell.patch` | Configured Linux terminal commands run through a shell; generated arguments are POSIX-quoted, including Ghostty/nested bash cases. Real fake-executable argv tests cover metacharacters. |
| `linux/31-build-fix-dependencies.patch` | Compatible reference-list mismatch behavior; removed tunnel scanning stays absent. Existing macOS signing helper remains and unrelated transitive dependency refresh is excluded. |
| `linux/41-arch-add-support.patch` | Alternate Electron repository/tag/checksum and verified sysroot source controls. Runtime replacement/downgrade is rejected. Removed REH/Rust download paths remain absent. |
| `linux/42-arch-add-ppc64le.patch` | Desktop/scan/package/compiler/sysroot/extension/proxy/ripgrep mappings, with explicit prerequisite gate; currently blocked for missing target assets/toolchain. |
| `linux/43-arch-add-riscv64.patch` | Surviving desktop and package/toolchain/extension/proxy/ripgrep effects, with explicit prerequisite gate; currently blocked for missing target assets/toolchain. |
| `linux/44-arch-add-loong64.patch` | Surviving mappings plus missing transitive package/dependency/sysroot support, with explicit prerequisite gate; currently blocked for missing target assets/toolchain. |
| `linux/45-arch-add-s390x.patch` | Surviving mappings and prerequisite gate; also explicitly blocked on absent s390x proxy package support. |
| `linux/46-deb-use-libasound2t64-compat.patch` | ALSA t64/legacy/OSS alternatives applied consistently to active Debian dependency/reference paths. |
| `windows/59-build-replace-signature.patch` | Newest usable SDK signtool discovery with host-architecture/PATH fallback; signature stripping remains before resource changes. |
| `windows/71-build-disable-appx.patch` | Active AppX bundle/manifest branches and installer definitions removed while preserving current no-AppX packaging. |

Additional requested effects: the built-in/system extension update guard applies across quality channels and honors the explicit allowlist; telemetry URL-authority rewriting runs during normal/fast dependency preparation and after original built-in VSIX verification, including cache paths. Rewriting preserves external/inline source maps and source contents, refuses malformed affected maps and skips binary/foreign symlink content. DMG names derive from product metadata. Linux desktop associations and Arabic labels are ported without changing product identity.

The compatibility overlay retains only surviving generic development/open remote proposal, extension-kind and virtual-workspace entries. All granted proposal files must exist; removed AI/service grants are excluded. Installation, update and reinstallation of the approved 26 service extension IDs are blocked case-insensitively through gallery/VSIX/dependency/location/profile entry points, independent of the optional control feed, signature setting or user allowlist. Existing installed extensions are not disabled or deleted. No claim is made that every third-party extension was exercised.

The semver question resolves to an unused sandbox dependency: no surviving source consumes it. The root sandbox-runtime dependency and obsolete ASAR exceptions are removed. The surviving TypeScript extension packages its own semver dependency. The VSCodium patch and replacement-package licenses are included in `ThirdPartyNotices.txt`.

## Extra Linux architecture prerequisites

| Prerequisite | PPC64LE / RISC-V / Loong64 / s390x |
| --- | --- |
| Runtime | Exactly Electron 43.7.7. A matching custom repository/tag and trusted checksum file are required; none is substituted automatically. |
| Native modules | Target ELF binaries for watcher, watchdog, keymap, spdlog, SQLite, Kerberos and node-pty are required. Host macOS binaries do not satisfy the gate. |
| Proxy | Namespace/mappings exist for PPC64LE, RISC-V and Loong64; s390x is explicitly unsupported by the selected resolver package. |
| Ripgrep | The matching Linux asset must be present; PPC64LE uses Node's `ppc64` normalization. |
| Compiler/sysroot | Explicit target triplet, compiler executables and sysroot required; alternate download sources require checksums. |
| Package mappings | Desktop, scan, DEB/RPM types and dependencies are registered; registration is not a successful build. |
| Execution | Blocked on prerequisites in this checkout. Linux/Windows native/release execution remains deferred by maintainer decision. |

## Verification record

The parent-run acceptance fixtures and later regression/harness supplements record their hashes under `/tmp/vsebcode-vscodium-parity/acceptance` through `acceptance-v7`. The [validation report](../reviews/vscodium-parity-validation.md) records completed client/extension builds, 695 build tests, shared and targeted Electron/Chromium tests, type/layer/API/Monaco/style checks, lint/hygiene, actual dependency/cache preparation, and macOS packaged CLI/UI checks. All 30 final packaged UI scenarios, nine CLI checks and both product-name path operations pass. After integration, the main checkout passes 695 build tests, 478 affected Electron tests and 59 Chromium tests, with the required source checks. Both review streams completed their supplied implementation scopes; the validation report records final-fix coverage limits and the unavailable initial independent plan review. The rival comparison is complete and the primary is selected as a whole.

Final maintainer clarification: the 26-ID service policy blocks new installations, updates and reinstalls. Existing copies keep running. Metadata-only copy/move operations at the same already-present location remain available.
