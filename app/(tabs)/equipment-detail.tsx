import { ThemedView } from '@/components/themed-view';
import { PageHeader } from '@/components/ui/header';
import { ListItem } from '@/components/ui/list-item';
import { ScreenScroll } from '@/components/ui/screen';
import { Section } from '@/components/ui/section';
import { StatusBadge } from '@/components/ui/status-badge';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { can } from '@/lib/rbac';
import { Equipment, MaintenanceTicket } from '@/types/models';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet } from 'react-native';

export default function EquipmentDetailScreen() {
  const { equipmentId } = useLocalSearchParams<{ equipmentId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [item, setItem] = React.useState<Equipment | null>(null);
  const [tickets, setTickets] = React.useState<MaintenanceTicket[]>([]);
  const [labName, setLabName] = React.useState<string>('');

  async function refresh() {
    if (!equipmentId) return;
    const eq = await api.getEquipmentById(String(equipmentId));
    if (!eq) return;
    setItem(eq);
    const lab = await api.getLabById(eq.labId);
    setLabName(lab?.name ?? eq.labId);
    // Only fetch maintenance if user has permission
    if (can(user, 'maintenance:view')) {
      const all = await api.listMaintenance();
      setTickets(all.filter((t) => t.equipmentId === eq.id));
    } else {
      setTickets([]);
    }
  }

  React.useEffect(() => {
    refresh();
  }, [equipmentId]);

  if (!item) {
    return (
      <ScreenScroll contentContainerStyle={styles.container}>
        <PageHeader title="Equipment" subtitle="Loading..." icon="cube" />
      </ScreenScroll>
    );
  }

  const latestTicket = tickets[0];

  const goReportIssue = () => router.push({ pathname: '/(tabs)/report-issue', params: { equipmentId: item.id } } as any);
  const goBookLab = () => router.push({ pathname: '/(tabs)/book', params: { labId: item.labId } } as any);
  const goViewTicket = () => latestTicket ? router.push({ pathname: '/(tabs)/ticket', params: { id: latestTicket.id } } as any) : Alert.alert('No ticket', 'No maintenance ticket found for this equipment');
  const goViewLabEquipment = () => router.push({ pathname: '/(tabs)/equipment', params: { labId: item.labId } } as any);

  return (
    <ScreenScroll contentContainerStyle={styles.container}>
      <PageHeader
        title={item.name}
        subtitle={`${item.type} • ${labName}`}
        icon="cube"
        right={<StatusBadge kind="equipment" value={item.status} />}
        compact
        titleLines={1}
        subtitleLines={1}
      />

      <Section title="Details">
        <ThemedView variant="surface" style={styles.list}>
          <ListItem icon="building.2" title="Lab" subtitle={labName} onPress={goViewLabEquipment} />
          {item.serialNumber ? (
            <ListItem icon="check" title="Serial" subtitle={item.serialNumber} />
          ) : null}
        </ThemedView>
      </Section>

      <Section title="Actions">
        <ThemedView variant="surface" style={styles.list}>
          {item.status === 'AVAILABLE' && (
            <ListItem icon="calendar" title="Book lab" subtitle="Reserve a slot in this lab" onPress={goBookLab} />
          )}
          <ListItem icon="wrench.and.screwdriver" title="Report an issue" subtitle="Create maintenance ticket" onPress={goReportIssue} />
          {item.status === 'UNDER_MAINTENANCE' && (
            <ListItem icon="list.bullet.rectangle" title="View ticket" subtitle={latestTicket ? `#${latestTicket.id}` : 'No ticket'} onPress={goViewTicket} />
          )}
          {item.status === 'IN_USE' && (
            <ListItem icon="clock" title="View lab equipment" subtitle="See what's available" onPress={goViewLabEquipment} />
          )}
        </ThemedView>
      </Section>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  list: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
});
