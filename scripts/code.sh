#!/usr/bin/env bash

set -e

if [[ "$OSTYPE" == "darwin"* ]]; then
	realpath() { [[ $1 = /* ]] && echo "$1" || echo "$PWD/${1#./}"; }
	ROOT=$(dirname "$(dirname "$(realpath "$0")")")
else
	ROOT=$(dirname "$(dirname "$(readlink -f $0)")")
fi

function code() {
	cd "$ROOT"

	if [[ "$OSTYPE" == "darwin"* ]]; then
		NAME=`node -p "require('./product.json').nameLong"`
		EXE_NAME=`node -p "require('./product.json').nameShort"`
		CODE="./.build/electron/$NAME.app/Contents/MacOS/$EXE_NAME"
	else
		NAME=`node -p "require('./product.json').applicationName"`
		CODE=".build/electron/$NAME"
	fi

	# Get electron, compile, built-in extensions
	if [[ -z "${VSCODE_SKIP_PRELAUNCH}" ]]; then
		node build/lib/preLaunch.ts
	fi

	# Manage built-in extensions
	if [[ "$1" == "--builtin" ]]; then
		exec "$CODE" build/builtin
		return
	fi

	# Configuration
	export NODE_ENV=development
	export VSCODE_DEV=1
	export VSCODE_CLI=1
	export ELECTRON_ENABLE_STACK_DUMPING=1
	export ELECTRON_ENABLE_LOGGING=1

	DISABLE_TEST_EXTENSION="--disable-extension=vscode.vscode-api-tests"
	if [[ "$@" == *"--extensionTestsPath"* ]]; then
		DISABLE_TEST_EXTENSION=""
	fi

	# Launch Code
	exec "$CODE" . $DISABLE_TEST_EXTENSION "$@"
}

if [ -f /mnt/wslg/versions.txt ]; then
	code --disable-gpu "$@"
elif [ -f /.dockerenv ] || { [[ "$OSTYPE" == "linux"* ]] && [ -n "${GITHUB_ENVIRONMENT_ID:-}" ]; }; then
	# Workaround for https://bugs.chromium.org/p/chromium/issues/detail?id=1263267
	# Chromium does not release shared memory when streaming scripts
	# which might exhaust the available resources in the container environment
	# leading to failed script loading.
	code --disable-dev-shm-usage "$@"
else
	code "$@"
fi

exit $?
