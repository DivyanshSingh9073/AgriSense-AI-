import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { cn } from '@/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  /** Validation error message (e.g. from React Hook Form / Zod). */
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  /**
   * Ignored when `type="password"` — the show/hide toggle takes over the
   * right slot in that case so the two affordances never collide.
   */
  rightIcon?: ReactNode;
}

/**
 * Text input wired up for accessible forms:
 *  - <label htmlFor> is always linked to the input via a generated id.
 *  - Error text is announced via aria-describedby + aria-invalid.
 *  - `type="password"` automatically gets a show/hide toggle — no extra prop needed.
 * Designed to be passed directly as a React Hook Form `register()` target.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, id, className, type = 'text', ...rest }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const descriptionId = error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined;

    const isPassword = type === 'password';
    const [revealed, setRevealed] = useState(false);
    const resolvedType = isPassword ? (revealed ? 'text' : 'password') : type;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3 text-foreground-muted [&>svg]:h-4 [&>svg]:w-4">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            aria-invalid={!!error || undefined}
            aria-describedby={descriptionId}
            className={cn(
              'h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground placeholder:text-foreground-muted',
              'transition-colors focus-ring',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-danger focus-visible:ring-danger',
              leftIcon && 'pl-9',
              (rightIcon || isPassword) && 'pr-9',
              className,
            )}
            {...rest}
          />

          {isPassword ? (
            <button
              type="button"
              onClick={() => setRevealed((r) => !r)}
              aria-label={revealed ? 'Hide password' : 'Show password'}
              aria-pressed={revealed}
              className="absolute right-3 text-foreground-muted hover:text-foreground focus-visible:outline-none [&>svg]:h-4 [&>svg]:w-4"
            >
              {revealed ? <MdVisibilityOff /> : <MdVisibility />}
            </button>
          ) : (
            rightIcon && (
              <span className="absolute right-3 text-foreground-muted [&>svg]:h-4 [&>svg]:w-4">{rightIcon}</span>
            )
          )}
        </div>

        {error ? (
          <p id={descriptionId} role="alert" className="text-xs font-medium text-danger">
            {error}
          </p>
        ) : helperText ? (
          <p id={descriptionId} className="text-xs text-foreground-muted">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';
