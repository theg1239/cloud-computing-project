import React from 'react';
import { View } from 'react-native';

export function HStack({ gap = 8, children, align = 'center', justify = 'flex-start' }: { gap?: number; children: React.ReactNode; align?: 'center' | 'flex-start' | 'flex-end' | 'stretch' | 'baseline'; justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly'; }) {
  return <View style={{ flexDirection: 'row', alignItems: align, justifyContent: justify, gap }}>{children}</View>;
}

export function VStack({ gap = 8, children }: { gap?: number; children: React.ReactNode }) {
  return <View style={{ gap }}>{children}</View>;
}
