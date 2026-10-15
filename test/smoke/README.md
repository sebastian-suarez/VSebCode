# VSebCode Smoke Test

Use the Node.js major version specified in the repository's `.nvmrc` (24.x). Smoke tests run the Electron desktop application.

## Quick Overview

```bash
# Build the client and built-in extensions in the repository (if needed)
npm install
npm run compile-client
npm run gulp compile-extensions

# Dev (Electron)
npm run smoketest

# Build (Electron)
npm run smoketest -- --build <path to latest version>
example: npm run smoketest -- --build /Applications/VSebCode.app
```

When running from sources, launch the application once with `./scripts/code.sh` (or `scripts\code.bat` on Windows) to prepare the Electron binary in `.build/electron`.

### Running for a release (Endgame)

You must always run the smoketest version that matches the release you are testing. So, if you want to run the smoketest for a release build (e.g. `release/1.22`), you need to check out that version of the smoke tests too:

```bash
git fetch
git checkout release/1.22
npm i && npm run compile
cd test/smoke
npm i
```

### Debug

- `--verbose` logs all the low level driver calls made to Code;
- `-f PATTERN` (alias `-g PATTERN`) filters the tests to be run.

**Note**: you can enable verbose logging of playwright library by setting a `DEBUG` environment variable before running the tests (<https://playwright.dev/docs/debug#verbose-api-logs>), for example to `pw:browser`.

### Develop

```bash
cd test/smoke
npm run watch
```

## Troubleshooting

### Error: Could not get a unique tmp filename, max tries reached

On Windows, check for the folder `C:\Users\<username>\AppData\Local\Temp\t`. If this folder exists, the `tmp` module can't run properly, resulting in the error above. In this case, delete the `t` folder.

## Pitfalls

- Beware of workbench **state**. The tests within a single suite will share the same state.

- Beware of **singletons**. This evil can, and will, manifest itself under the form of FS paths, TCP ports, IPC handles. Whenever writing a test, or setting up more smoke test architecture, make sure it can run simultaneously with any other tests and even itself. All test suites should be able to run many times in parallel.

- Beware of **focus**. **Never** depend on DOM elements having focus using `.focused` classes or `:focus` pseudo-classes, since they will lose that state as soon as another window appears on top of the running VS Code window. A safe approach which avoids this problem is to use the `waitForActiveElement` API. Many tests use this whenever they need to wait for a specific element to _have focus_.

- Beware of **timing**. You need to read from or write to the DOM... but is it the right time to do that? Can you 100% guarantee that `input` box will be visible at that point in time? Or are you just hoping that it will be so? Hope is your worst enemy in UI tests. Example: just because you triggered Quick Access with `F1`, it doesn't mean that it's open and you can just start typing; you must first wait for the input element to be in the DOM as well as be the current active element.

- Beware of **waiting**. **Never** wait longer than a couple of seconds for anything, unless it's justified. Think of it as a human using Code. Would a human take 10 minutes to run through the Search viewlet smoke test? Then, the computer should even be faster. **Don't** use `setTimeout` just because. Think about what you should wait for in the DOM to be ready and wait for that instead.
