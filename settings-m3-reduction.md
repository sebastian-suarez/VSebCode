# Settings/settings.json — M3/D15/D16 reduction (apply when daily-driving VSebCode ≥ 6f2061ab)

Supersedes [settings-m2-reduction.md](settings-m2-reduction.md) — with D15 (design as
default) and D16-interim baked in, the reduction is much larger than M2's. Line refs
against Settings/settings.json @ bc7132d.

## Remove whole blocks

1. **The entire "Title bar: Xcode-like" section (~125–355)**: `window.titleBarStyle`,
   `window.customTitleBarVisibility`, `workbench.activityBar.location` (all D15
   product defaults now), `vscode_vibrancy.windowMode`, `custom-ui-style.electron`,
   `custom-ui-style.font.sansSerif` (HN UI ships in product CSS),
   `custom-ui-style.external.imports` (all three files baked: zoom vars → 
   `InlineTitleBarLayout`, sticky mask → tree widget + M3 CSS, HN UI → `hnUiFont.css`),
   and the full `custom-ui-style.stylesheet` block (every rule is in source; the one
   dead rule — the singular `.search-widget-container` padding — was dropped by D14).
2. `vscode_vibrancy.theme` (~369) — vibrancy is product behavior since M1; the
   extension goes away entirely.
3. `workbench.tree.indent: 16` + `workbench.tree.renderIndentGuides: "always"`
   (~97–98) — D15 defaults.
4. `chat.disableAIFeatures: true` (~409) — defaulted true in-product (interim; the
   setting itself dies at M9).

## `workbench.colorCustomizations` (~372–387) — trim

Remove (baked):
- the four side-rail hexes `sideBar/sideBarTitle/activityBar/activityBarTop.background`
  @ `4d` (D10 + the single-painter amendment)
- `sideBarStickyScroll.background` @ `00` + `sideBarStickyScroll.shadow` @ `00`
  (forced transparent at theme resolution)

Keep (still user-side, never baked): the overlay-widget hexes @ `e6`
(`inlineChat`/`editorWidget`/`editorHoverWidget`/`editorSuggestWidget`/
`notifications`/`notificationCenterHeader`/`menu`/`quickInput`) — candidate for a
future bake if wanted.

## Your choice

- `workbench.colorTheme: "Dark+"` (~367): dropping the line switches you to the
  product default **Dark 2026** (the D15 design); keeping it keeps Dark+.

## Keep (unrelated user prefs)

`window.systemColorTheme`, `security.workspace.trust.untrustedFiles` (the trust
banner now opens above the statusbar anyway), `editor.inlayHints.fontFamily`,
`markdown.preview.fontFamily`, `errorLens.fontFamily`, and everything outside the
blocks above.

## At the same switch

- Uninstall the **Custom UI Style** and **Vibrancy** extensions.
- Retire from the Settings repo: `zoom-css-vars.js`, `tree-sticky-mask.js`,
  `hn-weight-shift.css` (all shipped in product now).
