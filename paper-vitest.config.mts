import { defineConfig } from 'vitest/config'
import { reactNative } from 'vitest-native'
import { jestCompatAliases, jestCompatSetup, jestMockTransform } from 'vitest-native/jest-compat'

export default defineConfig({
  plugins: [reactNative({ engine: 'native' }), jestMockTransform()],
  resolve: {
    dedupe: ['react', 'react-test-renderer', 'react-is'],
    alias: { ...jestCompatAliases() },
  },
  test: {
    globals: true,
    environment: 'node',
    // jestCompatSetup first (installs the jest global), then paper's own
    // jest setup files (testSetup mocks worklets/reanimated/icons + fake
    // timers + RN Animated override; jestSetupAfterEnv runs reanimated setup).
    setupFiles: [jestCompatSetup, './vitest.setup.tsx'],
    include: ['src/**/__tests__/**/*.test.{ts,tsx}'],
  },
})
