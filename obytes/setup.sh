#!/usr/bin/env bash
# Reproducible obytes-template bake-off for vitest-native.
# Clones the template at a pinned commit, installs it from its own lockfile (bun), adds
# Vitest, Vite and vitest-native, drops in the vitest-native config, and runs the suite
# under engine: 'native'.
# The pinned commit is on vitest-native 0.15's supported floors: React Native 0.86.3,
# Expo SDK 57, @testing-library/react-native 13.3.3 (the app's own versions).
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
OBYTES_SHA="43783db5f9ef237cd350f4a6e3535dfffa1454eb"
DIR="$HERE/.obytes"

rm -rf "$DIR"
git clone https://github.com/obytes/react-native-template-obytes "$DIR"
git -C "$DIR" checkout -q "$OBYTES_SHA"

( cd "$DIR" && bun install --frozen-lockfile )
# Exact versions, behind vitest-native's 7-day release cooldown (604800 s).
( cd "$DIR" && bun add -d --minimum-release-age=604800 vitest@5.1.0 vite@8.3.5 "vitest-native@${VITEST_NATIVE:-vitest-native}" )

cp "$HERE/vitest.config.mts" "$DIR/vitest.config.mts"

( cd "$DIR" && node_modules/.bin/vitest run --config vitest.config.mts )
