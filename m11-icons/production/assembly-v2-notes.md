# Assembly v2 ledger — accumulated inputs from the full-coverage waves

Running list of everything assembly v2 must fold in. Appended per slice review;
consumed by the assembly-v2 agent. (Session-maintained doc.)

## Standing (pre-wave)
- FIX `tools/make-set-manifest.mjs` BEFORE any regen: a rerun strips hand-added
  `round1`/`round2`/`reconciled` keys (rec object lines ~101–113). Make it
  merge-preserving, then regenerate to fold in all wave manifests.
- Theme rebuild: long-tail associations flip generic→bespoke; keep the
  fileNames-shadowing drop logic; re-run the structural self-check; PATH_PREFIX
  one-string change at packaging.
- Emblem geometry now R9/R9a (closed 8.20 re-anchored, open 5.80 @0.25); the
  0.8× ratio is withdrawn.
- Fork v2 commit lands ON TOP of the acceptance session's theme-seti removal
  (their commit over 14023da); expect no file overlap.
- Ruled earlier, verify still true at v2: yaml #CB171E (R10a), claude #E2957E
  (invert = #85381E), git #E0603C, maven #A4656B (erlang-axis ΔL 12.2 thin
  margin accepted; #A15E65 fallback), svelte #B15B25.
- claude/agents/copilot/cursor icons KEEP (Sebastian, via acceptance session).

## audit.mjs FAMILIES — extensions declared by slices (ratified by review lead)
- test-jsx → testjs/testts flask family (react cyan)
- svelte-js / svelte-ts → svelte ribbon + JS/TS chip
- tres / tscn → Godot pair

## Tolerated §11.3 residuals (logged, not defects)
- A07: typo3 #DE7F35 ↔ core postcss #D0942F (GLYPH, dh11/dl4/ds9, form .12)
- A07: typo3 ↔ core svelte #B15B25 (GLYPH, dh3/dl12/ds6, form .12)

## Slice review log
- A07 GREEN 2026-09-02: 84/84 valid, 47 marks/37 type, 45 proofed, in-slice R7
  zero, R8 zero vs core; neutral-lane tail device confirmed.
- A04 GREEN 2026-09-02: 84/84 valid, 58 marks/26 badges, ALL 84 proofed, 5
  redraws documented; 15 in-slice retints to zero R7. FAMILIES to add: tex
  (latex/latex-class/latex-package/lbx/latexmk + core tex), lean pair,
  map (jsmap/map), marko=markojs alias, manifest (bak/skip), jsonnet joins
  json braces family, luau joins lua. Tolerated pairs: jinja↔npm/rust,
  kusto↔typescript, less↔cpp/perl, lit↔powershell, maya↔sqlite,
  mdsvex↔rust (deliberate svelte-hue), mojo↔git/jupyter, lisp↔cypress
  (brand-mandated). HUMAN-FLAG list add: metaphor marks where the real
  logo was unverifiable — jinja, kivy, mediawiki, modernizr, master-co
  (crown), karma (wheel).
- A06 GREEN 2026-09-02: 84/84 valid, 36 real marks, all-proofed spread ok;
  R7 in-slice zero / R8 zero vs core (audit thresholds reimplemented — the
  shared audit needs the manifest rebuild first). FAMILIES to add (big
  batch, ratified): powershell+fmt/psd/psm/types, python+pyscript/pytyped/
  pythonconfig, Qt (qbs/qml/qmldir/qrc), rust+ron/ra-syntax-tree/
  rust-toolchain, r+rmd/rproj, ruby+rake, scala+sbt, rescript+interface+
  reason, roblox+rbxmk, react+reacttemplate, sass+scss, markdown+quarkdown
  (weakest — flag to human if contested), search+search-result, redux
  quartet, xml+rnc, Office+publisher, prisma+prismaconfig,
  processing+processinglang. Tolerated pairs: 25 logged in its report
  (notable: rescript↔npm kept brand-true per R10a reasoning; rss↔postcss
  kept per §11.2). Craft notes: rust-toolchain = Ferris (gear was an R8
  with tsconfig).
- A01 GREEN 2026-09-02 (recovered from a connection drop, completed in
  full): 84/84 valid, all proofed, hard-scope R7 zero; whole tree at that
  moment 1183/1183. FAMILIES to add: java+jar+class, python+python-misc,
  actionscript+adobe-swc, affinity pair, AdvPL four, al pair,
  autohotkey+ahk2, azure pair, bibliography+bibtex-style+bbx,
  bench-js/jsx/ts (tied to js/react/ts), angular-* seven on canon
  #CC3462. Tolerated: debian #B82C38 <-> turborepo #CC333B (GLYPH, marks +
  domains separate; only legal spot that keeps Debian brand-adjacent).
  SECOND-OPINION pairs for the full-sheet eyeball: pytorch<->html
  (flame/shield), safetensors<->favicon (vault/star). HUMAN-FLAG adds:
  bicep (arm), onnx (fan-in reads as arrows). Manifest note: python-misc
  50/50 two-tone tie-break -> #6B92BE (same as core python situation).
