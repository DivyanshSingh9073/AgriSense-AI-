import { MdOutlineCloudOff } from 'react-icons/md';
import { Button } from '@/components/ui';

/** 500 — shown when the app catches an unrecoverable API/server failure. */
export function ServerError() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <MdOutlineCloudOff className="h-12 w-12 text-danger" aria-hidden="true" />
      <h1 className="font-display text-3xl font-semibold">Something went wrong</h1>
      <p className="max-w-sm text-foreground-muted">
        Our servers hit a snag on our end. Try again in a moment — if it keeps happening, let us know.
      </p>
      <Button onClick={() => window.location.reload()}>Try again</Button>
    </div>
  );
}
