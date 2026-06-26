#!/usr/bin/env bash
# RNTL-14 variant of the react-native-paper bake-off. Same pinned paper commit as
# setup.sh, but bumps RNTL to 14 (+ its test-renderer peer) and applies the same
# await codemod a real maintainer would run to adopt RNTL 14's async render/fireEvent
# /act. Validates that the native engine renders real-world component trees under
# RNTL 14 (the RCTVirtualText fix in particular) without engine-level crashes, and at
# a pass rate comparable to the RNTL-13 baseline in RESULTS.md (625/734).
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
PAPER_SHA="2f5e55d5a034d7cf6ddb8ef8587960791f461ed1" # react-native-paper 5.15.1
DIR="$HERE/.paper-rntl14"
# Defaults to the published vitest-native; override to test a local build:
#   VITEST_NATIVE="file:/path/to/vitest-native/packages/vitest-native" ./setup-rntl14.sh
VITEST_NATIVE="${VITEST_NATIVE:-vitest-native}"

rm -rf "$DIR"
git clone --quiet https://github.com/callstack/react-native-paper "$DIR"
git -C "$DIR" checkout -q "$PAPER_SHA"

corepack enable
( cd "$DIR" && yarn install )
# magic-string is the codemod's only dep not already provided by paper (@babel/core is).
( cd "$DIR" && yarn add -D vitest@^4 "vitest-native@$VITEST_NATIVE" "@testing-library/react-native@^14" "test-renderer@^1" magic-string )

cp "$HERE/vitest.config.mts" "$DIR/vitest.config.mts"
cp "$HERE/vitest.setup.tsx" "$DIR/vitest.setup.tsx"

# Adopt RNTL 14's async API across paper's own test files (what a maintainer would do).
# The codemod runs inside the clone so it resolves @babel/core + magic-string locally.
cp "$HERE/rntl14-await-codemod.mjs" "$DIR/rntl14-await-codemod.mjs"
TESTFILES=()  # bash 3.2-compatible collection (no mapfile)
while IFS= read -r f; do TESTFILES+=("$f"); done < <(find "$DIR/src" \( -name '*.test.tsx' -o -name '*.test.ts' \))
echo "[bakeoff] await-codemod over ${#TESTFILES[@]} paper test files"
( cd "$DIR" && node rntl14-await-codemod.mjs "${TESTFILES[@]/#$DIR\//}" )

# Re-record snapshots once (real RN host names differ from jest's), then run clean.
( cd "$DIR" && node_modules/.bin/vitest run --config vitest.config.mts -u >/dev/null 2>&1 || true )
( cd "$DIR" && node_modules/.bin/vitest run --config vitest.config.mts 2>&1 | tail -25 )
