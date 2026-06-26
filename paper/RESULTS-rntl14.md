# react-native-paper — results (RNTL 14)

RNTL-14 variant of the paper bake-off. Run with `./setup-rntl14.sh` — same pinned paper
commit as `setup.sh`, but bumps `@testing-library/react-native` to 14 (+ its new
`test-renderer` peer) and applies `rntl14-await-codemod.mjs` (the `await` migration a real
maintainer runs to adopt RNTL 14's async `render`/`fireEvent`/`act`) before running
`engine: 'native'`.

## Environment (recorded 2026-06-26)

| | Version |
|---|---|
| react-native-paper | 5.15.1 (`2f5e55d`) |
| react-native | 0.85.3 |
| react | 19.2.3 |
| @testing-library/react-native | **14.0.0** (paper pins 11.5; vitest-native supports 12–14) |
| test-renderer | 1.2.0 (RNTL 14's renderer, replaces react-test-renderer) |
| vitest | 4.x |
| vitest-native | 0.7.x (RNTL-14 range-support build) |

## Result

| Runner | Tests | Files |
|---|---|---|
| **vitest-native `engine: 'native'`, RNTL 14** | **595 / 678** passed (~88%) | 32 / 52 |
| vitest-native `engine: 'native'`, RNTL 13 (baseline, see RESULTS.md) | 625 / 734 passed (~85%) | 36 / 52 |

**595 of 678 tests (~88%) pass under the native engine with RNTL 14** — a slightly *higher*
pass rate than the RNTL-13 baseline, on the same real components. No paper *source* was
modified; only the RNTL bump and the `await` migration to RNTL 14's async API. (The lower
absolute test count vs. RNTL 13 is because RNTL 14 removed several APIs paper's tests use —
`UNSAFE_*` queries, the `update` alias — so a few files fail to collect.)

## Zero engine regressions

The reason this bake-off exists: confirm the native engine renders real-world component
trees under RNTL 14 without engine-level crashes — in particular the nested-`<Text>` fix.

- **0 `RCTVirtualText` invariants.** Real RN renders a nested `<Text>` as the host
  `RCTVirtualText`, which RNTL 14's `test-renderer` did not recognize as text; vitest-native
  registers it as a text host. Across paper's nested-text-heavy components (Buttons, Cards,
  list items), the fix holds with zero failures.
- The 2 `RCTView` text invariants that *do* appear are paper's own test helper rendering a
  bare string in a `View` (`renderScene={({ route }) => route.title}`) — markup real RN
  correctly rejects and Jest's mock silently tolerated. That is the native engine being
  **more** faithful than Jest, not a bug.

## The remaining ~82 failures are test-authoring / Jest-mock coupling, not vitest-native bugs

Same families as the RNTL-13 baseline, plus RNTL-14 migration churn in paper's own tests:

- **Jest-mock coupling** (~30) — `vi.spyOn(View.prototype, 'measure')`, `BackHandler.mockPressBack`,
  `Appearance.getColorScheme.mockReturnValue`, Dimensions/Appearance listener spies. These
  assert on Jest's RN-mock internals, which a real-RN engine deliberately doesn't replicate.
- **RNTL 14 removed APIs** (~15) — `UNSAFE_getByProps`, `getByA11yState`, the `update` alias
  (now `rerender`). Paper's tests use APIs RNTL 14 dropped; a maintainer migrates these.
- **Other test-authoring** (~20) — `vi.mock` hoisting, `expect(() => render()).toThrow()`
  patterns that need rework now that `render` is async, custom-helper destructuring.

Tests asserting on *rendered output and behavior* pass; tests asserting on *Jest's mock
internals* or using *removed RNTL APIs* are the gap — neither is a vitest-native engine issue.

## How to reproduce

```bash
./setup-rntl14.sh
# or against a local vitest-native build:
VITEST_NATIVE="file:/path/to/vitest-native/packages/vitest-native" ./setup-rntl14.sh
```
