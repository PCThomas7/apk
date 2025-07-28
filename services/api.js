import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import Constants from "expo-constants";


export const api = axios.create({
  baseURL: Constants.expoConfig.extra.BASEURL,
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

// Response Interceptor: handle errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Log detailed error info
    console.error('API Error:', {
      status: error.response?.status,
      url: originalRequest?.url,
      method: originalRequest?.method,
      data: error.response?.data,
      headers: originalRequest?.headers,
    });

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Authorization error:', error.response.data);
      Alert.alert('Access Denied', 'You do not have permission to access this resource');
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');

        if (!refreshToken) {
          console.error('No refresh token available');
          await SecureStore.deleteItemAsync('authToken');
          await SecureStore.deleteItemAsync('userDetails');

          Alert.alert('Session Expired', 'Please log in again.');
          router.replace('/Auth');
          return Promise.reject(new Error('No refresh token available'));
        }

        console.log('Attempting to refresh token...');
        const refreshResponse = await axios.post(
          'https://dev.professorpcthomas.com/api/auth/refresh',
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const { token } = refreshResponse.data;
        console.log('Token refreshed successfully');
        await SecureStore.setItemAsync('authToken', token);

        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest); // Retry original request
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        await SecureStore.deleteItemAsync('authToken');
        await SecureStore.deleteItemAsync('refreshToken');
        await SecureStore.deleteItemAsync('userDetails');

        Alert.alert('Session Expired', 'Please log in again.');
         router.replace('/Auth');

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);