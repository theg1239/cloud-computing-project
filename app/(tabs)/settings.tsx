import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { ListItem } from '@/components/ui/list-item';
import { ScreenScroll } from '@/components/ui/screen';
import { Section } from '@/components/ui/section';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [name, setName] = React.useState(user?.name || '');
  const [department, setDepartment] = React.useState(user?.department || '');
  const [saving, setSaving] = React.useState(false);

  const onSave = async () => {
    try {
      setSaving(true);
      // Try backend; if not available, update local only
      const updated = await apiUpdateMe({ name, department });
      if (updated) {
        Alert.alert('Saved', 'Your profile was updated');
      }
    } catch (e: any) {
      Alert.alert('Update failed', e?.message ?? String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenScroll contentContainerStyle={styles.container}>
      <Section title="Profile">
        <ThemedView variant="surface" style={styles.card}>
          <View style={{ gap: 8 }}>
            <ThemedText type="subtitle">Email</ThemedText>
            <ThemedText>{user?.email}</ThemedText>
          </View>
          <View style={{ gap: 8 }}>
            <ThemedText type="subtitle">Role</ThemedText>
            <ThemedText>{user?.role}</ThemedText>
          </View>
          <View style={{ gap: 8 }}>
            <ThemedText type="subtitle">Name</ThemedText>
            <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Your name" />
          </View>
          <View style={{ gap: 8 }}>
            <ThemedText type="subtitle">Department</ThemedText>
            <TextInput value={department} onChangeText={setDepartment} style={styles.input} placeholder="Department" />
          </View>
          <Button title="Save" onPress={onSave} loading={saving} />
        </ThemedView>
      </Section>

      <Section title="Danger zone">
        <ThemedView variant="surface" style={styles.card}>
          <ListItem
            icon="chevron.right"
            title="Log out"
            onPress={() => {
              logout();
              router.replace('/login');
            }}
          />
        </ThemedView>
      </Section>
    </ScreenScroll>
  );
}

async function apiUpdateMe(input: { name?: string; department?: string }) {
  // Prefer backend REST if available
  try {
    const res = await fetch(`${apiBase()}/api/me`, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error('Failed to update');
    return await res.json();
  } catch (e) {
    return null;
  }
}

function apiBase() {
  // Reuse the hardcoded URL from http.ts to avoid circular import
  return 'https://project.nptelprep.ins';
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  card: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 12,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E5EA',
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.9)'
  }
});
