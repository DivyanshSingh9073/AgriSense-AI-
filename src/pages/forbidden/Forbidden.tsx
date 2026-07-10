import { Link } from 'react-router-dom';
import { MdOutlineLock } from 'react-icons/md';
import { ROUTES } from '@/constants';

/** 403 — shown when a signed-in user hits a route/resource they don't have permission for. */
export function Forbidden() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <MdOutlineLock className="h-12 w-12 text-warning" aria-hidden="true" />
      <h1 className="font-display text-3xl font-semibold">Access denied</h1>
      <p className="max-w-sm text-foreground-muted">
        You don't have permission to view this page. If you think this is a mistake, contact your farm's admin.
      </p>
      <Link
        to={ROUTES.dashboard.root}
        className="mt-2 inline-flex h-11 items-center rounded-xl bg-primary-600 px-5 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus-ring"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
