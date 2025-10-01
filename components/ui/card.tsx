import { ThemedView } from '@/components/themed-view';
import React from 'react';
import { Platform, Pressable, StyleSheet, View, ViewProps } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';

type CardProps = ViewProps & {
  onPress?: () => void;
  children: React.ReactNode;
};

export function Card({ style, children, onPress, ...rest }: CardProps) {
  const content = (
    <ThemedView style={[styles.card, style]} {...rest}>
      {children}
    </ThemedView>
  );
  if (onPress) {
    return (
      <Animated.View entering={FadeInDown.springify()} exiting={FadeOut}>
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
        >
          {content}
        </Pressable>
      </Animated.View>
    );
  }
  return (
    <Animated.View entering={FadeIn.springify()}>{content}</Animated.View>
  );
}

export function CardGrid({ children, columns = 2, gap = 12 }: { children: React.ReactNode; columns?: number; gap?: number }) {
  return <View style={[styles.grid, { gap }]}>{React.Children.map(children, (child, idx) => (
    <View key={idx} style={{ flexBasis: `${100 / columns}%`, flexGrow: 1 }}>
      {child as React.ReactElement}
    </View>
  ))}</View>;
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#DADADA',
    backgroundColor: 'rgba(255,255,255,0.9)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      },
      android: {
        elevation: 2,
      },
      default: {},
    }),
  },
  pressable: {
    borderRadius: 12,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.95,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
