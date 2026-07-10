import type { ReactNode } from 'react';
import { MdArrowUpward, MdArrowDownward } from 'react-icons/md';
import { cn } from '@/utils';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  /** Positive shows green + up arrow, negative shows red + down arrow. */
  trend?: { value: string; direction: 'up' | 'down' };
  className?: string;
}

/**
 * Single-metric card for dashboard summary rows (e.g. "Fields Monitored",
 * "Avg. Soil Moisture", "Active Alerts"). Keep the value short — this card
 * is optimized for a 3–4 column grid, not paragraphs of context.
 */
export function StatCard({ label, value, icon, trend, className }: StatCardProps) {
  return (
    <div className={cn('card-surface p-5', className)}>
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-foreground-muted">{label}</p>
        {icon && (
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100 text-primary-700 dark:bg-primary-800/40 dark:text-primary-200 [&>svg]:h-4 [&>svg]:w-4">
            {icon}
          </span>
        )}
      </div>

      <p className="mt-3 font-display text-3xl font-semibold text-foreground">{value}</p>

      {trend && (
        <p
          className={cn(
            'mt-2 inline-flex items-center gap-1 text-xs font-medium',
            trend.direction === 'up' ? 'text-success' : 'text-danger',
          )}
        >
          {trend.direction === 'up' ? (
            <MdArrowUpward className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <MdArrowDownward className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {trend.value}
        </p>
      )}
    </div>
  );
}
