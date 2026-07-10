/**
 * Shapes exchanged with the FastAPI auth endpoints. Adjust field names here
 * if the backend's actual response shape differs — every auth page and the
 * AuthContext consume these types exclusively, so one edit here propagates
 * everywhere.
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
