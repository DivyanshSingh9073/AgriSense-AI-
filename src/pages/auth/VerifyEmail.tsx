import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MdCheckCircle, MdMarkEmailRead } from 'react-icons/md';
import { Alert, Button } from '@/components/ui';
import { useAuth } from '@/hooks';
import { ROUTES } from '@/constants';

type Status = 'awaiting' | 'verifying' | 'success' | 'error';

/**
 * Two modes in one page:
 *  - No `?token=` param: shown right after registration — "check your inbox" + resend action.
 *  - `?token=abc123` param (from the email link): auto-verifies on mount.
 */
export function VerifyEmail() {
  const { verifyEmail, resendVerification } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<Status>(token ? 'verifying' : 'awaiting');
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!token) return;
    verifyEmail({ token })
      .then(() => setStatus('success'))
      .catch((err) => {
        const message = err && typeof err === 'object' && 'message' in err ? String(err.message) : null;
        setError(message ?? 'This verification link is invalid or has expired.');
        setStatus('error');
      });
  }, [token, verifyEmail]);

  const handleResend = async () => {
    setIsResending(true);
    try {
      await resendVerification();
      setResent(true);
    } finally {
      setIsResending(false);
    }
  };

  if (status === 'verifying') {
    return (
      <div className="text-center">
        <h1 className="font-display text-2xl font-semibold">Verifying your email…</h1>
        <p className="mt-1.5 text-sm text-foreground-muted">This will only take a moment.</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="text-center">
        <MdCheckCircle className="mx-auto h-12 w-12 text-success" aria-hidden="true" />
        <h1 className="mt-4 font-display text-2xl font-semibold">Email verified</h1>
        <p className="mt-1.5 text-sm text-foreground-muted">Your account is ready to go.</p>
        <Link
          to={ROUTES.dashboard.root}
          className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary-600 px-5 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus-ring"
        >
          Go to dashboard
        </Link>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div>
        <h1 className="text-center font-display text-2xl font-semibold">Verification failed</h1>
        <Alert variant="error" className="mt-5">
          {error}
        </Alert>
        <Button fullWidth className="mt-6" isLoading={isResending} onClick={handleResend}>
          Resend verification email
        </Button>
      </div>
    );
  }

  // status === 'awaiting'
  return (
    <div className="text-center">
      <MdMarkEmailRead className="mx-auto h-12 w-12 text-primary-600" aria-hidden="true" />
      <h1 className="mt-4 font-display text-2xl font-semibold">Check your inbox</h1>
      <p className="mt-1.5 text-sm text-foreground-muted">
        We've sent a verification link to your email address. Click it to activate your account.
      </p>

      {resent && (
        <Alert variant="success" className="mt-5 text-left">
          Verification email resent — check your inbox.
        </Alert>
      )}

      <Button variant="outline" fullWidth className="mt-6" isLoading={isResending} onClick={handleResend}>
        Resend email
      </Button>

      <p className="mt-6 text-sm text-foreground-muted">
        <Link to={ROUTES.auth.login} className="font-medium text-primary-600 hover:text-primary-700">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
