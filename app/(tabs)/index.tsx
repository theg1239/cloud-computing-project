import { ThemedView } from '@/components/themed-view';
import { PageHeader } from '@/components/ui/header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ListItem } from '@/components/ui/list-item';
import { ScreenScroll } from '@/components/ui/screen';
import { Section } from '@/components/ui/section';
import { useAuth } from '@/lib/auth';
import { can } from '@/lib/rbac';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <ScreenScroll contentContainerStyle={styles.container}>
        <PageHeader
          title={user ? `Hi, ${user.name.split(' ')[0]}` : 'Welcome'}
          subtitle="What would you like to do?"
          icon="sparkles"
          right={
            <Pressable onPress={() => router.push('/(tabs)/notifications')} style={{ padding: 6 }}>
              <IconSymbol name="bell" color={'#888'} size={22} />
            </Pressable>
          }
        />

      <Section title="Actions">
        <ThemedView variant="surface" style={styles.list}>
          {can(user, 'lab:book') && (
            <ListItem icon="calendar" title="Find a lab slot" subtitle="Book lab time" onPress={() => router.push('/(tabs)/book')} />
          )}
          {can(user, 'booking:view') && (
            <ListItem icon="clock" title="My bookings" subtitle="View and manage" onPress={() => router.push('/(tabs)/bookings')} />
          )}
          {can(user, 'maintenance:report') && (
            <ListItem icon="wrench.and.screwdriver" title="Report an issue" subtitle="Create maintenance ticket" onPress={() => router.push('/(tabs)/report-issue')} />
          )}
          {can(user, 'maintenance:view') && (
            <ListItem icon="list.bullet.rectangle" title="Maintenance queue" subtitle="See open tickets" onPress={() => router.push('/(tabs)/maintenance')} />
          )}
          {can(user, 'equipment:view') && (
            <ListItem icon="cube.box" title="Browse equipment" subtitle="Availability and status" onPress={() => router.push('/(tabs)/equipment')} />
          )}
          {can(user, 'experiment:upload') && (
            <ListItem icon="doc.text" title="Upload report" subtitle="Attach to an experiment" onPress={() => router.push('/(tabs)/upload-report')} />
          )}
          {can(user, 'equipment:request') && (
            <ListItem icon="plus.circle" title="Request equipment" subtitle="Ask admin to add gear" onPress={() => router.push('/(tabs)/request-equipment')} />
          )}
          {can(user, 'users:manage') && (
            <ListItem icon="person.2" title="Manage users" subtitle="Roles and access" onPress={() => router.push('/(tabs)/users')} />
          )}
          {!can(user, 'lab:book') &&
            !can(user, 'booking:view') &&
            !can(user, 'maintenance:report') &&
            !can(user, 'maintenance:view') &&
            !can(user, 'equipment:view') &&
            !can(user, 'users:manage') && (
              <ListItem icon="magnifyingglass" title="Browse" subtitle="Explore labs and equipment" onPress={() => router.push('/(tabs)/explore')} />
            )}
        </ThemedView>
      </Section>
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
