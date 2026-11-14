#!/usr/bin/env bash
# Reproducible react-native-paper bake-off for vitest-native.
# Clones paper at a pinned commit, installs it from its own lockfile, adds Vitest, Vite and
# vitest-native, drops in the vitest-native config, re-records snapshots (real RN host names
# differ from Jest's), then runs the suite under engine: 'native'.
# The pinned commit is on vitest-native 0.15's supported floors: React Native 0.88.1,
# React 19.3, @testing-library/react-native 14.0.0 (the app's own versions).
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
PAPER_SHA="c719a0886043c3475a3b29268e8b8018c4d0f4e1"
DIR="$HERE/.paper"

rm -rf "$DIR"
git clone https://github.com/callstack/react-native-paper "$DIR"
git -C "$DIR" checkout -q "$PAPER_SHA"

corepack enable
( cd "$DIR" && yarn install --immutable )
# Yarn 4.9.1 (the app's) has no release-age gate, so the cooldown vitest-native applies to
# every fixture install (7 days) is applied by hand: Vitest and Vite are exact versions, and
# the new transitive ranges they and vitest-native bring are pinned, scoped to exactly those
# ranges, to the releases a 7-day-gated resolver picks (bun's --minimum-release-age, as in
# obytes/setup.sh). Without them Yarn takes releases a few days old (rolldown, flow-parser).
# Nothing the app already locks changes. Refresh these when Vitest or Vite move.
node -e '
  const fs = require("fs"); const f = process.argv[1]; const p = JSON.parse(fs.readFileSync(f, "utf8"));
  p.resolutions = { ...p.resolutions,
    "rolldown@~1.2.14": "1.2.16",
    "@rolldown/pluginutils@^1.0.0": "1.0.1",
    "flow-remove-types@^2.337.0": "2.339.0",
    "postcss@^8.5.30": "8.5.32" };
  fs.writeFileSync(f, JSON.stringify(p, null, 2) + "\n");' "$DIR/package.json"
# CI=1 makes Yarn refuse lockfile changes; this one step is meant to change it.
( cd "$DIR" && YARN_ENABLE_IMMUTABLE_INSTALLS=false yarn add -D vitest@5.1.0 vite@8.3.5 "vitest-native@${VITEST_NATIVE:-vitest-native}" )

cp "$HERE/vitest.config.mts" "$DIR/vitest.config.mts"

# Re-record snapshots once (native renders real host names: RCTView vs Jest's View),
# then run clean for the pass count.
( cd "$DIR" && node_modules/.bin/vitest run --config vitest.config.mts -u >/dev/null 2>&1 || true )
( cd "$DIR" && node_modules/.bin/vitest run --config vitest.config.mts )
