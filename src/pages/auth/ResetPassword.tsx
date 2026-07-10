import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { MdLock } from 'react-icons/md';
import { Alert, Button, Input } from '@/components/ui';
import { useAuth } from '@/hooks';
import { ROUTES } from '@/constants';
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/utils/validation';

/**
 * Reset password page. Expects a `?token=...` query param, as sent in the
 * reset-password email link (e.g. /reset-password?token=abc123).
 */
export function ResetPassword() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!token) {
      setFormError('This reset link is invalid or has expired. Request a new one.');
      return;
    }
    setFormError(null);
    try {
      await resetPassword({ token, password: values.password });
      navigate(ROUTES.auth.login, { replace: true });
    } catch (err) {
      const message = err && typeof err === 'object' && 'message' in err ? String(err.message) : null;
      setFormError(message ?? 'Unable to reset your password. The link may have expired.');
    }
  };

  if (!token) {
    return (
      <div>
        <h1 className="font-display text-2xl font-semibold">Invalid reset link</h1>
        <Alert variant="error" className="mt-5">
          This password reset link is missing or invalid. Please request a new one.
        </Alert>
        <Link
          to={ROUTES.auth.forgotPassword}
          className="mt-6 inline-block text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Set a new password</h1>
      <p className="mt-1.5 text-sm text-foreground-muted">Choose a strong password for your account.</p>

      {formError && (
        <Alert variant="error" className="mt-5" onClose={() => setFormError(null)}>
          {formError}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-4">
        <Input
          label="New password"
          type="password"
          placeholder="At least 8 characters"
          leftIcon={<MdLock />}
          error={errors.password?.message}
          autoComplete="new-password"
          {...register('password')}
        />

        <Input
          label="Confirm new password"
          type="password"
          placeholder="Re-enter your password"
          leftIcon={<MdLock />}
          error={errors.confirmPassword?.message}
          autoComplete="new-password"
          {...register('confirmPassword')}
        />

        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Reset password
        </Button>
      </form>
    </div>
  );
}
