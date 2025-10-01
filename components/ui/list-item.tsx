import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

export function ListItem({
  title,
  subtitle,
  onPress,
  right,
  icon,
  selected,
  showChevron = true,
  titleLines = 1,
  subtitleLines = 1,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  icon?: string; // SF Symbols name for IconSymbol
  selected?: boolean;
  showChevron?: boolean;
  titleLines?: number;
  subtitleLines?: number;
}) {
  const scheme = useColorScheme() ?? 'light';
  const border = Colors[scheme].border;
  const iconColor = Colors[scheme].icon;
  const tint = Colors[scheme].tint;
  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: border, backgroundColor: selected ? `${tint}14` : 'transparent' },
        selected && { borderBottomColor: tint },
        pressed && { opacity: 0.8 },
      ]}
      onPress={onPress}
    >
      {icon ? <IconSymbol name={icon as any} size={18} color={iconColor} /> : null}
      <View style={{ flex: 1, minWidth: 0 }}>
        <ThemedText numberOfLines={titleLines} ellipsizeMode="tail" type="defaultSemiBold">{title}</ThemedText>
        {subtitle ? (
          <ThemedText numberOfLines={subtitleLines} ellipsizeMode="tail" style={{ opacity: 0.7 }}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {right ? <View style={{ marginLeft: 8, alignSelf: 'center' }}>{right}</View> : null}
      {showChevron ? <IconSymbol name="chevron.right" size={16} color={iconColor} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
