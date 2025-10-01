import React from 'react';
import { View } from 'react-native';

export function Separator({ inset = 0 }: { inset?: number }) {
  return <View style={{ height: 1, backgroundColor: '#E5E5EA', marginLeft: inset }} />;
}
