import axios from 'axios';
import * as SecureStore from 'expo-secure-store'; 

export const api = axios.create({
  baseURL: 'https://dev.professorpcthomas.com/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('authToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('No authentication token found for request to:', config.url);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
