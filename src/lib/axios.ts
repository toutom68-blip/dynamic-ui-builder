import axios from 'axios';

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

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Start loading for non-background requests
    if (!config.headers['x-no-loading']) {
      loadingCallbacks?.start();
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
