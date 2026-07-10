import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges class names conditionally (clsx) and then resolves any conflicting
 * Tailwind utility classes so the last one wins (twMerge).
 *
 * Used by every UI primitive to accept a `className` override safely, e.g.
 * <Button className="mt-4" /> won't fight with the internal margin classes.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
