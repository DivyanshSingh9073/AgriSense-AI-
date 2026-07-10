import type { HTMLAttributes } from 'react';
import { cn } from '@/utils';

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {}

/**
 * Frosted-glass surface for content sitting on top of imagery or gradients
 * (hero sections, floating summary panels). Uses backdrop-blur, so it only
 * reads as "glass" over something with visual texture behind it — avoid
 * using it directly on a flat background.
 */
export function GlassCard({ className, ...rest }: GlassCardProps) {
  return <div className={cn('glass-surface rounded-2xl shadow-glass', className)} {...rest} />;
}
