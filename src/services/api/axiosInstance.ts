import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { APP_CONFIG, STORAGE_KEYS } from '@/constants';
import type { ApiError } from '@/types';

/**
 * Single axios instance used by every service/hook in the app.
 * Keeping this centralized means base URL, auth headers, timeouts, and
 * error normalization only need to be configured once.
 */
export const api = axios.create({
  baseURL: APP_CONFIG.apiBaseUrl,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the bearer token (if present) to every outgoing request.
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(STORAGE_KEYS.accessToken);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize every error into a predictable `ApiError` shape and handle 401s
// in one place instead of scattering try/catch logic across the app.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
    const status = error.response?.status ?? 0;

    if (status === 401) {
      localStorage.removeItem(STORAGE_KEYS.accessToken);
      localStorage.removeItem(STORAGE_KEYS.refreshToken);
      // Route-level ProtectedRoute will redirect to /login on next render.
    }

    const normalized: ApiError = {
      status,
      message: error.response?.data?.message ?? error.message ?? 'Unexpected network error',
      details: error.response?.data?.errors,
    };

    return Promise.reject(normalized);
  },
);
