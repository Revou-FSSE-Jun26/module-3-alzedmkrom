// app/orders/layout.tsx
//
// A thin Server Component layout that sets the tab title for the /orders route.
// The page is a Client Component and cannot export `metadata` itself.
//
// Note: the /orders/[id] detail route has its own layout that overrides this
// title, so this "My Orders" title applies only to the list page.

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = { title: 'My Orders' };

export default function OrdersLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
