import { ThemedText } from '@/components/themed-text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { ActivityIndicator, GestureResponderEvent, Platform, Pressable, StyleSheet, TextStyle, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export type ButtonProps = {
  title: string;
  onPress?: (e: GestureResponderEvent) => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  right?: React.ReactNode;
  left?: React.ReactNode;
  compact?: boolean;
};

export function Button({ title, onPress, variant = 'primary', loading, disabled, left, right, compact }: ButtonProps) {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];

  const baseStyle: TextStyle = { fontWeight: '600', textAlign: 'center' };

  return (
    <Animated.View entering={FadeIn} exiting={FadeOut}>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        disabled={disabled || loading}
        style={({ pressed }) => [
          styles.base,
          { backgroundColor: variant === 'primary' ? theme.tint : variant === 'secondary' ? theme.card : 'transparent', borderColor: theme.border },
          compact && { paddingVertical: 8, paddingHorizontal: 12 },
          pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
          (disabled || loading) && { opacity: 0.6 },
        ]}
      >
        <View style={styles.inline}>
          {left}
          {loading ? (
            <ActivityIndicator color={variant === 'primary' ? '#fff' : theme.text} />
          ) : (
            <ThemedText
              style={[
                baseStyle,
                { color: variant === 'primary' ? '#fff' : theme.text },
              ]}
            >
              {title}
            </ThemedText>
          )}
          {right}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } },
      android: { elevation: 0 },
      default: {},
    }),
  },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' },
});
