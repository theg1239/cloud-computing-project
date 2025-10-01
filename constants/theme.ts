/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// iOS-like system blue and dark-mode variant
const tintColorLight = '#007AFF';
const tintColorDark = '#0A84FF';

export const Colors = {
  light: {
    text: '#1C1C1E',
    // Grouped background, matches iOS lists and settings
    background: '#F2F2F7',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    border: '#E5E5EA',
    muted: '#6E6E73',
    tint: tintColorLight,
    icon: '#6E6E73',
    tabIconDefault: '#6E6E73',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#F2F2F7',
    background: '#0A0A0C',
    surface: '#1C1C1E',
    card: '#2C2C2E',
    border: '#3A3A3C',
    muted: '#A1A1AA',
    tint: tintColorDark,
    icon: '#B0B0B5',
    tabIconDefault: '#B0B0B5',
    tabIconSelected: tintColorDark,
  },
} as const;

export const Spacing = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 32,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const Motion = {
  duration: {
    fast: 120,
    normal: 200,
    slow: 320,
  },
  spring: {
    damping: 18,
    stiffness: 180,
  },
} as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
