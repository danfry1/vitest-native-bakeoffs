# react-native-paper — results

Run with `./setup.sh`. It clones paper at the pinned commit, installs it from its own lockfile, adds Vitest, Vite
and vitest-native, applies the vitest-native config, re-records snapshots, and runs `engine: 'native'`.

## Environment (recorded 2026-11-14)

| | Version |
|---|---|
| react-native-paper | `c719a08` (main after 5.15.1) |
| react-native | 0.88.1 |
| react | 19.3.0 |
| @testing-library/react-native | 14.0.0 (the app's own) |
| vitest / vite | 5.1.0 / 8.3.5 |
| vitest-native | 0.15.0 |

The config is `vitest-native migrate --write` output for this commit, frozen in `vitest.config.mts`. It runs paper's
own Jest setup files (`jest/testSetup.js`, `jest/jestSetupAfterEnv.js`) through jest-compat, with no extra shims.

## Result

| Runner | Tests | Files |
|---|---|---|
| Jest (paper's own) | 716 / 717 passed (1 skipped) | 54 |
| **vitest-native `engine: 'native'`**, per-file and hot runtime alike | **696 / 717** passed (1 skipped) | 48 / 54 |

## The 20 that fail

Listed by first error. Not triaged in this update.

- `PaperProvider.test.tsx` (10): spies on React Native's `AccessibilityInfo` / `Appearance` that Jest's React Native
  mock provides (`… is not a spy`, `jest.mocked(…).mockReturnValue is not a function`), and one theme-change test.
- `Surface.test.tsx` (4): animated style assertions (Reanimated shared values, animated corner radius, dynamic colours).
- `Banner.test.tsx` (2): `onShow/onHideAnimationFinished` called on mount.
- `Menu.test.tsx` (2): the "web focus" tests, which replace `HTMLElement` with `View`. Jest's mocked `View` is a class;
  the real `View` is a `forwardRef` object.
- `TextInput.test.tsx` (2): `toHaveProp` on accessibility props of the host input.

## How to reproduce

```bash
cd paper && ./setup.sh
# or against a local vitest-native build:
VITEST_NATIVE=file:/path/to/vitest-native.tgz ./setup.sh
```
