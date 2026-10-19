// components/LoginForm.tsx
//
// The login form. A Client Component, mirroring RegisterForm's shape exactly:
// values held in a typed FormState, a pure validate() returning a FormErrors
// map, preventDefault() first on submit, per-field messages beneath their own
// input and wired with aria-describedby and aria-invalid, entered values
// preserved on failure, and the submit control disabled while in flight.
//
// Login validation only checks that both fields are non-empty. Unlike
// registration it does NOT re-check email format or password length: login must
// accept whatever the account was created with, and the API is the sole
// authority on whether the credentials are correct. A client-side format rule
// here could reject a legitimate login the server would have accepted, so the
// only client rule is the both-non-empty gate from Requirement 2.1.
//
// Authentication is delegated to useAuth().login, which resolves with the
// signed-in user so this form routes by role: ADMIN to /dashboard, CUSTOMER to
// /. On invalid credentials the API's own message is rendered inline, NO
// redirect fires, and the entered values are preserved for a retry.

'use client';

import {
  useId,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/hooks/useAuth';
import type { FormErrors, LoginFormState } from '@/lib/types';

const EMPTY_FORM: LoginFormState = {
  email: '',
  password: '',
};

// Per-field validation. Returns a FormErrors map; an empty object means valid.
// Both fields must be non-empty — nothing more. The API validates the actual
// credentials and its message wins, so no email-format or length check lives here.
export function validate(data: LoginFormState): FormErrors<LoginFormState> {
  const errors: FormErrors<LoginFormState> = {};

  if (!data.email.trim()) {
    errors.email = 'Email is required.';
  }

  if (!data.password) {
    errors.password = 'Password is required.';
  }

  return errors;
}

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  // Controlled values, held as strings and preserved across a failed submit so
  // the user never loses what they typed.
  const [values, setValues] = useState<LoginFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors<LoginFormState>>({});
  // A form-level message for a failed request (e.g. wrong password). Field
  // errors live in `errors`; this is for the API's own refusal.
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Stable, collision-free ids for wiring each message to its input.
  const fieldId = useId();
  const errorId = (field: keyof LoginFormState) => `${fieldId}-${field}-error`;
  const formErrorId = `${fieldId}-form-error`;

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    // preventDefault first, so a failed validation never triggers a full-page
    // submit and the entered values survive.
    event.preventDefault();
    setFormError(null);

    const nextErrors = validate(values);
    setErrors(nextErrors);

    // Submit only when validate() returned no keys.
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      // login resolves with the signed-in user, so route by role.
      const user = await login(values.email.trim(), values.password);
      router.push(user.role === 'ADMIN' ? '/dashboard' : '/');
    } catch (error) {
      // Invalid credentials: surface the API's own message inline, perform NO
      // redirect, and leave every entered value in place for a retry.
      setFormError(
        error instanceof Error
          ? error.message
          : 'Could not sign you in. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  const inputClasses =
    'w-full rounded-md border border-black/15 bg-white px-3 py-2 text-sm text-black placeholder:text-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 dark:border-white/20 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40';
  const labelClasses = 'text-sm font-medium text-black dark:text-white';
  const errorClasses = 'text-sm text-red-600 dark:text-red-400';

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      aria-describedby={formError ? formErrorId : undefined}
      className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/15 dark:bg-white/5"
    >
      <h1 className="text-lg font-semibold text-black dark:text-white">
        Log in
      </h1>

      {/* Email */}
      <div className="flex flex-col gap-1">
        <label htmlFor={`${fieldId}-email`} className={labelClasses}>
          Email
        </label>
        <input
          id={`${fieldId}-email`}
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={handleChange}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? errorId('email') : undefined}
          className={inputClasses}
        />
        {errors.email && (
          <p id={errorId('email')} role="alert" className={errorClasses}>
            {errors.email}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1">
        <label htmlFor={`${fieldId}-password`} className={labelClasses}>
          Password
        </label>
        <input
          id={`${fieldId}-password`}
          name="password"
          type="password"
          autoComplete="current-password"
          value={values.password}
          onChange={handleChange}
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={errors.password ? errorId('password') : undefined}
          className={inputClasses}
        />
        {errors.password && (
          <p id={errorId('password')} role="alert" className={errorClasses}>
            {errors.password}
          </p>
        )}
      </div>

      {formError && (
        <p
          id={formErrorId}
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300"
        >
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
