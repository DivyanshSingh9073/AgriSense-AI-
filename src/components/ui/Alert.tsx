import type { ReactNode } from "react";
import { FiCheckCircle, FiAlertTriangle, FiAlertCircle, FiInfo, FiX } from "react-icons/fi";
import { cn } from "../../lib/cn";

/**
 * Alert
 * ---------------------------------------------------------------------------
 * A page/section-level banner for system messages: "Sensor sync complete",
 * "3 fields need irrigation", "API key expiring". For per-field validation
 * use Input's built-in `error` prop instead — Alert is for standalone
 * messages, not form field errors.
 *
 * Usage:
 *   <Alert type="success" title="Sync complete">All 12 sensors reporting.</Alert>
 *   <Alert type="warning" onClose={() => …}>Battery low on Node 4.</Alert>
 */

export type AlertType = "success" | "error" | "warning" | "info";

export interface AlertProps {
  type?: AlertType;
  variant?: AlertType;
  title?: string;
  children?: ReactNode;
  onClose?: () => void;
  className?: string;
}

const config: Record<AlertType, { icon: ReactNode; classes: string; iconColor: string }> = {
  success: { icon: <FiCheckCircle />, classes: "bg-success-bg border-success/30", iconColor: "text-success" },
  error: { icon: <FiAlertCircle />, classes: "bg-danger-bg border-danger/30", iconColor: "text-danger" },
  warning: { icon: <FiAlertTriangle />, classes: "bg-warning-bg border-warning/30", iconColor: "text-warning" },
  info: { icon: <FiInfo />, classes: "bg-info-bg border-info/30", iconColor: "text-info" },
};

export function Alert({ type = "info", variant, title, children, onClose, className }: AlertProps) {
  const resolvedType = variant ?? type;
  const { icon, classes, iconColor } = config[resolvedType];

  return (
    <div
      role="alert"
      className={cn("flex gap-3 rounded-md border p-4", classes, className)}
    >
      <span className={cn("mt-0.5 shrink-0 text-lg", iconColor)} aria-hidden="true">
        {icon}
      </span>

      <div className="flex-1 font-body text-sm text-text-primary">
        {title && <p className="mb-0.5 font-semibold">{title}</p>}
        {children && <div className="text-text-secondary">{children}</div>}
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss alert"
          className="shrink-0 self-start rounded-md p-1 text-text-muted transition-colors hover:bg-black/5 hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <FiX className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
