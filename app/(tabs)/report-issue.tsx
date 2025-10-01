import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/header';
import { ListItem } from '@/components/ui/list-item';
import { ScreenScroll } from '@/components/ui/screen';
import { Section } from '@/components/ui/section';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Equipment } from '@/types/models';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, TextInput } from 'react-native';

export default function ReportIssueScreen() {
  const [items, setItems] = React.useState<Equipment[]>([]);
  const [desc, setDesc] = React.useState('');
  const [selected, setSelected] = React.useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ equipmentId?: string }>();

  React.useEffect(() => {
    api.listEquipment().then((list) => {
      setItems(list);
      if (params?.equipmentId) {
        const exists = list.find((e) => e.id === params.equipmentId);
        if (exists) setSelected(exists.id);
      }
    });
  }, [params?.equipmentId]);

  const submit = async () => {
    if (!user || !selected) return;
    try {
      await api.reportMaintenance({
        equipmentId: selected,
        labId: items.find((e) => e.id === selected)!.labId,
        description: desc || 'Issue reported',
        reportedByUserId: user.id,
        priority: 'MEDIUM',
      });
      Alert.alert('Submitted', 'Your maintenance ticket has been created');
      router.push('/(tabs)/maintenance');
    } catch (e: any) {
      Alert.alert('Failed', e?.message ?? String(e));
    }
  };

  const preselected = !!params?.equipmentId && !!selected;

  return (
    <ScreenScroll contentContainerStyle={styles.container}>
      <PageHeader title="Report Issue" subtitle="Select equipment and describe" icon="wrench.and.screwdriver" />
      {preselected ? (
        <Section title="Equipment">
          <ThemedView variant="surface" style={styles.list}>
            {(() => {
              const e = items.find((x) => x.id === selected);
              if (!e) return null;
              return (
                <ListItem
                  icon="cube"
                  title={e.name}
                  subtitle={`${e.type} • ${e.status}`}
                  selected
                  showChevron={false}
                />
              );
            })()}
          </ThemedView>
        </Section>
      ) : (
        <Section title="Equipment">
          <ThemedView variant="surface" style={styles.list}>
            {items.map((e) => (
              <ListItem
                key={e.id}
                icon="cube"
                title={e.name}
                subtitle={`${e.type} • ${e.status}`}
                selected={selected === e.id}
                onPress={() => setSelected(e.id)}
              />
            ))}
          </ThemedView>
        </Section>
      )}
      {selected && (
        <>
          <Section title="Description">
            <ThemedView variant="surface" style={styles.inputWrap}>
              <TextInput placeholder="What's wrong?" value={desc} onChangeText={setDesc} style={styles.input} />
            </ThemedView>
          </Section>
          <Button title="Submit" onPress={submit} />
        </>
      )}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  list: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  inputWrap: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  input: { padding: 12 },
});
