# M10 implementation plan — scoping (RULED)

**Status: RATIFIED by Sebastian 2026-09-02 (D21) — structure approved as proposed; the
four open questions at the bottom carry his verdicts.**

Turns the approved M10 mockups into implementation milestones. Sources of truth: board.md
§ D19 (+ amendments r1–r9), § D20 amendment (design-intent deltas), the four committed view
files (`m10-nvim-prototype/telescope/whichkey/flash.html` — PRODUCT-marked values only),
and a five-agent source survey of the fork run this session (facts below are from that
survey; line numbers = working tree at the M11-close pin).

Ground rules carried from the design phase: palette = Dark 2026 resolved through the
2026-dark include chain; chrome/material stays M1–M3; metrics honest to the product; no
staged elements. All new CSS scopes follow the two existing families
(`.monaco-workbench.mac:not(.web)` for D14-class always-on cosmetics;
`…​.inline-titlebar` for D13-gated geometry).

## Shape — six milestones plus a gated tail, dependency-ordered

```
M12 base-scene parity   (4 independent small slices; no design questions left)
M13 grid surgery        (full-height rail + editor-column statusbar)
M14 lualine statusbar   (content recomposition; mode block deferred to M17)
M15 neo-tree explorer   (letter keymap + hint footer + cursor row + git column)
M16 telescope overlay   (quick input redesign, global to every picker)
──── modal-vehicle ruling (open question 2) ────
M17 modal layer         (NORMAL/INSERT + block cursor + mode block + INSERT motion)
M18 which-key           (leader panel; rides on M17's leader concept)
M19 flash jumps         (editor contribution; rides on M17's normal mode)
```

