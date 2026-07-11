import { forwardRef, useId, useState } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { cn } from "../../lib/cn";

/**
 * Input
 * ---------------------------------------------------------------------------
 * The single text-input implementation for every form in the product: field
 * setup wizards, auth forms, farm/plot naming, search bars. Compose it with a
 * label and helper/error text rather than building bespoke form rows.
 *
 * Usage:
 *   <Input label="Field name" placeholder="North paddy field" />
 *   <Input label="Soil moisture threshold" suffixIcon={<span>%</span>} />
 *   <Input label="Password" type="password" />   // toggle appears automatically
 *   <Input label="API key" error="This key has expired" />
 */

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  label?: string;
  error?: string;
  helperText?: string;
  prefixIcon?: ReactNode;
  suffixIcon?: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { className, label, error, helperText, prefixIcon, suffixIcon, leftIcon, rightIcon, type = "text", id, disabled, ...props },
    ref,
  ) => {
    const resolvedPrefixIcon = prefixIcon ?? leftIcon;
    const resolvedSuffixIcon = suffixIcon ?? rightIcon;
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;

    const [showPassword, setShowPassword] = useState(false);
    const isPasswordField = type === "password";
    const resolvedType = isPasswordField && showPassword ? "text" : type;

    const describedBy = [error ? errorId : null, helperText ? helperId : null].filter(Boolean).join(" ") || undefined;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block font-body text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {resolvedPrefixIcon && (
            <span className="pointer-events-none absolute left-3 flex items-center text-text-muted" aria-hidden="true">
              {resolvedPrefixIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            disabled={disabled}
            aria-invalid={!!error || undefined}
            aria-describedby={describedBy}
            className={cn(
              "h-10 w-full rounded-md border bg-surface font-body text-sm text-text-primary",
              "placeholder:text-text-muted",
              "transition-colors duration-fast ease-standard",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              "disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-text-muted",
              error ? "border-danger focus-visible:ring-danger" : "border-border-strong hover:border-primary-400",
              resolvedPrefixIcon ? "pl-9" : "pl-3",
              resolvedSuffixIcon || isPasswordField ? "pr-9" : "pr-3",
              className,
            )}
            {...props}
          />

          {isPasswordField ? (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 flex items-center text-text-muted transition-colors hover:text-text-primary focus-visible:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={0}
            >
              {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
            </button>
          ) : (
            resolvedSuffixIcon && (
              <span className="pointer-events-none absolute right-3 flex items-center text-text-muted" aria-hidden="true">
                {resolvedSuffixIcon}
              </span>
            )
          )}
        </div>

        {error ? (
          <p id={errorId} className="mt-1.5 font-body text-sm text-danger" role="alert">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="mt-1.5 font-body text-sm text-text-muted">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";
