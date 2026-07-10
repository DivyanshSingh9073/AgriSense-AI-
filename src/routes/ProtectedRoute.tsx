import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { useAuth } from '@/hooks';
import { Spinner } from '@/components/ui';

/**
 * Guards authenticated routes using real session state from AuthContext
 * (not a raw token check) so it correctly waits out the initial `/auth/me`
 * hydration on page refresh instead of redirecting a valid session to
 * /login for a flash of a frame.
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.auth.login} replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