- A02 GREEN 2026-09-02: 84/84 valid, hard R7/R8 zero (local audit vs stale
  manifest — regen will re-verify), hue-ladder + light-plate/dark-ink device,
  caught bruno-B vs biome-B at 0.915 and fixed pre-ship. FAMILIES to add:
  cf+cfc+cfm, c-al+dal, context+doctex+doctex-installer+dtx joining tex,
  chef+chef-cookbook, single-parent rhymes cabal->haskell, csproj->csharp,
  cssmap->css, clojurescript->clojure, cypress-spec->cypress,
  dartlang-generated->dartlang, cython->python, eex->elixir, erb->ruby,
  dtd->xml, dune->ocaml. RULING ratified: brainfuck [ + ] = R1 syntax mark.
  Reviewed-not-silent shape trios: bower/falcon/swift birds, coconut vs
  next discs, cake vs cakephp. HUMAN-FLAG adds (unverifiable logos, semantic
  fallbacks): bosque, bruno, casc, cbx, cangjie, ceylon, denizenscript,
  duc, dylan, docpad, codekit.
- A08 GREEN 2026-09-02: 84/84 valid, hard R7/R8 zero; strong redraws
  (wolfram 8-point spikey, visualstudio true-infinity, xcode hammer, apache
  solid-blade feather). FAMILIES to add: vb five (vb/vba/vbhtml/vbproj/
  vcxproj), visualstudio+vsixmanifest, xaml+xib, wgsl+wesl, wepy+wxml+wxss,
  xquery+xsl, bashly trio, bazel pair, bitbucket pair, astro-config(+alias
  astroconfig)->astro, vuex-store->vue, wit->wasm. ALIAS NOTE for the theme
  builder: astro-config/astroconfig and bitbucket/bitbucketpipeline are
  intentionally identical (duplicate matchers -> same artwork); dedupe or
  keep as aliases, do not flag as R8. Deliberate trade logged: xcode
  #26588A twins cpp instead of typescript (co-occurrence argument).
  Tolerated cross-domain list in its report (22 clusters).
- A11 GREEN 2026-09-02: 84/84 valid, hard R7/R8 zero, 74/84 real marks,
  full-sweep proofed + calibrated against shipped core band. RULINGS by
  review lead: travis KEEPS brand #3EAAAF (s11.2 brand-wins; its badge
  near-twins are all cross-domain -> s11.3 tolerated, no retint);
  svelteconfig->svelte ratified as R3 family; railway/shadcn and
  remix/unocss neutral-lane pairs accepted (silver precedent + letter
  separation). FAMILIES to add: svelteconfig->svelte. Its
  R8-avoided-at-design-time list is a model (pytest round flask vs testjs
  conical etc.). No human-flag adds.

## Cross-session state (acceptance session, 2026-09-02)
- Fork v2 commit must land ON TOP of vscode `80720c4` (theme-seti removed
  whole + theme-defaults vs-minimal icon contribution removed; picker =
  VSebCode Icons + None). Branch = THREE unpushed commits; the runbook push
  carries all + our v2.
- Umbrella pin already at their `91f3a0d` (pointer-only commit).
- Their uncommitted board/Tasks hunks ride into our next docs commit —
  expected; note it in that commit message.
- A12 GREEN 2026-09-02 (carries xo itself: drawn X+O, R1): 82/82 valid, 71
  real marks, 8 proof-forced redraws documented, blue-lane cleared via a
  coordinate-descent solver. RULINGS: Adobe plate lifts APPROVED (ai
  #5A3E19, photoshop #1B4A6B; were 0.066/0.14 invisible, now ~0.20 =
  jenkins-class); matlab single-crescent abstraction ACCEPTED -> add to
  HUMAN-FLAG list; postman keeps brand orange (s11.2). FAMILIES to add:
  vscode-test->vscode, vueconfig->vue, json-schema->json(+json5),
  tsdoc->typescript, markdoc->markdown, svgr->reactjs, access->Office
  plate rhyme, typedoc on lifted TS blue. Deliberate separations noted:
  yandex #93301C, rojo #D2793E, access #8C2F38.
