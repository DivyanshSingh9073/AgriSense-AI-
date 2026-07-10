import { useState } from 'react';
import { cn } from '@/utils';

export interface AvatarProps {
  src?: string;
  /** Full name used to derive initials when there's no image (or it fails to load). */
  name: string;
  size?: 'sm' | 'md' | 'lg';
  status?: 'online' | 'offline' | 'away';
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
};

const STATUS_CLASSES = {
  online: 'bg-success',
  offline: 'bg-foreground-muted',
  away: 'bg-warning',
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

/** Circular user avatar. Falls back to initials on missing/broken image. */
export function Avatar({ src, name, size = 'md', status, className }: AvatarProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = src && !imgFailed;

  return (
    <span className={cn('relative inline-flex shrink-0', SIZE_CLASSES[size], className)}>
      {showImage ? (
        <img
          src={src}
          alt={name}
          onError={() => setImgFailed(true)}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <span
          role="img"
          aria-label={name}
          className="flex h-full w-full items-center justify-center rounded-full bg-primary-100 font-display font-semibold text-primary-700 dark:bg-primary-800/50 dark:text-primary-200"
        >
          {getInitials(name)}
        </span>
      )}

      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-surface',
            STATUS_CLASSES[status],
          )}
          aria-label={`Status: ${status}`}
        />
      )}
    </span>
  );
}
