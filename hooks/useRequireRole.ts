'use client';

// hooks/useRequireRole.ts
//
// A route guard that redirects unauthorized visitors and prevents showing
// protected content before authorization completes.
//
// Calling this hook with no role requirement gates on any logged-in user.
// Calling with 'ADMIN' gates on admin role specifically.
//
// Important: this is a usability layer, not a security boundary. The API
// independently enforces permissions and returns 403 for unauthorized write
// attempts. A user who bypasses this client-side redirect still cannot perform
// an admin action on the server.

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from './useAuth';
import type { Role } from '@/lib/types';

interface UseRequireRoleResult {
  /**
   * True only when authorization is resolved and the user is allowed.
   * Use this to gate rendering of protected content: no flash occurs because
   * nothing renders until ready is true.
   */
  ready: boolean;
}

/**
 * Protects a route by role and returns a flag to gate rendering.
 *
 * While isLoading is true, neither redirects nor reports ready, so a
 * logged-in user is never bounced during the storage read.
 *
 * When ready, the user is authenticated and either:
 *   - has the required role (if specified), or
 *   - is any logged-in user (if role is omitted).
 */
export function useRequireRole(requiredRole?: Role): UseRequireRoleResult {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // While loading, do nothing. The user might be logged in but we haven't
    // read the session from storage yet.
    if (isLoading) return;

    // Logged-out user: redirect to login.
    if (!user) {
      router.push('/login');
      return;
    }

    // User is logged in but role mismatch: redirect to home.
    if (requiredRole && user.role !== requiredRole) {
      router.push('/');
      return;
    }

    // Authorization passed.
  }, [isLoading, user, requiredRole, router]);

  // Ready only when loading is done AND the user is authorized.
  const ready =
    !isLoading && !!user && (!requiredRole || user.role === requiredRole);

  return { ready };
}
