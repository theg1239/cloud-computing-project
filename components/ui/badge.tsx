import { ThemedText } from '@/components/themed-text';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export function Badge({ label, tone = 'muted' }: { label: string; tone?: 'muted' | 'success' | 'danger' | 'warning' | 'info' }) {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  const palette: Record<string, string> = {
    // Use theme.muted for better contrast on text; border was too light
    muted: theme.muted,
    success: '#16a34a',
    danger: '#dc2626',
    warning: '#f59e0b',
    info: theme.tint,
  };
  return (
    <View style={[styles.base, { backgroundColor: palette[tone] + '33', borderColor: palette[tone] }]}> 
      <ThemedText style={{ fontSize: 12, color: palette[tone], fontWeight: '600' }}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
