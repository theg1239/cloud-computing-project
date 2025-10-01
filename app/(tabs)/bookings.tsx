import { ThemedView } from '@/components/themed-view';
import { EmptyState } from '@/components/ui/empty';
import { PageHeader } from '@/components/ui/header';
import { ListItem } from '@/components/ui/list-item';
import { ScreenScroll } from '@/components/ui/screen';
import { Section } from '@/components/ui/section';
import { StatusBadge } from '@/components/ui/status-badge';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Booking } from '@/types/models';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet } from 'react-native';

export default function BookingsScreen() {
  const { user } = useAuth();
  const [items, setItems] = React.useState<Booking[]>([]);
  const [labNameById, setLabNameById] = React.useState<Record<string, string>>({});
  const router = useRouter();

  async function refresh() {
    if (!user) return;
    const data = await api.listBookings();
    setItems(data);
    const labs = await api.listLabs();
    const map: Record<string, string> = {};
    for (const l of labs) map[l.id] = l.name;
    setLabNameById(map);
  }

  React.useEffect(() => {
    refresh();
  }, [user]);

  useFocusEffect(
    React.useCallback(() => {
      refresh();
      return () => {};
    }, [user])
  );

  function toDate(v: any): Date {
    if (v instanceof Date) return v;
    if (typeof v === 'number') return new Date(v);
    const s = String(v);
    if (/^\d+$/.test(s)) return new Date(Number(s));
    return new Date(s);
  }

  const cancel = async (id: string) => {
    try {
      await api.cancelBooking(id);
      await refresh();
    } catch (e: any) {
      Alert.alert('Cancel failed', e?.message ?? String(e));
    }
  };

  function onPressBooking(b: Booking) {
    const labName = labNameById[b.labId] || b.labId;
    const start = toDate(b.startTime).toLocaleString();
    const end = toDate(b.endTime).toLocaleString();
    Alert.alert(
      'Booking',
      `${labName}\n${start} → ${end}\nStatus: ${b.status}`,
      [
        { text: 'Close', style: 'cancel' },
        { text: 'Go to lab', onPress: () => router.push({ pathname: '/(tabs)/equipment', params: { labId: b.labId } } as any) },
        { text: 'Cancel booking', style: 'destructive', onPress: () => cancel(b.id) },
      ]
    );
  }

  return (
    <ScreenScroll contentContainerStyle={styles.container}>
      <PageHeader title="My Bookings" subtitle="Upcoming and past" icon="clock" />
      <Section title="Bookings">
        {items.length === 0 ? (
          <EmptyState
            title="No bookings yet"
            subtitle="You don’t have any bookings."
            icon="calendar"
            action={{ label: 'Book a lab', onPress: () => router.push('/(tabs)/book') }}
          />
        ) : (
          <ThemedView variant="surface" style={styles.list}>
            {items.map((b) => (
              <ListItem
                key={b.id}
                icon="calendar"
                title={`${labNameById[b.labId] || b.labId} • ${b.purpose ?? 'Booking'}`}
                subtitle={`${toDate(b.startTime).toLocaleString()} → ${toDate(b.endTime).toLocaleString()} • ${b.status}`}
                right={
                  <>
                    <StatusBadge kind="booking" value={b.status} />
                  </>
                }
                onPress={() => onPressBooking(b)}
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
