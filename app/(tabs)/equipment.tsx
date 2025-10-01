import { ThemedView } from '@/components/themed-view';
import { EmptyState } from '@/components/ui/empty';
import { PageHeader } from '@/components/ui/header';
import { ListItem } from '@/components/ui/list-item';
import { ScreenScroll } from '@/components/ui/screen';
import { Section } from '@/components/ui/section';
import { StatusBadge } from '@/components/ui/status-badge';
import { api } from '@/lib/api';
import { Equipment } from '@/types/models';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function EquipmentScreen() {
  const { labId } = useLocalSearchParams<{ labId?: string }>();
  const [items, setItems] = React.useState<Equipment[]>([]);
  const router = useRouter();

  React.useEffect(() => {
    if (labId) {
  api.listEquipment(String(labId)).then(setItems);
    } else {
      api.listEquipment().then(setItems);
    }
  }, [labId]);

  return (
    <ScreenScroll contentContainerStyle={styles.container}>
      <PageHeader title="Equipment" subtitle={labId ? 'Filtered by lab' : 'Inventory and status'} icon="cube" />
      <Section title="Items">
        {items.length === 0 ? (
          <EmptyState title="No equipment found" subtitle={labId ? 'This lab has no items.' : 'Nothing to show.'} icon="cube" />
        ) : (
          <ThemedView variant="surface" style={styles.list}>
            {items.map((e) => (
              <ListItem
                key={e.id}
                icon="cube"
                title={e.name}
                subtitle={`${e.type}`}
                right={<StatusBadge kind="equipment" value={e.status} />}
                onPress={() => router.push({ pathname: '/(tabs)/equipment-detail', params: { equipmentId: e.id } } as any)}
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
