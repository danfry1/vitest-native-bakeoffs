/* vitest-native bake-off setup for the obytes template.
   Dropped vs obytes' jest-setup.ts: reanimated + mmkv mocks — vitest-native ships
   complete auto-detected presets for both. Kept/added: worklets (enriched),
   expo-localization, and mocks for the no-preset libs obytes pulls in
   (@gorhom/bottom-sheet, @shopify/flash-list, react-native-keyboard-controller) —
   the same libs jest-expo / transformIgnorePatterns handle on the Jest side. */
import { vi } from 'vitest'

vi.mock('react-native-worklets', () => ({
  __esModule: true,
  default: {},
  registerEventHandler: vi.fn(() => 0),
  unregisterEventHandler: vi.fn(),
  runOnJS: (fn: any) => fn,
  runOnUI: (fn: any) => fn,
}))

vi.mock('react-native-keyboard-controller', () => {
  const React = require('react')
  const passthrough = ({ children }: any) => React.createElement(React.Fragment, null, children)
  return {
    __esModule: true,
    KeyboardController: { setInputMode: vi.fn(), setDefaultMode: vi.fn(), dismiss: vi.fn() },
    KeyboardProvider: passthrough,
    KeyboardAwareScrollView: passthrough,
    KeyboardGestureArea: passthrough,
    useKeyboardController: () => ({ setEnabled: vi.fn() }),
    useReanimatedKeyboardAnimation: () => ({ height: { value: 0 }, progress: { value: 0 } }),
  }
})

vi.mock('@gorhom/bottom-sheet', () => {
  const React = require('react')
  const { View } = require('react-native')
  const passthrough = React.forwardRef(({ children }: any, _ref: any) =>
    React.createElement(View, null, typeof children === 'function' ? null : children),
  )
  const BottomSheetModal = React.forwardRef(({ children }: any, ref: any) => {
    React.useImperativeHandle(ref, () => ({ present: () => {}, dismiss: () => {}, close: () => {}, snapToIndex: () => {} }))
    return React.createElement(View, null, typeof children === 'function' ? null : children)
  })
  return {
    __esModule: true,
    default: passthrough,
    BottomSheetModal,
    BottomSheetModalProvider: passthrough,
    BottomSheetView: passthrough,
    BottomSheetFlatList: passthrough,
    BottomSheetScrollView: passthrough,
    BottomSheetBackdrop: passthrough,
    useBottomSheetModal: () => ({ dismiss: vi.fn(), dismissAll: vi.fn() }),
    useBottomSheet: () => ({ close: vi.fn(), expand: vi.fn(), snapToIndex: vi.fn() }),
  }
})

vi.mock('@shopify/flash-list', () => {
  const React = require('react')
  const { FlatList } = require('react-native')
  return { __esModule: true, FlashList: FlatList, AnimatedFlashList: FlatList }
})

vi.mock('expo-localization', () => ({
  getLocales: vi.fn(() => [
    { languageTag: 'en-US', languageCode: 'en', textDirection: 'ltr', regionCode: 'US',
      currencyCode: 'USD', currencySymbol: '$', decimalSeparator: '.', digitGroupingSeparator: ',',
      measurementSystem: 'metric' },
  ]),
}))

// @ts-expect-error obytes' global.window shim for RN testing
global.window = global
// Expo's dev async-require messageSocket reads location.protocol at import; shim it.
// @ts-expect-error
global.location = global.location || { protocol: 'http:', href: 'http://localhost/', hostname: 'localhost', host: 'localhost' }
// RN normally installs ErrorUtils via InitializeCore; expo's init reads it.
// @ts-expect-error
global.ErrorUtils = global.ErrorUtils || { getGlobalHandler: () => undefined, setGlobalHandler: () => {}, reportError: () => {}, reportFatalError: () => {} }
