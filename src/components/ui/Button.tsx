import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { FiLoader } from "react-icons/fi";
import { cn } from "../../lib/cn";

/**
 * Button
 * ---------------------------------------------------------------------------
 * The single button implementation for the entire product. Every clickable
 * action — form submits, toolbar actions, destructive confirms — should route
 * through this component rather than a raw <button>, so that focus rings,
 * disabled/loading behavior, and spacing stay consistent everywhere.
 *
 * Usage:
 *   <Button variant="primary" size="md">Save field</Button>
 *   <Button variant="danger" leftIcon={<FiTrash2 />}>Delete zone</Button>
 *   <Button variant="outline" isLoading loadingText="Syncing…">Sync sensors</Button>
 */

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const baseStyles = [
  "inline-flex items-center justify-center gap-2",
  "font-body font-semibold whitespace-nowrap select-none",
  "transition-colors transition-transform duration-fast ease-standard",
  "rounded-md border",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
  "active:scale-[0.98]",
].join(" ");

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-600 border-primary-600 text-text-onbrand hover:bg-primary-700 hover:border-primary-700 shadow-sm",
  secondary:
    "bg-secondary-500 border-secondary-500 text-text-onbrand hover:bg-secondary-600 hover:border-secondary-600 shadow-sm",
  outline:
    "bg-transparent border-border-strong text-text-primary hover:bg-neutral-100 hover:border-primary-500",
  ghost: "bg-transparent border-transparent text-text-primary hover:bg-neutral-100",
  danger: "bg-danger border-danger text-white hover:brightness-90 shadow-sm",
  success: "bg-success border-success text-white hover:brightness-90 shadow-sm",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm rounded-sm gap-1.5",
  md: "h-10 px-4 text-sm rounded-md",
  lg: "h-12 px-6 text-base rounded-md",
};

const spinnerSize: Record<ButtonSize, string> = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && "w-full",
          className,
        )}
        disabled={isDisabled}
        aria-busy={isLoading || undefined}
        aria-disabled={isDisabled || undefined}
        {...props}
      >
        {isLoading ? (
          <>
            <FiLoader className={cn(spinnerSize[size], "animate-spin")} aria-hidden="true" />
            <span>{loadingText ?? children}</span>
          </>
        ) : (
          <>
            {leftIcon && (
              <span className="shrink-0" aria-hidden="true">
                {leftIcon}
              </span>
            )}
            {children}
            {rightIcon && (
              <span className="shrink-0" aria-hidden="true">
                {rightIcon}
              </span>
            )}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
