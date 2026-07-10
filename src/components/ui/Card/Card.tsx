import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds hover elevation — use for clickable/navigable cards. */
  interactive?: boolean;
}

/**
 * Compound Card component: <Card><CardHeader/><CardBody/><CardFooter/></Card>
 * Keeps section spacing consistent across dashboard widgets, forms, etc.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ interactive = false, className, ...rest }, ref) => (
    <div
      ref={ref}
      className={cn(
        'card-surface',
        interactive && 'transition-shadow duration-150 hover:shadow-elevated',
        className,
      )}
      {...rest}
    />
  ),
);
Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...rest }, ref) => (
    <div ref={ref} className={cn('flex items-center justify-between gap-3 p-5 pb-0', className)} {...rest} />
  ),
);
CardHeader.displayName = 'CardHeader';

export const CardBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...rest }, ref) => <div ref={ref} className={cn('p-5', className)} {...rest} />,
);
CardBody.displayName = 'CardBody';

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...rest }, ref) => (
    <div ref={ref} className={cn('flex items-center gap-3 border-t border-border p-5', className)} {...rest} />
  ),
);
CardFooter.displayName = 'CardFooter';
