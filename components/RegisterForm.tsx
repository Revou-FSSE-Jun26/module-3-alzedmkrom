// components/RegisterForm.tsx
//
// The registration form. A Client Component, because every input is controlled,
// submission runs a validator in the browser, and success routes by role.
//
// The flow mirrors the shared form pattern used across the app (see
// AddProductForm): values held in a typed FormState, a pure validate() that
// returns a FormErrors map, preventDefault() first on submit, per-field messages
// rendered beneath their own input and wired with aria-describedby and
// aria-invalid, entered values preserved on failure, and the submit control
// disabled while the request is in flight.
//
// Registration itself is delegated to useAuth().register, which POSTs to
// /register and then chains into login to obtain a session (POST /register
// returns only the user object, no token). It resolves with the signed-in user,
// so this form routes by role: ADMIN to /dashboard, CUSTOMER to /. On failure
// the API's message is surfaced and the entered values are left untouched.

'use client';

import {
  useId,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/hooks/useAuth';
import type { FormErrors, RegisterFormState } from '@/lib/types';

// A deliberately simple address shape: a run of non-space, non-@ characters,
// an @, more of the same, a dot, and a final run. It rejects the obvious
// malformations (empty, missing @, missing domain) without pretending to be a
// full RFC 5322 validator — the server is the authority and its message wins.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Matches the API's documented minimum. Kept as a named constant so the rule
// and the message that explains it cannot drift apart.
const MIN_PASSWORD_LENGTH = 8;

const EMPTY_FORM: RegisterFormState = {
  username: '',
  email: '',
  password: '',
};

// Per-field validation. Returns a FormErrors map; an empty object means valid.
// The three rules match the design: username non-empty, email a basic address
// shape, password at least the API's 8-character minimum.
export function validate(
  data: RegisterFormState,
): FormErrors<RegisterFormState> {
  const errors: FormErrors<RegisterFormState> = {};

  if (!data.username.trim()) {
    errors.username = 'Username is required.';
  }

  if (!data.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_RE.test(data.email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!data.password) {
    errors.password = 'Password is required.';
  } else if (data.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }

  return errors;
}

export default function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();

  // Controlled values, held as strings and preserved across a failed submit so
  // the user never loses what they typed.
  const [values, setValues] = useState<RegisterFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors<RegisterFormState>>({});
  // A form-level message for a failed request (e.g. a duplicate email). Field
  // errors live in `errors`; this is for the API's own refusal.
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Stable, collision-free ids for wiring each message to its input, even if
  // the form were ever rendered more than once on a page.
  const fieldId = useId();
  const errorId = (field: keyof RegisterFormState) =>
    `${fieldId}-${field}-error`;
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
      // register resolves with the signed-in user, so route by role.
      const user = await register(
        values.username.trim(),
        values.email.trim(),
        values.password,
      );
      router.push(user.role === 'ADMIN' ? '/dashboard' : '/');
    } catch (error) {
      // Surface the API's own message (duplicate email, etc.) and keep every
      // entered value in place for a retry.
      setFormError(
        error instanceof Error
          ? error.message
          : 'Could not create your account. Please try again.',
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
        Create account
      </h1>

      {/* Username */}
      <div className="flex flex-col gap-1">
        <label htmlFor={`${fieldId}-username`} className={labelClasses}>
          Username
        </label>
        <input
          id={`${fieldId}-username`}
          name="username"
          type="text"
          autoComplete="username"
          value={values.username}
          onChange={handleChange}
          aria-invalid={errors.username ? true : undefined}
          aria-describedby={errors.username ? errorId('username') : undefined}
          className={inputClasses}
        />
        {errors.username && (
          <p id={errorId('username')} role="alert" className={errorClasses}>
            {errors.username}
          </p>
        )}
      </div>

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
          autoComplete="new-password"
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
        {submitting ? 'Creating…' : 'Register'}
      </button>
    </form>
  );
}
