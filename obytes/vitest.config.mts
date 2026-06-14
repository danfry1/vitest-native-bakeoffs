import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import { reactNative } from 'vitest-native'
import { jestCompatAliases, jestCompatSetup, jestMockTransform } from 'vitest-native/jest-compat'

export default defineConfig({
  plugins: [reactNative({ engine: 'native', transform: ['uniwind', '@gorhom/bottom-sheet'] }), jestMockTransform()],
  resolve: {
    dedupe: ['react', 'react-test-renderer', 'react-is'],
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      ...jestCompatAliases(),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    setupFiles: [jestCompatSetup, './vitest-setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
})
