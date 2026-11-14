// `vitest-native migrate --write` output for the pinned commit, frozen so every run uses the
// same config. `engine: 'native'` is literal: bakeoff-ratchet.mjs derives its stock and hot
// configs by replacing that string.
import { configDefaults, defineConfig } from 'vitest/config'
import { reactNative } from 'vitest-native'
import { jestCompatAliases, jestCompatSetup, jestMockTransform } from 'vitest-native/jest-compat'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [reactNative({ engine: 'native' }), jestMockTransform()],
  resolve: {
    dedupe: ['react', 'react-test-renderer', 'react-is'],
    alias: { ...jestCompatAliases() },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[tj]s?(x)"],
    clearMocks: false,
    exclude: [...configDefaults.exclude, "example/node_modules*", "example/node_modules*/**", "lib/**", "**/*.{mts,cts}"],
    setupFiles: [jestCompatSetup, fileURLToPath(new URL("./jest/testSetup.js", import.meta.url)), fileURLToPath(new URL("./jest/jestSetupAfterEnv.js", import.meta.url)), "@testing-library/react-native"],
  },
})
