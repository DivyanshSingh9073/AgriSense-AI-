/**
 * Frontend auth request and response shapes. Confirm these against the
 * configured backend before relying on an integration.
 */
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  isEmailVerified: boolean;
  role: 'farmer' | 'admin';
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

export interface VerifyEmailPayload {
  token: string;
}

/** Response shape for login/register/refresh — a user plus a fresh token pair. */
export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}
