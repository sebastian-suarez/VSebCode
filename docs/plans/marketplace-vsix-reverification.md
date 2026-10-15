# Marketplace and local VSIX verification

The macOS verification below is complete. A subsequent maintainer instruction authorizes committing and pushing the verified changes while the independent vendor review remains pending; see the closeout section of `docs/reviews/phase-7-packaged-validation.md`.

Rebuild the current macOS arm64 working tree and verify real Marketplace and local VSIX installation on that same package. Preserve the existing uncommitted signature-gate fix and all unrelated changes.

1. Record the checkout, source hashes and personal configuration fingerprints. Review this plan before execution. Use a new temporary evidence directory, separate fresh user-data, shared-data and extension directories for each installation path, and in-memory secret storage.
2. Run the client build and focused native extension-management Electron tests, then rebuild with `npm run gulp vscode-darwin-arm64`. Record package metadata and executable, CLI and source hashes; require a populated commit field and the current signature-gate change in the packaged code.
3. Install `ms-vscode.hexeditor` by Marketplace identifier with the packaged CLI and default signature settings. Require a successful exit, installed manifest and extension listing, then launch that exact package and activate the installed extension. Capture network/install and extension-host evidence.
4. Package a small local extension fixture as a VSIX, install its absolute file path with the same packaged CLI into a separate fresh profile, and require successful installation, listing, activation and command execution. Restart and check persistence for both installed extensions. Do not change signature settings or use a verification bypass.
5. Compare personal configuration fingerprints, check logs and source status, run hygiene on the documentation, obtain both required fresh reviews, validate their findings and record any rejected findings. Update the existing packaged-validation notes with exact results and evidence paths; leave all changes uncommitted.
