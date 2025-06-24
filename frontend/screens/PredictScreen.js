import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Appbar,
  Snackbar,
  ActivityIndicator,
  IconButton,
  RadioButton
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import * as Speech from 'expo-speech';
import Voice from '@react-native-voice/voice'; // ✅ STT için
import api, { predictText, simplifyText } from '../services/apiService';

function PredictScreen({ navigation }) {
  const { signOut } = useAuth();
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const [method, setMethod] = useState('mt5');

  // ✅ STT State
  const [isRecording, setIsRecording] = useState(false);

  const showError = (message) => {
    setError(message);
    setSnackbarVisible(true);
  };

  const handleSpeak = () => {
    if (text.trim()) {
      Speech.speak(text, {
        language: 'tr-TR',
        pitch: 1.0,
        rate: 1.0
      });
    }
  };

  // ✅ STT Event Handlers
  useEffect(() => {
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = (e) => {
      console.error('STT Error:', e);
      setIsRecording(false);
    };
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechResults = (e) => {
    if (e.value && e.value.length > 0) {
      setText(e.value[0]); // ilk sonucu kullan
    }
  };

  const startRecording = async () => {
    try {
      await Voice.start('tr-TR');
      setIsRecording(true);
    } catch (e) {
      console.error('Start STT Error:', e);
    }
  };

  const stopRecording = async () => {
    try {
      await Voice.stop();
      setIsRecording(false);
    } catch (e) {
      console.error('Stop STT Error:', e);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const analyzeText = async () => {
    if (!text.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await predictText(text);

      if (result.label === 'Difficult') {
        try {
          const simplifiedResult = await simplifyText(text, method);
          if (simplifiedResult?.simplified) {
            result.simplified = simplifiedResult.simplified;
          }
        } catch (simplifyError) {
          console.error('Simplification error:', simplifyError);
        }
      }

      await api.post('/history/save', {
        text,
        score: result.score,
        label: result.label,
        simplified: result.simplified || null,
      });

      navigation.navigate('PredictionResult', { prediction: result });

    } catch (error) {
      console.error('API Error:', error);
      if (error.response?.status === 401) {
        signOut();
        showError('Session expired. Please log in again.');
      } else {
        showError(error.response?.data?.detail || 'Failed to analyze text. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="DyslexiaApp" />
        <Appbar.Action icon="logout" onPress={signOut} />
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text variant="headlineSmall" style={styles.title}>Metin Analizi</Text>
        <TextInput
          label="Analiz için metin girin..."
          value={text}
          onChangeText={setText}
          mode="outlined"
          multiline
          numberOfLines={6}
          style={[styles.input, styles.textArea]}
          disabled={isLoading}
          textColor="#000000"
          placeholderTextColor="#000000"
          theme={{ colors: { primary: '#3F51B5', text: '#000000', placeholder: '#000000' } }}
        />

        <Text style={styles.subTitle}>Model Seç:</Text>
        <RadioButton.Group onValueChange={setMethod} value={method}>
          <RadioButton.Item label="MT5 Modeli (Yerel)" value="mt5" />
          <RadioButton.Item label="OpenAI Modeli (Bulut)" value="openai" />
        </RadioButton.Group>

        <View style={styles.voiceButtons}>
          <IconButton icon="volume-high" onPress={handleSpeak} size={26} />
          <IconButton
            icon={isRecording ? "microphone-off" : "microphone"}
            onPress={toggleRecording}
            size={26}
          />
        </View>

        <Button
          mode="contained"
          onPress={analyzeText}
          disabled={!text.trim() || isLoading}
          style={styles.button}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#fff" size={20} style={styles.loadingIcon} />
              <Text style={styles.loadingText}>Analiz Ediliyor...</Text>
            </View>
          ) : 'Analiz Et'}
        </Button>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'Kapat',
          onPress: () => setSnackbarVisible(false),
        }}
        style={styles.snackbar}
      >
        {error}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 36
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: 'bold',
    fontSize: 26,
    color: '#000000'
  },
  subTitle: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000'
  },
  input: {
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: '#000000',
    fontSize: 16,
    fontWeight: '500',
    color: '#000000'
  },
  textArea: {
    minHeight: 160,
    textAlignVertical: 'top'
  },
  button: {
    marginTop: 16,
    marginBottom: 28,
    backgroundColor: '#3F00FF',
    borderRadius: 10,
    paddingVertical: 12
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16
  },
  loadingIcon: {
    marginRight: 10
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold'
  },
  snackbar: {
    marginBottom: 20,
    backgroundColor: '#D32F2F'
  },
  voiceButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8
  },
  radioGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: '#000000',
    fontSize: 16,
    fontWeight: '500',
    color: '#000000'
  }
});

export default PredictScreen;
