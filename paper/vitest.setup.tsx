// vitest-native bake-off setup for react-native-paper.
// Idiomatic vitest-native: reanimated + safe-area are handled by auto-detected
// presets, so paper's jest.mocks for them are dropped. worklets (no preset) and
// the vector-icons mock are kept. Paper's deep RN-internal jest.mocks
// (react-native Animated override, useWindowDimensions, BackHandler) are NOT
// kept: the native engine externalizes RN, so jest.mock of RN internals can't
// intercept — those tests are an expected, documented divergence.
import { vi } from 'vitest'

vi.useFakeTimers()

vi.mock('react-native-worklets', () => require('react-native-worklets/lib/module/mock'))

vi.mock('@react-native-vector-icons/material-design-icons', () => {
  const React = require('react')
  const { Text } = require('react-native')
  const MockIcon = ({ name, color, size, style, ...props }: any) => (
    <Text style={[{ color, fontSize: size }, style]} {...props}>{name || '□'}</Text>
  )
  MockIcon.displayName = 'MockedMaterialDesignIcon'
  return { __esModule: true, default: MockIcon }
})
