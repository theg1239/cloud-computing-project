import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface NotificationBadgeProps {
  count: number;
  color?: string;
}

export function NotificationBadge({ count, color = '#FF3B30' }: NotificationBadgeProps) {
  if (count === 0) return null;

  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.text}>{count > 99 ? '99+' : count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  text: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
