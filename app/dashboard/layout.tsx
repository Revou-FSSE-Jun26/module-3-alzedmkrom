import type { ReactNode } from 'react';
import DashboardLayoutClient from './layout-client';

// Server component wrapper for the dashboard layout.
// This allows us to export segment configuration while delegating
// the actual client-side auth logic to a child component.
//
// `instant = false` opts the whole /dashboard segment out of Next.js 16's
// instant-navigation validation. The dashboard is an auth-gated admin area:
// its client layout gate (layout-client.tsx) renders null until the role and
// token checks resolve in the browser, and each page fetches its data
// client-side. Those are deliberate — this segment cannot prerender an instant
// static shell and is allowed to block on navigation. Declaring that here (on
// the Server Component, since `instant` throws in a Client Component) clears
// the "dropped from rendering" insight without changing any behaviour.
export const instant = false;

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
