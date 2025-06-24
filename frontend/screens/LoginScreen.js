import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { TextInput, Button, Text, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import image from '../assets/login.png';
import { API_URL } from '../services/config';
const BASE_URL = API_URL;

function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn, isLoading } = useAuth();

  const handleLogin = async () => {
    try {
      setError('');
      if (!email || !password) {
        setError('Lütfen e-posta ve şifre giriniz.');
        return;
      }

      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const response = await axios.post(`${BASE_URL}/auth/token`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const token = response.data.access_token;
      if (!token) {
        setError('Giriş başarısız: Token alınamadı.');
        return;
      }

      await signIn(token);
    } catch (error) {
      console.error('Login error:', error);
      setError('Giriş başarısız. Bilgilerinizi kontrol edin.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Surface style={styles.surface} elevation={3}>
        {/* LOGO */}
        <Image source={require('../assets/login.png')} style={styles.logo} />

        <Text variant="headlineMedium" style={styles.title}>Disleksi Uygulaması</Text>

        <TextInput
          label="E-posta"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          textColor="#000000"
          placeholderTextColor="#000000"
          theme={{ colors: { primary: '#3F51B5', text: '#000000', placeholder: '#000000' } }}
          />
        <TextInput
          label="Şifre"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          mode="outlined"
          style={styles.input}
          textColor="#000000"
          placeholderTextColor="#000000"
          theme={{ colors: { primary: '#3F51B5', text: '#000000', placeholder: '#000000' } }}
          />
        <Button mode="contained" onPress={handleLogin} style={styles.button}>
          {isLoading ? <ActivityIndicator color="#000000" /> : 'Giriş Yap'}
        </Button>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </Surface>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#ECEFF1'
  },
  surface: {
    backgroundColor: '#FFFFFF',
    padding: 28,
    borderRadius: 14,
    elevation: 6
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 16,
    resizeMode: 'contain'
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: 'bold',
    fontSize: 24,
    color: '#000000'
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#F1F1F1',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#3F51B5',
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#000000'
  },
  button: {
    marginTop: 12,
    backgroundColor: '#3F00FF',
    borderRadius: 10,
    paddingVertical: 14
  },
  error: {
    color: '#D50000',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
    fontWeight: '500'
  }
});

export default LoginScreen;
