import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/header';
import { ListItem } from '@/components/ui/list-item';
import { ScreenScroll } from '@/components/ui/screen';
import { Section } from '@/components/ui/section';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Notification } from '@/types/models';
import React from 'react';
import { Alert, StyleSheet } from 'react-native';

export default function NotificationsScreen() {
  const { user } = useAuth();
  const [items, setItems] = React.useState<Notification[]>([]);

  async function refresh() {
    const data = await api.listNotifications(user?.id);
    setItems(data);
  }

  React.useEffect(() => {
    refresh();
  }, [user]);

  const markRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      refresh();
    } catch (e: any) {
      Alert.alert('Failed', e?.message ?? String(e));
    }
  };

  return (
    <ScreenScroll contentContainerStyle={styles.container}>
      <PageHeader title="Notifications" subtitle="Recent updates" icon="bell" />
      <Section title="All">
        <ThemedView variant="surface" style={styles.list}>
          {items.map((n) => (
            <ListItem
              key={n.id}
              icon="bell"
              title={n.message}
              subtitle={new Date(n.createdAt).toLocaleString()}
              right={!n.read ? <Button title="Mark read" variant="ghost" compact onPress={() => markRead(n.id)} /> : undefined}
              onPress={() => {}}
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