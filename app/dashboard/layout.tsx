import type { ReactNode } from 'react';
import DashboardLayoutClient from './layout-client';

// Server component wrapper for the dashboard layout.
// This allows us to export segment configuration while delegating
// the actual client-side auth logic to a child component.
export const instant = false;

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
