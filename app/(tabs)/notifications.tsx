import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/header';
import { ListItem } from '@/components/ui/list-item';
import { ScreenScroll } from '@/components/ui/screen';
import { Section } from '@/components/ui/section';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useNotifications } from '@/lib/notifications';
import { can } from '@/lib/rbac';
import { Notification } from '@/types/models';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, RefreshControl, StyleSheet, View } from 'react-native';

export default function NotificationsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { notifications: items, refresh, markAsRead, loading: contextLoading } = useNotifications();
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const canApprove = !!user && can(user, 'booking:approve');

  // Refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const markRead = async (id: string) => {
    try {
      await markAsRead(id);
    } catch (e: any) {
      Alert.alert('Failed', e?.message ?? String(e));
    }
  };

  const handleApprove = async (notif: Notification) => {
    if (!notif.relatedId) return;
    setActionLoading(notif.id);
    try {
      await api.approveBooking(notif.relatedId);
      Alert.alert('Approved', 'Booking has been approved');
      await markRead(notif.id);
      await refresh();
    } catch (e: any) {
      Alert.alert('Failed', e?.message ?? String(e));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (notif: Notification) => {
    if (!notif.relatedId) return;
    setActionLoading(notif.id);
    try {
      await api.rejectBooking(notif.relatedId);
      Alert.alert('Rejected', 'Booking has been rejected');
      await markRead(notif.id);
      await refresh();
    } catch (e: any) {
      Alert.alert('Failed', e?.message ?? String(e));
    } finally {
      setActionLoading(null);
    }
  };

  const renderActions = (n: Notification) => {
    const isBookingRequest = n.type === 'BOOKING_REQUEST';
    if (!isBookingRequest || !canApprove || n.read) return null;
    
    return (
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
        <Button 
          title="Approve" 
          variant="primary" 
          compact 
          loading={actionLoading === n.id}
          onPress={() => handleApprove(n)} 
        />
        <Button 
          title="Reject" 
          variant="secondary" 
          compact 
          loading={actionLoading === n.id}
          onPress={() => handleReject(n)} 
        />
      </View>
    );
  };

  const unread = items.filter(n => !n.read);
  const read = items.filter(n => n.read);

  return (
    <ScreenScroll 
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <PageHeader 
        title="Notifications" 
        subtitle={`${unread.length} unread • Auto-updates every 10s`} 
        icon="bell" 
      />
      
      {unread.length > 0 && (
        <Section title="Unread">
          <ThemedView variant="surface" style={styles.list}>
            {unread.map((n) => (
              <View key={n.id}>
                <ListItem
                  icon={n.type.includes('BOOKING') ? 'calendar' : 'bell'}
                  title={n.message}
                  subtitle={new Date(n.createdAt).toLocaleString()}
                  right={
                    <Button 
                      title="Mark read" 
                      variant="ghost" 
                      compact 
                      onPress={() => markRead(n.id)} 
                    />
                  }
                  onPress={() => {}}
                />
                {renderActions(n)}
              </View>
            ))}
          </ThemedView>
        </Section>
      )}

      {read.length > 0 && (
        <Section title="Read">
          <ThemedView variant="surface" style={styles.list}>
            {read.slice(0, 10).map((n) => (
              <ListItem
                key={n.id}
                icon={n.type.includes('BOOKING') ? 'calendar' : 'bell'}
                title={n.message}
                subtitle={new Date(n.createdAt).toLocaleString()}
                onPress={() => {}}
              />
            ))}
          </ThemedView>
        </Section>
      )}

      {items.length === 0 && (
        <ThemedView variant="surface" style={styles.empty}>
          <ThemedText type="subtitle">No notifications</ThemedText>
        </ThemedView>
      )}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  list: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  empty: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, padding: 32, alignItems: 'center' },
});