import { Link } from 'react-router-dom';
import { MdOutlineErrorOutline } from 'react-icons/md';
import { ROUTES } from '@/constants';

/** Catch-all 404 page. */
export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <MdOutlineErrorOutline className="h-12 w-12 text-primary-500" aria-hidden="true" />
      <h1 className="font-display text-3xl font-semibold">Page not found</h1>
      <p className="max-w-sm text-foreground-muted">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link
        to={ROUTES.home}
        className="mt-2 inline-flex h-11 items-center rounded-xl bg-primary-600 px-5 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
      >
        Back to home
      </Link>
    </div>
  );
}
