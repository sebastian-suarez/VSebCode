# Phase 7 (open decisions): review findings not acted on

Each area of phase 7 was reviewed by a fresh-context Claude reviewer and by a Codex adversarial review; the findings below were rejected or deferred with the evidence recorded here (2026-10-14). Everything else the reviewers reported was applied; the review log of `docs/plans/phase-7-open-decisions.md` lists it.

## Windows installer

- The commit boundaries do not follow the plan: `e64da5fd39a` ("background-update protocol") also collapsed the `{#VersionedResourcesFolder}` path segments that the plan assigned to the versioned-layout commit, and `6ad49a15031` cannot build an installer on its own because it deletes the only producer of `tools\` one commit before the script stops packaging `tools\*`. Not rewritten: the commits are signed, `win32VersionedUpdate` was never set, so every intermediate state packages the same files, and no Windows build exists to bisect with.
- `KillContextMenuComSurrogate` is no longer called in fork builds: its only caller, `RemoveAppxPackage`, sits inside `#ifdef AppxPackageName`, which the fork never defines (no `quality`, no `win32ContextMenu`). Left where upstream has it, so that a merge of upstream's context-menu work stays mechanical.
- `CloseApplications=force` could go back to Inno Setup's default `yes`, since the update's ready signal that justified `force` is gone. Kept: it is upstream's value, `AppMutex` already keeps Setup from continuing while the application runs, so `force` only affects other processes that hold installed files, and changing install behaviour without a Windows build to test it is the riskier choice. Only the comment was corrected.

## Link presentation kinds

- `toMarkdownEditorPresentation` in `extensions/markdown-language-features/src/preview/markdownEditorRichLinks.ts` still spreads the presentation and sets `kind: presentation.kind`, a no-op now that the API union and the extension's union are identical. Kept: the line keeps the shape of upstream's `chat` to `session` mapping, so an upstream change there conflicts on one line instead of a rewritten function.
- `dataChannelService.ts` never validates the `kind` of a `linkPresentationProviders` contribution, so a third-party manifest that still declares `session` gets its updates dropped by the webview's schema parse, as `chat` has since phase 4. Upstream behaviour; no built-in extension declares such a provider.

## Profile import and export, rename suggestions

- `isProfileURL` ignores the scheme, so the web-only "Create in {0}" action of `userDataProfilesEditorModel.ts` also shows for `https://profile-*` URLs and opens them in a browser tab. Upstream behaviour, deferred to area E, which removes the web workbench.

## OSC 99 notifications

- The ownership suite installs its own `DisposableTracker` inside the test, restored in `finally`, instead of in the suite's `setup` and `teardown` as `base/test/common/event.test.ts` does. Kept: the reviewer found the swap acceptable, and the suite-level `ensureNoDisposablesAreLeakedInTestSuite()` that the lint rule requires stays in place.
- A `notify()` that throws would leak the action store built for the failed show. Not guarded: the notification service does not throw from `notify`, and the per-notification store is now created after the call.
- The member comments of `IOsc99ActiveNotification` and of the handler's fields end without a period, unlike the JSDoc of the constants. Kept: the fragments match the surrounding upstream member comments.
