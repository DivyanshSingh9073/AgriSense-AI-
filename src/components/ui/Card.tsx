import type { HTMLAttributes, ReactNode } from "react";
import { FiArrowUpRight, FiArrowDownRight } from "react-icons/fi";
import { cn } from "../../lib/cn";

/**
 * Card family
 * ---------------------------------------------------------------------------
 * `Card` is the shared shell (padding, radius, border, background) that every
 * other card composes. Reach for the presets first:
 *
 *  - FeatureCard    marketing/upsell tiles, "what this module does" panels
 *  - DashboardCard  a titled container that holds a chart, table, or list
 *  - StatsCard      one KPI number with a trend delta (yield, NDVI, soil pH…)
 *  - GlassCard      translucent overlay card for hero sections / map overlays
 *
 * Only drop down to the bare <Card> when none of the presets fit.
 */

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  as?: "div" | "section" | "article";
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-surface p-6 shadow-sm",
        "transition-shadow duration-base ease-standard",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* ---------------------------------- Feature Card --------------------------------- */

export interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
}

export function FeatureCard({ icon, title, description, className }: FeatureCardProps) {
  return (
    <Card
      className={cn(
        "group hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md",
        className,
      )}
    >
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-primary-50 text-primary-600 transition-colors duration-base group-hover:bg-primary-600 group-hover:text-white">
        <span className="text-xl" aria-hidden="true">
          {icon}
        </span>
      </div>
      <h3 className="mb-1.5 font-heading text-lg font-semibold text-text-primary">{title}</h3>
      <p className="font-body text-sm leading-relaxed text-text-secondary">{description}</p>
    </Card>
  );
}

/* --------------------------------- Dashboard Card --------------------------------- */

export interface DashboardCardProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function DashboardCard({ title, subtitle, action, children, className }: DashboardCardProps) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-heading text-base font-semibold text-text-primary">{title}</h3>
          {subtitle && <p className="mt-0.5 font-body text-sm text-text-muted">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="flex-1">{children}</div>
    </Card>
  );
}

/* ----------------------------------- Stats Card ----------------------------------- */

export interface StatsCardProps {
  label: string;
  value: string;
  delta?: { value: string; direction: "up" | "down"; positiveIsGood?: boolean };
  icon?: ReactNode;
  className?: string;
}

export function StatsCard({ label, value, delta, icon, className }: StatsCardProps) {
  const isGood = delta ? (delta.direction === "up") === (delta.positiveIsGood ?? true) : true;

  return (
    <Card className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between">
        <span className="font-body text-sm font-medium text-text-secondary">{label}</span>
        {icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-50 text-primary-600" aria-hidden="true">
            {icon}
          </span>
        )}
      </div>

      <div className="flex items-end justify-between gap-2">
        <span className="font-heading text-3xl font-bold tracking-tight text-text-primary">{value}</span>
        {delta && (
          <span
            className={cn(
              "mb-1 flex items-center gap-0.5 rounded-full px-2 py-0.5 font-body text-xs font-semibold",
              isGood ? "bg-success-bg text-success" : "bg-danger-bg text-danger",
            )}
          >
            {delta.direction === "up" ? (
              <FiArrowUpRight className="h-3 w-3" aria-hidden="true" />
            ) : (
              <FiArrowDownRight className="h-3 w-3" aria-hidden="true" />
            )}
            {delta.value}
          </span>
        )}
      </div>
    </Card>
  );
}

/* ----------------------------------- Glass Card ------------------------------------ */

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {}

export function GlassCard({ className, children, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/20 bg-white/10 p-6 shadow-glass backdrop-blur-xl",
        "dark:border-white/10 dark:bg-white/5",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
