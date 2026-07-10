import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { APP_CONFIG, STORAGE_KEYS } from '@/constants';
import type { ApiError, AuthTokens } from '@/types';
import { API_ENDPOINTS } from './endpoints';

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

/**
 * A bare axios instance (no interceptors) used only for the refresh-token
 * call itself — hitting it through `api` would recurse into the 401 handler
 * below the moment the refresh call fails.
 */
const refreshClient = axios.create({
  baseURL: APP_CONFIG.apiBaseUrl,
  timeout: 15_000,
});

// Attach the bearer token (if present) to every outgoing request.
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(STORAGE_KEYS.accessToken);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function getStoredRefreshToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.refreshToken);
}

function storeTokens(tokens: AuthTokens): void {
  localStorage.setItem(STORAGE_KEYS.accessToken, tokens.accessToken);
  localStorage.setItem(STORAGE_KEYS.refreshToken, tokens.refreshToken);
}

function clearTokens(): void {
  localStorage.removeItem(STORAGE_KEYS.accessToken);
  localStorage.removeItem(STORAGE_KEYS.refreshToken);
}

/**
 * Broadcast a logout so AuthContext (which owns user/session state) can
 * react without axiosInstance importing React context code — keeps the
 * transport layer decoupled from application state.
 */
function broadcastLogout(): void {
  window.dispatchEvent(new CustomEvent('agrisense:auth-logout'));
}

// Concurrent 401s while a refresh is already in flight all wait on this
// single promise instead of each firing their own refresh request.
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = getStoredRefreshToken();
      if (!refreshToken) throw new Error('No refresh token available');

      const { data } = await refreshClient.post<{ data: AuthTokens }>(API_ENDPOINTS.auth.refresh, {
        refreshToken,
      });
      storeTokens(data.data);
      return data.data.accessToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

// Normalize every error into a predictable `ApiError` shape. On a 401 from
// any request other than the refresh call itself, attempt exactly one
// silent token refresh and replay the original request before giving up.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
    const status = error.response?.status ?? 0;
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;

    if (status === 401 && originalRequest && !originalRequest._retried && getStoredRefreshToken()) {
      originalRequest._retried = true;
      try {
        const newAccessToken = await refreshAccessToken();
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch {
        clearTokens();
        broadcastLogout();
      }
    } else if (status === 401) {
      clearTokens();
      broadcastLogout();
    }

    const normalized: ApiError = {
      status,
      message: error.response?.data?.message ?? error.message ?? 'Unexpected network error',
      details: error.response?.data?.errors,
    };

    return Promise.reject(normalized);
  },
);
