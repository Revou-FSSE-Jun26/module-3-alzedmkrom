// hooks/useRedirectIfAuthenticated.ts
//
// The reverse of a route guard: it pushes an already-logged-in visitor OFF the
// auth pages (/login, /register) rather than keeping an unauthorised visitor
// out of a protected one. Both auth routes share this one hook so the "you are
// already signed in" behaviour cannot drift between them.
//
// Two decisions matter here:
//
//   1. WHILE isLoading, do nothing. The session is read from localStorage after
//      hydration (see AuthContext), so on the first client tick `user` is null
//      even for a logged-in visitor. Redirecting during that tick would bounce
//      a signed-in user off a page they are allowed to leave on their own, and
//      acting on the not-yet-resolved value risks a flash. We wait for the read
//      to settle, then decide once.
//   2. Use router.replace, not push. The visitor should not be able to press
//      Back and land on the auth page they were just redirected away from; a
//      replace swaps the history entry instead of stacking a new one.
//
// Role routing matches login/registration exactly: ADMIN to /dashboard,
// everyone else to /. The hook returns `checking` so the caller can render the
// form only once it is certain the visitor is NOT logged in, avoiding a brief
// flash of the form before the redirect fires.

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/hooks/useAuth';

export interface RedirectIfAuthenticatedState {
  /**
   * True while it is not yet safe to render the auth form: either the session
   * read is still in flight, or a logged-in visitor is about to be redirected.
   * False only once we are certain no user is logged in.
   */
  checking: boolean;
}

export function useRedirectIfAuthenticated(): RedirectIfAuthenticatedState {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Wait for the localStorage read to resolve before deciding, so a logged-in
    // visitor is never bounced on the first client tick when `user` is still null.
    if (isLoading) return;
    if (user === null) return;

    // Already signed in: send them to their role's home and replace the history
    // entry so Back does not return to this auth page.
    router.replace(user.role === 'ADMIN' ? '/dashboard' : '/');
  }, [isLoading, user, router]);

  // Still checking while the read is in flight, or while a redirect for a
  // logged-in visitor is pending. Only a resolved, logged-out visitor is "done".
  return { checking: isLoading || user !== null };
}
