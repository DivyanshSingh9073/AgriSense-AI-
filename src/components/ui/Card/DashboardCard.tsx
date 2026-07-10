import type { ReactNode } from 'react';
import { cn } from '@/utils';

export interface DashboardCardProps {
  title: string;
  description?: string;
  /** Slot for a header action, e.g. a "View all" link or a filter dropdown. */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Removes the default body padding — useful when embedding a full-bleed chart. */
  noBodyPadding?: boolean;
}

/**
 * The workhorse widget container for the dashboard grid — wraps charts,
 * tables, and lists (e.g. "Disease Trend", "Recent Scans", "Weather This
 * Week") in a consistent header + body shell.
 */
export function DashboardCard({
  title,
  description,
  action,
  children,
  className,
  noBodyPadding = false,
}: DashboardCardProps) {
  return (
    <div className={cn('card-surface flex flex-col', className)}>
      <div className="flex items-start justify-between gap-3 p-5 pb-4">
        <div>
          <h3 className="font-display text-base font-semibold text-foreground">{title}</h3>
          {description && <p className="mt-0.5 text-sm text-foreground-muted">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className={cn('flex-1', !noBodyPadding && 'px-5 pb-5')}>{children}</div>
    </div>
  );
}
