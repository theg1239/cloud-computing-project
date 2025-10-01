import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/header';
import { ListItem } from '@/components/ui/list-item';
import { SchedulePicker } from '@/components/ui/schedule-picker';
import { ScreenScroll } from '@/components/ui/screen';
import { Section } from '@/components/ui/section';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Lab } from '@/types/models';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, TextInput } from 'react-native';

export default function BookLabScreen() {
  const [labs, setLabs] = React.useState<Lab[]>([]);
  const [purpose, setPurpose] = React.useState('');
  const [selected, setSelected] = React.useState<string | null>(null);
  const [start, setStart] = React.useState<Date>(() => {
    const now = new Date();
    return new Date(now.getTime() + 15 * 60 * 1000);
  });
  const [durationMin, setDurationMin] = React.useState<number>(60);
  const [end, setEnd] = React.useState<Date>(() => {
    const now = new Date();
    const s = new Date(now.getTime() + 15 * 60 * 1000);
    return new Date(s.getTime() + 60 * 60 * 1000);
  });
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ labId?: string }>();
  const [slots, setSlots] = React.useState<Array<{ id: string; startTime: string; endTime: string; status: string }>>([]);
  const [slotId, setSlotId] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    api.listLabs().then((list) => {
      setLabs(list);
      if (params?.labId) {
        const match = list.find((l) => l.id === params.labId);
        if (match) setSelected(match.id);
      }
    });
  }, [params?.labId]);

  React.useEffect(() => {
    const load = async () => {
      if (!selected) return setSlots([]);
      const from = new Date();
      const to = new Date(from.getTime() + 3 * 24 * 60 * 60 * 1000);
      const data = await api.listLabSchedules(selected, from.toISOString(), to.toISOString());
      setSlots(data);
    };
    load();
  }, [selected]);

  const book = async () => {
    if (!user || !selected) return;
    try {
      await api.createBooking({
        labId: selected,
        userId: user.id,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        purpose: purpose || 'Lab session',
      });
      Alert.alert('Booked', 'Your lab slot is confirmed');
      router.push('/(tabs)/bookings');
    } catch (e: any) {
      Alert.alert('Booking failed', e?.message ?? String(e));
    }
  };

  // Utilities for time selection
  const clampFuture = (d: Date) => {
    const now = new Date();
    const min = new Date(now.getTime() + 5 * 60 * 1000);
    return d.getTime() < min.getTime() ? min : d;
  };
  const formatDateTime = (d: Date) =>
    d.toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  const setDuration = (m: number) => {
    setDurationMin(m);
    setEnd(new Date(start.getTime() + m * 60 * 1000));
  };
  const adjustStart = (deltaMin: number) => {
    const next = clampFuture(new Date(start.getTime() + deltaMin * 60 * 1000));
    setStart(next);
    setEnd(new Date(next.getTime() + durationMin * 60 * 1000));
  };

  function toDate(v: any): Date {
    if (v instanceof Date) return v;
    if (typeof v === 'number') return new Date(v);
    const s = String(v);
    if (/^\d+$/.test(s)) return new Date(Number(s));
    return new Date(s);
  }

  return (
    <ScreenScroll contentContainerStyle={styles.container}>
  <PageHeader title="Book a Lab" subtitle="Pick a lab, time and book" icon="calendar" />
      <Section title="Choose a Lab">
        <ThemedView variant="surface" style={styles.list}>
          {labs.map((l) => (
            <ListItem
              key={l.id}
              icon="building.2"
              title={l.name}
              subtitle={`${l.location} • cap ${l.capacity}`}
              selected={selected === l.id}
              onPress={() => setSelected(l.id)}
            />
          ))}
        </ThemedView>
      </Section>
      {selected && (
        <>
          {slots.length > 0 ? (
            <Section title="Available Schedules">
              <SchedulePicker
                slots={slots as any}
                value={{ start, end, slotId }}
                onChange={(st, en, sid) => {
                  setStart(st);
                  setEnd(en);
                  setSlotId(sid);
                  setDurationMin(Math.max(15, Math.round((en.getTime() - st.getTime()) / 60000)));
                }}
              />
            </Section>
          ) : null}

          {/* <Section title="Available Schedules">
            <ThemedView variant="surface" style={styles.list}>
              {slots.length === 0 ? (
                <ListItem icon="info.circle" title="No schedules found" subtitle="Try another day or lab" />
              ) : (
                slots.map((s) => (
                  <ListItem
                    key={s.id}
                    icon={s.status === 'AVAILABLE' ? 'clock' : 'clock.badge.xmark'}
                    title={`${new Date(s.startTime).toLocaleString()} → ${new Date(s.endTime).toLocaleString()}`}
                    subtitle={s.status}
                    onPress={() => {
                      if (s.status !== 'AVAILABLE') return;
                      const st = toDate(s.startTime as any);
                      const en = toDate(s.endTime as any);
                      setStart(st);
                      setEnd(en);
                      setDurationMin(Math.max(15, Math.round((en.getTime() - st.getTime()) / 60000)));
                    }}
                  />
                ))
              )}
            </ThemedView>
          </Section> */}

          <Section title="Purpose">
            <ThemedView variant="surface" style={styles.inputWrap}>
              <TextInput placeholder="e.g., Project work" value={purpose} onChangeText={setPurpose} style={styles.input} />
            </ThemedView>
          </Section>
          <Button title="Book Slot" onPress={book} />
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
  rowGap: { flexDirection: 'row', gap: 8 },
  // obsolete styles removed with SchedulePicker
});
