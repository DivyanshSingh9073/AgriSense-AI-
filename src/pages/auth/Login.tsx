import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MdEmail, MdLock } from 'react-icons/md';
import { Alert, Button, Input } from '@/components/ui';
import { useAuth } from '@/hooks';
import { ROUTES } from '@/constants';
import { loginSchema, type LoginFormValues } from '@/utils/validation';

/** Sign-in page, rendered inside AuthLayout. */
export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const redirectTo = (location.state as { from?: string } | null)?.from ?? ROUTES.dashboard.root;

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null);
    try {
      await login(values);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const message = err && typeof err === 'object' && 'message' in err ? String(err.message) : null;
      setFormError(message ?? 'Unable to sign in. Check your credentials and try again.');
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Welcome back</h1>
      <p className="mt-1.5 text-sm text-foreground-muted">Sign in to continue to your dashboard.</p>

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

        <div>
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            leftIcon={<MdLock />}
            error={errors.password?.message}
            autoComplete="current-password"
            {...register('password')}
          />
          <Link
            to={ROUTES.auth.forgotPassword}
            className="mt-2 inline-block text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-foreground-muted">
        Don't have an account?{' '}
        <Link to={ROUTES.auth.register} className="font-medium text-primary-600 hover:text-primary-700">
          Create one
        </Link>
      </p>
    </div>
  );
}
