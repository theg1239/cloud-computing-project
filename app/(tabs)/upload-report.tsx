import { ThemedText } from '@/components/themed-text';
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
import * as DocumentPicker from 'expo-document-picker';
import React from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';

export default function UploadReportScreen() {
  const { user } = useAuth();
  const scheme = useColorScheme() ?? 'light';
  const [experiments, setExperiments] = React.useState<Experiment[]>([]);
  const [selected, setSelected] = React.useState<string | null>(null);
  const [title, setTitle] = React.useState('Lab Report');
  const [docType, setDocType] = React.useState<DocumentType>('REPORT');
  const [selectedFile, setSelectedFile] = React.useState<{ uri: string; name: string } | null>(null);

  React.useEffect(() => {
    // Prefer backend REST when available
    api.listExperiments().then(setExperiments);
  }, []);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile({ uri: file.uri, name: file.name });
        if (!title || title === 'Lab Report') {
          setTitle(file.name.replace('.pdf', ''));
        }
      }
    } catch (err: any) {
      Alert.alert('Error', 'Failed to pick document: ' + err?.message);
    }
  };

  const submit = async () => {
    if (!user || !selected || !title.trim() || !selectedFile) {
      Alert.alert('Missing info', 'Please select an experiment and a PDF file');
      return;
    }
    try {
      await api.uploadPDF(selected, {
        type: docType,
        title: title.trim(),
        fileUri: selectedFile.uri,
        fileName: selectedFile.name,
      });
      Alert.alert('Uploaded', 'Your document has been uploaded to cloud storage');
      setTitle('Lab Report');
      setSelectedFile(null);
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
          <Section title="Document Type" right={
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button title="Report" variant={docType === 'REPORT' ? 'primary' : 'secondary'} compact onPress={() => setDocType('REPORT')} />
              <Button title="Result" variant={docType === 'RESULT' ? 'primary' : 'secondary'} compact onPress={() => setDocType('RESULT')} />
              <Button title="SOP" variant={docType === 'SOP' ? 'primary' : 'secondary'} compact onPress={() => setDocType('SOP')} />
            </View>
          }>
            <ThemedView variant="surface" style={styles.inputWrap}>
              <TextInput
                placeholder="Document Title"
                value={title}
                onChangeText={setTitle}
                style={[styles.input, scheme === 'dark' ? styles.inputTitleDark : undefined]}
                placeholderTextColor={scheme === 'dark' ? '#FFFFFF99' : undefined}
              />
            </ThemedView>
          </Section>

          <Section title="PDF File">
            {selectedFile ? (
              <ThemedView variant="surface" style={styles.fileSelected}>
                <ThemedText>📄 {selectedFile.name}</ThemedText>
                <Button title="Change" variant="secondary" compact onPress={pickDocument} />
              </ThemedView>
            ) : (
              <Button title="📁 Pick PDF File" variant="secondary" onPress={pickDocument} />
            )}
          </Section>

          <Button 
            title="Upload to Cloud" 
            onPress={submit} 
            disabled={!selectedFile}
          />
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
  fileSelected: { 
    borderRadius: 12, 
    borderWidth: StyleSheet.hairlineWidth, 
    padding: 16, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
});
