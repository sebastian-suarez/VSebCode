# Settings/settings.json — M2 reduction (apply when daily-driving VSebCode ≥ 2811166)

**SUPERSEDED 2026-08-31 by [settings-m3-reduction.md](settings-m3-reduction.md)** —
M3/D15/D16 made the reduction much larger; apply that one instead.

Removing what M1+M2 baked into source; keeping only M3-pending material.
Line refs against Settings/settings.json @ bc7132d.

## 1. `custom-ui-style.electron` (lines ~130–143) — REMOVE whole block
M1 Phase A baked `hiddenInset` + `trafficLightPosition {18,16}` into
`defaultBrowserWindowOptions` (`2875caf`). Keep the two `window.*` settings above it —
they stay user-side per D13.

## 2. `custom-ui-style.external.imports` (lines ~155–159) — DROP the zoom shim line
```json
"custom-ui-style.external.imports": [
  "file://${userHome}/Projects/Settings/tree-sticky-mask.js",
  "file://${userHome}/Projects/Settings/hn-weight-shift.css"
],
```
`zoom-css-vars.js` is superseded by `InlineTitleBarLayout` (`7f3a2be`). The other two
retire at M3. Also trim the comment lines ~150–151 that describe the zoom shim.

## 3. `custom-ui-style.stylesheet` (lines ~160–355) — REPLACE with the M3-only rest
```json
"custom-ui-style.stylesheet": {
  ".monaco-workbench": {
    // Sidebar content: macOS source-list feel — inset rounded rows. (→ M3 in-source)
    ".part.sidebar": {
      ".monaco-list-row": {
        "width": "calc(100% - 16px) !important",
        "margin-left": "8px",
        "border-radius": "7px"
      },
      // Sticky headers: tree-sticky-mask.js maintains --sticky-clip; mask hides the
      // rows beneath the widget. (→ M3 tree-widget rework)
      ".monaco-list-rows": {
        "mask-image": "linear-gradient(to bottom, transparent var(--sticky-clip, 0px), black var(--sticky-clip, 0px))"
      },
      // Indent guides onto the twistie chevrons. (→ M3)
      ".monaco-tl-indent": { "transform": "translateX(3px)" },
      // No scroll shadow under accordion pane headers. (→ M3)
      ".monaco-scrollable-element > .shadow": { "display": "none !important" },
      ".pane-header": { "padding-left": "12px" }
    },
    // Search view: breathe + anchor the replace-toggle to the first input row. (→ M3)
    ".search-view .search-widget-container": { "padding": "8px 8px 0 4px" },
    ".search-view .search-widget .toggle-replace-button": {
      "bottom": "auto !important",
      "height": "26px !important"
    }
  }
},
```
Everything else in the old block is in source now: the two zoom vars + sidebar
title/header geometry (`ef54f60`/`e24dd1b`), view-switcher pills (`17f5378`), tab
height + text nudge (`ef54f60`/`1a7b14c`), breadcrumbs (`8c35fbd`), drag surfaces +
nosidebar/banner variants (`2811166`).

## Stays untouched until M3
`vscode_vibrancy.*`, `custom-ui-style.font.sansSerif` ("HN UI"), the two remaining
external imports, and the `workbench.colorCustomizations` overlay-widget hexes
(`inlineChat`/`editorWidget`/etc. @ e6 — never M2 scope). The four side-rail hexes
(`sideBar`/`sideBarTitle`/`activityBar`/`activityBarTop` @ 4d) were superseded by D10
and can also go with this edit.
