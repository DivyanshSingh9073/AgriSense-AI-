import { cn } from "../../lib/cn";

/**
 * Spinner
 * ---------------------------------------------------------------------------
 * Generic loading indicator for anything that isn't a button (page sections,
 * modal bodies, table loading states). Buttons should use `Button`'s built-in
 * `isLoading` prop instead of embedding a Spinner directly.
 *
 * Usage: <Spinner size="md" label="Loading field data" />
 */

export type SpinnerSize = "sm" | "md" | "lg";

export interface SpinnerProps {
  size?: SpinnerSize;
  label?: string;
  className?: string;
}

const sizeStyles: Record<SpinnerSize, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-10 w-10 border-[3px]",
};

export function Spinner({ size = "md", label = "Loading", className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        "inline-block animate-spin rounded-full border-primary-200 border-t-primary-600",
        sizeStyles[size],
        className,
      )}
    />
  );
}
