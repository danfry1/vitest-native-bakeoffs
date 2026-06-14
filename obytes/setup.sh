#!/usr/bin/env bash
# Reproducible obytes-template bake-off for vitest-native.
# Clones the template at a pinned commit, installs (pnpm), drops in the
# vitest-native config + setup, and runs under engine:'native'. See RESULTS.md.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
OBYTES_SHA="fd9b358ed11913d2a49fd9ffa6582fe03ba130e7" # obytes template 9.0.0
DIR="$HERE/.obytes"

rm -rf "$DIR"
git clone https://github.com/obytes/react-native-template-obytes "$DIR"
git -C "$DIR" checkout -q "$OBYTES_SHA"

corepack enable
( cd "$DIR" && pnpm install )
( cd "$DIR" && pnpm add -D vitest@^4 "vitest-native@${VITEST_NATIVE:-vitest-native}" )

cp "$HERE/vitest.config.mts" "$DIR/vitest.config.mts"
cp "$HERE/vitest-setup.ts" "$DIR/vitest-setup.ts"

( cd "$DIR" && node_modules/.bin/vitest run --config vitest.config.mts )
