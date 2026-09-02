# Theme resolution — the specific-beats-general flip

Ruled 2026-09-02 by the review lead. Regenerate with `node tools/build-theme.mjs --flip-report`, which resolves both readings in one run and diffs the computations rather than two files on disk.

The withdrawn rule was **core-first**: a core-tier concept beat a bespoke long-tail
concept on any matcher they both claim. It was never ruled — it is what the core tier
did back when the long tail had no icons to lose with. The ruled rule is **specific
beats general**, which is D20 amendment 2's own logic: `.awk` deserves the awk icon,
not `shell`'s broad claim on every script extension; `.avif` deserves avif, not
`image`'s claim on every raster format.

**Unchanged by the flip:** the 54 explicit `matcherCollisions` verdicts in
`inventory/core-tier.json` are pinned and resolve first, in either reading; generic still
loses to every named icon, across matcher kinds too; rank still orders core against core.
**Corrected by hand:** 11 matchers are pinned in `theme/pins.json`, which carries the same authority and resolves in the same place. See the escalation below.

## Headline

| | core-first (withdrawn) | specific-beats-general (shipped) |
| --- | --- | --- |
| associations that changed hands | — | **194** |
| core concepts that yield a matcher | — | 70 |
| long-tail concepts that gain one | — | 135 |
| unreachable definitions | 108 | **48** (60 recovered) |
| core-tier `matcherCollisions` verdicts honoured | 54 | 54 |
| `theme/pins.json` verdicts honoured | 11 | 11 |
| generic fileName rules dropped for a named extension | 2 | 2 |

By matcher kind: fileExtensions 117, fileNames 45, languageIds 13, folderNames 19.

## Escalation — RESOLVED BY PIN

The first cut of this diff escalated the flips where the rule went wrong. The rule is a
**tier** rule, and a tier is not a measurement of specificity: where an upstream source
theme gave a narrow concept an over-broad matcher — Material's `qwik` claiming `.tsx`
outright, vsicons' `esphome` claiming `.yaml` — the tier arithmetic cannot tell that from
a genuinely specific claim, and believes it.

