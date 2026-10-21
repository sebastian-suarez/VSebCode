# UI roadmap: the order of the surface changes

The order in which the fork implements the surfaces of the v10 design (`~/Projects/VSebCode-design/VSebCode v10.dc.html`, build notes `v10-notes.md`, the two screen maps of that folder for the inventory and the frequency tiers), decided on 2026-10-16 after step 1 (`docs/plans/ui-step-1-glass-sidebar.md`) and revised after the two adversarial reviews of the same day (see "Review"). Each step gets its own plan file (`docs/plans/ui-step-<n>-<topic>.md`) before it starts, attacked by an adversarial review before execution, and ends like step 1: the checks, the Electron suite, smoke captures of every state the step names, two fresh-context reviews, the rejected findings logged under `docs/reviews/`. Items marked **ask** were maintainer decisions; the maintainer answered all of them on 2026-10-20, and the answers recorded in "Decisions, by step" take precedence over the recommendations in the step texts. A step's plan raises any new question the same way; no step starts on an assumption.

## How the order was decided

1. Geometry before content. Anything that moves a part or fixes a band height (the full-height column, the title band, the status line) comes before the restyle of what sits in it, so no surface is styled twice against two geometries.
2. Decide what disappears before styling what stays. The design has no activity bar, command center, layout control, minimap or tab row; hiding them is a defaults change and shortens the restyle list. The same step decides which extensions the design assumes, so the editor steps know whether they style an extension's decorations or build fork ones.
3. Daily surfaces before weekly ones (the frequency tiers of the screen maps), and within a tier restyles (a stylesheet and small hooks) before new fork code (the picker preview column, the git float, the neo-tree behaviour).
4. One host, one step. The quick input serves the pickers, every extension prompt and the engine's command line; the status bar serves the fork's items and the extensions' items. Each host is restyled once, for all its variants, by the step that owns it.
5. Engine-dependent surfaces last. The mode pill, the command line behaviour, jump labels and the leader menu need the state of vscode-neovim (decided on 2026-10-15 as the engine), which the fork neither ships nor controls yet; everything before them works without it, and the inputs the engine draws are restyled by their host step.
6. Upstream merge cost. Each step keeps its code in fork files (a contribution folder, a stylesheet, a registered default) with the fewest hooks in upstream files, lists in its status the upstream files it modifies, and styles against the fork's own classes and theme tokens rather than Modern UI's internals, which upstream still moves. `layout.ts`, `titlebarPart.ts`, `statusbarPart.ts` and the quick input are the files where every fork hunk costs a conflict per merge, so each is touched by one step only.

## Rules for every step

