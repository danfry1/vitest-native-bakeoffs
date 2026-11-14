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
    alias: { ...jestCompatAliases(), "@": fileURLToPath(new URL("./src", import.meta.url)), "@env": fileURLToPath(new URL("./env.ts", import.meta.url)) },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ["**/?(*.)+(spec|test).ts?(x)"],
    clearMocks: false,
    exclude: [...configDefaults.exclude, "**/*.{mjs,cjs,jsx,mts,cts}"],
    setupFiles: [jestCompatSetup, fileURLToPath(new URL("./jest-setup.ts", import.meta.url))],
  },
})
