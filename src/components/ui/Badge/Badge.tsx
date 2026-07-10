import type { HTMLAttributes } from 'react';
import { cn } from '@/utils';

export type BadgeVariant =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  /** Shows a small status dot before the label (e.g. "healthy", "at risk"). */
  dot?: boolean;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  primary: 'bg-primary-100 text-primary-700 dark:bg-primary-800/40 dark:text-primary-200',
  secondary: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-800/40 dark:text-secondary-200',
  accent: 'bg-accent-100 text-accent-800 dark:bg-accent-800/40 dark:text-accent-200',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  error: 'bg-danger/10 text-danger',
  info: 'bg-info/10 text-info',
  neutral: 'bg-surface-muted text-foreground-muted',
};

const DOT_CLASSES: Record<BadgeVariant, string> = {
  primary: 'bg-primary-500',
  secondary: 'bg-secondary-500',
  accent: 'bg-accent-500',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-danger',
  info: 'bg-info',
  neutral: 'bg-foreground-muted',
};

/**
 * Compact status/category label — crop health status, plan tier, alert
 * severity. Variant names mirror <Alert> ('error' not 'danger') so the two
 * components read consistently wherever they appear together.
 */
export function Badge({ variant = 'neutral', dot = false, className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        VARIANT_CLASSES[variant],
        className,
      )}
      {...rest}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', DOT_CLASSES[variant])} aria-hidden="true" />}
      {children}
    </span>
  );
}
