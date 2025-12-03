import axios from 'axios';
import { getStoredJWT, isJWTExpired, clearJWT } from '@/utils/jwt';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Loading state management
let loadingCallbacks: {
  start: (text?: string) => void;
  stop: () => void;
} | null = null;

export const setLoadingCallbacks = (callbacks: {
  start: (text?: string) => void;
  stop: () => void;
}) => {
  loadingCallbacks = callbacks;
};

// JWT expiration callback
let onJWTExpired: (() => void) | null = null;

export const setJWTExpiredCallback = (callback: () => void) => {
  onJWTExpired = callback;
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Start loading for non-background requests
    if (!config.headers['x-no-loading']) {
      loadingCallbacks?.start();
    }
    
    // Add JWT to Authorization header if available and valid
    const token = getStoredJWT();
    if (token) {
      if (!isJWTExpired(token)) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // Token expired, clear it and trigger callback
        clearJWT();
        onJWTExpired?.();
      }
    }
    
    return config;
  },
  (error) => {
    loadingCallbacks?.stop();
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Stop loading
    if (!response.config.headers['x-no-loading']) {
      loadingCallbacks?.stop();
    }
    return response;
  },
  (error) => {
    // Stop loading on error
    loadingCallbacks?.stop();
    
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - could redirect to login
      console.error('Unauthorized request');
    }
    return Promise.reject(error);
  }
);

export default api;
