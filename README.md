# vitest-native bake-offs

Reproducible real-app validation for [`vitest-native`](https://github.com/danfry1/vitest-native) — running real React Native libraries' own test suites under the native engine, so the "validated against real apps" claim is something anyone can check, not just an assertion.

Each subdirectory pins an app at a known commit, applies a vitest-native config, and records the honest pass count (including what fails and why).

## Results

| App | Jest baseline | vitest-native (`engine: 'native'`) | Notes |
|---|---|---|---|
| [react-native-paper](paper/RESULTS.md) | 716 / 717 | **696 / 717** | A library, at `c719a08` (React Native 0.88.1, RNTL 14). The remaining failures are listed in its results. |
| [obytes template](obytes/RESULTS.md) | 40 / 40 | **40 / 40** | An Expo SDK 57 app, at `43783db` (React Native 0.86.3). |

Both apps are pinned to commits on vitest-native 0.15's supported floors (React Native 0.86+, Expo 57+, RNTL 13+,
Vitest 5, Vite 8). Each config is the `vitest-native migrate` output for its commit, frozen in the repository.

## What this is (and isn't)

- **Is:** a reproducible record of running unmodified real-world test suites under vitest-native, with full honesty about what passes and what doesn't.
- **Isn't:** a claim of 100% drop-in compatibility. Deeply Jest-coupled suites need per-suite cleanup — see vitest-native's [Migrating from Jest](https://danfry1.github.io/vitest-native/migration/from-jest) guide.

The reproducible *correctness* guarantee for vitest-native itself is its [CI-gated cross-check](https://github.com/danfry1/vitest-native) (mock engine vs real RN, RN 0.81–0.85). These bake-offs are additional real-world evidence.

## Running

Each app has a `setup.sh` that clones the app at its pinned commit, installs, applies the config, and runs:

```bash
cd paper && ./setup.sh
```
