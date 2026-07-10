import type { ReactNode } from 'react';
import { MdCheckCircle, MdError, MdInfo, MdWarning, MdClose } from 'react-icons/md';
import { cn } from '@/utils';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  className?: string;
}

const VARIANT_CONFIG: Record<AlertVariant, { icon: typeof MdInfo; classes: string }> = {
  info: { icon: MdInfo, classes: 'bg-info/10 text-info border-info/20' },
  success: { icon: MdCheckCircle, classes: 'bg-success/10 text-success border-success/20' },
  warning: { icon: MdWarning, classes: 'bg-warning/10 text-warning border-warning/20' },
  error: { icon: MdError, classes: 'bg-danger/10 text-danger border-danger/20' },
};

/** Inline status message for form feedback, API errors, or system notices. */
export function Alert({ variant = 'info', title, children, onClose, className }: AlertProps) {
  const { icon: Icon, classes } = VARIANT_CONFIG[variant];

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn('flex gap-3 rounded-xl border p-4 text-sm', classes, className)}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div className="flex-1">
        {title && <p className="font-semibold">{title}</p>}
        <div className={cn(title && 'mt-0.5', 'text-foreground/90')}>{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss"
          className="shrink-0 rounded-md p-0.5 hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current dark:hover:bg-white/10"
        >
          <MdClose className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
