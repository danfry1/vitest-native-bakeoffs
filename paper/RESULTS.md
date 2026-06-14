# react-native-paper — results

Run with `./setup.sh` (clones paper at the pinned commit, applies the vitest-native config, re-records snapshots, runs `engine: 'native'`).

## Environment (recorded 2026-06-14)

| | Version |
|---|---|
| react-native-paper | 5.15.1 (`2f5e55d`) |
| react-native | 0.85.3 |
| react | 19.2.3 |
| @testing-library/react-native | 13.3.3 (bumped from paper's pinned 11.5; vitest-native supports 12–14) |
| vitest | 4.1.8 |
| vitest-native | 0.5.0 |

## Result

| Runner | Tests | Files |
|---|---|---|
| Jest (paper's own, baseline) | **733 / 734** passed (1 skipped) | 56 suites |
| **vitest-native `engine: 'native'`** | **602 / 678** passed (1 skipped) | 29 / 52 |

**602 of paper's own tests (~89%) pass under vitest-native's native engine** with an idiomatic config (jest-compat + auto-detected presets), after re-recording snapshots. No paper source was modified beyond the RNTL bump and swapping the test config.

> Note: the test totals differ (678 vs 734) because some files fail at collection (see below), so their tests aren't counted.

## The ~75 failures are Jest-mock coupling, not vitest-native bugs

paper's test suite couples to **Jest's React Native mock implementation details**, which the native engine intentionally doesn't replicate (it runs *real* RN and mocks only the native boundary):

- **`vi.spyOn(View.prototype, 'measure')`** (Tooltip, all 17) — Jest's mock `View` is a class with `measure` on its prototype; real RN's `View` is a `forwardRef` with no such prototype, so the spy target is undefined.
- **`jest.mock('react-native', () => { …RN.Animated.timing = … })`** — paper overrides `Animated.timing/loop/parallel` for synchronous animations. Under the native engine RN is externalized, so `jest.mock('react-native')` doesn't intercept; real RN Animated runs instead.
- **`jest.mock('react-native/Libraries/Utilities/useWindowDimensions')` and `.../BackHandler`** — deep RN-internal paths; same externalization reason, so the mocked dimensions (750w) / BackHandler don't apply.
- **Dimensions-listener internals** (PaperProvider) — assert on jest-mock-specific listener behavior.

These are the documented trade-off of running real RN: tests written against jest's mock internals need adjusting. Tests asserting on *rendered output and behavior* pass.

## How to reproduce

```bash
./setup.sh
# or against a local vitest-native build:
VITEST_NATIVE="file:/path/to/vitest-native/packages/vitest-native" ./setup.sh
```
