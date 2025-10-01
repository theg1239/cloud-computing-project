import { ThemedView } from '@/components/themed-view';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/header';
import { ListItem } from '@/components/ui/list-item';
import { ScreenScroll } from '@/components/ui/screen';
import { Section } from '@/components/ui/section';
import { api } from '@/lib/api';
import { User } from '@/types/models';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function UserScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    if (!id) return;
    api.getUserById(String(id)).then((u) => u && setUser(u));
  }, [id]);

  if (!user) {
    return (
      <ScreenScroll contentContainerStyle={styles.container}>
        <PageHeader title="User" subtitle="Loading..." icon="person.2" compact />
      </ScreenScroll>
    );
  }

  return (
    <ScreenScroll contentContainerStyle={styles.container}>
      <PageHeader title={user.name} subtitle={user.email} icon="person.2" compact />
      <Section title="Details">
        <ThemedView variant="surface" style={styles.list}>
          <ListItem icon="person.2" title="Role" subtitle={user.role} right={<Badge label={user.role} tone={user.role === 'ADMIN' ? 'warning' : user.role === 'TECHNICIAN' ? 'success' : 'muted'} />} />
          {user.department ? (
            <ListItem icon="building.2" title="Department" subtitle={user.department} />
          ) : null}
        </ThemedView>
      </Section>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  list: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
});
