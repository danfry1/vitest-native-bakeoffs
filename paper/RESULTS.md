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
| **vitest-native `engine: 'native'`** | **625 / 734** passed (~85%) | 36 / 52 |

**625 of paper's 734 tests (~85%) pass under vitest-native's native engine** with an idiomatic config (jest-compat + auto-detected presets), after re-recording snapshots. No paper *source* was modified — only the RNTL bump and the test config/setup.

> The native engine externalizes React Native, so paper's deep `jest.mock('react-native…')` calls can't intercept. Where the mocked behavior is reasonable, the setup reproduces it by monkeypatching the **live** (resident) RN modules at runtime — paper's `Animated.timing/loop/parallel` override and its fixed 750-wide window. That recovers ~23 tests over a no-monkeypatch baseline (602 → 625).

## The remaining ~52 failures are Jest-mock coupling, not vitest-native bugs

These tests assert on **Jest's React Native mock implementation details**, which a real-RN engine deliberately doesn't replicate (replicating them would defeat the point of running real RN):

- **`vi.spyOn(View.prototype, 'measure')`** (Tooltip, all 17) — Jest's mock `View` is a class with `measure` on its prototype; real RN's `View` is a `forwardRef` with no such prototype, so the spy target is undefined.
- **`jest.mock('react-native/Libraries/Utilities/Appearance')` + `jest.spyOn(Appearance, 'addChangeListener')`** (PaperProvider, 10) — deep RN-internal mocks/spies that don't intercept under externalized RN.
- **Dimensions-listener spies** ("removes Dimensions listener on unmount") — assert on jest-mock-specific listener identities.
- A scattered tail (TextInput, CheckboxItem, Dialog, Modal, Menu, …, 1–5 each) — same family: spies/mocks targeting RN internals.

Tests asserting on *rendered output and behavior* pass; tests asserting on *jest's mock internals* are the gap.

## How to reproduce

```bash
./setup.sh
# or against a local vitest-native build:
VITEST_NATIVE="file:/path/to/vitest-native/packages/vitest-native" ./setup.sh
```
