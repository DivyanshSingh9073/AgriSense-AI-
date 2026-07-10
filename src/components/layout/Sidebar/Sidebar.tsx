import { NavLink } from 'react-router-dom';
import { MdEco, MdChevronLeft } from 'react-icons/md';
import { APP_CONFIG, ACCOUNT_NAV, DASHBOARD_NAV, ROUTES } from '@/constants';
import { cn } from '@/utils';

export interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

/** Collapsible primary navigation for the authenticated dashboard shell. */
export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={cn(
        'hidden shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-200 md:flex',
        collapsed ? 'w-[76px]' : 'w-64',
      )}
      aria-label="Sidebar"
    >
      <div className="flex h-16 items-center justify-between px-4">
        <NavLink to={ROUTES.home} className="flex items-center gap-2 overflow-hidden font-display font-semibold">
          <MdEco className="h-6 w-6 shrink-0 text-primary-600" aria-hidden="true" />
          {!collapsed && <span className="truncate">{APP_CONFIG.shortName}</span>}
        </NavLink>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2" aria-label="Dashboard sections">
        {DASHBOARD_NAV.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === ROUTES.dashboard.root}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground',
                isActive && 'bg-primary-50 text-primary-700 dark:bg-primary-800/30 dark:text-primary-200',
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-1 border-t border-border px-3 py-3">
        {ACCOUNT_NAV.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground',
                isActive && 'bg-primary-50 text-primary-700 dark:bg-primary-800/30 dark:text-primary-200',
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}

        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground-muted hover:bg-surface-muted hover:text-foreground"
        >
          <MdChevronLeft className={cn('h-5 w-5 shrink-0 transition-transform', collapsed && 'rotate-180')} />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
