# M9 — AI excision plan (D16 executed per D17)

Survey completed 2026-08-31 (four parallel read-only agents over `vscode/` @ `6f2061ab8cf`).
This doc is the canonical site map + slice plan for the excision. Slice tracker /
resume state: [Tasks.md](Tasks.md) § M9. Decisions: [board.md](board.md) D16 + D17.

**D17 verdicts (Sebastian, 2026-08-31):** (1) full extended kill list — everything
AI-named or AI-only dies, incl. MCP stack, speech/dictation, entitlements, managed
settings, sandbox/networkFilter, CLI subcommands, deps; (2) `browserView` deleted
whole (not stripped); (3) extension-facing API fully removed (namespaces, ~100 type
exports, `vscode.d.ts` AI block, proposed-API files) — no stubs; (4) sessions-window
plumbing fully stripped (`isSessionsWindow`, `agentsWindow` schema property,
profile/window machinery).

**Method note for all agents:** imports are relative ESM with `.js` suffixes
(`from '../../chat/browser/x.js'`) — grep with patterns like
`from '[^']*[./]chat/[^']*'`, never absolute-path only. After each slice, grep-verify
zero remaining imports of the removed area.

**Commit rules:** hooks ON (no `--no-verify`), repo style `Area: sentence` subject,
NO AI attribution of any kind. Verify per slice: `npm run compile` exit 0 + targeted
eslint + targeted unit suites; remember this fork's watch never writes `out/` — only
`npm run compile` does.

---

## 1. Kill list (approved in full)

**Roots:** `src/vs/workbench/contrib/chat` (836 files) · `src/vs/platform/agentHost`
(992 files; 590 generated Codex protocol files; hygiene-exempt glob in
`build/filters.ts`) · `src/vs/sessions` (464 files; own window/entry points) ·
`src/vs/workbench/services/agentHost` (5) · `src/vs/platform/agentPlugins` (2;
already orphaned except a type import in `extHostTypeConverters.ts:52`).

**Whole-dir AI features:** `contrib/mcp` + `platform/mcp` + `services/mcp` ·
`contrib/inlineChat` · `contrib/agentsVoice` · `contrib/speech` ·
`terminalContrib/{chatAgentTools,chat,voice,inlineHint}` (inlineHint also carried a
non-AI suggest hint — accepted loss) · `contrib/welcomeAgentSessions` ·
`contrib/remoteCodingAgents` · `contrib/browserView` + `platform/browserView` +
`platform/webContentExtractor` + `platform/networkFilter` + `platform/sandbox` ·
`services/{aiEmbeddingVector,aiRelatedInformation,aiSettingsSearch}` ·
`services/chat/common/chatEntitlementService.ts` ·
`platform/policy/**/copilotManagedSettings*` · `contrib/search/browser/AISearch` +
`QueryType.aiText` machinery · editTelemetry AI parts (`aiContributionFeature`,
`editStats/aiStats*`, `telemetry/aiEditTelemetry`, `aiStats.fixture.ts`) ·
`platform/userDataSync/common/promptsSync` + `mcpSync` · sessions e2e harness +
`test/mcp` + `test/automation/src/{chat,agentsWindow}.ts` + smoke `chatDisabled`.

**Extension API:** 17 `mainThread*` + 18 `extHost*` modules, protocol identifiers,
`vscode.{lm,chat,ai,speech,interactive}` namespaces, `window.createChatStatusItem`,
~100 returned type/class exports, `vscode.d.ts` lines ~19595–21226, ~39 AI
`vscode.proposed.*.d.ts` files, AI contribution points + activation events.

**Deps:** `@vscode/copilot-api` (root + remote), `@anthropic-ai/claude-agent-sdk`,
`@openai/codex`, `zod` (root + remote), `src/typings/anthropic-sdk.d.ts`,
`src/typings/copilot-api.d.ts`; npm script `codex:gen-protocol`.

**Settings that die with their owners** (registered in kept code): `chat.mcp.*`
(platform/mcp), `chat.agent.{networkFilter,allowedNetworkDomains,deniedNetworkDomains}`
(networkFilter), `chat.agent.sandbox.*` (sandbox), `chat.extensionUnification.enabled`,
`workbench.commandPalette.{experimental.askChatLocation,showAskInChat}`,
`accessibility.signals.chat*`, `chat.disableAIFeatures` (+ its vscodium-patch default
and comment from `5dc515f`), startup-editor value `agentSessionsWelcomePage`.

---

## 2. Ordering constraints (hard)

1. **`MainContext`/`ExtHostContext` identifiers and their modules die together** —
   `rpcProtocol.assertRegistered` throws `Missing proxy instance` at ext-host startup
   otherwise (`extHost.api.impl.ts:263`, `extensionHostManager.ts:314`). Wire-name
   traps: `MainThreadLanguageModelTools`→`'MainThreadChatSkills'`,
   `ExtHostLanguageModelTools`→`'ExtHostChatSkills'`, `ExtHostChatProvider` maps to
   the LanguageModels shape.
2. **`onboardingVariationA.ts:80` runs `assertDefined(product.defaultChatAgent)` at
   module top level** — strip that file (S7) BEFORE removing `defaultChatAgent` from
   product.json / product.ts / the OSS fallback (S10). Startup crash, not compile error.
3. **Build entry wiring (buildfile/gulpfile/next/vite/i18n/stylelint) is removed in
   the same slice as the roots (S9)** so the tree never has dangling build refs; no
   gulp packaging between S1 and S9 landing.
4. `workbench.common.main.ts:17,21` side-effect-imports `vs/sessions/common/{theme,sizes}.js`
   (global color/size token registries; eslint-whitelisted at `eslint.config.js:1970-1971`)
   — resolve in S9 (drop imports; delete size registry `platform/theme/common/{sizeUtils,sizeRegistry}`
   + `sizes/baseSizes.ts`, whose only consumer is sessions).
5. `.eslint-plugin-local/code-translation-remind.ts:36,52` reads the `sessions` key of
   `build/lib/i18n.resources.json` — fix rule and json in the same commit.
6. Deleting a platform dir must strip its electron-main/sharedProcess/cli/server
   registration in the SAME commit (mcp, sandbox, networkFilter, agentHost…).
