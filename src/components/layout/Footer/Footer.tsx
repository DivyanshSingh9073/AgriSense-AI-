import { APP_CONFIG } from '@/constants';

/** Simple footer for public-facing pages. */
export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="container-app flex flex-col items-center justify-between gap-2 py-6 text-sm text-foreground-muted sm:flex-row">
        <p>
          © {new Date().getFullYear()} {APP_CONFIG.name}. All rights reserved.
        </p>
        <p>{APP_CONFIG.tagline}</p>
      </div>
    </footer>
  );
}
