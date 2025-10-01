import { ThemedView } from '@/components/themed-view';
import { PageHeader } from '@/components/ui/header';
import { ListItem } from '@/components/ui/list-item';
import { ScreenScroll } from '@/components/ui/screen';
import { Section } from '@/components/ui/section';
import { TicketBadges } from '@/components/ui/status-badge';
import { maintenanceTickets } from '@/data/maintenance';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { can } from '@/lib/rbac';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function MaintenanceScreen() {
  const { user } = useAuth();
  const [tickets, setTickets] = React.useState(maintenanceTickets);
  const router = useRouter();

  const refresh = async () => {
    if (!can(user, 'maintenance:view')) {
      setTickets([]);
      return;
    }
    const t = await api.listMaintenance();
    setTickets(t);
  };

  React.useEffect(() => {
    refresh();
  }, []);

  return (
    <ScreenScroll contentContainerStyle={styles.container}>
      <PageHeader title="Maintenance" subtitle="Tickets and actions" icon="wrench.and.screwdriver" />

      <Section title="Open Tickets">
        <ThemedView variant="surface" style={styles.list}>
          {tickets.map((t) => (
            <ListItem
              icon="wrench.and.screwdriver"
              key={t.id}
              title={`#${t.id} • ${t.description}`}
              subtitle={`Reported: ${new Date(t.createdAt).toLocaleString()}`}
              right={<TicketBadges status={t.status} priority={t.priority} />}
              titleLines={1}
              subtitleLines={1}
              onPress={() => router.push({ pathname: '/(tabs)/ticket', params: { id: t.id } } as any)}
            />
          ))}
        </ThemedView>
      </Section>

      {can(user, 'maintenance:assign') ? (
        <Section title="Actions">
          <ThemedView variant="surface" style={styles.list}>
            <ListItem
              icon="person.2"
              title="Assign tickets"
              subtitle="Allocate to technicians"
              onPress={() => {
                const open = tickets.find((t) => t.status === 'OPEN');
                if (open) router.push({ pathname: '/(tabs)/ticket', params: { id: open.id } } as any);
                else alert('No open tickets to assign');
              }}
            />
            <ListItem
              icon="check"
              title="Resolve ticket"
              subtitle="Mark as resolved"
              onPress={() => {
                const inProgress = tickets.find((t) => t.status === 'IN_PROGRESS');
                if (inProgress) router.push({ pathname: '/(tabs)/ticket', params: { id: inProgress.id } } as any);
                else alert('No in-progress tickets to resolve');
              }}
            />
          </ThemedView>
        </Section>
      ) : null}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  list: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
