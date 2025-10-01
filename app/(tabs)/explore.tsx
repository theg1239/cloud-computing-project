import { ThemedView } from '@/components/themed-view';
import { PageHeader } from '@/components/ui/header';
import { ListItem } from '@/components/ui/list-item';
import { ScreenScroll } from '@/components/ui/screen';
import { Section } from '@/components/ui/section';
import { useAuth } from '@/lib/auth';
import { can } from '@/lib/rbac';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function ExploreScreen() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <ScreenScroll contentContainerStyle={styles.container}>
        <PageHeader title="Browse" subtitle="Find labs, gear, and docs" icon="magnifyingglass" />


      <Section title="Shortcuts">
        <ThemedView variant="surface" style={styles.list}>
          <ListItem icon="building.2" title="All Labs" subtitle="See all labs" onPress={() => router.push('/(tabs)/labs')} />
          <ListItem icon="cube" title="All Equipment" subtitle="Inventory and status" onPress={() => router.push('/(tabs)/equipment')} />
          <ListItem icon="doc.text" title="Experiments" subtitle="Docs and results" onPress={() => router.push('/(tabs)/experiments')} />
          {can(user, 'equipment:request') && (
            <ListItem icon="plus.circle" title="Request equipment" subtitle="Ask admin to add gear" onPress={() => router.push('/(tabs)/request-equipment')} />
          )}
        </ThemedView>
      </Section>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  list: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
