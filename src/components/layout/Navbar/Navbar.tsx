import { Link, NavLink } from 'react-router-dom';
import { MdEco, MdOutlineDarkMode, MdOutlineLightMode } from 'react-icons/md';
import { APP_CONFIG, PUBLIC_NAV, ROUTES } from '@/constants';
import { useTheme } from '@/hooks';
import { cn } from '@/utils';

/** Top navigation for public-facing pages (Home, marketing, etc). */
export function Navbar() {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-md">
      <nav className="container-app flex h-16 items-center justify-between" aria-label="Primary">
        <Link to={ROUTES.home} className="flex items-center gap-2 font-display text-lg font-semibold">
          <MdEco className="h-6 w-6 text-primary-600" aria-hidden="true" />
          {APP_CONFIG.name}
        </Link>

        <div className="hidden items-center gap-6 sm:flex">
          {PUBLIC_NAV.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className={({ isActive }) =>
                cn(
                  'text-sm font-medium text-foreground-muted transition-colors hover:text-foreground',
                  isActive && 'text-foreground',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="rounded-lg p-2 text-foreground-muted hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            {resolvedTheme === 'dark' ? <MdOutlineLightMode className="h-5 w-5" /> : <MdOutlineDarkMode className="h-5 w-5" />}
          </button>
          <Link
            to={ROUTES.dashboard.root}
            className="inline-flex h-9 items-center rounded-lg bg-primary-600 px-3 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Go to dashboard
          </Link>
        </div>
      </nav>
    </header>
  );
}
