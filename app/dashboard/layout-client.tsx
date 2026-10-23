'use client';

// app/dashboard/layout-client.tsx
//
// Client component for dashboard auth gate. This handles the conditional
// rendering based on user role while the server layout exports the instant
// segment configuration.
//
// Admin gate for the entire dashboard segment. All routes under /dashboard
// (products, categories, orders) inherit this protection, so the guard only
// needs to be written once.
//
// This is a usability layer, not a security boundary. The API independently
// returns 403 `admin_required` for any non-admin token attempting a write.

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRequireRole } from '@/hooks/useRequireRole';
import { getProducts } from '@/lib/api';
import { toastError } from '@/lib/toast';

export default function DashboardLayoutClient({ children }: { children: ReactNode }) {
  const { ready } = useRequireRole('ADMIN');
  const { session } = useAuth();
  const [tokenValid, setTokenValid] = useState(true);
  const [checkingToken, setCheckingToken] = useState(true);

  // Validate the token by making a lightweight API call on mount.
  // This ensures all dashboard pages fail at the same time if the token expires,
  // rather than only /dashboard/orders catching the 401.
  useEffect(() => {
    let didCall = false;

    async function validateToken() {
      if (!session?.token) {
        setCheckingToken(false);
        return;
      }

      try {
        // Make a lightweight read call to verify the token is still valid.
        await getProducts({ limit: 1 });
        setTokenValid(true);
      } catch (error) {
        if (!didCall) {
          toastError(error);
          didCall = true;
        }
        setTokenValid(false);
      } finally {
        setCheckingToken(false);
      }
    }

    validateToken();
  }, [session?.token]);

  // Render nothing while authorization is being checked. This prevents a flash
  // of protected content before the redirect, satisfying Requirement 4.6.
  if (!ready || checkingToken) {
    return null;
  }

  // If token validation failed, show the error.
  if (!tokenValid) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
          Your session has expired. Please log in again.
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
