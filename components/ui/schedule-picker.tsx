import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export type ScheduleSlot = { id: string; labId?: string; startTime: string; endTime: string; status: 'AVAILABLE' | 'BOOKED' | string };

function keyForDay(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function SchedulePicker({
  slots = [],
  days = 7,
  value,
  onChange,
}: {
  slots: ScheduleSlot[];
  days?: number;
  value?: { start: Date; end: Date; slotId?: string };
  onChange: (start: Date, end: Date, slotId?: string) => void;
}) {
  const today = React.useMemo(() => new Date(), []);
  const [day, setDay] = React.useState<Date>(today);

  React.useEffect(() => {
    // Default day: the first day with any slots, else today
    const byDay = groupByDay(slots);
    const keys = Object.keys(byDay).sort();
    if (keys.length) {
      const first = new Date(keys[0] + 'T00:00:00');
      if (!sameDay(first, day)) setDay(first);
    }
  }, [slots]);

  const daysList = React.useMemo(() => {
    const list: Date[] = [];
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    for (let i = 0; i < days; i++) list.push(new Date(base.getTime() + i * 24 * 60 * 60 * 1000));
    return list;
  }, [days]);

  const grouped = React.useMemo(() => groupByDay(slots), [slots]);
  const selectedKey = keyForDay(day);
  const daySlotsRaw = (grouped[selectedKey] || []).sort((a, b) => +toDate(a.startTime) - +toDate(b.startTime));
  const daySlots = React.useMemo(() => {
    const seen = new Set<string>();
    const uniq: ScheduleSlot[] = [];
    for (const s of daySlotsRaw) {
      const k = `${+toDate(s.startTime)}-${+toDate(s.endTime)}`;
      if (seen.has(k)) continue;
      seen.add(k);
      uniq.push(s);
    }
    return uniq;
  }, [daySlotsRaw]);

  return (
    <View style={styles.wrap}>
      <View style={styles.dayRow}>
        {daysList.map((d) => {
          const k = keyForDay(d);
          const label = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
          const selected = k === selectedKey;
          return (
            <Button key={k} title={label} compact variant={selected ? 'primary' : 'secondary'} onPress={() => setDay(d)} />
          );
        })}
      </View>

      <ThemedView variant="surface" style={styles.card}>
        {daySlots.length === 0 ? (
          <ThemedText type="caption">No schedules for this day</ThemedText>
        ) : (
          <View style={styles.slotCol}>
            {daySlots.map((s) => {
              const st = toDate(s.startTime);
              const en = toDate(s.endTime);
              const label = `${st.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })} → ${en.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`;
              const selected = !!(value && value.slotId === s.id);
              const disabled = s.status !== 'AVAILABLE';
              return (
                <View key={s.id} style={styles.slotRow}>
                  <Button
                    title={label}
                    compact
                    variant={selected ? 'primary' : 'secondary'}
                    onPress={() => {
                      if (disabled) return;
                      onChange(st, en, s.id);
                    }}
                  />
                  <ThemedText type="caption" style={{ opacity: 0.7 }}>{s.status}</ThemedText>
                </View>
              );
            })}
          </View>
        )}
      </ThemedView>
    </View>
  );
}

function groupByDay(slots: ScheduleSlot[]) {
  const map: Record<string, ScheduleSlot[]> = {};
  for (const s of slots) {
    const d = toDate(s.startTime);
    if (isNaN(d.getTime())) continue;
    const k = keyForDay(d);
    (map[k] ||= []).push(s);
  }
  return map;
}

function toDate(v: any): Date {
  if (v instanceof Date) return v;
  if (typeof v === 'number') return new Date(v);
  const s = String(v);
  if (/^\d+$/.test(s)) return new Date(Number(s));
  const d = new Date(s);
  return d;
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  dayRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, padding: 12, gap: 8 },
  slotCol: { gap: 8 },
  slotRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
