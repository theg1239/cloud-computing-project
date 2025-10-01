import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { HStack, VStack } from '@/components/ui/stack';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, TextInput } from 'react-native';

export default function LoginScreen() {
  const { login, quickPick, loading } = useAuth();
  const [email, setEmail] = React.useState('');
  const router = useRouter();

  const onSubmit = async () => {
    try {
      await login(email.trim());
      router.replace('/');
    } catch (e: any) {
      if (e?.code === 'USER_NOT_FOUND' || (typeof e?.message === 'string' && e.message.includes('USER_NOT_FOUND'))) {
  router.push({ pathname: '/onboarding' as any, params: { email: email.trim() } } as any);
        return;
      }
      Alert.alert('Login failed', e?.message ?? String(e));
    }
  };

  const qp = async (id: string) => {
    try {
      await quickPick(id);
      router.replace('/');
    } catch (e: any) {
      Alert.alert('Quick login failed', e?.message ?? String(e));
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ThemedView style={styles.container}>
        <VStack gap={20}>
          <VStack gap={6}>
            <ThemedText type="title">Welcome back</ThemedText>
            <ThemedText>Sign in with your institutional email</ThemedText>
          </VStack>
          <VStack gap={12}>
            <TextInput
              placeholder="name@vit.ac.in"
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              onSubmitEditing={onSubmit}
              returnKeyType="go"
            />
            <Button title="Continue" onPress={onSubmit} loading={loading} />
          </VStack>
          <VStack gap={8}>
            <ThemedText type="subtitle">Quick pick (dev)</ThemedText>
            <HStack gap={10}>
              <Button title="Admin" variant="secondary" compact onPress={() => qp('u-admin-1')} />
              <Button title="Faculty" variant="secondary" compact onPress={() => qp('u-fac-1')} />
              <Button title="Student" variant="secondary" compact onPress={() => qp('u-stu-1')} />
              <Button title="Technician" variant="secondary" compact onPress={() => qp('u-tech-1')} />
            </HStack>
          </VStack>
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
    padding: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
});
