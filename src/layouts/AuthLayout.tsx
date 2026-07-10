import { Link, Outlet } from 'react-router-dom';
import { MdEco } from 'react-icons/md';
import { APP_CONFIG, ROUTES } from '@/constants';

/**
 * Layout for Login / Register. A quiet branding panel on desktop, a centered
 * form panel on all sizes — deliberately minimal chrome so the form is the
 * only thing competing for attention.
 */
export function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-primary-700 p-10 text-primary-50 lg:flex">
        <Link to={ROUTES.home} className="flex items-center gap-2 font-display text-lg font-semibold">
          <MdEco className="h-6 w-6" aria-hidden="true" />
          {APP_CONFIG.name}
        </Link>

        <div className="max-w-sm">
          <p className="font-display text-3xl font-semibold leading-snug">
            Field data, decoded into decisions.
          </p>
          <p className="mt-3 text-primary-100/80">
            Disease detection, crop recommendations, and weather intelligence — in one platform built for growers.
          </p>
        </div>

        <p className="text-sm text-primary-100/60">
          © {new Date().getFullYear()} {APP_CONFIG.name}
        </p>
      </div>

      <div className="flex w-full flex-col items-center justify-center bg-background p-6 lg:w-1/2">
        <Link to={ROUTES.home} className="mb-8 flex items-center gap-2 font-display text-lg font-semibold lg:hidden">
          <MdEco className="h-6 w-6 text-primary-600" aria-hidden="true" />
          {APP_CONFIG.name}
        </Link>

        <div className="w-full max-w-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