- Compare with the mockup first. The mockup is dark-only and hard-codes its colors; every value in the fork derives from theme tokens and is captured in a light theme, high contrast, reduced transparency and reduced motion (the mockup's `prefers-contrast`, `prefers-reduced-transparency` and `solid` fallbacks map to the gates step 1 already uses).
- Both side bar positions, both densities of `window.density.layout`, zoom, hidden parts, full screen, a reload, a second window and auxiliary windows (never restyled) are in each step's captures. macOS is the validation platform; the code stays platform-neutral unless the step says otherwise.
- Key bindings the design assigns (the neo-tree map, the picker keys) are registered with focus `when` clauses so they never reach an editor; the leader itself belongs to the engine.
- What the design leaves undefined goes back to the design project as a question, not into the code as a guess. It still owes the light appearance and the inactive-window state of the glass column, and its compact density only removes the card gaps and corner radii (`colGap`, `paneR` in the mockup's script), so every compact-density height is the design's to decide.

## The order

### Step 2: look defaults and assumed extensions

Fork defaults registered with `registerDefaultConfigurations` from one contribution with a test, no upstream edits: activity bar hidden, command center and layout control off, minimap off, preview editors off, sticky scroll on, inlay hints on, gutter diff decorations, line blame, the line highlight only in the focused editor, cursor surrounding lines (the "most of the look is configuration" table of the Neovim-first screen map). Search, source control and extensions stay reachable through their commands until the pickers exist. The design also draws two things the screen map marks as extension work and v10 renders in its script: the diagnostic text after the line (`DIAG`, Error Lens in the screen map) and the TODO, FIXME and HACK highlights (`TODORE`, Todo Tree). **ask**: tabs off (`workbench.editor.showTabs: none`, the design's bufferLine question; recommended, v10 ships the buffer line off and the connected tabs stay a setting away); relative line numbers, lightbulb off and code lens off, which only make sense with the modal engine (recommended: in step 14, not here); the density default (recommended: `default`, the mockup's default); the two assumed extensions, recommended through the product's extension tips and styled in step 6, or built as fork decorations (recommended: the extensions first, fork decorations only if their look cannot match).

Why first: cheap, reversible, and it fixes the list of surfaces the later steps restyle and the extensions they style.

### Step 3: the full-height column and the band heights

The side bar (with the activity bar when visible) becomes the outer column of the grid, spanning the title, middle and status rows; the title bar and the status bar belong to the main area. The column's top band holds the traffic lights (the mockup: 44px, the lights vertically centered through the window's traffic-light position, the band a drag region), and the mockup leaves 76px for the lights in the title row when the column is hidden. The baseline the grid consumes today, through each part's minimum height: the custom title bar on macOS is 35px with the command center, otherwise 32px on macOS 26 and later and 28px before; the status bar is 22px (font-relative since the parity work) plus the Modern UI floating padding of 6px, 4px at compact density. Both bands are settled in this step so the title row and the status line are styled once: the title band and the status line at the default density (**ask**, recommended: the mockup's 44px and 34px) and their compact values (**ask**, the design owes them; recommended until then: the upstream values). Covers: the side bar on the right (the column mirrors), the hidden side bar, zen mode, full screen with and without the custom title bar, the banner (main area), every panel position, the glass hole (it becomes the column's rectangle, which simplifies the bounds the side bar part reports) and the splash (paints the column and both bands). Platforms: the column with the band is macOS with the custom title bar; with the native title bar the column spans the middle and status rows only; Windows and Linux keep the full-width title bar, which hosts their menu bar and window controls, until a design for them exists (**ask**).

Why second: it is the riskiest change (the grid descriptor and the arrangement code of `layout.ts`), every later capture must be measured against the final geometry, and step 1 built the hole and splash machinery it generalises.

### Step 4: the title row

The title bar content of the main area in the band step 3 fixed: left, the jump pill (navigate back and forward, dimmed when the history is empty) and the window title as two spans (project name, then the relative path in monospace) with the "Paused at line" indicator while a debug session is stopped; right, the picker pill group (Files, Grep, Git, Terminal: quick open, quick text search, the source control view until step 10, toggle terminal) and the Debug pill, replaced while debugging by the debug toolbar pills and Stop (`debug.toolBarLocation` has a `commandCenter` value that requires the command center, so the fork adds its own slot). The actions register in the title bar menus; the pills and their glass are a stylesheet over the opaque main area. **ask**: the items of the picker group; whether the title keeps following `window.title`.

### Step 5: the status line

The status bar part restyled as the mockup's line in the height step 3 fixed: monospace, pill items, the item order (a slot for the mode pill first, then branch and diff stat, window and file, diagnostics, then language and position), the extensions' items restyled through the part, items hidden by default (**ask**: the remote indicator, the notification bell, feedback), the branch item opening the git float once step 10 exists. The diff stat (+33 −3) is not reported by the built-in git extension (**ask**: add it to the fork's copy of the extension, or drop it from the design). The mode and recording pills themselves are step 14.

### Step 6: editor cards and zones

The editor group header as the winbar (breadcrumbs, the modified dot, the line indicator), the window letters shown by a window-picker command (fork code: an overlay letter per group, one key picks the group), the fading of inactive splits (the mockup's `workbench.dimInactiveWindows`, on by default: with several splits, every split but the focused one fades to 50%, and all of them while the explorer tree has focus; while the terminal has focus (the mockup's terminal mode), every split fades, even a single one; the terminal itself never fades, and the mockup has no state for another app being active, unlike upstream's `accessibility.dimUnfocused.enabled`, which step 2 turned on until 2026-10-21 and which also dims the focused editor while another app is active), the fold ellipsis on the cursor line, the diagnostic text after the line and the TODO highlights (styled on the extensions step 2 chose, or built as fork decorations), and the inline zones restyled: the hunk zone (the quick diff peek with the git extension's stage and revert actions, next and previous) and the peek zone (references and definition). A restyle plus one new command.

### Step 7: the LSP floats

Completion with its docs panel, hover, signature help, code actions (groups, 1 to 9 pick, footer hints; the numbers are fork code in the action widget), rename, in one float style defined here and reused by the pickers. Stylesheets from the workbench layer over the editor widgets (`src/vs/editor` keeps upstream's wording and DOM).

Why before the pickers: constant-frequency surfaces, stylesheets only, and the float tokens get fixed on the smallest widgets first.

### Step 8: the explorer as neo-tree

The content of the glass column: the project header (name, path, opens the projects picker), the source pills (filesystem is the files explorer, buffers the open editors, git status the source control resources read through the SCM service), root navigation, the filter row, the rows with git decorations and the `[+]` marker, hidden items, the info, preview and help popovers, the empty states, the neo-tree key map (add, delete, rename, copy, move, clipboard, open and close with l and h, open through the window picker, the sources with < and >, refresh, sort), follow current file and the optional Go to file button. Most actions exist as explorer commands; the source switcher, root navigation, filter and popovers are fork code in `contrib/files`. The source control view container itself is not touched here; step 10 owns every SCM presentation. **ask**: one explorer view with sources rather than the standard view container (recommended); Outline and Timeline hidden by default (recommended); the Go to file button default (v10: off).

Why here: the first multi-commit feature, after the frame is complete, and v10's whole delta from v9.

### Step 9: the quick input and the pickers

The quick input is restyled once, for every variant it hosts: (a) the float (18px radius, prompt character, count, 32px rows with caret, dot, primary, secondary and right columns, footer hints, and the scrim the mockup paints behind the picker, **ask**, upstream has none), applied to quick picks, input boxes, the prompts extensions open through the quick open API (the design's select and input prompts) and the command line and search inputs of vscode-neovim, which its command line manager builds with `createQuickPick` (verified in the 1.20.0 copy of the dev profile; the captures of this step run with the extension installed, its behaviour stays step 14); (b) the source tabs; (c) the preview column, new fork code: code, project (branch, working tree, last opened, windows restored on switch), command, extension (trust, signature not verified), list, diff and setting previews; (d) the sources that exist or are data the workbench already has: Files, Grep, Buffers, Projects (with session restore), Commands, Extensions, Settings (the Changed filter and "settings.json, only what you changed"), Symbols (the `@` and `#` quick access), Diagnostics (the markers), Keymaps (the keybindings editor's data), Themes (the theme quick pick with its live preview), Jumps (the editor history service's navigation stack, the same data as the title row's jump pill; vscode-neovim maps ⌃o and ⌃i to the workbench's navigate back and forward commands in its jump list override, so the jump list is workbench data, not the engine's). The other sources of v10's `EXTRA` list arrive with the step that owns their data: Notifications (12), Branches and Git log (10), Marks and Yanks (14), Undo (its data owner is decided in 14), Help and Local history (15). **ask**: the preview default; which of the sources ship first (recommended: Files, Grep, Buffers, Projects, Commands, then the rest in the same step).

### Step 10: source control presentations

Every SCM presentation of the design in one step: the git float (pull, staged, changes, stashes, recent commits, the j k s c keys), the diff window (changes list and side-by-side), the merge window (take both, complete merge), the history window with its three tabs (Graph, File history, Blame: the mockup's `hTabs`) and the Branches and Git log picker sources (the git extension's checkout and log data). The float draws the source control view's data in a quick-input-sized float (new fork code); the multi-diff and merge editors are restyled. There is no history editor: the graph is a view pane of the source control container (`SCMHistoryViewPane`), the file history is the git extension's timeline provider (shown in the Timeline view today) and the whole-buffer blame has no surface at all (the git extension only decorates the cursor line and the status bar item from its blame data), so the history window needs a host and two data adapters (**ask**: keep the graph view pane and the Timeline view in the right drawer and add the blame as a fork editor decoration over the buffer, or give all three tabs one fork editor host, which is new work; recommended: the drawer and the decoration first, the editor host only if the design insists on the window). Either way the file history and the blame are owned here, not left to the drawer step. The step also decides what remains of the source control view container once the float, the explorer's git status source and the drawer cover its views. The title row's Git pill and the status line's branch item switch to the float here.

### Step 11: the drawers

The terminal drawer (terminals list, tasks from package.json, the terminal) and the floating terminal (new); the debug drawer on the right (variables, watch, call stack, breakpoints and debug console as cards, inline values) and the tests drawer; the diagnostics, references and quickfix list; outline. The panel and auxiliary bar parts, terminal tabs, npm scripts, markers and testing views restyled.

### Step 12: notifications, progress and dialogs

Toasts (glass, replacing instead of stacking, the corner is **ask**: the design's toastCorner question, v10 default top right), the progress line at the bottom right, the notification history and its picker source, custom dialogs (title, body, pill buttons) and the workspace trust dialog. The select and input prompts are quick inputs and were restyled in step 9.

### Step 13: dashboard and first run

The welcome page restyled as the dashboard (keyed actions, projects with their branch, startup time). **ask**: startScreen (v10: dashboard) and firstRun (v10: off; new fork code if wanted, the deleted onboarding is not reintroduced).

### Step 14: the engine

vscode-neovim (**ask**: a recommended extension or a bundled built-in; a Neovim binary is required either way), then what depends on it: the mode pill and its colors from the extension's mode context, the recording indicator, the command line and search behaviour (the inputs were restyled in step 9; the match count, completion and history), jump labels and the yank flash (from init.lua; verify the decorations render), the engine-coupled defaults left out of step 2, the Marks and Yanks picker sources and registers (the extension exposes none of them today; fork code or deferred), the Undo picker source's data (**ask**: with the engine active the undo tree lives in Neovim and the workbench's undo stack only sees the applied edits, so the source reads either the engine's tree, which the extension does not expose, or the workbench's labelled undo elements of the undo-redo service, which is fork code; recommended: the workbench elements, documented as not the engine's tree), the leader menu (**ask**: a float from the pending-key state only if the extension exposes it, otherwise a key-hints float driven by workbench chords) and the pinned marks (⎵1 to ⎵4, new).

### Step 15: windows

The search and replace window (fields over the results, new), the web pane chrome and the markdown preview pane, logs, health (new), scratch buffers, the folder-as-buffer mode (built into the fork rather than left to an extension, decided on 2026-10-20), zen, and the Help and Local history picker sources (docs in the integrated browser; the timeline's local history, the saved snapshots the mockup lists as a separate entry next to the Undo source decided in step 14).

## Inventory to step

Every surface of the v10 mockup (its template, its `EXTRA` picker sources and its script states) and the step that owns it. "Excluded" names what is read as the mockup's own aid, not a product surface.

| Mockup surface | Step |
|---|---|
| Glass column, its tint and fallbacks | 1 (done) |
| Activity bar, command center, layout control, minimap, tab row, preview editors; sticky scroll, inlay hints, git gutter, blame | 2 |
| Column geometry, traffic-light band, the 76px title padding when the column is hidden, the status line height | 3 (done) |
| Jump pill, title spans, "Paused at line", picker group, Debug and Stop, debug pills | 4 |
| Status line items and order (mode and recording slots) | 5 (content: 14) |
| Window letters and picker, dimmed splits, winbar, modified dot, line indicator, fold ellipsis, hunk zone, peek zone, diagnostic text after the line, TODO highlights | 6 |
| Completion and docs, hover, signature help, code actions, rename | 7 |
| Project header, sources, root navigation, filter, rows, hidden items, info, preview and help popovers, key map, Go to file | 8 |
| Picker float, scrim, tabs, preview column, prompts, the engine's input boxes; sources Files, Grep, Buffers, Projects, Commands, Extensions (with trust), Settings, Symbols, Diagnostics, Keymaps, Themes, Jumps | 9 |
| Git float, diff window, merge, history window (graph, file history, whole-buffer blame), Branches and Git log sources | 10 |
| Terminal drawer, floating terminal, tasks, debug drawer, tests drawer, lists (diagnostics, references, quickfix), outline | 11 |
| Toasts, progress line, notification history and source, dialogs, workspace trust | 12 |
| Dashboard, first run | 13 |
| Mode pill, recording, command line and search behaviour, jump labels, yank flash, leader menu, pinned marks, Marks and Yanks sources, the Undo source's data, registers | 14 |
| Search and replace window, web pane, markdown pane, logs, health, scratch, folder as a buffer, zen, Help and Local history sources | 15 |
| The key-hint strip below the window frame (`showHints`) | Excluded, the mockup's navigation aid (**ask** if it is meant as a product surface; the leader menu covers key discovery) |

## Decisions, by step

Answered by the maintainer on 2026-10-20: every recommendation was taken except the folder as a buffer, which is built into the fork instead of left to an extension.

| Step | Decision | Answer (2026-10-20) |
|---|---|---|
| 2 | Tabs off by default (the bufferLine question) | Off; connected tabs stay a setting |
| 2 | Relative numbers, lightbulb and code lens defaults | With the engine, step 14; the maintainer supplies a set of recommended settings |
| 2 | Density default | `default` |
| 2 | Diagnostic text after the line and TODO highlights | Recommended extensions, styled in step 6 |
| 3 | Title band and status line heights, default density | 44px and 34px, the mockup's |
| 3 | Their compact values | Upstream's until the design provides them |
| 3 | Windows and Linux column | Full-width title bar until designed |
| 4 | Picker group items; title source | Files, Grep, Git, Terminal; `window.title` |
| 5 | Hidden items; diff stat | Hide the remote indicator and the notification bell (the feedback item no longer exists in the fork); add the stat to the git extension |
| 8 | One explorer with sources; Outline and Timeline; Go to file | Yes; hidden by default; off |
| 9 | Scrim; preview default; first sources | Scrim on; preview on; Files, Grep, Buffers, Projects, Commands first |
| 10 | History window host for graph, file history and blame; what remains of the SCM container | The drawer and a blame decoration first; decided in the step's plan |
| 12 | Toast corner | Top right |
| 13 | startScreen; firstRun | Dashboard; no first run |
| 14 | How vscode-neovim ships; leader menu; Marks and Yanks sources; the Undo source's data | Recommended extension; key hints from chords only; deferred until the extension exposes the data; the workbench's undo elements |
| 15 | Folder as a buffer | Built into the fork (the recommendation was an extension) |
| Inventory | The hint strip below the window | Excluded |

## Status

Order decided on 2026-10-16; every open decision answered by the maintainer on 2026-10-20 (see "Decisions, by step"). Step 2 done on 2026-10-20 (`docs/plans/ui-step-2-look-defaults.md`): the maintainer's recommended settings fed its defaults, the engine-coupled ones (relative line numbers, lightbulb off) are recorded there for step 14, and the TODO highlights moved to step 6 because Todo Tree cannot find the ripgrep the fork ships; on 2026-10-21 the dimming of unfocused editors left its defaults, because it also dimmed the focused editor whenever another app was active, and the design's fading of inactive splits moved to step 6. Step 3 done on 2026-10-20 (`docs/plans/ui-step-3-column-and-bands.md`): the column spans the window height on macOS with the custom title bar, beside a 44px title row and a 34px status line at the default density; the title row's content starts 68px right of the window controls' left edge while they sit over it, which is the mockup's 86px for controls at 18px and 84px for the real ones at 16px; the opaque column is flush with a 1px inner edge and the activity bar a flush rail, as decided; and a horizontal panel now maximizes only when centered, everywhere. Step 4 is next.

## Review

Adversarial review of the first draft, 2026-10-16, verdict "needs attention", four medium findings, all verified against the code and the mockup and folded in. (1) Missing surfaces: v10's script lists twelve picker sources beyond the seven the draft named (`EXTRA`: symbols, diagnostics, keymaps, help, marks, jumps, undo, colors, yanks, notifs, branches, gitlog) and renders the diagnostic text after the line (`DIAG`) and the TODO highlights (`TODORE`); the inventory table assigns each, and step 2 takes the extension decisions before the editor steps. (2) The quick input hosts the pickers, the extension prompts (`mainThreadQuickOpen` goes through the quick input service) and vscode-neovim's command line (its command line manager uses `createQuickPick`, checked in the 1.20.0 copy of `~/.vsebcode-dev/extensions`); step 9 now restyles every variant and the prompts left step 12. (3) The geometry baseline was wrong: on macOS the native title bar part returns 35px with the command center, 32px on macOS 26 and later and 28px before (`electron-browser/parts/titlebar/titlebarPart.ts`), and the status bar adds 6px (4px compact) of floating padding to its 22px (`statusbarPart.ts`); the plan quotes those values and settles both band heights in step 3 instead of step 5. (4) There is no SCM history editor (`scm.contribution.ts` registers `SCMHistoryViewPane`, a view pane, in the source control container), so the history host is a decision of step 10, which now owns every SCM presentation, and step 8 is explicit that it only reads SCM data. No finding was rejected.

Round two, same day, on the revised plan: verdict "needs attention", three medium findings, all verified and folded in. (1) The jump list is workbench data: vscode-neovim's `vscode-jumplist.vim` override maps ⌃o and ⌃i to `workbench.action.navigateBack` and `navigateForward`, which run on the editor history service, so the Jumps source moved from step 14 to step 9 beside the jump pill. (2) The mockup's history window has three tabs (`hTabs`: Graph, File history, Blame); only the graph is the SCM history view pane, the file history is the git extension's timeline provider and no whole-buffer blame exists (the extension's blame commands and settings only cover the cursor-line decoration and the status bar item), so step 10 owns all three with their hosts and data adapters. (3) The mockup's Undo source lists edit records with a diff preview and an `undoTo` action and shows local history as a separate entry; the plan had folded it into the timeline's saved snapshots, which would drop the unsaved edits. Undo is now its own source whose data owner is decided in step 14 (the workbench's labelled undo elements of the undo-redo service, since the engine's tree is not exposed) and Local history stays a step 15 source. No finding was rejected. Two rounds were run, the maximum of the review protocol; the order is handed to the maintainer with this record. The raw reviews are kept in `.build/ui-roadmap/reviews/`.
