import { ThemedView } from '@/components/themed-view';
import React from 'react';
import { ScrollView, StyleProp, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function Screen({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <ThemedView variant="background" style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ThemedView variant="background" style={[{ flex: 1, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 96 }, style]}>
          {children}
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

export function ScreenScroll({ children, contentContainerStyle }: { children: React.ReactNode; contentContainerStyle?: StyleProp<ViewStyle> }) {
  return (
    <ThemedView variant="background" style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 96 }, contentContainerStyle]}>
          {children}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}
