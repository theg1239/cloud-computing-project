import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { HStack, VStack } from '@/components/ui/stack';
import { useAuth } from '@/lib/auth';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, TextInput } from 'react-native';

export default function OnboardingScreen() {
  const { register, loading } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();

  const [email, setEmail] = React.useState(params.email || '');
  const [name, setName] = React.useState('');
  const [department, setDepartment] = React.useState('');
  const [roleName, setRoleName] = React.useState<'ADMIN' | 'FACULTY' | 'STUDENT' | 'TECHNICIAN'>('STUDENT');

  const onSubmit = async () => {
    try {
      await register({ email: email.trim(), name: name.trim() || email.split('@')[0], roleName, department: department || undefined });
      router.replace('/');
    } catch (e: any) {
      Alert.alert('Registration failed', e?.message ?? String(e));
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ThemedView style={styles.container}>
        <VStack gap={20}>
          <VStack gap={6}>
            <ThemedText type="title">Set up your profile</ThemedText>
            <ThemedText>Just a few details to personalize your experience</ThemedText>
          </VStack>
          <VStack gap={12}>
            <TextInput placeholder="Email" autoCapitalize="none" keyboardType="email-address" style={styles.input} value={email} onChangeText={setEmail} />
            <TextInput placeholder="Full name" autoCapitalize="words" style={styles.input} value={name} onChangeText={setName} />
            <TextInput placeholder="Department (optional)" style={styles.input} value={department} onChangeText={setDepartment} />
          </VStack>
          <VStack gap={8}>
            <ThemedText type="subtitle">Role</ThemedText>
            <HStack gap={8}>
              {(['STUDENT','FACULTY','TECHNICIAN','ADMIN'] as const).map(r => (
                <Button key={r} title={r} variant={roleName === r ? 'primary' : 'secondary'} compact onPress={() => setRoleName(r)} />
              ))}
            </HStack>
          </VStack>
          <Button title="Create account" onPress={onSubmit} loading={loading} />
        </VStack>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E5EA',
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.9)'
  }
});
