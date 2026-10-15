'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FormErrors = {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export default function App() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function update(field : string, value : string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate(f: typeof form): FormErrors {
    const e: FormErrors = {};
    // TODO 1: fill in the four rules
    if (!f.username.trim()) e.username = 'Username is required';
    if (!EMAIL_RE.test(f.email)) e.email = 'Enter a valid email address';
    if (f.password.length > 64) e.password = 'Password must be no more than 64 characters';
    else if (f.password.length < 8) e.password = 'Password must be at least 8 characters';
    else if (!/[A-Za-z]/.test(f.password) || !/\d/.test(f.password)) {
      e.password = 'Password must include at least one letter and one number';
    }
    if (f.confirmPassword !== f.password) e.confirmPassword = 'Passwords do not match';
    return e;
  }

  async function handleSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setFormError('');

    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return; // stop — do not POST invalid data

    setSubmitting(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!apiBase) {
        throw new Error('NEXT_PUBLIC_API_BASE_URL is not configured.');
      }

      const res = await fetch(`${apiBase}/register`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      });
      const data: unknown = await res.json().catch(() => null);
      let responseMessage: string | undefined;
      if (data && typeof data === 'object') {
        const body = data as { error?: unknown; message?: unknown };
        if (typeof body.message === 'string') responseMessage = body.message;
        else if (typeof body.error === 'string') responseMessage = body.error;
      }

      if (res.ok) {
        localStorage.setItem('user', JSON.stringify(data));
        router.push('/');
      } else {
        setFormError(responseMessage || `Registration failed (${res.status}).`);
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not connect to the backend.');
    } finally {
      setSubmitting(false);
    }
  }

  const field = 'w-full border rounded px-3 py-2';
  const errText = 'text-sm text-red-600 mt-1 mb-2';

  return (
    <main className="font-sans p-6 bg-gray-50 min-h-screen">

      <form onSubmit={handleSubmit} className="max-w-sm bg-white border rounded-lg p-5 shadow-sm">
        <h2 className="font-semibold text-lg mb-3">Create account</h2>

        <label className="text-sm">Username</label>
        <input className={field} placeholder="Choose a username" value={form.username} onChange={(e) => update('username', e.target.value)} />
        {errors.username && <p className={errText}>{errors.username}</p>}

        <label className="text-sm">Email</label>
        <input type="email" className={field} placeholder="you@example.com" value={form.email} onChange={(e) => update('email', e.target.value)} />
        {errors.email && <p className={errText}>{errors.email}</p>}

        <label className="text-sm">Password</label>
        <div className="relative">
          <input type={showPassword ? 'text' : 'password'} className={`${field} password-field pr-14`} placeholder="At least 8 characters" value={form.password} onChange={(e) => update('password', e.target.value)} />
          <button type="button" className="absolute right-2 top-1/2 w-12 -translate-y-1/2 rounded px-1 py-1 text-sm text-gray-600 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)}>
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        {errors.password && <p className={errText}>{errors.password}</p>}

        <label className="text-sm">Confirm password</label>
        <div className="relative">
          <input type={showConfirmPassword ? 'text' : 'password'} className={`${field} password-field pr-14`} placeholder="Re-enter your password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} />
          <button type="button" className="absolute right-2 top-1/2 w-12 -translate-y-1/2 rounded px-1 py-1 text-sm text-gray-600 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2" aria-label={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'} aria-pressed={showConfirmPassword} onClick={() => setShowConfirmPassword((visible) => !visible)}>
            {showConfirmPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        {errors.confirmPassword && <p className={errText}>{errors.confirmPassword}</p>}

        {formError && <p className="mt-2 text-sm bg-red-50 text-red-700 border border-red-200 rounded px-3 py-2">{formError}</p>}

        <button type="submit" disabled={submitting} className="w-full mt-3 px-4 py-2 bg-gray-900 text-white rounded disabled:opacity-50">
          {submitting ? 'Creating…' : 'Register'}
        </button>
      </form>
    </main>
  );
}