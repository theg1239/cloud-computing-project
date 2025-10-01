import { ThemedView } from '@/components/themed-view';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty';
import { PageHeader } from '@/components/ui/header';
import { ListItem } from '@/components/ui/list-item';
import { ScreenScroll } from '@/components/ui/screen';
import { Section } from '@/components/ui/section';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Experiment } from '@/types/models';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function ExperimentsScreen() {
  const [items, setItems] = React.useState<Experiment[]>([]);
  const { user } = useAuth();

  React.useEffect(() => {
    api.listExperiments().then(setItems);
  }, []);

  return (
    <ScreenScroll contentContainerStyle={styles.container}>
      <PageHeader title="Experiments" subtitle="Docs and results" icon="doc.text" />
      <Section title="All">
        {items.length === 0 ? (
          <EmptyState title="No experiments" subtitle="Nothing has been recorded yet." icon="doc.text" />
        ) : (
          <ThemedView variant="surface" style={styles.list}>
            {items.map((ex) => (
              <ListItem
                key={ex.id}
                icon="doc.text"
                title={ex.title}
                subtitle={`${ex.documents.length} files`}
                right={<Badge label={`${ex.documents.length}`} tone="info" />}
                onPress={() => {}}
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
