import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { MdBadge, MdEmail, MdLock } from 'react-icons/md';
import { Alert, Button, Input } from '@/components/ui';
import { useAuth } from '@/hooks';
import { ROUTES } from '@/constants';
import { registerSchema, type RegisterFormValues } from '@/utils/validation';

/** Account creation page, rendered inside AuthLayout. */
export function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '', agreeToTerms: false },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setFormError(null);
    try {
      await registerUser({ name: values.name, email: values.email, password: values.password });
      navigate(ROUTES.auth.verifyEmail, { replace: true });
    } catch (err) {
      const message = err && typeof err === 'object' && 'message' in err ? String(err.message) : null;
      setFormError(message ?? 'Unable to create your account. Please try again.');
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Create your account</h1>
      <p className="mt-1.5 text-sm text-foreground-muted">Start monitoring your farm with AgriSense AI.</p>

      {formError && (
        <Alert variant="error" className="mt-5" onClose={() => setFormError(null)}>
          {formError}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-4">
        <Input
          label="Full name"
          placeholder="Jane Farmer"
          leftIcon={<MdBadge />}
          error={errors.name?.message}
          autoComplete="name"
          {...register('name')}
        />

        <Input
          label="Email"
          type="email"
          placeholder="you@farm.com"
          leftIcon={<MdEmail />}
          error={errors.email?.message}
          autoComplete="email"
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          leftIcon={<MdLock />}
          error={errors.password?.message}
          autoComplete="new-password"
          {...register('password')}
        />

        <Input
          label="Confirm password"
          type="password"
          placeholder="Re-enter your password"
          leftIcon={<MdLock />}
          error={errors.confirmPassword?.message}
          autoComplete="new-password"
          {...register('confirmPassword')}
        />

        <div>
          <label className="flex items-start gap-2.5 text-sm text-foreground-muted">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-primary-600 focus-ring"
              {...register('agreeToTerms')}
            />
            <span>
              I agree to the{' '}
              <a href="#" className="font-medium text-primary-600 hover:text-primary-700">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="font-medium text-primary-600 hover:text-primary-700">
                Privacy Policy
              </a>
              .
            </span>
          </label>
          {errors.agreeToTerms && (
            <p role="alert" className="mt-1.5 text-xs font-medium text-danger">
              {errors.agreeToTerms.message}
            </p>
          )}
        </div>

        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-foreground-muted">
        Already have an account?{' '}
        <Link to={ROUTES.auth.login} className="font-medium text-primary-600 hover:text-primary-700">
          Sign in
        </Link>
      </p>
    </div>
  );
}
