import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export function PageHeader({ title, subtitle, icon, right, compact = false, titleLines = 1, subtitleLines = 1 }: { title: string; subtitle?: string; icon?: string; right?: React.ReactNode; compact?: boolean; titleLines?: number; subtitleLines?: number }) {
  const scheme = useColorScheme() ?? 'light';
  const tint = Colors[scheme].tint;
  return (
    <Animated.View entering={FadeInDown.delay(30)} style={styles.container}>
      <View style={styles.row}>
        {icon ? (
          <View style={[styles.iconWrap, compact && styles.iconWrapCompact, { borderColor: Colors[scheme].border, backgroundColor: Colors[scheme].surface }] }>
            <IconSymbol name={icon as any} color={tint} size={compact ? 16 : 20} />
          </View>
        ) : null}
        <View style={{ flex: 1 }}>
          <ThemedText numberOfLines={titleLines} ellipsizeMode="tail" type="headline" style={[styles.title, compact && styles.titleCompact]}>{title}</ThemedText>
          {subtitle ? <ThemedText numberOfLines={subtitleLines} ellipsizeMode="tail" style={[styles.subtitle, compact && styles.subtitleCompact]}>{subtitle}</ThemedText> : null}
        </View>
        {right}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontFamily: Fonts.rounded,
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: 0.2,
  },
  titleCompact: {
    fontSize: 22,
    lineHeight: 26,
  },
  subtitle: { opacity: 0.7, marginTop: 2 },
  subtitleCompact: { opacity: 0.7, marginTop: 0 },
  iconWrapCompact: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
});
