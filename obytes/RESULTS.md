# obytes template — results

The [obytes React Native template](https://github.com/obytes/react-native-template-obytes), an Expo app. Run with
`./setup.sh`.

## Environment (recorded 2026-11-14)

| | Version |
|---|---|
| obytes template | `43783db` |
| expo / jest-expo | 57.0.27 / 57.0.5 |
| react-native | 0.86.3 |
| react | 19.2.3 |
| @testing-library/react-native | 13.3.3 (the app's own) |
| vitest / vite | 5.1.0 / 8.3.5 |
| vitest-native | 0.15.0 |
| package manager | bun 1.3.14 (the template's) |

The config is `vitest-native migrate --write` output for this commit, frozen in `vitest.config.mts`. It runs the
template's own `jest-setup.ts` through jest-compat, with no extra shims.

## Result

| Runner | Tests |
|---|---|
| Jest (the template's own, `jest-expo`) | 40 / 40 passed |
| **vitest-native `engine: 'native'`**, per-file and hot runtime alike | **40 / 40** passed |

## How to reproduce

```bash
cd obytes && ./setup.sh
# or against a local vitest-native build:
VITEST_NATIVE=file:/path/to/vitest-native.tgz ./setup.sh
```
