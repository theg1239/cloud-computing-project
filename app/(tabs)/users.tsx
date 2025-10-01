import { ThemedView } from '@/components/themed-view';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/header';
import { ListItem } from '@/components/ui/list-item';
import { ScreenScroll } from '@/components/ui/screen';
import { Section } from '@/components/ui/section';
import { api } from '@/lib/api';
import { User } from '@/types/models';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function UsersScreen() {
  const [items, setItems] = React.useState<User[]>([]);
  const router = useRouter();

  React.useEffect(() => {
    api.listUsers().then(setItems);
  }, []);

  return (
    <ScreenScroll contentContainerStyle={styles.container}>
      <PageHeader title="Manage Users" subtitle="Roles and access" icon="person.2" />
      <Section title="All Users">
        <ThemedView variant="surface" style={styles.list}>
          {items.map((u) => (
            <ListItem
              key={u.id}
              icon="person.2"
              title={u.name}
              subtitle={`${u.email}`}
              right={<Badge label={u.role} tone={u.role === 'ADMIN' ? 'warning' : u.role === 'TECHNICIAN' ? 'success' : 'muted'} />}
              onPress={() => router.push({ pathname: '/(tabs)/user', params: { id: u.id } } as any)}
            />
          ))}
        </ThemedView>
      </Section>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  list: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
});
