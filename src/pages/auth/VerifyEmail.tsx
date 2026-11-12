import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { MdCheckCircle, MdEmail, MdMarkEmailRead } from 'react-icons/md';
import { Alert, Button, Input } from '@/components/ui';
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
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email') ?? '';
  const registrationResult = location.state as { emailSent?: boolean; retryAfterSeconds?: number | null } | null;

  const [status, setStatus] = useState<Status>(token ? 'verifying' : 'awaiting');
  const [error, setError] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(
    registrationResult?.emailSent === false ? 'A verification email was recently requested for this address.' : null,
  );
  const [manualEmail, setManualEmail] = useState('');
  const [resent, setResent] = useState(registrationResult?.emailSent === true);
  const [cooldownSeconds, setCooldownSeconds] = useState(
    registrationResult?.emailSent === false ? registrationResult.retryAfterSeconds ?? 60 : 0,
  );
  const [isResending, setIsResending] = useState(false);
  const attemptedToken = useRef<string | null>(null);

  useEffect(() => {
    if (!token || attemptedToken.current === token) return;
    attemptedToken.current = token;
    verifyEmail({ token })
      .then(() => {
        setStatus('success');
        setSearchParams(email ? { email } : {}, { replace: true });
      })
      .catch((err) => {
        const message = err && typeof err === 'object' && 'message' in err ? String(err.message) : null;
        setError(message ?? 'This verification link is invalid or has expired.');
        setStatus('error');
        setSearchParams(email ? { email } : {}, { replace: true });
      });
  }, [email, setSearchParams, token, verifyEmail]);

  useEffect(() => {
    if (cooldownSeconds <= 0) return undefined;
    const timer = window.setTimeout(() => setCooldownSeconds((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldownSeconds]);

  const handleResend = async () => {
    const targetEmail = (email || manualEmail).trim();
    if (!targetEmail) {
      setResendError('Enter the email address used to create the account.');
      return;
    }
    setIsResending(true);
    setResendError(null);
    try {
      const result = await resendVerification(targetEmail);
      setCooldownSeconds(result.retryAfterSeconds ?? 0);
      setResent(result.emailSent);
      if (!result.emailSent) {
        setResendError(
          `Please wait ${result.retryAfterSeconds ?? 60} seconds before requesting another verification email.`,
        );
      }
    } catch (requestError) {
      const message = requestError && typeof requestError === 'object' && 'message' in requestError ? String(requestError.message) : null;
      setResendError(message ?? 'Could not resend the verification email. Please try again.');
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
          to={ROUTES.auth.login}
          className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary-600 px-5 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus-ring"
        >
          Continue to sign in
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
        {resent && (
          <Alert variant="success" className="mt-3">
            A new verification email was sent to {email || manualEmail}.
          </Alert>
        )}
        {resendError && <Alert variant="error" className="mt-3">{resendError}</Alert>}
        {!email && (
          <div className="mt-5">
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@farm.com"
              leftIcon={<MdEmail />}
              value={manualEmail}
              onChange={(event) => setManualEmail(event.target.value)}
            />
          </div>
        )}
        <Button
          fullWidth
          className="mt-6"
          isLoading={isResending}
          disabled={cooldownSeconds > 0}
          onClick={handleResend}
        >
          {cooldownSeconds > 0 ? `Resend in ${cooldownSeconds}s` : 'Resend verification email'}
        </Button>
      </div>
    );
  }

  // status === 'awaiting'
  return (
    <div className="text-center">
      <MdMarkEmailRead className="mx-auto h-12 w-12 text-primary-600" aria-hidden="true" />
      <h1 className="mt-4 font-display text-2xl font-semibold">Verify your email</h1>
      {resent ? (
        <p className="mt-1.5 text-sm text-foreground-muted">A verification link was sent to {email || manualEmail}.</p>
      ) : (
        <p className="mt-1.5 text-sm text-foreground-muted">Request a verification link to continue.</p>
      )}

      {!email && (
        <div className="mt-5 text-left">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@farm.com"
            leftIcon={<MdEmail />}
            value={manualEmail}
            onChange={(event) => setManualEmail(event.target.value)}
          />
        </div>
      )}

      {resent && (
        <Alert variant="success" className="mt-5 text-left">
          Verification email resent — check your inbox.
        </Alert>
      )}

      {resendError && <Alert variant="error" className="mt-5 text-left">{resendError}</Alert>}

      <Button
        variant="outline"
        fullWidth
        className="mt-6"
        isLoading={isResending}
        disabled={cooldownSeconds > 0}
        onClick={handleResend}
      >
        {cooldownSeconds > 0 ? `Resend in ${cooldownSeconds}s` : resent ? 'Resend email' : 'Send verification email'}
      </Button>

      <p className="mt-6 text-sm text-foreground-muted">
        <Link to={ROUTES.auth.login} className="font-medium text-primary-600 hover:text-primary-700">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
