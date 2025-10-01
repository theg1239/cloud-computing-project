import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/header';
import { ScreenScroll } from '@/components/ui/screen';
import { Section } from '@/components/ui/section';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import React from 'react';
import { Alert, StyleSheet, TextInput } from 'react-native';

export default function RequestEquipmentScreen() {
  const { user } = useAuth();
  const [name, setName] = React.useState('');
  const [type, setType] = React.useState('');
  const [reason, setReason] = React.useState('');

  const submit = async () => {
    if (!user) return;
    try {
      await api.createEquipmentRequest({ name, type, reason, requestedByUserId: user.id });
      Alert.alert('Submitted', 'Your equipment request has been submitted');
      setName('');
      setType('');
      setReason('');
    } catch (e: any) {
      Alert.alert('Failed', e?.message ?? String(e));
    }
  };

  return (
    <ScreenScroll contentContainerStyle={styles.container}>
      <PageHeader title="Request Equipment" subtitle="Ask admin to add new gear" icon="plus.circle" />
      <Section title="Details">
        <ThemedView variant="surface" style={styles.inputWrap}>
          <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
          <TextInput placeholder="Type" value={type} onChangeText={setType} style={styles.input} />
          <TextInput placeholder="Reason (optional)" value={reason} onChangeText={setReason} style={styles.input} />
        </ThemedView>
      </Section>
      <Button title="Submit" onPress={submit} />
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  inputWrap: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  input: { padding: 12 },
});