- F04 GREEN 2026-09-02 (first folder slice): 90/90 valid, canon bases
  byte-asserted, dual containment proofs 0 spills, R8 self-check 3570
  pairs 0 over bar. RULINGS: mariadb #003545 stays (tone law measures vs
  tan, not editor bg); mariadb~db 0.669 accepted as domain sibling;
  'other' diagonal ellipsis approved. NgRx seven share family purple
  #7A3E92 (R3). CROSS-SLICE R8 checklist for assembly (F04 could not see
  concurrent slices): lottie play-plate vs media-ish folders, mypy
  magnifier vs search-ish, notebooks vs bookmarks-ish, minikube heptagon
  (hub dot = 'mini') vs kubernetes folder, opencode caret vs scripts
  (terminal family R3).
- A10 GREEN 2026-09-02: 84/84 valid, hard badge/glyph lanes fully clean,
  11 proof-forced redraws, animal cluster resolved (husky+panda keep
  faces; kodiak->paw, lynx->eye). R1 RATIFIED: heroku angled-H, markuplint
  drawn chevrons (M inside is letterpath). FAMILIES to add:
  markdownlint pair, nsri pair, pm2 pair, panda=pandacss alias,
  heroku+procfile, kubernetes->helm, mdxlint->mdx, nodemon->node,
  preact->react pair, phpcsfixer->php, postcssconfig->postcss,
  hadolint->docker. Craft note: htmlhint/htmlvalidate share html hue as a
  deliberate linter family (form-separated: bulb vs stamp).
- A05 GREEN 2026-09-02: 84/84 valid, hard R7/R8 zero via solver; the 11
  Nest roles each got a REAL distinct mark (better than upstream's tinted
  shields). RULINGS: phalcon~django TOLERATED (PHP vs Python frameworks
  almost never co-occur; letters differ); plsql-package x4 ~ rust
  TOLERATED brand-true (R10a precedent; Oracle+Cargo co-occurrence nil).
  SPEC ERRATUM to write at assembly (from its findings): four-letter bare
  wordmark GLYPHs are banned; letter-only marks go on a plate unless the
  hue is dotenv-light (peak >= ~0.8). FAMILIES to add: mvt trio, pascal
  pair, perl6->perl, objectivecpp->objectivec, ng-tailwind->tailwind,
  plsql five + sql family, ocaml-intf->ocaml+opam, nimble->nim,
  njsproj->node, numpy->python, pip->python, nunjucks->mustache.
- F01 GREEN 2026-09-02: 90/90 valid, bases byte-asserted, full-slice spill
  check 0/90, live re-sweep against concurrently landed file marks (10
  reuse-derived). RULING: atom FOLDER keeps the nucleus-in-orbit (matchers
  are atomic-design atoms/ dirs; the FILE atom.svg is the feed mark - the
  divergence is semantically correct, not a defect). circleci folder falls
  back to Inter C after its file mark landed as dot-in-ring (in-slice R8
  vs atom emblem) - approved. azure+azurepipelines R3 folder family.