7. **(learned in S1)** An `ApiProposalName` cannot be removed before its LAST
   consumer: `checkProposedApiEnabled(ext, 'name')` types against the union
   generated from the dts filenames. Eleven AI names survive S1 — 8 dts files
   reduced to empty placeholders (chatContextProvider, chatOutputRenderer,
   chatParticipantAdditions, chatParticipantPrivate, chatReferenceBinaryData,
   chatSessionCustomizationProvider, chatSessionsProvider, defaultChatParticipant),
   3 pre-existing placeholders kept (contribChatEditorInlineGutterMenu,
   contribLanguageModelToolSets, remoteCodingAgents), plus
   `aiTextSearchProvider` kept whole for S7. Each dies (+ `extensionsApiProposals`
   regen) in the slice that deletes its last consumer: contrib/chat readers → S9,
   remoteCodingAgents → S7, menusExtensionPoint entries → S10, aiTextSearchProvider
   → S7 (its removal drags `registerAITextSearchProvider`/`$provideAITextSearchResults`/
   `$getAIName` out of extHostSearch.ts + mainThreadSearch.ts — `getAIName()` is a
   REQUIRED member of `ISearchResultProvider` in services/search/common/search.ts:67,
   so it lands together with the QueryType.aiText removal).

---

## 3. Slices

### REVISED EXECUTION ORDER (post-S1 mutual-import check, 2026-08-31)

Measured fact: the S9 roots (chat/sessions/agentHost) IMPORT most of the "S2–S6"
provider dirs — mcp (contrib+platform, mutual with chat), inlineChat (8 root
importers), speech (3), agentsVoice (2, mutual), browserView (8),
webContentExtractor (6), networkFilter (4), sandbox (7), editTelemetry (8),
chatEntitlementService (65). **Rule: kept-file strips and leaf-consumer deletions
are always safe early; provider dirs can only die together with (or after) their
last importer.** Execution phases (content inventories remain in the S2–S12
sections below; this table is the order):

| Phase | Content | From |
|---|---|---|
| A1 | Terminal AI consumers: `terminalContrib/{chatAgentTools,chat,inlineHint,voice}` dirs + terminal-core agentHost files/singleton/decorationAddon/menus strips. platform/sandbox dir STAYS until B1 | S6, S3 |
| A2 | ai-services trio dirs + consumer strips (commandsQuickAccess, preferencesSearch) | S7 |
| A3 | All workbench mixed strips incl. editorDictation + accessibility voice settings + git follow-ups + welcomeAgentSessions/remoteCodingAgents (verify zero root importers before dir-deleting; else defer to B1) | S7, S3 |
| A4 | Copilot policy/entitlement CONSUMER strips + copilotManagedSettings deletion (all consumers are kept files); `chatEntitlementService.ts` itself + its main-file import survive until B1 | S8 |
| A5 | De-wire the AI platform stack from electron-main/sharedProcess/cli/server + `--add-mcp` + auth MCP actions + preferences MCP renderer + config-editing association; the platform dirs stay (unregistered but compiling) until B1. Workbench main-file AI imports also stay until B1 | S2, S5, S6 |
| B1 | THE ROOTS COMMIT: all root + mutual provider dirs (chat, sessions, agentHost, agentPlugins, services/agentHost, mcp ×3, inlineChat, speech, agentsVoice, browserView ×2, webContentExtractor, networkFilter, sandbox, editTelemetry AI files, chatEntitlementService) + workbench main-file strips + theme/sizes hostages + electron-main agentHost/agents-window blocks + CLI args + `?session=` handler + build entries + eslint sessions blocks | S9, S2–S6 |
| B2 | Sessions machinery full strip (isSessionsWindow ~193 refs, agentsWindow schema, profiles, WindowEnablement, context key) — compiler-guided once the trees are gone | S9 |
| C1 | Platform residue + product + orphan closure + last proposal placeholders | S10 |
| C2 | Deps, tests, CI, docs | S11 |
| C3 | M3 round-3 hygiene fold-in | S12 |

Interim caveat (accepted): between A5 and B1, MCP/sandbox/networkFilter services are
unregistered while chat code still references them — dev boots in that window may
log DI errors on AI paths (AI is off by default; acceptance boots happen after B2).

### S1 — Extension-facing API surface
- **Delete** `src/vs/workbench/api/browser/`: mainThreadChatAgents2, mainThreadChatSessions,
  mainThreadLanguageModels, mainThreadLanguageModelTools, mainThreadMcp,
  mainThreadChatCodeMapper, mainThreadChatContext, mainThreadChatDebug,
  mainThreadChatInputNotification, mainThreadChatOutputRenderer, mainThreadChatStatus,
  mainThreadSpeech, mainThreadChatQuota, mainThreadAiRelatedInformation,
  mainThreadAiEmbeddingVector, mainThreadAiSettingsSearch, mainThreadEmbeddings
  (self-contained: own `IEmbeddingsService`, zero other consumers).
- **Delete** extHost peers (common + node): extHostAiRelatedInformation,
  extHostAiSettingsSearch, extHostChatAgents2, extHostChatContext, extHostChatDebug,
  extHostChatInputNotification, extHostChatOutputRenderer, extHostChatQuota,
  extHostChatSessions, extHostChatStatus, extHostCodeMapper, extHostEmbedding,
  extHostEmbeddingVector, extHostLanguageModels, extHostLanguageModelTools, extHostMcp,
  extHostSpeech, node/extHostMcpNode. Delete their tests
  (`mainThreadChatSessions.test`, `mainThreadLanguageModels.test`,
  `extHostChatAgents2.test`; strip chat parts of `extHostTypeConverters.test`).
- **Edit** `extensionHost.contribution.ts` (imports at 21–25, 59, 93–103);
  `extHost.protocol.ts` (MainContext 4001–4005, 4036, 4072–4078, 4080–4083;
  ExtHostContext 4131, 4142–4147, 4148–4151, 4162, 4164–4165; ~32 shape interfaces);
  `extHost.api.impl.ts` (imports 34–125 set; instantiations 193, 226, 244, 246–260,
  271–272; namespaces `interactive` 1672–1677, `ai` 1680–1698, `chat` 1700–1850,
  `lm` 1852–1940, `speech` 1942–1947; `window.createChatStatusItem` 1067–1070;
  returned namespace entries 1955–1969; type exports 1977–1980, 2189–2196, 2202–2300);
  `extHost.common.services.ts:32,35,47,71`; `extHost.node.services.ts:30,31,57`;
  `extHostTypeConverters.ts` (imports 44–57, 65 + their converter namespaces);
  `extHostTypes.ts:33` (`HookTypeValue`); `extHostApiCommands.ts` (imports 25–26;
  `vscode.editorChat.start` 539–542, 580, 590); `mainThreadAuthentication.ts:32,35`
  (mcp OAuth/IdP bits); `mainThreadEditorTabs.ts:19` (`ChatEditorInput` tab-input branch).
