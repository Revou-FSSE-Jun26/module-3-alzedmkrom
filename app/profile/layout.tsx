// app/profile/layout.tsx
//
// A thin Server Component layout that sets the tab title for /profile, since
// the page is a Client Component and cannot export `metadata` itself.

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = { title: 'My Profile' };

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
