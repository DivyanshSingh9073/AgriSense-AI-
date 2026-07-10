import { api } from './api/axiosInstance';
import { API_ENDPOINTS } from './api/endpoints';
import { STORAGE_KEYS } from '@/constants';
import type {
  ApiResponse,
  AuthResponse,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  User,
  VerifyEmailPayload,
} from '@/types';

function persistSession(auth: AuthResponse): void {
  localStorage.setItem(STORAGE_KEYS.accessToken, auth.tokens.accessToken);
  localStorage.setItem(STORAGE_KEYS.refreshToken, auth.tokens.refreshToken);
}

function clearSession(): void {
  localStorage.removeItem(STORAGE_KEYS.accessToken);
  localStorage.removeItem(STORAGE_KEYS.refreshToken);
}

/**
 * Thin wrapper around the FastAPI auth endpoints. Every method returns the
 * unwrapped `data` payload — callers (AuthContext, auth pages) never touch
 * the raw axios response or the `ApiResponse<T>` envelope directly.
 */
export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.auth.login, payload);
    persistSession(data.data);
    return data.data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await api.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.auth.register, payload);
    persistSession(data.data);
    return data.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post(API_ENDPOINTS.auth.logout);
    } finally {
      // Always clear local session state, even if the network call fails —
      // the user expects to be logged out locally regardless.
      clearSession();
    }
  },

  async getCurrentUser(): Promise<User> {
    const { data } = await api.get<ApiResponse<User>>(API_ENDPOINTS.auth.me);
    return data.data;
  },

  async forgotPassword(payload: ForgotPasswordPayload): Promise<void> {
    await api.post(API_ENDPOINTS.auth.forgotPassword, payload);
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    await api.post(API_ENDPOINTS.auth.resetPassword, payload);
  },

  async verifyEmail(payload: VerifyEmailPayload): Promise<void> {
    await api.post(API_ENDPOINTS.auth.verifyEmail, payload);
  },

  async resendVerification(): Promise<void> {
    await api.post(API_ENDPOINTS.auth.resendVerification);
  },
};
