// ✅ services/apiService.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './config';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Add JWT token to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If 401, remove token from storage
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('userToken');
    }
    return Promise.reject(error);
  }
);

export const predictText = async (text) => {
  const response = await api.post('/predict/', { text });
  return response.data;
};

export const simplifyText = async (text, method = "mt5") => {
  const response = await api.post(`/simplify/?method=${method}`, { text });
  return response.data;
};

export const fetchHistory = async () => {
  const response = await api.get('/history/');
  return response.data;
};

export const clearHistory = async () => {
  const response = await api.delete('/history/clear');
  return response.data;
};

export const fetchStatistics = async () => {
  const response = await api.get('/statistics/');
  return response.data;
};

export default api;
