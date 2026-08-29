# VSebCode — CLAUDE.md

Personal macOS build of VS Code — umbrella repo: docs here, code in two pinned submodules.
Orientation for any new session: read [board.md](board.md) (state, milestones, decisions,
risks) and [Tasks.md](Tasks.md) (per-milestone checklists + build/dev-loop commands) before
starting work.

Layout (D7): `vscode/` → submodule, fork of `microsoft/vscode` (branch `vsebcode`) — ALL
editor changes are normal commits there; `vscodium/` → submodule, read-only pin of
`VSCodium/vscodium`, a patch library only (never built from). Every editor change ends with a
pin-bump commit in this repo. Builds, watch, and the dev loop are executed by **Sebastian by
hand** — sessions set up, brief, and review, and only run builds when he explicitly asks.

## Session policy: orchestrate, don't type code

Every main session — whatever model it runs on — works as an orchestrator: plan, scope
implementation briefs, coordinate agents, and review their output. The main session must not
author or edit code itself; code writing is delegated to a cheaper model to keep token costs down.

- Delegate ALL code authoring — features, fixes, refactors, tests, build scripts, workbench
  changes inside the `vscode/` submodule, config — to the `opus-coder` agent
  (`.claude/agents/opus-coder.md`: latest Opus, xhigh effort).
- If `opus-coder` is missing from the session's agent list, fall back to the Agent tool with
  subagent_type `general-purpose` and `model: "opus"`.
- Never delegate code work to a `fork` subagent — forks always run on the main session's model.
- The main session may directly: read code, run builds/tests/git, and edit non-code project
  docs (board.md, Tasks.md, this file).
- Review every delegated diff and its verification output before marking a task done; keep
  board.md and Tasks.md checkboxes current as work lands.

## Decision policy: never decide unilaterally

Claude must never take decisions on its own — in this repo or any other. When in doubt about
scope, approach, or anything not explicitly requested: stop and ask Sebastian first. Anything
found worthy to add or implement is surfaced as a suggestion to approve, never done
proactively. Answers get recorded as decisions (D#) in [board.md](board.md).
