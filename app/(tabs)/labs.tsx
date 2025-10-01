import { ThemedView } from '@/components/themed-view';
import { EmptyState } from '@/components/ui/empty';
import { PageHeader } from '@/components/ui/header';
import { ListItem } from '@/components/ui/list-item';
import { ScreenScroll } from '@/components/ui/screen';
import { Section } from '@/components/ui/section';
import { api } from '@/lib/api';
import { Lab } from '@/types/models';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function LabsScreen() {
  const [labs, setLabs] = React.useState<Lab[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    api.listLabs().then(setLabs).catch((e) => setError(String(e?.message ?? e)));
  }, []);

  return (
    <ScreenScroll contentContainerStyle={styles.container}>
      <PageHeader title="Labs" subtitle="Locations and capacity" icon="building.2" />
      <Section title="All Labs">
        {labs.length === 0 ? (
          <EmptyState title="No labs" subtitle="No labs to show." icon="building.2" />
        ) : (
          <ThemedView variant="surface" style={styles.list}>
            {labs.map((l) => (
              <ListItem
                key={l.id}
                icon="building.2"
                title={l.name}
                subtitle={`${l.location} • cap ${l.capacity}`}
                onPress={() => router.push({ pathname: '/equipment', params: { labId: l.id } } as any)}
              />
            ))}
          </ThemedView>
        )}
      </Section>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  list: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
});
