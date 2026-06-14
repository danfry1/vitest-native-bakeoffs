# obytes template — results

The [obytes React Native template](https://github.com/obytes/react-native-template-obytes) — an **Expo** app — is the deeply-coupled case: it exercises real-world friction (Expo init internals, externalized styling libs, no-preset native libs). Run with `./setup.sh`.

## Environment (recorded 2026-06-14)

| | Version |
|---|---|
| obytes template | 9.0.0 (`fd9b358`) |
| expo | 54.0.32 |
| react-native | 0.81.5 |
| react | 19.1.0 |
| @testing-library/react-native | 13.3.3 (already in vitest-native's supported range — no bump) |
| vitest | 4.1.8 |
| vitest-native | 0.6.1 |

## Result

| Runner | Tests |
|---|---|
| Jest (obytes' own, baseline) | **40 / 40** passed |
| **vitest-native `engine: 'native'`** | **34 / 40** passed (~85%) |

34 of 40 pass under the native engine. No obytes *source* changed — only the test config + setup. Unlike the cleaner react-native-paper run, this surfaced real migration friction worth documenting.

## What it took (and what it surfaced)

- **Drop obytes' inline reanimated + mmkv mocks** — vitest-native's auto-detected presets are more complete (obytes' inline reanimated mock is missing exports like `ReduceMotion`).
- **`transform: ['@gorhom/bottom-sheet']`** — needed so the bottom-sheet mock (below) intercepts (`vi.mock` doesn't apply to externalized libs unless they're pulled into the Vite graph).
- **Mock no-preset native libs** — `@gorhom/bottom-sheet`, `@shopify/flash-list`, `react-native-keyboard-controller` (no built-in presets; the same libs jest-expo / `transformIgnorePatterns` handle on the Jest side).
- **Global shims** — `location` and `ErrorUtils`, which RN/Expo's init expect.

> **Fixed in vitest-native 0.6.1:** `uniwind` (the app-wide styling lib) does `import { Appearance } from 'react-native'`, where `Appearance` is a lazy getter on RN's index that Node's CJS→ESM named-export detection misses for externalized libs. This previously required adding `uniwind` to the `transform` allowlist; as of 0.6.1 the native engine serves RN's index with an export hint, so getter-based named imports resolve and the workaround is no longer needed.

## The 6 that don't pass

- **`login-form.test.tsx` (whole file, doesn't collect)** — it imports Expo *core*, whose real init runs under the native engine and needs a chain of globals/transforms (`location` → `ErrorUtils` → a JSX-in-`.js` module deeper in the graph). This is the documented "deeply Expo-coupled, not turnkey" case — jest-expo sets all of this up; the native engine doesn't, out of the box.
- **2 `select.test.tsx` tests** — a `@gorhom/bottom-sheet` modal interaction (opening the sheet and finding `select-modal` / item testIDs) that the lightweight mock doesn't fully reproduce.

## Takeaway

Even a heavily-coupled Expo app gets most of its suite running with config + a few mocks — but Expo-core-importing tests need more setup than a plain RN library. The friction is real and documented here rather than hidden. See vitest-native's [Migrating from Jest](https://danfry1.github.io/vitest-native/migration/from-jest) guide.

## How to reproduce

```bash
./setup.sh
# or against a local vitest-native build:
VITEST_NATIVE="file:/path/to/vitest-native/packages/vitest-native" ./setup.sh
```
