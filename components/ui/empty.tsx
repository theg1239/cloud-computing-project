import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export function EmptyState({
  title,
  subtitle,
  action,
  icon = 'magnifyingglass',
}: {
  title: string;
  subtitle?: string;
  icon?: string;
  action?: { label: string; onPress: () => void };
}) {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  return (
    <ThemedView variant="surface" style={styles.wrap}>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <IconSymbol name={icon as any} size={28} color={theme.muted} />
        <ThemedText type="defaultSemiBold">{title}</ThemedText>
        {subtitle ? <ThemedText style={{ opacity: 0.7, textAlign: 'center' }}>{subtitle}</ThemedText> : null}
        {action ? <View style={{ height: 4 }} /> : null}
        {action ? <Button title={action.label} onPress={action.onPress} /> : null}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    padding: 20,
  },
});
