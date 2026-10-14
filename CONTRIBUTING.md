# Contributing to VSebCode

Issues and pull requests go to the [fork repository](https://github.com/sebastian-suarez/VSebCode) on GitHub. Questions and discussion happen there too. There is no contributor license agreement to sign, and no bot manages issues or pull requests.

## Reporting issues

Search the open and closed issues before you open a new one. Open one issue per problem, and include:

- The VSebCode version and your operating system
- The steps that reproduce the problem
- What you expected and what happened instead
- Whether it still happens with extensions disabled (`vsc --disable-extensions`)
- Any errors in the developer tools console (**Help > Toggle Developer Tools**)

**Help > Report Issue** fills in the version and system details for an issue on the fork repository.

Do not report security vulnerabilities in public issues. Follow [SECURITY.md](SECURITY.md) instead.

## Changing code

Read [CLAUDE.md](CLAUDE.md) and the guides in [docs/guidelines](docs/guidelines) before you change code. CLAUDE.md lists the commands, the architecture, the decisions already made and the state of the removal. The guides describe the conventions of each area, such as coding style, tests, disposables and CSS.

If it is unclear whether something counts as Microsoft-specific or AI-specific, or how far a removal should go, open an issue before you write the change.

## Pull requests

- Keep one surface per commit, and keep mechanical changes (deleted folders, dropped imports) apart from edits to the code that stays. This keeps upstream merges reviewable.
- Before you open the pull request, run `npm run eslint`, `npm run hygiene` and the tests that cover your change (see "Tests" in CLAUDE.md). Git hooks are not installed, so nothing runs these checks for you.
- Describe what the change does and how you tested it.
