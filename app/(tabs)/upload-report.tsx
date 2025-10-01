import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/header';
import { ListItem } from '@/components/ui/list-item';
import { ScreenScroll } from '@/components/ui/screen';
import { Section } from '@/components/ui/section';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { DocumentType, Experiment } from '@/types/models';
import React from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';

export default function UploadReportScreen() {
  const { user } = useAuth();
  const scheme = useColorScheme() ?? 'light';
  const [experiments, setExperiments] = React.useState<Experiment[]>([]);
  const [selected, setSelected] = React.useState<string | null>(null);
  const [title, setTitle] = React.useState('Lab Report');
  const [url, setUrl] = React.useState('');
  const [docType, setDocType] = React.useState<DocumentType>('REPORT');

  React.useEffect(() => {
    // Prefer backend REST when available
    api.listExperiments().then(setExperiments);
  }, []);

  const submit = async () => {
    if (!user || !selected || !title.trim()) return;
    try {
      await api.uploadExperimentDocument(selected, {
        type: docType,
        title: title.trim(),
        url: url.trim() || undefined,
        uploadedByUserId: user.id,
      });
      Alert.alert('Uploaded', 'Your document has been uploaded');
      setTitle('Lab Report');
      setUrl('');
    } catch (err: any) {
      Alert.alert('Failed', err?.message ?? String(err));
    }
  };

  return (
    <ScreenScroll contentContainerStyle={styles.container}>
      <PageHeader title="Upload Report" subtitle="Attach a document to an experiment" icon="doc.text" />

      <Section title="Choose Experiment">
        <ThemedView variant="surface" style={styles.list}>
          {experiments.map((ex) => (
            <ListItem
              key={ex.id}
              icon="doc.text"
              title={ex.title}
              subtitle={`${ex.documents.length} files`}
              selected={selected === ex.id}
              onPress={() => setSelected(ex.id)}
            />
          ))}
        </ThemedView>
      </Section>
      {selected && (
        <>
          <Section title="Details" right={
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button title="Report" variant={docType === 'REPORT' ? 'primary' : 'secondary'} compact onPress={() => setDocType('REPORT')} />
              <Button title="Result" variant={docType === 'RESULT' ? 'primary' : 'secondary'} compact onPress={() => setDocType('RESULT')} />
              <Button title="SOP" variant={docType === 'SOP' ? 'primary' : 'secondary'} compact onPress={() => setDocType('SOP')} />
            </View>
          }>
            <ThemedView variant="surface" style={styles.inputWrap}>
              <TextInput
                placeholder="Title"
                value={title}
                onChangeText={setTitle}
                style={[styles.input, scheme === 'dark' ? styles.inputTitleDark : undefined]}
                placeholderTextColor={scheme === 'dark' ? '#FFFFFF99' : undefined}
              />
              <TextInput placeholder="Link (optional)" value={url} onChangeText={setUrl} style={styles.input} />
            </ThemedView>
          </Section>

          <Button title="Upload" onPress={submit} />
        </>
      )}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  list: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  inputWrap: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  input: { padding: 12 },
  inputTitleDark: { color: '#FFFFFF' },
});