- F05 GREEN 2026-09-02: 90/90 valid, 0/90 spill, six nonzero-winding hole
  bugs caught at proof and fixed by construction (R11 vindicated again).
  Deliberate deviations logged: serverless folder = lambda (its file mark's
  three slabs = log/middleware territory); redux-store box not cylinder
  (db R8). ASSEMBLY TASK added: sweep the session scratchpad for slice
  generator scripts (F01-*, F05-*, a07-*, a10-*, a11-*, a12-*, b* etc.)
  and persist survivors into production/tools/generators/ - emblem/mark
  geometry sources currently live only in scratch and evaporate with the
  session (best-effort; document which slices' generators were lost).
- A03 GREEN 2026-09-02: 84/84 valid; found + fixed the wave's first real
  R8 form collision (gleam 5-point star vs favicon 0.81 -> rebuilt as
  Lucy the starfish); google/fossil ring-gap winding bugs fixed per R11.
  FAMILIES to add: fla+flash, gamemaker x3, godot five (godot/gdscript/
  gduid/godot-assets/godotshader), idris x3, haxe pair,
  firebasestorage+firestore, hashicorp+hcl, glsl+hlsl. Tolerated log 49
  cross-domain (tightest: hy~svg dH1.1 - letters separate). Deliberate
  concession: idris family moved to plum (no brand).
- A09 GREEN 2026-09-02 (LAST file slice - file tier complete): 84/84
  valid, R7/R8 fully zero incl. zero tolerated pairs (its --free cell
  scanner relocated 19 badges); honest no-fabrication rule applied to ~48
  obscure tools (letter badges in recognized hues, never invented logos).
  FAMILIES to add: commitizen+commitlint, dbt pair, deno+denoify,
  drizzle+drizzle-orm, expo+eas-metadata, go+go-package+go-work,
  funding+github-sponsors, bun+bunfig, cursor+cursorrules,
  dartlang+dartlang-ignore, firebase+firebasehosting, graphql+
  graphql-config, dotenv+direnv, container+devcontainer. Craft: gcloud
  outlined-cloud GLYPH vs cloudflare solid SILHOUETTE (R8 dodge).
- F02 GREEN 2026-09-02: 90/90 valid, 0/90 spill (check caught 2 winding
  defects mid-build), bases byte-asserted. Semantic split ratified:
  gamepad emblem went to console/ (matchers ps4/ps5/switch/xbox), MVC
  controller/ got a dispatch hub; devcontainer folder deliberately NOT the
  file's remote-chevrons (src-emblem R8 mirror) -> container-frame rhyme.
  Wireframe-cubit vs node-hexagon R8 dodge noted. dal~db and
  devcontainer~container = deliberate R3 domain rhymes.
- F06 GREEN 2026-09-02: 86/86 valid, 0 spill (own rasteriser), bases
  byte-asserted. R1 RATIFIED: wordpress fat-zigzag W (letterpath W proved
  impossible at emblem scale). HUMAN-FLAG add: wasp folder single-band
  abdomen (weakest concept-mark link, its own admission). zed bare-Z vs
  zeabur plated-Z split approved; stylus hollow droplet vs theme solid
  drop.
- *** CRITICAL TOOLCHAIN BREAK (from F06) — FIX FIRST AT ASSEMBLY ***
  The ms-playwright chromium .app is now Chrome for Testing 147: old
  headless flags dropped -> tools/{contact,pixelproof,contact-full,
  raster}.mjs HANG FOREVER. Fix = resolver prefers
  ~/Library/Caches/ms-playwright/chromium_headless_shell-*/
  chrome-headless-shell-mac-arm64/chrome-headless-shell (builds 1194/1217/
  1234 present; 0.39s vs infinite), fall back to .app for older caches.
  One function, four tools. Assembly agent MAY edit tools/ (single-writer
  phase) and must apply this before any raster/audit/sheet work.
- F03 GREEN 2026-09-02 (FINAL slice - all 18 done): 90/90 valid, 0 spill,
  bases byte-asserted; arc-radius rounding trap fixed (R11-class, floors
  radii to 2dp - add to spec toolchain notes). Divergences ratified:
  firestore folder = flame not layer-stack (bar-mark R8), grunt mallet not
  gear (config R8), lefthook turn-arrow not hook (hooks R8), instructions
  list kept. FAMILIES: gemini pair, interface pair, gh-workflows+
  gitea-workflows same-mark-own-hue. HUMAN-FLAG add: javascript-open
  emblem inherently coarse (same as next-open precedent). Overall folder
  tier: 82 core + 536 long-tail files = 618 valid.

## ASSEMBLY v2 CLOSED 2026-09-02 (rounds incl. resolution flip + pin round)
All ledger items consumed. Final: 1779/1779 valid; audit 0 hard open;
theme = specific-beats-general with 54 core-tier + 11 pins.json verdicts
(build-gated, fault-injection proven); 194 associations flipped to bespoke;
48 unreachable (+11 open twins) incl. 3 pin-stranded (qwik, ngrx-store,
redux-store — their only matchers were over-broad claims); toolchain fixed
(headless-shell); generators swept (core-batch4 lost); spec errata
R9b/R11a/R11b/R12/R14/R14a; sheet v3 published (full-set-v3-coverage).
Remaining for packaging: PATH_PREFIX one-string flip.
