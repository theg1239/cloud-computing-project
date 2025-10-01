import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  variant?: 'background' | 'surface' | 'card' | 'transparent';
};

export function ThemedView({ style, lightColor, darkColor, variant = 'surface', ...otherProps }: ThemedViewProps) {
  const colorName = variant === 'transparent' ? undefined : (variant as 'background' | 'surface' | 'card');
  const backgroundColor = colorName
    ? useThemeColor({ light: lightColor, dark: darkColor }, colorName)
    : 'transparent';

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