- **Typings:** delete `vscode.d.ts` ~19595–21226 (verify boundaries: block ends where
  `declare module 'vscode'` closes; the four `Mcp*` types 20422–20513 are part of it);
  delete AI proposed files (30 content-matched: agentSessionsWorkspace,
  aiRelatedInformation, aiSettingsSearch, chatContextProvider, chatDebug, chatHooks,
  chatInputNotification, chatOutputRenderer, chatParticipantAdditions,
  chatParticipantPrivate, chatPromptFiles, chatProvider, chatSessionCustomizationProvider,
  chatSessionsProvider, chatStatusItem, defaultChatParticipant, embeddings,
  languageModelCapabilities, languageModelPricing, languageModelProxy,
  languageModelSystem, languageModelThinkingPart, languageModelToolResultAudience,
  languageModelToolSupportsModel, mappedEditsProvider, mcpServerDefinitions,
  mcpToolDefinitions, speech, toolInvocationApproveCombination, toolProgress; verify +
  9 name-matched: agentsWindowConfiguration, chatReferenceBinaryData,
  chatReferenceDiagnostic, chatTab, codeActionAI, contribChatEditorInlineGutterMenu,
  contribLanguageModelToolSets, remoteCodingAgents, aiTextSearchProvider — check each
  for non-AI content before deleting); regenerate
  `platform/extensions/common/extensionsApiProposals.ts` via the build mechanism
  (`build/lib/compilation.ts:269` reads dts filenames).
- **In-tree extensions sweep:** grep `extensions/` for `vscode.lm`, `vscode.chat`,
  `LanguageModel`, `ChatParticipant`, AI entries in `enabledApiProposals`; known:
  `extensions/git/src/repository.ts:1501` reads `chat.disableAIFeatures` (strip the
  branch so behavior = AI off), `extensions/mermaid-markdown-features` has a chat
  webview (`chat-webview-out` in build/filters) — remove its chat part + filter lines.
- Verify: compile; api unit suites; grep api layer for zero chat/mcp/speech/agentHost imports.

### S2 — MCP everywhere
Delete `contrib/mcp` (79), `platform/mcp` (23), `services/mcp` (5). Strip wiring:
`workbench.common.main.ts:68,174–176,194–195,233–234`; `workbench.desktop.main.ts:57–58,198`;
`workbench.web.main.ts:46,101–102,127`; `code/electron-main/app.ts:139–143`;
`sharedProcessMain.ts:134–141`; `cliProcessMain.ts:69–78` + `--add-mcp` argv
(`argv.ts` category `m`, option); `serverServices.ts:88–103`; non-AI consumers:
`contrib/authentication/browser/actions/{manageAccountPreferencesForMcpServerAction,manageTrustedMcpServersForAccountAction}.ts`
(delete both actions + registration), `preferences/browser/preferencesRenderers.ts:49–50,68,81,87,792–851`
(McpSettingsRenderer), `authentication.contribution.ts` mcp wiring;
`userDataSync` `SyncResource.Mcp` + `mcpSync.ts` + `userDataSyncResourceProvider.ts:521,528`;
`userDataProfile` `mcpResource`; `diagnosticsService.ts:60` `mcp.json` tag;
`extensions/configuration-editing/package.json` `mcp.json` → `vscode://schemas/mcp`
association (the `chatLanguageModels.json` / `prompts/*.toolsets.jsonc` associations
there go with S9/S10 when those schemas die);
`.vscode/mcp.json` (repo tooling file — leave; it's dev tooling, not product. Judge:
if it references the deleted component-explorer chat pieces only, prune entries).

### S3 — Speech & voice everywhere
Delete `contrib/speech`, `contrib/agentsVoice`, `terminalContrib/voice`. Strip:
`workbench.common.main.ts:223,232`, `workbench.desktop.main.ts:189`;
`codeEditor/browser/dictation/editorDictation.ts` (whole feature dies — it exists on
`ISpeechService`); `accessibility` voice settings + `accessibilityConfiguration.ts:12,902`
(`SPEECH_LANGUAGES`, voice setting ids); `terminalMenus.ts` voice items if any;
product `voiceWsUrl` read sites (field itself dies in S10). AccessibleViewProviderId
voice/chat enum members die in S10 with the enum cleanup.

### S4 — inlineChat + its consumers
Delete `contrib/inlineChat` (18). Strip consumers: notebook —
`baseCellViewModel.ts:28,193,319` (drop `IInlineChatSessionService` ctor param — ctor
signature change ripples to `codeCellViewModel.ts:26,69–80,150–152` and
`markupCellViewModel.ts:20,49–57,125–127,132,240`; remove `chatHeight` from layout
math), `controller/editActions.ts:29–30,90–91`, `controller/executeActions.ts:19`,
`notebook.contribution.ts:1272` cellGenerate description;
`interactive/browser/interactive.contribution.ts:63,538` + `interactiveEditor.ts:67`;
`replNotebook/browser/repl.contribution.ts:40,435`;
`codeEditor/browser/emptyTextEditorHint/emptyTextEditorHint.ts` (AI branch);
editor layer: `codeActionCommands.ts:84` (`MenuId.InlineChatEditorAffordance`
registration), `codeActionController.ts:151` (`'inlineChat.start'` special case);
`workbench.common.main.ts:229`; fixtures `editor/inlineChatAffordance.fixture.ts`,
`editor/inlineChatZoneWidget.fixture.ts`.

