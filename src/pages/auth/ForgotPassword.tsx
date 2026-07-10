import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { MdEmail } from 'react-icons/md';
import { Alert, Button, Input } from '@/components/ui';
import { useAuth } from '@/hooks';
import { ROUTES } from '@/constants';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/utils/validation';

/** Requests a password-reset email. Rendered inside AuthLayout. */
export function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setFormError(null);
    try {
      await forgotPassword(values);
      setSentTo(values.email);
    } catch (err) {
      const message = err && typeof err === 'object' && 'message' in err ? String(err.message) : null;
      setFormError(message ?? 'Something went wrong. Please try again.');
    }
  };

  if (sentTo) {
    return (
      <div>
        <h1 className="font-display text-2xl font-semibold">Check your inbox</h1>
        <Alert variant="success" className="mt-5">
          If an account exists for <strong>{sentTo}</strong>, we've sent a link to reset your password.
        </Alert>
        <Link
          to={ROUTES.auth.login}
          className="mt-6 inline-block text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          ← Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Forgot your password?</h1>
      <p className="mt-1.5 text-sm text-foreground-muted">
        Enter the email on your account and we'll send you a reset link.
      </p>

      {formError && (
        <Alert variant="error" className="mt-5" onClose={() => setFormError(null)}>
          {formError}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@farm.com"
          leftIcon={<MdEmail />}
          error={errors.email?.message}
          autoComplete="email"
          {...register('email')}
        />

        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Send reset link
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-foreground-muted">
        <Link to={ROUTES.auth.login} className="font-medium text-primary-600 hover:text-primary-700">
          ← Back to sign in
        </Link>
      </p>
    </div>
  );
}
