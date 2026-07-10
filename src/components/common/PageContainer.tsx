import type { ReactNode } from 'react';

export interface PageContainerProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

/**
 * Temporary scaffold wrapper for pages that don't have real UI yet.
 * Every page created in this setup phase renders through here so the whole
 * app is navigable and visually consistent before individual page UIs land.
 * Safe to stop using per-page once real designs are implemented.
 */
export function PageContainer({ title, description, children }: PageContainerProps) {
  return (
    <div className="container-app py-10">
      <h1 className="font-display text-2xl font-semibold sm:text-3xl">{title}</h1>
      {description && <p className="mt-2 max-w-xl text-foreground-muted">{description}</p>}
      <div className="mt-8 flex min-h-[240px] items-center justify-center rounded-2xl border border-dashed border-border text-sm text-foreground-muted">
        {children ?? 'Page UI coming in a later phase.'}
      </div>
    </div>
  );
}
