# VSebCode

VSebCode is a fork of Code - OSS, the open-source repository (`microsoft/vscode` on GitHub) that Visual Studio Code is built from. The goal is the editor without telemetry, without Microsoft's online services and accounts, and without built-in AI. The fork deletes that code instead of hiding it behind settings. The one Microsoft service it keeps is the extension Marketplace. It follows upstream by merging upstream release tags.

## What was removed

- The built-in AI features: the Copilot Chat extension, chat, inline chat, agents, MCP support, AI search and speech, together with the `vscode.chat` and `vscode.lm` extension APIs. Extensions that need these APIs do not work.
- Telemetry, experiments and surveys. Telemetry is always off, and no setting turns it on.
- Self-update. VSebCode does not check for or install updates.
- Settings Sync and Cloud Changes.
- Remote Tunnels and the Rust CLI, with its `tunnel` and `serve-web` commands.
- The Microsoft and GitHub account providers and the built-in `github` extension.
- Microsoft's repository tooling: the GitHub workflows and the Azure Pipelines and 1ES build configuration.

## What stays

- The editor and the workbench, with the stable extension API apart from `vscode.chat` and `vscode.lm`.
- The built-in extensions, including `git` and the JavaScript debugger.
- The authentication API, so extensions can still provide accounts.
- The inline completion API, so extensions can still show inline suggestions.
- The Integrated Browser.
- The remote server and the web build.

Help links in the user interface still open the upstream documentation, which describes the features VSebCode keeps.

## Build from source

You need Git, Node.js with the major version given in `.nvmrc`, Python, and a C/C++ compiler toolchain for the native modules. Then run:

```sh
npm install
npm run compile-client
./scripts/code.sh
```

`npm install` also installs the dependencies of `build/`, `remote/` and the built-in extensions. `npm run compile-client` compiles the editor and the built-in extensions. `./scripts/code.sh` starts VSebCode from the sources; it downloads Electron and the built-in extensions listed in `product.json` when they are missing. Run the unit tests with `./scripts/test.sh`. On Windows, use `scripts\code.bat` and `scripts\test.bat`.

To build a packaged application, run the packaging task for your platform, for example `npm run gulp vscode-darwin-arm64` or `npm run gulp vscode-linux-x64`.

The developer documentation is [CLAUDE.md](CLAUDE.md), which covers the commands, the architecture and the state of the removal, and the guides in [docs/guidelines](docs/guidelines).

## Command line

The shell command is `vsc`. On macOS, add it to your `PATH` with **Shell Command: Install 'vsc' command in PATH** from the Command Palette. The Linux packages put it on the `PATH`. The Windows installer adds it only when its **Add to PATH** task stays selected.

```sh
vsc .                         # open the current folder
vsc --diff old.txt new.txt    # compare two files
vsc --help                    # list all options
```

Links with the `vsebcode://` protocol open in VSebCode, for example `vsebcode://file/path/to/file.txt:10`. Extensions that hard-code `vscode://` links do not reach VSebCode.

## Data folders and migrating from Code - OSS

VSebCode keeps its user data (settings, keybindings, snippets, profiles and state) and its extensions in these folders:

| Data | VSebCode | Code - OSS |
|---|---|---|
| User data on macOS | `~/Library/Application Support/VSebCode` | `~/Library/Application Support/Code - OSS` |
| User data on Linux | `~/.config/VSebCode` | `~/.config/Code - OSS` |
| User data on Windows | `%APPDATA%\VSebCode` | `%APPDATA%\Code - OSS` |
| Extensions | `~/.vsebcode/extensions` | `~/.vscode-oss/extensions` |

On Linux, `$XDG_CONFIG_HOME` replaces `~/.config` when it is set. On Windows, `~` is your user profile folder (`%USERPROFILE%`).

Nothing migrates the Code - OSS folders. To keep your setup, quit both editors and copy each Code - OSS folder to the matching VSebCode path. If VSebCode has already created its folders, copy the contents of the old folders into them. Sign-ins that extensions kept in the system keychain may not carry over, so sign in again where an extension asks.

A build started from the sources with `./scripts/code.sh` uses separate development folders (a user data folder named `vsebcode-dev` and `~/.vsebcode-dev/extensions`), so it does not touch the data of a packaged build.

## Extension gallery

VSebCode uses the Microsoft Marketplace as its extension gallery. The endpoints are set in the `extensionsGallery` block of `product.json`. The Marketplace terms of use limit it to Microsoft products, so decide for yourself whether you use it. To use another gallery, such as Open VSX, change `extensionsGallery` before you build.

VSebCode does not verify extension signatures. The verifier module, `@vscode/vsce-sign`, ships closed-source binaries and is licensed for use with Microsoft products only, so VSebCode does not include it.

## Icons

The application and file icons are still upstream's Code - OSS artwork. New VSebCode icons are in progress and will replace them.

## Contributing

Issues and pull requests are welcome on the [fork repository](https://github.com/sebastian-suarez/VSebCode). Read [CONTRIBUTING.md](CONTRIBUTING.md) first, and report security vulnerabilities as described in [SECURITY.md](SECURITY.md).

## License

VSebCode is released under the [MIT license](LICENSE.txt). The upstream code is copyright Microsoft Corporation, and the fork's changes are copyright Sebastian Suarez. Third-party components and their licenses are listed in [ThirdPartyNotices.txt](ThirdPartyNotices.txt).
