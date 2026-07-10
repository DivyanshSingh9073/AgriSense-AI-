import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authService } from '@/services/auth.service';
import { STORAGE_KEYS } from '@/constants';
import type {
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  User,
  VerifyEmailPayload,
} from '@/types';

interface AuthContextValue {
  user: User | null;
  /** True while the initial "am I logged in?" check runs on app load. */
  isInitializing: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (payload: ForgotPasswordPayload) => Promise<void>;
  resetPassword: (payload: ResetPasswordPayload) => Promise<void>;
  verifyEmail: (payload: VerifyEmailPayload) => Promise<void>;
  resendVerification: () => Promise<void>;
  /** Re-fetches the current user, e.g. after profile edits or email verification. */
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Owns the app's session state. There is deliberately no separate
 * "UserContext" — user data has exactly one owner (the authenticated
 * session), so splitting it into a second context would just mean keeping
 * two sources of truth in sync for no benefit.
 *
 * On mount, if an access token is present, it fetches `/auth/me` to hydrate
 * `user` — this is what lets a page refresh preserve the session. It also
 * listens for the `agrisense:auth-logout` event dispatched by the axios
 * interceptor (see `services/api/axiosInstance.ts`) so an expired refresh
 * token logs the user out everywhere, not just on the next failed request.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const clearSession = useCallback(() => {
    setUser(null);
  }, []);

  useEffect(() => {
    async function hydrate() {
      const hasToken = Boolean(localStorage.getItem(STORAGE_KEYS.accessToken));
      if (!hasToken) {
        setIsInitializing(false);
        return;
      }
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch {
        clearSession();
      } finally {
        setIsInitializing(false);
      }
    }
    hydrate();
  }, [clearSession]);

  useEffect(() => {
    const handleForcedLogout = () => clearSession();
    window.addEventListener('agrisense:auth-logout', handleForcedLogout);
    return () => window.removeEventListener('agrisense:auth-logout', handleForcedLogout);
  }, [clearSession]);

  const login = useCallback(async (payload: LoginPayload) => {
    const { user: loggedInUser } = await authService.login(payload);
    setUser(loggedInUser);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const { user: newUser } = await authService.register(payload);
    setUser(newUser);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    clearSession();
  }, [clearSession]);

  const forgotPassword = useCallback(async (payload: ForgotPasswordPayload) => {
    await authService.forgotPassword(payload);
  }, []);

  const resetPassword = useCallback(async (payload: ResetPasswordPayload) => {
    await authService.resetPassword(payload);
  }, []);

  const verifyEmail = useCallback(async (payload: VerifyEmailPayload) => {
    await authService.verifyEmail(payload);
  }, []);

  const resendVerification = useCallback(async () => {
    await authService.resendVerification();
  }, []);

  const refreshUser = useCallback(async () => {
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isInitializing,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      forgotPassword,
      resetPassword,
      verifyEmail,
      resendVerification,
      refreshUser,
    }),
    [
      user,
      isInitializing,
      login,
      register,
      logout,
      forgotPassword,
      resetPassword,
      verifyEmail,
      resendVerification,
      refreshUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
