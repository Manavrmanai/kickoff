import axios from 'axios';

// API Configuration
// Force using the Vite proxy in development to avoid CORS, regardless of env override
function resolveBaseUrl() {
  try {
    const isDev = import.meta.env.DEV;
    const win = typeof window !== 'undefined' ? window : undefined;
    if (isDev && win && win.location && win.location.port === '8080') {
      return '/api';
    }
  } catch (_) {}
  return import.meta.env.VITE_API_BASE_URL || '/api';
}

const API_BASE_URL = resolveBaseUrl();

console.log('🔧 API Base URL:', API_BASE_URL);

// Create HTTP client
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, config.params);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.url}`, response.data);
    return response.data;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    return Promise.reject(error.response?.data || error);
  }
);

// API Response wrapper interface
export interface ApiResponse<T> {
  response: T;
}

export interface ApiError {
  error: string;
  details?: string;
}
