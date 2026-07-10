import { MdMenu, MdOutlineDarkMode, MdOutlineLightMode, MdOutlineNotifications } from 'react-icons/md';
import { Avatar } from '@/components/ui';
import { useTheme } from '@/hooks';

export interface TopbarProps {
  onMenuClick: () => void;
}

/** Header bar for the dashboard shell: mobile menu toggle, theme switch, profile. */
export function Topbar({ onMenuClick }: TopbarProps) {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface px-4 sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open sidebar navigation"
        className="rounded-lg p-2 text-foreground-muted hover:bg-surface-muted md:hidden"
      >
        <MdMenu className="h-6 w-6" />
      </button>

      <div className="hidden text-sm text-foreground-muted md:block">
        Precision agriculture, at a glance.
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

        <button
          type="button"
          aria-label="Notifications"
          className="rounded-lg p-2 text-foreground-muted hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <MdOutlineNotifications className="h-5 w-5" />
        </button>

        <Avatar name="Divyansh Farmer" size="sm" status="online" />
      </div>
    </header>
  );
}
