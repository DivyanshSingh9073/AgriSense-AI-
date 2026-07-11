import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

/**
 * Skeleton
 * ---------------------------------------------------------------------------
 * Placeholder shown while real content (sensor readings, chart data, avatar)
 * is loading, to reduce perceived latency and layout shift. Prefer the
 * presets (`Skeleton.Text`, `Skeleton.Circle`, `Skeleton.Card`) that mirror
 * common shapes; fall back to the base `Skeleton` for anything custom.
 *
 * Usage:
 *   {isLoading ? <Skeleton.Text lines={3} /> : <p>{data}</p>}
 *   {isLoading ? <Skeleton.Circle size={40} /> : <Avatar ... />}
 */

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {}

function Base({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-neutral-200 dark:bg-neutral-200",
        className,
      )}
      {...props}
    >
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer dark:via-white/10" />
    </div>
  );
}

export function SkeletonText({ lines = 1, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2", className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Base
          key={i}
          className={cn("h-3", i === lines - 1 && lines > 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  );
}

export function SkeletonCircle({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <Base
      className={cn("rounded-full", className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border border-border bg-surface p-6", className)} aria-hidden="true">
      <div className="mb-4 flex items-center gap-3">
        <SkeletonCircle size={36} />
        <Base className="h-3 w-1/3" />
      </div>
      <SkeletonText lines={3} />
    </div>
  );
}

export const Skeleton = Object.assign(Base, {
  Text: SkeletonText,
  Circle: SkeletonCircle,
  Card: SkeletonCard,
});
