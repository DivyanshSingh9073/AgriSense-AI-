import { cn } from '@/utils';

export type SpinnerSize = 'sm' | 'md' | 'lg';
export type SpinnerColor = 'current' | 'primary' | 'white' | 'muted';

export interface SpinnerProps {
  size?: SpinnerSize;
  /**
   * 'current' (default) inherits the surrounding text color — this is what
   * makes the spinner automatically render white inside a primary Button
   * and green inside an outline Button, with zero extra wiring.
   */
  color?: SpinnerColor;
  className?: string;
  /** Text announced to screen readers while loading. */
  label?: string;
}

const SIZE_CLASSES: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-[3px]',
};

const COLOR_CLASSES: Record<SpinnerColor, string> = {
  current: 'text-current',
  primary: 'text-primary-600',
  white: 'text-white',
  muted: 'text-foreground-muted',
};

/** Accessible loading indicator. Visually a rotating ring, announced via aria-label. */
export function Spinner({ size = 'md', color = 'current', className, label = 'Loading' }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        'inline-block animate-spin rounded-full border-current border-t-transparent',
        SIZE_CLASSES[size],
        COLOR_CLASSES[color],
        className,
      )}
    />
  );
}
