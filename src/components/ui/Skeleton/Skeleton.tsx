import type { CSSProperties } from 'react';
import { cn } from '@/utils';

export interface SkeletonProps {
  className?: string;
  style?: CSSProperties;
  /** Set false to render a static block instead of the pulse animation (e.g. for prefers-reduced-motion callers that need to opt out explicitly). */
  animate?: boolean;
}

/**
 * Base skeleton block — a pulsing neutral rectangle. Compose with explicit
 * width/height via `className` (e.g. `className="h-4 w-32"`), or use the
 * pre-shaped helpers below for common cases.
 */
export function Skeleton({ className, style, animate = true }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      style={style}
      className={cn('rounded-md bg-surface-muted', animate && 'animate-pulse', className)}
    />
  );
}

/** A block of skeleton text lines, e.g. standing in for a paragraph or card title + subtitle. */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)} aria-label="Loading text">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-3.5', i === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  );
}

/** Circular skeleton for avatar placeholders. */
export function SkeletonCircle({ size = 40, className }: { size?: number; className?: string }) {
  return <Skeleton className={cn('rounded-full', className)} style={{ width: size, height: size }} />;
}

/** Rectangular skeleton for image/chart/table placeholders. */
export function SkeletonBlock({ className }: { className?: string }) {
  return <Skeleton className={cn('h-40 w-full rounded-2xl', className)} />;
}

/** A DashboardCard-shaped skeleton — drop in wherever a DashboardCard is loading. */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('card-surface space-y-4 p-5', className)}>
      <div className="flex items-center gap-3">
        <SkeletonCircle size={36} />
        <Skeleton className="h-3.5 w-1/3" />
      </div>
      <SkeletonText lines={2} />
    </div>
  );
}