**Ruled 2026-09-02: corrected per matcher, in `theme/pins.json`.** A pin resolves before every precedence rule, in either mode, with the same authority as a core-tier `matcherCollisions` verdict — and it is data, not code, so the rule stays one line and the exceptions stay a list anyone can read. Two shapes were pinned: every **eponymous** hit (§3b — a matcher whose value IS a concept's own id belongs to that concept) and the **blast-radius** hits (§3c) where a top-ranked core concept covers the matcher in the real world. Both scans below now read **clean of them**, because a pinned matcher no longer changes hands at all.

| matcher | pinned to | over | each loser still resolves through |
| --- | --- | --- | --- |
| `.tsx` | `_reactts` | `qwik` | `qwik` **stranded** |
| `.yaml` | `_yaml` | `esphome`, `homeassistant` | `esphome` 1 assoc; `homeassistant` 1 assoc |
| `.yml` | `_yaml` | `cloudfoundry` | `cloudfoundry` 2 assoc |
| `.xml` | `_xml` | `source` | `source` 3 assoc |
| `lang:xml` | `_xml` | `source` | `source` 3 assoc |
| `.tikz` | `_tex` | `matlab` | `matlab` 16 assoc |
| `.cls` | `_tex` | `apex`, `vb`, `vba` | `apex` 1 assoc; `vb` 6 assoc; `vba` 1 assoc |
| `components/` | `_folder_components` | `react-components`, `vue` | `react-components` 4 assoc; `vue` no icon (R9 fallback) |
| `services/` | `_folder_services` | `controller` | `controller` 15 assoc |
| `store/` | `_folder_store` | `db`, `ngrx-store`, `redux-store`, `vuex-store` | `db` 10 assoc; `ngrx-store` **stranded**; `redux-store` **stranded**; `vuex-store` **stranded** |
| `stores/` | `_folder_store` | `db`, `redux-store`, `vuex-store` | `db` 10 assoc; `redux-store` **stranded**; `vuex-store` **stranded** |

**Cost, measured** against the same flip resolved with core-tier verdicts only — not asserted, computed, so these numbers cannot drift from the pins above.

- **Stranded by these pins: 3** — `_qwik`, `_folder_ngrx-store`, `_folder_redux-store`. The merged inventory gives each of them nothing but the matcher pinned away, so the choice was a wrong icon on a common path against no icon on a rare one.
- **Recovered by these pins: 1** — `_folder_store`.
- **Already unreachable, pin or no pin: 1** — `_folder_vuex-store`. Named here so the pin is not blamed for it.
- Every other loser keeps at least one association; the table above counts them, and `theme/pins.json` records the same per pin in its `keeps` field.

§3c still ranks all 194 remaining core-yielding flips by blast radius; nothing in it is escalated, and any new candidate for a pin will surface there or in §3a first.

## 1 · Associations that flip core → long-tail (194)

Grouped by the core concept that yields, biggest first. "was" is the icon the withdrawn
rule painted; "now" is the icon the ruled one paints.

### `_postcss` yields 17 — core rank 116

| matcher | kind | now |
| --- | --- | --- |
| `.sss` | fileExtensions | `_sss` |
| `.postcssrc` | fileNames | `_postcssconfig` |
| `.postcssrc.cjs` | fileNames | `_postcssconfig` |
| `.postcssrc.cts` | fileNames | `_postcssconfig` |
| `.postcssrc.js` | fileNames | `_postcssconfig` |
| `.postcssrc.json` | fileNames | `_postcssconfig` |
| `.postcssrc.mjs` | fileNames | `_postcssconfig` |
| `.postcssrc.mts` | fileNames | `_postcssconfig` |
| `.postcssrc.ts` | fileNames | `_postcssconfig` |
| `.postcssrc.yaml` | fileNames | `_postcssconfig` |
| `.postcssrc.yml` | fileNames | `_postcssconfig` |
| `postcss.config.cjs` | fileNames | `_postcssconfig` |
| `postcss.config.cts` | fileNames | `_postcssconfig` |
| `postcss.config.js` | fileNames | `_postcssconfig` |
| `postcss.config.mjs` | fileNames | `_postcssconfig` |
| `postcss.config.mts` | fileNames | `_postcssconfig` |
| `postcss.config.ts` | fileNames | `_postcssconfig` |

### `_xml` yields 17 — core rank 27

| matcher | kind | now |
| --- | --- | --- |
| `.ascx` | fileExtensions | `_asp` |
| `.atom` | fileExtensions | `_atom` |
| `.axaml` | fileExtensions | `_xaml` |
| `.axml` | fileExtensions | `_source` |
| `.dtd` | fileExtensions | `_dtd` |
| `.iml` | fileExtensions | `_jetbrains` |
| `.pex` | fileExtensions | `_source` |
| `.proj` | fileExtensions | `_visualstudio` |
| `.rss` | fileExtensions | `_rss` |
| `.storyboard` | fileExtensions | `_storyboard` |
| `.vbproj` | fileExtensions | `_visualstudio` |
| `.xib` | fileExtensions | `_xib` |
| `.xliff` | fileExtensions | `_xliff` |
| `.xquery` | fileExtensions | `_xquery` |
| `.xsl` | fileExtensions | `_xsl` |
| `lang:xquery` | languageIds | `_xquery` |
| `lang:xsl` | languageIds | `_xsl` |

### `_sql` yields 11 — core rank 22

| matcher | kind | now |
| --- | --- | --- |
| `.accdb` | fileExtensions | `_access` |
| `.accde` | fileExtensions | `_access` |
| `.adp` | fileExtensions | `_access` |
| `.bak` | fileExtensions | `_bak` |
| `.frm` | fileExtensions | `_vb` |
| `.mdb` | fileExtensions | `_access` |
| `.odb` | fileExtensions | `_libreoffice-base` |
| `.parquet` | fileExtensions | `_parquet` |
| `.pgsql` | fileExtensions | `_pgsql` |
| `.pkb` | fileExtensions | `_plsql-package-body` |
| `.pks` | fileExtensions | `_plsql-package-spec` |

### `_ruby` yields 10 — core rank 46

| matcher | kind | now |
| --- | --- | --- |
| `.erb` | fileExtensions | `_erb` |
| `.gemfile` | fileExtensions | `_bundler` |
| `.jbuilder` | fileExtensions | `_jbuilder` |
| `.rake` | fileExtensions | `_rake` |
| `berksfile` | fileNames | `_chef` |
| `berksfile.lock` | fileNames | `_chef` |
| `brewfile` | fileNames | `_brew` |
| `gemfile` | fileNames | `_bundler` |
| `gemfile.lock` | fileNames | `_bundler` |
| `rakefile` | fileNames | `_rake` |

### `_image` yields 8 — core rank 24

| matcher | kind | now |
| --- | --- | --- |
| `.afphoto` | fileExtensions | `_affinityphoto` |
| `.ase` | fileExtensions | `_aseprite` |
| `.aseprite` | fileExtensions | `_aseprite` |
| `.avif` | fileExtensions | `_avif` |
| `.eps` | fileExtensions | `_eps` |
| `.ico` | fileExtensions | `_icon` |
| `.kra` | fileExtensions | `_krita` |
| `.xcf` | fileExtensions | `_gimp` |

### `_json` yields 6 — core rank 5

| matcher | kind | now |
| --- | --- | --- |
| `.geojson` | fileExtensions | `_geojson` |
| `.jsonld` | fileExtensions | `_jsonld` |
| `.tsbuildinfo` | fileExtensions | `_tsbuildinfo` |
| `.jsbeautifyrc` | fileNames | `_jsbeautify` |
| `.jshintrc` | fileNames | `_jshint` |
| `composer.lock` | fileNames | `_composer` |

### `_shell` yields 6 — core rank 21

| matcher | kind | now |
| --- | --- | --- |
| `.awk` | fileExtensions | `_awk` |
| `.bat` | fileExtensions | `_bat` |
| `.exp` | fileExtensions | `_tcl` |
| `.nu` | fileExtensions | `_nushell` |
| `lang:bat` | languageIds | `_bat` |
| `.envrc` | fileNames | `_direnv` |

### `_tex` yields 6 — core rank 77

| matcher | kind | now |
| --- | --- | --- |
| `.bib` | fileExtensions | `_bibliography` |
| `.dtx` | fileExtensions | `_dtx` |
| `.sty` | fileExtensions | `_sty` |
| `lang:bibtex` | languageIds | `_bibliography` |
| `lang:doctex` | languageIds | `_doctex` |
| `lang:latex` | languageIds | `_latex` |

### `_binary` yields 5 — core rank 81

| matcher | kind | now |
| --- | --- | --- |
| `.a` | fileExtensions | `_lib` |
| `.bin` | fileExtensions | `_hex` |
| `.lib` | fileExtensions | `_lib` |
| `.o` | fileExtensions | `_3d` |
| `.obj` | fileExtensions | `_3d` |

### `_audio` yields 4 — core rank 78

| matcher | kind | now |
| --- | --- | --- |
| `.act` | fileExtensions | `_palette` |
| `.gp` | fileExtensions | `_gnuplot` |
| `.mod` | fileExtensions | `_go-package` |
| `.vox` | fileExtensions | `_3d` |

### `_svelte` yields 4 — core rank 117

| matcher | kind | now |
| --- | --- | --- |
| `.svelte.js` | fileExtensions | `_svelte-js` |
| `.svelte.ts` | fileExtensions | `_svelte-ts` |
| `svelte.config.js` | fileNames | `_svelteconfig` |
| `svelte.config.ts` | fileNames | `_svelteconfig` |

### `_config` yields 3 — core rank 90

| matcher | kind | now |
| --- | --- | --- |
| `.ini` | fileExtensions | `_ini` |
| `lang:ini` | languageIds | `_ini` |
| `.jshintignore` | fileNames | `_jshint` |

### `_cursor` yields 3 — core rank 141

| matcher | kind | now |
| --- | --- | --- |
| `.cursorignore` | fileNames | `_cursorrules` |
| `.cursorindexingignore` | fileNames | `_cursorrules` |
| `.cursorrules` | fileNames | `_cursorrules` |

### `_firebase` yields 3 — core rank 133

| matcher | kind | now |
| --- | --- | --- |
| `firebase.json` | fileNames | `_firebasehosting` |
| `firestore.indexes.json` | fileNames | `_firestore` |
| `firestore.rules` | fileNames | `_firestore` |

### `_folder_db` yields 3 — core rank 24

| matcher | kind | now |
| --- | --- | --- |
| `repo/` | folderNames | `_folder_repository` |
| `repositories/` | folderNames | `_folder_repository` |
| `repository/` | folderNames | `_folder_repository` |

### `_folder_dist` yields 3 — core rank 3

| matcher | kind | now |
| --- | --- | --- |
| `export/` | folderNames | `_folder_export` |
| `exports/` | folderNames | `_folder_export` |
| `target/` | folderNames | `_folder_target` |

### `_folder_public` yields 3 — core rank 13

| matcher | kind | now |
| --- | --- | --- |
| `web/` | folderNames | `_folder_www` |
| `www/` | folderNames | `_folder_www` |
| `wwwroot/` | folderNames | `_folder_www` |

### `_html` yields 3 — core rank 9

| matcher | kind | now |
| --- | --- | --- |
| `.asp` | fileExtensions | `_asp` |
| `.aspx` | fileExtensions | `_asp` |
| `.volt` | fileExtensions | `_phalcon` |

### `_js` yields 3 — core rank 3

| matcher | kind | now |
| --- | --- | --- |
| `.es` | fileExtensions | `_elastic` |
| `.njs` | fileExtensions | `_nunjucks` |
| `jakefile` | fileNames | `_jake` |

### `_perl` yields 3 — core rank 53

| matcher | kind | now |
| --- | --- | --- |
| `.pl` | fileExtensions | `_prolog` |
| `.raku` | fileExtensions | `_raku` |
| `lang:perl6` | languageIds | `_perl6` |

### `_testts` yields 3 — core rank 114

| matcher | kind | now |
| --- | --- | --- |
| `.spec.tsx` | fileExtensions | `_test-jsx` |
| `.test-d.tsx` | fileExtensions | `_test-jsx` |
| `.test.tsx` | fileExtensions | `_test-jsx` |

### `_angular` yields 2 — core rank 118

| matcher | kind | now |
| --- | --- | --- |
| `.module.js` | fileExtensions | `_nest-module` |
| `.module.ts` | fileExtensions | `_nest-module` |

### `_assembly` yields 2 — core rank 63

| matcher | kind | now |
| --- | --- | --- |
| `.ms` | fileExtensions | `_maxscript` |
| `lang:platformio-debug.asm` | languageIds | `_platformio` |

### `_copilot` yields 2 — core rank 139

| matcher | kind | now |
| --- | --- | --- |
| `.instructions.md` | fileExtensions | `_instructions` |
| `lang:instructions` | languageIds | `_instructions` |

### `_css` yields 2 — core rank 7

| matcher | kind | now |
| --- | --- | --- |
| `.less` | fileExtensions | `_less` |
| `.wxss` | fileExtensions | `_wxss` |

### `_docker` yields 2 — core rank 13

| matcher | kind | now |
| --- | --- | --- |
| `.hcl` | fileExtensions | `_hashicorp` |
| `docker-compose.test.yml` | fileNames | `_dockertest` |

### `_elixir` yields 2 — core rank 49

| matcher | kind | now |
| --- | --- | --- |
| `.eex` | fileExtensions | `_eex` |
| `.heex` | fileExtensions | `_eex` |

### `_excel` yields 2 — core rank 72

| matcher | kind | now |
| --- | --- | --- |
| `.fods` | fileExtensions | `_libreoffice-calc` |
| `.ods` | fileExtensions | `_libreoffice-calc` |

### `_folder_components` yields 2 — core rank 8

| matcher | kind | now |
| --- | --- | --- |
| `gui/` | folderNames | `_folder_ui` |
| `ui/` | folderNames | `_folder_ui` |

### `_folder_utils` yields 2 — core rank 17

| matcher | kind | now |
| --- | --- | --- |
| `tooling/` | folderNames | `_folder_tools` |
| `tools/` | folderNames | `_folder_tools` |

### `_git` yields 2 — core rank 20

| matcher | kind | now |
| --- | --- | --- |
| `.patch` | fileExtensions | `_patch` |
| `.mailmap` | fileNames | `_email` |

### `_java` yields 2 — core rank 33

| matcher | kind | now |
| --- | --- | --- |
| `.jar` | fileExtensions | `_jar` |
| `.jsp` | fileExtensions | `_jsp` |

### `_key` yields 2 — core rank 83

| matcher | kind | now |
| --- | --- | --- |
| `.gpg` | fileExtensions | `_gpg` |
| `.pub` | fileExtensions | `_publisher` |

### `_nim` yields 2 — core rank 57

| matcher | kind | now |
| --- | --- | --- |
| `.nimble` | fileExtensions | `_nimble` |
| `lang:nimble` | languageIds | `_nimble` |

### `_ocaml` yields 2 — core rank 58

| matcher | kind | now |
| --- | --- | --- |
| `.merlin` | fileExtensions | `_merlin` |
| `.mli` | fileExtensions | `_ocaml-intf` |

### `_php` yields 2 — core rank 45

| matcher | kind | now |
| --- | --- | --- |
| `.ctp` | fileExtensions | `_cakephp` |
| `.tpl` | fileExtensions | `_smarty` |

### `_powershell` yields 2 — core rank 85

| matcher | kind | now |
| --- | --- | --- |
| `.psd1` | fileExtensions | `_powershell-psd` |
| `.psm1` | fileExtensions | `_powershell-psm` |

### `_python` yields 2 — core rank 28

| matcher | kind | now |
| --- | --- | --- |
| `.pxd` | fileExtensions | `_cython` |
| `.pyx` | fileExtensions | `_cython` |

### `_r` yields 2 — core rank 54

| matcher | kind | now |
| --- | --- | --- |
| `.rmd` | fileExtensions | `_rmd` |
| `.rt` | fileExtensions | `_reacttemplate` |

### `_vscode` yields 2 — core rank 142

| matcher | kind | now |
| --- | --- | --- |
| `.vsix` | fileExtensions | `_vsix` |
| `.vsixmanifest` | fileExtensions | `_vsixmanifest` |

### `_word` yields 2 — core rank 73

| matcher | kind | now |
| --- | --- | --- |
| `.dot` | fileExtensions | `_dotjs` |
| `.odt` | fileExtensions | `_libreoffice-writer` |

### `_zip` yields 2 — core rank 80

| matcher | kind | now |
| --- | --- | --- |
| `.deb` | fileExtensions | `_debian` |
| `.whl` | fileExtensions | `_python-misc` |

### `_biome` yields 1 — core rank 105

| matcher | kind | now |
| --- | --- | --- |
| `.rast` | fileExtensions | `_ra-syntax-tree` |

### `_bun` yields 1 — core rank 99

| matcher | kind | now |
| --- | --- | --- |
| `bunfig.toml` | fileNames | `_bunfig` |

### `_cert` yields 1 — core rank 84

| matcher | kind | now |
| --- | --- | --- |
| `.stl` | fileExtensions | `_3d` |

### `_clojure` yields 1 — core rank 59

| matcher | kind | now |
| --- | --- | --- |
| `.cljs` | fileExtensions | `_clojurescript` |

### `_cypress` yields 1 — core rank 110

| matcher | kind | now |
| --- | --- | --- |
| `.cy.jsx` | fileExtensions | `_cypress-spec` |

### `_dartlang` yields 1 — core rank 48

| matcher | kind | now |
| --- | --- | --- |
| `.pubignore` | fileNames | `_dartlang-ignore` |

### `_exe` yields 1 — core rank 82

| matcher | kind | now |
| --- | --- | --- |
| `.prg` | fileExtensions | `_foxpro` |

### `_folder_coverage` yields 1 — core rank 32

| matcher | kind | now |
| --- | --- | --- |
| `e2e/` | folderNames | `_folder_e2e` |

### `_folder_library` yields 1 — core rank 18

| matcher | kind | now |
| --- | --- | --- |
| `crates/` | folderNames | `_folder_cargo` |

### `_folder_model` yields 1 — core rank 27

| matcher | kind | now |
| --- | --- | --- |
| `entities/` | folderNames | `_folder_ngrx-entities` |

### `_folder_services` yields 1 — core rank 29

| matcher | kind | now |
| --- | --- | --- |
| `service/` | folderNames | `_folder_controller` |

### `_folder_test` yields 1 — core rank 4

| matcher | kind | now |
| --- | --- | --- |
| `integration/` | folderNames | `_folder_connection` |

### `_folder_vscode` yields 1 — core rank 12

| matcher | kind | now |
| --- | --- | --- |
| `.vscode-test/` | folderNames | `_folder_vscode-test` |

### `_font` yields 1 — core rank 25

| matcher | kind | now |
| --- | --- | --- |
| `.otf` | fileExtensions | `_libreoffice-math` |

### `_fsharp` yields 1 — core rank 61

| matcher | kind | now |
| --- | --- | --- |
| `.fsproj` | fileExtensions | `_visualstudio` |

### `_go` yields 1 — core rank 29

| matcher | kind | now |
| --- | --- | --- |
| `go.mod` | fileNames | `_go-package` |

### `_graphql` yields 1 — core rank 68

| matcher | kind | now |
| --- | --- | --- |
| `.graphqlconfig` | fileNames | `_graphql-config` |

### `_markdown` yields 1 — core rank 6

| matcher | kind | now |
| --- | --- | --- |
| `.rst` | fileExtensions | `_rest` |

### `_objectivec` yields 1 — core rank 62

| matcher | kind | now |
| --- | --- | --- |
| `.m` | fileExtensions | `_matlab` |

### `_powerpoint` yields 1 — core rank 74

| matcher | kind | now |
| --- | --- | --- |
| `.odp` | fileExtensions | `_libreoffice-impress` |

### `_prisma` yields 1 — core rank 15

| matcher | kind | now |
| --- | --- | --- |
| `prisma.config.ts` | fileNames | `_prismaconfig` |

### `_rust` yields 1 — core rank 10

| matcher | kind | now |
| --- | --- | --- |
| `.ron` | fileExtensions | `_ron` |

### `_sass` yields 1 — core rank 8

| matcher | kind | now |
| --- | --- | --- |
| `lang:scss` | languageIds | `_scss` |

### `_swift` yields 1 — core rank 30

| matcher | kind | now |
| --- | --- | --- |
| `.xcode-version` | fileNames | `_xcode` |

### `_testjs` yields 1 — core rank 113

| matcher | kind | now |
| --- | --- | --- |
| `.test.jsx` | fileExtensions | `_test-jsx` |

### `_toml` yields 1 — core rank 11

| matcher | kind | now |
| --- | --- | --- |
| `poetry.lock` | fileNames | `_poetry` |

### `_wasm` yields 1 — core rank 65

| matcher | kind | now |
| --- | --- | --- |
| `.wit` | fileExtensions | `_wit` |

### `_yaml` yields 1 — core rank 12

| matcher | kind | now |
| --- | --- | --- |
| `lang:ansible` | languageIds | `_ansible` |

## 2 · Still unreachable after the flip (48)

A definition nothing routes to. Not a structural error — the artwork is fine and the
validator counts it — but nothing in the explorer will ever paint it. Two causes only:
the concept lost every matcher it claims to another concept, or the merged inventory
never gave it a matcher in the first place.

| definition | why it never renders |
| --- | --- |
| `_adobe-swc` | all 1 matcher(s) taken — ext:swc → _flash |
| `_ahk2` | all 1 matcher(s) taken — lang:ahk2 → _autohotkey |
| `_angular-service` | all 2 matcher(s) taken — ext:service.js → _moleculer; ext:service.ts → _moleculer |
| `_aspx` | all 2 matcher(s) taken — ext:aspx → _asp; ext:ascx → _asp |
| `_bazel-ignore` | all 1 matcher(s) taken — name:.bazelignore → _bazel |
| `_bazel-version` | all 1 matcher(s) taken — name:.bazelversion → _bazel |
| `_csproj` | all 1 matcher(s) taken — ext:csproj → _visualstudio |
| `_drizzle-orm` | all 3 matcher(s) taken — name:drizzle.config.js → _drizzle; name:drizzle.config.json → _drizzle; name:drizzle.config.ts → _drizzle |
| `_fbx` | all 1 matcher(s) taken — ext:fbx → _3d |
| `_figma` | all 1 matcher(s) taken — ext:fig → _matlab |
| `_fsproj` | all 1 matcher(s) taken — ext:fsproj → _visualstudio |
| `_gdscript` | all 2 matcher(s) taken — ext:gd → _godot; lang:gdscript → _godot |
| `_gleamconfig` | all 1 matcher(s) taken — name:gleam.toml → _gleam |
| `_gltf` | all 2 matcher(s) taken — ext:glb → _3d; ext:gltf → _3d |
| `_godotshader` | all 2 matcher(s) taken — ext:gdshader → _godot-assets; ext:gdshaderinc → _godot-assets |
| `_hcl` | all 2 matcher(s) taken — ext:hcl → _hashicorp; lang:hcl → _hashicorp |
| `_idrisbin` | all 1 matcher(s) taken — ext:ibc → _idris |
| `_markdownlint-ignore` | all 1 matcher(s) taken — name:.markdownlintignore → _markdownlint |
| `_nest-controller` | all 2 matcher(s) taken — ext:controller.js → _controller; ext:controller.ts → _controller |
| `_nest-guard` | all 2 matcher(s) taken — ext:guard.js → _angular-guard; ext:guard.ts → _angular-guard |
| `_nest-interceptor` | all 2 matcher(s) taken — ext:interceptor.js → _angular-interceptor; ext:interceptor.ts → _angular-interceptor |
| `_nest-pipe` | all 2 matcher(s) taken — ext:pipe.js → _angular-pipe; ext:pipe.ts → _angular-pipe |
| `_nest-resolver` | all 2 matcher(s) taken — ext:resolver.js → _angular-resolver; ext:resolver.ts → _angular-resolver |
| `_nest-service` | all 2 matcher(s) taken — ext:service.js → _moleculer; ext:service.ts → _moleculer |
| `_procfile` | all 1 matcher(s) taken — name:procfile → _heroku |
| `_pytyped` | all 1 matcher(s) taken — name:py.typed → _python-misc |
| `_qwik` | all 1 matcher(s) taken — ext:tsx → _reactts |
| `_rescript-interface` | all 1 matcher(s) taken — ext:resi → _rescript |
| `_salesforce` | all 1 matcher(s) taken — lang:apex → _apex |
| `_search-result` | all 2 matcher(s) taken — ext:code-search → _search; lang:search-result → _search |
| `_simulink` | all 1 matcher(s) taken — ext:slx → _matlab |
| `_vbhtml` | all 1 matcher(s) taken — ext:vbhtml → _razor |
| `_vbproj` | all 1 matcher(s) taken — ext:vbproj → _visualstudio |
| `_vcxproj` | all 1 matcher(s) taken — ext:vcxproj → _visualstudio |
| `_vuex-store` | all 4 matcher(s) taken — ext:store.js → _redux-store; ext:store.ts → _redux-store; name:store.js → _redux-store (+1 more) |
| `_wgsl` | all 2 matcher(s) taken — ext:wgsl → _shader; lang:wgsl → _shader |
| `_wrangler` | all 3 matcher(s) taken — name:wrangler.json → _cloudflare; name:wrangler.jsonc → _cloudflare; name:wrangler.toml → _cloudflare |
| `_folder_common` | all 1 matcher(s) taken — dir:common → _folder_shared |
| `_folder_cubit` | all 2 matcher(s) taken — dir:cubit → _folder_bloc; dir:cubits → _folder_bloc |
| `_folder_debian` | all 2 matcher(s) taken — dir:deb → _folder_linux; dir:debian → _folder_linux |
| `_folder_environments` | all 1 matcher(s) taken — dir:environments → _folder_environment |
| `_folder_interfaces` | all 2 matcher(s) taken — dir:interface → _folder_interface; dir:interfaces → _folder_interface |
| `_folder_module` | all 1 matcher(s) taken — dir:modules → _folder_plugin |
| `_folder_ngrx-store` | all 1 matcher(s) taken — dir:store → _folder_store |
| `_folder_redux-actions` | all 1 matcher(s) taken — dir:actions → _folder_ngrx-actions |
| `_folder_redux-store` | all 2 matcher(s) taken — dir:store → _folder_store; dir:stores → _folder_store |
| `_folder_vue-directives` | all 1 matcher(s) taken — dir:directives → _folder_directive |
| `_folder_vuex-store` | all 2 matcher(s) taken — dir:store → _folder_store; dir:stores → _folder_store |

Plus 11 open-folder twins, unreachable for the same reason as their closed halves.

## 3 · Sanity scans

### 3a · Long-tail wins on a heavily-claimed matcher (0)

Every matcher the flip hands to a long-tail concept that **three or more other concepts**
also claim. A crowded matcher is where "specific" is least obviously true, so these are
the ones to eyeball: if the winner is not the most specific reading of the matcher, this
is where it shows.

None — no long-tail winner takes a matcher with three or more rival claimants.

### 3b · Eponymous matchers that changed hands (0)

The density scan sees nothing when only two concepts claim a matcher, so this second scan
catches the other shape of mistake: **a matcher whose value IS the losing concept's id**.
`.xml` leaving `_xml` cannot be right whatever the tiers say — the concept the matcher is
named after is by definition the specific reading of it. Each row here is a candidate for
a pin in `core-tier.json`'s `matcherCollisions`, which outranks the precedence.

None.

### 3c · The most consequential flips, by the yielding concept's core rank (20)

`core-tier.json` ranks its 145 file concepts by how much of the real world they cover, so
the rank of the concept that yields is the closest thing to a blast radius this data has.
These are the twenty lowest-ranked (= most-used) yields in the set — the flips a person
would notice first in a real explorer.

| matcher | was | core rank | now |
| --- | --- | --- | --- |
| `.es` | `_js` | 3 | `_elastic` |
| `export/` | `_folder_dist` | 3 | `_folder_export` |
| `exports/` | `_folder_dist` | 3 | `_folder_export` |
| `jakefile` | `_js` | 3 | `_jake` |
| `.njs` | `_js` | 3 | `_nunjucks` |
| `target/` | `_folder_dist` | 3 | `_folder_target` |
| `integration/` | `_folder_test` | 4 | `_folder_connection` |
| `.jsbeautifyrc` | `_json` | 5 | `_jsbeautify` |
| `.jshintrc` | `_json` | 5 | `_jshint` |
| `composer.lock` | `_json` | 5 | `_composer` |
| `.geojson` | `_json` | 5 | `_geojson` |
| `.jsonld` | `_json` | 5 | `_jsonld` |
| `.tsbuildinfo` | `_json` | 5 | `_tsbuildinfo` |
| `.rst` | `_markdown` | 6 | `_rest` |
| `.less` | `_css` | 7 | `_less` |
| `.wxss` | `_css` | 7 | `_wxss` |
| `gui/` | `_folder_components` | 8 | `_folder_ui` |
| `lang:scss` | `_sass` | 8 | `_scss` |
| `ui/` | `_folder_components` | 8 | `_folder_ui` |
| `.asp` | `_html` | 9 | `_asp` |
