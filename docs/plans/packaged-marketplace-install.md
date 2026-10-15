# Packaged Marketplace installation

The implementation and macOS validation below are complete. A subsequent maintainer instruction authorizes committing and pushing the verified changes while the independent vendor review remains pending; see the closeout section of `docs/reviews/phase-7-packaged-validation.md`.

Fix the packaged Marketplace installation failure recorded in `docs/reviews/phase-7-packaged-validation.md`, preserving the existing decision to omit the proprietary signature verifier.

1. Add a regression at the native extension-management service boundary with `isBuilt: true`, verification enabled and no verification result. Confirm that the current implementation fails. Cover successful verification and explicit verification failures as controls, including rejected-download cleanup.
2. Make the packaged download gate accept the optional verifier's absent result without reporting verification success. Preserve rejection of concrete signature failures, signature-required unsigned extensions, corrupt archives and manifest mismatches. Keep the verifier dependency absent and avoid settings or command-line workarounds.
3. Compile, run the focused Electron tests, client type checking, lint and hygiene. Build the macOS arm64 package and repeat a real Marketplace install with isolated user-data, shared-data and extension directories.
4. Run the required fresh implementation reviews, validate findings against the code or tests, record rejected findings, and update the existing packaged-validation notes with the exact verified outcome. Leave changes uncommitted.
