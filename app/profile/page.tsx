'use client';

// app/profile/page.tsx
//
// The signed-in user's profile. Protected by useRequireRole() so only
// logged-in visitors can view it; anyone else is redirected to /login.
//
// There is no dedicated "get current user" endpoint in the API, so this page
// reads the user straight from the auth session (populated at login). That is
// enough for a read-only profile: username, email, role, account status, and
// the member-since date all live on the session's user object.

import Link from 'next/link';

import { useAuth } from '@/hooks/useAuth';
import { useRequireRole } from '@/hooks/useRequireRole';
import { formatDate } from '@/lib/format';

export default function ProfilePage() {
  const { ready } = useRequireRole();
  const { user } = useAuth();

  // Render nothing while authorization resolves, to avoid a flash of protected
  // content before any redirect.
  if (!ready || !user) {
    return null;
  }

  const initial = user.username.charAt(0).toUpperCase();

  return (
    <section className="mx-auto w-full max-w-3xl px-4 pt-6 pb-12 sm:px-6">
      <header className="mb-6 flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-black dark:text-white">
          My profile
        </h1>
        <p className="text-black/60 dark:text-white/60">
          Your account details.
        </p>
      </header>

      <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/15 dark:bg-white/5">
        {/* Identity header: avatar initial + name/email */}
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-black dark:text-white">
              {user.username}
            </p>
            <p className="truncate text-sm text-black/60 dark:text-white/60">
              {user.email}
            </p>
          </div>
        </div>

        {/* Detail rows */}
        <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
          <div className="flex justify-between gap-2 border-b border-black/5 py-2 dark:border-white/10">
            <dt className="text-sm text-black/60 dark:text-white/60">Username</dt>
            <dd className="text-sm font-medium text-black dark:text-white">
              {user.username}
            </dd>
          </div>
          <div className="flex justify-between gap-2 border-b border-black/5 py-2 dark:border-white/10">
            <dt className="text-sm text-black/60 dark:text-white/60">Email</dt>
            <dd className="truncate text-sm font-medium text-black dark:text-white">
              {user.email}
            </dd>
          </div>
          <div className="flex justify-between gap-2 border-b border-black/5 py-2 dark:border-white/10">
            <dt className="text-sm text-black/60 dark:text-white/60">Role</dt>
            <dd className="text-sm font-medium text-black dark:text-white">
              {user.role === 'ADMIN' ? 'Administrator' : 'Customer'}
            </dd>
          </div>
          <div className="flex justify-between gap-2 border-b border-black/5 py-2 dark:border-white/10">
            <dt className="text-sm text-black/60 dark:text-white/60">Status</dt>
            <dd className="text-sm font-medium">
              <span
                className={
                  user.isActive
                    ? 'rounded-full bg-green-500/15 px-2 py-0.5 text-green-700 dark:text-green-300'
                    : 'rounded-full bg-red-500/15 px-2 py-0.5 text-red-700 dark:text-red-300'
                }
              >
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </dd>
          </div>
          <div className="flex justify-between gap-2 border-b border-black/5 py-2 dark:border-white/10">
            <dt className="text-sm text-black/60 dark:text-white/60">
              Member since
            </dt>
            <dd className="text-sm font-medium text-black dark:text-white">
              {formatDate(user.createdAt)}
            </dd>
          </div>
        </dl>

        {/* Quick link to the user's orders */}
        <div className="mt-6">
          <Link
            href="/orders"
            className="inline-flex rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            View my orders
          </Link>
        </div>
      </div>
    </section>
  );
}