M12→M16 need no modal machinery and are safe in any order among themselves; the listed
order goes smallest-risk-first and puts geometry (M13) before the statusbar whose home it
changes. M4 (branding) is independent of M12–M16 and can interleave anywhere — but per
the D21 vehicle ruling it becomes a PREREQUISITE of the modal tail (the vim extension
needs M4's marketplace gallery). One milestone per session per the house rhythm; each
slice below = one delegated commit, diff-reviewed, hooks ON, no AI attribution.

---

## M12 — Base-scene parity (kills the last mockup-vs-product deltas that need no new features)

### S1 — Tab row back to stock 35px (D19 r4; a deletion)
- `editorTabsControl.ts`: drop the `inlineTitleBar.js` import (line 52, all three symbols
  die with this slice), drop `onDidChangeZoomLevel` from the browser.js import (line 32,
  keep `isFirefox`), delete the zoom/inline listeners block (172–185) and the inline
  branch in the `tabHeight` getter (614–622; getter collapses to compact-or-normal).
  `getWindow` import stays (used line 585).
- `multieditortabscontrol.css` 360–370: delete the −1px text-nudge rule (the whole of
  `1a7b14c`, CSS-only — confirmed).
- KEEP (verified intact + independent): sidebar 46/24 feed (`part.ts` 22–35/242/250,
  `sidebarPart.ts` 94–182, `sidebarpart.css` 23–50), nosidebar lights clearance
  (`style.css` 95–99), 25px breadcrumbs constant, `--titlebar-height` registration,
  stock `updateTabHeight`/`--editor-group-tab-height`/`EDITOR_TAB_HEIGHT` (the 35px
  landing value comes from the vscodium font patch's `FONT.tabsSize35` — untouched).
- The M3-deferred zoom-overflow bug dies here. Mockup windows already drawn at 35px (r4).

### S2 — UI font → Geist (D19 r6)
- Replace `hnUiFont.css` (46 lines, local()-only HN faces + the
  `--vscode-workbench-font-family` rule) with a Geist css: two vendored woff2 files
  (Regular + SemiBold, OFL, ≈92 KB) + `@font-face` + the same
  `.monaco-workbench.mac:not(.web) { --vscode-workbench-font-family: "Geist", -apple-system, BlinkMacSystemFont, sans-serif; }`.
  Import site: `style.ts:8`. Consumer: `style.css:56` (single site). The vscodium
  `workbench.experimental.fontFamily` inline-var override keeps winning by design.
- Build facts (from survey — all three needed): (1) woff2 files commit at their `src/`
  path; dev out/ copies all non-TS verbatim, nothing to do; (2) the TWO esbuild loader
  maps lack `.woff2` — add `'.woff2': 'file'` to `build/lib/optimize.ts:145-151` AND
  `build/next/index.ts:842-848` (assetNames `media/[name]` already right); (3) hygiene
  filters exclude `woff` but NOT `woff2` — add to both lists in `build/filters.ts`
  (:42 unicode, :141 indent/copyright).
- Licensing: OFL block appended to root `ThirdPartyNotices.txt` + a `cgmanifest.json`
  entry (codicons precedent at :599–610). Note: unlike the icon extension's
  paths-not-fonts disclaimer, here real font files ship.

### S3 — Caption row: dim + true centering (D20-amendment design intent)
- Centering: the 12px offender is `part.css:50–52` (`.title-label { padding-left: 12px }`)
  plus the right-hand `.title-actions` width; fix scoped to the gated caption row in
  `sidebarpart.css` (the 24px block, lines 35–50 family) — kill the 12px and balance the
  actions width so the label centers on the row, not the leftover space. Settles the M2
  watch-list quirk.
- Dim foreground: the caption color is an INLINE style (`compositePart.ts:454`) from
  `sideBarTitle.foreground` (theme.ts:627), resolved by Dark 2026 at
  `2026-dark.json:85` = `#bfbfbf`. Honest route per the D19 color rule: change the THEME
  value to the approved dim `#8C8C8C`-class tone (flows through the include chain +
  splash constants; check `COLOR_THEME_DARK_INITIAL_COLORS` for a stale copy, M3
  precedent). No `!important` fights with the inline style.

### S4 — Sidebar view-body padding 6px top / 8px horizontal (D20-amendment round 3)
- Target container: `.part.sidebar > .content` (single generic site; explorer/search/git
  inherit). HARD CONSTRAINT from survey: `.content` is JS-px-sized
  (`part.ts:269-274` Dimension math) with NO `box-sizing: border-box` — naive padding
  grows the box and the composite lays out at unpadded width. The slice must pair the
  padding with `box-sizing: border-box` on that container (or subtract in the Dimension
  math) and verify no scrollbar/sticky offset regressions.
- Stacking is by design: rows already sit 8px inset (style.css:496–500), so +8px
  container padding lands rows 16px from the rail edges, pane-header text at x20 —
  exactly the approved v3 geometry. Watch the sticky-mask coordinate space
  (style.css:490–492) and the pane-header 12px rule (:540–542) at the checkpoint.

### S5 — Vim editor dressing as product defaults (D21 verdict on open question 3)
- Bake the view-1 editor look D15-style (registered defaults, user-overridable,
  mac-guarded where the setting is platform-shared): hybrid relative line numbers
  (`editor.lineNumbers: "relative"` — VS Code's relative already shows the absolute
  number on the cursor line, i.e. the hybrid look), the slim gitsigns-style gutter,
  and the active indent-scope guide. The EXACT setting/value set is lifted from the
  daily `~/Projects/Settings/settings.json` at the brief (same source the mockup used);
  Error Lens + inline blame stay extension-land (post-M4 installs, not product).

Acceptance (one dev checkpoint): stock 35px tabs at zoom 0/±2 with no overflow, Geist
renders as the workbench face (packaged build too — woff2 must survive bundling),
caption dim + centered, explorer rows 16px off the rail edges, virgin boot shows the
vim editor dressing; virgin packaged pass rides the milestone close.

---

## M13 — Grid surgery: full-height rail + editor-column statusbar (D20-amendment intent)

Target grid (survey-verified expressible; depth parity legal; NO persisted-tree
migration — only scalar sizes persist):

```
root VERTICAL
├─ titlebar
└─ main row HORIZONTAL
   ├─ activitybar (hidden default) ── sidebar (full height, owns bottom-left corner)
   ├─ right column VERTICAL: editor → panel → banner → statusbar
   └─ auxiliarybar
```

### S0 — Fix the pre-existing grid-location bug (survey finding B1)
`adjustPartPositions` (`layout.ts:1990/1995/1998/2003`) hard-codes root index `[2, …]`
for the middle section — stale since the M3 banner move made index 2 the banner leaf.
Reachable TODAY: activity bar set to `default` location + toggle sidebar position ⇒ the
banner leaf gets split and the activity bar lands at the window bottom (masked in
default config only because activityBar.location=top hides both). Fix = derive locations
via `getViewLocation` instead of literals. Belongs here because the surgery rewrites
these exact sites; can be pulled earlier as a hotfix if wanted.

### S1 — Grid descriptor + arrangement
- `createGridDescriptor` (layout.ts:2627–2763): root becomes [titlebar, main row];
  statusbar + banner leaves move into the right column; `middleSectionHeight` math
  updated. `arrangeMiddleSectionNodes` (2552–2624) emits the right-column branch.
- Gate: the design applies with sidebar LEFT (existing `Position.LEFT` gate pattern,
  `sidebarPart.ts:173`); sidebar-right keeps a sane fallback (stock full-width bar).
- Survey blocker B2: panel alignment ≠ `center` structurally conflicts (sidebar
  deliberately stops above the panel in those arrangements) — force/pin `center` under
  the gate (upstream already treats non-center as second-class). Recorded as a product
  default consequence.
- Known cosmetic: restored panel height off by 22px once (panel.size interpreted against
  a taller column) — acceptable, self-heals on first resize.

### S2 — The out-of-band copies + CSS seams (survey B3 + §6)
- Splash prepaint hard-codes full-width statusbar + `calc(100% − title − status)`
  sidebars (`src/vs/code/electron-browser/workbench/workbench.ts:180–263`, fed by
  `partsSplash.ts:92–102`) — update in lockstep or the first frame disagrees.
- `statusbarpart.css:30–39` focus radius assumes both bottom corners — bottom-left
  moves to `.part.sidebar.left`.
- `.status-border-top::after` full-width hairline (:41–52) no longer meets the window
  edge — restyle for the column.
- Notifications/center bottom offsets (`--banner-height` consumers) re-checked; part
  cycling (`navigationActions.ts:270–292`) + `getVisibleNeighborPart` re-derived.
- Drag map: statusbar drag rules (M1) survive unchanged; the newly exposed sidebar
  bottom strip inherits the rail's existing surfaces (verify at the pass).
- Opacity contract IMPROVES: today the opaque statusbar paints across the translucent
  rail's bottom; after surgery the rail's 0.30 coat owns the corner (the mockup look).

Acceptance battery: CDP geometry (rail x=0..300 full height incl. corner; statusbar
left edge = editor column left; banner appears above statusbar inside the column),
gate flips (sidebar right ⇒ fallback), panel open/close, zoom cycle, splash first
frame vs settled frame, Sebastian's visual pass on corner + statusbar seam.

---

## M14 — Lualine statusbar (view-1 approved composition; 22px stays)

Approved bar: `NORMAL │ branch · +n ~n −n · ⚠n ………… Ln, Col · N% · UTF-8 · LF · Language`
(mode block deferred — see M17; everything else mode-free).

- Vehicle (survey seam 1+2, cheapest that reaches the design): a workbench contribution
  composing via the EXISTING entry model — `IStatusbarService.addEntry` +
  `overrideEntry` (statusbarPart.ts:242, the supported restyle hook) +
  `updateEntryVisibility` for stock entries the design drops; flat-segment look +
  dot separators via `media/statusbarpart.css`. No part surgery. Custom-DOM escape
  hatch (`IStatusbarEntry.content`, precedent in tree) for the tri-color diff segment.
- NEW data segments (nothing stock to reuse — survey-confirmed absent):
  working-tree diff counts (+/~/−, computed from SCM resource groups or quick-diff)
  and scroll % (from the active editor's visible ranges; mockup shows `33%`).
- Restyled stock: branch (`status.scm.0`, workbench-rendered — reachable), diagnostics
  (`status.problems`, drop the info tier per mockup), `status.editor.selection`,
  encoding, EOL, language mode. Dropped-by-default set = everything else visible in a
  virgin boot (notifications bell etc.) — exact list is a flag round at the brief;
  hiding via `updateEntryVisibility` is user-overridable by construction (right-click
  menu still works).
- Don't trample (survey §8): M1 drag/no-drag pair (any new wrapper needs
  `-webkit-app-region: no-drag`), D9/D10 opaque backstop, banner-last grid, the
  hover-grouping JS that writes inline label backgrounds.
- Extension statusbar items still flow in (post-M4 marketplace) — they land in the
  restyled bar; fine.

---

## M15 — Neo-tree explorer keyboard UX (the "capability VS Code genuinely lacks")

Survey verdict: letter keybindings CLEANLY WIN over type-ahead — the list asks the
keybinding service before consuming printable keys (listWidget.ts:499–520 →
`createKeyboardNavigationEventFilter`). No core patch for the keymap itself.

- Keymap (all under `FilesExplorerFocusCondition` = folders view visible + explorer
  focus + !inputFocus; weight = WorkbenchContrib + explorer bonus):
  `j`/`k` → `list.focusDown/Up` · `h`/`l` → `list.collapse/expand` · `a` →
  `explorer.newFile` (exists, unbound today) · `r` → `renameFile` · `d` →
  `moveFileToTrash` (binding ships; the HINT line shows five per r9 — d dropped from
  the footer only) · `/` → `list.find` (explorer's find provider already does real
  workspace filtering).
- Type-ahead: the 800ms-session edge case (an unbound letter opens a type-ahead session
  that swallows bound letters) — proposal: disable type-ahead for the explorer tree
  (`typeNavigationEnabled: false` per-tree; `/` takes over the job). Flagged as a
  product-behavior call in the brief.
- Hint footer: the Part-level footer area EXISTS (`part.ts:150–166`,
  `Footer_HEIGHT` 35; layout already subtracts it) — sidebar-wide, above the statusbar
  seam, exactly the mockup's home. Needs a footerHeight option callback (same idiom the
  fork added for headerHeight) to match the mockup band, and a documented collision:
  `activityBar.location: "bottom"` also claims the footer (not our default; footer wins
  under the gate, noted).
- Content per r9: five hints right-aligned 16px off the rail's right edge —
  `j/k move · h/l fold · a add · r rename · / filter`.
- Cursor row: focus-row styling on the M3 inset-row grammar (tokens
  `list.focusBackground`/`.focusOutline`; the generated per-list rules inherit the 7px
  radius — layer, don't fork).
- Git letter column: today the badge is a `::after` floating after the label
  (iconlabel.css:101–107), NOT a right-aligned column. Slice restyles it into the
  mockup's fixed right column (CSS-first; labels.ts only if flex order needs it).
  Tinted filenames already come from the same decoration.

---

## M16 — Telescope quick input (view-2 approved; restyle is global to every picker by construction — one controller, one widget)

- Geometry: window-centered 920px panel, prompt at BOTTOM, list ABOVE in descending
  order (best match adjacent to prompt). Survey touch points:
  `MAX_WIDTH` 600→920 + css width (+ reconsider the 0.62 golden-cut clamp);
  position branch `quickInputController.ts:956–962` anchors by `bottom` (short lists
  grow upward, prompt never jumps); DOM order flip (flex column-reverse or reorder the
  appends); data order reversed at the single choke point `_setElementsToTree`
  (rows are absolutely positioned — CSS cannot reverse), comparator negated;
  activation defaults flipped (trySelectFirst / ItemActivation.FIRST / First/Last
  scrollTop semantics). Neutralize the drag/viewState persistence
  (`workbench.quickInput.viewState`) so the baked position is authoritative.
- Coat: `quickInput.background` @ 0.90 via the existing theme-resolution mechanism
  (new constant beside `MAC_TRANSLUCENT_SURFACE_ALPHA` — 0.30 is a shared absolute);
  composites over the editor scene = exactly the approved look (mockup panel has no
  backdrop blur; no dim per r2). Single-painter discipline: the list + sticky get the
  alpha-0 treatment or they double-coat (survey-confirmed second coat today). Add
  `overflow: hidden` for the 12px radius + fix the stale 5px titlebar-corner rule
  (moves to bottom corners in the flipped layout).
- Rows: M3 inset-row cosmetics (22px, 7px radius), mono query vs UI-font rows,
  match highlighting per the approved tokens; previews keep absolute line numbers.
- Motion (D19 r8 PRODUCT values): entrance 180ms fade + scale 0.97→1 on
  cubic-bezier(0.23,1,0.32,1) from its own center; dismiss 120ms fade;
  prefers-reduced-motion = opacity-only.
- INSERT handoff: the signal exists today (`onShow`/`onHide` + `inQuickOpen` context
  key; command-center precedent at commandCenterControl.ts:60–73) — the statusbar
  flip itself ships with M17's mode block; M16 just keeps the hook clean.
- Open design question carried from r5 (flash pattern echo) does NOT touch this
  milestone.

---

## M17–M19 — the modal tail (vehicle RULED: marketplace vim extension — D21)

Sebastian's D21 verdict: the vim engine comes from a MARKETPLACE VIM EXTENSION
(VSCodeVim or vscode-neovim), not a native layer. Consequences: M4 (gallery) is a hard
prerequisite of this tail; the specific extension pick + integration depth = the M17
research round; the design will not match the mockups pixel-for-pixel where the
extension owns the surface — deltas surfaced per-view for his verdicts.

- **M17 vim-extension integration** (research round first, then slices): pick the
  extension (VSCodeVim vs vscode-neovim — the latter runs real Neovim, so upstream
  which-key/flash plugins become candidates INSIDE it; that choice reshapes M18/M19);
  wire the lualine MODE block to the extension's mode state (survey facts: mode
  arrives as an extension statusbar item via `statusBarExtensionPoint.ts:135` —
  restylable from core via `overrideEntry`, repositioning needs a fork-side priority
  remap or CSS order; core itself has NO mode context key — `InputMode` is
  insert/overtype only); block-cursor-vs-beam handled by the extension; the 120ms
  INSERT crossfade + the M16 handoff hook land here (beam blink is already stock
  500ms).
- **M18 which-key** (view 3): 964×83 leader panel bottom-anchored to the editor column
  on the 8px grammar, panel vocabulary tokens, SPC breadcrumb showcmd in the title
  row, first leader map `,` `/` `b` `d` `e` `f` `g` `w` (grounded-only rule durable);
  motion = 8px rise after the timeoutlen beat, 120ms dismiss. Shape depends on the
  M17 extension pick: own widget driven by the extension's leader state, or a
  restyled extension surface — decided at the M18 brief.
- **M19 flash** (view 4): foreground fade to comment tone (decorations), flat accent
  label cells, equal match banding, g-excluded alphabet, nearest-to-cursor
  assignment; `s` entry point is normal-mode (extension-owned). Same shape question
  as M18 (vscode-neovim could run flash.nvim itself; VSCodeVim has easymotion).
  Open r5 question for this brief: where the typed pattern lives (no cmdline echo
  ruled).

---

## Rulings (Sebastian, 2026-09-02 — recorded as D21 on the board)

1. **Structure APPROVED as proposed** — M12→M16 in the listed order, modal tail gated;
   M4 interleaves at his call (and now gates the tail, see 2).
2. **Modal vehicle = MARKETPLACE VIM EXTENSION** (VSCodeVim or vscode-neovim; the
   specific pick + integration depth = M17's research round). M4's gallery becomes a
   prerequisite of M17–M19; the lualine (M14) ships without the mode block until M17.
3. **Editor dressing BAKES as product defaults** (D15 pattern) — added as M12-S5.
4. **B1 grid-location bug rides M13-S0** (no earlier hotfix; defaults mask it).
