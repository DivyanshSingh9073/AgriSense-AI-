import { useState } from "react";
import { cn } from "../../lib/cn";

/**
 * Avatar
 * ---------------------------------------------------------------------------
 * Represents a person (team member, farm collaborator, assigned agronomist)
 * anywhere across the app — nav bar, comment threads, team lists. Falls back
 * to initials automatically if `src` is missing or fails to load.
 *
 * Usage:
 *   <Avatar name="Divyansh Singh" src="/avatars/divyansh.jpg" status="online" />
 *   <Avatar name="Fariza Sultana" size="sm" />
 */

export type AvatarSize = "sm" | "md" | "lg";
export type AvatarStatus = "online" | "offline" | "away";

export interface AvatarProps {
  src?: string;
  name: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  className?: string;
}

const sizeStyles: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
};

const statusColor: Record<AvatarStatus, string> = {
  online: "bg-success",
  offline: "bg-neutral-400",
  away: "bg-warning",
};

const statusSize: Record<AvatarSize, string> = {
  sm: "h-2 w-2",
  md: "h-2.5 w-2.5",
  lg: "h-3.5 w-3.5",
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
  return initials.join("");
}

export function Avatar({ src, name, size = "md", status, className }: AvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = src && !imageFailed;

  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      {showImage ? (
        <img
          src={src}
          alt={name}
          onError={() => setImageFailed(true)}
          className={cn("rounded-full object-cover ring-1 ring-border", sizeStyles[size])}
        />
      ) : (
        <span
          role="img"
          aria-label={name}
          className={cn(
            "flex items-center justify-center rounded-full bg-primary-100 font-body font-semibold text-primary-700 ring-1 ring-border",
            sizeStyles[size],
          )}
        >
          {getInitials(name)}
        </span>
      )}

      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full ring-2 ring-surface",
            statusColor[status],
            statusSize[size],
          )}
          aria-label={`Status: ${status}`}
        />
      )}
    </span>
  );
}
