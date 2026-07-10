import type { ReactNode } from 'react';
import { cn } from '@/utils';

export interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
}

/**
 * Icon + title + description card used in feature grids (e.g. marketing
 * sections explaining "Disease Detection", "Crop Recommendation", etc).
 * Not a wrapper around the base Card — it's deliberately lighter (no border
 * by default) so a grid of these reads as one cohesive section rather than
 * a stack of boxes.
 */
export function FeatureCard({ icon, title, description, className }: FeatureCardProps) {
  return (
    <div className={cn('group rounded-2xl p-6 transition-colors hover:bg-surface-muted', className)}>
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-primary-700 transition-transform duration-base group-hover:scale-105 dark:bg-primary-800/40 dark:text-primary-200 [&>svg]:h-5 [&>svg]:w-5">
        {icon}
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-foreground-muted">{description}</p>
    </div>
  );
}
