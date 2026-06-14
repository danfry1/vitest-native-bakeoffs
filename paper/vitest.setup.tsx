// vitest-native bake-off setup for react-native-paper.
//
// reanimated + safe-area are handled by auto-detected vitest-native presets, so
// paper's jest.mocks for them are dropped. worklets (no preset) and the
// vector-icons mock are kept as vi.mocks.
//
// paper's remaining setup mocks DEEP React Native internals via jest.mock
// (Animated override, useWindowDimensions, BackHandler). Under the native engine
// RN is externalized, so jest.mock('react-native...') can't intercept — BUT real
// RN is resident in the worker, so we achieve the same effect by monkeypatching
// the live modules at runtime here. That recovers the animation / dimensions /
// back-handler tests without touching paper's source.
import { vi, beforeEach } from 'vitest'

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

// Apply paper's runtime overrides before each test. require() (not a top-level
// import) so RN resolves through the native Flow-strip hook, and beforeEach so it
// runs at test time once the hooks are installed.
beforeEach(() => {
  const { Animated, Dimensions } = require('react-native')

  // paper's Animated override: timing/loop/parallel resolve on the next tick so
  // fake timers drive them (matches paper's jest.mock('react-native') override).
  Animated.timing = (value: any, config: any) => ({
    value,
    config,
    start: (cb?: (r: { finished: boolean }) => void) => {
      setTimeout(() => {
        value.setValue(config.toValue)
        cb?.({ finished: true })
      }, 0)
    },
    stop: () => {},
    reset: () => {},
  })
  Animated.loop = () => ({
    start: (cb?: (r: { finished: boolean }) => void) => setTimeout(() => cb?.({ finished: true }), 0),
    stop: () => {},
    reset: () => {},
  })
  Animated.parallel = (animations: any[]) => ({
    start: (cb?: (r: { finished: boolean }) => void) => {
      animations.forEach((a) => a.start())
      cb?.({ finished: true })
    },
    stop: () => {},
    reset: () => {},
  })

  // paper mocks useWindowDimensions to a fixed 750-wide window; match it.
  Dimensions.set({
    window: { width: 750, height: 1334, scale: 2, fontScale: 1 },
    screen: { width: 750, height: 1334, scale: 2, fontScale: 1 },
  })
})
