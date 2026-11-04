// app/orders/[id]/layout.tsx
//
// A thin Server Component layout that sets the tab title for the order detail
// route (/orders/[id]). The page is a Client Component and cannot export
// `metadata`. This deeper layout's title overrides the "My Orders" title set
// by the parent app/orders/layout.tsx.

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = { title: 'Order Details' };

export default function OrderDetailLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
