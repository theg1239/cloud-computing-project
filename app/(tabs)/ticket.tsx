import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/header';
import { ListItem } from '@/components/ui/list-item';
import { ScreenScroll } from '@/components/ui/screen';
import { Section } from '@/components/ui/section';
import { TicketBadges } from '@/components/ui/status-badge';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { can } from '@/lib/rbac';
import { MaintenanceTicket, User } from '@/types/models';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, TextInput } from 'react-native';

export default function TicketScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [ticket, setTicket] = React.useState<MaintenanceTicket | null>(null);
  const [assignee, setAssignee] = React.useState<User | null>(null);
  const [note, setNote] = React.useState('');
  const [techs, setTechs] = React.useState<User[]>([]);
  const [showPicker, setShowPicker] = React.useState(false);

  async function refresh() {
    const t = await api.getMaintenanceById(String(id));
    if (t) setTicket(t);
  }

  React.useEffect(() => {
    refresh();
  }, [id]);

  React.useEffect(() => {
    if (can(user, 'maintenance:assign')) {
      api.listUsers().then((all) => {
        setTechs(all.filter((u) => u.role === 'TECHNICIAN'));
      });
    }
  }, [user]);

  const assignToMe = async () => {
    if (!user || !ticket) return;
    try {
      await api.assignMaintenance(ticket.id, user.id);
      await refresh();
    } catch (e: any) {
      Alert.alert('Failed', e?.message ?? String(e));
    }
  };

  const resolve = async () => {
    if (!ticket) return;
    try {
      await api.resolveMaintenance(ticket.id, note);
      router.back();
    } catch (e: any) {
      Alert.alert('Failed', e?.message ?? String(e));
    }
  };

  const assignTo = async (targetUserId: string) => {
    if (!ticket) return;
    try {
      await api.assignMaintenance(ticket.id, targetUserId);
      setShowPicker(false);
      await refresh();
    } catch (e: any) {
      Alert.alert('Failed', e?.message ?? String(e));
    }
  };

  if (!ticket) {
    return (
      <ScreenScroll contentContainerStyle={styles.container}>
        <PageHeader title="Ticket" subtitle="Loading..." icon="wrench.and.screwdriver" />
      </ScreenScroll>
    );
  }

  return (
    <ScreenScroll contentContainerStyle={styles.container}>
      <PageHeader title={`Ticket #${ticket.id}`} subtitle={ticket.description} icon="wrench.and.screwdriver" compact titleLines={1} subtitleLines={2} />

      <Section title="Current status">
        <ThemedView variant="surface" style={styles.list}>
          <ListItem icon="wrench.and.screwdriver" title="Current" subtitle="Status and priority" right={<TicketBadges status={ticket.status} priority={ticket.priority} />} />
        </ThemedView>
      </Section>

      {can(user, 'maintenance:assign') && (
        <Section title="Assignment">
          <ThemedView variant="surface" style={styles.list}>
            <ListItem
              icon="person.2"
              title="Assignee"
              subtitle={
                (() => {
                  const name = techs.find((t) => t.id === ticket.assignedToUserId)?.name;
                  return name || ticket.assignedToUserId || 'Unassigned';
                })()
              }
              right={<Button title="Assign to me" compact onPress={assignToMe} />}
            />
            <ListItem icon="person.2" title="Assign to someone…" subtitle="Pick a technician" onPress={() => setShowPicker((s) => !s)} />
          </ThemedView>
          {showPicker && (
            <ThemedView variant="surface" style={styles.list}>
              {techs.map((t) => (
                <ListItem key={t.id} icon="person.2" title={t.name} subtitle={t.email} right={<Button title="Assign" compact onPress={() => assignTo(t.id)} />} />
              ))}
            </ThemedView>
          )}
        </Section>
      )}

      {can(user, 'maintenance:resolve') && (
        <Section title="Resolution">
          <ThemedView variant="surface" style={styles.inputWrap}>
            <TextInput placeholder="Add a note (optional)" value={note} onChangeText={setNote} style={styles.input} />
          </ThemedView>
          <Button title="Mark as Resolved" onPress={resolve} />
        </Section>
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
