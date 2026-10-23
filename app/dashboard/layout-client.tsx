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
import { useRequireRole } from '@/hooks/useRequireRole';

export default function DashboardLayoutClient({ children }: { children: ReactNode }) {
  const { ready } = useRequireRole('ADMIN');

  // Render nothing while authorization is being checked. This prevents a flash
  // of protected content before the redirect, satisfying Requirement 4.6.
  if (!ready) {
    return null;
  }

  return <>{children}</>;
}
