import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

/**
 * Badge
 * ---------------------------------------------------------------------------
 * Small status pill used inline with text or in table cells — sensor status
 * ("Online"), irrigation state ("Needs water"), plan tier, alert severity.
 * Not for interactive elements; use Button for anything clickable.
 *
 * Usage: <Badge variant="success">Healthy</Badge>
 */

export type BadgeVariant = "success" | "warning" | "error" | "info" | "neutral";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  icon?: ReactNode;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  error: "bg-danger-bg text-danger",
  info: "bg-info-bg text-info",
  neutral: "bg-neutral-100 text-text-secondary",
};

const dotStyles: Record<BadgeVariant, string> = {
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-danger",
  info: "bg-info",
  neutral: "bg-neutral-500",
};

export function Badge({ className, variant = "neutral", icon, dot, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-body text-xs font-semibold leading-none",
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dotStyles[variant])} aria-hidden="true" />}
      {icon && (
        <span className="text-sm" aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </span>
  );
}
