import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { ROUTES, STORAGE_KEYS } from '@/constants';

/**
 * Guards authenticated routes. This is a minimal placeholder for the setup
 * phase — it checks for a stored access token only. When the real auth
 * flow is built, replace the check with an AuthContext-driven `isAuthenticated`
 * (with a loading state) instead of reading localStorage directly.
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const hasToken = Boolean(localStorage.getItem(STORAGE_KEYS.accessToken));

  if (!hasToken) {
    return <Navigate to={ROUTES.auth.login} replace />;
  }

  return <>{children}</>;
}
