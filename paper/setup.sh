#!/usr/bin/env bash
# Reproducible react-native-paper bake-off for vitest-native.
# Clones paper at a pinned commit, installs, drops in the vitest-native config
# + setup, re-records snapshots (real RN host names differ from jest's), then
# runs the suite under engine:'native'. See RESULTS.md for the recorded outcome.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
PAPER_SHA="2f5e55d5a034d7cf6ddb8ef8587960791f461ed1" # react-native-paper 5.15.1
DIR="$HERE/.paper"

rm -rf "$DIR"
git clone https://github.com/callstack/react-native-paper "$DIR"
git -C "$DIR" checkout -q "$PAPER_SHA"

corepack enable
( cd "$DIR" && yarn install )
# vitest-native must support RNTL 12-14; paper pins 11.5, so bump to 13 (sync API).
( cd "$DIR" && yarn add -D vitest@^4 "vitest-native@${VITEST_NATIVE:-vitest-native}" "@testing-library/react-native@^13" )

cp "$HERE/vitest.config.mts" "$DIR/vitest.config.mts"
cp "$HERE/vitest.setup.tsx" "$DIR/vitest.setup.tsx"

# Re-record snapshots once (native renders real host names: RCTView vs jest's View),
# then run clean for the honest pass count.
( cd "$DIR" && node_modules/.bin/vitest run --config vitest.config.mts -u >/dev/null 2>&1 || true )
( cd "$DIR" && node_modules/.bin/vitest run --config vitest.config.mts )