### S5 — browserView + web extraction + network filter (whole features)
Delete `contrib/browserView` (44), `platform/browserView`, `platform/webContentExtractor`,
`platform/networkFilter` (+ settings files). Strip wiring: `app.ts:51–52,146–147,1141`
(NetworkFilter/SandboxHelper registrations — sandbox itself in S6),
`sharedProcessMain.ts:145,501–502` (`AgentNetworkFilterService` + `PlaywrightChannel`),
`sessions.*.main` refs die with S9. Note: chat.shared.contribution registers the
networkFilter workbench singleton — dies with chat (S9); no other consumer remains
after this slice. Browser editor registrations in workbench main files; editor
resolver for http/https URIs dies with the contrib.

### S6 — Terminal AI + agent sandbox
Delete `terminalContrib/chatAgentTools` (107), `terminalContrib/chat` (11),
`terminalContrib/inlineHint` (4), `platform/sandbox` (16). Strip: `terminal.all.ts:18,22`
(+ inlineHint entry); `terminalContribExports.ts:10–12,31–37` (chat command-id enum
members + config re-exports); delete `terminalContribChatExports.ts` (10-line chat
shim); terminal core: delete `browser/{agentHostPty,agentHostTerminalService,ahpTerminalCommandSource,chatTerminalCommandMirror}.ts`
+ their tests; `terminal.contribution.ts:49,60` (`IAgentHostTerminalService` singleton);
`xterm/decorationAddon.ts:30–36,69–70,409–437,524–526` (attach-to-chat);
`terminalMenus.ts:26,414,869` (chat group, `ChatHasHiddenTerminals`, hardcoded
`github.copilot-chat`/`anthropic.claude-code` ids); sandbox wiring in `app.ts` +
`serverServices.ts:104–105`; `chat.tools.terminal.*` + `chat.agent.sandbox.*` settings
die with their files. Incidentals stay: terminalTelemetry `Copilot` shell-type enum
member (judge: remove), stickyScroll `'copilot'` default-list entry (remove).

**A1 hand-offs (2026-08-31):** → B1: terminal-core `agentHostTerminalService.ts`
(11 root importers) + `agentHostPty`/`ahpTerminalCommandSource`/
`chatTerminalCommandMirror` + tests + `terminal.contribution.ts:49,60` singleton +
the inlined chat command/setting literals in `terminalContribExports.ts` + the 4
orphaned sandbox re-exports there (`AgentSandboxWindowsEnabled` etc. — only
`AgentSandboxEnabled`/`Deprecated…` still have live readers). → A3:
`terminalMenus.ts` voice menu items (~530/545/765/775, hidden-by-default, point at
now-unregistered `TerminalCommandId.StartVoice/StopVoice`, `common/terminal.ts:497-498,557`)
+ the AI profile sorting (`splitProfiles`/`isAiProfileName` floats copilot/claude
profile names) + `AllowedShellType.{Claude,Codex,Gemini}` and stickyScroll's
`'agent','agy','claude','codex','gemini'` ignored-commands entries (finish what A1's
copilot-only scope started). → C1: `GeneralShellType.Copilot` in
`platform/terminal/common/terminal.ts:159` (+ `terminalProcess.ts:74`,
`windowsShellHelper.ts:193`, `terminalInstance.ts:135,2714` readers) +
`common/terminal.ts:637-647` dead `workbench.action.terminal.chat.*` skip-shell ids.
→ C2: `.vscode/searches/no-any-casts.code-search` stale rows +
`.github/skills/tool-rename-deprecation/SKILL.md:118`.

**Post-A3 verdicts (Sebastian 2026-09-01):** `notebook/.../cellDiagnostics` contrib
DELETED whole (the un-gated markers/sparkle feature was an AI funnel — virgin-parity
restored); `contrib/welcomeOnboarding` DELETED whole (was unregistered dead code;
the stripped theme-picker remnant goes too, with the orphaned GHE block + test).
Both land as the first commit of the A4/A5 batch.

**A2/A3 hand-offs (2026-09-01):** → B1 additionally: ai-services trio dirs
(sessions.common.main:79-81), `scmHistoryChatContext.ts` (3 chat importers;
relocate `SCMHistoryItemTransferData` then), `searchChatContext.ts`,
`notebookChatUtils.ts`, `contrib/remoteCodingAgents` (+ workbench.common.main:422),
`aiEditTelemetryService` + impl (8 chat files + `mainThreadLanguageFeatures.ts:40`
injection — strip that too), Copilot PMF survey pane (4 ts + css; sessions mains
import it), `componentFixtures/chat/{chatFixtureUtils,renderChatInput}.ts` +
`sessions/mockCodeReviewService.ts`, workbenchTestServices chat stubs,
`accessibility.contribution.ts:16` `SpeechAccessibilitySignalContribution` +
`accessibilityConfiguration.ts` voice re-exports. → C1 additionally:
`workbench.commandPalette.experimental.enableNaturalLanguageSearch` (reader gone) +
`IWorkbenchQuickAccessConfiguration` leftover, `inlineCompletionsController.ts:145-147`
string-read of `editorDictation.inProgress`, editor `gotoSymbolQuickAccess` dead
`attach?()` hook, `TaskRunSource.ChatAgent` + write-only `_taskRunSources`,
`themeMainServiceImpl` startupEditor union value (B1 file), MCP settings have no
ToC home until B1 (accepted interim), settingsEditor2.css dead toggle rules,
`preferences.ts:231` comment, `isPlainTextSearchHeading` +
`enableAutoLanguageDetection` orphans, voiceRecording accessibility signals.

### S7 — Workbench mixed strips (compiler-guided sweep)
- **scm:** relocate `SCMHistoryItemTransferData` (used by `scmHistoryViewPane.ts:74`)
  out of `scmHistoryChatContext.ts`, then delete that file; `scm.contribution.ts:41–43,682–695`;
  `scmInput.ts:71–73,851–863`; `quickDiffModel.ts:29,135,417` (`IChatEditingService`).
- **search:** delete `searchChatContext.ts` + registration (`search.contribution.ts:27`);
  `anythingQuickAccess.ts:57–58,141–144,861–866,1093`; `symbolsQuickAccess.ts:27–28,70,220–222`;
  delete `search/browser/AISearch` + `QueryType.aiText`/`IAITextQuery`/`aiTextSearch()`
  in `services/search/common/{search,searchService}.ts` — TOGETHER WITH (constraint #7):
  `vscode.proposed.aiTextSearchProvider.d.ts`, the AI members of `extHostSearch.ts` +
  `mainThreadSearch.ts` (`registerAITextSearchProvider`, `$provideAITextSearchResults`,
  `$getAIName`), the required `getAIName()` on `ISearchResultProvider`
  (search.ts:67), `searchModel.ts` AI paths, and an `extensionsApiProposals` regen.
- **git extension follow-ups from S1:** `extensions/git/src/repository.ts:1270,1483`
  still fire-and-forget `_chat.editSessions.accept` and `:1478` area
  `_aiEdits.clearAiContributions`/`_aiEdits.hasAiContributions` — strip these calls
  here (the commands they target die with chat).
- **debug:** delete `debugChatIntegration.ts` + `debug.contribution.ts:65,85`;
  `debugCommands.ts:36,1055`; `debugEditorActions.ts:26,312,357,400` (context-key `when`s).
- **tasks:** `abstractTaskService.ts:51,88–90,299–300,800,812,817–818` +
  `electron-browser/taskService.ts:51–52,99–100,139–140` (note: injected chat services
  are partly instantiation-order hacks — removing changes construction order; verify
  task tests).
- **extensions:** delete `common/{installExtensionsTool,searchExtensionsTool}.ts`;
  `extensions.contribution.ts:65–66,626,2101` (`IPluginInstallService`,
  `ILanguageModelToolsService`); `extensionsActions.ts:1796` AI-disabled branch.
- **testing:** delete `testingChatAgentTool.ts` + test + registration.
- **markers:** delete `markersChatContext.ts` + `markers.contribution.ts:39`.
- **preferences:** `settingsLayout.ts` chat category (lines 181–227 + 34, 38 — 58 hits);
  `preferences.ts:15,109,139,151` (toggle data + `AGENTS_WINDOW_SETTING_TAG`);
  `settingsEditor2.ts:54,151,280,321,418–419,1484`; `preferencesSearch.ts:17,399,576`
  (`IAiSettingsSearchService`); `preferencesService.ts:583`; agentsWindow-override UI
  in `settingsTree*`/indicators (~15 sites, rides S9's plumbing strip if easier).
- **accessibility:** `accessibleView.ts:48–49,115,251,990` (`IChatCodeBlockContextProviderService`
  + `getCodeBlockContext`); `editorAccessibilityHelp.ts:16,22,141,149–151`.
- **codeEditor:** `gotoSymbolQuickAccess.ts:37–38,50,134–138`.
- **quickaccess:** `commandsQuickAccess.ts:33,39–42,80–81,183` (chat "ask" pick +
  `IAiRelatedInformationService` semantic matching).
- **update:** `updateTitleBarEntry.ts:27,87,210,218` (`IChatService` restart deferral).
- **issue:** `issueReporterEditorPane.ts:38,94,372–395` (LM auto-title branch).
- **welcome:** delete `welcomeAgentSessions` (4 files) + `workbench.common.main.ts:388`;
  delete `remoteCodingAgents` (2) + `:422`; `gettingStarted.ts:72–73,205,946–947`
  (agents banner); `gettingStarted.contribution.ts:36,66,73` (`agentSessionsWelcomePage`);
  strip `welcomeOnboarding/browser/onboardingVariationA.ts` AI content INCLUDING the
  module-level `assertDefined(product.defaultChatAgent)` at :80 (constraint #2).
- **surveys:** `surveyQuestions.ts:50–94` (Copilot PMF), `survey.contribution.ts:26,80–91`
  (`_workbench.action.openCopilotSurvey`), `surveyEditorInput.ts:25` comment.
- **relauncher:** `relauncher.contribution.ts:73–84` (all 12 keys are `chat.*`) + test.
- **editTelemetry:** `editTelemetryContribution.ts:18,26,45,66` + delete the 13 AI-named
  files (`aiContributionFeature.ts`, `editStats/aiStats*.ts`, `telemetry/aiEditTelemetry/*`)
  + `aiStats.fixture.ts`.
- **workbench core:** `layout.ts:120–130` (chat entries in `COMMAND_CENTER_SETTINGS`),
  `:3009–3017` (aux-bar default gate), `:3067–3069` (startupEditor value);
  `quickAccessActions.ts:20,182–183`; `helpActions.ts:338–366,408` (Ask @vscode Help
  menu item); `editorGroupWatermark.ts:32,34,48` (chat watermark entry);
  `commandCenterControl.ts:28–29,166–173`; `browser/quickaccess.ts:32,36`
  (`showAskInChat`/`askChatLocation` options); `workbench.contribution.ts:513–528`
  (two commandPalette chat settings) — keep the D16-era
  `workbench.secondarySideBar.defaultVisibility` mac default (`:600–604`) but reword
  its fork comment (chat rationale gone; the aux bar stays hidden-by-default as a
  product choice, M3's `6370b80`).
- **inlineCompletions (workbench):** `inlineCompletionLanguageStatusBarContribution.ts:14,31,37,57,72–74`
  (entitlement-gated `$(copilot)` status entry — remove entry or its gate; simplest:
  remove the copilot-specific entry).
- **test infra:** `test/browser/workbenchTestServices.ts:135–147,193,381,383,2143–2164`
  + `test/common/workbenchTestServices.ts:35,786–812` (chat stubs);
  `componentFixtures/`: delete `chat/` (11), `sessions/` (7), the 2 inlineChat editor
  fixtures (S4) — `fixtureUtils.ts` detachment is easy: 6 import lines (65, 101–108)
  + stub regions 596–648 and 732; **keep** line 18 (`uiCustomFontWidgets.css` — ours,
  not chat).
- **authentication:** account actions already gone in S2; sweep for `ChatContextKeys.Setup` preconditions.

### S8 — Entitlements, accounts & Copilot policy plumbing
Delete `services/chat/common/chatEntitlementService.ts` +
`workbench.common.main.ts:146`; `services/policies/browser/accountPolicyGateContribution.ts`
+ `accountPolicyGate.contribution.ts` (exists to force-hide chat);
`platform/policy/common/{copilotManagedSettings,copilotManagedSettingsIpc}.ts` +
`node/copilotManagedSettingsService.ts` + wiring `code/electron-main/main.ts:67–68,232–241`,
`app.ts:107–108,1260–1261` (IPC channel `copilotManagedSettings`),
`workbench/electron-browser/desktop.main.ts:55,222–223`,
`services/accounts/browser/managedSettings.ts`;
`services/policies/common/accountPolicyService.ts` chat parts (:14,44,75–86,102–103,135,173–182);
`services/assignment/common/assignmentFilters.ts` Copilot filter (:14,90,96,110,152,160–162)
+ `assignmentService.ts:23,265,268`; `services/accounts/browser/defaultAccount.ts`
defaultChatAgent/copilotTokenInfo coupling (:9,15,75,87–113,123,137–138,147,180,827–860);
`base/common/defaultAccount.ts` copilot fields (:23–72);
`services/extensionManagement/browser/extensionEnablementService.ts:36,42,85,153,164–175,647`
(builtin-chat migration that WRITES `chat.disableAIFeatures`) + its test asserts
(`extensionsActions.test.ts:2561,2588`); `extensionManagement.ts:25` LM tag;
`standaloneServices.ts:1130–1131` null copilot stubs;
`editor/contrib/inlineCompletions/browser/model/inlineCompletionsModel.ts:1319–1320`
(SKU read) + `inlineCompletionsSource.ts:19,114,496,516` (`isCopilotLikeExtension`
telemetry forwarding) + `platform/dataChannel/browser/forwardingTelemetryService.ts:111–116`
+ `renameSymbolProcessor.ts:402,544` (`github.copilot.nes.*` commands) +
`editor/common/services/completionsEnablement.ts` (whole file exists on
`defaultChatAgent.completionsEnablementSetting`; delete + fix its consumers).
The inline-completions ENGINE stays (future M8 substrate).

**A4/A5 hand-offs (2026-09-01):** → B1 additionally: `platform/policy/common/{copilotManagedSettings,copilotManagedSettingsIpc}.ts`
(sessions.main:52 + chat.shared:18 import), `services/policies/common/accountPolicyService.ts`
whole-file surgery (sessions.main:222 ctor call + chatContextKeys:12 +
policyBlocked contrib; per D17 the account-based enterprise policy stack dies —
after B1 decide service-shell-vs-delete by remaining readers, `update.ts:476` +
`developerActions.ts:687,763-769` are the kept ones), `base/common/defaultAccount.ts`
copilot fields, `services/accounts/browser/defaultAccount.ts` defaultChatAgent
pipeline + MCP-registry fetch + `managedSettings.ts`, `completionsEnablement.ts`
(chatStatus readers; `editorWorkerService.ts:40` kept reader to fix),
`LANGUAGE_MODEL_CHAT_PROVIDER_EXTENSION_TAG` (chatModelsWidget reads),
`profile.mcpResource`/`SyncResource.Mcp`/`mcpSync.ts` (mcp ~8 sites +
sessions configurationService:86), sessions.main `getChannel('copilotManagedSettings')`.
→ C1 additionally: `mainThreadLanguageFeatures.ts:1516` `isCopilotLikeExtension`
read (+ delete `forwardingTelemetryService.ts:111-116` once editTelemetry dies),
CUT `RenameInferenceEngine` + test (D16 reshaped M8 — no dormant substrate) + the
rename orphans (`renameSymbolCommandId`, `renameSymbolTrackerService` singleton +
workbench.common.main:258 import (sessions twin dies in B1),
`editor.inlineSuggest.experimental.emptyResponseInformation`,
`InlineSuggestionItem.supportsRename`), notebook write-only
`NOTEBOOK_CELL_HAS_ERROR_DIAGNOSTICS`/`executionErrorDiagnostic`,
`IProductOnboardingTheme` (product.ts:263,284) + product.json:196
`onboardingThemes`, `authentication.contribution.ts:47` MCP data-table column,
configuration-editing `mcp.json` jsonc filename map (:58), diagnosticsService
`agent.md`/`claude.md`/`claude-mcp`/`claude-*-dir` tags.

### S9 — Roots, electron-main/shared/server, sessions machinery, build entries
- Delete the five root dirs (§1 Roots). Strip workbench mains:
  `workbench.common.main.ts:17,21` (theme/sizes hostages — constraint #4),
  `:145,147,148,226–228,235–236,419` (+ anything left); `workbench.desktop.main.ts:94–95,186`;
  `workbench.web.main.ts:104–107,128–130` (agentHost singletons incl. the
  `IAgentHostDebugLogsExportService` registration that points into contrib/chat).
- electron-main: `app.ts:128–130,1171–1175` (agent host starter/manager),
  `:999–1006,1029–1032` (`vscode://…?session=` → `vscode:openChatSession` dead send),
  `:1397–1404` (`--agents` first-window branch); `sharedProcessMain.ts:90–96,420–431,508–523`
  (SSH/WSL/Tunnel agent-host services + channels);
  `storageDataCleaner.ts:59–60`; server: `serverServices.ts:80–83,250–270,289–308`,
  delete `serverAgentHostManager.ts`, `agentHostChannel.ts` + both tests.
- Sessions machinery FULL strip (D17-4): `windowsMainService.ts:295–330,774,1518–1612,1726–1727`
  (`openAgentsWindow`/`ensureAgentsWindow`/`isSessionsWindow` propagation);
  `windowImpl.ts:55,711,1213–1215`; `window.ts:479`; `native.ts:142` +
  `nativeHostMainService.ts:307–308`; `launchMainService.ts:148`;
  `userDataProfile.ts` agents-profile machinery (:77,183,189,209–210,432,598–599 +
  electron-main :25,56) + `promptsHome`/`languageModelsResource`/`agentPluginsHome`
  resources + `userDataProfileImportExportService.ts:754,759` + `userDataProfileIcons.ts:56`;
  `environment.ts:93–94` + `environmentService.ts:280–281` (`agentSessionsWorkspace`);
  `IWorkbenchEnvironmentService.isSessionsWindow` + its ~193 refs (compiler-guided
  once the member goes: layoutActions 17, workspaceActions 13, editor.contribution 7,
  activitybarPart 5, viewDescriptorService 73,87,339–351,712–719, telemetry props,
  storageService, ext-host propagation extensionHostProtocol.ts:78 etc.);
  `contextkeys.ts:35` `IsSessionsWindowContext` + all `.negate()` guards;
  `views.ts:64–77` `WindowEnablement`; `configurationRegistry.ts:259` `agentsWindow`
  schema property + its ~30 use sites (workbench.contribution 22, editor config
  schema 6, update/theme/breadcrumbs/editorResolver); `assignmentService` WindowKind.Agents;
  `extensionManifestPropertiesService.ts:27,109`; `themeMainServiceImpl.ts:377–389`
  (agentSessionsWelcomePage first-frame branch — CAREFUL: this file carries M1/D15
  work; surgical edit only).
- CLI: `argv.ts` — `chat` subcommand (:51–60), `agent` in `NATIVE_CLI_COMMANDS` (:48,74–76),
  `--agents` (:111), `agent-plugins-dir`/`agents-user-data-dir`/`agents-extensions-dir`
  (:124–126), `inspect[-brk]-agenthost` (:174–175), `skip-sessions-welcome` (:183),
  `share-secrets-with-agents-app` (:189), chat-specific `mode` description (:56), help
  branches (:466–467,519,525); `common/argv.ts:27,57,79–81,92–93,117,119`;
  `code/node/cli.ts:101,252–263`; `code/electron-main/main.ts:583–592` (chat argv remap).
- Bootstrap/scripts: `scripts/code-sessions-web.{js,sh}`, `scripts/code-agent-host.{js,sh}`,
  `scripts/sync-agent-host-protocol.ts`; `src/tsec.exemptions.json:16,43`;
  `workbench{,-dev}.html` preload entries `notebookChatEditController`,
  `chatDebugTokenizer` (:66,68 / :70,72).
- Build entries (constraint #3): `build/buildfile.ts:27–28,31,36,50,61–62,78`;
  `build/gulpfile.vscode.ts:31–32,68,100–105,159,252–255,309–316,352`;
  `build/gulpfile.reh.ts:32–33,371–378`; `build/next/index.ts` (all listed refs);
  `build/vite/mobile-multi-diff*` (delete the two entries + html);
  `build/lib/mangle/index.ts:324`; `build/lib/i18n.ts:394,419–423` +
  `i18n.resources.json` (sessions block :638+ and chat/inlineChat/agentsVoice/
  remoteCodingAgents/welcomeAgentSessions/services-chat entries) + the
  `code-translation-remind` rule fix (constraint #5); `build/stylelint.ts:23,31,60,143`
  + `validateDesignTokens.ts` (design-token rules scoped to sessions — delete rule);
  `build/filters.ts` agentHost/codex/copilot/mermaid-chat globs; `build/agent-sdk/**`,
  `build/codex/**`, `build/lib/copilot.ts`; eslint.config.js all listed blocks
  (283–298, 321, 347, 361–364, 373, 691, 1112, 1658, 1668–1695, 1832, 1910–2233,
  2312–2315, 2335–2359, 2431, 2474, 2498) + delete
  `.eslint-plugin-local/code-no-untyped-meta-access.ts` (exists solely for agentHost `_meta`).

**B1 hand-offs (2026-09-01):** → C1 additionally: `defaultAccount.ts` still reads
`productService.defaultChatAgent` — land its removal together with the product
field; `PolicyDefinition.value`/`restrictedValue`/`managedSettings` +
reduced `IPolicyData` orphan closure (their tests are load-bearing — coherent
orphan job); `services/authentication/browser/authenticationMcp*.ts` ×3 (still
registered `workbench.common.main.ts:112-114`, read by authenticationQueryService)
+ the dead commented `AuthenticationMcpContribution` block
(`authentication.contribution.ts:167-181`); `ISCMHistoryProvider.resolveHistoryItem*ChatContext`
members (extension-API job: mainThreadSCM/extHostSCM/git extension);
`arcTelemetrySender.ts` `EditTelemetryReportEditArcForChatOrInlineChatSender`
(dies with the textModelEditSource chat factories);
`AccessibleViewProviderId.Survey` + `AccessibilityVerbositySettingId.Survey`
(orphaned by PMF pane deletion); extensionQuery/extensions `agentPlugins`
marketplace tags; mermaid `chat-webview-out` rename (10-min cosmetic job,
deliberately left). → C2 additionally: `build/lib/policies/policyData.jsonc`
networkFilter/agentHost rows; `extensions/terminal-suggest` dead
`--inspect-agenthost` completions; optional `MultiplexPolicyService` replacement
test (its only test was built on the deleted AccountPolicyService);
`codex:gen-protocol` npm script already removed in B1.

### S10 — Platform residue + product identity
- `platform/actions/common/actions.ts:255–325` (~70 chat/agent MenuIds) +
  `services/actions/common/menusExtensionPoint.ts:147–149,481–525` (AI menu keys);
  `extensionsRegistry.ts:393–410,423–425` (AI activation events);
  `platform/extensions/common/extensions.ts:236–243` (manifest fields).
- `accessibilitySignalService.ts:340,345,583–610,633,694–698` + the two chat MP3s;
  `platform/accessibility/browser/accessibleView.ts:18–27,49` AI provider-id enum members.
- Editor layer: `textModelEditSource.ts:78–79,103–126,151–153` (chat edit-source
  factories); `standaloneStrings.ts:39–47` (AI accessibility help);
  `codeEditorWidget.ts:2422` (`vscodeChatCodeBlock` embed check);
  `codeAction.ts:261` (`FromAILightbulb`), `lightBulbWidget.ts:29–31` (sparkle icons),
  `markerHoverParticipant.ts:213,311–312` (AI code-action suppression).
- Base: `codiconsLibrary.ts` ~24 AI icons + `codicons.ts:50–51`;
  `marshallingIds.ts:26–30`; `network.ts:158–160` (`chatEditingSnapshotScheme`);
  `base/common/product.ts` AI typings (:40–46,81,104,140,235,252–256,394–470);
  `managedSettings.ts:16,35` comments; `severityIcon.css:11` chat selector;
  `platform/quickinput/common/quickAccess.ts:35` stale comment.
- Product: `product.json` — `agentsTelemetryAppName`, `defaultChatAgent` (88–149),
  `GitHub.copilot-chat` list entries (153,156,235), `sessionsWindowAllowedExtensions`,
  `voiceWsUrl`; `platform/product/common/product.ts:97–110` OSS fallback (constraint #2:
  after S7).
- Themes/CSS: `workbenchThemeService.ts:101–103,243–245` (chat color overrides);
  `actionWidget.css:424` (reads `--vscode-chat-requestBubbleBackground`);
  `build/lib/stylelint/vscode-known-variables.json` — prune the 80 stale AI vars.
- **Orphan-closure sweep** (delete iff importers all died — verify each):
  `platform/domWidget`, `platform/endpoint`, `platform/otel/common/genAiAttributes.ts`
  (+ judge whole `platform/otel` if agentHost was its only reason),
  `platform/imageResize` + `services/imageResize`, `platform/git`,
  `platform/telemetry/common/languageModelToolTelemetry.ts`,
  `services/inlineCompletions/common/inlineCompletionsUnification.ts` (+ its
  workbench.common.main:145 import), `workspaceTagsService.ts` AI npm-tag entries
  (cosmetic — remove `'zod'`/`'@anthropic-ai/sdk'`? NO — that list catalogs USER
  workspace deps; leave it), `Schemas` audit, leftover `ChatContextKeys` references,
  **XAA auth (found in S1):** `createOrGetXaaProvider`
  (`services/authentication/browser/authenticationService.ts:384`) lost its only
  caller (mainThreadMcp) — `extHostXaaAuthProvider.ts`, the `createXaa` delegate and
  `$registerXaaAuthProvider`/`$promptForResourceClientSecret` are reachable only
  through it; delete the chain if still orphaned. Also: the surviving proposal
  placeholders + `extensionsApiProposals` final regen (constraint #7), and the
  `chatLanguageModels.json`/`toolsets.jsonc` schema associations in
  `extensions/configuration-editing/package.json`. Mermaid note: `chat-webview-out`
  is a misnomer for the (kept) editor-preview bundle — S9's filter edit should
  rename, not delete.
  Then a final repo grep: `chat|copilot|agentHost|mcp|languageModel` (case-insens.,
  word-ish) over `src/` to catch stragglers; report anything intentionally kept.

**C-phase verdicts (Sebastian 2026-09-01, post-C1):** (1) default-account stack
DELETED whole + the `defaultChatAgent` product field (sign-in entry, gallery SKU
gate, internal-org update routing all go; IAuthenticationService extension auth
unaffected); (2) terminal agent-CLI niceties NUKED for consistency
(`GeneralShellType.{Claude,Codex,Gemini}`, `agentCliShellTypes`, OSC title
patterns, `terminal.integrated.tabs.allowAgentCliTitle`); (3) remaining
diagnostics AI-tool tags (cursorrules/clinerules/gemini.md/github-instructions/
prompts dirs) AND reader-free `accessibility.signals.editsKept`/`editsUndone`
removed; (4) borderline orphans all cleaned: rename-telemetry fields incl.
monaco.d.ts surface, orphaned notebook inlineDiff files + chat-editing class
names, styleOverrides dead AI selectors. All land in C2.

### S11 — Deps, tests, CI, docs
- `package.json`: drop `@vscode/copilot-api`, `@anthropic-ai/claude-agent-sdk`,
  `@openai/codex`, `zod`, script `codex:gen-protocol`; `remote/package.json`: drop
  `@vscode/copilot-api`, `zod`. **Lockfiles: Sebastian runs `npm i` (root + remote)**
  — agent stages package.json edits; lockfile-drift commit after his run (M1 precedent).
- Delete `src/typings/anthropic-sdk.d.ts`, `src/typings/copilot-api.d.ts`.
- Tests: delete `test/smoke/src/areas/chat/` + `main.ts:30,420` wiring;
  `test/automation/src/{chat,agentsWindow}.ts` + `index.ts:29–30` +
  `workbench.ts:25–26,52–53,74–75`; delete `test/mcp/` entirely; unit-test stale
  exclude `test/unit/node/index.js:64`; `src/vs/sessions/test/e2e` dies with S9.
- CI/docs: `.github/workflows/sessions-e2e.yml`; `pr-linux-test.yml:339–352` (musl
  SDK rm lines); `build/azure-pipelines/common/agent-sdk-produce.yml` + its 7 refs;
  `.github/{agents,instructions,prompts,skills}` AI files (agentHostTesting,
  ai-customization, chat, sessions instructions; ~18 prompts; chat skills;
  classifier/commands/CODENOTIFY entries — prune AI rows); `.vscode/tasks.json` +
  `.vscode/mcp.json` component-explorer/chat entries (keep the explorer for surviving
  fixtures).

### S12 — Approved M3 round-3 hygiene (fold-in)
- `auxiliaryBarPart.css:11–15`: delete the embedded-editor `sideBar-background`
  repaint (upstream rule; its chat raison d'être is gone; under the D10 single-painter
  model it would double-coat any future embedded editor).
- Composite-bar dead fields: remove `ICompositeBarColors.{activeBackgroundColor,
  inactiveBackgroundColor,activeBorderColor,activeBackground}`
  (`compositeBarActions.ts:130–133`) + assignment sites `activitybarPart.ts:173–174,178`,
  `auxiliaryBarPart.ts:263–264`, `panelPart.ts:196–197`, `sidebarPart.ts:289–290`
  (verified unread; the theme colors themselves stay live via CSS vars).

---

## 4. Verification & acceptance

Per slice: `npm run compile` exit 0; targeted eslint on touched files; targeted unit
suites (api, notebook, terminal, theme, workbench glob as applicable); zero remaining
imports of the removed area (grep proof in the agent report).

M9 acceptance battery (after S11):
1. `npm run compile` + `npm run valid-layers-check` green; full node unit sweep.
2. Smoke typecheck (`cd test/smoke && npm run compile`) + automation compile.
3. `npm run gulp` task list loads; then Sebastian: fresh `npm i`, compile, dev boot —
   virgin profile shows the M1–M3 design, NO chat/AI surface anywhere (no commands
   matching chat/copilot/mcp/agent in the palette, no settings matching `chat.`,
   Help menu clean, terminal/scm/debug/notebook work).
4. Packaged build (Sebastian, by hand): boots, marker-grep bundle for absence
   (`agentHost`, `chat.contribution`, `sessions.desktop.main` must be gone).
5. Board/Tasks updated; `settings-m3-reduction.md` unaffected.

**Known accepted consequences:** marketplace extensions declaring AI contribution
points install fine (points silently ignored); extensions calling `vscode.lm`/`vscode.chat`
get a contained TypeError; `code chat`/`code agent`/`code --agents` CLI gone; the
~100 strip-sites in kept files become (mostly trivial) M6 rebase conflict surface,
traded against the deleted trees no longer conflicting at all.
